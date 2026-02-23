-- ============================================================================
-- JobStack — Kompletny schemat bazy danych (Supabase)
-- Wersja: 4.0 — IDEMPOTENTNA (bezpieczna do ponownego uruchomienia)
-- Data: 2025-02-22
--
-- Ten plik można uruchamiać wielokrotnie na istniejącej bazie danych.
-- NIE usuwa tabel ani danych — tworzy brakujące obiekty i aktualizuje
-- funkcje, polityki RLS oraz triggery.
-- ============================================================================

-- Rozszerzenia
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TYPY ENUM (bezpieczne tworzenie — ignoruje jeśli już istnieją)
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE cloud_provider AS ENUM ('aws', 'azure', 'gcp', 'vercel', 'netlify', 'cloudflare');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error', 'invite', 'share', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_action AS ENUM (
        'project.created', 'project.updated', 'project.deleted', 'project.duplicated',
        'diagram.saved', 'diagram.exported', 'diagram.version_created',
        'org.created', 'org.member_added', 'org.member_removed', 'org.invite_sent',
        'share.created', 'share.revoked',
        'user.login', 'user.settings_changed', 'user.export_data', 'user.delete_requested'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABELE (IF NOT EXISTS — nie nadpisuje istniejących danych)
-- ============================================================================

-- ---- Profil użytkownika ----
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_ends_at TIMESTAMPTZ,
    tos_accepted_at TIMESTAMPTZ DEFAULT NULL,
    privacy_accepted_at TIMESTAMPTZ DEFAULT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    deletion_scheduled_for TIMESTAMPTZ DEFAULT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPLIANCE: Add consent timestamp columns for existing databases
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ DEFAULT NULL;

-- ---- Organizacje ----
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subscription_tier subscription_tier DEFAULT 'enterprise',
    subscription_ends_at TIMESTAMPTZ,
    max_members INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}',
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- MEDIUM-004: Soft-delete for organizations. Query with WHERE deleted_at IS NULL.
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ---- Członkowie organizacji ----
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role org_role DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ---- Zaproszenia do organizacji ----
CREATE TABLE IF NOT EXISTS public.organization_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role org_role DEFAULT 'member',
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- ---- Projekty ----
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cloud_provider cloud_provider DEFAULT 'aws',
    status TEXT DEFAULT 'draft',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Diagramy ----
CREATE TABLE IF NOT EXISTS public.diagrams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Main Diagram',
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}',
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Wersje diagramów ----
CREATE TABLE IF NOT EXISTS public.diagram_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    message TEXT,
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(diagram_id, version_number)
);

-- ---- Szablony ----
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    cloud_provider cloud_provider NOT NULL,
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Udostępnianie projektów ----
CREATE TABLE IF NOT EXISTS public.project_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    shared_with_email TEXT NOT NULL,
    shared_with_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT DEFAULT 'view',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, shared_with_email)
);

-- ---- Eksporty ----
CREATE TABLE IF NOT EXISTS public.exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE,
    export_type TEXT NOT NULL,
    file_url TEXT,
    code_content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT exports_reference_check CHECK (project_id IS NOT NULL OR diagram_id IS NOT NULL)
);

-- ---- Webhooki ----
-- TODO [LOW-004]: Implement webhook delivery retry mechanism.
-- Recommended: A background worker (pg_cron or external) that retries failed deliveries
-- with exponential backoff (max 5 retries). Track in a webhook_deliveries table.
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    events TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Niestandardowe komponenty ----
CREATE TABLE IF NOT EXISTS public.custom_components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'custom',
    icon TEXT DEFAULT 'box',
    color TEXT DEFAULT '#6366f1',
    provider TEXT DEFAULT 'custom',
    default_config JSONB DEFAULT '{}',
    connection_rules JSONB DEFAULT '[]',
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- ---- Subskrypcje ----
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    payment_provider TEXT,
    external_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT subscriptions_owner_check CHECK (user_id IS NOT NULL OR organization_id IS NOT NULL)
);

