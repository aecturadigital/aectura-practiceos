# AECTURA PracticeOS - Master Product & Architecture Specification

## 1. Executive Summary & Vision

**AECTURA** is an AI business infrastructure company. Its flagship product, **PracticeOS**, is a modern, modular, multi-tenant Operating System designed specifically for private healthcare and wellness practices (Psychology, Physiotherapy, Dental, Specialist Clinics).

Unlike legacy EHR/EMR platforms that are clunky, siloed, and dated, or generic booking widgets that lack clinical depth, PracticeOS unifies:
1. High-converting public clinic presence & booking portal.
2. 360° unified Patient/Client CRM & intake lifecycle.
3. High-precision practitioner scheduling & multi-room calendar engine.
4. Vertical Configuration Packs tailored to medical disciplines.
5. Event-driven webhook orchestration via n8n.
6. Guardrailed AI Receptionist for 24/7 client triage and inquiry handling.

---

## 2. Core Architectural Pillars

### 2.1 Single Modular Multi-Tenant Application
- PracticeOS is a **single multi-tenant codebase**. Clinics are instances of configuration and relational data within PostgreSQL.
- **NEVER** fork the codebase, duplicate repositories, or provision separate server instances per clinic.
- Onboarding a new clinic is an atomic database transaction + storage directory allocation:
  $$\text{Sign Up} \longrightarrow \text{Select Vertical Pack} \longrightarrow \text{Select Plan} \longrightarrow \text{Instant Preview Environment}$$

### 2.2 PostgreSQL as the Single Source of Truth
- Relational integrity is enforced using PostgreSQL constraints, foreign keys, and indexes.
- Drizzle ORM provides type-safe queries and explicit migrations.
- No binary blobs or massive documents inside the database; all attachments, clinical PDFs, and intake uploads stream to **Cloudflare R2** with short-lived pre-signed URLs.

### 2.3 Automation Boundary (The n8n Separation)
- The core Next.js/PostgreSQL application owns **state and business logic**.
- **n8n** is an external worker that receives cryptographically signed tenant event webhooks (e.g., `lead.created`, `appointment.created`, `appointment.completed`, `conversation.needs_human`).
- n8n performs external automations (WhatsApp messaging, SMS reminders via Twilio, automated review requests).
- n8n **never** writes unvalidated records directly into the core PostgreSQL database.

---

## 3. High-Level Domain Model

```
+-------------------------------------------------------------+
|                          TENANT                             |
|  id (UUID), slug, name, vertical (psychology|physio|dental) |
|  status (preview|active|suspended), config, branding        |
+------------------------------+------------------------------+
                               | 1:N
        +----------------------+----------------------+
        |                      |                      |
+-------v-------+      +-------v-------+      +-------v-------+
|    DOMAINS    |      |  MEMBERSHIPS  |      |   SERVICES    |
| sub.aectura   |      | staff, roles, |      | duration, fee,|
| custom.clinic |      | permissions   |      | vertical pack |
+---------------+      +-------+-------+      +-------+-------+
                               |                      |
                               +-----------+----------+
                                           |
                                   +-------v-------+
                                   |  APPOINTMENTS |
                                   | time, status, |
                                   | practitioner, |
                                   | buffer, room  |
                                   +-------+-------+
                                           |
+------------------------------------------+------------------+
|                                                             |
|                       CONTACT CARD (360)                    |
|  id, tenant_id, name, email, phone, stage (lead|client|pt)  |
|  medical_history, intake_forms, clinical_notes, invoices    |
+-------------------------------------------------------------+
```

---

## 4. Vertical Pack Engine Architecture

A vertical pack is a declarative configuration schema that transforms PracticeOS to feel purpose-built for a specific healthcare discipline without altering the core database engine.

| Attribute | Psychology Pack | Physiotherapy Pack | Dental Pack |
| :--- | :--- | :--- | :--- |
| **Primary Contact** | Client / Patient | Patient | Patient |
| **Provider Title** | Psychologist / Therapist | Physiotherapist | Dentist / Hygienist |
| **Primary Units** | 50-minute therapy session | Assessment / Treatment session | Exam / Cleaning / Procedure |
| **Intake Requirements** | Mental health history, emergency contact, consent | Musculoskeletal pain map, injury history | Dental history, insurance, teeth chart |
| **Clinical Notes** | Encrypted psychotherapy notes (staff-restricted) | SOAP notes, range-of-motion metrics | Odontogram, periodontal charting |

---

## 5. Security & Isolation Matrix

1. **Row-Level Security**: Every query filtered by `tenant_id`.
2. **Access Control (RBAC)**:
   - `Super Admin`: Platform oversight, tenant provisioning.
   - `Tenant Owner`: Clinic billing, staff management, settings.
   - `Tenant Admin`: Day-to-day clinic administration.
   - `Practitioner`: Own calendar, assigned patients, clinical notes.
   - `Receptionist`: Calendar, appointments, billing, front desk triage.
   - `Patient/Client`: Self-service portal (own appointments and forms only).
3. **Storage Security**: Cloudflare R2 bucket per environment; objects prefixed with `tenants/{tenant_id}/`. Pre-signed URLs expire within 15 minutes.

---

## 6. Milestone 1 Deliverable: Multi-Tenant Foundation

The initial objective of PracticeOS development:
1. Scaffold Next.js App Router project with TypeScript and Tailwind CSS.
2. Initialize PostgreSQL schema with Drizzle ORM and run baseline migrations.
3. Build the Tenant Provisioning Flow:
   - Tenant name & slug input.
   - Vertical Pack selection (Psychology default).
   - Plan selection (Starter, Pro, Enterprise).
   - Instant Preview Generation at `{tenant-slug}.localhost:3000` or `/preview/{tenant-slug}`.
4. Verify tenant isolation with automated test suite.
