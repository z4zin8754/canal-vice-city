// Login do app pelo e-mail da compra: devolve os produtos aprovados daquele e-mail.
// Usa as mesmas variáveis do webhook (SUPABASE_URL, SUPABASE_SERVICE_KEY). Nada de senha nem link mágico:
// quem comprou entra digitando o e-mail usado no checkout da Hubla.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const email = String(body.email || req.query.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, erro: 'email' });
  // Contas de teste (só para conferir a visão do aluno). Não existem no banco e não recebem nada da Hubla.
  const DEMO = {
    'aluno.completo@canalvicecity.teste': ['completo'],
    'aluno.start@canalvicecity.teste': ['start'],
    'aluno.tudo@canalvicecity.teste': ['completo', 'estudio', 'kitfeed', 'piloto']
  };
  if (DEMO[email]) return res.status(200).json({ ok: true, email, produtos: DEMO[email], teste: true });
  if (!(process.env.SUPABASE_URL || 'https://xvnjteechdwwwepxlyel.supabase.co') || !process.env.SUPABASE_SERVICE_KEY) return res.status(503).json({ ok: false, erro: 'banco' });
  const r = await fetch(`${(process.env.SUPABASE_URL || 'https://xvnjteechdwwwepxlyel.supabase.co')}/rest/v1/compras?select=produto,status&email=eq.${encodeURIComponent(email)}`, {
    headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}` }
  });
  if (!r.ok) return res.status(502).json({ ok: false, erro: 'banco' });
  const linhas = await r.json();
  const produtos = [...new Set(linhas.filter(l => l.status === 'aprovada').map(l => l.produto))];
  return res.status(200).json({ ok: true, email, produtos });
}
