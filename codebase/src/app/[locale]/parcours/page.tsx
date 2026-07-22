import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { roadmap } from '@/lib/roadmap';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { breadcrumbSchema } from '@/lib/schema';
import PageHeader from '@/components/PageHeader';
import JsonLd from '@/components/JsonLd';
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

/** A URL points at a PDF when its path ends in .pdf (query string aside). */
function isPdf(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url);
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

  // What is the visual centrepiece? An uploaded image wins; otherwise a PDF file
  // is embedded. `fileUrl` is always offered as a download when present. Le
  // parcours vient du snapshot baké au build (src/lib/roadmap.data.json) : un
  // brouillon y arrive vide, d'où l'état « bientôt disponible ».
  const image = roadmap.imageUrl;
  const file = roadmap.fileUrl;
  const showPdfEmbed = !image && !!file && isPdf(file);
  const hasContent = !!image || showPdfEmbed;

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

          {!hasContent ? (
            <p className="lead" style={{ textAlign: 'center' }}>
              {t('empty')}
            </p>
          ) : (
            <figure className={styles.mapFrame}>
              <div className={styles.mapInner}>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={roadmap.imageAlt || t('title')}
                    className={styles.mapImage}
                  />
                ) : (
                  <iframe
                    src={`${file}#view=FitH`}
                    title={roadmap.imageAlt || t('title')}
                    className={styles.mapPdf}
                    loading="lazy"
                  />
                )}
              </div>

              {roadmap.note && (
                <figcaption className={styles.caption}>{roadmap.note}</figcaption>
              )}

              {file && (
                <div className={styles.actions}>
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.download}
                    download
                  >
                    ↓ {isPdf(file) ? t('downloadPdf') : t('download')}
                  </a>
                </div>
              )}
            </figure>
          )}
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
