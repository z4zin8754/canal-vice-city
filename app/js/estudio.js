/* Canal Vice City · Estúdio Vice: cortes verticais com gancho na tela, direto no navegador */
(function () {
'use strict';
const A = window.CVCAPP, C = window.CONTENT;
const { ic, esc, toast, load, save } = A;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const W = 720, H = 1280;
const fmtT = s => { s = Math.max(0, s || 0); const m = Math.floor(s / 60), x = Math.floor(s % 60); return `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; };
let st = null;

function novoEstado() {
  return { file: null, url: '', dur: 0, a: 0, b: 30, modo: 'desfoque', gancho: '', rodape: load('canal_nome', ''), estilo: 'rosa', fila: [], gravando: false, momentos: [] };
}

function view() {
  st = st || novoEstado();
  return `
  <section class="hx sm rv"><img class="bg" src="assets/img/remix.webp" alt=""><div class="in"><span class="kick">${ic('wand')} Piloto Automático</span><h1 style="margin-top:14px"><span class="t1 chrome">Estúdio</span><span class="t2 brush">Vice</span></h1><p class="lead">Transforme qualquer vídeo em corte vertical com o gancho na tela, direto no celular. Sem instalar nada e sem enviar o vídeo para lugar nenhum.</p></div></section>
  <section class="sec"><div class="steps3"><div><span class="n">1</span><span><b>Abra o vídeo</b><span>Da galeria: um corte baixado aqui ou a gravação de uma live.</span></span></div><div><span class="n">2</span><span><b>Escolha o trecho e o gancho</b><span>Ou deixe o Estúdio achar os momentos mais fortes.</span></span></div><div><span class="n">3</span><span><b>Gere o vídeo</b><span>Sai pronto em 9:16 para TikTok, Reels e Shorts.</span></span></div></div></section>
  <section class="es-wrap sec">
    <div class="es-stage">
      <div class="es-canvas"><canvas id="escv" width="${W}" height="${H}"></canvas>
        <label class="es-open ${st.file ? 'hide' : ''}" id="esopen"><input type="file" id="esfile" accept="video/*" hidden><span class="o">${ic('film')}</span><b>Toque para abrir um vídeo</b><span>MP4 ou MOV da sua galeria</span><button class="btn btn-g btn-s es-demo" id="esdemo" type="button">Testar com um vídeo de exemplo</button></label>
      </div>
      <div class="es-ctrl ${st.file ? '' : 'hide'}" id="esctrl">
        <button class="btn btn-g" id="esplay">${ic('play')}Assistir o trecho</button>
        <label class="btn btn-g" style="cursor:pointer">${ic('refresh')}Trocar vídeo<input type="file" id="esfile2" accept="video/*" hidden></label>
      </div>
    </div>
    <div class="es-panel ${st.file ? '' : 'dim-panel'}" id="espanel">
      <div class="es-box"><div class="es-h"><span class="n">1</span><b>Trecho do vídeo</b><span class="sp"></span><span class="pill" id="eslen">00:30</span></div>
        <div class="es-range"><label>Começa em <b id="esat">00:00</b><input type="range" id="esa" min="0" max="100" step="0.1" value="0"></label><label>Termina em <b id="esbt">00:30</b><input type="range" id="esb" min="0" max="100" step="0.1" value="30"></label></div>
        <div class="es-2"><button class="btn btn-g btn-s" id="esmarkA">Marcar início aqui</button><button class="btn btn-g btn-s" id="esmarkB">Marcar fim aqui</button></div>
        <button class="btn btn-g" id="esauto" style="width:100%;margin-top:10px">${ic('bolt')}Achar os momentos mais fortes</button>
        <div id="esmom" class="es-mom"></div>
        <p class="es-tip">Ideal: de 20 a 60 segundos. Para o Programa de Recompensas do TikTok, use 1 minuto ou mais.</p>
      </div>
      <div class="es-box"><div class="es-h"><span class="n">2</span><b>Gancho na tela</b></div>
        <textarea class="input" id="esg" rows="2" maxlength="70" placeholder="Ex.: Ninguém reparou nesse detalhe">${esc(st.gancho)}</textarea>
        <div class="es-2"><button class="btn btn-g btn-s" id="esgrand">${ic('wand')}Sortear um gancho</button><select class="input" id="esestilo" style="min-height:40px;padding:6px 10px"><option value="rosa">Faixa rosa</option><option value="branco">Branco com contorno</option><option value="amarelo">Amarelo com contorno</option></select></div>
        <label class="field"><span>Texto no rodapé (opcional)</span><input class="input" id="esrod" maxlength="30" value="${esc(st.rodape)}" placeholder="@seucanal"></label>
      </div>
      <div class="es-box"><div class="es-h"><span class="n">3</span><b>Enquadramento</b></div>
        <div class="es-seg" id="esmodo"><button data-m="desfoque" class="${st.modo === 'desfoque' ? 'on' : ''}">Vídeo inteiro + fundo</button><button data-m="preencher" class="${st.modo === 'preencher' ? 'on' : ''}">Preencher a tela</button></div>
        <p class="es-tip">Vídeo deitado (de live ou do jogo)? Use "Vídeo inteiro + fundo". Vídeo já em pé? Use "Preencher a tela".</p>
      </div>
      <div class="es-box"><div class="es-h"><span class="n">4</span><b>Gerar</b></div>
        <button class="btn btn-p" id="esgo" style="width:100%;min-height:54px">${ic('down')}Gerar este corte</button>
        <button class="btn btn-g" id="esfila" style="width:100%;margin-top:8px">${ic('note')}Guardar na fila e fazer outro trecho</button>
        <div id="esfilabox"></div>
        <div id="esprog" class="hide"><div class="prog" style="margin-top:12px"><i id="esbar" style="width:0%"></i></div><p class="es-tip">Gerando... deixe esta tela aberta e o celular ligado.</p></div>
        <div id="esout"></div>
        <p class="es-tip">O vídeo é gerado em tempo real no seu aparelho: um corte de 30 segundos leva cerca de 30 segundos. Deixe a tela ligada.</p>
      </div>
    </div>
  </section>`;
}

/* ---------- Desenho ---------- */
let vid, cv, cx, raf, filtroOk = null;
function quebra(ctx, txt, max) {
  const ws = txt.split(/\s+/), out = []; let l = '';
  ws.forEach(w => { const t = l ? l + ' ' + w : w; if (ctx.measureText(t).width > max && l) { out.push(l); l = w; } else l = t; });
  if (l) out.push(l); return out.slice(0, 3);
}
function desenha() {
  if (!cx) return;
  cx.fillStyle = '#07030e'; cx.fillRect(0, 0, W, H);
  if (vid && vid.videoWidth) {
    const vw = vid.videoWidth, vh = vid.videoHeight;
    const cover = Math.max(W / vw, H / vh), fit = Math.min(W / vw, H / vh);
    if (st.modo === 'preencher') {
      cx.drawImage(vid, (W - vw * cover) / 2, (H - vh * cover) / 2, vw * cover, vh * cover);
    } else {
      if (filtroOk) { cx.filter = 'blur(28px) brightness(0.55) saturate(1.3)'; cx.drawImage(vid, (W - vw * cover) / 2, (H - vh * cover) / 2, vw * cover, vh * cover); cx.filter = 'none'; }
      else { cx.globalAlpha = .35; cx.drawImage(vid, (W - vw * cover) / 2, (H - vh * cover) / 2, vw * cover, vh * cover); cx.globalAlpha = 1; }
      const s = Math.max(fit, Math.min(W / vw, (H * 0.62) / vh)) ;
      const dw = Math.min(W, vw * s), dh = vh * (dw / vw);
      cx.drawImage(vid, (W - dw) / 2, (H - dh) / 2 + 40, dw, dh);
    }
  }
  const g = (st.gancho || '').trim().toUpperCase();
  if (g) {
    cx.font = `64px Anton, Impact, "Arial Black", sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    const linhas = quebra(cx, g, W - 110), lh = 76, y0 = 200 - (linhas.length - 1) * lh / 2;
    linhas.forEach((l, i) => {
      const y = y0 + i * lh, w = cx.measureText(l).width;
      if (st.estilo === 'rosa') { cx.fillStyle = '#ff2fb3'; cx.fillRect(W / 2 - w / 2 - 22, y - 38, w + 44, 74); cx.fillStyle = '#fff'; cx.fillText(l, W / 2, y + 3); }
      else { cx.lineWidth = 12; cx.lineJoin = 'round'; cx.strokeStyle = '#000'; cx.strokeText(l, W / 2, y); cx.fillStyle = st.estilo === 'amarelo' ? '#ffe14d' : '#fff'; cx.fillText(l, W / 2, y); }
    });
  }
  const r = (st.rodape || '').trim();
  if (r) { cx.font = `600 30px Inter, Arial, sans-serif`; cx.textAlign = 'center'; cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fillText(r, W / 2, H - 120); }
}
function loop() { desenha(); raf = requestAnimationFrame(loop); }

/* ---------- Carregar vídeo ---------- */
function abrir(file) {
  if (!file) return;
  if (st.url) URL.revokeObjectURL(st.url);
  st.file = file; st.url = URL.createObjectURL(file); st.momentos = [];
  vid = document.createElement('video'); vid.playsInline = true; vid.preload = 'auto'; vid.src = st.url; vid.muted = true;
  vid.onloadedmetadata = () => {
    st.dur = vid.duration || 0; st.a = 0; st.b = Math.min(st.dur, 30);
    ['#esa', '#esb'].forEach(s => { const el = $(s); el.max = st.dur.toFixed(1); });
    $('#esa').value = st.a; $('#esb').value = st.b; syncT();
    $('#esopen').classList.add('hide'); $('#esctrl').classList.remove('hide'); $('#espanel').classList.remove('dim-panel');
    vid.currentTime = 0.1;
  };
  vid.onseeked = desenha; vid.onloadeddata = desenha;
  vid.onerror = () => toast('Esse vídeo não abriu. Tente um MP4 ou MOV.');
  $('#esmom').innerHTML = '';
}
function syncT() {
  $('#esat').textContent = fmtT(st.a); $('#esbt').textContent = fmtT(st.b); $('#eslen').textContent = fmtT(st.b - st.a);
}

/* ---------- Momentos fortes (energia do áudio) ---------- */
async function momentos() {
  if (!st.file) return toast('Abra um vídeo primeiro');
  if (st.file.size > 450 * 1048576) return toast('Vídeo grande demais para analisar no celular (máx. 450 MB). Marque o trecho na mão.');
  const box = $('#esmom'); box.innerHTML = `<p class="es-tip">Ouvindo o vídeo e procurando gritos, risadas e ação...</p>`;
  try {
    const buf = await st.file.arrayBuffer();
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new Ctx(1, 8000, 8000);
    const audio = await new Promise((res, rej) => { const p = ctx.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); });
    const d = audio.getChannelData(0), sr = audio.sampleRate, passo = Math.floor(sr / 2), n = Math.floor(d.length / passo);
    const rms = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0; for (let j = i * passo, e = j + passo; j < e; j += 4) s += d[j] * d[j]; rms[i] = Math.sqrt(s / (passo / 4)); }
    const med = [...rms].sort((x, y) => x - y)[Math.floor(n / 2)] || 0.0001;
    const L = Math.min(60, Math.max(20, Math.round(Math.min(40, st.dur / 4)))) * 2; // janelas em meios-segundos
    const cand = [];
    for (let i = 0; i + L <= n; i += 2) { let s = 0, pk = 0; for (let k = i; k < i + L; k++) { s += rms[k]; if (rms[k] > pk) pk = rms[k]; } cand.push([s / L / med + 0.4 * pk / med, i]); }
    cand.sort((x, y) => y[0] - x[0]);
    const esc5 = [];
    for (const [sc, i] of cand) { if (esc5.every(([, j]) => Math.abs(i - j) >= L)) esc5.push([sc, i]); if (esc5.length >= 5) break; }
    esc5.sort((x, y) => x[1] - y[1]);
    st.momentos = esc5.map(([sc, i]) => ({ a: i / 2, b: Math.min(st.dur, (i + L) / 2), sc }));
    box.innerHTML = st.momentos.length ? `<p class="es-tip">Toque num momento para usar:</p><div class="es-chips">${st.momentos.map((m, k) => `<button data-mo="${k}">${fmtT(m.a)} a ${fmtT(m.b)}</button>`).join('')}</div>` : `<p class="es-tip">Não achei trechos fortes. Marque o trecho na mão.</p>`;
  } catch (e) {
    console.error(e); box.innerHTML = `<p class="es-tip">Não consegui analisar o som deste vídeo neste aparelho. Marque o trecho na mão, assistindo.</p>`;
  }
}

