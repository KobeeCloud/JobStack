import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulamin',
  description: 'Regulamin świadczenia usług drogą elektroniczną serwisu JobStack.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-primary hover:underline text-sm mb-8 inline-block">
          ← Powrót na stronę główną
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-8">
          Regulamin <span className="text-primary">Serwisu</span>
        </h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          {/* 1. Postanowienia ogólne */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§1. Postanowienia ogólne</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Niniejszy Regulamin określa zasady świadczenia usług drogą elektroniczną przez serwis JobStack.</li>
              <li>Regulamin jest regulaminem, o którym mowa w art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.</li>
              <li>Korzystanie z serwisu oznacza akceptację niniejszego Regulaminu.</li>
            </ol>
          </section>

          {/* 2. Definicje */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§2. Definicje</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Usługodawca</strong> — KobeCloud Jakub Pospieszny, ul. Mickiewicza 19, 84-242 Luzino, NIP: 5882530612, REGON: 541797979</li>
              <li><strong>Serwis</strong> — aplikacja internetowa JobStack dostępna pod adresem jobstack.app</li>
              <li><strong>Użytkownik</strong> — osoba fizyczna, prawna lub jednostka organizacyjna korzystająca z Serwisu</li>
              <li><strong>Konto</strong> — indywidualne konto Użytkownika w Serwisie, tworzone w procesie rejestracji</li>
              <li><strong>Usługa</strong> — usługa świadczona drogą elektroniczną przez Usługodawcę za pośrednictwem Serwisu</li>
              <li><strong>Projekt</strong> — diagram infrastruktury chmurowej tworzony przez Użytkownika w Serwisie</li>
            </ul>
          </section>

          {/* 3. Usługodawca */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§3. Dane Usługodawcy</h2>
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <p className="mb-2"><strong className="text-foreground">Firma:</strong> KobeCloud Jakub Pospieszny</p>
              <p className="mb-2"><strong className="text-foreground">Adres:</strong> ul. Mickiewicza 19, 84-242 Luzino, Polska</p>
              <p className="mb-2"><strong className="text-foreground">NIP:</strong> 5882530612</p>
              <p className="mb-2"><strong className="text-foreground">REGON:</strong> 541797979</p>
              <p><strong className="text-foreground">Kontakt:</strong> kuba.pospieszny@gmail.com</p>
            </div>
          </section>

          {/* 4. Rodzaj i zakres usług */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§4. Rodzaj i zakres usług</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Usługodawca świadczy następujące usługi drogą elektroniczną:
                <ul className="list-disc list-inside space-y-1 ml-8 mt-2">
                  <li>Wizualne projektowanie infrastruktury chmurowej (edytor diagramów)</li>
                  <li>Generowanie kodu Terraform na podstawie diagramów</li>
                  <li>Szacowanie kosztów infrastruktury</li>
                  <li>Skanowanie zgodności (compliance) projektów</li>
                  <li>Asystent AI do analizy architektury</li>
                  <li>Współpraca zespołowa w ramach organizacji</li>
                  <li>Eksport diagramów w różnych formatach</li>
                </ul>
              </li>
              <li>Usługi świadczone są w planie darmowym (Free) oraz odpłatnych planach Pro i Enterprise.</li>
              <li>Szczegółowy zakres funkcji w poszczególnych planach opisany jest na stronie głównej Serwisu.</li>
            </ol>
          </section>

          {/* 5. Warunki techniczne */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§5. Wymagania techniczne</h2>
            <p className="mb-4">Do korzystania z Serwisu wymagane jest:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Urządzenie z dostępem do sieci Internet</li>
              <li>Aktualna przeglądarka internetowa (Chrome, Firefox, Safari, Edge)</li>
              <li>Włączona obsługa JavaScript</li>
              <li>Włączona obsługa plików cookies (niezbędne do uwierzytelniania)</li>
              <li>Aktywne konto e-mail (do rejestracji i weryfikacji)</li>
            </ul>
          </section>

          {/* 6. Rejestracja */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§6. Rejestracja i Konto</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Rejestracja w Serwisie jest dobrowolna i bezpłatna.</li>
              <li>Rejestracja odbywa się poprzez podanie adresu e-mail i hasła lub za pośrednictwem konta GitHub (OAuth).</li>
              <li>Użytkownik zobowiązuje się do podania prawdziwych danych.</li>
              <li>Każdy Użytkownik może posiadać tylko jedno Konto.</li>
              <li>Użytkownik jest odpowiedzialny za zachowanie poufności swojego hasła.</li>
              <li>Usługodawca zastrzega sobie prawo do zawieszenia lub usunięcia Konta w przypadku naruszenia Regulaminu.</li>
            </ol>
          </section>

          {/* 7. Obowiązki użytkownika */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§7. Obowiązki Użytkownika</h2>
            <p className="mb-4">Użytkownik zobowiązuje się do:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Korzystania z Serwisu zgodnie z obowiązującym prawem polskim i UE</li>
              <li>Niezamieszczania treści bezprawnych, obraźliwych lub naruszających prawa osób trzecich</li>
              <li>Niepodejmowania prób nieautoryzowanego dostępu do Serwisu</li>
              <li>Nieobciążania infrastruktury Serwisu w sposób nieproporcjonalny</li>
              <li>Niekorzystania z Serwisu w celach sprzecznych z jego przeznaczeniem</li>
            </ul>
          </section>

          {/* 8. Własność intelektualna */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§8. Własność intelektualna</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Użytkownik zachowuje pełne prawa autorskie do treści (projektów, diagramów) tworzonych w Serwisie.</li>
              <li>Serwis JobStack, jego kod źródłowy, szata graficzna i logotyp są własnością Usługodawcy i podlegają ochronie prawnej.</li>
              <li>Wygenerowany kod Terraform jest dostarczany &quot;tak jak jest&quot; (as-is) i powinien zostać zweryfikowany przed wdrożeniem produkcyjnym.</li>
              <li>Usługodawca nie ponosi odpowiedzialności za koszty zasobów chmurowych powstałe w wyniku wdrożenia wygenerowanego kodu.</li>
            </ol>
          </section>

          {/* 9. Odpowiedzialność */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§9. Odpowiedzialność</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Usługodawca dokłada wszelkich starań w celu zapewnienia prawidłowego działania Serwisu.</li>
              <li>Usługodawca nie ponosi odpowiedzialności za:
                <ul className="list-disc list-inside space-y-1 ml-8 mt-2">
                  <li>Przerwy w działaniu Serwisu wynikające z przyczyn niezależnych od Usługodawcy</li>
                  <li>Szkody wynikające z nieprawidłowego korzystania z Serwisu</li>
                  <li>Skutki wdrożenia wygenerowanego kodu Terraform bez jego uprzedniej weryfikacji</li>
                  <li>Koszty zasobów chmurowych utworzonych na podstawie diagramów i kodu</li>
                  <li>Utratę danych spowodowaną działaniem siły wyższej</li>
                </ul>
              </li>
              <li>Serwis w fazie beta testing nie gwarantuje pełnej dostępności i stabilności.</li>
            </ol>
          </section>

          {/* 10. Prawo odstąpienia */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§10. Prawo odstąpienia od umowy</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Użytkownik będący konsumentem ma prawo odstąpienia od umowy o świadczenie usług drogą elektroniczną w terminie 14 dni od dnia zawarcia umowy, bez podawania przyczyny (art. 27 ustawy o prawach konsumenta).</li>
              <li>Aby skorzystać z prawa odstąpienia, należy złożyć jednoznaczne oświadczenie na adres: kuba.pospieszny@gmail.com</li>
              <li>Prawo odstąpienia nie przysługuje, jeżeli usługa została w pełni wykonana za wyraźną zgodą konsumenta, który został poinformowany przed rozpoczęciem świadczenia, że utraci prawo odstąpienia.</li>
            </ol>
          </section>

          {/* 11. Reklamacje */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§11. Reklamacje</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Reklamacje dotyczące działania Serwisu można składać na adres: kuba.pospieszny@gmail.com</li>
              <li>Reklamacja powinna zawierać: imię i nazwisko, adres e-mail, opis problemu.</li>
              <li>Usługodawca rozpatrzy reklamację w terminie 14 dni od jej otrzymania.</li>
              <li>Użytkownik będący konsumentem może skorzystać z pozasądowych sposobów rozpatrywania reklamacji, w tym z platformy ODR: <a href="https://ec.europa.eu/consumers/odr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a></li>
            </ol>
          </section>

          {/* 12. Rozwiązanie umowy */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§12. Rozwiązanie umowy</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Użytkownik może w każdej chwili rozwiązać umowę poprzez usunięcie swojego Konta w ustawieniach Serwisu.</li>
              <li>Usługodawca może rozwiązać umowę w przypadku rażącego naruszenia Regulaminu, po uprzednim wezwaniu do zaniechania naruszeń.</li>
              <li>Po rozwiązaniu umowy dane Użytkownika zostaną usunięte zgodnie z Polityką Prywatności.</li>
            </ol>
          </section>

          {/* 13. Ochrona danych osobowych */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§13. Ochrona danych osobowych</h2>
            <p>
              Zasady przetwarzania danych osobowych określone są w{' '}
              <Link href="/privacy" className="text-primary hover:underline">Polityce Prywatności</Link>,
              stanowiącej integralną część niniejszego Regulaminu.
            </p>
          </section>

          {/* 14. Prawo właściwe */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§14. Prawo właściwe i rozstrzyganie sporów</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Regulamin podlega prawu polskiemu.</li>
              <li>Spory będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy, z zastrzeżeniem obowiązujących przepisów o właściwości sądów dla konsumentów.</li>
              <li>W przypadku Użytkowników będących konsumentami z krajów UE zastosowanie mają również przepisy ochronne prawa państwa ich zamieszkania (art. 6 Rozporządzenia Rzym I).</li>
            </ol>
          </section>

          {/* 15. Postanowienia końcowe */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">§15. Postanowienia końcowe</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Usługodawca zastrzega sobie prawo do zmian Regulaminu. O zmianach Użytkownicy zostaną powiadomieni z 14-dniowym wyprzedzeniem.</li>
              <li>Regulamin wchodzi w życie z dniem opublikowania w Serwisie.</li>
              <li>Jeśli którekolwiek z postanowień Regulaminu okaże się nieważne, pozostałe postanowienia zachowują moc.</li>
            </ol>
          </section>

          <section className="border-t pt-6">
            <p className="text-sm text-muted-foreground/70">
              Ostatnia aktualizacja: 7 lutego 2026 r.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
