-- ============================================================================
-- JobStack — Kompletny schemat bazy danych (Supabase)
-- Wersja: 3.0 — Propozycje A+B+C zaimplementowane
-- Data: 2026-02-09
-- ============================================================================

-- Rozszerzenia
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLEANUP — bezpieczne usuwanie istniejących obiektów
-- ============================================================================

-- Triggery
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS set_diagrams_updated_at ON public.diagrams;
DROP TRIGGER IF EXISTS set_organizations_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS set_webhooks_updated_at ON public.webhooks;
DROP TRIGGER IF EXISTS set_custom_components_updated_at ON public.custom_components;
DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;

-- Funkcje
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Tabele (w kolejności zależności — od liści do korzeni)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.project_tags CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.custom_components CASCADE;
DROP TABLE IF EXISTS public.webhooks CASCADE;
DROP TABLE IF EXISTS public.diagram_versions CASCADE;
DROP TABLE IF EXISTS public.exports CASCADE;
DROP TABLE IF EXISTS public.project_shares CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.diagrams CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.organization_invites CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Typy ENUM
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS org_role CASCADE;
DROP TYPE IF EXISTS cloud_provider CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS activity_action CASCADE;

-- ============================================================================
-- TYPY ENUM
-- ============================================================================

CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member', 'viewer');
-- [C] cloud_provider jako ENUM zamiast TEXT — wymusza poprawne wartości
CREATE TYPE cloud_provider AS ENUM ('aws', 'azure', 'gcp', 'vercel', 'netlify', 'cloudflare');
-- [A] typy dla nowych tabel
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error', 'invite', 'share', 'system');
CREATE TYPE activity_action AS ENUM (
    'project.created', 'project.updated', 'project.deleted', 'project.duplicated',
    'diagram.saved', 'diagram.exported', 'diagram.version_created',
    'org.created', 'org.member_added', 'org.member_removed', 'org.invite_sent',
    'share.created', 'share.revoked',
    'user.login', 'user.settings_changed', 'user.export_data', 'user.delete_requested'
);

-- ============================================================================
-- TABELE
-- ============================================================================

