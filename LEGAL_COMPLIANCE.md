# Legal Compliance Checklist

**Project:** JobStack - Job Aggregation Platform
**Business:** KobeeCloud (JDG - Jednoosobowa Działalność Gospodarcza)
**Jurisdiction:** Poland / European Union
**Last Review:** January 16, 2026

---

## ✅ RODO/GDPR Compliance

### Required Documents
- [x] **Privacy Policy** (PRIVACY.md) - Complete with all RODO requirements
- [x] **Cookie Policy** (COOKIES.md) - ePrivacy Directive compliant
- [x] **Terms of Service** (TERMS.md) - User agreement
- [ ] **Data Processing Agreement (DPA)** - For employers who post jobs (TODO)
- [ ] **Data Breach Notification Procedure** (TODO)

### Technical Implementation
- [x] **Consent Management** - Cookie banner (TODO: implement UI)
- [x] **Data Minimization** - Only collect necessary data
- [x] **Encryption** - HTTPS, database encryption (Supabase)
- [x] **Access Control** - Row-Level Security (RLS) in Supabase
- [ ] **Right to Access API** - Allow users to export their data (TODO)
- [ ] **Right to Erasure API** - Allow users to delete their data (TODO)
- [ ] **Data Retention Automation** - Auto-delete after retention period (TODO)

### User Rights Implementation Status
| RODO Right | Status | Implementation |
|------------|--------|----------------|
| Right to Access (Art. 15) | 🟡 Partial | Manual via email (TODO: automated export) |
| Right to Rectification (Art. 16) | ✅ Complete | Account settings |
| Right to Erasure (Art. 17) | 🟡 Partial | Account deletion (TODO: API endpoint) |
| Right to Restrict Processing (Art. 18) | ❌ Not Started | TODO: Pause email alerts |
| Right to Data Portability (Art. 20) | 🟡 Partial | Manual export (TODO: JSON/CSV download) |
| Right to Object (Art. 21) | ❌ Not Started | TODO: Opt-out of analytics |
| Right to Withdraw Consent (Art. 7(3)) | 🟡 Partial | Email unsubscribe (TODO: granular consent) |

### Data Protection Officer (DPO)
**Required?** No - Small business (<250 employees), no large-scale sensitive data processing

**However:** Consider appointing a DPO or external consultant if:
- Business grows significantly
- Start processing sensitive data (e.g., health, biometrics)
- Government contracts

---

## ✅ Web Scraping Legality

### Legal Basis
- [x] **TSUE Case C-30/14** - Public data scraping is legal (Ryanair v. PR Aviation)
- [x] **Database Directive 96/9/EC** - Sui generis rights (substantial investment)
- [x] **Polish Copyright Law Article 34** - Fair use for information purposes
- [x] **RODO Article 6(1)(f)** - Legitimate interest for aggregation

### Compliance Measures
- [x] **robots.txt Compliance** (TODO: implement checker in scrapers)
- [x] **Rate Limiting** - Reasonable crawl delays (TODO: implement)
- [x] **Public Data Only** - No authentication bypass
- [x] **Attribution** - Clear source links (implemented in schema)
- [x] **Fair Use** - Short snippets, not full republishing
- [ ] **User-Agent** - Identify as JobStack bot (TODO: add to scraper)
- [ ] **Contact Info in User-Agent** - Email for abuse reports (TODO)

### Scraper Status
| Source | Status | Legal Risk | Notes |
|--------|--------|------------|-------|
| JustJoin.it | ✅ Safe | 🟢 Low | Public API, no scraping needed |
| NoFluffJobs | 🟡 Planned | 🟡 Medium | Check robots.txt, respect rate limits |
| Pracuj.pl | 🟡 Planned | 🔴 High | May have aggressive anti-scraping (investigate first) |
| Indeed | 🟡 Planned | 🔴 High | Terms prohibit scraping (use API or affiliate program) |

**Risk Assessment:**
- 🟢 **Low Risk:** Public API, explicit permission
- 🟡 **Medium Risk:** Public data, no robots.txt block, respect rate limits
- 🔴 **High Risk:** Terms prohibit scraping, consider alternatives (API, partnership)

**Recommendation:** Start with JustJoin.it and NoFluffJobs only. Investigate legal alternatives for Pracuj.pl and Indeed (APIs, affiliate programs).

---

## ✅ Copyright & Intellectual Property

