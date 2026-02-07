-- Add soft-delete support to profiles for GDPR Art. 17 (right to erasure)
-- 7-day grace period before permanent deletion
-- Also adds settings JSONB for email preferences

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_for TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Index for querying accounts pending deletion
CREATE INDEX IF NOT EXISTS idx_profiles_deletion
  ON public.profiles (deletion_scheduled_for)
  WHERE deletion_scheduled_for IS NOT NULL;
