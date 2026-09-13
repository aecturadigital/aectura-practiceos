"use client";

import React, { useState } from "react";
import { Bell, X, CheckCheck, Clock, UserPlus, Calendar, AlertTriangle, FileCheck } from "lucide-react";
import { NotificationItem } from "@/types";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    tenantId: "tenant-mindwell",
    title: "New High-Priority Enquiry",
    message: "Aisha Khan requested an intake assessment for panic & anxiety.",
    type: "ENQUIRY",
    timestamp: "12 minutes ago",
    read: false,
  },
  {
    id: "notif-2",
    tenantId: "tenant-mindwell",
    title: "AI Human Handoff Requested",
    message: "Maya escalated a WhatsApp conversation regarding medication clarification.",
    type: "AI_ALERT",
    timestamp: "45 minutes ago",
    read: false,
  },
  {
    id: "notif-3",
    tenantId: "tenant-mindwell",
    title: "Clinical Intake Submitted",
    message: "Priya Sharma completed the pre-session adult clinical history form.",
    type: "INTAKE",
    timestamp: "2 hours ago",
    read: true,
  },
  {
    id: "notif-4",
    tenantId: "tenant-mindwell",
    title: "Appointment Confirmed",
    message: "Dr. Vikram Mehta confirmed session with Rohan Verma for Wednesday.",
    type: "APPOINTMENT",
    timestamp: "Yesterday",
    read: true,
  },
];

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "ENQUIRY":
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case "AI_ALERT":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "INTAKE":
        return <FileCheck className="w-4 h-4 text-teal-400" />;
      case "APPOINTMENT":
        return <Calendar className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg border border-[#272A34] bg-[#16181D] hover:bg-[#1E2127] text-slate-400 hover:text-white transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-sm bg-[#16181D] border-l border-[#272A34] shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[#272A34] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-400" />
                  <h2 className="text-sm font-semibold text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-400 border border-teal-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={markAllAsRead}
                    className="p-1 rounded text-slate-400 hover:text-white text-xs flex items-center gap-1 hover:bg-slate-800 px-2"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      n.read
                        ? "bg-[#121417]/60 border-[#272A34]/50 opacity-75"
                        : "bg-[#1B1E26] border-teal-800/40 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-[#272A34] shrink-0 mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-500 shrink-0">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#272A34] bg-[#111315] text-center text-[11px] text-slate-500">
                <span>Real-time practice event notifications</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
