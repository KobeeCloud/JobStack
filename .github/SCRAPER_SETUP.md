# GitHub Actions Scraper Setup

## 📋 Co zostało skonfigurowane

GitHub Actions workflow który uruchamia scraper codziennie o 15:00 UTC (16:00 CET).

## 🔧 Wymagane kroki konfiguracji

### 1. Wygeneruj CRON_SECRET

Już wygenerowany powyżej:
```
0lN73xu+Akpjnua1t7z9HmQ3gjpyWYLomongcVn8gmc=
```

### 2. Dodaj secrets w GitHub

1. Otwórz: https://github.com/KobeeCloud/JobStack/settings/secrets/actions
2. Kliknij: **New repository secret**
3. Dodaj następujące secrets:

#### CRON_SECRET
```
0lN73xu+Akpjnua1t7z9HmQ3gjpyWYLomongcVn8gmc=
```

#### NEXT_PUBLIC_SUPABASE_URL
```
https://twoj-projekt.supabase.co
```

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJ... (twój anon key z Supabase)
```

#### SUPABASE_SERVICE_ROLE_KEY
```
eyJ... (twój service_role key z Supabase - SECRET!)
```

#### VERCEL_DEPLOYMENT_URL
```
https://jobstack.pl
```

### 3. Dodaj CRON_SECRET w Vercel

1. Otwórz: https://vercel.com/kobeeps-projects/jobstack-page/settings/environment-variables
2. Dodaj nową zmienną:
   - Name: `CRON_SECRET`
   - Value: `0lN73xu+Akpjnua1t7z9HmQ3gjpyWYLomongcVn8gmc=`
   - Environment: Production, Preview, Development

### 4. Włącz GitHub Actions

1. Otwórz: https://github.com/KobeeCloud/JobStack/settings/actions
2. Sprawdź czy Actions są włączone (General → Actions permissions)

## 🚀 Jak używać

### Automatyczne uruchamianie
- **Codziennie o 16:00 (CET)** - GitHub Actions automatycznie uruchomi scraper

### Ręczne uruchomienie
1. Otwórz: https://github.com/KobeeCloud/JobStack/actions
2. Wybierz workflow: **Job Scraper**
3. Kliknij: **Run workflow** → **Run workflow**

### Sprawdź logi
1. Otwórz: https://github.com/KobeeCloud/JobStack/actions
2. Kliknij na ostatnie uruchomienie workflow
3. Zobacz szczegółowe logi

## ✅ Weryfikacja

Po pierwszym uruchomieniu sprawdź:

1. **GitHub Actions log** - czy scraper się uruchomił
2. **Supabase** - czy pojawiły się nowe oferty:
   ```sql
   SELECT source, COUNT(*) as total, MAX(created_at) as last_scraped
   FROM public.jobs
   GROUP BY source;
   ```

## 🔒 Bezpieczeństwo

- ✅ CRON_SECRET chroni endpoint przed nieautoryzowanym dostępem
- ✅ Secrets są ukryte w GitHub Actions
- ✅ SUPABASE_SERVICE_ROLE_KEY nigdy nie jest commitowane do repo

## 📊 Harmonogram

- **15:00 UTC** (16:00 CET) - codziennie
- Możesz zmienić w `.github/workflows/scraper.yml`:
  ```yaml
  schedule:
    - cron: '0 15 * * *'  # Zmień godzinę tutaj
  ```

## 🛠️ Troubleshooting

### Workflow nie uruchamia się automatycznie
- Sprawdź czy Actions są włączone w repo
- Sprawdź czy secrets są dodane

### Błąd "Unauthorized"
- Sprawdź czy CRON_SECRET jest taki sam w GitHub i Vercel
- Sprawdź czy VERCEL_DEPLOYMENT_URL jest poprawny

### Brak ofert w bazie
- Sprawdź czy SUPABASE_SERVICE_ROLE_KEY jest poprawny
- Sprawdź logi w GitHub Actions
- Sprawdź logi w Vercel → Functions → /api/scrape
