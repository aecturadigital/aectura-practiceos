---
name: authentication-rbac
description: >-
  Governs identity, Google OAuth, phone OTP authentication, session lifecycles, 2FA,
  and Role-Based Access Control (RBAC). Defines the strict permission boundaries between
  Super Admin, Tenant Owner, Tenant Admin, Practitioner, Receptionist, Marketing, Billing,
  and Patient/Client. Activate whenever working on auth routes, session checks, permission guards,
  or staff roles.
---

# Authentication & Role-Based Access Control (RBAC)

Aectura PracticeOS serves both clinical staff and public patients. Security requires an explicit separation between internal staff roles and external patient access.

---

## 1. Authentication Strategies

### 1. Staff Authentication
- **Primary**: Google Workspace OAuth & Work Email + Password.
- **Enforcement**: Mandatory Two-Factor Authentication (TOTP or SMS OTP) for clinical staff accessing medical records.
- **Session Lifespan**: 12 hours max, revoked immediately upon password change or membership deactivation.

### 2. Patient / Client Authentication
- **Primary**: Passwordless Mobile OTP (SMS via Twilio) or Magic Link.
- **Account Linking**: Automatically matches incoming phone number/email with existing `contacts` row under the respective `tenant_id`.
- **Session Boundary**: Patient sessions are restricted exclusively to the public booking portal and their own patient self-service dashboard (`/portal`).

---

## 2. Permission Context Hierarchy

| Role | Scope | Key Capabilities | Prohibited Actions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Global Platform | Provision tenants, view system telemetry, manage platform billing. | Cannot view unencrypted private clinical notes of any clinic. |
| **Tenant Owner** | Single Tenant | Full control: clinic billing, Stripe accounts, delete tenant, hire/fire staff. | Cannot access other tenants' data. |
| **Tenant Admin** | Single Tenant | Day-to-day operations: manage services, practitioner schedules, forms. | Cannot transfer ownership or alter bank payout accounts. |
| **Practitioner** | Single Tenant | View own calendar, manage own availability, write clinical/SOAP notes, view assigned patients. | Cannot alter clinic billing or view unassigned patients without clinical need. |
| **Receptionist** | Single Tenant | Triage inbox, schedule appointments across all practitioners, check in patients, take front-desk payments. | Cannot read sensitive psychotherapy clinical session notes. |
| **Billing** | Single Tenant | Invoices, insurance claims, payment reconciliations. | Cannot alter medical charts or clinical notes. |
| **Marketing** | Single Tenant | Public website CMS, campaign analytics, review management. | Zero access to clinical records, notes, or patient medical histories. |
| **Patient / Client** | Single Tenant (Self) | Book appointments, view own upcoming sessions, fill intake forms, pay invoices. | Cannot view any staff screens or other patients' data. |

---

## 3. RBAC Implementation Pattern

```typescript
// lib/auth/permissions.ts
export type StaffRole = 
  | "super_admin" 
  | "tenant_owner" 
  | "tenant_admin" 
  | "practitioner" 
  | "receptionist" 
  | "billing" 
  | "marketing";

export const PERMISSIONS = {
  "appointments:read": ["tenant_owner", "tenant_admin", "practitioner", "receptionist"],
  "appointments:write": ["tenant_owner", "tenant_admin", "practitioner", "receptionist"],
  "clinical_notes:read": ["tenant_owner", "practitioner"], // Strictly restricted
  "clinical_notes:write": ["practitioner"],
  "billing:manage": ["tenant_owner", "tenant_admin", "billing"],
  "settings:manage": ["tenant_owner", "tenant_admin"],
} as const;

export function hasPermission(role: StaffRole, action: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[action].includes(role);
}
```

---

## 4. Account Linking & Contact Resolution

When a patient logs in with phone `+1234567890`:
1. Check `contacts` where `tenant_id = currentTenant.id` and `phone = normalizedPhone`.
2. If found, link `userId` to `contacts.id`.
3. If not found, create a new `contacts` record in stage `"lead"` under `currentTenant.id`.
4. Never link a contact from Tenant B into Tenant A.
