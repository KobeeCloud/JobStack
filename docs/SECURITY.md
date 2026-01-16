# 🔐 Bezpieczeństwo JobStack - Przegląd

## TL;DR - Czy logowanie jest bezpieczne?

**TAK**, logowanie jest bezpieczne pod warunkiem że:
1. Masz poprawnie skonfigurowane zmienne środowiskowe Supabase
2. Używasz HTTPS w produkcji
3. Row Level Security (RLS) jest włączony na wszystkich tabelach

---

## 🛡️ Architektura Bezpieczeństwa

### 1. Autoryzacja - Supabase Auth

JobStack używa **Supabase Auth**, który zapewnia:

- ✅ **Hashowanie haseł** - bcrypt z automatycznym salt
- ✅ **Tokeny JWT** - krótki czas życia, automatyczne odświeżanie
- ✅ **OAuth 2.0** - logowanie przez Google (opcjonalne)
- ✅ **Secure cookies** - HttpOnly, SameSite=Lax
- ✅ **CSRF protection** - przez SameSite cookies
- ✅ **Rate limiting** - wbudowane w Supabase

### 2. Przechowywanie danych

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Auth      │  │  Database   │  │     Storage         │  │
│  │  (Users)    │  │ (PostgreSQL)│  │  (CV Files)         │  │
│  │             │  │             │  │                     │  │
│  │ - Passwords │  │ - Jobs      │  │ - Encrypted at rest │  │
│  │   hashed    │  │ - Profiles  │  │ - Access via RLS    │  │
│  │ - JWT tokens│  │ - Apps      │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Row Level Security (RLS)                   │ │
│  │  - Users can only see/edit their own data               │ │
│  │  - Employers can only see applications for their jobs   │ │
│  │  - Jobs are public read, restricted write               │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3. Co NIGDY nie wycieknie?

| Dane | Zabezpieczenie |
|------|----------------|
| Hasło | Hashowane bcrypt, nigdy przechowywane w plain text |
| Sesja | JWT w HttpOnly cookies, niedostępny dla JavaScript |
| Dane osobowe | RLS - użytkownik widzi tylko swoje dane |
| CV/pliki | Storage z RLS, tylko właściciel ma dostęp |

---

## 🔒 Kluczowe mechanizmy bezpieczeństwa

### Row Level Security (RLS)

Każda tabela w bazie danych ma włączone RLS:

```sql
-- Przykład: użytkownicy widzą tylko swoje zapisane oferty
CREATE POLICY "Users can manage their saved jobs"
  ON public.saved_jobs FOR ALL
  USING (user_id = auth.uid());

-- Przykład: aplikacje widoczne dla kandydata i pracodawcy
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (
    auth.uid() = candidate_id OR
    EXISTS (
      SELECT 1 FROM public.employer_profiles ep
      JOIN public.jobs j ON j.company_id = ep.company_id
      WHERE ep.user_id = auth.uid() AND j.id = applications.job_id
    )
  );
```

### Middleware Next.js

```typescript
// middleware.ts - odświeżanie sesji przy każdym żądaniu
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...);
  await supabase.auth.getUser(); // Odświeża token jeśli wygasł
  return response;
}
```

### Klient Supabase

```typescript
// Lazy initialization - klucze ładowane tylko gdy potrzebne
// Używa NEXT_PUBLIC_SUPABASE_ANON_KEY - bezpieczny klucz publiczny
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## ⚠️ Co musisz zrobić przed produkcją?

### 1. Zmienne środowiskowe

Skopiuj `.env.example` do `.env.local` i wypełnij:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... # Bezpieczny klucz publiczny
```

**NIGDY** nie używaj `SUPABASE_SERVICE_ROLE_KEY` w kliencie!

### 2. HTTPS

- Vercel domyślnie wymusza HTTPS ✅
- Własny serwer: skonfiguruj certyfikat SSL

### 3. Uruchom schemat bazy danych

```bash
# W Supabase SQL Editor wykonaj:
# supabase/complete-schema.sql
```

To włączy RLS na wszystkich tabelach.

### 4. Skonfiguruj OAuth (opcjonalne)

W panelu Supabase > Authentication > Providers:
- Dodaj Google OAuth credentials
- Ustaw redirect URL

---

## 🚨 Potencjalne ryzyka i mitygacje

| Ryzyko | Mitygacja | Status |
|--------|-----------|--------|
| SQL Injection | Supabase używa prepared statements | ✅ Zabezpieczone |
| XSS | React automatycznie escape'uje | ✅ Zabezpieczone |
| CSRF | SameSite cookies | ✅ Zabezpieczone |
| Credential stuffing | Rate limiting w Supabase | ✅ Zabezpieczone |
| Token theft | HttpOnly cookies | ✅ Zabezpieczone |
| Data exposure | RLS policies | ✅ Zabezpieczone |

---

## 📋 Checklist przed logowaniem

- [ ] `.env.local` utworzony z poprawnymi kluczami
- [ ] Schemat bazy danych wykonany w Supabase
- [ ] RLS włączony na wszystkich tabelach
- [ ] HTTPS aktywny (Vercel robi to automatycznie)
- [ ] Google OAuth skonfigurowany (jeśli używasz)

---

## 🔍 Co się stanie jeśli...?

### Ktoś ukradnie JWT token?
- Token wygasa po 1 godzinie
- Może być unieważniony przez wylogowanie
- Nie da się z nim zrobić nic poza API JobStack

### Wycieknie ANON_KEY?
- To jest **klucz publiczny**, może być widoczny
- Nie daje dostępu do danych bez sesji użytkownika
- RLS blokuje nieautoryzowany dostęp

### Wycieknie SERVICE_ROLE_KEY?
- 🚨 **POWAŻNY PROBLEM** - nie używaj go nigdy w kliencie!
- Daje pełny dostęp do bazy danych
- Trzymaj tylko na serwerze, w zmiennych środowiskowych

---

## 🛠️ Zgłaszanie problemów bezpieczeństwa

Znalazłeś lukę? Napisz na: security@jobstack.pl

---

*Ostatnia aktualizacja: Styczeń 2026*
