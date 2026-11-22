/* Canal Vice City · app de membros */
(function () {
'use strict';
const C = window.CONTENT, CFG = window.CVC;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, cls = '') => `<svg class="ic ${cls}"><use href="#i-${n}"/></svg>`;
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';
const fmt = n => n.toLocaleString('pt-BR');
const MODO_PREVIA = !CFG.SUPABASE_URL;

/* ---------- Drive ---------- */
const thumb = (id, w = 480) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
const dl = id => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;
const prev = id => `https://drive.google.com/file/d/${id}/preview`;

/* ---------- Estado ---------- */
const S = { user: null, acc: new Set(), cat: null, vids: [], byId: {}, imgs: [], extras: {}, previewPlan: 'completo' };
const ns = () => 'cvc:' + (S.user?.email || 'anon') + ':';
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(ns() + k)); return v ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(ns() + k, JSON.stringify(v)); } catch {} sync(k, v); };
let syncT = {};
function sync(k, v) { // espelha no Supabase quando conectado
  if (!S.sb || !S.user?.id) return;
  clearTimeout(syncT[k]);
  syncT[k] = setTimeout(() => S.sb.from('progresso').upsert({ user_id: S.user.id, chave: k, valor: v, atualizado: new Date().toISOString() }), 800);
}
const sets = { fav: () => new Set(load('fav', [])), posted: () => new Set(load('posted', [])) };
function toggleSet(k, id) { const s = new Set(load(k, [])); s.has(id) ? s.delete(id) : s.add(id); save(k, [...s]); return s.has(id); }

/* ---------- Toast ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.innerHTML = ic('check') + esc(msg); t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1900); }
async function copy(txt, msg = 'Copiado') { try { await navigator.clipboard.writeText(txt); toast(msg); } catch { prompt('Copie o texto:', txt); } }

/* ---------- RNG ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
function shuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/* ---------- Acesso ---------- */
const can = k => S.acc.has(k);
function applyPlan(keys) {
  S.acc = new Set();
  keys.forEach(p => (CFG.produtos[p]?.libera || []).forEach(x => S.acc.add(x)));
  if (S.acc.has('acervo')) S.acc.add('acervo_start');
}
function vidAllowed(v) {
  if (v.cat === 'ineditos') return can('ineditos');
  if (v.cat === 'novos') return can('recarga');
  return can('acervo') || (can('acervo_start') && v.start);
}
const allowedVids = () => S.vids.filter(vidAllowed);

/* ---------- Títulos bonitos ---------- */
function pretty(v) {
  const n = v.raw;
  let m;
  if (v.cat === 'ineditos') return n;
  if (v.cat === 'novos') {
    m = n.split(/\s[-·]\s/);
    const tipo = (m[0] || '').replace(' GTA', '');
    return `${tipo} · ${(m[1] || '').replace('-', '/')} · #${(m[2] || '').trim()}`;
  }
  const num = (n.match(/(\d+)\)?\s*$/) || [])[1] || '';
  const nome = { geral: 'Vice City', longos: 'Vídeo longo', cortes: 'Corte', memes: 'Meme', curiosidades: 'Curiosidade', teorias: 'Teoria', reacts: 'React', clipes: 'Clipe', vazamentos: 'Notícia', trailers: 'Trailer', comparacoes: 'Comparação' }[v.cat] || 'Vídeo';
  return `${nome} #${num}`;
}

/* ---------- Legendas ---------- */
function ganchoPara(v, r) { const g = C.ganchos[C.ganchosPorCat[v.cat] || 'corte']; return pick(g, r); }
function legenda(v, plat, seed = 1) {
  const r = rng(hash(v.id + plat) + seed);
  const g = ganchoPara(v, r);
  const cta = pick(C.ctas, r);
  const tags = [...C.tagsBase, ...(C.tagsCat[v.cat] || []), ...(C.tagsPlat[plat] || [])];
  const tit = pick(C.titulos, r).replace('{g}', g);
  return { titulo: tit, gancho: g, texto: `${g}\n\n${cta}\n\n${tags.join(' ')}`, tags: tags.join(' ') };
}

/* ---------- Ícone/marca ---------- */
const brand = (sub = true) => `<a class="brand" href="#/qg"><span class="brand-mark">${STAR}</span><span><b>Canal Vice City</b>${sub ? '<small>members only</small>' : ''}</span></a>`;

/* ---------- Estrelas de procurado (progresso) ---------- */
function wantedLevel() {
  let n = 1;
  if (load('plano', null)) n++;
  if ((load('checks', {}).canal_perfil)) n++;
  if (load('agenda', null)) n++;
  if (sets.posted().size > 0) n++;
  return n;
}
const starsHtml = n => `<div class="stars" aria-label="Nível ${n} de 5">${[1, 2, 3, 4, 5].map(i => STAR.replace('<svg', `<svg class="${i <= n ? 'on' : ''}"`)).join('')}</div>`;

/* =====================================================================
   LOGIN
   ===================================================================== */
