# JobStack API Documentation

## Base URL
```
Production: https://jobstack.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

### API Key
Include your API key in the request headers:
```
X-API-Key: jbs_your_api_key_here
```

### Getting an API Key
1. Sign up at [JobStack](https://jobstack.vercel.app/register) as an Employer
2. Go to Dashboard → Settings → API Keys
3. Generate a new API key
4. Copy and save it securely (it won't be shown again)

---

## Endpoints

### Public Endpoints

#### GET /api/jobs
Get a list of job postings with filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Results per page
- `search` (string) - Full-text search query
- `location` (string) - Filter by location
- `remote` (boolean) - Filter remote jobs only
- `techStack` (string) - Comma-separated tech stack (e.g., "React,TypeScript")
- `source` (string) - Filter by source: justjoinit, nofluffjobs, pracuj, indeed, native
- `salaryMin` (number) - Minimum salary
- `featured` (boolean) - Show only featured jobs

**Example Request:**
```bash
curl "https://jobstack.vercel.app/api/jobs?search=react&location=Warsaw&remote=true&page=1&limit=20"
```

**Example Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior React Developer",
      "company_name": "TechCorp",
      "company_logo": "https://...",
      "location": "Warsaw",
      "remote": true,
      "salary_min": 18000,
      "salary_max": 25000,
      "salary_currency": "PLN",
      "tech_stack": ["React", "TypeScript", "Next.js"],
      "description": "...",
      "requirements": ["5+ years React", "TypeScript expert"],
      "benefits": ["B2B", "Multisport", "Remote"],
      "source": "justjoinit",
      "source_url": "https://justjoin.it/offers/...",
      "featured": false,
      "published_at": "2026-01-15T10:00:00Z",
      "expires_at": "2026-02-15T10:00:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

#### GET /api/jobs/[id]
Get details of a specific job posting.

**Example Request:**
```bash
curl "https://jobstack.vercel.app/api/jobs/uuid-here"
```

**Example Response:**
```json
{
  "job": {
    "id": "uuid",
    "title": "Senior React Developer",
    ...
  }
}
```

---

### Employer Endpoints

#### POST /api/employer/jobs
Create a new job posting. Requires API key or authentication.

**Headers:**
```
X-API-Key: jbs_your_api_key_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Senior React Developer",
  "location": "Warsaw",
  "remote": true,
  "salary_min": 18000,
  "salary_max": 25000,
  "salary_currency": "PLN",
  "tech_stack": ["React", "TypeScript", "Next.js"],
  "description": "We are looking for an experienced React developer to join our team...",
  "requirements": [
    "5+ years of React experience",
    "Strong TypeScript skills",
    "Experience with Next.js"
  ],
  "benefits": [
    "B2B contract",
    "Multisport card",
    "100% remote work"
  ],
  "apply_url": "https://yourcompany.com/careers/react-dev",
  "featured": false,
  "expires_in_days": 30
}
```

**Required Fields:**
- `title` (string)
- `location` (string)
- `description` (string)

**Optional Fields:**
- `remote` (boolean, default: false)
- `salary_min` (number)
- `salary_max` (number)
- `salary_currency` (string, default: "PLN")
- `tech_stack` (string[])
- `requirements` (string[])
- `benefits` (string[])
- `apply_url` (string) - URL for applications
- `featured` (boolean, default: false, premium only)
- `expires_in_days` (number, default: 30)

**Example Request:**
```bash
curl -X POST "https://jobstack.vercel.app/api/employer/jobs" \
  -H "X-API-Key: jbs_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior React Developer",
    "location": "Warsaw",
    "remote": true,
    "salary_min": 18000,
    "salary_max": 25000,
    "tech_stack": ["React", "TypeScript"],
    "description": "Looking for a React expert...",
    "requirements": ["5+ years React"],
    "apply_url": "https://company.com/apply"
  }'
```

**Example Response:**
```json
{
  "job": {
    "id": "uuid",
    "title": "Senior React Developer",
    ...
  }
}
```

---

#### GET /api/employer/jobs
List all jobs posted by your company. Requires authentication.

**Headers:**
```
X-API-Key: jbs_your_api_key_here
```

**Example Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior React Developer",
      ...
    }
  ]
}
```

---

## Rate Limiting

| Plan       | Requests/Month | Rate Limit       |
|------------|----------------|------------------|
| Free       | 1,000          | 10 req/min       |
| Premium    | 10,000         | 100 req/min      |
| Enterprise | Unlimited      | 1,000 req/min    |

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request - Invalid parameters |
| 401  | Unauthorized - Invalid or missing API key |
| 403  | Forbidden - Plan limit reached |
| 404  | Not Found |
| 410  | Gone - Job expired |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

---

## Example Integration

### Node.js
```javascript
const API_KEY = 'jbs_your_api_key_here';

// Post a job
async function postJob() {
  const response = await fetch('https://jobstack.vercel.app/api/employer/jobs', {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Senior React Developer',
      location: 'Warsaw',
      remote: true,
      salary_min: 18000,
      salary_max: 25000,
      tech_stack: ['React', 'TypeScript'],
      description: 'We are hiring...',
      requirements: ['5+ years React'],
    }),
  });

  const data = await response.json();
  console.log(data);
}
```

### Python
```python
import requests

API_KEY = 'jbs_your_api_key_here'

# Post a job
def post_job():
    response = requests.post(
        'https://jobstack.vercel.app/api/employer/jobs',
        headers={
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json',
        },
        json={
            'title': 'Senior React Developer',
            'location': 'Warsaw',
            'remote': True,
            'salary_min': 18000,
            'salary_max': 25000,
            'tech_stack': ['React', 'TypeScript'],
            'description': 'We are hiring...',
            'requirements': ['5+ years React'],
        }
    )

    print(response.json())
```

### cURL
```bash
# Search jobs
curl "https://jobstack.vercel.app/api/jobs?search=react&remote=true"

# Post a job
curl -X POST "https://jobstack.vercel.app/api/employer/jobs" \
  -H "X-API-Key: jbs_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"title":"React Developer","location":"Warsaw","description":"..."}'
```

---

## Webhooks (Coming Soon)

Subscribe to events:
- `job.created` - New job posted
- `job.expired` - Job listing expired
- `application.received` - New application

---

## Support

- 📧 Email: api@jobstack.com
- 📚 Documentation: https://docs.jobstack.com
- 💬 Discord: https://discord.gg/jobstack

---

## Changelog

### v1.0.0 (2026-01-15)
- Initial API release
- GET /api/jobs with filtering
- POST /api/employer/jobs
- API key authentication
