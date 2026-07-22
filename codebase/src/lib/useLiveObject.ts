'use client';

import { useEffect, useState } from 'react';

/**
 * Variante singleton de useLiveData : pour les ressources qui sont un objet et
 * non une liste (carte des images du site, parcours de l'élève).
 *
 * Même principe : on rend le snapshot baké (HTML complet pour Google et sans
 * JS), puis on se réaligne sur l'API au chargement pour refléter l'admin sans
 * redéployer. En cas d'échec, on garde le snapshot.
 */
export function useLiveObject<T>(initial: T, fetcher: () => Promise<T>): T {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return;

    let cancelled = false;
    fetcher()
      .then((fresh) => {
        if (!cancelled && fresh) setValue(fresh);
      })
      .catch(() => {
        /* API injoignable : on garde le snapshot */
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}
