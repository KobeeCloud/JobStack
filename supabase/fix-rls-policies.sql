-- Napraw polityki RLS dla scrapowanych ofert pracy
-- Uruchom to w Supabase SQL Editor

-- Drop old policies
DROP POLICY IF EXISTS "Employers can insert jobs for their company" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update jobs for their company" ON public.jobs;
DROP POLICY IF EXISTS "Scraped jobs can be inserted by service role" ON public.jobs;
DROP POLICY IF EXISTS "Scraped jobs can be updated by service role" ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete their jobs" ON public.jobs;

-- Drop candidate/employer profile policies if missing
DROP POLICY IF EXISTS "Users can insert own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can delete own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Employers can view own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Employers can insert own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Employers can update own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Employers can delete own employer profile" ON public.employer_profiles;

-- Create new policies that allow scraped jobs
-- Ta polityka pozwala na INSERT dla wszystkich ofert z source != 'native'
CREATE POLICY "Scraped jobs can be inserted"
  ON public.jobs FOR INSERT
  WITH CHECK (
    source != 'native' OR
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

-- Ta polityka pozwala na UPDATE dla wszystkich ofert z source != 'native'
CREATE POLICY "Scraped jobs can be updated"
  ON public.jobs FOR UPDATE
  USING (
    source != 'native' OR
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

-- Ta polityka pozwala pracodawcom na DELETE tylko ich własnych ofert
CREATE POLICY "Employers can delete their jobs"
  ON public.jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE user_id = auth.uid() AND company_id = jobs.company_id
    )
  );

-- Candidate profile policies
CREATE POLICY "Users can insert own candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own candidate profile"
  ON public.candidate_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Employer profile policies
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

-- Sprawdź czy polityki zostały utworzone
SELECT * FROM pg_policies WHERE tablename = 'jobs';
SELECT * FROM pg_policies WHERE tablename = 'candidate_profiles';
SELECT * FROM pg_policies WHERE tablename = 'employer_profiles';
