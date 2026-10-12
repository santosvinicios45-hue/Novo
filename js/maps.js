// =====================================================================
//  maps.js — os lugares da história
// =====================================================================
'use strict';

// construtor de grades
function Grid(w, h, ch = '#') {
  const g = [];
  for (let y = 0; y < h; y++) g.push(Array(w).fill(ch));
  const api = {
    rect(x, y, ww, hh, c) { for (let j = y; j < y + hh; j++) for (let i = x; i < x + ww; i++) if (g[j] && i >= 0 && i < w) g[j][i] = c; return api; },
    set(x, y, c) { if (g[y]) g[y][x] = c; return api; },
    rows() { return g.map(r => r.join('')); },
  };
  return api;
}
const T = n => n * TILE;
PROPS.spot = () => { };
PROPDEF.spot = { w: 16, h: 16, box: null };
PROPS.block = () => { };
PROPDEF.block = { w: 16, h: 16, box: [0, 0, 16, 16] };
WALLTHEMES.mansao.faceH = 3;
WALLTHEMES.hospital.faceH = 2;
WALLTHEMES.mansaoLow = Object.assign({}, WALLTHEMES.mansao, { faceH: 1, panel: null });
WALLTHEMES.predioLow = { top: '#4a4440', face: '#8a8076', faceD: '#7a7066', base: '#4a443e' };
Tiles._draw = Tiles.draw;
Tiles.draw = function (c, type, tx, ty) {
  if (type === 'curbUp') { Tiles._draw(c, 'sidewalk', tx, ty); c.fillStyle = '#bcb8ae'; c.fillRect(tx * 16, ty * 16, 16, 3); c.fillStyle = '#6d6a63'; c.fillRect(tx * 16, ty * 16 + 3, 16, 1); return; }
  if (type === 'alley') { Tiles._draw(c, 'asphalt', tx, ty); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(tx * 16, ty * 16, 16, 16); return; }
  if (type === 'balconyView') {
    c.fillStyle = '#1a2230'; c.fillRect(tx * 16, ty * 16, 16, 16);
    c.fillStyle = '#3a4a5a'; c.fillRect(tx * 16, ty * 16 + 10, 16, 6);
    if (U.hash(tx, ty, 2) > .4) { c.fillStyle = '#e8c86a'; c.fillRect(tx * 16 + 4, ty * 16 + 12, 2, 1); }
    return;
  }
  return Tiles._draw(c, type, tx, ty);
};

