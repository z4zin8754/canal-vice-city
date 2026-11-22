/* Canal Vice City · configuração do app
   Tudo aqui é editável: produtos, preços, links de checkout e conexão com o Supabase.
   Enquanto SUPABASE_URL estiver vazio, o app roda em "modo prévia" (login só com e-mail, tudo liberado). */
window.CVC = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  SUPORTE_WHATSAPP: '#SUPORTE',          // link do grupo/suporte no WhatsApp
  DIAS_ESTRUTURA: 7,                     // Estrutura de Vendas libera X dias após o primeiro login
  RECARGA_SEMANAS: 12,

  /* Planos e produtos. "libera" = chaves de acesso que cada compra dá.
     Preços e nomes são sugestão e podem mudar sem mexer no resto do app. */
  produtos: {
    start:      { nome: 'Canal Vice City · Start',    tipo: 'plano',    preco: 'R$ 9,90',  checkout: '#CHECKOUT_START',
                  libera: ['acervo_start', 'app', 'suporte'] },
    completo:   { nome: 'Canal Vice City · Completo', tipo: 'plano',    preco: 'R$ 19,90', checkout: '#CHECKOUT_COMPLETO',
                  libera: ['acervo', 'app', 'suporte', 'recarga', 'ineditos', 'agenda', 'canal', 'grana', 'remix', 'comunidade', 'estrutura', 'ferramentas'] },
    capas:      { nome: 'Kit Capas Vice City',        tipo: 'bump',     preco: 'R$ 9,90',  checkout: '#CHECKOUT_CAPAS',
                  libera: ['capas'] },
    carrossel:  { nome: 'Pack Carrossel Vice City',   tipo: 'bump',     preco: 'R$ 12,90', checkout: '#CHECKOUT_CARROSSEL',
                  libera: ['carrossel'] },
    piloto:     { nome: 'Piloto Automático',          tipo: 'upsell',   preco: 'R$ 47',    checkout: '#CHECKOUT_PILOTO',
                  libera: ['piloto', 'robo', 'piloto_lite'] },
    piloto_lite:{ nome: 'Piloto Automático · versão prompts', tipo: 'downsell', preco: 'R$ 27', checkout: '#CHECKOUT_PILOTO_LITE',
                  libera: ['piloto_lite'] }
  }
};
