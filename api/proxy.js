import { Readable } from 'stream';

export default async function handler(req, res) {
  // Configuração CORS irrestrita
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, referer, ua } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const targetUrl = decodeURIComponent(url);
    const headers = {
      'User-Agent': ua ? decodeURIComponent(ua) : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      'Accept': '*/*'
    };
    if (referer) {
      headers['Referer'] = decodeURIComponent(referer);
    }
    // Encaminhar cabeçalho Range (essencial para vídeos MP4/MKV e busca em players HTML5)
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const response = await fetch(targetUrl, { 
      headers,
      redirect: 'follow'
    });

    if (!response.ok && response.status !== 206) {
      return res.status(response.status).json({ 
        error: `Remote server responded with ${response.status}`,
        url: targetUrl 
      });
    }

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    res.setHeader('Content-Type', contentType);

    const isPlaylist = 
      contentType.includes('mpegurl') || 
      contentType.includes('application/x-mpegURL') || 
      targetUrl.includes('.m3u8') || 
      targetUrl.includes('.txt');

    if (isPlaylist) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const text = await response.text();
      const baseUrl = new URL(targetUrl);

      const lines = text.split('\n');
      const rewritten = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;

        let absoluteUrl;
        try {
          absoluteUrl = new URL(trimmed, baseUrl).toString();
        } catch {
          absoluteUrl = trimmed;
        }

        const refParam = referer ? `&referer=${encodeURIComponent(referer)}` : '';
        const uaParam = ua ? `&ua=${encodeURIComponent(ua)}` : '';
        return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}${refParam}${uaParam}`;
      }).join('\n');

      return res.status(200).send(rewritten);
    }

    // Para arquivos de vídeo binários (.ts, .mp4, etc.):
    res.status(response.status); // 200 ou 206
    if (response.headers.get('content-range')) {
      res.setHeader('Content-Range', response.headers.get('content-range'));
    }
    if (response.headers.get('accept-ranges')) {
      res.setHeader('Accept-Ranges', response.headers.get('accept-ranges'));
    } else {
      res.setHeader('Accept-Ranges', 'bytes');
    }
    if (response.headers.get('content-length')) {
      res.setHeader('Content-Length', response.headers.get('content-length'));
    }

    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (response.body && typeof Readable.fromWeb === 'function') {
      const nodeStream = Readable.fromWeb(response.body);
      return nodeStream.pipe(res);
    } else {
      const arrayBuffer = await response.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    }

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(502).json({ error: err.message });
  }
}
