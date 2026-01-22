-- JobStack Database Schema-- JobStack Complete Database Schema-- JobStack Database Schema

-- Run this SQL in your Supabase SQL Editor

-- Run this in Supabase SQL Editor-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";-- UWAGA: Ten skrypt USUWA wszystkie tabele i tworzy je od nowa!



-- Drop existing triggers-- Enable UUID extension

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";-- Enable UUID extension

-- Drop existing functions

DROP FUNCTION IF EXISTS public.handle_new_user();CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP FUNCTION IF EXISTS public.generate_api_key();

DROP FUNCTION IF EXISTS public.cleanup_expired_jobs();-- =====================================================



-- Drop existing policies-- TABLES-- Drop existing triggers

DO $$

BEGIN-- =====================================================DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    -- Profiles

    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;-- Projects table-- Drop existing functions

    -- Candidate profiles

    DROP POLICY IF EXISTS "Candidate profiles are viewable by employers and owner" ON public.candidate_profiles;CREATE TABLE IF NOT EXISTS public.projects (DROP FUNCTION IF EXISTS public.handle_new_user();

    DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;

    -- Jobs  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),DROP FUNCTION IF EXISTS public.generate_api_key();

    DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;

    DROP POLICY IF EXISTS "Employers can insert jobs for their company" ON public.jobs;  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,DROP FUNCTION IF EXISTS public.cleanup_expired_jobs();

    DROP POLICY IF EXISTS "Employers can update jobs for their company" ON public.jobs;

    -- Applications  name TEXT NOT NULL,

    DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;

    DROP POLICY IF EXISTS "Candidates can create applications" ON public.applications;  description TEXT,-- Drop existing policies

    -- Saved jobs

    DROP POLICY IF EXISTS "Users can manage own saved jobs" ON public.saved_jobs;  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),DO $$

    -- Email alerts

    DROP POLICY IF EXISTS "Users can manage own email alerts" ON public.email_alerts;  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()BEGIN

EXCEPTION

    WHEN undefined_table THEN NULL;);    -- Profiles

    WHEN undefined_object THEN NULL;

END $$;    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;



-- Drop existing tables (CASCADE removes all dependencies)-- Diagrams table    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP TABLE IF EXISTS public.email_alerts CASCADE;

DROP TABLE IF EXISTS public.saved_jobs CASCADE;CREATE TABLE IF NOT EXISTS public.diagrams (    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP TABLE IF EXISTS public.applications CASCADE;

DROP TABLE IF EXISTS public.jobs CASCADE;  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),    -- Candidate profiles

DROP TABLE IF EXISTS public.employer_profiles CASCADE;

DROP TABLE IF EXISTS public.companies CASCADE;  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,    DROP POLICY IF EXISTS "Candidate profiles are viewable by employers and owner" ON public.candidate_profiles;

DROP TABLE IF EXISTS public.candidate_profiles CASCADE;

DROP TABLE IF EXISTS public.profiles CASCADE;  name TEXT NOT NULL,    DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;

DROP TABLE IF EXISTS public.exports CASCADE;

DROP TABLE IF EXISTS public.project_shares CASCADE;  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,    -- Jobs

DROP TABLE IF EXISTS public.templates CASCADE;

DROP TABLE IF EXISTS public.diagrams CASCADE;  thumbnail_url TEXT,    DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;

DROP TABLE IF EXISTS public.projects CASCADE;

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    DROP POLICY IF EXISTS "Employers can insert jobs for their company" ON public.jobs;

-- =====================================================

-- TABLES  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()    DROP POLICY IF EXISTS "Employers can update jobs for their company" ON public.jobs;

-- =====================================================

);    -- Applications

-- Users table (extends Supabase auth.users)

CREATE TABLE public.profiles (    DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;

  id UUID REFERENCES auth.users(id) PRIMARY KEY,

  email TEXT NOT NULL,-- Templates table    DROP POLICY IF EXISTS "Candidates can create applications" ON public.applications;

  role TEXT NOT NULL CHECK (role IN ('candidate', 'employer')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),CREATE TABLE IF NOT EXISTS public.templates (    -- Saved jobs

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),    DROP POLICY IF EXISTS "Users can manage own saved jobs" ON public.saved_jobs;



-- Projects table  name TEXT NOT NULL,    -- Email alerts

CREATE TABLE public.projects (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  description TEXT,    DROP POLICY IF EXISTS "Users can manage own email alerts" ON public.email_alerts;

  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,  category TEXT NOT NULL CHECK (category IN ('startup', 'enterprise', 'microservices', 'side-project', 'gaming')),EXCEPTION

  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,    WHEN undefined_table THEN NULL;

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);  thumbnail_url TEXT,    WHEN undefined_object THEN NULL;



-- Diagrams table  is_public BOOLEAN DEFAULT true,END $$;

CREATE TABLE public.diagrams (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()-- Drop existing tables (CASCADE usunie też wszystkie zależności)

  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,

  thumbnail_url TEXT,);DROP TABLE IF EXISTS public.email_alerts CASCADE;

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()DROP TABLE IF EXISTS public.saved_jobs CASCADE;

);

-- Project shares table (for collaboration)DROP TABLE IF EXISTS public.applications CASCADE;

-- Templates table

CREATE TABLE public.templates (CREATE TABLE IF NOT EXISTS public.project_shares (DROP TABLE IF EXISTS public.jobs CASCADE;

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),DROP TABLE IF EXISTS public.employer_profiles CASCADE;

  description TEXT,

  category TEXT NOT NULL CHECK (category IN ('startup', 'enterprise', 'microservices', 'side-project', 'gaming')),  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,DROP TABLE IF EXISTS public.companies CASCADE;

  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,

  thumbnail_url TEXT,  shared_with_email TEXT NOT NULL,DROP TABLE IF EXISTS public.candidate_profiles CASCADE;

  is_public BOOLEAN DEFAULT true,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),DROP TABLE IF EXISTS public.profiles CASCADE;

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),



