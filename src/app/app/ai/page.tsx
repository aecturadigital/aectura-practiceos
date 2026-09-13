"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";

interface TestMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function StaffAiReceptionistPage() {
  const { activeTenant, vertical } = useTenant();
  const [isEnabled, setIsEnabled] = useState(activeTenant.settings?.aiReceptionistEnabled ?? true);
  const [aiName, setAiName] = useState(activeTenant.settings?.aiName || "Maya");
  const [aiTone, setAiTone] = useState(activeTenant.settings?.aiTone || "warm");
  const [savedNotice, setSavedNotice] = useState(false);

  // Test Sandbox State
  const [testInput, setTestInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [testMessages, setTestMessages] = useState<TestMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: `Hello! I am ${aiName}, the practice coordinator at ${activeTenant.name}. How can I assist you with scheduling or clinic information today?`,
      timestamp: "10:00 AM",
    },
  ]);

  const handleSendTestMessage = (customText?: string) => {
    const text = customText || testInput.trim();
    if (!text) return;

    const userMsg: TestMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTestMessages((prev) => [...prev, userMsg]);
    setTestInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = `I would be pleased to assist you with booking at ${activeTenant.name}. We have appointment openings this Wednesday at 10:30 AM or 3:00 PM.`;
      if (text.toLowerCase().includes("cost") || text.toLowerCase().includes("price") || text.toLowerCase().includes("fee")) {
        reply = `Consultation fees at ${activeTenant.name} start at ₹${activeTenant.services?.[0]?.price || 1500} for ${activeTenant.services?.[0]?.name || "Initial Consultation"}.`;
      } else if (text.toLowerCase().includes("location") || text.toLowerCase().includes("address")) {
        reply = `Our clinic is located at ${activeTenant.address || "12 Medical Center Road, Civil Lines"}. We also offer secure video telehealth sessions.`;
      }

      setTestMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.updateTenant(activeTenant.id, {
      settings: {
        ...activeTenant.settings,
        aiReceptionistEnabled: isEnabled,
        aiName,
        aiTone: aiTone as any,
      },
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">AI Receptionist</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
              isEnabled
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              {isEnabled ? "Active & Triage Online" : "Paused"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated WhatsApp triage, appointment inquiries, and clinic guardrails
          </p>
        </div>

        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            isEnabled
              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              : "bg-[#0D9488] text-white border-transparent hover:bg-[#0F766E]"
          }`}
        >
          {isEnabled ? "Pause AI Assistant" : "Activate Assistant"}
        </button>
      </div>

      {savedNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Assistant configuration updated successfully.</span>
        </div>
      )}

      {/* Main Configuration & Testing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-none">
          <h2 className="text-sm font-semibold text-slate-900">Coordinator Personality &amp; Rules</h2>

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Coordinator Name</label>
              <input
                type="text"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Conversational Tone</label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as "warm" | "professional" | "concise")}
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white text-slate-900"
              >
                <option value="warm">Warm &amp; Empathetic (Recommended for healthcare)</option>
                <option value="professional">Formal &amp; Direct</option>
                <option value="concise">Concise &amp; Action-Oriented</option>
              </select>
            </div>

            {/* Medical Safety Guardrails Note */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-800 block">Strict Medical Safety Guardrails</span>
              <p className="text-slate-600">
                The coordinator will never provide medical diagnosis, write prescriptions, or quote invented prices. Emergency symptoms are automatically escalated to human staff.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-md transition-colors"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Live Simulator Panel */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-none space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Interactive Triage Simulator</h2>
            <p className="text-xs text-slate-500">Test how the coordinator responds to prospective patient messages</p>
          </div>

          <div className="space-y-2.5 h-[280px] overflow-y-auto p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
            {testMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    m.sender === "user"
                      ? "bg-[#0D9488] text-white"
                      : "bg-white border border-slate-200 text-slate-800"
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 font-mono">{m.timestamp}</span>
              </div>
            ))}
            {isTyping && (
              <div className="text-[11px] text-slate-400 italic">Maya is typing...</div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask about appointments, pricing, or hours..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendTestMessage()}
              className="flex-1 text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
            />
            <button
              onClick={() => handleSendTestMessage()}
              disabled={!testInput.trim()}
              className="px-3.5 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors"
            >
              Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
