# Dashboard roles — what each audience should see

The app has two audiences (stored in `localStorage` as `taskvault_audience` by
`App.completeWelcome`):

- **Company** — "I'm with a company or team" (`audience === 'company'`). They post
  and fund bounties, review submitted work, and see how their funds are used.
- **Bouter / Hunter** — "I'm a bounty hunter or builder" (`audience === 'hunter'`).
  They claim scoped tasks, submit deliverables, get approved, and earn rewards.

The dashboard view should be built differently per audience, using
`localStorage.getItem('taskvault_audience')` (or the connected wallet's
`creatorAddress`/`workerAddress`) as the switch. Everything below is the spec of
what each audience's dashboard must contain; data comes from `Task`,
`TaskSubmission`, `TaskHistoryEvent`, `DashboardMetrics` and `TransactionRecord`
(see `src/types/index.ts`) via `TaskStore` (`src/services/taskStore.ts`).

## 1. Company dashboard — what it should show

The company is the bounty poster. Their dashboard centers on the bounties they
created, what happened to them, and their escrow spend/release state.

**Header**
- "Company" label + active wallet address + balance.

**Funded & escrow stats**
- Total SOL funded: `totalSolFunded` (sum of `rewardSol` of their non-cancelled
  created tasks).
- Active escrow: `activeEscrowSol` (their created tasks in `open`,
  `in_progress` or `under_review`).
- Budgets reserved (visible vs refunded by `cancelled` tasks).

**Posted bounties — by status**
For the company, the task statuses read as:
- **Open** — funded and available for contributors to claim (`open`).
- **In progress** — claimed by a contributor (`in_progress`).
- **Under review** — deliverables submitted, creator reviewing (`under_review`).
- **Completed** — approved and escrow released (`completed`).
- **Cancelled** — refunded, not expecting anything more (`cancelled`).

Each bounty row shows: title, category, reward (`rewardSol`), deadline
(`deadline`), status badge, and the assigned worker (`workerAddress`).

**Claims on their bounties**
- Tasks claimed by others on the company's bounties (any of their tasks with a
  `workerAddress`).

**Recent activity**
- Their `created`, `funded`, `claimed`, `work_submitted`, `approved`,
  `cancelled` history events with timestamps, amounts and tx hashes.

**Actions**
- "Create a Bounty" (Create view) and "Explore Open Tasks".

**What it must NOT focus on**
- Hunting, applying to work they didn't create.

## 2. Bouter / Hunter dashboard — what it should see

The bounter is the builder side: they claim, do the work, and get paid. Their
dashboard centers on the work they are doing and what they earned.

**Header**
- "Bouter" (hunter) label + active wallet address + balance.

**My active work**
- **Claimed tasks** (`Claimed by Me`): tasks where the wallet is
  `workerAddress` — statuses `open`, `in_progress`, `under_review`, `completed`.
- **Submissions under review**: their claimed tasks in `under_review` — show the
  `TaskSubmission` details (`deliverableNotes`, `pullRequestUrl`,
  `liveDemoUrl`, `proofAttachmentHash`, `submittedAt`, tx hash) and allow
  viewing the company's `reviewFeedback` / `revision_requested` status.
- **Pending revisions**: submissions with `status === 'revision_requested'` —
  the work needs updates before it can be re-submitted.

**Earnings summary**
- **Total SOL earned**: `totalSolEarned` (rewards of their claimed tasks in
  `completed` state — the money that actually got released).
- Completed bounties paid out with per-bounty earnings and dates.

**Open opportunities**
- Available/unclaimed tasks worth claiming (Explore Open Tasks) — with rewards,
  deadlines and skill category.

**Recent activity**
- Their `claim_task`, `work_submitted`, `approve_work` events and any payouts.

**Actions**
- "Explore Open Tasks" (and "Claim" on open tasks).

## 3. Data each dashboard should derive (current semantics)

`TaskStore.getDashboardMetrics(userAddress)` gives, per user address:

| Metric | Meaning |
| --- | --- |
| `tasksCreated` | Bounties the user created (`creatorAddress === user`) |
| `tasksClaimed` | Tasks the user is working on (`workerAddress === user`) |
| `tasksAwaitingApproval` | The user's created tasks in `under_review` |
| `completedTasks` | Tasks the user claimed that are `completed` |
| `totalSolEarned` | Rewards of the user's `completed` claimed tasks |
| `totalSolFunded` | Rewards of the user's created, non-cancelled tasks |
| `activeEscrowSol` | Rewards of the user's created tasks in `open`/`in_progress`/`under_review` |

Tasks are keyed by `creatorAddress` (the poster) and `workerAddress` (the
assignee). Status flow: `open` → `in_progress` → `under_review` →
`completed` (or `cancelled` anytime). Submissions live on `Task.submission`
(`TaskSubmission`) with history events (`TaskHistoryEvent`) on `Task.history`.

## 4. Notes for implementation

- Determine the audience with
  `localStorage.getItem('taskvault_audience')` (values `'company'` | `'hunter'`),
  with fallback to the wallet-based roles if unset.
- Company → show: funded stats, posted bounties by status, claims on their
  bounties, activity, create/explore actions.
- Bounter/Hunter → show: claimed tasks, submissions under review, earnings
  summary, open opportunities, activity, explore/claim actions.
- Both dashboards must remain permission-consistent with the current rules:
  companies see what they funded; builders see what they claimed; nothing else.
- Empty states should explain how to start (post & fund vs claim & work).
