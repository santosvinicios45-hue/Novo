// =====================================================================
//  hud.js — interface de luta desenhada no canvas: vida (com rastro de
//  dano), energia em barras, cronômetro, rounds, combos, anúncios,
//  faixa cinematográfica dos supremos e painel do treino.
// =====================================================================
'use strict';

const HUD = VA.HUD = {
  shown: [1, 1], energyShown: [0, 0],
  FONT: '"Arial Black", Impact, "Segoe UI", sans-serif',

  draw(ctx, m) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const [a, b] = m.fighters;
    this.bars(ctx, a, 0, m);
    this.bars(ctx, b, 1, m);
    // cronômetro
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(8,6,12,0.75)'; ctx.fillRect(W / 2 - 24, 8, 48, 34);
    ctx.strokeStyle = '#5a4f7a'; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 24, 8, 48, 34);
    ctx.font = 'bold 24px ' + this.FONT;
    const tm = m.training || m.timerMax >= 999 ? '∞' : String(m.timer);
    ctx.fillStyle = m.timer <= 10 && !m.training && m.frame % 30 < 15 ? '#ff5a5a' : '#f2ecff';
    ctx.fillText(tm, W / 2, 34);
    // rounds vencidos
    if (!m.training) for (let s = 0; s < 2; s++) for (let i = 0; i < m.roundsNeeded; i++) {
      const x = s === 0 ? W / 2 - 34 - i * 11 : W / 2 + 34 + i * 11;
      ctx.fillStyle = i < m.wins[s] ? '#ffcf5a' : 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.arc(x, 50, 4, 0, 7); ctx.fill();
    }
    this.combo(ctx, m);
    this.announces(ctx, m);
    if (m.cinematic) this.cinema(ctx, m);
    if (m.winQuote && m.phase === 'roundEnd') this.quote(ctx, m);
    if (m.training) this.trainingPanel(ctx, m);
  },

  bars(ctx, f, side, m) {
    const BW = 238, BH = 14, y = 14, x = side === 0 ? W / 2 - 30 - BW : W / 2 + 30;
    const pct = f.hp / f.maxHp;
    this.shown[side] = pct > this.shown[side] ? pct : U.approach(this.shown[side], pct, (f.combo > 0 ? 0 : 0.006));
    ctx.fillStyle = 'rgba(8,6,12,0.8)'; ctx.fillRect(x - 2, y - 2, BW + 4, BH + 4);
    const fillBar = (p, col) => { const w = BW * U.clamp(p, 0, 1); ctx.fillStyle = col; ctx.fillRect(side === 0 ? x + BW - w : x, y, w, BH); };
    fillBar(this.shown[side], '#c8323c');
    const hcol = pct > 0.5 ? '#ffd45a' : pct > 0.25 ? '#ff9a3a' : '#ff4a4a';
    fillBar(pct, hcol);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, y, BW, 3);
    ctx.strokeStyle = '#8a7fb0'; ctx.lineWidth = 1; ctx.strokeRect(x - 2.5, y - 2.5, BW + 5, BH + 5);
    // retrato
    const px = side === 0 ? x - 34 : x + BW + 34;
    ctx.fillStyle = '#0c0a12'; ctx.fillRect(px - 26, 4, 52, 52);
    VA.Rig.portrait(ctx, f.def, px, 30, 24, side === 0 ? 1 : -1, f.form && f.form.id);
    ctx.strokeStyle = f.form ? (f.form.def.color || '#fff') : '#8a7fb0'; ctx.lineWidth = 2; ctx.strokeRect(px - 26, 4, 52, 52);
    // nome
    ctx.font = 'bold 12px ' + this.FONT; ctx.textAlign = side === 0 ? 'left' : 'right';
    ctx.fillStyle = '#ffffff';
    const label = f.def.name.toUpperCase() + (f.def.alias ? ' · ' + f.def.alias.toUpperCase() : '') + (f.form ? '  [' + f.form.def.name.toUpperCase() + ']' : '');
    ctx.fillText(label, side === 0 ? x : x + BW, y + BH + 15);
    if (f.vars.mut) { ctx.fillStyle = '#a8ff6a'; ctx.fillText('MUTAÇÃO ' + f.vars.mut, side === 0 ? x : x + BW, y + BH + 29); }
    // barra de tempo da forma
    if (f.form && f.form.t !== Infinity) {
      const p = f.form.t / f.form.def.duration;
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y + BH + 2, BW, 3);
      ctx.fillStyle = f.form.def.color || '#fff'; ctx.fillRect(side === 0 ? x + BW * (1 - p) : x, y + BH + 2, BW * p, 3);
    }
    // energia (rodapé)
    const EW = 180, ex = side === 0 ? 16 : W - 16 - EW, ey = H - 22;
    this.energyShown[side] = U.approach(this.energyShown[side], f.energy, 6);
    const e = this.energyShown[side], seg = VA.ENERGY_MAX / 3;
    ctx.fillStyle = 'rgba(8,6,12,0.8)'; ctx.fillRect(ex - 2, ey - 2, EW + 4, 12);
    for (let i = 0; i < 3; i++) {
      const sw = EW / 3 - 2, sx0 = side === 0 ? ex + i * (EW / 3) : ex + EW - (i + 1) * (EW / 3) + 2;
      const fill = U.clamp((e - i * seg) / seg, 0, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(sx0, ey, sw, 8);
      const full = fill >= 1;
      ctx.fillStyle = full ? (m.frame % 20 < 10 ? '#7fd8ff' : '#b8ecff') : '#3a6a9a';
      const w = sw * fill;
      ctx.fillRect(side === 0 ? sx0 : sx0 + sw - w, ey, w, 8);
    }
    const bars = Math.floor(f.energy / seg);
    ctx.font = 'bold 16px ' + this.FONT; ctx.textAlign = side === 0 ? 'left' : 'right';
    ctx.fillStyle = bars ? '#7fd8ff' : '#556';
    ctx.fillText(bars, side === 0 ? ex + EW + 8 : ex - 8, ey + 9);
    ctx.font = 'bold 8px ' + this.FONT; ctx.fillStyle = '#9a90c0';
    ctx.fillText('ENERGIA', side === 0 ? ex : ex + EW, ey - 4);
    // tontura
    if (f.dizzyMeter > 5) {
      ctx.fillStyle = 'rgba(255,224,102,0.5)';
      const w = 60 * Math.min(1, f.dizzyMeter / 100);
      ctx.fillRect(side === 0 ? x + BW - w : x, y + BH + 6 + (f.form ? 2 : 0), w, 2);
    }
  },

  combo(ctx, m) {
    for (const def of m.fighters) {
      const c = def.combo >= 2 ? { hits: def.combo, dmg: def.comboDmg, side: 1 - def.side, live: true } : null;
      const show = c || (m.lastCombo && m.lastCombo.side === 1 - def.side ? m.lastCombo : null);
      if (!show) continue;
      const side = show.side, x = side === 0 ? 24 : W - 24;
      const a = show.live ? 1 : Math.min(1, show.t / 30);
      ctx.globalAlpha = a;
      ctx.textAlign = side === 0 ? 'left' : 'right';
      ctx.font = 'bold 30px ' + this.FONT; ctx.fillStyle = '#ffcf5a'; ctx.strokeStyle = '#1a0f05'; ctx.lineWidth = 4;
      ctx.strokeText(show.hits, x, 120); ctx.fillText(show.hits, x, 120);
      ctx.font = 'bold 13px ' + this.FONT; ctx.fillStyle = '#fff';
      ctx.strokeText('GOLPES', x, 136); ctx.fillText('GOLPES', x, 136);
      ctx.fillStyle = '#ff9a7a'; ctx.strokeText(show.dmg + ' de dano', x, 152); ctx.fillText(show.dmg + ' de dano', x, 152);
      ctx.globalAlpha = 1;
    }
  },

  announces(ctx, m) {
    let sideY = [180, 180];
    for (const a of m.announces) {
      const k = Math.min(1, a.t / 8), out = Math.min(1, (a.dur - a.t) / 12);
      ctx.globalAlpha = Math.max(0, out);
      ctx.textAlign = 'center';
      if (a.side < 0 || a.big) {
        const s = a.side < 0 ? 1 + (1 - k) * 0.8 : 1;
        ctx.save(); ctx.translate(W / 2, H / 2 - 30); ctx.scale(s, s);
        ctx.font = 'bold 44px ' + this.FONT; ctx.lineWidth = 6; ctx.strokeStyle = '#0a0610';
        ctx.strokeText(a.text, 0, 0); ctx.fillStyle = a.color; ctx.fillText(a.text, 0, 0);
        ctx.restore();
      } else {
        const x = a.side === 0 ? 140 : W - 140, y = sideY[a.side]; sideY[a.side] += 20;
        ctx.font = 'bold 14px ' + this.FONT; ctx.lineWidth = 4; ctx.strokeStyle = '#0a0610';
        ctx.strokeText(a.text, x, y - (1 - k) * 8); ctx.fillStyle = a.color; ctx.fillText(a.text, x, y - (1 - k) * 8);
      }
      ctx.globalAlpha = 1;
    }
  },

  cinema(ctx, m) {
    const c = m.cinematic, t = c.t, k = Math.min(1, t / 8), out = Math.min(1, (c.dur - t) / 8);
    const bar = 40 * k * out;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
    if (!c.text) return;
    // faixa com o retrato do personagem atravessando a tela
    const o = c.owner, y = H / 2 + 50;
    ctx.save(); ctx.globalAlpha = out;
    ctx.fillStyle = U.rgba(c.color, 0.22); ctx.fillRect(0, y - 30, W, 60);
    ctx.fillStyle = c.color; ctx.fillRect(0, y - 31, W, 2); ctx.fillRect(0, y + 29, W, 2);
    const slide = (1 - U.easeOut(Math.min(1, t / 14))) * (o.side === 0 ? -300 : 300);
    ctx.beginPath(); ctx.rect(0, y - 29, W, 58); ctx.clip();
    VA.Rig.portrait(ctx, o.def, (o.side === 0 ? 120 : W - 120) + slide, y + 12, 44, o.side === 0 ? 1 : -1, o.form && o.form.id);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = out;
    ctx.textAlign = o.side === 0 ? 'left' : 'right';
    ctx.font = 'bold 26px ' + this.FONT; ctx.lineWidth = 5; ctx.strokeStyle = '#05030a';
    const tx = (o.side === 0 ? 210 : W - 210) - slide * 0.5;
    ctx.strokeText(c.text, tx, y + 9); ctx.fillStyle = '#ffffff'; ctx.fillText(c.text, tx, y + 9);
    ctx.restore();
  },

  quote(ctx, m) {
    const q = m.winQuote, a = Math.min(1, q.t / 20);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(6,4,10,0.85)'; ctx.fillRect(40, H - 96, W - 80, 52);
    ctx.strokeStyle = '#5a4f7a'; ctx.strokeRect(40.5, H - 95.5, W - 81, 51);
    ctx.fillStyle = '#e9e2ff'; ctx.font = 'italic 13px Georgia, serif'; ctx.textAlign = 'center';
    this.wrap(ctx, '“' + q.text + '”', W / 2, H - 74, W - 120, 16);
    ctx.globalAlpha = 1;
  },

  wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(' '); let line = '', yy = y;
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; } else line = t;
    }
    ctx.fillText(line, x, yy);
  },

  trainingPanel(ctx, m) {
    const T = m.training;
    ctx.fillStyle = 'rgba(6,4,10,0.7)'; ctx.fillRect(8, 70, 150, 98);
    ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#9fd8ff';
    const L = [
      'TREINAMENTO',
      'Último dano:   ' + (T.lastDmg || 0),
      'Dano do combo: ' + (T.comboDmg || 0),
      'Golpes seguidos: ' + (m.fighters[1].combo || T.lastHit || 0),
      'Maior combo:   ' + (T.maxCombo || 0),
      'Vantagem:      ' + (T.adv == null ? '—' : (T.adv > 0 ? '+' : '') + T.adv + 'q'),
      'Boneco: ' + ({ stand: 'parado', crouch: 'agachado', jump: 'pulando', block: 'defende tudo', blockAfter: 'defende após 1º', cpu: 'CPU' })[T.dummy],
      'Esc/Espaço: opções',
    ];
    L.forEach((l, i) => { ctx.fillStyle = i === 0 ? '#ffcf5a' : '#d8d0ee'; ctx.fillText(l, 14, 84 + i * 11); });
    // comandos executados
    ctx.fillStyle = 'rgba(6,4,10,0.7)'; ctx.fillRect(W - 168, 70, 160, 14 + m.events.length * 11);
    ctx.fillStyle = '#ffcf5a'; ctx.fillText('COMANDOS EXECUTADOS', W - 162, 81);
    m.events.slice().reverse().forEach((e, i) => {
      ctx.fillStyle = e.side === 0 ? (e.type === 'super' ? '#ffcf5a' : e.type === 'special' ? '#b8ecff' : '#e8e2ff') : '#8a8098';
      ctx.fillText((e.side === 0 ? 'J1 ' : 'J2 ') + e.name.slice(0, 22), W - 162, 93 + i * 11);
    });
  },
};
