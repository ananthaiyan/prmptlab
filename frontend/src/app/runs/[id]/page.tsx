"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEvaluationResults, API_BASE } from "@/lib/api";
import Link from "next/link";
import { CheckCircle2, XCircle, ChevronRight, Activity, Clock, ShieldAlert, Cpu } from "lucide-react";

export default function RunPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [run, setRun] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  useEffect(() => {
    // Fetch run details
    fetch(`${API_BASE}/evaluations/${id}`)
      .then(res => res.json())
      .then(r => {
        setRun(r);
        return getEvaluationResults(id);
      })
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="animate-pulse text-neutral-500">Loading evaluation results...</div>;
  if (!run) return <div>Run not found</div>;

  const avgLatency = results.length > 0 
    ? (results.reduce((acc, r) => acc + r.latency_ms, 0) / results.length).toFixed(0) 
    : 0;
    
  const criticalFails = results.filter(r => !r.passed && r.severity === 'critical').length;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto pr-6 transition-all ${selectedTest ? 'w-1/2' : 'w-full'}`}>
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/projects/${run.project_id}`} className="hover:text-white transition-colors">Project</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-300">Eval Run</span>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Evaluation Results</h2>
            <div className="flex items-center gap-4 text-sm text-neutral-400">
              <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> {run.model}</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> {run.prompt_name} v{run.prompt_version}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold font-mono tracking-tighter ${run.overall_score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
              {run.overall_score.toFixed(1)}%
            </div>
            <div className="text-sm text-neutral-500 font-medium uppercase tracking-widest mt-1">Overall Score</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-[#333333] rounded-lg p-4 bg-[#141414]">
            <div className="text-sm text-neutral-500 mb-1">Passed Tests</div>
            <div className="text-2xl font-semibold text-white">{run.passed_tests}</div>
          </div>
          <div className="border border-[#333333] rounded-lg p-4 bg-[#141414]">
            <div className="text-sm text-neutral-500 mb-1">Failed Tests</div>
            <div className="text-2xl font-semibold text-white">{run.failed_tests}</div>
          </div>
          <div className="border border-[#333333] rounded-lg p-4 bg-[#141414]">
            <div className="text-sm text-neutral-500 mb-1">Critical Failures</div>
            <div className={`text-2xl font-semibold ${criticalFails > 0 ? 'text-red-500' : 'text-white'}`}>{criticalFails}</div>
          </div>
          <div className="border border-[#333333] rounded-lg p-4 bg-[#141414]">
            <div className="text-sm text-neutral-500 mb-1">Avg Latency</div>
            <div className="text-2xl font-semibold text-white font-mono">{avgLatency}ms</div>
          </div>
        </div>

        {/* Results Table */}
        <div className="border border-[#333333] rounded-lg bg-[#141414] overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] border-b border-[#333333] text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Test Case</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {results.map(r => (
                <tr 
                  key={r.id} 
                  className={`hover:bg-[#1a1a1a] cursor-pointer transition-colors ${selectedTest?.id === r.id ? 'bg-[#1a1a1a]' : ''}`}
                  onClick={() => setSelectedTest(r)}
                >
                  <td className="px-4 py-3 font-medium text-white">{r.test_name}</td>
                  <td className="px-4 py-3">
                    {r.failure_category !== 'none' ? (
                      <span className="text-neutral-400 font-mono text-xs border border-[#333333] px-1.5 py-0.5 rounded">
                        {r.failure_category}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 font-mono">{r.score}</td>
                  <td className="px-4 py-3">
                    {r.passed ? (
                      <span className="flex items-center gap-1.5 text-green-500 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 font-medium">
                        <XCircle className="w-4 h-4" /> FAIL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTest && (
        <div className="w-96 border-l border-[#333333] pl-6 overflow-y-auto">
          <div className="sticky top-0 bg-black pb-4 pt-2 mb-4 border-b border-[#333333] z-10 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Test Details</h3>
            <button onClick={() => setSelectedTest(null)} className="text-neutral-500 hover:text-white">✕</button>
          </div>

          <div className="space-y-6 pb-12">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Status</span>
                <span className={`font-mono font-medium ${selectedTest.passed ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedTest.passed ? 'PASS' : 'FAIL'} ({selectedTest.score}/100)
                </span>
              </div>
              {!selectedTest.passed && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-sm text-red-400 font-mono">
                  Failure: {selectedTest.failure_category}
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 block mb-2">User Input</span>
              <div className="bg-[#141414] border border-[#333333] rounded-md p-3 text-sm text-white whitespace-pre-wrap">
                {selectedTest.test_input}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 block mb-2">Expected Behavior</span>
              <div className="text-sm text-neutral-300 bg-[#0a0a0a] border border-[#222222] rounded-md p-3">
                {selectedTest.expected_behavior}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 block mb-2">Actual Model Output</span>
              <div className={`bg-[#141414] border rounded-md p-3 text-sm whitespace-pre-wrap ${selectedTest.passed ? 'border-[#333333] text-white' : 'border-red-500/30 text-red-50'}`}>
                {selectedTest.model_output}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 block mb-2">Judge Reasoning</span>
              <div className="text-sm text-blue-200 bg-blue-900/20 border border-blue-900/50 rounded-md p-3 italic">
                {selectedTest.judge_reasoning}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#333333]">
              <div>
                <span className="text-xs text-neutral-500 block mb-1">Latency</span>
                <span className="text-sm font-mono flex items-center gap-1.5"><Clock className="w-3 h-3 text-neutral-400"/> {selectedTest.latency_ms.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 block mb-1">Tokens</span>
                <span className="text-sm font-mono">{selectedTest.total_tokens}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
