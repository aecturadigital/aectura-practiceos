"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  Filter,
  Download,
  BarChart3,
  PieChart,
  UserCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";

export default function StaffAnalyticsPage() {
  const { activeTenant, vertical } = useTenant();
  const [dateRange, setDateRange] = useState("THIS_MONTH");

  const contacts = mockStore.getContacts(activeTenant.id);
  const appointments = mockStore.getAppointments(activeTenant.id);

  const completedAppts = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledAppts = appointments.filter((a) => a.status === "CANCELLED").length;
  const noShowAppts = appointments.filter((a) => a.status === "NO_SHOW").length;

  const monthlyRevenue = 342000;
  const projectedRevenue = 385000;

  // Monthly revenue chart points
  const revenuePoints = [
    { month: "Oct", revenue: 210, consultations: 88 },
    { month: "Nov", revenue: 245, consultations: 104 },
    { month: "Dec", revenue: 290, consultations: 118 },
    { month: "Jan", revenue: 275, consultations: 110 },
    { month: "Feb", revenue: 315, consultations: 132 },
    { month: "Mar", revenue: 342, consultations: 146 },
  ];

  const leadSources = [
    { source: "Google Business Profile", percentage: 46, count: 68, color: "bg-teal-500" },
    { source: "Direct Web Booking", percentage: 24, count: 35, color: "bg-sky-500" },
    { source: "Instagram & Social", percentage: 18, count: 26, color: "bg-purple-500" },
    { source: "Physician Referrals", percentage: 12, count: 18, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Practice Performance Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time consultation volumes, patient retention, acquisition channels, and provider capacity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="THIS_MONTH">This Month (March 2026)</option>
            <option value="LAST_MONTH">Last Month (February 2026)</option>
            <option value="LAST_90_DAYS">Last 90 Days</option>
            <option value="YTD">Year to Date (2026)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Revenue</span>
            <span className="flex items-center text-emerald-400 font-mono text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{monthlyRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500">
            Projected: ₹{projectedRevenue.toLocaleString("en-IN")} by month-end
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completed Visits</span>
            <span className="flex items-center text-emerald-400 font-mono text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.1%
            </span>
          </div>
          <div className="text-2xl font-bold text-teal-400 font-mono">
            {completedAppts + 130}
          </div>
          <p className="text-[11px] text-slate-500">94.2% session completion rate</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lead Conversion</span>
            <span className="flex items-center text-emerald-400 font-mono text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5" /> +5.8%
            </span>
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">72.4%</div>
          <p className="text-[11px] text-slate-500">Enquiry to confirmed first visit</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>No-Show Rate</span>
            <span className="flex items-center text-emerald-400 font-mono text-[11px]">
              -2.4%
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">3.8%</div>
          <p className="text-[11px] text-slate-500">Reduced by 24h WhatsApp reminders</p>
        </div>
      </div>

      {/* Main Revenue & Growth SVG Chart */}
      <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Revenue &amp; Consultation Trend</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly billed consultation income in Thousands (₹k) over the last 6 months.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span className="text-slate-300">Revenue (₹k)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-slate-300">Consultations</span>
            </div>
          </div>
        </div>

        {/* SVG Area Bar Visualizer */}
        <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-4 border-b border-[#222631]">
          {revenuePoints.map((pt, idx) => {
            const heightPct = (pt.revenue / 400) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-teal-300 bg-[#1A1D27] px-2 py-1 rounded border border-[#2C313E] -translate-y-1">
                  ₹{pt.revenue}k ({pt.consultations} visits)
                </div>

                <div className="w-full max-w-[48px] bg-[#1A1E29] group-hover:bg-[#202534] rounded-t-xl overflow-hidden flex flex-col justify-end transition-all relative">
                  <div
                    className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-xl transition-all duration-500"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>

                <span className="text-xs font-mono text-slate-400 group-hover:text-white transition-colors">
                  {pt.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Lead Sources & Provider Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Patient Acquisition Channels</h3>
              <p className="text-xs text-slate-400">Where new patient bookings originated</p>
            </div>
            <PieChart className="w-4 h-4 text-teal-400" />
          </div>

          <div className="space-y-4">
            {leadSources.map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">{item.source}</span>
                  <span className="text-white font-mono font-bold">
                    {item.percentage}% ({item.count} leads)
                  </span>
                </div>
                <div className="h-2 w-full bg-[#1A1D27] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Team Capacity */}
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Practitioner Utilization</h3>
              <p className="text-xs text-slate-400">Monthly consultation hours &amp; capacity</p>
            </div>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>

          <div className="space-y-3">
            {activeTenant.team.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-[#101217] border border-[#22252F] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-white">{member.name}</p>
                  <p className="text-[11px] text-slate-400">{member.title}</p>
                </div>

                <div className="text-right font-mono">
                  <span className="text-teal-400 font-bold block">88 hrs / mo</span>
                  <span className="text-[10px] text-slate-500">82% utilization</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
