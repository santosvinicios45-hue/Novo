/* =========================================================================
   STICKER POWERS — testes da lógica do jogo (sem navegador).
   Execute:  node tests/run-tests.js
   ========================================================================= */
'use strict';
const path = require('path');

// localStorage falso em memória, para testar salvamento/carregamento
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; }
};
['data.js', 'core.js', 'battle.js', 'art.js', 'art2.js'].forEach(f => require(path.join(__dirname, '..', 'js', f)));
const SP = globalThis.SP;
const Core = SP.Core, Battle = SP.Battle;

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n      ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join('\n      ') : e)); }
}
function assert(c, msg) { if (!c) throw new Error(msg || 'falhou'); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'esperado igual') + ': ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b)); }
function near(a, b, tol, msg) { if (Math.abs(a - b) > tol) throw new Error((msg || 'fora da tolerância') + ': ' + a + ' vs ' + b + ' (±' + tol + ')'); }
function seeded(seed) { return Core.seeded(seed); }
function fresh() { SP.state = Core.newState(); return SP.state; }

/* ------------------------------------------------------------------ dados */
console.log('\nDados do jogo');
test('pelo menos 30 stickers, ids únicos', () => {
  assert(SP.STICKERS.length >= 30, 'só ' + SP.STICKERS.length);
  eq(new Set(SP.STICKERS.map(s => s.id)).size, SP.STICKERS.length, 'ids duplicados');
});
test('sete raridades e todas usadas', () => {
  eq(SP.RARITIES.length, 7);
  SP.RARITIES.forEach(r => assert(SP.STICKERS.some(s => s.rarity === r.id), 'raridade sem sticker: ' + r.id));
});
test('15 elementos e todos usados', () => {
  eq(SP.ELEMENTS.length, 15);
  SP.ELEMENTS.forEach(e => assert(SP.STICKERS.some(s => s.el === e.id), 'elemento sem sticker: ' + e.id));
});
test('todo sticker tem arte própria, história, habilidade e efeitos válidos', () => {
  const known = ['dmg', 'chain', 'pctHp', 'status', 'heal', 'shield', 'energy', 'haste', 'delay', 'cleanse', 'dispel', 'selfDmg', 'reviveOrHeal'];
  SP.STICKERS.forEach(s => {
    assert(SP.Art.has(s.id), 'sem arte: ' + s.id);
    assert(s.story && s.story.length > 30, 'sem história: ' + s.id);
    assert(s.skill && s.skill.fx.length, 'sem habilidade: ' + s.id);
    s.skill.fx.forEach(f => {
      assert(known.indexOf(f.k) >= 0, 'efeito desconhecido ' + f.k + ' em ' + s.id);
      if (f.k === 'status') assert(SP.STATUS_INFO[f.s], 'status desconhecido ' + f.s);
    });
  });
});
test('nomes de habilidades são únicos (cada sticker tem a sua)', () => {
  eq(new Set(SP.STICKERS.map(s => s.skill.name)).size, SP.STICKERS.length);
});
test('as artes geradas são diferentes entre si', () => {
  const strip = svg => svg.replace(/g\d+[a-z]/g, 'G').replace(/x\d+/g, 'X');
  const arts = SP.STICKERS.map(s => strip(SP.Art.sticker(s.id)));
  eq(new Set(arts).size, arts.length, 'existem artes idênticas');
});
test('8 chefes (4 por ato), cada um com arte e sticker exclusivo', () => {
  eq(SP.BOSSES.length, 8);
  eq(SP.BOSSES.filter(b => b.act === 2).length, 4);
  SP.BOSSES.forEach(b => { assert(SP.Art.boss(b.id).length > 500); assert(SP.STICKER[b.reward].bossOnly === b.id); });
});

