import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polityka Prywatności',
  description: 'Polityka Prywatności serwisu JobStack — informacje o przetwarzaniu danych osobowych.',
}

import { getLocale } from 'next-intl/server'

// ... existing code ...

export default async function PrivacyPage() {
  const locale = await getLocale()
  const isPl = locale === 'pl'

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-primary hover:underline text-sm mb-8 inline-block">
          ← {isPl ? 'Powrót na stronę główną' : 'Back to home'}
        </Link>

        {isPl ? (
          <>
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Polityka <span className="text-primary">Prywatności</span>
            </h1>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              {/* 1. Administrator */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Administrator danych osobowych</h2>
                <p className="mb-4">
                  Administratorem danych osobowych przetwarzanych w związku z korzystaniem z serwisu JobStack jest:
                </p>
                <div className="bg-secondary/30 border border-border rounded-lg p-4">
                  <p className="mb-2"><strong className="text-foreground">Firma:</strong> KobeCloud Jakub Pospieszny</p>
                  <p className="mb-2"><strong className="text-foreground">Adres:</strong> ul. Mickiewicza 19, 84-242 Luzino, Polska</p>
                  <p className="mb-2"><strong className="text-foreground">NIP:</strong> 5882530612</p>
                  <p className="mb-2"><strong className="text-foreground">REGON:</strong> 541797979</p>
                  <p className="mb-2"><strong className="text-foreground">Forma prawna:</strong> Jednoosobowa działalność gospodarcza</p>
                  <p><strong className="text-foreground">Kontakt:</strong> kuba.pospieszny@gmail.com</p>
                </div>
              </section>

              {/* 2. Zakres danych */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Zakres zbieranych danych</h2>
                <p className="mb-4">W ramach korzystania z serwisu JobStack możemy zbierać następujące kategorie danych:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Dane konta:</strong> adres e-mail, hasło (w postaci zaszyfrowanej), identyfikator użytkownika</li>
                  <li><strong>Dane profilowe:</strong> imię i nazwisko, URL zdjęcia profilowego (opcjonalnie)</li>
                  <li><strong>Dane projektowe:</strong> diagramy infrastruktury, nazwy projektów, opisy, konfiguracje</li>
                  <li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, informacje o urządzeniu, logi serwera</li>
                  <li><strong>Dane organizacyjne:</strong> nazwy organizacji, informacje o członkostwie w zespołach</li>
                </ul>
              </section>

              {/* 3. Podstawa prawna */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Podstawa prawna przetwarzania</h2>
                <p className="mb-4">Dane osobowe przetwarzane są na podstawie:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Art. 6 ust. 1 lit. b) RODO</strong> — wykonanie umowy (świadczenie usługi JobStack)</li>
                  <li><strong>Art. 6 ust. 1 lit. a) RODO</strong> — zgoda użytkownika (cookies analityczne)</li>
                  <li><strong>Art. 6 ust. 1 lit. f) RODO</strong> — prawnie uzasadniony interes administratora (bezpieczeństwo, analityka)</li>
                  <li><strong>Art. 6 ust. 1 lit. c) RODO</strong> — wypełnienie obowiązku prawnego (np. księgowość)</li>
                </ul>
              </section>

              {/* 4. Cel przetwarzania */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cele przetwarzania danych</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Świadczenie usługi JobStack i zarządzanie kontem użytkownika</li>
                  <li>Uwierzytelnianie i autoryzacja dostępu</li>
                  <li>Przechowywanie projektów i diagramów infrastruktury</li>
                  <li>Zapewnienie bezpieczeństwa serwisu (rate limiting, logi)</li>
                  <li>Komunikacja z użytkownikiem (powiadomienia, wsparcie)</li>
                  <li>Poprawa jakości usług i analiza korzystania z serwisu</li>
                </ul>
              </section>

              {/* 5. Okres przechowywania */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Okres przechowywania danych</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Dane konta i projektowe:</strong> przez cały okres posiadania konta. Po usunięciu konta dane są usuwane w ciągu 30 dni.</li>
                  <li><strong>Dane techniczne (logi):</strong> przez okres nieprzekraczający 90 dni.</li>
                  <li><strong>Dane księgowe:</strong> przez okres wymagany przepisami prawa (5 lat).</li>
                  <li><strong>Dane marketingowe:</strong> do czasu cofnięcia zgody.</li>
                </ul>
              </section>

              {/* 6. Odbiorcy danych */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Odbiorcy danych</h2>
                <p className="mb-4">Dane mogą być udostępniane następującym kategoriom odbiorców:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Supabase Inc.</strong> (USA) — hosting bazy danych i uwierzytelnianie. Transfer danych do USA odbywa się na podstawie standardowych klauzul umownych (SCC).</li>
                  <li><strong>Vercel Inc.</strong> (USA) — hosting aplikacji. Transfer danych na podstawie SCC.</li>
                  <li><strong>Upstash</strong> — usługa rate-limiting (Redis). Przetwarzanie ograniczone do adresów IP.</li>
                  <li><strong>Sentry</strong> — monitoring błędów aplikacji (opcjonalnie).</li>
                  <li><strong>OpenAI</strong> (USA) — asystent AI (opcjonalnie, wyłącznie treści diagramów bez danych osobowych).</li>
                </ul>
              </section>

              {/* 7. Transfer danych */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Transfer danych poza EOG</h2>
                <p>
                  Dane osobowe mogą być przekazywane do krajów spoza Europejskiego Obszaru Gospodarczego (EOG),
                  w szczególności do USA, w związku z korzystaniem z usług Supabase, Vercel i OpenAI.
                  Transfer odbywa się na podstawie standardowych klauzul umownych (SCC) zgodnie z art. 46 ust. 2 lit. c) RODO
                  lub na podstawie decyzji Komisji Europejskiej o adekwatności ochrony (EU-U.S. Data Privacy Framework).
                </p>
              </section>

              {/* 8. Prawa użytkowników */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Prawa użytkowników (RODO)</h2>
                <p className="mb-4">Na mocy RODO przysługują Ci następujące prawa:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Prawo dostępu</strong> (art. 15 RODO) — możesz zażądać kopii swoich danych osobowych</li>
                  <li><strong>Prawo do sprostowania</strong> (art. 16 RODO) — możesz poprawić nieprawidłowe lub uzupełnić niekompletne dane</li>
                  <li><strong>Prawo do usunięcia</strong> (art. 17 RODO, &quot;prawo do bycia zapomnianym&quot;) — możesz zażądać usunięcia swoich danych</li>
                  <li><strong>Prawo do ograniczenia przetwarzania</strong> (art. 18 RODO)</li>
                  <li><strong>Prawo do przenoszenia danych</strong> (art. 20 RODO) — możesz otrzymać dane w ustrukturyzowanym formacie (JSON)</li>
                  <li><strong>Prawo do sprzeciwu</strong> (art. 21 RODO) — wobec przetwarzania na podstawie prawnie uzasadnionego interesu</li>
                  <li><strong>Prawo do cofnięcia zgody</strong> — w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania dokonanego przed cofnięciem</li>
                </ul>
                <p className="mt-4">
                  Aby skorzystać z powyższych praw, skontaktuj się z nami: <strong className="text-foreground">kuba.pospieszny@gmail.com</strong>
                </p>
                <p className="mt-2">
                  Odpowiedzi na żądania udzielamy w ciągu 30 dni od ich otrzymania.
                </p>
              </section>

              {/* 9. Prawo do skargi */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Prawo wniesienia skargi</h2>
                <p>
                  Masz prawo wniesienia skargi do organu nadzorczego — Prezesa Urzędu Ochrony Danych Osobowych (UODO),
                  ul. Stawki 2, 00-193 Warszawa, jeśli uważasz, że przetwarzanie Twoich danych osobowych narusza przepisy RODO.
                </p>
              </section>

              {/* 10. Pliki cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Pliki cookies</h2>
                <p className="mb-4">Serwis JobStack wykorzystuje następujące rodzaje plików cookies:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 border-b font-semibold text-foreground">Rodzaj</th>
                        <th className="text-left p-3 border-b font-semibold text-foreground">Cel</th>
                        <th className="text-left p-3 border-b font-semibold text-foreground">Czas przechowywania</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border-b">Niezbędne (sesja)</td>
                        <td className="p-3 border-b">Uwierzytelnianie, utrzymanie sesji</td>
                        <td className="p-3 border-b">Do końca sesji / 7 dni</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-b">Preferencje</td>
                        <td className="p-3 border-b">Zapamiętanie ustawień (motyw, zgoda cookies)</td>
                        <td className="p-3 border-b">1 rok</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-b">Analityczne (opcjonalne)</td>
                        <td className="p-3 border-b">Statystyki odwiedzin, analiza korzystania</td>
                        <td className="p-3 border-b">Do 2 lat</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  Możesz zarządzać plikami cookies w ustawieniach przeglądarki lub korzystając z banera cookies wyświetlanego przy pierwszej wizycie.
                </p>
              </section>

              {/* 11. Bezpieczeństwo */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Bezpieczeństwo danych</h2>
                <p>
                  Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony danych osobowych, w tym:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Szyfrowanie danych w transmisji (TLS/HTTPS)</li>
                  <li>Szyfrowanie haseł (bcrypt)</li>
                  <li>Row Level Security (RLS) w bazie danych</li>
                  <li>Rate limiting zapytań API</li>
                  <li>Regularne audyty bezpieczeństwa</li>
                </ul>
              </section>

              {/* 12. Zmiany */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Zmiany w Polityce Prywatności</h2>
                <p>
                  Administrator zastrzega sobie prawo do zmian w Polityce Prywatności. O istotnych zmianach
                  użytkownicy będą informowani drogą mailową lub poprzez komunikat w serwisie.
                  Korzystanie z serwisu po wprowadzeniu zmian oznacza ich akceptację.
                </p>
              </section>

              <section className="border-t pt-6">
                <p className="text-sm text-muted-foreground/70">
                  Ostatnia aktualizacja: 7 lutego 2026 r.
                </p>
              </section>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Privacy <span className="text-primary">Policy</span>
            </h1>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              {/* 1. Data Controller */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Data Controller</h2>
                <p className="mb-4">
                  The controller of personal data processed in connection with the use of the JobStack service is:
                </p>
                <div className="bg-secondary/30 border border-border rounded-lg p-4">
                  <p className="mb-2"><strong className="text-foreground">Company:</strong> KobeCloud Jakub Pospieszny</p>
                  <p className="mb-2"><strong className="text-foreground">Address:</strong> ul. Mickiewicza 19, 84-242 Luzino, Poland</p>
                  <p className="mb-2"><strong className="text-foreground">VAT ID:</strong> 5882530612</p>
                  <p className="mb-2"><strong className="text-foreground">REGON:</strong> 541797979</p>
                  <p className="mb-2"><strong className="text-foreground">Legal Form:</strong> Sole Proprietorship</p>
                  <p><strong className="text-foreground">Contact:</strong> kuba.pospieszny@gmail.com</p>
                </div>
              </section>

              {/* 2. Scope of Data */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Scope of Collected Data</h2>
                <p className="mb-4">When using the JobStack service, we may collect the following data categories:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account Data:</strong> email address, password (encrypted), user identifier</li>
                  <li><strong>Profile Data:</strong> full name, profile picture URL (optional)</li>
                  <li><strong>Project Data:</strong> infrastructure diagrams, project names, descriptions, configurations</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information, server logs</li>
                  <li><strong>Organizational Data:</strong> organization names, team membership info</li>
                </ul>
              </section>

              {/* 3. Legal Basis */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Legal Basis for Processing</h2>
                <p className="mb-4">Personal data is processed based on:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Art. 6(1)(b) GDPR</strong> — performance of a contract (provision of the JobStack service)</li>
                  <li><strong>Art. 6(1)(a) GDPR</strong> — user consent (analytics cookies)</li>
                  <li><strong>Art. 6(1)(f) GDPR</strong> — legitimate interest of the controller (security, analytics)</li>
                  <li><strong>Art. 6(1)(c) GDPR</strong> — compliance with a legal obligation (e.g., accounting)</li>
                </ul>
              </section>

              {/* 4. Purposes of Processing */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Purposes of Data Processing</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Providing the JobStack service and user account management</li>
                  <li>Authentication and access authorization</li>
                  <li>Storing projects and infrastructure diagrams</li>
                  <li>Ensuring service security (rate limiting, logs)</li>
                  <li>Communication with the user (notifications, support)</li>
                  <li>Improving service quality and analyzing service usage</li>
                </ul>
              </section>

              {/* 5. Retention Period */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Retention Period</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account and Project Data:</strong> for the entire duration of the account. Upon account deletion, data is removed within 30 days.</li>
                  <li><strong>Technical Data (logs):</strong> for a period not exceeding 90 days.</li>
                  <li><strong>Accounting Data:</strong> for the period required by law (5 years).</li>
                  <li><strong>Marketing Data:</strong> until consent is withdrawn.</li>
                </ul>
              </section>

              {/* 6. Data Recipients */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Recipients</h2>
                <p className="mb-4">Data may be shared with the following categories of recipients:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Supabase Inc.</strong> (USA) — database hosting and authentication. Data transfer to the USA is based on Standard Contractual Clauses (SCC).</li>
                  <li><strong>Vercel Inc.</strong> (USA) — application hosting. Data transfer based on SCC.</li>
                  <li><strong>Upstash</strong> — rate-limiting service (Redis). Processing is limited to IP addresses.</li>
                  <li><strong>Sentry</strong> — application error monitoring (optional).</li>
                  <li><strong>OpenAI</strong> (USA) — AI Assistant (optional, only diagram contents without personal data).</li>
                </ul>
              </section>

              {/* 7. Data Transfer */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Transfer outside the EEA</h2>
                <p>
                  Personal data may be transferred to countries outside the European Economic Area (EEA),
                  particularly to the USA, in connection with the use of Supabase, Vercel, and OpenAI services.
                  The transfer is based on Standard Contractual Clauses (SCC) pursuant to Art. 46(2)(c) GDPR
                  or based on the European Commission's adequacy decision (EU-U.S. Data Privacy Framework).
                </p>
              </section>

              {/* 8. User Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. User Rights (GDPR)</h2>
                <p className="mb-4">Under the GDPR, you have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Right of access</strong> (Art. 15 GDPR) — you can request a copy of your personal data</li>
                  <li><strong>Right to rectification</strong> (Art. 16 GDPR) — you can correct inaccurate or complete incomplete data</li>
                  <li><strong>Right to erasure</strong> (Art. 17 GDPR, &quot;right to be forgotten&quot;) — you can request the deletion of your data</li>
                  <li><strong>Right to restriction of processing</strong> (Art. 18 GDPR)</li>
                  <li><strong>Right to data portability</strong> (Art. 20 GDPR) — you can receive data in a structured format (JSON)</li>
                  <li><strong>Right to object</strong> (Art. 21 GDPR) — to processing based on a legitimate interest</li>
                  <li><strong>Right to withdraw consent</strong> — at any time, without affecting the lawfulness of processing based on consent before its withdrawal</li>
                </ul>
                <p className="mt-4">
                  To exercise the above rights, please contact us at: <strong className="text-foreground">kuba.pospieszny@gmail.com</strong>
                </p>
                <p className="mt-2">
                  We respond to requests within 30 days of receipt.
                </p>
              </section>

              {/* 9. Right to Lodge a Complaint */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Right to Lodge a Complaint</h2>
                <p>
                  You have the right to lodge a complaint with a supervisory authority if you believe that the processing of your personal data violates GDPR provisions.
                </p>
              </section>

              {/* 10. Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cookies</h2>
                <p className="mb-4">The JobStack service uses the following types of cookies:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 border-b font-semibold text-foreground">Type</th>
                        <th className="text-left p-3 border-b font-semibold text-foreground">Purpose</th>
                        <th className="text-left p-3 border-b font-semibold text-foreground">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border-b">Necessary (session)</td>
                        <td className="p-3 border-b">Authentication, session maintenance</td>
                        <td className="p-3 border-b">End of session / 7 days</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-b">Preferences</td>
                        <td className="p-3 border-b">Remembering settings (theme, cookie consent)</td>
                        <td className="p-3 border-b">1 year</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-b">Analytics (optional)</td>
                        <td className="p-3 border-b">Visit statistics, usage analysis</td>
                        <td className="p-3 border-b">Up to 2 years</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  You can manage cookies in your browser settings or by using the cookie banner displayed on your first visit.
                </p>
              </section>

              {/* 11. Security */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect personal data, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Data encryption in transit (TLS/HTTPS)</li>
                  <li>Password encryption (bcrypt)</li>
                  <li>Row Level Security (RLS) in the database</li>
                  <li>API request rate limiting</li>
                  <li>Regular security audits</li>
                </ul>
              </section>

              {/* 12. Changes */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to the Privacy Policy</h2>
                <p>
                  The Controller reserves the right to change the Privacy Policy. Users will be informed of significant changes via email or through an announcement in the service.
                  Using the service after the changes have been introduced constitutes their acceptance.
                </p>
              </section>

              <section className="border-t pt-6">
                <p className="text-sm text-muted-foreground/70">
                  Last updated: February 7, 2026
                </p>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
