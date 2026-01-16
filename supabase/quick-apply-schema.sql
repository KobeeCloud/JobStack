-- Extension to JobStack schema for Quick Apply feature

-- Application Questions (customizable questions from employers)
CREATE TABLE IF NOT EXISTS public.application_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'checkbox', 'radio', 'select')),
  options TEXT[], -- For radio/select questions
  required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Answers (answers to custom questions)
CREATE TABLE IF NOT EXISTS public.application_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.application_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(application_id, question_id)
);

-- Add missing columns to applications table for Quick Apply
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS current_position TEXT,
ADD COLUMN IF NOT EXISTS expected_salary_min INTEGER,
ADD COLUMN IF NOT EXISTS expected_salary_max INTEGER,
ADD COLUMN IF NOT EXISTS available_from DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Make candidate_id nullable for anonymous applications
ALTER TABLE public.applications
ALTER COLUMN candidate_id DROP NOT NULL;

-- Add email to UNIQUE constraint for anonymous applications
ALTER TABLE public.applications
DROP CONSTRAINT IF EXISTS applications_job_id_candidate_id_key;

ALTER TABLE public.applications
ADD CONSTRAINT applications_job_id_user_unique
UNIQUE NULLS NOT DISTINCT (job_id, candidate_id, email);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_application_questions_job_id
ON public.application_questions(job_id);

CREATE INDEX IF NOT EXISTS idx_application_answers_application_id
ON public.application_answers(application_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
ON public.applications(job_id);

CREATE INDEX IF NOT EXISTS idx_applications_email
ON public.applications(email);

-- Row Level Security
ALTER TABLE public.application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;

-- Everyone can read application questions
CREATE POLICY "Anyone can read application questions"
ON public.application_questions FOR SELECT
USING (true);

-- Only employers can create/update/delete questions for their jobs
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

-- Anyone can create application answers when submitting
CREATE POLICY "Anyone can create application answers"
ON public.application_answers FOR INSERT
WITH CHECK (true);

-- Only employers and applicants can read their answers
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

-- Grant permissions
GRANT ALL ON public.application_questions TO authenticated, anon;
GRANT ALL ON public.application_answers TO authenticated, anon;

COMMENT ON TABLE public.application_questions IS 'Custom questions employers can add to job applications';
COMMENT ON TABLE public.application_answers IS 'Answers to custom application questions';
