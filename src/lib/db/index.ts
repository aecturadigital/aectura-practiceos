import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let dbInstance: any = null;
let rawClient: any = null;
let migrationsRan = false;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;
  const directDatabaseUrl = process.env.DIRECT_DATABASE_URL || databaseUrl;
  const isSslDisabled = 
    databaseUrl?.includes("sslmode=disable") || 
    process.env.DATABASE_SSL === "false" ||
    process.env.PGSSLMODE === "disable";

  if (databaseUrl && !databaseUrl.includes("pglite")) {
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: isSslDisabled ? false : (process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false),
    });
    rawClient = pool;
    dbInstance = drizzlePg(pool, { schema });
  } else {
    // In-process PostgreSQL via PGLite (persisted to ./data/postgres)
    const dataDir = path.join(process.cwd(), "data", "postgres");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const pglite = new PGlite(dataDir);
    rawClient = pglite;
    dbInstance = drizzlePglite(pglite, { schema });
  }

  if (!migrationsRan) {
    if (process.env.SKIP_AUTO_MIGRATIONS === "true") {
      migrationsRan = true;
    } else {
      const migrationsFolder = path.join(process.cwd(), "drizzle", "migrations");
      if (fs.existsSync(migrationsFolder)) {
        try {
          if (databaseUrl && !databaseUrl.includes("pglite")) {
            const migrationPool = directDatabaseUrl !== databaseUrl
              ? new Pool({ 
                  connectionString: directDatabaseUrl, 
                  ssl: isSslDisabled ? false : (process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false) 
                })
              : rawClient;
            const migrationDb = directDatabaseUrl !== databaseUrl ? drizzlePg(migrationPool, { schema }) : dbInstance;
            await migratePg(migrationDb, { migrationsFolder });
            if (directDatabaseUrl !== databaseUrl) {
              await migrationPool.end();
            }
          } else {
            await migratePglite(dbInstance, { migrationsFolder });
          }
        } catch (err: any) {
          // Safe continuation if tables or schema already present
          if (!err?.message?.includes("already exists")) {
            console.warn("Migration notice:", err?.message || err);
          }
        }
      }
      migrationsRan = true;
    }
  }

  return dbInstance;
}

export { schema };
