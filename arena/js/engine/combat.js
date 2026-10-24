// =====================================================================
//  combat.js — detecção de golpes (caixas de ataque x caixas de corpo),
//  bloqueio, dano com escala de combo, contra-ataques, aparadas,
//  armadura, agarrões e projéteis.
// =====================================================================
'use strict';

const Combat = VA.Combat = {
  tmpA: { x: 0, y: 0, w: 0, h: 0 }, tmpB: { x: 0, y: 0, w: 0, h: 0 },

  worldBox(f, box, out) {
    out.w = box.w; out.h = box.h; out.y = f.y + box.y;
    out.x = f.facing > 0 ? f.x + box.x : f.x - box.x - box.w;
    return out;
  },

  // procura um acerto do atacante no defensor neste quadro (não aplica)
  findHit(att, def, out) {
    if (att.state !== 'attack' || !att.move || !att.move.hits || att.hitstop > 0) return null;
    const m = att.move, f = att.moveF;
    for (let i = 0; i < m.hits.length; i++) {
      const h = m.hits[i];
      if (att.hitIds & (1 << i)) continue;
      if (f < h.f || f >= h.f + h.len) continue;
      if (m.type === 'throw' || h.grab) {
        att.hitIds |= 1 << i;  // agarrão testa uma vez só
        if (this.canGrab(att, def, h)) return { h, i, grab: true, move: m, x: (att.x + def.x) / 2, y: def.y - 60 };
        continue;
      }
      if (!h.box) continue;
      const hb = this.worldBox(att, h.box, out);
      const hurts = def.hurtboxes();
      for (let k = 0; k < def.hurtN; k++) {
        if (U.overlap(hb, hurts[k])) {
          const ix = (Math.max(hb.x, hurts[k].x) + Math.min(hb.x + hb.w, hurts[k].x + hurts[k].w)) / 2;
          const iy = (Math.max(hb.y, hurts[k].y) + Math.min(hb.y + hb.h, hurts[k].y + hurts[k].h)) / 2;
          return { h, i, move: m, x: ix, y: iy };
        }
      }
    }
    return null;
  },

  canGrab(att, def, h) {
    const range = h.range || att.phys.throwRange;
    if (Math.abs(def.x - att.x) > range) return false;
    if (!def.grounded || def.invuln > 0 || def.hp <= 0) return false;
    if (['hitstun', 'blockstun', 'knockdown', 'getup', 'locked', 'ko', 'jumpsquat'].includes(def.state) && !h.anyState) return false;
    if (def.state === 'attack' && def.move && def.move.throwInvuln) return false;
    return true;
  },

  step(match) {
    const [a, b] = match.fighters;
    const ra = this.findHit(a, b, this.tmpA), rb = this.findHit(b, a, this.tmpB);
    // agarrão contra agarrão no mesmo quadro: os dois se soltam
    if (ra && rb && ra.grab && rb.grab) {
      a.pushV = -a.facing * 6; b.pushV = -b.facing * 6; Audio2.sfx('tech');
      match.announce('ESCAPOU', '#9fd8ff', 30);
      return this.projectiles(match);
    }
    // trocas acontecem: os dois acertos são aplicados (se o segundo ainda estiver atacando)
    if (ra) { a.hitIds |= 1 << ra.i; this.resolve(a, b, ra.h, match, a, ra); }
    if (rb && (!rb.grab || (b.state === 'attack' && b.move === rb.move))) { b.hitIds |= 1 << rb.i; this.resolve(b, a, rb.h, match, b, rb); }
    this.projectiles(match);
  },

  // src = lutador ou projétil; pt = ponto do impacto
  resolve(att, def, h, match, src, pt) {
    const isProj = src !== att;
    if (pt.grab) return this.grab(att, def, h, match);
    const dm = def.move, df = def.moveF;
    // contra-ataque (ex.: V — Desfazer)
    if (def.state === 'attack' && dm && dm.counter && df >= dm.counter.f0 && df <= dm.counter.f1 && (!isProj || dm.counter.proj) && !h.unblockable) {
      if (isProj) src.hits = 0;
      Audio2.sfx('counter');
      dm.counter.on(def, att, match, src);
      return 'counter';
    }
    // defesa especial (aparar)
    if (def.state === 'attack' && dm && dm.parry && df >= dm.parry.f0 && df <= dm.parry.f1 && (!isProj || dm.parry.proj !== false) && !h.unblockable) {
      Audio2.sfx('parry');
      FX.hitSpark(pt.x, pt.y, -def.facing, 2, dm.parry.color || '#e9e4ff', '#ffffff');
      def.addEnergy(dm.parry.energy || 20);
      if (isProj) src.hits = 0;
      else { att.hitstop = 16; def.hitstop = 4; att.pushV = -att.facing * 4; }
      if (dm.parry.on) dm.parry.on(def, att, match, src);
      match.announce('ANULADO', dm.parry.color || '#e9e4ff', 30, def);
      return 'parry';
    }
    // armadura: absorve o golpe sem atordoar
    if (def.armorHits > 0 && !h.unblockable && h.knock !== 'super') {
      def.armorLeft--; def.armorHits--;
      const dmg = Math.round(h.dmg * 0.5 * this.dmgMul(att, def));
      def.hp = Math.max(1, def.hp - dmg);
      def.flash = 6; def.flashColor = '#ffb04a';
      att.hitstop = isProj ? 0 : 9; def.hitstop = 9;
      Audio2.sfx('armor'); FX.hitSpark(pt.x, pt.y, att.facing, 1, '#ffb04a');
      if (def.move && def.move.onArmor) def.move.onArmor(def, att, match);
      match.onDamage(att, def, dmg, h, 'armor');
      return 'armor';
    }
    if (this.blocks(def, h)) return this.block(att, def, h, match, src, pt);
    return this.hit(att, def, h, match, src, pt);
  },

  blocks(def, h) {
    if (h.unblockable || !def.grounded) return false;
    const blocking = def.state === 'block' || def.state === 'cblock' || def.state === 'blockstun' ||
      (def.isNeutral() && def.ctrl.held.block && def.inputOn);
    if (!blocking) return false;
    const low = def.ctrl.held.down;
    if (h.level === 'low' && !low) return false;
    if (h.level === 'high' && low) return false;
    return true;
  },

  block(att, def, h, match, src, pt) {
    const isProj = src !== att;
    def.setState('blockstun'); def.stunT = h.bstun; def.lowBlock = def.ctrl.held.down;
    const dir = isProj ? src.dir : att.facing;
    if (h.chip) { const c = Math.round(h.chip * this.dmgMul(att, def)); def.hp = Math.max(1, def.hp - c); match.onDamage(att, def, c, h, 'chip'); }
    def.pushV = dir * h.push * 1.15;
    if (!isProj && this.nearWall(def, dir, match)) att.pushV = -dir * h.push * 0.9;
    def.addEnergy(5); att.addEnergy(3);
    def.stats.blocks++;
    att.connected = 2;
    const hs = Math.max(4, h.hitstop - 2);
    def.hitstop = hs; if (!isProj) att.hitstop = hs;
    Audio2.sfx('block'); FX.blockSpark(pt.x, pt.y, -dir);
    match.onBlock(att, def, h);
    return 'block';
  },

  // defensor encostado (ou quase) na parede na direção do empurrão
  nearWall(def, dir, match) {
    const lim = match.bounds();
    return dir > 0 ? def.x >= lim.r - 12 : def.x <= lim.l + 12;
  },

  dmgMul(att, def) {
    return (att.mods.damage || 1) * (att.vars.dmgMul || 1) * (def.mods.defense || 1) * (def.vars.defMul || 1);
  },

  hit(att, def, h, match, src, pt) {
    const isProj = src !== att;
    const dir = isProj ? src.dir : (h.reverse ? -att.facing : att.facing);
    const counter = def.state === 'attack' && def.phase() !== 'recovery' && !h.noCounter;
    const n = def.combo;
    const scale = n < 2 ? 1 : Math.max(0.3, 1 - 0.1 * (n - 1));
    let dmg = Math.round(h.dmg * scale * this.dmgMul(att, def) * (counter ? 1.2 : 1));
    if (h.minDmg) dmg = Math.max(dmg, h.minDmg);
    if (match.training && match.training.noDamage) dmg = 0;
    def.hp = Math.max(0, def.hp - dmg);
    def.combo++; def.comboDmg += dmg;
    att.stats.dmg += dmg; att.stats.hits++;
    if (def.combo > att.stats.maxCombo) att.stats.maxCombo = def.combo;
    if (def.comboDmg > att.stats.maxComboDmg) att.stats.maxComboDmg = def.comboDmg;
    // atordoamento com decaimento em combos longos (evita combos infinitos)
    let stun = Math.round(h.stun * Math.max(0.45, 1 - 0.045 * Math.max(0, n - 3))) + (counter ? 4 : 0);
    const wasCrouch = def.state === 'crouch' || def.state === 'cblock' || !!(def.move && def.move.crouch);
    if (def.move && def.move.onInterrupted) def.move.onInterrupted(def, att, match);
    if (def.lock) { const tg = def.lock.target; tg.setState('air_hit'); tg.grounded = false; tg.vy = -3; tg.kd = true; tg.lockedBy = null; tg.poseOverride = null; }
    def.move = null; def.lock = null; def.poseOverride = null; def.fade = null;
    const air = !def.grounded;
    if (def.hp <= 0) {
      def.setState('air_hit'); def.grounded = false; def.vy = -7; def.vx = dir * 3.2; def.kd = true;
    } else if (air || h.knock === 'launch' || h.knock === 'sweep' || h.knock === 'knock') {
      def.setState('air_hit'); def.grounded = false;
      const L = h.launch || {};
      def.vy = L.vy != null ? L.vy : (h.knock === 'sweep' ? -3.5 : h.knock === 'knock' ? -5 : air ? -4.5 : -8);
      def.vx = dir * (L.vx != null ? L.vx : (h.knock === 'sweep' ? 1 : 2.2));
      def.juggle += h.juggle;
      def.kd = !!h.knock || def.juggle > 2;
      // limite de malabarismo: acima disso o alvo fica intocável até cair
      if (def.juggle > 6) def.invuln = 99;
    } else {
      def.setState('hitstun'); def.stunT = stun;
      def.lowHit = h.level === 'low' || wasCrouch;
      def.pushV = dir * h.push;
      if (!isProj && this.nearWall(def, dir, match)) att.pushV = -dir * h.push * 0.85;
    }
    def.dizzyMeter += h.stunPts != null ? h.stunPts : dmg * 0.11;
    if (def.dizzyMeter >= 100 && def.hp > 0 && !match.training) { def.dizzyMeter = 0; def.dizzyPending = true; }
    att.addEnergy(dmg * 0.14 + 4); def.addEnergy(dmg * 0.1);
    if (!isProj) att.connected = 1; else if (src.owner) src.owner.connected = 1;
    const hs = h.hitstop + (counter ? 3 : 0);
    def.hitstop = hs; if (!isProj) att.hitstop = hs;
    // efeitos
    const power = h.spark === 'special' ? 3 : h.dmg >= 80 ? 2 : 1;
    const col = h.color || att.def.look.spark || '#ffd27a';
    FX.hitSpark(pt.x, pt.y, dir, power, col, att.def.look.spark2);
    Audio2.sfx(h.sfx || (h.spark === 'special' ? 'hitS' : h.dmg >= 75 ? 'hitH' : 'hitL'));
    if (power >= 2) FX.shake(power * 2.2);
    def.flash = 4; def.flashColor = '#ffffff';
    if (counter) match.announce('CONTRA-GOLPE', '#ff8a4a', 34, att);
    if (h.onHit) h.onHit(att, def, match, src);
    if (h.lockOnHit && def.hp > 0) att.startLock(def, h.lockOnHit.dur, h.lockOnHit.script, h.lockOnHit.onEnd);
    match.onDamage(att, def, dmg, h, 'hit', counter);
    return 'hit';
  },

  grab(att, def, h, match) {
    if (!att.move || att.state !== 'attack') return null;
    // escapar: Defesa + Ataque leve logo no começo do agarrão (só agarrões comuns)
    if (!h.unblockable && att.move.type === 'throw' && def.ctrl.held.block && def.ctrl.recent('lp', 9) && !match.training?.noTech) {
      Audio2.sfx('tech');
      att.pushV = -att.facing * 6; def.pushV = att.facing * 6;
      def.setState('blockstun'); def.stunT = 10;
      match.announce('ESCAPOU', '#9fd8ff', 30, def);
      return 'tech';
    }
    const m = att.move;
    Audio2.sfx('throw');
    att.connected = 1;
    const back = m.type === 'throw' && att.backHeld();
    const script = m.grabScript || VA.throwScript({ dmg: h.dmg, back });
    att.startLock(def, m.grabDur || 26, script, m.grabEnd);
    return 'grab';
  },

  // dano aplicado por script (agarrões, supremos)
  scriptHit(att, def, o, match) {
    const h = Object.assign({ dmg: 30, spark: 'special', level: 'mid', juggle: 0 }, o);
    let dmg = Math.round(h.dmg * this.dmgMul(att, def));
    if (o.scaleCombo !== false && def.combo > 2) dmg = Math.round(dmg * Math.max(0.5, 1 - 0.05 * (def.combo - 2)));
    if (match.training && match.training.noDamage) dmg = 0;
    def.hp = Math.max(0, def.hp - dmg);
    def.combo++; def.comboDmg += dmg; att.stats.dmg += dmg; att.stats.hits++;
    if (def.combo > att.stats.maxCombo) att.stats.maxCombo = def.combo;
    if (def.comboDmg > att.stats.maxComboDmg) att.stats.maxComboDmg = def.comboDmg;
    att.addEnergy(o.energy != null ? o.energy : dmg * 0.05);
    def.addEnergy(dmg * 0.06);
    def.flash = 5;
    const x = o.x != null ? o.x : def.x, y = o.y != null ? o.y : def.y - 60;
    FX.hitSpark(x, y, o.dir || att.facing, o.power || 2, o.color || att.def.look.spark || '#ffd27a', att.def.look.spark2);
    Audio2.sfx(o.sfx || 'hitH');
    FX.shake(o.shake || 4);
    match.onDamage(att, def, dmg, h, 'hit');
    return dmg;
  },

  // ------------------------------------------------------------ projéteis
  projectiles(match) {
    const P = match.projectiles;
    for (const p of P) {
      if (!p.alive) continue;
      p.t++;
      if (p.update) p.update(p, match);
      else { p.x += p.vx; p.y += p.vy; }
      if (p.t > p.life || p.hits <= 0 || p.x < -100 || p.x > match.stage.width + 100) { p.alive = false; if (p.onDie) p.onDie(p, match); continue; }
      if (p.cool > 0) { p.cool--; continue; }
      if (p.t < (p.activeFrom || 0)) continue;
      // choque entre projéteis
      if (p.clash !== false) for (const q of P) {
        if (q === p || !q.alive || q.owner === p.owner || q.clash === false || q.t < (q.activeFrom || 0)) continue;
        if (U.overlap(p, q)) {
          p.hits--; q.hits--;
          FX.burst((p.x + q.x) / 2 + p.w / 2, p.y + p.h / 2, '#ffffff', 18, 4); Audio2.sfx('hitS'); FX.shake(3);
        }
      }
      if (p.hits <= 0) continue;
      const tgt = match.fighters[1 - p.owner.side];
      if (tgt.projInvuln > 0) continue;
      const hurts = tgt.hurtboxes();
      for (let k = 0; k < tgt.hurtN; k++) {
        if (U.overlap(p, hurts[k])) {
          const r = this.resolve(p.owner, tgt, p.hit, match, p, { x: p.x + p.w / 2, y: p.y + p.h / 2 });
          if (r === 'counter' || r === 'parry') { p.alive = false; break; }
          p.hits--; p.cool = p.rehit || 10;
          if (p.onHit) p.onHit(p, tgt, match, r);
          if (p.hits <= 0) { p.alive = false; if (p.onDie) p.onDie(p, match); }
          break;
        }
      }
    }
    // remove os mortos sem realocar a lista inteira
    for (let i = P.length - 1; i >= 0; i--) if (!P[i].alive) P.splice(i, 1);
  },
};

