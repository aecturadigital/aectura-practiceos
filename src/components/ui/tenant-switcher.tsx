"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Building2, Plus, Sparkles } from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import Link from "next/link";

export function TenantSwitcher() {
  const { activeTenant, tenants, switchTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#272A34] bg-[#16181D] hover:bg-[#1E2127] text-left transition-all max-w-[240px]"
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: activeTenant.branding.primaryColor || "#0D9488" }}
        >
          {activeTenant.name.charAt(0)}
        </div>
        <div className="overflow-hidden min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate leading-tight">
            {activeTenant.name}
          </p>
          <p className="text-[10px] text-slate-400 capitalize truncate">
            {activeTenant.verticalId} &bull; {activeTenant.city}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 p-1.5 bg-[#16181D] border border-[#272A34] rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-[#272A34]/70 mb-1">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Switch Healthcare Practice
            </p>
          </div>

          <div className="space-y-0.5 max-h-60 overflow-y-auto">
            {tenants.map((t) => {
              const isActive = t.id === activeTenant.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    switchTenant(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                    isActive ? "bg-teal-950/40 text-teal-300 border border-teal-800/40" : "hover:bg-[#1F232B] text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: t.branding.primaryColor || "#0D9488" }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-white truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {t.verticalId} &bull; {t.planId.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-teal-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 mt-1 border-t border-[#272A34]/70">
            <Link
              href="/platform/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-950/30 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Practice...</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
