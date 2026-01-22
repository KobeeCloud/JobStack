# Vercel Deployment Guide - JobStack

## 🚀 Deployment Status

**Current:** Mock mode (działa bez bazy danych)
**Production:** Potrzebujesz Supabase dla prawdziwej persystencji

---

## Option 1: Deploy w Mock Mode (Najszybsze - 2 minuty)

### ✅ Gotowe do użycia TERAZ!

Aplikacja zadziała **od razu** bez żadnych env variables. Mock Supabase client udaje prawdziwą bazę:

- ✅ Strona główna działa
- ✅ Login/Register działa (fake user)
- ✅ Dashboard działa (pokazuje demo projekty)
- ✅ Canvas editor działa (można rysować!)
- ✅ Terraform generation działa
- ✅ Cost calculator działa
- ⚠️ **BEZ PERSYSTENCJI** - refresh strony = utracone dane

### Vercel Settings (Mock Mode):
```
NIE TRZEBA DODAWAĆ ŻADNYCH ENV VARS!
```

Aplikacja automatycznie wykryje brak konfiguracji i użyje mocka.

**Vercel Dashboard → Your Project → Settings → Environment Variables:**
- **Leave empty** = Mock mode enabled ✅

---

## Option 2: Deploy z Prawdziwą Bazą Danych (Rekomendowane - 15 minut)

### Krok 1: Stwórz Supabase Project

1. Idź na https://supabase.com/dashboard
2. Kliknij **New Project**
3. Wybierz nazwę: `jobstack-prod`
4. Wybierz region: **Europe (Frankfurt)** lub najbliższy
5. Ustaw hasło bazy danych (zapisz je!)
6. Kliknij **Create new project**
7. Czekaj 2-3 minuty na deployment

### Krok 2: Uruchom SQL Schema

1. W Supabase Dashboard → **SQL Editor**
2. Kliknij **New Query**
3. Wklej zawartość z: `/supabase/schema.sql` (wszystko!)
4. Kliknij **Run** (zielony przycisk)
5. Powinno pokazać: `Success. No rows returned`

**Schema tworzy:**
- ✅ Tabela `projects` - projekty użytkowników
- ✅ Tabela `diagrams` - diagramy z nodes/edges
- ✅ Tabela `templates` - gotowe architektury
- ✅ Tabela `exports` - wygenerowany kod
- ✅ Tabela `shares` - współdzielenie projektów
- ✅ RLS Policies - bezpieczeństwo

### Krok 3: Pobierz API Keys

1. W Supabase Dashboard → **Settings** → **API**
2. Znajdź sekcję **Project URL**:
   ```
   Przykład: https://abc123xyz.supabase.co
   ```
3. Znajdź **Project API keys**:
   - `anon` `public` - ten użyj jako `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` - ten użyj jako `SUPABASE_SERVICE_ROLE_KEY`

### Krok 4: Dodaj Environment Variables w Vercel

**Vercel Dashboard → Your Project → Settings → Environment Variables**

Dodaj 3 zmienne:

#### 1. NEXT_PUBLIC_SUPABASE_URL
```
Value: https://abc123xyz.supabase.co
Environment: Production, Preview, Development
```
*(Twój project URL z Supabase)*

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```
*(Twój anon public key z Supabase)*

#### 3. SUPABASE_SERVICE_ROLE_KEY
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```
*(Twój service_role secret key z Supabase)*

**⚠️ WAŻNE:** Service role key jest **SECRET** - nigdy nie commituj go do Git!

### Krok 5: Redeploy Application

1. W Vercel Dashboard → **Deployments**
2. Kliknij menu (3 kropki) na ostatnim deployment
3. Wybierz **Redeploy**
4. Poczekaj 2-3 minuty
5. Aplikacja teraz używa prawdziwej bazy! ✅

---

## 🔍 Jak Sprawdzić Który Tryb Jest Aktywny?

### Mock Mode:
- Konsola przeglądarki pokazuje: `⚠️ Using mock Supabase client`
- Dashboard zawsze pokazuje "Demo Project"
- Po refresh strony dane znikają

### Production Mode:
- Brak warningu w konsoli
- Dashboard pokazuje puste projekty dla nowych userów
- Dane są zapisywane w bazie i przetrwają refresh

---

## 📝 Environment Variables - Pełna Lista

| Variable | Required | Where Used | Description |
|----------|----------|------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Browser + Server | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Browser + Server | Public API key (bezpieczny) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Server only | Admin API key (SECRET!) |
| `OPENAI_API_KEY` | Optional | Server only | Dla AI recommendations (future) |

### Które są publiczne (NEXT_PUBLIC_)?
- `NEXT_PUBLIC_SUPABASE_URL` - ✅ Widoczne w przeglądarce
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ✅ Widoczne w przeglądarce (OK! To jest public key)

### Które są SECRET?
- `SUPABASE_SERVICE_ROLE_KEY` - 🔒 **NIE COMMITOWAĆ!** Tylko server-side
- `OPENAI_API_KEY` - 🔒 Tylko server-side

---

## 🛡️ Row Level Security (RLS)

Schema już ma RLS policies! Oznacza to:

✅ **Bezpieczeństwo:**
- User może widzieć **tylko swoje** projekty
- User może edytować **tylko swoje** projekty
- User może usuwać **tylko swoje** projekty
- Shared projekty widoczne tylko dla invited users

✅ **Autoryzacja:**
- JWT token w każdym requeście
- Middleware sprawdza `/dashboard/*` routes
- API endpoints sprawdzają `auth.getUser()`

