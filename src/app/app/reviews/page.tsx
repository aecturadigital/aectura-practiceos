"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Send,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  MessageSquare,
  Globe,
  Share2,
  TrendingUp,
  User,
  Plus,
  X,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Review, Contact } from "@/types";

export default function StaffReviewsPage() {
  const { activeTenant } = useTenant();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [requestChannel, setRequestChannel] = useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const contacts = mockStore.getContacts(activeTenant.id);

  const loadData = () => {
    setReviews(mockStore.getReviews(activeTenant.id));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = mockStore.subscribe(loadData);
    return () => unsubscribe();
  }, [activeTenant.id]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  const filteredReviews = reviews.filter((r) => {
    const matchRating = filterRating === null || r.rating === filterRating;
    const matchSearch =
      r.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRating && matchSearch;
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) return;

    const contact = contacts.find((c) => c.id === selectedContactId);
    if (!contact) return;

    setToastMessage(`Review invitation dispatched to ${contact.fullName} via ${requestChannel}.`);
    setIsRequestModalOpen(false);
    setSelectedContactId("");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Reviews</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {reviews.length} Verified Reviews
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient testimonials, Google ratings, and feedback collection
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Request Review</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <span className="text-xs font-medium text-slate-500 block mb-1">Average Rating</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-slate-900 font-mono">{avgRating}</span>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">Across Google and verified submissions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <span className="text-xs font-medium text-slate-500 block mb-1">Feedback Velocity</span>
          <span className="text-2xl font-semibold text-slate-900 font-mono">100%</span>
          <p className="text-xs text-emerald-700 font-medium mt-1">Positive rating share</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <span className="text-xs font-medium text-slate-500 block mb-1">Google Integration</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-800">Connected</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Automated invite triggers active</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none divide-y divide-slate-100">
        {filteredReviews.map((rev) => (
          <div key={rev.id} className="p-4 space-y-1.5 hover:bg-slate-50/70 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{rev.authorName}</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {rev.source}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{rev.date}</span>
            </div>

            <div className="flex text-amber-500">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
          </div>
        ))}
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-semibold text-slate-900">Request Review</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Patient</label>
                <select
                  required
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  <option value="">Select patient record...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Dispatch Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestChannel("WHATSAPP")}
                    className={`py-1.5 px-3 rounded text-xs font-medium border text-center ${
                      requestChannel === "WHATSAPP"
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    WhatsApp Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestChannel("SMS")}
                    className={`py-1.5 px-3 rounded text-xs font-medium border text-center ${
                      requestChannel === "SMS"
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Direct SMS
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
