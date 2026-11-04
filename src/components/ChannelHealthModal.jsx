import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Play, Copy, Check, Zap, Filter, Search, ShieldCheck, Clock 
} from 'lucide-react';
import { 
  testSingleChannel, 
  getQuickSampleChannels, 
  runBatchHealthCheck 
} from '../services/channelHealthService';

export default function ChannelHealthModal({ 
  isOpen, 
  onClose, 
  channels = [], 
  onSelectChannel 
}) {
  const [mode, setMode] = useState('quick'); // 'quick' (20 canais) ou 'all' (184 canais)
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const [results, setResults] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'healthy', 'issues'
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const isCancelledRef = useRef(false);

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Iniciar verificação automática na primeira abertura se vazio
  useEffect(() => {
    if (isOpen && results.length === 0 && !isRunning && channels.length > 0) {
      handleStartCheck('quick');
    }
  }, [isOpen, channels]);

  const handleStartCheck = async (selectedMode = mode) => {
    if (isRunning || channels.length === 0) return;

    setIsRunning(true);
    isCancelledRef.current = false;
    setResults([]);
    setProgress({ completed: 0, total: 0, percent: 0 });

    const targetChannels = selectedMode === 'quick' 
      ? getQuickSampleChannels(channels)
      : channels;

    setProgress({ completed: 0, total: targetChannels.length, percent: 0 });

    try {
      await runBatchHealthCheck(
        targetChannels,
        ({ completed, total, percent, resultsSoFar }) => {
          if (isCancelledRef.current) return;
          setProgress({ completed, total, percent });
          setResults(resultsSoFar);
        },
        6 // 6 em paralelo para fluidez
      );
    } catch (err) {
      console.error('Erro na verificação de saúde:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    setIsRunning(false);
  };

  // Métricas calculadas
  const stats = useMemo(() => {
    const total = results.length;
    const healthy = results.filter(r => r.isOk).length;
    const issues = results.filter(r => !r.isOk).length;
    const avgLatency = healthy > 0 
      ? Math.round(results.filter(r => r.isOk).reduce((acc, r) => acc + r.latency, 0) / healthy)
      : 0;
    const healthPercent = total > 0 ? Math.round((healthy / total) * 100) : 100;

    return { total, healthy, issues, avgLatency, healthPercent };
  }, [results]);

  // Categorias disponíveis nos resultados
  const availableCategories = useMemo(() => {
    const cats = new Set(['Todos']);
    results.forEach(r => {
      if (r.categoria) cats.add(r.categoria);
    });
    return Array.from(cats);
  }, [results]);

  // Lista filtrada
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      if (statusFilter === 'healthy' && !r.isOk) return false;
      if (statusFilter === 'issues' && r.isOk) return false;
      if (categoryFilter !== 'Todos' && r.categoria !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = `${r.nome} ${r.categoria}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [results, statusFilter, categoryFilter, searchQuery]);

  // Copiar relatório
  const handleCopyReport = () => {
    if (results.length === 0) return;
    const dateStr = new Date().toLocaleString('pt-BR');
    let text = `🏥 RELATÓRIO DE SAÚDE DOS CANAIS — LANGO'S TV (${dateStr})\n`;
    text += `Total Avaliado: ${stats.total} canais | Operacionais: ${stats.healthy} (${stats.healthPercent}%) | Latência Média: ${stats.avgLatency}ms\n\n`;
    
    results.forEach((r, idx) => {
      const statusIcon = r.isOk ? '✅' : '❌';
      text += `${idx + 1}. ${statusIcon} ${r.nome} [${r.categoria}] - ${r.statusText} (${r.activeSourceName})\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div 
      data-tv-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col transition-all"
      >
        
        {/* TOPO DO MODAL */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Activity size={22} className={isRunning ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Saúde dos Canais em Tempo Real
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Quick Verification
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Diagnóstico de conectividade, tempo de resposta (ms) e streaming HLS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition border border-white/5"
            title="Fechar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* BARRA DE SELEÇÃO DE MODO & AÇÕES RÁPIDAS */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/5 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMode('quick');
                handleStartCheck('quick');
              }}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                mode === 'quick'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-white/5'
              }`}
            >
              <Zap size={14} className={mode === 'quick' ? 'fill-current' : 'text-amber-400'} />
              Verificação Rápida (Top 20)
            </button>

            <button
              onClick={() => {
                setMode('all');
                handleStartCheck('all');
              }}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                mode === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-white/5'
              }`}
            >
              <ShieldCheck size={14} className={mode === 'all' ? 'text-white' : 'text-indigo-400'} />
              Todos os {channels.length} Canais
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition flex items-center gap-1.5"
              >
                <XCircle size={14} />
                Interromper
              </button>
            ) : (
              <button
                onClick={() => handleStartCheck(mode)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 transition flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={isRunning ? 'animate-spin' : ''} />
                Reverificar
              </button>
            )}

            <button
              onClick={handleCopyReport}
              disabled={results.length === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 transition flex items-center gap-1.5 disabled:opacity-40"
              title="Copiar relatório para a área de transferência"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado!' : 'Copiar Relatório'}</span>
            </button>
          </div>
        </div>

        {/* PROGRESSO EM TEMPO REAL (SE ESTIVER TESTANDO) */}
        {isRunning && (
          <div className="px-4 sm:px-6 py-2.5 bg-emerald-950/20 border-b border-emerald-500/20 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <RefreshCw size={12} className="animate-spin" />
                Testando canais em paralelo... ({progress.completed} de {progress.total})
              </span>
              <span className="text-zinc-400 font-mono">{progress.percent}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* CARDS DE RESUMO & MÉTRICAS */}
        <div className="p-4 sm:p-6 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Testado</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{stats.total}</span>
              <span className="text-xs text-zinc-500">canais</span>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={13} />
              Operacionais
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-400">{stats.healthy}</span>
              <span className="text-xs text-emerald-500 font-bold">({stats.healthPercent}%)</span>
            </div>
          </div>

          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Clock size={13} className="text-cyan-400" />
              Latência Média
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-cyan-400">{stats.avgLatency}</span>
              <span className="text-xs text-zinc-500">ms</span>
            </div>
          </div>

          <div className={`rounded-2xl p-3 flex flex-col justify-between border ${
            stats.issues === 0 
              ? 'bg-emerald-950/30 border-emerald-500/30' 
              : 'bg-amber-950/30 border-amber-500/30'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Status Geral</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-sm sm:text-base font-black ${
                stats.issues === 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {stats.issues === 0 ? '100% Estável' : `${stats.issues} Instável`}
              </span>
            </div>
          </div>
        </div>

        {/* FILTROS & BUSCA DENTRO DO MODAL */}
        <div className="px-4 sm:px-6 py-2 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({results.length})
            </button>
            <button
              onClick={() => setStatusFilter('healthy')}
              className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                statusFilter === 'healthy'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800/60 text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 size={12} />
              Operacionais ({stats.healthy})
            </button>
            {stats.issues > 0 && (
              <button
                onClick={() => setStatusFilter('issues')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                  statusFilter === 'issues'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800/60 text-red-400 hover:text-red-300'
                }`}
              >
                <AlertTriangle size={12} />
                Com Alerta ({stats.issues})
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-48">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nome..."
              className="w-full bg-zinc-950/60 text-white placeholder-zinc-500 text-xs rounded-xl pl-8 pr-3 py-1.5 border border-white/10 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* LISTAGEM DOS CANAIS EM TEMPO REAL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              {isRunning ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-emerald-400" />
                  <p className="text-sm font-medium text-zinc-400">Verificando saúde dos canais...</p>
                </div>
              ) : (
                <p className="text-sm">Nenhum canal encontrado com os filtros selecionados.</p>
              )}
            </div>
          ) : (
            filteredResults.map((r, idx) => (
              <div 
                key={r.channelId || idx}
                className="bg-zinc-950/40 hover:bg-zinc-800/50 border border-white/5 hover:border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 transition"
              >
                {/* Info do Canal */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1">
                    {r.logo ? (
                      <img src={r.logo} alt={r.nome} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-zinc-400">📺</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white truncate">{r.nome}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0 font-medium">
                        {r.categoria}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span className="text-zinc-500">{r.activeSourceName}</span>
                      <span>•</span>
                      <span className={`font-mono font-bold ${
                        r.latency < 250 ? 'text-emerald-400' : r.latency < 600 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {r.latency}ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status e Ação */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      r.isOk 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {r.isOk ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {r.isOk ? '200 OK' : 'Falha'}
                    </span>
                  </div>

                  {onSelectChannel && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectChannel(r.channel);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                      title={`Sintonizar ${r.nome}`}
                    >
                      <Play size={12} className="fill-current" />
                      <span className="hidden sm:inline">Assistir</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Proxy & CDN Edge Operacionais</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
