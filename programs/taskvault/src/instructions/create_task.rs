use anchor_lang::prelude::*;

use crate::{constants::*, error::TaskError, state::*};

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Task::INIT_SPACE,
        seeds = [TASK_SEED, creator.key().as_ref(), &task_id.to_le_bytes()],
        bump
    )]
    pub task: Account<'info, Task>,

    pub system_program: Program<'info, System>,
}

pub fn handle_create_task(
    ctx: Context<CreateTask>,
    task_id: u64,
    reward_lamports: u64,
    deadline: i64,
    category: u8,
    title: String,
    spec_hash: [u8; 32],
) -> Result<()> {
    require!(reward_lamports > 0, TaskError::InvalidRewardAmount);
    require!(title.len() <= MAX_TITLE_LEN, TaskError::TitleTooLong);

    let clock = Clock::get()?;
    require!(deadline > clock.unix_timestamp, TaskError::InvalidDeadline);

    let task = &mut ctx.accounts.task;
    task.creator = ctx.accounts.creator.key();
    task.worker = None;
    task.reward_lamports = reward_lamports;
    task.task_id = task_id;
    task.deadline = deadline;
    task.status = TaskStatus::Created;
    task.category = category;
    task.title = title;
    task.spec_hash = spec_hash;
    task.submission_data = String::new();
    task.submitted_at = 0;
    task.completed_at = 0;
    task.bump = ctx.bumps.task;
    task.escrow_bump = 0;

    msg!("Task #{} created by {}", task_id, task.creator);
    Ok(())
}
