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
  // Esteira (Money Model): plano de entrada -> 2 order bumps no checkout -> upsell de 1 clique -> downsell -> continuidade
  produtos: {
    start:      { nome: 'Canal Vice City · Start',    tipo: 'plano',    preco: 'R$ 9,90',  checkout: '#CHECKOUT_START',
                  libera: ['acervo_start', 'app', 'suporte', 'revenda'] },
    completo:   { nome: 'Canal Vice City · Completo', tipo: 'plano',    preco: 'R$ 19,90', checkout: '#CHECKOUT_COMPLETO',
                  libera: ['acervo', 'app', 'suporte', 'recarga', 'ineditos', 'agenda', 'canal', 'grana', 'remix', 'comunidade', 'estrutura', 'ferramentas', 'revenda'] },
    estudio:    { nome: 'Estúdio Vice',               tipo: 'bump',     preco: 'R$ 14,90', checkout: '#CHECKOUT_ESTUDIO',
                  libera: ['estudio'] },
    kitfeed:    { nome: 'Kit Feed Vice (capas + carrosséis)', tipo: 'bump', preco: 'R$ 9,90', checkout: '#CHECKOUT_KITFEED',
                  libera: ['capas', 'carrossel'] },
    piloto:     { nome: 'Piloto Automático',          tipo: 'upsell',   preco: 'R$ 47',    checkout: '#CHECKOUT_PILOTO',
                  libera: ['piloto', 'robo', 'piloto_lite', 'estudio'] },
    piloto_lite:{ nome: 'Piloto Automático Lite',     tipo: 'downsell', preco: 'R$ 27',    checkout: '#CHECKOUT_PILOTO_LITE',
                  libera: ['piloto_lite'] },
    clube:      { nome: 'Clube Recarga Vice',         tipo: 'assinatura', preco: 'R$ 9,90/mês', checkout: '#CHECKOUT_CLUBE',
                  libera: ['clube'] }
  },
  AFILIADOS: '#LINK_AFILIADOS_LASTLINK',   // página de afiliação da Lastlink (comissão de 50%)

};
