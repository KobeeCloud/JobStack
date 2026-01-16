# JobStack - Audyt Prawny i Compliance

## 📋 Podsumowanie

| Obszar | Status | Uwagi |
|--------|--------|-------|
| **Polityka Prywatności (RODO)** | ✅ Zgodny | Kompletna, zawiera wszystkie wymagane elementy |
| **Regulamin (Terms of Service)** | ✅ Zgodny | Dobrze napisany, zawiera disclaimery |
| **Polityka Cookies** | ✅ Zgodny | Szczegółowa, kategoryzuje cookies |
| **Cookie Banner** | ✅ Dodany | Nowy komponent z możliwością wyboru |
| **Prawa użytkownika RODO** | ✅ Opisane | Art. 15-22 GDPR |
| **Scraping** | ⚠️ Wymaga uwagi | Patrz sekcja poniżej |

---

## ✅ Co Jest Dobrze

### 1. Polityka Prywatności (`/privacy`)
- ✅ Wskazany administrator danych (KobeeCloud)
- ✅ Podane podstawy prawne przetwarzania (Art. 6 GDPR)
- ✅ Lista zbieranych danych z podziałem na kategorie
- ✅ Informacje o odbiorcach danych (Supabase, Vercel, Google)
- ✅ Okresy przechowywania danych
- ✅ Prawa użytkownika (dostęp, sprostowanie, usunięcie, przenoszenie)
- ✅ Informacja o PUODO (organ nadzorczy)
- ✅ Kontakt privacy@jobstack.pl

### 2. Regulamin (`/terms`)
- ✅ Jasne określenie, że JobStack to agregator, nie pracodawca
- ✅ Disclaimer o braku odpowiedzialności za treść ogłoszeń
- ✅ Zasady publikacji ofert przez pracodawców
- ✅ Zakaz dyskryminacji w ogłoszeniach
- ✅ Informacja o prawie polskim jako właściwym
- ✅ Link do ODR dla konsumentów EU
- ✅ Ograniczenie odpowiedzialności (€100)

### 3. Polityka Cookies (`/cookies`)
- ✅ Wyjaśnienie czym są cookies
- ✅ Podział na kategorie (niezbędne, funkcjonalne, analityczne)
- ✅ Tabele z nazwami cookies i czasem życia
- ✅ Instrukcje jak wyłączyć cookies
- ✅ Podstawy prawne

### 4. Cookie Banner (NOWY)
- ✅ Wyświetla się przy pierwszej wizycie
- ✅ Możliwość akceptacji wszystkich
- ✅ Możliwość akceptacji tylko niezbędnych
- ✅ Możliwość dostosowania (granularne zgody)
- ✅ Zapisywanie wyboru w localStorage
- ✅ Zgodny z ePrivacy Directive

---

## ⚠️ Obszary Wymagające Uwagi

### 1. Scraping - Legalne, ale...

**Status: Prawnie dopuszczalny, ale wymaga ostrożności**

Twoje scrapery zbierają publiczne dane z:
- NoFluffJobs
- Pracuj.pl (IT subdomena)
- Bulldogjob
- RocketJobs

**Legalna podstawa:**
- ✅ Art. 34 Prawa Autorskiego - dozwolony użytek informacyjny
- ✅ Dyrektywa 96/9/WE - prawo do korzystania z baz danych
- ✅ TSUE C-30/14 - publiczne dane mogą być reużywane
- ✅ LinkedIn v. hiQ Labs - precedens dla scrapingu publicznych danych

**Rekomendacje:**

1. **Respektuj robots.txt** - sprawdź każdy portal:
   ```
   curl https://nofluffjobs.com/robots.txt
   curl https://it.pracuj.pl/robots.txt
   ```

2. **Dodaj User-Agent z kontaktem** - ✅ Już masz:
   ```
   JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)
   ```

3. **Stwórz stronę /bot** - Wyjaśnij kim jesteś:
   - Co scraper robi
   - Jak się z tobą skontaktować
   - Jak zażądać usunięcia z agregacji

4. **Rate limiting** - Nie przeciążaj serwerów:
   - Zalecane: 1 request / sekundę na portal
   - Scraping 1x dziennie (darmowy plan Vercel)

5. **Atrybucja źródła** - ✅ Już masz (source_url, source badge)

### 2. Brakujące Dane Firmy

W Privacy Policy i Terms of Service są placeholdery:
- `[Your business address]`
- `[Your tax ID]` (NIP)
- `[Your business number]` (REGON)

**Wymagane działanie:** Uzupełnij przed publikacją!

### 3. Rejestracja w CEIDG

Jeśli prowadzisz JDG, upewnij się że:
- ✅ Działalność jest zarejestrowana w CEIDG
- ✅ PKD obejmuje działalność informacyjną (np. 63.11.Z)
- ✅ NIP i REGON są aktualne

