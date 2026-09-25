"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvaluations, getProjects } from "@/lib/api";
import { Activity, Search, Filter, ArrowRight } from "lucide-react";

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
        setEvaluations(e);
        setProjects(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredEvals = evaluations.filter((item) => {
    if (selectedProject !== "all" && item.project_id !== selectedProject) return false;
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const pName = (item.prompt_name || "").toLowerCase();
      const mName = (item.model || "").toLowerCase();
      if (!pName.includes(q) && !mName.includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return <div className="text-neutral-500 animate-pulse">Loading evaluation history...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-green-500" /> Global Evaluations History
          </h2>
          <p className="text-neutral-400">
            View, search, and analyze all prompt evaluation runs across all projects.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-[#141414] border border-[#333333] p-4 rounded-xl items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="Search prompt or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select
            className="bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
        </div>
      </div>

      {/* Evaluations Table */}
      {filteredEvals.length === 0 ? (
        <div className="border border-[#333333] rounded-xl p-12 text-center bg-[#141414]">
          <p className="text-neutral-400">No evaluation runs found matching your filters.</p>
        </div>
      ) : (
        <div className="border border-[#333333] rounded-xl bg-[#141414] overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] border-b border-[#333333] text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Prompt Version</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Pass / Fail</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {filteredEvals.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
                  onClick={() => router.push(`/runs/${e.id}`)}
                >
                  <td className="px-4 py-3.5 font-medium text-white">
                    {e.prompt_name} <span className="text-neutral-500 text-xs font-mono ml-1">v{e.prompt_version}</span>
                  </td>
                  <td className="px-4 py-3.5 text-neutral-400 font-mono text-xs">{e.model}</td>
                  <td className="px-4 py-3.5 font-bold font-mono">
                    <span className={e.overall_score >= 70 ? "text-green-500" : "text-red-500"}>
                      {e.overall_score.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-neutral-300 text-xs">
                    <span className="text-green-500">{e.passed_tests} passed</span> / <span className="text-red-400">{e.failed_tests} failed</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        e.status === "completed"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : e.status === "failed"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      }`}
                    >
                      {e.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-neutral-500 text-xs">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors ml-auto" />
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
