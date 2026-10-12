// =====================================================================
//  V — O Homem Que Acordou Grande Demais
//  core.js — motor: tela, laço, entrada, áudio, utilidades, salvamento
// =====================================================================
'use strict';

const W = 480, H = 270, TILE = 16;
const G = {
  t: 0, dt: 0, frame: 0,
  map: null, player: null,
  entities: [], particles: [],
  flags: {}, powers: {}, quests: {},
  chapter: 0,
  cutscene: 0,          // >0 = entrada do jogador bloqueada
  frozen: 0,            // tempo parado (segundos restantes)
  perceive: 0,          // percepção ativa (segundos restantes)
  cam: { x: 0, y: 0, shake: 0 },
  fade: 0, fadeTarget: 0, fadeColor: '#000',
  ui: null, state: 'title',
  peso: 0,              // a "culpa" acumulada
  stats: { sideDone: 0, decencia: 0, desfeitos: 0 },
  timeLabel: '',
  ambient: null,        // {dark:0..1, tint}
  debug: false,
};

// ---------------------------------------------------------------- utils
const U = {
  clamp: (v, a, b) => v < a ? a : v > b ? b : v,
  lerp: (a, b, t) => a + (b - a) * t,
  rand: (a, b) => a + Math.random() * (b - a),
  irand: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  dist: (a, b, c, d) => Math.hypot(c - a, d - b),
  ease: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  overlap: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
  dirVec: d => d === 'up' ? [0, -1] : d === 'down' ? [0, 1] : d === 'left' ? [-1, 0] : [1, 0],
  hash: (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; },
  shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = U.clamp(Math.round(r + amt), 0, 255); g = U.clamp(Math.round(g + amt), 0, 255); b = U.clamp(Math.round(b + amt), 0, 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  },
};

// ---------------------------------------------------------------- canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W; canvas.height = H;
ctx.imageSmoothingEnabled = false;

