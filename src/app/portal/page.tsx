"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageSquare,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  CheckCircle2,
  FileCheck,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Appointment } from "@/types";

export default function PatientPortalDashboardPage() {
  const { activeTenant, vertical } = useTenant();

  // Connected patient
  const contacts = mockStore.getContacts(activeTenant.id);
  const patient = contacts[0] || {
    id: "cnt-1",
    firstName: "Priya",
    fullName: "Priya Sharma",
  };

  // Connected appointments
  const appointments = mockStore.getAppointments(activeTenant.id).filter((a) => a.contactId === patient.id);
  const nextAppointment = appointments.find((a) => a.status === "CONFIRMED") || appointments[0];

  // Exercises if physio
  const exercises = mockStore.getExercises(activeTenant.id, patient.id);
  const completedExercises = exercises.filter((e) => e.completedToday).length;

  const isPhysio = activeTenant.verticalId === "physiotherapy";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#16181F] to-[#141824] border border-[#272B38] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800">
                Patient Portal
              </span>
              <span className="text-xs text-slate-400">{activeTenant.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Hello, {patient.firstName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Access your personalized clinical records, appointment dates, home exercises, and message your care team.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/messages"
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message Practice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Next Appointment Card (Section 29) */}
      <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>Next Scheduled Session</span>
          </h2>
          <span className="text-xs text-teal-400 font-semibold font-mono">
            Status: {nextAppointment?.status || "Confirmed"}
          </span>
        </div>

        {nextAppointment ? (
          <div className="p-5 rounded-2xl bg-[#101216] border border-[#22252C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white font-mono">
                  {nextAppointment.date}
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-xl font-bold text-teal-400 font-mono">
                  {nextAppointment.startTime}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-200">
                {nextAppointment.serviceName}
              </p>
              <p className="text-xs text-slate-400">
                With {nextAppointment.staffName} &bull; {nextAppointment.location}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/portal/appointments"
                className="px-4 py-2 rounded-xl bg-[#1C1F28] hover:bg-[#252A36] text-slate-200 text-xs font-semibold border border-[#282D3B] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span>Reschedule</span>
              </Link>

              <Link
                href="/portal/messages"
                className="px-4 py-2 rounded-xl bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-800/60 transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4">No upcoming sessions currently scheduled.</p>
        )}
      </div>

      {/* Physiotherapy Exercise Card (Section 32) */}
      {isPhysio && (
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-bold text-white">Daily Rehabilitation Programme</h2>
            </div>
            <Link
              href="/portal/exercises"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>View All ({exercises.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Assigned home mobility and strengthening protocol. Complete today&apos;s exercises to maintain recovery trajectory.
          </p>

          {/* Progress Bar */}
          <div className="p-4 rounded-2xl bg-[#101216] border border-[#22252C] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Today&apos;s Adherence:</span>
              <span className="text-sky-400 font-mono font-bold">
                {completedExercises} of {exercises.length} exercises complete
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{
                  width: `${exercises.length > 0 ? (completedExercises / exercises.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <Link
          href="/portal/appointments"
          className="p-5 rounded-2xl bg-[#14161B] border border-[#232630] hover:border-slate-600 transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">
            All Appointments
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            View history of past consultations, upcoming sessions, and self-reschedule.
          </p>
        </Link>

        <Link
          href="/portal/messages"
          className="p-5 rounded-2xl bg-[#14161B] border border-[#232630] hover:border-slate-600 transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">
            Care Team Chat
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Securely message your doctor or receptionist directly from your portal.
          </p>
        </Link>

        <Link
          href="/portal/forms"
          className="p-5 rounded-2xl bg-[#14161B] border border-[#232630] hover:border-slate-600 transition-all space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">
            Clinical Intake &amp; Consent
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Review completed intake questionnaires, medical disclosures, and policies.
          </p>
        </Link>
      </div>
    </div>
  );
}
