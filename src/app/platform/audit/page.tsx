"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, Filter, Clock, User, FileText, ArrowUpDown } from "lucide-react";
import { mockStore } from "@/lib/mock/store";

export default function PlatformAuditLogPage() {
  const [logs] = useState(() => mockStore.getAuditLogs());
  const [search, setSearch] = useState("");

  const filtered = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Audit Log</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable trace of administrative events, plan mutations, tenant provisioning, and access records.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit events by action, user, or entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Audit Table */}
      <div className="bg-[#16181D] border border-[#242833] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#13151A] border-b border-[#242833] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User / Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Target</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22252C] text-slate-300">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#1A1D24] transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{log.user}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200">{log.entity}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{log.details}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
