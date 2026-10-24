// =====================================================================
//  audio.js — efeitos e música 100% sintetizados (Web Audio), sem
//  arquivos externos. Volumes independentes: geral, música e efeitos.
// =====================================================================
'use strict';

const Audio2 = VA.Audio = {
  ctx: null, master: null, musicBus: null, sfxBus: null, noise: null,
  track: null, step: 0, nextT: 0, timer: null,

  init() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain(); this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.connect(this.master);
      const len = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.applyVolumes();
      this.timer = setInterval(() => this.schedule(), 30);
    } catch (e) { console.warn('Áudio indisponível:', e.message); this.ctx = null; return false; }
    return true;
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); },
  applyVolumes() {
    if (!this.ctx) return;
    const s = Save.settings, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.mute ? 0 : s.master, t, 0.02);
    this.musicBus.gain.setTargetAtTime(s.music * 0.5, t, 0.02);
    this.sfxBus.gain.setTargetAtTime(s.sfx, t, 0.02);
  },

  // ---------------------------------------------------- primitivas
  tone(f, dur, o = {}) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur);
    const v = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.bus || this.sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  },
  burst(dur, o = {}) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + (o.delay || 0);
    const src = c.createBufferSource(); src.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = o.filter || 'lowpass';
    f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 1;
    const g = c.createGain(), v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.bus || this.sfxBus);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  },

  // ---------------------------------------------------- efeitos
  sfx(name, p = 1) {
    if (!this.ctx) return;
    const T = (f, d, o) => this.tone(f, d, o), N = (d, o) => this.burst(d, o);
    switch (name) {
      case 'whiff': N(0.09, { filter: 'bandpass', freq: 1800, to: 600, vol: 0.12, q: 2 }); break;
      case 'whiffH': N(0.16, { filter: 'bandpass', freq: 1200, to: 300, vol: 0.18, q: 2 }); break;
      case 'hitL': N(0.07, { freq: 2500, to: 400, vol: 0.45 }); T(180, 0.06, { type: 'triangle', to: 90, vol: 0.25 }); break;
      case 'hitH': N(0.16, { freq: 1600, to: 120, vol: 0.6 }); T(110, 0.18, { type: 'sine', to: 40, vol: 0.5 }); T(70, 0.12, { type: 'square', to: 35, vol: 0.12 }); break;
      case 'hitS': N(0.28, { freq: 3000, to: 90, vol: 0.6 }); T(90, 0.32, { type: 'sine', to: 30, vol: 0.6 }); T(660, 0.12, { type: 'sawtooth', to: 120, vol: 0.08 }); break;
      case 'block': T(900, 0.05, { type: 'square', to: 500, vol: 0.12 }); N(0.05, { filter: 'highpass', freq: 2500, vol: 0.2 }); break;
      case 'throw': N(0.2, { freq: 600, to: 80, vol: 0.5 }); T(80, 0.25, { type: 'sine', to: 30, vol: 0.5 }); break;
      case 'tech': T(1200, 0.06, { vol: 0.12 }); T(1600, 0.08, { vol: 0.1, delay: 0.05 }); break;
      case 'land': N(0.06, { freq: 400, vol: 0.18 }); break;
      case 'fall': N(0.25, { freq: 500, to: 60, vol: 0.5 }); T(60, 0.25, { type: 'sine', to: 30, vol: 0.4 }); break;
      case 'jump': N(0.07, { filter: 'highpass', freq: 1500, vol: 0.07 }); break;
      case 'dash': N(0.14, { filter: 'bandpass', freq: 900, to: 2400, vol: 0.14, q: 3 }); break;
      case 'charge': T(140, 0.4, { type: 'sawtooth', to: 520, vol: 0.08 }); T(210, 0.4, { type: 'sine', to: 780, vol: 0.08 }); break;
      case 'shot': T(520, 0.22, { type: 'sawtooth', to: 140, vol: 0.12 }); N(0.2, { filter: 'bandpass', freq: 700, to: 2400, vol: 0.2, q: 4 }); break;
      case 'teleport': T(1400, 0.16, { type: 'sine', to: 200, vol: 0.18 }); T(200, 0.16, { type: 'sine', to: 1400, vol: 0.14, delay: 0.12 }); break;
      case 'counter': T(1800, 0.3, { type: 'triangle', to: 300, vol: 0.15 }); T(300, 0.3, { type: 'triangle', to: 1800, vol: 0.12, delay: 0.05 }); break;
      case 'parry': T(1900, 0.18, { type: 'triangle', vol: 0.18 }); T(2850, 0.22, { type: 'sine', vol: 0.1, delay: 0.03 }); break;
      case 'armor': T(240, 0.12, { type: 'square', to: 180, vol: 0.15 }); N(0.08, { freq: 900, vol: 0.2 }); break;
      case 'erupt': N(0.5, { freq: 200, to: 2600, vol: 0.4 }); T(55, 0.5, { type: 'sawtooth', to: 110, vol: 0.18 }); break;
      case 'transform':
        T(110, 1.1, { type: 'sawtooth', to: 880, vol: 0.12, attack: 0.3 }); T(165, 1.1, { type: 'sine', to: 1320, vol: 0.12, attack: 0.3 });
        N(1.2, { filter: 'bandpass', freq: 300, to: 4000, vol: 0.25, q: 2 }); break;
      case 'super':
        T(55, 0.9, { type: 'sawtooth', vol: 0.18 }); T(82, 0.9, { type: 'sawtooth', vol: 0.12 });
        N(0.9, { filter: 'bandpass', freq: 3000, to: 200, vol: 0.3, q: 2 }); T(1760, 0.5, { type: 'sine', to: 220, vol: 0.12, delay: 0.1 }); break;
      case 'timestop': T(880, 0.6, { type: 'sine', to: 110, vol: 0.18 }); T(1320, 0.6, { type: 'sine', to: 165, vol: 0.1 }); break;
      case 'boom': N(0.9, { freq: 900, to: 40, vol: 0.8 }); T(70, 0.9, { type: 'sine', to: 25, vol: 0.7 }); break;
      case 'ko': N(1.4, { freq: 1200, to: 50, vol: 0.6 }); T(220, 1.2, { type: 'sawtooth', to: 40, vol: 0.18 }); break;
      case 'dizzy': for (let i = 0; i < 4; i++) T(1300 - i * 120, 0.08, { type: 'sine', vol: 0.08, delay: i * 0.09 }); break;
      case 'deny': T(160, 0.12, { type: 'square', vol: 0.1 }); break;
      case 'move': T(660, 0.035, { type: 'square', vol: 0.06 }); break;
      case 'ok': T(880, 0.06, { type: 'square', vol: 0.09 }); T(1320, 0.09, { type: 'square', vol: 0.08, delay: 0.05 }); break;
      case 'back': T(520, 0.07, { type: 'square', to: 300, vol: 0.08 }); break;
      case 'select': T(440, 0.1, { type: 'sawtooth', vol: 0.1 }); T(660, 0.1, { type: 'sawtooth', vol: 0.1, delay: 0.08 }); T(990, 0.2, { type: 'sawtooth', vol: 0.1, delay: 0.16 }); break;
      case 'round': T(220, 0.3, { type: 'sawtooth', vol: 0.12 }); T(330, 0.4, { type: 'sawtooth', vol: 0.12, delay: 0.15 }); break;
      case 'fight': N(0.5, { freq: 3000, to: 200, vol: 0.4 }); T(440, 0.4, { type: 'sawtooth', to: 880, vol: 0.12 }); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => T(f, 0.25, { type: 'square', vol: 0.09, delay: i * 0.12 })); break;
      case 'lose': [392, 349, 311, 262].forEach((f, i) => T(f, 0.3, { type: 'triangle', vol: 0.12, delay: i * 0.18 })); break;
      case 'unlock': [784, 988, 1175, 1568].forEach((f, i) => T(f, 0.2, { type: 'triangle', vol: 0.12, delay: i * 0.08 })); break;
    }
  },

  // locutor opcional (voz do sistema, offline quando disponível)
  say(text) {
    if (!Save.settings.announcer || Save.settings.mute || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR'; u.rate = 1.05; u.pitch = 0.6; u.volume = Save.settings.master * Save.settings.sfx;
      speechSynthesis.speak(u);
    } catch (e) { /* sem voz: ignora */ }
  },

  // ---------------------------------------------------- música procedural
  // cada faixa: bpm, escala (semitons sobre a raiz), padrões de 16 passos
  TRACKS: {
    menu: { bpm: 84, root: 45, bass: [0, -1, -1, -1, 0, -1, -1, -1, 3, -1, -1, -1, -2, -1, -1, -1], pad: [0, 3, 7], lead: [12, -1, -1, 15, -1, -1, 14, -1, -1, 10, -1, -1, 12, -1, -1, -1], kick: '1000000010000000', hat: '0000100000001000', snare: '0000000000000000', wave: 'triangle' },
    select: { bpm: 120, root: 43, bass: [0, -1, 0, -1, 0, -1, 3, -1, 5, -1, 5, -1, 3, -1, 2, -1], pad: [0, 3, 7], lead: [-1, -1, -1, -1, 12, -1, -1, -1, -1, -1, -1, -1, 15, -1, 14, -1], kick: '1000100010001000', hat: '0010001000100010', snare: '0000100000001000', wave: 'square' },
    city: { bpm: 138, root: 40, bass: [0, 0, 12, 0, 0, 12, 0, 10, 0, 0, 12, 0, 3, 3, 5, 7], pad: [0, 3, 7], lead: [12, -1, 15, -1, 17, -1, 15, 12, -1, -1, 10, -1, 12, -1, -1, -1], kick: '1000001010000010', hat: '1010101010101010', snare: '0000100000001000', wave: 'sawtooth' },
    lab: { bpm: 112, root: 38, bass: [0, -1, -1, 0, -1, -1, 1, -1, 0, -1, -1, 0, -1, -1, -2, -1], pad: [0, 1, 7], lead: [24, -1, -1, -1, 19, -1, -1, -1, 18, -1, -1, -1, 13, -1, -1, -1], kick: '1000000010100000', hat: '0011001100110011', snare: '0000100000001001', wave: 'square' },
    entre: { bpm: 96, root: 37, bass: [0, -1, -1, -1, -1, -1, -1, -1, -5, -1, -1, -1, -1, -1, -1, -1], pad: [0, 5, 10], lead: [12, -1, -1, -1, -1, -1, 17, -1, -1, -1, -1, -1, 11, -1, -1, -1], kick: '1000000000000000', hat: '0000000010000000', snare: '0000000000001000', wave: 'sine' },
    prison: { bpm: 150, root: 36, bass: [0, 0, 1, 0, 0, 1, 0, 6, 0, 0, 1, 0, 7, 6, 1, 0], pad: [0, 1, 6], lead: [12, 13, -1, 12, -1, 18, -1, 17, -1, 13, -1, 12, -1, -1, 6, -1], kick: '1010001010100010', hat: '1111111111111111', snare: '0000100000001000', wave: 'sawtooth' },
    victory: { bpm: 120, root: 48, bass: [0, -1, -1, -1, 5, -1, -1, -1, 7, -1, -1, -1, 0, -1, -1, -1], pad: [0, 4, 7], lead: [12, -1, 16, -1, 19, -1, 24, -1, 19, -1, 16, -1, 12, -1, -1, -1], kick: '1000100010001000', hat: '0010001000100010', snare: '0000000000000000', wave: 'square' },
  },
  play(name) {
    if (this.trackName === name) return;
    this.trackName = name;
    this.track = this.TRACKS[name] || null;
    this.step = 0;
    if (this.ctx) this.nextT = this.ctx.currentTime + 0.05;
  },
  stop() { this.track = null; this.trackName = null; },
  schedule() {
    const c = this.ctx, tr = this.track;
    if (!c || !tr || c.state !== 'running') return;
    const spb = 60 / tr.bpm / 4;
    while (this.nextT < c.currentTime + 0.12) {
      const s = this.step % 16, bar = Math.floor(this.step / 16), t = this.nextT, d = t - c.currentTime;
      const hz = n => 440 * Math.pow(2, (n - 69) / 12);
      const bus = this.musicBus;
      if (tr.bass[s] >= -12 && tr.bass[s] !== -1) this.tone(hz(tr.root + tr.bass[s]), spb * 1.8, { type: 'triangle', vol: 0.32, bus, delay: d });
      if (s === 0) for (const iv of tr.pad) this.tone(hz(tr.root + 12 + iv + (bar % 4 === 3 ? -2 : 0)), spb * 15, { type: 'sine', vol: 0.05, attack: 0.4, bus, delay: d });
      if (tr.lead[s] !== -1 && bar % 2 === 1) this.tone(hz(tr.root + 12 + tr.lead[s]), spb * 1.5, { type: tr.wave, vol: 0.045, bus, delay: d });
      if (tr.kick[s] === '1') this.tone(120, 0.12, { type: 'sine', to: 40, vol: 0.5, bus, delay: d });
      if (tr.hat[s] === '1') this.burst(0.03, { filter: 'highpass', freq: 7000, vol: 0.06, bus, delay: d });
      if (tr.snare[s] === '1') this.burst(0.12, { filter: 'bandpass', freq: 1800, vol: 0.18, bus, delay: d });
      this.step++; this.nextT += spb;
    }
  },
};
