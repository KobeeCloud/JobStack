# 🚀 JobStack — Propozycje nowych Features

> Dokument przygotowany na podstawie pełnego audytu projektu — analiza każdego pliku, komponentu i API route.
> Podzielone na kategorie: **MUST HAVE** (wymagane), **SHOULD HAVE** (warto mieć), **NICE TO HAVE** (na przyszłość).

---

## 🔴 MUST HAVE — Wymagane do produkcji

### 1. 📤 Eksport danych użytkownika (RODO Art. 20 — Prawo do przenoszenia)
**Status:** ⚠️ Brak implementacji  
**Dlaczego:** Obowiązek prawny RODO. W Polityce Prywatności obiecujesz eksport w formacie JSON.  
**Zakres:**
- Endpoint `GET /api/user/export` — generuje ZIP z:
  - `profile.json` — dane profilowe
  - `projects/*.json` — wszystkie projekty z diagramami
  - `organizations.json` — członkostwa
  - `exports/*.tf` — wygenerowany Terraform (opcjonalnie)
- Przycisk "Eksportuj moje dane" w `/settings`
- Rate limit: max 1 eksport / 24h

**Złożoność:** 🟡 Średnia (1-2 dni)

---

### 2. 🗑️ Pełne usuwanie konta z potwierdzeniem (RODO Art. 17)
**Status:** ⚠️ Częściowo zaimplementowane (button istnieje, logika poprawiona)  
**Dlaczego:** Trzeba wysłać email potwierdzający i dać 7-dniowy grace period.  
**Zakres:**
- Email "Potwierdź usunięcie konta" z linkiem (Supabase email template)
- 7-dniowy grace period (soft-delete: `deleted_at` timestamp w `profiles`)
- Cron/scheduled function do finalnego usunięcia po 7 dniach
- Możliwość anulowania w okresie grace period

**Złożoność:** 🟡 Średnia (1-2 dni)

---

### 3. 📧 System powiadomień email (transactional)
**Status:** ❌ Brak  
**Dlaczego:** Bez powiadomień użytkownik nie wie o zaproszeniach do organizacji, zmianach w projektach.  
**Zakres:**
- Supabase Edge Functions lub Resend/SendGrid
- Szablony:
  - Zaproszenie do organizacji
  - Akceptacja/odrzucenie zaproszenia
  - Usunięcie z organizacji
  - Potwierdzenie rejestracji
  - Reset hasła (już jest via Supabase Auth, ale custom template)
- Ustawienia preferencji email w `/settings`

**Złożoność:** 🟡 Średnia (2-3 dni)

---

### 4. 🔒 Wymuszanie weryfikacji email
**Status:** ⚠️ Supabase Auth wspiera, ale brak enforcementu w aplikacji  
**Dlaczego:** Bez weryfikacji ktoś może zarejestrować się na cudzy email.  
**Zakres:**
- Strona `/verify-email` po rejestracji
- Middleware blokujący dostęp do dashboard dla niezweryfikowanych
- Resend verification email button
- Supabase config: `GOTRUE_MAILER_AUTOCONFIRM=false`

**Złożoność:** 🟢 Niska (0.5 dnia)

---

