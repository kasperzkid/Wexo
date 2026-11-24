import { BN, Program } from '@anchor-lang/core';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import idl from '../idl/taskvault.json';
import type { Taskvault } from '../idl/taskvault';
import { CONFIG } from '../config/solana';
import { solanaService } from './solanaService';
import { Task, TaskCategory, TaskStatus } from '../types';

export interface OnChainTaskAccounts {
  taskPda: PublicKey;
  taskBump: number;
  escrowPda: PublicKey;
  escrowBump: number;
}

type DecodedTask = Awaited<ReturnType<Program<Taskvault>['account']['task']['all']>>[number]['account'];

const taskCategories: TaskCategory[] = [
  'Solana Dev', 'Smart Contracts', 'UI/UX Design', 'Security Audit', 'Content & Docs', 'Full Stack',
];

const taskStatuses: Record<string, TaskStatus | undefined> = {
  created: undefined,
  funded: 'open',
  claimed: 'in_progress',
  submitted: 'under_review',
  approved: 'completed',
  cancelled: 'cancelled',
};

function statusName(status: DecodedTask['status']): string {
  return Object.keys(status)[0]?.toLowerCase() ?? '';
}

function safeNumber(value: BN): number {
  const n = value.toNumber();
  if (!Number.isSafeInteger(n)) throw new Error('On-chain integer exceeds the safe display range.');
  return n;
}

export class TaskVaultProgramService {
  private readonly programId = CONFIG.programId;

  private get program(): Program<Taskvault> {
    const connection = solanaService.getConnection();
    if (!/devnet/i.test(connection.rpcEndpoint)) {
      throw new Error('TaskVault is configured for Solana Devnet only.');
    }
    return new Program(idl as Taskvault, { connection });
  }

  private async transaction(payer: PublicKey, instruction: import('@solana/web3.js').TransactionInstruction): Promise<Transaction> {
    const connection = solanaService.getConnection();
    const latest = await connection.getLatestBlockhash('confirmed');
    return new Transaction({
      feePayer: payer,
      recentBlockhash: latest.blockhash,
    }).add(instruction);
  }

  /** Derive the task PDA using the same seeds declared in the deployed Anchor IDL. */
  public deriveTaskPda(creator: PublicKey, taskId: number): [PublicKey, number] {
    if (!Number.isSafeInteger(taskId) || taskId < 0) throw new Error('Task ID must be a safe non-negative integer.');
    const taskIdBuffer = Buffer.alloc(8);
    taskIdBuffer.writeBigUInt64LE(BigInt(taskId));
    return PublicKey.findProgramAddressSync([Buffer.from('task'), creator.toBuffer(), taskIdBuffer], this.programId);
  }

