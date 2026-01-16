-- Extension to candidate_profiles and employer_profiles for better user profiles

-- Add more fields to candidate_profiles
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS current_position TEXT,
ADD COLUMN IF NOT EXISTS expected_salary_min INTEGER,
ADD COLUMN IF NOT EXISTS expected_salary_max INTEGER,
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'PLN',
ADD COLUMN IF NOT EXISTS available_from DATE,
ADD COLUMN IF NOT EXISTS open_to_remote BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT, -- Main CV/Resume
ADD COLUMN IF NOT EXISTS cover_letter_template TEXT, -- Default cover letter
ADD COLUMN IF NOT EXISTS languages TEXT[], -- e.g., ["Polish (Native)", "English (C1)"]
ADD COLUMN IF NOT EXISTS education JSON, -- Array of education entries
ADD COLUMN IF NOT EXISTS work_experience JSON, -- Array of work experience entries
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false; -- Whether profile is publicly visible

-- Add more fields to employer_profiles
ALTER TABLE public.employer_profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add more fields to companies
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT[],
ADD COLUMN IF NOT EXISTS tech_stack TEXT[],
ADD COLUMN IF NOT EXISTS culture_description TEXT,
ADD COLUMN IF NOT EXISTS photos JSON; -- Array of company photos URLs

-- Create saved_jobs table (for candidates to save jobs)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, job_id)
);

-- Create job_alerts table (email notifications for new matching jobs)
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT, -- Search query
  location TEXT,
  remote BOOLEAN,
  tech_stack TEXT[],
  salary_min INTEGER,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('realtime', 'daily', 'weekly')),
  active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id ON public.employer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_company_id ON public.employer_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON public.job_alerts(active);

-- Row Level Security
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own saved jobs
CREATE POLICY "Users can manage their saved jobs"
ON public.saved_jobs FOR ALL
USING (user_id = auth.uid());

-- Users can only manage their own job alerts
CREATE POLICY "Users can manage their job alerts"
ON public.job_alerts FOR ALL
USING (user_id = auth.uid());

-- Update RLS for candidate_profiles - users can view public profiles
DROP POLICY IF EXISTS "Users can read their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidate_profiles;

CREATE POLICY "Anyone can read public candidate profiles"
ON public.candidate_profiles FOR SELECT
USING (public_profile = true OR user_id = auth.uid());

CREATE POLICY "Users can update their own candidate profile"
ON public.candidate_profiles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own candidate profile"
ON public.candidate_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.saved_jobs TO authenticated, anon;
GRANT ALL ON public.job_alerts TO authenticated;

COMMENT ON TABLE public.saved_jobs IS 'Jobs saved/bookmarked by candidates';
COMMENT ON TABLE public.job_alerts IS 'Email alerts for new jobs matching criteria';
