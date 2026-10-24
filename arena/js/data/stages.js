// =====================================================================
//  stages.js — cenários. Cada um tem camadas com paralaxe (pré-renderizadas
//  uma vez), elementos animados, iluminação própria, limites de combate
//  (width) e reações a impactos (onImpact): partes que quebram ou mudam.
//  Ver docs/ADICIONAR_CENARIO.md
// =====================================================================
'use strict';

(function () {
  // cria uma camada estática em canvas fora da tela
  function layer(w, h, fn) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w); c.height = Math.ceil(h);
    fn(c.getContext('2d'), c.width, c.height);
    return c;
  }
  // desenha uma camada com paralaxe (f = 0 parado, 1 = acompanha o mundo)
  function par(ctx, img, c, z, sx, sy, f, y = 0) {
    const zf = 1 + (z - 1) * f;
    ctx.setTransform(zf, 0, 0, zf, (1 - zf) * W / 2 + sx * f, (1 - zf) * H * 0.72 + sy * f);
    ctx.drawImage(img, Math.round(-c.x * f - 120), Math.round(-c.y * f * 0.6 + y));
  }
  function setPar(ctx, c, z, sx, sy, f) {
    const zf = 1 + (z - 1) * f;
    ctx.setTransform(zf, 0, 0, zf, (1 - zf) * W / 2 + sx * f - c.x * f, (1 - zf) * H * 0.72 + sy * f - c.y * f * 0.6);
  }
  const LW = (st, f) => W + (st.width - W) * f + 240;
  const rnd = (i, s) => U.hash(i, s);

  // ======================================================== CIDADE EM COLAPSO
  VA.registerStage({
    id: 'cidade', name: 'Avenida Desdobrada', music: 'city',
    desc: 'Uma cidade em colapso, onde alguém dobrou a avenida para cima como papel.',
    canon: 'Inspirado no cap. 26, "O Homem Que Desdobrou a Avenida" (Fray destrói quatro quarteirões só para ver se V aparece). O visual é proposta do jogo.',
    width: 1000,
    init(m) {
      const st = this;
      if (!st.cache) {
        st.cache = {};
        st.cache.sky = layer(W, H, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, '#120c1e'); gr.addColorStop(0.45, '#3b1d33'); gr.addColorStop(0.75, '#7a3b2c'); gr.addColorStop(1, '#2a1a1a');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${rnd(i, 1) * 0.5})`; g.fillRect(rnd(i, 2) * w, rnd(i, 3) * h * 0.4, 1, 1); }
        });
        st.cache.far = layer(LW(st, 0.15), H, (g, w, h) => {
          // a avenida dobrada subindo pelo céu
          g.strokeStyle = '#2b2030'; g.lineWidth = 26;
          g.beginPath(); g.moveTo(w * 0.3, h * 0.78); g.bezierCurveTo(w * 0.42, h * 0.2, w * 0.7, h * 0.05, w * 0.82, h * 0.42); g.stroke();
          g.strokeStyle = '#d9a35a'; g.lineWidth = 1; g.setLineDash([4, 6]);
          g.beginPath(); g.moveTo(w * 0.3, h * 0.78); g.bezierCurveTo(w * 0.42, h * 0.2, w * 0.7, h * 0.05, w * 0.82, h * 0.42); g.stroke(); g.setLineDash([]);
          for (let i = 0; i < 40; i++) {
            const bw = 20 + rnd(i, 4) * 40, bh = 60 + rnd(i, 5) * 140, x = i * (w / 40) + rnd(i, 6) * 10;
            g.fillStyle = '#1b1422'; g.fillRect(x, h * 0.8 - bh, bw, bh + 40);
            for (let k = 0; k < bh / 9; k++) for (let j = 0; j < bw / 7; j++) if (rnd(i * 97 + k * 13 + j, 7) > 0.78) { g.fillStyle = rnd(k + j, i) > 0.5 ? '#e0b060' : '#7aa0d0'; g.globalAlpha = 0.5; g.fillRect(x + 3 + j * 7, h * 0.8 - bh + 4 + k * 9, 2, 3); g.globalAlpha = 1; }
          }
        });
        st.cache.mid = layer(LW(st, 0.45), H, (g, w, h) => {
          for (let i = 0; i < 16; i++) {
            const bw = 60 + rnd(i, 8) * 60, bh = 120 + rnd(i, 9) * 130, x = i * (w / 16) + rnd(i, 10) * 20, top = h * 0.88 - bh;
            g.fillStyle = '#231a24'; g.fillRect(x, top, bw, bh + 60);
            // topo quebrado
            g.fillStyle = '#231a24'; g.beginPath(); g.moveTo(x, top);
            for (let k = 0; k <= 6; k++) g.lineTo(x + bw * k / 6, top - rnd(i * 7 + k, 11) * 26);
            g.lineTo(x + bw, top); g.fill();
            g.fillStyle = '#2e2330'; g.fillRect(x + bw - 8, top, 8, bh + 60);
            for (let k = 0; k < bh / 16; k++) for (let j = 0; j < bw / 14; j++) {
              const lit = rnd(i * 131 + k * 17 + j, 12);
              g.fillStyle = lit > 0.86 ? '#f0c070' : lit > 0.6 ? '#120d16' : '#1a141c';
              g.fillRect(x + 5 + j * 14, top + 8 + k * 16, 8, 9);
            }
          }
        });
      }
      st.neon = [{ x: 260, y: 150, t: 'PADARIA', c: '#ff5f8a' }, { x: 620, y: 132, t: 'HOTEL', c: '#5fd8ff' }, { x: 860, y: 160, t: 'FARMÁCIA', c: '#7dff9a' }];
      st.cars = [{ x: 40, dmg: 0, c: '#3f5a7a' }, { x: 960, dmg: 0, c: '#7a3f3f' }];
      st.cracks = [];
      st.falling = [];
      st.flashT = 0;
    },
    update(m) {
      if (Math.random() < 0.004) { this.flashT = 20; }
      if (this.flashT > 0) this.flashT--;
      if (m.frame % 40 === 0) FX.spawn('smoke', U.rand(0, this.width), GROUND - 120 - U.rand(0, 120), 0.2, -0.3, 120, U.rand(10, 18), '#2a2228', { grow: 0.1 });
      for (const f of this.falling) { f.vy += 0.3; f.y += f.vy; f.r += 0.05; if (f.y > GROUND - 140 && !f.done) { f.done = true; FX.shake(3); } }
      this.falling = this.falling.filter(f => f.y < H + 60);
    },
    drawBack(ctx, m, c, z, sx, sy) {
      const C = this.cache;
      ctx.drawImage(C.sky, 0, 0);
      if (this.flashT > 0) { ctx.fillStyle = `rgba(255,190,120,${this.flashT / 60})`; ctx.fillRect(0, 0, W, H); }
      par(ctx, C.far, c, z, sx, sy, 0.15, 10);
      // luzes de drones atravessando o céu
      setPar(ctx, c, z, sx, sy, 0.25);
      for (let i = 0; i < 3; i++) {
        const x = ((m.frame * (0.6 + i * 0.3) + i * 400) % (W + 400)) - 100 + c.x * 0.25;
        ctx.fillStyle = m.frame % 30 < 15 ? '#ff3b3b' : '#ffffff'; ctx.fillRect(x, 50 + i * 22, 2, 2);
      }
      par(ctx, C.mid, c, z, sx, sy, 0.45, 26);
      setPar(ctx, c, z, sx, sy, 0.45);
      for (const n of this.neon) {
        const on = (m.frame + n.x) % 97 > 6 || Math.random() < 0.5;
        ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = on ? n.c : '#3a2a3a'; ctx.shadowColor = n.c; ctx.shadowBlur = on ? 10 : 0;
        ctx.fillText(n.t, n.x, n.y); ctx.shadowBlur = 0;
      }
      for (const f of this.falling) { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.r); ctx.fillStyle = '#2a2026'; ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h); ctx.restore(); }
    },
    drawFloor(ctx, m) {
      const w = this.width;
      const g = ctx.createLinearGradient(0, GROUND - 30, 0, H + 40);
      g.addColorStop(0, '#2a2326'); g.addColorStop(1, '#141012');
      ctx.fillStyle = '#1f1a1d'; ctx.fillRect(-300, GROUND - 26, w + 600, 26);   // calçada
      ctx.fillStyle = '#3a3034'; ctx.fillRect(-300, GROUND - 26, w + 600, 3);
      ctx.fillStyle = g; ctx.fillRect(-300, GROUND, w + 600, H);
      ctx.fillStyle = '#d9b35a';
      for (let x = -300; x < w + 300; x += 70) ctx.fillRect(x, GROUND + 18, 36, 3);
      ctx.strokeStyle = '#0d0a0b'; ctx.lineWidth = 1.5;
      for (const cr of this.cracks) { ctx.beginPath(); ctx.moveTo(cr.x, GROUND + 1); for (const p of cr.p) ctx.lineTo(cr.x + p[0], GROUND + p[1]); ctx.stroke(); }
      // carros destruídos nas bordas (amassam quando alguém é jogado contra eles)
      for (const car of this.cars) {
        ctx.save(); ctx.translate(car.x, GROUND - 2);
        const d = car.dmg;
        ctx.fillStyle = car.c; ctx.strokeStyle = '#0b0a0d'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34, -16 + d); ctx.lineTo(-18, -18 + d * 0.6); ctx.lineTo(-10, -30 + d * 2); ctx.lineTo(14, -30 + d * 2.4); ctx.lineTo(22, -18 + d); ctx.lineTo(34, -16 + d); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = d > 1 ? '#1a1d22' : '#6a8aa0'; ctx.fillRect(-8, -27 + d * 2, 18, 7);
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-20, 0, 6, 0, 7); ctx.arc(20, 0, 6, 0, 7); ctx.fill();
        ctx.restore();
      }
    },
    drawFront(ctx, m) {
      if (m.frame % 6 === 0) FX.spawn('dot', m.cam.x + U.rand(0, W), -10, U.rand(-0.2, 0.2), U.rand(0.6, 1.2), 300, 1.5, '#8a7f78', {});
    },
    onImpact(m, x, power) {
      for (const car of this.cars) if (Math.abs(car.x - x) < 70 && car.dmg < 4) { car.dmg++; FX.debris(car.x, GROUND - 20, '#9ab0c0', 8); Audio2.sfx('block'); }
      if (this.cracks.length < 12) {
        const p = []; let px = 0, py = 0; for (let i = 0; i < 5; i++) { px += U.rand(-14, 14); py += U.rand(2, 6); p.push([px, py]); }
        this.cracks.push({ x, p });
      }
      if (power >= 2) this.falling.push({ x: m.cam.x * 0.45 + U.rand(100, 500), y: 40, vy: 0, w: U.rand(12, 30), h: U.rand(8, 18), r: 0 });
    },
  });

  // ======================================================== A AGÊNCIA
  VA.registerStage({
    id: 'agencia', name: 'A Agência', music: 'lab',
    desc: 'Corredores, arquivos e laboratórios de uma instalação que cataloga gente com poderes.',
    canon: 'Caps. 17–18: a Agência do Diretor Mark — corredores, arquivos, dezenas de pessoas com poderes. Laboratório e tubos são proposta do jogo.',
    width: 960,
    init(m) {
      const st = this;
      if (!st.cache) {
        st.cache = {};
        st.cache.wall = layer(LW(st, 0.5), H, (g, w, h) => {
          g.fillStyle = '#0e1418'; g.fillRect(0, 0, w, h);
          for (let x = 0; x < w; x += 48) {
            g.fillStyle = '#141c22'; g.fillRect(x, 0, 46, h);
            g.fillStyle = '#1b252c'; g.fillRect(x + 2, 0, 2, h);
            g.fillStyle = '#0a0f12'; g.fillRect(x + 44, 0, 2, h);
            for (let y = 20; y < h; y += 60) { g.fillStyle = '#26323a'; g.fillRect(x + 8, y, 3, 3); g.fillRect(x + 36, y, 3, 3); }
          }
          // janela de observação
          g.fillStyle = '#05080a'; g.fillRect(w * 0.25, 70, w * 0.5, 120);
          g.strokeStyle = '#3a4a54'; g.lineWidth = 4; g.strokeRect(w * 0.25, 70, w * 0.5, 120);
          for (let x = w * 0.25; x < w * 0.75; x += 80) { g.fillStyle = '#3a4a54'; g.fillRect(x, 70, 3, 120); }
          // monitores
          for (let i = 0; i < 4; i++) { g.fillStyle = '#081a14'; g.fillRect(40 + i * (w - 120) / 3, 210, 50, 32); g.strokeStyle = '#2a3a40'; g.lineWidth = 2; g.strokeRect(40 + i * (w - 120) / 3, 210, 50, 32); }
          g.fillStyle = '#7fe0c0'; g.font = 'bold 9px monospace'; g.fillText('ARQUIVO', w * 0.25 + 8, 64);
        });
      }
      st.tubes = [{ x: 70, broken: 0, c: '#3fe0b0' }, { x: 890, broken: 0, c: '#7a9cff' }];
      st.walkers = [{ x: 0, s: 0.5 }, { x: 300, s: -0.35 }];
      st.spill = [];
    },
    update(m) {
      for (const wk of this.walkers) { wk.x += wk.s; if (wk.x > 480 || wk.x < 0) wk.s *= -1; }
      for (const t of this.tubes) if (!t.broken && m.frame % 7 === 0) FX.spawn('dot', t.x + U.rand(-10, 10), GROUND - 30, 0, -0.8, 80, 2.5, t.c, { add: true });
    },
    drawBack(ctx, m, c, z, sx, sy) {
      const C = this.cache, low = m.fighters.some(f => f.hp > 0 && f.hp < f.maxHp * 0.25);
      ctx.fillStyle = '#05080a'; ctx.fillRect(0, 0, W, H);
      par(ctx, C.wall, c, z, sx, sy, 0.5, 0);
      setPar(ctx, c, z, sx, sy, 0.5);
      const ww = LW(this, 0.5);
      // silhuetas de pesquisadores atrás do vidro
      for (const wk of this.walkers) {
        const x = ww * 0.25 - 120 + 40 + wk.x, bob = Math.sin(m.frame * 0.2 + wk.x) * 1;
        ctx.fillStyle = '#16222a'; ctx.fillRect(x, 120 + bob, 10, 50); ctx.beginPath(); ctx.arc(x + 5, 113 + bob, 6, 0, 7); ctx.fill();
      }
      // textos nos monitores
      ctx.font = '7px monospace'; ctx.fillStyle = '#4fe0a0';
      for (let i = 0; i < 4; i++) {
        const mx = 40 + i * (ww - 120) / 3 - 120;
        for (let l = 0; l < 3; l++) ctx.fillText(((m.frame >> 4) + i * 7 + l * 3) % 2 ? '▮▮▯▮▯' : '▯▮▮▯▮', mx + 4, 222 + l * 8);
      }
      // luz de alarme quando alguém está quase caindo
      if (low) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,30,40,${0.08 + 0.08 * Math.sin(m.frame * 0.15)})`; ctx.fillRect(0, 0, W, H); }
      // luzes do teto
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (let i = 0; i < 5; i++) {
        const x = i * 160 - (c.x * 0.7) % 160 + 40, on = !(i === 2 && m.frame % 120 < 8);
        if (!on) continue;
        const g = ctx.createRadialGradient(x, 0, 2, x, 0, 120); g.addColorStop(0, 'rgba(200,240,255,0.22)'); g.addColorStop(1, 'rgba(200,240,255,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 120, 0, 240, 140);
      }
    },
    drawFloor(ctx, m) {
      const w = this.width;
      ctx.fillStyle = '#1a2328'; ctx.fillRect(-300, GROUND, w + 600, H);
      for (let x = -300; x < w + 300; x += 40) { ctx.fillStyle = (x / 40) % 2 ? '#1e292f' : '#18212a'; ctx.fillRect(x, GROUND, 40, H); }
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(-300, GROUND, w + 600, 2);
      ctx.fillStyle = '#ffcc33'; for (let x = -300; x < w + 300; x += 24) ctx.fillRect(x, GROUND + 30, 12, 3);
      // reflexo dos lutadores no piso polido
      for (const f of m.fighters) { ctx.fillStyle = U.rgba(f.def.look.top, 0.15); ctx.fillRect(f.x - 12, GROUND + 4, 24, 26); }
      for (const s of this.spill) { ctx.fillStyle = U.rgba(s.c, 0.35); ctx.beginPath(); ctx.ellipse(s.x, GROUND + 6, s.r, 4, 0, 0, 7); ctx.fill(); if (s.r < 60) s.r += 0.3; }
      // tubos de contenção nas bordas (quebram com impactos)
      for (const t of this.tubes) {
        ctx.save(); ctx.translate(t.x, GROUND);
        ctx.fillStyle = '#2a343a'; ctx.fillRect(-20, -8, 40, 8); ctx.fillRect(-20, -112, 40, 8);
        if (!t.broken) {
          ctx.fillStyle = U.rgba(t.c, 0.25); ctx.fillRect(-16, -104, 32, 96);
          ctx.fillStyle = '#0d1418'; ctx.beginPath(); ctx.ellipse(0, -60, 7, 18, 0, 0, 7); ctx.fill();  // silhueta dentro do tubo
          ctx.strokeStyle = U.rgba('#ffffff', 0.25); ctx.strokeRect(-16, -104, 32, 96);
        } else {
          ctx.strokeStyle = '#7a8a90'; ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(-10, -30); ctx.lineTo(-16, -40); ctx.moveTo(16, -8); ctx.lineTo(10, -24); ctx.stroke();
        }
        ctx.restore();
      }
    },
    onImpact(m, x, power) {
      for (const t of this.tubes) if (!t.broken && Math.abs(t.x - x) < 70) {
        t.broken = 1; FX.debris(t.x, GROUND - 60, '#cfe8ff', 16); FX.burst(t.x, GROUND - 60, t.c, 20, 4); Audio2.sfx('hitS');
        this.spill.push({ x: t.x, r: 10, c: t.c });
        m.announce('TUBO DE CONTENÇÃO ROMPIDO', t.c, 60);
      }
    },
  });

  // ======================================================== O ENTRE
  VA.registerStage({
    id: 'entre', name: 'O Entre', music: 'entre',
    desc: 'A dimensão intermediária. Pedaços de lugares flutuam no cinza. Há uma silhueta ao longe.',
    canon: 'Cap. 20: Rayan leva V para dentro da dimensão intermediária. "Há uma silhueta ao longe. Ela não estava ali da última vez." A aparência do lugar é proposta do jogo.',
    width: 1000,
    init(m) {
      const st = this;
      if (!st.cache) {
        st.cache = {};
        st.cache.sky = layer(W, H, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, '#16141c'); gr.addColorStop(0.6, '#3a3644'); gr.addColorStop(0.8, '#55505e'); gr.addColorStop(1, '#2a2730');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
        });
      }
      st.frags = [];
      for (let i = 0; i < 9; i++) st.frags.push({ x: rnd(i, 21) * 900, y: 40 + rnd(i, 22) * 150, f: 0.15 + rnd(i, 23) * 0.4, kind: i % 4, ph: rnd(i, 24) * 6 });
      st.ripples = [];
      st.silX = 0.5; st.silScale = 0.4;
    },
    update(m) {
      for (const f of m.fighters) if (f.grounded && (f.state === 'walk' || f.state === 'run' || f.state === 'land') && m.frame % 14 === 0) this.ripples.push({ x: f.x, r: 2, a: 0.4 });
      for (const r of this.ripples) { r.r += 1.2; r.a -= 0.008; }
      this.ripples = this.ripples.filter(r => r.a > 0);
      // a silhueta se aproxima devagar ao longo da luta
      this.silScale = Math.min(1.1, 0.4 + m.totalFrames / 9000);
    },
    drawBack(ctx, m, c, z, sx, sy) {
      ctx.drawImage(this.cache.sky, 0, 0);
      // horizonte e a silhueta ao longe
      setPar(ctx, c, z, sx, sy, 0.08);
      const hx = W / 2 + 140, hy = 228, s = this.silScale;
      ctx.fillStyle = 'rgba(10,8,14,0.85)';
      ctx.fillRect(hx - 3 * s, hy - 40 * s, 6 * s, 40 * s); ctx.beginPath(); ctx.arc(hx, hy - 46 * s, 5 * s, 0, 7); ctx.fill();
      ctx.fillRect(hx - 6 * s, hy - 34 * s, 12 * s, 16 * s);
      for (const fr of this.frags) {
        setPar(ctx, c, z, sx, sy, fr.f);
        const y = fr.y + Math.sin(m.frame * 0.01 + fr.ph) * 6, x = fr.x + 60;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(m.frame * 0.005 + fr.ph) * 0.2);
        ctx.globalAlpha = 0.35 + fr.f;
        if (fr.kind === 0) { // pedaço de parede com janela
          ctx.fillStyle = '#5d5866'; ctx.fillRect(-30, -20, 60, 40); ctx.fillStyle = '#2a2730'; ctx.fillRect(-12, -10, 24, 18);
        } else if (fr.kind === 1) { // o copo (cap. 1) parado no ar
          ctx.fillStyle = 'rgba(200,220,235,0.6)'; ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(6, -10); ctx.lineTo(4, 10); ctx.lineTo(-4, 10); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke();
        } else if (fr.kind === 2) { // porta
          ctx.fillStyle = '#4a3f3a'; ctx.fillRect(-12, -26, 24, 52); ctx.fillStyle = '#c9b070'; ctx.fillRect(6, 0, 3, 3);
        } else { // pedaço de chão
          ctx.fillStyle = '#4a4652'; ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(30, -6); ctx.lineTo(36, 4); ctx.lineTo(-20, 10); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
    },
    drawFloor(ctx, m) {
      const w = this.width;
      const g = ctx.createLinearGradient(0, GROUND, 0, H + 40);
      g.addColorStop(0, '#45414e'); g.addColorStop(1, '#1a1820');
      ctx.fillStyle = g; ctx.fillRect(-300, GROUND, w + 600, H);
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(-300, GROUND, w + 600, 1);
      // reflexo invertido dos lutadores
      for (const f of m.fighters) {
        ctx.save(); ctx.translate(0, GROUND * 2 + 4); ctx.scale(1, -1); ctx.globalAlpha = 0.12;
        VA.Rig.draw(ctx, { x: f.x, y: f.y, facing: f.facing, pose: f.pose, look: f.currentLook(), build: f.build || Object.assign({}, VA.Rig.BUILD, f.def.look.build), mono: '#c8c0e0' });
        ctx.restore();
      }
      ctx.strokeStyle = '#d8d0f0';
      for (const r of this.ripples) { ctx.globalAlpha = r.a; ctx.beginPath(); ctx.ellipse(r.x, GROUND + 6, r.r, r.r * 0.16, 0, 0, 7); ctx.stroke(); }
      ctx.globalAlpha = 1;
    },
    drawFront(ctx, m) {
      if (m.frame % 10 === 0) FX.spawn('dot', m.cam.x + U.rand(0, W), GROUND + U.rand(-200, 0), U.rand(-0.3, 0.3), -0.2, 200, 1.5, '#c8c0e0', { add: true });
      if (m.entreFx > 0) {
        m.entreFx--;
        ctx.save(); ctx.globalAlpha = Math.min(0.5, m.entreFx / 60);
        ctx.fillStyle = '#ffd36b'; ctx.fillRect(m.cam.x - 50, GROUND - 1, W + 100, 2);
        ctx.restore();
      }
    },
    onImpact(m, x, power) { for (let i = 0; i < power + 1; i++) this.ripples.push({ x, r: 4 + i * 10, a: 0.7 }); },
  });

  // ======================================================== A PRISÃO FORA DE TUDO
  VA.registerStage({
    id: 'prisao', name: 'A Prisão Fora de Tudo', music: 'prison',
    unlock: 'Derrote Trigg no modo Arcade.',
    desc: 'Uma realidade própria, sem saída, sem reversão, sem fim. E uma rachadura.',
    canon: 'Caps. 46–47: "A Prisão Fora de Tudo" e "A Rachadura". O visual (barras curvas, brancos invertidos) é proposta do jogo.',
    width: 1000,
    init(m) {
      const st = this;
      if (!st.cache) {
        st.cache = {};
        st.cache.bg = layer(W, H, (g, w, h) => {
          const gr = g.createRadialGradient(w / 2, h * 0.6, 20, w / 2, h * 0.6, w * 0.7);
          gr.addColorStop(0, '#e8e4f0'); gr.addColorStop(0.5, '#8a84a0'); gr.addColorStop(1, '#14101c');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
        });
        st.cache.bars = layer(LW(st, 0.35), H, (g, w, h) => {
          g.strokeStyle = '#0c0910'; g.lineWidth = 10;
          for (let x = 0; x < w; x += 70) { g.beginPath(); g.moveTo(x, -10); g.quadraticCurveTo(x + 40, h * 0.5, x, h + 10); g.stroke(); }
          g.lineWidth = 14; g.beginPath(); g.moveTo(0, 30); g.lineTo(w, 30); g.stroke();
        });
      }
      st.crack = 0.3;
      st.hops = [];
      for (let i = 0; i < 4; i++) st.hops.push({ x: 100 + i * 220, t: rnd(i, 31) * 100 });
    },
    update(m) {
      for (const h of this.hops) { h.t++; if (h.t % 90 < 20) h.x += 0.8 * (h.x % 2 ? 1 : -1); if (h.x < 30 || h.x > 900) h.x = 450; }
      if (m.frame % 5 === 0) FX.spawn('dot', U.rand(m.cam.x, m.cam.x + W), U.rand(0, GROUND), 0, -0.2, 100, 1.5, '#ffffff', { add: true });
    },
    drawBack(ctx, m, c, z, sx, sy) {
      ctx.drawImage(this.cache.bg, 0, 0);
      // a rachadura: cresce com os impactos
      setPar(ctx, c, z, sx, sy, 0.1);
      const cx = W / 2 + 60, k = this.crack;
      ctx.strokeStyle = '#ff5a8a'; ctx.lineWidth = 2 + k * 3; ctx.shadowColor = '#ff5a8a'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(cx, 20);
      for (let i = 1; i <= 8; i++) ctx.lineTo(cx + Math.sin(i * 2.3) * 18 * k, 20 + i * 26 * k);
      ctx.stroke(); ctx.shadowBlur = 0;
      par(ctx, this.cache.bars, c, z, sx, sy, 0.35, 0);
      // coisas pequenas pulando ao longe (cap. 45)
      setPar(ctx, c, z, sx, sy, 0.6);
      ctx.fillStyle = 'rgba(20,16,28,0.6)';
      for (const h of this.hops) {
        const j = h.t % 90 < 20 ? -Math.sin((h.t % 90) / 20 * Math.PI) * 8 : 0;
        ctx.beginPath(); ctx.ellipse(h.x, GROUND - 40 + j, 5, 4, 0, 0, 7); ctx.fill();
        ctx.fillRect(h.x + 1, GROUND - 50 + j, 1.5, 6); ctx.fillRect(h.x + 3, GROUND - 50 + j, 1.5, 6);
      }
    },
    drawFloor(ctx, m) {
      const w = this.width;
      ctx.fillStyle = '#f0ecf6'; ctx.fillRect(-300, GROUND, w + 600, H);
      ctx.strokeStyle = 'rgba(20,16,28,0.15)'; ctx.lineWidth = 1;
      for (let x = -300; x < w + 300; x += 50) { ctx.beginPath(); ctx.moveTo(x, GROUND); ctx.lineTo(w / 2 + (x - w / 2) * 2.4, H + 60); ctx.stroke(); }
      ctx.fillStyle = '#14101c'; ctx.fillRect(-300, GROUND, w + 600, 2);
    },
    onImpact(m, x, power) { this.crack = Math.min(1.4, this.crack + 0.05 * power); FX.debris(x, GROUND, '#14101c', 6); },
  });

  // miniatura para a seleção de cenário
  VA.drawStagePreview = function (ctx, id, w, h) {
    const st = VA.stages[id];
    const fake = { frame: 0, totalFrames: 3000, fighters: [], cam: { x: (st.width - W) / 2, y: 0 }, projectiles: [], announce() {} };
    st.init(fake);
    const off = VA._prev || (VA._prev = document.createElement('canvas'));
    off.width = W; off.height = H;
    const g = off.getContext('2d');
    st.drawBack(g, fake, fake.cam, 1, 0, 0);
    g.setTransform(1, 0, 0, 1, -fake.cam.x, 0);
    if (st.drawFloor) st.drawFloor(g, fake);
    g.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(off, 0, 0, w, h);
  };
})();
