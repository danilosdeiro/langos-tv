import fs from 'fs';

async function generate() {
  const dates = ['20261102', '20261103', '20261104', '20261105', '20261106'];
  const allEvents = [];
  
  // 1. UCL
  try {
    const res = await (await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard')).json();
    if (res.events) {
      res.events.forEach(e => allEvents.push({ ...e, leagueName: 'UEFA Champions League • Fase de Liga', leagueType: 'inter' }));
    }
  } catch (err) {
    console.error('UCL err', err);
  }

  // 2. Brasileirao
  for (const d of dates) {
    try {
      const res = await (await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates=' + d)).json();
      if (res.events) {
        res.events.forEach(e => allEvents.push({ ...e, leagueName: 'Brasileirão Série A • 32ª Rodada', leagueType: 'nacional' }));
      }
    } catch (err) {
      console.error('Bra err', err);
    }
  }

  function getChannelsForMatch(homeName, awayName, leagueType) {
    const combined = (homeName + ' ' + awayName).toLowerCase();
    if (leagueType === 'nacional') {
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
          { canalId: 'ch-26', nome: 'Premiere Clubes', badge: 'Principal' },
          { canalId: 'ch-sportv-1', nome: 'SporTV HD', badge: 'Ao Vivo' },
          { canalId: 'ch-cazetv', nome: 'CazéTV HD', badge: 'Opção 2' }
        ];
      }
      if (combined.includes('corinthians') || combined.includes('são paulo')) {
        return [
          { canalId: 'ch-prem-2', nome: 'Premiere 2 HD', badge: 'Principal' },
          { canalId: 'ch-31', nome: 'SporTV 2 HD', badge: 'Ao Vivo' },
          { canalId: 'ch-26', nome: 'Premiere Clubes', badge: 'Opção 2' }
        ];
      }
      return [
        { canalId: 'ch-prem-4', nome: 'Premiere 4 HD', badge: 'Principal' },
        { canalId: 'ch-sportv-1', nome: 'SporTV HD', badge: 'Ao Vivo' },
        { canalId: 'ch-10', nome: 'GE TV HD', badge: 'Opção 2' }
      ];
    } else {
      if (combined.includes('bayern') || combined.includes('barcelona') || combined.includes('real madrid') || combined.includes('atlético')) {
        return [
          { canalId: 'ch-48', nome: 'ESPN HD', badge: 'Principal' },
          { canalId: 'ch-cazetv', nome: 'CazéTV HD', badge: 'Ao Vivo' },
          { canalId: 'ch-50', nome: 'ESPN 4', badge: 'Opção 2' }
        ];
      }
      if (combined.includes('manchester') || combined.includes('paris') || combined.includes('psg')) {
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
  }

  const formatted = allEvents.map((ev, index) => {
    const comp = ev.competitions[0];
    const home = comp.competitors.find(c => c.homeAway === 'home');
    const away = comp.competitors.find(c => c.homeAway === 'away');
    const statusType = ev.status?.type;
    const isLive = statusType?.state === 'in';
    const isPost = statusType?.state === 'post';
    
    const matchDate = new Date(ev.date);
    const dayOfWeek = matchDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
    const dayMonth = matchDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const timeStr = matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let statusDisplay = `${dayOfWeek} · ${timeStr}`;
    let tempoDisplay = 'Pré-Jogo';
    
    if (isLive) {
      statusDisplay = 'AO VIVO';
      tempoDisplay = ev.status?.displayClock ? `${ev.status.displayClock}'` : 'Ao Vivo';
    } else if (isPost) {
      statusDisplay = 'ENCERRADO';
      tempoDisplay = 'Fim de Jogo';
    } else {
      statusDisplay = `${dayOfWeek} ${timeStr}`;
      tempoDisplay = `${dayMonth} · Horário de Brasília`;
    }

    const homeScore = parseInt(home.score || 0, 10);
    const awayScore = parseInt(away.score || 0, 10);

    return {
      id: 'match-' + ev.id,
      campeonato: ev.leagueName,
      status: statusDisplay,
      tempo: tempoDisplay,
      isLive: isLive,
      estadio: comp.venue?.fullName ? `${comp.venue.fullName}${comp.venue.address?.city ? ' · ' + comp.venue.address.city : ''}` : 'Estádio oficial a confirmar',
      destaque: index === 0 || home.team.displayName.includes('Flamengo') || home.team.displayName.includes('Barcelona') || home.team.displayName.includes('Bayern'),
      mandante: {
        nome: home.team.displayName,
        sigla: home.team.abbreviation || home.team.shortDisplayName?.slice(0,3).toUpperCase() || 'MAN',
        gols: (isLive || isPost) ? homeScore : 0,
        cor: 'from-blue-600 to-indigo-900',
        escudo: home.team.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png'
      },
      visitante: {
        nome: away.team.displayName,
        sigla: away.team.abbreviation || away.team.shortDisplayName?.slice(0,3).toUpperCase() || 'VIS',
        gols: (isLive || isPost) ? awayScore : 0,
        cor: 'from-red-600 to-zinc-900',
        escudo: away.team.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png'
      },
      transmissao: getChannelsForMatch(home.team.displayName, away.team.displayName, ev.leagueType)
    };
  });

  // Sort: Live first, then scheduled by date, then finished
  formatted.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    if (a.status !== 'ENCERRADO' && b.status === 'ENCERRADO') return -1;
    if (a.status === 'ENCERRADO' && b.status !== 'ENCERRADO') return 1;
    return 0;
  });

  fs.writeFileSync('src/data/jogosHoje.json', JSON.stringify(formatted, null, 2), 'utf8');
  console.log('Saved', formatted.length, 'real matches to src/data/jogosHoje.json');
}

generate();
