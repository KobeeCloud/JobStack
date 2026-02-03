# JobStack - Cloud Infrastructure Diagramming Platform

**Visual drag-and-drop cloud infrastructure design with AI-powered recommendations, compliance scanning, automated testing, and multi-cloud support.**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Key Features

### 🎨 Visual Diagram Editor
- Drag-and-drop components from AWS, Azure, GCP, Kubernetes
- Real-time collaboration with Supabase Realtime
- Auto-save every 30 seconds
- Export to JSON, PNG, SVG, Terraform

### 🤖 AI Architecture Assistant (NEW)
- **Security Analysis**: Detect unencrypted resources, exposed databases, missing IAM roles
- **Cost Optimization**: Identify oversized instances, unused resources, savings opportunities
- **Reliability Checks**: Validate HA configuration, backup strategies, disaster recovery
- **Performance Tips**: Database connection pooling, CDN usage, caching recommendations
- **Powered by GPT-4 Turbo** for intelligent insights

### ☁️ Multi-Cloud Support (ENHANCED)
- **Cloud-Agnostic Components**: Compare AWS vs Azure vs GCP side-by-side
- **Cost Comparison**: See pricing differences across providers
- **One-Click Conversion**: Switch diagrams between cloud providers
- **8 Pre-Mapped Components**: VMs, Databases, Storage, Load Balancers, VPCs, Cache, CDN

### 🛡️ Compliance & Security Scanning (NEW)
- **CIS Benchmark**: 25+ security controls for cloud infrastructure
- **GDPR**: Data protection and privacy compliance (Articles 25, 32)
- **SOC 2**: Service Organization Control audit readiness
- **PCI-DSS**: Payment card security requirements
- **HIPAA**: Healthcare data privacy regulations
- **Automated Scoring**: 0-100% compliance with detailed findings

### 🧪 Infrastructure Testing (NEW)
- **Connectivity Tests**: Validate network paths, database connections, internet access
- **Security Validation**: Check encryption, IAM roles, network isolation
- **Cost Limits**: Ensure infrastructure stays within budget
- **Configuration Checks**: Verify naming conventions, tagging, multi-AZ setup
- **Pass/Fail/Warning Reports** with remediation guidance

### 💰 Real-Time Cost Estimation
- Component-level cost breakdown
- Monthly total with markup calculations
- Cost warnings for expensive resources
- Export cost reports

### 🔄 Cloud Resource Import (API Ready)
- Import existing AWS, Azure, GCP resources
- Detect drift between diagram and actual cloud state
- Automatic diagram generation from cloud inventory
- Scheduled sync capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- OpenAI API key (for AI features)
- Upstash Redis (for rate limiting)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/KobeeCloud/JobStack.git
cd JobStack

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run database migrations
# Use Supabase Studio or CLI

# 5. Start development server
npm run dev
```

Visit `http://localhost:3000` and start building!

📖 **Detailed Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🎯 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0
- **UI Library**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Diagram Engine**: React Flow
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: OpenAI GPT-4 Turbo
- **Rate Limiting**: Upstash Redis
- **Deployment**: Vercel

## 📂 Project Structure

```
JobStack/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   └── projects/[id]/     # Diagram editor
├── components/            # React components
│   ├── ai/               # AI Assistant UI
│   ├── compliance/       # Compliance scanning UI
│   ├── diagram/          # Diagram editor components
│   ├── multi-cloud/      # Multi-cloud comparison UI
│   └── testing/          # Testing results UI
├── lib/                   # Business logic
│   ├── ai/               # AI analysis & OpenAI client
│   ├── compliance/       # Compliance scanners
│   ├── multi-cloud/      # Cloud-agnostic mappings
│   ├── testing/          # Infrastructure testing
│   ├── cloud-sync/       # Cloud import & drift detection
│   ├── catalog.ts        # Component definitions
│   └── cost-calculator.ts # Cost estimation
├── supabase/             # Database migrations & RLS
└── public/               # Static assets
```

## 🔐 Security & Privacy

- **Data Storage**: All data stored in your Supabase instance
- **API Keys**: Stored securely in environment variables
- **OpenAI Usage**: Only component metadata sent (no sensitive data)
- **Rate Limiting**: Redis-based protection (100 req/15min)
- **RLS Policies**: Row-level security on all database tables
- **GDPR Compliant**: No third-party tracking or analytics

## 📊 Feature Comparison

| Feature | Free Tier | Pro (Planned) | Enterprise (Planned) |
|---------|-----------|---------------|----------------------|
| Diagram Editor | ✅ | ✅ | ✅ |
| Real-time Collaboration | ✅ (5 users) | ✅ (25 users) | ✅ (Unlimited) |
| AI Assistant | ✅ (10 analyses/day) | ✅ (100/day) | ✅ (Unlimited) |
| Compliance Scanning | ✅ (All frameworks) | ✅ | ✅ |
| Infrastructure Testing | ✅ | ✅ | ✅ |
| Multi-Cloud Support | ✅ | ✅ | ✅ |
| Cloud Import | ❌ | ✅ | ✅ |
| Terraform Export | ✅ (Basic) | ✅ (Advanced) | ✅ (Custom modules) |
| Priority Support | ❌ | ✅ | ✅ (Dedicated) |

## 🛠️ Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting & Formatting
```bash
npm run lint
npm run format
```

## 📝 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Complete installation & configuration
- [Feature Proposals](./FEATURE_PROPOSALS.md) - All 15 feature ideas
- [API Documentation](./docs/API.md) - Coming soon
- [Contributing Guide](./CONTRIBUTING.md) - Coming soon

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) - Diagram engine
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Supabase](https://supabase.com/) - Backend infrastructure
- [OpenAI](https://openai.com/) - AI-powered features
- [Vercel](https://vercel.com/) - Hosting platform

## 📧 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/KobeeCloud/JobStack/issues)
- **Email**: support@jobstack.dev
- **Discord**: [Join our community](https://discord.gg/jobstack) (coming soon)

---

**Made with ❤️ by the JobStack Team**

**Last Updated:** February 3, 2026 | **Version:** 2.0.0
