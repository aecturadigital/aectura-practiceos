import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================================================
// 1. AUTHENTICATION & ACCESS CONTROL
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_sessions_user_id").on(table.userId),
    index("idx_sessions_expires_at").on(table.expiresAt),
  ]
);

export const roles = pgTable("roles", {
  id: text("id").primaryKey(), // 'OWNER', 'CLINIC_ADMIN', 'PRACTITIONER', 'RECEPTIONIST', 'BILLING_ACCOUNTANT', 'HR_MANAGER', 'PATIENT', 'READ_ONLY_AUDITOR'
  name: text("name").notNull(),
  description: text("description"),
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uniq_user_role").on(table.userId, table.roleId),
  ]
);

export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(), // e.g. 'contacts.read', 'clinical_notes.read'
  name: text("name").notNull(),
  category: text("category").notNull(), // 'contacts', 'appointments', 'clinical_notes', 'treatment_plans', 'billing', 'documents', 'staff', 'payroll', 'exports', 'settings'
  description: text("description"),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uniq_role_permission").on(table.roleId, table.permissionId),
    index("idx_role_permissions_role").on(table.roleId),
  ]
);

export const userPermissionOverrides = pgTable(
  "user_permission_overrides",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    permissionId: text("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
    effect: text("effect").notNull(), // 'ALLOW' | 'DENY'
    reason: text("reason"),
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uniq_user_override").on(table.userId, table.permissionId),
    index("idx_user_overrides_user").on(table.userId),
  ]
);

// ============================================================================
// 2. PEOPLE & CRM (CANONICAL 360° CONTACT & PATIENT IDENTITY)
// ============================================================================

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone").notNull(),
    city: text("city").notNull().default("Pune"),
    gender: text("gender"),
    age: integer("age"),
    status: text("status").notNull().default("LEAD"), // 'LEAD', 'ACTIVE', 'COMPLETED', 'INACTIVE', 'ARCHIVED'
    activeDealStage: text("active_deal_stage").default("lead"), // 'lead', 'intake', 'scheduled', 'consulted', 'won', 'completed', 'lost'
    activeDealValue: numeric("active_deal_value", { precision: 10, scale: 2 }).default("0"),
    primaryConcern: text("primary_concern"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    notes: text("notes"),
    isRestrictedProfile: boolean("is_restricted_profile").notNull().default(false),
    isArchived: boolean("is_archived").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: uuid("archived_by").references(() => users.id, { onDelete: "set null" }),
    archiveReason: text("archive_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_contacts_phone").on(table.phone),
    index("idx_contacts_status").on(table.status),
    index("idx_contacts_stage").on(table.activeDealStage),
    index("idx_contacts_is_archived").on(table.isArchived),
  ]
);

export const patientAccounts = pgTable(
  "patient_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }).unique(),
    portalAccessEnabled: boolean("portal_access_enabled").notNull().default(true),
    lastPortalLoginAt: timestamp("last_portal_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_patient_accounts_user_id").on(table.userId),
    index("idx_patient_accounts_contact_id").on(table.contactId),
  ]
);

export const crmDeals = pgTable(
  "crm_deals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    stage: text("stage").notNull().default("lead"),
    value: numeric("value", { precision: 10, scale: 2 }).notNull().default("2500.00"),
    probability: integer("probability").notNull().default(60),
    therapy: text("therapy").notNull(),
    mode: text("mode").notNull().default("In-Clinic"),
    source: text("source").notNull().default("Website Booking"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_crm_deals_stage").on(table.stage),
    index("idx_crm_deals_contact_id").on(table.contactId),
  ]
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    type: text("type").notNull(), // 'NOTE', 'STAGE_CHANGE', 'CALL', 'EMAIL', 'WHATSAPP', 'APPOINTMENT_BOOKED', 'PAYMENT_RECEIVED'
    title: text("title").notNull(),
    description: text("description"),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_activities_contact_id").on(table.contactId),
    index("idx_activities_created_at").on(table.createdAt),
  ]
);

