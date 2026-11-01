// ==============================================================================
// LANGO'S TV — TV NAVIGATION & REMOTE CONTROL (D-PAD) ENGINE
// Suporte 100% nativo para BTV, Android TV, Fire TV e Smart TVs com Controle Remoto
// ==============================================================================

class TvNavigationEngine {
  constructor() {
    this.enabled = true;
    this.currentFocusedElement = null;
    this.lastFocusedCard = null;
    this.backHandlers = [];
    this.keyHandlers = [];
    this.isTvDevice = this.detectTvDevice();
    this.init();
  }

  detectTvDevice() {
    if (typeof window === 'undefined' || !navigator.userAgent) return false;
    const ua = navigator.userAgent.toLowerCase();
    const isTvUserAgent = /(android.*tv|smarttv|tizen|web0s|netcast|hbbtv|appletv|bravia|roku|btv|mibox|aft|firetv|googletv)/i.test(ua);
    const isLargeScreenNoPointer = window.innerWidth >= 960 && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    return isTvUserAgent || isLargeScreenNoPointer;
  }

  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => this.handleKeyDown(e), { capture: true });

    // Rastrear foco nativo do navegador
    document.addEventListener('focusin', (e) => {
      if (e.target && e.target !== this.currentFocusedElement) {
        this.setFocus(e.target, false);
      }
    });

    // Inicializar foco quando a página carregar
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => this.focusFirstAvailable(), 500);
    });
  }

  registerBackHandler(handler) {
    this.backHandlers.push(handler);
    return () => {
      this.backHandlers = this.backHandlers.filter(h => h !== handler);
    };
  }

  setFocus(el, shouldScroll = true) {
    if (!el) return;
    if (this.currentFocusedElement && this.currentFocusedElement !== el) {
      this.currentFocusedElement.removeAttribute('data-tv-focused');
      this.currentFocusedElement.classList.remove('tv-focused');
    }

    this.currentFocusedElement = el;
    el.setAttribute('data-tv-focused', 'true');
    el.classList.add('tv-focused');

    if (el.getAttribute('data-tv-card') === 'true') {
      this.lastFocusedCard = el;
    }

    try {
      el.focus({ preventScroll: true });
    } catch {}

    if (shouldScroll) {
      try {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      } catch {
        el.scrollIntoView(false);
      }
    }
  }

  focusFirstAvailable() {
    const activeModal = document.querySelector('[data-tv-modal="true"]');
    const container = activeModal || document.body;
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      // Priorizar cards ou primeiro botão de aba
      const firstCard = focusable.find(el => el.getAttribute('data-tv-card') === 'true');
      this.setFocus(firstCard || focusable[0]);
    }
  }

  getFocusableElements(container = document.body) {
    const selector = [
      '[data-tv-focus="true"]',
      '[data-tv-card="true"]',
      'button:not([disabled])',
      'input:not([disabled])',
      '[tabindex="0"]',
      'a[href]'
    ].join(', ');

    const nodes = Array.from(container.querySelectorAll(selector));

    return nodes.filter(el => {
      // Elemento deve estar visível
      if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      return true;
    });
  }

  handleKeyDown(e) {
    if (!this.enabled) return;

    const key = e.key;
    const keyCode = e.keyCode;

    // Detectar botões Voltar de Android TV, BTV, Tizen, FireTV
    const isBackKey = 
      key === 'Escape' || 
      key === 'Backspace' || 
      key === 'GoBack' || 
      keyCode === 27 || 
      keyCode === 8 || 
      keyCode === 4 || 
      keyCode === 10009 || 
      keyCode === 461;

    // Tratar botão Voltar
    if (isBackKey) {
      // Se estiver digitando em um input e tiver texto, não interceptar Backspace imediatamente
      if (e.target.tagName === 'INPUT' && e.target.value.length > 0 && key === 'Backspace') {
        return;
      }

      if (this.backHandlers.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        const handler = this.backHandlers[this.backHandlers.length - 1];
        handler();
        return;
      }
    }

    // Se o player de vídeo estiver aberto em tela cheia, delegar atalhos especiais
    const isPlayerActive = document.querySelector('[data-tv-player="true"]');

    // Navegação D-Pad (Setas do controle remoto)
    const isArrowUp = key === 'ArrowUp' || keyCode === 38;
    const isArrowDown = key === 'ArrowDown' || keyCode === 40;
    const isArrowLeft = key === 'ArrowLeft' || keyCode === 37;
    const isArrowRight = key === 'ArrowRight' || keyCode === 39;
    const isSelect = key === 'Enter' || keyCode === 13 || key === 'Select';

    // Se estiver no Player e não em um menu interno, deixar o player tratar as setas (ex: Up/Down troca canal, Left/Right seek)
    if (isPlayerActive) {
      // O VideoPlayer possui seus próprios listeners para o controle
      return;
    }

    // Se estiver em um input de texto e apertar esquerda/direita, permitir mover cursor
    if (e.target.tagName === 'INPUT' && (isArrowLeft || isArrowRight)) {
      return;
    }

    let direction = null;
    if (isArrowUp) direction = 'up';
    else if (isArrowDown) direction = 'down';
    else if (isArrowLeft) direction = 'left';
    else if (isArrowRight) direction = 'right';

    if (direction) {
      e.preventDefault();
      this.moveFocus(direction);
    } else if (isSelect) {
      if (this.currentFocusedElement && this.currentFocusedElement.click) {
        // Se for input de texto, focar para abrir teclado virtual da TV
        if (this.currentFocusedElement.tagName === 'INPUT') {
          return;
        }
        e.preventDefault();
        this.currentFocusedElement.click();
      }
    }
  }

  moveFocus(direction) {
    // Determinar contêiner ativo (se modal estiver aberto, focar apenas dentro dele)
    const activeModal = document.querySelector('[data-tv-modal="true"]');
    const container = activeModal || document.body;

    const candidates = this.getFocusableElements(container);
    if (candidates.length === 0) return;

    let current = this.currentFocusedElement;
    if (!current || !container.contains(current)) {
      this.setFocus(candidates[0]);
      return;
    }

    const cRect = current.getBoundingClientRect();
    const cx = cRect.left + cRect.width / 2;
    const cy = cRect.top + cRect.height / 2;

    let bestCandidate = null;
    let minDistance = Infinity;

    for (const cand of candidates) {
      if (cand === current) continue;

      const tRect = cand.getBoundingClientRect();
      const tx = tRect.left + tRect.width / 2;
      const ty = tRect.top + tRect.height / 2;

      let isValidDirection = false;
      let primaryDelta = 0;
      let secondaryDelta = 0;
      let hasOverlap = false;

      if (direction === 'right') {
        if (tRect.left >= cRect.left + 5) {
          isValidDirection = true;
          primaryDelta = tx - cx;
          secondaryDelta = Math.abs(ty - cy);
          hasOverlap = (tRect.top < cRect.bottom && tRect.bottom > cRect.top);
        }
      } else if (direction === 'left') {
        if (tRect.right <= cRect.right - 5) {
          isValidDirection = true;
          primaryDelta = cx - tx;
          secondaryDelta = Math.abs(ty - cy);
          hasOverlap = (tRect.top < cRect.bottom && tRect.bottom > cRect.top);
        }
      } else if (direction === 'down') {
        if (tRect.top >= cRect.top + 5) {
          isValidDirection = true;
          primaryDelta = ty - cy;
          secondaryDelta = Math.abs(tx - cx);
          hasOverlap = (tRect.left < cRect.right && tRect.right > cRect.left);
        }
      } else if (direction === 'up') {
        if (tRect.bottom <= cRect.bottom - 5) {
          isValidDirection = true;
          primaryDelta = cy - ty;
          secondaryDelta = Math.abs(tx - cx);
          hasOverlap = (tRect.left < cRect.right && tRect.right > cRect.left);
        }
      }

      if (isValidDirection) {
        // Peso menor para itens com sobreposição direta no mesmo eixo
        const distance = primaryDelta + (secondaryDelta * 2.2) - (hasOverlap ? 40 : 0);
        if (distance < minDistance) {
          minDistance = distance;
          bestCandidate = cand;
        }
      }
    }

    if (bestCandidate) {
      this.setFocus(bestCandidate);
    }
  }
}

export const TvNavigation = new TvNavigationEngine();
