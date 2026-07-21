'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthed, getName, clearToken } from '@/lib/adminApi';

export default function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  /** Optionnel : par défaut, le nom stocké à la connexion. */
  userName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Garde d'authentification côté client : en export statique il n'y a plus de
  // middleware serveur. Sans token → retour à la connexion. On ne rend le
  // contenu admin qu'une fois la session confirmée (évite un flash de contenu).
  useEffect(() => {
    if (!isAuthed()) {
      const next = encodeURIComponent(pathname || '/admin');
      router.replace(`/admin/login?next=${next}`);
      return;
    }
    setReady(true);
  }, [router, pathname]);

  function logout() {
    clearToken();
    router.replace('/admin/login');
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  if (!ready) return null;

  const name = userName || getName();

  return (
    <>
      <header className="a-topbar">
        <Link href="/admin" className="a-brand">
          <span>詠</span> Chun Wah
        </Link>

        <nav className="a-topnav">
          <Link href="/admin" className={isActive('/admin') ? 'active' : ''}>
            Tableau de bord
          </Link>
          <Link href="/admin/cours" className={isActive('/admin/cours') ? 'active' : ''}>
            Cours
          </Link>
          <Link
            href="/admin/articles"
            className={isActive('/admin/articles') ? 'active' : ''}
          >
            Articles
          </Link>
          <Link href="/admin/livres" className={isActive('/admin/livres') ? 'active' : ''}>
            Livres
          </Link>
          <Link href="/admin/videos" className={isActive('/admin/videos') ? 'active' : ''}>
            Vidéos
          </Link>
          <Link href="/admin/parcours" className={isActive('/admin/parcours') ? 'active' : ''}>
            Parcours
          </Link>
          <Link href="/admin/medias" className={isActive('/admin/medias') ? 'active' : ''}>
            Images
          </Link>
          <Link href="/admin/reglages" className={isActive('/admin/reglages') ? 'active' : ''}>
            Réglages
          </Link>
          <Link href="/fr" target="_blank">
            Voir le site ↗
          </Link>
          <button type="button" className="a-btn" onClick={logout}>
            Déconnexion
          </button>
        </nav>
      </header>

      <main className="a-main">
        {name && (
          <p className="a-sub" style={{ marginBottom: '1rem' }}>
            Connecté en tant que {name}
          </p>
        )}
        {children}
      </main>
    </>
  );
}
