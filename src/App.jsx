import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ChannelCard from './components/ChannelCard';
import MovieCard from './components/MovieCard';
import SeriesCard from './components/SeriesCard';
import SettingsModal from './components/SettingsModal';
import { CatalogService } from './services/catalogService';
import { 
  Tv, Film, Clapperboard, Star, Sparkles, Filter, 
  Volume2, Globe, Heart, Play, Layers, AlertCircle 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('canais'); // 'canais', 'filmes', 'series', 'favoritos'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelCategory, setSelectedChannelCategory] = useState('Todos');
  const [selectedVodGenre, setSelectedVodGenre] = useState('Todos');
  const [vodAudioFilter, setVodAudioFilter] = useState('todos'); // 'todos', 'dublado', 'legendado'
  const [preferredAudio, setPreferredAudio] = useState('dublado'); // para reprodução

  // Conteúdos
  const [channels, setChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Estado do Player
  const [activeItem, setActiveItem] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const playerSectionRef = useRef(null);

  // Inicialização
  useEffect(() => {
    setChannels(CatalogService.getChannels());
    setMovies(CatalogService.getMovies());
    setSeries(CatalogService.getSeries());
    setFavorites(CatalogService.getFavorites());
  }, []);

  // Alternar favorito
  const handleToggleFavorite = (id) => {
    const updated = CatalogService.toggleFavorite(id);
    setFavorites(updated);
  };

  // Selecionar item para assistir
  const handleSelectItem = (item, audio = 'dublado') => {
    setActiveItem(item);
    setPreferredAudio(audio);
    // Rolagem suave até o player
    setTimeout(() => {
      playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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

  // Séries filtradas
  const filteredSeries = useMemo(() => {
    return series.filter(s => {
      const matchesSearch = searchQuery === '' || 
        s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.categoria.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = selectedVodGenre === 'Todos' || s.categoria.includes(selectedVodGenre);

      const matchesAudio = 
        vodAudioFilter === 'todos' ||
        (vodAudioFilter === 'dublado' && s.dublado && s.dublado.length > 0) ||
        (vodAudioFilter === 'legendado' && s.legendado && s.legendado.length > 0);

      return matchesSearch && matchesGenre && matchesAudio;
    });
  }, [series, searchQuery, selectedVodGenre, vodAudioFilter]);

  // Itens favoritos
  const favoriteChannels = useMemo(() => {
    return channels.filter(c => favorites.includes(c.id));
  }, [channels, favorites]);

  const favoriteMovies = useMemo(() => {
    return movies.filter(m => favorites.includes(m.id));
  }, [movies, favorites]);

  const favoriteSeries = useMemo(() => {
    return series.filter(s => favorites.includes(s.id));
  }, [series, favorites]);

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

        {/* Player de Vídeo em Destaque (quando ativo) */}
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

        {/* Banner de Boas-Vindas Hero (quando nenhum vídeo está tocando e sem busca) */}
        {!activeItem && !searchQuery && activeTab === 'canais' && (
          <div className="relative rounded-3xl p-6 md:p-10 bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-zinc-900 border border-indigo-500/20 overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-4">
                <Sparkles size={14} /> Totalmente Livre & Ilimitado
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                Bem-vindo ao <span className="text-indigo-400">Lango's TV</span>
              </h1>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6 font-normal">
                Assista a mais de 350 canais abertos e fechados, além de filmes e séries dublados e legendados direto no navegador. Sem assinaturas, sem cobranças e com sistema inteligente de backup.
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
                  onClick={() => setActiveTab('filmes')}
                  className="px-5 py-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition border border-white/10"
                >
                  <Film size={16} /> Ver Catálogo de Filmes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- ABA: CANAIS AO VIVO ---------------- */}
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

            {/* Cabeçalho da Seção */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-extrabold text-xl flex items-center gap-2">
                  <Tv className="text-indigo-400" size={22} />
                  {selectedChannelCategory === 'Todos' ? 'Todos os Canais' : selectedChannelCategory}
                </h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Exibindo {filteredChannels.length} canais com múltiplas fontes
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
            
            {/* Barra de Controles de Áudio (Dublado / Legendado) */}
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
                <p className="text-zinc-400 text-xs">Tente alterar os filtros de dublagem ou termo de busca.</p>
              </div>
            )}
          </div>
        )}

        {/* ---------------- ABA: SÉRIES ---------------- */}
        {activeTab === 'series' && (
          <div className="space-y-6">
            
            {/* Barra de Áudio para Séries */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mr-2">
                  <Volume2 size={15} className="text-purple-400" /> Áudio das Séries:
                </span>
                <button
                  onClick={() => setVodAudioFilter('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    vodAudioFilter === 'todos'
                      ? 'bg-purple-600 text-white'
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
                  🔊 Somente Dubladas
                </button>
                <button
                  onClick={() => setVodAudioFilter('legendado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    vodAudioFilter === 'legendado'
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  💬 Somente Legendadas
                </button>
              </div>

              <div className="text-xs text-zinc-400">
                {filteredSeries.length} séries disponíveis
              </div>
            </div>

            {/* Grade de Séries */}
            {filteredSeries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredSeries.map(s => (
                  <SeriesCard
                    key={s.id}
                    series={s}
                    isFavorite={favorites.includes(s.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(item, audio) => handleSelectItem(item, audio)}
                    preferredAudio={preferredAudio}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
                <Clapperboard size={40} className="mx-auto text-zinc-500 mb-3" />
                <h3 className="text-white font-bold text-base mb-1">Nenhuma série encontrada</h3>
                <p className="text-zinc-400 text-xs">Tente alterar os termos de busca ou filtros.</p>
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
                  Clique no ícone de estrela nos cards de canais, filmes ou séries para salvá-los aqui.
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
                {/* Canais Favoritos */}
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

                {/* Filmes Favoritos */}
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

                {/* Séries Favoritas */}
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
                          onSelect={(item, audio) => handleSelectItem(item, audio)}
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

      {/* Rodapé Moderno */}
      <footer className="border-t border-white/5 bg-zinc-950/80 px-4 py-6 text-center text-xs text-zinc-500 mt-12">
        <p className="font-semibold text-zinc-400">
          Lango's TV — Criado para você nunca ficar dependente de serviços pagos.
        </p>
        <p className="mt-1 text-[11px] text-zinc-600">
          Player Web PWA com suporte a HLS, DASH, VOD Dublado/Legendado e exportação de listas M3U.
        </p>
      </footer>

      {/* Modal de Configurações */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        channels={channels}
        onChannelsUpdated={(updated) => setChannels(updated)}
      />

    </div>
  );
}
