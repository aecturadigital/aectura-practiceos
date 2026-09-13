"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  User,
  Paperclip,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Message } from "@/types";

export default function PatientPortalMessagesPage() {
  const { activeTenant } = useTenant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connected patient
  const contacts = mockStore.getContacts(activeTenant.id);
  const patient = contacts[0] || {
    id: "cnt-1",
    fullName: "Priya Sharma",
    firstName: "Priya",
  };

  const loadMessages = () => {
    const list = mockStore.getMessages(activeTenant.id, patient.id);
    setMessages(list);
  };

  useEffect(() => {
    loadMessages();
    const unsubscribe = mockStore.subscribe(loadMessages);
    return () => unsubscribe();
  }, [activeTenant.id, patient.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (contentToSend?: string) => {
    const text = contentToSend || inputContent.trim();
    if (!text) return;

    // Send from patient to practice
    mockStore.sendMessage({
      tenantId: activeTenant.id,
      contactId: patient.id,
      direction: "INBOUND",
      channel: "PORTAL",
      senderName: patient.fullName,
      content: text,
    });

    setInputContent("");
  };

  const quickPrompts = [
    "I'd like to reschedule my next session if possible.",
    "Can you share my exercise instructions again?",
    "Do you offer evening appointments on weekdays?",
    "Could I get an invoice receipt for my last visit?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#14161B] border border-[#232630] rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[#232630] bg-[#161922] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{ backgroundColor: activeTenant.branding.primaryColor || "#0D9488" }}
          >
            {activeTenant.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{activeTenant.name} Care Team</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Active
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Direct, encrypted messaging with your clinical care coordinator
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>256-bit HIPAA Encrypted</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-8">
            <MessageSquare className="w-10 h-10 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-200">Start a conversation</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Send a secure message to your practitioner or clinic front desk. Responses are typically returned within business hours.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isPatient = msg.direction === "INBOUND";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isPatient ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isPatient
                      ? "bg-teal-950 text-teal-300 border border-teal-800"
                      : "bg-[#252936] text-slate-300 border border-[#333849]"
                  }`}
                >
                  {isPatient ? patient.firstName?.charAt(0) || "P" : "C"}
                </div>

                <div
                  className={`space-y-1 ${
                    isPatient ? "items-end text-right" : "items-start text-left"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>{isPatient ? "You" : msg.senderName || "Clinic Team"}</span>
                    <span>&bull;</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isPatient
                        ? "bg-teal-600 text-white rounded-tr-none shadow-md"
                        : "bg-[#1C202B] text-slate-200 border border-[#2A2F3E] rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-[#12141A] border-t border-[#20232B] flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-500 shrink-0 flex items-center gap-1 font-mono text-[10px]">
          <Sparkles className="w-3 h-3 text-teal-400" />
          Quick Ask:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="shrink-0 px-3 py-1 rounded-full bg-[#1A1D26] hover:bg-[#232733] text-slate-300 hover:text-white border border-[#262B37] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-[#161922] border-t border-[#232630] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Type your message to the clinic team..."
          className="flex-1 bg-[#101217] border border-[#2B2F3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputContent.trim()}
          className="bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-md shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
