// =====================================================================
//  fighter.js — o lutador: máquina de estados, física, leitura de
//  comandos, execução de golpes (preparação → ativo → recuperação),
//  formas/transformações e cálculo da pose de animação.
// =====================================================================
'use strict';

const ENERGY_MAX = 300;
const NEUTRAL = { idle: 1, walk: 1, run: 1, crouch: 1, block: 1, cblock: 1 };
const HIT_DEFAULT = { dmg: 50, stun: 16, bstun: 11, push: 4, level: 'mid', knock: false, chip: 0, hitstop: 6, spark: 'light', juggle: 1 };

// completa um golpe com valores padrão (chamado no registro do personagem)
VA.normalizeMove = function (m) {
  m.type = m.type || 'normal';
  m.startup = m.startup == null ? 5 : m.startup; m.active = m.active == null ? 3 : m.active; m.recovery = m.recovery == null ? 10 : m.recovery;
  m.total = m.total || (m.startup + m.active + m.recovery);
  m.hit = Object.assign({}, HIT_DEFAULT, m.type === 'special' ? { spark: 'special', hitstop: 8, chip: Math.round((m.hit && m.hit.dmg || 50) * 0.12) } : {}, m.type === 'super' ? { spark: 'special', hitstop: 10 } : {}, m.hit);
  if (!m.hits && m.box) m.hits = [{ f: m.startup, len: m.active, box: m.box }];
  if (m.hits) m.hits = m.hits.map((h, i) => Object.assign({ idx: i }, m.hit, h));
  if (!m.cancel) m.cancel = m.type === 'normal' ? ['special', 'super'] : m.type === 'special' ? ['super'] : [];
  m.cost = m.cost || 0;
  return m;
};

class Fighter {
  constructor(def, side, ctrl, match) {
    this.def = def; this.side = side; this.ctrl = ctrl; this.match = match;
    this.maxHp = def.health; this.hp = this.maxHp;
    this.energy = 0;
    this.pose = {}; this.poseTmp = {}; this.poseTmp2 = {};
    this.trail = []; for (let i = 0; i < 6; i++) this.trail.push({ x: 0, y: 0, f: 1, pose: {}, on: false });
    this.trailI = 0;
    this.hurt = [{ x: 0, y: 0, w: 0, h: 0 }, { x: 0, y: 0, w: 0, h: 0 }];
    this.hb = { x: 0, y: 0, w: 0, h: 0 };
    this.stats = { dmg: 0, maxCombo: 0, maxComboDmg: 0, supers: 0, transforms: 0, hits: 0, blocks: 0, specials: 0 };
    this.vars = {};
    this.roundReset(side === 0 ? -110 : 110);
  }

  roundReset(offset, keepHp) {
    const st = this.match.stage;
    this.x = st.width / 2 + offset; this.y = GROUND;
    this.vx = 0; this.vy = 0; this.pushV = 0;
    this.facing = offset < 0 ? 1 : -1;
    if (!keepHp) this.hp = this.maxHp;
    this.state = 'intro'; this.stateT = 0; this.animT = 0;
    this.move = null; this.moveF = 0; this.hitIds = 0; this.connected = 0; // connected: 1 acertou, 2 bloqueado
    this.grounded = true; this.airUsed = false;
    this.hitstop = 0; this.stunT = 0; this.invuln = 0; this.projInvuln = 0;
    this.combo = 0; this.comboDmg = 0; this.juggle = 0; this.kd = false;
    this.dizzyMeter = 0; this.dizzyPending = false;
    this.form = null; this.formUsed = false;
    this.lock = null; this.poseOverride = null; this.lockedBy = null;
    this.cooldowns = {};
    this.armorHits = 0; this.flash = 0; this.inputOn = false;
    this.lastMoveName = ''; this.counterHit = false;
    this.vars = {};
    for (const t of this.trail) t.on = false;
    if (this.def.onRoundStart) this.def.onRoundStart(this);
  }

