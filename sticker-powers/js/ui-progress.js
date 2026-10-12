/* =========================================================================
   STICKER POWERS — melhorias (treino, evolução, forja), missões e
   configurações (som, animações, salvamento, recordes).
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP, UI = SP.UI, Core = SP.Core, Art = SP.Art;

  /* ---------------------------------------------------------------- MELHORIAS */
  UI.screens.upgrades = function (el, params) {
    const tab = params.tab || 'evolve';
    el.innerHTML = `<div class="wrap">
      <div class="tabs">
        <button class="tab ${tab === 'evolve' ? 'on' : ''}" data-t="evolve">⬆ Treinar e Evoluir</button>
        <button class="tab ${tab === 'forge' ? 'on' : ''}" data-t="forge">⚒ Forja</button>
        <button class="tab ${tab === 'frames' ? 'on' : ''}" data-t="frames">🖼 Molduras</button>
      </div><div id="upBody"></div></div>`;
    UI.$$('.tab', el).forEach(t => t.addEventListener('click', () => { UI.sfx('click'); UI.currentParams = { tab: t.dataset.t }; UI.render('upgrades', { tab: t.dataset.t }); }));
    if (tab === 'forge') forge(UI.$('#upBody', el));
    else if (tab === 'frames') frames(UI.$('#upBody', el));
    else evolveTab(UI.$('#upBody', el), params.id);
  };

  function evolveTab(body, selId) {
    const st = SP.state;
    const owned = () => Object.keys(st.owned).sort((a, b) => Core.ownedPower(b) - Core.ownedPower(a));
    let sel = selId && st.owned[selId] ? selId : owned()[0];
    body.innerHTML = `<div class="up-layout"><div class="panel"><div class="small-txt muted" style="margin-bottom:8px">Seus stickers (por poder)</div><div class="up-list" id="upList"></div></div><div class="panel" id="upMain"></div></div>`;
    const list = UI.$('#upList', body), main = UI.$('#upMain', body);
    const drawList = () => {
      list.innerHTML = owned().map(id => {
        const evo = Core.evoInfo(id);
        const ready = evo.ok;
        return `<div style="position:relative">${UI.card(id, { cls: 'xs' + (id === sel ? ' sel' : ''), showCount: false })}${ready ? '<span class="notif-dot" style="top:-6px;right:-6px">⬆</span>' : ''}</div>`;
      }).join('');
    };
    const drawMain = () => {
      const s = SP.STICKER[sel], o = st.owned[sel];
      const cap = SP.PROG.levelCap(o.stars);
      const stats = Core.ownedStats(sel);
      const nextLv = o.level < cap ? Core.statsFor(sel, o.level + 1, o.stars) : null;
      const evo = Core.evoInfo(sel);
      const xpNeed = SP.PROG.xpToNext(o.level);
      const tr = Core.canTrain(sel);
      main.innerHTML = `<div class="up-main">
        <div class="center">${UI.card(sel, { cls: 'sm', showCount: false })}</div>
        <div class="info">
          <h3 style="margin:0">${UI.esc(s.name)} <span class="stars" style="color:#ffe14d;font-size:16px">${UI.stars(o.stars)}</span></h3>
          <div class="small-txt muted">${UI.rarityName(s.rarity)} · ${UI.elName(s.el)} · Poder ${Core.ownedPower(sel)} · ${o.count - 1} duplicata(s) já convertida(s)</div>
          <div class="row" style="margin-top:8px"><b>Nível ${o.level} / ${cap}</b></div>
          ${o.level < cap ? `<div class="bar" style="margin:6px 0"><i style="width:${o.xp / xpNeed * 100}%"></i></div><div class="small-txt muted">${o.xp} / ${xpNeed} XP</div>` : '<div class="small-txt" style="color:#ffe14d">Nível máximo desta estrela.</div>'}
          ${UI.statBars(stats, nextLv)}
          <div class="panel" style="background:rgba(0,0,0,.25);margin-top:8px">
            <b>🏋 Treinar</b>
            <div class="small-txt muted">Custa ${SP.PROG.trainCost} moedas e dá ${SP.PROG.trainXp} XP. Batalhas também dão XP para a equipe.${nextLv ? ' Próximo nível: atributos em verde acima.' : ''}</div>
            <div class="row" style="margin-top:8px"><button class="btn small blue" id="btTrain" ${tr.ok ? '' : 'disabled'}>Treinar <span class="cost">${Art.icon('coin', 14)} ${SP.PROG.trainCost}</span></button>
            <button class="btn small blue" id="btTrainMax" ${tr.ok ? '' : 'disabled'} title="Treina sem parar até acabar o dinheiro ou chegar ao limite da estrela">⏩ Treinar ao máximo</button>
            ${!tr.ok ? `<span class="small-txt muted">${tr.reason}</span>` : ''}</div>
          </div>
          <div class="panel" style="background:rgba(0,0,0,.25);margin-top:10px">
            <b>✨ Evoluir</b> ${evo.maxed ? '<span class="badge" style="background:#ffc21a;color:#000">EVOLUÇÃO MÁXIMA</span>' : `<span class="small-txt muted">→ ${o.stars + 1} estrelas</span>`}
            ${evo.maxed ? '<div class="small-txt muted" style="margin-top:6px">Este sticker transcendeu: talento elemental ativo, nível 60 e habilidade com +75% de poder.</div>' : `
            <div class="cost-line small-txt">
              <span class="${evo.levelOk ? 'ok' : 'no'}">${evo.levelOk ? '✓' : '✗'} Nível ${evo.needLevel}</span>
              <span class="${evo.coinsOk ? 'ok' : 'no'}">${evo.coinsOk ? '✓' : '✗'} ${Art.icon('coin', 14)} ${evo.coins}</span>
              <span class="${evo.fragsOk ? 'ok' : 'no'}">${evo.fragsOk ? '✓' : '✗'} ${Art.icon('frag', 14)} ${evo.frags} fragmentos</span>
              ${evo.essence ? `<span class="${evo.essenceOk ? 'ok' : 'no'}">${evo.essenceOk ? '✓' : '✗'} ${Art.icon('essence', 14)} ${evo.essence} essência</span>` : ''}
              ${evo.crystals ? `<span class="${evo.crystalsOk ? 'ok' : 'no'}">${evo.crystalsOk ? '✓' : '✗'} 💠 ${evo.crystals} cristais</span>` : ''}
            </div>
            <div class="small-txt">Benefícios: atributos +${Math.round(SP.PROG.starGrowth * 100)}% (Vida ${evo.before.hp}→<b style="color:var(--good)">${evo.after.hp}</b>, Ataque ${evo.before.atk}→<b style="color:var(--good)">${evo.after.atk}</b>, Defesa ${evo.before.def}→<b style="color:var(--good)">${evo.after.def}</b>), limite de nível ${cap}→${SP.PROG.levelCap(o.stars + 1)}.</div>
            <div class="small-txt" style="color:#ffe14d;margin-top:4px">Desbloqueia: ${evo.unlock}</div>
            <div class="row" style="margin-top:8px"><button class="btn small gold" id="btEvo" ${evo.ok ? '' : 'disabled'}>Evoluir!</button>
            <button class="btn small gold" id="btEvoMax" ${evo.ok || tr.ok ? '' : 'disabled'} title="Treina e evolui em sequência, o máximo que seus recursos permitirem">⏫ Treinar e evoluir ao máximo</button></div>`}
          </div>
          ${UI.skillHTML(sel, o.stars)}
        </div></div>`;
      const t = UI.$('#btTrain', main);
      if (t) t.addEventListener('click', () => {
        const before = o.level;
        const r = Core.train(sel);
        if (!r.ok) { UI.sfx('error'); UI.toast(r.reason, 'bad'); return; }
        UI.changed();
        UI.sfx('coin');
        const card = UI.$('.card', main);
        SP.FX.at(card, { style: 'heal', count: 16, speed: 160 });
        if (r.levels) {
          UI.sfx('levelup');
          SP.FX.rarityBurst(card, s.rarity);
          SP.FX.float(card, 'NÍVEL ' + st.owned[sel].level + '!', 'crit');
          UI.toast(`⬆ ${UI.esc(s.name)} subiu do nível ${before} para ${st.owned[sel].level}!`, 'good');
        } else SP.FX.float(card, '+' + SP.PROG.trainXp + ' XP', 'heal');
        drawList(); drawMain();
      });
      const tm = UI.$('#btTrainMax', main);
      if (tm) tm.addEventListener('click', () => {
        const before = o.level;
        const r = Core.trainMax(sel);
        if (!r.ok) { UI.sfx('error'); UI.toast(r.reason, 'bad'); return; }
        UI.changed();
        const card = UI.$('.card', main);
        UI.sfx('coin'); if (r.levels) UI.sfx('levelup');
        SP.FX.rarityBurst(card, s.rarity);
        SP.FX.at(card, { style: 'coin', count: Math.min(60, 10 + r.sessions), speed: 260 });
        if (r.levels) SP.FX.float(card, 'NÍVEL ' + st.owned[sel].level + '!', 'crit');
        UI.toast(`⏩ ${r.sessions} treino(s) · ${Art.icon('coin', 14)} ${UI.fmt(r.spent)} gastas · Nv ${before} → <b>${st.owned[sel].level}</b>${r.atCap ? '<br>Chegou ao limite da estrela: hora de evoluir!' : '<br>Acabaram as moedas.'}`, 'gold');
        drawList(); drawMain();
      });
      const em = UI.$('#btEvoMax', main);
      if (em) em.addEventListener('click', () => {
        const r = Core.evolveMax(sel);
        if (!r.ok) { UI.sfx('error'); UI.toast(r.stop, 'bad'); return; }
        UI.changed();
        const summary = `⏫ Nv ${r.levelFrom} ${'★'.repeat(r.starsFrom)} → <b>Nv ${st.owned[sel].level} ${'★'.repeat(r.starsTo)}</b><br>${r.sessions} treino(s), ${r.evolutions} evolução(ões), ${UI.fmt(r.spent)} moedas gastas.<br><span class="small-txt">${r.stop}</span>`;
        const done = () => { UI.toast(summary, 'gold'); drawList(); drawMain(); };
        if (r.evolutions) evolveAnimation(sel, done);
        else { UI.sfx('levelup'); SP.FX.rarityBurst(UI.$('.card', main), s.rarity); done(); }
      });
      const ev = UI.$('#btEvo', main);
      if (ev) ev.addEventListener('click', () => {
        const r = Core.evolve(sel);
        if (!r.ok) { UI.sfx('error'); UI.toast(r.reason, 'bad'); return; }
        UI.changed();
        evolveAnimation(sel, () => { drawList(); drawMain(); });
      });
    };
    list.addEventListener('click', e => {
      const c = e.target.closest('.card');
      if (!c) return;
      UI.sfx('click');
      sel = c.dataset.id;
      drawList(); drawMain();
    });
    drawList(); drawMain();
  }

  function evolveAnimation(id, done) {
    const s = SP.STICKER[id];
    const ov = document.createElement('div');
    ov.className = 'evo-anim';
    ov.innerHTML = `<div style="text-align:center">${UI.card(id, { cls: 'lg', showCount: false })}<div class="rar-label" style="color:#ffe14d;margin-top:14px">EVOLUIU!</div><div class="small-txt">${UI.esc(s.name)} agora tem ${SP.state.owned[id].stars} estrelas</div></div>`;
    document.body.appendChild(ov);
    UI.sfx('evolve');
    const c = UI.$('.card', ov);
    SP.FX.at(c, { style: s.el, count: 50, speed: 140, life: 1.2 });
    setTimeout(() => { SP.FX.flash('#fff', 600); SP.FX.rarityBurst(c, 'legendary'); SP.FX.at(c, { style: s.el, count: 80, speed: 500, size: 9 }); }, 1000);
    const end = () => { ov.remove(); done(); };
    setTimeout(end, SP.state.settings.reducedMotion ? 700 : 2400);
  }

  function forge(body) {
    const st = SP.state;
    const list = SP.STICKERS.filter(s => !st.owned[s.id] && !s.bossOnly);
    body.innerHTML = `<div class="panel" style="margin-bottom:12px"><b>Forja de Fragmentos</b>
      <p class="small-txt muted" style="margin:6px 0 0">Transforme fragmentos (obtidos com duplicatas e batalhas) em um sticker que você ainda não tem. Custo por raridade:
      ${SP.RARITIES.filter(r => r.craft).map(r => `<span style="color:${r.color}">${r.name} ${r.craft}</span>`).join(' · ')}. Stickers Secretos e exclusivos de chefes não podem ser forjados.</p>
      <p class="small-txt" style="margin:6px 0 0">Você tem ${Art.icon('frag', 14)} <b>${UI.fmt(st.fragments)}</b> fragmentos.</p></div>
      <div class="forge-list">${list.length ? list.map(s => {
        const cost = Core.craftCost(s.id);
        return `<div class="panel forge-item">${UI.card(s.id)}<div class="small-txt"><span style="color:${SP.RARITY[s.rarity].color}">${UI.rarityName(s.rarity)}</span> · ${UI.elName(s.el)}</div>
          ${cost ? `<button class="btn small ${st.fragments >= cost ? 'blue' : ''}" data-f="${s.id}" ${st.fragments >= cost ? '' : 'disabled'}>Forjar ${Art.icon('frag', 14)} ${cost}</button>` : '<span class="small-txt muted">Só em pacotes</span>'}</div>`;
      }).join('') : '<div class="empty">Você já tem todos os stickers forjáveis! 🎉</div>'}</div>`;
    UI.$$('[data-f]', body).forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.f;
      const r = Core.craft(id);
      if (!r.ok) { UI.sfx('error'); UI.toast(r.reason, 'bad'); return; }
      UI.changed();
      const s = SP.STICKER[id];
      UI.sfx('reveal', SP.RARITY[s.rarity].rank);
      const m = UI.modal(`<div class="center" style="text-align:center"><h3>Forjado!</h3><div class="row center">${UI.card(id, { isNew: true, cls: 'lg' })}</div><p class="story">${UI.esc(s.story)}</p></div>`, { cls: 'narrow', onClose: () => forge(body) });
      const c = UI.$('.card', m);
      UI.tilt(c);
      setTimeout(() => SP.FX.rarityBurst(c, s.rarity), 150);
    }));
    UI.$$('.forge-item .card', body).forEach(c => c.addEventListener('click', () => UI.showDetail(c.dataset.id)));
  }

  /* ---------------------------------------------------------------- MOLDURAS */
  function frames(body) {
    const st = SP.state;
    const sample = Object.keys(st.owned).sort((a, b) => SP.RARITY[SP.STICKER[b].rarity].rank - SP.RARITY[SP.STICKER[a].rarity].rank)[0];
    const draw = () => {
      body.innerHTML = `<div class="panel" style="margin-bottom:12px"><b>Molduras animadas</b>
        <p class="small-txt muted" style="margin:6px 0 0">Puramente visuais: não mudam atributos. Compre com <b>💠 Cristais</b> (ganhos no Modo Pesadelo) e escolha a moldura de cada sticker na ficha dele, ou aplique em todos de uma vez.</p>
        <p class="small-txt" style="margin:6px 0 0">Você tem <b>💠 ${st.crystals}</b> cristais.</p></div>
        <div class="frames-grid">${SP.FRAMES.map(f => {
          const owned = Core.frameUnlocked(f.id);
          const avail = Core.frameAvailable(f.id);
          let btn;
          if (owned) btn = `<button class="btn small ghost" data-all="${f.id}">Aplicar em todos</button>`;
          else if (f.unlock) btn = avail ? `<button class="btn small gold" data-buy="${f.id}">Resgatar</button>` : `<span class="small-txt muted">🔒 ${UI.esc(SP.MISSIONS.find(m => m.id === f.unlock).name)}</span>`;
          else btn = `<button class="btn small ${st.crystals >= f.cost ? 'blue' : ''}" data-buy="${f.id}" ${st.crystals >= f.cost ? '' : 'disabled'}>Comprar 💠 ${f.cost}</button>`;
          return `<div class="panel frame-item ${owned ? 'owned' : ''}"><div class="frame-demo">${UI.card(sample, { showCount: false, cls: 'f-' + f.id + ' sm demo' })}</div>
            <b>${UI.esc(f.name)}</b><div class="small-txt muted">${UI.esc(f.desc)}</div>${btn}</div>`;
        }).join('')}</div>`;
      // a carta de demonstração usa a moldura do item, não a equipada
      UI.$$('.frame-demo .card', body).forEach((c, i) => {
        c.className = c.className.replace(/\bf-[a-z]+\b/g, '').trim() + ' f-' + SP.FRAMES[i].id;
      });
      UI.$$('[data-buy]', body).forEach(b => b.addEventListener('click', () => {
        const r = Core.buyFrame(b.dataset.buy);
        if (!r.ok) { UI.sfx('error'); UI.toast(r.reason, 'bad'); return; }
        UI.changed(); UI.sfx('reveal', 4);
        SP.FX.at(b, { style: 'confetti', count: 40, speed: 300 });
        UI.toast('Moldura <b>' + UI.esc(SP.FRAME[b.dataset.buy].name) + '</b> liberada!', 'gold');
        draw();
      }));
      UI.$$('[data-all]', body).forEach(b => b.addEventListener('click', () => {
        Object.keys(st.owned).forEach(id => Core.equipFrame(id, b.dataset.all));
        UI.changed(); UI.sfx('shield');
        UI.toast('Moldura <b>' + UI.esc(SP.FRAME[b.dataset.all].name) + '</b> aplicada em todos os stickers.', 'good');
      }));
    };
    draw();
  }

  /* ---------------------------------------------------------------- MISSÕES */
  UI.screens.missions = function (el) {
    const draw = () => {
      Core.ensureDaily();
      const daily = SP.DAILY_MISSIONS.map(m => ({ m, s: Core.dailyStatus(m), daily: true }));
      const ach = SP.MISSIONS.map(m => ({ m, s: Core.missionStatus(m) }))
        .sort((a, b) => (a.s.claimed - b.s.claimed) || (b.s.done - a.s.done) || (b.s.value / b.s.goal - a.s.value / a.s.goal));
      const item = ({ m, s, daily: d }) => `<div class="panel mission ${s.claimed ? 'claimed' : s.done ? 'done' : ''}">
        <div><div class="m-name">${UI.esc(m.name)}</div>${m.desc ? `<div class="m-desc">${UI.esc(m.desc)}</div>` : ''}
          <div class="bar ${s.done ? 'gold' : ''}" style="margin:6px 0;max-width:340px"><i style="width:${s.value / s.goal * 100}%"></i></div>
          <div class="small-txt muted">${s.value} / ${s.goal}</div>
          <div class="m-rew">Recompensa: ${Core.rewardText(m.reward)}</div></div>
        <div>${s.claimed ? '<span class="tag good">✓ Resgatada</span>' : `<button class="btn small ${s.done ? 'gold' : ''}" data-claim="${m.id}" data-daily="${d ? 1 : 0}" ${s.done ? '' : 'disabled'}>Resgatar</button>`}</div></div>`;
      el.innerHTML = `<div class="wrap">
        <div class="row" style="justify-content:space-between"><h2 class="section">Missões diárias</h2><span class="daily-timer">Renovam em <b id="dLeft">${UI.fmtTime(Core.msToMidnight())}</b></span></div>
        <p class="small-txt muted" style="margin-top:-6px">Reiniciam à meia-noite pelo relógio deste dispositivo.</p>
        ${daily.map(item).join('')}
        <h2 class="section" style="margin-top:22px">Conquistas</h2>
        ${ach.map(item).join('')}</div>`;
      UI.$$('[data-claim]', el).forEach(b => b.addEventListener('click', () => {
        const r = b.dataset.daily === '1' ? Core.claimDaily(b.dataset.claim) : Core.claimMission(b.dataset.claim);
        if (!r.ok) return;
        UI.sfx('mission'); UI.sfx('coin');
        SP.FX.at(b, { style: 'coin', count: 30, speed: 300 });
        SP.FX.at(b, { style: 'confetti', count: 30, speed: 260 });
        UI.toast('Recompensa: ' + Core.rewardText(r.reward), 'gold');
        UI.changed();
        draw();
      }));
    };
    draw();
    UI.timer = setInterval(() => {
      const l = UI.$('#dLeft', el);
      if (l) l.textContent = UI.fmtTime(Core.msToMidnight());
      if (Core.ensureDaily()) { UI.changed(); draw(); }
    }, 1000);
  };

  /* ---------------------------------------------------------------- CONFIGURAÇÕES */
  UI.screens.settings = function (el) {
    const st = SP.state, s = st.settings;
    const sw = (id, on) => `<button class="switch ${on ? 'on' : ''}" id="${id}" role="switch" aria-checked="${on}"></button>`;
    const S = st.stats;
    el.innerHTML = `<div class="wrap" style="max-width:760px">
      <div class="panel">
        <h2 class="section">Áudio e visual</h2>
        <div class="set-row"><div><b>Música</b><div class="small-txt muted">Trilha sintetizada em tempo real</div></div>${sw('sMusic', s.music)}</div>
        <div class="set-row"><div><b>Efeitos sonoros</b></div>${sw('sSfx', s.sfx)}</div>
        <div class="set-row"><div><b>Volume geral</b></div><input type="range" id="sVol" min="0" max="1" step="0.05" value="${s.volume}"></div>
        <div class="set-row"><div><b>Reduzir animações</b><div class="small-txt muted">Menos partículas, sem tremores nem clarões</div></div>${sw('sRed', s.reducedMotion)}</div>
        <div class="set-row"><div><b>Velocidade das batalhas</b></div><select class="select" id="sSpd">${[1, 2, 3].map(v => `<option value="${v}" ${s.battleSpeed === v ? 'selected' : ''}>${v}×</option>`).join('')}</select></div>
        <div class="set-row"><div><b>Batalha automática por padrão</b></div>${sw('sAuto', s.autoBattle)}</div>
      </div>
      <div class="panel" style="margin-top:14px">
        <h2 class="section">Recordes</h2>
        <div class="stats-grid">
          ${[['Vitórias', S.battlesWon], ['Derrotas', S.battlesLost], ['Melhor sequência', S.bestStreak], ['Pacotes abertos', S.packsOpened], ['Stickers recebidos', S.stickersObtained],
            ['Coleção', Core.uniqueOwned() + '/' + SP.STICKERS.length], ['Fases vencidas', st.campaign.cleared + '/' + SP.STAGE_COUNT], ['Chefes derrotados', Core.missionValue('bossKinds') + '/' + SP.BOSSES.length], ['Recorde da Torre', 'Andar ' + st.tower.best], ['Pesadelos vencidos', st.nightmare.cleared + '/' + SP.ACT2_END], ['Duelos jogados', S.duels],
            ['Evoluções', S.evolutions], ['Habilidades usadas', S.skillsUsed], ['Golpes com vantagem', S.advantageHits], ['Moedas ganhas', UI.fmt(S.totalCoinsEarned)]]
            .map(([l, v]) => `<div class="panel"><b>${v}</b><span class="small-txt muted">${l}</span></div>`).join('')}
        </div>
      </div>
      <div class="panel" style="margin-top:14px">
        <h2 class="section">Salvamento</h2>
        <p class="small-txt">O progresso é salvo <b>automaticamente</b> neste navegador (localStorage), com uma cópia de segurança. ${Core.storage ? '' : '<b style="color:var(--bad)">O armazenamento local está indisponível: o progresso não será mantido ao fechar a página.</b>'}</p>
        <p class="small-txt muted">Não há servidor: os dados <b>não</b> são sincronizados entre dispositivos. Para levar seu progresso, use Exportar/Importar.</p>
        <div class="row"><button class="btn small blue" id="sExp">Exportar save</button><button class="btn small ghost" id="sImp">Importar save</button><button class="btn small red" id="sReset">Reiniciar progresso</button></div>
      </div>
      <div class="panel" style="margin-top:14px">
        <h2 class="section">Sobre</h2>
        <p class="small-txt">STICKER POWERS: O Despertar dos Poderes — jogo de stickers colecionáveis com batalhas por turnos. Todas as ilustrações (SVG), músicas e efeitos sonoros (Web Audio) são gerados pelo próprio código.
        Não há compras com dinheiro real nem anúncios. As chances dos pacotes podem ser vistas em cada pacote.</p>
        <button class="btn small ghost" id="sIntro">Rever introdução</button>
      </div></div>`;
    const toggle = (id, key, after) => UI.$('#' + id, el).addEventListener('click', e => {
      s[key] = !s[key];
      e.currentTarget.classList.toggle('on', s[key]);
      e.currentTarget.setAttribute('aria-checked', s[key]);
      UI.applySettings();
      UI.changed();
      UI.sfx('click');
      if (after) after();
    });
    toggle('sMusic', 'music', () => { if (s.music) SP.Audio.music('menu', true); });
    toggle('sSfx', 'sfx');
    toggle('sRed', 'reducedMotion');
    toggle('sAuto', 'autoBattle');
    UI.$('#sVol', el).addEventListener('input', e => { s.volume = +e.target.value; UI.applySettings(); });
    UI.$('#sVol', el).addEventListener('change', () => { UI.changed(); UI.sfx('click'); });
    UI.$('#sSpd', el).addEventListener('change', e => { s.battleSpeed = +e.target.value; UI.changed(); });
    UI.$('#sExp', el).addEventListener('click', () => {
      const m = UI.modal(`<h3>Exportar save</h3><p class="small-txt muted">Copie este texto e guarde-o. Em outro navegador, use “Importar save”.</p>
        <textarea class="input" readonly id="expTxt">${UI.esc(Core.exportSave())}</textarea>
        <div class="row" style="margin-top:10px"><button class="btn small" id="expCopy">Copiar</button></div>`, { cls: 'narrow' });
      const ta = UI.$('#expTxt', m);
      UI.$('#expCopy', m).addEventListener('click', () => {
        ta.select();
        const ok = () => UI.toast('Copiado!', 'good');
        if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(ok, () => { document.execCommand('copy'); ok(); });
        else { document.execCommand('copy'); ok(); }
      });
    });
    UI.$('#sImp', el).addEventListener('click', () => {
      const m = UI.modal(`<h3>Importar save</h3><p class="small-txt muted">Cole o texto exportado. <b>Isto substitui o progresso atual.</b> Dados inválidos são corrigidos ou descartados automaticamente.</p>
        <textarea class="input" id="impTxt" placeholder="{...}"></textarea>
        <div class="row" style="margin-top:10px"><button class="btn small red" id="impGo">Importar</button></div>`, { cls: 'narrow' });
      UI.$('#impGo', m).addEventListener('click', () => {
        try {
          Core.importSave(UI.$('#impTxt', m).value);
          m.close();
          UI.applySettings(); UI.refreshTop(true); UI.lastDone = UI.doneMissionIds();
          UI.toast('Save importado com sucesso!', 'good');
          UI.go('home');
        } catch (e) { UI.sfx('error'); UI.toast('Não foi possível importar: o texto não é um save válido.', 'bad'); }
      });
    });
    UI.$('#sReset', el).addEventListener('click', () => {
      UI.confirm('Isto apaga <b>toda</b> a sua coleção, moedas, fragmentos, missões e recordes. Não pode ser desfeito.', () => {
        Core.reset();
        UI.applySettings(); UI.refreshTop(true); UI.lastDone = UI.doneMissionIds();
        UI.toast('Progresso reiniciado.', 'good');
        UI.go('home');
      }, { title: 'Reiniciar progresso?', yes: 'Apagar tudo', danger: true, typeWord: 'RESETAR' });
    });
    UI.$('#sIntro', el).addEventListener('click', () => UI.showIntro());
  };
})(typeof window !== 'undefined' ? window : globalThis);