-- ---- Dziennik aktywności ----
-- TODO [MEDIUM-003]: Implement TTL/partitioning strategy for activity_log.
-- Recommended: pg_partman with monthly partitions + auto-drop after 90 days,
-- or a scheduled pg_cron job: DELETE FROM activity_log WHERE created_at < NOW() - INTERVAL '90 days';
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    action activity_action NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Tagi projektów ----
CREATE TABLE IF NOT EXISTS public.project_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    tag TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, tag)
);

-- ---- Powiadomienia ----
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEKSY (IF NOT EXISTS — bezpieczne przy ponownym uruchomieniu)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_deletion ON public.profiles (deletion_scheduled_for) WHERE deletion_scheduled_for IS NOT NULL;
-- LOW-001: Removed — redundant with UNIQUE constraint on slug (implicit index)
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.organization_invites(email);
-- LOW-001: Removed — redundant with UNIQUE constraint on token (implicit index)
CREATE INDEX IF NOT EXISTS idx_org_invites_org ON public.organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_diagrams_project_id ON public.diagrams(project_id);
CREATE INDEX IF NOT EXISTS idx_diagram_versions_diagram ON public.diagram_versions(diagram_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON public.templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_exports_project_id ON public.exports(project_id);
CREATE INDEX IF NOT EXISTS idx_exports_diagram_id ON public.exports(diagram_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON public.webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_components_org ON public.custom_components(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_user ON public.project_shares(shared_with_user_id) WHERE shared_with_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_shares_project ON public.project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_org ON public.activity_log(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON public.activity_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_tags_project ON public.project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON public.project_tags(tag);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- LOW-002: Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_projects_user_updated ON public.projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagrams_project_updated ON public.diagrams(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_created ON public.webhooks(user_id, created_at DESC);

-- ============================================================================
-- RLS — WŁĄCZENIE (idempotentne — ENABLE na już włączonym jest no-op)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagram_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNKCJE POMOCNICZE DLA RLS (CREATE OR REPLACE — bezpieczne)
-- Muszą być zdefiniowane PRZED politykami RLS, które z nich korzystają
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT p_user_id IS NOT DISTINCT FROM auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = p_org_id AND user_id = p_user_id
        );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_org_role(p_org_id UUID, p_user_id UUID)
RETURNS org_role AS $$
    SELECT CASE WHEN p_user_id IS DISTINCT FROM auth.uid() THEN NULL::org_role
    ELSE (
        SELECT role FROM public.organization_members
        WHERE organization_id = p_org_id AND user_id = p_user_id
        LIMIT 1
    ) END;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_org_owner(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT p_user_id IS NOT DISTINCT FROM auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.organizations
            WHERE id = p_org_id AND owner_id = p_user_id
        );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT p_user_id IS NOT DISTINCT FROM auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = p_org_id AND user_id = p_user_id AND role IN ('owner', 'admin')
        );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- POLITYKI RLS (DROP IF EXISTS + CREATE — jedyny bezpieczny wzorzec w PG)
-- PostgreSQL nie wspiera CREATE OR REPLACE POLICY, więc musimy
-- usuwać i tworzyć od nowa. Polityki nie zawierają danych — to bezpieczne.
-- ============================================================================

-- ---- Profiles ----
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ---- Organizations ----
DROP POLICY IF EXISTS "orgs_select" ON public.organizations;
DROP POLICY IF EXISTS "orgs_insert" ON public.organizations;
DROP POLICY IF EXISTS "orgs_update" ON public.organizations;
DROP POLICY IF EXISTS "orgs_delete" ON public.organizations;
CREATE POLICY "orgs_select" ON public.organizations FOR SELECT USING (
    owner_id = auth.uid()
    OR public.is_org_member(id, auth.uid())
);
CREATE POLICY "orgs_insert" ON public.organizations FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "orgs_update" ON public.organizations FOR UPDATE USING (
    public.is_org_admin_or_owner(id, auth.uid())
);
CREATE POLICY "orgs_delete" ON public.organizations FOR DELETE USING (owner_id = auth.uid());

-- ---- Organization Members (SECURITY DEFINER functions — bez rekurencji) ----
DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_insert" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_update" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_delete" ON public.organization_members;

CREATE POLICY "org_members_select" ON public.organization_members FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_org_member(organization_id, auth.uid())
);
CREATE POLICY "org_members_insert" ON public.organization_members FOR INSERT WITH CHECK (
    public.is_org_owner(organization_id, auth.uid())
    OR public.is_org_admin_or_owner(organization_id, auth.uid())
    OR (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.organizations o
            WHERE o.id = organization_members.organization_id
            AND o.owner_id = auth.uid()
        )
    )
    OR (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.organization_invites
            WHERE organization_id = organization_members.organization_id
            AND email = auth.jwt()->>'email'
            AND expires_at > NOW()
        )
    )
);
CREATE POLICY "org_members_update" ON public.organization_members FOR UPDATE USING (
    public.is_org_admin_or_owner(organization_id, auth.uid())
);
CREATE POLICY "org_members_delete" ON public.organization_members FOR DELETE USING (
    user_id = auth.uid()
    OR public.is_org_admin_or_owner(organization_id, auth.uid())
);

