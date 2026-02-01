# Supabase Configuration Guide

## 1. Email Confirmation Setup (Fix 404 Error)

The 404 error on email confirmation is caused by incorrect redirect URL settings in Supabase.

### Steps to fix:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Set the following URLs:

```
Site URL: https://job-stack-five.vercel.app

Redirect URLs (add all):
- https://job-stack-five.vercel.app/**
- https://job-stack-five.vercel.app/auth/callback
- https://job-stack-five.vercel.app/dashboard
- http://localhost:3000/**
- http://localhost:3000/auth/callback
```

5. Click **Save**

### Custom Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the "Confirm signup" template:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Welcome to JobStack! After confirming, you'll be able to:</p>
<ul>
  <li>Create infrastructure diagrams</li>
  <li>Generate Terraform code</li>
  <li>Estimate cloud costs</li>
</ul>

<p>If you didn't create an account, you can safely ignore this email.</p>
```

## 2. GitHub OAuth Setup

### Create GitHub OAuth App:

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: JobStack
   - **Homepage URL**: https://job-stack-five.vercel.app
   - **Authorization callback URL**: https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback

4. Copy the **Client ID** and generate a **Client Secret**

### Configure in Supabase:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **GitHub** and enable it
3. Paste your Client ID and Client Secret
4. Save

## 3. Apply New Schema

Run this SQL in Supabase SQL Editor to update your database schema:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the entire contents of `supabase/schema.sql`
3. Click **Run**

**Note**: This will drop existing tables. If you have data you want to keep, backup first!

## 4. Realtime Configuration (for Collaboration)

1. Go to **Database** → **Replication**
2. Enable replication for tables:
   - `diagrams`
   - `projects`

This enables real-time collaborative editing.

## 5. RLS Policies

The schema includes Row Level Security policies. Verify they're active:

1. Go to **Authentication** → **Policies**
2. Ensure all tables show policies enabled

## 6. Vercel Environment Variables

Ensure these are set in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

After updating, redeploy on Vercel.

## Troubleshooting

### Email not arriving?
- Check spam folder
- Verify email provider isn't blocked by Supabase
- Check Supabase logs for email delivery errors

### OAuth redirect fails?
- Verify callback URL exactly matches in GitHub settings
- Ensure Supabase provider is enabled
- Check browser console for errors

### 500 errors on API?
- Check Supabase logs for SQL errors
- Verify RLS policies allow the operation
- Check that user profile was created (trigger should handle this)
