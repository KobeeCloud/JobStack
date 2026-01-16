-- Remove duplicate jobs (keep only the oldest one for each source+source_id)
-- Run this in Supabase SQL Editor

-- Show duplicates first (for verification)
SELECT
  source,
  source_id,
  COUNT(*) as count,
  array_agg(id) as duplicate_ids
FROM public.jobs
WHERE source_id IS NOT NULL
GROUP BY source, source_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Delete duplicates, keeping only the oldest record
DELETE FROM public.jobs
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY source, source_id
        ORDER BY created_at ASC
      ) as row_num
    FROM public.jobs
    WHERE source_id IS NOT NULL
  ) t
  WHERE row_num > 1
);

-- Show stats after cleanup
SELECT
  source,
  COUNT(*) as total_jobs,
  COUNT(DISTINCT source_id) as unique_jobs,
  MAX(created_at) as last_scraped
FROM public.jobs
GROUP BY source
ORDER BY source;
