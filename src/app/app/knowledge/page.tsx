"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  Trash2,
  Tag,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { KnowledgeDocument } from "@/types";

export default function StaffKnowledgeBasePage() {
  const { activeTenant } = useTenant();
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);

  // New Doc Form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<KnowledgeDocument["category"]>("POLICIES");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("hours, schedule");

  const loadDocs = () => {
    setDocs(mockStore.getKnowledgeDocs(activeTenant.id));
  };

  useEffect(() => {
    loadDocs();
    const unsubscribe = mockStore.subscribe(loadDocs);
    return () => unsubscribe();
  }, [activeTenant.id]);

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    mockStore.addKnowledgeDoc({
      id: `kb-${Date.now()}`,
      tenantId: activeTenant.id,
      title: title.trim(),
      category,
      content: content.trim(),
      tags,
      status: "ACTIVE",
      lastIndexedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setIsAddOpen(false);
    setTitle("");
    setContent("");
    setTagsInput("");
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice Knowledge Base &amp; Vector Embeddings</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clinic Knowledge Base</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official factual guidelines ingested by the AI receptionist to answer patient queries accurately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Knowledge Item</span>
          </button>
        </div>
      </div>

      {/* Vector Store Status Bar */}
      <div className="p-4 rounded-2xl bg-[#101217] border border-[#232630] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Vector Search Index: Synchronized</span>
            <span className="text-[11px] text-slate-400">
              {docs.length} active documents indexed and accessible to Receptionist AI (Maya)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-teal-400 bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-800/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Semantic Embeddings Updated</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Practice Documents ({filteredDocs.length})
        </h2>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies, fees, hours..."
            className="w-full bg-[#12141A] border border-[#232630] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="bg-[#14161B] border border-[#232630] hover:border-slate-700 transition-all rounded-3xl p-6 flex flex-col justify-between space-y-4 cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1B1E28] text-teal-400 border border-[#2A2E3B]">
                  {doc.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(doc.updatedAt || doc.lastIndexedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {doc.content}
              </p>
            </div>

            <div className="pt-3 border-t border-[#20232C] space-y-2">
              <div className="flex flex-wrap gap-1">
                {doc.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#101216] text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Vector ready</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Document Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                  {selectedDoc.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Last updated {new Date(selectedDoc.updatedAt || selectedDoc.lastIndexedAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#101216] border border-[#232630] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {selectedDoc.content}
            </div>

            <div className="flex flex-wrap gap-1 text-xs">
              {selectedDoc.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1D27] text-slate-300 border border-[#282C3A]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Add Knowledge Article</h3>
                <p className="text-xs text-slate-400">
                  Teach your AI receptionist new clinic policies or answers.
                </p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cancellation &amp; Rescheduling Terms"
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as KnowledgeDocument["category"])}
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="POLICIES">Clinic Policies</option>
                  <option value="PRICING">Consultation Fees &amp; Billing</option>
                  <option value="BUSINESS_INFO">Hours, Parking &amp; Location</option>
                  <option value="SERVICES">Clinical Services</option>
                  <option value="FAQS">Frequently Asked Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Content / Knowledge Text</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide complete, accurate instructions for the receptionist AI..."
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="fees, reschedule, online"
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-[#20232C] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md"
                >
                  Save &amp; Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