// ============================================================================
// 3. SCHEDULING & APPOINTMENTS
// ============================================================================

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    practitionerId: uuid("practitioner_id").references(() => users.id, { onDelete: "set null" }),
    practitionerName: text("practitioner_name").notNull().default("Col Umakant Saxena"),
    therapyType: text("therapy_type").notNull(),
    mode: text("mode").notNull().default("In-Clinic (Wanowrie, Pune)"),
    scheduledDate: date("scheduled_date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    status: text("status").notNull().default("SCHEDULED"), // 'SCHEDULED', 'CONFIRMED', 'ARRIVED', 'ATTENDED', 'DECLINED_IN_ADVANCE', 'NO_SHOW', 'CANCELLED'
    paymentStatus: text("payment_status").notNull().default("PENDING"), // 'PENDING', 'PAID_AT_CLINIC', 'PAID_ONLINE', 'WAIVED'
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("2500.00"),
    cancellationReason: text("cancellation_reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_appointments_date").on(table.scheduledDate),
    index("idx_appointments_contact_id").on(table.contactId),
    index("idx_appointments_status").on(table.status),
    uniqueIndex("uniq_practitioner_slot").on(table.practitionerId, table.scheduledDate, table.startTime),
  ]
);

export const practitionerAvailability = pgTable(
  "practitioner_availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    practitionerId: uuid("practitioner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0 = Sun, 1 = Mon ... 6 = Sat
    startTime: text("start_time").notNull().default("10:30"),
    endTime: text("end_time").notNull().default("19:30"),
    slotDurationMinutes: integer("slot_duration_minutes").notNull().default(60),
    bufferMinutes: integer("buffer_minutes").notNull().default(15),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_practitioner_day").on(table.practitionerId, table.dayOfWeek),
  ]
);

// ============================================================================
// 4. CLINICAL TREATMENT PLANS & ENTITLEMENTS
// ============================================================================

export const treatmentCourses = pgTable(
  "treatment_courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    prescribedBy: uuid("prescribed_by").references(() => users.id, { onDelete: "set null" }),
    status: text("status").notNull().default("ACTIVE"), // 'ACTIVE', 'ON_HOLD', 'FROZEN', 'COMPLETED', 'CANCELLED'
    startDate: date("start_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_treatment_courses_contact_id").on(table.contactId),
    index("idx_treatment_courses_status").on(table.status),
  ]
);

export const planCycles = pgTable(
  "plan_cycles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id").notNull().references(() => treatmentCourses.id, { onDelete: "cascade" }),
    cycleIndex: integer("cycle_index").notNull().default(1),
    title: text("title").notNull(),
    billingType: text("billing_type").notNull().default("FIXED_PACKAGE"), // 'FIXED_PACKAGE', 'MONTHLY', 'SESSION_PACKAGE', 'WEEKLY'
    price: numeric("price", { precision: 10, scale: 2 }).notNull().default("7500.00"),
    totalSessions: integer("total_sessions").notNull().default(3),
    consumedSessions: integer("consumed_sessions").notNull().default(0),
    validityDays: integer("validity_days").notNull().default(45),
    status: text("status").notNull().default("ACTIVE"), // 'ACTIVE', 'PAYMENT_DUE', 'ON_HOLD', 'FROZEN', 'COMPLETED', 'EXPIRED', 'CANCELLED'
    noShowPolicy: text("no_show_policy").notNull().default("REQUIRES_APPROVAL"), // 'DEDUCT_AUTOMATICALLY', 'FORGIVE_FIRST', 'REQUIRES_APPROVAL'
    startDate: date("start_date").notNull(),
    expiryDate: date("expiry_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_plan_cycles_course_id").on(table.courseId),
    index("idx_plan_cycles_status").on(table.status),
  ]
);

export const treatmentSessions = pgTable(
  "treatment_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cycleId: uuid("cycle_id").notNull().references(() => planCycles.id, { onDelete: "cascade" }),
    appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
    sessionNumber: integer("session_number").notNull(),
    status: text("status").notNull().default("PENDING"), // 'PENDING', 'COMPLETED', 'NO_SHOW_DEDUCTED', 'NO_SHOW_FORGIVEN', 'CANCELLED'
    isEntitlementDeducted: boolean("is_entitlement_deducted").notNull().default(false),
    deductedAt: timestamp("deducted_at", { withTimezone: true }),
    authorizedBy: uuid("authorized_by").references(() => users.id, { onDelete: "set null" }),
    clinicalNotes: text("clinical_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_treatment_sessions_cycle_id").on(table.cycleId),
    index("idx_treatment_sessions_appointment_id").on(table.appointmentId),
  ]
);

