/**
 * Centralized Proxy Service for Lango's TV
 * 
 * Routes 99% of heavy streaming traffic to the free, unlimited Cloudflare Worker:
 * `https://langos-proxy.dansdeiro.workers.dev`
 * 
 * Falls back to `/api/proxy` (Vercel) only for specific hosts that block Cloudflare datacenter IPs.
 */

export const CLOUDFLARE_PROXY_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STREAM_PROXY_URL) || 
  'https://langos-proxy.dansdeiro.workers.dev';

// Hosts whose firewalls block Cloudflare datacenter IP ranges
const CF_BLOCKED_HOSTS = [
  'governosptx.org',
  'acaidopt.org',
  '207.38.87.252',
  '146.0.32.89',
  '45.185.11.126'
];

export function getProxyUrl(rawUrl, referer = null, ua = null) {
  if (!rawUrl) return '';

  let shouldUseVercel = false;
  try {
    const parsed = new URL(rawUrl);
    if (CF_BLOCKED_HOSTS.some(h => parsed.host.includes(h))) {
      shouldUseVercel = true;
    }
  } catch {}

  const base = (!shouldUseVercel && CLOUDFLARE_PROXY_URL) ? CLOUDFLARE_PROXY_URL : '/api/proxy';
  const sep = base.includes('?') ? '&' : '?';
  let proxy = `${base}${sep}url=${encodeURIComponent(rawUrl)}`;
  if (referer) proxy += `&referer=${encodeURIComponent(referer)}`;
  if (ua) proxy += `&ua=${encodeURIComponent(ua)}`;
  return proxy;
}

export function isProxiedUrl(url) {
  if (!url) return false;
  return url.includes('/api/proxy') || (CLOUDFLARE_PROXY_URL && url.includes(CLOUDFLARE_PROXY_URL));
}
