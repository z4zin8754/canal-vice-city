/* Canal Vice City · bônus e extras */
(function () {
'use strict';
const A = window.CVCAPP, C = window.CONTENT, CFG = window.CVC;
const { ic, esc, copy, toast, load, save, can, lockCard, thumb, dl } = A;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const B = {};
const ROBO_ZIP = '1vVoECOc3iAuO6j8w1YFRNsaZxKVO4fDG';

const IMG = k => `assets/img/${k}.webp`;
const hero = (kick, t1, t2, lead, img = 'login', extra = '') =>
  `<section class="hx rv"><img class="bg" src="${IMG(img)}" alt=""><div class="in"><span class="kick">${kick}</span><h1 style="margin-top:14px"><span class="t1 chrome">${t1}</span><span class="t2 brush">${t2}</span></h1><p class="lead">${lead}</p>${extra}</div></section>`;
const doc = (chs) => `<div class="doc"><nav class="toc">${chs.map(([id, t]) => `<a href="#${id}" data-toc="${id}">${t}</a>`).join('')}</nav><div>${chs.map(([id, t, body]) => `<section class="chapter rv" id="${id}"><h2 class="h2">${t}</h2>${body}</section>`).join('')}</div></div>`;
const chk = (key, t, d = '') => { const on = !!load('checks', {})[key]; return `<label class="chk ${on ? 'done' : ''}"><input type="checkbox" data-chk="${key}" ${on ? 'checked' : ''}><span><b>${t}</b>${d ? `<span>${d}</span>` : ''}</span></label>`; };
const progresso = (keys) => { const c = load('checks', {}); const n = keys.filter(k => c[k]).length; return `<div class="row" style="margin-top:14px"><div class="prog" style="flex:1"><i style="width:${Math.round(n / keys.length * 100)}%"></i></div><b style="font-size:13px">${n}/${keys.length}</b></div>`; };
const copyBtn = (txt, label = 'Copiar') => `<button class="btn btn-g btn-xs" data-cp="${esc(txt)}">${label}</button>`;

/* =====================================================================
   CANAL DO ZERO
   ===================================================================== */
const NICHOS = [
  ['curiosidades', 'Detalhes e curiosidades', 'Easter eggs, detalhes do mapa, "você não viu isso". Ótimo para comentário e salvamento.'],
  ['humor', 'Humor e memes', 'Física maluca, polícia implacável, NPCs. Alto compartilhamento.'],
  ['lives', 'Lives e streamers', 'Os melhores momentos de streamers. Ótimo para virar serviço de cortes.'],
  ['noticias', 'Notícias e atualizações', 'O que mudou, o que vem. Cresce rápido em semanas de atualização.'],
  ['comparacao', 'GTA 5 x GTA 6', 'Antes e depois, evolução. Funciona para quem chegou agora no jogo.']
];
const NOMES = { pre: ['Central', 'Vice', 'Leonida', 'Clipes', 'Cortes', 'Mundo', 'Zona', 'Rota', 'Base', 'Arquivo', 'Diário', 'Radar'], mid: ['GTA 6', 'Vice City', 'GTA VI', 'do GTA', 'Leonida', 'Ocean Drive'], suf: ['BR', 'Brasil', 'Oficial', 'Clips', 'Daily', 'TV', 'News', 'HQ', ''] };
function nomesGerar(base = '') {
  const out = new Set(); const r = () => Math.random();
  const p = a => a[Math.floor(r() * a.length)];
  while (out.size < 12) {
    const t = Math.floor(r() * 4);
    let n = t === 0 ? `${p(NOMES.pre)} ${p(NOMES.mid)}` : t === 1 ? `${p(NOMES.mid)} ${p(NOMES.suf)}` : t === 2 ? `${p(NOMES.pre)} ${p(NOMES.mid)} ${p(NOMES.suf)}` : `${p(NOMES.mid)} ${p(['Cortes', 'Clipes', 'Momentos', 'Detalhes', 'Memes'])}`;
    if (base) n = Math.random() < .5 ? `${base} ${p(NOMES.mid)}` : `${p(NOMES.pre)} ${base}`;
    out.add(n.replace(/\s+/g, ' ').trim());
  }
  return [...out];
}
const bios = n => ({
  tiktok: `${n} | Cortes diários de GTA 6\nO melhor de Vice City todo dia\nSegue pra não perder a próxima`,
  reels: `${n}\nCortes de GTA 6 todo dia\nDetalhes, memes e os melhores momentos de Vice City\nNovo vídeo todos os dias`,
  shorts: `Bem-vindo ao ${n}: os melhores cortes de GTA 6, todo dia.\nCuriosidades, memes, momentos insanos e tudo de Vice City e Leonida.\nInscreva-se e ative o sininho para não perder nenhum vídeo.`,
  kwai: `${n} · GTA 6 todo dia\nCortes, memes e curiosidades de Vice City`,
  facebook: `${n} é a página de cortes de GTA 6. Todo dia: os melhores momentos, curiosidades e memes de Vice City. Siga para acompanhar.`
});
const PERFIS = {
  tiktok: ['Baixe o TikTok e crie a conta com e-mail (não use número já ligado a outra conta antiga).', 'Use conta pessoal: o Programa de Recompensas exige conta pessoal e maior de 18 anos.', 'Coloque nome, @ igual ao nome do canal, foto e bio.', 'Em Configurações → Conta, deixe a conta pública.', 'Siga 10 perfis grandes de GTA e assista a vídeos do nicho por 10 minutos antes do 1º post (o algoritmo aprende seu interesse).'],
  shorts: ['Entre no YouTube com uma conta Google e toque em "Criar um canal".', 'Use o nome do canal e crie um @ igual.', 'Suba a foto (logo) e o banner (use o prompt de banner na aba Ferramentas).', 'Cole a descrição pronta e adicione palavras-chave: GTA 6, Vice City, cortes GTA.', 'Verifique o canal com o celular em youtube.com/verify (libera recursos extras).'],
  reels: ['Crie a conta no Instagram com o nome do canal.', 'Mude para conta profissional → Criador (Configurações → Tipo de conta).', 'Escolha a categoria "Criador de vídeos games" ou "Gamer".', 'Coloque foto, bio pronta e o link (sua página ou link na bio).', 'Crie 3 destaques: Melhores · Memes · Novidades.'],
  kwai: ['Baixe o Kwai e crie a conta.', 'Use o mesmo nome e foto dos outros perfis.', 'Cole a bio pronta.', 'Confira no app a área de criadores para ver campanhas disponíveis.'],
  facebook: ['No Facebook, vá em Páginas → Criar nova página.', 'Nome do canal e categoria "Criador de vídeo games".', 'Foto e capa com as artes do canal.', 'Ative o modo profissional e confira o Painel profissional → Monetização.']
};
B.canal = () => {
  const nm = load('canal_nome', '');
  const keys = ['canal_nicho', 'canal_nome', 'canal_bio', 'canal_logo', 'canal_perfil', 'canal_posts', 'canal_agenda'];
  return hero(`${ic('user')} Bônus 2`, 'Canal do', 'zero', 'Em menos de 1 hora você sai com nome, bio, logo com IA e o perfil configurado em cada rede. Marque cada etapa e acompanhe o progresso.', 'canal', progresso(keys)) + doc([
    ['cz1', '1. Escolha seu recorte', `<p class="mut">Canal com um assunto claro cresce mais rápido: o algoritmo entende para quem mostrar. Escolha um recorte principal (você pode misturar depois).</p>
      <div class="grid2" style="margin-top:14px">${NICHOS.map(([k, t, d]) => `<button class="qop ${load('canal_nicho_v', '') === k ? 'on' : ''}" data-nicho="${k}"><span class="ck"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-10"/></svg></span><span><b>${t}</b><small>${d}</small></span></button>`).join('')}</div>`],
    ['cz2', '2. Nome do canal', `<p class="mut">Curto, fácil de falar e com GTA 6 ou Vice City no nome (ajuda na busca). Gere quantas vezes quiser.</p>
      <div class="row" style="margin-top:14px"><input class="input" id="nmbase" placeholder="Opcional: uma palavra sua (ex.: seu apelido)" style="flex:1;min-width:200px"><button class="btn btn-p" id="nmgo">${ic('wand')}Gerar nomes</button></div>
      <div class="row" id="nmout" style="margin-top:12px"></div>
      <label class="field"><span>Nome escolhido</span><input class="input" id="nmsel" value="${esc(nm)}" placeholder="Digite ou toque num nome acima"></label>`],
    ['cz3', '3. Bio pronta', `<p class="mut">Bio diz em 2 segundos o que a pessoa vai encontrar. Copie a da sua rede.</p><div id="biosbox" style="display:grid;gap:10px;margin-top:12px"></div>`],
    ['cz4', '4. Logo e foto de perfil com IA', `<p class="mut">Abra o Gemini (gemini.google.com) ou o ChatGPT no celular, cole um prompt e peça a imagem. Quer seu rosto na logo? Use o prompt 1 e anexe uma foto.</p>
      <div class="grid2" style="margin-top:14px">${C.logos.slice(0, 4).map(l => logoCard(l, nm)).join('')}</div>
      <a class="btn btn-g btn-s" href="#/ferramentas#fe1" style="margin-top:12px">Ver os ${C.logos.length} estilos de logo, banner e capa</a>
      ${chk('canal_logo', 'Logo e foto prontas')}`],
    ['cz5', '5. Crie os perfis', `<p class="mut">Siga o passo a passo das redes que você vai usar. Use o mesmo nome e a mesma foto em todas.</p>
      ${Object.entries(PERFIS).map(([k, passos]) => `<div class="card" style="margin-top:12px;padding:16px"><div class="row"><span class="pill" style="color:${C.plats[k].cor}">${C.plats[k].nome}</span></div><ol class="ul" style="margin-top:10px">${passos.map(p => `<li>${ic('check')}<span>${esc(p)}</span></li>`).join('')}</ol></div>`).join('')}
      ${chk('canal_perfil', 'Perfis criados e configurados', 'Sobe uma estrela no seu nível de procurado')}`],
    ['cz6', '6. Os 3 primeiros posts', `<ul class="ul"><li>${ic('check')}<span>Poste 3 vídeos no primeiro dia: um meme, uma curiosidade e um corte. Assim você descobre rápido o que seu público prefere.</span></li><li>${ic('check')}<span>Fixe no topo do perfil o vídeo que melhor apresenta o canal.</span></li><li>${ic('check')}<span>Responda todos os comentários na primeira hora.</span></li><li>${ic('check')}<span>Nunca poste vídeo com marca d'água de outra rede (TikTok no Reels, por exemplo): derruba o alcance.</span></li></ul>
      <a class="btn btn-p btn-s" href="#/recarga" style="margin-top:12px">${ic('film')}Escolher meus 3 vídeos</a>${chk('canal_posts', 'Primeiros 3 posts no ar')}`],
    ['cz7', '7. Agende o mês', `<p class="mut">Com os perfis prontos, gere sua agenda e use o agendador gratuito de cada rede para programar a semana inteira de uma vez.</p>
      <div class="grid3" style="margin-top:12px">${[['Reels e Facebook', 'Meta Business Suite (app ou business.facebook.com) → Planejador → Criar Reel → Agendar.'], ['TikTok', 'TikTok Studio no computador (tiktok.com/tiktokstudio) → Enviar → Agendar. No celular, salve como rascunho e publique no horário.'], ['YouTube Shorts', 'YouTube Studio → Enviar vídeo → Visibilidade → Programar.']].map(([t, d]) => `<div class="statc"><b style="font-size:18px">${t}</b><span>${d}</span></div>`).join('')}</div>
      <a class="btn btn-p btn-s" href="#/agenda" style="margin-top:12px">${ic('cal')}Gerar minha agenda</a>${chk('canal_agenda', 'Primeira semana agendada')}`]
  ]);
};
function logoCard(l, nome) {
  const p = l.p.replace(/\[NOME DO SEU CANAL\]/g, nome || '[NOME DO SEU CANAL]');
  const img = `assets/logos/logo${l.n}.webp`;
  return `<div class="prompt"><img src="${img}" alt="" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:14px;margin-bottom:12px;box-shadow:0 0 0 1px rgba(255,47,179,.3)"><div class="row"><b>Estilo ${l.n} · ${esc(l.titulo)}</b><span class="sp"></span>${copyBtn(p, 'Copiar prompt')}</div><p>${esc(p)}</p><p class="dim" style="font-size:12px;margin-top:8px">Exemplo gerado com o nome "${esc(l.ex)}". O seu sai com o nome do seu canal.</p></div>`;
}
function bindCanal() {
  const v = $('#view');
  const nm = () => $('#nmsel')?.value.trim() || 'Seu Canal';
  const renderBios = () => { const b = bios(nm()); $('#biosbox').innerHTML = Object.entries(b).map(([k, t]) => `<div class="prompt"><div class="row"><span class="pill" style="color:${C.plats[k].cor}">${C.plats[k].nome}</span><span class="sp"></span>${copyBtn(t)}</div><p style="white-space:pre-wrap">${esc(t)}</p></div>`).join('') + chk('canal_bio', 'Bio colocada no perfil'); };
  renderBios();
  $('#nmgo').onclick = () => { $('#nmout').innerHTML = nomesGerar($('#nmbase').value.trim()).map(n => `<button class="chip" data-nm="${esc(n)}">${esc(n)}</button>`).join(''); };
  $('#nmsel').oninput = e => { save('canal_nome', e.target.value.trim()); const c = load('checks', {}); c.canal_nome = !!e.target.value.trim(); save('checks', c); renderBios(); };
  v.addEventListener('click', e => {
    const b = e.target.closest('[data-nm],[data-nicho]'); if (!b) return;
    if (b.dataset.nm) { $('#nmsel').value = b.dataset.nm; $('#nmsel').dispatchEvent(new Event('input')); toast('Nome escolhido'); }
    if (b.dataset.nicho) { save('canal_nicho_v', b.dataset.nicho); const c = load('checks', {}); c.canal_nicho = true; save('checks', c); $$('[data-nicho]').forEach(x => x.classList.toggle('on', x === b)); }
  });
}

/* =====================================================================
   MAPA DA GRANA
   ===================================================================== */
B.grana = () => hero(`${ic('coin')} Bônus 3`, 'Mapa da', 'grana', `${C.rotas.length} formas de fazer dinheiro com o canal, com os requisitos de cada uma, o passo a passo para ativar e o que evitar. Conferido em novembro de 2026.`, 'grana') + `
  <section class="card glow sec rv"><div class="row"><div style="flex:1;min-width:240px"><h2 class="h3">Qual caminho está aberto para você hoje?</h2><p class="mut" style="margin-top:6px;font-size:14px">Diga onde você está e o mapa mostra as rotas disponíveis agora.</p></div></div>
    <div class="grid3" style="margin-top:14px"><label class="field"><span>Seguidores no TikTok</span><input class="input" type="number" id="gtk" min="0" placeholder="0"></label><label class="field"><span>Inscritos no YouTube</span><input class="input" type="number" id="gyt" min="0" placeholder="0"></label><label class="field"><span>Views no último mês (todas as redes)</span><input class="input" type="number" id="gvw" min="0" placeholder="0"></label></div>
    <div id="gout" style="margin-top:14px"></div></section>
  <section class="sec"><div class="sec-h"><div><h2 class="h2">As rotas</h2><p>Comece pelas que pagam antes de ter audiência e ative as outras conforme cresce.</p></div></div>
  <div class="grid2">${C.rotas.map(r => `<article class="route rv" id="${r.id}" style="--rc:${r.cor}"><div class="row"><h3 class="h3">${r.nome}</h3></div><div class="req"><span class="pill" style="color:${r.cor}">${r.quando}</span><span class="pill">${r.seguidores}</span></div><p class="mut" style="font-size:14.5px">${r.como}</p><ol class="ul" style="margin-top:12px">${r.passos.map(p => `<li>${ic('check')}<span>${esc(p)}</span></li>`).join('')}</ol><div class="alert">${ic('shield')}<span>${esc(r.alerta)}</span></div></article>`).join('')}</div></section>
  <section class="card glow sec rv"><span class="kick">${ic('star', 'f')} Missão 6 da Rota Vice City</span><h2 class="h3" style="margin-top:12px">Ative sua primeira fonte de renda</h2><p class="mut" style="margin-top:6px;font-size:14px">Escolha uma rota que já está aberta para você (veja acima), siga o passo a passo e marque aqui quando ativar. Isso acende a sexta estrela.</p>${chk('grana_ativa', 'Ativei minha primeira fonte de renda', 'Inscrição numa campanha, primeiro cliente de cortes, link de afiliado ativo ou programa da plataforma')}</section>
  <section class="card sec rv"><h2 class="h3">As 6 regras de ouro para não perder a monetização</h2><div class="grid2" style="margin-top:14px">${[
    ['Deixe o corte original', 'As plataformas pagam por conteúdo com contribuição sua: texto na tela, narração, reação ou edição. Repostar igual a outros perfis não monetiza.'],
    ['Cuidado com a música', 'O rádio do jogo pode gerar reivindicação de direitos no YouTube. Prefira trechos em que a voz domina o áudio.'],
    ['Violência só depois do começo', 'Violência forte nos primeiros segundos limita os anúncios. Abra com o gancho, não com o tiro.'],
    ['Sem spoiler de história', 'Final do jogo e cenas de cinema isoladas podem ser removidos pela Rockstar e afastam o público.'],
    ['Sem marca d\'água de outra rede', 'Vídeo com logo do TikTok no Reels ou no Shorts perde alcance.'],
    ['Constância vence viral', 'Postar todo dia no mesmo nicho ensina o algoritmo para quem mostrar. Um viral sem constância some.']
  ].map(([t, d]) => `<div class="statc"><b style="font-size:18px">${t}</b><span>${d}</span></div>`).join('')}</div></section>
  <section class="card sec rv"><h2 class="h3">Checklist antes de postar</h2>${['Confirmei que o vídeo não tem marca d\'água de outra rede', 'O gancho aparece nos 3 primeiros segundos', 'Revisei o som ligado e desligado (legenda legível)', 'O enquadramento está certo para a rede', 'Título fiel ao vídeo e poucas hashtags relevantes', 'Vou responder os comentários na primeira hora'].map((t, i) => chk('pub_' + i, t)).join('')}</section>
  <p class="note sec">Fontes: Central de Ajuda do YouTube (requisitos do Programa de Parcerias e política de conteúdo reutilizado), Suporte do TikTok (Programa de Recompensas do Criador), Meta (Monetização de Conteúdo do Facebook), documentação de campanhas de clipping (Whop). Requisitos mudam: confira sempre no painel da sua conta. Nenhuma rota garante ganhos.</p>`;
function bindGrana() {
  const f = () => {
    const tk = +($('#gtk').value || 0), yt = +($('#gyt').value || 0), vw = +($('#gvw').value || 0);
    const ok = ['clipping', 'servico', 'afiliado', 'kwai'];
    if (tk >= 10000 && vw >= 100000) ok.push('tiktok');
    if (yt >= 1000) ok.push('youtube');
    const falta = [];
    if (!ok.includes('tiktok')) falta.push(`TikTok: faltam ${Math.max(0, 10000 - tk).toLocaleString('pt-BR')} seguidores${vw < 100000 ? ' e ' + (100000 - vw).toLocaleString('pt-BR') + ' views no mês' : ''}`);
    if (!ok.includes('youtube')) falta.push(`YouTube: faltam ${Math.max(0, 1000 - yt).toLocaleString('pt-BR')} inscritos (mais 10 milhões de views de Shorts em 90 dias)`);
    $('#gout').innerHTML = `<div class="row">${ok.map(id => { const r = C.rotas.find(x => x.id === id); return `<a class="chip on" href="#/grana#${id}" style="background:${r.cor};border-color:${r.cor};color:#140a24">${ic('check')}${r.nome}</a>`; }).join('')}</div>${falta.length ? `<ul class="ul" style="margin-top:12px">${falta.map(x => `<li>${ic('clock')}<span>${esc(x)}</span></li>`).join('')}</ul>` : ''}`;
  };
  ['#gtk', '#gyt', '#gvw'].forEach(s => $(s).oninput = f); f();
}

/* =====================================================================
   KIT REMIX
   ===================================================================== */
const GLAB = { curiosidade: 'Curiosidade', meme: 'Meme', corte: 'Corte', teoria: 'Teoria', react: 'React', noticia: 'Notícia', comparacao: 'Comparação', opiniao: 'Opinião' };
B.remix = () => hero(`${ic('wand')} Bônus 4`, 'Kit', 'Remix', `${C.totalGanchos} ganchos testados no nicho, um gerador de títulos, legendas e hashtags, e fórmulas de roteiro para o seu post sair com a sua cara.`, 'remix') + `
  <section class="card glow sec rv" id="gen"><h2 class="h3">Gerador de títulos e legendas</h2>
    <div class="grid3" style="margin-top:12px"><label class="field"><span>Tema do vídeo</span><input class="input" id="rmt" placeholder="Ex.: perseguição em Vice Beach"></label><label class="field"><span>Formato</span><select class="input" id="rmf">${Object.entries(GLAB).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label><label class="field"><span>Rede</span><select class="input" id="rmp">${Object.entries(C.plats).map(([k, p]) => `<option value="${k}">${p.nome}</option>`).join('')}</select></label></div>
    <div class="row" style="margin-top:14px"><button class="btn btn-p" id="rmgo">${ic('wand')}Gerar</button></div><div id="rmout" style="margin-top:14px"></div></section>
  <section class="sec"><div class="sec-h"><div><h2 class="h2">${C.totalGanchos} ganchos</h2><p>Use como texto na tela nos 3 primeiros segundos ou como primeira frase da narração.</p></div></div>
    <div class="chips row" id="gcats" style="margin-bottom:12px"><button class="chip on" data-gc="">Todos</button>${Object.entries(GLAB).map(([k, v]) => `<button class="chip" data-gc="${k}">${v} · ${C.ganchos[k].length}</button>`).join('')}</div>
    <div class="grid2" id="glist"></div></section>
  <section class="sec"><div class="sec-h"><div><h2 class="h2">Fórmulas de roteiro</h2><p>Estruturas prontas para transformar qualquer corte em conteúdo original.</p></div></div>
    <div class="grid3">${C.formulas.map(f => `<div class="card rv"><h3 class="h3" style="font-size:19px">${f.nome}</h3><ol class="ul" style="margin-top:10px">${f.passos.map(p => `<li>${ic('play')}<span>${esc(p)}</span></li>`).join('')}</ol></div>`).join('')}</div></section>
  <section class="grid2 sec">
    <div class="card rv"><h3 class="h3">Chamadas para ação</h3><div style="display:grid;gap:8px;margin-top:12px">${C.ctas.map(c => `<div class="row" style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04)"><span style="flex:1;font-size:14px">${esc(c)}</span>${copyBtn(c)}</div>`).join('')}</div></div>
    <div class="card rv"><h3 class="h3">Mensagens prontas para fechar serviço</h3><div style="display:grid;gap:10px;margin-top:12px">${C.mensagens.map(m => `<div class="prompt"><div class="row"><b>${esc(m.titulo)}</b><span class="sp"></span>${copyBtn(m.t)}</div><p>${esc(m.t)}</p></div>`).join('')}</div></div>
  </section>`;
function bindRemix() {
  const list = gc => $('#glist').innerHTML = Object.entries(C.ganchos).filter(([k]) => !gc || k === gc).flatMap(([k, arr]) => arr.map(g => `<div class="row" style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid var(--line)"><span class="pill">${GLAB[k]}</span><span style="flex:1;font-weight:650;font-size:14px">${esc(g)}</span>${copyBtn(g)}</div>`)).join('');
  list('');
  $('#gcats').onclick = e => { const b = e.target.closest('[data-gc]'); if (!b) return; $$('#gcats .chip').forEach(x => x.classList.toggle('on', x === b)); list(b.dataset.gc); };
  $('#rmgo').onclick = () => {
    const tema = $('#rmt').value.trim() || 'Vice City', f = $('#rmf').value, p = $('#rmp').value;
    const gs = [...C.ganchos[f]].sort(() => Math.random() - .5);
    const tit = [`${gs[0]}`, `${gs[1]} (${tema})`, `GTA 6: ${tema}`, `${tema} no GTA 6 é insano`, `O que ninguém te contou sobre ${tema}`, `${gs[2]} | GTA 6`, `${tema}: ${gs[3]}`, `Testei ${tema} no GTA 6`, `${tema} em 30 segundos`, `Você precisa ver ${tema} no GTA 6`];
    const words = [...new Set(tema.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().match(/[a-z0-9]{4,}/g) || [])].slice(0, 3).map(w => '#' + w);
    const tags = [...C.tagsBase, '#' + GLAB[f].normalize('NFD').replace(/\p{M}/gu, '') + 'GTA', ...words, ...(C.tagsPlat[p] || [])].join(' ');
    const cta = C.ctas[Math.floor(Math.random() * C.ctas.length)];
    const leg = `${gs[0]}\n\n${tema} no GTA 6. ${cta}\n\n${tags}`;
    $('#rmout').innerHTML = `<div class="grid2"><div class="prompt"><div class="row"><b>10 títulos</b></div><div style="display:grid;gap:6px;margin-top:10px">${tit.map(t => `<div class="row"><span style="flex:1;font-size:14px">${esc(t)}</span>${copyBtn(t)}</div>`).join('')}</div></div><div style="display:grid;gap:12px;align-content:start"><div class="prompt"><div class="row"><b>Legenda pronta</b><span class="sp"></span>${copyBtn(leg)}</div><p style="white-space:pre-wrap">${esc(leg)}</p></div><div class="prompt"><div class="row"><b>Hashtags para ${C.plats[p].nome}</b><span class="sp"></span>${copyBtn(tags)}</div><p>${esc(tags)}</p></div></div></div>`;
  };
}

/* =====================================================================
   FERRAMENTAS
   ===================================================================== */
B.ferramentas = () => {
  const nm = load('canal_nome', '');
  return hero(`${ic('bolt')} Ferramentas`, 'Caixa de', 'ferramentas', 'Logos com IA, banner, capas, limpeza do arquivo antes de postar e atalhos para publicar em cada rede.', 'ferramentas') + doc([
    ['fe1', 'Logos com IA', `<p class="mut">Digite o nome do canal e os prompts já saem com ele. São 8 estilos exclusivos do Canal Vice City, cada um com um exemplo pronto.</p><label class="field"><span>Nome do canal</span><input class="input" id="lgn" value="${esc(nm)}" placeholder="Ex.: Central GTA 6"></label><div class="grid2" id="lgbox" style="margin-top:14px"></div>`],
    ['fe2', 'Banner, capa e foto com seu rosto', `<div style="display:grid;gap:12px">${C.promptsExtra.map(p => `<div class="prompt">${p.img ? `<img src="${p.img}" alt="" loading="lazy" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px;margin-bottom:10px">` : ''}<div class="row"><b>${esc(p.titulo)}</b><span class="sp"></span>${copyBtn(p.p.replace('[NOME DO SEU CANAL]', nm || '[NOME DO SEU CANAL]'), 'Copiar prompt')}</div><p>${esc(p.p.replace('[NOME DO SEU CANAL]', nm || '[NOME DO SEU CANAL]'))}</p></div>`).join('')}</div>`],
    ['fe3', 'Limpar informações do vídeo', `<p class="mut">Tira do arquivo MP4 ou MOV informações como título, autor e localização gravadas no vídeo. Tudo acontece no seu aparelho: o vídeo não é enviado para lugar nenhum. A imagem e o som continuam iguais.</p>
      <div class="card" style="margin-top:14px"><input type="file" id="mdf" accept="video/mp4,video/quicktime,.mp4,.mov" class="input"><div class="row" style="margin-top:12px"><button class="btn btn-p" id="mdgo" disabled>${ic('shield')}Gerar cópia limpa</button><span class="dim" id="mdst" style="font-size:13px"></span></div></div>`],
    ['fe4', 'Atalhos para postar', `<div class="grid3">${[['YouTube Studio', 'Subir e programar Shorts', 'https://studio.youtube.com/'], ['TikTok Studio', 'Postar e agendar', 'https://www.tiktok.com/tiktokstudio/upload'], ['Meta Business Suite', 'Agendar Reels e Facebook', 'https://business.facebook.com/'], ['Instagram', 'Publicar Reels', 'https://www.instagram.com/'], ['Google Trends', 'O que estão buscando sobre GTA 6', 'https://trends.google.com/trends/explore?geo=BR&q=GTA%206'], ['CapCut', 'Editor online', 'https://www.capcut.com/editor']].map(([t, d, u]) => `<a class="modc" href="${u}" target="_blank" rel="noopener" style="min-height:110px"><span class="ico">${ic('play')}</span><span class="n" style="font-size:19px">${t}</span><span class="d">${d}</span></a>`).join('')}</div>`]
  ]);
};
function bindFerr() {
  const draw = () => { const n = $('#lgn').value.trim(); save('canal_nome', n); $('#lgbox').innerHTML = C.logos.map(l => logoCard(l, n)).join(''); };
  $('#lgn').oninput = draw; draw();
  let file;
  $('#mdf').onchange = e => { file = e.target.files[0]; $('#mdgo').disabled = !file; $('#mdst').textContent = file ? `${file.name} · ${(file.size / 1048576).toFixed(1)} MB` : ''; };
  $('#mdgo').onclick = async () => {
    if (!file) return;
    if (file.size > 600 * 1048576) { $('#mdst').textContent = 'Arquivo grande demais para o navegador (máx. 600 MB).'; return; }
    $('#mdst').textContent = 'Limpando...';
    const buf = new Uint8Array(await file.arrayBuffer());
    const n = limparMp4(buf);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([buf], { type: file.type || 'video/mp4' })); a.download = file.name.replace(/(\.\w+)$/, '-limpo$1'); a.click();
    $('#mdst').textContent = n ? `Pronto: ${n} bloco(s) de informação removido(s).` : 'Pronto: o arquivo já estava sem essas informações.';
  };
}
// Troca caixas de metadados (udta, meta, ©xyz) por "free" do mesmo tamanho: o vídeo continua válido.
function limparMp4(b) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength); let count = 0;
  const T = (o) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
  const walk = (start, end, depth) => {
    let o = start;
    while (o + 8 <= end) {
      let size = dv.getUint32(o); const type = T(o + 4); let hdr = 8;
      if (size === 1) { size = Number(dv.getBigUint64(o + 8)); hdr = 16; } else if (size === 0) size = end - o;
      if (size < hdr || o + size > end) break;
      if (type === 'udta' || type === 'meta' || type === 'XMP_' || type === 'uuid' && depth > 0) { b[o + 4] = 0x66; b[o + 5] = 0x72; b[o + 6] = 0x65; b[o + 7] = 0x65; count++; }
      else if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(type) && depth < 6) walk(o + hdr, o + size, depth + 1);
      o += size;
    }
  };
  walk(0, b.length, 0);
  return count;
}

