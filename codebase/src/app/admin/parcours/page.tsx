'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { normalizeRoadmap, type Roadmap } from '@/lib/roadmap';
import AdminShell from '@/components/admin/AdminShell';
import RoadmapEditor from '@/components/admin/RoadmapEditor';

export default function AdminRoadmapPage() {
  const [initial, setInitial] = useState<Roadmap | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getRoadmap()
      .then((r) => setInitial(normalizeRoadmap(r)))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <AdminShell>
      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}
      {initial ? (
        <RoadmapEditor initial={initial} />
      ) : (
        !error && <p className="a-sub">Chargement…</p>
      )}
    </AdminShell>
  );
}
