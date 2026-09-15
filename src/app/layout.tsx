import type { Metadata } from "next";
import "./globals.css";
import { TenantProvider } from "@/context/tenant-context";
import { CommandPalette } from "@/components/ui/command-palette";

const isStaging = process.env.APP_ENV === "staging" || process.env.NEXT_PUBLIC_APP_ENV === "staging";

export const metadata: Metadata = {
  title: isStaging 
    ? "[STAGING] AECTURA PracticeOS | Pre-Production"
    : "AECTURA PracticeOS | The Digital Operating System for Modern Practices",
  description: "Enterprise operating system for private healthcare practices, psychology clinics, and physiotherapy centers.",
  robots: isStaging
    ? {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
        },
      }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F9F9FB] text-[#111315] antialiased selection:bg-teal-500/20 selection:text-teal-900">
        <TenantProvider>
          {children}
          <CommandPalette />
        </TenantProvider>
      </body>
    </html>
  );
}
