export type TaskCategory =
  | 'Solana Dev'
  | 'Smart Contracts'
  | 'UI/UX Design'
  | 'Security Audit'
  | 'Content & Docs'
  | 'Full Stack';

export type TaskStatus =
  | 'open'          // funded & open for contributors to claim
  | 'in_progress'   // claimed by a contributor, actively being worked on
  | 'under_review'  // work submitted, creator reviewing deliverables
  | 'completed'     // creator approved, escrow funds released
  | 'cancelled';    // creator cancelled, escrow refunded

export interface TaskSubmission {
  id: string;
  taskId: string;
  workerAddress: string;
  submittedAt: string;
  pullRequestUrl?: string;
  liveDemoUrl?: string;
  deliverableNotes: string;
  proofAttachmentHash?: string;
  status: 'pending' | 'approved' | 'revision_requested';
  reviewFeedback?: string;
}

export interface TaskHistoryEvent {
  id: string;
  type: 'created' | 'funded' | 'claimed' | 'work_submitted' | 'approved' | 'cancelled' | 'revision_requested';
  actorAddress: string;
  timestamp: string;
  txHash?: string;
  amountSol?: number;
  note?: string;
}

export interface Task {
  id: string;
  onChainId: number;
  title: string;
  description: string;
  category: TaskCategory;
  rewardSol: number;
  rewardLamports: number;
  creatorAddress: string;
  workerAddress?: string;
  status: TaskStatus;
  createdAt?: string;
  deadline: string;
  completedAt?: string;
  submissionInstructions?: string;
  tags: string[];
  submission?: TaskSubmission;
  history: TaskHistoryEvent[];
  escrowPda?: string;
  creationTxHash?: string;
}

export interface DashboardMetrics {
  tasksCreated: number;
  tasksClaimed: number;
  tasksAwaitingApproval: number;
  completedTasks: number;
  totalSolEarned: number;
  totalSolFunded: number;
  activeEscrowSol: number;
}

export interface TransactionRecord {
  id: string;
  txHash: string;
  type: 'fund_task' | 'claim_task' | 'submit_work' | 'approve_work' | 'cancel_task' | 'airdrop';
  taskId?: string;
  taskTitle?: string;
  amountSol?: number;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  fromAddress: string;
  toAddress?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  txHash?: string;
  timestamp: number;
}
