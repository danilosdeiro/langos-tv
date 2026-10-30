import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  RotateCcw, AlertTriangle, Layers, X
} from 'lucide-react';

export default function VideoPlayer({ 
  item, 
  onClose, 
  audioVersion = 'dublado', // 'dublado' ou 'legendado'
  onAudioVersionChange 
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const timeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fallbackNotice, setFallbackNotice] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Ref para evitar closure stale em callbacks de eventos HLS
  const activeSourceIndexRef = useRef(0);
  activeSourceIndexRef.current = activeSourceIndex;

  // Determina as fontes ativas baseado no tipo de item
  const isVOD = !!(item?.dublado || item?.legendado);
  
  const sources = React.useMemo(() => {
    if (!item) return [];
    if (isVOD) {
      const vodSources = audioVersion === 'legendado' ? item.legendado : item.dublado;
      return vodSources && vodSources.length > 0 ? vodSources : (item.dublado || item.legendado || []);
    }
    return item.fontes || [];
  }, [item, isVOD, audioVersion]);

  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;

  const currentSource = sources[activeSourceIndex] || sources[0];

  // Resolver URL: Se for HTTP em HTTPS ou exigir referer, passar pelo /api/proxy
  const resolvedStreamUrl = React.useMemo(() => {
    if (!currentSource?.url) return '';
    const rawUrl = currentSource.url;
    const isPageHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    if ((isPageHttps && rawUrl.startsWith('http://')) || currentSource.referer || rawUrl.includes('.txt')) {
      let proxy = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
      if (currentSource.referer) proxy += `&referer=${encodeURIComponent(currentSource.referer)}`;
      return proxy;
    }
    return rawUrl;
  }, [currentSource]);

  // Resetar índice ao trocar de canal ou áudio
  useEffect(() => {
    setActiveSourceIndex(0);
    setErrorMessage(null);
    setFallbackNotice(null);
  }, [item?.id, audioVersion]);

  // Função de Fallback automática rápida
  const handleFallback = (reason) => {
    const curIdx = activeSourceIndexRef.current;
    const allSources = sourcesRef.current;

    if (allSources.length > 1 && curIdx < allSources.length - 1) {
      const nextIndex = curIdx + 1;
      const nextSourceName = allSources[nextIndex]?.nome || `Fonte ${nextIndex + 1}`;
      setFallbackNotice(`Fonte ${curIdx + 1} indisponível (${reason}). Alternando para ${nextSourceName}...`);
      setActiveSourceIndex(nextIndex);
    } else {
      setLoading(false);
      setErrorMessage(`Todas as ${allSources.length} fontes deste canal/vídeo estão temporariamente inacessíveis.`);
    }
  };

  // Carregar e reproduzir o stream
  useEffect(() => {
    if (!resolvedStreamUrl || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = resolvedStreamUrl;
    setLoading(true);
    setErrorMessage(null);

    // Limpar HLS anterior
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Timeout de carregamento (6 segundos)
    timeoutRef.current = setTimeout(() => {
      if (loading && sourcesRef.current.length > 1 && activeSourceIndexRef.current < sourcesRef.current.length - 1) {
        handleFallback("Tempo limite de conexão");
      }
    }, 6500);

    const isHlsStream = streamUrl.includes('.m3u8') || streamUrl.includes('master') || streamUrl.includes('/hls/') || streamUrl.includes('/api/proxy');

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 6000,
        manifestLoadingMaxRetry: 1,
        fragLoadingTimeOut: 8000,
        fragLoadingMaxRetry: 1,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal Error:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              handleFallback("Erro de rede / stream fora do ar");
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              handleFallback("Falha de decodificação");
              break;
          }
        }
      });
    } else {
      video.src = streamUrl;
      video.load();

      const onCanPlay = () => {
        setLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      };

      const onError = () => {
        handleFallback("Link indisponível");
      };

      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);

      return () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resolvedStreamUrl]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isPlaying, isMuted]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'aspect-video max-h-[70vh]'
      }`}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Loading Spinner */}
      {loading && !errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white/90 font-medium text-sm">
            Conectando ao sinal ({currentSource?.nome || `Fonte ${activeSourceIndex + 1}`})...
          </p>
        </div>
      )}

      {/* Notificação de Fallback */}
      {fallbackNotice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500/95 text-black px-4 py-2 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-2 animate-pulse">
          <AlertTriangle size={16} />
          {fallbackNotice}
          <button onClick={() => setFallbackNotice(null)} className="ml-2 hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mensagem de Erro Fatal */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md z-30 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-white text-lg font-bold mb-2">Sinal Temporariamente Indisponível</h3>
          <p className="text-zinc-400 text-sm max-w-md mb-6">{errorMessage}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setActiveSourceIndex(0);
                setErrorMessage(null);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              <RotateCcw size={16} /> Tentar Novamente
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition"
              >
                Voltar à Grade
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header do Player */}
      <div 
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          {item?.logo && (
            <img 
              src={item.logo} 
              alt={item.nome || item.titulo} 
              className="w-9 h-9 object-contain bg-zinc-900/80 rounded-lg p-1 border border-white/10"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-white font-bold text-base md:text-lg drop-shadow-md">
                {item?.nome || item?.titulo}
              </h2>
            </div>
            <p className="text-zinc-400 text-xs">
              {item?.categoria} {item?.ano ? `• ${item.ano}` : ''} • Fonte {activeSourceIndex + 1} de {sources.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVOD && onAudioVersionChange && (
            <div className="bg-zinc-900/90 border border-white/10 p-1 rounded-xl flex items-center gap-1 shadow-lg">
              <button
                onClick={() => onAudioVersionChange('dublado')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  audioVersion === 'dublado'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🔊 Dublado
              </button>
              <button
                onClick={() => onAudioVersionChange('legendado')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  audioVersion === 'legendado'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                💬 Legendado
              </button>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition border border-white/10"
              title="Fechar Player (Esc)"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Controles Inferiores */}
      <div 
        className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col gap-3 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {sources.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-zinc-400 flex items-center gap-1 font-medium shrink-0">
              <Layers size={13} /> Fontes:
            </span>
            {sources.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSourceIndex(idx)}
                className={`px-2.5 py-1 rounded-md font-semibold shrink-0 transition ${
                  activeSourceIndex === idx
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {s.nome || `Fonte ${idx + 1}`} {s.qualidade ? `(${s.qualidade})` : ''}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl transition shadow-lg"
              title="Play / Pause (Espaço)"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            </button>

            <div className="flex items-center gap-2 text-white">
              <button onClick={toggleMute} className="hover:text-indigo-400 transition" title="Mudo (M)">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 md:w-24 accent-indigo-500 cursor-pointer h-1.5 rounded-lg bg-zinc-700"
              />
            </div>

            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-600/80 text-white uppercase tracking-wider">
              {isVOD ? 'VOD' : 'AO VIVO'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition border border-white/10"
              title="Tela Cheia (F)"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
