"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Phone,
  Mail,
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

  const filteredConversations = conversations.filter((c) => {
    const matchChannel = selectedChannel === "ALL" || c.channel === selectedChannel;
    const matchSearch =
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessagePreview || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchChannel && matchSearch;
  });

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "WHATSAPP":
        return (
          <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded font-mono">
            WhatsApp
          </span>
        );
      case "PORTAL":
        return (
          <span className="text-[10px] font-medium text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded font-mono">
            Portal
          </span>
        );
      case "EMAIL":
        return (
          <span className="text-[10px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
            Email
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
            {channel}
          </span>
        );
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Inbox</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {conversations.length} Active Conversations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified patient communications across WhatsApp, portal, and email
          </p>
        </div>
      </div>

      {/* 3-Column Communication Workspace */}
      <div className="flex-1 flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        {/* PANE 1: Conversation List (280–320px) */}
        <div className="w-full sm:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search & Channel Filter */}
          <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-teal-600 bg-slate-50 focus:bg-white text-slate-900"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto text-[11px]">
              {["ALL", "WHATSAPP", "PORTAL", "EMAIL"].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    selectedChannel === ch
                      ? "bg-slate-200 text-slate-900 font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {ch === "ALL" ? "All Channels" : ch.charAt(0) + ch.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center">No conversations found.</p>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConv && activeConv.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-3 text-left transition-colors flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-teal-50/70 border-l-2 border-teal-600"
                        : "hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-700 text-xs shrink-0 mt-0.5">
                      {conv.contactName.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs truncate ${
                            isSelected ? "font-semibold text-slate-900" : "font-medium text-slate-800"
                          }`}
                        >
                          {conv.contactName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(conv.lastMessageAt || "").slice(11, 16)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate mb-1">
                        {conv.lastMessagePreview}
                      </p>

                      <div className="flex items-center justify-between text-[10px]">
                        {getChannelBadge(conv.channel)}
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANE 2: Active Conversation Thread (Center) */}
        {activeConv ? (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Thread Header */}
            <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Link
                  href={`/app/contacts/${activeConv.contactId}`}
                  className="font-semibold text-sm text-slate-900 truncate hover:text-teal-700 hover:underline"
                >
                  {activeConv.contactName}
                </Link>
                {getChannelBadge(activeConv.channel)}
              </div>

              {/* AI Triage Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAi}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                    activeConv.aiEnabled
                      ? "bg-teal-50 text-teal-800 border-teal-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-teal-700" />
                  <span>{activeConv.aiEnabled ? "AI Triage Active" : "Human Only"}</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {messages.map((m) => {
                const isOutbound = m.direction === "OUTBOUND";

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[75%] ${
                      isOutbound ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 text-xs leading-relaxed ${
                        isOutbound
                          ? "bg-[#0D9488] text-white"
                          : "bg-white border border-slate-200 text-slate-800 shadow-none"
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{(m.timestamp || "").slice(11, 16)}</span>
                      {isOutbound && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Outbound Message Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Reply to ${activeConv.contactName} on ${activeConv.channel}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-teal-600 bg-slate-50 focus:bg-white text-slate-900 transition-colors"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white text-xs font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Select a conversation to start messaging.
          </div>
        )}

        {/* PANE 3: Client Context Panel (Desktop Right ~280px) */}
        {contact && (
          <div className="hidden lg:flex w-72 border-l border-slate-200 flex-col bg-slate-50/40 p-4 space-y-4 overflow-y-auto">
            <div className="text-center pb-3 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto flex items-center justify-center font-bold text-slate-700 text-sm mb-2">
                {contact.firstName.charAt(0)}
              </div>
              <h3 className="font-semibold text-xs text-slate-900">{contact.fullName}</h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{contact.phone}</p>
            </div>

            {/* Quick Context Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-slate-800">{contact.status}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-slate-800">{contact.city || activeTenant.city}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Lead Source</span>
                <span className="font-medium text-slate-800">{contact.tags[0] || "Website"}</span>
              </div>
            </div>

            {/* Next Appointment Card */}
            <div className="bg-white p-3 rounded-md border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Next Appointment
              </span>
              {nextAppt ? (
                <div>
                  <p className="font-semibold text-slate-900 text-xs">
                    {nextAppt.date} at {nextAppt.startTime}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {nextAppt.serviceName} &bull; {nextAppt.staffName}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-xs">None scheduled</p>
              )}
            </div>

            {/* Full 360 Link */}
            <div className="pt-2">
              <Link
                href={`/app/contacts/${contact.id}`}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Open 360° Client Card</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
