"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvaluations, getProjects } from "@/lib/api";
import { Activity, Search, Filter, ArrowRight, FileText, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function EvaluationsPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    Promise.all([getEvaluations(), getProjects()])
      .then(([e, p]) => {
        setEvaluations(Array.isArray(e) ? e : []);
        setProjects(Array.isArray(p) ? p : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredEvals = evaluations.filter((item) => {
    if (selectedProject !== "all" && item.project_id !== selectedProject) return false;
    if (selectedStatus !== "all" && item.status?.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const pName = (item.prompt_name || "").toLowerCase();
      const mName = (item.model || "").toLowerCase();
      if (!pName.includes(q) && !mName.includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return <div className="text-neutral-500 font-mono text-xs animate-pulse">Loading evaluation history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">REPORTS</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Evaluations & Reports</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Search, filter, and inspect historical agent evaluation runs, token usage, and regression metrics.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 bg-[#111111] border border-[#262626] p-4 rounded-xl items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
            placeholder="Search prompt, agent, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            className="bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">All Agents / Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            className="bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Evaluations Table */}
      {filteredEvals.length === 0 ? (
        <div className="p-12 text-center text-neutral-500 bg-[#111111] border border-[#262626] rounded-xl">
          <Activity className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
          <p className="text-xs font-mono">No evaluation runs found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="border border-[#262626] rounded-xl bg-[#111111] overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#161616] border-b border-[#262626] text-neutral-400 font-mono">
              <tr>
                <th className="px-4 py-3 font-medium">Prompt & Agent</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Passed / Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Executed</th>
                <th className="px-4 py-3 font-medium text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredEvals.map((e) => (
                <tr key={e.id} className="hover:bg-[#181818] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">{e.prompt_name}</span>
                    <span className="text-[10px] font-mono text-neutral-500">Version {e.prompt_version || 4}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-300">{e.model}</td>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {e.overall_score?.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-400">
                    {e.passed_tests} / {e.total_tests}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                      COMPLETED
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-500">
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/runs/${e.id}`}
                      className="text-xs font-mono font-semibold text-white hover:underline inline-flex items-center gap-1"
                    >
                      View Report <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
