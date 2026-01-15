# Cookie Policy (Polityka Cookies)

**Last Updated: January 16, 2026**

## What Are Cookies?

Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit a website. They help websites remember your preferences and improve your experience.

**Legal Basis:** ePrivacy Directive (Cookie Law) & RODO Article 6(1)(a) (Consent)

---

## Cookies We Use

### 1. Essential Cookies (Required)

**Purpose:** Make the website work properly
**Can you disable them?** ❌ No - without these, the site won't function

| Cookie Name | Purpose | Duration | Provider |
|-------------|---------|----------|----------|
| `sb-access-token` | Authentication (keeps you logged in) | 1 hour | Supabase |
| `sb-refresh-token` | Session refresh | 7 days | Supabase |
| `auth-session` | Session management | Session | JobStack |
| `XSRF-TOKEN` | Security (prevent CSRF attacks) | Session | JobStack |

**Legal Basis:** Legitimate Interest (Article 6(1)(f) GDPR) - necessary for service

---

### 2. Functional Cookies (Optional)

**Purpose:** Remember your preferences
**Can you disable them?** ✅ Yes

| Cookie Name | Purpose | Duration | Provider |
|-------------|---------|----------|----------|
| `user-preferences` | Language, theme, filters | 1 year | JobStack |
| `search-history` | Remember recent searches | 30 days | JobStack |
| `cookie-consent` | Remember your cookie choice | 1 year | JobStack |

**Legal Basis:** Consent (Article 6(1)(a) GDPR)

**How to disable:** Use our cookie consent banner or browser settings

---

### 3. Analytics Cookies (Optional)

**Purpose:** Understand how you use the site (improve service)
**Can you disable them?** ✅ Yes

| Cookie Name | Purpose | Duration | Provider |
|-------------|---------|----------|----------|
| `_ga` | Google Analytics - User ID | 2 years | Google |
| `_ga_*` | Google Analytics - Session | 2 years | Google |
| `_gid` | Google Analytics - User ID | 24 hours | Google |

**Data Collected:**
- Pages visited
- Time spent on site
- Device type
- Location (city level, NOT precise)
- Referral source

**Privacy:**
- IP addresses are anonymized
- No personal identification
- Data shared with Google Analytics

**Google Analytics Privacy:** https://policies.google.com/privacy

**Legal Basis:** Consent (Article 6(1)(a) GDPR)

**How to disable:**
- Use our cookie consent banner
- Install Google Analytics Opt-out: https://tools.google.com/dlpage/gaoptout

---

### 4. Advertising Cookies (We DON'T Use These)

**JobStack does NOT use:**
- ❌ Advertising cookies
- ❌ Third-party tracking for ads
- ❌ Social media tracking pixels (Facebook Pixel, etc.)
- ❌ Remarketing cookies

**We do NOT sell your data to advertisers.**

---

## Third-Party Cookies

We use services that may set their own cookies:

### Supabase (Authentication)
- **Purpose:** User authentication
- **Cookies:** `sb-access-token`, `sb-refresh-token`
- **Privacy:** https://supabase.com/privacy
- **Control:** Cannot disable (essential for login)

### Google OAuth (If you use Google login)
- **Purpose:** Login with Google account
- **Cookies:** Google authentication cookies
- **Privacy:** https://policies.google.com/privacy
- **Control:** Don't use Google login (use email instead)

### Vercel (Hosting)
- **Purpose:** Performance and security
- **Cookies:** May use anonymous performance cookies
- **Privacy:** https://vercel.com/legal/privacy-policy

---

## Cookie Consent Management

### First Visit
When you first visit JobStack, you'll see a **cookie consent banner**.

**Options:**
- ✅ **Accept All** - All cookies (including analytics)
- ⚙️ **Customize** - Choose which cookies to allow
- ❌ **Reject Non-Essential** - Only essential cookies

### Change Your Mind?
You can change your cookie preferences anytime:

**Method 1:** Account Settings → Privacy → Cookie Preferences

**Method 2:** Click "Cookie Settings" in the footer

**Method 3:** Clear cookies in your browser (but this also logs you out)

---

## How to Disable Cookies

### In Your Browser

#### Chrome
1. Settings → Privacy and Security → Cookies
2. Choose "Block third-party cookies" or "Block all cookies"

