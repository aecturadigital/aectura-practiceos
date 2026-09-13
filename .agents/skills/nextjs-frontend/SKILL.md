---
name: nextjs-frontend
description: >-
  Establishes Next.js App Router conventions, TypeScript typing, React Server Components (RSC),
  Client Component boundaries, Server Actions, form state handling, loading/error UI, caching,
  and performance standards. Activate whenever building UI pages, layouts, server actions,
  forms, or optimizing Core Web Vitals.
---

# Next.js Frontend Standards & App Router Conventions

This skill dictates how frontend code is structured across Aectura PracticeOS, maintaining consistency across both public clinic booking pages and staff dashboards.

## 1. Architectural Rules

1. **Default to React Server Components (RSC)**:
   - All components are Server Components by default.
   - Fetch data directly in Server Components using async/await and the tenant database client.
   - Only add `"use client"` when component requires browser state (`useState`, `useEffect`), event listeners, or browser APIs (e.g. interactive calendar, modal toggles).

2. **Route Structure (App Router)**:
   ```text
   src/app/
   ├── (auth)/                  # Shared login, signup, OTP screens
   ├── (dashboard)/             # Staff PracticeOS portal
   │   └── [tenantSlug]/
   │       ├── layout.tsx       # Sidebar, tenant context provider, nav
   │       ├── appointments/    # Calendar and slot management
   │       ├── contacts/        # 360 Patient card
   │       ├── settings/        # Vertical pack & clinic configs
   │       ├── loading.tsx      # Skeleton loader
   │       └── error.tsx        # Isolated error boundary
   ├── (public)/                # Public clinic microsite & booking flow
   │   └── [tenantSlug]/
   │       ├── page.tsx         # Clinic home
   │       ├── book/            # Multi-step booking wizard
   │       └── layout.tsx       # Clinic public header & theme wrapper
   └── api/                     # Webhooks & specialized edge handlers
   ```

3. **Forms and Mutations via Server Actions**:
   - Use Next.js Server Actions (`"use server"`) for mutations.
   - Validate input payloads with **Zod** on both client and server before execution.
   - Return structured results `{ success: boolean, data?: T, error?: string }`.
   - Revalidate cached pages using `revalidatePath` or `revalidateTag`.

---

## 2. Server vs Client Component Pattern

### Server Component (Data Fetcher)
```tsx
// app/(dashboard)/[tenantSlug]/contacts/page.tsx
import { getTenantDb } from "@/lib/db/tenant-db";
import { ContactTable } from "./components/contact-table";

export default async function ContactsPage({ params }: { params: { tenantSlug: string } }) {
  const { tenantSlug } = params;
  const tenant = await getTenantBySlug(tenantSlug);
  const tenantDb = getTenantDb(tenant.id);
  const contactsList = await tenantDb.getContacts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal-900">
          {tenant.config.terminology?.contactsTitle || "Patients & Clients"}
        </h1>
      </div>
      <ContactTable initialContacts={contactsList} tenantId={tenant.id} />
    </div>
  );
}
```

### Client Component (Interactivity)
```tsx
// app/(dashboard)/[tenantSlug]/contacts/components/contact-table.tsx
"use client";

import { useState } from "react";
import { Contact } from "@/lib/db/schema";

export function ContactTable({ initialContacts, tenantId }: { initialContacts: Contact[]; tenantId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  // Interactive client logic...
}
```

---

## 3. Performance & Core Web Vitals Checklist

- **Next.js Image**: Always use `next/image` with explicit width/height or `fill` with `sizes` to eliminate Cumulative Layout Shift (CLS).
- **Fonts**: Utilize `next/font/google` (Inter / Plus Jakarta Sans) to preload variable font subsets with zero layout shift.
- **Loading UI**: Every dashboard section MUST have a `loading.tsx` providing a pulsing skeleton that matches the exact layout shape.
- **Error Boundaries**: Implement `error.tsx` at layout boundaries with a retry button to prevent white-screen crashes from cascading.