-- Project shares table (for collaboration)  UNIQUE(project_id, shared_with_email)-- Users table (extends Supabase auth.users)

CREATE TABLE public.project_shares (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),);CREATE TABLE public.profiles (

  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  shared_with_email TEXT NOT NULL,  id UUID REFERENCES auth.users(id) PRIMARY KEY,

  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),-- Exports table (track generated code exports)  email TEXT NOT NULL,

  UNIQUE(project_id, shared_with_email)

);CREATE TABLE IF NOT EXISTS public.exports (  role TEXT NOT NULL CHECK (role IN ('candidate', 'employer')),



-- Exports table (track generated code exports)  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

CREATE TABLE public.exports (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

  diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,

  export_type TEXT NOT NULL CHECK (export_type IN ('terraform', 'pulumi', 'cloudformation')),  export_type TEXT NOT NULL CHECK (export_type IN ('terraform', 'pulumi', 'cloudformation')),);

  code_content TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  code_content TEXT NOT NULL,

);

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()-- Candidate profiles

-- Candidate profiles

CREATE TABLE public.candidate_profiles ();CREATE TABLE public.candidate_profiles (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  first_name TEXT,

  last_name TEXT,-- =====================================================  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  title TEXT,

  skills TEXT[],-- INDEXES for performance  first_name TEXT,

  experience TEXT,

  cv_url TEXT,-- =====================================================  last_name TEXT,

  portfolio_url TEXT,

  linkedin_url TEXT,  title TEXT,

  github_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);  skills TEXT[],

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);CREATE INDEX IF NOT EXISTS idx_diagrams_project_id ON public.diagrams(project_id);  experience TEXT,



-- CompaniesCREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);  cv_url TEXT,

CREATE TABLE public.companies (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),CREATE INDEX IF NOT EXISTS idx_templates_is_public ON public.templates(is_public);  portfolio_url TEXT,

  name TEXT NOT NULL,

  logo_url TEXT,CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON public.project_shares(project_id);  linkedin_url TEXT,

  website TEXT,

  description TEXT,CREATE INDEX IF NOT EXISTS idx_exports_diagram_id ON public.exports(diagram_id);  github_url TEXT,

  api_key TEXT UNIQUE,

  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),-- =====================================================  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);-- ROW LEVEL SECURITY (RLS));



-- Employer profiles-- =====================================================

CREATE TABLE public.employer_profiles (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),-- Companies

  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,-- Enable RLS on all tablesCREATE TABLE public.companies (

  position TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;  name TEXT NOT NULL,



-- JobsALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;  logo_url TEXT,

CREATE TABLE public.jobs (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;  website TEXT,

  title TEXT NOT NULL,

  company_id UUID REFERENCES public.companies(id),ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;  description TEXT,

  company_name TEXT NOT NULL,

  company_logo TEXT,  api_key TEXT UNIQUE,

  location TEXT NOT NULL,

  remote BOOLEAN DEFAULT false,-- =====================================================  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),

  salary_min INTEGER,

  salary_max INTEGER,-- RLS POLICIES - Projects  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  salary_currency TEXT DEFAULT 'PLN',

  salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly')),-- =====================================================  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  salary_mode TEXT DEFAULT 'gross' CHECK (salary_mode IN ('gross', 'net')),

  hourly_min INTEGER,  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

  hourly_max INTEGER,

  tech_stack TEXT[],-- Users can view their own projects);

  contract_type TEXT,

  work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),CREATE POLICY "Users can view own projects"

  seniority TEXT,

  required_language TEXT,  ON public.projects FOR SELECT-- Employer profiles

  language_level TEXT,

  recruitment_stages TEXT[],  USING (auth.uid() = user_id);CREATE TABLE public.employer_profiles (

  tags TEXT[],

  description TEXT NOT NULL,  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  requirements TEXT[],

  benefits TEXT[],-- Users can create their own projects  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  source TEXT NOT NULL CHECK (source IN ('native', 'justjoinit', 'nofluffjobs', 'pracuj', 'indeed', 'bulldogjob', 'rocketjobs')),

  source_url TEXT,CREATE POLICY "Users can create own projects"  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  source_id TEXT,

  featured BOOLEAN DEFAULT false,  ON public.projects FOR INSERT  position TEXT,

  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  expires_at TIMESTAMP WITH TIME ZONE,  WITH CHECK (auth.uid() = user_id);  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

  UNIQUE(source, source_id)

);-- Users can update their own projects);



-- ApplicationsCREATE POLICY "Users can update own projects"

CREATE TABLE public.applications (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  ON public.projects FOR UPDATE-- Jobs

  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,

  candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  USING (auth.uid() = user_id);CREATE TABLE public.jobs (

  first_name TEXT,

  last_name TEXT,  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  email TEXT,

  phone TEXT,-- Users can delete their own projects  title TEXT NOT NULL,

  years_experience INTEGER,

  current_position TEXT,CREATE POLICY "Users can delete own projects"  company_id UUID REFERENCES public.companies(id),

  expected_salary_min INTEGER,

  expected_salary_max INTEGER,  ON public.projects FOR DELETE  company_name TEXT NOT NULL, -- For scraped jobs without company_id

  available_from DATE,

  linkedin_url TEXT,  USING (auth.uid() = user_id);  company_logo TEXT,

  github_url TEXT,

  portfolio_url TEXT,  location TEXT NOT NULL,

  cv_url TEXT,

  cover_letter TEXT,-- Users can view shared projects  remote BOOLEAN DEFAULT false,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'rejected', 'hired')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),CREATE POLICY "Users can view shared projects"  salary_min INTEGER,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE NULLS NOT DISTINCT (job_id, candidate_id, email)  ON public.projects FOR SELECT  salary_max INTEGER,

);

  USING (  salary_currency TEXT DEFAULT 'PLN',

-- Saved jobs

CREATE TABLE public.saved_jobs (    EXISTS (  salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly')),

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,      SELECT 1 FROM public.project_shares  salary_mode TEXT DEFAULT 'gross' CHECK (salary_mode IN ('gross', 'net')),

  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),      WHERE project_shares.project_id = projects.id  hourly_min INTEGER,

  UNIQUE(user_id, job_id)

);      AND project_shares.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())  hourly_max INTEGER,



