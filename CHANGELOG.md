# Changelog

All notable changes to JobStack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-03

### 🎉 Major Features Added

#### AI Architecture Assistant
- **Security Analysis**: Detect unencrypted databases, public access, missing IAM roles
- **Cost Optimization**: Identify oversized instances, unused resources, savings opportunities
- **Reliability Checks**: Validate HA configuration, backup strategies, disaster recovery
- **Performance Recommendations**: Connection pooling, CDN usage, caching strategies
- **GPT-4 Powered**: Intelligent insights and context-aware recommendations
- **UI Integration**: Expandable cards with severity grouping (Critical/Warning/Info)

#### Multi-Cloud Support Enhancement
- **Cloud-Agnostic Components**: 8 pre-mapped components (VMs, DBs, Storage, LB, VPC, Cache, CDN)
- **Cost Comparison**: Side-by-side pricing for AWS, Azure, GCP
- **Best Price Indicator**: Automatic cheapest provider highlighting
- **One-Click Addition**: Add components directly to diagrams
- **Provider Conversion**: Convert diagrams between cloud providers

#### Compliance & Security Scanning
- **CIS Benchmark**: 25+ security controls for cloud infrastructure
- **GDPR Compliance**: Data protection checks (Articles 25, 32)
- **SOC 2 Ready**: Service Organization Control audit validation
- **PCI-DSS**: Payment card security requirements (Req 1.3, 3.4)
- **HIPAA**: Healthcare data privacy (§164.312)
- **Scoring System**: 0-100% compliance with detailed findings
- **Remediation Guidance**: Step-by-step fix instructions

#### Infrastructure Testing & Validation
- **Connectivity Tests**: Frontend-backend paths, database connections, internet access
- **Security Validation**: Encryption checks, IAM roles, network isolation
- **Cost Limits**: Budget validation and anomaly detection
- **Configuration Checks**: Naming conventions, tagging compliance, multi-AZ setup
- **Test Reports**: Pass/Fail/Warning status with detailed results

#### Cloud State Management (API)
- **Resource Import**: Import from AWS, Azure, GCP (simulated)
- **Drift Detection**: Compare diagram vs actual cloud state
- **Automatic Mapping**: Cloud resources → diagram nodes
- **Cost Calculation**: Real-time cost from actual resources
- **API Endpoints**: `/api/cloud/import`, `/api/cloud/drift`

### 🎨 UI/UX Improvements
- **New Toolbar Buttons**: AI (⭐), Compliance (🛡️), Testing (🧪), Multi-Cloud (☁️)
- **Floating Panels**: Resizable, closeable panels for each feature
- **Loading States**: Animated pulse effects during analysis
- **Badge Indicators**: Severity badges, best price tags
- **Expandable Cards**: Click to reveal detailed information

### 📚 Documentation
- **SETUP_GUIDE.md**: Complete installation and configuration guide
- **DEPLOYMENT.md**: Production deployment checklist
- **README.md**: Enhanced with new features, tech stack, and quick start
- **FEATURE_PROPOSALS.md**: All 15 feature proposals documented

### 🔧 Technical Improvements
- **TypeScript**: All new features fully typed
- **Error Handling**: Comprehensive try-catch blocks with user-friendly toasts
- **API Rate Limiting**: Redis-based protection for AI endpoints
- **Modular Architecture**: Separate libs for ai/, compliance/, testing/, multi-cloud/
- **Type Safety**: Proper Node.data type handling with String() assertions

### 📦 Dependencies Added
- `openai@^6.17.0` - OpenAI GPT-4 API client
- `date-fns@^4.1.0` - Date utility library
- `@radix-ui/react-scroll-area` - Scrollable containers
- `@radix-ui/react-progress` - Progress bars

### 🐛 Bug Fixes
- Fixed TypeScript compilation errors with dynamic Node.data types
- Fixed prop name inconsistencies in UI components
- Fixed build issues with proper type assertions

### 🔐 Security
- OpenAI API key required (user-provided, not stored)
- Environment variables properly documented in `.env.example`
- Rate limiting on AI endpoints (100 req/15min)
- No sensitive data sent to OpenAI (only component metadata)

### ⚡ Performance
- Async AI analysis with loading states
- Cached component lookups
- Optimized React Flow rendering
- Debounced auto-save (30 seconds)

### 📊 Analytics & Monitoring
- Sentry integration maintained
- Console logging for AI API calls
- Error boundaries around new features
- Health check endpoint at `/api/health`

---

## [1.0.0] - 2026-01-15

### Initial Release
- Drag-and-drop diagram editor
- AWS, Azure, GCP, Kubernetes components
- Real-time collaboration via Supabase
- Terraform code generation
- Cost estimation calculator
- Export to JSON, PNG, SVG
- User authentication with Supabase Auth
- Organization management
- Project templates
- Component palette with search/filter
- Auto-save functionality
- Keyboard shortcuts
- Mini-map navigation

---

## Planned Features (v2.1.0+)

- Database migrations for cloud_connections table
- Production cloud import (AWS SDK, Azure SDK, GCP SDK)
- Drift visualization with diff view
- Scheduled sync for cloud resources
- AI-powered diagram generation from text descriptions
- Custom compliance frameworks
- Infrastructure test scheduling
- Cost forecasting with historical trends
- Advanced Terraform modules
- Team collaboration features
- Diagram version history
- Custom component library
- API documentation
- VS Code extension
- CLI tool for automation

---

**Repository**: https://github.com/KobeeCloud/JobStack
**License**: Proprietary (UNLICENSED)
**Author**: KobeCloud / Jakub Pośpieszny
