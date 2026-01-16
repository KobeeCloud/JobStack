# Supabase Setup Guide dla JobStack

## Krok 1: Utworzenie projektu
1. Idź na https://app.supabase.com/
2. Kliknij "New project"
3. Nazwa: `jobstack-prod` (lub inna)
4. Database Password: Wygeneruj silne hasło i zapisz je

## Krok 2: Uruchomienie schematu bazy danych
1. W Supabase Dashboard → **SQL Editor**
2. Skopiuj cały plik `supabase/schema.sql`
3. Wklej i kliknij **Run**
4. ✅ Sprawdź czy nie ma błędów

## Krok 3: Zmienne środowiskowe

### Lokalne (.env.local):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key
SUPABASE_SERVICE_ROLE_KEY=twoj-service-role-key
```

### Vercel (Production):
1. Vercel Dashboard → Twój projekt → Settings → Environment Variables
2. Dodaj wszystkie 3 zmienne powyżej
3. **WAŻNE**: Dodaj też `SUPABASE_SERVICE_ROLE_KEY` - bez tego scraper nie będzie działał!

Znajdziesz je w: Supabase Dashboard → Settings → API

## Krok 4: Konfiguracja Authentication

### Email Auth (już skonfigurowane):
1. Authentication → Providers → Email ✅ (włączony domyślnie)

### Google OAuth (opcjonalnie):
1. **Google Cloud Console**:
   - Utwórz projekt na https://console.cloud.google.com/
   - APIs & Services → Credentials → Create OAuth Client ID
   - Type: Web application
   - Authorized redirect URIs: `https://twoj-projekt.supabase.co/auth/v1/callback`
   - Skopiuj Client ID i Client Secret

2. **Supabase Dashboard**:
   - Authentication → Providers → Google
   - Enable
   - Wklej Client ID i Client Secret
   - Save

### Email Templates (opcjonalnie - zmiana domyślnych emaili):
1. Authentication → Email Templates
2. **Confirm signup**:
```html
<h2>Potwierdź email - JobStack.pl</h2>
<p>Cześć!</p>
<p>Dziękujemy za rejestrację w JobStack.pl</p>
<p><a href="{{ .ConfirmationURL }}">Potwierdź swój email</a></p>
<p>Jeśli nie zakładałeś konta, zignoruj ten email.</p>
```

### Site URL (WAŻNE!):
1. Authentication → URL Configuration
2. **Site URL**:
   - Produkcja: `https://jobstack.pl`
   - Development: `http://localhost:3000`

## Krok 5: Weryfikacja

### Sprawdź czy tabele istnieją:
1. Table Editor → Sprawdź czy widzisz:
   - ✅ profiles
   - ✅ jobs
   - ✅ applications
   - ✅ saved_jobs
   - ✅ companies
   - ✅ candidate_profiles
   - ✅ employer_profiles

### Sprawdź RLS:
1. Table Editor → profiles → RLS (powinno być: ✅ Enabled)

### Test rejestracji:
1. Wejdź na `/register`
2. Zarejestruj się emailem
3. Po potwierdzeniu emaila zaloguj się
4. Sprawdź czy `/dashboard` działa

## Krok 6: Cron Jobs (Scraper)

### Vercel Cron:
- ✅ Już skonfigurowany w `vercel.json` (13:30 UTC daily)
- Endpoint: `/api/scrape`

### Ważne zmienne dla crona:
```bash
SUPABASE_SERVICE_ROLE_KEY=... # MUSI być ustawiony w Vercel!
CRON_SECRET=jakis-losowy-token # Opcjonalny, dla bezpieczeństwa
```

## Troubleshooting

### Problem: "Cannot read profiles"
- ✅ Sprawdź czy trigger `on_auth_user_created` istnieje
- ✅ Uruchom ponownie schemat SQL

### Problem: "Access denied"
- ✅ Sprawdź RLS policies
- ✅ Upewnij się że policy "Users can insert own profile" istnieje

### Problem: "Scraper nie pobiera ofert"
- ✅ Sprawdź czy `SUPABASE_SERVICE_ROLE_KEY` jest w Vercel
- ✅ Sprawdź logi w Vercel Dashboard → Functions → /api/scrape

### Problem: Pętla redirect login ↔ dashboard
- ✅ Naprawione! Dashboard automatycznie tworzy profil jeśli nie istnieje
- ✅ Login pokazuje info "Już zalogowany" zamiast redirect loop
