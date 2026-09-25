"use client";

import { useEffect, useState } from "react";
import { getSubscription, getProjects } from "@/lib/api";
import { UserProfile, useUser } from "@clerk/nextjs";
import { Settings as SettingsIcon, CreditCard, Shield, Zap, Database, Trash2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"account" | "workspace" | "billing" | "usage" | "security" | "danger">("billing");
  const [sub, setSub] = useState<any>(null);
  const [projectsCount, setProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSubscription(), getProjects()])
      .then(([s, p]) => {
        setSub(s);
        setProjectsCount(p.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-neutral-500 animate-pulse">Loading settings...</div>;
  }

  const limits = sub?.limits || { projects: 3, evaluations_per_month: 500 };
  const usage = sub?.usage || { projects: projectsCount, evaluations_this_month: 0 };
  const currentPlan = sub?.plan || "FREE";

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-neutral-400" /> Settings & Workspace
          </h2>
          <p className="text-neutral-400">
            Manage your account settings, subscription plan, usage limits, and workspace security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === "billing" ? "bg-[#1a1a1a] text-white font-semibold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-400" /> Billing & Plan
          </button>

          <button
            onClick={() => setActiveTab("usage")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === "usage" ? "bg-[#1a1a1a] text-white font-semibold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Database className="w-4 h-4 text-blue-400" /> Usage & Limits
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === "account" ? "bg-[#1a1a1a] text-white font-semibold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-green-400" /> Account Profile
          </button>

          <button
            onClick={() => setActiveTab("workspace")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === "workspace" ? "bg-[#1a1a1a] text-white font-semibold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" /> Workspace & Role
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
              activeTab === "danger" ? "bg-[#1a1a1a] text-red-400 font-semibold" : "text-neutral-400 hover:text-red-400"
            }`}
          >
            <Trash2 className="w-4 h-4 text-red-400" /> Danger Zone
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* BILLING TAB */}
          {activeTab === "billing" && (
            <div className="border border-[#333333] rounded-xl bg-[#141414] p-6 space-y-6">
              <h3 className="text-xl font-semibold text-white">Billing Management</h3>
              
              <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#222222] rounded-lg">
                <div>
                  <span className="text-xs font-mono text-neutral-500 uppercase">Current Plan</span>
                  <div className="text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
                    {currentPlan}
                    <span className="text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-normal">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <Link
                  href="/pricing"
                  className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Upgrade Plan
                </Link>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-medium text-neutral-300">Plan Entitlements</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#0a0a0a] border border-[#222222] rounded">
                    <span className="text-neutral-500 block mb-1">Projects Allowed</span>
                    <span className="font-bold text-white font-mono text-sm">{limits.projects}</span>
                  </div>
                  <div className="p-3 bg-[#0a0a0a] border border-[#222222] rounded">
                    <span className="text-neutral-500 block mb-1">Monthly Evaluations</span>
                    <span className="font-bold text-white font-mono text-sm">{limits.evaluations_per_month}</span>
                  </div>
                  <div className="p-3 bg-[#0a0a0a] border border-[#222222] rounded">
                    <span className="text-neutral-500 block mb-1">Prompts / Project</span>
                    <span className="font-bold text-white font-mono text-sm">{limits.prompts_per_project}</span>
                  </div>
                  <div className="p-3 bg-[#0a0a0a] border border-[#222222] rounded">
                    <span className="text-neutral-500 block mb-1">Tests / Suite</span>
                    <span className="font-bold text-white font-mono text-sm">{limits.tests_per_suite}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USAGE TAB */}
          {activeTab === "usage" && (
            <div className="border border-[#333333] rounded-xl bg-[#141414] p-6 space-y-6">
              <h3 className="text-xl font-semibold text-white">Usage & Quotas</h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-neutral-300">Projects</span>
                    <span className="text-neutral-400 font-mono">{usage.projects} / {limits.projects}</span>
                  </div>
                  <div className="w-full bg-[#0a0a0a] border border-[#222222] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (usage.projects / limits.projects) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-neutral-300">Evaluations This Month</span>
                    <span className="text-neutral-400 font-mono">{usage.evaluations_this_month} / {limits.evaluations_per_month}</span>
                  </div>
                  <div className="w-full bg-[#0a0a0a] border border-[#222222] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (usage.evaluations_this_month / limits.evaluations_per_month) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <div className="border border-[#333333] rounded-xl bg-[#141414] p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Account Profile</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Email Address</label>
                  <div className="p-2.5 bg-[#0a0a0a] border border-[#222222] rounded text-white font-mono">
                    {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">User ID</label>
                  <div className="p-2.5 bg-[#0a0a0a] border border-[#222222] rounded text-neutral-400 font-mono text-xs">
                    {user?.id || "clerk_user_id"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE TAB */}
          {activeTab === "workspace" && (
            <div className="border border-[#333333] rounded-xl bg-[#141414] p-6 space-y-4">
              <h3 className="text-xl font-semibold text-white">Workspace Roles</h3>
              <div className="p-4 bg-[#0a0a0a] border border-[#222222] rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Default Developer Workspace</div>
                  <div className="text-xs text-neutral-500">Personal Workspace</div>
                </div>
                <span className="text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded uppercase font-bold">
                  OWNER
                </span>
              </div>
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === "danger" && (
            <div className="border border-red-500/30 rounded-xl bg-[#141414] p-6 space-y-4">
              <h3 className="text-xl font-semibold text-red-500">Danger Zone</h3>
              <p className="text-sm text-neutral-400">
                Permanently remove your personal workspace data and evaluation history. This action cannot be undone.
              </p>
              <button className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded text-sm transition-colors">
                Delete Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
