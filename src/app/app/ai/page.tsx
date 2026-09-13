"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  Settings2,
  Clock,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Zap,
  Activity,
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

  // Interactive Test Sandbox State
  const [testInput, setTestInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [testMessages, setTestMessages] = useState<TestMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: `Namaste! I am ${aiName}, the automated care coordinator at ${activeTenant.name}. How can I assist you with appointment bookings or practice information today?`,
      timestamp: "Just now",
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

    // Realistic AI Response Generator based on tenant & vertical knowledge
    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();

      if (lower.includes("hour") || lower.includes("open") || lower.includes("timing")) {
        reply = `Our clinic is open Monday to Saturday from 09:00 AM to 08:00 PM. We offer both in-clinic consultations at ${activeTenant.city} and secure online telehealth video sessions. Would you like to check available slots?`;
      } else if (lower.includes("fee") || lower.includes("cost") || lower.includes("price") || lower.includes("charge")) {
        reply = `Initial consultations at ${activeTenant.name} start at ₹1,500 for a 50-minute dedicated clinical session. Follow-up sessions are ₹1,200. You can book directly through our patient portal or our online calendar.`;
      } else if (lower.includes("where") || lower.includes("address") || lower.includes("location") || lower.includes("directions")) {
        reply = `We are located at ${activeTenant.address}. Free visitor parking is available on-site.`;
      } else if (lower.includes("suicide") || lower.includes("emergency") || lower.includes("severe") || lower.includes("die") || lower.includes("hospital")) {
        reply = `CRITICAL SAFETY PROTOCOL: If you or someone you know is experiencing an acute psychiatric emergency or immediate distress, please dial 112 or the National Tele-MANAS Mental Health Helpline at 14416 (24/7 Toll-Free). Our practice does not handle emergency crisis triage.`;
      } else if (lower.includes("book") || lower.includes("appointment") || lower.includes("schedule")) {
        reply = `I would be delighted to help you schedule! Our next open slot with our senior practitioner is tomorrow at 11:30 AM or 04:30 PM. Would either of those times suit your schedule?`;
      } else if (lower.includes("medicine") || lower.includes("prescribe") || lower.includes("drug")) {
        reply = `Our clinical psychologists and therapists provide psychotherapy, counseling, and non-pharmacological behavioral treatment. We do not prescribe medication. If psychiatric medication is indicated, we collaborate with consultant psychiatrists for coordinated care.`;
      } else {
        reply = `Thank you for asking. At ${activeTenant.name}, we provide specialized ${vertical.displayName.toLowerCase()} care. I can help answer common questions about our clinical team, consultation fees, or help you book an assessment session.`;
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
    }, 900);
  };

  const samplePrompts = [
    "What are your consultation timings?",
    "How much does an initial session cost?",
    "Where is your clinic located?",
    "Do you prescribe medications?",
    "I need an emergency appointment",
  ];

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Patient Triage</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Clinic Receptionist</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure {aiName}, your practice&apos;s 24/7 AI front-desk agent. Triage inbound leads, answer fees &amp; clinic hours, and schedule appointments with strict medical safety guardrails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
              isEnabled
                ? "bg-purple-950 text-purple-200 border-purple-800 shadow-md"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{isEnabled ? "Receptionist Active" : "Receptionist Offline"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#14161B] border border-[#232630] space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Conversations Triaged</span>
          <p className="text-2xl font-bold text-white font-mono">148</p>
          <span className="text-[10px] text-emerald-400 font-medium">This month (WhatsApp &amp; Web)</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#14161B] border border-[#232630] space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Appointments Booked</span>
          <p className="text-2xl font-bold text-teal-400 font-mono">34</p>
          <span className="text-[10px] text-slate-400">23.0% lead conversion rate</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#14161B] border border-[#232630] space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Avg First Response</span>
          <p className="text-2xl font-bold text-purple-400 font-mono">4.2s</p>
          <span className="text-[10px] text-emerald-400 font-medium">Instant 24/7 coverage</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#14161B] border border-[#232630] space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Medical Safety Guards</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono">100%</p>
          <span className="text-[10px] text-slate-400">0 unverified clinical advice</span>
        </div>
      </div>

      {/* Main Grid: Config & Live Test Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-purple-400" />
              <span>Persona &amp; Behavior</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Receptionist Agent Name</label>
                <input
                  type="text"
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Conversational Tone</label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value as "professional" | "warm" | "concise")}
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="warm">Warm, Empathetic &amp; Reassuring (Recommended)</option>
                  <option value="professional">Clinical &amp; Professional</option>
                  <option value="concise">Concise &amp; Direct</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#232630]">
                <span className="font-semibold text-slate-300 block">Capabilities Enabled</span>

                <div className="p-3 rounded-xl bg-[#101216] border border-[#232630] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Direct Booking Assistance</p>
                    <p className="text-[11px] text-slate-400">Presents live open calendar slots to patient</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                </div>

                <div className="p-3 rounded-xl bg-[#101216] border border-[#232630] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Fee &amp; Service Inquiries</p>
                    <p className="text-[11px] text-slate-400">Quotes verified consultation prices</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                </div>

                <div className="p-3 rounded-xl bg-[#101216] border border-[#232630] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Automated Human Escalation</p>
                    <p className="text-[11px] text-slate-400">Alerts staff when patient requests doctor</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Safety Guardrails Card */}
          <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="font-bold">Constitutional Medical Guardrails</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Enforced strictly via System Instructions:
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
              <li>Absolute prohibition against diagnosing clinical conditions.</li>
              <li>No prescription of medication or pharmaceutical recommendations.</li>
              <li>Instant trigger of National Crisis Helplines upon distress keyword detection.</li>
              <li>Only quotes verified fee data defined in practice settings.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Testing Sandbox Simulator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[650px] bg-[#14161B] border border-[#232630] rounded-3xl overflow-hidden shadow-xl">
          {/* Simulator Header */}
          <div className="p-4 border-b border-[#232630] bg-[#161922] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Interactive Receptionist Sandbox</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">
                    Live Simulator
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Simulate how {aiName} answers patient inquiries in real-time.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setTestMessages([
                  {
                    id: "m-1",
                    sender: "ai",
                    text: `Namaste! I am ${aiName}, the automated care coordinator at ${activeTenant.name}. How can I assist you today?`,
                    timestamp: "Just now",
                  },
                ]);
              }}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Reset Chat
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {testMessages.map((msg) => {
              const isAi = msg.sender === "ai";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isAi
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : "bg-teal-950 text-teal-300 border border-teal-800"
                    }`}
                  >
                    {isAi ? <Bot className="w-3.5 h-3.5" /> : "U"}
                  </div>

                  <div className={`space-y-1 ${isAi ? "text-left" : "text-right"}`}>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{isAi ? aiName : "Patient Inquirer"}</span>
                      <span>&bull;</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isAi
                          ? "bg-[#181C26] text-slate-200 border border-[#272B38] rounded-tl-none"
                          : "bg-teal-600 text-white rounded-tr-none shadow-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-purple-400 p-2">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
                <span className="italic font-mono text-[11px]">{aiName} is formulating response...</span>
              </div>
            )}
          </div>

          {/* Test Prompts */}
          <div className="px-4 py-2 bg-[#101217] border-t border-[#20232B] flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-slate-500 shrink-0 font-mono text-[10px]">Test Prompts:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendTestMessage(p)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-[#1A1D27] hover:bg-[#252A36] text-slate-300 hover:text-white border border-[#282C3A] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendTestMessage();
            }}
            className="p-4 bg-[#161922] border-t border-[#232630] flex items-center gap-2"
          >
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder={`Ask ${aiName} about fees, hours, booking, or clinical services...`}
              className="flex-1 bg-[#101217] border border-[#2B2F3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!testInput.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white p-2.5 rounded-xl font-semibold transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
