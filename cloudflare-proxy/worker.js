/**
 * Cloudflare Worker - High-Performance Streaming & HLS Proxy for Lango's TV
 * 
 * Features:
 * - Unlimited Bandwidth (Free Cloudflare Tier)
 * - Ultra-low latency via Cloudflare Global Edge (Brazil: SP, RJ, etc.)
 * - Automatic CORS headers (Access-Control-Allow-Origin: *)
 * - Full HLS (.m3u8) rewrite with support for 302 redirects and relative paths
 * - Byte-range forwarding for video seeking
 * - Custom User-Agent & Referer emulation
 */

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length, Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const reqUrl = new URL(request.url);
    const workerOrigin = reqUrl.origin;
    const targetUrlParam = reqUrl.searchParams.get('url');

    if (!targetUrlParam) {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          service: "Lango's TV Edge Streaming Proxy",
          usage: `${workerOrigin}/?url=<STREAM_URL>`
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let targetUrl;
    try {
      targetUrl = decodeURIComponent(targetUrlParam);
    } catch {
      targetUrl = targetUrlParam;
    }

    const referer = reqUrl.searchParams.get('referer');
    const ua = reqUrl.searchParams.get('ua');

    const headers = new Headers();
    headers.set(
      'User-Agent',
      ua 
        ? decodeURIComponent(ua) 
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
    );
    headers.set('Accept', '*/*');

    if (referer) {
      headers.set('Referer', decodeURIComponent(referer));
    }

    const range = request.headers.get('Range');
    if (range) {
      headers.set('Range', range);
    }

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        redirect: 'follow'
      });

      if (!response.ok && response.status !== 206) {
        return new Response(
          JSON.stringify({ error: `Upstream error ${response.status}`, url: targetUrl }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const contentType = response.headers.get('content-type') || '';
      let isPlaylist = 
        contentType.includes('mpegurl') || 
        contentType.includes('application/x-mpegURL') || 
        targetUrl.includes('.m3u8') || 
        targetUrl.includes('.txt') ||
        targetUrl.includes('/m3/') ||
        targetUrl.includes('/hls/');

      let text = null;
      if (!isPlaylist && (contentType.includes('text') || !contentType.includes('video') || contentType === '')) {
        try {
          const peek = await response.clone().text();
          if (peek.trim().startsWith('#EXTM3U')) {
            isPlaylist = true;
            text = peek;
          }
        } catch {}
      }

      if (isPlaylist) {
        if (text === null) {
          text = await response.text();
        }
        const trimmed = text.trim();

        // Check if remote returned HTML error page
        if (
          trimmed.startsWith('<!DOCTYPE') || 
          trimmed.startsWith('<html') || 
          trimmed.includes('XUI.one - Debug Mode')
        ) {
          return new Response(
            JSON.stringify({ error: 'Remote stream returned HTML page instead of playlist' }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Anchor base URL to the final destination URL (handles 302 redirects)
        const finalUrl = response.url || targetUrl;
        const baseUrl = new URL(finalUrl);
        const effectiveReferer = referer ? decodeURIComponent(referer) : (baseUrl.origin + '/');

        const lines = text.split('\n');
        const rewritten = lines.map(line => {
          const l = line.trim();
          if (!l) return line;

          // Rewrite tag URIs (e.g., #EXT-X-KEY:URI="...")
          if (l.startsWith('#')) {
            if (l.includes('URI="')) {
              return l.replace(/URI="([^"]+)"/g, (_, uri) => {
                let absUri;
                try {
                  absUri = new URL(uri, baseUrl).toString();
                } catch {
                  absUri = uri;
                }
                const refP = `&referer=${encodeURIComponent(effectiveReferer)}`;
                const uaP = ua ? `&ua=${encodeURIComponent(ua)}` : '';
                return `URI="${workerOrigin}/?url=${encodeURIComponent(absUri)}${refP}${uaP}"`;
              });
            }
            return line;
          }

          // Rewrite segment URLs (.ts, .m4s, variant .m3u8)
          let absUrl;
          try {
            absUrl = new URL(l, baseUrl).toString();
          } catch {
            absUrl = l;
          }

          const refP = `&referer=${encodeURIComponent(effectiveReferer)}`;
          const uaP = ua ? `&ua=${encodeURIComponent(ua)}` : '';
          return `${workerOrigin}/?url=${encodeURIComponent(absUrl)}${refP}${uaP}`;
        }).join('\n');

        const outHeaders = new Headers(corsHeaders);
        outHeaders.set('Content-Type', 'application/vnd.apple.mpegurl');
        outHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

        return new Response(rewritten, {
          status: 200,
          headers: outHeaders
        });
      }

      // Binary media files (.ts, .mp4, audio, video)
      const outHeaders = new Headers(corsHeaders);
      if (contentType) outHeaders.set('Content-Type', contentType);
      
      const contentRange = response.headers.get('content-range');
      if (contentRange) outHeaders.set('Content-Range', contentRange);

      const acceptRanges = response.headers.get('accept-ranges');
      outHeaders.set('Accept-Ranges', acceptRanges || 'bytes');

      const contentLength = response.headers.get('content-length');
      if (contentLength) outHeaders.set('Content-Length', contentLength);

      outHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');

      return new Response(response.body, {
        status: response.status,
        headers: outHeaders
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message, url: targetUrl }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};
