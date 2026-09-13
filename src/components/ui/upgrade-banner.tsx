"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { FeatureKey, FEATURE_UPGRADES, PLANS, PlanId } from "@/lib/plans";

interface UpgradeBannerProps {
  feature: FeatureKey;
}

export function UpgradeBanner({ feature }: UpgradeBannerProps) {
  const { activeTenant, switchPlan } = useTenant();
  const info = FEATURE_UPGRADES[feature];
  const targetPlan = PLANS[info.requiredPlanId];
  const [upgraded, setUpgraded] = useState(false);

  const handleUpgrade = () => {
    switchPlan(info.requiredPlanId);
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-[#272A34] bg-gradient-to-b from-[#181A1E] to-[#121417] p-8 max-w-2xl mx-auto my-8 text-center shadow-2xl relative overflow-hidden">
      <div className="w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-700/50 flex items-center justify-center text-teal-400 mx-auto mb-4">
        <Lock className="w-6 h-6" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/50 border border-teal-800 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Upgrade Available</span>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">{info.featureName}</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        {info.description} This feature is included on the{" "}
        <strong className="text-white font-semibold">{info.requiredPlanName}</strong> tier.
      </p>

      <div className="bg-[#1C1F26] border border-[#2B2F3B] rounded-xl p-4 max-w-md mx-auto mb-6 text-left">
        <div className="flex items-center justify-between border-b border-[#2B2F3B] pb-3 mb-3">
          <div>
            <p className="text-xs font-semibold text-white">{targetPlan.name}</p>
            <p className="text-[11px] text-slate-400">Monthly subscription</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-teal-400">
              ₹{targetPlan.monthlyFeeInr.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-400">/mo</span>
          </div>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {targetPlan.features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleUpgrade}
        className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-lg inline-flex items-center gap-2"
      >
        {upgraded ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Upgraded Successfully!</span>
          </>
        ) : (
          <>
            <span>Upgrade to {info.requiredPlanName}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-[11px] text-slate-500 mt-3">
        Instant simulated upgrade. In production, this initiates Stripe/Razorpay billing.
      </p>
    </div>
  );
}
