export default async function handler(req, res) {
  // Configuração CORS aberta
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

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
    };
    if (referer) {
      headers['Referer'] = decodeURIComponent(referer);
    }

    const response = await fetch(targetUrl, { 
      headers,
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Remote server responded with ${response.status}`,
        url: targetUrl 
      });
    }

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    res.setHeader('Content-Type', contentType);

    // Se for playlist M3U8, reescrever URLs relativas para passarem pelo proxy
    if (
      contentType.includes('mpegurl') || 
      contentType.includes('application/x-mpegURL') || 
      targetUrl.includes('.m3u8') || 
      targetUrl.includes('.txt')
    ) {
      const text = await response.text();
      const baseUrl = new URL(targetUrl);
      const hostOrigin = req.headers['x-forwarded-host'] 
        ? `https://${req.headers['x-forwarded-host']}` 
        : '';

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
        return `${hostOrigin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}${refParam}${uaParam}`;
      }).join('\n');

      return res.status(200).send(rewritten);
    }

    // Para arquivos binários (.ts, .mp4, imagens)
    const arrayBuffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(arrayBuffer));

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(502).json({ error: err.message });
  }
}
