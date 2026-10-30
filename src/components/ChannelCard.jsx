import React from 'react';
import { Star, Play, Layers } from 'lucide-react';

export default function ChannelCard({ 
  channel, 
  onSelect, 
  isFavorite = false, 
  onToggleFavorite,
  isActive = false 
}) {
  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative bg-zinc-900/60 hover:bg-zinc-850 border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-md hover:shadow-indigo-500/10 hover:-translate-y-1 ${
        isActive 
          ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/30' 
          : 'border-white/5 hover:border-white/20'
      }`}
    >
      {/* Topo do Card: Badge de Categoria & Botão Favorito */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5 truncate max-w-[130px]">
          {channel.categoria || 'Geral'}
        </span>

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
          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Centro do Card: Logo do Canal ou Ícone */}
      <div className="h-20 w-full flex items-center justify-center my-2 p-2 relative">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.nome}
            loading="lazy"
            className="max-h-full max-w-full object-contain filter drop-shadow transition-transform group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-14 h-14 rounded-2xl bg-zinc-800 text-zinc-400 items-center justify-center font-bold text-xl uppercase border border-white/10"
          style={{ display: channel.logo ? 'none' : 'flex' }}
        >
          {channel.nome.slice(0, 2)}
        </div>

        {/* Botão Flutuante de Play no Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs rounded-xl">
          <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={18} fill="currentColor" className="ml-0.5" />
          </div>
        </div>
      </div>

      {/* Rodapé do Card: Nome e Quantidade de Fontes */}
      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm truncate max-w-[140px] group-hover:text-indigo-300 transition-colors">
          {channel.nome}
        </h3>
        <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 shrink-0">
          <Layers size={11} /> {channel.fontes?.length || 1} {channel.fontes?.length === 1 ? 'fonte' : 'fontes'}
        </span>
      </div>
    </div>
  );
}
