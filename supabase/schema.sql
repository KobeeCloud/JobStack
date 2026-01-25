-- JobStack - Visual Infrastructure Planning Tool
-- Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CLEAN UP (Safe - no errors if objects don't exist)
-- =====================================================

-- Drop triggers (safe - IF EXISTS prevents errors)
DO $$
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
    DROP TRIGGER IF EXISTS set_diagrams_updated_at ON public.diagrams;
    DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Drop tables
DROP TABLE IF EXISTS public.exports CASCADE;
DROP TABLE IF EXISTS public.project_shares CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.diagrams CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagrams table (stores React Flow diagram state)
CREATE TABLE public.diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Diagram',
  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table (pre-built architecture templates)
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('startup', 'enterprise', 'microservices', 'side-project', 'gaming')),
  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project shares table (for collaboration)
CREATE TABLE public.project_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  shared_with_email TEXT NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, shared_with_email)
);

-- Exports table (track generated Terraform/Pulumi code exports)
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('terraform', 'pulumi', 'cloudformation')),
  code_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

CREATE INDEX idx_diagrams_project_id ON public.diagrams(project_id);
CREATE INDEX idx_diagrams_created_at ON public.diagrams(created_at DESC);

CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_is_public ON public.templates(is_public);
CREATE INDEX idx_templates_created_by ON public.templates(created_by);

CREATE INDEX idx_project_shares_project_id ON public.project_shares(project_id);
CREATE INDEX idx_project_shares_email ON public.project_shares(shared_with_email);

CREATE INDEX idx_exports_diagram_id ON public.exports(diagram_id);
CREATE INDEX idx_exports_created_at ON public.exports(created_at DESC);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - Profiles
-- =====================================================

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- RLS POLICIES - Projects
-- =====================================================

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_shares
      WHERE project_shares.project_id = projects.id
      AND project_shares.shared_with_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - Diagrams
-- =====================================================

CREATE POLICY "Users can view diagrams in own projects"
  ON public.diagrams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = diagrams.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view diagrams in shared projects"
  ON public.diagrams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_shares ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE p.id = diagrams.project_id
      AND ps.shared_with_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create diagrams in own projects"
  ON public.diagrams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = diagrams.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update diagrams in own projects"
  ON public.diagrams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = diagrams.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can edit diagrams in shared projects with edit permission"
  ON public.diagrams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_shares ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE p.id = diagrams.project_id
      AND ps.shared_with_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
      AND ps.permission = 'edit'
    )
  );

CREATE POLICY "Users can delete diagrams in own projects"
  ON public.diagrams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = diagrams.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - Templates
-- =====================================================

CREATE POLICY "Public templates viewable by all"
  ON public.templates FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
  ON public.templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates"
  ON public.templates FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- RLS POLICIES - Project Shares
-- =====================================================

