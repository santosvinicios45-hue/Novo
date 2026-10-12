// =====================================================================
//  powers.js — os poderes do V
// =====================================================================
'use strict';

const POWERS = {
  tk: { name: 'Telecinese', key: 'Q', desc: 'Levanta objetos com o pensamento. Q pega, Q de novo arremessa, E pousa com cuidado.', cd: 0.2, icon: 'tk' },
  undo: { name: 'Desfazer', key: 'R', desc: '"Eu queria que isso não tivesse acontecido." Rebobina os últimos segundos de objetos próximos.', cd: 2.5, icon: 'undo' },
  blink: { name: 'Deslocar', key: 'Shift', desc: 'Aparece do outro lado sem percorrer o caminho, como o controle remoto.', cd: 0.9, icon: 'blink' },
  create: { name: 'Criar', key: 'C', desc: 'Faz coisas existirem. Perfeitas de um jeito levemente errado.', cd: 1.0, icon: 'create' },
  perceive: { name: 'Percepção', key: 'X', desc: 'As paredes ficam transparentes e o formato da vida das pessoas aparece. (NÃO olhar o vizinho.)', cd: 4, icon: 'perceive' },
  freeze: { name: 'Parar o Tempo', key: 'F', desc: 'Crava um alfinete no tempo. Tudo para por alguns segundos — menos você.', cd: 7, icon: 'freeze' },
  van: { name: 'Chamar a Van', key: 'B', desc: 'Ela sempre sabe a música certa. E sempre sabe o que você deveria fazer.', cd: 2, icon: 'van' },
};
const CREATABLE = {
  laranja: { name: 'Laranja', desc: 'Laranja demais.' },
  milho: { name: 'Saco de milho', desc: 'Para pombos. E para quem dá milho a eles.' },
  sorvete: { name: 'Sorvete', desc: 'De morango. Na casquinha.' },
  flor: { name: 'Flor', desc: 'Uma flor que você nunca viu.' },
  cafe: { name: 'Café', desc: 'Coado no pano. Como o da avó.' },
  bola: { name: 'Bola', desc: 'Pra quem precisa de uma.' },
};