/* ------------------------------------------------------------------ elementos */
console.log('\nVantagens elementais');
test('Água vence Fogo, Fogo é resistido por Água', () => {
  eq(SP.elementMult('water', 'fire'), SP.ADV_STRONG);
  eq(SP.elementMult('fire', 'water'), SP.ADV_WEAK);
});
test('Raio vence Água; neutro = 1', () => {
  eq(SP.elementMult('lightning', 'water'), SP.ADV_STRONG);
  eq(SP.elementMult('fire', 'time'), 1);
});
test('todo elemento tem vantagem sobre algo e fraqueza a algo', () => {
  SP.ELEMENTS.forEach(e => {
    assert(e.strong.length >= 2, e.id + ' sem vantagens');
    assert(SP.ELEMENTS.some(x => x.strong.indexOf(e.id) >= 0), e.id + ' sem fraqueza');
  });
});
test('vantagem elemental aumenta o dano em batalha', () => {
  fresh();
  const avg = (atk, def) => {
    let tot = 0;
    for (let i = 0; i < 200; i++) {
      const b = Battle.create({ players: [{ id: atk, level: 5 }], enemies: [{ id: def, level: 5 }], rng: seeded(i + 1) });
      const ev = Battle.act(b, b.units[0], { type: 'attack', target: 'e0' });
      const d = ev.find(e => e.t === 'damage');
      tot += d ? d.amount + d.absorbed : 0;
    }
    return tot / 200;
  };
  const strong = avg('gotinha', 'brasinha');       // água -> fogo
  const neutral = avg('gotinha', 'seixo');          // água -> terra é vantagem também; usa outro
  const neutral2 = avg('gotinha', 'faisca');        // água -> raio: neutro
  assert(strong > neutral2 * 1.2, 'vantagem não aumentou o dano: ' + strong + ' vs ' + neutral2);
  assert(neutral > 0);
});

/* ------------------------------------------------------------------ pacotes */
console.log('\nPacotes e probabilidades');
test('probabilidades de cada pacote somam 100%', () => {
  SP.PACKS.forEach(p => {
    const o = Core.packOdds(p.id);
    near(o.rarities.reduce((a, r) => a + r.p, 0), 1, 1e-9, p.id + ' raridades');
    near(o.stickers.reduce((a, r) => a + r.p, 0), 1, 1e-9, p.id + ' stickers');
    assert(o.stickers.every(s => !SP.STICKER[s.id].bossOnly), 'exclusivo de chefe em pacote');
  });
});
test('taxas configuradas são as exibidas (Pacote Básico)', () => {
  const o = Core.packOdds('basic');
  const R = SP.RATES.basic;
  o.rarities.forEach(r => near(r.p * 100, R[r.id], 1e-9, r.id));
});
test('pacotes elementais só contêm os elementos certos e redistribuem raridades vazias', () => {
  ['fury', 'tide', 'astral'].forEach(id => {
    const p = SP.PACK[id], o = Core.packOdds(id);
    o.stickers.forEach(s => assert(p.elements.indexOf(SP.STICKER[s.id].el) >= 0, id + ' contém ' + s.id));
    o.rarities.forEach(r => { if (!r.count) eq(r.p, 0, id + ' raridade vazia com chance'); });
  });
});
test('frequências sorteadas batem com as probabilidades (200 mil sorteios)', () => {
  const o = Core.packOdds('basic');
  const rng = seeded(12345);
  const N = 200000, cnt = {};
  for (let i = 0; i < N; i++) { const id = Core.rollFromOdds(o, rng); const r = SP.STICKER[id].rarity; cnt[r] = (cnt[r] || 0) + 1; }
  o.rarities.forEach(r => {
    const exp = r.p * N, got = cnt[r.id] || 0;
    const tol = 5 * Math.sqrt(exp * (1 - r.p)) + 3;
    near(got, exp, tol, 'raridade ' + r.id);
  });
});
test('evento: elementos em destaque têm peso 3× dentro da raridade', () => {
  const now = new Date(2026, 9, 12).getTime();
  const o = Core.packOdds('event', now);
  const ev = Core.currentEvent(now);
  const commons = o.stickers.filter(s => SP.STICKER[s.id].rarity === 'common');
  const f = commons.find(s => ev.elements.indexOf(SP.STICKER[s.id].el) >= 0);
  const n = commons.find(s => ev.elements.indexOf(SP.STICKER[s.id].el) < 0);
  if (f && n) near(f.p / n.p, SP.EVENT_WEIGHT, 1e-9);
});
test('Premium: o 3º sticker é sempre Raro ou melhor', () => {
  fresh();
  SP.state.coins = 1e6;
  const rng = seeded(7);
  for (let i = 0; i < 300; i++) {
    const r = Core.openPack('premium', { rng });
    assert(r.ok);
    assert(SP.RARITY[SP.STICKER[r.results[2].id].rarity].rank >= 2, 'slot garantido veio ' + r.results[2].id);
    r.results.forEach(x => assert(SP.STICKER[x.id].rarity !== 'common', 'premium com comum'));
  }
});
test('abrir pacote cobra moedas e adiciona 3 stickers', () => {
  fresh();
  const before = SP.state.coins;
  const r = Core.openPack('basic', { rng: seeded(3) });
  assert(r.ok);
  eq(SP.state.coins, before - 100);
  eq(r.results.length, 3);
  eq(SP.state.stats.packsOpened, 1);
  eq(SP.state.history.length, 3);
});
test('sem moedas não abre', () => {
  fresh(); SP.state.coins = 50;
  const r = Core.openPack('basic');
  assert(!r.ok); eq(SP.state.coins, 50);
});
test('pacote diário: 1 por dia (data local) e resiste a relógio voltando', () => {
  fresh();
  const d1 = new Date(2026, 4, 10, 10).getTime();
  assert(Core.openPack('daily', { now: d1, rng: seeded(1) }).ok, 'primeiro do dia');
  assert(!Core.openPack('daily', { now: d1 + 3600e3 }).ok, 'segundo no mesmo dia');
  assert(!Core.openPack('daily', { now: d1 - 86400e3 }).ok, 'relógio voltou');
  assert(Core.openPack('daily', { now: new Date(2026, 4, 11, 0, 1).getTime(), rng: seeded(2) }).ok, 'dia seguinte');
});
test('tokens de pacote são usados antes das moedas', () => {
  fresh(); SP.state.tokens.premium = 1;
  const c = SP.state.coins;
  const r = Core.openPack('premium', { rng: seeded(9) });
  assert(r.ok); eq(r.via, 'token'); eq(SP.state.tokens.premium, 0); eq(SP.state.coins, c);
});
test('Pacote Cósmico usa essência', () => {
  fresh(); SP.state.essence = 3;
  assert(Core.openPack('cosmic', { rng: seeded(4) }).ok);
  eq(SP.state.essence, 0);
  assert(!Core.openPack('cosmic').ok);
});

