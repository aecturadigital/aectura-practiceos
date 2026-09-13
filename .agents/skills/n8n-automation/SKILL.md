---
name: n8n-automation
description: >-
  Governs event-driven workflow automation using n8n. Enforces state separation: PracticeOS
  owns transactional state; n8n receives signed webhook events to execute external communications
  (SMS, WhatsApp, email, review sequences). Governs reusable tenant-aware n8n workflows.
  Activate whenever creating webhooks, event publishers, or integrating n8n workflows.
---

# n8n Automation & Asynchronous Event Architecture

Aectura PracticeOS uses n8n as its external automation engine. This decouples third-party API integrations (Twilio, WhatsApp Business, Resend, Google Calendar, review platforms) from the core web application.

---

## 1. The Separation of Concerns

| Concern | PracticeOS (Next.js + PostgreSQL) | n8n Workflow Automation |
| :--- | :--- | :--- |
| **State Ownership** | Absolute owner of all relational records | Stateless execution; stores zero core data |
| **Business Logic** | Validates appointments, slots, permissions | Routes messages and executes external APIs |
| **Trigger Mechanism** | Emits HMAC-signed JSON webhooks | Receives webhook payload at edge webhook node |
| **Failure Handling** | Idempotency keys, retry queues | Automatic exponential backoff retries |

---

## 2. Reusable Multi-Tenant Workflows

> **DO NOT CREATE ONE N8N WORKFLOW PER CLINIC.**
> Design generic, tenant-aware n8n workflows that dynamically read `tenant_id`, fetch the clinic's credentials or config via API, and execute actions with tenant branding.

```
[ PracticeOS ] 
      |  POST Webhook: `appointment.created`
      |  Headers: X-Tenant-Id, X-Signature
      v
[ n8n Webhook Node ]
      |
      v
[ Verify HMAC Signature Node ]
      |
      v
[ Route by Event Type ]
      |
      +---> `appointment.created` ---> Send WhatsApp & SMS Confirmation to Patient
      +---> `appointment.completed` -> Schedule Review Request Sequence (2 hours later)
      +---> `conversation.needs_human` -> Notify Clinic Receptionist via Slack/Email
```

---

## 3. Standardized Event Contracts

All outgoing events from PracticeOS MUST follow this JSON schema:

```json
{
  "id": "evt_01HXYZ1234567890",
  "eventType": "appointment.created",
  "timestamp": "2026-09-13T10:15:30Z",
  "tenant": {
    "id": "tenant-uuid-1111",
    "slug": "mindwell",
    "name": "MindWell Psychology Clinic",
    "phone": "+15551234567"
  },
  "payload": {
    "appointmentId": "appt-uuid-2222",
    "contact": {
      "id": "contact-uuid-3333",
      "firstName": "Sarah",
      "lastName": "Connor",
      "phone": "+15559876543",
      "email": "sarah@example.com"
    },
    "practitioner": {
      "id": "user-uuid-4444",
      "name": "Dr. Marcus Vance"
    },
    "service": {
      "name": "Initial Therapy Consultation",
      "durationMinutes": 50
    },
    "startTime": "2026-09-15T14:00:00Z",
    "endTime": "2026-09-15T14:50:00Z"
  }
}
```

### Core Event Catalog
1. `lead.created`: Triggered when an anonymous visitor submits a public inquiry or starts a conversation.
2. `appointment.created`: Triggered immediately after slot confirmation.
3. `appointment.completed`: Triggered when practitioner marks session finished.
4. `conversation.needs_human`: Triggered when the AI receptionist encounters an intent requiring clinic staff escalation.
5. `review.request.ready`: Triggered to collect Google / Trustpilot feedback following successful treatment.

---

## 4. Webhook Security & Idempotency
- **HMAC Signatures**: Every outgoing request includes header `X-Aectura-Signature: sha256=...` generated using a per-tenant webhook secret.
- **Idempotency**: Webhook payloads include unique `id`. n8n verifies via cache node that the event has not already been processed.
