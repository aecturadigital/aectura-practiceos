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

  const [activeTab, setActiveTab] = useState<"sections" | "hero" | "seo" | "domain">("sections");
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

  const handleSaveContent = (e: React.FormEvent) => {
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
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Website</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Live Preview Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Content sections, practice hero messaging, and custom domain setup
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/preview/${activeTenant.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Live Preview</span>
            <ExternalLink className="w-3 h-3 text-teal-200" />
          </Link>
        </div>
      </div>

      {savedNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Website content saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-md border border-slate-200 bg-white p-0.5 w-fit">
        <button
          onClick={() => setActiveTab("sections")}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            activeTab === "sections"
              ? "bg-slate-100 text-slate-900 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sections &amp; Order
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            activeTab === "hero"
              ? "bg-slate-100 text-slate-900 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Hero Copy
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            activeTab === "seo"
              ? "bg-slate-100 text-slate-900 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          SEO &amp; Meta
        </button>
        <button
          onClick={() => setActiveTab("domain")}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            activeTab === "domain"
              ? "bg-slate-100 text-slate-900 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Custom Domain
        </button>
      </div>

      {/* TAB 1: Sections */}
      {activeTab === "sections" && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 shadow-none">
          {websiteConfig.sections.map((section, idx) => (
            <div
              key={section.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-mono font-medium text-slate-400">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    {section.title}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    #{section.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveSection(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 border border-slate-200 hover:bg-white"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveSection(idx, "down")}
                  disabled={idx === websiteConfig.sections.length - 1}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 border border-slate-200 hover:bg-white"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleSection(section.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                    section.isEnabled
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {section.isEnabled ? "Visible" : "Hidden"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Hero */}
      {activeTab === "hero" && (
        <form onSubmit={handleSaveContent} className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-none">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Badge Text</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Main Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subheadline</label>
            <textarea
              rows={3}
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Call to Action Button</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SEO */}
      {activeTab === "seo" && (
        <form onSubmit={handleSaveContent} className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-none">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Page Title Tag</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Meta Description</label>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium rounded-md transition-colors"
            >
              Save SEO Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Custom Domain */}
      {activeTab === "domain" && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-none">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Custom Practice Domain</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. clinic.example.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
              />
              <button
                onClick={handleSaveContent}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium rounded-md transition-colors"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Add a CNAME pointing to <code className="font-mono text-slate-600">cname.practiceos.in</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
