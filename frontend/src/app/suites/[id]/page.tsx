"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTestCases, createTestCase, API_BASE } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, Plus, AlertCircle } from "lucide-react";

export default function SuitePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [suite, setSuite] = useState<any>(null);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  
  const [tcName, setTcName] = useState("");
  const [tcInput, setTcInput] = useState("");
  const [tcExpected, setTcExpected] = useState("");
  const [tcMustContain, setTcMustContain] = useState("");
  const [tcMustNotContain, setTcMustNotContain] = useState("");
  const [tcSeverity, setTcSeverity] = useState("medium");

  const loadData = () => {
    fetch(`${API_BASE}/test-suites/${id}`)
      .then(res => res.json())
      .then(setSuite)
      .catch(console.error);
      
    getTestCases(id)
      .then(setTestCases)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tcName.trim() || !tcInput.trim()) return;
    setCreating(true);
    setError("");

    try {
      const mustContain = tcMustContain.split(",").map(s => s.trim()).filter(Boolean);
      const mustNotContain = tcMustNotContain.split(",").map(s => s.trim()).filter(Boolean);

      await createTestCase(id, {
        name: tcName,
        input: tcInput,
        expected_behavior: tcExpected,
        must_contain: mustContain,
        must_not_contain: mustNotContain,
        severity: tcSeverity
      });

      setShowModal(false);
      setTcName("");
      setTcInput("");
      setTcExpected("");
      setTcMustContain("");
      setTcMustNotContain("");
      setTcSeverity("medium");
      
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create test case");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="animate-pulse text-neutral-500">Loading test suite...</div>;
  if (!suite) return <div>Test suite not found</div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Projects</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/projects/${suite.project_id}`} className="hover:text-white transition-colors">Project</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-neutral-300">{suite.name}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">{suite.name}</h2>
          <p className="text-neutral-400 max-w-2xl">{suite.description}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Test Case
        </button>
      </div>

      {testCases.length === 0 ? (
        <div className="border border-neutral-800 rounded-lg p-12 text-center bg-[#141414]">
          <p className="text-neutral-400 mb-4">No test cases in this suite yet.</p>
          <button onClick={() => setShowModal(true)} className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Add your first Test Case
          </button>
        </div>
      ) : (
        <div className="border border-[#333333] rounded-lg bg-[#141414] overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] border-b border-[#333333] text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium w-1/3">Input</th>
                <th className="px-4 py-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {testCases.map(tc => (
                <tr key={tc.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{tc.name}</td>
                  <td className="px-4 py-3 text-neutral-400 truncate max-w-xs">{tc.input}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      tc.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                      tc.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                      'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                    }`}>
                      {tc.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">Create New Test Case</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Test Name *</label>
                  <input 
                    type="text" required
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={tcName} onChange={e => setTcName(e.target.value)}
                    placeholder="e.g., Angry customer complaint"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">User Input *</label>
                  <textarea 
                    required rows={3}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    value={tcInput} onChange={e => setTcInput(e.target.value)}
                    placeholder="The exact message the user sends to the agent..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Expected Behavior</label>
                  <textarea 
                    rows={2}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={tcExpected} onChange={e => setTcExpected(e.target.value)}
                    placeholder="What should the agent do? The LLM Judge evaluates this."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Must Contain (comma separated)</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      value={tcMustContain} onChange={e => setTcMustContain(e.target.value)}
                      placeholder="e.g., cancel, retention"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Must NOT Contain (comma separated)</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      value={tcMustNotContain} onChange={e => setTcMustNotContain(e.target.value)}
                      placeholder="e.g., account number, SSN"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Severity</label>
                  <select 
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={tcSeverity} onChange={e => setTcSeverity(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

              </div>
              
              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                  {creating ? "Creating..." : "Save Test Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
