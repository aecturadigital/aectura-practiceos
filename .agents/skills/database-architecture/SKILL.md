---
name: database-architecture
description: >-
  Governs PostgreSQL schema design, Drizzle ORM models, migration workflows, indexing strategies,
  transaction boundaries, connection pooling with PgBouncer, and relational integrity.
  Activate whenever modifying database schemas, writing Drizzle queries, running migrations,
  or designing event tables.
---

# Database Architecture & Relational Standards

Aectura PracticeOS relies on PostgreSQL as its bedrock. This skill defines how schemas are designed, evolved, indexed, and queried.

## 1. Core Principles

1. **Relational Over Arbitrary JSON**:
   - Entities with well-defined lifecycles (Tenants, Contacts, Appointments, Practitioners, Invoices) **MUST** be modeled as first-class relational tables.
   - Do **NOT** turn PostgreSQL into a document store. JSONB is reserved strictly for flexible vertical configuration overlays and dynamic intake form field answers.

2. **Zero Binary Blobs in Database**:
   - Files, attachments, medical images, PDFs, audio recordings, and intake signatures **NEVER** go into `bytea` columns.
   - Store files in Cloudflare R2; save only object keys (`tenants/{tenant_id}/docs/{uuid}.pdf`), file size, MIME type, and checksums in PostgreSQL.

3. **No Duplicated Source-of-Truth Fields**:
   - Avoid denormalizing mutable state across tables unless computing pre-aggregated analytics tables.
   - The status of an appointment belongs on `appointments.status`, not copied across multiple association records.

4. **Connection Pooling via PgBouncer**:
   - Every database connection string in Next.js Serverless or Docker containers must point to a PgBouncer connection pooler in transaction mode (`port 6432` or pooled URI).

---

## 2. Core Drizzle Schema Conventions

### Standard Columns on Tenant-Owned Tables
Every tenant-owned table MUST declare:
- `id`: `uuid().defaultRandom().primaryKey()`
- `tenant_id`: `uuid().notNull().references(() => tenants.id, { onDelete: 'cascade' })`
- `created_at`: `timestamp({ withTimezone: true }).defaultNow().notNull()`
- `updated_at`: `timestamp({ withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull()`

### Example Table Definitions
```typescript
// schema/tenants.ts
import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const tenantStatusEnum = pgEnum("tenant_status", ["preview", "active", "suspended", "archived"]);
export const verticalEnum = pgEnum("practice_vertical", ["psychology", "physiotherapy", "dental", "general"]);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  vertical: verticalEnum("vertical").notNull().default("psychology"),
  status: tenantStatusEnum("status").notNull().default("preview"),
  plan: text("plan").notNull().default("starter"),
  config: jsonb("config").$type<TenantConfig>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// schema/contacts.ts
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  stage: text("stage").notNull().default("lead"), // lead, client, patient
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("contacts_tenant_idx").on(table.tenantId),
  tenantEmailIdx: index("contacts_tenant_email_idx").on(table.tenantId, table.email),
  tenantPhoneIdx: index("contacts_tenant_phone_idx").on(table.tenantId, table.phone),
}));
```

---

## 3. Migration Workflow

1. Modify Drizzle schema definitions in `src/lib/db/schema/`.
2. Generate migration SQL with `drizzle-kit generate`.
3. Inspect generated SQL in `drizzle/` directory:
   - Ensure foreign key constraints and `onDelete` actions are explicit.
   - Verify composite indexes exist on `(tenant_id, ...)` columns.
4. Run migrations using migration script: `drizzle-kit migrate`.
5. **Never deploy untested destructive migrations directly to production.** Always test in local/staging first.

---

## 4. Transaction Boundaries

When executing multi-step business actions (e.g. creating an appointment, locking practitioner availability, and recording an audit event), always wrap operations inside an atomic transaction:

```typescript
await db.transaction(async (tx) => {
  // 1. Lock practitioner slot
  const slotAvailable = await verifySlotAvailability(tx, tenantId, practitionerId, startTime, endTime);
  if (!slotAvailable) throw new Error("Slot unavailable");

  // 2. Insert appointment
  const [appointment] = await tx.insert(appointments).values({...}).returning();

  // 3. Insert audit/timeline event
  await tx.insert(timelineEvents).values({
    tenantId,
    contactId: appointment.contactId,
    type: "appointment.booked",
    payload: { appointmentId: appointment.id }
  });
});
```
