import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db/tenant-db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Missing x-tenant-id header" }, { status: 400 });
  }

  try {
    const tenantDb = getTenantDb(tenantId);
    const appointmentList = await tenantDb.getAppointments();
    return NextResponse.json({ appointments: appointmentList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Missing x-tenant-id header" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { contactId, practitionerId, serviceId, startTime, endTime, notes } = body;

    if (!contactId || !practitionerId || !serviceId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "contactId, practitionerId, serviceId, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const tenantDb = getTenantDb(tenantId);
    const newAppointment = await tenantDb.createAppointment({
      contactId,
      practitionerId,
      serviceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes,
    });

    return NextResponse.json({ success: true, appointment: newAppointment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
