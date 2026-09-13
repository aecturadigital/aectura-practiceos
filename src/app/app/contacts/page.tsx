"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  LayoutGrid,
  List,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Tag,
  ChevronRight,
  AlertCircle,
  Clock,
  Sparkles,
  HeartPulse,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Contact, ContactStatus } from "@/types";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";

export default function ContactsPage() {
  const { activeTenant, vertical, hasAccess } = useTenant();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [practitionerFilter, setPractitionerFilter] = useState<string>("ALL");

  if (!hasAccess("contacts")) {
    return <UpgradeBanner feature="contacts" />;
  }

  const contacts = mockStore.getContacts(activeTenant.id);

  const filtered = contacts.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (practitionerFilter !== "ALL" && c.assignedPractitionerId !== practitionerFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.chiefComplaint && c.chiefComplaint.toLowerCase().includes(q)) ||
        (c.presentingConcerns && c.presentingConcerns.some((p) => p.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            ACTIVE
          </span>
        );
      case "LEAD":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800">
            LEAD
          </span>
        );
      case "INACTIVE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            INACTIVE
          </span>
        );
      case "DISCHARGED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
            DISCHARGED
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {vertical.terminology.contactPlural} Directory
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1C2028] text-teal-400 border border-[#2B2F3C]">
              {contacts.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Unified 360° clinical profiles, contact histories, intake data, and scheduled sessions.
          </p>
        </div>

        <Link
          href={`/app/contacts/${contacts[0]?.id || "new"}`}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>New {vertical.terminology.contactSingular}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${vertical.terminology.contactPlural.toLowerCase()} by name, phone, condition...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by contact status"
            className="bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Care</option>
            <option value="LEAD">New Leads</option>
            <option value="DISCHARGED">Discharged</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={practitionerFilter}
            onChange={(e) => setPractitionerFilter(e.target.value)}
            aria-label="Filter by assigned practitioner"
            className="bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Practitioners</option>
            {activeTenant.team?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Toggle View */}
          <div className="flex items-center border border-[#2B2F3B] rounded-xl p-0.5 bg-[#111315]">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table" ? "bg-teal-950 text-teal-400" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid" ? "bg-teal-950 text-teal-400" : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {viewMode === "table" ? (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#13151A] border-b border-[#242833] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{vertical.terminology.contactSingular} Profile</th>
                  <th className="py-3 px-4">{vertical.terminology.chiefConcernLabel}</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Next Appointment</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22252C] text-slate-300">
                {filtered.map((c) => {
                  const concern =
                    c.chiefComplaint ||
                    (c.presentingConcerns && c.presentingConcerns.join(", ")) ||
                    "General Consultation";

                  return (
                    <tr key={c.id} className="hover:bg-[#1A1D24] transition-colors group">
                      <td className="py-3.5 px-4">
                        <Link href={`/app/contacts/${c.id}`} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs shrink-0 overflow-hidden">
                            {c.avatarUrl ? (
                              <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover" />
                            ) : (
                              c.firstName.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                              {c.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400">{c.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                        {concern}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {c.phone}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-teal-400">
                        {c.nextAppointmentDate || "None scheduled"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags?.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] border border-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/app/contacts/${c.id}`}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#20242E] hover:bg-teal-900/40 text-slate-200 hover:text-teal-300 border border-[#2B303D] transition-colors inline-flex items-center gap-1"
                        >
                          <span>360° Card</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => {
            const concern =
              c.chiefComplaint ||
              (c.presentingConcerns && c.presentingConcerns.join(", ")) ||
              "General Consultation";

            return (
              <div
                key={c.id}
                className="bg-[#16181D] border border-[#242833] rounded-2xl p-5 hover:border-[#2F3543] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-sm overflow-hidden">
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover" />
                        ) : (
                          c.firstName.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{c.fullName}</h3>
                        <p className="text-[11px] text-slate-400">{c.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  <p className="text-xs text-slate-300 my-2 line-clamp-2 bg-[#121417] p-2 rounded-xl border border-[#22252C]">
                    <span className="text-slate-500 font-medium">Concern:</span> {concern}
                  </p>

                  <div className="space-y-1 text-xs text-slate-400 mt-3 pt-3 border-t border-[#242833]">
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="text-slate-200 font-mono">{c.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Session:</span>
                      <span className="text-teal-400 font-mono">
                        {c.nextAppointmentDate || "Not scheduled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#242833] mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {c.totalSessionsCompleted || 0} sessions completed
                  </span>
                  <Link
                    href={`/app/contacts/${c.id}`}
                    className="text-teal-400 font-semibold text-xs hover:text-teal-300 flex items-center gap-1"
                  >
                    <span>View Card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
