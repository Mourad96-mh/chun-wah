'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import type { Program } from '@/data/types';
import { site } from '@/data/site';
import { pick } from '@/lib/localized';
import styles from './TrialForm.module.css';

/**
 * No backend: the form composes a message and hands off to WhatsApp (with an
 * email fallback). That means zero data stored, zero GDPR surface, and the club
 * gets the lead where it actually reads its messages.
 *
 * If the client later wants leads in a database, this is the one component to
 * change — swap the handler for a POST to a route handler.
 */
export default function TrialForm({
  programs,
  locale,
}: {
  programs: Program[];
  locale: Locale;
}) {
  const t = useTranslations('trial');
  const ts = useTranslations('schedule');

  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    program: '',
    day: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const set = (key: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  function validate() {
    const next: typeof errors = {};
    if (values.name.trim().length < 2) next.name = t('errorName');
    // Deliberately loose: international formats vary too much to be strict.
    if (values.phone.replace(/\D/g, '').length < 8) next.phone = t('errorPhone');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function composeMessage() {
    const programName =
      programs.find((p) => p.slug === values.program)?.name[locale] ??
      t('formProgramUndecided');

    const lines = [
      `${t('title')} — ${site.name}`,
      '',
      `${t('formName')}: ${values.name}`,
      `${t('formPhone')}: ${values.phone}`,
      values.email ? `${t('formEmail')}: ${values.email}` : null,
      `${t('formProgram')}: ${programName}`,
      values.day ? `${t('formDay')}: ${ts(`days.${values.day}` as 'days.1')}` : null,
      values.message ? `${t('formMessage')}: ${values.message}` : null,
    ].filter(Boolean);

    return lines.join('\n');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const url = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(composeMessage())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function mailtoHref() {
    const subject = encodeURIComponent(`${t('title')} — ${values.name || ''}`.trim());
    return `mailto:${site.email}?subject=${subject}&body=${encodeURIComponent(composeMessage())}`;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tf-name">
            {t('formName')} *
          </label>
          <input
            id="tf-name"
            name="name"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            value={values.name}
            onChange={set('name')}
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'tf-name-error' : undefined}
          />
          {errors.name && (
            <span id="tf-name-error" className={styles.error} role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="tf-phone">
            {t('formPhone')} *
          </label>
          <input
            id="tf-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            value={values.phone}
            onChange={set('phone')}
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'tf-phone-error' : undefined}
          />
          {errors.phone && (
            <span id="tf-phone-error" className={styles.error} role="alert">
              {errors.phone}
            </span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="tf-email">
          {t('formEmail')}
        </label>
        <input
          id="tf-email"
          name="email"
          type="email"
          className={styles.input}
          value={values.email}
          onChange={set('email')}
          autoComplete="email"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tf-program">
            {t('formProgram')}
          </label>
          <select
            id="tf-program"
            name="program"
            className={styles.select}
            value={values.program}
            onChange={set('program')}
          >
            <option value="">{t('formProgramPlaceholder')}</option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {pick(p.name, locale)}
              </option>
            ))}
            <option value="undecided">{t('formProgramUndecided')}</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="tf-day">
            {t('formDay')}
          </label>
          <select
            id="tf-day"
            name="day"
            className={styles.select}
            value={values.day}
            onChange={set('day')}
          >
            <option value="">{t('formDayPlaceholder')}</option>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={String(d)}>
                {ts(`days.${d}` as 'days.1')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="tf-message">
          {t('formMessage')}
        </label>
        <textarea
          id="tf-message"
          name="message"
          className={styles.textarea}
          value={values.message}
          onChange={set('message')}
          placeholder={t('formMessagePlaceholder')}
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block">
        {t('formSubmit')}
      </button>

      <a className={styles.emailFallback} href={mailtoHref()}>
        {t('formSubmitEmail')}
      </a>

      <p className={styles.note}>{t('formNote')}</p>
    </form>
  );
}
