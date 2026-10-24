// =====================================================================
//  match.js — a partida: rounds, cronômetro, K.O., câmera, cinemáticas
//  dos supremos, empurrão entre corpos, modo treino e resultado.
// =====================================================================
'use strict';

const COMBO_STATES = { hitstun: 1, air_hit: 1, locked: 1, dizzy: 1 };

class Match {
  // o: { mode, p1:{char, human, ai}, p2:{...}, stage, rounds, timer, training, p1hp, onEnd }
  constructor(o) {
    this.o = o;
    this.mode = o.mode;
    this.stage = VA.stages[o.stage] || VA.stages[VA.stageOrder[0]];
    this.roundsNeeded = o.rounds || 2;
    this.timerMax = o.timer || 99;
    this.training = o.training || null;
    this.projectiles = [];
    this.fighters = [];
    this.ais = [];
    const P = [o.p1, o.p2];
    for (let i = 0; i < 2; i++) {
      const ctrl = Input.ctrls[i];
      ctrl.clear(); ctrl.ai = null;
      const f = new VA.Fighter(VA.chars[P[i].char], i, ctrl, this);
      this.fighters.push(f);
    }
    for (let i = 0; i < 2; i++) if (P[i].ai) this.ais.push(new VA.AI(this.fighters[i], P[i].ai));
    if (o.p1hp != null) this.fighters[0].hp = o.p1hp;
    this.wins = [0, 0];
    this.round = 0;
    this.frame = 0; this.totalFrames = 0;
    this.cam = { x: this.stage.width / 2 - W / 2, y: 0, z: 1, tz: 1 };
    this.cinematic = null; this.slowmo = 0;
    this.announces = [];
    this.result = null;
    this.events = [];       // registro para o treino
    this.adv = null;        // vantagem de quadros (treino)
    FX.clear();
    if (this.stage.init) this.stage.init(this);
    this.startRound();
  }

  startRound() {
    this.round++;
    this.phase = 'intro'; this.phaseT = 0;
    this.timer = this.timerMax; this.timerSub = 0;
    this.projectiles.length = 0;
    const keep = this.round === 1 && this.o.p1hp != null;
    this.fighters[0].roundReset(-110, keep);
    if (keep) this.fighters[0].hp = this.o.p1hp;
    this.fighters[1].roundReset(110);
    if (this.training) { this.phase = 'fight'; for (const f of this.fighters) { f.setState('idle'); f.inputOn = true; } }
    for (const a of this.ais) a.reset();
  }

  // ------------------------------------------------------------ eventos
  announce(text, color = '#fff', dur = 60, fighter = null, big = false) {
    this.announces.push({ text, color, dur, t: 0, side: fighter ? fighter.side : -1, big });
    if (this.announces.length > 6) this.announces.shift();
  }
  onMoveStart(f, m) {
    if (this.training) this.logEvent(f, m.name || m.id, m.type);
  }
  onDamage(att, def, dmg, h, kind, counter) {
    if (this.training) {
      this.training.lastDmg = dmg;
      this.training.lastHit = def.combo;
      this.training.comboDmg = def.comboDmg;
      if (def.combo > (this.training.maxCombo || 0)) this.training.maxCombo = def.combo;
      this.trackAdv(att, def);
    }
    if (this.o.onDamage) this.o.onDamage(att, def, dmg, kind);
  }
  onBlock(att, def) { if (this.training) this.trackAdv(att, def); }
  trackAdv(att, def) { this.adv = { att, def, a: -1, d: -1, start: this.frame }; }
  logEvent(f, name, type) {
    const L = this.events;
    L.push({ side: f.side, name, type, frame: this.frame });
    if (L.length > 14) L.shift();
  }
  stageImpact(x, power) { if (this.stage.onImpact) this.stage.onImpact(this, x, power); }

