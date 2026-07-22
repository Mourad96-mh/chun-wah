import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { getPrograms } from '@/lib/programs';
import { getInstructors } from '@/lib/instructors';
import { schedule, validateSchedule } from '@/data/schedule';
import { buildMetadata } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { getMediaMap } from '@/lib/media';
import { faqSchema } from '@/lib/schema';
import LivePhoto from '@/components/LivePhoto';
import ProgramsList from '@/components/ProgramsList';
import ScheduleTable from '@/components/ScheduleTable';
import Testimonials from '@/components/Testimonials';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import VideoShowcase from '@/components/VideoShowcase';
import styles from './page.module.css';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return buildMetadata({
    title: t('metaTitle', { city: site.address.city, name: site.name }),
    description: t('metaDescription', { city: site.address.city }),
    href: '/',
    locale,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fails the build early if the timetable points at a deleted program.
  validateSchedule();

  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  const currentYear = new Date().getFullYear();

  // Sections the client has hidden 404 now, so the homepage must not link to
  // them either — gate the CTAs/sections that point at a hidden section.
  const { hiddenNav } = await getPublicSettings();
  const hidden = hiddenNav as string[];
  const programsHidden = hidden.includes('programs');
  const scheduleHidden = hidden.includes('schedule');
  const instructorsHidden = hidden.includes('instructors');

  // Client-uploaded images (hero, à propos); blank slots fall back to placeholders.
  const media = await getMediaMap();
  // Instructors with any admin name overrides (used by the schedule preview).
  const instructors = await getInstructors();
  // Courses from the DB (admin-managed).
  const programsByOrder = await getPrograms();

  return (
    <>
      {/* --- Hero --- */}
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <LivePhoto
            slot="hero"
            initialMedia={media}
            src="/images/hero.jpg"
            fallbackAlt={
              locale === 'fr'
                ? "Vue large de la salle d'entraînement pendant un cours"
                : 'Wide shot of the training hall during a class'
            }
            priority
            sizes="100vw"
          />
        </div>
        <div className={styles.heroOverlay} />

        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className="kicker">{t('heroKicker', { city: site.address.city })}</span>
            <h1 className={styles.heroTitle}>{t('heroTitle')}</h1>
            <p className={styles.heroSubtitle}>{t('heroSubtitle')}</p>
            <div className={styles.heroActions}>
              <Link href="/cours-essai-gratuit" className="btn btn-primary">
                {t('heroPrimaryCta')}
              </Link>
              {!scheduleHidden && (
                <Link href="/horaires" className="btn btn-outline">
                  {t('heroSecondaryCta')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats --- */}
      <section className={styles.stats} aria-label={t('aboutKicker')}>
        <div className="wrap">
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{currentYear - site.foundedYear}</span>
              <span className={styles.statLabel}>{t('statsYears')}</span>
            </div>
            <div className={styles.stat}>
              {/* TODO: real student count, or drop this tile. */}
              <span className={styles.statValue}>120+</span>
              <span className={styles.statLabel}>{t('statsStudents')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{programsByOrder.length}</span>
              <span className={styles.statLabel}>{t('statsPrograms')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>1</span>
              <span className={styles.statLabel}>{t('statsTrial')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- About --- */}
      <section className="section">
        <div className="wrap">
          <div className={styles.about}>
            <div className={styles.aboutMedia}>
              <LivePhoto
                slot="academy"
                initialMedia={media}
                src="/images/academy.jpg"
                fallbackAlt={
                  locale === 'fr'
                    ? "L'intérieur de l'académie Chun Wah"
                    : 'Inside the Chun Wah academy'
                }
                sizes="(max-width: 860px) 100vw, 50vw"
              />
            </div>
            <div className={styles.aboutBody}>
              <span className="kicker">{t('aboutKicker')}</span>
              <h2>{t('aboutTitle')}</h2>
              <p>{t('aboutBody')}</p>
              {!instructorsHidden && (
                <Link href="/instructeurs" className="btn btn-outline">
                  {tc('learnMore')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Video showcase (renders only if published videos exist) --- */}
      <VideoShowcase locale={locale} />

      {/* --- Programs (whole section links into /cours, hidden with it) --- */}
      {!programsHidden && (
        <section className="section section-alt">
          <div className="wrap">
            <div className={styles.sectionHead}>
              <span className="kicker">{t('programsKicker')}</span>
              <h2>{t('programsTitle')}</h2>
              <p className="lead">{t('programsIntro')}</p>
            </div>

            <ProgramsList
              initialPrograms={programsByOrder}
              locale={locale}
              className={styles.cardGrid}
            />

            <div className={styles.centerLink}>
              <Link href="/cours" className="btn btn-outline">
                {tc('allPrograms')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --- Why us --- */}
      <section className="section">
        <div className="wrap">
          <div className={styles.sectionHead}>
            <span className="kicker">{t('whyKicker')}</span>
            <h2>{t('whyTitle')}</h2>
          </div>
          <div className={styles.whyGrid}>
            <div className={styles.whyItem}>
              <h3>{t('why1Title')}</h3>
              <p>{t('why1Body')}</p>
            </div>
            <div className={styles.whyItem}>
              <h3>{t('why2Title')}</h3>
              <p>{t('why2Body')}</p>
            </div>
            <div className={styles.whyItem}>
              <h3>{t('why3Title')}</h3>
              <p>{t('why3Body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Schedule preview (links to /horaires, hidden with it) --- */}
      {!scheduleHidden && (
        <section className="section section-alt">
          <div className="wrap">
            <div className={styles.sectionHead}>
              <span className="kicker">{t('scheduleKicker')}</span>
              <h2>{t('scheduleTitle')}</h2>
              <p className="lead">{t('scheduleIntro')}</p>
            </div>

            <ScheduleTable
              slots={schedule}
              programs={programsByOrder}
              instructors={instructors}
              locale={locale}
              showFilters={false}
              linkPrograms={!programsHidden}
            />

            <div className={styles.scheduleFoot}>
              <Link href="/horaires" className="btn btn-outline">
                {tc('viewSchedule')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --- Testimonials --- */}
      <section className="section section-dark">
        <div className="wrap">
          <div className={`${styles.sectionHead} ${styles.sectionHeadCentered}`}>
            <span className="kicker">{t('testimonialsKicker')}</span>
            <h2>{t('testimonialsTitle')}</h2>
          </div>
          <Testimonials locale={locale} />
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="section">
        <div className="wrap-narrow">
          <div className={styles.sectionHead}>
            <span className="kicker">{t('faqKicker')}</span>
            <h2>{t('faqTitle')}</h2>
          </div>
          <Faq locale={locale} />
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className={styles.cta}>
        <div className={`wrap ${styles.ctaInner}`}>
          <h2>{t('ctaTitle')}</h2>
          <p className={styles.ctaBody}>{t('ctaBody')}</p>
          <Link href="/cours-essai-gratuit" className={`btn ${styles.ctaButton}`}>
            {t('ctaButton')}
          </Link>
        </div>
      </section>

      <JsonLd data={faqSchema(locale)} />
    </>
  );
}
