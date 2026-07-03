-- ============================================================
-- JobStack — Supabase Schema v4.0
-- ============================================================
-- HOW TO USE:
--   1. Go to https://supabase.com → your project → SQL Editor
--   2. Paste this entire file
--   3. Click "Run"  (takes ~5 seconds)
--   4. Done — all tables, RLS, triggers and functions are created.
--
-- SAFE TO RE-RUN: uses IF NOT EXISTS / CREATE OR REPLACE everywhere.
-- TABLES (14): profiles, organizations, organization_members,
--   organization_invites, projects, project_shares, diagrams,
--   diagram_versions, templates, custom_components, webhooks,
--   exports, notifications, activity_log
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── ENUMs ──────────────────────────────────────────────────
DO $body$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $body$;

DO $body$ BEGIN
  CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $body$;

DO $body$ BEGIN
  CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $body$;

DO $body$ BEGIN
  CREATE TYPE export_format AS ENUM (
    'terraform', 'cloudformation', 'arm', 'pulumi',
    'png', 'svg', 'pdf', 'json'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $body$;

-- ─── Trigger helper: auto-set updated_at ────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$func$;

-- ============================================================
-- TABLE: profiles
-- Extended info mirroring auth.users. Auto-created by trigger.
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT,
  full_name             TEXT,
  avatar_url            TEXT,
  subscription_tier     subscription_tier NOT NULL DEFAULT 'free',
  subscription_ends_at  TIMESTAMPTZ,
  -- GDPR / ToS
  tos_accepted_at       TIMESTAMPTZ,
  privacy_accepted_at   TIMESTAMPTZ,
  cookie_consent        TEXT CHECK (cookie_consent IN ('all', 'necessary')),
  cookie_consent_at     TIMESTAMPTZ,
  -- Soft-delete (GDPR Art. 17 — 7-day grace period)
  deletion_requested_at TIMESTAMPTZ,
  deletion_scheduled_at TIMESTAMPTZ,
  -- Notification preferences
  notification_prefs    JSONB NOT NULL DEFAULT '{"email_invites":true,"email_digests":false,"in_app":true}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- TABLE: organizations
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  description          TEXT,
  avatar_url           TEXT,
  owner_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  subscription_tier    subscription_tier NOT NULL DEFAULT 'free',
  subscription_ends_at TIMESTAMPTZ,
  max_members          INTEGER NOT NULL DEFAULT 25,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT orgs_name_len  CHECK (char_length(name) BETWEEN 2 AND 80),
  CONSTRAINT orgs_slug_fmt  CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orgs_slug   ON organizations(slug);
CREATE INDEX        IF NOT EXISTS idx_orgs_owner  ON organizations(owner_id);

DROP TRIGGER IF EXISTS trg_orgs_updated_at ON organizations;
CREATE TRIGGER trg_orgs_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- NOTE: organizations RLS policies are defined AFTER organization_members
-- (below) to avoid a forward-reference error.
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: organization_members
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  role            org_role NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_om_org  ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_om_user ON organization_members(user_id);

-- ── organizations RLS (defined here, after organization_members exists) ──────
DROP POLICY IF EXISTS "orgs_select"  ON organizations;
DROP POLICY IF EXISTS "orgs_insert"  ON organizations;
DROP POLICY IF EXISTS "orgs_update"  ON organizations;
DROP POLICY IF EXISTS "orgs_delete"  ON organizations;
CREATE POLICY "orgs_select" ON organizations FOR SELECT
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organizations.id AND user_id = auth.uid()));
CREATE POLICY "orgs_insert" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "orgs_update" ON organizations FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "orgs_delete" ON organizations FOR DELETE USING (owner_id = auth.uid());

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "om_select" ON organization_members;
DROP POLICY IF EXISTS "om_insert" ON organization_members;
DROP POLICY IF EXISTS "om_update" ON organization_members;
DROP POLICY IF EXISTS "om_delete" ON organization_members;
CREATE POLICY "om_select" ON organization_members FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM organization_members m2
    WHERE m2.organization_id = organization_members.organization_id AND m2.user_id = auth.uid()));
CREATE POLICY "om_insert" ON organization_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM organization_members m2
          WHERE m2.organization_id = organization_id AND m2.user_id = auth.uid()
            AND m2.role IN ('owner','admin')));
CREATE POLICY "om_update" ON organization_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM organization_members m2
          WHERE m2.organization_id = organization_id AND m2.user_id = auth.uid()
            AND m2.role IN ('owner','admin')));
CREATE POLICY "om_delete" ON organization_members FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM organization_members m2
          WHERE m2.organization_id = organization_id AND m2.user_id = auth.uid()
            AND m2.role IN ('owner','admin')));

