import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { dbConnect } from '@/lib/db';
import { Video, type VideoDoc } from '@/models/Video';
import { videoObjectsSchema } from '@/lib/schema';
import JsonLd from './JsonLd';
import styles from './VideoShowcase.module.css';

/**
 * "Cinématique" section for the home page: published showcase videos, managed
 * from /admin. Native <video> players (self-hosted MP4), not third-party embeds.
 *
 * Renders nothing when there are no published videos, so the section simply
 * does not exist until the client adds one — and, like the blog, it degrades to
 * empty rather than failing the build when the database is unreachable.
 */
async function fetchVideos(): Promise<VideoDoc[]> {
  await dbConnect();
  return Video.find({ status: 'published' })
    .sort({ order: 1, createdAt: -1 })
    .lean<VideoDoc[]>();
}

export default async function VideoShowcase({ locale }: { locale: Locale }) {
  let videos: VideoDoc[] = [];
  try {
    videos = await fetchVideos();
  } catch (err) {
    console.error('[home] videos unavailable:', err);
  }

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

        <div className={styles.grid}>
          {videos.map((v) => (
            <figure key={String(v._id)} className={styles.item}>
              <video
                className={styles.video}
                src={v.videoUrl}
                poster={v.poster || undefined}
                controls
                preload="none"
                playsInline
              />
              <figcaption className={styles.caption}>
                <span className={styles.title}>{v.title}</span>
                {v.description && <span className={styles.desc}>{v.description}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {schema.length > 0 && <JsonLd data={schema} />}
    </section>
  );
}
