-- CLEAR ALL JOBS
-- Run this in Supabase SQL Editor to delete all job listings

DELETE FROM public.jobs;

-- Verify - should return 0
SELECT COUNT(*) as remaining_jobs FROM public.jobs;