-- Email alerts    )  tech_stack TEXT[],

CREATE TABLE public.email_alerts (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  );  contract_type TEXT,

  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,  work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),

  filters JSONB NOT NULL,

  frequency TEXT NOT NULL CHECK (frequency IN ('instant', 'daily', 'weekly')),-- =====================================================  seniority TEXT,

  enabled BOOLEAN DEFAULT true,

  last_sent_at TIMESTAMP WITH TIME ZONE,-- RLS POLICIES - Diagrams  required_language TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()-- =====================================================  language_level TEXT,

);

  recruitment_stages TEXT[],

-- =====================================================

-- INDEXES for performance-- Users can view diagrams in their own projects  tags TEXT[],

-- =====================================================

CREATE POLICY "Users can view diagrams in own projects"  description TEXT NOT NULL,

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

CREATE INDEX idx_diagrams_project_id ON public.diagrams(project_id);  ON public.diagrams FOR SELECT  requirements TEXT[],

CREATE INDEX idx_templates_category ON public.templates(category);

CREATE INDEX idx_templates_is_public ON public.templates(is_public);  USING (  benefits TEXT[],

CREATE INDEX idx_project_shares_project_id ON public.project_shares(project_id);

CREATE INDEX idx_exports_diagram_id ON public.exports(diagram_id);    EXISTS (  source TEXT NOT NULL CHECK (source IN ('native', 'justjoinit', 'nofluffjobs', 'pracuj', 'indeed', 'bulldogjob', 'rocketjobs')),



CREATE INDEX idx_jobs_source ON public.jobs(source);      SELECT 1 FROM public.projects  source_url TEXT,

CREATE INDEX idx_jobs_published_at ON public.jobs(published_at DESC);

CREATE INDEX idx_jobs_featured ON public.jobs(featured) WHERE featured = true;      WHERE projects.id = diagrams.project_id  source_id TEXT, -- Original ID from source

CREATE INDEX idx_jobs_tech_stack ON public.jobs USING GIN(tech_stack);

CREATE INDEX idx_jobs_location ON public.jobs(location);      AND projects.user_id = auth.uid()  featured BOOLEAN DEFAULT false,

CREATE INDEX idx_jobs_remote ON public.jobs(remote) WHERE remote = true;

CREATE INDEX idx_jobs_expires_at ON public.jobs(expires_at);    )  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);

CREATE INDEX idx_applications_job_id ON public.applications(job_id);  );  expires_at TIMESTAMP WITH TIME ZONE,

CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

-- Full-text search index

ALTER TABLE public.jobs ADD COLUMN search_vector tsvector-- Users can create diagrams in their own projects  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  GENERATED ALWAYS AS (

    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||CREATE POLICY "Users can create diagrams in own projects"

    setweight(to_tsvector('english', coalesce(company_name, '')), 'B') ||

    setweight(to_tsvector('english', coalesce(description, '')), 'C')  ON public.diagrams FOR INSERT  -- For deduplication

  ) STORED;

  WITH CHECK (  UNIQUE(source, source_id)

CREATE INDEX idx_jobs_search ON public.jobs USING GIN(search_vector);

    EXISTS ();

-- =====================================================

-- ROW LEVEL SECURITY (RLS)      SELECT 1 FROM public.projects

-- =====================================================

      WHERE projects.id = diagrams.project_id-- Applications

-- Enable RLS on all tables

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;      AND projects.user_id = auth.uid()CREATE TABLE public.applications (

ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;    )  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;  );  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;  candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;-- Users can update diagrams in their own projects  first_name TEXT,

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;CREATE POLICY "Users can update diagrams in own projects"  last_name TEXT,

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.email_alerts ENABLE ROW LEVEL SECURITY;  ON public.diagrams FOR UPDATE  email TEXT,



-- =====================================================  USING (  phone TEXT,

-- RLS POLICIES - Profiles

-- =====================================================    EXISTS (  years_experience INTEGER,



CREATE POLICY "Public profiles are viewable by everyone"      SELECT 1 FROM public.projects  current_position TEXT,

  ON public.profiles FOR SELECT

  USING (true);      WHERE projects.id = diagrams.project_id  expected_salary_min INTEGER,



CREATE POLICY "Users can insert own profile"      AND projects.user_id = auth.uid()  expected_salary_max INTEGER,

  ON public.profiles FOR INSERT

  WITH CHECK (auth.uid() = id);    )  available_from DATE,



CREATE POLICY "Users can update own profile"  );  linkedin_url TEXT,

  ON public.profiles FOR UPDATE

  USING (auth.uid() = id);  github_url TEXT,



-- =====================================================-- Users can delete diagrams in their own projects  portfolio_url TEXT,

-- RLS POLICIES - Projects

-- =====================================================CREATE POLICY "Users can delete diagrams in own projects"  cv_url TEXT,



CREATE POLICY "Users can view own projects"  ON public.diagrams FOR DELETE  cover_letter TEXT,

  ON public.projects FOR SELECT

  USING (auth.uid() = user_id);  USING (  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'rejected', 'hired')),



CREATE POLICY "Users can create own projects"    EXISTS (  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  ON public.projects FOR INSERT

  WITH CHECK (auth.uid() = user_id);      SELECT 1 FROM public.projects  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),



CREATE POLICY "Users can update own projects"      WHERE projects.id = diagrams.project_id

  ON public.projects FOR UPDATE

  USING (auth.uid() = user_id);      AND projects.user_id = auth.uid()  -- One application per job per candidate or email



CREATE POLICY "Users can delete own projects"    )  UNIQUE NULLS NOT DISTINCT (job_id, candidate_id, email)

  ON public.projects FOR DELETE

  USING (auth.uid() = user_id);  ););



