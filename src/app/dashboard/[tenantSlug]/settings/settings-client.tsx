"use client";

import { useState } from "react";
import { Tenant } from "@/lib/db/schema";
import { Palette, CheckCircle2, Shield, Building } from "lucide-react";

export function SettingsClient({ tenant }: { tenant: Tenant }) {
  const [primaryColor, setPrimaryColor] = useState(tenant.branding?.primaryColor || "#0D9488");
  const [tagline, setTagline] = useState(tenant.branding?.tagline || "");
  const [phone, setPhone] = useState(tenant.branding?.phone || "");
  const [email, setEmail] = useState(tenant.branding?.email || "");
  const [address, setAddress] = useState(tenant.branding?.address || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branding: {
            primaryColor,
            tagline,
            phone,
            email,
            address,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to update branding");

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-teal-950/80 border border-teal-800 text-teal-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Branding settings updated successfully! Changes reflect immediately on your public portal and preview.</span>
        </div>
      )}

      {/* Visual Palette */}
      <div className="bg-[#14171C] border border-[#222630] rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#222630] pb-3">
          <Palette className="w-4 h-4 text-teal-400" /> Visual Identity &amp; Accent Color
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5">Primary Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-[#2B303D] bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 bg-[#111317] border border-[#262A35] rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1.5">Live Color Sample</label>
            <div
              className="h-10 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-inner"
              style={{ backgroundColor: primaryColor }}
            >
              Accent Preview Button
            </div>
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-400 mb-1.5">Practice Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3.5 py-2 text-white"
          />
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-[#14171C] border border-[#222630] rounded-xl p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#222630] pb-3">
          <Building className="w-4 h-4 text-teal-400" /> Clinic Contact &amp; Location
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">Clinic Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3.5 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Public Inquiries Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3.5 py-2 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Physical Clinic Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#111317] border border-[#262A35] rounded-lg px-3.5 py-2 text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm"
        >
          {isSaving ? "Updating Settings..." : "Save Branding Changes"}
        </button>
      </div>
    </form>
  );
}