  startCinematic(owner, c) {
    this.cinematic = Object.assign({ dur: 45, zoom: 1.5, text: '', color: '#fff', darken: 0.65 }, c, { owner, t: 0 });
    owner.invuln = Math.max(owner.invuln, this.cinematic.dur + 6);
    owner.stats.supers += c.isSuper ? 1 : 0;
    Audio2.sfx(c.sfx || 'super');
    FX.flash(c.color || '#ffffff', 0.5, 0.05);
    if (c.say) Audio2.say(c.say);
  }

  // limites onde os lutadores podem ficar (arena e câmera)
  bounds() {
    const [a, b] = this.fighters;
    const mid = (a.x + b.x) / 2;
    const cx = U.clamp(mid - W / 2, 0, this.stage.width - W);
    this.boundsObj = this.boundsObj || { l: 0, r: 0 };
    this.boundsObj.l = Math.max(18, cx + 18);
    this.boundsObj.r = Math.min(this.stage.width - 18, cx + W - 18);
    return this.boundsObj;
  }

  // ------------------------------------------------------------ passo lógico (60 Hz)
  step() {
    this.frame++;
    if (this.timeStop > 0) this.timeStop--;
    for (const a of this.ais) a.update();
    if (this.training) this.trainingStep();
    FX.update();
    if (this.stage.update) this.stage.update(this);
    this.updateAnnounces();
    if (this.cinematic) { this.stepCinematic(); this.updateCamera(); return; }
    if (this.slowmo > 0) { this.slowmo--; if (this.slowmo % 3) { this.updateCamera(); return; } }
    this.totalFrames++;
    for (const f of this.fighters) {
      if (f.hitstop > 0) { f.hitstop--; continue; }
      f.update();
    }
    this.pushApart();
    VA.Combat.step(this);
    for (const f of this.fighters) {
      f.computePose();
      if (this.frame % 2 === 0) f.recordTrail();
    }
    for (const f of this.fighters) {
      if (!COMBO_STATES[f.state] && f.hitstop === 0 && f.combo > 0) {
        if (f.combo >= 2) this.onComboEnd(f);
        f.combo = 0; f.comboDmg = 0; f.juggle = 0;
        if (f.invuln === 99) f.invuln = 0;
      }
    }
    if (this.adv) this.updateAdv();
    this.phaseLogic();
    this.updateCamera();
  }

  onComboEnd(def) {
    const att = this.fighters[1 - def.side];
    this.lastCombo = { side: att.side, hits: def.combo, dmg: def.comboDmg, t: 90 };
    if (this.o.onCombo) this.o.onCombo(att, def.combo, def.comboDmg);
  }

  updateAdv() {
    const A = this.adv, act = f => f.isNeutral() || f.state === 'air';
    if (A.a < 0 && act(A.att)) A.a = this.frame;
    if (A.d < 0 && act(A.def)) A.d = this.frame;
    if (A.a >= 0 && A.d >= 0) { this.training.adv = A.d - A.a; this.adv = null; }
    else if (this.frame - A.start > 120) this.adv = null;
  }

  stepCinematic() {
    const c = this.cinematic, o = c.owner;
    c.t++;
    o.animT++;
    o.computePose();
    if (c.t % 2 === 0) FX.charge(o.x + o.facing * 10, o.y - 60, c.color, 2);
    if (c.t % 3 === 0) FX.speedLines(o.x, o.y - 60, c.color, 1);
    if (c.onTick) c.onTick(o, this, c.t);
    this.cam.tz = c.zoom;
    if (c.t >= c.dur) {
      this.cinematic = null; this.cam.tz = 1;
      if (c.onEnd) c.onEnd(o, this);
    }
  }

