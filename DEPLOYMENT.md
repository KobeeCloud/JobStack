# Deployment Guide - JobStack

## Prerequisites

- [x] GitHub repository created (KobeeCloud/JobStack)
- [ ] Supabase project created
- [ ] Vercel account

---

## Step 1: Setup Supabase

### 1.1 Create Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Project name: `jobstack-production`
4. Database password: Generate strong password (save it!)
5. Region: `Frankfurt (eu-central-1)`
6. Click "Create new project"

### 1.2 Run Database Schema
1. Open SQL Editor in Supabase Dashboard
2. Copy all SQL from `supabase/schema.sql`
3. Click "Run"
4. Verify tables created in Table Editor

### 1.3 Configure Auth
1. Go to Authentication → Providers
2. Enable Email provider
3. **Enable Google OAuth** (optional):
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

### 1.4 Get API Keys
Go to Settings → API and copy:
- **Project URL**: `https://YOUR_PROJECT.supabase.co`
- **anon/public key**: `eyJhbGc...`
- **service_role key**: `eyJhbGc...` (keep this secret!)

---

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import `KobeeCloud/JobStack` from GitHub
4. Framework: **Next.js** (auto-detected)
5. Root Directory: `./` (default)

### 2.2 Environment Variables
Add these in Vercel project settings:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Cron Secret (generate random string)
CRON_SECRET=your-random-secret-token-here

# Optional: Groq AI for paraphrasing
GROQ_API_KEY=your-groq-api-key
```

To generate CRON_SECRET:
```bash
openssl rand -hex 32
```

### 2.3 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your site will be live at `https://jobstack-xxx.vercel.app`

---

## Step 3: Configure Vercel Cron Jobs

### 3.1 Enable Cron in Vercel
Cron jobs are automatically configured from `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scrape/justjoinit",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

This runs every 2 hours.

### 3.2 Update Cron Endpoint Auth
The scraper endpoints check for `CRON_SECRET`. Vercel Cron automatically includes:
```
Authorization: Bearer CRON_SECRET
```

No additional configuration needed!

### 3.3 Test Cron Manually
```bash
curl -X POST https://your-domain.vercel.app/api/scrape/justjoinit \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Step 4: Custom Domain (Optional)

### 4.1 Add Domain in Vercel
1. Go to Project Settings → Domains
2. Add your domain: `jobstack.pl`
3. Follow DNS configuration steps

### 4.2 Update Supabase Auth URLs
1. Go to Supabase → Authentication → URL Configuration
2. Site URL: `https://jobstack.pl`
3. Redirect URLs: `https://jobstack.pl/**`

---

## Step 5: Production Checks

### ✅ Functionality Tests
- [ ] Landing page loads
- [ ] /jobs page shows listings
- [ ] Search and filters work
- [ ] Job detail pages load
- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard accessible after login

### ✅ API Tests
```bash
# Test public jobs API
curl "https://your-domain.vercel.app/api/jobs?limit=5"

# Test scraper (should return 401 without auth)
curl "https://your-domain.vercel.app/api/scrape/justjoinit"
```

### ✅ Database Checks
Run in Supabase SQL Editor:
```sql
-- Check if scraper is working
SELECT source, COUNT(*)
FROM public.jobs
GROUP BY source;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

---

## Step 6: Monitoring & Analytics

### 6.1 Vercel Analytics
1. Go to Vercel Project → Analytics
2. Enable Web Analytics (free)

### 6.2 Supabase Monitoring
1. Dashboard → Reports
2. Monitor:
   - Database size
   - API requests
   - Auth users

### 6.3 Error Tracking (Optional)
Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **PostHog** for product analytics

---

## Step 7: Backup & Security

### 7.1 Database Backups
Supabase Free Tier:
- Daily backups for 7 days
- Manual backups available

Pro Tier ($25/month):
- Point-in-time recovery
- 14 days retention

### 7.2 Security Checklist
- [x] RLS enabled on all tables
- [x] Service role key kept secret
- [x] CORS configured
- [x] Rate limiting on API
- [ ] Setup monitoring alerts
- [ ] Regular dependency updates

---

## Troubleshooting

### Issue: Jobs not appearing
**Solution:**
1. Check if scraper ran: `SELECT COUNT(*) FROM jobs WHERE source = 'justjoinit'`
2. Manually trigger: `curl -X GET https://localhost:3000/api/scrape/justjoinit` (dev only)
3. Check Vercel function logs

### Issue: Auth not working
**Solution:**
1. Verify Supabase URL and keys in Vercel env vars
2. Check redirect URLs in Supabase Auth settings
3. Clear cookies and try again

### Issue: "Database error" on signup
**Solution:**
1. Verify schema ran successfully
2. Check if `handle_new_user()` trigger exists
3. Run: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'`

---

## Next Steps

1. **Add More Scrapers**: NoFluffJobs, Pracuj.pl
2. **Setup Email Alerts**: Use Resend or SendGrid
3. **Add Analytics**: Track job views, clicks
4. **SEO Optimization**: Add meta tags, sitemap
5. **Performance**: Add Redis caching (Upstash)
6. **Mobile App**: React Native or PWA

---

## Useful Commands

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
```

### Deployment
```bash
git push origin main              # Deploy to Vercel
vercel --prod                     # Manual deploy
vercel env pull .env.local        # Sync env vars
```

### Database
```bash
# Seed test data
npx tsx scripts/seed-jobs.ts

# Run migrations
npx supabase db push
```

---

## Support

- 📧 Email: support@jobstack.pl
- 💬 Discord: [Join Server](https://discord.gg/jobstack)
- 🐛 Issues: [GitHub Issues](https://github.com/KobeeCloud/JobStack/issues)

---

**Deployment Checklist:**
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Vercel project deployed
- [ ] Environment variables set
- [ ] Cron jobs configured
- [ ] Custom domain added (optional)
- [ ] All tests passing
- [ ] Monitoring enabled

🎉 **Your JobStack is now live!**
