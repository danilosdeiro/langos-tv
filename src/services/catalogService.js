import defaultCanais from '../data/canais.json';
import defaultFilmes from '../data/filmes.json';
import defaultSeries from '../data/series.json';

const STORAGE_KEY_CUSTOM_LIST = 'langos_custom_channels_url';
const STORAGE_KEY_CACHED_CUSTOM = 'langos_cached_custom_channels_v4';
const STORAGE_KEY_FAVORITES = 'langos_favorites';

export const CatalogService = {
  // Obter canais iniciais (prioriza lista limpa do sistema, a menos que o usuário tenha configurado lista customizada)
  getChannels() {
    try {
      // Limpar cache legado antigo que possa ter URLs desatualizadas
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('langos_cached_channels');
        localStorage.removeItem('langos_cached_channels_v2');
        localStorage.removeItem('langos_cached_channels_v3');
      }

      // Se o usuário adicionou uma lista personalizada nas configurações
      const customUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_LIST);
      const cachedCustom = localStorage.getItem(STORAGE_KEY_CACHED_CUSTOM);
      if (customUrl && cachedCustom) {
        const parsed = JSON.parse(cachedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar canais do localStorage:', e);
    }
    return defaultCanais;
  },

  // Obter filmes
  getMovies() {
    return defaultFilmes;
  },

  // Obter séries
  getSeries() {
    return defaultSeries;
  },

  // Obter favoritos salvos
  getFavorites() {
    try {
      const favs = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return favs ? JSON.parse(favs) : [];
    } catch {
      return [];
    }
  },

  // Alternar favorito (id)
  toggleFavorite(id) {
    const favs = this.getFavorites();
    const index = favs.indexOf(id);
    let updated;
    if (index >= 0) {
      updated = favs.filter(item => item !== id);
    } else {
      updated = [...favs, id];
    }
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    } catch (e) {
      console.error('Erro ao salvar favoritos:', e);
    }
    return updated;
  },

  // Parser para converter formato catalogo.txt ou M3U em array de canais
  parseCatalogText(text) {
    if (!text || typeof text !== 'string') return [];

    // Se for formato M3U (#EXTM3U)
    if (text.includes('#EXTM3U')) {
      return this.parseM3U(text);
    }

    // Formato catalogo.txt (chave: valor)
    const lines = text.split('\n');
    const canais = [];
    let current = null;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('canal:')) {
        if (current && current.fontes.length > 0) {
          canais.push(current);
        }
        const name = line.replace('canal:', '').trim();
        current = {
          id: `ch-${canais.length + 1}-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          nome: name,
          categoria: 'Geral',
          logo: '',
          fontes: []
        };
      } else if (current) {
        if (line.startsWith('categoria:')) {
          current.categoria = line.replace('categoria:', '').trim();
        } else if (line.startsWith('logo:')) {
          current.logo = line.replace('logo:', '').trim();
        } else if (line.startsWith('fonte:')) {
          const url = line.replace('fonte:', '').trim();
          if (url.startsWith('http')) {
            current.fontes.push({
              url: url,
              qualidade: 'Auto',
              nome: `Fonte ${current.fontes.length + 1}`
            });
          }
        } else if (line.startsWith('qualidade:') && current.fontes.length > 0) {
          current.fontes[current.fontes.length - 1].qualidade = line.replace('qualidade:', '').trim();
        } else if (line.startsWith('nome:') && current.fontes.length > 0) {
          current.fontes[current.fontes.length - 1].nome = line.replace('nome:', '').trim();
        }
      }
    }

    if (current && current.fontes.length > 0) {
      canais.push(current);
    }

    return canais;
  },

  // Parser M3U
  parseM3U(m3uText) {
    const lines = m3uText.split('\n');
    const canais = [];
    let currentName = '';
    let currentLogo = '';
    let currentGroup = 'Geral';

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('#EXTINF:')) {
        const nameMatch = line.match(/,(.*)$/);
        currentName = nameMatch ? nameMatch[1].trim() : 'Canal';

        const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
        currentLogo = logoMatch ? logoMatch[1] : '';

        const groupMatch = line.match(/group-title="([^"]*)"/i);
        currentGroup = groupMatch ? groupMatch[1] : 'Geral';
      } else if (line.startsWith('http')) {
        canais.push({
          id: `m3u-${canais.length + 1}`,
          nome: currentName || `Canal ${canais.length + 1}`,
          categoria: currentGroup,
          logo: currentLogo,
          fontes: [
            {
              url: line,
              qualidade: 'Padrão',
              nome: 'Fonte 1'
            }
          ]
        });
        currentName = '';
        currentLogo = '';
        currentGroup = 'Geral';
      }
    }
    return canais;
  },

  // Buscar lista remota
  async fetchRemoteList(url) {
    const targetUrl = url || 'https://canais-saimo.pages.dev/catalogo.txt';
    const resp = await fetch(targetUrl);
    if (!resp.ok) throw new Error(`Falha ao baixar lista: HTTP ${resp.status}`);
    const text = await resp.text();
    const canais = this.parseCatalogText(text);
    if (canais.length > 0) {
      if (url) {
        localStorage.setItem(STORAGE_KEY_CUSTOM_LIST, url);
        localStorage.setItem(STORAGE_KEY_CACHED_CUSTOM, JSON.stringify(canais));
      }
    }
    return canais;
  },

  // Exportar para arquivo .M3U para backup
  exportToM3U(canais) {
    let m3u = '#EXTM3U\n\n';
    for (const ch of canais) {
      for (const [idx, f] of ch.fontes.entries()) {
        const fonteNome = ch.fontes.length > 1 ? `${ch.nome} (${f.nome || 'F' + (idx + 1)})` : ch.nome;
        m3u += `#EXTINF:-1 tvg-name="${ch.nome}" tvg-logo="${ch.logo || ''}" group-title="${ch.categoria}", ${fonteNome}\n`;
        m3u += `${f.url}\n\n`;
      }
    }

    const blob = new Blob([m3u], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `langos_tv_canais_${new Date().toISOString().slice(0, 10)}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
