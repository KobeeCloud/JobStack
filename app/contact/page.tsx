import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">JobStack</Link>
            <div className="flex gap-4">
              <Link href="/jobs"><Button variant="ghost">Browse Jobs</Button></Link>
              <Link href="/login"><Button variant="outline">Sign In</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-4">Contact Us</h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          We're here to help. Choose the best way to reach us.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">📧</div>
              <CardTitle>General Inquiries</CardTitle>
              <CardDescription>Questions about our service</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:support@jobstack.pl" className="text-blue-600 hover:underline text-lg">
                support@jobstack.pl
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">⚖️</div>
              <CardTitle>Legal & Privacy</CardTitle>
              <CardDescription>RODO requests, terms questions</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:legal@jobstack.pl" className="text-blue-600 hover:underline text-lg">
                legal@jobstack.pl
              </a>
              <br />
              <a href="mailto:privacy@jobstack.pl" className="text-blue-600 hover:underline text-lg">
                privacy@jobstack.pl
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">💼</div>
              <CardTitle>Employer & Sales</CardTitle>
              <CardDescription>Pricing, enterprise plans</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:sales@jobstack.pl" className="text-blue-600 hover:underline text-lg">
                sales@jobstack.pl
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">🛠️</div>
              <CardTitle>Technical & API</CardTitle>
              <CardDescription>API support, integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:api@jobstack.pl" className="text-blue-600 hover:underline text-lg">
                api@jobstack.pl
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Company:</strong> JobStack by KobeeCloud</p>
            <p><strong>Business Type:</strong> Jednoosobowa Działalność Gospodarcza (JDG)</p>
            <p><strong>NIP:</strong> [Your NIP]</p>
            <p><strong>REGON:</strong> [Your REGON]</p>
            <p><strong>Address:</strong> [Your business address], Poland</p>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Looking for answers? Check our resources:</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/api-docs">
              <Button variant="outline">API Docs</Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline">Terms of Service</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline">Privacy Policy</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
