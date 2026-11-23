pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("G2mbnQ1yqvt6XJxt7YPXPDLLRfWm798Kxxbk8mHtmzdR");

#[program]
pub mod taskvault {
    use super::*;

    /// Create a new task bounty
    pub fn create_task(
        ctx: Context<CreateTask>,
        task_id: u64,
        reward_lamports: u64,
        deadline: i64,
        category: u8,
        title: String,
        spec_hash: [u8; 32],
    ) -> Result<()> {
        instructions::create_task::handle_create_task(
            ctx,
            task_id,
            reward_lamports,
            deadline,
            category,
            title,
            spec_hash,
        )
    }

    /// Deposit SOL reward into program escrow PDA
    pub fn fund_task(ctx: Context<FundTask>) -> Result<()> {
        instructions::fund_task::handle_fund_task(ctx)
    }

    /// Claim an open task bounty as a contributor
    pub fn claim_task(ctx: Context<ClaimTask>) -> Result<()> {
        instructions::claim_task::handle_claim_task(ctx)
    }

    /// Submit deliverable work (PR / IPFS / demo) for creator review
    pub fn submit_work(ctx: Context<SubmitWork>, submission_data: String) -> Result<()> {
        instructions::submit_work::handle_submit_work(ctx, submission_data)
    }

    /// Approve submitted work and release escrowed SOL to worker
    pub fn approve_work(ctx: Context<ApproveWork>) -> Result<()> {
        instructions::approve_work::handle_approve_work(ctx)
    }

    /// Cancel an unfulfilled task and refund creator
    pub fn cancel_task(ctx: Context<CancelTask>) -> Result<()> {
        instructions::cancel_task::handle_cancel_task(ctx)
    }
}
