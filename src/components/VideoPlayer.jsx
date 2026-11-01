import React, { useEffect, useRef, useState, useMemo } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  RotateCcw, RotateCw, AlertTriangle, Layers, X, Clock,
  Minimize, Maximize, PictureInPicture, ChevronLeft, ChevronRight, Tv,
  MessageSquare
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
  onPrevChannel,
  channels = [],
  onSelectChannel,
  onPlayNextEpisode
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const timeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('langos_muted') === 'true';
  });
  const [volume, setVolume] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const v = localStorage.getItem('langos_volume');
    return v !== null ? parseFloat(v) : 1;
  });
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

  // Guia Rápido de Canais Dentro do Player
  const [isChannelDrawerOpen, setIsChannelDrawerOpen] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState('Todos');

  // Prompt "Continuar de onde parou"
  const [resumePrompt, setResumePrompt] = useState(null);

  // Próximo Episódio para Séries
  const [showNextEpCard, setShowNextEpCard] = useState(false);
  const [nextEpCountdown, setNextEpCountdown] = useState(10);
  const nextEpTimerRef = useRef(null);

  // Tentativa de resgate com proxy se a fonte direta falhar
  const [forceProxyForCurrent, setForceProxyForCurrent] = useState(false);

  // Teclado Numérico para BTV (Digitação de Canal no controle remoto)
  const [channelInput, setChannelInput] = useState('');
  const channelInputRef = useRef('');
  const channelInputTimeoutRef = useRef(null);

  // Banner Informativo de Transmissão (Mini EPG ao trocar canal ou pressionar OK / Info)
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const infoBannerTimeoutRef = useRef(null);

  const triggerInfoBanner = () => {
    setShowInfoBanner(true);
    if (infoBannerTimeoutRef.current) clearTimeout(infoBannerTimeoutRef.current);
    infoBannerTimeoutRef.current = setTimeout(() => {
      setShowInfoBanner(false);
    }, 4500);
  };

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

  const currentChannelNumber = useMemo(() => {
    if (isVOD || !channels?.length || !item?.id) return null;
    const idx = channels.findIndex(c => c.id === item.id);
    return idx !== -1 ? idx + 1 : null;
  }, [channels, item?.id, isVOD]);

  const handleSwitchSource = () => {
    const allSources = sourcesRef.current;
    if (!allSources || allSources.length <= 1) {
      showOsd('Apenas 1 fonte disponível');
      return;
    }
    const nextIdx = (activeSourceIndexRef.current + 1) % allSources.length;
    setActiveSourceIndex(nextIdx);
    setForceProxyForCurrent(false);
    showOsd(`Alternado: Fonte ${nextIdx + 1} de ${allSources.length}`);
  };

  const currentSource = sources[activeSourceIndex] || sources[0];

  // EPG para canais ao vivo
  const epg = useMemo(() => {
    if (isVOD || !item?.nome) return null;
    return EpgService.getProgramForChannel(item.nome, item.categoria);
  }, [item?.nome, item?.categoria, isVOD]);

  // Resolver URL: Se for HTTP em HTTPS, exigir referer ou se foi solicitado resgate por proxy
  const resolvedStreamUrl = React.useMemo(() => {
    if (!currentSource?.url) return '';
    const rawUrl = currentSource.url;
    const isPageHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    if (forceProxyForCurrent || (isPageHttps && rawUrl.startsWith('http://')) || currentSource.referer || rawUrl.includes('.txt')) {
      let proxy = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
      if (currentSource.referer) proxy += `&referer=${encodeURIComponent(currentSource.referer)}`;
      return proxy;
    }
    return rawUrl;
  }, [currentSource, forceProxyForCurrent]);

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
      setForceProxyForCurrent(false);
      setErrorMessage(null);
      setFallbackNotice(null);
      setCurrentTime(0);
      setDuration(0);
      setBufferedEnd(0);
      savedTimeRef.current = item?.initialSeekTime || 0;
      lastSavedTimeRef.current = 0;
      setShowNextEpCard(false);

      // Se for VOD e tiver progresso anterior no histórico, exibir opção amigável de Continuar
      if (isVOD && !item?.initialSeekTime) {
        const saved = HistoryService.getProgress(item?.id);
        if (saved && saved.currentTime > 25 && saved.duration && saved.currentTime < saved.duration * 0.92) {
          setResumePrompt({
            seconds: saved.currentTime,
            formatted: formatTime(saved.currentTime)
          });
          setTimeout(() => setResumePrompt(null), 8500);
        } else {
          setResumePrompt(null);
        }
      } else {
        setResumePrompt(null);
        triggerInfoBanner();
      }
    } else if (isDifferentAudio) {
      // Mesma série/filme, apenas trocando idioma do áudio: reter posição atual
      if (videoRef.current && videoRef.current.currentTime > 0) {
        savedTimeRef.current = videoRef.current.currentTime;
      }
      setActiveSourceIndex(0);
      setForceProxyForCurrent(false);
      setErrorMessage(null);
      setFallbackNotice(null);
    }

    prevItemIdRef.current = item?.id;
    prevAudioVersionRef.current = audioVersion;
  }, [item?.id, audioVersion, item?.initialSeekTime, isVOD]);

  // Sincronizar audioVersion com o que o item realmente possui no catálogo
  useEffect(() => {
    if (!isVOD || !item) return;
    const hasDub = item.dublado && item.dublado.length > 0;
    const hasLeg = item.legendado && item.legendado.length > 0;
    if (hasDub && !hasLeg && audioVersion !== 'dublado') {
      onAudioVersionChange?.('dublado');
    } else if (!hasDub && hasLeg && audioVersion !== 'legendado') {
      onAudioVersionChange?.('legendado');
    }
  }, [item?.id, item?.dublado, item?.legendado, isVOD, audioVersion, onAudioVersionChange]);

  // Alternar entre modo flutuante na página e Picture-in-Picture nativo do navegador
  const handleTogglePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsFloating(false);
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      } else {
        setIsFloating(prev => !prev);
      }
    } catch {
      // Se a API nativa falhar ou não for suportada, ativar o mini-player flutuante da página
      setIsFloating(prev => !prev);
    }
  };

  // Próximo episódio para Séries
  const nextEpisode = useMemo(() => {
    if (!item?.allEpisodes || !item?.currentSeason || !item?.currentEpisode) return null;
    const s = item.currentSeason;
    const e = item.currentEpisode;
    let next = item.allEpisodes.find(ep => ep.season === s && ep.episode === e + 1);
    if (!next) {
      next = item.allEpisodes.find(ep => ep.season === s + 1 && ep.episode === 1);
    }
    return next;
  }, [item?.allEpisodes, item?.currentSeason, item?.currentEpisode]);

  // Drawer de Canais
  const drawerCategories = useMemo(() => {
    if (!channels || !channels.length) return ['Todos'];
    const cats = new Set(['Todos']);
    channels.forEach(c => {
      if (c.categoria) cats.add(c.categoria);
    });
    return Array.from(cats);
  }, [channels]);

  const drawerChannels = useMemo(() => {
    if (!channels) return [];
    if (drawerCategory === 'Todos') return channels;
    return channels.filter(c => c.categoria === drawerCategory);
  }, [channels, drawerCategory]);

  const handleExecuteNextEpisode = () => {
    if (!nextEpisode || !item?.seriesData) return;
    setShowNextEpCard(false);

    const dubUrls = (nextEpisode.audio === 'dublado' && nextEpisode.allUrls) ? nextEpisode.allUrls : [nextEpisode.url];
    const legUrls = (nextEpisode.audio === 'legendado' && nextEpisode.allUrls) ? nextEpisode.allUrls : [nextEpisode.url];

    const dubSources = nextEpisode.audio === 'dublado' ? dubUrls.map((u, i) => ({
      nome: `Dublado - Fonte ${i + 1}`,
      url: u,
      qualidade: 'FHD',
      audio: 'dublado'
    })) : [];

    const legSources = nextEpisode.audio === 'legendado' ? legUrls.map((u, i) => ({
      nome: `Legendado - Fonte ${i + 1}`,
      url: u,
      qualidade: 'FHD',
      audio: 'legendado'
    })) : [];

    const nextPayload = {
      id: `ep-${item.seriesData.id}-${nextEpisode.season}-${nextEpisode.episode}`,
      titulo: `${item.seriesData.titulo} — T${nextEpisode.season}:E${nextEpisode.episode}`,
      categoria: item.seriesData.categoria || 'Série',
      capa: item.seriesData.capa || '',
      fontes: (audioVersion === 'legendado' && legSources.length > 0) ? legSources : (dubSources.length > 0 ? dubSources : legSources),
      dublado: dubSources,
      legendado: legSources,
      allEpisodes: item.allEpisodes,
      currentSeason: nextEpisode.season,
      currentEpisode: nextEpisode.episode,
      seriesData: item.seriesData
    };

    if (onPlayNextEpisode) {
      onPlayNextEpisode(nextPayload, audioVersion);
    }
  };

  // Monitorar aproximação do final para exibir card de próximo episódio
  useEffect(() => {
    if (!isVOD || !nextEpisode || !duration || duration < 60) {
      setShowNextEpCard(false);
      return;
    }
    const remaining = duration - currentTime;
    if (remaining <= 25 && currentTime > 15) {
      if (!showNextEpCard) {
        setShowNextEpCard(true);
        setNextEpCountdown(10);
      }
    } else {
      setShowNextEpCard(false);
    }
  }, [isVOD, nextEpisode, duration, currentTime, showNextEpCard]);

  // Contagem regressiva para próximo episódio
  useEffect(() => {
    if (!showNextEpCard) {
      if (nextEpTimerRef.current) clearInterval(nextEpTimerRef.current);
      return;
    }

    nextEpTimerRef.current = setInterval(() => {
      setNextEpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(nextEpTimerRef.current);
          handleExecuteNextEpisode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (nextEpTimerRef.current) clearInterval(nextEpTimerRef.current);
    };
  }, [showNextEpCard]);

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

    const onEnded = () => {
      if (nextEpisode) {
        handleExecuteNextEpisode();
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('loadedmetadata', onDuration);
    video.addEventListener('ended', onEnded);

    return () => {
      // Salvar progresso ao fechar o reprodutor
      if (isVOD && video.duration && video.currentTime > 15) {
        HistoryService.saveProgress(item, video.currentTime, video.duration, audioVersion);
      }
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('loadedmetadata', onDuration);
      video.removeEventListener('ended', onEnded);
    };
  }, [isVOD, item, audioVersion, nextEpisode]);

  // Função de Fallback automática rápida e inteligente
  const handleFallback = (reason) => {
    const curIdx = activeSourceIndexRef.current;
    const allSources = sourcesRef.current;

    // Se a fonte direta falhou por bloqueio de CORS do navegador, tentar via Proxy Seguro antes de pular a fonte
    if (!forceProxyForCurrent && resolvedStreamUrl && !resolvedStreamUrl.includes('/api/proxy')) {
      setFallbackNotice(`Fonte ${curIdx + 1} bloqueada pelo navegador. Redirecionando via Proxy...`);
      setForceProxyForCurrent(true);
      return;
    }

    if (allSources.length > 1 && curIdx < allSources.length - 1) {
      const nextIndex = curIdx + 1;
      const nextSourceName = allSources[nextIndex]?.nome || `Fonte ${nextIndex + 1}`;
      setFallbackNotice(`Fonte ${curIdx + 1} oscilou (${reason}). Alternando para ${nextSourceName}...`);
      setForceProxyForCurrent(false);
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

    // Timeout de conexão rápido (3.8 segundos para fallback instantâneo sem travamentos)
    timeoutRef.current = setTimeout(() => {
      if (!isLoadedRef.current && (sourcesRef.current.length > 1 || !forceProxyForCurrent)) {
        handleFallback("Tempo limite de resposta");
      }
    }, 3800);

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

      // Se estava digitando um número de canal e apertou Enter/OK: sintonizar imediatamente!
      if (channelInputRef.current && (key === 'Enter' || keyCode === 13 || keyCode === 250)) {
        e.preventDefault();
        if (channelInputTimeoutRef.current) clearTimeout(channelInputTimeoutRef.current);
        const num = parseInt(channelInputRef.current, 10);
        if (num > 0 && num <= channels.length) {
          const targetCh = channels[num - 1];
          if (onSelectChannel) onSelectChannel(targetCh);
          showOsd(`📡 Canal ${num}: ${targetCh.nome}`);
        } else {
          showOsd(`⚠️ Canal ${num} não encontrado`);
        }
        setChannelInput('');
        channelInputRef.current = '';
        return;
      }

      // Digitação Numérica de Canal (0-9 no controle do BTV)
      if (!isVOD && channels?.length && ((key >= '0' && key <= '9') || (keyCode >= 96 && keyCode <= 105))) {
        e.preventDefault();
        const digit = (keyCode >= 96 && keyCode <= 105) ? String(keyCode - 96) : key;
        const newBuf = (channelInputRef.current + digit).slice(0, 3);
        setChannelInput(newBuf);
        channelInputRef.current = newBuf;

        if (channelInputTimeoutRef.current) clearTimeout(channelInputTimeoutRef.current);
        channelInputTimeoutRef.current = setTimeout(() => {
          const num = parseInt(channelInputRef.current, 10);
          if (num > 0 && num <= channels.length) {
            const targetCh = channels[num - 1];
            if (onSelectChannel) onSelectChannel(targetCh);
            showOsd(`📡 Canal ${num}: ${targetCh.nome}`);
          } else {
            showOsd(`⚠️ Canal ${num} não encontrado`);
          }
          setChannelInput('');
          channelInputRef.current = '';
        }, 1200);
        return;
      }

      // Play / Pause (Espaço, Enter, PlayPause no controle)
      if (key === ' ' || e.code === 'Space' || key === 'Enter' || key === 'Select' || keyCode === 13 || keyCode === 179 || keyCode === 250 || keyCode === 19) {
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        if (!isVOD) {
          // Em canais ao vivo, pressionar Enter exibe o Banner EPG da emissora
          triggerInfoBanner();
        } else {
          togglePlay();
          showOsd(videoRef.current?.paused ? '⏸️ Vídeo Pausado' : '▶️ Reproduzindo');
        }
      } 
      // Tecla Info / Tecla I
      else if (e.code === 'KeyI' || keyCode === 457) {
        e.preventDefault();
        triggerInfoBanner();
      }
      // Botão Amarelo no controle (405) ou Tecla S: Alternar Fonte
      else if (e.code === 'KeyS' || keyCode === 405) {
        e.preventDefault();
        handleSwitchSource();
      }
      // Botão Azul no controle (406) ou Tecla A: Alternar Áudio ou Abrir EPG
      else if (e.code === 'KeyA' || keyCode === 406) {
        e.preventDefault();
        if (isVOD && onAudioVersionChange) {
          const nextAudio = audioVersion === 'dublado' ? 'legendado' : 'dublado';
          if (nextAudio === 'legendado' && item?.legendado?.length) {
            onAudioVersionChange('legendado');
            showOsd('💬 Áudio: Legendado');
          } else if (item?.dublado?.length) {
            onAudioVersionChange('dublado');
            showOsd('🔊 Áudio: Dublado');
          }
        } else if (!isVOD && onOpenEpg && item) {
          onOpenEpg(item);
        }
      }
      // Fullscreen (Tecla F ou Botão Verde 404)
      else if (e.code === 'KeyF' || keyCode === 404) {
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
          triggerInfoBanner();
        } else {
          showOsd(item?.nome || item?.titulo || 'Vídeo');
        }
      } else if (key === 'ArrowDown' || keyCode === 40 || key === 'ChannelDown' || keyCode === 428 || keyCode === 34) {
        if (!isVOD && onNextChannel) {
          e.preventDefault();
          onNextChannel();
          triggerInfoBanner();
        } else {
          showOsd(item?.nome || item?.titulo || 'Vídeo');
        }
      } 
      // Tecla G ou Botão Vermelho (403): Abrir / Fechar Guia Rápido de Canais
      else if (e.code === 'KeyG' || keyCode === 403) {
        if (!isVOD && channels?.length) {
          e.preventDefault();
          setIsChannelDrawerOpen(prev => !prev);
        }
      }
      // Voltar / Fechar (ESC, Backspace, Back Android TV)
      else if (key === 'Escape' || key === 'Backspace' || key === 'GoBack' || keyCode === 27 || keyCode === 8 || keyCode === 4 || keyCode === 10009 || keyCode === 461) {
        e.preventDefault();
        if (isChannelDrawerOpen) {
          setIsChannelDrawerOpen(false);
          return;
        }
        if (showNextEpCard) {
          setShowNextEpCard(false);
          return;
        }
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isPlaying, isMuted, duration, isVOD, onNextChannel, onPrevChannel, onClose, item, isChannelDrawerOpen, showNextEpCard, channels, audioVersion, onAudioVersionChange, onOpenEpg, onSelectChannel]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isChannelDrawerOpen) setShowControls(false);
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
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    try { localStorage.setItem('langos_muted', nextMuted ? 'true' : 'false'); } catch {}
    showOsd(nextMuted ? '🔇 Áudio Mudo' : `🔊 Volume: ${Math.round(volume * 100)}%`);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    try { localStorage.setItem('langos_volume', val.toString()); } catch {}
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
      try { localStorage.setItem('langos_muted', val === 0 ? 'true' : 'false'); } catch {}
    }
    showOsd(`🔊 Volume: ${Math.round(val * 100)}%`);
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
            ? 'fixed bottom-6 right-6 w-80 md:w-96 aspect-video z-40 rounded-2xl shadow-2xl border-2 border-indigo-500/60 ring-4 ring-black/80 animate-fadeIn'
            : 'aspect-video max-h-[70vh]'
      }`}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Mini Barra Superior no Modo Flutuante */}
      {isFloating && (
        <div className="absolute top-2 inset-x-2 z-30 flex items-center justify-between bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
          <span className="text-[11px] font-bold text-white truncate max-w-[200px] drop-shadow">
            {item?.nome || item?.titulo}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsFloating(false)}
              className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow"
              title="Restaurar Player Principal"
            >
              <Maximize size={13} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                title="Fechar Player"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* OSD - Feedback Visual na Tela para Controle Remoto de BTV / TV Box */}
      {osdMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-zinc-950/90 backdrop-blur-md border border-indigo-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm md:text-base font-extrabold animate-osd pointer-events-none ring-2 ring-indigo-500/20">
          <Tv size={22} className="text-indigo-400" />
          <span>{osdMessage}</span>
        </div>
      )}

      {/* Overlay de Digitação de Canal (Teclado Numérico do BTV) */}
      {channelInput && (
        <div className="absolute top-16 right-6 z-40 bg-indigo-600/95 backdrop-blur-xl text-white font-mono font-black text-2xl md:text-3xl px-5 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-pulse pointer-events-none ring-4 ring-indigo-500/30">
          <span className="text-xs uppercase tracking-wider font-sans font-bold text-indigo-200">Canal:</span>
          <span>{channelInput}</span>
        </div>
      )}

      {/* TV Broadcast Info Banner (Mini EPG ao trocar canal ou pressionar Tecla INFO / OK) */}
      {!isVOD && showInfoBanner && (
        <div 
          className="absolute bottom-16 inset-x-4 sm:inset-x-8 md:inset-x-12 z-30 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-fadeIn pointer-events-none"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Informações do Canal */}
            <div className="flex items-center gap-3.5 min-w-0">
              {currentChannelNumber && (
                <div className="bg-indigo-600 text-white font-mono font-black text-sm md:text-base px-2.5 py-1 rounded-xl shadow-md shrink-0">
                  #{currentChannelNumber}
                </div>
              )}
              {item?.logo && (
                <div className="w-10 h-10 rounded-xl bg-zinc-900 p-1 border border-white/10 shrink-0 flex items-center justify-center">
                  <img src={item.logo} alt={item.nome} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-black text-sm md:text-base truncate drop-shadow">{item?.nome}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 shrink-0">
                    {item?.categoria || 'Ao Vivo'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {currentSource?.qualidade || 'FHD'}
                  </span>
                </div>
                {epg && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-indigo-300 truncate max-w-[280px] sm:max-w-md">
                      ▶ {epg.title}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      ({epg.start} - {epg.end})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Programa a seguir & Atalhos do controle */}
            <div className="flex flex-col md:items-end justify-center shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
              {epg?.nextTitle && (
                <p className="text-[11px] text-zinc-400 truncate max-w-xs mb-1">
                  A seguir: <span className="text-zinc-200 font-semibold">{epg.nextTitle}</span> <span className="text-zinc-500 font-mono">({epg.nextStart})</span>
                </p>
              )}
              <div className="flex items-center gap-2.5 text-[10px] text-zinc-400 font-semibold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> [G] Guia</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> [S] Fonte</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> [F] Tela Cheia</span>
              </div>
            </div>
          </div>

          {/* Barra de Progresso do Programa Atual */}
          {epg && (
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${epg.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Prompt de Retomar Vídeo */}
      {resumePrompt && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 backdrop-blur-md border border-indigo-500/40 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn">
          <Clock size={16} className="text-indigo-400 shrink-0" />
          <span className="text-xs font-medium">
            Continuar assistindo de <strong>{resumePrompt.formatted}</strong>?
          </span>
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = resumePrompt.seconds;
                  setCurrentTime(resumePrompt.seconds);
                }
                setResumePrompt(null);
                showOsd(`▶️ Continuando de ${resumePrompt.formatted}`);
              }}
              data-tv-focus="true"
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-md"
            >
              Continuar
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
                setResumePrompt(null);
                showOsd('⏮️ Reiniciado do início');
              }}
              data-tv-focus="true"
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-[11px] rounded-lg"
            >
              Do Início
            </button>
          </div>
        </div>
      )}

      {/* Card Flutuante de Próximo Episódio (Séries) */}
      {showNextEpCard && nextEpisode && (
        <div className="absolute bottom-16 right-4 z-40 bg-zinc-950/95 backdrop-blur-md border border-purple-500/50 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-sm animate-fadeIn ring-2 ring-purple-500/20">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
            {nextEpCountdown}s
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">A Seguir</span>
            <h4 className="text-xs font-bold truncate">T{nextEpisode.season}:E{nextEpisode.episode} {nextEpisode.nome ? `• ${nextEpisode.nome}` : ''}</h4>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleExecuteNextEpisode}
              data-tv-focus="true"
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
            >
              <Play size={12} fill="currentColor" />
              <span>Assistir</span>
            </button>
            <button
              onClick={() => setShowNextEpCard(false)}
              data-tv-focus="true"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
              title="Cancelar"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Drawer Guia Rápido de Canais */}
      {isChannelDrawerOpen && (
        <div 
          className="absolute inset-y-0 left-0 w-72 sm:w-80 bg-zinc-950/95 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col p-3 shadow-2xl animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
              <Tv size={14} className="text-indigo-400" /> Guia Rápido de Canais
            </h3>
            <button
              onClick={() => setIsChannelDrawerOpen(false)}
              data-tv-focus="true"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              title="Fechar Guia"
            >
              <X size={15} />
            </button>
          </div>

          {/* Categorias no Drawer */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none mb-2">
            {drawerCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setDrawerCategory(cat)}
                data-tv-focus="true"
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition shrink-0 ${
                  drawerCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Lista de Canais com EPG Passando Agora */}
          <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none pr-1">
            {drawerChannels.map(ch => {
              const chEpg = EpgService.getProgramForChannel(ch.nome, ch.categoria);
              const isCurrentCh = ch.id === item?.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    if (onSelectChannel) onSelectChannel(ch);
                    setIsChannelDrawerOpen(false);
                  }}
                  data-tv-focus="true"
                  className={`w-full p-2 rounded-xl text-left transition flex items-center gap-2.5 border ${
                    isCurrentCh
                      ? 'bg-indigo-600/25 border-indigo-500/50 text-white ring-1 ring-indigo-500/30'
                      : 'bg-zinc-900/60 hover:bg-zinc-800 border-white/5 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 shrink-0 overflow-hidden p-0.5 flex items-center justify-center border border-white/5">
                    {ch.logo ? (
                      <img src={ch.logo} alt={ch.nome} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span className="text-[10px] font-bold">{ch.nome.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block truncate">{ch.nome}</span>
                    {chEpg && (
                      <span className="text-[10px] text-zinc-400 truncate block">
                        {chEpg.title}
                      </span>
                    )}
                  </div>
                  {isCurrentCh && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  )}
                </button>
              );
            })}
          </div>
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
          {/* Guia Rápido de Canais Dentro do Player */}
          {!isVOD && channels && channels.length > 0 && (
            <button
              onClick={() => setIsChannelDrawerOpen(!isChannelDrawerOpen)}
              data-tv-focus="true"
              className={`p-1.5 md:p-2 rounded-xl transition border border-white/10 flex items-center gap-1.5 text-xs font-bold mr-1 ${
                isChannelDrawerOpen 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
              title="Guia Rápido de Canais (Tecla G)"
            >
              <Tv size={15} className="text-indigo-400" />
              <span className="hidden md:inline">Guia de Canais</span>
            </button>
          )}

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
                onClick={() => {
                  if (item?.dublado?.length) {
                    onAudioVersionChange('dublado');
                    showOsd('🔊 Áudio: Dublado');
                  }
                }}
                disabled={!item?.dublado?.length}
                data-tv-focus="true"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                  !item?.dublado?.length 
                    ? 'opacity-35 cursor-not-allowed text-zinc-500 bg-zinc-900/40' 
                    : (audioVersion === 'dublado' && item?.dublado?.length)
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={item?.dublado?.length ? "Áudio Dublado em Português" : "Áudio Dublado Indisponível"}
              >
                <Volume2 size={13} />
                <span>Dublado</span>
                {!item?.dublado?.length && <span className="text-[9px] opacity-60 font-normal">(Indisp.)</span>}
              </button>
              <button
                onClick={() => {
                  if (item?.legendado?.length) {
                    onAudioVersionChange('legendado');
                    showOsd('💬 Áudio: Legendado');
                  }
                }}
                disabled={!item?.legendado?.length}
                data-tv-focus="true"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                  !item?.legendado?.length 
                    ? 'opacity-35 cursor-not-allowed text-zinc-500 bg-zinc-900/40' 
                    : (audioVersion === 'legendado' && item?.legendado?.length)
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={item?.legendado?.length ? "Áudio Original Legendado" : "Áudio Legendado Indisponível"}
              >
                <MessageSquare size={13} />
                <span>Legendado</span>
                {!item?.legendado?.length && <span className="text-[9px] opacity-60 font-normal">(Indisp.)</span>}
              </button>
            </div>
          )}

          {/* Botão Picture-in-Picture / Modo Flutuante (Permite navegar no site sem fechar o vídeo) */}
          <button
            onClick={handleTogglePip}
            data-tv-focus="true"
            className={`p-1.5 md:p-2 rounded-xl transition border border-white/10 ${
              isFloating 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title={isFloating ? 'Expandir para Tela Normal' : 'Modo Flutuante / PiP para navegar no site sem interromper o vídeo'}
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

        {/* Lista de Fontes Alternativas (Com troca rápida em 1 clique) */}
        {sources.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-zinc-300 font-bold flex items-center gap-1 shrink-0 text-[11px] uppercase tracking-wider">
              <Layers size={13} className="text-indigo-400" /> Fontes ({sources.length}):
            </span>
            {sources.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSourceIndex(idx);
                  setForceProxyForCurrent(false);
                  showOsd(`Conectando ${s.nome || `Fonte ${idx + 1}`}...`);
                }}
                data-tv-focus="true"
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition text-xs flex items-center gap-1 ${
                  activeSourceIndex === idx
                    ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400/40 scale-105'
                    : 'bg-zinc-850 hover:bg-zinc-750 text-zinc-300 border border-white/5 hover:border-white/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeSourceIndex === idx ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                <span>{s.nome || `Fonte ${idx + 1}`}</span>
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
