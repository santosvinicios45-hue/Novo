// =====================================================================
//  world.js — mapas, colisão, entidades, câmera, iluminação, partículas
// =====================================================================
'use strict';

const World = {
  ground: null,       // canvas pré-renderizado do chão+paredes
  light: null, lightCtx: null,
  props: [], triggers: [], exits: [],
  solidGrid: null,

  load(id, spawn) {
    const def = MAPS[id];
    if (!def) { console.error('mapa inexistente', id); return; }
    const tiles = def.tilesFn ? def.tilesFn() : def.tiles;
    const m = G.map = {
      id, def, name: def.name, w: tiles[0].length, h: tiles.length,
      tiles, legend: def.legend, theme: def.theme,
      dark: def.dark || 0, tint: def.tint || null, music: def.music,
    };
    // grade de colisão
    this.solidGrid = [];
    for (let y = 0; y < m.h; y++) {
      const row = [];
      for (let x = 0; x < m.w; x++) { const L = m.legend[m.tiles[y][x]] || {}; row.push(!!(L.wall || L.solid)); }
      this.solidGrid.push(row);
    }
    this.renderGround();
    // props
    this.props = (def.props || []).filter(p => !p.hiddenUntil || G.flags[p.hiddenUntil]).map(p => this.makeProp(p));
    this.triggers = (def.triggers || []).map(t => Object.assign({ fired: false }, t));
    this.exits = def.exits || [];
    // entidades
    G.entities = [];
    G.particles = [];
    if (!G.player) G.player = new Player(0, 0);
    G.entities.push(G.player);
    G.player.held = null;
    const sp = (spawn && def.spawns && def.spawns[spawn]) || (Array.isArray(spawn) ? spawn : null) || (def.spawns && def.spawns.start) || [m.w * 8, m.h * 8];
    G.player.x = sp[0]; G.player.y = sp[1]; if (sp[2]) G.player.dir = sp[2];
    if (def.setup) def.setup();
    if (Story.mapSetup[id]) Story.mapSetup[id]();
    Audio2.playSong(m.music || null);
    this.snapCamera();
  },

  makeProp(p) {
    const d = PROPDEF[p.t] || { w: 16, h: 16, box: null };
    const w = p.w || (p.st && p.st.w) || d.w, h = p.h || (p.st && p.st.h) || d.h;
    const box = p.box !== undefined ? p.box : d.box;
    const prop = Object.assign({ st: {}, w, h, under: d.under, isProp: true }, p);
    prop.st = Object.assign({}, p.st || {});
    prop.solidBox = box ? { x: p.x + box[0], y: p.y + box[1], w: box[2], h: box[3] } : null;
    if (box && p.t === 'railing' && p.st && p.st.w) prop.solidBox.w = p.st.w;
    if (box && p.t === 'hedge' && p.st && p.st.w) prop.solidBox.w = p.st.w;
    if (box && p.t === 'fence' && p.st && p.st.w) prop.solidBox.w = p.st.w;
    prop.sortY = p.sortY !== undefined ? p.sortY : (prop.solidBox ? prop.solidBox.y + prop.solidBox.h : p.y + h);
    return prop;
  },
  prop(id) { return this.props.find(p => p.id === id); },
  removeProp(id) { this.props = this.props.filter(p => p.id !== id); },
  addProp(p) { const pr = this.makeProp(p); this.props.push(pr); return pr; },

  isWall(tx, ty) {
    const m = G.map;
    if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return true;
    return this.solidGrid[ty][tx];
  },
  setSolidTile(tx, ty, v) { if (this.solidGrid[ty]) this.solidGrid[ty][tx] = v; },

  renderGround() {
    const m = G.map;
    const [c, x] = Art.mk(m.w * TILE, m.h * TILE);
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
      const L = m.legend[m.tiles[ty][tx]] || { floor: 'void' };
      if (L.wall) {
        const theme = L.wall, faceH = (WALLTHEMES[theme] && WALLTHEMES[theme].faceH) || L.faceH || 1;
        let d = 0; // quantas paredes abaixo até o chão
        while (ty + d + 1 < m.h && (m.legend[m.tiles[ty + d + 1][tx]] || {}).wall) d++;
        const below = ty + d + 1 < m.h;
        if (below && d < faceH) Tiles.wall(x, theme, tx, ty, true, faceH - 1 - d, faceH);
        else Tiles.wall(x, theme, tx, ty, false);
      } else {
        Tiles.draw(x, L.floor || 'void', tx, ty);
        if (L.floor2) Tiles.draw(x, L.floor2, tx, ty);
      }
    }
    // sombra de contato das paredes no chão
    x.fillStyle = 'rgba(0,0,0,.18)';
    for (let ty = 1; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
      const L = m.legend[m.tiles[ty][tx]] || {}, Up = m.legend[m.tiles[ty - 1][tx]] || {};
      if (!L.wall && Up.wall) x.fillRect(tx * TILE, ty * TILE, TILE, 3);
    }
    if (m.def.decorate) m.def.decorate(x);
    this.ground = c;
  },

  // ---------------- colisão
  boxFree(bx, by, bw, bh, ignore) {
    const x0 = Math.floor(bx / TILE), x1 = Math.floor((bx + bw - 0.01) / TILE);
    const y0 = Math.floor(by / TILE), y1 = Math.floor((by + bh - 0.01) / TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.isWall(tx, ty)) return false;
    const b = { x: bx, y: by, w: bw, h: bh };
    for (const p of this.props) if (p.solidBox && !p.ghost && U.overlap(b, p.solidBox)) return false;
    for (const e of G.entities) if (e !== ignore && e.solid && !e.hidden && U.overlap(b, e.box())) return false;
    return true;
  },
  moveBox(ent, dx, dy) {
    const b = ent.box();
    if (dx) { if (this.boxFree(b.x + dx, b.y, b.w, b.h, ent)) ent.x += dx; else { // deslizar em quinas
      for (const s of [1, -1, 2, -2]) if (this.boxFree(b.x + dx, b.y + s, b.w, b.h, ent) && !dy) { ent.y += s * 0.5; break; }
    } }
    const b2 = ent.box();
    if (dy) { if (this.boxFree(b2.x, b2.y + dy, b2.w, b2.h, ent)) ent.y += dy; else {
      for (const s of [1, -1, 2, -2]) if (this.boxFree(b2.x + s, b2.y + dy, b2.w, b2.h, ent) && !dx) { ent.x += s * 0.5; break; }
    } }
  },

  // ---------------- câmera
  snapCamera() { this.updateCamera(1); },
  updateCamera(k = 0.12) {
    const m = G.map, p = G.player, cam = G.cam;
    const mw = m.w * TILE, mh = m.h * TILE;
    let tx = (cam.focus ? cam.focus.x : p.x) - W / 2, ty = (cam.focus ? cam.focus.y : p.y - 10) - H / 2;
    tx = mw <= W ? (mw - W) / 2 : U.clamp(tx, 0, mw - W);
    ty = mh <= H ? (mh - H) / 2 : U.clamp(ty, 0, mh - H);
    cam.x = U.lerp(cam.x, tx, k); cam.y = U.lerp(cam.y, ty, k);
    if (Math.abs(cam.x - tx) < 0.05) cam.x = tx;
    if (Math.abs(cam.y - ty) < 0.05) cam.y = ty;
  },

  // ---------------- atualização
  update(dt) {
    const frozen = G.frozen > 0;
    for (const e of G.entities) {
      if (e.dead) continue;
      if (frozen && e !== G.player && !e.ignoreFreeze && !(e === G.player.held)) { if (e.frozenUpdate) e.frozenUpdate(dt); continue; }
      e.update(dt);
    }
    G.entities = G.entities.filter(e => !e.dead);
    for (const pt of G.particles) {
      if (frozen && !pt.ignoreFreeze) continue;
      pt.life -= dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += (pt.g || 0) * dt;
      if (pt.drag) { pt.vx *= (1 - pt.drag * dt); pt.vy *= (1 - pt.drag * dt); }
    }
    G.particles = G.particles.filter(p => p.life > 0);
    if (G.particles.length > 700) G.particles.splice(0, G.particles.length - 700);
    // gatilhos
    const p = G.player, pb = p.box();
    if (!G.cutscene) {
      for (const t of this.triggers) {
        if (t.fired && t.once !== false) continue;
        if (t.when && !t.when()) continue;
        const inside = U.overlap(pb, t);
        if (inside && !t._in) { t._in = true; t.fired = true; Story.run(t.run); }
        else if (!inside) t._in = false;
      }
      for (const ex of this.exits) {
        if (ex.when && !ex.when()) continue;
        if (U.overlap(pb, ex)) {
          if (ex.locked && ex.locked()) { if (!ex._msg) { ex._msg = true; Story.run(ex.lockedMsg); } continue; }
          ex._msg = false;
          Story.goto(ex.to, ex.spawn);
          break;
        } else ex._msg = false;
      }
    }
  },

  // ---------------- desenho
  draw() {
    const cam = G.cam;
    let sx = 0, sy = 0;
    if (cam.shake > 0) { sx = U.rand(-cam.shake, cam.shake); sy = U.rand(-cam.shake, cam.shake); cam.shake = Math.max(0, cam.shake - G.dt * 12); }
    const ox = Math.round(-cam.x + sx), oy = Math.round(-cam.y + sy);
    ctx.fillStyle = G.map.def.bg || '#0b0a0a';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.drawImage(this.ground, 0, 0);
    if (G.map.def.drawUnder) G.map.def.drawUnder(ctx);
    // props de parede/chão (sem ordenação)
    for (const p of this.props) if ((p.wallMounted || p.under) && !p.hidden) this.drawProp(p);
    // lista ordenada
    const list = [];
    for (const p of this.props) if (!p.wallMounted && !p.under && !p.hidden) list.push(p);
    for (const e of G.entities) if (!e.hidden) list.push(e);
    list.sort((a, b) => (a.sortY !== undefined ? a.sortY : a.y) - (b.sortY !== undefined ? b.sortY : b.y));
    for (const o of list) { if (o.isProp) this.drawProp(o); else o.draw(ctx); }
    // partículas
    for (const pt of G.particles) this.drawParticle(pt);
    if (G.map.def.drawOver) G.map.def.drawOver(ctx);
    ctx.restore();
    this.drawLighting(ox, oy);
  },
  drawProp(p) {
    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y));
    if (p.flipX) { ctx.translate(p.w, 0); ctx.scale(-1, 1); }
    if (p.alpha !== undefined) ctx.globalAlpha = p.alpha;
    const fr = G.frozen > 0 ? G.frozenT : G.t;
    PropArt.draw(ctx, p.t, Object.assign({ frozen: G.frozen > 0 }, p.st), fr);
    ctx.restore();
    if (p.glow && !G.cutsceneHideGlow) {
      const pulse = 0.5 + Math.sin(G.t * 4) * 0.3;
      ctx.strokeStyle = `rgba(255,236,170,${pulse})`; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(p.x) - 1.5, Math.round(p.y) - 1.5, p.w + 3, p.h + 3);
    }
  },
  drawParticle(pt) {
    const a = U.clamp(pt.life / (pt.max || 1), 0, 1);
    ctx.globalAlpha = pt.fade === false ? 1 : a;
    if (pt.type === 'note') { ctx.fillStyle = pt.color; ctx.fillRect(pt.x, pt.y, 2, 2); ctx.fillRect(pt.x + 1, pt.y - 4, 1, 4); ctx.fillRect(pt.x + 1, pt.y - 4, 2, 1); }
    else if (pt.type === 'ring') { ctx.strokeStyle = pt.color; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pt.x, pt.y, (1 - a) * pt.size, 0, 7); ctx.stroke(); }
    else if (pt.type === 'smoke') { ctx.fillStyle = pt.color; const s = pt.size * (1.6 - a); ctx.globalAlpha = a * 0.5; ctx.beginPath(); ctx.arc(pt.x, pt.y, s, 0, 7); ctx.fill(); }
    else if (pt.type === 'thread') { ctx.strokeStyle = pt.color; ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pt.x2, pt.y2); ctx.stroke(); }
    else { ctx.fillStyle = pt.color; const s = pt.size || 1; ctx.fillRect(Math.round(pt.x), Math.round(pt.y), s, s); }
    ctx.globalAlpha = 1;
  },
  drawLighting(ox, oy) {
    const m = G.map;
    let dark = m.dark;
    if (dark <= 0.01 && !m.tint) return;
    if (!this.light) { [this.light, this.lightCtx] = Art.mk(W, H); }
    const L = this.lightCtx;
    L.globalCompositeOperation = 'source-over';
    L.clearRect(0, 0, W, H);
    L.fillStyle = m.def.darkColor || '#070a1a';
    L.globalAlpha = dark; L.fillRect(0, 0, W, H); L.globalAlpha = 1;
    L.globalCompositeOperation = 'destination-out';
    const lights = [];
    for (const p of this.props) if (p.light && !p.hidden && (!p.light.when || p.light.when())) lights.push({ x: p.x + (p.light.ox ?? p.w / 2), y: p.y + (p.light.oy ?? p.h / 2), r: p.light.r, a: p.light.a ?? 1, flick: p.light.flick });
    for (const e of G.entities) if (e.light && !e.hidden) lights.push(Object.assign({ x: e.x, y: e.y - 10 }, e.light));
    if (G.player && !G.player.hidden) lights.push({ x: G.player.x, y: G.player.y - 12, r: m.def.playerLight || 34, a: 0.55 });
    for (const l of lights) {
      let r = l.r; if (l.flick) r *= 0.92 + Math.random() * 0.08 * l.flick;
      const x = l.x + ox, y = l.y + oy;
      const g = L.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${l.a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      L.fillStyle = g; L.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.drawImage(this.light, 0, 0);
    // brilho quente aditivo
    ctx.globalCompositeOperation = 'lighter';
    for (const l of lights) {
      if (l.a < 0.7) continue;
      const x = l.x + ox, y = l.y + oy, r = l.r * 0.6;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,190,110,${0.12 * dark})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (m.tint) { ctx.fillStyle = m.tint; ctx.fillRect(0, 0, W, H); }
  },
};

// ---------------------------------------------------------------- partículas
const FX = {
  add(o) { o.max = o.life; G.particles.push(o); return o; },
  burst(x, y, n, color, spd = 40, life = 0.6, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = spd * (0.3 + Math.random() * 0.7);
      this.add(Object.assign({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life * (0.6 + Math.random() * 0.4), color: Array.isArray(color) ? U.pick(color) : color, size: 1 }, opts));
    }
  },
  ring(x, y, color, size = 30, life = 0.5) { this.add({ type: 'ring', x, y, vx: 0, vy: 0, life, color, size }); },
  // as "brasas" do poder do V (como na arte de referência)
  ember(x, y, n = 1) {
    for (let i = 0; i < n; i++) this.add({ x: x + U.rand(-5, 5), y: y + U.rand(-6, 6), vx: U.rand(-6, 6), vy: U.rand(-28, -10), life: U.rand(0.5, 1.1), color: U.pick(['#ffb347', '#ff8a3d', '#ffd27a', '#e86a3a']), size: 1, ignoreFreeze: true });
  },
  wisp(x, y, n = 1) {
    for (let i = 0; i < n; i++) this.add({ type: 'smoke', x: x + U.rand(-6, 6), y: y + U.rand(-4, 4), vx: U.rand(-4, 4), vy: U.rand(-14, -6), life: U.rand(0.6, 1.2), color: '#2a221e', size: U.rand(2, 4), ignoreFreeze: true });
  },
};

