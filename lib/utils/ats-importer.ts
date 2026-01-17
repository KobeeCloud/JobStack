export type AtsJob = {
  title: string;
  description: string;
  url: string;
  location: string;
  remote: boolean;
  companyName?: string;
  requirements?: string[];
  benefits?: string[];
};

const USER_AGENT = 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)';

const cleanText = (value?: string) => {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
};

const decodeHtml = (value: string) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripHtml = (html: string) => {
  const withLines = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n')
    .replace(/<\s*\/li\s*>/gi, '\n')
    .replace(/<\s*\/h\d\s*>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '- ');

  const noTags = withLines.replace(/<[^>]+>/g, '');
  return decodeHtml(noTags)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t\r]+/g, ' ')
    .trim();
};

const extractListByHeading = (html: string, headingRegex: RegExp): string[] => {
  const results: string[] = [];
  const headingRe = new RegExp(`<h[1-6][^>]*>\\s*.*?${headingRegex.source}.*?<\\/h[1-6]>\\s*(<ul[\\s\\S]*?<\\/ul>)`, 'gi');
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html)) !== null) {
    const ulHtml = match[1] || '';
    const items = ulHtml.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
    items.forEach((item) => {
      const text = stripHtml(item).replace(/^[-•]\s*/g, '');
      if (text) results.push(text);
    });
  }
  return results;
};

const formatCompanyName = (value: string) => {
  const raw = value.replace(/[-_]+/g, ' ').trim();
  if (!raw) return '';
  return raw
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const detectRemote = (text?: string) => {
  if (!text) return false;
  return /remote|zdalnie|hybrid|home office/i.test(text);
};

export async function fetchLeverJobs(company: string): Promise<AtsJob[]> {
  const response = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Lever API error: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data
    .map((job: any) => {
      const title = cleanText(job.text);
      const rawDescription = job.descriptionPlain || job.description || job.text || '';
      const description = rawDescription.includes('<') ? stripHtml(rawDescription) : cleanText(rawDescription);
      const url = job.hostedUrl || job.applyUrl || job.link;
      const location = cleanText(job.categories?.location || job.categories?.team || 'Zdalnie');

      if (!title || !description || !url) return null;

      return {
        title,
        description,
        url,
        location,
        remote: detectRemote(`${location} ${title}`),
        companyName: cleanText(job.company || '') || formatCompanyName(company),
      } as AtsJob;
    })
    .filter(Boolean) as AtsJob[];
}

export async function fetchGreenhouseJobs(company: string): Promise<AtsJob[]> {
  const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Greenhouse API error: ${response.status}`);
  }

  const data = await response.json();
  const jobs = data?.jobs || [];

  return jobs
    .map((job: any) => {
      const title = cleanText(job.title);
      const rawDescription = job.content || '';
      const description = rawDescription.includes('<') ? stripHtml(rawDescription) : cleanText(rawDescription);
      const url = job.absolute_url;
      const location = cleanText(job.location?.name || 'Zdalnie');

      const requirements = extractListByHeading(rawDescription, /(requirements|qualifications|about you|what you bring|what we are looking for)/i);
      const responsibilities = extractListByHeading(rawDescription, /(responsibilities|what you will do|what you'll do|the role|about the role)/i);
      const benefits = extractListByHeading(rawDescription, /(benefits|perks|what we offer|what you get)/i);

      const finalRequirements = requirements.length > 0 ? requirements : responsibilities;

      if (!title || !description || !url) return null;

      return {
        title,
        description,
        url,
        location,
        remote: detectRemote(`${location} ${title}`),
        companyName: cleanText(job.departments?.[0]?.name || '') || formatCompanyName(company),
        requirements: finalRequirements,
        benefits,
      } as AtsJob;
    })
    .filter(Boolean) as AtsJob[];
}
