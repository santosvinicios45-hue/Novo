/* =========================================================================
   STICKER POWERS — áudio 100% sintetizado (Web Audio API).
   Nenhum arquivo de som é necessário. O contexto só é criado após o
   primeiro toque/clique, como exigem os navegadores.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const Audio = SP.Audio = {};
  let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let musicTimer = null, musicMode = null, nextNote = 0, step = 0;

  function settings() { return (SP.state && SP.state.settings) || { music: true, sfx: true, volume: 0.7 }; }

  Audio.unlock = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      Audio.applySettings();
      if (musicMode) Audio.music(musicMode, true);
    } catch (e) { ctx = null; }
  };

  Audio.applySettings = function () {
    if (!ctx) return;
    const s = settings();
    master.gain.value = s.volume;
    sfxBus.gain.value = s.sfx ? 0.9 : 0;
    musicBus.gain.value = s.music ? 0.32 : 0;
  };

  /* ---------------------------------------------------------------- primitivas */
  function tone(freq, dur, opts) {
    if (!ctx || !settings().sfx) return;
    const o = opts || {};
    const t = ctx.currentTime + (o.delay || 0);
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur);
    const v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(dur, opts) {
    if (!ctx || !settings().sfx) return;
    const o = opts || {};
    const t = ctx.currentTime + (o.delay || 0);
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.filter || 'lowpass';
    f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.vol == null ? 0.3 : o.vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

  /* ---------------------------------------------------------------- efeitos */
  const FX = {
    click: () => tone(880, 0.06, { type: 'triangle', vol: 0.15, to: 1200 }),
    hover: () => tone(1400, 0.03, { type: 'sine', vol: 0.05 }),
    error: () => { tone(220, 0.12, { type: 'square', vol: 0.1 }); tone(180, 0.18, { type: 'square', vol: 0.1, delay: 0.1 }); },
    coin: () => { tone(N(88), 0.08, { type: 'square', vol: 0.08 }); tone(N(93), 0.2, { type: 'square', vol: 0.08, delay: 0.07 }); },
    packShake: () => noise(0.12, { freq: 600, vol: 0.12 }),
    packOpen: () => { noise(0.6, { filter: 'bandpass', freq: 400, to: 5000, q: 2, vol: 0.35 }); tone(200, 0.5, { type: 'sawtooth', to: 900, vol: 0.08 }); },
    flip: () => noise(0.08, { filter: 'highpass', freq: 2500, vol: 0.18 }),
    reveal: rank => {
      const scales = [[72, 76], [72, 76, 79], [72, 76, 79, 84], [74, 78, 81, 86, 90], [72, 76, 79, 84, 88, 91], [71, 75, 78, 83, 87, 90, 95], [72, 79, 84, 88, 91, 96, 100]];
      const sc = scales[Math.max(0, Math.min(6, rank))];
      sc.forEach((n, i) => tone(N(n), 0.35 + rank * 0.05, { type: rank >= 4 ? 'triangle' : 'sine', vol: 0.12 + rank * 0.015, delay: i * 0.07 }));
      if (rank >= 4) { noise(1.2, { filter: 'highpass', freq: 6000, vol: 0.08, delay: 0.1 }); tone(N(48), 1.2, { type: 'sine', vol: 0.2 }); }
      if (rank >= 6) sc.forEach((n, i) => tone(N(n + 12), 0.6, { type: 'sine', vol: 0.06, delay: 0.5 + i * 0.05 }));
    },
    hit: () => { noise(0.12, { freq: 1800, to: 200, vol: 0.3 }); tone(140, 0.12, { type: 'square', to: 60, vol: 0.12 }); },
    crit: () => { noise(0.2, { freq: 3000, to: 300, vol: 0.4 }); tone(300, 0.2, { type: 'sawtooth', to: 80, vol: 0.15 }); },
    dodge: () => noise(0.18, { filter: 'bandpass', freq: 3000, to: 800, vol: 0.15 }),
    heal: () => [76, 79, 83].forEach((n, i) => tone(N(n), 0.3, { type: 'sine', vol: 0.1, delay: i * 0.06 })),
    shield: () => tone(N(64), 0.4, { type: 'triangle', vol: 0.12, to: N(76) }),
    debuff: () => tone(N(60), 0.3, { type: 'sawtooth', vol: 0.06, to: N(48) }),
    death: () => { tone(N(55), 0.6, { type: 'triangle', vol: 0.15, to: N(31) }); noise(0.5, { freq: 800, to: 100, vol: 0.2 }); },
    skill: el => {
      const map = {
        fire: () => noise(0.5, { freq: 900, to: 3000, vol: 0.3 }), water: () => noise(0.5, { filter: 'bandpass', freq: 600, to: 1500, q: 4, vol: 0.3 }),
        ice: () => [96, 100, 103].forEach((n, i) => tone(N(n), 0.25, { type: 'sine', vol: 0.08, delay: i * 0.05 })),
        lightning: () => { noise(0.3, { filter: 'highpass', freq: 3000, vol: 0.4 }); tone(60, 0.3, { type: 'sawtooth', vol: 0.15 }); },
        earth: () => { tone(70, 0.5, { type: 'sine', vol: 0.35, to: 40 }); noise(0.4, { freq: 300, vol: 0.3 }); },
        wind: () => noise(0.6, { filter: 'bandpass', freq: 500, to: 2500, q: 3, vol: 0.3 }),
        light: () => [79, 83, 86, 91].forEach((n, i) => tone(N(n), 0.4, { type: 'triangle', vol: 0.08, delay: i * 0.05 })),
        dark: () => { tone(N(40), 0.6, { type: 'sawtooth', vol: 0.1, to: N(34) }); tone(N(46), 0.6, { type: 'sawtooth', vol: 0.06 }); },
        nature: () => [72, 76, 79].forEach((n, i) => tone(N(n), 0.3, { type: 'triangle', vol: 0.08, delay: i * 0.08 })),
        plasma: () => tone(200, 0.5, { type: 'sawtooth', to: 1600, vol: 0.12 }),
        gravity: () => tone(400, 0.6, { type: 'sine', to: 40, vol: 0.3 }),
        time: () => [84, 79, 84, 79].forEach((n, i) => tone(N(n), 0.08, { type: 'square', vol: 0.06, delay: i * 0.1 })),
        cosmic: () => { [60, 67, 72, 79, 84].forEach((n, i) => tone(N(n), 0.6, { type: 'sine', vol: 0.07, delay: i * 0.05 })); noise(0.8, { filter: 'highpass', freq: 5000, vol: 0.08 }); },
        poison: () => [0, 1, 2].forEach(i => tone(300 + i * 80, 0.12, { type: 'sine', vol: 0.1, to: 600, delay: i * 0.08 })),
        metal: () => { tone(N(84), 0.4, { type: 'square', vol: 0.06 }); tone(N(91), 0.4, { type: 'square', vol: 0.04 }); }
      };
      (map[el] || map.plasma)();
    },
    victory: () => [[72, 0], [76, 0.12], [79, 0.24], [84, 0.36], [79, 0.52], [84, 0.62]].forEach(([n, d]) => tone(N(n), 0.35, { type: 'triangle', vol: 0.14, delay: d })),
    defeat: () => [[67, 0], [63, 0.25], [60, 0.5], [55, 0.8]].forEach(([n, d]) => tone(N(n), 0.5, { type: 'triangle', vol: 0.12, delay: d })),
    levelup: () => [72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.2, { type: 'square', vol: 0.06, delay: i * 0.06 })),
    evolve: () => { tone(200, 1.4, { type: 'sawtooth', to: 1600, vol: 0.08 }); [72, 79, 84, 88, 91, 96].forEach((n, i) => tone(N(n), 0.5, { type: 'triangle', vol: 0.1, delay: 1.1 + i * 0.06 })); noise(1.4, { filter: 'bandpass', freq: 300, to: 6000, q: 2, vol: 0.12 }); },
    mission: () => [79, 84, 88].forEach((n, i) => tone(N(n), 0.25, { type: 'triangle', vol: 0.1, delay: i * 0.08 })),
    boss: () => { tone(N(36), 1.6, { type: 'sawtooth', vol: 0.18 }); tone(N(37), 1.6, { type: 'sawtooth', vol: 0.12 }); noise(1.6, { freq: 200, vol: 0.2 }); }
  };
  Audio.play = function (name, arg) {
    if (!ctx) return;
    try { if (FX[name]) FX[name](arg); } catch (e) { /* nunca quebra o jogo por causa do som */ }
  };

  /* ---------------------------------------------------------------- música procedural */
  const SONGS = {
    menu:   { bpm: 92,  chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], arp: [0, 1, 2, 1, 2, 1, 0, 2], lead: 'triangle' },
    battle: { bpm: 132, chords: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]], arp: [0, 2, 1, 2, 0, 2, 1, 2], lead: 'square' },
    boss:   { bpm: 140, chords: [[50, 53, 57], [50, 53, 57], [46, 50, 53], [48, 52, 55]], arp: [0, 1, 2, 0, 1, 2, 1, 0], lead: 'sawtooth' }
  };
  function mtone(freq, t, dur, type, vol) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(musicBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function scheduler() {
    if (!ctx || !musicMode) return;
    const song = SONGS[musicMode];
    const spb = 60 / song.bpm / 2; // colcheias
    while (nextNote < ctx.currentTime + 0.25) {
      const bar = Math.floor(step / 8) % song.chords.length;
      const ch = song.chords[bar];
      const i = step % 8;
      if (settings().music) {
        if (i === 0) {
          ch.forEach(n => mtone(N(n), nextNote, spb * 8, 'sine', 0.05));
          mtone(N(ch[0] - 12), nextNote, spb * 3, 'triangle', 0.12);
        }
        if (i === 4) mtone(N(ch[0] - 12), nextNote, spb * 3, 'triangle', 0.09);
        mtone(N(ch[song.arp[i]] + 12), nextNote, spb * 0.9, song.lead, song.lead === 'sawtooth' ? 0.018 : 0.03);
        if (musicMode !== 'menu' && i % 2 === 0) {
          const src = ctx.createBufferSource(); src.buffer = noiseBuf;
          const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = i % 4 ? 7000 : 2000;
          const g = ctx.createGain();
          g.gain.setValueAtTime(i % 4 ? 0.03 : 0.08, nextNote); g.gain.exponentialRampToValueAtTime(0.0001, nextNote + 0.08);
          src.connect(f); f.connect(g); g.connect(musicBus); src.start(nextNote); src.stop(nextNote + 0.1);
        }
      }
      nextNote += spb;
      step++;
    }
  }
  Audio.music = function (mode, force) {
    if (musicMode === mode && !force && musicTimer) return;
    musicMode = mode;
    if (!ctx) return;
    if (musicTimer) clearInterval(musicTimer);
    step = 0; nextNote = ctx.currentTime + 0.1;
    musicTimer = setInterval(scheduler, 90);
  };
  Audio.stopMusic = function () { if (musicTimer) clearInterval(musicTimer); musicTimer = null; musicMode = null; };
})(typeof window !== 'undefined' ? window : globalThis);
