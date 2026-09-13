"use client";

import { useState } from "react";
import { Appointment, Contact, Practitioner, Service } from "@/lib/db/schema";
import { Plus, Calendar, Clock, User, CheckCircle2 } from "lucide-react";

export function AppointmentsClient({
  tenantId,
  initialAppointments,
  contacts,
  practitioners,
  services,
}: {
  tenantId: string;
  initialAppointments: any[];
  contacts: Contact[];
  practitioners: Practitioner[];
  services: Service[];
}) {
  const [appointments, setAppointments] = useState<any[]>(initialAppointments);
  const [showBookModal, setShowBookModal] = useState(false);

  // Booking Form State
  const [contactId, setContactId] = useState(contacts[0]?.id || "");
  const [practitionerId, setPractitionerId] = useState(practitioners[0]?.id || "");
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [startTime, setStartTime] = useState("2026-09-18T14:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedService = services.find((s) => s.id === serviceId) || services[0];
      const start = new Date(startTime);
      const end = new Date(start.getTime() + (selectedService?.durationMinutes || 50) * 60000);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenantId,
        },
        body: JSON.stringify({
          contactId,
          practitionerId,
          serviceId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create appointment");

      const contact = contacts.find((c) => c.id === contactId);
      const practitioner = practitioners.find((p) => p.id === practitionerId);

      setAppointments([
        {
          ...data.appointment,
          contactName: contact ? `${contact.firstName} ${contact.lastName}` : "Patient",
          practitionerName: practitioner?.name || "Provider",
          serviceName: selectedService?.name || "Session",
        },
        ...appointments,
      ]);

      setShowBookModal(false);
      setNotes("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Showing <strong>{appointments.length}</strong> scheduled sessions
        </div>
        <button
          onClick={() => setShowBookModal(!showBookModal)}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Book New Appointment
        </button>
      </div>

      {/* Book Session Form */}
      {showBookModal && (
        <form
          onSubmit={handleCreate}
          className="bg-[#14171C] border border-[#2B303C] rounded-xl p-6 space-y-4 shadow-lg"
        >
          <div className="font-bold text-sm text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" /> Book Staff-Assisted Session
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Patient / Client</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.stage})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Practitioner</label>
              <select
                value={practitionerId}
                onChange={(e) => setPractitionerId(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                {practitioners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.title})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Service &amp; Duration</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (${(s.price / 100).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Date &amp; Start Time</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Session Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
                placeholder="Follow-up consultation notes"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBookModal(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold px-5 py-2 rounded-lg"
            >
              {isSubmitting ? "Booking..." : "Confirm Appointment"}
            </button>
          </div>
        </form>
      )}

      {/* Appointments Table */}
      {appointments.length === 0 ? (
        <div className="bg-[#14171C] border border-[#222630] rounded-xl p-12 text-center text-xs text-slate-400">
          No appointments recorded yet. Use the button above to book your first session.
        </div>
      ) : (
        <div className="bg-[#14171C] border border-[#222630] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111315] border-b border-[#222630] text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Patient / Client</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Practitioner</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D212A]">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-[#181B22] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{a.contactName}</td>
                  <td className="py-3.5 px-4 text-slate-300">{a.serviceName}</td>
                  <td className="py-3.5 px-4 text-slate-400">{a.practitionerName}</td>
                  <td className="py-3.5 px-4 font-mono text-teal-400">
                    {new Date(a.startTime).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-800">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
