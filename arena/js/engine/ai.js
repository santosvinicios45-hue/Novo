// =====================================================================
//  ai.js — inteligência artificial. Ela enxerga o adversário com atraso
//  (tempo de reação), decide por prioridades e aperta os MESMOS botões
//  que um jogador: não ignora recuperação, custo de energia nem regras.
//  A dificuldade muda reação, precisão, chance de defender e de errar.
// =====================================================================
'use strict';

const AI_LEVELS = {
  easy:   { react: 24, think: 12, block: 0.22, lowRead: 0.3, antiAir: 0.15, punish: 0.12, confirm: 0.3, mistake: 0.22, special: 0.25, superUse: 0.3, tech: 0.05, dodgeProj: 0.25 },
  normal: { react: 15, think: 7,  block: 0.5,  lowRead: 0.6, antiAir: 0.45, punish: 0.45, confirm: 0.65, mistake: 0.08, special: 0.45, superUse: 0.7, tech: 0.3, dodgeProj: 0.55 },
  hard:   { react: 9,  think: 4,  block: 0.78, lowRead: 0.85, antiAir: 0.75, punish: 0.8, confirm: 0.9, mistake: 0.02, special: 0.6, superUse: 1, tech: 0.6, dodgeProj: 0.8 },
};

class AI {
  constructor(f, level) {
    this.f = f; this.level = level;
    this.p = AI_LEVELS[level] || AI_LEVELS.normal;
    this.prof = f.def.ai;
    this.ctrl = f.ctrl;
    this.ctrl.ai = { held: {}, taps: {} };
    this.enabled = true;
    this.hist = [];
    this.reset();
  }
  reset() { this.plan = null; this.thinkT = 30; this.combo = null; this.hist.length = 0; this.ctrl.ai.held = {}; }

  // o que a IA "vê" do adversário, com atraso de reação
  snap() {
    const o = this.f.opp, m = o.move;
    let reach = 0, low = false;
    if (m && m.hits) for (const h of m.hits) { if (h.box) reach = Math.max(reach, h.box.x + h.box.w); if (h.level === 'low') low = true; }
    if (m && (m.type === 'throw' || (m.hits && m.hits[0].grab))) reach = Math.max(reach, m.hits[0].range || o.phys.throwRange);
    const s = { x: o.x, y: o.y, vx: o.vx, vy: o.vy, state: o.state, phase: o.phase(), reach, low, high: !!(m && m.hits && m.hits[0].level === 'high'), grab: !!(m && (m.type === 'throw' || (m.hits && m.hits[0].grab))), grounded: o.grounded, type: m ? m.type : null, f: m ? o.moveF : 0, left: m ? m.total - o.moveF : 0 };
    this.hist.push(s);
    if (this.hist.length > 40) this.hist.shift();
  }
  seen() { return this.hist[Math.max(0, this.hist.length - 1 - this.p.react)]; }

  update() {
    if (!this.enabled) return;
    const f = this.f, ai = this.ctrl.ai;
    this.snap();
    if (f.match.phase !== 'fight' || !f.inputOn) { ai.held = {}; this.plan = null; return; }
    // escapar de agarrão comum
    if (f.state === 'locked' && f.stateT < 3 && U.chance(this.p.tech * 0.3)) { ai.held = { block: true }; ai.taps.lp = true; }
    if (this.combo) this.runCombo();
    if (this.plan) {
      const pl = this.plan;
      ai.held = pl.switchAt != null && pl.t >= pl.switchAt ? pl.hold2 : pl.hold;
      if (pl.taps && pl.taps[pl.t]) for (const b of pl.taps[pl.t]) ai.taps[b] = true;
      if (++pl.t >= pl.dur) this.plan = null;
      if (pl.interruptible === false) return;
    }
    if (--this.thinkT <= 0) { this.thinkT = this.p.think + U.irand(0, 3); this.think(); }
  }

