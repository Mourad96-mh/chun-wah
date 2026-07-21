'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Program, Instructor, ScheduleSlot } from '@/data/types';
import { pick } from '@/lib/localized';
import styles from './ScheduleTable.module.css';

/**
 * Data is passed in from the server page (already locale-resolved lookups are
 * done here) so the timetable stays a single source of truth in schedule.ts.
 */
export default function ScheduleTable({
  slots,
  programs,
  instructors,
  locale,
  showFilters = true,
  linkPrograms = true,
}: {
  slots: ScheduleSlot[];
  programs: Program[];
  instructors: Instructor[];
  locale: Locale;
  showFilters?: boolean;
  /** When false, class names render as plain text (the /cours pages are hidden). */
  linkPrograms?: boolean;
}) {
  const t = useTranslations('schedule');
  const [filter, setFilter] = useState<string>('all');

  const programBySlug = useMemo(
    () => new Map(programs.map((p) => [p.slug, p])),
    [programs],
  );
  const instructorBySlug = useMemo(
    () => new Map(instructors.map((i) => [i.slug, i])),
    [instructors],
  );

  const visible = useMemo(
    () => (filter === 'all' ? slots : slots.filter((s) => s.programSlug === filter)),
    [slots, filter],
  );

  const days = useMemo(() => {
    const present = [...new Set(visible.map((s) => s.day))].sort((a, b) => a - b);
    return present.map((day) => ({
      day,
      slots: visible
        .filter((s) => s.day === day)
        .sort((a, b) => a.start.localeCompare(b.start)),
    }));
  }, [visible]);

  return (
    <div>
      {showFilters && (
        <div className={styles.filters} role="group" aria-label={t('filterLabel')}>
          <button
            type="button"
            className={`${styles.filter} ${filter === 'all' ? styles.filterActive : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            {t('filterAll')}
          </button>
          {programs.map((p) => (
            <button
              key={p.slug}
              type="button"
              className={`${styles.filter} ${filter === p.slug ? styles.filterActive : ''}`}
              aria-pressed={filter === p.slug}
              onClick={() => setFilter(p.slug)}
            >
              {pick(p.name, locale)}
            </button>
          ))}
        </div>
      )}

      {days.length === 0 ? (
        <p className={styles.noResults}>{t('noResults')}</p>
      ) : (
        <div className={styles.days}>
          {days.map(({ day, slots: daySlots }) => (
            <section key={day} className={styles.day}>
              <h3 className={styles.dayName}>{t(`days.${day}` as 'days.1')}</h3>
              {daySlots.length === 0 ? (
                <p className={styles.empty}>{t('noClasses')}</p>
              ) : (
                <ul className={styles.slots}>
                  {daySlots.map((slot, i) => {
                    const program = programBySlug.get(slot.programSlug);
                    const instructor = slot.instructorSlug
                      ? instructorBySlug.get(slot.instructorSlug)
                      : undefined;

                    return (
                      <li key={`${slot.start}-${i}`} className={styles.slot}>
                        <span className={styles.time}>
                          {slot.start}–{slot.end}
                        </span>
                        <span className={styles.slotName}>
                          {program ? (
                            linkPrograms ? (
                              <Link
                                href={{
                                  pathname: '/cours/[slug]',
                                  params: { slug: program.slug },
                                }}
                              >
                                {pick(program.name, locale)}
                              </Link>
                            ) : (
                              pick(program.name, locale)
                            )
                          ) : (
                            slot.programSlug
                          )}
                          {instructor && (
                            <span className={styles.slotInstructor}>
                              {t('with')} {instructor.name}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