// ---------------------------------------------------------------- fachadas da rua
function drawBuilding(c, b) {
  const x = T(b.x), y = T(b.y), w = T(b.w), h = T(b.h);
  const R = (xx, yy, ww, hh, col) => { c.fillStyle = col; c.fillRect(x + xx, y + yy, ww, hh); };
  const facadeH = T(3);
  // telhado/topo visto de cima
  R(0, 0, w, h - facadeH, b.roof || '#5a504a');
  for (let i = 0; i < w; i += 8) R(i, 0, 1, h - facadeH, U.shade(b.roof || '#5a504a', -10));
  R(0, h - facadeH - 3, w, 3, U.shade(b.roof || '#5a504a', -25));
  // caixa d'água / antenas
  if (b.tank) { R(w / 2 - 10, 10, 20, 14, '#8a8a86'); R(w / 2 - 10, 10, 20, 3, '#a0a09c'); }
  if (b.antenna) { R(10, 6, 1, 18, '#333'); R(6, 8, 9, 1, '#333'); }
  // fachada
  const fy = h - facadeH;
  R(0, fy, w, facadeH, b.wall || '#c8b8a0');
  R(0, fy, w, 2, U.shade(b.wall || '#c8b8a0', 18));
  R(0, h - 4, w, 4, U.shade(b.wall || '#c8b8a0', -35));
  // janelas do térreo / vitrine
  if (b.shop) {
    R(4, fy + 14, w - 8, 22, '#2e3a44'); R(5, fy + 15, w - 10, 6, '#5a7080');
    R(0, fy + 6, w, 8, b.awning || '#b03a30'); for (let i = 0; i < w; i += 8) R(i, fy + 6, 4, 8, U.shade(b.awning || '#b03a30', 30));
    for (let i = 0; i < w; i += 8) R(i, fy + 13, 4, 2, U.shade(b.awning || '#b03a30', -20));
  } else {
    for (let i = 10; i < w - 10; i += 22) { R(i, fy + 8, 12, 14, '#2e3a44'); R(i + 1, fy + 9, 4, 5, '#6a8494'); R(i - 1, fy + 22, 14, 2, U.shade(b.wall || '#c8b8a0', -20)); }
  }
  // porta
  if (b.door !== undefined) {
    const dx = T(b.door - b.x);
    R(dx + 1, fy + 18, 14, 30, '#3a2a20'); R(dx + 2, fy + 19, 12, 29, b.doorCol || '#6a4a34'); R(dx + 11, fy + 34, 2, 2, '#d8c070');
    if (b.glassDoor) { R(dx + 3, fy + 21, 10, 22, '#4a6070'); R(dx + 4, fy + 22, 3, 8, '#8aa4b4'); }
  }
  // letreiro
  if (b.sign) {
    c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const sw = Math.min(w - 6, c.measureText(b.sign).width + 10);
    R(w / 2 - sw / 2, fy - 12, sw, 11, b.signBg || '#2a2420'); R(w / 2 - sw / 2, fy - 12, sw, 1, '#fff2');
    c.fillStyle = b.signCol || '#f2e6c8'; c.fillText(b.sign, x + w / 2, y + fy - 6);
  }
  if (b.number) { R(w - 16, fy + 4, 10, 7, '#2a3a5a'); c.font = '6px monospace'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(b.number, x + w - 11, y + fy + 8); }
}

const MAPS = {};

