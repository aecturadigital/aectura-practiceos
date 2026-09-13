---
name: multi-tenant-saas
description: >-
  Provides comprehensive knowledge and patterns for multi-tenant isolation, tenant resolution,
  subdomains, custom domains, preview generation, tenant entitlements, and tenant-scoped queries.
  Activate whenever writing database queries, middleware, tenant routing, domain management,
  or tenant configuration logic.
---

# Multi-Tenant SaaS Architecture

This skill governs all multi-tenant mechanics within Aectura PracticeOS.

## The Cardinal Rule

> **EVERY TENANT-OWNED ENTITY MUST BE TENANT SCOPED.**
> A query or mutation lacking a validated `tenant_id` is an architectural defect and an immediate security vulnerability.

---

## 1. Tenant Resolution Pipeline

In Next.js App Router, incoming HTTP requests are resolved to a tenant inside edge/node middleware before reaching route handlers or page components.

### Resolution Priority
1. **Custom Domain**: Lookup host in `tenant_domains` table (e.g., `booking.hamdaniclinic.com`).
2. **Subdomain**: Extract subdomain from base platform domain (e.g., `mindwell.practiceos.com` -> slug: `mindwell`).
3. **Path Prefix (Preview/Development)**: Route pattern `/preview/:tenant_slug` or `localhost:3000` session cookie.
4. **API Header**: For external webhooks/integrations: `X-Tenant-ID: <uuid>`.

### Request Context Injection
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const tenant = await resolveTenantFromHost(host);
  
  if (!tenant) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  // Inject tenant context into headers for downstream Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenant.id);
  requestHeaders.set("x-tenant-slug", tenant.slug);
  requestHeaders.set("x-tenant-status", tenant.status);
  
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
```

---

## 2. Tenant Status Lifecycle

Each tenant record in PostgreSQL features a strict lifecycle state:

| Status | Public Portal | Staff Dashboard | Booking Engine | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `preview` | Password/Preview Banner | Read/Write (Draft) | Sandbox mode | Instant preview after self-service signup |
| `active` | Fully Accessible | Full Access | Live appointments | Production paying clinic |
| `suspended` | 503 / Friendly Holding Page | Read-only / Billing | Disabled | Delinquent payment or maintenance |
| `archived` | 404 Not Found | Disabled | Disabled | Offboarded practice |

---

## 3. Writing Tenant-Scoped Database Queries

### Drizzle ORM Helper Pattern
Never write raw queries that omit `tenant_id`. Use a tenant-scoped database client wrapper:

```typescript
// lib/db/tenant-db.ts
import { db } from "./index";
import { eq, and, SQL } from "drizzle-orm";
import { contacts, appointments } from "./schema";

export function getTenantDb(tenantId: string) {
  return {
    async getContacts(filter?: SQL) {
      return db
        .select()
        .from(contacts)
        .where(and(eq(contacts.tenantId, tenantId), filter));
    },
    async getContactById(contactId: string) {
      const [contact] = await db
        .select()
        .from(contacts)
        .where(and(eq(contacts.tenantId, tenantId), eq(contacts.id, contactId)))
        .limit(1);
      return contact ?? null;
    },
    async createAppointment(data: Omit<typeof appointments.$inferInsert, "tenantId">) {
      const [appointment] = await db
        .insert(appointments)
        .values({ ...data, tenantId })
        .returning();
      return appointment;
    }
  };
}
```

---

## 4. Tenant Entitlements & Features

Features are enabled dynamically via the `tenants.config` JSONB column or an entitlements table:
```json
{
  "vertical": "psychology",
  "plan": "pro",
  "features": {
    "ai_receptionist": true,
    "sms_reminders": true,
    "custom_domain": true,
    "practitioner_seats": 5,
    "max_contacts": 10000
  },
  "branding": {
    "primary_color": "#0D9488",
    "logo_url": "https://r2.practiceos.com/tenants/.../logo.svg",
    "clinic_name": "Hamdani Therapy & Wellness"
  }
}
```

## 5. Testing Checklist
- [ ] Attempting to access Tenant B's contact with Tenant A's session returns `404 Not Found` or `403 Forbidden`.
- [ ] Subdomain resolution handles wildcards, punycode, and missing subdomains gracefully.
- [ ] Custom domain mapping validates SSL certificate status before activating routing.