-- ---- Profil użytkownika ----
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_ends_at TIMESTAMPTZ,
    -- Soft-delete GDPR Art. 17 + ustawienia email
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    deletion_scheduled_for TIMESTAMPTZ DEFAULT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Organizacje ----
CREATE TABLE public.organizations (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Członkowie organizacji ----
CREATE TABLE public.organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role org_role DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ---- Zaproszenia do organizacji ----
CREATE TABLE public.organization_invites (
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
-- [C] cloud_provider zmieniony z TEXT na ENUM cloud_provider
CREATE TABLE public.projects (
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
CREATE TABLE public.diagrams (
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
CREATE TABLE public.diagram_versions (
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
CREATE TABLE public.templates (
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
-- [B] Dodano shared_with_user_id (FK) obok email — odporność na zmianę adresu
CREATE TABLE public.project_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    shared_with_email TEXT NOT NULL,
    shared_with_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT DEFAULT 'view',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, shared_with_email)
);

-- ---- Eksporty ----
CREATE TABLE public.exports (
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
CREATE TABLE public.webhooks (
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
CREATE TABLE public.custom_components (
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

-- ============================================================================
-- [B] NOWA TABELA: subscriptions — historia subskrypcji / płatności
-- ============================================================================

CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',  -- active, canceled, past_due, trialing
    payment_provider TEXT,                   -- stripe, paddle, manual
    external_subscription_id TEXT,           -- ID z payment provider
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT subscriptions_owner_check CHECK (user_id IS NOT NULL OR organization_id IS NOT NULL)
);

-- ============================================================================
-- [A] NOWA TABELA: activity_log — dziennik aktywności / audyt
-- ============================================================================

CREATE TABLE public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    action activity_action NOT NULL,
    resource_type TEXT NOT NULL,              -- 'project', 'diagram', 'organization', 'user'
    resource_id UUID,                        -- ID dotkniętego zasobu
    metadata JSONB DEFAULT '{}',             -- dodatkowe dane (nazwa, provider, itp.)
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- [A] NOWA TABELA: project_tags — tagowanie projektów
-- ============================================================================

CREATE TABLE public.project_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    tag TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, tag)
);

-- ============================================================================
-- [A] NOWA TABELA: notifications — powiadomienia wewnętrzne
-- ============================================================================

CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,                               -- opcjonalny link do zasobu
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEKSY
-- ============================================================================

-- Istniejące
CREATE INDEX idx_profiles_deletion ON public.profiles (deletion_scheduled_for) WHERE deletion_scheduled_for IS NOT NULL;
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_invites_email ON public.organization_invites(email);
CREATE INDEX idx_org_invites_token ON public.organization_invites(token);
CREATE INDEX idx_org_invites_org ON public.organization_invites(organization_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_diagrams_project_id ON public.diagrams(project_id);
CREATE INDEX idx_diagram_versions_diagram ON public.diagram_versions(diagram_id, version_number DESC);
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_public ON public.templates(is_public) WHERE is_public = true;
CREATE INDEX idx_exports_project_id ON public.exports(project_id);
CREATE INDEX idx_exports_diagram_id ON public.exports(diagram_id);
CREATE INDEX idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX idx_webhooks_org_id ON public.webhooks(organization_id);
CREATE INDEX idx_custom_components_org ON public.custom_components(organization_id);

-- [B] project_shares — indeks na user_id
CREATE INDEX idx_project_shares_user ON public.project_shares(shared_with_user_id) WHERE shared_with_user_id IS NOT NULL;
CREATE INDEX idx_project_shares_project ON public.project_shares(project_id);

-- [B] subscriptions
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_subscriptions_org ON public.subscriptions(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status) WHERE status = 'active';

-- [A] activity_log
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_org ON public.activity_log(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_activity_log_resource ON public.activity_log(resource_type, resource_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);

-- [A] project_tags
CREATE INDEX idx_project_tags_project ON public.project_tags(project_id);
CREATE INDEX idx_project_tags_tag ON public.project_tags(tag);

-- [A] notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- RLS — WŁĄCZENIE
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
-- POLITYKI RLS
-- ============================================================================

-- ---- Profiles ----
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ---- Organizations ----
CREATE POLICY "orgs_select" ON public.organizations FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organizations.id AND user_id = auth.uid()
    )
);
CREATE POLICY "orgs_insert" ON public.organizations FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "orgs_update" ON public.organizations FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "orgs_delete" ON public.organizations FOR DELETE USING (owner_id = auth.uid());

-- ---- Organization Members ----
CREATE POLICY "org_members_select" ON public.organization_members FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
    )
);
-- [B] NAPRAWIONY: owner organizacji może dodać siebie jako pierwszego membera
-- Poprzednia wersja wymagała istnienia membera — catch-22 przy tworzeniu org
CREATE POLICY "org_members_insert" ON public.organization_members FOR INSERT WITH CHECK (
    -- Owner organizacji może dodawać członków (w tym siebie jako pierwszego)
    EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = organization_members.organization_id
        AND owner_id = auth.uid()
    )
    -- Istniejący admin/owner może dodawać
    OR EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_members.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
    -- Użytkownik może dodać siebie (np. po akceptacji zaproszenia)
    OR (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.organization_invites
            WHERE organization_id = organization_members.organization_id
            AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND expires_at > NOW()
        )
    )
);
CREATE POLICY "org_members_update" ON public.organization_members FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
);
CREATE POLICY "org_members_delete" ON public.organization_members FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
);

-- ---- Organization Invites ----
CREATE POLICY "org_invites_select" ON public.organization_invites FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_invites.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);
CREATE POLICY "org_invites_insert" ON public.organization_invites FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_invites.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);
CREATE POLICY "org_invites_delete" ON public.organization_invites FOR DELETE USING (
    invited_by = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_invites.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);

-- ---- Projects ----
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = projects.organization_id AND user_id = auth.uid()
    ))
);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    ))
);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    ))
);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
        AND role = 'owner'
    ))
);

