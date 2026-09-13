"use client";

import React, { useState } from "react";
import {
  FolderLock,
  UploadCloud,
  FileText,
  Search,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  File,
  X,
  Plus,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";

interface VaultFile {
  id: string;
  name: string;
  category: "Intake" | "Imaging" | "Billing" | "Clinical";
  size: string;
  uploadedAt: string;
  patientName: string;
}

const INITIAL_FILES: VaultFile[] = [
  {
    id: "f-1",
    name: "Priya_Sharma_Intake_Assessment_2026.pdf",
    category: "Intake",
    size: "1.4 MB",
    uploadedAt: "2026-09-10",
    patientName: "Priya Sharma",
  },
  {
    id: "f-2",
    name: "Amit_Verma_Right_Knee_MRI_Report.pdf",
    category: "Imaging",
    size: "14.8 MB",
    uploadedAt: "2026-09-08",
    patientName: "Amit Verma",
  },
  {
    id: "f-3",
    name: "Consultation_Invoice_MW_2026_091.pdf",
    category: "Billing",
    size: "245 KB",
    uploadedAt: "2026-09-07",
    patientName: "Priya Sharma",
  },
  {
    id: "f-4",
    name: "Sneha_Rao_Therapy_Progress_Review.pdf",
    category: "Clinical",
    size: "820 KB",
    uploadedAt: "2026-09-05",
    patientName: "Sneha Rao",
  },
];

export default function StaffFilesPage() {
  const { activeTenant } = useTenant();
  const [files, setFiles] = useState<VaultFile[]>(INITIAL_FILES);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filtered = files.filter((f) => {
    const matchCat = selectedCategory === "ALL" || f.category === selectedCategory;
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.patientName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Files</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Encrypted Storage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clinical documents, patient assessments, lab scans, and signed forms
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative max-w-md flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by file or patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-teal-600 bg-white text-slate-900"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto text-xs">
          {["ALL", "Intake", "Imaging", "Clinical", "Billing"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-200 text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {cat === "ALL" ? "All Files" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-4">Document</th>
              <th className="py-2.5 px-4">Patient</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Size</th>
              <th className="py-2.5 px-4">Uploaded</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((file) => (
              <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-900">{file.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-700">{file.patientName}</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {file.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{file.size}</td>
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{file.uploadedAt}</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
