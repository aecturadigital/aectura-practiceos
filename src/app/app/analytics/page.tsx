"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Calendar,
  Users,
  Activity,
  BarChart3,
  PieChart,
  UserCheck,
  Clock,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";

export default function StaffAnalyticsPage() {
  const { activeTenant } = useTenant();
  const [dateRange, setDateRange] = useState("THIS_MONTH");

  const contacts = mockStore.getContacts(activeTenant.id);
  const appointments = mockStore.getAppointments(activeTenant.id);

  const completedAppts = appointments.filter((a) => a.status === "COMPLETED").length;
  const confirmedAppts = appointments.filter((a) => a.status === "CONFIRMED").length;

  const leadSources = [
    { source: "Google Business Profile", percentage: 46, count: 68 },
    { source: "Direct Web Booking", percentage: 24, count: 35 },
    { source: "Doctor Referrals", percentage: 18, count: 26 },
    { source: "WhatsApp & Word-of-Mouth", percentage: 12, count: 18 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational summaries, appointment completion metrics, and patient acquisition sources
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700"
          >
            <option value="THIS_MONTH">This Month (September 2026)</option>
            <option value="LAST_MONTH">August 2026</option>
            <option value="Q3_2026">Q3 2026</option>
          </select>
        </div>
      </div>

      {/* Operational Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Consultations</span>
          <span className="text-2xl font-semibold text-slate-900 font-mono">146</span>
          <p className="text-xs text-slate-400 mt-1">This month</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <span className="text-xs font-medium text-slate-500 block mb-1">Attendance Rate</span>
          <span className="text-2xl font-semibold text-emerald-700 font-mono">92.4%</span>
          <p className="text-xs text-emerald-700 font-medium mt-1">4.1% low no-show</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <span className="text-xs font-medium text-slate-500 block mb-1">New Patients</span>
          <span className="text-2xl font-semibold text-slate-900 font-mono">{contacts.length}</span>
          <p className="text-xs text-slate-400 mt-1">Active client records</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <span className="text-xs font-medium text-slate-500 block mb-1">Consultation Revenue</span>
          <span className="text-2xl font-semibold text-slate-900 font-mono">&#8377;3,42,000</span>
          <p className="text-xs text-slate-400 mt-1">Standard clinical billing</p>
        </div>
      </div>

      {/* Sources & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acquisition Sources */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Patient Ingestion Channels</h2>
          <div className="space-y-3">
            {leadSources.map((ls) => (
              <div key={ls.source} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{ls.source}</span>
                  <span className="text-slate-500 font-mono">{ls.percentage}% ({ls.count})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${ls.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-none space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Attendance &amp; Schedule Distribution</h2>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Completed Sessions</span>
              <span className="font-semibold text-slate-900 font-mono">132 (90.4%)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Confirmed / Scheduled</span>
              <span className="font-semibold text-teal-700 font-mono">{confirmedAppts}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Rescheduled Slots</span>
              <span className="font-semibold text-indigo-700 font-mono">8 (5.5%)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">No Show / Cancelled</span>
              <span className="font-semibold text-rose-700 font-mono">6 (4.1%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