// ================================================================= APARTAMENTO
(() => {
  const g = Grid(22, 17, '#');
  g.rect(1, 2, 13, 11, '.');            // sala/cozinha/escritório
  g.rect(1, 2, 6, 5, ',');              // piso da cozinha
  g.rect(15, 2, 6, 6, 'r');             // quarto
  g.rect(15, 10, 6, 3, 'b');            // banheiro
  g.rect(15, 1, 6, 1, 'Q');             // parede do quarto
  g.rect(15, 9, 6, 1, 'H');             // parede do banheiro
  g.set(14, 5, 'r');                    // porta do quarto
  g.set(14, 11, 'b');                   // porta do banheiro
  g.rect(1, 13, 3, 1, 's');             // porta de vidro da sacada
  g.rect(1, 14, 4, 2, 's');             // sacada
  g.rect(0, 16, 6, 1, 'v');             // vista da rua lá embaixo
  g.set(9, 13, 'D');                    // porta de entrada
  MAPS.apto = {
    name: 'Apartamento — 42 m²', theme: 'apto', music: 'apto', bg: '#0e0c0b',
    tiles: g.rows(),
    legend: {
      '#': { wall: 'apto' }, 'Q': { wall: 'quarto' }, 'H': { wall: 'banheiro' },
      '.': { floor: 'wood' }, ',': { floor: 'kitchen' }, 'r': { floor: 'wood' }, 'b': { floor: 'bath' },
      's': { floor: 'balcony' }, 'v': { floor: 'balconyView', solid: true }, 'D': { floor: 'wood' },
    },
    spawns: { start: [T(3) + 4, T(4) + 4, 'up'], porta: [T(9) + 8, T(12) + 10, 'up'], banheiro: [T(13) + 6, T(11) + 12, 'left'], sofa: [T(10) + 4, T(10) + 4, 'up'], sacada: [T(2) + 8, T(14) + 12, 'down'] },
    props: [
      { t: 'counter', x: T(1), y: T(2) - 8, id: 'pia', act: 'pia' },
      { t: 'fridge', x: T(4) + 2, y: T(1) + 6, id: 'geladeira', act: 'geladeira' },
      { t: 'stove', x: T(5) + 6, y: T(2) - 8, id: 'fogao', act: 'fogao' },
      { t: 'table', x: T(2), y: T(6) - 2, id: 'mesa', st: { notebook: true, laptop: true }, act: 'mesa' },
      { t: 'chair', x: T(3), y: T(7) + 2, id: 'cadeira' },
      { t: 'window', x: T(8), y: 6, wallMounted: true, id: 'janela', act: 'janela', st: {} },
      { t: 'rug', x: T(8) + 4, y: T(6), st: { w: 64, h: 40, c: '#6a4a44' } },
      { t: 'rack', x: T(9) + 6, y: T(2) + 6, id: 'rack' },
      { t: 'tv', x: T(10) - 2, y: T(1) + 6, id: 'tv', act: 'tv', st: { on: false } },
      { t: 'estante', x: T(12) + 2, y: T(1) + 2, id: 'estante', act: 'estante' },
      { t: 'sofa', x: T(9) + 4, y: T(8) + 2, id: 'sofa', act: 'sofa' },
      { t: 'lamp', x: T(12) + 4, y: T(8) + 6, id: 'abajur', act: 'abajur', st: { color: '#e8d8b0' }, light: { r: 46, a: 0.9, oy: 4 } },
      { t: 'plant', x: T(1) + 2, y: T(10), id: 'planta' },
      { t: 'broom', x: T(13) + 6, y: T(10) + 4, id: 'vassoura', act: 'vassoura' },
      { t: 'rug', x: T(9), y: T(12) + 6, st: { w: 16, h: 10, c: '#5a4a3a' } },
      // quarto
      { t: 'bed', x: T(18) + 4, y: T(2) - 2, id: 'cama', act: 'cama', st: { messy: true } },
      { t: 'window', x: T(16), y: 6, wallMounted: true, id: 'janelaQuarto', st: { poco: true }, act: 'janelaQuarto' },
      { t: 'chair', x: T(16), y: T(5) + 4, id: 'cadeiraQuarto' },
      { t: 'plant', x: T(16), y: T(2) - 2 },
      // banheiro
      { t: 'toilet', x: T(19) + 4, y: T(10) + 6 },
      { t: 'sinkBath', x: T(16), y: T(10) },
      { t: 'mirror', x: T(16) + 1, y: T(9) + 2, wallMounted: true },
      { t: 'shower', x: T(17) + 6, y: T(10) - 4 },
      { t: 'spot', x: T(14), y: T(11) - 4, w: 16, h: 20, id: 'portaBanheiro', act: 'portaBanheiro' },
      // sacada
      { t: 'railing', x: T(0) + 8, y: T(15) + 4, st: { w: 72 } },
      { t: 'plant', x: T(4), y: T(14) - 4 },
      { t: 'spot', x: T(1), y: T(14), w: 64, h: 20, id: 'sacadaVista', act: 'sacada' },
    ],
    exits: [
      { x: T(9), y: T(13) + 8, w: 16, h: 8, to: 'rua', spawn: 'predio', locked: () => !G.flags.podeSair, lockedMsg: 'portaTrancada' },
    ],
  };
})();