-- ============================================================
-- TABLE: organization_invites
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_invites (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by      UUID NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            org_role NOT NULL DEFAULT 'member',
  token           TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status          invite_status NOT NULL DEFAULT 'pending',
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at     TIMESTAMPTZ,
  accepted_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_org   ON organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_inv_token ON organization_invites(token) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_inv_email ON organization_invites(email)  WHERE status = 'pending';

ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inv_select" ON organization_invites;
DROP POLICY IF EXISTS "inv_insert" ON organization_invites;
DROP POLICY IF EXISTS "inv_update" ON organization_invites;
CREATE POLICY "inv_select" ON organization_invites FOR SELECT
  USING (invited_by = auth.uid() OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organization_invites.organization_id
      AND user_id = auth.uid() AND role IN ('owner','admin')));
CREATE POLICY "inv_insert" ON organization_invites FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM organization_members
  WHERE organization_id = organization_invites.organization_id
    AND user_id = auth.uid() AND role IN ('owner','admin')));
CREATE POLICY "inv_update" ON organization_invites FOR UPDATE USING (
  invited_by = auth.uid() OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organization_invites.organization_id
      AND user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id)     ON DELETE CASCADE,
  organization_id UUID         REFERENCES organizations(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  cloud_provider  TEXT NOT NULL DEFAULT 'aws',
  thumbnail_url   TEXT,
  settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_template     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_name_len CHECK (char_length(name) BETWEEN 1 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_proj_user    ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_proj_org     ON projects(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_proj_updated ON projects(updated_at DESC);

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- NOTE: projects RLS policies are defined AFTER project_shares
-- (below) to avoid a forward-reference error.
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: project_shares
-- ============================================================
CREATE TABLE IF NOT EXISTS project_shares (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id          UUID NOT NULL REFERENCES projects(id)  ON DELETE CASCADE,
  shared_by_user_id   UUID NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  shared_with_user_id UUID         REFERENCES profiles(id)   ON DELETE CASCADE,
  shared_with_email   TEXT,
  permission          TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view','edit','admin')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shares_needs_target CHECK (
    shared_with_user_id IS NOT NULL OR shared_with_email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_shares_proj  ON project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_shares_user  ON project_shares(shared_with_user_id) WHERE shared_with_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shares_email ON project_shares(shared_with_email)   WHERE shared_with_email IS NOT NULL;

-- ── projects RLS (defined here, after project_shares exists) ─────────────
DROP POLICY IF EXISTS "proj_select" ON projects;
DROP POLICY IF EXISTS "proj_insert" ON projects;
DROP POLICY IF EXISTS "proj_update" ON projects;
DROP POLICY IF EXISTS "proj_delete" ON projects;
CREATE POLICY "proj_select" ON projects FOR SELECT
  USING (
    user_id = auth.uid() OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = projects.organization_id AND user_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM project_shares
            WHERE project_id = projects.id AND (
              shared_with_user_id = auth.uid() OR
              shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())))
  );
CREATE POLICY "proj_insert" ON projects FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "proj_update" ON projects FOR UPDATE USING (
  user_id = auth.uid() OR
  (organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = projects.organization_id AND user_id = auth.uid()
      AND role IN ('owner','admin','member'))));
CREATE POLICY "proj_delete" ON projects FOR DELETE USING (
  user_id = auth.uid() OR
  (organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = projects.organization_id AND user_id = auth.uid()
      AND role IN ('owner','admin'))));

ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shares_select" ON project_shares;
DROP POLICY IF EXISTS "shares_insert" ON project_shares;
DROP POLICY IF EXISTS "shares_delete" ON project_shares;
CREATE POLICY "shares_select" ON project_shares FOR SELECT
  USING (shared_by_user_id = auth.uid() OR shared_with_user_id = auth.uid() OR
         shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid()));
CREATE POLICY "shares_insert" ON project_shares FOR INSERT WITH CHECK (
  shared_by_user_id = auth.uid() AND
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "shares_delete" ON project_shares FOR DELETE USING (
  shared_by_user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid()));

-- ============================================================
-- TABLE: diagrams
-- ============================================================
CREATE TABLE IF NOT EXISTS diagrams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT 'Untitled Diagram',
  nodes         JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges         JSONB NOT NULL DEFAULT '[]'::jsonb,
  viewport      JSONB NOT NULL DEFAULT '{"x":0,"y":0,"zoom":1}'::jsonb,
  thumbnail_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT diagrams_name_len CHECK (char_length(name) BETWEEN 1 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_diag_proj    ON diagrams(project_id);
CREATE INDEX IF NOT EXISTS idx_diag_updated ON diagrams(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_diag_nodes   ON diagrams USING GIN (nodes);

DROP TRIGGER IF EXISTS trg_diagrams_updated_at ON diagrams;
CREATE TRIGGER trg_diagrams_updated_at
  BEFORE UPDATE ON diagrams FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diag_select" ON diagrams;
DROP POLICY IF EXISTS "diag_insert" ON diagrams;
DROP POLICY IF EXISTS "diag_update" ON diagrams;
DROP POLICY IF EXISTS "diag_delete" ON diagrams;
CREATE POLICY "diag_select" ON diagrams FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE id = diagrams.project_id));
CREATE POLICY "diag_insert" ON diagrams FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE id = project_id));
CREATE POLICY "diag_update" ON diagrams FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE id = diagrams.project_id));
CREATE POLICY "diag_delete" ON diagrams FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE id = diagrams.project_id AND user_id = auth.uid()));

