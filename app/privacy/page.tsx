'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ArrowLeft, FileText, Cookie, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Powrót do strony głównej
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12 prose prose-blue dark:prose-invert max-w-none">
            <h1>Polityka Prywatności (Privacy Policy)</h1>
            <p className="text-sm text-gray-500">Ostatnia aktualizacja: 16 stycznia 2026</p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4">
            <p className="font-bold">RODO/GDPR Compliance Statement</p>
            <p>This Privacy Policy complies with:</p>
            <ul>
              <li><strong>RODO</strong> (Rozporządzenie o Ochronie Danych Osobowych) - EU GDPR</li>
              <li><strong>Polish Act on Personal Data Protection</strong></li>
              <li><strong>ePrivacy Directive</strong> (Cookie Law)</li>
            </ul>
          </div>

          <h2>1. Data Controller (Administrator Danych)</h2>
          <p>
            <strong>Name:</strong> JobStack / KobeeCloud<br />
            <strong>Business Type:</strong> Jednoosobowa Działalność Gospodarcza (JDG)<br />
            <strong>Address:</strong> [Your business address]<br />
            <strong>NIP:</strong> [Your tax ID]<br />
            <strong>Email:</strong> <a href="mailto:privacy@jobstack.pl" className="text-blue-600 hover:underline">privacy@jobstack.pl</a>
          </p>

          <h2>2. What Data We Collect</h2>

          <h3>2.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li><strong>Email address</strong> (required)</li>
            <li><strong>Password</strong> (hashed, never stored in plain text)</li>
            <li><strong>User role</strong> (candidate or employer)</li>
            <li><strong>Full name</strong> (optional for candidates, required for employers)</li>
            <li><strong>Company information</strong> (for employers only)</li>
          </ul>
          <p><strong>Legal Basis:</strong> Contract (Article 6(1)(b) GDPR) - necessary to provide the service</p>

          <h3>2.2 Profile Information</h3>
          <p>Candidates may optionally provide:</p>
          <ul>
            <li>Resume/CV</li>
            <li>Skills</li>
            <li>Work experience</li>
            <li>Location preferences</li>
          </ul>
          <p><strong>Legal Basis:</strong> Consent (Article 6(1)(a) GDPR)</p>

          <h3>2.3 Automatically Collected Data</h3>
          <p>We automatically collect:</p>
          <ul>
            <li><strong>IP address</strong> (for security and analytics)</li>
            <li><strong>Browser type and version</strong></li>
            <li><strong>Device information</strong></li>
            <li><strong>Pages visited</strong></li>
            <li><strong>Time spent on site</strong></li>
            <li><strong>Referral source</strong></li>
          </ul>
          <p><strong>Legal Basis:</strong> Legitimate Interest (Article 6(1)(f) GDPR) - to improve service and prevent abuse</p>

          <h3>2.4 Cookies</h3>
          <p>
            We use cookies for authentication, preferences, and analytics.
            See our <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link> for details.
          </p>

          <h2>3. How We Use Your Data</h2>
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Purpose</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Legal Basis</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Data Used</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Provide account access</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Contract</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Email, password</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Job recommendations</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Consent</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Profile, preferences</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Email alerts</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Consent</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Email, search criteria</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Improve service</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Legitimate Interest</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Usage analytics</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Prevent fraud</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Legitimate Interest</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">IP address, behavior</td>
              </tr>
            </tbody>
          </table>

          <h2>4. Data Sharing & Recipients</h2>
          <p>We share data with:</p>

          <h3>Supabase (Database & Authentication)</h3>
          <ul>
            <li><strong>Purpose:</strong> Data storage and authentication</li>
            <li><strong>Location:</strong> EU (Frankfurt, Germany)</li>
            <li><strong>GDPR Compliant:</strong> Yes</li>
            <li><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://supabase.com/privacy</a></li>
          </ul>

          <h3>Vercel (Hosting)</h3>
          <ul>
            <li><strong>Purpose:</strong> Website hosting</li>
            <li><strong>Location:</strong> EU (Frankfurt, Germany)</li>
            <li><strong>GDPR Compliant:</strong> Yes</li>
            <li><strong>Privacy Policy:</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://vercel.com/legal/privacy-policy</a></li>
          </ul>

          <h3>Google OAuth (Optional Login)</h3>
          <ul>
            <li><strong>Purpose:</strong> Authentication</li>
            <li><strong>Data:</strong> Email, name (only if you choose Google login)</li>
            <li><strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/privacy</a></li>
          </ul>

          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-4">
            <p className="font-bold">We Do NOT:</p>
            <ul>
              <li>❌ Sell your data to third parties</li>
              <li>❌ Share your data with advertisers</li>
              <li>❌ Use your data for purposes other than stated</li>
              <li>❌ Transfer data outside EU without adequate safeguards</li>
            </ul>
          </div>

          <h2>5. Data Retention</h2>
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Data Type</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Retention Period</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Active accounts</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Until deletion</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Service provision</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Inactive accounts</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">2 years</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">RODO Article 17</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Server logs</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">90 days</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Security</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Analytics</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">14 months</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Default</td>
              </tr>
            </tbody>
          </table>

          <h2>6. Your Rights Under RODO/GDPR</h2>
          <p>You have the following rights:</p>

          <h3>Right of Access (Article 15 GDPR)</h3>
          <p>Request a copy of all data we hold about you.</p>
          <p><strong>How:</strong> Email <a href="mailto:privacy@jobstack.pl" className="text-blue-600 hover:underline">privacy@jobstack.pl</a> with subject "RODO: Access Request"</p>
          <p><strong>Timeline:</strong> We respond within <strong>30 days</strong></p>

          <h3>Right to Rectification (Article 16 GDPR)</h3>
          <p>Correct inaccurate or incomplete data.</p>
          <p><strong>How:</strong> Update in your account settings or email us</p>

          <h3>Right to Erasure / "Right to be Forgotten" (Article 17 GDPR)</h3>
          <p>Request deletion of your data.</p>
          <p><strong>How:</strong> Delete your account or email <a href="mailto:privacy@jobstack.pl" className="text-blue-600 hover:underline">privacy@jobstack.pl</a></p>

          <h3>Right to Data Portability (Article 20 GDPR)</h3>
          <p>Receive your data in a structured, machine-readable format (JSON, CSV).</p>

          <h3>Right to Lodge a Complaint</h3>
          <p>If you believe we violated RODO, you can complain to:</p>
          <p>
            <strong>Polish Supervisory Authority (PUODO):</strong><br />
            Urząd Ochrony Danych Osobowych<br />
            ul. Stawki 2, 00-193 Warszawa<br />
            Phone: +48 22 531 03 00<br />
            Email: kancelaria@uodo.gov.pl<br />
            Website: <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://uodo.gov.pl</a>
          </p>

          <h2>7. Data Security</h2>
          <p>We protect your data with:</p>
          <ul>
            <li>✅ <strong>Encryption in transit</strong> (HTTPS/TLS)</li>
            <li>✅ <strong>Encryption at rest</strong> (database encryption)</li>
            <li>✅ <strong>Password hashing</strong> (bcrypt)</li>
            <li>✅ <strong>API authentication</strong> (API keys, sessions)</li>
            <li>✅ <strong>Row-Level Security (RLS)</strong> in database</li>
          </ul>
          <p><strong>Note:</strong> No method is 100% secure. We cannot guarantee absolute security.</p>

          <h2>8. Children's Privacy</h2>
          <p>JobStack is <strong>NOT intended for children under 16</strong>.</p>
          <p>We do NOT knowingly collect data from children. If you believe we have data from a child, contact us immediately.</p>

          <h2>9. Contact Us</h2>
          <p>For privacy questions or to exercise your rights:</p>
          <p>
            <strong>Email:</strong> <a href="mailto:privacy@jobstack.pl" className="text-blue-600 hover:underline">privacy@jobstack.pl</a><br />
            <strong>Subject:</strong> Start with "RODO:" for faster processing<br />
            <strong>Response time:</strong> 30 days
          </p>

          <hr className="my-8" />

          <p className="text-center font-bold">
            By using JobStack, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <strong>Last Updated:</strong> January 16, 2026<br />
            <strong>Version:</strong> 1.0
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/terms">
              <Button variant="outline" className="rounded-xl border-gray-300 dark:border-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                Regulamin
              </Button>
            </Link>
            <Link href="/cookies">
              <Button variant="outline" className="rounded-xl border-gray-300 dark:border-gray-600">
                <Cookie className="w-4 h-4 mr-2" />
                Polityka Cookies
              </Button>
            </Link>
            <Link href="/">
              <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Powrót do strony głównej
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
