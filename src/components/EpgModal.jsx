import React, { useMemo } from 'react';
import { X, Tv, Clock, Play, Radio, Calendar } from 'lucide-react';
import { EpgService } from '../services/epgService';
import { TvNavigation } from '../services/tvNavigation';

export default function EpgModal({ channel, isOpen, onClose, onPlayChannel }) {
  React.useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => TvNavigation.focusFirstAvailable(), 100);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 8 || e.keyCode === 4) {
        e.preventDefault();
        onClose();
        if (TvNavigation.lastFocusedCard) {
          setTimeout(() => TvNavigation.setFocus(TvNavigation.lastFocusedCard), 50);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !channel) return null;

  const schedule = useMemo(() => {
    return EpgService.getFullScheduleForChannel(channel.nome, channel.categoria);
  }, [channel.nome, channel.categoria]);

  const currentShow = schedule.find(s => s.isCurrent);

  return (
    <div 
      data-tv-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        
        {/* Cabeçalho do Modal */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10 p-2 flex items-center justify-center shadow-md">
              {channel.logo ? (
                <img 
                  src={channel.logo} 
                  alt={channel.nome} 
                  className="w-full h-full object-contain" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <Tv size={22} className="text-indigo-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-extrabold text-base md:text-lg line-clamp-1">{channel.nome}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {channel.categoria || 'Ao Vivo'}
                </span>
              </div>
              <p className="text-zinc-400 text-xs flex items-center gap-1.5 mt-0.5">
                <Calendar size={12} className="text-zinc-400" />
                Grade de Programação 24 Horas
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onPlayChannel && (
              <button
                onClick={() => {
                  onPlayChannel(channel);
                  onClose();
                }}
                data-tv-focus="true"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md"
              >
                <Play size={13} fill="currentColor" />
                Assistir
              </button>
            )}
            <button
              onClick={onClose}
              data-tv-focus="true"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Destaque do Programa Atual */}
        {currentShow && (
          <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/40 p-4 border-b border-indigo-500/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Passando Agora
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300">
                {currentShow.start} — {currentShow.end}
              </span>
            </div>
            <h3 className="text-white font-bold text-sm md:text-base line-clamp-1">
              {currentShow.title}
            </h3>
            {/* Barra de Progresso do Programa Atual */}
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentShow.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Lista Completa de Horários */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-3 px-1">
            Programação do Dia:
          </span>

          <div className="space-y-1.5">
            {schedule.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl flex items-center justify-between border transition ${
                    item.isCurrent
                      ? 'bg-indigo-600/15 border-indigo-500/40 shadow-sm'
                      : item.isPast
                        ? 'bg-zinc-900/40 border-white/5 opacity-50'
                        : 'bg-zinc-800/40 border-white/5 hover:bg-zinc-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-[70px] text-left">
                      <span className={`font-mono text-xs font-bold block ${
                        item.isCurrent ? 'text-indigo-400' : 'text-zinc-400'
                      }`}>
                        {item.start}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        até {item.end}
                      </span>
                    </div>

                    <div>
                      <h4 className={`text-xs md:text-sm font-semibold line-clamp-1 ${
                        item.isCurrent ? 'text-white font-bold' : item.isPast ? 'text-zinc-400' : 'text-zinc-200'
                      }`}>
                        {item.title}
                      </h4>
                      {item.isCurrent && (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          No ar • {item.progress}% decorrido
                        </span>
                      )}
                    </div>
                  </div>

                  {item.isCurrent && (
                    <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-600 text-white shadow-sm shrink-0">
                      NO AR
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
