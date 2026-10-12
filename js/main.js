// =====================================================================
//  main.js — laço principal, efeitos de tela, título, fim
// =====================================================================
'use strict';

G.fx = {};
G.cutsceneHold = n => !!n.hold;
G.fadeSpeed = 2;

const CHAPTER_NAMES = { 1: 'O Copo', 2: 'Testes Domésticos', 3: 'A Van', 4: 'Gustavo', 5: 'A Mansão Viva', 6: 'O Que Se Faz Com Isso', 7: 'A Culpa Que Eu Plantei', 8: 'A Ligação das Onze e Quarenta', 9: 'Velório', 10: 'A Porta Que Não Devia Abrir', 11: 'Téo' };

const Game = {
  titleSel: 0, titleMode: 'main',
  async boot() {
    await Promise.all([loadImg('retrato', 'assets/v_retrato.png'), loadImg('titulo', 'assets/titulo.png')]);
    UI.init();
    if (Save.getPref('muted')) { Audio2.muted = true; }
    // atalho de teste: ?cap=N
    const m = location.search.match(/cap=(\d+)/);
    if (m) { this.newGame(+m[1]); }
    else this.toTitle();
    requestAnimationFrame(loop);
  },
  toTitle() {
    G.state = 'title'; G.mini = null; Wait.clear(); G.cutscene = 0;
    UI.hud(false); G.map = null;
    $('#dialog').className = ''; UI.open = 0; UI.typing = null; UI.choosing = null; UI.modal = null;
    for (const s of ['#narr', '#card', '#journal', '#pause', '#caderno', '#phone', '#create']) $(s).className = '';
    Audio2.playSong('rayan');
    this.titleMode = 'main'; this.titleSel = Save.has() ? 1 : 0;
    this.renderTitle();
  },
  titleItems() {
    const max = Save.getPref('maxChapter') || 1;
    return [
      { t: 'Novo jogo', a: () => this.confirmNew() },
      { t: 'Continuar', a: () => this.continueGame(), off: !Save.has() },
      { t: 'Capítulos', a: () => { this.titleMode = 'chapters'; this.titleSel = 0; this.renderTitle(); }, off: max < 2 },
      { t: 'Controles', a: () => { this.titleMode = 'controls'; this.renderTitle(); } },
      { t: 'Som: ' + (Audio2.muted ? 'desligado' : 'ligado'), a: () => { Audio2.unlock(); Audio2.toggleMute(); this.renderTitle(); } },
    ];
  },
  renderTitle() {
    const t = $('#title');
    let menu = '';
    if (this.titleMode === 'main') {
      menu = this.titleItems().map((it, i) => `<div class="mi ${i === this.titleSel ? 'sel' : ''} ${it.off ? 'off' : ''}" data-i="${i}">${it.t}</div>`).join('');
    } else if (this.titleMode === 'chapters') {
      const max = Save.getPref('maxChapter') || 1;
      menu = `<div class="chs">${Object.keys(CHAPTER_NAMES).filter(n => +n <= max).map((n, i) => `<div class="ch ${i === this.titleSel ? 'sel' : ''}" data-c="${n}">${n}. ${CHAPTER_NAMES[n]}</div>`).join('')}</div><div class="mi" data-back="1">← Voltar</div>`;
    } else if (this.titleMode === 'controls') {
      menu = CONTROLS_HTML + '<div class="mi sel" data-back="1">← Voltar</div>';
    } else if (this.titleMode === 'confirm') {
      menu = `<p class="tq" style="color:#d8c8b0">Começar do zero? O progresso salvo será substituído.</p><div class="mi ${this.titleSel === 0 ? 'sel' : ''}" data-yes="1">Sim, começar</div><div class="mi ${this.titleSel === 1 ? 'sel' : ''}" data-back="1">Não</div>`;
    }
    let embers = '';
    for (let i = 0; i < 18; i++) embers += `<i class="ember" style="left:${55 + Math.random() * 40}%;top:${45 + Math.random() * 50}%;animation-duration:${3 + Math.random() * 4}s;animation-delay:${Math.random() * 5}s"></i>`;
    t.innerHTML = `<div class="bg" style="background-image:url(assets/titulo.png)"></div><div class="shade"></div>${embers}
      <div class="tbox"><div class="tv">V</div><div class="ts">O Homem Que Acordou Grande Demais</div>
      <div class="tq">"Eu prefiro carregar a culpa de ter feito, do que a culpa de não ter feito nada." — V</div>
      <div class="menu">${menu}</div></div>
      <div class="foot">Ato I e início do Ato II · capítulos 1–11 · baseado no romance · ${UI.touchOn ? 'toque para escolher' : 'setas + E'}</div>`;
    t.className = 'show';
    t.querySelectorAll('.mi[data-i]').forEach(e => e.onclick = () => { Audio2.unlock(); const it = this.titleItems()[+e.dataset.i]; if (!it.off) { Audio2.sfx('select'); it.a(); } });
    t.querySelectorAll('[data-back]').forEach(e => e.onclick = () => { this.titleMode = 'main'; this.titleSel = 0; this.renderTitle(); });
    t.querySelectorAll('[data-yes]').forEach(e => e.onclick = () => this.newGame(1));
    t.querySelectorAll('.ch').forEach(e => e.onclick = () => { Audio2.unlock(); this.newGame(+e.dataset.c, true); });
  },
  updateTitle() {
    if (this.titleMode === 'main') {
      const items = this.titleItems();
      const mv = d => { let n = this.titleSel; for (let k = 0; k < items.length; k++) { n = (n + d + items.length) % items.length; if (!items[n].off) break; } this.titleSel = n; Audio2.sfx('blip'); this.renderTitle(); };
      if (Input.hit('up')) mv(-1);
      if (Input.hit('down')) mv(1);
      if (Input.hit('act')) { const it = items[this.titleSel]; if (!it.off) { Audio2.sfx('select'); it.a(); } }
    } else if (this.titleMode === 'chapters') {
      const max = Save.getPref('maxChapter') || 1;
      if (Input.hit('left') || Input.hit('up')) { this.titleSel = (this.titleSel + max - 1) % max; this.renderTitle(); }
      if (Input.hit('right') || Input.hit('down')) { this.titleSel = (this.titleSel + 1) % max; this.renderTitle(); }
      if (Input.hit('act')) this.newGame(this.titleSel + 1, true);
      if (Input.hit('back')) { this.titleMode = 'main'; this.titleSel = 0; this.renderTitle(); }
    } else if (this.titleMode === 'confirm') {
      if (Input.hit('up') || Input.hit('down')) { this.titleSel = 1 - this.titleSel; this.renderTitle(); }
      if (Input.hit('act')) { if (this.titleSel === 0) this.newGame(1); else { this.titleMode = 'main'; this.titleSel = 0; this.renderTitle(); } }
      if (Input.hit('back')) { this.titleMode = 'main'; this.renderTitle(); }
    } else if (Input.hit('act') || Input.hit('back')) { this.titleMode = 'main'; this.titleSel = 0; this.renderTitle(); }
  },
  confirmNew() { if (Save.has()) { this.titleMode = 'confirm'; this.titleSel = 1; this.renderTitle(); } else this.newGame(1); },
  resetState() {
    G.flags = {}; G.powers = {}; G.quests = {}; G.peso = 0; G.stats = { sideDone: 0, decencia: 0, desfeitos: 0 };
    G.player = new Player(0, 0); G.fx = {}; G.frozen = 0; G.perceive = 0; G.slowmo = 0; G.cam.focus = null;
  },
  newGame(ch = 1, fromSelect) {
    Audio2.unlock();
    $('#title').className = '';
    this.resetState();
    if (fromSelect && ch > 1) {
      // estado mínimo coerente para começar num capítulo avançado
      const f = G.flags;
      f.copoNaPia = true; f.cria_laranja = true; f.nb_dia1 = true;
      if (ch >= 5) { f.mansaoCriada = true; }
      if (ch >= 6) { f.garagem = true; f.podeSair = true; f.cria_milho = true; }
      if (ch >= 7) { f.cria_sorvete = true; }
      if (ch >= 9) G.peso = 3;
    }
    Story.startChapter(ch);
  },
  continueGame() {
    const d = Save.read(); if (!d) return;
    $('#title').className = '';
    this.resetState();
    const keep = k => /^(nb_|sq_|cria_|recorde)/.test(k);
    G.flags = Object.assign({}, d.startFlags || d.flags);
    for (const k in d.flags) if (keep(k)) G.flags[k] = d.flags[k];
    G.powers = Object.assign({}, d.startPowers || d.powers);
    G.quests = JSON.parse(JSON.stringify(d.startQuests || d.quests || {}));
    for (const k in (d.quests || {})) if (!d.quests[k].main && d.quests[k].done) G.quests[k] = d.quests[k];
    G.peso = d.startPeso ?? d.peso ?? 0; G.stats = d.stats || G.stats;
    Story.startChapter(d.chapter);
  },
  async ending() {
    G.state = 'end'; UI.hud(false);
    Save.setPref('maxChapter', 11);
    Audio2.playSong('rayan');
    await UI.narrate(['Continua em', 'CAPÍTULO 12 — O APAGAMENTO', '', '"Para que Téo viva, ninguém pode lembrar. Nem os pais. Nem a namorada. Nem ele mesmo."']);
    const sideTotal = Object.values(G.quests).filter(q => !q.main).length;
    const pages = Object.keys(NOTEBOOK).filter(k => NOTEBOOK[k].page && G.flags['nb_' + k]).length;
    await UI.narrate([
      'V — O Homem Que Acordou Grande Demais',
      'Ato I e início do Ato II',
      '',
      `Missões secundárias concluídas: ${G.stats.sideDone}`,
      `Páginas do caderno encontradas: ${pages} / 8`,
      `Coisas desfeitas: ${G.stats.desfeitos}`,
      `Decência: ${G.stats.decencia ? 'ele fechou os ouvidos quando devia' : 'ele escutou o que não era dele'}`,
      `Peso carregado: ${'▮'.repeat(Math.min(10, G.peso))}${'▯'.repeat(Math.max(0, 10 - G.peso))}`,
      '',
      '"Eu prefiro carregar a culpa de ter feito, do que a culpa de não ter feito nada."',
    ]);
    Save.clear();
    this.toTitle();
  },
};

