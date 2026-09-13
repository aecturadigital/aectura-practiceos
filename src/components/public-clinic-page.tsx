"use client";

import { useState } from "react";
import { Tenant, Practitioner, Service } from "@/lib/db/schema";
import { getVerticalConfig } from "@/lib/verticals";
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
} from "lucide-react";

interface PublicClinicPageProps {
  tenant: Tenant;
  practitioners: Practitioner[];
  services: Service[];
  isPreview?: boolean;
}

export function PublicClinicPage({
  tenant,
  practitioners,
  services,
  isPreview = false,
}: PublicClinicPageProps) {
  const verticalConfig = getVerticalConfig(tenant.vertical);
  const branding = tenant.branding;
  const primaryColor = branding.primaryColor || "#0D9488";

  // Booking Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id || ""
  );
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<string>(
    practitioners[0]?.id || ""
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("2026-09-18T10:00");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create Contact
      const contactRes = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenant.id,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          stage: "client",
          notes: `Initial booking via ${isPreview ? "Preview" : "Public"} website portal.`,
        }),
      });

      const contactData = await contactRes.json();
      if (!contactRes.ok) throw new Error(contactData.error || "Failed to create contact");

      // 2. Create Appointment
      const startDate = new Date(preferredDate);
      const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
      const endDate = new Date(startDate.getTime() + (selectedService?.durationMinutes || 50) * 60000);

      const apptRes = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenant.id,
        },
        body: JSON.stringify({
          contactId: contactData.contact.id,
          practitionerId: selectedPractitionerId || practitioners[0]?.id,
          serviceId: selectedService?.id,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          notes: "Self-service online booking request.",
        }),
      });

      const apptData = await apptRes.json();
      if (!apptRes.ok) throw new Error(apptData.error || "Failed to create appointment");

      setBookingSuccess(
        `Your ${verticalConfig.terminology.sessionTitle} has been confirmed! An email confirmation has been dispatched.`
      );
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
    } catch (err: any) {
      alert(err.message || "Failed to complete appointment booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Clinic Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              {tenant.name.charAt(0)}
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                {tenant.name}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {verticalConfig.displayName}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-slate-900 transition-colors">
              Services
            </a>
            <a href="#practitioners" className="hover:text-slate-900 transition-colors">
              {verticalConfig.terminology.practitionerTitle}s
            </a>
            <a href="#location" className="hover:text-slate-900 transition-colors">
              Location
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#book"
              className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Book {verticalConfig.terminology.sessionTitle}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-50/70 border-b border-slate-200 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-sm"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}30`,
                color: primaryColor,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" /> {verticalConfig.badge}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              {branding.tagline}
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Welcome to {tenant.name}. We provide specialized, personalized care designed to help you
              achieve meaningful, lasting health outcomes in a modern clinical environment.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#book"
                className="text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all shadow-md flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                Schedule {verticalConfig.terminology.sessionTitle} <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`tel:${branding.phone}`}
                className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm px-5 py-3 rounded-lg transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-slate-500" /> {branding.phone}
              </a>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span className="font-bold text-sm text-slate-800">
                  {tenant.name} Accreditation &amp; Care
                </span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Licensed &amp; board-certified {verticalConfig.terminology.practitionerTitle.toLowerCase()}s.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Confidential, patient-centered private practice facilities.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Direct digital booking with immediate calendar confirmation.</span>
                </li>
              </ul>
              <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-500 border border-slate-100">
                Operating under <strong>{tenant.plan.toUpperCase()}</strong> practice configuration with verified clinical protocols.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-6xl mx-auto px-6 w-full">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Clinical Services &amp; Consultations
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Tailored appointments designed around your personal health goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {srv.durationMinutes} mins
                  </span>
                  <span className="font-bold text-base text-slate-900">
                    ${(srv.price / 100).toFixed(2)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{srv.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <a
                  href="#book"
                  onClick={() => setSelectedServiceId(srv.id)}
                  className="w-full text-center block text-xs font-semibold py-2 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Select This Service &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Practitioners Section */}
      <section id="practitioners" className="py-16 bg-slate-50/70 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Meet Our Clinical Providers
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Dedicated practitioners specializing in {verticalConfig.displayName.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {practitioners.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex gap-5 items-start shadow-sm"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-inner"
                  style={{ backgroundColor: primaryColor }}
                >
                  {doc.name.charAt(0)}
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                  <div
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: primaryColor }}
                  >
                    {doc.title}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {doc.bio || "Dedicated healthcare professional providing evidence-based patient treatments."}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {doc.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Booking Section */}
      <section id="book" className="py-20 max-w-3xl mx-auto px-6 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Schedule Your {verticalConfig.terminology.sessionTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Select a service, date, and enter your details to reserve your appointment instantly.
          </p>
        </div>

        {bookingSuccess ? (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-teal-900">Appointment Confirmed!</h3>
            <p className="text-sm text-teal-800 max-w-md mx-auto">{bookingSuccess}</p>
            <button
              onClick={() => setBookingSuccess(null)}
              className="mt-4 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Book Another Session
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleBook}
            className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (${(s.price / 100).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned {verticalConfig.terminology.practitionerTitle}
                </label>
                <select
                  value={selectedPractitionerId}
                  onChange={(e) => setSelectedPractitionerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
                >
                  {practitioners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                  placeholder="e.g. Sarah"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                  placeholder="e.g. Jenkins"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                  placeholder="sarah@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                  placeholder="+1 (555) 019-2834"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Date &amp; Time</label>
              <input
                type="datetime-local"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? "Confirming Slot..." : `Confirm ${verticalConfig.terminology.sessionTitle} Reservation`}
            </button>
          </form>
        )}
      </section>

      {/* Location / Footer Section */}
      <footer id="location" className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-base mb-2">{tenant.name}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{branding.tagline}</p>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> Powered by Aectura PracticeOS
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Contact</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {branding.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {branding.email}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {branding.address}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Operating Hours</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div>Monday &ndash; Friday: 8:00 AM &ndash; 6:00 PM</div>
              <div>Saturday: 9:00 AM &ndash; 2:00 PM</div>
              <div>Sunday: Closed</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
