import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PLANS } from "@/lib/plans";

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const db = await getDb();
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, params.tenantId)).limit(1);
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    return NextResponse.json({ tenant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const db = await getDb();
    const body = await req.json();

    const [existing] = await db.select().from(tenants).where(eq(tenants.id, params.tenantId)).limit(1);
    if (!existing) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const updatePayload: any = { updatedAt: new Date() };

    if (body.branding) {
      updatePayload.branding = { ...existing.branding, ...body.branding };
    }
    if (body.status) {
      updatePayload.status = body.status;
    }
    if (body.plan && (PLANS as any)[body.plan]) {
      updatePayload.plan = body.plan;
      updatePayload.entitlements = (PLANS as any)[body.plan].entitledFeatures;
    }

    const [updated] = await db
      .update(tenants)
      .set(updatePayload)
      .where(eq(tenants.id, params.tenantId))
      .returning();

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
