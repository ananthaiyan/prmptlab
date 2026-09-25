"use client";

import { useState } from "react";
import { Check, Zap, Shield, Sparkles, Building } from "lucide-react";
import { createCheckoutSession } from "@/lib/api";

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCheckout = async (plan: string) => {
    setLoadingPlan(plan);
    setError("");
    try {
      const res = await createCheckoutSession(plan);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initiate checkout");
      setLoadingPlan(null);
    }
  };

  const mailtoEnterprise = "mailto:hello@bludotlabs.com?subject=PromptBench%20Enterprise%20Inquiry&body=Hi%20Bludot%20Labs%2C%0A%0AI'm%20interested%20in%20PromptBench%20Enterprise.%0A%0ACompany%3A%0ATeam%20size%3A%0AExpected%20evaluation%20volume%3A%0AUse%20case%3A%0A%0AThanks%2C";

  return (
    <div className="py-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
          <Zap className="w-3.5 h-3.5" /> Simple, Transparent Developer Pricing
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          Ship AI agents with confidence.
        </h1>
        <p className="text-neutral-400 text-lg">
          Test prompts, edge cases and agent behavior before your users do.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* FREE */}
        <div className="border border-[#333333] rounded-xl bg-[#141414] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-white">FREE</h3>
              <span className="text-xs font-mono bg-[#1a1a1a] px-2 py-0.5 rounded text-neutral-400 border border-[#333333]">Hobby</span>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-neutral-500 text-sm"> / month</span>
            </div>
            <ul className="space-y-3 text-sm text-neutral-300 mb-8">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-500 shrink-0"/> 3 projects</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-500 shrink-0"/> 1 suite / project</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-500 shrink-0"/> 2 prompts / project</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-500 shrink-0"/> 10 tests / suite</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-500 shrink-0"/> 500 evaluations / mo</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-500 shrink-0"/> Basic red teaming</li>
            </ul>
          </div>
          <button className="w-full bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] text-white py-2 rounded-md text-sm font-medium transition-colors">
            Current Plan
          </button>
        </div>

        {/* PLUS */}
        <div className="border border-blue-500/50 rounded-xl bg-[#141414] p-6 flex flex-col justify-between relative shadow-lg shadow-blue-500/5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Popular
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-white">PLUS</h3>
              <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Startup</span>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$19</span>
              <span className="text-neutral-500 text-sm"> / month</span>
            </div>
            <ul className="space-y-3 text-sm text-neutral-300 mb-8">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> 10 projects</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> 5 suites / project</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> 10 prompts / project</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> 100 tests / suite</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> 10,000 evaluations / mo</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> Red-team generation</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> Prompt comparison</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> Regression testing</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-400 shrink-0"/> API Access</li>
            </ul>
          </div>
          <button 
            onClick={() => handleCheckout("PLUS")}
            disabled={loadingPlan === "PLUS"}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loadingPlan === "PLUS" ? "Processing..." : "Start Plus"}
          </button>
        </div>

        {/* PRO */}
        <div className="border border-purple-500/50 rounded-xl bg-[#141414] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-white">PRO</h3>
              <span className="text-xs font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">Scale</span>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$49</span>
              <span className="text-neutral-500 text-sm"> / month</span>
            </div>
            <ul className="space-y-3 text-sm text-neutral-300 mb-8">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400 shrink-0"/> 50 projects</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400 shrink-0"/> 20 suites / project</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400 shrink-0"/> 50 prompts / project</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400 shrink-0"/> 500 tests / suite</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400 shrink-0"/> 50,000 evaluations / mo</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400 shrink-0"/> Advanced red-teaming</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400 shrink-0"/> CLI & CI Integration</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-purple-400 shrink-0"/> Team Workspaces</li>
            </ul>
          </div>
          <button 
            onClick={() => handleCheckout("PRO")}
            disabled={loadingPlan === "PRO"}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loadingPlan === "PRO" ? "Processing..." : "Start Pro"}
          </button>
        </div>

        {/* ENTERPRISE */}
        <div className="border border-[#333333] rounded-xl bg-[#141414] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-white">ENTERPRISE</h3>
              <Building className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">Custom</span>
            </div>
            <ul className="space-y-3 text-sm text-neutral-300 mb-8">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-neutral-400 shrink-0"/> Custom projects</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-neutral-400 shrink-0"/> Custom evaluation volume</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-neutral-400 shrink-0"/> Custom test limits</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-neutral-400 shrink-0"/> SSO & SAML</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-neutral-400 shrink-0"/> Dedicated Support</li>
            </ul>
          </div>
          <a 
            href={mailtoEnterprise}
            className="w-full bg-white text-black hover:bg-neutral-200 py-2 rounded-md text-sm font-medium transition-colors text-center block"
          >
            Talk to Sales
          </a>
        </div>
      </div>
    </div>
  );
}
