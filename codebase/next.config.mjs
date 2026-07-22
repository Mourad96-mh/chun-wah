import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export statique → produit un dossier `out/` de HTML crawlable, hébergé sur
  // Hostinger. Tout le dynamique (blog, livres, cours, admin, uploads) vit dans
  // l'API Express sur Render ; le site lit un snapshot baké au build
  // (src/lib/*.data.json via scripts/sync-content.mjs) et peut se rafraîchir en
  // direct depuis l'API côté client.
  output: 'export',
  // ATTENTION : ne jamais lancer `npm run build` pendant qu'un `npm run dev`
  // tourne. Les deux écrivent dans `.next` et le build arrache ses chunks au
  // serveur de dev (« Cannot find module ./xxx.js » → 500 sur toutes les pages).
  // Arrêter le dev, builder, relancer. Changer `distDir` ne contourne PAS le
  // problème : en `output: 'export'`, ça déplace aussi le site exporté hors de
  // `out/` tout en écrivant quand même dans `.next`.
  // Chaque route → `route/index.html` (et non `route.html`), pour qu'Apache /
  // LiteSpeed sur Hostinger serve des URLs propres (/fr/blog/, /fr/cours/…)
  // nativement, sans réécriture.
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    // Pas d'optimiseur d'images côté serveur dans un export statique.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
};

export default withNextIntl(nextConfig);
