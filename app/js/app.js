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
const isoLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const IMG = k => `assets/img/${k}.webp`;
const LOGO = 'assets/logo.webp', LOGO_S = 'assets/logo-96.webp';
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
async function copy(txt, msg = 'Copiado') {
  try { await navigator.clipboard.writeText(txt); toast(msg); return; } catch {}
  try { const t = document.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0'; document.body.appendChild(t); t.select(); t.setSelectionRange(0, txt.length); const ok = document.execCommand('copy'); t.remove(); if (ok) { toast(msg); return; } } catch {}
  openModal(`<div class="mhead"><b>Copie o texto</b><button class="x" onclick="document.getElementById('modal').click()">${ic('x')}</button></div><div class="mbody"><p class="mut" style="font-size:13px;margin-bottom:8px">Toque e segure no texto e escolha Selecionar tudo e Copiar.</p><textarea class="input" rows="8" readonly style="width:100%">${esc(txt)}</textarea></div>`);
}

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
const brand = () => `<a class="brand" href="#/qg"><img class="brand-logo" src="${LOGO_S}" alt="Canal Vice City"><span class="bt"><span class="chrome">CANAL</span><span class="brush">Vice City</span></span></a>`;

/* ---------- Rota Vice City: 6 missões = 6 estrelas ---------- */
const ROTA = [
  { id: 'plano', n: 'Monte seu Plano de Golpe', c: 'Plano', img: 'plano', r: '#/plano', d: 'Responda 5 perguntas e receba sua estratégia: redes, posts por dia e o caminho mais curto para a grana.', passos: ['Abra o Plano de Golpe', 'Responda as 5 perguntas (2 minutos)', 'Leia seu roteiro de 4 semanas'], ok: () => !!load('plano', null) },
  { id: 'canal', n: 'Coloque seu canal no ar', c: 'Canal', img: 'canal', r: '#/canal', d: 'Nome, bio, logo e perfil configurado em cada rede, em menos de 1 hora.', passos: ['Gere o nome do canal', 'Copie a bio pronta da sua rede', 'Crie a logo com o prompt e configure o perfil'], ok: () => !!load('checks', {}).canal_perfil },
  { id: 'agenda', n: 'Gere sua agenda do mês', c: 'Agenda', img: 'agenda', r: '#/agenda', d: '30 dias com vídeo, rede, horário e legenda prontos. É só seguir.', passos: ['Escolha as redes e quantos posts por dia', 'Toque em Gerar meu mês', 'Exporte para o Google Agenda'], ok: () => !!load('agenda', null) },
  { id: 'post', n: 'Poste seu primeiro vídeo', c: '1º post', img: 'recarga', r: '#/recarga', d: 'Baixe, transforme com o gancho na tela e publique. O primeiro é o mais importante.', passos: ['Baixe o vídeo do dia', 'Coloque o gancho como texto na tela (Kit Remix)', 'Poste e marque como postado'], ok: () => sets.posted().size > 0 },
  { id: 'semana', n: 'Feche 7 dias de constância', c: '7 posts', img: 'qg', r: '#/agenda', d: 'O algoritmo aprende quem é seu público com constância. Poste 7 vídeos seguindo a agenda.', passos: ['Siga a agenda todo dia', 'Responda os comentários na primeira hora', 'Repita o formato que mais deu view'], ok: () => sets.posted().size >= 7 },
  { id: 'grana', n: 'Ative sua primeira fonte de renda', c: 'Grana', img: 'grana', r: '#/grana', d: 'Escolha a rota que já está aberta para você e ative. Tem rota que paga antes de ter muitos seguidores.', passos: ['Abra o Mapa da Grana', 'Veja quais rotas já estão abertas para você', 'Ative uma e marque como feito'], ok: () => !!load('checks', {}).grana_ativa }
];
const rotaStatus = () => ROTA.map(m => m.ok());
function wantedLevel() { return rotaStatus().filter(Boolean).length; }
const nextMission = () => { const st = rotaStatus(); const i = st.findIndex(x => !x); return i === -1 ? null : i; };
const starsHtml = (n, cls = '') => `<div class="stars ${cls}" aria-label="Nível ${n} de 6">${[1, 2, 3, 4, 5, 6].map(i => STAR.replace('<svg', `<svg class="${i <= n ? 'on' : ''}"`)).join('')}</div>`;

/* ---------- Hero com imagem ---------- */
function heroX(img, kick, t1, t2, lead, acts = '', extra = '', cls = '') {
  return `<section class="hx ${cls} rv"><img class="bg" src="${IMG(img)}" alt="" ${cls.includes('eager') ? '' : 'loading="lazy"'}>${extra}<div class="in">${kick ? `<span class="kick">${kick}</span>` : ''}<h1 style="margin-top:14px"><span class="t1 chrome">${t1}</span><span class="t2 brush">${t2}</span></h1>${lead ? `<p class="lead">${lead}</p>` : ''}${acts ? `<div class="acts">${acts}</div>` : ''}</div></section>`;
}
const tile = (href, img, n, d, tg = '', lock = false) => `<a class="tile rv ${lock ? 'lock' : ''}" href="${href}"><img src="${img.includes('/') ? img : IMG(img)}" alt="" loading="lazy">${lock ? `<span class="tg">${ic('lock')}Bloqueado</span>` : tg ? `<span class="tg">${tg}</span>` : ''}<span class="n">${n}</span>${d ? `<span class="d">${d}</span>` : ''}</a>`;

/* =====================================================================
   LOGIN
   ===================================================================== */
function viewLogin(msg = '') {
  document.body.innerHTML = SPRITE + `
  <div class="login">
    <div class="login-art">
      <img src="${IMG('login')}" alt="">
      <div class="cap rv">
        <span class="kick">${ic('star', 'f')} Área de membros</span>
        <h1 style="margin-top:14px"><span class="chrome disp" style="font-size:clamp(30px,4vw,48px);display:block">Bem-vindo a</span><span class="brush" style="font-size:clamp(46px,6vw,80px)">Vice City</span></h1>
        <p class="lead" style="margin-top:10px">Seu acervo, sua agenda e seu plano para monetizar, tudo num lugar só.</p>
      </div>
    </div>
    <div class="login-box">
      <div class="login-in rv">
        <img class="login-logo" src="${LOGO}" alt="Canal Vice City">
        <h2 class="h2" style="margin-top:22px">Entrar no app</h2>
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
  ['Comece aqui', [
    ['qg', 'QG', 'app', null],
    ['hoje', 'Postar hoje', 'clock', null],
    ['rota', 'Rota Vice City', 'star', null],
    ['guia', 'Guia do iniciante', 'note', null]
  ]],
  ['Seus vídeos', [
    ['recarga', 'Recarga Vice City', 'refresh', null],
    ['biblioteca', 'Biblioteca completa', 'film', null],
    ['ineditos', 'Cortes Inéditos', 'gem', 'ineditos'],
    ['imagens', 'Imagens para feed', 'card', null]
  ]],
  ['Crescer o canal', [
    ['plano', 'Plano de Golpe', 'rocket', null],
    ['agenda', 'Gerador Agenda Vice', 'cal', 'agenda'],
    ['canal', 'Canal do Zero', 'user', 'canal'],
    ['remix', 'Kit Remix', 'wand', 'remix'],
    ['ferramentas', 'Ferramentas', 'bolt', 'ferramentas']
  ]],
  ['Fazer dinheiro', [
    ['grana', 'Mapa da Grana', 'coin', 'grana'],
    ['estrutura', 'Estrutura de Vendas', 'funnel', 'estrutura']
  ]],
  ['Extras', [
    ['extra/capas', 'Kit Capas', 'tag', 'capas'],
    ['extra/carrossel', 'Pack Carrossel', 'note', 'carrossel'],
    ['extra/piloto', 'Piloto Automático', 'play', 'piloto_lite'],
    ['estudio', 'Estúdio Vice', 'wand', 'piloto_lite']
  ]]
];
function shell() {
  const lockIc = k => k && !can(k) ? `<svg class="ic lk"><use href="#i-lock"/></svg>` : '';
  const nm = nextMission(), mr = nm === null ? '' : ROTA[nm].r.slice(2);
  document.body.innerHTML = SPRITE + `
  <div class="shell">
    <aside class="side" id="side">
      <button class="xclose" id="xclose" aria-label="Fechar menu">${ic('x')}</button>
      ${brand()}
      <nav class="nav">${NAV.map(([g, items]) => `<div class="nav-g">${g}</div>` + items.map(([r, n, i, k]) => `<a href="#/${r}" data-r="${r}">${ic(i)}<span>${n}</span>${r === mr ? '<span class="navstep">Próximo</span>' : lockIc(k)}</a>`).join('')).join('')}</nav>
      <div class="side-foot">
        ${isStandalone() ? '' : `<button class="btn btn-p btn-s" onclick="instalarApp()" style="width:100%;margin-bottom:6px">${ic('down')}Instalar o app</button>`}
        <a href="${CFG.SUPORTE_WHATSAPP}" target="_blank" rel="noopener" style="display:flex;gap:12px;align-items:center;padding:10px 12px;color:var(--mut);font-weight:650">${ic('chat')}Suporte no WhatsApp</a>
        <a href="#/conta" class="me"><span class="av">${esc((S.user.email || '?')[0].toUpperCase())}</span><div style="min-width:0;flex:1"><div class="em">${esc(S.user.email)}</div><span class="dim" style="font-size:12px;font-weight:700">Minha conta</span></div></a>
      </div>
    </aside>
    <div class="scrim" id="scrim"></div>
    <div class="main">
      ${MODO_PREVIA ? `<div class="preview-bar">${ic('bolt')} <b>Modo prévia</b> · simulando a compra: <select id="simp"><option value="completo">Completo</option><option value="start">Start</option><option value="tudo">Completo + bumps + upsell</option></select> · login real entra quando o banco for conectado.</div>` : ''}
      <header class="top">
        <button class="hamb" id="hamb" aria-label="Abrir menu">${ic('menu')}</button>
        ${brand()}
        <label class="search">${ic('funnel')}<input id="q" type="search" placeholder="Buscar vídeos por nome, categoria ou criador"></label>
        <a class="hud" href="#/rota" title="Seu nível de procurado sobe a cada missão da Rota Vice City"><span class="lv"><b>PROCURADO</b><span id="lvn"></span></span><span id="stars"></span></a>
      </header>
      <main class="view" id="view"></main>
    </div>
  </div>
  <nav class="tabbar">
    <a href="#/qg" data-r="qg">${ic('app')}QG</a>
    <a href="#/recarga" data-r="recarga">${ic('refresh')}Vídeos</a>
    <a href="#/rota" data-r="rota" class="fab"><span class="o">${STAR}</span>Rota</a>
    <a href="#/hoje" data-r="hoje">${ic('clock')}Hoje</a>
    <a href="#/bonus" data-r="bonus" id="tabmenu">${ic('gem')}Bônus</a>
  </nav>
  <div class="modal" id="modal"><div class="mbox" id="mbox"></div></div>
  <div class="toast" id="toast"></div>`;
  const side = $('#side'), scrim = $('#scrim');
  const openSide = on => { side.classList.toggle('open', on); scrim.classList.toggle('on', on); document.body.style.overflow = on ? 'hidden' : ''; };
  $('#hamb').onclick = () => openSide(true);
  $('#xclose').onclick = scrim.onclick = () => openSide(false);
  side.addEventListener('click', e => { if (e.target.closest('a')) openSide(false); });
  window.__closeSide = () => openSide(false);
  const simp = $('#simp');
  if (simp) { simp.value = S.previewPlan; simp.onchange = () => { S.previewPlan = simp.value; localStorage.setItem('cvc:simp', simp.value); setPreviewAccess(); shell(); route(); }; }
  $('#q').addEventListener('keydown', e => { if (e.key === 'Enter') location.hash = '#/biblioteca?q=' + encodeURIComponent(e.target.value.trim()); });
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); openSide(false); } });
  refreshStars();
}
function refreshStars() { const el = $('#stars'), lv = wantedLevel(); if (el) el.innerHTML = starsHtml(lv); const n = $('#lvn'); if (n) n.textContent = `NÍVEL ${lv}/6`; }
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
function openModal(html) { $('#mbox').className = 'mbox'; $('#mbox').innerHTML = html; $('#modal').classList.add('on'); document.body.style.overflow = 'hidden'; }
function closeModal() { const m = $('#modal'); if (!m?.classList.contains('on')) return; m.classList.remove('on'); document.body.style.overflow = ''; setTimeout(() => { if (!m.classList.contains('on')) { $('#mbox').innerHTML = ''; $('#mbox').className = 'mbox'; } }, 250); }

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
      <img class="cvb" src="${LOGO_S}" alt=""><span class="cvt">${esc(capaTxt(v))}</span><span class="tag" style="color:${cat.cor}">${esc(cat.curto)}</span>
      <button class="fav ${fav ? 'on' : ''}" data-fav="${v.id}" aria-label="Favoritar">${STAR}</button>
      ${done ? '<span class="done-b">Postado</span>' : ''}</div>
    <div class="bd"><div class="tt">${esc(v.title)}${v.cat === 'ineditos' || v.cat === 'novos' ? '' : ''}</div>
      <div class="acts"><a class="btn btn-p" href="${dl(v.id)}" target="_blank" rel="noopener">${ic('play')}Baixar</a>
      <button class="btn btn-g ib cp" data-copy="${v.id}" title="Copiar legenda e tags">${ic('tag')}</button>
      <button class="btn btn-g ib" data-post="${v.id}" title="Marcar como postado">${ic('check')}</button></div></div>
  </article>`;
}
function capaTxt(v) {
  if (v.cat === 'ineditos') return v.raw;
  if (v.cat === 'novos') return C.temas[v.tema] || 'Novo';
  const g = C.ganchos[C.ganchosPorCat[v.cat] || 'corte'];
  return g[hash(v.id) % g.length].replace(/[.?!]+$/, '');
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
  let p = plat;
  const sheet = () => {
    const l = legenda(v, p), done = sets.posted().has(id), fav = sets.fav().has(id);
    return `<div class="pv">
      <div class="pv-top"><button class="pv-back" data-x aria-label="Fechar">${ic('x')}</button><div class="pv-tt"><span style="color:${cat.cor}">${esc(cat.curto)}</span><b>${esc(v.title)}</b></div></div>
      <div class="pv-grid">
        <div class="pv-media"><div class="pv-player"><iframe src="${prev(id)}" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="Vídeo"></iframe></div>
          <p class="pv-note">${v.mb ? v.mb + ' MB · ' : ''}Toque no play para assistir. Para postar, use o botão Baixar vídeo.</p></div>
        <div class="pv-side">
          <div class="pv-step"><span class="n">1</span><div><b>Baixe o vídeo</b><span>Ele vai para a galeria do seu celular.</span></div></div>
          <a class="btn btn-p pv-dl" href="${dl(id)}" target="_blank" rel="noopener" data-dl>${ic('down')}Baixar vídeo</a>
          <div class="pv-step"><span class="n">2</span><div><b>Escolha onde vai postar</b><span>A legenda muda para cada rede.</span></div></div>
          <div class="pv-plats">${Object.entries(C.plats).map(([k, pl]) => `<button class="${k === p ? 'on' : ''}" data-plat="${k}" style="--pc:${pl.cor}">${pl.nome.replace('Instagram ', '').replace('YouTube ', '').replace('Facebook ', 'Face ')}</button>`).join('')}</div>
          <div class="pv-step"><span class="n">3</span><div><b>Copie e cole na hora de postar</b><span>Coloque o gancho como texto na tela nos 3 primeiros segundos.</span></div></div>
          <div class="pv-copy"><div class="pv-ch"><small>Gancho para a tela</small><button class="btn btn-g btn-s" data-c="g">${ic('note')}Copiar</button></div><p>${esc(l.gancho)}</p></div>
          <div class="pv-copy"><div class="pv-ch"><small>Título</small><button class="btn btn-g btn-s" data-c="t">${ic('note')}Copiar</button></div><p>${esc(l.titulo)}</p></div>
          <div class="pv-copy"><div class="pv-ch"><small>Legenda + hashtags</small><button class="btn btn-g btn-s" data-c="l">${ic('note')}Copiar</button></div><p class="pre">${esc(l.texto)}</p></div>
          <div class="pv-step"><span class="n">4</span><div><b>Postou? Marque aqui</b><span>Assim a agenda e a sua rota avançam.</span></div></div>
          <div class="pv-acts"><button class="btn ${done ? 'btn-g' : 'btn-p'}" data-m="post">${ic('check')}${done ? 'Postado' : 'Marcar como postado'}</button><button class="btn btn-g" data-m="fav">${STAR}${fav ? 'Salvo' : 'Salvar'}</button></div>
          <p class="pv-note">${C.plats[p].tamanho}.</p>
        </div>
      </div></div>`;
  };
  openModal(sheet());
  $('#mbox').classList.add('pvbox');
  const rerenderSide = () => { const side = $('.pv-side'); if (!side) return; const tmp = document.createElement('div'); tmp.innerHTML = sheet(); side.replaceWith(tmp.querySelector('.pv-side')); };
  $('#mbox').onclick = e => {
    const b = e.target.closest('button,[data-dl]'); if (!b) return;
    if (b.dataset.x !== undefined) return closeModal();
    if (b.dataset.dl !== undefined) return toast('Baixando o vídeo. Ele aparece em Downloads ou na galeria.');
    const l = legenda(v, p);
    if (b.dataset.plat) { p = b.dataset.plat; return rerenderSide(); }
    if (b.dataset.c === 'g') return copy(l.gancho, 'Gancho copiado');
    if (b.dataset.c === 't') return copy(l.titulo, 'Título copiado');
    if (b.dataset.c === 'l') return copy(l.texto, 'Legenda copiada');
    if (b.dataset.m === 'post') { const on = toggleSet('posted', id); refreshStars(); toast(on ? 'Marcado como postado. Boa!' : 'Desmarcado'); rerenderSide(); refreshCard(id); }
    if (b.dataset.m === 'fav') { const on = toggleSet('fav', id); toast(on ? 'Salvo nos favoritos' : 'Removido dos favoritos'); rerenderSide(); refreshCard(id); }
  };
}
function refreshCard(id) { $$(`.vc[data-id="${id}"]`).forEach(c => { c.outerHTML = vcard(S.byId[id]); }); }
function rail(title, vids, more, sub = '') {
  if (!vids.length) return '';
  return `<section class="rail rv"><div class="rail-h"><h3 class="h3">${title}</h3><span class="ct">${sub || fmt(vids.length) + ' vídeos'}</span>${more ? `<a class="more" href="${more}">Ver tudo ${ic('play')}</a>` : ''}</div>
  <div class="rail-wrap"><button class="rail-btn l" data-sc="-1" aria-label="Anterior">‹</button><div class="rail-track">${vids.slice(0, 16).map(vcard).join('')}</div><button class="rail-btn r" data-sc="1" aria-label="Próximo">›</button></div></section>`;
}
function bindRails() {
  $$('.rail-btn').forEach(b => b.onclick = () => { const tr = b.parentElement.querySelector('.rail-track'); tr.scrollBy({ left: tr.clientWidth * .9 * b.dataset.sc, behavior: 'smooth' }); });
}
function lockCard(k, txt, img = 'estrutura') {
  const p = Object.entries(CFG.produtos).find(([, v]) => v.libera.includes(k));
  return `<section class="hx sm rv" style="min-height:320px"><img class="bg" src="${IMG(img)}" alt="" style="filter:grayscale(.6) brightness(.6)"><div class="in"><span class="kick" style="color:var(--gold);border-color:rgba(255,209,102,.4)">${ic('lock')} Área bloqueada</span><h1 style="margin-top:14px"><span class="t1 chrome">Esse cofre</span><span class="t2 brush">está trancado</span></h1><p class="lead">${txt || 'Este conteúdo faz parte de outro plano.'}</p>${p ? `<div class="acts"><a class="btn btn-p" href="${p[1].checkout}" target="_blank" rel="noopener">${ic('bolt')}Liberar ${esc(p[1].nome)} · ${esc(p[1].preco)}</a></div>` : ''}</div></section>`;
}

/* =====================================================================
   VIEWS
   ===================================================================== */
const V = {};

/* ---------- QG ---------- */
V.qg = () => {
  const ag = load('agenda', null), posted = sets.posted(), lv = wantedLevel(), st = rotaStatus(), nm = nextMission();
  const vids = allowedVids(), semana = recargaSemana();
  const first = (S.user.email || '').split('@')[0].split(/[._-]/)[0];
  const m = nm === null ? null : ROTA[nm];
  const arsenal = [
    ['#/recarga', 'recarga', 'Recarga Vice City', `Semana ${semana} de ${CFG.RECARGA_SEMANAS} · ${fmt(vids.length)} vídeos`, 'recarga'],
    ['#/agenda', 'agenda', 'Gerador Agenda Vice', 'Seu mês inteiro montado em 1 clique', 'agenda'],
    ['#/ineditos', 'ineditos', 'Cortes Inéditos', 'Feitos pelo nosso time, só aqui', 'ineditos'],
    ['#/canal', 'canal', 'Canal do Zero', 'Perfil pronto em menos de 1 hora', 'canal'],
    ['#/remix', 'remix', 'Kit Remix', `${C.totalGanchos} ganchos e gerador de legendas`, 'remix'],
    ['#/grana', 'grana', 'Mapa da Grana', `${C.rotas.length} formas de monetizar`, 'grana']
  ];
  return `
  ${heroX('qg', `${starsHtml(lv)}&nbsp; Nível ${lv} de 6`, `E aí, ${esc(first)}.`, 'Bem-vindo ao QG', m ? `Sua próxima missão: <b style="color:#fff">${m.n}</b>. Siga a Rota Vice City e cada missão concluída acende uma estrela.` : 'Rota completa. Agora é constância: siga a agenda e escale o que dá resultado.', m ? `<a class="btn btn-p" href="${m.r}">${ic('rocket')}${m.n}</a><a class="btn btn-g" href="#/guia">${ic('note')}Como funciona</a>` : `<a class="btn btn-p" href="#/agenda">${ic('cal')}Abrir minha agenda</a>`, `<img class="logo-big" src="${LOGO}" alt="">`, 'eager')}
  ${hojeCard()}
  ${m ? `<section class="sec"><div class="sec-h"><div><span class="eyebrow-s">sua próxima missão</span><h2 class="h2">Missão ${nm + 1} de 6</h2></div><a class="btn btn-g btn-s" href="#/rota">Ver a rota completa</a></div>${spot(m, nm)}</section>` : ''}
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">rota vice city</span><h2 class="h2">Seu nível de procurado</h2><p>Cada missão concluída acende uma das 6 estrelas.</p></div></div>${track(st, nm)}</section>
  <section class="statrow sec">
    <div class="statc rv"><b class="grad">${fmt(vids.length)}</b><span>vídeos liberados</span></div>
    <div class="statc rv"><b>${fmt(posted.size)}</b><span>vídeos postados</span></div>
    <div class="statc rv"><b>${ag ? agendaProgresso(ag) + '%' : '0%'}</b><span>da agenda do mês</span></div>
    <div class="statc rv"><b>${semana}/${CFG.RECARGA_SEMANAS}</b><span>semanas de recarga</span></div>
  </section>
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">seu arsenal</span><h2 class="h2">Tudo o que veio no seu plano</h2></div><a class="btn btn-g btn-s" href="#/bonus">Ver todos os bônus</a></div>
    <div class="tiles">${arsenal.map(([h, im, n, d, k]) => tile(h, im, n, d, '', !can(k) && k !== 'recarga' ? true : (k === 'recarga' && !can('acervo_start')))).join('')}</div></section>
  ${can('recarga') ? rail('Recarga da semana', S.vids.filter(v => v.cat === 'novos'), '#/biblioteca?cat=novos', 'Lote ' + semana) : rail('Cortes que seguram até o fim', vids.filter(v => v.cat === 'cortes'), '#/biblioteca?cat=cortes')}`;
};
function hojeCard() {
  const ag = load('agenda', null); if (!ag) return '';
  const dia = ag.days.find(d => d.iso === isoLocal()); const ok = load('agdone', {});
  const n = dia ? dia.posts.length : 0, f = dia ? dia.posts.filter(p => ok[agKey(p)]).length : 0;
  return `<a class="card glow sec rv" href="#/hoje" style="display:flex;gap:14px;align-items:center"><span class="n" style="width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:var(--cta);flex:none">${ic('clock')}</span><span style="flex:1"><b style="display:block;font-size:17px">${n ? (f === n ? 'Posts de hoje concluídos' : `Hoje: ${n - f} post${n - f > 1 ? 's' : ''} para fazer`) : 'Hoje é folga na sua agenda'}</b><span class="mut" style="font-size:13.5px">Toque para ver o que postar, onde e em que horário.</span></span>${ic('play')}</a>`;
}
function spot(m, i) {
  return `<div class="spot rv"><div class="im"><img src="${IMG(m.img)}" alt="" loading="lazy"><span class="mstar">${STAR} Missão ${i + 1}</span></div><div class="ct"><h3 class="h2" style="font-size:clamp(24px,3vw,32px)">${m.n}</h3><p class="mut">${m.d}</p><ol>${m.passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol><div class="row" style="margin-top:6px"><a class="btn btn-p" href="${m.r}">${ic('play')}Começar agora</a></div></div></div>`;
}
function track(st, nm) {
  return `<div class="track">${ROTA.map((m, i) => `<a class="tstep rv ${st[i] ? 'done' : ''} ${i === nm ? 'cur' : ''}" href="${m.r}"><span class="st">${STAR}</span><small>${st[i] ? 'Concluída' : i === nm ? 'Agora' : 'Missão ' + (i + 1)}</small><b>${m.c}</b></a>`).join('')}</div>`;
}
function recargaSemana() {
  const fl = load('primeiro', Date.now());
  return Math.min(CFG.RECARGA_SEMANAS, 1 + Math.floor((Date.now() - fl) / (7 * 864e5)));
}

/* ---------- Rota Vice City ---------- */
V.rota = () => {
  const st = rotaStatus(), nm = nextMission(), lv = wantedLevel();
  return `${heroX('plano', `${starsHtml(lv)}&nbsp; Nível ${lv} de 6`, 'Rota', 'Vice City', 'O caminho exato, do zero até a primeira grana. São 6 missões; cada uma acende uma estrela de procurado. Faça na ordem.', nm !== null ? `<a class="btn btn-p" href="${ROTA[nm].r}">${ic('rocket')}Ir para a missão ${nm + 1}</a>` : '', '', 'eager')}
  <section class="sec">${track(st, nm)}</section>
  <section class="sec" style="display:grid;gap:18px">${ROTA.map((m, i) => `<div style="${st[i] ? 'opacity:.72' : ''}">${spot(m, i).replace('Começar agora', st[i] ? 'Rever' : i === nm ? 'Começar agora' : 'Abrir')}</div>`).join('')}</section>
  <p class="note sec">Os resultados dependem da sua constância. Nenhuma plataforma garante audiência ou renda: a rota mostra o caminho mais curto, e você caminha.</p>`;
};

/* ---------- Guia do iniciante ---------- */
const GUIA = [
  ['Por onde eu começo?', `<p>Siga a <a href="#/rota" style="text-decoration:underline">Rota Vice City</a>: são 6 missões em ordem. Em uma tarde você sai com o plano, o canal criado e o mês agendado.</p>`],
  ['Como baixar os vídeos no celular?', `<ol><li>Toque no vídeo e depois em <b>Baixar vídeo</b>.</li><li><b>Android:</b> o arquivo vai para a pasta Downloads e aparece na galeria.</li><li><b>iPhone:</b> toque no ícone de compartilhar e em <b>Salvar vídeo</b>. Se abrir em Arquivos, toque e segure e escolha <b>Salvar no Fotos</b>.</li><li>Vídeo grande demora um pouco mais: use o Wi-Fi.</li></ol>`],
  ['Por que eu preciso transformar o corte?', `<p>YouTube, TikTok e Instagram não pagam por vídeo repostado igual ao de outros perfis. Eles pagam por conteúdo com a sua contribuição. Na prática, 1 minuto de edição resolve:</p><ol><li><b>Gancho na tela:</b> texto grande nos 3 primeiros segundos (use o Kit Remix).</li><li><b>Legenda própria</b> e título com o que acontece no vídeo.</li><li><b>Narração</b> por cima, contando o que a pessoa vai ver, ou <b>sua reação</b> no canto (react).</li><li><b>Corte o começo parado</b> e dê zoom no momento principal.</li></ol>`],
  ['Como colocar o texto na tela pelo celular?', `<ol><li>Abra o CapCut e toque em <b>Novo projeto</b>.</li><li>Escolha o vídeo baixado.</li><li>Toque em <b>Texto → Adicionar texto</b>, cole o gancho e coloque no terço de cima.</li><li>Use letra grossa, branca com contorno preto, e deixe na tela nos 3 primeiros segundos.</li><li>Exporte em 1080p e poste.</li></ol>`],
  ['Posso postar o mesmo vídeo em várias redes?', `<p>Pode, e é o jeito mais rápido de crescer. Só nunca poste com a marca d'água de outra rede (vídeo baixado do TikTok no Reels, por exemplo): isso derruba o alcance. Use sempre o arquivo baixado daqui.</p>`],
  ['Preciso aquecer a conta nova?', `<p>Ajuda. Nos 2 ou 3 primeiros dias (5 a 7 no Instagram), use a conta como uma pessoa normal: siga perfis de GTA, assista, curta e comente por uns 10 minutos antes de postar. Assim a rede entende o seu nicho.</p>`],
  ['Quantos posts por dia e em que horário?', `<p>O <a href="#/plano" style="text-decoration:underline">Plano de Golpe</a> calcula para você. Em geral: 2 a 3 por dia por rede no começo, nos horários da agenda (almoço, fim de tarde e noite). Depois de 2 semanas, ajuste pelo painel de cada rede.</p>`],
  ['Quanto tempo até monetizar?', `<p>Depende da rota. Algumas pagam antes de ter muitos seguidores (campanhas de cortes, serviço para streamers, afiliados); as recompensas das plataformas pedem metas maiores. No YouTube, a partir de 1º de fevereiro de 2027 a entrada passa a pedir mais visualizações. Veja os requisitos atualizados no <a href="#/grana" style="text-decoration:underline">Mapa da Grana</a>.</p>`],
  ['Meu vídeo foi bloqueado ou recebeu reivindicação. E agora?', `<ol><li>Não apague a conta nem entre em pânico: reivindicação de música costuma só limitar o vídeo.</li><li>Evite trechos com a rádio do jogo tocando alto.</li><li>Evite spoiler da história e cenas de cinema longas.</li><li>Se repetir, troque o vídeo pela mesma categoria na Recarga.</li></ol>`],
  ['O que fazer quando um vídeo bomba?', `<p>Poste mais do mesmo tipo nos dias seguintes, teste 2 ganchos novos no mesmo assunto e fixe esse vídeo no topo do perfil. É assim que o canal cresce rápido.</p>`]
];
V.guia = () => `${heroX('canal', `${ic('note')} Comece aqui`, 'Guia do', 'iniciante', 'Respostas rápidas para as dúvidas de quem está postando pela primeira vez.', `<a class="btn btn-p" href="#/rota">${ic('star')}Seguir a Rota Vice City</a>`, '', 'eager')}
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">o ciclo de todo dia</span><h2 class="h2">Do app para o post em 3 passos</h2></div></div>
  <div class="steps3"><div><span class="n">1</span><span><b>Escolha e baixe</b><span>Pegue o vídeo do dia na agenda ou na Recarga.</span></span></div><div><span class="n">2</span><span><b>Transforme</b><span>Gancho na tela e legenda própria. Leva 1 minuto.</span></span></div><div><span class="n">3</span><span><b>Poste e marque</b><span>Publique no horário e marque como postado aqui.</span></span></div></div></section>
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">dúvidas frequentes</span><h2 class="h2">Perguntas de quem está começando</h2></div></div>
  <div class="faq">${GUIA.map(([q, a], i) => `<details class="rv" ${i < 1 ? 'open' : ''}><summary>${esc(q)}</summary><div class="fa">${a}</div></details>`).join('')}</div></section>
  <section class="card glow sec rv" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px"><h3 class="h3">Ainda ficou com dúvida?</h3><p class="mut" style="margin-top:6px">Fale com o nosso suporte no WhatsApp.</p></div><a class="btn btn-g" href="${CFG.SUPORTE_WHATSAPP}" target="_blank" rel="noopener">${ic('chat')}Chamar no WhatsApp</a></section>`;

/* ---------- Recarga ---------- */
const ORDER = ['novos', 'ineditos', 'cortes', 'memes', 'curiosidades', 'teorias', 'reacts', 'clipes', 'vazamentos', 'trailers', 'comparacoes', 'longos', 'geral'];
V.recarga = () => {
  const vids = allowedVids(), semana = recargaSemana();
  const cnt = c => S.vids.filter(v => v.cat === c && vidAllowed(v)).length;
  const sample = c => { const a = S.vids.filter(v => v.cat === c); return a[hash(c) % a.length]; };
  return `
  ${heroX('recarga', `${ic('refresh')} Semana ${semana} de ${CFG.RECARGA_SEMANAS}`, 'Recarga', 'Vice City', `${fmt(vids.length)} vídeos prontos, separados por categoria e criador. Lote novo toda semana.`, `<a class="btn btn-p" href="#/biblioteca">${ic('film')}Abrir a biblioteca</a>${can('agenda') ? `<a class="btn btn-g" href="#/agenda">${ic('cal')}Montar minha agenda</a>` : ''}`, '', 'eager')}
  ${!can('acervo') ? `<div class="alert" style="margin-top:16px">${ic('lock')}<span>Seu plano Start libera ${fmt(vids.length)} vídeos. O Completo libera os ${fmt(S.vids.length)}, a Recarga semanal e os Cortes Inéditos. <a href="${CFG.produtos.completo.checkout}" style="text-decoration:underline;font-weight:800">Fazer upgrade</a></span></div>` : ''}
  <section class="sec"><div class="steps3"><div><span class="n">1</span><span><b>Toque no vídeo</b><span>Assista aqui mesmo, sem abrir o Drive.</span></span></div><div><span class="n">2</span><span><b>Baixe e transforme</b><span>Coloque o gancho na tela (veja o Guia).</span></span></div><div><span class="n">3</span><span><b>Copie a legenda</b><span>Título e hashtags prontos para cada rede.</span></span></div></div></section>
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">escolha o que postar hoje</span><h2 class="h2">Categorias</h2></div></div>
  <div class="tiles">${ORDER.filter(c => S.vids.some(v => v.cat === c)).map(c => { const n = cnt(c), s = sample(c); return tile(n ? '#/biblioteca?cat=' + c : '#/recarga', s ? thumb(s.id, 500) : IMG('biblioteca'), C.cats[c].nome, n ? fmt(n) + ' vídeos' : 'Não incluso no seu plano', `<span class="dot" style="width:8px;height:8px;border-radius:50%;background:${C.cats[c].cor}"></span>${C.cats[c].curto}`, !n); }).join('')}</div></section>
  ${ORDER.filter(c => c !== 'geral').map(c => rail(C.cats[c].nome, vids.filter(v => v.cat === c), '#/biblioteca?cat=' + c)).join('')}
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
  ${heroX('biblioteca', `${ic('film')} ${fmt(allowedVids().length)} vídeos`, 'Biblioteca', 'completa', 'Filtre por categoria, tema ou criador. Tudo pronto para baixar, com legenda para cada rede.', '', '', 'sm eager')}<div style="height:18px"></div>
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
  if (!can('ineditos')) return lockCard('ineditos', 'Os Cortes Inéditos são produzidos pelo nosso time e fazem parte do plano Completo.', 'ineditos');
  const vids = S.vids.filter(v => v.cat === 'ineditos');
  const criadores = [...new Set(vids.map(v => v.tema))];
  return `${heroX('ineditos', `${ic('gem')} Exclusivo do Canal Vice City`, 'Cortes', 'Inéditos', 'Cortes de streamers brasileiros feitos pelo nosso time. Você não encontra em nenhum outro pack, então chega antes de todo mundo.', '', '', 'eager')}
  ${criadores.map(t => `<section class="sec"><div class="sec-h"><div><span class="eyebrow-s">criador</span><h2 class="h2">${esc(C.temas[t] || t)}</h2><p>${vids.filter(v => v.tema === t).length} cortes · novos entram toda semana</p></div></div><div class="vgrid">${vids.filter(v => v.tema === t).map(vcard).join('')}</div></section>`).join('')}`;
};

/* ---------- Imagens ---------- */
let IMGN = 40, IMGF = 's';
const IMGFMT = {
  s: { n: 'Stories', ar: '9/16', onde: 'Stories do Instagram e do Facebook, status do WhatsApp', como: 'Poste 1 ou 2 por dia com uma enquete ("Você jogaria isso?") ou caixinha de pergunta. Stories mantém quem já te segue voltando ao perfil.' },
  f: { n: 'Feed e carrossel', ar: '4/5', onde: 'Feed do Instagram, carrossel e Facebook', como: 'Junte 5 imagens num carrossel com o tema "detalhes que você não viu" e poste 3 vezes por semana. Carrossel gera salvamento, e salvamento leva o perfil para mais gente.' },
  q: { n: 'Quadradas', ar: '1/1', onde: 'Feed, Threads, X e grupos', como: 'Use como post de opinião: imagem + pergunta na legenda ("Qual a melhor parte?"). Ótimo para gerar comentário entre um vídeo e outro.' },
  p: { n: 'Paisagem', ar: '16/9', onde: 'Aba Comunidade do YouTube, Facebook, X e fundo de capa', como: 'Na aba Comunidade do YouTube, poste uma imagem por dia com enquete. Também servem de fundo para montar capas e banners.' }
};
V.imagens = () => {
  IMGN = 40;
  const cnt = k => S.imgs.filter(x => x[2] === k).length;
  setTimeout(imgRender);
  return `${heroX('imagens', `${ic('card')} ${fmt(S.imgs.length)} imagens`, 'Imagens', 'para o feed', 'Imagens para manter o perfil vivo entre um vídeo e outro, separadas pelo lugar onde você vai postar.', '', '', 'sm eager')}
  <section class="sec"><div class="steps3"><div><span class="n">1</span><span><b>Escolha onde vai postar</b><span>Stories, feed, quadrado ou paisagem.</span></span></div><div><span class="n">2</span><span><b>Baixe a imagem</b><span>Toque nela e depois em Baixar.</span></span></div><div><span class="n">3</span><span><b>Copie a legenda</b><span>Vem com pergunta para gerar comentário.</span></span></div></div></section>
  <div class="imgtabs sec" id="imgtabs">${Object.entries(IMGFMT).map(([k, f]) => `<button class="${k === IMGF ? 'on' : ''}" data-f="${k}"><b>${f.n}</b><span>${cnt(k)} imagens</span></button>`).join('')}</div>
  <div class="card sec" id="imgtip"></div>
  <div class="igrid" id="igrid"></div><div class="pager"><button class="btn btn-g" id="imore">Carregar mais</button></div>`;
};
const IMGLEG = ['Você tinha reparado nesse detalhe? Comenta aí.', 'Nota de 0 a 10 para esse lugar?', 'Você iria aqui primeiro? Responde nos comentários.', 'Salva para ver depois e marca quem precisa ver isso.', 'O que você faria aqui? Comenta.', 'Isso aqui vai ser o mais disputado. Concorda?'];
function imgRender() {
  const g = $('#igrid'); if (!g) return;
  const f = IMGFMT[IMGF], list = S.imgs.filter(x => x[2] === IMGF);
  $('#imgtip').innerHTML = `<div class="row" style="align-items:flex-start"><span class="pill" style="color:var(--aqua)">${f.n}</span><div style="flex:1;min-width:220px"><b style="display:block">Onde usar: ${f.onde}</b><p class="mut" style="font-size:13.5px;margin-top:4px">${f.como}</p></div></div>`;
  g.style.setProperty('--ar', f.ar);
  g.classList.toggle('wide', IMGF === 'p');
  g.innerHTML = list.slice(0, IMGN).map(([id], i) => `<button class="ic2" data-img="${id}" data-i="${i}"><img loading="lazy" src="${thumb(id, IMGF === 'p' ? 640 : 420)}" alt=""></button>`).join('');
  $('#imore').classList.toggle('hide', IMGN >= list.length);
  $('#imore').onclick = () => { IMGN += 40; imgRender(); };
  $('#imgtabs').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; IMGF = b.dataset.f; IMGN = 40; $$('#imgtabs button').forEach(x => x.classList.toggle('on', x === b)); imgRender(); };
  g.onclick = e => {
    const t = e.target.closest('[data-img]'); if (!t) return;
    const leg = IMGLEG[+t.dataset.i % IMGLEG.length] + '\n\n' + C.tagsBase.join(' ');
    openModal(`<div class="mhead"><b>${f.n}</b><button class="x" data-x>${ic('x')}</button></div><div class="mbody"><img src="${thumb(t.dataset.img, 1200)}" alt="" style="margin:0 auto;max-height:60dvh;border-radius:14px"><div class="pv-copy" style="margin-top:14px"><div class="pv-ch"><small>Legenda sugerida</small><button class="btn btn-g btn-s" data-leg>${ic('note')}Copiar</button></div><p class="pre">${esc(leg)}</p></div><a class="btn btn-p" style="margin-top:12px;width:100%;min-height:52px" href="${dl(t.dataset.img)}" target="_blank" rel="noopener">${ic('down')}Baixar imagem</a></div>`);
    $('#mbox').onclick = ev => { const b = ev.target.closest('button'); if (!b) return; if (b.dataset.x !== undefined) closeModal(); if (b.dataset.leg !== undefined) copy(leg, 'Legenda copiada'); };
  };
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
  return `${QZ.i === 0 ? heroX('plano', `${ic('rocket')} Missão 1`, 'Plano de', 'Golpe', '5 perguntas rápidas e você recebe a estratégia pronta: onde postar, quantos posts por dia e o caminho mais curto para monetizar.', '', '', 'sm eager') + '<div style="height:22px"></div>' : ''}<div class="quiz">
    <span class="kick">${ic('rocket')} Pergunta ${QZ.i + 1} de ${C.quiz.length}</span>
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
  return `${heroX('plano', `${ic('rocket')} Seu Plano de Golpe`, 'Golpe', esc(pl.nome.replace('Golpe ', '')), esc(pl.resumo), `<a class="btn btn-p" href="#/agenda?plano=1">${ic('cal')}Gerar minha agenda com este plano</a><a class="btn btn-g" href="#/plano/refazer">Refazer</a>`, '', 'eager')}
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
  if (!can('agenda')) return lockCard('agenda', 'O Gerador Agenda Vice faz parte do plano Completo.', 'agenda');
  const p = new URLSearchParams(qs);
  const plano = load('plano', null);
  const salvo = load('agenda', null);
  AG = salvo && !p.get('plano') ? salvo.cfg : agDefault(plano);
  if (p.get('plano') && plano) AG = agDefault(plano);
  setTimeout(() => { if (salvo && !p.get('plano')) agShow(salvo); });
  return `
  ${heroX('agenda', `${ic('cal')} Bônus 1`, 'Gerador', 'Agenda Vice', 'Escolha as redes e o ritmo. O gerador monta seus 30 dias com vídeos reais do acervo, horário, gancho, legenda e hashtags. Não gostou? Gera de novo.', '', '', 'sm eager')}
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
  const iso = isoLocal();
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
    const iso = isoLocal(dt);
    if (!cfg.dias.includes(dt.getDay())) { days.push({ iso, off: true, posts: [] }); continue; }
    const posts = [];
    if (cfg.cross) {
      const n = Math.max(...plats.map(([, n]) => n));
      for (let i = 0; i < n; i++) {
        const wantsLong = cfg.longo && cfg.plats.tiktok > i && i === 0 && longos.length;
        const lv = wantsLong ? (() => { const x = longos.pop(); used.add(x.id); return x; })() : null;
        const others = plats.some(([p, cnt]) => p !== 'tiktok' && i < cnt);
        const v = lv && !others ? lv : take();
        plats.forEach(([p, cnt]) => { if (i < cnt) posts.push(mkPost(p === 'tiktok' && lv ? lv : v, p, C.plats[p].horas[i], d, i)); });
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
  const today = isoLocal();
  const first = new Date(ag.days[0].iso + 'T12:00:00').getDay();
  const mes = new Date(ag.days[0].iso + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  out.innerHTML = `
  <div class="sec-h sec"><div><h2 class="h2">Seus 30 dias</h2><p>${fmt(total)} posts · ${fmt(vids)} vídeos diferentes · a partir de ${mes}</p></div>
    <div class="row"><a class="btn btn-p btn-s" href="#/hoje">${ic('clock')}Ver o que postar hoje</a><button class="btn btn-g btn-s" id="agre">${ic('refresh')}Gerar de novo</button><button class="btn btn-g btn-s" id="agics">${ic('cal')}Adicionar ao Google Agenda</button><button class="btn btn-g btn-s" id="agcsv">${ic('note')}Planilha</button><button class="btn btn-p btn-s" id="agauto">${ic('bolt')}Postar sozinho</button></div></div>
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
    if (b.id === 'agauto') return autoPost(ag);
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
/* ---------- Postagem automática (Metricool) ---------- */
const MC_COLS = ['Text', 'Date', 'Time', 'Draft', 'Facebook', 'Twitter/X', 'LinkedIn', 'GBP', 'Instagram', 'Pinterest', 'TikTok', 'YouTube', 'Threads', 'Bluesky', 'Picture Url 1', 'Instagram Post Type', 'Instagram Show Reel On Feed', 'YouTube Video Title', 'YouTube Video Type', 'YouTube Video Privacy', 'YouTube video for kids', 'Facebook Post Type'];
function mcCsv(posts) {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [MC_COLS.join(',')];
  posts.forEach(({ d, p }) => {
    if (p.p === 'kwai') return;
    const net = { Facebook: p.p === 'facebook', Instagram: p.p === 'reels', TikTok: p.p === 'tiktok', YouTube: p.p === 'shorts' };
    const r = { Text: p.l, Date: d.iso, Time: p.h + ':00', Draft: 'FALSE', 'Picture Url 1': `https://drive.google.com/file/d/${p.id}/view?usp=sharing`,
      'Instagram Post Type': net.Instagram ? 'REEL' : '', 'Instagram Show Reel On Feed': net.Instagram ? 'true' : '',
      'YouTube Video Title': net.YouTube ? p.t.slice(0, 95) + ' #shorts' : '', 'YouTube Video Type': net.YouTube ? 'SHORT' : '', 'YouTube Video Privacy': net.YouTube ? 'PUBLIC' : '', 'YouTube video for kids': net.YouTube ? 'false' : '',
      'Facebook Post Type': net.Facebook ? 'REEL' : '' };
    ['Facebook', 'Twitter/X', 'LinkedIn', 'GBP', 'Instagram', 'Pinterest', 'TikTok', 'YouTube', 'Threads', 'Bluesky'].forEach(k => r[k] = net[k] ? 'TRUE' : 'FALSE');
    rows.push(MC_COLS.map(c => q(r[c])).join(','));
  });
  return rows.join('\r\n');
}
function autoPost(ag) {
  if (!can('piloto_lite')) {
    openModal(`<div class="mhead"><b class="disp" style="font-size:20px">Postar sozinho</b><button class="x" data-x>${ic('x')}</button></div><div class="mbody"><p class="mut">Com o Piloto Automático, esta agenda vira um arquivo que você importa uma vez num agendador e os vídeos são publicados sozinhos, no horário, no TikTok, Reels, Shorts e Facebook. Você não precisa abrir as redes todo dia.</p><a class="btn btn-p" style="width:100%;margin-top:16px;min-height:52px" href="${CFG.produtos.piloto.checkout}" target="_blank" rel="noopener">${ic('bolt')}Liberar o Piloto Automático · ${esc(CFG.produtos.piloto.preco)}</a></div>`);
    $('#mbox').onclick = e => { if (e.target.closest('[data-x]')) closeModal(); };
    return;
  }
  const semanas = [];
  for (let w = 0; w < 5; w++) { const ds = ag.days.slice(w * 7, w * 7 + 7); const ps = ds.flatMap(d => d.posts.map(p => ({ d, p }))).filter(x => x.p.p !== 'kwai'); if (ps.length) semanas.push({ w, ds, ps }); }
  const temKwai = ag.days.some(d => d.posts.some(p => p.p === 'kwai'));
  openModal(`<div class="mhead"><b class="disp" style="font-size:20px">Postar sozinho com o Metricool</b><button class="x" data-x>${ic('x')}</button></div><div class="mbody">
    <p class="mut" style="font-size:14px">Você importa a agenda uma vez e o Metricool publica cada vídeo sozinho, no dia e horário certos. Faça uma semana por vez (o Metricool recomenda arquivos de até 50 posts).</p>
    <div class="steps3" style="margin-top:14px;grid-template-columns:1fr"><div><span class="n">1</span><span><b>Crie a conta grátis no Metricool</b><span>metricool.com · conecte TikTok, Instagram, YouTube e Facebook em Configurações da marca.</span></span></div><div><span class="n">2</span><span><b>Baixe o arquivo da semana aqui embaixo</b><span>Cada linha é um post, com vídeo, legenda, data e horário.</span></span></div><div><span class="n">3</span><span><b>No Metricool: Planejamento → Importar CSV</b><span>Escolha o arquivo e, no formato, marque data AAAA-MM-DD e hora HH:mm:ss. Confira a prévia e confirme.</span></span></div></div>
    <div style="display:grid;gap:8px;margin-top:16px">${semanas.map(s => `<button class="btn btn-g" data-wk="${s.w}" style="justify-content:space-between;min-height:52px"><span>Semana ${s.w + 1} · ${new Date(s.ds[0].iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${new Date(s.ds[s.ds.length - 1].iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span><span class="pill">${s.ps.length} posts</span></button>`).join('')}</div>
    <div class="alert" style="margin-top:14px">${ic('shield')}<span>O Metricool tem plano grátis com limites de uso; para postar o mês inteiro em várias redes, pode ser preciso um plano pago dele. Se preferir não usar, cada rede também agenda sozinha de graça: Meta Business Suite (Reels e Facebook), TikTok Studio e YouTube Studio.${temKwai ? ' O Kwai não aceita agendamento externo: poste por lá mesmo.' : ''}</span></div>
  </div>`);
  $('#mbox').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.x !== undefined) return closeModal();
    if (b.dataset.wk !== undefined) { const s = semanas.find(x => x.w === +b.dataset.wk); baixar(mcCsv(s.ps), `metricool-semana-${s.w + 1}.csv`, 'text/csv'); toast('Arquivo baixado. Agora importe no Metricool'); }
  };
}
function baixar(txt, nome, tipo) { const u = URL.createObjectURL(new Blob([txt], { type: tipo + ';charset=utf-8' })); const a = document.createElement('a'); a.href = u; a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1500); }

/* ---------- Hoje: o que postar agora ---------- */
V.hoje = () => {
  const ag = load('agenda', null), today = isoLocal();
  const dia = ag && ag.days.find(d => d.iso === today);
  const dt = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  const ok = load('agdone', {});
  let corpo;
  if (dia && dia.posts.length) {
    const feitos = dia.posts.filter(p => ok[agKey(p)]).length;
    corpo = `<div class="card glow sec rv"><div class="row"><div style="flex:1"><h2 class="h3">${feitos === dia.posts.length ? 'Tudo postado hoje. Missão cumprida!' : `Faltam ${dia.posts.length - feitos} de ${dia.posts.length} posts hoje`}</h2><p class="mut" style="font-size:13.5px;margin-top:4px">Para cada post: baixe, cole o gancho como texto na tela, copie a legenda, poste no horário e toque em Marcar feito.</p></div></div><div class="prog" style="margin-top:12px"><i style="width:${Math.round(feitos / dia.posts.length * 100)}%"></i></div></div>
    <div id="hojelist" class="sec">${dia.posts.map(p => postRow(p, ok)).join('')}</div>`;
  } else if (ag) {
    const prox = ag.days.find(d => d.iso > today && d.posts.length);
    corpo = `<div class="card sec rv"><h2 class="h3">${ag.days.some(d => d.iso === today) ? 'Hoje é dia de folga na sua agenda.' : 'Sua agenda não cobre hoje.'}</h2><p class="mut" style="margin-top:6px">${prox ? 'Próximo post: ' + new Date(prox.iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }) + '.' : 'Gere uma agenda nova para os próximos 30 dias.'}</p><a class="btn btn-p" style="margin-top:14px" href="#/agenda">${ic('cal')}Abrir a agenda</a></div>`;
  } else {
    const r = rng(hash(today + S.user.email)), posted = sets.posted();
    const sug = shuffle(allowedVids().filter(v => !posted.has(v.id) && ['cortes', 'memes', 'curiosidades', 'novos', 'ineditos'].includes(v.cat)), r).slice(0, 3);
    corpo = `<div class="card glow sec rv"><h2 class="h3">Você ainda não tem agenda</h2><p class="mut" style="margin-top:6px">Gere a agenda e esta tela passa a mostrar, todo dia, exatamente o que postar e em que horário. Enquanto isso, separamos 3 vídeos para hoje:</p><a class="btn btn-p" style="margin-top:14px" href="#/agenda">${ic('cal')}Gerar minha agenda (1 minuto)</a></div>
    <section class="sec"><div class="vgrid">${sug.map(vcard).join('')}</div></section>`;
  }
  return `${heroX('agenda', `${ic('clock')} ${dt}`, 'Postar', 'hoje', 'Abra esta tela todo dia. Ela mostra o que postar, onde e em que horário.', '', '', 'sm eager')}${corpo}`;
};
function bindHoje() {
  const l = $('#hojelist'); if (!l) return;
  l.onclick = e => { const b = e.target.closest('button,[data-open]'); if (!b) return; const ag = load('agenda', null); agPostAction(b, ag); if (b.dataset.ok || b.dataset.sw) route(true); };
}

/* ---------- Bônus (hub no celular) ---------- */
V.bonus = () => {
  const G = [
    ['Comece aqui', [['rota', 'plano', 'Rota Vice City', 'As 6 missões em ordem', null], ['guia', 'canal', 'Guia do iniciante', 'Dúvidas de quem está começando', null], ['plano', 'plano', 'Plano de Golpe', 'Sua estratégia em 5 perguntas', null]]],
    ['Seus vídeos', [['recarga', 'recarga', 'Recarga Vice City', 'Lote novo toda semana', null], ['ineditos', 'ineditos', 'Cortes Inéditos', 'Só aqui, feitos pelo nosso time', 'ineditos'], ['imagens', 'imagens', 'Imagens para feed', `${fmt(S.imgs.length)} posts prontos`, null]]],
    ['Crescer o canal', [['agenda', 'agenda', 'Gerador Agenda Vice', 'Seu mês em 1 clique', 'agenda'], ['canal', 'canal', 'Canal do Zero', 'Perfil pronto em 1 hora', 'canal'], ['remix', 'remix', 'Kit Remix', `${C.totalGanchos} ganchos + gerador`, 'remix'], ['ferramentas', 'ferramentas', 'Ferramentas', 'Logos, capas e limpeza do arquivo', 'ferramentas']]],
    ['Fazer dinheiro', [['grana', 'grana', 'Mapa da Grana', `${C.rotas.length} formas de monetizar`, 'grana'], ['estrutura', 'estrutura', 'Estrutura de Vendas', 'O nosso funil, aberto para você', 'estrutura']]],
    ['Extras', [['extra/capas', 'capas', 'Kit Capas', 'Capas que fazem clicar', 'capas'], ['extra/carrossel', 'carrossel', 'Pack Carrossel', 'Carrosséis prontos para o feed', 'carrossel'], ['extra/piloto', 'piloto', 'Piloto Automático', 'Robô de Cortes e prompts', 'piloto_lite']]]
  ];
  return `${heroX('login', `${ic('gem')} Seu arsenal`, 'Bônus e', 'extras', 'Tudo o que vem com o Canal Vice City, organizado pelo que você quer fazer agora.', '', '', 'sm eager')}
  ${G.map(([g, it]) => `<section class="sec"><div class="sec-h"><div><h2 class="h2">${g}</h2></div></div><div class="tiles">${it.map(([r, im, n, d, k]) => tile('#/' + r, im, n, d, '', !!k && !can(k))).join('')}</div></section>`).join('')}`;
};

/* ---------- Conta ---------- */
V.conta = () => {
  const comprados = Object.entries(CFG.produtos).filter(([, p]) => p.libera.every(x => can(x)));
  return `${heroX('login', `${starsHtml(wantedLevel())}&nbsp; Nível ${wantedLevel()} de 6`, 'Sua', 'conta', esc(S.user.email), '', '', 'sm eager')}
  <div class="card sec rv" style="margin-top:16px"><div class="row"><span class="av" style="width:48px;height:48px;font-size:18px">${esc(S.user.email[0].toUpperCase())}</span><div><b>${esc(S.user.email)}</b><div class="dim" style="font-size:13px">Nível ${wantedLevel()} de 6</div></div></div></div>
  <div class="card sec rv"><h3 class="h3">Seus produtos</h3><div style="display:grid;gap:8px;margin-top:12px">${Object.entries(CFG.produtos).map(([k, p]) => { const ok = p.libera.every(x => can(x)); return `<div class="row" style="padding:12px;border-radius:12px;background:rgba(255,255,255,.04)"><span>${ok ? ic('check') : ic('lock')}</span><b>${esc(p.nome)}</b><span class="sp"></span>${ok ? '<span class="pill" style="color:var(--aqua)">Liberado</span>' : `<a class="btn btn-g btn-xs" href="${p.checkout}" target="_blank" rel="noopener">${esc(p.preco)}</a>`}</div>`; }).join('')}</div></div>
  <div class="grid2 sec"><a class="btn btn-g" href="${CFG.SUPORTE_WHATSAPP}" target="_blank" rel="noopener">${ic('chat')}Suporte no WhatsApp</a><button class="btn btn-g" id="sair2">Sair da conta</button></div>`;
};

/* ---------- Módulos de bônus (carregados de bonus.js) ---------- */
V.canal = (...a) => window.BONUS?.canal ? (can('canal') ? window.BONUS.canal(...a) : lockCard('canal')) : '';
V.grana = (...a) => window.BONUS?.grana ? (can('grana') ? window.BONUS.grana(...a) : lockCard('grana')) : '';
V.remix = (...a) => window.BONUS?.remix ? (can('remix') ? window.BONUS.remix(...a) : lockCard('remix')) : '';
V.ferramentas = (...a) => window.BONUS?.ferramentas ? (can('ferramentas') ? window.BONUS.ferramentas(...a) : lockCard('ferramentas')) : '';
V.estrutura = (...a) => window.BONUS?.estrutura ? window.BONUS.estrutura(...a) : '';
V.estudio = () => can('piloto_lite') ? window.ESTUDIO.view() : lockCard('piloto_lite', 'O Estúdio Vice faz parte do Piloto Automático: corte vertical com gancho na tela, direto no celular.', 'remix');
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
  $$('[data-r]').forEach(a => { const r = a.dataset.r; a.classList.toggle('on', r === name || r === path || (r === 'bonus' && ['canal', 'grana', 'remix', 'ferramentas', 'estrutura', 'plano', 'extra', 'ineditos', 'imagens', 'bonus', 'guia'].includes(name))); });
  window.__closeSide && window.__closeSide();
  bindCards(view); bindRails(); bindLib(); bindQuiz(); bindAgenda(); bindHoje();
  window.BONUS?.bind?.(name, sub, qs);
  if (name === 'estudio' && can('piloto_lite')) window.ESTUDIO.bind(); else window.ESTUDIO?.parar?.();
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
  if (!load('boasvindas', false)) setTimeout(welcome, 500);
}
function welcome() {
  openModal(`<div class="welcome"><img class="wl" src="${LOGO}" alt="Canal Vice City"><h2><span class="chrome disp" style="font-size:30px;display:block">Bem-vindo a</span><span class="brush" style="font-size:52px">Vice City</span></h2>
  <p class="mut" style="margin-top:10px">Aqui você tem tudo para colocar um canal de GTA 6 no ar e fazer dinheiro com ele. Para não se perder, siga a Rota Vice City: 6 missões, uma estrela de procurado para cada.</p>
  <div class="wsteps">${ROTA.map((m, i) => `<div>${STAR}<span><b>${i + 1}.</b> ${m.n}</span></div>`).join('')}</div>
  <button class="btn btn-p" id="wgo" style="width:100%">${ic('rocket')}${nextMission() === null ? 'Ver minha rota' : 'Começar a missão ' + (nextMission() + 1)}</button><button class="btn btn-g btn-s" id="wlater" style="margin-top:10px;width:100%">Explorar primeiro</button></div>`);
  const done = () => save('boasvindas', true);
  $('#wgo').onclick = () => { done(); closeModal(); const n = nextMission(); location.hash = n === null ? '#/rota' : ROTA[n].r; };
  $('#wlater').onclick = () => { done(); closeModal(); };
}
window.addEventListener('hashchange', () => route());
/* ---------- App instalável ---------- */
let installEvt = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $$('.inst-hide').forEach(x => x.classList.remove('inst-hide')); });
window.addEventListener('appinstalled', () => { installEvt = null; toast('App instalado. Procure o ícone Vice City na sua tela.'); });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
async function instalarApp() {
  if (isStandalone()) return toast('Você já está usando o app instalado.');
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice; installEvt = null; if (r.outcome === 'accepted') toast('Instalando...'); return; }
  const ios = isIOS();
  openModal(`<div class="mhead"><b class="disp" style="font-size:20px">Instalar o app Vice City</b><button class="x" data-x>${ic('x')}</button></div><div class="mbody">
    <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px"><img src="${LOGO_S}" alt="" style="width:64px;height:64px;border-radius:16px;box-shadow:var(--neon)"><p class="mut" style="font-size:14px">Fica na tela inicial como um aplicativo, abre em tela cheia e mais rápido. Não ocupa espaço como app de loja.</p></div>
    ${ios ? `<h3 class="h3" style="font-size:18px">No iPhone (Safari)</h3><div class="steps3" style="margin-top:10px"><div><span class="n">1</span><span><b>Abra no Safari</b><span>Se estiver em outro navegador, copie o link e abra no Safari.</span></span></div><div><span class="n">2</span><span><b>Toque em Compartilhar</b><span>O quadrado com a seta para cima, na barra de baixo.</span></span></div><div><span class="n">3</span><span><b>Adicionar à Tela de Início</b><span>Role a lista, toque nessa opção e depois em Adicionar.</span></span></div></div>`
    : `<h3 class="h3" style="font-size:18px">No Android (Chrome)</h3><div class="steps3" style="margin-top:10px"><div><span class="n">1</span><span><b>Abra no Chrome</b><span>Se estiver em outro navegador, copie o link e abra no Chrome.</span></span></div><div><span class="n">2</span><span><b>Toque nos 3 pontinhos</b><span>No canto de cima, à direita.</span></span></div><div><span class="n">3</span><span><b>Instalar app</b><span>Ou "Adicionar à tela inicial". Confirme e pronto.</span></span></div></div>
    <h3 class="h3" style="font-size:18px;margin-top:18px">No computador</h3><p class="mut" style="font-size:14px;margin-top:6px">No Chrome ou Edge, clique no ícone de instalar no fim da barra de endereço.</p>`}
    <button class="btn btn-g" style="width:100%;margin-top:18px" id="cplink">${ic('note')}Copiar o link do app</button></div>`);
  $('#mbox').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.x !== undefined) closeModal(); if (b.id === 'cplink') copy(location.origin + '/app/', 'Link copiado'); };
}
window.instalarApp = instalarApp;
window.CVCAPP = { load, save, can, ic, esc, copy, toast, openModal, closeModal, thumb, dl, lockCard, starsHtml, refreshStars, route, reveal, S };
boot().catch(e => { console.error(e); document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif;color:#fff">Não foi possível carregar o app. Atualize a página.</p>'; });
})();
