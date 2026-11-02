import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Sparkles, Star, ChevronLeft, ChevronRight, X, Volume2, Flame, Tv } from 'lucide-react';

export const HERO_SLIDES = [
  {
    id: 'deadpool-wolverine',
    title: 'Deadpool & Wolverine',
    badge: '🔥 LANÇAMENTO #1 NO BRASIL',
    badgeColor: 'from-amber-500 to-red-600',
    rating: '8.2',
    meta: '2024 • Ação / Comédia • 2h 08m • 4K Full HD',
    audio: 'Dublado & Legendado',
    synopsis: 'O mercenário tagarela e o lendário mutante Wolverine unem forças em uma missão insana pelo multiverso repleta de ação, caos e diversão.',
    backdrop: 'https://image.tmdb.org/t/p/w1280/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    actionType: 'movie',
    targetId: 'm-1'
  },
  {
    id: 'duna-2',
    title: 'Duna: Parte 2',
    badge: '✨ CINEMA ÉPICO • GANHADOR DE PRÊMIOS',
    badgeColor: 'from-amber-400 to-orange-600',
    rating: '8.6',
    meta: '2024 • Ficção Científica / Épico • 2h 46m • 4K Full HD',
    audio: 'Dublado & Legendado',
    synopsis: 'Paul Atreides se junta aos Fremen em busca de vingança contra os conspiradores que destruíram sua família, diante do destino de todo o universo.',
    backdrop: 'https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    actionType: 'movie',
    targetId: 'm-2'
  },
  {
    id: 'reality-ppv',
    title: 'Reality Shows PPV 24h',
    badge: '🤠 SINAIS EXCLUSIVOS • PAY-PER-VIEW',
    badgeColor: 'from-amber-500 to-yellow-500',
    rating: 'AO VIVO',
    meta: '2026 • Câmeras 24h Ao Vivo • Multi-Ângulos • Sem Cortes',
    audio: 'Áudio Direto da Casa',
    synopsis: 'Confira todas as emoções de A Fazenda e Big Brother Brasil ao vivo com sinais exclusivos de câmeras, prova do fazendeiro e festas sem intervalos.',
    backdrop: 'https://image.tmdb.org/t/p/w1280/lzMmhbDNCa3Lh84zEizTXqlmdvj.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    actionType: 'category',
    categoryTarget: 'Reality Shows'
  },
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    badge: '⛩️ O ANIME DO MOMENTO • FENÔMENO',
    badgeColor: 'from-rose-500 to-pink-600',
    rating: '8.5',
    meta: '2024 • Ação / Fantasia • 12 Episódios Dublados & Legendados',
    audio: 'Dublado em Português',
    synopsis: 'Em um mundo onde caçadores despertam poderes mágicos para combater feras mortais, o caçador mais fraco recebe uma missão que lhe permite evoluir sem limites.',
    backdrop: 'https://image.tmdb.org/t/p/w1280/xMNH87maNLt9n2bMDYeI6db5VFm.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuPxJ8HGao.jpg',
    actionType: 'tab',
    tabTarget: 'animes'
  },
  {
    id: 'gladiador-2',
    title: 'Gladiador II',
    badge: '⚔️ GRANDE LANÇAMENTO MUNDIAL',
    badgeColor: 'from-amber-600 to-red-700',
    rating: '8.0',
    meta: '2024 • Ação / Histórico • 2h 28m • 4K Full HD',
    audio: 'Dublado & Legendado',
    synopsis: 'Anos após a morte do reverenciado Maximus, Lucius é forçado a lutar no Coliseu contra tiranos que ameaçam a liberdade de Roma.',
    backdrop: 'https://image.tmdb.org/t/p/w1280/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    actionType: 'movie',
    targetId: 'm-4'
  }
];

