/* =========================================================================
   STICKER POWERS — motor de batalha por turnos (sem DOM).
   Fluxo:  const t = Battle.beginTurn(b)   -> { actor, events, canAct }
           se canAct: Battle.act(b, actor, acao) -> events
   A interface anima os eventos; o motor já aplicou tudo no estado.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const Battle = SP.Battle = {};

  const BAD = ['burn', 'poison', 'freeze', 'stun', 'weaken', 'slow'];
  const MAX_ROUNDS = 60;

  /* ---------------------------------------------------------------- criação */
  function makeUnit(spec, side, idx) {
    const s = SP.STICKER[spec.id];
    const stars = spec.stars || 1;
    const st = SP.Core.statsFor(spec.id, spec.level || 1, stars);
    return {
      uid: side[0] + idx, side, id: spec.id, name: s.name, el: s.el, rarity: s.rarity,
      level: spec.level || 1, stars, isBoss: false,
      maxHp: st.hp, hp: st.hp, atk: st.atk, def: st.def, spd: st.spd,
      maxEn: st.en, en: 1, skill: SP.Core.skillFor(spec.id, stars), talent: stars >= 2,
      statuses: [], shield: 0, alive: true, hastedRound: -1, delayedNext: false
    };
  }

  function makeBoss(bossId, level, idx) {
    const b = SP.BOSS[bossId];
    const stars = SP.starsForLevel(level);
    const B = SP.BASE_STATS, rm = SP.BOSS_BASE_MULT;
    const m = (1 + SP.PROG.levelGrowth * (level - 1)) * (1 + SP.PROG.starGrowth * (stars - 1));
    const hp = Math.round(B.hp * rm * m * b.hp);
    return {
      uid: 'e' + idx, side: 'enemy', id: bossId, name: b.name, el: b.el, rarity: 'boss',
      level, stars, isBoss: true,
      maxHp: hp, hp, atk: Math.round(B.atk * rm * m * b.atk), def: Math.round(B.def * rm * m * b.def),
      spd: Math.round(B.spd * 1.2 * b.spd * (1 + 0.012 * (level - 1)) * 10) / 10,
      maxEn: b.en, en: 0, skill: null, talent: false,
      statuses: [], shield: 0, alive: true, hastedRound: -1, delayedNext: false,
      pattern: b.pattern, enrageList: b.enrage, patIdx: 0, enIdx: 0, enraged: false, usedOnce: {}, acts: b.acts
    };
  }

  /**
   * opts: { players: [{id, level, stars}], enemies: [{id, level, stars}] | boss: {id, level}, rng }
   */
  Battle.create = function (opts) {
    const b = {
      units: [], queue: [], round: 0, over: false, winner: null,
      rng: opts.rng || Math.random,
      stats: { skillsUsed: 0, advantageHits: 0, damageDealt: 0 },
      log: []
    };
    opts.players.forEach((p, i) => b.units.push(makeUnit(p, 'player', i)));
    if (opts.boss) b.units.push(makeBoss(opts.boss.id, opts.boss.level, 0));
    else opts.enemies.forEach((e, i) => b.units.push(makeUnit(e, 'enemy', i)));
    // talento do Metal: escudo inicial
    b.units.forEach(u => { if (u.talent && u.el === 'metal') u.shield = Math.round(u.maxHp * 0.12); });
    return b;
  };

  /* ---------------------------------------------------------------- consultas */
  Battle.unit = (b, uid) => b.units.find(u => u.uid === uid);
  Battle.alive = (b, side) => b.units.filter(u => u.alive && u.side === side);
  const foeSide = side => (side === 'player' ? 'enemy' : 'player');
  const has = (u, s) => u.statuses.some(x => x.s === s);
  const getS = (u, s) => u.statuses.find(x => x.s === s);
  Battle.has = has;

  Battle.effAtk = function (u) {
    let a = u.atk;
    if (has(u, 'weaken')) a *= 0.7;
    if (has(u, 'atkUp')) a *= 1.3;
    return a;
  };
  Battle.effDef = function (u) {
    let d = u.def;
    if (has(u, 'defUp')) d *= 1.5;
    if (u.talent && u.el === 'earth') d *= 1.15;
    return d;
  };
  Battle.effSpd = function (u) {
    let s = u.spd;
    if (has(u, 'slow')) s *= 0.6;
    if (u.talent && u.el === 'wind') s *= 1.15;
    return s;
  };

  /** Alvos válidos para uma ação de um ator (respeita provocação). */
  Battle.validTargets = function (b, actor, action) {
    const foes = Battle.alive(b, foeSide(actor.side));
    const taunting = foes.filter(u => has(u, 'taunt'));
    const foeTargets = taunting.length ? taunting : foes;
    if (action === 'attack') return foeTargets;
    if (action === 'skill') {
      const t = actor.skill.target;
      if (t === 'enemy') return foeTargets;
      if (t === 'ally') return Battle.alive(b, actor.side);
      return [];
    }
    return [];
  };
  Battle.skillNeedsTarget = sk => sk.target === 'enemy' || sk.target === 'ally';
  Battle.canSkill = (u) => !!u.skill && u.en >= u.skill.cost;

  /** A partir da rodada 15, todo dano cresce 15% por rodada (evita empates eternos). */
  Battle.FURY_ROUND = 15;
  Battle.arenaFury = b => 1 + Math.max(0, b.round - Battle.FURY_ROUND) * 0.15;

  /* ---------------------------------------------------------------- fila de turnos */
  function buildQueue(b) {
    const alive = b.units.filter(u => u.alive);
    const normal = alive.filter(u => !u.delayedNext);
    const late = alive.filter(u => u.delayedNext);
    const order = list => list
      .map(u => ({ u, k: Battle.effSpd(u) * (1 + b.rng() * 0.06) }))
      .sort((x, y) => y.k - x.k).map(x => x.u.uid);
    const q = order(normal).concat(order(late));
    late.forEach(u => { u.delayedNext = false; });
    // chefes agem mais de uma vez por rodada
    alive.filter(u => u.isBoss && u.acts > 1).forEach(u => {
      for (let i = 1; i < u.acts; i++) {
        const pos = Math.max(q.indexOf(u.uid) + 2, Math.floor(q.length * i / u.acts) + 1);
        q.splice(Math.min(q.length, pos), 0, u.uid);
      }
    });
    b.queue = q;
  }

  /* ---------------------------------------------------------------- status */
  function addStatus(b, u, s, t, v, fresh, ev) {
    if (!u.alive) return;
    if (u.isBoss && (s === 'freeze' || s === 'stun') && b.rng() < 0.5) {
      ev.push({ t: 'resist', u: u.uid, s });
      return;
    }
    const cur = getS(u, s);
    if (cur) {
      cur.t = Math.max(cur.t, t);
      if (s === 'poison') cur.v = Math.min(5, (cur.v || 0) + (v || 1));
      else if (v != null) cur.v = Math.max(cur.v || 0, v);
      if (fresh) cur.fresh = true;
    } else {
      const st = { s, t, fresh: !!fresh };
      if (s === 'poison') st.v = Math.min(5, v || 1);
      else if (v != null) st.v = v;
      u.statuses.push(st);
    }
    ev.push({ t: 'status', u: u.uid, s, add: true });
  }
  function removeStatus(u, s, ev) {
    const before = u.statuses.length;
    u.statuses = u.statuses.filter(x => x.s !== s);
    if (u.statuses.length !== before) ev.push({ t: 'status', u: u.uid, s, add: false });
  }

  /* ---------------------------------------------------------------- dano e cura */
  function heal(b, u, amount, ev) {
    if (!u.alive || amount <= 0) return 0;
    const real = Math.min(u.maxHp - u.hp, Math.round(amount));
    u.hp += real;
    ev.push({ t: 'heal', u: u.uid, amount: real, hp: u.hp });
    return real;
  }

  function kill(b, u, ev) {
    u.hp = 0; u.alive = false; u.statuses = []; u.shield = 0;
    b.queue = b.queue.filter(id => id !== u.uid);
    ev.push({ t: 'death', u: u.uid });
  }

  function checkEnrage(b, u, ev) {
    if (u.isBoss && u.alive && !u.enraged && u.hp <= u.maxHp * 0.5) {
      u.enraged = true;
      ev.push({ t: 'enrage', u: u.uid });
      ev.push({ t: 'log', text: u.name + ' entrou em FÚRIA!' });
    }
  }

  /** Aplica dano bruto (já calculado) passando por defesa, escudo e morte. */
  function applyDamage(b, src, tgt, raw, ev, info) {
    let dmg = Math.max(1, Math.round(raw));
    if (has(tgt, 'guard')) dmg = Math.max(1, Math.round(dmg * 0.5));
    let absorbed = 0;
    if (tgt.shield > 0) {
      absorbed = Math.min(tgt.shield, dmg);
      tgt.shield -= absorbed;
      dmg -= absorbed;
    }
    tgt.hp = Math.max(0, tgt.hp - dmg);
    ev.push(Object.assign({ t: 'damage', src: src ? src.uid : null, u: tgt.uid, amount: dmg, absorbed, hp: tgt.hp, shield: tgt.shield }, info || {}));
    if (src && src.side === 'player') b.stats.damageDealt += dmg;
    if (tgt.hp <= 0) kill(b, tgt, ev);
    else checkEnrage(b, tgt, ev);
    return dmg + absorbed;
  }

  /**
   * Golpe de `att` em `tgt`. opts: { p, pierce, crit, bonusVs, single, fixed, normal }
   * Retorna o dano causado.
   */
  function strike(b, att, tgt, opts, ev) {
    if (!tgt.alive || !att.alive) return 0;
    if (opts.single) {
      const dodge = getS(tgt, 'dodge');
      const windDodge = tgt.talent && tgt.el === 'wind' && b.rng() < 0.12;
      if (dodge || windDodge) {
        if (dodge) removeStatus(tgt, 'dodge', ev);
        ev.push({ t: 'dodge', u: tgt.uid, src: att.uid });
        return 0;
      }
    }
    let mult = SP.elementMult(att.el, tgt.el);
    if (opts.bonusVs && opts.bonusVs === tgt.el) mult *= 1.5;
    let critChance = 0.08 + (opts.crit || 0) + (att.talent && att.el === 'plasma' ? 0.15 : 0);
    const crit = b.rng() < critChance;
    let raw;
    if (opts.fixed != null) {
      raw = opts.fixed * mult;
    } else {
      const a = Battle.effAtk(att);
      const d = Battle.effDef(tgt) * (1 - (opts.pierce || 0));
      raw = opts.p * a * (a / (a + d)) * 1.5 * mult;
    }
    raw *= (crit ? 1.6 : 1) * (0.92 + b.rng() * 0.16) * Battle.arenaFury(b);
    if (att.side === 'player' && mult > 1) b.stats.advantageHits++;
    const dealt = applyDamage(b, att, tgt, raw, ev, { crit, mult, el: att.el });
    // espinhos / talento da Natureza
    let refl = 0;
    const rs = getS(tgt, 'reflect');
    if (rs) refl += rs.v || 0.3;
    if (tgt.talent && tgt.el === 'nature') refl += 0.15;
    if (refl > 0 && dealt > 0 && att.alive && att !== tgt) {
      applyDamage(b, tgt, att, dealt * refl, ev, { reflect: true, el: tgt.el, mult: 1 });
    }
    return dealt;
  }

  /* ---------------------------------------------------------------- efeitos de habilidades */
  function resolveTo(b, actor, to, T) {
    if (!to) return T;
    if (to === 'self') return [actor];
    if (to === 'allies') return Battle.alive(b, actor.side);
    if (to === 'enemies') return Battle.alive(b, foeSide(actor.side));
    if (to === 'lowestAlly') {
      const al = Battle.alive(b, actor.side).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp);
      return al.length ? [al[0]] : [];
    }
    return T;
  }

  function hasteUnit(b, u, ev) {
    if (!u.alive || u.hastedRound === b.round) return false;
    u.hastedRound = b.round;
    b.queue.unshift(u.uid);
    ev.push({ t: 'haste', u: u.uid });
    return true;
  }

  function runFx(b, actor, move, T, ev) {
    const single = move.target === 'enemy';
    let totalDmg = 0;
    move.fx.forEach(f => {
      switch (f.k) {
        case 'dmg': {
          T.forEach(tgt => {
            const hits = f.hits || 1;
            for (let h = 0; h < hits && tgt.alive && actor.alive; h++) {
              const d = strike(b, actor, tgt, { p: f.p, pierce: f.pierce, crit: f.crit, bonusVs: f.bonusVs, single }, ev);
              totalDmg += d;
              if (f.ls && d > 0) heal(b, actor, d * f.ls, ev);
            }
          });
          if (f.teamHeal && totalDmg > 0) {
            const allies = Battle.alive(b, actor.side);
            allies.forEach(a => heal(b, a, totalDmg * f.teamHeal / allies.length, ev));
          }
          break;
        }
        case 'chain': {
          Battle.alive(b, foeSide(actor.side)).filter(u => T.indexOf(u) < 0).forEach(u => {
            totalDmg += strike(b, actor, u, { p: f.p }, ev);
          });
          break;
        }
        case 'pctHp': {
          T.forEach(tgt => {
            if (!tgt.alive) return;
            const p = tgt.isBoss ? f.p * 0.25 : f.p;
            const a = Battle.effAtk(actor);
            const floor = (f.minP || 0.5) * a * (a / (a + Battle.effDef(tgt))) * 1.5;
            totalDmg += strike(b, actor, tgt, { fixed: Math.max(tgt.hp * p, floor), single }, ev);
          });
          break;
        }
        case 'status': {
          resolveTo(b, actor, f.to, T).forEach(u => {
            if (!u.alive) return;
            if (f.chance != null && b.rng() >= f.chance) return;
            addStatus(b, u, f.s, f.t, f.v, u === actor, ev);
          });
          break;
        }
        case 'heal': {
          resolveTo(b, actor, f.to, T).forEach(u => heal(b, u, u.maxHp * f.pct, ev));
          break;
        }
        case 'shield': {
          resolveTo(b, actor, f.to, T).forEach(u => {
            if (!u.alive) return;
            const amt = Math.round(u.maxHp * f.pct);
            u.shield += amt;
            ev.push({ t: 'shield', u: u.uid, amount: amt, shield: u.shield });
          });
          break;
        }
        case 'energy': {
          let stolen = 0;
          resolveTo(b, actor, f.to, T).forEach(u => {
            if (!u.alive) return;
            const before = u.en;
            u.en = Math.max(0, Math.min(u.maxEn, u.en + f.n));
            if (u.en !== before) ev.push({ t: 'energy', u: u.uid, delta: u.en - before, en: u.en });
            if (f.n < 0) stolen += before - u.en;
          });
          if (f.steal && stolen > 0) {
            const before = actor.en;
            actor.en = Math.min(actor.maxEn, actor.en + stolen);
            if (actor.en !== before) ev.push({ t: 'energy', u: actor.uid, delta: actor.en - before, en: actor.en });
          }
          break;
        }
        case 'haste': {
          resolveTo(b, actor, f.to, T).forEach(u => hasteUnit(b, u, ev));
          break;
        }
        case 'delay': {
          resolveTo(b, actor, f.to, T).forEach(u => {
            if (!u.alive) return;
            if (b.queue.indexOf(u.uid) >= 0) {
              b.queue = b.queue.filter(id => id !== u.uid);
              b.queue.push(u.uid);
            } else {
              u.delayedNext = true;
            }
            ev.push({ t: 'delay', u: u.uid });
          });
          break;
        }
        case 'cleanse': {
          resolveTo(b, actor, f.to, T).forEach(u => BAD.forEach(s => removeStatus(u, s, ev)));
          break;
        }
        case 'dispel': {
          resolveTo(b, actor, f.to, T).forEach(u => {
            ['defUp', 'atkUp', 'regen', 'reflect', 'taunt', 'dodge', 'guard'].forEach(s => removeStatus(u, s, ev));
            if (u.shield > 0) { u.shield = 0; ev.push({ t: 'shield', u: u.uid, amount: 0, shield: 0 }); }
          });
          break;
        }
        case 'selfDmg': {
          const amt = Math.min(actor.hp - 1, Math.round(actor.maxHp * f.pct));
          if (amt > 0) {
            actor.hp -= amt;
            ev.push({ t: 'damage', src: actor.uid, u: actor.uid, amount: amt, absorbed: 0, hp: actor.hp, shield: actor.shield, self: true, el: actor.el, mult: 1 });
          }
          break;
        }
        case 'reviveAll': {
          b.units.filter(u => u.side === actor.side && !u.alive && !u.isBoss).forEach(u => {
            u.alive = true; u.hp = Math.round(u.maxHp * f.pct); u.statuses = []; u.en = 1;
            b.queue.push(u.uid);
            ev.push({ t: 'revive', u: u.uid, hp: u.hp });
          });
          break;
        }
        case 'reviveOrHeal': {
          const dead = b.units.filter(u => u.side === actor.side && !u.alive && !u.isBoss);
          if (dead.length) {
            const u = dead[0];
            u.alive = true; u.hp = Math.round(u.maxHp * f.pct); u.statuses = []; u.en = 1;
            b.queue.push(u.uid);
            ev.push({ t: 'revive', u: u.uid, hp: u.hp });
          } else {
            Battle.alive(b, actor.side).forEach(u => {
              heal(b, u, u.maxHp * f.healPct, ev);
              const before = u.en;
              u.en = Math.min(u.maxEn, u.en + 1);
              if (u.en !== before) ev.push({ t: 'energy', u: u.uid, delta: 1, en: u.en });
            });
          }
          break;
        }
      }
    });
    return totalDmg;
  }

  /** Talentos elementais (estrela 2+) disparados em ataques normais. */
  function talentOnAttack(b, u, tgt, ev) {
    if (!u.talent || !u.alive) return;
    switch (u.el) {
      case 'fire': if (tgt.alive && b.rng() < 0.25) addStatus(b, tgt, 'burn', 3, null, false, ev); break;
      case 'water': heal(b, u, u.maxHp * 0.06, ev); break;
      case 'ice': if (tgt.alive && b.rng() < 0.15) addStatus(b, tgt, 'freeze', 1, null, false, ev); break;
      case 'lightning': if (tgt.alive && b.rng() < 0.25) { ev.push({ t: 'log', text: 'Descarga extra!' }); strike(b, u, tgt, { p: 0.5 }, ev); } break;
      case 'dark': if (tgt.alive && b.rng() < 0.25) addStatus(b, tgt, 'weaken', 2, null, false, ev); break;
      case 'gravity': if (tgt.alive && tgt.en > 0) { tgt.en--; ev.push({ t: 'energy', u: tgt.uid, delta: -1, en: tgt.en }); } break;
      case 'poison': if (tgt.alive && b.rng() < 0.35) addStatus(b, tgt, 'poison', 3, 1, false, ev); break;
      case 'time': if (b.rng() < 0.15) hasteUnit(b, u, ev); break;
    }
  }

  /* ---------------------------------------------------------------- ciclo de turno */
  /** Começa o próximo turno: aplica efeitos de início e diz se o ator pode agir. */
  Battle.beginTurn = function (b) {
    const ev = [];
    if (b.over) return { actor: null, events: ev, canAct: false };
    let u = null;
    let guard = 0;
    while (!u && guard++ < 50) {
      if (!b.queue.length) {
        b.round++;
        if (b.round > MAX_ROUNDS) {
          b.over = true; b.winner = 'enemy'; b.timeout = true;
          ev.push({ t: 'log', text: 'O tempo acabou! A batalha foi perdida por limite de rodadas.' });
          ev.push({ t: 'end', winner: 'enemy' });
          return { actor: null, events: ev, canAct: false };
        }
        buildQueue(b);
        ev.push({ t: 'round', n: b.round });
        if (b.round === Battle.FURY_ROUND + 1) ev.push({ t: 'log', text: 'FÚRIA DA ARENA! Todo dano aumenta a cada rodada.' });
      }
      const cand = Battle.unit(b, b.queue.shift());
      if (cand && cand.alive) u = cand;
    }
    if (!u) return { actor: null, events: ev, canAct: false };
    b.current = u.uid;
    ev.push({ t: 'turn', u: u.uid });
    removeStatus(u, 'guard', ev);

    // energia
    const gain = 1 + (u.talent && u.el === 'cosmic' ? 1 : 0) + (u.isBoss ? 1 : 0);
    const before = u.en;
    u.en = Math.min(u.maxEn, u.en + gain);
    if (u.en !== before) ev.push({ t: 'energy', u: u.uid, delta: u.en - before, en: u.en });

    // dano contínuo e regeneração (chefes sofrem só na primeira ação da rodada)
    const tickDots = !u.isBoss || u.dotRound !== b.round;
    u.dotRound = b.round;
    const burn = tickDots && getS(u, 'burn');
    if (burn) {
      const amt = Math.max(1, Math.round(u.maxHp * (u.isBoss ? 0.025 : 0.07)));
      u.hp = Math.max(0, u.hp - amt);
      ev.push({ t: 'dot', u: u.uid, kind: 'burn', amount: amt, hp: u.hp });
      if (u.hp <= 0) kill(b, u, ev); else checkEnrage(b, u, ev);
    }
    const poison = tickDots && getS(u, 'poison');
    if (u.alive && poison) {
      const amt = Math.max(1, Math.round(u.maxHp * (u.isBoss ? 0.012 : 0.04) * (poison.v || 1)));
      u.hp = Math.max(0, u.hp - amt);
      ev.push({ t: 'dot', u: u.uid, kind: 'poison', amount: amt, hp: u.hp });
      if (u.hp <= 0) kill(b, u, ev); else checkEnrage(b, u, ev);
    }
    if (u.alive) {
      const rg = getS(u, 'regen');
      if (rg) heal(b, u, u.maxHp * (rg.v || 0.1), ev);
      if (u.talent && u.el === 'light') heal(b, u, u.maxHp * 0.04, ev);
    }
    if (!u.alive) {
      checkEnd(b, ev);
      return { actor: u, events: ev, canAct: false };
    }
    // congelado / atordoado: perde o turno
    const cc = getS(u, 'freeze') || getS(u, 'stun');
    if (cc) {
      removeStatus(u, cc.s, ev);
      ev.push({ t: 'skip', u: u.uid, reason: cc.s });
      endTurn(b, u, ev);
      return { actor: u, events: ev, canAct: false };
    }
    return { actor: u, events: ev, canAct: true };
  };

  function endTurn(b, u, ev) {
    u.statuses.forEach(st => {
      if (st.s === 'guard') return;
      if (st.fresh) { st.fresh = false; return; }
      st.t--;
    });
    const expired = u.statuses.filter(st => st.s !== 'guard' && st.t <= 0).map(st => st.s);
    expired.forEach(s => removeStatus(u, s, ev));
    checkEnd(b, ev);
  }

  function checkEnd(b, ev) {
    if (b.over) return;
    const p = Battle.alive(b, 'player').length, e = Battle.alive(b, 'enemy').length;
    if (!p || !e) {
      b.over = true;
      b.winner = p ? 'player' : 'enemy';
      ev.push({ t: 'end', winner: b.winner });
    }
  }

  /** Executa a ação. action: { type: 'attack'|'skill'|'defend'|'boss', target: uid, move } */
  Battle.act = function (b, u, action) {
    const ev = [];
    if (b.over || !u.alive) return ev;
    const tgt = action.target ? Battle.unit(b, action.target) : null;
    if (action.type === 'defend') {
      addStatus(b, u, 'guard', 1, null, true, ev);
      const before = u.en;
      u.en = Math.min(u.maxEn, u.en + 1);
      ev.unshift({ t: 'action', u: u.uid, kind: 'defend', name: 'Defender', targets: [u.uid], el: u.el });
      if (u.en !== before) ev.push({ t: 'energy', u: u.uid, delta: u.en - before, en: u.en });
    } else if (action.type === 'attack') {
      const valid = Battle.validTargets(b, u, 'attack');
      const t = (tgt && valid.indexOf(tgt) >= 0) ? tgt : valid[0];
      if (t) {
        ev.push({ t: 'action', u: u.uid, kind: 'attack', name: 'Ataque', targets: [t.uid], el: u.el });
        strike(b, u, t, { p: 1, single: true }, ev);
        const before = u.en;
        u.en = Math.min(u.maxEn, u.en + 1);
        if (u.en !== before) ev.push({ t: 'energy', u: u.uid, delta: u.en - before, en: u.en });
        talentOnAttack(b, u, t, ev);
      }
    } else if (action.type === 'skill') {
      const sk = u.skill;
      if (!sk || u.en < sk.cost) return Battle.act(b, u, { type: 'attack', target: action.target });
      let T;
      if (sk.target === 'enemy' || sk.target === 'ally') {
        const valid = Battle.validTargets(b, u, 'skill');
        T = [(tgt && valid.indexOf(tgt) >= 0) ? tgt : valid[0]].filter(Boolean);
      } else if (sk.target === 'allEnemies') T = Battle.alive(b, foeSide(u.side));
      else if (sk.target === 'allAllies') T = Battle.alive(b, u.side);
      else T = [u];
      u.en -= sk.cost;
      ev.push({ t: 'action', u: u.uid, kind: 'skill', name: sk.name, targets: T.map(x => x.uid), el: u.el, target: sk.target });
      ev.push({ t: 'energy', u: u.uid, delta: -sk.cost, en: u.en });
      if (u.side === 'player') b.stats.skillsUsed++;
      runFx(b, u, sk, T, ev);
    } else if (action.type === 'boss') {
      const mv = action.move;
      let T;
      if (mv.target === 'enemy') {
        const valid = Battle.validTargets(b, u, 'attack');
        T = [(tgt && valid.indexOf(tgt) >= 0) ? tgt : valid[0]].filter(Boolean);
      } else if (mv.target === 'allEnemies') T = Battle.alive(b, foeSide(u.side));
      else T = [u];
      ev.push({ t: 'action', u: u.uid, kind: 'boss', name: mv.name, targets: T.map(x => x.uid), el: u.el, target: mv.target });
      runFx(b, u, mv, T, ev);
    }
    endTurn(b, u, ev);
    return ev;
  };

  /* ---------------------------------------------------------------- inteligência artificial */
  function targetScore(b, u, t, power) {
    const mult = SP.elementMult(u.el, t.el);
    const a = Battle.effAtk(u);
    const est = power * a * (a / (a + Battle.effDef(t))) * 1.5 * mult;
    const kill = est >= t.hp + t.shield ? 1.2 : 0;
    return mult * 1.0 + (1 - t.hp / t.maxHp) * 0.8 + kill + b.rng() * 0.2;
  }
  function bestTarget(b, u, list, power) {
    let best = null, bs = -1e9;
    list.forEach(t => { const s = targetScore(b, u, t, power || 1); if (s > bs) { bs = s; best = t; } });
    return best;
  }

  /** Escolhe a próxima ação para inimigos (e para o modo automático do jogador). */
  Battle.aiChoose = function (b, u) {
    if (u.isBoss) {
      let list = u.enraged ? u.enrageList : u.pattern;
      let mv = null;
      for (let tries = 0; tries < list.length && !mv; tries++) {
        const idx = u.enraged ? u.enIdx++ % list.length : u.patIdx++ % list.length;
        const cand = list[idx];
        if (cand.once && u.usedOnce[cand.name]) continue;
        mv = cand;
      }
      mv = mv || u.pattern[0];
      if (mv.once) u.usedOnce[mv.name] = true;
      const valid = Battle.validTargets(b, u, 'attack');
      const t = mv.target === 'enemy' ? bestTarget(b, u, valid, 1.2) : null;
      return { type: 'boss', move: mv, target: t ? t.uid : null };
    }
    const allies = Battle.alive(b, u.side);
    const sk = u.skill;
    if (sk && u.en >= sk.cost) {
      const kinds = sk.fx.map(f => f.k);
      const healing = kinds.indexOf('heal') >= 0 || kinds.indexOf('reviveOrHeal') >= 0;
      const dealsDamage = kinds.some(k => k === 'dmg' || k === 'pctHp' || k === 'chain');
      const lowest = allies.slice().sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
      if (kinds.indexOf('reviveAll') >= 0) {
        const dead = b.units.some(x => x.side === u.side && !x.alive);
        if (dead || lowest.hp / lowest.maxHp < 0.6 || b.rng() < 0.5) return { type: 'skill', target: null };
      } else if (kinds.indexOf('reviveOrHeal') >= 0) {
        const dead = b.units.some(x => x.side === u.side && !x.alive);
        if (dead || lowest.hp / lowest.maxHp < 0.6) return { type: 'skill', target: null };
      } else if (healing && !dealsDamage) {
        if (lowest.hp / lowest.maxHp < 0.6) return { type: 'skill', target: sk.target === 'ally' ? lowest.uid : null };
      } else if (kinds.indexOf('haste') >= 0 && sk.target === 'ally') {
        const others = allies.filter(x => x !== u && x.hastedRound !== b.round);
        if (others.length) {
          const strongest = others.sort((x, y) => Battle.effAtk(y) - Battle.effAtk(x))[0];
          return { type: 'skill', target: strongest.uid };
        }
      } else if (!dealsDamage) {
        const danger = u.hp / u.maxHp < 0.75 || allies.some(x => x.hp / x.maxHp < 0.5);
        if (danger || b.rng() < 0.35) return { type: 'skill', target: null };
      } else {
        const valid = Battle.validTargets(b, u, 'skill');
        const t = sk.target === 'enemy' ? bestTarget(b, u, valid, 1.4) : null;
        return { type: 'skill', target: t ? t.uid : null };
      }
    }
    if (u.hp / u.maxHp < 0.25 && b.rng() < 0.2) return { type: 'defend' };
    const t = bestTarget(b, u, Battle.validTargets(b, u, 'attack'), 1);
    return { type: 'attack', target: t ? t.uid : null };
  };

  /** Simula uma batalha inteira com IA dos dois lados (usado em testes e modo automático). */
  Battle.simulate = function (b, maxTurns) {
    const all = [];
    let n = 0;
    while (!b.over && n++ < (maxTurns || 2000)) {
      const t = Battle.beginTurn(b);
      all.push.apply(all, t.events);
      if (t.canAct) all.push.apply(all, Battle.act(b, t.actor, Battle.aiChoose(b, t.actor)));
    }
    return all;
  };
})(typeof window !== 'undefined' ? window : globalThis);
