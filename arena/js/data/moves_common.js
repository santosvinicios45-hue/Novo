// =====================================================================
//  moves_common.js — golpes básicos herdados por todos os personagens.
//  Cada ficha pode sobrescrever qualquer campo (dano, quadros, caixas)
//  ou remover um golpe com `null`. O alcance escala com o tamanho.
//
//  Quadros: startup (preparação) → active (caixa de ataque ligada) →
//  recovery (recuperação, vulnerável). 60 quadros = 1 segundo.
//  Caixas: x/y relativos aos pés, x para a frente, y negativo = para cima.
// =====================================================================
'use strict';

VA.commonMoves = function (def) {
  const s = (def.look && def.look.build && def.look.build.scale) || 1;
  const B = (x, y, w, h) => ({ x: Math.round(x * s), y: Math.round(y * s), w: Math.round(w * s), h: Math.round(h * s) });
  return {
    lp: { name: 'Soco rápido', anim: ['jab_a', 'jab_b'], startup: 4, active: 3, recovery: 8, box: B(12, -82, 36, 14),
      hit: { dmg: 35, stun: 14, bstun: 10, push: 3 }, chain: ['lk', 'hp', 'hk', 'chk'] },
    hp: { name: 'Soco pesado', anim: ['straight_a', 'straight_b'], startup: 8, active: 4, recovery: 17, box: B(14, -84, 44, 16),
      hit: { dmg: 80, stun: 20, bstun: 14, push: 5, hitstop: 8 }, motion: [{ f0: 3, f1: 9, vx: 1.6 }] },
    lk: { name: 'Chute rápido', anim: ['lk_a', 'lk_b'], startup: 5, active: 3, recovery: 10, box: B(10, -60, 46, 14),
      hit: { dmg: 40, stun: 15, bstun: 11, push: 4 }, chain: ['hp', 'hk', 'chk'] },
    hk: { name: 'Chute pesado', anim: ['hk_a', 'hk_b'], startup: 11, active: 4, recovery: 19, box: B(12, -96, 54, 20),
      hit: { dmg: 95, stun: 22, bstun: 15, push: 8, hitstop: 9 }, cancel: ['super'] },
    clp: { name: 'Golpe baixo', anim: ['crouch', 'clp_b'], crouch: true, startup: 4, active: 3, recovery: 8, box: B(12, -42, 36, 12),
      hit: { dmg: 28, stun: 13, bstun: 9, push: 3, level: 'low' }, chain: ['clp', 'chk', 'hp'] },
    chk: { name: 'Rasteira', anim: ['chk_a', 'chk_b'], crouch: true, startup: 9, active: 4, recovery: 21, box: B(6, -18, 64, 16),
      hit: { dmg: 70, stun: 20, bstun: 14, push: 6, level: 'low', knock: 'sweep' }, cancel: [] },
    air_l: { name: 'Chute aéreo', air: true, anim: ['jump', 'air_l'], startup: 5, active: 9, recovery: 6, box: B(4, -50, 38, 24),
      hit: { dmg: 45, stun: 15, bstun: 11, push: 3, level: 'high' }, cancel: [] },
    air_h: { name: 'Martelo aéreo', air: true, anim: ['air_h_a', 'air_h_b'], startup: 8, active: 6, recovery: 8, box: B(6, -72, 42, 40),
      hit: { dmg: 80, stun: 19, bstun: 14, push: 5, level: 'high', hitstop: 8 }, cancel: [] },
    throw: { name: 'Agarrão', type: 'throw', anim: ['throw_a', 'throw_a'], startup: 3, active: 2, recovery: 22,
      hits: [{ f: 3, len: 2, grab: true, dmg: 110 }], noExtend: true },
  };
};
