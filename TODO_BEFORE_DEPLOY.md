# Pre-Deployment TODO List

**Project:** JobStack - Job Aggregation Platform
**Branch:** feature/legal-compliance
**Status:** 🟡 Ready for development testing, NOT production ready yet
**Updated:** January 16, 2026

---

## 🚨 CRITICAL - Must Complete Before Production Launch

### 1. Business Information ⚠️
- [ ] **Replace placeholder NIP** in footer ([app/page.tsx](app/page.tsx#L184))
  - Current: `[Your NIP]`
  - Action: Add your real NIP (tax ID)
- [ ] **Replace placeholder REGON** in footer
  - Current: `[Your REGON]`
  - Action: Add your real REGON (business number)
- [ ] **Add business address** to all legal documents
  - Files to update:
    - [TERMS.md](TERMS.md) - Section 11, 16
    - [PRIVACY.md](PRIVACY.md) - Section 1, 9
    - [COOKIES.md](COOKIES.md) - Section "Contact Us"
    - [app/page.tsx](app/page.tsx) - Footer
  - Current: `[Your business address]`
  - Action: Add your registered JDG address

### 2. Email Addresses 📧
- [ ] **Set up business email domains**
  - Required emails:
    - `legal@jobstack.pl` - Legal inquiries
    - `privacy@jobstack.pl` - RODO/privacy requests
    - `support@jobstack.pl` - Customer support
    - `abuse@jobstack.pl` - Abuse reports (for scrapers)
  - Alternatives if .pl not available:
    - Use custom domain (e.g., `legal@jobstack.com`)
    - Or temporary: `legal@kobecloud.pl` (if you have this domain)
- [ ] **Update email links** in legal docs and footer once emails are live

### 3. Cookie Consent Banner 🍪
- [ ] **Implement cookie consent UI**
  - Location: Create `/components/cookie-consent-banner.tsx`
  - Requirements:
    - Show on first visit
    - 3 buttons: "Accept All", "Customize", "Reject Non-Essential"
    - Save preference in localStorage
    - RODO compliant (granular consent)
  - Libraries to consider:
    - [@cookiehub/cookie-consent](https://www.npmjs.com/package/@cookiehub/cookie-consent)
    - [react-cookie-consent](https://www.npmjs.com/package/react-cookie-consent)
    - Or build custom with shadcn/ui components
- [ ] **Add cookie consent banner to layout**
  - File: [app/layout.tsx](app/layout.tsx)
  - Position: Bottom of page, sticky

### 4. Scraper Legal Compliance 🤖
- [ ] **Add robots.txt checker** to scrapers
  - File to update: [lib/scrapers/justjoinit.ts](lib/scrapers/justjoinit.ts)
  - Implementation:
    ```typescript
    import { checkRobotsTxt } from '@/lib/utils/robots-checker';

    // Before scraping
    const isAllowed = await checkRobotsTxt('https://justjoin.it', '/api/offers');
    if (!isAllowed) {
      console.error('robots.txt disallows scraping');
      return;
    }
    ```
- [ ] **Create robots.txt checker utility**
  - File: Create `/lib/utils/robots-checker.ts`
  - Use library: [robots-parser](https://www.npmjs.com/package/robots-parser)
- [ ] **Add rate limiting** to scrapers
  - Current: No rate limiting (legal risk!)
  - Required: Max 1 request per second
  - Implementation: Add delay between requests
    ```typescript
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    ```
- [ ] **Update User-Agent** format (already done, but verify)
  - Current: `JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)`
  - ✅ Already updated in [lib/scrapers/justjoinit.ts](lib/scrapers/justjoinit.ts#L33)
  - Action: Verify once domain is live

### 5. RODO Data Rights Implementation 👤
- [ ] **Create data export API endpoint**
  - File: Create `/app/api/user/export/route.ts`
  - Functionality:
    - Get user data (profile, saved jobs, applications)
    - Return as JSON or CSV
    - Require authentication
    - Log export request (RODO compliance)
  - Example response: `{ profile: {...}, jobs: [...], applications: [...] }`
- [ ] **Create account deletion API endpoint**
  - File: Create `/app/api/user/delete/route.ts`
  - Functionality:
    - Soft delete (mark as deleted, keep for 30 days)
    - Or hard delete (immediate removal)
    - Delete profile, saved jobs, applications
    - Keep audit logs (legal requirement)
    - Send confirmation email
- [ ] **Add data export button** to user dashboard
  - File: [app/dashboard/page.tsx](app/dashboard/page.tsx)
  - Button: "Download My Data (RODO)"
  - Download as `jobstack-data-export-YYYY-MM-DD.json`
- [ ] **Add account deletion button** to settings
  - File: Create `/app/settings/page.tsx` (if doesn't exist)
  - Warning: "This will permanently delete your account"
  - Confirmation dialog required

### 6. Source Attribution (Legal Compliance) ✅ PARTIALLY DONE
- [x] **Add "Originally posted on" to JobCard**
  - ✅ Already done in [components/job-card.tsx](components/job-card.tsx#L58-L67)
- [ ] **Add source attribution to job detail page**
  - File: [app/jobs/[id]/page.tsx](app/jobs/[id]/page.tsx)
  - Location: Below job title
  - Format: "Originally posted on JustJoin.it - [View Original](https://...)"
- [ ] **Add disclaimer to job detail page**
  - Text: "JobStack is not responsible for the accuracy of this job listing. Please verify all details with the employer."
  - Position: Bottom of job description

---

## 🔴 HIGH PRIORITY - Complete Within 1 Week

### 7. Content Moderation System 🛡️
- [ ] **Create admin panel** for content moderation
  - File: Create `/app/admin/page.tsx`
  - Protected by middleware (admin role only)
  - Features:
    - List all job postings (native only, not aggregated)
    - Review job content for discriminatory language
    - Approve/reject jobs
    - Ban employers
- [ ] **Add moderation status** to database
  - Update schema: Add `moderation_status` enum to jobs table
  - Values: `pending`, `approved`, `rejected`
  - Default: Native jobs = `pending`, Aggregated jobs = `approved`
- [ ] **Filter jobs by moderation status** in API
  - File: [app/api/jobs/route.ts](app/api/jobs/route.ts)
  - Only show `approved` jobs to public
  - Admins can see all

### 8. Report System 📢
- [ ] **Add "Report Job" button** to job detail page
  - File: [app/jobs/[id]/page.tsx](app/jobs/[id]/page.tsx)
  - Modal with reasons:
    - Discriminatory content
    - Scam/fraud
    - Job no longer available
    - Incorrect information
    - Other (text field)
- [ ] **Create reports API endpoint**
  - File: Create `/app/api/reports/route.ts`
  - Store in database: `reports` table
  - Fields: `id`, `job_id`, `reporter_id`, `reason`, `description`, `created_at`
- [ ] **Add reports table to schema**
  - File: [supabase/schema.sql](supabase/schema.sql)
  - Schema:
    ```sql
    CREATE TABLE reports (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
      reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      reason TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
- [ ] **Admin view for reports**
  - Add to admin panel: `/app/admin/reports/page.tsx`
  - List all reports with job details
  - Mark as reviewed/resolved

### 9. Domain & SSL 🌐
- [ ] **Register domain**
  - Options:
    - `jobstack.pl` (preferred, Polish TLD)
    - `jobstack.com` (international)
    - `jobstack.eu` (EU focus)
  - Registrar suggestions:
    - [OVH.pl](https://www.ovhcloud.com/pl/) (Polish registrar)
    - [home.pl](https://home.pl/) (Polish registrar)
    - [Namecheap](https://www.namecheap.com/)
- [ ] **Configure DNS** in Vercel
  - Vercel Dashboard → Domains → Add domain
  - Add DNS records from registrar
- [ ] **SSL Certificate** (automatic with Vercel)
  - Vercel auto-generates Let's Encrypt SSL
  - Verify HTTPS works after domain setup
- [ ] **Update URLs** in all legal docs
  - Replace `https://jobstack.pl` placeholders with real domain
  - Files: TERMS.md, PRIVACY.md, COOKIES.md, scraper User-Agent

### 10. Analytics & Monitoring 📊
- [ ] **Set up Google Analytics 4**
  - Create GA4 property: [analytics.google.com](https://analytics.google.com)
  - Add tracking code to [app/layout.tsx](app/layout.tsx)
  - Remember: Requires cookie consent!
  - Implementation:
    ```typescript
    import Script from 'next/script';

    // In layout.tsx
    {cookieConsent.analytics && (
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
    )}
    ```
- [ ] **Set up error monitoring**
  - Options:
    - [Sentry](https://sentry.io/) (free tier: 5k events/month)
    - [LogRocket](https://logrocket.com/)
    - Vercel Analytics (built-in)
  - Track: API errors, scraper failures, auth issues
- [ ] **Set up uptime monitoring**
  - Options:
    - [UptimeRobot](https://uptimerobot.com/) (free: 50 monitors)
    - [Pingdom](https://www.pingdom.com/)
    - [StatusCake](https://www.statuscake.com/)
  - Monitor: Homepage, /api/jobs, scraper cron job

---

## 🟡 MEDIUM PRIORITY - Complete Within 1 Month

### 11. Email Integration 📨
- [ ] **Set up email service**
  - Options:
    - [Resend](https://resend.com/) (free: 3k emails/month) ⭐ Recommended
    - [SendGrid](https://sendgrid.com/) (free: 100 emails/day)
    - [Mailgun](https://www.mailgun.com/) (free: 5k emails/month)
  - Use case: Email alerts, transactional emails (password reset, etc.)
- [ ] **Create email templates**
  - Templates needed:
    - Welcome email
    - Password reset
    - Job alerts (daily digest)
    - Application confirmation
    - Employer: Job approved/rejected
  - Use: [react-email](https://react.email/) for templates
- [ ] **Implement email alerts**
  - File: Create `/app/api/cron/email-alerts/route.ts`
  - Vercel Cron: Daily at 8 AM
  - Logic:
    - Get users with email alerts enabled
    - Find new jobs matching their criteria
    - Send digest email
    - Mark alerts as sent

### 12. Saved Jobs & Applications 💾
- [ ] **Implement saved jobs UI**
  - File: Create `/app/saved-jobs/page.tsx`
  - Show user's saved jobs
  - Add "Unsave" button
  - Filter by tech stack, date saved
- [ ] **Implement save/unsave API**
  - File: Create `/app/api/jobs/[id]/save/route.ts`
  - POST: Save job (insert into `saved_jobs`)
  - DELETE: Unsave job
  - Require authentication
- [ ] **Add "Save Job" button** to job detail page
  - File: [app/jobs/[id]/page.tsx](app/jobs/[id]/page.tsx)
  - Icon: Bookmark (empty/filled)
  - Optimistic UI update
- [ ] **Application tracking**
  - File: Create `/app/applications/page.tsx`
  - Show jobs user applied to
  - Status: Applied, Interview, Rejected, Offer
  - Add notes field

### 13. Security Hardening 🔒
- [ ] **Add rate limiting** to API endpoints
  - Use: [Upstash Rate Limit](https://upstash.com/docs/redis/features/ratelimiting)
  - Limits:
    - Public API: 60 requests/minute per IP
    - Auth API: 5 requests/minute (login, register)
    - Employer API: 10 jobs/day (free plan)
  - File: Create `/lib/rate-limit.ts`
- [ ] **Add CAPTCHA** to registration
  - Options:
    - [hCaptcha](https://www.hcaptcha.com/) (free, privacy-friendly)
    - [reCAPTCHA v3](https://www.google.com/recaptcha/) (invisible)
    - [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) (free, GDPR compliant)
  - Prevents: Bot registrations, spam
- [ ] **Set up WAF** (Web Application Firewall)
  - Options:
    - Vercel Firewall (paid: $20/month)
    - [Cloudflare](https://www.cloudflare.com/) (free tier available)
  - Protects: DDoS, SQL injection, XSS
- [ ] **Security audit**
  - Run: `npm audit` and fix vulnerabilities
  - Check: OWASP Top 10 compliance
  - Test: SQL injection, XSS, CSRF
  - Tools:
    - [Snyk](https://snyk.io/) (free for open source)
    - [OWASP ZAP](https://www.zaproxy.org/)

### 14. SEO Optimization 🔍
- [ ] **Add metadata** to all pages
  - Files: Update all `page.tsx` with:
    ```typescript
    export const metadata = {
      title: 'Page Title | JobStack',
      description: 'Page description',
      openGraph: {...},
      twitter: {...}
    };
    ```
- [ ] **Create sitemap.xml**
  - File: Create `/app/sitemap.ts`
  - Include: All job listings, static pages
  - Vercel auto-generates at `/sitemap.xml`
- [ ] **Create robots.txt**
  - File: Create `/public/robots.txt`
  - Allow: All pages except `/admin`, `/dashboard`
  - Sitemap: Point to `https://jobstack.pl/sitemap.xml`
- [ ] **Add structured data (Schema.org)**
  - Type: `JobPosting` schema
  - File: Update [app/jobs/[id]/page.tsx](app/jobs/[id]/page.tsx)
  - Benefits: Rich snippets in Google Jobs
  - Example:
    ```json
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "Software Engineer",
      "description": "...",
      "datePosted": "2026-01-16",
      "hiringOrganization": {...}
    }
    ```

---

## 🟢 LOW PRIORITY - Nice to Have

### 15. Two-Factor Authentication (2FA) 🔐
- [ ] **Add 2FA support** to Supabase Auth
  - Supabase supports TOTP (Time-based OTP)
  - Libraries: [qrcode](https://www.npmjs.com/package/qrcode)
  - UI: Add to `/app/settings/security/page.tsx`
  - Optional for users

### 16. Accessibility (WCAG 2.1) ♿
- [ ] **Run accessibility audit**
  - Tools:
    - [axe DevTools](https://www.deque.com/axe/devtools/)
    - [Lighthouse](https://developers.google.com/web/tools/lighthouse)
    - [WAVE](https://wave.webaim.org/)
  - Test: Keyboard navigation, screen readers
- [ ] **Fix accessibility issues**
  - Common fixes:
    - Add alt text to images
    - Proper heading hierarchy (h1 → h2 → h3)
    - ARIA labels for icons
    - Color contrast (4.5:1 minimum)
    - Focus indicators

### 17. Performance Optimization ⚡
- [ ] **Optimize images**
  - Use Next.js `<Image>` component (already using)
  - Compress: Use [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)
  - WebP format for smaller sizes
- [ ] **Add caching**
  - Cache: API responses with Vercel Edge Caching
  - Headers: `Cache-Control: public, s-maxage=3600` (1 hour)
  - File: Update API routes with caching headers
- [ ] **Code splitting**
  - Next.js does this automatically
  - Verify: Bundle analyzer `npm run build --analyze`
  - Lazy load: Heavy components with `dynamic()`

### 18. Testing 🧪
- [ ] **Set up unit tests**
  - Framework: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/react)
  - Coverage: Utils, API routes
  - Run: `npm test`
- [ ] **Set up E2E tests**
  - Framework: [Playwright](https://playwright.dev/) or [Cypress](https://www.cypress.io/)
  - Test: User flows (register, search, apply)
  - CI: Run in GitHub Actions
- [ ] **API testing**
  - Tools: [Postman](https://www.postman.com/) collections
  - Test: All endpoints, edge cases
  - Automate: [Newman](https://www.npmjs.com/package/newman) CLI

---

## 📋 Pre-Launch Checklist (Final Verification)

Run through this checklist **before** deploying to production:

### Legal ⚖️
- [ ] All legal docs live on website (/terms, /privacy, /cookies)
- [ ] Business info (NIP, REGON, address) in footer
- [ ] Email addresses (legal@, privacy@) set up and tested
- [ ] Cookie consent banner implemented and tested
- [ ] Source attribution visible on all job listings
- [ ] Scraper User-Agent includes contact email
- [ ] robots.txt checker implemented in scrapers
- [ ] Rate limiting enabled on scrapers

### RODO/GDPR 🔐
- [ ] Privacy Policy accessible
- [ ] Data export functionality works
- [ ] Account deletion works
- [ ] Email unsubscribe links functional
- [ ] Cookie consent saved correctly
- [ ] User rights clearly documented

### Security 🛡️
- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured (not in code)
- [ ] No API keys exposed in frontend
- [ ] Rate limiting enabled on auth endpoints
- [ ] CSRF protection enabled
- [ ] XSS protection enabled
- [ ] SQL injection prevented (using Supabase)

### Functionality ✅
- [ ] User registration works
- [ ] User login works (email + Google OAuth)
- [ ] Job search works (filters, pagination)
- [ ] Job detail pages load correctly
- [ ] Source attribution displays
- [ ] Employer job posting works
- [ ] API endpoints respond correctly
- [ ] Scraper runs successfully (test with Vercel Cron)

### Performance ⚡
- [ ] Lighthouse score > 90 (all metrics)
- [ ] Images optimized and loading fast
- [ ] API response time < 500ms
- [ ] No console errors in browser
- [ ] Mobile responsive (test on real device)

### SEO 🔍
- [ ] Meta tags on all pages
- [ ] Sitemap.xml accessible
- [ ] robots.txt accessible
- [ ] Structured data on job pages
- [ ] Open Graph tags for social sharing

### Monitoring 📊
- [ ] Google Analytics 4 configured
- [ ] Error monitoring set up (Sentry/Vercel)
- [ ] Uptime monitoring configured
- [ ] Logs accessible (Vercel Dashboard)

---

## 🎯 Deployment Steps (When Ready)

1. **Merge feature branch**
   ```bash
   git checkout main
   git merge feature/legal-compliance
   git push origin main
   ```

2. **Deploy to Vercel**
   - Push to `main` branch → auto-deploys to production
   - Or manual: `vercel --prod`

3. **Verify production**
   - Test all critical flows
   - Check legal pages load
   - Verify scraper cron job runs
   - Monitor error logs for 24 hours

4. **Post-launch tasks**
   - [ ] Submit sitemap to Google Search Console
   - [ ] Set up Google Analytics goals
   - [ ] Monitor server logs
   - [ ] Test email alerts (if implemented)
   - [ ] Announce on social media

---

## 📞 Support Contacts

If you encounter issues:

- **Technical:** Check Vercel logs, Supabase logs
- **Legal:** Consult lawyer if unsure about compliance
- **RODO:** Contact PUODO if needed: kancelaria@uodo.gov.pl

---

**Last Updated:** January 16, 2026
**Review Frequency:** Weekly until launch, then monthly

**Notes:**
- This TODO list is a living document. Update as tasks are completed.
- Mark completed tasks with `[x]` in checkbox.
- Add new tasks as needed.

**Status Legend:**
- 🚨 **CRITICAL** - Blocker, must fix before production
- 🔴 **HIGH** - Important, fix within 1 week
- 🟡 **MEDIUM** - Needed, fix within 1 month
- 🟢 **LOW** - Nice to have, fix when time permits
