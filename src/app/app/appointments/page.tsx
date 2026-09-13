"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  MoreVertical,
  X,
  Check,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Appointment, AppointmentStatus, AppointmentMode } from "@/types";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";

export default function AppointmentsCalendarPage() {
  const { activeTenant, vertical, hasAccess } = useTenant();
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>("ALL");
  const [selectedMode, setSelectedMode] = useState<string>("ALL");

  // Selected Appointment for Drawer
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reschedule Modal inside Drawer
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("2026-09-18");
  const [rescheduleTime, setRescheduleTime] = useState("11:00");

  // New Appointment Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookContactName, setBookContactName] = useState("");
  const [bookServiceId, setBookServiceId] = useState(activeTenant.services?.[0]?.id || "");
  const [bookPractitionerId, setBookPractitionerId] = useState(activeTenant.team?.[0]?.id || "");
  const [bookDate, setBookDate] = useState("2026-09-15");
  const [bookTime, setBookTime] = useState("14:30");
  const [bookMode, setBookMode] = useState<AppointmentMode>("IN_PERSON");
  const [bookNotes, setBookNotes] = useState("");

  if (!hasAccess("booking")) {
    return <UpgradeBanner feature="booking" />;
  }

  const appointments = mockStore.getAppointments(activeTenant.id);

  const filteredAppointments = appointments.filter((a) => {
    if (selectedPractitioner !== "ALL" && a.staffId !== selectedPractitioner) return false;
    if (selectedMode !== "ALL" && a.mode !== selectedMode) return false;
    return true;
  });

  const handleOpenAppointment = (apt: Appointment) => {
    setActiveAppointment(apt);
    setIsDrawerOpen(true);
    setIsRescheduling(false);
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    mockStore.updateAppointmentStatus(id, status);
    if (activeAppointment && activeAppointment.id === id) {
      setActiveAppointment({ ...activeAppointment, status });
    }
  };

  const handleConfirmReschedule = () => {
    if (activeAppointment) {
      mockStore.rescheduleAppointment(activeAppointment.id, rescheduleDate, rescheduleTime);
      setActiveAppointment({
        ...activeAppointment,
        date: rescheduleDate,
        startTime: rescheduleTime,
        status: "CONFIRMED",
      });
      setIsRescheduling(false);
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookContactName) return;

    // Contact lookup or creation
    let contact = mockStore.getContacts(activeTenant.id).find((c) => c.fullName.toLowerCase() === bookContactName.toLowerCase());
    if (!contact) {
      const [first, ...last] = bookContactName.split(" ");
      contact = mockStore.createContact({
        id: `cnt-${Date.now()}`,
        tenantId: activeTenant.id,
        firstName: first,
        lastName: last.join(" ") || "",
        fullName: bookContactName,
        phone: "+91 98261 00000",
        email: `${first.toLowerCase()}@example.com`,
        status: "ACTIVE",
        assignedPractitionerId: bookPractitionerId,
        tags: ["Calendar Booking"],
        notesCount: 0,
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    const srv = activeTenant.services.find((s) => s.id === bookServiceId) || activeTenant.services[0];
    const doc = activeTenant.team.find((m) => m.id === bookPractitionerId) || activeTenant.team[0];

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      tenantId: activeTenant.id,
      contactId: contact.id,
      contactName: contact.fullName,
      contactPhone: contact.phone,
      staffId: doc?.id || "staff-1",
      staffName: doc?.name || "Doctor",
      serviceId: srv?.id || "srv-1",
      serviceName: srv?.name || "Consultation",
      date: bookDate,
      startTime: bookTime,
      durationMinutes: srv?.durationMinutes || 50,
      mode: bookMode,
      status: "CONFIRMED",
      location: bookMode === "ONLINE" ? "Secure Telehealth Room" : `${activeTenant.city} Clinic Suite`,
      notes: bookNotes,
      intakeFormSubmitted: true,
      createdAt: new Date().toISOString(),
    };

    mockStore.createAppointment(newApt);
    setIsBookingModalOpen(false);
    setBookContactName("");
    setBookNotes("");
  };

  // Calendar dates for Week View (Sep 14 to Sep 20)
  const weekDays = [
    { day: "Mon", date: "2026-09-14", label: "14 Sep" },
    { day: "Tue", date: "2026-09-15", label: "15 Sep" },
    { day: "Wed", date: "2026-09-16", label: "16 Sep" },
    { day: "Thu", date: "2026-09-17", label: "17 Sep" },
    { day: "Fri", date: "2026-09-18", label: "18 Sep" },
    { day: "Sat", date: "2026-09-19", label: "19 Sep" },
    { day: "Sun", date: "2026-09-20", label: "20 Sep" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Appointments &amp; Roster</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1C2028] text-teal-400 border border-[#2B2F3C]">
              {filteredAppointments.length} Active Slots
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multi-practitioner scheduling calendar with direct confirmation, self-service reschedule sync, and conflict checks.
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Calendar Toolbar */}
      <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#111315] border border-[#2B2F3B] rounded-xl p-1">
            <button className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-white px-2">September 2026</span>
            <button className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Current Week</span>
        </div>

        {/* View and Practitioner Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedPractitioner}
            onChange={(e) => setSelectedPractitioner(e.target.value)}
            aria-label="Filter by clinical provider"
            className="bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Practitioners</option>
            {activeTenant.team?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            aria-label="Filter by appointment consultation mode"
            className="bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Modes</option>
            <option value="IN_PERSON">In Person (Clinic)</option>
            <option value="ONLINE">Telehealth (Online)</option>
            <option value="HOME_VISIT">Home Visit</option>
          </select>

          <div className="flex items-center border border-[#2B2F3B] rounded-xl p-0.5 bg-[#111315]">
            {(["day", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  viewMode === mode
                    ? "bg-teal-950 text-teal-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week Calendar Grid */}
      <div className="bg-[#16181D] border border-[#242833] rounded-3xl p-4 sm:p-6 overflow-x-auto shadow-sm">
        <div className="min-w-[800px] grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayApts = filteredAppointments.filter((a) => a.date === day.date);
            const isToday = day.date === "2026-09-13" || day.day === "Mon";

            return (
              <div key={day.date} className="flex flex-col space-y-3">
                {/* Day Header */}
                <div
                  className={`p-2.5 rounded-2xl text-center border ${
                    isToday
                      ? "bg-teal-950/60 border-teal-700/80 text-teal-300"
                      : "bg-[#121417] border-[#22252C] text-slate-400"
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase block">{day.day}</span>
                  <span className="text-sm font-bold text-white font-mono">{day.label}</span>
                </div>

                {/* Day Appointments Slots */}
                <div className="space-y-2.5 flex-1 min-h-[380px] bg-[#121417]/40 rounded-2xl p-2 border border-[#22252C]/60">
                  {dayApts.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleOpenAppointment(apt)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-xs text-xs space-y-1.5 ${
                        apt.status === "CONFIRMED"
                          ? "bg-teal-950/40 border-teal-800/60 hover:border-teal-600"
                          : apt.status === "COMPLETED"
                          ? "bg-slate-900 border-slate-700/60 opacity-80"
                          : apt.status === "NO_SHOW"
                          ? "bg-rose-950/40 border-rose-900/60"
                          : "bg-amber-950/30 border-amber-900/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-400 font-mono text-[11px]">
                          {apt.startTime}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111315] text-slate-300">
                          {apt.mode === "ONLINE" ? "Video" : "Clinic"}
                        </span>
                      </div>

                      <p className="font-semibold text-white truncate">{apt.contactName}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{apt.serviceName}</p>
                      <p className="text-[9px] text-slate-500 truncate">{apt.staffName}</p>

                      <div className="pt-1 flex justify-between items-center text-[9px]">
                        <span
                          className={`font-semibold uppercase ${
                            apt.status === "CONFIRMED"
                              ? "text-emerald-400"
                              : apt.status === "COMPLETED"
                              ? "text-slate-400"
                              : "text-amber-400"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {dayApts.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[10px] text-slate-600 font-mono py-12">
                      No sessions
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Detail Side Drawer */}
      {isDrawerOpen && activeAppointment && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-[#16181D] border-l border-[#272A34] shadow-2xl flex flex-col p-6 overflow-y-auto">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#242833] pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800 uppercase">
                    {activeAppointment.mode.replace("_", " ")}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1.5">
                    Appointment Details
                  </h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="space-y-6 flex-1 text-xs">
                {/* Client Box */}
                <div className="p-4 rounded-2xl bg-[#111315] border border-[#242833] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{vertical.terminology.contactSingular}</span>
                    <Link
                      href={`/app/contacts/${activeAppointment.contactId}`}
                      className="text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      View 360° Card &rarr;
                    </Link>
                  </div>
                  <p className="text-base font-bold text-white">{activeAppointment.contactName}</p>
                  <p className="text-slate-400 font-mono">{activeAppointment.contactPhone}</p>
                </div>

                {/* Session Details */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                    <span className="text-slate-500 block mb-1">Service &amp; Duration</span>
                    <span className="font-semibold text-white">{activeAppointment.serviceName}</span>
                    <span className="text-slate-400 block mt-0.5">({activeAppointment.durationMinutes} minutes)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                      <span className="text-slate-500 block mb-1">Date &amp; Time</span>
                      <span className="font-mono text-teal-400 font-semibold block">
                        {activeAppointment.date}
                      </span>
                      <span className="font-mono text-white text-sm">
                        {activeAppointment.startTime}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                      <span className="text-slate-500 block mb-1">Status</span>
                      <span className="font-bold text-emerald-400 block mt-1">
                        {activeAppointment.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                    <span className="text-slate-500 block mb-1">Assigned Practitioner</span>
                    <span className="font-medium text-white">{activeAppointment.staffName}</span>
                  </div>

                  {activeAppointment.notes && (
                    <div className="p-3 rounded-xl bg-[#121417] border border-[#22252C]">
                      <span className="text-slate-500 block mb-1">Clinical Notes</span>
                      <span className="text-slate-300 leading-relaxed">{activeAppointment.notes}</span>
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-[#242833]">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Direct Status Controls
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateStatus(activeAppointment.id, "CONFIRMED")}
                      className="py-2 px-3 rounded-xl bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm</span>
                    </button>

                    <button
                      onClick={() => setIsRescheduling(true)}
                      className="py-2 px-3 rounded-xl bg-[#1F232B] hover:bg-[#282C37] text-slate-200 border border-[#2A2E3B] font-semibold flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4 text-sky-400" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(activeAppointment.id, "COMPLETED")}
                      className="py-2 px-3 rounded-xl bg-[#1F232B] hover:bg-[#282C37] text-slate-200 border border-[#2A2E3B] font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Mark Complete</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(activeAppointment.id, "NO_SHOW")}
                      className="py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>No Show</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(activeAppointment.id, "CANCELLED")}
                    className="w-full py-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors text-center mt-1"
                  >
                    Cancel Appointment
                  </button>
                </div>

                {/* Reschedule Drawer Form */}
                {isRescheduling && (
                  <div className="p-4 rounded-2xl bg-[#111315] border border-sky-800/60 space-y-3 animate-in fade-in">
                    <p className="font-semibold text-white">Reschedule Session</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">New Date</label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full bg-[#1A1D24] border border-[#2B2F3C] rounded-lg p-2 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">New Time</label>
                        <input
                          type="time"
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="w-full bg-[#1A1D24] border border-[#2B2F3C] rounded-lg p-2 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsRescheduling(false)}
                        className="px-3 py-1.5 rounded-lg border border-[#272A34] text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmReschedule}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-1.5 rounded-lg shadow-sm"
                      >
                        Confirm Slot
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181D] border border-[#272A34] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-1">Book New Appointment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Reserve an active practitioner time slot on the clinic schedule.
            </p>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">{vertical.terminology.contactSingular} Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={bookContactName}
                  onChange={(e) => setBookContactName(e.target.value)}
                  className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Clinical Service *</label>
                <select
                  value={bookServiceId}
                  onChange={(e) => setBookServiceId(e.target.value)}
                  className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
                >
                  {activeTenant.services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (₹{s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Practitioner *</label>
                <select
                  value={bookPractitionerId}
                  onChange={(e) => setBookPractitionerId(e.target.value)}
                  className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
                >
                  {activeTenant.team?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Consultation Mode</label>
                <select
                  value={bookMode}
                  onChange={(e) => setBookMode(e.target.value as any)}
                  className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
                >
                  <option value="IN_PERSON">In Person (Clinic Consulting Room)</option>
                  <option value="ONLINE">Telehealth (Secure Video Call)</option>
                  <option value="HOME_VISIT">Home Visit</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Intake context or special preparation..."
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#242833]">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#272A34] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-4 py-1.5 rounded-lg shadow-sm"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