  get opp() { return this.match.fighters[1 - this.side]; }
  get phys() { return this.def.physics; }
  get mods() { return this.form ? this.form.def.mods || {} : {}; }
  speedMul() { return (this.mods.speed || 1) * (this.vars.speedMul || 1); }
  isNeutral() { return !!NEUTRAL[this.state]; }
  isAirborne() { return !this.grounded; }
  canBeHit() { return this.hp > 0 && this.invuln <= 0 && this.state !== 'knockdown' && this.state !== 'getup' && this.state !== 'ko' && this.state !== 'locked' && this.state !== 'intro' && !(this.state === 'air_hit' && this.juggle > 6); }
  phase() {
    if (this.state !== 'attack' || !this.move) return null;
    const f = this.moveF, m = this.move;
    if (f < m.startup) return 'startup';
    if (f < m.startup + m.active) return 'active';
    return 'recovery';
  }
  fwdHeld() { return this.facing > 0 ? this.ctrl.held.right : this.ctrl.held.left; }
  backHeld() { return this.facing > 0 ? this.ctrl.held.left : this.ctrl.held.right; }

  setState(s) { if (this.state !== s) { this.state = s; this.stateT = 0; } }
  addEnergy(v) {
    if (this.match.training && this.match.training.infEnergy) { this.energy = ENERGY_MAX; return; }
    const mul = this.form && this.form.def.energyMul != null ? this.form.def.energyMul : 1;
    this.energy = U.clamp(this.energy + v * mul * (this.def.energyGain || 1), 0, ENERGY_MAX);
  }

  // ------------------------------------------------------------ comandos
  moveOk(id) {
    const m = this.def.moves[id];
    if (!m) return null;
    if (m.cost && this.energy < this.costOf(m)) return null;
    if (this.cooldowns[id] > 0) return null;
    if (m.cond && !m.cond(this)) return null;
    if (m.oneProj && this.match.projectiles.some(p => p.owner === this && p.alive && p.counts !== false)) return null;
    return m;
  }
  costOf(m) {
    if (this.form && m.formCost && m.formCost[this.form.id] != null) return m.formCost[this.form.id];
    return m.cost;
  }
  pickDir(base) {
    const c = this.ctrl;
    const cands = [];
    if (c.held.down) cands.push(base + '_down');
    if (this.fwdHeld()) cands.push(base + '_fwd');
    if (this.backHeld()) cands.push(base + '_back');
    cands.push(base);
    for (const id of cands) if (this.def.moves[id]) return id;
    return null;
  }
  readCommand(air) {
    const c = this.ctrl, B = 5;
    const ok = (id, btn) => {
      if (!id) return null;
      const m = this.def.moves[id];
      if (!m) return null;
      if (air && !m.air && !m.airOk) return null;
      if (!air && m.air) return null;
      if (!this.moveOk(id)) { if (btn === 'su' || m.type === 'transform') { Audio2.sfx('deny'); c.consume(btn); } return null; }
      c.consume(btn);
      return id;
    };
    if (c.recent('su', B)) {
      if (c.held.down && this.def.moves.transform) { const r = ok('transform', 'su'); if (r) return r; return null; }
      return ok('su', 'su');
    }
    if (c.recent('sp', B)) { const r = ok(this.pickDir('sp'), 'sp'); if (r) return r; }
    if (c.recent('sp2', B)) { const r = ok(this.pickDir('sp2'), 'sp2'); if (r) return r; }
    if (!air && c.held.block && c.recent('lp', B)) { const r = ok('throw', 'lp'); if (r) return r; }
    if (c.recent('hp', B)) return ok(air ? 'air_h' : c.held.down ? 'chk' : this.fwdHeld() ? 'hk' : 'hp', 'hp');
    if (c.recent('lp', B)) return ok(air ? 'air_l' : c.held.down ? 'clp' : this.fwdHeld() ? 'lk' : 'lp', 'lp');
    return null;
  }

