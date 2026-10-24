// =====================================================================
//  rig.js — esqueleto 2D animado desenhado por código.
//  É a arte PROVISÓRIA dos lutadores: cada personagem define cores,
//  proporções e estilo de cabelo/roupa; as poses vêm de poses.js e são
//  interpoladas quadro a quadro (nada de imagem parada).
//
//  PONTO DE SUBSTITUIÇÃO: se VA.sprites[id] existir (folha de sprites
//  carregada, ver docs/SPRITES.md), drawFighter usa a folha no lugar do
//  esqueleto, animação por animação.
// =====================================================================
'use strict';

const OUT = '#0b0a0d';

const Rig = VA.Rig = {
  BASE: { thigh: 25, shin: 24, torso: 33, neck: 4, head: 9, upper: 18, fore: 17 },
  BUILD: { scale: 1, torsoW: 22, hipW: 17, armW: 7, legW: 8.5, headR: 9, lean: 0, foot: 8 },

  // ângulos em graus: 0 = apontando para baixo, + = para a frente (lado que o lutador encara)
  joints(pose, b, f) {
    const s = b.scale, L = this.BASE, d = U.deg;
    const v = (a, len) => [Math.sin(d(a)) * f * len * s, Math.cos(d(a)) * len * s];
    const lean = (pose.lean || 0) + (b.lean || 0);
    const H = [0, 0];
    const T = [Math.sin(d(lean)) * f * L.torso * s, -Math.cos(d(lean)) * L.torso * s];
    const S = [H[0] + T[0], H[1] + T[1]];
    const ha = lean + (pose.head || 0), hr = b.headR * s;
    const N = [S[0] + Math.sin(d(ha)) * f * (L.neck * s + hr), S[1] - Math.cos(d(ha)) * (L.neck * s + hr)];
    const SF = [S[0] + f * 2 * s, S[1] + 2], SB = [S[0] - f * 3 * s, S[1] + 1];
    const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
    const EF = add(SF, v(pose.sF || 0, L.upper)), HF = add(EF, v((pose.sF || 0) + (pose.eF || 0), L.fore));
    const EB = add(SB, v(pose.sB || 0, L.upper)), HB = add(EB, v((pose.sB || 0) + (pose.eB || 0), L.fore));
    const PF = [f * 2 * s, 0], PB = [-f * 3 * s, 0];
    const KF = add(PF, v(pose.hF || 0, L.thigh)), FF = add(KF, v((pose.hF || 0) - (pose.kF || 0), L.shin));
    const KB = add(PB, v(pose.hB || 0, L.thigh)), FB = add(KB, v((pose.hB || 0) - (pose.kB || 0), L.shin));
    const J = { H, S, N, SF, SB, EF, HF, EB, HB, PF, PB, KF, FF, KB, FB, lean, ha, hr };
    const rot = pose.rot || 0;
    if (rot) {
      const a = d(-rot * f), c = Math.cos(a), sn = Math.sin(a);
      for (const k in J) { const p = J[k]; if (Array.isArray(p)) { const x = p[0], y = p[1]; p[0] = x * c - y * sn; p[1] = x * sn + y * c; } }
      J.lean += -rot; J.ha += -rot;
    }
    return J;
  },

  // menor distância do quadril até o ponto mais baixo (para "plantar" no chão)
  lowest(J) {
    let m = Math.max(J.FF[1], J.FB[1]) + 3;
    if (J.lean < -40 || J.lean > 60) m = Math.max(m, J.N[1] + J.hr, J.S[1] + 4, J.H[1] + 5, J.HF[1] + 3, J.HB[1] + 3);
    return m;
  },

  // ------------------------------------------------------------ desenho
  // o: { x, y(pés), facing, pose, look, build, mono, alpha, extras:{} }
  draw(ctx, o) {
    const b = o.build, f = o.facing, look = o.look;
    const J = this.joints(o.pose, b, f);
    const oy = o.y - this.lowest(J) - (o.pose.y || 0);
    const ox = o.x + (o.pose.x || 0) * f;
    const mono = o.mono;
    const C = c => mono || c;
    ctx.save();
    ctx.translate(Math.round(ox), Math.round(oy));
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const s = b.scale;
    const limb = (a, c, w, col, outline = true) => {
      if (outline && !mono) { ctx.strokeStyle = OUT; ctx.lineWidth = w + 2.4; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); }
      ctx.strokeStyle = C(col); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
    };
    const dot = (p, r, col) => { ctx.fillStyle = C(col); ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill(); if (!mono) { ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.stroke(); } };
    const ex = look.extras || {};
    const ctxDraw = { ctx, J, f, s, look, mono, C, limb, dot, pose: o.pose, t: o.t || 0, state: o.state || {} };

    if (ex.behind) ex.behind(ctxDraw);
    const dk = c => U.shade(c, -28);
    // braço de trás
    limb(J.SB, J.EB, b.armW * s, dk(look.sleeve || look.top));
    limb(J.EB, J.HB, b.armW * s * 0.92, dk(look.sleeve || look.top));
    dot(J.HB, 3.2 * s * (look.fist || 1), dk(look.glove || look.skin));
    // perna de trás
    limb(J.PB, J.KB, b.legW * s, dk(look.pants));
    limb(J.KB, J.FB, b.legW * s * 0.9, dk(look.pants));
    this.boot(ctx, J.FB, J.KB, f, s, b, dk(look.boots), mono);
    // perna da frente
    limb(J.PF, J.KF, b.legW * s, look.pants);
    limb(J.KF, J.FF, b.legW * s * 0.9, look.pants);
    this.boot(ctx, J.FF, J.KF, f, s, b, look.boots, mono);
    if (ex.legs) ex.legs(ctxDraw);
    // tronco
    this.torso(ctx, J, f, s, b, look, mono);
    if (ex.torso) ex.torso(ctxDraw);
    // cabeça
    this.head(ctx, J, f, s, look, mono, o);
    if (ex.head) ex.head(ctxDraw);
    // braço da frente
    limb(J.SF, J.EF, b.armW * s, look.sleeve || look.top);
    limb(J.EF, J.HF, b.armW * s * 0.92, look.sleeve || look.top);
    if (look.cuff && !mono) limb([U.lerp(J.EF[0], J.HF[0], .8), U.lerp(J.EF[1], J.HF[1], .8)], [U.lerp(J.EF[0], J.HF[0], .86), U.lerp(J.EF[1], J.HF[1], .86)], b.armW * s * 0.95, look.cuff, false);
    dot(J.HF, 3.4 * s * (look.fist || 1), look.glove || look.skin);
    if (ex.front) ex.front(ctxDraw);
    ctx.restore();
    return J;
  },

  boot(ctx, foot, knee, f, s, b, col, mono) {
    const dx = foot[0] - knee[0], dy = foot[1] - knee[1], l = Math.hypot(dx, dy) || 1;
    // direção do pé: perpendicular à canela, voltada para a frente
    let px = -dy / l * f, py = dx / l * f;
    if (px * f < 0) { px = -px; py = -py; }
    const len = b.foot * s;
    ctx.strokeStyle = OUT; ctx.lineWidth = 6 * s + 2;
    ctx.beginPath(); ctx.moveTo(foot[0] - px * 2, foot[1] - py * 2); ctx.lineTo(foot[0] + px * len, foot[1] + py * len); ctx.stroke();
    ctx.strokeStyle = mono || col; ctx.lineWidth = 6 * s;
    ctx.beginPath(); ctx.moveTo(foot[0] - px * 2, foot[1] - py * 2); ctx.lineTo(foot[0] + px * len, foot[1] + py * len); ctx.stroke();
  },

  torso(ctx, J, f, s, b, look, mono) {
    const H = J.H, S = J.S;
    const tx = S[0] - H[0], ty = S[1] - H[1], tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl, ny = tx / tl;   // perpendicular (aponta para +x com tronco em pé)
    const hw = b.hipW * s / 2, sw = b.torsoW * s / 2;
    const pts = [[H[0] - nx * hw, H[1] - ny * hw], [H[0] + nx * hw, H[1] + ny * hw], [S[0] + nx * sw, S[1] + ny * sw], [S[0] - nx * sw, S[1] - ny * sw]];
    const poly = (p, col) => { ctx.fillStyle = mono || col; ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); ctx.fill(); };
    // barra da jaqueta passa um pouco do quadril
    const ext = [[pts[0][0] - tx / tl * 5 * s, pts[0][1] - ty / tl * 5 * s], [pts[1][0] - tx / tl * 5 * s, pts[1][1] - ty / tl * 5 * s], pts[2], pts[3]];
    if (!mono) { ctx.strokeStyle = OUT; ctx.lineWidth = 2.4; poly(ext, look.top); ctx.stroke(); } else poly(ext, look.top);
    if (mono) return;
    // camisa visível na frente (jaqueta aberta) — lado da frente = n * f
    if (look.shirt) {
      const a = 0.12 * f, c = 0.5 * f;
      poly([[H[0] + nx * hw * a * 2, H[1] + ny * hw * a * 2], [H[0] + nx * hw * c * 2, H[1] + ny * hw * c * 2], [S[0] + nx * sw * c * 1.6, S[1] + ny * sw * c * 1.6], [S[0] + nx * sw * a * 2, S[1] + ny * sw * a * 2]], look.shirt);
    }
    // sombra lateral do tronco
    poly([[H[0] - nx * hw * f, H[1] - ny * hw * f], [H[0] - nx * hw * f * 0.45, H[1] - ny * hw * f * 0.45], [S[0] - nx * sw * f * 0.45, S[1] - ny * sw * f * 0.45], [S[0] - nx * sw * f, S[1] - ny * sw * f]], U.shade(look.top, -22));
    // gola
    if (look.collar) poly([[S[0] - nx * sw * 0.2 * f, S[1] - ny * sw * 0.2 * f + 1], [S[0] + nx * sw * 0.7 * f, S[1] + ny * sw * 0.7 * f + 1], [S[0] + nx * sw * 0.2 * f + tx / tl * 7, S[1] + ty / tl * 7]], look.collar);
    if (look.belt) { ctx.strokeStyle = look.belt; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(H[0] - nx * hw, H[1] - ny * hw + 1); ctx.lineTo(H[0] + nx * hw, H[1] + ny * hw + 1); ctx.stroke(); }
  },

  head(ctx, J, f, s, look, mono, o) {
    const N = J.N, r = J.hr;
    const hair = look.hairStyle && Rig.HAIR[look.hairStyle];
    if (hair && hair.back) hair.back(ctx, N, r, f, look, mono, J);
    // pescoço
    ctx.strokeStyle = mono || OUT; ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(J.S[0], J.S[1]); ctx.lineTo(N[0] - Math.sin(U.deg(J.ha)) * f * r * 0.6, N[1] + r * 0.6); ctx.stroke();
    if (!mono) { ctx.strokeStyle = U.shade(look.skin, -30); ctx.lineWidth = 5 * s; ctx.stroke(); }
    // crânio
    ctx.fillStyle = mono || look.skin; ctx.beginPath(); ctx.ellipse(N[0], N[1], r * 0.92, r, U.deg(J.ha - (J.lean || 0)) * 0, 0, 7); ctx.fill();
    if (!mono) { ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.stroke(); }
    if (!mono) {
      // rosto (lado da frente)
      const fx = N[0] + f * r * 0.42, fy = N[1] - r * 0.08;
      if (look.stubble) { ctx.fillStyle = look.stubble; ctx.beginPath(); ctx.ellipse(N[0] + f * r * 0.42, N[1] + r * 0.62, r * 0.42, r * 0.22, 0, 0, Math.PI); ctx.fill(); }
      ctx.fillStyle = U.shade(look.skin, 25); ctx.fillRect(N[0] + f * r * 0.86 - 1, N[1] + 1, 2.4, 2.4);  // nariz
      const glow = o.eyeGlow || look.eyeGlow;
      if (glow) {
        ctx.fillStyle = glow; ctx.shadowColor = glow; ctx.shadowBlur = 8;
        ctx.fillRect(fx - 1.5, fy - 1, 4, 2.2); ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = look.eye || '#1d1512'; ctx.fillRect(fx - 1, fy - 1, 2.2, 2.2);
        if (look.brow) { ctx.fillStyle = look.brow; ctx.fillRect(fx - 2.5, fy - 3.6, 4.5, 1.4); }
      }
      if (look.mark) look.mark(ctx, N, r, f);
    }
    if (hair && hair.front) hair.front(ctx, N, r, f, look, mono, J);
  },

  // estilos de cabelo / cabeça
  HAIR: {
    // V: grisalho, bagunçado, mechas para trás e para cima
    messy: {
      front(ctx, N, r, f, look, mono) {
        const c = mono || look.hair, c2 = mono || look.hair2 || look.hair;
        ctx.fillStyle = c; ctx.strokeStyle = OUT; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(N[0] + f * r * 0.95, N[1] - r * 0.15);
        ctx.lineTo(N[0] + f * r * 1.1, N[1] - r * 0.7);
        ctx.lineTo(N[0] + f * r * 0.55, N[1] - r * 1.25);
        ctx.lineTo(N[0] + f * r * 0.2, N[1] - r * 1.05);
        ctx.lineTo(N[0] - f * r * 0.25, N[1] - r * 1.45);
        ctx.lineTo(N[0] - f * r * 0.55, N[1] - r * 1.05);
        ctx.lineTo(N[0] - f * r * 1.35, N[1] - r * 0.95);
        ctx.lineTo(N[0] - f * r * 1.05, N[1] - r * 0.45);
        ctx.lineTo(N[0] - f * r * 1.4, N[1] - r * 0.05);
        ctx.lineTo(N[0] - f * r * 0.95, N[1] + r * 0.45);
        ctx.lineTo(N[0] - f * r * 0.15, N[1] + r * 0.05);
        ctx.lineTo(N[0] + f * r * 0.3, N[1] - r * 0.5);
        ctx.closePath(); ctx.fill(); if (!mono) ctx.stroke();
        if (!mono) {
          ctx.strokeStyle = c2; ctx.lineWidth = 1.2; ctx.beginPath();
          ctx.moveTo(N[0] - f * r * 0.8, N[1] - r * 0.6); ctx.lineTo(N[0] + f * r * 0.4, N[1] - r * 0.95);
          ctx.moveTo(N[0] - f * r * 0.9, N[1] - r * 0.1); ctx.lineTo(N[0] - f * r * 0.1, N[1] - r * 0.6);
          ctx.stroke();
        }
      },
    },
    // Rayan: capuz escuro (como na aparição do capítulo 6 do jogo de aventura)
    hood: {
      back(ctx, N, r, f, look, mono) {
        ctx.fillStyle = mono || look.hood; ctx.strokeStyle = OUT; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.ellipse(N[0] - f * r * 0.25, N[1] - r * 0.05, r * 1.25, r * 1.3, 0, 0, 7); ctx.fill(); if (!mono) ctx.stroke();
      },
      front(ctx, N, r, f, look, mono) {
        ctx.fillStyle = mono || look.hood; ctx.strokeStyle = OUT; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(N[0] + f * r * 0.7, N[1] - r * 1.1);
        ctx.quadraticCurveTo(N[0] - f * r * 0.2, N[1] - r * 1.5, N[0] - f * r * 1.3, N[1] - r * 0.4);
        ctx.lineTo(N[0] - f * r * 1.2, N[1] + r * 0.9);
        ctx.lineTo(N[0] - f * r * 0.2, N[1] + r * 0.4);
        ctx.quadraticCurveTo(N[0] - f * r * 0.1, N[1] - r * 0.6, N[0] + f * r * 0.7, N[1] - r * 0.75);
        ctx.closePath(); ctx.fill(); if (!mono) ctx.stroke();
      },
    },
    // Trigg (proposta visual): coroa de estilhaços e máscara lisa
    shards: {
      back(ctx, N, r, f, look, mono, J) {
        const c = mono || look.crown;
        ctx.fillStyle = c; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2;
        for (let i = 0; i < 5; i++) {
          const a = U.deg(-150 + i * 30), len = r * (1.9 + (i % 2) * 0.7);
          ctx.beginPath();
          ctx.moveTo(N[0] + Math.cos(a - 0.12) * r * 0.9, N[1] + Math.sin(a - 0.12) * r * 0.9);
          ctx.lineTo(N[0] + Math.cos(a) * len, N[1] + Math.sin(a) * len);
          ctx.lineTo(N[0] + Math.cos(a + 0.12) * r * 0.9, N[1] + Math.sin(a + 0.12) * r * 0.9);
          ctx.closePath(); ctx.fill(); if (!mono) ctx.stroke();
        }
      },
      front(ctx, N, r, f, look, mono) {
        if (mono) return;
        ctx.fillStyle = look.mask; ctx.beginPath(); ctx.ellipse(N[0] + f * r * 0.15, N[1], r * 0.82, r * 0.95, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = look.slit || '#e8e2ff'; ctx.shadowColor = look.slit || '#e8e2ff'; ctx.shadowBlur = 6;
        ctx.fillRect(N[0] + (f > 0 ? r * 0.05 : -r * 0.85), N[1] - r * 0.15, r * 0.8, 1.8); ctx.shadowBlur = 0;
      },
    },
    // Kolt (proposta visual): crânio raspado com cristas ósseas
    ridges: {
      front(ctx, N, r, f, look, mono) {
        ctx.fillStyle = mono || look.ridge; ctx.strokeStyle = OUT; ctx.lineWidth = 1.1;
        const n = 3 + (look.ridgeCount || 0);
        for (let i = 0; i < n; i++) {
          const a = U.deg(-100 - i * (70 / n)) , bx = N[0] + Math.cos(a) * r * 0.9 * f, by = N[1] + Math.sin(a) * r * 0.9;
          ctx.beginPath(); ctx.moveTo(bx - 2.2, by + 1); ctx.lineTo(bx + Math.cos(a) * 6 * f, by + Math.sin(a) * 6 - 1); ctx.lineTo(bx + 2.2, by + 1); ctx.closePath(); ctx.fill(); if (!mono) ctx.stroke();
        }
      },
    },
  },

  // ------------------------------------------------------------ retrato
  // cabeça e ombros grandes, desenhados com o mesmo rig (para HUD/seleção)
  portrait(ctx, def, x, y, size, facing = 1, form) {
    const look = Rig.lookFor(def, form);
    const build = Object.assign({}, Rig.BUILD, def.look.build, { scale: size / 12 / ((def.look.build && def.look.build.headR || 9) / 9), lean: 0 });
    const pose = Object.assign({}, VA.poses.portrait);
    ctx.save();
    ctx.beginPath(); ctx.rect(x - size, y - size, size * 2, size * 2); ctx.clip();
    const J = Rig.joints(pose, build, facing);
    // posiciona a cabeça um pouco acima do centro do quadro
    Rig.draw(ctx, { x: x - J.N[0], y: y - size * 0.15 + Rig.lowest(J) - J.N[1], facing, pose, look, build });
    ctx.restore();
  },

  lookFor(def, form) {
    let look = def.look;
    if (form && def.forms[form] && def.forms[form].look) look = Object.assign({}, look, def.forms[form].look);
    return look;
  },
};

// ------------------------------------------------------------ sprites
// Desenha uma folha de sprites no lugar do esqueleto, quando houver.
VA.drawSprite = function (ctx, sp, f, anim, t) {
  const a = sp.anims[anim] || sp.anims.idle;
  if (!a || !sp.img.complete || !sp.img.naturalWidth) return false;
  const frame = a.loop === false ? Math.min(a.frames - 1, Math.floor(t * a.fps / FPS)) : Math.floor(t * a.fps / FPS) % a.frames;
  const sc = sp.scale || 1;
  ctx.save();
  ctx.translate(Math.round(f.x), Math.round(f.y));
  ctx.scale(f.facing * sc, sc);
  ctx.drawImage(sp.img, frame * sp.fw, a.row * sp.fh, sp.fw, sp.fh, -sp.ox, -sp.oy, sp.fw, sp.fh);
  ctx.restore();
  return true;
};
