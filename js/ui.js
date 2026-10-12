// =====================================================================
//  ui.js — interface em DOM sobre o canvas (diálogos, HUD, menus, toque)
// =====================================================================
'use strict';

const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };

const SPEAKERS = {
  V: { name: 'V', portrait: 'v', color: '#e8c48a' },
  Gustavo: { name: 'Gustavo', cast: 'Gustavo_casa', color: '#f08a6a' },
  Teo: { name: 'Téo', cast: 'Teo', color: '#8ab4e8' },
  TeoT: { name: 'Téo', cast: 'Teo_terno', color: '#8ab4e8' },
  Larissa: { name: 'Larissa', cast: 'Larissa', color: '#e8a888' },
  MaeTeo: { name: 'Mãe do Téo', cast: 'MaeTeo', color: '#c8b8a8' },
  Mulher: { name: 'Mulher no telefone', cast: 'MulherBoleto', color: '#a8c4e0' },
  Menino: { name: 'Menino', cast: 'Menino', color: '#f2c94c' },
  MaeMenino: { name: 'Mãe do menino', cast: 'MaeMenino', color: '#8fc0a9' },
  Senhor: { name: 'Seu Arlindo', cast: 'SenhorPombos', color: '#d8c8a8' },
  Rayan: { name: '???', cast: 'Rayan', color: '#7aa8f0' },
  Entregador: { name: 'Entregador', cast: 'Entregador', color: '#f08a7a' },
  Vizinho: { name: 'Vizinho', cast: 'Vizinho', color: '#b8c8e0' },
  Padeiro: { name: 'Seu Manoel', cast: 'Padeiro', color: '#e8dcc0' },
  Enfermeira: { name: 'Enfermeira', cast: 'Enfermeira', color: '#7fc4c0' },
  Enfermeiro: { name: 'Enfermeiro', cast: 'Enfermeiro', color: '#8aa4d6' },
  Senhora: { name: 'Dona Cida', cast: 'SenhoraDiag', color: '#d8b0d4' },
  Kauan: { name: 'Kauan', cast: 'DonoPipoca', color: '#b89ae8' },
  Zeca: { name: 'Zeca do bar', cast: 'Zeca', color: '#e8e0d0' },
  Pedestre: { name: 'Pedestre', cast: 'Pedestre1', color: '#ccc' },
  Convidado: { name: 'Convidado', cast: 'Convidado1', color: '#bbb' },
  Moca: { name: 'Adolescente', cast: 'Adolescente', color: '#f0a0c0' },
  Vo: { name: 'Vó Dita', color: '#e8d4b0' },
  Van: { name: 'A Van', color: '#a9d6c8', van: true },
  Radio: { name: 'Rádio', color: '#a9d6c8', van: true },
  Celular: { name: 'Celular', color: '#9ad' },
  Narr: { name: '', color: '#ccc' },
};

