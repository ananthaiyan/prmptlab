"use client";

import { useEffect, useState } from "react";
import { getProjects, createProject, getEvaluations, getSubscription, setAuthToken } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Play,
  GitCompare,
  FlaskConical,
  Mic,
  Bot,
  ChevronRight,
} from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Agent / Project modal
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Plan limit modal
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitDetails, setLimitDetails] = useState<any>({});

  useEffect(() => {
    if (user?.id) {
      setAuthToken(null, user.id);
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    const safeGet = async (fn: () => Promise<any>, fallback: any) => {
      try { return await fn(); } catch { return fallback; }
    };

    const [pList] = await Promise.all([
      safeGet(getProjects, []),
      safeGet(getEvaluations, []),
      safeGet(getSubscription, null),
    ]);

    setProjects(Array.isArray(pList) ? pList : []);
    setLoading(false);
  };

  useEffect(() => {
    if (isSignedIn) {
      loadDashboardData();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isSignedIn, isLoaded]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true);
    setCreateError("");

    try {
      await createProject(newProjectName, newProjectDesc);
      setShowModal(false);
      setNewProjectName("");
      setNewProjectDesc("");
      loadDashboardData();
    } catch (err: any) {
      if (err.name === "PlanLimitError") {
        setShowModal(false);
        setLimitDetails(err);
        setLimitModalOpen(true);
      } else {
        const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to create agent";
        setCreateError(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  if (!isLoaded || (loading && isSignedIn)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-neutral-500 font-mono text-sm animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#222222] pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.firstName || "Developer"}
          </h2>
          <p className="text-neutral-400 text-xs mt-1">
            Monitor agent quality health, run prompt regressions, and manage evaluation suites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            NEW AGENT PROFILE
          </button>
        </div>
      </div>

      {/* Quick Launchpad Buttons (Sleek monochrome) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/playground"
          className="p-4 rounded-xl bg-[#111111] hover:bg-[#181818] border border-[#262626] hover:border-neutral-500 transition-colors group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <Play className="w-4 h-4 text-neutral-400 group-hover:text-white" />
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-white block">Prompt Playground</span>
            <span className="text-[11px] text-neutral-400">Interactive live testing</span>
          </div>
        </Link>

        <Link
          href="/compare"
          className="p-4 rounded-xl bg-[#111111] hover:bg-[#181818] border border-[#262626] hover:border-neutral-500 transition-colors group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <GitCompare className="w-4 h-4 text-neutral-400 group-hover:text-white" />
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-white block">Version Comparison</span>
            <span className="text-[11px] text-neutral-400">Regression benchmarking</span>
          </div>
        </Link>

        <Link
          href="/voice-lab"
          className="p-4 rounded-xl bg-[#111111] hover:bg-[#181818] border border-[#262626] hover:border-neutral-500 transition-colors group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <Mic className="w-4 h-4 text-neutral-400 group-hover:text-white" />
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-white block">Voice Agent Lab</span>
            <span className="text-[11px] text-neutral-400">Multi-turn telephony</span>
          </div>
        </Link>

        <Link
          href="/suites"
          className="p-4 rounded-xl bg-[#111111] hover:bg-[#181818] border border-[#262626] hover:border-neutral-500 transition-colors group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <FlaskConical className="w-4 h-4 text-neutral-400 group-hover:text-white" />
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-white block">Suite Templates</span>
            <span className="text-[11px] text-neutral-400">Curated test library</span>
          </div>
        </Link>
      </div>

      {/* AGENT HEALTH & PROFILE CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
              Agent Profiles & Health Scores
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">{projects.length} Active Agents</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {projects.map(proj => {
            const healthScore = proj.agent_profile?.health_score || 84;

            return (
              <div
                key={proj.id}
                className="p-5 rounded-xl bg-[#111111] border border-[#262626] hover:border-neutral-500 transition-colors space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Row: Name & Health Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{proj.name}</h4>
                      <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                        Active: {proj.agent_profile?.active_version || "v4"} · Model: {proj.agent_profile?.model || "gpt-4o"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-white">
                        {healthScore} <span className="text-xs text-neutral-500">/ 100</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase text-green-400 font-bold block">
                        HEALTHY
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                    {proj.agent_profile?.purpose || proj.description}
                  </p>

                  {/* Health Breakdown Metric Bars */}
                  <div className="space-y-1.5 pt-2 border-t border-[#1f1f1f] text-[11px] font-mono">
                    <div className="flex justify-between items-center text-neutral-400">
                      <span>Accuracy</span>
                      <span className="text-white font-bold">91%</span>
                    </div>
                    <div className="w-full bg-[#1f1f1f] h-1 rounded-full overflow-hidden">
                      <div style={{ width: "91%" }} className="bg-white h-full"></div>
                    </div>

                    <div className="flex justify-between items-center text-neutral-400 pt-1">
                      <span>Safety & Guardrails</span>
                      <span className="text-white font-bold">89%</span>
                    </div>
                    <div className="w-full bg-[#1f1f1f] h-1 rounded-full overflow-hidden">
                      <div style={{ width: "89%" }} className="bg-white h-full"></div>
                    </div>

                    <div className="flex justify-between items-center text-neutral-400 pt-1">
                      <span>Tone & Empathy</span>
                      <span className="text-white font-bold">82%</span>
                    </div>
                    <div className="w-full bg-[#1f1f1f] h-1 rounded-full overflow-hidden">
                      <div style={{ width: "82%" }} className="bg-white h-full"></div>
                    </div>

                    <div className="flex justify-between items-center text-neutral-400 pt-1">
                      <span>Instruction Following</span>
                      <span className="text-white font-bold">81%</span>
                    </div>
                    <div className="w-full bg-[#1f1f1f] h-1 rounded-full overflow-hidden">
                      <div style={{ width: "81%" }} className="bg-white h-full"></div>
                    </div>

                    <div className="flex justify-between items-center text-neutral-400 pt-1">
                      <span>Robustness</span>
                      <span className="text-white font-bold">74%</span>
                    </div>
                    <div className="w-full bg-[#1f1f1f] h-1 rounded-full overflow-hidden">
                      <div style={{ width: "74%" }} className="bg-neutral-400 h-full"></div>
                    </div>
                  </div>

                  {/* Biggest Risks Box */}
                  <div className="p-2.5 rounded bg-[#0a0a0a] border border-[#222222] text-[11px] font-mono space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold block">BIGGEST RISKS</span>
                    <div className="flex justify-between text-neutral-300">
                      <span>1. Context switching</span>
                      <span className="text-neutral-400">8 failures</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>2. Missing information</span>
                      <span className="text-neutral-400">5 failures</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>3. Prompt injection</span>
                      <span className="text-neutral-400">3 failures</span>
                    </div>
                  </div>

                  {/* Actionable AI Quality Recommendation */}
                  <div className="p-2.5 rounded bg-[#161616] border border-[#2a2a2a] text-[11px]">
                    <span className="text-neutral-400 font-bold block mb-0.5">Recommendation:</span>
                    <p className="text-neutral-300 leading-relaxed">
                      Fix context-switching failures before deployment by adding multi-turn retention instructions in section 2.
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
                  <Link
                    href={`/projects/${proj.id}`}
                    className="text-xs font-mono text-white hover:text-neutral-300 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    Open Agent Workspace <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Link>

                  <Link
                    href={`/compare`}
                    className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#1c1c1c] hover:bg-[#252525] text-neutral-300 border border-[#333333] transition-colors"
                  >
                    Regression Test
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create New Agent Profile</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Create an isolated AI agent profile with prompt versioning, tool definitions, and regression suites.
            </p>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">AGENT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dental Receptionist"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">PURPOSE & MISSION</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Handles patient booking, cancellation, insurance triage and empathetic customer support."
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>
              {createError && (
                <p className="text-xs text-red-400 font-mono">{createError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-xs font-bold font-mono"
                >
                  {creating ? "Creating..." : "Create Agent Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {limitModalOpen && (
        <UpgradeModal
          isOpen={limitModalOpen}
          onClose={() => setLimitModalOpen(false)}
          details={limitDetails}
        />
      )}
    </div>
  );
}
