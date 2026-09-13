"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Clock,
  Play,
  Settings,
  Activity,
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
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Automations</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {recipes.filter((r) => r.isEnabled).length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Event triggers, appointment reminders, and automated patient follow-ups
          </p>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-3 shadow-none"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Trigger: {recipe.trigger}
                </span>
                <button
                  onClick={() => handleToggle(recipe.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                    recipe.isEnabled
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {recipe.isEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              <h3 className="text-sm font-semibold text-slate-900">{recipe.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{recipe.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">Action: {recipe.actions?.[0] || "Webhook Event"}</span>
              <button
                onClick={() => handleRunTest(recipe)}
                className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium"
              >
                <Play className="w-3 h-3" />
                <span>Test Trigger</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Test Modal */}
      {testPayloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Triggering: {testPayloadModal.title}
            </h3>
            {testSuccess ? (
              <div className="py-4 text-center text-xs text-emerald-700 flex flex-col items-center gap-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>Payload executed successfully! Event verified.</span>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                Dispatching test webhook...
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTestPayloadModal(null)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
