'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/adminApi';

/**
 * Textes libres de la page d'accueil — pour l'instant la section « à propos »
 * (accroche, titre, paragraphe). Bilingue.
 *
 * Chaque champ est OPTIONNEL : laissé vide, le site affiche son texte traduit
 * par défaut (montré en filigrane dans le champ). Singleton, comme les textes
 * de la page Parcours (voir RoadmapCopyEditor).
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
  {
    base: 'aboutKicker',
    label: 'Petite accroche au-dessus du titre',
    phFr: "L'académie",
    phEn: 'The academy',
  },
  {
    base: 'aboutTitle',
    label: 'Titre de la section',
    phFr: "Une école. Plusieurs arts. Une même voie.",
    phEn: "One school. Many arts. One path.",
  },
  {
    base: 'aboutBody',
    label: 'Texte de présentation (une ligne vide = nouveau paragraphe)',
    textarea: true,
    phFr:
      "Chun Wah est une académie dédiée à l’étude et à la transmission des arts martiaux chinois.\n\nÀ travers différentes disciplines, différentes traditions et différentes approches du combat, nous cherchons une même chose : comprendre l’art, maîtriser le corps et développer l’esprit.\n\nIci, chaque pratique a sa propre identité, ses principes et son histoire. Mais toutes reposent sur les mêmes valeurs : discipline, respect, persévérance et maîtrise de soi.\n\nQue l’on débute ou que l’on pratique depuis des années, l’objectif reste le même : apprendre, pratiquer, progresser et transmettre.\n\nUn art martial ne se contente pas de s’apprendre. Il se vit.",
    phEn:
      "Chun Wah is an academy devoted to the study and transmission of the Chinese martial arts.\n\nThrough different disciplines, different traditions and different approaches to combat, we pursue one thing: understanding the art, mastering the body and developing the mind.\n\nHere, every practice has its own identity, principles and history. Yet all of them rest on the same values: discipline, respect, perseverance and self-control.\n\nWhether you are just starting out or have trained for years, the goal stays the same: learn, practise, progress and pass it on.\n\nA martial art is not simply learned. It is lived.",
  },
];

const KEYS = FIELDS.flatMap((f) => [`${f.base}Fr`, `${f.base}En`]);
const emptyState = (): Record<string, string> => Object.fromEntries(KEYS.map((k) => [k, '']));

export default function AdminHomePage() {
  const [values, setValues] = useState<Record<string, string>>(emptyState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    adminApi
      .getHomePage()
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
      const saved = await adminApi.updateHomePage(values);
      const next = emptyState();
      for (const k of KEYS) next[k] = String((saved && saved[k]) ?? '');
      setValues(next);
      setNotice("Textes enregistrés — visibles sur la page d'accueil.");
    } catch (e) {
      setError((e as Error).message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Accueil</h1>
          <p className="a-sub">
            Les textes de la section « à propos » de la page d’accueil.
          </p>
        </div>
      </div>

      <div className="a-card">
        <h2 style={{ fontSize: '1.05rem', marginTop: 0 }}>Section « à propos »</h2>
        <p className="a-hint" style={{ marginTop: 0 }}>
          Laissez un champ vide pour garder le texte par défaut du site (affiché
          en filigrane). La photo de cette section se change dans{' '}
          <strong>Images</strong>, emplacement « à propos ».
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
                      rows={5}
                      value={values[`${f.base}Fr`]}
                      onChange={set(`${f.base}Fr`)}
                      placeholder={f.phFr}
                      style={{ minHeight: 130 }}
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
                      rows={5}
                      value={values[`${f.base}En`]}
                      onChange={set(`${f.base}En`)}
                      placeholder={f.phEn}
                      style={{ minHeight: 130 }}
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
              <button
                type="button"
                className="a-btn a-btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Enregistrement…' : 'Enregistrer les textes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