// =====================================================================
//  ENTIDADES
// =====================================================================
class Ent {
  constructor(x, y) { this.x = x; this.y = y; this.bw = 10; this.bh = 6; this.solid = false; this.dead = false; this.hidden = false; }
  box() { return { x: this.x - this.bw / 2, y: this.y - this.bh, w: this.bw, h: this.bh }; }
  get sortY() { return this.y; }
  update() { }
  draw() { }
}

// ---------------------------------------------------------------- jogador (V)
class Player extends Ent {
  constructor(x, y) {
    super(x, y);
    this.dir = 'down'; this.anim = 0; this.moving = false; this.speed = 62;
    this.held = null; this.spriteKey = 'V'; this.blinkT = 3; this.stepT = 0;
    this.afterimages = []; this.sitting = false; this.lockDir = false;
  }
  setOutfit(k) { this.spriteKey = k; }
  update(dt) {
    let [ax, ay] = (G.cutscene || UI.blocking()) ? [0, 0] : Input.axis();
    if (this.scripted) { ax = this.scripted.ax; ay = this.scripted.ay; }
    if (this.sitting && (ax || ay)) this.sitting = false;
    this.moving = !!(ax || ay);
    if (this.moving) {
      if (!this.lockDir) {
        if (Math.abs(ax) > Math.abs(ay)) this.dir = ax > 0 ? 'right' : 'left'; else this.dir = ay > 0 ? 'down' : 'up';
      }
      const sp = this.speed * (G.flags.velorio ? 0.75 : 1);
      World.moveBox(this, ax * sp * dt, ay * sp * dt);
      this.anim += dt * 7.5;
      this.stepT -= dt; if (this.stepT <= 0) { this.stepT = 0.33; Audio2.sfx('step'); }
    } else this.anim = 0;
    this.blinkT -= dt; if (this.blinkT < -0.12) this.blinkT = U.rand(2, 5);
    this.afterimages = this.afterimages.filter(a => (a.life -= dt) > 0);
    // poder ativo: brasas e fumaça escura em volta do corpo
    if (this.held || G.frozen > 0 || this.glowT > 0) { if (Math.random() < 0.5) FX.ember(this.x, this.y - 14); if (Math.random() < 0.25) FX.wisp(this.x, this.y - 6); }
    if (this.glowT > 0) this.glowT -= dt;
  }
  frame() { return this.moving ? (Math.floor(this.anim) % 4) : 0; }
  sprite() {
    const set = Sprites.human(this.spriteKey, CAST[this.spriteKey]);
    if (!this.moving && this.blinkT < 0 && this.dir === 'down') return set.blink[0];
    return set[this.dir][this.frame()];
  }
  draw(c) {
    for (const a of this.afterimages) { c.globalAlpha = a.life * 1.5 * 0.5; c.drawImage(a.img, Math.round(a.x - 11), Math.round(a.y - 35)); }
    c.globalAlpha = 1;
    // sombra
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(Math.round(this.x), Math.round(this.y), 6, 2, 0, 0, 7); c.fill();
    if (this.sitting) { c.drawImage(this.sprite(), 0, 0, 22, 26, Math.round(this.x - 11), Math.round(this.y - 29), 22, 26); return; }
    c.drawImage(this.sprite(), Math.round(this.x - 11), Math.round(this.y - 35));
  }
  facingPoint(d = 12) { const [vx, vy] = U.dirVec(this.dir); return [this.x + vx * d, this.y - 4 + vy * d]; }
}

