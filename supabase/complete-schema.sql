-- ============================================================================
-- JobStack Complete Database Schema
-- ============================================================================
-- This script drops and recreates all tables from scratch
-- Run this in Supabase SQL Editor to reset the entire database
--
-- WARNING: This will DELETE ALL DATA! Use with caution in production.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- DROP ALL TABLES (in correct order to handle foreign keys)
-- ============================================================================

DROP TABLE IF EXISTS public.application_answers CASCADE;
DROP TABLE IF EXISTS public.application_questions CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.job_alerts CASCADE;
DROP TABLE IF EXISTS public.saved_jobs CASCADE;
DROP TABLE IF EXISTS public.email_alerts CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.employer_profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.candidate_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.generate_api_key() CASCADE;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'employer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate profiles (comprehensive user profile)
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Basic Information
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,

  -- Professional Information
  title TEXT,
  current_position TEXT,
  years_experience INTEGER,

  -- Salary Expectations
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  salary_currency TEXT DEFAULT 'PLN',

  -- Availability
  available_from DATE,
  open_to_remote BOOLEAN DEFAULT true,
  preferred_locations TEXT[],

  -- Skills & Experience
  skills TEXT[],
  experience TEXT,
  languages TEXT[], -- e.g., ["Polish (Native)", "English (C1)"]
  education JSON, -- Array of education entries
  work_experience JSON, -- Array of work experience entries
  certifications TEXT[],

  -- Links & Documents
  cv_url TEXT,
  resume_url TEXT,
  cover_letter_template TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  avatar_url TEXT,

  -- Privacy
  public_profile BOOLEAN DEFAULT false, -- Whether profile is publicly visible

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,

  -- Company Details
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  industry TEXT,
  location TEXT,
  founded_year INTEGER,

  -- Social Media
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,

  -- Company Culture
  benefits TEXT[],
  tech_stack TEXT[],
  culture_description TEXT,
  photos JSON, -- Array of company photos URLs

  -- API Access
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

  -- Personal Information
  position TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  title TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  company_name TEXT NOT NULL, -- For scraped jobs without company_id
  company_logo TEXT,

  -- Location
  location TEXT NOT NULL,
  remote BOOLEAN DEFAULT false,

  -- Salary
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'PLN',

  -- Job Details
  tech_stack TEXT[],
  description TEXT NOT NULL,
  requirements TEXT[],
  benefits TEXT[],

  -- Source Information
  source TEXT NOT NULL CHECK (source IN ('native', 'justjoinit', 'nofluffjobs', 'pracuj', 'indeed')),
  source_url TEXT,
  source_id TEXT, -- Original ID from source

  -- Visibility
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- For deduplication
  UNIQUE(source, source_id)
);

-- Applications (job applications from candidates)
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Allow anonymous applications

  -- Basic Information (for Quick Apply without registration)
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,

  -- Professional Information
  years_experience INTEGER,
  current_position TEXT,

  -- Salary Expectations
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,

  -- Availability
  available_from DATE,

  -- Links
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,

  -- Documents & Cover Letter
  cv_url TEXT,
  cover_letter TEXT,

  -- Additional Notes
  notes TEXT,

  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'rejected', 'hired')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate applications (same job + user OR same job + email)
  UNIQUE NULLS NOT DISTINCT (job_id, candidate_id, email)
);

-- Application Questions (custom questions from employers)
CREATE TABLE public.application_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,

  -- Question Details
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'checkbox', 'radio', 'select')),
  options TEXT[], -- For radio/select questions
  required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Answers (answers to custom questions)
CREATE TABLE public.application_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.application_questions(id) ON DELETE CASCADE,
  answer_text TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(application_id, question_id)
);

-- Saved Jobs (bookmarked jobs by candidates)
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, job_id)
);

-- Job Alerts (email notifications for new matching jobs)
CREATE TABLE public.job_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Alert Configuration
  name TEXT NOT NULL,
  query TEXT, -- Search query
  location TEXT,
  remote BOOLEAN,
  tech_stack TEXT[],
  salary_min INTEGER,

  -- Notification Settings
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('realtime', 'daily', 'weekly')),
  active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Alerts (legacy - keeping for backwards compatibility)
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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Candidate Profiles
CREATE INDEX idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_public ON public.candidate_profiles(public_profile) WHERE public_profile = true;
CREATE INDEX idx_candidate_profiles_skills ON public.candidate_profiles USING GIN(skills);

-- Employer Profiles
CREATE INDEX idx_employer_profiles_user_id ON public.employer_profiles(user_id);
CREATE INDEX idx_employer_profiles_company_id ON public.employer_profiles(company_id);

-- Companies
CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX idx_companies_name ON public.companies(name);

-- Jobs
CREATE INDEX idx_jobs_source ON public.jobs(source);
CREATE INDEX idx_jobs_published_at ON public.jobs(published_at DESC);
CREATE INDEX idx_jobs_featured ON public.jobs(featured) WHERE featured = true;
CREATE INDEX idx_jobs_tech_stack ON public.jobs USING GIN(tech_stack);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_remote ON public.jobs(remote) WHERE remote = true;
CREATE INDEX idx_jobs_expires_at ON public.jobs(expires_at);
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);

