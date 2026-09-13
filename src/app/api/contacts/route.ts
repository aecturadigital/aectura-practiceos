import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db/tenant-db";

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Missing x-tenant-id header" }, { status: 400 });
  }

  try {
    const tenantDb = getTenantDb(tenantId);
    const contactList = await tenantDb.getContacts();
    return NextResponse.json({ contacts: contactList });
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
    const { firstName, lastName, email, phone, stage, notes } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "First name, last name, email, and phone are required" }, { status: 400 });
    }

    const tenantDb = getTenantDb(tenantId);
    const newContact = await tenantDb.createContact({
      firstName,
      lastName,
      email,
      phone,
      stage,
      notes,
    });

    return NextResponse.json({ success: true, contact: newContact }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
