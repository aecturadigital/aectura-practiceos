---
name: tenant-security
description: >-
  Enforces multi-tenant isolation, PostgreSQL Row-Level Security (RLS), IDOR attack prevention,
  API authorization, Cloudflare R2 signed URL verification, secret management, audit logging,
  and tenant rate limits. Activate whenever reviewing PRs, writing API routes, creating file
  upload/download handlers, or setting authorization rules.
---

# Tenant Security & Isolation Enforcement

This is a **critical defense skill**. In a multi-tenant healthcare operating system, cross-tenant data leakage is catastrophic. Every pull request, API route, and database query must be evaluated against this specification.

## 1. Primary Threat Vectors & Countermeasures

### 1. Insecure Direct Object Reference (IDOR)
- **Vulnerability**: An authenticated user of Tenant A requests `/api/contacts/uuid-1234` where `uuid-1234` belongs to Tenant B.
- **Rule**: NEVER query by `id` alone. ALWAYS query by `and(eq(table.tenantId, currentTenantId), eq(table.id, requestedId))`.
- **Response**: If the record exists under a different tenant, return `404 Not Found` (never confirm or deny existence of other tenants' records).

### 2. Row-Level Security (RLS) in PostgreSQL
In addition to application-layer guards, enforce PostgreSQL RLS policies where direct connection roles are used:
```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON contacts
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
```

### 3. Cross-Tenant File Access (R2 Storage)
- Files in Cloudflare R2 MUST follow the key prefix hierarchy:
  `tenants/{tenant_id}/{entity_type}/{uuid}.{ext}`
- Never serve static public URLs for clinical records, patient intake PDFs, or identity documents.
- Always generate time-limited (max 15 minutes) HMAC-signed pre-signed download URLs after validating the requester's tenant membership and role.

### 4. API Authorization & Session Guards
Every Next.js Route Handler and Server Action must pass through the `requireTenantAuth` guard:

```typescript
// lib/auth/guard.ts
export async function requireTenantAuth(req: NextRequest, allowedRoles?: Role[]) {
  const session = await getSession(req);
  if (!session || !session.userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) {
    throw new HttpError(400, "Missing tenant context");
  }

  const membership = await getTenantMembership(session.userId, tenantId);
  if (!membership) {
    throw new HttpError(403, "Forbidden: Not a member of this tenant");
  }

  if (allowedRoles && !allowedRoles.includes(membership.role)) {
    throw new HttpError(403, "Forbidden: Insufficient privileges");
  }

  return { session, tenantId, membership };
}
```

---

## 2. Secrets Management & Environment Isolation

1. **Zero Hardcoded Secrets**: No API keys, JWT secrets, database credentials, or R2 tokens in repository files or git history.
2. **Tenant-Specific Credentials**: When clinics configure external providers (e.g. Stripe Connect accounts, custom Twilio SID), encrypt secrets at rest using AES-GCM-256 before saving to PostgreSQL.
3. **Audit Trail Logging**:
   - Every read of sensitive medical records or change of billing credentials generates an immutable row in `audit_logs`:
   `{ id, tenant_id, actor_id, action, resource_type, resource_id, ip_address, timestamp }`.

---

## 3. Rate Limiting & Abuse Prevention

- Apply Upstash Redis / Cloudflare WAF rate limits at the edge:
  - **Public Booking Endpoints**: 10 requests per minute per IP.
  - **SMS/OTP Dispatch**: 3 requests per 10 minutes per phone number.
  - **Staff API Endpoints**: 120 requests per minute per tenant user.
- Enforce Cloudflare Turnstile CAPTCHA on all unauthenticated booking and inquiry forms.
