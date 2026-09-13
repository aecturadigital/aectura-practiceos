"use client";

import React from "react";
import { Radio, CheckCircle2, Globe, MessageSquare, Calendar, CreditCard } from "lucide-react";
import { useTenant } from "@/context/tenant-context";

export default function StaffIntegrationsPage() {
  const { activeTenant } = useTenant();

  const integrations = [
    {
      id: "whatsapp",
      name: "WhatsApp Cloud API",
      status: "Connected",
      desc: "Live 2-way patient communications, automated triage, and appointment booking confirmation.",
      icon: MessageSquare,
      color: "text-emerald-700",
    },
    {
      id: "gcal",
      name: "Google Calendar Sync",
      status: "Active",
      desc: "2-way calendar sync for practitioner roster blocks and private personal appointments.",
      icon: Calendar,
      color: "text-blue-700",
    },
    {
      id: "razorpay",
      name: "UPI & Card Payments",
      status: "Configured",
      desc: "Instant payment links dispatched upon appointment confirmation or invoice generation.",
      icon: CreditCard,
      color: "text-teal-700",
    },
    {
      id: "storage",
      name: "Cloudflare R2 Storage",
      status: "Encrypted",
      desc: "Secure encrypted object storage with signed URL access for patient reports and intake PDFs.",
      icon: Radio,
      color: "text-indigo-700",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Integrations</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connected clinical infrastructure, communications, payments, and calendar synchronization
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-3 shadow-none"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
                  Manage Settings &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
