import React, { useState, useEffect } from 'react';
import { Tv, Film, Clapperboard, Star, Settings, Search, X, DownloadCloud, MapPin, Calendar, Sparkles, Flame } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  favoritesCount = 0,
  onOpenSettings,
  onOpenInstallTv,
  isTvMode = false,
  onToggleTvMode,
  userState = 'BA',
  onOpenEpgGrid,
  isEpgGridOpen = false,
  isOnlyReleases = false,
  onToggleReleases
}) {
  const [time, setTime] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Capturar evento de instalação do PWA
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return;
      }
    }
    // Abrir o guia visual completo de instalação no BTV / TV Box / Aparelhos
    if (onOpenInstallTv) {
      onOpenInstallTv();
    }
  };

  // Relógio em tempo real estilo Smart TV
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Linha 1 no Mobile/Tablet ou Esquerda no Desktop: Logo + Busca Flexível */}
        <div className="flex items-center justify-between gap-3 w-full lg:w-auto flex-1">
          {/* Logo & Marca */}
          <div 
            onClick={() => setActiveTab('canais')} 
            data-tv-focus="true"
            tabIndex={0}
            className="flex items-center gap-2.5 cursor-pointer group rounded-xl p-1 shrink-0 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform overflow-hidden p-1">
              <img src="/icon-192.png" alt="Lango's TV" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-zinc-100 to-indigo-300 bg-clip-text text-transparent">
                  Lango's TV
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium hidden sm:block leading-none">
                Canais, Filmes & Séries
              </p>
            </div>
          </div>

          {/* Barra de Busca Global - Flexível e Responsiva */}
          <div className="relative flex-1 min-w-[160px] max-w-xs sm:max-w-sm lg:max-w-xs xl:max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              data-tv-focus="true"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar canal, filme, série..."
              className="w-full bg-zinc-900/90 text-white placeholder-zinc-500 text-xs sm:text-sm rounded-xl pl-8.5 pr-8 py-2 border border-white/10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                data-tv-focus="true"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Linha 2 no Mobile/Tablet ou Direita no Desktop: Abas de Navegação & Ações */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full lg:w-auto overflow-x-auto pb-0.5 lg:pb-0 scrollbar-none shrink-0">
          {/* Abas de Navegação Estilo Cápsula */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 bg-zinc-900/60 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('canais')}
              data-tv-focus="true"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'canais'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv size={14} />
              <span>Canais</span>
            </button>

            <button
              onClick={() => setActiveTab('filmes')}
              data-tv-focus="true"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'filmes'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film size={14} />
              <span>Filmes</span>
            </button>

            <button
              onClick={() => setActiveTab('series')}
              data-tv-focus="true"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'series'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clapperboard size={14} />
              <span>Séries</span>
            </button>

            <button
              onClick={() => setActiveTab('animes')}
              data-tv-focus="true"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'animes'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30 font-bold'
                  : 'text-zinc-400 hover:text-rose-300 hover:bg-white/5'
              }`}
            >
              <Sparkles size={14} className={activeTab === 'animes' ? 'text-white' : 'text-rose-400'} />
              <span>Animes</span>
            </button>

            <button
              onClick={() => setActiveTab('favoritos')}
              data-tv-focus="true"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                activeTab === 'favoritos'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <Star size={14} className={favoritesCount > 0 ? 'fill-amber-400 text-amber-400' : ''} />
              <span className="hidden sm:inline">Favoritos</span>
              {favoritesCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Guia de Programação EPG 24 Horas em Linha do Tempo */}
            {onOpenEpgGrid && (
              <button
                onClick={onOpenEpgGrid}
                data-tv-focus="true"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                  isEpgGridOpen
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-indigo-300 hover:bg-white/5'
                }`}
                title="Grade EPG de Programação 24 Horas em Linha do Tempo (Tecla G)"
              >
                <Calendar size={14} className="text-indigo-400" />
                <span className="hidden sm:inline">Guia TV</span>
              </button>
            )}
          </div>

          {/* Divisor Visual Sutil */}
          <div className="h-5 w-px bg-white/10 hidden sm:block shrink-0 mx-0.5"></div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botão de Lançamentos Rápidos */}
            <button
              onClick={onToggleReleases}
              data-tv-focus="true"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shrink-0 ${
                isOnlyReleases
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-400 font-black shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
              }`}
              title="Filtrar pelos lançamentos mais recentes de 2026 e 2025"
            >
              <Flame size={14} className={isOnlyReleases ? 'text-black fill-current' : 'text-amber-400'} />
              <span className="hidden md:inline">Lançamentos</span>
            </button>

            {/* Botão de Alternar Modo TV */}
            <button
              onClick={onToggleTvMode}
              data-tv-focus="true"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shrink-0 ${
                isTvMode 
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-sm' 
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border-white/10 text-zinc-300'
              }`}
              title="Alternar Modo TV 10-Foot (Otimizado para BTV e Smart TV)"
            >
              <Tv size={14} className={isTvMode ? 'text-emerald-400' : ''} />
              <span className="hidden xl:inline">{isTvMode ? 'Modo TV: ON' : 'Modo TV'}</span>
            </button>

            {/* Botão de Instalar Desktop / BTV */}
            <button
              onClick={handleInstallClick}
              data-tv-focus="true"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm flex items-center gap-1.5 transition shrink-0 active:scale-95"
              title="Instalar no BTV, PC ou Celular como Aplicativo"
            >
              <DownloadCloud size={14} />
              <span className="hidden sm:inline">Instalar</span>
              <span className="hidden xl:inline">no BTV</span>
            </button>

            {/* Botão de Região / Estado */}
            <button
              onClick={onOpenSettings}
              data-tv-focus="true"
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:border-indigo-500/50 transition flex items-center gap-1.5 shrink-0"
              title="Região dos Canais Abertos (Clique para mudar seu Estado)"
            >
              <MapPin size={13} className="text-indigo-400" />
              <span className="hidden md:inline text-zinc-400 font-medium">UF:</span>
              <span className="text-white font-extrabold">{userState === 'TODOS' ? 'BR' : userState}</span>
            </button>

            {/* Botão de Configurações */}
            <button
              onClick={onOpenSettings}
              data-tv-focus="true"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition border border-white/5 shrink-0"
              title="Configurações & Listas M3U"
            >
              <Settings size={16} />
            </button>

            {/* Relógio Desktop */}
            <div className="hidden 2xl:flex items-center font-mono text-xs font-semibold text-zinc-400 bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-white/5 shrink-0">
              {time}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