  startMove(id) {
    let m = this.def.moves[id];
    if (!m) return false;
    // variante aprimorada durante uma forma (ex.: V "Grande Demais")
    if (this.form && m.formVariant && m.formVariant[this.form.id]) m = m.formVariant[this.form.id];
    if (m.cost) this.energy -= this.costOf(this.def.moves[id]);
    this.move = m; this.moveF = 0; this.hitIds = 0; this.connected = 0;
    this.setState('attack');
    this.lastMoveName = m.name || id;
    if (m.cooldown) this.cooldowns[id] = m.cooldown;
    if (m.type === 'special') this.stats.specials++;
    if (!m.air) this.vx = 0;
    if (m.air) this.airUsed = true;
    this.match.onMoveStart(this, m);
    if (m.cinematic) this.match.startCinematic(this, m.cinematic);
    if (m.onStart) m.onStart(this, this.match);
    return true;
  }

  // ------------------------------------------------------------ atualização
  update() {
    const m = this.match;
    this.animT++; this.stateT++;
    for (const k in this.cooldowns) if (this.cooldowns[k] > 0) this.cooldowns[k]--;
    if (this.invuln > 0) this.invuln--;
    if (this.projInvuln > 0) this.projInvuln--;
    if (this.flash > 0) this.flash--;
    this.updateForm();
    if (this.def.onUpdate) this.def.onUpdate(this, m);
    if (this.lock) { this.runLock(); return; }
    if (this.state === 'locked') return;

    const inp = this.inputOn && m.phase === 'fight';
    switch (this.state) {
      case 'intro': case 'win': case 'lose': this.vx = 0; break;
      case 'idle': case 'walk': case 'run': case 'crouch': case 'block': case 'cblock':
        if (!inp) { this.setState('idle'); this.vx = 0; break; }
        this.faceOpp();
        if (!this.tryMove(false)) this.neutral();
        break;
      case 'jumpsquat':
        if (this.stateT >= 4) {
          this.vy = this.phys.jumpV; this.grounded = false; this.airUsed = false;
          this.vx = this.jumpDir * this.phys.jumpH * this.speedMul() * this.facing;
          this.setState('air'); Audio2.sfx('jump');
          FX.dust(this.x, GROUND, 3);
        }
        break;
      case 'air':
        if (inp && !this.airUsed) this.tryMove(true);
        break;
      case 'land':
        this.vx *= 0.6;
        if (this.stateT >= (this.landT || 4)) this.setState('idle');
        break;
      case 'backdash':
        if (this.stateT === 1) { this.vx = -this.phys.backdash * this.facing; this.invuln = 7; Audio2.sfx('dash'); FX.dust(this.x, GROUND, 4, this.facing); }
        this.vx *= 0.88;
        if (this.stateT >= 18) { this.vx = 0; this.setState('idle'); }
        break;
      case 'attack': this.runMove(inp); break;
      case 'hitstun': case 'blockstun':
        this.vx = 0;
        if (--this.stunT <= 0) {
          if (this.dizzyPending && this.state === 'hitstun') this.enterDizzy();
          else this.setState(this.ctrl.held.down && this.state === 'blockstun' ? 'crouch' : 'idle');
        }
        break;
      case 'air_hit': break; // cai até tocar o chão (physics)
      case 'knockdown':
        this.vx *= 0.8;
        if (this.stateT >= (this.kdTime || 38)) { this.setState('getup'); }
        break;
      case 'getup':
        this.invuln = Math.max(this.invuln, 2);
        if (this.stateT >= 20) { this.setState('idle'); this.invuln = 4; this.faceOpp(); if (this.dizzyPending) this.enterDizzy(); }
        break;
      case 'dizzy':
        // apertar botões reduz o atordoamento
        if (this.ctrl.pressed.lp || this.ctrl.pressed.hp || this.ctrl.pressed.left || this.ctrl.pressed.right) this.stunT -= 4;
        if (--this.stunT <= 0) { this.setState('idle'); this.dizzyMeter = 0; }
        if (this.animT % 20 === 0) FX.spawn('dot', this.x + U.rand(-10, 10), this.y - this.phys.height - 8, U.rand(-1, 1), -0.5, 30, 4, '#ffe066', { add: true });
        break;
      case 'ko': break;
    }
    this.physics();
    if (this.dizzyMeter > 0 && this.state !== 'hitstun' && this.state !== 'air_hit') this.dizzyMeter = Math.max(0, this.dizzyMeter - 0.25);
  }

