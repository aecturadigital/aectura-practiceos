import { getTenantBySlug, getTenantDb } from "@/lib/db/tenant-db";
import { getVerticalConfig } from "@/lib/verticals";
import { notFound } from "next/navigation";
import { ContactsManagerClient } from "./contacts-client";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) notFound();

  const tenantDb = getTenantDb(tenant.id);
  const contactsList = await tenantDb.getContacts();
  const vConfig = getVerticalConfig(tenant.vertical);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-[#222630] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          360&deg; {vConfig.terminology.contactPlural} / CRM
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Unified patient lifecycle management from initial lead inquiry to active clinical patient.
        </p>
      </div>

      <ContactsManagerClient
        tenantId={tenant.id}
        initialContacts={contactsList}
        contactSingular={vConfig.terminology.contactSingular}
      />
    </div>
  );
}