  // ------------------------------------------------------------ ações
  dirs(o) {
    const fk = this.f.facing > 0 ? 'right' : 'left', bk = this.f.facing > 0 ? 'left' : 'right';
    const h = {};
    if (o.fwd) h[fk] = true;
    if (o.back) h[bk] = true;
    if (o.down) h.down = true;
    if (o.up) h.up = true;
    if (o.block) h.block = true;
    return h;
  }
  hold(o, dur, interruptible = true) { this.plan = { hold: this.dirs(o), dur, t: 0, interruptible }; }
  // traduz o id do golpe para entradas
  press(id) {
    const map = {
      lp: [{}, 'lp'], hp: [{}, 'hp'], lk: [{ fwd: 1 }, 'lp'], hk: [{ fwd: 1 }, 'hp'], clp: [{ down: 1 }, 'lp'], chk: [{ down: 1 }, 'hp'],
      air_l: [{}, 'lp'], air_h: [{}, 'hp'], throw: [{ block: 1 }, 'lp'], su: [{}, 'su'], transform: [{ down: 1 }, 'su'],
    };
    let d, b;
    if (map[id]) [d, b] = map[id];
    else {
      const m = /^(sp2?|su)(?:_(fwd|back|down))?$/.exec(id);
      if (!m) return false;
      b = m[1]; d = m[2] ? { [m[2]]: 1 } : {};
    }
    if (!this.f.def.moves[id]) return false;
    this.plan = { hold: this.dirs(d), dur: 3, t: 0, taps: { 0: [b] }, interruptible: false };
    return true;
  }
  startCombo(list) {
    if (!list || !list.length) return;
    this.combo = { list: list.filter(id => this.f.def.moves[id]), i: 0, wait: 0 };
    if (!this.combo.list.length) { this.combo = null; return; }
    this.press(this.combo.list[0]);
  }
  runCombo() {
    const c = this.combo, f = this.f;
    if (++c.wait > 90) { this.combo = null; return; }
    if (f.state !== 'attack') { if (c.wait > 8) this.combo = null; return; }
    if (!f.connected || !f.move || f.moveF < f.move.startup + 1) return;
    if (c.i + 1 >= c.list.length) { this.combo = null; return; }
    const blocked = f.connected === 2;
    // confirmação: só continua se acertou (ou com especial seguro no bloqueio)
    const next = c.list[c.i + 1];
    const nm = f.def.moves[next];
    if (blocked && !(nm && nm.type === 'special' && nm.safe)) { this.combo = null; return; }
    if (!U.chance(this.p.confirm)) { this.combo = null; return; }
    if (nm && nm.cost && f.energy < f.costOf(nm)) { this.combo = null; return; }
    c.i++; c.wait = 0;
    this.press(next);
  }