// ================================================================= RUA
(() => {
  const W2 = 64, H2 = 30;
  const g = Grid(W2, H2, 'B');
  g.rect(0, 8, W2, 2, 's'); g.rect(0, 10, W2, 1, 'c');
  g.rect(0, 11, W2, 5, 'a'); g.rect(0, 13, W2, 1, 'y');
  g.rect(30, 11, 4, 5, 'z');
  g.rect(0, 16, W2, 1, 'k'); g.rect(0, 17, W2, 2, 's');
  g.rect(0, 19, W2, 9, 'g');
  g.rect(0, 23, W2, 1, 'p'); g.rect(30, 19, 4, 9, 'p'); g.rect(26, 20, 12, 7, 'p');
  g.rect(8, 19, 2, 4, 'p'); g.rect(50, 23, 2, 5, 'p');
  g.rect(0, 28, W2, 2, 'X');
  g.rect(50, 1, 3, 7, 'l'); // beco
  g.rect(0, 8, 1, 2, 'X'); g.rect(W2 - 1, 8, 1, 2, 'X'); g.rect(0, 16, 1, 12, 'X'); g.rect(W2 - 1, 16, 1, 12, 'X');
  const buildings = [
    { x: 0, y: 0, w: 10, h: 8, wall: '#c8b8a0', roof: '#5a504a', door: 5, sign: 'Ed. Primavera', number: '142', tank: true, doorCol: '#5a3a28', glassDoor: true },
    { x: 10, y: 0, w: 6, h: 8, wall: '#e8d8b8', roof: '#6a5040', shop: true, awning: '#c8783a', sign: 'Padaria Pão Nosso', door: 12, glassDoor: true },
    { x: 16, y: 0, w: 6, h: 8, wall: '#e8eef0', roof: '#5a5a60', shop: true, awning: '#3a8a5a', sign: 'Farmácia', signBg: '#2a6a4a', door: 18, glassDoor: true },
    { x: 22, y: 0, w: 8, h: 8, wall: '#9aa4b0', roof: '#4a4e56', sign: 'Centro Comercial', antenna: true, door: 26, glassDoor: true },
    { x: 30, y: 0, w: 6, h: 8, wall: '#d8a070', roof: '#6a4a30', shop: true, awning: '#2a5a8a', sign: 'Bar do Zeca', door: 33 },
    { x: 36, y: 0, w: 8, h: 8, wall: '#b8c8b0', roof: '#4a5a48', door: 40, number: '160', tank: true },
    { x: 44, y: 0, w: 6, h: 8, wall: '#e0c8d8', roof: '#5a4a58', shop: true, awning: '#8a3a6a', sign: 'Eletro', door: 46, glassDoor: true },
    { x: 53, y: 0, w: 11, h: 8, wall: '#c0b0a0', roof: '#504640', sign: 'Ed. Aurora', door: 58, antenna: true, tank: true },
  ];
  MAPS.rua = {
    name: 'A rua', theme: 'predio', music: 'rua', bg: '#2a2a2a',
    tiles: g.rows(), buildings,
    legend: {
      'B': { floor: 'void', solid: true }, 's': { floor: 'sidewalk' }, 'c': { floor: 'curb' }, 'a': { floor: 'asphalt' }, 'y': { floor: 'laneDash' },
      'z': { floor: 'zebra' }, 'k': { floor: 'curbUp' }, 'g': { floor: 'grass' }, 'p': { floor: 'portuguese' }, 'X': { floor: 'grass', solid: true },
      'l': { floor: 'alley' },
    },
    decorate(c) {
      for (const b of buildings) drawBuilding(c, b);
      // paredes do beco
      c.fillStyle = '#6a625a'; c.fillRect(T(50), 0, 2, T(8)); c.fillRect(T(53) - 2, 0, 2, T(8));
      c.fillStyle = '#3a3632'; c.fillRect(T(50), 0, T(3), T(1));
      // grafite no beco
      c.fillStyle = '#e85a8a'; c.fillRect(T(50) + 4, T(4), 6, 2); c.fillStyle = '#5ac8e8'; c.fillRect(T(50) + 6, T(4) + 3, 8, 2);
      // bueiros
      c.fillStyle = '#2a2a2a'; for (const bx of [6, 22, 44]) { c.fillRect(T(bx), T(10) + 10, 10, 4); c.fillStyle = '#444'; c.fillRect(T(bx) + 1, T(10) + 11, 8, 1); c.fillStyle = '#2a2a2a'; }
    },
    spawns: { predio: [T(5) + 8, T(8) + 12, 'down'], start: [T(5) + 8, T(8) + 12, 'down'], banco: [T(27), T(20) + 4, 'up'], bar: [T(32), T(9) + 6, 'down'] },
    props: [
      { t: 'lamppost', x: T(4), y: T(16) - 40, id: 'poste1', light: { r: 70, a: 1, oy: 6 } },
      { t: 'lamppost', x: T(20), y: T(16) - 40, light: { r: 70, a: 1, oy: 6 } },
      { t: 'lamppost', x: T(38), y: T(16) - 40, light: { r: 70, a: 1, oy: 6 } },
      { t: 'lamppost', x: T(56), y: T(16) - 40, light: { r: 70, a: 1, oy: 6 } },
      { t: 'lamppost', x: T(1) + 4, y: T(9) - 36, light: { r: 60, a: 1, oy: 6 } },
      { t: 'lamppost', x: T(46), y: T(9) - 36, light: { r: 60, a: 1, oy: 6 } },
      { t: 'trafficLight', x: T(29) - 2, y: T(10) - 34, id: 'sem1', st: { state: 'green' } },
      { t: 'trafficLight', x: T(34), y: T(17) - 40, id: 'sem2', st: { state: 'green' } },
      { t: 'fountain', x: T(29) + 8, y: T(21), id: 'fonte', act: 'fonte' },
      { t: 'bench', x: T(25) + 4, y: T(19) + 6, id: 'bancoV', act: 'bancoV' },
      { t: 'bench', x: T(36), y: T(24) + 4, id: 'bancoSenhor' },
      { t: 'bench', x: T(40), y: T(19) + 6, id: 'banco3' },
      { t: 'bench', x: T(12), y: T(24) + 4, id: 'banco4' },
      { t: 'tree', x: T(2), y: T(18) + 4, st: { seed: 1 } }, { t: 'tree', x: T(16), y: T(18) + 2, st: { seed: 2 } },
      { t: 'tree', x: T(21), y: T(23) + 4, st: { seed: 3 } }, { t: 'tree', x: T(43), y: T(23) + 2, st: { seed: 4 } },
      { t: 'tree', x: T(55), y: T(18) + 4, st: { seed: 5 }, id: 'arvorePipa' }, { t: 'tree', x: T(6), y: T(24) + 2, st: { seed: 6 } },
      { t: 'tree', x: T(60), y: T(23) + 4, st: { seed: 7 } }, { t: 'tree', x: T(46), y: T(18) + 2, st: { seed: 8, autumn: true } },
      { t: 'newsstand', x: T(47), y: T(22) + 4, id: 'banca', act: 'banca' },
      { t: 'busStop', x: T(9), y: T(16) + 2, id: 'ponto' },
      { t: 'hedge', x: T(0), y: T(27) + 4, st: { w: T(64) } },
      { t: 'bin', x: T(28) + 2, y: T(9) - 4 }, { t: 'bin', x: T(42), y: T(17) },
      { t: 'dumpster', x: T(50) + 4, y: T(2) + 2, id: 'cacamba' },
      { t: 'boxes', x: T(51), y: T(5) + 4 },
      { t: 'poster', x: T(48) + 1, y: T(8) - 20, id: 'cartaz', act: 'cartaz', wallMounted: true },
      { t: 'mailbox', x: T(9) + 2, y: T(8) - 4 },
      { t: 'carWash', x: T(37) + 4, y: T(8) - 6, id: 'carroVizinho' },
      { t: 'table2', x: T(31), y: T(8) + 4, id: 'mesaBar', st: {} }, { t: 'plasticChair', x: T(30) + 4, y: T(8) + 6 }, { t: 'plasticChair', x: T(32) + 10, y: T(8) + 6 },
      { t: 'table2', x: T(34) + 2, y: T(8) + 4 }, { t: 'plasticChair', x: T(35) + 10, y: T(8) + 6 },
      { t: 'plant', x: T(10) + 2, y: T(8) - 2 }, { t: 'plant', x: T(21) + 6, y: T(8) - 2 },
    ],
    exits: [
      { x: T(5), y: T(8) - 2, w: 16, h: 6, to: 'apto', spawn: 'porta' },
    ],
  };
})();

