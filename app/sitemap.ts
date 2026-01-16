import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobstack.pl';
  const now = new Date();

  const routes = [
    '/',
    '/jobs',
    '/for-employers',
    '/pricing',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/api-docs',
    '/login',
    '/register',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
