---
name: cloudflare-infrastructure
description: >-
  Governs Cloudflare edge services including DNS routing, Cloudflare for SaaS custom domains,
  R2 object storage with pre-signed URLs, Turnstile bot protection, edge WAF rules, caching
  policies, and SSL automation. Activate whenever managing file uploads, domain verification,
  security headers, or edge caching.
---

# Cloudflare Infrastructure & Edge Operations

Aectura PracticeOS leverages Cloudflare as an enterprise edge network, security shield, and S3-compatible object store.

---

## 1. Cloudflare R2 Object Storage

All tenant assets (logos, clinical document uploads, intake signatures, exported invoices) are persisted in **Cloudflare R2** (zero egress fees).

### Storage Path Architecture
Every key MUST begin with the tenant's UUID:
```text
r2://aectura-practiceos-prod/
└── tenants/
    └── {tenant_id}/
        ├── public/             # Clinic branding, logos, practitioner photos (CDN cached)
        │   └── logo.svg
        └── private/            # Patient intake forms, clinical charts, insurance cards
            └── {contact_id}/
                └── {file_uuid}.pdf
```

### Pre-Signed URL Workflow (Private Assets)
```typescript
// lib/storage/r2.ts
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generateUploadUrl(tenantId: string, contactId: string, fileName: string, contentType: string) {
  const fileKey = `tenants/${tenantId}/private/${contactId}/${crypto.randomUUID()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 900 }); // 15 mins
  return { uploadUrl, fileKey };
}
```

---

## 2. Cloudflare for SaaS (Custom Domains)

Clinics can attach their own domain (e.g. `booking.hamdaniclinic.com`).
1. Clinic adds CNAME record pointing to `cname.practiceos.com`.
2. PracticeOS invokes Cloudflare API to register a Custom Hostname.
3. Cloudflare provisions a free managed SSL/TLS certificate via Let's Encrypt / Google Trust Services.
4. Once verified, Cloudflare routes traffic directly to the Next.js origin with header `Host: booking.hamdaniclinic.com`.

---

## 3. Security, WAF & Turnstile

- **Turnstile Bot Prevention**: Cloudflare Turnstile tokens are validated on all public contact forms and booking steps to eliminate spam bookings without annoying captcha puzzles.
- **Edge WAF**:
  - Blocks SQL injection and path traversal attempts at Cloudflare's edge before hitting our Next.js Docker containers.
  - Geo-blocking / rate limiting on sensitive authentication routes (`/api/auth/*`).
- **Cache Rules**:
  - Dynamic App routes (`/(dashboard)/*`, `/api/*`): Cache-Control `no-store`.
  - Static Clinic Public Assets (`/tenants/.../public/*`): Cache-Control `public, max-age=31536000, immutable`.
