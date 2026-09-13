import { getTenantBySlug, getTenantDb } from "@/lib/db/tenant-db";
import { getVerticalConfig } from "@/lib/verticals";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  CreditCard,
  ShieldCheck,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TenantDashboardOverview({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) notFound();

  const tenantDb = getTenantDb(tenant.id);
  const contacts = await tenantDb.getContacts();
  const appointments = await tenantDb.getAppointments();
  const services = await tenantDb.getServices();
  const practitioners = await tenantDb.getPractitioners();
  const vConfig = getVerticalConfig(tenant.vertical);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222630] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Practice Operational Cockpit
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{tenant.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Managing {vConfig.terminology.contactPlural.toLowerCase()}, schedules, and clinical operations under the {tenant.vertical} vertical pack.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${tenant.slug}/contacts`}
            className="bg-[#1C2028] hover:bg-[#252B36] border border-[#2B303C] text-xs font-semibold text-slate-200 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" /> New {vConfig.terminology.contactSingular}
          </Link>
          <Link
            href={`/dashboard/${tenant.slug}/appointments`}
            className="bg-[#0D9488] hover:bg-[#0F766E] text-xs font-semibold text-white px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" /> Book Session
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#14171C] border border-[#222630] rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total {vConfig.terminology.contactPlural}</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{contacts.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cap: {tenant.entitlements.maxContacts} contacts ({tenant.plan} plan)
          </div>
        </div>

        <div className="bg-[#14171C] border border-[#222630] rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Scheduled Sessions</span>
            <Calendar className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{appointments.length}</div>
          <div className="text-[11px] text-teal-400 mt-1">Confirmed &amp; Upcoming</div>
        </div>

        <div className="bg-[#14171C] border border-[#222630] rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Practitioners</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{practitioners.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Seat Limit: {tenant.entitlements.maxPractitioners}
          </div>
        </div>

        <div className="bg-[#14171C] border border-[#222630] rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Services</span>
            <CreditCard className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{services.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Catalog items</div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Sessions & Plan Entitlements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upcoming Appointments */}
        <div className="lg:col-span-8 bg-[#14171C] border border-[#222630] rounded-xl p-6">
          <div className="flex items-center justify-between border-b border-[#222630] pb-4 mb-4">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" /> Recent / Scheduled Appointments
            </h2>
            <Link
              href={`/dashboard/${tenant.slug}/appointments`}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No appointments scheduled yet. Book a session or invite patients through your public preview link.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appt) => (
                <div
                  key={appt.id}
                  className="bg-[#181B22] border border-[#262A35] rounded-lg p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-100">{appt.contactName}</div>
                    <div className="text-slate-400">
                      {appt.serviceName} &bull; With <span className="text-slate-300">{appt.practitionerName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-teal-400">
                      {new Date(appt.startTime).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-950 text-teal-300 border border-teal-800">
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Plan Entitlements & Vertical Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#14171C] border border-[#222630] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-[#222630] pb-3">
              Plan Feature Entitlements
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Plan:</span>
                <span className="font-bold text-teal-400 uppercase">{tenant.plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">White-Label Branding:</span>
                <span className={tenant.entitlements.customBranding ? "text-teal-400" : "text-slate-500"}>
                  {tenant.entitlements.customBranding ? "Enabled" : "Disabled (Starter)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Analytics Engine:</span>
                <span className={tenant.entitlements.analytics ? "text-teal-400" : "text-slate-500"}>
                  {tenant.entitlements.analytics ? "Active" : "Locked"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Buffer Rules:</span>
                <span className={tenant.entitlements.advancedCalendar ? "text-teal-400" : "text-slate-500"}>
                  {tenant.entitlements.advancedCalendar ? "Active" : "Standard"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#14171C] border border-[#222630] rounded-xl p-6 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm border-b border-[#222630] pb-3">
              Vertical Pack Overlays
            </h3>
            <div className="space-y-1.5 text-slate-300">
              <div>&bull; <strong className="text-slate-100">Primary Contact:</strong> {vConfig.terminology.contactSingular}</div>
              <div>&bull; <strong className="text-slate-100">Provider:</strong> {vConfig.terminology.practitionerTitle}</div>
              <div>&bull; <strong className="text-slate-100">Session Type:</strong> {vConfig.terminology.sessionTitle}</div>
              <div>&bull; <strong className="text-slate-100">Clinical Chart:</strong> {vConfig.terminology.clinicalNotesTitle}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
