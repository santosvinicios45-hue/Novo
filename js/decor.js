// =====================================================================
//  decor.js — cenário refinado (estilo aconchegante, luz morna)
//  Substitui pisos, paredes e móveis do apartamento e dá sombra de contato
//  a todos os móveis do jogo.
// =====================================================================
'use strict';

// ---------------------------------------------------------------- pisos
(() => {
  const base = Tiles.draw;
  Tiles.draw = function (c, type, tx, ty) {
    const x = tx * TILE, y = ty * TILE, h = (a, b = 0) => U.hash(tx * 7 + a, ty * 13 + b, 5);
    const R = (xx, yy, w, hh, col) => { c.fillStyle = col; c.fillRect(x + xx, y + yy, w, hh); };
    if (type === 'wood') { // tábuas longas, cor de mel
      const tones = ['#b0703e', '#a8693a', '#b87843', '#a26437', '#b47440'];
      for (let i = 0; i < 4; i++) {
        const row = ty * 4 + i;
        const col = tones[(row * 7 + Math.floor((tx * 16 + row * 23) / 40)) % tones.length];
        R(0, i * 4, 16, 4, col);
        R(0, i * 4, 16, 1, U.shade(col, 10));
        R(0, i * 4 + 3, 16, 1, '#6e4324');
        const seam = (row * 23) % 40, gx = tx * 16;
        for (const sx of [seam, seam + 40]) if (sx >= gx && sx < gx + 16) R(sx - gx, i * 4, 1, 3, '#7a4a28');
        if (h(i) > .55) R((h(i, 1) * 12) | 0, i * 4 + 1 + (h(i, 2) > .5 ? 1 : 0), 3 + ((h(i, 3) * 3) | 0), 1, U.shade(col, -9));
      }
      return;
    }
    if (type === 'kitchen') {
      const light = (tx + ty) % 2 === 0;
      R(0, 0, 16, 16, light ? '#e8e0cc' : '#bdb3a0');
      R(0, 0, 16, 1, light ? '#f4eedf' : '#cbc2b0'); R(0, 15, 16, 1, light ? '#cfc6b2' : '#a39a88');
      if (h(1) > .75) R(4, 9, 3, 1, light ? '#ddd4c0' : '#b2a894');
      return;
    }
    if (type === 'bath') {
      R(0, 0, 16, 16, '#8fb4c8');
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { R(i * 8 + 1, j * 8 + 1, 6, 6, (i + j + tx + ty) % 2 ? '#9cc0d2' : '#88aec2'); R(i * 8 + 1, j * 8 + 1, 6, 1, '#b2d2e0'); }
      R(0, 0, 16, 1, '#c8dce6'); R(0, 0, 1, 16, '#c8dce6'); R(8, 0, 1, 16, '#c8dce6'); R(0, 8, 16, 1, '#c8dce6');
      return;
    }
    if (type === 'balcony') {
      R(0, 0, 16, 16, '#a8a096');
      R(0, 0, 16, 1, '#c0b8ae'); R(0, 0, 1, 16, '#c0b8ae'); R(15, 0, 1, 16, '#8a8278'); R(0, 15, 16, 1, '#8a8278');
      if (h(2) > .6) R(5, 6, 4, 1, '#9a9288');
      return;
    }
    return base.call(this, c, type, tx, ty);
  };
  // parede do apartamento: creme quente, rodapé de madeira, tomada de vez em quando
  WALLTHEMES.apto = { top: '#2a2420', face: '#e6d8bc', faceD: '#d9cab0', base: '#7a4c2c', trim: '#cbb898' };
  WALLTHEMES.quarto = { top: '#2a2420', face: '#e2d6be', faceD: '#d6c9b0', base: '#7a4c2c', trim: '#c8b696' };
  WALLTHEMES.banheiro = { top: '#2a2420', face: '#e8eef0', faceD: '#cfdbe0', base: '#9ab0ba', tiles: true };
  const wall = Tiles.wall;
  Tiles.wall = function (c, theme, tx, ty, face, fi, fh) {
    wall.call(this, c, theme, tx, ty, face, fi, fh);
    if (!face) { c.fillStyle = '#3a322c'; c.fillRect(tx * 16, ty * 16 + 15, 16, 1); return; }
    if ((theme === 'apto' || theme === 'quarto') && U.hash(tx, ty, 21) > .86) { c.fillStyle = '#f4ecdc'; c.fillRect(tx * 16 + 6, ty * 16 + 8, 4, 4); c.fillStyle = '#bfb29a'; c.fillRect(tx * 16 + 7, ty * 16 + 9, 1, 2); c.fillRect(tx * 16 + 9, ty * 16 + 9, 1, 2); }
  };
})();