### 4. Google Analytics

Jeśli używasz Google Analytics:
- ✅ Cookie banner jest gotowy
- ⚠️ Skonfiguruj GA4 z IP anonymization
- ⚠️ Użyj `gtag('consent', 'default', { analytics_storage: 'denied' })`
- ⚠️ Dopiero po zgodzie: `gtag('consent', 'update', { analytics_storage: 'granted' })`

---

## 🔧 Co Zostało Zrobione

### Nowe Pliki/Komponenty:
1. **`/components/cookie-banner.tsx`** - Baner cookies z granularnymi zgodami
2. **Aktualizacja `app/layout.tsx`** - Dodanie CookieBanner do layoutu

### Istniejące Strony (bez zmian - dobrze napisane):
- `/privacy` - Polityka Prywatności
- `/terms` - Regulamin
- `/cookies` - Polityka Cookies

---

## 📝 Checklist przed Uruchomieniem

### Obowiązkowe:
- [ ] Uzupełnij adres firmy w Privacy Policy i Terms
- [ ] Uzupełnij NIP i REGON
- [ ] Stwórz stronę `/bot` dla scraperów
- [ ] Sprawdź robots.txt każdego scrapowanego portalu
- [ ] Skonfiguruj email privacy@jobstack.pl

### Zalecane:
- [ ] Dodaj SSL certificate (Vercel robi to automatycznie)
- [ ] Skonfiguruj Google Analytics 4 z consent mode
- [ ] Rozważ umowę powierzenia danych z Supabase (DPA)
- [ ] Przygotuj procedurę na żądania RODO (template odpowiedzi)

### Opcjonalne:
- [ ] Audyt bezpieczeństwa (penetration testing)
- [ ] Ubezpieczenie OC działalności
- [ ] Konsultacja z prawnikiem (szczególnie dla scrapingu)

---

## 📜 Podstawa Prawna Scrapingu

### Argumenty ZA legalnością:

1. **Publiczne dane** - Oferty pracy są publicznie dostępne, nie wymagają logowania
2. **Dozwolony użytek** - Art. 34 Prawa Autorskiego pozwala na korzystanie z utworów w celach informacyjnych
3. **Baza danych** - Dyrektywa 96/9/WE pozwala na ekstrakcję nieistotnych części bazy
4. **Precedensy**:
   - hiQ Labs v. LinkedIn (USA) - scraping publicznych danych jest legalny
   - TSUE C-30/14 - publiczne informacje mogą być reużywane

### Potencjalne Ryzyka:

1. **Naruszenie ToS portali** - Niektóre portale zabraniają scrapingu w regulaminie
   - Ryzyko: Blokada IP, wezwanie do zaprzestania
   - Mitigacja: Szanuj robots.txt, nie przeciążaj serwerów

2. **Prawo do bazy danych** - Jeśli pobierasz "istotną część" bazy
   - Ryzyko: Roszczenia producenta bazy danych
   - Mitigacja: Nie pobieraj wszystkich ofert, ogranicz zakres

3. **RODO** - Dane pracodawców/rekruterów mogą być danymi osobowymi
   - Ryzyko: Żądanie usunięcia
   - Mitigacja: Reaguj na żądania, miej procedurę

### Rekomendacja:

**Scraping publicznych ofert pracy jest prawnie dopuszczalny w Polsce**, o ile:
- Respektujesz robots.txt
- Nie przeciążasz serwerów (rate limiting)
- Podajesz źródło (atrybucja)
- Reagujesz na żądania usunięcia
- Nie kopiujesz całych baz danych (tylko agregacja)

---

## 🛡️ Zabezpieczenia Techniczne

### Już Wdrożone:
- ✅ HTTPS (Vercel)
- ✅ Row-Level Security w Supabase
- ✅ Hashowanie haseł (bcrypt)
- ✅ CSRF protection
- ✅ Middleware autoryzacji

### Do Rozważenia:
- [ ] Rate limiting na API (np. Upstash)
- [ ] WAF (Web Application Firewall)
- [ ] Regularne backupy bazy danych
- [ ] Monitoring bezpieczeństwa

---

## 📞 Kontakt Prawny

Dla pytań prawnych dotyczących JobStack:
- **Email:** legal@jobstack.pl
- **Privacy:** privacy@jobstack.pl

Dla skarg RODO:
- **PUODO:** kancelaria@uodo.gov.pl
- **ODR EU:** https://ec.europa.eu/consumers/odr/

---

*Raport wygenerowany: $(date)*
*Wersja: 1.0*

**Disclaimer:** Ten raport nie stanowi porady prawnej. Dla pełnej pewności prawnej zalecana jest konsultacja z prawnikiem specjalizującym się w prawie IT i RODO.
