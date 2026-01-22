export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Privacy <span className="text-primary">Policy</span>
        </h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. General Information</h2>
            <p className="mb-4">
              This Privacy Policy defines the rules for processing and protecting personal data
              provided by Users in connection with using the JobStack service.
            </p>
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <p className="mb-2">
                <strong className="text-foreground">Data Controller:</strong> KobeCloud Jakub Pospieszny
              </p>
              <p className="mb-2">
                <strong className="text-foreground">Address:</strong> Mickiewicza 19, 84-242 Luzino, Poland
              </p>
              <p className="mb-2">
                <strong className="text-foreground">Tax ID (NIP):</strong> 5882530612
              </p>
              <p className="mb-2">
                <strong className="text-foreground">REGON:</strong> 541797979
              </p>
              <p className="mb-2">
                <strong className="text-foreground">Legal form:</strong> Sole proprietorship
              </p>
              <p>
                <strong className="text-foreground">Contact:</strong> kuba.pospieszny@gmail.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data We Collect</h2>
            <p className="mb-4">
              When using JobStack, we may collect the following types of data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account data:</strong> Email address, password (encrypted), role</li>
              <li><strong>Profile data:</strong> Name, job title, skills, experience, portfolio links</li>
              <li><strong>Project data:</strong> Infrastructure diagrams, project names, descriptions</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Your GDPR Rights</h2>
            <p className="mb-4">Under GDPR, you have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Right of access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to erasure:</strong> Request deletion of your data</li>
              <li><strong>Right to data portability:</strong> Receive your data in a structured format</li>
            </ul>
            <p className="mt-4">
              To exercise your rights, contact us at: <strong>kuba.pospieszny@gmail.com</strong>
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
