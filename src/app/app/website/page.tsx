"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Layout,
  ExternalLink,
  Eye,
  Check,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Palette,
  Search,
  Sparkles,
  Sliders,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { WebsiteSection } from "@/types";

export default function WebsiteEditorPage() {
  const { activeTenant } = useTenant();
  const [websiteConfig, setWebsiteConfig] = useState(() =>
    mockStore.getWebsiteConfig(activeTenant.id)
  );

  const [activeTab, setActiveTab] = useState<
    "sections" | "hero" | "seo" | "domain"
  >("sections");

  const [savedNotice, setSavedNotice] = useState(false);

  // Hero form states
  const [badge, setBadge] = useState(websiteConfig.hero.badge);
  const [headline, setHeadline] = useState(websiteConfig.hero.headline);
  const [subheadline, setSubheadline] = useState(websiteConfig.hero.subheadline);
  const [ctaText, setCtaText] = useState(websiteConfig.hero.ctaText);

  // SEO form states
  const [metaTitle, setMetaTitle] = useState(websiteConfig.seo.metaTitle);
  const [metaDescription, setMetaDescription] = useState(websiteConfig.seo.metaDescription);

  // Custom domain
  const [customDomain, setCustomDomain] = useState(websiteConfig.customDomain || "");

  const handleToggleSection = (sectionId: string) => {
    const updatedSections = websiteConfig.sections.map((s) =>
      s.id === sectionId ? { ...s, isEnabled: !s.isEnabled } : s
    );
    const updated = { ...websiteConfig, sections: updatedSections };
    setWebsiteConfig(updated);
    mockStore.updateWebsiteConfig(activeTenant.id, { sections: updatedSections });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...websiteConfig.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const updated = { ...websiteConfig, sections: newSections };
    setWebsiteConfig(updated);
    mockStore.updateWebsiteConfig(activeTenant.id, { sections: newSections });
  };

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.updateWebsiteConfig(activeTenant.id, {
      hero: {
        ...websiteConfig.hero,
        badge,
        headline,
        subheadline,
        ctaText,
      },
      seo: {
        metaTitle,
        metaDescription,
      },
      customDomain,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22252C] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Website Section Editor</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
              Live Preview Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reorder, toggle, and customize public practice blocks with instant synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/preview/${activeTenant.slug}`}
            target="_blank"
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Open Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-teal-950/80 border border-teal-800 rounded-xl text-teal-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Website content updated! Refresh the public preview to see immediate changes.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#242833] flex gap-2">
        <button
          onClick={() => setActiveTab("sections")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "sections"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Section Blocks &amp; Order
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "hero"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Hero Copy &amp; Headlines
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "seo"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          SEO &amp; Meta Tags
        </button>
        <button
          onClick={() => setActiveTab("domain")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "domain"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Custom Domain Routing
        </button>
      </div>

      {/* Tab 1: Section Blocks Manager */}
      {activeTab === "sections" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-white">Homepage Block Layout</h2>
              <p className="text-xs text-slate-400">
                Toggle block visibility or reorder elements to customize patient presentation.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {websiteConfig.sections.map((section, idx) => (
              <div
                key={section.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                  section.isEnabled
                    ? "bg-[#121417] border-[#272A34] text-white"
                    : "bg-[#111315]/50 border-[#1E2129] text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-white block">{section.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">block_id: {section.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder Up/Down */}
                  <div className="flex items-center border border-[#272A34] rounded-lg bg-[#181B22] p-0.5">
                    <button
                      onClick={() => handleMoveSection(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(idx, "down")}
                      disabled={idx === websiteConfig.sections.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Visibility */}
                  <button
                    onClick={() => handleToggleSection(section.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      section.isEnabled
                        ? "bg-teal-950 text-teal-400 border border-teal-800"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {section.isEnabled ? "Visible" : "Hidden"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Hero Copy */}
      {activeTab === "hero" && (
        <form onSubmit={handleSaveHero} className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-semibold text-white">Hero Header Configuration</h2>
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Hero Badge Pill</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Main Headline *</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Sub-headline Description *</label>
              <textarea
                rows={3}
                required
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full bg-[#111315] border border-[#272A34] rounded-xl p-3 text-white leading-relaxed"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Primary Booking Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="pt-3 border-t border-[#242833] flex justify-end">
              <button
                type="submit"
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: SEO */}
      {activeTab === "seo" && (
        <form onSubmit={handleSaveHero} className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-semibold text-white">Search Engine Optimization (SEO)</h2>
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Page Title Tag (60 chars)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full bg-[#111315] border border-[#272A34] rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Meta Description (160 chars)</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full bg-[#111315] border border-[#272A34] rounded-xl p-3 text-white"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#111315] border border-[#272A34] space-y-1">
              <p className="text-slate-400 font-medium">Google Search Snippet Preview</p>
              <p className="text-sky-400 font-semibold text-sm truncate">{metaTitle}</p>
              <p className="text-emerald-500 font-mono text-[11px]">
                https://preview.aectura.cloud/{activeTenant.slug}
              </p>
              <p className="text-slate-400 text-[11px] line-clamp-2">{metaDescription}</p>
            </div>

            <div className="pt-3 border-t border-[#242833] flex justify-end">
              <button
                type="submit"
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Update SEO Metadata</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: Domain */}
      {activeTab === "domain" && (
        <div className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white">Custom Domain Architecture</h2>
            <p className="text-xs text-slate-400">
              Cloudflare for SaaS edge routing with automated SSL certificates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#111315] border border-[#272A34] space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Custom Practice Domain</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. care.mindwellpsychology.in"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full bg-[#1A1D24] border border-[#2B2F3C] rounded-xl px-3 py-2 text-white font-mono"
                />
                <button
                  onClick={() => alert("DNS CNAME verification check simulated: Ready for routing.")}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-4 py-2 rounded-xl whitespace-nowrap"
                >
                  Verify CNAME
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
              <p className="text-slate-300 font-semibold">Required DNS Record:</p>
              <p>Type: CNAME</p>
              <p>Host: {customDomain.split(".")[0] || "care"}</p>
              <p>Target: saas-cname.aectura.cloud</p>
              <p>Proxy Status: DNS Only</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
