"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Tag,
  X,
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
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Knowledge</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {docs.length} Articles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Practice policies, fees, preparation protocols, and clinic guidelines
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Article</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clinic policies and information..."
          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-teal-600 bg-white text-slate-900"
        />
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 cursor-pointer transition-colors shadow-none flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {doc.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {(doc.updatedAt || doc.lastIndexedAt || "").split("T")[0]}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{doc.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{doc.content}</p>
            </div>

            <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
              {(doc.tags || []).map((t, idx) => (
                <span key={idx} className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Document Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-semibold text-slate-900">New Knowledge Article</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Appointment Cancellation &amp; Refund Policy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  <option value="POLICIES">Clinic Policies</option>
                  <option value="PRICING">Pricing &amp; Insurance</option>
                  <option value="SERVICES">Services</option>
                  <option value="FAQS">FAQs</option>
                  <option value="BUSINESS_INFO">Business Information</option>
                  <option value="PRACTITIONERS">Practitioners</option>
                  <option value="DOCUMENTS">Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Article Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Accurate guidelines for staff and automated patient inquiries..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  {selectedDoc.category}
                </span>
                <h3 className="text-base font-semibold text-slate-900 mt-1">{selectedDoc.title}</h3>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {selectedDoc.content}
            </p>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedDoc(null)}
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
