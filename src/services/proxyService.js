/**
 * Centralized Proxy Service for Lango's TV
 * 
 * Supports external zero-bandwidth proxies (such as Cloudflare Workers)
 * via `VITE_STREAM_PROXY_URL` environment variable, falling back to `/api/proxy`.
 */

export const EXTERNAL_PROXY_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STREAM_PROXY_URL) || '';

export function getProxyUrl(rawUrl, referer = null, ua = null) {
  if (!rawUrl) return '';
  const base = EXTERNAL_PROXY_URL ? EXTERNAL_PROXY_URL.replace(/\/$/, '') : '/api/proxy';
  const sep = base.includes('?') ? '&' : '?';
  let proxy = `${base}${sep}url=${encodeURIComponent(rawUrl)}`;
  if (referer) proxy += `&referer=${encodeURIComponent(referer)}`;
  if (ua) proxy += `&ua=${encodeURIComponent(ua)}`;
  return proxy;
}

export function isProxiedUrl(url) {
  if (!url) return false;
  return url.includes('/api/proxy') || (EXTERNAL_PROXY_URL && url.includes(EXTERNAL_PROXY_URL));
}
