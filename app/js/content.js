/* Canal Vice City · conteúdo do app (textos, ganchos, legendas, guias) */
(function () {
const C = {};

/* ---------- Categorias do acervo ---------- */
C.cats = {
  novos:        { nome: 'Recarga da semana', curto: 'Novos',        cor: '#ff2d7a', desc: 'O lote mais recente, com o que está bombando no jogo agora.' },
  ineditos:     { nome: 'Cortes Inéditos',   curto: 'Inéditos',     cor: '#ffc861', desc: 'Produzidos pelo nosso time. Você não acha em outro pack.' },
  cortes:       { nome: 'Cortes',            curto: 'Cortes',       cor: '#ff8a3d', desc: 'Os melhores momentos, cortados para segurar até o fim.' },
  memes:        { nome: 'Memes',             curto: 'Memes',        cor: '#22d3c5', desc: 'Humor rápido, alto compartilhamento.' },
  curiosidades: { nome: 'Curiosidades',      curto: 'Curiosidades', cor: '#a78bfa', desc: 'Detalhes que ninguém viu. Ótimos para comentário.' },
  teorias:      { nome: 'Teorias',           curto: 'Teorias',      cor: '#f472b6', desc: 'Hipóteses que puxam debate nos comentários.' },
  reacts:       { nome: 'Reacts',            curto: 'Reacts',       cor: '#fb7185', desc: 'Reações que prendem pela emoção.' },
  clipes:       { nome: 'Clipes',            curto: 'Clipes',       cor: '#38bdf8', desc: 'Cenas de ação limpas, prontas para legenda.' },
  vazamentos:   { nome: 'Vazamentos e notícias', curto: 'Notícias', cor: '#facc15', desc: 'O que saiu, o que mudou, o que vem aí.' },
  trailers:     { nome: 'Trailers',          curto: 'Trailers',     cor: '#f97316', desc: 'Trechos dos trailers para análise e comparação.' },
  comparacoes:  { nome: 'Comparações',       curto: 'Comparações',  cor: '#4ade80', desc: 'Antes e depois, GTA 5 x GTA 6.' },
  longos:       { nome: 'Vídeos longos',     curto: 'Longos',       cor: '#c084fc', desc: 'Vídeos maiores. Bons para TikTok acima de 1 minuto e para cortar em várias partes.' },
  geral:        { nome: 'Acervo geral',      curto: 'Geral',        cor: '#94a3b8', desc: 'O grosso do acervo: mais de 1.500 vídeos para nunca faltar post.' }
};
C.temas = { streamer: 'Streamers', curiosidade: 'Curiosidade', clipe: 'Clipe', edit: 'Edit', gameplay: 'Gameplay', meme: 'Meme', bug: 'Bugs', ia: 'IA', coringa: 'Loud Coringa', davyjones: 'Davy Jones' };

/* ---------- Plataformas ---------- */
C.plats = {
  tiktok:    { nome: 'TikTok',          cor: '#22d3c5', horas: ['12:00', '18:30', '21:00', '09:00', '15:00'], max: 5, tamanho: 'Vertical 9:16 · ideal acima de 1 min para o Programa de Recompensas' },
  reels:     { nome: 'Instagram Reels', cor: '#ff2d7a', horas: ['11:30', '19:00', '21:30', '08:30', '14:30'], max: 4, tamanho: 'Vertical 9:16 · até 3 min' },
  shorts:    { nome: 'YouTube Shorts',  cor: '#ff4d4d', horas: ['13:00', '17:30', '20:30', '10:00', '22:30'], max: 5, tamanho: 'Vertical 9:16 · até 3 min' },
  kwai:      { nome: 'Kwai',            cor: '#ff8a3d', horas: ['12:30', '19:30', '22:00', '09:30', '16:00'], max: 5, tamanho: 'Vertical 9:16' },
  facebook:  { nome: 'Facebook Reels',  cor: '#60a5fa', horas: ['12:00', '20:00', '18:00', '09:00', '22:00'], max: 3, tamanho: 'Vertical 9:16' }
};

/* ---------- 100 ganchos (Kit Remix) ---------- */
C.ganchos = {
  curiosidade: [
    'Ninguém reparou nesse detalhe do GTA 6',
    'A Rockstar escondeu isso na sua cara',
    'Pausa nesse segundo e olha o fundo',
    'Isso aqui não estava no GTA 5',
    'Você jogou e não viu isso',
    'O detalhe mais insano de Vice City',
    '99% dos jogadores passaram batido por aqui',
    'Repara no que acontece quando ele faz isso',
    'Isso prova o nível de detalhe do GTA 6',
    'Olha o que tem atrás desse prédio',
    'Esse NPC não está aí por acaso',
    'O jogo reage a isso e quase ninguém sabe',
    'Mais um detalhe que mostra por que demorou 13 anos',
    'Testei isso no GTA 6 e o resultado me surpreendeu',
    'Sabia que dá pra fazer isso em Leonida?'
  ],
  meme: [
    'Eu prometendo que ia jogar só uma missão',
    'A polícia de Vice City não tem dia ruim',
    'Quando você esquece de salvar o jogo',
    'POV: primeiro dia no GTA 6',
    'Meu amigo dirigindo no GTA 6',
    'Eu tentando ser um cidadão de bem no GTA',
    'Ninguém: / Os NPCs de Vice City:',
    'O GTA 6 me entendendo melhor que minha família',
    'Quando a estrela de procurado sobe do nada',
    'Esperei 13 anos pra isso',
    'A física do GTA 6 escolheu violência',
    'Eu explicando pra minha mãe por que comprei um console',
    'Quando o plano dá errado em 3 segundos',
    'O seguro do carro em Vice City deve ser caríssimo',
    'Todo grupo de amigos tem esse no GTA'
  ],
  corte: [
    'Espera o final',
    'Olha o que aconteceu no segundo 10',
    'Ninguém esperava esse final',
    'Essa perseguição foi insana',
    'O melhor momento do GTA 6 até agora',
    'Isso aqui foi pura sorte',
    'Ele não acreditou no que viu',
    'Eu precisei ver duas vezes',
    'Esse momento vai virar clássico',
    'Deu tudo errado do jeito mais engraçado',
    'Assiste até o fim, vale a pena',
    'A reação dele no final',
    'Só quem jogou entende esse momento',
    'O jogo inteiro parou pra ver isso',
    'Ninguém sai vivo dessa'
  ],
  teoria: [
    'E se isso explicar o final do GTA 6?',
    'Essa teoria muda tudo sobre a Lucia',
    'Tem uma ligação com o GTA 5 aqui',
    'Repara: isso já apareceu no trailer',
    'A Rockstar deixou uma pista e ninguém viu',
    'Minha teoria sobre o que vem na DLC',
    'Esse personagem vai voltar, olha os sinais',
    'Por que Leonida e não Los Santos?',
    'Isso pode ser o maior segredo do mapa',
    'Junta essas três cenas e pensa comigo',
    'O que ninguém está falando sobre o Jason',
    'Essa cena tem um significado escondido'
  ],
  react: [
    'Minha reação mudou nesse momento',
    'Eu não estava pronto pra isso',
    'Ele travou quando viu isso',
    'A reação mais sincera do GTA 6',
    'Olha a cara dele no final',
    'Ninguém reagiu igual a ele',
    'Ele gritou de verdade',
    'Primeira vez vendo isso no GTA 6',
    'Essa reação resume a internet hoje',
    'Ele achou que era bug, mas não era'
  ],
  noticia: [
    'Saiu agora: o que mudou no GTA 6',
    'Tudo que você precisa saber hoje sobre GTA 6',
    'Isso confirma o que todo mundo suspeitava',
    'A Rockstar acabou de mudar isso',
    'Notícia que ninguém esperava sobre o GTA 6',
    'Vazou: o que vem por aí em Vice City',
    'Isso vai mudar seu jeito de jogar',
    'O número que ninguém acreditou sobre o GTA 6',
    'Atualização: veja o que mudou',
    'Se você joga GTA 6, precisa saber disso'
  ],
  comparacao: [
    'GTA 5 x GTA 6: olha a diferença',
    'A evolução em 13 anos em 10 segundos',
    'O mesmo lugar, 13 anos depois',
    'Antes e depois: a Rockstar exagerou',
    'Isso era assim no GTA 5... e agora',
    'Comparei e não acreditei',
    'Vice City de 2002 x Vice City de 2026',
    'Essa diferença ninguém comentou',
    'O detalhe que mais evoluiu no GTA 6',
    'A física do GTA 5 perto da do GTA 6',
    'Quem ganha: GTA 5 ou GTA 6?',
    'Olha o salto gráfico nessa cena',
    'De Los Santos para Leonida: o que mudou'
  ],
  opiniao: [
    'Opinião impopular sobre o GTA 6',
    'Isso é o que ninguém tem coragem de falar do GTA 6',
    'O GTA 6 errou feio nisso (e acertou nisso)',
    'Valeu a pena esperar 13 anos?',
    'O melhor personagem do GTA 6 não é quem você pensa',
    'Isso aqui deveria ser proibido no GTA 6',
    'A missão mais difícil do GTA 6 até agora',
    'O lugar mais perigoso de Leonida',
    'Se você ainda não fez isso no GTA 6, faça hoje',
    'O erro que todo iniciante comete no GTA 6'
  ]
};
C.ganchosPorCat = { curiosidades: 'curiosidade', memes: 'meme', cortes: 'corte', clipes: 'corte', teorias: 'teoria', reacts: 'react', vazamentos: 'noticia', trailers: 'teoria', comparacoes: 'comparacao', novos: 'corte', ineditos: 'corte', geral: 'corte', longos: 'curiosidade' };
C.totalGanchos = Object.values(C.ganchos).reduce((a, b) => a + b.length, 0);

/* ---------- CTAs ---------- */
C.ctas = [
  'Segue pra não perder a próxima parte.',
  'Comenta o que você faria nessa hora.',
  'Marca aquele amigo que faz isso no GTA.',
  'Salva pra mostrar pros amigos depois.',
  'Você reparou nisso? Responde aqui.',
  'Segue que amanhã tem mais Vice City.',
  'Concorda ou discorda? Comenta.',
  'Manda pra quem ainda não jogou.',
  'Qual foi o melhor momento? Fala aí.',
  'Ativa as notificações pra não perder o próximo.'
];

/* ---------- Hashtags ---------- */
C.tagsBase = ['#GTA6', '#GTAVI', '#ViceCity'];
C.tagsCat = {
  curiosidades: ['#CuriosidadesGTA', '#DetalhesGTA6', '#Leonida'],
  memes: ['#MemesGTA', '#GTAmemes', '#Humor'],
  cortes: ['#CortesGTA', '#GTA6Gameplay', '#MelhoresMomentos'],
  clipes: ['#ClipesGTA', '#GTA6Gameplay', '#Gaming'],
  teorias: ['#TeoriasGTA', '#Rockstar', '#Lucia'],
  reacts: ['#ReactGTA', '#Reação', '#Streamer'],
  vazamentos: ['#NoticiasGTA', '#GTA6News', '#Rockstar'],
  trailers: ['#TrailerGTA6', '#Rockstar', '#Lucia'],
  comparacoes: ['#GTA5vsGTA6', '#Comparação', '#Rockstar'],
  novos: ['#GTA6Gameplay', '#Gamer', '#Gaming'],
  ineditos: ['#GTA6Gameplay', '#Streamer', '#CortesGTA'],
  geral: ['#GTA6Gameplay', '#Gamer', '#Gaming'],
  longos: ['#GTA6Gameplay', '#Gaming', '#Rockstar']
};
C.tagsPlat = {
  tiktok: ['#fyp', '#gamingnotiktok'],
  reels: ['#reels', '#gamer'],
  shorts: ['#shorts', '#gaming'],
  kwai: ['#kwai', '#games'],
  facebook: ['#reels', '#games']
};

/* ---------- Títulos ---------- */
C.titulos = [
  '{g}',
  '{g} | GTA 6',
  'GTA 6: {g}',
  '{g} (Vice City)',
  '{g} #GTA6'
];

/* ---------- Quiz: Plano de Golpe ---------- */
C.quiz = [
  { id: 'objetivo', q: 'Qual é o seu objetivo com o canal?', tipo: 'um', ops: [
    ['grana', 'Fazer meu primeiro dinheiro rápido', 'Rotas que pagam antes de ter seguidores'],
    ['monetizar', 'Crescer e monetizar nas redes', 'Bater os requisitos das plataformas'],
    ['servico', 'Vender cortes como serviço', 'Streamers e criadores pagando por edição'],
    ['testar', 'Testar e aprender sem pressão', 'Começar leve e ir ajustando']
  ]},
  { id: 'plats', q: 'Onde você quer postar?', sub: 'Pode marcar mais de uma.', tipo: 'varios', ops: [
    ['tiktok', 'TikTok'], ['shorts', 'YouTube Shorts'], ['reels', 'Instagram Reels'], ['kwai', 'Kwai'], ['facebook', 'Facebook Reels']
  ]},
  { id: 'tempo', q: 'Quanto tempo por dia você tem?', tipo: 'um', ops: [
    ['15', '15 minutos', 'Agenda enxuta, 1 a 2 posts por rede'],
    ['30', '30 minutos', 'Ritmo forte, 2 a 3 posts por rede'],
    ['60', '1 hora ou mais', 'Modo lançamento, 3 a 5 posts por rede']
  ]},
  { id: 'fase', q: 'Em que ponto você está?', tipo: 'um', ops: [
    ['zero', 'Nunca postei', 'Vamos criar o perfil do zero'],
    ['parado', 'Tenho perfil, mas está parado', 'Vamos reativar com o nicho GTA'],
    ['ativo', 'Já posto com frequência', 'Vamos escalar e monetizar']
  ]},
  { id: 'voz', q: 'Como você prefere aparecer?', tipo: 'um', ops: [
    ['nao', 'Não quero aparecer nem falar', 'Legenda na tela e texto'],
    ['voz', 'Topo narrar com a minha voz', 'Narração deixa o corte mais original'],
    ['rosto', 'Topo aparecer na câmera', 'React com rosto cresce mais rápido']
  ]}
];

/* ---------- Monetização (Mapa da Grana) · requisitos conferidos em 22/11/2026 ---------- */
C.rotas = [
  { id: 'clipping', nome: 'Campanhas de clipping', quando: 'Desde o 1º dia', seguidores: 'Não exige seguidores', cor: '#22d3c5',
    como: 'Marcas e streamers pagam por mil visualizações verificadas dos cortes que você posta. Você se inscreve na campanha, posta seguindo as regras e envia o link.',
    passos: ['Procure campanhas de GTA 6 em plataformas de clipping (ex.: Whop) e leia as regras de cada uma', 'Poste seguindo exatamente o formato pedido (duração, marcação, hashtag)', 'Envie o link no painel e guarde prints das visualizações', 'Calcule pelo valor realmente pago, não pelo anunciado'],
    alerta: 'Campanha que cobra para você entrar é golpe. O valor anunciado por mil views costuma ser maior que o pago de fato.' },
  { id: 'servico', nome: 'Cortes para streamers', quando: 'Desde a 1ª semana', seguidores: 'Exige portfólio, não seguidores', cor: '#ffc861',
    como: 'Streamers de GTA 6 precisam de cortes todo dia. Você monta um portfólio com 3 a 5 cortes e oferece um pacote mensal.',
    passos: ['Separe 5 cortes seus como portfólio', 'Liste 20 streamers médios de GTA 6 (5 mil a 100 mil seguidores)', 'Mande a mensagem pronta do Kit Remix com um corte de amostra do canal dele', 'Feche pacote fixo (ex.: 30 cortes por mês) com prazo e revisões por escrito'],
    alerta: 'Combine tudo por escrito: quantidade, prazo, revisões e forma de pagamento.' },
  { id: 'tiktok', nome: 'Programa de Recompensas do TikTok', quando: 'Quando bater os requisitos', seguidores: '10 mil seguidores e 100 mil views em 30 dias', cor: '#ff2d7a',
    como: 'O TikTok paga por visualizações qualificadas de vídeos originais com 1 minuto ou mais. Conta pessoal, maior de 18 anos.',
    passos: ['Poste todo dia no nicho GTA 6 para o algoritmo entender seu perfil', 'Use vídeos acima de 1 minuto (veja "Vídeos longos" na Recarga)', 'Deixe o corte original: narração, legenda própria, comentário', 'Inscreva-se em Ferramentas do criador quando aparecer'],
    alerta: 'Vídeo igual ao de outros perfis não conta como original. Sempre adicione sua contribuição.' },
  { id: 'youtube', nome: 'Programa de Parcerias do YouTube', quando: 'Quando bater os requisitos', seguidores: '1.000 inscritos e 10 milhões de views de Shorts em 90 dias (ou 4 mil horas)', cor: '#ff4d4d',
    como: 'Divisão de receita dos anúncios do feed de Shorts. A partir de 1º de fevereiro de 2027, canais novos vão precisar de 20 milhões de views de Shorts em 90 dias (ou 8 mil horas) para entrar, e a receita de Shorts passa a exigir 10 milhões de views qualificadas a cada 90 dias. Quem entrar antes da mudança não é afetado pela nova regra de entrada: quanto antes, melhor.',
    passos: ['Poste Shorts todo dia, sempre no mesmo nicho', 'Acompanhe em YouTube Studio → Ganhos', 'Evite música do rádio do jogo (pode gerar reivindicação de direitos)', 'Adicione análise, narração ou edição: o YouTube avalia conteúdo reutilizado no canal todo'],
    alerta: 'A política de conteúdo reutilizado vale para o canal inteiro. Corte sem nenhuma contribuição sua pode impedir a monetização.' },
  { id: 'kwai', nome: 'Kwai', quando: 'Desde o início', seguidores: 'Varia por programa', cor: '#ff8a3d',
    como: 'O Kwai tem programa de criadores, tarefas pagas de marcas e afiliados. Ótimo para multiplicar o mesmo corte em mais um lugar.',
    passos: ['Crie o perfil com o mesmo nome do canal', 'Poste os mesmos cortes da agenda', 'Confira as campanhas e tarefas disponíveis no app', 'Use como renda complementar, não como única fonte'],
    alerta: 'Trate como renda extra. Os programas mudam com frequência.' },
  { id: 'facebook', nome: 'Monetização de Conteúdo do Facebook', quando: 'Por convite', seguidores: 'Por convite da Meta', cor: '#60a5fa',
    como: 'Programa único da Meta que paga por Reels e vídeos. O acesso ainda é por convite, e a Meta reduz o alcance de páginas que só repostam.',
    passos: ['Crie uma página de fãs de GTA 6', 'Poste Reels com edição e legenda próprias', 'Confira o Painel profissional → Monetização', 'Use também como distribuição para o seu link'],
    alerta: 'Página que só reposta perde alcance. Sempre transforme o corte.' },
  { id: 'afiliado', nome: 'Afiliados', quando: 'Desde o início', seguidores: 'Não exige', cor: '#a78bfa',
    como: 'Indique produtos ligados ao seu público (controles, headsets, cadeiras, cupons de jogos) com seu link e ganhe comissão.',
    passos: ['Cadastre-se em um programa de afiliados de loja grande', 'Escolha 3 produtos que fazem sentido para gamer', 'Coloque o link na bio e cite no vídeo quando fizer sentido', 'Avise quando houver comissão (transparência)'],
    alerta: 'Sinalize a relação comercial sempre.' },
  { id: 'proprio', nome: 'Vender seu próprio produto', quando: 'Com audiência', seguidores: 'A partir de um público engajado', cor: '#4ade80',
    como: 'O caminho que mais paga: transformar seu público em clientes de um produto seu. É exatamente o que a Estrutura de Vendas Vice City ensina.',
    passos: ['Junte um público fiel no nicho', 'Crie uma oferta simples (pack, guia, consultoria)', 'Siga a Estrutura de Vendas Vice City', 'Use o direct com palavra-chave para vender no automático'],
    alerta: 'Comece pequeno e valide antes de investir em anúncio.' }
];

/* ---------- Prompts de logo (7 da plataforma + nossos) ---------- */
const FIM = ' Use o nome escolhido como o único texto da imagem, distribuindo as palavras de acordo com a hierarquia descrita. Combine ilustração cinematográfica rica em detalhes, tipografia 3D original, neon e contornos de alto contraste. Deixe margem para recorte em avatar circular. Evite símbolos de plataformas, logotipos oficiais e marcas-d’água.';
C.logos = [
  {"n": 1, "titulo": "Emblema neon Vice", "ex": "VICE CLIPS", "p": "Crie uma logo em formato de emblema circular com borda de neon rosa brilhante. Dentro do círculo, uma cidade tropical ao pôr do sol com palmeiras, prédios e um carro esportivo. Por cima, o texto \"[NOME DO SEU CANAL]\": a primeira palavra em letras cromadas prateadas com brilho e a segunda em pincelada magenta grossa e inclinada. Logo quadrada 1:1 para foto de perfil, centralizada e legível em tamanho pequeno, fundo escuro, cores vibrantes (neon rosa, magenta, laranja de pôr do sol e ciano), acabamento premium, sem marcas registradas e sem logotipos oficiais de jogos."},
  {"n": 2, "titulo": "Placa de rodovia", "ex": "ROTA 6", "p": "Crie uma logo no formato de placa de rodovia retrô em escudo, estilo estrada costeira da Flórida, com o texto \"[NOME DO SEU CANAL]\" em destaque no centro, contorno em neon rosa, palmeiras atrás e um sol de fim de tarde. Logo quadrada 1:1 para foto de perfil, centralizada e legível em tamanho pequeno, fundo escuro, cores vibrantes (neon rosa, magenta, laranja de pôr do sol e ciano), acabamento premium, sem marcas registradas e sem logotipos oficiais de jogos."},
  {"n": 3, "titulo": "Seis estrelas de procurado", "ex": "PROCURADO BR", "p": "Crie uma logo com seis estrelas douradas brilhantes formando um arco sobre o texto \"[NOME DO SEU CANAL]\" em letras grossas brancas com contorno rosa, com luz de sirene vermelha e azul desfocada ao fundo. Logo quadrada 1:1 para foto de perfil, centralizada e legível em tamanho pequeno, fundo escuro, cores vibrantes (neon rosa, magenta, laranja de pôr do sol e ciano), acabamento premium, sem marcas registradas e sem logotipos oficiais de jogos."},
  {"n": 4, "titulo": "Letreiro de motel", "ex": "MOTEL CORTES", "p": "Crie uma logo no estilo letreiro vintage de motel de beira de estrada em neon, com uma seta curva, o texto \"[NOME DO SEU CANAL]\" em letra cursiva rosa e uma palmeira em neon ciano ao lado, à noite. Logo quadrada 1:1 para foto de perfil, centralizada e legível em tamanho pequeno, fundo escuro, cores vibrantes (neon rosa, magenta, laranja de pôr do sol e ciano), acabamento premium, sem marcas registradas e sem logotipos oficiais de jogos."},
  {"n": 5, "titulo": "Cartão-postal anos 80", "ex": "LEONIDA", "p": "Crie uma logo no estilo cartão-postal retrô dos anos 80: o texto \"[NOME DO SEU CANAL]\" em letras 3D enormes, cada letra preenchida com uma cena tropical diferente (praia, carro, palmeira, neon, iate), com fundo de pôr do sol listrado. Logo quadrada 1:1 para foto de perfil, centralizada e legível em tamanho pequeno, fundo escuro, cores vibrantes (neon rosa, magenta, laranja de pôr do sol e ciano), acabamento premium, sem marcas registradas e sem logotipos oficiais de jogos."},
  {"n": 6, "titulo": "Mascote flamingo", "ex": "FLAMINGO CLIPS", "p": "Crie uma logo com um mascote: um flamingo rosa estiloso de óculos escuros e corrente dourada, ilustração vetorial com contorno grosso, dentro de um círculo com pôr do sol, e o texto \"[NOME DO SEU CANAL]\" embaixo em letras cromadas. Logo quadrada 1:1 para foto de perfil, centralizada e legível em tamanho pequeno, fundo escuro, cores vibrantes (neon rosa, magenta, laranja de pôr do sol e ciano), acabamento premium, sem marcas registradas e sem logotipos oficiais de jogos."},
  {"n": 7, "titulo": "Fita VHS", "ex": "CORTES 86", "p": "Crie uma logo no estilo capa de fita VHS dos anos 80 vista de frente, com grade em perspectiva neon, sol listrado e o texto \"[NOME DO SEU CANAL]\" em letras cromadas com reflexo, faixa rosa e ciano na lateral. Logo quadrada 1:1 para foto de perfil, centralizada e legível em tamanho pequeno, fundo escuro, cores vibrantes (neon rosa, magenta, laranja de pôr do sol e ciano), acabamento premium, sem marcas registradas e sem logotipos oficiais de jogos."},
  {"n": 8, "titulo": "Placa de carro", "ex": "VICE 006", "p": "Crie uma logo no formato de placa de carro da Flórida estilizada, branca com detalhes laranja e uma palmeira, com o texto \"[NOME DO SEU CANAL]\" em relevo, iluminada por neon rosa, com fundo noturno desfocado. Logo quadrada 1:1 para foto de perfil, centralizada e legível em tamanho pequeno, fundo escuro, cores vibrantes (neon rosa, magenta, laranja de pôr do sol e ciano), acabamento premium, sem marcas registradas e sem logotipos oficiais de jogos."}
];
C.promptsExtra = [
  { titulo: 'Banner do canal (YouTube 2560x1440)', p: 'Crie um banner horizontal 16:9 para o canal de fãs de GTA 6 “[NOME DO SEU CANAL]”. Skyline de Vice City ao pôr do sol, palmeiras, mar refletindo o céu rosa e laranja, um carro esportivo na orla. Deixe a faixa central livre e legível com o nome do canal em letras condensadas brancas com contorno escuro e a frase “Cortes diários de GTA 6”. Estilo ilustração cinematográfica, alto contraste, sem logotipos oficiais.' },
  { titulo: 'Capa de vídeo (thumbnail)', p: 'Crie uma capa vertical 9:16 para um vídeo curto de GTA 6 com o texto “[TEXTO DA CAPA]” em letras enormes amarelas com contorno preto, no terço superior. Fundo: cena de ação noturna em Vice City com luzes neon, estrelas de procurado no canto. Contraste alto, pouca informação, leitura instantânea no celular.' },
  { titulo: 'Foto de perfil com seu rosto', p: 'Transforme a foto anexada em um retrato ilustrado no estilo das artes de capa de GTA, com traço forte, sombras marcadas e paleta de pôr do sol rosa e laranja. Fundo com palmeiras e o nome “[NOME DO SEU CANAL]” em letras condensadas. Formato quadrado com margem para recorte circular.' }
];

/* ---------- Kit Remix: fórmulas de roteiro ---------- */
C.formulas = [
  { nome: 'Roteiro 27 segundos', passos: ['0–3 s · Gancho: comece no meio da ação, com a frase do gancho na tela', '3–17 s · Prova: mostre o momento principal, pause e destaque o detalhe', '17–27 s · Fecho: conclusão em uma frase + pergunta para os comentários'] },
  { nome: 'Narração "Eu fazia X"', passos: ['"Eu fazia [jeito errado]."', '"Testei [jeito novo]."', '"Olha a diferença em [resultado]."'] },
  { nome: 'Lista relâmpago', passos: ['"3 coisas que você não sabia sobre [tema]"', 'Uma cena por item, 3 a 5 segundos cada', 'Fecha com "qual você não sabia?"'] },
  { nome: 'Antes e depois', passos: ['Mostre o GTA 5 (ou o erro) por 3 segundos', 'Corte seco para o GTA 6 (ou o acerto)', 'Texto final: "13 anos de diferença"'] },
  { nome: 'Pergunta polêmica', passos: ['Abra com uma opinião forte na tela', 'Mostre a cena que sustenta a opinião', 'Pergunte "concorda?" e responda os comentários'] }
];

/* ---------- Mensagens prontas ---------- */
C.mensagens = [
  { titulo: 'Proposta para streamer (direct)', t: 'Fala, [nome]! Acompanho suas lives de GTA 6 e separei um corte do momento [momento] que tem cara de viralizar. Faço cortes verticais com legenda, prontos para TikTok, Reels e Shorts. Posso te mandar 2 exemplos? Se curtir, te passo um pacote com prazo e quantidade por mês.' },
  { titulo: 'Proposta para streamer (versão curta)', t: 'Oi, [nome]! Cortei um trecho da sua live de ontem e ficou muito bom. Quer ver? Trabalho com pacote mensal de cortes, com legenda e entrega diária.' },
  { titulo: 'Follow-up depois de 3 dias', t: 'Fala, [nome]! Passando para saber se você viu o corte que te mandei. Consigo te entregar os 5 primeiros esta semana para você testar.' }
];

window.CONTENT = C;
})();
