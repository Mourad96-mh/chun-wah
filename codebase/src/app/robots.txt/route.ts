import { site } from '@/data/site';

/**
 * Currently blocks all crawlers: the site still holds placeholder content and a
 * placeholder address. FLIP THIS AT LAUNCH — swap the body for the allow rules
 * below and drop the `robots` override in the locale layout.
 *
 *   User-agent: *
 *   Allow: /
 *   Sitemap: ${site.url}/sitemap.xml
 */
export function GET() {
  const body = `User-agent: *
Disallow: /

Sitemap: ${site.url}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