  neutral() {
    const c = this.ctrl, P = this.phys, sp = this.speedMul();
    if (c.held.block) { this.setState(c.held.down ? 'cblock' : 'block'); this.vx = 0; return; }
    if (c.held.up) { this.jumpDir = this.fwdHeld() ? 1 : this.backHeld() ? -1 : 0; this.setState('jumpsquat'); this.vx = 0; return; }
    if (c.held.down) { this.setState('crouch'); this.vx = 0; return; }
    const fwdKey = this.facing > 0 ? 'right' : 'left', backKey = this.facing > 0 ? 'left' : 'right';
    if (c.dtap[backKey]) { this.setState('backdash'); return; }
    if (c.dtap[fwdKey] || (this.state === 'run' && this.fwdHeld())) {
      if (this.state !== 'run') { Audio2.sfx('dash'); FX.dust(this.x, GROUND, 4, -this.facing); this.addEnergy(2); }
      this.setState('run'); this.vx = P.run * sp * this.facing;
      if (this.animT % 9 === 0) FX.dust(this.x - this.facing * 8, GROUND, 1, -this.facing);
      return;
    }
    if (this.fwdHeld()) { this.setState('walk'); this.vx = P.walk * sp * this.facing; this.walkDir = 1; return; }
    if (this.backHeld()) { this.setState('walk'); this.vx = -P.back * sp * this.facing; this.walkDir = -1; return; }
    this.setState('idle'); this.vx = 0;
  }

  tryMove(air) {
    const id = this.readCommand(air);
    if (!id) return false;
    return this.startMove(id);
  }

  runMove(inp) {
    const m = this.move, f = this.moveF;
    let moving = false;
    if (m.motion) for (const mo of m.motion) {
      if (f >= mo.f0 && f <= mo.f1) {
        if (mo.vx != null) { this.vx = mo.vx * this.facing * (mo.noMul ? 1 : this.speedMul()); moving = true; }
        if (mo.vy != null) { this.vy = mo.vy; this.grounded = false; }
      }
    }
    // atrito no chão fora das janelas de deslocamento do golpe
    if (!m.air && !moving && this.grounded) this.vx *= 0.7;
    if (m.events && m.events[f]) { m.events[f](this, this.match); if (this.move !== m) return; }
    if (m.invuln && f >= m.invuln[0] && f <= m.invuln[1]) this.invuln = Math.max(this.invuln, 1);
    if (m.projInvuln && f >= m.projInvuln[0] && f <= m.projInvuln[1]) this.projInvuln = Math.max(this.projInvuln, 1);
    if (f === 0) this.armorLeft = m.armor && (!m.armor.cond || m.armor.cond(this)) ? (m.armor.hits || 1) : 0;
    this.armorHits = (m.armor && f >= m.armor.f0 && f <= m.armor.f1) ? this.armorLeft : 0;
    if (f === m.startup && !m.silent) Audio2.sfx(m.whiffSfx || (m.hit.dmg >= 75 ? 'whiffH' : 'whiff'));
    if (m.charge && f < m.startup) FX.charge(this.x + this.facing * 20, this.y - 60, m.charge, 1);

    // janela livre (ex.: depois de um teleporte): qualquer ação é permitida
    if (inp && m.freeCancel && f >= m.freeCancel[0] && f <= m.freeCancel[1] && this.tryMove(!this.grounded)) return;
    // cancelamento (só depois de conectar e dentro da janela)
    if (inp && this.connected && f >= m.startup && f < m.startup + m.active + 10 && m.cancel.length) {
      const id = this.peekCancel(m);
      if (id) { this.startMove(id); return; }
    }
    this.moveF++;
    if (this.moveF >= m.total) this.endMove();
  }

