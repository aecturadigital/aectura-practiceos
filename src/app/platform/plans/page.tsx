"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { PLANS, PlanId } from "@/lib/plans";
import { useTenant } from "@/context/tenant-context";

export default function PlatformPlansPage() {
  const { activeTenant, switchPlan } = useTenant();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#22252C] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Platform Plans &amp; Entitlements</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Aectura PracticeOS tiered subscription structure and feature flags governing all multi-tenant practices.
        </p>
      </div>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["presence", "practiceflow", "practiceos_ai"] as PlanId[]).map((pid) => {
          const plan = PLANS[pid];
          const isCurrentActive = activeTenant.planId === pid;

          return (
            <div
              key={pid}
              className={`bg-[#16181D] border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                plan.isPopular
                  ? "border-teal-700 shadow-xl shadow-teal-950/40 relative"
                  : "border-[#242833]"
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-teal-950 uppercase tracking-wider shadow">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {isCurrentActive && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                      Active on {activeTenant.name}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed">{plan.tagline}</p>

                <div className="mb-6 p-4 rounded-2xl bg-[#111315] border border-[#242833]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ₹{plan.monthlyFeeInr.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400">/month</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Setup Fee: ₹{plan.setupFeeInr.toLocaleString("en-IN")} one-time
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Included Features &amp; Entitlements
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-[#242833]">
                <button
                  onClick={() => switchPlan(pid)}
                  disabled={isCurrentActive}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isCurrentActive
                      ? "bg-teal-950/60 text-teal-400 border border-teal-800/80 cursor-default"
                      : "bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-md"
                  }`}
                >
                  {isCurrentActive ? "Currently Selected" : `Apply to ${activeTenant.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Entitlement Matrix Table */}
      <div className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white mb-2">Entitlement Matrix</h2>
        <p className="text-xs text-slate-400 mb-6">
          Architectural feature flags enforced by the platform runtime.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#242833] text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Feature Module</th>
                <th className="py-3 px-4 text-center">Presence</th>
                <th className="py-3 px-4 text-center">PracticeFlow</th>
                <th className="py-3 px-4 text-center">PracticeOS AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22252C] text-slate-300">
              {[
                { name: "Practice Website & Hosting", presence: true, flow: true, ai: true },
                { name: "Custom Domain Routing", presence: true, flow: true, ai: true },
                { name: "360° Patient & Client Database", presence: false, flow: true, ai: true },
                { name: "CRM Kanban Deal Pipeline", presence: false, flow: true, ai: true },
                { name: "Appointments Calendar Engine", presence: false, flow: true, ai: true },
                { name: "Client Self-Service Portal", presence: false, flow: true, ai: true },
                { name: "Clinical Intake Form Builder", presence: false, flow: true, ai: true },
                { name: "Physiotherapy Exercise Programmes", presence: false, flow: true, ai: true },
                { name: "24h Automated Reminders Architecture", presence: false, flow: true, ai: true },
                { name: "Autonomous AI Receptionist (24/7)", presence: false, flow: false, ai: true },
                { name: "AI Knowledge Base & RAG Retrieval", presence: false, flow: false, ai: true },
                { name: "WhatsApp AI Conversation Handling", presence: false, flow: false, ai: true },
                { name: "AI Practice Intelligence & Forecasts", presence: false, flow: false, ai: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#1A1D24] transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{row.name}</td>
                  <td className="py-3 px-4 text-center">
                    {row.presence ? <Check className="w-4 h-4 text-teal-400 mx-auto" /> : <span className="text-slate-600">&mdash;</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.flow ? <Check className="w-4 h-4 text-teal-400 mx-auto" /> : <span className="text-slate-600">&mdash;</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.ai ? <Check className="w-4 h-4 text-teal-400 mx-auto" /> : <span className="text-slate-600">&mdash;</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