// ================================================================= MANSÃO VIVA
(() => {
  const g = Grid(36, 25, '#');
  g.rect(0, 0, 36, 4, 'M');
  g.rect(1, 4, 22, 11, 'W');            // salão
  g.rect(24, 4, 11, 5, 'k');            // cozinha
  g.rect(23, 6, 1, 1, 'W');
  g.rect(24, 11, 11, 10, 'c');          // quarto
  g.rect(23, 12, 1, 1, 'W');
  g.rect(12, 15, 1, 1, 'W');            // porta de volta ao apartamento
  g.rect(1, 18, 14, 5, 'g');            // garagem (oculta até o cap. 5)
  g.rect(1, 17, 14, 1, 'G');
  g.rect(6, 15, 1, 3, 'W');             // passagem para a garagem
  const full = g.rows();
  const closed = full.map((row, y) => y >= 15 ? row.split('').map((ch, x) => (x <= 15 ? '#' : ch)).join('') : row);
  MAPS.mansao = {
    name: 'A Mansão Viva', theme: 'mansao', music: 'mansao', bg: '#0a0706', playerLight: 40,
    tiles: full, tilesFn: () => G.flags.garagem ? full : closed,
    legend: {
      'M': { wall: 'mansao' }, '#': { wall: 'mansaoLow' }, 'G': { wall: 'garagem' }, 'W': { floor: 'woodDark' }, 'k': { floor: 'kitchen' }, 'c': { floor: 'carpet' }, 'g': { floor: 'cement' }, 'o': { floor: 'cement' },
    },
    spawns: { start: [T(12) + 8, T(14) + 4, 'up'], porta: [T(12) + 8, T(14) + 4, 'up'], garagem: [T(6), T(19) + 8, 'down'], sofa: [T(11), T(10), 'up'], cama: [T(30), T(16), 'left'] },
    props: [
      { t: 'bigWindow', x: T(3), y: T(1), wallMounted: true, id: 'jan1', st: { w: 56, h: 44, mode: 'avo' }, act: 'janelaMansao' },
      { t: 'bigWindow', x: T(9) + 8, y: T(1), wallMounted: true, id: 'jan2', st: { w: 56, h: 44, mode: 'avo' }, act: 'janelaMansao' },
      { t: 'bigWindow', x: T(16), y: T(1), wallMounted: true, id: 'jan3', st: { w: 56, h: 44, mode: 'avo' }, act: 'janelaMansao' },
      { t: 'rug', x: T(6), y: T(7), st: { w: 160, h: 72, c: '#6a2e33' } },
      { t: 'sofaLux', x: T(9), y: T(9), id: 'sofaLux', act: 'sofaLux' },
      { t: 'piano', x: T(17), y: T(5), id: 'piano', act: 'piano' },
      { t: 'stairs', x: T(1) + 8, y: T(4) + 4, id: 'escada', act: 'escada' },
      { t: 'arcade', x: T(20), y: T(10) + 4, id: 'arcade', act: 'arcade' },
      { t: 'plant', x: T(1) + 4, y: T(12) }, { t: 'plant', x: T(21) + 4, y: T(4) + 2 }, { t: 'plant', x: T(14), y: T(13) },
      { t: 'lamp', x: T(7), y: T(9) + 6, st: { color: '#f2d8a0' }, light: { r: 50, a: 0.9, oy: 4 } },
      { t: 'lamp', x: T(14) + 8, y: T(9) + 6, st: { color: '#f2d8a0' }, light: { r: 50, a: 0.9, oy: 4 } },
      // cozinha
      { t: 'kitchenIsland', x: T(26), y: T(6), id: 'ilha', act: 'cozinhaMansao', st: {} },
      { t: 'fridge', x: T(32), y: T(3) + 6 }, { t: 'stove', x: T(29), y: T(4) - 4 },
      // quarto
      { t: 'bed', x: T(31), y: T(12), id: 'camaLux', act: 'camaLux', st: { lux: true } },
      { t: 'tv', x: T(26), y: T(11) - 10, id: 'tvMulti', act: 'tvMulti', st: { on: true, channel: 'other' } },
      { t: 'rack', x: T(25) + 4, y: T(11) + 6 },
      { t: 'plant', x: T(24) + 2, y: T(18) },
      // porta de volta
      { t: 'spot', x: T(12), y: T(15), w: 16, h: 14, id: 'portaVolta', act: 'portaVolta' },
      { t: 'spot', x: T(4), y: T(19), w: T(9), h: T(3), id: 'garagemChao', act: 'garagemChao', hiddenUntil: 'garagem' },
      { t: 'door', x: T(12), y: T(15) - 14, wallMounted: true, st: { color: '#7a5a40' } },
      // garagem
      { t: 'workbench', x: T(2), y: T(18) + 4, id: 'bancada', hiddenUntil: 'garagem' },
      { t: 'oilDrum', x: T(12), y: T(18) + 2, hiddenUntil: 'garagem' }, { t: 'oilDrum', x: T(13), y: T(18) + 6, hiddenUntil: 'garagem' },
    ],
    exits: [
      { x: T(12), y: T(15) + 10, w: 16, h: 6, to: 'apto', spawn: 'banheiro', when: () => !G.flags.mansaoPresa },
    ],
    drawUnder(c) {
      // luz quente da janela no chão
      const mode = (World.prop('jan1') || {}).st?.mode;
      if (mode === 'avo') { c.fillStyle = 'rgba(255,230,170,.07)'; for (const wx of [T(3), T(9) + 8, T(16)]) { c.beginPath(); c.moveTo(wx, T(4)); c.lineTo(wx + 56, T(4)); c.lineTo(wx + 76, T(8)); c.lineTo(wx + 16, T(8)); c.fill(); } }
      if (mode === 'white') { c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(T(1), T(4), T(22), T(4)); }
    },
  };
})();

