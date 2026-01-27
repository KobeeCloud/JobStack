# 🚀 Deployment Guide - Vercel + Supabase Free Tier

This guide will help you deploy JobStack to production using **Vercel** and **Supabase** free tiers.

---

## ✅ What Works on Free Tier

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (10s timeout)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Custom domains

### Supabase Free Tier
- ✅ 500MB database storage
- ✅ 2GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 million database requests/month
- ✅ Email authentication
- ✅ Row Level Security (RLS)

### Optional Services (Not Required)
- ⚠️ **Upstash Redis** - Rate limiting (optional, has fallback)
- ⚠️ **Sentry** - Error tracking (optional)

**Good news:** The app works perfectly without these optional services!

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository created
- [ ] Vercel account (free tier)
- [ ] Supabase project created
- [ ] Environment variables ready

---

## 🗄️ Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/login with GitHub
4. Click "New Project"
5. Fill in:
   - **Name:** `jobstack` (or your choice)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free

### 1.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `supabase/schema.sql`
4. Paste into SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for "Success" message ✅

### 1.3 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

---

## 🚀 Step 2: Deploy to Vercel

### 2.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Select the repository: `JobStack`

### 2.2 Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### 2.3 Add Environment Variables

Click **Environment Variables** and add:

#### Required Variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URL (Required)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Optional Variables (Can Skip for Free Tier):

```bash
# Rate Limiting (Optional - works without it)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Error Tracking (Optional)
SENTRY_DSN=

# Logging (Optional)
LOG_LEVEL=info

# Google Verification (Optional)
GOOGLE_SITE_VERIFICATION=
```

**Important:**
- Add variables for **Production**, **Preview**, and **Development** environments
- Click **Save** after adding each variable

### 2.4 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build
3. ✅ Success! Your app is live!

---

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Enable Email Auth in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set **Site URL** to your Vercel URL: `https://your-app.vercel.app`

### 3.2 Update Redirect URLs

1. In Supabase → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs:**
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/dashboard
   https://your-app.vercel.app/login
   ```
3. **Site URL:** `https://your-app.vercel.app`

### 3.3 Test Your Deployment

1. Visit your Vercel URL
2. Click **Get Started** → Register
3. Check email for confirmation (if enabled)
4. Login → Create project → Build diagram
5. ✅ Everything should work!

---

## 🎯 What Happens After Push

### Automatic Deployment

When you push to GitHub:

1. **Vercel detects push** (if connected to repo)
2. **Builds your app** (`npm run build`)
3. **Runs tests** (if configured)
4. **Deploys automatically** to production
5. **Sends notification** (email/Slack)

### Manual Deployment

If auto-deploy is disabled:

1. Go to Vercel Dashboard
2. Click **Deployments** tab
3. Click **Redeploy** on latest deployment

---

## 🔍 Troubleshooting

### Build Fails

**Error:** `Module not found`
- **Fix:** Run `npm install` locally, commit `package-lock.json`

**Error:** `Environment variable missing`
- **Fix:** Add all required env vars in Vercel dashboard

**Error:** `TypeScript errors`
- **Fix:** Run `npm run type-check` locally, fix errors

### Database Errors

**Error:** `relation "projects" does not exist`
- **Fix:** Run `supabase/schema.sql` in Supabase SQL Editor

**Error:** `Row Level Security policy violation`
- **Fix:** Check RLS policies in schema.sql are applied

### Authentication Issues

**Error:** `Invalid redirect URL`
- **Fix:** Add your Vercel URL to Supabase redirect URLs

**Error:** `Email not confirmed`
- **Fix:** Disable email confirmation in Supabase Auth settings (for testing)

---

## 📊 Monitoring Your App

### Vercel Analytics (Free)

1. Go to Vercel Dashboard → **Analytics**
2. Enable Analytics (free tier available)
3. View:
   - Page views
   - Unique visitors
   - Performance metrics

### Supabase Dashboard

1. Monitor:
   - Database size (500MB free limit)
   - API requests (2M/month free)
   - Active users (50K/month free)

### Health Check

Visit: `https://your-app.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T...",
  "services": {
    "database": "ok"
  }
}
```

---

## 🎉 Success Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Vercel project connected
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Can register new user
- [ ] Can create project
- [ ] Can build diagram
- [ ] Can save diagram
- [ ] Can export Terraform code

---

## 💡 Free Tier Limits & Tips

### Vercel Limits
- **Bandwidth:** 100GB/month (usually enough)
- **Function execution:** 10 seconds max
- **Build time:** 45 minutes/month

**Tip:** Optimize images, use CDN for static assets

### Supabase Limits
- **Database:** 500MB (enough for thousands of projects)
- **Storage:** 2GB (for file uploads)
- **API requests:** 2M/month (plenty for small-medium apps)

**Tip:**
- Clean up old data periodically
- Use database indexes (already in schema)
- Monitor usage in Supabase dashboard

### When to Upgrade

Consider upgrading if:
- Database > 400MB
- API requests > 1.5M/month
- Need longer function timeouts
- Need more bandwidth

---

## 🔐 Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **NOT** in code
- [ ] Environment variables are set in Vercel (not `.env` file)
- [ ] RLS policies are enabled (already in schema)
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] CORS is configured (handled by Supabase)

---

## 📝 Next Steps

1. **Custom Domain** (Optional)
   - Add domain in Vercel
   - Update Supabase redirect URLs

2. **Email Templates** (Optional)
   - Customize in Supabase → Authentication → Email Templates

3. **Monitoring** (Optional)
   - Add Sentry for error tracking
   - Add Upstash for rate limiting

4. **Analytics** (Optional)
   - Enable Vercel Analytics
   - Add Google Analytics

---

## 🆘 Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Issues:** Open GitHub issue

---

**You're all set! 🎉**

Your app is now live and running on free tier infrastructure!
