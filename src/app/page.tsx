"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SoulmatesWebsite } from "@/components/soulmates/soulmates-website";
import { AecturaPlatformLanding } from "@/components/aectura-platform-landing";

function HomeContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "platform") {
    return <AecturaPlatformLanding />;
  }

  return <SoulmatesWebsite />;
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B0F] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
