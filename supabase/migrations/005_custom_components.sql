-- Custom component library for organizations

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

CREATE INDEX IF NOT EXISTS idx_custom_components_org
  ON public.custom_components (organization_id);

-- RLS
ALTER TABLE public.custom_components ENABLE ROW LEVEL SECURITY;

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

-- Grant access
GRANT ALL ON public.custom_components TO authenticated;
GRANT SELECT ON public.custom_components TO anon;

-- Updated at trigger
CREATE TRIGGER set_custom_components_updated_at BEFORE UPDATE ON public.custom_components
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