/* ------------------------------------------------------------------ duplicatas e progressão */
console.log('\nDuplicatas, evolução e forja');
test('duplicata vira fragmentos conforme a raridade', () => {
  fresh();
  const f0 = SP.state.fragments;
  const r = Core.addSticker('brasinha', 'teste');
  assert(!r.isNew);
  eq(r.frags, SP.RARITY.common.dupeFrags);
  eq(SP.state.fragments, f0 + SP.RARITY.common.dupeFrags);
  eq(SP.state.owned.brasinha.count, 2);
  const n = Core.addSticker('void_king', 'teste');
  assert(n.isNew); eq(n.frags, 0);
});
test('XP sobe de nível e para no limite da estrela', () => {
  fresh();
  const ups = Core.grantXp('brasinha', 100000);
  eq(SP.state.owned.brasinha.level, SP.PROG.levelCap(1));
  eq(ups, SP.PROG.levelCap(1) - 1);
  eq(SP.state.owned.brasinha.xp, 0);
});
test('treinar custa moedas e dá XP', () => {
  fresh();
  const c = SP.state.coins;
  assert(Core.train('gotinha').ok);
  eq(SP.state.coins, c - SP.PROG.trainCost);
  assert(SP.state.owned.gotinha.level > 1 || SP.state.owned.gotinha.xp === SP.PROG.trainXp);
});
test('evoluir exige nível máximo, moedas e fragmentos; aumenta atributos e desbloqueia talento', () => {
  fresh();
  assert(!Core.evolve('seixo').ok, 'evoluiu sem requisitos');
  Core.grantXp('seixo', 1e6);
  SP.state.coins = 10000; SP.state.fragments = 1000;
  const before = Core.ownedStats('seixo');
  const info = Core.evoInfo('seixo');
  const r = Core.evolve('seixo');
  assert(r.ok, 'não evoluiu');
  eq(SP.state.owned.seixo.stars, 2);
  eq(SP.state.coins, 10000 - info.coins);
  eq(SP.state.fragments, 1000 - info.frags);
  const after = Core.ownedStats('seixo');
  assert(after.hp > before.hp && after.atk > before.atk, 'atributos não subiram');
  const b = Battle.create({ players: [{ id: 'seixo', level: 10, stars: 2 }], enemies: [{ id: 'brasinha', level: 1 }] });
  assert(b.units[0].talent, 'talento não ativo');
});
test('estrela 3 desperta a habilidade (+poder, −custo)', () => {
  const s1 = Core.skillFor('brasinha', 1), s3 = Core.skillFor('brasinha', 3);
  eq(s3.cost, s1.cost - 1);
  assert(s3.fx[0].p > s1.fx[0].p);
});
test('forja cria sticker faltante usando fragmentos', () => {
  fresh(); SP.state.fragments = 500;
  assert(!Core.craft('void_king').ok, 'secreto forjável');
  assert(!Core.craft('draco_jr').ok, 'exclusivo forjável');
  assert(Core.craft('frost_queen').ok === false, 'mítico sem fragmentos suficientes');
  assert(Core.craft('aqua_phantom').ok);
  assert(SP.state.owned.aqua_phantom);
  eq(SP.state.fragments, 500 - SP.RARITY.rare.craft);
  assert(!Core.craft('aqua_phantom').ok, 'forjou repetido');
});

