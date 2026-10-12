/* =========================================================================
   STICKER POWERS — interface: estrutura, navegação, cartas, tela inicial,
   coleção, detalhes e comparação.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const UI = SP.UI = {};
  const Core = SP.Core, Art = SP.Art;

  /* ---------------------------------------------------------------- utilidades */
  UI.$ = (sel, el) => (el || document).querySelector(sel);
  UI.$$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  UI.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  UI.fmt = n => Number(n).toLocaleString('pt-BR');
  UI.sleep = ms => new Promise(r => setTimeout(r, ms));
  UI.sfx = (n, a) => SP.Audio.play(n, a);
  UI.fmtTime = ms => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
    if (d) return d + 'd ' + h + 'h';
    return (h ? h + 'h ' : '') + String(m).padStart(2, '0') + 'm ' + String(ss).padStart(2, '0') + 's';
  };
  UI.rarityName = r => SP.RARITY[r].name;
  UI.elName = e => SP.ELEMENT[e].name;
  UI.stars = n => '★'.repeat(n) + '<span style="opacity:.25">' + '★'.repeat(Math.max(0, SP.PROG.maxStars - n)) + '</span>';

  /* ---------------------------------------------------------------- estrutura */
  const TITLES = { home: 'Sticker Powers', collection: 'Coleção', packs: 'Pacotes', battles: 'Batalhas', team: 'Montar Equipe', battle: 'Batalha', upgrades: 'Melhorias', missions: 'Missões', settings: 'Configurações' };
  let stack = [];
  UI.current = null;

  UI.init = function () {
    const app = UI.$('#app');
    app.innerHTML = `
      <header class="topbar">
        <button class="icon-btn" id="btnBack" aria-label="Voltar" hidden>${Art.icon('back', 22)}</button>
        <div class="title" id="topTitle">Sticker Powers</div>
        <div class="res">
          <div class="res-pill" id="resCoins" title="Moedas">${Art.icon('coin', 20)}<span>0</span></div>
          <div class="res-pill" id="resFrags" title="Fragmentos">${Art.icon('frag', 20)}<span>0</span></div>
          <div class="res-pill ess" id="resEss" title="Essência de chefe">${Art.icon('essence', 20)}<span>0</span></div>
        </div>
      </header>
      <main id="screen"></main>`;
    UI.$('#btnBack').addEventListener('click', () => { UI.sfx('click'); UI.back(); });
    // Desbloqueia o áudio no primeiro gesto do usuário
    const unlock = () => { SP.Audio.unlock(); };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const m = UI.$$('.modal-back');
        if (m.length) { m[m.length - 1].querySelector('.close') && m[m.length - 1].querySelector('.close').click(); }
        else if (UI.current !== 'home' && UI.current !== 'battle') UI.back();
      }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) Core.save(); });
    root.addEventListener('pagehide', () => Core.save());
    UI.applySettings();
    UI.refreshTop(true);
    UI.lastDone = UI.doneMissionIds();
  };

  UI.applySettings = function () {
    document.body.classList.toggle('reduced', !!SP.state.settings.reducedMotion);
    SP.Audio.applySettings();
  };

  let lastRes = {};
  UI.refreshTop = function (silent) {
    const st = SP.state;
    const set = (id, v) => {
      const el = UI.$('#' + id);
      if (!el) return;
      el.querySelector('span').textContent = UI.fmt(v);
      if (!silent && lastRes[id] != null && lastRes[id] !== v) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
      lastRes[id] = v;
    };
    set('resCoins', st.coins); set('resFrags', st.fragments); set('resEss', st.essence);
  };

  /** Chamado após qualquer mudança de estado: salva, atualiza recursos e missões. */
  UI.changed = function () {
    if (!Core.save() && Core.saveError && !UI._saveWarned) { UI._saveWarned = true; UI.toast(Core.saveError, 'bad'); }
    UI.refreshTop();
    UI.checkMissions();
  };

  UI.doneMissionIds = function () {
    const ids = SP.MISSIONS.filter(m => { const s = Core.missionStatus(m); return s.done && !s.claimed; }).map(m => m.id);
    SP.DAILY_MISSIONS.forEach(m => { const s = Core.dailyStatus(m); if (s.done && !s.claimed) ids.push(m.id); });
    return ids;
  };
  UI.checkMissions = function () {
    const now = UI.doneMissionIds();
    const prev = UI.lastDone || [];
    now.filter(id => prev.indexOf(id) < 0).forEach(id => {
      const m = SP.MISSIONS.find(x => x.id === id) || SP.DAILY_MISSIONS.find(x => x.id === id);
      UI.toast('🏆 Missão concluída: <b>' + UI.esc(m.name) + '</b> — resgate em Missões!', 'gold');
      UI.sfx('mission');
    });
    UI.lastDone = now;
  };

  /* ---------------------------------------------------------------- navegação */
  UI.go = function (name, params, opts) {
    if (opts && opts.replace) {
      // saindo de uma batalha: não volta para a seleção de equipe antiga
      while (stack.length && (stack[stack.length - 1].name === 'team' || stack[stack.length - 1].name === 'battle')) stack.pop();
    } else if (UI.current) stack.push({ name: UI.current, params: UI.currentParams });
    if (name === 'home') stack = [];
    UI.render(name, params);
  };
  UI.back = function () {
    if (UI.current === 'battle' && UI.Battle && UI.Battle.active) { UI.Battle.confirmFlee(); return; }
    const prev = stack.pop();
    UI.render(prev ? prev.name : 'home', prev ? prev.params : null);
  };
  UI.render = function (name, params) {
    UI.current = name; UI.currentParams = params || null;
    UI.$('#topTitle').textContent = TITLES[name] || 'Sticker Powers';
    UI.$('#btnBack').hidden = name === 'home';
    const scr = UI.$('#screen');
    scr.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'screen';
    scr.appendChild(div);
    if (UI.timer) { clearInterval(UI.timer); UI.timer = null; }
    const fn = UI.screens[name];
    if (fn) fn(div, params || {});
    if (name !== 'battle') SP.Audio.music('menu');
  };
  UI.screens = {};

  /* ---------------------------------------------------------------- toasts e modais */
  UI.toast = function (html, type) {
    let box = UI.$('#toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.innerHTML = html;
    box.appendChild(t);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => t.remove(), 3100);
  };

  UI.modal = function (html, opts) {
    const o = opts || {};
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${o.cls || ''}" role="dialog" aria-modal="true"><button class="icon-btn close" aria-label="Fechar">✕</button>${html}</div>`;
    document.body.appendChild(back);
    const close = () => { if (!back.isConnected) return; back.remove(); if (o.onClose) o.onClose(); };
    back.querySelector('.close').addEventListener('click', () => { UI.sfx('click'); close(); });
    back.addEventListener('pointerdown', e => { if (e.target === back && !o.sticky) close(); });
    back.close = close;
    return back;
  };

  UI.confirm = function (text, onYes, opts) {
    const o = opts || {};
    const m = UI.modal(`<h3>${o.title || 'Confirmar'}</h3><p>${text}</p>
      ${o.typeWord ? `<p class="small-txt muted">Digite <b>${o.typeWord}</b> para confirmar:</p><input class="input" id="cfWord" autocomplete="off" style="width:100%">` : ''}
      <div class="row" style="justify-content:flex-end;margin-top:14px">
        <button class="btn ghost small" id="cfNo">Cancelar</button>
        <button class="btn ${o.danger ? 'red' : ''} small" id="cfYes">${o.yes || 'Confirmar'}</button></div>`, { cls: 'narrow' });
    UI.$('#cfNo', m).addEventListener('click', () => m.close());
    UI.$('#cfYes', m).addEventListener('click', () => {
      if (o.typeWord && UI.$('#cfWord', m).value.trim().toUpperCase() !== o.typeWord) { UI.sfx('error'); UI.toast('Palavra de confirmação incorreta.', 'bad'); return; }
      m.close(); onYes();
    });
    return m;
  };

  /* ---------------------------------------------------------------- cartas */
  /** HTML de um sticker como carta. opts: { cls, locked, isNew, showCount, showFav, noNum } */
  UI.card = function (id, opts) {
    const o = opts || {};
    const s = SP.STICKER[id];
    const own = SP.state.owned[id];
    const locked = o.locked != null ? o.locked : !own;
    const stars = own ? own.stars : 1;
    const E = SP.ELEMENT[s.el];
    const cls = ['card', 'r-' + s.rarity, 'el-' + s.el, locked ? 'locked' : '', !locked && stars >= 2 ? 's2' : '', !locked && stars >= 3 ? 's3' : '', !locked && stars >= 4 ? 's4' : '', !locked && stars >= 5 ? 's5' : '', o.cls || ''].join(' ');
    return `<div class="${cls}" data-id="${id}" style="--elc:${E.c1}" role="button" tabindex="0" aria-label="${locked ? 'Sticker desconhecido' : UI.esc(s.name)}">
      <div class="frame">
        <div class="art-box">${Art.sticker(id)}</div>
        <div class="c-top"><span class="c-num">#${String(s.num).padStart(2, '0')}</span><span class="c-el">${Art.elementIcon(s.el, 14)}</span></div>
        ${!locked && o.showCount !== false && own && own.count > 1 ? `<span class="c-count">×${own.count}</span>` : ''}
        ${!locked && own && own.fav ? `<span class="c-fav">${Art.icon('heart', 14)}</span>` : ''}
        ${o.isNew ? '<span class="c-new">NOVO!</span>' : ''}
        <div class="c-name">${locked ? '???' : UI.esc(s.name)}</div>
        <div class="c-foot"><span class="c-rar">${locked ? '?' : UI.rarityName(s.rarity)}</span><span class="stars">${locked ? '' : (own ? 'Nv' + own.level + ' ' : '') + '★'.repeat(stars)}</span></div>
        <div class="holo"></div><div class="shine"></div>
      </div></div>`;
  };

  /** Efeito de inclinação 3D com o ponteiro. */
  UI.tilt = function (el) {
    if (!el) return;
    el.classList.add('tilt');
    const move = e => {
      if (SP.state.settings.reducedMotion) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x * 22}deg) rotateX(${-y * 22}deg) scale(1.03)`;
      const sh = el.querySelector('.shine');
      if (sh) sh.style.backgroundPosition = (50 - x * 100) + '% 0';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  };

  /* ---------------------------------------------------------------- TELA INICIAL */
  UI.screens.home = function (el) {
    const st = SP.state;
    const owned = Object.keys(st.owned).sort((a, b) => SP.RARITY[SP.STICKER[b].rarity].rank - SP.RARITY[SP.STICKER[a].rarity].rank || Core.ownedPower(b) - Core.ownedPower(a));
    const show = [owned[1], owned[0], owned[2]].filter(Boolean);
    const claim = Core.claimableCount();
    const free = Core.freePackAvailable();
    const tokens = st.tokens.basic + st.tokens.premium;
    const next = Math.min(SP.STAGE_COUNT, st.campaign.cleared + 1);
    el.innerHTML = `<div class="wrap home">
      <div class="logo"><div class="orbit"></div>
        <div class="logo-main"><span>STICKER</span><span>POWERS</span></div>
        <div class="logo-sub">O Despertar dos Poderes</div>
      </div>
      <div class="showcase">${show.map(id => UI.card(id, { cls: 'sm', showCount: false })).join('')}</div>
      <div class="menu-grid">
        <button class="menu-tile play" data-go="play">${Art.icon('play')}<span>JOGAR <small style="display:block">${st.campaign.cleared >= SP.STAGE_COUNT ? 'Campanha completa! Suba a Torre Infinita' : (next > SP.ACT1_END ? 'Ato II · ' : '') + 'Fase ' + next + ' — ' + SP.stageInfo(next).region.name}</small></span></button>
        <button class="menu-tile t-album" data-go="collection">${Art.icon('album')}Coleção<small>${Core.uniqueOwned()}/${SP.STICKERS.length}</small></button>
        <button class="menu-tile t-pack" data-go="packs">${Art.icon('pack')}Abrir Pacotes<small>${free ? 'Pacote grátis disponível!' : tokens ? tokens + ' pacote(s) guardado(s)' : '&nbsp;'}</small>${free || tokens ? '<span class="notif-dot">!</span>' : ''}</button>
        <button class="menu-tile t-battle" data-go="battles">${Art.icon('swords')}Batalhas<small>Campanha · Chefes · Torre</small></button>
        <button class="menu-tile t-up" data-go="upgrades">${Art.icon('up')}Melhorias<small>Treinar · Evoluir · Forja</small></button>
        <button class="menu-tile t-mission" data-go="missions">${Art.icon('scroll')}Missões<small>Diárias e conquistas</small>${claim ? `<span class="notif-dot">${claim}</span>` : ''}</button>
        <button class="menu-tile t-settings" data-go="settings">${Art.icon('gear')}Configurações<small>Som · Animações · Save</small></button>
      </div>
      <div class="home-stats">
        <span>Coleção <b>${Math.round(Core.completion() * 100)}%</b></span>
        <span>Fases <b>${st.campaign.cleared}/${SP.STAGE_COUNT}</b></span>
        <span>Chefes <b>${Core.missionValue('bossKinds')}/${SP.BOSSES.length}</b></span>
        <span>Torre <b>${st.tower.best}</b></span>
        <span>Vitórias <b>${st.stats.battlesWon}</b></span>
      </div>
    </div>`;
    UI.$$('.showcase .card', el).forEach(c => c.addEventListener('click', () => UI.showDetail(c.dataset.id)));
    UI.$$('[data-go]', el).forEach(b => b.addEventListener('click', () => {
      UI.sfx('click');
      const g = b.dataset.go;
      if (g === 'play') {
        if (st.campaign.cleared >= SP.STAGE_COUNT) UI.go('battles', { tab: 'tower' });
        else UI.openStage(next);
      } else UI.go(g);
    }));
    if (!st.seenIntro) UI.showIntro();
  };

  UI.showIntro = function () {
    const m = UI.modal(`<h3>Bem-vindo(a) ao mundo de Sticker Powers!</h3>
      <p class="story">Os stickers mágicos despertaram. Cada um guarda um poder elemental — fogo, gelo, raio, tempo, cosmos e muito mais.
      Colecione, evolua e batalhe para enfrentar os quatro grandes chefes que ameaçam o mundo.</p>
      <div class="vs-preview" style="margin:14px 0">${SP.PROG.starters.map(id => UI.card(id, { cls: 'sm', showCount: false })).join('')}</div>
      <p class="small-txt muted">Você começa com 3 stickers e ${SP.PROG.startCoins} moedas. Abra o <b>Pacote Diário</b> grátis, vença fases para ganhar moedas
      e use duplicatas como fragmentos para evoluir. Tudo é salvo automaticamente neste navegador.</p>
      <div class="row center" style="margin-top:12px"><button class="btn gold big" id="introGo">Começar a aventura!</button></div>`, { cls: 'narrow', sticky: true, onClose: done });
    function done() { SP.state.seenIntro = true; UI.changed(); }
    UI.$('#introGo', m).addEventListener('click', () => { UI.sfx('reveal', 3); m.close(); });
  };

  /* ---------------------------------------------------------------- COLEÇÃO */
  const CF = { q: '', rarity: 'all', el: 'all', sort: 'num', status: 'all', fav: false };
  UI.compareA = null;
  UI.cmpStage = null;

  UI.screens.collection = function (el) {
    const st = SP.state;
    const n = Core.uniqueOwned(), total = SP.STICKERS.length;
    el.innerHTML = `<div class="wrap">
      <div class="coll-head panel">
        <div class="coll-progress">
          <div class="row" style="justify-content:space-between"><span class="big">${n} / ${total}</span><span class="badge">${Math.round(n / total * 100)}% completo</span></div>
          <div class="bar gold"><i style="width:${n / total * 100}%"></i></div>
          <div class="chip-row" id="elProg">${SP.ELEMENTS.map(e => { const p = Core.elementProgress(e.id); return `<span class="tag" title="${e.name}" style="${p.owned === p.total ? 'box-shadow:inset 0 0 0 1px ' + e.c1 : ''}">${Art.elementIcon(e.id, 14)} ${p.owned}/${p.total}</span>`; }).join('')}</div>
        </div>
        <div class="row"><button class="btn small ghost" id="cmpBtn">Comparar</button></div>
      </div>
      <div class="filters">
        <input class="input" id="fQ" placeholder="Pesquisar por nome..." value="${UI.esc(CF.q)}" style="flex:1;min-width:150px" aria-label="Pesquisar">
        <select class="select" id="fEl" aria-label="Elemento"><option value="all">Todos os elementos</option>${SP.ELEMENTS.map(e => `<option value="${e.id}" ${CF.el === e.id ? 'selected' : ''}>${e.name}</option>`).join('')}</select>
        <select class="select" id="fSort" aria-label="Ordenar">
          ${[['num', 'Nº do álbum'], ['power', 'Poder'], ['rarity', 'Raridade'], ['level', 'Nível'], ['name', 'Nome']].map(([v, l]) => `<option value="${v}" ${CF.sort === v ? 'selected' : ''}>Ordenar: ${l}</option>`).join('')}
        </select>
        <select class="select" id="fStatus" aria-label="Situação">
          ${[['all', 'Todos'], ['owned', 'Obtidos'], ['missing', 'Faltando']].map(([v, l]) => `<option value="${v}" ${CF.status === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <button class="chip ${CF.fav ? 'on' : ''}" id="fFav">${Art.icon('heart', 14)} Favoritos</button>
      </div>
      <div class="chip-row" id="fRar" style="margin-bottom:12px">
        <button class="chip ${CF.rarity === 'all' ? 'on' : ''}" data-r="all">Todas</button>
        ${SP.RARITIES.map(r => `<button class="chip ${CF.rarity === r.id ? 'on' : ''}" data-r="${r.id}"><span class="dot" style="background:${r.id === 'secret' ? 'conic-gradient(#ff4d6d,#ffe14d,#3ddc84,#3b8bff,#b05cff,#ff4d6d)' : r.color}"></span>${r.name}</button>`).join('')}
      </div>
      <div class="card-grid" id="grid"></div>
    </div>`;
    const grid = UI.$('#grid', el);
    const draw = () => {
      let list = SP.STICKERS.slice();
      const q = CF.q.trim().toLowerCase();
      if (q) list = list.filter(s => st.owned[s.id] && s.name.toLowerCase().indexOf(q) >= 0);
      if (CF.rarity !== 'all') list = list.filter(s => s.rarity === CF.rarity);
      if (CF.el !== 'all') list = list.filter(s => s.el === CF.el);
      if (CF.status === 'owned') list = list.filter(s => st.owned[s.id]);
      if (CF.status === 'missing') list = list.filter(s => !st.owned[s.id]);
      if (CF.fav) list = list.filter(s => st.owned[s.id] && st.owned[s.id].fav);
      const rank = s => SP.RARITY[s.rarity].rank;
      const pw = s => st.owned[s.id] ? Core.ownedPower(s.id) : -1;
      const lv = s => st.owned[s.id] ? st.owned[s.id].level + st.owned[s.id].stars * 100 : -1;
      const sorters = {
        num: (a, b) => a.num - b.num,
        power: (a, b) => pw(b) - pw(a) || a.num - b.num,
        rarity: (a, b) => rank(b) - rank(a) || a.num - b.num,
        level: (a, b) => lv(b) - lv(a) || a.num - b.num,
        name: (a, b) => (st.owned[a.id] ? 0 : 1) - (st.owned[b.id] ? 0 : 1) || a.name.localeCompare(b.name)
      };
      list.sort(sorters[CF.sort]);
      grid.innerHTML = list.length ? list.map(s => UI.card(s.id)).join('') : '<div class="empty">Nenhum sticker encontrado com esses filtros.</div>';
    };
    draw();
    const cmpBtn = UI.$('#cmpBtn', el);
    const updCmp = () => {
      cmpBtn.className = 'btn small ' + (UI.cmpStage ? 'gold' : 'ghost');
      cmpBtn.innerHTML = Art.icon('compare', 16) + ' ' + (UI.cmpStage === 'a' ? 'Escolha o 1º sticker (cancelar)' : UI.cmpStage === 'b' ? 'Escolha o 2º sticker (cancelar)' : 'Comparar');
    };
    updCmp();
    grid.addEventListener('click', e => {
      const c = e.target.closest('.card');
      if (!c) return;
      UI.sfx('click');
      const id = c.dataset.id;
      if (UI.cmpStage) {
        if (!st.owned[id]) { UI.toast('Só é possível comparar stickers que você já tem.'); return; }
        if (UI.cmpStage === 'a') { UI.compareA = id; UI.cmpStage = 'b'; updCmp(); UI.toast('Agora escolha o segundo sticker.'); return; }
        if (id === UI.compareA) { UI.toast('Escolha um sticker diferente.'); return; }
        const a = UI.compareA;
        UI.compareA = null; UI.cmpStage = null; updCmp();
        UI.showCompare(a, id);
        return;
      }
      UI.showDetail(id, c);
    });
    grid.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList.contains('card')) e.target.click(); });
    UI.$('#fQ', el).addEventListener('input', e => { CF.q = e.target.value; draw(); });
    UI.$('#fEl', el).addEventListener('change', e => { CF.el = e.target.value; draw(); });
    UI.$('#fSort', el).addEventListener('change', e => { CF.sort = e.target.value; draw(); });
    UI.$('#fStatus', el).addEventListener('change', e => { CF.status = e.target.value; draw(); });
    UI.$('#fFav', el).addEventListener('click', e => { CF.fav = !CF.fav; e.currentTarget.classList.toggle('on', CF.fav); draw(); });
    UI.$('#fRar', el).addEventListener('click', e => {
      const b = e.target.closest('[data-r]');
      if (!b) return;
      CF.rarity = b.dataset.r;
      UI.$$('#fRar .chip', el).forEach(x => x.classList.toggle('on', x === b));
      draw();
    });
    cmpBtn.addEventListener('click', () => {
      UI.sfx('click');
      if (UI.cmpStage) { UI.cmpStage = null; UI.compareA = null; }
      else { UI.cmpStage = 'a'; UI.toast('Escolha o primeiro sticker para comparar.'); }
      updCmp();
    });
    UI.redrawCollection = draw;
  };

  /* ---------------------------------------------------------------- DETALHES */
  UI.maxStat = function () {
    if (UI._maxStat) return UI._maxStat;
    const m = { hp: 0, atk: 0, def: 0, spd: 0 };
    SP.STICKERS.forEach(s => { const x = Core.statsFor(s.id, 30, 3); Object.keys(m).forEach(k => { m[k] = Math.max(m[k], x[k]); }); });
    UI._maxStat = m;
    return m;
  };
  UI.statBars = function (stats, extra) {
    const M = UI.maxStat();
    const rows = [['hp', 'Vida'], ['atk', 'Ataque'], ['def', 'Defesa'], ['spd', 'Veloc.']];
    return `<div class="stat-list">${rows.map(([k, l]) => `<span>${l}</span><div class="bar ${k === 'hp' ? 'green' : k === 'atk' ? '' : 'gold'}"><i style="width:${Math.min(100, stats[k] / M[k] * 100)}%"></i></div><b>${stats[k]}${extra && extra[k] ? `<span class="delta">+${Math.round((extra[k] - stats[k]) * 10) / 10}</span>` : ''}</b>`).join('')}
      <span>Energia</span><div class="row" style="gap:3px">${'<i style="width:10px;height:10px;background:#4ff0ff;transform:rotate(45deg);display:inline-block;border-radius:2px;box-shadow:0 0 5px #4ff0ff"></i>'.repeat(stats.en)}</div><b>${stats.en}</b></div>`;
  };
  UI.matchup = function (el) {
    const E = SP.ELEMENT[el];
    const weakTo = SP.ELEMENTS.filter(x => x.strong.indexOf(el) >= 0);
    return `<div class="matchup"><span class="muted">Forte contra:</span>${E.strong.map(x => `<span class="tag good">${Art.elementIcon(x, 13)} ${UI.elName(x)}</span>`).join('')}</div>
      <div class="matchup" style="margin-top:6px"><span class="muted">Fraco contra:</span>${weakTo.map(x => `<span class="tag bad">${Art.elementIcon(x.id, 13)} ${x.name}</span>`).join('') || '<span class="muted">—</span>'}</div>`;
  };
  UI.skillHTML = function (id, stars) {
    const sk = Core.skillFor(id, stars);
    const s = SP.STICKER[id];
    const tgt = { enemy: 'Um inimigo', allEnemies: 'Todos os inimigos', ally: 'Um aliado', allAllies: 'Toda a equipe', self: 'Si mesmo' }[sk.target];
    return `<div class="skill-box"><div class="sk-name"><span>✦ ${UI.esc(sk.name)}</span><span class="badge">${sk.cost} energia</span></div>
      <div class="small-txt" style="margin-top:4px">${UI.esc(s.skill.desc)}${sk.supreme ? ' <b style="color:#ff9cf0">(Forma Suprema: +50% de poder, custo −1)</b>' : sk.awakened ? ' <b style="color:#ffe14d">(Desperta: +25% de poder, custo −1)</b>' : ''}</div>
      <div class="small-txt muted" style="margin-top:4px">Alvo: ${tgt}</div></div>
      <div class="skill-box" style="${stars >= 2 ? '' : 'opacity:.55'}"><div class="sk-name" style="color:${SP.ELEMENT[s.el].c2}"><span>${Art.elementIcon(s.el, 14)} Talento: ${UI.elName(s.el)}</span><span class="badge">${stars >= 2 ? 'Ativo' : '🔒 Estrela 2'}</span></div>
      <div class="small-txt" style="margin-top:4px">${SP.ELEMENT[s.el].passive}</div></div>`;
  };

  UI.showDetail = function (id, fromEl) {
    const s = SP.STICKER[id];
    const own = SP.state.owned[id];
    if (!own) {
      const how = s.bossOnly ? 'Recompensa exclusiva: derrote <b>' + SP.BOSS[s.bossOnly].name + '</b> pela primeira vez.'
        : 'Pode vir em pacotes' + (Core.craftCost(id) ? ' ou ser criado na <b>Forja</b> por ' + Core.craftCost(id) + ' fragmentos.' : '.');
      const m = UI.modal(`<div class="detail"><div>${UI.card(id, { cls: 'lg' })}</div>
        <div class="info"><h3>Sticker desconhecido</h3>
        <p class="muted">Uma silhueta misteriosa... Sua energia lembra o elemento <b style="color:${SP.ELEMENT[s.el].c1}">${UI.elName(s.el)}</b>.</p>
        <p>Raridade: <b style="color:${SP.RARITY[s.rarity].color}">${UI.rarityName(s.rarity)}</b></p>
        <p class="small-txt">${how}</p>
        <div class="row" style="margin-top:14px">${!s.bossOnly ? '<button class="btn small" data-a="packs">Ir para Pacotes</button>' : '<button class="btn small red" data-a="boss">Ver Chefes</button>'}</div></div></div>`);
      UI.$$('[data-a]', m).forEach(b => b.addEventListener('click', () => { m.close(); if (b.dataset.a === 'packs') UI.go('packs'); else UI.go('battles', { tab: 'bosses' }); }));
      return;
    }
    const stats = Core.ownedStats(id);
    const cap = SP.PROG.levelCap(own.stars);
    const xpNeed = SP.PROG.xpToNext(own.level);
    const m = UI.modal(`<div class="detail"><div class="center">${UI.card(id, { cls: 'lg', showCount: false })}</div>
      <div class="info">
        <div class="row"><span class="badge" style="background:${SP.RARITY[s.rarity].color};color:#111">${UI.rarityName(s.rarity)}</span><span class="badge">${Art.elementIcon(s.el, 13)} ${UI.elName(s.el)}</span><span class="badge">${SP.ROLES[s.role].name}</span><span class="badge">Cópias: ${own.count}</span></div>
        <h3 style="margin-top:8px">${UI.esc(s.name)}</h3>
        <div class="title-line">${UI.esc(s.title)}</div>
        <div class="row small-txt"><b>Nível ${own.level}/${cap}</b><span class="stars" style="color:#ffe14d">${UI.stars(own.stars)}</span><span class="muted">Poder ${Core.ownedPower(id)}</span></div>
        ${own.level < cap ? `<div class="bar" style="margin:6px 0"><i style="width:${own.xp / xpNeed * 100}%"></i></div><div class="small-txt muted">${own.xp}/${xpNeed} XP para o próximo nível</div>` : '<div class="small-txt" style="color:#ffe14d;margin:6px 0">Nível máximo desta estrela — evolua para continuar!</div>'}
        ${UI.statBars(stats)}
        ${UI.skillHTML(id, own.stars)}
        ${UI.matchup(s.el)}
        <p class="story" style="margin-top:12px">${UI.esc(s.story)}</p>
        <div class="row" style="margin-top:12px">
          <button class="btn small ${own.fav ? 'red' : 'ghost'}" data-a="fav">${Art.icon('heart', 16)} ${own.fav ? 'Favorito' : 'Favoritar'}</button>
          <button class="btn small ghost" data-a="cmp">${Art.icon('compare', 16)} Comparar</button>
          <button class="btn small green" data-a="up">${Art.icon('up', 16)} Melhorar</button>
        </div>
      </div></div>`);
    const big = UI.$('.card.lg', m);
    UI.tilt(big);
    setTimeout(() => { SP.FX.rarityBurst(big, s.rarity); if (SP.RARITY[s.rarity].rank >= 4) UI.sfx('reveal', SP.RARITY[s.rarity].rank - 2); }, 120);
    UI.$('[data-a=fav]', m).addEventListener('click', e => {
      const f = Core.toggleFav(id);
      e.currentTarget.className = 'btn small ' + (f ? 'red' : 'ghost');
      e.currentTarget.innerHTML = Art.icon('heart', 16) + ' ' + (f ? 'Favorito' : 'Favoritar');
      UI.sfx(f ? 'heal' : 'click');
      UI.changed();
      if (UI.redrawCollection && UI.current === 'collection') UI.redrawCollection();
    });
    UI.$('[data-a=cmp]', m).addEventListener('click', () => {
      m.close();
      UI.compareA = id; UI.cmpStage = 'b';
      if (UI.current !== 'collection') UI.go('collection'); else UI.render('collection');
      UI.toast('Escolha outro sticker para comparar com <b>' + UI.esc(s.name) + '</b>.');
    });
    UI.$('[data-a=up]', m).addEventListener('click', () => { m.close(); UI.go('upgrades', { id }); });
  };

  /* ---------------------------------------------------------------- COMPARAR */
  UI.showCompare = function (a, b) {
    const A = Core.ownedStats(a), B = Core.ownedStats(b);
    const sa = SP.STICKER[a], sb = SP.STICKER[b];
    const row = (label, x, y) => `<div class="cmp-row"><span class="l ${x > y ? 'win' : ''}">${x}</span><span class="m">${label}</span><span class="${y > x ? 'win' : ''}">${y}</span></div>`;
    const mAB = SP.elementMult(sa.el, sb.el), mBA = SP.elementMult(sb.el, sa.el);
    const mtxt = m => m > 1 ? '<span class="tag good">vantagem ×' + m + '</span>' : m < 1 ? '<span class="tag bad">resistido ×' + m + '</span>' : '<span class="tag">neutro ×1</span>';
    const m = UI.modal(`<h3>Comparação</h3>
      <div class="compare"><div class="col">${UI.card(a, { cls: 'sm' })}</div><div class="col">${UI.card(b, { cls: 'sm' })}</div></div>
      <div style="margin-top:12px">
        ${row('Poder', Core.ownedPower(a), Core.ownedPower(b))}
        ${row('Nível', SP.state.owned[a].level, SP.state.owned[b].level)}
        ${row('Vida', A.hp, B.hp)}${row('Ataque', A.atk, B.atk)}${row('Defesa', A.def, B.def)}${row('Velocidade', A.spd, B.spd)}${row('Energia', A.en, B.en)}
        ${row('Raridade', SP.RARITY[sa.rarity].rank + 1, SP.RARITY[sb.rarity].rank + 1)}
      </div>
      <div class="panel small-txt" style="margin-top:12px">
        <div>${UI.esc(sa.name)} atacando ${UI.esc(sb.name)}: ${mtxt(mAB)}</div>
        <div style="margin-top:6px">${UI.esc(sb.name)} atacando ${UI.esc(sa.name)}: ${mtxt(mBA)}</div>
      </div>
      <div class="compare" style="margin-top:8px"><div>${UI.skillHTML(a, SP.state.owned[a].stars)}</div><div>${UI.skillHTML(b, SP.state.owned[b].stars)}</div></div>`);
    UI.$$('.card', m).forEach(c => UI.tilt(c));
    UI.sfx('flip');
  };
})(typeof window !== 'undefined' ? window : globalThis);
