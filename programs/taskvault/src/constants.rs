use anchor_lang::prelude::*;

#[constant]
pub const TASK_SEED: &[u8] = b"task";

#[constant]
pub const ESCROW_SEED: &[u8] = b"escrow";

pub const MAX_TITLE_LEN: usize = 80;
pub const MAX_SUBMISSION_LEN: usize = 256;