-- ---- Organization Invites ----
DROP POLICY IF EXISTS "org_invites_select" ON public.organization_invites;
DROP POLICY IF EXISTS "org_invites_insert" ON public.organization_invites;
DROP POLICY IF EXISTS "org_invites_delete" ON public.organization_invites;

CREATE POLICY "org_invites_select" ON public.organization_invites FOR SELECT USING (
    email = auth.jwt()->>'email'
    OR public.is_org_admin_or_owner(organization_id, auth.uid())
);
CREATE POLICY "org_invites_insert" ON public.organization_invites FOR INSERT WITH CHECK (
    public.is_org_admin_or_owner(organization_id, auth.uid())
);
CREATE POLICY "org_invites_delete" ON public.organization_invites FOR DELETE USING (
    invited_by = auth.uid()
    OR email = auth.jwt()->>'email'
    OR public.is_org_admin_or_owner(organization_id, auth.uid())
);

-- ---- Projects ----
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()))
);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
        organization_id IS NULL
        OR public.is_org_admin_or_owner(organization_id, auth.uid())
    )
);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_owner(organization_id, auth.uid()))
);

-- ---- Diagrams ----
DROP POLICY IF EXISTS "diagrams_select" ON public.diagrams;
DROP POLICY IF EXISTS "diagrams_insert" ON public.diagrams;
DROP POLICY IF EXISTS "diagrams_update" ON public.diagrams;
DROP POLICY IF EXISTS "diagrams_delete" ON public.diagrams;

CREATE POLICY "diagrams_select" ON public.diagrams FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = diagrams.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = diagrams.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_member(p.organization_id, auth.uid())
    )
);
CREATE POLICY "diagrams_insert" ON public.diagrams FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = diagrams.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = diagrams.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_member(p.organization_id, auth.uid())
    )
);
CREATE POLICY "diagrams_update" ON public.diagrams FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = diagrams.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = diagrams.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_member(p.organization_id, auth.uid())
    )
);
CREATE POLICY "diagrams_delete" ON public.diagrams FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = diagrams.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = diagrams.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_admin_or_owner(p.organization_id, auth.uid())
    )
);

-- ---- Diagram Versions ----
DROP POLICY IF EXISTS "diagram_versions_select" ON public.diagram_versions;
DROP POLICY IF EXISTS "diagram_versions_insert" ON public.diagram_versions;
DROP POLICY IF EXISTS "diagram_versions_delete" ON public.diagram_versions;

CREATE POLICY "diagram_versions_select" ON public.diagram_versions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = diagram_versions.diagram_id
        AND (p.user_id = auth.uid() OR (p.organization_id IS NOT NULL AND public.is_org_member(p.organization_id, auth.uid())))
    )
);
CREATE POLICY "diagram_versions_insert" ON public.diagram_versions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = diagram_versions.diagram_id
        AND (p.user_id = auth.uid() OR (p.organization_id IS NOT NULL AND public.is_org_member(p.organization_id, auth.uid())))
    )
);
CREATE POLICY "diagram_versions_delete" ON public.diagram_versions FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = diagram_versions.diagram_id
        AND (p.user_id = auth.uid() OR (p.organization_id IS NOT NULL AND public.is_org_admin_or_owner(p.organization_id, auth.uid())))
    )
);

