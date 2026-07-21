'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

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
        {userName && (
          <p className="a-sub" style={{ marginBottom: '1rem' }}>
            Connecté en tant que {userName}
          </p>
        )}
        {children}
      </main>
    </>
  );
}