// ================================================================= HOSPITAL
(() => {
  const g = Grid(34, 16, '#');
  g.rect(1, 3, 32, 5, 'l');
  g.rect(20, 10, 12, 4, 'l');
  g.set(27, 8, 'l'); g.set(27, 9, 'l');
  MAPS.hospital = {
    name: 'Hospital — 23h53', theme: 'hospital', music: 'luto', bg: '#0a0c0c', dark: 0.25, darkColor: '#0a1418', playerLight: 30,
    tiles: g.rows(),
    legend: { '#': { wall: 'hospital' }, 'l': { floor: 'lino' } },
    spawns: { start: [T(3), T(5) + 8, 'right'], sala: [T(27) + 8, T(10) + 8, 'down'] },
    props: [
      { t: 'vending', x: T(5), y: T(2) - 4, id: 'maquina', act: 'maquina' },
      { t: 'waitChairs', x: T(8), y: T(3) - 2 },
      { t: 'tv', x: T(12) + 4, y: T(1), wallMounted: true, id: 'tvHosp', st: { on: true, channel: 'news' } },
      { t: 'waitChairs', x: T(15), y: T(3) - 2 },
      { t: 'counter', x: T(20), y: T(2) + 2, id: 'balcao' },
      { t: 'plate', x: T(26) + 3, y: T(8) + 2, wallMounted: true, id: 'placa', act: 'placa' },
      { t: 'plant', x: T(31), y: T(3) },
      { t: 'maca', x: T(24), y: T(11), id: 'maca', st: { body: true }, act: 'maca' },
      { t: 'spot', x: T(1), y: T(3), w: 8, h: T(5), id: 'saidaHosp', act: 'saidaHosp' },
    ],
    decorate(c) {
      for (let i = 2; i < 33; i += 4) { c.fillStyle = '#eef6f2'; c.fillRect(T(i), T(0) + 4, 24, 3); }
    },
    drawOver(c) {
      // lâmpada fluorescente piscando
      if (Math.random() < 0.02) { c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(T(14), T(3), T(6), T(5)); }
    },
  };
})();