  pushApart() {
    const [a, b] = this.fighters;
    if (a.state === 'locked' || b.state === 'locked' || a.lock || b.lock) return;
    if ((a.state === 'attack' && a.move && a.move.noPush) || (b.state === 'attack' && b.move && b.move.noPush)) return;
    if (a.state === 'ko' || b.state === 'ko' || a.state === 'knockdown' || b.state === 'knockdown') return;
    const A = a.pushbox(), B = b.pushbox();
    if (!U.overlap(A, B)) return;
    const over = (A.w + B.w) / 2 - Math.abs(a.x - b.x);
    if (over <= 0) return;
    let dir = a.x < b.x ? -1 : a.x > b.x ? 1 : -a.facing;
    const lim = this.bounds();
    let ma = over / 2, mb = over / 2;
    if ((dir < 0 && a.x - ma < lim.l) || (dir > 0 && a.x + ma > lim.r)) { ma = 0; mb = over; }
    if ((dir < 0 && b.x + mb > lim.r) || (dir > 0 && b.x - mb < lim.l)) { mb = 0; ma = over; }
    a.x += dir * ma; b.x -= dir * mb;
  }

  phaseLogic() {
    this.phaseT++;
    const [a, b] = this.fighters;
    switch (this.phase) {
      case 'intro': {
        const extra = this.round === 1 ? 50 : 0;
        if (this.phaseT === 10 + extra) {
          const last = this.wins[0] === this.roundsNeeded - 1 && this.wins[1] === this.roundsNeeded - 1;
          this.announce(last ? 'ROUND FINAL' : 'ROUND ' + this.round, '#e9e2ff', 60, null, true);
          Audio2.sfx('round'); Audio2.say(last ? 'Round final' : 'Round ' + this.round);
        }
        if (this.phaseT === 70 + extra) { this.announce('LUTE!', '#ffcf5a', 40, null, true); Audio2.sfx('fight'); Audio2.say('Lute!'); }
        if (this.phaseT >= 80 + extra) {
          this.phase = 'fight'; this.phaseT = 0;
          for (const f of this.fighters) { f.setState('idle'); f.inputOn = true; }
        }
        break;
      }
      case 'fight': {
        if (!this.training && this.timerMax < 999 && ++this.timerSub >= FPS) { this.timerSub = 0; this.timer = Math.max(0, this.timer - 1); }
        const ka = a.hp <= 0, kb = b.hp <= 0;
        if (ka || kb) {
          this.phase = 'ko'; this.phaseT = 0; this.slowmo = 60;
          this.announce(ka && kb ? 'DUPLO K.O.' : 'K.O.', '#ff4a5a', 110, null, true);
          Audio2.sfx('ko'); Audio2.say('K.O.'); FX.flash('#ffffff', 0.8, 0.04); FX.shake(8);
          for (const f of this.fighters) f.inputOn = false;
        } else if (this.timer <= 0) {
          this.phase = 'timeover'; this.phaseT = 0;
          this.announce('TEMPO!', '#ffcf5a', 100, null, true); Audio2.say('Tempo!');
          for (const f of this.fighters) f.inputOn = false;
        }
        break;
      }
      case 'ko': case 'timeover': {
        const settled = this.fighters.every(f => f.grounded && !f.lock && f.state !== 'locked' && f.state !== 'air_hit' && (f.state !== 'attack' || this.phaseT > 200));
        if (this.phaseT > 80 && settled) this.endRound();
        break;
      }
      case 'roundEnd':
        if (this.phaseT === 150) {
          const need = this.roundsNeeded;
          if (this.wins[0] >= need || this.wins[1] >= need || this.round >= need * 2 + 1) this.endMatch();
          else this.startRound();
        }
        break;
      case 'matchEnd':
        if (this.phaseT === 90 && this.o.onEnd) this.o.onEnd(this.result, this);
        break;
    }
  }

