# JobStack 🚀

> Find your perfect job in one place. Aggregate thousands of opportunities from all major Polish job boards.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KobeeCloud/JobStack)

## ✨ Features

### For Job Seekers
- 🔍 **Unified Search** - Search across JustJoin.it, NoFluffJobs, Pracuj.pl, Indeed in one place
- ⚡ **Real-time Updates** - New jobs synced every 2 hours
- 🎯 **Smart Filtering** - Filter by tech stack, location, salary, remote work
- 💾 **Save Jobs** - Bookmark interesting positions
- 📧 **Email Alerts** - Get notified about new opportunities
- 📊 **AI Matching** - Personalized job recommendations (coming soon)

### For Employers
- 👔 **Easy Posting** - Post jobs via dashboard or API
- 🤖 **API Integration** - Automate job posting from your ATS
- 📈 **Analytics** - Track views, clicks, and applications
- ⭐ **Featured Listings** - Stand out with premium placements
- 🎨 **Company Branding** - Custom logos and profiles

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui |
| **Backend** | Next.js API Routes, Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email + OAuth) |
| **Scrapers** | Vercel Cron, Node.js |
| **Search** | PostgreSQL Full-Text Search |
| **AI** | Groq (Llama 3 70B) - Optional |
| **Deployment** | Vercel (Frontend + API + Cron) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Cache** | Upstash Redis (Optional) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/KobeeCloud/JobStack.git
cd JobStack
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
- Create a new project at [supabase.com](https://supabase.com)
- Run the SQL from `supabase/schema.sql` in SQL Editor
- Copy your project URL and keys

4. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=any-random-string
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

6. **Seed jobs (optional)**
```bash
# In development mode, visit:
http://localhost:3000/api/scrape/justjoinit
```

## 📚 Documentation

- [API Documentation](./API.md) - Complete API reference
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to production
- [Supabase Setup](./supabase/README.md) - Database configuration

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│         Next.js 15 Frontend             │
│  ┌──────────┬──────────┬──────────┐    │
│  │ Landing  │ /jobs    │Dashboard │    │
│  └──────────┴──────────┴──────────┘    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         API Routes (Next.js)            │
│  ┌──────────┬──────────┬──────────┐    │
│  │ /api/jobs│/api/auth │/employer │    │
│  └──────────┴──────────┴──────────┘    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Supabase PostgreSQL + Auth        │
│  - Jobs, Companies, Users               │
│  - Row Level Security                   │
│  - Full-text Search                     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Vercel Cron Jobs                 │
│  ┌────────────────────────────┐        │
│  │ Scrapers (every 2h)        │        │
│  │ ├─ JustJoin.it             │        │
│  │ ├─ NoFluffJobs (soon)      │        │
│  │ └─ Pracuj.pl (soon)        │        │
│  └────────────────────────────┘        │
└─────────────────────────────────────────┘
```

## 📊 Current Status

### ✅ Completed
- [x] Next.js 15 + TypeScript setup
- [x] TailwindCSS + shadcn/ui components
- [x] Landing page with features showcase
- [x] Supabase configuration & schema
- [x] API endpoints (GET /api/jobs, filters, pagination)
- [x] JustJoin.it scraper integration
- [x] /jobs search page with filters
- [x] Job detail pages
- [x] Authentication (email + OAuth)
- [x] User dashboard (candidates & employers)
- [x] Employer API (POST /api/employer/jobs)
- [x] API documentation
- [x] Deployment guides

### 🚧 In Progress
- [ ] NoFluffJobs scraper
- [ ] Saved jobs functionality
- [ ] Application tracking
- [ ] Email alerts (Resend integration)

### 📅 Planned
- [ ] Company profiles & branding
- [ ] AI job description paraphrasing
- [ ] Advanced analytics dashboard
- [ ] Mobile app (PWA)
- [ ] Salary insights
- [ ] Interview preparation tools

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © 2026 KobeeCloud

## 🙏 Acknowledgments

- [JustJoin.it](https://justjoin.it) - Job data source
- [NoFluffJobs](https://nofluffjobs.com) - Job data source
- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting & deployment
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

**Built with ❤️ by [KobeeCloud](https://github.com/KobeeCloud)**

[Report Bug](https://github.com/KobeeCloud/JobStack/issues) · [Request Feature](https://github.com/KobeeCloud/JobStack/issues) · [Documentation](./API.md)
