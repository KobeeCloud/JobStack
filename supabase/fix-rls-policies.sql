-- Napraw polityki RLS dla scrapowanych ofert pracy
-- Uruchom to w Supabase SQL Editor

-- Drop old policies
DROP POLICY IF EXISTS "Employers can insert jobs for their company" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update jobs for their company" ON public.jobs;
DROP POLICY IF EXISTS "Scraped jobs can be inserted by service role" ON public.jobs;
DROP POLICY IF EXISTS "Scraped jobs can be updated by service role" ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete their jobs" ON public.jobs;

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

-- Sprawdź czy polityki zostały utworzone
SELECT * FROM pg_policies WHERE tablename = 'jobs';