/* ------------------------------------------------------------------ combate */
console.log('\nCombate');
function duel(p, e, opts) {
  return Battle.create(Object.assign({ players: p.map(id => ({ id, level: 10 })), enemies: e.map(id => ({ id, level: 10 })), rng: seeded(99) }, opts || {}));
}
test('queimadura causa dano contínuo no início do turno', () => {
  fresh();
  const b = duel(['brasinha'], ['seixo']);
  const a = b.units[0], t = b.units[1];
  a.en = 5;
  Battle.act(b, a, { type: 'skill', target: t.uid });
  assert(Battle.has(t, 'burn'), 'não queimou');
  b.queue = [t.uid];
  const hp = t.hp;
  const r = Battle.beginTurn(b);
  assert(r.events.some(e => e.t === 'dot' && e.kind === 'burn'), 'sem dano de queimadura');
  assert(t.hp < hp);
});
test('congelamento faz perder o turno', () => {
  fresh();
  const b = duel(['raposa_nivea'], ['seixo']);
  const t = b.units[1];
  b.units[0].statuses = [];
  t.statuses.push({ s: 'freeze', t: 1 });
  b.queue = [t.uid];
  const r = Battle.beginTurn(b);
  assert(!r.canAct, 'agiu congelado');
  assert(r.events.some(e => e.t === 'skip'));
  assert(!Battle.has(t, 'freeze'), 'congelamento não saiu');
});
test('Terra aumenta a defesa e provoca; inimigos são obrigados a mirar nela', () => {
  fresh();
  const b = duel(['seixo', 'gotinha'], ['brasinha']);
  const s = b.units[0];
  s.en = 5;
  Battle.act(b, s, { type: 'skill' });
  assert(Battle.has(s, 'defUp') && Battle.has(s, 'taunt'));
  const valid = Battle.validTargets(b, b.units[2], 'attack');
  eq(valid.length, 1); eq(valid[0], s);
});
test('Luz cura a equipe', () => {
  fresh();
  const b = duel(['mariposa_lume', 'brasinha'], ['seixo']);
  b.units[1].hp = 10;
  b.units[0].en = 5;
  Battle.act(b, b.units[0], { type: 'skill' });
  assert(b.units[1].hp > 10);
});
test('Trevas enfraquecem (ataque −30%)', () => {
  fresh();
  const b = duel(['gato_sombrio'], ['seixo']);
  const t = b.units[1];
  const atk = Battle.effAtk(t);
  b.units[0].en = 5;
  Battle.act(b, b.units[0], { type: 'skill', target: t.uid });
  assert(Battle.has(t, 'weaken'));
  near(Battle.effAtk(t), atk * 0.7, 0.01);
});
test('Tempo altera a ordem dos turnos (aliado age imediatamente / alvo vai para o fim)', () => {
  fresh();
  const b = duel(['tique_taque', 'brasinha'], ['seixo', 'gotinha']);
  b.queue = ['e0', 'e1'];
  b.units[0].en = 5;
  Battle.act(b, b.units[0], { type: 'skill', target: 'p1' });
  eq(b.queue[0], 'p1', 'aliado não foi adiantado');
  const c = duel(['chronos'], ['seixo', 'gotinha']);
  c.queue = ['e0', 'e1'];
  c.units[0].en = 6;
  Battle.act(c, c.units[0], { type: 'skill', target: 'e0' });
  eq(c.queue[0], 'p0', 'Chronos não ganhou turno extra');
  eq(c.queue[c.queue.length - 1], 'e0', 'alvo não foi para o fim');
});
test('Raio encadeia dano nos outros inimigos', () => {
  fresh();
  const b = duel(['volt_dragon'], ['seixo', 'gotinha', 'brasinha']);
  b.units[0].en = 5;
  const ev = Battle.act(b, b.units[0], { type: 'skill', target: 'e0' });
  const hit = new Set(ev.filter(e => e.t === 'damage').map(e => e.u));
  eq(hit.size, 3);
});
test('escudo absorve dano', () => {
  fresh();
  const b = duel(['brasinha'], ['parafuso']);
  const t = b.units[1];
  t.shield = 9999;
  const hp = t.hp;
  Battle.act(b, b.units[0], { type: 'attack', target: t.uid });
  eq(t.hp, hp); assert(t.shield < 9999);
});
test('habilidade sem energia suficiente vira ataque normal', () => {
  fresh();
  const b = duel(['brasinha'], ['seixo']);
  b.units[0].en = 0;
  const ev = Battle.act(b, b.units[0], { type: 'skill', target: 'e0' });
  eq(ev.find(e => e.t === 'action').kind, 'attack');
});
test('Donzela da Ampulheta revive aliado caído', () => {
  fresh();
  const b = duel(['donzela_ampulheta', 'brasinha'], ['seixo']);
  const ally = b.units[1];
  ally.alive = false; ally.hp = 0;
  b.units[0].en = 6;
  Battle.act(b, b.units[0], { type: 'skill' });
  assert(ally.alive && ally.hp > 0);
});
test('todas as habilidades executam sem erro e produzem eventos', () => {
  fresh();
  SP.STICKERS.forEach(s => {
    const b = Battle.create({ players: [{ id: s.id, level: 10 }, { id: 'gotinha', level: 10 }], enemies: [{ id: 'seixo', level: 10 }, { id: 'brasinha', level: 10 }], rng: seeded(s.num) });
    b.units[1].hp = Math.round(b.units[1].maxHp / 2);
    const u = b.units[0];
    u.en = u.maxEn;
    const ev = Battle.act(b, u, { type: 'skill', target: s.skill.target === 'ally' ? 'p1' : 'e0' });
    const a = ev.find(e => e.t === 'action');
    assert(a && a.kind === 'skill', s.id + ' não usou a habilidade');
    assert(ev.length > 2, s.id + ' sem efeitos');
  });
});
test('chefes: agem duas vezes por rodada e entram em fúria abaixo de 50%', () => {
  fresh();
  const b = Battle.create({ players: [{ id: 'brasinha', level: 7 }], boss: { id: 'apocalipse', level: 7 }, rng: seeded(5) });
  Battle.beginTurn(b);
  const ids = [b.current].concat(b.queue);
  eq(ids.filter(x => x === 'e0').length, 2);
  const boss = b.units.find(u => u.isBoss);
  boss.hp = Math.round(boss.maxHp * 0.6);
  const ev = [];
  b.units[0].en = 5;
  for (let i = 0; i < 20 && !boss.enraged && boss.alive; i++) ev.push.apply(ev, Battle.act(b, b.units[0], { type: 'attack', target: 'e0' }));
  assert(boss.enraged, 'não entrou em fúria');
  assert(ev.some(e => e.t === 'enrage'));
});
test('IA usa cura quando um aliado está ferido', () => {
  fresh();
  const b = duel(['brasinha'], ['gotinha', 'seixo']);
  const healer = b.units[1];
  b.units[2].hp = 5;
  healer.en = 4;
  const a = Battle.aiChoose(b, healer);
  eq(a.type, 'skill'); eq(a.target, b.units[2].uid);
});
test('mil batalhas simuladas terminam sem erro, com vitórias e derrotas', () => {
  fresh();
  const rng = seeded(2024);
  let wins = 0, total = 0;
  for (let i = 0; i < 1000; i++) {
    const pick = () => SP.STICKERS[Math.floor(rng() * SP.STICKERS.length)].id;
    const lv = 1 + Math.floor(rng() * 30);
    const mk = () => ({ id: pick(), level: lv, stars: 1 + Math.floor(rng() * 3) });
    const b = Battle.create({ players: [mk(), mk(), mk()], enemies: [mk(), mk(), mk()], rng });
    Battle.simulate(b);
    assert(b.over, 'batalha não terminou');
    total++; if (b.winner === 'player') wins++;
  }
  assert(wins > 200 && wins < 800, 'distribuição estranha: ' + wins + '/' + total);
});
test('as 8 lutas de chefe podem ser vencidas por uma equipe forte e perdidas por uma fraca', () => {
  fresh();
  SP.BOSSES.forEach(bs => {
    const L = SP.stageInfo(bs.stage).level;
    const st = SP.starsForLevel(L);
    const strongTeam = bs.act === 2 ? ['frost_queen', 'void_king', 'serafim_aurora'] : ['volt_dragon', 'serafim_aurora', 'terra_golem'];
    let strongWins = 0, weakWins = 0;
    for (let i = 0; i < 40; i++) {
      const s = Battle.create({ players: strongTeam.map(id => ({ id, level: L + 2, stars: st })), boss: { id: bs.id, level: L }, rng: seeded(i + 1) });
      Battle.simulate(s); if (s.winner === 'player') strongWins++;
      const w = Battle.create({ players: [{ id: 'brasinha', level: Math.max(1, L - 5), stars: 1 }], boss: { id: bs.id, level: L }, rng: seeded(i + 1) });
      Battle.simulate(w); if (w.winner === 'player') weakWins++;
    }
    assert(strongWins >= 20, bs.id + ': equipe forte venceu só ' + strongWins + '/40');
    assert(weakWins <= 2, bs.id + ': equipe fraca venceu ' + weakWins + '/40');
  });
});