/* ---------- Gravação ---------- */
function tipoSaida() {
  const ts = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return ts.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
}
let actx, src, dest;
const dbg = m => { (window.__esDbg = window.__esDbg || []).push(Date.now() % 100000 + ' ' + m); };
async function gravar(seg) {
  dbg('inicio');
  if (!window.MediaRecorder || !cv.captureStream) throw new Error('sem suporte');
  const tipo = tipoSaida();
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') await Promise.race([actx.resume(), new Promise(r => setTimeout(r, 1500))]);
  dbg('audio ' + actx.state);
  if (!src || src.mediaElement !== vid) { src = actx.createMediaElementSource(vid); dest = actx.createMediaStreamDestination(); src.connect(dest); }
  vid.muted = false;
  const stream = new MediaStream([...cv.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const rec = new MediaRecorder(stream, tipo ? { mimeType: tipo, videoBitsPerSecond: 6e6, audioBitsPerSecond: 160e3 } : undefined);
  const parts = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); };
  st.gravando = true;
  await new Promise(r => { const f = () => { vid.removeEventListener('seeked', f); r(); }; vid.addEventListener('seeked', f); setTimeout(f, 1500); vid.currentTime = seg.a + 0.001; });
  dbg('seek ok');
  rec.start(500);
  await vid.play();
  dbg('play');
  await new Promise(res => {
    const iv = setInterval(() => {
      const p = (vid.currentTime - seg.a) / (seg.b - seg.a);
      const bar = $('#esbar'); if (bar) bar.style.width = Math.min(100, p * 100) + '%';
      if (vid.currentTime >= seg.b || vid.ended || vid.paused || !st.gravando) { clearInterval(iv); vid.pause(); res(); }
    }, 100);
  });
  dbg('fim trecho');
  await new Promise(r => { rec.onstop = r; try { rec.requestData(); rec.stop(); } catch (e) { r(); } setTimeout(r, 3000); });
  dbg('parado ' + parts.length);
  vid.muted = true; st.gravando = false;
  const ext = (rec.mimeType || tipo).includes('mp4') ? 'mp4' : 'webm';
  return { blob: new Blob(parts, { type: (rec.mimeType || tipo || 'video/webm').split(';')[0] }), ext };
}
async function gerar(lista) {
  if (!st.file) return toast('Abra um vídeo primeiro');
  const prog = $('#esprog'), out = $('#esout');
  prog.classList.remove('hide'); $('#esgo').disabled = true; $('#esfila').disabled = true;
  const feitos = [];
  try {
    for (let i = 0; i < lista.length; i++) {
      const s = lista[i]; st.gancho = s.g; st.estilo = s.e; st.modo = s.m;
      const r = await gravar(s);
      feitos.push({ ...r, nome: `corte-vice-${String(i + 1).padStart(2, '0')}.${r.ext}`, s });
    }
    out.innerHTML = feitos.map((f, i) => {
      const u = URL.createObjectURL(f.blob);
      return `<div class="es-res"><video src="${u}" controls playsinline></video><div><b>Corte ${i + 1} pronto</b><span>${fmtT(f.s.b - f.s.a)} · ${(f.blob.size / 1048576).toFixed(1)} MB · ${f.ext.toUpperCase()}</span><a class="btn btn-p btn-s" href="${u}" download="${f.nome}">${ic('down')}Salvar vídeo</a>${navigator.canShare ? `<button class="btn btn-g btn-s" data-share="${i}">${ic('play')}Enviar para o TikTok, Instagram...</button>` : ''}</div></div>`;
    }).join('') + (feitos.some(f => f.ext === 'webm') ? `<p class="es-tip">Seu navegador gerou em WebM. TikTok e YouTube aceitam. Se o Instagram recusar, abra no CapCut e exporte em MP4.</p>` : '');
    window.__esFeitos = feitos;
    st.fila = [];
    renderFila();
    toast(feitos.length > 1 ? `${feitos.length} cortes prontos` : 'Corte pronto');
    out.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) {
    console.error(e);
    out.innerHTML = `<div class="alert">${ic('shield')}<span>Este navegador não consegue gerar vídeo. No iPhone, use o Safari atualizado. No Android, use o Chrome atualizado. No computador, use o Chrome ou o Edge.</span></div>`;
  } finally {
    prog.classList.add('hide'); $('#esgo').disabled = false; $('#esfila').disabled = false; st.gravando = false;
  }
}
function atual() { return { a: st.a, b: st.b, g: st.gancho, e: st.estilo, m: st.modo }; }
function renderFila() {
  const b = $('#esfilabox'); if (!b) return;
  b.innerHTML = st.fila.length ? `<div class="es-fila"><b>${st.fila.length} trecho(s) na fila</b>${st.fila.map((f, i) => `<div><span>${fmtT(f.a)} a ${fmtT(f.b)} · ${esc(f.g || 'sem gancho')}</span><button data-rm="${i}" aria-label="Remover">${ic('x')}</button></div>`).join('')}<button class="btn btn-p" id="esall" style="width:100%">${ic('down')}Gerar os ${st.fila.length} cortes da fila</button></div>` : '';
}

