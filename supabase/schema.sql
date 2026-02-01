-- JobStack Database Schema for Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cleanup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS set_diagrams_updated_at ON public.diagrams;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP TABLE IF EXISTS public.exports CASCADE;
DROP TABLE IF EXISTS public.project_shares CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.diagrams CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Tables
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cloud_provider TEXT DEFAULT 'aws',
    status TEXT DEFAULT 'draft',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.diagrams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Main Diagram',
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    cloud_provider TEXT NOT NULL,
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.project_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    shared_with_email TEXT NOT NULL,
    permission TEXT DEFAULT 'view',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, shared_with_email)
);

CREATE TABLE public.exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    export_type TEXT NOT NULL,
    file_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_diagrams_project_id ON public.diagrams(project_id);
CREATE INDEX idx_templates_category ON public.templates(category);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "diagrams_select" ON public.diagrams FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = diagrams.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "diagrams_insert" ON public.diagrams FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = diagrams.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "diagrams_update" ON public.diagrams FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = diagrams.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "diagrams_delete" ON public.diagrams FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = diagrams.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "templates_select" ON public.templates FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "templates_insert" ON public.templates FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "shares_all" ON public.project_shares FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_shares.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "exports_select" ON public.exports FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = exports.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "exports_insert" ON public.exports FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = exports.project_id AND projects.user_id = auth.uid()));

-- Functions
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
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_diagrams_updated_at BEFORE UPDATE ON public.diagrams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
