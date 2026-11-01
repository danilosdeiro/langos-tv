import React, { useEffect, useRef, useState, useMemo } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  RotateCcw, RotateCw, AlertTriangle, Layers, X, Clock,
  Minimize, Maximize, PictureInPicture, ChevronLeft, ChevronRight
} from 'lucide-react';
import { EpgService } from '../services/epgService';
import { HistoryService } from '../services/historyService';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ 
  item, 
  onClose, 
  audioVersion = 'dublado', // 'dublado' ou 'legendado'
  onAudioVersionChange,
  onOpenEpg,
  onNextChannel,
  onPrevChannel
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const timeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fallbackNotice, setFallbackNotice] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Estados de Tempo para VOD (Filmes e Séries)
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);

  // Feedback Visual na tela da TV (OSD - On-Screen Display)
  const [osdMessage, setOsdMessage] = useState(null);
  const osdTimeoutRef = useRef(null);

  const showOsd = (text) => {
    setOsdMessage(text);
    setShowControls(true);
    if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    osdTimeoutRef.current = setTimeout(() => {
      setOsdMessage(null);
    }, 2500);

    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3500);
  };

  // Ref para evitar closure stale em callbacks de eventos HLS
  const activeSourceIndexRef = useRef(0);
  activeSourceIndexRef.current = activeSourceIndex;

  // Determina se é VOD (filme ou episódio de série)
  const isVOD = !!(item?.dublado?.length || item?.legendado?.length || item?.titulo?.includes('— T'));
  
  const sources = React.useMemo(() => {
    if (!item) return [];
    if (isVOD) {
      const vodSources = audioVersion === 'legendado' ? item.legendado : item.dublado;
      if (vodSources && vodSources.length > 0) return vodSources;
      if (item.fontes && item.fontes.length > 0) return item.fontes;
      return (item.dublado && item.dublado.length > 0) ? item.dublado : (item.legendado || []);
    }
    return item.fontes || [];
  }, [item, isVOD, audioVersion]);

  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;

  const currentSource = sources[activeSourceIndex] || sources[0];

  // EPG para canais ao vivo
  const epg = useMemo(() => {
    if (isVOD || !item?.nome) return null;
    return EpgService.getProgramForChannel(item.nome, item.categoria);
  }, [item?.nome, item?.categoria, isVOD]);

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

  // Gerenciamento de troca de conteúdo e retenção de posição ao alternar áudio (Dub/Leg)
  const savedTimeRef = useRef(0);
  const prevItemIdRef = useRef(item?.id);
  const prevAudioVersionRef = useRef(audioVersion);

  const lastSavedTimeRef = useRef(0);

  useEffect(() => {
    const isDifferentItem = prevItemIdRef.current !== item?.id;
    const isDifferentAudio = prevAudioVersionRef.current !== audioVersion;

    if (isDifferentItem) {
      setActiveSourceIndex(0);
      setErrorMessage(null);
      setFallbackNotice(null);
      setCurrentTime(0);
      setDuration(0);
      setBufferedEnd(0);
      savedTimeRef.current = item?.initialSeekTime || 0;
      lastSavedTimeRef.current = 0;
    } else if (isDifferentAudio) {
      // Mesma série/filme, apenas trocando idioma do áudio: reter posição atual
      if (videoRef.current && videoRef.current.currentTime > 0) {
        savedTimeRef.current = videoRef.current.currentTime;
      }
      setActiveSourceIndex(0);
      setErrorMessage(null);
      setFallbackNotice(null);
    }

    prevItemIdRef.current = item?.id;
    prevAudioVersionRef.current = audioVersion;
  }, [item?.id, audioVersion, item?.initialSeekTime]);

  // Monitorar tempo, duração e progresso do vídeo (VOD)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered && video.buffered.length > 0) {
        try {
          setBufferedEnd(video.buffered.end(video.buffered.length - 1));
        } catch {}
      }

      // Salvar progresso a cada 4 segundos no histórico
      if (isVOD && video.duration && Math.abs(video.currentTime - lastSavedTimeRef.current) > 4) {
        lastSavedTimeRef.current = video.currentTime;
        HistoryService.saveProgress(item, video.currentTime, video.duration, audioVersion);
      }
    };

    const onDuration = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('loadedmetadata', onDuration);

    return () => {
      // Salvar progresso ao fechar o reprodutor
      if (isVOD && video.duration && video.currentTime > 15) {
        HistoryService.saveProgress(item, video.currentTime, video.duration, audioVersion);
      }
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('loadedmetadata', onDuration);
    };
  }, [isVOD, item, audioVersion]);

  // Função de Fallback automática rápida
  const handleFallback = (reason) => {
    const curIdx = activeSourceIndexRef.current;
    const allSources = sourcesRef.current;

    if (allSources.length > 1 && curIdx < allSources.length - 1) {
      const nextIndex = curIdx + 1;
      const nextSourceName = allSources[nextIndex]?.nome || `Fonte ${nextIndex + 1}`;
      setFallbackNotice(`Fonte ${curIdx + 1} oscilou (${reason}). Alternando para ${nextSourceName}...`);
      setActiveSourceIndex(nextIndex);
    } else {
      setLoading(false);
      setErrorMessage(`Todas as ${allSources.length} fontes deste canal/vídeo estão temporariamente indisponíveis.`);
    }
  };

  const isLoadedRef = useRef(false);

  // Carregar e reproduzir o stream
  useEffect(() => {
    if (!resolvedStreamUrl || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = resolvedStreamUrl;
    setLoading(true);
    setErrorMessage(null);
    isLoadedRef.current = false;

    // Limpar HLS anterior
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Timeout de conexão rápido (6.5 segundos para fallback ágil)
    timeoutRef.current = setTimeout(() => {
      if (!isLoadedRef.current && sourcesRef.current.length > 1 && activeSourceIndexRef.current < sourcesRef.current.length - 1) {
        handleFallback("Tempo limite de resposta");
      }
    }, 6500);

    // Detectar se o vídeo é MP4 ou HLS baseado na URL real da fonte
    const rawTarget = (currentSource?.url || '').toLowerCase();
    const isMp4 = rawTarget.includes('.mp4') || rawTarget.includes('.mkv') || rawTarget.includes('.webm');
    const isHlsStream = !isMp4 && (
      rawTarget.includes('.m3u8') || 
      rawTarget.includes('master') || 
      rawTarget.includes('/hls/') || 
      rawTarget.includes('.txt') ||
      rawTarget.includes('live') ||
      rawTarget.includes('stream') ||
      (!rawTarget.includes('.') && streamUrl.includes('/api/proxy'))
    );

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
        isLoadedRef.current = true;
        setLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (savedTimeRef.current > 0) {
          try { video.currentTime = savedTimeRef.current; } catch {}
          savedTimeRef.current = 0;
        }
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        isLoadedRef.current = true;
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal Error:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              handleFallback("Erro de rede / stream indisponível");
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
      // Reprodução nativa de vídeo (MP4/WebM)
      video.src = streamUrl;
      video.load();

      const onCanPlay = () => {
        isLoadedRef.current = true;
        setLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (savedTimeRef.current > 0) {
          try { video.currentTime = savedTimeRef.current; } catch {}
          savedTimeRef.current = 0;
        }
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      };

      const onError = () => {
        handleFallback("Link indisponível");
      };

      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('loadedmetadata', onCanPlay);
      video.addEventListener('error', onError);

      return () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('loadedmetadata', onCanPlay);
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

  // Pular tempo (-10s / +10s)
  const skipTime = (seconds) => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime || 0;
    const dur = videoRef.current.duration || duration || 999999;
    const newTime = Math.min(Math.max(0, cur + seconds), dur);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Barra de progresso (Seek)
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Atalhos de teclado e Controle Remoto de TV (BTV / Android TV / Fire TV)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type !== 'range') return;
      
      const key = e.key;
      const keyCode = e.keyCode;

      // Play / Pause (Espaço, Enter, PlayPause no controle)
      if (key === ' ' || e.code === 'Space' || key === 'Enter' || key === 'Select' || keyCode === 13 || keyCode === 179 || keyCode === 250 || keyCode === 19) {
        // Se estiver focado em um botão de controle específico dentro do player, deixar o clique natural
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        togglePlay();
        showOsd(videoRef.current?.paused ? '⏸️ Vídeo Pausado' : '▶️ Reproduzindo');
      } 
      // Fullscreen (Tecla F)
      else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } 
      // Mute (Tecla M)
      else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } 
      // Navegação Horizontal (Seek no VOD)
      else if (key === 'ArrowLeft' || keyCode === 37) {
        if (isVOD) {
          e.preventDefault();
          skipTime(-10);
          showOsd('⏪ -10s');
        }
      } else if (key === 'ArrowRight' || keyCode === 39) {
        if (isVOD) {
          e.preventDefault();
          skipTime(10);
          showOsd('⏩ +10s');
        }
      } 
      // Navegação Vertical: Troca de canais no controle remoto do BTV
      else if (key === 'ArrowUp' || keyCode === 38 || key === 'ChannelUp' || keyCode === 427 || keyCode === 33) {
        if (!isVOD && onPrevChannel) {
          e.preventDefault();
          onPrevChannel();
          showOsd('⬆️ Canal Anterior');
        } else {
          showOsd(item?.nome || item?.titulo || 'Vídeo');
        }
      } else if (key === 'ArrowDown' || keyCode === 40 || key === 'ChannelDown' || keyCode === 428 || keyCode === 34) {
        if (!isVOD && onNextChannel) {
          e.preventDefault();
          onNextChannel();
          showOsd('⬇️ Próximo Canal');
        } else {
          showOsd(item?.nome || item?.titulo || 'Vídeo');
        }
      } 
      // Voltar / Fechar (ESC, Backspace, Back Android TV)
      else if (key === 'Escape' || key === 'Backspace' || key === 'GoBack' || keyCode === 27 || keyCode === 8 || keyCode === 4 || keyCode === 10009 || keyCode === 461) {
        e.preventDefault();
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isPlaying, isMuted, duration, isVOD, onNextChannel, onPrevChannel, onClose, item]);

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
      data-tv-player="true"
      onMouseMove={handleMouseMove}
      className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none h-screen' 
          : isFloating
            ? 'fixed bottom-6 right-6 w-80 md:w-96 aspect-video z-50 rounded-2xl shadow-2xl border-2 border-indigo-500/60 ring-4 ring-black/60 animate-fadeIn'
            : 'aspect-video max-h-[70vh]'
      }`}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* OSD - Feedback Visual na Tela para Controle Remoto de BTV / TV Box */}
      {osdMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-zinc-950/90 backdrop-blur-md border border-indigo-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm md:text-base font-extrabold animate-osd pointer-events-none ring-2 ring-indigo-500/20">
          <Tv size={22} className="text-indigo-400" />
          <span>{osdMessage}</span>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && !errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-white/90 font-medium text-xs md:text-sm">
            Conectando ({currentSource?.nome || `Fonte ${activeSourceIndex + 1}`})...
          </p>
        </div>
      )}

      {/* Aviso de Fallback automático */}
      {fallbackNotice && !errorMessage && (
        <div className="absolute top-16 inset-x-0 mx-auto w-fit max-w-[90%] bg-amber-500/90 text-black font-semibold text-xs px-4 py-2 rounded-full shadow-lg z-20 animate-fadeIn flex items-center gap-2">
          <span>{fallbackNotice}</span>
          <button onClick={() => setFallbackNotice(null)} className="font-bold ml-1">✕</button>
        </div>
      )}

      {/* Mensagem de Erro Fatal */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md z-30 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-white text-base md:text-lg font-bold mb-1.5">Sinal Temporariamente Indisponível</h3>
          <p className="text-zinc-400 text-xs md:text-sm max-w-md mb-5">{errorMessage}</p>
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setActiveSourceIndex(0);
                setErrorMessage(null);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <RotateCcw size={14} /> Tentar Novamente
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition"
              >
                Fechar Player
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header do Player */}
      <div 
        className={`absolute top-0 inset-x-0 p-3 md:p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5 max-w-[70%]">
          {item?.logo && (
            <img 
              src={item.logo} 
              alt={item.nome || item.titulo} 
              className="w-8 h-8 object-contain bg-zinc-900/80 rounded-lg p-1 border border-white/10 shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <h2 className="text-white font-bold text-xs md:text-sm drop-shadow-md truncate">
                {item?.titulo || item?.nome}
              </h2>
            </div>
            
            {epg ? (
              <button
                onClick={() => onOpenEpg && onOpenEpg(item)}
                className="flex items-center gap-1.5 text-[11px] text-zinc-300 truncate mt-0.5 hover:text-white transition group text-left cursor-pointer"
                title="Clique para abrir a grade completa de 24 horas deste canal"
              >
                <Clock size={11} className="text-indigo-400 group-hover:text-indigo-300 shrink-0" />
                <span className="text-indigo-300 font-semibold truncate group-hover:underline">
                  {epg.title} ({epg.start} - {epg.end})
                </span>
              </button>
            ) : (
              <p className="text-zinc-400 text-[11px] truncate">
                {item?.categoria} {item?.ano ? `• ${item.ano}` : ''} • Fonte {activeSourceIndex + 1} de {sources.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Navegação Rápida entre Canais Ao Vivo */}
          {!isVOD && (onPrevChannel || onNextChannel) && (
            <div className="flex items-center gap-1 mr-1">
              {onPrevChannel && (
                <button
                  onClick={onPrevChannel}
                  className="p-1.5 md:p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition border border-white/10"
                  title="Canal Anterior"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              {onNextChannel && (
                <button
                  onClick={onNextChannel}
                  className="p-1.5 md:p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition border border-white/10"
                  title="Próximo Canal"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
          {isVOD && onAudioVersionChange && (item?.dublado?.length > 0 || item?.legendado?.length > 0) && (
            <div className="bg-zinc-900/90 border border-white/10 p-0.5 rounded-xl flex items-center gap-1 shadow-lg">
              <button
                onClick={() => onAudioVersionChange('dublado')}
                disabled={!item?.dublado?.length}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                  !item?.dublado?.length 
                    ? 'opacity-40 cursor-not-allowed text-zinc-500' 
                    : audioVersion === 'dublado'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                }`}
                title={item?.dublado?.length ? "Áudio Dublado" : "Áudio Dublado Indisponível"}
              >
                🔊 Dub
              </button>
              <button
                onClick={() => onAudioVersionChange('legendado')}
                disabled={!item?.legendado?.length}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                  !item?.legendado?.length 
                    ? 'opacity-40 cursor-not-allowed text-zinc-500' 
                    : audioVersion === 'legendado'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                }`}
                title={item?.legendado?.length ? "Áudio Legendado" : "Áudio Legendado Indisponível"}
              >
                💬 Leg
              </button>
            </div>
          )}

          {/* Botão Minimizar / Modo Flutuante (Permite navegar no site sem fechar o vídeo) */}
          <button
            onClick={() => setIsFloating(!isFloating)}
            className={`p-1.5 md:p-2 rounded-xl transition border border-white/10 ${
              isFloating 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title={isFloating ? 'Expandir para Tela Normal' : 'Modo Flutuante / Minimizar para navegar no site'}
          >
            {isFloating ? <Maximize size={16} /> : <PictureInPicture size={16} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 md:p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition border border-white/10"
              title="Fechar Player (Esc)"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Controles Inferiores */}
      <div 
        className={`absolute bottom-0 inset-x-0 p-3 md:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex flex-col gap-2.5 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Barra de Linha do Tempo / Adiantar Episódio (VOD: Séries e Filmes) */}
        {isVOD && (
          <div className="flex items-center gap-2.5 w-full group/timeline">
            <span className="text-[10px] md:text-xs font-mono font-medium text-zinc-300 min-w-[36px] text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center h-4 cursor-pointer">
              {/* Barra de Fundo Cinza */}
              <div className="absolute inset-x-0 h-1 md:h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                {/* Buffer */}
                <div 
                  className="h-full bg-zinc-600/40 rounded-full"
                  style={{ width: `${duration > 0 ? (bufferedEnd / duration) * 100 : 0}%` }}
                />
              </div>

              {/* Slider de Busca */}
              <input
                type="range"
                min="0"
                max={duration > 0 ? duration : 100}
                step="0.5"
                value={currentTime}
                onChange={handleSeek}
                className="w-full absolute inset-0 opacity-0 cursor-pointer z-20"
              />

              {/* Barra Colorida Preenchida */}
              <div 
                className="h-1 md:h-1.5 bg-indigo-500 rounded-full pointer-events-none relative"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 bg-white rounded-full shadow-md"></div>
              </div>
            </div>

            <span className="text-[10px] md:text-xs font-mono font-medium text-zinc-400 min-w-[36px]">
              {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Lista de Fontes Alternativas */}
        {sources.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-zinc-400 flex items-center gap-1 font-medium shrink-0 text-[11px]">
              <Layers size={12} /> Fontes:
            </span>
            {sources.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSourceIndex(idx)}
                className={`px-2 py-0.5 rounded-md font-semibold shrink-0 transition text-[11px] ${
                  activeSourceIndex === idx
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {s.nome || `Fonte ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Linha de Botões de Ação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="p-2 md:p-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl transition shadow-lg shrink-0"
              title="Play / Pause (Espaço)"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
            </button>

            {/* Pular -10s e +10s (Apenas para Filmes e Séries) */}
            {isVOD && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => skipTime(-10)}
                  className="p-1.5 md:p-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition border border-white/5"
                  title="Voltar 10 segundos (Seta Esquerda)"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => skipTime(10)}
                  className="p-1.5 md:p-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition border border-white/5"
                  title="Avançar 10 segundos (Seta Direita)"
                >
                  <RotateCw size={15} />
                </button>
              </div>
            )}

            {/* Volume */}
            <div className="flex items-center gap-1.5 text-white">
              <button onClick={toggleMute} className="hover:text-indigo-400 transition" title="Mudo (M)">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 md:w-20 accent-indigo-500 cursor-pointer h-1.5 rounded-lg bg-zinc-700 hidden sm:inline-block"
              />
            </div>

            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
              isVOD ? 'bg-purple-600/80 text-white' : 'bg-red-600/90 text-white'
            }`}>
              {isVOD ? 'VOD' : 'AO VIVO'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Modo Flutuante */}
            <button
              onClick={() => setIsFloating(!isFloating)}
              className="p-1.5 md:p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition border border-white/10"
              title={isFloating ? 'Restaurar Player' : 'Modo Flutuante (Mini-Player)'}
            >
              <PictureInPicture size={16} />
            </button>

            {/* Tela Cheia */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 md:p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white transition border border-white/10"
              title="Tela Cheia (F)"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