function bind() {
  cv = $('#escv'); if (!cv) return;
  cx = cv.getContext('2d');
  if (filtroOk === null) { try { cx.filter = 'blur(2px)'; filtroOk = cx.filter === 'blur(2px)'; cx.filter = 'none'; } catch { filtroOk = false; } }
  cancelAnimationFrame(raf); loop();
  if (document.fonts && document.fonts.load) document.fonts.load('64px Anton').catch(() => {});
  if (st.file && !vid) abrir(st.file);
  const pick = e => abrir(e.target.files[0]);
  $('#esfile').onchange = pick; $('#esfile2').onchange = pick;
  $('#esa').oninput = e => { st.a = Math.min(+e.target.value, st.b - 3); e.target.value = st.a; if (vid) vid.currentTime = st.a; syncT(); };
  $('#esb').oninput = e => { st.b = Math.max(+e.target.value, st.a + 3); e.target.value = st.b; if (vid) vid.currentTime = st.b; syncT(); };
  $('#esg').oninput = e => { st.gancho = e.target.value; };
  $('#esrod').oninput = e => { st.rodape = e.target.value; save('canal_nome', e.target.value.replace(/^@/, '')); };
  $('#esestilo').value = st.estilo; $('#esestilo').onchange = e => { st.estilo = e.target.value; };
  const v = $('#view');
  v.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'esplay') { if (!vid) return; if (!vid.paused) { vid.pause(); return; } vid.currentTime = st.a; vid.muted = false; await vid.play().catch(() => {}); const stop = () => { if (vid.currentTime >= st.b || vid.paused) { vid.pause(); vid.muted = true; } else requestAnimationFrame(stop); }; stop(); }
    if (b.id === 'esmarkA' && vid) { st.a = Math.min(vid.currentTime, st.b - 3); $('#esa').value = st.a; syncT(); toast('Início marcado'); }
    if (b.id === 'esmarkB' && vid) { st.b = Math.max(vid.currentTime, st.a + 3); $('#esb').value = st.b; syncT(); toast('Fim marcado'); }
    if (b.id === 'esauto') momentos();
    if (b.id === 'esdemo') { e.preventDefault(); b.textContent = 'Carregando...'; const bl = await fetch('assets/demo.mp4').then(r => r.blob()); abrir(new File([bl], 'exemplo.mp4', { type: 'video/mp4' })); return; }
    if (b.dataset.mo) { const m = st.momentos[+b.dataset.mo]; st.a = m.a; st.b = m.b; $('#esa').value = st.a; $('#esb').value = st.b; syncT(); if (vid) vid.currentTime = st.a; $$('#esmom button').forEach(x => x.classList.toggle('on', x === b)); }
    if (b.id === 'esgrand') { const all = Object.values(C.ganchos).flat(); st.gancho = all[Math.floor(Math.random() * all.length)]; $('#esg').value = st.gancho; }
    if (b.dataset.m) { st.modo = b.dataset.m; $$('#esmodo button').forEach(x => x.classList.toggle('on', x === b)); }
    if (b.id === 'esgo') gerar([atual()]);
    if (b.id === 'esfila') { if (!st.file) return toast('Abra um vídeo primeiro'); st.fila.push(atual()); renderFila(); toast('Trecho guardado. Escolha o próximo.'); }
    if (b.dataset.rm) { st.fila.splice(+b.dataset.rm, 1); renderFila(); }
    if (b.id === 'esall') gerar(st.fila.slice());
    if (b.dataset.share) { const f = window.__esFeitos[+b.dataset.share]; const file = new File([f.blob], f.nome, { type: f.blob.type }); if (navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'Corte Vice City' }).catch(() => {}); else toast('Use o botão Salvar vídeo'); }
  };
  renderFila();
}

window.ESTUDIO = { view, bind, parar: () => { cancelAnimationFrame(raf); if (vid) vid.pause(); if (st) st.gravando = false; } };
})();
