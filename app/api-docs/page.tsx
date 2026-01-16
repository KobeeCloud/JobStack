import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ApiDocsPage() {
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

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 prose prose-blue dark:prose-invert max-w-none">
          <h1>API Documentation</h1>
          <p className="lead">Complete guide to integrating JobStack API into your application or ATS system.</p>

          <h2>Authentication</h2>
          <p>All API requests require authentication using an API key. Get your API key by:</p>
          <ol>
            <li><Link href="/register?role=employer">Creating an employer account</Link></li>
            <li>Going to your dashboard → Settings → API Keys</li>
            <li>Generating a new API key</li>
          </ol>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="font-mono text-sm mb-0">Authorization: Bearer YOUR_API_KEY</p>
          </div>

          <h2>Base URL</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="font-mono text-sm mb-0">https://jobstack.pl/api</p>
          </div>

          <h2>Endpoints</h2>

          <h3>GET /api/jobs</h3>
          <p>Retrieve job listings with optional filters.</p>

          <h4>Query Parameters:</h4>
          <ul>
            <li><code>search</code> - Full-text search query</li>
            <li><code>location</code> - Filter by location (e.g., "Warsaw")</li>
            <li><code>remote</code> - Filter remote jobs (true/false)</li>
            <li><code>techStack</code> - Comma-separated tech stack (e.g., "React,TypeScript")</li>
            <li><code>source</code> - Filter by source (justjoinit, nofluffjobs, native)</li>
            <li><code>salaryMin</code> - Minimum salary</li>
            <li><code>featured</code> - Show only featured jobs (true/false)</li>
            <li><code>page</code> - Page number (default: 1)</li>
            <li><code>limit</code> - Results per page (default: 20, max: 100)</li>
          </ul>

          <h4>Example Request:</h4>
          <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto">
{`curl -X GET "https://jobstack.vercel.app/api/jobs?search=developer&location=Warsaw&remote=true&techStack=React,TypeScript&page=1&limit=20"`}
          </pre>

          <h4>Example Response:</h4>
          <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior Frontend Developer",
      "company_name": "Tech Company",
      "location": "Warsaw, Poland",
      "remote": true,
      "salary_min": 15000,
      "salary_max": 25000,
      "salary_currency": "PLN",
      "tech_stack": ["React", "TypeScript", "Next.js"],
      "source": "native",
      "source_url": "https://...",
      "featured": false,
      "published_at": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}`}
          </pre>

          <h3>GET /api/jobs/:id</h3>
          <p>Retrieve a specific job by ID.</p>

          <h4>Example Request:</h4>
          <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto">
{`curl -X GET "https://jobstack.vercel.app/api/jobs/550e8400-e29b-41d4-a716-446655440000"`}
          </pre>

          <h3>POST /api/employer/jobs</h3>
          <p><strong>⚠️ Requires Authentication</strong></p>
          <p>Create a new job posting.</p>

          <h4>Request Body:</h4>
          <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "title": "Senior Backend Developer",
  "location": "Krakow, Poland",
  "remote": true,
  "salary_min": 18000,
  "salary_max": 28000,
  "salary_currency": "PLN",
  "tech_stack": ["Node.js", "PostgreSQL", "Docker"],
  "description": "We're looking for...",
  "requirements": ["5+ years experience", "Strong TypeScript skills"],
  "benefits": ["Remote work", "Flexible hours", "Private healthcare"],
  "featured": false
}`}
          </pre>

          <h4>Example Request:</h4>
          <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto">
{`curl -X POST https://jobstack.pl/api/employer/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Senior Backend Developer",...}'`}
          </pre>

          <h4>Response:</h4>
          <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto">
{`{
  "job": {
    "id": "uuid",
    "title": "Senior Backend Developer",
    ...
  }
}`}
          </pre>

          <h2>Rate Limits</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Rate Limit</th>
                <th>Job Postings</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Free</td>
                <td>60 requests/minute</td>
                <td>1/month</td>
              </tr>
              <tr>
                <td>Pro</td>
                <td>600 requests/minute</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Enterprise</td>
                <td>Custom</td>
                <td>Unlimited</td>
              </tr>
            </tbody>
          </table>

          <h2>Error Codes</h2>
          <ul>
            <li><code>400 Bad Request</code> - Invalid request parameters</li>
            <li><code>401 Unauthorized</code> - Missing or invalid API key</li>
            <li><code>404 Not Found</code> - Job not found</li>
            <li><code>429 Too Many Requests</code> - Rate limit exceeded</li>
            <li><code>500 Internal Server Error</code> - Server error</li>
          </ul>

          <h2>SDKs & Libraries</h2>
          <p>Coming soon:</p>
          <ul>
            <li>Node.js SDK</li>
            <li>Python SDK</li>
            <li>PHP SDK</li>
          </ul>

          <h2>Support</h2>
          <p>Need help? Contact us at <a href="mailto:api@jobstack.pl">api@jobstack.pl</a></p>

          <div className="flex gap-4 justify-center mt-8">
            <Link href="/for-employers">
              <Button>Get API Key</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
