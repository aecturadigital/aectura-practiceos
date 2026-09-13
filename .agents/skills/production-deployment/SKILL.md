---
name: production-deployment
description: >-
  Governs Coolify deployment, Docker multi-stage containers, staging and production environments,
  zero-downtime database migrations, environment variables, health checks, backup schedules,
  and Uptime Kuma monitoring. Activate whenever building Dockerfiles, deploying to Coolify,
  running database migrations in production, or configuring infrastructure monitoring.
---

# Production Deployment & Infrastructure Runbooks

Aectura PracticeOS is engineered for clean self-hosted deployments via Coolify on Linux VPS infrastructure, with Cloudflare managing DNS, SSL, and object storage.

---

## 1. Golden Deployment Rule

> **NEVER DEPLOY AN UNTESTED DESTRUCTIVE MIGRATION DIRECTLY TO PRODUCTION.**
> Schema changes that drop columns, rename fields, or mutate primary keys must follow the Expand/Contract migration pattern:
> 1. Expand: Add new nullable column.
> 2. Backfill: Migrate data asynchronously.
> 3. Switch: Deploy application code reading from the new column.
> 4. Contract: Drop old column in a subsequent release.

---

## 2. Docker Architecture

We use an optimized Next.js multi-stage Dockerfile:

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Stage 2: Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production Runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

---

## 3. Coolify Environment Strategy

We run two isolated environments inside Coolify:

| Setting | Staging (`staging.practiceos.com`) | Production (`app.practiceos.com`) |
| :--- | :--- | :--- |
| **Branch** | `develop` (Auto-deploy on push) | `main` (Manual approval after staging verification) |
| **Database** | Staging PostgreSQL (isolated container) | Dedicated PostgreSQL cluster with PgBouncer |
| **Storage** | Cloudflare R2 (`aectura-staging`) | Cloudflare R2 (`aectura-production`) |
| **Domain Engine** | Wildcard `*.staging.practiceos.com` | Wildcard `*.practiceos.com` + Custom Domains |

---

## 4. Health Checks & Uptime Monitoring

- **Endpoint**: `/api/health` performs a lightweight query (`SELECT 1` on PostgreSQL) and verifies R2 connectivity:
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: "healthy", timestamp: new Date().toISOString() }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: "unhealthy", error: String(err) }, { status: 503 });
  }
}
```
- **Uptime Kuma Monitoring**:
  - Heartbeat monitor pinging `/api/health` every 30 seconds.
  - Alert dispatch to Discord/Telegram/Slack upon 2 consecutive failures.

---

## 5. Automated Backups & Disaster Recovery

1. **PostgreSQL Automated Daily Dumps**:
   - `pg_dump` cron running at 02:00 UTC daily.
   - Encrypted via GPG and streamed directly to an off-site Cloudflare R2 cold storage bucket.
   - Retention policy: 30 daily backups, 12 monthly backups.
2. **Rollback Procedure**:
   - In Coolify: Click "Rollback to previous deployment" to restore preceding Docker container image in <10 seconds.
