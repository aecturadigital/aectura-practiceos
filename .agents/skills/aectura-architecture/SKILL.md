---
name: aectura-architecture
description: >-
  The constitution and core architecture of Aectura PracticeOS. Defines the single modular
  multi-tenant application model, PostgreSQL source of truth, tenant data/config lifecycle,
  and n8n automation boundaries. Activate whenever planning architecture, creating high-level
  features, adding external dependencies, or evaluating domain boundaries.
---

# Aectura Architecture & Constitution

This skill serves as the **irreversible constitution** of Aectura PracticeOS. It establishes the architectural principles that prevent architectural drift across coding sessions.

## 1. Non-Negotiable Tenets

1. **One Modular Multi-Tenant Codebase**:
   - Aectura is a single unified Next.js + PostgreSQL application.
   - **NEVER** create separate repositories, forks, microservices per customer, or standalone deployments per clinic.
   - Clinics are rows in the database and configuration objects in memory.

2. **Tenants are Data and Configuration**:
   - Creating a new clinic must NEVER require a code change or server reboot.
   - All tenant customization (clinic name, branding colors, vertical pack, practitioners, appointment buffers, custom intake questions) is stored as relational records and JSONB configs.

3. **PostgreSQL + Drizzle is the Absolute Source of Truth**:
   - All operational state, entities, transactions, and audit trails reside in PostgreSQL.
   - Keep relational entities relational (tables, foreign keys, unique constraints).
   - Use JSONB strictly for vertical pack extension attributes, intake form definitions, and tenant customization payloads.
   - No file blobs in PostgreSQL. Upload all documents to Cloudflare R2 and store only metadata and keys.

4. **The n8n Automation Boundary**:
   - **Application owns state; n8n performs external actions.**
   - PracticeOS emits transactional webhook events (`lead.created`, `appointment.created`, `appointment.completed`, `conversation.needs_human`, `review.request.ready`).
   - n8n receives events, parses tenant context, and triggers external services (Twilio SMS, WhatsApp Business API, Google Calendar sync, email sequences).
   - n8n must **NEVER** become the core database or business state authority.

5. **Lean Self-Hosted Foundation**:
   - Built to run on Coolify PaaS and standard Docker containers.
   - Cloudflare for DNS, CDN, Edge WAF, and R2 Object Storage.
   - No Firebase dependencies.

## 2. Milestone 1 Priority

When initializing or reviewing the codebase, ensure the **Tenant Foundation Flow** is completed first:
$$\text{Create Tenant} \longrightarrow \text{Select Vertical (Psychology)} \longrightarrow \text{Select Plan} \longrightarrow \text{Generate Preview}$$

Do not develop AI receptionists, marketing automations, or complex third-party billing integrations until this foundation is rock-solid and verified.

## 3. Reference Documentation

For detailed schema layouts, vertical pack matrices, and system topology, consult:
- [Master Product Specification](../../../docs/master-specification.md)
- [Multi-Tenant SaaS Skill](../multi-tenant-saas/SKILL.md)
- [Database Architecture Skill](../database-architecture/SKILL.md)
- [Tenant Security Skill](../tenant-security/SKILL.md)
