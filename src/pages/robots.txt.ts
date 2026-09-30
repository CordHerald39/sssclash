import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => new Response(import.meta.env.SITE_INDEXABLE === 'true'
  ? `User-agent: *\nAllow: /\nDisallow: /search/\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`
  : 'User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
