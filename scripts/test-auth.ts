import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/lib/db/schema";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { hashSessionToken, SESSION_LIFESPAN_SECONDS } from "../src/lib/auth/session";
import { hasRole, hasPermission, assertPermission } from "../src/lib/auth/permissions";
import { eq, and, gt, isNull } from "drizzle-orm";
import path from "path";
import { randomBytes } from "node:crypto";

async function runAuthTests() {
  console.log("================================================================================");
  console.log("  AECTURA PRACTICEOS: PHASE 2 AUTH & RBAC VERIFICATION SUITE");
  console.log("================================================================================\n");

  // ============================================================================
  // TEST 1: PASSWORD HASHING & TIMING-SAFE VERIFICATION
  // ============================================================================
  console.log("[TEST 1/4] Testing Password Hashing & Verification...");
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
  console.log("\n[TEST 2/4] Testing PostgreSQL Session Storage & Expiration...");
  const migrationsFolder = path.join(process.cwd(), "drizzle", "migrations");
  const pglite = new PGlite();
  const db = drizzle(pglite, { schema });
  await migrate(db, { migrationsFolder });

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

  await db.insert(schema.roles).values([
    { id: "PRACTITIONER", name: "Practitioner" },
    { id: "OWNER", name: "Owner" },
    { id: "RECEPTIONIST", name: "Receptionist" },
  ]).onConflictDoNothing();

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
  console.log("\n[TEST 3/4] Testing Expired Session Handling...");
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
  // TEST 4: RBAC PERMISSION MATRIX ENFORCEMENT
  // ============================================================================
  console.log("\n[TEST 4/4] Testing RBAC Permission Boundaries...");

  const receptionistRoles = ["RECEPTIONIST"];
  const practitionerRoles = ["PRACTITIONER"];
  const ownerRoles = ["OWNER", "PRACTITIONER"];

  // 1. Receptionist checks
  console.log("  Checking Receptionist boundaries:");
  if (!hasPermission(receptionistRoles, "appointments:read")) {
    throw new Error("Receptionist should have appointments:read");
  }
  console.log("    ✓ appointments:read -> ALLOWED");

  if (!hasPermission(receptionistRoles, "appointments:write")) {
    throw new Error("Receptionist should have appointments:write");
  }
  console.log("    ✓ appointments:write -> ALLOWED");

  if (hasPermission(receptionistRoles, "clinical_notes:read")) {
    throw new Error("CRITICAL SECURITY FLAW: Receptionist should NOT have clinical_notes:read!");
  }
  console.log("    ✓ clinical_notes:read -> BLOCKED (Strict Clinical Privacy Enforced)");

  if (hasPermission(receptionistRoles, "payroll:manage")) {
    throw new Error("Receptionist should NOT have payroll:manage");
  }
  console.log("    ✓ payroll:manage -> BLOCKED");

  // 2. Practitioner checks
  console.log("  Checking Practitioner boundaries:");
  if (!hasPermission(practitionerRoles, "clinical_notes:read")) {
    throw new Error("Practitioner must have clinical_notes:read");
  }
  console.log("    ✓ clinical_notes:read -> ALLOWED");

  if (!hasPermission(practitionerRoles, "treatment_plans:deduct")) {
    throw new Error("Practitioner must have treatment_plans:deduct");
  }
  console.log("    ✓ treatment_plans:deduct -> ALLOWED");

  if (hasPermission(practitionerRoles, "settings:manage")) {
    throw new Error("Practitioner should not have settings:manage");
  }
  console.log("    ✓ settings:manage -> BLOCKED");

  // 3. Owner checks
  console.log("  Checking Owner boundaries:");
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
  console.log("    ✓ Owner has complete clinical, financial, staff, and settings access.");

  // Test assertPermission helper throws properly
  let assertionCaught = false;
  try {
    assertPermission(receptionistRoles, "clinical_notes:read");
  } catch (err: any) {
    assertionCaught = true;
    console.log(`    ✓ assertPermission cleanly threw expected error: "${err.message}"`);
  }
  if (!assertionCaught) {
    throw new Error("assertPermission did not throw on forbidden action!");
  }

  console.log("\n================================================================================");
  console.log("  ALL PHASE 2 AUTH & RBAC CHECKS PASSED: 100% SUCCESS");
  console.log("================================================================================\n");
}

runAuthTests().catch((err) => {
  console.error("Auth test suite failed:", err);
  process.exit(1);
});
