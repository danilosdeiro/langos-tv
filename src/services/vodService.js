// VOD Service — Catálogo Dinâmico de Séries e Episódios (Mais de 7.000 títulos atualizados diariamente)

const SERIES_CACHE = {};
const EPISODES_CACHE = {};

export const VodService = {
  // Buscar catálogo de séries por letra (A-Z)
  async fetchSeriesByLetter(letter = 'A') {
    const l = letter.toUpperCase();
    if (SERIES_CACHE[l]) {
      return SERIES_CACHE[l];
    }

    try {
      const url = `https://filmes-saimo.pages.dev/series-${l}.txt`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const text = await res.text();

      const seriesList = [];
      const lines = text.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split('\t');
        if (parts.length >= 1 && parts[0].trim()) {
          const nome = parts[0].trim();
          const ano = parts[1]?.trim() || 'Série';
          const pedaco = parts[2]?.trim() || '0';
          const totalEps = parts[3]?.trim() || 'Vários';

          seriesList.push({
            id: `dyn-${l}-${i}`,
            letra: l,
            pedaco: pedaco,
            titulo: nome,
            ano: ano === '0' || !ano ? 'Série' : ano,
            categoria: 'Série / VOD',
            totalEps: totalEps,
            isDynamic: true
          });
        }
      }

      SERIES_CACHE[l] = seriesList;
      return seriesList;
    } catch (err) {
      console.warn(`Erro ao carregar séries da letra ${l}:`, err);
      return [];
    }
  },

  // Buscar temporadas e episódios de uma série específica
  async fetchEpisodes(letter, pedaco, seriesTitle) {
    const cacheKey = `${letter}-${pedaco}`;
    let text = EPISODES_CACHE[cacheKey];

    if (!text) {
      try {
        const url = `https://filmes-saimo.pages.dev/series-${letter}-${pedaco}.txt`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        text = await res.text();
        EPISODES_CACHE[cacheKey] = text;
      } catch (e) {
        console.error('Erro ao baixar episódios:', e);
        return [];
      }
    }

    const lines = text.split('\n');
    let targetFound = false;
    const episodes = [];

    const normTarget = seriesTitle.trim().toLowerCase();

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('@')) {
        const currentTitle = trimmed.slice(1).trim().toLowerCase();
        if (targetFound) {
          // Chegou na próxima série
          break;
        }
        if (currentTitle === normTarget || currentTitle.includes(normTarget) || normTarget.includes(currentTitle)) {
          targetFound = true;
          continue;
        }
      }

      if (targetFound && trimmed) {
        // Formato: Temporada [TAB] Episodio [TAB] dub|leg [TAB] links
        const parts = trimmed.split('\t');
        if (parts.length >= 4) {
          const season = parseInt(parts[0], 10) || 1;
          const episode = parseInt(parts[1], 10) || 1;
          const audio = parts[2].trim().toLowerCase(); // 'dub' ou 'leg'
          const rawLinks = parts[3].trim().split(',');

          // Filtrar links HTTP/HTTPS válidos
          const validUrls = rawLinks
            .map(l => l.trim())
            .filter(l => l.startsWith('http'));

          if (validUrls.length > 0) {
            episodes.push({
              season,
              episode,
              audio: audio === 'dub' ? 'dublado' : 'legendado',
              url: validUrls[0],
              allUrls: validUrls,
              nome: `T${season}:E${episode} (${audio === 'dub' ? 'Dublado' : 'Legendado'})`
            });
          }
        }
      }
    }

    return episodes;
  }
};
