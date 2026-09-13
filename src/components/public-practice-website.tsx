"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  User,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Star,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
  Activity,
  Heart,
} from "lucide-react";
import { Tenant, ServiceItem, StaffUser } from "@/types";
import { mockStore } from "@/lib/mock/store";
import { getVerticalConfig } from "@/lib/verticals";

interface PublicPracticeWebsiteProps {
  tenant: Tenant;
  isPreview?: boolean;
}

export function PublicPracticeWebsite({ tenant, isPreview = false }: PublicPracticeWebsiteProps) {
  const vertical = getVerticalConfig(tenant.verticalId);
  const websiteConfig = mockStore.getWebsiteConfig(tenant.id);
  const branding = tenant.branding;
  const primaryColor = branding.primaryColor || (tenant.verticalId === "psychology" ? "#0D9488" : "#0284C7");

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    tenant.services?.[0]?.id || ""
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    tenant.team?.[0]?.id || ""
  );
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("2026-09-16");
  const [bookingTime, setBookingTime] = useState("11:00");
  const [bookingMode, setBookingMode] = useState<"IN_PERSON" | "ONLINE" | "HOME_VISIT">("IN_PERSON");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const [first, ...last] = clientName.split(" ");
    const srv = tenant.services.find((s) => s.id === selectedServiceId) || tenant.services[0];
    const doc = tenant.team.find((m) => m.id === selectedStaffId) || tenant.team[0];

    // Create or find contact in MockStore
    const newContact = mockStore.createContact({
      id: `cnt-${Date.now()}`,
      tenantId: tenant.id,
      firstName: first,
      lastName: last.join(" ") || "",
      fullName: clientName,
      phone: clientPhone,
      email: clientEmail || `${first.toLowerCase()}@example.com`,
      status: "LEAD",
      assignedPractitionerId: doc?.id || "staff-1",
      tags: ["Website Booking"],
      notesCount: 1,
      lastContactedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      city: tenant.city,
    });

    // Create CRM Deal
    mockStore.createCrmDeal({
      id: `deal-${Date.now()}`,
      tenantId: tenant.id,
      contactId: newContact.id,
      contactName: clientName,
      contactPhone: clientPhone,
      contactEmail: newContact.email,
      title: `${srv?.name || "Consultation"} (Web Lead)`,
      value: srv?.price || 1800,
      stage: "NEW_ENQUIRY",
      priority: "HIGH",
      source: "WEBSITE",
      assignedToStaffId: doc?.id || "staff-1",
      nextFollowUpDate: bookingDate,
      notes: bookingNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create Appointment slot
    mockStore.createAppointment({
      id: `apt-${Date.now()}`,
      tenantId: tenant.id,
      contactId: newContact.id,
      contactName: clientName,
      contactPhone: clientPhone,
      staffId: doc?.id || "staff-1",
      staffName: doc?.name || "Practitioner",
      serviceId: srv?.id || "srv-1",
      serviceName: srv?.name || "Consultation",
      date: bookingDate,
      startTime: bookingTime,
      durationMinutes: srv?.durationMinutes || 50,
      mode: bookingMode,
      status: "REQUESTED",
      location: bookingMode === "ONLINE" ? "Secure Telehealth Room" : `${tenant.city} Clinic Suite`,
      notes: bookingNotes,
      intakeFormSubmitted: false,
      createdAt: new Date().toISOString(),
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsBookingOpen(false);
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setBookingNotes("");
    }, 2500);
  };

  const isPsychology = tenant.verticalId === "psychology";

  const faqs = isPsychology
    ? [
        {
          q: "What can I expect in my first therapy session?",
          a: "The initial assessment is a structured, collaborative conversation focusing on what brings you to therapy, your personal background, and your primary goals. We work together to formulate an evidence-based roadmap tailored to your pace.",
        },
        {
          q: "Are session conversations completely confidential?",
          a: "Yes. All clinical consultations adhere strictly to professional ethical guidelines and healthcare data confidentiality. Information is never disclosed without your explicit consent, except in rare medical emergencies where acute safety is concerned.",
        },
        {
          q: "Do you offer online / telehealth therapy?",
          a: "Yes, our licensed psychologists conduct secure, encrypted telehealth consultations for clients across India and internationally.",
        },
        {
          q: "What is your cancellation or rescheduling policy?",
          a: "We request at least 12 hours notice for appointment rescheduling to allow other clients on our waitlist to utilize the slot.",
        },
      ]
    : [
        {
          q: "Do I need a doctor's referral to start physiotherapy?",
          a: "No referral is required for private physical therapy evaluations. However, if you have recent orthopaedic surgical notes or X-ray/MRI reports, bringing them to your initial assessment helps us calibrate your load progression.",
        },
        {
          q: "How long does each rehab session take?",
          a: "Initial musculoskeletal evaluations take 45 to 60 minutes. Follow-up manual therapy and targeted exercise sessions typically range from 30 to 45 minutes.",
        },
        {
          q: "Do you provide home visit physiotherapy?",
          a: "Yes, MotionPlus provides dedicated home rehabilitation services for post-surgical orthopaedic patients and geriatric fall prevention in Bhilai and surrounding areas.",
        },
        {
          q: "How many sessions will I need before seeing improvement?",
          a: "Most acute musculoskeletal conditions notice pain reduction within 3 to 5 sessions, while comprehensive post-op ligament reconstruction protocols span 8 to 12 weeks of progressive loading.",
        },
      ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#121417] flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-900">
      {/* Optional Preview Banner */}
      {isPreview && (
        <div className="bg-[#111315] text-slate-300 text-xs py-2 px-4 border-b border-[#272A34] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              <strong>Private Practice Preview:</strong> This is the live public storefront for{" "}
              <strong className="text-white">{tenant.name}</strong>.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-teal-400 hover:underline">
              Open Staff Dashboard &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href={`/preview/${tenant.slug}`} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              {tenant.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
                {tenant.name}
              </span>
              <span className="text-[11px] text-slate-500 capitalize block">
                {tenant.city} &bull; {vertical.displayName}
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#services" className="hover:text-slate-900 transition-colors">
              Treatments &amp; Care
            </a>
            <a href="#team" className="hover:text-slate-900 transition-colors">
              Our {vertical.terminology.practitionerTitle}s
            </a>
            <a href="#reviews" className="hover:text-slate-900 transition-colors">
              Reviews
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">
              FAQs
            </a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">
              Location &amp; Hours
            </a>
          </nav>

          {/* Direct CTA */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Triage</span>
            </a>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all hover:opacity-95 flex items-center gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Consultation</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-[#F9F9FB]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            <span>{websiteConfig.hero.badge || `${tenant.name} • ${tenant.city}`}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mb-6 leading-tight max-w-4xl mx-auto">
            {websiteConfig.hero.headline}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            {websiteConfig.hero.subheadline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{websiteConfig.hero.ctaText || "Book Consultation"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#team"
              className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-2xl border border-slate-200 transition-colors flex items-center gap-2"
            >
              <span>{websiteConfig.hero.secondaryCtaText || `Meet Our ${vertical.terminology.practitionerTitle}s`}</span>
            </a>
          </div>

          {/* Highlights Mini Row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Licensed Clinical Specialists</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>In-Person &amp; Video Consultations</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Confidential Patient Care</span>
            </span>
          </div>
        </div>
      </section>

      {/* Trust & Accreditations Bar */}
      <section className="py-6 border-b border-slate-200 bg-white px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-6 text-xs text-slate-500 uppercase tracking-widest font-mono">
          <span>&bull; Evidence-Based Protocol</span>
          <span>&bull; {tenant.city} Private Practice</span>
          <span>&bull; Patient Portal Integrated</span>
          <span>&bull; RCI / Clinical Board Standards</span>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Clinical Scope
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Consultations &amp; Clinical Services
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Personalized treatment formulations delivered with clinical precision and empathetic care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenant.services?.map((srv) => (
            <div
              key={srv.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {srv.durationMinutes} Minutes
                  </span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    ₹{srv.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{srv.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">{srv.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">{srv.category}</span>
                <button
                  onClick={() => {
                    setSelectedServiceId(srv.id);
                    setIsBookingOpen(true);
                  }}
                  className="text-xs font-semibold hover:underline flex items-center gap-1"
                  style={{ color: primaryColor }}
                >
                  <span>Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conditions Treated Section */}
      <section className="py-16 bg-slate-100/60 border-y border-slate-200 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">
              Areas of Specialization &amp; Care
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Common challenges, symptoms, and rehabilitation goals addressed at {tenant.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {vertical.commonConcerns.map((concern, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-slate-400 transition-colors shadow-2xs"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-xs font-bold shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {idx + 1}
                </div>
                <p className="font-semibold text-xs text-slate-900 leading-tight">{concern}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practitioners Team Section */}
      <section id="team" className="py-16 sm:py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Clinical Excellence
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Meet Our {vertical.terminology.practitionerTitle}s
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Experienced specialists dedicated to ethical, evidence-based healthcare in {tenant.city}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tenant.team?.filter((m) => m.role === "OWNER" || m.role === "PRACTITIONER").map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 mx-auto mb-4 overflow-hidden shadow-sm">
                  {doc.avatarUrl ? (
                    <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-700">
                      {doc.name.charAt(0)}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base text-center">{doc.name}</h3>
                <p className="text-xs font-semibold text-center mt-0.5" style={{ color: primaryColor }}>
                  {doc.title}
                </p>
                <p className="text-[11px] text-slate-500 text-center mt-1 font-mono">
                  {doc.qualifications}
                </p>
                <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-4">
                  {doc.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6">
                <button
                  onClick={() => {
                    setSelectedStaffId(doc.id);
                    setIsBookingOpen(true);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Book with {doc.name.split(" ")[1] || doc.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="py-16 bg-white border-y border-slate-200 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Trusted by Patients Across {tenant.city}
            </h2>
            <p className="text-xs text-slate-600 mt-1">4.9 / 5.0 Average Satisfaction Rating</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                author: "Anand M.",
                review: "The clinical environment is incredibly structured and compassionate. Scheduling online made weekly consistency so much easier.",
                badge: "Verified Patient",
              },
              {
                author: "Siddharth & Ritu",
                review: "The consultations provided tangible homework and practical communication frameworks from our very first session.",
                badge: "Verified Couple",
              },
              {
                author: "Pooja V.",
                review: "Highest standard of medical care and confidentiality in the city. Dr. Sharma was an essential guide in my panic recovery.",
                badge: "Verified Patient",
              },
            ].map((rev, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <p className="text-xs text-slate-700 leading-relaxed italic mb-4">
                  &ldquo;{rev.review}&rdquo;
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-900">{rev.author}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{rev.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-16 sm:py-24 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Clear, transparent details about our practice policies and appointment workflow.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-slate-900 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact & Map Footer */}
      <footer id="contact" className="bg-[#111315] text-slate-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-xs">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {tenant.name.charAt(0)}
              </div>
              <span className="font-bold text-white text-base">{tenant.name}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              {tenant.branding.tagline}
            </p>
            <p className="text-[11px] text-slate-500">
              Powered by <strong className="text-slate-300">Aectura PracticeOS</strong> &bull; Multi-Tenant Healthcare Platform
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2">Location</p>
            <p className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>{tenant.address}</span>
            </p>
            <p className="text-slate-400 mt-2">Monday – Saturday: 9:00 AM – 7:30 PM</p>
            <p className="text-slate-500">Sunday: Closed</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2">Direct Contact</p>
            <p className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{tenant.phone}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{tenant.email}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp: {tenant.whatsapp}</span>
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-[#22252C] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <span>&copy; 2026 {tenant.name}. All clinical rights reserved.</span>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/portal" className="hover:text-slate-300">
              Patient Portal Access
            </Link>
            <Link href="/platform" className="hover:text-slate-300">
              Super Admin Shell
            </Link>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile Booking CTA Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-between shadow-xl">
        <div>
          <p className="text-xs font-bold text-slate-900">{tenant.name}</p>
          <p className="text-[10px] text-slate-500">{tenant.city}</p>
        </div>
        <button
          onClick={() => setIsBookingOpen(true)}
          className="text-white text-xs font-bold px-4 py-2 rounded-xl shadow"
          style={{ backgroundColor: primaryColor }}
        >
          Book Appointment
        </button>
      </div>

      {/* Interactive Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 text-slate-900">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                  {tenant.name}
                </span>
                <h3 className="text-lg font-bold text-slate-900">Schedule Consultation</h3>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Booking Request Submitted!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Thank you, {clientName}. We have reserved your requested slot and sent confirmation details to your WhatsApp and phone number.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98261 00000"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Clinical Service *</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    {tenant.services?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — ₹{s.price.toLocaleString("en-IN")} ({s.durationMinutes}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Preferred Specialist</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    {tenant.team?.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Time Window</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Consultation Format</label>
                  <select
                    value={bookingMode}
                    onChange={(e) => setBookingMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="IN_PERSON">In-Person at Clinic ({tenant.city})</option>
                    <option value="ONLINE">Telehealth (Secure Online Video)</option>
                    <option value="HOME_VISIT">Dedicated Home Visit</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-white font-bold px-6 py-2 rounded-xl shadow-md transition-opacity hover:opacity-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Confirm Booking Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