// guarda o estado do início do capítulo (para o "Continuar" recomeçar o capítulo de forma coerente)
const _start = Story.startChapter.bind(Story);
Story.startChapter = function (n, o) {
  G.startFlags = JSON.parse(JSON.stringify(G.flags));
  G.startPowers = JSON.parse(JSON.stringify(G.powers));
  G.startQuests = JSON.parse(JSON.stringify(G.quests));
  G.startPeso = G.peso;
  const max = Save.getPref('maxChapter') || 1; if (n > max) Save.setPref('maxChapter', n);
  return _start(n, o);
};
const _write = Save.write.bind(Save);
Save.write = function (cp) {
  const ok = _write(cp);
  try {
    const d = JSON.parse(localStorage.getItem(this.KEY));
    d.startFlags = G.startFlags; d.startPowers = G.startPowers; d.startQuests = G.startQuests; d.startPeso = G.startPeso;
    localStorage.setItem(this.KEY, JSON.stringify(d));
  } catch (e) { }
  return ok;
};

// ---------------------------------------------------------------- efeitos de tela
let fxCanvas = null, fxCtx = null;
function drawScreenFX(dt) {
  const fx = G.fx;
  // tempo parado / alfinete no tempo: dessatura
  const pinned = fx.pin || G.frozen > 0;
  if (pinned) {
    ctx.save();
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,0.85)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(60,90,140,.12)'; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    if (G.frozen > 0 && G.frozen < 1) { ctx.fillStyle = `rgba(255,255,255,${(1 - G.frozen) * 0.06})`; ctx.fillRect(0, 0, W, H); }
  }
  if (fx.freezeFlash > 0) { ctx.fillStyle = `rgba(230,240,255,${fx.freezeFlash})`; ctx.fillRect(0, 0, W, H); fx.freezeFlash -= dt * 1.5; }
  if (fx.rewind > 0) {
    ctx.fillStyle = `rgba(120,210,255,${fx.rewind * 0.18})`; ctx.fillRect(0, 0, W, H);
    for (let y = (G.frame * 3) % 6; y < H; y += 6) { ctx.fillStyle = `rgba(160,230,255,${fx.rewind * 0.15})`; ctx.fillRect(0, y, W, 1); }
    fx.rewind -= dt;
  }
  if (G.perceive > 0) {
    const a = Math.min(1, G.perceive, (6 - G.perceive) * 3);
    ctx.fillStyle = `rgba(90,50,150,${0.16 * a})`; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 280);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(40,10,70,${0.55 * a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // paredes ficam transparentes: contorno das paredes em violeta
    if (G.map && G.map.id !== 'rua') {
      ctx.save(); ctx.translate(-Math.round(G.cam.x), -Math.round(G.cam.y));
      ctx.strokeStyle = `rgba(200,168,255,${0.25 * a})`;
      for (let ty = 0; ty < G.map.h; ty++) for (let tx = 0; tx < G.map.w; tx++) if (World.isWall(tx, ty) && !World.isWall(tx, ty + 1)) ctx.strokeRect(tx * 16 + 0.5, ty * 16 + 0.5, 15, 15);
      ctx.restore();
    }
    if (fx.vizinho) { // cap. 2: o vizinho de cueca do outro lado da parede
      const x = 12 - Math.round(G.cam.x), y = 40 - Math.round(G.cam.y);
      ctx.fillStyle = 'rgba(200,190,220,.35)'; ctx.fillRect(x - 12, y, 30, 120);
      const s = Sprites.human('VizCueca', CAST.VizCueca || (CAST.VizCueca = Object.assign({}, CAST.Vizinho, { top: { style: 'tshirt', c: ['#f2c7a5', '#d9aa87', '#b0826a', '#8a6650'] }, pants: { style: 'shorts', c: ['#f4f4f4', '#dcdcdc', '#b8b8b8'] }, shoes: ['#f2c7a5', '#d9aa87', '#b0826a'] })));
      ctx.globalAlpha = 0.8; ctx.drawImage(s.right[Math.floor(G.t * 6) % 4], x - 8, y + 50); ctx.globalAlpha = 1;
    }
  }
  if (fx.wobble > 0) {
    if (!fxCanvas) [fxCanvas, fxCtx] = Art.mk(W, H);
    fxCtx.clearRect(0, 0, W, H); fxCtx.drawImage(canvas, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 2) ctx.drawImage(fxCanvas, 0, y, W, 2, Math.sin(y * 0.08 + G.t * 9) * fx.wobble * 3, y, W, 2);
    fx.wobble -= dt;
  }
  if (G.slowmo) { ctx.fillStyle = 'rgba(120,20,20,.12)'; ctx.fillRect(0, 0, W, H); }
  // vinheta suave para atmosfera
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- laço
let last = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  let dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
  last = ts;
  G.dt = dt; G.t += dt; G.frame++;
  try { step(dt); } catch (e) { console.error(e); }
  Audio2.update();
  Input.endFrame();
}
function step(dt) {
  if (Input.hit('mute')) Audio2.toggleMute();
  if (G.state === 'title') {
    Game.updateTitle();
    ctx.fillStyle = '#050405'; ctx.fillRect(0, 0, W, H);
    UI.hctx.setTransform(1, 0, 0, 1, 0, 0); UI.hctx.clearRect(0, 0, UI.hudCanvas.width, UI.hudCanvas.height);
    UI.update(dt); Wait.update(dt);
    return;
  }
  if (G.state === 'end') { UI.update(dt); if (UI.modal) UI.modal.update(dt); Wait.update(dt); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
  if (!G.map) return;

  // atalhos globais
  if (!G.cutscene && !UI.open && !G.mini && !Powers.createMenu) {
    if (Input.hit('pause') && !UI.modal) { Input.consume('pause'); UI.togglePause(); }
    else if (Input.hit('journal') && !UI.modal) { Input.consume('journal'); UI.toggleJournal(); }
  }
  UI.update(dt);
  if (UI.modal) UI.modal.update(dt);
  else if (G.mini) G.mini.update(dt);
  else {
    if (!G.cutscene && !UI.blocking() && !Powers.createMenu && Input.hit('act') && !G.player.held) { if (Story.interact()) Input.consume('act'); }
    Powers.update(dt);
  }
  const paused = !!UI.modal && $('#pause').classList.contains('show') || $('#journal').classList.contains('show');
  if (!paused && (!G.mini || G.mini.overlay)) World.update(dt * (G.slowmo || 1));
  Story.update(dt);
  Wait.update(dt);
  World.updateCamera(G.cam.focus ? 0.05 : 0.12);
  // fade
  if (G.fade !== G.fadeTarget) { const s = (G.fadeSpeed || 2) * dt; G.fade = G.fade < G.fadeTarget ? Math.min(G.fadeTarget, G.fade + s) : Math.max(G.fadeTarget, G.fade - s); }

  // desenho
  if (G.mini && !G.mini.overlay) G.mini.draw();
  else { World.draw(); drawScreenFX(dt); if (G.mini) G.mini.draw(); }
  if (G.fade > 0) { ctx.globalAlpha = G.fade; ctx.fillStyle = G.fadeColor || '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }

  // texto em alta resolução
  if (G.mini) { UI.hctx.setTransform(1, 0, 0, 1, 0, 0); UI.hctx.clearRect(0, 0, UI.hudCanvas.width, UI.hudCanvas.height); if (G.mini.drawText) G.mini.drawText(); }
  else UI.drawLabels();
  UI.prompt(G.mini ? '' : Story.promptText());
  UI.drawPowerBar();
  $('#hud').style.visibility = (G.mini && !G.mini.overlay) ? 'hidden' : 'visible';
  document.body.classList.toggle('dlg', UI.open > 0 || !!UI.modal || G.state !== 'play');
}

window.__G = G; window.__Story = Story; window.__Game = Game;
Game.boot();
