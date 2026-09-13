"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Award,
  Stethoscope,
  Trash2,
  UserCheck,
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
  const [qualifications, setQualifications] = useState("");
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
      qualifications: qualifications.trim() || "M.Phil / Master Degree",
      specialization: specialization.trim() || "General Practice",
      bio: "Dedicated healthcare professional providing evidence-based patient support.",
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
    setQualifications("");
    setSpecialization("");
  };

  const handleToggleStatus = (id: string) => {
    const updatedTeam = team.map((m) =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    );
    setTeam(updatedTeam);
    mockStore.updateTenant(activeTenant.id, { team: updatedTeam });
  };

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Staff Roster &amp; Access Control</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clinical Team &amp; Staff</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage practitioners, consultation capacities, role-based access permissions, and public directory bios.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-[#14161B] border border-[#232630] hover:border-slate-700 transition-all rounded-3xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 text-teal-300 font-bold text-base flex items-center justify-center">
                  {member.name.charAt(0)}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                      member.role === "OWNER"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : member.role === "PRACTITIONER"
                        ? "bg-teal-950 text-teal-300 border border-teal-800"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {member.role.replace("_", " ")}
                  </span>

                  <span
                    className={`w-2 h-2 rounded-full ${
                      member.isActive ? "bg-emerald-400" : "bg-slate-600"
                    }`}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{member.name}</h3>
                <p className="text-xs text-teal-400 font-medium">{member.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Award className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{member.qualifications}</span>
                </p>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-[#20232C]">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#20232C] flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                {member.specialization}
              </span>

              <button
                onClick={() => handleToggleStatus(member.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  member.isActive
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-emerald-950 text-emerald-300 border-emerald-800"
                }`}
              >
                {member.isActive ? "Suspend" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Invite Team Member</h3>
                <p className="text-xs text-slate-400">
                  Grant staff access to {activeTenant.name}.
                </p>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Dr. Rajesh Mishra"
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@clinic.in"
                    className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98261 00000"
                    className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="PRACTITIONER">Practitioner</option>
                    <option value="ADMIN">Practice Admin</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="BILLING">Billing Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Senior Psychologist"
                    className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Qualifications &amp; Degrees</label>
                <input
                  type="text"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="M.Phil Clinical Psychology (NIMHANS), RCI Reg."
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-[#20232C] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md"
                >
                  Send Invite &amp; Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
