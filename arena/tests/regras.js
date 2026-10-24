// Testes automáticos das regras de combate.
// Uso: npm i -D playwright && npx playwright install chromium && node arena/tests/regras.js
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message + '\n' + e.stack));
  await p.goto(URL);
  await p.waitForTimeout(400);
  const out = await p.evaluate(() => {
    const R = [];
    let m;
    const ok = (name, cond, info) => R.push((cond ? 'PASS ' : 'FAIL ') + name + (info !== undefined ? '  [' + JSON.stringify(info) + ']' : ''));
    function setup(a = 'v', c = 'v', ax = 450, cx = 500) {
      VA.Game.launch({ mode: 'versus', p1: { char: a }, p2: { char: c }, stage: 'cidade' });
      m = VA.match;
      for (let i = 0; i < 200 && m.phase !== 'fight'; i++) { VA.Input.update(); m.step(); }
      for (const f of m.fighters) { f.ctrl.ai = { held: {}, taps: {} }; }
      m.fighters[0].x = ax; m.fighters[1].x = cx;
      step(2);
      return m.fighters;
    }
    function step(n, fn) { for (let i = 0; i < n; i++) { if (fn) fn(i); VA.Input.update(); m.step(); } }
    const hold = (s, o) => { m.fighters[s].ctrl.ai.held = o; };
    const tap = (s, btn) => { m.fighters[s].ctrl.ai.taps[btn] = true; };
    let A, B, hp;

    // 1. jab fora de alcance não causa dano
    [A, B] = setup('v', 'v', 300, 520); hp = B.hp; tap(0, 'lp'); step(30);
    ok('soco fora de alcance não acerta', B.hp === hp, B.hp);
    // 2. jab no alcance causa dano uma única vez
    [A, B] = setup('v', 'v', 450, 495); hp = B.hp; tap(0, 'lp'); step(30);
    ok('soco acerta uma vez (35)', hp - B.hp === 35, hp - B.hp);
    // 3. defesa alta bloqueia golpe médio
    [A, B] = setup('v', 'v', 450, 495); hold(1, { block: true }); step(2); hp = B.hp; tap(0, 'hp'); step(30);
    ok('defesa bloqueia soco pesado', B.hp === hp && B.stats.blocks === 1, { d: hp - B.hp, blocks: B.stats.blocks });
    // 4. golpe baixo passa pela defesa em pé
    [A, B] = setup('v', 'v', 450, 495); hold(1, { block: true }); step(2); hp = B.hp; hold(0, { down: true }); step(2); tap(0, 'lp'); step(30);
    ok('golpe baixo vence defesa em pé', B.hp < hp, hp - B.hp);
    // 5. golpe baixo é bloqueado agachado
    [A, B] = setup('v', 'v', 450, 495); hold(1, { block: true, down: true }); step(3); hp = B.hp; hold(0, { down: true }); step(2); tap(0, 'lp'); step(30);
    ok('defesa baixa bloqueia golpe baixo', B.hp === hp, hp - B.hp);
    // 6. especial bloqueado causa dano de raspão, sem nocaute
    [A, B] = setup('v', 'v', 450, 500); hold(1, { block: true }); step(2); hp = B.hp; hold(0, { right: true }); tap(0, 'sp'); step(2); hold(0, {}); step(40);
    ok('especial bloqueado causa dano de raspão', B.hp < hp && hp - B.hp < 20, hp - B.hp);
    // 7. agarrão funciona em quem está defendendo
    [A, B] = setup('v', 'v', 450, 490); hold(1, { block: true }); step(3); hp = B.hp; hold(0, { block: true }); tap(0, 'lp'); step(3); hold(0, {}); step(40);
    ok('agarrão vence a defesa', hp - B.hp >= 100, hp - B.hp);
    // 8. escape de agarrão
    [A, B] = setup('v', 'v', 450, 490); hp = B.hp; hold(0, { block: true }); tap(0, 'lp'); hold(1, { block: true }); step(1, () => tap(1, 'lp')); hold(0, {}); step(40);
    ok('escape de agarrão (L+J)', B.hp === hp, hp - B.hp);
    // 9. Deslocar custa 30 e troca de lado
    [A, B] = setup('v', 'v', 400, 500); A.energy = 100; tap(0, 'sp2'); step(30);
    ok('Deslocar custa 30 de energia', A.energy === 70, A.energy);
    ok('Deslocar aparece do outro lado', A.x > B.x, { ax: Math.round(A.x), bx: Math.round(B.x) });
    // 10. sem energia, Deslocar não sai
    [A, B] = setup('v', 'v', 400, 500); A.energy = 10; tap(0, 'sp2'); step(30);
    ok('sem energia não usa Deslocar', A.x < B.x && A.energy === 10, A.energy);
    // 11. Desfazer contra-ataca
    [A, B] = setup('v', 'v', 450, 495); A.energy = 100; hold(0, { left: true }); tap(0, 'sp2'); step(5); hold(0, {}); hp = B.hp; tap(1, 'hp'); step(60);
    ok('Desfazer pune o atacante', B.hp < hp && A.hp === A.maxHp && A.energy < 100, { dmgB: hp - B.hp, hpA: A.hp, e: A.energy });
    // 12. Nada Me Toca absorve projétil
    [A, B] = setup('v', 'v', 300, 560); A.energy = 100; tap(1, 'sp'); step(28); hold(0, { down: true }); tap(0, 'sp2'); step(3); hold(0, {}); step(60);
    ok('Nada Me Toca anula o projétil', A.hp === A.maxHp, A.hp);
    // 13. projétil acerta quem não defende
    [A, B] = setup('v', 'v', 300, 560); tap(1, 'sp'); step(80);
    ok('Telecinese acerta (70)', A.maxHp - A.hp === 70, A.maxHp - A.hp);
    // 14. supremo sem energia não sai; com energia consome 300
    [A, B] = setup('v', 'v', 450, 510); A.energy = 200; tap(0, 'su'); step(20);
    ok('supremo exige 3 barras', A.energy === 200 && A.state !== 'attack', A.energy);
    [A, B] = setup('v', 'v', 450, 510); A.energy = 300; hp = B.hp; tap(0, 'su'); step(260);
    ok('supremo consome 300 e causa dano alto', A.energy < 100 && hp - B.hp > 250, { e: Math.round(A.energy), d: hp - B.hp });
    // 15. transformação: só com vida <= 50%
    [A, B] = setup('v', 'v', 400, 560); A.energy = 300; hold(0, { down: true }); tap(0, 'su'); step(5); hold(0, {}); step(80);
    ok('transformação bloqueada com vida cheia', !A.form && A.energy === 300, A.energy);
    [A, B] = setup('v', 'v', 400, 560); A.energy = 300; A.hp = 450; hold(0, { down: true }); tap(0, 'su'); step(5); hold(0, {}); step(80);
    ok('transformação Grande Demais (custa 200)', A.form && A.form.id === 'grande' && A.energy === 100, { f: A.form && A.form.id, e: A.energy });
    step(720);
    ok('transformação termina após a duração', !A.form);
    // 16. sequência de golpes baixos não vira combo infinito
    [A, B] = setup('v', 'v', 450, 490); let maxc = 0;
    step(300, i => { if (i % 3 === 0) { hold(0, { down: true }); tap(0, 'lp'); } maxc = Math.max(maxc, B.combo); });
    ok('combo de golpes baixos termina sozinho', maxc < 8, maxc);
    // 17. canto: empurrão volta para o atacante
    [A, B] = setup('v', 'v', 935, 975); step(2); const ax0 = A.x; tap(0, 'hp'); step(30);
    ok('no canto o atacante é empurrado', A.x < ax0, { before: Math.round(ax0), after: Math.round(A.x) });
    // 18. nocaute encerra o round e conta vitória
    [A, B] = setup('v', 'v', 450, 495); B.hp = 30; tap(0, 'lp'); step(400);
    ok('K.O. dá o round ao J1', m.wins[0] === 1 && m.round === 2, { wins: m.wins, round: m.round, phase: m.phase });
    // 19. tempo esgotado: quem tem mais vida vence
    [A, B] = setup('v', 'v', 300, 600); A.hp = 900; B.hp = 500; m.timer = 1; step(400);
    ok('tempo esgotado decide pela vida', m.wins[0] === 1, m.wins);
    // 20. partida termina após 2 rounds
    let res = null;
    VA.Game.launch({ mode: 'versus', p1: { char: 'rayan' }, p2: { char: 'trigg' }, stage: 'entre', onEnd: r => { res = r; } });
    m = VA.match;
    for (let i = 0; i < 4000 && !res; i++) { VA.Input.update(); if (m.phase === 'fight') m.fighters[1].hp = 0; m.step(); }
    ok('partida termina em 2 rounds com vencedor', res && res.winner === 0 && res.wins[0] === 2, res && res.wins);
    ok('personagens corretos na partida', res && res.chars.join() === 'rayan,trigg', res && res.chars);
    // 21. armadura do Trigg absorve um golpe
    [A, B] = setup('v', 'trigg', 450, 505); tap(1, 'hp'); step(6); tap(0, 'lp'); step(40);
    ok('armadura do Trigg absorve e o martelo acerta', A.hp < A.maxHp, { hpA: A.hp, hpB: B.hp });
    // 22. comando de agarrão não pode ser defendido
    [A, B] = setup('trigg', 'v', 450, 500); hold(1, { block: true }); step(3); hp = B.hp; hold(0, { right: true }); tap(0, 'sp'); step(2); hold(0, {}); step(80);
    ok('Inexistir ignora a defesa', hp - B.hp >= 150, hp - B.hp);
    // 23. Kolt muta com energia
    [A, B] = setup('kolt', 'v', 300, 600); A.energy = 100; tap(0, 'sp2'); step(60);
    ok('Kolt: Mutar sobe o nível e custa 100', A.vars.mut === 1 && A.energy === 0, { mut: A.vars.mut, e: A.energy });
    // 24. Rayan teleporta no ar
    [A, B] = setup('rayan', 'v', 300, 500); A.energy = 100; hold(0, { up: true }); step(10); hold(0, {}); tap(0, 'sp2'); step(30);
    ok('Rayan: Passo pelo Entre no ar', A.x > B.x && A.energy === 75, { ax: Math.round(A.x), e: A.energy });
    // 25. Trigg: superpoder em V transformado — "Não funciona"
    [A, B] = setup('trigg', 'v', 420, 500); B.hp = 450; B.enterForm('grande'); A.energy = 300; hp = B.hp; tap(0, 'su'); step(260);
    ok('Desfazer a Possibilidade quase não fere V em Grande Demais', hp - B.hp < 150, hp - B.hp);
    VA.Game.leaveMatch();
    return R;
  });
  console.log(out.join('\n'));
  console.log(errs.join('\n') || 'sem erros na página');
  await b.close();
  const fails = out.filter(l => l.startsWith('FAIL')).length + errs.length;
  console.log(fails ? fails + ' falha(s)' : 'todos os testes passaram (' + out.length + ')');
  process.exit(fails ? 1 : 0);
})();
