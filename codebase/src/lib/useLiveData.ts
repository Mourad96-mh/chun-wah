'use client';

import { useEffect, useState } from 'react';

/**
 * Donnée baké au build, RÉALIGNÉE sur l'API au chargement de la page.
 *
 * Pourquoi : le site est un export statique. Sans ça, une modification faite
 * dans /admin (couverture d'un livre, nouvel article, vidéo…) n'apparaît qu'au
 * prochain build + téléversement. On rend d'abord le snapshot — le HTML reste
 * complet pour Google et pour les visiteurs sans JS — puis on remplace par les
 * données fraîches si l'API répond.
 *
 * En cas d'échec (API endormie, hors ligne), on garde le snapshot : la page ne
 * se vide jamais.
 */
export function useLiveData<T>(initial: T[], fetcher: () => Promise<T[]>): T[] {
  const [data, setData] = useState<T[]>(initial);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return;

    let cancelled = false;
    fetcher()
      .then((fresh) => {
        // Une réponse vide est suspecte (API réveillée à moitié, filtre côté
        // serveur) : on préfère garder le snapshot que vider la page.
        if (!cancelled && Array.isArray(fresh) && fresh.length > 0) setData(fresh);
      })
      .catch(() => {
        /* API injoignable : on garde le snapshot */
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}
