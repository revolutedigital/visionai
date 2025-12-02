import DOMPurify from 'dompurify';

/**
 * Sanitização de Input - Proteção XSS
 *
 * Utiliza DOMPurify para remover código malicioso de inputs do usuário
 * e dados vindos do backend que serão renderizados como HTML
 */

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripAllTags?: boolean;
}

/**
 * Sanitiza string removendo scripts e tags perigosas
 * @param dirty String potencialmente insegura
 * @param options Opções de sanitização
 */
export function sanitize(dirty: string, options: SanitizeOptions = {}): string {
  if (!dirty) return '';

  const config: any = {};

  // Se stripAllTags = true, remove TODAS as tags HTML
  if (options.stripAllTags) {
    config.ALLOWED_TAGS = [];
    config.ALLOWED_ATTR = [];
  } else if (options.allowedTags || options.allowedAttributes) {
    if (options.allowedTags) {
      config.ALLOWED_TAGS = options.allowedTags;
    }
    if (options.allowedAttributes) {
      config.ALLOWED_ATTR = options.allowedAttributes;
    }
  }

  return DOMPurify.sanitize(dirty, config) as unknown as string;
}

/**
 * Sanitiza para uso em atributos HTML (ex: title, alt, placeholder)
 * Remove TODAS as tags HTML
 */
export function sanitizeAttribute(value: string): string {
  return sanitize(value, { stripAllTags: true });
}

/**
 * Sanitiza preservando formatação básica (bold, italic, links)
 * Útil para campos de texto rico
 */
export function sanitizeRichText(html: string): string {
  return sanitize(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitiza URL para uso em links
 * Previne javascript: e data: URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const clean = url.trim();

  // Block javascript: and data: protocols
  if (/^(javascript|data|vbscript):/i.test(clean)) {
    return '';
  }

  return sanitize(clean, { stripAllTags: true });
}

/**
 * Hook React para sanitização automática
 */
export function useSanitize() {
  return {
    sanitize,
    sanitizeAttribute,
    sanitizeRichText,
    sanitizeUrl,
  };
}

export default { sanitize, sanitizeAttribute, sanitizeRichText, sanitizeUrl };
