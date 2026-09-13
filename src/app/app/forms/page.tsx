"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  X,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Form, FormField, FormSubmission } from "@/types";

export default function StaffFormsPage() {
  const { activeTenant, vertical } = useTenant();
  const [activeTab, setActiveTab] = useState<"forms" | "submissions">("forms");
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"INTAKE" | "CONTACT" | "FEEDBACK" | "CONSENT">("INTAKE");
  const [newFields, setNewFields] = useState<FormField[]>([
    { id: "field-1", label: "Primary Reason for Visit", type: "textarea", required: true },
    { id: "field-2", label: "Preferred Contact Method", type: "select", options: ["WhatsApp", "Phone Call", "Email"], required: true },
  ]);

  const loadData = () => {
    setForms(mockStore.getForms(activeTenant.id));
    setSubmissions(mockStore.getFormSubmissions(activeTenant.id));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = mockStore.subscribe(loadData);
    return () => unsubscribe();
  }, [activeTenant.id]);

  const handleAddField = () => {
    const id = `field-${Date.now()}`;
    setNewFields([
      ...newFields,
      { id, label: "New Clinical Question", type: "text", required: false },
    ]);
  };

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    mockStore.createForm({
      tenantId: activeTenant.id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      type: newType,
      fields: newFields,
      isActive: true,
    });

    setIsCreateOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleCopyLink = (formId: string) => {
    navigator.clipboard.writeText(`https://${activeTenant.slug}.practiceos.in/forms/${formId}`);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredForms = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.formTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Forms</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {forms.length} Templates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clinical intake forms, questionnaires, and patient agreements
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Form</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
          <button
            onClick={() => setActiveTab("forms")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "forms"
                ? "bg-slate-100 text-slate-900 font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Form Templates ({forms.length})
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "submissions"
                ? "bg-slate-100 text-slate-900 font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Submissions ({submissions.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "forms" ? "Search templates..." : "Search respondents..."}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-teal-600 bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Forms Grid */}
      {activeTab === "forms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors shadow-none"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {form.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {form.fields.length} fields
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 leading-snug">{form.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {form.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCopyLink(form.id)}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                >
                  {copiedId === form.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Share Link</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions List */}
      {activeTab === "submissions" && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Form</th>
                <th className="py-2.5 px-4">Respondent</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Submitted Date</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">{sub.formTitle}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{sub.contactName}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{sub.contactEmail}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-teal-700 font-medium">View &rarr;</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedSubmission.formTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  From {selectedSubmission.contactName} ({selectedSubmission.contactEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto">
              {Object.entries(selectedSubmission.answers || {}).map(([key, val]) => (
                <div key={key} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800 block mb-1 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <p className="text-slate-600 whitespace-pre-wrap">{String(val)}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-semibold text-slate-900">New Form</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateForm} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Form Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adult ADHD Initial Screening Questionnaire"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Instructions displayed to patient at start of form..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Form Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  <option value="INTAKE">Clinical Intake</option>
                  <option value="CONSENT">Informed Consent</option>
                  <option value="FEEDBACK">Post-Consultation Feedback</option>
                  <option value="CONTACT">General Contact</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                >
                  Save &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
