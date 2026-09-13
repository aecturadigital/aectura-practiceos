import Link from "next/link";
import { Building2, PlusCircle, Shield, Home } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F1114] text-slate-100">
      {/* Super Admin Nav Header */}
      <header className="border-b border-[#222630] bg-[#14171C] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0D9488] flex items-center justify-center font-bold text-white text-sm">
              A
            </div>
            <div>
              <span className="font-bold tracking-wider text-sm text-white block">AECTURA</span>
              <span className="text-[10px] text-teal-400 font-mono tracking-widest uppercase block">
                Super Admin Shell
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-md hover:bg-[#1C2028] text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-teal-400" /> Practices
            </Link>
            <Link
              href="/admin/new"
              className="px-3 py-1.5 rounded-md hover:bg-[#1C2028] text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-teal-400" /> Create Practice
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#1C2028] border border-[#2B303C] text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Super Admin &bull; Root Authorization</span>
          </div>
          <Link
            href="/"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1C2028] rounded-md transition-colors"
            title="Public Homepage"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>

      <footer className="border-t border-[#222630] py-4 px-6 text-center text-xs text-slate-500">
        Aectura PracticeOS Platform Orchestration &bull; Multi-Tenant Architecture &bull; PostgreSQL
      </footer>
    </div>
  );
}