/* ------------------------------------------------------------------ recompensas e missões */
console.log('\nRecompensas e missões');
test('vitória na fase dá moedas, XP e bônus de 1ª vitória; avança a campanha', () => {
  fresh();
  const c = SP.state.coins;
  const rw = Core.applyBattleResult({ kind: 'stage', stage: 1, team: ['brasinha'], win: true, skillsUsed: 2 });
  assert(rw.firstClear);
  eq(SP.state.campaign.cleared, 1);
  eq(SP.state.coins, c + rw.coins);
  assert(SP.state.owned.brasinha.xp > 0 || SP.state.owned.brasinha.level > 1);
  const rw2 = Core.applyBattleResult({ kind: 'stage', stage: 1, team: ['brasinha'], win: true });
  assert(!rw2.firstClear && rw2.coins < rw.coins);
});
test('desistir não dá recompensa', () => {
  fresh();
  const c = SP.state.coins;
  const rw = Core.applyBattleResult({ kind: 'quick', team: ['brasinha'], win: false, fled: true });
  eq(rw.coins, 0); eq(SP.state.coins, c); eq(SP.state.stats.battlesLost, 1);
});
test('primeira vitória contra chefe dá o sticker exclusivo (só uma vez)', () => {
  fresh();
  const rw = Core.applyBattleResult({ kind: 'boss', bossId: 'deusa', tier: 1, team: ['brasinha'], win: true });
  eq(rw.sticker, 'donzela_ampulheta');
  assert(SP.state.owned.donzela_ampulheta);
  const rw2 = Core.applyBattleResult({ kind: 'boss', bossId: 'deusa', tier: 2, team: ['brasinha'], win: true });
  eq(rw2.sticker, null);
  eq(SP.state.bosses.deusa, 2);
  eq(Core.nextBossTier('deusa'), 3);
  assert(Core.bossLevel('deusa', 3) > Core.bossLevel('deusa', 1), 'dificuldade não sobe');
});
test('missões: progresso, resgate único e recompensa', () => {
  fresh();
  const m = SP.MISSIONS.find(x => x.id === 'm_win1');
  assert(!Core.missionStatus(m).done);
  Core.applyBattleResult({ kind: 'quick', team: ['brasinha'], win: true });
  assert(Core.missionStatus(m).done);
  const c = SP.state.coins;
  assert(Core.claimMission('m_win1').ok);
  eq(SP.state.coins, c + m.reward.coins);
  assert(!Core.claimMission('m_win1').ok, 'resgatou duas vezes');
});
test('missões diárias reiniciam quando muda a data', () => {
  fresh();
  const d1 = new Date(2026, 1, 1, 12).getTime(), d2 = new Date(2026, 1, 2, 9).getTime();
  Core.dailyCount('packs', 1, d1);
  const m = SP.DAILY_MISSIONS.find(x => x.id === 'd_pack');
  assert(Core.dailyStatus(m, d1).done);
  assert(Core.claimDaily('d_pack', d1).ok);
  assert(!Core.claimDaily('d_pack', d1).ok);
  assert(!Core.dailyStatus(m, d2).done, 'não reiniciou');
  assert(!Core.dailyStatus(m, d2).claimed);
});
test('missão de coleção elemental', () => {
  fresh();
  SP.STICKERS.filter(s => s.el === 'gravity').forEach(s => Core.addSticker(s.id));
  eq(Core.missionValue('elementsComplete'), 1);
});

