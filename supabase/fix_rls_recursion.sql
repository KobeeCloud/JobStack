-- ============================================================================
-- DEPRECATED — Ten plik nie jest już potrzebny.
--
-- Wszystkie poprawki rekurencji RLS zostały włączone do głównego pliku:
--   supabase/schema.sql (wersja 4.0 — idempotentna)
--
-- Schema.sql zawiera już:
--   - Funkcje SECURITY DEFINER (is_org_member, get_org_role, is_org_owner, is_org_admin_or_owner)
--   - Bezpieczne polityki RLS na organization_members
--   - DROP POLICY IF EXISTS + CREATE POLICY (idempotentne)
--
-- Ten plik zachowano wyłącznie dla historii. NIE uruchamiaj go osobno.
-- ============================================================================

-- ORYGINALNY OPIS:
-- MIGRACJA: Naprawa nieskończonej rekurencji RLS w organization_members
--
-- PROBLEM: Polityki RLS na tabeli organization_members odwoływały się do
-- tej samej tabeli w subqueries EXISTS, co powodowało:
--   "infinite recursion detected in policy for relation organization_members"
--
-- ROZWIĄZANIE: Funkcje SECURITY DEFINER, które omijają RLS.
--
-- INSTRUKCJA: Uruchom ten SQL w Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================================

-- ============================================================================
-- KROK 1: Tworzenie funkcji pomocniczych SECURITY DEFINER
-- ============================================================================

-- Sprawdza czy user jest członkiem organizacji
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id AND user_id = p_user_id
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Pobiera rolę usera w organizacji
CREATE OR REPLACE FUNCTION public.get_org_role(p_org_id UUID, p_user_id UUID)
RETURNS org_role AS $$
    SELECT role FROM public.organization_members
    WHERE organization_id = p_org_id AND user_id = p_user_id
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Sprawdza czy user jest właścicielem organizacji (tabela organizations, nie members)
CREATE OR REPLACE FUNCTION public.is_org_owner(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = p_org_id AND owner_id = p_user_id
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Sprawdza czy user ma rolę admin lub owner w organizacji
CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id AND user_id = p_user_id AND role IN ('owner', 'admin')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Uprawnienia
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin_or_owner(UUID, UUID) TO authenticated;

-- ============================================================================
-- KROK 2: Usunięcie starych polityk (powodujących rekurencję)
-- ============================================================================

-- Organizations
DROP POLICY IF EXISTS "orgs_select" ON public.organizations;

-- Organization Members (GŁÓWNY PROBLEM)
DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_insert" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_update" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_delete" ON public.organization_members;

-- Organization Invites
DROP POLICY IF EXISTS "org_invites_select" ON public.organization_invites;
DROP POLICY IF EXISTS "org_invites_insert" ON public.organization_invites;
DROP POLICY IF EXISTS "org_invites_delete" ON public.organization_invites;

-- Projects
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- Diagrams
DROP POLICY IF EXISTS "diagrams_select" ON public.diagrams;
DROP POLICY IF EXISTS "diagrams_insert" ON public.diagrams;
DROP POLICY IF EXISTS "diagrams_update" ON public.diagrams;
DROP POLICY IF EXISTS "diagrams_delete" ON public.diagrams;

-- Custom Components
DROP POLICY IF EXISTS "custom_components_select" ON public.custom_components;
DROP POLICY IF EXISTS "custom_components_insert" ON public.custom_components;
DROP POLICY IF EXISTS "custom_components_update" ON public.custom_components;
DROP POLICY IF EXISTS "custom_components_delete" ON public.custom_components;

-- Subscriptions
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;

-- Activity Log
DROP POLICY IF EXISTS "activity_log_select" ON public.activity_log;

-- Project Tags
DROP POLICY IF EXISTS "project_tags_select" ON public.project_tags;

-- ============================================================================
-- KROK 3: Tworzenie nowych polityk (bez rekurencji)
-- ============================================================================

-- ---- Organizations ----
CREATE POLICY "orgs_select" ON public.organizations FOR SELECT USING (
    owner_id = auth.uid()
    OR public.is_org_member(id, auth.uid())
);

-- ---- Organization Members (BEZ REKURENCJI!) ----
CREATE POLICY "org_members_select" ON public.organization_members FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_org_member(organization_id, auth.uid())
);

CREATE POLICY "org_members_insert" ON public.organization_members FOR INSERT WITH CHECK (
    -- Owner organizacji może dodawać członków
    public.is_org_owner(organization_id, auth.uid())
    -- Istniejący admin/owner może dodawać
    OR public.is_org_admin_or_owner(organization_id, auth.uid())
    -- Użytkownik może dodać siebie po akceptacji zaproszenia
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
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()))
);

CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
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

-- ---- Custom Components ----
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
CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
);

-- ---- Activity Log ----
CREATE POLICY "activity_log_select" ON public.activity_log FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_admin_or_owner(organization_id, auth.uid()))
);

-- ---- Project Tags ----
CREATE POLICY "project_tags_select" ON public.project_tags FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_tags.project_id AND user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_tags.project_id
        AND p.organization_id IS NOT NULL
        AND public.is_org_member(p.organization_id, auth.uid())
    )
);

-- ============================================================================
-- GOTOWE! Teraz polityki RLS nie powodują nieskończonej rekurencji.
-- ============================================================================
