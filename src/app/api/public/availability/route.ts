import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calculateAvailabilitySlots } from "@/lib/appointments/appointment-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // Format: YYYY-MM-DD
    const practitionerParam = searchParams.get("practitionerId");
    const serviceIdParam = searchParams.get("serviceId");

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "Valid date query parameter required in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await calculateAvailabilitySlots(db, {
      dateStr,
      practitionerParam,
      serviceIdParam,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Public availability fetch error:", error);
    const msg = error?.message || "Failed to resolve practitioner availability";

    if (msg.startsWith("INVALID_DATE_FORMAT") || msg.startsWith("PAST_DATE_UNAVAILABLE") || msg.startsWith("INVALID_SERVICE")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (msg.startsWith("PRACTITIONER_UNMAPPED") || msg.startsWith("PRACTITIONER_NOT_CONFIGURED")) {
      return NextResponse.json({ error: msg }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Failed to resolve practitioner availability" },
      { status: 500 }
    );
  }
}