const Powers = {
  cd: {}, tkTarget: null,
  createMenu: false, createSel: 0,
  locked: false,

  has(p) { return !!G.powers[p]; },
  unlock(p, silent) {
    if (G.powers[p]) return;
    G.powers[p] = true;
    if (!silent) UI.toast('Poder desbloqueado', POWERS[p].name + '  [' + POWERS[p].key + ']', 'power');
    UI.refreshTouch();
  },
  ready(p) { return this.has(p) && !(this.cd[p] > 0) && !this.locked; },
  use(p) { this.cd[p] = POWERS[p].cd; },

  update(dt) {
    for (const k in this.cd) if (this.cd[k] > 0) this.cd[k] -= dt;
    const pl = G.player;
    // tempo parado
    if (G.frozen > 0) {
      G.frozen -= dt;
      if (G.frozen <= 0) { G.frozen = 0; Audio2.sfx('unfreeze'); if (this.onUnfreeze) { const f = this.onUnfreeze; this.onUnfreeze = null; f(); } }
    } else G.frozenT = G.t;
    if (G.perceive > 0) { G.perceive -= dt; if (G.perceive <= 0) { G.perceive = 0; Story.emit('perceiveEnd'); } }

    // alvo da telecinese
    this.tkTarget = null;
    if (this.has('tk') && !pl.held) this.tkTarget = this.findTk();

    if (G.cutscene || UI.blocking()) return;
    if (this.createMenu) return this.updateCreateMenu();

    if (Input.hit('tk') && this.ready('tk')) this.doTk();
    if (Input.hit('undo')) { if (this.ready('undo')) this.doUndo(); else if (this.has('undo')) Audio2.sfx('deny'); }
    if (Input.hit('blink')) { if (this.ready('blink')) this.doBlink(); }
    if (Input.hit('freeze')) { if (this.ready('freeze')) this.doFreeze(); else if (this.has('freeze')) Audio2.sfx('deny'); }
    if (Input.hit('perceive')) { if (this.ready('perceive')) this.doPerceive(); else if (this.has('perceive')) Audio2.sfx('deny'); }
    if (Input.hit('create') && this.ready('create')) { this.createMenu = true; this.createSel = 0; Audio2.sfx('blip'); UI.showCreate(true); }
    if (Input.hit('van') && this.ready('van')) { this.use('van'); Story.callVan(); }
    if (pl.held && Input.hit('act')) { Input.consume('act'); this.place(); }
  },

  findTk() {
    const pl = G.player; let best = null, bd = 1e9;
    const [fx, fy] = pl.facingPoint(16);
    for (const e of G.entities) {
      if (!(e instanceof Item) || !e.tk || e.rewinding > 0 || e.hidden) continue;
      if (e.broken) continue;
      const d = U.dist(fx, fy, e.x, e.y - e.z);
      if (d < 34 && d < bd) { bd = d; best = e; }
    }
    return best;
  },
  doTk() {
    const pl = G.player;
    if (pl.held) { // arremessar
      const it = pl.held; pl.held = null;
      const [vx, vy] = U.dirVec(pl.dir);
      it.vx = vx * 190; it.vy = vy * 150; it.vz = 50; it.z = Math.max(it.z, 10);
      Audio2.sfx('throw'); this.use('tk');
      Story.emit('throw', it);
      return;
    }
    const t = this.tkTarget;
    if (!t) { Audio2.sfx('deny'); return; }
    pl.held = t; t.suspended = false; t.gentle = false; t.vx = t.vy = 0;
    Audio2.sfx('tk'); this.use('tk');
    FX.ring(t.x, t.y - 4, '#ffb347', 14, 0.4);
    Story.emit('lift', t);
  },
  place() {
    const pl = G.player, it = pl.held; if (!it) return;
    pl.held = null; it.vz = 0; it.vx = it.vy = 0;
    it.gentle = true; it.z = Math.min(it.z, 8); // pousa suavemente
    Audio2.sfx('blip');
    Story.emit('place', it);
  },
  doUndo() {
    const pl = G.player; let any = false;
    for (const e of G.entities) if (e instanceof Item && U.dist(pl.x, pl.y, e.x, e.y) < 90) if (e.undo()) { any = true; if (pl.held === e) pl.held = null; }
    const handled = Story.emit('undo');
    if (!any && !handled) { Audio2.sfx('deny'); UI.hint('Não há nada recente para desfazer aqui.'); return; }
    this.use('undo'); Audio2.sfx('undo'); G.stats.desfeitos++;
    G.fx.rewind = 0.8; G.player.glowT = 0.8;
    FX.ring(pl.x, pl.y - 12, '#8fd8ff', 80, 0.7);
  },
  doBlink() {
    const pl = G.player; const [vx, vy] = U.dirVec(pl.dir);
    let best = 0;
    for (let d = 4; d <= 56; d += 2) {
      const nx = pl.x + vx * d, ny = pl.y + vy * d;
      const b = { x: nx - pl.bw / 2, y: ny - pl.bh, w: pl.bw, h: pl.bh };
      // não atravessa paredes
      const tx = Math.floor(nx / TILE), ty = Math.floor((ny - 2) / TILE);
      if (World.isWall(tx, ty)) break;
      if (World.boxFree(b.x, b.y, b.w, b.h, pl)) best = d;
    }
    if (best < 10) { Audio2.sfx('deny'); return; }
    pl.afterimages.push({ x: pl.x, y: pl.y, img: pl.sprite(), life: 0.45 });
    FX.burst(pl.x, pl.y - 14, 14, ['#ffb347', '#2a221e', '#ffd27a'], 40, 0.5);
    pl.x += vx * best; pl.y += vy * best;
    FX.burst(pl.x, pl.y - 14, 10, ['#ffb347', '#ffd27a'], 30, 0.4);
    Audio2.sfx('blink'); this.use('blink');
    Story.emit('blink');
  },
  doFreeze() {
    G.frozen = 4.5; G.frozenT = G.t; this.use('freeze'); Audio2.sfx('freeze');
    G.fx.freezeFlash = 0.4;
    Story.emit('freeze');
  },
  doPerceive() {
    G.perceive = 6; this.use('perceive'); Audio2.sfx('perceive');
    FX.ring(G.player.x, G.player.y - 12, '#c8a8ff', 160, 1.0);
    Story.emit('perceive');
  },
  updateCreateMenu() {
    const list = this.creatable();
    if (Input.hit('left') || Input.hit('up')) { this.createSel = (this.createSel + list.length - 1) % list.length; Audio2.sfx('blip'); UI.showCreate(true); }
    if (Input.hit('right') || Input.hit('down')) { this.createSel = (this.createSel + 1) % list.length; Audio2.sfx('blip'); UI.showCreate(true); }
    if (Input.hit('back') || Input.hit('create')) { this.createMenu = false; UI.showCreate(false); return; }
    if (Input.hit('act')) { Input.consume('act'); this.createMenu = false; UI.showCreate(false); this.create(list[this.createSel]); }
  },
  creatable() { return Object.keys(CREATABLE).filter(k => G.flags['cria_' + k]); },
  create(type) {
    if (!type) return;
    const pl = G.player; const [fx, fy] = pl.facingPoint(14);
    const it = new Item({ x: fx, y: fy + 4, type, z: 12, fragile: false, created: true });
    it.vz = 10;
    G.entities.push(it);
    FX.burst(fx, fy - 6, 16, ['#ffe9a8', '#ffb347', '#fff'], 30, 0.6);
    Audio2.sfx('create'); this.use('create');
    Story.emit('create', it);
    // limite de coisas criadas no mapa
    const made = G.entities.filter(e => e.created);
    if (made.length > 8) { made[0].dead = true; FX.burst(made[0].x, made[0].y - 4, 8, '#ffe9a8', 20, 0.4); }
  },
};
