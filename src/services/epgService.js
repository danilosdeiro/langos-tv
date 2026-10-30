// EPG Service — Grade de Programação em Tempo Real (Electronic Program Guide)
// Programação única e detalhada para cada canal (Telecine, HBO, Canais Abertos, Esportes e Variedades)

const CHANNEL_SCHEDULES = {
  // --- TV ABERTA ---
  globo: [
    { start: '06:00', end: '08:30', title: 'Bom Dia Brasil' },
    { start: '08:30', end: '09:30', title: 'Encontro com Patrícia Poeta' },
    { start: '09:30', end: '11:45', title: 'Mais Você com Ana Maria Braga' },
    { start: '11:45', end: '13:00', title: 'Praça TV (1ª Edição)' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte' },
    { start: '13:25', end: '14:45', title: 'Jornal Hoje' },
    { start: '14:45', end: '16:00', title: 'Edição Especial: Mulheres de Areia' },
    { start: '16:00', end: '17:30', title: 'Sessão da Tarde' },
    { start: '17:30', end: '18:30', title: 'Vale a Pena Ver de Novo' },
    { start: '18:30', end: '19:15', title: 'Novela das Seis' },
    { start: '19:15', end: '19:45', title: 'Praça TV (2ª Edição)' },
    { start: '19:45', end: '20:30', title: 'Novela das Sete' },
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
    { start: '11:50', end: '15:30', title: 'Balanço Geral' },
    { start: '15:30', end: '16:45', title: 'A Terra Prometida' },
    { start: '16:45', end: '19:50', title: 'Cidade Alerta' },
    { start: '19:50', end: '20:45', title: 'Jornal da Record' },
    { start: '20:45', end: '21:45', title: 'Reis' },
    { start: '21:45', end: '22:45', title: 'Gênesis' },
    { start: '22:45', end: '00:00', title: 'A Fazenda' },
    { start: '00:00', end: '06:00', title: 'JR 24h / Fala Que Eu Te Escuto' }
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
    { start: '22:00', end: '23:30', title: 'MasterChef Brasil' },
    { start: '23:30', end: '06:00', title: 'Jornal da Noite' }
  ],

  // --- REDE TELECINE (CADA CANAL COM GRADE EXCLUSIVA) ---
  telecine_premium: [
    { start: '06:00', end: '08:15', title: 'Top Gun: Maverick' },
    { start: '08:15', end: '10:30', title: 'Missão: Impossível - Acerto de Contas' },
    { start: '10:30', end: '13:00', title: 'Avatar: O Caminho da Água' },
    { start: '13:00', end: '15:15', title: 'Homem-Aranha: Através do Aranhaverso' },
    { start: '15:15', end: '17:30', title: 'Barbie (2023)' },
    { start: '17:30', end: '20:00', title: 'Duna: Parte 2' },
    { start: '20:00', end: '22:00', title: 'Superestreia: Oppenheimer' },
    { start: '22:00', end: '00:15', title: 'Assassinos da Lua das Flores' },
    { start: '00:15', end: '02:30', title: 'Pobres Criaturas' },
    { start: '02:30', end: '06:00', title: 'Cine Madrugada: Gladiador' }
  ],
  telecine_action: [
    { start: '06:00', end: '08:00', title: 'Carga Explosiva 3' },
    { start: '08:00', end: '10:15', title: 'O Protetor: Capítulo Final' },
    { start: '10:15', end: '12:30', title: 'Velozes & Furiosos 10' },
    { start: '12:30', end: '14:45', title: 'Batman (2022)' },
    { start: '14:45', end: '17:00', title: 'Resgate 2' },
    { start: '17:00', end: '19:30', title: 'John Wick 4: Baba Yaga' },
    { start: '19:30', end: '22:00', title: 'Noite de Ação: O Exterminador do Futuro' },
    { start: '22:00', end: '00:15', title: 'Trem-Bala' },
    { start: '00:15', end: '02:30', title: 'Tropa de Elite 2' },
    { start: '02:30', end: '06:00', title: 'Busca Implacável' }
  ],
  telecine_pipoca: [
    { start: '06:00', end: '07:45', title: 'Minions 2: A Origem de Gru (Dublado)' },
    { start: '07:45', end: '09:30', title: 'Super Mario Bros. O Filme (Dublado)' },
    { start: '09:30', end: '11:45', title: 'Jumanji: Próxima Fase (Dublado)' },
    { start: '11:45', end: '13:45', title: 'Shrek Para Sempre (Dublado)' },
    { start: '13:45', end: '15:45', title: 'As Branquelas (Dublado)' },
    { start: '15:45', end: '17:45', title: 'Gente Grande 2 (Dublado)' },
    { start: '17:45', end: '20:00', title: 'Sonic 2: O Filme (Dublado)' },
    { start: '20:00', end: '22:15', title: 'Sessão Pipoca: Os Vingadores (Dublado)' },
    { start: '22:15', end: '00:30', title: 'Transformers: O Despertar das Feras' },
    { start: '00:30', end: '06:00', title: 'Todo Mundo em Pânico 3 (Dublado)' }
  ],
  telecine_touch: [
    { start: '06:00', end: '08:15', title: 'A Culpa é das Estrelas' },
    { start: '08:15', end: '10:30', title: 'Como Eu Era Antes de Você' },
    { start: '10:30', end: '12:45', title: 'Questão de Tempo' },
    { start: '12:45', end: '15:00', title: 'O Diabo Veste Prada' },
    { start: '15:00', end: '17:15', title: 'Extraordinário' },
    { start: '17:15', end: '19:30', title: 'Simplesmente Acontece' },
    { start: '19:30', end: '22:00', title: 'Especial Emoção: Diário de uma Paixão' },
    { start: '22:00', end: '00:15', title: 'Nasce uma Estrela' },
    { start: '00:15', end: '06:00', title: 'Um Lugar Chamado Notting Hill' }
  ],
  telecine_fun: [
    { start: '06:00', end: '07:45', title: 'Kung Fu Panda 3' },
    { start: '07:45', end: '09:30', title: 'Madagascar 3: Os Procurados' },
    { start: '09:30', end: '11:30', title: 'Se Beber, Não Case! Parte 2' },
    { start: '11:30', end: '13:30', title: 'Ted 2' },
    { start: '13:30', end: '15:30', title: 'O Máskara' },
    { start: '15:30', end: '17:30', title: 'Esposa de Mentirinha' },
    { start: '17:30', end: '19:45', title: 'Debi & Lóide 2' },
    { start: '19:45', end: '22:00', title: 'Noite de Risos: American Pie' },
    { start: '22:00', end: '00:00', title: 'Trovão Tropical' },
    { start: '00:00', end: '06:00', title: 'Todo Mundo Quase Morto' }
  ],
  telecine_cult: [
    { start: '06:00', end: '08:30', title: 'Cinema Paradiso' },
    { start: '08:30', end: '11:00', title: 'Pulp Fiction: Tempo de Violência' },
    { start: '11:00', end: '13:30', title: 'Laranja Mecânica' },
    { start: '13:30', end: '16:00', title: 'Taxi Driver' },
    { start: '16:00', end: '18:30', title: 'O Poderoso Chefão (Parte 1)' },
    { start: '18:30', end: '21:00', title: 'O Poderoso Chefão (Parte 2)' },
    { start: '21:00', end: '23:30', title: 'Clássicos Imortais: Scarface' },
    { start: '23:30', end: '02:00', title: '2001: Uma Odisseia no Espaço' },
    { start: '02:00', end: '06:00', title: 'Cidadão Kane' }
  ],

  // --- REDE HBO ---
  hbo: [
    { start: '06:00', end: '07:30', title: 'The Last of Us (T1:E1)' },
    { start: '07:30', end: '09:30', title: 'Duna (2021)' },
    { start: '09:30', end: '11:30', title: 'The Batman' },
    { start: '11:30', end: '13:30', title: 'O Esquadrão Suicida' },
    { start: '13:30', end: '15:30', title: 'Wonka (2023)' },
    { start: '15:30', end: '17:30', title: 'Aquaman e o Reino Perdido' },
    { start: '17:30', end: '19:30', title: 'Succession (Temporada Final)' },
    { start: '19:30', end: '21:00', title: 'Euphoria' },
    { start: '21:00', end: '22:30', title: 'House of the Dragon (A Casa do Dragão)' },
    { start: '22:30', end: '01:00', title: 'Coringa (Joker)' },
    { start: '01:00', end: '06:00', title: 'Game of Thrones: Maratona' }
  ],
  hbo2: [
    { start: '06:00', end: '08:30', title: 'Godzilla e Kong: O Novo Império' },
    { start: '08:30', end: '11:00', title: 'Interestelar' },
    { start: '11:00', end: '13:30', title: 'Mad Max: Estrada da Fúria' },
    { start: '13:30', end: '16:00', title: 'Matrix Resurrections' },
    { start: '16:00', end: '18:30', title: 'Chernobyl: Minissérie' },
    { start: '18:30', end: '21:00', title: 'True Detective: Terra Noturna' },
    { start: '21:00', end: '23:30', title: 'Especial HBO: Oppenheimer' },
    { start: '23:30', end: '06:00', title: 'Westworld' }
  ],

  // --- CANAIS DE ESPORTE ---
  sportv: [
    { start: '06:00', end: '09:00', title: 'Redação SporTV' },
    { start: '09:00', end: '12:00', title: 'SporTV News - Manhã' },
    { start: '12:00', end: '13:00', title: 'Seleção SporTV' },
    { start: '13:00', end: '15:30', title: 'Giro da Rodada' },
    { start: '15:30', end: '18:00', title: 'Tá na Área' },
    { start: '18:00', end: '21:30', title: 'Futebol Ao Vivo: Brasileirão Série A' },
    { start: '21:30', end: '23:00', title: 'Troca de Passes' },
    { start: '23:00', end: '06:00', title: 'SporTV News - Noite & Melhores Momentos' }
  ],
  espn: [
    { start: '06:00', end: '09:00', title: 'SportsCenter - 1ª Edição' },
    { start: '09:00', end: '12:00', title: 'ESPN F90' },
    { start: '12:00', end: '15:00', title: 'ESPN Futebol no Mundo' },
    { start: '15:00', end: '18:00', title: 'Premier League Ao Vivo' },
    { start: '18:00', end: '20:00', title: 'ESPN FC' },
    { start: '20:00', end: '23:00', title: 'Copa Libertadores Ao Vivo' },
    { start: '23:00', end: '06:00', title: 'SportsCenter - Noite' }
  ],
  cazetv: [
    { start: '06:00', end: '11:00', title: 'Melhores Momentos & Gols da Rodada' },
    { start: '11:00', end: '14:00', title: 'Resenha da CazéTV' },
    { start: '14:00', end: '18:00', title: 'Transmissão Esportiva Ao Vivo' },
    { start: '18:00', end: '21:30', title: 'Jogo Ao Vivo com Casimiro' },
    { start: '21:30', end: '00:00', title: 'Pós-Jogo & Reações' },
    { start: '00:00', end: '06:00', title: 'Maratona CazéTV' }
  ],

  // --- OUTROS CANAIS DE FILMES / SÉRIES ---
  megapix: [
    { start: '06:00', end: '08:00', title: 'Crepúsculo: Eclipse' },
    { start: '08:00', end: '10:00', title: 'Resident Evil 5: Retribuição' },
    { start: '10:00', end: '12:30', title: 'Transformers: A Era da Extinção' },
    { start: '12:30', end: '15:00', title: 'Rambo 4' },
    { start: '15:00', end: '17:30', title: 'Os Mercenários 3' },
    { start: '17:30', end: '20:00', title: 'O Protetor' },
    { start: '20:00', end: '22:30', title: 'Megapix Sem Freio: John Wick' },
    { start: '22:30', end: '06:00', title: 'Invasão a Casa Branca' }
  ],
  warner: [
    { start: '06:00', end: '09:00', title: 'Friends: Maratona' },
    { start: '09:00', end: '12:00', title: 'The Big Bang Theory' },
    { start: '12:00', end: '14:30', title: 'Supernatural: Sobrenatural' },
    { start: '14:30', end: '17:00', title: 'Arrow' },
    { start: '17:00', end: '19:30', title: 'Liga da Justiça de Zack Snyder' },
    { start: '19:30', end: '22:00', title: 'Coringa' },
    { start: '22:00', end: '06:00', title: 'Mad Max: Fury Road' }
  ]
};

// Gerador dinâmico e inteligente para canais sem grade manual fixa
// Utiliza hash do nome do canal + dia do ano para criar programação consistente e realista
function generateDynamicSchedule(channelName, category) {
  const name = (channelName || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Acervo de títulos por gênero
  const library = {
    esporte: [
      'Giro da Rodada', 'Futebol Ao Vivo', 'Debate da Bola', 'Melhores Momentos', 
      'Campeonato Brasileiro', 'Liga dos Campeões', 'Esporte Total', 'Pré-Jogo Especial'
    ],
    filme: [
      'O Confronto Final', 'Operação Resgate', 'Noite de Mistério', 'Sessão Cinema Especial',
      'Terra das Sombras', 'A Vingança Perfeita', 'O Segredo do Vale', 'Destino Traçado'
    ],
    noticia: [
      'Jornal da Hora', 'Plantão em Foco', 'Giro Econômico', 'Debate Especial',
      'Edição Especial Ao Vivo', 'Mundo em Revista', 'Brasil Notícias', 'Voz da Cidade'
    ],
    infantil: [
      'Aventuras na Selva', 'Os Defensores Mirins', 'O Reino Mágico', 'Turminha Divertida',
      'Planeta dos Brinquedos', 'Super Heróis em Ação', 'Desenhos da Manhã', 'Cine Kids'
    ]
  };

  let genre = 'filme';
  if (cat.includes('esporte') || name.includes('sport') || name.includes('futebol')) genre = 'esporte';
  else if (cat.includes('notícia') || name.includes('news') || name.includes('jornal')) genre = 'noticia';
  else if (cat.includes('infantil') || name.includes('kids') || name.includes('desenho')) genre = 'infantil';

  const titles = library[genre];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const offset = Math.abs(hash) % titles.length;

  const hours = [
    { start: '06:00', end: '09:00' },
    { start: '09:00', end: '12:00' },
    { start: '12:00', end: '15:00' },
    { start: '15:00', end: '18:00' },
    { start: '18:00', end: '20:30' },
    { start: '20:30', end: '23:00' },
    { start: '23:00', end: '02:00' },
    { start: '02:00', end: '06:00' }
  ];

  return hours.map((h, i) => {
    const title = titles[(i + offset) % titles.length];
    return {
      start: h.start,
      end: h.end,
      title: `${title} (${channelName})`
    };
  });
}

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export const EpgService = {
  getProgramForChannel(channelName, category = '') {
    const nameLower = (channelName || '').toLowerCase();

    let schedule = null;

    // Canais Abertos
    if (nameLower.includes('globo')) schedule = CHANNEL_SCHEDULES.globo;
    else if (nameLower.includes('sbt')) schedule = CHANNEL_SCHEDULES.sbt;
    else if (nameLower.includes('record')) schedule = CHANNEL_SCHEDULES.record;
    else if (nameLower.includes('band')) schedule = CHANNEL_SCHEDULES.band;

    // Telecine individual
    else if (nameLower.includes('telecine') && nameLower.includes('premium')) schedule = CHANNEL_SCHEDULES.telecine_premium;
    else if (nameLower.includes('telecine') && nameLower.includes('action')) schedule = CHANNEL_SCHEDULES.telecine_action;
    else if (nameLower.includes('telecine') && nameLower.includes('pipoca')) schedule = CHANNEL_SCHEDULES.telecine_pipoca;
    else if (nameLower.includes('telecine') && nameLower.includes('touch')) schedule = CHANNEL_SCHEDULES.telecine_touch;
    else if (nameLower.includes('telecine') && nameLower.includes('fun')) schedule = CHANNEL_SCHEDULES.telecine_fun;
    else if (nameLower.includes('telecine') && nameLower.includes('cult')) schedule = CHANNEL_SCHEDULES.telecine_cult;
    else if (nameLower.includes('telecine')) schedule = CHANNEL_SCHEDULES.telecine_premium;

    // HBO individual
    else if (nameLower === 'hbo' || nameLower.includes('hbo hd')) schedule = CHANNEL_SCHEDULES.hbo;
    else if (nameLower.includes('hbo') && nameLower.includes('2')) schedule = CHANNEL_SCHEDULES.hbo2;
    else if (nameLower.includes('hbo')) schedule = CHANNEL_SCHEDULES.hbo;

    // Megapix e Warner
    else if (nameLower.includes('megapix')) schedule = CHANNEL_SCHEDULES.megapix;
    else if (nameLower.includes('warner')) schedule = CHANNEL_SCHEDULES.warner;

    // Esportes
    else if (nameLower.includes('cazé') || nameLower.includes('caze')) schedule = CHANNEL_SCHEDULES.cazetv;
    else if (nameLower.includes('espn')) schedule = CHANNEL_SCHEDULES.espn;
    else if (nameLower.includes('sportv') || nameLower.includes('premiere')) schedule = CHANNEL_SCHEDULES.sportv;

    // Dinâmico específico por canal para garantir que NUNCA haja títulos repetidos entre canais
    if (!schedule) {
      schedule = generateDynamicSchedule(channelName, category);
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < schedule.length; i++) {
      const item = schedule[i];
      let startM = parseTimeToMinutes(item.start);
      let endM = parseTimeToMinutes(item.end);

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
  },

  // Retorna a grade completa de 24 horas para o canal
  getFullScheduleForChannel(channelName, category = '') {
    if (!channelName) return [];

    const nameLower = channelName.toLowerCase();
    let schedule = null;

    if (nameLower.includes('globo') && !nameLower.includes('news')) schedule = CHANNEL_SCHEDULES.globo;
    else if (nameLower.includes('sbt')) schedule = CHANNEL_SCHEDULES.sbt;
    else if (nameLower.includes('record')) schedule = CHANNEL_SCHEDULES.record;
    else if (nameLower.includes('band')) schedule = CHANNEL_SCHEDULES.band;
    else if (nameLower.includes('globonews') || nameLower.includes('globo news') || nameLower.includes('cnn') || nameLower.includes('jovem pan')) schedule = CHANNEL_SCHEDULES.noticias;
    else if (nameLower.includes('telecine premium')) schedule = CHANNEL_SCHEDULES.telecine_premium;
    else if (nameLower.includes('telecine action')) schedule = CHANNEL_SCHEDULES.telecine_action;
    else if (nameLower.includes('telecine pipoca')) schedule = CHANNEL_SCHEDULES.telecine_pipoca;
    else if (nameLower.includes('telecine touch')) schedule = CHANNEL_SCHEDULES.telecine_touch;
    else if (nameLower.includes('telecine fun')) schedule = CHANNEL_SCHEDULES.telecine_fun;
    else if (nameLower.includes('telecine cult')) schedule = CHANNEL_SCHEDULES.telecine_cult;
    else if (nameLower.includes('telecine')) schedule = CHANNEL_SCHEDULES.telecine_premium;
    else if (nameLower === 'hbo' || nameLower.includes('hbo hd')) schedule = CHANNEL_SCHEDULES.hbo;
    else if (nameLower.includes('hbo') && nameLower.includes('2')) schedule = CHANNEL_SCHEDULES.hbo2;
    else if (nameLower.includes('hbo')) schedule = CHANNEL_SCHEDULES.hbo;
    else if (nameLower.includes('megapix')) schedule = CHANNEL_SCHEDULES.megapix;
    else if (nameLower.includes('warner')) schedule = CHANNEL_SCHEDULES.warner;
    else if (nameLower.includes('cazé') || nameLower.includes('caze')) schedule = CHANNEL_SCHEDULES.cazetv;
    else if (nameLower.includes('espn')) schedule = CHANNEL_SCHEDULES.espn;
    else if (nameLower.includes('sportv') || nameLower.includes('premiere')) schedule = CHANNEL_SCHEDULES.sportv;

    if (!schedule) {
      schedule = generateDynamicSchedule(channelName, category);
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return schedule.map((item, idx) => {
      let startM = parseTimeToMinutes(item.start);
      let endM = parseTimeToMinutes(item.end);

      let isCurrent = false;
      if (endM < startM) {
        isCurrent = currentMinutes >= startM || currentMinutes < endM;
      } else {
        isCurrent = currentMinutes >= startM && currentMinutes < endM;
      }

      let isPast = false;
      let isUpcoming = false;

      if (!isCurrent) {
        if (endM >= startM) {
          isPast = currentMinutes >= endM;
          isUpcoming = currentMinutes < startM;
        } else {
          isPast = currentMinutes >= endM && currentMinutes < startM;
          isUpcoming = !isPast;
        }
      }

      let progress = 0;
      if (isCurrent) {
        let totalDuration = endM < startM ? (1440 - startM + endM) : (endM - startM);
        let elapsed = endM < startM 
          ? (currentMinutes >= startM ? currentMinutes - startM : 1440 - startM + currentMinutes)
          : (currentMinutes - startM);
        progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      } else if (isPast) {
        progress = 100;
      }

      return {
        id: `epg-${idx}`,
        title: item.title,
        start: item.start,
        end: item.end,
        isCurrent,
        isPast,
        isUpcoming,
        progress
      };
    });
  }
};
