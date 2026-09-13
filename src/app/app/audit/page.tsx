"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Lock,
  Clock,
  User,
  Filter,
  Download,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { AuditLogEntry } from "@/types";

export default function StaffAuditLogPage() {
  const { activeTenant } = useTenant();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const loadData = () => {
    setLogs(mockStore.getAuditLogs(activeTenant.id));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = mockStore.subscribe(loadData);
    return () => unsubscribe();
  }, [activeTenant.id]);

  const filteredLogs = logs.filter((log) => {
    const matchAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchAction && matchSearch;
  });

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Regulatory &amp; Clinical Data Protection</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security &amp; Access Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident, immutable audit trail logging staff access to patient records, appointment changes, and security events.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#101216] px-4 py-2 rounded-xl border border-[#232630] text-xs font-mono text-emerald-400 self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5" />
          <span>Append-Only Storage</span>
        </div>
      </div>

      {/* Compliance Box */}
      <div className="p-5 rounded-3xl bg-[#14161B] border border-[#232630] flex items-start gap-3.5 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Every action involving patient health information (PHI)—including chart views, prescription notes, and intake questionnaire reviews—is cryptographically recorded with staff actor identity, timestamp, and IP address in accordance with clinical record retention guidelines.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Audit Events ({filteredLogs.length})
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full bg-[#12141A] border border-[#232630] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#14161B] border border-[#232630] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101217] text-[10px] uppercase font-mono text-slate-400 border-b border-[#232630]">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Staff User</th>
                <th className="px-6 py-3.5">Action Event</th>
                <th className="px-6 py-3.5">Target Entity</th>
                <th className="px-6 py-3.5">Details</th>
                <th className="px-6 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20232C]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#161822] transition-colors font-mono text-[11px]">
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-white font-semibold font-sans">
                    {log.user}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.action.includes("CREATE")
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : log.action.includes("UPDATE")
                          ? "bg-teal-950 text-teal-400 border border-teal-800"
                          : "bg-purple-950 text-purple-400 border border-purple-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-sans">{log.entity}</td>
                  <td className="px-6 py-4 text-slate-400 font-sans max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
