"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Contact, ContactStatus } from "@/types";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";

export default function ContactsPage() {
  const router = useRouter();
  const { activeTenant, vertical, hasAccess } = useTenant();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [practitionerFilter, setPractitionerFilter] = useState<string>("ALL");

  // Quick Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPractitionerId, setNewPractitionerId] = useState(activeTenant.team?.[0]?.id || "");

  if (!hasAccess("contacts")) {
    return <UpgradeBanner feature="contacts" />;
  }

  const contacts = mockStore.getContacts(activeTenant.id);
  const appointments = mockStore.getAppointments(activeTenant.id);

  const filtered = contacts.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (practitionerFilter !== "ALL" && c.assignedPractitionerId !== practitionerFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case "LEAD":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
            Lead
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Inactive
          </span>
        );
      case "DISCHARGED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Discharged
          </span>
        );
      default:
        return null;
    }
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim()) return;

    const fullName = `${newFirstName.trim()} ${newLastName.trim()}`.trim();
    const newContact = mockStore.createContact({
      id: `cnt-${Date.now()}`,
      tenantId: activeTenant.id,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      fullName,
      phone: newPhone.trim() || "+91 98000 00000",
      email: newEmail.trim() || `${newFirstName.toLowerCase()}@example.com`,
      status: "ACTIVE",
      assignedPractitionerId: newPractitionerId,
      tags: ["Direct Registration"],
      notesCount: 0,
      lastContactedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      city: activeTenant.city,
    });

    setIsAddOpen(false);
    setNewFirstName("");
    setNewLastName("");
    setNewPhone("");
    setNewEmail("");
    router.push(`/app/contacts/${newContact.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              {vertical.terminology.contactPlural}
            </h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {filtered.length} of {contacts.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of clinical records, appointments, and care relationships
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New {vertical.terminology.contactSingular}</span>
        </button>
      </div>

      {/* Prominent Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${vertical.terminology.contactPlural.toLowerCase()} by name, phone, or email...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-teal-600 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Lead</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DISCHARGED">Discharged</option>
          </select>

          <select
            value={practitionerFilter}
            onChange={(e) => setPractitionerFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Practitioners</option>
            {activeTenant.team?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compact Clinical Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">{vertical.terminology.contactSingular}</th>
                <th className="py-2.5 px-4">Phone</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Assigned Practitioner</th>
                <th className="py-2.5 px-4">Next Appointment</th>
                <th className="py-2.5 px-4">Last Contact</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No {vertical.terminology.contactPlural.toLowerCase()} found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => {
                  const practitioner = activeTenant.team?.find(
                    (p) => p.id === contact.assignedPractitionerId
                  );
                  const nextAppt = appointments.find(
                    (a) => a.contactId === contact.id && (a.status === "CONFIRMED" || a.status === "REQUESTED")
                  );
                  const lastContactFormatted = contact.lastContactedAt
                    ? new Date(contact.lastContactedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => router.push(`/app/contacts/${contact.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-medium text-slate-700 text-xs shrink-0">
                            {contact.firstName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors block">
                              {contact.fullName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {contact.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {contact.phone}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(contact.status)}
                      </td>

                      {/* Assigned Practitioner */}
                      <td className="py-3 px-4 text-slate-700">
                        {practitioner?.name || "Unassigned"}
                      </td>

                      {/* Next Appointment */}
                      <td className="py-3 px-4 text-slate-700">
                        {nextAppt ? (
                          <div className="flex items-center gap-1.5 font-medium text-teal-700">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {nextAppt.date}, {nextAppt.startTime}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None scheduled</span>
                        )}
                      </td>

                      {/* Last Contact */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {lastContactFormatted}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 inline-block transition-colors" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Contact Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  New {vertical.terminology.contactSingular}
                </h3>
                <p className="text-xs text-slate-500">Create client profile in the directory</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98261 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Practitioner
                </label>
                <select
                  value={newPractitionerId}
                  onChange={(e) => setNewPractitionerId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  {activeTenant.team?.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Create &amp; Open Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
