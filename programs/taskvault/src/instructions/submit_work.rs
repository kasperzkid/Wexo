use anchor_lang::prelude::*;

use crate::{constants::*, error::TaskError, state::*};

#[derive(Accounts)]
pub struct SubmitWork<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,

    #[account(
        mut,
        seeds = [TASK_SEED, task.creator.as_ref(), &task.task_id.to_le_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

pub fn handle_submit_work(ctx: Context<SubmitWork>, submission_data: String) -> Result<()> {
    let task = &mut ctx.accounts.task;
    require!(
        task.status == TaskStatus::Claimed,
        TaskError::InvalidTaskStatus
    );

    let worker_key = ctx.accounts.worker.key();
    require!(
        task.worker == Some(worker_key),
        TaskError::UnauthorizedWorker
    );
    require!(
        submission_data.len() <= MAX_SUBMISSION_LEN,
        TaskError::SubmissionTooLong
    );

    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp < task.deadline,
        TaskError::DeadlinePassed
    );
    task.submission_data = submission_data;
    task.submitted_at = clock.unix_timestamp;
    task.status = TaskStatus::Submitted;

    msg!(
        "Task #{} work submitted by worker {}",
        task.task_id,
        worker_key
    );
    Ok(())
}