// ================================================================= VELÓRIO
(() => {
  const g = Grid(24, 15, '#');
  g.rect(1, 2, 22, 11, '.');
  g.set(11, 13, '.'); g.set(12, 13, '.');
  MAPS.velorio = {
    name: 'Sala 4', theme: 'velorio', music: 'luto', bg: '#0c0a0a', tint: 'rgba(40,50,70,.12)',
    tiles: g.rows(),
    legend: { '#': { wall: 'velorio' }, '.': { floor: 'carpet' } },
    spawns: { start: [T(11) + 8, T(12), 'up'] },
    props: [
      { t: 'coffin', x: T(10), y: T(3), id: 'caixao', act: 'caixao', st: { open: true } },
      { t: 'flowers', x: T(8), y: T(2) + 6, st: { plastic: true } }, { t: 'flowers', x: T(14) + 4, y: T(2) + 6, st: { plastic: true } },
      { t: 'flowers', x: T(11), y: T(2) - 2 }, { t: 'flowers', x: T(6) + 4, y: T(3) + 4 }, { t: 'flowers', x: T(16) + 4, y: T(3) + 4 },
      { t: 'rowChairs', x: T(3), y: T(7) }, { t: 'rowChairs', x: T(14), y: T(7) },
      { t: 'rowChairs', x: T(3), y: T(9) + 4 }, { t: 'rowChairs', x: T(14), y: T(9) + 4 },
      { t: 'coffee', x: T(20), y: T(11), id: 'cafe', act: 'cafe' },
      { t: 'plant', x: T(1) + 4, y: T(11) }, { t: 'plant', x: T(21), y: T(2) + 4 },
      { t: 'spot', x: T(11), y: T(13), w: 32, h: 16, id: 'portaVelorio', act: 'portaVelorio' },
    ],
  };
})();