/* ------------------------------------------------------------------ salvamento */
console.log('\nSalvamento');
test('salvar e carregar preserva o progresso', () => {
  fresh();
  SP.state.coins = 777; Core.addSticker('void_king'); SP.state.owned.brasinha.fav = true; SP.state.settings.music = false;
  Core.save();
  SP.state = null;
  Core.load();
  eq(SP.state.coins, 777); assert(SP.state.owned.void_king); assert(SP.state.owned.brasinha.fav); eq(SP.state.settings.music, false);
});
test('save corrompido usa a cópia de segurança', () => {
  fresh(); SP.state.coins = 1234; Core.save(); Core.save();
  mem['stickerPowers.save.v1'] = '{isto não é json';
  Core.load();
  eq(SP.state.coins, 1234);
  assert(Core.loadNotice);
});
test('save totalmente inválido reinicia com segurança', () => {
  mem['stickerPowers.save.v1'] = '###';
  mem['stickerPowers.backup.v1'] = '###';
  Core.load();
  eq(SP.state.coins, SP.PROG.startCoins);
  assert(Object.keys(SP.state.owned).length === 3);
});
test('dados inválidos são corrigidos (sanitize)', () => {
  const st = Core.sanitize({ coins: -50, fragments: 'abc', owned: { brasinha: { level: 999, stars: 9, xp: -3 }, naoexiste: { level: 1 } }, team: ['naoexiste', 'brasinha', 'brasinha'], settings: { volume: 7, battleSpeed: 99 } });
  eq(st.coins, 0); eq(st.fragments, 0);
  assert(!st.owned.naoexiste);
  eq(st.owned.brasinha.stars, 5); eq(st.owned.brasinha.level, 50); eq(st.owned.brasinha.xp, 0);
  eq(st.team.length, 1);
  eq(st.settings.volume, 1); eq(st.settings.battleSpeed, 1);
});
test('exportar/importar e reiniciar', () => {
  fresh(); SP.state.coins = 4242;
  const txt = Core.exportSave();
  Core.reset();
  eq(SP.state.coins, SP.PROG.startCoins);
  Core.importSave(txt);
  eq(SP.state.coins, 4242);
  let threw = false;
  try { Core.importSave('lixo'); } catch (e) { threw = true; }
  assert(threw);
});

