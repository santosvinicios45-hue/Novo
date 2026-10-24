// =====================================================================
//  poses.js — biblioteca de poses do esqueleto.
//  Campos (graus): lean (tronco), head, sF/eF (ombro/cotovelo da frente),
//  sB/eB (de trás), hF/kF e hB/kB (quadril/joelho), rot (corpo inteiro,
//  + = cair para trás), x/y (deslocamento em px).
//  Um personagem pode sobrescrever qualquer pose em def.poses.
// =====================================================================
'use strict';

const POSE_KEYS = ['lean', 'head', 'sF', 'eF', 'sB', 'eB', 'hF', 'kF', 'hB', 'kB', 'rot', 'x', 'y'];
const LEGS = { hF: 22, kF: 18, hB: -14, kB: 6 };
const CROUCH_LEGS = { hF: 80, kF: 98, hB: 42, kB: 112 };
const P = (o, base) => Object.assign({}, base || {}, o);

Object.assign(VA.poses, {
  stance: P({ lean: 6, head: -4, sF: 35, eF: 110, sB: 22, eB: 112 }, LEGS),
  stance2: P({ lean: 8, head: -3, sF: 39, eF: 112, sB: 25, eB: 116, hF: 25, kF: 25, hB: -12, kB: 11 }),
  crouch: P({ lean: 28, head: -20, sF: 52, eF: 96, sB: 34, eB: 108 }, CROUCH_LEGS),
  jump: P({ lean: 4, head: -4, sF: 62, eF: 80, sB: 44, eB: 90, hF: 62, kF: 92, hB: 14, kB: 74 }),
  fall: P({ lean: 2, head: -2, sF: 70, eF: 52, sB: 50, eB: 62, hF: 32, kF: 42, hB: -8, kB: 30 }),
  land: P({ lean: 18, head: -10, sF: 45, eF: 90, sB: 30, eB: 100, hF: 55, kF: 62, hB: 20, kB: 70 }),
  block: P({ lean: -2, head: -8, sF: 72, eF: 102, sB: 62, eB: 112, hF: 18, kF: 16, hB: -18, kB: 8 }),
  cblock: P({ lean: 22, head: -14, sF: 82, eF: 96, sB: 72, eB: 102 }, CROUCH_LEGS),
  hit: P({ lean: -20, head: -16, sF: -10, eF: 40, sB: -26, eB: 30, hF: 26, kF: 22, hB: -22, kB: 4, x: -3 }),
  hitLow: P({ lean: 32, head: 16, sF: 15, eF: 30, sB: 0, eB: 20, hF: 42, kF: 52, hB: -6, kB: 30 }),
  airHit: P({ rot: 35, lean: -10, head: 10, sF: -40, eF: 20, sB: -62, eB: 12, hF: 42, kF: 52, hB: 12, kB: 42 }),
  lie: P({ rot: 90, head: 6, sF: 120, eF: 14, sB: 150, eB: 10, hF: 16, kF: 12, hB: 6, kB: 6 }),
  getup: P({ lean: 46, head: -24, sF: 40, eF: 10, sB: 20, eB: 30, hF: 85, kF: 110, hB: 30, kB: 120 }),
  dizzy: P({ lean: -6, head: 20, sF: 10, eF: 16, sB: -4, eB: 10, hF: 10, kF: 16, hB: -10, kB: 16 }),
  thrown: P({ rot: 20, lean: -20, head: -20, sF: 120, eF: 30, sB: 140, eB: 30, hF: 40, kF: 70, hB: 20, kB: 60 }),
  // ataques básicos
  jab_a: P({ lean: 4, head: -4, sF: 30, eF: 118, sB: 26, eB: 116 }, LEGS),
  jab_b: P({ lean: 12, head: -6, sF: 88, eF: 2, sB: 14, eB: 122, hF: 27, kF: 21, hB: -18, kB: 6, x: 3 }),
  straight_a: P({ lean: -6, head: -4, sF: 18, eF: 124, sB: 42, eB: 100, hF: 20, kF: 16, hB: -22, kB: 6, x: -2 }),
  straight_b: P({ lean: 20, head: -8, sF: 94, eF: 0, sB: -6, eB: 96, hF: 36, kF: 30, hB: -30, kB: 4, x: 7 }),
  lk_a: P({ lean: -6, head: -4, sF: 50, eF: 100, sB: 30, eB: 100, hF: 62, kF: 104, hB: -10, kB: 4 }),
  lk_b: P({ lean: -16, head: 0, sF: 40, eF: 100, sB: -10, eB: 80, hF: 90, kF: 6, hB: -8, kB: 4 }),
  hk_a: P({ lean: -14, head: -2, sF: 60, eF: 90, sB: 10, eB: 90, hF: 96, kF: 124, hB: -6, kB: 2 }),
  hk_b: P({ lean: -30, head: 12, sF: 62, eF: 80, sB: -24, eB: 60, hF: 124, kF: 8, hB: 0, kB: 0 }),
  clp_b: P({ lean: 22, head: -16, sF: 90, eF: 0, sB: 32, eB: 108 }, CROUCH_LEGS),
  chk_a: P({ lean: 34, head: -20, sF: 30, eF: 80, sB: 40, eB: 90, hF: 70, kF: 110, hB: 50, kB: 120 }),
  chk_b: P({ lean: 44, head: -24, sF: 10, eF: 40, sB: 80, eB: 20, hF: 96, kF: 2, hB: 64, kB: 124, y: -2 }),
  air_l: P({ lean: -6, head: 4, sF: 70, eF: 70, sB: 40, eB: 80, hF: 56, kF: 4, hB: 24, kB: 84 }),
  air_h_a: P({ lean: -16, head: -8, sF: 168, eF: 24, sB: 150, eB: 30, hF: 50, kF: 90, hB: 14, kB: 74 }),
  air_h_b: P({ lean: 24, head: 6, sF: 72, eF: 6, sB: 60, eB: 14, hF: 60, kF: 92, hB: 18, kB: 80 }),
  throw_a: P({ lean: 16, head: -6, sF: 86, eF: 10, sB: 80, eB: 16, hF: 30, kF: 26, hB: -24, kB: 6, x: 4 }),
  throw_b: P({ lean: -22, head: -16, sF: 152, eF: 20, sB: 140, eB: 24, hF: 18, kF: 12, hB: -26, kB: 8 }),
  // especiais genéricos
  upper_a: P({ lean: 26, head: -16, sF: -20, eF: 60, sB: 40, eB: 90, hF: 62, kF: 84, hB: 30, kB: 94 }),
  upper_b: P({ lean: -8, head: -16, sF: 172, eF: 4, sB: 20, eB: 60, hF: 12, kF: 34, hB: -30, kB: 62 }),
  push_a: P({ lean: -12, head: -6, sF: 26, eF: 64, sB: 40, eB: 52, hF: 32, kF: 32, hB: -26, kB: 10, x: -3 }),
  push_b: P({ lean: 14, head: -8, sF: 92, eF: 0, sB: 86, eB: 6, hF: 36, kF: 32, hB: -32, kB: 4, x: 5 }),
  dash_b: P({ lean: 32, head: -14, sF: 92, eF: 0, sB: -40, eB: 32, hF: 52, kF: 52, hB: -42, kB: 20, x: 6 }),
  cast_a: P({ lean: -8, head: -10, sF: 156, eF: 12, sB: 20, eB: 90 }, LEGS),
  cast_b: P({ lean: 8, head: -6, sF: 112, eF: 0, sB: 16, eB: 96 }, LEGS),
  counter: P({ lean: -4, head: -6, sF: 66, eF: 66, sB: 56, eB: 84, hF: 20, kF: 26, hB: -20, kB: 16 }),
  guard: P({ lean: -6, head: -12, sF: 102, eF: 18, sB: 96, eB: 24, hF: 26, kF: 22, hB: -22, kB: 10 }),
  charge: P({ lean: 36, head: -18, sF: 12, eF: 104, sB: -10, eB: 100, hF: 52, kF: 42, hB: -42, kB: 10, x: 4 }),
  grab: P({ lean: 20, head: -8, sF: 74, eF: 30, sB: 68, eB: 34, hF: 32, kF: 28, hB: -26, kB: 8, x: 4 }),
  slam: P({ lean: 52, head: 10, sF: 30, eF: 6, sB: 26, eB: 10, hF: 70, kF: 80, hB: -10, kB: 30, x: 6 }),
  stomp_a: P({ lean: -10, head: -4, sF: 60, eF: 90, sB: 40, eB: 90, hF: 78, kF: 110, hB: -6, kB: 4 }),
  stomp_b: P({ lean: 14, head: 4, sF: 40, eF: 90, sB: 20, eB: 90, hF: 30, kF: 2, hB: -24, kB: 20 }),
  spin_b: P({ lean: -24, head: 0, sF: 120, eF: 20, sB: -60, eB: 30, hF: 104, kF: 4, hB: 8, kB: 6 }),
  slide: P({ rot: 34, lean: 0, head: -24, sF: -10, eF: 40, sB: -30, eB: 60, hF: 92, kF: 4, hB: 50, kB: 100 }),
  float: P({ lean: 6, head: -6, sF: 40, eF: 60, sB: 30, eB: 60, hF: 30, kF: 60, hB: 4, kB: 50 }),
  // poses de personalidade
  pockets: P({ lean: 2, head: 10, sF: -6, eF: 28, sB: -10, eB: 30, hF: 8, kF: 4, hB: -8, kB: 2 }),
  win: P({ lean: -4, head: -12, sF: 166, eF: 18, sB: 10, eB: 40, hF: 14, kF: 6, hB: -12, kB: 4 }),
  kneel: P({ lean: 34, head: 32, sF: 20, eF: 10, sB: 6, eB: 12, hF: 92, kF: 92, hB: -10, kB: 112 }),
  portrait: P({ lean: 0, head: -2, sF: 8, eF: 18, sB: 4, eB: 18, hF: 6, kF: 2, hB: -6, kB: 2 }),
});

