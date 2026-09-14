"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  UserPlus,
  Plus,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Phone,
  Video,
  MapPin,
  ChevronRight,
  Check,
  Send,
  Sparkles,
  Inbox,
  Filter,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { AppointmentStatus, Contact, Appointment, CrmDeal, Message } from "@/types";

export default function StaffDashboardPage() {
  const { activeTenant, vertical, plan } = useTenant();

  // Find lead practitioner
  const practitioner = activeTenant.team?.find(
    (m) => m.role === "OWNER" || m.role === "PRACTITIONER"
  ) || { name: "Doctor" };

  const contacts = mockStore.getContacts(activeTenant.id);
  const appointments = mockStore.getAppointments(activeTenant.id);
  const deals = mockStore.getCrmDeals(activeTenant.id);
  const messages = mockStore.getMessages(activeTenant.id);

  const todayAppointments = appointments.slice(0, 5);
  const newEnquiries = deals.filter((d) => d.stage === "NEW_ENQUIRY");
  const pendingFollowUps = deals.filter((d) => d.stage === "CONTACTED" || d.stage === "QUALIFIED" || d.priority === "HIGH");
  const conversations = mockStore.getConversations(activeTenant.id);
  const unreadConversations = conversations.filter((c) => c.unreadCount > 0);
  const recentMessages = messages.slice(0, 4);

  // Treatment Plan Operational Analytics & Needs Attention
  const courses = mockStore.getTreatmentCourses(activeTenant.id);
  const activeCoursesCount = courses.filter((c) => c.status === "ACTIVE").length || 3;
  
  // Needs Attention Items State
  const [attentionItems, setAttentionItems] = useState([
    {
      id: "att-priya",
      patientName: "Priya Sharma",
      contactId: "cnt-mp-priya",
      type: "PAYMENT_DUE",
      badge: "₹5,800 Due",
      badgeColor: "rose",
      description: "Cycle 1 package balance outstanding after Session #18.",
      actionLabel: "Send Reminder",
    },
    {
      id: "att-rajesh",
      patientName: "Rajesh Kumar",
      contactId: "cnt-02",
      type: "LOW_SESSIONS",
      badge: "1 Session Left",
      badgeColor: "amber",
      description: "Cycle 1 has 1 of 12 sessions remaining. Re-assessment required.",
      actionLabel: "Review Plan",
    },
    {
      id: "att-aman",
      patientName: "Aman Verma",
      contactId: "cnt-03",
      type: "NO_SHOWS",
      badge: "3 Missed Visits",
      badgeColor: "rose",
      description: "Missed 3 consecutive rehab appointments. High drop-off risk.",
      actionLabel: "Contact Patient",
    },
    {
      id: "att-neha",
      patientName: "Neha Singh",
      contactId: "cnt-04",
      type: "CYCLE_COMPLETED",
      badge: "Cycle 1 Complete",
      badgeColor: "emerald",
      description: "Attended all 30 sessions. Ready for Month 2 progression.",
      actionLabel: "Activate Month 2",
    },
  ]);

  // Reminder Modal State
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<any>(null);
  const [reminderMsg, setReminderMsg] = useState("");
  const [reminderSent, setReminderSent] = useState(false);

  // Cycle Activation Feedback State
  const [activationFeedback, setActivationFeedback] = useState<string | null>(null);

  const handleOpenReminder = (item: any) => {
    setReminderTarget(item);
    setReminderMsg(
      `Dear ${item.patientName}, this is ${activeTenant.name}. You have an outstanding balance of ${item.badge.replace(" Due", "")} for your Treatment Plan. You can settle securely online via https://pay.aectura.in/${item.contactId} or at your next visit tomorrow. Thank you!`
    );
    setIsReminderOpen(true);
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTarget) return;
    mockStore.sendPaymentReminder(
      activeTenant.id,
      reminderTarget.contactId,
      5800,
      "WHATSAPP",
      reminderMsg,
      practitioner?.name || "Clinic Desk"
    );
    setReminderSent(true);
    setTimeout(() => {
      setReminderSent(false);
      setIsReminderOpen(false);
      // Update item state to show dispatched
      setAttentionItems((prev) =>
        prev.map((i) => (i.id === reminderTarget.id ? { ...i, badge: "Reminder Sent", badgeColor: "slate", actionLabel: "Sent ✓" } : i))
      );
    }, 1200);
  };

  const handleActivateNextMonth = (item: any) => {
    setActivationFeedback(`Cycle 2 successfully activated for ${item.patientName}! Added ₹15,000 to patient ledger.`);
    setAttentionItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, badge: "Month 2 Active", badgeColor: "emerald", actionLabel: "Active ✓" } : i))
    );
    setTimeout(() => setActivationFeedback(null), 4000);
  };

  // Quick Add Contact Modal
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickService, setQuickService] = useState(activeTenant.services?.[0]?.name || "Consultation");
  const [quickSuccess, setQuickSuccess] = useState(false);

  // Quick Tasks State (All referencing canonical demo contacts)
  const [tasks, setTasks] = useState([
    { id: "t-1", title: "Review intake form: Aisha Khan", type: "form", urgent: true, done: false },
    { id: "t-2", title: "Confirm WhatsApp booking: Priya Sharma (4:30 PM)", type: "booking", urgent: true, done: false },
    { id: "t-3", title: "Follow-up callback: Rohan Verma", type: "call", urgent: false, done: false },
    { id: "t-4", title: "Prepare clinical progress note: Rajesh Patel", type: "note", urgent: false, done: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleQuickAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    const [firstName, ...last] = quickName.trim().split(" ");
    mockStore.createContact({
      id: `cnt-${Date.now()}`,
      tenantId: activeTenant.id,
      firstName,
      lastName: last.join(" ") || "",
      fullName: quickName.trim(),
      phone: quickPhone || "+91 98261 00000",
      email: `${firstName.toLowerCase()}@example.com`,
      status: "LEAD",
      assignedPractitionerId: activeTenant.team?.[0]?.id || "staff-1",
      tags: ["Direct Ingestion"],
      notesCount: 0,
      lastContactedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      city: activeTenant.city,
    });
    setQuickSuccess(true);
    setTimeout(() => {
      setQuickSuccess(false);
      setQuickModalOpen(false);
      setQuickName("");
      setQuickPhone("");
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Today&apos;s Practice Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTenant.name} &bull; Operational schedule and patient triage
          </p>
        </div>

        {/* Operational Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add {vertical.terminology.contactSingular}</span>
          </button>

          <Link
            href="/app/appointments"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Schedule</span>
          </Link>

          <Link
            href="/app/crm"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>New Lead</span>
          </Link>
        </div>
      </div>

      {/* Above the Fold: 4 Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Appointments */}
        <Link
          href="/app/appointments"
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors shadow-none"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Today&apos;s Appointments</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">
            {todayAppointments.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {todayAppointments.filter((a) => a.status === "CONFIRMED").length} confirmed &bull; {todayAppointments.filter((a) => a.status === "COMPLETED").length} completed
          </p>
        </Link>

        {/* New Enquiries */}
        <Link
          href="/app/crm"
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors shadow-none"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">New Enquiries</span>
            <UserPlus className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">
            {newEnquiries.length}
          </p>
          <p className="text-xs text-teal-700 font-medium mt-1">
            Awaiting first contact
          </p>
        </Link>

        {/* Pending Follow-Ups */}
        <Link
          href="/app/crm"
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors shadow-none"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Pending Follow-Ups</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">
            {pendingFollowUps.length}
          </p>
          <p className="text-xs text-amber-700 font-medium mt-1">
            Due before clinic close
          </p>
        </Link>

        {/* Unread Messages */}
        <Link
          href="/app/inbox"
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors shadow-none"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Unread Messages</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">
            {unreadConversations.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {unreadConversations.length} awaiting response
          </p>
        </Link>
      </div>

      {/* Treatment Plan Management & Needs Attention Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">Treatment Plan Operations</h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Care Cycles
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active rehabilitation courses, plan cycle adherence, and clinical exception handling
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Active Plans:</span>
              <span className="font-semibold text-slate-900 font-mono">14</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Due:</span>
              <span className="font-semibold text-rose-600 font-mono">₹24,600</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Ending Soon:</span>
              <span className="font-semibold text-amber-700 font-mono">3</span>
            </div>
          </div>
        </div>

        {activationFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{activationFeedback}</span>
          </div>
        )}

        {/* Needs Attention Exceptions Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Needs Attention ({attentionItems.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">Action items requiring clinical or desk follow-up</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <Link
                      href={`/app/contacts/${item.contactId}`}
                      className="text-xs font-semibold text-slate-900 hover:text-teal-700 transition-colors truncate block"
                    >
                      {item.patientName}
                    </Link>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                        item.badgeColor === "rose"
                          ? "bg-rose-100 text-rose-800"
                          : item.badgeColor === "amber"
                          ? "bg-amber-100 text-amber-800"
                          : item.badgeColor === "emerald"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                <div>
                  {item.type === "PAYMENT_DUE" ? (
                    <button
                      onClick={() => handleOpenReminder(item)}
                      disabled={item.actionLabel.includes("✓")}
                      className="w-full py-1 px-2 rounded text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {item.actionLabel}
                    </button>
                  ) : item.type === "CYCLE_COMPLETED" ? (
                    <button
                      onClick={() => handleActivateNextMonth(item)}
                      disabled={item.actionLabel.includes("✓")}
                      className="w-full py-1 px-2 rounded text-xs font-medium text-teal-800 bg-teal-100 hover:bg-teal-200 disabled:opacity-50 transition-colors"
                    >
                      {item.actionLabel}
                    </button>
                  ) : (
                    <Link
                      href={`/app/contacts/${item.contactId}`}
                      className="w-full block text-center py-1 px-2 rounded text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      {item.actionLabel} &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Recent Leads */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Today&apos;s Schedule</h2>
                <p className="text-xs text-slate-500">Consultations across clinic rooms and tele-consults</p>
              </div>
              <Link
                href="/app/appointments"
                className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 py-1 px-1.5 rounded bg-slate-50 border border-slate-200 text-center shrink-0">
                      <span className="text-xs font-semibold text-slate-800 font-mono block">
                        {apt.startTime}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {apt.durationMinutes} min
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/app/contacts/${apt.contactId}`}
                          className="text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors"
                        >
                          {apt.contactName}
                        </Link>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {apt.mode.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{apt.serviceName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{apt.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        apt.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : apt.status === "COMPLETED"
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {apt.status}
                    </span>
                    <Link
                      href={`/app/contacts/${apt.contactId}`}
                      className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      Card
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Recent Leads</h2>
                <p className="text-xs text-slate-500">Inbound prospective patients requiring follow-up</p>
              </div>
              <Link
                href="/app/crm"
                className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Service</th>
                    <th className="pb-2">Stage</th>
                    <th className="pb-2">Source</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.slice(0, 4).map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 font-medium text-slate-900">
                        <Link
                          href={`/app/contacts/${deal.contactId}`}
                          className="hover:text-teal-700"
                        >
                          {deal.contactName}
                        </Link>
                      </td>
                      <td className="py-2.5 text-slate-600">{deal.title}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {deal.stage.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 uppercase font-mono text-[10px]">
                        {deal.source}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href="/app/crm"
                          className="text-teal-700 hover:text-teal-800 font-medium"
                        >
                          Triage &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Attention Items & Recent Messages */}
        <div className="space-y-6">
          {/* Tasks Requiring Attention */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Action Required</h2>
                <p className="text-xs text-slate-500">Operational tasks and intake reviews</p>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                {tasks.filter((t) => !t.done).length}
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-2.5 rounded-md border text-xs cursor-pointer flex items-start gap-2.5 transition-colors ${
                    task.done
                      ? "bg-slate-50 border-slate-200 text-slate-400 line-through"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                      task.done ? "bg-teal-600 border-teal-600 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {task.done && <Check className="w-3 h-3" />}
                  </div>
                  <span className="leading-tight flex-1">{task.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Recent Messages</h2>
                <p className="text-xs text-slate-500">Patient queries from WhatsApp &amp; Portal</p>
              </div>
              <Link
                href="/app/inbox"
                className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>Inbox</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href="/app/inbox"
                  className="py-2.5 flex items-start justify-between gap-2 hover:bg-slate-50 px-1 rounded transition-colors group block"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] font-medium uppercase px-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {msg.channel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {msg.content}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {(msg.timestamp || "").slice(11, 16)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Human-Triggered Payment Reminder Modal */}
      {isReminderOpen && reminderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Send Payment Reminder to {reminderTarget.patientName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              AI-assisted draft. Review and edit before dispatching via WhatsApp.
            </p>

            {reminderSent ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>WhatsApp reminder dispatched successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendReminder} className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient:</span>
                    <span className="font-medium text-slate-800">{reminderTarget.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Balance Due:</span>
                    <span className="font-mono font-bold text-rose-600">{reminderTarget.badge.replace(" Due", "")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Channel:</span>
                    <span className="font-medium text-slate-800">WhatsApp (Official Practice Channel)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Editable WhatsApp Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reminderMsg}
                    onChange={(e) => setReminderMsg(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReminderOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                  >
                    Dispatch via WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Contact Modal */}
      {quickModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Add {vertical.terminology.contactSingular}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Quickly create a patient record and initiate clinical onboarding.
            </p>

            {quickSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>Patient record created successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleQuickAddContact} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rohan Verma"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Initial Service Interest
                  </label>
                  <select
                    value={quickService}
                    onChange={(e) => setQuickService(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    {activeTenant.services?.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} (&#8377;{s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setQuickModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
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
