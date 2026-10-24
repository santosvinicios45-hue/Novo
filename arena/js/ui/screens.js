// =====================================================================
//  screens.js — telas em DOM sobre o canvas, com navegação por
//  teclado (setas/WASD, Enter/J confirma, Esc/K volta), controle e mouse.
// =====================================================================
'use strict';

const Screens = VA.Screens = {
  defs: {}, stack: [], root: null,

  init() {
    this.root = document.getElementById('screens');
    Input.onMenu = (a, p, rep) => this.nav(a, p, rep);
  },
  define(name, def) { this.defs[name] = def; },
  get cur() { return this.stack[this.stack.length - 1] || null; },
  get active() { return this.stack.length > 0; },

  // substitui toda a pilha
  show(name, params) {
    while (this.stack.length) this.popRaw();
    this.push(name, params);
  },
  push(name, params = {}) {
    const def = this.defs[name];
    if (!def) throw new Error('Tela inexistente: ' + name);
    if (this.cur) this.cur.el.classList.add('under');
    const el = document.createElement('div');
    el.className = 'screen screen-' + name + (def.overlay ? ' overlay' : '');
    this.root.appendChild(el);
    const s = { name, def, el, params, focus: 0, state: {} };
    this.stack.push(s);
    this.build(s);
    if (def.music) Audio2.play(def.music);
    return s;
  },
  build(s) {
    s.el.innerHTML = '';
    s.def.build.call(s, s.el, s.params, s.state);
    this.bindItems(s);
    this.setFocus(s, Math.min(s.focus, Math.max(0, this.items(s).length - 1)));
  },
  rebuild() { const s = this.cur; if (s) { const f = s.focus; this.build(s); this.setFocus(s, Math.min(f, Math.max(0, this.items(s).length - 1))); } },
  popRaw() {
    const s = this.stack.pop();
    if (s) { if (s.def.leave) s.def.leave.call(s); s.el.remove(); }
  },
  pop() {
    this.popRaw();
    if (this.cur) { this.cur.el.classList.remove('under'); if (this.cur.def.resume) this.cur.def.resume.call(this.cur); this.rebuild(); }
  },
  clear() { while (this.stack.length) this.popRaw(); },

  items(s) { return [...s.el.querySelectorAll('.nav')].filter(e => !e.disabled && e.offsetParent !== null); },
  bindItems(s) {
    this.items(s).forEach((el, i) => {
      el.addEventListener('mouseenter', () => this.setFocus(s, this.items(s).indexOf(el), true));
      el.addEventListener('click', () => { Audio2.init(); Audio2.resume(); });
    });
  },
  setFocus(s, i, silent) {
    const it = this.items(s);
    if (!it.length) return;
    i = (i + it.length) % it.length;
    it.forEach(e => e.classList.remove('focus'));
    s.focus = i;
    it[i].classList.add('focus');
    if (!silent) it[i].scrollIntoView({ block: 'nearest' });
    if (s.def.onFocus) s.def.onFocus.call(s, it[i]);
  },

  nav(a, p, rep) {
    const s = this.cur;
    if (!s) return;
    Audio2.init(); Audio2.resume();
    if (s.def.nav && s.def.nav.call(s, a, p, rep)) return;
    const it = this.items(s), el = it[s.focus];
    switch (a) {
      case 'up': case 'left': {
        if (a === 'left' && el && el.dataset.slider) { el.dispatchEvent(new CustomEvent('adjust', { detail: -1 })); return; }
        this.setFocus(s, s.focus - (a === 'up' && s.def.cols ? s.def.cols : 1)); Audio2.sfx('move'); break;
      }
      case 'down': case 'right': {
        if (a === 'right' && el && el.dataset.slider) { el.dispatchEvent(new CustomEvent('adjust', { detail: 1 })); return; }
        this.setFocus(s, s.focus + (a === 'down' && s.def.cols ? s.def.cols : 1)); Audio2.sfx('move'); break;
      }
      case 'ok': if (el && !rep) { el.click(); } break;
      case 'back':
        if (rep) return;
        Audio2.sfx('back');
        if (s.def.back) s.def.back.call(s); else if (this.stack.length > 1) this.pop();
        break;
    }
  },

  tick() { const s = this.cur; if (s && s.def.tick) s.def.tick.call(s); },
};

// atalhos para montar HTML
VA.h = {
  btn: (label, attrs = '', cls = '') => `<button class="nav btn ${cls}" ${attrs}>${label}</button>`,
};

VA.toast = function (msg, color) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  if (color) t.style.borderColor = color;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3200);
};