#### Firefox
1. Settings → Privacy & Security
2. Choose "Strict" or "Custom" tracking protection

#### Safari
1. Preferences → Privacy
2. Check "Block all cookies"

#### Edge
1. Settings → Cookies and site permissions
2. Choose "Block third-party cookies" or "Block all cookies"

**Warning:** Blocking all cookies will prevent you from logging in.

### Browser Plugins
- **Ghostery:** https://www.ghostery.com/
- **uBlock Origin:** https://ublockorigin.com/
- **Privacy Badger:** https://privacybadger.org/

---

## Cookie Lifespan

| Type | Duration | Auto-Deletion |
|------|----------|---------------|
| Session cookies | Until browser closes | Yes |
| Persistent cookies | Days to years (see table above) | When expired |
| Authentication tokens | 1 hour (access), 7 days (refresh) | Auto-refresh |

---

## Mobile Apps (Future)

**Currently:** JobStack is web-only (no mobile app).

**If we launch mobile apps:**
- Apps use similar technologies (tokens, local storage)
- Separate privacy notice will be provided
- Subject to app store privacy requirements

---

## Do Not Track (DNT)

**Do we respect DNT signals?**

Currently: **No** - DNT is not a legal standard and is not widely supported.

**Alternative:** Use our cookie consent banner to opt-out of analytics.

---

## Data Security

Cookies are stored **securely**:
- ✅ Encrypted in transit (HTTPS)
- ✅ HttpOnly flag (prevents JavaScript access for auth cookies)
- ✅ Secure flag (only sent over HTTPS)
- ✅ SameSite attribute (CSRF protection)

**Example:**
```
Set-Cookie: auth-session=abc123;
  Secure;
  HttpOnly;
  SameSite=Strict;
  Max-Age=3600
```

---

## Children's Privacy

**Children under 16:** We do not knowingly collect data from children.

If we detect a child's account, we will delete it and its cookies.

**Parents:** You can request cookie deletion for your child at privacy@jobstack.pl

---

## RODO/GDPR Compliance

### Legal Basis for Cookies
- **Essential:** Legitimate Interest (Article 6(1)(f))
- **Functional:** Consent (Article 6(1)(a))
- **Analytics:** Consent (Article 6(1)(a))

### Your Rights
- **Right to withdraw consent** (stop cookies anytime)
- **Right to access** (see what cookies we use)
- **Right to erasure** (delete cookies)

**Exercise your rights:** privacy@jobstack.pl

### Consent Requirements
Per ePrivacy Directive & RODO:
- ✅ Consent is freely given
- ✅ Specific and informed
- ✅ Unambiguous (clear opt-in)
- ✅ Easy to withdraw
- ✅ Granular (choose cookie types)

**Pre-ticked boxes:** We do NOT use them (illegal under GDPR).

---

## Changes to This Policy

We may update this Cookie Policy. Changes are effective immediately.

**How we notify you:**
- Update "Last Updated" date
- Email notification (for material changes)
- Banner on website

**Check this page regularly for updates.**

---

## Contact Us

**Questions about cookies?**

**Email:** privacy@jobstack.pl
**Subject:** "Cookies: [Your Question]"
**Response:** Within 30 days

**Postal Address:**
JobStack / KobeeCloud
[Your business address]
Poland

---

## Technical Details (For Developers)

### Cookie Implementation
```javascript
// Essential (no consent needed)
document.cookie = "auth-session=token; Secure; HttpOnly; SameSite=Strict";

// Analytics (requires consent)
if (userConsentedToAnalytics) {
  // Load Google Analytics
  gtag('config', 'G-XXXXXXXXXX');
}
```

### Cookie Audit Log
We maintain a log of:
- Cookie types used
- Purpose
- Retention period
- Legal basis
- Third-party recipients

**Available upon request** for compliance audits.

---

## Useful Resources

- **RODO (GDPR):** https://uodo.gov.pl/
- **ePrivacy Directive:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058
- **Polish DPA (PUODO):** https://uodo.gov.pl/en
- **Google Analytics Opt-out:** https://tools.google.com/dlpage/gaoptout
- **Browser cookie guides:** https://www.aboutcookies.org/

---

**By continuing to use JobStack, you consent to our use of cookies as described in this policy.**

**Manage your preferences:** [Cookie Settings] (link in footer)

**Last Updated:** January 16, 2026
**Version:** 1.0
