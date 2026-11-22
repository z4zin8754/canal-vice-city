// Catálogo vivo: lê as pastas do Drive e devolve os vídeos para o app.
// Basta subir o vídeo na pasta certa do Drive: em até 10 minutos ele aparece no app, na categoria certa.
// Variável na Vercel: GOOGLE_API_KEY (chave de API do Google Cloud com a Drive API ativada).
const RAIZ = process.env.DRIVE_RAIZ || '1DqKoXNjSPOpTjCj25W9FMrOY2lMMBivU';      // pasta "Cortes GTA 6"
const ACERVO = process.env.DRIVE_ACERVO || '12T_rHkAu80-VqWmOlgoOGu1buhaL16OP';  // "Acervo Plataforma"
const CATS = [[/geral/i, 'geral'], [/v[ií]deos gta|longo/i, 'longos'], [/cortes/i, 'cortes'], [/novos|streamer|recarga/i, 'novos'], [/vazamento|not[ií]cia/i, 'vazamentos'], [/meme/i, 'memes'], [/trailer/i, 'trailers'], [/clipe/i, 'clipes'], [/curiosidade/i, 'curiosidades'], [/teoria/i, 'teorias'], [/react/i, 'reacts'], [/compara/i, 'comparacoes'], [/in[eé]dito/i, 'ineditos']];
const slug = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const limpa = n => n.replace(/\.(mp4|mov|m4v|webm|mkv)$/i, '').replace(/^[A-Za-z0-9_-]{11}\s+\d+\s*-\s*/, '').trim();

async function listar(pai, key, tipo) {
  const out = []; let page = '';
  const q = `'${pai}' in parents and trashed=false and ` + (tipo === 'pasta' ? "mimeType='application/vnd.google-apps.folder'" : "mimeType contains 'video/'");
  do {
    const u = `https://www.googleapis.com/drive/v3/files?pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true&orderBy=createdTime&fields=nextPageToken,files(id,name,size,createdTime)&q=${encodeURIComponent(q)}&key=${key}${page ? '&pageToken=' + page : ''}`;
    const r = await fetch(u); if (!r.ok) throw new Error('drive ' + r.status + ' ' + (await r.text()).slice(0, 200));
    const j = await r.json(); out.push(...j.files); page = j.nextPageToken || '';
  } while (page);
  return out;
}

export default async function handler(req, res) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return res.status(200).json({ ok: false, motivo: 'GOOGLE_API_KEY não configurada' });
  try {
    const videos = [], criadores = {};
    const raiz = await listar(RAIZ, key, 'pasta');
    const tarefas = [];
    for (const p of raiz) {
      if (p.id === ACERVO) {
        const subs = await listar(ACERVO, key, 'pasta');
        for (const s of subs) { const c = (CATS.find(([re]) => re.test(s.name)) || [])[1]; if (c) tarefas.push([s.id, c, '']); }
      } else {
        const t = slug(p.name) || 'criador'; criadores[t] = p.name; tarefas.push([p.id, 'ineditos', t]);
      }
    }
    // vídeos soltos na raiz também entram como inéditos
    tarefas.push([RAIZ, 'ineditos', 'time']); criadores.time = 'Time Vice City';
    const listas = await Promise.all(tarefas.map(([id]) => listar(id, key, 'video').catch(() => [])));
    listas.forEach((fs, i) => { const [, cat, tema] = tarefas[i]; fs.forEach(f => videos.push([f.id, cat, limpa(f.name), Math.round((+f.size || 0) / 1048576), tema, 0, f.createdTime])); });
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json({ ok: true, gerado: new Date().toISOString(), criadores, videos });
  } catch (e) {
    return res.status(200).json({ ok: false, motivo: String(e.message || e).slice(0, 300) });
  }
}