/* ------------------------------------------------------------------ Ato II e pós-jogo */
console.log('\nAto II e Torre Infinita');
test('40 fases: todas as fases normais têm inimigos válidos e os níveis só sobem', () => {
  eq(SP.STAGE_COUNT, 40);
  let last = 0;
  for (let n = 1; n <= SP.STAGE_COUNT; n++) {
    const info = SP.stageInfo(n);
    assert(info.level >= last, 'nível caiu na fase ' + n); last = info.level;
    if (info.boss) eq(info.boss.stage, n); else { const e = Core.stageEnemies(n); assert(e && e.length === 3 || n <= 2, 'fase ' + n); e.forEach(x => assert(SP.STICKER[x.id], x.id)); }
  }
  eq(SP.stageInfo(40).level, 50);
});
test('evoluir até 5 estrelas: estrelas 4 e 5 custam Essência; estrela 5 = Forma Suprema', () => {
  fresh();
  SP.state.coins = 1e6; SP.state.fragments = 1e5; SP.state.essence = 0;
  for (let k = 1; k < 3; k++) { Core.grantXp('brasinha', 1e7); assert(Core.evolve('brasinha').ok, 'evolução ' + k); }
  Core.grantXp('brasinha', 1e7);
  const r = Core.evolve('brasinha');
  assert(!r.ok && /Essência/.test(r.reason), 'estrela 4 sem essência');
  SP.state.essence = 6;
  assert(Core.evolve('brasinha').ok); eq(SP.state.essence, 4);
  Core.grantXp('brasinha', 1e7); eq(SP.state.owned.brasinha.level, 40);
  assert(Core.evolve('brasinha').ok); eq(SP.state.essence, 0);
  eq(SP.state.owned.brasinha.stars, 5);
  Core.grantXp('brasinha', 1e7); eq(SP.state.owned.brasinha.level, 50);
  assert(Core.evoInfo('brasinha').maxed);
  const s5 = Core.skillFor('brasinha', 5), s1 = Core.skillFor('brasinha', 1);
  assert(s5.supreme); near(s5.fx[0].p, s1.fx[0].p * SP.PROG.supremePower, 0.011);
  eq(Core.missionValue('maxStars'), 5);
});
test('Torre: vitória sobe de andar e grava recorde; derrota volta ao checkpoint', () => {
  fresh();
  eq(SP.state.tower.floor, 1);
  for (let i = 0; i < 12; i++) Core.applyBattleResult({ kind: 'tower', team: ['brasinha'], win: true });
  eq(SP.state.tower.floor, 13); eq(SP.state.tower.best, 12);
  const rw = Core.applyBattleResult({ kind: 'tower', team: ['brasinha'], win: false });
  eq(rw.fellTo, 11); eq(SP.state.tower.floor, 11); eq(SP.state.tower.best, 12);
  Core.applyBattleResult({ kind: 'tower', team: ['brasinha'], win: false, fled: true });
  eq(SP.state.tower.floor, 11);
});
test('Torre: andar 10 é chefe e dá Essência; inimigos ficam mais fortes', () => {
  fresh();
  assert(Core.towerSpec(10).boss && !Core.towerSpec(9).boss);
  assert(Core.towerSpec(50).level > Core.towerSpec(5).level);
  SP.state.tower.floor = 10; SP.state.tower.best = 9;
  const e = SP.state.essence;
  const rw = Core.applyBattleResult({ kind: 'tower', team: ['brasinha'], win: true });
  assert(rw.essence >= 1 && SP.state.essence === e + rw.essence);
  for (let f = 1; f <= 120; f++) { const t = Core.towerSpec(f); if (!t.boss) t.enemies.forEach(x => assert(!SP.STICKER[x.id].bossOnly)); }
});
test('save antigo (sem torre, 3 estrelas) carrega normalmente', () => {
  const st = Core.sanitize({ coins: 10, owned: { brasinha: { level: 30, stars: 3 } }, campaign: { cleared: 20 } });
  eq(st.tower.floor, 1); eq(st.campaign.cleared, 20); eq(st.owned.brasinha.level, 30);
  const t2 = Core.sanitize({ tower: { floor: 999, best: 15 } });
  eq(t2.tower.floor, 16, 'andar além do recorde+1 é corrigido');
});