### 5. 🛡️ Content Security Policy (CSP) header
**Status:** ❌ Brak (dodano inne security headers, ale nie CSP)  
**Dlaczego:** Kluczowa ochrona przed XSS. Wymagane przez najlepsze praktyki bezpieczeństwa.  
**Zakres:**
- CSP header w `next.config.ts` z:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline'` (Next.js wymaga)
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: *.supabase.co avatars.githubusercontent.com`
  - `connect-src 'self' *.supabase.co *.upstash.io *.sentry.io api.openai.com`
- Report-Only mode na start, potem enforce

**Złożoność:** 🟢 Niska (0.5 dnia)

---

## 🟡 SHOULD HAVE — Znacząco podniesie wartość

### 6. 🌙 Dark Mode / Theme Toggle
**Status:** ❌ Brak (Tailwind dark mode jest skonfigurowany, ale brak toggle)  
**Dlaczego:** Standard w 2025. Użytkownicy DevOps pracują często po nocach.  
**Zakres:**
- `next-themes` provider w layout.tsx
- Toggle button w navbar (Sun/Moon icon)
- Persystencja w localStorage + cookie (SSR-safe)
- Sprawdzenie wszystkich komponentów pod dark mode

**Złożoność:** 🟢 Niska (0.5 dnia)

---

### 7. 🌐 Internacjonalizacja (i18n) — PL / EN
**Status:** ❌ Brak (UI jest po angielsku, legal docs po polsku)  
**Dlaczego:** Projekt ma polskie dane prawne ale angielski UI. Niespójność + rynek PL potrzebuje PL.  
**Zakres:**
- `next-intl` lub `next-i18next`
- Pliki `/messages/pl.json` i `/messages/en.json`
- Language switcher w navbar
- Automatyczne wykrywanie języka przeglądarki
- Minimum: PL + EN, później DE, FR

**Złożoność:** 🔴 Wysoka (3-5 dni dla pełnej implementacji)

---

### 8. 📊 Dashboard Analytics — wykresy i statystyki
**Status:** ⚠️ Podstawowe statystyki istnieją (liczba projektów), ale bez wykresów  
**Dlaczego:** DevOps/Cloud Architekci chcą widzieć trendy kosztów, używanie komponentów.  
**Zakres:**
- Wykres kosztów infrastruktury w czasie (per projekt)
- Pie chart: rozkład komponentów (AWS/Azure/GCP)
- Trend: ilość projektów w czasie
- Ostatnia aktywność w projektach
- Biblioteka: `recharts` lub `tremor`

**Złożoność:** 🟡 Średnia (2-3 dni)

---

### 9. 🔄 Real-time Collaboration (Supabase Realtime)
**Status:** ❌ Brak (Supabase Realtime jest w dependency, ale nie używany)  
**Dlaczego:** Główna przewaga konkurencyjna. "Google Docs for infrastructure diagrams."  
**Zakres:**
- Supabase Realtime Presence — kto ogląda diagram
- Supabase Realtime Broadcast — zmiany nodes/edges w real-time
- Kursory innych użytkowników na diagramie (jak Figma)
- Conflict resolution (last-write-wins lub OT/CRDT)
- Wyświetlanie awatarów aktywnych użytkowników

**Złożoność:** 🔴 Wysoka (5-7 dni)

---

### 10. 📱 Responsive Design + PWA
**Status:** ⚠️ Manifest istnieje, ale brak service worker, diagram editor nie jest responsive  
**Dlaczego:** Mobilny dostęp do przeglądania projektów (nie edycji) jest ważny.  
**Zakres:**
- Service Worker (next-pwa lub Serwist)
- Offline: cache dashboardu i listy projektów
- Mobile: read-only widok diagramu (pinch-to-zoom)
- Mobile: pełna responsywność dashboard, settings, organizations
- Push notifications (Web Push API)

**Złożoność:** 🟡 Średnia (2-3 dni)

---

### 11. 🔑 API Keys dla CI/CD
**Status:** ❌ Brak  
**Dlaczego:** Użytkownicy chcą zintegrować JobStack z Jenkins/GitHub Actions.  
**Zakres:**
- Tabela `api_keys` (key, user_id, name, permissions, last_used, expires_at)
- Sekcja "API Keys" w `/settings`
- Generate/revoke/rotate klucze
- Auth middleware dla `Authorization: Bearer js_...` header
- Endpointy: `GET /api/v1/projects`, `GET /api/v1/projects/:id/terraform`
- Rate limiting per API key

**Złożoność:** 🟡 Średnia (2-3 dni)

---

### 12. 📋 Terraform Import → Diagram (reverse engineering)
**Status:** ⚠️ Komponent `terraform-import-dialog.tsx` istnieje, ale wymaga weryfikacji  
**Dlaczego:** Killer feature — importuj istniejącą infrastrukturę i wizualizuj.  
**Zakres:**
- Parser HCL → AST (regex-based lub `hcl2-parser`)
- Mapowanie `resource "aws_instance"` → node na diagramie
- Auto-layout (dagre/elk algorithm)
- Import z pliku `.tf` lub wklejenie kodu
- Obsługa: AWS, Azure, GCP providers
- Draw.io import (komponent już istnieje)

**Złożoność:** 🔴 Wysoka (3-5 dni)

---

### 13. 📝 Projekt versioning / historia zmian
**Status:** ⚠️ Komponent `diagram-versions.tsx` istnieje, brak backend  
**Dlaczego:** Undo/redo jest lokalne (useHistory hook). Brak persistentnej historii.  
**Zakres:**
- Tabela `diagram_versions` (project_id, version, data, created_by, message)
- Auto-save tworzy nową wersję co N minut
- Manual save z opisem (commit message)
- Diff viewer między wersjami
- Restore do dowolnej wersji
- Limit: 50 wersji na free tier, unlimited na paid

**Złożoność:** 🟡 Średnia (2-3 dni)

---

## 🟢 NICE TO HAVE — Na przyszłość / premium

### 14. 💳 Billing / Subscription (Stripe)
**Status:** ❌ Brak (subscription_tier jest w DB, ale brak integracji z płatnościami)  
**Dlaczego:** Monetyzacja. Masz już tiery: free/pro/enterprise w schemacie DB.  
**Zakres:**
- Stripe Checkout / Customer Portal
- Plany: Free (3 projekty, 1 org) / Pro (unlimited, API keys, priority) / Enterprise (SSO, audit)
- Webhook handler: `POST /api/webhooks/stripe`
- Stripe Customer Portal link w `/settings`
- Usage-based billing (opcjonalnie: per AI request)

**Złożoność:** 🔴 Wysoka (3-5 dni)

---

### 15. 🏢 SSO / SAML dla Enterprise
**Status:** ❌ Brak  
**Dlaczego:** Enterprise klienci wymagają SSO (Azure AD, Okta, Google Workspace).  
**Zakres:**
- Supabase Auth obsługuje SAML 2.0 (Enterprise plan Supabase)
- Konfiguracja per organizacja
- Enforce SSO: blokowanie email/password dla organizacji z SSO
- SCIM provisioning (automatyczne dodawanie/usuwanie userów)

**Złożoność:** 🔴 Wysoka (5+ dni, wymaga Supabase Enterprise)

---

### 16. 🤖 AI Chat w diagramie (rozszerzony)
**Status:** ⚠️ Podstawowy `ai-assistant-panel.tsx` i `architecture-analyzer.ts` istnieją  
**Dlaczego:** AI-powered architecture review to mega wartość.  
**Zakres rozszerzenia:**
- "Dodaj load balancer do mojej architektury" → AI dodaje nodes/edges
- "Optymalizuj koszty" → AI sugeruje tańsze alternatywy i stosuje zmiany
- "Zrób to HA" → AI dodaje redundancję
- Streaming odpowiedzi (SSE/WebSocket)
- Context window: cały diagram + historia zmian
- Model: GPT-4o lub Claude

**Złożoność:** 🟡 Średnia (2-3 dni, podstawa już jest)

---

### 17. 🔗 Webhook Integrations
**Status:** ❌ Brak  
**Dlaczego:** Integracja z Slack, Teams, Discord, PagerDuty.  
**Zakres:**
- Tabela `webhooks` (url, events, secret, active)
- Events: `project.created`, `project.updated`, `diagram.exported`, `member.invited`
- Webhook management UI w ustawieniach organizacji
- HMAC signature verification
- Retry logic (3 attempts, exponential backoff)

**Złożoność:** 🟡 Średnia (2-3 dni)

---

### 18. 📑 PDF Documentation Export (rozszerzony)
**Status:** ⚠️ `pdf-documentation.ts` istnieje (generuje Markdown)  
**Dlaczego:** Klienci enterprise potrzebują PDF do dokumentacji architektury.  
**Zakres rozszerzenia:**
- Prawdziwy PDF (biblioteka: `@react-pdf/renderer` lub `puppeteer`)
- Embedded diagram jako SVG/PNG w PDF
- Branding: logo firmy, custom kolory
- Sekcje: Executive Summary, komponent details, cost breakdown, compliance status
- Template: "Architecture Decision Record" (ADR)

**Złożoność:** 🟡 Średnia (2-3 dni)

---

### 19. 🏗️ Infrastructure Drift Detection
**Status:** ❌ Brak  
**Dlaczego:** Porównanie "co jest w diagramie" vs "co jest w chmurze" (via Terraform state).  
**Zakres:**
- Import `terraform.tfstate` → compare z diagramem
- Oznaczanie drifted nodes (czerwona ramka)
- Report: "3 resources drifted, 2 orphaned, 1 missing"
- Scheduled check (webhook z CI/CD)

**Złożoność:** 🔴 Wysoka (5+ dni)

---

### 20. 🎨 Custom Component Library
**Status:** ⚠️ Katalog komponentów istnieje (`lib/catalog`), ale nie jest rozszerzalny  
**Dlaczego:** Użytkownicy chcą dodawać własne komponenty (np. on-prem, custom services).  
**Zakres:**
- Custom component creator (ikona, kolor, pola konfiguracji, Terraform template)
- Per-organizacja custom components
- Marketplace: community-shared components
- Importowanie komponentów z JSON

**Złożoność:** 🟡 Średnia (3-4 dni)

---

## 📊 Priorytetyzacja — Rekomendowana kolejność

| # | Feature | Priorytet | Effort | ROI |
|---|---------|-----------|--------|-----|
| 1 | Eksport danych (RODO) | 🔴 MUST | 1-2 dni | Prawny wymóg |
| 2 | Usuwanie konta (grace period) | 🔴 MUST | 1-2 dni | Prawny wymóg |
| 4 | Weryfikacja email | 🔴 MUST | 0.5 dnia | Bezpieczeństwo |
| 5 | CSP header | 🔴 MUST | 0.5 dnia | Bezpieczeństwo |
| 6 | Dark Mode | 🟡 SHOULD | 0.5 dnia | Najłatwiejszy win |
| 3 | Email notifications | 🟡 SHOULD | 2-3 dni | UX |
| 13 | Versioning diagramów | 🟡 SHOULD | 2-3 dni | Killer feature |
| 8 | Dashboard Analytics | 🟡 SHOULD | 2-3 dni | Wartość wizualna |
| 12 | Terraform Import | 🟡 SHOULD | 3-5 dni | Killer feature |
| 11 | API Keys | 🟡 SHOULD | 2-3 dni | Integracje |
| 7 | i18n PL/EN | 🟡 SHOULD | 3-5 dni | Rynek PL |
| 16 | Rozszerzony AI | 🟢 NICE | 2-3 dni | WOW factor |
| 10 | PWA + Mobile | 🟢 NICE | 2-3 dni | Dostępność |
| 9 | Real-time Collab | 🟢 NICE | 5-7 dni | Mega feature |
| 14 | Stripe Billing | 🟢 NICE | 3-5 dni | Monetyzacja |
| 17 | Webhooks | 🟢 NICE | 2-3 dni | Integracje |
| 18 | PDF Export | 🟢 NICE | 2-3 dni | Enterprise |
| 20 | Custom Components | 🟢 NICE | 3-4 dni | Rozszerzalność |
| 19 | Drift Detection | 🟢 NICE | 5+ dni | Advanced |
| 15 | SSO/SAML | 🟢 NICE | 5+ dni | Enterprise |

---

## 💡 Quick Wins (< 1 dzień każdy)

1. **Dark Mode toggle** — next-themes, 2h pracy
2. **Weryfikacja email** — konfiguracja Supabase + strona, 3h
3. **CSP header** — dodanie do next.config.ts, 1h
4. **Keyboard shortcuts help dialog** — komponent `keyboard-shortcuts-dialog.tsx` już istnieje, wystarczy podpiąć
5. **Favicon generacja** — generowanie PNG 192x192 i 512x512 z SVG (dla lepszego PWA support)
6. **Meta tags OG** — Open Graph images dla social media sharing
7. **Loading skeletons** — Suspense boundaries z skeleton UI (częściowo jest)
8. **Error pages** — custom 404, 500 (Next.js `not-found.tsx`, `error.tsx`)

---

*Dokument wygenerowany: Luty 2026*  
*Projekt: JobStack v2.0.0*  
*Stack: Next.js 16 + Supabase + React Flow*
