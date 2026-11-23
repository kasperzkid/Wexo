import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { Task, TaskCategory, TaskStatus, DashboardMetrics, TransactionRecord } from '../types';
import { taskStore } from '../services/taskStore';
import { useAppWallet } from './WalletContext';
import { useNotification } from './NotificationContext';
import { programService } from '../services/programService';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: TaskCategory | 'All';
  setSelectedCategory: (cat: TaskCategory | 'All') => void;
  selectedStatus: TaskStatus | 'all';
  setSelectedStatus: (status: TaskStatus | 'all') => void;
  sortBy: 'highest_reward' | 'lowest_reward' | 'newest' | 'expiring_soon';
  setSortBy: (sort: 'highest_reward' | 'lowest_reward' | 'newest' | 'expiring_soon') => void;
  metrics: DashboardMetrics;
  userTransactions: TransactionRecord[];
  getTaskById: (id: string) => Task | undefined;
  createTask: (data: {
    title: string;
    description: string;
    category: TaskCategory;
    rewardSol: number;
    deadline: string;
    submissionInstructions?: string;
    tags: string[];
  }) => Promise<Task>;
  claimTask: (taskId: string) => Promise<Task>;
  submitWork: (
    taskId: string,
    submission: {
      pullRequestUrl?: string;
      liveDemoUrl?: string;
      deliverableNotes: string;
      proofAttachmentHash?: string;
    }
  ) => Promise<Task>;
  approveWork: (taskId: string) => Promise<Task>;
  cancelTask: (taskId: string) => Promise<Task>;
  refreshTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => taskStore.getTasks());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'highest_reward' | 'lowest_reward' | 'newest' | 'expiring_soon'>('newest');

  const { publicKeyString, publicKey, connected, sendTransaction, refreshBalance } = useAppWallet();
  const { showToast } = useNotification();

  const refreshTasks = useCallback(() => {
    setTasks(taskStore.getTasks());
    void programService.fetchDevnetTasks(taskStore.getTasks())
      .then((devnetTasks) => {
        taskStore.replaceTasksFromDevnet(devnetTasks);
        setTasks(devnetTasks);
      })
      .catch((error: unknown) => {
        console.error('Could not sync Devnet bounties:', error);
      });
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const metrics = useMemo(() => {
    return taskStore.getDashboardMetrics(publicKeyString || undefined);
  }, [tasks, publicKeyString]);

  const userTransactions = useMemo(() => {
    return taskStore.getTransactions(publicKeyString || undefined);
  }, [tasks, publicKeyString]);

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          const matchTags = task.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && task.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all' && task.status !== selectedStatus) {
          return false;
        }

        // Wallet-specific work queues. Open tasks are claimable by other wallets;
        // active and completed work only belongs in this wallet's personal queues.
        if (selectedStatus === 'open' && publicKeyString && task.creatorAddress === publicKeyString) {
          return false;
        }
        if (
          (selectedStatus === 'in_progress' || selectedStatus === 'under_review' || selectedStatus === 'completed') &&
          (!publicKeyString || task.workerAddress !== publicKeyString)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_reward') {
          return b.rewardSol - a.rewardSol;
        }
        if (sortBy === 'lowest_reward') {
          return a.rewardSol - b.rewardSol;
        }
        if (sortBy === 'expiring_soon') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        // default newest
        const time = (task: Task) => task.createdAt ? Date.parse(task.createdAt) : task.onChainId;
        return time(b) - time(a);
      });
  }, [tasks, searchQuery, selectedCategory, selectedStatus, sortBy, publicKeyString]);

  const getTaskById = useCallback(
    (id: string) => {
      return tasks.find((t) => t.id === id);
    },
    [tasks]
  );

  // Actions
  const createTask = useCallback(
    async (data: {
      title: string;
      description: string;
      category: TaskCategory;
      rewardSol: number;
      deadline: string;
      submissionInstructions?: string;
      tags: string[];
    }): Promise<Task> => {
      if (!connected || !publicKeyString) {
        throw new Error('Please connect your Solana wallet to create and fund a task.');
      }

      if (!publicKey) throw new Error('Connect a signing wallet to create a task.');
      if (Buffer.byteLength(data.title, 'utf8') > 80) throw new Error('On-chain task titles must be 80 bytes or fewer.');
      if (data.rewardSol <= 0 || !Number.isFinite(data.rewardSol)) throw new Error('Enter a valid bounty amount.');
      const taskId = Date.now();
      const specHash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.description)));
      const categories = ['Solana Dev', 'Smart Contracts', 'UI/UX Design', 'Security Audit', 'Content & Docs', 'Full Stack'];
      const created = await programService.buildCreateTaskTransaction(
        publicKey, taskId, Math.round(data.rewardSol * LAMPORTS_PER_SOL),
        Math.floor(new Date(data.deadline).getTime() / 1000), categories.indexOf(data.category), data.title,
        specHash
      );
      const funded = await programService.buildFundTaskTransaction(publicKey, created.taskPda);
      const transaction = new Transaction({ feePayer: publicKey, recentBlockhash: created.transaction.recentBlockhash });
      transaction.add(...created.transaction.instructions, ...funded.transaction.instructions);
      const txHash = await sendTransaction(transaction);
      const escrowPda = funded.escrowPda.toBase58();
      const onChainId = taskId;
      await refreshBalance();
      const newTask = taskStore.createTask({
        ...data,
        creatorAddress: publicKeyString,
        txHash,
        escrowPda,
        onChainId,
      });

      refreshTasks();
      showToast(
        'success',
        'Bounty Published On-Chain',
        `Task #${newTask.onChainId} created and ${newTask.rewardSol} SOL escrowed.`,
        txHash
      );
      return newTask;
    },
    [connected, publicKey, publicKeyString, sendTransaction, refreshBalance, refreshTasks, showToast]
  );

  const claimTask = useCallback(
    async (taskId: string): Promise<Task> => {
      if (!connected || !publicKeyString) {
        throw new Error('Please connect your Solana wallet to claim this bounty.');
      }

      const task = taskStore.getTaskById(taskId);
      if (!task) throw new Error('This bounty is no longer available on Devnet. Refresh the marketplace.');
      if (!publicKey) throw new Error('Connect a signing wallet to claim a task.');
      const creator = new PublicKey(task.creatorAddress);
      const [taskPda] = programService.deriveTaskPda(creator, task.onChainId);
      let txHash: string;
      try {
        await programService.assertTaskClaimable(taskPda, creator, task.onChainId, publicKey);
        txHash = await sendTransaction(await programService.buildClaimTaskTransaction(publicKey, taskPda));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The wallet could not simulate this claim.';
        showToast('error', 'Could not claim bounty', message);
        throw error;
      }
      const updated = taskStore.claimTask(taskId, publicKeyString, txHash);
      refreshTasks();
      showToast(
        'success',
        'Task Claimed On-Chain',
        'You are now the assigned contributor. Deliver your work before the deadline.', txHash
      );
      return updated;
    },
    [connected, publicKey, publicKeyString, sendTransaction, refreshTasks, showToast]
  );

  const submitWork = useCallback(
    async (
      taskId: string,
      submission: {
        pullRequestUrl?: string;
        liveDemoUrl?: string;
        deliverableNotes: string;
        proofAttachmentHash?: string;
      }
    ): Promise<Task> => {
      if (!connected || !publicKeyString) {
        throw new Error('Please connect your Solana wallet to submit work.');
      }

      const task = taskStore.getTaskById(taskId);
      if (!task) throw new Error('This bounty is no longer available on Devnet. Refresh the marketplace.');
      if (!publicKey) throw new Error('Connect a signing wallet to submit work.');
      const [taskPda] = programService.deriveTaskPda(new PublicKey(task.creatorAddress), task.onChainId);
      const payload = JSON.stringify(submission);
      if (Buffer.byteLength(payload, 'utf8') > 256) throw new Error('Submission details must fit within 256 bytes on-chain.');
      const txHash = await sendTransaction(await programService.buildSubmitWorkTransaction(publicKey, taskPda, payload));
      const updated = taskStore.submitWork(taskId, publicKeyString, submission, txHash);
      refreshTasks();
      showToast(
        'success',
        'Deliverables Submitted On-Chain',
        'Your work is now under review. The creator can approve it to release the escrowed SOL.',
        txHash
      );
      return updated;
    },
    [connected, publicKey, publicKeyString, sendTransaction, refreshTasks, showToast]
  );

  const approveWork = useCallback(
    async (taskId: string): Promise<Task> => {
      if (!connected || !publicKeyString) {
        throw new Error('Please connect your Solana wallet to approve work.');
      }

      const task = taskStore.getTaskById(taskId);
      if (!task) throw new Error('This bounty is no longer available on Devnet. Refresh the marketplace.');
      if (!publicKey || !task.workerAddress) throw new Error('The task is missing its creator or contributor wallet.');
      const [taskPda] = programService.deriveTaskPda(new PublicKey(task.creatorAddress), task.onChainId);
      const txHash = await sendTransaction(await programService.buildApproveWorkTransaction(publicKey, new PublicKey(task.workerAddress), taskPda));
      const updated = taskStore.approveWork(taskId, publicKeyString, txHash);
      if (txHash) await refreshBalance();
      refreshTasks();
      showToast(
        'success',
        'Bounty Approved & Payment Released! 🎉',
        `Released ${updated.rewardSol} SOL to the contributor.`, txHash
      );
      return updated;
    },
    [connected, publicKey, publicKeyString, sendTransaction, refreshBalance, refreshTasks, showToast]
  );

  const cancelTask = useCallback(
    async (taskId: string): Promise<Task> => {
      if (!connected || !publicKeyString) {
        throw new Error('Please connect your Solana wallet to cancel task.');
      }

      const task = taskStore.getTaskById(taskId);
      if (!task) throw new Error('This bounty is no longer available on Devnet. Refresh the marketplace.');
      if (!publicKey) throw new Error('Connect a signing wallet to cancel a task.');
      const [taskPda] = programService.deriveTaskPda(new PublicKey(task.creatorAddress), task.onChainId);
      const txHash = await sendTransaction(await programService.buildCancelTaskTransaction(publicKey, taskPda));
      await refreshBalance();
      const updated = taskStore.cancelTask(taskId, publicKeyString, txHash);
      refreshTasks();
      showToast(
        'info',
        'Task Cancelled & Refunded',
        `Refunded ${updated.rewardSol} SOL to your wallet.`, txHash
      );
      return updated;
    },
    [connected, publicKey, publicKeyString, sendTransaction, refreshBalance, refreshTasks, showToast]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedStatus,
        setSelectedStatus,
        sortBy,
        setSortBy,
        metrics,
        userTransactions,
        getTaskById,
        createTask,
        claimTask,
        submitWork,
        approveWork,
        cancelTask,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
