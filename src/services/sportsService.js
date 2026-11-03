/**
 * Sports Service - Sincronização Dinâmica Diária de Jogos & Transmissões
 * 
 * Foco Principal:
 * 1. Campeonato Brasileiro (Brasileirão Série A) - Prioridade Máxima
 * 2. Copa Libertadores da América & Copa Sul-Americana & Mundial de Clubes
 * 3. UEFA Champions League & Principais Clássicos Europeus
 * 
 * Atualiza automaticamente a cada dia / 15 minutos com cache inteligente e fallback local.
 */

import INITIAL_JOGOS from '../data/jogosHoje.json';

const CACHE_KEY = 'langos_daily_sports_v2';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos de cache

// Mapeia canais de transmissão para confrontos nacionais e internacionais
export function getBroadcastChannels(homeName, awayName, leagueId) {
  const combined = `${homeName} ${awayName}`.toLowerCase();
  
  if (leagueId === 'bra.1' || leagueId.includes('copa') || leagueId.includes('libertadores') || leagueId.includes('sudamericana')) {
    if (combined.includes('bahia')) {
      return [
        { canalId: 'ch-prem-2', nome: 'Premiere 2 HD', badge: 'Principal' },
        { canalId: 'ch-cazetv', nome: 'CazéTV HD', badge: 'Ao Vivo' },
        { canalId: 'ch-sportv-1', nome: 'SporTV HD', badge: 'Opção 2' }
      ];
    }
    if (combined.includes('vitória') || combined.includes('vitoria')) {
      return [
        { canalId: 'ch-prem-3', nome: 'Premiere 3 HD', badge: 'Principal' },
        { canalId: 'ch-31', nome: 'SporTV 2 HD', badge: 'Ao Vivo' },
        { canalId: 'ch-cazetv', nome: 'CazéTV HD', badge: 'Opção 2' }
      ];
    }
    if (combined.includes('flamengo') || combined.includes('palmeiras')) {
      return [
        { canalId: 'ch-26', nome: 'Premiere Clubes HD', badge: 'Principal' },
        { canalId: 'ch-sportv-1', nome: 'SporTV HD', badge: 'Ao Vivo' },
        { canalId: 'ch-cazetv', nome: 'CazéTV HD', badge: 'Opção 2' }
      ];
    }
    if (combined.includes('corinthians') || combined.includes('são paulo')) {
      return [
        { canalId: 'ch-prem-2', nome: 'Premiere 2 HD', badge: 'Principal' },
        { canalId: 'ch-31', nome: 'SporTV 2 HD', badge: 'Ao Vivo' },
        { canalId: 'ch-26', nome: 'Premiere Clubes HD', badge: 'Opção 2' }
      ];
    }
    if (combined.includes('vasco') || combined.includes('grêmio') || combined.includes('internacional')) {
      return [
        { canalId: 'ch-prem-4', nome: 'Premiere 4 HD', badge: 'Principal' },
        { canalId: 'ch-sportv-1', nome: 'SporTV HD', badge: 'Ao Vivo' },
        { canalId: 'ch-cazetv', nome: 'CazéTV HD', badge: 'Opção 2' }
      ];
    }
    return [
      { canalId: 'ch-prem-5', nome: 'Premiere 5 HD', badge: 'Principal' },
      { canalId: 'ch-sportv-1', nome: 'SporTV HD', badge: 'Ao Vivo' },
      { canalId: 'ch-10', nome: 'GE TV HD', badge: 'Opção 2' }
    ];
  }

  // Champions League & Internacionais
  if (combined.includes('bayern') || combined.includes('barcelona') || combined.includes('madrid') || combined.includes('atlético')) {
    return [
      { canalId: 'ch-48', nome: 'ESPN HD', badge: 'Principal' },
      { canalId: 'ch-cazetv', nome: 'CazéTV HD', badge: 'Ao Vivo' },
      { canalId: 'ch-50', nome: 'ESPN 4 HD', badge: 'Opção 2' }
    ];
  }
  if (combined.includes('manchester') || combined.includes('paris') || combined.includes('psg') || combined.includes('roma')) {
    return [
      { canalId: 'ch-49', nome: 'ESPN 2 HD', badge: 'Principal' },
      { canalId: 'ch-cazetv', nome: 'CazéTV HD', badge: 'Ao Vivo' },
      { canalId: 'ch-86', nome: 'ESPN 3 HD', badge: 'Opção 2' }
    ];
  }
  return [
    { canalId: 'ch-48', nome: 'ESPN HD', badge: 'Principal' },
    { canalId: 'ch-86', nome: 'ESPN 3 HD', badge: 'Ao Vivo' },
    { canalId: 'ch-10', nome: 'GE TV HD', badge: 'Opção 2' }
  ];
}

