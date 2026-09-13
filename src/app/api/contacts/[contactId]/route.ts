import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db/tenant-db";

export async function GET(req: NextRequest, { params }: { params: { contactId: string } }) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Missing x-tenant-id header" }, { status: 400 });
  }

  try {
    const tenantDb = getTenantDb(tenantId);
    const contact = await tenantDb.getContactById(params.contactId);

    if (!contact) {
      // Record does not exist for this tenant (or belongs to another tenant!)
      // Return 404 Not Found to prevent entity enumeration.
      return NextResponse.json(
        { error: "Contact not found in current tenant scope" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
