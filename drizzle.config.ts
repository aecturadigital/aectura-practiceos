import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://user_soulmates:configured@localhost:5432/clinic_soulmates",
  },
  verbose: true,
  strict: true,
});