  peekCancel(m) {
    const c = this.ctrl, B = 6;
    const pressed = c.recent('lp', B) || c.recent('hp', B) || c.recent('sp', B) || c.recent('sp2', B) || c.recent('su', B);
    if (!pressed) return null;
    const air = !this.grounded;
    // simula a leitura sem consumir para checar o tipo
    const snap = {}; for (const a of ['lp', 'hp', 'sp', 'sp2', 'su']) snap[a] = c.buf[a];
    const id = this.readCommand(air);
    if (!id) return null;
    const t = this.def.moves[id];
    const allowed = (t.type === 'special' && m.cancel.includes('special')) || ((t.type === 'super' || t.type === 'transform') && m.cancel.includes('super')) ||
      (t.type === 'normal' && m.chain && m.chain.includes(id));
    if (!allowed) { for (const a in snap) c.buf[a] = snap[a]; return null; }
    return id;
  }

  endMove() {
    const m = this.move;
    this.move = null;
    if (m.onEnd) m.onEnd(this, this.match);
    if (this.state !== 'attack') return;
    if (!this.grounded) { this.setState('air'); return; }
    this.setState(this.ctrl.held.down ? 'crouch' : 'idle');
  }

  enterDizzy() {
    this.dizzyPending = false;
    this.setState('dizzy'); this.stunT = 110; Audio2.sfx('dizzy');
    this.match.announce('ATORDOADO!', '#ffe066', 50, this);
  }

  // ------------------------------------------------------------ física
  physics() {
    const P = this.phys, st = this.match.stage;
    this.x += this.vx + this.pushV;
    this.pushV *= 0.8; if (Math.abs(this.pushV) < 0.1) this.pushV = 0;
    if (!this.grounded) {
      this.y += this.vy;
      const g = this.state === 'air_hit' ? P.gravity * 0.95 : (this.move && this.move.gravity != null ? this.move.gravity : P.gravity);
      this.vy = Math.min(this.vy + g, 14);
      if (this.y >= GROUND) { this.y = GROUND; this.grounded = true; this.vy = 0; this.onLand(); }
    }
    // limites da arena e da câmera (ninguém sai da tela)
    const lim = this.match.bounds();
    if (this.x < lim.l) { this.x = lim.l; this.atWall = -1; } else if (this.x > lim.r) { this.x = lim.r; this.atWall = 1; } else this.atWall = 0;
    if (this.x <= 20 || this.x >= st.width - 20) this.atStageWall = true; else this.atStageWall = false;
  }

  onLand() {
    switch (this.state) {
      case 'air': this.setState('land'); this.landT = 4; this.vx = 0; Audio2.sfx('land'); FX.dust(this.x, GROUND, 3); break;
      case 'attack':
        if (this.move && this.move.air) { this.move = null; this.setState('land'); this.landT = 6; this.vx = 0; FX.dust(this.x, GROUND, 3); }
        else this.vx *= 0.5;
        break;
      case 'air_hit':
        if (this.kd || this.hp <= 0 || this.juggle > 1) {
          this.setState(this.hp <= 0 ? 'ko' : 'knockdown'); this.vx *= 0.4; this.kdTime = 38;
          Audio2.sfx('fall'); FX.dust(this.x, GROUND, 10); FX.shake(4);
          this.match.stageImpact(this.x, 1);
          if (this.hp > 0) this.invuln = 60;
        } else { this.setState('land'); this.landT = 8; this.vx = 0; }
        this.juggle = 0; this.kd = false;
        break;
      case 'ko': Audio2.sfx('fall'); FX.dust(this.x, GROUND, 12); FX.shake(5); break;
    }
  }

