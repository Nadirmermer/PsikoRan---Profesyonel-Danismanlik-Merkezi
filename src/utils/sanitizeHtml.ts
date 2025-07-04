import DOMPurify from 'dompurify';

/**
 * Sanitize arbitrary HTML content before rendering with dangerouslySetInnerHTML
 * to prevent XSS attacks.
 *
 * @param html raw html string that may come from user-generated content
 * @returns a safe html string that can be injected into the DOM
 */
export function sanitizeHtml(html: string): string {
  // DomPurify automatically works with the current window
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}