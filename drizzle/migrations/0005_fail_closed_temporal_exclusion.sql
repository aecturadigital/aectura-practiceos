DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS btree_gist;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "blocked_until_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD COLUMN IF NOT EXISTS "practitioner_key" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "practitioner_key" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_staff_practitioner_key" ON "staff_profiles" ("practitioner_key");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_users_practitioner_key" ON "users" ("practitioner_key");
--> statement-breakpoint
UPDATE "appointments"
SET "blocked_until_at" = "end_at" + interval '15 minutes'
WHERE "blocked_until_at" IS NULL AND "end_at" IS NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'btree_gist') THEN
    ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "excl_practitioner_no_overlap";
    ALTER TABLE "appointments"
    ADD CONSTRAINT "excl_practitioner_no_overlap"
    EXCLUDE USING gist (
      "practitioner_id" WITH =,
      tstzrange("start_at", "blocked_until_at", '[)') WITH &&
    )
    WHERE ("status" NOT IN ('CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'DECLINED_IN_ADVANCE'));
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_appointments_temporal_invariants') THEN
    ALTER TABLE "appointments"
    ADD CONSTRAINT "chk_appointments_temporal_invariants"
    CHECK (
      "status" IN ('CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'DECLINED_IN_ADVANCE')
      OR (
        "start_at" IS NOT NULL
        AND "end_at" IS NOT NULL
        AND "blocked_until_at" IS NOT NULL
        AND "practitioner_id" IS NOT NULL
        AND "end_at" > "start_at"
        AND "blocked_until_at" >= "end_at"
      )
    );
  END IF;
END $$;
