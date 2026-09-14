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
  Calendar,
  Clock,
  DollarSign,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  X,
  Printer,
  ChevronRight,
  Filter,
  CreditCard,
  Building,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import {
  StaffUser,
  StaffRole,
  StaffAttendance,
  PayrollEntry,
  StaffLeave,
  StaffActivityEntry,
  PaymentMethod,
  AttendanceStatus,
  LeaveType,
} from "@/types";

export default function StaffOpsPage() {
  const { activeTenant } = useTenant();
  const [team, setTeam] = useState<StaffUser[]>(activeTenant.team || []);

  const [activeTab, setActiveTab] = useState<
    "directory" | "attendance" | "payroll" | "leaves" | "activity"
  >("directory");

  // Role Simulator State
  const [simulatedRole, setSimulatedRole] = useState<StaffRole>("OWNER");

  // RBAC checks based on simulatedRole
  const canManagePayroll = simulatedRole === "OWNER" || simulatedRole === "CLINIC_ADMIN" || simulatedRole === "BILLING_ACCOUNTANT" || simulatedRole === "HR_MANAGER";
  const canManageAttendance = simulatedRole === "OWNER" || simulatedRole === "CLINIC_ADMIN" || simulatedRole === "HR_MANAGER" || simulatedRole === "RECEPTIONIST";
  const canManageTeamRoster = simulatedRole === "OWNER" || simulatedRole === "CLINIC_ADMIN" || simulatedRole === "HR_MANAGER";

  // Data from store
  const attendanceList = mockStore.getStaffAttendance(activeTenant.id);
  const payrollEntries = mockStore.getPayroll(activeTenant.id);
  const leaveRequests = mockStore.getStaffLeaves(activeTenant.id);
  const activityLogs = mockStore.getStaffActivityLog(activeTenant.id);

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("PRACTITIONER");
  const [title, setTitle] = useState("");
  const [specialization, setSpecialization] = useState("");

  // Attendance Modal
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attStaffId, setAttStaffId] = useState(team[0]?.id || "staff-1");
  const [attStatus, setAttStatus] = useState<AttendanceStatus>("PRESENT");
  const [attShift, setAttShift] = useState("Morning (09:00 - 17:00)");
  const [attCheckIn, setAttCheckIn] = useState("09:00");
  const [attCheckOut, setAttCheckOut] = useState("17:00");
  const [attHours, setAttHours] = useState(8.0);
  const [attNotes, setAttNotes] = useState("");
  const [attSuccess, setAttSuccess] = useState(false);

  // Payroll Disbursement Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollEntry | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("Bank Transfer");
  const [payRef, setPayRef] = useState("");
  const [payMemo, setPayMemo] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);

  // Payroll Adjust Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<PayrollEntry | null>(null);
  const [adjustType, setAdjustType] = useState<"ADVANCE" | "BONUS" | "DEDUCTION">("BONUS");
  const [adjustAmount, setAdjustAmount] = useState(1000);
  const [adjustMemo, setAdjustMemo] = useState("");

  // Payslip Preview Modal
  const [viewingPayslip, setViewingPayslip] = useState<PayrollEntry | null>(null);

  // Leave Request Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStaffId, setLeaveStaffId] = useState(team[0]?.id || "staff-1");
  const [leaveType, setLeaveType] = useState<LeaveType>("PAID");
  const [leaveStart, setLeaveStart] = useState("2026-09-25");
  const [leaveEnd, setLeaveEnd] = useState("2026-09-26");
  const [leaveDays, setLeaveDays] = useState(2);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Handlers
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

    mockStore.logStaffActivity(
      activeTenant.id,
      "Clinic Admin",
      "ADD_STAFF_MEMBER",
      newMember.name,
      `Added staff member ${newMember.name} as ${role}.`,
      "STAFF"
    );

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

  const handleMarkAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = team.find((s) => s.id === attStaffId);
    if (!staff) return;

    mockStore.markStaffAttendance(
      activeTenant.id,
      staff.id,
      staff.name,
      new Date().toISOString().split("T")[0],
      attStatus,
      attShift,
      attCheckIn,
      attCheckOut,
      Number(attHours),
      attNotes
    );

    setAttSuccess(true);
    setTimeout(() => {
      setAttSuccess(false);
      setIsAttendanceModalOpen(false);
      setAttNotes("");
    }, 1200);
  };

  const handleDisburseSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayroll) return;

    mockStore.recordSalaryPayment(
      selectedPayroll.id,
      payMethod,
      payRef || `NEFT-${Date.now()}`,
      payMemo || "Monthly salary disbursement",
      "HR & Accounts"
    );

    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setIsPayModalOpen(false);
      setPayRef("");
      setPayMemo("");
    }, 1200);
  };

  const handleAdjustPayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    mockStore.adjustPayroll(
      adjustTarget.id,
      adjustType,
      Number(adjustAmount),
      adjustMemo || `Payroll ${adjustType.toLowerCase()} adjustment`
    );

    setIsAdjustModalOpen(false);
    setAdjustMemo("");
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = team.find((s) => s.id === leaveStaffId);
    if (!staff) return;

    mockStore.requestStaffLeave(
      activeTenant.id,
      staff.id,
      staff.name,
      leaveType,
      leaveStart,
      leaveEnd,
      Number(leaveDays),
      leaveReason
    );

    setLeaveSuccess(true);
    setTimeout(() => {
      setLeaveSuccess(false);
      setIsLeaveModalOpen(false);
      setLeaveReason("");
    }, 1200);
  };

  const handleReviewLeave = (leaveId: string, status: "APPROVED" | "REJECTED") => {
    mockStore.reviewStaffLeave(leaveId, status, "HR Admin");
    // Force re-render
    setTeam([...team]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Role Simulator Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Staff Operations (StaffOps)
            </h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {team.length} Staff
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Practitioner roster, daily biometric attendance, payroll ledger, leave management, and immutable audit trails
          </p>
        </div>

        {/* Role Simulator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-slate-500 font-medium">Role Simulator:</span>
            <select
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value as StaffRole)}
              className="font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="OWNER">Owner (Unrestricted)</option>
              <option value="CLINIC_ADMIN">Clinic Admin</option>
              <option value="PRACTITIONER">Practitioner / Doctor</option>
              <option value="RECEPTIONIST">Receptionist (Front Desk)</option>
              <option value="BILLING_ACCOUNTANT">Billing Accountant</option>
              <option value="HR_MANAGER">HR Manager</option>
            </select>
          </div>

          {canManageTeamRoster && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* RBAC Role Context Strip */}
      <div className="p-3 rounded-lg border text-xs flex items-center justify-between bg-slate-50 border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">Current RBAC Scope:</span>
          <span className="font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-medium">
            {simulatedRole}
          </span>
          <span className="text-slate-500">
            {simulatedRole === "RECEPTIONIST"
              ? "Reception view: Payroll tabs hidden. Cannot modify doctor session deductions."
              : simulatedRole === "BILLING_ACCOUNTANT"
              ? "Accountant view: Full ledger & payroll access. Clinical formulations segregated."
              : simulatedRole === "PRACTITIONER"
              ? "Clinician view: Treatment plans & care protocols active. Staff payroll hidden."
              : "Administrative view: Full operational control across staff, payroll, and logs."}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
          Tenant: {activeTenant.id}
        </span>
      </div>

      {/* StaffOps Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-medium text-slate-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("directory")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "directory"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Staff Directory ({team.length})
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "attendance"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Attendance ({attendanceList.length})
        </button>

        {canManagePayroll && (
          <button
            onClick={() => setActiveTab("payroll")}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "payroll"
                ? "border-teal-600 text-teal-800 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Payroll Ledger ({payrollEntries.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab("leaves")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "leaves"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Leave Management ({leaveRequests.length})
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "activity"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Activity Log ({activityLogs.length})
        </button>
      </div>

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === "directory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-3 shadow-none"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-700 text-sm shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {member.name}
                      </h3>
                      <p className="text-xs text-slate-500">{member.title}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-mono ${
                      member.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-medium text-slate-900">{member.role}</span>
                    {member.specialization && (
                      <span className="text-slate-400">&bull; {member.specialization}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                </div>
              </div>

              {canManageTeamRoster && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleStatus(member.id)}
                    className="text-slate-500 hover:text-slate-900 text-[11px]"
                  >
                    {member.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {member.id}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Biometric check-in and shift attendance register for {new Date().toISOString().split("T")[0]}.
            </p>
            {canManageAttendance && (
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm self-start sm:self-auto"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark Attendance</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4 text-center">Hours</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceList.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono text-slate-600">{att.date}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{att.staffName}</td>
                      <td className="py-3 px-4 text-slate-600">{att.shift}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{att.checkIn || "—"}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{att.checkOut || "—"}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{att.hours}h</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            att.status === "PRESENT"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : att.status === "LATE"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : att.status === "LEAVE"
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{att.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYROLL LEDGER */}
      {activeTab === "payroll" && canManagePayroll && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Monthly Staff Compensation &amp; Payroll Register
              </h3>
              <p className="text-xs text-slate-500">
                Net pay calculation: Base Salary &minus; Advances + Performance Bonuses &minus; Deductions
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Month: Sep 2026
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Base</th>
                    <th className="py-3 px-4 text-right">Advance (-)</th>
                    <th className="py-3 px-4 text-right">Bonus (+)</th>
                    <th className="py-3 px-4 text-right">Deduction (-)</th>
                    <th className="py-3 px-4 text-right font-bold">Net Payable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {entry.staffName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{entry.role}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ₹{entry.baseSalary.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">
                        {entry.advance > 0 ? `-₹${entry.advance.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        {entry.bonus > 0 ? `+₹${entry.bonus.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">
                        {entry.deductions > 0 ? `-₹${entry.deductions.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{entry.payable.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            entry.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {entry.status !== "PAID" ? (
                          <button
                            onClick={() => {
                              setSelectedPayroll(entry);
                              setIsPayModalOpen(true);
                            }}
                            className="text-white bg-[#0D9488] hover:bg-[#0F766E] px-2.5 py-1 rounded text-xs font-medium transition-colors shadow-xs"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => setViewingPayslip(entry)}
                            className="text-teal-700 hover:text-teal-900 font-medium"
                          >
                            Payslip &rarr;
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAdjustTarget(entry);
                            setIsAdjustModalOpen(true);
                          }}
                          className="text-slate-500 hover:text-slate-800"
                          title="Add Bonus / Deduction"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE MANAGEMENT */}
      {activeTab === "leaves" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Staff leave requests, approval queue, and calendar blackout tracking.
            </p>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply for Leave</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4 text-center">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">{lv.staffName}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {lv.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {lv.startDate} to {lv.endDate}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{lv.days}</td>
                      <td className="py-3 px-4 text-slate-600">{lv.reason}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            lv.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : lv.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {lv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {lv.status === "PENDING" && canManageTeamRoster ? (
                          <>
                            <button
                              onClick={() => handleReviewLeave(lv.id, "APPROVED")}
                              className="text-emerald-700 hover:text-emerald-900 font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewLeave(lv.id, "REJECTED")}
                              className="text-rose-600 hover:text-rose-800 font-medium"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {lv.reviewedBy ? `Reviewed by ${lv.reviewedBy}` : "Logged"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITY LOG */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Immutable audit record of all clinical, staff, and financial actions taken within this clinic tenant.
          </p>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Staff User</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {log.timestamp.slice(0, 16).replace("T", " ")}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{log.staffName}</td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{log.action}</td>
                      <td className="py-3 px-4 text-slate-700">{log.targetEntity}</td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed text-[11px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Mark Staff Attendance
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Daily clock-in verification and biometric shift logging.
            </p>

            {attSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>Attendance recorded successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleMarkAttendance} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Staff Member</label>
                  <select
                    value={attStaffId}
                    onChange={(e) => setAttStaffId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    {team.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={attStatus}
                      onChange={(e) => setAttStatus(e.target.value as AttendanceStatus)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                    >
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="LEAVE">On Leave</option>
                      <option value="ABSENT">Absent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={attHours}
                      onChange={(e) => setAttHours(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Check-In</label>
                    <input
                      type="time"
                      value={attCheckIn}
                      onChange={(e) => setAttCheckIn(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Check-Out</label>
                    <input
                      type="time"
                      value={attCheckOut}
                      onChange={(e) => setAttCheckOut(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Shift Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard morning shift in OPD 2"
                    value={attNotes}
                    onChange={(e) => setAttNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                  >
                    Save Attendance
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Salary Disbursement Modal */}
      {isPayModalOpen && selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Disburse Salary to {selectedPayroll.staffName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Net payable: ₹{selectedPayroll.payable.toLocaleString("en-IN")} for {selectedPayroll.month}.
            </p>

            {paySuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>Salary disbursed and audit log recorded!</span>
              </div>
            ) : (
              <form onSubmit={handleDisburseSalary} className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Salary:</span>
                    <span className="font-mono">₹{selectedPayroll.baseSalary.toLocaleString("en-IN")}</span>
                  </div>
                  {selectedPayroll.advance > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Salary Advance Deducted:</span>
                      <span className="font-mono">-₹{selectedPayroll.advance.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {selectedPayroll.bonus > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Performance Bonus:</span>
                      <span className="font-mono">+₹{selectedPayroll.bonus.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {selectedPayroll.deductions > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Tax / EPF Deductions:</span>
                      <span className="font-mono">-₹{selectedPayroll.deductions.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                    <span>Net Amount Disbursed:</span>
                    <span className="font-mono text-emerald-700">₹{selectedPayroll.payable.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Disbursement Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    <option value="Bank Transfer">NEFT / RTGS Bank Transfer</option>
                    <option value="UPI">UPI Direct Transfer</option>
                    <option value="Cash">Cash Handover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">UTR / Bank Reference Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC-SAL-20260930-1092"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Memo</label>
                  <input
                    type="text"
                    placeholder="e.g. September 2026 clinic compensation"
                    value={payMemo}
                    onChange={(e) => setPayMemo(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                  >
                    Confirm Disbursement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Adjust Payroll Modal */}
      {isAdjustModalOpen && adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Adjust Payroll for {adjustTarget.staffName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a mid-month salary advance, festive/performance bonus, or deduction.
            </p>

            <form onSubmit={handleAdjustPayrollSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  <option value="BONUS">Performance / Festive Bonus (+)</option>
                  <option value="ADVANCE">Salary Advance Deducted (-)</option>
                  <option value="DEDUCTION">Other Deduction (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Adjustment Reason / Memo</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Excellent clinic adherence and patient satisfaction ratings"
                  value={adjustMemo}
                  onChange={(e) => setAdjustMemo(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {viewingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-400 font-mono block">SALARY PAYSLIP</span>
                <h3 className="text-base font-bold text-slate-900">
                  {viewingPayslip.staffName}
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                PAID
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Designation:</span>
                <span className="font-semibold text-slate-900">{viewingPayslip.role}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Pay Period:</span>
                <span className="font-mono text-slate-800">{viewingPayslip.month}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Base Salary:</span>
                <span className="font-mono text-slate-900">₹{viewingPayslip.baseSalary.toLocaleString("en-IN")}</span>
              </div>
              {viewingPayslip.advance > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Advance Deducted:</span>
                  <span className="font-mono">-₹{viewingPayslip.advance.toLocaleString("en-IN")}</span>
                </div>
              )}
              {viewingPayslip.bonus > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Bonus:</span>
                  <span className="font-mono">+₹{viewingPayslip.bonus.toLocaleString("en-IN")}</span>
                </div>
              )}
              {viewingPayslip.deductions > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Deductions:</span>
                  <span className="font-mono">-₹{viewingPayslip.deductions.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>Net Disbursed:</span>
                <span className="font-mono text-emerald-700">₹{viewingPayslip.payable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Ref: {viewingPayslip.paymentReference} &bull; Paid via {viewingPayslip.paymentMethod} on {viewingPayslip.paidDate}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs text-slate-700 rounded-md border border-slate-200 hover:bg-slate-50"
              >
                Print Payslip
              </button>
              <button
                onClick={() => setViewingPayslip(null)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Apply for Staff Leave
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit a leave request for administrative review.
            </p>

            {leaveSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>Leave request submitted for approval!</span>
              </div>
            ) : (
              <form onSubmit={handleLeaveSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Staff Member</label>
                  <select
                    value={leaveStaffId}
                    onChange={(e) => setLeaveStaffId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    {team.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                    >
                      <option value="PAID">Paid Time Off</option>
                      <option value="UNPAID">Unpaid Leave</option>
                      <option value="SICK">Sick Leave</option>
                      <option value="EMERGENCY">Emergency Leave</option>
                      <option value="OTHER">Other Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Number of Days</label>
                    <input
                      type="number"
                      required
                      value={leaveDays}
                      onChange={(e) => setLeaveDays(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Reason</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Attending family medical emergency"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsLeaveModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Staff Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Add Staff Member
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a practitioner or staff role to {activeTenant.name}.
            </p>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kavita Deshmukh"
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
                    placeholder="kavita@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98260 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
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
                    <option value="PRACTITIONER">Practitioner / Doctor</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="BILLING_ACCOUNTANT">Billing Accountant</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="CLINIC_ADMIN">Clinic Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="Senior Physiotherapist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Clinical Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Spine & Post-Operative Rehabilitation"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
