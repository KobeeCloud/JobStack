# 🚀 JobStack - Instrukcje naprawy i konfiguracji

## ⚠️ KRYTYCZNE: Problemy do naprawienia

### 1. Baza danych - Uruchom zaktualizowany schema.sql

**Problem:**
- Profil użytkownika nie jest tworzony poprawnie
- Brak `candidate_profiles` lub `employer_profiles` po rejestracji
- Dashboard nie działa

**Rozwiązanie:**

1. **Otwórz Supabase Dashboard**
   - https://supabase.com/dashboard
   - Wybierz swój projekt

2. **SQL Editor → New Query**

3. **Skopiuj całą zawartość pliku:**
   ```
   /home/jakubpospieszny/Documents/github/KobeCloud/JobStack/supabase/schema.sql
   ```

4. **Wklej i kliknij RUN**
   - ⚠️ **UWAGA: To usunie wszystkie dane i utworzy tabele od nowa!**
   - Schema jest idempotentna - można uruchomić wielokrotnie

5. **Sprawdź czy trigger działa:**
   ```sql
   SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
   Powinien pokazać: `on_auth_user_created`

### 2. Vercel - Zmienne środowiskowe

**Problem:** CRON nie działa, scraper nie pobiera ofert

**Sprawdź czy masz te zmienne:**

1. **Otwórz Vercel Dashboard**
   - Settings → Environment Variables

2. **Wymagane zmienne:**

   ```env
   # Supabase (publiczne - OK)
   NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

   # Supabase SERVICE ROLE (KRYTYCZNE - MUSI BYĆ!)
   SUPABASE_SERVICE_ROLE_KEY=eyJ...    # ⚠️ To jest secret key!

   # Opcjonalne (dla ręcznego triggera)
   CRON_SECRET=jakis-losowy-secret
   ```

3. **Jak znaleźć SUPABASE_SERVICE_ROLE_KEY:**
   - Supabase Dashboard → Settings → API
   - Przewiń do "Project API keys"
   - **service_role** - to jest ten klucz! (kliknij "Reveal")
   - ⚠️ **NIGDY nie commituj tego klucza do git!**

4. **Po dodaniu zmiennych:**
   - Vercel automatycznie redeploy'uje
   - Lub: Deployments → "..." → Redeploy

### 3. Testowanie po naprawie

#### A. Test rejestracji CANDIDATE

1. **Wyloguj się** (jeśli jesteś zalogowany)
2. **Zarejestruj się jako CANDIDATE**
   - Email: test-candidate@example.com
   - Hasło: TestTest123!
   - Wybierz: "Szukam pracy (Kandydat)"

3. **Sprawdź w Supabase → Table Editor:**

   **Tabela `profiles`:**
   ```sql
   SELECT * FROM public.profiles WHERE email = 'test-candidate@example.com';
   ```
   Powinno być: `role = 'candidate'`

   **Tabela `candidate_profiles`:**
   ```sql
   SELECT * FROM public.candidate_profiles cp
   JOIN public.profiles p ON cp.user_id = p.id
   WHERE p.email = 'test-candidate@example.com';
   ```
   Powinien być 1 rekord!

4. **Wejdź na Dashboard**
   - https://twoja-domena.vercel.app/dashboard
   - Powinien pokazać panel KANDYDATA (nie błąd!)

#### B. Test rejestracji EMPLOYER

1. **Wyloguj się**
2. **Zarejestruj się jako EMPLOYER**
   - Email: test-employer@example.com
   - Hasło: TestTest123!
   - Wybierz: "Rekrutuję pracowników (Pracodawca)"

3. **Sprawdź w Supabase → Table Editor:**

   **Tabela `profiles`:**
   ```sql
   SELECT * FROM public.profiles WHERE email = 'test-employer@example.com';
   ```
   Powinno być: `role = 'employer'`

   **Tabela `employer_profiles`:**
   ```sql
   SELECT * FROM public.employer_profiles ep
   JOIN public.profiles p ON ep.user_id = p.id
   WHERE p.email = 'test-employer@example.com';
   ```
   Powinien być 1 rekord!

4. **Wejdź na Dashboard**
   - Powinien pokazać panel PRACODAWCY (statystyki, oferty)

#### C. Test CRON (scraper)

1. **Ręczne uruchomienie:**
   ```bash
   curl -X GET https://twoja-domena.vercel.app/api/scrape
   ```

2. **Sprawdź logi w Vercel:**
   - Vercel Dashboard → Project → Logs
   - Szukaj: "Starting scraper run"

3. **Sprawdź oferty w bazie:**
   ```sql
   SELECT source, COUNT(*) as total, MAX(created_at) as last_scraped
   FROM public.jobs
   GROUP BY source;
   ```

4. **Sprawdź Vercel Cron:**
   - Vercel Dashboard → Cron Jobs
   - Powinno być: `/api/scrape` co `00 15 * * *` (15:00 UTC)
   - Sprawdź logi z ostatniego uruchomienia

### 4. Czyszczenie starych danych (jeśli potrzebujesz)

**Usuń wszystkich użytkowników testowych:**

```sql
-- W Supabase SQL Editor
DELETE FROM auth.users WHERE email LIKE 'test-%@example.com';
-- Trigger automatycznie usunie profile (ON DELETE CASCADE)
```

**Usuń wszystkie oferty:**

```sql
DELETE FROM public.jobs;
```

---

## 📊 Diagnostyka problemów

### Problem: Dashboard przekierowuje na login

**Przyczyna:** Brak profilu w bazie

**Sprawdź:**
```sql
SELECT u.id, u.email, p.role, p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'twoj@email.com';
```

**Jeśli `role` jest NULL:**
- Trigger nie zadziałał podczas rejestracji
- Uruchom ponownie `schema.sql`
- Zarejestruj się na nowo

### Problem: "Permission denied" w dashboard

**Przyczyna:** Brak SUPABASE_SERVICE_ROLE_KEY lub RLS blokuje

**Sprawdź:**
1. Czy SUPABASE_SERVICE_ROLE_KEY jest w Vercel
2. Czy policies są utworzone:
   ```sql
   SELECT tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```

### Problem: CRON nie działa

**Możliwe przyczyny:**

1. **Brak SUPABASE_SERVICE_ROLE_KEY**
   - Scraper nie może zapisać do bazy
   - Sprawdź zmienne w Vercel

2. **Plan Vercel za mały**
   - Free plan: CRON może nie działać
   - Hobby plan: CRON działa
   - Sprawdź: Vercel Dashboard → Usage → Cron Jobs

3. **Błąd w scraperze**
   - Sprawdź logi: Vercel → Functions → /api/scrape
   - Uruchom ręcznie: `curl https://twoja-domena.vercel.app/api/scrape`

