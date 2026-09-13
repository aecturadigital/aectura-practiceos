"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Tag,
  AlertTriangle,
  FileCheck,
  MessageSquare,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Send,
  Plus,
  HeartPulse,
  Sparkles,
  Activity,
  Check,
  ExternalLink,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Contact, Appointment, Message, Exercise } from "@/types";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeTenant, vertical, hasAccess } = useTenant();

  const contactId = params.id as string;
  const contact = mockStore.getContact(contactId);

  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "appointments" | "messages" | "forms" | "exercises" | "notes"
  >("overview");

  // Simulated New Note State
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<Array<{ id: string; date: string; author: string; text: string }>>([
    {
      id: "note-1",
      date: "2026-09-12",
      author: "Dr. Clinician",
      text: "Patient reviewed progress. Reported anxiety symptoms reduced from 8/10 to 4/10 over the past 3 weeks. Sleep hygiene adherence is solid.",
    },
    {
      id: "note-2",
      date: "2026-08-28",
      author: "Dr. Clinician",
      text: "Initial evaluation conducted. Formulated collaborative treatment plan and psychoeducation on autonomic nervous system arousal.",
    },
  ]);

  // Simulated Portal Message Sending
  const [replyText, setReplyText] = useState("");

  if (!hasAccess("contacts")) {
    return <UpgradeBanner feature="contacts" />;
  }

  if (!contact) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
        <p className="text-base font-semibold text-white mb-2">Contact Not Found</p>
        <p className="text-xs mb-6">The requested patient/client record does not exist or has been removed.</p>
        <Link
          href="/app/contacts"
          className="bg-[#0D9488] text-white text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  // Related data from connected mock store
  const appointments = mockStore.getAppointments(activeTenant.id).filter((a) => a.contactId === contact.id);
  const messages = mockStore.getMessages(activeTenant.id, contact.id);
  const exercises = mockStore.getExercises(activeTenant.id, contact.id);
  const deals = mockStore.getCrmDeals(activeTenant.id).filter((d) => d.contactId === contact.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote) return;
    setNotes([
      {
        id: `note-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        author: "Practitioner",
        text: newNote,
      },
      ...notes,
    ]);
    setNewNote("");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText) return;
    mockStore.sendMessage({
      tenantId: activeTenant.id,
      contactId: contact.id,
      channel: "PORTAL",
      direction: "OUTBOUND",
      senderName: activeTenant.name,
      content: replyText,
    });
    setReplyText("");
  };

  const tabs = [
    { id: "overview", label: "360° Overview" },
    { id: "timeline", label: "Activity Timeline" },
    { id: "appointments", label: `Appointments (${appointments.length})` },
    { id: "messages", label: `Messages (${messages.length})` },
    { id: "forms", label: "Clinical Intake & Forms" },
    ...(vertical.id === "physiotherapy" ? [{ id: "exercises", label: `Rehab Exercises (${exercises.length})` }] : []),
    { id: "notes", label: `Clinical Notes (${notes.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation */}
      <Link
        href="/app/contacts"
        className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {vertical.terminology.contactPlural}</span>
      </Link>

      {/* 360° Profile Header Card */}
      <div className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xl shrink-0 overflow-hidden shadow-md">
              {contact.avatarUrl ? (
                <img src={contact.avatarUrl} alt={contact.fullName} className="w-full h-full object-cover" />
              ) : (
                contact.firstName.charAt(0)
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{contact.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {contact.status}
                </span>
                {contact.riskFlag && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                    Risk: {contact.riskFlag}
                  </span>
                )}
                {contact.painScore !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    Pain Level: {contact.painScore}/10
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  {contact.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  {contact.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {contact.city || activeTenant.city}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {contact.tags?.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <Link
              href="/app/appointments"
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Session</span>
            </Link>
            <button
              onClick={() => setActiveTab("messages")}
              className="bg-[#20242E] hover:bg-[#2B303D] text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-[#2D3342] transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
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

      {/* TAB 1: 360° Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Clinical Summary */}
            <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-3">Clinical Profile &amp; Presentation</h2>
              <div className="space-y-4 text-xs">
                {contact.chiefComplaint && (
                  <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                    <span className="text-slate-400 block mb-1">Chief Complaint</span>
                    <span className="font-semibold text-white text-sm">{contact.chiefComplaint}</span>
                  </div>
                )}

                {contact.presentingConcerns && contact.presentingConcerns.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                    <span className="text-slate-400 block mb-1.5">Presenting Concerns</span>
                    <div className="flex flex-wrap gap-1.5">
                      {contact.presentingConcerns.map((pc, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-medium"
                        >
                          {pc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {contact.emergencyContact && (
                    <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                      <span className="text-slate-400 block mb-1">Emergency Contact</span>
                      <span className="font-medium text-white">{contact.emergencyContact}</span>
                    </div>
                  )}

                  {contact.mobilityLevel && (
                    <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                      <span className="text-slate-400 block mb-1">Mobility Level</span>
                      <span className="font-medium text-white">{contact.mobilityLevel}</span>
                    </div>
                  )}

                  {contact.surgeryHistory && (
                    <div className="col-span-2 p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                      <span className="text-slate-400 block mb-1">Surgery / Medical History</span>
                      <span className="text-slate-300">{contact.surgeryHistory}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assessment Screening Scores */}
            {(contact.phq9Score !== undefined || contact.gad7Score !== undefined) && (
              <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-3">Clinical Screening Scores</h2>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#121417] border border-[#22252C]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 font-semibold">PHQ-9 (Depression)</span>
                      <span className="text-base font-bold text-teal-400 font-mono">
                        {contact.phq9Score} / 27
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Moderate Severity</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121417] border border-[#22252C]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 font-semibold">GAD-7 (Anxiety)</span>
                      <span className="text-base font-bold text-amber-400 font-mono">
                        {contact.gad7Score} / 21
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Moderate-Severe Anxiety</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Rail: Connected Metrics */}
          <div className="space-y-6">
            <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Patient Care Summary</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#242833]">
                  <span className="text-slate-400">Completed Sessions</span>
                  <span className="font-bold text-white font-mono">{contact.totalSessionsCompleted || 0}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#242833]">
                  <span className="text-slate-400">Active CRM Deal</span>
                  <span className="font-mono text-teal-400 font-semibold">
                    {contact.activeDealStage || "None"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#242833]">
                  <span className="text-slate-400">Next Scheduled</span>
                  <span className="font-mono text-white text-right">
                    {contact.nextAppointmentDate || "Not booked"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Consent Signed</span>
                  <span className="text-emerald-400 font-semibold">
                    {contact.consentSigned ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-2">Simulate Client Portal</h2>
              <p className="text-xs text-slate-400 mb-4">
                View the client&apos;s authenticated experience as seen on their self-service portal.
              </p>
              <Link
                href="/portal"
                target="_blank"
                className="w-full py-2.5 rounded-xl bg-[#20242E] hover:bg-[#2B313E] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-[#2E3443] transition-colors"
              >
                <span>Launch Client Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Activity Timeline */}
      {activeTab === "timeline" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Chronological Patient Journey</h2>
          <div className="space-y-4 text-xs pl-4 border-l border-teal-800/40 mt-4">
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 absolute -left-[21px] top-1" />
              <p className="font-semibold text-white">Upcoming Session Scheduled</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Tuesday at 4:30 PM with Dr. Ananya Sharma</p>
              <span className="text-[10px] text-slate-500 font-mono">10 Sep 2026</span>
            </div>

            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 absolute -left-[21px] top-1" />
              <p className="font-semibold text-white">Client Portal Message Received</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Reported thought log insights regarding pre-presentation anxiety.</p>
              <span className="text-[10px] text-slate-500 font-mono">12 Sep 2026</span>
            </div>

            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 absolute -left-[21px] top-1" />
              <p className="font-semibold text-white">Intake Questionnaire Completed</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Completed digital clinical intake and signed informed consent.</p>
              <span className="text-[10px] text-slate-500 font-mono">15 Aug 2026</span>
            </div>

            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 absolute -left-[21px] top-1" />
              <p className="font-semibold text-white">Initial Website Enquiry Capture</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Enquiry captured via MindWell public website booking modal.</p>
              <span className="text-[10px] text-slate-500 font-mono">10 Aug 2026</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Appointments */}
      {activeTab === "appointments" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Appointment Records</h2>
            <Link
              href="/app/appointments"
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Session</span>
            </Link>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl bg-[#121417] border border-[#22252C] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white text-sm">{apt.serviceName}</p>
                  <p className="text-slate-400 text-[11px]">
                    {apt.date} at {apt.startTime} ({apt.durationMinutes} min) &bull; Provider: {apt.staffName}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">{apt.location}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Messages */}
      {activeTab === "messages" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#242833] pb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Unified Conversation History</h2>
              <p className="text-xs text-slate-400">Two-way messages between practice and {contact.fullName}.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
              Live Shared Store
            </span>
          </div>

          {/* Messages list */}
          <div className="space-y-3 max-h-80 overflow-y-auto p-2">
            {messages.map((m) => {
              const isOutbound = m.direction === "OUTBOUND";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs ${
                      isOutbound
                        ? "bg-[#0D9488] text-white rounded-br-none"
                        : "bg-[#1E222A] text-slate-200 border border-[#2B2F3C] rounded-bl-none"
                    }`}
                  >
                    <p className="text-[10px] font-semibold opacity-75 mb-1">{m.senderName}</p>
                    <p className="leading-relaxed">{m.content}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reply form */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[#242833]">
            <input
              type="text"
              placeholder={`Send message to ${contact.firstName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Clinical Intake Forms */}
      {activeTab === "forms" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Submitted Intake Questionnaires</h2>
          <div className="p-4 rounded-xl bg-[#121417] border border-[#22252C] space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-[#22252C] pb-2">
              <span className="font-bold text-white">Pre-Session Adult Clinical Questionnaire</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Verified &amp; Signed
              </span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div>
                <p className="text-slate-500 text-[11px]">Primary reason for seeking care:</p>
                <p className="text-slate-200">{contact.presentingConcerns?.join(", ") || contact.chiefComplaint || "General care"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Emergency Contact:</p>
                <p className="text-slate-200">{contact.emergencyContact || "On file"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Informed Telehealth / Clinical Consent:</p>
                <p className="text-emerald-400">Electronically agreed on intake submission date</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Exercises (Physiotherapy) */}
      {activeTab === "exercises" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Prescribed Rehabilitation Exercises</h2>
              <p className="text-xs text-slate-400">Home programme assigned to {contact.fullName}.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="p-4 rounded-xl bg-[#121417] border border-[#22252C] flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{ex.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                      {ex.frequency}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mb-3">{ex.instruction}</p>
                  <div className="flex gap-4 text-[11px] text-slate-400">
                    <span>Sets: <strong className="text-white">{ex.sets}</strong></span>
                    <span>Reps: <strong className="text-white">{ex.reps}</strong></span>
                    <span>Hold: <strong className="text-white">{ex.duration}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#22252C] mt-3 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">{ex.targetMuscle}</span>
                  <span className={ex.completedToday ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                    {ex.completedToday ? "✓ Done Today" : "Pending Today"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: Clinical Notes */}
      {activeTab === "notes" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Clinical Session Notes</h2>
            <p className="text-xs text-slate-400">Confidential clinical documentation and observations.</p>
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              required
              rows={3}
              placeholder="Record clinical observations, interventions, and homework for next session..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm"
              >
                Save Clinical Note
              </button>
            </div>
          </form>

          {/* Notes History */}
          <div className="space-y-3 pt-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-[#121417] border border-[#22252C] text-xs space-y-1.5"
              >
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span className="font-semibold text-teal-400">{note.author}</span>
                  <span className="font-mono">{note.date}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
