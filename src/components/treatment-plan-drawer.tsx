"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileText,
  DollarSign,
  TrendingUp,
  History,
  Activity,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Receipt,
  UserCheck,
} from "lucide-react";
import {
  PlanCycle,
  TreatmentCourse,
  TreatmentSession,
  ProcedureAddOn,
  PlanAdjustment,
  LedgerTransaction,
  PatientTracker,
  TrackerEntry,
  DocumentRequest,
} from "@/types";
import { mockStore } from "@/lib/mock/store";

interface TreatmentPlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: PlanCycle;
  course?: TreatmentCourse;
  contactName: string;
  contactId: string;
  onPlanUpdated?: () => void;
}

export function TreatmentPlanDrawer({
  isOpen,
  onClose,
  cycle,
  course,
  contactName,
  contactId,
  onPlanUpdated,
}: TreatmentPlanDrawerProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "sessions" | "charges" | "payments" | "progress" | "documents" | "history"
  >("overview");

  // Modal Sub-States
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(5);
  const [extendSessions, setExtendSessions] = useState(0);
  const [extendReason, setExtendReason] = useState("Continued physical rehabilitation recommended by practitioner.");

  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezeDays, setFreezeDays] = useState(7);
  const [freezeReason, setFreezeReason] = useState("Patient illness / clinical hiatus");

  const [isActivateCycleConfirm, setIsActivateCycleConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const sessions = mockStore.getTreatmentSessions(cycle.id);
  const adjustments = mockStore.getPlanAdjustments(cycle.id);
  const addOns = mockStore.getProcedureAddOns(contactId);
  const ledger = mockStore.getPatientLedger(cycle.tenantId, contactId);
  const trackers = mockStore.getPatientTrackers(cycle.tenantId, contactId);
  const trackerEntries = mockStore.getTrackerEntries(cycle.tenantId, contactId);
  const docRequests = mockStore.getDocumentRequests(cycle.tenantId, contactId);
  const allCycles = course ? mockStore.getPlanCycles(course.id) : [cycle];

  const handleExtendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.extendPlan(cycle.id, extendDays, extendSessions, extendReason, "Dr. Rajesh Kulkarni");
    setIsExtendModalOpen(false);
    showToast(`Plan extended successfully (+${extendDays} days, +${extendSessions} sessions).`);
    onPlanUpdated?.();
  };

  const handleFreezeToggle = (e: React.FormEvent) => {
    e.preventDefault();
    if (cycle.status === "FROZEN") {
      mockStore.unfreezePlan(cycle.id, "Hiatus concluded", "Dr. Rajesh Kulkarni");
      showToast("Plan unfrozen. Treatment resumed.");
    } else {
      mockStore.freezePlan(cycle.id, freezeDays, freezeReason, "Dr. Rajesh Kulkarni");
      setIsFreezeModalOpen(false);
      showToast(`Plan frozen for ${freezeDays} days.`);
    }
    onPlanUpdated?.();
  };

  const handleActivateNextCycle = () => {
    if (!course) return;
    const next = mockStore.activateNextCycle(course.id, "Dr. Rajesh Kulkarni");
    if (next) {
      showToast(`Cycle ${next.cycleNumber} activated successfully.`);
      setIsActivateCycleConfirm(false);
      onPlanUpdated?.();
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const progressPercent = Math.min(100, Math.round((cycle.completedSessions / cycle.plannedSessions) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {cycle.billingType.replace("_", " ")}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                Status: {cycle.status}
              </span>
              {cycle.isFrozen && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                  Frozen
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              {cycle.name}
            </h2>
            <p className="text-xs text-slate-500">
              Prescribed for <strong className="text-slate-800 font-medium">{contactName}</strong> by{" "}
              {cycle.assignedPractitionerName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {toastMessage && (
          <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 px-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 8 Detail Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 px-5 bg-white text-xs font-medium overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "schedule", label: "Schedule" },
            { id: "sessions", label: `Sessions (${sessions.length})` },
            { id: "charges", label: `Charges` },
            { id: "payments", label: `Payments` },
            { id: "progress", label: "Progress" },
            { id: "documents", label: `Documents (${docRequests.length})` },
            { id: "history", label: `History (${adjustments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-teal-600 text-teal-800 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Prescribed Session Fulfillment</span>
                  <span className="font-mono text-slate-600 font-semibold">
                    {cycle.completedSessions} / {cycle.plannedSessions} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{cycle.plannedSessions - cycle.completedSessions} sessions remaining</span>
                  <span>Frequency: {cycle.sessionFrequency.replace("_", " ")}</span>
                </div>
              </div>

              {/* Treatment Course Multi-Cycle Roadmap */}
              {course && (
                <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Overall Treatment Course
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900">{course.title}</h4>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      Month {course.currentCycleNumber} of {course.totalCycles}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {allCycles.map((c) => (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-md border text-center space-y-1 ${
                          c.id === cycle.id
                            ? "bg-teal-50/70 border-teal-300"
                            : c.status === "COMPLETED"
                            ? "bg-slate-50 border-slate-200 text-slate-500"
                            : "bg-white border-dashed border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="text-[10px] font-mono block font-semibold">
                          Cycle {c.cycleNumber}
                        </span>
                        <p className="text-[11px] font-medium text-slate-800 truncate">{c.name}</p>
                        <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-white text-slate-600 border border-slate-200 inline-block">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {allCycles.some((c) => c.status === "SCHEDULED") && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setIsActivateCycleConfirm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded text-xs font-medium transition-colors shadow-sm"
                      >
                        <span>Activate Next Cycle</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Plan Specs Grid */}
              <div className="grid grid-cols-2 gap-3 bg-white border border-slate-200 rounded-lg p-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">Package Price</span>
                  <span className="text-base font-semibold text-slate-900 font-mono">
                    ₹{cycle.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Validity Period</span>
                  <span className="text-slate-800 font-medium">
                    {cycle.startDate} &rarr; {cycle.expectedEndDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Grace Period</span>
                  <span className="text-slate-800 font-medium">{cycle.gracePeriodDays} days after expiry</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Rollover Policy</span>
                  <span className="text-slate-800 font-medium">{cycle.rolloverPolicy.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">No-Show Policy</span>
                  <span className="text-slate-800 font-medium">{cycle.noShowPolicy.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Clinical Prescriber</span>
                  <span className="text-slate-800 font-medium">{cycle.assignedPractitionerName}</span>
                </div>
              </div>

              {/* Action Buttons for Plan Adjustment */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setIsExtendModalOpen(true)}
                  className="flex-1 py-2 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Extend Plan</span>
                </button>

                <button
                  onClick={() => {
                    if (cycle.status === "FROZEN") {
                      handleFreezeToggle({ preventDefault: () => {} } as any);
                    } else {
                      setIsFreezeModalOpen(true);
                    }
                  }}
                  className={`flex-1 py-2 px-3 rounded-md border font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
                    cycle.status === "FROZEN"
                      ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {cycle.status === "FROZEN" ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-amber-700" />
                      <span>Resume / Unfreeze</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-slate-500" />
                      <span>Freeze Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-slate-800">Recurrence Pattern</span>
                <p className="text-slate-600">
                  {cycle.sessionFrequency === "DAILY"
                    ? "Patient attends clinical sessions daily Monday through Saturday."
                    : `Sessions planned at ${cycle.sessionFrequency.replace("_", " ")} cadence.`}
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden bg-white">
                <div className="p-3 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Planned Schedule Window
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-900 block">Cycle Start Date</span>
                    <span className="text-slate-500">{cycle.startDate}</span>
                  </div>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-900 block">Expected End Date</span>
                    <span className="text-slate-500">{cycle.expectedEndDate}</span>
                  </div>
                  <span className="font-mono text-slate-500">
                    {cycle.gracePeriodDays} Days Grace
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SESSIONS */}
          {activeTab === "sessions" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-slate-800">Visit Attendance Records</span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Total Logged: {sessions.length}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-3 space-y-1 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-900">
                          #{sess.sessionNumber}
                        </span>
                        <span className="font-medium text-slate-800">{sess.serviceName}</span>
                      </div>
                      <span
                        className={`font-mono text-[10px] uppercase px-1.5 py-0.2 rounded border ${
                          sess.status === "ATTENDED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : sess.status === "CONFIRMED"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {sess.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {sess.date} &bull; {sess.startTime} – {sess.endTime}
                      </span>
                      <span>Deducted: {sess.sessionDeducted ? "Yes" : "No"}</span>
                    </div>

                    {sess.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                        {sess.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHARGES */}
          {activeTab === "charges" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Ledger Debits &amp; Invoiced Packages</span>
                <span className="font-mono text-slate-900 font-semibold">
                  Total: ₹{ledger.totalCharges.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">
                {ledger.transactions
                  .filter((t) => t.type === "CHARGE" || t.type === "PACKAGE_SALE" || t.type === "ADD_ON_SERVICE")
                  .map((t) => (
                    <div key={t.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-900 block">{t.description}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {t.date} &bull; {t.category}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">
                        ₹{t.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Add-ons if any */}
              {addOns.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-slate-800 block">Procedure Add-Ons</span>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                    {addOns.map((add) => (
                      <div key={add.id} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{add.procedureName}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                add.paymentStatus === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {add.paymentStatus}
                            </span>
                          </div>
                          {add.notes && <p className="text-[11px] text-slate-500 mt-0.5">{add.notes}</p>}
                        </div>
                        <span className="font-mono font-semibold text-slate-900">
                          ₹{add.finalAmount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Credits &amp; Settlement History</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  Total Paid: ₹{ledger.totalPayments.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-teal-950 block">Outstanding Balance</span>
                  <span className="text-[11px] text-teal-800">Pending against plan and add-ons</span>
                </div>
                <span className="text-lg font-mono font-bold text-teal-900">
                  ₹{ledger.netOutstanding.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">
                {ledger.transactions
                  .filter((t) => t.type === "PAYMENT")
                  .map((t) => (
                    <div key={t.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{t.description}</span>
                          {t.method && (
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                              {t.method}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {t.date} &bull; Ref: {t.referenceNumber || "Direct"} &bull; {t.receivedBy}
                        </p>
                      </div>
                      <span className="font-mono font-semibold text-emerald-700">
                        +₹{t.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: PROGRESS */}
          {activeTab === "progress" && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-semibold text-slate-800">Clinical Recovery Trajectory</span>
                <p className="text-slate-600">
                  Daily pain score tracked through clinical evaluations and patient self-assessment.
                </p>
              </div>

              {/* Trackers List */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-800 block">Pain Score Log (0 to 10)</span>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                  {trackerEntries.map((e) => (
                    <div key={e.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-900 font-mono">{e.date}</span>
                        {e.notes && <p className="text-[11px] text-slate-500 mt-0.5">{e.notes}</p>}
                      </div>
                      <span className="font-mono font-bold text-teal-800 text-sm bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {String(e.value)} / 10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Required Clinical Documents</span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {docRequests.length} Document Requests
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">
                {docRequests.map((doc) => (
                  <div key={doc.id} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span className="font-medium text-slate-900">{doc.documentType} Report</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          doc.status === "REVIEWED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : doc.status === "UPLOADED"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">{doc.notes}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                      <span>Requested by: {doc.requestedBy}</span>
                      <span>Due: {doc.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: HISTORY (PLAN ADJUSTMENTS) */}
          {activeTab === "history" && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800 block">Immutable Plan Adjustment Log</span>
                <p className="text-slate-600 mt-0.5">
                  Every modification to price, sessions, dates, or freeze status is cryptographically logged.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">
                {adjustments.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">No adjustments made to this plan cycle.</div>
                ) : (
                  adjustments.map((adj) => (
                    <div key={adj.id} className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-900 uppercase text-[10px] font-mono">
                            {adj.adjustmentType}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {adj.timestamp.replace("T", " ").slice(0, 16)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-500 line-through">{String(adj.oldValue)}</span>
                        <ArrowRight className="w-3 h-3 text-teal-600" />
                        <span className="text-slate-900 font-semibold">{String(adj.newValue)}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        Reason: {adj.reason}
                      </p>
                      <span className="text-[10px] text-slate-400 block pt-0.5">
                        Changed by: {adj.changedBy}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            ID: {cycle.id} &bull; Tenant: {cycle.tenantId}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

        {/* MODAL: Extend Plan */}
        {isExtendModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-md w-full shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Extend Treatment Plan</h3>
                <button onClick={() => setIsExtendModalOpen(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleExtendSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Additional Days</label>
                  <input
                    type="number"
                    min={0}
                    value={extendDays}
                    onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Additional Sessions (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={extendSessions}
                    onChange={(e) => setExtendSessions(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mandatory Clinical Reason</label>
                  <textarea
                    required
                    rows={2}
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                    placeholder="e.g. Continued rehabilitation recommended for neural glide restoration."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsExtendModalOpen(false)}
                    className="px-3 py-1.5 rounded border border-slate-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium"
                  >
                    Save Extension
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Freeze Plan */}
        {isFreezeModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-md w-full shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Freeze Treatment Plan</h3>
                <button onClick={() => setIsFreezeModalOpen(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleFreezeToggle} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Freeze Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={freezeDays}
                    onChange={(e) => setFreezeDays(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Reason for Hiatus</label>
                  <select
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="Travel / Out of town">Travel / Out of town</option>
                    <option value="Illness / Hospitalisation">Illness / Hospitalisation</option>
                    <option value="Clinic Closure / Holiday">Clinic Closure / Holiday</option>
                    <option value="Practitioner Recommendation">Practitioner Recommendation</option>
                    <option value="Other">Other Clinical Reason</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFreezeModalOpen(false)}
                    className="px-3 py-1.5 rounded border border-slate-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium"
                  >
                    Confirm Freeze
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONFIRM: Activate Next Cycle */}
        {isActivateCycleConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-md w-full shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Activate Next Treatment Cycle?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This will promote the next scheduled cycle in this treatment course to <strong>ACTIVE</strong>,
                set its start date to today, and generate the corresponding ledger charge on the patient account.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsActivateCycleConfirm(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivateNextCycle}
                  className="px-3.5 py-1.5 rounded bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium"
                >
                  Confirm Activation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
