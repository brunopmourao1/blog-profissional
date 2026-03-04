// =============================================================
// HTML Sanitizer — removes dangerous tags/attributes
// =============================================================

const DANGEROUS_TAGS =
    /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|select|style|link|meta|base|applet)\b[^>]*>/gi;
const EVENT_HANDLERS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi;
const JAVASCRIPT_URLS = /\b(href|src|action)\s*=\s*["']?\s*javascript:/gi;
const DATA_URLS = /\b(href|src)\s*=\s*["']?\s*data:\s*text\/html/gi;

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Removes script tags, event handlers, javascript: URLs, etc.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return html;

    return html
        .replace(DANGEROUS_TAGS, "")
        .replace(EVENT_HANDLERS, "")
        .replace(JAVASCRIPT_URLS, "")
        .replace(DATA_URLS, "");
}

/**
 * Sanitize a plain text string (strip all HTML tags).
 */
export function sanitizeText(text: string): string {
    if (!text) return text;
    return text.replace(/<[^>]*>/g, "").trim();
}