-- ---- Templates ----
DROP POLICY IF EXISTS "templates_select" ON public.templates;
DROP POLICY IF EXISTS "templates_insert" ON public.templates;
DROP POLICY IF EXISTS "templates_update" ON public.templates;
DROP POLICY IF EXISTS "templates_delete" ON public.templates;

CREATE POLICY "templates_select" ON public.templates FOR SELECT USING (
    is_public = true
    OR created_by = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()))
);
CREATE POLICY "templates_insert" ON public.templates FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND (organization_id IS NULL OR public.is_org_admin_or_owner(organization_id, auth.uid()))
);
CREATE POLICY "templates_update" ON public.templates FOR UPDATE USING (
    created_by = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
);
CREATE POLICY "templates_delete" ON public.templates FOR DELETE USING (
    created_by = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
);

-- ---- Project Shares ----
DROP POLICY IF EXISTS "shares_select" ON public.project_shares;
DROP POLICY IF EXISTS "shares_insert" ON public.project_shares;
DROP POLICY IF EXISTS "shares_update" ON public.project_shares;
DROP POLICY IF EXISTS "shares_delete" ON public.project_shares;

CREATE POLICY "shares_select" ON public.project_shares FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
    OR shared_with_user_id = auth.uid()
    OR shared_with_email = auth.jwt()->>'email'
);
CREATE POLICY "shares_insert" ON public.project_shares FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
);
CREATE POLICY "shares_update" ON public.project_shares FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
);
CREATE POLICY "shares_delete" ON public.project_shares FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
    OR shared_with_user_id = auth.uid()
);

-- ---- Exports ----
DROP POLICY IF EXISTS "exports_select" ON public.exports;
DROP POLICY IF EXISTS "exports_insert" ON public.exports;

CREATE POLICY "exports_select" ON public.exports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = exports.project_id
        AND (user_id = auth.uid() OR (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid())))
    )
    OR EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = exports.diagram_id
        AND (p.user_id = auth.uid() OR (p.organization_id IS NOT NULL AND public.is_org_member(p.organization_id, auth.uid())))
    )
);
CREATE POLICY "exports_insert" ON public.exports FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = exports.project_id
        AND (user_id = auth.uid() OR (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid())))
    )
    OR EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = exports.diagram_id
        AND (p.user_id = auth.uid() OR (p.organization_id IS NOT NULL AND public.is_org_member(p.organization_id, auth.uid())))
    )
);

-- ---- Webhooks ----
DROP POLICY IF EXISTS "webhooks_select" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_insert" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_update" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_delete" ON public.webhooks;

CREATE POLICY "webhooks_select" ON public.webhooks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "webhooks_insert" ON public.webhooks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "webhooks_update" ON public.webhooks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "webhooks_delete" ON public.webhooks FOR DELETE USING (user_id = auth.uid());

-- ---- Custom Components ----
DROP POLICY IF EXISTS "custom_components_select" ON public.custom_components;
DROP POLICY IF EXISTS "custom_components_insert" ON public.custom_components;
DROP POLICY IF EXISTS "custom_components_update" ON public.custom_components;
DROP POLICY IF EXISTS "custom_components_delete" ON public.custom_components;

CREATE POLICY "custom_components_select" ON public.custom_components FOR SELECT USING (
    public.is_org_member(organization_id, auth.uid())
    OR is_shared = true
);
CREATE POLICY "custom_components_insert" ON public.custom_components FOR INSERT WITH CHECK (
    public.is_org_admin_or_owner(organization_id, auth.uid())
);
CREATE POLICY "custom_components_update" ON public.custom_components FOR UPDATE USING (
    public.is_org_admin_or_owner(organization_id, auth.uid())
);
CREATE POLICY "custom_components_delete" ON public.custom_components FOR DELETE USING (
    public.is_org_admin_or_owner(organization_id, auth.uid())
);