CREATE POLICY "Users can view shared projects"

  ON public.projects FOR SELECT

  USING (-- Users can view diagrams in shared projects-- Saved jobs

    EXISTS (

      SELECT 1 FROM public.project_sharesCREATE POLICY "Users can view diagrams in shared projects"CREATE TABLE public.saved_jobs (

      WHERE project_shares.project_id = projects.id

      AND project_shares.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())  ON public.diagrams FOR SELECT  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    )

  );  USING (  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,



-- =====================================================    EXISTS (  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,

-- RLS POLICIES - Diagrams

-- =====================================================      SELECT 1 FROM public.project_shares ps  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),



CREATE POLICY "Users can view diagrams in own projects"      JOIN public.projects p ON p.id = ps.project_id

  ON public.diagrams FOR SELECT

  USING (      WHERE p.id = diagrams.project_id  -- One save per job per user

    EXISTS (

      SELECT 1 FROM public.projects      AND ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())  UNIQUE(user_id, job_id)

      WHERE projects.id = diagrams.project_id

      AND projects.user_id = auth.uid()    ));

    )

  );  );



CREATE POLICY "Users can create diagrams in own projects"-- Email alerts

  ON public.diagrams FOR INSERT

  WITH CHECK (-- Users can edit diagrams in shared projects (if permission is 'edit')CREATE TABLE public.email_alerts (

    EXISTS (

      SELECT 1 FROM public.projectsCREATE POLICY "Users can edit diagrams in shared projects"  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

      WHERE projects.id = diagrams.project_id

      AND projects.user_id = auth.uid()  ON public.diagrams FOR UPDATE  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    )

  );  USING (  name TEXT NOT NULL,



CREATE POLICY "Users can update diagrams in own projects"    EXISTS (  filters JSONB NOT NULL, -- Store JobFilters as JSON

  ON public.diagrams FOR UPDATE

  USING (      SELECT 1 FROM public.project_shares ps  frequency TEXT NOT NULL CHECK (frequency IN ('instant', 'daily', 'weekly')),

    EXISTS (

      SELECT 1 FROM public.projects      JOIN public.projects p ON p.id = ps.project_id  enabled BOOLEAN DEFAULT true,

      WHERE projects.id = diagrams.project_id

      AND projects.user_id = auth.uid()      WHERE p.id = diagrams.project_id  last_sent_at TIMESTAMP WITH TIME ZONE,

    )

  );      AND ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),



CREATE POLICY "Users can delete diagrams in own projects"      AND ps.permission = 'edit'  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

  ON public.diagrams FOR DELETE

  USING (    ));

    EXISTS (

      SELECT 1 FROM public.projects  );

      WHERE projects.id = diagrams.project_id

      AND projects.user_id = auth.uid()-- Indexes for performance

    )

  );-- =====================================================CREATE INDEX idx_jobs_source ON public.jobs(source);



CREATE POLICY "Users can view diagrams in shared projects"-- RLS POLICIES - TemplatesCREATE INDEX idx_jobs_published_at ON public.jobs(published_at DESC);

  ON public.diagrams FOR SELECT

  USING (-- =====================================================CREATE INDEX idx_jobs_featured ON public.jobs(featured) WHERE featured = true;

    EXISTS (

      SELECT 1 FROM public.project_shares psCREATE INDEX idx_jobs_tech_stack ON public.jobs USING GIN(tech_stack);

      JOIN public.projects p ON p.id = ps.project_id

      WHERE p.id = diagrams.project_id-- Everyone can view public templatesCREATE INDEX idx_jobs_location ON public.jobs(location);

      AND ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())

    )CREATE POLICY "Public templates viewable by all"CREATE INDEX idx_jobs_remote ON public.jobs(remote) WHERE remote = true;

  );

  ON public.templates FOR SELECTCREATE INDEX idx_jobs_expires_at ON public.jobs(expires_at);

CREATE POLICY "Users can edit diagrams in shared projects"

  ON public.diagrams FOR UPDATE  USING (is_public = true OR created_by = auth.uid());CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);

  USING (

    EXISTS (CREATE INDEX idx_applications_job_id ON public.applications(job_id);

      SELECT 1 FROM public.project_shares ps

      JOIN public.projects p ON p.id = ps.project_id-- Users can create templatesCREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);

      WHERE p.id = diagrams.project_id

      AND ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())CREATE POLICY "Users can create templates"

      AND ps.permission = 'edit'

    )  ON public.templates FOR INSERT-- Full-text search index

  );

  WITH CHECK (auth.uid() = created_by);ALTER TABLE public.jobs ADD COLUMN search_vector tsvector

-- =====================================================

-- RLS POLICIES - Templates  GENERATED ALWAYS AS (

-- =====================================================

-- Users can update their own templates    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||

CREATE POLICY "Public templates viewable by all"

  ON public.templates FOR SELECTCREATE POLICY "Users can update own templates"    setweight(to_tsvector('english', coalesce(company_name, '')), 'B') ||

  USING (is_public = true OR created_by = auth.uid());

  ON public.templates FOR UPDATE    setweight(to_tsvector('english', coalesce(description, '')), 'C')

CREATE POLICY "Users can create templates"

  ON public.templates FOR INSERT  USING (auth.uid() = created_by);  ) STORED;

  WITH CHECK (auth.uid() = created_by);



CREATE POLICY "Users can update own templates"

  ON public.templates FOR UPDATE-- Users can delete their own templatesCREATE INDEX idx_jobs_search ON public.jobs USING GIN(search_vector);

  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates"

CREATE POLICY "Users can delete own templates"

  ON public.templates FOR DELETE  ON public.templates FOR DELETE-- Row Level Security (RLS)

  USING (auth.uid() = created_by);

  USING (auth.uid() = created_by);ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================

-- RLS POLICIES - Project SharesALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================

-- =====================================================ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can manage shares"

  ON public.project_shares FOR ALL-- RLS POLICIES - Project SharesALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

  USING (

    EXISTS (-- =====================================================ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

      SELECT 1 FROM public.projects

      WHERE projects.id = project_shares.project_idALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

      AND projects.user_id = auth.uid()

    )-- Project owners can manage sharesALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

  );

