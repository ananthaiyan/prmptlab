"use client";

import { useEffect, useState } from "react";
import { getProjects, createProject, getEvaluations, getSubscription } from "@/lib/api";
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, FolderKanban, Plus, Activity, ShieldAlert, Zap, Clock, Check, Terminal, FileText, Bug } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New project modal
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Plan limit error modal
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitDetails, setLimitDetails] = useState<any>({});

  const loadDashboardData = () => {
    Promise.all([getProjects(), getEvaluations(), getSubscription()])
      .then(([pList, eList, sData]) => {
        setProjects(pList);
        setEvaluations(eList);
        setSub(sData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isSignedIn) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

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
        setCreateError(err.message || "Failed to create project");
      }
    } finally {
      setCreating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-neutral-500 font-mono text-sm animate-pulse">
        Loading PromptBench...
      </div>
    );
  }

  // PUBLIC LANDING PAGE (When SignedOut)
  if (!isSignedIn) {
    return (
      <div className="py-12 space-y-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#333333] text-neutral-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> prmptlab v2.0 · Infrastructure for AI Agents
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Test your AI agents <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-500">
              before your users do.
            </span>
          </h1>

          <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Evaluate prompts, conversations, and edge cases before deployment. Catch hallucinations, prompt injections, and regression bugs instantly.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <SignUpButton mode="modal">
              <button className="bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-md font-semibold text-sm transition-colors flex items-center gap-2">
                Start Testing Free <ArrowRight className="w-4 h-4" />
              </button>
            </SignUpButton>
            <Link href="/pricing" className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] text-neutral-300 hover:text-white px-6 py-3 rounded-md font-medium text-sm transition-colors">
              View Pricing
            </Link>
          </div>
        </div>

        {/* Interactive UI Demo Preview Card */}
        <div className="max-w-5xl mx-auto border border-[#333333] rounded-2xl bg-[#0a0a0a] shadow-2xl p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 border-b border-[#222222] pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="text-xs font-mono text-neutral-500 ml-2">prmptlab // evaluation-run-log</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#141414] border border-[#222222] p-4 rounded-lg">
              <span className="text-neutral-500 block mb-1">PROMPT VERSION</span>
              <span className="text-white font-bold">Telecom Support Agent v2</span>
            </div>
            <div className="bg-[#141414] border border-[#222222] p-4 rounded-lg">
              <span className="text-neutral-500 block mb-1">ACCURACY SCORE</span>
              <span className="text-green-500 font-bold">92.5% Passed</span>
            </div>
            <div className="bg-[#141414] border border-[#222222] p-4 rounded-lg">
              <span className="text-neutral-500 block mb-1">LLM JUDGE MODEL</span>
              <span className="text-purple-400 font-bold">qwen/qwen3.8-27b</span>
            </div>
          </div>
        </div>

        {/* 6 Core Feature Sections Grid */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-12">
            Everything you need for agent regression testing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#222222] rounded-xl bg-[#141414] p-6 space-y-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <h3 className="font-semibold text-white">1. Build Test Suites</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Create deterministic checks and qualitative expectation criteria for your AI assistant.
              </p>
            </div>

            <div className="border border-[#222222] rounded-xl bg-[#141414] p-6 space-y-3">
              <Activity className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold text-white">2. Run Real Evaluations</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Execute test suites against Groq-hosted models to record token usage, output, and latency.
              </p>
            </div>

            <div className="border border-[#222222] rounded-xl bg-[#141414] p-6 space-y-3">
              <Bug className="w-6 h-6 text-amber-400" />
              <h3 className="font-semibold text-white">3. Find Failures</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                An LLM Judge evaluates response accuracy, tone, safety, and intent compliance.
              </p>
            </div>

            <div className="border border-[#222222] rounded-xl bg-[#141414] p-6 space-y-3">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
              <h3 className="font-semibold text-white">4. Red-Team Your Agent</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automatically generate adversarial test cases for jailbreaks, prompt injection, and ambiguity.
              </p>
            </div>

            <div className="border border-[#222222] rounded-xl bg-[#141414] p-6 space-y-3">
              <Terminal className="w-6 h-6 text-cyan-400" />
              <h3 className="font-semibold text-white">5. Compare Prompts</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Iterate on system instructions and compare versions side-by-side to prevent regressions.
              </p>
            </div>

            <div className="border border-[#222222] rounded-xl bg-[#141414] p-6 space-y-3">
              <Zap className="w-6 h-6 text-rose-400" />
              <h3 className="font-semibold text-white">6. Ship with Confidence</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Integrate evaluation workflows into your deployment pipeline before shipping updates to users.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD (When SignedIn)
  return (
    <div>
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Good morning, {user?.firstName || "Developer"}
          </h2>
          <p className="text-neutral-400 text-sm">
            Manage your prompt evaluation projects and test suites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Plan Quota Meter Banner */}
      {sub && (
        <div className="border border-[#333333] rounded-xl bg-[#141414] p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-neutral-500 font-mono block">YOUR PLAN</span>
              <span className="text-sm font-bold text-white font-mono">{sub.plan}</span>
            </div>
            <div>
              <span className="text-xs text-neutral-500 font-mono block">PROJECTS USED</span>
              <span className="text-sm font-bold text-white font-mono">{projects.length} / {sub.limits?.projects || 3}</span>
            </div>
            <div>
              <span className="text-xs text-neutral-500 font-mono block">EVALUATIONS / MO</span>
              <span className="text-sm font-bold text-white font-mono">{sub.usage?.evaluations_this_month || 0} / {sub.limits?.evaluations_per_month || 500}</span>
            </div>
          </div>

          {sub.plan === "FREE" && projects.length >= 2 && (
            <Link
              href="/pricing"
              className="text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded hover:bg-amber-500/20 transition-colors"
            >
              Approaching plan limit · Upgrade
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="border border-[#333333] hover:border-neutral-500 bg-[#141414] p-4 rounded-xl text-left transition-colors group flex items-center justify-between"
        >
          <div>
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-400" /> New Project
            </h4>
            <p className="text-xs text-neutral-400 mt-1">Create project & prompt version</p>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </button>

        <Link href="/evaluations" className="border border-[#333333] hover:border-neutral-500 bg-[#141414] p-4 rounded-xl text-left transition-colors group flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" /> Run Evaluation
            </h4>
            <p className="text-xs text-neutral-400 mt-1">Execute tests against Groq model</p>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </Link>

        <Link href="/red-team" className="border border-[#333333] hover:border-neutral-500 bg-[#141414] p-4 rounded-xl text-left transition-colors group flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" /> Red Team Workbench
            </h4>
            <p className="text-xs text-neutral-400 mt-1">Generate adversarial tests</p>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* Projects List */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4 text-white">Projects</h3>

        {loading ? (
          <div className="text-neutral-500 animate-pulse font-mono text-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="border border-[#333333] rounded-xl p-12 text-center bg-[#141414]">
            <FolderKanban className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No projects yet</h4>
            <p className="text-neutral-400 text-sm mb-6">Create your first project to start evaluating system prompts.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link href={`/projects/${p.id}`} key={p.id}>
                <div className="border border-[#333333] rounded-xl p-5 bg-[#141414] hover:border-neutral-500 transition-colors group h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        {p.name}
                      </h4>
                      {p.latest_score !== null && (
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          p.latest_score >= 70 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {p.latest_score.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-4">
                      {p.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#222222] flex items-center justify-between text-xs text-neutral-500">
                    <span>{p.prompt_count} Prompts · {p.suite_count} Suites</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-white">Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g., Customer Support Agent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Description (Optional)</label>
                  <textarea
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="What is this AI agent responsible for?"
                    rows={3}
                  />
                </div>
              </div>

              {createError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Modal for Plan Limits */}
      <UpgradeModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        resource={limitDetails.resource}
        limit={limitDetails.limit}
        current={limitDetails.current}
        requiredPlan={limitDetails.requiredPlan}
      />
    </div>
  );
}