  faceOpp() {
    const o = this.opp;
    if (Math.abs(o.x - this.x) > 4) this.facing = o.x > this.x ? 1 : -1;
  }

  // ------------------------------------------------------------ formas
  updateForm() {
    const forms = this.def.forms;
    for (const id in forms) {
      const fd = forms[id];
      if (fd.auto && !this.form && this.hp > 0 && fd.auto(this)) this.enterForm(id, true);
    }
    if (!this.form) return;
    const fd = this.form.def;
    if (fd.aura && this.animT % 2 === 0) fd.aura(this);
    if (this.form.t !== Infinity && --this.form.t <= 0) {
      this.match.announce(fd.name + ' terminou', '#bbb', 40, this);
      this.form = null;
      FX.burst(this.x, this.y - 50, '#ffffff', 14, 3);
    }
  }
  enterForm(id, silent) {
    const fd = this.def.forms[id];
    this.form = { id, def: fd, t: fd.duration || Infinity };
    this.formUsed = true;
    this.stats.transforms++;
    if (fd.onEnter) fd.onEnter(this, this.match);
    if (!silent || fd.announce) this.match.announce(fd.name.toUpperCase(), fd.color || '#fff', 70, this);
  }

  // ------------------------------------------------------------ travas (agarrões / supremos)
  // script(att, tgt, t, match) roda por `dur` quadros com o alvo preso
  startLock(target, dur, script, onEnd) {
    this.lock = { target, dur, t: 0, script, onEnd };
    target.setState('locked'); target.lockedBy = this; target.vx = target.vy = 0; target.pushV = 0;
  }
  runLock() {
    const L = this.lock, tg = L.target;
    L.script(this, tg, L.t, this.match);
    L.t++;
    if (L.t >= L.dur) {
      this.lock = null; this.poseOverride = null; tg.poseOverride = null; tg.lockedBy = null;
      if (L.onEnd) L.onEnd(this, tg, this.match);
      if (tg.state === 'locked') { tg.setState('air_hit'); tg.grounded = false; tg.kd = true; if (!tg.vy) tg.vy = -4; }
      if (this.move) { this.moveF = Math.max(this.moveF, this.move.startup + this.move.active); if (this.state !== 'attack') this.setState('attack'); }
      else this.setState('idle');
    }
  }

  // ------------------------------------------------------------ caixas
  hurtboxes() {
    const P = this.phys, h = this.hurt;
    let n = 0;
    const set = (x, y, w, hh) => { const b = h[n++]; b.x = x; b.y = y; b.w = w; b.h = hh; };
    if (!this.canBeHit()) { this.hurtN = 0; return h; }
    const crouching = this.state === 'crouch' || this.state === 'cblock' || (this.move && this.move.crouch && this.state === 'attack') || (this.state === 'hitstun' && this.lowHit);
    if (!this.grounded) set(this.x - P.width / 2, this.y - P.height * 0.85, P.width, P.height * 0.7);
    else if (crouching) set(this.x - P.width / 2 - 2, this.y - P.crouchHeight, P.width + 4, P.crouchHeight);
    else if (this.state === 'attack' && this.move && this.move.hurtLow) set(this.x - P.width / 2, this.y - this.move.hurtLow, P.width, this.move.hurtLow);
    else set(this.x - P.width / 2, this.y - P.height, P.width, P.height);
    // membro estendido durante o golpe fica vulnerável (permite punir golpes no vazio)
    const ph = this.phase();
    if (ph && this.move.hits && this.move.type !== 'throw' && !this.move.noExtend && (ph === 'active' || (ph === 'recovery' && this.moveF < this.move.startup + this.move.active + 8))) {
      const bx = this.move.hits[0].box;
      if (bx) {
        const w = bx.w * 0.8;
        set(this.facing > 0 ? this.x + bx.x : this.x - bx.x - w, this.y + bx.y + 2, w, Math.max(4, bx.h - 4));
      }
    }
    this.hurtN = n;
    return h;
  }
  pushbox() {
    const P = this.phys, b = this.hb;
    b.w = P.width * 0.9; b.x = this.x - b.w / 2;
    b.h = this.grounded ? P.height * 0.9 : P.height * 0.6; b.y = this.y - b.h;
    return b;
  }

