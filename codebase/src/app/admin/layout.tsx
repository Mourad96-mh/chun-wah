import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Administration — Chun Wah',
  // The admin must never be indexed, whatever the public site does.
  robots: { index: false, follow: false },
};

/**
 * Second root layout, parallel to app/[locale]/layout.tsx: the admin sits
 * outside the locale routing entirely and is French-only.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      {/* Browser extensions (ColorZilla, Grammarly, LastPass…) inject
          attributes like cz-shortcut-listen onto <body> before React
          hydrates. suppressHydrationWarning silences those attribute-only
          mismatches on this node without masking real hydration bugs. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
