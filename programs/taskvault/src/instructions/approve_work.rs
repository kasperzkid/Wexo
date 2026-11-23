use anchor_lang::prelude::*;

use crate::{constants::*, error::TaskError, state::*};

#[derive(Accounts)]
pub struct ApproveWork<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub worker: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [TASK_SEED, creator.key().as_ref(), &task.task_id.to_le_bytes()],
        bump = task.bump,
        has_one = creator @ TaskError::UnauthorizedCreator
    )]
    pub task: Account<'info, Task>,

    /// CHECK: Escrow PDA holding funds to release
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

pub fn handle_approve_work(ctx: Context<ApproveWork>) -> Result<()> {
    let task = &mut ctx.accounts.task;
    require!(
        task.status == TaskStatus::Submitted,
        TaskError::InvalidTaskStatus
    );
    require!(
        task.worker == Some(ctx.accounts.worker.key()),
        TaskError::UnauthorizedWorker
    );

    let amount = task.reward_lamports;
    require!(
        ctx.accounts.escrow.to_account_info().lamports() >= amount,
        TaskError::InsufficientEscrowBalance
    );
    let updated_worker_balance = ctx
        .accounts
        .worker
        .lamports()
        .checked_add(amount)
        .ok_or(TaskError::ArithmeticOverflow)?;
    let clock = Clock::get()?;

    **ctx
        .accounts
        .escrow
        .to_account_info()
        .try_borrow_mut_lamports()? -= amount;
    **ctx
        .accounts
        .worker
        .to_account_info()
        .try_borrow_mut_lamports()? = updated_worker_balance;

    task.status = TaskStatus::Approved;
    task.completed_at = clock.unix_timestamp;

    msg!(
        "Task #{} approved. Released {} lamports to worker {}",
        task.task_id,
        amount,
        ctx.accounts.worker.key()
    );
    Ok(())
}
