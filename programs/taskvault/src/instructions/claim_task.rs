use anchor_lang::prelude::*;

use crate::{constants::*, error::TaskError, state::*};

#[derive(Accounts)]
pub struct ClaimTask<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,

    #[account(
        mut,
        seeds = [TASK_SEED, task.creator.as_ref(), &task.task_id.to_le_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

pub fn handle_claim_task(ctx: Context<ClaimTask>) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let worker_key = ctx.accounts.worker.key();

    require!(
        task.status == TaskStatus::Funded,
        TaskError::InvalidTaskStatus
    );
    require!(task.creator != worker_key, TaskError::CreatorCannotClaim);

    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp < task.deadline,
        TaskError::DeadlinePassed
    );

    task.worker = Some(worker_key);
    task.status = TaskStatus::Claimed;

    msg!("Task #{} claimed by worker {}", task.task_id, worker_key);
    Ok(())
}
