"use client";

import { useEffect, useState } from "react";
import { getProjects, getPrompts, getTestSuites, generateRedTeamTests, createBulkTestCases } from "@/lib/api";
import { ShieldAlert, Clock, Plus, Check, Sparkles, AlertCircle, RotateCcw } from "lucide-react";

export default function RedTeamPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [suites, setSuites] = useState<any[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [promptContent, setPromptContent] = useState("");

  const [testCount, setTestCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [generatedTests, setGeneratedTests] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());

  const [targetSuiteId, setTargetSuiteId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getProjects()
      .then((pList) => {
        const safeP = Array.isArray(pList) ? pList : [];
        setProjects(safeP);
        if (safeP.length > 0) setSelectedProjectId(safeP[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    Promise.all([getPrompts(selectedProjectId), getTestSuites(selectedProjectId)])
      .then(([pr, st]) => {
        const safePr = Array.isArray(pr) ? pr : [];
        const safeSt = Array.isArray(st) ? st : [];
        setPrompts(safePr);
        setSuites(safeSt);
        if (safePr.length > 0) {
          setSelectedPromptId(safePr[0].id);
          setPromptContent(safePr[0].content);
        } else {
          setSelectedPromptId("");
          setPromptContent("");
        }
        if (safeSt.length > 0) setTargetSuiteId(safeSt[0].id);
      })
      .catch(console.error);
  }, [selectedProjectId]);

  const handlePromptSelect = (pId: string) => {
    setSelectedPromptId(pId);
    const found = prompts.find((p) => p.id === pId);
    if (found) setPromptContent(found.content);
  };

  const handleGenerate = async () => {
    if (!promptContent.trim()) {
      setError("Please select a prompt or paste prompt content");
      return;
    }
    setGenerating(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await generateRedTeamTests(promptContent, testCount);
      const tests = res.tests || [];
      setGeneratedTests(tests);
      setSelectedTests(new Set(tests.map((_: any, idx: number) => idx)));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate red-team tests");
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelectTest = (idx: number) => {
    const next = new Set(selectedTests);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedTests(next);
  };

  const handleSaveToSuite = async () => {
    if (!targetSuiteId) {
      setError("Please select a target test suite");
      return;
    }
    const selectedList = generatedTests.filter((_, idx) => selectedTests.has(idx));
    if (selectedList.length === 0) return;

    setSaving(true);
    try {
      await createBulkTestCases(targetSuiteId, selectedList);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save tests to suite");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">SECURITY</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Red Team Adversarial Attacks</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Automatically generate edge-case attacks for prompt injections, DAN jailbreaks, system extraction, and policy bypasses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="border border-[#262626] rounded-xl bg-[#111111] p-5 space-y-4 h-fit">
          <span className="text-xs font-mono uppercase text-neutral-400 font-semibold block">Generation Setup</span>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Target Agent Profile</label>
            <select
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Select System Prompt</label>
            <select
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              value={selectedPromptId}
              onChange={(e) => handlePromptSelect(e.target.value)}
            >
              {prompts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">System Prompt Content</label>
            <textarea
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded p-2.5 text-xs text-neutral-200 font-mono focus:outline-none leading-relaxed"
              rows={6}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="System prompt text..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 mb-1">Number of Attack Cases</label>
            <select
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              value={testCount}
              onChange={(e) => setTestCount(Number(e.target.value))}
            >
              <option value={5}>5 Adversarial Cases</option>
              <option value={10}>10 Adversarial Cases</option>
              <option value={15}>15 Adversarial Cases</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded text-xs flex gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-white text-black hover:bg-neutral-200 font-bold font-mono py-2.5 px-4 rounded text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-black" /> Generating Adversarial Tests...
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-black" /> GENERATE ATTACKS
              </>
            )}
          </button>
        </div>

        {/* Generated Tests Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400 font-semibold">
              Generated Attack Test Cases ({generatedTests.length})
            </span>
            {generatedTests.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  className="bg-[#111111] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white"
                  value={targetSuiteId}
                  onChange={(e) => setTargetSuiteId(e.target.value)}
                >
                  {suites.map((s) => (
                    <option key={s.id} value={s.id}>Add to {s.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleSaveToSuite}
                  disabled={saving || selectedTests.size === 0}
                  className="bg-white text-black hover:bg-neutral-200 px-3 py-1.5 rounded text-xs font-bold font-mono transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-black" /> Save ({selectedTests.size})
                </button>
              </div>
            )}
          </div>

          {saveSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Successfully saved attack cases to suite!
            </div>
          )}

          {generatedTests.length === 0 ? (
            <div className="border border-[#262626] rounded-xl bg-[#111111] p-12 text-center text-neutral-500 space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="text-xs font-mono">
                Click "Generate Attacks" to automatically synthesize adversarial test vectors for this prompt.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {generatedTests.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleSelectTest(idx)}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer text-xs font-mono space-y-2 ${
                    selectedTests.has(idx)
                      ? "bg-[#141414] border-white/40"
                      : "bg-[#0d0d0d] border-[#222222] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTests.has(idx)}
                        onChange={() => {}}
                        className="accent-white"
                      />
                      <span className="font-bold text-white">{t.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f1f1f] text-neutral-300 border border-[#333333]">
                      {t.category || "Red Team"}
                    </span>
                  </div>

                  <div className="text-neutral-300 bg-[#0a0a0a] p-2.5 rounded border border-[#222222]">
                    <span className="text-neutral-500 block mb-0.5">Attack Input:</span>
                    "{t.input}"
                  </div>

                  <div className="text-neutral-400 text-[11px]">
                    <span className="text-neutral-500">Expected Defense:</span> {t.expected_output}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
