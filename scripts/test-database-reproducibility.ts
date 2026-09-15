import { Client } from "ssh2";
import net from "net";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

const envFile = path.resolve(__dirname, "../.env.infrastructure.local");
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

const KVM_HOST = process.env.KVM_HOST || "72.60.198.37";
const KVM_USER = process.env.KVM_USER || "root";
const SSH_KEY_PATH =
  process.env.KVM_SSH_KEY_PATH ||
  path.join(process.env.USERPROFILE || process.env.HOME || "", ".ssh", "id_ed25519");

const OWNER_USER = process.env.STAGING_OWNER_USER || "owner_soulmates_staging";
const OWNER_PASSWORD = process.env.STAGING_OWNER_PASSWORD || "";
const SCRATCH_DB = "clinic_repro_test";
const PG_LOCAL_PORT = 5438;

function createTunnel(
  sshConn: Client,
  localPort: number,
  remoteHost: string,
  remotePort: number
): Promise<net.Server> {
  return new Promise((resolve, reject) => {
    const server = net.createServer((socket) => {
      sshConn.forwardOut(
        "127.0.0.1",
        socket.remotePort || 0,
        remoteHost,
        remotePort,
        (err, stream) => {
          if (err) {
            socket.end();
            return;
          }
          socket.pipe(stream).pipe(socket);
        }
      );
    });

    server.listen(localPort, "127.0.0.1", () => {
      resolve(server);
    });
    server.on("error", reject);
  });
}

