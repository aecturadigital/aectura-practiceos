"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  MessageSquare,
  Activity,
  FileCheck,
  CreditCard,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Menu,
  X,
  Dumbbell,
  Clock,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { DemoEnvironmentBadge } from "@/components/ui/demo-environment-badge";

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeTenant, vertical } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authenticated Demo Patient
  const contacts = mockStore.getContacts(activeTenant.id);
  const demoPatient = contacts[0] || {
    fullName: "Priya Sharma",
    firstName: "Priya",
    email: "priya.sharma91@gmail.com",
    phone: "+91 98261 44521",
  };

  const isPhysio = activeTenant.verticalId === "physiotherapy";

  const navLinks = [
    { label: "Dashboard", href: "/portal", icon: Activity },
    { label: "Appointments", href: "/portal/appointments", icon: Calendar },
    { label: "Messages", href: "/portal/messages", icon: MessageSquare },
    ...(isPhysio ? [{ label: "Exercise Programme", href: "/portal/exercises", icon: Dumbbell, badge: "Daily" }] : []),
    { label: "Intake & Forms", href: "/portal/forms", icon: FileCheck },
    { label: "Billing & Receipts", href: "/portal/billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#0E1012] text-slate-100 flex flex-col font-sans">
      {/* Top Patient Bar */}
      <header className="sticky top-0 z-40 h-16 bg-[#14161B]/95 backdrop-blur-md border-b border-[#232630] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-[#272A34] text-slate-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/portal" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm"
              style={{ backgroundColor: activeTenant.branding.primaryColor || "#0D9488" }}
            >
              {activeTenant.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-sm text-white block leading-tight">
                {activeTenant.name}
              </span>
              <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase block">
                Patient Health Portal
              </span>
            </div>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-[#272A34]" />

          <div className="hidden sm:block">
            <DemoEnvironmentBadge />
          </div>
        </div>

        {/* Patient Profile & Staff Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1F232B] hover:bg-[#282C37] text-slate-200 border border-[#2A2E3B] transition-colors"
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>Staff App</span>
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-[#272A34]">
            <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-800 flex items-center justify-center font-bold text-teal-400 text-xs">
              {demoPatient.firstName?.charAt(0) || "P"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">{demoPatient.fullName}</p>
              <p className="text-[10px] text-slate-400 font-mono">Patient Account</p>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-8 gap-8 overflow-hidden">
        {/* Portal Navigation Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } md:block w-64 shrink-0 space-y-4`}
        >
          <div className="bg-[#14161B] border border-[#232630] rounded-2xl p-4 space-y-1 shadow-sm">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Patient Care Hub
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-teal-950/60 text-teal-300 border border-teal-800/50 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1B1E26]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#14161B] border border-[#232630] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">Encrypted Health Record</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Your clinical notes and intake questionnaires are confidential and accessible only to your healthcare providers.
            </p>
          </div>
        </aside>

        {/* Portal Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
