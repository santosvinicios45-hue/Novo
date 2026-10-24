// =====================================================================
//  V — The Awakening Arena
//  util.js — namespace global, constantes e utilidades
// =====================================================================
'use strict';

const W = 640, H = 360;          // resolução interna (escalada na tela)
const GROUND = 322;              // linha do chão em coordenadas de tela
const FPS = 60;

const VA = window.VA = {
  chars: {}, charOrder: [],      // fichas de personagens registradas
  stages: {}, stageOrder: [],    // cenários registrados
  poses: {},                     // biblioteca de poses do esqueleto
  sprites: {},                   // folhas de sprite opcionais (substituem o esqueleto)
  match: null,                   // partida em andamento
  debug: { hitboxes: false },
};

const U = {
  clamp: (v, a, b) => v < a ? a : v > b ? b : v,
  lerp: (a, b, t) => a + (b - a) * t,
  rand: (a, b) => a + Math.random() * (b - a),
  irand: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  chance: p => Math.random() < p,
  sign: v => v < 0 ? -1 : 1,
  approach: (v, t, s) => v < t ? Math.min(v + s, t) : Math.max(v - s, t),
  easeOut: t => 1 - (1 - t) * (1 - t),
  easeInOut: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  deg: d => d * Math.PI / 180,
  overlap: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
  hash: (x, s = 0) => { let h = (x * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; },
  shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = U.clamp(((n >> 16) & 255) + amt, 0, 255), g = U.clamp(((n >> 8) & 255) + amt, 0, 255), b = U.clamp((n & 255) + amt, 0, 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  },
  mix(a, b, t) {
    const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    const r = Math.round(U.lerp((x >> 16) & 255, (y >> 16) & 255, t));
    const g = Math.round(U.lerp((x >> 8) & 255, (y >> 8) & 255, t));
    const bl = Math.round(U.lerp(x & 255, y & 255, t));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  },
  rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  },
  // mescla profunda simples (objetos comuns; arrays são substituídos)
  merge(base, over) {
    if (!over) return base;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (const k in over) {
      const v = over[k];
      out[k] = (v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object' && base[k] && !Array.isArray(base[k])) ? U.merge(base[k], v) : v;
    }
    return out;
  },
  fmtTime(frames) {
    const s = Math.floor(frames / FPS);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  },
  esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
};

// ------------------------------------------------------------ registro
// Personagens e cenários se registram aqui. Ver docs/ADICIONAR_PERSONAGEM.md
VA.registerCharacter = function (def) {
  if (!def.id || !def.name) throw new Error('Personagem sem id/nome');
  if (VA.chars[def.id]) throw new Error('Personagem duplicado: ' + def.id);
  const d = U.merge(VA.CHAR_DEFAULTS, def);
  d.moves = {};
  // golpes comuns herdados + golpes próprios (os próprios sobrescrevem)
  const base = def.inheritCommon === false ? {} : VA.commonMoves(d);
  for (const k in base) d.moves[k] = base[k];
  for (const k in def.moves || {}) d.moves[k] = def.moves[k] ? (base[k] ? U.merge(base[k], def.moves[k]) : Object.assign({}, def.moves[k])) : null;
  for (const k in d.moves) {
    if (!d.moves[k]) { delete d.moves[k]; continue; }
    const m = d.moves[k];
    m.id = k;
    // variantes de forma (ex.: golpe aprimorado durante a transformação) herdam do golpe base
    if (m.formVariant) for (const fid in m.formVariant) {
      const raw = Object.assign({}, m); delete raw.formVariant; delete raw.hits;
      if (!m.formVariant[fid].hits && !m.formVariant[fid].box && m.hits) raw.hits = m.hits;
      const v = U.merge(raw, m.formVariant[fid]);
      v.id = k; v.isVariant = true;
      m.formVariant[fid] = VA.normalizeMove(v);
    }
    VA.normalizeMove(m);
  }
  VA.chars[d.id] = d;
  VA.charOrder.push(d.id);
  if (d.sprite) VA.loadSpriteSheet(d.id, d.sprite);
  return d;
};

VA.registerStage = function (def) {
  if (!def.id) throw new Error('Cenário sem id');
  VA.stages[def.id] = Object.assign({ width: 1000, unlock: null, music: 'city' }, def);
  VA.stageOrder.push(def.id);
};

VA.CHAR_DEFAULTS = {
  health: 1000,
  stats: { speed: 5, power: 5, defense: 5, reach: 5, energy: 5 },
  physics: {
    walk: 2.4, back: 1.9, run: 5.2, backdash: 5.5, jumpV: -10, jumpH: 3.1, gravity: 0.55,
    width: 30, height: 100, crouchHeight: 64, weight: 1, throwRange: 52,
  },
  energyGain: 1,
  look: {},
  ai: { range: 70, aggression: 0.55, zoning: 0.3, antiAir: 'sp_down', projectile: null, approach: null, punish: ['hp'], combos: [['lp', 'hp']] },
  forms: {},
  rivals: [],
  arcade: { ladder: [], ending: null },
  locked: false,
};