// ---------------------------------------------------------------- NPC
class NPC extends Ent {
  constructor(o) {
    super(o.x, o.y);
    Object.assign(this, { dir: 'down', anim: 0, speed: 30, name: '', solid: true, path: null, pathI: 0, waitT: 0, emote: null, emoteT: 0, lookAtPlayer: true }, o);
    this.homeDir = this.dir;
    this.blinkT = U.rand(1, 4);
    this.target = null;
  }
  sprites() { return Sprites.human(this.cast, CAST[this.cast]); }
  update(dt) {
    let moving = false;
    if (this.target) {
      const dx = this.target.x - this.x, dy = this.target.y - this.y, d = Math.hypot(dx, dy);
      if (d < 1.2) { this.x = this.target.x; this.y = this.target.y; const cb = this.target.cb; this.target = null; if (cb) cb(); }
      else {
        const sp = (this.target.speed || this.speed) * dt;
        const mx = dx / d * Math.min(sp, d), my = dy / d * Math.min(sp, d);
        if (this.target.ghost) { this.x += mx; this.y += my; } else { const bx = this.x, by = this.y; World.moveBox(this, mx, my); if (Math.abs(this.x - bx) + Math.abs(this.y - by) < 0.01) { this.stuckT = (this.stuckT || 0) + dt; if (this.stuckT > 1.2) { this.x += mx; this.y += my; } } else this.stuckT = 0; }
        if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? 'right' : 'left'; else this.dir = dy > 0 ? 'down' : 'up';
        moving = true;
      }
    } else if (this.path && !G.cutsceneHold(this)) {
      if (this.waitT > 0) this.waitT -= dt;
      else {
        const wp = this.path[this.pathI];
        this.target = { x: wp[0], y: wp[1], cb: () => { this.waitT = wp[2] || 0; if (wp[3]) this.dir = wp[3]; this.pathI = (this.pathI + 1) % this.path.length; } };
      }
    }
    if (!moving && this.lookAtPlayer && !this.target && G.player) {
      const d = U.dist(this.x, this.y, G.player.x, G.player.y);
      if (d < 36 && !G.cutscene) {
        const dx = G.player.x - this.x, dy = G.player.y - this.y;
        this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      } else if (!this.path) this.dir = this.homeDir;
    }
    this.moving = moving;
    this.anim = moving ? this.anim + dt * 7 : 0;
    this.blinkT -= dt; if (this.blinkT < -0.12) this.blinkT = U.rand(2, 5);
    if (this.emoteT > 0) { this.emoteT -= dt; if (this.emoteT <= 0) this.emote = null; }
    if (this.smoke && Math.random() < 0.08) {
      const off = this.dir === 'left' ? -5 : this.dir === 'right' ? 6 : 5;
      FX.add({ type: 'smoke', x: this.x + off, y: this.y - 22, vx: U.rand(-3, 3) + 3, vy: U.rand(-10, -5), life: 1.4, color: '#c8c8c8', size: 2 });
    }
    if (this.tick) this.tick(dt);
  }
  walkTo(x, y, speed, ghost) { return new Promise(r => { this.path = null; this.target = { x, y, speed, ghost, cb: r }; }); }
  say(e, t = 2) { this.emote = e; this.emoteT = t; }
  draw(c) {
    if (this.drawCustom) return this.drawCustom(c);
    const set = this.sprites();
    const f = this.moving ? Math.floor(this.anim) % 4 : 0;
    let img = set[this.dir][f];
    if (!this.moving && this.blinkT < 0 && this.dir === 'down') img = set.blink[0];
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(Math.round(this.x), Math.round(this.y), 6, 2, 0, 0, 7); c.fill();
    if (this.sitting) c.drawImage(img, 0, 0, 22, 26, Math.round(this.x - 11), Math.round(this.y - 29), 22, 26);
    else c.drawImage(img, Math.round(this.x - 11), Math.round(this.y - 35));
    if (this.afterDraw) this.afterDraw(c);
    if (this.emote) drawEmote(c, this.x, this.y - 38, this.emote);
  }
}
function drawEmote(c, x, y, e) {
  x = Math.round(x); y = Math.round(y);
  c.fillStyle = '#f4efe4'; c.fillRect(x - 6, y - 9, 13, 9); c.fillRect(x - 1, y, 3, 2);
  c.fillStyle = '#16120f'; c.fillRect(x - 6, y - 10, 13, 1); c.fillRect(x - 7, y - 9, 1, 9); c.fillRect(x + 7, y - 9, 1, 9); c.fillRect(x - 6, y, 5, 1); c.fillRect(x + 2, y, 5, 1);
  c.fillStyle = '#16120f';
  if (e === '...') { c.fillRect(x - 3, y - 4, 1, 1); c.fillRect(x, y - 4, 1, 1); c.fillRect(x + 3, y - 4, 1, 1); }
  else if (e === '!') { c.fillStyle = '#c33'; c.fillRect(x, y - 8, 1, 4); c.fillRect(x, y - 3, 1, 1); }
  else if (e === '?') { c.fillRect(x - 1, y - 8, 3, 1); c.fillRect(x + 1, y - 7, 1, 2); c.fillRect(x, y - 5, 1, 1); c.fillRect(x, y - 3, 1, 1); }
  else if (e === '♪') { c.fillStyle = '#36a'; c.fillRect(x - 2, y - 4, 2, 2); c.fillRect(x - 1, y - 8, 1, 4); c.fillRect(x - 1, y - 8, 3, 1); }
  else if (e === '♥') { c.fillStyle = '#d34'; c.fillRect(x - 3, y - 7, 2, 2); c.fillRect(x + 1, y - 7, 2, 2); c.fillRect(x - 3, y - 6, 6, 2); c.fillRect(x - 2, y - 4, 4, 1); c.fillRect(x - 1, y - 3, 2, 1); }
  else if (e === 'z') { c.fillRect(x - 2, y - 7, 4, 1); c.fillRect(x + 1, y - 6, 1, 1); c.fillRect(x, y - 5, 1, 1); c.fillRect(x - 1, y - 4, 1, 1); c.fillRect(x - 2, y - 3, 4, 1); }
  else if (e === ':(') { c.fillRect(x - 2, y - 7, 1, 1); c.fillRect(x + 2, y - 7, 1, 1); c.fillRect(x - 2, y - 3, 1, 1); c.fillRect(x - 1, y - 4, 3, 1); c.fillRect(x + 2, y - 3, 1, 1); }
}

