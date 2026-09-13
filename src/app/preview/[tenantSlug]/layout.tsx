import { Metadata } from "next";
import Link from "next/link";
import { mockStore } from "@/lib/mock/store";
import { notFound } from "next/navigation";
import { Eye, ShieldAlert, ArrowLeft, LayoutDashboard, Building2 } from "lucide-react";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { tenantSlug: "mindwell-psychology" },
    { tenantSlug: "motionplus-physiotherapy" }
  ];
}

// CRITICAL REQUIREMENT: PREVIEW tenants must be noindex/nofollow
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const tenant = mockStore.getTenant(params.tenantSlug);
  if (!tenant) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Explicit NoIndex / NoFollow Meta Header */}
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      {/* Floating Preview Banner */}
      <div className="sticky top-0 z-50 bg-[#16181F] border-b border-[#2B303C] px-4 py-2 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono font-medium">
            <Eye className="w-3.5 h-3.5" /> PREVIEW MODE (NOINDEX)
          </span>
          <span className="text-slate-400 hidden sm:inline">&bull;</span>
          <span className="text-white font-medium">{tenant.name}</span>
          <span className="text-slate-400 capitalize">({tenant.verticalId} Vertical &bull; {tenant.planId} Plan)</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white px-3 py-1 rounded font-medium transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Open Staff Workspace
          </Link>
          <Link
            href="/platform"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" /> Platform
          </Link>
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