-- ---- Subscriptions ----
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;

CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
);

-- ---- Activity Log ----
DROP POLICY IF EXISTS "activity_log_select" ON public.activity_log;
DROP POLICY IF EXISTS "activity_log_insert" ON public.activity_log;

CREATE POLICY "activity_log_select" ON public.activity_log FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
);
CREATE POLICY "activity_log_insert" ON public.activity_log FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

-- ---- Project Tags ----
DROP POLICY IF EXISTS "project_tags_select" ON public.project_tags;
DROP POLICY IF EXISTS "project_tags_insert" ON public.project_tags;
DROP POLICY IF EXISTS "project_tags_update" ON public.project_tags;
DROP POLICY IF EXISTS "project_tags_delete" ON public.project_tags;

CREATE POLICY "project_tags_select" ON public.project_tags FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_tags.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_member(p.organization_id, auth.uid())
    )
);
CREATE POLICY "project_tags_insert" ON public.project_tags FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_tags.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_admin_or_owner(p.organization_id, auth.uid())
    )
);
CREATE POLICY "project_tags_update" ON public.project_tags FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_tags.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_admin_or_owner(p.organization_id, auth.uid())
    )
);
CREATE POLICY "project_tags_delete" ON public.project_tags FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_tags.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_admin_or_owner(p.organization_id, auth.uid())
    )
);

-- ---- Notifications ----
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- FUNKCJE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NULLIF(COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
        ), ''),
        NULLIF(COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            ''
        ), '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email        = EXCLUDED.email,
        full_name    = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url   = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at   = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERY (DROP IF EXISTS + CREATE — jedyny bezpieczny wzorzec)
-- ============================================================================

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_diagrams_updated_at ON public.diagrams;
CREATE TRIGGER set_diagrams_updated_at
    BEFORE UPDATE ON public.diagrams
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_organizations_updated_at ON public.organizations;
CREATE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_webhooks_updated_at ON public.webhooks;
CREATE TRIGGER set_webhooks_updated_at
    BEFORE UPDATE ON public.webhooks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_custom_components_updated_at ON public.custom_components;
CREATE TRIGGER set_custom_components_updated_at
    BEFORE UPDATE ON public.custom_components
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- MEDIUM-001: Optimistic locking for concurrent diagram edits
ALTER TABLE public.diagrams ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- ============================================================================
-- GDPR Art. 17 — Right to Erasure (Prawo do Bycia Zapomnianym)
-- ============================================================================
-- Hard-deletes a user's profile row. Because every FK in the schema uses
-- ON DELETE CASCADE, this single DELETE propagates through all child tables:
--   profiles → projects → diagrams → diagram_versions → exports → project_tags
--            → organization_members → webhooks → subscriptions → activity_log
--            → notifications → project_shares
-- After the cascade completes, auth.users is cleaned up via auth.admin API
-- (must be called from application code with the service-role key).

