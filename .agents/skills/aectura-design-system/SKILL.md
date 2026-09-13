---
name: aectura-design-system
description: >-
  Governs the visual language, design tokens, color palette, typography, component standards,
  and layout rules for Aectura PracticeOS. Defines the 'Premium Minimal Clinical Modern' aesthetic.
  Activate whenever writing CSS, Tailwind classes, UI components, layouts, forms, buttons,
  tables, modals, or reviewing visual designs.
---

# Aectura Design System & Visual Identity

The Aectura design system ensures that every interface built today, or six weeks from now, feels coherent, refined, and institutional.

## 1. Aesthetic Direction: Premium Minimal Clinical

> **ABSOLUTE RULE**: Never make the UI look like a generic purple AI SaaS with heavy gradients, glowing neon borders, cartoonish illustrations, or bubbly buttons.

### The Aectura Aesthetic Pillars
- **Premium & Precise**: Subdued, crisp, authoritative engineering.
- **Clinical Without Being Sterile**: Calming, trustworthy, and humane for healthcare contexts.
- **High Readability**: High-contrast typography on neutral surfaces.
- **Subtle Structure**: Defined by hairline borders (`1px border-border`), not floating blurry box-shadows.

---

## 2. Color Palette & Design Tokens

```css
:root {
  /* Surfaces */
  --surface-base: #FFFFFF;
  --surface-subtle: #F9F9FB;       /* Warm off-white */
  --surface-muted: #F1F2F4;
  --surface-dark: #111315;        /* Deep technical charcoal */
  --surface-dark-subtle: #181A1D;

  /* Typography */
  --text-primary: #111315;        /* Dark Charcoal */
  --text-secondary: #525866;      /* Slate grey */
  --text-muted: #868C98;
  --text-inverse: #FFFFFF;

  /* Accents */
  --accent-teal: #0D9488;         /* Muted Clinical Teal */
  --accent-teal-hover: #0F766E;
  --accent-teal-subtle: #F0FDFA;  /* Soft teal tint for badges */
  
  /* Status */
  --status-success: #16A34A;
  --status-warning: #D97706;
  --status-error: #DC2626;
  --status-info: #2563EB;

  /* Borders & Dividers */
  --border-subtle: #E2E8F0;       /* Hairline divider */
  --border-strong: #CBD5E1;
  --border-dark: #27272A;
}
```

---

## 3. Typography Scale

- **Primary Font Family**: Inter or Plus Jakarta Sans (`font-sans`), tabular numbers (`font-mono` / `tabular-nums`) for currency, times, and phone numbers.
- **Display / H1**: `text-2xl font-semibold tracking-tight text-charcoal-900`
- **Section / H2**: `text-lg font-medium text-charcoal-900`
- **Body Regular**: `text-sm leading-relaxed text-slate-600`
- **Subtext / Captions**: `text-xs text-slate-400 font-medium`
- **Labels / Badges**: `text-xs font-medium uppercase tracking-wider`

---

## 4. Component Standards

### Buttons
- **Primary**: `bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-none border border-transparent`
- **Secondary / Outline**: `bg-white hover:bg-slate-50 text-charcoal-900 text-sm font-medium px-4 py-2 rounded-md border border-slate-200 transition-colors`
- **Ghost**: `hover:bg-slate-100 text-slate-600 hover:text-charcoal-900 text-sm font-medium px-3 py-1.5 rounded-md`
- **Destructive**: `bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md`

### Cards & Panels
- Background: White on warm off-white surface (`bg-white`).
- Borders: Crisp hairline (`border border-slate-200/80`).
- Border Radius: Restrained `rounded-lg` (8px) or `rounded-md` (6px). Never pill-shaped or oversized bubbly corners.
- Shadow: `shadow-[0_1px_3px_rgba(0,0,0,0.04)]` or `shadow-none`.

### Tables
- Headers: `bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4 border-b border-slate-200`
- Rows: `hover:bg-slate-50/50 transition-colors border-b border-slate-100 py-3 px-4 text-sm text-charcoal-800`
- Cell Alignment: Left for text, right for currency/metrics, center for status badges.

### Badges / Tags
- Format: Soft background, strong text, zero border or 1px subtle matching border.
  - Active: `bg-teal-50 text-teal-700 border border-teal-200/50 rounded-full px-2.5 py-0.5 text-xs font-medium`
  - Pending: `bg-amber-50 text-amber-700 border border-amber-200/50 rounded-full px-2.5 py-0.5 text-xs font-medium`

---

## 5. Mobile & Responsive Layout Rules

1. **Dashboard Shell**: Collapsible sidebar navigation on tablet (`md:hidden`), sliding drawer sheet on mobile.
2. **Action Bars**: On mobile, primary actions sticky to bottom sheet or top navigation header to maximize thumb reach.
3. **Table Responsiveness**: Tables must wrap into stacked detail cards on mobile viewports (`<640px`) rather than generating awkward horizontal scrollbars.
