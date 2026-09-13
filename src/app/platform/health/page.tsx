"use client";

import React from "react";
import { Activity, ShieldCheck, Database, Zap, Sparkles, HardDrive, MessageSquare, Server, Check } from "lucide-react";
import { DemoEnvironmentBadge } from "@/components/ui/demo-environment-badge";

export default function PlatformHealthPage() {
  const subsystems = [
    {
      name: "Next.js App Router Frontend",
      status: "Operational",
      type: "ACTIVE",
      latency: "12ms",
      details: "Client components, Server components, Tailwind CSS design system.",
      icon: Server,
    },
    {
      name: "PostgreSQL Multi-Tenant Database",
      status: "Demo In-Memory",
      type: "DEMO",
      latency: "Local",
      details: "Local reactive state with localStorage persistence. Production PostgreSQL + Drizzle connection ready.",
      icon: Database,
    },
    {
      name: "n8n Workflow Automation Engine",
      status: "Not Connected",
      type: "DEMO",
      latency: "N/A",
      details: "Event webhook contracts (lead.created, appointment.confirmed) defined and validated.",
      icon: Zap,
    },
    {
      name: "Conversational AI Receptionist (Maya)",
      status: "Simulated",
      type: "DEMO",
      latency: "150ms (Mock)",
      details: "Knowledge base retrieval and medical safety boundaries running in interactive simulation mode.",
      icon: Sparkles,
    },
    {
      name: "WhatsApp Cloud API Gateway",
      status: "Simulated",
      type: "DEMO",
      latency: "Simulated",
      details: "Shared unified inbox and patient portal two-way messaging simulator.",
      icon: MessageSquare,
    },
    {
      name: "Cloudflare R2 Storage & CDN",
      status: "Demo Storage",
      type: "DEMO",
      latency: "Local",
      details: "Presigned URL upload contract and client-side object storage.",
      icon: HardDrive,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#22252C] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">System Health &amp; Subsystems</h1>
            <DemoEnvironmentBadge />
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time telemetry and infrastructure connection states across platform services.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-3">
        <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">Demonstration Mode Active</p>
          <p className="text-amber-200/80 leading-relaxed">
            External production backends (PostgreSQL, n8n webhook runner, WhatsApp Cloud API, and Cloudflare R2) are intentionally not connected to avoid unverified credentials. All features function interactively using our reactive client-side mock service abstractions.
          </p>
        </div>
      </div>

      {/* Subsystem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subsystems.map((sub, idx) => {
          const Icon = sub.icon;
          return (
            <div
              key={idx}
              className="bg-[#16181D] border border-[#242833] rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#111315] border border-[#272A34] text-teal-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-xs font-bold text-white">{sub.name}</h2>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      sub.type === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{sub.details}</p>
              </div>

              <div className="pt-3 border-t border-[#22252C] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Response / Latency</span>
                <span className="text-slate-300">{sub.latency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
