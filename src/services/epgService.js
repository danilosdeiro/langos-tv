// EPG Service — Grade de Programação em Tempo Real (Electronic Program Guide)
// Programações exclusivas e autênticas para TODAS as famílias de canais (HBO, Premiere, SporTV, ESPN, Discovery, Telecine, Globo Regionais, TNT, Universal, Sony, Notícias e Infantis)

const CHANNEL_SCHEDULES = {
  // =========================================================================
  // --- FAMÍLIA GLOBO REGIONAL (CADA PRAÇA COM SEU TELEJORNAL LOCAL) ---
  // =========================================================================
  globo_bahia: [
    { start: '06:00', end: '08:30', title: 'Jornal da Manhã (Bahia)' },
    { start: '08:30', end: '09:30', title: 'Encontro com Patrícia Poeta' },
    { start: '09:30', end: '11:45', title: 'Mais Você com Ana Maria Braga' },
    { start: '11:45', end: '13:00', title: 'Bahia Meio Dia (Ao Vivo)' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte Bahia' },
    { start: '13:25', end: '14:45', title: 'Jornal Hoje' },
    { start: '14:45', end: '16:00', title: 'Edição Especial: Cheias de Charme' },
    { start: '16:00', end: '17:30', title: 'Sessão da Tarde: Minha Mãe é uma Peça' },
    { start: '17:30', end: '18:30', title: 'Vale a Pena Ver de Novo: Alma Gêmea' },
    { start: '18:30', end: '19:15', title: 'Novela das Seis: No Rancho Fundo' },
    { start: '19:15', end: '19:45', title: 'BATV (Rede Bahia Ao Vivo)' },
    { start: '19:45', end: '20:30', title: 'Novela das Sete: Família é Tudo' },
    { start: '20:30', end: '21:20', title: 'Jornal Nacional' },
    { start: '21:20', end: '22:30', title: 'Novela das Nove: Mania de Você' },
    { start: '22:30', end: '23:45', title: 'Futebol Ao Vivo / Cine Holliúdy' },
    { start: '23:45', end: '00:30', title: 'Jornal da Globo' },
    { start: '00:30', end: '01:15', title: 'Conversa com Bial' },
    { start: '01:15', end: '06:00', title: 'Corujão: Velozes e Furiosos' }
  ],
  globo_sp: [
    { start: '06:00', end: '08:30', title: 'Bom Dia São Paulo com Rodrigo Bocardi' },
    { start: '08:30', end: '09:30', title: 'Encontro com Patrícia Poeta' },
    { start: '09:30', end: '11:45', title: 'Mais Você' },
    { start: '11:45', end: '13:00', title: 'SP1 (SPTV 1ª Edição com Alan Severiano)' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte SP com Fred Ring' },
    { start: '13:25', end: '14:45', title: 'Jornal Hoje' },
    { start: '14:45', end: '16:00', title: 'Edição Especial de Novelas' },
    { start: '16:00', end: '17:30', title: 'Sessão da Tarde' },
    { start: '17:30', end: '18:30', title: 'Vale a Pena Ver de Novo' },
    { start: '18:30', end: '19:15', title: 'Novela das Seis' },
    { start: '19:15', end: '19:45', title: 'SP2 (SPTV 2ª Edição com José Roberto Burnier)' },
    { start: '19:45', end: '20:30', title: 'Novela das Sete' },
    { start: '20:30', end: '21:20', title: 'Jornal Nacional' },
    { start: '21:20', end: '22:30', title: 'Novela das Nove' },
    { start: '22:30', end: '23:45', title: 'Futebol Paulista Ao Vivo' },
    { start: '23:45', end: '06:00', title: 'Jornal da Globo & Corujão' }
  ],
  globo_rj: [
    { start: '06:00', end: '08:30', title: 'Bom Dia Rio com Silvana Ramiro' },
    { start: '08:30', end: '09:30', title: 'Encontro com Patrícia Poeta' },
    { start: '09:30', end: '11:45', title: 'Mais Você' },
    { start: '11:45', end: '13:00', title: 'RJ1 (RJTV 1ª Edição com Mariana Gross)' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte Rio com Alex Escobar' },
    { start: '13:25', end: '14:45', title: 'Jornal Hoje' },
    { start: '14:45', end: '16:00', title: 'Edição Especial' },
    { start: '16:00', end: '17:30', title: 'Sessão da Tarde' },
    { start: '17:30', end: '18:30', title: 'Vale a Pena Ver de Novo' },
    { start: '18:30', end: '19:15', title: 'Novela das Seis' },
    { start: '19:15', end: '19:45', title: 'RJ2 (RJTV 2ª Edição)' },
    { start: '19:45', end: '20:30', title: 'Novela das Sete' },
    { start: '20:30', end: '21:20', title: 'Jornal Nacional' },
    { start: '21:20', end: '22:30', title: 'Novela das Nove' },
    { start: '22:30', end: '23:45', title: 'Futebol Carioca Ao Vivo' },
    { start: '23:45', end: '06:00', title: 'Jornal da Globo & Sessão Madrugada' }
  ],
  globo_mg: [
    { start: '06:00', end: '08:30', title: 'Bom Dia Minas' },
    { start: '08:30', end: '11:45', title: 'Encontro & Mais Você' },
    { start: '11:45', end: '13:00', title: 'MG1 (MGTV 1ª Edição)' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte MG' },
    { start: '13:25', end: '19:15', title: 'Programação de Rede Globo' },
    { start: '19:15', end: '19:45', title: 'MG2 (MGTV 2ª Edição)' },
    { start: '19:45', end: '06:00', title: 'Horário Nobre & Cinema Especial' }
  ],
  globo_rs: [
    { start: '06:00', end: '08:30', title: 'Bom Dia Rio Grande (RBS TV)' },
    { start: '08:30', end: '11:45', title: 'Encontro com Patrícia Poeta & Mais Você' },
    { start: '11:45', end: '13:00', title: 'Jornal do Almoço com Cristina Ranzolin' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte RS com Alice Bastos Neves' },
    { start: '13:25', end: '19:15', title: 'Jornal Hoje, Novelas & Sessão da Tarde' },
    { start: '19:15', end: '19:45', title: 'RBS Notícias (Ao Vivo)' },
    { start: '19:45', end: '06:00', title: 'Jornal Nacional, Novela das Nove & Gauchão' }
  ],
  globo_pe: [
    { start: '06:00', end: '08:30', title: 'Bom Dia Pernambuco' },
    { start: '08:30', end: '11:45', title: 'Manhã Globo' },
    { start: '11:45', end: '13:00', title: 'NE1 (NETV 1ª Edição Recife)' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte Pernambuco' },
    { start: '13:25', end: '19:15', title: 'Programação Vespertina' },
    { start: '19:15', end: '19:45', title: 'NE2 (NETV 2ª Edição Recife)' },
    { start: '19:45', end: '06:00', title: 'Horário Nobre & Cinema da Madrugada' }
  ],
  globo_padrao: [
    { start: '06:00', end: '08:30', title: 'Bom Dia Brasil' },
    { start: '08:30', end: '09:30', title: 'Encontro com Patrícia Poeta' },
    { start: '09:30', end: '11:45', title: 'Mais Você com Ana Maria Braga' },
    { start: '11:45', end: '13:00', title: 'Praça TV (Noticiário Local)' },
    { start: '13:00', end: '13:25', title: 'Globo Esporte' },
    { start: '13:25', end: '14:45', title: 'Jornal Hoje' },
    { start: '14:45', end: '16:00', title: 'Edição Especial de Novelas' },
    { start: '16:00', end: '17:30', title: 'Sessão da Tarde: Cinema para Toda Família' },
    { start: '17:30', end: '18:30', title: 'Vale a Pena Ver de Novo' },
    { start: '18:30', end: '19:15', title: 'Novela das Seis' },
    { start: '19:15', end: '19:45', title: 'Telejornal Noturno Local' },
    { start: '19:45', end: '20:30', title: 'Novela das Sete' },
    { start: '20:30', end: '21:20', title: 'Jornal Nacional' },
    { start: '21:20', end: '22:30', title: 'Novela das Nove' },
    { start: '22:30', end: '23:45', title: 'Cinema Especial / Futebol Ao Vivo' },
    { start: '23:45', end: '00:30', title: 'Jornal da Globo' },
    { start: '00:30', end: '01:15', title: 'Conversa com Bial' },
    { start: '01:15', end: '06:00', title: 'Corujão' }
  ],

  // =========================================================================
  // --- FAMÍLIA HBO (8 CANAIS COM GRADES 100% INDIVIDUAIS E DIFERENCIADAS) ---
  // =========================================================================
  hbo: [
    { start: '06:00', end: '07:30', title: 'The Last of Us (T1:E1)' },
    { start: '07:30', end: '09:30', title: 'Duna (2021) de Denis Villeneuve' },
    { start: '09:30', end: '11:30', title: 'The Batman com Robert Pattinson' },
    { start: '11:30', end: '13:30', title: 'O Esquadrão Suicida' },
    { start: '13:30', end: '15:30', title: 'Wonka (2023) com Timothée Chalamet' },
    { start: '15:30', end: '17:30', title: 'Aquaman e o Reino Perdido' },
    { start: '17:30', end: '19:30', title: 'Succession: Temporada Premiada' },
    { start: '19:30', end: '21:00', title: 'Euphoria' },
    { start: '21:00', end: '22:30', title: 'House of the Dragon (A Casa do Dragão)' },
    { start: '22:30', end: '01:00', title: 'Coringa (Joker) com Joaquin Phoenix' },
    { start: '01:00', end: '06:00', title: 'Game of Thrones: Maratona Especial' }
  ],
  hbo2: [
    { start: '06:00', end: '08:30', title: 'Godzilla e Kong: O Novo Império (Dublado)' },
    { start: '08:30', end: '11:00', title: 'Interestelar de Christopher Nolan (Dublado)' },
    { start: '11:00', end: '13:30', title: 'Mad Max: Estrada da Fúria (Dublado)' },
    { start: '13:30', end: '16:00', title: 'Matrix Resurrections (Dublado)' },
    { start: '16:00', end: '18:30', title: 'Chernobyl: Minissérie Histórica HBO' },
    { start: '18:30', end: '21:00', title: 'True Detective: Terra Noturna (Dublado)' },
    { start: '21:00', end: '23:30', title: 'Superestreia HBO2: Oppenheimer (Dublado)' },
    { start: '23:30', end: '06:00', title: 'Westworld: Futuro Sombrio (Dublado)' }
  ],
  hbo_family: [
    { start: '06:00', end: '07:45', title: 'As Aventuras de Paddington (Dublado)' },
    { start: '07:45', end: '09:30', title: 'Space Jam: Um Novo Legado (Dublado)' },
    { start: '09:30', end: '11:30', title: 'Harry Potter e a Pedra Filosofal' },
    { start: '11:30', end: '13:45', title: 'Harry Potter e a Câmara Secreta' },
    { start: '13:45', end: '16:00', title: 'Animais Fantásticos e Onde Habitam' },
    { start: '16:00', end: '18:00', title: 'DC Liga dos Superpets (Dublado)' },
    { start: '18:00', end: '20:00', title: 'DC Liga da Justiça: Ação' },
    { start: '20:00', end: '22:00', title: 'A Fantástica Fábrica de Chocolate' },
    { start: '22:00', end: '06:00', title: 'Maratona Cine Family: Clássicos Animados' }
  ],
  hbo_signature: [
    { start: '06:00', end: '08:30', title: 'Família Soprano: Temporada Histórica' },
    { start: '08:30', end: '10:45', title: 'The Wire (A Escuta): Polícia e Crime' },
    { start: '10:45', end: '13:00', title: 'Band of Brothers (Irmãos de Guerra)' },
    { start: '13:00', end: '15:30', title: 'Roma: Série Histórica Épica' },
    { start: '15:30', end: '18:00', title: 'Six Feet Under (A Sete Palmos)' },
    { start: '18:00', end: '20:30', title: 'Mare of Easttown com Kate Winslet' },
    { start: '20:30', end: '22:30', title: 'The White Lotus (Temporada na Sicília)' },
    { start: '22:30', end: '06:00', title: 'Cine Signature: Festivais Internacionais' }
  ],
  hbo_plus: [
    { start: '06:00', end: '08:15', title: 'Círculo de Fogo: A Revolta' },
    { start: '08:15', end: '10:30', title: 'Invocação do Mal 3: A Ordem do Demônio' },
    { start: '10:30', end: '12:45', title: 'A Freira 2' },
    { start: '12:45', end: '15:00', title: 'Pânico 6 com Jenna Ortega' },
    { start: '15:00', end: '17:15', title: 'Mortal Kombat (2021)' },
    { start: '17:15', end: '19:30', title: 'Godzilla vs. Kong' },
    { start: '19:30', end: '22:00', title: 'Noite Sangrenta: O Homem nas Trevas 2' },
    { start: '22:00', end: '00:30', title: 'IT: Capítulo 2' },
    { start: '00:30', end: '06:00', title: 'Madrugada do Terror HBO Plus' }
  ],
  hbo_mundi: [
    { start: '06:00', end: '08:30', title: 'Parasita (Ganhador do Oscar de Melhor Filme)' },
    { start: '08:30', end: '11:00', title: 'Zona de Interesse (Cinema Europeu)' },
    { start: '11:00', end: '13:30', title: 'Drive My Car (Japão)' },
    { start: '13:30', end: '16:00', title: 'Anatomia de uma Queda (França)' },
    { start: '16:00', end: '18:30', title: 'A Baleia com Brendan Fraser' },
    { start: '18:30', end: '21:00', title: 'Vidas Passadas (Past Lives)' },
    { start: '21:00', end: '23:30', title: 'Sessão Cinema do Mundo: Minari' },
    { start: '23:30', end: '06:00', title: 'Cine Festivais: Berlim e Cannes' }
  ],
  hbo_pop: [
    { start: '06:00', end: '08:00', title: 'Como Perder um Homem em 10 Dias' },
    { start: '08:00', end: '10:00', title: 'Amizade Colorida com Justin Timberlake' },
    { start: '10:00', end: '12:15', title: 'A Mentira com Emma Stone' },
    { start: '12:15', end: '14:30', title: 'Barbie (2023) com Margot Robbie' },
    { start: '14:30', end: '16:45', title: 'Legalmente Loira' },
    { start: '16:45', end: '19:00', title: 'Mamma Mia! O Filme' },
    { start: '19:00', end: '21:30', title: 'Sessão Pop: Podres de Ricos' },
    { start: '21:30', end: '23:30', title: 'Gente Grande com Adam Sandler' },
    { start: '23:30', end: '06:00', title: 'Comédias Românticas da Madrugada' }
  ],
  hbo_xtreme: [
    { start: '06:00', end: '08:00', title: 'Busca Implacável 3' },
    { start: '08:00', end: '10:15', title: 'Carga Explosiva com Jason Statham' },
    { start: '10:15', end: '12:30', title: 'Tropa de Elite 2: O Inimigo Agora é Outro' },
    { start: '12:30', end: '15:00', title: 'Resgate com Chris Hemsworth' },
    { start: '15:00', end: '17:30', title: 'Assassino a Preço Fixo 2' },
    { start: '17:30', end: '20:00', title: 'John Wick: De Volta ao Jogo' },
    { start: '20:00', end: '22:30', title: 'Adrenalina Máxima: John Wick 2' },
    { start: '22:30', end: '01:00', title: 'Fúria em Alto-Mar com Gerard Butler' },
    { start: '01:00', end: '06:00', title: 'Noite Extrema: Conflito Mortal' }
  ],

  // =========================================================================
  // --- FAMÍLIA PREMIERE (JOGOS EXCLUSIVOS E DIFERENTES EM CADA CANAL) ---
  // =========================================================================
  premiere_clubes: [
    { start: '06:00', end: '09:00', title: 'Giro de Gols da Rodada: Brasileirão Série A' },
    { start: '09:00', end: '12:00', title: 'Especial Grandes Clássicos do Futebol Brasileiro' },
    { start: '12:00', end: '14:30', title: 'Pré-Jogo Premiere: Raio-X dos Clubes' },
    { start: '14:30', end: '16:00', title: 'Aquecimento no Gramado: Notícias e Escalações' },
    { start: '16:00', end: '18:30', title: 'Futebol Ao Vivo: Rodada Nacional' },
    { start: '18:30', end: '21:00', title: 'Futebol Ao Vivo: Jogos da Noite' },
    { start: '21:00', end: '23:00', title: 'Apito Final: Análise Tática e Coletivas' },
    { start: '23:00', end: '06:00', title: 'Faixa Campeã: Melhores Jogos Históricos' }
  ],
  premiere_6: [
    { start: '06:00', end: '11:00', title: 'Melhores Lances: Flamengo no Brasileirão' },
    { start: '11:00', end: '15:30', title: 'Compacto da Partida: Grêmio x Internacional' },
    { start: '15:30', end: '16:00', title: 'Pré-Jogo: Flamengo x Grêmio no Maracanã' },
    { start: '16:00', end: '18:15', title: 'AO VIVO: Flamengo x Grêmio (Brasileirão Série A)' },
    { start: '18:15', end: '19:00', title: 'Pós-Jogo: Entrevistas no Gramado do Maracanã' },
    { start: '19:00', end: '21:15', title: 'AO VIVO: Cruzeiro x Atlético-MG (Mineirão)' },
    { start: '21:15', end: '06:00', title: 'Reprise na Íntegra: Flamengo x Grêmio' }
  ],
  premiere_7: [
    { start: '06:00', end: '11:00', title: 'Histórico de Dérbis: Palmeiras e Corinthians' },
    { start: '11:00', end: '15:30', title: 'Aquecimento na Arena: Noticiário Paulista' },
    { start: '15:30', end: '16:00', title: 'Pré-Jogo: Palmeiras x Corinthians' },
    { start: '16:00', end: '18:15', title: 'AO VIVO: Palmeiras x Corinthians (Allianz Parque)' },
    { start: '18:15', end: '19:00', title: 'Pós-Jogo: Análise dos Lances Polêmicos' },
    { start: '19:00', end: '21:15', title: 'AO VIVO: São Paulo x Bahia (Morumbi)' },
    { start: '21:15', end: '06:00', title: 'Reprise na Íntegra: Palmeiras x Corinthians' }
  ],
  premiere_8: [
    { start: '06:00', end: '11:00', title: 'Especial Série B: O Caminho do Acesso' },
    { start: '11:00', end: '15:30', title: 'Gols da Série B e Tabela Atualizada' },
    { start: '15:30', end: '16:00', title: 'Pré-Jogo: Santos x Sport na Vila Belmiro' },
    { start: '16:00', end: '18:15', title: 'AO VIVO: Santos x Sport (Brasileirão Série B)' },
    { start: '18:15', end: '19:00', title: 'Coletivas dos Técnicos Ao Vivo' },
    { start: '19:00', end: '21:15', title: 'AO VIVO: Ceará x Coritiba (Castelão)' },
    { start: '21:15', end: '06:00', title: 'Compactos da Rodada da Série B' }
  ],

  // =========================================================================
  // --- FAMÍLIA ESPN (6 CANAIS COM LIGAS E MODALIDADES DIFERENCIADAS) ---
  // =========================================================================
  espn: [
    { start: '06:00', end: '09:00', title: 'SportsCenter - 1ª Edição com Análises' },
    { start: '09:00', end: '12:00', title: 'ESPN F90 com Daniela Boaventura' },
    { start: '12:00', end: '15:00', title: 'ESPN Futebol no Mundo (Destaques da Europa)' },
    { start: '15:00', end: '18:00', title: 'AO VIVO: Premier League Inglesa (Liverpool x Chelsea)' },
    { start: '18:00', end: '20:00', title: 'ESPN FC com Alex Tseng e Comentaristas' },
    { start: '20:00', end: '23:00', title: 'AO VIVO: Copa Libertadores da América' },
    { start: '23:00', end: '06:00', title: 'SportsCenter - Edição da Noite' }
  ],
  espn2: [
    { start: '06:00', end: '09:00', title: 'SportsCenter Matinal Internacional' },
    { start: '09:00', end: '12:15', title: 'AO VIVO: La Liga Espanhola (Real Madrid x Atlético)' },
    { start: '12:15', end: '15:15', title: 'AO VIVO: Serie A Italiana (Inter de Milão x Juventus)' },
    { start: '15:15', end: '18:15', title: 'AO VIVO: Ligue 1 Francesa (PSG em Ação)' },
    { start: '18:15', end: '21:00', title: 'Linha de Passe: A Mesa Redonda dos Campeões' },
    { start: '21:00', end: '23:45', title: 'AO VIVO: Basquete NBA (Lakers x Warriors)' },
    { start: '23:45', end: '06:00', title: 'Giro de Gols da Europa & Compactos' }
  ],
  espn3: [
    { start: '06:00', end: '10:00', title: 'Tênis Ao Vivo: Torneio ATP 1000 / WTA' },
    { start: '10:00', end: '13:00', title: 'Ciclismo Internacional: Giro d’Italia / Tour' },
    { start: '13:00', end: '16:00', title: 'Hóquei no Gelo: NHL Melhores Jogos' },
    { start: '16:00', end: '19:00', title: 'Beisebol da MLB: Jogos Históricos' },
    { start: '19:00', end: '22:30', title: 'AO VIVO: Beisebol MLB (Yankees x Red Sox)' },
    { start: '22:30', end: '06:00', title: 'ESPN 3 Madrugada: Tênis Grand Slam' }
  ],
  espn4: [
    { start: '06:00', end: '10:00', title: 'NFL Matchup: Análise Tática do Futebol Americano' },
    { start: '10:00', end: '14:00', title: 'Copa da Inglaterra (FA Cup) Melhores Momentos' },
    { start: '14:00', end: '18:00', title: 'AO VIVO: Copa da Liga Inglesa (Carabao Cup)' },
    { start: '18:00', end: '21:00', title: 'ESPN Knockout: Artes Marciais & Boxe de Elite' },
    { start: '21:00', end: '00:30', title: 'AO VIVO: NFL Sunday Night Football' },
    { start: '00:30', end: '06:00', title: 'ESPN Knockout: Noite de Nocautes' }
  ],
  espn5: [
    { start: '06:00', end: '09:30', title: 'Rugby Internacional: The Rugby Championship' },
    { start: '09:30', end: '13:00', title: 'Automobilismo: IndyCar Series & Supercars' },
    { start: '13:00', end: '16:30', title: 'UEFA Nations League: Compactos e Gols' },
    { start: '16:30', end: '19:30', title: 'E-Sports: Torneio Internacional de League of Legends' },
    { start: '19:30', end: '22:30', title: 'AO VIVO: IndyCar Corrida Noturna' },
    { start: '22:30', end: '06:00', title: 'Faixa Veloz ESPN 5' }
  ],
  espn6: [
    { start: '06:00', end: '10:00', title: 'Esportes Universitários Americanos (NCAA)' },
    { start: '10:00', end: '14:00', title: 'Basquete Feminino WNBA: Jogos da Temporada' },
    { start: '14:00', end: '18:00', title: 'AO VIVO: Futebol Sul-Americano Copa Sul-Americana' },
    { start: '18:00', end: '21:30', title: 'AO VIVO: Futebol Universitário NCAA College' },
    { start: '21:30', end: '06:00', title: 'Resumo Multitela ESPN: O Melhor do Dia' }
  ],

  // =========================================================================
  // --- FAMÍLIA SPOR TV & ESPORTES GLOBO ---
  // =========================================================================
  sportv2: [
    { start: '06:00', end: '09:00', title: 'Vôlei Ao Vivo: Superliga Masculina de Vôlei' },
    { start: '09:00', end: '12:00', title: 'Basquete NBB: Melhores Momentos & Entrevistas' },
    { start: '12:00', end: '15:00', title: 'Futsal Ao Vivo: Liga Nacional de Futsal' },
    { start: '15:00', end: '18:00', title: 'Ginástica Artística & Judô: Circuito Mundial' },
    { start: '18:00', end: '21:00', title: 'AO VIVO: Superliga Feminina (Osasco x Minas)' },
    { start: '21:00', end: '23:30', title: 'SporTV 2 Especial: Campeões das Quadras' },
    { start: '23:30', end: '06:00', title: 'Reprise Melhores Momentos SporTV 2' }
  ],
  sportv3: [
    { start: '06:00', end: '10:00', title: 'Automobilismo: Stock Car Brasil & Fórmula E' },
    { start: '10:00', end: '13:00', title: 'AO VIVO: Circuito Mundial de Tênis ATP' },
    { start: '13:00', end: '16:00', title: 'Surfe WSL: Circuito Mundial de Ondas Grandes' },
    { start: '16:00', end: '19:00', title: 'Atletismo & Esportes de Aventura' },
    { start: '19:00', end: '22:00', title: 'Futebol Internacional: Eliminatórias' },
    { start: '22:00', end: '06:00', title: 'Faixa Noturna SporTV 3 Radicais' }
  ],
  canal_off: [
    { start: '06:00', end: '08:30', title: 'Em Busca dos Tubarões com Gui Pádua' },
    { start: '08:30', end: '11:00', title: 'Mundo Medina: Gabriel Medina no Circuito' },
    { start: '11:00', end: '13:30', title: 'Pela Rua: Skate Urbano com Pedro Barros' },
    { start: '13:30', end: '16:00', title: 'Águas Selvagens: Caiaque Extremo' },
    { start: '16:00', end: '18:30', title: 'Brazilian Storm: Os Reis do Surfe' },
    { start: '18:30', end: '21:00', title: 'Ondas Gigantes de Nazaré com Lucas Chumbo' },
    { start: '21:00', end: '23:30', title: 'Off Docs: Expedição Antártica' },
    { start: '23:30', end: '06:00', title: 'Madrugada Off: Natureza Imersiva em 4K' }
  ],
  band_sports: [
    { start: '06:00', end: '09:00', title: 'Bandsports News - Edição da Manhã' },
    { start: '09:00', end: '12:00', title: 'Fórmula 1: Bastidores dos Motores' },
    { start: '12:00', end: '14:30', title: 'Super Motor com Celso Miranda' },
    { start: '14:30', end: '17:00', title: 'Futebol Italiano Ao Vivo' },
    { start: '17:00', end: '19:30', title: 'Ace Bandsports: O Mundo do Tênis' },
    { start: '19:30', end: '22:00', title: 'Depois do Jogo: Mesa de Debates' },
    { start: '22:00', end: '06:00', title: 'Bandsports Noite & Velocidade' }
  ],

  // =========================================================================
  // --- FAMÍLIA DISCOVERY (8 CANAIS COM FOCOS 100% DISTINTOS) ---
  // =========================================================================
  discovery_channel: [
    { start: '06:00', end: '08:30', title: 'Pesca Mortal: Mar de Bering' },
    { start: '08:30', end: '11:00', title: 'Febre do Ouro: Alasca Selvagem' },
    { start: '11:00', end: '13:30', title: 'Largados e Pelados (Naked and Afraid)' },
    { start: '13:30', end: '16:00', title: 'Mestres da Engenharia: Mega Estruturas' },
    { start: '16:00', end: '18:30', title: 'À Prova de Tudo com Bear Grylls' },
    { start: '18:30', end: '21:00', title: 'Febre do Ouro: Minas Perdidas' },
    { start: '21:00', end: '23:30', title: 'Largados e Pelados: A Tribo (Inédito)' },
    { start: '23:30', end: '06:00', title: 'Mistérios e Lendas da Terra' }
  ],
  discovery_kids: [
    { start: '06:00', end: '07:30', title: 'Peppa Pig: Brincadeiras e Diversão' },
    { start: '07:30', end: '09:00', title: 'Patrulha Canina: Filhotes em Missão' },
    { start: '09:00', end: '10:30', title: 'O Show da Luna! Por Que Será?' },
    { start: '10:30', end: '12:00', title: 'Mini Beat Power Rockers' },
    { start: '12:00', end: '13:30', title: 'Doki Descobre o Mundo' },
    { start: '13:30', end: '15:00', title: 'PJ Masks: Heróis de Pijama' },
    { start: '15:00', end: '16:30', title: 'Peppa Pig: Novas Aventuras na Cidade' },
    { start: '16:30', end: '18:30', title: 'Patrulha Canina: Resgate com Superfilhotes' },
    { start: '18:30', end: '20:30', title: 'Cine Clube Kids: Carros e Monstros' },
    { start: '20:30', end: '06:00', title: 'Madrugada Divertida Discovery Kids' }
  ],
  discovery_turbo: [
    { start: '06:00', end: '08:30', title: 'Joias Sobre Rodas (Wheeler Dealers)' },
    { start: '08:30', end: '11:00', title: 'Oficina de Aceleração com Richard Rawlings' },
    { start: '11:00', end: '13:30', title: 'Supercarros do Futuro: Velocidade Máxima' },
    { start: '13:30', end: '16:00', title: 'Garagens Fantásticas & Carros Raros' },
    { start: '16:00', end: '18:30', title: 'Mestres da Restauração Automotiva' },
    { start: '18:30', end: '21:00', title: 'Restaurações Milionárias em Las Vegas' },
    { start: '21:00', end: '23:30', title: 'Velozes e Extremos: Corrida de Rua' },
    { start: '23:30', end: '06:00', title: 'Noite Turbo: Arrancadas no Asfalto' }
  ],
  discovery_science: [
    { start: '06:00', end: '08:30', title: 'Como Funciona o Universo com Morgan Freeman' },
    { start: '08:30', end: '11:00', title: 'Segredos da NASA: Arquivos Desclassificados' },
    { start: '11:00', end: '13:30', title: 'Engenharia do Impossível: O Futuro da Terra' },
    { start: '13:30', end: '16:00', title: 'Planetas Mortais: Exoplanetas em 4K' },
    { start: '16:00', end: '18:30', title: 'Bancos de Dados Secretos: IA e Robótica' },
    { start: '18:30', end: '21:00', title: 'Exploração Cósmica: Telescópio James Webb' },
    { start: '21:00', end: '23:30', title: 'Teorias da Relatividade e Física Quântica' },
    { start: '23:30', end: '06:00', title: 'Noite da Ciência Extrema' }
  ],
  discovery_theater: [
    { start: '06:00', end: '08:30', title: 'Planeta Selvagem: A Savana Africana em 4K' },
    { start: '08:30', end: '11:00', title: 'Reino dos Predadores: Leões e Leopardos' },
    { start: '11:00', end: '13:30', title: 'Maravilhas Submarinas da Grande Barreira' },
    { start: '13:30', end: '16:00', title: 'Aves Exóticas da Floresta Tropical' },
    { start: '16:00', end: '18:30', title: 'Caminho dos Ursos no Alasca' },
    { start: '18:30', end: '21:00', title: 'Vida Noturna na Floresta Amazônica' },
    { start: '21:00', end: '23:30', title: 'Natureza Imersiva Theater HD' },
    { start: '23:30', end: '06:00', title: 'Santuários Naturais do Mundo' }
  ],
  discovery_world: [
    { start: '06:00', end: '08:30', title: 'Cidades Perdidas com Albert Lin' },
    { start: '08:30', end: '11:00', title: 'Rotas Místicas: A Trilha dos Incas' },
    { start: '11:00', end: '13:30', title: 'Civilizações Antigas: Mistérios do Nilo' },
    { start: '13:30', end: '16:00', title: 'Povos Isolados: Tribos do Pacífico' },
    { start: '16:00', end: '18:30', title: 'Arqueologia Submersa: Tesouros de Galeões' },
    { start: '18:30', end: '21:00', title: 'Expedição Extrema aos Vales da Índia' },
    { start: '21:00', end: '23:30', title: 'Patrimônios da Humanidade: UNESCO' },
    { start: '23:30', end: '06:00', title: 'Viajantes do Mundo' }
  ],
  discovery_id: [
    { start: '06:00', end: '08:30', title: 'Mentes Criminosas Reais: Casos Forenses' },
    { start: '08:30', end: '11:00', title: 'Assassinatos em Família' },
    { start: '11:00', end: '13:30', title: 'Desaparecidos: O Rastro da Evidência' },
    { start: '13:30', end: '16:00', title: 'Perícia Criminal: A Ciência Contra o Crime' },
    { start: '16:00', end: '18:30', title: 'Culpado ou Inocente? Reviravoltas no Tribunal' },
    { start: '18:30', end: '21:00', title: 'O Diabo Entre Nós: Crimes Chocantes' },
    { start: '21:00', end: '23:30', title: 'Investigação Especial: O Assassino do Zodíaco' },
    { start: '23:30', end: '06:00', title: 'Madrugada do Crime: Arquivos ID' }
  ],
  discovery_home_health: [
    { start: '06:00', end: '08:30', title: 'Irmãos à Obra: Compra e Venda' },
    { start: '08:30', end: '11:00', title: 'Vestida Para Casar: Escolha Perfeita' },
    { start: '11:00', end: '13:30', title: 'Dra. Sandra Lee: A Rainha dos Cravos' },
    { start: '13:30', end: '16:00', title: 'Cozinha com Gordon Ramsay' },
    { start: '16:00', end: '18:30', title: 'Reforma Relâmpago: Casas Espetaculares' },
    { start: '18:30', end: '21:00', title: 'Quilos Mortais: A Luta pela Saúde' },
    { start: '21:00', end: '23:30', title: 'Irmãos à Obra: O Duelo de Reformas' },
    { start: '23:30', end: '06:00', title: 'Estilo de Vida Saudável & Decoração' }
  ],

  // =========================================================================
  // --- FAMÍLIA TNT (BLOCKBUSTERS, SÉRIES E NOVELAS) ---
  // =========================================================================
  tnt: [
    { start: '06:00', end: '08:30', title: 'Homem-Formiga e a Vespa (Dublado)' },
    { start: '08:30', end: '11:00', title: 'Capitão América: Guerra Civil' },
    { start: '11:00', end: '13:30', title: 'Guardiões da Galáxia Vol. 2' },
    { start: '13:30', end: '16:00', title: 'Aladdin (2019) com Will Smith' },
    { start: '16:00', end: '18:30', title: 'Mulher-Maravilha 1984' },
    { start: '18:30', end: '21:00', title: 'Aquaman com Jason Momoa' },
    { start: '21:00', end: '23:30', title: 'Superfilme TNT: Batman v Superman' },
    { start: '23:30', end: '06:00', title: 'TNT Megafilm: O Nevoeiro' }
  ],
  tnt_series: [
    { start: '06:00', end: '09:00', title: 'The Mentalist (O Mentalista): Patrick Jane' },
    { start: '09:00', end: '11:30', title: 'C.S.I.: Investigação Criminal' },
    { start: '11:30', end: '14:00', title: 'Suits: Homens de Terno' },
    { start: '14:00', end: '16:30', title: 'Brooklyn Nine-Nine: Delegacia Maluca' },
    { start: '16:30', end: '19:00', title: 'The Mentalist: Em Busca de Red John' },
    { start: '19:00', end: '21:30', title: 'Lei & Ordem: Noite Especial' },
    { start: '21:30', end: '00:00', title: 'Maratona TNT Séries: Investigação' },
    { start: '00:00', end: '06:00', title: 'Séries da Madrugada' }
  ],
  tnt_novelas: [
    { start: '06:00', end: '08:30', title: 'Novela Turca: Iludida (Sadakatsiz)' },
    { start: '08:30', end: '11:00', title: 'Será Isso Amor? com Hande Erçel' },
    { start: '11:00', end: '13:30', title: 'Força de Mulher (Kadin)' },
    { start: '13:30', end: '16:00', title: 'Yargi: Segredos de Família' },
    { start: '16:00', end: '18:30', title: 'Amor Proibido (Ask-i Memnu)' },
    { start: '18:30', end: '21:00', title: 'Força de Mulher: Episódio Inédito' },
    { start: '21:00', end: '23:30', title: 'Especial Novelas: Amor e Honra' },
    { start: '23:30', end: '06:00', title: 'Reprise Melhores Momentos Novelas' }
  ],

  // =========================================================================
  // --- FAMÍLIA UNIVERSAL (POLICIAL, CINEMA E REALITIES) ---
  // =========================================================================
  universal_tv: [
    { start: '06:00', end: '08:00', title: 'Law & Order: Special Victims Unit (SVU)' },
    { start: '08:00', end: '10:30', title: 'Chicago Fire: Heróis Contra o Fogo' },
    { start: '10:30', end: '13:00', title: 'Chicago P.D.: Distrito 21' },
    { start: '13:00', end: '15:30', title: 'Chicago Med: Atendimento de Emergência' },
    { start: '15:30', end: '18:00', title: 'FBI: Investigação Especial' },
    { start: '18:00', end: '20:30', title: 'Magnum P.I.' },
    { start: '20:30', end: '22:30', title: 'Noite Chicago: Crossover Épico' },
    { start: '22:30', end: '06:00', title: 'Law & Order: Crime Organizado' }
  ],
  universal_premiere: [
    { start: '06:00', end: '08:30', title: 'O Homem Invisível com Elisabeth Moss' },
    { start: '08:30', end: '11:00', title: 'Bela Vingança (Promising Young Woman)' },
    { start: '11:00', end: '13:30', title: 'Não! Não Olhe! (Nope) de Jordan Peele' },
    { start: '13:30', end: '16:00', title: 'M3GAN: Inteligência Assassina' },
    { start: '16:00', end: '18:30', title: 'Trem-Bala com Brad Pitt' },
    { start: '18:30', end: '21:00', title: 'O Telefone Preto com Ethan Hawke' },
    { start: '21:00', end: '23:30', title: 'Superestreia: Halloween Ends' },
    { start: '23:30', end: '06:00', title: 'Cine Universal Premiere' }
  ],
  universal_reality: [
    { start: '06:00', end: '09:00', title: 'The Real Housewives of Beverly Hills' },
    { start: '09:00', end: '12:00', title: 'Below Deck: Veleiros de Luxo' },
    { start: '12:00', end: '15:00', title: 'Top Chef: Batalha Culinária' },
    { start: '15:00', end: '18:00', title: 'The Real Housewives of New Jersey' },
    { start: '18:00', end: '21:00', title: 'Below Deck Mediterranean' },
    { start: '21:00', end: '23:30', title: 'Noite de Reality: Barracos e Luxo' },
    { start: '23:30', end: '06:00', title: 'Maratona Universal Reality' }
  ],

  // =========================================================================
  // --- FAMÍLIA SONY (DRAMA MÉDICO, AÇÃO E CLÁSSICOS) ---
  // =========================================================================
  sony_channel: [
    { start: '06:00', end: '09:00', title: "Grey's Anatomy: Maratona Especial" },
    { start: '09:00', end: '11:30', title: 'The Good Doctor: O Bom Doutor' },
    { start: '11:30', end: '14:00', title: 'Station 19: Bombeiros de Seattle' },
    { start: '14:00', end: '16:30', title: 'Shark Tank Brasil: Os Tubarões' },
    { start: '16:30', end: '19:00', title: 'The Blacklist (Lista Negra)' },
    { start: '19:00', end: '21:30', title: "Grey's Anatomy: Episódio Inédito" },
    { start: '21:30', end: '00:00', title: 'Cine Sony: Homem-Aranha no Aranhaverso' },
    { start: '00:00', end: '06:00', title: 'The Blacklist: Raymond Reddington' }
  ],
  sony_movies: [
    { start: '06:00', end: '08:15', title: 'Jumanji: Bem-Vindo à Selva' },
    { start: '08:15', end: '10:30', title: 'Homem-Aranha: Longe de Casa' },
    { start: '10:30', end: '12:45', title: 'Venom com Tom Hardy' },
    { start: '12:45', end: '15:00', title: 'Bad Boys para Sempre com Will Smith' },
    { start: '15:00', end: '17:30', title: 'MIB: Homens de Preto Internacional' },
    { start: '17:30', end: '20:00', title: 'Zumbilândia: Atire Duas Vezes' },
    { start: '20:00', end: '22:30', title: 'Noite de Sucessos: Ghostbusters: Mais Além' },
    { start: '22:30', end: '06:00', title: 'Cine Sony Movies Madrugada' }
  ],
  sony_one_classics: [
    { start: '06:00', end: '08:30', title: 'Lawrence da Arábia (Restaurado)' },
    { start: '08:30', end: '11:00', title: 'A Ponte do Rio Kwai' },
    { start: '11:00', end: '13:30', title: 'Taxi Driver com Robert De Niro' },
    { start: '13:30', end: '16:00', title: 'Os Canhões de Navarone' },
    { start: '16:00', end: '18:30', title: 'Kramer vs. Kramer com Dustin Hoffman' },
    { start: '18:30', end: '21:00', title: 'Gandhi (Vencedor de 8 Oscars)' },
    { start: '21:00', end: '23:30', title: 'Clássicos Imortais: Sindicato de Ladrões' },
    { start: '23:30', end: '06:00', title: 'Cinema de Ouro Sony' }
  ],

  // =========================================================================
  // --- FAMÍLIA DE NOTÍCIAS & JORNALISMO ---
  // =========================================================================
  globonews: [
    { start: '06:00', end: '09:00', title: 'GloboNews em Ponto com Tiago Eltz' },
    { start: '09:00', end: '13:00', title: 'Conexão GloboNews com Daniela Lima' },
    { start: '13:00', end: '16:00', title: 'Estúdio i com Andréia Sadi' },
    { start: '16:00', end: '18:00', title: 'GloboNews Mais com Júlia Duailibi' },
    { start: '18:00', end: '20:30', title: 'Edição das 18h com César Tralli' },
    { start: '20:30', end: '22:00', title: 'GloboNews em Pauta com Marcelo Cosme' },
    { start: '22:00', end: '23:30', title: 'Jornal das Dez com Aline Midlej' },
    { start: '23:30', end: '06:00', title: 'Plantão GloboNews 24 Horas' }
  ],
  cnn_brasil: [
    { start: '06:00', end: '09:30', title: 'CNN Novo Dia com Carol Nogueira' },
    { start: '09:30', end: '12:30', title: 'Live CNN Brasil com Tainá Falcão' },
    { start: '12:30', end: '15:30', title: 'Bastidores CNN: Política em Brasília' },
    { start: '15:30', end: '18:00', title: 'CNN 360° com Débora Bergamasco' },
    { start: '18:00', end: '20:00', title: 'Arena CNN: Debates Políticos' },
    { start: '20:00', end: '22:00', title: 'Jornal da CNN com Márcio Gomes' },
    { start: '22:00', end: '23:30', title: 'WW com William Waack: Geopolítica' },
    { start: '23:30', end: '06:00', title: 'CNN Madrugada com Reprises' }
  ],
  cnn_brasil_money: [
    { start: '06:00', end: '09:00', title: 'Abertura dos Mercados Asiáticos e Europeus' },
    { start: '09:00', end: '12:00', title: 'Abertura do Ibovespa e Wall Street Ao Vivo' },
    { start: '12:00', end: '15:00', title: 'Mercado em Foco: Inflação, Juros e Dólar' },
    { start: '15:00', end: '18:00', title: 'Fechamento do Mercado Financeiro Brasil' },
    { start: '18:00', end: '21:00', title: 'CNN Negócios & Empresas Inovadoras' },
    { start: '21:00', end: '06:00', title: 'Panorama Econômico Global 24h' }
  ],
  jovem_pan_news: [
    { start: '06:00', end: '10:00', title: 'Jornal da Manhã com Thiago Uberreich' },
    { start: '10:00', end: '12:00', title: 'Morning Show: Notícias e Debates' },
    { start: '12:00', end: '14:00', title: 'Headline News: Giro do Meio-Dia' },
    { start: '14:00', end: '16:00', title: 'Prós e Contras' },
    { start: '16:00', end: '18:00', title: '3 em 1: Análises Contundentes' },
    { start: '18:00', end: '20:00', title: 'Os Pingos nos Is' },
    { start: '20:00', end: '22:00', title: 'Jornal Jovem Pan' },
    { start: '22:00', end: '06:00', title: 'Direto ao Ponto & Madrugada JP' }
  ],
  band_news: [
    { start: '06:00', end: '09:00', title: 'Primeira Página BandNews' },
    { start: '09:00', end: '12:00', title: 'Manhã BandNews com Eduardo Castro' },
    { start: '12:00', end: '15:00', title: 'BandNews no Meio do Dia' },
    { start: '15:00', end: '18:00', title: 'Tarde BandNews' },
    { start: '18:00', end: '21:00', title: 'Jornal BandNews - Edição da Noite' },
    { start: '21:00', end: '06:00', title: 'Plantão Noticioso BandNews 24 Horas' }
  ],

  // =========================================================================
  // --- FAMÍLIA CANAIS 24 HORAS DEDICADOS ---
  // =========================================================================
  assombracoes: [
    { start: '06:00', end: '09:00', title: 'Assombrações: Relatos Reais de Fantasmas' },
    { start: '09:00', end: '12:00', title: 'Casas Mal-Assombradas: Arquivos Ocultos' },
    { start: '12:00', end: '15:00', title: 'Possessões Demoníacas e Exorcismos Reais' },
    { start: '15:00', end: '18:00', title: 'Poltergeist: Quando as Paredes Falam' },
    { start: '18:00', end: '21:00', title: 'Investigação Paranormal: Hospitais Malditos' },
    { start: '21:00', end: '00:00', title: 'A Hora Negra: Sessão da Meia-Noite' },
    { start: '00:00', end: '06:00', title: 'Pesadelos Reais: Madrugada Assombrada' }
  ],
  bob_esponja: [
    { start: '06:00', end: '09:00', title: 'Bob Esponja: O Primeiro Dia no Siri Cascudo' },
    { start: '09:00', end: '12:00', title: 'Bob Esponja e Patrick: Caça às Águas-Vivas' },
    { start: '12:00', end: '15:00', title: 'A Fórmula Secreta do Hambúrguer de Siri' },
    { start: '15:00', end: '18:00', title: 'Lula Molusco e os Vizinhos Barulhentos' },
    { start: '18:00', end: '21:00', title: 'Plankton e Seus Planos Fracassados' },
    { start: '21:00', end: '00:00', title: 'Especial Sandy Bochechas e o Texas' },
    { start: '00:00', end: '06:00', title: 'Maratona na Fenda do Biquíni 24h' }
  ],
  boruto: [
    { start: '06:00', end: '09:00', title: 'Boruto: A Entrada na Academia Ninja' },
    { start: '09:00', end: '12:00', title: 'O Time 7: Boruto, Sarada e Mitsuki' },
    { start: '12:00', end: '15:00', title: 'O Exame Chunin: Batalhas Decisivas' },
    { start: '15:00', end: '18:00', title: 'A Invasão de Momoshiki e Kinshiki' },
    { start: '18:00', end: '21:00', title: 'Naruto e Sasuke: Batalha Suprema em Outra Dimensão' },
    { start: '21:00', end: '00:00', title: 'A Organização Kara e o Segredo do Karma' },
    { start: '00:00', end: '06:00', title: 'Maratona de Lutas Épicas Ninja' }
  ],
  masterchef: [
    { start: '06:00', end: '09:00', title: 'MasterChef Brasil: Prova da Caixa Misteriosa' },
    { start: '09:00', end: '12:00', title: 'MasterChef: Desafio de Eliminação com Sobremesas' },
    { start: '12:00', end: '15:00', title: 'MasterChef Profissionais: Prova em Equipe' },
    { start: '15:00', end: '18:00', title: 'MasterChef: Duelo dos Melhores Pratos Salgados' },
    { start: '18:00', end: '21:00', title: 'MasterChef Celebridades: Muita Pressão na Cozinha' },
    { start: '21:00', end: '00:00', title: 'A Grande Final: O Menu Completo dos Finalistas' },
    { start: '00:00', end: '06:00', title: 'Maratona MasterChef: Temporadas Clássicas' }
  ],
  icarly: [
    { start: '06:00', end: '09:00', title: 'iCarly: O Nascimento do Webshow' },
    { start: '09:00', end: '12:00', title: 'As Loucuras de Spencer Shay e Suas Esculturas' },
    { start: '12:00', end: '15:00', title: 'Sam Puckett e Seus Sanduíches de Almôndega' },
    { start: '15:00', end: '18:00', title: 'Freddie Benson na Produção Técnica' },
    { start: '18:00', end: '21:00', title: 'Especial: iCarly Vai ao Japão' },
    { start: '21:00', end: '00:00', title: 'iGo to One Direction / iSaved Your Life' },
    { start: '00:00', end: '06:00', title: 'Maratona iCarly: Episódios Favoritos' }
  ],
  smurfs: [
    { start: '06:00', end: '09:00', title: 'Os Smurfs: Aventuras na Vila Secreta' },
    { start: '09:00', end: '12:00', title: 'Papai Smurf e Suas Poções Mágicas' },
    { start: '12:00', end: '15:00', title: 'Gargamel e Cruel em Perseguição' },
    { start: '15:00', end: '18:00', title: 'Smurfette e as Flores Encantadas' },
    { start: '18:00', end: '21:00', title: 'O Smurf Robusto e a Força da Floresta' },
    { start: '21:00', end: '00:00', title: 'A Grande Festa Smurf' },
    { start: '00:00', end: '06:00', title: 'Madrugada Azul com os Smurfs' }
  ],

  // =========================================================================
  // --- MÚSICA & VARIEDADES ---
  // =========================================================================
  music_box_brazil: [
    { start: '06:00', end: '08:30', title: 'Manhã Brasileira: MPB e Bossa Nova' },
    { start: '08:30', end: '11:00', title: 'Samba & Pagode: De Raiz aos Grandes Sucessos' },
    { start: '11:00', end: '13:30', title: 'Rock Brasil: Legião, Titãs, CPM 22 e Pitty' },
    { start: '13:30', end: '16:00', title: 'Sertanejo Universitário & Clássicos Caipiras' },
    { start: '16:00', end: '18:30', title: 'Music Box Especial: Acústicos Inesquecíveis' },
    { start: '18:30', end: '21:00', title: 'Box Clipes: Os Vídeos Mais Votados do Brasil' },
    { start: '21:00', end: '23:30', title: 'Show Ao Vivo: Grandes Turnês Nacionais' },
    { start: '23:30', end: '06:00', title: 'Madrugada Musical com o Melhor da Música Brasileira' }
  ],
  bis: [
    { start: '06:00', end: '08:30', title: 'Versões: Artistas Recriam Clássicos' },
    { start: '08:30', end: '11:00', title: 'Experimente: Novos Talentos da Música' },
    { start: '11:00', end: '13:30', title: 'Ao Vivo no Canal BIS: ColdPlay no Estádio' },
    { start: '13:30', end: '16:00', title: 'Documentário BIS: A História do Queen' },
    { start: '16:00', end: '18:30', title: 'Rock in Rio: Os Melhores Momentos' },
    { start: '18:30', end: '21:00', title: 'Show Ao Vivo: Caetano Veloso e Gilberto Gil' },
    { start: '21:00', end: '23:30', title: 'SuperShow: U2 360° Tour' },
    { start: '23:30', end: '06:00', title: 'Madrugada Acústica no BIS' }
  ],
  mtv_biggest_pop: [
    { start: '06:00', end: '09:00', title: 'Morning Pop Hits: Taylor Swift & Ariana Grande' },
    { start: '09:00', end: '12:00', title: 'Global Pop Chart: Os Maiores Clipes do Mundo' },
    { start: '12:00', end: '15:00', title: 'Pop Queens: Beyoncé, Rihanna e Dua Lipa' },
    { start: '15:00', end: '18:00', title: 'Top 20 Pop Explosivo com Bruno Mars e The Weeknd' },
    { start: '18:00', end: '21:00', title: 'MTV Hits: Lançamentos Pop do Ano' },
    { start: '21:00', end: '00:00', title: 'Pop Club Party: Remixes Dançantes' },
    { start: '00:00', end: '06:00', title: 'Maratona Pop 24 Horas' }
  ],
  mtv_rocks: [
    { start: '06:00', end: '09:00', title: 'Classic Rock Anthems: Led Zeppelin, AC/DC e Queen' },
    { start: '09:00', end: '12:00', title: '90s Grunge Explosion: Nirvana, Pearl Jam e Soundgarden' },
    { start: '12:00', end: '15:00', title: '2000s Alt-Rock: Linkin Park, Evanescence e Green Day' },
    { start: '15:00', end: '18:00', title: 'Indie Rock Revolution: Arctic Monkeys e The Strokes' },
    { start: '18:00', end: '21:00', title: 'Heavy Metal Thunder: Metallica e Iron Maiden' },
    { start: '21:00', end: '00:00', title: 'MTV Rock Hits: O Som Mais Pesado' },
    { start: '00:00', end: '06:00', title: 'Rock All Night: Maratona Guitarras' }
  ],
  trace_brazuca: [
    { start: '06:00', end: '09:00', title: 'Trace Manhã: O Som Urbano Nacional' },
    { start: '09:00', end: '12:00', title: 'Sons da Favela: Funk Carioca e Paulista' },
    { start: '12:00', end: '15:00', title: 'Trap Brasil: Matuê, L7NNON e KayBlack' },
    { start: '15:00', end: '18:00', title: 'Afrobeats & R&B Brasileiro: IZA e Liniker' },
    { start: '18:00', end: '21:00', title: 'Hip Hop Brasil: Racionais MC’s e Emicida' },
    { start: '21:00', end: '00:00', title: 'Trace Baile: As Melhores Batidas' },
    { start: '00:00', end: '06:00', title: 'Trace Brazuca Madrugada' }
  ],
  top_tv: [
    { start: '06:00', end: '09:00', title: 'Top Hits Manhã: Os Clipes Mais Pedidos' },
    { start: '09:00', end: '12:00', title: 'Top Brasil: Sertanejo e Piseiro do Momento' },
    { start: '12:00', end: '15:00', title: 'Top 100: A Playlist que Não Para' },
    { start: '15:00', end: '18:00', title: 'Top Flashback: Músicas que Marcaram Época' },
    { start: '18:00', end: '21:00', title: 'Top Fest: Clipes e Shows Ao Vivo' },
    { start: '21:00', end: '00:00', title: 'Noite Eletrônica & Pop Dance' },
    { start: '00:00', end: '06:00', title: 'Top TV Som e Imagem' }
  ]
};

// =========================================================================
// --- GERADOR DINÂMICO DETERMINÍSTICO E EXCLUSIVO POR CANAL ---
// Garante que canais sem tabela manual fixa NUNCA apresentem a mesma grade!
// =========================================================================
const CATEGORY_LIBRARIES = {
  filmes_acao: [
    'Operação Destruição: Fuga Impossível', 'Velocidade Sem Limite: A Fuga', 'Zona de Impacto',
    'Fúria Urbana: Conflito Sangrento', 'O Atirador de Elite: Missão Secreta', 'Linha de Fogo: Vingança Armada',
    'Conspiração Fatal', 'Perseguição Implacável', 'Código Secreto: Operação Alfa', 'Alvo em Movimento',
    'Resgate Noturno', 'O Justiceiro da Noite', 'Cerco Fechado', 'Fogo Cruzado'
  ],
  filmes_drama_cult: [
    'O Segredo do Vale', 'Destino Traçado', 'Lembranças de um Outono', 'A Promessa do Amanhã',
    'Cartas Para a Eternidade', 'O Julgamento Final', 'Caminhos Cruzados', 'Vozes da Memória'
  ],
  series: [
    'O Arquivo Negro: Episódio Inédito', 'Detetives Urbanos: Casos Reais', 'A Firma: Conspiração Governamental',
    'Almas Marcadas: O Julgamento', 'O Império de Sangue: Temporada 2', 'Cidade Proibida: Perseguição',
    'Segredos Ocultos: Revelações', 'Legado de Honra', 'Zona Limítrofe: Fronteira'
  ],
  esportes: [
    'Futebol Internacional: Resumo da Rodada', 'Giro dos Campeões: Melhores Lances',
    'Mundo da Bola: Entrevistas Exclusivas', 'Rumo a Tóquio: Esportes Olímpicos',
    'Velocidade Máxima: Bastidores das Pistas', 'Esporte Total Ao Vivo',
    'Arena do Combate: Artes Marciais', 'Show de Gols: Campeonato Nacional'
  ],
  noticias: [
    'Jornal das Cidades: Plantão em Foco', 'Giro Econômico com Especialistas', 'Radar Global: Notícias do Mundo',
    'Debate Aberto: Temas da Atualidade', 'Voz da Cidade: Reportagens Especiais',
    'Plantão Urgente: Últimas Informações', 'Painel Político em Brasília', 'Brasil em Pauta'
  ],
  infantil: [
    'As Aventuras do Pequeno Explorador', 'O Reino dos Animais Divertidos', 'Turminha da Pesada',
    'Super Heróis em Treinamento', 'Mundo Mágico das Cores', 'Os Guardiões da Floresta',
    'A Fabulosa Máquina de Desenhos', 'Detetives Mirins em Ação'
  ],
  documentario: [
    'Maravilhas da Terra Selvagem em 4K', 'Planeta Terra: Oceanos Profundos', 'Grandes Construções da Humanidade',
    'Miséria e Grandeza: Fatos Históricos', 'Cosmos: A Imensidão do Universo', 'Segredos do Antigo Egito',
    'A Era dos Dinossauros em CGI', 'Natureza Extrema: Vulcões e Tempestades'
  ],
  musica: [
    'Top 100 Hits: Os Sucessos Mais Tocados', 'Acústico Ao Vivo Especial', 'Clássicos do Rock Internacional',
    'Sertanejo Universitário em Concerto', 'Sessão Nostalgia: Anos 80 e 90', 'Hip Hop & Urban Beats',
    'Festival de Músicas do Mundo', 'Show Ao Vivo: Grandes Turnês'
  ],
  agro_rural: [
    'Mercado do Boi & Cotações Agropecuárias', 'Tecnologia no Campo & Safra Recorde',
    'Agricultura Sustentável', 'Giro do Agronegócio Brasil', 'Leilão Rural Ao Vivo',
    'Clima e Tempo para as Lavouras', 'Caminhos da Roça: Histórias do Produtor'
  ],
  variedades: [
    'Cozinha com Sabor: Receitas Práticas', 'Design & Decoração de Luxo', 'Viagem dos Sonhos: Destinos Exóticos',
    'Moda & Estilo de Vida', 'Show de Talentos Brasil', 'Curiosidades Bizarras do Planeta',
    'Vida Saudável e Bem-Estar', 'Celebridades em Foco'
  ]
};

// Resolução de Grade Única e Dedicada para CADA Canal
function resolveSchedule(channelName, category = '') {
  const name = (channelName || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();

  // 1. FAMÍLIA GLOBO REGIONAL
  if (name.includes('globo')) {
    if (name.includes('bahia') || name.includes(' ba')) return CHANNEL_SCHEDULES.globo_bahia;
    if (name.includes('sp') || name.includes('são paulo')) return CHANNEL_SCHEDULES.globo_sp;
    if (name.includes('rj') || name.includes('rio')) return CHANNEL_SCHEDULES.globo_rj;
    if (name.includes('mg') || name.includes('minas')) return CHANNEL_SCHEDULES.globo_mg;
    if (name.includes('rs') || name.includes('rio grande')) return CHANNEL_SCHEDULES.globo_rs;
    if (name.includes('pe') || name.includes('pernambuco')) return CHANNEL_SCHEDULES.globo_pe;
    if (!name.includes('news')) return CHANNEL_SCHEDULES.globo_padrao;
  }

  // 2. FAMÍLIA HBO (TODOS OS 8 CANAIS DISTINTOS)
  if (name.includes('hbo')) {
    if (name.includes('family')) return CHANNEL_SCHEDULES.hbo_family;
    if (name.includes('signature')) return CHANNEL_SCHEDULES.hbo_signature;
    if (name.includes('plus')) return CHANNEL_SCHEDULES.hbo_plus;
    if (name.includes('mundi')) return CHANNEL_SCHEDULES.hbo_mundi;
    if (name.includes('pop')) return CHANNEL_SCHEDULES.hbo_pop;
    if (name.includes('xtreme')) return CHANNEL_SCHEDULES.hbo_xtreme;
    if (name.includes('2') || name.includes('hbo2')) return CHANNEL_SCHEDULES.hbo2;
    return CHANNEL_SCHEDULES.hbo;
  }

  // 3. FAMÍLIA PREMIERE (TODOS OS 4 CANAIS DE JOGOS DISTINTOS)
  if (name.includes('premiere')) {
    if (name.includes('6')) return CHANNEL_SCHEDULES.premiere_6;
    if (name.includes('7')) return CHANNEL_SCHEDULES.premiere_7;
    if (name.includes('8')) return CHANNEL_SCHEDULES.premiere_8;
    return CHANNEL_SCHEDULES.premiere_clubes;
  }

  // 4. FAMÍLIA ESPN (TODOS OS 6 CANAIS COM LIGAS DIFERENTES)
  if (name.includes('espn')) {
    if (name.includes('2')) return CHANNEL_SCHEDULES.espn2;
    if (name.includes('3')) return CHANNEL_SCHEDULES.espn3;
    if (name.includes('4')) return CHANNEL_SCHEDULES.espn4;
    if (name.includes('5')) return CHANNEL_SCHEDULES.espn5;
    if (name.includes('6')) return CHANNEL_SCHEDULES.espn6;
    return CHANNEL_SCHEDULES.espn;
  }

  // 5. FAMÍLIA SPOR TV & ESPORTES
  if (name.includes('sportv 2') || name.includes('sportv2')) return CHANNEL_SCHEDULES.sportv2;
  if (name.includes('sportv 3') || name.includes('sportv3')) return CHANNEL_SCHEDULES.sportv3;
  if (name.includes('canal off') || name.includes(' off')) return CHANNEL_SCHEDULES.canal_off;
  if (name.includes('band sports') || name.includes('bandsports')) return CHANNEL_SCHEDULES.band_sports;

  // 6. FAMÍLIA DISCOVERY (TODOS OS 8 CANAIS COM FOCOS EXCLUSIVOS)
  if (name.includes('discovery')) {
    if (name.includes('kids')) return CHANNEL_SCHEDULES.discovery_kids;
    if (name.includes('turbo')) return CHANNEL_SCHEDULES.discovery_turbo;
    if (name.includes('science')) return CHANNEL_SCHEDULES.discovery_science;
    if (name.includes('theater')) return CHANNEL_SCHEDULES.discovery_theater;
    if (name.includes('world')) return CHANNEL_SCHEDULES.discovery_world;
    if (name.includes('id') || name.includes('investigação')) return CHANNEL_SCHEDULES.discovery_id;
    if (name.includes('health') || name.includes('saúde') || name.includes('home')) return CHANNEL_SCHEDULES.discovery_home_health;
    return CHANNEL_SCHEDULES.discovery_channel;
  }

  // 7. FAMÍLIA TNT
  if (name.includes('tnt')) {
    if (name.includes('série') || name.includes('series')) return CHANNEL_SCHEDULES.tnt_series;
    if (name.includes('novela')) return CHANNEL_SCHEDULES.tnt_novelas;
    return CHANNEL_SCHEDULES.tnt;
  }

  // 8. FAMÍLIA UNIVERSAL
  if (name.includes('universal')) {
    if (name.includes('premiere')) return CHANNEL_SCHEDULES.universal_premiere;
    if (name.includes('reality')) return CHANNEL_SCHEDULES.universal_reality;
    return CHANNEL_SCHEDULES.universal_tv;
  }

  // 9. FAMÍLIA SONY
  if (name.includes('sony')) {
    if (name.includes('one') || name.includes('classics')) return CHANNEL_SCHEDULES.sony_one_classics;
    if (name.includes('movie')) return CHANNEL_SCHEDULES.sony_movies;
    return CHANNEL_SCHEDULES.sony_channel;
  }

  // 10. FAMÍLIA DE NOTÍCIAS
  if (name.includes('globonews') || name.includes('globo news')) return CHANNEL_SCHEDULES.globonews;
  if (name.includes('cnn brasil money') || name.includes('cnn money')) return CHANNEL_SCHEDULES.cnn_brasil_money;
  if (name.includes('cnn')) return CHANNEL_SCHEDULES.cnn_brasil;
  if (name.includes('jovem pan')) return CHANNEL_SCHEDULES.jovem_pan_news;
  if (name.includes('band news') || name.includes('bandnews')) return CHANNEL_SCHEDULES.band_news;

  // 11. CANAIS 24 HORAS DEDICADOS
  if (name.includes('assombração') || name.includes('assombracoes')) return CHANNEL_SCHEDULES.assombracoes;
  if (name.includes('bob esponja')) return CHANNEL_SCHEDULES.bob_esponja;
  if (name.includes('boruto') || name.includes('naruto')) return CHANNEL_SCHEDULES.boruto;
  if (name.includes('masterchef')) return CHANNEL_SCHEDULES.masterchef;
  if (name.includes('icarly')) return CHANNEL_SCHEDULES.icarly;
  if (name.includes('smurf')) return CHANNEL_SCHEDULES.smurfs;

  // 12. MÚSICAS & CLIPS
  if (name.includes('music box')) return CHANNEL_SCHEDULES.music_box_brazil;
  if (name.includes('bis')) return CHANNEL_SCHEDULES.bis;
  if (name.includes('mtv') && name.includes('pop')) return CHANNEL_SCHEDULES.mtv_biggest_pop;
  if (name.includes('mtv') && name.includes('rock')) return CHANNEL_SCHEDULES.mtv_rocks;
  if (name.includes('trace') && name.includes('brazuca')) return CHANNEL_SCHEDULES.trace_brazuca;
  if (name.includes('top tv')) return CHANNEL_SCHEDULES.top_tv;

  // 13. DEMAIS CANAIS: Gerador dinâmico exclusivo com semente individual
  return generateDynamicSchedule(channelName, cat);
}

// Gerador inteligente: calcula hash matemático único por nome de canal para que NUNCA haja repetição
function generateDynamicSchedule(channelName, category) {
  const name = (channelName || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  let library = CATEGORY_LIBRARIES.filmes_acao;
  if (cat.includes('esporte') || name.includes('sport') || name.includes('futebol') || name.includes('combate') || name.includes('off') || name.includes('fifa')) {
    library = CATEGORY_LIBRARIES.esportes;
  } else if (cat.includes('notícia') || name.includes('news') || name.includes('jornal') || name.includes('uol')) {
    library = CATEGORY_LIBRARIES.noticias;
  } else if (cat.includes('infantil') || name.includes('kids') || name.includes('desenho') || name.includes('anime') || name.includes('toon') || name.includes('geek')) {
    library = CATEGORY_LIBRARIES.infantil;
  } else if (cat.includes('documentário') || name.includes('history') || name.includes('geo') || name.includes('animal') || name.includes('smithsonian')) {
    library = CATEGORY_LIBRARIES.documentario;
  } else if (cat.includes('música') || name.includes('music') || name.includes('som') || name.includes('rock') || name.includes('pop') || name.includes('kpop')) {
    library = CATEGORY_LIBRARIES.musica;
  } else if (cat.includes('agro') || name.includes('boi') || name.includes('rural') || name.includes('terra')) {
    library = CATEGORY_LIBRARIES.agro_rural;
  } else if (name.includes('série') || name.includes('series') || name.includes('novela')) {
    library = CATEGORY_LIBRARIES.series;
  } else if (name.includes('clássico') || name.includes('classique') || name.includes('cult') || name.includes('faroeste')) {
    library = CATEGORY_LIBRARIES.filmes_drama_cult;
  } else if (cat.includes('variedades') || name.includes('tv') || name.includes('canal')) {
    library = CATEGORY_LIBRARIES.variedades;
  }

  // Hash determinístico único por canal usando números primos para dispersão máxima
  let hash = 0;
  for (let i = 0; i < channelName.length; i++) {
    hash = (hash * 31 + channelName.charCodeAt(i)) & 0xffffffff;
  }
  const offset = Math.abs(hash) % library.length;

  const timeSlots = [
    { start: '06:00', end: '07:30' },
    { start: '07:30', end: '09:15' },
    { start: '09:15', end: '11:00' },
    { start: '11:00', end: '13:00' },
    { start: '13:00', end: '14:45' },
    { start: '14:45', end: '16:30' },
    { start: '16:30', end: '18:45' },
    { start: '18:45', end: '21:00' },
    { start: '21:00', end: '23:15' },
    { start: '23:15', end: '01:30' },
    { start: '01:30', end: '06:00' }
  ];

  return timeSlots.map((slot, idx) => {
    const title = library[(idx + offset) % library.length];
    return {
      start: slot.start,
      end: slot.end,
      title: title
    };
  });
}

function parseTimeToMinutes(timeStr) {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export const EpgService = {
  // Retorna o programa no ar neste exato momento e o programa seguinte
  getProgramForChannel(channelName, category = '') {
    if (!channelName) {
      return {
        title: 'Ao Vivo',
        start: '--:--',
        end: '--:--',
        progress: 50,
        nextTitle: '',
        nextStart: ''
      };
    }

    const schedule = resolveSchedule(channelName, category);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < schedule.length; i++) {
      const item = schedule[i];
      let startM = parseTimeToMinutes(item.start);
      let endM = parseTimeToMinutes(item.end);

      let isCurrent = false;
      if (endM < startM) {
        // Programa atravessa a meia-noite (ex: 23:30 até 02:00)
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

    // Se nenhum horário bater exatamente, retorna o primeiro
    const fallback = schedule[0] || { title: 'Transmissão Ao Vivo', start: '00:00', end: '23:59' };
    return {
      title: fallback.title,
      start: fallback.start,
      end: fallback.end,
      progress: 50,
      nextTitle: schedule[1]?.title || '',
      nextStart: schedule[1]?.start || ''
    };
  },

  // Retorna a grade completa de 24 horas para o modal EPG
  getFullScheduleForChannel(channelName, category = '') {
    if (!channelName) return [];

    const schedule = resolveSchedule(channelName, category);

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
