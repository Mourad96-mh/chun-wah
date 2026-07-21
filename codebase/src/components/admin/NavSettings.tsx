'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOGGLEABLE_NAV } from '@/lib/nav';

/**
 * Show/hide switches for the public header links. Each switch saves immediately
 * (optimistic update, reverted if the request fails) so the state on screen is
 * always the state in the database — there is no separate "save" step to forget.
 *
 * A link is *visible* when its key is NOT in the hidden set, so the switch reads
 * naturally: on = shown.
 */
export default function NavSettings({ initialHidden }: { initialHidden: string[] }) {
  const router = useRouter();

  const [hidden, setHidden] = useState<Set<string>>(() => new Set(initialHidden));
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function persist(next: Set<string>, key: string, previous: Set<string>) {
    setError('');
    setSavingKey(key);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiddenNav: [...next] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Roll back the optimistic flip so the UI never lies about what's saved.
        setHidden(previous);
        setError(
          res.status === 401
            ? 'Session expirée — reconnectez-vous, puis réessayez.'
            : (data.error ?? 'Enregistrement impossible. Réessayez.'),
        );
        return;
      }
      // Refresh so the public header (root layout) reflects the change.
      router.refresh();
    } catch {
      setHidden(previous);
      setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    } finally {
      setSavingKey(null);
    }
  }

  function toggle(key: string) {
    const previous = hidden;
    const next = new Set(previous);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHidden(next); // optimistic
    void persist(next, key, previous);
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Réglages du menu</h1>
          <p className="a-sub">
            Choisissez les liens affichés dans le menu du site public. Chaque
            changement est enregistré aussitôt. Masquer un lien le retire du menu
            (haut de page et menu mobile) ; la page reste accessible par son
            adresse directe.
          </p>
        </div>
      </div>

      {error && (
        <div className="a-alert a-alert-error" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="a-card a-form">
        <ul className="a-navToggles">
          {TOGGLEABLE_NAV.map(({ key, label }) => {
            const visible = !hidden.has(key);
            const saving = savingKey === key;
            return (
              <li key={key} className="a-navToggle">
                <div>
                  <span className="a-navToggleLabel">{label}</span>
                  <span className="a-hint">
                    {saving ? 'Enregistrement…' : visible ? 'Affiché' : 'Masqué'}
                  </span>
                </div>
                <label className="a-switch" title={visible ? 'Masquer' : 'Afficher'}>
                  <input
                    type="checkbox"
                    checked={visible}
                    disabled={saving}
                    onChange={() => toggle(key)}
                  />
                  <span className="a-switchTrack" aria-hidden="true" />
                  <span className="a-srOnly">
                    {label} {visible ? 'affiché' : 'masqué'}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
