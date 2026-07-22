import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { videos } from '@/lib/videos';
import { videoObjectsSchema } from '@/lib/schema';
import JsonLd from './JsonLd';
import VideoGrid from './VideoGrid';
import styles from './VideoShowcase.module.css';

/**
 * "Cinématique" section for the home page: published showcase videos, managed
 * from /admin. Native <video> players (self-hosted MP4), not third-party embeds.
 *
 * La liste vient du snapshot baké au build (src/lib/videos.data.json). Elle ne
 * rend rien quand aucune vidéo n'est publiée : la section n'existe simplement
 * pas tant que le client n'en a pas ajouté une.
 */
export default async function VideoShowcase({ locale }: { locale: Locale }) {
  if (videos.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'home' });
  const schema = videoObjectsSchema(videos);

  return (
    <section className="section section-dark">
      <div className="wrap">
        <div className={styles.head}>
          <span className="kicker">{t('videosKicker')}</span>
          <h2>{t('videosTitle')}</h2>
          <p className="lead">{t('videosIntro')}</p>
        </div>

        <VideoGrid initialVideos={videos} />
      </div>

      {schema.length > 0 && <JsonLd data={schema} />}
    </section>
  );
}