export default function HeroBanner({ 
  onPlayMovie, 
  onSelectCategory, 
  onNavigateTab,
  movies = []
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const current = HERO_SLIDES[currentIndex];

  // Auto-rotacionar a cada 7 segundos (pausa quando o mouse está sobre o banner)
  useEffect(() => {
    if (isPaused || !isVisible) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, isVisible]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % HERO_SLIDES.length);
  };

  const handleAction = () => {
    if (current.actionType === 'movie') {
      const found = movies.find(m => m.id === current.targetId);
      if (found && onPlayMovie) {
        onPlayMovie(found);
      } else if (onNavigateTab) {
        onNavigateTab('filmes');
      }
    } else if (current.actionType === 'category') {
      if (onSelectCategory) onSelectCategory(current.categoryTarget);
    } else if (current.actionType === 'tab') {
      if (onNavigateTab) onNavigateTab(current.tabTarget);
    }
  };

  if (!isVisible) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setIsVisible(true)}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-1 bg-zinc-900/60 rounded-xl border border-white/5 transition"
        >
          <Sparkles size={12} className="text-indigo-400" />
          <span>Exibir Destaques em Alta</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative w-full h-[360px] sm:h-[400px] md:h-[430px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all"
    >
      {/* Imagem de Fundo com Fade Suave */}
      <div className="absolute inset-0 bg-zinc-950">
        <img
          key={current.id}
          src={current.backdrop}
          alt={current.title}
          className="w-full h-full object-cover object-top sm:object-center transition-all duration-1000 transform scale-100 group-hover:scale-105 filter brightness-90 animate-fadeIn"
          onError={(e) => {
            e.target.src = current.poster;
          }}
        />
      </div>

      {/* Degradês Cinematográficos de Escurecimento (Estilo Netflix / HBO Max) */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 md:via-zinc-950/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Botão de Fechar / Recolher o Banner */}
      <button
        onClick={() => setIsVisible(false)}
        data-tv-focus="true"
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white backdrop-blur-md border border-white/10 transition"
        title="Ocultar Banner de Destaques"
      >
        <X size={15} />
      </button>

      {/* Conteúdo Principal do Slide */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8 md:p-10 max-w-2xl space-y-3.5">
        
        {/* Badges e Selos de Qualidade */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Badge de Destaque */}
          <span className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r ${current.badgeColor} shadow-md`}>
            {current.badge}
          </span>

          {/* Selo IMDb / Ao Vivo */}
          <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Star size={12} fill="currentColor" className="text-amber-400" />
            <span>{current.rating}</span>
          </span>

          {/* Selo de Áudio */}
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/10 text-zinc-300 backdrop-blur-md border border-white/10 hidden sm:inline-flex items-center gap-1">
            <Volume2 size={11} />
            <span>{current.audio}</span>
          </span>
        </div>

        {/* Título Principal */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-lg">
          {current.title}
        </h2>

        {/* Metadados: Ano • Categoria • Qualidade */}
        <p className="text-xs sm:text-sm text-zinc-300 font-medium">
          {current.meta}
        </p>

        {/* Sinopse Curta e Instigante */}
        <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
          {current.synopsis}
        </p>

        {/* Botões de Ação Principais */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleAction}
            data-tv-focus="true"
            className="px-6 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-white/15 hover:scale-105 active:scale-95 transition-all"
          >
            <Play size={16} fill="currentColor" />
            <span>Assistir Agora</span>
          </button>

          <button
            onClick={handleAction}
            data-tv-focus="true"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all"
          >
            <Info size={16} />
            <span>Mais Informações</span>
          </button>
        </div>

      </div>

      {/* Controles de Navegação do Carrossel (Setas e Indicadores) */}
      <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-3 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
        <button
          onClick={handlePrev}
          data-tv-focus="true"
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
          title="Destaque anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Pontos / Barras Indicadoras */}
        <div className="flex items-center gap-1.5 px-1">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
              title={slide.title}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          data-tv-focus="true"
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
          title="Próximo destaque"
        >
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}