export const planAdjustments = pgTable(
  "plan_adjustments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cycleId: uuid("cycle_id").notNull().references(() => planCycles.id, { onDelete: "cascade" }),
    adjustmentType: text("adjustment_type").notNull(), // 'PRICE_OVERRIDE', 'SESSION_COUNT_CHANGE', 'EXTENSION', 'FREEZE', 'UNFREEZE', 'NO_SHOW_DECISION'
    oldValue: text("old_value"),
    newValue: text("new_value"),
    reason: text("reason").notNull(),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_plan_adjustments_cycle_id").on(table.cycleId),
  ]
);

// ============================================================================
// 5. CLINICAL EMR & TRACKERS
// ============================================================================

export const clinicalNotes = pgTable(
  "clinical_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
    practitionerId: uuid("practitioner_id").references(() => users.id, { onDelete: "set null" }),
    sessionNumber: integer("session_number").notNull().default(1),
    hypnoticDepth: text("hypnotic_depth").notNull().default("Medium"), // 'Light', 'Medium', 'Deep Somnambulism', 'Past Life Trance'
    primaryIssue: text("primary_issue").notNull(),
    rootCausesRevealed: text("root_causes_revealed"),
    suggestedHomework: text("suggested_homework"),
    isRestricted: boolean("is_restricted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_clinical_notes_contact_id").on(table.contactId),
  ]
);

export const patientTrackers = pgTable(
  "patient_trackers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    trackerType: text("tracker_type").notNull(), // 'PAIN_SCALE', 'SLEEP_QUALITY', 'MOBILITY', 'MOOD', 'EXERCISE_ADHERENCE'
    minValue: integer("min_value").notNull().default(0),
    maxValue: integer("max_value").notNull().default(10),
    unit: text("unit"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_patient_trackers_contact_id").on(table.contactId),
  ]
);

export const trackerEntries = pgTable(
  "tracker_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trackerId: uuid("tracker_id").notNull().references(() => patientTrackers.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    value: numeric("value", { precision: 5, scale: 2 }).notNull(),
    notes: text("notes"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_tracker_entries_tracker_id").on(table.trackerId),
    index("idx_tracker_entries_contact_id").on(table.contactId),
  ]
);

// ============================================================================
// 6. FINANCE & LEDGERS
// ============================================================================

export const ledgerTransactions = pgTable(
  "ledger_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    cycleId: uuid("cycle_id").references(() => planCycles.id, { onDelete: "set null" }),
    appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
    type: text("type").notNull(), // 'CHARGE', 'PAYMENT', 'REFUND', 'DISCOUNT', 'WAIVER', 'ADD_ON_SERVICE', 'ADJUSTMENT'
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    date: date("date").notNull(),
    method: text("method"), // 'UPI', 'CASH', 'CARD', 'BANK_TRANSFER', 'RAZORPAY'
    referenceNumber: text("reference_number"),
    memo: text("memo"),
    status: text("status").notNull().default("COMPLETED"), // 'PENDING', 'COMPLETED', 'VOIDED'
    recordedBy: uuid("recorded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ledger_contact_id").on(table.contactId),
    index("idx_ledger_date").on(table.date),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    invoiceNumber: text("invoice_number").notNull().unique(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull().default("0"),
    balanceDue: numeric("balance_due", { precision: 10, scale: 2 }).notNull(),
    status: text("status").notNull().default("ISSUED"), // 'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOIDED', 'OVERDUE'
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_invoices_contact_id").on(table.contactId),
    index("idx_invoices_status").on(table.status),
  ]
);

export const paymentReminders = pgTable(
  "payment_reminders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    amountDue: numeric("amount_due", { precision: 10, scale: 2 }).notNull(),
    draftMessage: text("draft_message").notNull(),
    channel: text("channel").notNull().default("WHATSAPP"), // 'WHATSAPP', 'SMS', 'EMAIL'
    status: text("status").notNull().default("DRAFTED"), // 'DRAFTED', 'APPROVED', 'DISPATCHED', 'PROMISED_AT_NEXT_VISIT', 'CANCELLED'
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_payment_reminders_contact_id").on(table.contactId),
    index("idx_payment_reminders_status").on(table.status),
  ]
);

