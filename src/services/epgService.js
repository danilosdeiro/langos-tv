// EPG Service — Grade de Programação em Tempo Real (Electronic Program Guide)
// Programação única, detalhada e autêntica para cada canal (Telecine, HBO, Canais Abertos, Esportes, Filmes e Desenhos)

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
    { start: '16:00', end: '17:30', title: 'Sessão da Tarde: Juntos e Misturados' },
    { start: '17:30', end: '18:30', title: 'Vale a Pena Ver de Novo: Alma Gêmea' },
    { start: '18:30', end: '19:15', title: 'Novela das Seis: No Rancho Fundo' },
    { start: '19:15', end: '19:45', title: 'Praça TV (2ª Edição)' },
    { start: '19:45', end: '20:30', title: 'Novela das Sete: Família é Tudo' },
    { start: '20:30', end: '21:20', title: 'Jornal Nacional' },
    { start: '21:20', end: '22:30', title: 'Novela das Nove: Renascer' },
    { start: '22:30', end: '23:45', title: 'Futebol Ao Vivo / Cine Holliúdy' },
    { start: '23:45', end: '00:30', title: 'Jornal da Globo' },
    { start: '00:30', end: '01:15', title: 'Conversa com Bial' },
    { start: '01:15', end: '06:00', title: 'Corujão: O Homem de Aço' }
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
    { start: '22:45', end: '00:30', title: 'Cine Espetacular: Rampage - Destruição Total' },
    { start: '00:30', end: '01:30', title: 'The Noite com Danilo Gentili' },
    { start: '01:30', end: '06:00', title: 'Operação Mesquita / SBT News na Madrugada' }
  ],
  record: [
    { start: '06:00', end: '08:40', title: 'Balanço Geral Manhã' },
    { start: '08:40', end: '10:00', title: 'Fala Brasil' },
    { start: '10:00', end: '11:50', title: 'Hoje em Dia' },
    { start: '11:50', end: '15:30', title: 'Balanço Geral com Reinaldo Gottino' },
    { start: '15:30', end: '16:45', title: 'A Terra Prometida' },
    { start: '16:45', end: '19:50', title: 'Cidade Alerta com Luiz Bacci' },
    { start: '19:50', end: '20:45', title: 'Jornal da Record' },
    { start: '20:45', end: '21:45', title: 'Reis - A Conquista' },
    { start: '21:45', end: '22:45', title: 'Gênesis' },
    { start: '22:45', end: '00:00', title: 'A Grande Conquista / Câmera Record' },
    { start: '00:00', end: '06:00', title: 'JR 24h / Fala Que Eu Te Escuto' }
  ],
  band: [
    { start: '06:00', end: '09:00', title: 'Bora Brasil' },
    { start: '09:00', end: '11:00', title: 'The Chef com Edu Guedes' },
    { start: '11:00', end: '13:00', title: 'Jogo Aberto com Renata Fan' },
    { start: '13:00', end: '14:30', title: 'Os Donos da Bola com Craque Neto' },
    { start: '14:30', end: '16:00', title: 'Melhor da Tarde com Catia Fonseca' },
    { start: '16:00', end: '19:20', title: 'Brasil Urgente com José Luiz Datena' },
    { start: '19:20', end: '20:30', title: 'Jornal da Band' },
    { start: '20:30', end: '22:00', title: 'Melhor da Noite com Glenda Kozlowski' },
    { start: '22:00', end: '23:30', title: 'MasterChef Brasil' },
    { start: '23:30', end: '06:00', title: 'Jornal da Noite & Linha de Combate' }
  ],

  // --- REDE TELECINE (CADA CANAL COM GRADE ÚNICA E DISTINTA) ---
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
    { start: '22:00', end: '00:15', title: 'Trem-Bala com Brad Pitt' },
    { start: '00:15', end: '02:30', title: 'Tropa de Elite 2: O Inimigo Agora é Outro' },
    { start: '02:30', end: '06:00', title: 'Busca Implacável com Liam Neeson' }
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
    { start: '22:15', end: '00:30', title: 'Transformers: O Despertar das Feras (Dublado)' },
    { start: '00:30', end: '06:00', title: 'Todo Mundo em Pânico 3 (Dublado)' }
  ],
  telecine_touch: [
    { start: '06:00', end: '08:15', title: 'A Culpa é das Estrelas' },
    { start: '08:15', end: '10:30', title: 'Como Eu Era Antes de Você' },
    { start: '10:30', end: '12:45', title: 'Questão de Tempo' },
    { start: '12:45', end: '15:00', title: 'O Diabo Veste Prada' },
    { start: '15:00', end: '17:15', title: 'Extraordinário com Julia Roberts' },
    { start: '17:15', end: '19:30', title: 'Simplesmente Acontece' },
    { start: '19:30', end: '22:00', title: 'Especial Emoção: Diário de uma Paixão' },
    { start: '22:00', end: '00:15', title: 'Nasce uma Estrela com Lady Gaga' },
    { start: '00:15', end: '06:00', title: 'Um Lugar Chamado Notting Hill' }
  ],
  telecine_fun: [
    { start: '06:00', end: '07:45', title: 'Kung Fu Panda 3' },
    { start: '07:45', end: '09:30', title: 'Madagascar 3: Os Procurados' },
    { start: '09:30', end: '11:30', title: 'Se Beber, Não Case! Parte 2' },
    { start: '11:30', end: '13:30', title: 'Ted 2' },
    { start: '13:30', end: '15:30', title: 'O Máskara com Jim Carrey' },
    { start: '15:30', end: '17:30', title: 'Esposa de Mentirinha com Adam Sandler' },
    { start: '17:30', end: '19:45', title: 'Debi & Lóide 2' },
    { start: '19:45', end: '22:00', title: 'Noite de Risos: American Pie' },
    { start: '22:00', end: '00:00', title: 'Trovão Tropical' },
    { start: '00:00', end: '06:00', title: 'Todo Mundo Quase Morto' }
  ],
  telecine_cult: [
    { start: '06:00', end: '08:30', title: 'Cinema Paradiso' },
    { start: '08:30', end: '11:00', title: 'Pulp Fiction: Tempo de Violência' },
    { start: '11:00', end: '13:30', title: 'Laranja Mecânica de Stanley Kubrick' },
    { start: '13:30', end: '16:00', title: 'Taxi Driver com Robert De Niro' },
    { start: '16:00', end: '18:30', title: 'O Poderoso Chefão (Parte 1)' },
    { start: '18:30', end: '21:00', title: 'O Poderoso Chefão (Parte 2)' },
    { start: '21:00', end: '23:30', title: 'Clássicos Imortais: Scarface com Al Pacino' },
    { start: '23:30', end: '02:00', title: '2001: Uma Odisseia no Espaço' },
    { start: '02:00', end: '06:00', title: 'Cidadão Kane de Orson Welles' }
  ],

  // --- REDE HBO (CADA CANAL COM GRADE PRÓPRIA) ---
  hbo: [
    { start: '06:00', end: '07:30', title: 'The Last of Us (T1:E1)' },
    { start: '07:30', end: '09:30', title: 'Duna (2021)' },
    { start: '09:30', end: '11:30', title: 'The Batman com Robert Pattinson' },
    { start: '11:30', end: '13:30', title: 'O Esquadrão Suicida' },
    { start: '13:30', end: '15:30', title: 'Wonka (2023)' },
    { start: '15:30', end: '17:30', title: 'Aquaman e o Reino Perdido' },
    { start: '17:30', end: '19:30', title: 'Succession (Temporada Final)' },
    { start: '19:30', end: '21:00', title: 'Euphoria' },
    { start: '21:00', end: '22:30', title: 'House of the Dragon (A Casa do Dragão)' },
    { start: '22:30', end: '01:00', title: 'Coringa (Joker) com Joaquin Phoenix' },
    { start: '01:00', end: '06:00', title: 'Game of Thrones: Maratona' }
  ],
  hbo2: [
    { start: '06:00', end: '08:30', title: 'Godzilla e Kong: O Novo Império' },
    { start: '08:30', end: '11:00', title: 'Interestelar de Christopher Nolan' },
    { start: '11:00', end: '13:30', title: 'Mad Max: Estrada da Fúria' },
    { start: '13:30', end: '16:00', title: 'Matrix Resurrections' },
    { start: '16:00', end: '18:30', title: 'Chernobyl: Minissérie HBO' },
    { start: '18:30', end: '21:00', title: 'True Detective: Terra Noturna' },
    { start: '21:00', end: '23:30', title: 'Especial HBO: Oppenheimer' },
    { start: '23:30', end: '06:00', title: 'Westworld: Futuro Sombrio' }
  ],
  hbo_family: [
    { start: '06:00', end: '07:45', title: 'As Aventuras de Paddington' },
    { start: '07:45', end: '09:30', title: 'Space Jam: Um Novo Legado' },
    { start: '09:30', end: '11:30', title: 'Harry Potter e a Pedra Filosofal' },
    { start: '11:30', end: '13:45', title: 'Harry Potter e a Câmara Secreta' },
    { start: '13:45', end: '16:00', title: 'Animais Fantásticos e Onde Habitam' },
    { start: '16:00', end: '18:00', title: 'Liga dos Superpets' },
    { start: '18:00', end: '20:00', title: 'DC Liga da Justiça: Ação' },
    { start: '20:00', end: '22:00', title: 'A Fantástica Fábrica de Chocolate' },
    { start: '22:00', end: '06:00', title: 'Maratona HBO Family Kids' }
  ],
  hbo_signature: [
    { start: '06:00', end: '08:30', title: 'Família Soprano: Clássico' },
    { start: '08:30', end: '10:45', title: 'The Wire: A Escuta' },
    { start: '10:45', end: '13:00', title: 'Band of Brothers (Irmãos de Guerra)' },
    { start: '13:00', end: '15:30', title: 'Roma: Série Original HBO' },
    { start: '15:30', end: '18:00', title: 'Six Feet Under (A Sete Palmos)' },
    { start: '18:00', end: '20:30', title: 'Mare of Easttown' },
    { start: '20:30', end: '22:30', title: 'The White Lotus (Temporada 2)' },
    { start: '22:30', end: '06:00', title: 'Cine Signature: Festivais Internacionais' }
  ],

  // --- FILMES & SÉRIES ---
  megapix: [
    { start: '06:00', end: '08:00', title: 'Crepúsculo: Eclipse' },
    { start: '08:00', end: '10:00', title: 'Resident Evil 5: Retribuição' },
    { start: '10:00', end: '12:30', title: 'Transformers: A Era da Extinção' },
    { start: '12:30', end: '15:00', title: 'Rambo 4 com Sylvester Stallone' },
    { start: '15:00', end: '17:30', title: 'Os Mercenários 3' },
    { start: '17:30', end: '20:00', title: 'O Protetor com Denzel Washington' },
    { start: '20:00', end: '22:30', title: 'Megapix Sem Freio: John Wick' },
    { start: '22:30', end: '06:00', title: 'Invasão a Casa Branca' }
  ],
  warner: [
    { start: '06:00', end: '09:00', title: 'Friends: Maratona Especial' },
    { start: '09:00', end: '12:00', title: 'The Big Bang Theory' },
    { start: '12:00', end: '14:30', title: 'Supernatural: Sobrenatural' },
    { start: '14:30', end: '17:00', title: 'Arrow (Arqueiro Verde)' },
    { start: '17:00', end: '19:30', title: 'Liga da Justiça de Zack Snyder' },
    { start: '19:30', end: '22:00', title: 'Coringa com Joaquin Phoenix' },
    { start: '22:00', end: '06:00', title: 'Mad Max: Estrada da Fúria' }
  ],
  space: [
    { start: '06:00', end: '08:15', title: 'Duro de Matar: Um Bom Dia Para Morrer' },
    { start: '08:15', end: '10:30', title: 'Velocidade Máxima com Keanu Reeves' },
    { start: '10:30', end: '12:45', title: 'Invasão a Londres com Gerard Butler' },
    { start: '12:45', end: '15:15', title: 'O Vingador do Futuro' },
    { start: '15:15', end: '17:30', title: 'Carga Explosiva com Jason Statham' },
    { start: '17:30', end: '20:00', title: 'Linha de Frente com Jason Statham' },
    { start: '20:00', end: '22:30', title: 'Clube da Luta Space: O Grande Dragão Branco' },
    { start: '22:30', end: '01:00', title: 'Uma Noite de Crime: Anarquia' },
    { start: '01:00', end: '06:00', title: 'Madrugada do Terror: Sobrenatural' }
  ],
  tnt: [
    { start: '06:00', end: '08:30', title: 'Homem-Formiga e a Vespa' },
    { start: '08:30', end: '11:00', title: 'Capitão América: Guerra Civil' },
    { start: '11:00', end: '13:30', title: 'Guardiões da Galáxia Vol. 2' },
    { start: '13:30', end: '16:00', title: 'Aladdin (2019)' },
    { start: '16:00', end: '18:30', title: 'Mulher-Maravilha 1984' },
    { start: '18:30', end: '21:00', title: 'Aquaman com Jason Momoa' },
    { start: '21:00', end: '23:30', title: 'Superfilme TNT: Batman v Superman' },
    { start: '23:30', end: '06:00', title: 'TNT Megafilm: O Nevoeiro' }
  ],
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
  sony_channel: [
    { start: '06:00', end: '09:00', title: "Grey's Anatomy (Maratona)" },
    { start: '09:00', end: '11:30', title: 'The Good Doctor: O Bom Doutor' },
    { start: '11:30', end: '14:00', title: 'Station 19' },
    { start: '14:00', end: '16:30', title: 'Shark Tank Brasil: Os Tubarões' },
    { start: '16:30', end: '19:00', title: 'The Blacklist (Lista Negra)' },
    { start: '19:00', end: '21:30', title: "Grey's Anatomy: Episódio Inédito" },
    { start: '21:30', end: '00:00', title: 'Cine Sony: Homem-Aranha no Aranhaverso' },
    { start: '00:00', end: '06:00', title: 'The Blacklist: Temporada Especial' }
  ],
  axn: [
    { start: '06:00', end: '08:30', title: 'C.S.I.: Investigação Criminal' },
    { start: '08:30', end: '11:00', title: 'CSI: Miami com Horatio Caine' },
    { start: '11:00', end: '13:30', title: 'CSI: Nova York' },
    { start: '13:30', end: '16:00', title: 'NCIS: Investigação Naval' },
    { start: '16:00', end: '18:30', title: 'Criminal Minds: Mentes Criminosas' },
    { start: '18:30', end: '21:00', title: 'S.W.A.T.: Força de Intervenção' },
    { start: '21:00', end: '23:30', title: 'Noite de Ação AXN: Alvo Duplo' },
    { start: '23:30', end: '06:00', title: 'Candice Renoir / CSI Vegas' }
  ],

  // --- CANAIS DE ESPORTE ---
  sportv: [
    { start: '06:00', end: '09:00', title: 'Redação SporTV com Marcelo Barreto' },
    { start: '09:00', end: '12:00', title: 'SporTV News - Edição da Manhã' },
    { start: '12:00', end: '13:00', title: 'Seleção SporTV com André Rizek' },
    { start: '13:00', end: '15:30', title: 'Giro da Rodada & Pré-Jogo' },
    { start: '15:30', end: '18:00', title: 'Tá na Área' },
    { start: '18:00', end: '21:30', title: 'Futebol Ao Vivo: Brasileirão Série A' },
    { start: '21:30', end: '23:00', title: 'Troca de Passes com Felipe Diniz' },
    { start: '23:00', end: '06:00', title: 'SporTV News Noite & Melhores Momentos' }
  ],
  sportv2: [
    { start: '06:00', end: '09:00', title: 'Vôlei Ao Vivo: Superliga Masculina' },
    { start: '09:00', end: '12:00', title: 'Basquete NBA: Melhores Lances' },
    { start: '12:00', end: '15:00', title: 'Futsal Ao Vivo: Liga Nacional' },
    { start: '15:00', end: '18:00', title: 'Judô / Ginástica Artística: Circuito Mundial' },
    { start: '18:00', end: '21:00', title: 'Vôlei Ao Vivo: Superliga Feminina' },
    { start: '21:00', end: '23:30', title: 'SporTV 2 Especial: Campeões da Areia' },
    { start: '23:30', end: '06:00', title: 'Reprise Melhores Momentos SporTV 2' }
  ],
  sportv3: [
    { start: '06:00', end: '10:00', title: 'Automobilismo: Stock Car & F-E' },
    { start: '10:00', end: '13:00', title: 'Tênis Ao Vivo: Circuito ATP / WTA' },
    { start: '13:00', end: '16:00', title: 'Surfe WSL: Circuito Mundial' },
    { start: '16:00', end: '19:00', title: 'Atletismo & Esportes Radicais' },
    { start: '19:00', end: '22:00', title: 'Futebol Internacional Ao Vivo' },
    { start: '22:00', end: '06:00', title: 'Faixa Noturna SporTV 3' }
  ],
  espn: [
    { start: '06:00', end: '09:00', title: 'SportsCenter - 1ª Edição' },
    { start: '09:00', end: '12:00', title: 'ESPN F90 com Daniela Boaventura' },
    { start: '12:00', end: '15:00', title: 'ESPN Futebol no Mundo' },
    { start: '15:00', end: '18:00', title: 'Premier League Ao Vivo (Inglês)' },
    { start: '18:00', end: '20:00', title: 'ESPN FC' },
    { start: '20:00', end: '23:00', title: 'Copa Libertadores da América Ao Vivo' },
    { start: '23:00', end: '06:00', title: 'SportsCenter - Edição da Noite' }
  ],
  espn2: [
    { start: '06:00', end: '09:00', title: 'SportsCenter Matinal' },
    { start: '09:00', end: '12:30', title: 'La Liga Ao Vivo (Campeonato Espanhol)' },
    { start: '12:30', end: '15:30', title: 'Serie A Ao Vivo (Campeonato Italiano)' },
    { start: '15:30', end: '18:30', title: 'Ligue 1 Ao Vivo (Francês)' },
    { start: '18:30', end: '21:30', title: 'Linha de Passe: Mesa Redonda' },
    { start: '21:30', end: '00:00', title: 'Basquete NBA Ao Vivo' },
    { start: '00:00', end: '06:00', title: 'Madrugada ESPN 2: Compactos' }
  ],
  espn4: [
    { start: '06:00', end: '10:00', title: 'NFL: Melhores Momentos & Análises' },
    { start: '10:00', end: '14:00', title: 'Tênis: Grand Slam Ao Vivo' },
    { start: '14:00', end: '18:00', title: 'Futebol Europeu: Copa da Inglaterra' },
    { start: '18:00', end: '21:00', title: 'ESPN Knockout: Boxe & MMA' },
    { start: '21:00', end: '00:30', title: 'NFL Ao Vivo: Sunday/Monday Night' },
    { start: '00:30', end: '06:00', title: 'Giro de Gols ESPN' }
  ],
  cazetv: [
    { start: '06:00', end: '11:00', title: 'Melhores Momentos & Gols da Rodada' },
    { start: '11:00', end: '14:00', title: 'Resenha da CazéTV com Casimiro' },
    { start: '14:00', end: '18:00', title: 'Transmissão Esportiva Ao Vivo' },
    { start: '18:00', end: '21:30', title: 'Jogo Ao Vivo com Casimiro e Equipe' },
    { start: '21:30', end: '00:00', title: 'Pós-Jogo, Entrevistas & Reações' },
    { start: '00:00', end: '06:00', title: 'Maratona CazéTV: Melhores Reações' }
  ],
  premiere: [
    { start: '06:00', end: '10:00', title: 'Gols da Rodada: Brasileirão Série A' },
    { start: '10:00', end: '13:00', title: 'Especial Grandes Clássicos Nacionais' },
    { start: '13:00', end: '16:00', title: 'Aquecimento Premiere: Escalações' },
    { start: '16:00', end: '18:30', title: 'Futebol Ao Vivo: Brasileirão Série A' },
    { start: '18:30', end: '21:00', title: 'Futebol Ao Vivo: Rodada Dupla' },
    { start: '21:00', end: '23:30', title: 'Fim de Jogo: Entrevistas no Gramado' },
    { start: '23:30', end: '06:00', title: 'Faixa Campeã: Melhores Jogos' }
  ],

  // --- INFANTIL & ANIMAÇÃO ---
  cartoon_network: [
    { start: '06:00', end: '07:30', title: 'O Incrível Mundo de Gumball' },
    { start: '07:30', end: '09:00', title: 'Jovens Titãs em Ação!' },
    { start: '09:00', end: '10:30', title: 'Hora de Aventura com Finn e Jake' },
    { start: '10:30', end: '12:00', title: 'Apenas um Show' },
    { start: '12:00', end: '13:30', title: 'Ben 10: Força Alienígena' },
    { start: '13:30', end: '15:00', title: 'Ursos sem Curso' },
    { start: '15:00', end: '16:30', title: 'Steven Universo' },
    { start: '16:30', end: '18:00', title: 'O Incrível Mundo de Gumball' },
    { start: '18:00', end: '20:00', title: 'Jovens Titãs em Ação: Maratona' },
    { start: '20:00', end: '22:00', title: 'Cine Cartoon: Liga da Justiça em Ação' },
    { start: '22:00', end: '06:00', title: 'Adult Swim no Cartoon' }
  ],
  discovery_kids: [
    { start: '06:00', end: '07:30', title: 'Peppa Pig' },
    { start: '07:30', end: '09:00', title: 'Patrulha Canina: Filhotes em Ação' },
    { start: '09:00', end: '10:30', title: 'O Show da Luna!' },
    { start: '10:30', end: '12:00', title: 'Mini Beat Power Rockers' },
    { start: '12:00', end: '13:30', title: 'Doki Descobre o Mundo' },
    { start: '13:30', end: '15:00', title: 'PJ Masks: Heróis de Pijama' },
    { start: '15:00', end: '16:30', title: 'Peppa Pig: Novas Aventuras' },
    { start: '16:30', end: '18:30', title: 'Patrulha Canina: Missões Radicais' },
    { start: '18:30', end: '20:30', title: 'Cine Clube Kids: Carros Divertidos' },
    { start: '20:30', end: '06:00', title: 'Madrugada Divertida Discovery Kids' }
  ],
  nickelodeon: [
    { start: '06:00', end: '08:00', title: 'Bob Esponja Calça Quadrada' },
    { start: '08:00', end: '10:00', title: 'Os Padrinhos Mágicos' },
    { start: '10:00', end: '12:00', title: 'The Loud House' },
    { start: '12:00', end: '14:00', title: 'Henry Danger' },
    { start: '14:00', end: '16:00', title: 'iCarly' },
    { start: '16:00', end: '18:00', title: 'As Tartarugas Ninja' },
    { start: '18:00', end: '20:00', title: 'Bob Esponja Calça Quadrada' },
    { start: '20:00', end: '22:00', title: 'Cine Nick: Bob Esponja - O Incrível Resgate' },
    { start: '22:00', end: '06:00', title: 'Nick Clássicos: Brilhante Victoria' }
  ],

  // --- DOCUMENTÁRIOS ---
  discovery_channel: [
    { start: '06:00', end: '08:30', title: 'Pesca Mortal: Mar de Bering' },
    { start: '08:30', end: '11:00', title: 'Febre do Ouro: Alasca' },
    { start: '11:00', end: '13:30', title: 'Largados e Pelados (Naked and Afraid)' },
    { start: '13:30', end: '16:00', title: 'Mestres da Engenharia' },
    { start: '16:00', end: '18:30', title: 'À Prova de Tudo com Bear Grylls' },
    { start: '18:30', end: '21:00', title: 'Febre do Ouro: Minas Perdidas' },
    { start: '21:00', end: '23:30', title: 'Largados e Pelados: A Tribo' },
    { start: '23:30', end: '06:00', title: 'Mistérios Revelados' }
  ],
  discovery_turbo: [
    { start: '06:00', end: '08:30', title: 'Joias Sobre Rodas (Wheeler Dealers)' },
    { start: '08:30', end: '11:00', title: 'Oficina de Aceleração' },
    { start: '11:00', end: '13:30', title: 'Supercarros do Futuro' },
    { start: '13:30', end: '16:00', title: 'Garagens Fantásticas' },
    { start: '16:00', end: '18:30', title: 'Mestres da Restauração Automotiva' },
    { start: '18:30', end: '21:00', title: 'Restaurações Milionárias' },
    { start: '21:00', end: '23:30', title: 'Velozes e Extremos' },
    { start: '23:30', end: '06:00', title: 'Noite Turbo: Arrancadas Extremas' }
  ],
  history: [
    { start: '06:00', end: '08:30', title: 'Trato Feito em Las Vegas (Pawn Stars)' },
    { start: '08:30', end: '11:00', title: 'Alienígenas do Passado' },
    { start: '11:00', end: '13:30', title: 'Caçadores de Relíquias' },
    { start: '13:30', end: '16:00', title: 'Desafio Sob Fogo (Forged in Fire)' },
    { start: '16:00', end: '18:30', title: 'O Segredo de Skinwalker Ranch' },
    { start: '18:30', end: '21:00', title: 'Trato Feito: Edição de Colecionador' },
    { start: '21:00', end: '23:30', title: 'Grandes Mistérios da História' },
    { start: '23:30', end: '06:00', title: 'Documentários Históricos: Guerras Mundiais' }
  ],

  // --- NOTÍCIAS ---
  noticias: [
    { start: '06:00', end: '09:00', title: 'Edição das 6: Principais Notícias' },
    { start: '09:00', end: '12:00', title: 'Conexão Notícias: Giro Nacional' },
    { start: '12:00', end: '14:00', title: 'Jornal do Meio-Dia: Política & Economia' },
    { start: '14:00', end: '16:30', title: 'Estúdio Ao Vivo: Análise e Debates' },
    { start: '16:30', end: '18:30', title: 'Giro dos Mercados & Economia em Foco' },
    { start: '18:30', end: '21:00', title: 'Edição das 18h: Notícias do Dia' },
    { start: '21:00', end: '23:00', title: 'Jornal Especial: Bastidores de Brasília' },
    { start: '23:00', end: '06:00', title: 'Plantão Notícias 24h & Reprises' }
  ]
};

