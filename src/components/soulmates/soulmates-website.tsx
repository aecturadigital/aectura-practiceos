"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star,
  ChevronRight,
  Award,
  Lock,
  Compass,
  Heart,
  Brain,
  Moon,
  Zap,
  Activity,
  User,
  X,
  MessageSquare,
} from "lucide-react";

import { getClinicConfig, ClinicServiceConfig } from "@/config/clinic.config";

export function SoulmatesWebsite() {
  const clinicConfig = getClinicConfig();
  const therapies = clinicConfig.services;
  const leadDoctor = clinicConfig.practitioners[0];

  // Modal & Funnel State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);

  // Booking Form State
  const [selectedTherapy, setSelectedTherapy] = useState<ClinicServiceConfig>(therapies[0]);
  const [selectedMode, setSelectedMode] = useState<"In-Clinic (Wanowrie, Pune)" | "Online Secure Telehealth">(
    "In-Clinic (Wanowrie, Pune)"
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Tomorrow's date in YYYY-MM-DD
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  // Patient Intake Form
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<any | null>(null);

  // Fetch Slots when Step 2 opens or Date changes
  useEffect(() => {
    if (isBookingModalOpen && bookingStep === 2) {
      fetchSlotsForDate(selectedDate);
    }
  }, [isBookingModalOpen, bookingStep, selectedDate]);

  const fetchSlotsForDate = async (dateStr: string) => {
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/public/availability?date=${dateStr}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.availableSlots)) {
        setAvailableSlots(data.availableSlots);
        setSelectedTimeSlot(data.availableSlots[0] || "");
      } else {
        setAvailableSlots(["10:30", "11:45", "14:00", "15:15", "16:30", "17:45"]);
        setSelectedTimeSlot("10:30");
      }
    } catch {
      // Fallback slots if network unavailable
      setAvailableSlots(["10:30", "11:45", "14:00", "15:15", "16:30", "17:45"]);
      setSelectedTimeSlot("10:30");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleOpenBooking = (therapy?: ClinicServiceConfig) => {
    if (therapy) setSelectedTherapy(therapy);
    setBookingStep(1);
    setConfirmationData(null);
    setErrorMessage(null);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      setErrorMessage("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        fullName: patientName.trim(),
        phone: patientPhone.trim(),
        email: patientEmail.trim() || undefined,
        serviceId: selectedTherapy.id,
        mode: selectedMode,
        scheduledDate: selectedDate,
        startTime: selectedTimeSlot || "11:00",
        primaryConcern: primaryConcern.trim() || undefined,
      };

      const res = await fetch("/api/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Unable to confirm booking. Please try again.");
      }

      setConfirmationData(result);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit booking. Please call the clinic directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B0F] text-slate-100 font-sans selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Top Bar for Staff & Portal quick-access */}
      <div className="bg-[#0D121A] border-b border-slate-800/80 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-300">Soulmates Clinic Operating System</span>
          <span className="hidden sm:inline text-slate-500">• Wanowrie, Pune</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/portal" className="hover:text-teal-400 transition-colors flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </Link>
          <span className="text-slate-700">|</span>
          <Link
            href="/login"
            className="text-[#D4AF37] hover:text-amber-300 font-medium transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>Staff Sign In</span>
          </Link>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-[#080B0F]/90 backdrop-blur-md border-b border-slate-800/60 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-teal-500/10 border border-[#D4AF37]/40 flex items-center justify-center font-serif text-lg font-bold text-[#E2C768] shadow-sm shadow-amber-950/20">
            S
          </div>
          <div>
            <div className="text-base font-serif font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>SOULMATES</span>
              <span className="text-[11px] font-sans font-normal text-[#D4AF37] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                Clinic
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-light">
              Hypnotherapy & Mind-Body Wellness • Pune
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
          <a href="#about" className="hover:text-[#D4AF37] transition-colors">
            About Col Saxena
          </a>
          <a href="#therapies" className="hover:text-[#D4AF37] transition-colors">
            Clinical Therapies
          </a>
          <a href="#process" className="hover:text-[#D4AF37] transition-colors">
            Trance Method
          </a>
          <a href="#reviews" className="hover:text-[#D4AF37] transition-colors">
            Case Vignettes
          </a>
          <a href="#location" className="hover:text-[#D4AF37] transition-colors">
            Clinic Suite
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+919823012345"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/50"
          >
            <Phone className="w-3.5 h-3.5 text-teal-400" />
            <span>+91 98230 12345</span>
          </a>

          <button
            onClick={() => handleOpenBooking()}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E2C768] hover:to-[#C69F2E] text-slate-950 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-950/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-950" />
            <span>Book Assessment</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-8 border-b border-slate-800/60 bg-gradient-to-b from-[#0B0F15] via-[#080B0F] to-[#080B0F]">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#D4AF37]/10 to-teal-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E2C768] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Evidence-Based Clinical Hypnotherapy • Led by Col Umakant Saxena</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-semibold tracking-tight text-white leading-tight">
            Heal the Subconscious Root Cause of{" "}
            <span className="bg-gradient-to-r from-[#E2C768] via-[#D4AF37] to-teal-300 bg-clip-text text-transparent">
              Anxiety, Insomnia & Trauma
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            Specialized clinical hypnotherapy and transpersonal regression conducted with military precision and deep
            clinical empathy. In-person at our calm clinical suite in Wanowrie, Pune, or worldwide via secure telehealth.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => handleOpenBooking()}
              className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#E2C768] text-slate-950 font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Schedule Clinical Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#therapies"
              className="w-full sm:w-auto text-slate-300 hover:text-white font-medium text-sm px-6 py-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Treatment Directory</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </a>
          </div>

          {/* Clinical Credentials & Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 border-t border-slate-800/60 max-w-3xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xl font-serif font-bold text-[#E2C768]">14+ Years</div>
              <div className="text-xs text-slate-400 font-light">Clinical Hypnotherapy</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xl font-serif font-bold text-teal-400">2,500+</div>
              <div className="text-xs text-slate-400 font-light">Sessions Facilitated</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xl font-serif font-bold text-slate-200">IMDHA / EKAA</div>
              <div className="text-xs text-slate-400 font-light">Certified Practitioners</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xl font-serif font-bold text-[#E2C768]">100% Private</div>
              <div className="text-xs text-slate-400 font-light">Encrypted Medical EMR</div>
            </div>
          </div>
        </div>
      </section>

      {/* Practitioner Feature: Col Umakant Saxena */}
      <section id="about" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800/60">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 p-2 shadow-2xl">
              <div className="aspect-[4/5] rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 flex flex-col items-center justify-end p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-85" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0F] via-[#080B0F]/40 to-transparent" />
                <div className="relative z-10">
                  <div className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#E2C768] text-[11px] font-semibold tracking-wider uppercase mb-2 border border-[#D4AF37]/40">
                    Lead Therapist & Founder
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">Col Umakant Saxena</h3>
                  <p className="text-xs text-slate-300 font-light">
                    Retd. Colonel • Senior Clinical Hypnotherapist
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>Military Rigor Meets Subconscious Medicine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
              Bypassing the Analytical Firewall to Achieve Lasting Emotional Relief
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Following decades of distinguished service in the Indian Armed Forces, Col Umakant Saxena dedicated his
              life to the science of clinical hypnosis and subconscious trauma release. Trained rigorously through EKAA
              and the International Medical and Dental Hypnotherapy Association (IMDHA), Col Saxena combines disciplined
              clarity with profound clinical warmth.
            </p>

            <blockquote className="border-l-2 border-[#D4AF37] pl-4 py-1 text-sm italic text-slate-200 bg-slate-900/40 rounded-r-lg">
              "The conscious mind analyzes, plans, and worries; but the subconscious mind governs emotional memory and
              the autonomic nervous system. Under clinical trance, clients release decades of unresolved tension in a matter of sessions."
            </blockquote>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Certified Clinical Hypnotherapy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Past Life Regression Specialist</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Psychosomatic Symptom Relief</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Autonomic Sleep Reprogramming</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleOpenBooking()}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
              >
                <span>Consult with Col Saxena</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Therapies Directory */}
      <section id="therapies" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto border-b border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            Curated Treatment Protocols
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Specialized Hypnotherapy Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            All programs are structured, confidential, and customized to your specific psychological profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {therapies.map((t: ClinicServiceConfig) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all hover:shadow-xl hover:shadow-black/40 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37]">
                    {t.category}
                  </span>
                  {t.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#E2C768] border border-[#D4AF37]/30">
                      {t.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#E2C768] transition-colors mb-1.5">
                  {t.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed mb-4 font-light">{t.description}</p>

                <div className="space-y-1.5 mb-6">
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Recommended For:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.suitableFor.map((item: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-lg font-serif font-bold text-white">₹{t.price.toLocaleString("en-IN")}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{t.durationMinutes} mins</div>
                </div>

                <button
                  onClick={() => handleOpenBooking(t)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-[#D4AF37] text-white hover:text-slate-950 text-xs font-semibold transition-all border border-slate-700 hover:border-[#D4AF37] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The 3-Stage Trance Process */}
      <section id="process" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Clinical Methodology</div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">How Clinical Hypnosis Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            You remain fully conscious, awake, and in control at all times during the trance state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#E2C768] font-serif font-bold flex items-center justify-center text-sm mb-4 border border-[#D4AF37]/30">
              01
            </div>
            <h4 className="text-base font-serif font-semibold text-white mb-2">Somatic Brainwave Deceleration</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Through progressive muscle relaxation and breath anchors, beta brainwaves (stress state) decelerate into
              receptive alpha and deep theta frequencies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 font-serif font-bold flex items-center justify-center text-sm mb-4 border border-teal-500/30">
              02
            </div>
            <h4 className="text-base font-serif font-semibold text-white mb-2">Subconscious Root Cause Discovery</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              We safely guide your focus back to initial sensitizing events (childhood, developmental, or transpersonal)
              where subconscious emotional knots formed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#E2C768] font-serif font-bold flex items-center justify-center text-sm mb-4 border border-[#D4AF37]/30">
              03
            </div>
            <h4 className="text-base font-serif font-semibold text-white mb-2">Cognitive Reframing & Anchoring</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Old traumatic charges are desensitized and replaced with positive, autonomic anchors, ensuring permanent
              neuro-linguistic emotional stabilization.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Client Vignettes / Testimonials */}
      <section id="reviews" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800/60">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Patient Outcomes</div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Clinical Case Vignettes</h2>
          <p className="text-xs text-slate-400 font-light">Real breakthroughs documented across private therapy cycles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light italic">
              "I suffered from generalized anxiety and heart palpitations before executive board meetings for nearly eight
              years. After three sessions with Col Umakant, the panic trigger was completely defused. His presence is
              incredibly grounding."
            </p>
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
              <span className="font-semibold text-white">Priya S.</span>
              <span className="text-slate-500 font-mono">Pune • Anxiety Protocol</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light italic">
              "The Past Life Regression session resolved a persistent claustrophobia that modern medication could not touch.
              Col Saxena’s structured military approach ensures you feel 100% safe throughout the entire deep trance."
            </p>
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
              <span className="font-semibold text-white">Rajesh V.</span>
              <span className="text-slate-500 font-mono">Pune • PLR Therapy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section id="location" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-b border-slate-800/60">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Wanowrie Clinic Suite</div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              A Quiet, Confidential Haven in Pune
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Located in Wanowrie, our clinic is specifically designed to minimize acoustic interference and visual
              stress, offering an optimal acoustic setting for profound trance induction.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Wanowrie Clinical Suite, Pune, Maharashtra 411040</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 98230 12345 / +91 98230 99887</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Monday to Saturday: 10:30 AM – 07:30 PM (Prior Appointment Only)</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => handleOpenBooking()}
                className="bg-[#D4AF37] hover:bg-[#E2C768] text-slate-950 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Schedule an In-Clinic Session
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Direct Telehealth for Outstation Patients</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Over 40% of our clinical hypnotherapy consultations are conducted online. Telehealth hypnosis is equally
              effective when utilizing a quiet room and high-fidelity stereo earphones.
            </p>
            <div className="p-3 rounded-lg bg-slate-800/60 text-xs text-slate-300 border border-slate-700/60">
              💡 <strong>Telehealth Tip:</strong> Ensure a stable WiFi connection and comfortable armchair with head support.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 border-t border-slate-800/80 text-xs text-slate-500 bg-[#06080B]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-serif font-bold text-white">SOULMATES</span>
            <span>• Hypnotherapy & Mind-Body Wellness Center</span>
          </div>
          <div>
            <span>Col Umakant Saxena (Retd) • Wanowrie, Pune, Maharashtra</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Staff Login</Link>
            <Link href="/portal" className="hover:text-slate-300 transition-colors">Patient Portal</Link>
          </div>
        </div>
      </footer>

      {/* 3-STEP INTERACTIVE BOOKING WIZARD MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0D121A] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#D4AF37]">
                  Step {bookingStep} of 3
                </div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {bookingStep === 1 && "Select Therapy & Modality"}
                  {bookingStep === 2 && "Choose Date & Time Slot"}
                  {bookingStep === 3 && "Patient Intake & Confirmation"}
                </h3>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Modal Body / Confirmation */}
            {confirmationData ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h4 className="text-xl font-serif font-bold text-white">Consultation Confirmed</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your appointment has been registered in our clinical schedule. A WhatsApp confirmation has been dispatched.
                </p>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Reference ID:</span>
                    <span className="font-mono text-[#E2C768] font-semibold">{confirmationData.bookingReference?.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Therapy:</span>
                    <span className="font-semibold text-white">{confirmationData.appointment?.therapyType}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Date & Time:</span>
                    <span className="font-semibold text-white">
                      {confirmationData.appointment?.date} at {confirmationData.appointment?.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Practitioner:</span>
                    <span className="font-semibold text-white">{confirmationData.appointment?.practitioner}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Location:</span>
                    <span className="font-semibold text-white">{confirmationData.appointment?.location}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E2C768] text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close & View Details
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="p-5 space-y-4">
                {/* STEP 1: Select Therapy & Mode */}
                {bookingStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Select Therapy Program
                      </label>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {therapies.map((t: ClinicServiceConfig) => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTherapy(t)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              selectedTherapy.id === t.id
                                ? "border-[#D4AF37] bg-[#D4AF37]/10 text-white"
                                : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <div>
                              <div className="font-semibold">{t.name}</div>
                              <div className="text-[11px] text-slate-400 font-light">{t.durationMinutes} mins</div>
                            </div>
                            <div className="text-right">
                              <div className="font-serif font-bold text-[#E2C768]">₹{t.price.toLocaleString("en-IN")}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Consultation Modality
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMode("In-Clinic (Wanowrie, Pune)")}
                          className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                            selectedMode.startsWith("In-Clinic")
                              ? "border-teal-500 bg-teal-500/10 text-teal-300"
                              : "border-slate-800 bg-slate-900 text-slate-400"
                          }`}
                        >
                          <div className="font-semibold text-white">In-Clinic Suite</div>
                          <div className="text-[11px] text-slate-400">Wanowrie, Pune</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedMode("Online Secure Telehealth")}
                          className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                            selectedMode.startsWith("Online")
                              ? "border-teal-500 bg-teal-500/10 text-teal-300"
                              : "border-slate-800 bg-slate-900 text-slate-400"
                          }`}
                        >
                          <div className="font-semibold text-white">Online Video</div>
                          <div className="text-[11px] text-slate-400">Worldwide (Encrypted)</div>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="w-full mt-2 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E2C768] text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to Slot Selection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Date & Available Slots */}
                {bookingStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Consultation Date
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Practitioner Available Slots
                        </label>
                        {isLoadingSlots && <span className="text-[11px] text-teal-400 animate-pulse">Checking calendar...</span>}
                      </div>

                      {availableSlots.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                          No open slots available on this date. Please select another day.
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {availableSlots.map((timeStr) => (
                            <button
                              key={timeStr}
                              type="button"
                              onClick={() => setSelectedTimeSlot(timeStr)}
                              className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                                selectedTimeSlot === timeStr
                                  ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#E2C768] font-bold"
                                  : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              {timeStr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setBookingStep(1)}
                        className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={!selectedTimeSlot}
                        onClick={() => setBookingStep(3)}
                        className="w-2/3 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E2C768] text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <span>Patient Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Patient Intake & Final Confirmation */}
                {bookingStep === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98230 12345"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Primary Concern / Goal
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Severe anxiety during presentations, or chronic sleep problems..."
                        value={primaryConcern}
                        onChange={(e) => setPrimaryConcern(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Selected Therapy:</span>
                        <span className="text-white font-medium">{selectedTherapy.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date & Time:</span>
                        <span className="text-white font-medium">{selectedDate} at {selectedTimeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Terms:</span>
                        <span className="text-emerald-400 font-medium">Pay at Clinic / UPI upon attendance</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-2/3 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E2C768] text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Confirming...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm Appointment</span>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
