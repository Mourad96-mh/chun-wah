import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/**
 * Markdown → HTML sûr. Seuls les admins écrivent les articles, donc c'est de la
 * défense en profondeur — mais un compte admin est justement ce qui se fait
 * hameçonner, et un XSS stocké sur le site public serait le pire scénario.
 */
export function renderMarkdown(md) {
  const raw = marked.parse(md ?? '', { async: false, breaks: true });

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

/** Premiers N caractères en texte brut, pour auto-remplir un extrait. */
export function toPlainText(md, limit = 300) {
  const text = (md ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}
