"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { StaffUser, StaffRole } from "@/types";

export default function StaffTeamPage() {
  const { activeTenant } = useTenant();
  const [team, setTeam] = useState<StaffUser[]>(activeTenant.team || []);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // New staff form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("PRACTITIONER");
  const [title, setTitle] = useState("");
  const [specialization, setSpecialization] = useState("");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newMember: StaffUser = {
      id: `staff-${Date.now()}`,
      tenantId: activeTenant.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || "+91 98765 00000",
      role,
      title: title.trim() || "Consultant",
      qualifications: "Certified Clinician",
      specialization: specialization.trim() || "General Practice",
      bio: "Healthcare professional.",
      avatarUrl: "",
      isActive: true,
    };

    const updatedTeam = [...team, newMember];
    setTeam(updatedTeam);
    mockStore.updateTenant(activeTenant.id, { team: updatedTeam });

    setIsInviteOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setTitle("");
    setSpecialization("");
  };

  const handleToggleStatus = (staffId: string) => {
    const updated = team.map((m) =>
      m.id === staffId ? { ...m, isActive: !m.isActive } : m
    );
    setTeam(updated);
    mockStore.updateTenant(activeTenant.id, { team: updated });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Team</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {team.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Practitioners, front-desk receptionists, and role-based permissions
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-3 shadow-none"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-900 leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{member.title}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    member.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {member.role}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 font-sans" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.phone}</span>
                </div>
              </div>

              {member.specialization && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  <strong className="text-slate-700">Specialization:</strong> {member.specialization}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {member.isActive ? "Active on Roster" : "Inactive"}
              </span>
              <button
                onClick={() => handleToggleStatus(member.id)}
                className="text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                {member.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-semibold text-slate-900">Add Team Member</h3>
              <button onClick={() => setIsInviteOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sneha Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="sneha@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    <option value="PRACTITIONER">Practitioner</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="ADMIN">Practice Admin</option>
                    <option value="BILLING">Billing Officer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Clinical Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Clinical Psychologist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Cognitive Behavioral Therapy, Trauma"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