---

## ✅ Checklist - Co musi działać

- [ ] Uruchomiono `schema.sql` w Supabase
- [ ] Trigger `on_auth_user_created` istnieje
- [ ] `SUPABASE_SERVICE_ROLE_KEY` jest w Vercel Environment Variables
- [ ] Rejestracja jako CANDIDATE tworzy `candidate_profiles`
- [ ] Rejestracja jako EMPLOYER tworzy `employer_profiles`
- [ ] Dashboard CANDIDATE działa
- [ ] Dashboard EMPLOYER działa
- [ ] CRON scraper pobiera oferty (sprawdź tabela `jobs`)
- [ ] Logi w Vercel nie pokazują błędów

---

## 🆘 Dalej nie działa?

### Sprawdź logi w kolejności:

1. **Vercel Build Logs**
   - Czy build się udał?

2. **Vercel Function Logs**
   - Czy są błędy w `/api/scrape`?

3. **Supabase Logs**
   - Database → Logs → Postgres Logs
   - Czy są błędy RLS / Trigger?

4. **Browser Console** (DevTools → Console)
   - Czy są błędy JavaScript?
   - Czy API zwraca błędy?

### Potrzebujesz pomocy?

1. Sprawdź `TROUBLESHOOTING.md`
2. Zbierz informacje:
   - Screenshot błędu
   - Logi z Vercel
   - Wynik SQL z Supabase
3. Opisz dokładnie co się dzieje

---

## 🎯 Kluczowe zmiany w tym update

### schema.sql
- ✅ DROP TABLE CASCADE - usuwa wszystkie tabele
- ✅ DROP TRIGGER / FUNCTION - usuwa stare triggery
- ✅ Trigger tworzy `candidate_profiles` lub `employer_profiles`
- ✅ Trigger czyta rolę z `raw_user_meta_data->>'role'`

### dashboard/page.tsx
- ✅ Fallback tworzy odpowiedni profil (candidate/employer)
- ✅ Czyta rolę z `user.user_metadata?.role`

### Struktura bazy:
```
auth.users (Supabase auth)
    ↓ [trigger: on_auth_user_created]
    ↓
public.profiles (role: candidate | employer)
    ↓
    ├─→ public.candidate_profiles (jeśli role=candidate)
    └─→ public.employer_profiles (jeśli role=employer)
```

---

**Powodzenia! 🚀**