CREATE OR REPLACE FUNCTION public.gdpr_hard_delete_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Guard: only the user themselves (or a service-role caller) may invoke
    IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Forbidden: cannot delete another user';
    END IF;

    -- 1. Remove owned organizations (cascade wipes members, invites, org projects)
    DELETE FROM public.organizations WHERE owner_id = p_user_id;

    -- 2. Remove the profile row — ON DELETE CASCADE cleans all remaining FKs
    DELETE FROM public.profiles WHERE id = p_user_id;

    -- Note: auth.users row must be deleted via supabase.auth.admin.deleteUser()
    -- from application code, as pg cannot call the GoTrue admin API directly.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.gdpr_hard_delete_user(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_diagram_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = COALESCE(OLD.version, 0) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_diagram_version ON public.diagrams;
CREATE TRIGGER set_diagram_version
    BEFORE UPDATE ON public.diagrams
    FOR EACH ROW EXECUTE FUNCTION public.handle_diagram_version();

-- ============================================================================
-- REALTIME (bezpieczne — owijamy w DO block na wypadek duplikatu)
-- ============================================================================

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diagrams;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_components;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- UPRAWNIENIA (idempotentne — GRANT na istniejącym uprawnieniu jest no-op)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.templates TO anon;
GRANT SELECT ON public.custom_components TO anon;
-- HIGH-006: Removed anon GRANT on diagram_versions (no public use case)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin_or_owner(UUID, UUID) TO authenticated;

-- ============================================================================
-- SEED DATA — PUBLIC TEMPLATES
-- ============================================================================

INSERT INTO public.templates (id, name, description, category, cloud_provider, is_public, nodes, edges) VALUES

-- AWS Startup Stack
(
  '00000000-0000-0000-0000-000000000001',
  'AWS Startup Stack',
  'A cost-effective full-stack setup for startups: EC2 web server, RDS PostgreSQL, S3 storage, and Route53 DNS.',
  'startup',
  'aws',
  true,
  '[
    {"id":"web-1","type":"custom","position":{"x":200,"y":150},"data":{"componentId":"aws-ec2","label":"Web Server","config":{"size":"t3-medium","replicas":2,"osImage":"Ubuntu 22.04"}}},
    {"id":"db-1","type":"custom","position":{"x":200,"y":340},"data":{"componentId":"aws-rds","label":"PostgreSQL DB","config":{"size":"db.t3.medium","replicas":1}}},
    {"id":"s3-1","type":"custom","position":{"x":500,"y":150},"data":{"componentId":"aws-s3","label":"Static Assets","config":{}}},
    {"id":"dns-1","type":"custom","position":{"x":500,"y":340},"data":{"componentId":"aws-route53","label":"Route 53 DNS","config":{}}}
  ]'::jsonb,
  '[
    {"id":"e1","source":"web-1","target":"db-1","type":"smoothstep"},
    {"id":"e2","source":"web-1","target":"s3-1","type":"smoothstep"},
    {"id":"e3","source":"dns-1","target":"web-1","type":"smoothstep"}
  ]'::jsonb
),

-- AWS Serverless Architecture
(
  '00000000-0000-0000-0000-000000000002',
  'AWS Serverless Architecture',
  'Event-driven serverless stack using Lambda, API Gateway, DynamoDB, and S3 — zero server management.',
  'startup',
  'aws',
  true,
  '[
    {"id":"gw-1","type":"custom","position":{"x":200,"y":100},"data":{"componentId":"aws-api-gateway","label":"API Gateway","config":{}}},
    {"id":"fn-1","type":"custom","position":{"x":200,"y":280},"data":{"componentId":"aws-lambda","label":"Lambda Function","config":{"size":"256mb"}}},
    {"id":"fn-2","type":"custom","position":{"x":450,"y":280},"data":{"componentId":"aws-lambda","label":"Auth Lambda","config":{"size":"128mb"}}},
    {"id":"dyn-1","type":"custom","position":{"x":200,"y":460},"data":{"componentId":"aws-dynamodb","label":"DynamoDB","config":{}}},
    {"id":"s3-1","type":"custom","position":{"x":450,"y":460},"data":{"componentId":"aws-s3","label":"Asset Bucket","config":{}}}
  ]'::jsonb,
  '[
    {"id":"e1","source":"gw-1","target":"fn-1","type":"smoothstep"},
    {"id":"e2","source":"gw-1","target":"fn-2","type":"smoothstep"},
    {"id":"e3","source":"fn-1","target":"dyn-1","type":"smoothstep"},
    {"id":"e4","source":"fn-1","target":"s3-1","type":"smoothstep"}
  ]'::jsonb
),

