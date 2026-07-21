'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Connexion impossible.');
        return;
      }

      // Only allow relative redirects — a ?next=https://evil.tld would
      // otherwise turn the login into an open redirect.
      const target = next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
      router.push(target);
      router.refresh();
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="a-form" onSubmit={handleSubmit}>
      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="a-field">
        <label className="a-label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          className="a-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div className="a-field">
        <label className="a-label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          className="a-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <button type="submit" className="a-btn a-btn-primary" disabled={busy}>
        {busy ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
