
"use client";

import { useState } from "react";
import { Check, Zap, Building2, ArrowUpRight, Sparkles } from "lucide-react";
import { createCheckoutSession } from "@/lib/api";

const plans = [
  {
    name: "Free",
    subtitle: "For individual builders",
    price: "$0",
    period: "/ month",
    features: [
      "3 projects",
      "1 suite per project",
      "2 prompts per project",
      "10 tests per suite",
      "500 evaluations / month",
      "Basic red teaming",
    ],
    button: "Get started",
    action: "FREE",
  },
  {
    name: "Plus",
    subtitle: "For growing AI teams",
    price: "$19",
    period: "/ month",
    features: [
      "10 projects",
      "5 suites per project",
      "10 prompts per project",
      "100 tests per suite",
      "10,000 evaluations / month",
      "Red-team generation",
      "Prompt comparison",
      "Regression testing",
      "API access",
    ],
    button: "Start with Plus",
    action: "PLUS",
    featured: true,
  },
  {
    name: "Pro",
    subtitle: "For teams shipping at scale",
    price: "$49",
    period: "/ month",
    features: [
      "50 projects",
      "20 suites per project",
      "50 prompts per project",
      "500 tests per suite",
      "50,000 evaluations / month",
      "Advanced red teaming",
      "CLI & CI integration",
      "Team workspaces",
    ],
    button: "Start with Pro",
    action: "PRO",
  },
  {
    name: "Enterprise",
    subtitle: "For organizations",
    price: "Custom",
    period: "",
    features: [
      "Custom project limits",
      "Custom evaluation volume",
      "Custom test limits",
      "SSO & SAML",
      "Dedicated support",
    ],
    button: "Talk to sales",
    enterprise: true,
  },
];

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
      } else {
        setError("Unable to start checkout. Please try again.");
        setLoadingPlan(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initiate checkout");
      setLoadingPlan(null);
    }
  };

  const mailtoEnterprise =
    "mailto:hello@bludotlabs.com?subject=PromptBench%20Enterprise%20Inquiry&body=Hi%20Bludot%20Labs%2C%0A%0AI'm%20interested%20in%20PromptBench%20Enterprise.%0A%0ACompany%3A%0ATeam%20size%3A%0AExpected%20evaluation%20volume%3A%0AUse%20case%3A%0A%0AThanks%2C";

  return (
    <div className="relative isolate min-h-full overflow-hidden bg-black px-4 py-14 text-white sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.11),transparent_65%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-neutral-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Plans built for AI development
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Ship better agents.
            <span className="mt-2 block bg-gradient-to-r from-neutral-200 via-white to-neutral-500 bg-clip-text text-transparent">
              Not more guesswork.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
            Evaluate prompts, stress-test edge cases, and catch regressions
            before they reach production.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
            <span className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-blue-400" />
              Start for free
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-blue-400" />
              Upgrade as you scale
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-blue-400" />
              Built for developers
            </span>
          </div>
        </header>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {plans.map((plan, index) => (
            <section
              key={plan.name}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 sm:p-7 ${plan.featured
                ? "border-blue-400/40 bg-[#10141c] shadow-[0_0_50px_rgba(59,130,246,0.08)] hover:border-blue-400/60"
                : "border-white/[0.09] bg-[#0b0b0d] hover:border-white/20 hover:bg-[#0e0e11]"
                }`}
            >
              {plan.featured && (
                <>
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                  <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                    <Zap className="h-3 w-3" />
                    Popular
                  </div>
                </>
              )}

              <div className="flex-1">
                <div className="mb-7">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold tracking-wide ${plan.featured ? "text-blue-300" : "text-white"
                        }`}
                    >
                      {plan.name}
                    </span>
                    {plan.enterprise && (
                      <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                    )}
                  </div>
                  <p className="text-xs leading-5 text-neutral-500">
                    {plan.subtitle}
                  </p>
                </div>

                <div className="mb-7 border-b border-white/[0.08] pb-7">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tracking-[-0.05em] text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-neutral-500">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.enterprise ? (
                    <p className="mt-2 text-xs text-neutral-500">
                      Tailored to your organization
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-500">
                      No long-term commitment
                    </p>
                  )}
                </div>

                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  What&apos;s included
                </p>

                <ul className="space-y-3.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[12px] leading-5 text-neutral-300"
                    >
                      <Check
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${plan.featured
                          ? "text-blue-400"
                          : "text-neutral-500"
                          }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-2">
                {plan.enterprise ? (
                  <a
                    href={mailtoEnterprise}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08]"
                  >
                    {plan.button}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : plan.action === "FREE" ? (
                  <button
                    type="button"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    {plan.button}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCheckout(plan.action!)}
                    disabled={loadingPlan !== null}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${plan.featured
                      ? "bg-blue-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.15)] hover:bg-blue-400"
                      : "border border-white/15 bg-white text-black hover:bg-neutral-200"
                      }`}
                  >
                    {loadingPlan === plan.action
                      ? "Processing..."
                      : plan.button}
                    {loadingPlan !== plan.action && (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mx-auto mt-6 max-w-xl rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-center text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-neutral-500">
            Need something specific? Let&apos;s build the right plan for your team.
          </p>
          <a
            href={mailtoEnterprise}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 transition-colors hover:text-white"
          >
            Contact our team
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
