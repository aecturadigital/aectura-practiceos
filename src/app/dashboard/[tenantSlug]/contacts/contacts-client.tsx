"use client";

import { useState } from "react";
import { Contact } from "@/lib/db/schema";
import { Plus, Search, User, Phone, Mail, FileText, CheckCircle2, Shield } from "lucide-react";

export function ContactsManagerClient({
  tenantId,
  initialContacts,
  contactSingular,
}: {
  tenantId: string;
  initialContacts: Contact[];
  contactSingular: string;
}) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [filterStage, setFilterStage] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"lead" | "client" | "patient">("lead");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenantId,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          stage,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add contact");

      setContacts([data.contact, ...contacts]);
      setShowAddForm(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setNotes("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = contacts.filter((c) => {
    const matchesStage = filterStage === "all" || c.stage === filterStage;
    const query = search.toLowerCase();
    const matchesSearch =
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query);
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["all", "lead", "client", "patient"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterStage === s
                  ? "bg-[#0D9488] text-white"
                  : "bg-[#16181F] text-slate-400 hover:text-white border border-[#262B36]"
              }`}
            >
              {s === "all" ? `All (${contacts.length})` : `${s}s (${contacts.filter((x) => x.stage === s).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${contactSingular.toLowerCase()}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#16181F] border border-[#262B36] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add {contactSingular}
          </button>
        </div>
      </div>

      {/* Add Contact Modal / Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="bg-[#14171C] border border-[#2B303C] rounded-xl p-6 space-y-4 shadow-lg"
        >
          <div className="font-bold text-sm text-white flex items-center gap-2">
            <User className="w-4 h-4 text-teal-400" /> Register New {contactSingular} Record
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Lifecycle Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none capitalize"
              >
                <option value="lead">Lead (Inquiry / Web)</option>
                <option value="client">Client (Booked / Active)</option>
                <option value="patient">Patient (Clinical Intake Done)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Initial Clinical / CRM Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white focus:outline-none"
                placeholder="Initial reason for visit or clinical observations"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold px-5 py-2 rounded-lg"
            >
              {isSubmitting ? "Saving..." : `Save ${contactSingular}`}
            </button>
          </div>
        </form>
      )}

      {/* Contacts Table */}
      {filtered.length === 0 ? (
        <div className="bg-[#14171C] border border-[#222630] rounded-xl p-12 text-center text-xs text-slate-400">
          No {contactSingular.toLowerCase()} records match your current filter.
        </div>
      ) : (
        <div className="bg-[#14171C] border border-[#222630] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111315] border-b border-[#222630] text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">{contactSingular} Name</th>
                <th className="py-3 px-4">Contact Information</th>
                <th className="py-3 px-4">Lifecycle Stage</th>
                <th className="py-3 px-4">Internal Notes</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D212A]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#181B22] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5">
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-500" /> {c.email}
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-500" /> {c.phone}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`capitalize px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.stage === "patient"
                          ? "bg-teal-950 text-teal-300 border-teal-800"
                          : c.stage === "client"
                          ? "bg-blue-950 text-blue-300 border-blue-800"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {c.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    {c.notes || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString()}
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
