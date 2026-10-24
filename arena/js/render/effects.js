// =====================================================================
//  effects.js — partículas (pool pré-alocado, sem lixo por quadro),
//  tremor de tela, clarões e anéis de energia.
// =====================================================================
'use strict';

const FX = VA.FX = {
  MAX: 900,
  pool: [], live: 0,
  shakeAmt: 0, flashA: 0, flashColor: '#fff', flashDecay: 0.08,

  init() {
    for (let i = 0; i < this.MAX; i++) this.pool.push({ on: false, type: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, color: '#fff', g: 0, drag: 1, rot: 0, vr: 0, add: false, grow: 0 });
  },
  clear() { for (const p of this.pool) p.on = false; this.shakeAmt = 0; this.flashA = 0; },

  spawn(type, x, y, vx, vy, life, size, color, o) {
    // procura um slot livre a partir de um cursor rotativo
    for (let n = 0; n < this.MAX; n++) {
      this.cursor = ((this.cursor || 0) + 1) % this.MAX;
      const p = this.pool[this.cursor];
      if (p.on) continue;
      p.on = true; p.type = type; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.size = size; p.color = color;
      p.g = o && o.g || 0; p.drag = o && o.drag || 1; p.rot = Math.random() * 6; p.vr = o && o.vr || 0; p.add = !!(o && o.add); p.grow = o && o.grow || 0;
      return p;
    }
    return null;
  },

  update() {
    for (const p of this.pool) {
      if (!p.on) continue;
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.rot += p.vr; p.size += p.grow;
      if (p.type !== 'smoke' && p.y > GROUND && p.g > 0) { p.y = GROUND; p.vy *= -0.3; p.vx *= 0.6; }
      if (--p.life <= 0) p.on = false;
    }
    this.shakeAmt *= 0.86; if (this.shakeAmt < 0.2) this.shakeAmt = 0;
    this.flashA = Math.max(0, this.flashA - this.flashDecay);
  },

  draw(ctx, layer) {
    for (const p of this.pool) {
      if (!p.on || (layer === 'back') !== (p.type === 'smoke' || p.type === 'aura')) continue;
      const t = p.life / p.max;
      ctx.globalAlpha = Math.min(1, t * 1.6);
      if (p.add) ctx.globalCompositeOperation = 'lighter';
      switch (p.type) {
        case 'spark': {
          ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1, p.size * t);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5); ctx.stroke(); break;
        }
        case 'dot': ctx.fillStyle = p.color; ctx.fillRect(p.x - p.size * t / 2, p.y - p.size * t / 2, p.size * t + 0.5, p.size * t + 0.5); break;
        case 'smoke': case 'aura':
          ctx.globalAlpha = t * (p.type === 'aura' ? 0.5 : 0.35);
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, 7); ctx.fill(); break;
        case 'ring':
          ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(0.5, 3 * t);
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size * (1 - t) + 2), 0, 7); ctx.stroke(); break;
        case 'shard': {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.moveTo(-p.size, -p.size * 0.4); ctx.lineTo(p.size, 0); ctx.lineTo(-p.size * 0.3, p.size * 0.6); ctx.closePath(); ctx.fill();
          ctx.restore(); break;
        }
        case 'glow':
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size * (0.4 + t * 0.6)), 0, 7); ctx.fill(); break;
        case 'streak':
          ctx.strokeStyle = p.color; ctx.lineWidth = p.size;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * 6, p.y + p.vy * 6); ctx.stroke(); break;
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
  },

  // ----------------------------------------------------- receitas
  hitSpark(x, y, dir, power, color, color2) {
    const n = 6 + power * 4;
    for (let i = 0; i < n; i++) {
      const a = (Math.random() - 0.5) * 2.2 + (dir < 0 ? Math.PI : 0), sp = U.rand(2, 4 + power * 2.5);
      this.spawn('spark', x, y, Math.cos(a) * sp, Math.sin(a) * sp, U.irand(6, 12 + power * 3), 1.5 + power * 0.6, i % 3 ? color : (color2 || '#ffffff'), { drag: 0.86, add: true });
    }
    this.spawn('ring', x, y, 0, 0, 10 + power * 3, 14 + power * 10, color, { add: true });
    this.spawn('glow', x, y, 0, 0, 6, 10 + power * 5, color2 || '#ffffff', { add: true });
  },
  blockSpark(x, y, dir) {
    for (let i = 0; i < 7; i++) {
      const a = (Math.random() - 0.5) * 1.6 + (dir < 0 ? Math.PI : 0);
      this.spawn('spark', x, y, Math.cos(a) * U.rand(2, 4), Math.sin(a) * U.rand(2, 4), U.irand(5, 9), 1.5, '#9fd8ff', { drag: 0.85, add: true });
    }
    this.spawn('ring', x, y, 0, 0, 9, 18, '#7cc4ff', { add: true });
  },
  dust(x, y, n = 6, dir = 0) {
    for (let i = 0; i < n; i++) this.spawn('smoke', x + U.rand(-8, 8), y - 2, U.rand(-1, 1) + dir * U.rand(0.5, 1.5), U.rand(-0.8, -0.1), U.irand(18, 34), U.rand(3, 6), '#8a8178', { drag: 0.94, grow: 0.25 });
  },
  burst(x, y, color, n = 16, sp = 4, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = U.rand(sp * 0.3, sp);
      this.spawn(o.type || 'dot', x, y, Math.cos(a) * v, Math.sin(a) * v, U.irand(14, 30), o.size || 3, color, { drag: 0.92, g: o.g || 0, add: o.add !== false });
    }
  },
  debris(x, y, color, n = 10, dir = 0) {
    for (let i = 0; i < n; i++) this.spawn('shard', x + U.rand(-10, 10), y + U.rand(-10, 10), U.rand(-3, 3) + dir * 2, U.rand(-6, -2), U.irand(40, 70), U.rand(2, 4), color, { g: 0.3, vr: U.rand(-0.3, 0.3) });
  },
  charge(x, y, color, n = 2) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = U.rand(26, 44);
      this.spawn('dot', x + Math.cos(a) * r, y + Math.sin(a) * r, -Math.cos(a) * r / 14, -Math.sin(a) * r / 14, 14, 2.5, color, { add: true });
    }
  },
  aura(x, y, w, h, color, n = 1) {
    for (let i = 0; i < n; i++) this.spawn('aura', x + U.rand(-w / 2, w / 2), y - U.rand(0, h), U.rand(-0.3, 0.3), U.rand(-1.6, -0.6), U.irand(16, 28), U.rand(3, 7), color, { drag: 0.97, grow: -0.12, add: true });
  },
  speedLines(cx, cy, color, n = 3) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = U.rand(160, 260);
      this.spawn('streak', cx + Math.cos(a) * r, cy + Math.sin(a) * r, -Math.cos(a) * 9, -Math.sin(a) * 9, 8, U.rand(1, 2.5), color, { add: true });
    }
  },
  shake(a) { if (Save.settings.shake) this.shakeAmt = Math.max(this.shakeAmt, a); },
  flash(color, a = 0.6, decay = 0.06) { this.flashColor = color; this.flashA = Math.max(this.flashA, a); this.flashDecay = decay; },
};
FX.init();