// ================================================================= CEMITÉRIO
(() => {
  const g = Grid(40, 26, 'g');
  g.rect(0, 12, 40, 2, 'p');
  g.rect(19, 0, 2, 26, 'p');
  g.rect(0, 0, 40, 1, 'X'); g.rect(0, 25, 40, 1, 'X'); g.rect(0, 0, 1, 26, 'X'); g.rect(39, 0, 1, 26, 'X');
  const props = [];
  for (let gy = 2; gy < 24; gy += 3) for (let gx = 2; gx < 38; gx += 3) {
    if (Math.abs(gx - 19.5) < 2.5 || Math.abs(gy - 12.5) < 2) continue;
    if (gx >= 25 && gx <= 29 && gy >= 16 && gy <= 20) continue;
    if (U.hash(gx, gy, 4) > .35) props.push({ t: 'grave', x: T(gx), y: T(gy), st: { cross: U.hash(gx, gy) > .6 } });
  }
  props.push({ t: 'freshGrave', x: T(26), y: T(18), id: 'cova', act: 'cova' });
  props.push({ t: 'tree', x: T(32), y: T(14) + 4, id: 'arvoreV', st: { seed: 9 }, act: 'arvoreV' });
  props.push({ t: 'tree', x: T(8), y: T(14) + 2, st: { seed: 10 } }, { t: 'tree', x: T(22), y: T(2), st: { seed: 11 } }, { t: 'tree', x: T(4), y: T(3), st: { seed: 12 } });
  props.push({ t: 'fence', x: T(1), y: T(0) + 4, st: { w: T(38) } });
  MAPS.cemiterio = {
    name: 'Cemitério', theme: 'predio', music: 'luto', bg: '#2a3a2a',
    tiles: g.rows(),
    legend: { 'g': { floor: 'grassC' }, 'p': { floor: 'path' }, 'X': { floor: 'grassC', solid: true } },
    spawns: { start: [T(19) + 8, T(24), 'up'], arvore: [T(33), T(18) + 4, 'left'], cova: [T(27) + 8, T(21) + 4, 'up'] },
    props,
  };
})();
