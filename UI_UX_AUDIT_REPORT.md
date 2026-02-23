# JobStack — Comprehensive UI/UX, Theming, Accessibility & Frontend Quality Audit

**Date:** 2025-07-14
**Scope:** Full READ-ONLY audit of 60+ frontend files
**Auditor:** Automated static analysis (senior frontend/UX perspective)
**Files analyzed:** Layout, landing page, dashboard, auth, legal, diagram components, hooks, i18n, config

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Theming & Dark/Light Mode](#1-theming--darklight-mode)
3. [Responsiveness](#2-responsiveness)
4. [Accessibility (a11y)](#3-accessibility-a11y)
5. [Hydration Issues](#4-hydration-issues)
6. [Potential Console Errors](#5-potential-console-errors)
7. [i18n Coverage](#6-i18n-coverage)
8. [Performance](#7-performance)
9. [State Management](#8-state-management)
10. [Landing Page Quality](#9-landing-page-quality)
11. [Legal Pages (GDPR/RODO)](#10-legal-pages-gdprrodo)
12. [Ranked Issue List](#ranked-issue-list)
13. [Overall Assessment](#overall-assessment)

---

## Executive Summary

JobStack is a well-architected Next.js (App Router) application with a solid foundation: semantic HSL-based theming, proper dark-mode support via `next-themes`, good use of shadcn/ui components, and a well-structured layout with `ErrorBoundary`, `CookieConsent`, and `NextIntlClientProvider`. The diagram editor (ReactFlow-based) is feature-rich and the landing page is professional.

**However, the project has several systemic issues that significantly impact quality:**

| Severity | Count | Summary |
|----------|-------|---------|
| **Critical** | 3 | i18n is ~5% implemented; legal pages are Polish-only; cookie consent is Polish-only |
| **High** | 8 | Hardcoded chart/diagram colors ignore theme; mega-files (3140+ lines); no mobile diagram UX; missing a11y on diagram interactions |
| **Medium** | 11 | Deprecated APIs; `prompt()` for UX; `console.log` in production; stale server-rendered greeting; missing focus management |
| **Low** | 7 | Minor code quality, missing aria-labels on secondary actions, hardcoded brand colors (acceptable) |

**The single most impactful finding** is that the i18n system (`next-intl`) is wired up but only ~5% of UI strings use it. The landing page, dashboard, all diagram components, templates, organizations, and demo pages are entirely hardcoded English, while cookie consent and legal pages are entirely hardcoded Polish. This creates an inconsistent bilingual experience that breaks for users of either language.

---

## 1. Theming & Dark/Light Mode

### Architecture (Good)

The theming system is well-designed:

- **`globals.css`** — Complete HSL-based CSS variable system with `:root` (light) and `.dark` variants for all semantic tokens (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1–5).
- **`tailwind.config.ts`** — Maps all CSS vars to Tailwind classes using `hsl(var(--xxx))`. Uses `darkMode: ["class"]`.
- **`theme-provider.tsx`** — Clean `next-themes` wrapper with `attribute="class"`, `defaultTheme="system"`, `enableSystem`.
- **`theme-toggle.tsx`** — Dropdown with mounted-state hydration guard. Has `aria-label`. Clean.
- **`layout.tsx`** — `suppressHydrationWarning` on `<html>` to prevent theme flash warnings.

Most components properly use semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, etc.).

### Issues

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| T-1 | **High** | `components/animated-diagram-demo.tsx` | ~40–80 | `NODES` array uses hardcoded hex colors (`#3b82f6`, `#f59e0b`, `#22c55e`, `#a855f6`, `#ef4444`) that don't respond to theme changes. In dark mode these look acceptable but aren't semantic. | Replace with CSS variable references or Tailwind color tokens passed through className. |
| T-2 | **High** | `components/dashboard-charts.tsx` | 18–30, 148 | `PROVIDER_COLORS`, `STATUS_COLORS`, `CHART_COLORS` are all hardcoded hex. Recharts `Tooltip` uses inline `backgroundColor: 'hsl(var(--card))'` (good) but all data colors are static. | Define chart color tokens as CSS variables (already have `--chart-1` through `--chart-5` in globals.css but they're unused here). Use `hsl(var(--chart-N))`. |
| T-3 | **Medium** | `components/diagram/labeled-edge.tsx` | 26–30 | `TYPE_STROKE` uses hardcoded fixed HSL/hex values (`hsl(221 83% 53%)`, `#9ca3af`, `#3b82f6`). These don't adapt to theme. | Use `hsl(var(--primary))` for flow, `hsl(var(--muted-foreground))` for dependency, `hsl(var(--chart-1))` for peering. |
| T-4 | **Low** | `components/diagram/custom-nodes.tsx` | ~470–480 | Provider border colors (`border-l-orange-500`, `border-l-blue-500`, `border-l-red-500`) are hardcoded. | Acceptable — these are cloud provider brand colors. No change needed. |
| T-5 | **Low** | `components/logo.tsx` | 30–38 | SVG styles use hardcoded `fill: #2563eb` for blue accents and `fill: currentColor` for dark parts. | Acceptable — brand identity. The `currentColor` usage ensures the dark portion adapts to theme. |

---

## 2. Responsiveness

### Architecture (Good)

- Landing page uses responsive breakpoints: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Dashboard uses `md:grid-cols-2`, `lg:grid-cols-3` grids with Suspense
- Cookie consent uses `flex-col sm:flex-row`
- Loading skeleton adapts with `md:grid-cols-2 lg:grid-cols-3`

### Issues

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| R-1 | **High** | `app/projects/[id]/page.tsx` | entire | The diagram canvas (ReactFlow) has no mobile adaptation. ReactFlow is inherently desktop-focused. No touch gesture handling, no mobile toolbar layout, no responsive breakpoint to show a "not supported on mobile" message. | Add a responsive check: show a message on small screens suggesting desktop use, or implement a simplified mobile view. |
| R-2 | **High** | `components/diagram/toolbar.tsx` | entire (637 lines) | The toolbar has 20+ buttons/actions in a single horizontal row. No overflow handling, no collapsing into a "more" menu on narrow viewports. | Implement a responsive toolbar with priority-based overflow into a dropdown menu. |
| R-3 | **Medium** | `components/diagram/node-config-panel.tsx` | entire (3140 lines) | Side panel for node configuration has no mobile layout. On narrow screens it would overlay the entire canvas. | Use a Sheet/drawer pattern on mobile (already uses Sheet in version-history.tsx — apply same pattern). |
| R-4 | **Medium** | `components/diagram/component-palette.tsx` | entire | Fixed sidebar for component palette. No responsive collapse. | Add a collapsible drawer or bottom sheet for mobile. |
| R-5 | **Low** | `app/privacy/page.tsx`, `app/terms/page.tsx` | entire | Long legal text pages use `max-w-3xl mx-auto` and `prose` class — responsive, but no table of contents or anchor links for navigation on mobile. | Consider adding an on-page TOC for long legal documents. |

---

## 3. Accessibility (a11y)

### Architecture (Good)

- `app/login/page.tsx` — Excellent: `aria-invalid`, `aria-describedby` on inputs, `role="alert"` on error messages, `aria-label` on password visibility toggle.
- `components/theme-toggle.tsx` — `aria-label="Toggle theme"`.
- `components/logo.tsx` — `aria-label="JobStack"` on both SVG variants.
- `components/language-switcher.tsx` — `sr-only` text: "Switch language".
- `components/project-card/index.tsx` — `aria-label` on links, `sr-only` on menu triggers.
- `components/diagram/component-palette.tsx` — aria-labels on filter buttons.
- `app/not-found.tsx`, `app/error.tsx` — Semantic heading hierarchy.

### Issues

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| A-1 | **High** | `components/diagram/custom-nodes.tsx` | ~555 | Node action buttons (configure, duplicate, delete) are `<button>` elements with only icon children and no `aria-label`. Screen readers cannot identify their purpose. | Add `aria-label="Configure"`, `aria-label="Duplicate node"`, `aria-label="Delete node"` respectively. |
| A-2 | **High** | `components/diagram/node-config-panel.tsx` | multiple | Uses `prompt()` for adding tags and labels (e.g., custom tags, metadata labels). `prompt()` is not accessible: no screen reader announcement, no keyboard navigation, no customization. | Replace with inline form inputs or a small dialog component. |
| A-3 | **Medium** | `app/accept-terms/page.tsx` | ~80–100 | Uses raw `<input type="checkbox">` instead of the accessible shadcn `Checkbox` component. Missing `aria-describedby` linking to the terms text. | Switch to `<Checkbox>` from `@/components/ui/checkbox` with proper labeling. |
| A-4 | **Medium** | `components/diagram/custom-nodes.tsx` | ~755–780 (ContainerNode) | Container action buttons same issue as A-1 — icon-only buttons without aria-labels. | Same fix: add aria-labels. |
| A-5 | **Medium** | `components/diagram/custom-nodes.tsx` | ~820–843 (AttachmentNode) | Uses `title` attribute for tooltip but no `aria-label`. `title` is not reliably announced by screen readers. | Add `aria-label` in addition to `title`. |
| A-6 | **Medium** | `components/diagram/toolbar.tsx` | multiple | Many toolbar buttons use `title` attribute only. Some have proper labels, but inconsistent. | Audit all toolbar Button components and add consistent `aria-label` props. |
| A-7 | **Medium** | Multiple dialog components | — | After dialog close, focus doesn't explicitly return to the trigger element. While shadcn Dialog handles this internally, some custom `onClose` handlers may break focus restoration. | Verify focus returns to trigger after close for all dialog instances. |
| A-8 | **Low** | `components/dashboard-charts.tsx` | entire | Recharts PieChart/BarChart have no text alternatives. Screen readers cannot interpret the data. | Add `<title>` and `<desc>` in Recharts SVGs, or provide a data table fallback for screen reader users. |
| A-9 | **Low** | `app/page.tsx` | ~170–200 | Cloud provider logos section uses emoji text (☁️) and decorative SVG icons without alt text. | Add `aria-hidden="true"` on decorative elements, `role="img" aria-label="..."` on meaningful ones. |

---

## 4. Hydration Issues

### Architecture (Good)

The project handles hydration well in most cases:
- `lazy-animated-diagram.tsx` — `dynamic(() => import(...), { ssr: false })` ✓
- `theme-toggle.tsx` — mounted state pattern to avoid flash ✓
- `relative-time.tsx` — `suppressHydrationWarning` + client-only text rendering ✓
- `layout.tsx` — `suppressHydrationWarning` on `<html>` for theme class ✓

### Issues

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| H-1 | **Medium** | `app/dashboard/page.tsx` | ~30–40 | Uses `new Date().getHours()` in a server component to determine greeting (Good morning/afternoon/evening). The server time may differ from user's timezone. With ISR/caching, the greeting becomes stale. | Move greeting logic to a client component, or use `new Date().toLocaleTimeString()` with the user's timezone from headers. |
| H-2 | **Low** | `components/project-share-dialog.tsx` | ~179 | `typeof window !== 'undefined' ? window.location.origin + path : ''` — renders `""` on server, full URL on client. Since this is a `'use client'` component, SSR renders empty then hydrates with URL. Minor mismatch but `suppressHydrationWarning` is not applied. | Add `suppressHydrationWarning` to the `<span>`, or use a mounted-state pattern. |
| H-3 | **Low** | `app/sitemap.ts` | 4 | `new Date()` in sitemap — server-only, no hydration issue. Just noting that `lastModified` will be the build/request time, not actual content modification time. | Consider using actual content timestamps from database. |

---

## 5. Potential Console Errors

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| C-1 | **Medium** | `components/diagram/diagram-search.tsx` | ~127 | Uses `navigator.platform` which is **deprecated** and logs a console warning in Chrome 110+. | Use `navigator.userAgentData?.platform` with graceful fallback, or detect OS via `User-Agent` string parsing. |
| C-2 | **Medium** | `app/projects/[id]/page.tsx` | early lines | Uses `(navigator as any).userAgentData?.platform ?? navigator.platform` — better fallback but still triggers deprecation warning when the fallback executes. | Same as C-1. Also consider moving platform detection to a utility function to DRY this up. |
| C-3 | **Medium** | `hooks/use-realtime-collaboration.ts` | ~75–80 | `console.log(\`[Collab] ${name} joined\`)` and `console.log(\`[Collab] ${name} left\`)` — development logging left in production code. | Wrap in `if (process.env.NODE_ENV === 'development')` or use a debug logger. |
| C-4 | **Low** | `components/project-card/index.tsx` | ~65, ~140 | `console.error('Delete error:', error)` and `console.warn('Failed to copy diagrams...')` — error logging in component code. | Use a structured logging utility or error reporting service (Sentry). |
| C-5 | **Low** | `components/error-boundary.tsx` | ~20 | `process.env.NODE_ENV === 'development'` check on the client — works but the check itself is evaluated at build time for client bundles. If the build is production, the dev details are tree-shaken. This is correct behavior but potentially confusing. | No change needed — just noting for awareness. |

---

## 6. i18n Coverage

### Architecture

The i18n infrastructure is properly set up:
- **`next-intl`** plugin configured in `next.config.ts`
- **`lib/i18n.ts`** — Cookie-based locale detection, supports `en` and `pl`
- **`messages/en.json`** (209 lines) and **`messages/pl.json`** (209 lines) — Well-structured with matching keys
- **`layout.tsx`** — `<html lang={locale}>` dynamically set, `NextIntlClientProvider` wraps the app
- **`language-switcher.tsx`** — Sends POST to `/api/locale`, calls `router.refresh()`
- **`middleware.ts`** — Supabase session update (no locale routing — cookie-based instead)

### Coverage Analysis

The translation files cover: `common`, `nav`, `landing`, `auth`, `dashboard`, `settings`, `projects.editor`, `footer` — **but actual usage is minimal**.

| # | Severity | File | i18n Usage | Hardcoded Strings |
|---|----------|------|------------|-------------------|
| I-1 | **Critical** | `app/page.tsx` (landing) | Only `footer` section uses `t()` (4 calls) | Hero, stats bar, features (9 cards), cloud providers, feature tabs, pricing (3 tiers), GitHub CTA — ALL hardcoded English (~100+ strings) |
| I-2 | **Critical** | `components/cookie-consent.tsx` | None | Entirely hardcoded **Polish** — "Pliki cookies", "Używamy plików cookies...", "Tylko niezbędne", "Akceptuję wszystkie", "Zamknij" |
| I-3 | **Critical** | `app/privacy/page.tsx` | None | Entire page is hardcoded **Polish** GDPR policy (~200 lines) |
| I-4 | **Critical** | `app/terms/page.tsx` | None | Entire page is hardcoded **Polish** ToS (~200 lines) |
| I-5 | **High** | `app/dashboard/page.tsx` | None | Greeting, stats labels, quick action buttons, section titles, activity labels, analytics — all hardcoded English (~50+ strings) |
| I-6 | **High** | `app/settings/page.tsx` | Not verified full usage | Many section headers and labels appear hardcoded |
| I-7 | **High** | `app/projects/page.tsx` | None | "Your Projects", "New Project", "No projects yet" — hardcoded English |
| I-8 | **High** | `app/organizations/page.tsx` | None | Entirely hardcoded English |
| I-9 | **High** | `app/templates/page.tsx` | None | Entirely hardcoded English |
| I-10 | **High** | `app/demo/page.tsx` | None | Entirely hardcoded English |
| I-11 | **High** | ALL diagram components | None | toolbar.tsx, component-palette.tsx, node-config-panel.tsx, diagram-search.tsx, k8s-wizard.tsx, governance-wizard.tsx, quick-build-modal.tsx, template-dialog.tsx, code-preview-dialog.tsx, cost-sidebar.tsx — ALL hardcoded English |
| I-12 | **Medium** | `app/verify-email/page.tsx` | None | Hardcoded English |
| I-13 | **Medium** | `app/accept-terms/page.tsx` | None | Hardcoded English |
| I-14 | **Medium** | `components/version-history.tsx` | None | Hardcoded English |
| I-15 | **Medium** | `components/webhook-settings.tsx` | None | Hardcoded English |
| I-16 | **Medium** | `components/project-share-dialog.tsx` | None | Hardcoded English |
| I-17 | **Medium** | `components/landing/feature-tabs-data.tsx` | None | Tab titles and descriptions hardcoded English |
| I-18 | **Medium** | `components/animated-diagram-demo.tsx` | None | Phase labels, node names, cost labels — hardcoded English |

**Estimated i18n coverage: ~5% of user-facing strings.**
**Language inconsistency:** Legal pages + cookie banner = Polish; everything else = English. An English-speaking user sees a Polish cookie banner. A Polish-speaking user sees an English dashboard.

### Recommended Fix
1. **Phase 1 (Critical):** Translate the cookie banner, or make it bilingual using `useTranslations`.
2. **Phase 2 (Critical):** Create i18n versions of privacy and terms pages, or implement language-switching within them.
3. **Phase 3 (High):** Systematically replace hardcoded strings in all pages with `useTranslations()` / `getTranslations()` calls, adding keys to both en.json and pl.json.
4. **Phase 4 (Medium):** Translate diagram component strings — these can be lower priority since they're technical/domain-specific.

---

## 7. Performance

### Architecture (Good)

- `dashboard/page.tsx` — Excellent use of `<Suspense>` with individual loading fallbacks for each async section (DashboardStats, RecentActivity, ProjectsList, AnalyticsDashboard).
- `lazy-animated-diagram.tsx` — `dynamic(() => import(...), { ssr: false })` with skeleton fallback.
- `use-history.ts` — 300ms debounce + max 50 states cap.
- `custom-nodes.tsx` — All node components wrapped in `memo()`.
- `next.config.ts` — Proper security headers, CSP policy, image optimization config.

### Issues

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| P-1 | **High** | `components/diagram/node-config-panel.tsx` | all | **3,140 lines** in a single component file. This impacts: (a) bundle size for the diagram page, (b) developer maintainability, (c) HMR performance during development, (d) potential re-render overhead since config for 100+ component types is in one file. | Split into sub-components by provider or category: `NodeConfigAzure.tsx`, `NodeConfigAws.tsx`, `NodeConfigGcp.tsx`, `NodeConfigNetworking.tsx`, etc. Use dynamic imports to lazy-load per-provider config panels. |
| P-2 | **High** | `app/projects/[id]/page.tsx` | all (1,751 lines) | Massive client component with 20+ `useState` hooks, multiple `useEffect`, `useCallback` handlers, and inline sub-components. Every state change triggers reconciliation against this entire tree. | Extract sub-components: `DiagramToolbar`, `DiagramSidebar`, `DiagramCanvas`, `DiagramPanels`. Use `memo` on extracted components. Consider Zustand/Jotai for shared diagram state. |
| P-3 | **Medium** | `components/diagram/quick-build-modal.tsx` | 1–200 | 568 lines with large inline pattern definition arrays. These static data arrays are re-created on every render. | Extract pattern definitions to a separate `patterns.ts` file as module-level constants. |
| P-4 | **Medium** | `components/diagram/toolbar.tsx` | all (637 lines) | Large component with many inline handlers. | Extract into `ToolbarActions`, `ToolbarZoom`, `ToolbarExport` sub-components. |
| P-5 | **Medium** | `app/page.tsx` (landing) | ~30–150 | 9 feature cards, pricing tiers, and cloud provider logos are defined inline as arrays. Large SVGs and animations load eagerly on the landing page. | Consider lazy-loading below-the-fold content (pricing section, feature tabs) with `Suspense` + dynamic imports. |
| P-6 | **Low** | `components/diagram/k8s-wizard.tsx` | ~42–70 | 3 large VM size arrays (AKS, EKS, GKE) defined at module level — fine since they're constants. Same for `quick-build-modal.tsx` pattern arrays. | No change needed — module-level constants are evaluated once. |

---

## 8. State Management

### Architecture

The project uses **no global state management library**. State is managed through:
- React `useState` / `useReducer` in local components
- Supabase client for data fetching
- Supabase Realtime (Presence) for collaboration
- Custom hooks: `useHistory`, `useRealtimeCollaboration`, `useCustomComponents`, `useToast`

### Issues

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| S-1 | **High** | `app/projects/[id]/page.tsx` | entire | 20+ independent `useState` calls for: nodes, edges, selected node, AI panel, compliance panel, testing panel, multi-cloud panel, K8s wizard, governance wizard, save status, collaborators, etc. This causes: (a) potential render cascades, (b) difficulty tracking state dependencies, (c) complex prop drilling to child components. | Introduce a state management library (Zustand recommended for React Flow projects) with a diagram store: `useDiagramStore()` combining nodes, edges, panels, selection state. |
| S-2 | **Medium** | `components/webhook-settings.tsx` | ~67 | `const supabase = createClient()` called at component body level (not inside effect or callback). While Supabase client memoizes internally, this creates a new reference each render, causing `useEffect` and `useCallback` dependency issues. | Move `createClient()` into a `useMemo` or use a singleton pattern via context provider. |
| S-3 | **Medium** | `components/project-share-dialog.tsx` | ~55 | Same issue as S-2: `const supabase = createClient()` at component level. `loadShares` has `supabase` in its dependency array, potentially causing infinite re-fetch loops. | Same fix as S-2. |
| S-4 | **Low** | `hooks/use-history.ts` | ~46 | `currentIndexRef` kept in sync with state via `currentIndexRef.current = currentIndex` at render time. This is a known pattern but can cause stale closures if `pushState` is called during the same render cycle. | The 300ms debounce mitigates this. No immediate change needed. |

---

## 9. Landing Page Quality

### Strengths

- **Professional layout:** Hero → animated demo → stats bar → cloud providers → feature tabs → feature cards → GitHub CTA → pricing → CTA → footer.
- **Animation quality:** `framer-motion` AnimatePresence on feature tabs, auto-cycling animated diagram demo with 3 phases (diagram/terraform/cost), smooth transitions.
- **Code preview:** Feature tabs show actual HCL/YAML code with syntax highlighting (custom inline highlighter).
- **Social proof:** Stats bar (components, providers, export formats, users).
- **Clear CTAs:** "Get Started Free" and "View Demo" above the fold.
- **Pricing clarity:** Free ($0), Pro ($19/mo), Enterprise (Custom) with clear feature differentiation.
- **SEO:** Proper metadata, OpenGraph tags, Twitter cards, robots config, sitemap.
- **Security:** Strong CSP, X-Frame-Options: DENY, referrer policy, permissions policy.

### Issues

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| L-1 | **Critical** | `app/page.tsx` | entire | Landing page strings are ~99% hardcoded English despite `en.json` having full translation keys for `landing.hero`, `landing.features`, `landing.cta`. The `getTranslations()` call only fetches `footer` translations. | Change `getTranslations('footer')` to fetch `landing` and `footer` namespaces, then replace all hardcoded strings with `t()` calls. |
| L-2 | **Medium** | `app/page.tsx` | ~20–24 | Beta banner: `"🚀 Beta — v0.3.0 is live!"` with hardcoded yellow/amber colors outside the theme system. | Use semantic colors or remove after beta period. Also translate the text. |
| L-3 | **Medium** | `app/page.tsx` | ~160–200 | Cloud provider section uses hardcoded "Azure", "AWS", "GCP" with static counts ("35+ Azure", "30+ AWS", etc.). These counts may become stale. | Derive counts from the actual component catalog: `COMPONENT_CATALOG.filter(c => c.provider === 'azure').length`. |
| L-4 | **Low** | `components/landing/feature-tabs.tsx` | entire | Good animation quality. No issues found. | — |
| L-5 | **Low** | `components/landing/code-highlighter.tsx` | entire | Inline syntax highlighter with hardcoded `zinc-*` classes for code tokens. This is appropriate for code display and doesn't need to follow the theme. | No change needed. |

---

## 10. Legal Pages (GDPR/RODO)

### Strengths

- **Comprehensive privacy policy** (`privacy/page.tsx`): Covers data controller (KobeCloud Jakub Pospieszny), data scope, legal basis (Art. 6), purposes, retention periods, recipients, international transfers (Standard Contractual Clauses), full user rights (access, rectification, erasure, restriction, portability, objection, complaint to UODO), cookies table, security measures.
- **Comprehensive terms of service** (`terms/page.tsx`): Covers definitions, service description, technical requirements, registration, user obligations, IP rights, liability limitations, 14-day withdrawal right (consumer protection), complaints procedure, dispute resolution.
- **Cookie consent banner** (`cookie-consent.tsx`): Two-option consent (necessary only / accept all), persisted to localStorage with timestamp, custom event dispatch for other components, links to privacy policy.
- **GDPR features in settings** (`settings/page.tsx`): Art. 20 data export button, Art. 17 right to erasure with 7-day grace period, deletion scheduling.
- **AS-IS disclaimer** in code preview dialog and accept-terms page.

### Issues

| # | Severity | File | Line(s) | Issue | Recommended Fix |
|---|----------|------|---------|-------|-----------------|
| G-1 | **Critical** | `app/privacy/page.tsx` | entire | Privacy policy is written entirely in Polish with no language detection or i18n. English-speaking users cannot read their rights. Under GDPR Art. 12, information must be provided "in a concise, transparent, intelligible and easily accessible form, using clear and plain language." | Create English translation. Use `getTranslations()` or maintain separate language versions with dynamic selection. |
| G-2 | **Critical** | `app/terms/page.tsx` | entire | Same as G-1: Terms entirely in Polish. | Same fix. |
| G-3 | **Critical** | `components/cookie-consent.tsx` | entire | Cookie banner text is entirely in Polish ("Pliki cookies", "Używamy plików cookies...", "Tylko niezbędne", "Akceptuję wszystkie"). English-speaking users cannot give informed consent. Under ePrivacy Directive, consent must be informed. | Use `useTranslations()` for all banner strings. Add corresponding keys to en.json and pl.json. |
| G-4 | **Medium** | `app/accept-terms/page.tsx` | ~80–100 | Uses raw `<input type="checkbox">` for T&C acceptance. Not only an a11y issue (A-3) but also a legal UX issue — the checkbox should be clearly linked to the specific terms text. | Use labeled Checkbox component with explicit `aria-describedby`. |
| G-5 | **Medium** | `components/cookie-consent.tsx` | ~60–65 | Cookie consent stores choice in `localStorage` which is good for persistence but has no server-side awareness. The consent choice is also not sent to any analytics endpoint. | This is actually correct for a cookie-less first approach. No change needed. |
| G-6 | **Low** | `app/sitemap.ts` | entire | Sitemap doesn't include `/demo` page. | Add demo page to sitemap if it should be discoverable. |

---

## Ranked Issue List

### Critical (Must Fix)

| ID | Category | Summary |
|----|----------|---------|
| I-1 | i18n | Landing page has translation keys in JSON but doesn't use them — ~100+ hardcoded English strings |
| I-2 | i18n | Cookie consent banner is entirely hardcoded Polish |
| G-1 | Legal | Privacy policy is Polish-only — GDPR Art. 12 compliance risk |
| G-2 | Legal | Terms of service is Polish-only |
| G-3 | Legal | Cookie consent Polish-only — ePrivacy informed consent issue |
| I-3/I-4 | i18n | Legal pages have no language switching |

### High (Should Fix Soon)

| ID | Category | Summary |
|----|----------|---------|
| P-1 | Performance | `node-config-panel.tsx` is 3,140 lines — needs splitting |
| P-2 | Performance | `projects/[id]/page.tsx` is 1,751 lines — needs decomposition |
| S-1 | State | 20+ useState in diagram page — needs state management library |
| T-1 | Theming | Animated diagram demo uses hardcoded hex colors |
| T-2 | Theming | Dashboard charts ignore CSS variable theme tokens |
| R-1 | Responsive | No mobile handling for diagram canvas |
| R-2 | Responsive | Toolbar overflows on narrow screens |
| A-1 | a11y | Diagram node action buttons lack aria-labels |
| A-2 | a11y | `prompt()` used for UX — not accessible |
| I-5→I-11 | i18n | Dashboard, settings, projects, orgs, templates, demo, all diagram components hardcoded English |

### Medium (Plan to Fix)

| ID | Category | Summary |
|----|----------|---------|
| H-1 | Hydration | Server-rendered greeting based on server time may be stale |
| C-1/C-2 | Console | Deprecated `navigator.platform` usage |
| C-3 | Console | `console.log` in production (realtime collaboration) |
| A-3 | a11y | accept-terms uses raw checkbox without proper labeling |
| A-4/A-5 | a11y | Container/Attachment nodes lack aria-labels |
| A-6 | a11y | Toolbar button accessibility inconsistent |
| A-7 | a11y | Focus management after dialog close not verified |
| T-3 | Theming | Edge stroke colors hardcoded |
| R-3/R-4 | Responsive | Config panel & palette not mobile-friendly |
| S-2/S-3 | State | `createClient()` called at render time |
| P-3/P-4/P-5 | Performance | Large components that could be split |

### Low (Nice to Have)

| ID | Category | Summary |
|----|----------|---------|
| A-8 | a11y | Charts have no text alternatives for screen readers |
| A-9 | a11y | Decorative icons on landing page missing aria-hidden |
| H-2 | Hydration | Minor SSR/client URL mismatch in share dialog |
| C-4/C-5 | Console | Error logging in components; ENV check on client |
| T-4/T-5 | Theming | Brand colors hardcoded (acceptable) |
| R-5 | Responsive | Long legal pages lack TOC navigation |
| G-6 | Legal | Sitemap missing demo page |

---

## Overall Assessment

### Strengths
1. **Solid architectural foundation** — The theming system (HSL variables + Tailwind + next-themes) is well-designed and most components use semantic tokens correctly.
2. **Security-conscious** — CSP headers, X-Frame-Options, Permissions-Policy, Referrer-Policy all properly configured. Supabase RLS for data access.
3. **Good loading UX** — Suspense boundaries with skeleton fallbacks throughout the dashboard.
4. **Professional landing page** — Clean design, smooth animations, clear value proposition and pricing.
5. **Feature-rich diagram editor** — 155+ cloud components, 3 providers, connection validation, real-time collaboration, version history, undo/redo, multiple export formats.
6. **GDPR infrastructure** — Data export (Art. 20), account deletion (Art. 17), cookie consent, privacy policy.

### Weaknesses
1. **i18n is architecturally complete but practically unused** — The biggest systemic issue. Only ~5% of strings use the translation system. Cookie consent is Polish while UI is English, creating a jarring bilingual experience.
2. **Mega-components** — `node-config-panel.tsx` (3,140 lines), `projects/[id]/page.tsx` (1,751 lines), and `custom-nodes.tsx` (843 lines) are difficult to maintain and impact performance.
3. **No mobile diagram experience** — The core value proposition (visual cloud architect) has no mobile accommodation.
4. **Legal language mismatch** — Privacy/terms in Polish, UI in English. GDPR compliance risk for non-Polish users.

### Recommended Priority
1. **Immediate:** Fix cookie consent to be bilingual (G-3, I-2)
2. **This sprint:** Wire landing page to existing translation keys (I-1, L-1)
3. **Next sprint:** Create English privacy/terms pages (G-1, G-2)
4. **Ongoing:** Systematically add `useTranslations()` to all pages during regular feature work
5. **Architecture improvement:** Split mega-components, introduce diagram state management

---

*End of audit report. Total files analyzed: 60+. Total findings: 29 unique issues.*
