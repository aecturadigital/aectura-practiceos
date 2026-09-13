"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Building,
  Clock,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck,
  Radio,
  HardDrive,
  Lock,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";

export default function StaffSettingsPage() {
  const { activeTenant, plan } = useTenant();
  const [activeTab, setActiveTab] = useState<
    "practice" | "users" | "integrations" | "plan" | "usage" | "audit"
  >("practice");

  // Settings State
  const [name, setName] = useState(activeTenant.name);
  const [phone, setPhone] = useState(activeTenant.phone);
  const [email, setEmail] = useState(activeTenant.email);
  const [whatsapp, setWhatsapp] = useState(activeTenant.whatsapp || "");
  const [address, setAddress] = useState(activeTenant.address || "");
  const [city, setCity] = useState(activeTenant.city);

  // Scheduling State
  const [leadTime, setLeadTime] = useState(activeTenant.settings?.bookingLeadTimeHours ?? 4);
  const [cancellationCutoff, setCancellationCutoff] = useState(
    activeTenant.settings?.cancellationCutoffHours ?? 12
  );
  const [bufferMinutes, setBufferMinutes] = useState(activeTenant.settings?.bufferMinutes ?? 15);
  const [autoConfirm, setAutoConfirm] = useState(
    activeTenant.settings?.autoConfirmAppointments ?? false
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSavePractice = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.updateTenant(activeTenant.id, {
      name,
      phone,
      email,
      whatsapp,
      city,
      address,
      settings: {
        ...activeTenant.settings,
        bookingLeadTimeHours: Number(leadTime),
        cancellationCutoffHours: Number(cancellationCutoff),
        bufferMinutes: Number(bufferMinutes),
        autoConfirmAppointments: autoConfirm,
      },
    });

    setToastMessage("Practice settings updated successfully.");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Clinic operational profile, scheduling buffers, integrations, and plan details
        </p>
      </div>

      {toastMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subnavigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-medium text-slate-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("practice")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "practice"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Practice Profile
        </button>
        <Link
          href="/app/team"
          className="pb-2.5 hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          Users &amp; Permissions
        </Link>
        <Link
          href="/app/integrations"
          className="pb-2.5 hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          Integrations
        </Link>
        <button
          onClick={() => setActiveTab("plan")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "plan"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Billing &amp; Plan
        </button>
        <Link
          href="/app/usage"
          className="pb-2.5 hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          Usage
        </Link>
        <Link
          href="/app/audit"
          className="pb-2.5 hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          Security &amp; Audit
        </Link>
      </div>

      {/* Practice Profile Tab */}
      {activeTab === "practice" && (
        <form onSubmit={handleSavePractice} className="space-y-6 text-xs">
          {/* Clinic Identity */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-none">
            <h2 className="text-sm font-semibold text-slate-900">Clinic Identity &amp; Contact</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Practice Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Clinic City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Clinic Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Scheduling Mathematics */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-none">
            <h2 className="text-sm font-semibold text-slate-900">Scheduling Mathematics &amp; Rules</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Booking Lead Time (Hours)</label>
                <input
                  type="number"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Cancellation Cutoff (Hours)</label>
                <input
                  type="number"
                  value={cancellationCutoff}
                  onChange={(e) => setCancellationCutoff(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Buffer Between Sessions (Min)</label>
                <input
                  type="number"
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoConfirm"
                checked={autoConfirm}
                onChange={(e) => setAutoConfirm(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300"
              />
              <label htmlFor="autoConfirm" className="text-slate-700 font-medium cursor-pointer">
                Automatically confirm patient bookings without requiring front-desk review
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-md transition-colors"
            >
              Save Practice Settings
            </button>
          </div>
        </form>
      )}

      {/* Plan Details Tab */}
      {activeTab === "plan" && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-none text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-slate-400 block mb-0.5">Current Tier</span>
              <h2 className="text-base font-semibold text-slate-900">{plan.name}</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Active Subscription
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block mb-1">Monthly Billing</span>
              <span className="text-base font-semibold text-slate-900 font-mono">&#8377;{plan.monthlyFeeInr.toLocaleString("en-IN")}/mo</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">WhatsApp &amp; AI Ingestion</span>
              <span className="text-slate-800 font-medium">Included &amp; Managed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
