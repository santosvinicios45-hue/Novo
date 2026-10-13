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
        <button class="tab ${tab === 'raid' ? 'on' : ''}" data-t="raid">🌍 Chefe Mundial</button>
        <button class="tab ${tab === 'tower' ? 'on' : ''}" data-t="tower">🗼 Torre Infinita</button>
        <button class="tab ${tab === 'nightmare' ? 'on' : ''} ${Core.nightmareUnlocked() ? '' : 'tab-locked'}" data-t="nightmare">😈 Pesadelo</button>
        <button class="tab ${tab === 'duel' ? 'on' : ''}" data-t="duel">👥 Duelo Local</button>
        <button class="tab ${tab === 'quick' ? 'on' : ''}" data-t="quick">⚡ Batalha Rápida</button>
      </div><div id="tabBody"></div></div>`;
    UI.$$('.tab', el).forEach(t => t.addEventListener('click', () => { UI.sfx('click'); UI.currentParams = { tab: t.dataset.t }; UI.render('battles', { tab: t.dataset.t }); }));
    const body = UI.$('#tabBody', el);
    if (tab === 'campaign') campaign(body);
    else if (tab === 'bosses') bosses(body);
    else if (tab === 'tower') tower(body);
    else if (tab === 'raid') raid(body);
    else if (tab === 'nightmare') nightmare(body);
    else if (tab === 'duel') duel(body);
    else quick(body);
  };

  function campaign(body) {
    const cleared = SP.state.campaign.cleared;
    const actStart = { 1: 0, 2: SP.ACT1_END, 3: SP.ACT2_END, 4: SP.ACT3_END };
    const locked = act => cleared < actStart[act];
    body.innerHTML = SP.REGIONS.map((r, i) => (i === 0 || r.act !== SP.REGIONS[i - 1].act ? `<h2 class="section act-title">${SP.ACTS[r.act]}${locked(r.act) ? ` <span class="small-txt muted">🔒 vença a fase ${actStart[r.act]} para liberar</span>` : ''}</h2>` : '') + `<div class="region ${locked(r.act) ? 'act-locked' : ''}" style="background:linear-gradient(135deg, ${r.bg[0]}, ${r.bg[1]})">
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
    body.innerHTML = `<div class="boss-list">${SP.BOSSES.map((b, bi) => {
      const un = Core.bossUnlocked(b.id);
      const tier = Core.nextBossTier(b.id);
      const best = SP.state.bosses[b.id] || 0;
      const rw = SP.bossTierRewards(tier);
      const owned = SP.state.owned[b.reward];
      const head = bi === 0 || !!b.act !== !!SP.BOSSES[bi - 1].act ? `<h2 class="section" style="grid-column:1/-1;margin-bottom:0">${b.act ? 'Ato II' : 'Ato I'}</h2>` : '';
      return head + `<div class="panel boss-card ${un ? '' : 'locked'}" data-b="${b.id}">
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

  function tower(body) {
    const T = SP.TOWER, tw = SP.state.tower;
    const spec = Core.towerSpec(tw.floor);
    const rw = T.rewards(tw.floor);
    const isBoss = T.isBoss(tw.floor);
    const floors = [];
    for (let f = tw.floor + 4; f >= Math.max(1, tw.floor - 2); f--) floors.push(f);
    body.innerHTML = `<div class="tower-wrap">
      <div class="panel tower-info">
        <h3 style="font-family:var(--font-display);margin:0">Torre Infinita</h3>
        <p class="muted small-txt">Andares sem fim, cada vez mais fortes. A cada 10 andares, um chefe guarda a passagem. Se perder, você volta ao último checkpoint (andares 1, 11, 21...). Seu recorde fica salvo.</p>
        <div class="stats-grid" style="margin:10px 0"><div class="panel"><b>${tw.floor}</b><span class="small-txt muted">Andar atual</span></div><div class="panel"><b>${tw.best}</b><span class="small-txt muted">Recorde</span></div><div class="panel"><b>${T.checkpoint(tw.floor)}</b><span class="small-txt muted">Checkpoint</span></div></div>
        <div class="small-txt">Próximo: <b>${isBoss ? '👑 CHEFE ' + UI.esc(SP.BOSS[spec.boss.id].name) : 'Andar ' + tw.floor}</b> · inimigos nível <b>${spec.level}</b></div>
        <div class="small-txt" style="color:var(--gold);margin-top:4px">Vitória: ${rw.coins} moedas · ${rw.fragments} fragmentos · ${rw.xp} XP${isBoss ? ' · ' + Core.rewardText(T.bossBonus(tw.floor)) : ''}</div>
        <div class="vs-preview" style="margin-top:12px">${spec.boss ? `<div style="width:110px;height:110px;border-radius:16px;overflow:hidden;border:3px solid #ff2e7e">${Art.boss(spec.boss.id)}</div>` : spec.enemies.map(enemyMini).join('')}</div>
        <div class="row center" style="margin-top:14px"><button class="btn big ${isBoss ? 'red' : 'gold'}" id="twGo">Subir para o andar ${tw.floor}</button></div>
      </div>
      <div class="tower-col">${floors.map(f => `<div class="tower-floor ${f === tw.floor ? 'cur' : f < tw.floor ? 'done' : ''} ${T.isBoss(f) ? 'boss' : ''}">${T.isBoss(f) ? '👑 ' : ''}Andar ${f}${f === tw.floor ? ' ◀ você' : f <= tw.best ? ' ✓' : ''}</div>`).join('')}</div>
    </div>`;
    UI.$('#twGo', body).addEventListener('click', () => {
      UI.sfx('click');
      const cfg = { kind: 'tower', floor: tw.floor };
      if (isBoss) UI.bossIntro(spec.boss.id, spec.level, () => UI.go('team', cfg));
      else UI.go('team', cfg);
    });
  }

  /* ---------------------------------------------------------------- CHEFE MUNDIAL */
  function raid(body) {
    const sp = Core.raidSpec(), R = SP.RAID, B = SP.BOSS[sp.boss.id];
    const left = Core.raidAttemptsLeft();
    const best = SP.state.raid.week === sp.week ? SP.state.raid.best : 0;
    const M = SP.MODIFIER[sp.mods[0]];
    body.innerHTML = `<div class="panel raid-panel">
      <div class="raid-art">${Art.boss(B.id)}</div>
      <div class="raid-info"><div class="badge" style="background:#ff2e7e">CHEFE MUNDIAL DA SEMANA</div>
        <h3 style="font-family:var(--font-display);margin:6px 0 2px">${UI.esc(B.name)} Gigante</h3>
        <div class="small-txt muted">Nível ${R.level} · vida ×${R.hpMult} · ${R.rounds} rodadas por tentativa · troca em ${UI.fmtTime(sp.ends - Date.now())}</div>
        <div class="small-txt" style="margin-top:6px">${M.icon} <b>${UI.esc(M.name)}:</b> ${UI.esc(M.desc)}</div>
        <p class="small-txt muted">Ninguém derrota o Chefe Mundial: o objetivo é causar o máximo de dano em ${R.rounds} rodadas. Cada tentativa dá a recompensa da faixa de dano que você alcançar.</p>
        <div class="row"><span class="badge">Tentativas hoje: ${left}/${R.attempts}</span><span class="badge">Recorde da semana: ${UI.fmt(best)}</span><span class="badge">Dano total: ${UI.fmt(SP.state.raid.total)}</span></div>
        <div class="raid-tiers">${R.tiers.map((t, i) => `<div class="raid-tier ${best >= t.dmg ? 'done' : ''}"><b>${UI.fmt(t.dmg)}</b><span>${Core.rewardText(t.reward)}</span></div>`).join('')}</div>
        <div class="row" style="margin-top:12px"><button class="btn big red" id="rdGo" ${left ? '' : 'disabled'}>${left ? 'Atacar o gigante!' : 'Volte amanhã'}</button></div>
      </div></div>`;
    UI.$('#rdGo', body).addEventListener('click', () => {
      UI.sfx('click');
      UI.bossIntro(B.id, R.level, () => UI.go('team', { kind: 'raid' }));
    });
  }

  /* ---------------------------------------------------------------- MODO PESADELO */
  const modTags = mods => mods.map(id => { const M = SP.MODIFIER[id]; return `<span class="tag mod-tag" title="${UI.esc(M.desc)}">${M.icon} ${UI.esc(M.name)}</span>`; }).join(' ');
  function nightmare(body) {
    if (!Core.nightmareUnlocked()) {
      body.innerHTML = `<div class="panel night-locked" style="text-align:center;max-width:560px;margin:0 auto"><div style="font-size:54px">😈</div><h3>Modo Pesadelo</h3><p class="muted">Vença a fase 40 da campanha para liberar. As 40 fases voltam com inimigos muito mais fortes e regras malucas.</p></div>`;
      return;
    }
    const cl = SP.state.nightmare.cleared;
    body.innerHTML = `<div class="panel night-head"><h3 style="margin:0;font-family:var(--font-display)">😈 Modo Pesadelo</h3>
      <p class="small-txt muted">As 40 fases de novo, com inimigos Nv ${SP.NIGHTMARE.levelFor(1)}–${SP.NIGHTMARE.levelFor(40)} que lutam com força de Mítico e uma ou duas regras especiais. A 1ª vitória em cada fase dá cristais em dobro. Use os <b>💠 Cristais</b> para comprar molduras em Melhorias.</p>
      <div class="row"><span class="badge">Vencidas: ${cl}/${SP.ACT2_END}</span><span class="badge">💠 ${SP.state.crystals} cristais</span></div></div>
      ${SP.REGIONS.filter(r => r.act <= 2).map(r => `<div class="region night" style="background:linear-gradient(135deg, #12030a, ${r.bg[1]}88)">
        <h4>${UI.esc(r.name)} <span class="small-txt muted">· Pesadelo ${r.stages[0]}–${r.stages[1]}</span></h4>
        <div class="stage-path">${range(r.stages[0], r.stages[1]).map(n => {
          const st = n <= cl ? 'cleared' : n === cl + 1 ? 'next' : 'locked';
          const info = SP.stageInfo(n);
          const icons = SP.NIGHTMARE.modsFor(n).map(id => SP.MODIFIER[id].icon).join('');
          if (info.boss) return `<div class="stage-node boss night ${st}" data-n="${n}">${Art.boss(info.boss.id)}<span class="lvl">${icons}</span></div>`;
          return `<div class="stage-node night ${st}" data-n="${n}">${st === 'cleared' ? '✓' : n}<span class="lvl">${icons}</span></div>`;
        }).join('')}</div></div>`).join('')}`;
    UI.$$('.stage-node', body).forEach(nd => nd.addEventListener('click', () => {
      const k = +nd.dataset.n;
      if (k > cl + 1) { UI.sfx('error'); UI.toast('Vença o pesadelo ' + (cl + 1) + ' primeiro.', 'bad'); return; }
      UI.sfx('click');
      UI.openNightmare(k);
    }));
  }
  UI.openNightmare = function (n) {
    const sp = Core.nightmareSpec(n);
    const rw = SP.NIGHTMARE.rewards(n);
    const first = n > SP.state.nightmare.cleared;
    const go = () => UI.go('team', { kind: 'nightmare', stage: n });
    const m = UI.modal(`<h3>😈 Pesadelo ${n} — ${UI.esc(SP.stageInfo(n).region.name)}</h3>
      <p class="muted small-txt">Inimigos nível ${sp.level}${sp.boss ? ' · CHEFE: ' + UI.esc(SP.BOSS[sp.boss.id].name) : ' · força de Mítico'}</p>
      <div class="vs-preview">${sp.boss ? `<div style="width:120px;height:120px;border-radius:16px;overflow:hidden;border:3px solid #ff2e7e">${Art.boss(sp.boss.id)}</div>` : sp.enemies.map(enemyMini).join('')}</div>
      <div class="panel" style="margin-top:12px"><b>Regras desta fase</b>
        ${sp.mods.map(id => { const M = SP.MODIFIER[id]; return `<div class="small-txt" style="margin-top:6px">${M.icon} <b>${UI.esc(M.name)}:</b> ${UI.esc(M.desc)}</div>`; }).join('')}</div>
      <div class="small-txt" style="color:var(--gold);margin-top:10px">Vitória: ${rw.coins} moedas · 💠 ${rw.crystals * (first ? 2 : 1)} cristais${first ? ' (1ª vitória, em dobro)' : ''} · ${20 + n} fragmentos · ${150 + n * 10} XP</div>
      <div class="row center" style="margin-top:14px"><button class="btn big red" id="nmGo">Enfrentar o pesadelo</button></div>`, { cls: 'narrow' });
    UI.$('#nmGo', m).addEventListener('click', () => {
      UI.sfx('click'); m.close();
      if (sp.boss) UI.bossIntro(sp.boss.id, sp.level, go); else go();
    });
  };

  /* ---------------------------------------------------------------- DUELO LOCAL */
  function duel(body) {
    body.innerHTML = `<div class="panel" style="text-align:center;max-width:620px;margin:0 auto">
      <div style="font-size:50px">🔵 ⚔️ 🔴</div>
      <h3 style="font-family:var(--font-display)">Duelo Local</h3>
      <p class="muted">Dois jogadores no mesmo aparelho. Cada um escolhe 3 stickers da coleção e vocês se revezam: o <b style="color:#4ff0ff">Jogador 1</b> controla a equipe de baixo e o <b style="color:#ff4b6b">Jogador 2</b>, a de cima.</p>
      <p class="small-txt muted">No modo <b>Equilibrado</b>, todos lutam no nível 30 com 3 estrelas: vence quem joga melhor, não quem treinou mais. Duelos não dão nem tiram recompensas.</p>
      <button class="btn big gold" id="dGo">Escolher equipes</button></div>`;
    UI.$('#dGo', body).addEventListener('click', () => { UI.sfx('click'); UI.go('duel'); });
  }
  UI.screens.duel = function (el) {
    const owned = Object.keys(SP.state.owned).sort((a, b) => Core.ownedPower(b) - Core.ownedPower(a));
    const pick = { 1: [], 2: [] };
    let step = 1, fair = true;
    const draw = () => {
      const t = pick[step];
      el.innerHTML = `<div class="wrap">
        <div class="panel duel-head p${step}"><b style="font-size:20px">${step === 1 ? '🔵 Jogador 1' : '🔴 Jogador 2'}</b>, escolha 3 stickers ${step === 2 ? '<span class="small-txt muted">(o Jogador 1 não olha!)</span>' : ''}
          <label class="row small-txt" style="margin-top:8px;gap:6px"><input type="checkbox" id="dFair" ${fair ? 'checked' : ''} ${step === 2 ? 'disabled' : ''}> Equilibrado (todos no nível 30, 3★)</label></div>
        <div class="team-slots">${[0, 1, 2].map(i => t[i] ? UI.card(t[i], { showCount: false }) : `<div class="team-slot">Vaga ${i + 1}</div>`).join('')}</div>
        <div class="card-grid pick-grid" id="dPick">${owned.map(id => UI.card(id, { cls: t.indexOf(id) >= 0 ? 'picked' : '', showCount: false })).join('')}</div>
        <div class="sticky-bar"><span class="small-txt">${t.length}/3 escolhidos</span><div class="row">${step === 2 ? '<button class="btn ghost small" id="dBack">Voltar ao Jogador 1</button>' : ''}<button class="btn ${step === 1 ? 'blue' : 'red'} big" id="dNext" ${t.length === 3 ? '' : 'disabled'}>${step === 1 ? 'Passar para o Jogador 2 ▶' : '⚔ Duelar!'}</button></div></div></div>`;
      UI.$('#dPick', el).addEventListener('click', e => {
        const c = e.target.closest('.card'); if (!c) return;
        const id = c.dataset.id, i = t.indexOf(id);
        if (i >= 0) t.splice(i, 1); else if (t.length < 3) t.push(id); else { UI.sfx('error'); return; }
        UI.sfx('click'); draw();
      });
      const f = UI.$('#dFair', el); if (f) f.addEventListener('change', e => { fair = e.target.checked; });
      const bk = UI.$('#dBack', el); if (bk) bk.addEventListener('click', () => { step = 1; draw(); });
      UI.$('#dNext', el).addEventListener('click', () => {
        UI.sfx('click');
        if (step === 1) { step = 2; draw(); el.scrollTop = 0; return; }
        const spec = id => fair ? { id, level: 30, stars: 3 } : { id, level: SP.state.owned[id].level, stars: SP.state.owned[id].stars };
        UI.go('battle', { kind: 'duel', fair, team: pick[1].slice(), enemies: pick[2].map(spec) });
      });
    };
    draw();
  };

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
    if (cfg.kind === 'tower') {
      const t = Core.towerSpec(cfg.floor);
      return t.boss ? { boss: t.boss } : { enemies: t.enemies };
    }
    if (cfg.kind === 'raid') {
      const t = Core.raidSpec();
      return { boss: t.boss, mods: t.mods, maxRounds: SP.RAID.rounds };
    }
    if (cfg.kind === 'nightmare') {
      const t = Core.nightmareSpec(cfg.stage);
      return t.boss ? { boss: t.boss, mods: t.mods } : { enemies: t.enemies, mods: t.mods };
    }
    return { enemies: cfg.enemies };
  }

  UI.screens.team = function (el, cfg) {
    const st = SP.state;
    let team = st.team.filter(id => st.owned[id]).slice(0, 3);
    const foes = enemySpecs(cfg);
    const foeEls = foes.boss ? [SP.BOSS[foes.boss.id].el] : foes.enemies.map(e => SP.STICKER[e.id].el);
    const title = cfg.kind === 'raid' ? '🌍 Chefe Mundial' : cfg.kind === 'nightmare' ? '😈 Pesadelo ' + cfg.stage : cfg.kind === 'stage' ? 'Fase ' + cfg.stage : cfg.kind === 'boss' ? SP.BOSS[cfg.bossId].name + ' (nível ' + cfg.tier + ')' : cfg.kind === 'tower' ? 'Torre Infinita — andar ' + cfg.floor : 'Batalha Rápida';
    el.innerHTML = `<div class="wrap">
      <div class="panel" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><b>Adversário: ${UI.esc(title)}</b>
        <span class="small-txt muted">Elementos inimigos: ${foeEls.map(e => Art.elementIcon(e, 16)).join(' ')}</span></div>
        ${foes.mods ? `<div class="row" style="margin-top:8px">${modTags(foes.mods)}</div>` : ''}
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
      const syn = Battle.synergyOf(team.map(id => SP.STICKER[id].el));
      UI.$('#teamPow', el).innerHTML = 'Poder da equipe: <b>' + team.reduce((a, id) => a + Core.ownedPower(id), 0) + '</b>'
        + (syn ? ` · <span class="syn-tag">${Art.elementIcon(syn.el, 14)} Sinergia ${UI.elName(syn.el)} ×${syn.n}: +${syn.atk * 100}% ataque${syn.hp ? ', +' + syn.hp * 100 + '% vida' : ''}</span>` : ' · <span class="muted">2+ do mesmo elemento = sinergia</span>');
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
    const players = cfg.kind === 'duel' && cfg.fair ? cfg.team.map(id => ({ id, level: 30, stars: 3 }))
      : cfg.team.filter(id => SP.state.owned[id]).map(id => ({ id, level: SP.state.owned[id].level, stars: SP.state.owned[id].stars }));
    const b = Battle.create(Object.assign({ players }, foes));
    if (b.vanBond) setTimeout(() => UI.toast('📻 A Van ligou o rádio: o V começa com energia cheia!', 'gold'), 600);
    if (b.synergy.player) setTimeout(() => UI.toast(`🤝 Sinergia ${UI.elName(b.synergy.player.el)} ×${b.synergy.player.n}: +${b.synergy.player.atk * 100}% de ataque`, 'good'), 300);
    BT.vRevived = false;
    const token = {};
    Object.assign(BT, { active: true, b, cfg, el, token, waiting: null });
    const region = cfg.kind === 'stage' || cfg.kind === 'nightmare' ? SP.stageInfo(cfg.stage).region : SP.REGIONS[((cfg.tier || 1) + (cfg.floor || 0)) % SP.REGIONS.length];
    const bossCol = foes.boss ? SP.ELEMENT[SP.BOSS[foes.boss.id].el].c1 : null;
    el.innerHTML = `<div class="battle">
      <div class="battle-bg" style="background:radial-gradient(ellipse at 50% 20%, ${bossCol || region.bg[1]}66, transparent 60%), linear-gradient(180deg, ${region.bg[0]}, #05020c 55%, ${region.bg[0]})"></div>
      <div class="battle-top">
        <span class="round-badge" id="rnd">Rodada 1</span>
        ${foes.mods ? `<span class="round-badge mods-badge" title="${foes.mods.map(id => SP.MODIFIER[id].name + ': ' + SP.MODIFIER[id].desc).join(' | ')}">${foes.mods.map(id => SP.MODIFIER[id].icon).join('')}</span>` : ''}
        ${cfg.kind === 'duel' ? '<span class="round-badge" style="color:#ff4b6b">J2 ↑</span>' : ''}
        ${cfg.kind === 'raid' ? '<span class="round-badge raid-dmg" id="raidDmg">💥 0</span>' : ''}
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
    UI.$('#rnd', BT.el).textContent = 'Rodada ' + Math.max(1, b.round) + (b.maxRounds ? '/' + b.maxRounds : '');
    const rd = UI.$('#raidDmg', BT.el);
    if (rd) { const bo = b.units.find(u => u.isBoss); rd.textContent = '💥 ' + UI.fmt(bo.maxHp - bo.hp); }
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
      const human = actor.side === 'player' || (BT.cfg.kind === 'duel' && !BT.cfg.cpu);
      if (human && !SP.state.settings.autoBattle) {
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
    UI.$('#ctl', BT.el).classList.toggle('p2', BT.cfg.kind === 'duel' && actor.side === 'enemy');
    who.innerHTML = `<span>${BT.cfg.kind === 'duel' ? (actor.side === 'player' ? '🔵 <b>Jogador 1</b> · ' : '🔴 <b>Jogador 2</b> · ') : ''}Vez de <b>${UI.esc(actor.name)}</b> · energia ${actor.en}/${actor.maxEn}</span><span class="muted">${UI.esc(SP.STICKER[actor.id].skill.desc)}</span>`;
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
    UI.confirm('Desistir desta batalha? Ela contará como derrota e você não receberá recompensas.' + (BT.cfg.kind === 'tower' ? ' Na Torre, você volta ao último checkpoint.' : ''), () => {
      const cfg = BT.cfg;
      BT.token = null; BT.active = false;
      if (BT.waiting) BT.waiting = null;
      if (cfg.kind === 'raid') {
        // no Chefe Mundial, desistir encerra a tentativa com o dano causado até aqui
        const bo = BT.b.units.find(u => u.isBoss);
        Core.applyRaid(bo.maxHp - bo.hp, cfg.team);
        UI.changed(); SP.FX.clear(); UI.back();
        return;
      }
      Core.applyBattleResult({ kind: cfg.kind, stage: cfg.stage, bossId: cfg.bossId, tier: cfg.tier, floor: cfg.floor, team: cfg.team, win: false, fled: true, skillsUsed: BT.b.stats.skillsUsed, advantageHits: BT.b.stats.advantageHits });
      UI.changed();
      SP.FX.clear();
      UI.back();
    }, { title: 'Desistir?', yes: 'Desistir', danger: true });
  };

  /* cut-in estilo anime antes de habilidades */
  function cutIn(actor, e) {
    const fast = spd() >= 3 || SP.state.settings.reducedMotion;
    const field = UI.$('#field', BT.el);
    const E = SP.ELEMENT[e.el];
    const d = document.createElement('div');
    d.className = 'cutin ' + (actor.side === 'player' ? 'from-left' : 'from-right') + (actor.isBoss ? ' boss' : '') + (fast ? ' fast' : '');
    d.style.setProperty('--c1', E.c1); d.style.setProperty('--c2', E.c2);
    d.innerHTML = `<div class="ci-band"></div>${fast ? '' : `<div class="ci-art">${actor.isBoss ? Art.boss(actor.id) : Art.sticker(actor.id)}</div>`}<div class="ci-text"><small>${UI.esc(actor.name)}</small><b>${UI.esc(e.name)}</b></div>`;
    field.appendChild(d);
    const dur = fast ? 380 : 820;
    setTimeout(() => d.remove(), dur);
    return UI.sleep((fast ? 200 : 600) / Math.min(spd(), 2));
  }

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
          BT.lastActor = actor;
          const an = uel(e.u);
          if (an) { an.classList.remove('lunge-up', 'lunge-down'); void an.offsetWidth; an.classList.add(actor.side === 'player' ? 'lunge-up' : 'lunge-down'); }
          log((actor.side === 'enemy' ? '🔴 ' : '🔵 ') + actor.name + ' usou ' + e.name + (e.targets.length === 1 && e.targets[0] !== e.u ? ' em ' + Battle.unit(b, e.targets[0]).name : ''));
          if (e.kind === 'skill' || e.kind === 'boss') {
            await cutIn(actor, e);
            if (BT.token !== token) return;
            UI.sfx('skill', e.el);
            const foes = e.targets.filter(t => Battle.unit(b, t).side !== actor.side);
            const friends = e.targets.filter(t => Battle.unit(b, t).side === actor.side);
            friends.forEach(t => { SP.FX.ringAt(uel(t), SP.ELEMENT[e.el].c2, { r1: 90 }); SP.FX.at(uel(t), { style: e.el, count: 20, speed: 140 }); });
            if (foes.length) {
              await Promise.all(foes.map((t, i) => UI.sleep(i * 70 / spd()).then(() => SP.FX.projectile(an, uel(t), e.el, { dur: 0.34 / spd(), size: e.kind === 'boss' ? 11 : 8 }))));
              foes.forEach(t => SP.FX.at(uel(t), { style: e.el, count: 34, speed: 300, size: 7 }));
            }
            if (e.kind === 'boss' && e.target === 'allEnemies') { SP.FX.flash(SP.ELEMENT[e.el].c1, 400); SP.FX.shake(UI.$('#sideP', BT.el), true); }
            await wait(e.kind === 'boss' ? 300 : 220);
          } else if (e.kind === 'defend') {
            UI.sfx('shield');
            SP.FX.ringAt(an, '#4ff0ff', { r1: 90 });
            await wait(380);
          } else {
            const tn = uel(e.targets[0]);
            await SP.FX.projectile(an, tn, e.el, { dur: 0.22 / spd(), size: 6, bend: 0.12 });
            SP.FX.slash(tn, SP.ELEMENT[e.el].c2, 1);
            await wait(60);
          }
          break;
        }
        case 'damage': {
          if (!node) break;
          if (BT.cfg.kind === 'raid') { const rd = UI.$('#raidDmg', BT.el); if (rd) { const bo = b.units.find(x => x.isBoss); rd.textContent = '💥 ' + UI.fmt(bo.maxHp - bo.hp); } }
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
          if (BT.lastActor && BT.lastActor.id === 'v' && BT.lastActor.side === 'player') BT.vRevived = true;
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
    if (cfg.kind === 'duel') return finishDuel(win);
    if (cfg.kind === 'raid') return finishRaid();
    // segredo: o V trouxe alguém de volta → o Téo também volta
    if (BT.vRevived && !SP.state.owned.teo) {
      const r = Core.unlockTeo();
      if (r.ok) setTimeout(() => UI.revealSecret('teo'), 1800);
    }
    // guarda o XP antes, para animar as barras
    const before = {};
    (cfg.team || []).forEach(id => { const o = SP.state.owned[id]; if (o) before[id] = { level: o.level, xp: o.xp, stars: o.stars }; });
    const rw = Core.applyBattleResult({ kind: cfg.kind, stage: cfg.stage, bossId: cfg.bossId, tier: cfg.tier, team: cfg.team, win, skillsUsed: b.stats.skillsUsed, advantageHits: b.stats.advantageHits });
    UI.changed();
    const isBoss = cfg.kind === 'boss' || ((cfg.kind === 'stage' || cfg.kind === 'nightmare') && SP.stageInfo(cfg.stage).boss) || (cfg.kind === 'tower' && SP.TOWER.isBoss(cfg.floor));
    if (win) {
      UI.sfx('victory');
      SP.FX.burst(innerWidth / 2, innerHeight * 0.3, { style: 'confetti', count: 120, speed: 520, life: 1.6 });
      if (isBoss) { SP.FX.flash('#ffe14d', 800); setTimeout(() => SP.FX.burst(innerWidth / 2, innerHeight * 0.4, { style: 'light', count: 100, speed: 600, life: 1.6 }), 300); }
    } else UI.sfx('defeat');
    const items = [];
    if (rw.coins) items.push(`${Art.icon('coin', 22)} +${rw.coins}`);
    if (rw.fragments) items.push(`${Art.icon('frag', 22)} +${rw.fragments}`);
    if (rw.essence) items.push(`${Art.icon('essence', 22)} +${rw.essence}`);
    if (rw.crystals) items.push(`💠 +${rw.crystals} cristais`);
    if (rw.tokens && rw.tokens.premium) items.push('🎟️ +1 Pacote Premium');
    const bossName = cfg.kind === 'boss' ? SP.BOSS[cfg.bossId].name : cfg.kind === 'tower' && isBoss ? SP.BOSS[Core.towerSpec(cfg.floor).boss.id].name : isBoss ? isBoss.name : null;
    const m = UI.modal(`<div class="result">
      <div class="r-title ${win ? 'win' : 'lose'}">${win ? 'VITÓRIA!' : b.timeout ? 'TEMPO ESGOTADO' : 'DERROTA'}</div>
      ${cfg.kind === 'tower' ? `<p><b>${win ? '🗼 Andar ' + cfg.floor + ' conquistado!' + (cfg.floor >= SP.state.tower.best && cfg.floor > 1 ? ' Novo recorde!' : '') : '🗼 Você voltou para o andar ' + rw.fellTo + '.'}</b></p>` : ''}
      ${cfg.kind === 'nightmare' ? `<p><b>😈 Pesadelo ${cfg.stage}${win && rw.firstClear ? ' vencido pela primeira vez (cristais em dobro)!' : ''}</b></p>` : ''}
      <p class="muted">${win ? (bossName ? 'Você derrotou ' + UI.esc(bossName) + '!' : rw.firstClear ? 'Fase concluída pela primeira vez!' : 'Belo combate!') : 'Não desista! Treine e evolua seus stickers, ou tente outra equipe com vantagem elemental.'}</p>
      <div class="reward-list">${items.map((x, i) => `<div class="reward" style="animation-delay:${i * 0.12}s">${x}</div>`).join('')}</div>
      ${rw.xp ? `<div class="xp-rows">${Object.keys(before).map(id => `<div class="xp-row" data-id="${id}"><div class="xp-mini">${Art.sticker(id)}</div><div class="xp-info"><div class="xp-top"><b>${UI.esc(SP.STICKER[id].name)}</b><span class="xp-lv">Nv ${before[id].level}</span></div><div class="bar"><i style="width:${xpPct(before[id])}%"></i></div></div><span class="xp-gain">+${rw.xp} XP</span></div>`).join('')}</div>` : ''}
      ${rw.sticker ? `<h3 style="color:#ffe14d;margin-top:10px">Sticker exclusivo obtido!</h3><div class="row center" id="rwCard">${UI.card(rw.sticker, { isNew: true, cls: 'lg' })}</div>` : ''}
      <div class="row center" style="margin-top:16px" id="rBtns"></div></div>`, { sticky: true, onClose: () => { SP.FX.clear(); } });
    animateXp(m, before);
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
    } else if (cfg.kind === 'nightmare') {
      if (win && cfg.stage < SP.ACT2_END) btns.push(['Próximo pesadelo ▶', 'red', () => { UI.go('battles', { tab: 'nightmare' }, { replace: true }); UI.openNightmare(cfg.stage + 1); }]);
      btns.push([win ? 'Repetir' : 'Tentar de novo', '', () => UI.go('team', { kind: 'nightmare', stage: cfg.stage }, { replace: true })]);
      btns.push(['Pesadelo', 'ghost', () => UI.go('battles', { tab: 'nightmare' }, { replace: true })]);
    } else if (cfg.kind === 'boss') {
      const t = Core.nextBossTier(cfg.bossId);
      btns.push([win ? 'Desafio nível ' + t : 'Tentar de novo', 'red', () => UI.bossIntro(cfg.bossId, Core.bossLevel(cfg.bossId, t), () => UI.go('team', { kind: 'boss', bossId: cfg.bossId, tier: t }, { replace: true }))]);
      btns.push(['Chefes', 'ghost', () => UI.go('battles', { tab: 'bosses' }, { replace: true })]);
    } else if (cfg.kind === 'tower') {
      const f = SP.state.tower.floor;
      const go = () => { const sp = Core.towerSpec(f); const c = { kind: 'tower', floor: f }; if (sp.boss) UI.bossIntro(sp.boss.id, sp.level, () => UI.go('team', c, { replace: true })); else UI.go('team', c, { replace: true }); };
      btns.push([win ? 'Próximo andar (' + f + ') ▲' : 'Tentar do andar ' + f, win ? 'gold' : '', go]);
      btns.push(['Torre', 'ghost', () => UI.go('battles', { tab: 'tower' }, { replace: true })]);
    } else {
      btns.push(['Nova batalha rápida', '', () => UI.go('team', { kind: 'quick', enemies: Core.quickEnemies(SP.state.team) }, { replace: true })]);
      btns.push(['Voltar', 'ghost', () => UI.go('battles', { tab: 'quick' }, { replace: true })]);
    }
    if (!win) btns.push(['Melhorar stickers', 'green', () => UI.go('upgrades', null, { replace: true })]);
    UI.$('#rBtns', m).innerHTML = btns.map((x, i) => `<button class="btn ${x[1]}" data-i="${i}">${x[0]}</button>`).join('');
    UI.$$('#rBtns .btn', m).forEach(bt => bt.addEventListener('click', () => { UI.sfx('click'); m.close(); btns[+bt.dataset.i][2](); }));
  }

  function xpPct(o) {
    const cap = SP.PROG.levelCap(o.stars);
    return o.level >= cap ? 100 : Math.min(100, o.xp / SP.PROG.xpToNext(o.level) * 100);
  }
  /** Enche as barras de XP; a cada nível ganho a barra completa, pisca e recomeça. */
  async function animateXp(m, before) {
    for (const id of Object.keys(before)) {
      const row = UI.$(`.xp-row[data-id="${id}"]`, m);
      const now = SP.state.owned[id];
      if (!row || !now) continue;
      const bar = row.querySelector('.bar i'), lv = row.querySelector('.xp-lv');
      let level = before[id].level;
      await UI.sleep(350);
      while (level < now.level && m.isConnected) {
        bar.style.width = '100%';
        await UI.sleep(420);
        level++;
        lv.textContent = 'Nv ' + level;
        row.classList.remove('lvup'); void row.offsetWidth; row.classList.add('lvup');
        UI.sfx('levelup');
        SP.FX.at(row.querySelector('.xp-mini'), { style: 'light', count: 18, speed: 160 });
        bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth; bar.style.transition = '';
        await UI.sleep(120);
      }
      bar.style.width = xpPct(now) + '%';
      if (now.level >= SP.PROG.levelCap(now.stars)) row.querySelector('.xp-gain').textContent = 'Nível máximo';
    }
  }

  function finishRaid() {
    const b = BT.b, cfg = BT.cfg;
    const bo = b.units.find(u => u.isBoss);
    const dmg = bo.maxHp - bo.hp;
    const r = Core.applyRaid(dmg, cfg.team);
    UI.changed();
    UI.sfx('victory');
    SP.FX.burst(innerWidth / 2, innerHeight * 0.3, { style: 'confetti', count: 100, speed: 480, life: 1.5 });
    const T = SP.RAID.tiers;
    const m = UI.modal(`<div class="result">
      <div class="r-title win">💥 ${UI.fmt(dmg)}</div>
      <p><b>de dano no Chefe Mundial</b>${r.record ? ' · <span style="color:#ffe14d">NOVO RECORDE DA SEMANA!</span>' : ''}</p>
      <div class="raid-tiers result-tiers">${T.map((t, i) => `<div class="raid-tier ${dmg >= t.dmg ? 'done' : ''} ${i === r.tier ? 'hit' : ''}"><b>${UI.fmt(t.dmg)}</b><span>${Core.rewardText(t.reward)}</span></div>`).join('')}</div>
      <p class="muted">Recompensa: ${r.ok ? Core.rewardText(r.reward) + ' · +' + r.xp + ' XP para a equipe' : UI.esc(r.reason || '')}</p>
      <p class="small-txt muted">Tentativas restantes hoje: ${Core.raidAttemptsLeft()}</p>
      <div class="row center" style="margin-top:12px"><button class="btn red" id="rAgain" ${Core.raidAttemptsLeft() ? '' : 'disabled'}>Tentar de novo</button><button class="btn ghost" id="rOut">Voltar</button></div></div>`, { sticky: true, onClose: () => SP.FX.clear() });
    UI.$('#rAgain', m).addEventListener('click', () => { m.close(); UI.go('team', { kind: 'raid' }, { replace: true }); });
    UI.$('#rOut', m).addEventListener('click', () => { m.close(); UI.go('battles', { tab: 'raid' }, { replace: true }); });
  }

  function finishDuel(p1win) {
    const cfg = BT.cfg;
    Core.applyBattleResult({ kind: 'duel', win: p1win });
    UI.changed();
    UI.sfx('victory');
    SP.FX.burst(innerWidth / 2, innerHeight * 0.3, { style: 'confetti', count: 140, speed: 520, life: 1.6, colors: p1win ? ['#4ff0ff', '#3b8bff', '#ffffff'] : ['#ff4b6b', '#ff2e7e', '#ffffff'] });
    const m = UI.modal(`<div class="result">
      <div class="r-title win" style="${p1win ? '' : 'filter:hue-rotate(300deg) drop-shadow(0 0 20px rgba(255,75,107,.7))'}">${p1win ? 'JOGADOR 1' : 'JOGADOR 2'}<br>VENCEU!</div>
      <p class="muted">Duelo local: só pela glória. Ninguém ganha nem perde recompensas.</p>
      <div class="row center" style="margin-top:16px"><button class="btn gold" id="dRe">Revanche</button><button class="btn" id="dNew">Novas equipes</button><button class="btn ghost" id="dOut">Sair</button></div></div>`, { sticky: true, onClose: () => SP.FX.clear() });
    UI.$('#dRe', m).addEventListener('click', () => { m.close(); UI.go('battle', cfg, { replace: true }); });
    UI.$('#dNew', m).addEventListener('click', () => { m.close(); UI.go('duel', null, { replace: true }); });
    UI.$('#dOut', m).addEventListener('click', () => { m.close(); UI.go('battles', { tab: 'duel' }, { replace: true }); });
  }
})(typeof window !== 'undefined' ? window : globalThis);
