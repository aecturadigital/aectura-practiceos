DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS btree_gist;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  UPDATE "appointments"
  SET 
    "start_at" = ("scheduled_date" || ' ' || "start_time" || ':00 +05:30')::timestamptz,
    "end_at" = ("scheduled_date" || ' ' || "end_time" || ':00 +05:30')::timestamptz
  WHERE "start_at" IS NULL OR "end_at" IS NULL;

  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'btree_gist') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'excl_practitioner_no_overlap'
    ) THEN
      ALTER TABLE "appointments"
      ADD CONSTRAINT "excl_practitioner_no_overlap"
      EXCLUDE USING gist (
        "practitioner_id" WITH =,
        tstzrange("start_at", "end_at", '[)') WITH &&
      )
      WHERE ("status" NOT IN ('CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'DECLINED_IN_ADVANCE'));
    END IF;
  END IF;
END $$;