  // ------------------------------------------------------------ animação
  computePose() {
    const V = VA.poses, out = this.pose, own = this.def.poses || {};
    const get = n => own[n] || V[n] || V.stance;
    const t = this.animT;
    if (this.poseOverride) { VA.copyPose(get(this.poseOverride), out); return out; }
    switch (this.state) {
      case 'idle': case 'intro': {
        const k = (Math.sin(t * 0.07) + 1) / 2;
        if (this.state === 'intro' && this.def.introPose && this.stateT < 200) return VA.copyPose(get(this.def.introPose), out);
        return VA.mixPose(get('stance'), get('stance2'), k, out);
      }
      case 'walk': return VA.walkPose(get('stance'), t * 0.18 * this.walkDir, 22, out, false);
      case 'run': return VA.walkPose(get('stance'), t * 0.32, 38, out, true);
      case 'crouch': return VA.mixPose(get('stance'), get('crouch'), Math.min(1, this.stateT / 4), out);
      case 'block': return VA.copyPose(get('block'), out);
      case 'cblock': return VA.copyPose(get('cblock'), out);
      case 'jumpsquat': return VA.mixPose(get('stance'), get('land'), Math.min(1, this.stateT / 3), out);
      case 'air': return VA.mixPose(get('jump'), get('fall'), U.clamp((this.vy + 4) / 10, 0, 1), out);
      case 'land': return VA.mixPose(get('land'), get('stance'), this.stateT / (this.landT || 4), out);
      case 'backdash': return VA.mixPose(get('jump'), get('stance'), this.stateT / 18, out);
      case 'hitstun': return VA.mixPose(get(this.lowHit ? 'hitLow' : 'hit'), get('stance'), Math.max(0, 1 - this.stunT / 8) * 0.6, out);
      case 'blockstun': return VA.copyPose(get(this.lowBlock ? 'cblock' : 'block'), out);
      case 'air_hit': case 'thrown': {
        VA.copyPose(get('airHit'), out);
        out.rot = 35 + Math.min(70, Math.max(0, this.vy * 6 + 20));
        return out;
      }
      case 'knockdown': case 'ko': return VA.copyPose(get('lie'), out);
      case 'getup': return this.stateT < 10 ? VA.mixPose(get('lie'), get('getup'), this.stateT / 10, out) : VA.mixPose(get('getup'), get('stance'), Math.min(1, (this.stateT - 10) / 10), out);
      case 'dizzy': { VA.copyPose(get('dizzy'), out); out.lean += Math.sin(t * 0.12) * 8; out.head += Math.sin(t * 0.2) * 10; return out; }
      case 'win': return VA.copyPose(get(this.def.winPose || 'win'), out);
      case 'lose': return VA.copyPose(get('kneel'), out);
      case 'locked': return VA.copyPose(get('thrown'), out);
      case 'attack': return this.attackPose(get, out);
    }
    return VA.copyPose(V.stance, out);
  }

  attackPose(get, out) {
    const m = this.move, f = this.moveF;
    const base = this.grounded ? (m.crouch ? get('crouch') : get('stance')) : get('jump');
    if (m.keys) {
      // chaves explícitas [quadro, pose]
      const K = m.keys;
      let i = 0; while (i < K.length - 1 && K[i + 1][0] <= f) i++;
      const a = K[i], b = K[Math.min(i + 1, K.length - 1)];
      const span = Math.max(1, b[0] - a[0]);
      const pa = a[1] === '_base' ? base : get(a[1]), pb = b[1] === '_base' ? base : get(b[1]);
      return VA.mixPose(pa, pb, a === b ? 0 : U.clamp((f - a[0]) / span, 0, 1), out);
    }
    const A = get(m.anim ? m.anim[0] : 'jab_a'), Bp = get(m.anim ? m.anim[1] : 'jab_b');
    if (f < m.startup) return VA.mixPose(base, A, U.easeOut(f / Math.max(1, m.startup)), out);
    if (f < m.startup + m.active) return VA.mixPose(A, Bp, Math.min(1, (f - m.startup + 1) / 2), out);
    return VA.mixPose(Bp, base, U.easeInOut((f - m.startup - m.active) / Math.max(1, m.recovery)), out);
  }

