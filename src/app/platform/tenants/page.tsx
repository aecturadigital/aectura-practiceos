"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  ExternalLink,
  ShieldCheck,
  Globe,
  Users,
  CreditCard,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { Tenant, TenantStatus, VerticalType, PlanId } from "@/types";

export default function TenantsDirectoryPage() {
  const { tenants, activeTenant, switchTenant } = useTenant();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [verticalFilter, setVerticalFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [planFilter, setPlanFilter] = useState<string>("ALL");

  const filteredTenants = tenants.filter((t) => {
    if (verticalFilter !== "ALL" && t.verticalId !== verticalFilter) return false;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (planFilter !== "ALL" && t.planId !== planFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: TenantStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ACTIVE
          </span>
        );
      case "PREVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            PREVIEW
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
            SUSPENDED
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 text-slate-400 border border-slate-700">
            ARCHIVED
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tenants Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and manage all registered healthcare practices, preview instances, and subscriptions.
          </p>
        </div>

        <Link
          href="/platform/new"
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Practice</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#16181D] border border-[#242833] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search practice name, city, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-600 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={verticalFilter}
            onChange={(e) => setVerticalFilter(e.target.value)}
            aria-label="Filter by vertical"
            className="bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Verticals</option>
            <option value="psychology">Psychology</option>
            <option value="physiotherapy">Physiotherapy</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PREVIEW">Preview</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            aria-label="Filter by plan"
            className="bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Plans</option>
            <option value="presence">Presence (₹999)</option>
            <option value="practiceflow">PracticeFlow (₹2,499)</option>
            <option value="practiceos_ai">PracticeOS AI (₹3,999)</option>
          </select>

          {/* Toggle View Mode */}
          <div className="flex items-center border border-[#2B2F3B] rounded-xl p-0.5 bg-[#111315]">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table" ? "bg-teal-950 text-teal-400" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid" ? "bg-teal-950 text-teal-400" : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {viewMode === "table" ? (
        <div className="bg-[#16181D] border border-[#242833] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#13151A] border-b border-[#242833] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Practice &amp; City</th>
                  <th className="py-3 px-4">Vertical</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Contacts</th>
                  <th className="py-3 px-4">MRR</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22252C]">
                {filteredTenants.map((t) => {
                  const mrr = t.planId === "presence" ? 999 : t.planId === "practiceflow" ? 2499 : 3999;
                  const isSelected = t.id === activeTenant.id;
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-[#1A1D24] transition-colors ${
                        isSelected ? "bg-teal-950/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <Link href={`/platform/tenants/${t.id}`} className="group flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                            style={{ backgroundColor: t.branding.primaryColor || "#0D9488" }}
                          >
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                              {t.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {t.city}, {t.state} &bull; <span className="font-mono text-slate-500">/{t.slug}</span>
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-[#1D2028] border border-[#2B2F3C] text-[11px]">
                          {t.verticalId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px] capitalize">
                          {t.planId.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(t.status)}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {t.team?.length || 1} Providers
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">20</td>
                      <td className="py-3.5 px-4 font-semibold text-teal-400 font-mono">
                        ₹{mrr.toLocaleString("en-IN")}/mo
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => switchTenant(t.id)}
                            className="px-2.5 py-1 rounded bg-[#20242E] hover:bg-teal-900/40 text-slate-200 hover:text-teal-300 text-xs font-medium border border-[#2B303D] transition-colors"
                          >
                            {isSelected ? "Active" : "Select"}
                          </button>
                          <Link
                            href={`/platform/tenants/${t.id}`}
                            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Tenant Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((t) => {
            const mrr = t.planId === "presence" ? 999 : t.planId === "practiceflow" ? 2499 : 3999;
            const isSelected = t.id === activeTenant.id;
            return (
              <div
                key={t.id}
                className={`bg-[#16181D] border rounded-2xl p-5 hover:border-[#2F3543] transition-all flex flex-col justify-between ${
                  isSelected ? "border-teal-800/80 shadow-md bg-[#181B21]" : "border-[#242833]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm"
                      style={{ backgroundColor: t.branding.primaryColor || "#0D9488" }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    {getStatusBadge(t.status)}
                  </div>

                  <h3 className="font-bold text-white text-base mb-1">{t.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{t.branding.tagline}</p>

                  <div className="space-y-1.5 text-xs text-slate-300 py-3 border-y border-[#242833] my-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vertical:</span>
                      <span className="font-medium capitalize text-white">{t.verticalId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-white">{t.city}, {t.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Plan:</span>
                      <span className="font-mono text-teal-400 capitalize">{t.planId.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MRR:</span>
                      <span className="font-mono text-white font-semibold">₹{mrr.toLocaleString("en-IN")}/mo</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/platform/tenants/${t.id}`}
                    className="flex-1 text-center py-2 text-xs font-semibold rounded-xl bg-[#20242E] hover:bg-[#2B303D] text-slate-200 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/preview/${t.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-800/60 transition-colors"
                    title="Public Site Preview"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => switchTenant(t.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      isSelected
                        ? "bg-teal-700 text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {isSelected ? "Active" : "Select"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