**Nie musisz nic dodawać - już działa!**

---

## 🚀 Quick Start Commands

### Deploy w Mock Mode (działa teraz):
```bash
# Nic nie rób, już jest na Vercel!
# Odwiedź: https://your-app.vercel.app
```

### Deploy z Supabase:
```bash
# 1. Stwórz Supabase project
# 2. Uruchom schema.sql
# 3. Dodaj 3 env vars w Vercel
# 4. Redeploy
```

---

## 🎨 Features Gotowe Produkcyjnie

✅ **Homepage**
- Landing page z hero
- Features showcase
- Pricing (Free/Pro $29/Team $99)
- Footer z linkami

✅ **Authentication**
- Email/Password registration
- Login z session management
- Protected routes (middleware)
- Logout functionality

✅ **Dashboard**
- Project listing grid
- Create new project
- Empty states
- Last updated timestamps

✅ **Canvas Editor** (Main Feature!)
- Drag-drop 30+ components
- React Flow diagram builder
- Custom nodes z iconami
- Connection system (edges)
- Zoom/pan controls
- Minimap + Background grid

✅ **Component Palette**
- Frontend: Vercel, Cloud Run, App Runner
- Backend: Lambda, Cloud Functions, ECS
- Database: RDS, Cloud SQL, DynamoDB
- Storage: S3, Cloud Storage, Blob
- Cloud: EC2, Compute Engine, VMs

✅ **Real-Time Cost Estimation**
- Calculate as you build
- Breakdown by category
- Min/Max monthly ranges
- USD currency

✅ **Terraform Code Generation**
- Generates 4 files:
  - `main.tf` - providers config
  - `variables.tf` - input variables
  - `resources.tf` - all resources
  - `outputs.tf` - output values
- Multi-cloud support (AWS/GCP/Azure)
- Download as JSON

✅ **API Routes**
- `/api/projects` - CRUD projects
- `/api/diagrams` - Save/load diagrams
- `/api/generate/terraform` - Code generation
- `/api/estimate-cost` - Cost calculation
- `/api/templates` - Pre-built templates

✅ **Mock Backend**
- Zero config deployment
- Fake auth (instant login)
- Demo data
- Full UI testable

---

## ⚠️ Co NIE Działa w Mock Mode

❌ **Persystencja danych**
- Refresh strony = wszystko znika
- Nie ma prawdziwej bazy
- Projekty są fake

❌ **Multi-user**
- Wszyscy mają ID: `mock-user-id`
- Brak prawdziwej separacji

❌ **Sharing**
- Nie można współdzielić projektów

❌ **Email notifications**
- Brak prawdziwego auth

**Rozwiązanie:** Skonfiguruj Supabase (15 minut) ⬆️

---

## 🔧 Troubleshooting

### Build fails w Vercel
✅ **FIXED!** Ostatni commit naprawił:
- Next.js 15 async params
- TypeScript errors
- PostCSS config

Build lokalny przechodzi: `npm run build` ✅

### Aplikacja nie zapisuje danych
- **Mock mode aktywny** - dodaj env vars dla Supabase
- Sprawdź konsole: `⚠️ Using mock Supabase client`

### "Unauthorized" errors
- **Mock mode:** Nie powinno się zdarzać (auto-login)
- **Production:** Sprawdź czy JWT token jest valid
- Spróbuj logout → login ponownie

### Diagram nie ładuje się po refresh
- **Mock mode:** To normalne - brak persystencji
- **Production:** Sprawdź czy API `/api/diagrams` działa
- Sprawdź Network tab w DevTools

### Terraform generation nie działa
- Sprawdź czy masz nodes na canvasie
- Sprawdź konsole na błędy
- API `/api/generate/terraform` powinno zwrócić JSON

---

## 📊 Production Checklist

### Przed Go-Live:

- [ ] ✅ Supabase project created
- [ ] ✅ Schema.sql executed
- [ ] ✅ Environment variables w Vercel
- [ ] ✅ Redeploy aplikacji
- [ ] ✅ Test registration flow
- [ ] ✅ Test project creation
- [ ] ✅ Test diagram save/load
- [ ] ✅ Test Terraform generation
- [ ] 🔄 Ustaw custom domain (opcjonalne)
- [ ] 🔄 Ustaw Analytics (opcjonalne)
- [ ] 🔄 Dodaj Error tracking (Sentry/opcjonalne)

### Security:

- [x] ✅ RLS policies enabled
- [x] ✅ Auth middleware na /dashboard
- [x] ✅ API routes sprawdzają auth
- [x] ✅ Service role key jest SECRET
- [ ] 🔄 Rate limiting (TODO - future)
- [ ] 🔄 CORS policies (TODO - future)

### Performance:

- [x] ✅ Next.js 15 optimized build
- [x] ✅ React Server Components
- [x] ✅ Static pages gdzie możliwe
- [x] ✅ Code splitting automatic
- [ ] 🔄 Image optimization (TODO - brak images)
- [ ] 🔄 CDN dla assets (Vercel Edge)

---

## 🎉 Gotowe!

### Mock Mode (działa teraz):
```
✅ Aplikacja live na Vercel
✅ Wszystkie features działają
⚠️ Brak persystencji danych
```

### Production Mode (15 minut setup):
```
1. Supabase → New Project
2. SQL Editor → Run schema.sql
3. Settings → API → Copy keys
4. Vercel → Add 3 env vars
5. Redeploy → Done! 🚀
```

**Masz pytania? Sprawdź README.md lub TODO.md w repo!**
