import { getTenantBySlug, getTenantDb } from "@/lib/db/tenant-db";
import { notFound } from "next/navigation";
import { AppointmentsClient } from "./appointments-client";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) notFound();

  const tenantDb = getTenantDb(tenant.id);
  const appointmentsList = await tenantDb.getAppointments();
  const contactsList = await tenantDb.getContacts();
  const practitionersList = await tenantDb.getPractitioners();
  const servicesList = await tenantDb.getServices();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-[#222630] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Appointments &amp; Scheduling</h1>
        <p className="text-xs text-slate-400 mt-1">
          Calendar schedule management for {tenant.name}.
        </p>
      </div>

      <AppointmentsClient
        tenantId={tenant.id}
        initialAppointments={appointmentsList}
        contacts={contactsList}
        practitioners={practitionersList}
        services={servicesList}
      />
    </div>
  );
}
