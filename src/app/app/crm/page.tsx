"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  X,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { CrmDeal, CrmStage } from "@/types";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";

const STAGES: Array<{ id: CrmStage; label: string; dotColor: string }> = [
  { id: "NEW_ENQUIRY", label: "New", dotColor: "bg-sky-500" },
  { id: "CONTACTED", label: "Contacted", dotColor: "bg-indigo-500" },
  { id: "QUALIFIED", label: "Qualified", dotColor: "bg-teal-500" },
  { id: "BOOKED", label: "Booked", dotColor: "bg-amber-500" },
  { id: "VISITED", label: "Visited", dotColor: "bg-emerald-500" },
  { id: "CONVERTED", label: "Converted", dotColor: "bg-teal-700" },
  { id: "LOST", label: "Lost", dotColor: "bg-rose-500" },
];

export default function LeadsPage() {
  const { activeTenant, vertical, hasAccess } = useTenant();
  const [search, setSearch] = useState("");
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  // Selected Deal for Side Drawer
  const [selectedDeal, setSelectedDeal] = useState<CrmDeal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      if (selectedDeal && selectedDeal.id === draggedDealId) {
        setSelectedDeal({ ...selectedDeal, stage });
      }
    }
  };

  const handleOpenDrawer = (deal: CrmDeal) => {
    setSelectedDeal(deal);
    setDrawerOpen(true);
  };

  const handleUpdateStage = (dealId: string, stage: CrmStage) => {
    mockStore.updateDealStage(dealId, stage);
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal({ ...selectedDeal, stage });
    }
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newTitle) return;

    let contact = mockStore.getContacts(activeTenant.id).find(
      (c) => c.fullName.toLowerCase() === newClientName.toLowerCase()
    );
    if (!contact) {
      const [first, ...last] = newClientName.split(" ");
      contact = mockStore.createContact({
        id: `cnt-${Date.now()}`,
        tenantId: activeTenant.id,
        firstName: first,
        lastName: last.join(" ") || "",
        fullName: newClientName,
        phone: "+91 98000 00000",
        email: `${first.toLowerCase()}@example.com`,
        status: "LEAD",
        assignedPractitionerId: activeTenant.team?.[0]?.id || "staff-1",
        tags: [newSource],
        notesCount: 0,
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        city: activeTenant.city,
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
      stage: "NEW_ENQUIRY",
      value: parseInt(newValue) || 1500,
      priority: newPriority,
      source: newSource,
      assignedToStaffId: activeTenant.team?.[0]?.id || "staff-1",
      nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      notes: "Inbound interest submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setIsNewModalOpen(false);
    setNewClientName("");
    setNewTitle("");
  };

  return (
    <div className="space-y-4">
      {/* Leads Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Leads
            </h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {deals.length} In Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Prospective patient pipeline &amp; consultation qualification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-teal-600 bg-white text-slate-900 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* High-Density Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-6 min-h-[calc(100vh-220px)]">
        {STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
              className="w-64 shrink-0 flex flex-col bg-slate-100/70 border border-slate-200/80 rounded-lg p-2.5"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between px-1 mb-2 pb-1.5 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                  <span className="text-xs font-semibold text-slate-800">
                    {stage.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                  {stageDeals.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {stageDeals.map((deal) => {
                  const assignedStaff = activeTenant.team?.find(
                    (m) => m.id === deal.assignedToStaffId
                  ) || activeTenant.team?.[0];

                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal.id)}
                      onClick={() => handleOpenDrawer(deal)}
                      className="bg-white border border-slate-200 rounded-md p-3 hover:border-slate-300 hover:shadow-xs cursor-pointer transition-all space-y-2"
                    >
                      {/* Name & Priority */}
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 leading-tight">
                          {deal.contactName}
                        </span>
                        {deal.priority === "HIGH" && (
                          <span className="text-[9px] font-semibold uppercase px-1 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* Service */}
                      <p className="text-[11px] text-slate-600 leading-tight">
                        {deal.title}
                      </p>

                      {/* Source & Follow-up */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                        <span className="font-mono text-slate-500 uppercase px-1 py-0.2 rounded bg-slate-50 border border-slate-200">
                          {deal.source}
                        </span>
                        <span className="text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{deal.nextFollowUpDate || "Due soon"}</span>
                        </span>
                      </div>

                      {/* Assigned User Lockup */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span className="font-mono font-medium text-slate-700">
                          &#8377;{deal.value}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-slate-200 text-[9px] flex items-center justify-center font-medium text-slate-700">
                            {assignedStaff?.name.charAt(0) || "U"}
                          </div>
                          <span className="truncate max-w-[80px] text-[10px]">
                            {assignedStaff?.name.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageDeals.length === 0 && (
                  <div className="h-16 flex items-center justify-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-md">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-Over Side Drawer for Lead Details */}
      {drawerOpen && selectedDeal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {selectedDeal.source} Lead
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {selectedDeal.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 mt-1">
                    {selectedDeal.contactName}
                  </h2>
                  <p className="text-xs text-slate-500">{selectedDeal.title}</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stage Progressor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Move Pipeline Stage
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleUpdateStage(selectedDeal.id, s.id)}
                      className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition-colors ${
                        selectedDeal.stage === s.id
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Estimated Value</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    &#8377;{selectedDeal.value}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Next Follow-Up</span>
                  <span className="font-medium text-slate-800 font-mono">
                    {selectedDeal.nextFollowUpDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Staff</span>
                  <span className="font-medium text-slate-800">
                    {activeTenant.team?.find((m) => m.id === selectedDeal.assignedToStaffId)?.name || "Primary Clinician"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lead Priority</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDeal.priority}
                  </span>
                </div>
              </div>

              {/* Triage Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intake &amp; Conversation Notes
                </label>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-md border border-slate-200">
                  {selectedDeal.notes || "Inbound care inquiry received via digital channels."}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Link
                href={`/app/contacts/${selectedDeal.contactId}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open 360 Client Card</span>
              </Link>

              <Link
                href="/app/appointments"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Schedule Consultation</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">New Lead</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a prospective patient into the intake pipeline.
            </p>

            <form onSubmit={handleCreateDeal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Prospective Patient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Joshi"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Service / Condition of Interest
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cognitive Behavioral Therapy (Initial)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Channel Source
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    <option value="WEBSITE">Website Form</option>
                    <option value="WHATSAPP">WhatsApp Desk</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="REFERRAL">Doctor Referral</option>
                    <option value="WALK_IN">Walk-In</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Value (&#8377;)
                  </label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
