"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  Stethoscope,
  Users,
  CreditCard,
  Settings,
  HardDrive,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  Check,
  RotateCcw,
  Palette,
  Shield,
  Clock,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { PLANS, PlanId } from "@/lib/plans";
import { Tenant } from "@/types";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenants, activeTenant, switchTenant, switchPlan } = useTenant();
  const [activeTab, setActiveTab] = useState<
    "overview" | "business" | "branding" | "team" | "plan" | "website" | "integrations" | "activity"
  >("overview");

  const tenantId = params.id as string;
  const tenant = tenants.find((t) => t.id === tenantId) || activeTenant;

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(tenant.planId);
  const [saveMessage, setSaveMessage] = useState("");

  const handlePlanChange = (planId: PlanId) => {
    setSelectedPlan(planId);
    switchPlan(planId);
    setSaveMessage(`Plan successfully changed to ${PLANS[planId].name}`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "business", label: "Business Details" },
    { id: "branding", label: "Branding" },
    { id: "team", label: "Team & Roster" },
    { id: "plan", label: "Plan & Entitlements" },
    { id: "website", label: "Website & SEO" },
    { id: "integrations", label: "Integrations" },
    { id: "activity", label: "Audit Activity" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <Link
            href="/platform/tenants"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tenants Directory</span>
          </Link>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md"
              style={{ backgroundColor: tenant.branding.primaryColor || "#0D9488" }}
            >
              {tenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{tenant.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {tenant.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {tenant.city}, {tenant.state} &bull; <span className="font-mono text-slate-500">slug: {tenant.slug}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Tenant Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => switchTenant(tenant.id)}
            className="bg-[#20242E] hover:bg-[#2A303D] text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-[#2D3342] transition-colors"
          >
            Set Active Context
          </button>
          <Link
            href="/app"
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Open Staff App</span>
          </Link>
          <Link
            href={`/preview/${tenant.slug}`}
            target="_blank"
            className="bg-[#1C1F26] hover:bg-[#252933] text-teal-400 text-xs font-semibold px-3 py-2 rounded-xl border border-[#2B2F3C] transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-teal-950/80 border border-teal-800 rounded-xl text-teal-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-teal-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-[#242833] flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "border-teal-500 text-teal-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Practice Snapshot</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                  <span className="text-slate-400 block mb-1">Vertical</span>
                  <span className="font-semibold text-white capitalize">{tenant.verticalId}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                  <span className="text-slate-400 block mb-1">Current Plan</span>
                  <span className="font-semibold text-teal-400 font-mono capitalize">
                    {tenant.planId.replace("_", " ")}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                  <span className="text-slate-400 block mb-1">Monthly MRR</span>
                  <span className="font-semibold text-white font-mono">
                    ₹{tenant.planId === "presence" ? "999" : tenant.planId === "practiceflow" ? "2,499" : "3,999"}/mo
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                  <span className="text-slate-400 block mb-1">Team Size</span>
                  <span className="font-semibold text-white">{tenant.team?.length || 1} Members</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                  <span className="text-slate-400 block mb-1">Clinical Services</span>
                  <span className="font-semibold text-white">{tenant.services?.length || 0} Listed</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                  <span className="text-slate-400 block mb-1">Created Date</span>
                  <span className="font-semibold text-white">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-3">Practice Services</h2>
              <div className="space-y-2">
                {tenant.services?.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-[#121417] border border-[#22252C] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="text-slate-400 text-[11px]">{s.durationMinutes} min &bull; {s.category}</p>
                    </div>
                    <span className="font-bold text-teal-400 font-mono">
                      ₹{s.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Contact Info</h2>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{tenant.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{tenant.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{tenant.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="font-mono text-slate-400">{tenant.existingWebsite || "aectura.cloud"}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-2">Practice Actions</h2>
              <p className="text-xs text-slate-400 mb-4">Lifecycle status changes for this tenant.</p>
              <div className="space-y-2">
                <button
                  onClick={() => alert("Tenant activated in demo store")}
                  className="w-full py-2 text-xs font-semibold rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 transition-colors text-center"
                >
                  Activate Live Production
                </button>
                <button
                  onClick={() => alert("Tenant status suspended in demo store")}
                  className="w-full py-2 text-xs font-semibold rounded-xl bg-[#22252C] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-[#2B2F3B] transition-colors text-center"
                >
                  Suspend Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "business" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Business Entity Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Legal Entity Name</label>
              <input
                type="text"
                defaultValue={tenant.legalName}
                className="w-full bg-[#121417] border border-[#272A34] rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Display Name</label>
              <input
                type="text"
                defaultValue={tenant.name}
                className="w-full bg-[#121417] border border-[#272A34] rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">WhatsApp Triage Number</label>
              <input
                type="text"
                defaultValue={tenant.whatsapp}
                className="w-full bg-[#121417] border border-[#272A34] rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Google Business Map CID</label>
              <input
                type="text"
                defaultValue={tenant.googleBusinessUrl}
                className="w-full bg-[#121417] border border-[#272A34] rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
          <button
            onClick={() => alert("Business details updated")}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Save Business Changes
          </button>
        </div>
      )}

      {activeTab === "branding" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white">Practice Visual Identity</h2>
            <p className="text-xs text-slate-400">Controls public site styling, buttons, and patient portal accents.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#121417] border border-[#242833]">
              <span className="text-slate-400 block mb-2">Primary Color</span>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg shadow-sm border border-white/20"
                  style={{ backgroundColor: tenant.branding.primaryColor }}
                />
                <span className="font-mono text-white text-sm">{tenant.branding.primaryColor}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#121417] border border-[#242833]">
              <span className="text-slate-400 block mb-2">Accent Color</span>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg shadow-sm border border-white/20"
                  style={{ backgroundColor: tenant.branding.accentColor }}
                />
                <span className="font-mono text-white text-sm">{tenant.branding.accentColor}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#121417] border border-[#242833]">
              <span className="text-slate-400 block mb-2">Typography & Button Style</span>
              <p className="text-white font-medium">{tenant.branding.font} &bull; Rounded</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#121417] border border-[#242833]">
            <span className="text-slate-400 block mb-1">Tagline</span>
            <p className="text-sm text-slate-200 italic font-serif">&ldquo;{tenant.branding.tagline}&rdquo;</p>
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Practitioners &amp; Staff</h2>
              <p className="text-xs text-slate-400">Clinical team members active on this tenant.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenant.team?.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-[#121417] border border-[#242833] flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs shrink-0 overflow-hidden">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white">{member.name}</p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {member.role}
                    </span>
                  </div>
                  <p className="text-teal-400 text-[11px] mt-0.5">{member.title}</p>
                  <p className="text-slate-400 text-[11px] mt-1">{member.qualifications}</p>
                  <p className="text-slate-500 text-[10px] mt-1 line-clamp-2">{member.specialization}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "plan" && (
        <div className="space-y-6">
          <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-2">Change Subscription Plan</h2>
            <p className="text-xs text-slate-400 mb-6">
              Switching plans immediately dynamically alters feature locks in the tenant staff app.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["presence", "practiceflow", "practiceos_ai"] as PlanId[]).map((pid) => {
                const p = PLANS[pid];
                const isCurrent = tenant.planId === pid;
                return (
                  <div
                    key={pid}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? "bg-teal-950/40 border-teal-700 shadow-md"
                        : "bg-[#14161A] border-[#242833] hover:border-slate-600"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-900 text-teal-300 font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-4">{p.tagline}</p>
                      <p className="text-xl font-bold text-teal-400 font-mono mb-4">
                        ₹{p.monthlyFeeInr.toLocaleString("en-IN")}
                        <span className="text-xs text-slate-400">/mo</span>
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-300 mb-6">
                        {p.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      disabled={isCurrent}
                      onClick={() => handlePlanChange(pid)}
                      className={`w-full py-2 text-xs font-semibold rounded-xl transition-all ${
                        isCurrent
                          ? "bg-teal-900/60 text-teal-300 cursor-default"
                          : "bg-[#22252F] hover:bg-teal-700 hover:text-white text-slate-200"
                      }`}
                    >
                      {isCurrent ? "Current Plan" : `Switch to ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "website" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Public Site Configuration</h2>
              <p className="text-xs text-slate-400">Manage custom domains and live previews.</p>
            </div>
            <Link
              href={`/preview/${tenant.slug}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-teal-950 text-teal-400 border border-teal-800 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>View Preview</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-[#121417] border border-[#22252C] space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Preview Subdomain</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`preview.aectura.cloud/${tenant.slug}`}
                  className="w-full bg-[#1A1D24] border border-[#2B2F3C] rounded-xl px-3 py-2 text-slate-300 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Custom Domain (Cloudflare SaaS Route)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. clinic.mindwellpsychology.in"
                  defaultValue={tenant.customDomain || ""}
                  className="w-full bg-[#1A1D24] border border-[#2B2F3C] rounded-xl px-3 py-2 text-white font-mono"
                />
                <button
                  onClick={() => alert("Custom domain verification simulated. CNAME verified.")}
                  className="bg-[#20242E] hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl whitespace-nowrap"
                >
                  Verify DNS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Connected Platforms &amp; Hubs</h2>
          <p className="text-xs text-slate-400">
            External service connectors configured for this practice.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { name: "WhatsApp Cloud API", status: "Simulated", detail: "Multi-channel chat inbox" },
              { name: "n8n Workflow Automation", status: "Not Connected", detail: "Webhook execution engine" },
              { name: "Cloudflare R2 Storage", status: "Simulated", detail: "Presigned asset uploads" },
              { name: "Google Calendar Sync", status: "Ready", detail: "Practitioner two-way sync" },
            ].map((int, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#121417] border border-[#22252C] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{int.name}</p>
                  <p className="text-[11px] text-slate-400">{int.detail}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {int.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Tenant Activity Timeline</h2>
          <div className="space-y-3 text-xs">
            {[
              { time: "Just now", action: "Tenant settings opened in Super Admin console" },
              { time: "Yesterday", action: "Session scheduled with Dr. Ananya Sharma" },
              { time: "3 days ago", action: "WhatsApp triage conversation handled by AI" },
              { time: "5 days ago", action: "Public website content updated" },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200">{act.action}</p>
                  <span className="text-[10px] text-slate-500">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
