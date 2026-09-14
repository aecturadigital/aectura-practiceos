"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Send,
  SlidersHorizontal,
  CreditCard,
  AlertCircle,
  Sparkles,
  MessageSquare,
  FileCheck,
  UserCheck,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import {
  PlanCycle,
  TreatmentCourse,
  ProcedureAddOn,
  PaymentMethod,
  AddOnPaymentOption,
} from "@/types";
import { mockStore } from "@/lib/mock/store";
import { TreatmentPlanDrawer } from "./treatment-plan-drawer";

interface TreatmentPlanCardProps {
  cycle: PlanCycle;
  course?: TreatmentCourse;
  contactName: string;
  contactId: string;
  nextAppointmentText?: string;
  onUpdate?: () => void;
}

export function TreatmentPlanCard({
  cycle,
  course,
  contactName,
  contactId,
  nextAppointmentText = "Tomorrow · 10:30 AM",
  onUpdate,
}: TreatmentPlanCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals for flagship actions
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<"ATTENDED" | "NO_SHOW" | "CLINIC_CANCELLED">("ATTENDED");
  const [consumeSession, setConsumeSession] = useState(true);
  const [attendanceNotes, setAttendanceNotes] = useState("");

  const [isAddProcedureOpen, setIsAddProcedureOpen] = useState(false);
  const [procedureName, setProcedureName] = useState("Dry Needling");
  const [procedurePrice, setProcedurePrice] = useState("800");
  const [procedureNotes, setProcedureNotes] = useState("L4-L5 left quadratus lumborum trigger point release");
  const [addOnPaymentOption, setAddOnPaymentOption] = useState<AddOnPaymentOption>("ADD_TO_BALANCE");

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("500");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [paymentRef, setPaymentRef] = useState(`UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  const [paymentMemo, setPaymentMemo] = useState("Instalment payment against rehabilitation plan.");

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState(
    `Hello ${contactName.split(" ")[0]}, this is a reminder from MotionPlus Physiotherapy regarding ₹5,000 pending against your current treatment plan.\n\nYou may make the payment before your upcoming session.\n\nIf you have already paid, please ignore this message.\n\nThank you.`
  );
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const ledger = mockStore.getPatientLedger(cycle.tenantId, contactId);
  const addOns = mockStore.getProcedureAddOns(contactId);
  const unpaidAddOn = addOns.find((a) => a.paymentStatus === "UNPAID");

  const completed = cycle.completedSessions;
  const total = cycle.plannedSessions;
  const remaining = Math.max(0, total - completed);
  const percent = Math.min(100, Math.round((completed / total) * 100));

  // Plan payments vs total payments
  const totalPaid = ledger.totalPayments;
  const totalDue = ledger.netOutstanding;

  const handleMarkAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // find upcoming or new session
    const sessions = mockStore.getTreatmentSessions(cycle.id);
    const targetSession = sessions.find((s) => s.status === "CONFIRMED" || s.status === "SCHEDULED") || sessions[0];
    if (targetSession) {
      mockStore.recordSessionAttendance(
        targetSession.id,
        attendanceStatus,
        attendanceStatus === "ATTENDED" ? consumeSession : false,
        cycle.assignedPractitionerName,
        attendanceNotes
      );
    } else {
      // create a session and mark attended
      const newSessionId = `sess-${Date.now()}`;
      mockStore.recordSessionAttendance(
        newSessionId,
        attendanceStatus,
        attendanceStatus === "ATTENDED" ? consumeSession : false,
        cycle.assignedPractitionerName,
        attendanceNotes
      );
    }

    setIsAttendanceModalOpen(false);
    showToast(`Session attendance marked as ${attendanceStatus}.`);
    onUpdate?.();
  };

  const handleAddProcedureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(procedurePrice) || 800;
    mockStore.addProcedureAddOn(
      {
        tenantId: cycle.tenantId,
        contactId,
        planCycleId: cycle.id,
        procedureName,
        price: priceNum,
        quantity: 1,
        notes: procedureNotes,
        includedInPlan: false,
        waived: addOnPaymentOption === "WAIVE",
        discount: 0,
        finalAmount: addOnPaymentOption === "WAIVE" ? 0 : priceNum,
        paymentStatus: addOnPaymentOption === "MARK_PAID" || addOnPaymentOption === "CHARGE_NOW" ? "PAID" : "UNPAID",
      },
      addOnPaymentOption
    );

    setIsAddProcedureOpen(false);
    showToast(`Procedure "${procedureName}" added (${addOnPaymentOption.replace(/_/g, " ")}).`);
    onUpdate?.();
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(paymentAmount) || 0;
    if (amt <= 0) return;

    mockStore.recordLedgerPayment(
      cycle.tenantId,
      contactId,
      amt,
      paymentMethod,
      paymentRef,
      paymentMemo,
      "Roshni Patel"
    );

    setIsRecordPaymentOpen(false);
    showToast(`Payment of ₹${amt.toLocaleString("en-IN")} recorded via ${paymentMethod}.`);
    onUpdate?.();
  };

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.sendPaymentReminder(
      cycle.tenantId,
      contactId,
      totalDue || 5000,
      "WHATSAPP",
      reminderMessage,
      "Clinic Desk"
    );
    setIsReminderModalOpen(false);
    showToast(`Payment reminder dispatched to ${contactName} via WhatsApp.`);
    onUpdate?.();
  };

  const showToast = (msg: string) => {
    setReminderToast(msg);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="bg-white border-2 border-teal-600/30 rounded-lg p-5 shadow-xs space-y-4 relative overflow-hidden">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600" />

      {reminderToast && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Flagship Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              ACTIVE TREATMENT PLAN
            </span>
            <span className="text-xs font-mono text-slate-500">
              {cycle.startDate} – {cycle.expectedEndDate}
            </span>
            {cycle.isFrozen && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                FROZEN
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            {cycle.name}
          </h3>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-slate-400 block font-medium">Plan Package Value</span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
            ₹{cycle.price.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Sessions Progress Bar & Counters */}
      <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-md border border-slate-200/80">
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span className="text-slate-900 font-semibold">
              {completed} / {total} sessions completed
            </span>
          </div>
          <span className="font-mono text-slate-600 font-semibold">
            {remaining} sessions remaining
          </span>
        </div>

        {/* High-density progress bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0D9488] h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
          <span>{percent}% Completed</span>
          <span>Next visit: <strong className="text-slate-700 font-semibold">{nextAppointmentText}</strong></span>
        </div>
      </div>

      {/* Financial Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-md bg-white border border-slate-200">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
            Received
          </span>
          <span className="text-sm font-bold text-emerald-700 font-mono">
            ₹{totalPaid.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-2.5 rounded-md bg-white border border-slate-200">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
            Outstanding Due
          </span>
          <span className="text-sm font-bold text-rose-700 font-mono">
            ₹{totalDue.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-md bg-white border border-slate-200">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
            Prescribed By
          </span>
          <span className="text-xs font-semibold text-slate-800 truncate block">
            {cycle.assignedPractitionerName}
          </span>
        </div>
      </div>

      {unpaidAddOn && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              Unpaid Add-On: <strong>{unpaidAddOn.procedureName}</strong> (₹{unpaidAddOn.finalAmount})
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white text-amber-800 border border-amber-300 font-semibold">
            Unpaid Charge
          </span>
        </div>
      )}

      {/* 5 Flagship Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        <button
          onClick={() => setIsAttendanceModalOpen(true)}
          className="py-2 px-2 rounded-md bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-1 text-center"
        >
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Mark Attendance</span>
        </button>

        <button
          onClick={() => setIsAddProcedureOpen(true)}
          className="py-2 px-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1 text-center"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">+ Add Procedure</span>
        </button>

        <button
          onClick={() => setIsRecordPaymentOpen(true)}
          className="py-2 px-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1 text-center"
        >
          <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">Record Payment</span>
        </button>

        <button
          onClick={() => setIsReminderModalOpen(true)}
          className="py-2 px-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1 text-center"
        >
          <Send className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">Send Reminder</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="col-span-2 sm:col-span-1 py-2 px-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1 text-center"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Manage Plan</span>
        </button>
      </div>

      {/* FULL TREATMENT PLAN DRAWER */}
      <TreatmentPlanDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cycle={cycle}
        course={course}
        contactName={contactName}
        contactId={contactId}
        onPlanUpdated={() => onUpdate?.()}
      />

      {/* MODAL 1: Mark Attendance */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Record Session Attendance</h3>
              <button onClick={() => setIsAttendanceModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleMarkAttendanceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Attendance Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["ATTENDED", "NO_SHOW", "CLINIC_CANCELLED"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAttendanceStatus(st)}
                      className={`py-1.5 px-2 rounded border text-center font-medium transition-colors ${
                        attendanceStatus === st
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {attendanceStatus === "NO_SHOW" && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] leading-relaxed">
                  <strong>Clinic Policy:</strong> No-show recorded. Session deduction requires practitioner approval.
                </div>
              )}

              {attendanceStatus === "ATTENDED" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="deductCheck"
                    checked={consumeSession}
                    onChange={(e) => setConsumeSession(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <label htmlFor="deductCheck" className="text-slate-700 font-medium">
                    Consume 1 session from plan package ({completed + 1} of {total})
                  </label>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinical / Attendance Notes</label>
                <textarea
                  rows={2}
                  value={attendanceNotes}
                  onChange={(e) => setAttendanceNotes(e.target.value)}
                  placeholder="e.g. Lumbar decompression and multifidus activation tolerated with 0 pain."
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Procedure */}
      {isAddProcedureOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">+ Add Procedure (Session Add-On)</h3>
              <button onClick={() => setIsAddProcedureOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddProcedureSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Procedure / Service</label>
                <select
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Dry Needling">Dry Needling (₹800)</option>
                  <option value="Kinesiology Taping">Kinesiology Taping (₹400)</option>
                  <option value="Interferential Therapy (IFT)">Interferential Therapy - IFT (₹500)</option>
                  <option value="Manual Joint Mobilization">Manual Joint Mobilization (₹1,000)</option>
                  <option value="Special Rehabilitation Equipment">Special Equipment (₹600)</option>
                  <option value="Home Visit Charge">Home Visit Surcharge (₹1,200)</option>
                  <option value="Custom Procedure Charge">Custom Procedure Charge</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={procedurePrice}
                  onChange={(e) => setProcedurePrice(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Action</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["ADD_TO_BALANCE", "CHARGE_NOW", "MARK_PAID", "WAIVE"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAddOnPaymentOption(opt)}
                      className={`py-1.5 px-2 rounded border text-center font-medium transition-colors ${
                        addOnPaymentOption === opt
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {opt.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinical Notes / Procedure Target</label>
                <input
                  type="text"
                  value={procedureNotes}
                  onChange={(e) => setProcedureNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProcedureOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium"
                >
                  Confirm Add-On
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Record Payment */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Record Patient Payment</h3>
              <button onClick={() => setIsRecordPaymentOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
                <span className="text-slate-500">Current Outstanding:</span>
                <span className="font-mono font-bold text-rose-700">₹{totalDue.toLocaleString("en-IN")}</span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash (Front Desk)</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">NEFT / IMPS Bank Transfer</option>
                  <option value="Payment Link">Online Payment Link</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reference Number / Transaction ID</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Memo</label>
                <input
                  type="text"
                  value={paymentMemo}
                  onChange={(e) => setPaymentMemo(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium"
                >
                  Save Payment &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Send Payment Reminder */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-semibold text-slate-900">Human-Assisted Payment Reminder</h3>
              </div>
              <button onClick={() => setIsReminderModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              PracticeOS drafted this personalized message. Review or edit before sending via WhatsApp.
            </p>

            <form onSubmit={handleSendReminderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Editable Message</label>
                <textarea
                  rows={6}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded bg-white font-sans text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
