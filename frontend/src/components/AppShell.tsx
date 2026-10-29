"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderKanban,
  Activity,
  ShieldAlert,
  Settings as SettingsIcon,
  Zap,
  Play,
  GitCompare,
  FlaskConical,
  Mic,
  Database,
  ChevronDown,
  Plus,
  Building2,
  Check,
  Sparkles,
  Bot,
} from "lucide-react";
import { setAuthToken, getOrganizations, createOrganization, Organization, getProjects, createProject } from "@/lib/api";
import AgentLoader from "./AgentLoader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  // Organizations & Projects state
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  // Create Org Modal
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  // Create Agent / Project Modal
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentPurpose, setNewAgentPurpose] = useState("");

  useEffect(() => {
    if (user?.id) {
      setAuthToken(null, user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    async function initOrgsAndProjects() {
      const orgList = await getOrganizations();
      setOrgs(orgList);
      if (orgList.length > 0) {
        const savedOrgId = typeof window !== "undefined" ? localStorage.getItem("prmptlab_active_org") : null;
        const found = orgList.find(o => o.id === savedOrgId) || orgList[0];
        setActiveOrg(found);
      }

      const projList = await getProjects();
      setProjects(projList);
      if (projList.length > 0) {
        const savedProjId = typeof window !== "undefined" ? localStorage.getItem("prmptlab_active_proj") : null;
        const foundP = projList.find(p => p.id === savedProjId) || projList[0];
        setActiveProject(foundP);
      }
    }
    if (isSignedIn) {
      initOrgsAndProjects();
    }
  }, [isSignedIn]);

  const handleSelectOrg = (org: Organization) => {
    setActiveOrg(org);
    if (typeof window !== "undefined") {
      localStorage.setItem("prmptlab_active_org", org.id);
    }
    setOrgDropdownOpen(false);
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    const created = await createOrganization(newOrgName.trim());
    setOrgs(prev => [...prev, created]);
    setActiveOrg(created);
    setNewOrgName("");
    setShowOrgModal(false);
  };

  const handleSelectProject = (proj: any) => {
    setActiveProject(proj);
    if (typeof window !== "undefined") {
      localStorage.setItem("prmptlab_active_proj", proj.id);
    }
    setProjectDropdownOpen(false);
    router.push(`/projects/${proj.id}`);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;
    const created = await createProject(newAgentName.trim(), newAgentPurpose.trim());
    setProjects(prev => [created, ...prev]);
    setActiveProject(created);
    setNewAgentName("");
    setNewAgentPurpose("");
    setShowAgentModal(false);
    router.push(`/projects/${created.id}`);
  };

  if (!isLoaded) {
    if (pathname === "/") {
      return <>{children}</>;
    }

    return <AgentLoader />;
  }

  if (pathname === "/") {
    return <>{children}</>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-[#ededed]">
        <header className="border-b border-[#222222] bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/prmptlab-logo-white-transparent.png" alt="prmptlab" className="w-8 h-8 object-contain" />
              <span className="font-mono font-semibold text-lg tracking-tight text-white">prmptlab</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-neutral-400">
              <Link href="/" className="hover:text-white transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <a href="mailto:hello@bludotlabs.com" className="hover:text-white transition-colors">Enterprise</a>
            </nav>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-1.5 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="bg-white text-black hover:bg-neutral-200 text-sm font-medium px-4 py-1.5 rounded-md transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full p-8">{children}</main>
      </div>
    );
  }

  const navItems = [
    { label: "Agents & Profiles", href: "/dashboard", icon: Bot, match: (p: string) => p === "/dashboard" || p === "/" || p.startsWith("/projects") },
    { label: "Prompt Playground", href: "/playground", icon: Play, match: (p: string) => p.startsWith("/playground") },
    { label: "Version Comparison", href: "/compare", icon: GitCompare, match: (p: string) => p.startsWith("/compare") },
    { label: "Test Suite Library", href: "/suites", icon: FlaskConical, match: (p: string) => p.startsWith("/suites") },
    { label: "Voice Agent Lab", href: "/voice-lab", icon: Mic, match: (p: string) => p.startsWith("/voice-lab") },
    { label: "Red Team Attacks", href: "/red-team", icon: ShieldAlert, match: (p: string) => p.startsWith("/red-team") },
    { label: "Evaluations & Reports", href: "/evaluations", icon: Activity, match: (p: string) => p.startsWith("/evaluations") || p.startsWith("/runs") },
    { label: "Conversation Datasets", href: "/datasets", icon: Database, match: (p: string) => p.startsWith("/datasets") },
  ];

  return (
    <div className="flex min-h-screen bg-black text-[#ededed]">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-[#222222] bg-[#0a0a0a] flex flex-col shrink-0">

        {/* Brand Header */}
        <div className="p-4 border-b border-[#222222]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/prmptlab-logo-white-transparent.png" alt="prmptlab" className="w-7 h-7 object-contain" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm tracking-tight text-white">prmptlab</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">v2.4</span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">Agent Quality Engine</p>
            </div>
          </Link>
        </div>

        {/* Organization & Project Context Switcher (Supabase / Figma style) */}
        <div className="p-3 border-b border-[#222222] space-y-2 bg-[#0d0d0d]">
          {/* Org Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setOrgDropdownOpen(!orgDropdownOpen);
                setProjectDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs bg-[#161616] hover:bg-[#202020] border border-[#2a2a2a] text-neutral-200 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-medium truncate">{activeOrg?.name || "Select Org"}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#141414] border border-[#333333] rounded-lg shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Organizations</div>
                {orgs.map(org => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrg(org)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#222222] flex items-center justify-between text-neutral-300 hover:text-white"
                  >
                    <span className="truncate">{org.name}</span>
                    {activeOrg?.id === org.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
                <div className="border-t border-[#262626] my-1"></div>
                <button
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    setShowOrgModal(true);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#222222] text-neutral-400 hover:text-white flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Create Organization</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Agent / Project Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setProjectDropdownOpen(!projectDropdownOpen);
                setOrgDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Bot className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-mono truncate">{activeProject?.name || "Select Agent"}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>

            {projectDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#141414] border border-[#333333] rounded-lg shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Agents & Projects</div>
                {projects.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => handleSelectProject(proj)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#222222] flex items-center justify-between text-neutral-300 hover:text-white"
                  >
                    <span className="truncate">{proj.name}</span>
                    {activeProject?.id === proj.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
                <div className="border-t border-[#262626] my-1"></div>
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    setShowAgentModal(true);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#222222] text-neutral-400 hover:text-white flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-neutral-400" />
                  <span>New Agent Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Workspace</div>
          {navItems.map(item => {
            const isActive = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${isActive
                    ? "bg-[#1f1f1f] text-white border border-[#333333]"
                    : "text-neutral-400 hover:bg-[#141414] hover:text-white"
                  }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-neutral-400 group-hover:text-white"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 px-2 py-1 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">System</div>
          <Link
            href="/pricing"
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${pathname === "/pricing"
                ? "bg-[#1f1f1f] text-white border border-[#333333]"
                : "text-neutral-400 hover:bg-[#141414] hover:text-white"
              }`}
          >
            <Zap className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            <span>Pricing & Quota</span>
          </Link>
          <Link
            href="/settings"
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${pathname === "/settings"
                ? "bg-[#1f1f1f] text-white border border-[#333333]"
                : "text-neutral-400 hover:bg-[#141414] hover:text-white"
              }`}
          >
            <SettingsIcon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#222222] bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="text-[11px] text-neutral-400 font-mono">PRO PLAN</span>
          </div>
          <UserButton showName={false} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-black overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>

      {/* Create Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create New Organization</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Organizations allow your team to isolate agent profiles, test suites, and regression evaluations.
            </p>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">ORGANIZATION NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bolna Voice Labs"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-xs font-semibold"
                >
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Agent Profile Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create Agent Profile</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Define a standalone AI Agent with dedicated system prompts, tool schemas, and quality test suites.
            </p>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">AGENT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dental Receptionist"
                  value={newAgentName}
                  onChange={e => setNewAgentName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">AGENT PURPOSE / MISSION</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Handles patient booking, cancellation, rescheduling, insurance lookup, and empathetic triage."
                  value={newAgentPurpose}
                  onChange={e => setNewAgentPurpose(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAgentModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-xs font-semibold"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
