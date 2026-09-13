"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Calendar,
  PlusCircle,
  Inbox,
  Settings,
  Building2,
  X,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { activeTenant, tenants, switchTenant, vertical } = useTenant();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    {
      id: "contacts",
      title: `View All ${vertical.terminology.contactPlural}`,
      category: "Navigation",
      icon: Users,
      action: () => {
        router.push("/app/contacts");
        setIsOpen(false);
      },
    },
    {
      id: "calendar",
      title: "Appointments Calendar",
      category: "Navigation",
      icon: Calendar,
      action: () => {
        router.push("/app/appointments");
        setIsOpen(false);
      },
    },
    {
      id: "crm",
      title: "CRM Pipeline & Deal Flow",
      category: "Navigation",
      icon: FileText,
      action: () => {
        router.push("/app/crm");
        setIsOpen(false);
      },
    },
    {
      id: "inbox",
      title: "Unified Team Inbox",
      category: "Navigation",
      icon: Inbox,
      action: () => {
        router.push("/app/inbox");
        setIsOpen(false);
      },
    },
    {
      id: "ai",
      title: "AI Receptionist Console",
      category: "AI",
      icon: Sparkles,
      action: () => {
        router.push("/app/ai");
        setIsOpen(false);
      },
    },
    {
      id: "superadmin",
      title: "Open Super Admin Platform",
      category: "Platform",
      icon: Building2,
      action: () => {
        router.push("/platform");
        setIsOpen(false);
      },
    },
    {
      id: "public_preview",
      title: `View Public Website (${activeTenant.name})`,
      category: "Preview",
      icon: ArrowRight,
      action: () => {
        window.open(`/preview/${activeTenant.slug}`, "_blank");
        setIsOpen(false);
      },
    },
    {
      id: "settings",
      title: "Practice Settings & Policies",
      category: "Settings",
      icon: Settings,
      action: () => {
        router.push("/app/settings");
        setIsOpen(false);
      },
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="bg-[#16181D] border border-[#272A34] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#272A34]">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type a command, jump to page, or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="bg-transparent text-white text-sm focus:outline-none w-full placeholder-slate-500"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase px-3 py-1 tracking-wider">
            Quick Actions
          </p>
          {filteredActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.action}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm text-slate-200 hover:bg-[#1F232B] hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-teal-400 group-hover:border-teal-700/50">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{act.title}</span>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
                  {act.category}
                </span>
              </button>
            );
          })}

          {filteredActions.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No matching commands or actions found.
            </div>
          )}

          {/* Practice Switcher inside palette */}
          <div className="pt-2 border-t border-[#272A34] mt-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase px-3 py-1 tracking-wider">
              Switch Practice Context
            </p>
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  switchTenant(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs ${
                  t.id === activeTenant.id
                    ? "bg-teal-950/40 text-teal-300 font-medium"
                    : "text-slate-400 hover:bg-[#1F232B] hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded text-[9px] flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: t.branding.primaryColor || "#0D9488" }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <span>{t.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 capitalize">{t.verticalId}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#272A34] bg-[#111315] flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigation Shortcuts</span>
          <div className="flex items-center gap-2">
            <span>Esc to close</span>
            <span>&bull;</span>
            <span>Cmd+K / Ctrl+K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
