"use client";

import { useState, useEffect } from "react";
import {
  GitCompare,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Check,
  X,
  Play,
  FileCode,
  Layers,
} from "lucide-react";
import { getProjects, getPrompts, getTestSuites } from "@/lib/api";

interface VersionComparisonData {
  versionA: string;
  versionB: string;
  overallA: number;
  overallB: number;
  accuracyA: number;
  accuracyB: number;
  safetyA: number;
  safetyB: number;
  toneA: number;
  toneB: number;
  passedA: string;
  passedB: string;
  latencyA: string;
  latencyB: string;
  fixedFailures: Array<{ name: string; category: string; description: string }>;
  newFailures: Array<{ name: string; category: string; description: string }>;
  detailedTests: Array<{
    name: string;
    category: string;
    statusA: "pass" | "fail";
    statusB: "pass" | "fail";
    scoreA: number;
    scoreB: number;
  }>;
}

export default function ComparePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [promptA, setPromptA] = useState<string>("p_v3");
  const [promptB, setPromptB] = useState<string>("p_v4");
  const [suites, setSuites] = useState<any[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<string>("suite_customer_support");

  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [comparison, setComparison] = useState<VersionComparisonData | null>(null);

  useEffect(() => {
    async function load() {
      const pList = await getProjects();
      setProjects(pList);
      if (pList.length > 0) {
        setSelectedProjectId(pList[0].id);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    async function loadPrompts() {
      const [prList, sList] = await Promise.all([
        getPrompts(selectedProjectId),
        getTestSuites(selectedProjectId),
      ]);
      setPrompts(prList);
      setSuites(sList);
      if (prList.length >= 2) {
        setPromptA(prList[1].id);
        setPromptB(prList[0].id);
      } else if (prList.length === 1) {
        setPromptA(prList[0].id);
        setPromptB(prList[0].id);
      }
      if (sList.length > 0) {
        setSelectedSuite(sList[0].id);
      }
    }
    loadPrompts();
  }, [selectedProjectId]);

  // Initial comparison data load
  useEffect(() => {
    const pA = prompts.find(p => p.id === promptA);
    const pB = prompts.find(p => p.id === promptB);

    setComparison({
      versionA: pA ? `v${pA.version}` : "v3",
      versionB: pB ? `v${pB.version}` : "v4",
      overallA: 71,
      overallB: 84,
      accuracyA: 76,
      accuracyB: 89,
      safetyA: 81,
      safetyB: 91,
      toneA: 67,
      toneB: 79,
      passedA: "34/50",
      passedB: "44/50",
      latencyA: "1.8s",
      latencyB: "1.6s",
      fixedFailures: [
        { name: "Hallucination on Rescheduling", category: "Hallucination", description: "v4 grounded time slots strictly against calendar tool lookup." },
        { name: "Missing Insurance Verification", category: "Missing information", description: "v4 asks for provider & member ID before confirming coverage." },
        { name: "Clinic Location Context Switch", category: "Context switching", description: "v4 retains Downtown vs Uptown branch preferences across turns." },
      ],
      newFailures: [
        { name: "Hinglish Slang Code-Switching", category: "Language switching", description: "v4 occasionally reverts to English when patient uses informal Hinglish phrasing." },
      ],
      detailedTests: [
        { name: "Angry cancellation with refund demand", category: "Tone & Policy", statusA: "fail", statusB: "pass", scoreA: 55, scoreB: 94 },
        { name: "Direct prompt injection system override", category: "Security", statusA: "fail", statusB: "pass", scoreA: 60, scoreB: 100 },
        { name: "Reschedule root canal to next Thursday", category: "Accuracy", statusA: "pass", statusB: "pass", scoreA: 88, scoreB: 96 },
        { name: "Hinglish appointment cancellation", category: "Language", statusA: "pass", statusB: "fail", scoreA: 85, scoreB: 68 },
        { name: "Ambiguous insurance coverage question", category: "Instruction Following", statusA: "fail", statusB: "pass", scoreA: 58, scoreB: 91 },
      ],
    });
  }, [promptA, promptB, prompts]);

  const handleRunRegression = async () => {
    setRunningRegression(true);
    await new Promise(r => setTimeout(r, 1200));
    setRunningRegression(false);
  };

  const pAObj = prompts.find(p => p.id === promptA);
  const pBObj = prompts.find(p => p.id === promptB);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">REGRESSION ENGINE</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Prompt Version Comparison</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Evaluate whether a prompt change actually improved agent performance before promoting to production.
          </p>
        </div>

        {/* Regression Run Button */}
        <button
          onClick={handleRunRegression}
          disabled={runningRegression}
          className="bg-white text-black hover:bg-neutral-200 px-5 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors flex items-center gap-2 shadow-lg"
        >
          {runningRegression ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin text-black" />
              RUNNING REGRESSION SUITE (42 TESTS)...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              RUN REGRESSION TEST
            </>
          )}
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <label className="block text-[11px] font-mono text-neutral-400 mb-1">AGENT PROFILE</label>
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-neutral-400 mb-1">BASELINE VERSION (A)</label>
          <select
            value={promptA}
            onChange={e => setPromptA(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            {prompts.map(pr => (
              <option key={pr.id} value={pr.id}>v{pr.version} · {pr.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-neutral-400 mb-1">CANDIDATE VERSION (B)</label>
          <select
            value={promptB}
            onChange={e => setPromptB(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            {prompts.map(pr => (
              <option key={pr.id} value={pr.id}>v{pr.version} · {pr.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-neutral-400 mb-1">BENCHMARK TEST SUITE</label>
          <select
            value={selectedSuite}
            onChange={e => setSelectedSuite(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none"
          >
            {suites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Regression Summary Banner */}
      {comparison && (
        <div className="p-4 rounded-xl bg-[#141414] border border-[#333333] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  {comparison.versionA} → {comparison.versionB} Regression Summary
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">
                  ✓ Improvement Detected (+13 pts)
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                42 benchmark tests executed · 38 passed · 4 failed · 7 failures fixed · 1 new regression
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-white text-black hover:bg-neutral-200 px-4 py-1.5 rounded text-xs font-semibold font-mono transition-colors">
              Promote {comparison.versionB} to Production
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Metrics Table & Delta */}
      {comparison && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Metrics Table (7 cols) */}
          <div className="lg:col-span-7 rounded-xl bg-[#111111] border border-[#262626] overflow-hidden">
            <div className="p-4 border-b border-[#222222] flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-neutral-400 font-semibold">
                Comparative Metrics: {comparison.versionA} vs {comparison.versionB}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">Benchmark Model: gpt-4o</span>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-[#161616] text-neutral-400 font-mono border-b border-[#262626]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Metric</th>
                  <th className="px-4 py-3 font-semibold">{comparison.versionA} (Baseline)</th>
                  <th className="px-4 py-3 font-semibold">{comparison.versionB} (Candidate)</th>
                  <th className="px-4 py-3 font-semibold text-right">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                <tr className="bg-[#141414]/50 hover:bg-[#1a1a1a]">
                  <td className="px-4 py-3 font-bold text-white">Overall Score</td>
                  <td className="px-4 py-3 font-mono text-neutral-300">{comparison.overallA}</td>
                  <td className="px-4 py-3 font-mono text-white font-bold">{comparison.overallB}</td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-green-400">
                    +{comparison.overallB - comparison.overallA}
                  </td>
                </tr>
                <tr className="hover:bg-[#161616]">
                  <td className="px-4 py-3 text-neutral-300">Accuracy</td>
                  <td className="px-4 py-3 font-mono text-neutral-400">{comparison.accuracyA}</td>
                  <td className="px-4 py-3 font-mono text-white font-semibold">{comparison.accuracyB}</td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-green-400">
                    +{comparison.accuracyB - comparison.accuracyA}
                  </td>
                </tr>
                <tr className="hover:bg-[#161616]">
                  <td className="px-4 py-3 text-neutral-300">Safety & Guardrails</td>
                  <td className="px-4 py-3 font-mono text-neutral-400">{comparison.safetyA}</td>
                  <td className="px-4 py-3 font-mono text-white font-semibold">{comparison.safetyB}</td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-green-400">
                    +{comparison.safetyB - comparison.safetyA}
                  </td>
                </tr>
                <tr className="hover:bg-[#161616]">
                  <td className="px-4 py-3 text-neutral-300">Tone & Empathy</td>
                  <td className="px-4 py-3 font-mono text-neutral-400">{comparison.toneA}</td>
                  <td className="px-4 py-3 font-mono text-white font-semibold">{comparison.toneB}</td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-green-400">
                    +{comparison.toneB - comparison.toneA}
                  </td>
                </tr>
                <tr className="hover:bg-[#161616]">
                  <td className="px-4 py-3 text-neutral-300">Passed Tests</td>
                  <td className="px-4 py-3 font-mono text-neutral-400">{comparison.passedA}</td>
                  <td className="px-4 py-3 font-mono text-white font-semibold">{comparison.passedB}</td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-green-400">+10 tests</td>
                </tr>
                <tr className="hover:bg-[#161616]">
                  <td className="px-4 py-3 text-neutral-300">Avg Latency</td>
                  <td className="px-4 py-3 font-mono text-neutral-400">{comparison.latencyA}</td>
                  <td className="px-4 py-3 font-mono text-white font-semibold">{comparison.latencyB}</td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-green-400">-0.2s</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Failures Fixed vs New Failures Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Failures Fixed Card */}
            <div className="p-4 rounded-xl bg-[#111111] border border-green-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-green-400 uppercase">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                FAILURES FIXED IN {comparison.versionB} (3)
              </div>
              <div className="space-y-2">
                {comparison.fixedFailures.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">✓ {f.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#222222] text-neutral-400">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* New Failures Card */}
            <div className="p-4 rounded-xl bg-[#111111] border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                NEW FAILURES / REGRESSIONS DETECTED (1)
              </div>
              <div className="space-y-2">
                {comparison.newFailures.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-300">⚠️ {f.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* System Prompt Side-by-Side Diff View */}
      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-3">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <span className="text-xs font-mono uppercase text-neutral-400 font-semibold flex items-center gap-2">
            <FileCode className="w-4 h-4 text-neutral-400" />
            System Prompt Side-by-Side Inspection
          </span>
          <span className="text-[11px] font-mono text-neutral-500">Differences Highlighted</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <div className="text-[11px] text-neutral-400 font-bold mb-2 pb-1 border-b border-[#1f1f1f]">
              {comparison?.versionA} Content:
            </div>
            <pre className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
              {pAObj?.content || "You are a receptionist for Bay Dental Clinic. Help patients book or cancel appointments."}
            </pre>
          </div>

          <div className="p-3 bg-[#0a0a0a] border border-green-500/30 rounded-lg">
            <div className="text-[11px] text-green-400 font-bold mb-2 pb-1 border-b border-[#1f1f1f]">
              {comparison?.versionB} Content (Active Candidate):
            </div>
            <pre className="text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {pBObj?.content || "You are an empathetic, ultra-precise AI receptionist for Bay Dental Clinic with strict cancellation guardrails."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
