"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles, Building2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/app";
  const isDemoLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Successful login
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: quickEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Demo authentication failed");
      }
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate demo user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#111315] text-white shadow-sm mb-4">
            <Building2 className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111315]">
            Aectura PracticeOS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Clinical Operating System • Staff Secure Sign-In
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200/70 text-[13px] text-rose-700 flex items-start gap-2">
              <span className="shrink-0 text-base leading-none">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@soulmatestherapy.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-teal-700 font-medium cursor-pointer hover:underline">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#111315] hover:bg-[#1E293B] text-white font-medium text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to PracticeOS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Staff Logins (Rendered ONLY if NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true") */}
          {isDemoLoginEnabled && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Soulmates Quick Demo Profiles</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("owner@soulmatestherapy.com")}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-900">
                      Col Umakant Saxena
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Clinic Owner • Full Clinical & Financial Authority
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Select
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("staff@soulmatestherapy.com")}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-900">
                      Priya Sharma
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Front Desk Receptionist • Schedule & Triage (Notes Restricted)
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Select
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("hr@soulmatestherapy.com")}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-900">
                      Anand Patil
                    </div>
                    <div className="text-[11px] text-slate-500">
                      HR Manager • StaffOps & Payroll (Patient Clinical Zero Access)
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Select
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("auditor@soulmatestherapy.com")}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-900">
                      Meera Sen
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Compliance Auditor • Read-Only (Zero Mutation Rights)
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Select
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Encrypted 256-bit Session Security • Self-Hosted PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
