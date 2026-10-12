/* =========================================================================
   STICKER POWERS — hub de batalhas (campanha, chefes, rápida), seleção de
   equipe, apresentação de chefes e a tela de combate animada.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP, UI = SP.UI, Core = SP.Core, Art = SP.Art, Battle = SP.Battle;

  /* ---------------------------------------------------------------- HUB */
  UI.screens.battles = function (el, params) {
    const tab = params.tab || 'campaign';
    el.innerHTML = `<div class="wrap">
      <div class="tabs">
        <button class="tab ${tab === 'campaign' ? 'on' : ''}" data-t="campaign">🗺️ Campanha</button>
        <button class="tab ${tab === 'bosses' ? 'on' : ''}" data-t="bosses">👑 Chefes</button>
        <button class="tab ${tab === 'quick' ? 'on' : ''}" data-t="quick">⚡ Batalha Rápida</button>
      </div><div id="tabBody"></div></div>`;
    UI.$$('.tab', el).forEach(t => t.addEventListener('click', () => { UI.sfx('click'); UI.currentParams = { tab: t.dataset.t }; UI.render('battles', { tab: t.dataset.t }); }));
    const body = UI.$('#tabBody', el);
    if (tab === 'campaign') campaign(body);
    else if (tab === 'bosses') bosses(body);
    else quick(body);
  };

  function campaign(body) {
    const cleared = SP.state.campaign.cleared;
    body.innerHTML = SP.REGIONS.map(r => `<div class="region" style="background:linear-gradient(135deg, ${r.bg[0]}, ${r.bg[1]})">
      <h4>${UI.esc(r.name)} <span class="small-txt muted">· Fases ${r.stages[0]}–${r.stages[1]}</span></h4>
      <div class="stage-path">${range(r.stages[0], r.stages[1]).map(n => {
        const info = SP.stageInfo(n);
        const st = n <= cleared ? 'cleared' : n === cleared + 1 ? 'next' : 'locked';
        if (info.boss) return `<div class="stage-node boss ${st}" data-n="${n}" title="${UI.esc(info.boss.name)}">${Art.boss(info.boss.id)}<span class="lvl">CHEFE Nv${info.level}</span></div>`;
        return `<div class="stage-node ${st}" data-n="${n}">${st === 'cleared' ? '✓' : n}<span class="lvl">Nv ${info.enemyLevel}</span></div>`;
      }).join('')}</div></div>`).join('') +
      `<p class="small-txt muted">Fases vencidas podem ser repetidas para ganhar moedas, XP e fragmentos. A primeira vitória em cada fase dá um bônus.</p>`;
    UI.$$('.stage-node', body).forEach(n => n.addEventListener('click', () => {
      const k = +n.dataset.n;
      if (k > cleared + 1) { UI.sfx('error'); UI.toast('Vença a fase ' + (cleared + 1) + ' primeiro.', 'bad'); return; }
      UI.sfx('click');
      UI.openStage(k);
    }));
  }
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  function bosses(body) {
    body.innerHTML = `<div class="boss-list">${SP.BOSSES.map(b => {
      const un = Core.bossUnlocked(b.id);
      const tier = Core.nextBossTier(b.id);
      const best = SP.state.bosses[b.id] || 0;
      const rw = SP.bossTierRewards(tier);
      const owned = SP.state.owned[b.reward];
      return `<div class="panel boss-card ${un ? '' : 'locked'}" data-b="${b.id}">
        <div class="b-art">${Art.boss(b.id)}</div>
        <div class="b-info"><b style="font-size:17px">${UI.esc(b.name)}</b> <span class="badge">${Art.elementIcon(b.el, 13)} ${UI.elName(b.el)}</span>
        <div class="small-txt muted">${UI.esc(b.title)}</div>
        ${un ? `<div class="small-txt" style="margin-top:6px">Próximo desafio: <b>Nível ${tier}</b> (inimigo Nv ${Core.bossLevel(b.id, tier)}) · Melhor: ${best ? 'nível ' + best : 'nunca vencido'}</div>
          <div class="small-txt" style="color:var(--gold);margin-top:4px">Recompensa: ${Core.rewardText(rw)}${tier >= 2 ? ' · 1× Pacote Premium' : ''}</div>
          <div class="small-txt" style="margin-top:4px">${owned ? '✓ Sticker exclusivo obtido: ' + UI.esc(SP.STICKER[b.reward].name) : '🎁 1ª vitória: sticker exclusivo <b>' + UI.rarityName(SP.STICKER[b.reward].rarity) + '</b>!'}</div>`
          : `<div class="small-txt" style="margin-top:6px">🔒 Alcance a fase ${b.stage} da campanha.</div>`}
        </div></div>`;
    }).join('')}</div>`;
    UI.$$('.boss-card', body).forEach(c => c.addEventListener('click', () => {
      const id = c.dataset.b;
      if (!Core.bossUnlocked(id)) { UI.sfx('error'); UI.toast('Alcance a fase ' + SP.BOSS[id].stage + ' da campanha para enfrentar este chefe.', 'bad'); return; }
      UI.sfx('click');
      const tier = Core.nextBossTier(id);
      UI.bossIntro(id, Core.bossLevel(id, tier), () => UI.go('team', { kind: 'boss', bossId: id, tier }));
    }));
  }

  function quick(body) {
    const lvl = Core.teamPowerLevel(SP.state.team);
    body.innerHTML = `<div class="panel" style="text-align:center;max-width:560px;margin:0 auto">
      <h3 style="font-family:var(--font-display)">Batalha Rápida</h3>
      <p class="muted">Oponentes aleatórios no nível da sua equipe (Nv ~${lvl}). Ótimo para treinar seus stickers e juntar moedas.</p>
      <p class="small-txt" style="color:var(--gold)">Recompensa por vitória: ~${50 + lvl * 8} moedas · ${3 + Math.floor(lvl / 2)} fragmentos · ${20 + lvl * 5} XP</p>
      <button class="btn big" id="qGo">Encontrar oponentes</button></div>`;
    UI.$('#qGo', body).addEventListener('click', () => {
      UI.sfx('click');
      UI.go('team', { kind: 'quick', enemies: Core.quickEnemies(SP.state.team) });
    });
  }

  /* ---------------------------------------------------------------- prévia de fase */
  UI.openStage = function (n) {
    const info = SP.stageInfo(n);
    const first = n > SP.state.campaign.cleared;
    if (info.boss) {
      UI.bossIntro(info.boss.id, info.level, () => UI.go('team', { kind: 'stage', stage: n }));
      return;
    }
    const enemies = Core.stageEnemies(n);
    const m = UI.modal(`<h3>Fase ${n} — ${UI.esc(info.region.name)}</h3>
      <p class="muted small-txt">Inimigos nível ${info.enemyLevel}${info.stars > 1 ? ' · ' + info.stars + ' estrelas' : ''}</p>
      <div class="vs-preview">${enemies.map(e => enemyMini(e)).join('')}</div>
      <div class="panel small-txt" style="margin-top:12px">
        <div>Vitória: <b style="color:var(--gold)">${info.coins} moedas · ${info.frags} fragmentos · ${info.xp} XP</b> para cada sticker da equipe</div>
        ${first ? `<div style="margin-top:4px">Bônus da 1ª vitória: <b style="color:#ffe14d">+${info.firstCoins} moedas · +${info.firstFrags} fragmentos</b></div>` : '<div class="muted" style="margin-top:4px">Fase já vencida (sem bônus de 1ª vitória).</div>'}
      </div>
      <div class="row center" style="margin-top:14px"><button class="btn big" id="stGo">Escolher equipe</button></div>`, { cls: 'narrow' });
    UI.$('#stGo', m).addEventListener('click', () => { UI.sfx('click'); m.close(); UI.go('team', { kind: 'stage', stage: n }); });
  };
  function enemyMini(e) {
    const s = SP.STICKER[e.id];
    return `<div style="text-align:center;width:96px"><div style="width:84px;height:84px;margin:0 auto;border-radius:14px;overflow:hidden;border:3px solid ${SP.RARITY[s.rarity].color}">${Art.sticker(e.id)}</div>
      <div class="small-txt" style="font-weight:800;margin-top:4px">${UI.esc(s.name)}</div><div class="small-txt muted">${Art.elementIcon(s.el, 12)} Nv ${e.level}</div></div>`;
  }

  /* ---------------------------------------------------------------- apresentação de chefe */
  UI.bossIntro = function (bossId, level, onGo) {
    const b = SP.BOSS[bossId];
    const ov = document.createElement('div');
    ov.className = 'boss-intro';
    const weak = SP.ELEMENTS.filter(e => e.strong.indexOf(b.el) >= 0);
    ov.innerHTML = `<div class="bi-art">${Art.boss(bossId)}</div><div class="bi-bar top"></div><div class="bi-bar bot"></div>
      <div class="bi-text"><div class="bi-warn">⚠ ALERTA DE CHEFE ⚠</div>
        <div class="bi-name">${UI.esc(b.name)}</div><div class="bi-title">${UI.esc(b.title)} · Nível ${level}</div>
        <p>${UI.esc(b.intro)}</p>
        <p class="small-txt" style="color:#ffe14d">${UI.esc(b.tip)}</p>
        <div class="matchup" style="justify-content:center;margin:8px 0">${Art.elementIcon(b.el, 18)} <b>${UI.elName(b.el)}</b> · Fraco contra: ${weak.map(e => `<span class="tag good">${Art.elementIcon(e.id, 13)} ${e.name}</span>`).join('')}</div>
        <p class="small-txt muted">Age 2 vezes por rodada e fica furioso abaixo de 50% de vida.</p>
        <div class="row center" style="margin-top:12px"><button class="btn ghost" id="biNo">Voltar</button><button class="btn red big" id="biGo">Enfrentar!</button></div></div>`;
    document.body.appendChild(ov);
    SP.Audio.music('boss');
    UI.sfx('boss');
    SP.FX.flash('#ff2e7e', 700);
    UI.$('#biNo', ov).addEventListener('click', () => { UI.sfx('click'); ov.remove(); SP.Audio.music('menu'); });
    UI.$('#biGo', ov).addEventListener('click', () => { UI.sfx('click'); ov.remove(); onGo(); });
  };

  /* ---------------------------------------------------------------- seleção de equipe */
  function enemySpecs(cfg) {
    if (cfg.kind === 'stage') {
      const info = SP.stageInfo(cfg.stage);
      if (info.boss) return { boss: { id: info.boss.id, level: info.level } };
      return { enemies: Core.stageEnemies(cfg.stage) };
    }
    if (cfg.kind === 'boss') return { boss: { id: cfg.bossId, level: Core.bossLevel(cfg.bossId, cfg.tier) } };
    return { enemies: cfg.enemies };
  }

  UI.screens.team = function (el, cfg) {
    const st = SP.state;
    let team = st.team.filter(id => st.owned[id]).slice(0, 3);
    const foes = enemySpecs(cfg);
    const foeEls = foes.boss ? [SP.BOSS[foes.boss.id].el] : foes.enemies.map(e => SP.STICKER[e.id].el);
    const title = cfg.kind === 'stage' ? 'Fase ' + cfg.stage : cfg.kind === 'boss' ? SP.BOSS[cfg.bossId].name + ' (nível ' + cfg.tier + ')' : 'Batalha Rápida';
    el.innerHTML = `<div class="wrap">
      <div class="panel" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><b>Adversário: ${UI.esc(title)}</b>
        <span class="small-txt muted">Elementos inimigos: ${foeEls.map(e => Art.elementIcon(e, 16)).join(' ')}</span></div>
        <div class="vs-preview" style="margin-top:8px">${foes.boss ? `<div style="width:120px;height:120px;border-radius:16px;overflow:hidden;border:3px solid #ff2e7e">${Art.boss(foes.boss.id)}</div>` : foes.enemies.map(enemyMini).join('')}</div></div>
      <h2 class="section">Sua equipe (até 3)</h2>
      <div class="team-slots" id="slots"></div>
      <p class="small-txt muted center" style="text-align:center">▲ = vantagem elemental contra algum inimigo · ▼ = desvantagem</p>
      <div class="card-grid pick-grid" id="pick"></div>
      <div class="sticky-bar"><span id="teamPow" class="small-txt"></span><div class="row"><button class="btn ghost small" id="autoPick">Escolha automática</button><button class="btn big red" id="fight">⚔ Batalhar!</button></div></div>
    </div>`;
    const owned = Object.keys(st.owned).sort((a, b) => Core.ownedPower(b) - Core.ownedPower(a));
    const adv = id => {
      const e = SP.STICKER[id].el;
      const good = foeEls.some(f => SP.elementMult(e, f) > 1);
      const bad = foeEls.some(f => SP.elementMult(f, e) > 1);
      return good && !bad ? '<b style="color:#3ddc84">▲</b>' : bad && !good ? '<b style="color:#ff4b6b">▼</b>' : good && bad ? '<b style="color:#ffe14d">▲▼</b>' : '';
    };
    const draw = () => {
      UI.$('#slots', el).innerHTML = [0, 1, 2].map(i => team[i] ? UI.card(team[i], { showCount: false }) : `<div class="team-slot">Vaga ${i + 1}<br>vazia</div>`).join('');
      UI.$('#pick', el).innerHTML = owned.map(id => `<div style="position:relative;width:100%;display:flex;flex-direction:column;align-items:center">${UI.card(id, { cls: team.indexOf(id) >= 0 ? 'picked' : '', showCount: false })}<div class="small-txt">Poder ${Core.ownedPower(id)} ${adv(id)}</div></div>`).join('');
      UI.$('#teamPow', el).innerHTML = 'Poder da equipe: <b>' + team.reduce((a, id) => a + Core.ownedPower(id), 0) + '</b>';
      UI.$('#fight', el).disabled = !team.length;
    };
    draw();
    UI.$('#pick', el).addEventListener('click', e => {
      const c = e.target.closest('.card');
      if (!c) return;
      const id = c.dataset.id;
      const i = team.indexOf(id);
      if (i >= 0) team.splice(i, 1);
      else if (team.length < 3) team.push(id);
      else { UI.sfx('error'); UI.toast('A equipe já tem 3 stickers. Toque em um escolhido para removê-lo.'); return; }
      UI.sfx('click');
      draw();
    });
    UI.$('#slots', el).addEventListener('click', e => {
      const c = e.target.closest('.card');
      if (!c) return;
      team.splice(team.indexOf(c.dataset.id), 1); UI.sfx('click'); draw();
    });
    UI.$('#autoPick', el).addEventListener('click', () => {
      UI.sfx('click');
      const score = id => Core.ownedPower(id) * (1 + foeEls.reduce((a, f) => a + (SP.elementMult(SP.STICKER[id].el, f) - 1) * 0.4 - (SP.elementMult(f, SP.STICKER[id].el) - 1) * 0.3, 0));
      team = owned.slice().sort((a, b) => score(b) - score(a)).slice(0, 3);
      draw();
    });
    UI.$('#fight', el).addEventListener('click', () => {
      if (!team.length) return;
      UI.sfx('click');
      st.team = team.slice();
      UI.changed();
      UI.go('battle', Object.assign({}, cfg, { team: team.slice() }));
    });
  };

  /* ---------------------------------------------------------------- COMBATE */
  const BT = UI.Battle = { active: false };

  UI.screens.battle = function (el, cfg) {
    el.style.padding = '0';
    el.style.overflow = 'hidden';
    const foes = enemySpecs(cfg);
    const players = cfg.team.filter(id => SP.state.owned[id]).map(id => ({ id, level: SP.state.owned[id].level, stars: SP.state.owned[id].stars }));
    const b = Battle.create(Object.assign({ players }, foes));
    const token = {};
    Object.assign(BT, { active: true, b, cfg, el, token, waiting: null });
    const region = cfg.kind === 'stage' ? SP.stageInfo(cfg.stage).region : SP.REGIONS[(cfg.tier || 1) % SP.REGIONS.length];
    const bossCol = foes.boss ? SP.ELEMENT[SP.BOSS[foes.boss.id].el].c1 : null;
    el.innerHTML = `<div class="battle">
      <div class="battle-bg" style="background:radial-gradient(ellipse at 50% 20%, ${bossCol || region.bg[1]}66, transparent 60%), linear-gradient(180deg, ${region.bg[0]}, #05020c 55%, ${region.bg[0]})"></div>
      <div class="battle-top">
        <span class="round-badge" id="rnd">Rodada 1</span>
        <div class="timeline" id="tl"></div>
        <button class="icon-btn speed-btn" id="spd" title="Velocidade">${SP.state.settings.battleSpeed}×</button>
        <button class="icon-btn speed-btn ${SP.state.settings.autoBattle ? 'on' : ''}" id="auto" title="Batalha automática">AUTO</button>
      </div>
      <div class="field" id="field">
        <div class="side" id="sideE">${b.units.filter(u => u.side === 'enemy').map(unitHTML).join('')}</div>
        <div class="side" id="sideP">${b.units.filter(u => u.side === 'player').map(unitHTML).join('')}</div>
      </div>
      <div class="controls" id="ctl"><div class="who" id="who">Preparando batalha...</div>
        <div class="act-row">
          <button class="act-btn atk" id="aAtk" disabled>Atacar<small>+1 energia</small></button>
          <button class="act-btn skl" id="aSkl" disabled>Habilidade<small>&nbsp;</small></button>
          <button class="act-btn def" id="aDef" disabled>Defender<small>−50% dano · +1 energia</small></button>
        </div>
        <div class="battle-log" id="log">&nbsp;</div></div>
    </div>`;
    SP.Audio.music(foes.boss ? 'boss' : 'battle');
    UI.$('#spd', el).addEventListener('click', e => {
      const s = SP.state.settings;
      s.battleSpeed = s.battleSpeed >= 3 ? 1 : s.battleSpeed + 1;
      e.currentTarget.textContent = s.battleSpeed + '×';
      UI.changed();
    });
    UI.$('#auto', el).addEventListener('click', e => {
      const s = SP.state.settings;
      s.autoBattle = !s.autoBattle;
      e.currentTarget.classList.toggle('on', s.autoBattle);
      UI.changed();
      if (s.autoBattle && BT.waiting) BT.waiting('auto');
    });
    UI.$('#aAtk', el).addEventListener('click', () => chooseAction('attack'));
    UI.$('#aSkl', el).addEventListener('click', () => chooseAction('skill'));
    UI.$('#aDef', el).addEventListener('click', () => chooseAction('defend'));
    UI.$('#field', el).addEventListener('click', e => {
      const u = e.target.closest('.unit.targetable');
      if (u && BT.pickTarget) BT.pickTarget(u.dataset.uid);
      else if (BT.pickTarget && !e.target.closest('.unit')) cancelTargeting();
    });
    loop(token);
  };

  function unitHTML(u) {
    const art = u.isBoss ? Art.boss(u.id) : Art.sticker(u.id);
    const rc = u.isBoss ? '#ff2e7e' : SP.RARITY[u.rarity].color;
    return `<div class="unit ${u.isBoss ? 'boss' : ''}" data-uid="${u.uid}" style="--rc:${rc}">
      <div class="sts"></div>
      <div class="u-art">${art}</div>
      <div class="u-name">${Art.elementIcon(u.el, 12)} ${UI.esc(u.name)}</div>
      <div class="hp"><b></b><i></i><span></span></div>
      <div class="en"></div>
      <div class="u-lvl">Nv ${u.level} ${'★'.repeat(u.stars)}</div>
    </div>`;
  }
  const uel = uid => BT.el && BT.el.querySelector(`.unit[data-uid="${uid}"]`);

  function drawUnit(u, hpOverride) {
    const e = uel(u.uid);
    if (!e) return;
    const hp = hpOverride != null ? hpOverride : u.hp;
    const pct = Math.max(0, hp / u.maxHp * 100);
    const i = e.querySelector('.hp i');
    i.style.width = pct + '%';
    i.className = pct < 25 ? 'low' : pct < 50 ? 'mid' : '';
    e.querySelector('.hp b').style.width = Math.min(100, (hp + u.shield) / u.maxHp * 100) + '%';
    e.querySelector('.hp span').textContent = hp + (u.shield ? ' +' + u.shield : '') + ' / ' + u.maxHp;
    e.querySelector('.en').innerHTML = Array.from({ length: u.maxEn }, (_, k) => `<i class="${k < u.en ? 'on' : ''}"></i>`).join('');
    e.querySelector('.sts').innerHTML = u.statuses.map(s => {
      const inf = SP.STATUS_INFO[s.s];
      return `<span class="${inf.bad ? 'bad' : ''}" title="${inf.name}: ${inf.desc}">${inf.icon}${s.s === 'poison' ? s.v : ''}</span>`;
    }).join('');
    e.classList.toggle('dead', !u.alive);
    e.classList.toggle('frozen', u.alive && Battle.has(u, 'freeze'));
    e.classList.toggle('burning', u.alive && Battle.has(u, 'burn'));
    e.classList.toggle('enraged', !!u.enraged);
  }
  function drawAll() { BT.b.units.forEach(u => drawUnit(u)); drawTimeline(); }
  function drawTimeline() {
    const b = BT.b;
    const ids = (b.current ? [b.current] : []).concat(b.queue).filter(id => { const u = Battle.unit(b, id); return u && u.alive; }).slice(0, 9);
    UI.$('#tl', BT.el).innerHTML = ids.map((id, k) => {
      const u = Battle.unit(b, id);
      return `<div class="tl-item ${u.side} ${k === 0 ? 'current' : ''}" title="${UI.esc(u.name)}">${u.isBoss ? Art.boss(u.id) : Art.sticker(u.id)}</div>`;
    }).join('');
    UI.$('#rnd', BT.el).textContent = 'Rodada ' + Math.max(1, b.round);
  }
  const spd = () => SP.state.settings.battleSpeed || 1;
  const wait = ms => UI.sleep(ms / spd());
  const log = t => { const l = UI.$('#log', BT.el); if (l) l.textContent = t; };

  async function loop(token) {
    const b = BT.b;
    drawAll();
    await wait(500);
    while (!b.over && BT.token === token) {
      const t = Battle.beginTurn(b);
      await play(t.events, token);
      if (BT.token !== token) return;
      if (b.over || !t.canAct) continue;
      const actor = t.actor;
      UI.$$('.unit', BT.el).forEach(x => x.classList.toggle('active', x.dataset.uid === actor.uid));
      drawTimeline();
      let action;
      if (actor.side === 'player' && !SP.state.settings.autoBattle) {
        action = await askPlayer(actor);
        if (BT.token !== token) return;
        if (action === 'auto') action = Battle.aiChoose(b, actor);
      } else {
        setControls(null, actor);
        await wait(actor.side === 'enemy' ? 520 : 300);
        action = Battle.aiChoose(b, actor);
      }
      const ev = Battle.act(b, actor, action);
      await play(ev, token);
    }
    if (BT.token === token) finish();
  }

  /* entrada do jogador */
  function setControls(actor, other) {
    const who = UI.$('#who', BT.el);
    const atk = UI.$('#aAtk', BT.el), skl = UI.$('#aSkl', BT.el), def = UI.$('#aDef', BT.el);
    [atk, skl, def].forEach(x => x.classList.remove('sel'));
    if (!actor) {
      atk.disabled = skl.disabled = def.disabled = true;
      who.innerHTML = other ? `Vez de <b>${UI.esc(other.name)}</b>${other.side === 'enemy' ? ' (inimigo)' : ' (automático)'}` : '&nbsp;';
      return;
    }
    const sk = actor.skill;
    atk.disabled = def.disabled = false;
    skl.disabled = actor.en < sk.cost;
    skl.innerHTML = `${UI.esc(sk.name)}<small>${sk.cost} energia${actor.en < sk.cost ? ' (faltam ' + (sk.cost - actor.en) + ')' : ''}</small>`;
    who.innerHTML = `<span>Vez de <b>${UI.esc(actor.name)}</b> · energia ${actor.en}/${actor.maxEn}</span><span class="muted">${UI.esc(SP.STICKER[actor.id].skill.desc)}</span>`;
  }
  function askPlayer(actor) {
    setControls(actor);
    return new Promise(resolve => {
      BT.waiting = v => { BT.waiting = null; cancelTargeting(); setControls(null, actor); resolve(v); };
      BT.actor = actor;
    });
  }
  function cancelTargeting() {
    BT.pickTarget = null;
    UI.$$('.unit', BT.el).forEach(x => x.classList.remove('targetable', 'ally-t'));
    UI.$$('.act-btn', BT.el).forEach(x => x.classList.remove('sel'));
  }
  function chooseAction(type) {
    if (!BT.waiting) return;
    const actor = BT.actor, b = BT.b;
    UI.sfx('click');
    cancelTargeting();
    if (type === 'defend') { BT.waiting({ type: 'defend' }); return; }
    if (type === 'skill' && actor.en < actor.skill.cost) { UI.sfx('error'); return; }
    const needs = type === 'attack' || Battle.skillNeedsTarget(actor.skill);
    if (!needs) { BT.waiting({ type: 'skill' }); return; }
    const targets = Battle.validTargets(b, actor, type);
    if (targets.length === 1 && type === 'attack') { BT.waiting({ type, target: targets[0].uid }); return; }
    UI.$(type === 'attack' ? '#aAtk' : '#aSkl', BT.el).classList.add('sel');
    const ally = type === 'skill' && actor.skill.target === 'ally';
    targets.forEach(t => { const e = uel(t.uid); e.classList.add('targetable'); if (ally) e.classList.add('ally-t'); });
    UI.$('#who', BT.el).innerHTML = `<b>Escolha ${ally ? 'um aliado' : 'um alvo'}</b> <span class="muted">(toque fora para cancelar)</span>`;
    BT.pickTarget = uid => { BT.pickTarget = null; BT.waiting({ type, target: uid }); };
  }

  UI.Battle.confirmFlee = function () {
    UI.confirm('Desistir desta batalha? Ela contará como derrota e você não receberá recompensas.', () => {
      const cfg = BT.cfg;
      BT.token = null; BT.active = false;
      if (BT.waiting) BT.waiting = null;
      Core.applyBattleResult({ kind: cfg.kind, stage: cfg.stage, bossId: cfg.bossId, tier: cfg.tier, team: cfg.team, win: false, fled: true, skillsUsed: BT.b.stats.skillsUsed, advantageHits: BT.b.stats.advantageHits });
      UI.changed();
      SP.FX.clear();
      UI.back();
    }, { title: 'Desistir?', yes: 'Desistir', danger: true });
  };

  /* animação dos eventos */
  const SKIP_TXT = { freeze: 'Congelado!', stun: 'Atordoado!' };
  async function play(events, token) {
    const b = BT.b;
    for (const e of events) {
      if (BT.token !== token) return;
      const u = e.u ? Battle.unit(b, e.u) : null;
      const node = e.u ? uel(e.u) : null;
      switch (e.t) {
        case 'round': drawTimeline(); break;
        case 'turn':
          UI.$$('.unit', BT.el).forEach(x => x.classList.toggle('active', x.dataset.uid === e.u));
          drawTimeline();
          break;
        case 'action': {
          const actor = Battle.unit(b, e.u);
          const an = uel(e.u);
          if (an) { an.classList.remove('lunge-up', 'lunge-down'); void an.offsetWidth; an.classList.add(actor.side === 'player' ? 'lunge-up' : 'lunge-down'); }
          if (e.kind !== 'attack') {
            const bn = document.createElement('div');
            bn.className = 'action-name';
            bn.style.setProperty('--ac', SP.ELEMENT[e.el].c1);
            bn.textContent = e.name;
            UI.$('#field', BT.el).appendChild(bn);
            setTimeout(() => bn.remove(), 1000);
          }
          log((actor.side === 'enemy' ? '🔴 ' : '🔵 ') + actor.name + ' usou ' + e.name + (e.targets.length === 1 && e.targets[0] !== e.u ? ' em ' + Battle.unit(b, e.targets[0]).name : ''));
          if (e.kind === 'skill' || e.kind === 'boss') {
            UI.sfx('skill', e.el);
            e.targets.forEach(t => SP.FX.at(uel(t), { style: e.el, count: 34, speed: 300, size: 7 }));
            if (e.kind === 'boss' && e.target === 'allEnemies') { SP.FX.flash(SP.ELEMENT[e.el].c1, 400); SP.FX.shake(UI.$('#sideP', BT.el), true); }
            await wait(e.kind === 'boss' ? 650 : 520);
          } else if (e.kind === 'defend') {
            UI.sfx('shield');
            SP.FX.ringAt(an, '#4ff0ff', { r1: 90 });
            await wait(380);
          } else {
            await wait(260);
          }
          break;
        }
        case 'damage': {
          if (!node) break;
          node.classList.remove('hit'); void node.offsetWidth; node.classList.add('hit');
          const cls = e.crit ? 'crit' : e.mult > 1 ? 'strong' : e.mult < 1 ? 'weak' : '';
          const txt = '-' + e.amount + (e.crit ? '!' : '');
          SP.FX.float(node, txt, cls);
          if (e.absorbed) SP.FX.float(node, '🛡 ' + e.absorbed, 'shield');
          if (e.mult > 1 && !e.reflect) SP.FX.float(node, 'Super eficaz!', 'info');
          else if (e.mult < 1 && !e.reflect) SP.FX.float(node, 'Pouco eficaz', 'weak');
          if (e.reflect) SP.FX.float(node, 'Refletido!', 'info');
          UI.sfx(e.crit ? 'crit' : 'hit');
          SP.FX.at(node, { style: e.el || 'plasma', count: e.crit ? 26 : 12, speed: 220, size: 6 });
          if (e.crit || e.amount > u.maxHp * 0.25) SP.FX.shake(node, true);
          drawUnit(u, e.hp);
          await wait(e.crit ? 380 : 240);
          break;
        }
        case 'dot':
          SP.FX.float(node, (e.kind === 'burn' ? '🔥 -' : '☠️ -') + e.amount, 'strong');
          SP.FX.at(node, { style: e.kind === 'burn' ? 'fire' : 'poison', count: 14, speed: 140 });
          UI.sfx('debuff');
          drawUnit(u, e.hp);
          await wait(330);
          break;
        case 'heal':
          if (e.amount <= 0) break;
          SP.FX.float(node, '+' + e.amount, 'heal');
          SP.FX.at(node, { style: 'heal', count: 14, speed: 120 });
          UI.sfx('heal');
          drawUnit(u, e.hp);
          await wait(220);
          break;
        case 'shield':
          if (e.amount > 0) { SP.FX.float(node, '+' + e.amount + ' escudo', 'shield'); SP.FX.ringAt(node, '#9cc6ff', { r1: 80 }); UI.sfx('shield'); }
          drawUnit(u);
          await wait(220);
          break;
        case 'dodge':
          SP.FX.float(node, 'Esquivou!', 'info');
          UI.sfx('dodge');
          if (node) { node.style.transition = 'transform .15s'; node.style.transform = 'translateX(26px)'; setTimeout(() => { node.style.transform = ''; }, 220); }
          await wait(300);
          break;
        case 'status':
          if (e.add) {
            const inf = SP.STATUS_INFO[e.s];
            if (e.s !== 'guard') { SP.FX.float(node, inf.icon + ' ' + inf.name, inf.bad ? 'weak' : 'heal'); UI.sfx(inf.bad ? 'debuff' : 'shield'); }
            if (e.s === 'freeze') SP.FX.at(node, { style: 'ice', count: 20, speed: 160 });
            await wait(170);
          }
          if (u) drawUnit(u, u.alive ? undefined : 0);
          break;
        case 'resist':
          SP.FX.float(node, 'Resistiu!', 'info');
          await wait(200);
          break;
        case 'skip':
          SP.FX.float(node, SKIP_TXT[e.reason] || 'Perdeu a vez', 'info');
          log(u.name + ' perdeu a vez (' + (SKIP_TXT[e.reason] || '') + ')');
          await wait(520);
          break;
        case 'energy': if (u) drawUnit(u); break;
        case 'death':
          drawUnit(u, 0);
          UI.sfx('death');
          SP.FX.at(node, { style: 'dark', count: 30, speed: 200 });
          log('💀 ' + u.name + ' foi derrotado!');
          await wait(450);
          break;
        case 'revive':
          drawUnit(u, e.hp);
          SP.FX.at(node, { style: 'light', count: 40, speed: 260 });
          SP.FX.float(node, 'Reviveu!', 'heal');
          UI.sfx('heal');
          await wait(450);
          break;
        case 'haste': SP.FX.float(node, '⏩ Age de novo!', 'info'); SP.FX.at(node, { style: 'time', count: 14 }); await wait(260); break;
        case 'delay': SP.FX.float(node, '⏪ Atrasado!', 'weak'); await wait(200); break;
        case 'enrage':
          SP.FX.flash('#ff0040', 700);
          SP.FX.shake(UI.$('#field', BT.el), true);
          UI.sfx('boss');
          drawUnit(u);
          await wait(700);
          break;
        case 'log': log(e.text); if (/FÚRIA DA ARENA/.test(e.text)) { SP.FX.flash('#ff8a1f', 400); await wait(500); } break;
      }
    }
    if (BT.token === token) drawAll();
  }

  /* fim da batalha e recompensas */
  function finish() {
    const b = BT.b, cfg = BT.cfg;
    BT.active = false;
    const win = b.winner === 'player';
    const rw = Core.applyBattleResult({ kind: cfg.kind, stage: cfg.stage, bossId: cfg.bossId, tier: cfg.tier, team: cfg.team, win, skillsUsed: b.stats.skillsUsed, advantageHits: b.stats.advantageHits });
    UI.changed();
    const isBoss = cfg.kind === 'boss' || (cfg.kind === 'stage' && SP.stageInfo(cfg.stage).boss);
    if (win) {
      UI.sfx('victory');
      SP.FX.burst(innerWidth / 2, innerHeight * 0.3, { style: 'confetti', count: 120, speed: 520, life: 1.6 });
      if (isBoss) { SP.FX.flash('#ffe14d', 800); setTimeout(() => SP.FX.burst(innerWidth / 2, innerHeight * 0.4, { style: 'light', count: 100, speed: 600, life: 1.6 }), 300); }
    } else UI.sfx('defeat');
    const items = [];
    if (rw.coins) items.push(`${Art.icon('coin', 22)} +${rw.coins}`);
    if (rw.fragments) items.push(`${Art.icon('frag', 22)} +${rw.fragments}`);
    if (rw.essence) items.push(`${Art.icon('essence', 22)} +${rw.essence}`);
    if (rw.xp) items.push(`⭐ +${rw.xp} XP cada`);
    if (rw.tokens && rw.tokens.premium) items.push('🎟️ +1 Pacote Premium');
    const bossName = cfg.kind === 'boss' ? SP.BOSS[cfg.bossId].name : isBoss ? isBoss.name : null;
    const m = UI.modal(`<div class="result">
      <div class="r-title ${win ? 'win' : 'lose'}">${win ? 'VITÓRIA!' : b.timeout ? 'TEMPO ESGOTADO' : 'DERROTA'}</div>
      <p class="muted">${win ? (bossName ? 'Você derrotou ' + UI.esc(bossName) + '!' : rw.firstClear ? 'Fase concluída pela primeira vez!' : 'Belo combate!') : 'Não desista! Treine e evolua seus stickers, ou tente outra equipe com vantagem elemental.'}</p>
      <div class="reward-list">${items.map((x, i) => `<div class="reward" style="animation-delay:${i * 0.12}s">${x}</div>`).join('')}</div>
      ${rw.levelUps.length ? `<div class="panel small-txt" style="margin:8px auto;max-width:420px">${rw.levelUps.map(l => `⬆ <b>${UI.esc(SP.STICKER[l.id].name)}</b> subiu para o nível ${l.to}!`).join('<br>')}</div>` : ''}
      ${rw.sticker ? `<h3 style="color:#ffe14d;margin-top:10px">Sticker exclusivo obtido!</h3><div class="row center" id="rwCard">${UI.card(rw.sticker, { isNew: true, cls: 'lg' })}</div>` : ''}
      <div class="row center" style="margin-top:16px" id="rBtns"></div></div>`, { sticky: true, onClose: () => { SP.FX.clear(); } });
    if (rw.levelUps.length) setTimeout(() => UI.sfx('levelup'), 600);
    if (rw.sticker) {
      const c = UI.$('#rwCard .card', m);
      UI.tilt(c);
      setTimeout(() => { SP.FX.rarityBurst(c, SP.STICKER[rw.sticker].rarity); UI.sfx('reveal', SP.RARITY[SP.STICKER[rw.sticker].rarity].rank); }, 500);
    }
    const btns = [];
    if (cfg.kind === 'stage') {
      if (win && cfg.stage < SP.STAGE_COUNT) btns.push(['Próxima fase ▶', 'gold', () => { UI.go('battles', { tab: 'campaign' }, { replace: true }); UI.openStage(cfg.stage + 1); }]);
      btns.push([win ? 'Repetir fase' : 'Tentar de novo', '', () => UI.go('team', { kind: 'stage', stage: cfg.stage }, { replace: true })]);
      btns.push(['Mapa', 'ghost', () => UI.go('battles', { tab: 'campaign' }, { replace: true })]);
    } else if (cfg.kind === 'boss') {
      const t = Core.nextBossTier(cfg.bossId);
      btns.push([win ? 'Desafio nível ' + t : 'Tentar de novo', 'red', () => UI.bossIntro(cfg.bossId, Core.bossLevel(cfg.bossId, t), () => UI.go('team', { kind: 'boss', bossId: cfg.bossId, tier: t }, { replace: true }))]);
      btns.push(['Chefes', 'ghost', () => UI.go('battles', { tab: 'bosses' }, { replace: true })]);
    } else {
      btns.push(['Nova batalha rápida', '', () => UI.go('team', { kind: 'quick', enemies: Core.quickEnemies(SP.state.team) }, { replace: true })]);
      btns.push(['Voltar', 'ghost', () => UI.go('battles', { tab: 'quick' }, { replace: true })]);
    }
    if (!win) btns.push(['Melhorar stickers', 'green', () => UI.go('upgrades', null, { replace: true })]);
    UI.$('#rBtns', m).innerHTML = btns.map((x, i) => `<button class="btn ${x[1]}" data-i="${i}">${x[0]}</button>`).join('');
    UI.$$('#rBtns .btn', m).forEach(bt => bt.addEventListener('click', () => { UI.sfx('click'); m.close(); btns[+bt.dataset.i][2](); }));
  }
})(typeof window !== 'undefined' ? window : globalThis);
