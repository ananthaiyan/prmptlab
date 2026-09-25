"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProject, getPrompts, getTestSuites, getEvaluations, runEvaluation, getModels, createPrompt, createTestSuite, generateRedTeamTests, createBulkTestCases } from "@/lib/api";
import Link from "next/link";
import { Play, Activity, Clock, ChevronRight, Plus, FolderTree, FileText } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [suites, setSuites] = useState<any[]>([]);
  const [evals, setEvals] = useState<any[]>([]);
  const [models, setModels] = useState<any>({ models: [], default: "qwen/qwen3.8-27b" });
  const [loading, setLoading] = useState(true);
  
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [selectedSuite, setSelectedSuite] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"evals" | "prompts" | "suites">("evals");

  // Modals state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [creatingPrompt, setCreatingPrompt] = useState(false);

  const [showSuiteModal, setShowSuiteModal] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [newSuiteDesc, setNewSuiteDesc] = useState("");
  const [creatingSuite, setCreatingSuite] = useState(false);

  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
  const [autoGenPrompt, setAutoGenPrompt] = useState("");
  const [autoGenSuiteName, setAutoGenSuiteName] = useState("");
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [autoGenError, setAutoGenError] = useState("");

  const loadData = () => {
    Promise.all([
      getProject(id),
      getPrompts(id),
      getTestSuites(id),
      getEvaluations(id),
      getModels()
    ])
      .then(([p, pr, s, e, m]) => {
        setProject(p);
        const safePr = Array.isArray(pr) ? pr : [];
        const safeS = Array.isArray(s) ? s : [];
        const safeE = Array.isArray(e) ? e : [];
        const safeM = m && typeof m === "object" ? m : { models: [], default: "qwen/qwen3.8-27b" };

        setPrompts(safePr);
        setSuites(safeS);
        setEvals(safeE);
        setModels(safeM);
        if (safePr.length > 0 && !selectedPrompt) setSelectedPrompt(safePr[0].id);
        if (safeS.length > 0 && !selectedSuite) setSelectedSuite(safeS[0].id);
        if (!selectedModel && safeM) setSelectedModel(safeM.default || (safeM.models && safeM.models[0]) || "qwen/qwen3.8-27b");
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

  const handleAutoGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoGenPrompt.trim() || !autoGenSuiteName.trim()) return;
    setAutoGenerating(true);
    setAutoGenError("");

    try {
      // 1. Generate tests
      const result = await generateRedTeamTests(autoGenPrompt, 10);
      const tests = result.tests;
      if (!tests || tests.length === 0) throw new Error("No tests generated");

      // 2. Create the suite
      const suite = await createTestSuite(id, autoGenSuiteName, "Auto-generated red team tests.");

      // 3. Bulk insert tests
      await createBulkTestCases(suite.id, tests);

      setShowAutoGenerateModal(false);
      setAutoGenPrompt("");
      setAutoGenSuiteName("");
      loadData();
    } catch (err: any) {
      console.error(err);
      setAutoGenError(err.message || "Failed to auto-generate tests");
    } finally {
      setAutoGenerating(false);
    }
  };

  if (loading) return <div className="animate-pulse text-neutral-500">Loading project data...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Projects</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-neutral-300">{project.name}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">{project.name}</h2>
          <p className="text-neutral-400 max-w-2xl">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-[#333333]">
            <button 
              className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'evals' ? 'text-white border-b-2 border-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setActiveTab("evals")}
            >
              Evaluations
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'prompts' ? 'text-white border-b-2 border-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setActiveTab("prompts")}
            >
              Prompts
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'suites' ? 'text-white border-b-2 border-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setActiveTab("suites")}
            >
              Test Suites
            </button>
          </div>

          {/* Evaluations Tab */}
          {activeTab === "evals" && (
            <div>
              {evals.length === 0 ? (
                <div className="border border-neutral-800 rounded-lg p-8 text-center bg-[#141414]">
                  <p className="text-neutral-400">No evaluations run yet.</p>
                </div>
              ) : (
                <div className="border border-[#333333] rounded-lg bg-[#141414] overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#1a1a1a] border-b border-[#333333] text-neutral-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Prompt</th>
                        <th className="px-4 py-3 font-medium">Model</th>
                        <th className="px-4 py-3 font-medium">Score</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333333]">
                      {evals.map(e => (
                        <tr key={e.id} className="hover:bg-[#1a1a1a] cursor-pointer transition-colors" onClick={() => router.push(`/runs/${e.id}`)}>
                          <td className="px-4 py-3 font-medium">{e.prompt_name} v{e.prompt_version}</td>
                          <td className="px-4 py-3 text-neutral-400">{e.model}</td>
                          <td className="px-4 py-3">
                            <span className={e.overall_score >= 70 ? 'text-green-500 font-mono' : 'text-red-500 font-mono'}>
                              {e.overall_score.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              e.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                              e.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {e.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-500 text-xs">
                            {new Date(e.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Prompts Tab */}
          {activeTab === "prompts" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">System Prompts</h3>
                <button onClick={() => setShowPromptModal(true)} className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> New Prompt
                </button>
              </div>
              <div className="space-y-3">
                {prompts.map(p => (
                  <div key={p.id} className="border border-[#333333] rounded-lg p-4 bg-[#141414]">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500"/>{p.name}</h4>
                      <span className="text-xs font-mono bg-[#1a1a1a] px-2 py-1 rounded text-neutral-400 border border-[#333333]">v{p.version}</span>
                    </div>
                    <pre className="text-xs text-neutral-400 whitespace-pre-wrap font-sans bg-[#0a0a0a] p-3 rounded border border-[#222222] max-h-32 overflow-y-auto">
                      {p.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Suites Tab */}
          {activeTab === "suites" && (
            <div>
               <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Test Suites</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAutoGenerateModal(true)} className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Auto-Generate
                  </button>
                  <button onClick={() => setShowSuiteModal(true)} className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> New Suite
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suites.map(s => (
                  <Link href={`/suites/${s.id}`} key={s.id}>
                    <div className="border border-[#333333] rounded-lg p-4 bg-[#141414] hover:border-neutral-500 transition-colors group cursor-pointer h-full flex flex-col">
                      <h4 className="font-medium flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2"><FolderTree className="w-4 h-4 text-purple-500"/>{s.name}</span>
                        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                      </h4>
                      <p className="text-xs text-neutral-500 flex-1">{s.description || "No description"}</p>
                      <div className="mt-3 text-xs font-medium text-neutral-400 pt-3 border-t border-[#222222]">
                        {s.test_count} Tests
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div>
          <div className="border border-[#333333] rounded-lg bg-[#141414] p-5 sticky top-8">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-green-500" />
              Run Evaluation
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Prompt Version</label>
                <select 
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={selectedPrompt}
                  onChange={e => setSelectedPrompt(e.target.value)}
                >
                  {prompts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Test Suite</label>
                <select 
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={selectedSuite}
                  onChange={e => setSelectedSuite(e.target.value)}
                >
                  {suites.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.test_count} tests)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Model (Groq)</label>
                <select 
                  className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                >
                  {(models.models || []).map((m: string) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  {(!models.models || models.models.length === 0) && (
                    <option value={models.default}>{models.default}</option>
                  )}
                </select>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
                  <p>{error}</p>
                </div>
              )}

              <button 
                onClick={handleRun}
                disabled={running}
                className="w-full bg-white hover:bg-neutral-200 text-black font-medium py-2 px-4 rounded-md text-sm transition-colors mt-2 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {running ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Run
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Create New Prompt</h3>
            <form onSubmit={handleCreatePrompt}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Prompt Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={newPromptName}
                    onChange={e => setNewPromptName(e.target.value)}
                    placeholder="e.g., Telecom Agent v1"
                  />
                  <p className="text-xs text-neutral-500 mt-1">If the name matches an existing prompt, it will create a new version.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">System Prompt Content</label>
                  <textarea 
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    value={newPromptContent}
                    onChange={e => setNewPromptContent(e.target.value)}
                    placeholder="You are an AI assistant..."
                    rows={8}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowPromptModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={creatingPrompt} className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                  {creatingPrompt ? "Creating..." : "Save Prompt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suite Modal */}
      {showSuiteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create Test Suite</h3>
            <form onSubmit={handleCreateSuite}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Suite Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={newSuiteName}
                    onChange={e => setNewSuiteName(e.target.value)}
                    placeholder="e.g., Edge Cases"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Description (Optional)</label>
                  <textarea 
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={newSuiteDesc}
                    onChange={e => setNewSuiteDesc(e.target.value)}
                    placeholder="What tests go here?"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowSuiteModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={creatingSuite} className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                  {creatingSuite ? "Creating..." : "Create Suite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Generate Suite Modal */}
      {showAutoGenerateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
              <Activity className="w-5 h-5"/> Auto-Generate Test Suite
            </h3>
            <p className="text-sm text-neutral-400 mb-6">Paste a system prompt below. The LLM will automatically generate adversarial and edge-case test cases based on the instructions, and save them as a new Test Suite.</p>
            
            <form onSubmit={handleAutoGenerate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">New Suite Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    value={autoGenSuiteName}
                    onChange={e => setAutoGenSuiteName(e.target.value)}
                    placeholder="e.g., Auto Red Team Suite"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">System Prompt to Analyze</label>
                  <textarea 
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    value={autoGenPrompt}
                    onChange={e => setAutoGenPrompt(e.target.value)}
                    placeholder="Paste the system prompt instructions here..."
                    rows={8}
                  />
                </div>
              </div>

              {autoGenError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
                  {autoGenError}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAutoGenerateModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors" disabled={autoGenerating}>Cancel</button>
                <button type="submit" disabled={autoGenerating} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                  {autoGenerating ? (
                    <><Clock className="w-4 h-4 animate-spin"/> Generating (this takes ~10-20s)...</>
                  ) : "Generate & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
