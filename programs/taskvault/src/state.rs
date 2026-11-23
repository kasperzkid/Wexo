use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum TaskStatus {
    Created,
    Funded,
    Claimed,
    Submitted,
    Approved,
    Cancelled,
}

#[account]
#[derive(InitSpace)]
pub struct Task {
    /// Creator of the bounty task
    pub creator: Pubkey,

    /// Assigned worker / contributor
    pub worker: Option<Pubkey>,

    /// Reward in lamports held in escrow
    pub reward_lamports: u64,

    /// Unique numeric identifier for the creator's task
    pub task_id: u64,

    /// Unix timestamp deadline
    pub deadline: i64,

    /// Current lifecycle status
    pub status: TaskStatus,

    /// Category ID or identifier (e.g. dev, design, audit)
    pub category: u8,

    /// Brief title (up to 80 chars)
    #[max_len(80)]
    pub title: String,

    /// SHA-256 hash or identifier of detailed description / specification
    pub spec_hash: [u8; 32],

    /// Deliverable proof URL, PR, or IPFS CID (up to 256 chars)
    #[max_len(256)]
    pub submission_data: String,

    /// Timestamp when work was submitted
    pub submitted_at: i64,

    /// Timestamp when task was completed/approved
    pub completed_at: i64,

    /// PDA bump
    pub bump: u8,

    /// Escrow PDA bump
    pub escrow_bump: u8,
}

/// Program-owned SOL escrow for one task. Its PDA can only be debited by this program.
#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub task: Pubkey,
}
