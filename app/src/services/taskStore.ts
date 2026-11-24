import { Task, TaskCategory, TaskStatus, TransactionRecord, DashboardMetrics } from '../types';

const TASKS_STORAGE_KEY = 'taskvault_tasks_v1';
const TXS_STORAGE_KEY = 'taskvault_transactions_v1';
const LEGACY_SAMPLE_IDS = new Set(['task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6']);

class TaskStore {
  private tasks: Task[] = [];
  private transactions: TransactionRecord[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        this.tasks = (JSON.parse(storedTasks) as Task[]).filter(
          (task) => !LEGACY_SAMPLE_IDS.has(task.id) && (!!task.creationTxHash || task.id.startsWith('devnet-') || !!task.escrowPda)
        );
        this.saveTasks();
      } else {
        this.tasks = [];
        this.saveTasks();
      }

      const storedTxs = localStorage.getItem(TXS_STORAGE_KEY);
      if (storedTxs) {
        const savedTransactions = JSON.parse(storedTxs) as TransactionRecord[];
        this.transactions = savedTransactions.filter(
          (tx) => tx.id !== 'tx-init-1' && tx.id !== 'tx-init-2' && (!tx.taskId || !LEGACY_SAMPLE_IDS.has(tx.taskId))
        );
        if (this.transactions.length !== savedTransactions.length) this.saveTransactions();
      } else {
        this.transactions = [];
        this.saveTransactions();
      }

