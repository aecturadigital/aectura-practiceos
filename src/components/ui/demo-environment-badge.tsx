"use client";

import React, { useState } from "react";
import { Info, RotateCcw } from "lucide-react";
import { useTenant } from "@/context/tenant-context";

export function DemoEnvironmentBadge() {
  const { resetDemoData } = useTenant();
  const [showTooltip, setShowTooltip] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    if (confirm("Reset local demo data back to clean seeds? All your test modifications will be refreshed.")) {
      setResetting(true);
      resetDemoData();
      setTimeout(() => setResetting(false), 500);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30 transition-colors hover:bg-amber-500/20"
        title="Demo Mode"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>Demo Environment</span>
        <Info className="w-3 h-3 text-amber-500/70" />
      </button>

      {/* Quick reset button */}
      <button
        onClick={handleReset}
        disabled={resetting}
        className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-700/60 hover:border-slate-600 bg-slate-900/60 flex items-center gap-1 transition-all"
        title="Reset demo data"
      >
        <RotateCcw className={`w-2.5 h-2.5 ${resetting ? "animate-spin" : ""}`} />
        <span>Reset Data</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-0 mt-1.5 w-64 p-2.5 bg-[#181A1D] text-slate-200 text-xs rounded-md shadow-xl border border-[#272A34] z-50 pointer-events-none">
          <p className="font-semibold text-white mb-1">Local Demo Environment</p>
          <p className="text-slate-400 leading-relaxed">
            Using local demonstration data with browser persistence. Production backend services (PostgreSQL, n8n, Cloudflare R2, WhatsApp Cloud API) are intentionally disconnected.
          </p>
        </div>
      )}
    </div>
  );
}
