CREATE TABLE IF NOT EXISTS "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"practitioner_id" uuid,
	"practitioner_name" text DEFAULT 'Col Umakant Saxena' NOT NULL,
	"therapy_type" text NOT NULL,
	"mode" text DEFAULT 'In-Clinic (Wanowrie, Pune)' NOT NULL,
	"scheduled_date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"status" text DEFAULT 'SCHEDULED' NOT NULL,
	"payment_status" text DEFAULT 'PENDING' NOT NULL,
	"amount" numeric(10, 2) DEFAULT '2500.00' NOT NULL,
	"cancellation_reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"actor_id" text NOT NULL,
	"actor_role" text NOT NULL,
	"ip_address" text,
	"details" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinical_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"appointment_id" uuid,
	"practitioner_id" uuid,
	"session_number" integer DEFAULT 1 NOT NULL,
	"hypnotic_depth" text DEFAULT 'Medium' NOT NULL,
	"primary_issue" text NOT NULL,
	"root_causes_revealed" text,
	"suggested_homework" text,
	"is_restricted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text NOT NULL,
	"city" text DEFAULT 'Pune' NOT NULL,
	"gender" text,
	"age" integer,
	"status" text DEFAULT 'LEAD' NOT NULL,
	"active_deal_stage" text DEFAULT 'lead',
	"active_deal_value" numeric(10, 2) DEFAULT '0',
	"primary_concern" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"is_restricted_profile" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"channel" text DEFAULT 'WHATSAPP' NOT NULL,
	"last_message_snippet" text,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"is_escalated_to_human" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"title" text NOT NULL,
	"stage" text DEFAULT 'lead' NOT NULL,
	"value" numeric(10, 2) DEFAULT '2500.00' NOT NULL,
	"probability" integer DEFAULT 60 NOT NULL,
	"therapy" text NOT NULL,
	"mode" text DEFAULT 'In-Clinic' NOT NULL,
	"source" text DEFAULT 'Website Booking' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"title" text NOT NULL,
	"document_type" text NOT NULL,
	"status" text DEFAULT 'REQUESTED' NOT NULL,
	"requested_by" uuid,
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT '0' NOT NULL,
	"balance_due" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'ISSUED' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ledger_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"cycle_id" uuid,
	"appointment_id" uuid,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" date NOT NULL,
	"method" text,
	"reference_number" text,
	"memo" text,
	"status" text DEFAULT 'COMPLETED' NOT NULL,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"sender_type" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'SENT' NOT NULL,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idempotency_key" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 5 NOT NULL,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outbox_events_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patient_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"request_id" uuid,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"r2_key" text NOT NULL,
	"visibility" text DEFAULT 'CLINICAL_RESTRICTED' NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patient_trackers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"tracker_type" text NOT NULL,
	"min_value" integer DEFAULT 0 NOT NULL,
	"max_value" integer DEFAULT 10 NOT NULL,
	"unit" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"invoice_id" uuid,
	"amount_due" numeric(10, 2) NOT NULL,
	"draft_message" text NOT NULL,
	"channel" text DEFAULT 'WHATSAPP' NOT NULL,
	"status" text DEFAULT 'DRAFTED' NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"month" text NOT NULL,
	"base_salary" numeric(10, 2) NOT NULL,
	"advance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"bonus" numeric(10, 2) DEFAULT '0' NOT NULL,
	"deduction" numeric(10, 2) DEFAULT '0' NOT NULL,
	"net_payable" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'DUE' NOT NULL,
	"paid_at" timestamp with time zone,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"adjustment_type" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"reason" text NOT NULL,
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"cycle_index" integer DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"billing_type" text DEFAULT 'FIXED_PACKAGE' NOT NULL,
	"price" numeric(10, 2) DEFAULT '7500.00' NOT NULL,
	"total_sessions" integer DEFAULT 3 NOT NULL,
	"consumed_sessions" integer DEFAULT 0 NOT NULL,
	"validity_days" integer DEFAULT 45 NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"no_show_policy" text DEFAULT 'REQUIRES_APPROVAL' NOT NULL,
	"start_date" date NOT NULL,
	"expiry_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "practitioner_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practitioner_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text DEFAULT '10:30' NOT NULL,
	"end_time" text DEFAULT '19:30' NOT NULL,
	"slot_duration_minutes" integer DEFAULT 60 NOT NULL,
	"buffer_minutes" integer DEFAULT 15 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" text DEFAULT 'PRESENT' NOT NULL,
	"check_in" text,
	"check_out" text,
	"hours_worked" numeric(4, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_leaves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"type" text DEFAULT 'PAID' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"role" text DEFAULT 'RECEPTIONIST' NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"shift" text DEFAULT '10:00 AM - 07:00 PM' NOT NULL,
	"base_salary" numeric(10, 2) DEFAULT '22000.00' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"joining_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracker_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracker_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"value" numeric(5, 2) NOT NULL,
	"notes" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "treatment_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"title" text NOT NULL,
	"prescribed_by" uuid,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"start_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "treatment_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"appointment_id" uuid,
	"session_number" integer NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"is_entitlement_deducted" boolean DEFAULT false NOT NULL,
	"deducted_at" timestamp with time zone,
	"authorized_by" uuid,
	"clinical_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_cycle_id_plan_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."plan_cycles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ledger_transactions" ADD CONSTRAINT "ledger_transactions_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_request_id_document_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."document_requests"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_trackers" ADD CONSTRAINT "patient_trackers_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_reminders" ADD CONSTRAINT "payment_reminders_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_reminders" ADD CONSTRAINT "payment_reminders_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_adjustments" ADD CONSTRAINT "plan_adjustments_cycle_id_plan_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."plan_cycles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_adjustments" ADD CONSTRAINT "plan_adjustments_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_cycles" ADD CONSTRAINT "plan_cycles_course_id_treatment_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."treatment_courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "practitioner_availability" ADD CONSTRAINT "practitioner_availability_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_attendance" ADD CONSTRAINT "staff_attendance_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_leaves" ADD CONSTRAINT "staff_leaves_staff_id_staff_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_leaves" ADD CONSTRAINT "staff_leaves_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_tracker_id_patient_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."patient_trackers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "treatment_courses" ADD CONSTRAINT "treatment_courses_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "treatment_courses" ADD CONSTRAINT "treatment_courses_prescribed_by_users_id_fk" FOREIGN KEY ("prescribed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "treatment_sessions" ADD CONSTRAINT "treatment_sessions_cycle_id_plan_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."plan_cycles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "treatment_sessions" ADD CONSTRAINT "treatment_sessions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "treatment_sessions" ADD CONSTRAINT "treatment_sessions_authorized_by_users_id_fk" FOREIGN KEY ("authorized_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activities_contact_id" ON "activities" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activities_created_at" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_date" ON "appointments" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_contact_id" ON "appointments" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_status" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clinical_notes_contact_id" ON "clinical_notes" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contacts_phone" ON "contacts" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contacts_status" ON "contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contacts_stage" ON "contacts" USING btree ("active_deal_stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conversations_contact_id" ON "conversations" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conversations_last_message_at" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_crm_deals_stage" ON "crm_deals" USING btree ("stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_crm_deals_contact_id" ON "crm_deals" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_doc_requests_contact_id" ON "document_requests" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_doc_requests_status" ON "document_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_contact_id" ON "invoices" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ledger_contact_id" ON "ledger_transactions" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ledger_date" ON "ledger_transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_outbox_status_scheduled" ON "outbox_events" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_patient_documents_contact_id" ON "patient_documents" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_patient_trackers_contact_id" ON "patient_trackers" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_reminders_contact_id" ON "payment_reminders" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_reminders_status" ON "payment_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_entries_month" ON "payroll_entries" USING btree ("month");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_entries_staff_id" ON "payroll_entries" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_entries_status" ON "payroll_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_plan_adjustments_cycle_id" ON "plan_adjustments" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_plan_cycles_course_id" ON "plan_cycles" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_plan_cycles_status" ON "plan_cycles" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_practitioner_day" ON "practitioner_availability" USING btree ("practitioner_id","day_of_week");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_staff_attendance_date" ON "staff_attendance" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_staff_attendance_staff_id" ON "staff_attendance" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_staff_leaves_staff_id" ON "staff_leaves" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_staff_leaves_status" ON "staff_leaves" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_staff_profiles_role" ON "staff_profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tracker_entries_tracker_id" ON "tracker_entries" USING btree ("tracker_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tracker_entries_contact_id" ON "tracker_entries" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_treatment_courses_contact_id" ON "treatment_courses" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_treatment_courses_status" ON "treatment_courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_treatment_sessions_cycle_id" ON "treatment_sessions" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_treatment_sessions_appointment_id" ON "treatment_sessions" USING btree ("appointment_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_user_role" ON "user_roles" USING btree ("user_id","role_id");