// Bibliotecas ricas para o gerador dinâmico exclusivo por canal
const DYNAMIC_LIBRARIES = {
  filme_acao: [
    'Operação Destruição: Fuga Impossível', 'Velocidade Sem Limite: A Fuga', 'Zona de Impacto',
    'Fúria Urbana: Conflito Sangrento', 'O Atirador de Elite: Missão Secreta', 'Linha de Fogo: Vingança Armada',
    'Conspiração Fatal', 'Perseguição Implacável', 'Código Secreto: Operação Alfa', 'Alvo em Movimento',
    'Resgate Noturno', 'O Justiceiro da Noite'
  ],
  filme_aventura: [
    'A Ilha dos Segredos Perdidos', 'O Templo Proibido', 'A Busca do Tesouro Sagrado',
    'A Floresta Misteriosa', 'Expedição Extrema: Polo Ártico', 'Além do Horizonte',
    'O Portal do Tempo', 'Montanha da Perdição', 'A Relíquia Esquecida'
  ],
  filme_comedia: [
    'Uma Confusão das Galáxias', 'Família de Malas Prontas', 'O Golpe da Minha Vida',
    'Troca de Casais Maluca', 'Férias de Natal Inesperadas', 'Dois Trapalhões em Apuros',
    'Guerra dos Vizinhos', 'Quase Casados', 'Uma Noite Desastrosa'
  ],
  series: [
    'O Arquivo Negro: Temporada 1', 'Detetives Urbanos: Casos Reais', 'A Firma: Conspiração',
    'Almas Marcadas: O Julgamento', 'O Império de Sangue', 'Cidade Proibida: Episódio 5',
    'Segredos Ocultos: Revelações', 'Legado de Honra', 'Zona Limítrofe: Fronteira'
  ],
  esporte: [
    'Futebol Internacional: Resumo da Rodada', 'Giro dos Campeões: Melhores Lances',
    'Mundo da Bola: Entrevistas Exclusivas', 'Rumo a Tóquio: Esportes Olímpicos',
    'Velocidade Máxima: Bastidores da Fórmula', 'Esporte Total Ao Vivo',
    'Arena do Combate: Artes Marciais', 'Show de Gols: Campeonato Brasileiro'
  ],
  noticia: [
    'Jornal das Cidades: Plantão', 'Giro Econômico com Especialistas', 'Radar Global: Notícias do Mundo',
    'Debate Aberto: Temas da Atualidade', 'Voz da Cidade: Reportagens Especiais',
    'Plantão Urgente: Últimas Informações', 'Painel Político em Brasília', 'Brasil em Pauta'
  ],
  infantil: [
    'As Aventuras do Pequeno Explorador', 'O Reino dos Animais Divertidos', 'Turminha da Pesada',
    'Super Heróis em Treinamento', 'Mundo Mágico das Cores', 'Os Guardiões da Floresta',
    'A Fabulosa Máquina de Desenhos', 'Detetives Mirins em Ação'
  ],
  documentario: [
    'Maravilhas da Terra Selvagem', 'Planeta Terra: Oceanos Profundos', 'Grandes Construções da Humanidade',
    'Miséria e Grandeza: Fatos Históricos', 'Cosmos: A Imensidão do Universo', 'Segredos do Antigo Egito',
    'A Era dos Dinossauros em CGI', 'Natureza Extrema: Vulcões e Tempestades'
  ],
  musica: [
    'Top 100 Hits: Os Sucessos Mais Tocados', 'Acústico Ao Vivo Especial', 'Clássicos do Rock Internacional',
    'Sertanejo Universitário em Concerto', 'Sessão Nostalgia: Anos 80 e 90', 'Hip Hop & Urban Beats',
    'Festival de Músicas do Mundo', 'Show Ao Vivo: Grandes Turnês'
  ],
  variedades: [
    'Cozinha com Sabor: Receitas Práticas', 'Design & Decoração de Luxo', 'Viagem dos Sonhos: Destinos Exóticos',
    'Moda & Estilo de Vida', 'Show de Talentos Brasil', 'Curiosidades Bizarras do Planeta',
    'Vida Saudável e Bem-Estar', 'Celebridades em Foco'
  ]
};

