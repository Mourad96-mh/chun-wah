import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { getProgramBySlug, getPublishedProgramSlugs } from '@/lib/programs';
import { getInstructorMap } from '@/lib/instructors';
import { schedule } from '@/data/schedule';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { programSchema, breadcrumbSchema } from '@/lib/schema';
import { pick, pickList } from '@/lib/localized';
import PageHeader from '@/components/PageHeader';
import Photo from '@/components/Photo';
import JsonLd from '@/components/JsonLd';
import styles from './program.module.css';

type Params = { locale: Locale; slug: string };

export async function generateStaticParams() {
  const slugs = await getPublishedProgramSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return {};

  return buildMetadata({
    title: `${pick(program.name, locale)} — ${site.address.city}`,
    description: pick(program.tagline, locale),
    href: { pathname: '/cours/[slug]', params: { slug } },
    locale,
    image: program.image,
  });
}

export default async function ProgramPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  await assertNavVisible('programs');

  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const t = await getTranslations('programs');
  const tc = await getTranslations('common');
  const tn = await getTranslations('nav');
  const ts = await getTranslations('schedule');

  const slots = schedule
    .filter((s) => s.programSlug === slug)
    .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));

  // Instructors who actually teach this class, de-duplicated (name overrides applied).
  const instructorMap = await getInstructorMap();
  const teachers = [
    ...new Set(slots.map((s) => s.instructorSlug).filter(Boolean) as string[]),
  ]
    .map((s) => instructorMap.get(s))
    .filter(Boolean);

  return (
    <>
      <PageHeader
        title={pick(program.name, locale)}
        intro={pick(program.tagline, locale)}
        crumbs={[
          { label: tn('home'), href: '/' },
          { label: tn('programs'), href: '/cours' },
          { label: pick(program.name, locale) },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.media}>
                <Photo
                  src={program.image}
                  url={program.image?.startsWith('http') ? program.image : undefined}
                  alt={pick(program.imageAlt, locale)}
                  priority
                  sizes="(max-width: 900px) 100vw, 60vw"
                />
              </div>

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{tc('ageRange')}</span>
                  <span className={styles.metaValue}>{pick(program.ageRange, locale)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{tc('level')}</span>
                  <span className={styles.metaValue}>{pick(program.level, locale)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{tc('duration')}</span>
                  <span className={styles.metaValue}>{pick(program.duration, locale)}</span>
                </div>
              </div>

              <p className={styles.intro}>{pick(program.intro, locale)}</p>

              <h2 className={styles.blockTitle}>{t('detailBenefits')}</h2>
              <ul className={styles.benefits}>
                {pickList(program.benefits, locale).map((benefit) => (
                  <li key={benefit} className={styles.benefit}>
                    {benefit}
                  </li>
                ))}
              </ul>

              <Link href="/cours" className="btn btn-outline">
                {tc('backToPrograms')}
              </Link>
            </div>

            <aside className={styles.aside}>
              <h2 className={styles.asideTitle}>{t('detailSchedule')}</h2>

              {slots.length === 0 ? (
                <p className={styles.asideEmpty}>{t('detailNoSlots')}</p>
              ) : (
                <div className={styles.asideSlots}>
                  {slots.map((slot, i) => (
                    <div key={`${slot.day}-${slot.start}-${i}`} className={styles.asideSlot}>
                      <span className={styles.asideDay}>
                        {ts(`days.${slot.day}` as 'days.1')}
                      </span>
                      <span className={styles.asideTime}>
                        {slot.start}–{slot.end}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {teachers.length > 0 && (
                <>
                  <h2 className={styles.asideTitle}>{t('detailInstructors')}</h2>
                  <div className={styles.instructorList}>
                    {teachers.map((teacher) => (
                      <span key={teacher!.slug}>{teacher!.name}</span>
                    ))}
                  </div>
                </>
              )}

              <Link href="/cours-essai-gratuit" className="btn btn-primary btn-block">
                {t('detailCta')}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <JsonLd data={programSchema(program, locale)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('programs'), url: absoluteUrl('/cours', locale) },
          {
            name: pick(program.name, locale),
            url: absoluteUrl({ pathname: '/cours/[slug]', params: { slug } }, locale),
          },
        ])}
      />
    </>
  );
}
