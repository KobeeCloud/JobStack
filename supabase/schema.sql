-- JobStack Complete Database Schema-- JobStack Database Schema

-- Run this in Supabase SQL Editor-- Run this SQL in your Supabase SQL Editor

-- UWAGA: Ten skrypt USUWA wszystkie tabele i tworzy je od nowa!

-- Enable UUID extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";-- Enable UUID extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================

-- TABLES-- Drop existing triggers

-- =====================================================DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;



-- Projects table-- Drop existing functions

CREATE TABLE IF NOT EXISTS public.projects (DROP FUNCTION IF EXISTS public.handle_new_user();

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),DROP FUNCTION IF EXISTS public.generate_api_key();

  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,DROP FUNCTION IF EXISTS public.cleanup_expired_jobs();

  name TEXT NOT NULL,

  description TEXT,-- Drop existing policies

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),DO $$

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()BEGIN

);    -- Profiles

    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Diagrams table    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE TABLE IF NOT EXISTS public.diagrams (    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),    -- Candidate profiles

  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,    DROP POLICY IF EXISTS "Candidate profiles are viewable by employers and owner" ON public.candidate_profiles;

  name TEXT NOT NULL,    DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;

  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,    -- Jobs

  thumbnail_url TEXT,    DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    DROP POLICY IF EXISTS "Employers can insert jobs for their company" ON public.jobs;

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()    DROP POLICY IF EXISTS "Employers can update jobs for their company" ON public.jobs;

);    -- Applications

    DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;

-- Templates table    DROP POLICY IF EXISTS "Candidates can create applications" ON public.applications;

CREATE TABLE IF NOT EXISTS public.templates (    -- Saved jobs

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),    DROP POLICY IF EXISTS "Users can manage own saved jobs" ON public.saved_jobs;

  name TEXT NOT NULL,    -- Email alerts

  description TEXT,    DROP POLICY IF EXISTS "Users can manage own email alerts" ON public.email_alerts;

  category TEXT NOT NULL CHECK (category IN ('startup', 'enterprise', 'microservices', 'side-project', 'gaming')),EXCEPTION

  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,    WHEN undefined_table THEN NULL;

  thumbnail_url TEXT,    WHEN undefined_object THEN NULL;

  is_public BOOLEAN DEFAULT true,END $$;

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()-- Drop existing tables (CASCADE usunie też wszystkie zależności)

);DROP TABLE IF EXISTS public.email_alerts CASCADE;

DROP TABLE IF EXISTS public.saved_jobs CASCADE;

-- Project shares table (for collaboration)DROP TABLE IF EXISTS public.applications CASCADE;

CREATE TABLE IF NOT EXISTS public.project_shares (DROP TABLE IF EXISTS public.jobs CASCADE;

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),DROP TABLE IF EXISTS public.employer_profiles CASCADE;

  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,DROP TABLE IF EXISTS public.companies CASCADE;

  shared_with_email TEXT NOT NULL,DROP TABLE IF EXISTS public.candidate_profiles CASCADE;

  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),DROP TABLE IF EXISTS public.profiles CASCADE;

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(project_id, shared_with_email)-- Users table (extends Supabase auth.users)

);CREATE TABLE public.profiles (

  id UUID REFERENCES auth.users(id) PRIMARY KEY,

-- Exports table (track generated code exports)  email TEXT NOT NULL,

CREATE TABLE IF NOT EXISTS public.exports (  role TEXT NOT NULL CHECK (role IN ('candidate', 'employer')),

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

  export_type TEXT NOT NULL CHECK (export_type IN ('terraform', 'pulumi', 'cloudformation')),);

  code_content TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()-- Candidate profiles

);CREATE TABLE public.candidate_profiles (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

-- =====================================================  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

-- INDEXES for performance  first_name TEXT,

-- =====================================================  last_name TEXT,

  title TEXT,

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);  skills TEXT[],

CREATE INDEX IF NOT EXISTS idx_diagrams_project_id ON public.diagrams(project_id);  experience TEXT,

CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);  cv_url TEXT,