CREATE POLICY "Project owners can manage shares"ALTER TABLE public.email_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared users can view their shares"

  ON public.project_shares FOR SELECT  ON public.project_shares FOR ALL

  USING (

    shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())  USING (-- RLS Policies for profiles

  );

    EXISTS (CREATE POLICY "Public profiles are viewable by everyone"

-- =====================================================

-- RLS POLICIES - Exports      SELECT 1 FROM public.projects  ON public.profiles FOR SELECT

-- =====================================================

      WHERE projects.id = project_shares.project_id  USING (true);

CREATE POLICY "Users can view own exports"

  ON public.exports FOR SELECT      AND projects.user_id = auth.uid()

  USING (

    EXISTS (    )CREATE POLICY "Users can insert own profile"

      SELECT 1 FROM public.diagrams d

      JOIN public.projects p ON p.id = d.project_id  );  ON public.profiles FOR INSERT

      WHERE d.id = exports.diagram_id

      AND p.user_id = auth.uid()  WITH CHECK (auth.uid() = id);

    )

  );-- Shared users can view their shares



CREATE POLICY "Users can create exports"CREATE POLICY "Shared users can view their shares"CREATE POLICY "Users can update own profile"

  ON public.exports FOR INSERT

  WITH CHECK (  ON public.project_shares FOR SELECT  ON public.profiles FOR UPDATE

    EXISTS (

      SELECT 1 FROM public.diagrams d  USING (  USING (auth.uid() = id);

      JOIN public.projects p ON p.id = d.project_id

      WHERE d.id = exports.diagram_id    shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())

      AND p.user_id = auth.uid()

    )  );-- RLS Policies for candidate_profiles

  );

CREATE POLICY "Candidate profiles are viewable by employers and owner"

-- =====================================================

-- RLS POLICIES - Candidate Profiles-- =====================================================  ON public.candidate_profiles FOR SELECT

-- =====================================================

-- RLS POLICIES - Exports  USING (

CREATE POLICY "Candidate profiles are viewable by employers and owner"

  ON public.candidate_profiles FOR SELECT-- =====================================================    auth.uid() = user_id OR

  USING (

    auth.uid() = user_id OR    EXISTS (

    EXISTS (

      SELECT 1 FROM public.profiles-- Users can view exports from their diagrams      SELECT 1 FROM public.profiles

      WHERE id = auth.uid() AND role = 'employer'

    )CREATE POLICY "Users can view own exports"      WHERE id = auth.uid() AND role = 'employer'

  );

  ON public.exports FOR SELECT    )

CREATE POLICY "Users can insert own candidate profile"

  ON public.candidate_profiles FOR INSERT  USING (  );

  WITH CHECK (auth.uid() = user_id);

    EXISTS (

CREATE POLICY "Users can update own candidate profile"

  ON public.candidate_profiles FOR UPDATE      SELECT 1 FROM public.diagrams dCREATE POLICY "Users can insert own candidate profile"

  USING (auth.uid() = user_id);

      JOIN public.projects p ON p.id = d.project_id  ON public.candidate_profiles FOR INSERT

CREATE POLICY "Users can delete own candidate profile"

  ON public.candidate_profiles FOR DELETE      WHERE d.id = exports.diagram_id  WITH CHECK (auth.uid() = user_id);

  USING (auth.uid() = user_id);

      AND p.user_id = auth.uid()

-- =====================================================

-- RLS POLICIES - Employer Profiles    )CREATE POLICY "Users can update own candidate profile"

-- =====================================================

  );  ON public.candidate_profiles FOR UPDATE

CREATE POLICY "Employers can view own employer profile"

  ON public.employer_profiles FOR SELECT  USING (auth.uid() = user_id);

  USING (auth.uid() = user_id);

-- Users can create exports for their diagrams

CREATE POLICY "Employers can insert own employer profile"

  ON public.employer_profiles FOR INSERTCREATE POLICY "Users can create exports"CREATE POLICY "Users can delete own candidate profile"

  WITH CHECK (auth.uid() = user_id);

  ON public.exports FOR INSERT  ON public.candidate_profiles FOR DELETE

CREATE POLICY "Employers can update own employer profile"

  ON public.employer_profiles FOR UPDATE  WITH CHECK (  USING (auth.uid() = user_id);

  USING (auth.uid() = user_id);

    EXISTS (

CREATE POLICY "Employers can delete own employer profile"

  ON public.employer_profiles FOR DELETE      SELECT 1 FROM public.diagrams d-- RLS Policies for employer_profiles

  USING (auth.uid() = user_id);

      JOIN public.projects p ON p.id = d.project_idCREATE POLICY "Employers can view own employer profile"

-- =====================================================

-- RLS POLICIES - Jobs      WHERE d.id = exports.diagram_id  ON public.employer_profiles FOR SELECT

-- =====================================================

      AND p.user_id = auth.uid()  USING (auth.uid() = user_id);

CREATE POLICY "Jobs are viewable by everyone"

  ON public.jobs FOR SELECT    )

  USING (expires_at IS NULL OR expires_at > NOW());

  );CREATE POLICY "Employers can insert own employer profile"

CREATE POLICY "Scraped jobs can be inserted by service role"

  ON public.jobs FOR INSERT  ON public.employer_profiles FOR INSERT

  WITH CHECK (

    source != 'native' OR-- =====================================================  WITH CHECK (auth.uid() = user_id);

    EXISTS (

      SELECT 1 FROM public.employer_profiles-- FUNCTIONS

      WHERE user_id = auth.uid() AND company_id = jobs.company_id

    )-- =====================================================CREATE POLICY "Employers can update own employer profile"

  );

  ON public.employer_profiles FOR UPDATE

