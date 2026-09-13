# AECTURA PracticeOS - Antigravity Agent Guidelines & Constitution

Welcome to the Aectura PracticeOS codebase. All AI coding agents operating within this workspace (Gemini 3.5 Flash, custom role agents, and subagents) MUST adhere strictly to the architectural constitution and development standards defined below.

---

## 1. The Core Constitution

1. **Single Modular Multi-Tenant Application**: Aectura is ONE codebase serving all clinics and healthcare verticals. **NEVER** create separate repositories, branches, or distinct application instances per customer/tenant.
2. **Tenants are Configuration & Data**: A new tenant/clinic is created by inserting records into PostgreSQL and configuring vertical packs. A new clinic requires **zero code deployments**.
3. **PostgreSQL + Drizzle is the Absolute Source of Truth**: All operational state, entities, relationships, transactions, and event logs belong in PostgreSQL.
4. **n8n Performs Automation, Not State Ownership**: n8n listens to tenant event webhooks and executes external automations (WhatsApp messages, SMS, email sequences, CRM syncs). n8n **never** acts as the primary database or core business logic authority.
5. **No Blind Tech Sprawl**: Keep the architecture lean, self-hosted on Coolify/Docker, backed by Cloudflare R2 for files, and governed by strict tenant isolation. Do not integrate Firebase services.

---

## 2. Multi-Tenant Isolation (Zero Tolerance)

- **Mandatory `tenant_id` Scoping**: Every tenant-owned database table, query, mutation, file storage path, cache key, and event payload MUST include `tenant_id`.
- **Row-Level Security (RLS)**: Enforce RLS at the PostgreSQL level alongside application-level scoping.
- **Cross-Tenant Breach Prevention**: It is an immediate critical failure for Tenant A to access Tenant B's contacts, appointments, documents, notes, or settings. Any PR modifying data access must pass the cross-tenant isolation test suite.

---

## 3. Official Integrations & Tech Stack

- **Framework**: Next.js (App Router, React Server Components, TypeScript).
- **Database & ORM**: PostgreSQL with Drizzle ORM, pooled via PgBouncer.
- **Official Antigravity Integrations Enabled**:
  - `Modern Web Guidance`: Modern, accessible, secure, performant web standards.
  - `Chrome DevTools`: Puppeteer / DevTools browser testing, visual regression, accessibility (a11y), and Core Web Vitals checks.
  - `Google Maps Platform`: Clinic address autocomplete, geocoding, distance calculation, and interactive clinic maps.
- **Styling & Design System**: Custom Tailwind CSS implementation adhering to `aectura-design-system` (Premium Minimal Clinical Modern; strictly no generic purple AI gradients).

---

## 4. Specialized Skills & Custom Agents

Antigravity uses progressive disclosure. The agent references skills in `.agents/skills/` on-demand:
- Use `aectura-architecture` for fundamental architectural decisions and the master specification.
- Use `multi-tenant-saas` for tenant resolution, domains, and preview generation.
- Use `database-architecture` for schemas, migrations, and Drizzle patterns.
- Use `tenant-security` for authorization, RLS, and IDOR prevention.
- Use `nextjs-frontend` for App Router conventions and performance.
- Use `aectura-design-system` for UI components, colors, and layout tokens.
- Use `authentication-rbac` for session lifecycles and role hierarchies.
- Use `crm-contact-system` for the 360° unified Patient/Client record.
- Use `appointment-engine` for calendar scheduling, buffers, and practitioner rosters.
- Use `vertical-pack-engine` for Psychology, Physiotherapy, and Dental modular configurations.
- Use `n8n-automation` for webhook payloads and event dispatching.
- Use `ai-receptionist` for conversational routing and medical safety guardrails.
- Use `cloudflare-infrastructure` for R2 storage, CDN, DNS, and Turnstile.
- Use `healthcare-data-safety` for clinical note encryption and data minimization.
- Use `testing-qa` for mandatory cross-tenant and browser test suites.
- Use `production-deployment` for Coolify, Docker, migrations, and backups.

---

## 5. First Milestone Rule

Do not attempt to build AI receptionists or complex automation flows until the core foundation is fully functional:
$$\text{Create Tenant} \longrightarrow \text{Select Vertical (Psychology)} \longrightarrow \text{Select Plan} \longrightarrow \text{Generate Tenant Preview}$$
Once this lifecycle is proven and tested, all subsequent clinic features build on rock-solid ground.
