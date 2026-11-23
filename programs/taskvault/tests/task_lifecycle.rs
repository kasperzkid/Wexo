use anchor_lang::{
    prelude::{AccountDeserialize, Clock, Pubkey},
    solana_program::{instruction::Instruction, system_program},
    InstructionData, ToAccountMetas,
};
use litesvm::LiteSVM;
use solana_account::Account;
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_signer::Signer;
use solana_transaction::versioned::VersionedTransaction;
use taskvault::{
    constants::*,
    state::{Escrow, Task, TaskStatus},
};

const LAMPORTS_PER_SOL: u64 = 1_000_000_000;
const NOW: i64 = 1_750_000_000;

fn new_svm() -> LiteSVM {
    let mut svm = LiteSVM::new();
    let program_id = taskvault::id();
    let program_bytes = include_bytes!(concat!(
        env!("CARGO_TARGET_TMPDIR"),
        "/../deploy/taskvault.so"
    ));
    svm.add_program(program_id, program_bytes).unwrap();

    let mut clock = svm.get_sysvar::<Clock>();
    clock.unix_timestamp = NOW;
    svm.set_sysvar(&clock);
    svm
}

fn send(svm: &mut LiteSVM, instruction: Instruction, signers: &[&Keypair]) -> Result<(), String> {
    let payer = signers[0].pubkey();
    let message =
        Message::new_with_blockhash(&[instruction], Some(&payer), &svm.latest_blockhash());
    let transaction = VersionedTransaction::try_new(VersionedMessage::Legacy(message), signers)
        .map_err(|error| format!("failed to sign test transaction: {error:?}"))?;
    svm.send_transaction(transaction)
        .map(|_| ())
        .map_err(|error| format!("test transaction failed: {error:?}"))
}

fn addresses(creator: &Pubkey, task_id: u64) -> (Pubkey, Pubkey) {
    let (task, _) = Pubkey::find_program_address(
        &[TASK_SEED, creator.as_ref(), &task_id.to_le_bytes()],
        &taskvault::id(),
    );
    let (escrow, _) = Pubkey::find_program_address(&[ESCROW_SEED, task.as_ref()], &taskvault::id());
    (task, escrow)
}

