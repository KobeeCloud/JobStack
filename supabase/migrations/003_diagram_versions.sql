-- Project versioning for diagram snapshots
-- Each version stores a complete snapshot of nodes and edges

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

CREATE INDEX IF NOT EXISTS idx_diagram_versions_diagram
  ON public.diagram_versions (diagram_id, version_number DESC);

-- RLS
ALTER TABLE public.diagram_versions ENABLE ROW LEVEL SECURITY;

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

-- Grant access
GRANT ALL ON public.diagram_versions TO authenticated;
GRANT SELECT ON public.diagram_versions TO anon;
