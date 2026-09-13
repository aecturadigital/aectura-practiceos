---
name: crm-contact-system
description: >-
  Governs the 360-degree Patient and Client Card architecture. Enforces a single unified contact
  record per patient/lead across appointments, communications, medical notes, intake forms,
  payments, and timeline events. Activate whenever working on contacts, patient profiles,
  intake workflows, timeline records, or CRM queries.
---

# 360° Patient & Client CRM Architecture

In Aectura PracticeOS, every clinical, administrative, and financial interaction is anchored to a **single unified Contact entity**.

## The Single Contact Law

> **NEVER CREATE SEPARATE, DISCONNECTED CUSTOMER DATABASES.**
> Do not create an "intake submissions table" with orphaned email addresses, or a "booking leads table" detached from patient records. Every person interacting with a clinic is a `contacts` row progressing through lifecycle stages.

---

## 1. Contact Lifecycle Stages

```
                +-------------------+
                |       LEAD        |  Inquired via web form, AI receptionist,
                +---------+---------+  or phone call. No appointment yet.
                          |
                          v
                +-------------------+
                |      CLIENT       |  Booked initial consultation or active
                +---------+---------+  in a non-medical/coaching vertical.
                          |
                          v
                +-------------------+
                |      PATIENT      |  Intake completed, clinical history taken,
                +---------+---------+  actively receiving treatments/therapy.
                          |
                          v
                +-------------------+
                |     DISCHARGED    |  Care plan concluded or inactive.
                +-------------------+
```

---

## 2. The 360° Card Relationship Graph

A single contact record (`contacts.id`) links to:
- **Appointments (`appointments`)**: Complete history of past, upcoming, canceled, and no-show sessions.
- **Messages (`conversations`, `messages`)**: SMS, WhatsApp, and email logs with staff or the AI Receptionist.
- **Clinical Notes (`clinical_notes`)**: Encrypted practitioner session summaries, SOAP notes, treatment records.
- **Forms & Documents (`intake_submissions`)**: Signed consent agreements, medical questionnaires, uploaded insurance cards.
- **Invoices & Payments (`invoices`, `payments`)**: Stripe charges, outstanding balances, insurance co-pays.
- **Tasks (`crm_tasks`)**: Staff follow-ups ("Call patient regarding lab results", "Send review link").
- **Timeline Events (`timeline_events`)**: Chronological audit trail of all patient touchpoints.

---

## 3. Schema Structure

```typescript
// schema/contacts.ts
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  
  // Demographics
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  emergencyContact: jsonb("emergency_contact").$type<{ name: string; phone: string; relation: string }>(),

  // CRM State
  stage: text("stage").notNull().default("lead"), // lead | client | patient | discharged
  tags: text("tags").array().default([]),
  assignedPractitionerId: uuid("assigned_practitioner_id").references(() => users.id),
  
  // Vertical Data Overlay
  verticalData: jsonb("vertical_data").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// schema/timeline_events.ts
export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // appointment.booked, form.submitted, message.sent, note.created
  actorId: uuid("actor_id"), // user_id or "system" or "ai_receptionist"
  payload: jsonb("payload").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

---

## 4. Contact De-duplication Rule
When a new appointment or inquiry arrives:
1. Search `contacts` by `tenant_id` AND (`phone` OR `email`).
2. If match exists: attach appointment/message to existing `contact_id`.
3. If no match: insert new contact, record `timeline_event` with type `"contact.created"`.
