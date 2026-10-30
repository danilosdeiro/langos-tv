import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ChannelCard from './components/ChannelCard';
import MovieCard from './components/MovieCard';
import SeriesCard from './components/SeriesCard';
import EpisodeModal from './components/EpisodeModal';
import SettingsModal from './components/SettingsModal';
import { CatalogService } from './services/catalogService';
import { VodService } from './services/vodService';
import { 
  Tv, Film, Clapperboard, Star, Sparkles, Filter, 
  Volume2, Play, AlertCircle, Compass, Loader2 
} from 'lucide-react';

const ALPHABET = ['Destaques', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export default function App() {
  const [activeTab, setActiveTab] = useState('canais'); // 'canais', 'filmes', 'series', 'favoritos'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelCategory, setSelectedChannelCategory] = useState('Todos');
  const [selectedVodGenre, setSelectedVodGenre] = useState('Todos');
  const [vodAudioFilter, setVodAudioFilter] = useState('todos'); // 'todos', 'dublado', 'legendado'
  const [preferredAudio, setPreferredAudio] = useState('dublado'); // para reprodução

  // Conteúdos base
  const [channels, setChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Estado para Séries Dinâmicas (A-Z com +10.000 títulos atualizados diariamente)
  const [selectedSeriesLetter, setSelectedSeriesLetter] = useState('A');
  const [dynamicSeries, setDynamicSeries] = useState([]);
  const [loadingDynamicSeries, setLoadingDynamicSeries] = useState(false);

  // Modal de Episódios
  const [selectedSeriesForEpisodes, setSelectedSeriesForEpisodes] = useState(null);

  // Estado do Player
  const [activeItem, setActiveItem] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const playerSectionRef = useRef(null);

  // Inicialização
  useEffect(() => {
    setChannels(CatalogService.getChannels());
    setMovies(CatalogService.getMovies());
    setFavorites(CatalogService.getFavorites());

    // Carregar séries consagradas dinâmicas (com todas as temporadas e episódios da nuvem)
    VodService.fetchFeaturedSeries()
      .then(featured => setFeaturedSeries(featured))
      .catch(err => {
        console.warn('Erro ao carregar destaques de séries:', err);
        setFeaturedSeries(CatalogService.getSeries());
      });
  }, []);

  // Carregar séries da nuvem quando selecionar letra do alfabeto
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

  // Se o usuário buscar na aba de séries, mudar automaticamente para a letra inicial correspondente
  useEffect(() => {
    if (activeTab === 'series' && searchQuery.trim().length > 0) {
      const firstChar = searchQuery.trim()[0].toUpperCase();
      if (/^[A-Z]$/.test(firstChar) && selectedSeriesLetter !== firstChar) {
        setSelectedSeriesLetter(firstChar);
      }
    }
  }, [searchQuery, activeTab, selectedSeriesLetter]);

  // Alternar favorito
  const handleToggleFavorite = (id) => {
    const updated = CatalogService.toggleFavorite(id);
    setFavorites(updated);
  };

  // Selecionar canal ou filme para assistir
  const handleSelectItem = (item, audio = 'dublado') => {
    setActiveItem(item);
    setPreferredAudio(audio);
    setTimeout(() => {
      playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Clicar em uma série (abre o seletor de episódios)
  const handleSelectSeries = (seriesItem) => {
    setSelectedSeriesForEpisodes(seriesItem);
  };

  // Categorias únicas de canais
  const channelCategories = useMemo(() => {
    const cats = new Set(['Todos']);
    channels.forEach(c => {
      if (c.categoria) cats.add(c.categoria);
    });
    return Array.from(cats);
  }, [channels]);

  // Canais filtrados
  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchesSearch = searchQuery === '' || 
        c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.categoria.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedChannelCategory === 'Todos' || c.categoria === selectedChannelCategory;
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, selectedChannelCategory]);

  // Filmes filtrados
  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      const matchesSearch = searchQuery === '' || 
        m.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.categoria.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = selectedVodGenre === 'Todos' || m.categoria.includes(selectedVodGenre);
      
      const matchesAudio = 
        vodAudioFilter === 'todos' ||
        (vodAudioFilter === 'dublado' && m.dublado && m.dublado.length > 0) ||
        (vodAudioFilter === 'legendado' && m.legendado && m.legendado.length > 0);

      return matchesSearch && matchesGenre && matchesAudio;
    });
  }, [movies, searchQuery, selectedVodGenre, vodAudioFilter]);

  // Séries a exibir (Destaques ou Dinâmicas da letra)
  const displayedSeries = useMemo(() => {
    const list = selectedSeriesLetter === 'Destaques' ? featuredSeries : dynamicSeries;

    return list.filter(s => {
      const matchesSearch = searchQuery === '' || 
        s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.categoria && s.categoria.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAudio = 
        vodAudioFilter === 'todos' ||
        s.isDynamic || // Séries dinâmicas contêm tanto dublado quanto legendado
        (vodAudioFilter === 'dublado' && s.dublado && s.dublado.length > 0) ||
        (vodAudioFilter === 'legendado' && s.legendado && s.legendado.length > 0);

      return matchesSearch && matchesAudio;
    });
  }, [selectedSeriesLetter, featuredSeries, dynamicSeries, searchQuery, vodAudioFilter]);

  // Itens favoritos
  const favoriteChannels = useMemo(() => {
    return channels.filter(c => favorites.includes(c.id));
  }, [channels, favorites]);

  const favoriteMovies = useMemo(() => {
    return movies.filter(m => favorites.includes(m.id));
  }, [movies, favorites]);

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
      />

      {/* Área Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-8">

        {/* Player de Vídeo em Destaque */}
        {activeItem && (
          <section ref={playerSectionRef} className="animate-fadeIn">
            <div className="bg-zinc-900/40 p-2 md:p-3 rounded-3xl border border-white/10 shadow-2xl">
              <VideoPlayer
                item={activeItem}
                audioVersion={preferredAudio}
                onAudioVersionChange={setPreferredAudio}
                onClose={() => setActiveItem(null)}
              />
            </div>
          </section>
        )}

        {/* Banner Hero */}
        {!activeItem && !searchQuery && activeTab === 'canais' && (
          <div className="relative rounded-3xl p-6 md:p-10 bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-zinc-900 border border-indigo-500/20 overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-4">
                <Sparkles size={14} /> Mais de 350 Canais com Grade EPG & 7.000 Séries
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                Bem-vindo ao <span className="text-indigo-400">Lango's TV</span>
              </h1>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6 font-normal">
                Assista a canais ao vivo com grade de programação em tempo real, além de um acervo com milhares de séries e filmes dublados e legendados atualizados diariamente.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const firstOpen = channels.find(c => c.categoria === 'TV Aberta') || channels[0];
                    if (firstOpen) handleSelectItem(firstOpen);
                  }}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition hover:scale-105"
                >
                  <Play size={16} fill="currentColor" /> Assistir TV Aberta
                </button>
                <button
                  onClick={() => setActiveTab('series')}
                  className="px-5 py-3 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition border border-white/10"
                >
                  <Clapperboard size={16} /> Ver Catálogo de Séries (+7.000)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- ABA: CANAIS AO VIVO COM EPG ---------------- */}
        {activeTab === 'canais' && (
          <div className="space-y-6">
            
            {/* Filtro de Categorias */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                <Filter size={13} /> Categorias:
              </span>
              {channelCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedChannelCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedChannelCategory === cat
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

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
                    isFavorite={favorites.includes(channel.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(ch) => handleSelectItem(ch)}
                    isActive={activeItem?.id === channel.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
                <AlertCircle size={40} className="mx-auto text-zinc-500 mb-3" />
                <h3 className="text-white font-bold text-base mb-1">Nenhum canal encontrado</h3>
                <p className="text-zinc-400 text-xs">Tente ajustar a busca ou a categoria selecionada.</p>
              </div>
            )}
          </div>
        )}

        {/* ---------------- ABA: FILMES ---------------- */}
        {activeTab === 'filmes' && (
          <div className="space-y-6">
            
            {/* Barra de Áudio */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mr-2">
                  <Volume2 size={15} className="text-indigo-400" /> Preferência de Áudio:
                </span>
                <button
                  onClick={() => setVodAudioFilter('todos')}
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
                {filteredMovies.length} títulos encontrados
              </div>
            </div>

            {/* Grade de Filmes */}
            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredMovies.map(movie => (
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
              </div>
            )}
          </div>
        )}

        {/* ---------------- ABA: MEUS FAVORITOS ---------------- */}
        {activeTab === 'favoritos' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-white font-extrabold text-2xl flex items-center gap-2">
                <Star className="text-amber-400 fill-amber-400" size={24} /> Meus Favoritos
              </h2>
              <p className="text-zinc-400 text-xs mt-1">
                Acesse rapidamente os seus canais, filmes e séries marcados com estrela
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-white/5 p-8">
                <Star size={48} className="mx-auto text-zinc-600 mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Sua lista de favoritos está vazia</h3>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6">
                  Clique na estrela dos cards para salvá-los aqui.
                </p>
                <button
                  onClick={() => setActiveTab('canais')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
                >
                  Explorar Canais
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {favoriteChannels.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-zinc-300 font-bold text-base flex items-center gap-2">
                      <Tv size={18} className="text-indigo-400" /> Canais Salvos ({favoriteChannels.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                      {favoriteChannels.map(ch => (
                        <ChannelCard
                          key={ch.id}
                          channel={ch}
                          isFavorite={true}
                          onToggleFavorite={handleToggleFavorite}
                          onSelect={(c) => handleSelectItem(c)}
                          isActive={activeItem?.id === ch.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteMovies.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-zinc-300 font-bold text-base flex items-center gap-2">
                      <Film size={18} className="text-indigo-400" /> Filmes Salvos ({favoriteMovies.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {favoriteMovies.map(m => (
                        <MovieCard
                          key={m.id}
                          movie={m}
                          isFavorite={true}
                          onToggleFavorite={handleToggleFavorite}
                          onSelect={(item, audio) => handleSelectItem(item, audio)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteSeries.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-zinc-300 font-bold text-base flex items-center gap-2">
                      <Clapperboard size={18} className="text-purple-400" /> Séries Salvas ({favoriteSeries.length})
                    </h3>
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
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modal de Seleção de Episódios e Temporadas */}
      <EpisodeModal
        series={selectedSeriesForEpisodes}
        isOpen={!!selectedSeriesForEpisodes}
        onClose={() => setSelectedSeriesForEpisodes(null)}
        onPlayEpisode={(epItem, audio) => handleSelectItem(epItem, audio)}
      />

      {/* Modal de Configurações */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        channels={channels}
        onChannelsUpdated={(updated) => setChannels(updated)}
      />

      <footer className="border-t border-white/5 bg-zinc-950/80 px-4 py-6 text-center text-xs text-zinc-500 mt-12">
        <p className="font-semibold text-zinc-400">
          Lango's TV — Criado para você nunca ficar dependente de serviços pagos.
        </p>
        <p className="mt-1 text-[11px] text-zinc-600">
          Grade EPG ao vivo • Mais de 7.000 Séries Atualizadas Diariamente • PWA Multiplataforma
        </p>
      </footer>

    </div>
  );
}
