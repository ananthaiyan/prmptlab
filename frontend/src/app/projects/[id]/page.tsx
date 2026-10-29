"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProject,
  getPrompts,
  getTestSuites,
  getEvaluations,
  runEvaluation,
  getModels,
  createPrompt,
  createTestSuite,
  generateRedTeamTests,
  createBulkTestCases,
} from "@/lib/api";
import Link from "next/link";
import {
  Play,
  Activity,
  Clock,
  ChevronRight,
  Plus,
  FolderTree,
  FileText,
  Bot,
  GitCompare,
  Mic,
  ShieldAlert,
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  Wrench,
  TrendingUp,
} from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [suites, setSuites] = useState<any[]>([]);
  const [evals, setEvals] = useState<any[]>([]);
  const [models, setModels] = useState<any>({ models: [], default: "gpt-4o" });
  const [loading, setLoading] = useState(true);

  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [selectedSuite, setSelectedSuite] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"profile" | "prompts" | "suites" | "evals">("profile");

  // Modals state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [creatingPrompt, setCreatingPrompt] = useState(false);

  const [showSuiteModal, setShowSuiteModal] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [newSuiteDesc, setNewSuiteDesc] = useState("");
  const [creatingSuite, setCreatingSuite] = useState(false);

  const loadData = () => {
    Promise.all([
      getProject(id),
      getPrompts(id),
      getTestSuites(id),
      getEvaluations(id),
      getModels(),
    ])
      .then(([p, pr, s, e, m]) => {
        setProject(p);
        const safePr = Array.isArray(pr) ? pr : [];
        const safeS = Array.isArray(s) ? s : [];
        const safeE = Array.isArray(e) ? e : [];
        const safeM = m && typeof m === "object" ? m : { models: [], default: "gpt-4o" };

        setPrompts(safePr);
        setSuites(safeS);
        setEvals(safeE);
        setModels(safeM);
        if (safePr.length > 0 && !selectedPrompt) setSelectedPrompt(safePr[0].id);
        if (safeS.length > 0 && !selectedSuite) setSelectedSuite(safeS[0].id);
        if (!selectedModel && safeM) setSelectedModel(safeM.default || (safeM.models && safeM.models[0]) || "gpt-4o");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRun = async () => {
    if (!selectedPrompt || !selectedSuite || !selectedModel) {
      setError("Please select a prompt, suite, and model");
      return;
    }
    setRunning(true);
    setError("");
    try {
      const res = await runEvaluation(selectedPrompt, selectedSuite, selectedModel);
      router.push(`/runs/${res.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to run evaluation");
      setRunning(false);
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptName.trim() || !newPromptContent.trim()) return;
    setCreatingPrompt(true);
    try {
      await createPrompt(id, newPromptName, newPromptContent);
      setShowPromptModal(false);
      setNewPromptName("");
      setNewPromptContent("");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingPrompt(false);
    }
  };

  const handleCreateSuite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuiteName.trim()) return;
    setCreatingSuite(true);
    try {
      await createTestSuite(id, newSuiteName, newSuiteDesc);
      setShowSuiteModal(false);
      setNewSuiteName("");
      setNewSuiteDesc("");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingSuite(false);
    }
  };

  if (loading) {
    return <div className="text-neutral-500 font-mono text-xs animate-pulse">Loading agent profile...</div>;
  }

  const agentName = project?.name || "Dental Receptionist";
  const purpose = project?.agent_profile?.purpose || project?.description || "Appointment booking, cancellation, and empathetic patient triage.";
  const tools = project?.agent_profile?.tools || ["calendar_lookup", "reschedule_appointment", "insurance_check", "human_escalation"];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 border-b border-[#222222] pb-3">
        <Link href="/dashboard" className="hover:text-white transition-colors">Agents & Projects</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-white font-semibold">{agentName}</span>
      </div>

      {/* Agent Profile Header Banner */}
      <div className="p-6 rounded-2xl bg-[#111111] border border-[#262626] flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-mono font-bold text-lg">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{agentName}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold">
                  PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">{purpose}</p>
            </div>
          </div>

          {/* Tools Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-neutral-400" /> Tools Connected:
            </span>
            {tools.map((t: string) => (
              <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c1c1c] text-neutral-300 border border-[#333333]">
                {t}()
              </span>
            ))}
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/playground"
            className="bg-white text-black hover:bg-neutral-200 px-3.5 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            PLAYGROUND
          </Link>

          <Link
            href="/compare"
            className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] text-neutral-200 hover:text-white px-3.5 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2"
          >
            <GitCompare className="w-3.5 h-3.5 text-neutral-400" />
            COMPARE VERSIONS
          </Link>

          <Link
            href="/voice-lab"
            className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] text-neutral-200 hover:text-white px-3.5 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2"
          >
            <Mic className="w-3.5 h-3.5 text-neutral-400" />
            VOICE MODE
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "profile" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white hover:bg-[#141414]"
          }`}
        >
          Agent Overview & Health
        </button>
        <button
          onClick={() => setActiveTab("prompts")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "prompts" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white hover:bg-[#141414]"
          }`}
        >
          Prompt Versions ({prompts.length})
        </button>
        <button
          onClick={() => setActiveTab("suites")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "suites" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white hover:bg-[#141414]"
          }`}
        >
          Test Suites ({suites.length})
        </button>
        <button
          onClick={() => setActiveTab("evals")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "evals" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white hover:bg-[#141414]"
          }`}
        >
          Evaluation History ({evals.length})
        </button>
      </div>

      {/* TAB 1: Profile & Health */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Health Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 rounded-xl bg-[#111111] border border-[#262626] space-y-4">
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <span className="text-xs font-mono uppercase text-neutral-400 font-semibold">
                  AGENT HEALTH GAUGES
                </span>
                <span className="text-sm font-mono font-bold text-white">84 / 100</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Accuracy</span>
                  <span className="text-white font-bold">91%</span>
                </div>
                <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                  <div style={{ width: "91%" }} className="bg-white h-full"></div>
                </div>

                <div className="flex justify-between text-neutral-400 pt-1">
                  <span>Safety & Jailbreak Defense</span>
                  <span className="text-white font-bold">89%</span>
                </div>
                <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                  <div style={{ width: "89%" }} className="bg-white h-full"></div>
                </div>

                <div className="flex justify-between text-neutral-400 pt-1">
                  <span>Tone & Empathy</span>
                  <span className="text-white font-bold">82%</span>
                </div>
                <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                  <div style={{ width: "82%" }} className="bg-white h-full"></div>
                </div>

                <div className="flex justify-between text-neutral-400 pt-1">
                  <span>Instruction Following</span>
                  <span className="text-white font-bold">81%</span>
                </div>
                <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                  <div style={{ width: "81%" }} className="bg-white h-full"></div>
                </div>

                <div className="flex justify-between text-neutral-400 pt-1">
                  <span>Robustness</span>
                  <span className="text-white font-bold">74%</span>
                </div>
                <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                  <div style={{ width: "74%" }} className="bg-neutral-400 h-full"></div>
                </div>
              </div>
            </div>

            {/* Quick Evaluation Runner */}
            <div className="p-5 rounded-xl bg-[#111111] border border-[#262626] space-y-4">
              <span className="text-xs font-mono uppercase text-neutral-400 font-semibold block">
                TRIGGER FULL EVALUATION RUN
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">PROMPT</label>
                  <select
                    value={selectedPrompt}
                    onChange={e => setSelectedPrompt(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    {prompts.map(pr => (
                      <option key={pr.id} value={pr.id}>v{pr.version} · {pr.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">TEST SUITE</label>
                  <select
                    value={selectedSuite}
                    onChange={e => setSelectedSuite(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    {suites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">MODEL</label>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                  >
                    {models.models?.map((m: string) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50 px-5 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  {running ? "RUNNING TESTS..." : "START EVALUATION"}
                </button>
              </div>
            </div>
          </div>

          {/* Risks & Recommendations (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-[#111111] border border-[#262626] space-y-3">
              <span className="text-xs font-mono uppercase text-neutral-400 font-semibold block">
                BIGGEST FAILURE RISKS
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#0a0a0a] border border-[#222222] flex justify-between items-center">
                  <span className="text-neutral-200">1. Context switching</span>
                  <span className="text-red-400 font-bold">8 failures</span>
                </div>
                <div className="p-2.5 rounded bg-[#0a0a0a] border border-[#222222] flex justify-between items-center">
                  <span className="text-neutral-200">2. Missing information</span>
                  <span className="text-amber-400 font-bold">5 failures</span>
                </div>
                <div className="p-2.5 rounded bg-[#0a0a0a] border border-[#222222] flex justify-between items-center">
                  <span className="text-neutral-200">3. Prompt injection</span>
                  <span className="text-neutral-400 font-bold">3 failures</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#161616] border border-[#2a2a2a] text-xs">
                <span className="text-neutral-400 font-bold block mb-1">AI Recommendation:</span>
                <p className="text-neutral-300 leading-relaxed text-[11px]">
                  Fix context-switching failures before deployment. Update system instructions in section 2 to lock previous turn context before cancellation confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Prompts Version Timeline */}
      {activeTab === "prompts" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase text-neutral-400 font-semibold">
              Immutable Prompt Versions Timeline
            </span>
            <button
              onClick={() => setShowPromptModal(true)}
              className="bg-white text-black hover:bg-neutral-200 px-3 py-1.5 rounded text-xs font-bold font-mono transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              New Prompt Version
            </button>
          </div>

          <div className="space-y-3">
            {prompts.map(pr => (
              <div key={pr.id} className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">v{pr.version} · {pr.name}</span>
                    {pr.version === 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-black font-bold">
                        ACTIVE PRODUCTION
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {new Date(pr.created_at).toLocaleDateString()}
                  </span>
                </div>
                <pre className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222222] text-neutral-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {pr.content}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Suites */}
      {activeTab === "suites" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase text-neutral-400 font-semibold">
              Project Test Suites
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/suites"
                className="bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] text-neutral-200 px-3 py-1.5 rounded text-xs font-mono"
              >
                Explore Template Library →
              </Link>
              <button
                onClick={() => setShowSuiteModal(true)}
                className="bg-white text-black hover:bg-neutral-200 px-3 py-1.5 rounded text-xs font-bold font-mono flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                New Suite
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suites.map(s => (
              <Link
                key={s.id}
                href={`/suites/${s.id}`}
                className="p-4 rounded-xl bg-[#111111] hover:bg-[#181818] border border-[#262626] hover:border-neutral-500 transition-colors space-y-2 block"
              >
                <h4 className="text-sm font-bold text-white">{s.name}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{s.description}</p>
                <div className="pt-2 text-[11px] font-mono text-neutral-500">
                  {s.test_count || 14} benchmark cases
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Evaluations History */}
      {activeTab === "evals" && (
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase text-neutral-400 font-semibold block">
            Evaluation Runs History
          </span>

          <div className="border border-[#262626] rounded-xl bg-[#111111] overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#161616] border-b border-[#262626] text-neutral-400 font-mono">
                <tr>
                  <th className="px-4 py-3 font-medium">Prompt Version</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Passed</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {evals.map(e => (
                  <tr key={e.id} className="hover:bg-[#181818] transition-colors">
                    <td className="px-4 py-3 font-bold text-white">v{e.prompt_version} · {e.prompt_name}</td>
                    <td className="px-4 py-3 font-mono text-neutral-300">{e.model}</td>
                    <td className="px-4 py-3 font-mono font-bold text-white">{e.overall_score}%</td>
                    <td className="px-4 py-3 font-mono text-neutral-400">{e.passed_tests} / {e.total_tests}</td>
                    <td className="px-4 py-3 font-mono text-neutral-500">{new Date(e.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/runs/${e.id}`}
                        className="text-white hover:underline font-mono text-xs font-semibold"
                      >
                        View Results →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">New Prompt Version</h3>
            <form onSubmit={handleCreatePrompt} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">PROMPT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dental Receptionist System Prompt"
                  value={newPromptName}
                  onChange={e => setNewPromptName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">SYSTEM PROMPT INSTRUCTIONS</label>
                <textarea
                  rows={6}
                  required
                  value={newPromptContent}
                  onChange={e => setNewPromptContent(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded p-3 text-xs font-mono text-white focus:outline-none leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromptModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPrompt}
                  className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded text-xs font-bold font-mono"
                >
                  {creatingPrompt ? "Saving..." : "Create Version"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Suite Modal */}
      {showSuiteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Test Suite</h3>
            <form onSubmit={handleCreateSuite} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">SUITE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Booking & Cancellation Suite"
                  value={newSuiteName}
                  onChange={e => setNewSuiteName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={newSuiteDesc}
                  onChange={e => setNewSuiteDesc(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSuiteModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSuite}
                  className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded text-xs font-bold font-mono"
                >
                  {creatingSuite ? "Creating..." : "Create Suite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
