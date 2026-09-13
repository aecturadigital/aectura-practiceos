"use client";

import React, { useState } from "react";
import {
  Settings,
  Building,
  Clock,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Save,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";

export default function StaffSettingsPage() {
  const { activeTenant } = useTenant();

  // Settings State
  const [name, setName] = useState(activeTenant.name);
  const [legalName, setLegalName] = useState(activeTenant.legalName || "");
  const [phone, setPhone] = useState(activeTenant.phone);
  const [email, setEmail] = useState(activeTenant.email);
  const [whatsapp, setWhatsapp] = useState(activeTenant.whatsapp || "");
  const [city, setCity] = useState(activeTenant.city);
  const [address, setAddress] = useState(activeTenant.address || "");

  // Scheduling State
  const [leadTime, setLeadTime] = useState(activeTenant.settings?.bookingLeadTimeHours ?? 4);
  const [cancellationCutoff, setCancellationCutoff] = useState(
    activeTenant.settings?.cancellationCutoffHours ?? 12
  );
  const [bufferMinutes, setBufferMinutes] = useState(activeTenant.settings?.bufferMinutes ?? 15);
  const [autoConfirm, setAutoConfirm] = useState(
    activeTenant.settings?.autoConfirmAppointments ?? false
  );

  // Custom Domain State
  const [customDomain, setCustomDomain] = useState(activeTenant.customDomain || "");
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    mockStore.updateTenant(activeTenant.id, {
      name,
      legalName,
      phone,
      email,
      whatsapp,
      city,
      address,
      customDomain: customDomain.trim() || undefined,
      settings: {
        ...activeTenant.settings,
        bookingLeadTimeHours: Number(leadTime),
        cancellationCutoffHours: Number(cancellationCutoff),
        bufferMinutes: Number(bufferMinutes),
        autoConfirmAppointments: autoConfirm,
      },
    });

    setToastMessage("Practice settings successfully updated and saved.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyCname = () => {
    navigator.clipboard.writeText("cname.practiceos.internal");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-5xl mx-auto">
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
            <Settings className="w-3.5 h-3.5" />
            <span>Practice Operations &amp; Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Practice Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Update your legal business identity, booking scheduling rules, buffer intervals, and edge custom domains.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save All Changes</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Section 1: Business Identity */}
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#232630]">
            <Building className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Practice &amp; Legal Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Practice Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Legal Registered Entity Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g., MindWell Psychological Healthcare LLP"
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">WhatsApp Business Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">City / Region</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Physical Clinic Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Suite number, Street name, Pincode"
              className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Section 2: Scheduling Rules & Mathematics */}
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#232630]">
            <Clock className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Scheduling &amp; Buffer Engine Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Booking Lead Time (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={48}
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Minimum advance notice required before a slot.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Cancellation Cutoff (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={72}
                value={cancellationCutoff}
                onChange={(e) => setCancellationCutoff(Number(e.target.value))}
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Notice required for fee-free patient reschedule.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Post-Session Buffer (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                step={5}
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
                className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Buffer added after each visit for clinical notes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#101216] border border-[#22252F] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-white block">
                Auto-Confirm Online Appointments
              </span>
              <span className="text-[11px] text-slate-400">
                Immediately place bookings onto practitioner calendars without manual front-desk review.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAutoConfirm(!autoConfirm)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold border transition-all ${
                autoConfirm
                  ? "bg-teal-950 text-teal-300 border-teal-800"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {autoConfirm ? "Auto-Confirm ON" : "Review Required"}
            </button>
          </div>
        </div>

        {/* Section 3: Custom Domain & Cloudflare Edge */}
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#232630]">
            <Globe className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Custom Domain &amp; Edge SSL (Cloudflare for SaaS)
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Practice Domain</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="care.mindwellpsychology.in"
                  className="flex-1 bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-2.5 rounded-xl bg-[#1B1E28] hover:bg-[#252A36] text-slate-200 border border-[#2B2F3D] font-semibold shrink-0"
                >
                  Verify Domain
                </button>
              </div>
            </div>

            {/* DNS Instructions Box */}
            <div className="p-4 rounded-2xl bg-[#101216] border border-[#22252F] space-y-3">
              <span className="font-bold text-slate-300 block">DNS Configuration Record:</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#161822] border border-[#252836] font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">TYPE: </span>
                  <span className="text-purple-400 font-bold">CNAME</span>
                  <span className="text-slate-500 ml-4">TARGET: </span>
                  <span className="text-teal-400">cname.practiceos.internal</span>
                </div>
                <button
                  type="button"
                  onClick={copyCname}
                  className="text-slate-400 hover:text-white flex items-center gap-1 font-sans text-xs"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                SSL certificates are provisioned automatically within 60 seconds after DNS propagation.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
