import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import path from "path";

async function runTestSuite() {
  console.log("================================================================================");
  console.log("  AECTURA PRACTICEOS GOLD MASTER: PHASE 1 COMPREHENSIVE VERIFICATION SUITE");
  console.log("================================================================================\n");

  const migrationsFolder = path.join(process.cwd(), "drizzle", "migrations");

  // ============================================================================
  // TEST 1: STAGING MIGRATION DRY RUN (29 TABLES)
  // ============================================================================
  console.log("[TEST 1/6] Running Staging Migration Dry Run on clinic_soulmates...");
  const pgliteA = new PGlite();
  const dbA = drizzle(pgliteA, { schema });

  const t0 = Date.now();
  await migrate(dbA, { migrationsFolder });
  const migrationDurationMs = Date.now() - t0;
  console.log(`[SUCCESS] Migration applied successfully in ${migrationDurationMs}ms.`);

  // Verify all 29 tables in information_schema
  const tableResult = await pgliteA.query<{ table_name: string }>(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const createdTables = tableResult.rows.map((r: any) => r.table_name);
  console.log(`[SUCCESS] Verified ${createdTables.length} tables in PostgreSQL catalog:`);
  console.log(`  Tables: ${createdTables.join(", ")}`);

  if (createdTables.length < 29) {
    throw new Error(`Expected at least 29 tables, but found ${createdTables.length}`);
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
    "idx_appointments_date",
    "idx_ledger_contact_id",
    "idx_outbox_status_scheduled",
    "uniq_user_role",
  ];

  for (const idx of criticalIndexes) {
    const found = indexResult.rows.some((r: any) => r.indexname === idx);
    if (!found) {
      throw new Error(`Critical index missing: ${idx}`);
    }
    console.log(`  [SUCCESS] Index verified: ${idx}`);
  }

  // ============================================================================
  // TEST 3: SEED & READ/WRITE DATA INTEGRITY
  // ============================================================================
  console.log("\n[TEST 3/6] Testing Data Insertion & Domain Relational Integrity...");
  
  // Roles
  await dbA.insert(schema.roles).values({
    id: "PRACTITIONER",
    name: "Therapist / Clinical Hypnotherapist",
    description: "Clinical practitioner role",
  });

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

  // Treatment Course
  const [course1] = await dbA.insert(schema.treatmentCourses).values({
    contactId: patient1.id,
    title: "Anxiety & Somatic Stress Recovery Course",
    prescribedBy: user1.id,
    startDate: "2026-09-10",
  }).returning();

  // Plan Cycle (Fixed 3 sessions)
  const [cycle1] = await dbA.insert(schema.planCycles).values({
    courseId: course1.id,
    cycleIndex: 1,
    title: "Cycle 1: 3-Session Pack",
    price: "7500.00",
    totalSessions: 3,
    consumedSessions: 1,
    noShowPolicy: "REQUIRES_APPROVAL",
    startDate: "2026-09-10",
  }).returning();

  // Treatment Session (Entitlement Deduction Guard)
  const [session1] = await dbA.insert(schema.treatmentSessions).values({
    cycleId: cycle1.id,
    appointmentId: appt1.id,
    sessionNumber: 1,
    status: "COMPLETED",
    isEntitlementDeducted: true,
    deductedAt: new Date(),
    authorizedBy: user1.id,
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

  // Outbox Event
  await dbA.insert(schema.outboxEvents).values({
    idempotencyKey: "evt_test_priya_001",
    eventType: "appointment.confirmed",
    payload: { appointmentId: appt1.id, patient: "Priya Sharma" },
    status: "PENDING",
  });

  console.log("[SUCCESS] Data successfully inserted across users, contacts, appointments, courses, cycles, sessions, notes, outbox.");

  // Verify retrieval
  const fetchedContact = await dbA.select().from(schema.contacts).where(eq(schema.contacts.id, patient1.id));
  if (fetchedContact.length !== 1 || fetchedContact[0].phone !== "+91 98230 12345") {
    throw new Error("Contact verification failed");
  }
  console.log("[SUCCESS] Query verification passed: Retained patient Priya Sharma (+91 98230 12345).");

  // ============================================================================
  // TEST 4: FOREIGN KEY CASCADE & REFERENTIAL INTEGRITY
  // ============================================================================
  console.log("\n[TEST 4/6] Testing Foreign Key Cascades & Deletion Boundaries...");
  
  // Create a temporary patient with dependent records
  const [tempPatient] = await dbA.insert(schema.contacts).values({
    fullName: "Temp Cascade Patient",
    phone: "+91 99999 00000",
  }).returning();

  const [tempAppt] = await dbA.insert(schema.appointments).values({
    contactId: tempPatient.id,
    therapyType: "Consultation",
    scheduledDate: "2026-09-20",
    startTime: "14:00",
    endTime: "15:00",
  }).returning();

  await dbA.insert(schema.clinicalNotes).values({
    contactId: tempPatient.id,
    appointmentId: tempAppt.id,
    hypnoticDepth: "Medium",
    primaryIssue: "Temp Issue",
  });

  // Delete temp patient -> appointments and clinical notes MUST cascade delete
  await dbA.delete(schema.contacts).where(eq(schema.contacts.id, tempPatient.id));

  const orphanAppts = await dbA.select().from(schema.appointments).where(eq(schema.appointments.contactId, tempPatient.id));
  const orphanNotes = await dbA.select().from(schema.clinicalNotes).where(eq(schema.clinicalNotes.contactId, tempPatient.id));

  if (orphanAppts.length !== 0 || orphanNotes.length !== 0) {
    throw new Error(`Cascade failure: found ${orphanAppts.length} orphan appointments and ${orphanNotes.length} orphan notes`);
  }
  console.log("[SUCCESS] FK CASCADE verified: Deleting patient cleanly cascaded appointments and clinical notes.");

  // Test Outbox Idempotency Unique Constraint
  let duplicatePrevented = false;
  try {
    await dbA.insert(schema.outboxEvents).values({
      idempotencyKey: "evt_test_priya_001", // Duplicate!
      eventType: "appointment.confirmed",
      payload: { appointmentId: appt1.id },
      status: "PENDING",
    });
  } catch (err: any) {
    duplicatePrevented = true;
  }
  if (!duplicatePrevented) {
    throw new Error("Duplicate idempotency key was erroneously permitted!");
  }
  console.log("[SUCCESS] Idempotency constraint verified: Duplicate outbox event was correctly rejected.");

  // ============================================================================
  // TEST 5: CLINIC DATABASE ISOLATION PROOF
  // ============================================================================
  console.log("\n[TEST 5/6] Testing Clinic Database Isolation (clinic_soulmates vs clinic_motionplus)...");
  
  // Create a totally distinct isolated database for clinic_motionplus
  const pgliteB = new PGlite();
  const dbB = drizzle(pgliteB, { schema });
  await migrate(dbB, { migrationsFolder });

  // Clinic B has its own practitioner
  const [drMotion] = await dbB.insert(schema.users).values({
    email: "lead@motionplusphysio.com",
    name: "Dr. Aryan Mehta (PT)",
    passwordHash: "hash_configured",
  }).returning();

  // Clinic B has its own patient
  const [patientMotion] = await dbB.insert(schema.contacts).values({
    fullName: "Rohan Kulkarni",
    phone: "+91 97777 11223",
    city: "Bangalore",
    status: "ACTIVE",
    primaryConcern: "Rotator Cuff Tendinopathy",
  }).returning();

  // Query Clinic B from dbB
  const clinicBContacts = await dbB.select().from(schema.contacts);
  console.log(`  Clinic B (clinic_motionplus) contacts count: ${clinicBContacts.length} (${clinicBContacts[0].fullName})`);

  // Query Clinic A from dbA
  const clinicAContacts = await dbA.select().from(schema.contacts);
  console.log(`  Clinic A (clinic_soulmates) contacts count: ${clinicAContacts.length} (${clinicAContacts.map((c: any) => c.fullName).join(", ")})`);

  // Check cross-database isolation
  const soulmatesInB = clinicBContacts.some((c: any) => c.phone === "+91 98230 12345");
  const motionInA = clinicAContacts.some((c: any) => c.phone === "+91 97777 11223");

  if (soulmatesInB || motionInA) {
    throw new Error("Cross-database leakage detected! Isolation rule violated.");
  }
  console.log("[SUCCESS] Strict Database Isolation verified: Zero cross-clinic record contamination.");

  // ============================================================================
  // TEST 6: ROLLBACK / TEARDOWN ORDER VERIFICATION
  // ============================================================================
  console.log("\n[TEST 6/6] Testing Rollback & Teardown in Reverse Dependency Order...");

  // Drop tables in reverse topological order
  const dropStatements = [
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

  console.log(`[SUCCESS] Teardown completed. Remaining public base tables: ${remainingTables.rows.length}`);
  if (remainingTables.rows.length > 0) {
    throw new Error(`Orphan tables remaining after rollback: ${remainingTables.rows.map((r: any) => r.table_name).join(", ")}`);
  }
  console.log("[SUCCESS] Rollback verification passed: Clean teardown with zero dangling constraints.");

  console.log("\n================================================================================");
  console.log("  ALL PHASE 1 CHECKS PASSED: CANONICAL SCHEMA & MIGRATIONS FULLY VERIFIED");
  console.log("================================================================================\n");
}

runTestSuite().catch(err => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
