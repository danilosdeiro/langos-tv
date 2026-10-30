// EPG Service — Grade de Programação em Tempo Real (Electronic Program Guide)

// Programação típica dos principais canais por faixa horária
const CHANNEL_SCHEDULES = {
  globo: [
    { start: '06:00', end: '08:30', title: 'Bom Dia Brasil' },
    { start: '08:30', end: '09:30', title: 'Encontro com Patrícia Poeta' },
    { start: '09:30', end: '11:45', title: 'Mais Você' },
    { start: '11:45', end: '13:00', title: 'Praça TV (1ª Edição)' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte' },
    { start: '13:25', end: '14:45', title: 'Jornal Hoje' },
    { start: '14:45', end: '16:00', title: 'Edição Especial: Mulheres de Areia' },
    { start: '16:00', end: '17:30', title: 'Sessão da Tarde' },
    { start: '17:30', end: '18:30', title: 'Vale a Pena Ver de Novo' },
    { start: '18:30', end: '19:15', title: 'Novela das Seis: Amor Perfeito' },
    { start: '19:15', end: '19:45', title: 'Praça TV (2ª Edição)' },
    { start: '19:45', end: '20:30', title: 'Novela das Sete: Fuzuê' },
    { start: '20:30', end: '21:20', title: 'Jornal Nacional' },
    { start: '21:20', end: '22:30', title: 'Novela das Nove: Renascer' },
    { start: '22:30', end: '23:45', title: 'Futebol / Cinema Especial' },
    { start: '23:45', end: '00:30', title: 'Jornal da Globo' },
    { start: '00:30', end: '01:15', title: 'Conversa com Bial' },
    { start: '01:15', end: '06:00', title: 'Corujão / Sessão Madrugada' }
  ],
  sbt: [
    { start: '06:00', end: '09:30', title: 'Primeiro Impacto' },
    { start: '09:30', end: '11:45', title: 'Chega Mais' },
    { start: '11:45', end: '13:30', title: 'SBT Notícias' },
    { start: '13:30', end: '14:30', title: 'Carinha de Anjo' },
    { start: '14:30', end: '16:15', title: 'Fofocalizando' },
    { start: '16:15', end: '17:30', title: 'Teresa (Novela Mexicana)' },
    { start: '17:30', end: '18:45', title: 'Minha Fortuna é Te Amar' },
    { start: '18:45', end: '19:45', title: 'SBT Brasil' },
    { start: '19:45', end: '20:45', title: 'A Infância de Romeu e Julieta' },
    { start: '20:45', end: '21:45', title: 'As Aventuras de Poliana' },
    { start: '21:45', end: '22:45', title: 'Programa do Ratinho' },
    { start: '22:45', end: '00:30', title: 'A Praça é Nossa / Cine Espetacular' },
    { start: '00:30', end: '01:30', title: 'The Noite com Danilo Gentili' },
    { start: '01:30', end: '06:00', title: 'Operação Mesquita / SBT News' }
  ],
  record: [
    { start: '06:00', end: '08:40', title: 'Balanço Geral Manhã' },
    { start: '08:40', end: '10:00', title: 'Fala Brasil' },
    { start: '10:00', end: '11:50', title: 'Hoje em Dia' },
    { start: '11:50', end: '15:30', title: 'Balanço Geral SP' },
    { start: '15:30', end: '16:45', title: 'A Terra Prometida' },
    { start: '16:45', end: '19:50', title: 'Cidade Alerta' },
    { start: '19:50', end: '20:45', title: 'Jornal da Record' },
    { start: '20:45', end: '21:45', title: 'Reis (Série Bíblica)' },
    { start: '21:45', end: '22:45', title: 'Gênesis' },
    { start: '22:45', end: '00:00', title: 'A Fazenda / Power Couple' },
    { start: '00:00', end: '06:00', title: 'JR 24h / Programação Especial' }
  ],
  band: [
    { start: '06:00', end: '09:00', title: 'Bora Brasil' },
    { start: '09:00', end: '11:00', title: 'The Chef com Edu Guedes' },
    { start: '11:00', end: '13:00', title: 'Jogo Aberto com Renata Fan' },
    { start: '13:00', end: '14:30', title: 'Os Donos da Bola com Craque Neto' },
    { start: '14:30', end: '16:00', title: 'Melhor da Tarde' },
    { start: '16:00', end: '19:20', title: 'Brasil Urgente com Datena' },
    { start: '19:20', end: '20:30', title: 'Jornal da Band' },
    { start: '20:30', end: '22:00', title: 'Melhor da Noite' },
    { start: '22:00', end: '23:30', title: 'Perrengue na Band / MasterChef' },
    { start: '23:30', end: '06:00', title: 'Jornal da Noite / Linha de Combate' }
  ],
  sportv: [
    { start: '06:00', end: '09:00', title: 'Redação SporTV' },
    { start: '09:00', end: '12:00', title: 'SporTV News (Manhã)' },
    { start: '12:00', end: '13:00', title: 'Seleção SporTV' },
    { start: '13:00', end: '15:30', title: 'Giro da Rodada' },
    { start: '15:30', end: '18:00', title: 'Tá na Área' },
    { start: '18:00', end: '21:30', title: 'Futebol Ao Vivo: Brasileirão' },
    { start: '21:30', end: '23:00', title: 'Troca de Passes' },
    { start: '23:00', end: '06:00', title: 'Melhores Momentos da Rodada' }
  ],
  espn: [
    { start: '06:00', end: '09:00', title: 'SportsCenter - 1ª Edição' },
    { start: '09:00', end: '12:00', title: 'ESPN F90' },
    { start: '12:00', end: '15:00', title: 'ESPN Futebol no Mundo' },
    { start: '15:00', end: '18:00', title: 'Premier League / LaLiga Ao Vivo' },
    { start: '18:00', end: '20:00', title: 'ESPN FC' },
    { start: '20:00', end: '23:00', title: 'Libertadores / Copa Sul-Americana' },
    { start: '23:00', end: '06:00', title: 'SportsCenter - Noite' }
  ],
  filmes: [
    { start: '06:00', end: '08:30', title: 'Cinema Clássico: Manhã de Sucessos' },
    { start: '08:30', end: '11:00', title: 'Aventura Sem Limites: O Resgate' },
    { start: '11:00', end: '13:30', title: 'Comédia Especial: Férias Frustradas' },
    { start: '13:30', end: '16:00', title: 'Ação em Dobro: Velocidade Mortal' },
    { start: '16:00', end: '18:30', title: 'Ficção Científica: O Futuro da Terra' },
    { start: '18:30', end: '21:00', title: 'Sessão Pipoca: Os Vingadores' },
    { start: '21:00', end: '23:30', title: 'Superestreia: Oppenheimer' },
    { start: '23:30', end: '06:00', title: 'Cine Madrugada: O Exterminador' }
  ],
  infantil: [
    { start: '06:00', end: '09:00', title: 'Peppa Pig & Patrulha Canina' },
    { start: '09:00', end: '12:00', title: 'Hora de Aventura & O Incrível Mundo de Gumball' },
    { start: '12:00', end: '14:30', title: 'Bob Esponja & Os Padrinhos Mágicos' },
    { start: '14:30', end: '17:00', title: 'Jovens Titãs em Ação!' },
    { start: '17:00', end: '19:30', title: 'Ben 10 & Steven Universo' },
    { start: '19:30', end: '22:00', title: 'Cine Cartoon: Como Treinar o Seu Dragão' },
    { start: '22:00', end: '06:00', title: 'Maratona Clássicos Animados' }
  ],
  noticias: [
    { start: '06:00', end: '09:00', title: 'Jornal da Manhã - Ao Vivo' },
    { start: '09:00', end: '12:00', title: 'Edição das 10h: Política e Economia' },
    { start: '12:00', end: '15:00', title: 'Jornal do Meio-Dia' },
    { start: '15:00', end: '18:00', title: 'Plantão Notícias & Mundo' },
    { start: '18:00', end: '20:30', title: 'Edição Principal: Giro do Brasil' },
    { start: '20:30', end: '23:00', title: 'Debate Especial & Análise Política' },
    { start: '23:00', end: '06:00', title: 'Giro Internacional da Madrugada' }
  ]
};

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export const EpgService = {
  // Retorna o programa que está passando agora e o próximo para qualquer canal
  getProgramForChannel(channelName, category = '') {
    const nameLower = (channelName || '').toLowerCase();
    const catLower = (category || '').toLowerCase();

    let schedule = null;

    if (nameLower.includes('globo')) {
      schedule = CHANNEL_SCHEDULES.globo;
    } else if (nameLower.includes('sbt')) {
      schedule = CHANNEL_SCHEDULES.sbt;
    } else if (nameLower.includes('record')) {
      schedule = CHANNEL_SCHEDULES.record;
    } else if (nameLower.includes('band')) {
      schedule = CHANNEL_SCHEDULES.band;
    } else if (nameLower.includes('sportv') || nameLower.includes('premiere')) {
      schedule = CHANNEL_SCHEDULES.sportv;
    } else if (nameLower.includes('espn')) {
      schedule = CHANNEL_SCHEDULES.espn;
    } else if (catLower.includes('esporte')) {
      schedule = CHANNEL_SCHEDULES.sportv;
    } else if (catLower.includes('infantil') || nameLower.includes('cartoon') || nameLower.includes('gloob')) {
      schedule = CHANNEL_SCHEDULES.infantil;
    } else if (catLower.includes('notícia') || nameLower.includes('news') || nameLower.includes('cnn')) {
      schedule = CHANNEL_SCHEDULES.noticias;
    } else {
      schedule = CHANNEL_SCHEDULES.filmes;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < schedule.length; i++) {
      const item = schedule[i];
      let startM = parseTimeToMinutes(item.start);
      let endM = parseTimeToMinutes(item.end);

      // Tratamento para virada da meia-noite
      let isCurrent = false;
      if (endM < startM) {
        isCurrent = currentMinutes >= startM || currentMinutes < endM;
      } else {
        isCurrent = currentMinutes >= startM && currentMinutes < endM;
      }

      if (isCurrent) {
        let totalDuration = endM < startM ? (1440 - startM + endM) : (endM - startM);
        let elapsed = endM < startM 
          ? (currentMinutes >= startM ? currentMinutes - startM : 1440 - startM + currentMinutes)
          : (currentMinutes - startM);
        
        let progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

        const nextItem = schedule[(i + 1) % schedule.length];

        return {
          title: item.title,
          start: item.start,
          end: item.end,
          progress: progress,
          nextTitle: nextItem ? nextItem.title : '',
          nextStart: nextItem ? nextItem.start : ''
        };
      }
    }

    return {
      title: 'Transmissão Ao Vivo',
      start: '--:--',
      end: '--:--',
      progress: 50,
      nextTitle: 'Programação a seguir',
      nextStart: '--:--'
    };
  }
};
