"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Layers,
  Calendar,
  Users,
  Building2,
  Sparkles,
  Bot,
  MessageSquare,
  CheckCircle2,
  Globe,
  Dumbbell,
  Brain,
  Star,
  Zap,
  Lock,
  ChevronRight,
  Stethoscope,
  Activity,
  Check,
} from "lucide-react";
import { DemoEnvironmentBadge } from "@/components/ui/demo-environment-badge";
import { PLANS, PLAN_CONFIGS } from "@/lib/plans";

export function AecturaPlatformLanding() {
  const [activeTab, setActiveTab] = useState<"psychology" | "physiotherapy">("psychology");

  return (
    <div className="min-h-screen bg-[#0C0E12] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 h-16 bg-[#12141A]/90 backdrop-blur-md border-b border-[#202430] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center font-bold text-white text-base shadow-md shadow-teal-900/30">
            A
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-base text-white">AECTURA</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 uppercase tracking-wider">
              PracticeOS
            </span>
          </div>
          <div className="hidden md:block pl-2">
            <DemoEnvironmentBadge />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#verticals" className="hover:text-white transition-colors">Clinical Verticals</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#demo" className="hover:text-white transition-colors">Live Demos</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#1A1D27] hover:bg-[#232734] text-slate-200 border border-[#2B3040] transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>Patient Portal</span>
          </Link>

          <Link
            href="/app"
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-950 flex items-center gap-1.5"
          >
            <span>Launch Staff App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-8 border-b border-[#1E222D]">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-teal-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/70 border border-teal-800/80 text-teal-300 text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>The Digital Operating System for Modern Healthcare Practices</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Transform Your Independent Practice into a High-Performance Digital Clinic
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A cohesive, single multi-tenant operating system designed specifically for private psychologists and physiotherapists. Includes custom public websites, 24/7 AI receptionist triage, 360° patient cards, scheduling buffers, and home exercise protocols.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/app"
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-teal-950/60 flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Explore Staff App Demo</span>
            </Link>

            <Link
              href="/preview/mindwell-psychology"
              className="bg-[#181B24] hover:bg-[#222733] border border-[#2A3040] text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-teal-400" />
              <span>View Practice Website</span>
            </Link>

            <Link
              href="/platform"
              className="bg-[#141720] hover:bg-[#1C202C] border border-[#252A38] text-slate-400 hover:text-white font-medium text-sm px-5 py-3.5 rounded-2xl transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Super Admin Console</span>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-[#14161F] border border-[#222533]">
              <span className="text-2xl font-bold text-white font-mono">100%</span>
              <p className="text-xs text-slate-400 mt-0.5">PostgreSQL Data Isolation</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#14161F] border border-[#222533]">
              <span className="text-2xl font-bold text-teal-400 font-mono">24/7</span>
              <p className="text-xs text-slate-400 mt-0.5">AI Receptionist Triage</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#14161F] border border-[#222533]">
              <span className="text-2xl font-bold text-sky-400 font-mono">3.8%</span>
              <p className="text-xs text-slate-400 mt-0.5">Low No-Show Rate</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#14161F] border border-[#222533]">
              <span className="text-2xl font-bold text-purple-400 font-mono">3-Year</span>
              <p className="text-xs text-slate-400 mt-0.5">FutureReady Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Pillars */}
      <section id="features" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-semibold">
            One Architecture. Zero Bloat.
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for Private Practice Excellence
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Replace 6 disconnected subscriptions with one purpose-built operating system designed for healthcare workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 360 Patient Card */}
          <div className="bg-[#14161F] border border-[#222533] rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-slate-600 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">360° Patient &amp; Client Card</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single unified patient record across appointments, encrypted clinical notes, intake questionnaires, WhatsApp messages, and exercise adherence.
              </p>
            </div>
            <Link
              href="/app/contacts/cnt-1"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1.5"
            >
              <span>Explore Priya Sharma&apos;s Card</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: AI Receptionist */}
          <div className="bg-[#14161F] border border-[#222533] rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-slate-600 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Autonomous AI Receptionist</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Maya handles inquiries over WhatsApp and web 24/7. Answers consultation fees, hours, and available slots with strict medical safety guardrails.
              </p>
            </div>
            <Link
              href="/app/ai"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
            >
              <span>Test AI Simulator Sandbox</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Scheduling Engine */}
          <div className="bg-[#14161F] border border-[#222533] rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-slate-600 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Scheduling &amp; Buffer Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configurable lead times, cancellation cutoff rules, and automated post-session buffers. Eliminates double bookings and clinician burnout.
              </p>
            </div>
            <Link
              href="/app/appointments"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
            >
              <span>Open Calendar Engine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clinical Verticals Showcase */}
      <section id="verticals" className="py-24 bg-[#0F1116] border-y border-[#1E222D] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-semibold">
                Dynamic VerticalPack Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Tailored for Your Exact Specialty
              </h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Aectura dynamically adjusts clinical terminology, intake forms, and workflows based on your practice vertical.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#161822] p-1.5 rounded-2xl border border-[#262B3A] text-xs">
              <button
                onClick={() => setActiveTab("psychology")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "psychology"
                    ? "bg-teal-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Psychology Pack</span>
              </button>
              <button
                onClick={() => setActiveTab("physiotherapy")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "physiotherapy"
                    ? "bg-teal-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>Physiotherapy Pack</span>
              </button>
            </div>
          </div>

          {/* Dynamic Vertical View */}
          {activeTab === "psychology" ? (
            <div className="bg-[#14161F] border border-[#222533] rounded-3xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-teal-950 text-teal-400 border border-teal-800">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Psychology &amp; Psychotherapy Pack</span>
                </div>
                <h3 className="text-2xl font-bold text-white">MindWell Psychology Centre (Raipur)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Specialized for clinical psychologists, counselors, and psychotherapists. Enforces &ldquo;Client&rdquo; terminology, PHQ-9 &amp; GAD-7 screening questionnaires, telehealth video encryption, and therapy progress notes.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Adult &amp; Adolescent Psychological Intake Questionnaires</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Strict Medical Guardrails: Crisis Helpline Routing &amp; Non-prescription Policy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Telehealth Video Room Integration with 256-bit HIPAA compliance</span>
                  </li>
                </ul>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/preview/mindwell-psychology"
                    className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>View MindWell Website</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0E1015] border border-[#232633] space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[10px] pb-2 border-b border-[#20232E]">
                  <span>TERMINOLOGY CONFIG</span>
                  <span className="text-teal-400">ACTIVE: PSYCHOLOGY</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Contact:</span>
                    <span className="text-white font-bold">&ldquo;Client&rdquo;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consultation Session:</span>
                    <span className="text-white font-bold">&ldquo;Therapy Consultation&rdquo;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Default Intake:</span>
                    <span className="text-teal-400">PHQ-9 / GAD-7 Psychological History</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Practitioner Title:</span>
                    <span className="text-white font-bold">&ldquo;Clinical Psychologist&rdquo;</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#14161F] border border-[#222533] rounded-3xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Physiotherapy &amp; Sports Rehabilitation Pack</span>
                </div>
                <h3 className="text-2xl font-bold text-white">MotionPlus Physiotherapy (Bhilai)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Engineered for orthopaedic physiotherapists and sports clinics. Enforces &ldquo;Patient&rdquo; terminology, pain scale 1-10 assessments, injury mechanism intake, and interactive home exercise compliance tracking.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Daily Home Exercise Programme (Sets, Reps, Hold Seconds)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Pain &amp; Range of Motion Recovery Trajectory Tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Direct Patient Portal Compliance Checklist</span>
                  </li>
                </ul>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/preview/motionplus-physiotherapy"
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>View MotionPlus Website</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0E1015] border border-[#232633] space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[10px] pb-2 border-b border-[#20232E]">
                  <span>TERMINOLOGY CONFIG</span>
                  <span className="text-sky-400">ACTIVE: PHYSIOTHERAPY</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Contact:</span>
                    <span className="text-white font-bold">&ldquo;Patient&rdquo;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consultation Session:</span>
                    <span className="text-white font-bold">&ldquo;Physical Assessment&rdquo;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Special Module:</span>
                    <span className="text-sky-400">Kinetic Exercise Prescriptions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Practitioner Title:</span>
                    <span className="text-white font-bold">&ldquo;Consultant Physiotherapist&rdquo;</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-semibold">
            Simple, Honest Healthcare Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Invest in Your Independent Practice
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            One-time setup includes complete clinic onboarding, branding personalization, and DNS configuration. Low monthly subscription covers ongoing hosting and updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PRESENCE */}
          <div className="p-8 rounded-3xl bg-[#14161F] border border-[#232633] flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <span className="text-xs font-mono text-teal-400 font-bold uppercase">Presence</span>
              <div>
                <div className="text-3xl font-bold text-white font-mono">₹999<span className="text-xs text-slate-500 font-sans"> / mo</span></div>
                <p className="text-xs text-slate-400 font-mono mt-1">One-time setup: ₹17,900</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                For solo practitioners establishing a verified digital presence and online booking calendar.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400 border-t border-[#232633] pt-5">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Custom Practice Website (Sections Editor)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Online Booking Calendar Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Custom Domain &amp; Cloudflare Edge SSL</span>
                </li>
              </ul>
            </div>

            <Link
              href="/app"
              className="w-full py-3 rounded-xl bg-[#1C1F2B] hover:bg-[#252A3A] text-slate-200 text-xs font-semibold text-center border border-[#2A2F40] transition-colors"
            >
              Get Started with Presence
            </Link>
          </div>

          {/* PRACTICEFLOW (POPULAR) */}
          <div className="p-8 rounded-3xl bg-[#161B28] border-2 border-teal-500 shadow-2xl shadow-teal-950/40 flex flex-col justify-between space-y-8 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-teal-500 text-black font-bold text-[10px] uppercase tracking-wider">
              Most Popular for Clinics
            </div>

            <div className="space-y-5">
              <span className="text-xs font-mono text-teal-400 font-bold uppercase">PracticeFlow</span>
              <div>
                <div className="text-3xl font-bold text-white font-mono">₹2,499<span className="text-xs text-slate-500 font-sans"> / mo</span></div>
                <p className="text-xs text-teal-400 font-mono mt-1">One-time setup: ₹39,900</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete operational workflow for growing practices with intake forms, CRM, and omnichannel messages.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-[#232633] pt-5">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Everything in Presence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>360° Patient &amp; Client Cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Draggable CRM Kanban Pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Omnichannel Unified Inbox (WhatsApp + Portal)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Clinical Intake Form Engine</span>
                </li>
              </ul>
            </div>

            <Link
              href="/app"
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold text-center shadow-lg shadow-teal-900/60 transition-colors"
            >
              Get Started with PracticeFlow
            </Link>
          </div>

          {/* PRACTICEOS AI */}
          <div className="p-8 rounded-3xl bg-[#14161F] border border-[#232633] flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase">PracticeOS AI</span>
              <div>
                <div className="text-3xl font-bold text-white font-mono">₹3,999<span className="text-xs text-slate-500 font-sans"> / mo</span></div>
                <p className="text-xs text-slate-400 font-mono mt-1">One-time setup: ₹69,900</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Autonomous 24/7 AI Receptionist (Maya) and full automation suite for high-volume practices.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400 border-t border-[#232633] pt-5">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Everything in PracticeFlow</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>24/7 Autonomous AI Receptionist (WhatsApp &amp; Web)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Vector Knowledge Base Semantic Ingestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Automated Google Reviews Reputation Engine</span>
                </li>
              </ul>
            </div>

            <Link
              href="/app"
              className="w-full py-3 rounded-xl bg-[#1C1F2B] hover:bg-[#252A3A] text-slate-200 text-xs font-semibold text-center border border-[#2A2F40] transition-colors"
            >
              Get Started with PracticeOS AI
            </Link>
          </div>
        </div>

        {/* 3-Year FutureReady Assurance Box */}
        <div className="p-8 rounded-3xl bg-[#14161F] border border-[#232633] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">3-Year FutureReady Assurance</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All security updates, API migrations (WhatsApp Meta upgrades), and vertical improvements guaranteed for 3 years without additional license fees.
              </p>
            </div>
          </div>

          <span className="font-mono text-xs text-teal-400 px-4 py-2 rounded-xl bg-teal-950/60 border border-teal-800/60 shrink-0">
            Guaranteed Architecture Continuity
          </span>
        </div>
      </section>

      {/* Interactive Live Demo Role Switcher */}
      <section id="demo" className="py-24 bg-[#0F1116] border-t border-[#1E222D] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-semibold">
              Full Application Sandbox
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Test Every Angle of the Product Now
            </h2>
            <p className="text-sm text-slate-400">
              Select any role to jump directly into the live interactive prototype with rich connected mock data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/app"
              className="p-6 rounded-3xl bg-[#14161F] border border-[#232633] hover:border-teal-500 transition-all space-y-4 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-950 text-teal-400 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                  Staff Workspace
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Doctor &amp; receptionist app: CRM Kanban, appointment calendar, 360° patient records, and inbox.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-teal-400">
                <span>Enter /app</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/portal"
              className="p-6 rounded-3xl bg-[#14161F] border border-[#232633] hover:border-sky-500 transition-all space-y-4 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-950 text-sky-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                  Patient Health Hub
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Self-service portal for Priya Sharma: view sessions, self-reschedule, chat, and complete exercises.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-sky-400">
                <span>Enter /portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/preview/mindwell-psychology"
              className="p-6 rounded-3xl bg-[#14161F] border border-[#232633] hover:border-emerald-500 transition-all space-y-4 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Public Clinic Site
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  MindWell Psychology public landing page with interactive booking modal and verified testimonials.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <span>View Website</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/platform"
              className="p-6 rounded-3xl bg-[#14161F] border border-[#232633] hover:border-purple-500 transition-all space-y-4 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-950 text-purple-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Platform Admin
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Super Admin management console: create practices with 8-stage wizard, manage plans, and audit logs.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-purple-400">
                <span>Enter /platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E222D] py-12 px-4 sm:px-8 bg-[#0C0E12] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white text-xs">
              A
            </div>
            <div>
              <span className="font-bold text-slate-300">AECTURA PracticeOS</span>
              <span className="text-[11px] block text-slate-500">
                The Enterprise Multi-Tenant OS for Healthcare Practices
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/platform" className="hover:text-slate-300 transition-colors">Super Admin</Link>
            <Link href="/app" className="hover:text-slate-300 transition-colors">Staff App</Link>
            <Link href="/portal" className="hover:text-slate-300 transition-colors">Patient Portal</Link>
            <Link href="/preview/mindwell-psychology" className="hover:text-slate-300 transition-colors">Psychology Demo</Link>
            <Link href="/preview/motionplus-physiotherapy" className="hover:text-slate-300 transition-colors">Physiotherapy Demo</Link>
          </div>

          <p className="font-mono text-[11px] text-slate-600">
            &copy; {new Date().getFullYear()} Aectura Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