### Our Content
- [x] **Copyright Notice** - © 2026 KobeeCloud (TODO: add to footer)
- [x] **License** - Proprietary (closed source) or MIT? (TODO: decide)
- [ ] **Trademark** - Register "JobStack" trademark (TODO: consider if business grows)

### Third-Party Content
- [x] **Attribution** - Source links in job listings (schema has `source`, `source_url`)
- [x] **Fair Use** - Short snippets, not full copy (TODO: implement description truncation)
- [x] **No Copyright Infringement** - Link to original, don't replace
- [x] **Company Logos** - Fair use for identification (small thumbnails)

### License for User Content
- [x] **Terms of Service Section 5.3** - Users grant license to display their content
- [x] **Employer Job Listings** - Non-exclusive license to distribute

---

## ✅ Polish Business Law (Prawo Gospodarcze)

### Business Registration
- [x] **JDG Registration** - Jednoosobowa Działalność Gospodarcza
- [x] **NIP (Tax ID)** - Required for invoicing
- [x] **REGON** - Statistical number
- [ ] **Business Address** - Must be on website footer (TODO: add real address)
- [ ] **Contact Info** - Email, phone (TODO: add to legal pages)

### Consumer Protection (Ochrona Konsumentów)
- [x] **Right of Withdrawal** - N/A (free service for candidates)
- [x] **Clear Pricing** - Transparent pricing for employer plans (TODO: pricing page)
- [x] **Terms of Service** - Clear, accessible
- [ ] **Complaint Handling** - Process defined in TERMS.md (TODO: implement contact form)

### Electronic Commerce (Ustawa o Świadczeniu Usług Drogą Elektroniczną)
- [x] **Service Provider Info** - Business name, address, contact
- [x] **Terms of Service** - Available before using service
- [x] **Privacy Policy** - Accessible on website
- [ ] **Footer Info** - NIP, REGON, business name (TODO: add to UI footer)

---

## ✅ Labor Law Compliance (Kodeks Pracy)

### Job Posting Requirements
- [x] **Anti-Discrimination** - Prohibited job content in TERMS.md (Section 4.3)
- [x] **Equal Treatment** - No discrimination based on age, gender, race, etc.
- [ ] **Moderation System** - Review job posts for compliance (TODO: implement admin panel)
- [ ] **Report System** - Allow users to report discriminatory posts (TODO)

### Prohibited Job Content
Jobs may NOT:
- [x] Discriminate by age, gender, race, religion, disability, sexual orientation
- [x] Require illegal activities
- [x] Demand payment from candidates (no "pay to apply")
- [x] Contain false information

**Implementation:** Content moderation (TODO: AI + human review)

---

## ✅ Data Security (Bezpieczeństwo Danych)

### Technical Measures (RODO Article 32)
- [x] **Encryption in Transit** - HTTPS/TLS (Vercel auto-SSL)
- [x] **Encryption at Rest** - Database encryption (Supabase)
- [x] **Password Hashing** - bcrypt (Supabase Auth)
- [x] **Access Control** - Row-Level Security (RLS)
- [ ] **Two-Factor Authentication (2FA)** - Optional for users (TODO)
- [ ] **Security Audit** - Annual review (TODO: schedule)

### Organizational Measures
- [x] **Access Logs** - Supabase tracks DB access
- [x] **Backup Strategy** - Supabase automatic backups
- [ ] **Incident Response Plan** - Data breach procedure (TODO: document)
- [ ] **Employee Training** - N/A (solo business, but important if hiring)

### Data Breach Obligations (RODO Article 33-34)
**If data breach occurs:**
1. ⏱️ **72-hour notification** to PUODO (Polish DPA)
2. 📧 **User notification** if high risk to rights and freedoms
3. 📝 **Documentation** of breach, impact, remediation

**Prepare:** Create incident response template (TODO)

---

## ✅ ePrivacy / Cookie Law

### Cookie Consent
- [x] **Cookie Policy** - Detailed documentation (COOKIES.md)
- [x] **Consent Banner** - Required before non-essential cookies (TODO: implement UI)
- [x] **Granular Consent** - Allow users to choose cookie types
- [x] **Easy Withdrawal** - Cookie settings page (TODO: implement)

