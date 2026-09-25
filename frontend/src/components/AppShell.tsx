"use client";

import { useEffect } from "react";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { FolderKanban, Activity, ShieldAlert, Settings as SettingsIcon, Zap } from "lucide-react";
import { setAuthToken } from "@/lib/api";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, user } = useUser();

  useEffect(() => {
    if (user?.id) {
      setAuthToken(null, user.id);
    }
  }, [user?.id]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-500 text-sm animate-pulse font-mono">
        Loading prmptlab...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-[#ededed]">
        <header className="border-b border-[#222222] bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="prmptlab" className="w-7 h-7 object-contain" />
              <span className="font-mono font-semibold text-lg tracking-tight text-white">prmptlab</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-neutral-400">
              <Link href="/" className="hover:text-white transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <a href="mailto:hello@bludotlabs.com" className="hover:text-white transition-colors">Enterprise</a>
            </nav>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-1.5 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
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

  return (
    <div className="flex min-h-screen bg-black text-[#ededed]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#222222] bg-[#0a0a0a] p-4 flex flex-col shrink-0">
        <div className="mb-8 px-2">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="prmptlab" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-xl font-mono font-semibold tracking-tight text-white leading-none">
                prmptlab
              </h1>
              <p className="text-xs text-neutral-500 mt-1 font-mono">Test. Break. Improve.</p>
            </div>
          </Link>
        </div>

        <nav className="space-y-1 flex-1">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:text-white transition-colors">
            <FolderKanban className="w-4 h-4 text-blue-400" />
            Projects
          </Link>
          <Link href="/evaluations" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:text-white transition-colors">
            <Activity className="w-4 h-4 text-green-400" />
            Evaluations
          </Link>
          <Link href="/red-team" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:text-white transition-colors">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            Red Team
          </Link>
          <Link href="/pricing" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:text-white transition-colors">
            <Zap className="w-4 h-4 text-amber-400" />
            Pricing & Plans
          </Link>
          <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:text-white transition-colors">
            <SettingsIcon className="w-4 h-4 text-neutral-400" />
            Settings
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#222222] flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-neutral-400 font-mono">FREE PLAN</span>
          </div>
          <UserButton showName={false} />
        </div>
      </div>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
