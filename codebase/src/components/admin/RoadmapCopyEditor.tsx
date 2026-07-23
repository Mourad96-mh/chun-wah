'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';

/**
 * Éditeur des textes de la page « Parcours » (hors étapes) : titre, intro,
 * accroche + titre de section, et l'encart d'appel à l'action. Bilingue.
 *
 * Chaque champ est OPTIONNEL : laissé vide, le site affiche son texte traduit par
 * défaut (indiqué en filigrane). Singleton — un seul jeu de textes pour la page.
 */

type Field = {
  base: string;
  label: string;
  textarea?: boolean;
  phFr: string;
  phEn: string;
};

// Ordre d'affichage + valeurs par défaut (identiques aux traductions du site,
// montrées en placeholder pour que le client sache ce qu'il remplace).
const FIELDS: Field[] = [
  { base: 'title', label: 'Titre de la page', phFr: "Le parcours de l'élève", phEn: "The learner's roadmap" },
  { base: 'intro', label: 'Texte d’intro sous le titre', textarea: true, phFr: 'De votre premier cours aux niveaux avancés…', phEn: 'From your first class to the advanced levels…' },
  { base: 'kicker', label: 'Petite accroche de la section', phFr: 'Étape par étape', phEn: 'Step by step' },
  { base: 'heading', label: 'Titre de la section des étapes', phFr: 'Les étapes de votre progression', phEn: 'The stages of your progression' },
  { base: 'ctaTitle', label: 'Titre de l’encart final', phFr: "Prêt à commencer l'étape 1 ?", phEn: 'Ready to start stage 1?' },
  { base: 'ctaButton', label: 'Texte du bouton final', phFr: "Réserver un cours d'essai gratuit", phEn: 'Book a free trial class' },
];

const KEYS = FIELDS.flatMap((f) => [`${f.base}Fr`, `${f.base}En`]);
const emptyState = (): Record<string, string> => Object.fromEntries(KEYS.map((k) => [k, '']));

export default function RoadmapCopyEditor() {
  const [values, setValues] = useState<Record<string, string>>(emptyState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    adminApi
      .getRoadmapPage()
      .then((data) => {
        const next = emptyState();
        for (const k of KEYS) next[k] = String((data && data[k]) ?? '');
        setValues(next);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setNotice('');
  };

  async function save() {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const saved = await adminApi.updateRoadmapPage(values);
      const next = emptyState();
      for (const k of KEYS) next[k] = String((saved && saved[k]) ?? '');
      setValues(next);
      setNotice('Textes enregistrés — visibles sur la page Parcours.');
    } catch (e) {
      setError((e as Error).message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className="a-card" style={{ marginBottom: '1.5rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
        Textes de la page (titre, intro, bouton…)
      </summary>

      <div style={{ marginTop: '1rem' }}>
        <p className="a-hint" style={{ marginTop: 0 }}>
          Personnalisez les textes fixes de la page. Laissez un champ vide pour
          garder le texte par défaut du site (affiché en filigrane).
        </p>

        {loading ? (
          <p className="a-sub">Chargement…</p>
        ) : (
          <div className="a-form">
            {FIELDS.map((f) => (
              <div className="a-grid2" key={f.base}>
                <div className="a-field">
                  <label className="a-label" htmlFor={`${f.base}Fr`}>
                    {f.label} <span className="a-hint">(français)</span>
                  </label>
                  {f.textarea ? (
                    <textarea
                      id={`${f.base}Fr`}
                      className="a-textarea"
                      rows={2}
                      value={values[`${f.base}Fr`]}
                      onChange={set(`${f.base}Fr`)}
                      placeholder={f.phFr}
                      style={{ minHeight: 70 }}
                    />
                  ) : (
                    <input
                      id={`${f.base}Fr`}
                      className="a-input"
                      value={values[`${f.base}Fr`]}
                      onChange={set(`${f.base}Fr`)}
                      placeholder={f.phFr}
                    />
                  )}
                </div>
                <div className="a-field">
                  <label className="a-label" htmlFor={`${f.base}En`}>
                    {f.label} <span className="a-hint">(anglais)</span>
                  </label>
                  {f.textarea ? (
                    <textarea
                      id={`${f.base}En`}
                      className="a-textarea"
                      rows={2}
                      value={values[`${f.base}En`]}
                      onChange={set(`${f.base}En`)}
                      placeholder={f.phEn}
                      style={{ minHeight: 70 }}
                    />
                  ) : (
                    <input
                      id={`${f.base}En`}
                      className="a-input"
                      value={values[`${f.base}En`]}
                      onChange={set(`${f.base}En`)}
                      placeholder={f.phEn}
                    />
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="a-alert a-alert-error" role="alert">
                {error}
              </div>
            )}
            {notice && (
              <div className="a-alert a-alert-success" role="status">
                {notice}
              </div>
            )}

            <div className="a-formFooter">
              <button type="button" className="a-btn a-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer les textes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
