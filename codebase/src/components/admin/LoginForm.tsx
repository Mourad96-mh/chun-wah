'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi, setSession } from '@/lib/adminApi';

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
      // Parle à l'API Express (server/ sur Render). Le token JWT est stocké en
      // localStorage puis envoyé en en-tête Authorization sur les appels admin.
      const data = await adminApi.login(email, password);
      setSession(data.token, data.name || data.email);

      // On n'autorise que des redirections relatives — un ?next=https://evil.tld
      // transformerait sinon la connexion en open redirect.
      const target = next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
      router.push(target);
    } catch (err) {
      setError((err as Error).message || 'Connexion impossible.');
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
