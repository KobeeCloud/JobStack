# 🚀 JobStack — Propozycje nowych Features

> Dokument przygotowany na podstawie pełnego audytu projektu.
> Zaimplementowane features zostały usunięte z listy.
> Pozostałe propozycje podzielone na kategorie: **SHOULD HAVE** (warto mieć), **NICE TO HAVE** (na przyszłość).

---

## ✅ Zaimplementowane (usunięte z propozycji)

Poniższe features zostały w pełni zaimplementowane:

1. ~~📤 Eksport danych użytkownika (RODO Art. 20)~~ → `GET /api/user/export` + przycisk w `/settings`
2. ~~🗑️ Usuwanie konta z 7-dniowym grace period~~ → `POST/DELETE /api/user/delete` + UI
3. ~~📧 System powiadomień email (Resend)~~ → `lib/email.ts` + szablony + preferencje w `/settings`
4. ~~🔒 Wymuszanie weryfikacji email~~ → `/verify-email` + middleware enforcement
5. ~~🛡️ Content Security Policy (CSP)~~ → `next.config.ts` headers
6. ~~🌙 Dark Mode / Theme Toggle~~ → `next-themes` + ThemeToggle w navbar
7. ~~🌐 Internacjonalizacja (i18n) PL/EN~~ → `next-intl` + `messages/pl.json` + `messages/en.json`
8. ~~📊 Dashboard Analytics~~ → `recharts` wykresy (provider, status, monthly, categories)
9. ~~🔄 Real-time Collaboration~~ → Supabase Realtime Presence + Broadcast hooks + UI
10. ~~📋 Terraform Import~~ → `lib/terraform-import.ts` (390 lines, 50+ resource mappings)
11. ~~📝 Projekt versioning~~ → `diagram_versions` table + API + Version History UI
12. ~~� Webhook Integrations~~ → `webhooks` table + HMAC-SHA256 + API CRUD
13. ~~📑 PDF Documentation Export~~ → `jsPDF` real PDF generation
14. ~~🏗️ Infrastructure Drift Detection~~ → `lib/drift-detection.ts` TF state comparison
15. ~~🎨 Custom Component Library~~ → `custom_components` table + API + drag-and-drop panel w edytorze

---

## � SHOULD HAVE — Warto mieć

### 1. 📱 Responsive Design + PWA
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

### 2. 🔑 API Keys dla CI/CD
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

## 🟢 NICE TO HAVE — Na przyszłość / premium

### 3. 💳 Billing / Subscription (Stripe)
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

### 4. 🏢 SSO / SAML dla Enterprise
**Status:** ❌ Brak
**Dlaczego:** Enterprise klienci wymagają SSO (Azure AD, Okta, Google Workspace).
**Zakres:**
- Supabase Auth obsługuje SAML 2.0 (Enterprise plan Supabase)
- Konfiguracja per organizacja
- Enforce SSO: blokowanie email/password dla organizacji z SSO
- SCIM provisioning (automatyczne dodawanie/usuwanie userów)

**Złożoność:** 🔴 Wysoka (5+ dni, wymaga Supabase Enterprise)

---

### 5. 🤖 AI Chat w diagramie (rozszerzony)
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

## 📊 Priorytetyzacja — Rekomendowana kolejność

| # | Feature | Priorytet | Effort | ROI |
|---|---------|-----------|--------|-----|
| 1 | PWA + Mobile | 🟡 SHOULD | 2-3 dni | Dostępność |
| 2 | API Keys | 🟡 SHOULD | 2-3 dni | Integracje CI/CD |
| 3 | Stripe Billing | 🟢 NICE | 3-5 dni | Monetyzacja |
| 4 | SSO/SAML | 🟢 NICE | 5+ dni | Enterprise |
| 5 | Rozszerzony AI | 🟢 NICE | 2-3 dni | WOW factor |

---

## 💡 Quick Wins (< 1 dzień każdy)

1. **Favicon generacja** — generowanie PNG 192x192 i 512x512 z SVG (dla lepszego PWA support)
2. **Meta tags OG** — Open Graph images dla social media sharing
3. **Loading skeletons** — Suspense boundaries z skeleton UI (częściowo jest)
4. **Error pages** — custom 404, 500 (Next.js `not-found.tsx`, `error.tsx`)

---

*Dokument zaktualizowany: Luty 2026*
*Projekt: JobStack v2.0.0*
*Stack: Next.js 16 + Supabase + React Flow*
*Zaimplementowanych features: 15/20 propozycji ✅*
