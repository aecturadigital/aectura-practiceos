DROP INDEX IF EXISTS "uniq_practitioner_slot";--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "practitioner_name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "mode" SET DEFAULT 'IN_CLINIC';--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "amount" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "city" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "end_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_practitioner_range" ON "appointments" USING btree ("practitioner_id","start_at","end_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_range" ON "appointments" USING btree ("start_at","end_at");