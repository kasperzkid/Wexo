use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::{constants::*, error::TaskError, state::*};

#[derive(Accounts)]
pub struct FundTask<'info> {
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
        init,
        payer = creator,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [ESCROW_SEED, task.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    pub system_program: Program<'info, System>,
}

pub fn handle_fund_task(ctx: Context<FundTask>) -> Result<()> {
    let task = &mut ctx.accounts.task;
    require!(
        task.status == TaskStatus::Created,
        TaskError::InvalidTaskStatus
    );

    // Transfer bounty SOL from creator to escrow PDA
    let cpi_accounts = Transfer {
        from: ctx.accounts.creator.to_account_info(),
        to: ctx.accounts.escrow.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.system_program.key(), cpi_accounts);
    transfer(cpi_ctx, task.reward_lamports)?;

    ctx.accounts.escrow.task = task.key();
    task.status = TaskStatus::Funded;
    task.escrow_bump = ctx.bumps.escrow;

    msg!(
        "Task #{} funded with {} lamports into escrow",
        task.task_id,
        task.reward_lamports
    );
    Ok(())
}