  recordTrail() {
    const tr = this.trail[this.trailI];
    tr.x = this.x; tr.y = this.y; tr.f = this.facing; VA.copyPose(this.pose, tr.pose); tr.on = true;
    this.trailI = (this.trailI + 1) % this.trail.length;
  }

  // ------------------------------------------------------------ desenho
  draw(ctx) {
    const def = this.def;
    const look = this.currentLook();
    const build = this.build || (this.build = Object.assign({}, VA.Rig.BUILD, def.look.build));
    const shakeX = this.hitstop > 0 && (this.state === 'hitstun' || this.state === 'air_hit' || this.state === 'blockstun') ? (this.hitstop % 2 ? 2 : -2) : 0;
    // sombra no chão
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    const sh = Math.max(0.3, 1 - (GROUND - this.y) / 200);
    ctx.beginPath(); ctx.ellipse(this.x, GROUND + 2, 26 * sh * build.scale, 5 * sh, 0, 0, 7); ctx.fill();
    // rastro (após-imagens)
    const trailOn = (this.form && this.form.def.trail) || (this.move && this.move.trail) || this.state === 'run';
    if (trailOn) {
      const col = (this.form && this.form.def.trail) || (this.move && this.move.trail) || def.look.trailColor || '#8fa8ff';
      for (let i = 0; i < this.trail.length; i++) {
        const tr = this.trail[(this.trailI + i) % this.trail.length];
        if (!tr.on) continue;
        VA.Rig.draw(ctx, { x: tr.x, y: tr.y, facing: tr.f, pose: tr.pose, look, build, mono: col, alpha: 0.05 + i * 0.025 });
      }
    }
    // sprite real, se houver folha carregada
    const sp = VA.sprites[def.id];
    if (sp && VA.drawSprite(ctx, sp, { x: this.x + shakeX, y: this.y, facing: this.facing }, this.state === 'attack' ? this.move.id : this.state, this.state === 'attack' ? this.moveF : this.animT)) return;
    const vis = this.state === 'attack' && this.move && this.move.hideFrames && this.moveF >= this.move.hideFrames[0] && this.moveF <= this.move.hideFrames[1];
    if (vis) return;
    const o = { x: this.x + shakeX, y: this.y, facing: this.facing, pose: this.pose, look, build, t: this.animT, state: this };
    if (this.invuln > 0 && this.state === 'idle' && this.animT % 4 < 2) o.alpha = 0.6;
    if (this.fade != null) o.alpha = this.fade;
    VA.Rig.draw(ctx, o);
    if (this.flash > 0) { o.mono = this.flashColor || '#ffffff'; o.alpha = this.flash / 8; VA.Rig.draw(ctx, o); }
    if (this.state === 'attack' && this.move && this.move.drawFx) this.move.drawFx(ctx, this, this.moveF);
    if (this.def.drawFx) this.def.drawFx(ctx, this);
  }
  currentLook() {
    let look = this.form && this.form.def.look ? (this._formLook && this._formLookId === this.form.id ? this._formLook : (this._formLookId = this.form.id, this._formLook = Object.assign({}, this.def.look, this.form.def.look))) : this.def.look;
    if (this.def.lookMod) look = this.def.lookMod(this, look);
    return look;
  }
}
VA.Fighter = Fighter;
VA.ENERGY_MAX = ENERGY_MAX;
