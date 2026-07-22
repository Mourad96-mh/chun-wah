# Déploiement — Chun Wah (architecture split)

Deux morceaux, déployés séparément :

```
chunwah.ma  (Hostinger : domaine + frontend statique)
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

> **État de la migration.** Portés : *auth, blog/articles, livres, cours, réglages,
> médias, parcours*. Restent les **vidéos** et le **tableau de bord admin**, encore
> en routes Next dans `codebase/src/app/api/*` : ils **doivent être migrés vers
> `codebase/server/`** avant que `npm run build` (export) passe au vert. Voir la
> checklist en bas.

---

## 1. Backend — API Express sur Render

Le repo a un `render.yaml` (Blueprint) qui déploie `codebase/server`.

1. **dashboard.render.com** → New → Blueprint → choisir le repo `CHUN WAH` → Apply.
   (Service `chunwah-api`, rootDir `codebase/server`, plan Starter.)
2. Dans le service → **Environment**, régler les vraies valeurs (voir `codebase/server/.env.example`) :
   `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`. (`CORS_ORIGIN` est pré-rempli avec les domaines chunwah.ma.)
3. **MongoDB Atlas → Network Access → Allow 0.0.0.0/0** (Render n'a pas d'IP sortante fixe).
4. Déployer → on obtient `https://chunwah-api.onrender.com`. L'ouvrir → `{"ok":true,...}`.
5. Créer l'admin une fois : service Render → **Shell** →
   `npm run seed:admin -- vous@exemple.com "MotDePasseSolide" "Votre Nom"`.

## 2. Frontend — site statique sur Hostinger

Builder en local (ou en CI), puis téléverser le dossier `out/`.

1. Dans `codebase/.env.local` (ou l'env CI), régler :
   ```
   NEXT_PUBLIC_SITE_URL=https://chunwah.ma
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
4. Activer le SSL pour chunwah.ma dans hPanel (Let's Encrypt gratuit).
5. **Redirection racine** : le site vit sous `/fr/` et `/en/` (pas de middleware en
   statique). Ajouter dans `public_html/.htaccess` une redirection de `/` vers `/fr/` :
   ```apache
   RewriteEngine On
   RewriteRule ^$ /fr/ [R=302,L]
   ```

Les URLs propres marchent nativement : `trailingSlash: true` émet `route/index.html`,
qu'Apache/LiteSpeed sert pour `/route/`.

## Mise à jour du contenu

- **Éditer un article existant :** via `chunwah.ma/admin` (écrit dans l'API). Les
  pages blog se rafraîchissent en direct dans le navigateur.
- **Ajouter un article (nouvelle URL) :** il apparaît en direct dans la liste, mais
  sa page statique SEO nécessite un **rebuild + re-upload** de `out/` (étapes 2–3).
  Envisager un rebuild planifié ou en CI.

---

## Checklist de migration (reste à porter)

Le pattern est établi sur **auth + articles**. Répliquer pour chaque ressource :

- [x] **Articles / blog** — modèle `Article`, routes `/api/articles`, admin `articles/*`, pages `[locale]/blog*`.
- [x] **Livres** — modèle `Book`, routes `/api/books`, admin `livres/*`, page `[locale]/livres`.
- [x] **Cours** — modèle `Program`, routes `/api/programs`, admin `cours/*`, pages `[locale]/cours*`
      (seam `src/lib/programs.ts` inchangé pour home/footer/horaires/sitemap).
- [x] **Parcours** — modèle `Roadmap` (singleton), routes `/api/roadmap` (+ `/api/uploads/doc`
      pour le PDF), admin `parcours`, page `[locale]/parcours`. Seam `src/lib/roadmap.ts`,
      snapshot `roadmap.data.json` ; l'endpoint public ne renvoie que le parcours publié.
- [ ] **Vidéos** — modèle `Video`, routes `/api/videos`, admin `videos/*`.
- [x] **Médias** — modèle `Media`, routes `/api/media`, admin `medias`. Seam `src/lib/media.ts`
      inchangé → noms d'instructeurs + images (hero/à propos/portraits) désormais snapshot,
      pages cours/horaires/home Mongo-free côté médias.
- [x] **Réglages** — modèle `Settings`, routes `/api/settings`, admin `reglages`. Seam
      `src/lib/settings.ts` inchangé → le `[locale]/layout.tsx` (partagé par CHAQUE page)
      ne lit plus Mongo.
- [ ] Convertir les pages admin restantes en **composants client** (`adminApi` + Bearer)
      et retirer `src/middleware.ts` (l'auth admin devient client-side).
- [ ] Retirer `revalidate` / lectures Mongo restantes incompatibles export ; baker chaque
      collection via `scripts/sync-content.mjs`.
- [ ] Supprimer `src/app/api/*`, les `src/models/*`, `src/lib/{auth,db}.ts` du frontend,
      et purger `mongoose/bcryptjs/jose/cloudinary` de `codebase/package.json`.

> **Note sur le build export** : il reste rouge tant que les **vidéos** (page d'accueil +
> admin `videos/[id]`, route dynamique impossible en export) et le **tableau de bord**
> admin lisent encore Mongo. Toutes les autres ressources sont déjà servies par snapshot.
