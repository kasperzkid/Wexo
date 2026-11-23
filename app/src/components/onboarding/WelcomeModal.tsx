import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CircleDollarSign,
  Compass,
  ShieldCheck,
  Sparkles,
  LoaderCircle,
  LockKeyhole,
  Code2,
  Palette,
  CircleCheck,
  WalletCards,
} from 'lucide-react';

type Audience = 'company' | 'hunter';

interface WelcomeModalProps {
  onChoose: (audience: Audience) => void;
  onSkip: () => void;
}

const STEPS = [
  {
    eyebrow: 'WELCOME TO TASKVAULT',
    title: 'Good work deserves a clear reward.',
    description:
      'TaskVault connects teams with builders through scoped bounties and transparent Solana escrow.',
  },
  {
    eyebrow: 'HOW IT WORKS',
    title: 'A simple path from task to payout.',
    description:
      'The bounty is funded before work starts. The contributor submits a deliverable, and the creator reviews it before the escrow releases payment.',
  },
];

export const WelcomePage: React.FC<WelcomeModalProps> = ({ onChoose, onSkip }) => {
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState<Audience | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingLeaving, setLoadingLeaving] = useState(false);
  const onChooseRef = useRef(onChoose);
  onChooseRef.current = onChoose;

  useEffect(() => {
    if (!loading || !showLoading) return;
    const leaveTimer = window.setTimeout(() => setLoadingLeaving(true), 1500);
    const finishTimer = window.setTimeout(() => onChooseRef.current(loading), 1780);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
    };
  }, [loading, showLoading]);

  const changeStep = (nextStep: number) => {
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setStep(nextStep);
      setTransitioning(false);
    }, 380);
  };

  const chooseAudience = (audience: Audience) => {
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setLoading(audience);
      setShowLoading(true);
    }, 380);
  };

  if (loading && showLoading) {
    return (
      <main className={`onboarding-enter flex h-screen w-full items-center justify-center bg-white px-6 text-center text-ink ${loadingLeaving ? 'onboarding-loading-out' : ''}`}>
        <section aria-live="polite" className="max-w-sm">
          <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-ink bg-lime shadow-brutal">
            <LoaderCircle className="h-12 w-12 animate-spin" strokeWidth={1.8} />
            <Sparkles className="absolute -right-3 -top-3 h-8 w-8 animate-pulse text-ink" />
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Just a little more patience</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">We’re getting your TaskVault experience ready.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="onboarding-enter flex h-screen w-full items-center overflow-hidden bg-white px-3 py-3 text-ink sm:px-6 sm:py-4">
      <section aria-labelledby="welcome-title" className="mx-auto flex h-full w-full max-w-[1600px] flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-ink/10 px-4 py-2 sm:px-7 sm:py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink bg-lime">
              <ShieldCheck className="h-4 w-4 text-ink" />
            </span>
            <span className="text-xs font-black tracking-wide text-ink">TASKVAULT QUICK START</span>
          </div>
          <button
            onClick={onSkip}
            className="group inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-bold text-ink-muted shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-ink hover:bg-paper-gray hover:text-ink hover:shadow-brutal-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2"
          >
            Skip intro
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-7 sm:py-4 lg:px-10">
          <div className={`onboarding-content min-h-0 flex-1 ${step < 2 ? 'grid grid-cols-1 gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8' : 'flex items-center justify-center'} ${transitioning ? 'onboarding-content-out' : 'onboarding-content-in'}`}>
          {step < 2 ? (
            <>
            <div key={step} className={`flex min-h-0 flex-col justify-center py-1 lg:py-4 ${step === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-ink-muted">
                {STEPS[step].eyebrow}
              </p>
              <h1 id="welcome-title" className="max-w-xl text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
                {STEPS[step].title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                {STEPS[step].description}
              </p>

              {step === 0 ? (
                <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                  <Feature icon={<Compass className="h-5 w-5" />} title="Find the right work" text="Browse open tasks by skill, category, and reward." />
                  <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Know the terms" text="See the scope, deadline, and payout before you start." />
                  <Feature icon={<CircleDollarSign className="h-5 w-5" />} title="Escrow-backed" text="The creator funds the bounty before work begins." />
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                  <FlowCard number="01" title="Post & fund" text="A company publishes a task and deposits its reward." />
                  <FlowCard number="02" title="Build & submit" text="A contributor claims the task and sends in their work." />
                  <FlowCard number="03" title="Review & pay" text="The creator approves the result and escrow pays out." />
                </div>
              )}
            </div>
            <OnboardingSidePanel step={step} />
            </>
          ) : (
            <div key="audience" className="mx-auto w-full max-w-4xl">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <AudienceCard
                  icon={<BriefcaseBusiness className="h-5 w-5" />}
                  title="I’m with a company or team"
                  description="Post a bounty, fund it in escrow, and review submitted work."
                  action="Create a bounty"
                  onClick={() => chooseAudience('company')}
                />
                <AudienceCard
                  icon={<Compass className="h-5 w-5" />}
                  title="I’m a bounty hunter or builder"
                  description="Find scoped tasks, contribute your skills, and earn rewards."
                  action="Explore bounties"
                  onClick={() => chooseAudience('hunter')}
                />
              </div>
            </div>
          )}
          </div>

          {step < 2 && (
            <div className="mt-auto flex shrink-0 items-center justify-between border-t border-ink/10 pt-3">
              {step === 1 ? (
                <button onClick={() => changeStep(0)} className="btn-ghost rounded-lg px-3 py-2 text-xs">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              ) : <span />}
              <button onClick={() => changeStep(step + 1)} className="btn-lime rounded-lg px-5 py-3 text-sm shadow-brutal-sm">
                {step === 0 ? 'See how it works' : 'Choose your role'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="mt-3 flex shrink-0 justify-center" aria-label={`Step ${step + 1} of 3`}>
            <div className="flex w-16 items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <span
                  key={item}
                  className={`h-1 flex-1 rounded-full transition-colors ${item <= step ? 'bg-ink' : 'bg-ink/15'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="brutalist-card-hover min-w-0 rounded-xl border-2 border-ink bg-paper-gray p-2.5 sm:rounded-2xl sm:p-4">
    <span className="onboarding-icon mb-2 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink bg-lime sm:mb-3 sm:h-10 sm:w-10">{icon}</span>
    <h2 className="text-[10px] font-black leading-tight text-ink sm:text-sm">{title}</h2>
    <p className="mt-1 hidden text-xs leading-relaxed text-ink-muted sm:block">{text}</p>
  </div>
);

const FlowCard: React.FC<{ number: string; title: string; text: string }> = ({ number, title, text }) => (
  <div className="brutalist-card-hover min-w-0 rounded-xl border-2 border-ink bg-white p-2.5 sm:rounded-2xl sm:p-4">
    <span className="font-mono text-[10px] font-black text-ink-muted sm:text-xs">{number}</span>
    <h2 className="mt-2 text-[10px] font-black leading-tight text-ink sm:text-sm">{title}</h2>
    <p className="mt-1 hidden text-xs leading-relaxed text-ink-muted sm:block">{text}</p>
  </div>
);

const AudienceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}> = ({ icon, title, description, action, onClick }) => (
  <button
    onClick={onClick}
    className="group min-w-0 rounded-2xl border-2 border-ink bg-white p-3 text-left shadow-brutal transition hover:-translate-y-1 hover:shadow-brutal-lg sm:p-6"
  >
    <span className="onboarding-icon mb-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-lime text-ink sm:mb-3 sm:h-12 sm:w-12">{icon}</span>
    <span className="block text-xs font-black leading-tight text-ink sm:text-base">{title}</span>
    <span className="mt-1 block text-[10px] leading-snug text-ink-muted sm:mt-2 sm:text-xs">{description}</span>
    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-ink sm:mt-4 sm:gap-2 sm:text-xs">
      {action} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
    </span>
  </button>
);

const OnboardingSidePanel: React.FC<{ step: number }> = ({ step }) => (
  <aside className={`onboarding-side relative hidden min-h-0 overflow-hidden rounded-3xl border-2 border-ink bg-paper-gray p-5 sm:p-7 lg:flex lg:flex-col lg:justify-center ${step === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
    {step === 0 ? (
      <div className="relative mx-auto w-full max-w-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ink-muted">THE TASKVAULT BOARD</p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">Work worth doing.</h2>
          </div>
          <span className="rounded-full border-2 border-ink bg-lime px-3 py-1.5 text-[10px] font-black">OPEN BOUNTIES</span>
        </div>
        <div className="onboarding-board-card relative z-10 rounded-2xl border-2 border-ink bg-white p-4 shadow-brutal sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-lime"><Code2 className="h-5 w-5" /></span>
              <div>
                <h3 className="text-sm font-black sm:text-base">Build a contributor dashboard</h3>
                <p className="mt-1 text-xs text-ink-muted">Frontend · React · TypeScript</p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg border border-ink px-2 py-1 text-xs font-black">1.8 SOL</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-ink-muted"><LockKeyhole className="h-3.5 w-3.5" /> Reward held in escrow</span>
            <span className="rounded-md bg-paper-gray px-2 py-1 text-[9px] font-black">VIEW TASK <ArrowRight className="ml-1 inline h-3 w-3" /></span>
          </div>
        </div>
        <div className="onboarding-board-card relative z-0 -mt-2 ml-6 mr-3 rounded-2xl border-2 border-ink bg-lime p-4 sm:ml-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink bg-white"><Palette className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="text-xs font-black">Design a DeFi project landing page</p>
              <p className="mt-1 text-[10px] font-medium">Product design · UI/UX</p>
            </div>
            <span className="text-xs font-black">3.2 SOL</span>
          </div>
        </div>
        <div className="absolute -right-2 top-16 z-20 flex h-14 w-14 rotate-6 items-center justify-center rounded-2xl border-2 border-ink bg-white shadow-brutal"><CircleDollarSign className="h-7 w-7" /></div>
        <p className="mt-5 text-center text-xs font-medium text-ink-muted">Clear scopes. Real rewards. Work you can prove.</p>
      </div>
    ) : (
      <div className="mx-auto w-full max-w-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ink-muted">A TRANSPARENT PROCESS</p>
        <h2 className="mt-1 text-xl font-black sm:text-2xl">Every step is clear.</h2>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-ink-muted">Bounties are funded before work begins, so expectations and rewards stay visible from start to finish.</p>
        <div className="mt-7 space-y-3">
          <ProcessStep icon={<WalletCards className="h-5 w-5" />} number="01" title="The reward is secured" detail="The company funds the bounty in Solana escrow." />
          <ProcessStep icon={<Code2 className="h-5 w-5" />} number="02" title="The builder delivers" detail="The contributor completes the scope and submits their work." />
          <ProcessStep icon={<CircleCheck className="h-5 w-5" />} number="03" title="The work is reviewed" detail="Approval releases the reward to the contributor." />
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-xl border-2 border-ink bg-lime p-3 text-xs font-black"><ShieldCheck className="h-4 w-4 shrink-0" /> Milestones and payout terms stay visible.</div>
      </div>
    )}
  </aside>
);

const ProcessStep: React.FC<{ icon: React.ReactNode; number: string; title: string; detail: string }> = ({ icon, number, title, detail }) => (
  <div className="flex items-center gap-3 rounded-xl border-2 border-ink bg-white p-3 shadow-brutal-sm">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-lime">{icon}</span>
    <span className="w-6 shrink-0 font-mono text-[10px] font-black text-ink-muted">{number}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-xs font-black">{title}</span>
      <span className="mt-0.5 block text-[10px] leading-relaxed text-ink-muted">{detail}</span>
    </span>
    <ArrowRight className="h-4 w-4 shrink-0" />
  </div>
);
