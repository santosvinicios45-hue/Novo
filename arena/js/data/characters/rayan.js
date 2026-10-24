// =====================================================================
//  RAYAN / ECLIPSE
//  CANÔNICO (índice do romance): rapaz de pele azul que aparece do nada
//  no refeitório da Agência (cap. 19 "Eclipse") e diz "Ah, então é você
//  que some."; leva V para O Entre, a dimensão intermediária (cap. 20);
//  é quem questiona V (caps. 24, 31, 36) e bate à porta na última cena.
//  PROPOSTA DO JOGO: todo o estilo de luta. Como as habilidades dele não
//  estão definidas no livro, o kit explora o conceito de "Eclipse" e de
//  atravessar O Entre: teleportes, fases intangíveis e sombras.
// =====================================================================
'use strict';

(function () {
  const GOLD = '#ffd36b', VOID = '#120c22', BLUE = '#7ab8ff';

  function drawOrb(ctx, p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, r = p.w / 2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = U.rgba(GOLD, 0.18 - i * 0.04);
      ctx.beginPath(); ctx.arc(cx, cy, r + 5 + i * 4 + Math.sin(p.t * 0.3 + i) * 1.5, 0, 7); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = VOID; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r + 1, 0, 7); ctx.stroke();
    ctx.restore();
    if (p.t % 3 === 0) FX.spawn('dot', cx + U.rand(-r, r), cy + U.rand(-r, r), -p.dir * 0.3, U.rand(-0.4, 0.4), 18, 2, GOLD, { add: true });
  }

  function orb(f, m) {
    m.projectiles.push(VA.makeProjectile(f, {
      cx: f.x + f.facing * 34, cy: f.y - 70, w: 22, h: 22, speed: 3.2, life: 130, hits: 2, rehit: 14,
      hit: { dmg: 40, stun: 16, bstun: 12, push: 3, chip: 5, color: GOLD }, draw: drawOrb,
    }));
    Audio2.sfx('shot');
  }

  function passo(f, m) {
    const o = f.opp, b = m.bounds();
    const side = Math.sign(o.x - f.x) || f.facing;
    let nx = o.x + side * 44;
    if (nx < b.l + 4 || nx > b.r - 4) nx = o.x - side * 48;
    FX.burst(f.x, f.y - 50, GOLD, 10, 3); FX.spawn('ring', f.x, f.y - 50, 0, 0, 14, 40, '#2a1d4a');
    f.x = U.clamp(nx, b.l, b.r);
    if (!f.grounded) { f.y = Math.min(f.y, o.y - 70); f.vy = -2; f.vx = 0; }
    f.facing = o.x > f.x ? 1 : -1;
    FX.burst(f.x, f.y - 50, GOLD, 10, 3);
    Audio2.sfx('teleport');
  }

  function drawShadow(ctx, p, m) {
    const f = p.owner, o = m.fighters[1 - f.side];
    const a = p.t < p.activeFrom ? p.t / p.activeFrom * 0.6 : Math.max(0, 0.8 - (p.t - p.activeFrom) / 20);
    VA.Rig.draw(ctx, { x: p.x + p.w / 2, y: GROUND, facing: p.dir, pose: VA.poses[p.t < p.activeFrom ? 'straight_a' : 'straight_b'], look: f.def.look, build: f.build || Object.assign({}, VA.Rig.BUILD, f.def.look.build), mono: '#1a1030', alpha: a });
    if (p.t === p.activeFrom - 1) FX.burst(p.x + p.w / 2, p.y + p.h / 2, GOLD, 8, 2);
  }

  function sombra(f, m) {
    const o = f.opp;
    const dir = o.x > f.x ? -1 : 1;   // a sombra surge atrás do adversário e golpeia na direção de Rayan
    const x = o.x - dir * 40;
    m.projectiles.push(VA.makeProjectile(f, {
      cx: x + dir * 12, cy: GROUND - 60, w: 40, h: 60, dir, speed: 0, life: 40, activeFrom: 22, counts: false, clash: false,
      hit: { dmg: 70, stun: 20, bstun: 14, push: 6, chip: 6, knock: 'knock', launch: { vx: 3, vy: -5 }, color: GOLD }, draw: drawShadow,
    }));
    Audio2.sfx('teleport');
  }

  const ECLIPSE = {
    dur: 112,
    script(a, tg, t, m) {
      m.darkT = 30;
      m.entreFx = 30;
      m.focus = { x: tg.x, z: 1.35 };
      tg.grounded = false; tg.vx = tg.vy = 0; tg.y = U.lerp(tg.y, GROUND - 40, 0.15); tg.poseOverride = 'airHit';
      if (t < 84 && t % 12 === 0) {
        const ang = t / 12 * 2.1;
        FX.burst(a.x, a.y - 50, GOLD, 6, 2);
        a.x = tg.x + Math.cos(ang) * 46; a.y = GROUND - 20 - Math.abs(Math.sin(ang)) * 40; a.facing = tg.x > a.x ? 1 : -1;
        Audio2.sfx('teleport');
      }
      a.poseOverride = ['spin_b', 'straight_b', 'hk_b', 'air_h_b', 'dash_b', 'upper_b', 'lk_b'][Math.floor(t / 12) % 7];
      if (t < 84 && t % 12 === 6) VA.Combat.scriptHit(a, tg, { dmg: 40, power: 2, color: GOLD, dir: a.facing, shake: 3 }, m);
      if (t === 84) { a.x = tg.x - a.facing * 60; a.y = GROUND - 60; a.poseOverride = 'cast_a'; }
      if (t > 84) { a.poseOverride = 'cast_a'; FX.charge(tg.x, tg.y - 50, GOLD, 3); }
      if (t === 100) {
        VA.Combat.scriptHit(a, tg, { dmg: 110, power: 3, color: GOLD, sfx: 'boom', shake: 10 }, m);
        FX.flash('#000000', 0.9, 0.03); FX.burst(tg.x, tg.y - 50, GOLD, 40, 7);
        m.stageImpact(tg.x, 2);
      }
    },
    onEnd(a, tg, m) {
      m.focus = null; a.y = GROUND; a.grounded = true; a.x = U.clamp(a.x, m.bounds().l, m.bounds().r);
      tg.setState('air_hit'); tg.grounded = false; tg.vy = -8; tg.vx = a.facing * 5; tg.kd = true;
    },
  };

  VA.registerCharacter({
    id: 'rayan',
    name: 'Rayan',
    alias: 'Eclipse',
    title: 'Ah, então é você que some',
    canon: {
      bio: 'Um rapaz de pele azul que aparece do nada no meio do refeitório da Agência e olha para V: "Ah, então é você que some." É ele quem leva V para O Entre — e quem faz as perguntas que V não quer ouvir.',
      appearance: 'Pele azul. (No jogo de aventura, usa moletom escuro com capuz, olhos dourados e tênis claros.)',
      facts: [
        'Cap. 19 — "Eclipse": aparece do nada no refeitório da Agência.',
        'Cap. 20 — "O Entre": leva V para a dimensão intermediária.',
        'Cap. 24 — "Você fez uma coisa boa. Eu só quero entender por que você fez sozinho."',
        'Cap. 31 — "Você não salvou ele. Você matou ele e deixou o corpo andando."',
        'Cap. 50 — Rayan bate. V abre.',
      ],
    },
    proposal: {
      style: 'Mobilidade pura. Some e reaparece pelo Entre, atravessa golpes em fase, prende o adversário entre uma sombra e um orbe de eclipse. Pouca vida, muito controle de espaço.',
      notes: 'As habilidades de combate de Rayan não estão definidas no livro: todo o kit é uma proposta criativa sobre o conceito de Eclipse.',
    },
    stats: { speed: 9, power: 5, defense: 4, reach: 7, energy: 6 },
    health: 920,
    physics: { walk: 2.9, back: 2.4, run: 6.0, backdash: 6.2, jumpV: -10.8, jumpH: 3.5, gravity: 0.55, width: 28, height: 96, crouchHeight: 62, throwRange: 50 },
    look: {
      skin: '#5f8fd6', hairStyle: 'hood', hood: '#2c3347', eye: '#f2d36b', brow: '#24304d',
      top: '#3e4761', sleeve: '#353d55', cuff: '#2c3347', pants: '#1f1f22', boots: '#d9d9d9', belt: '#1a1d28',
      spark: GOLD, spark2: '#ffffff', trailColor: '#2a1d4a',
      build: { scale: 0.95, torsoW: 20, hipW: 15, armW: 6.6, legW: 7.6, headR: 8.6 },
    },
    introPose: 'stance', winPose: 'win',
    quotes: {
      intro: ['Ah, então é você.', 'Vamos dar uma volta pelo Entre?'],
      win: ['Você fez uma coisa boa. Eu só quero entender por que você fez sozinho.', 'Some de novo. Eu te acho.', 'Tem uma silhueta lá no fundo. Ela não estava ali da última vez.'],
    },
    quoteCanon: ['Você fez uma coisa boa. Eu só quero entender por que você fez sozinho.'],
    moves: {
      lp: { hit: { dmg: 30 }, startup: 3 },
      lk: { box: { x: 10, y: -58, w: 54, h: 14 }, hit: { dmg: 38 } },
      hp: { name: 'Palma do Entre', anim: ['push_a', 'push_b'], startup: 7, hit: { dmg: 72, color: GOLD } },
      hk: { name: 'Giro Penumbra', anim: ['hk_a', 'spin_b'], startup: 10, hit: { dmg: 85 } },
      sp: { name: 'Orbe Eclipse', type: 'special', anim: ['cast_a', 'push_b'], startup: 12, active: 1, recovery: 22, oneProj: true, charge: GOLD, events: { 11: orb }, cmd: 'U' },
      sp_fwd: { name: 'Lâmina Penumbra', type: 'special', keys: [[0, 'crouch'], [6, 'slide'], [22, 'slide'], [36, 'crouch']], startup: 6, active: 14, recovery: 18, hurtLow: 40,
        box: { x: 0, y: -26, w: 50, h: 24 }, motion: [{ f0: 3, f1: 20, vx: 7 }], hit: { dmg: 75, level: 'low', knock: 'sweep' }, trail: '#2a1d4a', cmd: '→ + U' },
      sp_down: { name: 'Coroa Solar', type: 'special', anim: ['upper_a', 'upper_b'], startup: 3, active: 9, recovery: 26, invuln: [0, 6],
        hits: [{ f: 3, len: 9, box: { x: -20, y: -140, w: 64, h: 100 }, dmg: 95, knock: 'launch', launch: { vx: 2, vy: -9 } }],
        motion: [{ f0: 3, f1: 8, vy: -8.5, vx: 1 }], cmd: '↓ + U',
        drawFx(ctx, f, t) { if (t < 3 || t > 12) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = U.rgba(GOLD, 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(f.x, f.y - 70, 40, Math.PI * (f.facing > 0 ? 1.1 : 0.9) - 1, Math.PI * 1.5 + (t - 3) * 0.2); ctx.stroke(); ctx.restore(); } },
      sp2: { name: 'Passo pelo Entre', type: 'special', anim: ['crouch', 'float'], startup: 5, active: 0, recovery: 14, cost: 25, airOk: true, invuln: [0, 14], projInvuln: [0, 14],
        hideFrames: [5, 11], events: { 8: passo }, freeCancel: [12, 18], silent: true, cmd: 'I (também no ar)' },
      sp2_back: { name: 'Fase', type: 'special', anim: ['float', 'float'], startup: 2, active: 22, recovery: 12, cost: 25, invuln: [2, 24], projInvuln: [2, 24], noPush: true,
        motion: [{ f0: 2, f1: 22, vx: 4.2 }], silent: true, cmd: '← + I',
        onStart: f => { f.fade = 0.4; }, onEnd: f => { f.fade = null; }, onInterrupted: f => { f.fade = null; },
        events: { 24: f => { f.fade = null; } } },
      sp2_down: { name: 'Sombra Projetada', type: 'special', anim: ['cast_a', 'cast_b'], startup: 10, active: 1, recovery: 16, cost: 40, events: { 10: sombra }, cooldown: 60, cmd: '↓ + I' },
      su: { name: 'Eclipse Total', type: 'super', anim: ['cast_a', 'push_b'], startup: 6, active: 8, recovery: 30, cost: 300,
        cinematic: { dur: 50, zoom: 1.55, text: 'ECLIPSE TOTAL', color: GOLD, isSuper: true, say: 'Eclipse total' },
        box: { x: 0, y: -110, w: 130, h: 110 }, hit: { dmg: 30, stun: 30, chip: 20, lockOnHit: ECLIPSE }, cmd: 'O (3 barras)',
        drawFx(ctx, f, t) { if (t < 6 || t > 14) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = U.rgba(GOLD, 0.25); ctx.beginPath(); ctx.ellipse(f.x + f.facing * 65, f.y - 55, 70, 55, 0, 0, 7); ctx.fill(); ctx.restore(); } },
    },
    ai: {
      tricks: ['sp2', 'sp2_down'], range: 90, aggression: 0.5, zoning: 0.45, projectile: 'sp', approach: 'sp_fwd', antiAir: 'sp_down', projAnswer: 'sp2_back', superRange: 130,
      combos: [['lp', 'lk', 'sp_fwd'], ['clp', 'chk'], ['hp', 'sp_down'], ['lp', 'hp', 'sp'], ['lk', 'hk'], ['lp', 'hp', 'su']],
      pressure: ['lk', 'clp', 'sp2_down'],
    },
    rivals: [{ id: 'v', canon: true, text: '"Se eu virar um monstro, você vai embora?" — a resposta define os próximos quarenta e cinco anos (cap. 25).' }],
    arcade: {
      ladder: [
        { char: 'kolt', stage: 'cidade', intro: 'Alguém está caçando gente diferente. Rayan chega antes dos caçadores.' },
        { char: 'trigg', stage: 'prisao', intro: 'Uma rachadura no lado de fora de tudo. Algo lá dentro está olhando de volta.' },
        { char: 'v', stage: 'agencia', boss: true, intro: 'V reescreveu bilhões de mentes numa noite. Sozinho. Rayan quer entender por quê — nem que precise derrubá-lo para ele ouvir.' },
      ],
      ending: {
        title: 'Rayan Pergunta',
        proposal: true,
        text: [
          'V está sentado no chão da Agência, rindo daquele jeito horroroso de quem não sabe se vai chorar.',
          'Rayan senta do lado. Não fala nada por um tempo.',
          '— Você fez uma coisa boa — ele diz, por fim. — Eu só quero entender por que você fez sozinho.',
          'V não responde. Mas também não some.',
        ],
      },
    },
  });
})();
