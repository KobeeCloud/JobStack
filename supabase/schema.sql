-- JobStack Database Schema
-- Run this SQL in your Supabase SQL Editor
-- UWAGA: Ten skrypt USUWA wszystkie tabele i tworzy je od nowa!

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.generate_api_key();
DROP FUNCTION IF EXISTS public.cleanup_expired_jobs();

-- Drop existing policies
DO $$
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    -- Candidate profiles
    DROP POLICY IF EXISTS "Candidate profiles are viewable by employers and owner" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;
    -- Jobs
    DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
    DROP POLICY IF EXISTS "Employers can insert jobs for their company" ON public.jobs;
    DROP POLICY IF EXISTS "Employers can update jobs for their company" ON public.jobs;
    -- Applications
    DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
    DROP POLICY IF EXISTS "Candidates can create applications" ON public.applications;
    -- Saved jobs
    DROP POLICY IF EXISTS "Users can manage own saved jobs" ON public.saved_jobs;
    -- Email alerts
    DROP POLICY IF EXISTS "Users can manage own email alerts" ON public.email_alerts;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- Drop existing tables (CASCADE usunie też wszystkie zależności)
DROP TABLE IF EXISTS public.email_alerts CASCADE;
DROP TABLE IF EXISTS public.saved_jobs CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.employer_profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.candidate_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'employer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate profiles
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  skills TEXT[],
  experience TEXT,
  cv_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  api_key TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employer profiles
CREATE TABLE public.employer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  company_name TEXT NOT NULL, -- For scraped jobs without company_id
  company_logo TEXT,
  location TEXT NOT NULL,
  remote BOOLEAN DEFAULT false,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'PLN',
  salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly')),
  salary_mode TEXT DEFAULT 'gross' CHECK (salary_mode IN ('gross', 'net')),
  hourly_min INTEGER,
  hourly_max INTEGER,
  tech_stack TEXT[],
  contract_type TEXT,
  work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),
  seniority TEXT,
  required_language TEXT,
  language_level TEXT,
  recruitment_stages TEXT[],
  tags TEXT[],
  description TEXT NOT NULL,
  requirements TEXT[],
  benefits TEXT[],
  source TEXT NOT NULL CHECK (source IN ('native', 'justjoinit', 'nofluffjobs', 'pracuj', 'indeed', 'bulldogjob', 'rocketjobs')),
  source_url TEXT,
  source_id TEXT, -- Original ID from source
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- For deduplication
  UNIQUE(source, source_id)
);

-- Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  years_experience INTEGER,
  current_position TEXT,
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  available_from DATE,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  cv_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'rejected', 'hired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One application per job per candidate or email
  UNIQUE NULLS NOT DISTINCT (job_id, candidate_id, email)
);

-- Saved jobs
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One save per job per user
  UNIQUE(user_id, job_id)
);

-- Email alerts
CREATE TABLE public.email_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL, -- Store JobFilters as JSON
  frequency TEXT NOT NULL CHECK (frequency IN ('instant', 'daily', 'weekly')),
  enabled BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_jobs_source ON public.jobs(source);
CREATE INDEX idx_jobs_published_at ON public.jobs(published_at DESC);
CREATE INDEX idx_jobs_featured ON public.jobs(featured) WHERE featured = true;
CREATE INDEX idx_jobs_tech_stack ON public.jobs USING GIN(tech_stack);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_remote ON public.jobs(remote) WHERE remote = true;
CREATE INDEX idx_jobs_expires_at ON public.jobs(expires_at);
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);

-- Full-text search index
ALTER TABLE public.jobs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(company_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED;

CREATE INDEX idx_jobs_search ON public.jobs USING GIN(search_vector);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for candidate_profiles
CREATE POLICY "Candidate profiles are viewable by employers and owner"
  ON public.candidate_profiles FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

CREATE POLICY "Users can insert own candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own candidate profile"
  ON public.candidate_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for employer_profiles
CREATE POLICY "Employers can view own employer profile"
  ON public.employer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can insert own employer profile"
  ON public.employer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can update own employer profile"
  ON public.employer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can delete own employer profile"
  ON public.employer_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for jobs (public viewing)
CREATE POLICY "Jobs are viewable by everyone"
  ON public.jobs FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

CREATE POLICY "Scraped jobs can be inserted by service role"
  ON public.jobs FOR INSERT
  WITH CHECK (
    source != 'native' OR
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

CREATE POLICY "Scraped jobs can be updated by service role"
  ON public.jobs FOR UPDATE
  USING (
    source != 'native' OR
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

CREATE POLICY "Employers can delete their jobs"
  ON public.jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (
    auth.uid() = candidate_id OR
    EXISTS (
      SELECT 1 FROM public.employer_profiles ep
      JOIN public.jobs j ON j.company_id = ep.company_id
      WHERE ep.user_id = auth.uid() AND j.id = applications.job_id
    )
  );

CREATE POLICY "Candidates can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = candidate_id OR candidate_id IS NULL);

-- RLS Policies for saved_jobs
CREATE POLICY "Users can manage own saved jobs"
  ON public.saved_jobs FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for email_alerts
CREATE POLICY "Users can manage own email alerts"
  ON public.email_alerts FOR ALL
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from metadata or default to 'candidate'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidate');

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, user_role)
  ON CONFLICT (id) DO NOTHING;

  -- Create corresponding profile based on role
  IF user_role = 'candidate' THEN
    INSERT INTO public.candidate_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  ELSIF user_role = 'employer' THEN
    INSERT INTO public.employer_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'jbs_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired jobs
CREATE OR REPLACE FUNCTION public.cleanup_expired_jobs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.jobs
  WHERE expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
