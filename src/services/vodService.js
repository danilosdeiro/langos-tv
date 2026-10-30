// VOD Service — Catálogo Dinâmico de Séries e Episódios (Mais de 7.000 títulos atualizados diariamente com capas TMDB)

const SERIES_CACHE = {};
const EPISODES_CACHE = {};
let FICHAS_CACHE = null;
let FICHAS_PROMISE = null;

// Lista de domínios ou APIs sabidamente inoperantes
const DEAD_HOSTS = [
  'saimo-tv.pages.dev/api/stream',
  'saimo-tv2.pages.dev/api/stream',
  'desativado.invalid',
  'corruptx.org',
  'vaiagora.vip',
  'vivlar.me',
  'paldi.pro',
  '146.0.32.89',
  '16-5-0-235.sslip.io',
  's25-cloudfront-net.lat',
  's23-cloudfront-net.lat',
  'aws.s13-s1001604.lat'
];

function normalizeTitle(t) {
  if (!t) return '';
  return t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Carregar mapeamento oficial do acervo TMDB (pôsteres e gêneros)
async function getFichasMap() {
  if (FICHAS_CACHE) return FICHAS_CACHE;
  if (FICHAS_PROMISE) return FICHAS_PROMISE;

  FICHAS_PROMISE = (async () => {
    try {
      const res = await fetch('https://filmes-saimo.pages.dev/fichas.txt');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      const posters = new Map();
      const genres = new Map();
      let basePoster = 'https://image.tmdb.org/t/p/w342';

      const lines = text.split('\n');
      for (let line of lines) {
        if (!line) continue;
        if (line.startsWith('capa:')) {
          basePoster = line.slice(5).trim();
          continue;
        }
        if (line.startsWith('#')) continue;
        const parts = line.split('\t');
        if (parts.length >= 4) {
          const tipo = parts[0]; // 's' para série, 'f' para filme
          const titulo = parts[1];
          const poster = parts[3];
          const gen = parts[4] || '';

          if (poster && poster.startsWith('/')) {
            const fullUrl = basePoster + poster;
            const normKey = normalizeTitle(titulo);
            posters.set(`${tipo}|${normKey}`, fullUrl);
            posters.set(normKey, fullUrl);
          }
          if (gen) {
            const normKey = normalizeTitle(titulo);
            genres.set(`${tipo}|${normKey}`, gen);
            genres.set(normKey, gen);
          }
        }
      }

      FICHAS_CACHE = { posters, genres };
      return FICHAS_CACHE;
    } catch (e) {
      console.warn('Não foi possível carregar fichas.txt:', e);
      FICHAS_CACHE = { posters: new Map(), genres: new Map() };
      return FICHAS_CACHE;
    }
  })();

  return FICHAS_PROMISE;
}

export const VodService = {
  // Pré-aquecer carregamento de pôsteres em segundo plano
  preloadFichas() {
    getFichasMap().catch(() => {});
  },

  // Buscar catálogo de séries por letra (A-Z) com capas e gêneros TMDB integrados
  async fetchSeriesByLetter(letter = 'A') {
    const l = letter.toUpperCase();
    if (SERIES_CACHE[l]) {
      return SERIES_CACHE[l];
    }

    try {
      // Buscar lista de séries e tabela de fichas em paralelo
      const [seriesRes, fichas] = await Promise.all([
        fetch(`https://filmes-saimo.pages.dev/series-${l}.txt`),
        getFichasMap()
      ]);

      if (!seriesRes.ok) throw new Error(`Status ${seriesRes.status}`);
      const text = await seriesRes.text();

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
          const normKey = normalizeTitle(nome);

          // Obter pôster e gênero oficiais
          const capa = fichas.posters.get(`s|${normKey}`) || fichas.posters.get(normKey) || '';
          const categoria = fichas.genres.get(`s|${normKey}`) || fichas.genres.get(normKey) || 'Série';

          seriesList.push({
            id: `dyn-${l}-${i}`,
            letra: l,
            pedaco: pedaco,
            titulo: nome,
            ano: ano === '0' || !ano ? 'Série' : ano,
            categoria: categoria,
            capa: capa,
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

    const normTarget = normalizeTitle(seriesTitle);

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('@')) {
        const currentTitle = normalizeTitle(trimmed.slice(1));
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

          // Filtrar links válidos descartando servidores mortos ou APIs desativadas
          const validUrls = rawLinks
            .map(l => l.trim())
            .filter(l => {
              if (!l.startsWith('http')) return false;
              for (const dead of DEAD_HOSTS) {
                if (l.includes(dead)) return false;
              }
              return true;
            });

          // Remover duplicatas
          const uniqueUrls = [...new Set(validUrls)];

          // Ordenar fontes priorizando HLS estáveis e MP4 direto
          uniqueUrls.sort((a, b) => {
            const scoreA = (a.startsWith('https') ? 2 : 0) + (a.includes('embedplayer2') || a.includes('maximaimg') || a.includes('.m3u8') ? 3 : 1);
            const scoreB = (b.startsWith('https') ? 2 : 0) + (b.includes('embedplayer2') || b.includes('maximaimg') || b.includes('.m3u8') ? 3 : 1);
            return scoreB - scoreA;
          });

          if (uniqueUrls.length > 0) {
            episodes.push({
              season,
              episode,
              audio: audio === 'dub' ? 'dublado' : 'legendado',
              url: uniqueUrls[0],
              allUrls: uniqueUrls,
              nome: `T${season}:E${episode} (${audio === 'dub' ? 'Dublado' : 'Legendado'})`
            });
          }
        }
      }
    }

    return episodes;
  }
};

// Iniciar pré-carregamento imediato das capas
VodService.preloadFichas();
