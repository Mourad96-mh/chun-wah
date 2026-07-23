'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import { fetchTeam, getTeam, type TeamMember, type TeamSocials } from '@/lib/team';
import { useLiveData } from '@/lib/useLiveData';
import Photo from './Photo';
import styles from '@/app/[locale]/equipe/team.module.css';

const SOCIAL_LABELS: Record<keyof TeamSocials, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

/**
 * Grille des membres de l'équipe (photo + nom + rôle + bio + liens sociaux),
 * réalignée sur l'API après chargement : ajouter ou modifier un membre dans
 * /admin/equipe apparaît sans redéployer le site statique.
 */
export default function TeamList({ initialTeam }: { initialTeam: TeamMember[] }) {
  const t = useTranslations('team');
  const locale = useLocale() as Locale;
  const team = useLiveData(initialTeam, fetchTeam);

  if (!team.length) {
    return (
      <p className="lead" style={{ textAlign: 'center' }}>
        {t('empty')}
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {team.map((member) => {
        const role = member.role[locale].trim();
        const bio = member.bio[locale].trim();
        const socials = (Object.keys(SOCIAL_LABELS) as (keyof TeamSocials)[])
          .map((k) => ({ key: k, href: member.socials[k], label: SOCIAL_LABELS[k] }))
          .filter((s) => s.href);

        return (
          <article key={member.id} className={styles.card}>
            <div className={styles.media}>
              <Photo
                src={member.image || '/images/instructors/placeholder.jpg'}
                // Seules les vraies images téléversées (URL http) s'affichent ;
                // les chemins statiques du roster de repli passent en cadre
                // « photo à fournir ».
                url={member.image.startsWith('http') ? member.image : undefined}
                alt={role ? `${member.name} — ${role}` : member.name}
                sizes="(max-width: 640px) 100vw, 320px"
              />
              {socials.length > 0 && (
                <div className={styles.socials}>
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.social}
                      aria-label={`${member.name} — ${s.label}`}
                    >
                      {s.label.charAt(0)}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.body}>
              <h2 className={styles.name}>{member.name}</h2>
              {role && <span className={styles.role}>{role}</span>}
              {bio && <p className={styles.bio}>{bio}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