CREATE POLICY "Scraped jobs can be updated by service role"

  ON public.jobs FOR UPDATE-- Function to update updated_at timestamp  USING (auth.uid() = user_id);

  USING (

    source != 'native' ORCREATE OR REPLACE FUNCTION public.handle_updated_at()

    EXISTS (

      SELECT 1 FROM public.employer_profilesRETURNS TRIGGER AS $$CREATE POLICY "Employers can delete own employer profile"

      WHERE user_id = auth.uid() AND company_id = jobs.company_id

    )BEGIN  ON public.employer_profiles FOR DELETE

  );

  NEW.updated_at = NOW();  USING (auth.uid() = user_id);

CREATE POLICY "Employers can delete their jobs"

  ON public.jobs FOR DELETE  RETURN NEW;

  USING (

    EXISTS (END;-- RLS Policies for jobs (public viewing)

      SELECT 1 FROM public.employer_profiles

      WHERE user_id = auth.uid() AND company_id = jobs.company_id$$ LANGUAGE plpgsql;CREATE POLICY "Jobs are viewable by everyone"

    )

  );  ON public.jobs FOR SELECT



-- =====================================================-- Triggers for updated_at  USING (expires_at IS NULL OR expires_at > NOW());

-- RLS POLICIES - Applications

-- =====================================================CREATE TRIGGER set_projects_updated_at



CREATE POLICY "Users can view own applications"  BEFORE UPDATE ON public.projectsCREATE POLICY "Scraped jobs can be inserted by service role"

  ON public.applications FOR SELECT

  USING (  FOR EACH ROW  ON public.jobs FOR INSERT

    auth.uid() = candidate_id OR

    EXISTS (  EXECUTE FUNCTION public.handle_updated_at();  WITH CHECK (

      SELECT 1 FROM public.employer_profiles ep

      JOIN public.jobs j ON j.company_id = ep.company_id    source != 'native' OR

      WHERE ep.user_id = auth.uid() AND j.id = applications.job_id

    )CREATE TRIGGER set_diagrams_updated_at    EXISTS (

  );

  BEFORE UPDATE ON public.diagrams      SELECT 1 FROM public.employer_profiles

CREATE POLICY "Candidates can create applications"

  ON public.applications FOR INSERT  FOR EACH ROW      WHERE user_id = auth.uid() AND company_id = jobs.company_id

  WITH CHECK (auth.uid() = candidate_id OR candidate_id IS NULL);

  EXECUTE FUNCTION public.handle_updated_at();    )

-- =====================================================

-- RLS POLICIES - Saved Jobs  );

-- =====================================================

-- =====================================================

CREATE POLICY "Users can manage own saved jobs"

  ON public.saved_jobs FOR ALL-- SEED DATA - TemplatesCREATE POLICY "Scraped jobs can be updated by service role"

  USING (auth.uid() = user_id);

-- =====================================================  ON public.jobs FOR UPDATE

-- =====================================================

-- RLS POLICIES - Email Alerts  USING (

-- =====================================================

-- Insert default templates    source != 'native' OR

CREATE POLICY "Users can manage own email alerts"

  ON public.email_alerts FOR ALLINSERT INTO public.templates (name, description, category, data, is_public, created_by) VALUES    EXISTS (

  USING (auth.uid() = user_id);

(      SELECT 1 FROM public.employer_profiles

-- =====================================================

-- FUNCTIONS  'Startup MVP',      WHERE user_id = auth.uid() AND company_id = jobs.company_id

-- =====================================================

  'Cost-effective architecture for startups. Uses free tiers: Vercel for frontend, Supabase for database and auth.',    )

-- Function to update updated_at timestamp

CREATE OR REPLACE FUNCTION public.handle_updated_at()  'startup',  );

RETURNS TRIGGER AS $$

BEGIN  '{"nodes": [

  NEW.updated_at = NOW();

  RETURN NEW;    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},CREATE POLICY "Employers can delete their jobs"

END;

$$ LANGUAGE plpgsql;    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "vercel", "label": "Vercel Hosting"}},  ON public.jobs FOR DELETE



-- Triggers for updated_at    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},  USING (

CREATE TRIGGER set_projects_updated_at

  BEFORE UPDATE ON public.projects    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "supabase", "label": "Supabase (DB + Auth)"}}    EXISTS (

  FOR EACH ROW

  EXECUTE FUNCTION public.handle_updated_at();  ], "edges": [      SELECT 1 FROM public.employer_profiles



CREATE TRIGGER set_diagrams_updated_at    {"id": "e1-2", "source": "1", "target": "2"},      WHERE user_id = auth.uid() AND company_id = jobs.company_id

  BEFORE UPDATE ON public.diagrams

  FOR EACH ROW    {"id": "e1-3", "source": "1", "target": "3"},    )

  EXECUTE FUNCTION public.handle_updated_at();

    {"id": "e3-4", "source": "3", "target": "4"}  );

-- Function to create profile on user signup

CREATE OR REPLACE FUNCTION public.handle_new_user()  ]}'::jsonb,

RETURNS TRIGGER AS $$

DECLARE  true,-- RLS Policies for applications

  user_role TEXT;

BEGIN  NULLCREATE POLICY "Users can view own applications"

  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidate');

  ),  ON public.applications FOR SELECT

  INSERT INTO public.profiles (id, email, role)

  VALUES (NEW.id, NEW.email, user_role)(  USING (

  ON CONFLICT (id) DO NOTHING;

    'Enterprise E-Commerce',    auth.uid() = candidate_id OR

  IF user_role = 'candidate' THEN

    INSERT INTO public.candidate_profiles (user_id)  'Highly scalable e-commerce architecture with auto-scaling, caching, and CDN.',    EXISTS (

    VALUES (NEW.id)

    ON CONFLICT DO NOTHING;  'enterprise',      SELECT 1 FROM public.employer_profiles ep

  ELSIF user_role = 'employer' THEN

    INSERT INTO public.employer_profiles (user_id)  '{"nodes": [      JOIN public.jobs j ON j.company_id = ep.company_id

    VALUES (NEW.id)

    ON CONFLICT DO NOTHING;    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},      WHERE ep.user_id = auth.uid() AND j.id = applications.job_id

  END IF;

      {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "aws_cloudfront", "label": "CloudFront CDN"}},    )

  RETURN NEW;

