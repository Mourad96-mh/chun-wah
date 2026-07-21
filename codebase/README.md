# Chun Wah — site vitrine

Site vitrine bilingue (FR/EN) pour une académie d'arts martiaux, inspiré de
[thedojonyc.com](https://www.thedojonyc.com/) et
[allstarjiujitsu.com](https://www.allstarjiujitsu.com/).

**Stack** : Next.js 15 (App Router) · next-intl · CSS pur (CSS Modules) ·
MongoDB + Mongoose · admin sur mesure. Aucune dépendance UI.

Le site vitrine est statique ; le blog et la page Livres sont en ISR
(revalidation 5 min) car leur contenu vient de MongoDB.

```bash
cp .env.example .env.local        # puis remplir MONGODB_URI + AUTH_SECRET
npm install
npm run seed:admin -- vous@exemple.com "MotDePasseSolide" "Votre Nom"
npm run dev                       # http://localhost:3000 → /fr
npm run build && npm run start
```

L'admin est sur **`/admin`** (hors routage i18n, en français uniquement).

## ⚠️ État actuel : contenu placeholder

Le site est **entièrement fonctionnel mais rempli de contenu inventé**. Il est
volontairement bloqué à l'indexation (`robots.txt` en `Disallow: /` + `robots:
noindex` dans le layout) tant que les vraies données ne sont pas en place.

Tout ce qui doit changer est marqué `TODO` dans le code :

```bash
grep -rn "TODO" src/
```

## Ce qu'il faut demander au client

### Bloquant

| Quoi | Où le mettre |
|---|---|
| Nom exact, ville, adresse complète, coordonnées GPS | `src/data/site.ts` |
| Téléphone, WhatsApp, e-mail, réseaux sociaux | `src/data/site.ts` |
| Nom de domaine (canonicals, sitemap, OG) | `src/data/site.ts` → `url` |
| Liste réelle des disciplines enseignées | `src/data/programs.ts` |
| Planning hebdomadaire réel | `src/data/schedule.ts` |
| Instructeurs : nom, grade, bio, photo | `src/data/instructors.ts` |
| **Vrais avis clients** (voir ci-dessous) | `src/data/testimonials.ts` |

### Photos

C'est ce qui fait tout le poids visuel des deux sites de référence. Sans photos,
le site restera générique. Emplacements attendus (voir les blocs « PHOTO À
FOURNIR » sur le site) :

- `/public/images/hero.jpg` — plan large de la salle pendant un cours
- `/public/images/academy.jpg` — intérieur de l'académie
- `/public/images/programs/*.jpg` — une par discipline
- `/public/images/instructors/*.jpg` — un portrait par instructeur
- `/public/images/og-default.jpg` — 1200×630, image de partage

Une fois les photos livrées : remplacer le corps de `src/components/Photo.tsx`
par `next/image` (les props sont déjà celles attendues, aucun call site à
toucher).

### Avis clients — important

Les témoignages actuels sont **inventés** et servent uniquement de gabarit.
Publier de faux avis est malhonnête et juridiquement risqué pour le client.
Source recommandée : les avis Google Business existants, ou 3–4 élèves fidèles
sollicités directement, avec leur accord pour la publication.

## Blog & livres (contenu géré par le client)

Le client publie lui-même depuis `/admin` : articles de blog et livres
recommandés, avec brouillon/publication, éditeur Markdown avec aperçu, et
upload d'images.

- **Blog en français uniquement.** `/en/blog` et `/en/livres` redirigent vers
  la version française, et aucun `hreflang` n'est émis pour ces pages : mieux
  vaut pas de version anglaise que des pages vides qui diluent le site. Les
  liens Blog/Livres sont masqués dans le menu anglais.
- **Livres** : liste curatée groupée par catégorie. Pas de liens affiliés. Si
  le client en veut plus tard, il faudra ajouter un champ `url` **et** une
  mention d'affiliation visible sur la page (obligation légale).
- **Images** : upload vers Cloudinary si les clés sont renseignées, sinon
  l'admin accepte une URL collée à la main. Le compte gratuit suffit largement.
- **Sécurité** : le Markdown est assaini (`sanitize-html`) avant affichage, les
  mots de passe sont hachés en bcrypt, la session est un JWT en cookie httpOnly
  de 8 h, et il n'existe aucune route d'inscription publique — seul
  `npm run seed:admin` crée un compte.

Publier ou modifier un contenu déclenche un `revalidatePath` : la modification
est visible immédiatement, sans attendre la fenêtre ISR ni redéployer.

### Vidéos — section « L'académie en mouvement » (accueil)

Le client ajoute lui-même des vidéos depuis `/admin/videos`. Elles s'affichent
dans une section de la page d'accueil, jouées dans un **lecteur natif** (pas
d'embed YouTube/Vimeo, donc pas de marque tierce). La section n'apparaît que
s'il existe au moins une vidéo publiée — sinon elle n'existe pas.

- **Hébergement** : le fichier est téléversé **directement du navigateur vers
  Cloudinary** (upload signé via `/api/admin/upload/sign`). C'est nécessaire car
  une route serverless plafonne la taille des requêtes (~4,5 Mo sur Vercel) ;
  l'upload direct contourne cette limite. Limite fichier : 100 Mo (palier
  gratuit Cloudinary) — garder les clips courts et compressés.
- **Alternative auto-hébergée** : le champ accepte aussi une URL/chemin collé à
  la main. Pour servir un vrai fichier depuis `/public`, déposer
  `public/videos/mon-clip.mp4` **au moment du déploiement** et coller
  `/videos/mon-clip.mp4`. (Un upload à chaud vers `/public` ne survivrait pas
  sur un hébergement serverless — d'où le choix de Cloudinary par défaut.)
- **SEO** : chaque vidéo dotée d'un poster émet un JSON-LD `VideoObject`. Sans
  poster, la vidéo se lit quand même mais n'émet pas de JSON-LD (Google exige un
  `thumbnailUrl`). Fournir un poster est donc recommandé.
- Conséquence : la page d'accueil passe en ISR (revalidation 5 min) comme le
  blog ; publier/modifier une vidéo revalide `/fr` et `/en`.

### Parcours de l'élève — page `/parcours` (cartes)

Le parcours de progression est une **suite de cartes** que le client gère depuis
`/admin/parcours` (liste / nouvelle / modifier, comme le blog et les vidéos).
Chaque étape a : un **titre**, une **image**, une **courte description**, un
texte **« En savoir plus »** (déroulé via `<details>`, 0 JS) et un **fichier
téléchargeable** (image ou PDF), avec ordre et brouillon/publication.

La page `/parcours` (EN : `/roadmap`) affiche les cartes publiées en grille
responsive, numérotées 1..N dans l'ordre, suivies d'un CTA vers le cours d'essai.

- **Images** : Cloudinary (route image existante, 5 Mo) ou URL collée.
- **Téléchargement** : via `/api/admin/upload/doc` (Cloudinary, PDF/image, 4 Mo —
  au-delà, coller une URL).
- **Bilingue** : FR (`/parcours`) ↔ EN (`/roadmap`) avec hreflang ; le contenu
  des cartes (titre/description) est saisi tel quel côté admin (français).
- ISR 5 min ; publier/modifier revalide `/fr/parcours` et `/en/roadmap`, page au
  sitemap. Empty state tant qu'aucune carte n'est publiée.
- Démo : `node scripts/seed-demo-roadmap.mjs` (et `--clear` pour tout retirer).

### Conséquence : l'hébergement change

Le site n'est plus purement statique. Il faut désormais un hébergement Node
(Vercel, Railway, VPS…) **et** une base MongoDB (Atlas M0 gratuit suffit).
Variables d'environnement à définir en production : voir `.env.example`.

Si la base est injoignable, le blog et la page Livres s'affichent vides au lieu
de faire tomber tout le site — c'est volontaire, l'erreur est loguée côté
serveur.

## Captures client (maquette PDF)

Même dispositif que les autres projets : Edge piloté par `puppeteer-core`,
captures pleine page en 2× (retina), puis assemblage en PDF.

```bash
npm run build && npx next start -p 4178   # le serveur doit tourner sur 4178
npm run shoot                             # desktop + mobile, FR
npm run shoot -- desktop en               # variantes : [desktop|mobile|both] [fr|en|both]
npm run pdf                               # → Chun-Wah-maquette-{desktop,mobile}.pdf
```

Sorties : `client-screenshots/` (1440×900) et `client-screenshots-mobile/`
(390×844) ; en anglais, `client-screenshots-en{,-mobile}/`.

### Envoi par WhatsApp

WhatsApp ré-encode tout ce qui part en **photo** et plafonne le plus grand côté
à ~1600 px : une capture pleine page de 11 000 px arrive illisible.

- **Le PDF** : l'envoyer en **document** (pas depuis la galerie) — WhatsApp ne
  le recompresse pas. C'est la meilleure qualité, et le plus simple.
- **Des images qui s'affichent dans la conversation** :

```bash
npm run shoot:whatsapp    # → whatsapp/desktop/ et whatsapp/mobile/
```

Découpe chaque page en tuiles portrait déjà sous la limite (1080 px de large en
desktop, 780 px en mobile, ~1440 px de haut, JPEG 92 sans sous-échantillonnage
chroma), avec 48 px de recouvrement pour qu'aucune ligne ne tombe sur une
coupure. WhatsApp n'a plus rien à réduire, le texte reste net.

Ne pas agrandir les captures mobiles vers 1080 px : elles font 780 px (390 CSS
× 2) et l'agrandissement ramollit le texte tout en triplant le nombre de tuiles.

La liste des pages est dérivée de `src/i18n/routing.ts` et des slugs de
`src/data/programs.ts` — ajouter une discipline suffit pour qu'elle soit
capturée. Le script ouvre tous les `<details>` (les réponses FAQ sont donc
visibles), fait défiler la page pour déclencher le lazy-loading, et plafonne le
`deviceScaleFactor` quand une page dépasse la limite de 16384 px de Chromium
(c'est le cas de l'accueil en mobile, capturé à 1,41×).

## Architecture

```
src/
  data/          ← contenu éditorial statique (cours, instructeurs, planning)
  models/        ← schémas Mongoose (Article, Book, Admin)
  i18n/          ← locales, URLs localisées (/fr/cours ↔ /en/programs)
  lib/           ← db, auth, markdown, SEO, JSON-LD
  components/    ← composants publics + leur CSS Module
    admin/       ← composants de l'admin
  app/[locale]/  ← pages publiques
  app/admin/     ← interface d'administration (second root layout)
  app/api/       ← auth + CRUD articles/livres + upload
  app/sitemap.xml, app/robots.txt   ← Route Handlers (voir note ci-dessous)
scripts/seed-admin.mjs               ← création du compte admin
```

Ajouter/retirer une discipline dans `src/data/programs.ts` met à jour
automatiquement : la grille d'accueil, la page /cours, les pages détail, le
filtre du planning, le menu du footer, le formulaire d'essai et le sitemap.

`validateSchedule()` casse le build si le planning référence un cours ou un
instructeur supprimé.

### Note : sitemap & robots en Route Handlers

Ils ne sont **pas** écrits en `app/sitemap.ts` / `app/robots.ts` : le loader de
métadonnées de Next casse sur les chemins de projet contenant un espace ou une
apostrophe, et ce projet vit dans `…/Bureau/CHUN WAH`. Ne pas « corriger » en
repassant aux fichiers de métadonnées.

## SEO déjà en place

- Métadonnées + canonical + hreflang (`fr`, `en`, `x-default`) sur chaque page
- URLs localisées : `/fr/cours/wing-chun-adultes` ↔ `/en/programs/wing-chun-adultes`
- JSON-LD : `SportsActivityLocation`, `Course` + `CourseInstance`, `FAQPage`,
  `BreadcrumbList`, `BlogPosting` sur chaque article
- Sitemap XML avec alternates, articles publiés inclus automatiquement
- Polices via `next/font` (pas de requête externe), FAQ en `<details>` natif
  (0 JS, réponses crawlables), skip link, focus visible

## Checklist de mise en ligne

1. Remplacer tous les `TODO` de `src/data/`
2. Livrer les vraies photos + swap `Photo.tsx` → `next/image`
3. Remplacer les faux témoignages par de vrais avis
4. Mettre le vrai domaine dans `site.url`
5. **Ouvrir l'indexation** : `src/app/robots.txt/route.ts` (`Allow: /`) et
   retirer le bloc `robots: { index: false }` de `src/app/[locale]/layout.tsx`
6. Vérifier chaque JSON-LD avec le test des résultats enrichis de Google
7. Créer / réclamer la fiche Google Business Profile (le levier n°1 en local)
8. Créer la base MongoDB Atlas + définir `MONGODB_URI`, `AUTH_SECRET` et les
   clés Cloudinary en production
9. Créer le compte admin du client (`npm run seed:admin`) et lui montrer
   comment publier un article — prévoyez 20 min de démo, c'est ce qui décide
   s'il s'en sert vraiment
