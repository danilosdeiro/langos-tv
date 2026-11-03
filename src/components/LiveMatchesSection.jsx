import React, { useState, useEffect, useMemo } from 'react';
import { Play, Tv, Trophy, Clock, MapPin, Radio, Flame, Sparkles, Globe, Shield, RefreshCw, Search, X } from 'lucide-react';
import INITIAL_JOGOS from '../data/jogosHoje.json';
import { SportsService } from '../services/sportsService';

const FEATURED_TEAMS = [
  { label: 'Todos', value: 'all' },
  { label: '🔵🔴 Bahia', value: 'bahia' },
  { label: '🔴⚫ Vitória', value: 'vitória' },
  { label: '🔴⚫ Flamengo', value: 'flamengo' },
  { label: '🟢 Palmeiras', value: 'palmeiras' },
  { label: '⚪🔴 São Paulo', value: 'são paulo' },
  { label: '⚫⚪ Corinthians', value: 'corinthians' },
  { label: '⭐ Real Madrid & Barça', value: 'el-clasico' }
];

export default function LiveMatchesSection({ channels = [], onSelectChannel }) {
  const [matches, setMatches] = useState(() => SportsService.getCachedMatches() || INITIAL_JOGOS);
  const [activeMatchTab, setActiveMatchTab] = useState('todos'); // 'todos', 'aovivo', 'nacional', 'inter'
  const [teamFilter, setTeamFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  // Sincronização Dinâmica Diária Oficial (Brasileirão com Prioridade Máxima)
  const refreshSportsSchedule = async () => {
    try {
      setIsRefreshing(true);
      const updated = await SportsService.fetchLiveDailyMatches();
      if (Array.isArray(updated) && updated.length > 0) {
        setMatches(updated);
      }
      setLastRefreshedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Erro ao sincronizar jogos oficiais:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshSportsSchedule();
    const interval = setInterval(refreshSportsSchedule, 60000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic counts
  const liveCount = useMemo(() => matches.filter(m => m.isLive || m.status === 'AO VIVO').length, [matches]);
  const nacionalCount = useMemo(() => matches.filter(m => 
    m.campeonato.toLowerCase().includes('brasileir') || 
    m.campeonato.toLowerCase().includes('copa') || 
    m.campeonato.toLowerCase().includes('baiano')
  ).length, [matches]);
  const interCount = useMemo(() => matches.filter(m => 
    m.campeonato.toLowerCase().includes('champions') || 
    m.campeonato.toLowerCase().includes('premier') || 
    m.campeonato.toLowerCase().includes('la liga')
  ).length, [matches]);

  // Filtered list
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      // League tab filter
      if (activeMatchTab === 'aovivo' && !(m.isLive || m.status === 'AO VIVO')) return false;
      if (activeMatchTab === 'nacional' && !(m.campeonato.toLowerCase().includes('brasileir') || m.campeonato.toLowerCase().includes('copa') || m.campeonato.toLowerCase().includes('baiano'))) return false;
      if (activeMatchTab === 'inter' && !(m.campeonato.toLowerCase().includes('champions') || m.campeonato.toLowerCase().includes('premier') || m.campeonato.toLowerCase().includes('la liga'))) return false;

      // Quick team filter
      if (teamFilter !== 'all') {
        const homeName = m.mandante.nome.toLowerCase();
        const awayName = m.visitante.nome.toLowerCase();
        if (teamFilter === 'el-clasico') {
          if (!homeName.includes('madrid') && !awayName.includes('madrid') && !homeName.includes('barcelona') && !awayName.includes('barcelona')) {
            return false;
          }
        } else if (!homeName.includes(teamFilter) && !awayName.includes(teamFilter)) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = `${m.mandante.nome} ${m.visitante.nome} ${m.campeonato} ${m.estadio}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [matches, activeMatchTab, teamFilter, searchQuery]);

  const handleTuneIn = (canalId, matchInfo, explicitChannelName) => {
    if (!canalId) return;
    const targetChannel = channels.find(c => c.id === canalId);
    const scoreStr = (matchInfo.isLive || matchInfo.status === 'ENCERRADO')
      ? `${matchInfo.mandante.gols} x ${matchInfo.visitante.gols}`
      : 'vs';
    const chName = explicitChannelName || targetChannel?.nome || 'Canal de Esportes';
    const osdMsg = `⚽ ${matchInfo.mandante.nome} ${scoreStr} ${matchInfo.visitante.nome} • Sintonizado em ${chName}`;

    if (targetChannel && onSelectChannel) {
      onSelectChannel({
        ...targetChannel,
        matchInfo,
        initialOsd: osdMsg
      });
    } else if (onSelectChannel) {
      const fallback = channels.find(c => 
        c.nome.toLowerCase().includes('premiere') || 
        c.nome.toLowerCase().includes('cazé') ||
        c.nome.toLowerCase().includes('sportv') || 
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
      <div className="flex flex-col gap-4 bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-950/80 p-4 sm:p-5 rounded-3xl border border-emerald-500/20 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  ⚽ Jogos Oficiais & Transmissões Premiere
                </h2>
                {liveCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    {liveCount} AO VIVO
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Grade Oficial
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span>Transmissão direta integrada aos canais Premiere, SporTV, CazéTV e ESPN</span>
                {lastRefreshedAt && (
                  <span className="text-[10px] text-zinc-500">· Sincronizado às {lastRefreshedAt}</span>
                )}
              </p>
            </div>
          </div>

          {/* Botões de Ação Topo */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={refreshSportsSchedule}
              disabled={isRefreshing}
              data-tv-focus="true"
              className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/5 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              title="Atualizar placares agora"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-400' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros Principais & Busca de Partidas */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Abas de Campeonatos */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setActiveMatchTab('todos')}
              data-tv-focus="true"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeMatchTab === 'todos' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({matches.length})
            </button>
            
            {liveCount > 0 && (
              <button
                onClick={() => setActiveMatchTab('aovivo')}
                data-tv-focus="true"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                activeMatchTab === 'nacional' ? 'bg-zinc-800 text-white font-extrabold border border-white/10' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🇧🇷 Brasileirão ({nacionalCount})</span>
            </button>
            
            <button
              onClick={() => setActiveMatchTab('inter')}
              data-tv-focus="true"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                activeMatchTab === 'inter' ? 'bg-zinc-800 text-white font-extrabold border border-white/10' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🌍 Champions ({interCount})</span>
            </button>
          </div>

          {/* Campo de Busca Rápida de Jogos */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar jogo por time ou estádio (ex: Bahia, Fonte Nova, Flamengo)..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Pílulas de Atalho Rápido para Clubes Destaque (Bahia, Vitória, Flamengo, etc.) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Filtro Rápido:
          </span>
          {FEATURED_TEAMS.map(team => {
            const isSelected = teamFilter === team.value;
            return (
              <button
                key={team.value}
                onClick={() => setTeamFilter(team.value)}
                data-tv-focus="true"
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900/60 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {team.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Cards dos Jogos */}
      {filteredMatches.length === 0 ? (
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 text-center space-y-2">
          <p className="text-zinc-400 text-sm font-semibold">Nenhuma partida encontrada para os filtros selecionados.</p>
          <button
            onClick={() => { setActiveMatchTab('todos'); setTeamFilter('all'); setSearchQuery(''); }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
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
                        onClick={() => handleTuneIn(opt.canalId, match, opt.nome)}
                        data-tv-focus="true"
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                          opt.canalId === 'ch-cazetv'
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black font-extrabold'
                            : opt.nome.toLowerCase().includes('premiere')
                              ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white font-extrabold'
                              : i === 0
                                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white'
                                : 'bg-zinc-800/80 border-white/5 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                        }`}
                        title={`Sintonizar transmissão no ${opt.nome}`}
                      >
                        <Tv size={11} />
                        <span>{opt.nome}</span>
                      </button>
                    ))}
                  </div>

                  {/* Botão de Ação Imediata */}
                  <button
                    onClick={() => handleTuneIn(primaryChannel?.canalId, match, primaryChannel?.nome)}
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
      )}
    </section>
  );
}
