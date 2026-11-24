import React from 'react';
import {
  ShieldCheck,
  Zap,
  Coins,
  Cpu,
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  RotateCcw,
  History,
  Users,
  Compass,
  PlusCircle,
} from 'lucide-react';
import { Task } from '../types';
import { TaskCard } from '../components/task/TaskCard';

const programCheckCode = `// Approval checks from handle_approve_work
    let task = &mut ctx.accounts.task;
    require!(
        task.status == TaskStatus::Submitted,
        TaskError::InvalidTaskStatus
    );
    require!(
        task.worker == Some(ctx.accounts.worker.key()),
        TaskError::UnauthorizedWorker
    );

    let amount = task.reward_lamports;`;

interface LandingPageProps {
  tasks: Task[];
  onNavigate: (view: 'landing' | 'explore' | 'create' | 'dashboard') => void;
  onSelectTask: (task: Task) => void;
  onClaimTask: (task: Task) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  tasks,
  onNavigate,
  onSelectTask,
  onClaimTask,
}) => {
  const featuredTasks = tasks.slice(0, 3);
  const [typedCode, setTypedCode] = React.useState('');

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedCode(programCheckCode);
      return;
    }

    let position = 0;
    const timer = window.setInterval(() => {
      position += 1;
      setTypedCode(programCheckCode.slice(0, position));
      if (position >= programCheckCode.length) window.clearInterval(timer);
    }, 45);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden border-b-2 border-ink bg-lime">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full border-[3rem] border-ink/5" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-[38%] h-64 w-64 rotate-12 border-2 border-ink/10" />
        <div className="relative mx-auto grid min-h-[640px] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[0.92fr_1.08fr] md:gap-10 md:py-16 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-ink shadow-brutal-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime ring-2 ring-ink" />
              Solana Devnet · Program escrow
            </span>
            <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
              Find good work.
              <br />
              <span className="inline-block -rotate-1 border-b-[5px] border-white/75">Get paid on-chain.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
              A bounty marketplace for teams and independent builders. Set the scope, fund a reward,
              and track the work through transparent on-chain task states.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => onNavigate('explore')} className="btn-black px-6 py-3.5 text-sm">
                <Compass className="h-4 w-4" /> Browse bounties <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => onNavigate('create')} className="btn-ghost bg-white/50 px-6 py-3.5 text-sm">
                <PlusCircle className="h-4 w-4" /> Post a bounty
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-ink/70">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-ink" /> Task-specific escrow</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-ink" /> Teams meet builders</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] lg:max-w-[670px] md:justify-self-center md:-translate-x-6 lg:-translate-x-10">
            <div className="absolute -inset-5 rotate-2 rounded-[2rem] border-2 border-ink/20 bg-white/25" />
            <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-ink bg-[#F8F7F1] shadow-[8px_8px_0_#0D0D0D]">
              <img
                src="/wexo-hero.png"
                alt="Wexo bounty escrow marketplace illustration"
                className="aspect-[1.4/1] w-full object-cover object-[30%_center]"
              />
              <div className="flex items-center justify-between border-t-2 border-ink bg-white px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink bg-lime"><ShieldCheck className="h-4 w-4" /></span>
                  <span><span className="block text-xs font-black">Built around the bounty</span><span className="block text-[10px] text-ink-muted">Scope · escrow · delivery</span></span>
                </div>
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-3 rounded-xl border-2 border-ink bg-white px-3 py-2 shadow-brutal-sm sm:-left-7">
              <span className="block text-[9px] font-bold uppercase tracking-wide text-ink-muted">Marketplace</span>
              <span className="block text-sm font-black text-ink">Find your next build</span>
            </div>
          </div>
        </div>

        <div className="relative border-t border-ink/15 bg-white/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-3 px-4 py-4 text-xs font-bold text-ink sm:grid-cols-4 sm:px-6 lg:px-8">
            {[
              { icon: ShieldCheck, label: 'Program escrow' },
              { icon: Zap, label: 'Solana powered' },
              { icon: Coins, label: 'SOL rewards' },
              { icon: Cpu, label: 'Anchor program' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2 sm:justify-start">
                <Icon className="h-4 w-4" /> <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Statistics ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Compass,
              index: '01',
              value: 'DEVNET',
              label: 'Network',
              sub: 'Solana test environment',
            },
            {
              icon: ShieldCheck,
              index: '02',
              value: 'ONE PDA',
              label: 'Per bounty',
              sub: 'Dedicated escrow address',
            },
            { icon: Cpu, index: '03', value: 'ON-CHAIN', label: 'Task lifecycle', sub: 'Program state updates' },
            { icon: Users, index: '04', value: 'CREATOR', label: 'Reviews work', sub: 'Approval starts payout' },
          ].map((stat) => (
            <article key={stat.label} className="group relative overflow-hidden rounded-2xl border-2 border-ink bg-white p-5 shadow-brutal-sm transition duration-200 hover:-translate-y-1 hover:shadow-brutal">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink bg-lime text-ink transition-transform group-hover:rotate-3">
                  <stat.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-[10px] font-bold tracking-widest text-ink-faint">{stat.index} / 04</span>
              </div>
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-ink-faint">{stat.label}</p>
              <h3 className="mt-1 text-2xl font-black leading-none tracking-tight text-ink">{stat.value}</h3>
              <p className="mt-2 text-xs text-ink-muted">{stat.sub}</p>
              <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-lime transition-transform duration-300 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-ink-muted border border-ink px-3 py-1 rounded-full">
            On-Chain Escrow Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
            How TaskVault Works
          </h2>
          <p className="text-sm text-ink-muted">
            A bulletproof, 4-step workflow backed by Anchor program instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              step: '01',
              title: 'Create & Fund Escrow',
              desc: 'Define requirements, deadline, and reward. SOL is transferred into a PDA escrow controlled by the TaskVault contract.',
              code: 'create_task & fund_task',
              bg: 'bg-lime',
            },
            {
              step: '02',
              title: 'Contributor Claims Task',
              desc: 'A builder claims the bounty. The smart contract assigns their wallet as the exclusive worker, protecting their effort.',
              code: 'claim_task',
              bg: 'bg-yellow-100',
            },
            {
              step: '03',
              title: 'Submit Work with Proof',
              desc: 'Deliverables (GitHub PR, live demo, audit report) are submitted on-chain for transparent verification.',
              code: 'submit_work',
              bg: 'bg-orange-100',
            },
            {
              step: '04',
              title: 'Review & Release SOL',
              desc: "Creator verifies and signs approval. The smart contract releases the full bounty from escrow to the contributor's wallet.",
              code: 'approve_work',
              bg: 'bg-green-100',
            },
          ].map((s) => (
            <div key={s.step} className={`brutalist-card ${s.bg} p-6 space-y-3`}>
              <div className="text-4xl font-black text-ink/20">{s.step}</div>
              <h3 className="text-base font-black text-ink">{s.title}</h3>
              <p className="text-xs text-ink-muted leading-relaxed">{s.desc}</p>
              <div className="pt-2 text-[11px] font-mono font-bold text-ink bg-white/70 border border-ink/20 px-2.5 py-1 rounded-lg inline-block">
                {s.code}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Tasks ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-ink-faint">
              Live Marketplace
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Featured Devnet Bounties
            </h2>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="btn-ghost px-5 py-2.5 text-xs"
          >
            <span>View All Bounties ({tasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTasks.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-ink/15 bg-white p-10 text-center">
              <p className="text-lg font-black text-ink">No live Devnet bounties yet</p>
              <p className="mt-2 text-sm text-ink-muted">When a creator publishes and funds a task on TaskVault, it will appear here.</p>
              <button onClick={() => onNavigate('explore')} className="btn-ghost mt-5 px-5 py-2.5 text-xs">Explore the marketplace</button>
            </div>
          ) : featuredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={onSelectTask}
              onClaim={onClaimTask}
            />
          ))}
        </div>
      </section>

      {/* ── Security Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-paper-gray p-6 shadow-brutal-lg sm:p-9 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[32px] border-lime/60" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-lime px-3 py-1.5 text-xs font-bold text-ink">
                <ShieldCheck className="h-3.5 w-3.5" /> ON-CHAIN BY DESIGN
              </span>
              <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
                Your bounty. <span className="text-ink-muted">Your rules, enforced by the program.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                Each bounty uses its own Solana escrow PDA. The TaskVault program checks who can claim,
                submit, approve, or request a refund as the task moves through its on-chain states.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <SecurityFeature
                  icon={<Fingerprint className="h-5 w-5" />}
                  title="Wallet roles are checked"
                  description="Only the task creator can approve. Only the assigned contributor can submit and receive the payout."
                />
                <SecurityFeature
                  icon={<RotateCcw className="h-5 w-5" />}
                  title="Refunds follow task rules"
                  description="The creator can cancel an unclaimed bounty, or request a refund after a claimed task passes its deadline without submission."
                />
                <SecurityFeature
                  icon={<History className="h-5 w-5" />}
                  title="Transactions stay inspectable"
                  description="Task state changes and program logs can be inspected from each transaction in Solana Explorer."
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-white p-5 text-ink shadow-brutal sm:p-7">
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-lime/40 blur-2xl" />
              <div className="relative mb-5 flex items-center justify-between gap-3 border-b border-ink/10 pb-4">
                <div>
                  <p className="inline-flex rounded-md border border-ink bg-lime px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink">PROGRAM CHECKS</p>
                  <p className="mt-2 text-sm font-black text-ink">Approval requires the right roles</p>
                </div>
                <span className="rounded-lg border border-ink/20 bg-paper-gray px-2.5 py-1 text-[10px] font-black text-ink-muted">ANCHOR 1.2.2</span>
              </div>
              <pre aria-label={programCheckCode} className="relative min-h-[250px] overflow-x-auto whitespace-pre-wrap rounded-xl border-2 border-ink bg-paper-gray p-5 font-mono text-xs leading-7 text-ink shadow-brutal-sm sm:min-h-[280px] sm:p-6 sm:text-sm"><code aria-hidden="true">{typedCode}<span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse align-middle bg-ink motion-reduce:animate-none" /></code></pre>
            </div>
          </div>
          <div className="relative mt-8 flex items-center gap-2 border-t border-ink/10 pt-4 text-[10px] font-medium text-ink-muted sm:text-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 text-ink" />
            Refunds require the creator to submit a cancellation transaction; they are not automatic.
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div
          className="rounded-3xl bg-lime border-2 border-ink p-10 md:p-14"
          style={{ boxShadow: '6px 6px 0px #0D0D0D' }}
        >
          <div className="space-y-5 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
              Ready to fund or claim a bounty?
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Post a scoped task for contributors, or find a bounty that fits your skills and claim it
              on Solana Devnet.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('create')}
                className="btn-black px-7 py-3.5 text-sm w-full sm:w-auto"
              >
                Fund a Bounty
              </button>
              <button
                onClick={() => onNavigate('explore')}
                className="btn-ghost px-7 py-3.5 text-sm w-full sm:w-auto"
              >
                Find a Bounty
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SecurityFeature: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <article className="rounded-2xl border-2 border-ink/10 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-brutal-sm lg:flex lg:items-start lg:gap-4">
    <span className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-lime text-ink lg:mb-0">
      {icon}
    </span>
    <div>
      <h3 className="text-sm font-black text-ink">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>
    </div>
  </article>
);
