import Link from "next/link";
import { getTenantBySlug } from "@/lib/db/tenant-db";
import { notFound } from "next/navigation";
import {
  Calendar,
  Users,
  Settings,
  LayoutDashboard,
  ExternalLink,
  Shield,
  Layers,
  ArrowLeft,
} from "lucide-react";

export default async function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) {
    notFound();
  }

  const primaryColor = tenant.branding?.primaryColor || "#0D9488";

  return (
    <div className="min-h-screen flex bg-[#0E1013] text-slate-100 font-sans">
      {/* Dark Technical Sidebar */}
      <aside className="w-64 bg-[#111315] border-r border-[#222630] flex flex-col justify-between shrink-0">
        <div>
          {/* Practice Branding Header */}
          <div className="p-5 border-b border-[#222630] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {tenant.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-sm text-white block truncate" title={tenant.name}>
                  {tenant.name}
                </span>
                <span className="text-[10px] text-slate-400 capitalize block">
                  {tenant.vertical} &bull; {tenant.plan}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <Link
              href={`/dashboard/${tenant.slug}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#181A1E] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-400" />
              <span>Overview</span>
            </Link>
            <Link
              href={`/dashboard/${tenant.slug}/contacts`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#181A1E] transition-colors"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>360&deg; Contacts / CRM</span>
            </Link>
            <Link
              href={`/dashboard/${tenant.slug}/appointments`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#181A1E] transition-colors"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Appointments</span>
            </Link>
            <Link
              href={`/dashboard/${tenant.slug}/settings`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#181A1E] transition-colors"
            >
              <Settings className="w-4 h-4 text-teal-400" />
              <span>Branding &amp; Settings</span>
            </Link>
          </nav>
        </div>

        {/* Footer / Quick Actions */}
        <div className="p-4 border-t border-[#222630] space-y-2">
          <Link
            href={`/preview/${tenant.slug}`}
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:bg-amber-950/70 text-xs font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Live Preview
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Super Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="border-b border-[#222630] bg-[#111315] px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Tenant Isolation: <strong className="text-slate-200 font-mono">{tenant.id.slice(0, 8)}...</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-400 text-xs font-mono font-medium uppercase">
              {tenant.plan} tier
            </span>
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
