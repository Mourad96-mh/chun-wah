'use client';

import { useEffect, useState } from 'react';
import { isNavKey, type NavKey } from '@/lib/nav';

/**
 * Liens de nav masqués, RAFRAÎCHIS EN DIRECT depuis l'API.
 *
 * Pourquoi : le site est un export statique. Le snapshot baké au build
 * (settings.data.json) fixerait le menu jusqu'au prochain déploiement — le
 * client masquerait un lien depuis /admin sans rien voir changer. On part donc
 * du snapshot (HTML correct pour le SEO et sans JS), puis on réaligne sur l'API
 * au chargement : le basculement devient effectif au rafraîchissement suivant.
 *
 * `initial` vient du snapshot : en cas d'API injoignable, on le garde.
 */
export function useHiddenNav(initial: NavKey[]): NavKey[] {
  const [hidden, setHidden] = useState<NavKey[]>(initial);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;

    const controller = new AbortController();
    fetch(`${api}/api/settings`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.hiddenNav)) {
          setHidden(data.hiddenNav.filter(isNavKey));
        }
      })
      .catch(() => {
        /* API injoignable : on garde le snapshot */
      });

    return () => controller.abort();
  }, []);

  return hidden;
}
