-- Updated RLS policies for organization-based project access

-- Drop old policies
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- Projects policies - allow access through organization membership
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (
    -- Owner can access
    user_id = auth.uid()
    OR
    -- Organization members can access
    (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
    ))
);

CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (
    -- User must be owner OR organization member with admin/owner role
    user_id = auth.uid()
    OR
    (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    ))
);

CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (
    -- Owner can update OR organization members with admin/owner role
    user_id = auth.uid()
    OR
    (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    ))
);

CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (
    -- Only owner or organization owner can delete
    user_id = auth.uid()
    OR
    (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
        AND role = 'owner'
    ))
);

-- Update organization policies to allow members to see their organizations
DROP POLICY IF EXISTS "orgs_select" ON public.organizations;

CREATE POLICY "orgs_select" ON public.organizations FOR SELECT USING (
    -- Owner can see
    owner_id = auth.uid()
    OR
    -- Members can see
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organizations.id
        AND user_id = auth.uid()
    )
);

-- Update organization members policies
DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_insert" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_update" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_delete" ON public.organization_members;

CREATE POLICY "org_members_select" ON public.organization_members FOR SELECT USING (
    -- Members can see other members of their organizations
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
    )
);

CREATE POLICY "org_members_insert" ON public.organization_members FOR INSERT WITH CHECK (
    -- Only organization owners/admins can add members
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_members.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
    OR
    -- Or when accepting an invite (user adds themselves)
    user_id = auth.uid()
);

CREATE POLICY "org_members_update" ON public.organization_members FOR UPDATE USING (
    -- Only owners/admins can update roles
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
);

CREATE POLICY "org_members_delete" ON public.organization_members FOR DELETE USING (
    -- Owners/admins can remove members OR users can remove themselves
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
);

-- Update organization invites policies
DROP POLICY IF EXISTS "org_invites_select" ON public.organization_invites;
DROP POLICY IF EXISTS "org_invites_insert" ON public.organization_invites;
DROP POLICY IF EXISTS "org_invites_delete" ON public.organization_invites;

CREATE POLICY "org_invites_select" ON public.organization_invites FOR SELECT USING (
    -- Invited user can see their invite
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Organization admins/owners can see invites
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_invites.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "org_invites_insert" ON public.organization_invites FOR INSERT WITH CHECK (
    -- Only organization admins/owners can create invites
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_invites.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "org_invites_delete" ON public.organization_invites FOR DELETE USING (
    -- Organization admins/owners can delete invites OR invited user can decline
    invited_by = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_invites.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);