-- AWS Microservices with EKS
(
  '00000000-0000-0000-0000-000000000003',
  'AWS Microservices with EKS',
  'Container-native microservices on Kubernetes (EKS) with RDS, ElastiCache, and an Application Load Balancer.',
  'microservices',
  'aws',
  true,
  '[
    {"id":"alb-1","type":"custom","position":{"x":300,"y":60},"data":{"componentId":"aws-alb","label":"App Load Balancer","config":{}}},
    {"id":"eks-1","type":"custom","position":{"x":300,"y":220},"data":{"componentId":"aws-eks","label":"EKS Cluster","config":{"size":"t3-large","replicas":3}}},
    {"id":"rds-1","type":"custom","position":{"x":100,"y":420},"data":{"componentId":"aws-rds","label":"RDS Primary","config":{"size":"db.r5.large","replicas":1}}},
    {"id":"cache-1","type":"custom","position":{"x":350,"y":420},"data":{"componentId":"aws-elasticache","label":"ElastiCache Redis","config":{"size":"cache.t3.medium"}}},
    {"id":"s3-1","type":"custom","position":{"x":580,"y":420},"data":{"componentId":"aws-s3","label":"Object Storage","config":{}}},
    {"id":"img-1","type":"custom","position":{"x":580,"y":220},"data":{"componentId":"aws-ecr","label":"ECR Registry","config":{}}}
  ]'::jsonb,
  '[
    {"id":"e1","source":"alb-1","target":"eks-1","type":"smoothstep"},
    {"id":"e2","source":"eks-1","target":"rds-1","type":"smoothstep"},
    {"id":"e3","source":"eks-1","target":"cache-1","type":"smoothstep"},
    {"id":"e4","source":"eks-1","target":"s3-1","type":"smoothstep"},
    {"id":"e5","source":"img-1","target":"eks-1","type":"smoothstep"}
  ]'::jsonb
),

-- AWS Enterprise Multi-Tier
(
  '00000000-0000-0000-0000-000000000004',
  'AWS Enterprise Multi-Tier',
  'Production-grade 3-tier architecture: CloudFront CDN, ECS containers, Aurora RDS, ElastiCache, and VPC networking.',
  'enterprise',
  'aws',
  true,
  '[
    {"id":"cf-1","type":"custom","position":{"x":300,"y":40},"data":{"componentId":"aws-cloudfront","label":"CloudFront CDN","config":{}}},
    {"id":"alb-1","type":"custom","position":{"x":300,"y":160},"data":{"componentId":"aws-alb","label":"Load Balancer","config":{}}},
    {"id":"ecs-1","type":"custom","position":{"x":150,"y":300},"data":{"componentId":"aws-ecs","label":"ECS Service","config":{"size":"t3-large","replicas":3}}},
    {"id":"ecs-2","type":"custom","position":{"x":450,"y":300},"data":{"componentId":"aws-ecs","label":"Worker ECS","config":{"size":"t3-medium","replicas":2}}},
    {"id":"aurora-1","type":"custom","position":{"x":150,"y":460},"data":{"componentId":"aws-aurora","label":"Aurora Primary","config":{"size":"db.r5.large","replicas":2}}},
    {"id":"cache-1","type":"custom","position":{"x":450,"y":460},"data":{"componentId":"aws-elasticache","label":"Session Cache","config":{"size":"cache.r6g.large"}}},
    {"id":"sqs-1","type":"custom","position":{"x":650,"y":300},"data":{"componentId":"aws-sqs","label":"Task Queue","config":{}}}
  ]'::jsonb,
  '[
    {"id":"e1","source":"cf-1","target":"alb-1","type":"smoothstep"},
    {"id":"e2","source":"alb-1","target":"ecs-1","type":"smoothstep"},
    {"id":"e3","source":"alb-1","target":"ecs-2","type":"smoothstep"},
    {"id":"e4","source":"ecs-1","target":"aurora-1","type":"smoothstep"},
    {"id":"e5","source":"ecs-1","target":"cache-1","type":"smoothstep"},
    {"id":"e6","source":"ecs-2","target":"sqs-1","type":"smoothstep"}
  ]'::jsonb
),

