import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { tenants, practitioners, services, users, tenantMemberships } from "@/lib/db/schema";
import { PLANS } from "@/lib/plans";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = await getDb();
    const list = await db.select().from(tenants);
    return NextResponse.json({ tenants: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, vertical, plan, template, branding, practitioner, services: initialServices } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const db = await getDb();

    // Check slug uniqueness
    const [existing] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    if (existing) {
      return NextResponse.json({ error: `Tenant slug '${slug}' is already taken.` }, { status: 409 });
    }

    const planDef = (PLANS as any)[plan] || PLANS.presence;

    // 1. Create Tenant (status: preview)
    const [newTenant] = await db
      .insert(tenants)
      .values({
        name,
        slug,
        vertical: vertical || "psychology",
        status: "preview",
        plan: plan || "presence",
        template: template || "modern_minimal",
        branding: branding || {
          primaryColor: "#0D9488",
          accentColor: "#111315",
          tagline: "Specialized Healthcare Practice",
          address: "100 Medical Center Way",
          phone: "+1 (555) 234-5678",
          email: "info@clinic.practiceos.com",
        },
        entitlements: planDef.entitlements,
      })
      .returning();

    // 2. Create Lead Practitioner if provided
    let createdPractitioner = null;
    if (practitioner && practitioner.name) {
      const [p] = await db
        .insert(practitioners)
        .values({
          tenantId: newTenant.id,
          name: practitioner.name,
          title: practitioner.title || "Clinical Provider",
          email: practitioner.email || "provider@clinic.com",
          bio: practitioner.bio || "",
        })
        .returning();
      createdPractitioner = p;

      // Create owner user and membership
      const [u] = await db
        .insert(users)
        .values({
          name: practitioner.name,
          email: practitioner.email || `owner@${slug}.practiceos.com`,
          isSuperAdmin: false,
        })
        .returning();

      await db.insert(tenantMemberships).values({
        tenantId: newTenant.id,
        userId: u.id,
        role: "tenant_owner",
      });
    }

    // 3. Create Services
    const createdServices = [];
    if (Array.isArray(initialServices) && initialServices.length > 0) {
      for (const s of initialServices) {
        const [serv] = await db
          .insert(services)
          .values({
            tenantId: newTenant.id,
            name: s.name,
            description: s.description || "",
            durationMinutes: s.durationMinutes || 50,
            price: s.price || 12000,
            practitionerId: createdPractitioner?.id || null,
          })
          .returning();
        createdServices.push(serv);
      }
    }

    return NextResponse.json(
      {
        success: true,
        tenant: newTenant,
        practitioner: createdPractitioner,
        servicesCount: createdServices.length,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