function viewLogin(msg = '') {
  document.body.innerHTML = SPRITE + `
  <div class="login">
    <div class="login-art">
      <img src="assets/hero.webp" alt="">
      <div class="cap rv">
        <span class="kick">${ic('star', 'f')} Área de membros</span>
        <h1 class="h1" style="margin-top:14px">Bem-vindo a<br><span class="grad">Vice City.</span></h1>
        <p class="lead" style="margin-top:10px">Seu acervo, sua agenda e seu plano para monetizar, tudo num lugar só.</p>
      </div>
    </div>
    <div class="login-box">
      <div class="login-in rv">
        ${brand()}
        <h2 class="h2" style="margin-top:28px">Entrar no app</h2>
        <p class="mut" style="margin-top:6px">Use o e-mail da sua compra.</p>
        ${msg ? `<div class="alert">${ic('bolt')}<span>${esc(msg)}</span></div>` : ''}
        ${MODO_PREVIA ? '' : `<button class="btn gbtn" id="g" style="margin-top:22px"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z"/></svg>Entrar com Google</button><div class="or">ou</div>`}
        <form id="f">
          <label class="field"><span>E-mail</span><input class="input" type="email" id="em" required placeholder="seuemail@exemplo.com" autocomplete="email"></label>
          <label class="field hide" id="pwf"><span>Senha</span><input class="input" type="password" id="pw" autocomplete="current-password"></label>
          <button class="btn btn-p" style="width:100%;margin-top:16px" id="sub">${MODO_PREVIA ? 'Entrar' : 'Receber link de acesso no e-mail'}</button>
        </form>
        ${MODO_PREVIA ? '<p class="note"><span class="preview-flag">Modo prévia</span> O login com Google e o link por e-mail entram assim que o banco de dados for conectado.</p>' : '<button class="btn btn-g btn-s" id="usepw" style="margin-top:12px;width:100%">Prefiro entrar com senha</button><p class="note">Primeiro acesso? O link chega no e-mail da compra. Clicou, entrou.</p>'}
      </div>
    </div>
  </div>`;
  reveal();
  const f = $('#f');
  if (!MODO_PREVIA) {
    let usePw = false;
    $('#g').onclick = () => S.sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
    $('#usepw').onclick = () => { usePw = !usePw; $('#pwf').classList.toggle('hide', !usePw); $('#sub').textContent = usePw ? 'Entrar' : 'Receber link de acesso no e-mail'; $('#usepw').textContent = usePw ? 'Prefiro receber o link' : 'Prefiro entrar com senha'; };
    f.onsubmit = async e => {
      e.preventDefault();
      const email = $('#em').value.trim().toLowerCase();
      $('#sub').disabled = true;
      if (usePw) {
        const { error } = await S.sb.auth.signInWithPassword({ email, password: $('#pw').value });
        if (error) return viewLogin('E-mail ou senha incorretos. Se ainda não criou senha, use o link por e-mail.');
      } else {
        const { error } = await S.sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true } });
        if (error) return viewLogin('Não foi possível enviar o link agora. Tente de novo em alguns segundos.');
        $('.login-in').innerHTML = brand() + `<h2 class="h2" style="margin-top:28px">Confira seu e-mail</h2><p class="lead" style="margin-top:10px">Enviamos um link de acesso para <b>${esc(email)}</b>. Toque nele neste aparelho e você entra direto.</p><p class="note">Não chegou? Veja a caixa de spam ou promoções.</p>`;
      }
    };
  } else {
    f.onsubmit = e => {
      e.preventDefault();
      const email = $('#em').value.trim().toLowerCase();
      localStorage.setItem('cvc:sessao', email);
      boot();
    };
  }
}

/* =====================================================================
   SHELL
   ===================================================================== */
const NAV = [
  ['Principal', [
    ['qg', 'QG', 'app', null],
    ['recarga', 'Recarga Vice City', 'refresh', null],
    ['biblioteca', 'Biblioteca completa', 'film', null],
    ['ineditos', 'Cortes Inéditos', 'gem', 'ineditos'],
    ['imagens', 'Imagens', 'card', null],
    ['agenda', 'Gerador Agenda Vice', 'cal', 'agenda']
  ]],
  ['Bônus', [
    ['plano', 'Plano de Golpe', 'rocket', null],
    ['canal', 'Canal do Zero', 'user', 'canal'],
    ['grana', 'Mapa da Grana', 'coin', 'grana'],
    ['remix', 'Kit Remix', 'wand', 'remix'],
    ['ferramentas', 'Ferramentas', 'bolt', 'ferramentas'],
    ['estrutura', 'Estrutura de Vendas', 'funnel', 'estrutura']
  ]],
  ['Extras', [
    ['extra/capas', 'Kit Capas', 'tag', 'capas'],
    ['extra/carrossel', 'Pack Carrossel', 'note', 'carrossel'],
    ['extra/piloto', 'Piloto Automático', 'play', 'piloto_lite']
  ]]
];
function shell() {
  const lockIc = k => k && !can(k) ? `<svg class="ic lk"><use href="#i-lock"/></svg>` : '';
  document.body.innerHTML = SPRITE + `
  <div class="shell">
    <aside class="side">
      ${brand()}
      <nav class="nav">${NAV.map(([g, items]) => `<div class="nav-g">${g}</div>` + items.map(([r, n, i, k]) => `<a href="#/${r}" data-r="${r}">${ic(i)}<span>${n}</span>${lockIc(k)}</a>`).join('')).join('')}</nav>
      <div class="side-foot">
        <a class="nav" href="${CFG.SUPORTE_WHATSAPP}" target="_blank" rel="noopener" style="display:block"><span style="display:flex;gap:12px;align-items:center;padding:10px 12px;color:var(--mut);font-weight:650">${ic('chat')}Suporte no WhatsApp</span></a>
        <div class="me"><span class="av">${esc((S.user.email || '?')[0].toUpperCase())}</span><div style="min-width:0;flex:1"><div class="em">${esc(S.user.email)}</div><button class="dim" id="sair" style="font-size:12px;font-weight:700">Sair</button></div></div>
      </div>
    </aside>
    <div class="main">
      ${MODO_PREVIA ? `<div class="preview-bar">${ic('bolt')} <b>Modo prévia</b> · simulando a compra: <select id="simp"><option value="completo">Completo</option><option value="start">Start</option><option value="tudo">Completo + bumps + upsell</option></select> · login real entra quando o banco for conectado.</div>` : ''}
      <header class="top">
        ${brand(false)}
        <label class="search">${ic('funnel')}<input id="q" type="search" placeholder="Buscar vídeos por nome, categoria ou tema"></label>
        <div class="wanted" title="Seu nível de procurado sobe a cada etapa concluída"><div class="lbl">Nível de<br>procurado</div><span id="stars"></span></div>
      </header>
      <main class="view" id="view"></main>
    </div>
  </div>
  <nav class="tabbar">
    <a href="#/qg" data-r="qg">${ic('app')}QG</a>
    <a href="#/recarga" data-r="recarga">${ic('refresh')}Recarga</a>
    <a href="#/agenda" data-r="agenda">${ic('cal')}Agenda</a>
    <a href="#/bonus" data-r="bonus">${ic('gem')}Bônus</a>
    <a href="#/conta" data-r="conta">${ic('user')}Conta</a>
  </nav>
  <div class="modal" id="modal"><div class="mbox" id="mbox"></div></div>
  <div class="toast" id="toast"></div>`;
  $('#sair').onclick = logout;
  const simp = $('#simp');
  if (simp) { simp.value = S.previewPlan; simp.onchange = () => { S.previewPlan = simp.value; localStorage.setItem('cvc:simp', simp.value); setPreviewAccess(); shell(); route(); }; }
  $('#q').addEventListener('keydown', e => { if (e.key === 'Enter') location.hash = '#/biblioteca?q=' + encodeURIComponent(e.target.value.trim()); });
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  refreshStars();
}
function refreshStars() { const el = $('#stars'); if (el) el.innerHTML = starsHtml(wantedLevel()); }
function setPreviewAccess() {
  const p = S.previewPlan;
  applyPlan(p === 'tudo' ? ['completo', 'capas', 'carrossel', 'piloto'] : [p]);
}
async function logout() {
  if (S.sb) await S.sb.auth.signOut();
  localStorage.removeItem('cvc:sessao');
  S.user = null; viewLogin();
}

/* ---------- Modal ---------- */
function openModal(html) { $('#mbox').innerHTML = html; $('#modal').classList.add('on'); document.body.style.overflow = 'hidden'; }
function closeModal() { const m = $('#modal'); if (!m?.classList.contains('on')) return; m.classList.remove('on'); document.body.style.overflow = ''; setTimeout(() => { if (!m.classList.contains('on')) $('#mbox').innerHTML = ''; }, 250); }

/* ---------- Reveal ---------- */
function reveal() {
  const els = $$('.rv:not(.in)');
  if (!('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -40px' });
  els.forEach((e, i) => { e.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms'; io.observe(e); });
}

/* =====================================================================
   COMPONENTES
   ===================================================================== */
function vcard(v) {
  const fav = sets.fav().has(v.id), done = sets.posted().has(v.id), cat = C.cats[v.cat];
  return `<article class="vc" data-id="${v.id}">
    <div class="th" data-open="${v.id}"><img loading="lazy" src="${thumb(v.id)}" alt="" onerror="this.style.opacity=0"><span class="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
      <span class="tag" style="color:${cat.cor}">${esc(cat.curto)}</span>
      <button class="fav ${fav ? 'on' : ''}" data-fav="${v.id}" aria-label="Favoritar">${STAR}</button>
      ${done ? '<span class="done-b">Postado</span>' : ''}</div>
    <div class="bd"><div class="tt">${esc(v.title)}</div>
      <div class="acts"><a class="btn btn-p" href="${dl(v.id)}" target="_blank" rel="noopener">${ic('play')}Baixar</a>
      <button class="btn btn-g ib cp" data-copy="${v.id}" title="Copiar legenda e tags">${ic('tag')}</button>
      <button class="btn btn-g ib" data-post="${v.id}" title="Marcar como postado">${ic('check')}</button></div></div>
  </article>`;
}
function bindCards(root = document) {
  root.onclick = e => {
    const t = e.target.closest('[data-open],[data-fav],[data-copy],[data-post]');
    if (!t) return;
    if (t.dataset.fav) { e.stopPropagation(); const on = toggleSet('fav', t.dataset.fav); t.classList.toggle('on', on); toast(on ? 'Salvo nos favoritos' : 'Removido dos favoritos'); return; }
    if (t.dataset.copy) { const v = S.byId[t.dataset.copy]; copy(legenda(v, 'tiktok').texto, 'Legenda e tags copiadas'); return; }
    if (t.dataset.post) { const on = toggleSet('posted', t.dataset.post); toast(on ? 'Marcado como postado' : 'Desmarcado'); const card = t.closest('.vc'); if (card) card.outerHTML = vcard(S.byId[t.dataset.post]); refreshStars(); return; }
    if (t.dataset.open) openVideo(t.dataset.open);
  };
}
function openVideo(id, plat = 'tiktok') {
  const v = S.byId[id]; if (!v) return;
  const cat = C.cats[v.cat];
  const render = p => {
    const l = legenda(v, p);
    const done = sets.posted().has(id), fav = sets.fav().has(id);
    openModal(`<div class="mhead"><span class="pill" style="color:${cat.cor}">${esc(cat.curto)}</span><b>${esc(v.title)}</b><button class="x" data-x>${ic('x')}</button></div>
    <div class="mbody"><div class="player-wrap">
      <div class="player"><iframe src="${prev(id)}" allow="autoplay" loading="lazy"></iframe></div>
      <div>
        <h3 class="h3">Pronto para postar</h3>
        <p class="mut" style="font-size:13.5px;margin-top:4px">Escolha a rede e copie título, legenda e hashtags.</p>
        <div class="ptabs" style="margin-top:12px">${Object.entries(C.plats).map(([k, pl]) => `<button class="chip ${k === p ? 'on' : ''}" data-plat="${k}"><span class="dot" style="background:${pl.cor}"></span>${pl.nome.replace('Instagram ', '').replace('YouTube ', '').replace('Facebook ', 'Face ')}</button>`).join('')}</div>
        <div style="margin-top:14px"><div class="row"><b style="font-size:13px">Título</b><span class="sp"></span><button class="btn btn-g btn-xs" data-c="t">Copiar</button></div><div class="copybox" style="margin-top:6px">${esc(l.titulo)}</div></div>
        <div style="margin-top:12px"><div class="row"><b style="font-size:13px">Legenda + hashtags</b><span class="sp"></span><button class="btn btn-g btn-xs" data-c="l">Copiar</button></div><div class="copybox" style="margin-top:6px">${esc(l.texto)}</div></div>
        <div class="alert" style="color:#bff7f1;background:rgba(34,211,197,.08);border-color:rgba(34,211,197,.25)">${ic('wand')}<span>Para contar como conteúdo original, coloque o gancho como texto na tela ou narre por cima. ${esc(C.plats[p].tamanho)}.</span></div>
        <div class="row" style="margin-top:16px">
          <a class="btn btn-p" href="${dl(id)}" target="_blank" rel="noopener" style="flex:1">${ic('play')}Baixar vídeo</a>
          <button class="btn btn-g" data-m="post">${ic('check')}${done ? 'Postado' : 'Marcar postado'}</button>
          <button class="btn btn-g" data-m="fav" aria-label="Favoritar">${fav ? '★' : '☆'}</button>
        </div>
        <p class="note">${v.mb ? v.mb + ' MB · ' : ''}<a href="https://drive.google.com/file/d/${id}/view" target="_blank" rel="noopener" style="text-decoration:underline">abrir no Drive</a></p>
      </div></div></div>`);
    $('#mbox').onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.x !== undefined) return closeModal();
      if (b.dataset.plat) return render(b.dataset.plat);
      if (b.dataset.c === 't') return copy(l.titulo, 'Título copiado');
      if (b.dataset.c === 'l') return copy(l.texto, 'Legenda copiada');
      if (b.dataset.m === 'post') { toggleSet('posted', id); refreshStars(); render(p); route(true); }
      if (b.dataset.m === 'fav') { toggleSet('fav', id); render(p); }
    };
  };
  render(plat);
}
function rail(title, vids, more, sub = '') {
  if (!vids.length) return '';
  return `<section class="rail rv"><div class="rail-h"><h3 class="h3">${title}</h3><span class="ct">${sub || fmt(vids.length) + ' vídeos'}</span>${more ? `<a class="more" href="${more}">Ver tudo ${ic('play')}</a>` : ''}</div>
  <div class="rail-wrap"><button class="rail-btn l" data-sc="-1" aria-label="Anterior">‹</button><div class="rail-track">${vids.slice(0, 16).map(vcard).join('')}</div><button class="rail-btn r" data-sc="1" aria-label="Próximo">›</button></div></section>`;
}
function bindRails() {
  $$('.rail-btn').forEach(b => b.onclick = () => { const tr = b.parentElement.querySelector('.rail-track'); tr.scrollBy({ left: tr.clientWidth * .9 * b.dataset.sc, behavior: 'smooth' }); });
}
function lockCard(k, txt) {
  const p = Object.entries(CFG.produtos).find(([, v]) => v.libera.includes(k));
  return `<div class="card lockscreen rv"><div class="big">${ic('lock')}</div><h2 class="h2">Área bloqueada</h2><p class="lead" style="margin:10px auto 0">${txt || 'Este conteúdo faz parte de outro plano.'}</p>${p ? `<a class="btn btn-p" style="margin-top:22px" href="${p[1].checkout}" target="_blank" rel="noopener">${ic('bolt')}Liberar ${esc(p[1].nome)} · ${esc(p[1].preco)}</a>` : ''}</div>`;
}

/* =====================================================================
   VIEWS
   ===================================================================== */
const V = {};

/* ---------- QG ---------- */
V.qg = () => {
  const plano = load('plano', null), ag = load('agenda', null), posted = sets.posted(), lv = wantedLevel();
  const vids = allowedVids();
  const first = (S.user.email || '').split('@')[0];
  const passos = [
    ['Monte seu Plano de Golpe', 'Responda 5 perguntas e receba a estratégia pronta.', '#/plano', !!plano],
    ['Crie seu canal', 'Nome, bio, logo com IA e perfil configurado.', '#/canal', !!load('checks', {}).canal_perfil],
    ['Gere sua agenda do mês', 'Vídeo, dia e horário para cada rede.', '#/agenda', !!ag],
    ['Poste o primeiro vídeo', 'Baixe, copie a legenda e marque como postado.', '#/recarga', posted.size > 0]
  ];
  const cur = passos.findIndex(p => !p[3]);
  const semana = recargaSemana();
  const mods = [
    ['recarga', 'Recarga Vice City', `Semana ${semana} de ${CFG.RECARGA_SEMANAS} liberada`, 'refresh', 'recarga', '#ff2d7a'],
    ['agenda', 'Gerador Agenda Vice', 'Seu mês montado em 1 clique', 'cal', 'agenda', '#22d3c5'],
    ['canal', 'Canal do Zero', 'Perfil pronto em menos de 1 hora', 'user', 'canal', '#ffc861'],
    ['grana', 'Mapa da Grana', `${C.rotas.length} formas de monetizar`, 'coin', 'grana', '#4ade80'],
    ['remix', 'Kit Remix', `${C.totalGanchos} ganchos + gerador`, 'wand', 'remix', '#a78bfa'],
    ['estrutura', 'Estrutura de Vendas', 'O nosso funil, aberto para você', 'funnel', 'estrutura', '#ff8a3d']
  ];
  return `
  <section class="qg-hero">
    <div class="hero art-sunset rv" style="min-height:300px"><span class="sun"></span>
      <div class="in"><span class="kick">${starsHtml(lv)} Nível ${lv} de 5</span>
        <h1 class="h1">E aí, ${esc(first)}.<br><span class="script" style="font-size:.8em">bem-vindo ao QG</span></h1>
        <p class="lead">${cur === -1 ? 'Seu canal está rodando. Agora é constância: siga a agenda e acompanhe o Mapa da Grana.' : 'Siga os passos ao lado e saia hoje com o canal criado e o mês agendado.'}</p>
        <div class="row" style="margin-top:16px"><a class="btn btn-p" href="${cur === -1 ? '#/agenda' : passos[cur][2]}">${ic('rocket')}${cur === -1 ? 'Abrir minha agenda' : passos[cur][0]}</a><a class="btn btn-g" href="#/recarga">${ic('refresh')}Ver a Recarga</a></div>
      </div>
    </div>
    <div class="card rv"><div class="row"><h3 class="h3">Sua missão</h3><span class="sp"></span><span class="pill">${passos.filter(p => p[3]).length}/4</span></div>
      <div style="display:grid;gap:10px;margin-top:14px">${passos.map((p, i) => `<a class="next ${p[3] ? 'done' : ''} ${i === cur ? 'cur' : ''}" href="${p[2]}"><span class="num">${p[3] ? ic('check') : i + 1}</span><span><b style="display:block">${p[0]}</b><span class="mut" style="font-size:13px">${p[1]}</span></span></a>`).join('')}</div>
    </div>
  </section>
  <section class="grid4 sec" style="margin-top:18px">
    <div class="statc rv"><b class="grad">${fmt(vids.length)}</b><span>vídeos liberados para você</span></div>
    <div class="statc rv"><b>${fmt(posted.size)}</b><span>vídeos postados</span></div>
    <div class="statc rv"><b>${ag ? agendaProgresso(ag) + '%' : '—'}</b><span>da agenda do mês</span></div>
    <div class="statc rv"><b>${semana}/${CFG.RECARGA_SEMANAS}</b><span>semanas de recarga</span></div>
  </section>
  ${plano ? planoResumo(plano) : `<section class="card glow sec rv" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:240px"><span class="kick">${ic('rocket')} Comece por aqui</span><h2 class="h2" style="margin-top:10px">Monte seu Plano de Golpe</h2><p class="mut" style="margin-top:6px">5 perguntas rápidas e você recebe a estratégia pronta: onde postar, quantos posts por dia, o que postar e qual o caminho mais rápido para monetizar.</p></div><a class="btn btn-p" href="#/plano">${ic('play')}Começar agora</a></section>`}
  <section class="sec"><div class="sec-h"><div><h2 class="h2">Seu arsenal</h2><p>Tudo o que veio no seu plano.</p></div></div>
    <div class="grid3">${mods.map(([r, n, d, i, k, c]) => `<a class="modc rv ${can(k) ? '' : 'lock'}" href="#/${r}" style="background:linear-gradient(160deg,color-mix(in srgb,${c} 22%,#24133f),#170c2c)">${can(k) ? '' : `<span class="lockb">${ic('lock')} Bloqueado</span>`}<span class="ico" style="color:${c}">${ic(i)}</span><span class="n">${n}</span><span class="d">${d}</span></a>`).join('')}</div>
  </section>
  ${can('recarga') ? rail('Recarga da semana', S.vids.filter(v => v.cat === 'novos'), '#/biblioteca?cat=novos', 'Lote ' + semana) : ''}
  ${can('ineditos') ? rail('Cortes Inéditos', S.vids.filter(v => v.cat === 'ineditos'), '#/ineditos', 'Só aqui') : ''}
  ${rail('Cortes que seguram até o fim', vids.filter(v => v.cat === 'cortes'), '#/biblioteca?cat=cortes')}
  ${rail('Memes para viralizar', vids.filter(v => v.cat === 'memes'), '#/biblioteca?cat=memes')}`;
};
function recargaSemana() {
  const fl = load('primeiro', Date.now());
  return Math.min(CFG.RECARGA_SEMANAS, 1 + Math.floor((Date.now() - fl) / (7 * 864e5)));
}
function planoResumo(p) {
  const pl = gerarPlano(p);
  return `<section class="card glow sec rv"><div class="row"><span class="kick">${ic('rocket')} Seu Plano de Golpe</span><span class="sp"></span><a class="btn btn-g btn-s" href="#/plano/ver">Ver plano completo</a></div>
  <h2 class="h2" style="margin-top:12px">${esc(pl.nome)}</h2><p class="mut" style="margin-top:6px">${esc(pl.resumo)}</p>
  <div class="grid3" style="margin-top:16px">${pl.kpis.map(k => `<div class="statc"><b style="font-size:24px">${esc(k[0])}</b><span>${esc(k[1])}</span></div>`).join('')}</div></section>`;
}

/* ---------- Recarga ---------- */
V.recarga = () => {
  const vids = allowedVids();
  const semana = recargaSemana();
  const order = ['novos', 'ineditos', 'cortes', 'memes', 'curiosidades', 'teorias', 'reacts', 'clipes', 'vazamentos', 'trailers', 'comparacoes', 'longos', 'geral'];
  const cnt = c => S.vids.filter(v => v.cat === c && vidAllowed(v)).length;
  const sample = c => S.vids.find(v => v.cat === c);
  return `
  <section class="hero rv" style="min-height:280px"><img class="bg" src="assets/hero.webp" alt="" style="object-position:center 25%;opacity:.55">
    <div class="in"><span class="kick">${ic('refresh')} Recarga semana ${semana} de ${CFG.RECARGA_SEMANAS}</span>
      <h1 class="h1">Recarga<br><span class="grad">Vice City</span></h1>
      <p class="lead">${fmt(vids.length)} vídeos prontos, separados por categoria. Toque para assistir, baixe e copie a legenda pronta. Lote novo toda semana.</p>
      <div class="row" style="margin-top:14px"><a class="btn btn-p" href="#/biblioteca">${ic('film')}Abrir biblioteca completa</a>${can('agenda') ? `<a class="btn btn-g" href="#/agenda">${ic('cal')}Montar agenda com esses vídeos</a>` : ''}</div></div></section>
  ${!can('acervo') ? `<div class="alert" style="margin-top:16px">${ic('lock')}<span>Seu plano Start libera ${fmt(vids.length)} vídeos. O Completo libera os ${fmt(S.vids.length)} vídeos, a Recarga semanal e os Cortes Inéditos. <a href="${CFG.produtos.completo.checkout}" style="text-decoration:underline;font-weight:800">Fazer upgrade</a></span></div>` : ''}
  <section class="sec"><div class="sec-h"><div><h2 class="h2">Categorias</h2><p>Escolha o que postar hoje.</p></div></div>
  <div class="grid4">${order.filter(c => S.vids.some(v => v.cat === c)).map(c => { const n = cnt(c), s = sample(c), lk = n === 0; return `<a class="catc rv" href="${lk ? '#/recarga' : '#/biblioteca?cat=' + c}" ${lk ? 'style="opacity:.55"' : ''}><img class="bgi" loading="lazy" src="${s ? thumb(s.id, 400) : ''}" alt=""><span class="bar" style="background:${C.cats[c].cor}"></span><span class="n">${C.cats[c].nome}</span><span class="c">${lk ? 'Bloqueado no seu plano' : fmt(n) + ' vídeos'}</span></a>`; }).join('')}</div></section>
  ${order.filter(c => c !== 'geral').map(c => rail(C.cats[c].nome, vids.filter(v => v.cat === c), '#/biblioteca?cat=' + c)).join('')}
  ${rail('Acervo geral', vids.filter(v => v.cat === 'geral'), '#/biblioteca?cat=geral')}`;
};

/* ---------- Biblioteca ---------- */
let LIB = { n: 48 };
V.biblioteca = (qs) => {
  const p = new URLSearchParams(qs);
  LIB = { cat: p.get('cat') || '', tema: p.get('tema') || '', q: p.get('q') || '', so: p.get('so') || '', ord: p.get('ord') || 'rec', n: 48 };
  setTimeout(libRender);
  const cats = ['novos', 'ineditos', 'cortes', 'memes', 'curiosidades', 'teorias', 'reacts', 'clipes', 'vazamentos', 'trailers', 'comparacoes', 'longos', 'geral'].filter(c => S.vids.some(v => v.cat === c && vidAllowed(v)));
  return `
  <div class="sec-h rv"><div><h1 class="h1" style="font-size:clamp(30px,4vw,44px)">Biblioteca</h1><p>Filtre por categoria, tema ou criador. Tudo pronto para baixar.</p></div></div>
  <div class="filters">
    <div class="row" style="margin-bottom:10px"><label class="search" style="display:block;flex:1;max-width:none">${ic('funnel')}<input id="lq" type="search" placeholder="Buscar" value="${esc(LIB.q)}"></label>
      <select class="input" id="lord" style="width:auto;padding:10px 38px 10px 12px;font-size:13.5px"><option value="rec">Mais recentes</option><option value="az">Ordem</option><option value="rand">Aleatório</option></select></div>
    <div class="chips" id="lcats"><button class="chip ${!LIB.cat ? 'on' : ''}" data-cat="">Todos</button>${cats.map(c => `<button class="chip ${LIB.cat === c ? 'on' : ''}" data-cat="${c}"><span class="dot" style="background:${C.cats[c].cor}"></span>${C.cats[c].curto}</button>`).join('')}</div>
    <div class="chips" id="ltemas" style="margin-top:8px"></div>
    <div class="chips" style="margin-top:8px"><button class="chip ${LIB.so === 'nao' ? 'on' : ''}" data-so="nao">${ic('check')}Só não postados</button><button class="chip ${LIB.so === 'fav' ? 'on' : ''}" data-so="fav">★ Favoritos</button><button class="chip ${LIB.so === 'post' ? 'on' : ''}" data-so="post">Já postados</button></div>
  </div>
  <p class="dim" id="lcount" style="margin:16px 0 12px;font-size:13px;font-weight:700"></p>
  <div class="vgrid" id="lgrid"></div>
  <div class="pager"><button class="btn btn-g" id="lmore">Carregar mais</button></div>`;
};
function libFilter() {
  const fav = sets.fav(), posted = sets.posted();
  const q = LIB.q.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  let r = allowedVids().filter(v => (!LIB.cat || v.cat === LIB.cat) && (!LIB.tema || v.tema === LIB.tema) && (!q || v.search.includes(q)) &&
    (LIB.so !== 'nao' || !posted.has(v.id)) && (LIB.so !== 'fav' || fav.has(v.id)) && (LIB.so !== 'post' || posted.has(v.id)));
  if (LIB.ord === 'az') r = r.slice().sort((a, b) => a.title.localeCompare(b.title, 'pt', { numeric: true }));
  if (LIB.ord === 'rand') r = shuffle(r, rng(Date.now() & 0xffff));
  return r;
}
function libRender() {
  const grid = $('#lgrid'); if (!grid) return;
  const r = libFilter();
  $('#lcount').textContent = r.length ? `${fmt(r.length)} vídeos` : '';
  grid.innerHTML = r.length ? r.slice(0, LIB.n).map(vcard).join('') : `<div class="empty" style="grid-column:1/-1">${ic('film')}<p style="margin-top:10px">Nenhum vídeo com esse filtro.</p></div>`;
  $('#lmore').classList.toggle('hide', r.length <= LIB.n);
  const temas = [...new Set(allowedVids().filter(v => (!LIB.cat || v.cat === LIB.cat) && v.tema).map(v => v.tema))];
  $('#ltemas').innerHTML = temas.length ? `<span class="dim" style="font-size:12.5px;font-weight:800;align-self:center;margin-right:4px">TEMA</span><button class="chip ${!LIB.tema ? 'on' : ''}" data-tema="">Todos</button>` + temas.map(t => `<button class="chip ${LIB.tema === t ? 'on' : ''}" data-tema="${t}">${C.temas[t] || t}</button>`).join('') : '';
  $('#lord').value = LIB.ord;
  bindCards(grid);
}
function bindLib() {
  const f = $('.filters'); if (!f) return;
  f.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.cat !== undefined) { LIB.cat = b.dataset.cat; LIB.tema = ''; $$('#lcats .chip').forEach(x => x.classList.toggle('on', x === b)); }
    else if (b.dataset.tema !== undefined) LIB.tema = b.dataset.tema;
    else if (b.dataset.so !== undefined) { LIB.so = LIB.so === b.dataset.so ? '' : b.dataset.so; $$('[data-so]').forEach(x => x.classList.toggle('on', x.dataset.so === LIB.so)); }
    LIB.n = 48; libRender();
  };
  let t; $('#lq').oninput = e => { clearTimeout(t); t = setTimeout(() => { LIB.q = e.target.value; LIB.n = 48; libRender(); }, 180); };
  $('#lord').onchange = e => { LIB.ord = e.target.value; libRender(); };
  $('#lmore').onclick = () => { LIB.n += 48; libRender(); };
}

/* ---------- Inéditos ---------- */
V.ineditos = () => {
  if (!can('ineditos')) return lockCard('ineditos', 'Os Cortes Inéditos são produzidos pelo nosso time e fazem parte do plano Completo.');
  const vids = S.vids.filter(v => v.cat === 'ineditos');
  return `<section class="hero art-sunset rv"><span class="sun"></span><div class="in"><span class="kick">${ic('gem')} Exclusivo</span><h1 class="h1">Cortes<br><span class="grad">Inéditos</span></h1><p class="lead">Cortes de streamers brasileiros feitos pelo nosso time. Você não encontra em nenhum outro pack, então chega antes de todo mundo.</p></div></section>
  <div class="sec-h sec"><div><h2 class="h2">Disponíveis agora</h2><p>Novos cortes entram toda semana junto com a Recarga.</p></div></div>
  <div class="vgrid">${vids.map(vcard).join('')}</div>`;
};

/* ---------- Imagens ---------- */
let IMGN = 60;
V.imagens = () => {
  IMGN = 60;
  setTimeout(imgRender);
  return `<div class="sec-h rv"><div><h1 class="h1" style="font-size:clamp(30px,4vw,44px)">Imagens</h1><p>${fmt(S.imgs.length)} posts em imagem para feed, stories e carrossel. Baixe no tamanho original.</p></div></div>
  <div class="vgrid" id="igrid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))"></div><div class="pager"><button class="btn btn-g" id="imore">Carregar mais</button></div>`;
};
function imgRender() {
  const g = $('#igrid'); if (!g) return;
  g.innerHTML = S.imgs.slice(0, IMGN).map(([id, n]) => `<article class="vc"><div class="th" style="aspect-ratio:4/5" data-img="${id}"><img loading="lazy" src="${thumb(id, 400)}" alt=""></div><div class="bd" style="padding:9px"><div class="row"><span class="tt" style="min-height:0;font-size:12.5px">${esc(n)}</span><span class="sp"></span><a class="btn btn-p btn-xs" href="${dl(id)}" target="_blank" rel="noopener">Baixar</a></div></div></article>`).join('');
  $('#imore').classList.toggle('hide', IMGN >= S.imgs.length);
  $('#imore').onclick = () => { IMGN += 60; imgRender(); };
  g.onclick = e => { const t = e.target.closest('[data-img]'); if (t) openModal(`<div class="mhead"><b>Imagem</b><button class="x" onclick="document.getElementById('modal').click()">${ic('x')}</button></div><div class="mbody" style="text-align:center"><img src="${thumb(t.dataset.img, 1200)}" alt="" style="margin:0 auto;max-height:70vh;border-radius:14px"><a class="btn btn-p" style="margin-top:14px" href="${dl(t.dataset.img)}" target="_blank" rel="noopener">Baixar original</a></div>`); };
}

/* ---------- Plano de Golpe (quiz) ---------- */
let QZ = { i: 0, a: {} };
V.plano = (qs, sub) => {
  const salvo = load('plano', null);
  if (sub === 'ver' && salvo) return planoView(salvo);
  if (sub !== 'refazer' && salvo && !QZ.started) return planoView(salvo);
  QZ.started = true;
  const q = C.quiz[QZ.i];
  const sel = QZ.a[q.id] || (q.tipo === 'varios' ? [] : '');
  return `<div class="quiz">
    <span class="kick">${ic('rocket')} Plano de Golpe · ${QZ.i + 1} de ${C.quiz.length}</span>
    <div class="qsteps">${C.quiz.map((_, i) => `<i class="${i <= QZ.i ? 'on' : ''}"></i>`).join('')}</div>
    <h1 class="h1" style="font-size:clamp(28px,4.4vw,46px)">${q.q}</h1>${q.sub ? `<p class="mut" style="margin-top:6px">${q.sub}</p>` : ''}
    <div id="qops" style="margin-top:14px">${q.ops.map(([k, t, d]) => { const on = q.tipo === 'varios' ? sel.includes(k) : sel === k; return `<button class="qop ${on ? 'on' : ''}" data-k="${k}"><span class="ck"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-10"/></svg></span><span><b>${t}</b>${d ? `<small>${d}</small>` : ''}</span></button>`; }).join('')}</div>
    <div class="row" style="margin-top:24px">${QZ.i > 0 ? `<button class="btn btn-g" id="qback">Voltar</button>` : ''}<span class="sp"></span><button class="btn btn-p" id="qnext" ${(q.tipo === 'varios' ? sel.length : sel) ? '' : 'disabled'}>${QZ.i === C.quiz.length - 1 ? 'Gerar meu plano' : 'Continuar'}</button></div>
  </div>`;
};
function bindQuiz() {
  const box = $('#qops'); if (!box) return;
  const q = C.quiz[QZ.i];
  box.onclick = e => {
    const b = e.target.closest('.qop'); if (!b) return;
    if (q.tipo === 'varios') { const s = new Set(QZ.a[q.id] || []); s.has(b.dataset.k) ? s.delete(b.dataset.k) : s.add(b.dataset.k); QZ.a[q.id] = [...s]; b.classList.toggle('on'); $('#qnext').disabled = !s.size; }
    else { QZ.a[q.id] = b.dataset.k; $$('.qop', box).forEach(x => x.classList.toggle('on', x === b)); $('#qnext').disabled = false; setTimeout(() => $('#qnext').click(), 220); }
  };
  $('#qnext').onclick = () => {
    if (QZ.i < C.quiz.length - 1) { QZ.i++; route(true); return; }
    save('plano', { ...QZ.a, em: Date.now() }); QZ = { i: 0, a: {} }; refreshStars(); location.hash = '#/plano/ver';
  };
  const bk = $('#qback'); if (bk) bk.onclick = () => { QZ.i--; route(true); };
}
function gerarPlano(p) {
  const plats = p.plats || ['tiktok'];
  const ppd = { 15: 1, 30: 2, 60: 3 }[p.tempo] || 2;
  const nomeObj = { grana: 'Grana Rápida', monetizar: 'Monetização Acelerada', servico: 'Editor de Elite', testar: 'Teste Sem Pressão' }[p.objetivo] || 'Plano Vice City';
  const prio = p.objetivo === 'monetizar' ? (plats.includes('tiktok') ? 'tiktok' : plats[0]) : plats[0];
  const rotas = { grana: ['clipping', 'servico', 'afiliado'], monetizar: ['tiktok', 'youtube', 'kwai'], servico: ['servico', 'clipping', 'proprio'], testar: ['clipping', 'afiliado', 'kwai'] }[p.objetivo] || ['clipping'];
  const mix = p.objetivo === 'servico' ? 'Cortes, reacts e streamers (portfólio)' : p.objetivo === 'monetizar' ? 'Cortes, curiosidades e vídeos longos (retenção)' : 'Memes, cortes e novidades (alcance)';
  const total = ppd * plats.length;
  return {
    nome: 'Golpe ' + nomeObj,
    resumo: `${plats.map(x => C.plats[x].nome).join(', ')} · ${ppd} post${ppd > 1 ? 's' : ''} por dia em cada rede · foco em ${C.plats[prio].nome}.`,
    kpis: [[String(total), 'posts por dia no total'], [String(total * 30), 'posts no primeiro mês'], [C.plats[prio].nome.replace('Instagram ', '').replace('YouTube ', ''), 'rede prioridade']],
    plats, ppd, prio, rotas, mix,
    voz: { nao: 'Use o gancho como texto grande na tela, nos 3 primeiros segundos. Legenda própria em cada post.', voz: 'Narre por cima do corte com a fórmula "Eu fazia X, testei Y, olha a diferença em Z". Isso deixa o vídeo original para as plataformas.', rosto: 'Grave seu rosto reagindo no canto do vídeo (react). É o formato que mais cresce e conta como conteúdo original.' }[p.voz],
    fase: { zero: 'Crie o perfil hoje com o Canal do Zero (nome, bio, logo) e poste os 3 primeiros vídeos antes de dormir.', parado: 'Troque nome, foto e bio para o nicho GTA 6 com o Canal do Zero e arquive posts fora do nicho.', ativo: 'Mantenha o ritmo e teste 2 ganchos diferentes por dia. Dobre o que passar da média.' }[p.fase]
  };
}
function planoView(p) {
  const pl = gerarPlano(p);
  const semanas = [
    ['Dia 1', 'Base', [pl.fase, 'Gere sua agenda com o plano e baixe os vídeos da primeira semana.', 'Configure o agendador gratuito de cada rede.']],
    ['Dias 2 a 7', 'Constância', [`Poste ${pl.ppd}x por dia em ${pl.plats.length > 1 ? 'cada rede' : C.plats[pl.prio].nome}, nos horários da agenda.`, pl.voz, 'Responda todo comentário na primeira hora. Isso empurra o vídeo.']],
    ['Semana 2', 'Ajuste', ['Veja quais 3 vídeos passaram da média e poste mais da mesma categoria.', 'Teste ganchos novos do Kit Remix nos vídeos fracos.', `Ative a primeira fonte de renda: ${C.rotas.find(r => r.id === pl.rotas[0]).nome}.`]],
    ['Semanas 3 e 4', 'Escala', ['Repita o formato vencedor e suba para +1 post por dia se der.', `Abra a segunda fonte de renda: ${C.rotas.find(r => r.id === pl.rotas[1]).nome}.`, 'Gere a agenda do próximo mês e mantenha a Recarga semanal no ar.']]
  ];
  return `<section class="hero art-sunset rv"><span class="sun"></span><div class="in"><span class="kick">${ic('rocket')} Seu Plano de Golpe</span><h1 class="h1">${esc(pl.nome)}</h1><p class="lead">${esc(pl.resumo)}</p>
  <div class="row" style="margin-top:14px"><a class="btn btn-p" href="#/agenda?plano=1">${ic('cal')}Gerar minha agenda com este plano</a><a class="btn btn-g" href="#/plano/refazer">Refazer</a></div></div></section>
  <div class="grid3 sec" style="margin-top:18px">${pl.kpis.map(k => `<div class="statc rv"><b class="grad">${esc(k[0])}</b><span>${esc(k[1])}</span></div>`).join('')}</div>
  <section class="grid2 sec">
    <div class="card rv"><h3 class="h3">O roteiro do golpe</h3><div style="margin-top:8px">${semanas.map(([d, t, li]) => `<div class="plan-step"><div class="d">${d}<br><span class="script" style="font-size:16px;text-transform:none">${t}</span></div><ul class="ul">${li.map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}</ul></div>`).join('')}</div></div>
    <div style="display:grid;gap:16px;align-content:start">
      <div class="card rv"><h3 class="h3">O que postar</h3><p class="mut" style="margin-top:8px">${esc(pl.mix)}.</p><div class="row" style="margin-top:12px">${pl.plats.map(x => `<span class="pill" style="color:${C.plats[x].cor}">${C.plats[x].nome}</span>`).join('')}</div><p class="mut" style="margin-top:12px;font-size:13.5px">${esc(C.plats[pl.prio].tamanho)}.</p></div>
      <div class="card rv"><h3 class="h3">Como fazer dinheiro, na ordem</h3><div style="display:grid;gap:10px;margin-top:12px">${pl.rotas.map((id, i) => { const r = C.rotas.find(x => x.id === id); return `<a class="next" href="#/grana#${id}"><span class="num" style="color:${r.cor}">${i + 1}</span><span><b style="display:block">${r.nome}</b><span class="mut" style="font-size:13px">${r.quando} · ${r.seguidores}</span></span></a>`; }).join('')}</div><p class="note">Nenhuma plataforma garante ganhos. O plano mostra o caminho mais curto; os resultados dependem da sua constância.</p></div>
    </div>
  </section>`;
}

/* ---------- Gerador Agenda Vice ---------- */
let AG = null;
V.agenda = (qs) => {
  if (!can('agenda')) return lockCard('agenda', 'O Gerador Agenda Vice faz parte do plano Completo.');
  const p = new URLSearchParams(qs);
  const plano = load('plano', null);
  const salvo = load('agenda', null);
  AG = salvo && !p.get('plano') ? salvo.cfg : agDefault(plano);
  if (p.get('plano') && plano) AG = agDefault(plano);
  setTimeout(() => { if (salvo && !p.get('plano')) agShow(salvo); });
  return `
  <section class="hero rv" style="min-height:240px;background:radial-gradient(120% 140% at 90% 0%,#22d3c5 0%,#2b6f9e 25%,#3a1e6b 55%,#1a0b2e 85%)"><div class="in"><span class="kick">${ic('cal')} Bônus 1</span><h1 class="h1">Gerador<br><span class="grad">Agenda Vice</span></h1><p class="lead">Escolha as redes e o ritmo. O gerador monta seus 30 dias com vídeos reais do acervo, horário, gancho, legenda e hashtags. Não gostou? Gera de novo.</p></div></section>
  <section class="card sec rv" id="agform">
    <div class="row"><h2 class="h3">1. Onde você vai postar</h2><span class="sp"></span>${plano ? `<button class="btn btn-g btn-xs" id="agplano">${ic('rocket')}Usar meu Plano de Golpe</button>` : ''}</div>
    <div class="plat-sel" style="margin-top:12px">${Object.entries(C.plats).map(([k, pl]) => { const n = AG.plats[k] || 0; return `<div class="plat-b ${n ? 'on' : ''}" style="--pc:${pl.cor}" data-pk="${k}"><button style="text-align:left;width:100%" data-pt="${k}"><b><span class="dt"></span>${pl.nome}</b></button><div class="stepper ${n ? '' : 'hide'}"><button data-pm="${k}">−</button><span>${n}/dia</span><button data-pp="${k}">+</button></div></div>`; }).join('')}</div>
    <div class="ag-form" style="margin-top:22px">
      <div><h2 class="h3">2. Quando</h2>
        <label class="field"><span>Começar em</span><input class="input" type="date" id="agini" value="${AG.ini}"></label>
        <div class="field"><span>Dias da semana</span><div class="row">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => `<button class="chip ${AG.dias.includes(i) ? 'on' : ''}" data-dia="${i}" style="width:42px;justify-content:center;padding:8px 0">${d}</button>`).join('')}</div></div>
        <label class="chk" style="margin-top:14px"><input type="checkbox" id="agcross" ${AG.cross ? 'checked' : ''}><span><b>Mesmo vídeo em todas as redes</b><span>Posta o mesmo corte em todas as redes do dia. Desmarcado, cada rede recebe vídeos diferentes.</span></span></label>
      </div>
      <div><h2 class="h3">3. O que postar</h2>
        <div class="field"><span>Mistura de categorias</span><div class="row" id="agmix">${Object.keys(AG.mix).map(c => `<button class="chip ${AG.mix[c] ? 'on' : ''}" data-mx="${c}"><span class="dot" style="background:${C.cats[c].cor}"></span>${C.cats[c].curto}</button>`).join('')}</div></div>
        <label class="chk" style="margin-top:14px"><input type="checkbox" id="aglongo" ${AG.longo ? 'checked' : ''}><span><b>Priorizar vídeos longos no TikTok</b><span>O Programa de Recompensas do TikTok só conta vídeos com 1 minuto ou mais.</span></span></label>
        <label class="chk"><input type="checkbox" id="agnovo" ${AG.novos ? 'checked' : ''}><span><b>Pular vídeos que já postei</b><span>Usa só o que você ainda não marcou como postado.</span></span></label>
      </div>
    </div>
    <div class="row" style="margin-top:22px"><span class="dim" id="agsum" style="font-size:13.5px;font-weight:700"></span><span class="sp"></span><button class="btn btn-p" id="aggo">${ic('wand')}Gerar meu mês</button></div>
  </section>
  <section id="agout"></section>`;
};
function agDefault(plano) {
  const d = new Date(); const iso = d.toISOString().slice(0, 10);
  const plats = {};
  if (plano) { const pl = gerarPlano(plano); pl.plats.forEach(k => plats[k] = Math.min(pl.ppd, C.plats[k].max)); }
  else { plats.tiktok = 2; plats.reels = 2; plats.shorts = 2; }
  const mix = { novos: 1, cortes: 1, memes: 1, curiosidades: 1, teorias: 1, reacts: 1, clipes: 1, vazamentos: 1, trailers: 0, comparacoes: 0, longos: 0, geral: 1, ineditos: 1 };
  if (plano?.objetivo === 'servico') { mix.memes = 0; mix.vazamentos = 0; }
  return { plats, ini: iso, dias: [0, 1, 2, 3, 4, 5, 6], cross: true, mix, longo: !!plats.tiktok, novos: true, seed: Date.now() & 0xffffff };
}
function bindAgenda() {
  const f = $('#agform'); if (!f) return;
  const sum = () => {
    const per = Object.values(AG.plats).reduce((a, b) => a + b, 0);
    const vpd = AG.cross ? Math.max(0, ...Object.values(AG.plats)) : per;
    $('#agsum').textContent = per ? `${per} posts por dia · ${vpd} vídeos por dia · ${AG.dias.length} dias por semana` : 'Escolha pelo menos uma rede';
    $('#aggo').disabled = !per;
  };
  f.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.pt) { const k = b.dataset.pt; AG.plats[k] = AG.plats[k] ? 0 : Math.min(2, C.plats[k].max); }
    if (b.dataset.pm) AG.plats[b.dataset.pm] = Math.max(0, (AG.plats[b.dataset.pm] || 0) - 1);
    if (b.dataset.pp) AG.plats[b.dataset.pp] = Math.min(C.plats[b.dataset.pp].max, (AG.plats[b.dataset.pp] || 0) + 1);
    if (b.dataset.dia) { const d = +b.dataset.dia; AG.dias = AG.dias.includes(d) ? AG.dias.filter(x => x !== d) : [...AG.dias, d]; b.classList.toggle('on'); }
    if (b.dataset.mx) { AG.mix[b.dataset.mx] = AG.mix[b.dataset.mx] ? 0 : 1; b.classList.toggle('on'); }
    if (b.dataset.pt || b.dataset.pm || b.dataset.pp) {
      $$('.plat-b', f).forEach(el => { const k = el.dataset.pk, n = AG.plats[k] || 0; el.classList.toggle('on', !!n); const st = $('.stepper', el); st.classList.toggle('hide', !n); $('span', st).textContent = n + '/dia'; });
    }
    if (b.id === 'agplano') { AG = agDefault(load('plano', null)); route(true); return; }
    sum();
  };
  $('#agini').onchange = e => AG.ini = e.target.value;
  $('#agcross').onchange = e => { AG.cross = e.target.checked; sum(); };
  $('#aglongo').onchange = e => AG.longo = e.target.checked;
  $('#agnovo').onchange = e => AG.novos = e.target.checked;
  $('#aggo').onclick = () => { AG.seed = (Math.random() * 1e9) >>> 0; const ag = agGerar(AG); save('agenda', ag); refreshStars(); agShow(ag); $('#agout').scrollIntoView({ behavior: 'smooth' }); toast('Agenda do mês gerada'); };
  sum();
}
function agGerar(cfg) {
  const r = rng(cfg.seed);
  const posted = sets.posted();
  const cats = Object.keys(cfg.mix).filter(c => cfg.mix[c]);
  let pool = allowedVids().filter(v => cats.includes(v.cat) && (!cfg.novos || !posted.has(v.id)));
  if (!pool.length) pool = allowedVids();
  const byCat = {}; pool.forEach(v => (byCat[v.cat] = byCat[v.cat] || []).push(v));
  Object.keys(byCat).forEach(c => byCat[c] = shuffle(byCat[c], r));
  const longos = shuffle(allowedVids().filter(v => v.cat === 'longos' && (!cfg.novos || !posted.has(v.id))), r);
  const weights = { novos: 3, ineditos: 2, cortes: 3, memes: 3, curiosidades: 2, teorias: 1, reacts: 1, clipes: 1, vazamentos: 1, trailers: 1, comparacoes: 1, longos: 1, geral: 2 };
  const wl = []; cats.filter(c => byCat[c]).forEach(c => { for (let i = 0; i < (weights[c] || 1); i++) wl.push(c); });
  const used = new Set();
  const take = (pref) => {
    for (let tries = 0; tries < 30; tries++) {
      const c = pref || pick(wl, r); const arr = byCat[c]; if (!arr) { pref = null; continue; }
      while (arr.length) { const v = arr.pop(); if (!used.has(v.id)) { used.add(v.id); return v; } }
      pref = null;
    }
    const rest = pool.find(v => !used.has(v.id)); if (rest) { used.add(rest.id); return rest; }
    return pick(pool, r);
  };
  const plats = Object.entries(cfg.plats).filter(([, n]) => n > 0);
  const start = new Date(cfg.ini + 'T12:00:00');
  const days = [];
  for (let d = 0; d < 30; d++) {
    const dt = new Date(start); dt.setDate(start.getDate() + d);
    const iso = dt.toISOString().slice(0, 10);
    if (!cfg.dias.includes(dt.getDay())) { days.push({ iso, off: true, posts: [] }); continue; }
    const posts = [];
    if (cfg.cross) {
      const n = Math.max(...plats.map(([, n]) => n));
      for (let i = 0; i < n; i++) {
        const wantsLong = cfg.longo && cfg.plats.tiktok > i && i === 0 && longos.length;
        const v = wantsLong ? (() => { const x = longos.pop(); used.add(x.id); return x; })() : take();
        plats.forEach(([p, cnt]) => { if (i < cnt) posts.push(mkPost(v, p, C.plats[p].horas[i], d, i)); });
      }
    } else {
      plats.forEach(([p, cnt]) => { for (let i = 0; i < cnt; i++) { const v = (p === 'tiktok' && cfg.longo && i === 0 && longos.length) ? (() => { const x = longos.pop(); used.add(x.id); return x; })() : take(); posts.push(mkPost(v, p, C.plats[p].horas[i], d, i)); } });
    }
    posts.sort((a, b) => a.h.localeCompare(b.h));
    days.push({ iso, posts });
  }
  return { cfg: { ...cfg }, days, criado: Date.now() };
  function mkPost(v, p, h, d, i) { const l = legenda(v, p, cfg.seed + d * 7 + i); return { id: v.id, p, h, g: l.gancho, t: l.titulo, l: l.texto }; }
}
function agendaProgresso(ag) { const all = ag.days.flatMap(d => d.posts); if (!all.length) return 0; const ok = load('agdone', {}); return Math.round(all.filter((x, i) => ok[agKey(x)]).length / all.length * 100); }
const agKey = x => x.id + '|' + x.p + '|' + x.h;
function agShow(ag) {
  const out = $('#agout'); if (!out) return;
  const ok = load('agdone', {});
  const plats = [...new Set(ag.days.flatMap(d => d.posts.map(p => p.p)))];
  const total = ag.days.reduce((a, d) => a + d.posts.length, 0);
  const vids = new Set(ag.days.flatMap(d => d.posts.map(p => p.id))).size;
  const today = new Date().toISOString().slice(0, 10);
  const first = new Date(ag.days[0].iso + 'T12:00:00').getDay();
  const mes = new Date(ag.days[0].iso + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  out.innerHTML = `
  <div class="sec-h sec"><div><h2 class="h2">Seus 30 dias</h2><p>${fmt(total)} posts · ${fmt(vids)} vídeos diferentes · a partir de ${mes}</p></div>
    <div class="row"><button class="btn btn-g btn-s" id="agre">${ic('refresh')}Gerar de novo</button><button class="btn btn-g btn-s" id="agics">${ic('cal')}Adicionar ao Google Agenda</button><button class="btn btn-g btn-s" id="agcsv">${ic('note')}Planilha</button></div></div>
  <div class="card rv"><div class="row"><div class="legend">${plats.map(p => `<span><i style="background:${C.plats[p].cor}"></i>${C.plats[p].nome}</span>`).join('')}</div><span class="sp"></span><span class="dim" style="font-size:13px;font-weight:700">${agendaProgresso(ag)}% concluído</span></div>
    <div class="prog" style="margin:12px 0 16px"><i style="width:${agendaProgresso(ag)}%"></i></div>
    <div class="cal">${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => `<div class="wd">${d}</div>`).join('')}${'<div></div>'.repeat(first)}${ag.days.map((d, i) => { const dt = new Date(d.iso + 'T12:00:00'); const okc = d.posts.filter(p => ok[agKey(p)]).length; return `<button class="day ${d.off ? 'off' : ''} ${d.iso === today ? 'today' : ''}" data-day="${i}"><span class="dn">${dt.getDate()}${d.posts.length ? `<small>${okc}/${d.posts.length}</small>` : ''}</span>${d.posts.slice(0, 4).map(p => `<span class="slot ${ok[agKey(p)] ? 'ok' : ''}"><i style="background:${C.plats[p.p].cor}"></i>${p.h}</span>`).join('')}${d.posts.length > 4 ? `<span class="dim" style="font-size:11px;font-weight:700">+${d.posts.length - 4}</span>` : ''}</button>`; }).join('')}</div>
    <div class="daylist" id="aglist"></div>
  </div>
  <div class="alert sec" style="margin-top:16px">${ic('clock')}<span>Use o agendador gratuito de cada rede (Meta Business Suite para Reels e Facebook, TikTok Studio e YouTube Studio) e agende a semana inteira de uma vez. Os horários são uma sugestão de pico; ajuste pelo painel de cada rede depois de 2 semanas.</span></div>`;
  // lista no celular: próximos 7 dias
  if (matchMedia('(max-width:560px)').matches) {
    const idx = Math.max(0, ag.days.findIndex(d => d.iso >= today));
    $('#aglist').innerHTML = ag.days.slice(idx, idx + 7).map((d, k) => dayBlock(d, idx + k, ok)).join('') + `<button class="btn btn-g" id="agall" style="width:100%">Ver os 30 dias</button>`;
    const all = $('#agall'); if (all) all.onclick = () => { $('#aglist').innerHTML = ag.days.map((d, k) => dayBlock(d, k, ok)).join(''); };
  }
  out.onclick = e => {
    const b = e.target.closest('button,[data-open]'); if (!b) return;
    if (b.dataset.day !== undefined) return openDay(ag, +b.dataset.day);
    if (b.id === 'agre') { const cfg = { ...ag.cfg, seed: (Math.random() * 1e9) >>> 0 }; const n = agGerar(cfg); save('agenda', n); agShow(n); toast('Novo mês gerado'); return; }
    if (b.id === 'agics') return exportIcs(ag);
    if (b.id === 'agcsv') return exportCsv(ag);
    agPostAction(b, ag);
  };
  reveal();
}
function dayBlock(d, i, ok) {
  const dt = new Date(d.iso + 'T12:00:00');
  return `<div style="margin-top:14px"><div class="row" style="margin-bottom:8px"><b class="disp" style="font-size:18px">${dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</b></div>${d.off ? '<p class="dim" style="font-size:13px">Folga</p>' : d.posts.map(p => postRow(p, ok)).join('')}</div>`;
}
function postRow(p, ok) {
  const v = S.byId[p.id]; const done = ok[agKey(p)];
  return `<div class="dpost ${done ? 'ok' : ''}" style="margin-top:8px"><div class="th" data-open="${p.id}"><img loading="lazy" src="${thumb(p.id, 300)}" alt=""></div><div style="min-width:0">
    <div class="row"><span class="pill" style="color:${C.plats[p.p].cor}">${C.plats[p.p].nome}</span><b>${p.h}</b></div>
    <p style="font-weight:750;font-size:13.5px;margin-top:6px;line-height:1.3">${esc(p.t)}</p><p class="dim" style="font-size:12px;margin-top:2px">${esc(v?.title || '')}</p>
    <div class="row" style="margin-top:8px"><a class="btn btn-p btn-xs" href="${dl(p.id)}" target="_blank" rel="noopener">Baixar</a><button class="btn btn-g btn-xs" data-cl="${esc(p.l)}">Copiar legenda</button><button class="btn btn-g btn-xs" data-ok="${esc(agKey(p))}" data-vid="${p.id}">${done ? 'Feito ✓' : 'Marcar feito'}</button><button class="btn btn-g btn-xs" data-sw="${esc(agKey(p))}">Trocar vídeo</button></div></div></div>`;
}
function agPostAction(b, ag) {
  if (b.dataset.open) return openVideo(b.dataset.open);
  if (b.dataset.cl) return copy(b.dataset.cl, 'Legenda copiada');
  if (b.dataset.ok) {
    const ok = load('agdone', {}); ok[b.dataset.ok] = !ok[b.dataset.ok]; save('agdone', ok);
    if (ok[b.dataset.ok]) { const s = new Set(load('posted', [])); s.add(b.dataset.vid); save('posted', [...s]); }
    refreshStars(); agShow(ag); if ($('#modal').classList.contains('on')) openDay(ag, +$('#mbox').dataset.day); return;
  }
  if (b.dataset.sw) {
    const used = new Set(ag.days.flatMap(d => d.posts.map(p => p.id)));
    const posted = sets.posted();
    for (const d of ag.days) for (const p of d.posts) if (agKey(p) === b.dataset.sw) {
      const cand = allowedVids().filter(v => !used.has(v.id) && !posted.has(v.id) && (ag.cfg.mix[v.cat]));
      const v = pick(cand.length ? cand : allowedVids(), rng(Date.now() & 0xffffff));
      const l = legenda(v, p.p, Date.now() & 0xffff);
      Object.assign(p, { id: v.id, g: l.gancho, t: l.titulo, l: l.texto });
    }
    save('agenda', ag); agShow(ag); if ($('#modal').classList.contains('on')) openDay(ag, +$('#mbox').dataset.day); toast('Vídeo trocado');
  }
}
function openDay(ag, i) {
  const d = ag.days[i]; if (d.off) return;
  const ok = load('agdone', {});
  const dt = new Date(d.iso + 'T12:00:00');
  openModal(`<div class="mhead"><b class="disp" style="font-size:20px">${dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</b><button class="x" data-x>${ic('x')}</button></div><div class="mbody">${d.posts.map(p => postRow(p, ok)).join('')}</div>`);
  $('#mbox').dataset.day = i;
  $('#mbox').onclick = e => { const b = e.target.closest('button,[data-open]'); if (!b) return; if (b.dataset.x !== undefined) return closeModal(); agPostAction(b, ag); };
}
function exportIcs(ag) {
  const pad = n => String(n).padStart(2, '0');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Canal Vice City//Agenda Vice//PT'];
  ag.days.forEach(d => d.posts.forEach((p, k) => {
    const [y, m, dd] = d.iso.split('-'); const [hh, mm] = p.h.split(':');
    const st = `${y}${m}${dd}T${hh}${mm}00`; const en = `${y}${m}${dd}T${hh}${pad((+mm + 15) % 60)}00`.replace(/T(\d\d)(\d\d)00$/, (x, H, M) => `T${+mm + 15 >= 60 ? pad(+H + 1) : H}${M}00`);
    const desc = `${p.l}\\n\\nBaixar: ${dl(p.id)}`.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    lines.push('BEGIN:VEVENT', `UID:${d.iso}-${k}-${p.p}@canalvicecity`, `DTSTART:${st}`, `DTEND:${en}`, `SUMMARY:${C.plats[p.p].nome}: ${p.t.replace(/[,;]/g, ' ')}`, `DESCRIPTION:${desc}`, 'END:VEVENT');
  }));
  lines.push('END:VCALENDAR');
  baixar(lines.join('\r\n'), 'agenda-vice.ics', 'text/calendar');
  toast('Arquivo da agenda baixado');
}
function exportCsv(ag) {
  const q = s => '"' + String(s).replace(/"/g, '""') + '"';
  const rows = [['Data', 'Horário', 'Rede', 'Vídeo', 'Título', 'Legenda', 'Link para baixar'].map(q).join(';')];
  ag.days.forEach(d => d.posts.forEach(p => rows.push([d.iso.split('-').reverse().join('/'), p.h, C.plats[p.p].nome, S.byId[p.id]?.title || '', p.t, p.l, dl(p.id)].map(q).join(';'))));
  baixar('\uFEFF' + rows.join('\r\n'), 'agenda-vice.csv', 'text/csv');
}
function baixar(txt, nome, tipo) { const u = URL.createObjectURL(new Blob([txt], { type: tipo + ';charset=utf-8' })); const a = document.createElement('a'); a.href = u; a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1500); }

/* ---------- Bônus (hub no celular) ---------- */
V.bonus = () => {
  const items = [['plano', 'Plano de Golpe', 'rocket', null, '#ff2d7a'], ['agenda', 'Gerador Agenda Vice', 'cal', 'agenda', '#22d3c5'], ['canal', 'Canal do Zero', 'user', 'canal', '#ffc861'], ['grana', 'Mapa da Grana', 'coin', 'grana', '#4ade80'], ['remix', 'Kit Remix', 'wand', 'remix', '#a78bfa'], ['ferramentas', 'Ferramentas', 'bolt', 'ferramentas', '#38bdf8'], ['estrutura', 'Estrutura de Vendas', 'funnel', 'estrutura', '#ff8a3d'], ['ineditos', 'Cortes Inéditos', 'gem', 'ineditos', '#ffc861'], ['imagens', 'Imagens', 'card', null, '#f472b6'], ['extra/capas', 'Kit Capas', 'tag', 'capas', '#fb7185'], ['extra/carrossel', 'Pack Carrossel', 'note', 'carrossel', '#facc15'], ['extra/piloto', 'Piloto Automático', 'play', 'piloto_lite', '#c084fc']];
  return `<h1 class="h1" style="font-size:36px">Bônus e extras</h1><div class="grid2" style="margin-top:16px">${items.map(([r, n, i, k, c]) => `<a class="modc rv ${!k || can(k) ? '' : 'lock'}" href="#/${r}" style="min-height:110px;background:linear-gradient(160deg,color-mix(in srgb,${c} 22%,#24133f),#170c2c)">${!k || can(k) ? '' : `<span class="lockb">${ic('lock')} Bloqueado</span>`}<span class="ico" style="color:${c}">${ic(i)}</span><span class="n">${n}</span></a>`).join('')}</div>`;
};

/* ---------- Conta ---------- */
V.conta = () => {
  const comprados = Object.entries(CFG.produtos).filter(([, p]) => p.libera.every(x => can(x)));
  return `<h1 class="h1" style="font-size:36px">Sua conta</h1>
  <div class="card sec rv" style="margin-top:16px"><div class="row"><span class="av" style="width:48px;height:48px;font-size:18px">${esc(S.user.email[0].toUpperCase())}</span><div><b>${esc(S.user.email)}</b><div class="dim" style="font-size:13px">Nível ${wantedLevel()} de 5</div></div></div></div>
  <div class="card sec rv"><h3 class="h3">Seus produtos</h3><div style="display:grid;gap:8px;margin-top:12px">${Object.entries(CFG.produtos).map(([k, p]) => { const ok = p.libera.every(x => can(x)); return `<div class="row" style="padding:12px;border-radius:12px;background:rgba(255,255,255,.04)"><span>${ok ? ic('check') : ic('lock')}</span><b>${esc(p.nome)}</b><span class="sp"></span>${ok ? '<span class="pill" style="color:var(--aqua)">Liberado</span>' : `<a class="btn btn-g btn-xs" href="${p.checkout}" target="_blank" rel="noopener">${esc(p.preco)}</a>`}</div>`; }).join('')}</div></div>
  <div class="grid2 sec"><a class="btn btn-g" href="${CFG.SUPORTE_WHATSAPP}" target="_blank" rel="noopener">${ic('chat')}Suporte no WhatsApp</a><button class="btn btn-g" id="sair2">Sair da conta</button></div>`;
};

/* ---------- Módulos de bônus (carregados de bonus.js) ---------- */
V.canal = (...a) => window.BONUS?.canal ? (can('canal') ? window.BONUS.canal(...a) : lockCard('canal')) : '';
V.grana = (...a) => window.BONUS?.grana ? (can('grana') ? window.BONUS.grana(...a) : lockCard('grana')) : '';
V.remix = (...a) => window.BONUS?.remix ? (can('remix') ? window.BONUS.remix(...a) : lockCard('remix')) : '';
V.ferramentas = (...a) => window.BONUS?.ferramentas ? (can('ferramentas') ? window.BONUS.ferramentas(...a) : lockCard('ferramentas')) : '';
V.estrutura = (...a) => window.BONUS?.estrutura ? window.BONUS.estrutura(...a) : '';
V.extra = (qs, sub) => window.BONUS?.extra ? window.BONUS.extra(qs, sub) : '';

/* =====================================================================
   ROTEADOR
   ===================================================================== */
let lastRoute = '';
function route(keepScroll) {
  const parts = location.hash.slice(1).split('#');
  const h = parts[0].replace(/^\/?/, '') || 'qg';
  const anchorId = parts[1];
  const [path, qs = ''] = h.split('?');
  const [name, sub] = path.split('/');
  const fn = V[name] || V.qg;
  const view = $('#view'); if (!view) return;
  const y = scrollY;
  view.innerHTML = fn(qs, sub) || '';
  $$('[data-r]').forEach(a => { const r = a.dataset.r; a.classList.toggle('on', r === name || r === path || (r === 'bonus' && ['canal', 'grana', 'remix', 'ferramentas', 'estrutura', 'plano', 'extra', 'ineditos', 'imagens', 'bonus'].includes(name))); });
  bindCards(view); bindRails(); bindLib(); bindQuiz(); bindAgenda();
  window.BONUS?.bind?.(name, sub, qs);
  const s2 = $('#sair2'); if (s2) s2.onclick = logout;
  if (keepScroll === true) scrollTo(0, y); else if (anchorId) setTimeout(() => document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth' }), 80); else if (h !== lastRoute) scrollTo(0, 0);
  lastRoute = h;
  reveal();
}

/* =====================================================================
   BOOT
   ===================================================================== */
let SPRITE = '';
async function loadData() {
  const [sp, cat] = await Promise.all([fetch('assets/sprite.svg').then(r => r.text()), fetch('data/catalog.json').then(r => r.json())]);
  SPRITE = sp;
  const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  S.vids = cat.videos.map(([id, c, raw, mb, tema, st]) => ({ id, cat: c, raw, mb, tema, start: !!st }));
  S.vids.forEach(v => { v.title = pretty(v); v.search = fold(v.title + ' ' + v.raw + ' ' + C.cats[v.cat].nome + ' ' + (C.temas[v.tema] || '')); S.byId[v.id] = v; });
  S.imgs = cat.imagens; S.extras = cat.extras;
  window.CVCDATA = S;
}
async function getSessao() {
  if (MODO_PREVIA) { const em = localStorage.getItem('cvc:sessao'); return em ? { email: em, id: null } : null; }
  const { data } = await S.sb.auth.getSession();
  return data.session ? { email: data.session.user.email.toLowerCase(), id: data.session.user.id } : null;
}
async function loadAccess() {
  if (MODO_PREVIA) { S.previewPlan = localStorage.getItem('cvc:simp') || 'completo'; setPreviewAccess(); return; }
  const { data } = await S.sb.from('compras').select('produto,status').eq('email', S.user.email);
  applyPlan((data || []).filter(x => x.status === 'aprovada').map(x => x.produto));
  // progresso salvo na nuvem
  const { data: pr } = await S.sb.from('progresso').select('chave,valor').eq('user_id', S.user.id);
  (pr || []).forEach(x => { try { localStorage.setItem(ns() + x.chave, JSON.stringify(x.valor)); } catch {} });
  const { data: pf } = await S.sb.from('perfis').select('primeiro_login').eq('id', S.user.id).maybeSingle();
  if (pf?.primeiro_login) localStorage.setItem(ns() + 'primeiro', JSON.stringify(new Date(pf.primeiro_login).getTime()));
}
async function boot() {
  if (!SPRITE) await loadData();
  if (!MODO_PREVIA && !S.sb) S.sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  S.user = await getSessao();
  if (!S.user) return viewLogin();
  if (!load('primeiro', null)) save('primeiro', Date.now());
  await loadAccess();
  if (!MODO_PREVIA && !S.acc.size) { document.body.innerHTML = SPRITE; viewLogin('Não encontramos uma compra aprovada para ' + S.user.email + '. Use o mesmo e-mail da compra ou fale com o suporte.'); await S.sb.auth.signOut(); return; }
  shell(); route();
}
window.addEventListener('hashchange', () => route());
window.CVCAPP = { load, save, can, ic, esc, copy, toast, openModal, closeModal, thumb, dl, lockCard, starsHtml, refreshStars, route, reveal, S };
boot().catch(e => { console.error(e); document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif;color:#fff">Não foi possível carregar o app. Atualize a página.</p>'; });
})();
