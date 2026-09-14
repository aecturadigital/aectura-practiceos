"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Layers,
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
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Lock,
  Search,
  Building2,
  CreditCard,
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

  // Primary Navigation (Clean nouns)
  const primaryNavItems: Array<{
    label: string;
    href: string;
    icon: any;
    feature?: FeatureKey;
    badge?: string;
  }> = [
    { label: "Home", href: "/app", icon: LayoutDashboard },
    {
      label: vertical.terminology.contactPlural,
      href: "/app/contacts",
      icon: Users,
      feature: "contacts",
    },
    {
      label: "Calendar",
      href: "/app/appointments",
      icon: Calendar,
      feature: "booking",
    },
    {
      label: "Leads",
      href: "/app/crm",
      icon: Layers,
      feature: "crm",
    },
    {
      label: "Inbox",
      href: "/app/inbox",
      icon: Inbox,
      feature: "whatsapp",
      badge: "2",
    },
    {
      label: "Billing",
      href: "/app/billing",
      icon: CreditCard,
      feature: "payments",
    },
  ];

  // Secondary Tools under "More"
  const moreNavItems: Array<{
    label: string;
    href: string;
    icon: any;
    feature?: FeatureKey;
  }> = [
    { label: "Forms", href: "/app/forms", icon: FileCheck, feature: "forms" },
    { label: "Website", href: "/app/website", icon: Globe, feature: "website" },
    { label: "Reviews", href: "/app/reviews", icon: Star, feature: "reviews" },
    { label: "AI Receptionist", href: "/app/ai", icon: Sparkles, feature: "ai" },
    { label: "Knowledge", href: "/app/knowledge", icon: BookOpen, feature: "knowledge_base" },
    { label: "Automations", href: "/app/automations", icon: Zap, feature: "automations" },
    { label: "Reports", href: "/app/analytics", icon: BarChart3, feature: "analytics" },
    { label: "Team", href: "/app/team", icon: UserCheck },
    { label: "Files", href: "/app/files", icon: HardDrive },
  ];

  // Auto-expand "More" if the active route is inside it
  const isMoreActive = moreNavItems.some(
    (item) => pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
  );
  const [moreExpanded, setMoreExpanded] = useState(isMoreActive);

  useEffect(() => {
    if (isMoreActive) setMoreExpanded(true);
  }, [isMoreActive]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Clinic Branding Lockup */}
          <Link href="/app" className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center font-semibold text-white text-xs shrink-0"
              style={{ backgroundColor: activeTenant.branding.primaryColor || "#0D9488" }}
            >
              {activeTenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-900 truncate max-w-[140px] sm:max-w-[200px]">
                  {activeTenant.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium capitalize">
                  {activeTenant.verticalId}
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          {/* Demo Environment Badge */}
          <div className="hidden sm:block">
            <DemoEnvironmentBadge />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tenant Switcher dropdown */}
          <div className="hidden md:block">
            <TenantSwitcher />
          </div>

          {/* Public Preview Button */}
          <Link
            href={`/preview/${activeTenant.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Open Public Practice Website"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          {/* Patient Portal Link */}
          <Link
            href="/portal"
            target="_blank"
            className="hidden xl:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Open Patient Portal View"
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Patient Portal</span>
          </Link>

          {/* Global Search Shortcut Trigger */}
          <button
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              });
              window.dispatchEvent(event);
            }}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-500 text-xs hover:border-slate-300 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Search</span>
            <kbd className="text-[10px] bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Notification Center */}
          <NotificationDrawer />

          {/* Staff User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-medium text-teal-700 text-xs overflow-hidden">
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
              <p className="text-xs font-medium text-slate-900 leading-tight">
                {primaryPractitioner.name}
              </p>
              <p className="text-[11px] text-slate-500 leading-none truncate max-w-[120px]">
                {primaryPractitioner.title}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop & Mobile Staff Sidebar */}
        <aside
          className={`${
            mobileOpen ? "block fixed inset-y-14 left-0 z-30" : "hidden"
          } lg:block w-[232px] shrink-0 border-r border-slate-200 bg-white p-3 flex flex-col justify-between overflow-y-auto`}
        >
          <div className="space-y-4">
            {/* Primary Navigation */}
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-2.5 mb-1.5">
                Practice
              </p>
              <nav className="space-y-0.5">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isLocked = item.feature && !hasAccess(item.feature);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-teal-50 text-teal-800 font-semibold"
                          : isLocked
                          ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? "text-teal-600"
                              : isLocked
                              ? "text-slate-300"
                              : "text-slate-400"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {isLocked ? (
                        <Lock className="w-3 h-3 text-slate-400" />
                      ) : item.badge ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* "More" Collapsible Tools */}
            <div>
              <button
                onClick={() => setMoreExpanded(!moreExpanded)}
                className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 uppercase tracking-wider transition-colors rounded"
              >
                <span>More Tools</span>
                {moreExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {moreExpanded && (
                <nav className="mt-1 space-y-0.5">
                  {moreNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isLocked = item.feature && !hasAccess(item.feature);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-teal-50 text-teal-800 font-semibold"
                            : isLocked
                            ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive
                                ? "text-teal-600"
                                : isLocked
                                ? "text-slate-300"
                                : "text-slate-400"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
          </div>

          {/* Bottom Settings & Platform */}
          <div className="pt-3 border-t border-slate-200 space-y-1">
            <Link
              href="/app/settings"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                pathname.startsWith("/app/settings")
                  ? "bg-teal-50 text-teal-800 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </div>
            </Link>

            <Link
              href="/platform"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Platform OS</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Admin</span>
            </Link>
          </div>
        </aside>

        {/* Content Area with Standard 24–32px Padding & Warm Neutral Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
