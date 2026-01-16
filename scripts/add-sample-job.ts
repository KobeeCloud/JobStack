#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

// Load env vars from .env.local
import { readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    const [, key, value] = match;
    process.env[key.trim()] = value.trim();
  }
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addSampleJob() {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 60);

  const jobData = {
    title: 'Senior Full-Stack Developer (Next.js + TypeScript)',
    company_name: 'KobeCloud - Jakub Pospieszny',
    company_logo: 'https://avatars.githubusercontent.com/u/12345678?v=4',
    location: 'Gdańsk / Remote',
    remote: true,
    salary_min: 15000,
    salary_max: 22000,
    salary_currency: 'PLN',
    tech_stack: ['TypeScript', 'Next.js 15', 'React', 'TailwindCSS', 'PostgreSQL', 'Supabase', 'Node.js', 'Git'],
    description: `Szukamy doświadczonego Full-Stack Developera do pracy nad innowacyjnymi projektami. Będziesz odpowiedzialny za rozwój nowoczesnych aplikacji webowych wykorzystujących najnowsze technologie.

Pracujemy w małym, zgranym zespole, gdzie Twój głos ma znaczenie. Oferujemy elastyczne godziny pracy, możliwość pracy zdalnej oraz ciekawe projekty dla polskich i zagranicznych klientów.

Nasze projekty to m.in.: systemy zarządzania infrastrukturą, platformy agregacji danych, oraz narzędzia dla developerów.

**Twoje obowiązki:**
- Projektowanie i rozwój aplikacji webowych w Next.js 15 + TypeScript
- Implementacja responsywnych interfejsów użytkownika z React i TailwindCSS
- Integracja z bazami danych PostgreSQL i Supabase
- Współpraca z zespołem przy planowaniu architektury systemów
- Code review i mentoring junior developerów
- Optymalizacja wydajności aplikacji

**Projekt który właśnie rozwijamy:**
JobStack - platforma agregująca oferty pracy z największych polskich portali rekrutacyjnych. Next.js 15, Supabase, Vercel, real-time scrapers.`,
    requirements: [
      'Minimum 5 lat doświadczenia komercyjnego jako Full-Stack Developer',
      'Bardzo dobra znajomość TypeScript i JavaScript (ES6+)',
      'Doświadczenie z Next.js 14/15 (App Router, Server Components, Server Actions)',
      'Znajomość React oraz nowoczesnych hooków (useState, useEffect, useCallback, useMemo)',
      'Doświadczenie z TailwindCSS lub innymi utility-first CSS frameworks',
      'Znajomość PostgreSQL i relacyjnych baz danych (normalizacja, indeksy, optymalizacja)',
      'Doświadczenie z Supabase, Firebase lub podobnymi BaaS platformami',
      'Znajomość Git i GitHub/GitLab (branches, PRs, CI/CD)',
      'Umiejętność pisania czystego, testowalnego kodu (unit tests, integration tests)',
      'Komunikatywność i umiejętność pracy w zespole',
      'Samodzielność i proaktywne podejście do rozwiązywania problemów',
      'Mile widziane: doświadczenie z Docker, Kubernetes, CI/CD pipelines',
      'Mile widziane: znajomość Python, Go lub innych języków backendowych',
      'Mile widziane: doświadczenie z Grafana, Prometheus, monitoring'
    ],
    benefits: [
      '💰 Wynagrodzenie: 15 000 - 22 000 PLN netto (B2B)',
      '🏠 100% praca zdalna lub hybrydowa (biuro w Gdańsku przy ul. Mickiewicza 19)',
      '⏰ Elastyczne godziny pracy (core hours 10:00-15:00)',
      '📚 Budżet szkoleniowy 3000 PLN/rok na kursy, konferencje, książki',
      '💻 Najnowszy sprzęt do wyboru (MacBook Pro M3 / custom PC)',
      '🌴 26 dni urlopu (możliwość dodatkowych dni po roku pracy)',
      '🚀 Praca nad ciekawymi projektami Open Source',
      '📈 Jasna ścieżka kariery i podwyżek (review co 6 miesięcy)',
      '🎮 Integracje teamowe (gaming nights, paintball, escape roomy, spotkania w biurze)',
      '☕ Kawa, herbata i przekąski w biurze',
      '🏥 Możliwość dofinansowania prywatnej opieki medycznej',
      '🏋️ Karta Multisport lub Benefit Systems',
      '🎓 Udział w konferencjach branżowych (React Summit, Next.js Conf)',
      '🤝 Przyjazna atmosfera w małym zespole (5-8 osób)'
    ],
    source: 'native',
    source_url: 'https://jobstack-page-naeyzapj1-kobeeps-projects.vercel.app',
    source_id: 'sample-kobecloud-001',
    featured: true,
    published_at: new Date().toISOString(),
    expires_at: expiryDate.toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert(jobData)
    .select()
    .single();

  if (error) {
    console.error('Error adding sample job:', error);
    process.exit(1);
  }

  console.log('✅ Sample job added successfully!');
  console.log('Job ID:', data.id);
  console.log('View at: https://jobstack-page-naeyzapj1-kobeeps-projects.vercel.app/jobs/' + data.id);
  process.exit(0);
}

addSampleJob();
