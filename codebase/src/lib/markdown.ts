import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/**
 * Markdown → safe HTML.
 *
 * Only admins can write article bodies, so this is defence in depth rather than
 * the primary control — but an admin account is exactly what gets phished, and
 * stored XSS on the public site would be the worst possible outcome.
 */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(md ?? '', { async: false, breaks: true }) as string;

  return sanitizeHtml(raw, {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'br', 'hr',
      'strong', 'em', 'del', 'blockquote',
      'ul', 'ol', 'li',
      'a', 'img',
      'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      // External links open in a new tab without leaking the referrer.
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: isExternal
            ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
            : attribs,
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: 'lazy' },
      }),
    },
  });
}

/** Rough reading time in minutes, from the raw Markdown. */
export function readingTime(md: string): number {
  const words = (md ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** First N characters of plain text, for auto-filling an excerpt. */
export function toPlainText(md: string, limit = 300): string {
  const text = (md ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}
