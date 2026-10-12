/* =========================================================================
   STICKER POWERS — partículas e efeitos de tela em um <canvas> sobreposto.
   O canvas não recebe cliques (pointer-events: none), então os efeitos
   nunca bloqueiam os controles. "Reduzir animações" diminui a quantidade.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const FX = SP.FX = {};
  let cv, cx, W = 0, H = 0, dpr = 1, parts = [], rings = [], movers = [], slashes = [], running = false, last = 0;

  const reduced = () => !!(SP.state && SP.state.settings.reducedMotion);

  FX.init = function (canvas) {
    cv = canvas; cx = cv.getContext('2d');
    const resize = () => {
      dpr = Math.min(2, root.devicePixelRatio || 1);
      W = root.innerWidth; H = root.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    root.addEventListener('resize', resize);
    resize();
  };

  /* Estilos de partícula por elemento */
  const STYLES = {
    fire:      { colors: ['#ff3d00', '#ff8a1f', '#ffd36a'], shape: 'circle', gravity: -120, drag: 1.6 },
    water:     { colors: ['#1f7bff', '#7fd8ff', '#ffffff'], shape: 'drop', gravity: 380, drag: 0.8 },
    ice:       { colors: ['#bff0ff', '#ffffff', '#5fd4ff'], shape: 'diamond', gravity: 60, drag: 1.2 },
    lightning: { colors: ['#fff6a8', '#ffcf0a', '#4ff0ff'], shape: 'line', gravity: 0, drag: 3 },
    earth:     { colors: ['#a8723c', '#e3b072', '#6b4422'], shape: 'square', gravity: 520, drag: 0.6 },
    wind:      { colors: ['#d4fff0', '#3fd6a0', '#ffffff'], shape: 'line', gravity: -20, drag: 1 },
    light:     { colors: ['#fffbe0', '#ffd84d', '#ffffff'], shape: 'star', gravity: -40, drag: 1.4 },
    dark:      { colors: ['#7c3aed', '#2a1450', '#c4a1ff'], shape: 'smoke', gravity: -30, drag: 1.8 },
    nature:    { colors: ['#22b84f', '#b4f07a', '#ff8fc8'], shape: 'leaf', gravity: 90, drag: 1.2 },
    plasma:    { colors: ['#ff2fd8', '#ffb0f4', '#ffffff'], shape: 'circle', gravity: 0, drag: 2 },
    gravity:   { colors: ['#4b47e6', '#aab4ff', '#ffffff'], shape: 'circle', gravity: 0, drag: 0.5, implode: true },
    time:      { colors: ['#11b5a4', '#a6fff2', '#ffc21a'], shape: 'ring', gravity: 0, drag: 1.5 },
    cosmic:    { colors: ['#8b5cf6', '#ff9cf0', '#ffffff', '#4ff0ff'], shape: 'star', gravity: 0, drag: 1 },
    poison:    { colors: ['#7fcf12', '#e2ff8f', '#9b4dff'], shape: 'bubble', gravity: -80, drag: 1.4 },
    metal:     { colors: ['#eef2f8', '#8e9bb0', '#ffc21a'], shape: 'line', gravity: 300, drag: 1 },
    heal:      { colors: ['#7dffb0', '#ffffff', '#b4f07a'], shape: 'plus', gravity: -90, drag: 1.4 },
    coin:      { colors: ['#ffc21a', '#fff3b0'], shape: 'circle', gravity: 500, drag: 0.4 },
    confetti:  { colors: ['#ff2e7e', '#3b8bff', '#ffc21a', '#3ddc84', '#b05cff'], shape: 'square', gravity: 260, drag: 0.8 }
  };
  FX.RARITY_COLORS = {
    common: ['#e7eaf0', '#ffffff'], uncommon: ['#3ddc84', '#9cf5c4'], rare: ['#3b8bff', '#9cc6ff', '#ffffff'],
    epic: ['#b05cff', '#dcb5ff', '#ffffff'], legendary: ['#ffc21a', '#ffe79a', '#ffffff', '#ff9a1a'],
    mythic: ['#ff2e7e', '#ff9cc2', '#ffffff', '#ffc21a'], secret: ['#ff4d6d', '#ffb020', '#ffe14d', '#3ddc84', '#3b8bff', '#b05cff', '#ffffff']
  };

  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    cx.clearRect(0, 0, W, H);
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life -= dt;
      if (r.life <= 0) { rings.splice(i, 1); continue; }
      const k = 1 - r.life / r.max;
      cx.globalAlpha = (1 - k) * (r.alpha || 0.9);
      cx.strokeStyle = r.color; cx.lineWidth = r.width * (1 - k) + 1;
      cx.beginPath(); cx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * k, 0, Math.PI * 2); cx.stroke();
    }
    // projéteis: uma cabeça brilhante que deixa rastro de partículas
    for (let i = movers.length - 1; i >= 0; i--) {
      const m = movers[i];
      m.t += dt / m.dur;
      const k = Math.min(1, m.t), e = k * k * (3 - 2 * k);
      const x = (1 - e) * (1 - e) * m.x0 + 2 * (1 - e) * e * m.cx + e * e * m.x1;
      const y = (1 - e) * (1 - e) * m.y0 + 2 * (1 - e) * e * m.cy + e * e * m.y1;
      const st = STYLES[m.style] || STYLES.plasma;
      for (let j = 0; j < (reduced() ? 1 : 3); j++) {
        const life = 0.35 + Math.random() * 0.3;
        parts.push({ x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, g: st.gravity * 0.3, drag: 3,
          size: m.size * (0.4 + Math.random() * 0.6), color: st.colors[(Math.random() * st.colors.length) | 0], shape: st.shape, life, max: life, rot: Math.random() * 6, vr: 4 });
      }
      cx.globalAlpha = 1;
      cx.fillStyle = st.colors[0];
      cx.shadowColor = st.colors[0]; cx.shadowBlur = 18;
      cx.beginPath(); cx.arc(x, y, m.size * 1.3, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#fff';
      cx.beginPath(); cx.arc(x, y, m.size * 0.6, 0, Math.PI * 2); cx.fill();
      cx.shadowBlur = 0;
      if (k >= 1) { movers.splice(i, 1); m.done(); }
    }
    // cortes: arcos brilhantes que se desenham e somem
    for (let i = slashes.length - 1; i >= 0; i--) {
      const sl = slashes[i];
      sl.life -= dt;
      if (sl.life <= 0) { slashes.splice(i, 1); continue; }
      const k = 1 - sl.life / sl.max;
      cx.save();
      cx.translate(sl.x, sl.y); cx.rotate(sl.rot);
      cx.globalAlpha = Math.min(1, (1 - k) * 2);
      cx.strokeStyle = sl.color; cx.lineWidth = 6 * (1 - k) + 1; cx.lineCap = 'round';
      cx.shadowColor = sl.color; cx.shadowBlur = 14;
      cx.beginPath(); cx.arc(0, 0, sl.r, -0.9, -0.9 + Math.min(1, k * 2.5) * 1.8); cx.stroke();
      cx.restore();
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      if (p.implode) { p.vx += (p.tx - p.x) * 4 * dt; p.vy += (p.ty - p.y) * 4 * dt; }
      p.vy += p.g * dt;
      p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const a = Math.min(1, p.life / p.max * 1.5);
      cx.globalAlpha = a;
      draw(p);
    }
    cx.globalAlpha = 1;
    if (parts.length || rings.length || movers.length || slashes.length) requestAnimationFrame(loop);
    else { running = false; cx.clearRect(0, 0, W, H); }
  }
  function kick() { if (!running && cx) { running = true; last = performance.now(); requestAnimationFrame(loop); } }

  function draw(p) {
    cx.save();
    cx.translate(p.x, p.y); cx.rotate(p.rot);
    cx.fillStyle = p.color; cx.strokeStyle = p.color;
    const s = p.size;
    switch (p.shape) {
      case 'square': cx.fillRect(-s / 2, -s / 2, s, s * 0.7); break;
      case 'diamond': cx.beginPath(); cx.moveTo(0, -s); cx.lineTo(s * 0.5, 0); cx.lineTo(0, s); cx.lineTo(-s * 0.5, 0); cx.fill(); break;
      case 'line': cx.lineWidth = Math.max(1.5, s * 0.3); cx.beginPath(); cx.moveTo(-s * 1.4, 0); cx.lineTo(s * 1.4, 0); cx.stroke(); break;
      case 'star': {
        cx.beginPath();
        for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.35 : s; const a = i * Math.PI / 4; cx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        cx.fill(); break;
      }
      case 'smoke': cx.globalAlpha *= 0.5; cx.beginPath(); cx.arc(0, 0, s * 1.4, 0, Math.PI * 2); cx.fill(); break;
      case 'leaf': cx.beginPath(); cx.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2); cx.fill(); break;
      case 'ring': cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, s, 0, Math.PI * 2); cx.stroke(); break;
      case 'bubble': cx.lineWidth = 1.5; cx.beginPath(); cx.arc(0, 0, s * 0.8, 0, Math.PI * 2); cx.stroke(); cx.globalAlpha *= 0.3; cx.fill(); break;
      case 'drop': cx.beginPath(); cx.arc(0, 0, s * 0.6, 0, Math.PI * 2); cx.fill(); break;
      case 'plus': cx.fillRect(-s / 2, -s / 6, s, s / 3); cx.fillRect(-s / 6, -s / 2, s / 3, s); break;
      default: cx.beginPath(); cx.arc(0, 0, s * 0.6, 0, Math.PI * 2); cx.fill();
    }
    cx.restore();
  }

  /**
   * Explosão de partículas. opts: { style, colors, count, speed, size, life, spread, angle }
   */
  FX.burst = function (x, y, opts) {
    if (!cx) return;
    const o = opts || {};
    const st = STYLES[o.style] || STYLES.plasma;
    const colors = o.colors || st.colors;
    let n = o.count || 30;
    if (reduced()) n = Math.ceil(n / 4);
    const speed = o.speed || 260;
    for (let i = 0; i < n; i++) {
      const ang = o.angle != null ? o.angle + (Math.random() - 0.5) * (o.spread || 1) : Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.9);
      const life = (o.life || 0.9) * (0.6 + Math.random() * 0.6);
      const p = {
        x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, g: o.gravity != null ? o.gravity : st.gravity, drag: st.drag,
        size: (o.size || 6) * (0.5 + Math.random()), color: colors[i % colors.length], shape: o.shape || st.shape,
        life, max: life, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 8
      };
      if (st.implode) { p.x = x + Math.cos(ang) * 120; p.y = y + Math.sin(ang) * 120; p.vx = -p.vx * 0.2; p.vy = -p.vy * 0.2; p.implode = true; p.tx = x; p.ty = y; }
      parts.push(p);
    }
    if (parts.length > 900) parts.splice(0, parts.length - 900);
    kick();
  };
  FX.ring = function (x, y, color, opts) {
    if (!cx) return;
    const o = opts || {};
    rings.push({ x, y, color, r0: o.r0 || 10, r1: o.r1 || 160, width: o.width || 8, life: o.life || 0.6, max: o.life || 0.6, alpha: o.alpha });
    kick();
  };
  /** Explosão no centro de um elemento da página. */
  FX.at = function (el, opts) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  };
  FX.ringAt = function (el, color, opts) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    FX.ring(r.left + r.width / 2, r.top + r.height / 2, color, opts);
  };
  FX.rarityBurst = function (el, rarity) {
    const rank = SP.RARITY[rarity] ? SP.RARITY[rarity].rank : 0;
    const colors = FX.RARITY_COLORS[rarity] || FX.RARITY_COLORS.common;
    FX.at(el, { colors, count: 18 + rank * 22, speed: 200 + rank * 70, size: 5 + rank, life: 0.8 + rank * 0.15, shape: rank >= 4 ? 'star' : 'circle', gravity: 120 });
    if (rank >= 2) FX.ringAt(el, colors[0], { r1: 120 + rank * 40, width: 4 + rank * 2 });
    if (rank >= 4) setTimeout(() => FX.ringAt(el, colors[1], { r1: 220 + rank * 30, width: 10, life: 0.9 }), 150);
    if (rank >= 6) setTimeout(() => FX.at(el, { style: 'cosmic', count: 80, speed: 500, size: 8, life: 1.6 }), 300);
  };

  /** Clarão de tela inteira. */
  FX.flash = function (color, ms) {
    if (reduced()) return;
    const d = document.createElement('div');
    d.className = 'screen-flash';
    d.style.background = color || '#fff';
    d.style.animationDuration = (ms || 450) + 'ms';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), (ms || 450) + 50);
  };
  /** Tremor em um elemento. */
  FX.shake = function (el, strong) {
    if (!el || reduced()) return;
    el.classList.remove('shake', 'shake-strong');
    void el.offsetWidth;
    el.classList.add(strong ? 'shake-strong' : 'shake');
    setTimeout(() => el.classList.remove('shake', 'shake-strong'), 500);
  };
  /** Número flutuante (dano, cura etc.). */
  FX.float = function (el, text, cls) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'float-num ' + (cls || '');
    d.textContent = text;
    d.style.left = (r.left + r.width / 2 + (Math.random() - 0.5) * r.width * 0.3) + 'px';
    d.style.top = (r.top + r.height * 0.35) + 'px';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1300);
  };
  /** Projétil de um elemento até outro; a promessa resolve quando acerta. */
  FX.projectile = function (fromEl, toEl, style, opts) {
    return new Promise(resolve => {
      if (!cx || !fromEl || !toEl) return resolve();
      const o = opts || {};
      const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
      const bend = (o.bend == null ? 0.25 : o.bend) * (Math.random() < 0.5 ? -1 : 1);
      movers.push({ x0, y0, x1, y1, cx: (x0 + x1) / 2 + (y1 - y0) * bend, cy: (y0 + y1) / 2 - (x1 - x0) * bend,
        t: 0, dur: (o.dur || 0.32), style, size: o.size || 7, done: resolve });
      kick();
    });
  };
  /** Corte em arco sobre um elemento (golpes físicos). */
  FX.slash = function (el, color, n) {
    if (!cx || !el) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < (n || 1); i++) {
      slashes.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width * (0.38 + i * 0.08), rot: Math.random() * 6, color: color || '#fff', life: 0.32, max: 0.32 });
    }
    kick();
  };
  FX.clear = function () { parts = []; rings = []; slashes = []; movers.forEach(m => m.done()); movers = []; };
})(typeof window !== 'undefined' ? window : globalThis);
