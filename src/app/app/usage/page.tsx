"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  HardDrive,
  Users,
  MessageSquare,
  Bot,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { PLANS, PLAN_CONFIGS } from "@/lib/plans";
import { PlanId } from "@/types";

export default function StaffUsagePage() {
  const { activeTenant, plan, vertical } = useTenant();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(activeTenant.planId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSwitchPlan = (newPlan: PlanId) => {
    mockStore.updateTenant(activeTenant.id, { planId: newPlan });
    setSelectedPlanId(newPlan);
    setToastMessage(`Practice plan updated to ${PLAN_CONFIGS[newPlan].name}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const planConfig = PLAN_CONFIGS[activeTenant.planId];

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-teal-900 border border-teal-600 text-teal-100 px-4 py-3 rounded-2xl shadow-2xl text-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Subscription &amp; Capacity Quotas</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Plan &amp; Usage</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review active entitlement limits, practitioner seats, storage utilization, and billing tier.
          </p>
        </div>

        {/* Active Plan Pill */}
        <div className="p-4 rounded-2xl bg-[#101217] border border-[#232630] space-y-1 self-start sm:self-auto">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active Plan</span>
            <span className="text-xs font-bold text-teal-400">{planConfig.name}</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ₹{planConfig.monthlyFeeInr.toLocaleString("en-IN")}
            <span className="text-xs text-slate-500 font-sans"> / month</span>
          </div>
        </div>
      </div>

      {/* Usage Quota Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Seats */}
        <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Practitioner Seats</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {activeTenant.team.length} / 5
          </div>
          <div className="h-1.5 w-full bg-[#101216] rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${(activeTenant.team.length / 5) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">2 licensed seats remaining</p>
        </div>

        {/* Storage */}
        <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Document Vault</span>
            <HardDrive className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">2.7 / 20 GB</div>
          <div className="h-1.5 w-full bg-[#101216] rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full w-[13.5%]" />
          </div>
          <p className="text-[10px] text-slate-500">17.3 GB free encrypted storage</p>
        </div>

        {/* AI Triage */}
        <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">AI Receptionist Leads</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">148</div>
          <div className="h-1.5 w-full bg-[#101216] rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-full" />
          </div>
          <p className="text-[10px] text-slate-500">Unlimited on PracticeOS AI plan</p>
        </div>

        {/* WhatsApp Credits */}
        <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">WhatsApp Reminders</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">184 / 1,000</div>
          <div className="h-1.5 w-full bg-[#101216] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[18.4%]" />
          </div>
          <p className="text-[10px] text-slate-500">816 messages remaining this billing cycle</p>
        </div>
      </div>

      {/* Plan Switcher Comparison */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Available Practice Plans</h2>
          <p className="text-xs text-slate-400">
            Easily toggle between plans to preview unlocked features and live feature gating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(PLAN_CONFIGS) as PlanId[]).map((pid) => {
            const p = PLAN_CONFIGS[pid];
            const isCurrent = activeTenant.planId === pid;

            return (
              <div
                key={pid}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                  isCurrent
                    ? "bg-[#161A24] border-teal-600 shadow-lg ring-1 ring-teal-500/50"
                    : "bg-[#14161B] border-[#232630] hover:border-slate-700"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-teal-400">
                      {p.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-white font-mono">
                      ₹{p.monthlyFeeInr.toLocaleString("en-IN")}
                      <span className="text-xs text-slate-500 font-sans"> / mo</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Setup: ₹{p.setupFeeInr.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{p.tagline}</p>

                  <ul className="space-y-2 text-xs text-slate-400 border-t border-[#232630] pt-4">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="text-slate-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#232630]">
                  {isCurrent ? (
                    <div className="py-2.5 text-center text-xs font-semibold text-teal-400 bg-teal-950/60 rounded-xl border border-teal-800/60">
                      Active Subscription
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSwitchPlan(pid)}
                      className="w-full py-2.5 rounded-xl bg-[#1C1F28] hover:bg-teal-600 hover:text-white text-slate-200 text-xs font-semibold border border-[#2B2F3D] hover:border-teal-500 transition-all shadow-sm"
                    >
                      Switch to {p.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
