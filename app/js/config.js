/* Canal Vice City · configuração do app
   Tudo aqui é editável: produtos, preços, links de checkout e conexão com o Supabase.
   Enquanto SUPABASE_URL estiver vazio, o app roda em "modo prévia" (login só com e-mail, tudo liberado). */
window.CVC = {
  LOGIN: 'email',                        // entra com o e-mail da compra; o servidor confere em /api/acesso
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  SUPORTE_WHATSAPP: 'https://wa.me/5522992112291?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20o%20Canal%20Vice%20City',          // link do grupo/suporte no WhatsApp
  DIAS_ESTRUTURA: 7,                     // Estrutura de Vendas libera X dias após o primeiro login
  RECARGA_SEMANAS: 12,

  /* Planos e produtos. "libera" = chaves de acesso que cada compra dá.
     Preços e nomes são sugestão e podem mudar sem mexer no resto do app. */
  // Esteira (Money Model): plano de entrada -> 2 order bumps no checkout -> upsell de 1 clique -> downsell -> continuidade
  produtos: {
    start:      { nome: 'Canal Vice City · Start',    tipo: 'plano',    preco: 'R$ 9,90',  checkout: 'https://pay.hub.la/Tbk2JcmK1yaMJZv6Bsy9',
                  libera: ['acervo_start', 'app', 'suporte', 'revenda'] },
    completo:   { nome: 'Canal Vice City · Completo', tipo: 'plano',    preco: 'R$ 19,90', checkout: 'https://pay.hub.la/0bkjLGvqCBno9JeLZWi2',
                  libera: ['acervo', 'app', 'suporte', 'recarga', 'ineditos', 'agenda', 'canal', 'grana', 'remix', 'comunidade', 'estrutura', 'ferramentas', 'revenda'] },
    estudio:    { nome: 'Estúdio Vice',               tipo: 'bump',     preco: 'R$ 14,90', checkout: 'https://pay.hub.la/oS3ndG9h7QDUWsLkQl53',
                  libera: ['estudio'] },
    kitfeed:    { nome: 'Kit Feed Vice (capas + carrosséis)', tipo: 'bump', preco: 'R$ 9,90', checkout: 'https://pay.hub.la/s5fjukxbAm65gbwJt2Ml',
                  libera: ['capas', 'carrossel'] },
    piloto:     { nome: 'Piloto Automático',          tipo: 'upsell',   preco: 'R$ 47',    checkout: 'https://pay.hub.la/XwTtYzrW5B6iibaUoKPu',
                  libera: ['piloto', 'robo', 'piloto_lite', 'estudio'] },
    piloto_lite:{ nome: 'Piloto Automático Lite',     tipo: 'downsell', preco: 'R$ 27',    checkout: 'https://pay.hub.la/V0MWmYY6npUf59fk31uI',
                  libera: ['piloto_lite'] },
    clube:      { nome: 'Clube Recarga Vice',         tipo: 'assinatura', preco: 'R$ 9,90/mês', checkout: '#CHECKOUT_CLUBE',
                  libera: ['clube'] }
  },
  AFILIADOS: 'https://hub.la/group_affiliate/0bkjLGvqCBno9JeLZWi2',   // programa de afiliados da Hubla (só compradores) (comissão de 50%)

};
