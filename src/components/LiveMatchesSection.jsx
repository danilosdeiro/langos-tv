import React, { useState, useEffect } from 'react';
import { Play, Tv, Trophy, Clock, MapPin, Radio, Flame, Sparkles, Globe, Shield, RefreshCw } from 'lucide-react';
import INITIAL_JOGOS from '../data/jogosHoje.json';

export default function LiveMatchesSection({ channels = [], onSelectChannel }) {
  const [matches, setMatches] = useState(INITIAL_JOGOS);
  const [activeMatchTab, setActiveMatchTab] = useState('todos'); // 'todos', 'aovivo', 'nacional', 'inter'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh ESPN real-time scores every 60s
  useEffect(() => {
    let isMounted = true;

    async function checkLiveScores() {
      try {
        setIsRefreshing(true);
        const [uclRes, braRes] = await Promise.allSettled([
          fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard').then(r => r.json()),
          fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard').then(r => r.json())
        ]);

        const liveEventsMap = new Map();

        const addEvents = (data) => {
          if (data && data.events) {
            data.events.forEach(ev => {
              liveEventsMap.set(ev.id, ev);
            });
          }
        };

        if (uclRes.status === 'fulfilled') addEvents(uclRes.value);
        if (braRes.status === 'fulfilled') addEvents(braRes.value);

        if (!isMounted || liveEventsMap.size === 0) return;

        setMatches(prevMatches => {
          return prevMatches.map(m => {
            const espnId = m.id.replace('match-', '');
            const liveEv = liveEventsMap.get(espnId);
            if (!liveEv) return m;

            const comp = liveEv.competitions?.[0];
            const home = comp?.competitors?.find(c => c.homeAway === 'home');
            const away = comp?.competitors?.find(c => c.homeAway === 'away');
            const statusType = liveEv.status?.type;
            const isLive = statusType?.state === 'in';
            const isPost = statusType?.state === 'post';

            let updatedStatus = m.status;
            let updatedTempo = m.tempo;

            if (isLive) {
              updatedStatus = 'AO VIVO';
              updatedTempo = liveEv.status?.displayClock ? `${liveEv.status.displayClock}'` : 'Ao Vivo';
            } else if (isPost) {
              updatedStatus = 'ENCERRADO';
              updatedTempo = 'Fim de Jogo';
            }

            return {
              ...m,
              isLive,
              status: updatedStatus,
              tempo: updatedTempo,
              mandante: {
                ...m.mandante,
                gols: (isLive || isPost) ? parseInt(home?.score || 0, 10) : m.mandante.gols
              },
              visitante: {
                ...m.visitante,
                gols: (isLive || isPost) ? parseInt(away?.score || 0, 10) : m.visitante.gols
              }
            };
          });
        });
      } catch (err) {
        console.warn('Erro ao atualizar placares ao vivo:', err);
      } finally {
        if (isMounted) setIsRefreshing(false);
      }
    }

    checkLiveScores();
    const interval = setInterval(checkLiveScores, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Dynamic counts
  const liveCount = matches.filter(m => m.isLive || m.status === 'AO VIVO').length;
  const nacionalCount = matches.filter(m => 
    m.campeonato.toLowerCase().includes('brasileir') || 
    m.campeonato.toLowerCase().includes('copa') || 
    m.campeonato.toLowerCase().includes('baiano')
  ).length;
  const interCount = matches.filter(m => 
    m.campeonato.toLowerCase().includes('champions') || 
    m.campeonato.toLowerCase().includes('premier') || 
    m.campeonato.toLowerCase().includes('la liga')
  ).length;

  const filteredMatches = matches.filter(m => {
    if (activeMatchTab === 'aovivo') return m.isLive || m.status === 'AO VIVO';
    if (activeMatchTab === 'nacional') return m.campeonato.toLowerCase().includes('brasileir') || m.campeonato.toLowerCase().includes('copa') || m.campeonato.toLowerCase().includes('baiano');
    if (activeMatchTab === 'inter') return m.campeonato.toLowerCase().includes('champions') || m.campeonato.toLowerCase().includes('premier') || m.campeonato.toLowerCase().includes('la liga');
    return true;
  });

  const handleTuneIn = (canalId, matchInfo) => {
    if (!canalId) return;
    const targetChannel = channels.find(c => c.id === canalId);
    const scoreStr = (matchInfo.isLive || matchInfo.status === 'ENCERRADO')
      ? `${matchInfo.mandante.gols} x ${matchInfo.visitante.gols}`
      : 'vs';
    const osdMsg = `⚽ ${matchInfo.mandante.nome} ${scoreStr} ${matchInfo.visitante.nome} • Transmissão Langos TV`;

    if (targetChannel && onSelectChannel) {
      onSelectChannel({
        ...targetChannel,
        matchInfo,
        initialOsd: osdMsg
      });
    } else if (onSelectChannel) {
      const fallback = channels.find(c => 
        c.nome.toLowerCase().includes('premiere') || 
        c.nome.toLowerCase().includes('sportv') || 
        c.nome.toLowerCase().includes('cazé') ||
        c.nome.toLowerCase().includes('espn')
      );
      if (fallback) {
        onSelectChannel({
          ...fallback,
          matchInfo,
          initialOsd: osdMsg
        });
      }
    }
  };

  return (
    <section className="w-full mb-8 space-y-4 animate-fadeIn">
      {/* Cabeçalho da Seção de Jogos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-950/80 p-4 sm:p-5 rounded-3xl border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                ⚽ Jogos & Transmissões Esportivas
              </h2>
              {liveCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {liveCount} AO VIVO
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Grade Oficial
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Confrontos oficiais com sintonizador direto nos canais Premiere, SporTV, CazéTV e ESPN
            </p>
          </div>
        </div>

        {/* Filtros de Competições */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5 self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveMatchTab('todos')}
            data-tv-focus="true"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              activeMatchTab === 'todos' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({matches.length})
          </button>
          
          {liveCount > 0 && (
            <button
              onClick={() => setActiveMatchTab('aovivo')}
              data-tv-focus="true"
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                activeMatchTab === 'aovivo' ? 'bg-red-600 text-white shadow-md' : 'text-red-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Ao Vivo ({liveCount})
            </button>
          )}

          <button
            onClick={() => setActiveMatchTab('nacional')}
            data-tv-focus="true"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
              activeMatchTab === 'nacional' ? 'bg-zinc-800 text-white font-extrabold border border-white/10' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🇧🇷 Brasileirão ({nacionalCount})</span>
          </button>
          
          <button
            onClick={() => setActiveMatchTab('inter')}
            data-tv-focus="true"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
              activeMatchTab === 'inter' ? 'bg-zinc-800 text-white font-extrabold border border-white/10' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🌍 Champions ({interCount})</span>
          </button>
        </div>
      </div>

      {/* Grid de Cards dos Jogos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map(match => {
          const isLive = match.isLive || match.status === 'AO VIVO';
          const isEnded = match.status === 'ENCERRADO';
          const primaryChannel = match.transmissao?.[0];

          return (
            <div
              key={match.id}
              className={`group relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                isLive
                  ? 'bg-gradient-to-b from-zinc-900/90 to-zinc-950 border-red-500/50 shadow-xl shadow-red-500/10'
                  : 'bg-zinc-900/70 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Topo do Card: Campeonato e Status */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5">
                <span className="text-[11px] font-bold text-zinc-400 truncate max-w-[220px] sm:max-w-xs">
                  {match.campeonato}
                </span>

                {isLive ? (
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {match.tempo}
                  </span>
                ) : isEnded ? (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/50 shrink-0">
                    ENCERRADO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                    <Clock size={11} />
                    {match.status}
                  </span>
                )}
              </div>

              {/* Placar e Confronto Central */}
              <div className="py-5 flex items-center justify-around gap-2">
                {/* Time Mandante */}
                <div className="flex flex-col items-center text-center flex-1 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 p-2 flex items-center justify-center border border-white/10 shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                    <img 
                      src={match.mandante.escudo} 
                      alt={match.mandante.nome} 
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerText = match.mandante.sigla;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight">
                      {match.mandante.nome}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider">MANDANTE</span>
                  </div>
                </div>

                {/* Placar ou Marcador de Confronto */}
                <div className="flex flex-col items-center justify-center px-3">
                  {isLive || isEnded ? (
                    <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-2xl border border-white/10 shadow-inner">
                      <span className={`text-2xl sm:text-3xl font-black ${isLive ? 'text-red-400' : 'text-white'}`}>
                        {match.mandante.gols}
                      </span>
                      <span className="text-zinc-500 font-bold">:</span>
                      <span className={`text-2xl sm:text-3xl font-black ${isLive ? 'text-red-400' : 'text-white'}`}>
                        {match.visitante.gols}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-lg sm:text-xl font-black text-zinc-400">VS</span>
                      <span className="text-[10px] font-bold text-emerald-400">{match.status}</span>
                    </div>
                  )}
                  <span className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 text-center truncate max-w-[150px]">
                    <MapPin size={9} />
                    {match.estadio.split('·')[0]}
                  </span>
                </div>

                {/* Time Visitante */}
                <div className="flex flex-col items-center text-center flex-1 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 p-2 flex items-center justify-center border border-white/10 shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                    <img 
                      src={match.visitante.escudo} 
                      alt={match.visitante.nome} 
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerText = match.visitante.sigla;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight">
                      {match.visitante.nome}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider">VISITANTE</span>
                  </div>
                </div>
              </div>

              {/* Rodapé: Botões de Canais de Transmissão */}
              <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  <span className="text-[10px] font-semibold text-zinc-400 mr-1 hidden sm:inline">
                    Onde Assistir:
                  </span>
                  {match.transmissao?.map((opt, i) => (
                    <button
                      key={opt.canalId}
                      onClick={() => handleTuneIn(opt.canalId, match)}
                      data-tv-focus="true"
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                        opt.canalId === 'ch-cazetv'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black font-extrabold'
                          : i === 0
                            ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                            : 'bg-zinc-800/80 border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      }`}
                      title={`Assistir no ${opt.nome}`}
                    >
                      <Tv size={11} />
                      <span>{opt.nome}</span>
                    </button>
                  ))}
                </div>

                {/* Botão de Ação Imediata */}
                <button
                  onClick={() => handleTuneIn(primaryChannel?.canalId, match)}
                  data-tv-focus="true"
                  className={`w-full sm:w-auto px-4 py-2 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${
                    isLive
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/20'
                      : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  <Play size={13} fill="currentColor" />
                  <span>{isLive ? 'Assistir Ao Vivo' : 'Sintonizar Canal'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