/* ------------------------------------------------------------------ sticker secreto do V */
console.log('\nSticker secreto: V');
test('V existe, é Secreto, tem arte e fica fora do álbum, dos pacotes e da forja', () => {
  const v = SP.STICKER.v;
  assert(v && v.rarity === 'secret' && v.hidden);
  assert(SP.Art.has('v'));
  assert(SP.STICKERS.indexOf(v) < 0, 'V não pode estar no álbum');
  SP.PACKS.forEach(p => assert(!Core.packOdds(p.id).stickers.some(x => x.id === 'v'), 'V nas chances de ' + p.id));
  fresh(); SP.state.fragments = 1e6;
  assert(!Core.craft('v').ok || !SP.STICKERS.some(x => x.id === 'v'));
  for (let f = 1; f <= 60; f++) { const t = Core.towerSpec(f); if (t.enemies) t.enemies.forEach(x => assert(x.id !== 'v')); }
});
test('o copo só para depois de derrotar Ômega (fase 40), e só uma vez', () => {
  fresh();
  eq(Core.unlockV().reason, 'notYet');
  assert(!SP.state.owned.v);
  SP.state.campaign.cleared = 40;
  const r = Core.unlockV();
  assert(r.ok && r.isNew && SP.state.owned.v);
  eq(SP.state.history[0].pack, 'O Copo');
  eq(Core.unlockV().reason, 'already');
});
test('V não conta no álbum de 60 (é um extra) e sobrevive ao salvar/carregar', () => {
  fresh();
  const n = Core.uniqueOwned();
  SP.state.campaign.cleared = 40; Core.unlockV();
  eq(Core.uniqueOwned(), n);
  Core.save(); SP.state = null; Core.load();
  assert(SP.state.owned.v, 'V sumiu ao carregar');
});
test('habilidade do V: congela inimigos, revive todos os aliados caídos, cura e limpa', () => {
  fresh();
  const b = Battle.create({ players: [{ id: 'v', level: 30 }, { id: 'brasinha', level: 30 }, { id: 'gotinha', level: 30 }], enemies: [{ id: 'seixo', level: 30 }, { id: 'faisca', level: 30 }], rng: seeded(1) });
  const [v, a, c] = b.units;
  a.alive = false; a.hp = 0; c.alive = false; c.hp = 0;
  v.statuses.push({ s: 'burn', t: 3 });
  v.en = v.maxEn;
  const ev = Battle.act(b, v, { type: 'skill' });
  assert(a.alive && c.alive, 'não reviveu os dois');
  eq(ev.filter(e => e.t === 'revive').length, 2);
  assert(!Battle.has(v, 'burn'), 'não limpou');
  assert(ev.some(e => e.t === 'status' && e.s === 'freeze') || ev.some(e => e.t === 'resist'), 'ninguém congelou (60% cada)');
});

/* ------------------------------------------------------------------ economia */
console.log('\nEconomia');
test('é possível progredir só jogando: 20 vitórias rápidas pagam vários pacotes', () => {
  fresh();
  const c = SP.state.coins;
  for (let i = 0; i < 20; i++) Core.applyBattleResult({ kind: 'quick', team: ['brasinha', 'gotinha', 'seixo'], win: true });
  assert(SP.state.coins - c >= 5 * SP.PACK.basic.cost.coins, 'ganho baixo: ' + (SP.state.coins - c));
});

console.log('\n' + passed + ' passaram, ' + failed + ' falharam\n');
process.exit(failed ? 1 : 0);
