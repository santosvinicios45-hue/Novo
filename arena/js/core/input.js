// =====================================================================
//  input.js — teclado, controles (Gamepad API), toque e remapeamento
//  Cada jogador tem um Controller. A IA escreve no mesmo Controller,
//  então obedece exatamente às mesmas regras de entrada do humano.
// =====================================================================
'use strict';

const ACTIONS = ['up', 'down', 'left', 'right', 'lp', 'hp', 'sp', 'sp2', 'su', 'block', 'pause'];
const ACTION_LABEL = {
  up: 'Pular', down: 'Agachar', left: 'Esquerda', right: 'Direita',
  lp: 'Ataque leve', hp: 'Ataque pesado', sp: 'Especial', sp2: 'Especial secundário',
  su: 'Supremo', block: 'Defesa', pause: 'Pausa',
};
const DEFAULT_BINDINGS = {
  p1: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', lp: 'KeyJ', hp: 'KeyK', sp: 'KeyU', sp2: 'KeyI', su: 'KeyO', block: 'KeyL', pause: 'Space' },
  p2: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', lp: 'Numpad1', hp: 'Numpad2', block: 'Numpad3', sp: 'Numpad4', sp2: 'Numpad5', su: 'Numpad6', pause: 'Numpad0' },
};
// botões do controle padrão (layout Xbox) -> ação
const PAD_MAP = { 2: 'lp', 3: 'hp', 0: 'sp', 1: 'sp2', 5: 'su', 7: 'su', 4: 'block', 6: 'block', 9: 'pause', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };

function keyLabel(code) {
  if (!code) return '—';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  const m = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Space: 'Espaço', Enter: 'Enter', ShiftLeft: 'Shift E', ShiftRight: 'Shift D', ControlLeft: 'Ctrl E', ControlRight: 'Ctrl D', Semicolon: 'Ç', Comma: ',', Period: '.', Slash: '/', Backslash: '\\', Quote: '´', BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=', Backspace: '⌫', Tab: 'Tab', AltLeft: 'Alt', AltRight: 'AltGr' };
  return m[code] || code;
}

class Controller {
  constructor(idx) {
    this.idx = idx;
    this.held = {}; this.prev = {}; this.pressed = {};
    this.buf = {};               // quadros desde o último aperto de cada ação
    this.ai = null;              // { held:{}, taps:{} } quando a IA controla
    this.frame = 0;
    this.lastTap = { left: -99, right: -99 };
    this.dtap = { left: false, right: false };
    for (const a of ACTIONS) { this.held[a] = false; this.prev[a] = false; this.pressed[a] = false; this.buf[a] = 99; }
  }
  poll() {
    this.frame++;
    const I = Input, b = I.bindings['p' + (this.idx + 1)];
    const pad = I.padState[this.idx];
    const touch = this.idx === 0 ? I.touch : null;
    for (const a of ACTIONS) {
      let h, tap = false;
      if (this.ai) { h = !!this.ai.held[a]; tap = !!this.ai.taps[a]; }
      else {
        const code = b[a];
        h = I.keys.has(code) || !!(pad && pad[a]) || !!(touch && touch[a]);
        tap = I.taps.has(code) || !!(touch && touch['tap_' + a]);
      }
      this.prev[a] = this.held[a];
      this.held[a] = h || tap;
      this.pressed[a] = (this.held[a] && !this.prev[a]) || (tap && !this.prev[a]);
      this.buf[a] = this.pressed[a] ? 0 : Math.min(99, this.buf[a] + 1);
    }
    if (this.ai) this.ai.taps = {};
    this.dtap.left = this.dtap.right = false;
    for (const d of ['left', 'right']) if (this.pressed[d]) {
      if (this.frame - this.lastTap[d] < 13) this.dtap[d] = true;
      this.lastTap[d] = this.frame;
    }
  }
  recent(a, n = 5) { return this.buf[a] <= n; }
  consume(a) { this.buf[a] = 99; this.pressed[a] = false; }
  clear() { for (const a of ACTIONS) { this.held[a] = this.prev[a] = this.pressed[a] = false; this.buf[a] = 99; } }
}

