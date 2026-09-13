"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Sparkles,
  Layers,
  CreditCard,
  Palette,
  Users,
  Briefcase,
  Globe,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  Check,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { Tenant, PlanId, VerticalType, StaffUser, ServiceItem } from "@/types";
import { PLANS } from "@/lib/plans";
import { getVerticalConfig } from "@/lib/verticals";

export default function CreatePracticeWizardPage() {
  const router = useRouter();
  const { switchTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [phone, setPhone] = useState("+91 98271 55440");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("+91 98271 55440");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Raipur");
  const [state, setState] = useState("Chhattisgarh");
  const [country, setCountry] = useState("India");
  const [existingWebsite, setExistingWebsite] = useState("");
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");

  // Step 2: Vertical
  const [vertical, setVertical] = useState<VerticalType>("psychology");

  // Step 3: Template
  const [template, setTemplate] = useState("calm_professional");

  // Step 4: Plan
  const [planId, setPlanId] = useState<PlanId>("practiceflow");

  // Step 5: Branding
  const [primaryColor, setPrimaryColor] = useState("#0D9488");
  const [accentColor, setAccentColor] = useState("#111315");
  const [font, setFont] = useState("Inter");
  const [buttonStyle, setButtonStyle] = useState<"rounded" | "pill" | "square">("rounded");
  const [tagline, setTagline] = useState("");

  // Step 6: Team
  const [team, setTeam] = useState<StaffUser[]>([
    {
      id: "staff-new-1",
      tenantId: "",
      name: "Dr. Alok Verma",
      email: "dr.alok@practice.com",
      phone: "+91 98271 55441",
      role: "OWNER",
      title: "Lead Practitioner & Founder",
      qualifications: "M.D. / Senior Clinical Specialist",
      specialization: "General Practice & Patient Management",
      bio: "Dedicated healthcare professional providing compassionate, evidence-based care.",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
      isActive: true,
    },
  ]);

  // Step 7: Services
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "srv-new-1",
      tenantId: "",
      name: "Initial Comprehensive Assessment",
      durationMinutes: 50,
      price: 1500,
      description: "Complete initial clinical consultation and evaluation.",
      category: "Assessment",
      isOnlineAvailable: true,
      isHomeVisitAvailable: false,
    },
    {
      id: "srv-new-2",
      durationMinutes: 40,
      tenantId: "",
      name: "Standard Follow-Up Consultation",
      price: 1000,
      description: "Routine follow-up session and care review.",
      category: "Therapy",
      isOnlineAvailable: true,
      isHomeVisitAvailable: false,
    },
  ]);

  // Step 8: Generated Result
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);

  // Generate slug
  const slug = (businessName || "new-practice")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreatePractice = () => {
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      slug: slug || `practice-${Date.now()}`,
      name: businessName || "Sunrise Healthcare Centre",
      legalName: legalName || `${businessName || "Sunrise Healthcare"} Pvt Ltd`,
      verticalId: vertical,
      planId: planId,
      templateId: template,
      status: "PREVIEW",
      city: city || "Raipur",
      state: state || "Chhattisgarh",
      country: country || "India",
      address: address || "City Centre Medical Enclave, Main Road",
      phone: phone,
      email: email || `contact@${slug}.in`,
      whatsapp: whatsapp,
      existingWebsite: existingWebsite,
      googleBusinessUrl: googleBusinessUrl,
      instagramUrl: instagram,
      facebookUrl: facebook,
      branding: {
        primaryColor,
        accentColor,
        font,
        buttonStyle,
        tagline: tagline || "Evidence-based, compassionate care for your health and wellbeing.",
      },
      settings: {
        timezone: "Asia/Kolkata",
        currency: "INR",
        bookingLeadTimeHours: 2,
        cancellationCutoffHours: 12,
        bufferMinutes: 15,
        autoConfirmAppointments: false,
        aiReceptionistEnabled: planId === "practiceos_ai",
        aiTone: "warm",
        aiName: "Maya",
      },
      team: team.map((m) => ({ ...m, tenantId: `tenant-${Date.now()}` })),
      services: services.map((s) => ({ ...s, tenantId: `tenant-${Date.now()}` })),
      createdAt: new Date().toISOString(),
      previewExpiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    };

    // Save into MockStore
    const { mockStore } = require("@/lib/mock/store");
    mockStore.createTenant(newTenant);
    switchTenant(newTenant.id);
    setCreatedTenant(newTenant);
  };

  const stepTitles = [
    "Business Details",
    "Select Vertical",
    "Choose Template",
    "Subscription Plan",
    "Branding & Style",
    "Team & Providers",
    "Clinical Services",
    "Generate Preview",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#22252C] pb-6">
        <div>
          <Link
            href="/platform/tenants"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel &amp; Return</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Practice Wizard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-7 h-1.5 rounded-full transition-all ${
                i + 1 === currentStep
                  ? "bg-teal-500 w-9"
                  : i + 1 < currentStep
                  ? "bg-teal-800"
                  : "bg-[#272A34]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Success Screen after Step 8 */}
      {createdTenant ? (
        <div className="bg-[#16181D] border border-teal-800/60 rounded-3xl p-8 sm:p-12 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-teal-950/80 border border-teal-700/80 text-teal-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono font-semibold text-teal-400 uppercase tracking-widest px-3 py-1 rounded-full bg-teal-950 border border-teal-800 mb-3 inline-block">
            Practice Successfully Provisioned
          </span>

          <h2 className="text-3xl font-extrabold text-white mb-2">{createdTenant.name}</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6">
            Private preview environment generated with dynamic vertical schemas, branding colors, and isolated tenant routing.
          </p>

          <div className="bg-[#111315] border border-[#272A34] rounded-2xl p-4 max-w-md mx-auto mb-8 text-left">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Private Preview URL
            </p>
            <p className="text-xs font-mono text-teal-300 select-all">
              preview.aectura.cloud/{createdTenant.slug}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/preview/${createdTenant.slug}`}
              target="_blank"
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Open Public Practice Site</span>
            </Link>

            <Link
              href="/app"
              className="bg-[#1F232B] hover:bg-[#282C37] text-slate-200 font-semibold text-xs px-5 py-3 rounded-xl border border-[#2B2F3C] transition-colors flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Open Staff Dashboard</span>
            </Link>

            <Link
              href={`/platform/tenants/${createdTenant.id}`}
              className="bg-[#181A1F] hover:bg-[#20232A] text-slate-300 font-semibold text-xs px-4 py-3 rounded-xl border border-[#242833] transition-colors"
            >
              Edit Practice Details
            </Link>
          </div>
        </div>
      ) : (
        /* Wizard Steps Container */
        <div className="bg-[#16181D] border border-[#242833] rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* STEP 1: Business Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Clinic &amp; Business Profile</h2>
                <p className="text-xs text-slate-400">
                  Primary business details used for clinical communication, invoice generation, and SEO headers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Practice Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Therapy & Wellness"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Legal Entity Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Health LLP"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Clinic Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">WhatsApp Booking Number *</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="clinic@apexhealth.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1 font-medium">Physical Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Suite 102, Healthcare Towers, Ring Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Select Vertical */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Select Practice Healthcare Vertical</h2>
                <p className="text-xs text-slate-400">
                  Each vertical configures specialized terminology, intake fields, clinical notes, and treatment schemas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Psychology Card */}
                <div
                  onClick={() => {
                    setVertical("psychology");
                    setTemplate("calm_professional");
                    setPrimaryColor("#0D9488");
                  }}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    vertical === "psychology"
                      ? "bg-teal-950/40 border-teal-500 shadow-lg"
                      : "bg-[#13151A] border-[#272A34] hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700">
                      Mental Healthcare
                    </span>
                    {vertical === "psychology" && <Check className="w-5 h-5 text-teal-400" />}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Psychology &amp; Psychotherapy</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Designed for clinical psychologists, counsellors, and psychotherapists.
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>&bull; Terminology: <strong>Client</strong> &amp; <strong>Therapy Session</strong></li>
                    <li>&bull; Pre-configured PHQ-9 &amp; GAD-7 screening</li>
                    <li>&bull; Confidentiality &amp; emergency contact policies</li>
                  </ul>
                </div>

                {/* Physiotherapy Card */}
                <div
                  onClick={() => {
                    setVertical("physiotherapy");
                    setTemplate("modern_rehab");
                    setPrimaryColor("#0284C7");
                  }}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    vertical === "physiotherapy"
                      ? "bg-sky-950/40 border-sky-500 shadow-lg"
                      : "bg-[#13151A] border-[#272A34] hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700">
                      Physical Health &amp; Rehab
                    </span>
                    {vertical === "physiotherapy" && <Check className="w-5 h-5 text-sky-400" />}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Physiotherapy &amp; Rehabilitation</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Designed for musculoskeletal physical therapists, sports clinics, and post-op rehab centers.
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>&bull; Terminology: <strong>Patient</strong> &amp; <strong>Rehab Consultation</strong></li>
                    <li>&bull; Range of motion, pain scale &amp; home exercises</li>
                    <li>&bull; Sports return-to-play tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Choose Template */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Choose Website Template</h2>
                <p className="text-xs text-slate-400">
                  Select a tailored aesthetic for the practice&apos;s public digital storefront.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {getVerticalConfig(vertical).templates.map((tpl) => {
                  const isSelected = template === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setTemplate(tpl.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-teal-950/40 border-teal-500 shadow-md"
                          : "bg-[#13151A] border-[#272A34] hover:border-slate-600"
                      }`}
                    >
                      <div>
                        {/* Miniature Preview Box */}
                        <div className="h-24 rounded-xl bg-[#1D2028] border border-[#2B2F3C] mb-3 flex flex-col justify-between p-2.5">
                          <div className="flex items-center justify-between">
                            <div className="w-4 h-4 rounded bg-teal-500/80" />
                            <div className="flex gap-1">
                              <div className="w-6 h-1 rounded bg-slate-700" />
                              <div className="w-6 h-1 rounded bg-slate-700" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="w-20 h-2 rounded bg-slate-400" />
                            <div className="w-12 h-1.5 rounded bg-teal-500" />
                          </div>
                        </div>

                        <h3 className="font-bold text-white text-sm mb-1">{tpl.name}</h3>
                        <p className="text-xs text-slate-400 leading-snug">{tpl.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#242833] flex justify-between items-center text-xs">
                        <span className="text-slate-500 text-[10px]">Variant</span>
                        {isSelected ? (
                          <span className="text-teal-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-slate-400">Select</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Choose Plan */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Select Aectura Subscription Plan</h2>
                <p className="text-xs text-slate-400">
                  Tiered feature packaging and resource limits for the clinic.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["presence", "practiceflow", "practiceos_ai"] as PlanId[]).map((pid) => {
                  const p = PLANS[pid];
                  const isSelected = planId === pid;
                  return (
                    <div
                      key={pid}
                      onClick={() => setPlanId(pid)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-teal-950/40 border-teal-500 shadow-md"
                          : "bg-[#13151A] border-[#272A34] hover:border-slate-600"
                      }`}
                    >
                      <div>
                        {p.isPopular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-900 text-teal-300 border border-teal-700 mb-2 inline-block">
                            MOST POPULAR
                          </span>
                        )}
                        <h3 className="font-bold text-white text-base mb-1">{p.name}</h3>
                        <p className="text-xs text-slate-400 mb-3">{p.tagline}</p>
                        <div className="mb-4">
                          <p className="text-xl font-bold text-teal-400 font-mono">
                            ₹{p.monthlyFeeInr.toLocaleString("en-IN")}
                            <span className="text-xs text-slate-400 font-normal">/mo</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            ₹{p.setupFeeInr.toLocaleString("en-IN")} one-time setup
                          </p>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {p.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#242833] text-right">
                        {isSelected ? (
                          <span className="text-xs text-teal-400 font-semibold flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Choose Plan</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Branding */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Branding &amp; Visual Design</h2>
                <p className="text-xs text-slate-400">
                  Custom colors, typography, and button styling applied to public website and patient portal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Primary Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#2B2F3B]"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Accent Dark Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#2B2F3B]"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1 font-medium">Practice Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Evidence-Based Clinical Care for Raipur"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-[#111315] border border-[#2B2F3B] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Team */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Team &amp; Clinical Practitioners</h2>
                  <p className="text-xs text-slate-400">Add doctors, therapists, or coordinators.</p>
                </div>
              </div>

              <div className="space-y-3">
                {team.map((member, idx) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl bg-[#111315] border border-[#272A34] flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white text-sm">{member.name}</p>
                      <p className="text-teal-400">{member.title}</p>
                      <p className="text-slate-400 text-[11px] mt-1">{member.qualifications}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Services */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Clinical Services &amp; Fees</h2>
                <p className="text-xs text-slate-400">Configure consultation types and pricing.</p>
              </div>

              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-xl bg-[#111315] border border-[#272A34] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{srv.name}</p>
                      <p className="text-slate-400 text-[11px]">{srv.durationMinutes} min &bull; {srv.description}</p>
                    </div>
                    <span className="font-bold text-teal-400 font-mono text-sm">
                      ₹{srv.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: Review & Generate */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Review &amp; Generate Private Preview</h2>
                <p className="text-xs text-slate-400">
                  Verify practice parameters before launching the isolated preview tenant.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-[#111315] p-5 rounded-2xl border border-[#272A34]">
                <div>
                  <span className="text-slate-400 block mb-1">Practice Name</span>
                  <span className="font-bold text-white text-sm">{businessName || "Sunrise Healthcare"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Subdomain Slug</span>
                  <span className="font-mono text-teal-400 text-sm">/{slug}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Vertical</span>
                  <span className="capitalize font-semibold text-white">{vertical}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Subscription Tier</span>
                  <span className="capitalize font-semibold text-teal-400">{planId.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Primary Color</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} />
                    <span className="font-mono text-white">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Location</span>
                  <span className="text-white">{city}, {state}</span>
                </div>
              </div>

              <div className="p-4 bg-teal-950/40 border border-teal-800/60 rounded-xl text-xs text-teal-300">
                Generating preview creates an isolated tenant environment with `noindex` headers and instant public site navigation.
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[#242833] mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                currentStep === 1
                  ? "border-transparent text-slate-600 cursor-not-allowed"
                  : "border-[#272A34] text-slate-300 hover:bg-[#1E2129] hover:text-white"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreatePractice}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Private Preview</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
