'use client';

// Client HTTP pour le tableau de bord admin → parle à l'API Express (server/ sur
// Render). Lit l'URL de l'API dans NEXT_PUBLIC_API_URL et attache le JWT stocké
// dans localStorage.
//
// Rappel archi : le site est un export statique sur Hostinger ; il appelle l'API
// en cross-origin. Plus de cookie httpOnly comme dans l'ancien monolithe Next —
// le token de session voyage en en-tête Authorization: Bearer.

const API = process.env.NEXT_PUBLIC_API_URL || '';
const TOKEN_KEY = 'chunwah_admin_token';
const NAME_KEY = 'chunwah_admin_name';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, t);
}
/** Nom affiché de l'admin connecté (stocké à la connexion). */
export function getName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(NAME_KEY) || '';
}
/** Enregistre la session après un login réussi (token + nom affiché). */
export function setSession(token: string, name: string) {
  setToken(token);
  if (typeof window !== 'undefined') localStorage.setItem(NAME_KEY, name || '');
}
export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
  }
}
export function isAuthed(): boolean {
  return !!getToken();
}

type Options = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  isForm?: boolean;
};

async function request(
  path: string,
  { method = 'GET', body, auth = false, isForm = false }: Options = {},
) {
  const headers: Record<string, string> = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: isForm ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    // Session expirée/invalide : on purge le token et on renvoie vers la connexion.
    if (res.status === 401 && auth) {
      clearToken();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.endsWith('/admin/login')
      ) {
        window.location.assign('/admin/login');
      }
    }
    const err = new Error(
      (data && data.error) || `Erreur ${res.status}`,
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}

export const adminApi = {
  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),

  // --- Blog / articles -------------------------------------------------------
  listArticles: () => request('/api/articles/admin/all', { auth: true }),
  getArticle: (id: string) => request(`/api/articles/admin/${id}`, { auth: true }),
  createArticle: (b: unknown) =>
    request('/api/articles', { method: 'POST', body: b, auth: true }),
  updateArticle: (id: string, b: unknown) =>
    request(`/api/articles/${id}`, { method: 'PUT', body: b, auth: true }),
  deleteArticle: (id: string) =>
    request(`/api/articles/${id}`, { method: 'DELETE', auth: true }),

  // --- Uploads (Cloudinary) --------------------------------------------------
  async upload(file: File, folder?: string) {
    const fd = new FormData();
    // Le champ texte doit précéder le fichier pour que multer le parse à temps.
    if (folder) fd.append('folder', folder);
    fd.append('file', file);
    return request('/api/uploads', { method: 'POST', body: fd, auth: true, isForm: true });
  },
};
