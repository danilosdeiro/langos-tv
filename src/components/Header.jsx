import React, { useState, useEffect } from 'react';
import { Tv, Film, Clapperboard, Star, Settings, Search, X, DownloadCloud } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  favoritesCount = 0,
  onOpenSettings,
  onOpenInstallTv,
  isTvMode = false,
  onToggleTvMode
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
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Marca */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div 
            onClick={() => setActiveTab('canais')} 
            data-tv-focus="true"
            tabIndex={0}
            className="flex items-center gap-3 cursor-pointer group rounded-xl p-1 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform overflow-hidden p-1">
              <img src="/icon-192.png" alt="Lango's TV" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl md:text-2xl tracking-tight bg-gradient-to-r from-white via-zinc-100 to-indigo-300 bg-clip-text text-transparent">
                  Lango's TV
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                Canais, Filmes & Séries Livres
              </p>
            </div>
          </div>

          {/* Botão de Instalar no Mobile + Relógio */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={handleInstallClick}
              data-tv-focus="true"
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-md"
              title="Instalar no Aparelho ou BTV"
            >
              <DownloadCloud size={14} />
              <span>Instalar</span>
            </button>
            <button
              onClick={onToggleTvMode}
              data-tv-focus="true"
              className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                isTvMode 
                  ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300' 
                  : 'bg-zinc-900 border-white/5 text-zinc-400'
              }`}
              title="Modo TV"
            >
              <Tv size={14} />
            </button>
            <div className="font-mono text-xs font-semibold text-zinc-400 bg-zinc-900 px-2 py-1 rounded-lg border border-white/5">
              {time}
            </div>
          </div>
        </div>

        {/* Barra de Busca Global */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            data-tv-focus="true"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar canal, filme, série ou categoria..."
            className="w-full bg-zinc-900/90 text-white placeholder-zinc-500 text-sm rounded-xl pl-10 pr-9 py-2 border border-white/10 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              data-tv-focus="true"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Abas de Navegação & Botão Instalar Desktop */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('canais')}
            data-tv-focus="true"
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'canais'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Tv size={16} />
            <span>Canais</span>
          </button>

          <button
            onClick={() => setActiveTab('filmes')}
            data-tv-focus="true"
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'filmes'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Film size={16} />
            <span>Filmes</span>
          </button>

          <button
            onClick={() => setActiveTab('series')}
            data-tv-focus="true"
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'series'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Clapperboard size={16} />
            <span>Séries</span>
          </button>

          <button
            onClick={() => setActiveTab('favoritos')}
            data-tv-focus="true"
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'favoritos'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900'
            }`}
          >
            <Star size={16} className={favoritesCount > 0 ? 'fill-amber-400 text-amber-400' : ''} />
            <span>Favoritos</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Botão de Alternar Modo TV */}
          <button
            onClick={onToggleTvMode}
            data-tv-focus="true"
            className={`hidden md:flex px-3 py-2 rounded-xl text-xs font-bold border transition items-center gap-1.5 shrink-0 ${
              isTvMode 
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-600/10' 
                : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300'
            }`}
            title="Alternar Modo TV 10-Foot (Otimizado para BTV e Smart TV)"
          >
            <Tv size={15} className={isTvMode ? 'text-emerald-400' : ''} />
            <span>{isTvMode ? 'Modo TV: ON' : 'Modo TV'}</span>
          </button>

          {/* Botão de Instalar Desktop / BTV */}
          <button
            onClick={handleInstallClick}
            data-tv-focus="true"
            className="hidden md:flex px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 items-center gap-1.5 transition shrink-0 active:scale-95"
            title="Instalar no BTV, PC ou Celular como Aplicativo"
          >
            <DownloadCloud size={15} />
            <span>Instalar no BTV</span>
          </button>

          <button
            onClick={onOpenSettings}
            data-tv-focus="true"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition border border-white/5 shrink-0"
            title="Configurações & Listas M3U"
          >
            <Settings size={18} />
          </button>

          {/* Relógio Desktop */}
          <div className="hidden lg:flex items-center font-mono text-sm font-semibold text-zinc-300 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
            {time}
          </div>
        </div>

      </div>
    </header>
  );
}