function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  let s = Math.min(vw / W, vh / H);
  if (s >= 1) s = Math.max(1, Math.floor(s * 4) / 4); // passos de 0.25 para manter nitidez
  canvas.style.width = Math.floor(W * s) + 'px';
  canvas.style.height = Math.floor(H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------- imagens
const IMG = {};
function loadImg(name, src) {
  return new Promise(res => {
    const i = new Image();
    i.onload = () => { IMG[name] = i; res(); };
    i.onerror = () => { IMG[name] = null; res(); };
    i.src = src;
  });
}

// ---------------------------------------------------------------- entrada
const Input = {
  down: {}, pressed: {}, released: {},
  touch: { x: 0, y: 0, active: false },
  map: {
    up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
    act: ['KeyE', 'Space', 'Enter'], tk: ['KeyQ'], undo: ['KeyR'], freeze: ['KeyF'],
    blink: ['ShiftLeft', 'ShiftRight'], create: ['KeyC'], perceive: ['KeyX'], van: ['KeyB'],
    journal: ['KeyJ', 'Tab'], pause: ['Escape', 'KeyP'], mute: ['KeyM'], back: ['Escape', 'Backspace'],
  },
  codeDown: {},
  held(a) { return !!this.down[a]; },
  hit(a) { return !!this.pressed[a]; },
  rel(a) { return !!this.released[a]; },
  consume(a) { this.pressed[a] = false; },
  endFrame() { this.pressed = {}; this.released = {}; },
  _set(code, v) {
    for (const a in this.map) if (this.map[a].includes(code)) {
      if (v && !this.down[a]) this.pressed[a] = true;
      if (!v && this.down[a]) this.released[a] = true;
      this.down[a] = v;
    }
  },
  vpress(a, v) {
    if (v && !this.down[a]) this.pressed[a] = true;
    if (!v && this.down[a]) this.released[a] = true;
    this.down[a] = v;
  },
  axis() {
    let x = (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0);
    let y = (this.held('down') ? 1 : 0) - (this.held('up') ? 1 : 0);
    if (this.touch.active) { x = this.touch.x; y = this.touch.y; }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return [x, y];
  },
};
window.addEventListener('keydown', e => {
  if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  Audio2.unlock();
  Input._set(e.code, true);
});
window.addEventListener('keyup', e => Input._set(e.code, false));
window.addEventListener('blur', () => { for (const a in Input.down) Input.down[a] = false; });

// ---------------------------------------------------------------- áudio procedural
const Audio2 = {
  ctx: null, master: null, musicGain: null, sfxGain: null, muted: false,
  song: null, songName: '', nextTime: 0, step: 0, delay: null,
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.55;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.22;
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.5;
      // eco suave para a música
      this.delay = this.ctx.createDelay(1.0); this.delay.delayTime.value = 0.36;
      const fb = this.ctx.createGain(); fb.gain.value = 0.32;
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
      this.delay.connect(lp); lp.connect(fb); fb.connect(this.delay);
      this.musicGain.connect(this.master); this.delay.connect(this.master);
      this.musicGain.connect(this.delay);
      this.sfxGain.connect(this.master);
      this.noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null; }
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.55;
    Save.setPref('muted', this.muted);
  },
  tone(freq, dur, type = 'sine', vol = 0.3, when = 0, dest = null, slide = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol = 0.2, freq = 1000, type = 'bandpass', when = 0, q = 1) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxGain);
    s.start(t); s.stop(t + dur + 0.05);
  },
  sfx(name) {
    if (!this.ctx || this.muted) return;
    const T = (...a) => this.tone(...a), N = (...a) => this.noise(...a);
    switch (name) {
      case 'step': N(0.05, 0.04, 400 + Math.random() * 200, 'lowpass'); break;
      case 'blip': T(660, 0.05, 'square', 0.05); break;
      case 'type': T(300 + Math.random() * 120, 0.03, 'triangle', 0.035); break;
      case 'select': T(520, 0.06, 'triangle', 0.12); T(780, 0.08, 'triangle', 0.1, 0.05); break;
      case 'tk': T(180, 0.5, 'sine', 0.18, 0, null, 2.2); N(0.4, 0.05, 2400, 'bandpass', 0, 4); break;
      case 'throw': N(0.25, 0.12, 900, 'bandpass', 0, 2); T(400, 0.2, 'sine', 0.08, 0, null, 0.4); break;
      case 'glass': for (let i = 0; i < 6; i++) T(2200 + Math.random() * 2600, 0.12 + Math.random() * .2, 'sine', 0.07, i * 0.02); N(0.18, 0.15, 5000, 'highpass'); break;
      case 'thud': T(90, 0.18, 'sine', 0.25, 0, null, 0.5); N(0.08, 0.1, 300, 'lowpass'); break;
      case 'undo': for (let i = 0; i < 8; i++) T(900 - i * 80, 0.09, 'triangle', 0.06, i * 0.035); T(110, 0.6, 'sine', 0.12, 0, null, 3); break;
      case 'freeze': T(1400, 1.2, 'sine', 0.08, 0, null, 0.25); T(70, 1.2, 'sine', 0.2); N(0.6, 0.06, 6000, 'highpass'); break;
      case 'unfreeze': T(350, 0.5, 'sine', 0.1, 0, null, 4); break;
      case 'blink': N(0.18, 0.14, 3000, 'bandpass', 0, 3); T(1200, 0.15, 'sine', 0.08, 0, null, 0.3); break;
      case 'create': [523, 659, 784, 1046].forEach((f, i) => T(f, 0.25, 'triangle', 0.08, i * 0.05)); break;
      case 'perceive': T(220, 1.0, 'sine', 0.12, 0, null, 1.5); T(330, 1.0, 'sine', 0.08, 0.1, null, 1.5); break;
      case 'horn': T(370, 0.35, 'sawtooth', 0.08); T(440, 0.35, 'sawtooth', 0.07); break;
      case 'lights': T(1800, 0.03, 'square', 0.05); T(1300, 0.03, 'square', 0.05, 0.06); break;
      case 'radio': N(0.5, 0.06, 1800, 'bandpass', 0, 0.7); break;
      case 'quest': [392, 523, 659, 784].forEach((f, i) => T(f, 0.35, 'triangle', 0.1, i * 0.09)); break;
      case 'questDone': [523, 659, 784, 1046, 1318].forEach((f, i) => T(f, 0.45, 'triangle', 0.1, i * 0.08)); break;
      case 'phone': for (let i = 0; i < 2; i++) { T(1320, 0.08, 'square', 0.06, i * 0.15); T(1180, 0.08, 'square', 0.06, i * 0.15 + 0.08); } break;
      case 'ring': for (let i = 0; i < 6; i++) T(i % 2 ? 1180 : 1320, 0.07, 'square', 0.06, i * 0.08); break;
      case 'door': N(0.15, 0.12, 500, 'lowpass'); T(140, 0.1, 'square', 0.04, 0.08); break;
      case 'bell': T(988, 0.6, 'sine', 0.12); T(784, 0.8, 'sine', 0.12, 0.35); break;
      case 'bump': T(120, 0.3, 'square', 0.12, 0, null, 0.3); N(0.15, 0.2, 400, 'lowpass'); break;
      case 'nothing': T(200, 0.6, 'sine', 0.06, 0, null, 0.9); break;
      case 'heart': T(60, 0.12, 'sine', 0.3); T(55, 0.15, 'sine', 0.25, 0.18); break;
      case 'coo': T(380, 0.12, 'sine', 0.04, 0, null, 0.8); T(340, 0.15, 'sine', 0.04, 0.14, null, 0.8); break;
      case 'bark': N(0.08, 0.15, 700, 'bandpass', 0, 2); T(260, 0.08, 'sawtooth', 0.06); break;
      case 'car': N(0.8, 0.05, 220, 'lowpass'); break;
      case 'tear': T(80, 1.6, 'sawtooth', 0.06, 0, null, 0.5); N(1.4, 0.09, 200, 'lowpass'); break;
      case 'deny': T(200, 0.12, 'square', 0.06); T(160, 0.15, 'square', 0.06, 0.1); break;
    }
  },
  // ---------------- música: sequenciador simples
  songs: {
    apto: { bpm: 68, wave: 'triangle', prog: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], mel: [76, null, 74, 72, null, 69, null, 72, 71, null, 67, null, 69, null, null, null], bass: true },
    rua: { bpm: 84, wave: 'triangle', prog: [[48, 52, 55, 59], [53, 57, 60, 64], [50, 53, 57, 60], [55, 59, 62, 65]], mel: [72, 74, 76, null, 79, null, 76, 74, 72, null, 69, 72, 74, null, null, null], bass: true },
    mansao: { bpm: 56, wave: 'sine', prog: [[53, 57, 60, 64], [48, 55, 59, 64], [50, 57, 60, 65], [52, 55, 59, 64]], mel: [81, null, null, 79, null, 76, null, null, 77, null, 76, null, 72, null, null, null], bass: false },
    luto: { bpm: 48, wave: 'sine', prog: [[45, 52, 57], [41, 48, 57], [43, 50, 55], [40, 47, 52]], mel: [null, null, 69, null, null, 67, null, null, 65, null, null, 64, null, null, null, null], bass: true },
    memoria: { bpm: 112, wave: 'square', prog: [[45, 48, 52], [45, 48, 53], [44, 48, 52], [44, 47, 52]], mel: [69, 72, 69, 76, 69, 72, 69, 75, 68, 71, 68, 76, 68, 71, 68, 74], bass: true },
    van: { bpm: 76, wave: 'sawtooth', prog: [[43, 47, 50], [48, 52, 55], [50, 54, 57], [43, 47, 50]], mel: [67, 71, 74, null, 72, 71, 69, null, 71, 69, 67, null, 64, 67, null, null], bass: true },
    rayan: { bpm: 60, wave: 'sine', prog: [[50, 57, 62, 64], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]], mel: [74, null, 76, null, 77, null, 76, 74, 72, null, null, null, 69, null, null, null], bass: true },
    arcade: { bpm: 140, wave: 'square', prog: [[48, 52, 55], [53, 57, 60], [55, 59, 62], [48, 52, 55]], mel: [72, 76, 79, 76, 77, 81, 77, 74, 79, 83, 79, 76, 72, 74, 76, 79], bass: true },
  },
  playSong(name) {
    if (this.songName === name) return;
    this.songName = name;
    this.song = name ? this.songs[name] : null;
    this.step = 0;
    if (this.ctx) this.nextTime = this.ctx.currentTime + 0.1;
  },
  mtof: m => 440 * Math.pow(2, (m - 69) / 12),
  update() {
    if (!this.ctx || !this.song || this.muted) return;
    const s = this.song, spb = 60 / s.bpm / 2; // colcheias
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      const st = this.step % 64, bar = Math.floor(st / 16) % s.prog.length, sub = st % 16;
      const t = this.nextTime - this.ctx.currentTime;
      const chord = s.prog[bar];
      if (sub === 0) chord.forEach((m, i) => this.tone(this.mtof(m), spb * 14, 'sine', 0.05, t + i * 0.03, this.musicGain));
      if (sub % 4 === 2) this.tone(this.mtof(chord[(sub / 2) % chord.length | 0] + 12), spb * 3, s.wave, 0.025, t, this.musicGain);
      if (s.bass && (sub === 0 || sub === 8)) this.tone(this.mtof(chord[0] - 12), spb * 6, 'triangle', 0.08, t, this.musicGain);
      const m = s.mel[sub];
      if (m && (Math.floor(st / 16) % 2 === 1 || s === this.songs.memoria || s === this.songs.arcade)) this.tone(this.mtof(m), spb * 2.5, s.wave === 'sawtooth' ? 'triangle' : s.wave, 0.04, t, this.musicGain);
      this.nextTime += spb; this.step++;
    }
  },
};

