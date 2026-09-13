---
name: testing-qa
description: >-
  Governs testing standards, quality assurance, unit tests, integration suites, browser automation,
  accessibility (a11y) audits, responsive viewport checks, and tenant isolation verification.
  Enforces the mandatory cross-tenant isolation test. Activate whenever writing tests, verifying PRs,
  debugging broken pages, or auditing security boundaries.
---

# Testing & Quality Assurance (QA) Standards

Quality assurance in Aectura PracticeOS is focused on reliability, security, and real-world behavior rather than vanity metric code coverage.

---

## 1. The Mandatory Multi-Tenant Isolation Test

This test is the most important automated test in the entire codebase:

> **THE MANDATORY ISOLATION SUITE**:
> 1. Seed **Tenant A** with Contact $C_A$, Appointment $A_A$, Document $D_A$.
> 2. Seed **Tenant B** with Contact $C_B$, Appointment $A_B$, Document $D_B$.
> 3. Authenticate as a staff member or user of **Tenant A**.
> 4. Execute:
>    - `GET /api/contacts/{C_B.id}`
>    - `GET /api/appointments/{A_B.id}`
>    - `GET /api/documents/{D_B.id}/download-url`
>    - `POST /api/appointments/{A_B.id}/cancel`
> 5. **EXPECTED RESULT**: Every request MUST return `404 Not Found` or `403 Forbidden`. Under no circumstance should any data from Tenant B be serialized in the response body or headers.

```typescript
// tests/integration/tenant-isolation.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { createTestTenant, createTestContact, authenticateAs } from "../helpers";

describe("Tenant Cross-Boundary Isolation Suite", () => {
  let tenantA: any, tenantB: any;
  let contactB: any;

  beforeAll(async () => {
    tenantA = await createTestTenant("clinic-a");
    tenantB = await createTestTenant("clinic-b");
    contactB = await createTestContact(tenantB.id, { firstName: "Secret", lastName: "Patient" });
  });

  it("prevents Tenant A user from querying Tenant B contact via API", async () => {
    const clientA = await authenticateAs(tenantA.id, "practitioner");
    const response = await clientA.get(`/api/contacts/${contactB.id}`);
    
    // Must be 404 or 403, NEVER 200 with patient details
    expect([403, 404]).toContain(response.status);
    expect(response.body).not.toHaveProperty("firstName", "Secret");
  });
});
```

---

## 2. Browser & Accessibility Testing (Chrome DevTools / Playwright)

Leverage the official **Chrome DevTools** integration to test user journeys end-to-end:

1. **Accessibility (a11y) Audits**:
   - Every public booking page must achieve a Lighthouse Accessibility score of 95+.
   - Proper `aria-labels` on icon buttons, form fields linked to `<label>` tags via `htmlFor`, and visible keyboard focus outlines (`focus-visible:ring-2`).
2. **Responsive Viewport Verification**:
   - Verify all screens at standard responsive breakpoints:
     - Mobile: `375px` (iPhone SE) and `390px` (iPhone 14)
     - Tablet: `768px` (iPad mini)
     - Desktop: `1280px` and `1440px`
   - Test that tables collapse to readable cards on mobile devices.
3. **Core Web Vitals Verification**:
   - Largest Contentful Paint (LCP) < 2.5s.
   - Cumulative Layout Shift (CLS) < 0.1.
   - Interaction to Next Paint (INP) < 200ms.

---

## 3. Pre-Merge Verification Runbook

Before any major feature or PR is merged:
1. `npm run lint` — ESLint passes with zero warnings.
2. `npm run typecheck` — TypeScript compiles without errors.
3. `npm run test:unit` — Vitest unit tests pass.
4. `npm run test:isolation` — Multi-tenant isolation suite passes 100%.
5. `npm run test:e2e` — Playwright end-to-end booking flow completes successfully.
