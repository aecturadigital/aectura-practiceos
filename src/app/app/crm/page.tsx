"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { CrmDeal, CrmStage } from "@/types";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";

const STAGES: Array<{ id: CrmStage; label: string; color: string }> = [
  { id: "NEW_ENQUIRY", label: "New Enquiry", color: "border-sky-500/50 bg-sky-950/20 text-sky-400" },
  { id: "CONTACTED", label: "Contacted", color: "border-indigo-500/50 bg-indigo-950/20 text-indigo-400" },
  { id: "QUALIFIED", label: "Qualified", color: "border-teal-500/50 bg-teal-950/20 text-teal-400" },
  { id: "BOOKED", label: "Booked", color: "border-amber-500/50 bg-amber-950/20 text-amber-400" },
  { id: "VISITED", label: "Visited", color: "border-emerald-500/50 bg-emerald-950/20 text-emerald-400" },
  { id: "CONVERTED", label: "Converted", color: "border-purple-500/50 bg-purple-950/20 text-purple-400" },
  { id: "LOST", label: "Lost", color: "border-rose-500/50 bg-rose-950/20 text-rose-400" },
];

export default function CrmPage() {
  const { activeTenant, vertical, hasAccess } = useTenant();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  // New Deal Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("1800");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [newSource, setNewSource] = useState<any>("WEBSITE");

  if (!hasAccess("crm")) {
    return <UpgradeBanner feature="crm" />;
  }

  const deals = mockStore.getCrmDeals(activeTenant.id);

  const filteredDeals = deals.filter(
    (d) =>
      d.contactName.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.source.toLowerCase().includes(search.toLowerCase())
  );

  const totalPipelineValue = deals
    .filter((d) => d.stage !== "LOST")
    .reduce((sum, d) => sum + d.value, 0);

  const handleDragStart = (dealId: string) => {
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: CrmStage) => {
    if (draggedDealId) {
      mockStore.updateDealStage(draggedDealId, stage);
      setDraggedDealId(null);
    }
  };

  const handleQuickStageChange = (dealId: string, stage: CrmStage) => {
    mockStore.updateDealStage(dealId, stage);
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newTitle) return;

    // First check or create contact
    let contact = mockStore.getContacts(activeTenant.id).find((c) => c.fullName.toLowerCase() === newClientName.toLowerCase());
    if (!contact) {
      const [first, ...last] = newClientName.split(" ");
      contact = mockStore.createContact({
        id: `cnt-${Date.now()}`,
        tenantId: activeTenant.id,
        firstName: first,
        lastName: last.join(" ") || "",
        fullName: newClientName,
        email: `${first.toLowerCase()}@example.com`,
        phone: "+91 98261 00000",
        status: "LEAD",
        assignedPractitionerId: activeTenant.team?.[0]?.id || "staff-1",
        tags: ["CRM Inbound"],
        notesCount: 0,
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    mockStore.createCrmDeal({
      id: `deal-${Date.now()}`,
      tenantId: activeTenant.id,
      contactId: contact.id,
      contactName: contact.fullName,
      contactPhone: contact.phone,
      contactEmail: contact.email,
      title: newTitle,
      value: parseInt(newValue, 10) || 1800,
      stage: "NEW_ENQUIRY",
      priority: newPriority,
      source: newSource,
      assignedToStaffId: activeTenant.team?.[0]?.id || "staff-1",
      nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setIsNewModalOpen(false);
    setNewClientName("");
    setNewTitle("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">CRM Care Pipeline</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1C2028] text-teal-400 border border-[#2B2F3C]">
              Pipeline Value: ₹{totalPipelineValue.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visual pipeline tracking prospective care seekers from initial enquiry to active clinical treatment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Toggle View */}
          <div className="flex items-center border border-[#2B2F3B] rounded-xl p-0.5 bg-[#111315]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "kanban" ? "bg-teal-950 text-teal-400" : "text-slate-400 hover:text-white"
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table" ? "bg-teal-950 text-teal-400" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead Deal</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter deals by patient name, enquiry title, or lead source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
                className="w-72 shrink-0 bg-[#16181D] border border-[#242833] rounded-2xl p-3 flex flex-col min-h-[500px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between p-2 mb-2 rounded-xl bg-[#111315] border border-[#22252C]">
                  <div>
                    <span className="text-xs font-bold text-white block">{stage.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ₹{stageTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Stage Deals List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal.id)}
                      className="p-3.5 rounded-xl bg-[#1A1D24] hover:bg-[#20242D] border border-[#272B36] hover:border-teal-700/60 transition-all cursor-grab active:cursor-grabbing shadow-sm text-xs space-y-2 group"
                    >
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/app/contacts/${deal.contactId}`}
                          className="font-bold text-white group-hover:text-teal-400 transition-colors"
                        >
                          {deal.contactName}
                        </Link>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                            deal.priority === "HIGH"
                              ? "bg-rose-950 text-rose-400 border border-rose-800"
                              : deal.priority === "MEDIUM"
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {deal.priority}
                        </span>
                      </div>

                      <p className="text-slate-300 text-[11px] leading-snug line-clamp-2">
                        {deal.title}
                      </p>

                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-[#242833]">
                        <span className="font-bold text-teal-400 font-mono">
                          ₹{deal.value.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-slate-500">{deal.source}</span>
                      </div>

                      {/* Quick Move Stage Select (Accessible fallback) */}
                      <div className="pt-1">
                        <select
                          value={deal.stage}
                          onChange={(e) => handleQuickStageChange(deal.id, e.target.value as CrmStage)}
                          className="w-full bg-[#111315] border border-[#272A34] text-[10px] text-slate-300 rounded px-1.5 py-1 focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move to: {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="h-24 border border-dashed border-[#242833] rounded-xl flex items-center justify-center text-[11px] text-slate-600">
                      Drop cards here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#13151A] border-b border-[#242833] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Deal Title</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22252C] text-slate-300">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-[#1A1D24] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <Link href={`/app/contacts/${deal.contactId}`} className="hover:text-teal-400">
                        {deal.contactName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{deal.title}</td>
                    <td className="py-3 px-4">
                      <select
                        value={deal.stage}
                        onChange={(e) => handleQuickStageChange(deal.id, e.target.value as CrmStage)}
                        className="bg-[#111315] border border-[#272A34] text-[10px] text-teal-400 rounded px-2 py-1 font-mono"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono uppercase">{deal.priority}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{deal.source}</td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      ₹{deal.value.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/app/contacts/${deal.contactId}`}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181D] border border-[#272A34] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-1">Create New CRM Deal</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add an active enquiry into the patient acquisition pipeline.
            </p>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Client / Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Sahu"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Enquiry Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anxiety Intake 4-Session Block"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#242833]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#272A34] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-4 py-1.5 rounded-lg shadow-sm"
                >
                  Add to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