fn create_and_fund(
    svm: &mut LiteSVM,
    creator: &Keypair,
    task_id: u64,
    deadline: i64,
) -> (Pubkey, Pubkey) {
    let (task, escrow) = addresses(&creator.pubkey(), task_id);
    let create = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::CreateTask {
            task_id,
            reward_lamports: LAMPORTS_PER_SOL,
            deadline,
            category: 0,
            title: format!("Lifecycle test {task_id}"),
            spec_hash: [7; 32],
        }
        .data(),
        taskvault::accounts::CreateTask {
            creator: creator.pubkey(),
            task,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    send(svm, create, &[creator]).unwrap();

    let fund = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::FundTask {}.data(),
        taskvault::accounts::FundTask {
            creator: creator.pubkey(),
            task,
            escrow,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    send(svm, fund, &[creator]).unwrap();
    (task, escrow)
}

fn read_task(svm: &LiteSVM, address: &Pubkey) -> Task {
    let account = svm.get_account(address).expect("task account should exist");
    let mut data: &[u8] = &account.data;
    Task::try_deserialize(&mut data).expect("task account should deserialize")
}

#[test]
fn full_bounty_lifecycle_pays_only_the_assigned_worker() {
    let mut svm = new_svm();
    let creator = Keypair::new();
    let worker = Keypair::new();
    let attacker = Keypair::new();
    svm.airdrop(&creator.pubkey(), 5 * LAMPORTS_PER_SOL)
        .unwrap();
    svm.airdrop(&worker.pubkey(), LAMPORTS_PER_SOL).unwrap();
    svm.airdrop(&attacker.pubkey(), LAMPORTS_PER_SOL).unwrap();

    // Anyone can send lamports to a predictable PDA. Anchor 1.2.2's init
    // path must still initialize a prefunded escrow instead of letting dust
    // block a creator from publishing a real bounty.
    let (_, prefunded_escrow) = addresses(&creator.pubkey(), 1);
    svm.set_account(
        prefunded_escrow,
        Account {
            lamports: 1,
            data: vec![],
            owner: system_program::ID,
            executable: false,
            rent_epoch: 0,
        },
    )
    .unwrap();
    let (task, escrow) = create_and_fund(&mut svm, &creator, 1, NOW + 600);
    assert_eq!(read_task(&svm, &task).status, TaskStatus::Funded);
    let escrow_state = {
        let account = svm
            .get_account(&escrow)
            .expect("escrow should be initialized");
        assert_eq!(account.owner, taskvault::id());
        let mut data: &[u8] = &account.data;
        Escrow::try_deserialize(&mut data).unwrap()
    };
    assert_eq!(escrow_state.task, task);
    assert!(svm.get_balance(&escrow).unwrap() >= LAMPORTS_PER_SOL);

    let creator_claim = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::ClaimTask {}.data(),
        taskvault::accounts::ClaimTask {
            worker: creator.pubkey(),
            task,
        }
        .to_account_metas(None),
    );
    assert!(
        send(&mut svm, creator_claim, &[&creator]).is_err(),
        "creator must not claim own task"
    );

    let claim = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::ClaimTask {}.data(),
        taskvault::accounts::ClaimTask {
            worker: worker.pubkey(),
            task,
        }
        .to_account_metas(None),
    );
    send(&mut svm, claim, &[&worker]).unwrap();
    assert_eq!(read_task(&svm, &task).worker, Some(worker.pubkey()));
    assert_eq!(read_task(&svm, &task).status, TaskStatus::Claimed);

    let second_claim = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::ClaimTask {}.data(),
        taskvault::accounts::ClaimTask {
            worker: attacker.pubkey(),
            task,
        }
        .to_account_metas(None),
    );
    assert!(
        send(&mut svm, second_claim, &[&attacker]).is_err(),
        "a task cannot be claimed twice"
    );

    let unauthorized_submit = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::SubmitWork {
            submission_data: "attacker work".into(),
        }
        .data(),
        taskvault::accounts::SubmitWork {
            worker: attacker.pubkey(),
            task,
        }
        .to_account_metas(None),
    );
    assert!(
        send(&mut svm, unauthorized_submit, &[&attacker]).is_err(),
        "only assigned worker may submit"
    );

    let submit = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::SubmitWork {
            submission_data: "https://example.test/pr".into(),
        }
        .data(),
        taskvault::accounts::SubmitWork {
            worker: worker.pubkey(),
            task,
        }
        .to_account_metas(None),
    );
    send(&mut svm, submit, &[&worker]).unwrap();
    assert_eq!(read_task(&svm, &task).status, TaskStatus::Submitted);

    let worker_before_approval = svm.get_balance(&worker.pubkey()).unwrap();
    let unauthorized_approve = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::ApproveWork {}.data(),
        taskvault::accounts::ApproveWork {
            creator: attacker.pubkey(),
            worker: worker.pubkey(),
            task,
            escrow,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(
        send(&mut svm, unauthorized_approve, &[&attacker]).is_err(),
        "only creator may approve"
    );

    let approve = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::ApproveWork {}.data(),
        taskvault::accounts::ApproveWork {
            creator: creator.pubkey(),
            worker: worker.pubkey(),
            task,
            escrow,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    send(&mut svm, approve, &[&creator]).unwrap();
    let worker_after_approval = svm.get_balance(&worker.pubkey()).unwrap();
    assert_eq!(
        worker_after_approval - worker_before_approval,
        LAMPORTS_PER_SOL
    );
    assert_eq!(read_task(&svm, &task).status, TaskStatus::Approved);
    assert!(
        svm.get_account(&escrow).is_none(),
        "approved escrow should close"
    );

    let duplicate_approve = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::ApproveWork {}.data(),
        taskvault::accounts::ApproveWork {
            creator: creator.pubkey(),
            worker: worker.pubkey(),
            task,
            escrow,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(
        send(&mut svm, duplicate_approve, &[&creator]).is_err(),
        "payout cannot happen twice"
    );
}

#[test]
fn cancellation_refunds_and_expired_claims_can_be_cancelled() {
    let mut svm = new_svm();
    let creator = Keypair::new();
    let worker = Keypair::new();
    let attacker = Keypair::new();
    svm.airdrop(&creator.pubkey(), 5 * LAMPORTS_PER_SOL)
        .unwrap();
    svm.airdrop(&worker.pubkey(), LAMPORTS_PER_SOL).unwrap();
    svm.airdrop(&attacker.pubkey(), LAMPORTS_PER_SOL).unwrap();

    let (unclaimed_task, unclaimed_escrow) = create_and_fund(&mut svm, &creator, 2, NOW + 600);
    let balance_before_cancel = svm.get_balance(&creator.pubkey()).unwrap();
    let unauthorized_cancel = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::CancelTask {}.data(),
        taskvault::accounts::CancelTask {
            creator: attacker.pubkey(),
            task: unclaimed_task,
            escrow: unclaimed_escrow,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(
        send(&mut svm, unauthorized_cancel, &[&attacker]).is_err(),
        "only creator may cancel"
    );

    let cancel = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::CancelTask {}.data(),
        taskvault::accounts::CancelTask {
            creator: creator.pubkey(),
            task: unclaimed_task,
            escrow: unclaimed_escrow,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    send(&mut svm, cancel, &[&creator]).unwrap();
    assert_eq!(
        read_task(&svm, &unclaimed_task).status,
        TaskStatus::Cancelled
    );
    assert!(svm.get_account(&unclaimed_escrow).is_none());
    assert!(
        svm.get_balance(&creator.pubkey()).unwrap() + 1_000_000
            >= balance_before_cancel + LAMPORTS_PER_SOL,
        "creator should receive the escrowed reward back, less only the transaction fee"
    );

    let (expired_task, expired_escrow) = create_and_fund(&mut svm, &creator, 3, NOW + 10);
    let claim = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::ClaimTask {}.data(),
        taskvault::accounts::ClaimTask {
            worker: worker.pubkey(),
            task: expired_task,
        }
        .to_account_metas(None),
    );
    send(&mut svm, claim, &[&worker]).unwrap();

    let mut clock = svm.get_sysvar::<Clock>();
    clock.unix_timestamp = NOW + 10;
    svm.set_sysvar(&clock);
    let late_submit = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::SubmitWork {
            submission_data: "late".into(),
        }
        .data(),
        taskvault::accounts::SubmitWork {
            worker: worker.pubkey(),
            task: expired_task,
        }
        .to_account_metas(None),
    );
    assert!(
        send(&mut svm, late_submit, &[&worker]).is_err(),
        "late work must not block refunds"
    );

    let expired_cancel = Instruction::new_with_bytes(
        taskvault::id(),
        &taskvault::instruction::CancelTask {}.data(),
        taskvault::accounts::CancelTask {
            creator: creator.pubkey(),
            task: expired_task,
            escrow: expired_escrow,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    send(&mut svm, expired_cancel, &[&creator]).unwrap();
    assert_eq!(read_task(&svm, &expired_task).status, TaskStatus::Cancelled);
}
