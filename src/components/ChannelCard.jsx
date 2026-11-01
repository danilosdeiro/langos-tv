import React, { useMemo, useState } from 'react';
import { Star, Play, Layers, Clock } from 'lucide-react';
import { EpgService } from '../services/epgService';

export default function ChannelCard({ 
  channel, 
  channelNumber,
  onSelect, 
  isFavorite = false, 
  onToggleFavorite,
  isActive = false,
  onOpenEpg
}) {
  const [logoError, setLogoError] = useState(false);

  // Obter grade de programação EPG em tempo real
  const epg = useMemo(() => {
    return EpgService.getProgramForChannel(channel.nome, channel.categoria);
  }, [channel.nome, channel.categoria]);

  return (
    <div
      onClick={() => onSelect(channel)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.code === 'Space' || e.keyCode === 13) {
          e.preventDefault();
          onSelect(channel);
        }
      }}
      data-tv-card="true"
      data-tv-focus="true"
      tabIndex={0}
      role="button"
      aria-label={`Canal ${channelNumber ? `${channelNumber} ` : ''}${channel.nome}`}
      className={`group relative bg-zinc-900/70 hover:bg-zinc-850 border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-md hover:shadow-indigo-500/10 hover:-translate-y-1 focus:outline-none ${
        isActive 
          ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/30' 
          : 'border-white/5 hover:border-white/20'
      }`}
    >
      {/* Topo do Card: Número do Canal, Categoria & Botão Favorito */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 truncate">
          {channelNumber && (
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 shrink-0">
              #{channelNumber}
            </span>
          )}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5 truncate max-w-[95px]">
            {channel.categoria || 'Geral'}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          className={`p-1.5 rounded-lg transition-transform active:scale-90 ${
            isFavorite 
              ? 'text-amber-400 hover:text-amber-300' 
              : 'text-zinc-600 hover:text-zinc-300 opacity-60 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
        >
          <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Centro do Card: Logo do Canal */}
      <div className="h-16 w-full flex items-center justify-center my-1.5 p-1 relative">
        {channel.logo && !logoError ? (
          <img
            src={channel.logo}
            alt={channel.nome}
            loading="lazy"
            className="max-h-full max-w-full object-contain filter drop-shadow transition-transform group-hover:scale-105"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-base uppercase border border-white/10 shadow-inner">
            {channel.nome.slice(0, 2)}
          </div>
        )}

        {/* Botão Flutuante de Play no Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs rounded-xl">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </div>
        </div>
      </div>

      {/* Nome e Fontes */}
      <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between">
        <h3 className="text-white font-bold text-xs truncate max-w-[130px] group-hover:text-indigo-300 transition-colors">
          {channel.nome}
        </h3>
        <span 
          className="text-[10px] bg-zinc-800 text-zinc-300 font-semibold px-1.5 py-0.5 rounded-md border border-white/5 flex items-center gap-1 shrink-0"
          title={`${channel.fontes?.length || 1} fontes de transmissão disponíveis`}
        >
          <Layers size={10} className="text-indigo-400" /> {channel.fontes?.length || 1} {channel.fontes?.length === 1 ? 'fonte' : 'fontes'}
        </span>
      </div>

      {/* Grade de Programação EPG em Tempo Real */}
      <div 
        onClick={(e) => {
          if (onOpenEpg) {
            e.stopPropagation();
            onOpenEpg(channel);
          }
        }}
        className="mt-2 pt-2 border-t border-white/5 space-y-1 hover:bg-zinc-800/40 p-1 rounded-lg transition"
        title="Clique para ver a grade completa de 24 horas"
      >
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-indigo-400 font-semibold truncate max-w-[120px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            {epg.title}
          </span>
          <span className="text-zinc-500 font-mono text-[9px]">{epg.start}</span>
        </div>

        {/* Barra de Progresso do Programa */}
        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
            style={{ width: `${epg.progress}%` }}
          ></div>
        </div>

        {/* A Seguir */}
        {epg.nextTitle && (
          <p className="text-[9px] text-zinc-500 truncate">
            A seguir: <span className="text-zinc-400">{epg.nextTitle}</span>
          </p>
        )}
      </div>

    </div>
  );
}
