import { site } from '@/data/site';

/**
 * Ouvert aux moteurs de recherche. L'admin n'a pas besoin d'être listé ici : il
 * porte déjà `robots: { index: false }` dans son layout, et le sitemap ne
 * référence que les pages publiques.
 */
export const dynamic = 'force-static';

export function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