      this.syncTransactionsFromTasks();
    } catch {
      this.tasks = [];
      this.transactions = [];
    }
  }

  private saveTasks() {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (e) {
      console.warn('Could not save tasks to local storage:', e);
    }
  }

  private saveTransactions() {
    try {
      localStorage.setItem(TXS_STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (e) {
      console.warn('Could not save txs to local storage:', e);
    }
  }

  public getTasks(): Task[] {
    return [...this.tasks];
  }

  public replaceTasksFromDevnet(tasks: Task[]): void {
    this.tasks = [...tasks];
    this.saveTasks();
    this.syncTransactionsFromTasks();
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  public getTransactions(userAddress?: string): TransactionRecord[] {
    const list = !userAddress
      ? [...this.transactions]
      : this.transactions.filter(
          (tx) => tx.fromAddress === userAddress || tx.toAddress === userAddress
        );
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public syncTransactionsFromTasks(): void {
    const existingTxTaskIds = new Set(
      this.transactions
        .filter((tx) => tx.type === 'create_task' || tx.type === 'fund_task')
        .map((tx) => tx.taskId || tx.taskTitle)
    );

    let added = false;
    for (const task of this.tasks) {
      const identifier = task.id || task.title;
      if (!existingTxTaskIds.has(identifier)) {
        const txHash = task.creationTxHash || task.history?.find((h) => !!h.txHash)?.txHash || '';
        const timestamp =
          task.createdAt ||
          (task.onChainId >= 1_000_000_000_000 && task.onChainId <= 9_999_999_999_999
            ? new Date(task.onChainId).toISOString()
            : new Date().toISOString());

        this.transactions.push({
          id: `tx-task-${task.id}`,
          txHash,
          type: 'create_task',
          taskId: task.id,
          taskTitle: task.title,
          amountSol: task.rewardSol,
          status: 'confirmed',
          timestamp,
          fromAddress: task.creatorAddress,
          toAddress: task.escrowPda,
        });
        existingTxTaskIds.add(identifier);
        added = true;

        if (
          task.workerAddress &&
          (task.status === 'in_progress' || task.status === 'under_review' || task.status === 'completed')
        ) {
          const claimTx = task.history?.find((h) => h.type === 'claimed');
          this.transactions.push({
            id: `tx-claim-${task.id}`,
            txHash: claimTx?.txHash || '',
            type: 'claim_task',
            taskId: task.id,
            taskTitle: task.title,
            status: 'confirmed',
            timestamp: claimTx?.timestamp || timestamp,
            fromAddress: task.workerAddress,
            toAddress: task.creatorAddress,
          });
        }

        if (task.status === 'under_review' || (task.status === 'completed' && task.submission)) {
          const submitTx = task.history?.find((h) => h.type === 'work_submitted');
          this.transactions.push({
            id: `tx-submit-${task.id}`,
            txHash: submitTx?.txHash || '',
            type: 'submit_work',
            taskId: task.id,
            taskTitle: task.title,
            status: 'confirmed',
            timestamp: task.submission?.submittedAt || submitTx?.timestamp || timestamp,
            fromAddress: task.workerAddress || '',
          });
        }

        if (task.status === 'completed') {
          const approveTx = task.history?.find((h) => h.type === 'approved');
          this.transactions.push({
            id: `tx-approve-${task.id}`,
            txHash: approveTx?.txHash || '',
            type: 'approve_work',
            taskId: task.id,
            taskTitle: task.title,
            amountSol: task.rewardSol,
            status: 'confirmed',
            timestamp: task.completedAt || approveTx?.timestamp || timestamp,
            fromAddress: task.creatorAddress,
            toAddress: task.workerAddress,
          });
        }

        if (task.status === 'cancelled') {
          const cancelTx = task.history?.find((h) => h.type === 'cancelled');
          this.transactions.push({
            id: `tx-cancel-${task.id}`,
            txHash: cancelTx?.txHash || '',
            type: 'cancel_task',
            taskId: task.id,
            taskTitle: task.title,
            amountSol: task.rewardSol,
            status: 'confirmed',
            timestamp: cancelTx?.timestamp || timestamp,
            fromAddress: task.escrowPda || task.creatorAddress,
            toAddress: task.creatorAddress,
          });
        }
      }
    }

    if (added) {
      this.transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.saveTransactions();
    }
  }

  public recordTransaction(tx: Omit<TransactionRecord, 'id'>): TransactionRecord {
    const record: TransactionRecord = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.transactions.unshift(record);
    this.saveTransactions();
    return record;
  }

  public createTask(params: {
    title: string;
    description: string;
    category: TaskCategory;
    rewardSol: number;
    creatorAddress: string;
    deadline: string;
    submissionInstructions?: string;
    tags: string[];
    txHash: string;
    escrowPda: string;
    onChainId: number;
  }): Task {
    const onChainId = params.onChainId;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      onChainId,
      title: params.title,
      description: params.description,
      category: params.category,
      rewardSol: params.rewardSol,
      rewardLamports: Math.round(params.rewardSol * 1_000_000_000),
      creatorAddress: params.creatorAddress,
      status: 'open',
      createdAt: new Date().toISOString(),
      deadline: params.deadline,
      submissionInstructions: params.submissionInstructions,
      tags: params.tags,
      escrowPda: params.escrowPda,
      creationTxHash: params.txHash,
      history: [
        {
          id: `hist-${Date.now()}-1`,
          type: 'created',
          actorAddress: params.creatorAddress,
          timestamp: new Date().toISOString(),
          txHash: params.txHash,
          amountSol: params.rewardSol,
          note: 'Task created on Solana Devnet',
        },
        {
          id: `hist-${Date.now()}-2`,
          type: 'funded' as const,
          actorAddress: params.creatorAddress,
          timestamp: new Date().toISOString(),
          txHash: params.txHash,
          amountSol: params.rewardSol,
          note: `Deposited ${params.rewardSol} SOL into Escrow PDA`,
        },
      ],
    };

    this.tasks.unshift(newTask);
    this.saveTasks();

    this.recordTransaction({
      txHash: params.txHash,
      type: 'create_task',
      taskId: newTask.id,
      taskTitle: newTask.title,
      amountSol: params.rewardSol,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      fromAddress: params.creatorAddress,
      toAddress: newTask.escrowPda,
    });

    return newTask;
  }

  public claimTask(taskId: string, workerAddress: string, txHash: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'open') throw new Error('Task is not open to be claimed');
    if (task.creatorAddress === workerAddress) {
      throw new Error('Creator cannot claim their own task');
    }

    task.workerAddress = workerAddress;
    task.status = 'in_progress';
    task.history.push({
      id: `hist-${Date.now()}`,
      type: 'claimed',
      actorAddress: workerAddress,
      timestamp: new Date().toISOString(),
      txHash,
      note: 'Task claimed on Solana Devnet',
    });

    this.saveTasks();

    this.recordTransaction({
      txHash,
      type: 'claim_task',
      taskId: task.id,
      taskTitle: task.title,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      fromAddress: workerAddress,
    });

    return task;
  }

  public submitWork(
    taskId: string,
    workerAddress: string,
    submission: {
      pullRequestUrl?: string;
      liveDemoUrl?: string;
      deliverableNotes: string;
      proofAttachmentHash?: string;
    },
    txHash: string
  ): Task {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'in_progress') throw new Error('Task is not in progress');
    if (task.workerAddress !== workerAddress) {
      throw new Error('Only the assigned contributor can submit work');
    }

    task.status = 'under_review';
    task.submission = {
      id: `sub-${Date.now()}`,
      taskId,
      workerAddress,
      submittedAt: new Date().toISOString(),
      pullRequestUrl: submission.pullRequestUrl,
      liveDemoUrl: submission.liveDemoUrl,
      deliverableNotes: submission.deliverableNotes,
      proofAttachmentHash: submission.proofAttachmentHash,
      status: 'pending',
    };

    task.history.push({
      id: `hist-${Date.now()}`,
      type: 'work_submitted',
      actorAddress: workerAddress,
      timestamp: new Date().toISOString(),
      txHash,
      note: 'Deliverables submitted on Solana Devnet',
    });

    this.saveTasks();

    this.recordTransaction({
      txHash,
      type: 'submit_work',
      taskId: task.id,
      taskTitle: task.title,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      fromAddress: workerAddress,
    });

    return task;
  }

  public approveWork(taskId: string, creatorAddress: string, txHash: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'under_review') throw new Error('Task is not under review');
    if (task.creatorAddress !== creatorAddress) {
      throw new Error('Only the creator can approve submitted work');
    }

    const now = new Date().toISOString();
    task.status = 'completed';
    task.completedAt = now;
    if (task.submission) {
      task.submission.status = 'approved';
    }

    task.history.push({
      id: `hist-${Date.now()}`,
      type: 'approved',
      actorAddress: creatorAddress,
      timestamp: now,
      txHash,
      amountSol: task.rewardSol,
      note: `Work approved. Escrow released ${task.rewardSol} SOL to worker`,
    });

    this.saveTasks();

    if (task.workerAddress) this.recordTransaction({
      txHash,
      type: 'approve_work',
      taskId: task.id,
      taskTitle: task.title,
      amountSol: task.rewardSol,
      status: 'confirmed',
      timestamp: now,
      fromAddress: creatorAddress,
      toAddress: task.workerAddress,
    });

    return task;
  }

  public cancelTask(taskId: string, creatorAddress: string, txHash: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.creatorAddress !== creatorAddress) {
      throw new Error('Only the creator can cancel this task');
    }
    if (task.status !== 'open' && task.status !== 'in_progress') {
      throw new Error('Cannot cancel a task that is under review or completed');
    }

    const now = new Date().toISOString();
    task.status = 'cancelled';
    task.history.push({
      id: `hist-${Date.now()}`,
      type: 'cancelled',
      actorAddress: creatorAddress,
      timestamp: now,
      txHash,
      amountSol: task.rewardSol,
      note: `Task cancelled. ${task.rewardSol} SOL refunded from escrow`,
    });

    this.saveTasks();

    this.recordTransaction({
      txHash,
      type: 'cancel_task',
      taskId: task.id,
      taskTitle: task.title,
      amountSol: task.rewardSol,
      status: 'confirmed',
      timestamp: now,
      fromAddress: task.escrowPda || creatorAddress,
      toAddress: creatorAddress,
    });

    return task;
  }

  public getDashboardMetrics(userAddress?: string): DashboardMetrics {
    const all = this.tasks;
    if (!userAddress) {
      const completed = all.filter((t) => t.status === 'completed');
      return {
        tasksCreated: all.length,
        tasksClaimed: all.filter((t) => !!t.workerAddress).length,
        tasksAwaitingApproval: all.filter((t) => t.status === 'under_review').length,
        completedTasks: completed.length,
        totalSolEarned: completed.reduce((acc, t) => acc + t.rewardSol, 0),
        totalSolFunded: all.reduce((acc, t) => acc + (t.status !== 'cancelled' ? t.rewardSol : 0), 0),
        activeEscrowSol: all
          .filter((t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'under_review')
          .reduce((acc, t) => acc + t.rewardSol, 0),
      };
    }

    const createdByMe = all.filter((t) => t.creatorAddress === userAddress);
    const claimedByMe = all.filter((t) => t.workerAddress === userAddress);
    const awaitingMyReview = createdByMe.filter((t) => t.status === 'under_review');
    const myCompletedWork = claimedByMe.filter((t) => t.status === 'completed');

    const totalSolEarned = myCompletedWork.reduce((acc, t) => acc + t.rewardSol, 0);
    const totalSolFunded = createdByMe
      .filter((t) => t.status !== 'cancelled')
      .reduce((acc, t) => acc + t.rewardSol, 0);

    const activeEscrowSol = createdByMe
      .filter((t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'under_review')
      .reduce((acc, t) => acc + t.rewardSol, 0);

    return {
      tasksCreated: createdByMe.length,
      tasksClaimed: claimedByMe.length,
      tasksAwaitingApproval: awaitingMyReview.length,
      completedTasks: myCompletedWork.length,
      totalSolEarned,
      totalSolFunded,
      activeEscrowSol,
    };
  }

  public resetToDefault() {
    this.tasks = [];
    this.saveTasks();
  }
}

export const taskStore = new TaskStore();