const Input = VA.Input = {
  keys: new Set(), taps: new Set(),
  bindings: null,
  ctrls: [new Controller(0), new Controller(1)],
  padState: [null, null], padPrev: [{}, {}],
  touch: null,
  capture: null,            // função que recebe o próximo código de tecla (remapear)
  onMenu: null,             // (acao, jogador) — navegação nos menus
  onKey: null,              // (code) — atalhos globais

  init() {
    this.loadBindings();
    addEventListener('keydown', e => this.keydown(e), { passive: false });
    addEventListener('keyup', e => { this.keys.delete(e.code); });
    addEventListener('blur', () => this.releaseAll());
    addEventListener('gamepadconnected', e => VA.toast && VA.toast('Controle conectado: ' + (e.gamepad.id || '').slice(0, 28)));
  },
  loadBindings() {
    const saved = Save.data.bindings;
    this.bindings = {
      p1: Object.assign({}, DEFAULT_BINDINGS.p1, saved && saved.p1),
      p2: Object.assign({}, DEFAULT_BINDINGS.p2, saved && saved.p2),
    };
  },
  saveBindings() { Save.data.bindings = JSON.parse(JSON.stringify(this.bindings)); Save.write(); },
  resetBindings() { Save.data.bindings = null; Save.write(); this.loadBindings(); },
  setBinding(p, action, code) {
    // troca com a ação que já usava a tecla, para não haver conflito
    for (const pk of ['p1', 'p2']) for (const a of ACTIONS) {
      if (this.bindings[pk][a] === code && !(pk === p && a === action)) this.bindings[pk][a] = this.bindings[p][action];
    }
    this.bindings[p][action] = code;
    this.saveBindings();
  },
  releaseAll() { this.keys.clear(); this.taps.clear(); for (const c of this.ctrls) c.clear(); },
  isBound(code) {
    for (const pk of ['p1', 'p2']) for (const a of ACTIONS) if (this.bindings[pk][a] === code) return true;
    return false;
  },

  keydown(e) {
    const code = e.code;
    if (this.capture) {
      e.preventDefault();
      const f = this.capture; this.capture = null;
      f(code === 'Escape' ? null : code);
      return;
    }
    if (this.isBound(code) || code.startsWith('Arrow') || code === 'Space' || code === 'Tab' || code === 'Backspace') e.preventDefault();
    if (!e.repeat) { this.keys.add(code); this.taps.add(code); }
    if (this.onKey && this.onKey(code, e)) return;
    if (this.onMenu) {
      const a = this.menuAction(code);
      if (a) this.onMenu(a[0], a[1], e.repeat);
    }
  },
  menuAction(code) {
    const b = this.bindings;
    for (let p = 0; p < 2; p++) {
      const k = b['p' + (p + 1)];
      if (code === k.up) return ['up', p];
      if (code === k.down) return ['down', p];
      if (code === k.left) return ['left', p];
      if (code === k.right) return ['right', p];
      if (code === k.lp) return ['ok', p];
      if (code === k.hp) return ['back', p];
    }
    if (code === 'Enter' || code === 'Space') return ['ok', 0];
    if (code === 'NumpadEnter') return ['ok', 1];
    if (code === 'Escape' || code === 'Backspace') return ['back', 0];
    if (code === 'ArrowUp') return ['up', 0];
    if (code === 'ArrowDown') return ['down', 0];
    if (code === 'ArrowLeft') return ['left', 0];
    if (code === 'ArrowRight') return ['right', 0];
    return null;
  },

  pollPads() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let n = 0;
    for (const gp of pads) {
      if (!gp || !gp.connected || n > 1) continue;
      const s = {};
      gp.buttons.forEach((bt, i) => { const a = PAD_MAP[i]; if (a && (bt.pressed || bt.value > 0.5)) s[a] = true; });
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      if (ax < -0.5) s.left = true; if (ax > 0.5) s.right = true;
      if (ay < -0.6) s.up = true; if (ay > 0.6) s.down = true;
      // navegação dos menus pelo controle
      if (this.onMenu) {
        const prev = this.padPrev[n];
        const nav = { up: 'up', down: 'down', left: 'left', right: 'right' };
        for (const k in nav) if (s[k] && !prev[k]) this.onMenu(nav[k], n);
        if (gp.buttons[0] && gp.buttons[0].pressed && !prev.A) this.onMenu('ok', n);
        if (gp.buttons[1] && gp.buttons[1].pressed && !prev.B) this.onMenu('back', n);
        if (s.pause && !prev.pause && this.onKey) this.onKey('PadStart' + n);
      }
      s.A = !!(gp.buttons[0] && gp.buttons[0].pressed); s.B = !!(gp.buttons[1] && gp.buttons[1].pressed);
      this.padPrev[n] = s;
      this.padState[n] = s;
      n++;
    }
    for (; n < 2; n++) this.padState[n] = null;
  },

  // chamada uma vez por quadro lógico
  update() {
    this.pollPads();
    for (const c of this.ctrls) c.poll();
    this.taps.clear();
    if (this.touch) for (const k in this.touch) if (k.startsWith('tap_')) delete this.touch[k];
  },
};
VA.keyLabel = keyLabel;
VA.ACTIONS = ACTIONS; VA.ACTION_LABEL = ACTION_LABEL;