END;    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_alb", "label": "Application Load Balancer"}},  );

$$ LANGUAGE plpgsql SECURITY DEFINER;

    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "aws_ecs", "label": "ECS Fargate"}},

-- Trigger to create profile on signup

CREATE TRIGGER on_auth_user_created    {"id": "5", "type": "component", "position": {"x": 700, "y": 100}, "data": {"componentId": "redis", "label": "ElastiCache Redis"}},CREATE POLICY "Candidates can create applications"

  AFTER INSERT ON auth.users

  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();    {"id": "6", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "postgresql", "label": "RDS PostgreSQL"}}  ON public.applications FOR INSERT



-- Function to generate API key  ], "edges": [  WITH CHECK (auth.uid() = candidate_id OR candidate_id IS NULL);

CREATE OR REPLACE FUNCTION public.generate_api_key()

RETURNS TEXT AS $$    {"id": "e1-2", "source": "1", "target": "2"},

BEGIN

  RETURN 'jbs_' || encode(gen_random_bytes(32), 'hex');    {"id": "e2-3", "source": "2", "target": "3"},-- RLS Policies for saved_jobs

END;

$$ LANGUAGE plpgsql;    {"id": "e3-4", "source": "3", "target": "4"},CREATE POLICY "Users can manage own saved jobs"



-- Function to cleanup expired jobs    {"id": "e4-5", "source": "4", "target": "5"},  ON public.saved_jobs FOR ALL

CREATE OR REPLACE FUNCTION public.cleanup_expired_jobs()

RETURNS void AS $$    {"id": "e4-6", "source": "4", "target": "6"}  USING (auth.uid() = user_id);

BEGIN

  DELETE FROM public.jobs  ]}'::jsonb,

  WHERE expires_at < NOW() - INTERVAL '30 days';

END;  true,-- RLS Policies for email_alerts

$$ LANGUAGE plpgsql;

  NULLCREATE POLICY "Users can manage own email alerts"

-- =====================================================

-- SEED DATA - Templates),  ON public.email_alerts FOR ALL

-- =====================================================

(  USING (auth.uid() = user_id);

INSERT INTO public.templates (name, description, category, data, is_public, created_by) VALUES

(  'Microservices Architecture',

  'Startup MVP',

  'Cost-effective architecture for startups. Uses free tiers: Vercel for frontend, Supabase for database and auth.',  'Modern microservices setup with Kubernetes, service mesh, and message queuing.',-- Functions

  'startup',

  '{"nodes": [  'microservices',CREATE OR REPLACE FUNCTION public.handle_new_user()

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},

    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "vercel", "label": "Vercel Hosting"}},  '{"nodes": [RETURNS TRIGGER AS $$

    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},

    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "supabase", "label": "Supabase (DB + Auth)"}}    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "Web App"}},DECLARE

  ], "edges": [

    {"id": "e1-2", "source": "1", "target": "2"},    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "API Gateway"}},  user_role TEXT;

    {"id": "e1-3", "source": "1", "target": "3"},

    {"id": "e3-4", "source": "3", "target": "4"}    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "kubernetes", "label": "Auth Service (K8s)"}},BEGIN

  ]}'::jsonb,

  true,    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "kubernetes", "label": "User Service (K8s)"}},  -- Get role from metadata or default to 'candidate'

  NULL

),    {"id": "5", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "kubernetes", "label": "Order Service (K8s)"}},  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidate');

(

  'Enterprise E-Commerce',    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "postgresql", "label": "PostgreSQL"}}

  'Highly scalable e-commerce architecture with auto-scaling, caching, and CDN.',

  'enterprise',  ], "edges": [  -- Insert into profiles

  '{"nodes": [

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},    {"id": "e1-2", "source": "1", "target": "2"},  INSERT INTO public.profiles (id, email, role)

    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "aws_cloudfront", "label": "CloudFront CDN"}},

    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_alb", "label": "Application Load Balancer"}},    {"id": "e2-3", "source": "2", "target": "3"},  VALUES (NEW.id, NEW.email, user_role)

    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "aws_ecs", "label": "ECS Fargate"}},

    {"id": "5", "type": "component", "position": {"x": 700, "y": 100}, "data": {"componentId": "redis", "label": "ElastiCache Redis"}},    {"id": "e2-4", "source": "2", "target": "4"},  ON CONFLICT (id) DO NOTHING;

    {"id": "6", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "postgresql", "label": "RDS PostgreSQL"}}

  ], "edges": [    {"id": "e2-5", "source": "2", "target": "5"},

    {"id": "e1-2", "source": "1", "target": "2"},

    {"id": "e2-3", "source": "2", "target": "3"},    {"id": "e3-6", "source": "3", "target": "6"},  -- Create corresponding profile based on role

    {"id": "e3-4", "source": "3", "target": "4"},

    {"id": "e4-5", "source": "4", "target": "5"},    {"id": "e4-6", "source": "4", "target": "6"},  IF user_role = 'candidate' THEN

    {"id": "e4-6", "source": "4", "target": "6"}

  ]}'::jsonb,    {"id": "e5-6", "source": "5", "target": "6"}    INSERT INTO public.candidate_profiles (user_id)

  true,

  NULL  ]}'::jsonb,    VALUES (NEW.id)

),

