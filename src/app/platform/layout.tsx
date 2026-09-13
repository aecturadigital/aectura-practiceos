"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Layers,
  Sparkles,
  CreditCard,
  HardDrive,
  Activity,
  ShieldAlert,
  Settings,
  PlusCircle,
  Search,
  ExternalLink,
  Menu,
  X,
  Stethoscope,
  Globe,
  Radio,
} from "lucide-react";
import { TenantSwitcher } from "@/components/ui/tenant-switcher";
import { DemoEnvironmentBadge } from "@/components/ui/demo-environment-badge";
import { NotificationDrawer } from "@/components/ui/notification-drawer";
import { useTenant } from "@/context/tenant-context";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeTenant } = useTenant();

  const navItems = [
    { label: "Overview", href: "/platform", icon: LayoutDashboard },
    { label: "Tenants Directory", href: "/platform/tenants", icon: Building2 },
    { label: "Create Practice", href: "/platform/new", icon: PlusCircle, badge: "Wizard" },
    { label: "Plans & Pricing", href: "/platform/plans", icon: CreditCard },
    { label: "Vertical Packs", href: "/platform/verticals", icon: Layers },
    { label: "System Health", href: "/platform/health", icon: Activity, badge: "Demo" },
    { label: "Audit Logs", href: "/platform/audit", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#111315] text-slate-100 flex flex-col">
      {/* Platform Topbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#22252C] bg-[#16181D]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg border border-[#272A34] text-slate-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/platform" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center font-black text-white text-sm shadow-md">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-wider text-sm text-white">AECTURA</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800 font-mono">
                  PLATFORM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-none">Super Admin OS</p>
            </div>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-[#272A34]" />

          {/* Demo Environment Badge */}
          <div className="hidden sm:block">
            <DemoEnvironmentBadge />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Practice Switcher */}
          <div className="hidden md:block">
            <TenantSwitcher />
          </div>

          {/* Jump to Tenant Staff App */}
          <Link
            href="/app"
            className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1F232B] hover:bg-[#282C36] text-slate-200 border border-[#2B2F3B] transition-colors"
            title="Open Staff Dashboard for active practice"
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>Open Staff App</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </Link>

          {/* Jump to Public Preview */}
          <Link
            href={`/preview/${activeTenant.slug}`}
            target="_blank"
            className="hidden xl:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-950/40 hover:bg-teal-900/40 text-teal-300 border border-teal-800/40 transition-colors"
            title="Open Public Website Preview"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          {/* Search helper */}
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
            <span>Search</span>
            <kbd className="text-[10px] bg-[#1E2127] border border-[#2E333D] px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <NotificationDrawer />

          {/* Super Admin Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#272A34]">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400">
              SA
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">Super Admin</p>
              <p className="text-[10px] text-teal-400">Master Root</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            mobileOpen ? "block" : "hidden"
          } lg:block w-64 shrink-0 border-r border-[#22252C] bg-[#14161A] p-4 flex flex-col justify-between overflow-y-auto`}
        >
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Platform Navigation
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-teal-950/60 text-teal-300 border border-teal-800/50 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#1B1E24]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Switch active tenant in sidebar for mobile */}
            <div className="lg:hidden pt-4 border-t border-[#272A34]">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Active Tenant Context
              </p>
              <TenantSwitcher />
            </div>

            {/* Quick Live Preview card */}
            <div className="p-3.5 rounded-xl border border-[#272A34] bg-[#181B21]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-white">Active Tenant</span>
                <span className="text-[10px] font-mono text-teal-400 uppercase">
                  {activeTenant.verticalId}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate mb-2">{activeTenant.name}</p>
              <div className="flex items-center gap-2">
                <Link
                  href="/app"
                  className="flex-1 text-center py-1.5 text-[11px] font-semibold rounded bg-[#222630] hover:bg-[#2B303D] text-slate-200 transition-colors"
                >
                  Staff App
                </Link>
                <Link
                  href={`/preview/${activeTenant.slug}`}
                  target="_blank"
                  className="flex-1 text-center py-1.5 text-[11px] font-semibold rounded bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-800/60 transition-colors"
                >
                  Site
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#22252C] text-slate-500 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform v1.0</span>
            </span>
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Marketing Site &rarr;
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#111315] p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