const UI = {
  root: null, dlg: null, typing: null, open: 0, modal: null, toastQ: [], touchOn: false,
  portraits: {},
  init() {
    this.root = $('#ui');
    this.hudCanvas = $('#labels'); this.hctx = this.hudCanvas.getContext('2d');
    this.fit(); window.addEventListener('resize', () => this.fit());
    this.touchOn = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (this.touchOn) document.body.classList.add('touch');
    this.buildTouch();
    $('#dialog').addEventListener('pointerdown', e => { if (!e.target.closest('.choice')) this.advance(); });
  },
  fit() {
    const r = canvas.getBoundingClientRect();
    for (const e of [this.root, this.hudCanvas]) { e.style.left = r.left + 'px'; e.style.top = r.top + 'px'; e.style.width = r.width + 'px'; e.style.height = r.height + 'px'; }
    document.documentElement.style.setProperty('--u', (r.height / 270) + 'px');
    const dpr = window.devicePixelRatio || 1;
    this.hudCanvas.width = Math.round(r.width * dpr); this.hudCanvas.height = Math.round(r.height * dpr);
    this.hscale = r.width / W * dpr;
  },
  blocking() { return this.open > 0 || !!this.modal || G.state !== 'play'; },

  portrait(key) {
    const sp = SPEAKERS[key] || {};
    if (sp.portrait === 'v') return 'assets/v_retrato.png';
    if (sp.van) return this.vanPortrait();
    if (!sp.cast) return null;
    if (this.portraits[key]) return this.portraits[key];
    const set = Sprites.human(sp.cast, CAST[sp.cast]);
    const [c, x] = Art.mk(22, 22);
    x.fillStyle = '#2a2622'; x.fillRect(0, 0, 22, 22);
    x.drawImage(set.down[0], 0, 0, 22, 22, 0, 2, 22, 22);
    return (this.portraits[key] = c.toDataURL());
  },
  vanPortrait() {
    if (this.portraits.__van) return this.portraits.__van;
    const [c, x] = Art.mk(40, 40);
    x.fillStyle = '#1f2a2a'; x.fillRect(0, 0, 40, 40);
    x.drawImage(Beasts.van(true, 0), 22, 4, 44, 36, 0, 4, 44, 36);
    return (this.portraits.__van = c.toDataURL());
  },

  // ---------------- diálogo
  say(who, text, opts = {}) {
    return new Promise(res => {
      this.open++;
      const d = $('#dialog'); d.className = 'show' + (opts.thought ? ' thought' : '') + (who === 'Narr' ? ' narr' : '') + ((SPEAKERS[who] || {}).van ? ' vanbox' : '');
      const sp = SPEAKERS[who] || { name: who, color: '#ddd' };
      const pimg = opts.thought ? 'assets/v_retrato.png' : this.portrait(who);
      $('#dlg-portrait').style.display = pimg && who !== 'Narr' ? 'block' : 'none';
      if (pimg) $('#dlg-portrait').src = pimg;
      $('#dlg-portrait').className = (sp.portrait === 'v' || opts.thought) ? 'hi' : 'lo';
      $('#dlg-name').textContent = opts.thought ? 'V (pensando)' : (opts.name || sp.name);
      $('#dlg-name').style.color = sp.color;
      $('#dlg-choices').innerHTML = '';
      const tEl = $('#dlg-text'); tEl.textContent = '';
      $('#dlg-next').style.visibility = 'hidden';
      const full = text;
      let i = 0, acc = 0;
      const speed = opts.speed || 52;
      this.typing = {
        done: false,
        tick: dt => {
          if (this.typing.done) return;
          acc += dt * speed;
          while (acc >= 1 && i < full.length) {
            acc -= 1; i++;
            const ch = full[i - 1];
            if (ch === ',' ) acc -= 2; else if ('.!?—'.includes(ch)) acc -= 5;
            if (i % 2 === 0 && ch !== ' ') Audio2.sfx('type');
          }
          tEl.textContent = full.slice(0, i);
          if (i >= full.length) this.finishTyping();
        },
        finish: () => { i = full.length; tEl.textContent = full; },
        res: () => { this.open--; this.typing = null; d.className = ''; res(); },
        autoT: opts.auto,
      };
    });
  },
  finishTyping() { if (!this.typing) return; this.typing.finish(); this.typing.done = true; $('#dlg-next').style.visibility = 'visible'; },
  advance() {
    if (!this.typing || this.choosing) return;
    if (!this.typing.done) this.finishTyping();
    else { Audio2.sfx('blip'); this.typing.res(); }
  },
  update(dt) {
    if (this.typing) {
      this.typing.tick(dt);
      if (this.typing && this.typing.done && this.typing.autoT !== undefined) { this.typing.autoT -= dt; if (this.typing.autoT <= 0) this.typing.res(); }
      else if (Input.hit('act') && !this.choosing) { Input.consume('act'); this.advance(); }
    }
    if (this.choosing) this.choosing.update(dt);
    // toasts
    if (this.toastQ.length && !this.toastBusy) {
      const t = this.toastQ.shift(); this.toastBusy = true;
      const e = $('#toast'); e.className = 'show ' + (t.kind || '');
      e.innerHTML = `<small>${t.title}</small><b>${t.text}</b>`;
      setTimeout(() => { e.className = ''; setTimeout(() => this.toastBusy = false, 400); }, this.toastQ.length > 1 ? 1300 : 2400);
    }
  },
  choose(options, opts = {}) {
    // options: [{t:'texto', when?}] ou strings
    return new Promise(res => {
      const opt = options.map(o => typeof o === 'string' ? { t: o } : o).filter(o => !o.hidden);
      this.open++;
      const d = $('#dialog');
      if (!d.classList.contains('show')) { d.className = 'show'; $('#dlg-name').textContent = opts.name || 'V'; $('#dlg-name').style.color = SPEAKERS.V.color; $('#dlg-portrait').src = 'assets/v_retrato.png'; $('#dlg-portrait').className = 'hi'; $('#dlg-portrait').style.display = 'block'; }
      $('#dlg-text').textContent = opts.prompt || '';
      $('#dlg-next').style.visibility = 'hidden';
      const box = $('#dlg-choices'); box.innerHTML = '';
      let sel = 0;
      const els = opt.map((o, i) => {
        const e = el('div', 'choice' + (o.fade ? ' fading' : ''), o.t);
        e.addEventListener('pointerdown', ev => { ev.stopPropagation(); pick(i); });
        box.appendChild(e); return e;
      });
      const alive = opt.map(() => true);
      const render = () => els.forEach((e, i) => e.classList.toggle('sel', i === sel));
      render();
      const pick = i => {
        if (!alive[i]) return;
        Audio2.sfx('select');
        this.choosing = null; this.open--; box.innerHTML = ''; d.className = ''; res(i);
      };
      this.choosing = {
        t: 0,
        update: dt => {
          this.choosing.t += dt;
          opt.forEach((o, i) => {
            if (o.fade && alive[i]) {
              const k = 1 - this.choosing.t / o.fade;
              els[i].style.opacity = Math.max(0, k);
              if (k <= 0) { alive[i] = false; els[i].style.display = 'none'; if (sel === i) { sel = alive.indexOf(true); render(); } }
            }
          });
          const move = d => { let n = sel; for (let k = 0; k < opt.length; k++) { n = (n + d + opt.length) % opt.length; if (alive[n]) break; } sel = n; Audio2.sfx('blip'); render(); };
          if (Input.hit('up') || Input.hit('left')) move(-1);
          if (Input.hit('down') || Input.hit('right')) move(1);
          if (Input.hit('act')) { Input.consume('act'); pick(sel); }
        },
      };
    });
  },

  // ---------------- tela de narração (citações do livro)
  narrate(lines, opts = {}) {
    return new Promise(res => {
      this.open++;
      const n = $('#narr'); n.className = 'show' + (opts.light ? ' light' : '');
      n.innerHTML = '';
      const arr = Array.isArray(lines) ? lines : [lines];
      let i = 0;
      const next = () => {
        if (i >= arr.length) { n.className = ''; this.open--; this.modal = null; setTimeout(res, 350); return; }
        const p = el('p', 'nline', arr[i]); n.appendChild(p);
        requestAnimationFrame(() => p.classList.add('in'));
        i++;
      };
      next();
      let cool = 0.6;
      this.modal = {
        update: dt => {
          cool -= dt;
          if (cool <= 0 && (Input.hit('act') || this._tap)) { Input.consume('act'); this._tap = false; cool = 0.5; Audio2.sfx('blip'); if (n.children.length >= 4) n.innerHTML = ''; next(); }
        },
      };
      n.onpointerdown = () => { this._tap = true; };
    });
  },
  chapterCard(num, title, sub) {
    return new Promise(res => {
      const c = $('#card');
      c.innerHTML = `<div class="cnum">${num}</div><div class="ctitle">${title}</div>${sub ? `<div class="csub">${sub}</div>` : ''}`;
      c.className = 'show';
      Audio2.sfx('bell');
      setTimeout(() => { c.className = 'show out'; setTimeout(() => { c.className = ''; res(); }, 900); }, 3200);
    });
  },

  // ---------------- HUD
  setObjective(text) { G.objective = text; const o = $('#objective'); o.innerHTML = text ? `<span>◆</span> ${text}` : ''; o.classList.remove('flash'); void o.offsetWidth; if (text) o.classList.add('flash'); },
  setTime(label) { G.timeLabel = label; $('#timelabel').textContent = label || ''; },
  toast(title, text, kind) { this.toastQ.push({ title, text, kind }); },
  hint(text, t = 2.6) { const h = $('#hint'); h.textContent = text; h.className = 'show'; clearTimeout(this._ht); this._ht = setTimeout(() => h.className = '', t * 1000); },
  prompt(text) { const p = $('#prompt'); if (p._t !== text) { p._t = text; p.innerHTML = text ? text : ''; p.className = text ? 'show' : ''; } },
  drawPowerBar() {
    const bar = $('#powers');
    const keys = ['tk', 'undo', 'blink', 'create', 'perceive', 'freeze', 'van'].filter(k => G.powers[k]);
    const sig = keys.join(',');
    if (bar._sig !== sig) {
      bar._sig = sig; bar.innerHTML = '';
      for (const k of keys) {
        const b = el('div', 'pw', `<i class="ic ic-${k}"></i><em>${POWERS[k].key}</em><div class="cdm"></div>`);
        b.title = POWERS[k].name; b.dataset.k = k; bar.appendChild(b);
      }
    }
    for (const b of bar.children) {
      const k = b.dataset.k, cd = Powers.cd[k] || 0;
      b.querySelector('.cdm').style.height = (cd > 0 ? (cd / POWERS[k].cd) * 100 : 0) + '%';
      b.classList.toggle('active', (k === 'tk' && !!G.player.held) || (k === 'freeze' && G.frozen > 0) || (k === 'perceive' && G.perceive > 0));
    }
  },
  hud(show) { $('#hud').style.display = show ? 'block' : 'none'; },

  // ---------------- rótulos no mundo (canvas de alta resolução)
  drawLabels() {
    const c = this.hctx, s = this.hscale;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);
    if (G.state !== 'play' || !G.map) return;
    const ox = -G.cam.x, oy = -G.cam.y;
    c.textAlign = 'center'; c.textBaseline = 'bottom';
    const label = (x, y, txt, col = '#fff', size = 6.5, bg = 'rgba(10,8,14,.72)') => {
      c.font = `${Math.round(size * s)}px "Pixelify Sans", "VT323", monospace`;
      const lines = txt.split('\n');
      const lw = Math.max(...lines.map(l => c.measureText(l).width)) + 8 * s, lh = size * s * 1.15;
      const X = (x + ox) * s, Y = (y + oy) * s;
      c.fillStyle = bg; c.fillRect(X - lw / 2, Y - lh * lines.length - 3 * s, lw, lh * lines.length + 3 * s);
      c.fillStyle = col;
      lines.forEach((l, i) => c.fillText(l, X, Y - lh * (lines.length - 1 - i) - 1.5 * s));
    };
    // percepção: o formato da vida das pessoas
    if (G.perceive > 0) {
      const a = Math.min(1, G.perceive, (6 - G.perceive) * 3);
      c.globalAlpha = a;
      for (const e of G.entities) if (e.perceive && !e.hidden) label(e.x, e.y - 40, typeof e.perceive === 'function' ? e.perceive() : e.perceive, '#d8c8ff', 5.5, 'rgba(30,14,50,.8)');
      for (const p of World.props) if (p.perceive && !p.hidden) label(p.x + p.w / 2, p.y - 2, p.perceive, '#d8c8ff', 5.5, 'rgba(30,14,50,.8)');
      c.globalAlpha = 1;
    }
    // nomes curtos acima de NPCs próximos
    for (const e of G.entities) {
      if (e instanceof NPC && e.label && !e.hidden && U.dist(e.x, e.y, G.player.x, G.player.y) < 60 && !G.cutscene) label(e.x, e.y - 37, e.label, '#f4ead8', 5);
    }
    if (G.floatText) for (const f of G.floatText) { c.globalAlpha = Math.min(1, f.life); label(f.x, f.y, f.text, f.col || '#fff', f.size || 6, f.bg); }
    c.globalAlpha = 1;
  },

  // ---------------- menu de criação
  showCreate(on) {
    const m = $('#create');
    if (!on) { m.className = ''; return; }
    const list = Powers.creatable();
    m.innerHTML = '<h4>Criar — o que você quer que exista?</h4>' + list.map((k, i) => `<div class="cr ${i === Powers.createSel ? 'sel' : ''}" data-i="${i}"><i class="it it-${k}"></i><b>${CREATABLE[k].name}</b><small>${CREATABLE[k].desc}</small></div>`).join('') + '<p class="tip">← → escolher · E criar · C/Esc cancelar</p>';
    m.querySelectorAll('.cr').forEach(e => e.onpointerdown = () => { Powers.createSel = +e.dataset.i; Powers.createMenu = false; UI.showCreate(false); Powers.create(list[Powers.createSel]); });
    m.className = 'show';
  },

  // ---------------- diário (missões + caderno)
  toggleJournal() {
    const j = $('#journal');
    if (j.classList.contains('show')) { j.className = ''; this.modal = null; return; }
    this.renderJournal('missoes');
    j.className = 'show';
    this.modal = { update: () => { if (Input.hit('journal') || Input.hit('back')) { Input.consume('journal'); Input.consume('back'); j.className = ''; this.modal = null; } if (Input.hit('left') || Input.hit('right')) { this._jtab = this._jtab === 'missoes' ? 'caderno' : this._jtab === 'caderno' ? 'poderes' : 'missoes'; this.renderJournal(this._jtab); } } };
  },
  renderJournal(tab) {
    this._jtab = tab;
    const j = $('#journal');
    const qs = Object.values(G.quests);
    const main = qs.filter(q => q.main), side = qs.filter(q => !q.main);
    const qhtml = q => `<div class="q ${q.done ? 'done' : ''}"><b>${q.done ? '✔' : '◇'} ${q.title}</b><p>${q.done ? (q.doneText || q.desc) : q.desc}</p></div>`;
    let body = '';
    if (tab === 'missoes') body = `<h3>Principal</h3>${main.filter(q => !q.done).map(qhtml).join('') || '<p class="empty">—</p>'}<h3>Secundárias</h3>${side.map(qhtml).join('') || '<p class="empty">Nenhuma ainda. As pessoas na rua têm coisas que você poderia consertar.</p>'}<h3>Concluídas</h3>${main.filter(q => q.done).map(qhtml).join('') || '<p class="empty">—</p>'}`;
    else if (tab === 'caderno') {
      const pages = Object.keys(NOTEBOOK).filter(k => G.flags['nb_' + k]);
      body = `<div class="nb">${pages.map(k => `<div class="pg"><h5>${NOTEBOOK[k].t}</h5><p>${NOTEBOOK[k].x}</p></div>`).join('') || '<p class="empty">Caderno vazio.</p>'}</div><p class="tip">Páginas encontradas: ${pages.filter(k => NOTEBOOK[k].page).length} / ${Object.values(NOTEBOOK).filter(n => n.page).length}</p>`;
    } else {
      body = Object.keys(POWERS).filter(k => G.powers[k]).map(k => `<div class="q"><b><i class="ic ic-${k}"></i> ${POWERS[k].name} <em>[${POWERS[k].key}]</em></b><p>${POWERS[k].desc}</p></div>`).join('') || '<p class="empty">Nenhum poder... ainda.</p>';
      body += `<div class="stats">Coisas desfeitas: ${G.stats.desfeitos} · Missões secundárias: ${G.stats.sideDone} · Peso: ${'▮'.repeat(Math.min(10, G.peso))}${'▯'.repeat(Math.max(0, 10 - G.peso))}</div>`;
    }
    j.innerHTML = `<div class="jtabs"><span class="${tab === 'missoes' ? 'on' : ''}" data-t="missoes">Missões</span><span class="${tab === 'caderno' ? 'on' : ''}" data-t="caderno">Caderno</span><span class="${tab === 'poderes' ? 'on' : ''}" data-t="poderes">Poderes</span><i class="x">✕</i></div><div class="jbody">${body}</div><p class="tip">← → trocar aba · J/Esc fechar</p>`;
    j.querySelectorAll('.jtabs span').forEach(s => s.onpointerdown = () => this.renderJournal(s.dataset.t));
    j.querySelector('.x').onpointerdown = () => { j.className = ''; this.modal = null; };
  },

  // ---------------- pausa
  togglePause() {
    const p = $('#pause');
    if (p.classList.contains('show')) { p.className = ''; this.modal = null; return; }
    p.innerHTML = `<h2>Pausado</h2>
      <div class="pm" data-a="voltar">Continuar</div>
      <div class="pm" data-a="diario">Diário</div>
      <div class="pm" data-a="som">Som: ${Audio2.muted ? 'desligado' : 'ligado'}</div>
      <div class="pm" data-a="controles">Controles</div>
      <div class="pm" data-a="menu">Voltar ao menu (salvo no último capítulo)</div>
      <div id="ctrl-help" style="display:none">${CONTROLS_HTML}</div>`;
    let sel = 0;
    const items = [...p.querySelectorAll('.pm')];
    const act = a => {
      Audio2.sfx('select');
      if (a === 'voltar') { p.className = ''; this.modal = null; }
      if (a === 'diario') { p.className = ''; this.modal = null; this.toggleJournal(); }
      if (a === 'som') { Audio2.toggleMute(); items[2].textContent = 'Som: ' + (Audio2.muted ? 'desligado' : 'ligado'); }
      if (a === 'controles') { const h = $('#ctrl-help'); h.style.display = h.style.display === 'none' ? 'block' : 'none'; }
      if (a === 'menu') { p.className = ''; this.modal = null; Game.toTitle(); }
    };
    items.forEach((e, i) => e.onpointerdown = () => act(e.dataset.a));
    const render = () => items.forEach((e, i) => e.classList.toggle('sel', i === sel));
    render();
    p.className = 'show';
    this.modal = { update: () => {
      if (Input.hit('up')) { sel = (sel + items.length - 1) % items.length; render(); Audio2.sfx('blip'); }
      if (Input.hit('down')) { sel = (sel + 1) % items.length; render(); Audio2.sfx('blip'); }
      if (Input.hit('act')) { Input.consume('act'); act(items[sel].dataset.a); }
      if (Input.hit('pause')) { Input.consume('pause'); p.className = ''; this.modal = null; }
    } };
  },

  // ---------------- controles de toque
  buildTouch() {
    const t = $('#touch');
    t.innerHTML = `<div id="stick"><div id="knob"></div></div><div id="tbtns"></div><div id="tmenu"><span data-k="journal">☰</span><span data-k="pause">❚❚</span></div>`;
    const stick = $('#stick'), knob = $('#knob');
    let id = null, cx = 0, cy = 0;
    stick.addEventListener('pointerdown', e => { id = e.pointerId; const r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; stick.setPointerCapture(id); move(e); Audio2.unlock(); });
    const move = e => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - cx, dy = e.clientY - cy; const R = stick.offsetWidth / 2, m = Math.hypot(dx, dy);
      if (m > R) { dx *= R / m; dy *= R / m; }
      knob.style.transform = `translate(${dx}px,${dy}px)`;
      const k = Math.hypot(dx, dy) / R;
      Input.touch.active = true; Input.touch.x = k > 0.25 ? dx / R : 0; Input.touch.y = k > 0.25 ? dy / R : 0;
      // direções digitais para menus
      Input.vpress('left', dx / R < -0.6); Input.vpress('right', dx / R > 0.6); Input.vpress('up', dy / R < -0.6); Input.vpress('down', dy / R > 0.6);
    };
    stick.addEventListener('pointermove', move);
    const end = e => { if (e.pointerId !== id) return; id = null; knob.style.transform = ''; Input.touch.active = false; Input.touch.x = Input.touch.y = 0; ['left', 'right', 'up', 'down'].forEach(a => Input.vpress(a, false)); };
    stick.addEventListener('pointerup', end); stick.addEventListener('pointercancel', end);
    t.querySelectorAll('#tmenu span').forEach(s => { s.addEventListener('pointerdown', e => { e.preventDefault(); Input.vpress(s.dataset.k, true); setTimeout(() => Input.vpress(s.dataset.k, false), 60); }); });
    this.refreshTouch();
  },
  refreshTouch() {
    const b = $('#tbtns'); if (!b) return;
    const keys = ['act', ...['tk', 'undo', 'blink', 'create', 'perceive', 'freeze', 'van'].filter(k => G.powers[k])];
    b.innerHTML = keys.map(k => `<span class="tb tb-${k}" data-k="${k}">${k === 'act' ? 'E' : `<i class="ic ic-${k}"></i>`}</span>`).join('');
    b.querySelectorAll('.tb').forEach(s => {
      s.addEventListener('pointerdown', e => { e.preventDefault(); Audio2.unlock(); Input.vpress(s.dataset.k, true); s.classList.add('on'); });
      const up = () => { Input.vpress(s.dataset.k, false); s.classList.remove('on'); };
      s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up); s.addEventListener('pointerleave', up);
    });
  },
};

const CONTROLS_HTML = `<table class="ctl">
<tr><td>WASD / Setas</td><td>Andar</td></tr>
<tr><td>E / Espaço</td><td>Interagir · avançar diálogo</td></tr>
<tr><td>Q</td><td>Telecinese (pegar / arremessar) · E pousa</td></tr>
<tr><td>R</td><td>Desfazer</td></tr>
<tr><td>Shift</td><td>Deslocar</td></tr>
<tr><td>C</td><td>Criar</td></tr>
<tr><td>X</td><td>Percepção</td></tr>
<tr><td>F</td><td>Parar o tempo</td></tr>
<tr><td>B</td><td>Chamar a Van (dica)</td></tr>
<tr><td>J / Tab</td><td>Diário (missões, caderno, poderes)</td></tr>
<tr><td>Esc / P</td><td>Pausa</td></tr><tr><td>M</td><td>Som liga/desliga</td></tr></table>`;
