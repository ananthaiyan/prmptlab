"use client";

import { Zap, X } from "lucide-react";
import Link from "next/link";
import { createCheckoutSession } from "@/lib/api";
import { useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: string;
  limit?: number;
  current?: number;
  requiredPlan?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  resource = "resources",
  limit = 3,
  current = 3,
  requiredPlan = "PLUS",
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await createCheckoutSession(requiredPlan);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
          <Zap className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          {requiredPlan} Plan Limit Reached
        </h3>
        
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          You have reached your Free plan limit of <span className="text-white font-mono">{limit}</span> {resource} (<span className="text-amber-400 font-mono">{current}/{limit}</span> used). Upgrade to <span className="text-white font-semibold">{requiredPlan}</span> for higher limits and full developer tooling.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-white hover:bg-neutral-200 text-black font-medium py-2.5 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Redirecting..." : `Upgrade to ${requiredPlan}`}
          </button>

          <Link
            href="/pricing"
            onClick={onClose}
            className="w-full bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] text-neutral-300 hover:text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors flex items-center justify-center"
          >
            View All Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