-- ============================================================
-- TABLE: diagram_versions
-- ============================================================
CREATE TABLE IF NOT EXISTS diagram_versions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id     UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  message        TEXT,
  nodes          JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges          JSONB NOT NULL DEFAULT '[]'::jsonb,
  viewport       JSONB NOT NULL DEFAULT '{"x":0,"y":0,"zoom":1}'::jsonb,
  created_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (diagram_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_dv_diagram ON diagram_versions(diagram_id);
CREATE INDEX IF NOT EXISTS idx_dv_ver     ON diagram_versions(diagram_id, version_number DESC);

ALTER TABLE diagram_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dv_select" ON diagram_versions;
DROP POLICY IF EXISTS "dv_insert" ON diagram_versions;
CREATE POLICY "dv_select" ON diagram_versions FOR SELECT USING (EXISTS (
  SELECT 1 FROM diagrams d JOIN projects p ON p.id = d.project_id
  WHERE d.id = diagram_versions.diagram_id));
CREATE POLICY "dv_insert" ON diagram_versions FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM diagrams d JOIN projects p ON p.id = d.project_id
  WHERE d.id = diagram_id));

-- ============================================================
-- TABLE: templates
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by      UUID NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  organization_id UUID         REFERENCES organizations(id)  ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  cloud_provider  TEXT NOT NULL DEFAULT 'aws',
  category        TEXT NOT NULL DEFAULT 'general',
  nodes           JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges           JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_url     TEXT,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  use_count       INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tmpl_public  ON templates(created_at DESC) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_tmpl_creator ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_tmpl_org     ON templates(organization_id) WHERE organization_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_templates_updated_at ON templates;
CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tmpl_select" ON templates;
DROP POLICY IF EXISTS "tmpl_insert" ON templates;
DROP POLICY IF EXISTS "tmpl_update" ON templates;
DROP POLICY IF EXISTS "tmpl_delete" ON templates;
CREATE POLICY "tmpl_select" ON templates FOR SELECT
  USING (is_public = TRUE OR created_by = auth.uid() OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = templates.organization_id AND user_id = auth.uid())));
CREATE POLICY "tmpl_insert" ON templates FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "tmpl_update" ON templates FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "tmpl_delete" ON templates FOR DELETE USING (created_by = auth.uid());

-- ============================================================
-- TABLE: custom_components
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_components (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'custom',
  icon            TEXT NOT NULL DEFAULT 'box',
  color           TEXT NOT NULL DEFAULT '#6366f1',
  provider        TEXT NOT NULL DEFAULT 'custom',
  properties      JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cc_name_len  CHECK (char_length(name) BETWEEN 2 AND 64),
  CONSTRAINT cc_color_hex CHECK (color ~ '^#[0-9a-fA-F]{6}$')
);

CREATE INDEX IF NOT EXISTS idx_cc_org ON custom_components(organization_id) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS trg_cc_updated_at ON custom_components;
CREATE TRIGGER trg_cc_updated_at
  BEFORE UPDATE ON custom_components FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE custom_components ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cc_select" ON custom_components;
DROP POLICY IF EXISTS "cc_insert" ON custom_components;
DROP POLICY IF EXISTS "cc_update" ON custom_components;
DROP POLICY IF EXISTS "cc_delete" ON custom_components;
CREATE POLICY "cc_select" ON custom_components FOR SELECT USING (EXISTS (
  SELECT 1 FROM organization_members
  WHERE organization_id = custom_components.organization_id AND user_id = auth.uid()));
CREATE POLICY "cc_insert" ON custom_components FOR INSERT WITH CHECK (
  created_by = auth.uid() AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = custom_components.organization_id
      AND user_id = auth.uid() AND role IN ('owner','admin','member')));
CREATE POLICY "cc_update" ON custom_components FOR UPDATE USING (
  created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = custom_components.organization_id
      AND user_id = auth.uid() AND role IN ('owner','admin')));
CREATE POLICY "cc_delete" ON custom_components FOR DELETE USING (
  created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = custom_components.organization_id
      AND user_id = auth.uid() AND role IN ('owner','admin')));

