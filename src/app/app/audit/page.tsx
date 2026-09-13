"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, Filter } from "lucide-react";
import { useTenant } from "@/context/tenant-context";

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  resource: string;
  ip: string;
}

const AUDIT_LOGS: AuditEntry[] = [
  { id: "aud-1", action: "PATIENT_RECORD_VIEW", actor: "Dr. Clinician", timestamp: "2026-09-13 10:14:02", resource: "Patient #cnt-01", ip: "103.182.65.1" },
  { id: "aud-2", action: "APPOINTMENT_RESCHEDULE", actor: "Reception Desk", timestamp: "2026-09-13 09:42:15", resource: "Booking #apt-02", ip: "103.182.65.1" },
  { id: "aud-3", action: "INTAKE_FORM_VERIFIED", actor: "Reception Desk", timestamp: "2026-09-12 16:30:11", resource: "Form #frm-01", ip: "103.182.65.1" },
  { id: "aud-4", action: "PRESCRIPTION_LOGGED", actor: "Dr. Clinician", timestamp: "2026-09-12 11:20:44", resource: "Exercise Plan", ip: "103.182.65.1" },
  { id: "aud-5", action: "LOGIN_SUCCESS", actor: "Dr. Clinician", timestamp: "2026-09-12 08:55:01", resource: "Staff Portal", ip: "103.182.65.1" },
];

export default function StaffAuditPage() {
  const [search, setSearch] = useState("");

  const filtered = AUDIT_LOGS.filter((a) =>
    a.action.toLowerCase().includes(search.toLowerCase()) ||
    a.actor.toLowerCase().includes(search.toLowerCase()) ||
    a.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Audit Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable clinical access trail, authentication events, and data modifications
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-4">Event Action</th>
              <th className="py-2.5 px-4">Actor</th>
              <th className="py-2.5 px-4">Resource</th>
              <th className="py-2.5 px-4">Timestamp</th>
              <th className="py-2.5 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-900 text-[11px]">{log.action}</td>
                <td className="py-3 px-4 text-slate-700">{log.actor}</td>
                <td className="py-3 px-4 text-slate-600">{log.resource}</td>
                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
