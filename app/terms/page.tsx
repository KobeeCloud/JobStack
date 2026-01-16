'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ArrowLeft, Shield, FileText, Cookie } from 'lucide-react';

export default function TermsPage() {
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
            <h1>Regulamin (Terms of Service)</h1>
            <p className="text-sm text-gray-500">Ostatnia aktualizacja: 16 stycznia 2026</p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using JobStack ("Service", "Platform", "we", "us"), you agree to be bound by these Terms of Service ("Terms").
            If you disagree with any part of the terms, you may not access the Service.
          </p>
          <p>
            <strong>Operating Entity:</strong> JobStack is operated as part of KobeeCloud's business activities under Polish law
            (Jednoosobowa Działalność Gospodarcza).
          </p>

          <h2>2. Service Description</h2>
          <p>JobStack is a <strong>job aggregation platform</strong> that:</p>
          <ul>
            <li>Aggregates publicly available job listings from various sources</li>
            <li>Provides search and filtering capabilities</li>
            <li>Allows employers to post job listings</li>
            <li>Does NOT create, modify, or guarantee the accuracy of aggregated job listings</li>
          </ul>

          <h3>Important Disclaimer</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
            <p className="font-bold">WE ARE AN AGGREGATOR, NOT AN EMPLOYER OR RECRUITER</p>
            <p>JobStack:</p>
            <ul>
              <li>❌ Does NOT employ candidates</li>
              <li>❌ Does NOT make hiring decisions</li>
              <li>❌ Does NOT guarantee job availability</li>
              <li>❌ Is NOT responsible for the content of third-party job listings</li>
              <li>✅ ONLY provides a platform to discover jobs from multiple sources</li>
            </ul>
          </div>

          <h2>3. User Accounts</h2>
          <h3>3.1 Account Types</h3>
          <ul>
            <li><strong>Job Seekers (Candidates):</strong> Free accounts to browse and save jobs</li>
            <li><strong>Employers:</strong> Accounts to post job listings (subject to plan limitations)</li>
          </ul>

          <h3>3.2 Account Responsibilities</h3>
          <p>You are responsible for:</p>
          <ul>
            <li>Providing accurate information</li>
            <li>Maintaining the security of your account</li>
            <li>All activities under your account</li>
            <li>Compliance with applicable laws</li>
          </ul>

          <h3>3.3 Prohibited Activities</h3>
          <p>You may NOT:</p>
          <ul>
            <li>Provide false or misleading information</li>
            <li>Impersonate any person or entity</li>
            <li>Post discriminatory job listings</li>
            <li>Scrape or copy our database</li>
            <li>Use automated tools to access the Service (except via our API)</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2>4. Job Listings</h2>
          <h3>4.1 Aggregated Listings</h3>
          <p>Job listings from external sources (JustJoin.it, NoFluffJobs, etc.):</p>
          <ul>
            <li>Are provided "as is" from their original sources</li>
            <li>May be outdated or inaccurate</li>
            <li>Are the responsibility of the original poster</li>
            <li>Are clearly marked with source attribution</li>
          </ul>
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
            <p><strong>We do NOT verify aggregated listings and are NOT responsible for their accuracy.</strong></p>
          </div>

          <h3>4.2 Direct Employer Listings</h3>
          <p>Jobs posted directly by employers on JobStack:</p>
          <ul>
            <li>Must comply with Polish labor law (Kodeks Pracy)</li>
            <li>Must NOT contain discriminatory language</li>
            <li>Must be genuine job opportunities</li>
            <li>Are subject to our review and approval</li>
          </ul>

          <h3>4.3 Prohibited Job Content</h3>
          <p>Job listings may NOT:</p>
          <ul>
            <li>Discriminate based on age, gender, race, religion, disability, sexual orientation</li>
            <li>Require illegal activities</li>
            <li>Contain false or misleading information</li>
            <li>Violate any applicable laws</li>
            <li>Request payment from candidates for job opportunities</li>
          </ul>
          <p><strong>We reserve the right to remove any listing that violates these terms.</strong></p>

          <h2>5. Intellectual Property</h2>
          <h3>5.1 Our Content</h3>
          <p>
            All content on JobStack (design, code, text, graphics, logo) is owned by KobeeCloud and protected by copyright law,
            trademark law, and other intellectual property rights.
          </p>

          <h3>5.2 Aggregated Content</h3>
          <p>
            Job listings from external sources remain the property of their original publishers. We display them under fair use principles,
            publicly available information doctrine, and with clear attribution to the source.
          </p>

          <h3>5.3 User Content</h3>
          <p>
            By posting content (job listings, profiles), you grant us a non-exclusive, worldwide, royalty-free license to display
            and distribute that content on the Platform.
          </p>

          <h2>6. Data Protection & Privacy (RODO/GDPR)</h2>
          <p>
            We process personal data in accordance with RODO (GDPR), our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, and Polish data protection law.
          </p>
          <p><strong>Your Rights:</strong></p>
          <ul>
            <li>Access your personal data</li>
            <li>Rectify inaccurate data</li>
            <li>Erase your data ("right to be forgotten")</li>
            <li>Restrict processing</li>
            <li>Data portability</li>
            <li>Object to processing</li>
            <li>Withdraw consent</li>
          </ul>
          <p>
            <strong>To exercise these rights, contact:</strong>{' '}
            <a href="mailto:privacy@jobstack.pl" className="text-blue-600 hover:underline">privacy@jobstack.pl</a>
          </p>

          <h2>7. Web Scraping & Data Collection</h2>
          <h3>7.1 Our Scraping Practices</h3>
          <p>We collect publicly available job listings by:</p>
          <ul>
            <li>Respecting robots.txt files</li>
            <li>Using reasonable rate limiting</li>
            <li>Not bypassing authentication</li>
            <li>Not accessing private or password-protected content</li>
          </ul>

          <h3>7.2 Legal Basis</h3>
          <p>Our scraping is legal under:</p>
          <ul>
            <li><strong>TSUE Case C-30/14:</strong> Public data can be reused</li>
            <li><strong>Polish Copyright Law (Article 34):</strong> Fair use for information purposes</li>
            <li><strong>Database Directive 96/9/EC:</strong> Substantial investment protection</li>
          </ul>

          <h2>8. Disclaimer of Warranties</h2>
          <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-500 p-4 my-4">
            <p className="font-bold">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
            <p>We do NOT warrant that:</p>
            <ul>
              <li>The Service will be uninterrupted or error-free</li>
              <li>Job listings are accurate or current</li>
              <li>Any jobs listed are still available</li>
              <li>Employers are legitimate</li>
              <li>You will get hired</li>
            </ul>
            <p><strong>USE AT YOUR OWN RISK.</strong></p>
          </div>

          <h2>9. Limitation of Liability</h2>
          <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
          <p>We are NOT liable for:</p>
          <ul>
            <li>Indirect, incidental, or consequential damages</li>
            <li>Lost profits or revenue</li>
            <li>Data loss</li>
            <li>Inaccurate job listings</li>
            <li>Actions of employers or candidates</li>
            <li>Damages exceeding €100 (one hundred euros)</li>
          </ul>
          <p><strong>EXCEPTION:</strong> We remain liable for intentional misconduct or gross negligence.</p>

          <h2>10. Governing Law & Jurisdiction</h2>
          <p>These Terms are governed by <strong>Polish law</strong> (Prawo Polskie).</p>
          <p>Any disputes shall be resolved in the courts of Poland.</p>
          <p>If you are a consumer, you retain all mandatory consumer rights under Polish and EU law.</p>

          <h2>11. Contact Information</h2>
          <p>
            <strong>JobStack / KobeeCloud</strong><br />
            Email: <a href="mailto:legal@jobstack.pl" className="text-blue-600 hover:underline">legal@jobstack.pl</a><br />
            Address: [Your business address]<br />
            NIP: [Your tax ID]<br />
            REGON: [Your business number]
          </p>

          <h2>12. Consumer Dispute Resolution</h2>
          <p>EU consumers can use the ODR platform: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ec.europa.eu/consumers/odr/</a></p>

          <hr className="my-8" />

          <p className="text-center font-bold">
            By using JobStack, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <strong>Last Updated:</strong> January 16, 2026<br />
            <strong>Version:</strong> 1.0
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/privacy">
              <Button variant="outline" className="rounded-xl border-gray-300 dark:border-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                Polityka Prywatności
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
