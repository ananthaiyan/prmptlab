
"use client";

import Link from "next/link";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Activity,
  AudioLines,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Code2,
  FlaskConical,
  GitCompare,
  Layers3,
  Menu,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    number: "01",
    icon: Play,
    title: "Prompt Playground",
    description:
      "Experiment with system prompts, compare model outputs, and validate behavior with custom assertions.",
    tags: ["Multi-model", "Live evaluation"],
    glow: "group-hover:text-violet-300",
  },
  {
    number: "02",
    icon: GitCompare,
    title: "Regression Testing",
    description:
      "Compare prompt versions against the same dataset. Catch quality regressions before they reach production.",
    tags: ["Diff analysis", "Version history"],
    glow: "group-hover:text-cyan-300",
  },
  {
    number: "03",
    icon: AudioLines,
    title: "Voice Agent Testing",
    description:
      "Simulate multi-turn conversations, interruptions, code-switching, and latency-sensitive voice workflows.",
    tags: ["Telephony", "Multi-turn"],
    glow: "group-hover:text-pink-300",
  },
  {
    number: "04",
    icon: FlaskConical,
    title: "Evaluation Suites",
    description:
      "Build reusable test datasets for RAG pipelines, customer support agents, and complex AI workflows.",
    tags: ["Custom datasets", "Assertions"],
    glow: "group-hover:text-amber-300",
  },
  {
    number: "05",
    icon: Activity,
    title: "Quality Intelligence",
    description:
      "Track accuracy, latency, and task completion across runs to understand where your agents fail.",
    tags: ["Metrics", "Run history"],
    glow: "group-hover:text-emerald-300",
  },
  {
    number: "06",
    icon: ShieldCheck,
    title: "Adversarial Testing",
    description:
      "Probe your agents for prompt injection, jailbreaks, unsafe outputs, and instruction-following failures.",
    tags: ["Red teaming", "Safety"],
    glow: "group-hover:text-rose-300",
  },
];