// ---------------------------------------------------------------- móveis novos
const pot = (r, x, y, w = 8, col = '#b8693e') => { r(x, y, w, 6, col); r(x, y, w, 1, U.shade(col, 25)); r(x + 1, y + 5, w - 2, 1, U.shade(col, -25)); };
const leaves = (r, p, x, y, s = 1, g = ['#3e7a3a', '#55993f', '#2c5a2c']) => {
  r(x + 2 * s, y, 3 * s, 5 * s, g[1]); r(x, y + 2 * s, 3 * s, 4 * s, g[0]); r(x + 4 * s, y + 2 * s, 3 * s, 4 * s, g[0]); r(x + 1 * s, y + 4 * s, 5 * s, 3 * s, g[2]);
  p(x + 3 * s, y + 1, '#7cbf5a'); p(x + 1, y + 3 * s, '#6aae4c');
};
Object.assign(PROPS, {
  sofa(c, p, r) { // sofá de dois lugares, bege, almofadas fofas
    r(0, 5, 48, 19, '#9a7c5e'); r(2, 1, 44, 9, '#b8987a'); r(3, 1, 42, 2, '#c8aa8c');
    r(5, 10, 18, 10, '#c4a586'); r(25, 10, 18, 10, '#c0a080'); r(5, 10, 18, 2, '#d4b898'); r(25, 10, 18, 2, '#d0b494');
    r(23, 10, 2, 10, '#8e7154');
    r(0, 6, 5, 17, '#a88a6a'); r(43, 6, 5, 17, '#a88a6a'); r(0, 6, 5, 2, '#bea082'); r(43, 6, 5, 2, '#bea082');
    r(30, 15, 8, 1, '#a88a6a'); // marca de uso do lado que range
    r(2, 23, 3, 2, '#3e2c20'); r(43, 23, 3, 2, '#3e2c20');
  },
  coffeeTable(c, p, r) {
    r(0, 2, 32, 9, '#7a4a2a'); r(0, 2, 32, 2, '#9a643a'); r(1, 11, 2, 4, '#5a341c'); r(29, 11, 2, 4, '#5a341c');
    pot(r, 6, -2, 6, '#c8c0b0'); leaves(r, p, 6, -8, 1);
    r(19, 3, 8, 6, '#d8c070'); r(20, 4, 6, 1, '#f0e0a0'); r(19, 8, 8, 1, '#a88a3a');
  },
  floorLamp(c, p, r, s) {
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(7, 39, 6, 2, 0, 0, 7); c.fill();
    r(3, 37, 8, 2, '#3a2c22'); r(6, 10, 2, 28, '#4a3a2c');
    const col = s.color || '#f0d8a0';
    r(1, 0, 12, 10, col); r(2, 0, 10, 1, '#fff4d8'); r(1, 9, 12, 1, U.shade(col, -30)); r(0, 3, 1, 6, U.shade(col, -15)); r(13, 3, 1, 6, U.shade(col, -15));
    const g = c.createRadialGradient(7, 8, 0, 7, 8, 20); g.addColorStop(0, 'rgba(255,220,150,.35)'); g.addColorStop(1, 'rgba(255,220,150,0)');
    c.fillStyle = g; c.fillRect(-13, -12, 40, 40);
  },
  rugFancy(c, p, r, s) {
    const w = s.w || 72, h = s.h || 44;
    r(0, 0, w, h, '#7e3028'); r(2, 2, w - 4, h - 4, '#a8463a'); r(4, 4, w - 8, h - 8, '#7e3028'); r(6, 6, w - 12, h - 12, '#9a3e32');
    for (let i = 8; i < w - 8; i += 4) { p(i, 3, '#e8c890'); p(i + 2, h - 4, '#e8c890'); }
    for (let j = 8; j < h - 8; j += 4) { p(3, j, '#e8c890'); p(w - 4, j + 2, '#e8c890'); }
    const cx = w / 2 | 0, cy = h / 2 | 0;
    r(cx - 8, cy - 1, 16, 2, '#e0b878'); r(cx - 1, cy - 6, 2, 12, '#e0b878'); r(cx - 4, cy - 4, 8, 8, '#5a2a3a'); r(cx - 2, cy - 2, 4, 4, '#e0b878');
    for (const [qx, qy] of [[10, 9], [w - 13, 9], [10, h - 12], [w - 13, h - 12]]) { r(qx, qy, 3, 3, '#5a2a3a'); p(qx + 1, qy + 1, '#e0b878'); }
    for (let i = 0; i < w; i += 3) { p(i, -1, '#e8dcc0'); p(i + 1, h, '#e8dcc0'); }
  },
  tvStand(c, p, r) {
    r(0, 2, 44, 12, '#7a4a2a'); r(0, 2, 44, 2, '#9a643a'); r(2, 6, 12, 6, '#6a3e22'); r(30, 6, 12, 6, '#6a3e22'); r(7, 8, 2, 1, '#c8a060'); r(35, 8, 2, 1, '#c8a060');
    r(17, 5, 10, 4, '#1d1d22'); p(25, 6, '#5c5');
    r(2, 14, 2, 2, '#4a2c18'); r(40, 14, 2, 2, '#4a2c18');
    r(2, -2, 6, 3, '#e8e4dc'); r(3, -3, 3, 1, '#c8c4bc');
  },
  counter(c, p, r) { // bancada com pia, armários verdes
    r(0, 0, 48, 8, '#c8b494'); r(0, 0, 48, 2, '#e0d0b0'); r(0, 7, 48, 1, '#8a7658');
    r(0, 8, 48, 12, '#3e5a3c'); r(0, 8, 48, 1, '#2c4430');
    for (let i = 0; i < 3; i++) { r(1 + i * 16, 9, 14, 10, '#4a6a46'); r(1 + i * 16, 9, 14, 1, '#5a7c54'); r(12 + i * 16, 13, 1, 3, '#d8c890'); }
    r(18, 1, 14, 6, '#9aa4aa'); r(19, 2, 12, 4, '#78838a'); r(24, -2, 2, 4, '#c8d0d4'); r(24, -2, 5, 1, '#c8d0d4');
    pot(r, 38, -3, 6, '#d8d0c0'); leaves(r, p, 38, -9, 1);
  },
  fridge(c, p, r) {
    r(0, 0, 18, 34, '#efeadc'); r(0, 0, 18, 1, '#fffaf0'); r(16, 0, 2, 34, '#cfc8b8'); r(0, 13, 18, 1, '#b8b0a0');
    r(2, 4, 1, 7, '#a8a090'); r(2, 16, 1, 10, '#a8a090');
    r(6, 3, 4, 3, '#e8703a'); r(11, 5, 3, 3, '#4a9ad8'); r(9, 18, 4, 4, '#f2d040'); r(5, 23, 5, 3, '#fff'); r(5, 23, 5, 1, '#d33');
  },
  stove(c, p, r) {
    r(0, 0, 18, 20, '#e8e6e0'); r(0, 0, 18, 6, '#26262a'); r(2, 1, 5, 4, '#3c3c42'); r(10, 1, 5, 4, '#3c3c42'); p(4, 2, '#888'); p(12, 2, '#888');
    r(2, 8, 14, 9, '#2c2c32'); r(3, 9, 12, 7, '#3e4652'); r(4, 10, 4, 2, '#6a7a8a'); r(2, 7, 14, 1, '#bdbab2');
  },
  trash(c, p, r) { r(1, 2, 10, 12, '#3a3a40'); r(0, 0, 12, 3, '#4a4a52'); r(4, 0, 4, 1, '#6a6a72'); r(3, 5, 1, 7, '#2a2a30'); r(8, 5, 1, 7, '#2a2a30'); },
  table(c, p, r, s) {
    r(0, 0, 32, 14, '#8a5430'); r(0, 0, 32, 2, '#a86a3e'); r(0, 13, 32, 1, '#5e3418'); r(1, 14, 2, 8, '#5a341c'); r(29, 14, 2, 8, '#5a341c');
    if (s.laptop) { r(4, 3, 11, 7, '#2a2a30'); r(5, 4, 9, 4, '#4a6a8a'); r(4, 9, 11, 2, '#8a8a92'); }
    if (s.notebook) { r(17, 4, 7, 6, '#f0ead8'); r(18, 5, 5, 1, '#999'); r(18, 7, 4, 1, '#999'); }
    r(26, 5, 3, 3, '#f4f0e8'); p(29, 6, '#f4f0e8'); // caneca
    pot(r, 24, -5, 6, '#c86a3a'); leaves(r, p, 24, -11, 1);
  },
  chair(c, p, r) { r(1, 0, 10, 8, '#7a4a2a'); r(1, 0, 10, 2, '#9a643a'); r(0, 8, 12, 4, '#8a5832'); r(1, 12, 2, 6, '#5a341c'); r(9, 12, 2, 6, '#5a341c'); },
  bookshelfSmall(c, p, r) {
    r(0, 0, 14, 26, '#7a4a2a'); r(1, 1, 12, 24, '#4a2c18');
    for (let s = 0; s < 3; s++) { r(1, 8 + s * 8, 12, 1, '#7a4a2a'); for (let i = 0; i < 5; i++) r(2 + i * 2, 2 + s * 8 + (i % 2), 2, 6 - (i % 2), ['#b04a3a', '#3a6a9a', '#d8b048', '#4a8a4a', '#8a5a9a'][(i + s) % 5]); }
    pot(r, 4, -5, 6, '#d8d0c0'); leaves(r, p, 4, -11, 1);
  },
  tallPlant(c, p, r) {
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(10, 35, 8, 2, 0, 0, 7); c.fill();
    r(4, 24, 12, 11, '#e0d6c4'); r(4, 24, 12, 2, '#f0e8d8'); r(5, 34, 10, 1, '#b8ae9a');
    const g = ['#2f6a34', '#428a3e', '#56a24a'];
    for (const [x, y, w, hh, k] of [[8, 0, 4, 12, 2], [2, 4, 6, 8, 1], [12, 3, 6, 9, 1], [0, 10, 7, 6, 0], [13, 10, 7, 6, 0], [6, 8, 8, 10, 1], [5, 16, 10, 8, 0]]) { r(x, y, w, hh, g[k]); p(x + 1, y + 1, '#7cc060'); }
    r(9, 14, 2, 10, '#3a5a2a');
  },
  frame(c, p, r, s) {
    r(0, 0, 14, 12, '#6a4428'); r(1, 1, 12, 10, '#e8dcc0');
    if (s.kind === 'mountain') { r(2, 2, 10, 8, '#8ab8d8'); c.fillStyle = '#4a6a7a'; c.beginPath(); c.moveTo(2, 10); c.lineTo(6, 4); c.lineTo(9, 7); c.lineTo(12, 3); c.lineTo(12, 10); c.fill(); p(6, 4, '#fff'); p(12, 3, '#fff'); }
    else if (s.kind === 'field') { r(2, 2, 10, 4, '#b8dcf0'); r(2, 6, 10, 4, '#7aa860'); r(8, 3, 2, 2, '#f8e070'); }
    else { r(2, 2, 10, 8, '#d8a070'); r(3, 3, 4, 4, '#b04a3a'); r(7, 6, 4, 3, '#3a6a9a'); }
  },
  guitar(c, p, r) {
    r(4, 0, 2, 2, '#3a2418'); r(4, 2, 2, 11, '#6a4428'); r(3, 0, 1, 2, '#c8c0b0'); r(6, 0, 1, 2, '#c8c0b0');
    r(1, 13, 8, 6, '#c8844a'); r(0, 18, 10, 8, '#c8844a'); r(1, 13, 8, 1, '#e0a060'); r(3, 19, 4, 3, '#2a1a10'); r(1, 25, 8, 1, '#8a5428'); p(5, 24, '#2a1a10');
  },
  nightstand(c, p, r) { r(0, 4, 16, 12, '#7a4a2a'); r(0, 4, 16, 2, '#9a643a'); r(2, 8, 12, 3, '#6a3e22'); r(2, 12, 12, 3, '#6a3e22'); r(7, 9, 2, 1, '#c8a060'); r(7, 13, 2, 1, '#c8a060'); pot(r, 4, -2, 7, '#c86a3a'); leaves(r, p, 4, -9, 1); },
  bed(c, p, r) {
    r(0, 0, 34, 6, '#6a3e22'); r(0, 0, 34, 2, '#8a5432'); // cabeceira
    r(1, 5, 32, 38, '#5a341c'); r(2, 6, 30, 34, '#ece6da');
    r(6, 8, 22, 7, '#fbf8f2'); r(6, 14, 22, 1, '#d8d0c4'); // travesseiro
    r(2, 17, 30, 23, '#3e6a8e'); r(2, 17, 30, 3, '#5a88ac'); r(2, 20, 30, 1, '#2e5474'); r(2, 39, 30, 1, '#2e5474');
    r(4, 25, 10, 1, '#36607e'); r(18, 31, 12, 1, '#36607e');
  },
  desk(c, p, r) { r(0, 0, 28, 12, '#7a4a2a'); r(0, 0, 28, 2, '#9a643a'); r(1, 12, 2, 7, '#5a341c'); r(25, 12, 2, 7, '#5a341c'); r(3, 3, 8, 6, '#f0ead8'); r(4, 4, 6, 1, '#999'); r(14, 2, 9, 7, '#e8dcc0'); r(18, 2, 1, 7, '#a89a80'); },
  bathMat(c, p, r) { r(0, 0, 26, 12, '#6a6e78'); r(1, 1, 24, 10, '#7a7e88'); for (let i = 2; i < 24; i += 2) p(i, 0, '#8a8e98'); },
  sinkCab(c, p, r) { r(0, 6, 20, 14, '#e8e4dc'); r(0, 6, 20, 2, '#fbf8f2'); r(3, 8, 14, 5, '#cfdbe0'); r(9, 3, 2, 5, '#bcc4c8'); r(9, 3, 5, 1, '#bcc4c8'); r(2, 14, 7, 5, '#d8d2c8'); r(11, 14, 7, 5, '#d8d2c8'); pot(r, 15, 2, 4, '#d8d0c0'); p(16, 0, '#55993f'); p(17, 1, '#55993f'); },
  mirror(c, p, r) { r(0, 0, 18, 13, '#a88a5a'); r(1, 1, 16, 11, '#c8e0ec'); c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(3, 2, 3, 6); c.fillRect(7, 2, 1, 3); },
  showerGlass(c, p, r) {
    r(0, 0, 24, 34, 'rgba(150,200,215,.28)'); r(0, 0, 1, 34, '#d8e8ee'); r(23, 0, 1, 34, '#d8e8ee'); r(0, 33, 24, 1, '#d8e8ee');
    r(14, 2, 6, 2, '#b0b8bc'); r(17, 2, 1, 6, '#b0b8bc'); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(4, 6, 2, 18); c.fillRect(8, 10, 1, 10);
  },
  wallLamp(c, p, r) { r(2, 2, 4, 6, '#f8e0a0'); r(1, 1, 6, 1, '#3a2c22'); r(3, 8, 2, 2, '#3a2c22'); const g = c.createRadialGradient(4, 5, 0, 4, 5, 14); g.addColorStop(0, 'rgba(255,220,150,.45)'); g.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g; c.fillRect(-10, -9, 28, 28); },
  flowerPot(c, p, r) { pot(r, 3, 12, 10, '#b8693e'); leaves(r, p, 2, 2, 2); for (const [x, y] of [[3, 3], [8, 1], [11, 5], [5, 8], [10, 9], [2, 7]]) { r(x, y, 2, 2, '#f08a2a'); p(x, y, '#f8c050'); } },
  doormat(c, p, r) { r(0, 0, 18, 9, '#5a4a3a'); r(1, 1, 16, 7, '#6a5a48'); r(3, 3, 12, 1, '#7a6a56'); r(3, 5, 12, 1, '#7a6a56'); },
  laundry(c, p, r) { r(0, 2, 10, 10, '#c8a878'); r(0, 2, 10, 1, '#e0c898'); for (let i = 1; i < 10; i += 2) r(i, 3, 1, 9, '#a88858'); r(1, 0, 8, 3, '#e8e4f0'); },
});
Object.assign(PROPDEF, {
  sofa: { w: 48, h: 25, box: [0, 9, 48, 15] }, coffeeTable: { w: 32, h: 15, box: [0, 3, 32, 9] }, floorLamp: { w: 14, h: 40, box: [3, 35, 8, 4] },
  rugFancy: { w: 72, h: 44, box: null, under: true }, tvStand: { w: 44, h: 16, box: [0, 4, 44, 10] }, trash: { w: 12, h: 14, box: [0, 6, 12, 8] },
  bookshelfSmall: { w: 14, h: 26, box: [0, 16, 14, 10] }, tallPlant: { w: 20, h: 36, box: [4, 28, 12, 7] }, frame: { w: 14, h: 12, box: null },
  guitar: { w: 10, h: 26, box: [1, 20, 8, 6] }, nightstand: { w: 16, h: 16, box: [0, 6, 16, 10] }, bed: { w: 34, h: 43, box: [0, 2, 34, 41] },
  desk: { w: 28, h: 19, box: [0, 2, 28, 10] }, bathMat: { w: 26, h: 12, box: null, under: true }, sinkCab: { w: 20, h: 20, box: [0, 8, 20, 12] },
  mirror: { w: 18, h: 13, box: null }, showerGlass: { w: 24, h: 34, box: null, under: true }, wallLamp: { w: 8, h: 10, box: null },
  flowerPot: { w: 16, h: 18, box: [3, 12, 10, 6] }, doormat: { w: 18, h: 9, box: null, under: true }, laundry: { w: 10, h: 12, box: [0, 4, 10, 8] },
  table: { w: 32, h: 22, box: [0, 4, 32, 14] },
});