  // ------------------------------------------------------------ decisão
  think() {
    const f = this.f, o = this.seen(), P = this.p, pr = this.prof;
    if (!o) return;
    const dist = Math.abs(o.x - f.x);
    const me = f.state;
    const actionable = f.isNeutral() || me === 'air';
    if (!actionable && me !== 'blockstun') return;
    if (this.plan && this.plan.interruptible === false) return;
    const opp = f.opp;

    // erro proposital (dificuldades baixas)
    if (U.chance(P.mistake)) {
      const r = Math.random();
      if (r < 0.3) this.hold({ up: 1, fwd: U.chance(0.5) ? 1 : 0 }, 4);
      else if (r < 0.6) this.press(U.pick(['lp', 'hp', 'hk', 'chk']));
      else this.hold({}, U.irand(10, 25));
      return;
    }
    if (me === 'blockstun') { this.hold({ block: 1, down: o.low ? 1 : 0 }, 6); return; }

    // projéteis chegando
    const proj = f.match.projectiles.find(p => p.owner !== f && p.alive && p.t >= P.react && Math.sign(p.vx || 0) === Math.sign(f.x - p.x) && Math.abs(p.x - f.x) < 170);
    if (proj && f.grounded && U.chance(P.dodgeProj)) {
      const r = Math.random();
      if (pr.projAnswer && f.def.moves[pr.projAnswer] && f.moveOk(pr.projAnswer) && r < 0.35) { this.press(pr.projAnswer); return; }
      if (proj.hit.level !== 'low' && r < 0.6 && dist < 230) { this.hold({ up: 1, fwd: 1 }, 4); return; }
      this.hold({ block: 1, down: proj.hit.level === 'low' ? 1 : 0 }, 18); return;
    }

    // adversário atacando perto: defender
    if ((o.phase === 'startup' || o.phase === 'active') && dist < (o.reach || 60) + 35) {
      if (o.grab) {
        if (U.chance(P.block)) { this.hold({ back: 1, up: 1 }, 4); return; }
      } else if (pr.counter && f.moveOk(pr.counter) && U.chance(P.special * 0.25)) {
        this.press(pr.counter); return;
      } else if (U.chance(P.block)) {
        const low = o.low ? U.chance(P.lowRead) : false;
        this.hold({ block: 1, down: low ? 1 : 0 }, Math.max(8, o.left + 4));
        return;
      }
    }

    // anti-aéreo
    if (!o.grounded && o.vy > -4 && dist < 115 && Math.sign(o.vx || 0) !== Math.sign(o.x - f.x) && f.grounded) {
      if (U.chance(P.antiAir)) { if (!(pr.antiAir && f.moveOk(pr.antiAir) && this.press(pr.antiAir))) this.press('hp'); return; }
      if (U.chance(P.block)) { this.hold({ block: 1 }, 14); return; }
    }

    // punir recuperação / aterrissagem / derrubado levantando
    if (o.phase === 'recovery' && o.left > 6 && f.grounded && U.chance(P.punish)) {
      const combo = this.bestCombo(dist);
      if (combo) { this.startCombo(combo); return; }
    }

    if (!f.grounded) {
      // ataque aéreo quando estiver caindo perto
      if (!f.airUsed && dist < 70 && f.vy > -2 && U.chance(0.6)) this.press(U.chance(0.5) ? 'air_h' : 'air_l');
      return;
    }

    // recursos: transformação e supremo
    if (f.def.moves.transform && f.moveOk('transform') && U.chance(P.superUse * 0.5)) { this.press('transform'); return; }
    if (f.moveOk('su') && dist < (pr.superRange || 140) && (o.phase === 'recovery' || opp.state === 'hitstun' || U.chance(0.05)) && U.chance(P.superUse * 0.6)) { this.press('su'); return; }

    // controle de distância
    const want = pr.range;
    if (opp.state === 'knockdown' || opp.state === 'getup') { this.hold(dist > want ? { fwd: 1 } : { back: 1 }, 10); return; }
    if (pr.projectile && dist > 170 && f.moveOk(pr.projectile) && U.chance(pr.zoning * P.special * 2)) { this.press(pr.projectile); return; }
    if (pr.tricks && dist < 220 && U.chance(0.05 * P.special)) { const tr = U.pick(pr.tricks); if (f.moveOk(tr)) { this.press(tr); return; } }
    if (dist > want + 40) {
      const r = Math.random();
      if (pr.approach && f.moveOk(pr.approach) && dist < 240 && r < 0.12 * P.special * 2) { this.press(pr.approach); return; }
      if (r < 0.12 * pr.aggression) { this.hold({ up: 1, fwd: 1 }, 4); return; }
      if (dist > 260 && r < 0.4) { this.runForward(); return; }
      this.hold({ fwd: 1 }, U.irand(8, 18)); return;
    }
    if (dist < f.phys.throwRange - 6 && U.chance(0.25 * pr.aggression + 0.05)) { this.press(pr.grab && f.moveOk(pr.grab) && U.chance(0.4) ? pr.grab : 'throw'); return; }
    if (dist < want + 30) {
      const r = Math.random();
      if (r < pr.aggression * 0.7) { const c = this.bestCombo(dist); if (c) { this.startCombo(c); return; } }
      if (r < pr.aggression * 0.85 && pr.pressure) { this.press(U.pick(pr.pressure)); return; }
      if (dist < want - 25 && r < 0.6) { this.hold({ back: 1 }, U.irand(8, 16)); return; }
      if (r < 0.92) { this.hold({ block: 1, down: U.chance(0.4) ? 1 : 0 }, U.irand(8, 18)); return; }
      this.hold({ up: 1, back: 1 }, 4);
      return;
    }
    this.hold({ fwd: 1 }, U.irand(6, 12));
  }

  runForward() {
    // duplo toque para correr: frente, solta, frente e segura
    const fk = this.f.facing > 0 ? 'right' : 'left';
    this.plan = { hold: {}, hold2: { [fk]: true }, switchAt: 3, dur: 22, t: 0, taps: { 0: [fk], 2: [fk] }, interruptible: true };
  }

  // escolhe um combo do perfil que alcance a distância atual
  bestCombo(dist) {
    const f = this.f, list = this.prof.combos || [];
    const ok = list.filter(c => {
      const m = f.def.moves[c[0]];
      if (!m || !m.hits) return false;
      const b = m.hits[0].box;
      const reach = b ? b.x + b.w : (m.hits[0].range || 50);
      return dist <= reach + 6;
    });
    return ok.length ? U.pick(ok) : null;
  }
}
VA.AI = AI;
VA.AI_LEVELS = AI_LEVELS;
