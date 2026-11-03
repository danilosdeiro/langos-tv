/**
 * Centralized Proxy Service for Lango's TV
 * 
 * Intelligently balances traffic:
 * 1. Live TV channels & hosts that block Cloudflare datacenter IPs (AS13335 HTTP 403)
 *    are routed via Vercel Proxy (`https://langos-tv.vercel.app/api/proxy`), ensuring 100% uptime.
 * 2. Heavy VOD streams (movies and series) are routed via Cloudflare Worker
 *    (`https://langos-proxy.dansdeiro.workers.dev`) to protect Vercel bandwidth limits.
 */

export const VERCEL_PROXY_URL = 
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'))
    ? '/api/proxy'
    : 'https://langos-proxy.dansdeiro.workers.dev';

export const CLOUDFLARE_PROXY_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STREAM_PROXY_URL) || 
  'https://langos-proxy.dansdeiro.workers.dev';

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
  // Checar domínios conhecidos
  for (const host of CF_BLOCKED_HOSTS) {
    if (url.includes(host)) return true;
  }
  // Checar se o host é um endereço IPv4 direto (IPTVs privados que barram datacenter)
  try {
    const parsed = new URL(url);
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname)) {
      return true;
    }
  } catch {}
  return false;
}

export function getProxyUrl(rawUrl, referer = null, ua = null, forceVercel = false) {
  if (!rawUrl) return '';
  
  // Se já estiver envelopado em proxy, não aplicar duplicado
  if (isProxiedUrl(rawUrl)) {
    return rawUrl;
  }

  // Se o servidor remoto bloquear Cloudflare ou se Vercel for forçado, usar Vercel Proxy
  const shouldUseVercel = forceVercel || isBlockedByCloudflare(rawUrl);
  const base = shouldUseVercel ? VERCEL_PROXY_URL : CLOUDFLARE_PROXY_URL;

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
