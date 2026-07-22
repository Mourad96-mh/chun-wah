'use client';

import type { Locale } from '@/i18n/routing';
import type { Program } from '@/data/types';
import { fetchPrograms } from '@/lib/programs';
import { useLiveData } from '@/lib/useLiveData';
import ProgramCard from './ProgramCard';

/**
 * Grille de cours, réalignée sur l'API après chargement (voir useLiveData) :
 * un cours modifié dans /admin apparaît sans redéployer le site statique.
 */
export default function ProgramsList({
  initialPrograms,
  locale,
  className,
}: {
  initialPrograms: Program[];
  locale: Locale;
  className?: string;
}) {
  const programs = useLiveData(initialPrograms, fetchPrograms);

  return (
    <div className={className}>
      {programs.map((program) => (
        <ProgramCard key={program.slug} program={program} locale={locale} />
      ))}
    </div>
  );
}
