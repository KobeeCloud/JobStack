# Troubleshooting Guide - JobStack

## Problem: Rejestracja nie rozróżnia roli (candidate/employer)

### Przyczyna:
Trigger w bazie danych nie czytał roli z metadanych użytkownika.

### Rozwiązanie:
✅ **Naprawiono w schema.sql** - trigger teraz używa `COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')`

### Jak przetestować:
1. Uruchom zaktualizowany `schema.sql` w Supabase SQL Editor
2. Zarejestruj się jako Employer
3. Po zalogowaniu sprawdź w Supabase → Table Editor → profiles → czy role = 'employer'

---

## Problem: Dashboard nie działa / pokazuje błąd

### Możliwe przyczyny i rozwiązania:

#### 1. Brak profilu w bazie
**Objaw:** Dashboard pokazuje błąd lub przekierowuje na login

**Rozwiązanie:**
✅ Dashboard automatycznie tworzy profil jeśli nie istnieje (kod już jest)

**Sprawdź:**
```sql
-- W Supabase SQL Editor:
SELECT * FROM public.profiles WHERE email = 'twoj@email.com';
```

Jeśli nie ma profilu:
```sql
-- Ręczne dodanie (użyj swojego UUID z auth.users):
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'candidate' FROM auth.users WHERE email = 'twoj@email.com';
```

#### 2. Brakująca zmienna środowiskowa SUPABASE_SERVICE_ROLE_KEY

**Objaw:** Dashboard nie może utworzyć profilu, błędy RLS

**Sprawdź:**
- Vercel → Settings → Environment Variables
- Czy `SUPABASE_SERVICE_ROLE_KEY` jest ustawiony?

**Znajdź klucz:**
- Supabase Dashboard → Settings → API → `service_role` (secret)

#### 3. RLS Policy blokuje INSERT

**Objaw:** Błąd "new row violates row-level security policy"

**Sprawdź policy:**
```sql
-- W Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Powinna być policy:**
```sql
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

Jeśli nie ma - uruchom ponownie `schema.sql`

#### 4. Trigger nie działa

**Sprawdź czy trigger istnieje:**
```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Jeśli nie ma - uruchom:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Problem: Scraper nie pobiera ofert

### Sprawdź:

1. **Vercel Cron działa?**
   - Vercel Dashboard → Cron Jobs → Sprawdź logi

2. **Zmienne środowiskowe:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=... # MUSI być!
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Ręczne uruchomienie scraper:**
   ```bash
   curl -X GET https://twoj-domain.vercel.app/api/scrape
   ```

4. **Sprawdź czy oferty są w bazie:**
   ```sql
   SELECT source, COUNT(*)
   FROM public.jobs
   GROUP BY source;
   ```

---

## Problem: "Już jesteś zalogowany" ale dashboard nie działa

### Przyczyna:
Pętla redirect między `/login` i `/dashboard`

### Rozwiązanie:
✅ Już naprawione - login pokazuje info zamiast redirect

### Jeśli dalej problem:
1. Wyloguj się
2. Wyczyść cookies (DevTools → Application → Cookies)
3. Zaloguj się ponownie

---

## Szybka diagnostyka

### 1. Sprawdź czy user istnieje w auth:
```sql
SELECT id, email, created_at FROM auth.users WHERE email = 'twoj@email.com';
```

### 2. Sprawdź czy ma profil:
```sql
SELECT * FROM public.profiles WHERE email = 'twoj@email.com';
```

### 3. Sprawdź czy trigger działa:
```sql
-- Zarejestruj testowego usera i od razu sprawdź:
SELECT u.id, u.email, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'test@example.com';
```

### 4. Sprawdź oferty w bazie:
```sql
SELECT
  source,
  COUNT(*) as total,
  MAX(created_at) as last_scraped
FROM public.jobs
GROUP BY source;
```

---

## Komendy pomocnicze

### Reset profilu użytkownika:
```sql
-- UWAGA: To usunie profil! Trigger utworzy nowy przy następnym logowaniu
DELETE FROM public.profiles WHERE email = 'twoj@email.com';
```

### Ręczne dodanie profilu employer:
```sql
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'employer'
FROM auth.users
WHERE email = 'twoj@email.com'
ON CONFLICT (id) DO UPDATE SET role = 'employer';
```

### Sprawdź aktywne policies:
```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