CREATE INDEX IF NOT EXISTS idx_templates_is_public ON public.templates(is_public);  portfolio_url TEXT,

CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON public.project_shares(project_id);  linkedin_url TEXT,

CREATE INDEX IF NOT EXISTS idx_exports_diagram_id ON public.exports(diagram_id);  github_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

-- =====================================================  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- ROW LEVEL SECURITY (RLS));

-- =====================================================

-- Companies

-- Enable RLS on all tablesCREATE TABLE public.companies (

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;  name TEXT NOT NULL,

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;  logo_url TEXT,

ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;  website TEXT,

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;  description TEXT,

  api_key TEXT UNIQUE,

-- =====================================================  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),

-- RLS POLICIES - Projects  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

-- =====================================================  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Users can view their own projects);

CREATE POLICY "Users can view own projects"

  ON public.projects FOR SELECT-- Employer profiles

  USING (auth.uid() = user_id);CREATE TABLE public.employer_profiles (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

-- Users can create their own projects  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

CREATE POLICY "Users can create own projects"  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  ON public.projects FOR INSERT  position TEXT,

  WITH CHECK (auth.uid() = user_id);  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Users can update their own projects);

CREATE POLICY "Users can update own projects"

  ON public.projects FOR UPDATE-- Jobs

  USING (auth.uid() = user_id);CREATE TABLE public.jobs (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

-- Users can delete their own projects  title TEXT NOT NULL,

CREATE POLICY "Users can delete own projects"  company_id UUID REFERENCES public.companies(id),

  ON public.projects FOR DELETE  company_name TEXT NOT NULL, -- For scraped jobs without company_id

  USING (auth.uid() = user_id);  company_logo TEXT,

  location TEXT NOT NULL,

-- Users can view shared projects  remote BOOLEAN DEFAULT false,

CREATE POLICY "Users can view shared projects"  salary_min INTEGER,

  ON public.projects FOR SELECT  salary_max INTEGER,

  USING (  salary_currency TEXT DEFAULT 'PLN',

    EXISTS (  salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly')),

      SELECT 1 FROM public.project_shares  salary_mode TEXT DEFAULT 'gross' CHECK (salary_mode IN ('gross', 'net')),

      WHERE project_shares.project_id = projects.id  hourly_min INTEGER,

      AND project_shares.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())  hourly_max INTEGER,

    )  tech_stack TEXT[],

  );  contract_type TEXT,

  work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),

-- =====================================================  seniority TEXT,

-- RLS POLICIES - Diagrams  required_language TEXT,

-- =====================================================  language_level TEXT,

  recruitment_stages TEXT[],

-- Users can view diagrams in their own projects  tags TEXT[],

CREATE POLICY "Users can view diagrams in own projects"  description TEXT NOT NULL,

  ON public.diagrams FOR SELECT  requirements TEXT[],

  USING (  benefits TEXT[],

    EXISTS (  source TEXT NOT NULL CHECK (source IN ('native', 'justjoinit', 'nofluffjobs', 'pracuj', 'indeed', 'bulldogjob', 'rocketjobs')),

      SELECT 1 FROM public.projects  source_url TEXT,

      WHERE projects.id = diagrams.project_id  source_id TEXT, -- Original ID from source

      AND projects.user_id = auth.uid()  featured BOOLEAN DEFAULT false,

    )  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  );  expires_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

-- Users can create diagrams in their own projects  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

CREATE POLICY "Users can create diagrams in own projects"

  ON public.diagrams FOR INSERT  -- For deduplication

  WITH CHECK (  UNIQUE(source, source_id)

    EXISTS ();

      SELECT 1 FROM public.projects

      WHERE projects.id = diagrams.project_id-- Applications

      AND projects.user_id = auth.uid()CREATE TABLE public.applications (

    )  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  );  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,

  candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

-- Users can update diagrams in their own projects  first_name TEXT,

