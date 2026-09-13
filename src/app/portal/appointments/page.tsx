"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  RotateCcw,
  XCircle,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  ShieldCheck,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Appointment } from "@/types";

export default function PatientPortalAppointmentsPage() {
  const { activeTenant } = useTenant();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Connected patient
  const contacts = mockStore.getContacts(activeTenant.id);
  const patient = contacts[0] || { id: "cnt-1", fullName: "Priya Sharma" };

  const loadAppointments = () => {
    const list = mockStore.getAppointments(activeTenant.id).filter(
      (a) => a.contactId === patient.id
    );
    setAppointments(list);
  };

  useEffect(() => {
    loadAppointments();
    const unsubscribe = mockStore.subscribe(loadAppointments);
    return () => unsubscribe();
  }, [activeTenant.id, patient.id]);

  const upcoming = appointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "REQUESTED"
  );
  const history = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED" || a.status === "NO_SHOW"
  );

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !newDate || !newTime) return;

    mockStore.updateAppointmentStatus(
      selectedAppointment.id,
      "CONFIRMED",
      `Patient requested self-reschedule to ${newDate} at ${newTime} via Patient Care Hub.`
    );

    // Update time and date
    const appt = mockStore.getAppointment(selectedAppointment.id);
    if (appt) {
      appt.date = newDate;
      appt.startTime = newTime;
    }

    setIsRescheduleOpen(false);
    setSelectedAppointment(null);
    setToastMessage(`Your session has been rescheduled to ${newDate} at ${newTime}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCancelSubmit = () => {
    if (!selectedAppointment) return;

    mockStore.updateAppointmentStatus(
      selectedAppointment.id,
      "CANCELLED",
      "Patient cancelled via Patient Portal self-service."
    );

    setIsCancelConfirmOpen(false);
    setSelectedAppointment(null);
    setToastMessage("Your appointment has been cancelled.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-teal-900 border border-teal-600 text-teal-100 px-4 py-3 rounded-2xl shadow-2xl text-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Consultation Schedule</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Appointments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your upcoming care sessions, self-reschedule when needed, or view consultation history.
          </p>
        </div>

        <Link
          href={`/preview/${activeTenant.slug}#booking`}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Session</span>
        </Link>
      </div>

      {/* Upcoming Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Upcoming Sessions</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#1F232B] text-teal-400 border border-[#2C313D]">
            {upcoming.length}
          </span>
        </h2>

        {upcoming.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#14161B] border border-[#232630] text-center space-y-3">
            <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">No upcoming appointments scheduled</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no confirmed visits on your calendar. You can book your next session at any time.
            </p>
            <Link
              href={`/preview/${activeTenant.slug}#booking`}
              className="inline-flex items-center gap-1.5 text-xs text-teal-400 font-semibold hover:underline mt-2"
            >
              <span>Schedule with your practitioner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {upcoming.map((appt) => (
              <div
                key={appt.id}
                className="bg-[#14161B] border border-[#232630] hover:border-slate-700 transition-all rounded-3xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white font-mono">{appt.date}</span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-lg font-bold text-teal-400 font-mono">
                        {appt.startTime}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                        {appt.status}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-100">{appt.serviceName}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Practitioner: {appt.staffName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {appt.mode === "ONLINE" ? (
                          <Video className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{appt.mode === "ONLINE" ? "Secure Telehealth Video" : appt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Duration: {appt.durationMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appt);
                        setNewDate(appt.date);
                        setNewTime(appt.startTime);
                        setIsRescheduleOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#1C1F28] hover:bg-[#252A36] text-slate-200 text-xs font-semibold border border-[#2A2E3B] transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAppointment(appt);
                        setIsCancelConfirmOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#1C1F28] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-[#2A2E3B] hover:border-rose-900/50 transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>

                {appt.mode === "ONLINE" && (
                  <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-900/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-sky-300">
                      <Video className="w-4 h-4 text-sky-400" />
                      <span>Telehealth video link will activate 10 minutes prior to session.</span>
                    </div>
                    <span className="font-mono text-[10px] text-sky-400">HIPAA &amp; Encrypted</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Past Consultations</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#1F232B] text-slate-400 border border-[#2C313D]">
            {history.length}
          </span>
        </h2>

        {history.length > 0 && (
          <div className="bg-[#14161B] border border-[#232630] rounded-3xl overflow-hidden divide-y divide-[#232630]">
            {history.map((appt) => (
              <div
                key={appt.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-semibold">{appt.date}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-slate-400">{appt.startTime}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                        appt.status === "COMPLETED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : appt.status === "CANCELLED"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium">{appt.serviceName}</p>
                  <p className="text-slate-500">With {appt.staffName}</p>
                </div>

                <Link
                  href="/portal/messages"
                  className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold self-start sm:self-center"
                >
                  <span>Follow-up question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {isRescheduleOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Reschedule Appointment</h3>
                <button
                  onClick={() => setIsRescheduleOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select your preferred new date and time for &ldquo;{selectedAppointment.serviceName}&rdquo;.
              </p>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select New Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select New Time Slot
                </label>
                <select
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Choose slot</option>
                  <option value="10:00 AM">10:00 AM - 10:50 AM</option>
                  <option value="11:30 AM">11:30 AM - 12:20 PM</option>
                  <option value="02:00 PM">02:00 PM - 02:50 PM</option>
                  <option value="04:30 PM">04:30 PM - 05:20 PM</option>
                  <option value="06:00 PM">06:00 PM - 06:50 PM</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1F232D] border border-[#292E3B] text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Instant Verification</span>
                </p>
                <p>Rescheduling will immediately update your practitioner&apos;s schedule.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-[#20232C] text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md"
                >
                  Confirm New Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelConfirmOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-rose-900/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Cancel Appointment?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you wish to cancel your session for{" "}
                <span className="text-slate-200 font-semibold">{selectedAppointment.date}</span> at{" "}
                <span className="text-slate-200 font-semibold">{selectedAppointment.startTime}</span>?
                Our clinic maintains a 12-hour cancellation notice policy.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-transparent hover:bg-[#20232C] text-slate-300 text-xs font-medium"
              >
                Keep Session
              </button>
              <button
                onClick={handleCancelSubmit}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
