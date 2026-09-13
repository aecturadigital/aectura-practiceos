"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  FileText,
  AlertCircle,
  Eye,
  Lock,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Form, FormSubmission } from "@/types";

export default function PatientPortalFormsPage() {
  const { activeTenant } = useTenant();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  // Connected patient
  const contacts = mockStore.getContacts(activeTenant.id);
  const patient = contacts[0] || { id: "cnt-1", fullName: "Priya Sharma" };

  const loadSubmissions = () => {
    const list = mockStore.getFormSubmissions(activeTenant.id, undefined, patient.id);
    setSubmissions(list);
  };

  useEffect(() => {
    loadSubmissions();
    const unsubscribe = mockStore.subscribe(loadSubmissions);
    return () => unsubscribe();
  }, [activeTenant.id, patient.id]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Health Disclosures &amp; Consent Records</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Clinical Intake &amp; Consent Forms
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl">
          Review your completed pre-consultation questionnaires, medical history disclosures, and signed privacy agreements. These records form part of your encrypted clinical record.
        </p>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Submitted Documentation</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1F232B] text-teal-400 border border-[#2C313D]">
            {submissions.length} Records
          </span>
        </h2>

        {submissions.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#14161B] border border-[#232630] text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-200">No submitted questionnaires</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You do not have any pending or submitted clinical questionnaires on file.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-[#14161B] border border-[#232630] hover:border-slate-700 transition-all rounded-3xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Signed &amp; Filed
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{sub.formTitle}</h3>
                    <p className="text-xs text-slate-400">
                      Filed under patient identifier: <span className="font-mono text-slate-300">{sub.contactName}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-4 py-2 rounded-xl bg-[#1C1F28] hover:bg-[#252A36] text-slate-200 text-xs font-semibold border border-[#2A2E3B] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-400" />
                    <span>View Answers</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-5 rounded-3xl bg-[#14161B] border border-[#232630] flex items-start gap-3 text-xs text-slate-400">
        <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          All clinical questionnaire responses are safeguarded under physician-patient confidentiality privilege. If you need to update any clinical medical history or emergency contact information, notify your practitioner at your next consultation.
        </p>
      </div>

      {/* Answers Drawer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                  Submission Details
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedSubmission.formTitle}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Answer items */}
            <div className="space-y-4 text-xs">
              {Object.entries(selectedSubmission.answers).map(([key, val]) => (
                <div key={key} className="p-4 rounded-2xl bg-[#101216] border border-[#232630] space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <div className="text-sm font-semibold text-slate-200">
                    {typeof val === "boolean" ? (
                      val ? (
                        <span className="text-teal-400 flex items-center gap-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed &amp; Acknowledged
                        </span>
                      ) : (
                        "No"
                      )
                    ) : (
                      String(val)
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
