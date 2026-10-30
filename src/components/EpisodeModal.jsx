import React, { useState, useEffect } from 'react';
import { X, Play, Layers, Clapperboard, Loader2, Volume2, MessageSquare } from 'lucide-react';
import { VodService } from '../services/vodService';

export default function EpisodeModal({ 
  series, 
  isOpen, 
  onClose, 
  onPlayEpisode 
}) {
  const [loading, setLoading] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedAudio, setSelectedAudio] = useState('dublado'); // 'dublado' | 'legendado'

  useEffect(() => {
    if (!series || !isOpen) return;

    setLoading(true);
    setEpisodes([]);

    // Buscar episódios da série na nuvem
    VodService.fetchEpisodes(series.letra, series.pedaco, series.titulo)
      .then(eps => {
        // Se a busca dinâmica não encontrar ou série for local, usar catálogo embutido como fallback
        if (eps.length === 0 && !series.isDynamic) {
          const dubEps = (series.dublado || []).map((e, idx) => ({
            season: 1,
            episode: idx + 1,
            audio: 'dublado',
            url: e.url,
            allUrls: [e.url],
            nome: e.nome
          }));
          const legEps = (series.legendado || []).map((e, idx) => ({
            season: 1,
            episode: idx + 1,
            audio: 'legendado',
            url: e.url,
            allUrls: [e.url],
            nome: e.nome
          }));
          eps = [...dubEps, ...legEps];
        }

        setEpisodes(eps);
        if (eps.length > 0) {
          setSelectedSeason(eps[0].season);
          const hasDub = eps.some(e => e.audio === 'dublado');
          setSelectedAudio(hasDub ? 'dublado' : 'legendado');
        }
      })
      .catch(err => {
        console.error('Erro ao carregar episódios:', err);
        setEpisodes([]);
      })
      .finally(() => setLoading(false));
  }, [series, isOpen]);

  if (!isOpen || !series) return null;

  // Temporadas disponíveis
  const seasons = Array.from(new Set(episodes.map(e => e.season))).sort((a, b) => a - b);
  
  // Áudios disponíveis no acervo desta série
  const hasDublado = episodes.some(e => e.audio === 'dublado');
  const hasLegendado = episodes.some(e => e.audio === 'legendado');

  // Episódios filtrados da temporada atual
  let currentSeasonEps = episodes.filter(
    e => e.season === selectedSeason && e.audio === selectedAudio
  );

  // Se a temporada não tiver episódios para o áudio selecionado, usar os disponíveis
  if (currentSeasonEps.length === 0 && episodes.length > 0) {
    currentSeasonEps = episodes.filter(e => e.season === selectedSeason);
  }

  // Ordenar episódios numericamente
  currentSeasonEps.sort((a, b) => a.episode - b.episode);

  // Manipular clique no episódio
  const handleEpisodeClick = (ep) => {
    // Buscar fontes Dublado e Legendado para este mesmo episódio (S/E)
    const dubEp = episodes.find(e => e.season === ep.season && e.episode === ep.episode && e.audio === 'dublado');
    const legEp = episodes.find(e => e.season === ep.season && e.episode === ep.episode && e.audio === 'legendado');

    const dubUrls = dubEp ? ((dubEp.allUrls && dubEp.allUrls.length > 0) ? dubEp.allUrls : [dubEp.url]) : [];
    const legUrls = legEp ? ((legEp.allUrls && legEp.allUrls.length > 0) ? legEp.allUrls : [legEp.url]) : [];

    const dubSources = dubUrls.map((u, i) => ({
      nome: `Dublado - Fonte ${i + 1} (${u.includes('.mp4') ? 'MP4 FHD' : 'HLS Auto'})`,
      url: u,
      qualidade: u.includes('.mp4') ? 'FHD' : 'Auto',
      audio: 'dublado'
    }));

    const legSources = legUrls.map((u, i) => ({
      nome: `Legendado - Fonte ${i + 1} (${u.includes('.mp4') ? 'MP4 FHD' : 'HLS Auto'})`,
      url: u,
      qualidade: u.includes('.mp4') ? 'FHD' : 'Auto',
      audio: 'legendado'
    }));

    // Determinar áudio preferencial baseado na seleção do usuário no modal
    const chosenAudio = (selectedAudio === 'legendado' && legSources.length > 0)
      ? 'legendado'
      : (dubSources.length > 0 ? 'dublado' : (legSources.length > 0 ? 'legendado' : ep.audio));

    const activeSources = chosenAudio === 'legendado' ? legSources : dubSources;
    const fallbackSources = activeSources.length > 0 ? activeSources : [...dubSources, ...legSources];

    onPlayEpisode({
      id: `ep-${series.id}-${ep.season}-${ep.episode}`,
      titulo: `${series.titulo} — T${ep.season}:E${ep.episode}`,
      categoria: series.categoria || 'Série',
      capa: series.capa || '',
      fontes: fallbackSources,
      dublado: dubSources,
      legendado: legSources
    }, chosenAudio);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10 shadow-md">
              {series.capa ? (
                <img 
                  src={series.capa} 
                  alt={series.titulo} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-purple-400">
                  <Clapperboard size={20} />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-white font-extrabold text-base md:text-lg line-clamp-1">{series.titulo}</h2>
              <p className="text-zinc-400 text-xs">
                {series.ano} • {series.categoria || 'Série'} • {loading ? 'Carregando...' : `${episodes.length} episódios catalogados`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Seletor de Áudio (Dublado / Legendado) */}
          <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-2xl border border-white/5">
            <span className="text-xs font-bold text-zinc-400 px-2">Áudio da Série:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedAudio('dublado')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedAudio === 'dublado'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Volume2 size={13} />
                Dublado
              </button>
              <button
                onClick={() => setSelectedAudio('legendado')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedAudio === 'legendado'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MessageSquare size={13} />
                Legendado
              </button>
            </div>
          </div>

          {/* Seletor de Temporadas (Aparece se houver mais de 1 temporada) */}
          {seasons.length > 1 && (
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Temporadas ({seasons.length} disponíveis):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {seasons.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedSeason === s
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Temporada {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grade de Episódios */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 size={32} className="animate-spin text-purple-500 mb-2" />
              <span className="text-xs font-medium">Buscando catálogo completo de episódios na nuvem...</span>
            </div>
          ) : currentSeasonEps.length > 0 ? (
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Episódios da Temporada {selectedSeason}:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {currentSeasonEps.map((ep, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEpisodeClick(ep)}
                    className="p-3 bg-zinc-800/80 hover:bg-purple-600 border border-white/5 hover:border-purple-400 rounded-xl text-left transition flex items-center justify-between group shadow-sm"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-white block">
                        Episódio {ep.episode}
                      </span>
                      <span className="text-[10px] text-zinc-400 group-hover:text-purple-200">
                        {ep.audio === 'dublado' ? '🔊 Dublado' : '💬 Legendado'}
                      </span>
                    </div>
                    <Play size={14} className="text-zinc-500 group-hover:text-white transition" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-zinc-500 text-xs">
              Nenhum episódio encontrado para a opção selecionada ({selectedAudio}).
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
