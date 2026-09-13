"use client";

import React from "react";
import { HardDrive, Users, MessageSquare, Sparkles } from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";

export default function StaffUsagePage() {
  const { activeTenant, plan } = useTenant();
  const contacts = mockStore.getContacts(activeTenant.id);
  const appointments = mockStore.getAppointments(activeTenant.id);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Usage &amp; Quotas</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Resource consumption, patient quota limits, and communication usage
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-2 text-xs">
          <span className="text-slate-500 font-medium block">Patient Capacity</span>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-semibold text-slate-900">{contacts.length}</span>
            <span className="text-slate-400">/ 1,000 max</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: `${(contacts.length / 1000) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-2 text-xs">
          <span className="text-slate-500 font-medium block">Appointments Scheduled</span>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-semibold text-slate-900">{appointments.length}</span>
            <span className="text-slate-400">/ Unlimited</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: "20%" }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-2 text-xs">
          <span className="text-slate-500 font-medium block">Encrypted Document Storage</span>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-semibold text-slate-900">17.2 MB</span>
            <span className="text-slate-400">/ 50 GB</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: "1%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