function formatMatchDate(dateStr) {
  const matchDate = new Date(dateStr);
  const now = new Date();
  
  const isToday = matchDate.toDateString() === now.toDateString();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

  const dayOfWeek = matchDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const dayMonth = matchDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const timeStr = matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let statusLabel;
  if (isToday) {
    statusLabel = `HOJE ${timeStr}`;
  } else if (isTomorrow) {
    statusLabel = `AMANHÃ ${timeStr}`;
  } else {
    statusLabel = `${dayOfWeek} ${timeStr}`;
  }

  return {
    status: statusLabel,
    tempo: `${dayMonth} · Horário de Brasília`,
    dayMonth,
    timeStr
  };
}

export const SportsService = {
  // Retorna os jogos do cache local se ainda forem válidos
  getCachedMatches() {
    if (typeof window === 'undefined') return INITIAL_JOGOS;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
        return parsed.matches;
      }
    } catch {}
    return null;
  },

  // Salva no cache local
  setCachedMatches(matches) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        matches
      }));
    } catch {}
  },

  // Busca e sincroniza dinamicamente as partidas oficiais
  async fetchLiveDailyMatches() {
    try {
      // 1. Gerar as datas de ontem até os próximos 8 dias para cobrir toda a rodada do Brasileirão
      const dateStrings = [];
      const now = new Date();
      for (let i = -1; i <= 8; i++) {
        const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dateStrings.push(`${yyyy}${mm}${dd}`);
      }

      // 2. Disparar buscas em paralelo para ESPN API
      const braPromises = dateStrings.map(dateStr => 
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates=${dateStr}`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      );

      const uclPromise = fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard')
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const libPromise = fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/conmebol.libertadores/scoreboard')
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const [uclData, libData, ...braDataResults] = await Promise.all([
        uclPromise,
        libPromise,
        ...braPromises
      ]);

      const rawEvents = [];

      // A) Brasileirão Série A (Prioridade Máxima)
      braDataResults.forEach(data => {
        if (data?.events) {
          data.events.forEach(ev => {
            rawEvents.push({
              ...ev,
              leagueId: 'bra.1',
              leagueName: 'Brasileirão Série A • Rodada Decisiva',
              leaguePriority: 1,
              leagueType: 'nacional'
            });
          });
        }
      });

      // B) Copa Libertadores
      if (libData?.events) {
        libData.events.forEach(ev => {
          rawEvents.push({
            ...ev,
            leagueId: 'conmebol.libertadores',
            leagueName: 'Copa Libertadores da América',
            leaguePriority: 2,
            leagueType: 'nacional'
          });
        });
      }

      // C) UEFA Champions League
      if (uclData?.events) {
        uclData.events.forEach(ev => {
          rawEvents.push({
            ...ev,
            leagueId: 'uefa.champions',
            leagueName: 'UEFA Champions League • Fase de Liga',
            leaguePriority: 3,
            leagueType: 'inter'
          });
        });
      }

      if (rawEvents.length === 0) {
        return INITIAL_JOGOS;
      }

      // Deduplicar eventos por ID
      const uniqueEvents = new Map();
      rawEvents.forEach(e => {
        if (!uniqueEvents.has(e.id)) {
          uniqueEvents.set(e.id, e);
        }
      });

      // 3. Mapear e formatar cada confronto
      const formatted = Array.from(uniqueEvents.values()).map(ev => {
        const comp = ev.competitions?.[0];
        const home = comp?.competitors?.find(c => c.homeAway === 'home') || comp?.competitors?.[0];
        const away = comp?.competitors?.find(c => c.homeAway === 'away') || comp?.competitors?.[1];

        const statusType = ev.status?.type;
        const isLive = statusType?.state === 'in';
        const isPost = statusType?.state === 'post';

        const { status, tempo } = formatMatchDate(ev.date);

        const homeName = home?.team?.displayName || 'Mandante';
        const awayName = away?.team?.displayName || 'Visitante';
        const homeScore = parseInt(home?.score || 0, 10);
        const awayScore = parseInt(away?.score || 0, 10);

        let finalStatus = status;
        let finalTempo = tempo;

        if (isLive) {
          finalStatus = 'AO VIVO';
          finalTempo = ev.status?.displayClock ? `${ev.status.displayClock}'` : 'Ao Vivo';
        } else if (isPost) {
          finalStatus = 'ENCERRADO';
          finalTempo = 'Fim de Jogo';
        }

        const stadiumStr = comp?.venue?.fullName 
          ? `${comp.venue.fullName}${comp.venue.address?.city ? ' · ' + comp.venue.address.city : ''}` 
          : 'Estádio a confirmar';

        const channelsList = getBroadcastChannels(homeName, awayName, ev.leagueId);

        return {
          id: `match-${ev.id}`,
          campeonato: ev.leagueName,
          leagueType: ev.leagueType,
          leaguePriority: ev.leaguePriority,
          status: finalStatus,
          tempo: finalTempo,
          isLive,
          matchDate: ev.date,
          estadio: stadiumStr,
          destaque: ev.leaguePriority === 1 || homeName.includes('Bahia') || homeName.includes('Flamengo') || homeName.includes('Barcelona'),
          mandante: {
            nome: homeName,
            sigla: home?.team?.abbreviation || home?.team?.shortDisplayName?.slice(0, 3).toUpperCase() || 'MAN',
            gols: (isLive || isPost) ? homeScore : 0,
            cor: 'from-blue-600 to-indigo-900',
            escudo: home?.team?.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png'
          },
          visitante: {
            nome: awayName,
            sigla: away?.team?.abbreviation || away?.team?.shortDisplayName?.slice(0, 3).toUpperCase() || 'VIS',
            gols: (isLive || isPost) ? awayScore : 0,
            cor: 'from-red-600 to-zinc-900',
            escudo: away?.team?.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png'
          },
          transmissao: channelsList
        };
      });

      // 4. Ordenação Estratégica:
      // - 1º: Jogos AO VIVO
      // - 2º: Brasileirão Série A & Libertadores (Nacionais em Destaque)
      // - 3º: Jogos por data cronológica
      // - 4º: Jogos encerrados ao final
      formatted.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;

        if (a.status !== 'ENCERRADO' && b.status === 'ENCERRADO') return -1;
        if (a.status === 'ENCERRADO' && b.status !== 'ENCERRADO') return 1;

        if (a.leaguePriority !== b.leaguePriority) {
          return a.leaguePriority - b.leaguePriority;
        }

        return new Date(a.matchDate) - new Date(b.matchDate);
      });

      // Salva no cache local
      SportsService.setCachedMatches(formatted);
      return formatted;
    } catch (err) {
      console.warn('Falha na sincronização dinâmica diária de jogos:', err);
      return SportsService.getCachedMatches() || INITIAL_JOGOS;
    }
  }
};