(  true,    ON CONFLICT DO NOTHING;

  'Microservices Architecture',

  'Modern microservices setup with Kubernetes, service mesh, and message queuing.',  NULL  ELSIF user_role = 'employer' THEN

  'microservices',

  '{"nodes": [),    INSERT INTO public.employer_profiles (user_id)

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "Web App"}},

    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "API Gateway"}},(    VALUES (NEW.id)

    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "kubernetes", "label": "Auth Service (K8s)"}},

    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "kubernetes", "label": "User Service (K8s)"}},  'Side Project / Hobby',    ON CONFLICT DO NOTHING;

    {"id": "5", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "kubernetes", "label": "Order Service (K8s)"}},

    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "postgresql", "label": "PostgreSQL"}}  'Minimal cost architecture using free tiers and cheap services. Perfect for personal projects.',  END IF;

  ], "edges": [

    {"id": "e1-2", "source": "1", "target": "2"},  'side-project',

    {"id": "e2-3", "source": "2", "target": "3"},

    {"id": "e2-4", "source": "2", "target": "4"},  '{"nodes": [  RETURN NEW;

    {"id": "e2-5", "source": "2", "target": "5"},

    {"id": "e3-6", "source": "3", "target": "6"},    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React App"}},END;

    {"id": "e4-6", "source": "4", "target": "6"},

    {"id": "e5-6", "source": "5", "target": "6"}    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "cloudflare_pages", "label": "Cloudflare Pages"}},$$ LANGUAGE plpgsql SECURITY DEFINER;

  ]}'::jsonb,

  true,    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},

  NULL

),    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "railway", "label": "Railway"}},-- Trigger to create profile on signup

(

  'Side Project / Hobby',    {"id": "5", "type": "component", "position": {"x": 700, "y": 175}, "data": {"componentId": "postgresql", "label": "PlanetScale DB"}}DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  'Minimal cost architecture using free tiers and cheap services. Perfect for personal projects.',

  'side-project',  ], "edges": [CREATE TRIGGER on_auth_user_created

  '{"nodes": [

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React App"}},    {"id": "e1-2", "source": "1", "target": "2"},  AFTER INSERT ON auth.users

    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "cloudflare_pages", "label": "Cloudflare Pages"}},

    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},    {"id": "e1-3", "source": "1", "target": "3"},  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "railway", "label": "Railway"}},

    {"id": "5", "type": "component", "position": {"x": 700, "y": 175}, "data": {"componentId": "postgresql", "label": "PlanetScale DB"}}    {"id": "e3-4", "source": "3", "target": "4"},

  ], "edges": [

    {"id": "e1-2", "source": "1", "target": "2"},    {"id": "e3-5", "source": "3", "target": "5"}-- Function to generate API key

    {"id": "e1-3", "source": "1", "target": "3"},

    {"id": "e3-4", "source": "3", "target": "4"},  ]}'::jsonb,CREATE OR REPLACE FUNCTION public.generate_api_key()

    {"id": "e3-5", "source": "3", "target": "5"}

  ]}'::jsonb,  true,RETURNS TEXT AS $$

  true,

  NULL  NULLBEGIN

),

(),  RETURN 'jbs_' || encode(gen_random_bytes(32), 'hex');

  'Real-time Gaming Backend',

  'Low-latency gaming backend with WebSocket support, session management, and player data storage.',(END;

  'gaming',

  '{"nodes": [  'Real-time Gaming Backend',$$ LANGUAGE plpgsql;

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "game_client", "label": "Game Client"}},

    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "WebSocket API Gateway"}},  'Low-latency gaming backend with WebSocket support, session management, and player data storage.',

    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "aws_lambda", "label": "Match Making"}},

    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "aws_ecs", "label": "Game Servers"}},  'gaming',-- Function to cleanup expired jobs

    {"id": "5", "type": "component", "position": {"x": 1000, "y": 50}, "data": {"componentId": "redis", "label": "Redis (Sessions)"}},

    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "dynamodb", "label": "DynamoDB (Player Data)"}}  '{"nodes": [CREATE OR REPLACE FUNCTION public.cleanup_expired_jobs()

  ], "edges": [

    {"id": "e1-2", "source": "1", "target": "2"},    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "game_client", "label": "Game Client"}},RETURNS void AS $$

    {"id": "e2-3", "source": "2", "target": "3"},

    {"id": "e2-4", "source": "2", "target": "4"},    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "WebSocket API Gateway"}},BEGIN

    {"id": "e3-5", "source": "3", "target": "5"},

    {"id": "e4-6", "source": "4", "target": "6"}    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "aws_lambda", "label": "Match Making"}},  DELETE FROM public.jobs

  ]}'::jsonb,

  true,    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "aws_ecs", "label": "Game Servers"}},  WHERE expires_at < NOW() - INTERVAL '30 days';

  NULL

)    {"id": "5", "type": "component", "position": {"x": 1000, "y": 50}, "data": {"componentId": "redis", "label": "Redis (Sessions)"}},END;

ON CONFLICT DO NOTHING;

    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "dynamodb", "label": "DynamoDB (Player Data)"}}$$ LANGUAGE plpgsql;

-- =====================================================

-- GRANT PERMISSIONS  ], "edges": [

-- =====================================================    {"id": "e1-2", "source": "1", "target": "2"},

    {"id": "e2-3", "source": "2", "target": "3"},

GRANT USAGE ON SCHEMA public TO anon, authenticated;    {"id": "e2-4", "source": "2", "target": "4"},

GRANT ALL ON public.projects TO authenticated;    {"id": "e3-5", "source": "3", "target": "5"},

GRANT ALL ON public.diagrams TO authenticated;    {"id": "e4-6", "source": "4", "target": "6"}

GRANT SELECT ON public.templates TO anon, authenticated;  ]}'::jsonb,

GRANT ALL ON public.templates TO authenticated;  true,

GRANT ALL ON public.project_shares TO authenticated;  NULL

GRANT ALL ON public.exports TO authenticated;)

GRANT ALL ON public.profiles TO authenticated;ON CONFLICT DO NOTHING;

GRANT ALL ON public.candidate_profiles TO authenticated;

GRANT ALL ON public.employer_profiles TO authenticated;-- =====================================================

GRANT ALL ON public.companies TO authenticated;-- GRANT PERMISSIONS

GRANT ALL ON public.jobs TO authenticated;-- =====================================================

GRANT ALL ON public.applications TO authenticated;

GRANT ALL ON public.saved_jobs TO authenticated;-- Grant usage on schema

GRANT ALL ON public.email_alerts TO authenticated;GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant table permissions

-- Schema setup complete!GRANT ALL ON public.projects TO authenticated;

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
