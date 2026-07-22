'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import AdminShell from '@/components/admin/AdminShell';
import NavSettings from '@/components/admin/NavSettings';

export default function AdminSettingsPage() {
  const [hidden, setHidden] = useState<string[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getSettings()
      .then((s) => setHidden(Array.isArray(s?.hiddenNav) ? s.hiddenNav : []))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <AdminShell>
      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}
      {hidden ? (
        <NavSettings initialHidden={hidden} />
      ) : (
        !error && <p className="a-sub">Chargement…</p>
      )}
    </AdminShell>
  );
}
