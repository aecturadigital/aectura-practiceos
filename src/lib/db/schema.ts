import { pgTable, uuid, text, integer, timestamp, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const tenantStatusEnum = pgEnum("tenant_status", ["preview", "active", "suspended"]);
export const practiceVerticalEnum = pgEnum("practice_vertical", ["psychology", "physiotherapy"]);
export const planEnum = pgEnum("plan_tier", ["starter", "pro", "enterprise"]);
export const membershipRoleEnum = pgEnum("membership_role", [
  "tenant_owner",
  "tenant_admin",
  "practitioner",
  "receptionist",
  "patient"
]);
export const contactStageEnum = pgEnum("contact_stage", ["lead", "client", "patient"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "completed",
  "canceled"
]);

// 1. Tenants Table
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  vertical: text("vertical").notNull().default("psychology"), // psychology | physiotherapy
  status: text("status").notNull().default("preview"), // preview | active | suspended
  plan: text("plan").notNull().default("starter"), // starter | pro | enterprise
  template: text("template").notNull().default("modern_minimal"),
  
  // Custom Branding
  branding: jsonb("branding").$type<{
    primaryColor: string;
    accentColor: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
  }>().notNull().default({
    primaryColor: "#0D9488",
    accentColor: "#111315",
    tagline: "Specialized Evidence-Based Healthcare Practice",
    address: "100 Medical Center Way, Suite 400",
    phone: "+1 (555) 234-5678",
    email: "contact@clinic.practiceos.com",
  }),

  // Feature Entitlements computed from Plan + Custom Overrides
  entitlements: jsonb("entitlements").$type<{
    maxPractitioners: number;
    maxContacts: number;
    customBranding: boolean;
    analytics: boolean;
    advancedCalendar: boolean;
  }>().notNull().default({
    maxPractitioners: 1,
    maxContacts: 100,
    customBranding: false,
    analytics: false,
    advancedCalendar: false,
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Tenant Memberships Table (RBAC)
export const tenantMemberships = pgTable("tenant_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("practitioner"), // tenant_owner, tenant_admin, practitioner, receptionist, patient
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Practitioners Table
export const practitioners = pgTable("practitioners", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  title: text("title").notNull(), // e.g. "Clinical Psychologist" or "Senior Physiotherapist"
  bio: text("bio").notNull().default(""),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Services Table
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  durationMinutes: integer("duration_minutes").notNull().default(50),
  price: integer("price").notNull().default(12000), // in cents ($120.00)
  practitionerId: uuid("practitioner_id").references(() => practitioners.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. Contacts Table (360 Unified Contact Card)
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  stage: text("stage").notNull().default("lead"), // lead | client | patient
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. Appointments Table
export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  practitionerId: uuid("practitioner_id").notNull().references(() => practitioners.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled | confirmed | completed | canceled
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Type Exports
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type TenantMembership = typeof tenantMemberships.$inferSelect;
export type Practitioner = typeof practitioners.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
