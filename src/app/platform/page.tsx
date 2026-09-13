"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  CreditCard,
  Users,
  Calendar,
  Sparkles,
  HardDrive,
  Activity,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { tenantService, contactService, appointmentService } from "@/services";

export default function PlatformOverviewPage() {
  const { tenants, activeTenant, switchTenant } = useTenant();

  const activeTenantsCount = tenants.filter((t) => t.status === "ACTIVE").length;
  const previewTenantsCount = tenants.filter((t) => t.status === "PREVIEW").length;

  // Calculate MRR from tenants
  const totalMrr = tenants.reduce((sum, t) => {
    if (t.planId === "presence") return sum + 999;
    if (t.planId === "practiceflow") return sum + 2499;
    if (t.planId === "practiceos_ai") return sum + 3999;
    return sum;
  }, 0);

  const totalSetupRevenue = tenants.reduce((sum, t) => {
    if (t.planId === "presence") return sum + 17900;
    if (t.planId === "practiceflow") return sum + 39900;
    if (t.planId === "practiceos_ai") return sum + 69900;
    return sum;
  }, 0);

  const stats = [
    {
      title: "Active Tenants",
      value: activeTenantsCount.toString(),
      sub: `${tenants.length} Total Practices`,
      icon: Building2,
      trend: "+100% YoY",
    },
    {
      title: "Preview Tenants",
      value: previewTenantsCount.toString(),
      sub: "Active Trial Links",
      icon: Globe,
      trend: "Auto-expires in 14d",
    },
    {
      title: "Monthly Recurring (MRR)",
      value: `₹${totalMrr.toLocaleString("en-IN")}`,
      sub: "Platform Subscriptions",
      icon: TrendingUp,
      trend: "+34.5% vs last mo",
    },
    {
      title: "Setup Fee Revenue",
      value: `₹${totalSetupRevenue.toLocaleString("en-IN")}`,
      sub: "Implementation Fees",
      icon: CreditCard,
      trend: "3-Year FutureReady",
    },
    {
      title: "Total Contacts / Patients",
      value: "40",
      sub: "Across all practices",
      icon: Users,
      trend: "+18 this month",
    },
    {
      title: "Appointments Booked",
      value: "24",
      sub: "Active calendar slots",
      icon: Calendar,
      trend: "94.2% attendance",
    },
    {
      title: "AI Conversations Handled",
      value: "182",
      sub: "WhatsApp & Web triage",
      icon: Sparkles,
      trend: "82% auto-resolved",
    },
    {
      title: "Cloud Storage Quota",
      value: "2.7 GB",
      sub: "of 20 GB allocated",
      icon: HardDrive,
      trend: "13.5% utilized",
    },
  ];

  const recentActivities = [
    {
      action: "Practice Preview Generated",
      target: "MotionPlus Physiotherapy",
      time: "2 hours ago",
      type: "PREVIEW",
    },
    {
      action: "Plan Upgraded to PracticeOS AI",
      target: "MindWell Psychology Centre",
      time: "Yesterday",
      type: "PLAN",
    },
    {
      action: "Custom Domain DNS Verified",
      target: "mindwellpsychology.in",
      time: "2 days ago",
      type: "DOMAIN",
    },
    {
      action: "New Intake Form Submitted",
      target: "Priya Sharma (MindWell)",
      time: "2 days ago",
      type: "PATIENT",
    },
    {
      action: "Practice Onboarding Completed",
      target: "MindWell Psychology Centre",
      time: "4 days ago",
      type: "TENANT",
    },
  ];

  const systemHealth = [
    { name: "Web Application Frontend", status: "Operational", detail: "Next.js 14 App Router (Running)", badge: "Healthy" },
    { name: "PostgreSQL Database Layer", status: "Demo Mode", detail: "Local In-Memory / LocalStorage State", badge: "Demo" },
    { name: "Automation Pipeline (n8n)", status: "Not Connected", detail: "Event webhook contracts verified", badge: "Demo" },
    { name: "Conversational AI Receptionist", status: "Simulated", detail: "Tenant Knowledge RAG Simulation", badge: "Demo" },
    { name: "WhatsApp Cloud Messaging", status: "Simulated", detail: "Multi-channel Inbox Simulator", badge: "Demo" },
    { name: "Cloudflare R2 Object Storage", status: "Demo Storage", detail: "Local client-side object storage", badge: "Demo" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Platform Executive Overview</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              System Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-tenant operational health, practice directory, subscription telemetry, and resource allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/platform/new"
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Practice Wizard</span>
          </Link>
        </div>
      </div>

      {/* Top 8 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-[#16181D] border border-[#242833] rounded-2xl p-4 sm:p-5 hover:border-[#2F3543] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-teal-400">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold tracking-tight text-white">{stat.value}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{stat.sub}</span>
                <span className="text-teal-400 font-medium">{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Growth Chart (SVG) */}
        <div className="lg:col-span-2 bg-[#16181D] border border-[#242833] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Monthly Recurring Revenue Growth</h2>
              <p className="text-xs text-slate-400">Subscription revenue trajectory across practice tiers</p>
            </div>
            <span className="text-xs font-mono text-teal-400 font-semibold bg-teal-950/60 border border-teal-800 px-2 py-1 rounded">
              Current MRR: ₹{totalMrr.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Clean SVG Area Chart */}
          <div className="h-56 w-full pt-4">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D9488" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="#242833" strokeDasharray="4" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="#242833" strokeDasharray="4" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="#242833" strokeDasharray="4" />
              <line x1="0" y1="190" x2="600" y2="190" stroke="#242833" />

              {/* Shaded Area */}
              <path
                d="M 0 190 L 0 170 Q 100 160 200 130 T 400 80 T 600 30 L 600 190 Z"
                fill="url(#mrrGrad)"
              />
              {/* Stroke line */}
              <path
                d="M 0 170 Q 100 160 200 130 T 400 80 T 600 30"
                fill="none"
                stroke="#0D9488"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Data points */}
              <circle cx="0" cy="170" r="4" fill="#0D9488" />
              <circle cx="200" cy="130" r="4" fill="#0D9488" />
              <circle cx="400" cy="80" r="4" fill="#0D9488" />
              <circle cx="600" cy="30" r="5" fill="#5EEAD4" stroke="#0F766E" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 px-1">
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep (Current)</span>
            </div>
          </div>
        </div>

        {/* Vertical & Plan Distribution */}
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Practice Specialities</h2>
            <p className="text-xs text-slate-400 mb-6">Vertical distribution across active practices</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Psychology & Mental Health</span>
                  <span className="text-teal-400 font-mono">50%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0D9488] rounded-full w-1/2" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Physiotherapy & Rehab</span>
                  <span className="text-sky-400 font-mono">50%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0284C7] rounded-full w-1/2" />
                </div>
              </div>

              <div className="opacity-40">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Dental & Orthodontics (Roadmap)</span>
                  <span className="text-slate-500 font-mono">0%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full w-0" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#22252C] mt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Subscription Plan Mix
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#1D2028] border border-[#292D38]">
                <p className="text-slate-400 text-[10px]">PracticeOS AI</p>
                <p className="font-bold text-white text-sm">1 Clinic</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1D2028] border border-[#292D38]">
                <p className="text-slate-400 text-[10px]">PracticeFlow</p>
                <p className="font-bold text-white text-sm">1 Clinic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Quick Table & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Practices Table */}
        <div className="lg:col-span-2 bg-[#16181D] border border-[#242833] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Active Practices</h2>
              <p className="text-xs text-slate-400">Tenants currently active or in private preview</p>
            </div>
            <Link
              href="/platform/tenants"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>View All ({tenants.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#242833] text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Practice Name</th>
                  <th className="py-2.5 px-3">Vertical</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22252C]">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-[#1A1D24] transition-colors group">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: t.branding.primaryColor || "#0D9488" }}
                        >
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{t.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 capitalize text-slate-300">{t.verticalId}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-mono capitalize">
                        {t.planId.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{t.city}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => switchTenant(t.id)}
                          className="px-2 py-1 rounded bg-[#20242E] hover:bg-teal-900/40 text-slate-200 hover:text-teal-300 text-[11px] font-medium border border-[#2B303D] transition-colors"
                          title="Switch active context"
                        >
                          Select
                        </button>
                        <Link
                          href={`/preview/${t.slug}`}
                          target="_blank"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Open Public Preview"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health Section */}
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">System Health & State</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                Demo Status
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Current infrastructure connection states for demonstration review.
            </p>

            <div className="space-y-3">
              {systemHealth.map((sh, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#14161B] border border-[#22252C] flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-white truncate">{sh.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{sh.detail}</p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                      sh.badge === "Healthy"
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                        : "bg-amber-950/60 text-amber-400 border-amber-800"
                    }`}
                  >
                    {sh.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#22252C] text-[11px] text-slate-500 mt-4">
            Production microservices will connect to self-hosted PostgreSQL & Coolify PaaS.
          </div>
        </div>
      </div>
    </div>
  );
}
