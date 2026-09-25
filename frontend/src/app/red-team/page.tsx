"use client";

import { useEffect, useState } from "react";
import { getProjects, getPrompts, getTestSuites, generateRedTeamTests, createBulkTestCases } from "@/lib/api";
import { ShieldAlert, Clock, Plus, Check, Sparkles, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "Prompt Injection",
  "Ambiguity",
  "Contradiction",
  "Hostility",
  "Hallucination",
  "Missing Information",
  "Context Switching",
  "Off-topic",
  "Language Switching",
  "Safety",
  "Instruction Following",
  "Tool Abuse",
];

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
    getProjects().then((pList) => {
      setProjects(pList);
      if (pList.length > 0) setSelectedProjectId(pList[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    Promise.all([getPrompts(selectedProjectId), getTestSuites(selectedProjectId)]).then(([pr, st]) => {
      setPrompts(pr);
      setSuites(st);
      if (pr.length > 0) {
        setSelectedPromptId(pr[0].id);
        setPromptContent(pr[0].content);
      } else {
        setSelectedPromptId("");
        setPromptContent("");
      }
      if (st.length > 0) setTargetSuiteId(st[0].id);
    });
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
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-purple-400" /> Red Team Workbench
          </h2>
          <p className="text-neutral-400 max-w-2xl">
            Find the ways your AI agent can fail before your users do. Automatically generate adversarial edge cases and injection attacks based on your system prompt instructions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Controls Column */}
        <div className="border border-[#333333] rounded-xl bg-[#141414] p-6 space-y-5 h-fit">
          <h3 className="font-semibold text-lg text-white mb-2">Generation Setup</h3>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Project</label>
            <select
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Select System Prompt</label>
            <select
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              value={selectedPromptId}
              onChange={(e) => handlePromptSelect(e.target.value)}
            >
              {prompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (v{p.version})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">System Prompt Content</label>
            <textarea
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none focus:border-purple-500"
              rows={6}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="System prompt text..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Number of Tests</label>
            <select
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              value={testCount}
              onChange={(e) => setTestCount(Number(e.target.value))}
            >
              <option value={5}>5 Test Cases</option>
              <option value={10}>10 Test Cases</option>
              <option value={15}>15 Test Cases</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Clock className="w-4 h-4 animate-spin" /> Generating Tests...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Adversarial Tests
              </>
            )}
          </button>
        </div>

        {/* Generated Tests Table Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">
              Generated Test Cases ({generatedTests.length})
            </h3>
            {generatedTests.length > 0 && (
              <div className="flex items-center gap-3">
                <select
                  className="bg-[#1a1a1a] border border-[#333333] rounded-md px-3 py-1.5 text-xs text-white"
                  value={targetSuiteId}
                  onChange={(e) => setTargetSuiteId(e.target.value)}
                >
                  {suites.map((s) => (
                    <option key={s.id} value={s.id}>
                      Add to {s.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSaveToSuite}
                  disabled={saving || selectedTests.size === 0}
                  className="bg-white text-black hover:bg-neutral-200 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Save Selected ({selectedTests.size})
                </button>
              </div>
            )}
          </div>

          {saveSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-md text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Selected tests successfully added to Test Suite!</span>
            </div>
          )}

          {generatedTests.length === 0 ? (
            <div className="border border-[#333333] rounded-xl p-12 text-center bg-[#141414]">
              <ShieldAlert className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h4 className="font-medium text-white mb-1">No Tests Generated Yet</h4>
              <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                Select your system prompt on the left and click "Generate Adversarial Tests" to find hidden vulnerabilities.
              </p>
            </div>
          ) : (
            <div className="border border-[#333333] rounded-xl bg-[#141414] overflow-hidden divide-y divide-[#333333]">
              {generatedTests.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-4 transition-colors flex items-start gap-4 ${
                    selectedTests.has(idx) ? "bg-[#1a1a1a]" : "bg-[#141414]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.has(idx)}
                    onChange={() => toggleSelectTest(idx)}
                    className="mt-1 accent-purple-500"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white text-sm">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
                          {t.category || "adversarial"}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                            t.severity === "critical"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          }`}
                        >
                          {t.severity || "medium"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-neutral-500 block mb-0.5">Input:</span>
                      <p className="text-xs font-mono text-neutral-300 bg-[#0a0a0a] p-2 rounded border border-[#222222]">
                        {t.input}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-neutral-500 block mb-0.5">Expected Behavior:</span>
                      <p className="text-xs text-neutral-400">{t.expected_behavior}</p>
                    </div>
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