// ---------------------------------------------------------------- objeto físico (telecinese / desfazer)
class Item extends Ent {
  constructor(o) {
    super(o.x, o.y);
    Object.assign(this, { type: 'copo', z: 0, vx: 0, vy: 0, vz: 0, fragile: false, broken: false, tk: true, history: [], histT: 0, rewinding: 0, bw: 8, bh: 4, solid: false }, o);
  }
  update(dt) {
    // histórico p/ desfazer (5 s)
    if (this.rewinding > 0) {
      this.rewinding -= dt;
      for (let k = 0; k < 3; k++) {
        const s = this.history.pop();
        if (s) { this.x = s.x; this.y = s.y; this.z = s.z; this.broken = s.b; this.vx = this.vy = this.vz = 0; }
      }
      if (Math.random() < 0.6) FX.add({ x: this.x + U.rand(-4, 4), y: this.y - this.z - U.rand(0, 8), vx: 0, vy: U.rand(-10, 10), life: 0.4, color: '#8fd8ff', size: 1, ignoreFreeze: true });
      if (!this.history.length) this.rewinding = 0;
      if (this.rewinding <= 0 && this.onRestored && !this.broken) { const cb = this.onRestored; cb(this); }
      return;
    }
    this.histT += dt;
    if (this.histT > 0.05) { this.histT = 0; this.history.push({ x: this.x, y: this.y, z: this.z, b: this.broken }); if (this.history.length > 100) this.history.shift(); }
    if (G.player.held === this) {
      const [fx, fy] = G.player.facingPoint(14);
      const tx = fx, ty = fy + 6;
      this.x = U.lerp(this.x, tx, 0.25); this.y = U.lerp(this.y, ty, 0.25);
      this.z = U.lerp(this.z, 14 + Math.sin(G.t * 3) * 2, 0.2);
      if (Math.random() < 0.4) FX.ember(this.x, this.y - this.z);
      return;
    }
    if (this.suspended) { this.vz = 0; return; }
    // física simples
    if (this.z > 0 || this.vz !== 0) {
      this.vz -= 260 * dt; this.z += this.vz * dt;
      if (this.z <= 0) {
        this.z = 0;
        if (Math.abs(this.vz) > 70 && this.fragile && !this.broken && !this.gentle) this.break();
        else if (this.gentle) { this.vz = 0; this.gentle = false; }
        else if (Math.abs(this.vz) > 40) { this.vz = -this.vz * 0.3; Audio2.sfx('thud'); } else this.vz = 0;
      }
    }
    if (this.vx || this.vy) {
      const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
      const b = { x: nx - this.bw / 2, y: ny - this.bh, w: this.bw, h: this.bh };
      let hit = !World.boxFree(b.x, b.y, b.w, b.h, this);
      if (hit && this.z > 18) hit = false;
      if (hit) {
        const sp = Math.hypot(this.vx, this.vy);
        if (this.fragile && sp > 60 && !this.broken) this.break();
        this.vx *= -0.3; this.vy *= -0.3; Audio2.sfx('thud');
      } else { this.x = nx; this.y = ny; }
      const f = this.z > 0 ? 0.4 : 4;
      this.vx *= Math.max(0, 1 - f * dt); this.vy *= Math.max(0, 1 - f * dt);
      if (Math.abs(this.vx) < 2 && Math.abs(this.vy) < 2 && this.z <= 0) this.vx = this.vy = 0;
    }
  }
  break() {
    this.broken = true; this.vx = this.vy = this.vz = 0; this.z = 0;
    Audio2.sfx('glass');
    FX.burst(this.x, this.y - 2, 10, ['#d8f0f8', '#b8dce8', '#ffffff'], 50, 0.5, { g: 120 });
    if (this.onBreak) this.onBreak(this);
  }
  undo() {
    if (this.history.length < 3) return false;
    this.rewinding = 1.4;
    return true;
  }
  draw(c) {
    if (this.z > 0 || G.player.held === this) { c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(Math.round(this.x), Math.round(this.y), 4, 1.5, 0, 0, 7); c.fill(); }
    const hl = G.player.held === this || this === Powers.tkTarget;
    if (hl) { c.globalAlpha = 0.5 + Math.sin(G.t * 8) * 0.2; c.fillStyle = '#ffb347'; c.fillRect(Math.round(this.x) - 5, Math.round(this.y - this.z) - 9, 11, 11); c.globalAlpha = 1; }
    ItemArt.draw(c, this.type, Math.round(this.x), Math.round(this.y - this.z), this.broken, G.t);
    if (this.suspendDrop) { c.fillStyle = '#9fd8f0'; c.fillRect(Math.round(this.x) + 1, Math.round(this.y - this.z) + 2, 1, 2); }
  }
}