CREATE POLICY "Users can update diagrams in own projects"  last_name TEXT,

  ON public.diagrams FOR UPDATE  email TEXT,

  USING (  phone TEXT,

    EXISTS (  years_experience INTEGER,

      SELECT 1 FROM public.projects  current_position TEXT,

      WHERE projects.id = diagrams.project_id  expected_salary_min INTEGER,

      AND projects.user_id = auth.uid()  expected_salary_max INTEGER,

    )  available_from DATE,

  );  linkedin_url TEXT,

  github_url TEXT,

-- Users can delete diagrams in their own projects  portfolio_url TEXT,

CREATE POLICY "Users can delete diagrams in own projects"  cv_url TEXT,

  ON public.diagrams FOR DELETE  cover_letter TEXT,

  USING (  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'rejected', 'hired')),

    EXISTS (  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      SELECT 1 FROM public.projects  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      WHERE projects.id = diagrams.project_id

      AND projects.user_id = auth.uid()  -- One application per job per candidate or email

    )  UNIQUE NULLS NOT DISTINCT (job_id, candidate_id, email)

  ););



-- Users can view diagrams in shared projects-- Saved jobs

CREATE POLICY "Users can view diagrams in shared projects"CREATE TABLE public.saved_jobs (

  ON public.diagrams FOR SELECT  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  USING (  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    EXISTS (  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,

      SELECT 1 FROM public.project_shares ps  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      JOIN public.projects p ON p.id = ps.project_id

      WHERE p.id = diagrams.project_id  -- One save per job per user

      AND ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())  UNIQUE(user_id, job_id)

    ));

  );

-- Email alerts

-- Users can edit diagrams in shared projects (if permission is 'edit')CREATE TABLE public.email_alerts (

CREATE POLICY "Users can edit diagrams in shared projects"  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  ON public.diagrams FOR UPDATE  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  USING (  name TEXT NOT NULL,

    EXISTS (  filters JSONB NOT NULL, -- Store JobFilters as JSON

      SELECT 1 FROM public.project_shares ps  frequency TEXT NOT NULL CHECK (frequency IN ('instant', 'daily', 'weekly')),

      JOIN public.projects p ON p.id = ps.project_id  enabled BOOLEAN DEFAULT true,

      WHERE p.id = diagrams.project_id  last_sent_at TIMESTAMP WITH TIME ZONE,

      AND ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      AND ps.permission = 'edit'  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

    ));

  );

-- Indexes for performance

-- =====================================================CREATE INDEX idx_jobs_source ON public.jobs(source);

-- RLS POLICIES - TemplatesCREATE INDEX idx_jobs_published_at ON public.jobs(published_at DESC);

-- =====================================================CREATE INDEX idx_jobs_featured ON public.jobs(featured) WHERE featured = true;

CREATE INDEX idx_jobs_tech_stack ON public.jobs USING GIN(tech_stack);

-- Everyone can view public templatesCREATE INDEX idx_jobs_location ON public.jobs(location);

CREATE POLICY "Public templates viewable by all"CREATE INDEX idx_jobs_remote ON public.jobs(remote) WHERE remote = true;

  ON public.templates FOR SELECTCREATE INDEX idx_jobs_expires_at ON public.jobs(expires_at);

  USING (is_public = true OR created_by = auth.uid());CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);

CREATE INDEX idx_applications_job_id ON public.applications(job_id);

-- Users can create templatesCREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);

CREATE POLICY "Users can create templates"

  ON public.templates FOR INSERT-- Full-text search index

  WITH CHECK (auth.uid() = created_by);ALTER TABLE public.jobs ADD COLUMN search_vector tsvector

  GENERATED ALWAYS AS (

-- Users can update their own templates    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||

CREATE POLICY "Users can update own templates"    setweight(to_tsvector('english', coalesce(company_name, '')), 'B') ||

  ON public.templates FOR UPDATE    setweight(to_tsvector('english', coalesce(description, '')), 'C')

  USING (auth.uid() = created_by);  ) STORED;



-- Users can delete their own templatesCREATE INDEX idx_jobs_search ON public.jobs USING GIN(search_vector);

