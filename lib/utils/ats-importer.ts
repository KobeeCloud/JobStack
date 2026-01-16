export type AtsJob = {
  title: string;
  description: string;
  url: string;
  location: string;
  remote: boolean;
  companyName?: string;
};

const USER_AGENT = 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)';

const cleanText = (value?: string) => {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
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
      const description = cleanText(job.descriptionPlain || job.description || job.text);
      const url = job.hostedUrl || job.applyUrl || job.link;
      const location = cleanText(job.categories?.location || job.categories?.team || 'Zdalnie');

      if (!title || !description || !url) return null;

      return {
        title,
        description,
        url,
        location,
        remote: detectRemote(`${location} ${title}`),
        companyName: cleanText(job.company || ''),
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
      const description = cleanText(job.content);
      const url = job.absolute_url;
      const location = cleanText(job.location?.name || 'Zdalnie');

      if (!title || !description || !url) return null;

      return {
        title,
        description,
        url,
        location,
        remote: detectRemote(`${location} ${title}`),
        companyName: cleanText(job.departments?.[0]?.name || ''),
      } as AtsJob;
    })
    .filter(Boolean) as AtsJob[];
}