// ---------------------------------------------------------------- pombos
class Pigeon extends Ent {
  constructor(x, y) {
    super(x, y);
    this.col = U.irand(0, 2); this.state = 'walk'; this.t = U.rand(0, 3); this.dirx = Math.random() < .5 ? -1 : 1;
    this.homeX = x; this.homeY = y; this.z = 0; this.f = 0; this.fly = { vx: 0, vy: 0 };
  }
  update(dt) {
    this.t -= dt; this.f += dt * (this.state === 'fly' ? 10 : 3);
    const p = G.player;
    if (this.state !== 'fly' && this.state !== 'away') {
      const d = U.dist(this.x, this.y, p.x, p.y);
      if (d < 26 && (p.moving || p.held)) this.scare();
      if (this.feed && U.dist(this.x, this.y, this.feed.x, this.feed.y) > 3) { const dx = this.feed.x - this.x, dy = this.feed.y - this.y, dd = Math.hypot(dx, dy); this.x += dx / dd * 14 * dt; this.y += dy / dd * 14 * dt; this.dirx = dx > 0 ? 1 : -1; return; }
      if (this.t <= 0) {
        this.t = U.rand(0.6, 2.4);
        this.state = Math.random() < 0.5 ? 'peck' : 'walk';
        if (Math.random() < 0.15) Audio2.sfx('coo');
        if (this.state === 'walk') { this.dirx = Math.random() < .5 ? -1 : 1; this.vy0 = U.rand(-4, 4); }
      }
      if (this.state === 'walk') {
        const nx = this.x + this.dirx * 8 * dt, ny = this.y + (this.vy0 || 0) * dt;
        if (U.dist(nx, ny, this.homeX, this.homeY) < 30) { this.x = nx; this.y = ny; } else this.dirx *= -1;
      }
    } else if (this.state === 'fly') {
      this.x += this.fly.vx * dt; this.y += this.fly.vy * dt; this.z += 40 * dt;
      if (this.t <= 0) { this.state = 'away'; this.t = U.rand(6, 12); this.hidden = true; }
    } else if (this.state === 'away') {
      if (this.t <= 0) { this.hidden = false; this.x = this.homeX + U.rand(-10, 10); this.y = this.homeY + U.rand(-6, 6); this.z = 0; this.state = 'walk'; }
    }
  }
  scare() {
    if (this.state === 'fly' || this.state === 'away') return;
    this.state = 'fly'; this.t = U.rand(1.6, 2.4);
    const a = Math.atan2(this.y - G.player.y, this.x - G.player.x) + U.rand(-.6, .6);
    this.fly.vx = Math.cos(a) * 70; this.fly.vy = Math.sin(a) * 40 - 30; this.dirx = this.fly.vx > 0 ? 1 : -1;
    if (Math.random() < 0.5) Audio2.noise(0.25, 0.04, 2500, 'bandpass', 0, 3);
  }
  draw(c) {
    const img = Beasts.pigeon(Math.floor(this.f), this.state === 'fly', this.col);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(Math.round(this.x) - 3, Math.round(this.y), 6, 1);
    c.save(); c.translate(Math.round(this.x), Math.round(this.y - this.z - 8));
    if (this.dirx < 0) c.scale(-1, 1);
    c.drawImage(img, -6, 0); c.restore();
  }
}