-- ---- Diagrams ----
CREATE POLICY "diagrams_select" ON public.diagrams FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = diagrams.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.organization_members om ON om.organization_id = p.organization_id
        WHERE p.id = diagrams.project_id AND om.user_id = auth.uid()
    )
);
CREATE POLICY "diagrams_insert" ON public.diagrams FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = diagrams.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.organization_members om ON om.organization_id = p.organization_id
        WHERE p.id = diagrams.project_id AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
);
CREATE POLICY "diagrams_update" ON public.diagrams FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = diagrams.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.organization_members om ON om.organization_id = p.organization_id
        WHERE p.id = diagrams.project_id AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
);
CREATE POLICY "diagrams_delete" ON public.diagrams FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = diagrams.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.organization_members om ON om.organization_id = p.organization_id
        WHERE p.id = diagrams.project_id AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
);

-- ---- Diagram Versions ----
CREATE POLICY "diagram_versions_select" ON public.diagram_versions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = diagram_versions.diagram_id AND p.user_id = auth.uid()
    )
);
CREATE POLICY "diagram_versions_insert" ON public.diagram_versions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = diagram_versions.diagram_id AND p.user_id = auth.uid()
    )
);
CREATE POLICY "diagram_versions_delete" ON public.diagram_versions FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = diagram_versions.diagram_id AND p.user_id = auth.uid()
    )
);

-- ---- Templates ----
CREATE POLICY "templates_select" ON public.templates FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "templates_insert" ON public.templates FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "templates_update" ON public.templates FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "templates_delete" ON public.templates FOR DELETE USING (created_by = auth.uid());

-- ---- Project Shares ----
-- [B] Rozszerzony: shared_with_user_id oprócz email
CREATE POLICY "shares_select" ON public.project_shares FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_shares.project_id AND user_id = auth.uid())
    OR shared_with_user_id = auth.uid()
    OR shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
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
CREATE POLICY "exports_select" ON public.exports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = exports.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = exports.diagram_id AND p.user_id = auth.uid()
    )
);
CREATE POLICY "exports_insert" ON public.exports FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = exports.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.diagrams d
        JOIN public.projects p ON d.project_id = p.id
        WHERE d.id = exports.diagram_id AND p.user_id = auth.uid()
    )
);

-- ---- Webhooks ----
CREATE POLICY "webhooks_select" ON public.webhooks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "webhooks_insert" ON public.webhooks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "webhooks_update" ON public.webhooks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "webhooks_delete" ON public.webhooks FOR DELETE USING (user_id = auth.uid());

-- ---- Custom Components ----
CREATE POLICY "custom_components_select" ON public.custom_components FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
    OR is_shared = true
);
CREATE POLICY "custom_components_insert" ON public.custom_components FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);
CREATE POLICY "custom_components_update" ON public.custom_components FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);
CREATE POLICY "custom_components_delete" ON public.custom_components FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- ---- [B] Subscriptions ----
CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);
-- INSERT/UPDATE/DELETE tylko przez service_role (backend/webhooks payment provider)

-- ---- [A] Activity Log ----
CREATE POLICY "activity_log_select" ON public.activity_log FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ))
);
CREATE POLICY "activity_log_insert" ON public.activity_log FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

-- ---- [A] Project Tags ----
CREATE POLICY "project_tags_select" ON public.project_tags FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.organization_members om ON om.organization_id = p.organization_id
        WHERE p.id = project_tags.project_id AND om.user_id = auth.uid()
    )
);
CREATE POLICY "project_tags_insert" ON public.project_tags FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
);
CREATE POLICY "project_tags_update" ON public.project_tags FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
);
CREATE POLICY "project_tags_delete" ON public.project_tags FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
);

-- ---- [A] Notifications ----
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete" ON public.notifications FOR DELETE USING (user_id = auth.uid());
-- INSERT przez service_role lub trigger: nie pozwalamy userowi tworzyć sobie notyfikacji

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
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERY
-- ============================================================================

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_diagrams_updated_at
    BEFORE UPDATE ON public.diagrams
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_webhooks_updated_at
    BEFORE UPDATE ON public.webhooks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_custom_components_updated_at
    BEFORE UPDATE ON public.custom_components
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.diagrams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_components;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- UPRAWNIENIA
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.templates TO anon;
GRANT SELECT ON public.custom_components TO anon;
GRANT SELECT ON public.diagram_versions TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
