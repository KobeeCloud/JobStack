# JobStack - Visual Infrastructure Planning Tool

🎨 **Drag-and-drop visual editor** for designing cloud architecture
⚡ Generate **production-ready Terraform code** instantly
💰 **Real-time cost estimation** as you build

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React Flow](https://img.shields.io/badge/React_Flow-12-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

**For local development (mock mode)**, the app works out of the box! Mock Supabase client is active.

**For production with real database**, configure these variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get these values from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

### 3. Database Setup (Production Only)

If using real Supabase backend, run the schema:
```bash
# In Supabase SQL Editor, execute:
cat supabase/schema.sql
```

This creates tables: `projects`, `diagrams`, `templates`, `exports`, `shares`.

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📂 Project Structure

```
JobStack/
├── app/
│   ├── page.tsx                    # Landing page with pricing
│   ├── login/page.tsx              # Authentication - login
│   ├── register/page.tsx           # Authentication - register
│   ├── dashboard/page.tsx          # Project management dashboard
│   ├── projects/
│   │   ├── new/page.tsx            # Create new project form
│   │   └── [id]/page.tsx           # 🎨 MAIN CANVAS EDITOR (React Flow)
│   └── api/
│       ├── projects/               # CRUD for projects
│       ├── diagrams/               # Save/load diagram state
│       ├── generate/terraform/     # Terraform code generation
│       ├── estimate-cost/          # Cost calculation API
│       └── templates/              # Pre-built architecture templates
├── components/
│   ├── ui/                         # shadcn/ui components (13 components)
│   └── diagram/
│       ├── component-palette.tsx   # Draggable component sidebar
│       ├── custom-nodes.tsx        # Custom React Flow nodes
│       ├── toolbar.tsx             # Canvas controls (zoom, save, export)
│       └── cost-sidebar.tsx        # Real-time cost breakdown
├── lib/
│   ├── catalog.ts                  # 30+ infrastructure components
│   ├── generators/terraform.ts     # Terraform code generator
│   ├── cost-calculator.ts          # Cost estimation engine
│   └── supabase/
│       ├── client.ts               # Browser client (with mock fallback)
│       ├── server.ts               # Server client (with mock fallback)
│       ├── middleware.ts           # Auth middleware
│       └── mock-client.ts          # 🔧 Mock Supabase for local dev
├── hooks/
│   └── use-toast.ts                # Toast notifications (Sonner)
└── supabase/
    └── schema.sql                  # Database schema (production)
```

---

## ✨ Key Features

### 1. Visual Diagram Builder
- **30+ cloud components**: AWS Lambda, ECS, RDS, Cloud Run, GKE, Azure Functions, etc.
- **Drag-and-drop interface**: React Flow with custom nodes
- **Connection system**: Draw edges between services
- **Real-time preview**: See architecture as you build

### 2. Terraform Code Generation
- **4 files generated**: `main.tf`, `variables.tf`, `resources.tf`, `outputs.tf`
- **Multi-cloud support**: AWS, GCP, Azure, DigitalOcean
- **Best practices**: Security groups, IAM roles, networking pre-configured
- **Export formats**: JSON, downloadable files

### 3. Cost Estimation
- **Real-time calculation**: Updates as you add/remove components
- **Monthly breakdown**: By category (Compute, Database, Storage, etc.)
- **Min/Max ranges**: Accounts for scaling and usage patterns
- **Component-level details**: See cost per service

### 4. Authentication & Collaboration
- **Supabase Auth**: Email/password authentication
- **Row-Level Security**: Users can only access their own projects
- **Mock mode**: Develop without backend configuration
- **Multi-project support**: Unlimited projects (Pro plan)

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 15 | React Server Components, App Router |
| **UI Library** | React 19 | Latest React features |
| **Diagram Engine** | React Flow 12 | Drag-drop canvas, custom nodes |
| **Database** | Supabase | PostgreSQL + Auth + RLS |
| **UI Components** | shadcn/ui | 13 pre-built components |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Notifications** | Sonner | Toast notifications |
| **Icons** | Lucide React | 1000+ icons |
| **Type Safety** | TypeScript 5 | Strict mode enabled |
| **Code Generation** | Custom | Terraform generator |

---

## 🎯 Usage Guide

### Creating Your First Project

1. **Register/Login**: Visit `/register` or `/login`
2. **Dashboard**: Click "New Project" button
3. **Name Your Project**: Enter name and description
4. **Open Canvas Editor**: Click on project card

### Building Infrastructure Diagram

1. **Choose Components**: Drag from left sidebar
   - Frontend: Cloud Run, App Runner, Vercel
   - Backend: Lambda, Cloud Functions, ECS
   - Database: RDS, Cloud SQL, Cosmos DB
   - Storage: S3, Cloud Storage, Blob Storage

2. **Connect Services**: Click and drag between nodes to create edges

3. **See Costs**: Right sidebar shows real-time monthly costs

4. **Save Diagram**: Click "Save" button (stored in database)

5. **Generate Code**: Click "Generate Terraform"
   - Downloads JSON with 4 Terraform files
   - Ready to deploy with `terraform apply`

6. **Export Diagram**: Click "Export" for JSON backup

### Using Templates (Coming Soon)

Pre-built architectures for common use cases:
- 🚀 **Startup MVP**: Lambda + RDS + S3 + CloudFront
- 🛒 **E-Commerce Platform**: ECS + Redis + Aurora + SQS
- 🔬 **Microservices**: Kubernetes + Service Mesh + Kafka
- 🎮 **Gaming Backend**: WebSocket + DynamoDB + Lambda
- 📝 **Side Project**: Cloud Run + Firestore + Cloud Storage

---

## 🔧 Development

### Running Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm run start
```

---

## 📊 Current Status

### ✅ Completed Features (95%)
- ✅ Homepage with landing page, features, pricing
- ✅ Authentication (login/register with Supabase)
- ✅ Dashboard with project listing
- ✅ Project creation workflow
- ✅ Complete REST API (7 route handlers, 15+ endpoints)
- ✅ React Flow canvas editor with drag-drop
- ✅ Component palette (30+ infrastructure components)
- ✅ Custom node rendering with icons and costs
- ✅ Diagram toolbar (zoom, pan, fit, save, export)
- ✅ Real-time cost estimation sidebar
- ✅ Terraform code generation (main.tf, variables.tf, etc.)
- ✅ Cost calculation API endpoint
- ✅ Template library API endpoint
- ✅ Toast notification system (Sonner)
- ✅ Mock Supabase client for local development
- ✅ Dev server running successfully

### ⏳ Remaining Tasks (5%)
- ⏳ Fix minor TypeScript errors in 2 components (non-blocking)
- ⏳ Add image export (PNG/SVG) functionality
- ⏳ Implement auto-save feature (every 30 seconds)
- ⏳ Template browser integration (modal on project creation)
- ⏳ End-to-end testing

---

## 🚦 Known Issues

### TypeScript Warnings
- `custom-nodes.tsx`: `data.componentId` type unknown (non-blocking)
- `toolbar.tsx`: Separator orientation prop warning (cosmetic)

These don't prevent compilation or runtime execution.

### Mock Mode Limitations
When using mock Supabase client:
- No persistent data (refreshing page clears diagrams)
- No real authentication (all users get `mock-user-id`)
- Demo projects shown instead of real database queries

**Solution**: Configure real Supabase project in `.env.local` for production.

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Supabase service role key (admin) |
| `OPENAI_API_KEY` | Optional | For AI recommendations (future) |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Demo**: http://localhost:3000 (local development)
- **Documentation**: Coming soon
- **Supabase Dashboard**: https://supabase.com/dashboard
- **React Flow Docs**: https://reactflow.dev/
- **shadcn/ui**: https://ui.shadcn.com/

---

## 💡 Architecture Decisions

### Why Mock Supabase Client?
Allows developers to run the app immediately without backend setup. Production mode automatically switches to real Supabase when env vars are configured.

### Why React Flow?
Industry-standard diagram library with:
- 🎨 Custom node rendering
- 🔗 Connection validation
- 🖱️ Built-in zoom/pan controls
- 📱 Mobile-friendly (touch events)
- ♿ Accessibility support

### Why Next.js 15?
- **React Server Components**: Better performance
- **App Router**: File-based routing
- **API Routes**: Backend in same repo
- **Edge Runtime**: Fast global deployment
- **TypeScript**: First-class support

---

## 🎉 Quick Demo

```bash
# 1. Clone and install
git clone <repo-url>
cd JobStack
npm install

# 2. Start dev server (works immediately!)
npm run dev

# 3. Open browser
open http://localhost:3000

# 4. Click "Get Started" → Create project → Start building!
```

**No database setup needed for local development!** 🚀

---

Made with ❤️ for DevOps teams and cloud architects