const tests = [
  { name: "Instruction adherence", category: "Behavior", status: "Passed" },
  { name: "Hallucination detection", category: "Accuracy", status: "Passed" },
  { name: "Prompt injection", category: "Security", status: "Passed" },
  { name: "Multi-turn consistency", category: "Conversation", status: "Failed" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" as const },
  },
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reducedMotion ? 0 : 0.7,
        delay: reducedMotion ? 0 : delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function ProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.45, ease: "easeOut" }}
      className="relative mx-auto mt-16 w-full max-w-5xl"
    >
      <div className="absolute -inset-6 rounded-[32px] bg-violet-500/[0.09] blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0a0b11]/95 text-left shadow-[0_30px_100px_-30px_rgba(99,102,241,0.3)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <span className="hidden text-xs text-neutral-500 sm:inline">
              prmptlab / evaluations / latest-run
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1.5 text-[10px] font-medium text-emerald-300 sm:text-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Evaluation complete
          </div>
        </div>

        <div className="grid md:grid-cols-[190px_1fr]">
          <aside className="hidden border-r border-white/[0.07] p-4 md:block">
            <div className="mb-7 flex items-center gap-2 text-sm font-semibold text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600">
                <Sparkles className="h-4 w-4" />
              </div>
              Workspace
            </div>

            <div className="space-y-1 text-xs">
              {[
                [Layers3, "Overview"],
                [Play, "Playground"],
                [FlaskConical, "Test suites"],
                [GitCompare, "Comparisons"],
                [Activity, "Analytics"],
              ].map(([Icon, label], i) => {
                const ItemIcon = Icon as typeof Layers3;
                return (
                  <div
                    key={label as string}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 ${i === 2
                      ? "border border-violet-400/15 bg-violet-400/[0.1] text-violet-200"
                      : "text-neutral-500"
                      }`}
                  >
                    <ItemIcon className="h-4 w-4" />
                    {label as string}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] text-neutral-400">
                <Code2 className="h-3.5 w-3.5" />
                Current version
              </div>
              <div className="font-mono text-xs text-white">system-v2.4</div>
              <div className="mt-2 text-[10px] text-neutral-600">
                Last updated just now
              </div>
            </div>
          </aside>

          <div className="min-w-0 p-4 sm:p-6 md:p-7">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-1 text-xs text-neutral-500">
                  EVALUATION OVERVIEW
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                  Customer Support Agent
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Regression suite · 120 test cases · Run #0842
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-300">
                <Clock3 className="h-3.5 w-3.5" />
                1.42s avg
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: "PASS RATE",
                  value: "96.7%",
                  delta: "+4.2%",
                  icon: TrendingUp,
                },
                {
                  label: "TEST CASES",
                  value: "120",
                  delta: "4 failed",
                  icon: FlaskConical,
                },
                {
                  label: "AVG LATENCY",
                  value: "1.42s",
                  delta: "-180ms",
                  icon: Zap,
                },
                {
                  label: "SAFETY SCORE",
                  value: "98/100",
                  delta: "Within target",
                  icon: ShieldCheck,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-1">
                    <span className="text-[9px] tracking-wider text-neutral-500 sm:text-[10px]">
                      {stat.label}
                    </span>
                    <stat.icon className="h-3.5 w-3.5 text-neutral-500" />
                  </div>
                  <div className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {stat.value}
                  </div>
                  <div
                    className={`mt-1 text-[10px] ${i === 1 ? "text-amber-300" : "text-emerald-400"
                      }`}
                  >
                    {stat.delta}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_190px]">
              <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.015] p-3 sm:p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-300">
                    Test execution
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Latest run
                  </span>
                </div>

                <div className="space-y-3">
                  {tests.map((test, i) => (
                    <motion.div
                      key={test.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.12 }}
                      className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${test.status === "Passed"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-amber-400/10 text-amber-300"
                            }`}
                        >
                          {test.status === "Passed" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <CircleDot className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs text-neutral-200">
                            {test.name}
                          </div>
                          <div className="mt-0.5 text-[10px] text-neutral-600">
                            {test.category}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] ${test.status === "Passed"
                          ? "text-emerald-400"
                          : "text-amber-300"
                          }`}
                      >
                        {test.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4">
                <div className="mb-4 text-xs font-medium text-neutral-300">
                  Quality trend
                </div>
                <div className="flex h-24 items-end gap-1.5">
                  {[48, 57, 52, 68, 63, 76, 72, 84, 79, 92, 88, 97].map(
                    (height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{
                          delay: 1.1 + i * 0.045,
                          duration: 0.5,
                          ease: "easeOut",
                        }}
                        className={`flex-1 rounded-t-sm ${i === 11
                          ? "bg-violet-400"
                          : "bg-gradient-to-t from-indigo-500/30 to-violet-400/70"
                          }`}
                      />
                    ),
                  )}
                </div>
                <div className="mt-3 flex justify-between text-[9px] text-neutral-600">
                  <span>Earlier</span>
                  <span>Latest</span>
                </div>
                <div className="mt-5 border-t border-white/[0.07] pt-4">
                  <div className="text-[10px] text-neutral-500">
                    Quality improvement
                  </div>
                  <div className="mt-1 text-xl font-semibold text-emerald-400">
                    +12.8%
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-600">
                    Across recent runs
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-lg border border-violet-400/15 bg-violet-400/[0.05] px-3 py-3 text-[10px] leading-relaxed text-neutral-400 sm:text-xs">
              <Sparkles className="h-4 w-4 shrink-0 text-violet-300" />
              <span>
                <span className="font-medium text-violet-200">
                  Evaluation insight:
                </span>{" "}
                Multi-turn consistency needs attention before the next release.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 -z-10 h-20 w-3/4 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
    </motion.div>
  );
}

export default function LandingPage() {
  const reducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070b] text-white selection:bg-violet-500/30">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={
            reducedMotion
              ? {}
              : {
                x: [0, 35, -20, 0],
                y: [0, -25, 20, 0],
                scale: [1, 1.12, 0.96, 1],
              }
          }
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-64 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/[0.14] blur-[130px]"
        />
        <motion.div
          animate={
            reducedMotion
              ? {}
              : { x: [0, 25, 0], y: [0, 40, 0] }
          }
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-250px] top-[550px] h-[450px] w-[450px] rounded-full bg-blue-600/[0.09] blur-[120px]"
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 75%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 75%)",
          }}
        />
      </div>

      {/* Navigation */}
      <header className="relative z-20 border-b border-white/[0.07]">
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-400/20 to-indigo-500/10 shadow-lg shadow-violet-500/10 transition duration-300 group-hover:border-violet-400/40">
              <Sparkles className="h-[18px] w-[18px] text-violet-200" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              prmptlab<span className="text-violet-400">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              How it works
            </a>
            <Link
              href="/pricing"
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/pricing"
              className="text-sm text-neutral-300 transition hover:text-white"
            >
              View pricing
            </Link>
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-1.5 transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button className="group flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition duration-200 hover:bg-violet-100">
                Get started
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </SignUpButton>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-neutral-300 sm:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/[0.08] bg-[#0b0b12] p-5 sm:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-5">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-neutral-300"
              >
                Features
              </a>
              <a
                href="#workflow"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-neutral-300"
              >
                How it works
              </a>
              <Link
                href="/pricing"
                className="text-sm text-neutral-300"
              >
                Pricing
              </Link>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="w-full text-left text-sm text-neutral-300 py-1">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black">
                  Get started free <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:pb-32 lg:pt-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-center"
        >
          <motion.div variants={itemVariants}>
            <div className="group inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.035] px-3 py-2 text-[10px] text-neutral-300 shadow-[0_0_30px_rgba(139,92,246,0.07)] backdrop-blur-xl transition hover:border-violet-400/30 sm:text-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>AI agent evaluation, built for developers</span>
              <ChevronRight className="h-3 w-3 text-neutral-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mx-auto mt-8 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-[-0.055em] sm:text-6xl lg:text-[76px]"
          >
            Ship better AI agents.
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-indigo-300 to-cyan-200 bg-clip-text text-transparent">
              Not just better prompts.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8"
          >
            Your AI agents change with every prompt, model, and tool.
            Evaluate every change, catch regressions, and ship with confidence
            — before your users find the failures.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_35px_rgba(167,139,250,0.13)] transition duration-300 hover:-translate-y-0.5 hover:bg-violet-100 sm:w-auto">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-200/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Start testing free</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </SignUpButton>
            <Link
              href="/pricing"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.035] px-6 py-3.5 text-sm font-medium text-neutral-300 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07] hover:text-white sm:w-auto"
            >
              Explore plans
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-neutral-500"
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Built for AI teams
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Repeatable evaluations
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Regression visibility
            </span>
          </motion.div>
        </motion.div>

        <ProductPreview />
      </section>

      {/* Value proposition strip */}
      <section className="relative border-y border-white/[0.07] bg-white/[0.015] px-5 py-7 sm:px-8">
        <Reveal className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs leading-6 text-neutral-500 sm:text-sm">
            Built for teams developing{" "}
            <span className="text-neutral-300">
              production-grade AI applications.
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-neutral-500 sm:gap-7">
            <span className="flex items-center gap-2 text-xs">
              <Terminal className="h-4 w-4" /> LLM apps
            </span>
            <span className="flex items-center gap-2 text-xs">
              <AudioLines className="h-4 w-4" /> Voice agents
            </span>
            <span className="flex items-center gap-2 text-xs">
              <Layers3 className="h-4 w-4" /> RAG systems
            </span>
          </div>
        </Reveal>
      </section>

      {/* Features */}
      <section id="features" className="relative px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-violet-300 uppercase">
              <span className="h-px w-5 bg-violet-400" />
              The evaluation stack
              <span className="h-px w-5 bg-violet-400" />
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Quality isn't a guess.
              <br />
              <span className="text-neutral-500">
                Make it measurable.
              </span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-neutral-400 sm:text-base">
              Everything you need to understand, test, and improve the
              behavior of your AI agents in one workflow.
            </p>
          </Reveal>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                variants={itemVariants}
                key={feature.number}
                className="group relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.045] to-white/[0.01] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:from-violet-400/[0.07] hover:to-white/[0.015] hover:shadow-[0_20px_60px_-30px_rgba(139,92,246,0.18)] sm:p-7"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/0 blur-3xl transition duration-500 group-hover:bg-violet-500/15" />

                <div className="relative mb-7 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04] transition duration-300 group-hover:border-violet-400/20 group-hover:bg-violet-400/10">
                    <feature.icon
                      className={`h-5 w-5 text-neutral-300 transition-colors ${feature.glow}`}
                    />
                  </div>
                  <span className="font-mono text-xs text-neutral-700">
                    {feature.number}
                  </span>
                </div>

                <h3 className="relative text-base font-semibold tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="relative mt-3 flex-1 text-sm leading-6 text-neutral-400">
                  {feature.description}
                </p>

                <div className="relative mt-6 flex flex-wrap gap-2">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-white/[0.07] bg-black/20 px-2 py-1 text-[10px] text-neutral-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow */}
      <section
        id="workflow"
        className="relative border-y border-white/[0.07] bg-white/[0.015] px-5 py-24 sm:px-8 lg:py-28"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-violet-300 uppercase">
              <Zap className="h-4 w-4" />
              From change to confidence
            </div>
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Every prompt change
              <br />
              <span className="text-neutral-500">
                deserves a test run.
              </span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-400 sm:text-base">
              Stop manually checking outputs and hoping nothing broke.
              Create a repeatable evaluation loop that gives your team
              evidence before deployment.
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  n: "01",
                  title: "Define your baseline",
                  text: "Save a prompt version and create representative test cases.",
                },
                {
                  n: "02",
                  title: "Run your evaluations",
                  text: "Execute the suite against your agent and score its outputs.",
                },
                {
                  n: "03",
                  title: "Compare and improve",
                  text: "Review failures, investigate changes, and iterate with confidence.",
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/[0.07] font-mono text-[10px] text-violet-300">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs leading-6 text-neutral-500 sm:text-sm">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0b11] p-5 shadow-[0_30px_80px_-35px_rgba(99,102,241,0.2)] sm:p-7">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/[0.12] blur-3xl" />
              <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <div className="text-xs text-neutral-500">
                    PROMPT COMPARISON
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    Version 2.3 vs 2.4
                  </div>
                </div>
                <GitCompare className="h-5 w-5 text-violet-300" />
              </div>

              <div className="relative mt-6 space-y-5">
                {[
                  {
                    name: "Task completion",
                    old: "88%",
                    current: "96%",
                    width: "96%",
                    color: "bg-violet-400",
                  },
                  {
                    name: "Instruction adherence",
                    old: "84%",
                    current: "94%",
                    width: "94%",
                    color: "bg-indigo-400",
                  },
                  {
                    name: "Safety checks",
                    old: "95%",
                    current: "98%",
                    width: "98%",
                    color: "bg-emerald-400",
                  },
                ].map((metric, i) => (
                  <div key={metric.name}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-neutral-400">
                        {metric.name}
                      </span>
                      <span className="text-[10px] text-emerald-300">
                        {metric.old} → {metric.current}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: metric.width }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1,
                          delay: 0.2 + i * 0.15,
                          ease: "easeOut",
                        }}
                        className={`h-full rounded-full ${metric.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-7 flex items-start gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045] p-4">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div>
                  <div className="text-xs font-medium text-emerald-300">
                    Improvement detected
                  </div>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    The new prompt improves task completion across this
                    illustrative evaluation set.
                  </p>
                </div>
              </div>

              <p className="relative mt-4 text-[10px] text-neutral-600">
                Illustrative data for demonstration purposes.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-5 py-24 sm:px-8 lg:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.12] blur-[100px]" />

        <Reveal className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.08] shadow-[0_0_40px_rgba(139,92,246,0.12)]">
            <Sparkles className="h-5 w-5 text-violet-300" />
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Your next release
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-indigo-300 to-cyan-200 bg-clip-text text-transparent">
              starts with confidence.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
            Build a repeatable quality workflow for your AI agents.
            Test the changes. Understand the failures. Ship with confidence.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-violet-100">
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </SignUpButton>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.025] px-6 py-3.5 text-sm text-neutral-300 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
            >
              View pricing
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}

      <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#08080d]">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-72 w-72 rounded-full bg-violet-600/[0.08] blur-[100px]" />
        <div className="pointer-events-none absolute -top-40 right-1/4 h-72 w-72 rounded-full bg-blue-500/[0.06] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          {/* Main footer */}
          <div className="grid gap-12 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
            {/* Brand */}
            <div className="max-w-sm">
              <Link href="/" className="group inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-400/20 to-blue-500/10 shadow-[0_0_25px_rgba(139,92,246,0.08)] transition duration-300 group-hover:border-violet-400/40">
                  <Sparkles className="h-5 w-5 text-violet-300" />
                </div>
                <span className="text-xl font-semibold tracking-tight text-white">
                  prmptlab<span className="text-violet-400">.</span>
                </span>
              </Link>

              <p className="mt-5 text-sm leading-7 text-neutral-400">
                The evaluation layer for AI applications.
                Test prompts, measure agent quality, and catch
                regressions before they reach production.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs text-neutral-400">
                  Built for the AI development lifecycle
                </span>
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-white">Product</h3>
              <ul className="mt-5 space-y-3.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#workflow" },
                  { label: "Pricing", href: "/pricing" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-neutral-500 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-sm font-semibold text-white">Capabilities</h3>
              <ul className="mt-5 space-y-3.5">
                {[
                  "Prompt testing",
                  "Regression evaluation",
                  "Voice agent testing",
                  "Red teaming",
                ].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-neutral-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get started */}
            <div>
              <h3 className="text-sm font-semibold text-white">Get started</h3>
              <p className="mt-5 text-sm leading-6 text-neutral-500">
                Build a repeatable testing workflow for your AI agents.
              </p>

              <div className="mt-5">
                <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="group inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition duration-200 hover:-translate-y-0.5 hover:bg-violet-100">
                    Start testing
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </SignUpButton>
              </div>

              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-neutral-500 transition hover:text-neutral-300"
              >
                Explore plans <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Gradient divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

          {/* Bottom bar */}
          <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-600">
              © {new Date().getFullYear()} prmptlab. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-xs text-neutral-600">
                Built for teams that take AI quality seriously.
              </span>
              <Link
                href="/pricing"
                className="text-xs text-neutral-500 transition hover:text-white"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
