import styles from './Photo.module.css';

/**
 * A photo slot.
 *
 * When `url` is set (an image the client uploaded from /admin/medias) it renders
 * that image. Otherwise it falls back to a labelled placeholder showing the
 * intended path and alt text, so the client sees exactly which shot is missing.
 *
 * A plain <img> is used rather than next/image because uploads live on Cloudinary
 * at arbitrary sizes — matching how the blog covers are rendered — which avoids
 * whitelisting remote hosts in next.config.
 */
export default function Photo({
  src,
  alt,
  className,
  url,
  priority,
}: {
  src: string;
  alt: string;
  /** Uploaded image URL; when present it replaces the placeholder. */
  url?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`${styles.image} ${className ?? ''}`}
        src={url}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <div className={`${styles.photo} ${className ?? ''}`} role="img" aria-label={alt}>
      <span className={styles.label}>
        <span className={styles.badge}>Photo à fournir</span>
        {src}
        <br />
        <em>{alt}</em>
      </span>
    </div>
  );
}