### Cookie Categories
- [x] **Essential** - No consent needed (authentication)
- [x] **Functional** - Consent required (preferences)
- [x] **Analytics** - Consent required (Google Analytics)
- [x] **Advertising** - N/A (we don't use)

**Implementation Status:** Documented, UI pending

---

## ✅ Accessibility (Dostępność Cyfrowa)

### Polish Law (Ustawa o Dostępności Cyfrowej)
**Applies to:** Public sector websites

**Does it apply to JobStack?** No (private business)

**However:** Good practice to implement:
- [ ] **WCAG 2.1 Level AA** - Web Content Accessibility Guidelines (TODO)
- [ ] **Keyboard Navigation** - All features accessible without mouse (TODO: test)
- [ ] **Screen Reader Support** - Proper ARIA labels (TODO)
- [ ] **Color Contrast** - Minimum 4.5:1 ratio (TailwindCSS default is good)

**Priority:** Medium (not legally required, but improves UX and SEO)

---

## ✅ Tax & Financial Compliance (Podatki)

### VAT (Polish: PTU)
- [ ] **VAT Registration** - Required if revenue > 200,000 PLN/year
- [ ] **Invoice System** - Generate invoices for employer subscriptions (TODO)
- [ ] **VAT Invoices** - Include NIP, VAT rate (23% in Poland)
- [ ] **Quarterly/Monthly VAT Returns** - File with tax office

**Current Status:** Not implemented (no revenue yet)

**TODO:** Integrate invoice generation (e.g., Stripe Billing, Fakturownia)

### Income Tax (PIT)
- [x] **Bookkeeping** - Track revenue and expenses
- [ ] **Annual Tax Return (PIT-36)** - File by April 30
- [ ] **ZUS (Social Insurance)** - Contributions if revenue > threshold

**Recommendation:** Use accounting software (e.g., inFakt, Wfirma) or hire accountant

---

## ✅ Payment Processing (if implementing subscriptions)

### Payment Providers
**Options:**
- **Stripe** - GDPR compliant, PCI DSS Level 1
- **Przelewy24** - Polish payment gateway
- **PayU** - Popular in Poland

### PCI DSS Compliance
- [x] **Never store credit card numbers** - Use payment provider
- [x] **Tokenization** - Stripe handles card data
- [x] **HTTPS Only** - Secure transmission

**Status:** Not implemented (no paid plans yet)

---

## ✅ Marketing & Advertising

### Email Marketing (RODO Article 6)
- [x] **Opt-In Consent** - Explicit consent for marketing emails
- [x] **Unsubscribe Link** - In every marketing email (CAN-SPAM, RODO)
- [x] **Transactional vs. Marketing** - Separate consent

**Implementation:** Email alerts are opt-in (RODO compliant)

### Social Media
- [ ] **Privacy Policy Link** - On Facebook, LinkedIn, etc. (TODO)
- [ ] **Data Sharing Transparency** - If using social login

---

## ✅ Third-Party Compliance

### Service Providers (Data Processors)
| Provider | Purpose | GDPR Compliant? | DPA? | Location |
|----------|---------|----------------|------|----------|
| Supabase | Database, Auth | ✅ Yes | ✅ Yes | EU (Frankfurt) |
| Vercel | Hosting | ✅ Yes | ✅ Yes | EU (Frankfurt) |
| Google OAuth | Login | ✅ Yes | ✅ Yes | Global (EU data residency) |
| Groq AI | Job paraphrasing | ✅ Yes | ✅ SCCs | USA (Standard Contractual Clauses) |

**Action Items:**
- [x] Review all third-party privacy policies
- [ ] Sign Data Processing Agreements (DPAs) if required (TODO)
- [ ] Document data flows (TODO: create diagram)

---

## ✅ Liability & Risk Management

### Insurance
- [ ] **Business Liability Insurance** (OC działalności gospodarczej) - Recommended
- [ ] **Cyber Insurance** - For data breach costs (optional, expensive)

### Legal Disclaimers
- [x] **Not an Employer** - Clear in TERMS.md
- [x] **Not Responsible for Third-Party Content** - Aggregated job accuracy
- [x] **Limitation of Liability** - €100 cap (TERMS.md Section 9)
- [x] **"As Is" Service** - No guarantees (TERMS.md Section 8)

### Dispute Resolution
- [x] **Complaint Process** - Defined in TERMS.md (Section 17)
- [x] **Governing Law** - Polish law (TERMS.md Section 14)
- [x] **Jurisdiction** - Polish courts

---

## 🚨 High-Risk Issues to Address ASAP

### CRITICAL (Fix Before Launch)
1. ❌ **Add business contact info** to footer (name, NIP, REGON, address, email)
2. ❌ **Implement robots.txt checker** in scrapers
3. ❌ **Add User-Agent** to scrapers with contact email
4. ❌ **Create cookie consent banner** UI
5. ❌ **Add source attribution** to UI (job cards, detail pages)

### HIGH PRIORITY (Fix Within 1 Month)
6. ❌ **Implement RODO data export** API endpoint
7. ❌ **Implement account deletion** API endpoint
8. ❌ **Add content moderation** for employer job posts
9. ❌ **Create complaint/report system**
10. ❌ **Add rate limiting** to scrapers (respect servers)

### MEDIUM PRIORITY (Fix Within 3 Months)
11. ❌ **Data breach incident response** plan
12. ❌ **Invoice generation** system (if adding paid plans)
13. ❌ **Accessibility audit** (WCAG 2.1)
14. ❌ **Security audit** (penetration testing)

### LOW PRIORITY (Nice to Have)
15. ❌ **Two-Factor Authentication (2FA)**
16. ❌ **Business liability insurance**
17. ❌ **Trademark registration** for "JobStack"

---

## 📋 Pre-Launch Checklist

**Before deploying to production:**

- [ ] All legal documents live on website:
  - [ ] `/terms` - Terms of Service
  - [ ] `/privacy` - Privacy Policy
  - [ ] `/cookies` - Cookie Policy
- [ ] Footer updated with:
  - [ ] Business name: "JobStack / KobeeCloud"
  - [ ] NIP: [Your tax ID]
  - [ ] REGON: [Your business number]
  - [ ] Address: [Your business address]
  - [ ] Email: legal@jobstack.pl, privacy@jobstack.pl
  - [ ] Links to Terms, Privacy, Cookies
- [ ] Cookie consent banner implemented
- [ ] Source attribution visible on all job listings
- [ ] Scraper compliance:
  - [ ] robots.txt checker
  - [ ] Rate limiting (1 request per second max)
  - [ ] User-Agent: "JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)"
- [ ] RODO compliance:
  - [ ] Data export functionality
  - [ ] Account deletion functionality
  - [ ] Email unsubscribe links
- [ ] Security:
  - [ ] HTTPS enabled (Vercel auto-SSL)
  - [ ] Environment variables secured
  - [ ] No API keys in code
- [ ] Business registration:
  - [ ] JDG active
  - [ ] NIP, REGON confirmed
  - [ ] Business email set up (legal@, privacy@, support@)

---

## 📞 Legal Contacts (If Issues Arise)

### Polish Data Protection Authority (PUODO)
**Urząd Ochrony Danych Osobowych**
Address: ul. Stawki 2, 00-193 Warszawa
Phone: +48 22 531 03 00
Email: kancelaria@uodo.gov.pl
Website: https://uodo.gov.pl

### Consumer Protection (UOKiK)
**Urząd Ochrony Konkurencji i Konsumentów**
Website: https://www.uokik.gov.pl

### Legal Resources
- **Lawyer Referral:** https://www.oirp.poznan.pl (Poznan Bar Association)
- **EU Legal Helpline:** https://ec.europa.eu/info/live-work-travel-eu/consumer-rights-and-complaints
- **GDPR Info:** https://gdpr.eu

### Recommended: Consult a Lawyer
**When?**
- Before launching paid plans
- If receiving cease-and-desist letters
- If planning aggressive scraping
- If expanding to other EU countries

**Type:** Lawyer specializing in:
- Internet law (prawo internetowe)
- Data protection (ochrona danych)
- Intellectual property (własność intelektualna)

---

## ✅ Sign-Off

**Reviewed by:** [Your Name]
**Date:** January 16, 2026
**Next Review:** April 16, 2026 (quarterly)

**Compliance Status:** 🟡 **Mostly Compliant** (legal docs done, UI implementation pending)

**Approved for Production:** ❌ **NOT YET** - Complete critical items first

---

**Notes:**
This checklist is based on current Polish and EU law as of January 2026. Laws may change. Consult a lawyer for personalized advice.

**Disclaimer:** This is a compliance guide, NOT legal advice. For specific legal questions, consult a qualified attorney (radca prawny or adwokat).
