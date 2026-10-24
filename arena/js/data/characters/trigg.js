// =====================================================================
//  TRIGG — antagonista / chefe final do Arcade do V.
//  CANÔNICO (índice): está preso numa realidade própria, sem saída
//  ("A Prisão Fora de Tudo", cap. 46); "nunca parou de tentar" (cap. 47
//  "A Rachadura"); volta com o poder de apagar a possibilidade das coisas
//  terem existido — e não funciona (cap. 48 "Trigg").
//  PROPOSTA DO JOGO: aparência (máscara, coroa de estilhaços, manto),
//  todo o estilo de luta e a forma passiva "Rachadura". Origem, motivos
//  e vínculos de Trigg NÃO são definidos aqui.
// =====================================================================
'use strict';

(function () {
  const VIOLET = '#9b7bff', VOIDC = '#07040e';

  function drawRift(ctx, p) {
    const x = p.x, y = p.y, w = p.w, h = p.h;
    ctx.save();
    ctx.fillStyle = VOIDC; ctx.fillRect(x, y + h * 0.3, w, h * 0.7);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = U.rgba(VIOLET, 0.9); ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) ctx.lineTo(x + w * i / 6, y + h * 0.3 + Math.sin(p.t * 0.6 + i * 2) * 3 - (i % 2) * 6);
    ctx.stroke();
    ctx.restore();
    if (p.t % 2 === 0) FX.spawn('shard', x + U.rand(0, w), y + h * 0.4, U.rand(-1, 1), U.rand(-3, -1), 24, 2, VIOLET, { g: 0.1 });
  }

  function apagar(f, m) {
    m.projectiles.push(VA.makeProjectile(f, {
      cx: f.x + f.facing * 40, cy: GROUND - 10, w: 34, h: 22, speed: 5, life: 120,
      hit: { dmg: 75, stun: 18, bstun: 14, push: 5, chip: 9, level: 'low', color: VIOLET }, draw: drawRift,
    }));
    Audio2.sfx('erupt');
  }

  function drawPillar(ctx, p) {
    const cx = p.x + p.w / 2;
    if (p.t < p.activeFrom) {
      // aviso no chão: dá para reagir
      const a = 0.3 + 0.3 * Math.sin(p.t * 0.5);
      ctx.fillStyle = U.rgba(VIOLET, a); ctx.fillRect(p.x, GROUND - 3, p.w, 4);
      ctx.strokeStyle = U.rgba(VIOLET, a); ctx.beginPath(); ctx.ellipse(cx, GROUND, p.w * 0.7, 5, 0, 0, 7); ctx.stroke();
      return;
    }
    const k = Math.min(1, (p.t - p.activeFrom) / 6), fade = Math.max(0, 1 - (p.t - p.activeFrom - 14) / 10);
    ctx.save(); ctx.globalAlpha = fade;
    ctx.fillStyle = VOIDC; ctx.fillRect(p.x + 4, GROUND - p.h * k, p.w - 8, p.h * k);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = U.rgba(VIOLET, 0.45); ctx.fillRect(p.x, GROUND - p.h * k, 4, p.h * k); ctx.fillRect(p.x + p.w - 4, GROUND - p.h * k, 4, p.h * k);
    ctx.restore();
  }

  function pilar(f, m) {
    const o = f.opp;
    m.projectiles.push(VA.makeProjectile(f, {
      cx: o.x, cy: GROUND - 90, w: 40, h: 180, speed: 0, life: 62, activeFrom: 34, clash: false,
      hit: { dmg: 110, stun: 24, bstun: 16, push: 2, chip: 14, knock: 'launch', launch: { vx: 1.5, vy: -10 }, color: VIOLET },
      draw: drawPillar, onDie: null,
      update(p) { if (p.t === p.activeFrom) { Audio2.sfx('erupt'); FX.shake(4); FX.burst(p.x + p.w / 2, GROUND - 20, VIOLET, 20, 5); } },
    }));
    Audio2.sfx('charge');
  }

  function drawCage(ctx, p) {
    const a = p.t < p.activeFrom ? p.t / p.activeFrom : Math.min(1, (p.life - p.t) / 30);
    ctx.save(); ctx.globalAlpha = a * 0.8;
    ctx.strokeStyle = VIOLET; ctx.lineWidth = 1.5;
    const cx = p.x + p.w / 2;
    for (let i = 0; i < 5; i++) { const x = p.x + i * p.w / 4; ctx.beginPath(); ctx.moveTo(x, GROUND); ctx.lineTo(cx + (x - cx) * 0.3, p.y); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(cx, GROUND, p.w / 2, 5, 0, 0, 7); ctx.stroke();
    ctx.restore();
  }

  function jaula(f, m) {
    m.projectiles.push(VA.makeProjectile(f, {
      cx: f.x + f.facing * 140, cy: GROUND - 45, w: 44, h: 90, speed: 0, life: 240, activeFrom: 20, counts: false, clash: false,
      hit: { dmg: 20, stun: 50, bstun: 20, push: 0, chip: 0, spark: 'light', color: VIOLET, noCounter: true }, draw: drawCage,
    }));
    Audio2.sfx('charge');
  }

  // Inexistir: agarrão de comando — o alvo se desfaz em fragmentos e volta
  function inexistir(a, tg, t, m) {
    a.poseOverride = t < 30 ? 'grab' : 'push_b';
    tg.x = a.x + a.facing * 34; tg.facing = -a.facing;
    tg.fade = t < 30 ? (t % 4 < 2 ? 0.35 : 0.8) : 1;
    if (t % 3 === 0 && t < 30) FX.spawn('shard', tg.x + U.rand(-10, 10), tg.y - U.rand(10, 90), U.rand(-2, 2), U.rand(-2, 0), 30, 3, '#e8e2ff', { g: 0.05 });
    if (t === 30) {
      tg.fade = null;
      VA.Combat.scriptHit(a, tg, { dmg: 160, power: 3, color: VIOLET, sfx: 'hitS', shake: 7 }, m);
      tg.setState('air_hit'); tg.grounded = false; tg.vy = -6; tg.vx = a.facing * 4; tg.kd = true;
    }
  }

  const DESFAZER = {
    dur: 100,
    script(a, tg, t, m) {
      m.timeStop = 14; m.darkT = 20;
      m.focus = { x: (a.x + tg.x) / 2, z: 1.25 };
      tg.vx = tg.vy = 0; tg.grounded = false; tg.y = U.lerp(tg.y, GROUND - 26, 0.2); tg.poseOverride = 'airHit';
      a.poseOverride = t % 20 < 10 ? 'push_b' : 'cast_a';
      const immune = tg.def.id === 'v' && tg.form && tg.form.id === 'grande';
      tg.fade = t % 6 < 3 ? 0.4 : 0.9;
      if (t % 18 === 9 && t < 90) VA.Combat.scriptHit(a, tg, { dmg: immune ? 10 : 45, power: 2, color: VIOLET, shake: 3 }, m);
      if (t % 4 === 0) FX.spawn('shard', tg.x + U.rand(-14, 14), tg.y - U.rand(10, 90), U.rand(-3, 3), U.rand(-3, 1), 30, 3, '#e8e2ff', { g: 0.05 });
      if (t === 92) {
        tg.fade = null;
        if (immune) { m.announce('NÃO FUNCIONA.', '#ffffff', 90, tg); FX.flash('#ffffff', 0.7, 0.03); VA.Combat.scriptHit(a, tg, { dmg: 20, power: 1, color: '#ffffff' }, m); }
        else { VA.Combat.scriptHit(a, tg, { dmg: 140, power: 3, color: VIOLET, sfx: 'boom', shake: 12 }, m); FX.flash(VIOLET, 0.7, 0.04); m.stageImpact(tg.x, 3); }
      }
    },
    onEnd(a, tg, m) {
      m.focus = null; tg.fade = null;
      tg.setState('air_hit'); tg.grounded = false; tg.vy = -7; tg.vx = a.facing * 5; tg.kd = true;
    },
  };

  VA.registerCharacter({
    id: 'trigg',
    name: 'Trigg',
    title: 'O Que Nunca Parou de Tentar',
    boss: true,
    canon: {
      bio: 'Preso numa realidade própria, sem saída, sem reversão, sem fim. Trigg nunca parou de tentar — levou tempo, mas tempo é a única coisa que sobra numa jaula. Volta com o poder de apagar a possibilidade das coisas terem existido.',
      appearance: 'Não descrita no índice do romance.',
      facts: [
        'Cap. 46 — "A Prisão Fora de Tudo": uma realidade própria, sem saída.',
        'Cap. 47 — "A Rachadura": Trigg nunca parou de tentar.',
        'Cap. 48 — "Trigg": volta com o poder de apagar a possibilidade das coisas terem existido. Não funciona.',
        'Cap. 49 — "Escala": não é uma luta; é uma demonstração de que existem níveis.',
      ],
    },
    proposal: {
      style: 'Chefe pesado e lento. Golpes fortes com armadura, apagões no chão que obrigam a defender agachado, pilares de nada com aviso, jaulas que controlam o espaço e um agarrão que não pode ser defendido.',
      notes: 'Aparência (máscara lisa, coroa de estilhaços, manto escuro), golpes e a forma "Rachadura" são propostas do jogo. Origem e motivos de Trigg não são definidos aqui.',
    },
    stats: { speed: 3, power: 9, defense: 8, reach: 8, energy: 6 },
    health: 1150,
    energyGain: 1.1,
    physics: { walk: 1.8, back: 1.5, run: 4.2, backdash: 4.6, jumpV: -9.2, jumpH: 2.6, gravity: 0.55, width: 36, height: 114, crouchHeight: 74, throwRange: 58 },
    look: {
      skin: '#d8d2e6', hairStyle: 'shards', crown: '#2a2440', mask: '#e9e6f2', slit: VIOLET,
      top: '#1c1828', sleeve: '#231e33', cuff: '#3a2f5c', shirt: '#3a2f5c', collar: '#2a2440', pants: '#141018', boots: '#0e0b12', glove: '#2a2440', belt: VIOLET,
      spark: VIOLET, spark2: '#ffffff', trailColor: '#3a2f5c', fist: 1.2,
      build: { scale: 1.14, torsoW: 27, hipW: 21, armW: 8.6, legW: 10, headR: 9 },
      extras: {
        behind({ ctx, J, f, s, C, t }) {
          // manto: cai dos ombros até perto do chão e balança
          const sx = J.S[0], sy = J.S[1];
          const sway = Math.sin(t * 0.08) * 4;
          ctx.fillStyle = C('#120f1c');
          ctx.beginPath();
          ctx.moveTo(sx - f * 10 * s, sy);
          ctx.quadraticCurveTo(sx - f * 30 * s + sway, sy + 40 * s, sx - f * 24 * s + sway * 1.5, J.H[1] + 52 * s);
          ctx.lineTo(sx + f * 2 * s + sway, J.H[1] + 50 * s);
          ctx.closePath(); ctx.fill();
        },
        legs({ ctx, J, f, s, C }) {
          // saia do manto sobre as coxas
          const H = J.H;
          ctx.fillStyle = C('#1c1828'); ctx.strokeStyle = '#0b0a0d'; ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(H[0] - 12 * s, H[1] - 4);
          ctx.lineTo(H[0] + 12 * s, H[1] - 4);
          ctx.lineTo(J.KF[0] + f * 8 * s, J.KF[1] + 8 * s);
          ctx.lineTo(J.KB[0] - f * 8 * s, J.KB[1] + 8 * s);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        },
      },
    },
    introPose: 'cast_b', winPose: 'cast_a',
    quotes: {
      intro: ['Tempo é a única coisa que sobra numa jaula.', 'Eu nunca parei de tentar.'],
      win: ['Você nunca existiu. Eu só demorei para perceber.', 'A jaula era pequena. O lado de fora, não.', 'Tente lembrar de mim. Você não vai conseguir.'],
    },
    poses: {
      stance: Object.assign({}, VA.poses.stance, { lean: 2, head: -8, sF: 30, eF: 60, sB: 20, eB: 50, hF: 16, kF: 10, hB: -12, kB: 4 }),
      stance2: Object.assign({}, VA.poses.stance2, { lean: 3, head: -6, sF: 32, eF: 64, sB: 22, eB: 54, hF: 17, kF: 14, hB: -11, kB: 7 }),
    },
    moves: {
      lp: { name: 'Revés', startup: 6, hit: { dmg: 45 }, box: { x: 12, y: -96, w: 44, h: 16 } },
      hp: { name: 'Martelo do Nada', anim: ['air_h_a', 'air_h_b'], startup: 13, active: 4, recovery: 19, box: { x: 12, y: -100, w: 52, h: 60 }, hit: { dmg: 115, stun: 22, push: 7, hitstop: 10 }, armor: { f0: 3, f1: 13, hits: 1 } },
      lk: { startup: 7, hit: { dmg: 50 }, box: { x: 10, y: -66, w: 52, h: 16 } },
      hk: { name: 'Pisão', anim: ['stomp_a', 'stomp_b'], startup: 14, active: 4, recovery: 20, box: { x: 6, y: -40, w: 62, h: 40 }, hit: { dmg: 120, knock: 'knock', push: 9, hitstop: 10 }, armor: { f0: 3, f1: 14, hits: 1 },
        events: { 14: (f, m) => { FX.shake(5); FX.dust(f.x + f.facing * 40, GROUND, 8); m.stageImpact(f.x + f.facing * 40, 1); } } },
      clp: { startup: 6, hit: { dmg: 40 } },
      chk: { startup: 12, hit: { dmg: 85 } },
      air_h: { hit: { dmg: 95 } },
      throw: { hits: [{ f: 3, len: 2, grab: true, dmg: 130 }] },
      sp: { name: 'Apagar', type: 'special', anim: ['cast_a', 'stomp_b'], startup: 15, active: 1, recovery: 24, oneProj: true, charge: VIOLET, events: { 14: apagar }, cmd: 'U' },
      sp_fwd: { name: 'Inexistir', type: 'special', anim: ['grab', 'grab'], startup: 10, active: 3, recovery: 32,
        hits: [{ f: 10, len: 3, grab: true, range: 62, unblockable: true, dmg: 160 }], grabScript: inexistir, grabDur: 44, noExtend: true, cmd: '→ + U' },
      sp_down: { name: 'Pilar de Nada', type: 'special', anim: ['cast_a', 'cast_b'], startup: 16, active: 1, recovery: 20, cost: 40, oneProj: true, events: { 15: pilar }, cmd: '↓ + U (40)' },
      sp2: { name: 'Jaula', type: 'special', anim: ['cast_a', 'push_b'], startup: 14, active: 1, recovery: 18, cost: 40, cooldown: 300, events: { 13: jaula }, cmd: 'I (40)' },
      sp2_back: { name: 'Eternidade', type: 'special', keys: [[0, 'stance'], [3, 'guard'], [34, 'guard'], [44, 'stance']], startup: 3, active: 0, recovery: 41, total: 44,
        armor: { f0: 3, f1: 34, hits: 2 }, silent: true, cmd: '← + I',
        onArmor(f, att, m) { f.vars.retaliate = true; },
        events: { 34: (f) => { if (f.vars.retaliate) { f.vars.retaliate = false; f.startMove('eternity_strike'); } } } },
      eternity_strike: { name: 'Eternidade — Resposta', type: 'special', anim: ['straight_a', 'straight_b'], startup: 4, active: 4, recovery: 20, box: { x: 10, y: -100, w: 60, h: 40 },
        hit: { dmg: 95, knock: 'knock', launch: { vx: 4, vy: -5 }, color: VIOLET } },
      su: { name: 'Desfazer a Possibilidade', type: 'super', anim: ['cast_a', 'push_b'], startup: 8, active: 10, recovery: 34, cost: 300,
        cinematic: { dur: 56, zoom: 1.45, text: 'DESFAZER A POSSIBILIDADE', color: VIOLET, isSuper: true, say: 'Desfazer a possibilidade' },
        box: { x: 10, y: -104, w: 240, h: 92 }, hit: { dmg: 30, stun: 30, chip: 24, lockOnHit: DESFAZER }, cmd: 'O (3 barras)',
        drawFx(ctx, f, t) {
          if (t < 8 || t > 18) return;
          ctx.save(); ctx.fillStyle = VOIDC; ctx.globalAlpha = 0.8;
          const x0 = f.facing > 0 ? f.x + 10 : f.x - 250;
          ctx.fillRect(x0, f.y - 100, 240, 84);
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1; ctx.strokeStyle = VIOLET; ctx.lineWidth = 2; ctx.strokeRect(x0, f.y - 100, 240, 84);
          ctx.restore();
        } },
    },
    forms: {
      rachadura: {
        name: 'Rachadura', duration: Infinity, color: '#ff5a8a', announce: true,
        desc: 'Passiva: quando a vida de Trigg cai abaixo de 30%, a rachadura se abre — +12% dano, +10% velocidade até o fim do round.',
        auto: f => f.hp > 0 && f.hp < f.maxHp * 0.3 && !f.formUsed,
        mods: { damage: 1.12, speed: 1.1 }, look: { slit: '#ff5a8a', belt: '#ff5a8a' },
        aura(f) { if (f.animT % 6 === 0) FX.spawn('shard', f.x + U.rand(-16, 16), f.y - U.rand(10, 110), 0, -0.6, 30, 2.5, '#ff5a8a', { add: true }); },
      },
    },
    ai: {
      counter: 'sp2_back', tricks: ['sp2'], range: 70, aggression: 0.6, zoning: 0.3, projectile: 'sp', antiAir: 'hp', grab: 'sp_fwd', superRange: 230,
      combos: [['lp', 'hp'], ['clp', 'chk'], ['lp', 'sp'], ['lk', 'hk'], ['lp', 'su']],
      pressure: ['lp', 'sp_down', 'sp2'],
    },
    rivals: [{ id: 'v', canon: true, text: 'V o prendeu na Prisão Fora de Tudo. Trigg voltou. Não funcionou (caps. 46–49).' }],
    arcade: {
      ladder: [
        { char: 'rayan', stage: 'entre', intro: 'A rachadura se abre no Entre. Um rapaz de pele azul está no caminho.' },
        { char: 'kolt', stage: 'agencia', intro: 'Uma instalação cheia de gente que tem poderes. Combustível.' },
        { char: 'v', stage: 'cidade', boss: true, intro: 'O homem que construiu a jaula. Desta vez, Trigg vai apagar a possibilidade de ele ter existido.' },
      ],
      ending: {
        title: 'A Rachadura',
        proposal: true,
        text: [
          'Pela primeira vez, a jaula fica vazia.',
          'Trigg anda por uma avenida que deveria lembrar dele, e ninguém lembra. Nem ele mesmo tem certeza do que foi apagado.',
          'Em algum lugar, um homem de cabelo grisalho acorda numa terça-feira qualquer e derruba um copo.',
          'O copo cai. Quebra. Ninguém percebe nada. Esse é o ponto — e o horror.',
        ],
      },
    },
  });
})();