// ============================================================================
// 7. DOCUMENTS & UPLOADS
// ============================================================================

export const documentRequests = pgTable(
  "document_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    documentType: text("document_type").notNull(), // 'CLINICAL_REPORT', 'INTAKE_CONSENT', 'LAB_RESULT', 'IDENTITY_PROOF'
    status: text("status").notNull().default("REQUESTED"), // 'REQUESTED', 'UPLOADED', 'REVIEWED', 'REJECTED'
    requestedBy: uuid("requested_by").references(() => users.id, { onDelete: "set null" }),
    dueDate: date("due_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_doc_requests_contact_id").on(table.contactId),
    index("idx_doc_requests_status").on(table.status),
  ]
);

export const patientDocuments = pgTable(
  "patient_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    requestId: uuid("request_id").references(() => documentRequests.id, { onDelete: "set null" }),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    r2Key: text("r2_key").notNull(),
    visibility: text("visibility").notNull().default("CLINICAL_RESTRICTED"), // 'PUBLIC', 'ADMINISTRATIVE', 'PATIENT_VISIBLE', 'CLINICAL_RESTRICTED'
    uploadedBy: text("uploaded_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_patient_documents_contact_id").on(table.contactId),
  ]
);

// ============================================================================
// 8. STAFF OPERATIONS (STAFFOPS)
// ============================================================================

export const staffProfiles = pgTable(
  "staff_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    role: text("role").notNull().default("RECEPTIONIST"), // 'OWNER', 'CLINIC_ADMIN', 'PRACTITIONER', 'RECEPTIONIST', 'BILLING_ACCOUNTANT'
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    shift: text("shift").notNull().default("10:00 AM - 07:00 PM"),
    baseSalary: numeric("base_salary", { precision: 10, scale: 2 }).notNull().default("22000.00"),
    status: text("status").notNull().default("ACTIVE"),
    joiningDate: date("joining_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_staff_profiles_role").on(table.role),
  ]
);

export const staffAttendance = pgTable(
  "staff_attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    staffId: uuid("staff_id").notNull().references(() => staffProfiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: text("status").notNull().default("PRESENT"), // 'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'
    checkIn: text("check_in"),
    checkOut: text("check_out"),
    hoursWorked: numeric("hours_worked", { precision: 4, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_staff_attendance_date").on(table.date),
    index("idx_staff_attendance_staff_id").on(table.staffId),
  ]
);

export const staffLeaves = pgTable(
  "staff_leaves",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    staffId: uuid("staff_id").notNull().references(() => staffProfiles.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("PAID"), // 'PAID', 'UNPAID', 'SICK', 'EMERGENCY'
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    reason: text("reason").notNull(),
    status: text("status").notNull().default("PENDING"), // 'PENDING', 'APPROVED', 'REJECTED'
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_staff_leaves_staff_id").on(table.staffId),
    index("idx_staff_leaves_status").on(table.status),
  ]
);

export const payrollEntries = pgTable(
  "payroll_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    staffId: uuid("staff_id").notNull().references(() => staffProfiles.id, { onDelete: "cascade" }),
    month: text("month").notNull(), // e.g. "September 2026"
    baseSalary: numeric("base_salary", { precision: 10, scale: 2 }).notNull(),
    advance: numeric("advance", { precision: 10, scale: 2 }).notNull().default("0"),
    bonus: numeric("bonus", { precision: 10, scale: 2 }).notNull().default("0"),
    deduction: numeric("deduction", { precision: 10, scale: 2 }).notNull().default("0"),
    netPayable: numeric("net_payable", { precision: 10, scale: 2 }).notNull(), // netPayable = baseSalary - advance + bonus - deduction
    status: text("status").notNull().default("DUE"), // 'DUE', 'PAID'
    paidAt: timestamp("paid_at", { withTimezone: true }),
    memo: text("memo"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_payroll_entries_month").on(table.month),
    index("idx_payroll_entries_staff_id").on(table.staffId),
    index("idx_payroll_entries_status").on(table.status),
  ]
);

// ============================================================================
// 9. COMMUNICATIONS & MESSAGING
// ============================================================================

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "restrict" }),
    channel: text("channel").notNull().default("WHATSAPP"), // 'WHATSAPP', 'EMAIL', 'SMS'
    lastMessageSnippet: text("last_message_snippet"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
    unreadCount: integer("unread_count").notNull().default(0),
    isEscalatedToHuman: boolean("is_escalated_to_human").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_conversations_contact_id").on(table.contactId),
    index("idx_conversations_last_message_at").on(table.lastMessageAt),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    direction: text("direction").notNull(), // 'INBOUND', 'OUTBOUND'
    senderType: text("sender_type").notNull(), // 'PATIENT', 'PRACTITIONER', 'RECEPTIONIST', 'AI_AURA', 'SYSTEM'
    content: text("content").notNull(),
    status: text("status").notNull().default("SENT"), // 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED'
    externalId: text("external_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_messages_conversation_id").on(table.conversationId),
    index("idx_messages_created_at").on(table.createdAt),
  ]
);

