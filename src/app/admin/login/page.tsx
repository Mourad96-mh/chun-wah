import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion — Administration Chun Wah',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="a-loginWrap">
      <div className="a-login">
        <p className="a-loginBrand">
          <span>詠</span> Chun Wah
        </p>
        <div className="a-card">
          <h1 style={{ fontSize: '1.15rem' }}>Administration</h1>
          <p className="a-sub" style={{ marginBottom: '1.25rem' }}>
            Connectez-vous pour gérer les articles et les livres.
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