// ---------------------------------------------------------------- o apartamento redecorado (mesma planta, mais vida)
(() => {
  const m = MAPS.apto;
  const keep = id => m.props.find(p => p.id === id);
  m.props = [
    // cozinha
    { t: 'counter', x: T(1), y: T(2) - 8, id: 'pia', act: 'pia' },
    { t: 'fridge', x: T(4) + 2, y: T(1) + 6, id: 'geladeira', act: 'geladeira' },
    { t: 'stove', x: T(5) + 6, y: T(2) - 8, id: 'fogao', act: 'fogao' },
    { t: 'trash', x: T(6) + 10, y: T(2) - 2 },
    { t: 'table', x: T(2), y: T(6) - 2, id: 'mesa', st: { notebook: true, laptop: true }, act: 'mesa' },
    { t: 'chair', x: T(3), y: T(7) + 2, id: 'cadeira' },
    { t: 'bookshelfSmall', x: T(1) + 1, y: T(9) - 2 },
    { t: 'tallPlant', x: T(1) - 2, y: T(10) + 2, id: 'planta' },
    // sala
    { t: 'window', x: T(8), y: 6, wallMounted: true, id: 'janela', act: 'janela', st: {} },
    { t: 'frame', x: T(6) + 4, y: 8, wallMounted: true, st: { kind: 'abstract' } },
    { t: 'rugFancy', x: T(8) + 4, y: T(6) + 2, st: { w: 76, h: 46 } },
    { t: 'tvStand', x: T(9) + 2, y: T(2) + 4, id: 'rack' },
    { t: 'tv', x: T(10) - 1, y: T(1) + 6, id: 'tv', act: 'tv', st: { on: false } },
    { t: 'estante', x: T(12) + 2, y: T(1) + 2, id: 'estante', act: 'estante' },
    { t: 'coffeeTable', x: T(9) + 12, y: T(7) + 2, id: 'mesinha' },
    { t: 'sofa', x: T(9) + 2, y: T(8), id: 'sofa', act: 'sofa' },
    { t: 'floorLamp', x: T(12) + 6, y: T(7) + 8, id: 'abajur', act: 'abajur', st: { color: '#f0d8a0' }, light: { r: 56, a: 0.9, oy: 6 } },
    { t: 'broom', x: T(13) + 6, y: T(10) + 4, id: 'vassoura', act: 'vassoura' },
    { t: 'doormat', x: T(9) - 1, y: T(12) + 6 },
    { t: 'flowerPot', x: T(10) + 2, y: T(11) + 6 },
    // quarto
    { t: 'bed', x: T(18) + 2, y: T(2) - 2, id: 'cama', act: 'cama' },
    { t: 'rug', x: T(17) + 4, y: T(4) + 4, st: { w: 58, h: 34, c: '#c8b48c' } },
    { t: 'window', x: T(16) + 4, y: 6, wallMounted: true, id: 'janelaQuarto', st: { poco: true }, act: 'janelaQuarto' },
    { t: 'nightstand', x: T(16) + 6, y: T(2) - 4 },
    { t: 'frame', x: T(19), y: 8, wallMounted: true, st: { kind: 'mountain' } },
    { t: 'guitar', x: T(20) + 2, y: T(2) - 6 },
    { t: 'guitar', x: T(20) + 2, y: T(5) + 2 },
    { t: 'desk', x: T(18), y: T(6) + 2 },
    { t: 'chair', x: T(17) + 2, y: T(6) + 4, id: 'cadeiraQuarto' },
    // banheiro
    { t: 'sinkCab', x: T(15) + 6, y: T(10) - 4 },
    { t: 'mirror', x: T(15) + 7, y: T(9) + 1, wallMounted: true },
    { t: 'toilet', x: T(18) + 4, y: T(10) + 2 },
    { t: 'showerGlass', x: T(19) + 6, y: T(10) - 6 },
    { t: 'bathMat', x: T(16) + 6, y: T(12) },
    { t: 'laundry', x: T(15) + 2, y: T(12) + 2 },
    { t: 'spot', x: T(14), y: T(11) - 4, w: 16, h: 20, id: 'portaBanheiro', act: 'portaBanheiro' },
    // sacada
    { t: 'railing', x: T(0) + 8, y: T(15) + 4, st: { w: 72 } },
    { t: 'flowerPot', x: T(4) - 2, y: T(14) - 6 },
    { t: 'wallLamp', x: T(0) + 6, y: T(13) + 4, wallMounted: true, light: { r: 40, a: 0.9 } },
    { t: 'spot', x: T(1), y: T(14), w: 64, h: 20, id: 'sacadaVista', act: 'sacada' },
  ];
  // luz do sol entrando pelas janelas
  m.drawOver = c => {
    if (G.map.dark > 0.3) return;
    const k = 1 - G.map.dark * 2;
    c.save(); c.globalCompositeOperation = 'lighter';
    const beam = (x, y, w, len, a) => {
      const g = c.createLinearGradient(x, y, x + len * 0.55, y + len);
      g.addColorStop(0, `rgba(255,196,120,${a * k})`); g.addColorStop(1, 'rgba(255,196,120,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w + len * 0.55, y + len); c.lineTo(x + len * 0.55, y + len); c.closePath(); c.fill();
    };
    beam(T(8) + 2, T(2), 24, 130, 0.2);
    beam(T(16) + 10, T(2), 18, 70, 0.1);
    c.restore();
  };
  m.tint = null;
})();

// ---------------------------------------------------------------- sombra de contato sob os móveis (todos os mapas)
(() => {
  const dp = World.drawProp.bind(World);
  World.drawProp = function (p) {
    if (p.solidBox && !p.wallMounted && !p.under && p.t !== 'block' && p.t !== 'spot' && p.t !== 'tree' && p.t !== 'lamppost' && p.t !== 'floorLamp' && p.t !== 'tallPlant') {
      const b = p.solidBox;
      ctx.fillStyle = 'rgba(30,16,8,.22)';
      ctx.fillRect(Math.round(b.x) + 1, Math.round(b.y + b.h) - 1, b.w, 2);
      ctx.fillRect(Math.round(b.x + b.w) - 1, Math.round(b.y) + 2, 2, b.h - 1);
    }
    dp(p);
  };
})();