// ---------------------------------------------------------------- cachorro
class Dog extends Ent {
  constructor(o) { super(o.x, o.y); Object.assign(this, { f: 0, dirx: 1, sit: true, follow: false, t: 2, bw: 12, bh: 4 }, o); }
  update(dt) {
    this.t -= dt;
    if (this.follow) {
      const p = G.player, d = U.dist(this.x, this.y, p.x, p.y);
      if (d > 22) { const dx = p.x - this.x, dy = p.y - this.y; this.x += dx / d * 58 * dt; this.y += dy / d * 58 * dt; this.dirx = dx > 0 ? 1 : -1; this.sit = false; this.f += dt * 10; }
      else { this.sit = true; }
    } else if (this.wander) {
      if (this.t <= 0) { this.t = U.rand(1, 3); this.mv = Math.random() < .5 ? 0 : (Math.random() < .5 ? -1 : 1); }
      if (this.mv) { this.x += this.mv * 14 * dt; this.dirx = this.mv; this.f += dt * 8; this.sit = false; if (Math.abs(this.x - this.homeX) > 30) this.mv *= -1; } else this.sit = true;
    }
    if (this.barkAt && this.t <= 0 && Math.random() < 0.01) { Audio2.sfx('bark'); this.emote = '!'; this.emoteT = 0.6; }
    if (this.emoteT > 0) this.emoteT -= dt; else this.emote = null;
  }
  draw(c) {
    const img = Beasts.dog(Math.floor(this.f), this.sit);
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(Math.round(this.x), Math.round(this.y), 8, 2, 0, 0, 7); c.fill();
    c.save(); c.translate(Math.round(this.x), Math.round(this.y - 15));
    if (this.dirx < 0) c.scale(-1, 1);
    c.drawImage(img, -11, 0); c.restore();
    if (this.emote) drawEmote(c, this.x, this.y - 18, this.emote);
  }
}

