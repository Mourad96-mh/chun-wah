import type { ScheduleSlot } from './types';
import { programs } from './programs';
import { instructors } from './instructors';

/**
 * PLACEHOLDER TIMETABLE — replace with the real weekly schedule.
 *
 * `day`: 1 = Monday … 7 = Sunday.
 * `programSlug` must match a slug in programs.ts, `instructorSlug` one in
 * instructors.ts. Both are validated at build time by validateSchedule().
 */
export const schedule: ScheduleSlot[] = [
  // Monday
  { day: 1, start: '17:00', end: '18:00', programSlug: 'kung-fu-enfants', instructorSlug: 'instructrice-3' },
  { day: 1, start: '19:00', end: '20:30', programSlug: 'wing-chun-adultes', instructorSlug: 'sifu-placeholder' },
  // Tuesday
  { day: 2, start: '18:00', end: '19:15', programSlug: 'self-defense-femmes', instructorSlug: 'instructrice-3' },
  { day: 2, start: '19:30', end: '21:00', programSlug: 'sanda', instructorSlug: 'instructeur-2' },
  // Wednesday
  { day: 3, start: '15:00', end: '16:00', programSlug: 'kung-fu-enfants', instructorSlug: 'instructrice-3' },
  { day: 3, start: '19:00', end: '20:30', programSlug: 'wing-chun-adultes', instructorSlug: 'sifu-placeholder' },
  // Thursday
  { day: 4, start: '10:00', end: '11:00', programSlug: 'tai-chi', instructorSlug: 'sifu-placeholder' },
  { day: 4, start: '19:30', end: '21:00', programSlug: 'sanda', instructorSlug: 'instructeur-2' },
  // Friday
  { day: 5, start: '17:00', end: '18:00', programSlug: 'kung-fu-enfants', instructorSlug: 'instructrice-3' },
  { day: 5, start: '19:00', end: '20:30', programSlug: 'wing-chun-adultes', instructorSlug: 'sifu-placeholder' },
  // Saturday
  { day: 6, start: '10:00', end: '11:00', programSlug: 'tai-chi', instructorSlug: 'sifu-placeholder' },
  { day: 6, start: '11:15', end: '12:45', programSlug: 'wing-chun-adultes', instructorSlug: 'sifu-placeholder' },
  { day: 6, start: '14:00', end: '15:15', programSlug: 'self-defense-femmes', instructorSlug: 'instructrice-3' },
];

export const weekDays = [1, 2, 3, 4, 5, 6, 7] as const;

/** Slots for one day, sorted by start time. */
export function slotsForDay(day: number): ScheduleSlot[] {
  return schedule
    .filter((s) => s.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** Days that actually have at least one class, in week order. */
export function activeDays(): number[] {
  return weekDays.filter((d) => schedule.some((s) => s.day === d));
}

/**
 * Fails the build if a slot points at a program or instructor that no longer
 * exists — the most likely mistake when the timetable is edited by hand.
 */
export function validateSchedule(): void {
  const programSlugs = new Set(programs.map((p) => p.slug));
  const instructorSlugs = new Set(instructors.map((i) => i.slug));

  for (const slot of schedule) {
    const where = `${slot.start}–${slot.end} (day ${slot.day})`;
    if (!programSlugs.has(slot.programSlug)) {
      throw new Error(`schedule.ts: unknown programSlug "${slot.programSlug}" at ${where}`);
    }
    if (slot.instructorSlug && !instructorSlugs.has(slot.instructorSlug)) {
      throw new Error(`schedule.ts: unknown instructorSlug "${slot.instructorSlug}" at ${where}`);
    }
  }
}
