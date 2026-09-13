import { getDb } from "../src/lib/db";
import { tenants, practitioners, services, contacts, appointments, users, tenantMemberships } from "../src/lib/db/schema";
import { PLANS } from "../src/lib/plans";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("-> Seeding Aectura PracticeOS Demo Practices...");
  const db = await getDb();

  // 1. MindWell Psychology (Tenant A)
  const [existingA] = await db.select().from(tenants).where(eq(tenants.slug, "mindwell")).limit(1);
  if (!existingA) {
    const [tA] = await db
      .insert(tenants)
      .values({
        name: "MindWell Psychology & Wellness",
        slug: "mindwell",
        vertical: "psychology",
        status: "preview",
        plan: "practiceflow",
        template: "modern_minimal",
        branding: {
          primaryColor: "#0D9488",
          accentColor: "#111315",
          tagline: "Compassionate, Evidence-Based Psychotherapy & Mental Health",
          address: "450 Sutter St, Suite 800, San Francisco, CA",
          phone: "+1 (415) 555-0199",
          email: "hello@mindwellpsych.com",
        },
        entitlements: PLANS.practiceflow.entitledFeatures,
      })
      .returning();

    const [docA] = await db
      .insert(practitioners)
      .values({
        tenantId: tA.id,
        name: "Dr. Marcus Vance",
        title: "Clinical Psychologist, Psy.D.",
        bio: "Specializing in adult cognitive behavioral therapy, anxiety, and mindfulness-based stress reduction.",
        email: "dr.vance@mindwellpsych.com",
      })
      .returning();

    const [servA1] = await db
      .insert(services)
      .values({
        tenantId: tA.id,
        name: "Individual Psychotherapy (50 min)",
        description: "One-on-one evidence-based therapy for anxiety, mood disorders, and life transitions.",
        durationMinutes: 50,
        price: 15000,
        practitionerId: docA.id,
      })
      .returning();

    const [servA2] = await db
      .insert(services)
      .values({
        tenantId: tA.id,
        name: "Couples Counseling & Bonding (80 min)",
        description: "Emotionally focused relationship counseling for partners.",
        durationMinutes: 80,
        price: 22000,
        practitionerId: docA.id,
      })
      .returning();

    const [clientA] = await db
      .insert(contacts)
      .values({
        tenantId: tA.id,
        firstName: "Alice",
        lastName: "Walker",
        email: "alice.walker@example.com",
        phone: "+1 (555) 123-4567",
        stage: "patient",
        notes: "Ongoing weekly therapy. Focus on workplace burnout and boundary setting.",
      })
      .returning();

    await db.insert(appointments).values({
      tenantId: tA.id,
      contactId: clientA.id,
      practitionerId: docA.id,
      serviceId: servA1.id,
      startTime: new Date("2026-09-18T10:00:00Z"),
      endTime: new Date("2026-09-18T10:50:00Z"),
      status: "confirmed",
      notes: "Weekly session.",
    });

    console.log("  ✓ Created Psychology Practice: MindWell (slug: mindwell)");
  } else {
    console.log("  ✓ MindWell practice already present.");
  }

  // 2. Apex Physiotherapy (Tenant B)
  const [existingB] = await db.select().from(tenants).where(eq(tenants.slug, "apex-physio")).limit(1);
  if (!existingB) {
    const [tB] = await db
      .insert(tenants)
      .values({
        name: "Apex Sports Physical Therapy",
        slug: "apex-physio",
        vertical: "physiotherapy",
        status: "preview",
        plan: "presence",
        template: "warm_clinical",
        branding: {
          primaryColor: "#2563EB",
          accentColor: "#0F172A",
          tagline: "Restoring Movement, Strength, and Peak Athletic Performance",
          address: "700 Broadway, 4th Floor, New York, NY",
          phone: "+1 (212) 555-0844",
          email: "care@apexphysiony.com",
        },
        entitlements: PLANS.presence.entitledFeatures,
      })
      .returning();

    const [docB] = await db
      .insert(practitioners)
      .values({
        tenantId: tB.id,
        name: "Elena Rostova, DPT, OCS",
        title: "Board-Certified Orthopedic Clinical Specialist",
        bio: "Specializing in sports physical therapy, post-op rehabilitation, and biomechanical analysis.",
        email: "elena@apexphysiony.com",
      })
      .returning();

    const [servB1] = await db
      .insert(services)
      .values({
        tenantId: tB.id,
        name: "Initial Musculoskeletal Evaluation (45 min)",
        description: "Comprehensive joint, muscle, and functional movement assessment with personalized care plan.",
        durationMinutes: 45,
        price: 13000,
        practitionerId: docB.id,
      })
      .returning();

    const [servB2] = await db
      .insert(services)
      .values({
        tenantId: tB.id,
        name: "Follow-Up Physical Rehabilitation (30 min)",
        description: "Hands-on joint mobilization, therapeutic exercise, and progressive loading.",
        durationMinutes: 30,
        price: 9000,
        practitionerId: docB.id,
      })
      .returning();

    const [clientB] = await db
      .insert(contacts)
      .values({
        tenantId: tB.id,
        firstName: "Bob",
        lastName: "Miller",
        email: "bob.miller@example.com",
        phone: "+1 (555) 987-6543",
        stage: "patient",
        notes: "Rotator cuff tendonitis rehab. Week 4 of recovery plan.",
      })
      .returning();

    await db.insert(appointments).values({
      tenantId: tB.id,
      contactId: clientB.id,
      practitionerId: docB.id,
      serviceId: servB1.id,
      startTime: new Date("2026-09-19T14:00:00Z"),
      endTime: new Date("2026-09-19T14:45:00Z"),
      status: "confirmed",
      notes: "Initial evaluation session.",
    });

    console.log("  ✓ Created Physiotherapy Practice: Apex Rehab (slug: apex-physio)");
  } else {
    console.log("  ✓ Apex Physio practice already present.");
  }

  console.log("-> Demo seeding completed successfully.\n");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