// ---------------------------------------------------------------- carros
class Car extends Ent {
  constructor(o) {
    super(o.x, o.y);
    Object.assign(this, { dirx: 1, speed: U.rand(70, 110), color: U.pick(['#c24a3a', '#3a6aa0', '#e8e4da', '#2a2a2e', '#6a8a4a', '#d8a83a', '#8a8a92']), bw: 34, bh: 10, solid: false, v: 0 }, o);
    this.v = this.speed;
  }
  box() { return { x: this.x - 18, y: this.y - 10, w: 36, h: 10 }; }
  update(dt) {
    // parar no semáforo (faixa de pedestre)
    const sem = Story.traffic;
    let target = this.speed;
    if (sem && sem.state !== 'green') {
      const stopX = this.dirx > 0 ? sem.x0 - 22 : sem.x1 + 22;
      const ahead = this.dirx > 0 ? stopX - this.x : this.x - stopX;
      if (ahead > 0 && ahead < 70) target = ahead < 6 ? 0 : Math.min(target, ahead * 1.6);
    }
    // não bater no carro da frente
    for (const e of G.entities) if (e instanceof Car && e !== this && e.y === this.y) {
      const gap = this.dirx > 0 ? e.x - this.x : this.x - e.x;
      if (gap > 0 && gap < 46) target = Math.min(target, Math.max(0, (gap - 40) * 3));
    }
    if (this.override !== undefined) target = this.override;
    this.v = U.lerp(this.v, target, Math.min(1, dt * (target < this.v ? 4 : 1.2)));
    this.x += this.dirx * this.v * dt;
    const mw = G.map.w * TILE;
    if (this.dirx > 0 && this.x > mw + 60) { this.x = -60 - U.rand(0, 200); this.color = U.pick(['#c24a3a', '#3a6aa0', '#e8e4da', '#2a2a2e', '#6a8a4a', '#d8a83a']); this.speed = U.rand(70, 110); }
    if (this.dirx < 0 && this.x < -60) { this.x = mw + 60 + U.rand(0, 200); this.speed = U.rand(70, 110); }
    // atropelamento evitado: empurra o jogador
    const p = G.player, b = this.box();
    if (this.v > 20 && U.overlap(b, p.box())) {
      p.y += (p.y < this.y - 5 ? -1 : 1) * 3; G.cam.shake = 2; if (!this._honk) { Audio2.sfx('horn'); this._honk = 1.5; }
    }
    if (this._honk) { this._honk -= dt; if (this._honk <= 0) this._honk = 0; }
  }
  draw(c) {
    c.drawImage(Beasts.car(this.color, 0, this.dirx), Math.round(this.x - 20), Math.round(this.y - 22));
    if (G.map.dark > 0.3) { c.fillStyle = 'rgba(255,240,180,.25)'; const fx = this.dirx > 0 ? this.x + 18 : this.x - 40; c.fillRect(Math.round(fx), Math.round(this.y - 13), 22, 5); }
  }
}

