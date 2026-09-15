import { Client } from "ssh2";
import net from "net";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

// Load configuration from local gitignored env file or process environment
const envFile = path.resolve(__dirname, "../.env.infrastructure.local");
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

const KVM_HOST = process.env.KVM_HOST || "72.60.198.37";
const KVM_USER = process.env.KVM_USER || "root";
const SSH_KEY_PATH =
  process.env.KVM_SSH_KEY_PATH ||
  path.join(process.env.USERPROFILE || process.env.HOME || "", ".ssh", "id_ed25519");

const DB_NAME = process.env.STAGING_DB_NAME || "clinic_soulmates_staging";
const OWNER_USER = process.env.STAGING_OWNER_USER || "owner_soulmates_staging";
const OWNER_PASSWORD = process.env.STAGING_OWNER_PASSWORD || "";
const RUNTIME_USER = process.env.STAGING_RUNTIME_USER || "user_soulmates_staging";
const RUNTIME_PASSWORD = process.env.STAGING_RUNTIME_PASSWORD || "";

const PG_LOCAL_PORT = 5433;
const PGBOUNCER_LOCAL_PORT = 5434;

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

async function runRealPostgresVerification() {
  console.log("================================================================================");
  console.log("  AECTURA PRACTICEOS: REAL POSTGRESQL 16 & PGBOUNCER VERIFICATION");
  console.log("  Infrastructure Phase I Security & Hardening Suite");
  console.log("================================================================================\n");

  // 1. Establish SSH Connection via Key Authentication
  console.log(`[STEP 1/7] Connecting to KVM (${KVM_HOST}) via ED25519 SSH Key...`);
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
  console.log("  ✓ SSH Authentication successful (Key-based, no passwords used).\n");

  const pgTunnel = await createTunnel(sshConn, PG_LOCAL_PORT, "10.0.10.3", 5432);
  const pgbouncerTunnel = await createTunnel(sshConn, PGBOUNCER_LOCAL_PORT, "10.0.10.4", 5432);
  console.log(`  ✓ SSH Tunnel active: 127.0.0.1:${PG_LOCAL_PORT} -> aectura-practiceos-postgres:5432`);
  console.log(`  ✓ SSH Tunnel active: 127.0.0.1:${PGBOUNCER_LOCAL_PORT} -> aectura-practiceos-pgbouncer:5432\n`);

  const ownerPool = new Pool({
    host: "127.0.0.1",
    port: PG_LOCAL_PORT,
    user: OWNER_USER,
    password: OWNER_PASSWORD,
    database: DB_NAME,
    max: 5,
    ssl: false,
  });

  const runtimePool = new Pool({
    host: "127.0.0.1",
    port: PG_LOCAL_PORT,
    user: RUNTIME_USER,
    password: RUNTIME_PASSWORD,
    database: DB_NAME,
    max: 5,
    ssl: false,
  });

  try {
    // 2. Engine Version & Extension Verification
    console.log("[STEP 2/7] Verifying PostgreSQL 16 Engine & Extensions...");
    const versionRes = await ownerPool.query("SELECT version();");
    console.log(`  ✓ Target Engine: ${versionRes.rows[0].version.split(",")[0]}`);
    if (!versionRes.rows[0].version.includes("PostgreSQL 16")) {
      throw new Error("Expected PostgreSQL 16 on staging core!");
    }

    const extRes = await ownerPool.query(
      "SELECT extname FROM pg_extension WHERE extname = 'btree_gist';"
    );
    if (extRes.rows.length === 0) {
      throw new Error("Mandatory extension 'btree_gist' not installed on PostgreSQL!");
    }
    console.log("  ✓ PostgreSQL extension 'btree_gist' is active.\n");

    // 3. Schema Catalog & Constraint Inventory
    console.log("[STEP 3/7] Verifying Schema Catalog & Constraints...");
    const tablesRes = await ownerPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const tableNames = tablesRes.rows.map((r) => r.table_name);
    console.log(`  ✓ Total tables in PostgreSQL 16: ${tableNames.length} tables`);
    if (tableNames.length < 30) {
      throw new Error(`Expected at least 30 domain tables, found ${tableNames.length}`);
    }

    // Check GiST exclusion constraint excl_practitioner_no_overlap
    const conRes = await ownerPool.query(`
      SELECT conname, contype FROM pg_constraint 
      WHERE conname = 'excl_practitioner_no_overlap';
    `);
    if (conRes.rows.length === 0) {
      throw new Error("GiST exclusion constraint 'excl_practitioner_no_overlap' not found!");
    }
    console.log("  ✓ GiST Exclusion Constraint 'excl_practitioner_no_overlap' verified.\n");

    // 4. P1 Database Least Privilege Verification
    console.log("[STEP 4/7] Verifying P1 Database Least Privilege Boundaries...");
    // Runtime role MUST NOT be allowed to DROP TABLE
    let dropTableBlocked = false;
    try {
      await runtimePool.query("DROP TABLE contacts;");
    } catch (err: any) {
      dropTableBlocked = true;
      console.log(`  ✓ DROP TABLE blocked for runtime user: ${err.message}`);
    }
    if (!dropTableBlocked) {
      throw new Error("LEAST PRIVILEGE FAILURE: Runtime user was allowed to DROP TABLE!");
    }

    // Runtime role MUST NOT be allowed to DROP SCHEMA
    let dropSchemaBlocked = false;
    try {
      await runtimePool.query("DROP SCHEMA public CASCADE;");
    } catch (err: any) {
      dropSchemaBlocked = true;
      console.log(`  ✓ DROP SCHEMA blocked for runtime user: ${err.message}`);
    }
    if (!dropSchemaBlocked) {
      throw new Error("LEAST PRIVILEGE FAILURE: Runtime user was allowed to DROP SCHEMA!");
    }

    // Runtime role MUST NOT be allowed to CREATE TABLE in schema public
    let createTableBlocked = false;
    try {
      await runtimePool.query("CREATE TABLE rogue_table (id serial primary key);");
    } catch (err: any) {
      createTableBlocked = true;
      console.log(`  ✓ CREATE TABLE blocked for runtime user: ${err.message}`);
    }
    if (!createTableBlocked) {
      throw new Error("LEAST PRIVILEGE FAILURE: Runtime user was allowed to CREATE TABLE!");
    }

    // Runtime user MUST have DML privileges (SELECT, INSERT, UPDATE, DELETE)
    const selectRes = await runtimePool.query("SELECT count(*) FROM contacts;");
    console.log(`  ✓ DML SELECT permitted for runtime user (Contacts: ${selectRes.rows[0].count}).`);
    console.log("  ✓ P1 Least Privilege Enforcement: 100% VERIFIED.\n");

    // 5. P2 GiST Range Overlap Enforcement on Real PostgreSQL
    console.log("[STEP 5/7] Testing P2 Overlap Collision Integrity (excl_practitioner_no_overlap)...");
    const testDoctorRes = await runtimePool.query("SELECT id FROM users LIMIT 1;");
    const testDoctorId = testDoctorRes.rows[0]?.id;
    const testContactRes = await runtimePool.query("SELECT id FROM contacts LIMIT 1;");
    const contactId = testContactRes.rows[0]?.id;

    if (!testDoctorId || !contactId) {
      throw new Error("Missing user or contact for overlap test");
    }

    // Ensure clean state for test practitioner on test date
    const testDate = "2026-11-20";
    await ownerPool.query(
      "DELETE FROM appointments WHERE practitioner_id = $1 AND scheduled_date = $2;",
      [testDoctorId, testDate]
    );

    // Insert Base Appointment: 14:00 - 16:00 (120 mins)
    await runtimePool.query(
      `INSERT INTO appointments (
        contact_id, practitioner_id, practitioner_name, therapy_type,
        mode, scheduled_date, start_time, end_time, start_at, end_at,
        status, payment_status, amount
      ) VALUES ($1, $2, 'Dr Test', 'Assessment', 'IN_CLINIC', $3, '14:00', '16:00',
        $4, $5, 'SCHEDULED', 'PENDING', 2500.00);`,
      [contactId, testDoctorId, testDate, `${testDate}T14:00:00+05:30`, `${testDate}T16:00:00+05:30`]
    );
    console.log("  ✓ Base 120-min appointment inserted: 14:00 - 16:00.");

    // Test 1: Overlapping appointment (15:00 - 17:00) MUST be rejected by exclusion constraint
    let overlapRejected = false;
    try {
      await runtimePool.query(
        `INSERT INTO appointments (
          contact_id, practitioner_id, practitioner_name, therapy_type,
          mode, scheduled_date, start_time, end_time, start_at, end_at,
          status, payment_status, amount
        ) VALUES ($1, $2, 'Dr Test', 'Assessment', 'IN_CLINIC', $3, '15:00', '17:00',
          $4, $5, 'SCHEDULED', 'PENDING', 2500.00);`,
        [contactId, testDoctorId, testDate, `${testDate}T15:00:00+05:30`, `${testDate}T17:00:00+05:30`]
      );
    } catch (err: any) {
      if (err.code === "23P01" && err.message.includes("excl_practitioner_no_overlap")) {
        overlapRejected = true;
        console.log(`  ✓ Overlapping appointment (15:00-17:00) rejected by GiST exclusion: ${err.message}`);
      } else {
        throw err;
      }
    }
    if (!overlapRejected) {
      throw new Error("OVERLAP INTEGRITY FAILURE: Overlapping appointment was allowed by PostgreSQL!");
    }

    // Test 2: Adjacent appointment (16:00 - 17:00) MUST succeed [half-open interval [start, end))
    await runtimePool.query(
      `INSERT INTO appointments (
        contact_id, practitioner_id, practitioner_name, therapy_type,
        mode, scheduled_date, start_time, end_time, start_at, end_at,
        status, payment_status, amount
      ) VALUES ($1, $2, 'Dr Test', 'Assessment', 'IN_CLINIC', $3, '16:00', '17:00',
        $4, $5, 'SCHEDULED', 'PENDING', 2500.00);`,
      [contactId, testDoctorId, testDate, `${testDate}T16:00:00+05:30`, `${testDate}T17:00:00+05:30`]
    );
    console.log("  ✓ Adjacent appointment (16:00 - 17:00) allowed by [start, end) half-open interval.");

    // Test 3: Cancel base appointment, slot unblocks
    await runtimePool.query(
      "UPDATE appointments SET status = 'CANCELLED' WHERE practitioner_id = $1 AND scheduled_date = $2 AND start_time = '14:00';",
      [testDoctorId, testDate]
    );
    await runtimePool.query(
      `INSERT INTO appointments (
        contact_id, practitioner_id, practitioner_name, therapy_type,
        mode, scheduled_date, start_time, end_time, start_at, end_at,
        status, payment_status, amount
      ) VALUES ($1, $2, 'Dr Test', 'Assessment', 'IN_CLINIC', $3, '14:00', '15:30',
        $4, $5, 'SCHEDULED', 'PENDING', 2500.00);`,
      [contactId, testDoctorId, testDate, `${testDate}T14:00:00+05:30`, `${testDate}T15:30:00+05:30`]
    );
    console.log("  ✓ Re-booking cancelled slot (14:00 - 15:30) succeeded (unblocking verified).\n");

    // Clean up test rows
    await ownerPool.query(
      "DELETE FROM appointments WHERE practitioner_id = $1 AND scheduled_date = $2;",
      [testDoctorId, testDate]
    );

    // 6. Runtime PgBouncer Transaction Pooling Verification
    console.log("[STEP 6/7] Testing Runtime Queries through PgBouncer (Transaction Pooling)...");
    const pgbouncerPool = new Pool({
      host: "127.0.0.1",
      port: PGBOUNCER_LOCAL_PORT,
      user: RUNTIME_USER,
      password: RUNTIME_PASSWORD,
      database: DB_NAME,
      max: 5,
      ssl: false,
    });

    try {
      const pgbRes = await pgbouncerPool.query("SELECT count(*) AS count FROM appointments;");
      console.log(`  ✓ PgBouncer transaction query successful (Appointments: ${pgbRes.rows[0].count}).`);

      const sessionRes = await pgbouncerPool.query(
        "SELECT current_database(), current_user, inet_server_port();"
      );
      console.log(
        `  ✓ PgBouncer session info: DB=${sessionRes.rows[0].current_database}, User=${sessionRes.rows[0].current_user}`
      );
      console.log("  ✓ Runtime Next.js -> PgBouncer -> PostgreSQL path verified.\n");
    } finally {
      await pgbouncerPool.end();
    }

    console.log("================================================================================");
    console.log("  ALL REAL POSTGRESQL 16 & PGBOUNCER VERIFICATIONS PASSED: 100% SUCCESS");
    console.log("================================================================================\n");
  } finally {
    await ownerPool.end();
    await runtimePool.end();
    pgTunnel.close();
    pgbouncerTunnel.close();
    sshConn.end();
  }
}

runRealPostgresVerification().catch((err) => {
  console.error("Real PostgreSQL verification failed:", err);
  process.exit(1);
});
