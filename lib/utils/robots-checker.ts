import robotsParser from 'robots-parser';

const ROBOTS_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const ROBOTS_CACHE = new Map<string, { parser: ReturnType<typeof robotsParser>; fetchedAt: number }>();

async function fetchRobotsTxt(baseUrl: string): Promise<string> {
  const robotsUrl = new URL('/robots.txt', baseUrl).toString();
  const response = await fetch(robotsUrl, {
    headers: {
      'User-Agent': 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)',
      'Accept': 'text/plain',
    },
  });

  if (!response.ok) {
    throw new Error(`robots.txt fetch failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function checkRobotsTxt(baseUrl: string, path: string, userAgent = 'JobStackBot'): Promise<boolean> {
  const cacheKey = baseUrl.replace(/\/$/, '');
  const cached = ROBOTS_CACHE.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < ROBOTS_CACHE_TTL_MS) {
    return cached.parser.isAllowed(path, userAgent) ?? false;
  }

  const robotsTxt = await fetchRobotsTxt(baseUrl);
  const parser = robotsParser(new URL('/robots.txt', baseUrl).toString(), robotsTxt);
  ROBOTS_CACHE.set(cacheKey, { parser, fetchedAt: now });

  return parser.isAllowed(path, userAgent) ?? false;
}
