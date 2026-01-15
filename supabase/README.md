# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization: KobeeCloud
4. Project name: `jobstack`
5. Database password: (generate strong password)
6. Region: `Frankfurt (eu-central-1)` (closest to Poland)
7. Click "Create new project"

## 2. Run Database Schema

1. Open SQL Editor in Supabase Dashboard
2. Copy content from `supabase/schema.sql`
3. Click "Run"
4. Verify tables were created in Table Editor

## 3. Get API Keys

1. Go to Project Settings → API
2. Copy these values to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Enable Google OAuth (optional for future)

### Email Templates Configuration

Go to Authentication → Email Templates and customize:

**Confirm Signup:**
```
Subject: Confirm your JobStack account

Hi there,

Thanks for signing up to JobStack!

Click below to confirm your email:
{{ .ConfirmationURL }}

Happy job hunting!
The JobStack Team
```

## 5. Storage Setup (for CVs and logos)

1. Go to Storage
2. Create bucket: `cvs`
   - Public: No
   - File size limit: 5MB
   - Allowed MIME types: `application/pdf`

3. Create bucket: `logos`
   - Public: Yes
   - File size limit: 2MB
   - Allowed MIME types: `image/png,image/jpeg,image/webp`

### Storage Policies

For `cvs` bucket:
```sql
-- Users can upload their own CVs
CREATE POLICY "Users can upload own CV"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own CVs
CREATE POLICY "Users can read own CV"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

For `logos` bucket:
```sql
-- Anyone can read logos
CREATE POLICY "Logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- Company owners can upload logos
CREATE POLICY "Company owners can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
```

## 6. Enable Realtime (optional)

For live job updates:

1. Go to Database → Replication
2. Enable replication for `public.jobs` table
3. This allows real-time subscriptions in the app

## 7. Test Connection

Create `.env.local` in project root:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Run test:
```bash
npm run dev
```

Visit http://localhost:3000 and check console for errors.

## 8. Seed Data (Optional)

For development, you can seed some test jobs:

```sql
-- Insert test company
INSERT INTO public.companies (name, logo_url, website, plan)
VALUES ('Test Tech Corp', NULL, 'https://testtech.com', 'free')
RETURNING id;

-- Insert test job (use company ID from above)
INSERT INTO public.jobs (
  title,
  company_id,
  company_name,
  location,
  remote,
  salary_min,
  salary_max,
  tech_stack,
  description,
  requirements,
  source
) VALUES (
  'Senior React Developer',
  'YOUR-COMPANY-ID-HERE',
  'Test Tech Corp',
  'Warsaw',
  true,
  18000,
  25000,
  ARRAY['React', 'TypeScript', 'Next.js'],
  'We are looking for an experienced React developer...',
  ARRAY['5+ years React', 'TypeScript expert', 'Team player'],
  'native'
);
```

## Production Checklist

Before going live:

- [ ] Change database password
- [ ] Enable RLS on all tables (already done in schema)
- [ ] Set up database backups (automatic on paid plans)
- [ ] Configure custom domain for auth redirects
- [ ] Set up monitoring and alerts
- [ ] Review storage policies
- [ ] Enable 2FA for Supabase account

## Useful Queries

### Check job count by source
```sql
SELECT source, COUNT(*)
FROM public.jobs
GROUP BY source;
```

### Find expired jobs
```sql
SELECT * FROM public.jobs
WHERE expires_at < NOW();
```

### Active jobs count
```sql
SELECT COUNT(*) FROM public.jobs
WHERE expires_at IS NULL OR expires_at > NOW();
```
