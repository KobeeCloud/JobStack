import { XMLParser } from 'fast-xml-parser';

export type ImportedJob = {
  title: string;
  description: string;
  url: string;
  location: string;
  remote: boolean;
  companyName?: string;
};

const USER_AGENT = 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)';

const normalizeUrl = (url: string) => {
  const normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    return `https://${normalized}`;
  }
  return normalized;
};

const detectRemote = (text?: string) => {
  if (!text) return false;
  return /remote|zdalnie|hybrid|home office/i.test(text);
};

const cleanText = (value?: string) => {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
};

const extractJsonLdScripts = (html: string): string[] => {
  const scripts: string[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    if (match[1]) scripts.push(match[1]);
  }

  return scripts;
};

const extractJobPostings = (json: any): any[] => {
  if (!json) return [];
  if (Array.isArray(json)) {
    return json.flatMap(extractJobPostings);
  }
  if (json['@graph']) {
    return extractJobPostings(json['@graph']);
  }
  if (json['@type']) {
    const type = Array.isArray(json['@type']) ? json['@type'] : [json['@type']];
    if (type.includes('JobPosting')) {
      return [json];
    }
  }
  return [];
};

export async function fetchCareersUrl(url: string) {
  const normalized = normalizeUrl(url);
  const response = await fetch(normalized, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/rss+xml,application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const content = await response.text();

  return { content, contentType, normalized };
}

export function parseJobsFromHtml(html: string, baseUrl: string): ImportedJob[] {
  const scripts = extractJsonLdScripts(html);
  const jobs: ImportedJob[] = [];

  scripts.forEach((script) => {
    try {
      const parsed = JSON.parse(script);
      const postings = extractJobPostings(parsed);
      postings.forEach((posting) => {
        const title = cleanText(posting.title);
        const description = cleanText(posting.description);
        const url = posting.url || posting['@id'] || baseUrl;
        const location = cleanText(
          posting.jobLocation?.address?.addressLocality ||
            posting.jobLocation?.address?.addressRegion ||
            posting.jobLocation?.address?.addressCountry ||
            posting.jobLocation?.name ||
            posting.applicantLocationRequirements?.name ||
            'Zdalnie'
        );
        const companyName = cleanText(posting.hiringOrganization?.name);

        if (!title || !description) return;

        jobs.push({
          title,
          description,
          url,
          location,
          remote: detectRemote(`${location} ${posting.jobLocationType || ''}`),
          companyName,
        });
      });
    } catch {
      return;
    }
  });

  return jobs;
}

export function parseJobsFromXml(xml: string): ImportedJob[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const data = parser.parse(xml);
  const items = data?.rss?.channel?.item || data?.feed?.entry || [];
  const normalizedItems = Array.isArray(items) ? items : [items];

  return normalizedItems
    .map((item: any) => {
      const title = cleanText(item.title?.['#text'] || item.title);
      const description = cleanText(item.description || item.summary || item.content?.['#text'] || item.content);
      const link =
        item.link?.['@_href'] ||
        item.link?.['#text'] ||
        item.link ||
        item.guid ||
        '';
      const location = cleanText(item.location || item['job:location'] || 'Zdalnie');

      if (!title || !description || !link) return null;

      return {
        title,
        description,
        url: link,
        location,
        remote: detectRemote(`${location} ${title}`),
        companyName: undefined,
      } as ImportedJob;
    })
    .filter(Boolean) as ImportedJob[];
}
