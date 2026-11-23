use anchor_lang::prelude::*;

use crate::{constants::*, error::TaskError, state::*};

#[derive(Accounts)]
pub struct CancelTask<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [TASK_SEED, creator.key().as_ref(), &task.task_id.to_le_bytes()],
        bump = task.bump,
        has_one = creator @ TaskError::UnauthorizedCreator
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        close = creator,
        seeds = [ESCROW_SEED, task.key().as_ref()],
        bump = task.escrow_bump,
        has_one = task
    )]
    pub escrow: Account<'info, Escrow>,

    pub system_program: Program<'info, System>,
}

pub fn handle_cancel_task(ctx: Context<CancelTask>) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let clock = Clock::get()?;

    // A creator can cancel if:
    // 1) Task is Funded but not claimed yet
    // 2) Task was claimed, but deadline passed without submission
    let is_unclaimed = task.status == TaskStatus::Funded;
    let is_expired_unsubmitted =
        task.status == TaskStatus::Claimed && clock.unix_timestamp >= task.deadline;

    require!(
        is_unclaimed || is_expired_unsubmitted,
        TaskError::InvalidTaskStatus
    );

    task.status = TaskStatus::Cancelled;
    msg!("Task #{} cancelled and refunded to creator", task.task_id);
    Ok(())
}