// mistura duas poses em `out` (reaproveita o objeto: sem lixo por quadro)
VA.mixPose = function (a, b, t, out) {
  out = out || {};
  for (let i = 0; i < POSE_KEYS.length; i++) {
    const k = POSE_KEYS[i];
    out[k] = U.lerp(a[k] || 0, b[k] || 0, t);
  }
  return out;
};
VA.copyPose = function (a, out) { for (const k of POSE_KEYS) out[k] = a[k] || 0; return out; };

// ciclo de caminhada/corrida procedural sobre a pose base
VA.walkPose = function (base, phase, amp, out, run) {
  VA.copyPose(base, out);
  const s = Math.sin(phase), c = Math.cos(phase);
  out.hF = (run ? 20 : 8) + s * amp;
  out.hB = (run ? 0 : -6) - s * amp;
  out.kF = 10 + Math.max(0, -c) * amp * 1.4;
  out.kB = 10 + Math.max(0, c) * amp * 1.4;
  out.y = Math.abs(c) * (run ? 3 : 1.5);
  if (run) { out.lean = 24; out.sF = 20 - s * 50; out.eF = 90; out.sB = 20 + s * 50; out.eB = 90; out.head = -14; }
  else { out.sF += s * 6; out.sB -= s * 6; }
  return out;
};
VA.POSE_KEYS = POSE_KEYS;