-- ============================================================
-- TABLE: webhooks
-- ============================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id)      ON DELETE CASCADE,
  organization_id   UUID         REFERENCES organizations(id)  ON DELETE CASCADE,
  name              TEXT NOT NULL,
  url               TEXT NOT NULL,
  secret            TEXT,
  events            TEXT[] NOT NULL DEFAULT '{}',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  failure_count     INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wh_url CHECK (url ~ '^https?://.+')
);

CREATE INDEX IF NOT EXISTS idx_wh_user ON webhooks(user_id);

DROP TRIGGER IF EXISTS trg_webhooks_updated_at ON webhooks;
CREATE TRIGGER trg_webhooks_updated_at
  BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wh_own" ON webhooks;
CREATE POLICY "wh_own" ON webhooks
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- TABLE: exports
-- ============================================================
CREATE TABLE IF NOT EXISTS exports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id)  ON DELETE SET NULL,
  diagram_id   UUID REFERENCES diagrams(id)  ON DELETE SET NULL,
  export_type  TEXT NOT NULL,
  code_content TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exp_user    ON exports(user_id)    WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exp_diagram ON exports(diagram_id) WHERE diagram_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exp_created ON exports(created_at DESC);

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exp_own" ON exports;
CREATE POLICY "exp_own" ON exports
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT,
  link       TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user   ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id) WHERE is_read = FALSE;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_own" ON notifications;
CREATE POLICY "notif_own" ON notifications
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- TABLE: activity_log  (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id)      ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  resource_type   TEXT,
  resource_id     UUID,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_act_user ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_act_org  ON activity_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_act_time ON activity_log(created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "act_own"    ON activity_log;
DROP POLICY IF EXISTS "act_org"    ON activity_log;
DROP POLICY IF EXISTS "act_insert" ON activity_log;
CREATE POLICY "act_own" ON activity_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "act_org" ON activity_log FOR SELECT USING (
  organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = activity_log.organization_id
      AND user_id = auth.uid() AND role IN ('owner','admin')));
CREATE POLICY "act_insert" ON activity_log FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================================
-- FUNCTION: get_invite_by_token
-- Looks up a valid pending invite without requiring org membership.
-- Called by /api/invites/accept/[token]
-- ============================================================
CREATE OR REPLACE FUNCTION get_invite_by_token(p_token TEXT)
RETURNS TABLE (
  id              UUID,
  organization_id UUID,
  email           TEXT,
  role            org_role,
  status          invite_status,
  expires_at      TIMESTAMPTZ,
  org_name        TEXT,
  org_slug        TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
BEGIN
  RETURN QUERY
    SELECT i.id, i.organization_id, i.email, i.role, i.status, i.expires_at,
           o.name AS org_name, o.slug AS org_slug
    FROM organization_invites i
    JOIN organizations o ON o.id = i.organization_id
    WHERE i.token = p_token AND i.status = 'pending' AND i.expires_at > NOW()
    LIMIT 1;
END;
$func$;

-- ============================================================
-- FUNCTION: accept_invite
-- Atomically marks invite accepted + adds user to org.
-- ============================================================
CREATE OR REPLACE FUNCTION accept_invite(p_token TEXT, p_user_id UUID, p_email TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
DECLARE v_invite organization_invites%ROWTYPE;
BEGIN
  SELECT * INTO v_invite
  FROM organization_invites
  WHERE token = p_token AND status = 'pending' AND expires_at > NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invalid or expired invite');
  END IF;

  UPDATE organization_invites
    SET status = 'accepted', accepted_at = NOW(), accepted_by = p_user_id
  WHERE id = v_invite.id;

  INSERT INTO organization_members (organization_id, user_id, role, invited_by)
  VALUES (v_invite.organization_id, p_user_id, v_invite.role, v_invite.invited_by)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN jsonb_build_object(
    'ok', true,
    'organization_id', v_invite.organization_id,
    'role', v_invite.role
  );
END;
$func$;

-- ============================================================
-- Grant function access to authenticated users
-- ============================================================
GRANT EXECUTE ON FUNCTION get_invite_by_token(TEXT)               TO authenticated;
GRANT EXECUTE ON FUNCTION accept_invite(TEXT, UUID, TEXT)         TO authenticated;

-- ============================================================
-- Realtime subscriptions
-- ============================================================
DO $body$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                 WHERE pubname = 'supabase_realtime' AND tablename = 'diagrams')
  THEN ALTER PUBLICATION supabase_realtime ADD TABLE diagrams; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                 WHERE pubname = 'supabase_realtime' AND tablename = 'notifications')
  THEN ALTER PUBLICATION supabase_realtime ADD TABLE notifications; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                 WHERE pubname = 'supabase_realtime' AND tablename = 'organization_members')
  THEN ALTER PUBLICATION supabase_realtime ADD TABLE organization_members; END IF;
END;
$body$;

-- ============================================================
-- DONE. Tables created and secured with RLS.
-- ============================================================
