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
  X,
  Check,
  ExternalLink,
  User,
  Phone,
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

  // Reschedule Form inside Drawer
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("2026-09-18");
  const [rescheduleTime, setRescheduleTime] = useState("11:00");

  // New Appointment Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookContactName, setBookContactName] = useState("");
  const [bookServiceId, setBookServiceId] = useState(activeTenant.services?.[0]?.id || "");
  const [bookPractitionerId, setBookPractitionerId] = useState(activeTenant.team?.[0]?.id || "");
  const [bookDate, setBookDate] = useState("2026-09-16");
  const [bookTime, setBookTime] = useState("14:00");
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
    setRescheduleDate(apt.date);
    setRescheduleTime(apt.startTime);
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

    let contact = mockStore.getContacts(activeTenant.id).find(
      (c) => c.fullName.toLowerCase() === bookContactName.toLowerCase()
    );
    if (!contact) {
      const [first, ...last] = bookContactName.split(" ");
      contact = mockStore.createContact({
        id: `cnt-${Date.now()}`,
        tenantId: activeTenant.id,
        firstName: first,
        lastName: last.join(" ") || "",
        fullName: bookContactName,
        phone: "+91 98000 00000",
        email: `${first.toLowerCase()}@example.com`,
        status: "ACTIVE",
        assignedPractitionerId: bookPractitionerId,
        tags: ["Direct Booking"],
        notesCount: 0,
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        city: activeTenant.city,
      });
    }

    const service = activeTenant.services?.find((s) => s.id === bookServiceId) || activeTenant.services?.[0];
    const staff = activeTenant.team?.find((m) => m.id === bookPractitionerId) || activeTenant.team?.[0];

    mockStore.createAppointment({
      id: `apt-${Date.now()}`,
      tenantId: activeTenant.id,
      contactId: contact.id,
      contactName: contact.fullName,
      serviceId: service?.id || "srv-1",
      serviceName: service?.name || "Consultation",
      staffId: staff?.id || "staff-1",
      staffName: staff?.name || "Practitioner",
      date: bookDate,
      startTime: bookTime,
      durationMinutes: service?.durationMinutes || 45,
      status: "CONFIRMED",
      mode: bookMode,
      location: bookMode === "ONLINE" ? "Video Telehealth" : "Room 202",
      contactPhone: contact.phone,
      intakeFormSubmitted: true,
      notes: bookNotes,
      createdAt: new Date().toISOString(),
    });

    setIsBookingModalOpen(false);
    setBookContactName("");
    setBookNotes("");
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Completed
          </span>
        );
      case "RESCHEDULED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            Rescheduled
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            No Show
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            {status}
          </span>
        );
    }
  };

  // Week Days representation
  const weekDays = [
    { label: "Mon", date: "Sep 14", fullDate: "2026-09-14" },
    { label: "Tue", date: "Sep 15", fullDate: "2026-09-15" },
    { label: "Wed", date: "Sep 16", fullDate: "2026-09-16" },
    { label: "Thu", date: "Sep 17", fullDate: "2026-09-17" },
    { label: "Fri", date: "Sep 18", fullDate: "2026-09-18" },
    { label: "Sat", date: "Sep 19", fullDate: "2026-09-19" },
  ];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Calendar
            </h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {filteredAppointments.length} Bookings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Practitioner availability, appointment bookings, and room scheduling
          </p>
        </div>

        {/* View Switcher & Booking Action */}
        <div className="flex items-center gap-2">
          {/* Day / Week / Month Mode */}
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode("day")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === "day"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === "week"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === "month"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Month
            </button>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <button className="p-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
            Today
          </button>
          <button className="p-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-800 ml-1">
            September 14 &ndash; 19, 2026
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPractitioner}
            onChange={(e) => setSelectedPractitioner(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Practitioners</option>
            {activeTenant.team?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Modes</option>
            <option value="IN_PERSON">In-Person Clinic</option>
            <option value="ONLINE">Video Tele-Consult</option>
            <option value="HOME_VISIT">Home Visit</option>
          </select>
        </div>
      </div>

      {/* WEEK VIEW: Multi-Column Operational Grid */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {weekDays.map((day) => {
            const dayAppointments = filteredAppointments.filter(
              (a) => a.date === day.fullDate || a.date === "2026-09-15" // Demo fallback
            );

            return (
              <div
                key={day.fullDate}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col min-h-[480px]"
              >
                {/* Column Day Header */}
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 text-center">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 block">
                    {day.label}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {day.date}
                  </span>
                </div>

                {/* Day Appointment Slots */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleOpenAppointment(apt)}
                      className="p-2 rounded-md border border-slate-200 hover:border-teal-600 hover:bg-teal-50/20 cursor-pointer transition-all space-y-1 bg-white"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-teal-800">
                          {apt.startTime}
                        </span>
                        {getStatusBadge(apt.status)}
                      </div>

                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {apt.contactName}
                      </p>

                      <p className="text-[11px] text-slate-500 truncate leading-tight">
                        {apt.serviceName}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="truncate max-w-[80px]">{apt.staffName.split(" ")[0]}</span>
                        <span className="font-mono uppercase">{apt.mode === "ONLINE" ? "Video" : "Clinic"}</span>
                      </div>
                    </div>
                  ))}

                  {dayAppointments.length === 0 && (
                    <div className="h-20 flex items-center justify-center text-[10px] text-slate-400">
                      No slots booked
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAY & MONTH VIEW FALLBACK: Compact List */}
      {(viewMode === "day" || viewMode === "month") && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            {viewMode === "day" ? "Today's Schedule Detail" : "Monthly Appointment Roster"}
          </h2>

          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => handleOpenAppointment(apt)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 py-1 px-1.5 rounded bg-slate-50 border border-slate-200 text-center shrink-0">
                    <span className="text-xs font-semibold text-slate-800 font-mono block">
                      {apt.startTime}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">
                      {apt.durationMinutes}m
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {apt.contactName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {apt.mode.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{apt.serviceName} &bull; {apt.staffName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {getStatusBadge(apt.status)}
                  <span className="font-mono text-xs text-slate-700 font-medium">
                    &#8377;{activeTenant.services?.find((s) => s.id === apt.serviceId)?.price || 1500}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-Over Appointment Detail Drawer */}
      {isDrawerOpen && activeAppointment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activeAppointment.status)}
                    <span className="text-xs font-mono text-slate-400">
                      ID: {activeAppointment.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 mt-1">
                    {activeAppointment.contactName}
                  </h2>
                  <p className="text-xs text-slate-500">{activeAppointment.serviceName}</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Consultation Details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date &amp; Time</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {activeAppointment.date} at {activeAppointment.startTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium text-slate-800">
                    {activeAppointment.durationMinutes} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Practitioner</span>
                  <span className="font-medium text-slate-800">
                    {activeAppointment.staffName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mode &amp; Location</span>
                  <span className="font-medium text-slate-800">
                    {activeAppointment.location} ({activeAppointment.mode})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    &#8377;{activeTenant.services?.find((s) => s.id === activeAppointment.serviceId)?.price || 1500}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Receptionist Workflow */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Update Appointment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(activeAppointment.id, "CONFIRMED")}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Confirm</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeAppointment.id, "COMPLETED")}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>

                  <button
                    onClick={() => setIsRescheduling(!isRescheduling)}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeAppointment.id, "NO_SHOW")}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>No Show</span>
                  </button>
                </div>
              </div>

              {/* Reschedule Box */}
              {isRescheduling && (
                <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-2.5">
                  <h4 className="text-xs font-semibold text-indigo-950">Select New Slot</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">New Date</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">New Time</label>
                      <input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleConfirmReschedule}
                    className="w-full py-1.5 rounded bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-medium transition-colors"
                  >
                    Save Reschedule
                  </button>
                </div>
              )}

              {/* Appointment Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Booking / Reception Notes
                </label>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-md border border-slate-200">
                  {activeAppointment.notes || "Standard clinical consultation booking."}
                </p>
              </div>
            </div>

            {/* Bottom Link to Client Card */}
            <div className="pt-4 border-t border-slate-200">
              <Link
                href={`/app/contacts/${activeAppointment.contactId}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open 360 Client Card</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Book Appointment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule consultation for a new or existing patient.
            </p>

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Roy"
                  value={bookContactName}
                  onChange={(e) => setBookContactName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Service</label>
                <select
                  value={bookServiceId}
                  onChange={(e) => setBookServiceId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  {activeTenant.services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} min &bull; &#8377;{s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Practitioner</label>
                <select
                  value={bookPractitionerId}
                  onChange={(e) => setBookPractitionerId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mode</label>
                  <select
                    value={bookMode}
                    onChange={(e) => setBookMode(e.target.value as AppointmentMode)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    <option value="IN_PERSON">In-Person Clinic</option>
                    <option value="ONLINE">Video Telehealth</option>
                    <option value="HOME_VISIT">Home Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 202"
                    value={bookNotes}
                    onChange={(e) => setBookNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
