# JobStack - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key (for AI features)
- Upstash Redis (for rate limiting)

### Environment Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure required variables:**
   ```bash
   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # OpenAI (Required for AI features)
   OPENAI_API_KEY=sk-your-openai-api-key

   # Upstash Redis (Required for rate limiting)
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run database migrations:**
   ```bash
   # Apply migrations from supabase/migrations/
   # Use Supabase CLI or Supabase Studio
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## 🎯 New Features

### 1. AI Architecture Assistant
**Location:** Diagram Editor → AI button (⭐ Sparkles icon)

**Features:**
- Security best practices analysis
- Cost optimization recommendations
- Reliability & HA checks
- Performance optimization tips
- AI-powered insights using GPT-4

**Usage:**
1. Add components to your diagram
2. Click the "AI" button in the toolbar
3. Review recommendations by severity (Critical/Warning/Info)
4. Expand cards to see detailed remediation steps

**Requirements:**
- `OPENAI_API_KEY` in `.env.local`
- OpenAI account with API credits

### 2. Multi-Cloud Support Enhancement
**Location:** Diagram Editor → Multi-Cloud button (☁️ Cloud icon)

**Features:**
- 8 cloud-agnostic component mappings:
  - Virtual Machines (Small/Large)
  - Relational Databases (PostgreSQL)
  - Object Storage
  - Load Balancers
  - Virtual Private Cloud
  - Cache (Redis)
  - Content Delivery Network
- Cost comparison across AWS, Azure, GCP
- Best price indicator
- One-click component addition

**Usage:**
1. Click "Multi-Cloud" button
2. Filter by category (compute, database, storage, networking)
3. Compare costs across providers
4. Click "Add" to insert component into diagram

**No additional configuration required**

### 3. Compliance & Security Scanning
**Location:** Diagram Editor → Compliance button (🛡️ Shield icon)

**Features:**
- 5 compliance frameworks:
  - **CIS Benchmark**: 25+ security controls
  - **GDPR**: Data protection & privacy (Art. 25, 32)
  - **SOC 2**: Service organization controls (CC6.1, CC7.2)
  - **PCI-DSS**: Payment card security (Req 1.3, 3.4)
  - **HIPAA**: Healthcare privacy (§164.312)
- Compliance scoring (0-100%)
- Detailed findings with severity levels
- Remediation guidance
- Affected resource tracking

**Usage:**
1. Click "Compliance" button
2. Select a compliance framework (CIS, GDPR, SOC2, PCI-DSS, HIPAA)
3. Click "Run Scan"
4. Review score and findings by severity
5. Expand findings for remediation steps

**No additional configuration required**

### 4. Automated Testing & Validation
**Location:** Diagram Editor → Tests button (🧪 Flask icon)

**Features:**
- **Connectivity Tests**: Frontend-backend connectivity, database connections, load balancer routing, internet access
- **Security Tests**: Encryption validation, public access checks, IAM verification, network isolation
- **Cost Tests**: Budget limit validation, cost anomaly detection
- **Configuration Tests**: Resource naming, tagging compliance, multi-AZ checks

**Usage:**
1. Click "Tests" button
2. Click "Run All Tests"
3. View results by category (pass/fail/warning)
4. Expand test cards for detailed information

**No additional configuration required**

### 5. Infrastructure State Management
**Location:** Backend only (API ready for UI integration)

**Features:**
- Import resources from AWS, Azure, GCP
- Drift detection (added/removed/modified resources)
- Automatic cost calculation from actual cloud resources
- Resource mapping to diagram nodes

**API Endpoints:**
- `POST /api/cloud/import` - Import from cloud provider
- `POST /api/cloud/drift` - Detect drift

**Future UI Integration:**
- Cloud connection management
- One-click import
- Drift visualization
- Scheduled sync

## 🔒 Security & Legal

### Data Privacy
- All diagram data stored in your Supabase instance
- OpenAI API calls include only component metadata (no sensitive data)
- No third-party analytics or tracking (except optional Sentry)

### API Keys
- Store all API keys in `.env.local` (gitignored)
- Never commit API keys to version control
- Rotate keys regularly
- Use service accounts with minimal permissions

### Compliance
- AI features use OpenAI API (SOC 2 Type II compliant)
- Compliance scanning is rule-based (no data sent externally)
- All data processing happens server-side

### Rate Limiting
- Redis-based rate limiting protects API endpoints
- Default: 100 requests per 15 minutes per user
- Configure in `lib/rate-limit.ts`

## 📦 Production Deployment

### Environment Variables (Production)
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
OPENAI_API_KEY=sk-prod-key
UPSTASH_REDIS_REST_URL=https://prod-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=prod_token
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional
SENTRY_DSN=https://sentry.io/...
LOG_LEVEL=warn
```

### Vercel Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Self-Hosted
```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### AI Features Not Working
- **Check:** `OPENAI_API_KEY` is set in `.env.local`
- **Check:** OpenAI account has credits
- **Check:** API key has correct permissions
- **Solution:** Regenerate key at https://platform.openai.com/api-keys

### Compliance Scan Errors
- **Check:** Diagram has at least one component
- **Check:** Browser console for errors
- **Solution:** Refresh page and try again

### Tests Failing
- **Check:** Diagram structure (nodes and edges)
- **Check:** Component metadata is complete
- **Solution:** Review test results for specific failures

### Database Connection Issues
- **Check:** Supabase credentials are correct
- **Check:** RLS policies are configured
- **Solution:** Run migrations from `supabase/migrations/`

## 📚 Additional Resources

- [Feature Proposals](./FEATURE_PROPOSALS.md) - All 15 proposed features
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)

## 🤝 Support

For issues or questions:
1. Check this setup guide
2. Review error messages in browser console
3. Check Supabase logs
4. Verify environment variables
5. Open GitHub issue with details

---

**Last Updated:** February 3, 2026
**Version:** 2.0.0 (with AI, Multi-Cloud, Compliance, Testing, Cloud Sync)