// ---------------------------------------------------------------- a Van
class VanEnt extends Ent {
  constructor(o) {
    super(o.x, o.y);
    Object.assign(this, { name: 'a Van', lights: false, wiper: 0, wiperT: 0, radio: false, cold: false, bw: 60, bh: 12, solid: true, engine: false, blinkQ: [], ignoreFreeze: true, light: null, flip: false, alpha: 1 }, o);
  }
  box() { return { x: this.x - 31, y: this.y - 10, w: 62, h: 10 }; }
  update(dt) {
    if (this.blinkQ.length) {
      const b = this.blinkQ[0]; b.t -= dt; this.lights = b.on;
      if (b.t <= 0) { this.blinkQ.shift(); if (b.on) Audio2.sfx('lights'); }
    }
    if (this.wiperT > 0) { this.wiperT -= dt; this.wiper = Math.floor(this.wiperT * 6) % 2; } else this.wiper = 0;
    if (this.radio && Math.random() < 0.06) FX.add({ type: 'note', x: this.x + U.rand(-10, 20), y: this.y - 28, vx: U.rand(-6, 6), vy: -14, life: 1.6, color: U.pick(['#f5c542', '#f08a5d', '#a9d6c8', '#e85a8a']) });
    if (this.engine && Math.random() < 0.05) FX.add({ type: 'smoke', x: this.x - 33, y: this.y - 6, vx: -6, vy: -4, life: 0.9, color: '#9a9a9a', size: 2 });
    this.light = this.lights ? { r: 60, a: 0.8, ox: 30 } : null;
  }
  draw(c) {
    c.globalAlpha = this.alpha;
    const img = Beasts.van(this.lights, this.wiper, 0, this.cold);
    c.save(); c.translate(Math.round(this.x), Math.round(this.y - 36));
    if (this.flip) c.scale(-1, 1);
    c.drawImage(img, -33, 0);
    if (this.lights) { c.fillStyle = 'rgba(255,246,190,.18)'; c.beginPath(); c.moveTo(30, 20); c.lineTo(70, 10); c.lineTo(70, 36); c.closePath(); c.fill(); }
    c.restore();
    c.globalAlpha = 1;
  }
  // linguagem da Van
  blink(n) { for (let i = 0; i < n; i++) { this.blinkQ.push({ on: true, t: 0.22 }); this.blinkQ.push({ on: false, t: 0.18 }); } }
  wipe(t = 2) { this.wiperT = t; Audio2.noise(t, 0.03, 600, 'lowpass'); }
  horn() { Audio2.sfx('horn'); G.cam.shake = 1.5; }
}

// ---------------------------------------------------------------- objeto que brilha para ser coletado (páginas do caderno etc.)
class Pickup extends Ent {
  constructor(o) { super(o.x, o.y); Object.assign(this, { type: 'pagina', bob: Math.random() * 6 }, o); }
  update(dt) {
    this.bob += dt * 3;
    if (U.dist(this.x, this.y, G.player.x, G.player.y) < 12 && !G.cutscene) { this.dead = true; if (this.onPick) this.onPick(this); }
    if (Math.random() < 0.05) FX.add({ x: this.x + U.rand(-4, 4), y: this.y - 8 + U.rand(-4, 4), vx: 0, vy: -8, life: 0.8, color: '#ffe9a8', size: 1 });
  }
  draw(c) { ItemArt.draw(c, this.type, Math.round(this.x), Math.round(this.y - 3 + Math.sin(this.bob) * 2), false, G.t); }
}

// ---------------------------------------------------------------- fantasma/fragmento genérico (desenho custom)
class Custom extends Ent {
  constructor(o) { super(o.x, o.y); Object.assign(this, o); }
  update(dt) { if (this.tick) this.tick(dt); }
  draw(c) { if (this.render) this.render(c); }
}
