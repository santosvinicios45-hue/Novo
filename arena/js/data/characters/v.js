// =====================================================================
//  V — protagonista.
//  CANÔNICO (romance, índice e Ato I): homem comum que acorda numa terça
//  e vê um copo parar no ar; manipula a realidade; poderes que já
//  aparecem no livro: telecinese, desfazer, deslocar, parar o tempo;
//  mais adiante: imunidade à realidade ("Nada Me Toca", cap. 27) e
//  "Legislador Universal" (cap. 33). Aparência: cabelo grisalho
//  bagunçado, jaqueta oliva, camisa verde-acinzentada, jeans escuro,
//  botas marrons, barba por fazer (arte de referência do autor).
//  PROPOSTA DO JOGO: nomes de golpes que não existem no livro, a forma
//  "Grande Demais" como estado de luta e os textos de vitória/final.
// =====================================================================
'use strict';

(function () {
  const LILAC = '#cbbcff', DEEP = '#6b4cff';

  // pedra arrancada do chão e arremessada pela telecinese
  function drawRock(ctx, p) {
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.rotate(p.t * 0.25 * p.dir);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = U.rgba(p.big ? '#ffffff' : LILAC, 0.25);
    ctx.beginPath(); ctx.arc(0, 0, p.w * 0.8, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#6d6862'; ctx.strokeStyle = '#1a1716'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    const r = p.w / 2;
    ctx.moveTo(-r, -r * 0.3); ctx.lineTo(-r * 0.4, -r); ctx.lineTo(r * 0.6, -r * 0.8); ctx.lineTo(r, 0); ctx.lineTo(r * 0.5, r * 0.8); ctx.lineTo(-r * 0.6, r * 0.7);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8a857e'; ctx.fillRect(-r * 0.3, -r * 0.5, r * 0.5, r * 0.3);
    ctx.restore();
    if (p.t % 2 === 0) FX.spawn('dot', p.x + p.w / 2 - p.dir * 8, p.y + p.h / 2 + U.rand(-5, 5), -p.dir * 0.5, 0, 12, 2, LILAC, { add: true });
  }

  function telecinese(n, speed, dmg) {
    return (f, m) => {
      for (let i = 0; i < n; i++) {
        m.projectiles.push(VA.makeProjectile(f, {
          cx: f.x + f.facing * 34, cy: f.y - 66 + i * 18, w: 22, h: 20, speed: speed - i * 0.8, life: 140, big: n > 1,
          hit: { dmg, stun: 18, bstun: 14, push: 5, chip: 9, color: LILAC }, draw: drawRock,
        }));
      }
      Audio2.sfx('shot');
      FX.debris(f.x + f.facing * 30, GROUND, '#6d6862', 6, f.facing);
      FX.dust(f.x + f.facing * 30, GROUND, 5);
    };
  }

  // teleporte para as costas do adversário (ou à frente, se ele estiver no canto)
  function deslocar(f, m) {
    const o = f.opp, b = m.bounds();
    const side = Math.sign(o.x - f.x) || f.facing;
    let nx = o.x + side * 46;
    if (nx < b.l + 4 || nx > b.r - 4) nx = o.x - side * 50;
    FX.burst(f.x, f.y - 50, LILAC, 14, 3); FX.spawn('ring', f.x, f.y - 50, 0, 0, 14, 40, LILAC, { add: true });
    f.x = U.clamp(nx, b.l, b.r);
    f.facing = o.x > f.x ? 1 : -1;
    FX.burst(f.x, f.y - 50, '#ffffff', 14, 3); FX.spawn('ring', f.x, f.y - 50, 0, 0, 14, 40, LILAC, { add: true });
    Audio2.sfx('teleport');
  }

  // Desfazer: o golpe que acertaria "não aconteceu"; V volta meio segundo e responde
  function desfazerCounter(v, att, match, src) {
    match.timeStop = 24;
    FX.flash('#ffffff', 0.5, 0.05);
    match.announce('DESFEITO', LILAC, 50, v);
    v.invuln = 30;
    v.addEnergy(20);
    if (src !== att) return; // projétil apenas some
    v.startLock(att, 30, (a, tg, t, m) => {
      if (t === 0) { a.x = tg.x + (a.x < tg.x ? -40 : 40); a.facing = tg.x > a.x ? 1 : -1; tg.poseOverride = 'hit'; }
      a.poseOverride = t < 8 ? 'counter' : t < 18 ? 'straight_b' : 'stance';
      if (t === 9) {
        VA.Combat.scriptHit(a, tg, { dmg: 120, power: 3, color: LILAC, sfx: 'hitS', shake: 6 }, m);
        tg.setState('air_hit'); tg.grounded = false; tg.vy = -6; tg.vx = a.facing * 4.5; tg.kd = true;
      }
    });
  }

  // Legislador Universal — o tempo para e V reescreve a regra da luta
  function legislador(power) {
    return {
      dur: 104,
      script(a, tg, t, m) {
        m.timeStop = 14;
        m.focus = { x: tg.x, z: 1.3 };
        tg.y = U.lerp(tg.y, GROUND - 34, 0.2); tg.grounded = false; tg.vx = tg.vy = 0;
        tg.poseOverride = 'airHit';
        const hitsAt = [6, 20, 34, 48, 62];
        const k = hitsAt.indexOf(t);
        if (t < 70 && (t % 14 === 0)) {
          // V some e reaparece em outro ângulo
          const side = (t / 14) % 2 ? 1 : -1;
          FX.burst(a.x, a.y - 50, LILAC, 8, 3);
          a.x = tg.x + side * 40; a.facing = -side; a.y = t % 28 ? GROUND - 30 : GROUND;
          a.grounded = a.y >= GROUND;
          FX.spawn('ring', a.x, a.y - 50, 0, 0, 12, 36, '#ffffff', { add: true });
          Audio2.sfx('teleport');
        }
        a.poseOverride = ['dash_b', 'hk_b', 'straight_b', 'spin_b', 'upper_b'][Math.floor(t / 14) % 5];
        if (k >= 0) VA.Combat.scriptHit(a, tg, { dmg: 45 * power, power: 2, color: LILAC, dir: a.facing, shake: 4 }, m);
        if (t === 70) { a.x = tg.x - a.facing * 70; a.y = GROUND; a.grounded = true; a.poseOverride = 'cast_a'; Audio2.sfx('charge'); }
        if (t > 70) {
          a.poseOverride = t < 88 ? 'cast_a' : 'push_b';
          FX.charge(tg.x, tg.y - 50, '#ffffff', 3);
          if (t % 3 === 0) FX.spawn('ring', tg.x, tg.y - 50, 0, 0, 16, 60 - (t - 70), LILAC, { add: true });
        }
        if (t === 90) {
          VA.Combat.scriptHit(a, tg, { dmg: 120 * power, power: 3, color: '#ffffff', sfx: 'boom', shake: 12 }, m);
          FX.flash('#ffffff', 0.9, 0.04); FX.burst(tg.x, tg.y - 50, LILAC, 40, 7); FX.debris(tg.x, GROUND, '#5d5852', 14);
          m.stageImpact(tg.x, 3);
          m.announce('A REGRA MUDOU', LILAC, 60, a);
        }
      },
      onEnd(a, tg, m) {
        m.focus = null; a.y = GROUND; a.grounded = true;
        tg.setState('air_hit'); tg.grounded = false; tg.vy = -8; tg.vx = a.facing * 5; tg.kd = true;
      },
    };
  }

  const LEG1 = legislador(1), LEG2 = legislador(1.25);

  VA.registerCharacter({
    id: 'v',
    name: 'V',
    title: 'O Homem Que Acordou Grande Demais',
    canon: {
      bio: 'Um homem comum que, numa terça-feira qualquer, vê um copo parar no ar e descobre que a realidade obedece a ele. Aprende testando, erra — e carrega sozinho as consequências do que faz.',
      appearance: 'Cabelo grisalho bagunçado, barba por fazer, olhar cansado. Jaqueta oliva, camisa verde-acinzentada, jeans escuro e botas marrons.',
      facts: [
        'Frase: "Eu prefiro carregar a culpa de ter feito, do que a culpa de não ter feito nada."',
        'Poderes que aparecem no livro: telecinese, desfazer, deslocar, criar, percepção e parar o tempo.',
        'Cap. 27 — "Nada Me Toca": descobre que é imune à realidade.',
        'Cap. 33 — "Legislador Universal": reescreve a física para que ninguém morra no vácuo.',
        'Cap. 10 — poder que se revela por necessidade emocional, não por treino.',
      ],
    },
    proposal: {
      style: 'Manipulador da realidade que luta como alguém que nunca treinou: golpes diretos e rápidos, mas cada poder muda as regras do confronto. Bom em qualquer distância, punido quando desperdiça energia.',
      notes: 'Nomes dos golpes básicos, a forma de luta "Grande Demais" e as falas de vitória são criações do jogo.',
    },
    stats: { speed: 7, power: 7, defense: 6, reach: 6, energy: 8 },
    health: 1000,
    physics: { walk: 2.5, back: 2.0, run: 5.4, backdash: 5.6, jumpV: -10, jumpH: 3.2, gravity: 0.55, width: 30, height: 100, crouchHeight: 66, throwRange: 52 },
    look: {
      skin: '#d6a684', hairStyle: 'messy', hair: '#66625d', hair2: '#938e87', stubble: 'rgba(80,62,52,0.3)', brow: '#352e2a', eye: '#251c18',
      top: '#585340', sleeve: '#5f5a45', cuff: '#4a4634', shirt: '#4f5848', collar: '#706a53', pants: '#38404f', boots: '#5a4130', belt: '#2a2522',
      spark: LILAC, spark2: '#ffffff', trailColor: '#a99cff',
      build: { scale: 0.98, torsoW: 23, hipW: 17, armW: 7.2, legW: 8.6, headR: 9 },
    },
    introPose: 'pockets', winPose: 'pockets',
    quotes: {
      intro: ['Eu não queria estar aqui.', 'A gente pode resolver isso de outro jeito.'],
      win: ['Eu prefiro carregar a culpa de ter feito, do que a culpa de não ter feito nada.', 'Desculpa. Você vai acordar bem.', 'Eu sei que é errado. Eu fiz mesmo assim.'],
    },
    quoteCanon: ['Eu prefiro carregar a culpa de ter feito, do que a culpa de não ter feito nada.'],

    moves: {
      sp: { name: 'Telecinese', type: 'special', anim: ['cast_a', 'push_b'], startup: 14, active: 1, recovery: 22, oneProj: true, charge: LILAC,
        events: { 13: telecinese(1, 6.5, 70) }, cmd: 'U',
        formVariant: { grande: { name: 'Telecinese (Grande Demais)', events: { 13: telecinese(2, 8.5, 55) }, startup: 12, recovery: 18 } } },
      sp_fwd: { name: 'Meio Segundo', type: 'special', anim: ['straight_a', 'dash_b'], startup: 7, active: 10, recovery: 16, trail: '#a99cff',
        box: { x: 4, y: -84, w: 40, h: 22 }, motion: [{ f0: 4, f1: 16, vx: 9 }], hit: { dmg: 85, stun: 22, bstun: 16, push: 8 }, safe: false, cmd: '→ + U',
        formVariant: { grande: { name: 'Meio Segundo (Grande Demais)', invuln: [0, 8], hit: { dmg: 100, knock: 'knock', launch: { vx: 3, vy: -6 } } } } },
      sp_down: { name: 'Ruptura', type: 'special', anim: ['upper_a', 'upper_b'], startup: 4, active: 7, recovery: 28, invuln: [0, 7],
        hits: [{ f: 4, len: 3, box: { x: 4, y: -96, w: 34, h: 70 }, dmg: 60, stun: 20 }, { f: 7, len: 4, box: { x: 0, y: -128, w: 36, h: 80 }, dmg: 50, knock: 'launch', launch: { vx: 2, vy: -9 } }],
        motion: [{ f0: 4, f1: 9, vy: -7.5, vx: 1.6 }], cancel: ['super'], cmd: '↓ + U',
        events: { 4: (f) => { FX.spawn('ring', f.x, GROUND, 0, 0, 16, 50, LILAC, { add: true }); for (let i = 0; i < 6; i++) FX.spawn('shard', f.x + U.rand(-20, 20), GROUND - 2, U.rand(-2, 2), U.rand(-6, -2), 40, 3, '#5d5852', { g: 0.3 }); } },
        formVariant: { grande: { name: 'Ruptura (Grande Demais)', hits: [{ f: 4, len: 3, box: { x: 4, y: -96, w: 38, h: 70 }, dmg: 70, stun: 20 }, { f: 7, len: 4, box: { x: 0, y: -140, w: 44, h: 92 }, dmg: 70, knock: 'launch', launch: { vx: 2, vy: -10 } }] } } },
      sp2: { name: 'Deslocar', type: 'special', anim: ['crouch', 'stance'], startup: 6, active: 0, recovery: 16, cost: 30, invuln: [0, 15], projInvuln: [0, 15],
        hideFrames: [6, 12], events: { 9: deslocar }, freeCancel: [14, 21], silent: true, cmd: 'I',
        formVariant: { grande: { name: 'Deslocar (Grande Demais)', recovery: 10, freeCancel: [12, 15] } } },
      sp2_back: { name: 'Desfazer', type: 'special', keys: [[0, 'stance'], [3, 'counter'], [24, 'counter'], [40, 'stance']], startup: 3, active: 0, recovery: 37, total: 40, cost: 50,
        counter: { f0: 3, f1: 24, proj: true, on: desfazerCounter }, silent: true, cmd: '← + I',
        drawFx(ctx, f, t) { if (t < 3 || t > 24) return; ctx.strokeStyle = U.rgba(LILAC, 0.5 + 0.3 * Math.sin(t)); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(f.x, f.y - 52, 34 + Math.sin(t * 0.5) * 2, Math.PI * 0.6, Math.PI * 2.2); ctx.stroke(); } },
      sp2_down: { name: 'Nada Me Toca', type: 'special', keys: [[0, 'stance'], [2, 'guard'], [28, 'guard'], [40, 'stance']], startup: 2, active: 0, recovery: 38, total: 40, cost: 50,
        parry: { f0: 2, f1: 28, proj: true, energy: 25, color: '#e9e4ff', on: (v) => { v.invuln = Math.max(v.invuln, 10); } }, silent: true, cmd: '↓ + I',
        drawFx(ctx, f, t) {
          if (t < 2 || t > 28) return;
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const r = 46 + Math.sin(t * 0.6) * 2;
          const g = ctx.createRadialGradient(f.x, f.y - 52, r * 0.6, f.x, f.y - 52, r);
          g.addColorStop(0, 'rgba(200,190,255,0)'); g.addColorStop(1, 'rgba(220,210,255,0.35)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y - 52, r, 0, 7); ctx.fill();
          ctx.restore();
        } },
      su: { name: 'Legislador Universal', type: 'super', anim: ['cast_a', 'dash_b'], startup: 6, active: 14, recovery: 30, cost: 300, formCost: { grande: 100 },
        cinematic: { dur: 50, zoom: 1.6, text: 'LEGISLADOR UNIVERSAL', color: LILAC, isSuper: true, say: 'Legislador universal' },
        box: { x: 0, y: -94, w: 52, h: 84 }, motion: [{ f0: 6, f1: 19, vx: 11, noMul: true }], trail: '#ffffff', cmd: 'O (3 barras)',
        hit: { dmg: 40, stun: 30, bstun: 18, push: 6, chip: 20, spark: 'special', lockOnHit: LEG1 },
        formVariant: { grande: { name: 'Legislador Universal — Grande Demais', cinematic: { dur: 50, zoom: 1.7, text: 'LEGISLADOR UNIVERSAL', color: '#ffffff', isSuper: true, say: 'Legislador universal' }, hit: { dmg: 50, lockOnHit: LEG2 } } } },
      transform: { name: 'Grande Demais', type: 'transform', anim: ['cast_a', 'win'], startup: 2, active: 0, recovery: 14, cost: 200, cmd: '↓ + O (vida ≤ 50%, 2 barras)',
        cond: f => !f.form && !f.formUsed && f.hp <= f.maxHp * 0.5,
        cinematic: { dur: 64, zoom: 1.45, text: 'GRANDE DEMAIS', color: '#ffffff', sfx: 'transform', say: 'Grande demais',
          onTick(o, m, t) { FX.aura(o.x, o.y, 40, 100, t % 2 ? DEEP : '#ffffff', 2); if (t === 40) { o.enterForm('grande'); FX.flash('#ffffff', 0.8, 0.04); FX.burst(o.x, o.y - 50, '#ffffff', 40, 6); FX.shake(8); } } } },
    },

    forms: {
      grande: {
        name: 'Grande Demais', duration: 720, color: '#ffffff',
        desc: 'Ativada quando a vida cai para 50% ou menos (o poder que aparece por necessidade, não por treino). Dura 12 s: +15% velocidade, +18% dano, recebe 10% menos dano, especiais aprimorados e Supremo por 1 barra. Ganha metade da energia.',
        mods: { speed: 1.15, damage: 1.18, defense: 0.9 }, energyMul: 0.5, trail: '#8f7bff',
        look: { hair: '#eeeaff', hair2: '#ffffff', eyeGlow: '#ffffff', top: '#46412f', sleeve: '#4c4733', spark: '#ffffff', spark2: LILAC },
        aura(f) { FX.aura(f.x, f.y, 34, 96, f.animT % 4 ? DEEP : '#e9e4ff', 1); },
      },
    },

    ai: {
      counter: 'sp2_back', tricks: ['sp2'], range: 75, aggression: 0.55, zoning: 0.35, projectile: 'sp', approach: 'sp_fwd', antiAir: 'sp_down', projAnswer: 'sp2_down', superRange: 150,
      combos: [['lp', 'hp', 'sp_fwd'], ['clp', 'clp', 'chk'], ['lk', 'hp', 'sp_down'], ['hp', 'sp'], ['lp', 'lk', 'sp_fwd'], ['lp', 'hp', 'su']],
      pressure: ['lp', 'clp', 'lk'],
    },
    rivals: [
      { id: 'trigg', canon: true, text: 'Trigg nunca parou de tentar sair da prisão que V construiu (caps. 46–48).' },
      { id: 'rayan', canon: true, text: 'Rayan é quem pergunta "por que você fez sozinho?" — a consciência que V não consegue ignorar.' },
    ],
    arcade: {
      ladder: [
        { char: 'rayan', stage: 'agencia', intro: 'Agência. Um rapaz de pele azul aparece do nada no refeitório: "Ah, então é você que some." Ele quer ver do que você é capaz.' },
        { char: 'kolt', stage: 'cidade', intro: 'A cidade está desabando quarteirão por quarteirão. No meio do entulho, alguém que mudou demais.' },
        { char: 'v', stage: 'entre', intro: 'O Entre. Há uma silhueta ao longe. Ela tem o seu rosto — e não estava ali da última vez.', name: 'V — Reflexo' },
        { char: 'trigg', stage: 'prisao', boss: true, intro: 'A Prisão Fora de Tudo. Trigg nunca parou de tentar. Levou tempo — mas tempo é a única coisa que sobra numa jaula.' },
      ],
      ending: {
        title: 'Escala',
        proposal: true,
        text: [
          'Trigg tentou apagar a possibilidade de V ter existido. Não funcionou.',
          'V não comemora. Ele nunca comemora. Fica um tempo parado no lugar que não é lugar nenhum, olhando a rachadura se fechar.',
          'Em casa, a Van liga o rádio sozinha. Toca uma música que ele não ouvia desde 2009.',
          'Alguém bate na porta. V sabe quem é antes de abrir.',
        ],
      },
    },
  });
})();
