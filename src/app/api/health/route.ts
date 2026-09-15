import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const isStaging = process.env.APP_ENV === "staging" || process.env.NEXT_PUBLIC_APP_ENV === "staging";
  const environment = process.env.APP_ENV || (process.env.NODE_ENV === "production" ? "production" : "development");

  try {
    const db = await getDb();
    // Lightweight liveness probe to verify database connectivity
    await db.execute(sql`SELECT 1`);

    const response = NextResponse.json(
      {
        status: "healthy",
        environment,
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    if (isStaging) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }

    return response;
  } catch (error) {
    // Health probe returns high-level diagnostic only without leaking credentials or internal query details
    console.error("Health probe database connectivity failure:", error);
    const response = NextResponse.json(
      {
        status: "unhealthy",
        environment,
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );

    if (isStaging) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }

    return response;
  }
}