CREATE POLICY "Project owners can manage shares"
  ON public.project_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_shares.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Shared users can view their shares"
  ON public.project_shares FOR SELECT
  USING (
    shared_with_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - Exports
-- =====================================================

CREATE POLICY "Users can view exports from their diagrams"
  ON public.exports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.diagrams d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.id = exports.diagram_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exports for their diagrams"
  ON public.exports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diagrams d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.id = exports.diagram_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their exports"
  ON public.exports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.diagrams d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.id = exports.diagram_id
      AND p.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_diagrams_updated_at
  BEFORE UPDATE ON public.diagrams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA - Default Templates
-- =====================================================

INSERT INTO public.templates (name, description, category, data, is_public) VALUES
(
  'Startup MVP',
  'Cost-effective architecture for startups. Uses free tiers: Vercel for frontend, Supabase for database and auth.',
  'startup',
  '{"nodes": [
    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},
    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "vercel", "label": "Vercel Hosting"}},
    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},
    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "supabase", "label": "Supabase (DB + Auth)"}}
  ], "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e1-3", "source": "1", "target": "3"},
    {"id": "e3-4", "source": "3", "target": "4"}
  ]}'::jsonb,
  true
),
(
  'Enterprise E-Commerce',
  'Highly scalable e-commerce architecture with auto-scaling, caching, and CDN.',
  'enterprise',
  '{"nodes": [
    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},
    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "aws_cloudfront", "label": "CloudFront CDN"}},
    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_alb", "label": "Application Load Balancer"}},
    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "aws_ecs", "label": "ECS Fargate"}},
    {"id": "5", "type": "component", "position": {"x": 700, "y": 100}, "data": {"componentId": "redis", "label": "ElastiCache Redis"}},
    {"id": "6", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "postgresql", "label": "RDS PostgreSQL"}}
  ], "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e2-3", "source": "2", "target": "3"},
    {"id": "e3-4", "source": "3", "target": "4"},
    {"id": "e4-5", "source": "4", "target": "5"},
    {"id": "e4-6", "source": "4", "target": "6"}
  ]}'::jsonb,
  true
),
(
  'Microservices Architecture',
  'Modern microservices setup with Kubernetes, service mesh, and message queuing.',
  'microservices',
  '{"nodes": [
    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "Web App"}},
    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "API Gateway"}},
    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "kubernetes", "label": "Auth Service (K8s)"}},
    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "kubernetes", "label": "User Service (K8s)"}},
    {"id": "5", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "kubernetes", "label": "Order Service (K8s)"}},
    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "postgresql", "label": "PostgreSQL"}}
  ], "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e2-3", "source": "2", "target": "3"},
    {"id": "e2-4", "source": "2", "target": "4"},
    {"id": "e2-5", "source": "2", "target": "5"},
    {"id": "e3-6", "source": "3", "target": "6"},
    {"id": "e4-6", "source": "4", "target": "6"},
    {"id": "e5-6", "source": "5", "target": "6"}
  ]}'::jsonb,
  true
),
(
  'Side Project / Hobby',
  'Minimal cost architecture using free tiers and cheap services. Perfect for personal projects.',
  'side-project',
  '{"nodes": [
    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React App"}},
    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "cloudflare_pages", "label": "Cloudflare Pages"}},
    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},
    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "railway", "label": "Railway"}},
    {"id": "5", "type": "component", "position": {"x": 700, "y": 175}, "data": {"componentId": "postgresql", "label": "PlanetScale DB"}}
  ], "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e1-3", "source": "1", "target": "3"},
    {"id": "e3-4", "source": "3", "target": "4"},
    {"id": "e3-5", "source": "3", "target": "5"}
  ]}'::jsonb,
  true
),
(
  'Real-time Gaming Backend',
  'Low-latency gaming backend with WebSocket support, session management, and player data storage.',
  'gaming',
  '{"nodes": [
    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "game_client", "label": "Game Client"}},
    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "WebSocket API Gateway"}},
    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "aws_lambda", "label": "Match Making"}},
    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "aws_ecs", "label": "Game Servers"}},
    {"id": "5", "type": "component", "position": {"x": 1000, "y": 50}, "data": {"componentId": "redis", "label": "Redis (Sessions)"}},
    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "dynamodb", "label": "DynamoDB (Player Data)"}}
  ], "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e2-3", "source": "2", "target": "3"},
    {"id": "e2-4", "source": "2", "target": "4"},
    {"id": "e3-5", "source": "3", "target": "5"},
    {"id": "e4-6", "source": "4", "target": "6"}
  ]}'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.diagrams TO authenticated;
GRANT SELECT ON public.templates TO anon, authenticated;
GRANT ALL ON public.templates TO authenticated;
GRANT ALL ON public.project_shares TO authenticated;
GRANT ALL ON public.exports TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS! ✅
-- =====================================================
-- Schema created successfully!
--
-- Tables:
-- ✅ profiles (user data)
-- ✅ projects (infrastructure projects)
-- ✅ diagrams (React Flow diagrams with nodes/edges)
-- ✅ templates (5 pre-built architectures)
-- ✅ project_shares (collaboration)
-- ✅ exports (generated Terraform/Pulumi code)
--
-- Next: Enable Email Auth in Supabase Dashboard
-- Then: Configure .env.local with your Supabase credentials
--
-- Ready to build! 🚀