// ============================================================================
// 10. SYSTEM INFRASTRUCTURE & TRANSACTIONAL OUTBOX
// ============================================================================

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    action: text("action").notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'VIEW_RESTRICTED', 'DEDUCT_SESSION', 'APPROVE_LEAVE', 'DISBURSE_PAYROLL'
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    actorId: text("actor_id").notNull(),
    actorRole: text("actor_role").notNull(),
    ipAddress: text("ip_address"),
    details: jsonb("details"),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_logs_timestamp").on(table.timestamp),
    index("idx_audit_logs_entity").on(table.entityType, table.entityId),
  ]
);

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    eventType: text("event_type").notNull(), // e.g. 'appointment.booked', 'payment.received', 'session.attended'
    payload: jsonb("payload").notNull(),
    status: text("status").notNull().default("PENDING"), // 'PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'DEAD_LETTER'
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(5),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_outbox_status_scheduled").on(table.status, table.scheduledAt),
  ]
);

// ============================================================================
// TYPE EXPORTS (CANONICAL DOMAIN ENTITIES)
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type UserPermissionOverride = typeof userPermissionOverrides.$inferSelect;
export type NewUserPermissionOverride = typeof userPermissionOverrides.$inferInsert;
export type PatientAccount = typeof patientAccounts.$inferSelect;
export type NewPatientAccount = typeof patientAccounts.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type CrmDeal = typeof crmDeals.$inferSelect;
export type NewCrmDeal = typeof crmDeals.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type PractitionerAvailability = typeof practitionerAvailability.$inferSelect;

export type TreatmentCourse = typeof treatmentCourses.$inferSelect;
export type NewTreatmentCourse = typeof treatmentCourses.$inferInsert;
export type PlanCycle = typeof planCycles.$inferSelect;
export type NewPlanCycle = typeof planCycles.$inferInsert;
export type TreatmentSession = typeof treatmentSessions.$inferSelect;
export type NewTreatmentSession = typeof treatmentSessions.$inferInsert;
export type PlanAdjustment = typeof planAdjustments.$inferSelect;
export type NewPlanAdjustment = typeof planAdjustments.$inferInsert;

export type ClinicalNote = typeof clinicalNotes.$inferSelect;
export type NewClinicalNote = typeof clinicalNotes.$inferInsert;
export type PatientTracker = typeof patientTrackers.$inferSelect;
export type TrackerEntry = typeof trackerEntries.$inferSelect;

export type LedgerTransaction = typeof ledgerTransactions.$inferSelect;
export type NewLedgerTransaction = typeof ledgerTransactions.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type PaymentReminder = typeof paymentReminders.$inferSelect;

export type DocumentRequest = typeof documentRequests.$inferSelect;
export type PatientDocument = typeof patientDocuments.$inferSelect;

export type StaffProfile = typeof staffProfiles.$inferSelect;
export type NewStaffProfile = typeof staffProfiles.$inferInsert;
export type StaffAttendance = typeof staffAttendance.$inferSelect;
export type StaffLeave = typeof staffLeaves.$inferSelect;
export type PayrollEntry = typeof payrollEntries.$inferSelect;

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type AuditLog = typeof auditLogs.$inferSelect;
export type OutboxEvent = typeof outboxEvents.$inferSelect;
export type NewOutboxEvent = typeof outboxEvents.$inferInsert;
