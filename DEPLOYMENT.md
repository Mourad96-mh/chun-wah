# Déploiement — Chun Wah (architecture split)

Deux morceaux, déployés séparément :

```
cwtcma-morocco.com  (Hostinger : domaine + frontend statique)
   └─ HTML/JS statique dans codebase/out/  ← téléversé dans public_html
        │  appels (fetch navigateur, CORS) ↓
   chunwah-api.onrender.com  (Render : API Express — codebase/server/)
        ├─ MongoDB Atlas   (blog, livres, cours, parcours, vidéos, réglages, admin)
        └─ Cloudinary      (images / posters)
```

- **Frontend** = Next.js **export statique** (`output: 'export'`) → `codebase/out/`. Hébergé sur **Hostinger**.
- **Backend** = **API Express** dans `codebase/server/` → hébergé sur **Render**.
- Le HTML public est baké au build (SEO) depuis un snapshot des articles, et se
  rafraîchit en direct depuis l'API dans le navigateur. L'admin parle directement à l'API.

> **Migration terminée.** Toutes les ressources (auth, blog/articles, livres, cours,
> réglages, médias, parcours, vidéos, tableau de bord) sont servies par l'API Express ;
> `codebase/src/app/api/*`, `src/models/*`, `src/lib/{auth,db}.ts` et `src/middleware.ts`
> ont été supprimés et `npm run build` (export) passe au vert. Voir le récapitulatif en bas.

---

## 1. Backend — API Express sur Render

Le repo a un `render.yaml` (Blueprint) qui déploie `codebase/server`.

1. **dashboard.render.com** → New → Blueprint → choisir le repo `CHUN WAH` → Apply.
   (Service `chunwah-api`, rootDir `codebase/server`, plan Starter.)
2. Dans le service → **Environment**, régler les vraies valeurs (voir `codebase/server/.env.example`) :
   `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`. (`CORS_ORIGIN` est pré-rempli avec les domaines cwtcma-morocco.com.)
3. **MongoDB Atlas → Network Access → Allow 0.0.0.0/0** (Render n'a pas d'IP sortante fixe).
4. Déployer → on obtient `https://chunwah-api.onrender.com`. L'ouvrir → `{"ok":true,...}`.
5. Créer l'admin une fois : service Render → **Shell** →
   `npm run seed:admin -- vous@exemple.com "MotDePasseSolide" "Votre Nom"`.

## 2. Frontend — site statique sur Hostinger

Builder en local (ou en CI), puis téléverser le dossier `out/`.

1. Dans `codebase/.env.local` (ou l'env CI), régler :
   ```
   NEXT_PUBLIC_SITE_URL=https://cwtcma-morocco.com
   NEXT_PUBLIC_API_URL=https://chunwah-api.onrender.com
   CONTENT_API_URL=https://chunwah-api.onrender.com
   ```
2. Builder :
   ```
   cd codebase
   npm ci
   npm run build      # prebuild bake le snapshot des articles depuis l'API, puis exporte vers out/
   ```
3. Téléverser **le contenu de `codebase/out/`** dans le `public_html` de Hostinger
   (hPanel → File Manager, ou FTP). C'est tout le site.
4. Activer le SSL pour cwtcma-morocco.com dans hPanel (Let's Encrypt gratuit).
5. **Redirection racine** : le site vit sous `/fr/` et `/en/` (pas de middleware en
   statique). Ajouter dans `public_html/.htaccess` une redirection de `/` vers `/fr/` :
   ```apache
   RewriteEngine On
   RewriteRule ^$ /fr/ [R=302,L]
   ```

Les URLs propres marchent nativement : `trailingSlash: true` émet `route/index.html`,
qu'Apache/LiteSpeed sert pour `/route/`.

## Mise à jour du contenu

- **Éditer un article existant :** via `cwtcma-morocco.com/admin` (écrit dans l'API). Les
  pages blog se rafraîchissent en direct dans le navigateur.
- **Ajouter un article (nouvelle URL) :** il apparaît en direct dans la liste, mais
  sa page statique SEO nécessite un **rebuild + re-upload** de `out/` (étapes 2–3).
  Envisager un rebuild planifié ou en CI.

---

## Migration vers l'architecture split — récapitulatif

Toutes les ressources suivent le même pattern : modèle + routes Express, snapshot
baké par `scripts/sync-content.mjs`, seam client-safe dans `src/lib/`, admin en
composant client sur `adminApi` (JWT Bearer).

- [x] **Articles / blog** — modèle `Article`, routes `/api/articles`, admin `articles/*`, pages `[locale]/blog*`.
- [x] **Livres** — modèle `Book`, routes `/api/books`, admin `livres/*`, page `[locale]/livres`.
- [x] **Cours** — modèle `Program`, routes `/api/programs`, admin `cours/*`, pages `[locale]/cours*`
      (seam `src/lib/programs.ts` inchangé pour home/footer/horaires/sitemap).
- [x] **Parcours** — modèle `Roadmap` (singleton), routes `/api/roadmap` (+ `/api/uploads/doc`
      pour le PDF), admin `parcours`, page `[locale]/parcours`. Seam `src/lib/roadmap.ts`,
      snapshot `roadmap.data.json` ; l'endpoint public ne renvoie que le parcours publié.
- [x] **Vidéos** — modèle `Video`, routes `/api/videos` (+ `/api/uploads/sign` pour l'upload
      direct navigateur → Cloudinary), admin `videos/*` (`videos/[id]` → `videos/edit?id=`),
      seam `src/lib/videos.ts` lu par `VideoShowcase` → l'accueil n'est plus en ISR.
- [x] **Médias** — modèle `Media`, routes `/api/media`, admin `medias`. Seam `src/lib/media.ts`
      inchangé → noms d'instructeurs + images (hero/à propos/portraits) désormais snapshot,
      pages cours/horaires/home Mongo-free côté médias.
- [x] **Réglages** — modèle `Settings`, routes `/api/settings`, admin `reglages`. Seam
      `src/lib/settings.ts` inchangé → le `[locale]/layout.tsx` (partagé par CHAQUE page)
      ne lit plus Mongo.
- [x] **Tableau de bord** — compteurs et « dernières modifications » calculés côté client
      depuis les listes admin de l'API (plus de `countDocuments`).
- [x] Toutes les pages admin sont des **composants client** (`adminApi` + Bearer) ;
      `src/middleware.ts` supprimé, la garde d'auth vit dans `AdminShell`.
- [x] Plus aucun `revalidate` ni lecture Mongo côté frontend ; `sitemap.xml` et
      `robots.txt` sont `force-static` et lisent les mêmes snapshots que les pages.
- [x] `src/app/api/*`, `src/models/*`, `src/lib/{auth,db,slug}.ts` supprimés ;
      `mongoose/bcryptjs/jose/cloudinary/slugify` purgés de `codebase/package.json`.

> **Note sur le build export** : `npm run build` exige que l'API soit joignable au moins
> une fois (`CONTENT_API_URL`), car une route dynamique sans aucun paramètre
> (`/cours/[slug]`, `/blog/[slug]`) fait échouer l'export. Les snapshots commités
> servent de filet : si l'API est indisponible, le build réutilise le dernier état connu.
