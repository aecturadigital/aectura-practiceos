import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/lib/db/schema";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { hashSessionToken, SESSION_LIFESPAN_SECONDS } from "../src/lib/auth/session";
import {
  hasRole,
  hasPermission,
  assertPermission,
  getEffectivePermissions,
  authorizeRequest,
  CANONICAL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  ClinicRole,
} from "../src/lib/auth/permissions";
import { eq, and, gt, isNull } from "drizzle-orm";
import path from "path";
import { randomBytes } from "node:crypto";

async function runAuthTests() {
  console.log("================================================================================");
  console.log("  AECTURA PRACTICEOS: PHASE 2A AUTH & RBAC HARDENING VERIFICATION SUITE");
  console.log("================================================================================\n");

  const migrationsFolder = path.join(process.cwd(), "drizzle", "migrations");
  const pglite = new PGlite();
  const db = drizzle(pglite, { schema });
  await migrate(db, { migrationsFolder });

  // ============================================================================
  // TEST 1: PASSWORD HASHING & TIMING-SAFE VERIFICATION
  // ============================================================================
  console.log("[TEST 1/7] Testing Password Hashing & Timing-Safe Verification...");
  const rawPassword = "Soulmates@2026!";
  const hashedPassword = hashPassword(rawPassword);

  console.log(`  Derived scrypt hash: ${hashedPassword.slice(0, 24)}... (length: ${hashedPassword.length})`);
  if (!hashedPassword.includes(":")) {
    throw new Error("Password hash format invalid, missing salt separator ':'");
  }

  const validMatch = verifyPassword(rawPassword, hashedPassword);
  if (!validMatch) {
    throw new Error("Valid password verification returned false!");
  }
  console.log("  ✓ Correct password verified successfully.");

  const invalidMatch = verifyPassword("WrongPassword123!", hashedPassword);
  if (invalidMatch) {
    throw new Error("Invalid password incorrectly evaluated to true!");
  }
  console.log("  ✓ Invalid password correctly rejected.");

  const corruptedMatch = verifyPassword(rawPassword, "bad_hash_format");
  if (corruptedMatch) {
    throw new Error("Corrupted hash incorrectly evaluated to true!");
  }
  console.log("  ✓ Malformed hash safely rejected without crashing.");

  // ============================================================================
  // TEST 2: DATABASE SESSION LIFECYCLE (CREATE, VALIDATE, REVOKE)
  // ============================================================================
  console.log("\n[TEST 2/7] Testing PostgreSQL Session Storage & Expiration...");

  // Seed standard roles & canonical permissions into test db
  for (const [roleId, permList] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    await db.insert(schema.roles).values({
      id: roleId,
      name: roleId,
      description: `Test role ${roleId}`,
    }).onConflictDoNothing();

    for (const permId of permList) {
      await db.insert(schema.permissions).values({
        id: permId,
        name: permId,
        category: permId.split(".")[0],
        description: `Permission ${permId}`,
      }).onConflictDoNothing();

      await db.insert(schema.rolePermissions).values({
        roleId,
        permissionId: permId,
      }).onConflictDoNothing();
    }
  }

  // Create test practitioner
  const [testUser] = await db
    .insert(schema.users)
    .values({
      email: "therapist@soulmatestherapy.com",
      name: "Dr. Clinician",
      passwordHash: hashedPassword,
      isActive: true,
    })
    .returning();

  await db.insert(schema.userRoles).values([
    { userId: testUser.id, roleId: "PRACTITIONER" },
  ]);

  // Create session
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_LIFESPAN_SECONDS * 1000);

  const [sessionRow] = await db
    .insert(schema.sessions)
    .values({
      userId: testUser.id,
      tokenHash,
      ipAddress: "127.0.0.1",
      userAgent: "TestRunner/1.0",
      expiresAt,
    })
    .returning();

  console.log(`  ✓ Session row inserted in PostgreSQL (ID: ${sessionRow.id}).`);

  // Validate session query
  const [activeSession] = await db
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.tokenHash, tokenHash),
        gt(schema.sessions.expiresAt, new Date()),
        isNull(schema.sessions.revokedAt)
      )
    )
    .limit(1);

  if (!activeSession || activeSession.userId !== testUser.id) {
    throw new Error("Active session lookup failed!");
  }
  console.log("  ✓ Active session successfully resolved from PostgreSQL.");

  // Test revocation
  await db
    .update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(eq(schema.sessions.tokenHash, tokenHash));

  const [revokedLookup] = await db
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.tokenHash, tokenHash),
        gt(schema.sessions.expiresAt, new Date()),
        isNull(schema.sessions.revokedAt)
      )
    )
    .limit(1);

  if (revokedLookup) {
    throw new Error("Revoked session was still returned as active!");
  }
  console.log("  ✓ Session revocation verified: Revoked token is rejected.");

  // ============================================================================
  // TEST 3: EXPIRED SESSION REJECTION
  // ============================================================================
  console.log("\n[TEST 3/7] Testing Expired Session Handling...");
  const expiredRawToken = randomBytes(32).toString("hex");
  const expiredHash = hashSessionToken(expiredRawToken);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await db.insert(schema.sessions).values({
    userId: testUser.id,
    tokenHash: expiredHash,
    expiresAt: yesterday,
  });

  const [expiredLookup] = await db
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.tokenHash, expiredHash),
        gt(schema.sessions.expiresAt, new Date()),
        isNull(schema.sessions.revokedAt)
      )
    )
    .limit(1);

  if (expiredLookup) {
    throw new Error("Expired session was erroneously treated as active!");
  }
  console.log("  ✓ Expired session correctly rejected by SQL gt(expiresAt, now()) constraint.");

  // ============================================================================
  // TEST 4: BASE ROLE PERMISSION BOUNDARIES (RECEPTIONIST, PRACTITIONER, OWNER)
  // ============================================================================
  console.log("\n[TEST 4/7] Testing Base RBAC Roles (Receptionist, Practitioner, Owner)...");
  const receptionistRoles = ["RECEPTIONIST"];
  const practitionerRoles = ["PRACTITIONER"];
  const ownerRoles = ["OWNER", "PRACTITIONER"];

  // Receptionist checks
  if (!hasPermission(receptionistRoles, "appointments:read")) {
    throw new Error("Receptionist should have appointments:read");
  }
  if (!hasPermission(receptionistRoles, "appointments:write")) {
    throw new Error("Receptionist should have appointments:write");
  }
  if (hasPermission(receptionistRoles, "clinical_notes:read")) {
    throw new Error("CRITICAL PRIVACY VIOLATION: Receptionist must NOT have clinical_notes:read!");
  }
  if (hasPermission(receptionistRoles, "payroll:manage")) {
    throw new Error("Receptionist should NOT have payroll:manage");
  }
  console.log("  ✓ Receptionist: appointments allowed, clinical notes and payroll strictly BLOCKED.");

  // Practitioner checks
  if (!hasPermission(practitionerRoles, "clinical_notes:read")) {
    throw new Error("Practitioner must have clinical_notes:read");
  }
  if (!hasPermission(practitionerRoles, "treatment_plans:deduct")) {
    throw new Error("Practitioner must have treatment_plans:deduct");
  }
  if (hasPermission(practitionerRoles, "settings:manage")) {
    throw new Error("Practitioner should not have settings:manage");
  }
  console.log("  ✓ Practitioner: clinical notes and session deduction allowed, settings management BLOCKED.");

  // Owner checks
  const allActions = [
    "appointments:read",
    "clinical_notes:read",
    "treatment_plans:deduct",
    "ledger:write",
    "staffops:write",
    "payroll:manage",
    "settings:manage",
  ] as const;

  for (const act of allActions) {
    if (!hasPermission(ownerRoles, act)) {
      throw new Error(`Owner should have permission for ${act}`);
    }
  }
  console.log("  ✓ Owner: Complete clinical, operational, financial, and settings authority verified.");

  // ============================================================================
  // TEST 5: HR_MANAGER ISOLATION (STAFF/PAYROLL ALLOWED, CLINICAL ZERO-ACCESS)
  // ============================================================================
  console.log("\n[TEST 5/7] Testing HR_MANAGER Boundary Enforcement...");
  const [hrUser] = await db
    .insert(schema.users)
    .values({
      email: "hr.test@soulmatestherapy.com",
      name: "Anand HR",
      passwordHash: hashedPassword,
      isActive: true,
    })
    .returning();

  await db.insert(schema.userRoles).values([
    { userId: hrUser.id, roleId: "HR_MANAGER" },
  ]);

  const hrPerms = await getEffectivePermissions(hrUser.id, db);

  // HR MUST have staff and payroll permissions
  if (!hrPerms.has("staff.read") || !hrPerms.has("staff.manage") || !hrPerms.has("payroll.read") || !hrPerms.has("payroll.manage")) {
    throw new Error("HR_MANAGER is missing required staff or payroll permissions!");
  }
  console.log("  ✓ HR_MANAGER has full staff.read, staff.manage, payroll.read, and payroll.manage.");

  // HR MUST NOT have any patient clinical or contact permissions
  const clinicalAndPatientPerms = [
    "clinical_notes.read",
    "clinical_notes.create",
    "clinical_notes.update",
    "contacts.read",
    "contacts.create",
    "appointments.read",
    "appointments.create",
    "treatment_plans.read",
  ];

  for (const forbidden of clinicalAndPatientPerms) {
    if (hrPerms.has(forbidden)) {
      throw new Error(`CRITICAL SECURITY FLAW: HR_MANAGER erroneously has clinical/patient permission '${forbidden}'!`);
    }
  }
  console.log("  ✓ HR_MANAGER strictly isolated: Zero patient contact, appointment, and clinical note access.");

  // ============================================================================
  // TEST 6: READ_ONLY_AUDITOR BOUNDARY (READ-ONLY ALLOWED, ZERO MUTATIONS)
  // ============================================================================
  console.log("\n[TEST 6/7] Testing READ_ONLY_AUDITOR Boundary Enforcement...");
  const [auditorUser] = await db
    .insert(schema.users)
    .values({
      email: "auditor.test@soulmatestherapy.com",
      name: "Meera Auditor",
      passwordHash: hashedPassword,
      isActive: true,
    })
    .returning();

  await db.insert(schema.userRoles).values([
    { userId: auditorUser.id, roleId: "READ_ONLY_AUDITOR" },
  ]);

  const auditorPerms = await getEffectivePermissions(auditorUser.id, db);

  // Auditor MUST have read permissions
  const expectedReads = [
    "contacts.read",
    "appointments.read",
    "clinical_notes.read",
    "treatment_plans.read",
    "billing.read",
    "documents.read",
    "staff.read",
    "payroll.read",
    "exports.financial",
  ];

  for (const readPerm of expectedReads) {
    if (!auditorPerms.has(readPerm)) {
      throw new Error(`READ_ONLY_AUDITOR missing required read permission '${readPerm}'`);
    }
  }
  console.log(`  ✓ READ_ONLY_AUDITOR has all ${expectedReads.length} required read and audit permissions.`);

  // Auditor MUST NOT have any mutation/write permissions
  const forbiddenMutations = [
    "contacts.create",
    "contacts.update",
    "contacts.archive",
    "appointments.create",
    "appointments.reschedule",
    "appointments.cancel",
    "clinical_notes.create",
    "clinical_notes.update",
    "treatment_plans.modify",
    "payments.record",
    "refunds.approve",
    "documents.upload",
    "staff.manage",
    "payroll.manage",
    "settings.manage",
  ];

  for (const mut of forbiddenMutations) {
    if (auditorPerms.has(mut)) {
      throw new Error(`CRITICAL SECURITY FLAW: READ_ONLY_AUDITOR has forbidden mutation permission '${mut}'!`);
    }
  }
  console.log(`  ✓ READ_ONLY_AUDITOR verified: 0 of ${forbiddenMutations.length} mutation privileges granted.`);

  // ============================================================================
  // TEST 7: DYNAMIC FINE-GRAINED PERMISSION OVERRIDES (ALLOW vs DENY - DENY WINS)
  // ============================================================================
  console.log("\n[TEST 7/7] Testing Fine-Grained Overrides (Role Defaults + ALLOW - DENY)...");

  // Create a staff member with RECEPTIONIST role
  const [customStaff] = await db
    .insert(schema.users)
    .values({
      email: "custom.staff@soulmatestherapy.com",
      name: "Custom Permissions Staff",
      passwordHash: hashedPassword,
      isActive: true,
    })
    .returning();

  await db.insert(schema.userRoles).values([
    { userId: customStaff.id, roleId: "RECEPTIONIST" },
  ]);

  // Baseline check: Receptionist has appointments.create, but not staff.read
  let effective = await getEffectivePermissions(customStaff.id, db);
  if (!effective.has("appointments.create") || effective.has("staff.read")) {
    throw new Error("Baseline receptionist permissions incorrect");
  }
  console.log("  ✓ Baseline role permissions resolved correctly.");

  // 1. Apply USER ALLOW OVERRIDE: grant staff.read to this specific user
  await db.insert(schema.userPermissionOverrides).values({
    userId: customStaff.id,
    permissionId: "staff.read",
    effect: "ALLOW",
    reason: "Special temporary roster coordinator assignment",
    grantedBy: testUser.id,
  });

  effective = await getEffectivePermissions(customStaff.id, db);
  if (!effective.has("staff.read")) {
    throw new Error("ALLOW override failed: staff.read was not granted!");
  }
  console.log("  ✓ USER ALLOW override succeeded: staff.read granted to user.");

  // 2. Apply USER DENY OVERRIDE: explicitly revoke appointments.create
  await db.insert(schema.userPermissionOverrides).values({
    userId: customStaff.id,
    permissionId: "appointments.create",
    effect: "DENY",
    reason: "Disciplinary booking freeze",
    grantedBy: testUser.id,
  });

  effective = await getEffectivePermissions(customStaff.id, db);
  if (effective.has("appointments.create")) {
    throw new Error("CRITICAL OVERRIDE FLAW: Explicit DENY failed! appointments.create was still present!");
  }
  console.log("  ✓ USER DENY override succeeded: appointments.create revoked despite being in RECEPTIONIST role.");

  // 3. Test Database Unique Constraint on (userId, permissionId)
  let duplicatePrevented = false;
  try {
    await db.insert(schema.userPermissionOverrides).values({
      userId: customStaff.id,
      permissionId: "staff.read", // Already exists!
      effect: "DENY",
      reason: "Conflicting duplicate attempt",
      grantedBy: testUser.id,
    });
  } catch (err: any) {
    duplicatePrevented = true;
    console.log(`  ✓ Database Unique Constraint 'uniq_user_override' prevented contradictory duplicate override.`);
  }

  if (!duplicatePrevented) {
    throw new Error("CRITICAL SAFETY FLAW: Duplicate user permission override was permitted!");
  }

  // 4. Test Transitioning an ALLOW to a DENY: Update staff.read to DENY
  await db
    .update(schema.userPermissionOverrides)
    .set({ effect: "DENY", reason: "Revoked assignment" })
    .where(
      and(
        eq(schema.userPermissionOverrides.userId, customStaff.id),
        eq(schema.userPermissionOverrides.permissionId, "staff.read")
      )
    );

  effective = await getEffectivePermissions(customStaff.id, db);
  if (effective.has("staff.read")) {
    throw new Error("CRITICAL OVERRIDE FLAW: Updating to DENY failed to revoke staff.read!");
  }
  console.log("  ✓ DENY SUPREMACY VERIFIED: Updating override to DENY immediately stripped permission.");

  console.log("\n================================================================================");
  console.log("  ALL 7 PHASE 2A AUTH & RBAC HARDENING CHECKS PASSED: 100% SUCCESS");
  console.log("================================================================================\n");
}

runAuthTests().catch((err) => {
  console.error("Auth test suite failed:", err);
  process.exit(1);
});
