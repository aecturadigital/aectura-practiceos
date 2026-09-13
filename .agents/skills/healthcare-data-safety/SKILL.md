---
name: healthcare-data-safety
description: >-
  Governs practical healthcare data protection, clinical data segregation, data minimization,
  patient consent, staff vs patient access boundaries, immutable audit logging, and AI data
  privacy. Activate whenever handling clinical notes, medical records, patient intake data,
  or designing storage models.
---

# Healthcare Data Safety & Practical Governance

Aectura PracticeOS prioritizes practical, engineering-first data safety over compliance jargon. Protecting sensitive patient information requires sensible architectural boundaries.

---

## 1. The Data Minimization Test

Before adding any column, form question, or database table, ask:

> **"DOES AECTURA ACTUALLY NEED TO STORE THIS INFORMATION?"**
> If a clinic does not strictly require a piece of data to provide treatment, schedule an appointment, or issue a bill, **DO NOT COLLECT IT.**

### Examples of Minimization
- **Credit Cards**: Never store raw credit card numbers, CVVs, or bank account numbers in PostgreSQL. Use Stripe Elements / SetupIntents; store only tokenized `payment_method_id`.
- **SSN / National ID**: Do not collect government ID numbers unless mandatory for state billing in a specific vertical pack.
- **Passwords**: Never store passwords in plaintext or reversible formats; use Argon2id or bcrypt with high work factors.

---

## 2. Clinical Data Segregation: Staff vs Patient Records

Healthcare records must be cleanly categorized into two visibility levels:

### Level A: Patient-Visible Records
- Booking confirmations, appointment dates, public invoices, practitioner bio, clinic directions, submitted intake form copies.
- Permitted to be viewed by the patient in their self-service portal (`/portal`).

### Level B: Staff-Restricted Clinical Records (Psychotherapy / SOAP Notes)
- Therapist raw session impressions, diagnostic formulation, clinical observations, supervisor notes, risk evaluations.
- **ABSOLUTE RULE**: These records are strictly restricted to the assigned practitioner and clinic clinical director. They must **NEVER** be serialized or rendered on public patient endpoints.

---

## 3. At-Rest Encryption for Sensitive Fields

For highly sensitive clinical notes (e.g. mental health therapy notes):
- Encrypt text contents at rest before insertion using AES-GCM-256 with a tenant-derived encryption key:
```typescript
// lib/security/encryption.ts
export function encryptClinicalNote(noteText: string, tenantKey: Buffer): { ciphertext: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", tenantKey, iv);
  let encrypted = cipher.update(noteText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return { ciphertext: encrypted, iv: iv.toString("hex"), tag };
}
```

---

## 4. Immutable Audit Logs

Whenever a user accesses or updates a medical record:
- Emit a synchronous audit log entry to the `audit_logs` table:
  `{ tenant_id, actor_id, action: "read" | "write" | "delete", target_entity: "clinical_note", target_id, timestamp, ip_hash }`.
- Audit log rows are **append-only**; no user (even Tenant Owner) can update or delete audit log entries.

---

## 5. AI Data Privacy Boundaries
- Patient medical charts, unredacted clinical notes, and private health diagnoses must **NEVER** be sent to external, untrusted third-party LLM APIs for model training.
- Conversations with the AI Receptionist must notify the patient that it is an automated assistant.
- Triage summaries must redact sensitive identifiers (SSN, credit card, address) before passing to summarization prompts.