CREATE POLICY "Users can delete own templates"

  ON public.templates FOR DELETE-- Row Level Security (RLS)

  USING (auth.uid() = created_by);ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - Project SharesALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- =====================================================ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Project owners can manage sharesALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can manage shares"ALTER TABLE public.email_alerts ENABLE ROW LEVEL SECURITY;

  ON public.project_shares FOR ALL

  USING (-- RLS Policies for profiles

    EXISTS (CREATE POLICY "Public profiles are viewable by everyone"

      SELECT 1 FROM public.projects  ON public.profiles FOR SELECT

      WHERE projects.id = project_shares.project_id  USING (true);

      AND projects.user_id = auth.uid()

    )CREATE POLICY "Users can insert own profile"

  );  ON public.profiles FOR INSERT

  WITH CHECK (auth.uid() = id);

-- Shared users can view their shares

CREATE POLICY "Shared users can view their shares"CREATE POLICY "Users can update own profile"

  ON public.project_shares FOR SELECT  ON public.profiles FOR UPDATE

  USING (  USING (auth.uid() = id);

    shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())

  );-- RLS Policies for candidate_profiles

CREATE POLICY "Candidate profiles are viewable by employers and owner"

-- =====================================================  ON public.candidate_profiles FOR SELECT

-- RLS POLICIES - Exports  USING (

-- =====================================================    auth.uid() = user_id OR

    EXISTS (

-- Users can view exports from their diagrams      SELECT 1 FROM public.profiles

CREATE POLICY "Users can view own exports"      WHERE id = auth.uid() AND role = 'employer'

  ON public.exports FOR SELECT    )

  USING (  );

    EXISTS (

      SELECT 1 FROM public.diagrams dCREATE POLICY "Users can insert own candidate profile"

      JOIN public.projects p ON p.id = d.project_id  ON public.candidate_profiles FOR INSERT

      WHERE d.id = exports.diagram_id  WITH CHECK (auth.uid() = user_id);

      AND p.user_id = auth.uid()

    )CREATE POLICY "Users can update own candidate profile"

  );  ON public.candidate_profiles FOR UPDATE

  USING (auth.uid() = user_id);

-- Users can create exports for their diagrams

CREATE POLICY "Users can create exports"CREATE POLICY "Users can delete own candidate profile"

  ON public.exports FOR INSERT  ON public.candidate_profiles FOR DELETE

  WITH CHECK (  USING (auth.uid() = user_id);

    EXISTS (

      SELECT 1 FROM public.diagrams d-- RLS Policies for employer_profiles

      JOIN public.projects p ON p.id = d.project_idCREATE POLICY "Employers can view own employer profile"

      WHERE d.id = exports.diagram_id  ON public.employer_profiles FOR SELECT

      AND p.user_id = auth.uid()  USING (auth.uid() = user_id);

    )

  );CREATE POLICY "Employers can insert own employer profile"

  ON public.employer_profiles FOR INSERT

-- =====================================================  WITH CHECK (auth.uid() = user_id);

-- FUNCTIONS

-- =====================================================CREATE POLICY "Employers can update own employer profile"

  ON public.employer_profiles FOR UPDATE

-- Function to update updated_at timestamp  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_updated_at()

RETURNS TRIGGER AS $$CREATE POLICY "Employers can delete own employer profile"

BEGIN  ON public.employer_profiles FOR DELETE

  NEW.updated_at = NOW();  USING (auth.uid() = user_id);

  RETURN NEW;

END;-- RLS Policies for jobs (public viewing)

$$ LANGUAGE plpgsql;CREATE POLICY "Jobs are viewable by everyone"

  ON public.jobs FOR SELECT

-- Triggers for updated_at  USING (expires_at IS NULL OR expires_at > NOW());

CREATE TRIGGER set_projects_updated_at

  BEFORE UPDATE ON public.projectsCREATE POLICY "Scraped jobs can be inserted by service role"

  FOR EACH ROW  ON public.jobs FOR INSERT

  EXECUTE FUNCTION public.handle_updated_at();  WITH CHECK (

    source != 'native' OR

CREATE TRIGGER set_diagrams_updated_at    EXISTS (

  BEFORE UPDATE ON public.diagrams      SELECT 1 FROM public.employer_profiles

  FOR EACH ROW      WHERE user_id = auth.uid() AND company_id = jobs.company_id

  EXECUTE FUNCTION public.handle_updated_at();    )

  );

