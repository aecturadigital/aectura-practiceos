"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Inbox,
  FileCheck,
  Globe,
  Star,
  Zap,
  BarChart3,
  HardDrive,
  UserCheck,
  Settings,
  Sparkles,
  BookOpen,
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
  Lock,
  Search,
  Building2,
  Stethoscope,
  Radio,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { TenantSwitcher } from "@/components/ui/tenant-switcher";
import { DemoEnvironmentBadge } from "@/components/ui/demo-environment-badge";
import { NotificationDrawer } from "@/components/ui/notification-drawer";
import { FeatureKey } from "@/lib/plans";

export default function StaffAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeTenant, vertical, plan, hasAccess } = useTenant();

  // Primary Staff Practitioner
  const primaryPractitioner = activeTenant.team?.find(
    (m) => m.role === "OWNER" || m.role === "PRACTITIONER"
  ) || activeTenant.team?.[0] || {
    name: "Dr. Clinician",
    title: "Lead Practitioner",
    avatarUrl: "",
  };

  const navGroups: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
      icon: any;
      feature?: FeatureKey;
      badge?: string;
    }>;
  }> = [
    {
      title: "Clinic Operations",
      items: [
        { label: "Dashboard", href: "/app", icon: LayoutDashboard },
        {
          label: vertical.terminology.contactPlural,
          href: "/app/contacts",
          icon: Users,
          feature: "contacts",
        },
        {
          label: "CRM Pipeline",
          href: "/app/crm",
          icon: FileText,
          feature: "crm",
        },
        {
          label: "Appointments",
          href: "/app/appointments",
          icon: Calendar,
          feature: "booking",
        },
        {
          label: "Unified Inbox",
          href: "/app/inbox",
          icon: Inbox,
          feature: "whatsapp",
          badge: "2",
        },
        {
          label: "Forms & Intakes",
          href: "/app/forms",
          icon: FileCheck,
          feature: "forms",
        },
        {
          label: "Website Builder",
          href: "/app/website",
          icon: Globe,
          feature: "website",
        },
        {
          label: "Reviews",
          href: "/app/reviews",
          icon: Star,
          feature: "reviews",
        },
      ],
    },
    {
      title: "Practice Intelligence",
      items: [
        {
          label: "AI Receptionist",
          href: "/app/ai",
          icon: Sparkles,
          feature: "ai",
          badge: "Maya",
        },
        {
          label: "Knowledge Base",
          href: "/app/knowledge",
          icon: BookOpen,
          feature: "knowledge_base",
        },
        {
          label: "Automations",
          href: "/app/automations",
          icon: Zap,
          feature: "automations",
        },
        {
          label: "Analytics",
          href: "/app/analytics",
          icon: BarChart3,
          feature: "analytics",
        },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Team Roster", href: "/app/team", icon: UserCheck },
        { label: "Media & Files", href: "/app/files", icon: HardDrive },
        { label: "Integrations", href: "/app/integrations", icon: Radio },
        { label: "Practice Settings", href: "/app/settings", icon: Settings },
        { label: "Audit Log", href: "/app/audit", icon: ShieldAlert },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#111315] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#22252C] bg-[#16181D]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg border border-[#272A34] text-slate-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Practice Branding Lockup */}
          <Link href="/app" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0"
              style={{ backgroundColor: activeTenant.branding.primaryColor || "#0D9488" }}
            >
              {activeTenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {activeTenant.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800 font-mono capitalize">
                  {activeTenant.verticalId}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {plan.name} Tier
              </p>
            </div>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-[#272A34]" />

          {/* Demo Mode Badge */}
          <div className="hidden sm:block">
            <DemoEnvironmentBadge />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tenant Switcher dropdown */}
          <div className="hidden md:block">
            <TenantSwitcher />
          </div>

          {/* Public Preview Button */}
          <Link
            href={`/preview/${activeTenant.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-950/50 hover:bg-teal-900/50 text-teal-300 border border-teal-800/50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Client Portal Link */}
          <Link
            href="/portal"
            target="_blank"
            className="hidden xl:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1F232B] hover:bg-[#282C36] text-slate-200 border border-[#2B2F3B] transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>Patient Portal</span>
          </Link>

          {/* Search Trigger */}
          <button
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              });
              window.dispatchEvent(event);
            }}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#272A34] bg-[#121417] text-slate-400 text-xs hover:border-slate-600 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="text-[10px] bg-[#1E2127] border border-[#2E333D] px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <NotificationDrawer />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#272A34]">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs overflow-hidden">
              {primaryPractitioner.avatarUrl ? (
                <img
                  src={primaryPractitioner.avatarUrl}
                  alt={primaryPractitioner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                primaryPractitioner.name.charAt(0)
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">
                {primaryPractitioner.name}
              </p>
              <p className="text-[10px] text-teal-400 leading-none truncate max-w-[120px]">
                {primaryPractitioner.title}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Staff App Sidebar */}
        <aside
          className={`${
            mobileOpen ? "block" : "hidden"
          } lg:block w-64 shrink-0 border-r border-[#22252C] bg-[#14161A] p-4 flex flex-col justify-between overflow-y-auto`}
        >
          <div className="space-y-6">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                  {group.title}
                </p>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isLocked = item.feature && !hasAccess(item.feature);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-teal-950/60 text-teal-300 border border-teal-800/50 shadow-sm"
                            : isLocked
                            ? "text-slate-500 hover:text-slate-400 hover:bg-[#181A20]"
                            : "text-slate-400 hover:text-slate-200 hover:bg-[#1B1E24]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive
                                ? "text-teal-400"
                                : isLocked
                                ? "text-slate-600"
                                : "text-slate-400"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        {isLocked ? (
                          <Lock className="w-3 h-3 text-amber-500/80" />
                        ) : item.badge ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom Switcher and Platform Link */}
          <div className="pt-4 border-t border-[#22252C] space-y-3">
            <Link
              href="/platform"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-[#1C1F26] hover:bg-[#252933] text-teal-400 border border-[#2B2F3C] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Super Admin OS</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">/platform</span>
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#111315] p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
