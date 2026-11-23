// Webhook da Hubla → libera ou bloqueia produtos no app (tabela public.compras do Supabase).
// Variáveis na Vercel: SUPABASE_URL, SUPABASE_SERVICE_KEY, HUBLA_TOKEN (aba Autenticação da integração Webhook na Hubla).
// URL para a regra na Hubla: https://canal-vice-city.vercel.app/api/hubla
//
// O leitor não depende do formato exato do JSON: procura no evento inteiro os IDs dos nossos produtos
// e ofertas (produto principal, order bumps e upsell vêm cada um com seu ID) e o e-mail de quem pagou.

// ID do produto ou da oferta na Hubla -> chave de acesso do app (app/js/config.js -> produtos)
const MAPA = {
  // Canal Vice City · Completo
  jaSyR9Gy8yTEHK3PdT6T: 'completo', '0bkjLGvqCBno9JeLZWi2': 'completo',
  // Canal Vice City · Start
  M6f3CRt0qyMgZal9YUSq: 'start', Tbk2JcmK1yaMJZv6Bsy9: 'start',
  // Estúdio Vice (produto do order bump + produto original)
  BhGj2jIIWnfz9JSkFPpE: 'estudio', oS3ndG9h7QDUWsLkQl53: 'estudio',
  jHusEugD5gr5RVrOwUJh: 'estudio', Usua3j1GLRWlapc9EkiP: 'estudio', Z2MJQDjxU0KJmcuqgmFx: 'estudio',
  // Kit Feed Vice (order bump)
  ERkgmyDeLHexjGlmEstU: 'kitfeed', s5fjukxbAm65gbwJt2Ml: 'kitfeed',
  // Piloto Automático (upsell 1 clique)
  GChbi1uccPvqfozMEbH8: 'piloto', XwTtYzrW5B6iibaUoKPu: 'piloto',
  // Piloto Lite (downsell)
  hpE0rlOvztjhGT7njcfz: 'piloto_lite', V0MWmYY6npUf59fk31uI: 'piloto_lite'
};
const PADROES_EXTRA = (() => { try { return JSON.parse(process.env.PRODUTOS_HUBLA || '{}'); } catch { return {}; } })();
Object.assign(MAPA, PADROES_EXTRA);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// percorre o JSON guardando o caminho de cada valor
function walk(o, path, out) {
  if (o == null) return;
  if (Array.isArray(o)) return o.forEach((v, i) => walk(v, path.concat(String(i)), out));
  if (typeof o === 'object') return Object.entries(o).forEach(([k, v]) => walk(v, path.concat(k), out));
  out.push({ path: path.join('.').toLowerCase(), key: (path[path.length - 1] || '').toLowerCase(), value: o });
}

function acharEmail(campos) {
  const emails = campos.filter(c => typeof c.value === 'string' && EMAIL_RE.test(c.value.trim()));
  const ruim = /receiver|seller|producer|produtor|owner|affiliate|afiliad|coproduc|partner|creator|support|suporte/;
  const bons = emails.filter(c => !ruim.test(c.path));
  const ordem = ['payer', 'buyer', 'customer', 'comprador', 'user', 'member', 'membro', 'lead', 'subscriber'];
  for (const k of ordem) { const e = bons.find(c => c.path.includes(k)); if (e) return e.value.trim().toLowerCase(); }
  return bons[0]?.value.trim().toLowerCase() || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true, info: 'webhook Hubla · Canal Vice City' });
  const token = req.headers['x-hubla-token'] || req.query.token;
  if (!process.env.HUBLA_TOKEN || token !== process.env.HUBLA_TOKEN) return res.status(401).json({ erro: 'token' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const tipo = String(body.type || body.event_type || body.event || '').toLowerCase();
  const campos = []; walk(body, [], campos);

  // log bruto de todo evento (ajuda a conferir o primeiro teste)
  const sb = (path, opts) => fetch(`${(process.env.SUPABASE_URL || 'https://xvnjteechdwwwepxlyel.supabase.co')}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });
  await sb('eventos', { method: 'POST', body: JSON.stringify({ tipo, bruto: body }) }).catch(() => {});

  const statusFatura = String((campos.find(c => c.key === 'status' && /invoice|fatura/.test(c.path)) || {}).value || '').toLowerCase();
  const sinal = tipo + ' ' + statusFatura;
  const negado = /refund|reembols|chargeback|charged_back|disput|cancel/.test(sinal);
  const aprovado = !negado && /payment_succeeded|\bpaid\b|\bpago\b|approved|aprovad|completed/.test(sinal);
  if (!negado && !aprovado) return res.status(200).json({ ok: true, ignorado: tipo || 'sem tipo' });

  const ids = new Set(campos.filter(c => typeof c.value === 'string').map(c => c.value.trim()));
  const chaves = [...new Set(Object.keys(MAPA).filter(id => ids.has(id)).map(id => MAPA[id]))];
  const email = acharEmail(campos);
  if (!email || !chaves.length) return res.status(200).json({ ok: true, ignorado: true, motivo: !email ? 'sem e-mail' : 'produto desconhecido' });

  const status = negado ? (/cancel/.test(sinal) && !/refund|reembols|chargeback/.test(sinal) ? 'cancelada' : 'reembolsada') : 'aprovada';
  const pedido = String((campos.find(c => c.key === 'id' && /invoice|fatura/.test(c.path)) || campos.find(c => c.key === 'id') || {}).value || '');
  const rows = chaves.map(produto => ({ email, produto, status, pedido, origem: 'hubla', bruto: body }));
  const r = await sb('compras?on_conflict=email,produto', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify(rows) });
  if (!r.ok) return res.status(500).json({ erro: await r.text() });
  return res.status(200).json({ ok: true, email, chaves, status });
}