-- =====================================================

-- SEED DATA - TemplatesCREATE POLICY "Scraped jobs can be updated by service role"

-- =====================================================  ON public.jobs FOR UPDATE

  USING (

-- Insert default templates    source != 'native' OR

INSERT INTO public.templates (name, description, category, data, is_public, created_by) VALUES    EXISTS (

(      SELECT 1 FROM public.employer_profiles

  'Startup MVP',      WHERE user_id = auth.uid() AND company_id = jobs.company_id

  'Cost-effective architecture for startups. Uses free tiers: Vercel for frontend, Supabase for database and auth.',    )

  'startup',  );

  '{"nodes": [

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},CREATE POLICY "Employers can delete their jobs"

    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "vercel", "label": "Vercel Hosting"}},  ON public.jobs FOR DELETE

    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},  USING (

    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "supabase", "label": "Supabase (DB + Auth)"}}    EXISTS (

  ], "edges": [      SELECT 1 FROM public.employer_profiles

    {"id": "e1-2", "source": "1", "target": "2"},      WHERE user_id = auth.uid() AND company_id = jobs.company_id

    {"id": "e1-3", "source": "1", "target": "3"},    )

    {"id": "e3-4", "source": "3", "target": "4"}  );

  ]}'::jsonb,

  true,-- RLS Policies for applications

  NULLCREATE POLICY "Users can view own applications"

),  ON public.applications FOR SELECT

(  USING (

  'Enterprise E-Commerce',    auth.uid() = candidate_id OR

  'Highly scalable e-commerce architecture with auto-scaling, caching, and CDN.',    EXISTS (

  'enterprise',      SELECT 1 FROM public.employer_profiles ep

  '{"nodes": [      JOIN public.jobs j ON j.company_id = ep.company_id

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},      WHERE ep.user_id = auth.uid() AND j.id = applications.job_id

    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "aws_cloudfront", "label": "CloudFront CDN"}},    )

    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_alb", "label": "Application Load Balancer"}},  );

    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "aws_ecs", "label": "ECS Fargate"}},

    {"id": "5", "type": "component", "position": {"x": 700, "y": 100}, "data": {"componentId": "redis", "label": "ElastiCache Redis"}},CREATE POLICY "Candidates can create applications"

    {"id": "6", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "postgresql", "label": "RDS PostgreSQL"}}  ON public.applications FOR INSERT

  ], "edges": [  WITH CHECK (auth.uid() = candidate_id OR candidate_id IS NULL);

    {"id": "e1-2", "source": "1", "target": "2"},

    {"id": "e2-3", "source": "2", "target": "3"},-- RLS Policies for saved_jobs

    {"id": "e3-4", "source": "3", "target": "4"},CREATE POLICY "Users can manage own saved jobs"

    {"id": "e4-5", "source": "4", "target": "5"},  ON public.saved_jobs FOR ALL

    {"id": "e4-6", "source": "4", "target": "6"}  USING (auth.uid() = user_id);

  ]}'::jsonb,

  true,-- RLS Policies for email_alerts

  NULLCREATE POLICY "Users can manage own email alerts"

),  ON public.email_alerts FOR ALL

