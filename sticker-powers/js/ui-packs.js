/* =========================================================================
   STICKER POWERS — loja de pacotes, abertura animada, probabilidades e
   histórico de stickers recebidos.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP, UI = SP.UI, Core = SP.Core, Art = SP.Art;

  const PACK_ICON = { gift: 'pack', pack: 'pack', flame: null, drop: null, star: null, event: 'crown', crown: 'crown', cosmic: 'essence' };
  function packIcon(p) {
    if (p.icon === 'flame') return Art.elementIcon('fire', 34);
    if (p.icon === 'drop') return Art.elementIcon('water', 34);
    if (p.icon === 'star') return Art.elementIcon('cosmic', 34);
    return `<span style="color:#fff">${Art.icon(PACK_ICON[p.icon] || 'pack', 34)}</span>`;
  }
  UI.packVisual = function (p) {
    return `<div class="pack-visual" style="--p1:${p.colors[0]};--p2:${p.colors[1]}"><div><div class="p-ico">${packIcon(p)}</div><div class="p-logo">STICKER<br>POWERS<br><span style="font-size:10px;opacity:.85">${UI.esc(p.name.replace('Pacote ', ''))}</span></div></div></div>`;
  };

  function costHTML(p) {
    const pay = Core.packPayment(p.id);
    if (p.daily) return pay.ok ? '<span class="cost">GRÁTIS</span>' : '';
    if (SP.state.tokens[p.id] > 0) return `<span class="cost">🎟️ ${SP.state.tokens[p.id]} guardado(s)</span>`;
    if (p.cost.coins) return `<span class="cost">${Art.icon('coin', 16)} ${p.cost.coins}</span>`;
    return `<span class="cost">${Art.icon('essence', 16)} ${p.cost.essence}</span>`;
  }

  /* ---------------------------------------------------------------- tela de pacotes */
  UI.screens.packs = function (el) {
    const ev = Core.currentEvent();
    el.innerHTML = `<div class="wrap">
      <div class="panel event-banner">
        <div style="flex:1;min-width:200px"><div class="badge" style="background:#ff4fb8">EVENTO DA SEMANA</div>
          <h3 style="margin:6px 0 2px;font-family:var(--font-display)">${UI.esc(ev.name)}</h3>
          <div class="small-txt muted">No Pacote de Evento, stickers destes elementos têm peso ${SP.EVENT_WEIGHT}× dentro da sua raridade. Termina em <b id="evLeft">${UI.fmtTime(ev.endsAt - Date.now())}</b> (relógio do dispositivo).</div></div>
        <div class="ev-els">${ev.elements.map(e => `<span class="tag" style="font-size:14px">${Art.elementIcon(e, 18)} ${UI.elName(e)}</span>`).join('')}</div>
      </div>
      <div class="row" style="justify-content:space-between;margin-bottom:12px">
        <h2 class="section" style="margin:0">Escolha um pacote</h2>
        <div class="row"><button class="btn small ghost" id="histBtn">${Art.icon('history', 16)} Histórico</button><button class="btn small ghost" id="forgeBtn">${Art.icon('forge', 16)} Forja</button></div>
      </div>
      <div class="pack-grid" id="packGrid"></div>
      <p class="small-txt muted" style="margin-top:16px">Todas as moedas são fictícias e obtidas jogando — não existem compras com dinheiro real. Duplicatas viram fragmentos automaticamente.
      Toque em “Probabilidades” para ver as chances exatas usadas no sorteio.</p>
    </div>`;
    const grid = UI.$('#packGrid', el);
    const draw = () => {
      grid.innerHTML = SP.PACKS.map(p => {
        const pay = Core.packPayment(p.id);
        let extra = '';
        if (p.daily && !pay.ok) extra = `<div class="small-txt muted">Próximo em <b class="dailyLeft">${UI.fmtTime(Core.msToMidnight())}</b></div>`;
        return `<div class="panel pack-item" data-p="${p.id}">
          ${UI.packVisual(p)}
          <b style="font-size:17px">${UI.esc(p.name)}</b>
          <div class="pdesc">${UI.esc(p.desc)} <br>${p.count} stickers.</div>
          <button class="btn ${p.daily ? 'green' : p.id === 'premium' ? 'gold' : ''}" data-open="${p.id}" ${pay.ok ? '' : 'disabled'}>Abrir ${costHTML(p)}</button>
          ${extra}
          <button class="chip" data-odds="${p.id}">${Art.icon('info', 14)} Probabilidades</button>
        </div>`;
      }).join('');
    };
    draw();
    grid.addEventListener('click', e => {
      const o = e.target.closest('[data-open]');
      const d = e.target.closest('[data-odds]');
      const v = e.target.closest('.pack-visual');
      if (d) { UI.sfx('click'); UI.showOdds(d.dataset.odds); return; }
      const id = o ? o.dataset.open : v ? v.closest('[data-p]').dataset.p : null;
      if (!id) return;
      const pay = Core.packPayment(id);
      if (!pay.ok) { UI.sfx('error'); UI.toast(pay.reason, 'bad'); return; }
      UI.openPack(id, draw);
    });
    UI.$('#histBtn', el).addEventListener('click', () => { UI.sfx('click'); UI.showHistory(); });
    UI.$('#forgeBtn', el).addEventListener('click', () => { UI.sfx('click'); UI.go('upgrades', { tab: 'forge' }); });
    UI.timer = setInterval(() => {
      const l = UI.$('#evLeft', el); if (l) l.textContent = UI.fmtTime(Core.currentEvent().endsAt - Date.now());
      UI.$$('.dailyLeft', el).forEach(x => { x.textContent = UI.fmtTime(Core.msToMidnight()); });
      if (Core.freePackAvailable() && UI.$('.dailyLeft', el)) draw();
    }, 1000);
  };

  /* ---------------------------------------------------------------- probabilidades */
  UI.showOdds = function (packId) {
    const p = SP.PACK[packId];
    const odds = Core.packOdds(packId);
    const pct = x => x === 0 ? '0%' : (x * 100).toFixed(x < 0.01 ? 2 : 1).replace('.', ',') + '%';
    const rarTable = o => `<table class="odds-table"><tr><th>Raridade</th><th>Stickers</th><th class="num">Chance por sticker sorteado</th></tr>
      ${o.rarities.map(r => `<tr><td><b style="color:${SP.RARITY[r.id].color}">${UI.rarityName(r.id)}</b></td><td>${r.count}</td><td class="num">${pct(r.p)}</td></tr>`).join('')}</table>`;
    let guarantee = '';
    if (p.guarantee) {
      const g = Core.packOdds(packId, null, { minRank: p.guarantee.minRank });
      guarantee = `<h4>Slot ${p.guarantee.slot + 1} (garantido ${UI.rarityName(SP.RARITIES[p.guarantee.minRank].id)} ou melhor)</h4>${rarTable(g)}`;
    }
    const m = UI.modal(`<h3>Probabilidades — ${UI.esc(p.name)}</h3>
      <p class="small-txt muted">Estes são os valores exatos usados pelo código do sorteio. Cada um dos ${p.count} stickers é sorteado de forma independente.
      ${p.elements ? 'Apenas stickers de ' + p.elements.map(UI.elName).join(', ') + '. ' : ''}Se uma raridade não tiver nenhum sticker disponível neste pacote, sua chance é redistribuída proporcionalmente entre as outras (já refletido na tabela).
      Stickers exclusivos de chefes nunca aparecem em pacotes.</p>
      <h4>${p.guarantee ? 'Slots 1 e 2' : 'Todos os slots'}</h4>${rarTable(odds)}${guarantee}
      <details style="margin-top:12px"><summary style="cursor:pointer;font-weight:800">Ver chance de cada sticker</summary>
      <table class="odds-table" style="margin-top:8px"><tr><th>Sticker</th><th>Raridade</th><th class="num">Chance</th></tr>
      ${odds.stickers.slice().sort((a, b) => b.p - a.p).map(x => { const s = SP.STICKER[x.id]; const own = SP.state.owned[x.id]; return `<tr><td>${own ? UI.esc(s.name) : '??? <span class="muted">(' + UI.elName(s.el) + ')</span>'}${x.featured ? ' <span class="tag good">destaque</span>' : ''}</td><td style="color:${SP.RARITY[s.rarity].color}">${UI.rarityName(s.rarity)}</td><td class="num">${pct(x.p)}</td></tr>`; }).join('')}
      </table></details>`, { cls: 'narrow' });
    return m;
  };

  /* ---------------------------------------------------------------- histórico */
  UI.showHistory = function () {
    const h = SP.state.history;
    UI.modal(`<h3>Histórico de stickers recebidos</h3><p class="small-txt muted">Últimos ${h.length} de ${SP.state.stats.stickersObtained} recebidos.</p>
      <div class="history-list">${h.length ? h.map(x => {
        const s = SP.STICKER[x.id];
        return `<div class="history-item" style="--rc:${SP.RARITY[s.rarity].color}"><div class="mini">${Art.sticker(x.id)}</div>
          <div><b>${UI.esc(s.name)}</b> <span style="color:${SP.RARITY[s.rarity].color}">${UI.rarityName(s.rarity)}</span><div class="muted">${UI.esc(x.pack)} · ${new Date(x.at).toLocaleString('pt-BR')}</div></div>
          <div>${x.isNew ? '<span class="tag good">NOVO</span>' : `<span class="tag">+${x.frags} ${Art.icon('frag', 12)}</span>`}</div></div>`;
      }).join('') : '<div class="empty">Nenhum sticker recebido ainda. Abra um pacote!</div>'}</div>`, { cls: 'narrow' });
  };

  /* ---------------------------------------------------------------- abertura */
  UI.openPack = function (packId, onDone) {
    const p = SP.PACK[packId];
    const res = Core.openPack(packId);
    if (!res.ok) { UI.sfx('error'); UI.toast(res.reason, 'bad'); return; }
    UI.changed(); // o resultado já está salvo antes de qualquer animação
    if (onDone) onDone();
    const ov = document.createElement('div');
    ov.className = 'opening';
    ov.innerHTML = `<div class="stage-pack">${UI.packVisual(p)}</div>
      <div class="hint">Toque no pacote para abrir!</div>
      <button class="btn ghost small" id="opSkip">Pular animação</button>`;
    document.body.appendChild(ov);
    SP.Audio.unlock();
    let opened = false;
    const bestRank = Math.max.apply(null, res.results.map(r => SP.RARITY[SP.STICKER[r.id].rarity].rank));
    const tear = async (skip) => {
      if (opened) return;
      opened = true;
      const sp = UI.$('.stage-pack', ov);
      if (!skip && !SP.state.settings.reducedMotion) {
        sp.classList.add('charging');
        UI.$('.hint', ov).textContent = bestRank >= 4 ? 'Uma energia poderosa está escapando...!' : 'Abrindo...';
        for (let i = 0; i < 5; i++) { UI.sfx('packShake'); await UI.sleep(140); }
        if (bestRank >= 4) { SP.FX.at(sp, { colors: SP.FX.RARITY_COLORS[SP.RARITIES[bestRank].id], count: 30, speed: 180 }); await UI.sleep(450); }
        sp.classList.remove('charging');
        // o pacote rasga ao meio
        const pv = sp.querySelector('.pack-visual');
        ['top', 'bot'].forEach(k => { const h = pv.cloneNode(true); h.classList.add('pack-half', k); sp.appendChild(h); });
        sp.classList.add('torn');
      }
      UI.sfx('packOpen');
      SP.FX.flash(bestRank >= 4 ? SP.RARITIES[bestRank].color : '#fff', 500);
      SP.FX.at(sp, { style: 'confetti', count: 60, speed: 420 });
      await UI.sleep(skip ? 0 : 380);
      showCards(skip);
    };
    UI.$('.stage-pack', ov).addEventListener('click', () => tear(false));
    UI.$('#opSkip', ov).addEventListener('click', () => tear(true));

    function showCards(skipAll) {
      ov.innerHTML = `<div class="rar-label" id="rarLabel">&nbsp;</div>
        <div class="reveal-row">${res.results.map((r, i) => {
          const s = SP.STICKER[r.id], R = SP.RARITY[s.rarity];
          const glow = R.rank >= 2 ? `glow ${R.rank >= 4 ? 'hard' : ''}` : '';
          const n = res.results.length, off = (i - (n - 1) / 2);
          return `<div class="flip ${skipAll ? '' : 'fly-in'}" data-i="${i}" style="--fx:${-off * 120}px;--fr:${off * 25}deg;animation-delay:${i * 0.12}s;--rc:${R.rank >= 6 ? '#b9fffb' : R.color}">${R.rank >= 4 ? '<div class="rays"></div>' : ''}<div class="inner">
            <div class="face back ${glow}" style="--gc:${R.rank >= 6 ? '#b9fffb' : R.color}"><div class="bk-logo">STICKER<br>POWERS<br>?</div></div>
            <div class="face front">${UI.card(r.id, { isNew: r.isNew, showCount: false })}</div></div>
            <div class="result-tag ${r.isNew ? 'new' : 'dup'}">${r.isNew ? '★ NOVO NA COLEÇÃO!' : 'Duplicata → +' + r.frags + ' fragmentos'}</div></div>`;
        }).join('')}</div>
        <div class="hint" id="opHint">Toque nas cartas para revelar</div>
        <div class="row center actions">
          <button class="btn ghost" id="opAll">Revelar todas</button>
          <button class="btn" id="opAgain" hidden>Abrir outro ${costHTML(p)}</button>
          <button class="btn ghost" id="opClose" hidden>Fechar</button>
        </div>`;
      const flips = UI.$$('.flip', ov);
      let revealed = 0;
      const reveal = (f, quiet) => {
        if (f.classList.contains('open')) return;
        f.classList.add('open');
        revealed++;
        const r = res.results[+f.dataset.i];
        const s = SP.STICKER[r.id], R = SP.RARITY[s.rarity];
        const label = UI.$('#rarLabel', ov);
        label.textContent = R.name + '!';
        label.style.color = R.rank >= 6 ? '#b9fffb' : R.color;
        label.style.animation = 'none'; void label.offsetWidth; label.style.animation = '';
        UI.sfx('flip');
        setTimeout(() => {
          SP.FX.rarityBurst(f, s.rarity);
          if (!quiet || R.rank >= 3) UI.sfx('reveal', R.rank);
          if (R.rank >= 4) { SP.FX.flash(R.rank >= 6 ? '#b9fffb' : R.color, 600); SP.FX.shake(UI.$('.reveal-row', ov), true); }
          if (R.rank >= 5) SP.FX.at(f, { style: SP.STICKER[r.id].el, count: 60, speed: 380, size: 8 });
          UI.tilt(f.querySelector('.card'));
        }, 260);
        if (revealed === flips.length) done();
      };
      flips.forEach(f => f.addEventListener('click', () => {
        if (f.classList.contains('open')) { UI.showDetail(res.results[+f.dataset.i].id); return; }
        reveal(f);
      }));
      UI.$('#opAll', ov).addEventListener('click', async () => {
        for (const f of flips) { reveal(f, true); if (!skipAll) await UI.sleep(280); }
      });
      if (skipAll) flips.forEach(f => reveal(f, true));
      UI.$('#opClose', ov).addEventListener('click', () => { UI.sfx('click'); ov.remove(); SP.FX.clear(); if (onDone) onDone(); });
      UI.$('#opAgain', ov).addEventListener('click', () => {
        const pay = Core.packPayment(packId);
        if (!pay.ok) { UI.sfx('error'); UI.toast(pay.reason, 'bad'); return; }
        ov.remove(); SP.FX.clear(); UI.openPack(packId, onDone);
      });
      function done() {
        UI.$('#opAll', ov).hidden = true;
        UI.$('#opClose', ov).hidden = false;
        const again = UI.$('#opAgain', ov);
        again.hidden = false;
        again.innerHTML = 'Abrir outro ' + costHTML(p);
        again.disabled = !Core.packPayment(packId).ok;
        const best = SP.RARITIES[bestRank];
        const label = UI.$('#rarLabel', ov);
        label.textContent = res.results.length > 1 ? 'Melhor: ' + best.name + '!' : best.name + '!';
        label.style.color = bestRank >= 6 ? '#b9fffb' : best.color;
        const news = res.results.filter(r => r.isNew).length;
        const frags = res.results.reduce((a, r) => a + r.frags, 0);
        UI.$('#opHint', ov).innerHTML = `${news ? '<b style="color:#ffe14d">' + news + ' novo(s)!</b> ' : ''}${frags ? '+' + frags + ' fragmentos de duplicatas. ' : ''}Toque numa carta para ver detalhes.`;
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
