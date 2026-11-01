import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Tv, Clock, Play, Calendar, Search, ChevronLeft, ChevronRight, Radio, Filter } from 'lucide-react';
import { EpgService } from '../services/epgService';

const PIXELS_PER_MINUTE = 4; // 1 hora = 240px; 30 min = 120px; 24h = 5760px
const CHANNEL_COL_WIDTH = 220; // Largura da coluna fixa de canais

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export default function EpgTimelineGrid({ isOpen, onClose, channels, onSelectChannel, currentChannelId }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchFilter, setSearchFilter] = useState('');
  const [focusedProgram, setFocusedProgram] = useState(null);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  const timelineScrollRef = useRef(null);
  const isInitialScrollDone = useRef(false);

  // Atualizar relógio em tempo real a cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTimeMinutes(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Atalhos de teclado (Esc ou G para fechar, setas para navegar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27 || e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Horários de 30 em 30 minutos para o cabeçalho (24 horas)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Categorias disponíveis
  const categories = useMemo(() => {
    const cats = ['Todos'];
    channels.forEach(ch => {
      if (ch.categoria && !cats.includes(ch.categoria)) cats.push(ch.categoria);
    });
    return cats;
  }, [channels]);

  // Filtragem de canais
  const filteredChannels = useMemo(() => {
    return channels.filter(ch => {
      const matchesCat = selectedCategory === 'Todos' || ch.categoria === selectedCategory;
      const matchesSearch = !searchFilter || ch.nome.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [channels, selectedCategory, searchFilter]);

  // Rolar automaticamente para o horário atual ao abrir
  useEffect(() => {
    if (isOpen && timelineScrollRef.current && !isInitialScrollDone.current) {
      setTimeout(() => {
        if (!timelineScrollRef.current) return;
        const targetScroll = Math.max(0, (currentTimeMinutes * PIXELS_PER_MINUTE) - 300);
        timelineScrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
        isInitialScrollDone.current = true;
      }, 150);
    }
    if (!isOpen) {
      isInitialScrollDone.current = false;
    }
  }, [isOpen, currentTimeMinutes]);

  const nowLeft = currentTimeMinutes * PIXELS_PER_MINUTE;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col animate-fadeIn select-none overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Topo do EPG: Barra de Controle Executiva */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 md:px-6 py-3.5 bg-zinc-950/90 border-b border-white/10 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-white flex items-center gap-2">
                Grade de Programação (EPG 24h)
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AO VIVO
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Guia estilo TV a Cabo • Sintonize canais com 1 clique ou pelo controle
              </p>
            </div>
          </div>
        </div>

        {/* Campo de Busca de Canal */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-48 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="Buscar canal na grade..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            data-tv-focus="true"
            className="p-1.5 md:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition"
            title="Fechar Grade (Esc ou G)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Barra de Filtro de Categorias */}
      <div className="flex items-center gap-1.5 px-4 md:px-6 py-2 bg-zinc-950/80 border-b border-white/5 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1 mr-1 shrink-0">
          <Filter size={11} /> Filtro:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            data-tv-focus="true"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 border ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grade Principal com Eixo de Tempo e Linha do Tempo dos Canais */}
      <div 
        ref={timelineScrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto relative scrollbar-thin scrollbar-thumb-zinc-700 bg-zinc-950"
      >
        <div style={{ width: `${CHANNEL_COL_WIDTH + (1440 * PIXELS_PER_MINUTE)}px` }} className="relative">
          
          {/* Cabeçalho de Horários (Fixado no Topo da Rolagem Vertical) */}
          <div className="sticky top-0 z-40 flex bg-zinc-900 border-b border-white/10 h-10 shadow">
            {/* Coluna de Canais (Cabeçalho fixo no canto superior esquerdo) */}
            <div 
              style={{ width: `${CHANNEL_COL_WIDTH}px` }} 
              className="sticky left-0 z-50 bg-zinc-900 px-4 flex items-center justify-between border-r border-white/10 shrink-0 font-extrabold text-[11px] text-zinc-400 uppercase tracking-wider shadow-[6px_0_20px_rgba(0,0,0,0.95)]"
            >
              <span>Canal</span>
              <span>{filteredChannels.length} canais</span>
            </div>

            {/* Trilha de Horários */}
            <div className="flex relative">
              {timeSlots.map((slot, idx) => (
                <div 
                  key={idx}
                  style={{ width: `${30 * PIXELS_PER_MINUTE}px` }}
                  className="shrink-0 text-center flex items-center justify-center font-mono text-[11px] font-bold text-zinc-400 border-r border-white/5"
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>

          {/* Linha Vermelha Indicadora do Horário Atual ("Linha de Agora") */}
          <div 
            style={{ left: `${CHANNEL_COL_WIDTH + nowLeft}px` }}
            className="absolute top-10 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none shadow-[0_0_12px_rgba(239,68,68,0.8)]"
          >
            <div className="sticky top-11 -translate-x-1/2 bg-red-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap">
              AGORA • {String(Math.floor(currentTimeMinutes / 60)).padStart(2, '0')}:{String(currentTimeMinutes % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Linhas de Canais */}
          <div className="divide-y divide-white/5">
            {filteredChannels.map((ch, chIdx) => {
              const schedule = EpgService.getFullScheduleForChannel(ch.nome, ch.categoria);
              const isCurrentPlaying = ch.id === currentChannelId;

              return (
                <div key={ch.id} className="flex h-16 group hover:bg-white/[0.02] transition-colors relative">
                  
                  {/* Coluna Fixa do Canal (Sticky na Rolagem Horizontal com fundo sólido opaco) */}
                  <div 
                    style={{ width: `${CHANNEL_COL_WIDTH}px` }}
                    onClick={() => {
                      onSelectChannel(ch);
                      onClose();
                    }}
                    className={`sticky left-0 z-30 px-3 flex items-center gap-2.5 border-r border-white/10 shrink-0 cursor-pointer transition shadow-[6px_0_20px_rgba(0,0,0,0.95)] ${
                      isCurrentPlaying 
                        ? 'bg-indigo-950 hover:bg-indigo-900' 
                        : 'bg-zinc-950 hover:bg-zinc-900'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-zinc-500 w-5 text-right shrink-0">
                      #{chIdx + 1}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 p-1 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                      {ch.logo ? (
                        <img 
                          src={ch.logo} 
                          alt={ch.nome} 
                          className="w-full h-full object-contain" 
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-300">{ch.nome.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate block">
                          {ch.nome}
                        </span>
                        {isCurrentPlaying && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 truncate block">
                        {ch.categoria || 'Ao Vivo'}
                      </span>
                    </div>
                  </div>

                  {/* Trilha de Programas do Canal */}
                  <div className="relative flex-1 h-full">
                    {schedule.map((prog) => {
                      const startM = parseTimeToMinutes(prog.start);
                      let endM = parseTimeToMinutes(prog.end);
                      if (endM < startM) endM += 1440; // Passou da meia-noite

                      const durationM = Math.max(15, endM - startM);
                      const leftPos = startM * PIXELS_PER_MINUTE;
                      const width = durationM * PIXELS_PER_MINUTE;

                      const isCurrent = prog.isCurrent;

                      return (
                        <div
                          key={prog.id}
                          style={{
                            left: `${leftPos}px`,
                            width: `${Math.max(40, width - 2)}px`
                          }}
                          onClick={() => {
                            setFocusedProgram({ ...prog, channelName: ch.nome, channelLogo: ch.logo, channel: ch });
                            if (isCurrent) {
                              onSelectChannel(ch);
                              onClose();
                            }
                          }}
                          onMouseEnter={() => {
                            setFocusedProgram({ ...prog, channelName: ch.nome, channelLogo: ch.logo, channel: ch });
                          }}
                          data-tv-focus="true"
                          className={`absolute top-1 bottom-1 rounded-xl p-2 flex flex-col justify-between overflow-hidden cursor-pointer transition border text-left ${
                            isCurrent
                              ? 'bg-gradient-to-r from-indigo-900/40 via-indigo-800/30 to-purple-900/30 border-indigo-500/50 hover:border-indigo-400 ring-1 ring-indigo-500/30 shadow-md'
                              : prog.isPast
                                ? 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300'
                                : 'bg-zinc-900/70 border-white/10 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {/* Barra de Progresso Interna para o Programa no Ar */}
                          {isCurrent && prog.progress > 0 && (
                            <div 
                              className="absolute inset-0 bg-indigo-500/15 pointer-events-none"
                              style={{ width: `${prog.progress}%` }}
                            />
                          )}

                          <div className="relative z-10 flex items-center justify-between gap-1 min-w-0">
                            <span className={`text-[11px] font-bold truncate block ${isCurrent ? 'text-white' : ''}`}>
                              {prog.title}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase shrink-0">
                                No Ar
                              </span>
                            )}
                          </div>

                          <div className="relative z-10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                            <span>{prog.start} - {prog.end}</span>
                            {isCurrent && (
                              <span className="text-indigo-300 font-bold">{prog.progress}%</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Rodapé Executivo: Detalhe do Programa Focado & Ação Rápida de Sintonizar */}
      <footer className="p-3 md:p-4 bg-zinc-950 border-t border-white/10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        {focusedProgram ? (
          <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
            {focusedProgram.channelLogo && (
              <div className="w-10 h-10 rounded-xl bg-zinc-900 p-1 border border-white/10 shrink-0 flex items-center justify-center">
                <img 
                  src={focusedProgram.channelLogo} 
                  alt={focusedProgram.channelName} 
                  className="w-full h-full object-contain" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs md:text-sm font-black text-white truncate">
                  {focusedProgram.title}
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-white/5 shrink-0">
                  {focusedProgram.channelName}
                </span>
                {focusedProgram.isCurrent && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 animate-pulse">
                    NO AR AGORA
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                <Clock size={11} className="text-indigo-400 shrink-0" />
                <span className="font-mono text-zinc-300">{focusedProgram.start} às {focusedProgram.end}</span>
                {focusedProgram.isCurrent && (
                  <span className="text-indigo-400 font-bold">• {focusedProgram.progress}% concluído</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Radio size={14} className="text-indigo-400" />
            <span>Passe o cursor ou navegue com as setas do controle para inspecionar os programas</span>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          {focusedProgram && (
            <button
              onClick={() => {
                if (focusedProgram.channel) {
                  onSelectChannel(focusedProgram.channel);
                  onClose();
                }
              }}
              data-tv-focus="true"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Play size={14} fill="currentColor" />
              <span>Sintonizar {focusedProgram.channelName}</span>
            </button>
          )}

          <button
            onClick={onClose}
            data-tv-focus="true"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 text-xs font-semibold transition"
          >
            Voltar (Esc)
          </button>
        </div>
      </footer>
    </div>
  );
}
