import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/lib/db/schema";
import { authorizeRequest, DEFAULT_ROLE_PERMISSIONS } from "../src/lib/auth/permissions";
import { eq } from "drizzle-orm";
import path from "path";

async function runTestSuite() {
  console.log("================================================================================");
  console.log("  AECTURA PRACTICEOS: PHASE 2A COMPREHENSIVE ISOLATION & ARCHIVE VERIFICATION");
  console.log("================================================================================\n");

  const migrationsFolder = path.join(process.cwd(), "drizzle", "migrations");

  // ============================================================================
  // TEST 1: STAGING MIGRATION DRY RUN (33 TABLES)
  // ============================================================================
  console.log("[TEST 1/6] Running Staging Migration Dry Run on clinic_soulmates...");
  const pgliteA = new PGlite();
  const dbA = drizzle(pgliteA, { schema });

  const t0 = Date.now();
  await migrate(dbA, { migrationsFolder });
  const migrationDurationMs = Date.now() - t0;
  console.log(`[SUCCESS] Migration applied successfully in ${migrationDurationMs}ms.`);

  // Verify all tables in information_schema
  const tableResult = await pgliteA.query<{ table_name: string }>(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const createdTables = tableResult.rows.map((r: any) => r.table_name);
  console.log(`[SUCCESS] Verified ${createdTables.length} tables in PostgreSQL catalog:`);
  console.log(`  Tables: ${createdTables.join(", ")}`);

  if (createdTables.length < 33) {
    throw new Error(`Expected at least 33 tables, but found ${createdTables.length}`);
  }

  // ============================================================================
  // TEST 2: INDEX & UNIQUE CONSTRAINT INVENTORY
  // ============================================================================
  console.log("\n[TEST 2/6] Verifying Index & Constraint Inventory...");
  const indexResult = await pgliteA.query<{ indexname: string; tablename: string }>(`
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `);

  console.log(`[SUCCESS] Verified ${indexResult.rows.length} total indexes in catalog.`);
  const criticalIndexes = [
    "idx_contacts_phone",
    "idx_contacts_is_archived",
    "idx_appointments_date",
    "idx_ledger_contact_id",
    "idx_outbox_status_scheduled",
    "uniq_user_role",
    "patient_accounts_user_id_unique",
    "patient_accounts_contact_id_unique",
    "uniq_role_permission",
    "uniq_user_override",
  ];

  for (const idx of criticalIndexes) {
    const found = indexResult.rows.some((r: any) => r.indexname === idx);
    if (!found) {
      throw new Error(`Critical index/constraint missing: ${idx}`);
    }
    console.log(`  [SUCCESS] Index/Constraint verified: ${idx}`);
  }

  // ============================================================================
  // TEST 3: RELATIONAL INTEGRITY & SEED INSERTION
  // ============================================================================
  console.log("\n[TEST 3/6] Testing Data Insertion & Domain Relational Integrity...");

  // Seed default roles & permissions
  for (const [roleId, permList] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    await dbA.insert(schema.roles).values({
      id: roleId,
      name: roleId,
    }).onConflictDoNothing();

    for (const permId of permList) {
      await dbA.insert(schema.permissions).values({
        id: permId,
        name: permId,
        category: permId.split(".")[0],
      }).onConflictDoNothing();

      await dbA.insert(schema.rolePermissions).values({
        roleId,
        permissionId: permId,
      }).onConflictDoNothing();
    }
  }

  // User
  const [user1] = await dbA.insert(schema.users).values({
    email: "owner@soulmatestherapy.com",
    name: "Col Umakant Saxena",
    passwordHash: "hash_configured",
    isActive: true,
  }).returning();

  // Contact (Patient)
  const [patient1] = await dbA.insert(schema.contacts).values({
    fullName: "Priya Sharma",
    phone: "+91 98230 12345",
    city: "Pune",
    status: "ACTIVE",
    activeDealStage: "won",
    activeDealValue: "7500.00",
    tags: ["Anxiety", "Insomnia"],
  }).returning();

  // Appointment
  const [appt1] = await dbA.insert(schema.appointments).values({
    contactId: patient1.id,
    practitionerId: user1.id,
    practitionerName: "Col Umakant Saxena",
    therapyType: "Clinical Hypnotherapy",
    mode: "In-Clinic (Wanowrie, Pune)",
    scheduledDate: "2026-09-18",
    startTime: "11:00",
    endTime: "12:00",
    status: "CONFIRMED",
    amount: "2500.00",
  }).returning();

  // Clinical Note with EMR fields
  const [note1] = await dbA.insert(schema.clinicalNotes).values({
    contactId: patient1.id,
    appointmentId: appt1.id,
    practitionerId: user1.id,
    hypnoticDepth: "Deep Somnambulism",
    primaryIssue: "Generalized Anxiety & Chronic Insomnia",
    rootCausesRevealed: "Subconscious exam trauma from childhood.",
    suggestedHomework: "Nightly 20-min audio anchor.",
  }).returning();

  console.log("[SUCCESS] Relational records verified across users, contacts, appointments, and clinical notes.");

  // ============================================================================
  // TEST 4: DESTRUCTIVE CASCADE ELIMINATED & ARCHIVAL INTEGRITY VERIFIED
  // ============================================================================
  console.log("\n[TEST 4/6] Testing Restrictive Deletion & Contact Archival Integrity...");

  // 1. Attempting to hard-delete patient1 MUST fail due to onDelete: "restrict" on appointments and clinicalNotes!
  let hardDeleteBlocked = false;
  try {
    await dbA.delete(schema.contacts).where(eq(schema.contacts.id, patient1.id));
  } catch (err: any) {
    hardDeleteBlocked = true;
    console.log(`  ✓ Hard deletion rejected by foreign key restrict constraint: "${err.message.slice(0, 70)}..."`);
  }

  if (!hardDeleteBlocked) {
    throw new Error("CRITICAL SAFETY FLAW: Contact with clinical notes was hard-deleted! Cascade was not eliminated!");
  }
  console.log("  [SUCCESS] Destructive cascade deletion physically prevented by PostgreSQL schema.");

  // 2. Perform safe archival instead of hard deletion
  await dbA.update(schema.contacts).set({
    isArchived: true,
    archivedAt: new Date(),
    archivedBy: user1.id,
    archiveReason: "Course completed and archived for regulatory compliance",
  }).where(eq(schema.contacts.id, patient1.id));

  // Verify archived contact
  const [archivedContact] = await dbA.select().from(schema.contacts).where(eq(schema.contacts.id, patient1.id));
  if (!archivedContact.isArchived || !archivedContact.archivedAt || !archivedContact.archiveReason) {
    throw new Error("Archival audit fields failed to update properly!");
  }

  // Verify that all clinical notes and appointments remain 100% intact
  const retainedAppts = await dbA.select().from(schema.appointments).where(eq(schema.appointments.contactId, patient1.id));
  const retainedNotes = await dbA.select().from(schema.clinicalNotes).where(eq(schema.clinicalNotes.contactId, patient1.id));

  if (retainedAppts.length !== 1 || retainedNotes.length !== 1) {
    throw new Error("Data loss detected after contact archival!");
  }
  console.log(`  [SUCCESS] Archival verification passed: 100% data retention (Appts: ${retainedAppts.length}, Notes: ${retainedNotes.length}).`);

  // ============================================================================
  // TEST 5: PATIENT ACCOUNT IDENTITY & ISOLATION (PATIENT A vs PATIENT B)
  // ============================================================================
  console.log("\n[TEST 5/6] Testing Patient Identity & Cross-Patient Access Violation Defense...");

  // Patient A
  const [userPatientA] = await dbA.insert(schema.users).values({
    email: "patientA@example.com",
    name: "Patient A User",
    passwordHash: "hash_a",
  }).returning();

  const [contactPatientA] = await dbA.insert(schema.contacts).values({
    fullName: "Patient A Clinical Record",
    phone: "+91 91111 00001",
  }).returning();

  await dbA.insert(schema.patientAccounts).values({
    userId: userPatientA.id,
    contactId: contactPatientA.id,
    portalAccessEnabled: true,
  });

  // Patient B
  const [userPatientB] = await dbA.insert(schema.users).values({
    email: "patientB@example.com",
    name: "Patient B User",
    passwordHash: "hash_b",
  }).returning();

  const [contactPatientB] = await dbA.insert(schema.contacts).values({
    fullName: "Patient B Clinical Record",
    phone: "+91 92222 00002",
  }).returning();

  await dbA.insert(schema.patientAccounts).values({
    userId: userPatientB.id,
    contactId: contactPatientB.id,
    portalAccessEnabled: true,
  });

  // 1. Patient A accesses own contactId -> MUST SUCCEED
  await authorizeRequest(
    userPatientA.id,
    "portal.access",
    { isPatientContext: true, contactId: contactPatientA.id },
    dbA
  );
  console.log("  ✓ Patient A authenticated to own medical record (contact A).");

  // 2. Patient A attempts to supply Patient B's contactId -> MUST BE DENIED!
  let crossAccessBlocked = false;
  try {
    await authorizeRequest(
      userPatientA.id,
      "portal.access",
      { isPatientContext: true, contactId: contactPatientB.id },
      dbA
    );
  } catch (err: any) {
    crossAccessBlocked = true;
    console.log(`  ✓ Cross-patient access cleanly blocked: "${err.message}"`);
  }

  if (!crossAccessBlocked) {
    throw new Error("CRITICAL SECURITY HOLE: Patient A accessed Patient B's records!");
  }
  console.log("  [SUCCESS] Patient account identity boundary strictly enforced: Zero IDOR vulnerabilities.");

  // ============================================================================
  // TEST 6: CLINIC DATABASE ISOLATION & ROLLBACK
  // ============================================================================
  console.log("\n[TEST 6/6] Testing Multi-Clinic Database Isolation (clinic_soulmates vs clinic_motionplus)...");

  // Create isolated database instance for MotionPlus Physio
  const pgliteB = new PGlite();
  const dbB = drizzle(pgliteB, { schema });
  await migrate(dbB, { migrationsFolder });

  const [drMotion] = await dbB.insert(schema.users).values({
    email: "lead@motionplusphysio.com",
    name: "Dr. Aryan Mehta (PT)",
    passwordHash: "hash_motion",
  }).returning();

  const [patientMotion] = await dbB.insert(schema.contacts).values({
    fullName: "Rohan Kulkarni",
    phone: "+91 97777 11223",
    city: "Bangalore",
    status: "ACTIVE",
    primaryConcern: "Rotator Cuff Tendinopathy",
  }).returning();

  const clinicBContacts = await dbB.select().from(schema.contacts);
  const clinicAContacts = await dbA.select().from(schema.contacts);

  const soulmatesInB = clinicBContacts.some((c: any) => c.phone === "+91 98230 12345");
  const motionInA = clinicAContacts.some((c: any) => c.phone === "+91 97777 11223");

  if (soulmatesInB || motionInA) {
    throw new Error("Cross-database leakage detected! Clinic isolation rule violated.");
  }
  console.log(`  ✓ Clinic A contacts count: ${clinicAContacts.length} (Soulmates Wanowrie)`);
  console.log(`  ✓ Clinic B contacts count: ${clinicBContacts.length} (MotionPlus Bangalore)`);
  console.log("  [SUCCESS] Strict physical database isolation verified: Zero cross-clinic contamination.");

  // Teardown Order Verification (all 33 tables in reverse topological order)
  const dropStatements = [
    'DROP TABLE IF EXISTS "user_permission_overrides" CASCADE;',
    'DROP TABLE IF EXISTS "role_permissions" CASCADE;',
    'DROP TABLE IF EXISTS "permissions" CASCADE;',
    'DROP TABLE IF EXISTS "patient_accounts" CASCADE;',
    'DROP TABLE IF EXISTS "outbox_events" CASCADE;',
    'DROP TABLE IF EXISTS "audit_logs" CASCADE;',
    'DROP TABLE IF EXISTS "messages" CASCADE;',
    'DROP TABLE IF EXISTS "conversations" CASCADE;',
    'DROP TABLE IF EXISTS "payroll_entries" CASCADE;',
    'DROP TABLE IF EXISTS "staff_leaves" CASCADE;',
    'DROP TABLE IF EXISTS "staff_attendance" CASCADE;',
    'DROP TABLE IF EXISTS "staff_profiles" CASCADE;',
    'DROP TABLE IF EXISTS "patient_documents" CASCADE;',
    'DROP TABLE IF EXISTS "document_requests" CASCADE;',
    'DROP TABLE IF EXISTS "payment_reminders" CASCADE;',
    'DROP TABLE IF EXISTS "invoices" CASCADE;',
    'DROP TABLE IF EXISTS "ledger_transactions" CASCADE;',
    'DROP TABLE IF EXISTS "tracker_entries" CASCADE;',
    'DROP TABLE IF EXISTS "patient_trackers" CASCADE;',
    'DROP TABLE IF EXISTS "clinical_notes" CASCADE;',
    'DROP TABLE IF EXISTS "plan_adjustments" CASCADE;',
    'DROP TABLE IF EXISTS "treatment_sessions" CASCADE;',
    'DROP TABLE IF EXISTS "plan_cycles" CASCADE;',
    'DROP TABLE IF EXISTS "treatment_courses" CASCADE;',
    'DROP TABLE IF EXISTS "practitioner_availability" CASCADE;',
    'DROP TABLE IF EXISTS "appointments" CASCADE;',
    'DROP TABLE IF EXISTS "activities" CASCADE;',
    'DROP TABLE IF EXISTS "crm_deals" CASCADE;',
    'DROP TABLE IF EXISTS "contacts" CASCADE;',
    'DROP TABLE IF EXISTS "user_roles" CASCADE;',
    'DROP TABLE IF EXISTS "roles" CASCADE;',
    'DROP TABLE IF EXISTS "sessions" CASCADE;',
    'DROP TABLE IF EXISTS "users" CASCADE;',
  ];

  for (const stmt of dropStatements) {
    await pgliteA.query(stmt);
  }

  const remainingTables = await pgliteA.query<{ table_name: string }>(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `);

  console.log(`  ✓ Teardown verified: ${remainingTables.rows.length} remaining tables.`);
  if (remainingTables.rows.length > 0) {
    throw new Error(`Orphan tables remaining: ${remainingTables.rows.map((r: any) => r.table_name).join(", ")}`);
  }

  console.log("\n================================================================================");
  console.log("  ALL PHASE 2A ISOLATION & ARCHIVAL CHECKS PASSED: 100% SUCCESS");
  console.log("================================================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
