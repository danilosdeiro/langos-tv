import React, { useState } from 'react';
import { Play, Star, Clapperboard, Layers } from 'lucide-react';

export default function SeriesCard({ 
  series, 
  onSelect, 
  isFavorite = false, 
  onToggleFavorite,
  preferredAudio = 'dublado'
}) {
  const [imgError, setImgError] = useState(false);
  const hasDub = series.dublado && series.dublado.length > 0;
  const hasLeg = series.legendado && series.legendado.length > 0;

  return (
    <div
      onClick={() => onSelect(series, preferredAudio)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.code === 'Space' || e.keyCode === 13) {
          e.preventDefault();
          onSelect(series, preferredAudio);
        }
      }}
      data-tv-card="true"
      data-tv-focus="true"
      tabIndex={0}
      role="button"
      aria-label={`Série ${series.titulo}`}
      className="group relative bg-zinc-900/60 hover:bg-zinc-850 border border-white/5 hover:border-purple-500/40 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-lg hover:shadow-purple-500/15 hover:-translate-y-1.5 focus:outline-none"
    >
      {/* Poster Oficial */}
      <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden">
        {series.capa && !imgError ? (
          <img
            src={series.capa}
            alt={series.titulo}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-400 p-4 text-center border-b border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2 shadow-inner">
              <Clapperboard size={24} />
            </div>
            <span className="text-xs font-bold text-white line-clamp-2">{series.titulo}</span>
            <span className="text-[10px] text-zinc-400 mt-1">{series.categoria || series.ano}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/60 pointer-events-none"></div>

        {/* Botão Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(series.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-xl backdrop-blur-md transition ${
            isFavorite 
              ? 'bg-amber-500/90 text-black shadow-lg shadow-amber-500/30' 
              : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/70'
          }`}
          title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
        >
          <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Badges Dublado / Legendado */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDub && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-black shadow-md backdrop-blur-md">
              Dublado
            </span>
          )}
          {hasLeg && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-sky-500/90 text-white shadow-md backdrop-blur-md">
              Legendado
            </span>
          )}
        </div>

        {/* Play Icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
          <div className="w-13 h-13 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl shadow-purple-600/60 transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={22} fill="currentColor" className="ml-1" />
          </div>
        </div>

        {/* Temporadas & Ano */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[11px] text-zinc-300 font-medium drop-shadow-md">
          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            {series.ano}
          </span>
          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
            <Layers size={11} /> {series.temporadas ? `${series.temporadas} ${series.temporadas === 1 ? 'temporada' : 'temporadas'}` : (series.totalEps ? `${series.totalEps} eps` : 'Série')}
          </span>
        </div>
      </div>

      {/* Detalhes */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            {series.categoria}
          </span>
          <h3 className="text-white font-bold text-sm line-clamp-1 group-hover:text-purple-300 transition-colors mt-0.5">
            {series.titulo}
          </h3>
          {series.sinopse && (
            <p className="text-zinc-400 text-xs line-clamp-2 mt-1.5 leading-relaxed font-normal">
              {series.sinopse}
            </p>
          )}
        </div>

        {/* Ações */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(series, 'dublado');
            }}
            disabled={!hasDub}
            className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
              hasDub 
                ? 'bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white' 
                : 'opacity-30 cursor-not-allowed bg-zinc-900 text-zinc-600'
            }`}
          >
            🔊 Dub
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(series, 'legendado');
            }}
            disabled={!hasLeg}
            className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
              hasLeg 
                ? 'bg-zinc-800 hover:bg-sky-600 text-zinc-300 hover:text-white' 
                : 'opacity-30 cursor-not-allowed bg-zinc-900 text-zinc-600'
            }`}
          >
            💬 Leg
          </button>
        </div>
      </div>
    </div>
  );
}
