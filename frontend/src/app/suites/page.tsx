"use client";

import { useState, useEffect } from "react";
import {
  FlaskConical,
  Plus,
  Copy,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  Headphones,
  FileText,
  ShieldAlert,
  HelpCircle,
  Tag,
  ArrowRight,
  ListPlus,
  Trash2,
} from "lucide-react";
import {
  TEMPLATE_LIBRARY,
  TestSuiteTemplate,
  getProjects,
  getTestSuites,
  createTestSuite,
  createBulkTestCases,
  createTestCase,
} from "@/lib/api";

export default function SuitesPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectSuites, setProjectSuites] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Clone Template State
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [clonedSuccess, setClonedSuccess] = useState<string | null>(null);

  // Manual Test Case Builder Modal
  const [showBuilderModal, setShowBuilderModal] = useState<boolean>(false);
  const [builderSuiteId, setBuilderSuiteId] = useState<string>("");
  const [caseName, setCaseName] = useState<string>("");
  const [caseInput, setCaseInput] = useState<string>("");
  const [expectedBehavior, setExpectedBehavior] = useState<string>("");
  const [mustContain, setMustContain] = useState<string>("");
  const [mustNotContain, setMustNotContain] = useState<string>("");
  const [judgeCriteria, setJudgeCriteria] = useState<string>("");
  const [assertionType, setAssertionType] = useState<string>("llm_judge");
  const [category, setCategory] = useState<string>("Edge Case");
  const [severity, setSeverity] = useState<string>("high");
  const [savingCase, setSavingCase] = useState<boolean>(false);

  // Selected template inspection modal
  const [previewTemplate, setPreviewTemplate] = useState<TestSuiteTemplate | null>(null);

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
    async function loadSuites() {
      const sList = await getTestSuites(selectedProjectId);
      setProjectSuites(sList);
      if (sList.length > 0 && !builderSuiteId) {
        setBuilderSuiteId(sList[0].id);
      }
    }
    loadSuites();
  }, [selectedProjectId]);

  const handleCloneTemplate = async (template: TestSuiteTemplate) => {
    if (!selectedProjectId) return;
    setCloningId(template.id);
    try {
      // 1. Create Suite
      const createdSuite = await createTestSuite(selectedProjectId, template.title, template.description);
      // 2. Insert test cases
      await createBulkTestCases(createdSuite.id, template.testCases);
      // Refresh
      const updated = await getTestSuites(selectedProjectId);
      setProjectSuites(updated);
      setClonedSuccess(template.id);
      setTimeout(() => setClonedSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setCloningId(null);
    }
  };

  const handleSaveCustomTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim() || !caseInput.trim() || !builderSuiteId) return;
    setSavingCase(true);
    try {
      await createTestCase(builderSuiteId, {
        name: caseName,
        input: caseInput,
        expected_output: expectedBehavior,
        assertions: {
          assertion_type: assertionType,
          must_contain: mustContain.split(",").map(s => s.trim()).filter(Boolean),
          must_not_contain: mustNotContain.split(",").map(s => s.trim()).filter(Boolean),
          judge_criteria: judgeCriteria,
        },
        category,
        severity,
      });
      setShowBuilderModal(false);
      setCaseName("");
      setCaseInput("");
      setExpectedBehavior("");
      setMustContain("");
      setMustNotContain("");
      setJudgeCriteria("");
      const updated = await getTestSuites(selectedProjectId);
      setProjectSuites(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCase(false);
    }
  };

  const categories = ["All", "Customer Support", "Voice Agent", "RAG", "Security"];

  const filteredTemplates = activeCategory === "All"
    ? TEMPLATE_LIBRARY
    : TEMPLATE_LIBRARY.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">TEST SUITES</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Test Suite Library & Builder</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Import production-grade benchmark templates or construct custom deterministic & LLM Judge test cases.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBuilderModal(true)}
            className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            CREATE TEST CASE
          </button>
        </div>
      </div>

      {/* Target Agent Selector */}
      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono uppercase text-neutral-400">Target Agent Profile:</label>
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="bg-[#0a0a0a] border border-[#333333] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="text-xs font-mono text-neutral-400">
          Active Project Test Suites: <span className="text-white font-bold">{projectSuites.length}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              activeCategory === cat
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white hover:bg-[#141414]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Library Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map(tmpl => {
          const isCloned = clonedSuccess === tmpl.id;
          const isCloning = cloningId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className="p-5 rounded-xl bg-[#111111] border border-[#262626] hover:border-neutral-500 transition-colors flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1a1a1a] text-neutral-300 border border-[#333333]">
                    {tmpl.category}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {tmpl.casesCount} Test Cases
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-neutral-100 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                {/* Preview cases tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tmpl.testCases.slice(0, 4).map((tc, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0a0a0a] text-neutral-400 border border-[#222222]"
                    >
                      • {tc.name}
                    </span>
                  ))}
                  {tmpl.testCases.length > 4 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0a0a0a] text-neutral-500">
                      +{tmpl.testCases.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
                <button
                  onClick={() => setPreviewTemplate(tmpl)}
                  className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                >
                  Inspect Cases & Assertions →
                </button>

                <button
                  onClick={() => handleCloneTemplate(tmpl)}
                  disabled={isCloning}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                    isCloned
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-white text-black hover:bg-neutral-200"
                  }`}
                >
                  {isCloned ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      Imported to Agent
                    </>
                  ) : isCloning ? (
                    "Importing..."
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-black" />
                      1-Click Import Suite
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Template Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">{previewTemplate.category} TEMPLATE</span>
                <h3 className="text-lg font-bold text-white">{previewTemplate.title}</h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              {previewTemplate.testCases.map((tc, i) => (
                <div key={i} className="p-3 bg-[#0a0a0a] border border-[#222222] rounded-lg text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{i + 1}. {tc.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-neutral-400">{tc.category}</span>
                  </div>
                  <div className="text-neutral-300">
                    <span className="text-neutral-500">Input:</span> "{tc.input}"
                  </div>
                  <div className="text-neutral-300">
                    <span className="text-neutral-500">Expected:</span> {tc.expected}
                  </div>
                  {tc.mustContain && tc.mustContain.length > 0 && (
                    <div className="text-green-400 text-[11px]">
                      <span className="text-neutral-500">Must Contain:</span> {tc.mustContain.join(", ")}
                    </div>
                  )}
                  {tc.mustNotContain && tc.mustNotContain.length > 0 && (
                    <div className="text-red-400 text-[11px]">
                      <span className="text-neutral-500">Must Not Contain:</span> {tc.mustNotContain.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#222222] flex justify-end gap-2">
              <button
                onClick={() => {
                  handleCloneTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded text-xs font-mono font-bold"
              >
                Import Suite to Active Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Test Case Builder Modal */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#222222] pb-3">
              <span className="text-[10px] font-mono uppercase text-neutral-400">TEST CASE BUILDER</span>
              <h3 className="text-lg font-bold text-white">Create Custom Test Case</h3>
              <p className="text-xs text-neutral-400">
                Define deterministic assertions, forbidden phrases, or semantic LLM Judge criteria.
              </p>
            </div>

            <form onSubmit={handleSaveCustomTestCase} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">TARGET TEST SUITE</label>
                  <select
                    value={builderSuiteId}
                    onChange={e => setBuilderSuiteId(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {projectSuites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">TEST CASE NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Angry customer cancellation"
                    value={caseName}
                    onChange={e => setCaseName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">INPUT (PROMPT / USER MESSAGE)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. I've been waiting for 20 minutes. Cancel my appointment right now."
                  value={caseInput}
                  onChange={e => setCaseInput(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">EXPECTED BEHAVIOR / OUTPUT</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cancel the appointment and acknowledge frustration with empathy."
                  value={expectedBehavior}
                  onChange={e => setExpectedBehavior(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Assertion Rules Builder */}
              <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg space-y-3">
                <span className="text-xs font-mono text-neutral-400 font-semibold block">
                  EVALUATION ASSERTION RULES
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-green-400 mb-1">
                      MUST CONTAIN (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="appointment, cancel"
                      value={mustContain}
                      onChange={e => setMustContain(e.target.value)}
                      className="w-full bg-[#111111] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-red-400 mb-1">
                      MUST NOT CONTAIN (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="guaranteed refund, not our fault"
                      value={mustNotContain}
                      onChange={e => setMustNotContain(e.target.value)}
                      className="w-full bg-[#111111] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    LLM JUDGE CRITERIA / EVALUATION PROMPT
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verify that the agent maintains empathy and adheres strictly to cancellation policy."
                    value={judgeCriteria}
                    onChange={e => setJudgeCriteria(e.target.value)}
                    className="w-full bg-[#111111] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">ASSERTION TYPE</label>
                  <select
                    value={assertionType}
                    onChange={e => setAssertionType(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="must_contain">Must Contain / Not Contain</option>
                    <option value="expected_output">Expected Output (Exact/Semantic)</option>
                    <option value="llm_judge">LLM Judge</option>
                    <option value="custom_criteria">Custom Criteria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">CATEGORY</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">SEVERITY</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCase}
                  className="bg-white text-black hover:bg-neutral-200 px-5 py-2 rounded text-xs font-bold font-mono"
                >
                  {savingCase ? "Saving..." : "Save Test Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