(  USING (auth.uid() = user_id);

  'Microservices Architecture',

  'Modern microservices setup with Kubernetes, service mesh, and message queuing.',-- Functions

  'microservices',CREATE OR REPLACE FUNCTION public.handle_new_user()

  '{"nodes": [RETURNS TRIGGER AS $$

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "Web App"}},DECLARE

    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "API Gateway"}},  user_role TEXT;

    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "kubernetes", "label": "Auth Service (K8s)"}},BEGIN

    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "kubernetes", "label": "User Service (K8s)"}},  -- Get role from metadata or default to 'candidate'

    {"id": "5", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "kubernetes", "label": "Order Service (K8s)"}},  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidate');

    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "postgresql", "label": "PostgreSQL"}}

  ], "edges": [  -- Insert into profiles

    {"id": "e1-2", "source": "1", "target": "2"},  INSERT INTO public.profiles (id, email, role)

    {"id": "e2-3", "source": "2", "target": "3"},  VALUES (NEW.id, NEW.email, user_role)

    {"id": "e2-4", "source": "2", "target": "4"},  ON CONFLICT (id) DO NOTHING;

    {"id": "e2-5", "source": "2", "target": "5"},

    {"id": "e3-6", "source": "3", "target": "6"},  -- Create corresponding profile based on role

    {"id": "e4-6", "source": "4", "target": "6"},  IF user_role = 'candidate' THEN

    {"id": "e5-6", "source": "5", "target": "6"}    INSERT INTO public.candidate_profiles (user_id)

  ]}'::jsonb,    VALUES (NEW.id)

  true,    ON CONFLICT DO NOTHING;

  NULL  ELSIF user_role = 'employer' THEN

),    INSERT INTO public.employer_profiles (user_id)

(    VALUES (NEW.id)

  'Side Project / Hobby',    ON CONFLICT DO NOTHING;

  'Minimal cost architecture using free tiers and cheap services. Perfect for personal projects.',  END IF;

  'side-project',

  '{"nodes": [  RETURN NEW;

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React App"}},END;

    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "cloudflare_pages", "label": "Cloudflare Pages"}},$$ LANGUAGE plpgsql SECURITY DEFINER;

    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},

    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "railway", "label": "Railway"}},-- Trigger to create profile on signup

    {"id": "5", "type": "component", "position": {"x": 700, "y": 175}, "data": {"componentId": "postgresql", "label": "PlanetScale DB"}}DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  ], "edges": [CREATE TRIGGER on_auth_user_created

    {"id": "e1-2", "source": "1", "target": "2"},  AFTER INSERT ON auth.users

    {"id": "e1-3", "source": "1", "target": "3"},  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    {"id": "e3-4", "source": "3", "target": "4"},

    {"id": "e3-5", "source": "3", "target": "5"}-- Function to generate API key

  ]}'::jsonb,CREATE OR REPLACE FUNCTION public.generate_api_key()

  true,RETURNS TEXT AS $$

  NULLBEGIN

),  RETURN 'jbs_' || encode(gen_random_bytes(32), 'hex');

(END;

  'Real-time Gaming Backend',$$ LANGUAGE plpgsql;

  'Low-latency gaming backend with WebSocket support, session management, and player data storage.',

  'gaming',-- Function to cleanup expired jobs

  '{"nodes": [CREATE OR REPLACE FUNCTION public.cleanup_expired_jobs()

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "game_client", "label": "Game Client"}},RETURNS void AS $$

    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "WebSocket API Gateway"}},BEGIN

    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "aws_lambda", "label": "Match Making"}},  DELETE FROM public.jobs

    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "aws_ecs", "label": "Game Servers"}},  WHERE expires_at < NOW() - INTERVAL '30 days';

    {"id": "5", "type": "component", "position": {"x": 1000, "y": 50}, "data": {"componentId": "redis", "label": "Redis (Sessions)"}},END;

    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "dynamodb", "label": "DynamoDB (Player Data)"}}$$ LANGUAGE plpgsql;

  ], "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e2-3", "source": "2", "target": "3"},
    {"id": "e2-4", "source": "2", "target": "4"},
    {"id": "e3-5", "source": "3", "target": "5"},
    {"id": "e4-6", "source": "4", "target": "6"}
  ]}'::jsonb,
  true,
  NULL
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.diagrams TO authenticated;
GRANT SELECT ON public.templates TO anon, authenticated;
GRANT ALL ON public.templates TO authenticated;
GRANT ALL ON public.project_shares TO authenticated;
GRANT ALL ON public.exports TO authenticated;

-- Grant sequence permissions (for auto-increment IDs if needed)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMPLETED
-- =====================================================

-- Schema setup complete!
-- Next steps:
-- 1. Go to Supabase Auth settings and enable Email provider
-- 2. Configure email templates for signup/password reset
-- 3. Test authentication flow
-- 4. Create a test user and project
