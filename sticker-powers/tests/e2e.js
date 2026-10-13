/* =========================================================================
   STICKER POWERS — teste de ponta a ponta no navegador (Playwright).
   Percorre todas as telas e botões principais, joga batalhas, abre
   pacotes, evolui, resgata missões, testa salvamento e o layout no celular.

   Requer Playwright:  npm i -D playwright && npx playwright install chromium
   Execute:            node tests/e2e.js
   (Se o Playwright estiver instalado globalmente, defina PLAYWRIGHT_PATH
    apontando para a pasta do módulo.)
   ========================================================================= */
'use strict';
const path = require('path');
let pw;
try { pw = require(process.env.PLAYWRIGHT_PATH || 'playwright'); }
catch (e) { console.error('Playwright não encontrado. Instale com: npm i -D playwright'); process.exit(2); }

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = process.env.SHOTS || null;
let passed = 0, failed = 0;
async function step(name, fn) {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n      ' + String(e && e.message || e).split('\n')[0]); }
}
const assert = (c, m) => { if (!c) throw new Error(m || 'falhou'); };

(async () => {
  const launch = {};
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await pw.chromium.launch(launch);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const shot = async n => { if (SHOTS) await p.screenshot({ path: path.join(SHOTS, n + '.png') }); };
  const state = () => p.evaluate(() => JSON.parse(JSON.stringify(SP.state)));
  const closeModals = async () => { await p.evaluate(() => document.querySelectorAll('.modal-back').forEach(m => m.close())); await p.waitForTimeout(80); };
  const home = async () => { await closeModals(); await p.evaluate(() => SP.UI.go('home')); await p.waitForTimeout(150); };

  await p.goto(URL);
  await p.waitForTimeout(400);

  console.log('\nTela inicial');
  await step('introdução aparece e fecha', async () => {
    await p.click('#introGo');
    assert((await state()).seenIntro, 'seenIntro não salvo');
  });
  await step('todos os botões do menu abrem suas telas', async () => {
    for (const [go, title] of [['collection', 'Coleção'], ['packs', 'Pacotes'], ['battles', 'Batalhas'], ['upgrades', 'Melhorias'], ['missions', 'Missões'], ['settings', 'Configurações']]) {
      await p.click(`[data-go=${go}]`);
      await p.waitForTimeout(150);
      assert((await p.textContent('#topTitle')) === title, 'título errado para ' + go);
      await p.click('#btnBack');
      await p.waitForTimeout(150);
    }
    await shot('home');
  });

  console.log('\nPacotes');
  await step('pacote diário grátis abre, revela e salva', async () => {
    await p.click('[data-go=packs]');
    await p.click('[data-open=daily]');
    await p.click('.stage-pack');
    await p.waitForSelector('#opAll', { timeout: 5000 });
    await p.click('#opAll');
    await p.waitForSelector('#opClose:not([hidden])', { timeout: 5000 });
    await shot('pack-open');
    await p.click('#opClose');
    const st = await state();
    assert(st.stats.packsOpened === 1 && st.history.length === 3, 'pacote não registrado');
    assert(await p.$('[data-open=daily][disabled]'), 'diário deveria ficar bloqueado');
  });
  await step('pacote básico cobra 100 moedas; "Pular animação" funciona', async () => {
    const c = (await state()).coins;
    await p.click('[data-open=basic]');
    await p.click('#opSkip');
    await p.waitForSelector('#opClose:not([hidden])', { timeout: 5000 });
    await p.click('#opClose');
    assert((await state()).coins === c - 100, 'moedas não cobradas');
  });
  await step('tabela de probabilidades e histórico abrem', async () => {
    await p.click('[data-odds=premium]');
    assert((await p.$$('.odds-table')).length >= 2, 'tabela de slot garantido ausente');
    await closeModals();
    await p.click('#histBtn');
    assert((await p.$$('.history-item')).length === 6, 'histórico incompleto');
    await closeModals();
  });
  await step('sem moedas o botão fica desabilitado', async () => {
    await p.evaluate(() => { SP.state.coins = 0; SP.UI.render('packs'); });
    assert(await p.$('[data-open=premium][disabled]'));
    await p.evaluate(() => { SP.state.coins = 5000; SP.UI.changed(); });
  });

  console.log('\nColeção');
  await step('busca, filtros, ordenação e favoritos', async () => {
    await home();
    await p.click('[data-go=collection]');
    const total = (await p.$$('#grid .card')).length;
    assert(total === 88, 'esperava 88 cartas, veio ' + total);
    assert(!(await p.$('#grid .card[data-id=v]')), 'o V secreto não pode aparecer antes de ser encontrado');
    await p.selectOption('#fStatus', 'owned');
    const owned = (await p.$$('#grid .card')).length;
    assert(owned === Object.keys((await state()).owned).length, 'filtro obtidos');
    assert((await p.$$('#grid .card.locked')).length === 0);
    await p.selectOption('#fStatus', 'missing');
    assert((await p.$$('#grid .card:not(.locked)')).length === 0, 'faltando mostra obtidos');
    await p.selectOption('#fStatus', 'all');
    await p.click('[data-r=common]');
    assert((await p.$$('#grid .card')).length === 13, 'filtro raridade');
    await p.click('[data-r=all]');
    await p.selectOption('#fEl', 'fire');
    assert((await p.$$('#grid .card')).length === 4, 'filtro elemento');
    await p.selectOption('#fEl', 'all');
    await p.fill('#fQ', 'gotin');
    assert((await p.$$('#grid .card')).length === 1, 'busca');
    await p.fill('#fQ', '');
    for (const s of ['power', 'rarity', 'level', 'name', 'num']) await p.selectOption('#fSort', s);
  });
  await step('detalhes, favoritar e silhueta de bloqueado', async () => {
    await p.click('#grid .card[data-id=brasinha]');
    await p.click('[data-a=fav]');
    assert((await state()).owned.brasinha.fav, 'favorito não salvo');
    await shot('detail');
    await closeModals();
    await p.click('#fFav');
    assert((await p.$$('#grid .card')).length === 1, 'filtro favoritos');
    await p.click('#fFav');
    await p.click('#grid .card[data-id=void_king]');
    assert((await p.textContent('.modal h3')).indexOf('desconhecido') >= 0);
    await closeModals();
  });
  await step('comparar dois stickers', async () => {
    await p.click('#cmpBtn');
    await p.click('#grid .card[data-id=brasinha]');
    await p.click('#grid .card[data-id=gotinha]');
    assert((await p.textContent('.modal h3')) === 'Comparação');
    assert((await p.$$('.cmp-row')).length >= 7);
    await closeModals();
  });

  console.log('\nBatalhas');
  await step('fase 1: jogar manualmente um turno e terminar no automático', async () => {
    await home();
    await p.click('[data-go=play]');
    await p.click('#stGo');
    await p.click('#autoPick');
    await p.click('#fight');
    await p.waitForSelector('#aAtk:not([disabled])', { timeout: 15000 });
    await p.click('#aAtk');
    const t = await p.$('.unit.targetable');
    if (t) await t.click();
    await shot('battle');
    await p.click('#spd'); await p.click('#spd');
    await p.click('#auto');
    await p.waitForSelector('.result', { timeout: 120000 });
    await shot('result');
    const st = await state();
    assert(st.stats.battlesWon + st.stats.battlesLost === 1, 'resultado não registrado');
    await p.click('#rBtns .btn:last-child');
    await p.evaluate(() => { SP.state.settings.autoBattle = false; SP.state.settings.battleSpeed = 1; SP.UI.changed(); });
  });
  await step('desistir de uma batalha conta como derrota sem recompensa', async () => {
    await home();
    const before = await state();
    await p.click('[data-go=battles]');
    await p.click('[data-t=quick]');
    await p.click('#qGo');
    await p.click('#fight');
    await p.waitForTimeout(400);
    await p.click('#btnBack');
    await p.click('#cfYes');
    const st = await state();
    assert(st.stats.battlesLost === before.stats.battlesLost + 1 && st.coins === before.coins, 'desistência');
  });
  await step('chefe: tela de apresentação e batalha', async () => {
    await home();
    await p.evaluate(() => { SP.state.campaign.cleared = 4; Object.keys(SP.state.owned).forEach(id => { SP.state.owned[id].level = 10; }); SP.UI.changed(); });
    await p.click('[data-go=battles]');
    await p.click('[data-t=bosses]');
    await p.click('.boss-card[data-b=apocalipse]');
    await p.waitForSelector('.boss-intro');
    await shot('boss-intro');
    await p.click('#biGo');
    await p.click('#fight');
    await p.waitForSelector('.unit.boss');
    await p.evaluate(() => { SP.state.settings.autoBattle = true; SP.state.settings.battleSpeed = 3; if (SP.UI.Battle.waiting) SP.UI.Battle.waiting('auto'); });
    await p.waitForSelector('.result', { timeout: 180000 });
    await shot('boss-result');
    await closeModals();
    await p.evaluate(() => { SP.state.settings.autoBattle = false; SP.state.settings.battleSpeed = 1; SP.UI.changed(); });
  });

  await step('Torre Infinita: subir um andar', async () => {
    await home();
    await p.click('[data-go=battles]');
    await p.click('[data-t=tower]');
    await p.waitForSelector('.tower-floor.cur');
    await shot('tower');
    await p.evaluate(() => { Object.keys(SP.state.owned).forEach(id => { SP.state.owned[id].level = 10; }); SP.state.settings.autoBattle = true; SP.state.settings.battleSpeed = 3; SP.UI.changed(); });
    await p.click('#twGo');
    await p.click('#fight');
    await p.waitForSelector('.result', { timeout: 180000 });
    const st = await state();
    assert(st.tower.best === 1 || st.stats.battlesLost > 0, 'torre não registrou');
    await closeModals();
    await p.evaluate(() => { SP.state.settings.autoBattle = false; SP.state.settings.battleSpeed = 1; SP.UI.changed(); });
  });
  await step('Ato II aparece na campanha com 40 fases', async () => {
    await home();
    await p.evaluate(() => { SP.state.campaign.cleared = 20; SP.UI.changed(); });
    await p.click('[data-go=battles]');
    assert((await p.$$('.stage-node')).length === 80, 'esperava 80 fases');
    assert((await p.$$('.act-title')).length === 4);
    await p.click('.stage-node.next', { force: true });
    assert((await p.textContent('.modal h3')).indexOf('Fase 21') >= 0, 'fase 21 não abriu');
    await closeModals();
    await shot('act2');
  });

  await step('segredo: o copo quebra e volta; depois da fase 40 ele para e revela o V', async () => {
    await home();
    await p.evaluate(() => { SP.state.campaign.cleared = 39; SP.UI.go('home'); });
    await p.click('#vGlass', { force: true });
    await p.waitForTimeout(1700);
    assert(!(await state()).owned.v, 'V liberado cedo demais');
    await p.evaluate(() => { SP.state.campaign.cleared = 40; SP.UI.go('home'); });
    await p.click('#vGlass', { force: true });
    await p.waitForSelector('.v-reveal', { timeout: 5000 });
    await p.waitForTimeout(500);
    await shot('v-reveal');
    assert((await state()).owned.v, 'V não foi salvo');
    await closeModals();
    await p.click('[data-go=collection]');
    assert(await p.$('#grid .card[data-id=v]'), 'V não apareceu na coleção depois de encontrado');
    await p.evaluate(() => { SP.state.campaign.cleared = 20; SP.UI.changed(); });
  });

  await step('segredo 2: três toques nos faróis da ficha do V revelam a Van', async () => {
    await closeModals();
    await p.evaluate(() => SP.UI.showDetail('v'));
    for (let i = 0; i < 3; i++) { await p.click('.van-lights'); await p.waitForTimeout(150); }
    await p.waitForSelector('.v-reveal', { timeout: 5000 });
    assert((await state()).owned.van, 'Van não foi salva');
    await closeModals();
  });
  await step('Modo Pesadelo: aba liberada após a fase 40 e batalha com regras', async () => {
    await home();
    await p.evaluate(() => { SP.state.campaign.cleared = 40; SP.UI.changed(); });
    await p.click('[data-go=battles]');
    await p.click('[data-t=nightmare]');
    assert((await p.$$('.stage-node.night')).length === 40, 'esperava 40 pesadelos');
    await p.click('.stage-node.night.next', { force: true });
    await p.click('#nmGo');
    await p.waitForSelector('.mod-tag');
    await p.evaluate(() => { SP.state.settings.autoBattle = true; SP.state.settings.battleSpeed = 3; SP.UI.changed(); });
    await p.click('#fight');
    await p.waitForSelector('.mods-badge');
    await p.waitForSelector('.result', { timeout: 180000 });
    assert(await p.$('.xp-row'), 'sem barras de XP no resultado');
    await shot('nightmare-result');
    await closeModals();
    await p.evaluate(() => { SP.state.settings.autoBattle = false; SP.state.settings.battleSpeed = 1; SP.state.campaign.cleared = 20; SP.UI.changed(); });
  });
  await step('Duelo Local: dois jogadores escolhem e jogam até o fim', async () => {
    await home();
    await p.evaluate(() => SP.UI.go('duel'));
    for (let i = 0; i < 3; i++) await (await p.$$('#dPick .card'))[i].click();
    await p.click('#dNext');
    for (let i = 0; i < 3; i++) await (await p.$$('#dPick .card'))[i].click();
    await p.click('#dNext');
    await p.waitForSelector('#aAtk:not([disabled])', { timeout: 15000 });
    await p.evaluate(() => { SP.state.settings.autoBattle = true; SP.state.settings.battleSpeed = 3; if (SP.UI.Battle.waiting) SP.UI.Battle.waiting('auto'); });
    await p.waitForSelector('#dRe', { timeout: 180000 });
    assert((await state()).stats.duels === 1, 'duelo não contado');
    await closeModals();
    await p.evaluate(() => { SP.state.settings.autoBattle = false; SP.state.settings.battleSpeed = 1; SP.UI.changed(); });
  });
  await step('Molduras: comprar com cristais e equipar na ficha', async () => {
    await home();
    await p.evaluate(() => { SP.state.crystals = 30; SP.UI.changed(); SP.UI.go('upgrades', { tab: 'frames' }); });
    await p.click('[data-buy=neon]');
    assert((await state()).frames.owned.indexOf('neon') >= 0, 'não comprou');
    await p.evaluate(() => SP.UI.showDetail('brasinha'));
    await p.click('[data-frame=neon]');
    assert((await state()).frames.equip.brasinha === 'neon', 'não equipou');
    assert(await p.$('.modal .card.lg.f-neon'), 'carta sem a moldura');
    await closeModals();
  });

  console.log('\nA Porta');
  await step('Ato IV aparece na campanha depois da fase 60', async () => {
    await home();
    await p.evaluate(() => { SP.state.campaign.cleared = 60; SP.UI.changed(); });
    await p.click('[data-go=battles]');
    await p.click('.stage-node.next', { force: true });
    assert((await p.textContent('.modal h3')).indexOf('Fase 61') >= 0, 'fase 61 não abriu');
    await closeModals();
    await shot('act4');
    await p.evaluate(() => { SP.state.campaign.cleared = 20; SP.UI.changed(); });
  });
  await step('Fusão: laboratório, animação e sticker novo na coleção', async () => {
    await home();
    await p.evaluate(() => {
      ['inferno_rex', 'frost_queen'].forEach(id => { SP.Core.addSticker(id, 't'); SP.state.owned[id].stars = 3; SP.state.owned[id].level = 30; });
      SP.state.coins = 1e6; SP.state.fragments = 1e4; SP.state.essence = 50; SP.UI.changed();
      SP.UI.go('upgrades', { tab: 'fusion' });
    });
    await p.waitForSelector('.fz-item');
    assert((await p.$$('.fz-item')).length === 9, 'esperava 9 receitas');
    await shot('fusion-lab');
    await p.click('[data-fuse=fx_vaporex]', { force: true });
    await p.waitForSelector('.fusion-anim');
    await p.waitForTimeout(900);
    await shot('fusion-anim');
    await p.waitForSelector('.fa-born', { timeout: 4000 });
    await p.waitForTimeout(700);
    await shot('fusion-born-sil');
    await p.waitForTimeout(800);
    await shot('fusion-born');
    await p.waitForSelector('.v-reveal', { timeout: 6000 });
    await p.waitForTimeout(400);
    await shot('fusion-reveal');
    assert((await state()).owned.fx_vaporex, 'fusão não foi salva');
    await home();
    await p.click('[data-go=collection]');
    assert(await p.$('#grid .card.fusion[data-id=fx_vaporex]'), 'fusão não aparece na coleção');
  });
  await step('Sinergia aparece na escolha de equipe', async () => {
    await home();
    await p.evaluate(() => { SP.state.team = ['brasinha', 'inferno_rex']; SP.UI.changed(); SP.UI.go('team', { kind: 'quick', enemies: SP.Core.quickEnemies(SP.state.team) }); });
    await p.waitForSelector('.syn-tag');
    await shot('synergy');
    assert(/Sinergia/.test(await p.textContent('.syn-tag')), 'sem sinergia');
  });
  await step('Chefe Mundial: batalha de 10 rodadas, contador de dano e faixas', async () => {
    await home();
    await p.evaluate(() => { Object.keys(SP.state.owned).forEach(id => { SP.state.owned[id].level = 30; }); SP.UI.changed(); });
    await p.click('[data-go=battles]');
    await p.click('[data-t=raid]');
    await p.waitForSelector('.raid-panel');
    await shot('raid');
    await p.click('#rdGo');
    await p.waitForSelector('.boss-intro');
    await p.click('#biGo');
    await p.click('#fight');
    await p.waitForSelector('#raidDmg');
    await p.evaluate(() => { SP.state.settings.autoBattle = true; SP.state.settings.battleSpeed = 3; if (SP.UI.Battle.waiting) SP.UI.Battle.waiting('auto'); });
    await p.waitForSelector('#rAgain', { timeout: 240000 });
    await shot('raid-result');
    const st = await state();
    assert(st.raid.total > 0 && st.daily.counters.raid === 1, 'tentativa não registrada');
    await p.click('#rOut');
    await p.evaluate(() => { SP.state.settings.autoBattle = false; SP.state.settings.battleSpeed = 1; SP.UI.changed(); });
  });

  console.log('\nMelhorias');
  await step('treinar e evoluir', async () => {
    await home();
    await p.evaluate(() => { SP.state.coins = 99999; SP.state.fragments = 9999; SP.state.owned.gotinha.level = 5; SP.Core.grantXp('seixo', 1e6); SP.UI.changed(); });
    await p.click('[data-go=upgrades]');
    await p.click('#upList .card[data-id=gotinha]');
    const lv = (await state()).owned.gotinha;
    await p.click('#btTrain');
    const lv2 = (await state()).owned.gotinha;
    assert(lv2.level > lv.level || lv2.xp > lv.xp, 'treino sem efeito');
    await p.click('#upList .card[data-id=seixo]');
    await p.click('#btEvo');
    await p.waitForTimeout(300);
    await shot('evolve');
    assert((await state()).owned.seixo.stars === 2, 'não evoluiu');
    await p.waitForTimeout(2600);
  });
  await step('forja cria um sticker', async () => {
    await p.click('[data-t=forge]');
    const before = Object.keys((await state()).owned).length;
    await p.click('[data-f]:not([disabled])');
    await closeModals();
    assert(Object.keys((await state()).owned).length === before + 1, 'forja falhou');
  });

  await step('Treinar ao máximo e Treinar e evoluir ao máximo', async () => {
    await home();
    await p.evaluate(() => { SP.state.coins = 5000; SP.state.owned.parafuso = SP.state.owned.parafuso || { level: 1, xp: 0, stars: 1, count: 1, fav: false, firstAt: 0 }; SP.state.owned.parafuso.level = 1; SP.state.owned.parafuso.stars = 1; SP.UI.changed(); SP.UI.go('upgrades', { id: 'parafuso' }); });
    await p.click('#btTrainMax');
    const a = await state();
    assert(a.owned.parafuso.level === 10 || a.coins < 80, 'treinar ao máximo não foi até o fim');
    await p.evaluate(() => { SP.state.coins = 1e6; SP.state.fragments = 1e5; SP.UI.changed(); SP.UI.go('upgrades', { id: 'parafuso' }); });
    await p.click('#btEvoMax');
    await p.waitForTimeout(2800);
    await shot('evolve-max');
    const b = await state();
    assert(b.owned.parafuso.stars >= 3 && b.owned.parafuso.level >= 30, 'evoluir ao máximo não evoluiu: ' + b.owned.parafuso.stars + '★ Nv' + b.owned.parafuso.level);
  });

  console.log('\nMissões');
  await step('resgatar missões concluídas', async () => {
    await home();
    await p.click('[data-go=missions]');
    const c = (await state()).coins;
    const n = (await p.$$('[data-claim]:not([disabled])')).length;
    assert(n > 0, 'nenhuma missão para resgatar');
    while (await p.$('[data-claim]:not([disabled])')) { await p.click('[data-claim]:not([disabled])'); await p.waitForTimeout(60); }
    assert((await state()).coins > c, 'sem recompensa');
    await shot('missions');
  });

  console.log('\nConfigurações e salvamento');
  await step('alternar som, música e animações reduzidas', async () => {
    await home();
    await p.click('[data-go=settings]');
    await p.click('#sMusic'); await p.click('#sSfx'); await p.click('#sRed');
    const s = (await state()).settings;
    assert(!s.music && !s.sfx && s.reducedMotion, 'configurações não salvas');
    assert(await p.evaluate(() => document.body.classList.contains('reduced')));
    await p.click('#sMusic'); await p.click('#sSfx'); await p.click('#sRed');
  });
  await step('progresso persiste após recarregar a página', async () => {
    const before = await state();
    await p.reload();
    await p.waitForTimeout(400);
    const after = await state();
    assert(after.coins === before.coins && Object.keys(after.owned).length === Object.keys(before.owned).length && after.stats.packsOpened === before.stats.packsOpened, 'dados diferentes após recarregar');
  });
  await step('exportar e importar save', async () => {
    await p.click('[data-go=settings]');
    await p.click('#sExp');
    const txt = await p.inputValue('#expTxt');
    await closeModals();
    await p.evaluate(() => { SP.state.coins = 1; SP.Core.save(); });
    await p.click('#sImp');
    await p.fill('#impTxt', txt);
    await p.click('#impGo');
    assert((await state()).coins === JSON.parse(txt).coins, 'importação falhou');
  });
  await step('reiniciar exige confirmação por texto', async () => {
    await p.click('[data-go=settings]');
    await p.click('#sReset');
    await p.click('#cfYes');
    assert(Object.keys((await state()).owned).length > 3, 'reiniciou sem confirmação');
    await p.fill('#cfWord', 'RESETAR');
    await p.click('#cfYes');
    const st = await state();
    assert(Object.keys(st.owned).length === 3 && st.coins === 300, 'não reiniciou');
  });

  console.log('\nCelular (390×844)');
  await step('sem rolagem horizontal nas telas principais', async () => {
    await p.setViewportSize({ width: 390, height: 844 });
    for (const scr of ['home', 'collection', 'packs', 'battles', 'upgrades', 'missions', 'settings']) {
      await p.evaluate(s => SP.UI.go(s), scr);
      await p.waitForTimeout(200);
      const over = await p.evaluate(() => {
        const s = document.querySelector('.screen');
        return s.scrollWidth - s.clientWidth;
      });
      assert(over <= 1, scr + ' tem rolagem horizontal de ' + over + 'px');
    }
    await p.evaluate(() => SP.UI.go('home'));
    await shot('mobile-home');
  });
  await step('batalha no celular cabe na tela', async () => {
    await closeModals();
    await p.evaluate(() => SP.UI.go('team', { kind: 'stage', stage: 1 }));
    await p.click('#fight');
    await p.waitForTimeout(600);
    const ok = await p.evaluate(() => {
      const c = document.querySelector('.controls').getBoundingClientRect();
      return c.bottom <= innerHeight + 1 && document.querySelectorAll('.unit').length >= 4;
    });
    assert(ok, 'controles fora da tela');
    await shot('mobile-battle');
  });

  await step('nenhum erro de JavaScript no console', async () => {
    assert(errors.length === 0, errors.join(' | '));
  });

  await browser.close();
  console.log('\n' + passed + ' passaram, ' + failed + ' falharam\n');
  process.exit(failed ? 1 : 0);
})();