/* =====================================================================
   ESTRUTURA DE VENDAS
   ===================================================================== */
B.estrutura = () => {
  if (!can('estrutura')) return lockCard('estrutura', 'A Código do Dinheiro faz parte do plano Completo.');
  const ini = load('primeiro', Date.now());
  const libera = ini + CFG.DIAS_ESTRUTURA * 864e5;
  if (Date.now() < libera && !window.CVC_FORCAR_ESTRUTURA) {
    return hero(`${ic('clock')} Bônus 6 · libera em breve`, 'Código do', 'Dinheiro', `Esse bônus é liberado ${CFG.DIAS_ESTRUTURA} dias depois do seu primeiro acesso. Até lá, foque em colocar o canal no ar: é ele que vai trazer o público para você vender.`, 'estrutura', `<div class="countdown" id="cd" data-t="${libera}" style="justify-content:flex-start"></div><a class="btn btn-p" href="#/rota">${ic('star')}Seguir a Rota Vice City</a>`);
  }
  return hero(`${ic('funnel')} Bônus 6`, 'Código do', 'Dinheiro', 'O mesmo funil que estamos usando para vender o Canal Vice City, aberto para você adaptar ao seu produto e vender para o público do seu canal.', 'estrutura') + `
  <section class="sec"><div class="sec-h"><div><h2 class="h2">O funil em 1 minuto</h2><p>Toque em cada etapa para ver como montamos.</p></div></div>
  <div class="row" id="funil" style="gap:8px">${FUNIL.map((f, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-fu="${i}">${i + 1}. ${f[0]}</button>`).join('')}</div>
  <div class="card glow" id="fubox" style="margin-top:14px"></div></section>` + doc([
    ['es1', 'A oferta', `<p class="mut">Mercado cheio de pack igual não se vence com mais vídeos. Vence com a oferta mais completa e mais fácil de executar.</p><div class="grid2" style="margin-top:14px">${[['Promessa', 'Um resultado claro, em uma frase, sem prometer números. Ex.: "Faça dinheiro com GTA 6 usando só o celular. Sem gravar. Sem editar. Sem aparecer."'], ['Pilha de valor', 'Liste cada entrega com um valor de referência honesto. A soma vira a âncora (no nosso caso, R$ 520 por R$ 19,90).'], ['Dois planos', 'Um plano de entrada barato e um completo, com diferença pequena de preço. O barato faz o completo parecer óbvio.'], ['Garantia', '7 dias incondicional (é lei) mais uma garantia específica da sua oferta. A nossa: se a recarga de uma semana não entrar, devolvemos.'], ['Urgência real', 'Prazo verdadeiro com data (ex.: preço de lançamento até 30/11). Nunca contador falso.'], ['Ascensão', 'Order bump no checkout, upsell de um clique depois da compra e downsell para quem recusar.']].map(([t, d]) => `<div class="statc"><b style="font-size:18px">${t}</b><span>${d}</span></div>`).join('')}</div>`],
    ['es2', 'Modelo da página', `<p class="mut">A ordem dos blocos que usamos, do topo ao rodapé. Cada bloco tem um trabalho.</p><ol class="ul" style="margin-top:12px">${['Topo: promessa + o que recebe + preço + botão, tudo visível sem rolar', 'Benefícios em 4 frases curtas', 'Oportunidade: por que agora (dados reais com fonte)', 'História: o momento que a pessoa perdeu antes', 'Dores: o que trava a pessoa e como você resolve cada uma', 'Comparação: fazer na mão x com o seu produto', 'Método em 3 passos + demonstração interativa', 'O que recebe, com valores', 'Como funciona por dentro (mockup)', 'Faz a conta: preço por unidade', 'Planos', 'Garantia', 'Para quem é (só desejos, sem "não é para você")', 'Perguntas frequentes', 'Fechamento e rodapé com avisos'].map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}</ol><div class="alert">${ic('shield')}<span>Regra de ouro: nunca crie objeção no topo. Nada de explicar o que o produto não é antes de mostrar o que ele é.</span></div>`],
    ['es3', 'Anúncios e criativos', `<p class="mut">Vídeos de 20 a 40 segundos, 9:16, legenda na tela. Estrutura: gancho, problema, método em 3 passos, oferta e "toca em Saiba mais". Anúncio nunca promete ganho em dinheiro.</p><div class="grid2" style="margin-top:14px">${[['Antes x agora', '"Em 2013 você ficou só jogando. Em 2026 dá pra fazer diferente."'], ['Frescor', '"Isso aconteceu essa semana e já está pronto pra postar."'], ['Prova de processo', '"POV: agendei um mês de posts numa tarde." (gravação de tela)'], ['Desafio', '"Do zero ao primeiro post em 60 segundos. Cronometra."'], ['Faz a conta', '"Menos de 1 centavo por vídeo."'], ['Prova real', '"Perfil criado dia 21. Olha onde está hoje." (só com print verdadeiro)']].map(([t, d]) => `<div class="prompt"><b>${t}</b><p>${esc(d)}</p></div>`).join('')}</div>`],
    ['es4', 'Direct automático com palavra-chave', `<p class="mut">No Instagram, quem comenta a palavra recebe o link no direct. Converte muito mais que "link na bio".</p><div style="display:grid;gap:10px;margin-top:14px">${[['Gatilho', 'Comentário com a palavra (ex.: CANAL) em qualquer post ou anúncio.'], ['Mensagem 1', '"Fala! Quer ver como [resultado] usando só o celular?" + botão "Quero ver".'], ['Mensagem 2', 'O link da página com UTM do perfil.'], ['Lembrete (2 h sem clique)', '"O lote dessa semana já saiu e o preço de lançamento vai até [data]: [link]".'], ['Etiquetas', 'Marque quem clicou e quem comprou para não mandar oferta repetida.']].map(([t, d], i) => `<div class="next"><span class="num">${i + 1}</span><span><b style="display:block">${t}</b><span class="mut" style="font-size:13.5px">${esc(d)}</span></span></div>`).join('')}</div>`],
    ['es5', 'Orgânico: a rede de perfis', `<ul class="ul">${['Comece com 2 perfis por rede (Instagram, Shorts, TikTok), cada um com um recorte diferente', 'Cadência: Reels 3 a 5 por dia por perfil, Shorts 5 a 8, TikTok 3 a 5', 'Todo vídeo com legenda e comentário fixado com a chamada', 'A cada 3 vídeos, um com chamada falada ou na tela no final', 'Todo dia: os 3 vídeos com mais views ganham variações com gancho novo e viram candidatos a anúncio', 'Formato que não passa da média do perfil em 3 tentativas sai'].map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}</ul>`],
    ['es6', 'Tráfego pago começando pequeno', `<div style="display:grid;gap:10px">${[['Dias 1 a 3 · validar', '1 campanha de Vendas, orçamento baixo por dia, público aberto (Advantage+), 4 criativos realmente diferentes: os 2 melhores orgânicos + 2 conceitos novos. Não mexa por 72 horas.'], ['Dia 4 em diante · reinvestir', 'A campanha vencedora recebe o lucro do dia anterior. Entram 2 a 3 criativos novos por semana, sempre a partir do que bombou no orgânico.'], ['Regra de corte', 'Anúncio que gastou 1,5 vez o custo por venda alvo sem vender, sai.'], ['Escala', 'Custo por venda dentro do alvo por 2 dias: +30% de orçamento a cada 48 horas. Acima do alvo por 2 dias: volta um degrau.']].map(([t, d]) => `<div class="statc"><b style="font-size:18px">${t}</b><span>${esc(d)}</span></div>`).join('')}</div>`],
    ['es7', 'Calculadora da operação', `<p class="mut">Coloque os seus números e veja quanto pode pagar por venda e quantas vendas precisa para a sua meta.</p><div class="grid3" style="margin-top:14px">${[['cpre', 'Preço médio por venda (R$)', 30], ['ctax', 'Taxas e reembolso (%)', 17], ['croi', 'Retorno desejado (x)', 2], ['cmeta', 'Meta de lucro (R$)', 5000]].map(([id, l, v]) => `<label class="field"><span>${l}</span><input class="input" type="number" id="${id}" value="${v}"></label>`).join('')}</div><div class="grid3" id="cout" style="margin-top:14px"></div>`],
    ['es8', 'Atualizações', `<p class="mut">Conforme testamos, registramos aqui o que mudou e por quê.</p><div class="next" style="margin-top:12px"><span class="num">${ic('clock')}</span><span><b style="display:block">22/11/2026 · Lançamento</b><span class="mut" style="font-size:13.5px">Página no ar, dois planos (R$ 9,90 e R$ 19,90), garantia dupla e preço de lançamento até 30/11.</span></span></div>`]
  ]);
};
const FUNIL = [
  ['Vídeo', 'Cortes postados todo dia nos perfis (Reels, Shorts, TikTok). Cada vídeo leva legenda e comentário fixado com a chamada.'],
  ['Chamada', 'Comentar a palavra-chave (Instagram, com direct automático) ou link na bio (YouTube e TikTok).'],
  ['Página', 'Página de vendas com a oferta completa, dois planos e garantia dupla.'],
  ['Checkout', 'Plano escolhido + order bump. Pix libera na hora; recuperação de Pix gerado e cartão recusado.'],
  ['Upsell', 'Oferta de um clique logo depois da compra. Quem recusa vê um downsell mais barato.'],
  ['Área de membros', 'Entrega imediata no app, com recarga semanal para a pessoa voltar toda semana.'],
  ['Ascensão', 'Bônus liberado no 7º dia e novas ofertas para quem já comprou.']
];
function bindEstrutura() {
  const cd = $('#cd');
  if (cd) {
    const t = +cd.dataset.t; const tick = () => { let s = Math.max(0, Math.floor((t - Date.now()) / 1000)); const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); cd.innerHTML = [[d, 'dias'], [h, 'horas'], [m, 'min']].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join(''); };
    tick(); clearInterval(window.__cdT); window.__cdT = setInterval(() => { if (!document.body.contains(cd)) return clearInterval(window.__cdT); tick(); }, 30000);
    return;
  }
  const fb = $('#fubox'); if (!fb) return;
  const show = i => fb.innerHTML = `<div class="row"><span class="num" style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:var(--sunset);font-family:var(--disp);font-size:22px">${i + 1}</span><h3 class="h3">${FUNIL[i][0]}</h3></div><p class="mut" style="margin-top:10px;font-size:15px">${FUNIL[i][1]}</p><div class="prog" style="margin-top:14px"><i style="width:${(i + 1) / FUNIL.length * 100}%"></i></div>`;
  show(0);
  $('#funil').onclick = e => { const b = e.target.closest('[data-fu]'); if (!b) return; $$('#funil .chip').forEach(x => x.classList.toggle('on', x === b)); show(+b.dataset.fu); };
  const calc = () => {
    const p = +$('#cpre').value || 0, t = +$('#ctax').value || 0, r = +$('#croi').value || 1, m = +$('#cmeta').value || 0;
    const liq = p * (1 - t / 100), cpa = liq / r, lucro = liq - cpa, vendas = lucro > 0 ? Math.ceil(m / lucro) : 0;
    const f = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    $('#cout').innerHTML = [[f(liq), 'você recebe por venda'], [f(cpa), 'custo máximo por venda no anúncio'], [vendas ? vendas.toLocaleString('pt-BR') : '—', 'vendas para bater a meta']].map(([b, s]) => `<div class="statc"><b class="grad" style="font-size:26px">${b}</b><span>${s}</span></div>`).join('');
  };
  ['#cpre', '#ctax', '#croi', '#cmeta'].forEach(s => $(s).oninput = calc); calc();
}

