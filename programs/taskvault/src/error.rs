use anchor_lang::prelude::*;

#[error_code]
pub enum TaskError {
    #[msg("Only the creator of the task can perform this action")]
    UnauthorizedCreator,

    #[msg("Only the assigned worker can perform this action")]
    UnauthorizedWorker,

    #[msg("Task is not in the correct status for this action")]
    InvalidTaskStatus,

    #[msg("Task deadline has passed")]
    DeadlinePassed,

    #[msg("Task deadline must be in the future")]
    InvalidDeadline,

    #[msg("Reward amount must be greater than zero")]
    InvalidRewardAmount,

    #[msg("Task title exceeds maximum allowed length")]
    TitleTooLong,

    #[msg("Submission details exceed maximum allowed length")]
    SubmissionTooLong,

    #[msg("Creator cannot claim their own task")]
    CreatorCannotClaim,

    #[msg("The escrow balance is insufficient for this payout")]
    InsufficientEscrowBalance,

    #[msg("Lamport arithmetic overflow")]
    ArithmeticOverflow,
}