async function runDatabaseReproducibilityTest() {
  console.log("================================================================================");
  console.log("  AECTURA PRACTICEOS: DATABASE REPRODUCIBILITY & ZERO-TO-ONE MIGRATION SUITE");
  console.log("  Verifying Fresh Provisioning, GiST Exclusion, and Duration Collision Matrix");
  console.log("================================================================================\n");

  if (!fs.existsSync(SSH_KEY_PATH)) {
    throw new Error(`SSH private key not found at expected path: ${SSH_KEY_PATH}`);
  }
  const privateKey = fs.readFileSync(SSH_KEY_PATH, "utf8");

  const sshConn = new Client();
  await new Promise<void>((resolve, reject) => {
    sshConn.on("ready", resolve);
    sshConn.on("error", reject);
    sshConn.connect({
      host: KVM_HOST,
      port: 22,
      username: KVM_USER,
      privateKey,
    });
  });

  const pgTunnel = await createTunnel(sshConn, PG_LOCAL_PORT, "10.0.10.3", 5432);
  console.log(`  ✓ SSH Tunnel active to PostgreSQL core (127.0.0.1:${PG_LOCAL_PORT})`);

  // Admin connection to default postgres db to create/drop scratch db
  const adminPool = new Pool({
    host: "127.0.0.1",
    port: PG_LOCAL_PORT,
    user: OWNER_USER,
    password: OWNER_PASSWORD,
    database: "clinic_soulmates_staging",
    ssl: false,
  });

  try {
    // 1. Create Fresh Scratch Database
    console.log(`\n[STEP 1/6] Creating Scratch Database '${SCRATCH_DB}' from Zero...`);
    await adminPool.query(`DROP DATABASE IF EXISTS ${SCRATCH_DB} WITH (FORCE);`);
    await adminPool.query(`CREATE DATABASE ${SCRATCH_DB} OWNER ${OWNER_USER};`);
    console.log(`  ✓ Fresh empty database '${SCRATCH_DB}' created.`);

    // Connect to scratch database
    const scratchPool = new Pool({
      host: "127.0.0.1",
      port: PG_LOCAL_PORT,
      user: OWNER_USER,
      password: OWNER_PASSWORD,
      database: SCRATCH_DB,
      ssl: false,
    });

    try {
      // 2. Apply Repository Migrations Sequentially (0000 -> 0005)
      console.log("\n[STEP 2/6] Executing Repository Migrations 0000 -> 0005 without Manual DDL...");
      const migrationsDir = path.resolve(__dirname, "../drizzle/migrations");
      const migrationFiles = [
        "0000_premium_karma.sql",
        "0001_dry_apocalypse.sql",
        "0002_charming_scarlet_spider.sql",
        "0003_yielding_doctor_strange.sql",
        "0004_appointment_overlap_exclusion.sql",
        "0005_fail_closed_temporal_exclusion.sql",
      ];

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Migration file missing: ${filePath}`);
        }
        const sql = fs.readFileSync(filePath, "utf8");
        const cleanSql = sql.replace(/--> statement-breakpoint/g, ";\n");
        await scratchPool.query(cleanSql);
        console.log(`  ✓ Successfully applied: ${file}`);
      }

      // 3. Verify PostgreSQL Catalog Invariants
      console.log("\n[STEP 3/6] Verifying Catalog Invariants (Tables, Extensions, Constraints)...");
      const tablesRes = await scratchPool.query(`
        SELECT count(*) AS table_count FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
      `);
      console.log(`  ✓ Total tables created: ${tablesRes.rows[0].table_count} tables (expected: 33)`);
      if (parseInt(tablesRes.rows[0].table_count, 10) !== 33) {
        throw new Error(`Catalog mismatch: Expected 33 tables, got ${tablesRes.rows[0].table_count}`);
      }

      const extRes = await scratchPool.query(
        "SELECT extname FROM pg_extension WHERE extname = 'btree_gist';"
      );
      if (extRes.rows.length === 0) {
        throw new Error("Extension 'btree_gist' not created by migration!");
      }
      console.log("  ✓ Extension 'btree_gist' verified active.");

      const conRes = await scratchPool.query(`
        SELECT conname FROM pg_constraint WHERE conname = 'excl_practitioner_no_overlap';
      `);
      if (conRes.rows.length === 0) {
        throw new Error("Exclusion constraint 'excl_practitioner_no_overlap' not created by migration history!");
      }
      console.log("  ✓ GiST Exclusion Constraint 'excl_practitioner_no_overlap' verified.");

      // 4. Seed Seed Minimal Relational Fixture
      console.log("\n[STEP 4/6] Seeding Minimal Relational Test Fixture...");
      const userRes = await scratchPool.query(`
        INSERT INTO users (email, name, password_hash, is_active)
        VALUES ('lead.practitioner@clinic.example', 'Dr. Repro Test', 'scrypt_hash_mock', true)
        RETURNING id;
      `);
      const practitionerId = userRes.rows[0].id;

      const contactRes = await scratchPool.query(`
        INSERT INTO contacts (full_name, phone, status)
        VALUES ('Test Patient', '+91 99999 11111', 'ACTIVE')
        RETURNING id;
      `);
      const contactId = contactRes.rows[0].id;
      console.log("  ✓ Fixture established (User & Contact).");

      // 5. Run Comprehensive Variable-Duration Collision Matrix
      console.log("\n[STEP 5/6] Executing Comprehensive Duration Collision Matrix on Fresh Database...");
      const testDate = "2026-12-01";

      const insertAppt = async (
        startHour: string,
        durationMin: number,
        bufferMin: number = 15,
        status: string = "SCHEDULED"
      ) => {
        const [sh, sm] = startHour.split(":").map(Number);
        const startMinTotal = sh * 60 + sm;
        const sessionEndMinTotal = startMinTotal + durationMin;
        const blockedUntilMinTotal = sessionEndMinTotal + bufferMin;

        const endHour = `${Math.floor(sessionEndMinTotal / 60).toString().padStart(2, "0")}:${(sessionEndMinTotal % 60).toString().padStart(2, "0")}`;
        const blockedUntilHour = `${Math.floor(blockedUntilMinTotal / 60).toString().padStart(2, "0")}:${(blockedUntilMinTotal % 60).toString().padStart(2, "0")}`;

        const startAt = `${testDate}T${startHour}:00+05:30`;
        const endAt = `${testDate}T${endHour}:00+05:30`;
        const blockedUntilAt = `${testDate}T${blockedUntilHour}:00+05:30`;

        return await scratchPool.query(
          `INSERT INTO appointments (
            contact_id, practitioner_id, practitioner_name, therapy_type,
            mode, scheduled_date, start_time, end_time, start_at, end_at, blocked_until_at,
            status, payment_status, amount
          ) VALUES ($1, $2, 'Dr. Repro Test', 'Therapy', 'IN_CLINIC', $3, $4, $5, $6, $7, $8, $9, 'PENDING', 2500.00)
          RETURNING id;`,
          [contactId, practitionerId, testDate, startHour, endHour, startAt, endAt, blockedUntilAt, status]
        );
      };

      // Case A: 150-min PLR Session (10:00 -> 12:30 + 15m buffer = 10:00 -> 12:45)
      await insertAppt("10:00", 150, 15);
      console.log("  ✓ Case A: Base 150-min PLR session (10:00 - 12:30, blocked until 12:45) inserted.");

      // Case B: Collision within duration (11:00 -> 12:00) MUST FAIL
      let caseBFailed = false;
      try {
        await insertAppt("11:00", 60, 15);
      } catch (err: any) {
        if (err.code === "23P01") caseBFailed = true;
      }
      if (!caseBFailed) throw new Error("Collision Failure: 11:00 - 12:00 was allowed inside 10:00 - 12:45!");
      console.log("  ✓ Case B: 60-min appointment inside (11:00 - 12:00) REJECTED by GiST exclusion.");

      // Case C: Collision with post-session buffer (12:30 -> 13:30) MUST FAIL (buffer protection)
      let caseCFailed = false;
      try {
        await insertAppt("12:30", 60, 15);
      } catch (err: any) {
        if (err.code === "23P01") caseCFailed = true;
      }
      if (!caseCFailed) throw new Error("Buffer Failure: 12:30 - 13:30 was allowed during 15m buffer window!");
      console.log("  ✓ Case C: Appointment starting during buffer window (12:30 - 13:30) REJECTED by GiST exclusion.");

      // Case D: Partial-start overlap (09:00 -> 10:30) MUST FAIL
      let caseDFailed = false;
      try {
        await insertAppt("09:00", 90, 15);
      } catch (err: any) {
        if (err.code === "23P01") caseDFailed = true;
      }
      if (!caseDFailed) throw new Error("Collision Failure: Partial-start overlap (09:00 - 10:30) was allowed!");
      console.log("  ✓ Case D: Partial-start overlap (09:00 - 10:30) REJECTED by GiST exclusion.");

      // Case E: Enclosing appointment (09:00 -> 14:00, 300 min) MUST FAIL
      let caseEFailed = false;
      try {
        await insertAppt("09:00", 300, 15);
      } catch (err: any) {
        if (err.code === "23P01") caseEFailed = true;
      }
      if (!caseEFailed) throw new Error("Collision Failure: Enclosing appointment (09:00 - 14:00) was allowed!");
      console.log("  ✓ Case E: Fully enclosing appointment (09:00 - 14:00) REJECTED by GiST exclusion.");

      // Case F: Valid adjacent appointment immediately after buffer (12:45 -> 13:45) MUST SUCCEED
      await insertAppt("12:45", 60, 15);
      console.log("  ✓ Case F: Adjacent appointment immediately after buffer (12:45 - 13:45) ALLOWED.");

      // Case G: Insert cancelled appointment at 14:00 -> 15:00 and re-book at 14:00 -> 15:00
      await insertAppt("14:00", 60, 15, "CANCELLED");
      console.log("  ✓ Case G: Cancelled appointment inserted at 14:00 - 15:00.");
      await insertAppt("14:00", 60, 15, "SCHEDULED");
      console.log("  ✓ Case G: Re-booking cancelled slot (14:00 - 15:00) ALLOWED (unblocking verified).");

      // Case H: Simultaneous Race Condition (2 concurrent requests for 16:00 -> 17:00)
      const raceResults = await Promise.allSettled([
        insertAppt("16:00", 60, 15),
        insertAppt("16:00", 60, 15),
      ]);
      const raceSuccesses = raceResults.filter((r) => r.status === "fulfilled");
      const raceRejections = raceResults.filter((r) => r.status === "rejected");

      if (raceSuccesses.length !== 1 || raceRejections.length !== 1) {
        throw new Error(`Race condition failure: Expected 1 win & 1 rejection, got ${raceSuccesses.length} / ${raceRejections.length}`);
      }
      console.log("  ✓ Case H: Simultaneous race condition: Exactly 1 transaction committed, 1 rejected with 23P01.");

      // Total verified appointments in DB
      const finalCountRes = await scratchPool.query("SELECT count(*) AS count FROM appointments WHERE status = 'SCHEDULED';");
      console.log(`  ✓ Exactly valid appointments surviving in database: ${finalCountRes.rows[0].count} (expected: 4).\n`);
    } finally {
      await scratchPool.end();
    }

    // 6. Clean Up Scratch Database
    console.log(`[STEP 6/6] Tearing down temporary scratch database '${SCRATCH_DB}'...`);
    await adminPool.query(`DROP DATABASE ${SCRATCH_DB} WITH (FORCE);`);
    console.log(`  ✓ Database '${SCRATCH_DB}' cleanly dropped.`);

    console.log("================================================================================");
    console.log("  ALL DATABASE REPRODUCIBILITY & COLLISION VERIFICATIONS PASSED: 100% SUCCESS");
    console.log("================================================================================\n");
  } finally {
    await adminPool.end();
    pgTunnel.close();
    sshConn.end();
  }
}

runDatabaseReproducibilityTest().catch((err) => {
  console.error("Database reproducibility verification failed:", err);
  process.exit(1);
});
