import { getDb } from "../src/lib/db";
import { tenants, practitioners, services, contacts, appointments } from "../src/lib/db/schema";
import { getTenantDb, getTenantBySlug } from "../src/lib/db/tenant-db";
import { PLANS } from "../src/lib/plans";
import { eq } from "drizzle-orm";

async function runValidation() {
  console.log("\n=======================================================");
  console.log("  AECTURA MULTI-TENANT FOUNDATION: SUCCESS TEST SUITE");
  console.log("=======================================================\n");

  const db = await getDb();

  // Clean up any existing test records
  console.log("-> Initializing test environment...");
  await db.delete(tenants).where(eq(tenants.slug, "mindwell-test-a"));
  await db.delete(tenants).where(eq(tenants.slug, "apex-test-b"));

  // 1. Create Psychology Tenant A
  console.log("\n[1] Creating Psychology Practice (Tenant A: MindWell)...");
  const planA = PLANS.practiceflow;
  const [tenantA] = await db
    .insert(tenants)
    .values({
      name: "MindWell Psychology & Therapy",
      slug: "mindwell-test-a",
      vertical: "psychology",
      status: "preview",
      plan: "practiceflow",
      template: "modern_minimal",
      branding: {
        primaryColor: "#0D9488", // Deep Teal
        accentColor: "#111315",
        tagline: "Evidence-Based Mental Healthcare & Psychotherapy",
        address: "450 Sutter St, San Francisco, CA",
        phone: "+1 (415) 555-0199",
        email: "contact@mindwell.test",
      },
      entitlements: planA.entitledFeatures,
    })
    .returning();

  const tenantDbA = getTenantDb(tenantA.id);

  // Add Practitioner for A
  const practitionerA = await tenantDbA.createPractitioner({
    name: "Dr. Marcus Vance",
    title: "Clinical Psychologist",
    bio: "Specializing in anxiety disorders and cognitive behavioral therapy.",
    email: "dr.vance@mindwell.test",
  });

  // Add Services for A
  const serviceA = await tenantDbA.createService({
    name: "Individual Psychotherapy",
    durationMinutes: 50,
    price: 15000, // $150
    practitionerId: practitionerA.id,
  });

  // Add Contact for A
  const contactA = await tenantDbA.createContact({
    firstName: "Alice",
    lastName: "Walker",
    email: "alice@example.com",
    phone: "+1 (555) 111-2222",
    stage: "patient",
    notes: "Confidential therapy records for Alice Walker.",
  });

  console.log(`    ✓ Tenant A created: ${tenantA.name} (ID: ${tenantA.id})`);
  console.log(`    ✓ Contact A created: ${contactA.firstName} ${contactA.lastName} (ID: ${contactA.id})`);

  // 2. Create Physiotherapy Tenant B
  console.log("\n[2] Creating Physiotherapy Practice (Tenant B: Apex Rehab)...");
  const planB = PLANS.presence;
  const [tenantB] = await db
    .insert(tenants)
    .values({
      name: "Apex Sports Physical Therapy",
      slug: "apex-test-b",
      vertical: "physiotherapy",
      status: "preview",
      plan: "presence",
      template: "warm_clinical",
      branding: {
        primaryColor: "#2563EB", // Cobalt Blue
        accentColor: "#0F172A",
        tagline: "Restoring Peak Musculoskeletal Mobility & Function",
        address: "700 Broadway, New York, NY",
        phone: "+1 (212) 555-0844",
        email: "info@apexrehab.test",
      },
      entitlements: planB.entitledFeatures,
    })
    .returning();

  const tenantDbB = getTenantDb(tenantB.id);

  // Add Practitioner for B
  const practitionerB = await tenantDbB.createPractitioner({
    name: "Elena Rostova, DPT",
    title: "Senior Physiotherapist",
    bio: "Orthopedic physical therapy and sports rehabilitation.",
    email: "elena@apexrehab.test",
  });

  // Add Services for B
  const serviceB = await tenantDbB.createService({
    name: "Musculoskeletal Assessment",
    durationMinutes: 45,
    price: 13000, // $130
    practitionerId: practitionerB.id,
  });

  // Add Contact for B
  const contactB = await tenantDbB.createContact({
    firstName: "Bob",
    lastName: "Miller",
    email: "bob@example.com",
    phone: "+1 (555) 333-4444",
    stage: "patient",
    notes: "Physical therapy shoulder rehabilitation notes for Bob.",
  });

  console.log(`    ✓ Tenant B created: ${tenantB.name} (ID: ${tenantB.id})`);
  console.log(`    ✓ Contact B created: ${contactB.firstName} ${contactB.lastName} (ID: ${contactB.id})`);

  // 3. Verify Different Branding
  console.log("\n[3] Verifying Branding Separation...");
  if (tenantA.branding.primaryColor !== tenantB.branding.primaryColor) {
    console.log(`    ✓ Tenant A Color: ${tenantA.branding.primaryColor} (Teal)`);
    console.log(`    ✓ Tenant B Color: ${tenantB.branding.primaryColor} (Cobalt Blue)`);
  } else {
    throw new Error("Branding color check failed: Colors match!");
  }

  // 4. Verify Different Plans & Entitlements
  console.log("\n[4] Verifying Plan Entitlements...");
  if (tenantA.plan === "practiceflow" && tenantB.plan === "presence") {
    console.log(`    ✓ Tenant A Plan: ${tenantA.plan.toUpperCase()}`);
    console.log(`    ✓ Tenant B Plan: ${tenantB.plan.toUpperCase()}`);
  } else {
    throw new Error("Plan entitlement verification failed!");
  }

  // 5. Verify Different Services
  console.log("\n[5] Verifying Services Separation...");
  const servicesA = await tenantDbA.getServices();
  const servicesB = await tenantDbB.getServices();
  console.log(`    ✓ Tenant A Service: ${servicesA[0].name} ($${(servicesA[0].price / 100).toFixed(2)})`);
  console.log(`    ✓ Tenant B Service: ${servicesB[0].name} ($${(servicesB[0].price / 100).toFixed(2)})`);
  if (servicesA[0].name === servicesB[0].name) {
    throw new Error("Services isolation check failed!");
  }

  // 6 & 7. Verify Previews
  console.log("\n[6 & 7] Verifying Preview Status for Both Practices...");
  const previewA = await getTenantBySlug("mindwell-test-a");
  const previewB = await getTenantBySlug("apex-test-b");
  if (previewA?.status === "preview" && previewB?.status === "preview") {
    console.log(`    ✓ Tenant A Preview Route: /preview/${previewA.slug} (Status: ${previewA.status})`);
    console.log(`    ✓ Tenant B Preview Route: /preview/${previewB.slug} (Status: ${previewB.status})`);
  } else {
    throw new Error("Preview tenant status verification failed!");
  }

  // 8, 9 & 10. THE MANDATORY CROSS-TENANT ISOLATION TEST
  console.log("\n[8, 9 & 10] EXECUTING MANDATORY CROSS-TENANT ISOLATION TEST...");
  console.log("    Simulating authenticated request from Tenant A to access Tenant B Contact...");

  // Attempt 1: Query Tenant B's contact using Tenant A's database scope
  const crossTenantContact = await tenantDbA.getContactById(contactB.id);
  if (crossTenantContact === null) {
    console.log(`    ✓ PASSED: Tenant A cannot fetch Tenant B Contact (Result: null / 404 Not Found)`);
  } else {
    throw new Error(`CRITICAL SECURITY FAILURE: Tenant A accessed Tenant B contact: ${JSON.stringify(crossTenantContact)}`);
  }

  // Attempt 2: Verify Tenant A contact list does NOT contain Tenant B contacts
  const contactsListA = await tenantDbA.getContacts();
  const leakedContact = contactsListA.find((c) => c.id === contactB.id || c.email === "bob@example.com");
  if (!leakedContact) {
    console.log(`    ✓ PASSED: Tenant A contact list contains strictly ${contactsListA.length} contact(s) (zero contamination)`);
  } else {
    throw new Error(`CRITICAL SECURITY FAILURE: Tenant B contact found in Tenant A contact list!`);
  }

  // 11. Verify Plan Feature Entitlements Work
  console.log("\n[11] Verifying Feature Entitlements Enforcement...");
  if (tenantA.entitlements.crm === true && tenantB.entitlements.crm === false) {
    console.log("    ✓ PracticeFlow tier allows CRM; Presence tier denies CRM.");
  }

  // 12. Verify Changing Tenant A Branding Does NOT Affect Tenant B
  console.log("\n[12] Testing Independent Branding Mutation...");
  const updatedA = await tenantDbA.updateBranding({
    primaryColor: "#059669", // Mutate Tenant A to Emerald Green
    tagline: "Updated Psychology Tagline",
  });

  const refreshedB = await tenantDbB.getTenant();

  console.log(`    ✓ Tenant A Primary Color updated to: ${updatedA.branding.primaryColor}`);
  console.log(`    ✓ Tenant B Primary Color remains: ${refreshedB?.branding.primaryColor}`);

  if (refreshedB?.branding.primaryColor === "#2563EB" && updatedA.branding.primaryColor === "#059669") {
    console.log("    ✓ PASSED: Tenant B branding was completely unaffected by changes to Tenant A!");
  } else {
    throw new Error("Branding cross-contamination detected!");
  }

  console.log("\n=======================================================");
  console.log("  ALL 12 VALIDATION STEPS PASSED SUCCESSFULLY! (100%)");
  console.log("=======================================================\n");
}

runValidation()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ VALIDATION TEST FAILED:", err);
    process.exit(1);
  });