/* =====================================================================
   EXTRAS (bumps, upsell, downsell)
   ===================================================================== */
const EXTRAS = {
  capas: { k: 'capas', t1: 'Kit', t2: 'Capas', lead: 'Capas que fazem o vídeo ser clicado no perfil: textos prontos, prompts de capa com IA e o passo a passo para montar no celular.', cor: '#fb7185' },
  carrossel: { k: 'carrossel', t1: 'Pack', t2: 'Carrossel', lead: 'Carrosséis prontos de curiosidades de GTA 6 para o feed do Instagram: o formato que mais gera salvamento e compartilhamento.', cor: '#facc15' },
  clube: { k: 'clube', img: 'recarga', t1: 'Clube', t2: 'Recarga Vice', lead: 'Vídeos novos sem parar: a recarga continua depois das 12 semanas e você recebe cortes inéditos extras todo mês.', cor: '#2ee6d6' },
  piloto: { k: 'piloto_lite', t1: 'Piloto', t2: 'Automático', lead: 'O canal rodando no automático: Robô de Cortes para transformar lives em cortes, prompts que geram legendas e a agenda do mês, e o passo a passo para agendar tudo de uma vez.', cor: '#c084fc' }
};
const CAPAS = [{"id": "capa1", "t": "Capa Neon Vice", "ex": "NINGUÉM VIU ISSO", "p": "Crie uma capa vertical 9:16 para um vídeo curto de GTA 6. Fundo: avenida beira-mar de uma cidade tropical fictícia à noite, com neon rosa e ciano e um carro esportivo deixando rastro de luz. No terço de cima, o texto “[TEXTO DA CAPA]” enorme em duas linhas, em letras grossas brancas com contorno preto e brilho rosa. Seis estrelas brancas pequenas acima do texto. Contraste alto, leitura instantânea no celular, sem logotipos oficiais."}, {"id": "capa2", "t": "Pôster de ação", "ex": "A POLÍCIA NÃO PERDOA", "p": "Crie uma capa vertical 9:16 no estilo pôster de filme de ação, ambientada numa cidade tropical fictícia ao entardecer: viaturas com sirene vermelha e azul, helicóptero com holofote, céu laranja e roxo. No topo, o texto “[TEXTO DA CAPA]” em letras condensadas brancas gigantes com contorno preto e sombra. Contraste alto, leitura instantânea no celular, sem logotipos oficiais."}, {"id": "capa3", "t": "Antes x depois", "ex": "13 ANOS DE DIFERENÇA", "p": "Crie uma capa vertical 9:16 dividida ao meio na diagonal: a metade de cima com uma cena de cidade em gráfico antigo de videogame, tons frios e granulados; a metade de baixo com a mesma cena em gráfico ultrarrealista, cores vibrantes de pôr do sol e neon. No centro, sobre a divisão, o texto “[TEXTO DA CAPA]” enorme em amarelo com contorno preto grosso. Sem logotipos oficiais."}, {"id": "capa4", "t": "Detalhe escondido", "ex": "3 DETALHES ESCONDIDOS", "p": "Crie uma capa vertical 9:16 com uma cena de praia neon de uma cidade tropical fictícia à noite. Um detalhe pequeno da cena destacado com um círculo vermelho grosso e uma seta vermelha apontando para ele. No terço de cima, o texto “[TEXTO DA CAPA]” em letras grossas brancas com contorno preto e um fundo rosa atrás das palavras. Contraste alto, sem logotipos oficiais."}, {"id": "capa5", "t": "Plantão urgente", "ex": "ISSO MUDOU TUDO", "p": "Crie uma capa vertical 9:16 no estilo plantão de notícia urgente: fundo de skyline neon de uma cidade tropical fictícia à noite, uma faixa vermelha no topo escrita “URGENTE” e, no centro, o texto “[TEXTO DA CAPA]” enorme em letras brancas grossas com contorno preto e brilho magenta. Contraste alto, leitura instantânea no celular, sem logotipos oficiais e sem marcas de emissoras."}];
const IAS = [
  ['Gemini', 'https://gemini.google.com/app', 'A que usamos para criar os exemplos. Escreve bem o texto na imagem e entende português. Peça "Gere uma imagem:" e cole o prompt.', 'Recomendada'],
  ['ChatGPT', 'https://chatgpt.com/', 'Muito bom com texto na imagem. A versão gratuita tem um limite de imagens por dia.', 'Ótima com texto'],
  ['Ideogram', 'https://ideogram.ai/', 'Especialista em imagens com letras e títulos. Boa para capas com muito texto.', 'Texto perfeito'],
  ['Microsoft Designer', 'https://designer.microsoft.com/', 'Gratuito com conta Microsoft. Bom para variações rápidas.', 'Grátis'],
  ['Canva (Magic Media)', 'https://www.canva.com/', 'Gera a imagem e você já ajusta o texto e o tamanho no próprio Canva.', 'Edita junto'],
  ['Leonardo', 'https://leonardo.ai/', 'Imagens muito realistas e estilizadas. Bom para fundos de capa e banners.', 'Mais realista']
];
const CAPAS_TXT = ['NINGUÉM VIU ISSO', 'ESPERA O FINAL', 'GTA 5 x GTA 6', 'ISSO É REAL?', 'O SEGREDO DE VICE CITY', 'NÃO FAÇA ISSO', 'BUG INSANO', 'A POLÍCIA NÃO PERDOA', '3 DETALHES ESCONDIDOS', 'O MELHOR MOMENTO', 'ISSO MUDOU TUDO', 'ROCKSTAR EXAGEROU', 'VOCÊ NÃO SABIA', 'DEU TUDO ERRADO', 'TEORIA INSANA', 'O LUGAR MAIS PERIGOSO', 'PRIMEIRA VEZ NO GTA 6', 'OLHA ESSA FÍSICA', 'ISSO ESTAVA NO TRAILER', '13 ANOS DE DIFERENÇA'];
B.extra = (qs, sub) => {
  const e = EXTRAS[sub]; if (!e) return '';
  if (!can(e.k)) return lockCard(e.k, e.k === 'clube' ? 'Assine o Clube Recarga Vice e continue recebendo vídeos novos toda semana, mesmo depois das 12 semanas. Cancele quando quiser.' : 'Este extra não faz parte da sua compra. Você pode liberar agora pelo mesmo preço da oferta.', e.img || sub);
  if (sub === 'capas') return hero(`${ic('tag')} Extra`, e.t1, e.t2, e.lead, 'capas') + `
  <section class="sec"><div class="steps3"><div><span class="n">1</span><span><b>Escolha um estilo</b><span>Veja os exemplos abaixo e escolha o que combina com o vídeo.</span></span></div><div><span class="n">2</span><span><b>Escreva o texto da capa</b><span>No campo abaixo. Máximo 4 palavras. Os prompts já saem com ele.</span></span></div><div><span class="n">3</span><span><b>Cole numa IA de imagem</b><span>Copie o prompt e cole no Gemini ou no ChatGPT. Pronto.</span></span></div></div></section>
  <section class="card glow sec rv"><label class="field" style="margin:0"><span>Texto da sua capa</span><input class="input" id="captxt" maxlength="40" placeholder="Ex.: NINGUÉM VIU ISSO"></label><p class="dim" style="font-size:12.5px;margin-top:8px">Sem ideia? Toque em um dos textos prontos no fim da página.</p></section>
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">5 estilos testados</span><h2 class="h2">Capas com IA</h2><p>Cada exemplo foi gerado com o prompt exato que está embaixo dele.</p></div></div>
  <div class="capgrid">${CAPAS.map((c, i) => `<article class="capc rv"><img src="assets/capas/${c.id}.webp" alt="Exemplo: ${esc(c.ex)}" loading="lazy"><div class="cb"><b>${i + 1}. ${esc(c.t)}</b><p class="cp-prompt" data-i="${i}">${esc(c.p.replace('[TEXTO DA CAPA]', c.ex))}</p><div class="cbtns"><button class="btn btn-p btn-s" data-capcp="${i}">${ic('copy')}Copiar prompt</button><a class="btn btn-g btn-s" href="https://gemini.google.com/app" target="_blank" rel="noopener">Abrir o Gemini</a></div></div></article>`).join('')}</div></section>
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">onde gerar</span><h2 class="h2">Qual IA de imagem usar</h2><p>Todas têm opção gratuita. Os limites de uso mudam, então se uma travar, use a próxima.</p></div></div>
  <div class="grid2">${IAS.map(([n, u, d, tag]) => `<a class="card rv" href="${u}" target="_blank" rel="noopener" style="display:block"><div class="row"><b style="font-size:17px">${n}</b><span class="sp"></span><span class="pill" style="color:var(--aqua)">${tag}</span></div><p class="mut" style="font-size:13.5px;margin-top:6px">${d}</p></a>`).join('')}</div></section>
  <section class="card sec rv"><h3 class="h3">Prefere montar no celular sem IA?</h3><ol class="ul" style="margin-top:10px">${['Abra o CapCut ou o Canva e crie um design 1080 x 1920', 'Use um quadro forte do vídeo como fundo (pause no momento principal e tire print)', 'Escreva o texto em letras grandes, no terço de cima, com contorno preto', 'Máximo de 4 palavras e uma cor de destaque (amarelo ou rosa)', 'No TikTok e no Reels, escolha a capa na hora de postar. No Shorts, coloque a capa no primeiro segundo do vídeo'].map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}</ol></section>
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">toque para usar</span><h2 class="h2">${CAPAS_TXT.length} textos de capa prontos</h2></div></div><div class="row" id="captxts">${CAPAS_TXT.map(t => `<button class="chip" data-ct="${t}">${t}</button>`).join('')}</div></section>`;
  if (sub === 'carrossel') {
    const imgs = A.S.imgs;
    const sets = []; ['f', 'q'].forEach(k => { const arr = imgs.filter(x => x[2] === k); for (let i = 0; i + 5 <= arr.length; i += 5) sets.push(arr.slice(i, i + 5)); });
    return hero(`${ic('note')} Extra`, e.t1, e.t2, e.lead, 'carrossel') + `
    <section class="card sec rv"><h3 class="h3">Como postar um carrossel</h3><ol class="ul" style="margin-top:10px">${['Baixe as 5 imagens do conjunto', 'No Instagram, toque em + → Publicação → selecione várias, na ordem', 'Use a legenda pronta e as hashtags', 'Poste 3 carrosséis por semana além dos Reels: carrossel gera salvamento e leva o perfil para mais gente'].map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}</ol></section>
    <section class="sec"><div class="sec-h"><div><h2 class="h2">${sets.length} carrosséis prontos</h2><p>Conjuntos de 5 imagens do acervo, na ordem para postar.</p></div></div>
    <div class="grid3">${sets.map((s, i) => `<div class="card rv" style="padding:14px"><div class="row"><b class="disp" style="font-size:18px">Carrossel ${i + 1}</b><span class="sp"></span>${copyBtn(`${C.ganchos.curiosidade[i % C.ganchos.curiosidade.length]}\n\nArrasta pro lado e me diz qual você não sabia.\n\n#GTA6 #GTAVI #ViceCity #CuriosidadesGTA`, 'Legenda')}</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:10px">${s.map(([id]) => `<a href="${dl(id)}" target="_blank" rel="noopener"><img loading="lazy" src="${thumb(id, 200)}" alt="" style="aspect-ratio:4/5;object-fit:cover;border-radius:6px;width:100%"></a>`).join('')}</div></div>`).join('')}</div></section>`;
  }
  if (sub === 'clube') return hero(`${ic('refresh')} Assinatura ativa`, e.t1, e.t2, e.lead, 'recarga') + `
  <section class="card glow sec rv"><h2 class="h3">Sua assinatura está ativa</h2><ul class="ul" style="margin-top:10px">${['Recarga semanal garantida depois das 12 semanas', 'Cortes inéditos extras todo mês, direto na Recarga', 'Novos ganchos, prompts e ferramentas assim que saírem', 'Cancele quando quiser pela Lastlink, sem multa'].map(x => `<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul><a class="btn btn-p" style="margin-top:14px" href="#/recarga">${ic('refresh')}Ver a Recarga</a></section>`;
  if (sub === 'piloto') {
    const robo = can('robo');
    return hero(`${ic('play')} Extra`, e.t1, e.t2, 'Seu canal rodando quase sozinho: corte vídeos no celular com o gancho na tela, agende o mês inteiro de uma vez e deixe o sistema publicar por você.', 'piloto') + `
  <section class="sec"><div class="sec-h"><div><span class="eyebrow-s">o que vem no piloto</span><h2 class="h2">Escolha por onde começar</h2></div></div>
  <div class="tiles">
    ${tileB('#/estudio', 'remix', 'Estúdio Vice', 'Corte e coloque o gancho na tela pelo celular', 'Celular')}
    ${tileB('#/agenda', 'agenda', 'Postar sozinho', 'A agenda do mês vira posts automáticos', 'Automático')}
    ${tileB('#/extra/piloto#pi-robo', 'ferramentas', 'Robô de Cortes', robo ? 'Transforma lives em 5 cortes no computador' : 'Incluso na versão completa', 'Computador', !robo)}
    ${tileB('#/extra/piloto#pi-prompts', 'estrutura', 'Prompts do piloto', 'A IA escreve legendas e analisa seus números', 'IA')}
  </div></section>
  <section class="card glow sec rv" id="pi-auto"><span class="kick">${ic('bolt')} Postar sozinho</span><h2 class="h3" style="margin-top:12px">Agende o mês inteiro de uma vez</h2>
    <div class="steps3" style="margin-top:12px"><div><span class="n">1</span><span><b>Gere sua agenda</b><span>No Gerador Agenda Vice, escolha as redes e toque em Gerar meu mês.</span></span></div><div><span class="n">2</span><span><b>Toque em Postar sozinho</b><span>Baixe o arquivo da semana (vídeos, legendas e horários).</span></span></div><div><span class="n">3</span><span><b>Importe no Metricool</b><span>Ele publica cada vídeo sozinho no horário, no TikTok, Reels, Shorts e Facebook.</span></span></div></div>
    <a class="btn btn-p" style="margin-top:14px;min-height:50px" href="#/agenda">${ic('cal')}Abrir a agenda</a></section>
  <section class="sec" id="pi-robo"><div class="sec-h"><div><span class="eyebrow-s">no computador</span><h2 class="h2">Robô de Cortes</h2><p>Você coloca a gravação de uma live e ele devolve até 5 cortes verticais com os melhores momentos de fala. Roda no seu computador, sem conta e sem pagar nada a mais.</p></div></div>
  ${robo ? `<div class="card rv"><div class="robo-steps">
    ${[['Baixe o Robô', `O arquivo tem 134 MB. Use o computador (Windows ou Mac).`, `<a class="btn btn-p" href="${dl(ROBO_ZIP)}" target="_blank" rel="noopener">${ic('down')}Baixar o Robô</a>`],
       ['Instale o Python 3.12', 'Precisa ser a versão 3.12 (ou 3.11). Versões mais novas não funcionam com o Robô. No Windows, marque a caixa "Add Python to PATH" na primeira tela.', `<div class="row"><a class="btn btn-g btn-s" href="https://www.python.org/downloads/release/python-31210/" target="_blank" rel="noopener">Python 3.12 (Windows e Mac)</a></div>`],
       ['Descompacte e abra', 'Clique com o botão direito no ZIP e em Extrair tudo. Windows: dois cliques em Iniciar-Windows.bat. Mac: abra o Terminal, digite bash e um espaço, arraste o arquivo Iniciar-Mac.command para a janela e aperte Enter.', ''],
       ['Teste com o exemplo', 'Na primeira vez ele instala o que precisa (alguns minutos, com internet). No menu, digite 1 e aperte Enter para cortar o vídeo de exemplo.', ''],
       ['Corte a sua live', 'Coloque a gravação na pasta entrada (MP4, MOV, MKV, WebM ou M4V, de 10 segundos a 60 minutos) e digite 2.', ''],
       ['Pegue os cortes', 'Abra a pasta exportados: Corte-01.mp4, Corte-02.mp4..., o arquivo Momentos.txt com os horários e títulos sugeridos e a transcrição.', '']
      ].map(([t, d, a], i) => `<div class="rs"><span class="n">${i + 1}</span><div><b>${t}</b><p>${d}</p>${a}</div></div>`).join('')}
  </div><div class="alert" style="margin-top:14px">${ic('wand')}<span>Dica: depois de gerar os cortes, abra cada um no Estúdio Vice pelo celular para colocar o gancho na tela antes de postar.</span></div></div>`
  : `<div class="card rv"><p class="mut">O Robô de Cortes vem na versão completa do Piloto Automático.</p><a class="btn btn-p" style="margin-top:12px" href="${CFG.produtos.piloto.checkout}" target="_blank" rel="noopener">${ic('bolt')}Liberar a versão completa</a></div>`}
  </section>
  <section class="sec" id="pi-prompts"><div class="sec-h"><div><span class="eyebrow-s">deixe a IA trabalhar</span><h2 class="h2">Prompts do piloto</h2><p>Cole no ChatGPT, no Gemini ou no Claude. Troque o que está entre colchetes.</p></div></div>
  <div style="display:grid;gap:12px">${PILOTO_PROMPTS.map(p => `<div class="prompt rv"><b style="display:block;font-size:16px">${esc(p.t)}</b><p style="white-space:pre-wrap;margin-top:8px">${esc(p.p)}</p><button class="btn btn-p btn-s" style="margin-top:10px;width:100%;min-height:44px" data-cp="${esc(p.p)}">${ic('copy')}Copiar prompt</button></div>`).join('')}</div></section>`;
  }
  return '';
};
const tileB = (href, img, n, d, tg, lock = false) => `<a class="tile rv ${lock ? 'lock' : ''}" href="${href}"><img src="assets/img/${img}.webp" alt="" loading="lazy"><span class="tg">${lock ? ic('lock') + 'Bloqueado' : tg}</span><span class="n">${n}</span><span class="d">${d}</span></a>`;
const PILOTO_PROMPTS = [
  { t: 'Legendas do mês', p: 'Você é social media de um canal de cortes de GTA 6 chamado [NOME DO CANAL]. Vou te mandar a lista de vídeos da minha agenda (data, rede e tema). Para cada um, escreva: 1) um gancho de até 8 palavras para colocar na tela nos 3 primeiros segundos, 2) uma legenda de até 2 linhas com uma pergunta para os comentários, 3) 6 hashtags (3 do nicho GTA 6 e 3 da rede). Sem emoji, linguagem jovem e direta, sem spoiler da história do jogo.\n\nLista:\n[COLE A PLANILHA DA AGENDA AQUI]' },
  { t: 'Variações de um vídeo que bombou', p: 'Este vídeo de GTA 6 teve muito mais views que a média: [DESCREVA O VÍDEO E O GANCHO]. Me dê 10 ganchos diferentes para repostar o mesmo tipo de cena, mantendo o que funcionou, e explique em uma linha por que cada um deve prender a atenção.' },
  { t: 'Narração de 30 segundos', p: 'Escreva uma narração de 30 segundos (cerca de 75 palavras) para um corte de GTA 6 sobre [TEMA]. Estrutura: gancho forte na primeira frase, o detalhe principal no meio e uma pergunta no final. Tom de amigo contando uma descoberta, sem spoiler.' },
  { t: 'Análise semanal', p: 'Estes são os números dos meus vídeos de GTA 6 nesta semana (título, rede, views, curtidas, comentários): [COLE]. Me diga: os 3 formatos que mais funcionaram, os 3 que devo parar, e um plano de 7 dias com 3 posts por dia priorizando o que funcionou.' }
];

function bindCapas() {
  const inp = $('#captxt');
  const txt = () => (inp.value.trim() || '').toUpperCase();
  const draw = () => $$('.cp-prompt').forEach(el => { const c = CAPAS[+el.dataset.i]; el.textContent = c.p.replace('[TEXTO DA CAPA]', txt() || c.ex); });
  inp.oninput = draw;
  $('#view').addEventListener('click', e => {
    const b = e.target.closest('[data-capcp],[data-ct]'); if (!b) return;
    if (b.dataset.ct) { inp.value = b.dataset.ct; draw(); inp.scrollIntoView({ block: 'center' }); toast('Texto aplicado nos 5 prompts'); return; }
    const c = CAPAS[+b.dataset.capcp]; copy(c.p.replace('[TEXTO DA CAPA]', txt() || c.ex), 'Prompt copiado. Cole no Gemini');
  });
}

/* =====================================================================
   BIND
   ===================================================================== */
B.bind = (name, sub) => {
  const v = $('#view'); if (!v) return;
  v.addEventListener('click', e => {
    const c = e.target.closest('[data-cp]'); if (c) { copy(c.dataset.cp); return; }
  });
  v.addEventListener('change', e => {
    const k = e.target.dataset?.chk; if (!k) return;
    const c = load('checks', {}); c[k] = e.target.checked; save('checks', c);
    e.target.closest('.chk')?.classList.toggle('done', e.target.checked);
    A.refreshStars();
    if (e.target.checked) toast('Etapa concluída');
  });
  $$('.toc a').forEach(a => a.onclick = ev => { ev.preventDefault(); document.getElementById(a.dataset.toc)?.scrollIntoView({ behavior: 'smooth' }); });
  try {
    if (name === 'canal' && can('canal')) bindCanal();
    if (name === 'grana' && can('grana')) bindGrana();
    if (name === 'remix' && can('remix')) bindRemix();
    if (name === 'ferramentas' && can('ferramentas')) bindFerr();
    if (name === 'estrutura') bindEstrutura();
    if (name === 'extra' && sub === 'capas' && can('capas')) bindCapas();
  } catch (err) { console.error(err); }
};

window.BONUS = B;
})();
