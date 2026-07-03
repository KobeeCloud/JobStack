CREATE OR REPLACE FUNCTION is_organization_member(p_organization_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public AS $func$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE organization_id = p_organization_id
      AND user_id = p_user_id
  );
$func$;

CREATE OR REPLACE FUNCTION has_organization_role(
  p_organization_id UUID,
  p_user_id UUID,
  p_roles org_role[]
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public AS $func$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE organization_id = p_organization_id
      AND user_id = p_user_id
      AND role = ANY (p_roles)
  );
$func$;

REVOKE ALL ON FUNCTION is_organization_member(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION has_organization_role(UUID, UUID, org_role[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION is_organization_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_organization_role(UUID, UUID, org_role[]) TO authenticated;

DROP POLICY IF EXISTS "orgs_select" ON organizations;
CREATE POLICY "orgs_select" ON organizations FOR SELECT
  USING (owner_id = auth.uid() OR is_organization_member(id, auth.uid()));

DROP POLICY IF EXISTS "om_select" ON organization_members;
DROP POLICY IF EXISTS "om_insert" ON organization_members;
DROP POLICY IF EXISTS "om_update" ON organization_members;
DROP POLICY IF EXISTS "om_delete" ON organization_members;

CREATE POLICY "om_select" ON organization_members FOR SELECT
  USING (user_id = auth.uid() OR is_organization_member(organization_id, auth.uid()));

CREATE POLICY "om_insert" ON organization_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid()) OR
  has_organization_role(organization_id, auth.uid(), ARRAY['owner', 'admin']::org_role[])
);

CREATE POLICY "om_update" ON organization_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid()) OR
  has_organization_role(organization_id, auth.uid(), ARRAY['owner', 'admin']::org_role[])
);

CREATE POLICY "om_delete" ON organization_members FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_id = auth.uid()) OR
  has_organization_role(organization_id, auth.uid(), ARRAY['owner', 'admin']::org_role[])
);
