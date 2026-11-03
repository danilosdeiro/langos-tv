/**
 * Centralized Proxy Service for Lango's TV
 * 
 * Routes streams through high-performance Cloudflare Worker Proxy
 * (`https://langos-proxy.dansdeiro.workers.dev`) providing full CORS: * headers
 * and stream rewriting for 100% web browser compatibility.
 */

export const WORKER_PROXY_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STREAM_PROXY_URL) || 
  'https://langos-proxy.dansdeiro.workers.dev';

export const VERCEL_PROXY_URL = WORKER_PROXY_URL;
export const CLOUDFLARE_PROXY_URL = WORKER_PROXY_URL;

// Hosts that explicitly block Cloudflare Workers ASN (AS13335) with HTTP 403 Forbidden
export const CF_BLOCKED_HOSTS = [
  'governosptx.org',
  'acaidopt.org',
  '207.38.87.252',
  '146.0.32.89',
  '45.185.11.126',
  '45.162.64.114',
  '138.204.86.4',
  '170.83.16.50',
  'multtv.tv.br',
  'mais.uol.com.br'
];

export function isBlockedByCloudflare(url) {
  if (!url) return false;
  for (const host of CF_BLOCKED_HOSTS) {
    if (url.includes(host)) return true;
  }
  try {
    const parsed = new URL(url);
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname)) {
      return true;
    }
  } catch {}
  return false;
}

export function getProxyUrl(rawUrl, referer = null, ua = null) {
  if (!rawUrl) return '';
  
  // Se já estiver envelopado em proxy, não aplicar duplicado
  if (isProxiedUrl(rawUrl)) {
    return rawUrl;
  }

  const base = WORKER_PROXY_URL;
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
    (WORKER_PROXY_URL && url.includes(WORKER_PROXY_URL))
  );
}
