"use client";

import React from "react";
import Link from "next/link";
import { Layers, Brain, Activity, Check, Plus, ArrowRight } from "lucide-react";
import { psychologyVertical } from "@/lib/verticals/psychology";
import { physiotherapyVertical } from "@/lib/verticals/physiotherapy";

export default function PlatformVerticalsPage() {
  const verticals = [psychologyVertical, physiotherapyVertical];

  const roadmapVerticals = [
    { name: "Dental & Orthodontics", desc: "Tooth charting, periodontal records, hygiene recall pipelines", badge: "Q4 2026" },
    { name: "Clinical Aesthetics & Dermatology", desc: "Before/after photo records, treatment consent, skin analysis", badge: "Q1 2027" },
    { name: "Nutrition & Dietetics", desc: "Meal planning, macro calculators, body composition logs", badge: "Q2 2027" },
    { name: "Legal & Professional Advisory", desc: "Matter management, retainer billing, document vault", badge: "Research" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#22252C] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Vertical Pack Architecture</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Specialized clinical terminology, dynamic intake questions, and domain modules decoupled from the core multi-tenant engine.
        </p>
      </div>

      {/* Active Verticals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {verticals.map((vert) => (
          <div
            key={vert.id}
            className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800 uppercase font-semibold">
                  {vert.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {vert.id}</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">{vert.displayName}</h2>
              <p className="text-xs text-slate-400 mb-6 italic">{vert.defaultBranding.tagline}</p>

              {/* Terminology mapping */}
              <div className="p-4 rounded-2xl bg-[#111315] border border-[#242833] mb-6">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Specialized Clinical Terminology
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Contact Singular:</span>
                    <span className="font-semibold text-teal-400">{vert.terminology.contactSingular}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Plural:</span>
                    <span className="font-semibold text-teal-400">{vert.terminology.contactPlural}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Practitioner:</span>
                    <span className="font-semibold text-white">{vert.terminology.practitionerTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Session Title:</span>
                    <span className="font-semibold text-white">{vert.terminology.sessionTitle}</span>
                  </div>
                </div>
              </div>

              {/* Intake fields preview */}
              <div className="space-y-2 mb-6">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Configured Intake Schemas
                </p>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {vert.intakeFields.map((field) => (
                    <div
                      key={field.id}
                      className="p-2 rounded-xl bg-[#121417] border border-[#22252C] flex items-center justify-between"
                    >
                      <span className="truncate pr-2">{field.label}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{field.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#242833] flex justify-between items-center text-xs">
              <span className="text-slate-400">{vert.templates.length} Templates Configured</span>
              <Link
                href="/platform/new"
                className="text-teal-400 font-semibold hover:text-teal-300 flex items-center gap-1"
              >
                <span>Deploy Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap Verticals */}
      <div className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8">
        <h2 className="text-base font-bold text-white mb-1">Architectural Roadmap (Future Verticals)</h2>
        <p className="text-xs text-slate-400 mb-6">
          Aectura&apos;s single-application core is built to support infinite professional domains without code forks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadmapVerticals.map((rv, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#111315] border border-[#242833] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-white text-xs">{rv.name}</h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {rv.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{rv.desc}</p>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-4 pt-2 border-t border-[#22252C]">
                Schema Ready
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
