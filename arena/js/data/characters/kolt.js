// =====================================================================
//  KOLT — personagem desbloqueável.
//  Kolt NÃO aparece no texto do romance disponível. Tudo aqui (ficha,
//  aparência, golpes, mutações) é PROPOSTA CRIATIVA, pensada para ser
//  ligada depois aos sistemas de poderes/mutações do universo conforme a
//  história for escrita. O cap. 21 ("Monstro") fala do que acontece com
//  quem nasce diferente e é encontrado cedo — Kolt foi desenhado como um
//  possível exemplo disso, sem afirmar que é.
//  Mecânica própria: MUTAÇÃO (nível 0–3) aumenta dano e dá armadura.
// =====================================================================
'use strict';

(function () {
  const BIO = '#a8ff6a';
  const mut = f => f.vars.mut || 0;

  function setMut(f, n, m) {
    n = Math.min(3, n);
    if (n <= mut(f)) return;
    f.vars.mut = n;
    f.vars.dmgMul = 1 + 0.08 * n;
    FX.burst(f.x, f.y - 55, BIO, 24, 5); FX.shake(4); Audio2.sfx('armor');
    m.announce('MUTAÇÃO ' + n, BIO, 50, f);
  }

  function drawSpike(ctx, p) {
    const k = Math.min(1, p.t / 4), fade = Math.max(0, 1 - (p.t - 12) / 8);
    ctx.save(); ctx.globalAlpha = fade;
    ctx.fillStyle = '#d9d0b8'; ctx.strokeStyle = '#0b0a0d'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const bx = p.x + 4 + i * (p.w - 8) / 2, hh = p.h * k * (i === 1 ? 1 : 0.7);
      ctx.beginPath(); ctx.moveTo(bx - 6, GROUND); ctx.lineTo(bx, GROUND - hh); ctx.lineTo(bx + 6, GROUND); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  function espinhos(f, m) {
    const xs = mut(f) >= 3 ? [80, 140] : [80];
    for (const dx of xs) {
      m.projectiles.push(VA.makeProjectile(f, {
        cx: f.x + f.facing * dx, cy: GROUND - 25, w: 34, h: 50, speed: 0, life: 22, activeFrom: 3, counts: false, clash: false,
        hit: { dmg: 85, stun: 20, bstun: 14, push: 3, chip: 10, level: 'low', knock: 'launch', launch: { vx: 1.5, vy: -8 }, color: BIO }, draw: drawSpike,
      }));
      FX.debris(f.x + f.facing * dx, GROUND, '#5d5852', 5);
    }
    Audio2.sfx('erupt'); FX.shake(3);
  }

  function agarrao(a, tg, t, m) {
    a.poseOverride = t < 16 ? 'grab' : t < 26 ? 'throw_b' : 'slam';
    if (t < 16) { tg.x = a.x + a.facing * 30; tg.y = GROUND - t * 3; tg.grounded = false; }
    else if (t < 26) { tg.x = a.x + a.facing * 10; tg.y = GROUND - 60; }
    else { tg.x = a.x + a.facing * 40; tg.y = Math.min(GROUND, tg.y + 14); }
    if (t === 28) {
      VA.Combat.scriptHit(a, tg, { dmg: 150, power: 3, color: BIO, sfx: 'boom', shake: 9 }, m);
      FX.dust(tg.x, GROUND, 14); m.stageImpact(tg.x, 2);
      tg.setState('air_hit'); tg.grounded = false; tg.vy = -4; tg.vx = a.facing * 2; tg.kd = true;
    }
  }

  const COLAPSO = {
    dur: 96,
    script(a, tg, t, m) {
      m.focus = { x: (a.x + tg.x) / 2, z: 1.3 };
      a.vars.bigArm = 1;
      tg.grounded = false; tg.vx = tg.vy = 0;
      const cyc = t % 18;
      tg.x = a.x + a.facing * 36;
      tg.y = cyc < 9 ? GROUND - 70 + cyc * 2 : GROUND - 4;
      tg.poseOverride = cyc < 9 ? 'thrown' : 'lie';
      a.poseOverride = cyc < 9 ? 'throw_b' : 'slam';
      if (cyc === 10 && t < 72) { VA.Combat.scriptHit(a, tg, { dmg: 55, power: 2, color: BIO, shake: 6 }, m); FX.dust(tg.x, GROUND, 10); m.stageImpact(tg.x, 1); }
      if (t >= 72) { a.poseOverride = t < 84 ? 'charge' : 'straight_b'; tg.y = GROUND - 40; tg.poseOverride = 'airHit'; }
      if (t === 84) { VA.Combat.scriptHit(a, tg, { dmg: 120, power: 3, color: BIO, sfx: 'boom', shake: 12 }, m); FX.flash(BIO, 0.5, 0.05); FX.burst(tg.x, tg.y - 40, BIO, 30, 6); }
    },
    onEnd(a, tg, m) {
      m.focus = null; a.vars.bigArm = 0;
      tg.setState('air_hit'); tg.grounded = false; tg.vy = -8; tg.vx = a.facing * 6; tg.kd = true;
    },
  };

  VA.registerCharacter({
    id: 'kolt',
    name: 'Kolt',
    title: 'Carne Que Não Para de Mudar',
    locked: true,
    unlockHint: 'Complete o modo Arcade com qualquer personagem.',
    canon: {
      bio: 'Kolt ainda não aparece no texto disponível do romance.',
      appearance: 'Não definida no livro.',
      facts: [],
    },
    proposal: {
      bio: 'Encontrado cedo demais, antes de aprender a se esconder. O corpo de Kolt reage à dor mudando — e cada mudança fica.',
      style: 'Agarrador resistente. Investidas com armadura, agarrão de comando e espinhos que saem do chão. Quanto mais a luta dura, mais mutações acumula: mais dano e armadura nos golpes pesados.',
      notes: 'Ficha inteira criada para o jogo. Pode ser reescrita quando o autor definir o personagem.',
    },
    stats: { speed: 4, power: 8, defense: 8, reach: 6, energy: 5 },
    health: 1100,
    physics: { walk: 2.1, back: 1.7, run: 5.0, backdash: 5.0, jumpV: -9.6, jumpH: 3.0, gravity: 0.58, width: 36, height: 104, crouchHeight: 70, throwRange: 56 },
    look: {
      skin: '#9aa88a', hairStyle: 'ridges', ridge: '#d9d0b8', eye: '#20251a', brow: '#55604a',
      top: '#5a2e2a', sleeve: '#9aa88a', shirt: null, collar: '#3f1f1c', pants: '#3b3f2e', boots: '#2a241c', glove: '#b5c79a', belt: '#2a1a14',
      spark: BIO, spark2: '#ffffff', trailColor: '#4a6a2a', fist: 1.3,
      build: { scale: 1.06, torsoW: 30, hipW: 20, armW: 9.6, legW: 10.2, headR: 8.6, lean: 8 },
      extras: {
        front({ ctx, J, f, s, C, state }) {
          // braço mutado cresce durante o supremo e com o nível de mutação
          const k = (state.vars && (state.vars.bigArm || 0)) + (state.vars ? (state.vars.mut || 0) * 0.15 : 0);
          if (k <= 0) return;
          ctx.fillStyle = C('#b5c79a'); ctx.strokeStyle = '#0b0a0d'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(J.HF[0], J.HF[1], (4 + k * 6) * s, 0, 7); ctx.fill(); ctx.stroke();
          if (state.vars && state.vars.mut >= 2) {
            ctx.fillStyle = C('#d9d0b8');
            for (let i = 0; i < 3; i++) { const p = [U.lerp(J.SF[0], J.EF[0], i / 3), U.lerp(J.SF[1], J.EF[1], i / 3)]; ctx.beginPath(); ctx.moveTo(p[0] - 2, p[1]); ctx.lineTo(p[0] - f * 3, p[1] - 6); ctx.lineTo(p[0] + 2, p[1]); ctx.fill(); }
          }
        },
      },
    },
    lookMod(f, look) {
      const n = mut(f);
      if (!n) return look;
      f._mutLook = f._mutLook || {};
      if (!f._mutLook[n]) f._mutLook[n] = Object.assign({}, look, { ridgeCount: n * 2, fist: 1.3 + n * 0.15, eyeGlow: n >= 3 ? BIO : null, skin: U.mix('#9aa88a', '#7fa860', n / 3), sleeve: U.mix('#9aa88a', '#7fa860', n / 3) });
      return f._mutLook[n];
    },
    onUpdate(f, m) {
      if (f.hp > 0 && f.hp < f.maxHp * 0.66 && mut(f) < 1) setMut(f, 1, m);
      if (f.hp > 0 && f.hp < f.maxHp * 0.33 && mut(f) < 2) setMut(f, 2, m);
      if (mut(f) >= 3 && f.animT % 5 === 0) FX.aura(f.x, f.y, 36, 100, BIO, 1);
    },
    introPose: 'charge', winPose: 'win',
    quotes: {
      intro: ['Não olha. Todo mundo olha.', 'Dói. Depois para de doer.'],
      win: ['Eu não pedi pra ser assim.', 'Fica no chão. É melhor pra você.', 'Cada vez que você me bate, eu fico mais difícil de bater.'],
    },
    moves: {
      lp: { startup: 5, hit: { dmg: 40 } },
      hp: { name: 'Garra', startup: 9, hit: { dmg: 90 }, armor: { f0: 2, f1: 9, hits: 1, cond: f => mut(f) >= 2 } },
      hk: { startup: 12, hit: { dmg: 105, knock: 'knock' }, armor: { f0: 2, f1: 12, hits: 1, cond: f => mut(f) >= 2 } },
      chk: { hit: { dmg: 78 } },
      sp: { name: 'Investida Mutante', type: 'special', anim: ['charge', 'charge'], startup: 10, active: 10, recovery: 20, box: { x: 4, y: -92, w: 40, h: 70 },
        motion: [{ f0: 6, f1: 20, vx: 7.5 }], armor: { f0: 4, f1: 16, hits: 1 }, hit: { dmg: 100, knock: 'knock', launch: { vx: 4, vy: -4 } }, cmd: 'U' },
      sp_fwd: { name: 'Agarrão de Carne', type: 'special', anim: ['grab', 'grab'], startup: 9, active: 3, recovery: 30,
        hits: [{ f: 9, len: 3, grab: true, range: 54, unblockable: true, dmg: 150 }], grabScript: agarrao, grabDur: 40, noExtend: true, cmd: '→ + U' },
      sp_down: { name: 'Espinhos', type: 'special', anim: ['stomp_a', 'stomp_b'], startup: 16, active: 1, recovery: 22, events: { 15: espinhos }, cooldown: 40, cmd: '↓ + U' },
      sp2: { name: 'Mutar', type: 'special', keys: [[0, 'stance'], [10, 'kneel'], [24, 'win'], [40, 'stance']], startup: 30, active: 0, recovery: 10, cost: 100,
        cond: f => mut(f) < 3, events: { 22: (f, m) => setMut(f, mut(f) + 1, m) }, silent: true, cmd: 'I (1 barra)',
        drawFx(ctx, f, t) { if (t % 3 === 0) FX.aura(f.x, f.y, 36, 100, BIO, 2); } },
      sp2_down: { name: 'Regeneração Instável', type: 'special', keys: [[0, 'stance'], [4, 'kneel'], [40, 'kneel'], [48, 'stance']], startup: 4, active: 0, recovery: 44, total: 48, cost: 50,
        events: Object.fromEntries([8, 12, 16, 20, 24, 28, 32, 36, 40].map(fr => [fr, (f) => { f.hp = Math.min(f.maxHp, f.hp + 10); FX.spawn('dot', f.x + U.rand(-12, 12), f.y - U.rand(20, 90), 0, -1, 20, 3, BIO, { add: true }); }])),
        silent: true, cmd: '↓ + I (50)' },
      su: { name: 'Colapso Genético', type: 'super', anim: ['charge', 'grab'], startup: 6, active: 12, recovery: 30, cost: 300,
        cinematic: { dur: 50, zoom: 1.5, text: 'COLAPSO GENÉTICO', color: BIO, isSuper: true, say: 'Colapso genético' },
        box: { x: 0, y: -100, w: 64, h: 100 }, motion: [{ f0: 6, f1: 17, vx: 8, noMul: true }], hit: { dmg: 40, stun: 30, chip: 20, lockOnHit: COLAPSO }, cmd: 'O (3 barras)' },
    },
    ai: {
      tricks: ['sp2', 'sp2_down'], range: 60, aggression: 0.7, zoning: 0.15, projectile: null, approach: 'sp', antiAir: 'hp', grab: 'sp_fwd', superRange: 120,
      combos: [['lp', 'hp', 'sp'], ['clp', 'chk'], ['lk', 'sp_down'], ['lp', 'su']],
      pressure: ['lp', 'sp_fwd', 'clp'],
    },
    rivals: [{ id: 'trigg', canon: false, text: 'Proposta: Trigg vê em Kolt combustível. Kolt vê em Trigg mais uma jaula.' }],
    arcade: {
      ladder: [
        { char: 'rayan', stage: 'agencia', intro: 'Um rapaz azul aparece do nada. Ele não quer prender Kolt — quer conversar. Kolt não sabe o que fazer com isso.' },
        { char: 'v', stage: 'cidade', intro: 'Dizem que esse homem conserta pessoas. Kolt quer saber se ele consertaria o que não está quebrado.' },
        { char: 'trigg', stage: 'prisao', boss: true, intro: 'Uma voz do lado de fora de tudo oferece liberdade. O preço é parar de mudar para sempre.' },
      ],
      ending: {
        title: 'Monstro',
        proposal: true,
        text: [
          'Kolt sai da prisão com o corpo ainda mudando.',
          'Alguém da Agência abre uma pasta preta com fotos. Fecha logo depois.',
          '— Ninguém mais vai te encontrar antes de você aprender a se esconder — diz Rayan.',
          'Kolt não sabe se aquilo é uma promessa ou um aviso. Pela primeira vez, decide que tanto faz.',
        ],
      },
    },
  });
})();
