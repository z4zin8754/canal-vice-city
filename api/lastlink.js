// Webhook da Lastlink → libera ou bloqueia produtos no app.
// Variáveis na Vercel: SUPABASE_URL, SUPABASE_SERVICE_KEY, WEBHOOK_TOKEN,
// PRODUTOS_LASTLINK = JSON {"<id ou nome do produto na Lastlink>":"completo", ...}
// URL para colar na Lastlink: https://canal-vice-city.vercel.app/api/lastlink?token=WEBHOOK_TOKEN
const pick = (o, paths) => { for (const p of paths) { const v = p.split('.').reduce((a, k) => (a == null ? a : a[k]), o); if (v != null && v !== '') return v; } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true, info: 'webhook Canal Vice City' });
  if (!process.env.WEBHOOK_TOKEN || req.query.token !== process.env.WEBHOOK_TOKEN) return res.status(401).json({ erro: 'token' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const d = body.Data || body.data || body;
  const evento = String(pick(body, ['Event', 'event', 'type', 'Type']) || '').toLowerCase();
  const email = String(pick(d, ['Buyer.Email', 'buyer.email', 'Customer.Email', 'customer.email', 'email', 'Email']) || '').trim().toLowerCase();
  const pedido = String(pick(d, ['Purchase.PaymentId', 'Purchase.Id', 'Order.Id', 'order_id', 'id', 'Id']) || '');
  let itens = pick(d, ['Products', 'products', 'Items', 'items']);
  if (!Array.isArray(itens)) itens = [pick(d, ['Product', 'product', 'Offer', 'offer']) || d];
  const mapa = JSON.parse(process.env.PRODUTOS_LASTLINK || '{}');
  const chaves = [...new Set(itens.flatMap(i => [i && (i.Id || i.id), i && (i.Name || i.name || i.title)]).filter(Boolean).map(x => mapa[String(x)]).filter(Boolean))];
  if (!email || !chaves.length) { console.log('ignorado', JSON.stringify(body).slice(0, 2000)); return res.status(200).json({ ok: true, ignorado: true }); }
  const negado = /refund|reembols|chargeback|cancel|expired|expir/.test(evento);
  const aprovado = /confirm|approved|aprovad|paid|pago|complete/.test(evento);
  if (!negado && !aprovado) return res.status(200).json({ ok: true, ignorado: evento });
  const status = negado ? (/refund|reembols|chargeback/.test(evento) ? 'reembolsada' : 'cancelada') : 'aprovada';
  const rows = chaves.map(produto => ({ email, produto, status, pedido, origem: 'lastlink', bruto: body }));
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/compras?on_conflict=email,produto`, {
    method: 'POST',
    headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify(rows)
  });
  if (!r.ok) return res.status(500).json({ erro: await r.text() });
  return res.status(200).json({ ok: true, email, chaves, status });
}
