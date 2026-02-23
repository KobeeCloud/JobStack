# AUDIT #4 — Forensic Database & Data-Access Layer Audit

**Date:** 2025-02-22
**Role:** Principal Data Architect / Lead Security Engineer / Senior DBA
**Scope:** Complete Supabase PostgreSQL schema, 53 RLS policies, 29 API routes, 4 SECURITY DEFINER functions, all data-access hooks
**Schema version:** 4.0 (idempotent)

---

## Executive Summary

This audit uncovered **5 CRITICAL**, **7 HIGH**, **10 MEDIUM**, and **4 LOW** severity findings across multi-tenancy isolation, constraint integrity, schema optimization, and SLA readiness. The most dangerous finding is that **any authenticated user can create projects under any organization** due to an RLS policy logic flaw. Multiple API routes reference non-existent database columns, causing runtime errors. Diagram version history is completely inaccessible for organization projects.

---

## TABLE OF CONTENTS

1. [CRITICAL DATA LEAKS & ACCESS CONTROL FAILURES](#1-critical-data-leaks--access-control-failures)
2. [CONSTRAINT & CONFLICT BUGS](#2-constraint--conflict-bugs)
3. [SLA BLOCKERS & AVAILABILITY RISKS](#3-sla-blockers--availability-risks)
4. [SCHEMA REFACTORING & OPTIMIZATION](#4-schema-refactoring--optimization)
5. [FULL FINDING INVENTORY](#5-full-finding-inventory)
6. [REMEDIATION PRIORITY MATRIX](#6-remediation-priority-matrix)

---

## 1. CRITICAL DATA LEAKS & ACCESS CONTROL FAILURES

### CRITICAL-001: Any User Can Create Projects Under Any Organization

**File:** `supabase/schema.sql` (line ~476) + `app/api/projects/route.ts` (line ~65)
**Severity:** 🔴 CRITICAL — Cross-tenant data injection

The RLS INSERT policy on `projects` has a fatal logic flaw:

```sql
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
);
```

Since the API always sets `user_id: auth.user.id`, the first condition (`user_id = auth.uid()`) **always evaluates to TRUE**. The OR clause is never reached, meaning the `organization_id` is never validated.

**Attack vector:**
```bash
curl -X POST /api/projects \
  -H "Authorization: Bearer <any-valid-jwt>" \
  -d '{"name":"spy","organization_id":"<victim-org-uuid>"}'
```

The project is created under the victim organization. RLS SELECT policy then allows all org members to see it, potentially causing data confusion or social engineering attacks.

**Fix required:** Change the RLS policy to a conjunctive check:
```sql
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
        organization_id IS NULL
        OR public.is_org_admin_or_owner(organization_id, auth.uid())
    )
);
```

---

### CRITICAL-002: Organizations API References Non-Existent `plan` Column

**Files:**
- `app/api/organizations/route.ts` — GET selects `plan`, POST inserts `plan: 'free'`
- `supabase/schema.sql` — Column is `subscription_tier`, not `plan`

The organizations GET route queries:
```typescript
organizations!organization_id ( id, name, slug, plan, max_members )
```

And POST inserts:
```typescript
.insert({ name, slug, ..., plan: 'free', max_members: 5 })
```

But the schema defines `subscription_tier subscription_tier DEFAULT 'enterprise'` — there is NO `plan` column.

**Impact:**
- PostgREST returns HTTP 400 for `.select()` with unknown column → **organization listing is broken**
- POST insert with unknown column → **organization creation fails**
- These are runtime crashes invisible without integration tests

**Fix:** Replace `plan` with `subscription_tier` in both GET and POST.

---

### CRITICAL-003: Diagram Versions RLS Missing Organization Access

**File:** `supabase/schema.sql` (lines ~540-560)
**Severity:** 🔴 CRITICAL — Feature completely broken for org projects

All three `diagram_versions` RLS policies only check personal ownership:

```sql
CREATE POLICY "diagram_versions_select" ON public.diagram_versions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = diagram_versions.diagram_id AND p.user_id = auth.uid()
    )
);
```

**Missing:** No `OR EXISTS (... p.organization_id IS NOT NULL AND is_org_member(...))` clause.

**Impact:** Organization members cannot:
- View version history on org project diagrams
- Create new versions (save snapshots)
- Restore previous versions

This silently breaks the entire version history feature for org-scoped projects.

---

### CRITICAL-004: GET /api/projects Filters Out Organization Projects

**File:** `app/api/projects/route.ts` (line ~16)
**Severity:** 🔴 CRITICAL — Org projects invisible in dashboard

```typescript
const { data: projects, error, count } = await auth.supabase
  .from('projects')
  .select('*', { count: 'exact' })
  .eq('user_id', auth.user.id)  // ← KILLS ORG PROJECTS
```

The RLS SELECT policy correctly includes org projects:
```sql
user_id = auth.uid() OR (organization_id IS NOT NULL AND is_org_member(organization_id, auth.uid()))
```

But the API adds `.eq('user_id', auth.user.id)` which **removes** all org projects where the user is a member but not the creator. The dashboard never shows organization-scoped projects.

**Fix:** Remove `.eq('user_id', auth.user.id)` and let RLS handle scoping, or add org-aware filter:
```typescript
.or(`user_id.eq.${auth.user.id},organization_id.not.is.null`)
```

---

### CRITICAL-005: Audit Log API References Wrong Column Names

**File:** `app/api/audit/route.ts` (lines ~16-25)
**Severity:** 🔴 CRITICAL — Audit log API completely broken

The API selects:
```typescript
.select(`
    id, action, entity_type, entity_id, metadata, ip_address, created_at,
    actor:profiles!user_id ( id, email, full_name, avatar_url )
`)
```

But the schema defines:
```sql
resource_type TEXT NOT NULL,
resource_id UUID,
```

`entity_type` and `entity_id` **do not exist** → PostgREST returns HTTP 400.

**Fix:** Replace `entity_type` → `resource_type`, `entity_id` → `resource_id`.

---

## 2. CONSTRAINT & CONFLICT BUGS

### HIGH-001: PUT/DELETE on Projects Blocks Org Admins

**File:** `app/api/projects/[id]/route.ts` (lines ~80, ~103)

Both PUT and DELETE add `.eq('user_id', auth.user.id)`:
```typescript
.update({ ...body }).eq('id', projectId).eq('user_id', auth.user.id)
```

RLS UPDATE policy allows `is_org_admin_or_owner(organization_id, auth.uid())`, but the API filter prevents it. Org admins receive a silent failure (no rows updated) or 404.

---

### HIGH-002: Organizations UPDATE RLS Conflicts With API Admin Check

**File:** `supabase/schema.sql` (line ~378) vs `app/api/organizations/[id]/route.ts` (line ~80)

- RLS: `UPDATE USING (owner_id = auth.uid())` — **only owner**
- API: `['owner', 'admin'].includes(membership.role)` — allows admins

If an admin passes the API check, the `.update()` quietly returns 0 rows because RLS blocks it. The API then throws 500.

**Fix:** Either update RLS to match API (allow admins), or restrict API to owner-only.

---

### HIGH-003: Templates RLS Ignores organization_id

**File:** `supabase/schema.sql` (lines ~569-572)

```sql
CREATE POLICY "templates_select" ON public.templates FOR SELECT
    USING (is_public = true OR created_by = auth.uid());
```

Templates have `organization_id` column, but RLS completely ignores it. A private org template (`is_public = false`) is visible ONLY to the creator, not to other org members.

---

### HIGH-004: Exports RLS Missing Organization Access

**File:** `supabase/schema.sql` (lines ~585-600)

Exports RLS checks `p.user_id = auth.uid()` but never checks org membership. Org members who create exports on org projects (where they're not the `user_id`) can't read them back.

---

### HIGH-005: Diagram Version Number Race Condition (TOCTOU)

**File:** `app/api/diagrams/versions/route.ts` (lines ~55-68)

```typescript
const { data: latest } = await supabase
    .from('diagram_versions')
    .select('version_number')
    .eq('diagram_id', diagramId)
    .order('version_number', { ascending: false })
    .limit(1).single()
const nextVersion = (latest?.version_number || 0) + 1
// ... INSERT with nextVersion
```

Two concurrent requests read the same `latest`, both compute the same `nextVersion`, one fails with `UNIQUE(diagram_id, version_number)` violation → unhandled 500 error.

**Fix:** Use a database sequence or `SELECT MAX(...) + 1` inside the INSERT:
```sql
INSERT INTO diagram_versions (diagram_id, version_number, ...)
SELECT $1, COALESCE(MAX(version_number), 0) + 1, ...
FROM diagram_versions WHERE diagram_id = $1;
```

---

### HIGH-006: Overly Broad GRANT SELECT to `anon` Role

**File:** `supabase/schema.sql` (lines ~802-804)

```sql
GRANT SELECT ON public.diagram_versions TO anon;
GRANT SELECT ON public.custom_components TO anon;
```

Anonymous (unauthenticated) users are granted SELECT on `diagram_versions` and `custom_components`. While RLS should protect the data, if RLS were accidentally disabled during maintenance, all version history and custom components would be publicly readable.

`custom_components` has `is_shared = true` condition in RLS which is intentional for shared components. But `diagram_versions` should NOT be accessible to anon users — there's no public-facing use case.

---

### HIGH-007: SECURITY DEFINER Functions Leak Organization Membership

**File:** `supabase/schema.sql` (lines ~365-395)

Functions `is_org_member()`, `get_org_role()`, `is_org_owner()`, `is_org_admin_or_owner()` are `SECURITY DEFINER` — they execute with the function owner's (postgres) privileges.

Combined with `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated`:

```sql
-- Any authenticated user can probe any org's membership:
SELECT public.is_org_member('target-org-id', 'target-user-id');
-- Returns TRUE/FALSE → leaks membership info
SELECT public.get_org_role('target-org-id', 'target-user-id');
-- Returns 'owner'/'admin'/'member'/'viewer' → leaks role info
```

**Fix:** Remove `GRANT EXECUTE ... TO anon` for these functions. They should only be callable from RLS policy evaluation context, not directly:
```sql
REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_role(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_owner(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_admin_or_owner(UUID, UUID) FROM anon;
```

---

## 3. SLA BLOCKERS & AVAILABILITY RISKS

### MEDIUM-001: No Optimistic Locking on Diagram Updates

**Files:** `app/api/diagrams/[id]/route.ts`, `hooks/use-realtime-collaboration.ts`

Diagram saves use simple `UPDATE ... SET nodes = $1` with no concurrency control. Two collaborators editing simultaneously → **last-write-wins, data loss**.

The realtime collaboration hook broadcasts changes via Supabase Presence (client-side), but there's no server-side conflict detection. No `updated_at` check, no version counter, no `IF-MATCH` header.

**Recommendation:** Add `version` column to `diagrams` table. On update, require `WHERE version = $expected` and increment, returning 409 on mismatch.

---

### MEDIUM-002: Inconsistent Auth Patterns (13 of 29 Routes)

**Affected routes using manual auth (no `createApiHandler`):**
| Route | Issues |
|-------|--------|
| `organizations/[id]/invites/route.ts` | No rate limit, no Zod validation, no structured errors |
| `organizations/[id]/invites/[inviteId]/route.ts` | Same |
| `invites/accept/[token]/route.ts` | Same |
| `webhooks/route.ts` | Same |
| `webhooks/[id]/route.ts` | Same |
| `diagrams/versions/route.ts` | Same — no access check beyond auth |
| `diagrams/versions/[id]/restore/route.ts` | Same — no ownership verification |
| `user/delete/route.ts` | Same |
| `user/export/route.ts` | Same |
| `user/email-preferences/route.ts` | Same |
| `custom-components/route.ts` | Same |
| `custom-components/[id]/route.ts` | Same |
| `locale/route.ts` | No auth at all (intentional for locale) |

These routes miss: rate limiting, structured `ApiError` responses, centralized logging, Zod body validation, and consistent error formatting.

---

### MEDIUM-003: activity_log Unbounded — No Partitioning or TTL

**File:** `supabase/schema.sql` (lines ~265-275)

`activity_log` is append-only with no cleanup mechanism. At scale:
- Table bloat → sequential scan on cold pages
- Index `idx_activity_log_created` grows unbounded
- No partition scheme (e.g., monthly `PARTITION BY RANGE (created_at)`)
- No scheduled job to purge old entries

**Recommendation:** Add time-based partitioning or a background job with retention policy (e.g., 90 days).

---

### MEDIUM-004: Cascade Deletes Are Silent Nuclear Buttons

**File:** `supabase/schema.sql` — All FK constraints use `ON DELETE CASCADE`

Deleting ONE organization cascades through:
- `organization_members` → all members removed
- `organization_invites` → all invites removed
- `projects` → all org projects, which cascade to:
  - `diagrams` → `diagram_versions`
  - `project_shares`
  - `exports`
  - `project_tags`
- `custom_components` → all org components
- `activity_log` → all org logs
- `webhooks` → all org webhooks

**No soft-delete, no confirmation period, no audit trail.** A single API call can wipe an organization's entire history.

---

### MEDIUM-005: Soft-Deleted Profiles Not Enforced

**File:** `supabase/schema.sql` — `profiles.deleted_at` column exists but is never checked

- No RLS clause: `WHERE deleted_at IS NULL`
- No API middleware to block soft-deleted users
- No scheduled job to process `deletion_scheduled_for`
- A "deleted" user can still log in and use the entire app

---

### MEDIUM-006: Project Tags RLS Blocks Org Admins

**File:** `supabase/schema.sql` (lines ~675-694)

INSERT/UPDATE/DELETE policies only check `p.user_id = auth.uid()`. Org admins cannot manage tags on org projects they didn't create.

---

### MEDIUM-007: GRANT ALL to `authenticated` is Overly Broad

**File:** `supabase/schema.sql` (line ~801)

```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

This gives every authenticated user INSERT, UPDATE, DELETE on ALL tables. Security relies entirely on RLS. If RLS is accidentally disabled on any table during maintenance, all data is exposed. It would be safer to grant per-table minimum privileges.

---

### MEDIUM-008: Version Restore Has No Access Verification

**File:** `app/api/diagrams/versions/[id]/restore/route.ts`

The restore endpoint:
1. Authenticates the user ✓
2. Reads version by ID (RLS filters by personal ownership)
3. Updates the diagram with version data

But since `diagram_versions` RLS is broken for org projects (CRITICAL-003), and there's no application-level access check, this route is completely broken for org users.

---

### MEDIUM-009: `user/export` Uses String Interpolation in `.or()`

**File:** `app/api/user/export/route.ts` (line ~59)

```typescript
.or(`invited_by.eq.${user.id},email.eq.${user.email}`)
```

Email addresses can contain characters that break PostgREST filter syntax (e.g., commas, parentheses). While Supabase parameterizes internally, this pattern is fragile.

**Fix:** Use separate queries or Supabase filter builder:
```typescript
.or(`invited_by.eq.${user.id},email.eq.${user.email?.replace(/[,()]/g, '')}`)
```

---

### MEDIUM-010: Custom Components GET No Membership Validation

**File:** `app/api/custom-components/route.ts` (lines ~4-30)

GET accepts `organization_id` from query params and queries without verifying caller's membership. RLS protects (returns empty set for non-members), but:
- No 403 response for unauthorized access attempts
- Reveals the table exists via empty 200 response
- Inconsistent with POST which explicitly checks membership

---

## 4. SCHEMA REFACTORING & OPTIMIZATION

### LOW-001: Redundant Indexes on UNIQUE Columns

**File:** `supabase/schema.sql` (lines ~306-310)

```sql
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
-- ↑ Redundant: organizations.slug has UNIQUE constraint → implicit index

CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.organization_invites(token);
-- ↑ Redundant: organization_invites.token has UNIQUE constraint → implicit index
```

These waste disk space and slow down writes with no query benefit.

---

### LOW-002: Missing Composite Indexes for Common Query Patterns

Current indexes are single-column. High-frequency queries need composites:

| Query Pattern | Current Index | Needed Index |
|---------------|--------------|--------------|
| `projects WHERE user_id = ? ORDER BY updated_at DESC` | `idx_projects_user_id(user_id)` | `(user_id, updated_at DESC)` |
| `diagrams WHERE project_id = ? ORDER BY updated_at DESC` | `idx_diagrams_project_id(project_id)` | `(project_id, updated_at DESC)` |
| `notifications WHERE user_id = ? ORDER BY created_at DESC` | `idx_notifications_user(user_id)` | `(user_id, created_at DESC)` |
| `webhooks WHERE user_id = ? ORDER BY created_at DESC` | `idx_webhooks_user_id(user_id)` | `(user_id, created_at DESC)` |

---

### LOW-003: JSONB Columns Have No Size Constraints

`nodes`, `edges`, `viewport`, `default_config`, `connection_rules`, `settings`, `metadata` — all JSONB with no DB-level size limits.

Only `diagrams` routes enforce 10MB at API level. All other JSONB columns accept unlimited data.

**Recommendation:** Add CHECK constraints:
```sql
ALTER TABLE diagrams ADD CONSTRAINT chk_nodes_size CHECK (pg_column_size(nodes) < 10485760);
```

---

### LOW-004: No Retry/Dead-Letter for Failed Webhooks

`webhooks.failure_count` exists but no mechanism to:
- Retry failed deliveries with exponential backoff
- Disable webhooks after N failures
- Alert webhook owners about failures
- Dead-letter queue for inspection

---

## 5. FULL FINDING INVENTORY

| ID | Severity | Category | Title | File(s) |
|----|----------|----------|-------|---------|
| CRITICAL-001 | 🔴 | Tenancy | Any user can create projects in any org | schema.sql, projects/route.ts |
| CRITICAL-002 | 🔴 | Schema | `plan` column doesn't exist in organizations | organizations/route.ts |
| CRITICAL-003 | 🔴 | Tenancy | Diagram versions RLS missing org access | schema.sql |
| CRITICAL-004 | 🔴 | API | GET /api/projects filters out org projects | projects/route.ts |
| CRITICAL-005 | 🔴 | API | Audit log API references wrong column names | audit/route.ts |
| HIGH-001 | 🟠 | API | PUT/DELETE projects blocks org admins | projects/[id]/route.ts |
| HIGH-002 | 🟠 | RLS/API | Org UPDATE RLS conflicts with API admin check | schema.sql, organizations/[id]/route.ts |
| HIGH-003 | 🟠 | RLS | Templates RLS ignores organization_id | schema.sql |
| HIGH-004 | 🟠 | RLS | Exports RLS missing org access | schema.sql |
| HIGH-005 | 🟠 | Race | Version number TOCTOU race condition | diagrams/versions/route.ts |
| HIGH-006 | 🟠 | AuthZ | Overly broad GRANT SELECT to anon | schema.sql |
| HIGH-007 | 🟠 | AuthZ | SECURITY DEFINER functions leak membership | schema.sql |
| MEDIUM-001 | 🟡 | SLA | No optimistic locking on diagram updates | diagrams/[id]/route.ts |
| MEDIUM-002 | 🟡 | Code | 13/29 routes bypass createApiHandler | Multiple files |
| MEDIUM-003 | 🟡 | SLA | activity_log unbounded, no TTL | schema.sql |
| MEDIUM-004 | 🟡 | SLA | Cascade deletes wipe entire org data | schema.sql |
| MEDIUM-005 | 🟡 | AuthZ | Soft-deleted profiles not enforced | schema.sql, middleware |
| MEDIUM-006 | 🟡 | RLS | Project tags RLS blocks org admins | schema.sql |
| MEDIUM-007 | 🟡 | AuthZ | GRANT ALL to authenticated overly broad | schema.sql |
| MEDIUM-008 | 🟡 | API | Version restore has no access verification | versions/[id]/restore/route.ts |
| MEDIUM-009 | 🟡 | Security | String interpolation in .or() filter | user/export/route.ts |
| MEDIUM-010 | 🟡 | API | Custom components GET no membership check | custom-components/route.ts |
| LOW-001 | 🔵 | Perf | Redundant indexes on UNIQUE columns | schema.sql |
| LOW-002 | 🔵 | Perf | Missing composite indexes | schema.sql |
| LOW-003 | 🔵 | Schema | JSONB columns unbounded | schema.sql |
| LOW-004 | 🔵 | Feature | No webhook retry mechanism | schema.sql |

---

## 6. REMEDIATION PRIORITY MATRIX

### 🔴 Phase 1 — Immediate (Security Hotfixes)
_Must be deployed before any production use._

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 1 | CRITICAL-001: Fix projects INSERT RLS to AND logic | 5 min | Closes cross-tenant injection |
| 2 | CRITICAL-002: Fix `plan` → `subscription_tier` in orgs API | 10 min | Unbreaks org creation & listing |
| 3 | CRITICAL-003: Add org membership to diagram_versions RLS | 15 min | Restores version history for orgs |
| 4 | CRITICAL-004: Remove `.eq('user_id')` from GET projects | 5 min | Shows org projects in dashboard |
| 5 | CRITICAL-005: Fix column names in audit API | 5 min | Unbreaks audit log endpoint |
| 6 | HIGH-007: Revoke SECURITY DEFINER functions from anon | 5 min | Stops membership enumeration |
| 7 | HIGH-006: Remove `GRANT SELECT diagram_versions TO anon` | 2 min | Reduces anon attack surface |

### 🟠 Phase 2 — Short-term (1-2 sprints)
_Required for multi-tenant correctness._

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 8 | HIGH-001: Remove `.eq('user_id')` in PUT/DELETE projects | 10 min | Org admins can manage projects |
| 9 | HIGH-002: Align org UPDATE RLS with API admin check | 10 min | Consistent admin permissions |
| 10 | HIGH-003: Add org membership to templates RLS | 15 min | Org templates visible to members |
| 11 | HIGH-004: Add org membership to exports RLS | 15 min | Org exports accessible |
| 12 | HIGH-005: Use DB-level atomic version numbering | 30 min | Eliminates race condition |
| 13 | MEDIUM-002: Migrate 13 routes to createApiHandler | 2-3h | Consistent auth, rate limits, logging |
| 14 | MEDIUM-006: Add org membership to project_tags RLS | 10 min | Org admins can manage tags |

### 🟡 Phase 3 — Medium-term (2-4 sprints)
_Robustness and operational readiness._

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 15 | MEDIUM-001: Add optimistic locking to diagrams | 2h | Prevents concurrent data loss |
| 16 | MEDIUM-003: Add activity_log TTL/partitioning | 4h | Prevents table bloat |
| 17 | MEDIUM-004: Add soft-delete for organizations | 2h | Prevents accidental data loss |
| 18 | MEDIUM-005: Enforce soft-delete in RLS/middleware | 1h | Completes GDPR deletion flow |
| 19 | MEDIUM-007: Replace GRANT ALL with per-table grants | 1h | Defense in depth |
| 20 | LOW-001-004: Index, JSONB, webhook improvements | 4h | Performance & reliability |

---

## Appendix A — Files Audited

### Schema & Migrations
- `supabase/schema.sql` (982 lines) — 16 tables, 53 RLS policies, 4 SECURITY DEFINER functions, 33 indexes, 8 triggers, 4 realtime publications

### Infrastructure
- `lib/supabase/admin.ts` — Singleton admin client (service role)
- `lib/supabase/server.ts` — Server client (cookie auth)
- `lib/supabase/client.ts` — Browser client
- `lib/supabase/middleware.ts` — Session management
- `lib/api-helpers.ts` — createApiHandler factory
- `lib/validation/schemas.ts` — Zod schemas
- `middleware.ts` — Root Next.js middleware

### API Routes (29 total)
- `app/api/projects/route.ts` — GET/POST
- `app/api/projects/[id]/route.ts` — GET/PUT/DELETE
- `app/api/diagrams/route.ts` — GET/POST
- `app/api/diagrams/[id]/route.ts` — GET/PUT/DELETE
- `app/api/diagrams/versions/route.ts` — GET/POST
- `app/api/diagrams/versions/[id]/restore/route.ts` — POST
- `app/api/organizations/route.ts` — GET/POST
- `app/api/organizations/[id]/route.ts` — GET/PUT/DELETE
- `app/api/organizations/[id]/invites/route.ts` — GET/POST
- `app/api/organizations/[id]/invites/[inviteId]/route.ts` — DELETE
- `app/api/organizations/[id]/members/[memberId]/route.ts` — DELETE
- `app/api/invites/accept/[token]/route.ts` — POST
- `app/api/templates/route.ts` — GET/POST
- `app/api/webhooks/route.ts` — GET/POST
- `app/api/webhooks/[id]/route.ts` — PATCH/DELETE
- `app/api/notifications/route.ts` — GET/POST
- `app/api/notifications/[id]/route.ts` — PATCH/DELETE
- `app/api/audit/route.ts` — GET
- `app/api/custom-components/route.ts` — GET/POST
- `app/api/custom-components/[id]/route.ts` — GET/PATCH/DELETE
- `app/api/user/delete/route.ts` — POST/DELETE
- `app/api/user/export/route.ts` — GET
- `app/api/user/email-preferences/route.ts` — GET/PUT
- `app/api/generate/terraform/route.ts` — POST
- `app/api/estimate-cost/route.ts` — POST
- `app/api/ai/generate/route.ts` — POST
- `app/api/ai/analyze/route.ts` — POST
- `app/api/health/route.ts` — GET
- `app/api/locale/route.ts` — POST

### Hooks
- `hooks/use-realtime-collaboration.ts` — Presence/broadcast

---

*End of Audit #4 — Generated by forensic database analysis*
