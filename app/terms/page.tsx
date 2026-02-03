export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Terms of <span className="text-primary">Service</span>
        </h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using JobStack, you accept and agree to be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Provider</h2>
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <p className="mb-2">
                <strong className="text-foreground">Provider:</strong> KobeCloud Jakub Pospieszny
              </p>
              <p className="mb-2">
                <strong className="text-foreground">Address:</strong> Mickiewicza 19, 84-242 Luzino, Poland
              </p>
              <p className="mb-2">
                <strong className="text-foreground">Tax ID (NIP):</strong> 5882530612
              </p>
              <p>
                <strong className="text-foreground">Contact:</strong> kuba.pospieszny@gmail.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Conduct</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Upload false or misleading information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Intellectual Property</h2>
            <p>
              You retain all rights to the content you create. The JobStack platform is owned by
              KobeCloud Jakub Pospieszny and protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Disclaimer</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. Generated code should
              be reviewed before deployment. We are not responsible for cloud resource costs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of Poland.
            </p>
          </section>

          <section>
            <p className="text-sm text-muted-foreground/70">
              Last updated: January 22, 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
