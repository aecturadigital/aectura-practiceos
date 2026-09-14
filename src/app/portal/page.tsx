"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageSquare,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  CheckCircle2,
  FileCheck,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  Upload,
  File,
  AlertTriangle,
  X,
  Send,
  HelpCircle,
  Phone,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Appointment, TreatmentSessionStatus, DocumentRequest } from "@/types";

export default function PatientPortalDashboardPage() {
  const { activeTenant, vertical } = useTenant();

  // Connected patient
  const contacts = mockStore.getContacts(activeTenant.id);
  const patient = contacts.find((c) => c.fullName.includes("Priya")) || contacts[0] || {
    id: "cnt-mp-priya",
    firstName: "Priya",
    fullName: "Priya Sharma",
    phone: "+91 98260 12345",
  };

  // Connected appointments
  const appointments = mockStore.getAppointments(activeTenant.id).filter((a) => a.contactId === patient.id);
  const nextAppointment = appointments.find((a) => a.status === "CONFIRMED") || appointments[0];

  // Active Treatment Cycle & Trackers
  const activeCycle = mockStore.getActivePlanCycle(patient.id);
  const milestones = mockStore.getMilestones(patient.id);
  const documentRequests = mockStore.getDocumentRequests(activeTenant.id, patient.id);

  // Exercises if physio
  const exercises = mockStore.getExercises(activeTenant.id, patient.id);
  const [exerciseList, setExerciseList] = useState(exercises);
  const completedExercises = exerciseList.filter((e) => e.completedToday).length;

  const isPhysio = activeTenant.verticalId === "physiotherapy";

  // Evening Appointment Confirmation State
  const [confirmationStatus, setConfirmationStatus] = useState<
    "AWAITING" | "CONFIRMED" | "DECLINED" | "RESCHEDULED"
  >("AWAITING");
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState("Tomorrow at 3:00 PM");

  // Document Upload State
  const [docList, setDocList] = useState<DocumentRequest[]>(documentRequests);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocReq, setSelectedDocReq] = useState<DocumentRequest | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState("Priya_Sharma_MRI_Spine_Report.pdf");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Floating Concierge Assistant Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "AI" | "USER"; text: string; time: string; isEmergency?: boolean }>
  >([
    {
      sender: "AI",
      text: `Hello ${patient.firstName}! I am your ${activeTenant.name} digital care concierge. How can I assist you with your appointments, recovery protocol, or clinic visits today?`,
      time: "Just now",
    },
  ]);

  const handleConfirmAttendance = () => {
    setConfirmationStatus("CONFIRMED");
    mockStore.logStaffActivity(
      activeTenant.id,
      patient.fullName,
      "PATIENT_CONFIRMED_APPOINTMENT",
      "Tomorrow's Session (10:00 AM)",
      "Patient confirmed attendance via portal evening confirmation card.",
      "APPOINTMENT"
    );
  };

  const handleDeclineAttendance = () => {
    setConfirmationStatus("DECLINED");
    mockStore.logStaffActivity(
      activeTenant.id,
      patient.fullName,
      "PATIENT_DECLINED_IN_ADVANCE",
      "Tomorrow's Session (10:00 AM)",
      "Patient notified clinic in advance. Slot released for waitlist. Does not count as no-show.",
      "APPOINTMENT"
    );
  };

  const handleMorningChangeOfMind = () => {
    setConfirmationStatus("CONFIRMED");
    mockStore.logStaffActivity(
      activeTenant.id,
      patient.fullName,
      "MORNING_CHANGE_OF_MIND",
      "Today's Session (10:00 AM)",
      "Patient reclaimed attendance slot in the morning. Re-confirmed.",
      "APPOINTMENT"
    );
  };

  const handleRescheduleConfirm = () => {
    setConfirmationStatus("RESCHEDULED");
    setIsRescheduleOpen(false);
    mockStore.logStaffActivity(
      activeTenant.id,
      patient.fullName,
      "RESCHEDULE_VIA_PORTAL",
      selectedRescheduleSlot,
      `Patient rescheduled session to ${selectedRescheduleSlot}.`,
      "APPOINTMENT"
    );
  };

  const handleToggleExercise = (exerciseId: string) => {
    const updated = exerciseList.map((ex) =>
      ex.id === exerciseId ? { ...ex, completedToday: !ex.completedToday } : ex
    );
    setExerciseList(updated);
    mockStore.toggleExerciseCompletion(
      exerciseId,
      !exerciseList.find((e) => e.id === exerciseId)?.completedToday
    );
  };

  const handleUploadFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocReq) return;

    mockStore.uploadDocument(
      selectedDocReq.id,
      simulatedFileName,
      `https://r2.aectura.in/documents/${selectedDocReq.id}/${simulatedFileName}`
    );

    setDocList(mockStore.getDocumentRequests(activeTenant.id, patient.id));
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadModalOpen(false);
    }, 1200);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim().toLowerCase();
    const userMsg = chatInput.trim();
    setChatInput("");

    const newMsgs = [
      ...chatMessages,
      { sender: "USER" as const, text: userMsg, time: "Just now" },
    ];
    setChatMessages(newMsgs);

    // AI Guardrail Response Generation
    setTimeout(() => {
      let reply = "";
      let isEmergency = false;

      if (
        query.includes("pain") &&
        (query.includes("severe") || query.includes("chest") || query.includes("unbearable") || query.includes("emergency"))
      ) {
        isEmergency = true;
        reply = `🚨 MEDICAL NOTICE: If you are experiencing severe, sudden, or acute worsening pain, please seek immediate medical evaluation at the nearest hospital emergency room or call 112. For clinic assistance, call ${activeTenant.phone}.`;
      } else if (query.includes("appointment") || query.includes("time") || query.includes("schedule")) {
        reply = `Your next scheduled clinical session is on ${nextAppointment?.date || "Tomorrow"} at ${nextAppointment?.startTime || "10:00 AM"} with ${nextAppointment?.staffName || "your practitioner"} in ${nextAppointment?.location || "Consultation Room"}.`;
      } else if (query.includes("direction") || query.includes("address") || query.includes("parking") || query.includes("where")) {
        reply = `${activeTenant.name} is located at ${activeTenant.address}, ${activeTenant.city}. Dedicated patient parking is available on-site with elevator access to our clinical suites.`;
      } else if (query.includes("bill") || query.includes("due") || query.includes("pay") || query.includes("balance")) {
        reply = `Your current treatment plan balance is ₹5,800. You can pay securely online using UPI/Card at https://pay.aectura.in/${patient.id} or settle at reception during your visit tomorrow.`;
      } else if (query.includes("exercise") || query.includes("rehab")) {
        reply = `Dr. Rajesh has prescribed your daily Spine Mobility and Core Activation protocol. You have completed ${completedExercises} of ${exerciseList.length} prescribed exercises today.`;
      } else {
        reply = `Thank you for contacting ${activeTenant.name}. Your inquiry has been routed to our front desk team. You can also reach us directly on WhatsApp at ${activeTenant.whatsapp || activeTenant.phone}.`;
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "AI", text: reply, time: "Just now", isEmergency },
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#16181F] to-[#141824] border border-[#272B38] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800">
                Patient Self-Service Portal
              </span>
              <span className="text-xs text-slate-400">{activeTenant.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {patient.firstName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Personalized recovery roadmap, appointment confirmations, and clinical document requests.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Care Concierge</span>
            </button>
          </div>
        </div>
      </div>

      {/* EVENING APPOINTMENT CONFIRMATION SIMULATOR CARD */}
      <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Tomorrow&apos;s Clinical Session Confirmation
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-400 border border-amber-800/80 font-semibold">
            {confirmationStatus === "AWAITING"
              ? "Action Requested"
              : confirmationStatus === "CONFIRMED"
              ? "Confirmed ✓"
              : confirmationStatus === "DECLINED"
              ? "Declined in Advance"
              : "Rescheduled ✓"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#101216] border border-[#22252C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white font-mono">
                {confirmationStatus === "RESCHEDULED" ? selectedRescheduleSlot : "Tomorrow, Sep 15 &bull; 10:00 AM"}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Lower Back Rehabilitation &bull; Session #19 of 30
            </p>
            <p className="text-[11px] text-slate-400">
              With Dr. Rajesh Kulkarni &bull; Physiotherapy Suite 2
            </p>
          </div>

          {confirmationStatus === "AWAITING" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleConfirmAttendance}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Yes, I will attend
              </button>
              <button
                onClick={handleDeclineAttendance}
                className="px-3 py-2 rounded-xl bg-[#1E222B] hover:bg-[#282D3B] text-slate-300 text-xs font-medium border border-[#2C3140] transition-colors"
              >
                No, cannot make it
              </button>
              <button
                onClick={() => setIsRescheduleOpen(true)}
                className="px-3 py-2 rounded-xl bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 text-xs font-medium border border-teal-800/60 transition-colors"
              >
                Need another time
              </button>
            </div>
          )}

          {confirmationStatus === "CONFIRMED" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Session confirmed! Your room is reserved for 10:00 AM.</span>
            </div>
          )}

          {confirmationStatus === "DECLINED" && (
            <div className="space-y-2 text-right">
              <div className="text-xs text-slate-300">
                Notified clinic in advance. Slot released to waitlist.
              </div>
              <button
                onClick={handleMorningChangeOfMind}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors"
              >
                Plans changed? I can come today
              </button>
            </div>
          )}

          {confirmationStatus === "RESCHEDULED" && (
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Rescheduled to {selectedRescheduleSlot}!</span>
            </div>
          )}
        </div>
      </div>

      {/* GAMIFICATION & JOURNEY ROADMAP STRIP */}
      {isPhysio ? (
        /* Physiotherapy Gamified Recovery Strip */
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232630]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  8 Visit Consistency Streak
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-mono font-semibold">
                  93% Care Adherence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Consistent attendance dramatically shortens recovery timelines. Approved rest days do not break your streak!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#101216] border border-[#22252C] rounded-2xl text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Cycle Progress</span>
                <span className="text-lg font-bold text-teal-400 font-mono">18 / 30</span>
              </div>
            </div>
          </div>

          {/* Treatment Milestones Badges */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Recovery Milestones
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-800/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-800/60 text-teal-300 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">10 Sessions Milestone</span>
                  <span className="text-[10px] text-teal-400">Achieved on Session #10</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#101216] border border-amber-900/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                  18/20
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">20 Sessions Milestone</span>
                  <span className="text-[10px] text-amber-400">2 sessions to target badge</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#101216] border border-[#22252C] flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs font-mono">
                  30
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Graduation Target</span>
                  <span className="text-[10px] text-slate-500">Return to Full Activity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Journey Roadmap Stepper */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Clinical Journey Roadmap
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-teal-950/50 border border-teal-800 text-teal-300 space-y-1">
                <span className="text-[10px] font-mono block text-teal-500 font-bold">PHASE 1 ✓</span>
                <span className="font-semibold block text-white text-[11px]">Assessment</span>
                <span className="text-[10px] text-slate-400 block">Baseline established</span>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/50 border border-teal-800 text-teal-300 space-y-1">
                <span className="text-[10px] font-mono block text-teal-500 font-bold">PHASE 2 ✓</span>
                <span className="font-semibold block text-white text-[11px]">Acute Relief</span>
                <span className="text-[10px] text-slate-400 block">Pain from 8/10 to 4/10</span>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/50 border border-teal-800 text-teal-300 space-y-1">
                <span className="text-[10px] font-mono block text-teal-500 font-bold">PHASE 3 ✓</span>
                <span className="font-semibold block text-white text-[11px]">Mobility &amp; Range</span>
                <span className="text-[10px] text-slate-400 block">Lumbar flexion restored</span>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/70 border-2 border-sky-500 text-sky-200 space-y-1 shadow-md">
                <span className="text-[10px] font-mono block text-sky-400 font-bold">PHASE 4 (NOW)</span>
                <span className="font-semibold block text-white text-[11px]">Strength &amp; Core</span>
                <span className="text-[10px] text-slate-300 block">Session 18/30</span>
              </div>

              <div className="p-3 rounded-xl bg-[#101216] border border-[#22252C] text-slate-500 space-y-1">
                <span className="text-[10px] font-mono block text-slate-600 font-bold">PHASE 5</span>
                <span className="font-semibold block text-slate-400 text-[11px]">Peak Activity</span>
                <span className="text-[10px] text-slate-600 block">Independent Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Psychology Non-Gamified Serene Care Roadmap */
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#232630]">
            <div>
              <h2 className="text-base font-bold text-white">Therapeutic Care Continuity</h2>
              <p className="text-xs text-slate-400">
                Structured psychotherapy continuum tailored to your wellbeing goals.
              </p>
            </div>
            <span className="text-xs font-mono text-teal-400 bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800 font-semibold">
              Session 6 of 10 Completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800 text-teal-300">
              <span className="font-semibold text-white block">1. Therapeutic Alliance ✓</span>
              <span className="text-[11px] text-slate-400">Intake &amp; safety framing</span>
            </div>
            <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-600 text-sky-200">
              <span className="font-semibold text-white block">2. Cognitive Restructuring (Current)</span>
              <span className="text-[11px] text-slate-300">Active somatic tools</span>
            </div>
            <div className="p-3 rounded-xl bg-[#101216] border border-[#22252C] text-slate-500">
              <span className="font-semibold text-slate-400 block">3. Emotional Resilience</span>
              <span className="text-[11px] text-slate-600">Behavioral consolidation</span>
            </div>
            <div className="p-3 rounded-xl bg-[#101216] border border-[#22252C] text-slate-500">
              <span className="font-semibold text-slate-400 block">4. Relapse Prevention</span>
              <span className="text-[11px] text-slate-600">Independent maintenance</span>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT REQUESTS & SECURE UPLOAD SECTION */}
      <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4 text-teal-400" />
            <h2 className="text-base font-bold text-white">Clinical Documents &amp; Reports</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            R2 Encrypted Healthcare Storage
          </span>
        </div>

        <div className="divide-y divide-[#22252C]">
          {docList.map((doc) => (
            <div
              key={doc.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {doc.documentType} ({doc.notes})
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      doc.status === "UPLOADED" || doc.status === "REVIEWED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Requested by {doc.requestedBy} &bull; Due by {doc.dueDate}
                </p>
                {doc.uploadedFileName && (
                  <p className="text-xs text-teal-400 font-mono flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>File on file: {doc.uploadedFileName}</span>
                  </p>
                )}
              </div>

              <div>
                {doc.status === "REQUESTED" ? (
                  <button
                    onClick={() => {
                      setSelectedDocReq(doc);
                      setIsUploadModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Verified by Care Team</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PHYSIOTHERAPY EXERCISES (Interactive Check-off) */}
      {isPhysio && (
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-bold text-white">Daily Rehabilitation Protocol</h2>
            </div>
            <span className="text-xs font-mono text-sky-400 font-semibold">
              {completedExercises} of {exerciseList.length} Complete Today
            </span>
          </div>

          <div className="divide-y divide-[#22252C]">
            {exerciseList.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleToggleExercise(ex.id)}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#101216] px-2 rounded-xl transition-colors group"
              >
                <div className="space-y-0.5">
                  <span
                    className={`text-xs font-semibold block transition-colors ${
                      ex.completedToday ? "text-slate-400 line-through" : "text-white group-hover:text-sky-300"
                    }`}
                  >
                    {ex.title}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {ex.sets} sets &times; {ex.reps} reps &bull; {ex.frequency} &bull; Target: {ex.targetMuscle}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                    ex.completedToday
                      ? "bg-sky-500 border-sky-500 text-slate-900 font-bold"
                      : "border-slate-600 bg-transparent text-transparent"
                  }`}
                >
                  ✓
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-[#16181F] border border-[#272B38] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#232630]">
              <h3 className="text-sm font-bold text-white">Reschedule Your Session</h3>
              <button
                onClick={() => setIsRescheduleOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Select an open slot with Dr. Rajesh Kulkarni:
            </p>

            <div className="space-y-2">
              {[
                "Tomorrow at 3:00 PM (OPD Suite 2)",
                "Wednesday, Sep 16 at 11:00 AM (OPD Suite 2)",
                "Thursday, Sep 17 at 4:30 PM (OPD Suite 2)",
              ].map((slot) => (
                <div
                  key={slot}
                  onClick={() => setSelectedRescheduleSlot(slot)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedRescheduleSlot === slot
                      ? "bg-teal-950/70 border-teal-600 text-white font-medium"
                      : "bg-[#101216] border-[#22252C] text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {slot}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232630]">
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRescheduleConfirm}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {isUploadModalOpen && selectedDocReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-[#16181F] border border-[#272B38] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              Upload {selectedDocReq.documentType}
            </h3>
            <p className="text-xs text-slate-400">
              Files are securely stored in HIPAA/clinical grade Cloudflare R2 private bucket.
            </p>

            {uploadSuccess ? (
              <div className="py-6 text-center text-emerald-400 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span>Document uploaded and attached to patient profile!</span>
              </div>
            ) : (
              <form onSubmit={handleUploadFileSubmit} className="space-y-3">
                <div className="p-4 rounded-xl border border-dashed border-slate-600 bg-[#101216] text-center space-y-2">
                  <Upload className="w-6 h-6 text-teal-400 mx-auto" />
                  <span className="text-xs text-slate-300 font-medium block">
                    {simulatedFileName}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Simulated PDF report ready for upload (2.4 MB)
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232630]">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLOATING CARE CONCIERGE CHATBOT WIDGET */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-[#16181F] border border-[#272B38] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="p-4 bg-[#14161B] border-b border-[#232630] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white block leading-tight">
                  {activeTenant.name} Care Concierge
                </span>
                <span className="text-[10px] text-slate-400">
                  Clinical AI triage &bull; Strictly non-diagnostic
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>
          </div>

          {/* Messages body */}
          <div className="p-4 space-y-3 h-80 overflow-y-auto text-xs">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.sender === "USER"
                    ? "ml-auto bg-teal-800 text-white rounded-br-xs"
                    : m.isEmergency
                    ? "mr-auto bg-rose-950/80 border border-rose-800 text-rose-200 rounded-bl-xs"
                    : "mr-auto bg-[#101216] border border-[#22252C] text-slate-200 rounded-bl-xs"
                }`}
              >
                <p>{m.text}</p>
                <span className="text-[9px] opacity-60 block mt-1 text-right font-mono">
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChatMessage} className="p-3 border-t border-[#232630] bg-[#14161B] flex gap-2">
            <input
              type="text"
              placeholder="Ask about slots, exercises, directions..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-[#101216] border border-[#22252C] text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