-- AWS Data Pipeline
(
  '00000000-0000-0000-0000-000000000005',
  'AWS Data Pipeline',
  'Real-time analytics pipeline: Kinesis ingestion, Lambda transformation, Redshift warehouse, and S3 data lake.',
  'data-pipeline',
  'aws',
  true,
  '[
    {"id":"kin-1","type":"custom","position":{"x":100,"y":200},"data":{"componentId":"aws-kinesis","label":"Kinesis Stream","config":{}}},
    {"id":"fn-1","type":"custom","position":{"x":300,"y":200},"data":{"componentId":"aws-lambda","label":"Transform Lambda","config":{"size":"512mb"}}},
    {"id":"rs-1","type":"custom","position":{"x":500,"y":100},"data":{"componentId":"aws-redshift","label":"Redshift DW","config":{"size":"dc2.large","replicas":2}}},
    {"id":"s3-1","type":"custom","position":{"x":500,"y":300},"data":{"componentId":"aws-s3","label":"Data Lake","config":{}}},
    {"id":"glue-1","type":"custom","position":{"x":700,"y":200},"data":{"componentId":"aws-glue","label":"Glue ETL","config":{}}}
  ]'::jsonb,
  '[
    {"id":"e1","source":"kin-1","target":"fn-1","type":"smoothstep"},
    {"id":"e2","source":"fn-1","target":"rs-1","type":"smoothstep"},
    {"id":"e3","source":"fn-1","target":"s3-1","type":"smoothstep"},
    {"id":"e4","source":"s3-1","target":"glue-1","type":"smoothstep"}
  ]'::jsonb
),

-- Azure Web App Stack
(
  '00000000-0000-0000-0000-000000000006',
  'Azure Web App Stack',
  'Managed Azure web application: App Service, Azure SQL, Blob Storage, and Azure CDN.',
  'startup',
  'azure',
  true,
  '[
    {"id":"cdn-1","type":"custom","position":{"x":300,"y":60},"data":{"componentId":"azure-cdn","label":"Azure CDN","config":{}}},
    {"id":"app-1","type":"custom","position":{"x":300,"y":220},"data":{"componentId":"azure-app-service","label":"App Service","config":{"size":"P2v3","replicas":2}}},
    {"id":"sql-1","type":"custom","position":{"x":150,"y":400},"data":{"componentId":"azure-sql","label":"Azure SQL","config":{"size":"Standard S2"}}},
    {"id":"blob-1","type":"custom","position":{"x":450,"y":400},"data":{"componentId":"azure-storage","label":"Blob Storage","config":{}}}
  ]'::jsonb,
  '[
    {"id":"e1","source":"cdn-1","target":"app-1","type":"smoothstep"},
    {"id":"e2","source":"app-1","target":"sql-1","type":"smoothstep"},
    {"id":"e3","source":"app-1","target":"blob-1","type":"smoothstep"}
  ]'::jsonb
),

-- Azure AKS Microservices
(
  '00000000-0000-0000-0000-000000000007',
  'Azure AKS Microservices',
  'Kubernetes microservices on Azure AKS with Azure Database for PostgreSQL, Redis Cache, and Application Gateway.',
  'microservices',
  'azure',
  true,
  '[
    {"id":"agw-1","type":"custom","position":{"x":300,"y":60},"data":{"componentId":"azure-application-gateway","label":"App Gateway","config":{}}},
    {"id":"aks-1","type":"custom","position":{"x":300,"y":230},"data":{"componentId":"azure-aks","label":"AKS Cluster","config":{"size":"Standard_D4s_v3","replicas":3}}},
    {"id":"pg-1","type":"custom","position":{"x":100,"y":420},"data":{"componentId":"azure-postgresql","label":"PostgreSQL Flexible","config":{"size":"Standard_D2s_v3"}}},
    {"id":"redis-1","type":"custom","position":{"x":350,"y":420},"data":{"componentId":"azure-redis","label":"Azure Cache Redis","config":{"size":"C2"}}},
    {"id":"acr-1","type":"custom","position":{"x":580,"y":230},"data":{"componentId":"azure-container-registry","label":"Container Registry","config":{}}}
  ]'::jsonb,
  '[
    {"id":"e1","source":"agw-1","target":"aks-1","type":"smoothstep"},
    {"id":"e2","source":"aks-1","target":"pg-1","type":"smoothstep"},
    {"id":"e3","source":"aks-1","target":"redis-1","type":"smoothstep"},
    {"id":"e4","source":"acr-1","target":"aks-1","type":"smoothstep"}
  ]'::jsonb
)

ON CONFLICT (id) DO NOTHING;
