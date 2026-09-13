---
name: vertical-pack-engine
description: >-
  Governs the separation between the Core Platform and Vertical Configuration Packs
  (Psychology, Physiotherapy, Dental, General Practice). Enforces dynamic terminology,
  custom intake schemas, clinical chart definitions, pipeline stages, and dashboard widgets.
  Activate whenever working on vertical switching, terminology resolvers, clinical forms,
  or practice-specific customization.
---

# Vertical Pack Engine Architecture

The Vertical Pack Engine allows Aectura PracticeOS to feel purpose-built for a child psychologist, a sports physiotherapist, or a cosmetic dentist without writing three separate software products.

## The Core Vertical Law

> **CORE PLATFORM ≠ VERTICAL PLATFORM.**
> The core platform provides authentication, tenancy, calendar, billing, and CRM entities.
> The vertical pack provides the **terminology, intake questions, service catalog, clinical note templates, and metrics** layered on top.

---

## 1. Supported Vertical Packs

### 1. Psychology & Psychotherapy Pack (`vertical: "psychology"`)
- **Terminology**: Client (or Patient), Therapist / Psychologist, Therapy Session, Intake Assessment.
- **Service Defaults**: 50-minute Individual Psychotherapy, 80-minute Couples Therapy.
- **Intake Requirements**: Emergency contact, mental health background, medical history, confidentiality consent.
- **Clinical Charting**: Encrypted private session notes (DAP / SOAP format), risk assessment indicators.

### 2. Physiotherapy & Musculoskeletal Pack (`vertical: "physiotherapy"`)
- **Terminology**: Patient, Physiotherapist, Initial Assessment, Follow-up Treatment.
- **Service Defaults**: 45-minute Initial Evaluation, 30-minute Rehabilitation Session.
- **Intake Requirements**: Interactive body pain map, injury history, movement limitations, physical goals.
- **Clinical Charting**: Objective range of motion (ROM) tracking, exercise prescription attachments.

### 3. Dental Practice Pack (`vertical: "dental"`)
- **Terminology**: Patient, Dentist / Hygienist, Cleaning, Consultation, Procedure.
- **Service Defaults**: 30-minute Routine Checkup & Scale, 60-minute Restorative Treatment.
- **Intake Requirements**: Dental anxiety level, medical alerts (antibiotic prophylaxis), dental insurance details.
- **Clinical Charting**: Odontogram tooth chart overlay, periodontal pocket depth logs.

---

## 2. Dynamic Terminology Resolver

Never hardcode "Patient" or "Doctor" in UI components. Use the vertical pack resolver:

```typescript
// lib/verticals/terminology.ts
export interface VerticalTerminology {
  contactSingular: string;      // e.g. "Client" vs "Patient"
  contactPlural: string;        // e.g. "Clients" vs "Patients"
  practitionerTitle: string;    // e.g. "Psychologist" vs "Physiotherapist"
  sessionTitle: string;         // e.g. "Session" vs "Treatment"
  notesTitle: string;           // e.g. "Psychotherapy Notes" vs "Clinical SOAP Notes"
}

export function getTerminology(vertical: string, customOverrides?: Partial<VerticalTerminology>): VerticalTerminology {
  const defaults = VERTICAL_DEFAULTS[vertical] || VERTICAL_DEFAULTS.psychology;
  return { ...defaults, ...customOverrides };
}
```

---

## 3. Dynamic Form Schemas & Field Injection

Vertical packs define declarative JSON Schema forms for public intake:
```json
{
  "vertical": "psychology",
  "intakeForm": {
    "sections": [
      {
        "title": "Reason for Seeking Therapy",
        "fields": [
          { "id": "primary_concern", "type": "textarea", "label": "What brings you to therapy today?", "required": true },
          { "id": "previous_therapy", "type": "radio", "label": "Have you seen a mental health professional before?", "options": ["Yes", "No"] }
        ]
      }
    ]
  }
}
```
Intake responses are validated against the schema and stored in `contacts.vertical_data` and `intake_submissions.data`.
