import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              JobStack
            </Link>
            <div className="flex gap-4">
              <Link href="/jobs">
                <Button variant="ghost">Browse Jobs</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 prose prose-blue dark:prose-invert max-w-none">
          <h1>Cookie Policy (Polityka Cookies)</h1>
          <p className="text-sm text-muted-foreground">Last Updated: January 16, 2026</p>

          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit a website.
            They help websites remember your preferences and improve your experience.
          </p>
          <p><strong>Legal Basis:</strong> ePrivacy Directive (Cookie Law) & RODO Article 6(1)(a) (Consent)</p>

          <h2>Cookies We Use</h2>

          <h3>1. Essential Cookies (Required)</h3>
          <p><strong>Purpose:</strong> Make the website work properly</p>
          <p><strong>Can you disable them?</strong> ❌ No - without these, the site won't function</p>

          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Cookie Name</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Purpose</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Duration</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Provider</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">sb-access-token</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Authentication (keeps you logged in)</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">1 hour</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Supabase</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">sb-refresh-token</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Session refresh</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">7 days</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Supabase</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">auth-session</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Session management</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Session</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">JobStack</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">XSRF-TOKEN</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Security (prevent CSRF attacks)</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Session</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">JobStack</td>
              </tr>
            </tbody>
          </table>

          <p><strong>Legal Basis:</strong> Legitimate Interest (Article 6(1)(f) GDPR) - necessary for service</p>

          <h3>2. Functional Cookies (Optional)</h3>
          <p><strong>Purpose:</strong> Remember your preferences</p>
          <p><strong>Can you disable them?</strong> ✅ Yes</p>

          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Cookie Name</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Purpose</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">user-preferences</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Language, theme, filters</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">1 year</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">search-history</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Remember recent searches</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">30 days</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">cookie-consent</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Remember your cookie choice</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">1 year</td>
              </tr>
            </tbody>
          </table>

          <h3>3. Analytics Cookies (Optional)</h3>
          <p><strong>Purpose:</strong> Understand how you use the site (improve service)</p>
          <p><strong>Can you disable them?</strong> ✅ Yes</p>

          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Cookie Name</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Purpose</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">_ga</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Google Analytics - User ID</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">2 years</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">_ga_*</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Google Analytics - Session</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">2 years</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-2">_gid</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Google Analytics - User ID</td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">24 hours</td>
              </tr>
            </tbody>
          </table>

          <p><strong>Data Collected:</strong></p>
          <ul>
            <li>Pages visited</li>
            <li>Time spent on site</li>
            <li>Device type</li>
            <li>Location (city level, NOT precise)</li>
            <li>Referral source</li>
          </ul>

          <p><strong>Privacy:</strong></p>
          <ul>
            <li>IP addresses are anonymized</li>
            <li>No personal identification</li>
          </ul>

          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-4">
            <p className="font-bold">We Do NOT Use:</p>
            <ul>
              <li>❌ Advertising cookies</li>
              <li>❌ Third-party tracking for ads</li>
              <li>❌ Social media tracking pixels (Facebook Pixel, etc.)</li>
              <li>❌ Remarketing cookies</li>
            </ul>
            <p><strong>We do NOT sell your data to advertisers.</strong></p>
          </div>

          <h2>Third-Party Cookies</h2>

          <h3>Supabase (Authentication)</h3>
          <ul>
            <li><strong>Purpose:</strong> User authentication</li>
            <li><strong>Cookies:</strong> sb-access-token, sb-refresh-token</li>
            <li><strong>Privacy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://supabase.com/privacy</a></li>
            <li><strong>Control:</strong> Cannot disable (essential for login)</li>
          </ul>

          <h3>Google OAuth (If you use Google login)</h3>
          <ul>
            <li><strong>Purpose:</strong> Login with Google account</li>
            <li><strong>Privacy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/privacy</a></li>
            <li><strong>Control:</strong> Don't use Google login (use email instead)</li>
          </ul>

          <h2>How to Disable Cookies</h2>

          <h3>In Your Browser</h3>

          <h4>Chrome</h4>
          <ol>
            <li>Settings → Privacy and Security → Cookies</li>
            <li>Choose "Block third-party cookies" or "Block all cookies"</li>
          </ol>

          <h4>Firefox</h4>
          <ol>
            <li>Settings → Privacy & Security</li>
            <li>Choose "Strict" or "Custom" tracking protection</li>
          </ol>

          <h4>Safari</h4>
          <ol>
            <li>Preferences → Privacy</li>
            <li>Check "Block all cookies"</li>
          </ol>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
            <p className="font-bold">Warning:</p>
            <p>Blocking all cookies will prevent you from logging in.</p>
          </div>

          <h2>RODO/GDPR Compliance</h2>

          <h3>Legal Basis for Cookies</h3>
          <ul>
            <li><strong>Essential:</strong> Legitimate Interest (Article 6(1)(f))</li>
            <li><strong>Functional:</strong> Consent (Article 6(1)(a))</li>
            <li><strong>Analytics:</strong> Consent (Article 6(1)(a))</li>
            <li><strong>Advertising:</strong> N/A (we don't use)</li>
          </ul>

          <h3>Your Rights</h3>
          <ul>
            <li><strong>Right to withdraw consent</strong> (stop cookies anytime)</li>
            <li><strong>Right to access</strong> (see what cookies we use)</li>
            <li><strong>Right to erasure</strong> (delete cookies)</li>
          </ul>
          <p><strong>Exercise your rights:</strong> <a href="mailto:privacy@jobstack.pl" className="text-blue-600 hover:underline">privacy@jobstack.pl</a></p>

          <h2>Contact Us</h2>
          <p><strong>Questions about cookies?</strong></p>
          <p>
            <strong>Email:</strong> <a href="mailto:privacy@jobstack.pl" className="text-blue-600 hover:underline">privacy@jobstack.pl</a><br />
            <strong>Subject:</strong> "Cookies: [Your Question]"<br />
            <strong>Response:</strong> Within 30 days
          </p>

          <hr className="my-8" />

          <p className="text-center font-bold">
            By continuing to use JobStack, you consent to our use of cookies as described in this policy.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <strong>Last Updated:</strong> January 16, 2026<br />
            <strong>Version:</strong> 1.0
          </p>

          <div className="flex gap-4 justify-center mt-8">
            <Link href="/terms">
              <Button variant="outline">Terms of Service</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline">Privacy Policy</Button>
            </Link>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