  endRound() {
    const [a, b] = this.fighters;
    let w;
    if (this.phase === 'ko') w = a.hp <= 0 && b.hp <= 0 ? -1 : a.hp <= 0 ? 1 : 0;
    else { const pa = a.hp / a.maxHp, pb = b.hp / b.maxHp; w = Math.abs(pa - pb) < 0.001 ? -1 : pa > pb ? 0 : 1; }
    this.phase = 'roundEnd'; this.phaseT = 0;
    this.projectiles.length = 0;
    if (w === -1) { this.wins[0]++; this.wins[1]++; this.announce('EMPATE', '#ccc', 120, null, true); }
    else {
      this.wins[w]++;
      const wf = this.fighters[w], lf = this.fighters[1 - w];
      wf.move = null; wf.lock = null; wf.setState('win'); wf.vx = 0;
      if (lf.hp > 0) { lf.move = null; lf.setState('lose'); }
      const perfect = wf.hp >= wf.maxHp;
      if (perfect) { this.announce('PERFEITO', '#7dffb0', 120, null, true); wf.stats.perfect = (wf.stats.perfect || 0) + 1; }
      this.announce(wf.def.name.toUpperCase() + ' VENCE', '#fff', 120, null, !perfect);
      if (wf.def.quotes && wf.def.quotes.win) this.winQuote = { side: w, text: U.pick(wf.def.quotes.win), t: 0 };
      Audio2.sfx(this.isHumanSide(w) ? 'win' : 'lose');
    }
  }
  isHumanSide(i) { return !this.ais.some(a => a.f.side === i); }

  endMatch() {
    const need = this.roundsNeeded;
    let winner = this.wins[0] >= need && this.wins[1] >= need ? -1 : this.wins[0] >= need ? 0 : this.wins[1] >= need ? 1 : (this.wins[0] > this.wins[1] ? 0 : this.wins[1] > this.wins[0] ? 1 : -1);
    this.phase = 'matchEnd'; this.phaseT = 0;
    this.result = {
      winner, wins: this.wins.slice(), rounds: this.round, time: this.totalFrames,
      chars: this.fighters.map(f => f.def.id), stats: this.fighters.map(f => Object.assign({}, f.stats)),
      hpLeft: this.fighters.map(f => f.hp),
    };
  }

  // ------------------------------------------------------------ treino
  trainingStep() {
    const T = this.training, d = this.fighters[1], p = this.fighters[0];
    const ai = this.ais.find(a => a.f === d);
    if (T.dummy !== 'cpu') {
      d.ctrl.ai = d.ctrl.ai || { held: {}, taps: {} };
      if (ai) ai.enabled = false;
      const h = d.ctrl.ai.held;
      for (const k in h) h[k] = false;
      if (T.dummy === 'crouch') h.down = true;
      if (T.dummy === 'jump') h.up = true;
      if (T.dummy === 'block') { h.block = true; h.down = this.fighters[0].move && this.fighters[0].move.hits && this.fighters[0].move.hits[0].level === 'low'; }
      if (T.dummy === 'blockAfter') {
        if (d.combo > 0 || d.state === 'blockstun') T.blockT = 40;
        if (T.blockT > 0) { T.blockT--; h.block = true; h.down = p.move && p.move.hits && p.move.hits[0].level === 'low'; }
      }
    } else if (ai) { ai.enabled = true; }
    if (T.infEnergy) p.energy = VA.ENERGY_MAX;
    // recupera vida depois que o combo termina
    for (const f of this.fighters) {
      if (f.combo > 0 || f.state === 'knockdown' || f.state === 'getup') f.idleT = 0; else f.idleT = (f.idleT || 0) + 1;
      if (T.refill && f.idleT > 50 && f.hp < f.maxHp) f.hp = Math.min(f.maxHp, f.hp + 25);
      if (f.hp <= 0) f.hp = 1;
    }
  }

  resetPositions() {
    for (const f of this.fighters) {
      f.roundReset(f.side === 0 ? -110 : 110);
      f.setState('idle'); f.inputOn = true;
    }
    this.projectiles.length = 0;
    FX.clear();
  }

  // ------------------------------------------------------------ câmera
  updateCamera() {
    const [a, b] = this.fighters, c = this.cam;
    let tx;
    if (this.cinematic) tx = this.cinematic.owner.x - W / 2;
    else if (this.focus) tx = this.focus.x - W / 2;
    else tx = U.clamp((a.x + b.x) / 2 - W / 2, 0, this.stage.width - W);
    c.x += (tx - c.x) * (this.cinematic ? 0.15 : 0.2);
    const top = Math.min(a.y, b.y);
    const ty = Math.min(0, (top - 200) * 0.35);
    c.y += (ty - c.y) * 0.15;
    c.z += ((this.focus ? this.focus.z : c.tz) - c.z) * 0.15;
  }