// ---------------------------------------------------------------- salvamento
const Save = {
  KEY: 'v_grande_demais_save_v1', PREF: 'v_grande_demais_prefs',
  has() { try { return !!localStorage.getItem(this.KEY); } catch (e) { return false; } },
  write(checkpoint) {
    const data = {
      chapter: G.chapter, checkpoint, flags: G.flags, powers: G.powers, quests: G.quests,
      peso: G.peso, stats: G.stats, when: Date.now(),
    };
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  },
  read() { try { return JSON.parse(localStorage.getItem(this.KEY)); } catch (e) { return null; } },
  clear() { try { localStorage.removeItem(this.KEY); } catch (e) { } },
  setPref(k, v) { try { const p = JSON.parse(localStorage.getItem(this.PREF) || '{}'); p[k] = v; localStorage.setItem(this.PREF, JSON.stringify(p)); } catch (e) { } },
  getPref(k) { try { return JSON.parse(localStorage.getItem(this.PREF) || '{}')[k]; } catch (e) { return undefined; } },
};

// ---------------------------------------------------------------- promessas de cena (scripts async)
const Wait = {
  list: [],
  frames(n) { return new Promise(r => this.list.push({ n, r, kind: 'f' })); },
  secs(s) { return new Promise(r => this.list.push({ t: s, r, kind: 't' })); },
  until(fn) { return new Promise(r => this.list.push({ fn, r, kind: 'u' })); },
  update(dt) {
    const keep = [];
    for (const w of this.list) {
      let done = false;
      if (w.kind === 'f') done = --w.n <= 0;
      else if (w.kind === 't') done = (w.t -= dt) <= 0;
      else { try { done = !!w.fn(); } catch (e) { done = true; console.error(e); } }
      if (done) w.r(); else keep.push(w);
    }
    this.list = keep;
  },
  clear() { this.list = []; },
};
const wait = s => Wait.secs(s);
