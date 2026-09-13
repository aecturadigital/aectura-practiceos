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
  FileSpreadsheet,
  FileImage,
  Lock,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";

interface VaultFile {
  id: string;
  name: string;
  category: "Intake" | "Imaging" | "Billing" | "Clinical";
  size: string;
  uploadedAt: string;
  patientName: string;
  isEncrypted: boolean;
}

const INITIAL_FILES: VaultFile[] = [
  {
    id: "f-1",
    name: "Priya_Sharma_Intake_Assessment_2026.pdf",
    category: "Intake",
    size: "1.4 MB",
    uploadedAt: "2026-03-01T14:20:00Z",
    patientName: "Priya Sharma",
    isEncrypted: true,
  },
  {
    id: "f-2",
    name: "Amit_Verma_Right_Knee_MRI_Report.pdf",
    category: "Imaging",
    size: "14.8 MB",
    uploadedAt: "2026-03-03T11:20:00Z",
    patientName: "Amit Verma",
    isEncrypted: true,
  },
  {
    id: "f-3",
    name: "Consultation_Invoice_MW_2026_091.pdf",
    category: "Billing",
    size: "245 KB",
    uploadedAt: "2026-03-02T16:00:00Z",
    patientName: "Priya Sharma",
    isEncrypted: true,
  },
  {
    id: "f-4",
    name: "Sneha_Rao_Therapy_Progress_Review.pdf",
    category: "Clinical",
    size: "680 KB",
    uploadedAt: "2026-02-28T10:15:00Z",
    patientName: "Sneha Rao",
    isEncrypted: true,
  },
  {
    id: "f-5",
    name: "Telehealth_Consent_Agreement_Rao.pdf",
    category: "Intake",
    size: "410 KB",
    uploadedAt: "2026-02-25T09:30:00Z",
    patientName: "Sneha Rao",
    isEncrypted: true,
  },
];

export default function StaffFilesPage() {
  const { activeTenant } = useTenant();
  const [files, setFiles] = useState<VaultFile[]>(INITIAL_FILES);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadCategory, setUploadCategory] = useState<VaultFile["category"]>("Intake");
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredFiles = files.filter((f) => {
    const matchCat = categoryFilter === "ALL" || f.category === categoryFilter;
    const matchSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      const newFile: VaultFile = {
        id: `f-${Date.now()}`,
        name: uploadFileName.endsWith(".pdf") ? uploadFileName : `${uploadFileName}.pdf`,
        category: uploadCategory,
        size: "2.1 MB",
        uploadedAt: new Date().toISOString(),
        patientName: "Clinic Patient",
        isEncrypted: true,
      };

      setFiles([newFile, ...files]);
      setIsUploading(false);
      setIsUploadOpen(false);
      setUploadFileName("");
      setToastMessage("Document uploaded and encrypted to Cloudflare R2 bucket.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 1000);
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

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161B] border border-[#232630] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <FolderLock className="w-3.5 h-3.5" />
            <span>Encrypted Object Storage (Cloudflare R2)</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clinical Document Vault</h1>
          <p className="text-xs text-slate-400 mt-1">
            HIPAA-grade pre-signed URL storage for patient intake forms, MRI/imaging scans, clinical notes, and billing receipts.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Storage Meter */}
      <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <HardDrive className="w-4 h-4 text-teal-400" />
            <span>Dedicated Tenant Bucket Allocation</span>
          </div>
          <span className="font-mono text-teal-400 font-bold">
            2.7 GB used of 20.0 GB (13.5%)
          </span>
        </div>
        <div className="h-2 w-full bg-[#101216] rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full w-[13.5%]" />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Zero egress charges via Cloudflare R2</span>
          <span>AES-256 at-rest encryption</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#12141A] p-1 rounded-2xl border border-[#232630] text-xs">
          {["ALL", "Intake", "Clinical", "Imaging", "Billing"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-all ${
                categoryFilter === cat
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filenames or patients..."
            className="w-full bg-[#12141A] border border-[#232630] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-[#14161B] border border-[#232630] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101217] text-[10px] uppercase font-mono text-slate-400 border-b border-[#232630]">
              <tr>
                <th className="px-6 py-3.5">Document Name</th>
                <th className="px-6 py-3.5">Patient Associated</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Size</th>
                <th className="px-6 py-3.5">Uploaded</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20232C]">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-[#161822] transition-colors">
                  <td className="px-6 py-4 font-semibold text-white flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="truncate max-w-xs">{file.name}</span>
                    <span title="Encrypted">
                      <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {file.patientName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1B1E28] text-teal-400 border border-[#2A2E3B]">
                      {file.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{file.size}</td>
                  <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setToastMessage(`Generated signed download URL for ${file.name}`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1B1E28] hover:bg-[#252A36] text-slate-200 border border-[#2A2E3B] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-400" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Upload Clinical Document</h3>
                <p className="text-xs text-slate-400">
                  Uploaded directly via secure pre-signed URLs.
                </p>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleSimulateUpload} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g., Clinical_Evaluation_Report"
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vault Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full bg-[#101216] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Intake">Intake Form &amp; Questionnaire</option>
                  <option value="Clinical">Clinical Progress Note / Referral</option>
                  <option value="Imaging">Radiology / MRI / Diagnostic Scan</option>
                  <option value="Billing">Invoice &amp; Payment Receipt</option>
                </select>
              </div>

              {/* Drag & Drop Box */}
              <div className="p-6 border-2 border-dashed border-[#2B2F3D] rounded-2xl text-center space-y-2 bg-[#12141A]">
                <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-semibold text-slate-300">Choose file or drag here</p>
                <p className="text-[10px] text-slate-500 font-mono">PDF, PNG, JPEG up to 50MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-[#20232C] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFileName.trim()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold shadow-md flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <span>Encrypting &amp; Uploading...</span>
                  ) : (
                    <span>Upload to Vault</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
