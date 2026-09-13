"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Phone,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Conversation, Message, Contact, Appointment } from "@/types";

export default function StaffInboxPage() {
  const { activeTenant, vertical } = useTenant();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const convs = mockStore.getConversations(activeTenant.id);
    setConversations(convs);
    if (!selectedConvId && convs.length > 0) {
      setSelectedConvId(convs[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = mockStore.subscribe(loadData);
    return () => unsubscribe();
  }, [activeTenant.id]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    if (activeConv) {
      const msgs = mockStore.getMessages(activeTenant.id, activeConv.contactId);
      setMessages(msgs);
    }
  }, [activeConv, activeTenant.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Selected contact details for 3rd pane
  const contact: Contact | undefined = activeConv
    ? mockStore.getContact(activeConv.contactId)
    : undefined;

  const contactAppointments: Appointment[] = activeConv
    ? mockStore.getAppointments(activeTenant.id).filter((a) => a.contactId === activeConv.contactId)
    : [];
  const nextAppt = contactAppointments.find((a) => a.status === "CONFIRMED") || contactAppointments[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    mockStore.sendMessage({
      tenantId: activeTenant.id,
      contactId: activeConv.contactId,
      direction: "OUTBOUND",
      channel: activeConv.channel,
      senderName: "Clinic Staff",
      content: replyText.trim(),
    });

    setReplyText("");
  };

  const handleToggleAi = () => {
    if (!activeConv) return;
    mockStore.toggleConversationAi(activeConv.id, !activeConv.aiEnabled);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchChannel = selectedChannel === "ALL" || c.channel === selectedChannel;
    const matchSearch =
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPhone.includes(searchQuery);
    return matchChannel && matchSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-[#232630] bg-[#14161B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Omnichannel Care Inbox</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F232B] text-teal-400 border border-[#2B303D]">
                {conversations.length} Active Conversations
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Unified real-time conversations across WhatsApp, Patient Portal, and SMS.
            </p>
          </div>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#101216] p-1 rounded-xl border border-[#232630] text-xs">
          {["ALL", "WHATSAPP", "PORTAL", "SMS"].map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1 rounded-lg font-medium text-[11px] transition-all ${
                selectedChannel === ch
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Pane Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANE 1: Conversation List */}
        <div className="w-full sm:w-80 md:w-96 border-r border-[#232630] bg-[#12141A] flex flex-col shrink-0">
          {/* Search bar */}
          <div className="p-3 border-b border-[#232630]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages or patient..."
                className="w-full bg-[#161820] border border-[#272B37] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1D2028]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
                <p>No conversations match your filter</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === activeConv?.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#181C26] border-l-2 border-teal-500"
                        : "hover:bg-[#161922]"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-teal-400 border border-[#272B38] flex items-center justify-center font-bold text-xs shrink-0">
                      {c.contactName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {c.contactName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate leading-relaxed">
                        {c.lastMessagePreview}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            c.channel === "WHATSAPP"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                              : c.channel === "PORTAL"
                              ? "bg-teal-950/80 text-teal-400 border border-teal-800/60"
                              : "bg-sky-950/80 text-sky-400 border border-sky-800/60"
                          }`}
                        >
                          {c.channel}
                        </span>

                        {c.aiEnabled && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                            <Bot className="w-2.5 h-2.5" />
                            AI Active
                          </span>
                        )}

                        {c.unreadCount > 0 && (
                          <span className="ml-auto w-4 h-4 rounded-full bg-teal-500 text-black font-bold text-[9px] flex items-center justify-center">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANE 2: Active Chat Thread */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-[#0F1116] overflow-hidden">
            {/* Conversation Header */}
            <div className="p-4 border-b border-[#232630] bg-[#14161B] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-950 border border-teal-800 text-teal-400 font-bold flex items-center justify-center text-sm">
                  {activeConv.contactName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">{activeConv.contactName}</h2>
                    <span className="text-xs text-slate-500 font-mono">
                      {activeConv.contactPhone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Channel: {activeConv.channel}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">Connected</span>
                  </div>
                </div>
              </div>

              {/* AI Auto-Receptionist Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1E27] border border-[#272C39] text-xs">
                  <Bot
                    className={`w-4 h-4 ${
                      activeConv.aiEnabled ? "text-purple-400 animate-pulse" : "text-slate-500"
                    }`}
                  />
                  <div className="text-left">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Receptionist AI</p>
                    <p className="text-xs font-semibold text-white">
                      {activeConv.aiEnabled ? "Autonomous Reply" : "Manual / Paused"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAi}
                    className={`ml-2 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      activeConv.aiEnabled
                        ? "bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-700"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {activeConv.aiEnabled ? "Pause AI" : "Enable AI"}
                  </button>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isOutbound = msg.direction === "OUTBOUND";

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                      isOutbound ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isOutbound
                          ? "bg-teal-950 text-teal-300 border border-teal-800"
                          : "bg-[#252936] text-slate-300 border border-[#333849]"
                      }`}
                    >
                      {isOutbound ? "S" : activeConv.contactName.charAt(0)}
                    </div>

                    <div
                      className={`space-y-1 ${
                        isOutbound ? "items-end text-right" : "items-start text-left"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>{isOutbound ? msg.senderName || "Clinic Staff" : activeConv.contactName}</span>
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
                          isOutbound
                            ? "bg-teal-600 text-white rounded-tr-none shadow-md"
                            : "bg-[#1A1D26] text-slate-200 border border-[#272B38] rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Warning or Status */}
            {activeConv.aiEnabled && (
              <div className="px-4 py-2 bg-purple-950/30 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  AI Receptionist (Maya) is currently handling triage for this thread.
                </span>
                <button
                  onClick={handleToggleAi}
                  className="underline hover:text-white font-semibold"
                >
                  Take Over Conversation
                </button>
              </div>
            )}

            {/* Reply Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-[#14161B] border-t border-[#232630] flex items-center gap-2"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${activeConv.contactName} via ${activeConv.channel}...`}
                className="flex-1 bg-[#101217] border border-[#2B2F3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Select a conversation to view chat history
          </div>
        )}

        {/* PANE 3: Contact Context Drawer (hidden on mobile/tablet) */}
        {contact && (
          <div className="hidden lg:block w-80 border-l border-[#232630] bg-[#12141A] p-5 overflow-y-auto space-y-6 shrink-0 text-xs">
            {/* Contact Header */}
            <div className="text-center space-y-2 pb-4 border-b border-[#232630]">
              <div className="w-16 h-16 rounded-full bg-teal-950 border-2 border-teal-800 text-teal-300 font-bold text-xl flex items-center justify-center mx-auto">
                {contact.firstName.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{contact.fullName}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{contact.email}</p>
                <p className="text-[11px] text-teal-400 font-mono">{contact.phone}</p>
              </div>

              <Link
                href={`/app/contacts/${contact.id}`}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300 bg-teal-950/60 border border-teal-800/60 px-3 py-1.5 rounded-lg transition-colors mt-2"
              >
                <span>Open 360° Card</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick Context */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Practice OS Metadata
              </span>

              <div className="p-3 rounded-xl bg-[#161822] border border-[#252834] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Record Status:</span>
                  <span className="text-emerald-400 font-medium">{contact.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Tag:</span>
                  <span className="text-teal-400 font-medium">{contact.tags[0] || "Verified Patient"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Notes On File:</span>
                  <span className="text-white font-medium">{contact.notesCount} entries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Intake Filed:</span>
                  <span className="text-slate-200 font-medium">
                    {contact.intakeCompleted ? "Yes" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Appointment Card */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Next Appointment
              </span>
              {nextAppt ? (
                <div className="p-3 rounded-xl bg-[#161822] border border-[#252834] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{nextAppt.date}</span>
                    <span className="text-[10px] font-mono text-teal-400">{nextAppt.startTime}</span>
                  </div>
                  <p className="text-slate-300 font-medium text-[11px] truncate">{nextAppt.serviceName}</p>
                  <p className="text-slate-500 text-[10px]">With {nextAppt.staffName}</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#161822] border border-[#252834] text-slate-500 text-center text-[11px]">
                  No upcoming appointment
                </div>
              )}
            </div>

            {/* Clinical Tags */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Clinical Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1D27] text-slate-300 border border-[#282C3A]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
