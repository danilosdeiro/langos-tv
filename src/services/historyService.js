// History Service — Armazena o progresso de reprodução para a fileira "Continuar Assistindo"

const STORAGE_KEY = 'langos_continue_watching_v1';

export const HistoryService = {
  // Obter lista de conteúdos em andamento
  getRecent() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      // Ordenar por atualização mais recente
      return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (e) {
      console.warn('Erro ao ler histórico de reprodução:', e);
      return [];
    }
  },

  // Salvar progresso
  saveProgress(item, currentTime, duration, audioVersion = 'dublado') {
    if (!item || !currentTime || !duration || isNaN(currentTime) || isNaN(duration)) return;
    
    // Ignorar canais ao vivo (não possuem duração finita)
    if (duration <= 0 || duration > 100000) return;

    // Apenas salvar se o usuário assistiu pelo menos 15 segundos
    if (currentTime < 15) return;

    const percent = (currentTime / duration) * 100;

    try {
      let list = this.getRecent();
      const itemId = item.id || item.titulo || item.nome;

      // Se passou de 94%, consideramos concluído e removemos da lista
      if (percent >= 94) {
        list = list.filter(entry => entry.id !== itemId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return;
      }

      // Remover entrada anterior do mesmo item
      list = list.filter(entry => entry.id !== itemId);

      // Adicionar nova entrada no topo
      list.unshift({
        id: itemId,
        titulo: item.titulo || item.nome,
        capa: item.capa || item.logo || '',
        categoria: item.categoria || 'VOD',
        currentTime: Math.floor(currentTime),
        duration: Math.floor(duration),
        percent: Math.round(percent),
        audioVersion: audioVersion,
        itemPayload: item,
        timestamp: Date.now()
      });

      // Limitar a 20 itens recentes
      if (list.length > 20) {
        list = list.slice(0, 20);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar progresso de vídeo:', e);
    }
  },

  // Remover item específico do histórico
  removeItem(id) {
    try {
      let list = this.getRecent();
      list = list.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list;
    } catch {
      return [];
    }
  },

  // Limpar todo o histórico
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
};
