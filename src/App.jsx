import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ChannelCard from './components/ChannelCard';
import MovieCard from './components/MovieCard';
import SeriesCard from './components/SeriesCard';
import EpisodeModal from './components/EpisodeModal';
import SettingsModal from './components/SettingsModal';
import EpgModal from './components/EpgModal';
import EpgTimelineGrid from './components/EpgTimelineGrid';
import InstallTvModal from './components/InstallTvModal';
import ChannelHealthModal from './components/ChannelHealthModal';
import HeroBanner from './components/HeroBanner';
import LiveMatchesSection from './components/LiveMatchesSection';
import ErrorBoundary from './components/ErrorBoundary';
import { CatalogService } from './services/catalogService';
import { VodService } from './services/vodService';
import { HistoryService } from './services/historyService';
import { TvNavigation } from './services/tvNavigation';
import { 
  Tv, Film, Clapperboard, Star, Sparkles, Filter, 
  Volume2, Play, AlertCircle, Compass, Loader2, Clock, X, MapPin,
  ChevronLeft, ChevronRight, LayoutGrid
} from 'lucide-react';

const ALPHABET = ['Destaques', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Categorias sumarizadas e organizadas por relevância e volume
const CHANNEL_CATEGORY_GROUPS = [
  { id: 'Todos', label: 'Todos os Canais', icon: '🌐', short: 'Todos' },
  { id: 'TV Aberta', label: 'TV Aberta', icon: '📺', short: 'TV Aberta', match: ['TV Aberta'] },
  { id: 'Reality Shows', label: 'Reality Shows', icon: '🤠', badge: 'PPV', short: 'Reality PPV', match: ['Reality Shows'] },
  { id: 'Filmes e Séries', label: 'Filmes e Séries', icon: '🎬', short: 'Filmes & Séries', match: ['Filmes e Séries'] },
  { id: 'Esportes', label: 'Esportes', icon: '⚽', short: 'Esportes', match: ['Esportes'] },
  { id: 'Notícias', label: 'Notícias', icon: '📰', short: 'Notícias', match: ['Notícias'] },
  { id: 'Variedades', label: 'Variedades & Música', icon: '✨', short: 'Variedades', match: ['Variedades', 'Músicas'] },
  { id: 'Infantil', label: 'Infantil & Desenhos', icon: '🧸', short: 'Infantil', match: ['Infantil'] },
  { id: 'Documentários', label: 'Documentários', icon: '🌍', short: 'Documentários', match: ['Documentários'] },
  { id: '24 Horas', label: '24 Horas & FAST', icon: '⏱️', short: '24 Horas', match: ['24 Horas', 'Pluto TV'] },
];

const BRAZIL_STATES = [
  { uf: 'BA', nome: 'Bahia', label: 'Bahia (BA)' },
  { uf: 'SP', nome: 'São Paulo', label: 'São Paulo (SP)' },
  { uf: 'RJ', nome: 'Rio de Janeiro', label: 'Rio de Janeiro (RJ)' },
  { uf: 'MG', nome: 'Minas Gerais', label: 'Minas Gerais (MG)' },
  { uf: 'RS', nome: 'Rio Grande do Sul', label: 'Rio Grande do Sul (RS)' },
  { uf: 'CE', nome: 'Ceará', label: 'Ceará (CE)' },
  { uf: 'PE', nome: 'Pernambuco', label: 'Pernambuco (PE)' },
  { uf: 'AM', nome: 'Amazonas', label: 'Amazonas (AM)' },
  { uf: 'DF', nome: 'Distrito Federal', label: 'Distrito Federal (DF)' },
  { uf: 'TODOS', nome: 'Todos os Estados', label: 'Todos os Estados' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('canais'); // 'canais', 'filmes', 'series', 'animes', 'favoritos'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelCategory, setSelectedChannelCategory] = useState('Todos');
  const [selectedVodGenre, setSelectedVodGenre] = useState('Todos');
  const [vodAudioFilter, setVodAudioFilter] = useState('todos'); // 'todos', 'dublado', 'legendado'
  const [preferredAudio, setPreferredAudio] = useState('dublado'); // para reprodução

  // Lançamentos Recentes (Filtro Rápido 2026/2025)
  const [isOnlyReleases, setIsOnlyReleases] = useState(false);

  // Estado para Animes em Destaque & Filtro de Gênero
  const [featuredAnimes, setFeaturedAnimes] = useState([]);
  const [selectedAnimeGenre, setSelectedAnimeGenre] = useState('Todos');

  // Região do Usuário para TV Aberta (Padrão: 'BA' Bahia)
  const [userState, setUserState] = useState(() => {
    if (typeof window === 'undefined') return 'BA';
    return localStorage.getItem('langos_selected_state') || 'BA';
  });

  const handleSelectState = (uf) => {
    setUserState(uf);
    if (typeof window !== 'undefined') {
      localStorage.setItem('langos_selected_state', uf);
    }
  };

  // Conteúdos base
  const [channels, setChannels] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Estado para Filmes Dinâmicos (A-Z com +45.000 títulos)
  const [selectedMovieLetter, setSelectedMovieLetter] = useState('Destaques');
  const [dynamicMovies, setDynamicMovies] = useState([]);
  const [loadingDynamicMovies, setLoadingDynamicMovies] = useState(false);

  // Estado para Séries Dinâmicas (A-Z com +7.000 títulos)
  const [selectedSeriesLetter, setSelectedSeriesLetter] = useState('Destaques');
  const [dynamicSeries, setDynamicSeries] = useState([]);
  const [loadingDynamicSeries, setLoadingDynamicSeries] = useState(false);

  // Histórico de "Continuar Assistindo"
  const [continueWatchingList, setContinueWatchingList] = useState([]);

  // Estado do Player
  const [activeItem, setActiveItem] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search);
        const chId = p.get('ch') || p.get('channel');
        if (chId) {
          const found = CatalogService.getChannels().find(c => c.id === chId);
          if (found) return found;
        }
      } catch {}
    }
    return null;
  });
  const playerSectionRef = useRef(null);

  // Modais
  const [selectedSeriesForEpisodes, setSelectedSeriesForEpisodes] = useState(null);
  const [selectedChannelForEpg, setSelectedChannelForEpg] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallTvOpen, setIsInstallTvOpen] = useState(false);
  const [isEpgGridOpen, setIsEpgGridOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  // Controle de Visualização e Rolagem de Categorias
  const [isCategoryGridExpanded, setIsCategoryGridExpanded] = useState(false);
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Modo TV (10-Foot UI para BTV e Smart TV Box)
  const [isTvMode, setIsTvMode] = useState(() => {
    const saved = localStorage.getItem('langos_tv_mode');
    if (saved !== null) return saved === 'true';
    return TvNavigation.isTvDevice;
  });

  useEffect(() => {
    localStorage.setItem('langos_tv_mode', isTvMode ? 'true' : 'false');
    if (isTvMode) {
      document.body.classList.add('tv-mode');
    } else {
      document.body.classList.remove('tv-mode');
    }
  }, [isTvMode]);

  // Gerenciador de Botão Voltar para Controle Remoto de BTV e TV Box
  useEffect(() => {
    const unregister = TvNavigation.registerBackHandler(() => {
      if (isHealthModalOpen) {
        setIsHealthModalOpen(false);
      } else if (isEpgGridOpen) {
        setIsEpgGridOpen(false);
      } else if (isInstallTvOpen) {
        setIsInstallTvOpen(false);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (selectedChannelForEpg) {
        setSelectedChannelForEpg(null);
      } else if (selectedSeriesForEpisodes) {
        setSelectedSeriesForEpisodes(null);
      } else if (activeItem) {
        setActiveItem(null);
      }
    });
    return unregister;
  }, [isHealthModalOpen, isEpgGridOpen, isInstallTvOpen, isSettingsOpen, selectedChannelForEpg, selectedSeriesForEpisodes, activeItem]);

  // Teclas de atalho globais: G para Grade EPG e V para Verificação/Saúde dos Canais
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setIsEpgGridOpen(prev => !prev);
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setIsHealthModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Inicialização
  useEffect(() => {
    setChannels(CatalogService.getChannels());
    setFavorites(CatalogService.getFavorites());
    setContinueWatchingList(HistoryService.getRecent());

    // Carregar destaques de séries em nuvem
    VodService.fetchFeaturedSeries()
      .then(featured => setFeaturedSeries(featured))
      .catch(err => {
        console.warn('Erro ao carregar destaques de séries:', err);
        setFeaturedSeries(CatalogService.getSeries());
      });

    // Carregar filmes em destaque (Base VIP + Lançamentos dinâmicos de 2026)
    const baseMovies = CatalogService.getMovies();
    setFeaturedMovies(baseMovies);
    VodService.fetchFeaturedMovies()
      .then(featured => {
        const existingIds = new Set(baseMovies.map(m => m.id));
        const unique = (featured || []).filter(m => !existingIds.has(m.id));
        setFeaturedMovies([...baseMovies, ...unique]);
      })
      .catch(err => {
        console.warn('Erro ao carregar destaques de filmes:', err);
        setFeaturedMovies(baseMovies);
      });

    // Carregar acervo VIP de animes
    VodService.fetchFeaturedAnimes()
      .then(animes => setFeaturedAnimes(animes))
      .catch(err => {
        console.warn('Erro ao carregar animes:', err);
      });
  }, []);

  // Atualizar histórico de reprodução quando o player fechar ou trocar
  useEffect(() => {
    setContinueWatchingList(HistoryService.getRecent());
  }, [activeItem]);

  // Carregar séries da nuvem por letra selecionada
  useEffect(() => {
    if (selectedSeriesLetter === 'Destaques') {
      setDynamicSeries([]);
      return;
    }

    setLoadingDynamicSeries(true);
    VodService.fetchSeriesByLetter(selectedSeriesLetter)
      .then(list => setDynamicSeries(list))
      .catch(err => {
        console.warn('Erro ao carregar séries:', err);
        setDynamicSeries([]);
      })
      .finally(() => setLoadingDynamicSeries(false));
  }, [selectedSeriesLetter]);

  // Carregar filmes da nuvem por letra selecionada
  useEffect(() => {
    if (selectedMovieLetter === 'Destaques') {
      setDynamicMovies([]);
      return;
    }

    setLoadingDynamicMovies(true);
    VodService.fetchMoviesByLetter(selectedMovieLetter)
      .then(list => setDynamicMovies(list))
      .catch(err => {
        console.warn('Erro ao carregar filmes:', err);
        setDynamicMovies([]);
      })
      .finally(() => setLoadingDynamicMovies(false));
  }, [selectedMovieLetter]);

  // Roteamento inteligente na busca por letra inicial
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const firstChar = searchQuery.trim()[0].toUpperCase();
      if (/^[A-Z]$/.test(firstChar)) {
        if (activeTab === 'series' && selectedSeriesLetter !== firstChar) {
          setSelectedSeriesLetter(firstChar);
        } else if (activeTab === 'filmes' && selectedMovieLetter !== firstChar) {
          setSelectedMovieLetter(firstChar);
        }
      }
    }
  }, [searchQuery, activeTab, selectedSeriesLetter, selectedMovieLetter]);

  // Alternar favorito
  const handleToggleFavorite = (id) => {
    const updated = CatalogService.toggleFavorite(id);
    setFavorites(updated);
  };

  // Selecionar canal ou filme para assistir
  const handleSelectItem = async (item, audio = 'dublado', initialSeekTime = 0) => {
    let resolvedItem = item;
    // Se for filme dinâmico sem fontes resolvidas
    if (item.isDynamic && !item.dublado?.length && !item.legendado?.length && !item.titulo?.includes('— T')) {
      resolvedItem = await VodService.resolveMovieSources(item);
    }

    if (initialSeekTime > 0) {
      resolvedItem = { ...resolvedItem, initialSeekTime };
    }

    setActiveItem(resolvedItem);
    setPreferredAudio(audio);
    setTimeout(() => {
      playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Clicar em uma série (abre o modal de episódios)
  const handleSelectSeries = (seriesItem) => {
    setSelectedSeriesForEpisodes(seriesItem);
  };

  // Navegação de canais no player (Anterior / Próximo)
  const handleNextChannel = () => {
    if (!channels.length || !activeItem) return;
    const curIdx = channels.findIndex(c => c.id === activeItem.id);
    const nextIdx = (curIdx + 1) % channels.length;
    handleSelectItem(channels[nextIdx]);
  };

  const handlePrevChannel = () => {
    if (!channels.length || !activeItem) return;
    const curIdx = channels.findIndex(c => c.id === activeItem.id);
    const prevIdx = (curIdx - 1 + channels.length) % channels.length;
    handleSelectItem(channels[prevIdx]);
  };

  // Navegação Espacial 2D por Controle Remoto (D-Pad para BTV, Android TV e Smart TV)
  useEffect(() => {
    const handleRemoteDpad = (e) => {
      // Se estiver digitando em campo de texto (busca)
      if (e.target.tagName === 'INPUT') {
        if (e.key === 'ArrowDown' || e.keyCode === 40) {
          e.preventDefault();
          e.target.blur();
          const firstFocusable = document.querySelector('[data-tv-card="true"], [data-tv-focus="true"]');
          firstFocusable?.focus();
        }
        return;
      }

      // Se o player estiver ativo em tela cheia, ele gerencia seus próprios atalhos
      if (document.fullscreenElement) return;

      const key = e.key;
      const keyCode = e.keyCode;

      let direction = null;
      if (key === 'ArrowRight' || keyCode === 39) direction = 'right';
      else if (key === 'ArrowLeft' || keyCode === 37) direction = 'left';
      else if (key === 'ArrowDown' || keyCode === 40) direction = 'down';
      else if (key === 'ArrowUp' || keyCode === 38) direction = 'up';

      if (!direction) return;

      const currentEl = document.activeElement;
      const elements = Array.from(document.querySelectorAll('[data-tv-focus="true"], [data-tv-card="true"]'))
        .filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && window.getComputedStyle(el).display !== 'none';
        });

      if (!elements.length) return;

      // Se nenhum elemento com foco da TV estiver ativo
      if (!currentEl || !elements.includes(currentEl)) {
        e.preventDefault();
        const initialEl = document.querySelector('[data-tv-card="true"]') || elements[0];
        initialEl?.focus();
        initialEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return;
      }

      const curRect = currentEl.getBoundingClientRect();
      const curCenter = {
        x: curRect.left + curRect.width / 2,
        y: curRect.top + curRect.height / 2
      };

      let bestEl = null;
      let bestDist = Infinity;

      for (const el of elements) {
        if (el === currentEl) continue;
        const r = el.getBoundingClientRect();
        const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };

        const dx = c.x - curCenter.x;
        const dy = c.y - curCenter.y;

        let isValid = false;
        let dist = 0;

        if (direction === 'right' && dx > 10) {
          isValid = Math.abs(dy) < Math.abs(dx) * 1.6;
          dist = Math.hypot(dx, dy * 2);
        } else if (direction === 'left' && dx < -10) {
          isValid = Math.abs(dy) < Math.abs(dx) * 1.6;
          dist = Math.hypot(Math.abs(dx), dy * 2);
        } else if (direction === 'down' && dy > 10) {
          isValid = Math.abs(dx) < Math.abs(dy) * 1.6;
          dist = Math.hypot(dx * 2, dy);
        } else if (direction === 'up' && dy < -10) {
          isValid = Math.abs(dx) < Math.abs(dy) * 1.6;
          dist = Math.hypot(dx * 2, Math.abs(dy));
        }

        if (isValid && dist < bestDist) {
          bestDist = dist;
          bestEl = el;
        }
      }

      if (bestEl) {
        e.preventDefault();
        bestEl.focus();
        bestEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleRemoteDpad);
    return () => window.removeEventListener('keydown', handleRemoteDpad);
  }, []);

  // Contagem dinâmica de canais por categoria sumarizada
  const categoryCounts = useMemo(() => {
    const counts = { Todos: channels.length };
    CHANNEL_CATEGORY_GROUPS.forEach(g => {
      if (g.match) {
        counts[g.id] = channels.filter(c => g.match.includes(c.categoria)).length;
      }
    });
    return counts;
  }, [channels]);

  // Canais filtrados com prioridade regional para TV Aberta
  const filteredChannels = useMemo(() => {
    let list = channels.filter(c => {
      const matchesSearch = searchQuery === '' || 
        c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.estado && c.estado.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesCategory = false;
      if (selectedChannelCategory === 'Todos') {
        matchesCategory = true;
      } else {
        const group = CHANNEL_CATEGORY_GROUPS.find(g => g.id === selectedChannelCategory);
        if (group && group.match) {
          matchesCategory = group.match.includes(c.categoria);
        } else {
          matchesCategory = c.categoria === selectedChannelCategory;
        }
      }

      return matchesSearch && matchesCategory;
    });

    // Se estiver na categoria TV Aberta, organizar com prioridade máxima para o estado do usuário
    if (selectedChannelCategory === 'TV Aberta') {
      if (userState !== 'TODOS') {
        const localChannels = list.filter(c => c.uf === userState);
        const nationalChannels = list.filter(c => c.isNational || c.uf === 'BR');
        const otherAffiliates = list.filter(c => c.uf && c.uf !== userState && c.uf !== 'BR');
        return [...localChannels, ...nationalChannels, ...otherAffiliates];
      }
    }

    return list;
  }, [channels, searchQuery, selectedChannelCategory, userState]);

  // Filmes a exibir (Destaques ou Dinâmicos da letra)
  const displayedMovies = useMemo(() => {
    const list = selectedMovieLetter === 'Destaques' ? featuredMovies : dynamicMovies;

    return list.filter(m => {
      const matchesSearch = searchQuery === '' || 
        m.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.categoria && m.categoria.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre = selectedVodGenre === 'Todos' || (m.categoria && m.categoria.includes(selectedVodGenre));
      
      const matchesRelease = !isOnlyReleases || 
        m.ano === '2026' || 
        m.ano === '2025' || 
        m.duracao === 'Lançamento' || 
        (m.ano && parseInt(m.ano) >= 2025);

      const matchesAudio = 
        vodAudioFilter === 'todos' ||
        m.isDynamic ||
        (vodAudioFilter === 'dublado' && m.dublado && m.dublado.length > 0) ||
        (vodAudioFilter === 'legendado' && m.legendado && m.legendado.length > 0);

      return matchesSearch && matchesGenre && matchesRelease && matchesAudio;
    });
  }, [selectedMovieLetter, featuredMovies, dynamicMovies, searchQuery, selectedVodGenre, vodAudioFilter, isOnlyReleases]);

  // Séries a exibir (Destaques ou Dinâmicas da letra)
  const displayedSeries = useMemo(() => {
    const list = selectedSeriesLetter === 'Destaques' ? featuredSeries : dynamicSeries;

    return list.filter(s => {
      const matchesSearch = searchQuery === '' || 
        s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.categoria && s.categoria.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRelease = !isOnlyReleases || 
        s.ano === '2026' || 
        s.ano === '2025' || 
        s.ano === '2024' || 
        (s.ano && parseInt(s.ano) >= 2024);

      const matchesAudio = 
        vodAudioFilter === 'todos' ||
        s.isDynamic ||
        (vodAudioFilter === 'dublado' && s.dublado && s.dublado.length > 0) ||
        (vodAudioFilter === 'legendado' && s.legendado && s.legendado.length > 0);

      return matchesSearch && matchesRelease && matchesAudio;
    });
  }, [selectedSeriesLetter, featuredSeries, dynamicSeries, searchQuery, vodAudioFilter, isOnlyReleases]);

  // Animes a exibir (com filtros de busca, gênero, áudio e lançamentos)
  const displayedAnimes = useMemo(() => {
    return featuredAnimes.filter(a => {
      const matchesSearch = searchQuery === '' || 
        a.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.categoria && a.categoria.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre = selectedAnimeGenre === 'Todos' || 
        (a.categoria && a.categoria.toLowerCase().includes(selectedAnimeGenre.toLowerCase()));

      const matchesRelease = !isOnlyReleases || 
        a.ano === '2026' || 
        a.ano === '2025' || 
        a.ano === '2024' || 
        (a.ano && parseInt(a.ano) >= 2024);

      const matchesAudio = 
        vodAudioFilter === 'todos' ||
        a.isDynamic ||
        (vodAudioFilter === 'dublado' && a.dublado && a.dublado.length > 0) ||
        (vodAudioFilter === 'legendado' && a.legendado && a.legendado.length > 0);

      return matchesSearch && matchesGenre && matchesRelease && matchesAudio;
    });
  }, [featuredAnimes, searchQuery, selectedAnimeGenre, vodAudioFilter, isOnlyReleases]);

  // Canais de Anime 24h ao Vivo
  const liveAnimeChannels = useMemo(() => {
    return channels.filter(c => {
      const name = (c.nome || '').toLowerCase();
      const cat = (c.categoria || '').toLowerCase();
      return name.includes('anime') || name.includes('otaku') || name.includes('loading') || name.includes('crunchy') || name.includes('naruto') || name.includes('dragon ball');
    });
  }, [channels]);

  // Itens favoritos
  const favoriteChannels = useMemo(() => {
    return channels.filter(c => favorites.includes(c.id));
  }, [channels, favorites]);

  const favoriteMovies = useMemo(() => {
    return featuredMovies.filter(m => favorites.includes(m.id));
  }, [featuredMovies, favorites]);

  const favoriteSeries = useMemo(() => {
    return featuredSeries.filter(s => favorites.includes(s.id));
  }, [featuredSeries, favorites]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Cabeçalho */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        favoritesCount={favorites.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstallTv={() => setIsInstallTvOpen(true)}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
        isTvMode={isTvMode}
        onToggleTvMode={() => setIsTvMode(!isTvMode)}
        userState={userState}
        onOpenEpgGrid={() => setIsEpgGridOpen(true)}
        isEpgGridOpen={isEpgGridOpen}
        isOnlyReleases={isOnlyReleases}
        onToggleReleases={() => setIsOnlyReleases(prev => !prev)}
      />

      {/* Área Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-8">

        {/* Player de Vídeo em Destaque */}
        {activeItem && (
          <section ref={playerSectionRef} className="animate-fadeIn scroll-mt-20 sm:scroll-mt-24">
            <div className="bg-zinc-900/40 p-2 md:p-3 rounded-3xl border border-white/10 shadow-2xl">
              <ErrorBoundary fallback={(error, reset) => (
                <div className="p-8 text-center bg-zinc-950/80 rounded-2xl border border-white/10">
                  <p className="text-red-400 font-bold mb-2">Erro ao reproduzir conteúdo</p>
                  <p className="text-zinc-400 text-xs mb-4">{error?.message || 'Falha inesperada no player'}</p>
                  <button onClick={() => { reset(); setActiveItem(null); }} className="px-4 py-2 bg-indigo-600 rounded-xl text-white text-xs font-bold">
                    Voltar aos Canais
                  </button>
                </div>
              )}>
                <VideoPlayer
                  item={activeItem}
                  audioVersion={preferredAudio}
                  onAudioVersionChange={setPreferredAudio}
                  onClose={() => setActiveItem(null)}
                  onOpenEpg={(ch) => setSelectedChannelForEpg(ch)}
                  onOpenEpgGrid={() => setIsEpgGridOpen(true)}
                  onNextChannel={handleNextChannel}
                  onPrevChannel={handlePrevChannel}
                  channels={channels}
                  onSelectChannel={(ch) => handleSelectItem(ch)}
                  onPlayNextEpisode={(nextEp, audio) => handleSelectItem(nextEp, audio)}
                />
              </ErrorBoundary>
            </div>
          </section>
        )}

        {/* Fileira: Continuar Assistindo (Se houver mídias em andamento) */}
        {continueWatchingList.length > 0 && !searchQuery && (
          <section className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" />
                Continuar Assistindo
              </h2>
              <button 
                onClick={() => {
                  HistoryService.clearAll();
                  setContinueWatchingList([]);
                }}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
              >
                Limpar Histórico
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {continueWatchingList.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => handleSelectItem(entry.itemPayload, entry.audioVersion, entry.currentTime)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.code === 'Space' || e.keyCode === 13) {
                      e.preventDefault();
                      handleSelectItem(entry.itemPayload, entry.audioVersion, entry.currentTime);
                    }
                  }}
                  data-tv-card="true"
                  data-tv-focus="true"
                  tabIndex={0}
                  role="button"
                  aria-label={`Continuar assistindo ${entry.titulo}`}
                  className="group relative bg-zinc-900 border border-white/10 hover:border-indigo-500/50 rounded-2xl p-2.5 flex items-center gap-3 shrink-0 w-64 md:w-72 cursor-pointer transition shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 focus:outline-none"
                >
                  <div className="w-12 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/5 relative">
                    {entry.capa ? (
                      <img 
                        src={entry.capa} 
                        alt={entry.titulo} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play size={14} fill="currentColor" className="text-white ml-0.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                      {entry.titulo}
                    </h4>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {entry.categoria} • {entry.percent}%
                    </p>

                    {/* Barra de Progresso */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${entry.percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = HistoryService.removeItem(entry.id);
                      setContinueWatchingList(updated);
                    }}
                    data-tv-focus="true"
                    className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                    title="Remover do Histórico"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Banner Hero Cinematográfico (Estilo Netflix / HBO Max) */}
        {!activeItem && !searchQuery && activeTab === 'canais' && (
          <HeroBanner
            movies={featuredMovies}
            onPlayMovie={(movie) => handleSelectItem(movie)}
            onSelectCategory={(cat) => setSelectedChannelCategory(cat)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* ---------------- ABA: CANAIS AO VIVO COM EPG ---------------- */}
        {activeTab === 'canais' && (
          <div className="space-y-6">
            
            {/* Barra de Categorias Profissional e Otimizada */}
            <div className="bg-zinc-900/40 p-2.5 sm:p-3.5 rounded-2xl border border-white/5 space-y-2.5">
              
              {/* Cabeçalho da Barra de Categorias com Controles */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Filter size={13} />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-200 truncate">
                    Categorias
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 hidden sm:inline">
                    • {channels.length} canais ao vivo
                  </span>
                </div>

                {/* Controles: Setas de Rolagem + Alternador Ver Todas */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isCategoryGridExpanded && (
                    <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-xl border border-white/10">
                      <button
                        onClick={() => scrollCategories('left')}
                        data-tv-focus="true"
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        title="Rolar categorias para esquerda"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        onClick={() => scrollCategories('right')}
                        data-tv-focus="true"
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        title="Rolar categorias para direita"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setIsCategoryGridExpanded(prev => !prev)}
                    data-tv-focus="true"
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                      isCategoryGridExpanded
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                        : 'bg-zinc-900/90 text-zinc-400 hover:text-white border-white/10 hover:bg-zinc-800'
                    }`}
                    title={isCategoryGridExpanded ? 'Voltar para carrossel' : 'Ver todas as categorias em grade'}
                  >
                    <LayoutGrid size={13} />
                    <span className="hidden sm:inline">{isCategoryGridExpanded ? 'Carrossel' : 'Ver Todas'}</span>
                  </button>
                </div>
              </div>

              {/* Linha de Categorias (Modo Grade Completa ou Carrossel Suave) */}
              {isCategoryGridExpanded ? (
                /* Modo Grade: Todos os itens visíveis organizados em bloco */
                <div className="flex flex-wrap items-center gap-2 pt-1 animate-fadeIn">
                  {CHANNEL_CATEGORY_GROUPS.map(group => {
                    const isReality = group.id === 'Reality Shows';
                    const isSelected = selectedChannelCategory === group.id;
                    const count = categoryCounts[group.id] || 0;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setSelectedChannelCategory(group.id)}
                        data-tv-focus="true"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? isReality
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30 font-black scale-105'
                              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                            : isReality
                              ? 'bg-amber-500/10 text-amber-300 hover:text-white hover:bg-amber-500/20 border border-amber-500/30'
                              : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-white/5'
                        }`}
                      >
                        <span>{group.icon}</span>
                        <span>{group.label}</span>
                        {group.badge && (
                          <span className="text-[9px] px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-black border border-amber-400/30 uppercase">
                            {group.badge}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                          isSelected ? (isReality ? 'bg-black/20 text-black' : 'bg-white/20 text-white') : 'bg-white/5 text-zinc-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Modo Carrossel: Linha horizontal suave com setas e sem corte abrupto */
                <div className="relative">
                  <div
                    ref={categoryScrollRef}
                    className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
                  >
                    {CHANNEL_CATEGORY_GROUPS.map(group => {
                      const isReality = group.id === 'Reality Shows';
                      const isSelected = selectedChannelCategory === group.id;
                      const count = categoryCounts[group.id] || 0;
                      return (
                        <button
                          key={group.id}
                          onClick={() => setSelectedChannelCategory(group.id)}
                          data-tv-focus="true"
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                            isSelected
                              ? isReality
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30 font-black scale-105'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                              : isReality
                                ? 'bg-amber-500/10 text-amber-300 hover:text-white hover:bg-amber-500/20 border border-amber-500/30'
                                : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-white/5'
                          }`}
                        >
                          <span>{group.icon}</span>
                          <span>{group.label}</span>
                          {group.badge && (
                            <span className="text-[9px] px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-black border border-amber-400/30 uppercase">
                              {group.badge}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                            isSelected ? (isReality ? 'bg-black/20 text-black' : 'bg-white/20 text-white') : 'bg-white/5 text-zinc-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Seletor Regional de Estado para Afiliadas de TV Aberta */}
            {selectedChannelCategory === 'TV Aberta' && (
              <div className="bg-gradient-to-r from-indigo-950/70 via-zinc-900/90 to-zinc-950 border border-indigo-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white text-xs sm:text-sm font-extrabold truncate">
                        Sua Região: <span className="text-indigo-400">{BRAZIL_STATES.find(s => s.uf === userState)?.nome || 'Bahia'}</span>
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        Afiliadas Prioritárias
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Canais e telejornais locais da sua região organizados no topo da grade.
                    </p>
                  </div>
                </div>

                {/* Botões dos Estados */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
                  {BRAZIL_STATES.map(st => (
                    <button
                      key={st.uf}
                      onClick={() => handleSelectState(st.uf)}
                      data-tv-focus="true"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                        userState === st.uf
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                          : 'bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-white/5'
                      }`}
                    >
                      {st.uf === 'BA' && '⭐ '}
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seção de Jogos Ao Vivo & Transmissões (Esportes) */}
            {(selectedChannelCategory === 'Esportes' || (selectedChannelCategory === 'Todos' && !searchQuery)) && (
              <LiveMatchesSection
                channels={channels}
                onSelectChannel={(ch) => handleSelectItem(ch)}
              />
            )}

            {/* Cabeçalho da Seção com Badge EPG */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-extrabold text-xl flex items-center gap-2">
                  <Tv className="text-indigo-400" size={22} />
                  {selectedChannelCategory === 'Todos' ? 'Todos os Canais' : selectedChannelCategory}
                </h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Exibindo {filteredChannels.length} canais com grade EPG ao vivo e múltiplas fontes
                </p>
              </div>
            </div>

            {/* Grade de Canais */}
            {filteredChannels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {filteredChannels.map(channel => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    channelNumber={channels.findIndex(c => c.id === channel.id) + 1}
                    isFavorite={favorites.includes(channel.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(ch) => handleSelectItem(ch)}
                    isActive={activeItem?.id === channel.id}
                    onOpenEpg={(ch) => setSelectedChannelForEpg(ch)}
                    isLocal={channel.uf === userState && channel.uf !== 'BR'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
                <AlertCircle size={40} className="mx-auto text-zinc-500 mb-3" />
                <h3 className="text-white font-bold text-base mb-1">Nenhum canal encontrado</h3>
                <p className="text-zinc-400 text-xs mb-4">Tente ajustar a busca ou a categoria selecionada.</p>
                {searchQuery && (
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      onClick={() => setActiveTab('filmes')}
                      data-tv-focus="true"
                      className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Film size={14} className="text-indigo-400" />
                      <span>Buscar "{searchQuery}" em Filmes</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('series')}
                      data-tv-focus="true"
                      className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Clapperboard size={14} className="text-purple-400" />
                      <span>Buscar "{searchQuery}" em Séries</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---------------- ABA: FILMES (+45.000 TÍTULOS COM A-Z DIÁRIO) ---------------- */}
        {activeTab === 'filmes' && (
          <div className="space-y-6">
            
            {/* Barra de Letras A-Z para Navegação no Acervo de Filmes */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
                  <Compass size={14} /> Explorar Acervo Completo de Filmes (+45.000):
                </span>
                <span>{displayedMovies.length} filmes listados</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {ALPHABET.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSelectedMovieLetter(letter)}
                    data-tv-focus="true"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedMovieLetter === letter
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Barra de Áudio */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mr-2">
                  <Volume2 size={15} className="text-indigo-400" /> Preferência de Áudio:
                </span>
                <button
                  onClick={() => setVodAudioFilter('todos')}
                  data-tv-focus="true"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    vodAudioFilter === 'todos'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setVodAudioFilter('dublado')}
                  data-tv-focus="true"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    vodAudioFilter === 'dublado'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  🔊 Somente Dublados
                </button>
                <button
                  onClick={() => setVodAudioFilter('legendado')}
                  data-tv-focus="true"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    vodAudioFilter === 'legendado'
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  💬 Somente Legendados
                </button>
              </div>

              <div className="text-xs text-zinc-400">
                {displayedMovies.length} títulos encontrados
              </div>
            </div>

            {/* Grade de Filmes */}
            {loadingDynamicMovies ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400 bg-zinc-900/30 rounded-3xl border border-white/5">
                <Loader2 size={36} className="animate-spin text-indigo-500 mb-3" />
                <span className="text-sm font-semibold">Carregando acervo de filmes da letra {selectedMovieLetter}...</span>
              </div>
            ) : displayedMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayedMovies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isFavorite={favorites.includes(movie.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(m, audio) => handleSelectItem(m, audio)}
                    preferredAudio={preferredAudio}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
                <Film size={40} className="mx-auto text-zinc-500 mb-3" />
                <h3 className="text-white font-bold text-base mb-1">Nenhum filme encontrado</h3>
                <p className="text-zinc-400 text-xs mb-4">Tente navegar por outra letra ou explorar em outras abas.</p>
                {searchQuery && (
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      onClick={() => setActiveTab('canais')}
                      data-tv-focus="true"
                      className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Tv size={14} className="text-indigo-400" />
                      <span>Buscar "{searchQuery}" em Canais</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('series')}
                      data-tv-focus="true"
                      className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Clapperboard size={14} className="text-purple-400" />
                      <span>Buscar "{searchQuery}" em Séries</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---------------- ABA: SÉRIES (+7.000 TÍTULOS COM A-Z DIÁRIO) ---------------- */}
        {activeTab === 'series' && (
          <div className="space-y-6">
            
            {/* Barra de Letras A-Z para Navegação no Acervo de 7.000 Séries */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                  <Compass size={14} /> Explorar Catálogo Completo (Atualizado Diariamente):
                </span>
                <span>{displayedSeries.length} séries listadas</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {ALPHABET.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSelectedSeriesLetter(letter)}
                    data-tv-focus="true"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedSeriesLetter === letter
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade de Séries */}
            {loadingDynamicSeries ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400 bg-zinc-900/30 rounded-3xl border border-white/5">
                <Loader2 size={36} className="animate-spin text-purple-500 mb-3" />
                <span className="text-sm font-semibold">Carregando séries da letra {selectedSeriesLetter} da nuvem...</span>
              </div>
            ) : displayedSeries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayedSeries.map(s => (
                  <SeriesCard
                    key={s.id}
                    series={s}
                    isFavorite={favorites.includes(s.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(item) => handleSelectSeries(item)}
                    preferredAudio={preferredAudio}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
                <Clapperboard size={40} className="mx-auto text-zinc-500 mb-3" />
                <h3 className="text-white font-bold text-base mb-1">Nenhuma série encontrada</h3>
                <p className="text-zinc-400 text-xs mb-4">Tente navegar por outra letra ou explorar em outras abas.</p>
                {searchQuery && (
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      onClick={() => setActiveTab('canais')}
                      data-tv-focus="true"
                      className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Tv size={14} className="text-indigo-400" />
                      <span>Buscar "{searchQuery}" em Canais</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('filmes')}
                      data-tv-focus="true"
                      className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Film size={14} className="text-indigo-400" />
                      <span>Buscar "{searchQuery}" em Filmes</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---------------- ABA: ANIMES (+18 GRANDES SUCESSOS & CANAIS 24H) ---------------- */}
        {activeTab === 'animes' && (
          <div className="space-y-6">
            
            {/* Banner Hero Animes */}
            <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-rose-950/70 via-purple-950/50 to-zinc-900 border border-rose-500/30 overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-3">
                  <Sparkles size={14} className="text-rose-400" />
                  <span>⛩️ Acervo de Animes VIP & Sucessos Japoneses</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
                  Universo <span className="text-rose-400">Otaku & Animes</span>
                </h2>
                <p className="text-zinc-300 text-xs md:text-sm leading-relaxed mb-4">
                  Grandes lançamentos e animes lendários com todas as temporadas, episódios completos dublados e legendados em Full HD, além de canais 24h dedicados.
                </p>

                {/* Filtros de Gênero de Anime */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['Todos', 'Shounen', 'Ação', 'Aventura', 'Sobrenatural', 'Fantasia', 'Clássicos'].map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedAnimeGenre(genre)}
                      data-tv-focus="true"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                        selectedAnimeGenre === genre
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                          : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canais de Anime 24h ao Vivo */}
            {liveAnimeChannels.length > 0 && !searchQuery && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
                    <Tv size={16} className="text-rose-400" />
                    Canais de Anime 24h Ao Vivo
                  </h3>
                  <span className="text-xs text-zinc-400">{liveAnimeChannels.length} canais transmitindo</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {liveAnimeChannels.map(ch => (
                    <ChannelCard
                      key={ch.id}
                      channel={ch}
                      channelNumber={channels.findIndex(c => c.id === ch.id) + 1}
                      isFavorite={favorites.includes(ch.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelect={(c) => handleSelectItem(c)}
                      isActive={activeItem?.id === ch.id}
                      onOpenEpg={(c) => setSelectedChannelForEpg(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cabeçalho da Grade de Animes */}
            <div className="flex items-center justify-between pt-2">
              <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
                <Clapperboard className="text-rose-400" size={20} />
                {selectedAnimeGenre === 'Todos' ? 'Séries de Animes Populares' : `Animes de ${selectedAnimeGenre}`}
              </h3>
              <span className="text-xs text-zinc-400">{displayedAnimes.length} títulos disponíveis</span>
            </div>

            {/* Grade de Séries de Anime */}
            {displayedAnimes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayedAnimes.map(s => (
                  <SeriesCard
                    key={s.id}
                    series={s}
                    isFavorite={favorites.includes(s.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(item) => handleSelectSeries(item)}
                    preferredAudio={preferredAudio}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
                <Sparkles size={40} className="mx-auto text-zinc-500 mb-3" />
                <h3 className="text-white font-bold text-base mb-1">Nenhum anime encontrado</h3>
                <p className="text-zinc-400 text-xs">Tente ajustar a busca ou o gênero selecionado.</p>
              </div>
            )}
          </div>
        )}

        {/* ---------------- ABA: FAVORITOS ---------------- */}
        {activeTab === 'favoritos' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-white font-extrabold text-xl flex items-center gap-2 mb-4">
                <Star className="text-amber-400" size={22} fill="currentColor" /> Meus Favoritos
              </h2>

              {favorites.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
                  <Star size={44} className="mx-auto text-zinc-600 mb-3" />
                  <h3 className="text-white font-bold text-base mb-1">Sua lista está vazia</h3>
                  <p className="text-zinc-400 text-xs">Clique na estrela de qualquer canal, filme ou série para salvar aqui.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {favoriteChannels.length > 0 && (
                    <div>
                      <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Canais Favoritos:</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                        {favoriteChannels.map(ch => (
                          <ChannelCard
                            key={ch.id}
                            channel={ch}
                            channelNumber={channels.findIndex(c => c.id === ch.id) + 1}
                            isFavorite={true}
                            onToggleFavorite={handleToggleFavorite}
                            onSelect={(c) => handleSelectItem(c)}
                            isActive={activeItem?.id === ch.id}
                            onOpenEpg={(c) => setSelectedChannelForEpg(c)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {favoriteSeries.length > 0 && (
                    <div>
                      <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Séries Favoritas:</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {favoriteSeries.map(s => (
                          <SeriesCard
                            key={s.id}
                            series={s}
                            isFavorite={true}
                            onToggleFavorite={handleToggleFavorite}
                            onSelect={(item) => handleSelectSeries(item)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {favoriteMovies.length > 0 && (
                    <div>
                      <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Filmes Favoritos:</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {favoriteMovies.map(m => (
                          <MovieCard
                            key={m.id}
                            movie={m}
                            isFavorite={true}
                            onToggleFavorite={handleToggleFavorite}
                            onSelect={(movie, audio) => handleSelectItem(movie, audio)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Modal de Episódios da Série */}
      <ErrorBoundary onReset={() => setSelectedSeriesForEpisodes(null)}>
        <EpisodeModal
          series={selectedSeriesForEpisodes}
          isOpen={!!selectedSeriesForEpisodes}
          onClose={() => setSelectedSeriesForEpisodes(null)}
          onPlayEpisode={(epItem, audio) => handleSelectItem(epItem, audio)}
        />
      </ErrorBoundary>

      {/* Modal de Grade EPG Completa de 24 Horas */}
      <ErrorBoundary onReset={() => setSelectedChannelForEpg(null)}>
        <EpgModal
          channel={selectedChannelForEpg}
          isOpen={!!selectedChannelForEpg}
          onClose={() => setSelectedChannelForEpg(null)}
          onPlayChannel={(ch) => handleSelectItem(ch)}
        />
      </ErrorBoundary>

      {/* Grade EPG Multicanal em Linha do Tempo (Estilo TV a Cabo 24h) */}
      <ErrorBoundary onReset={() => setIsEpgGridOpen(false)}>
        <EpgTimelineGrid
          isOpen={isEpgGridOpen}
          onClose={() => setIsEpgGridOpen(false)}
          channels={channels}
          onSelectChannel={(ch) => handleSelectItem(ch)}
          currentChannelId={activeItem?.id}
        />
      </ErrorBoundary>

      {/* Modal de Configurações */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        channels={channels}
        onChannelsUpdated={() => setChannels(CatalogService.getChannels())}
        userState={userState}
        onUserStateChange={handleSelectState}
        onOpenHealthModal={() => {
          setIsSettingsOpen(false);
          setIsHealthModalOpen(true);
        }}
      />

      {/* Modal de Diagnóstico e Saúde dos Canais (Quick Verification) */}
      <ChannelHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        channels={channels}
        onSelectChannel={(ch) => handleSelectItem(ch)}
      />

      {/* Modal de Guia de Instalação no BTV e Smart TV Box */}
      <InstallTvModal
        isOpen={isInstallTvOpen}
        onClose={() => setIsInstallTvOpen(false)}
        isTvMode={isTvMode}
        onToggleTvMode={() => setIsTvMode(!isTvMode)}
      />

      {/* Rodapé */}
      <footer className="border-t border-white/5 py-8 text-center text-zinc-500 text-xs mt-12">
        <p className="font-semibold text-zinc-400 mb-1">Lango's TV — Entretenimento Digital Livre</p>
        <p>Canais ao vivo, Filmes e Séries atualizados dinamicamente via CDN Edge.</p>
      </footer>

    </div>
  );
}
