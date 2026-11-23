# TaskVault Devnet deployment

## Current status

TaskVault's app and explicit deployment target use Solana Devnet. The program ID is
`G2mbnQ1yqvt6XJxt7YPXPDLLRfWm798Kxxbk8mHtmzdR`. The public key derived from
`target/deploy/taskvault-keypair.json` matches `declare_id!()`, `Anchor.toml`, and
the frontend configuration.

**The user-provided Anchor output reports a successful Devnet deployment on
2026-11-23.** It named this program ID and said `Deploy success`, but did not
include a deployment signature. The user later ran `solana program show` and
verified the program as executable under `BPFLoaderUpgradeab1e11111111111111111111111`.
Its ProgramData address is `CizdiGaULRVGENmRvrg2Qc7CkVX8qzboceFscD9QfG4y`,
upgrade authority is `5ULAYvfqLSX9PSYfzacVw6kza3AJYRxzqPXmAzEsZvyE`, last deployed
slot is `525441858`, data length is `200016` bytes, and ProgramData balance is
`1.01696012 SOL`. The latest user-provided build/test output reports both
LiteSVM lifecycle tests passing. No on-chain program source changes have been
made since deployment; subsequent changes only adjusted test fixtures and made
Anchor tests default to Localnet.

## Prerequisites

- Rust toolchain from `rust-toolchain.toml` and the Solana SBF toolchain.
- Anchor CLI matching `Anchor.toml` (reviewed with Anchor CLI 1.2.2).
- Network access to crates.io and `https://api.devnet.solana.com`.
- A funded Devnet wallet configured with `solana config set --url devnet`.
- The existing program keypair at `target/deploy/taskvault-keypair.json`; never
  replace this file or share its contents.

The CLI wallet checked during review was `5ULAYvfqLSX9PSYfzacVw6kza3AJYRxzqPXmAzEsZvyE`.
The user later reported a balance of 14.999995 SOL.

## Build and test

From the repository root:

```sh
NO_DNA=1 anchor build
NO_DNA=1 anchor test
cargo fmt --all -- --check
```

Anchor tests default to Localnet, while the frontend and explicit deployment
target remain on Devnet. This prevents `anchor test` from deploying to Devnet
before the tests run. The tests use LiteSVM and the SBF artifact from
`anchor build`. They cover the funded task lifecycle, payout amount, escrow
closure/refunds, deadline expiry, duplicate payout protection, and
unauthorized claim, submission, approval, and cancellation attempts.

The first test run exposed a fixture issue: LiteSVM's airdrop rejected a
one-lamport account. The fixture now inserts a prefunded, system-owned account
directly to exercise Anchor's prefunded PDA initialization. The user then
reported a successful `anchor build && anchor test` run with both lifecycle
tests passing (2 passed, 0 failed).

## Verify the reported deployment

After the build and tests pass, confirm the cluster and keypair without printing
or copying private key material:

```sh
solana config get
solana address
solana balance --url devnet
solana-keygen pubkey target/deploy/taskvault-keypair.json
solana program show G2mbnQ1yqvt6XJxt7YPXPDLLRfWm798Kxxbk8mHtmzdR --url devnet
```

The program is already reported deployed, so do not deploy again as part of
verification. Updating it would replace its executable. The user-provided
output lists the configured CLI wallet as upgrade authority. Any future upgrade
requires checking the deployed state and getting explicit approval first. If
approved, the Devnet upgrade commands are:

```sh
NO_DNA=1 anchor build
NO_DNA=1 anchor deploy --provider.cluster devnet
solana program show G2mbnQ1yqvt6XJxt7YPXPDLLRfWm798Kxxbk8mHtmzdR --url devnet
```

Record the deploy transaction signature and verify the account is executable.
The command signs with the configured CLI wallet and spends its Devnet SOL. No
deployment signature was included in the output received so far.

## Frontend

`app/src/config/solana.ts` selects `https://api.devnet.solana.com` and the
verified program ID above. `app/src/idl/taskvault.json` and
`app/src/idl/taskvault.ts` are copied from Anchor's generated
`target/idl/taskvault.json` and `target/types/taskvault.ts`. The frontend
constructs an `@anchor-lang/core` client from those artifacts and uses its
generated methods and account decoders for all six lifecycle instructions and
Task/Escrow accounts. It waits for `confirmed` transaction status before
showing success. Wallet Standard compatible Solana wallets are discovered by
the wallet adapter.

The frontend pins `@anchor-lang/core@1.2.2`, and the lockfile has been
regenerated. `npm run build` completes successfully. Vite reports a large
JavaScript chunk (785 kB uncompressed); consider route-level code splitting
before a performance-sensitive production launch. After any on-chain change,
run `NO_DNA=1 anchor build` and copy both generated artifacts into
`app/src/idl/` before rebuilding the frontend.

MetaMask's `@metamask/connect-solana` implements Wallet Standard and works with
Solana Wallet Adapter, but the app does not currently bundle or initialize that
package. MetaMask will not be reliably available until that integration is
added. MetaMask's Devnet support is currently limited to its browser extension.
See the [MetaMask Solana Connect guide](https://docs.metamask.io/metamask-connect/solana/).

## End-to-end checks and known limits

The deployment output did not include a signature. End-to-end tests with two
separately funded Devnet wallets remain to be run; record signatures for task
creation/funding, claim, submission, approval, and cancellation. Confirm escrow
and worker balances from Devnet RPC or the Explorer before reporting success.

The on-chain task stores a specification hash, not the full task description.
Descriptions are currently retained only in the creator's browser storage, so
other browsers cannot retrieve the full brief from the chain. This must be
addressed through an approved account-layout migration or external content
storage before treating cross-browser task details as complete.
