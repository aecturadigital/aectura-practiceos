"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  Filter,
  Copy,
  Layers,
  Sparkles,
  Check,
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

  // New form builder state
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
      { id, label: "New Clinical Field", type: "text", required: false },
    ]);
  };

  const handleRemoveField = (id: string) => {
    setNewFields(newFields.filter((f) => f.id !== id));
  };

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    mockStore.createForm({
      tenantId: activeTenant.id,
      title: newTitle.trim(),
      type: newType,
      description: newDescription.trim(),
      fields: newFields,
      isActive: true,
    });

    setIsCreateOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleCopyLink = (formId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/portal/forms#${formId}`);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredForms = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.formTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Clinical Forms &amp; Intakes</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Form Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build specialized intake questionnaires, consent agreements, and automated feedback surveys with zero code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Form</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#12141A] p-1 rounded-2xl border border-[#232630] text-xs">
          <button
            onClick={() => setActiveTab("forms")}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === "forms"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Form Templates ({forms.length})
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === "submissions"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Submissions &amp; Responses ({submissions.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "forms" ? "Search templates..." : "Search respondents..."}
            className="w-full bg-[#12141A] border border-[#232630] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Content for TAB: FORMS */}
      {activeTab === "forms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-[#14161B] border border-[#232630] hover:border-slate-700 transition-all rounded-3xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                      form.type === "INTAKE"
                        ? "bg-teal-950 text-teal-300 border border-teal-800"
                        : form.type === "FEEDBACK"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : form.type === "CONSENT"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : "bg-sky-950 text-sky-300 border border-sky-800"
                    }`}
                  >
                    {form.type}
                  </span>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {form.fields.length} fields
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{form.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {form.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#20232C] space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Submissions:</span>
                  <span className="font-mono font-bold text-white">{form.submissionsCount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(form.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1B1E28] hover:bg-[#242835] text-slate-200 text-xs font-semibold border border-[#292D3B] transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedId === form.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      mockStore.updateForm(form.id, { isActive: !form.isActive });
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      form.isActive
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {form.isActive ? "Active" : "Paused"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content for TAB: SUBMISSIONS */}
      {activeTab === "submissions" && (
        <div className="bg-[#14161B] border border-[#232630] rounded-3xl overflow-hidden shadow-sm">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <FileText className="w-8 h-8 text-slate-700 mx-auto" />
              <p>No questionnaire responses match your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#101217] text-[10px] uppercase font-mono text-slate-400 border-b border-[#232630]">
                  <tr>
                    <th className="px-6 py-3.5">Respondent / Patient</th>
                    <th className="px-6 py-3.5">Questionnaire Form</th>
                    <th className="px-6 py-3.5">Submitted At</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20232C]">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#161822] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{sub.contactName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{sub.contactEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {sub.formTitle}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-800/60 font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Responses</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Response Detail Drawer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                  Patient Intake Record
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedSubmission.formTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  Submitted by <span className="font-bold text-white">{selectedSubmission.contactName}</span> on{" "}
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {Object.entries(selectedSubmission.answers).map(([key, val]) => (
                <div key={key} className="p-4 rounded-2xl bg-[#101216] border border-[#232630] space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <div className="text-sm font-semibold text-slate-200">
                    {typeof val === "boolean" ? (
                      val ? (
                        <span className="text-teal-400 flex items-center gap-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed &amp; Agreed
                        </span>
                      ) : (
                        "No"
                      )
                    ) : (
                      String(val)
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Form Template</h3>
                <p className="text-xs text-slate-400">Configure questions and patient disclosures.</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Form Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., ADHD Pre-Consultation Assessment"
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category / Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="INTAKE">INTAKE (Clinical History)</option>
                    <option value="CONTACT">CONTACT (Web Lead Capture)</option>
                    <option value="FEEDBACK">FEEDBACK (Post-Session)</option>
                    <option value="CONSENT">CONSENT (Legal/HIPAA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Short summary for patients"
                    className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Dynamic Field Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Questions &amp; Fields ({newFields.length})</span>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3 bg-[#101216] border border-[#252834] rounded-2xl flex items-center gap-2"
                    >
                      <span className="font-mono text-slate-500 text-[10px] w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...newFields];
                          updated[idx].label = e.target.value;
                          setNewFields(updated);
                        }}
                        className="flex-1 bg-transparent border-none text-white text-xs focus:outline-none"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const updated = [...newFields];
                          updated[idx].type = e.target.value as any;
                          setNewFields(updated);
                        }}
                        className="bg-[#181B24] border border-[#2B2F3D] rounded-lg px-2 py-1 text-[11px] text-slate-300"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Paragraph</option>
                        <option value="scale">Scale (1-10)</option>
                        <option value="select">Dropdown</option>
                        <option value="consent">Consent Checkbox</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#252834]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-[#20232C] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md"
                >
                  Save Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
