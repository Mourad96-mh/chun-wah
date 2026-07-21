import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { getInstructors } from '@/lib/instructors';
import { buildMetadata } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { getMediaMap } from '@/lib/media';
import { pick, pickList } from '@/lib/localized';
import PageHeader from '@/components/PageHeader';
import Photo from '@/components/Photo';
import styles from './instructors.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'instructors' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name, city: site.address.city }),
    href: '/instructeurs',
    locale,
  });
}

export default async function InstructorsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('instructors');

  const t = await getTranslations('instructors');
  const tn = await getTranslations('nav');

  // Client-uploaded portraits keyed by 'instructor:<slug>'; blank = placeholder.
  const media = await getMediaMap();
  // Names may be overridden from the admin.
  const instructors = await getInstructors();

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('instructors') }]}
      />

      <section className="section">
        <div className="wrap">
          <div className={styles.list}>
            {instructors.map((instructor) => (
              <article key={instructor.slug} className={styles.card}>
                <div className={styles.media}>
                  <Photo
                    src={instructor.image}
                    url={media[`instructor:${instructor.slug}`]?.url}
                    alt={
                      media[`instructor:${instructor.slug}`]?.alt ||
                      `${instructor.name} — ${pick(instructor.title, locale)}`
                    }
                    sizes="(max-width: 760px) 100vw, 300px"
                  />
                </div>

                <div>
                  <h2 className={styles.name}>{instructor.name}</h2>
                  <span className={styles.role}>{pick(instructor.title, locale)}</span>
                  <p className={styles.bio}>{pick(instructor.bio, locale)}</p>

                  <h3 className={styles.credTitle}>{t('credentials')}</h3>
                  <ul className={styles.creds}>
                    {pickList(instructor.credentials, locale).map((cred) => (
                      <li key={cred} className={styles.cred}>
                        {cred}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
