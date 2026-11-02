/**
 * Centralized Proxy Service for Lango's TV
 * 
 * Routes 100% of heavy video streaming traffic to the free, unlimited Cloudflare Worker:
 * `https://langos-proxy.dansdeiro.workers.dev`
 * 
 * This protects Vercel's 10 GB Fast Origin Transfer limit from being consumed by video data.
 */

export const CLOUDFLARE_PROXY_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STREAM_PROXY_URL) || 
  'https://langos-proxy.dansdeiro.workers.dev';

export function getProxyUrl(rawUrl, referer = null, ua = null) {
  if (!rawUrl) return '';
  
  // If already proxied, do not double-proxy
  if (isProxiedUrl(rawUrl)) {
    return rawUrl;
  }

  // Always use Cloudflare Worker to avoid Vercel 10GB bandwidth limits
  const base = CLOUDFLARE_PROXY_URL || '/api/proxy';
  const sep = base.includes('?') ? '&' : '?';
  let proxy = `${base}${sep}url=${encodeURIComponent(rawUrl)}`;
  if (referer) proxy += `&referer=${encodeURIComponent(referer)}`;
  if (ua) proxy += `&ua=${encodeURIComponent(ua)}`;
  return proxy;
}

export function isProxiedUrl(url) {
  if (!url) return false;
  return (
    url.includes('/api/proxy') || 
    url.includes('langos-proxy.dansdeiro.workers.dev') || 
    url.includes('.workers.dev') ||
    (CLOUDFLARE_PROXY_URL && url.includes(CLOUDFLARE_PROXY_URL))
  );
}
