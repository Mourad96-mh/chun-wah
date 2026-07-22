import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { roadmap, hasRoadmapContent } from '@/lib/roadmap';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { breadcrumbSchema } from '@/lib/schema';
import PageHeader from '@/components/PageHeader';
import JsonLd from '@/components/JsonLd';
import RoadmapFigure from '@/components/RoadmapFigure';
import styles from './parcours.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'roadmap' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name }),
    href: '/parcours',
    locale,
  });
}

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('roadmap');

  const t = await getTranslations('roadmap');
  const tn = await getTranslations('nav');

  // Le schéma lui-même est rendu par RoadmapFigure (composant client, réaligné
  // sur l'API). Ici on ne garde que de quoi décider si la frise décorative a du
  // sens : le snapshot baké suffit.
  const hasContent = hasRoadmapContent(roadmap);

  // Decorative milestone nodes for the journey strip — content-neutral so they
  // never contradict whatever the academy drew on its own map.
  const milestones = [t('journeyStart'), '', '', t('journeyEnd')];

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('roadmap') }]}
      />

      <section className={`section ${styles.showcase}`}>
        <div className="wrap">
          <div className={styles.head}>
            <span className="kicker">{t('stagesKicker')}</span>
            <h2>{t('stagesTitle')}</h2>
          </div>

          {/* Journey strip — a dashed path with numbered milestone nodes. Pure
              decoration; the real content is the uploaded map below it. */}
          <ol className={styles.journey} aria-hidden={!hasContent}>
            {milestones.map((label, i) => (
              <li key={i} className={styles.milestone}>
                <span className={styles.node}>{i + 1}</span>
                {label && <span className={styles.nodeLabel}>{label}</span>}
              </li>
            ))}
          </ol>

          <RoadmapFigure initialRoadmap={roadmap} />
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`wrap ${styles.ctaInner}`}>
          <h2>{t('ctaTitle')}</h2>
          <Link href="/cours-essai-gratuit" className={`btn ${styles.ctaButton}`}>
            {t('ctaButton')}
          </Link>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('roadmap'), url: absoluteUrl('/parcours', locale) },
        ])}
      />
    </>
  );
}
