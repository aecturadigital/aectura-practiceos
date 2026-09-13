"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Play,
  Settings,
  Layers,
  Activity,
  Code2,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { AutomationRecipe } from "@/types";

export default function StaffAutomationsPage() {
  const { activeTenant } = useTenant();
  const [recipes, setRecipes] = useState<AutomationRecipe[]>([]);
  const [testPayloadModal, setTestPayloadModal] = useState<AutomationRecipe | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  const loadData = () => {
    setRecipes(mockStore.getAutomations(activeTenant.id));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = mockStore.subscribe(loadData);
    return () => unsubscribe();
  }, [activeTenant.id]);

  const handleToggle = (id: string) => {
    mockStore.toggleAutomation(id);
  };

  const handleRunTest = (recipe: AutomationRecipe) => {
    setTestPayloadModal(recipe);
    setTestSuccess(false);
    setTimeout(() => {
      setTestSuccess(true);
    }, 800);
  };

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Workflow Engine &amp; Event Webhooks</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Automation Recipes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Event-driven triggers connecting appointment state changes, intake completions, and patient messages to external delivery services.
          </p>
        </div>

        {/* n8n Status Badge */}
        <div className="p-3.5 rounded-2xl bg-[#101217] border border-[#232630] flex items-center gap-3 self-start sm:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Workflow Engine
            </span>
            <span className="text-xs font-bold text-white block">
              n8n Event Webhooks (Simulated)
            </span>
          </div>
        </div>
      </div>

      {/* Architecture Disclaimer Alert */}
      <div className="p-5 rounded-3xl bg-[#14161B] border border-[#232630] flex items-start gap-3.5 text-xs">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-white">Clean State Separation Architecture</h3>
          <p className="text-slate-400 leading-relaxed">
            In Aectura PracticeOS, transactional state (appointments, patient cards, clinic notes) is stored securely in your primary PostgreSQL database. Outbound communications (WhatsApp sequences, SMS alerts, review invites) are triggered asynchronously via HMAC-signed webhook payloads dispatched to your dedicated n8n automation runner.
          </p>
        </div>
      </div>

      {/* Recipes List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Configured Recipes ({recipes.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                recipe.isEnabled
                  ? "bg-[#14161B] border-[#232630] hover:border-slate-600"
                  : "bg-[#101216]/60 border-[#1E212A] opacity-75"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1C1F28] text-teal-400 border border-[#2A2E3B]">
                    Event: {recipe.trigger}
                  </span>

                  <button
                    onClick={() => handleToggle(recipe.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      recipe.isEnabled
                        ? "bg-teal-950 text-teal-300 border-teal-800 hover:bg-teal-900"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {recipe.isEnabled ? "Active" : "Disabled"}
                  </button>
                </div>

                <h3 className="text-base font-bold text-white">{recipe.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {recipe.description || recipe.actions.join(" • ")}
                </p>
              </div>

              <div className="pt-3 border-t border-[#20232C] space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Channel: {recipe.channel || "WhatsApp / Webhook"}</span>
                  {recipe.delayMinutes ? (
                    <span>Delay: {recipe.delayMinutes} mins</span>
                  ) : (
                    <span>Trigger: Instant</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Total Dispatched: 142 events</span>
                  </div>

                  <button
                    onClick={() => handleRunTest(recipe)}
                    className="px-3 py-1.5 rounded-xl bg-[#1B1E28] hover:bg-[#252A36] text-slate-200 text-xs font-semibold border border-[#2A2E3B] transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 text-teal-400" />
                    <span>Test Webhook</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Webhook Payload Modal */}
      {testPayloadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Webhook Payload Simulator</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{testPayloadModal.trigger}</p>
                </div>
              </div>
              <button
                onClick={() => setTestPayloadModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Endpoint:</span>
                <span className="font-mono text-teal-400">https://n8n.practiceos.internal/webhook/event</span>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0F1116] border border-[#22252F] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{JSON.stringify(
  {
    event: testPayloadModal.trigger,
    timestamp: new Date().toISOString(),
    tenant: {
      id: activeTenant.id,
      name: activeTenant.name,
      slug: activeTenant.slug,
    },
    payload: {
      patientId: "cnt-1",
      patientName: "Priya Sharma",
      phone: "+91 98261 44521",
      action: testPayloadModal.title,
      channel: testPayloadModal.channel,
    },
    signature: "sha256=d5a6b8c9e0f1...",
  },
  null,
  2
)}
              </pre>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {testSuccess
                    ? "HTTP 200 OK — Delivered to n8n webhook runner"
                    : "Simulating webhook delivery..."}
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400">32ms</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTestPayloadModal(null)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
