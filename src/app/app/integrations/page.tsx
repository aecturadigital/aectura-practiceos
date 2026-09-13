"use client";

import React, { useState } from "react";
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare,
  CreditCard,
  Calendar,
  Layers,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";

interface IntegrationItem {
  id: string;
  name: string;
  category: "Communications" | "Payments" | "Calendar" | "Infrastructure";
  description: string;
  status: "CONNECTED" | "READY" | "OPTIONAL";
  icon: any;
  endpoint?: string;
  requiresNotice?: boolean;
}

export default function StaffIntegrationsPage() {
  const { activeTenant } = useTenant();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);

  const integrations: IntegrationItem[] = [
    {
      id: "whatsapp",
      name: "WhatsApp Business Cloud API",
      category: "Communications",
      description: "Direct official Meta API for two-way appointment confirmations, triage, and patient chat.",
      status: "CONNECTED",
      icon: MessageSquare,
      endpoint: "https://graph.facebook.com/v19.0/phone-id/messages",
    },
    {
      id: "google_business",
      name: "Google Business Profile & Maps",
      category: "Communications",
      description: "Sync patient Google Reviews, opening hours, and Maps booking link directly.",
      status: "CONNECTED",
      icon: Globe,
      endpoint: "https://mybusiness.googleapis.com/v4/accounts",
    },
    {
      id: "razorpay",
      name: "Razorpay Indian Payments Gateway",
      category: "Payments",
      description: "Accept UPI, Credit Cards, NetBanking, and auto-issue GST compliant consultation receipts.",
      status: "CONNECTED",
      icon: CreditCard,
      endpoint: "https://api.razorpay.com/v1/payment_links",
    },
    {
      id: "google_cal",
      name: "Google Calendar Two-Way Sync",
      category: "Calendar",
      description: "Sync practitioner availability between PracticeOS and doctors' personal Google Calendars.",
      status: "READY",
      icon: Calendar,
      endpoint: "https://www.googleapis.com/calendar/v3/calendars",
    },
    {
      id: "n8n",
      name: "n8n Workflow Automation Engine",
      category: "Infrastructure",
      description: "Dispatches signed HMAC webhooks for asynchronous reminders, sequences, and reporting.",
      status: "CONNECTED",
      icon: Zap,
      endpoint: "https://n8n.practiceos.internal/webhook",
    },
    {
      id: "cloudflare",
      name: "Cloudflare for SaaS Edge & Custom SSL",
      category: "Infrastructure",
      description: "Automated SSL provisioning and custom domain CNAME routing for practice websites.",
      status: "CONNECTED",
      icon: ShieldCheck,
      endpoint: "https://api.cloudflare.com/client/v4/zones",
    },
  ];

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <Plug className="w-3.5 h-3.5" />
            <span>Third-Party APIs &amp; Service Connectors</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Integrations Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect your clinical channels, payment gateways, calendar systems, and edge infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#101216] px-4 py-2 rounded-xl border border-[#232630]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>5 of 6 Connectors Active</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="bg-[#14161B] border border-[#232630] hover:border-slate-700 transition-all rounded-3xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#1A1E29] border border-[#282E3E] text-teal-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                      item.status === "CONNECTED"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-sky-950 text-sky-300 border border-sky-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{item.name}</h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#20232C] flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                  {item.endpoint}
                </span>

                <button
                  onClick={() => setSelectedIntegration(item)}
                  className="px-3 py-1.5 rounded-xl bg-[#1B1E28] hover:bg-[#252A36] text-slate-200 text-xs font-semibold border border-[#2A2E3B] transition-colors flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-teal-400" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedIntegration.name}</h3>
                <p className="text-xs text-slate-400">Integration Configuration &amp; Credentials</p>
              </div>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Architecture Notice */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1.5 text-xs text-amber-200">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Backend Connection Required</span>
              </div>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                In a live production environment, this integration requires live OAuth token exchange or API secret storage in production environment variables. In this interactive demo prototype, state changes are stored reactive in your local mock store.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Webhook Endpoint</label>
                <input
                  type="text"
                  readOnly
                  value={selectedIntegration.endpoint || "https://api.practiceos.internal/webhook"}
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3 py-2 text-slate-300 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Status</label>
                <div className="p-3 rounded-xl bg-[#101216] border border-[#2B2F3D] flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Ready
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">200 OK</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