// projétil genérico: x/y são o centro do spawn; w/h o tamanho
VA.makeProjectile = function (owner, o) {
  const dir = o.dir || owner.facing;
  const w = o.w || 24, h = o.h || 18;
  const hit = Object.assign({}, owner.match ? {} : {}, { dmg: 60, stun: 18, bstun: 14, push: 5, level: 'mid', knock: false, chip: 8, hitstop: 7, spark: 'special', juggle: 1 }, o.hit);
  return Object.assign({
    owner, dir, w, h, x: o.cx - w / 2, y: o.cy - h / 2, vx: (o.speed || 0) * dir, vy: 0,
    life: 120, hits: 1, t: 0, alive: true, cool: 0, rehit: 10, counts: true, color: owner.def.look.spark || '#fff',
  }, o, { hit, x: (o.cx != null ? o.cx : owner.x) - w / 2, y: (o.cy != null ? o.cy : owner.y - 60) - h / 2 });
};

// agarrão padrão: segura, ergue e arremessa (para trás se ← estiver pressionado)
VA.throwScript = function (o) {
  return (att, tg, t, match) => {
    const f = att.facing;
    att.poseOverride = t < 12 ? 'throw_a' : 'throw_b';
    if (t < 12) { tg.x = att.x + f * 30; tg.y = GROUND - Math.min(t, 12) * 2; tg.facing = -f; tg.grounded = false; }
    if (t === 12) {
      const d = o.back ? -f : f;
      if (o.back) { tg.x = att.x - f * 20; att.facing = -f; }
      Combat.scriptHit(att, tg, { dmg: o.dmg || 110, power: 2, dir: d, sfx: 'throw', shake: 5 }, match);
      tg.setState('air_hit'); tg.grounded = false; tg.vy = -6; tg.vx = d * 4.5; tg.kd = true;
    }
  };
};
