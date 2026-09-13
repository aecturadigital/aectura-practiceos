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
  AlertCircle,
  FileCheck,
  MessageSquare,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Send,
  Plus,
  Check,
  ExternalLink,
  ChevronRight,
  MoreHorizontal,
  Activity,
  UserCheck,
  ShieldCheck,
  File,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Contact, Appointment, Message, Exercise, ContactStatus } from "@/types";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeTenant, vertical, hasAccess } = useTenant();

  const contactId = params.id as string;
  const contact = mockStore.getContact(contactId);

  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "appointments" | "messages" | "forms" | "documents" | "clinical"
  >("timeline");

  // Notes state
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<Array<{ id: string; date: string; author: string; text: string }>>([
    {
      id: "note-1",
      date: "2026-09-12",
      author: "Dr. Clinician",
      text: "Reviewed clinical progress. Patient reported symptom intensity decreased from 8/10 to 4/10 over the past 3 weeks. Sleep hygiene adherence is solid.",
    },
    {
      id: "note-2",
      date: "2026-08-28",
      author: "Dr. Clinician",
      text: "Initial evaluation conducted. Formulated collaborative treatment plan and psychoeducation on physiological arousal patterns.",
    },
  ]);

  // Reply state for messages tab
  const [replyText, setReplyText] = useState("");

  // Quick Action Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookServiceId, setBookServiceId] = useState(activeTenant.services?.[0]?.id || "");
  const [bookDate, setBookDate] = useState("2026-09-20");
  const [bookTime, setBookTime] = useState("10:30");
  const [bookNotes, setBookNotes] = useState("");

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [modalNoteText, setModalNoteText] = useState("");

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [directMessageText, setDirectMessageText] = useState("");

  if (!hasAccess("contacts")) {
    return <UpgradeBanner feature="contacts" />;
  }

  if (!contact) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        <p className="text-base font-semibold text-slate-900 mb-1">Record Not Found</p>
        <p className="text-xs mb-4">The requested client record does not exist or has been archived.</p>
        <Link
          href="/app/contacts"
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Directory</span>
        </Link>
      </div>
    );
  }

  const practitioner = activeTenant.team?.find((m) => m.id === contact.assignedPractitionerId) || activeTenant.team?.[0];
  const appointments = mockStore.getAppointments(activeTenant.id).filter((a) => a.contactId === contact.id);
  const messages = mockStore.getMessages(activeTenant.id, contact.id);
  const exercises = mockStore.getExercises(activeTenant.id, contact.id);
  const submissions = mockStore.getFormSubmissions(activeTenant.id).filter((s) => s.contactId === contact.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([
      {
        id: `note-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        author: practitioner?.name || "Clinician",
        text: newNote.trim(),
      },
      ...notes,
    ]);
    setNewNote("");
  };

  const handleModalAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNoteText.trim()) return;
    setNotes([
      {
        id: `note-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        author: practitioner?.name || "Clinician",
        text: modalNoteText.trim(),
      },
      ...notes,
    ]);
    setModalNoteText("");
    setIsNoteModalOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    mockStore.sendMessage({
      tenantId: activeTenant.id,
      contactId: contact.id,
      direction: "OUTBOUND",
      channel: "WHATSAPP",
      senderName: "Clinic Desk",
      content: replyText.trim(),
    });
    setReplyText("");
  };

  const handleDirectMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMessageText.trim()) return;
    mockStore.sendMessage({
      tenantId: activeTenant.id,
      contactId: contact.id,
      direction: "OUTBOUND",
      channel: "WHATSAPP",
      senderName: "Clinic Desk",
      content: directMessageText.trim(),
    });
    setDirectMessageText("");
    setIsMessageModalOpen(false);
    setActiveTab("messages");
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const service = activeTenant.services?.find((s) => s.id === bookServiceId) || activeTenant.services?.[0];
    mockStore.createAppointment({
      id: `apt-${Date.now()}`,
      tenantId: activeTenant.id,
      contactId: contact.id,
      contactName: contact.fullName,
      serviceId: service?.id || "srv-1",
      serviceName: service?.name || "Consultation",
      staffId: practitioner?.id || "staff-1",
      staffName: practitioner?.name || "Practitioner",
      date: bookDate,
      startTime: bookTime,
      durationMinutes: service?.durationMinutes || 45,
      status: "CONFIRMED",
      mode: "IN_PERSON",
      location: "Room 201",
      contactPhone: contact.phone,
      intakeFormSubmitted: true,
      notes: bookNotes,
      createdAt: new Date().toISOString(),
    });
    setIsBookModalOpen(false);
    setActiveTab("appointments");
  };

  // Compile Unified Relationship Timeline
  const timelineEvents = [
    ...notes.map((n) => ({
      id: n.id,
      date: n.date,
      type: "note" as const,
      title: `Clinical Note logged by ${n.author}`,
      desc: n.text,
      badge: "Clinical Note",
    })),
    ...appointments.map((a) => ({
      id: a.id,
      date: a.date,
      type: "appointment" as const,
      title: `${a.status === "COMPLETED" ? "Completed" : "Scheduled"} Consultation: ${a.serviceName}`,
      desc: `With ${a.staffName} at ${a.startTime} (${a.durationMinutes}m) - ${a.mode.replace("_", " ")}`,
      badge: `${a.status}`,
    })),
    ...messages.slice(0, 3).map((m) => ({
      id: m.id,
      date: (m.timestamp || "").split("T")[0],
      type: "message" as const,
      title: `${m.direction === "INBOUND" ? "Patient Message" : "Outbound Message"} via ${m.channel}`,
      desc: m.content,
      badge: m.channel,
    })),
    ...submissions.map((s) => ({
      id: s.id,
      date: s.submittedAt.split("T")[0],
      type: "form" as const,
      title: `${s.formTitle} Submitted`,
      desc: Object.entries(s.answers || {}).slice(0, 2).map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1')}: ${v}`).join(" • ") || "Clinical responses logged.",
      badge: "Intake",
    })),
    {
      id: "created-1",
      date: contact.createdAt.split("T")[0],
      type: "system" as const,
      title: `${vertical.terminology.contactSingular} Profile Created`,
      desc: `Ingested from ${contact.tags[0] || "Clinic Website"}`,
      badge: "Onboarding",
    },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isClinicalEnabled = vertical.id === "physiotherapy" || vertical.id === "psychology";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back to Directory Link */}
      <div className="flex items-center gap-2">
        <Link
          href="/app/contacts"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{vertical.terminology.contactPlural} Directory</span>
        </Link>
      </div>

      {/* 360 Header: Clinical Profile Lockup & Primary Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-700 text-base shrink-0">
            {contact.firstName.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                {contact.fullName}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  contact.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : contact.status === "LEAD"
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {contact.status}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ID: {contact.id}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5 font-mono">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{contact.phone}</span>
              </span>
              <span className="flex items-center gap-1 font-sans">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{contact.email}</span>
              </span>
              <span className="flex items-center gap-1 font-sans text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>{practitioner?.name || "Unassigned"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto">
          <button
            onClick={() => setIsMessageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Message</span>
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-medium text-slate-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "timeline"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Timeline
        </button>

        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "appointments"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab("messages")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "messages"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Messages ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab("forms")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "forms"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Forms
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "documents"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Documents
        </button>

        {isClinicalEnabled && (
          <button
            onClick={() => setActiveTab("clinical")}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "clinical"
                ? "border-teal-600 text-teal-800 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            {vertical.id === "physiotherapy" ? "Rehab & Exercises" : "Clinical Formulations"}
          </button>
        )}
      </div>

      {/* Tab Panels with Right-Side Clinical Context Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Tab View (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Demographic &amp; Contact Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Full Name</span>
                    <span className="text-slate-800 font-medium">{contact.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Phone Number</span>
                    <span className="text-slate-800 font-mono">{contact.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Email</span>
                    <span className="text-slate-800">{contact.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Location</span>
                    <span className="text-slate-800">{contact.city || activeTenant.city}, {activeTenant.country}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Relationship Status</span>
                    <span className="text-slate-800">{contact.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Acquisition Source</span>
                    <span className="text-slate-800">{contact.tags[0] || "Clinic Website"}</span>
                  </div>
                </div>
              </div>

              {/* Presenting Clinical Concerns */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Clinical Focus &amp; Presenting Concerns</h3>
                {contact.chiefComplaint && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
                    <strong className="text-slate-900">Primary Complaint:</strong> {contact.chiefComplaint}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {contact.presentingConcerns?.map((concern, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                    >
                      {concern}
                    </span>
                  )) || (
                    <span className="text-xs text-slate-400">No specific symptoms recorded yet.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE (Source of Truth) */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              {/* Quick Note Input Box */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-900">
                    Log Clinical or Administrative Note
                  </label>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter observation, conversation summary, or treatment adjustment..."
                    className="w-full text-xs p-2.5 rounded-md border border-slate-200 focus:outline-none focus:border-teal-600 bg-slate-50 focus:bg-white text-slate-900 transition-colors"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Logged by {practitioner?.name}
                    </span>
                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      className="px-3 py-1 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors"
                    >
                      Save to Timeline
                    </button>
                  </div>
                </form>
              </div>

              {/* Chronological Stream */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Relationship History &amp; Events
                </h3>

                <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-6">
                  {timelineEvents.map((evt) => (
                    <div key={evt.id} className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white absolute -left-[21px] top-1.5" />
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-slate-900">
                          {evt.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {evt.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {evt.desc}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {evt.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">
                  Appointment History ({appointments.length})
                </h3>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Consultation</span>
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No appointments recorded for this client.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{apt.serviceName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {apt.mode.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {apt.date} at {apt.startTime} &bull; {apt.staffName} &bull; {apt.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            apt.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : apt.status === "COMPLETED"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {apt.status}
                        </span>
                        <span className="font-mono text-slate-700 font-medium">
                          &#8377;{activeTenant.services?.find((s) => s.id === apt.serviceId)?.price || 1500}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MESSAGES */}
          {activeTab === "messages" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Direct Communications &amp; WhatsApp Thread
              </h3>

              <div className="space-y-3 max-h-[360px] overflow-y-auto p-3 rounded-md bg-slate-50 border border-slate-200">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No previous messages.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[80%] text-xs p-3 rounded-lg ${
                        m.direction === "OUTBOUND"
                          ? "ml-auto bg-teal-800 text-white"
                          : "mr-auto bg-white border border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 opacity-80 text-[10px]">
                        <span>{m.senderName}</span>
                        <span className="font-mono">{(m.timestamp || "").slice(11, 16)}</span>
                      </div>
                      <p className="leading-relaxed">{m.content}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an outbound message or update..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: FORMS */}
          {activeTab === "forms" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Completed Assessments &amp; Questionnaires</h3>
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No completed form submissions on record for this {vertical.terminology.contactSingular.toLowerCase()}.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-900 block">{sub.formTitle}</span>
                          <span className="text-slate-400 text-[11px]">
                            Submitted on {new Date(sub.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} &bull; Verified by Desk
                          </span>
                        </div>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-medium">
                          Verified
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1 text-[11px]">
                        {Object.entries(sub.answers || {}).map(([k, val]) => (
                          <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                            <span className="text-slate-500 font-medium capitalize min-w-[140px]">{k.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="text-slate-800">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Clinical Documents &amp; Referral Letters</h3>
                <span className="text-xs text-slate-400">R2 Secure Storage</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-800 font-medium">Doctor_Referral_General_Physician.pdf</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">342 KB</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-800 font-medium">Signed_Consent_Telehealth_Agreement.pdf</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">118 KB</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CLINICAL (Conditional) */}
          {activeTab === "clinical" && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {vertical.id === "physiotherapy" ? "Prescribed Rehab Protocols" : "Therapy Protocols"}
              </h3>
              {exercises.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No active prescriptions assigned.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {exercises.map((ex) => (
                    <div key={ex.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 block">{ex.title}</span>
                        <span className="text-slate-500 text-[11px]">
                          {ex.sets} sets x {ex.reps} reps &bull; {ex.frequency} &bull; {ex.targetMuscle}
                        </span>
                      </div>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        Prescribed
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right-Side Clinical Context Panel (1 Col) */}
        <div className="space-y-4">
          {/* Quick Clinical Snapshot */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Care Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Consultations</span>
                <span className="font-semibold text-slate-900">{appointments.length}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Attendance Rate</span>
                <span className="font-semibold text-emerald-700">100%</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lead Practitioner</span>
                <span className="font-medium text-slate-800">{practitioner?.name}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Care Plan</span>
                <span className="font-medium text-slate-800">Standard Consult</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none space-y-2">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Emergency Contact
            </h3>
            <div className="text-xs text-slate-600">
              <p className="font-medium text-slate-900">Kavita (Spouse / Family)</p>
              <p className="font-mono text-slate-500 mt-0.5">+91 98260 11223</p>
            </div>
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Book Appointment for {contact.fullName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select date, time, and service to schedule directly into the calendar.
            </p>

            <form onSubmit={handleBookAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Service</label>
                <select
                  value={bookServiceId}
                  onChange={(e) => setBookServiceId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  {activeTenant.services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} min &bull; &#8377;{s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Clinical Note / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Follow-up consultation in Room 201"
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Add Clinical Note
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Logged to the timeline for {contact.fullName}.
            </p>

            <form onSubmit={handleModalAddNote} className="space-y-3">
              <textarea
                rows={4}
                required
                value={modalNoteText}
                onChange={(e) => setModalNoteText(e.target.value)}
                placeholder="Enter clinical observations, patient report, or next session focus..."
                className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Send Message to {contact.fullName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatches via WhatsApp to {contact.phone}.
            </p>

            <form onSubmit={handleDirectMessageSubmit} className="space-y-3">
              <textarea
                rows={3}
                required
                value={directMessageText}
                onChange={(e) => setDirectMessageText(e.target.value)}
                placeholder="Type your message to the patient..."
                className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Send via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
