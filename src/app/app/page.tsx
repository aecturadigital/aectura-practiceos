"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  UserPlus,
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Phone,
  Video,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { AppointmentStatus, Contact, Appointment, CrmDeal } from "@/types";

export default function StaffDashboardPage() {
  const { activeTenant, vertical, plan } = useTenant();

  // Find primary practitioner name
  const practitioner = activeTenant.team?.find(
    (m) => m.role === "OWNER" || m.role === "PRACTITIONER"
  ) || { name: "Doctor" };

  const contacts = mockStore.getContacts(activeTenant.id);
  const appointments = mockStore.getAppointments(activeTenant.id);
  const deals = mockStore.getCrmDeals(activeTenant.id);
  const messages = mockStore.getMessages(activeTenant.id);

  const todayAppointments = appointments.slice(0, 4);
  const newEnquiries = deals.filter((d) => d.stage === "NEW_ENQUIRY" || d.stage === "CONTACTED").slice(0, 4);
  const aiHandoffs = deals.filter((d) => d.priority === "HIGH").slice(0, 2);

  // Quick Action Modal states (simulated)
  const [quickModal, setQuickModal] = useState<string | null>(null);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickSuccess, setQuickSuccess] = useState(false);

  const handleQuickAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName) return;
    const [firstName, ...last] = quickName.split(" ");
    mockStore.createContact({
      id: `cnt-${Date.now()}`,
      tenantId: activeTenant.id,
      firstName,
      lastName: last.join(" ") || "",
      fullName: quickName,
      phone: quickPhone || "+91 98261 00000",
      email: `${firstName.toLowerCase()}@example.com`,
      status: "LEAD",
      assignedPractitionerId: activeTenant.team?.[0]?.id || "staff-1",
      tags: ["Walk-in / Direct"],
      notesCount: 0,
      lastContactedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      city: activeTenant.city,
    });
    setQuickSuccess(true);
    setTimeout(() => {
      setQuickSuccess(false);
      setQuickModal(null);
      setQuickName("");
      setQuickPhone("");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Good morning, {practitioner.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome to <span className="text-white font-medium">{activeTenant.name}</span>. Here is your practice schedule and patient flow for today.
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setQuickModal("contact")}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add {vertical.terminology.contactSingular}</span>
          </button>

          <Link
            href="/app/appointments"
            className="bg-[#1F232B] hover:bg-[#282C36] text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#2B2F3B] transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Book Appointment</span>
          </Link>

          <Link
            href="/app/crm"
            className="bg-[#1F232B] hover:bg-[#282C36] text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#2B2F3B] transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>New Lead</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">New Enquiries</span>
            <div className="p-2 rounded-xl bg-teal-950/60 border border-teal-800/60 text-teal-400">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white mb-1">
            {deals.filter((d) => d.stage === "NEW_ENQUIRY").length || 3}
          </p>
          <p className="text-[11px] text-teal-400 font-medium">+2 via WhatsApp triage</p>
        </div>

        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Today&apos;s Sessions</span>
            <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white mb-1">
            {todayAppointments.length}
          </p>
          <p className="text-[11px] text-slate-400">3 confirmed &bull; 1 completed</p>
        </div>

        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Pending Follow-Ups</span>
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white mb-1">4</p>
          <p className="text-[11px] text-amber-400 font-medium">2 due before 2:00 PM</p>
        </div>

        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Conversion Rate</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white mb-1">68.4%</p>
          <p className="text-[11px] text-emerald-400 font-medium">+4.2% this month</p>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Side Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Schedule & Enquiries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Today&apos;s Schedule</h2>
                <p className="text-xs text-slate-400">Appointments scheduled across clinic rooms &amp; video</p>
              </div>
              <Link
                href="/app/appointments"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-[#121417] border border-[#22252C] hover:border-[#2B2F3C] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="px-2.5 py-2 rounded-lg bg-teal-950/80 border border-teal-800/60 text-center shrink-0">
                      <span className="text-xs font-bold text-teal-300 font-mono block">
                        {apt.startTime}
                      </span>
                      <span className="text-[10px] text-teal-400 uppercase">
                        {apt.durationMinutes}m
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/app/contacts/${apt.contactId}`}
                          className="font-bold text-white text-sm hover:text-teal-400 transition-colors"
                        >
                          {apt.contactName}
                        </Link>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {apt.mode.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{apt.serviceName}</p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{apt.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                        apt.status === "CONFIRMED"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : apt.status === "COMPLETED"
                          ? "bg-slate-800 text-slate-300 border-slate-700"
                          : "bg-amber-950 text-amber-400 border-amber-800"
                      }`}
                    >
                      {apt.status}
                    </span>
                    <Link
                      href={`/app/contacts/${apt.contactId}`}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#1C2028] hover:bg-[#252A36] text-slate-200 border border-[#2A2E3B] transition-colors"
                    >
                      Card
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Enquiries & Deals */}
          <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Recent Enquiries &amp; Triage</h2>
                <p className="text-xs text-slate-400">Prospective care seekers entering the CRM pipeline</p>
              </div>
              <Link
                href="/app/crm"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>Pipeline View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {newEnquiries.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3.5 rounded-xl bg-[#121417] border border-[#22252C] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs">
                      {deal.contactName.charAt(0)}
                    </div>
                    <div>
                      <Link
                        href={`/app/contacts/${deal.contactId}`}
                        className="font-semibold text-white hover:text-teal-400 transition-colors"
                      >
                        {deal.contactName}
                      </Link>
                      <p className="text-[11px] text-slate-400">{deal.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {deal.source}
                    </span>
                    <span className="font-semibold text-white font-mono">
                      ₹{deal.value.toLocaleString("en-IN")}
                    </span>
                    <Link
                      href={`/app/contacts/${deal.contactId}`}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI Handoffs, Lead Sources & Tasks */}
        <div className="space-y-6">
          {/* AI Receptionist Handoffs */}
          <div className="bg-[#16181D] border border-amber-800/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">AI Human Escalations</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Conversations where Maya requested human practitioner intervention.
            </p>

            <div className="space-y-2.5">
              {aiHandoffs.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3 rounded-xl bg-[#121417] border border-amber-900/30 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{deal.contactName}</span>
                    <span className="text-[10px] text-amber-400 font-mono">WhatsApp</span>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2">
                    {deal.notes || "Client inquiring about medication compatibility. Clinical triage requested."}
                  </p>
                  <div className="pt-2 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">{deal.contactPhone}</span>
                    <Link
                      href="/app/inbox"
                      className="text-teal-400 font-semibold hover:text-teal-300 flex items-center gap-1"
                    >
                      <span>Take Over</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Sources Breakdown */}
          <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1">Lead Sources</h3>
            <p className="text-xs text-slate-400 mb-4">Patient acquisition channels this month</p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Website Direct</span>
                  <span className="text-teal-400 font-mono">40%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0D9488] rounded-full w-[40%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Google Business Map</span>
                  <span className="text-sky-400 font-mono">30%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0284C7] rounded-full w-[30%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Referrals &amp; Word of Mouth</span>
                  <span className="text-emerald-400 font-mono">20%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[20%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">WhatsApp Inbound</span>
                  <span className="text-indigo-400 font-mono">10%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[10%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Follow-Up Tasks */}
          <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Today&apos;s Follow-Up Tasks</h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#121417] text-slate-300 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-700 text-teal-600 focus:ring-0" />
                <span>Review Priya Sharma thought log</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#121417] text-slate-300 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-700 text-teal-600 focus:ring-0" />
                <span>Confirm Wednesday couples therapy slot</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#121417] text-slate-300 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-700 text-teal-600 focus:ring-0" />
                <span>Upload updated clinical intake PDF</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Contact Modal */}
      {quickModal === "contact" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181D] border border-[#272A34] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-1">
              Add New {vertical.terminology.contactSingular}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Quickly create a patient or client record directly in the practice database.
            </p>

            {quickSuccess ? (
              <div className="py-6 text-center text-teal-400 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Record Created Successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleQuickAddContact} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Mehra"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98261 00000"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#242833]">
                  <button
                    type="button"
                    onClick={() => setQuickModal(null)}
                    className="px-3 py-1.5 rounded-lg border border-[#272A34] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-4 py-1.5 rounded-lg"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
