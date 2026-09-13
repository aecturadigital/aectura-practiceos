import { getTenantBySlug } from "@/lib/db/tenant-db";
import { notFound } from "next/navigation";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[#222630] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Branding &amp; Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize visual branding, clinical contact information, and plan entitlements for {tenant.name}.
        </p>
      </div>

      <SettingsClient tenant={tenant} />
    </div>
  );
}