// Identifica a grade específica para um canal
function resolveSchedule(channelName, category = '') {
  const name = (channelName || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();

  // Canais Abertos
  if (name.includes('globo') && !name.includes('news')) return CHANNEL_SCHEDULES.globo;
  if (name.includes('sbt') && !name.includes('news')) return CHANNEL_SCHEDULES.sbt;
  if (name.includes('record') && !name.includes('news')) return CHANNEL_SCHEDULES.record;
  if (name.includes('band') && !name.includes('sports') && !name.includes('news')) return CHANNEL_SCHEDULES.band;

  // Telecine (Garantir que CADA um tenha sua grade e nunca duplique)
  if (name.includes('telecine') && name.includes('premium')) return CHANNEL_SCHEDULES.telecine_premium;
  if (name.includes('telecine') && name.includes('action')) return CHANNEL_SCHEDULES.telecine_action;
  if (name.includes('telecine') && name.includes('pipoca')) return CHANNEL_SCHEDULES.telecine_pipoca;
  if (name.includes('telecine') && name.includes('touch')) return CHANNEL_SCHEDULES.telecine_touch;
  if (name.includes('telecine') && name.includes('fun')) return CHANNEL_SCHEDULES.telecine_fun;
  if (name.includes('telecine') && name.includes('cult')) return CHANNEL_SCHEDULES.telecine_cult;
  if (name.includes('telecine')) return CHANNEL_SCHEDULES.telecine_premium;

  // HBO (Cada variante com sua grade)
  if (name.includes('hbo family')) return CHANNEL_SCHEDULES.hbo_family;
  if (name.includes('hbo signature')) return CHANNEL_SCHEDULES.hbo_signature;
  if (name.includes('hbo 2') || name.includes('hbo2')) return CHANNEL_SCHEDULES.hbo2;
  if (name.includes('hbo')) return CHANNEL_SCHEDULES.hbo;

  // Megapix, Warner, Space, TNT, Universal, Sony, AXN
  if (name.includes('megapix')) return CHANNEL_SCHEDULES.megapix;
  if (name.includes('warner')) return CHANNEL_SCHEDULES.warner;
  if (name.includes('space')) return CHANNEL_SCHEDULES.space;
  if (name.includes('tnt') && !name.includes('novelas') && !name.includes('séries')) return CHANNEL_SCHEDULES.tnt;
  if (name.includes('universal')) return CHANNEL_SCHEDULES.universal_tv;
  if (name.includes('sony')) return CHANNEL_SCHEDULES.sony_channel;
  if (name.includes('axn')) return CHANNEL_SCHEDULES.axn;

  // Esportes
  if (name.includes('cazé') || name.includes('caze')) return CHANNEL_SCHEDULES.cazetv;
  if (name.includes('espn 2') || name.includes('espn2')) return CHANNEL_SCHEDULES.espn2;
  if (name.includes('espn 4') || name.includes('espn4')) return CHANNEL_SCHEDULES.espn4;
  if (name.includes('espn')) return CHANNEL_SCHEDULES.espn;
  if (name.includes('sportv 2') || name.includes('sportv2')) return CHANNEL_SCHEDULES.sportv2;
  if (name.includes('sportv 3') || name.includes('sportv3')) return CHANNEL_SCHEDULES.sportv3;
  if (name.includes('sportv')) return CHANNEL_SCHEDULES.sportv;
  if (name.includes('premiere')) return CHANNEL_SCHEDULES.premiere;

  // Infantil
  if (name.includes('cartoon network')) return CHANNEL_SCHEDULES.cartoon_network;
  if (name.includes('discovery kids')) return CHANNEL_SCHEDULES.discovery_kids;
  if (name.includes('nickelodeon') || name.includes('nick')) return CHANNEL_SCHEDULES.nickelodeon;

  // Documentários
  if (name.includes('discovery turbo')) return CHANNEL_SCHEDULES.discovery_turbo;
  if (name.includes('discovery channel') || (name.includes('discovery') && !name.includes('kids'))) return CHANNEL_SCHEDULES.discovery_channel;
  if (name.includes('history')) return CHANNEL_SCHEDULES.history;

  // Notícias
  if (name.includes('globonews') || name.includes('globo news') || name.includes('cnn') || name.includes('jovem pan') || name.includes('sbt news') || name.includes('band news') || name.includes('record news')) {
    return CHANNEL_SCHEDULES.noticias;
  }

  // Se não houver grade manual, gerar grade dinâmica realista e única
  return generateDynamicSchedule(channelName, cat);
}

// Gerador dinâmico de 24 horas inteligente, único para cada canal
function generateDynamicSchedule(channelName, category) {
  const name = (channelName || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Selecionar biblioteca de títulos adequada
  let titles = DYNAMIC_LIBRARIES.filme_acao;
  if (cat.includes('esporte') || name.includes('sport') || name.includes('futebol') || name.includes('combate') || name.includes('off')) {
    titles = DYNAMIC_LIBRARIES.esporte;
  } else if (cat.includes('notícia') || name.includes('news') || name.includes('jornal')) {
    titles = DYNAMIC_LIBRARIES.noticia;
  } else if (cat.includes('infantil') || name.includes('kids') || name.includes('desenho') || name.includes('anime') || name.includes('toon')) {
    titles = DYNAMIC_LIBRARIES.infantil;
  } else if (cat.includes('documentário') || name.includes('discovery') || name.includes('animal') || name.includes('geo')) {
    titles = DYNAMIC_LIBRARIES.documentario;
  } else if (cat.includes('música') || name.includes('music') || name.includes('mtv') || name.includes('bis') || name.includes('rock')) {
    titles = DYNAMIC_LIBRARIES.musica;
  } else if (name.includes('comedia') || name.includes('pipoca') || name.includes('fun')) {
    titles = DYNAMIC_LIBRARIES.filme_comedia;
  } else if (cat.includes('variedades') || name.includes('life') || name.includes('gnt') || name.includes('food')) {
    titles = DYNAMIC_LIBRARIES.variedades;
  } else if (name.includes('série') || name.includes('series')) {
    titles = DYNAMIC_LIBRARIES.series;
  }

  // Hash determinístico baseado nas letras do canal para manter a grade consistente no mesmo canal e diferente entre canais
  let hash = 0;
  for (let i = 0; i < channelName.length; i++) {
    hash = (hash << 5) - hash + channelName.charCodeAt(i);
    hash |= 0;
  }
  const offset = Math.abs(hash) % titles.length;

  // Grade de 11 faixas de horários realistas (1h30 a 2h30 cada)
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
    const rawTitle = titles[(idx + offset) % titles.length];
    return {
      start: slot.start,
      end: slot.end,
      title: rawTitle
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

    // Se nenhum horário bater exatamente (fuso ou intervalo), retorna o primeiro
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
