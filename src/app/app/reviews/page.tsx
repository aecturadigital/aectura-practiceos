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
  Sparkles,
  Share2,
  ShieldCheck,
  TrendingUp,
  User,
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

  const handleTogglePublished = (id: string) => {
    mockStore.toggleReviewPublished(id);
  };

  const handleSendReviewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetContact = contacts.find((c) => c.id === selectedContactId);
    if (!targetContact) return;

    // Send mock request message
    mockStore.sendMessage({
      tenantId: activeTenant.id,
      contactId: targetContact.id,
      direction: "OUTBOUND",
      channel: requestChannel === "WHATSAPP" ? "WHATSAPP" : "SMS",
      senderName: "Automated Review Bot",
      content: `Hello ${targetContact.firstName}, thank you for choosing ${activeTenant.name}. Could you please take 60 seconds to share your experience on our Google profile? ${activeTenant.googleBusinessUrl || "https://maps.google.com"}`,
    });

    setIsRequestModalOpen(false);
    setSelectedContactId("");
    setToastMessage(`Review invite sent to ${targetContact.fullName} via ${requestChannel}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-teal-900 border border-teal-600 text-teal-100 px-4 py-3 rounded-2xl shadow-2xl text-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <Star className="w-3.5 h-3.5" />
            <span>Reputation &amp; Patient Trust</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Patient Reviews</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage public testimonials, sync Google Business Profile reviews, and curate social proof for your practice website.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Request Review</span>
        </button>
      </div>

      {/* Ratings Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Aggregated Clinical Rating
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-4xl font-bold text-white font-mono">{avgRating}</span>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Based on {reviews.length} verified patient evaluations
            </p>
          </div>

          <div className="p-3 bg-[#101216] border border-[#232630] rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-400">Google Rating Match:</span>
            <span className="text-emerald-400 font-semibold font-mono">100% In Sync</span>
          </div>
        </div>

        {/* Rating Bars */}
        <div className="md:col-span-2 bg-[#14161B] border border-[#232630] rounded-3xl p-6 space-y-2.5">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Star Distribution
          </span>

          {ratingCounts.map(({ stars, count }) => {
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                  className={`font-mono font-bold w-14 text-left transition-colors ${
                    filterRating === stars ? "text-teal-400 underline" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {stars} Stars
                </button>
                <div className="flex-1 h-2 bg-[#1C1F28] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 font-mono text-slate-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Reviews List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Testimonials ({filteredReviews.length})
            </span>
            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800"
              >
                Filtered: {filterRating} Stars &times;
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback..."
              className="w-full bg-[#12141A] border border-[#232630] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#14161B] border border-[#232630] rounded-3xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1D27] text-slate-400 border border-[#272B38]">
                      {rev.source}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(rev.date || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-[#20232C] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center font-bold text-[10px]">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-white block">{rev.authorName}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified Visit
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleTogglePublished(rev.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    rev.isPublished
                      ? "bg-teal-950/80 text-teal-300 border-teal-800/80 hover:bg-teal-900/80"
                      : "bg-[#181B24] text-slate-400 border-[#2A2E3D] hover:text-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{rev.isPublished ? "Published on Site" : "Hidden"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Review Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Send Review Invitation</h3>
                <p className="text-xs text-slate-400">
                  Trigger an automated Google Review request sequence.
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendReviewRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Patient</label>
                <select
                  required
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Choose patient...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestChannel("WHATSAPP")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      requestChannel === "WHATSAPP"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                        : "bg-[#101216] border-[#2A2E3B] text-slate-400"
                    }`}
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestChannel("SMS")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      requestChannel === "SMS"
                        ? "bg-sky-950 text-sky-300 border-sky-700"
                        : "bg-[#101216] border-[#2A2E3B] text-slate-400"
                    }`}
                  >
                    <span>SMS</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#101216] border border-[#232630] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Message Preview
                </span>
                <p className="text-[11px] text-slate-300 italic leading-relaxed">
                  &ldquo;Hello [Patient], thank you for choosing {activeTenant.name}. Could you please take 60 seconds to share your experience on our Google profile?&rdquo;
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-[#20232C] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedContactId}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold shadow-md"
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
