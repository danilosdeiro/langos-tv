/**
 * Channel Health Service - Diagnóstico e Verificação de Saúde dos Canais
 * 
 * Permite que o usuário verifique a disponibilidade, status HTTP e latência (ms)
 * de cada canal diretamente pelo navegador, com suporte a verificação rápida (amostragem)
 * ou verificação completa de todos os 184 canais.
 */

import { getProxyUrl, isProxiedUrl, isBlockedByCloudflare } from './proxyService';

// Resolve URL segura para teste no navegador
function resolveTestUrl(rawUrl) {
  if (!rawUrl) return '';

  const isPageHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isDirectHttps = rawUrl.startsWith('https://');
  const needsProxy = (
    !isDirectHttps ||
    rawUrl.includes('jmp2.uk') ||
    rawUrl.includes('pluto.tv') ||
    rawUrl.includes('wurl.tv') ||
    rawUrl.includes('ottera')
  );

  if (needsProxy) {
    return getProxyUrl(rawUrl);
  }

  return rawUrl;
}

/**
 * Testa um único canal, medindo a latência em milissegundos e validando a playlist HLS.
 */
export async function testSingleChannel(channel, timeoutMs = 4500) {
  if (!channel || !channel.fontes || channel.fontes.length === 0) {
    return {
      channelId: channel?.id,
      nome: channel?.nome || 'Desconhecido',
      categoria: channel?.categoria || 'Geral',
      logo: channel?.logo,
      channel,
      status: 'error',
      statusCode: 0,
      statusText: 'Sem fonte cadastrada',
      latency: 0,
      activeSourceIndex: 0,
      activeSourceName: 'Nenhuma',
      streamUrl: '',
      isOk: false
    };
  }

  // Tentar Fonte 1 primeiro
  for (let idx = 0; idx < Math.min(channel.fontes.length, 2); idx++) {
    const fonte = channel.fontes[idx];
    const rawUrl = fonte.url;
    if (!rawUrl) continue;

    const testUrl = resolveTestUrl(rawUrl);
    const startTime = performance.now();

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*'
        },
        signal: AbortSignal.timeout(timeoutMs)
      });

      const latency = Math.round(performance.now() - startTime);

      if (response.ok) {
        const text = await response.text();
        if (text.includes('#EXTM3U')) {
          return {
            channelId: channel.id,
            nome: channel.nome,
            categoria: channel.categoria,
            logo: channel.logo,
            channel,
            status: 'healthy',
            statusCode: response.status,
            statusText: `200 OK (${latency}ms)`,
            latency,
            activeSourceIndex: idx,
            activeSourceName: fonte.nome || `Fonte ${idx + 1}`,
            streamUrl: testUrl,
            isOk: true,
            isFallback: idx > 0
          };
        }
      }
    } catch (err) {
      // Se a Fonte 1 falhou com timeout ou erro de rede, tenta Fonte 2 se existir
      if (idx === 0 && channel.fontes.length > 1) {
        continue;
      }
      
      const latency = Math.round(performance.now() - startTime);
      return {
        channelId: channel.id,
        nome: channel.nome,
        categoria: channel.categoria,
        logo: channel.logo,
        channel,
        status: 'error',
        statusCode: 0,
        statusText: err.name === 'TimeoutError' ? 'Tempo esgotado (>4s)' : (err.message || 'Falha de conexão'),
        latency,
        activeSourceIndex: idx,
        activeSourceName: fonte.nome || `Fonte ${idx + 1}`,
        streamUrl: testUrl,
        isOk: false,
        error: err.message
      };
    }
  }

  return {
    channelId: channel.id,
    nome: channel.nome,
    categoria: channel.categoria,
    logo: channel.logo,
    channel,
    status: 'error',
    statusCode: 0,
    statusText: 'Todas as fontes falharam',
    latency: 0,
    activeSourceIndex: 0,
    activeSourceName: 'Nenhuma',
    streamUrl: '',
    isOk: false
  };
}

/**
 * Retorna uma amostra rápida dos 20 canais mais estratégicos para teste expresso em < 3 segundos.
 */
export function getQuickSampleChannels(channels) {
  if (!Array.isArray(channels) || channels.length === 0) return [];

  const targetKeywords = [
    'Globo Bahia', 'Globo SP', 'SBT', 'Record Bahia', 'Record', 'Band',
    'CazéTV', 'Premiere Clubes', 'Premiere 2', 'SporTV', 'ESPN', 'BAND SPORTS',
    'A Fazenda 18 — Câmera Principal', 'A Fazenda 18 — Câmera 02',
    'Telecine Premium', 'HBO', 'Cartoon Network', 'CNN Brasil', 'Discovery Channel', 'TV Cultura'
  ];

  const sample = [];
  const addedIds = new Set();

  for (const kw of targetKeywords) {
    const found = channels.find(c => !addedIds.has(c.id) && c.nome.toLowerCase().includes(kw.toLowerCase()));
    if (found) {
      sample.push(found);
      addedIds.add(found.id);
    }
  }

  // Se não atingir 20, preencher com os primeiros canais
  for (const c of channels) {
    if (sample.length >= 20) break;
    if (!addedIds.has(c.id)) {
      sample.push(c);
      addedIds.add(c.id);
    }
  }

  return sample;
}

/**
 * Executa verificação em lotes concorrentes para máxima velocidade e responsividade.
 */
export async function runBatchHealthCheck(channels, onProgress, concurrency = 6) {
  const results = [];
  const total = channels.length;
  let completed = 0;

  for (let i = 0; i < channels.length; i += concurrency) {
    const batch = channels.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(c => testSingleChannel(c)));

    for (const res of batchResults) {
      results.push(res);
      completed++;
      if (onProgress) {
        onProgress({
          completed,
          total,
          percent: Math.round((completed / total) * 100),
          current: res,
          resultsSoFar: [...results]
        });
      }
    }
  }

  return results;
}