-- Full-text search index for jobs
ALTER TABLE public.jobs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(company_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED;

CREATE INDEX idx_jobs_search ON public.jobs USING GIN(search_vector);

-- Applications
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_email ON public.applications(email);
CREATE INDEX idx_applications_status ON public.applications(status);

-- Application Questions
CREATE INDEX idx_application_questions_job_id ON public.application_questions(job_id);

-- Application Answers
CREATE INDEX idx_application_answers_application_id ON public.application_answers(application_id);
CREATE INDEX idx_application_answers_question_id ON public.application_answers(question_id);

-- Saved Jobs
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs(job_id);

-- Job Alerts
CREATE INDEX idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX idx_job_alerts_active ON public.job_alerts(active) WHERE active = true;

-- Email Alerts
CREATE INDEX idx_email_alerts_user_id ON public.email_alerts(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Profiles
-- ============================================================================

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES - Candidate Profiles
-- ============================================================================

-- Anyone can read public candidate profiles, users can read their own
CREATE POLICY "Anyone can read public candidate profiles"
  ON public.candidate_profiles FOR SELECT
  USING (public_profile = true OR user_id = auth.uid());

CREATE POLICY "Users can update their own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own candidate profile"
  ON public.candidate_profiles FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - Employer Profiles
-- ============================================================================

CREATE POLICY "Anyone can read employer profiles"
  ON public.employer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own employer profile"
  ON public.employer_profiles FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - Companies
-- ============================================================================

CREATE POLICY "Anyone can read companies"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Company owners can update their company"
  ON public.companies FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Company owners can insert their company"
  ON public.companies FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - Jobs
-- ============================================================================

-- Jobs are viewable by everyone (except expired ones)
CREATE POLICY "Jobs are viewable by everyone"
  ON public.jobs FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

-- Employers can insert jobs for their company
CREATE POLICY "Employers can insert jobs for their company"
  ON public.jobs FOR INSERT
  WITH CHECK (
    source = 'native' AND
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

-- Employers can update jobs for their company
CREATE POLICY "Employers can update jobs for their company"
  ON public.jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

-- Employers can delete jobs for their company
CREATE POLICY "Employers can delete jobs for their company"
  ON public.jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

-- ============================================================================
-- RLS POLICIES - Applications
-- ============================================================================

-- Users can view own applications
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

-- Anyone can create applications (including anonymous)
CREATE POLICY "Anyone can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (true);

-- Candidates can update their own applications
CREATE POLICY "Candidates can update own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = candidate_id);

-- Employers can update applications for their jobs
CREATE POLICY "Employers can update applications for their jobs"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles ep
      JOIN public.jobs j ON j.company_id = ep.company_id
      WHERE ep.user_id = auth.uid() AND j.id = applications.job_id
    )
  );

-- ============================================================================
-- RLS POLICIES - Application Questions
-- ============================================================================

-- Everyone can read application questions
CREATE POLICY "Anyone can read application questions"
  ON public.application_questions FOR SELECT
  USING (true);

-- Only employers can manage questions for their jobs
CREATE POLICY "Employers can manage their job questions"
  ON public.application_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = application_questions.job_id
      AND c.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - Application Answers
-- ============================================================================

-- Anyone can create application answers when submitting
CREATE POLICY "Anyone can create application answers"
  ON public.application_answers FOR INSERT
  WITH CHECK (true);

-- Employers and applicants can read their answers
CREATE POLICY "Employers and applicants can read answers"
  ON public.application_answers FOR SELECT
  USING (
    -- Employer owns the job
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      JOIN public.companies c ON j.company_id = c.id
      WHERE a.id = application_answers.application_id
      AND c.owner_id = auth.uid()
    )
    OR
    -- User is the applicant
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_answers.application_id
      AND a.candidate_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - Saved Jobs
-- ============================================================================

CREATE POLICY "Users can manage their saved jobs"
  ON public.saved_jobs FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - Job Alerts
-- ============================================================================

CREATE POLICY "Users can manage their job alerts"
  ON public.job_alerts FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - Email Alerts (Legacy)
-- ============================================================================

CREATE POLICY "Users can manage own email alerts"
  ON public.email_alerts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'candidate');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'jbs_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated and anonymous users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE public.candidate_profiles IS 'Detailed candidate/job seeker profiles';
COMMENT ON TABLE public.employer_profiles IS 'Employer/recruiter profiles';
COMMENT ON TABLE public.companies IS 'Companies posting jobs';
COMMENT ON TABLE public.jobs IS 'Job postings (native and scraped)';
COMMENT ON TABLE public.applications IS 'Job applications from candidates';
COMMENT ON TABLE public.application_questions IS 'Custom questions employers can add to job applications';
COMMENT ON TABLE public.application_answers IS 'Answers to custom application questions';
COMMENT ON TABLE public.saved_jobs IS 'Jobs saved/bookmarked by candidates';
COMMENT ON TABLE public.job_alerts IS 'Email alerts for new jobs matching criteria';
COMMENT ON TABLE public.email_alerts IS 'Legacy email alerts (deprecated, use job_alerts)';

-- ============================================================================
-- COMPLETED
-- ============================================================================

-- Schema creation completed successfully!
-- Next steps:
-- 1. Create a 'cvs' bucket in Supabase Storage for CV uploads
-- 2. Configure CORS for your domain if using Storage
-- 3. Test the RLS policies with different user roles