  /** Derive the escrow PDA using the seeds declared in the deployed Anchor IDL. */
  public deriveEscrowPda(taskPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from('escrow'), taskPda.toBuffer()], this.programId);
  }

  /** Validate listing data against Anchor-decoded on-chain state before claiming. */
  public async assertTaskClaimable(taskPda: PublicKey, creator: PublicKey, taskId: number, worker: PublicKey): Promise<void> {
    const program = this.program;
    const task = await program.account.task.fetchNullable(taskPda, 'confirmed');
    if (!task) throw new Error('This bounty is not published on Solana Devnet and cannot be claimed.');
    if (!task.creator.equals(creator)) throw new Error('The on-chain bounty account does not match this listing. Refresh and try another bounty.');
    if (safeNumber(task.taskId) !== taskId) throw new Error('The on-chain bounty ID does not match this listing. Refresh and try again.');
    if (statusName(task.status) !== 'funded') throw new Error('This bounty is not funded and open for claims on Solana Devnet.');
    if (safeNumber(task.deadline) <= Math.floor(Date.now() / 1000)) throw new Error('This bounty has passed its on-chain deadline and cannot be claimed.');
    if (worker.equals(creator)) throw new Error('You cannot claim a bounty created by your connected wallet.');

    const [escrowPda] = this.deriveEscrowPda(taskPda);
    const escrow = await program.account.escrow.fetchNullable(escrowPda, 'confirmed');
    if (!escrow?.task.equals(taskPda)) throw new Error('The on-chain escrow is missing or does not belong to this bounty.');
    const balance = await solanaService.getConnection().getBalance(escrowPda, 'confirmed');
    if (balance < safeNumber(task.rewardLamports)) throw new Error('This bounty escrow is not fully funded.');
  }

  public async isProgramDeployed(): Promise<boolean> {
    const connection = solanaService.getConnection();
    if (!/devnet/i.test(connection.rpcEndpoint)) {
      throw new Error('The configured Solana RPC is not Devnet. Switch the app back to Devnet before creating a bounty.');
    }

    // Do not convert RPC/network errors into "not deployed". The program has
    // already been verified on Devnet; distinguish an unavailable RPC from a
    // genuinely missing or invalid program account.
    let info;
    try {
      info = await connection.getAccountInfo(this.programId, 'confirmed');
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not verify TaskVault on Devnet. Check your connection and retry. (${detail})`);
    }
    if (!info) return false;
    if (!info.executable || !info.owner.equals(new PublicKey('BPFLoaderUpgradeab1e11111111111111111111'))) {
      throw new Error('The configured TaskVault address exists on Devnet but is not an executable upgradeable program.');
    }
    return true;
  }

  /** Fetch and decode Task accounts with the generated Anchor IDL client. */
  public async fetchDevnetTasks(localTasks: Task[] = []): Promise<Task[]> {
    const connection = solanaService.getConnection();
    if (!/devnet/i.test(connection.rpcEndpoint)) throw new Error('TaskVault marketplace is configured for Solana Devnet only.');

    const program = this.program;
    const accounts = await program.account.task.all();
    const metadataByAddressAndId = new Map(localTasks.map((task) => [`${task.creatorAddress}:${task.onChainId}`, task]));
    const decoded = accounts.flatMap(({ publicKey, account }) => {
      try {
        const status = taskStatuses[statusName(account.status)];
        const onChainId = safeNumber(account.taskId);
        const rewardLamports = safeNumber(account.rewardLamports);
        const deadlineUnix = safeNumber(account.deadline);
        if (!status || !Number.isSafeInteger(onChainId) || !account.title.trim()) return [];

        const creatorAddress = account.creator.toBase58();
        const workerAddress = account.worker?.toBase58();
        const metadata = metadataByAddressAndId.get(`${creatorAddress}:${onChainId}`);
        const id = metadata?.id ?? `devnet-${publicKey.toBase58()}`;
        let submission: Task['submission'];
        if (account.submissionData) {
          try {
            const raw = JSON.parse(account.submissionData) as Record<string, unknown>;
            const parsed = {
              pullRequestUrl: (raw.pullRequestUrl ?? raw.p) as string | undefined,
              liveDemoUrl: (raw.liveDemoUrl ?? raw.d) as string | undefined,
              deliverableNotes: String(raw.deliverableNotes ?? raw.n ?? ''),
              proofAttachmentHash: (raw.proofAttachmentHash ?? raw.h) as string | undefined,
            };
            submission = {
              ...parsed,
              id: `submission-${onChainId}`,
              taskId: id,
              workerAddress: workerAddress ?? '',
              submittedAt: safeNumber(account.submittedAt) > 0 ? new Date(safeNumber(account.submittedAt) * 1000).toISOString() : new Date().toISOString(),
              status: 'pending',
            };
          } catch { /* Treat malformed submission payloads as unavailable metadata. */ }
        }
        const timestampFromId = onChainId >= 1_000_000_000_000 && onChainId <= 9_999_999_999_999
          ? new Date(onChainId).toISOString() : undefined;
        const [escrowPda] = this.deriveEscrowPda(publicKey);
        const task: Task = {
          id,
          onChainId,
          title: account.title,
          description: metadata?.description ?? 'This Devnet task is verified on-chain. Its full brief is not stored in the TaskVault account; confirm the scope with the creator before claiming.',
          category: taskCategories[account.category] ?? 'Solana Dev',
          rewardSol: rewardLamports / LAMPORTS_PER_SOL,
          rewardLamports,
          creatorAddress,
          workerAddress,
          status,
          createdAt: metadata?.createdAt ?? timestampFromId,
          deadline: new Date(deadlineUnix * 1000).toISOString(),
          completedAt: safeNumber(account.completedAt) > 0 ? new Date(safeNumber(account.completedAt) * 1000).toISOString() : undefined,
          submissionInstructions: metadata?.submissionInstructions,
          tags: metadata?.tags ?? [],
          submission,
          history: metadata?.history ?? [],
          escrowPda: escrowPda.toBase58(),
          creationTxHash: metadata?.creationTxHash,
        };
        return [{ task, publicKey, escrowPda }];
      } catch (error) {
        console.warn('Skipping invalid TaskVault account:', publicKey.toBase58(), error);
        return [];
      }
    });

    const active = decoded.filter(({ task }) => task.status !== 'completed' && task.status !== 'cancelled');
    const escrowInfos = active.length
      ? await connection.getMultipleAccountsInfo(active.map(({ escrowPda }) => escrowPda), 'confirmed')
      : [];
    const escrowBalances = new Map(active.map(({ escrowPda }, index) => [escrowPda.toBase58(), escrowInfos[index]?.lamports ?? 0]));
    return decoded
      .filter(({ task, escrowPda }) => task.status === 'completed' || task.status === 'cancelled' || (escrowBalances.get(escrowPda.toBase58()) ?? 0) >= task.rewardLamports)
      .map(({ task }) => task)
      .sort((a, b) => (b.createdAt ? Date.parse(b.createdAt) : b.onChainId) - (a.createdAt ? Date.parse(a.createdAt) : a.onChainId));
  }

  public async buildCreateTaskTransaction(creator: PublicKey, taskId: number, rewardLamports: number, deadlineUnix: number, category: number, title: string, specHash: Uint8Array = new Uint8Array(32)): Promise<{ transaction: Transaction; taskPda: PublicKey }> {
    if (!Number.isSafeInteger(rewardLamports) || rewardLamports <= 0) throw new Error('Reward must be a positive safe integer in lamports.');
    if (specHash.length !== 32) throw new Error('Task specification hash must be exactly 32 bytes.');
    const [taskPda] = this.deriveTaskPda(creator, taskId);
    const instruction = await this.program.methods
      .createTask(new BN(taskId), new BN(rewardLamports), new BN(deadlineUnix), category, title, Array.from(specHash))
      .accounts({ creator, task: taskPda, systemProgram: SystemProgram.programId } as never)
      .instruction();
    return { transaction: await this.transaction(creator, instruction), taskPda };
  }

  public async buildFundTaskTransaction(creator: PublicKey, taskPda: PublicKey): Promise<{ transaction: Transaction; escrowPda: PublicKey }> {
    const [escrowPda] = this.deriveEscrowPda(taskPda);
    const instruction = await this.program.methods.fundTask()
      .accounts({ creator, task: taskPda, escrow: escrowPda, systemProgram: SystemProgram.programId } as never).instruction();
    return { transaction: await this.transaction(creator, instruction), escrowPda };
  }

  public async buildClaimTaskTransaction(worker: PublicKey, taskPda: PublicKey): Promise<Transaction> {
    const instruction = await this.program.methods.claimTask().accounts({ worker, task: taskPda } as never).instruction();
    return this.transaction(worker, instruction);
  }

  public async buildSubmitWorkTransaction(worker: PublicKey, taskPda: PublicKey, submissionData: string): Promise<Transaction> {
    const instruction = await this.program.methods.submitWork(submissionData).accounts({ worker, task: taskPda } as never).instruction();
    return this.transaction(worker, instruction);
  }

  public async buildApproveWorkTransaction(creator: PublicKey, worker: PublicKey, taskPda: PublicKey): Promise<Transaction> {
    const [escrowPda] = this.deriveEscrowPda(taskPda);
    const instruction = await this.program.methods.approveWork()
      .accounts({ creator, worker, task: taskPda, escrow: escrowPda, systemProgram: SystemProgram.programId } as never).instruction();
    return this.transaction(creator, instruction);
  }

  public async buildCancelTaskTransaction(creator: PublicKey, taskPda: PublicKey): Promise<Transaction> {
    const [escrowPda] = this.deriveEscrowPda(taskPda);
    const instruction = await this.program.methods.cancelTask()
      .accounts({ creator, task: taskPda, escrow: escrowPda, systemProgram: SystemProgram.programId } as never).instruction();
    return this.transaction(creator, instruction);
  }
}

export const programService = new TaskVaultProgramService();