  // ------------------------------------------------------------ render
  render(ctx) {
    const c = this.cam, z = c.z;
    const sx = (FX.shakeAmt ? U.rand(-FX.shakeAmt, FX.shakeAmt) : 0), sy = (FX.shakeAmt ? U.rand(-FX.shakeAmt, FX.shakeAmt) * 0.6 : 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // fundo com paralaxe (o cenário recebe a câmera)
    this.stage.drawBack(ctx, this, c, z, sx, sy);
    // mundo
    const ay = H * 0.72;
    ctx.setTransform(z, 0, 0, z, (1 - z) * W / 2 - c.x * z + sx, (1 - z) * ay - c.y * z + sy);
    if (this.stage.drawFloor) this.stage.drawFloor(ctx, this);
    // escurecimento durante supremos
    const darkA = this.cinematic ? Math.min(this.cinematic.darken, this.cinematic.t / 10) : (this.darkT > 0 ? this.darkT-- / 30 * 0.6 : 0);
    if (darkA > 0) { ctx.fillStyle = `rgba(4,2,10,${darkA})`; ctx.fillRect(c.x - 200, -200, W + 400, H + 400); }
    FX.draw(ctx, 'back');
    // quem está atacando é desenhado por cima
    const [a, b] = this.fighters;
    const order = (b.state === 'attack' || b.lock) && !(a.state === 'attack' || a.lock) ? [a, b] : [b, a];
    for (const f of order) f.draw(ctx);
    for (const p of this.projectiles) if (p.draw) p.draw(ctx, p, this); else this.drawProj(ctx, p);
    FX.draw(ctx, 'front');
    if (this.stage.drawFront) this.stage.drawFront(ctx, this);
    if (VA.debug.hitboxes || Save.settings.hitboxes) this.drawBoxes(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.timeStop > 0) { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(0,0,0,${Math.min(1, this.timeStop / 10)})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
    if (FX.flashA > 0) { ctx.globalAlpha = FX.flashA; ctx.fillStyle = FX.flashColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }

  drawProj(ctx, p) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = U.rgba(p.color, 0.5);
    ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 2 + 4, p.h / 2 + 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 4, p.h / 4, 0, 0, 7); ctx.fill();
    ctx.restore();
  }

  drawBoxes(ctx) {
    ctx.lineWidth = 1;
    for (const f of this.fighters) {
      const hs = f.hurtboxes();
      ctx.strokeStyle = '#3cf'; for (let i = 0; i < f.hurtN; i++) ctx.strokeRect(hs[i].x, hs[i].y, hs[i].w, hs[i].h);
      const pb = f.pushbox(); ctx.strokeStyle = 'rgba(255,255,0,0.5)'; ctx.strokeRect(pb.x, pb.y, pb.w, pb.h);
      if (f.state === 'attack' && f.move && f.move.hits) for (const h of f.move.hits) {
        if (!h.box || f.moveF < h.f || f.moveF >= h.f + h.len) continue;
        const b = VA.Combat.worldBox(f, h.box, {}); ctx.strokeStyle = '#f33'; ctx.strokeRect(b.x, b.y, b.w, b.h);
      }
    }
    ctx.strokeStyle = '#f3f'; for (const p of this.projectiles) ctx.strokeRect(p.x, p.y, p.w, p.h);
  }

  updateAnnounces() {
    for (const a of this.announces) a.t++;
    for (let i = this.announces.length - 1; i >= 0; i--) if (this.announces[i].t > this.announces[i].dur) this.announces.splice(i, 1);
    if (this.lastCombo && --this.lastCombo.t <= 0) this.lastCombo = null;
    if (this.winQuote) this.winQuote.t++;
  }
}
VA.Match = Match;
