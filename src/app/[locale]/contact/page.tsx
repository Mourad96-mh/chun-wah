import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { pick } from '@/lib/localized';
import PageHeader from '@/components/PageHeader';
import styles from './contact.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name, city: site.address.city }),
    href: '/contact',
    locale,
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('contact');

  const t = await getTranslations('contact');
  const tn = await getTranslations('nav');
  const tc = await getTranslations('common');

  // TODO: replace with the embed URL from the client's Google Business Profile.
  const mapEmbedSrc = `https://maps.google.com/maps?q=${site.address.lat},${site.address.lng}&z=15&output=embed`;

  const socials = [
    { href: site.social.instagram, label: 'Instagram' },
    { href: site.social.facebook, label: 'Facebook' },
    { href: site.social.youtube, label: 'YouTube' },
    { href: site.social.tiktok, label: 'TikTok' },
  ].filter((s) => s.href);

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('contact') }]}
      />

      <section className="section">
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.block}>
                <h2 className={styles.blockTitle}>{t('addressTitle')}</h2>
                <address className={styles.address}>
                  {site.address.street}
                  <br />
                  {site.address.district}, {site.address.postalCode} {site.address.city}
                  <br />
                  {pick(site.address.countryName, locale)}
                </address>
              </div>

              <div className={styles.block}>
                <h2 className={styles.blockTitle}>{t('contactTitle')}</h2>
                <span className={styles.contactLine}>
                  <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
                </span>
                <span className={styles.contactLine}>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </span>
              </div>

              <div className={styles.block}>
                <h2 className={styles.blockTitle}>{t('hoursTitle')}</h2>
                <div className={styles.hours}>
                  {site.openingHours.map((row, i) => (
                    <div key={i} className={styles.hoursRow}>
                      <span className={styles.hoursDays}>{pick(row.days, locale)}</span>
                      <span className={styles.hoursTime}>{pick(row.hours, locale)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {socials.length > 0 && (
                <div className={styles.block}>
                  <h2 className={styles.blockTitle}>{t('followUs')}</h2>
                  <div className={styles.social}>
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        className="btn btn-outline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <Link href="/cours-essai-gratuit" className="btn btn-primary">
                  {tc('bookTrial')}
                </Link>
                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  className="btn btn-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tc('whatsapp')}
                </a>
              </div>
            </div>

            <div>
              <h2 className={styles.blockTitle}>{t('mapTitle')}</h2>
              <div className={styles.mapWrap}>
                <iframe
                  className={styles.map}
                  src={mapEmbedSrc}
                  title={t('mapTitle')}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className={styles.actions}>
                <a
                  href={site.address.mapsUrl}
                  className="btn btn-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('openMaps')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
