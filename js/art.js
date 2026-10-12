// =====================================================================
//  art.js — toda a arte é desenhada por código, pixel a pixel
// =====================================================================
'use strict';

const Art = {
  cache: new Map(),
  mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; },
  get(key, w, h, fn) {
    let c = this.cache.get(key);
    if (!c) { let x;[c, x] = this.mk(w, h); fn(x, c); this.cache.set(key, c); }
    return c;
  },
  outline(c, col = '#16120f', alphaMin = 40) {
    const x = c.getContext('2d'), w = c.width, h = c.height;
    const id = x.getImageData(0, 0, w, h), d = id.data, src = new Uint8ClampedArray(d);
    const [r, g, b] = [parseInt(col.slice(1, 3), 16), parseInt(col.slice(3, 5), 16), parseInt(col.slice(5, 7), 16)];
    for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
      const k = (y * w + i) * 4;
      if (src[k + 3] > alphaMin) continue;
      const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < w && yy < h && src[(yy * w + xx) * 4 + 3] > alphaMin;
      if (n(i - 1, y) || n(i + 1, y) || n(i, y - 1) || n(i, y + 1)) { d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = 255; }
    }
    x.putImageData(id, 0, 0);
  },
  flip(src) {
    const [c, x] = this.mk(src.width, src.height);
    x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0);
    return c;
  },
};

// helpers de pixel
function PX(c) {
  return {
    p: (x, y, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, 1, 1); },
    r: (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, w | 0, h | 0); },
  };
}

// =====================================================================
//  PERSONAGENS
// =====================================================================
const PAL = {
  K: '#16120f',
  V: {
    hair: ['#252423', '#43413e', '#66625d', '#938e87'],
    skin: ['#d6a684', '#ba8a6c', '#8e624c'],
    stub: '#8c7262', brow: '#352e2a', eye: '#251c18', mouth: '#7b4c3e',
    top: ['#706a53', '#585340', '#3d392c', '#2a2720'],
    shirt: ['#56604f', '#424b41', '#2f352f'],
    pants: ['#4a5467', '#38404f', '#262c37'],
    shoes: ['#71533c', '#4c3829', '#2e221a'],
  },
};

// spec: { skin, hair:{style,c}, top:{style,c,c2}, pants:{style,c}, shoes, kind:'adult'|'child'|'old', beard, glasses, extra, pockets }
function drawHumanoid(c, s, dir, frame) {
  const { p, r } = PX(c);
  const kid = s.kind === 'child';
  const torsoH = kid ? 6 : (s.torsoH || 9), legH = kid ? 4 : (s.legH || 8);
  const total = 13 + 1 + torsoH + legH + 3;
  const ox = 1, oy = 1 + (34 - total);
  const walk = frame % 4; // 0 parado, 1 passo A, 2 parado, 3 passo B
  const bob = (walk === 1 || walk === 3) ? 1 : 0;
  const [S0, S1, S2] = s.skin;
  const [T0, T1, T2, T3] = s.top.c;
  const [P0, P1, P2] = s.pants.c;
  const [B0, B1, B2] = s.shoes;
  const hy = oy + bob;              // topo da cabeça
  const ny = hy + 13;               // pescoço
  const ty = ny + 1;                // topo do tronco
  const ly = oy + 13 + 1 + torsoH;  // topo das pernas (sem bob)
  const by = ly + legH;             // topo dos sapatos
  const X = v => ox + v;
  const side = dir === 'side';
  const slouch = s.slouch && side ? 1 : 0;

  // ---------------- pernas e sapatos
  const legs = () => {
    if (s.pants.style === 'skirt') {
      r(X(5), ly, 10, Math.max(2, legH - 3), P1); r(X(5), ly, 2, Math.max(2, legH - 3), P0); r(X(13), ly, 2, Math.max(2, legH - 3), P2);
      const sk = ly + Math.max(2, legH - 3);
      const l1 = walk === 1 ? -1 : 0, l2 = walk === 3 ? -1 : 0;
      r(X(7), sk, 2, by - sk + l1, S1); r(X(11), sk, 2, by - sk + l2, S1);
      r(X(6), by + l1, 4, 3, B1); r(X(6), by + l1, 4, 1, B0); r(X(6), by + 2 + l1, 4, 1, B2);
      r(X(10), by + l2, 4, 3, B1); r(X(10), by + l2, 4, 1, B0); r(X(10), by + 2 + l2, 4, 1, B2);
      return;
    }
    const shorts = s.pants.style === 'shorts';
    if (!side) {
      const lA = walk === 1 ? -1 : 0, lB = walk === 3 ? -1 : 0; // perna que levanta
      // perna esquerda
      const lh1 = legH + lA, lh2 = legH + lB;
      r(X(6), ly, 4, lh1, P1); r(X(6), ly, 1, lh1, P0); r(X(9), ly + 2, 1, lh1 - 2, P2);
      r(X(10), ly, 4, lh2, P1); r(X(13), ly, 1, lh2, P2); r(X(10), ly + 2, 1, lh2 - 2, P2);
      if (shorts) { r(X(6), ly + 3, 4, lh1 - 3, S1); r(X(10), ly + 3, 4, lh2 - 3, S1); r(X(6), ly + 3, 1, lh1 - 3, S0); }
      r(X(6), ly, 8, 1, P2); // cintura
      if (dir === 'down' && !shorts) { p(X(7), ly + 3, P0); p(X(12), ly + 4, P0); } // desgaste do jeans
      // sapatos
      r(X(5), by + lA, 5, 3, B1); r(X(5), by + lA, 5, 1, B0); r(X(5), by + 2 + lA, 5, 1, B2);
      r(X(10), by + lB, 5, 3, B1); r(X(10), by + lB, 5, 1, B0); r(X(10), by + 2 + lB, 5, 1, B2);
      if (dir === 'down') { p(X(6), by + 1 + lA, B0); p(X(13), by + 1 + lB, B0); }
    } else {
      // lado (direita): passada
      const stride = walk === 1 ? 2 : walk === 3 ? -2 : 0;
      const backX = 7 - stride, frontX = 7 + stride;
      // perna de trás
      r(X(backX), ly, 4, legH, P2); r(X(backX - 1), by, 5, 3, B2); r(X(backX), by, 5, 1, B1);
      // perna da frente
      r(X(frontX), ly, 4, legH, P1); r(X(frontX), ly, 1, legH, P0);
      if (shorts) { r(X(frontX), ly + 3, 4, legH - 3, S1); r(X(backX), ly + 3, 4, legH - 3, S2); }
      r(X(frontX), by, 6, 3, B1); r(X(frontX), by, 6, 1, B0); r(X(frontX), by + 2, 6, 1, B2);
      r(X(6), ly, 7, 1, P2);
    }
  };

  // ---------------- braços
  const armSwing = walk === 1 ? 1 : walk === 3 ? -1 : 0;
  const arms = (front) => {
    const st = s.top.style;
    const sleeve = st === 'tshirt' || st === 'polo' || st === 'dress' || st === 'scrubs';
    const armC = [T0, T1, T2];
    if (!side) {
      if (front !== (dir === 'down' || dir === 'up')) return;
      const pockets = s.pockets && walk % 2 === 0 && dir === 'down';
      for (const sd of [0, 1]) {
        const ax = sd === 0 ? X(3) : X(15);
        const sw = (sd === 0 ? armSwing : -armSwing);
        const len = torsoH - 1 + (pockets ? -2 : 0);
        r(ax, ty + 1, 2, len, armC[1]); r(sd === 0 ? ax : ax + 1, ty + 1, 1, len, sd === 0 ? armC[0] : armC[2]);
        if (sleeve) { r(ax, ty + 4, 2, len - 3, S1); p(sd === 0 ? ax : ax + 1, ty + 4, S2); }
        if (pockets) {
          // mão no bolso: antebraço entra no bolso
          r(sd === 0 ? X(4) : X(14), ty + len, 2, 2, armC[2]);
        } else {
          r(ax, ty + len + 1 + Math.max(0, sw), 2, 2, S1); p(sd === 0 ? ax : ax + 1, ty + len + 2 + Math.max(0, sw), S2);
        }
      }
    } else {
      // de lado: um braço atrás (desenhado antes) e um na frente
      const sw = front ? armSwing : -armSwing;
      const ax = X(9 + sw);
      const col = front ? armC[1] : armC[2];
      r(ax, ty + 1, 3, torsoH - 2, col);
      if (front) r(ax, ty + 1, 1, torsoH - 2, armC[0]);
      if (sleeve) r(ax, ty + 4, 3, torsoH - 5, front ? S1 : S2);
      if (s.pockets && walk % 2 === 0) r(ax + 1, ty + torsoH - 2, 2, 2, armC[2]);
      else r(ax + (sw > 0 ? 1 : 0), ty + torsoH - 1, 3, 2, front ? S1 : S2);
    }
  };

  // ---------------- tronco
  const torso = () => {
    const st = s.top.style;
    if (!side) {
      r(X(5), ty, 10, torsoH, T1);
      r(X(4), ty + 1, 1, 2, T1); r(X(15), ty + 1, 1, 2, T1);
      r(X(5), ty, 1, torsoH, T0); r(X(14), ty, 1, torsoH, T2);
      if (dir === 'down') {
        if (st === 'jacket') {
          // jaqueta aberta com camisa por baixo (V)
          const [C0, C1, C2] = s.top.c2;
          r(X(8), ty, 4, 3, C1); r(X(9), ty + 3, 2, torsoH - 4, C1);
          p(X(8), ty, C0); p(X(11), ty, C0); p(X(9), ty + 1, C2); p(X(10), ty + 1, C2); // gola da camisa
          r(X(8), ty + 3, 1, torsoH - 3, T2); r(X(11), ty + 3, 1, torsoH - 3, T2);
          // lapelas/gola da jaqueta
          p(X(6), ty, T0); p(X(7), ty, T0); p(X(7), ty + 1, T0); p(X(12), ty, T0); p(X(13), ty, T0); p(X(12), ty + 1, T0);
          p(X(7), ty + 2, T2); p(X(12), ty + 2, T2);
          // bolsos do peito
          r(X(6), ty + 3, 2, 1, T2); r(X(12), ty + 3, 2, 1, T2);
          // bolsos de baixo e barra
          r(X(5), ty + torsoH - 1, 10, 1, T2); p(X(6), ty + torsoH - 3, T3); p(X(13), ty + torsoH - 3, T3);
          // desgaste
          p(X(13), ty + 5, T2);
        } else if (st === 'polo' || st === 'tshirt') {
          r(X(8), ty, 4, 1, T2); if (st === 'polo') { p(X(9), ty + 1, T2); p(X(10), ty + 1, T0); p(X(9), ty + 2, T2); }
          r(X(5), ty + torsoH - 1, 10, 1, T2);
          if (s.top.print) { r(X(8), ty + 3, 4, 3, s.top.print); }
        } else if (st === 'hoodie') {
          r(X(7), ty, 6, 2, T2); p(X(8), ty + 2, T0); p(X(11), ty + 2, T0); r(X(7), ty + torsoH - 4, 6, 2, T2); r(X(5), ty + torsoH - 1, 10, 1, T2);
        } else if (st === 'blazer' || st === 'suit') {
          const sh = s.top.c2 || ['#e8e4dc', '#cfcac0', '#a9a49a'];
          r(X(8), ty, 4, 5, sh[0]); p(X(9), ty, sh[1]); p(X(10), ty, sh[1]);
          if (st === 'suit') { r(X(9), ty + 1, 2, 4, s.top.tie || '#2a2a33'); }
          r(X(8), ty, 1, torsoH - 1, T2); r(X(11), ty, 1, torsoH - 1, T2); p(X(10), ty + 7, T3); p(X(10), ty + 5, T3);
        } else if (st === 'dress') {
          r(X(7), ty, 6, 1, S1); r(X(5), ty + torsoH - 1, 10, 1, T2); p(X(10), ty + 3, T0);
        } else if (st === 'scrubs') {
          r(X(8), ty, 4, 2, S1); p(X(9), ty + 2, T2); p(X(10), ty + 2, T2); r(X(6), ty + 4, 3, 2, T2);
        } else if (st === 'apron') {
          r(X(7), ty + 1, 6, torsoH - 1, s.top.c2 ? s.top.c2[0] : '#e8e2d6'); r(X(7), ty + 1, 1, torsoH - 1, '#c9c2b4');
        }
      } else { // costas
        r(X(5), ty, 10, 1, T0);
        if (st === 'jacket') { r(X(5), ty, 10, 2, T0); r(X(9), ty + 2, 1, torsoH - 3, T2); r(X(5), ty + torsoH - 1, 10, 1, T2); p(X(7), ty + 5, T2); p(X(12), ty + 4, T0); }
        else if (st === 'hoodie') { r(X(6), ty, 8, 3, T2); r(X(7), ty, 6, 2, T0); }
        else r(X(5), ty + torsoH - 1, 10, 1, T2);
      }
    } else {
      const fx = X(6);
      r(fx, ty, 8, torsoH, T1); r(fx, ty, 1, torsoH, T2); r(fx + 7, ty, 1, torsoH, T0);
      if (st === 'jacket') {
        const [C0, C1] = s.top.c2;
        r(fx + 6, ty, 2, 4, C1); p(fx + 7, ty, C0);
        r(fx + 6, ty + 4, 1, torsoH - 4, T2); r(fx, ty + torsoH - 1, 8, 1, T2); p(fx + 6, ty, T0); p(fx + 5, ty, T0);
        p(fx + 5, ty + 3, T2); p(fx + 3, ty + torsoH - 3, T3);
      } else if (st === 'hoodie') { r(fx, ty, 4, 3, T2); r(fx, ty + torsoH - 1, 8, 1, T2); }
      else if (st === 'blazer' || st === 'suit') { r(fx + 6, ty, 2, 4, (s.top.c2 || ['#e8e4dc'])[0]); r(fx + 5, ty, 1, torsoH - 1, T2); }
      else if (st === 'apron') { r(fx + 5, ty + 1, 3, torsoH - 1, s.top.c2 ? s.top.c2[0] : '#e8e2d6'); }
      else r(fx, ty + torsoH - 1, 8, 1, T2);
      r(X(9), ny, 3, 1, S2);
    }
    if (!side) r(X(8), ny, 4, 1, S2);
  };

  // ---------------- cabeça
  const head = () => {
    const hx = slouch;
    if (s.headMap) {
      const m = s.headMap[side ? 'side' : dir === 'up' ? 'up' : 'down'];
      const [H0, H1, H2, H3] = s.hair.c;
      const col = { a: H0, b: H1, c: H2, d: H3, s: S0, m: S1, n: S2, e: s.blink ? S2 : (s.eye || '#241b17'), w: s.brow || H0, u: s.stub || S2, o: s.mouth || '#7b4c3e' };
      const ox2 = X(3 + (side ? slouch : 0));
      m.forEach((row, yy) => { for (let xx = 0; xx < row.length; xx++) { const ch = row[xx]; if (ch !== '.' && col[ch]) p(ox2 + xx, hy + yy, col[ch]); } });
      return;
    }
    const [H0, H1, H2, H3] = s.hair.c;
    const st = s.hair.style;
    if (!side) {
      const back = dir === 'up';
      // rosto
      r(X(6 + hx), hy + 4, 8, 9, S1);
      if (!back) {
        r(X(7 + hx), hy + 5, 6, 6, S0);
        r(X(13 + hx), hy + 5, 1, 7, S2);
        p(X(6 + hx), hy + 12, S2); p(X(13 + hx), hy + 12, S2);
        // orelhas
        r(X(5 + hx), hy + 8, 1, 2, S1); r(X(14 + hx), hy + 8, 1, 2, S2);
        // sobrancelhas, olhos
        const brow = s.brow || H0;
        if (s.sad) { r(X(7), hy + 7, 2, 1, brow); r(X(11), hy + 7, 2, 1, brow); p(X(6), hy + 8, S2); p(X(13), hy + 8, S2); }
        else { r(X(7), hy + 6, 2, 1, brow); r(X(11), hy + 6, 2, 1, brow); }
        if (s.blink) { r(X(7), hy + 8, 2, 1, S2); r(X(11), hy + 8, 2, 1, S2); }
        else {
          p(X(7), hy + 8, S2); p(X(8), hy + 8, s.eye || '#241b17'); p(X(11), hy + 8, s.eye || '#241b17'); p(X(12), hy + 8, S2);
          if (s.sad) { p(X(7), hy + 9, S1); p(X(8), hy + 9, S1); p(X(11), hy + 9, S1); p(X(12), hy + 9, S1); }
        }
        // nariz e boca
        p(X(10), hy + 9, S2); p(X(10), hy + 10, S2); p(X(9), hy + 10, S1);
        if (s.smile) { r(X(9), hy + 11, 2, 1, s.mouth || '#7b4c3e'); p(X(8), hy + 10, S1); p(X(11), hy + 10, S1); }
        else { r(X(9), hy + 11, 2, 1, s.mouth || '#7b4c3e'); if (s.sad) { p(X(8), hy + 12, S2); p(X(11), hy + 12, S2); } }
        // barba
        if (s.beard === 'stubble') {
          const b = s.stub || '#8c7262';
          r(X(6), hy + 10, 1, 3, b); r(X(13), hy + 10, 1, 3, b); r(X(7), hy + 11, 1, 2, b); r(X(12), hy + 11, 1, 2, b);
          r(X(8), hy + 12, 4, 1, b); p(X(8), hy + 11, b); p(X(11), hy + 11, b);
        } else if (s.beard === 'full') {
          r(X(6), hy + 10, 8, 3, H1); r(X(9), hy + 11, 2, 1, s.mouth || '#7b4c3e'); r(X(7), hy + 13, 6, 1, H1);
        } else if (s.beard === 'mustache') { r(X(8), hy + 10, 4, 1, H1); }
        if (s.glasses) { r(X(7), hy + 8, 2, 1, s.glasses); r(X(11), hy + 8, 2, 1, s.glasses); p(X(9), hy + 8, s.glasses); p(X(10), hy + 8, s.glasses); p(X(8), hy + 8, '#bcd3dd'); p(X(12), hy + 8, '#bcd3dd'); }
        if (s.blue) { // pele azul (Rayan)
        }
      }
      // cabelo
      hairFront(st, back, hx, H0, H1, H2, H3);
    } else {
      // perfil (direita)
      const fx = X(7 + slouch);
      r(fx, hy + 4, 7, 9, S1);
      r(fx + 3, hy + 5, 4, 6, S0);
      p(fx + 7, hy + 8, S1); p(fx + 7, hy + 9, S2); // nariz
      p(fx + 5, hy + 8, s.eye || '#241b17'); p(fx + 6, hy + 8, S2);
      const brow = s.brow || H0;
      r(fx + 4, hy + (s.sad ? 7 : 6), 3, 1, brow);
      p(fx + 6, hy + 11, s.mouth || '#7b4c3e'); p(fx + 5, hy + 11, S2);
      r(fx + 2, hy + 8, 1, 2, S2); // orelha
      p(fx, hy + 12, S2);
      if (s.beard === 'stubble') { const b = s.stub || '#8c7262'; r(fx + 1, hy + 10, 2, 3, b); r(fx + 3, hy + 11, 3, 2, b); p(fx + 6, hy + 12, b); p(fx + 7, hy + 10, b); }
      else if (s.beard === 'full') { r(fx + 1, hy + 10, 6, 3, H1); r(fx + 2, hy + 13, 4, 1, H1); }
      else if (s.beard === 'mustache') { r(fx + 5, hy + 10, 3, 1, H1); }
      if (s.glasses) { r(fx + 4, hy + 8, 3, 1, s.glasses); p(fx + 5, hy + 8, '#bcd3dd'); r(fx + 2, hy + 8, 2, 1, s.glasses); }
      hairSide(st, fx, H0, H1, H2, H3);
    }
  };

  const hairFront = (st, back, hx, H0, H1, H2, H3) => {
    const x0 = X(0 + hx);
    const P = (x, y, col) => p(x0 + x, hy + y, col), R = (x, y, w, h, col) => r(x0 + x, hy + y, w, h, col);
    if (st === 'v') {
      // volume bagunçado, grisalho, mechas espetadas — como na referência
      R(5, 2, 10, 5, H1); R(4, 3, 12, 4, H1); R(6, 1, 8, 1, H1);
      P(5, 1, H1); P(8, 0, H2); P(9, 0, H1); P(12, 0, H2); P(14, 1, H1); P(15, 2, H1); P(3, 4, H1); P(16, 4, H1); P(3, 5, H0); P(16, 6, H0);
      R(7, 2, 2, 1, H2); R(10, 1, 3, 1, H2); R(12, 3, 2, 1, H2); R(5, 4, 2, 1, H2); R(9, 3, 2, 1, H3);
      P(7, 1, H3); P(11, 2, H3); P(13, 2, H3); P(6, 3, H3); P(14, 4, H2); P(8, 4, H0); P(12, 5, H0);
      if (back) {
        R(5, 4, 10, 8, H1); R(4, 5, 12, 5, H1); R(6, 12, 8, 1, H1);
        P(6, 13, H1); P(9, 13, H0); P(12, 13, H1); // pontas na nuca
        R(7, 5, 2, 1, H2); R(11, 6, 3, 1, H2); R(8, 8, 1, 3, H2); R(12, 9, 1, 2, H2); P(6, 7, H3); P(10, 4, H3); P(13, 7, H3); P(9, 10, H0); P(11, 11, H0);
      } else {
        // franja caindo na testa, repartida e desarrumada
        R(5, 4, 10, 2, H1);
        P(6, 6, H1); P(7, 6, H2); P(7, 7, H1); P(8, 6, H1); P(10, 6, H0); P(11, 6, H1); P(12, 6, H2); P(13, 6, H1); P(13, 7, H1);
        P(9, 5, H3); P(12, 5, H2); P(7, 5, H2);
        // costeletas grisalhas
        R(5, 5, 1, 4, H1); R(14, 5, 1, 4, H1); P(5, 7, H2); P(14, 6, H2);
      }
    } else if (st === 'short') {
      R(6, 2, 8, 4, H1); R(5, 3, 10, 3, H1); R(7, 2, 3, 1, H2); P(11, 3, H2);
      if (back) { R(5, 4, 10, 7, H1); R(6, 11, 8, 1, H0); P(8, 6, H2); }
      else { R(6, 5, 8, 1, H1); P(6, 6, H1); P(13, 6, H1); R(5, 5, 1, 3, H1); R(14, 5, 1, 3, H1); }
    } else if (st === 'buzz') {
      R(6, 3, 8, 2, H1); R(5, 4, 10, 2, H1); if (back) R(5, 5, 10, 6, H1); else { P(5, 6, H1); P(14, 6, H1); }
    } else if (st === 'curly') {
      R(5, 1, 10, 5, H1); R(4, 2, 12, 4, H1); for (let i = 0; i < 6; i++) { P(4 + i * 2, 1 + (i % 2), H2); P(5 + i * 2, 3 + (i % 2), H0); }
      if (back) { R(4, 4, 12, 8, H1); for (let i = 0; i < 5; i++) P(5 + i * 2, 7 + (i % 2) * 2, H2); }
      else { R(4, 5, 2, 4, H1); R(14, 5, 2, 4, H1); P(7, 5, H1); P(12, 5, H1); }
    } else if (st === 'long' || st === 'ponytail') {
      R(5, 2, 10, 4, H1); R(4, 3, 12, 4, H1); R(7, 2, 4, 1, H2); P(12, 3, H2);
      if (back) { R(4, 4, 12, st === 'long' ? 13 : 8, H1); R(7, 6, 1, 8, H2); R(11, 5, 1, 9, H0); if (st === 'ponytail') R(8, 12, 4, 6, H1); }
      else {
        R(5, 5, 3, 1, H1); R(12, 5, 3, 1, H1); P(8, 5, H1);
        if (st === 'long') { R(4, 5, 2, 11, H1); R(14, 5, 2, 11, H1); P(4, 7, H2); P(15, 9, H0); }
        else { R(5, 5, 1, 3, H1); R(14, 5, 1, 3, H1); }
      }
    } else if (st === 'bun') {
      R(5, 3, 10, 3, H1); R(4, 4, 12, 3, H1); R(8, 0, 4, 3, H1); P(9, 0, H2); P(7, 3, H2);
      if (back) { R(4, 5, 12, 7, H1); R(8, 0, 4, 3, H1); } else { R(5, 6, 1, 3, H1); R(14, 6, 1, 3, H1); }
    } else if (st === 'white') {
      R(5, 4, 2, 4, H1); R(13, 4, 2, 4, H1); R(7, 3, 6, 1, H2); P(6, 3, H1); P(13, 3, H1);
      if (back) { R(5, 4, 10, 6, H1); R(7, 3, 6, 2, H2); }
    } else if (st === 'hood') {
      R(4, 1, 12, 6, H1); R(3, 3, 1, 10, H1); R(16, 3, 1, 10, H1); R(4, 2, 12, 1, H2); R(5, 1, 10, 1, H2);
      if (back) { R(4, 3, 12, 11, H1); R(6, 6, 8, 1, H0); }
      else { R(4, 5, 1, 8, H0); R(15, 5, 1, 8, H0); R(6, 5, 8, 1, H0); }
    } else if (st === 'cap') {
      R(5, 2, 10, 4, H1); R(6, 1, 8, 1, H1); P(9, 2, H2);
      if (!back) R(5, 5, 11, 1, H0); else R(5, 5, 10, 5, s.hair.under || '#3b2a22');
    }
  };
  const hairSide = (st, fx, H0, H1, H2, H3) => {
    const P = (x, y, col) => p(fx + x, hy + y, col), R = (x, y, w, h, col) => r(fx + x, hy + y, w, h, col);
    if (st === 'v') {
      R(-2, 2, 9, 6, H1); R(-1, 1, 7, 1, H1); R(-2, 8, 4, 4, H1); R(-1, 12, 3, 1, H1);
      P(0, 0, H2); P(3, 0, H1); P(6, 1, H1); P(-3, 3, H1); P(-3, 6, H0); P(-3, 9, H1); P(8, 3, H1); P(8, 4, H0);
      R(5, 4, 3, 2, H1); P(7, 6, H1); P(6, 6, H2); // franja projetada pra frente
      R(1, 2, 3, 1, H2); R(-1, 4, 2, 1, H2); P(4, 3, H3); P(0, 6, H3); P(2, 1, H3); P(-1, 9, H2); P(3, 5, H0);
      P(2, 7, H2); P(2, 6, H1); // costeleta
    } else if (st === 'short') { R(-1, 2, 8, 4, H1); R(-1, 6, 3, 5, H1); P(6, 5, H1); P(2, 2, H2); }
    else if (st === 'buzz') { R(0, 3, 7, 2, H1); R(-1, 4, 3, 6, H1); }
    else if (st === 'curly') { R(-2, 1, 9, 6, H1); R(-2, 6, 4, 6, H1); P(0, 1, H2); P(4, 2, H2); P(-1, 8, H2); P(6, 5, H1); }
    else if (st === 'long') { R(-1, 2, 8, 4, H1); R(-2, 5, 4, 12, H1); P(6, 5, H1); P(0, 9, H2); }
    else if (st === 'ponytail') { R(-1, 2, 8, 4, H1); R(-2, 5, 3, 6, H1); R(-4, 7, 3, 7, H1); }
    else if (st === 'bun') { R(-1, 3, 8, 3, H1); R(-1, 5, 3, 5, H1); R(-3, 1, 4, 4, H1); }
    else if (st === 'white') { R(0, 4, 3, 5, H1); R(1, 3, 5, 1, H2); }
    else if (st === 'hood') { R(-3, 1, 10, 5, H1); R(-3, 5, 4, 10, H1); R(5, 4, 2, 9, H0); R(-2, 0, 8, 1, H2); }
    else if (st === 'cap') { R(-1, 2, 8, 4, H1); R(5, 5, 5, 1, H0); R(-1, 6, 3, 4, s.hair.under || '#3b2a22'); }
  };

  // ordem de desenho
  if (side) arms(false);
  if (dir === 'up') { legs(); torso(); arms(true); head(); }
  else if (side) { legs(); torso(); head(); arms(true); }
  else { legs(); arms(true); torso(); if (!s.pockets || walk % 2) { } head(); }
  if (dir === 'down' && !side) { // repinta braços por cima do tronco (frente)
    arms(true);
  }
  if (s.extra) s.extra(c, dir, frame, { X, hy, ty, ly, by, p, r, side });
}

// gera e guarda sprites de um personagem: Sprites.human(spec, key) -> {down:[4], up:[4], left:[4], right:[4]}
// desenha um sprite de personagem com os pés em (x, y); sentado corta as pernas
function drawChar(c, img, x, y, sitting) {
  const fy = img.footY || 35;
  if (sitting) { const sh = Math.round(img.height * 0.72); c.drawImage(img, 0, 0, img.width, sh, Math.round(x - img.width / 2), Math.round(y - fy + 6), img.width, sh); }
  else c.drawImage(img, Math.round(x - img.width / 2), Math.round(y - fy));
}
const Sprites = {
  // o V desenhado pelo autor (assets/v_sprites.png): linhas = baixo, esquerda, direita, cima; colunas = passo A, parado, passo B
  sheet(key, img, terno) {
    const ck = 'S:' + key;
    if (Art.cache.has(ck)) return Art.cache.get(ck);
    const FW = img.width / 3, FH = img.height / 4;
    const rows = ['down', 'left', 'right', 'up'];
    const set = { down: [], up: [], left: [], right: [], blink: [] };
    const order = [1, 0, 1, 2];
    const cells = {};
    rows.forEach((d, r) => {
      cells[d] = [0, 1, 2].map(col => {
        const [c, x] = Art.mk(FW + 2, FH + 2);
        x.drawImage(img, col * FW, r * FH, FW, FH, 1, 1, FW, FH);
        if (terno) {
          const id = x.getImageData(0, 0, c.width, c.height), dd = id.data;
          for (let i = 0; i < dd.length; i += 4) {
            if (!dd[i + 3]) continue;
            const R = dd[i], Gg = dd[i + 1], B = dd[i + 2], mx = Math.max(R, Gg, B), mn = Math.min(R, Gg, B), l = (R + Gg + B) / 3;
            if (Gg >= B + 10 && R >= B + 4 && mx - mn > 16 && l < 150 && !(R > Gg + 20)) { const v = 22 + l * 0.42; dd[i] = v; dd[i + 1] = v; dd[i + 2] = v + 4; }
            else if (B > R + 8 && l < 110) { const v = 18 + l * 0.4; dd[i] = v; dd[i + 1] = v; dd[i + 2] = v + 3; }
          }
          x.putImageData(id, 0, 0);
        }
        Art.outline(c, '#120e0c');
        c.footY = FH;
        return c;
      });
    });
    for (const d of ['down', 'up']) for (const o of order) set[d].push(cells[d][o]);
    // a folha original tem o 3º quadro de cada linha lateral virado para o lado oposto;
    // monta a direita com quadros que olham para a direita e espelha para a esquerda
    const rStand = cells.right[1], rA = cells.right[0], rB = Art.flip(cells.left[0]);
    rB.footY = rA.footY;
    set.right = [rStand, rA, rStand, rB];
    set.left = set.right.map(c => { const f = Art.flip(c); f.footY = c.footY; return f; });
    set.blink.push(cells.down[1]);
    Art.cache.set(ck, set);
    return set;
  },
  human(key, spec) {
    if (spec && spec.sheet && IMG[spec.sheet]) return this.sheet(key, IMG[spec.sheet], spec.terno);
    const ck = 'H:' + key;
    if (Art.cache.has(ck)) return Art.cache.get(ck);
    const set = { down: [], up: [], left: [], right: [], blink: [] };
    for (let f = 0; f < 4; f++) {
      for (const d of ['down', 'up', 'side']) {
        const [c, x] = Art.mk(22, 36);
        drawHumanoid(x, spec, d, f);
        Art.outline(c);
        if (d === 'side') { set.right.push(c); set.left.push(Art.flip(c)); }
        else set[d].push(c);
      }
    }
    const [bc, bx] = Art.mk(22, 36);
    drawHumanoid(bx, Object.assign({}, spec, { blink: true }), 'down', 0); Art.outline(bc); set.blink.push(bc);
    Art.cache.set(ck, set);
    return set;
  },
};

// ---------------------------------------------------------------- elenco
const CAST = {
  V: {
    kind: 'adult', skin: PAL.V.skin, hair: { style: 'v', c: PAL.V.hair }, brow: PAL.V.brow, eye: PAL.V.eye, mouth: PAL.V.mouth,
    top: { style: 'jacket', c: PAL.V.top, c2: PAL.V.shirt }, pants: { c: PAL.V.pants }, shoes: PAL.V.shoes,
    beard: 'stubble', stub: PAL.V.stub, sad: true, pockets: true, slouch: true, headMap: null,
  },
  V_terno: {
    kind: 'adult', skin: PAL.V.skin, hair: { style: 'v', c: PAL.V.hair }, brow: PAL.V.brow, eye: PAL.V.eye, mouth: PAL.V.mouth,
    top: { style: 'suit', c: ['#3a3d45', '#2b2e35', '#1e2026', '#15161b'], c2: ['#e8e4dc', '#cfcac0'], tie: '#1a1a20' }, pants: { c: ['#33363e', '#26282e', '#1a1b20'] }, shoes: ['#2a2420', '#1a1512', '#100c0a'],
    beard: 'stubble', stub: PAL.V.stub, sad: true, slouch: true,
  },
  Gustavo: {
    kind: 'adult', skin: ['#e0b08c', '#c4926f', '#9a6b50'], hair: { style: 'short', c: ['#2a1d15', '#4a3326', '#6b4a36', '#8a6448'] },
    top: { style: 'polo', c: ['#d06a4a', '#b0533a', '#853c2a', '#5e2a1e'] }, pants: { c: ['#8a7d66', '#6e634f', '#524a3b'] }, shoes: ['#ececec', '#c8c8c8', '#8a8a8a'],
    beard: 'mustache', smile: true, torsoH: 10, legH: 7,
    extra: (c, d, f, o) => { // sacola de mercado
      if (d === 'down') { o.r(o.X(16), o.ty + 8, 3, 4, '#e9ecef'); o.r(o.X(16), o.ty + 8, 3, 1, '#c3c8cc'); o.p(o.X(17), o.ty + 9, '#d64545'); }
    },
  },
  Gustavo_fuma: null, // definido abaixo
  Teo: {
    kind: 'adult', skin: ['#a87656', '#8d5f42', '#6a4532'], hair: { style: 'curly', c: ['#14100e', '#231b17', '#3a2d26', '#4d3c33'] },
    top: { style: 'tshirt', c: ['#5a7da8', '#46658c', '#344c6b', '#24364d'], print: '#e9d8a6' }, pants: { c: ['#4f5560', '#3d424b', '#2c3037'] }, shoes: ['#3b3b3b', '#2a2a2a', '#1b1b1b'],
    glasses: '#1d1d1d',
  },
  Teo_terno: {
    kind: 'adult', skin: ['#a87656', '#8d5f42', '#6a4532'], hair: { style: 'curly', c: ['#14100e', '#231b17', '#3a2d26', '#4d3c33'] },
    top: { style: 'suit', c: ['#2e3138', '#23252b', '#18191e', '#111215'], tie: '#3b2330' }, pants: { c: ['#2a2c33', '#202127', '#16171b'] }, shoes: ['#2a2420', '#1a1512', '#100c0a'],
    glasses: '#1d1d1d',
  },
  Larissa: {
    kind: 'adult', skin: ['#f0c8a6', '#d8aa88', '#ae8064'], hair: { style: 'long', c: ['#4a2614', '#6d3a1f', '#93542e', '#b06d3d'] },
    top: { style: 'dress', c: ['#3a3a44', '#2c2c35', '#1f1f27', '#16161c'] }, pants: { style: 'skirt', c: ['#3a3a44', '#2c2c35', '#1f1f27'] }, shoes: ['#2a2420', '#1a1512', '#100c0a'],
  },
  MaeTeo: {
    kind: 'old', skin: ['#a87656', '#8d5f42', '#6a4532'], hair: { style: 'bun', c: ['#5e5a57', '#8a8580', '#aaa49e', '#c9c3bd'] },
    top: { style: 'blazer', c: ['#2c2c33', '#222228', '#18181d', '#101014'], c2: ['#47474f', '#3a3a40', '#2a2a30'] }, pants: { style: 'skirt', c: ['#2c2c33', '#222228', '#18181d'] }, shoes: ['#2a2420', '#1a1512', '#100c0a'],
    sad: true, glasses: '#4a4038',
  },
  MulherBoleto: {
    kind: 'adult', skin: ['#c99572', '#ad7a59', '#855a40'], hair: { style: 'ponytail', c: ['#1c1411', '#2e211b', '#4a3428', '#5f4535'] },
    top: { style: 'blazer', c: ['#7f9bb3', '#66829b', '#4f677d', '#3a4d5e'], c2: ['#f2efe9', '#dcd8d0'] }, pants: { c: ['#3b3f4a', '#2e3139', '#21232a'] }, shoes: ['#5a2a2a', '#3e1d1d', '#271212'],
    extra: (c, d, f, o) => { if (d === 'down') { o.r(o.X(15), o.ty - 4, 2, 3, '#1d1d22'); o.p(o.X(15), o.ty - 4, '#5aa0d8'); } },
  },
  Menino: {
    kind: 'child', skin: ['#e9b993', '#cf9c77', '#a7765a'], hair: { style: 'short', c: ['#3e2a1c', '#5e412c', '#7d583c', '#9a7050'] },
    top: { style: 'tshirt', c: ['#f2c94c', '#d9ad2f', '#a8841f', '#7a5f15'], print: '#3d7bd9' }, pants: { style: 'shorts', c: ['#4a6fa5', '#3a5a88', '#2b4466'] }, shoes: ['#e85d5d', '#c44444', '#8c2f2f'],
    smile: true,
  },
  MaeMenino: {
    kind: 'adult', skin: ['#e9b993', '#cf9c77', '#a7765a'], hair: { style: 'bun', c: ['#3e2a1c', '#5e412c', '#7d583c', '#9a7050'] },
    top: { style: 'tshirt', c: ['#8fc0a9', '#73a68e', '#578a72', '#3f6654'] }, pants: { c: ['#3a3f52', '#2d3141', '#202330'] }, shoes: ['#f0f0f0', '#cfcfcf', '#9a9a9a'],
  },
  SenhorPombos: {
    kind: 'old', skin: ['#e6bfa0', '#c9a083', '#a07a5f'], hair: { style: 'white', c: ['#8f8b86', '#bdb8b2', '#dcd8d2', '#f2efea'] },
    top: { style: 'blazer', c: ['#7d6b55', '#665744', '#4c4033', '#352d24'], c2: ['#d9d4c7', '#c2bcae'] }, pants: { c: ['#5c5a55', '#4a4844', '#363431'] }, shoes: ['#3a2a20', '#281d16', '#18110d'],
    sad: true, beard: 'mustache',
  },
  Rayan: {
    kind: 'adult', skin: ['#5f8fd6', '#4774bd', '#34589a'], hair: { style: 'hood', c: ['#1d2230', '#2c3347', '#3e4761', '#56607e'] },
    top: { style: 'hoodie', c: ['#3e4761', '#2c3347', '#1d2230', '#141824'] }, pants: { c: ['#2b2b2b', '#1f1f1f', '#141414'] }, shoes: ['#d9d9d9', '#b5b5b5', '#7a7a7a'],
    eye: '#f2d36b', smile: true,
  },
  Entregador: {
    kind: 'adult', skin: ['#b98462', '#9c6b4c', '#77503a'], hair: { style: 'cap', c: ['#b8312f', '#d64541', '#e86b67', '#f08f8b'], under: '#241812' },
    top: { style: 'tshirt', c: ['#e04a3f', '#c23a30', '#932b24', '#6a1f1a'] }, pants: { c: ['#33373f', '#272a31', '#1c1e23'] }, shoes: ['#2a2a2a', '#1c1c1c', '#121212'],
  },
  Vizinho: {
    kind: 'adult', skin: ['#f2c7a5', '#d9aa87', '#b0826a'], hair: { style: 'buzz', c: ['#6b5a4b', '#8a7563', '#a89280', '#c2ab98'] },
    top: { style: 'tshirt', c: ['#f0f0ee', '#d8d8d4', '#b5b5b0', '#8f8f8a'] }, pants: { style: 'shorts', c: ['#3f6aa1', '#315688', '#244066'] }, shoes: ['#3a5f8a', '#2c4a6c', '#1f3550'],
    beard: 'full',
  },
  Padeiro: {
    kind: 'adult', skin: ['#e0b08c', '#c4926f', '#9a6b50'], hair: { style: 'buzz', c: ['#222', '#3a3a3a', '#555', '#6a6a6a'] },
    top: { style: 'apron', c: ['#f4f1ea', '#dedad0', '#bdb8ac', '#9c978b'], c2: ['#f8f6f0'] }, pants: { c: ['#4a4a4a', '#3a3a3a', '#2a2a2a'] }, shoes: ['#2a2a2a', '#1c1c1c', '#121212'],
    beard: 'mustache', smile: true,
  },
  Enfermeira: {
    kind: 'adult', skin: ['#e9b993', '#cf9c77', '#a7765a'], hair: { style: 'bun', c: ['#2a1a12', '#40281c', '#5c3a28', '#734a33'] },
    top: { style: 'scrubs', c: ['#7fc4c0', '#62a8a4', '#4a8a86', '#356764'] }, pants: { c: ['#62a8a4', '#4a8a86', '#356764'] }, shoes: ['#f0f0f0', '#d0d0d0', '#a0a0a0'],
  },
  Enfermeiro: {
    kind: 'adult', skin: ['#8d5f42', '#734c34', '#583926'], hair: { style: 'buzz', c: ['#111', '#1d1d1d', '#2c2c2c', '#3a3a3a'] },
    top: { style: 'scrubs', c: ['#8aa4d6', '#6d88bd', '#536d9e', '#3d5178'] }, pants: { c: ['#6d88bd', '#536d9e', '#3d5178'] }, shoes: ['#f0f0f0', '#d0d0d0', '#a0a0a0'],
  },
  SenhoraDiag: {
    kind: 'old', skin: ['#f0cba8', '#d6ad8a', '#ad856a'], hair: { style: 'curly', c: ['#9a948f', '#c4beb8', '#ddd8d2', '#f0ece6'] },
    top: { style: 'blazer', c: ['#b48ab0', '#9a7096', '#7b5678', '#5c405a'], c2: ['#f2ead8', '#e0d6c2'] }, pants: { style: 'skirt', c: ['#5a4a5e', '#46394a', '#332a36'] }, shoes: ['#6b4a3a', '#4a3328', '#30211a'],
    glasses: '#8a6a4a', sad: true,
  },
  DonoPipoca: {
    kind: 'child', skin: ['#a87656', '#8d5f42', '#6a4532'], hair: { style: 'curly', c: ['#14100e', '#231b17', '#3a2d26', '#4d3c33'] },
    top: { style: 'tshirt', c: ['#9b6bd6', '#7f52b8', '#623d91', '#472c69'] }, pants: { style: 'shorts', c: ['#5a5a5a', '#474747', '#343434'] }, shoes: ['#f0f0f0', '#cfcfcf', '#9a9a9a'],
    sad: true,
  },
  Pedestre1: {
    kind: 'adult', skin: ['#f0c8a6', '#d8aa88', '#ae8064'], hair: { style: 'short', c: ['#c99a4a', '#e0b35f', '#f0cc7d', '#f8e0a8'] },
    top: { style: 'blazer', c: ['#4a4f5a', '#3a3e48', '#2b2e36', '#1d1f25'], c2: ['#dfe6ee', '#c4ccd6'] }, pants: { c: ['#3a3e48', '#2b2e36', '#1d1f25'] }, shoes: ['#2a2420', '#1a1512', '#100c0a'],
  },
  Pedestre2: {
    kind: 'adult', skin: ['#7a5038', '#63402c', '#4a2f20'], hair: { style: 'curly', c: ['#0f0c0b', '#1d1714', '#2e2420', '#3d302a'] },
    top: { style: 'tshirt', c: ['#e8e1cf', '#cfc7b3', '#aea68f', '#8a826c'] }, pants: { style: 'skirt', c: ['#b5533c', '#96422f', '#713222'] }, shoes: ['#d9b48a', '#b8946c', '#8a6c4c'],
  },
  Pedestre3: {
    kind: 'adult', skin: ['#d9a882', '#bd8c68', '#94684d'], hair: { style: 'buzz', c: ['#2a2a2a', '#3c3c3c', '#505050', '#646464'] },
    top: { style: 'hoodie', c: ['#4f8a5b', '#3f7049', '#2f5637', '#213d27'] }, pants: { c: ['#2f3540', '#232831', '#181c23'] }, shoes: ['#e0e0e0', '#bdbdbd', '#8a8a8a'],
  },
  Adolescente: {
    kind: 'adult', torsoH: 9, legH: 6, skin: ['#f2cdb0', '#dab093', '#b38a70'], hair: { style: 'long', c: ['#1a1412', '#2a201c', '#3e302a', '#544238'] },
    top: { style: 'tshirt', c: ['#f08fb1', '#d6739a', '#b0577b', '#863f5c'] }, pants: { c: ['#5a7bb0', '#476395', '#354b72'] }, shoes: ['#f8f8f8', '#dcdcdc', '#a8a8a8'], smile: true,
  },
  Adolescente2: {
    kind: 'adult', torsoH: 9, legH: 6, skin: ['#9c6a4a', '#82553a', '#633f2b'], hair: { style: 'ponytail', c: ['#120e0c', '#201915', '#33281f', '#463729'] },
    top: { style: 'hoodie', c: ['#e9e4d8', '#d0cabb', '#aea796', '#8a8473'] }, pants: { c: ['#3a3a3a', '#2c2c2c', '#1e1e1e'] }, shoes: ['#f8f8f8', '#dcdcdc', '#a8a8a8'], smile: true,
  },
  Zeca: { // dono do bar
    kind: 'adult', skin: ['#d9a882', '#bd8c68', '#94684d'], hair: { style: 'white', c: ['#555', '#6e6e6e', '#8a8a8a', '#a0a0a0'] },
    top: { style: 'tshirt', c: ['#f2f2f0', '#dcdcd8', '#bcbcb6', '#9a9a94'] }, pants: { c: ['#3d3d3d', '#2e2e2e', '#202020'] }, shoes: ['#2a2a2a', '#1c1c1c', '#121212'],
    beard: 'full', smile: true, torsoH: 11,
  },
  Convidado1: {
    kind: 'adult', skin: ['#e0b08c', '#c4926f', '#9a6b50'], hair: { style: 'short', c: ['#3a3a3a', '#555', '#707070', '#8a8a8a'] },
    top: { style: 'suit', c: ['#2a2a30', '#202025', '#16161a', '#0f0f12'] }, pants: { c: ['#202025', '#16161a', '#0f0f12'] }, shoes: ['#1a1512', '#100c0a', '#080605'], sad: true,
  },
  Convidado2: {
    kind: 'adult', skin: ['#8d5f42', '#734c34', '#583926'], hair: { style: 'bun', c: ['#111', '#1d1d1d', '#2c2c2c', '#3a3a3a'] },
    top: { style: 'dress', c: ['#2a2a30', '#202025', '#16161a', '#0f0f12'] }, pants: { style: 'skirt', c: ['#202025', '#16161a', '#0f0f12'] }, shoes: ['#1a1512', '#100c0a', '#080605'], sad: true,
  },
  Convidado3: {
    kind: 'old', skin: ['#f0cba8', '#d6ad8a', '#ad856a'], hair: { style: 'white', c: ['#8f8b86', '#bdb8b2', '#dcd8d2', '#f2efea'] },
    top: { style: 'blazer', c: ['#3a3a40', '#2c2c32', '#202025', '#16161a'], c2: ['#d9d4c7', '#c2bcae'] }, pants: { c: ['#2c2c32', '#202025', '#16161a'] }, shoes: ['#1a1512', '#100c0a', '#080605'], sad: true,
  },
};
// cabeça do V desenhada pixel a pixel (cabelo grisalho bagunçado, olhar cansado, barba por fazer)
const V_HEAD = {
  down: [
    '...b..cb.b....',
    '..bcb.bcbcb...',
    '.bccbbdcbbcbb.',
    'bcdcbcddcbdcbb',
    'bbcbbcbccbbcab',
    '.bbbsbcsssbbb.',
    '.bbmwwsswwnba.',
    '.bmmnessennn..',
    '..mmmmsnmmnn..',
    '...ussmnssu...',
    '...uunoonuu...',
    '....uuuuuu....',
    '.....nnnn.....',
  ],
  up: [
    '...b..cb.b....',
    '..bcbbbcbcb...',
    '.bccbbdcbbcbb.',
    'bcdcbcddcbdcbb',
    'bbcbbcbccbbcab',
    'bbcbbbcbbbcbbb',
    '.bbcbcbbcbbba.',
    '.mbbcbbbbcbbn.',
    '.mbcbbbcbbbbn.',
    '..bbabbbbabb..',
    '..bcbbcbbbb...',
    '...b.bb.bb....',
    '.....nnnn.....',
  ],
  side: [
    '...b.cb.b.....',
    '..bcbbcbcb....',
    '.bccbdcbbcbb..',
    'bcdcbccdcbccb.',
    'bbcbbcbcbbcbbb',
    '.bbcbbbbsbbcb.',
    '.bbbcbmswwsb..',
    '..bbbmmssess..',
    '..bbcnmssmssm.',
    '...bbumssssn..',
    '....buumssou..',
    '.....uuuuuu...',
    '......nnn.....',
  ],
};
CAST.V.headMap = V_HEAD; CAST.V_terno.headMap = V_HEAD;
CAST.V.sheet = 'vsheet'; CAST.V_terno.sheet = 'vsheet'; CAST.V_terno.terno = true;
CAST.Gustavo_fuma = Object.assign({}, CAST.Gustavo, {
  smile: false, extra: (c, d, f, o) => {
    if (d === 'down') { o.r(o.X(15), o.ty + 4, 1, 1, '#f2efe8'); o.p(o.X(15), o.ty + 3, '#ff7a3a'); }
    else if (o.side) { o.r(o.X(14), o.ty - 2, 2, 1, '#f2efe8'); o.p(o.X(16), o.ty - 2, '#ff7a3a'); }
  },
});
CAST.Gustavo_luto = Object.assign({}, CAST.Gustavo, { smile: false, sad: true, extra: null, top: { style: 'suit', c: ['#2e2e35', '#222228', '#18181d', '#101014'], tie: '#222' }, pants: { c: ['#222228', '#18181d', '#101014'] }, shoes: ['#1a1512', '#100c0a', '#080605'] });
CAST.Larissa_casual = Object.assign({}, CAST.Larissa, { top: { style: 'tshirt', c: ['#e9a07a', '#d0855f', '#a8674a', '#7d4c36'] }, pants: { c: ['#4a5a78', '#3a4862', '#2b364a'] } });
CAST.Gustavo_casa = Object.assign({}, CAST.Gustavo, { extra: null });

// =====================================================================
//  ANIMAIS, VEÍCULOS
// =====================================================================
const Beasts = {
  pigeon(frame, flying, col = 0) {
    const key = 'pg' + frame + (flying ? 'f' : '') + col;
    return Art.get(key, 12, 10, (c, cv) => {
      const { p, r } = PX(c);
      const body = ['#8c93a0', '#a3a39a', '#6e6a66'][col], dark = ['#5d6370', '#7a7a70', '#4a4643'][col], neck = '#5f9e8a';
      if (!flying) {
        const peck = frame % 4 === 2;
        r(3, 4, 6, 3, body); r(2, 5, 2, 1, dark); r(6, 4, 3, 1, U.shade(body, 15));
        if (peck) { r(8, 5, 2, 2, neck); p(10, 6, '#c9a27a'); p(9, 5, '#d24'); }
        else { r(8, 2, 2, 3, neck); p(9, 2, '#e8e0d0'); p(10, 3, '#c9a27a'); }
        p(5, 7, '#c25a5a'); p(7, 7, '#c25a5a');
      } else {
        const up = frame % 2 === 0;
        r(3, 4, 6, 2, body); r(8, 3, 2, 2, neck); p(10, 4, '#c9a27a');
        if (up) { r(2, 1, 3, 3, dark); r(5, 0, 3, 4, body); } else { r(2, 6, 3, 2, dark); r(5, 6, 3, 3, body); }
        r(1, 4, 2, 1, dark);
      }
      Art.outline(cv, '#1f1b19');
    });
  },
  dog(frame, sit) { // Pipoca: vira-lata caramelo
    const key = 'dog' + frame + (sit ? 's' : '');
    return Art.get(key, 22, 16, (c, cv) => {
      const { p, r } = PX(c);
      const B = '#c98a4a', L = '#e0a868', D = '#9a6634', W = '#f2e6d0';
      if (sit) {
        r(6, 6, 7, 7, B); r(7, 7, 3, 5, W); r(5, 11, 9, 3, B); r(11, 2, 6, 6, B); r(16, 4, 3, 3, L); p(18, 5, '#2a1a12');
        r(11, 1, 2, 3, D); p(14, 4, '#1a1210'); r(3, 10, 3, 2, B); p(2, 9, B);
      } else {
        const st = frame % 4;
        r(4, 5, 11, 5, B); r(5, 5, 9, 1, L); r(6, 8, 6, 2, W);
        r(14, 2, 6, 6, B); r(18, 4, 3, 3, L); p(20, 5, '#2a1a12'); r(14, 1, 2, 3, D); p(17, 4, '#1a1210');
        const l = [[0, 0], [1, -1], [0, 0], [-1, 1]][st];
        r(5 + l[0], 10, 2, 4, D); r(8 - l[0], 10, 2, 4, B); r(11 + l[1], 10, 2, 4, D); r(13 - l[1], 10, 2, 4, B);
        const tw = st % 2 ? 1 : 0; r(1, 3 + tw, 4, 2, B); p(0, 2 + tw * 2, L);
      }
      Art.outline(cv, '#1f1610');
    });
  },
  van(lights, wiper, frame = 0, cold = false) {
    const key = 'van' + (lights ? 1 : 0) + wiper + (cold ? 'c' : '');
    return Art.get(key, 66, 40, (c, cv) => {
      const { p, r } = PX(c);
      const body = cold ? '#9eb3ad' : '#a9d6c8', bodyL = cold ? '#b9c9c4' : '#c6e8dc', bodyD = cold ? '#7a8c87' : '#7fb3a4';
      const cream = cold ? '#d6d2c6' : '#f1e8cf', creamD = '#cfc4a6';
      // sombra
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(4, 35, 58, 3);
      // corpo
      r(3, 8, 60, 22, body); r(3, 8, 60, 2, bodyL); r(3, 26, 60, 4, bodyD);
      r(6, 3, 46, 7, cream); r(8, 2, 42, 1, cream); r(6, 3, 46, 1, '#fff8e6');
      // frente arredondada (direita)
      r(52, 5, 9, 6, body); r(55, 4, 5, 2, bodyL); r(60, 9, 3, 18, bodyD);
      // faixa creme
      r(3, 17, 60, 4, cream); r(3, 20, 60, 1, creamD);
      // janelas
      for (let i = 0; i < 3; i++) { r(8 + i * 13, 10, 11, 6, '#2b3a44'); r(9 + i * 13, 11, 4, 2, '#5d7a88'); }
      r(48, 10, 10, 6, '#2b3a44'); r(52, 11, 4, 2, '#6d8c9a');
      // para-brisa e limpador
      const wx = wiper % 2 ? 55 : 51;
      r(wx, 14, 5, 1, '#1a1a1a');
      // porta lateral com amassadinho
      r(30, 10, 1, 19, bodyD); r(40, 10, 1, 19, bodyD); p(34, 24, bodyD); p(35, 24, bodyD); p(35, 25, bodyL);
      r(37, 19, 2, 1, '#555');
      // flores pintadas (nunca vistas)
      const flower = (x, y, a, b) => { p(x, y, '#fff2b0'); p(x - 1, y, a); p(x + 1, y, a); p(x, y - 1, a); p(x, y + 1, a); p(x - 1, y - 1, b); p(x + 1, y + 1, b); };
      flower(8, 23, '#f08a5d', '#e85a8a'); flower(14, 25, '#f5c542', '#f08a5d'); flower(22, 22, '#e85a8a', '#9d6be0');
      flower(45, 24, '#f08a5d', '#f5c542'); flower(52, 22, '#9d6be0', '#e85a8a'); flower(27, 25, '#f5c542', '#e85a8a');
      r(17, 23, 1, 3, '#5aa06a'); r(48, 24, 1, 3, '#5aa06a'); p(18, 24, '#5aa06a');
      // farol e para-choque
      r(60, 20, 3, 4, lights ? '#fff6c2' : '#9a9a8a'); r(59, 27, 5, 2, '#c8c8c8'); r(0, 27, 5, 2, '#c8c8c8');
      r(1, 18, 2, 3, '#d65a4a');
      // rodas
      for (const wx2 of [12, 48]) { r(wx2 - 1, 28, 10, 8, '#1b1b1d'); r(wx2 + 1, 30, 6, 4, '#8e8e94'); p(wx2 + 3, 31, '#d8d8dc'); p(wx2 + 4, 32, '#5a5a60'); }
      // espelho
      r(58, 12, 2, 3, '#333');
      Art.outline(cv, '#15110e');
      if (lights) { // brilho
        c.fillStyle = 'rgba(255,246,190,.35)'; c.fillRect(63, 19, 3, 6);
      }
    });
  },
  car(color, frame = 0, dir = 1) {
    const key = 'car' + color + dir;
    return Art.get(key, 40, 24, (c, cv) => {
      const { p, r } = PX(c);
      const L = U.shade(color, 35), D = U.shade(color, -40);
      c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(3, 19, 34, 3);
      r(2, 9, 36, 9, color); r(2, 9, 36, 1, L); r(2, 16, 36, 2, D);
      r(9, 3, 20, 7, color); r(10, 2, 18, 1, L);
      r(11, 4, 7, 5, '#2a3540'); r(20, 4, 7, 5, '#2a3540'); r(12, 5, 3, 1, '#6a8090'); r(21, 5, 3, 1, '#6a8090');
      r(19, 4, 1, 12, D);
      r(36, 11, 2, 2, '#fff1b0'); r(2, 11, 2, 2, '#d04040');
      for (const wx of [6, 27]) { r(wx, 15, 7, 6, '#161616'); r(wx + 2, 17, 3, 2, '#9a9a9a'); }
      Art.outline(cv, '#121010');
      if (dir < 0) { const f = Art.flip(cv); c.clearRect(0, 0, 40, 24); c.drawImage(f, 0, 0); }
    });
  },
  moto(frame) {
    return Art.get('moto' + (frame % 2), 26, 20, (c, cv) => {
      const { p, r } = PX(c);
      r(3, 12, 7, 7, '#151515'); r(17, 12, 7, 7, '#151515'); r(5, 14, 3, 3, '#888'); r(19, 14, 3, 3, '#888');
      r(8, 10, 12, 4, '#c23a30'); r(6, 9, 6, 2, '#222'); r(17, 6, 2, 6, '#555'); r(15, 5, 6, 1, '#333');
      r(2, 3, 9, 7, '#d64541'); r(3, 4, 7, 1, '#f08f8b'); r(4, 6, 5, 2, '#fff'); // baú de entrega
      Art.outline(cv);
    });
  },
};

// =====================================================================
//  CHÃO E PAREDES (tiles)
// =====================================================================
const Tiles = {
  draw(c, type, tx, ty, ctxInfo) {
    const x = tx * TILE, y = ty * TILE, h = (a, b = 0) => U.hash(tx * 7 + a, ty * 13 + b, 3);
    const R = (xx, yy, w, hh, col) => { c.fillStyle = col; c.fillRect(x + xx, y + yy, w, hh); };
    switch (type) {
      case 'wood': { // tacos de madeira
        const base = ['#8a6243', '#83603f', '#90694a'];
        for (let i = 0; i < 4; i++) {
          const col = base[(tx + ty * 3 + i) % 3];
          R(0, i * 4, 16, 4, col); R(0, i * 4 + 3, 16, 1, '#6b4a31');
          const off = ((ty * 4 + i) * 7 + tx * 16) % 16; R(off, i * 4, 1, 3, '#6b4a31');
          if (h(i) > .7) R((h(i, 1) * 14) | 0, i * 4 + 1, 2, 1, '#9c7654');
        }
        break;
      }
      case 'woodDark': {
        for (let i = 0; i < 2; i++) {
          const col = ['#4a3426', '#523a2b', '#46301f'][(tx + ty + i) % 3];
          R(0, i * 8, 16, 8, col); R(0, i * 8 + 7, 16, 1, '#2e2016'); R(((tx * 5 + i * 9 + ty * 3) % 16), i * 8, 1, 7, '#2e2016');
          R(2, i * 8 + 2, 5, 1, U.shade(col, 10));
        }
        break;
      }
      case 'kitchen': { // piso de cozinha xadrez desbotado
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
          R(i * 8, j * 8, 8, 8, (i + j) % 2 ? '#c9c2b0' : '#a8a08e'); R(i * 8, j * 8, 8, 1, 'rgba(255,255,255,.08)');
        }
        if (h(0) > .8) R(5, 9, 3, 1, '#968e7c');
        break;
      }
      case 'bath': {
        R(0, 0, 16, 16, '#b8c8cc'); R(0, 7, 16, 1, '#9aaeb3'); R(0, 15, 16, 1, '#9aaeb3'); R(7, 0, 1, 8, '#9aaeb3'); R(15, 8, 1, 8, '#9aaeb3');
        break;
      }
      case 'cement': {
        R(0, 0, 16, 16, '#6e6b66'); if (h(1) > .5) R((h(2) * 12) | 0, (h(3) * 12) | 0, 3, 2, '#64615c'); if (h(4) > .85) R(3, 10, 6, 1, '#4f4b45');
        if (h(5) > .9) { c.fillStyle = 'rgba(20,18,15,.35)'; c.beginPath(); c.ellipse(x + 8, y + 9, 5, 3, 0, 0, 7); c.fill(); } // mancha de óleo
        break;
      }
      case 'carpet': R(0, 0, 16, 16, '#5a2e33'); if ((tx + ty) % 2) R(6, 6, 4, 4, '#6b3a40'); R(0, 0, 16, 1, '#4a252a'); break;
      case 'lino': { // linóleo hospital
        R(0, 0, 16, 16, '#c8cfc9'); R(0, 0, 16, 1, '#b4bcb6'); R(0, 0, 1, 16, '#b4bcb6'); if (h(2) > .7) R(4, 6, 2, 2, '#d6dcd6'); break;
      }
      case 'sidewalk': {
        R(0, 0, 16, 16, '#9c9890'); R(0, 0, 16, 1, '#86827a'); R(0, 0, 1, 16, '#86827a');
        if (h(1) > .6) R((h(2) * 13) | 0, (h(3) * 13) | 0, 2, 1, '#aaa69e'); if (h(4) > .92) R(3, 5, 7, 1, '#7a766e');
        break;
      }
      case 'portuguese': { // pedra portuguesa ondulada da praça
        R(0, 0, 16, 16, '#e3ddd0');
        for (let i = 0; i < 16; i += 2) { const yy = (Math.sin((tx * 16 + i) / 9) * 4 + 8 + ty * 0) | 0; R(i, (yy + ty * 5) % 16, 2, 3, '#3a3a3c'); }
        for (let i = 0; i < 6; i++) R((h(i) * 15) | 0, (h(i, 3) * 15) | 0, 1, 1, '#c9c2b2');
        break;
      }
      case 'asphalt': {
        R(0, 0, 16, 16, '#3c3d42'); for (let i = 0; i < 5; i++) R((h(i) * 15) | 0, (h(i, 5) * 15) | 0, 1, 1, h(i, 9) > .5 ? '#46474d' : '#333439');
        if (h(8) > .93) R(2, 7, 6, 1, '#2c2d31');
        break;
      }
      case 'laneDash': Tiles.draw(c, 'asphalt', tx, ty); R(0, 7, 8, 2, '#d8d2b8'); break;
      case 'laneYellow': Tiles.draw(c, 'asphalt', tx, ty); R(0, 6, 16, 1, '#e0b83a'); R(0, 9, 16, 1, '#e0b83a'); break;
      case 'zebra': Tiles.draw(c, 'asphalt', tx, ty); R(1, 0, 14, 16, '#e8e4da'); R(1, 0, 14, 1, '#d0ccc0'); R(1, 15, 14, 1, '#3c3d42'); break;
      case 'curb': R(0, 0, 16, 16, '#9c9890'); R(0, 12, 16, 4, '#bcb8ae'); R(0, 15, 16, 1, '#6d6a63'); break;
      case 'curbTop': Tiles.draw(c, 'asphalt', tx, ty); R(0, 0, 16, 3, '#bcb8ae'); R(0, 3, 16, 1, '#6d6a63'); break;
      case 'grass': case 'grassC': {
        const base = type === 'grassC' ? '#5c7a4a' : '#5e8a48';
        R(0, 0, 16, 16, base);
        for (let i = 0; i < 9; i++) { const xx = (h(i) * 15) | 0, yy = (h(i, 2) * 14) | 0; R(xx, yy, 1, 2, h(i, 7) > .5 ? U.shade(base, 18) : U.shade(base, -14)); }
        if (h(20) > .9) { R(5, 6, 1, 1, '#f2e27a'); R(4, 6, 1, 1, '#fff'); R(6, 6, 1, 1, '#fff'); R(5, 5, 1, 1, '#fff'); R(5, 7, 1, 1, '#fff'); }
        else if (h(21) > .92) { R(10, 9, 1, 1, '#e86a8a'); }
        break;
      }
      case 'dirt': R(0, 0, 16, 16, '#7a5c42'); for (let i = 0; i < 4; i++) R((h(i) * 14) | 0, (h(i, 4) * 14) | 0, 2, 1, '#6a4e38'); break;
      case 'path': R(0, 0, 16, 16, '#b3a58a'); for (let i = 0; i < 5; i++) R((h(i) * 14) | 0, (h(i, 4) * 14) | 0, 2, 2, h(i, 6) > .5 ? '#a0927a' : '#c4b79e'); break;
      case 'void': R(0, 0, 16, 16, '#000'); break;
      case 'white': R(0, 0, 16, 16, '#f4f2ee'); break;
      case 'balcony': R(0, 0, 16, 16, '#a39486'); R(0, 0, 16, 1, '#8a7c70'); R(7, 0, 1, 16, '#8a7c70'); break;
      default: R(0, 0, 16, 16, '#f0f'); break;
    }
  },
  // parede: topo (quando há parede abaixo) ou face (quando há chão abaixo)
  wall(c, theme, tx, ty, face, faceIndex, faceH) {
    const x = tx * TILE, y = ty * TILE;
    const R = (xx, yy, w, h, col) => { c.fillStyle = col; c.fillRect(x + xx, y + yy, w, h); };
    const th = WALLTHEMES[theme] || WALLTHEMES.apto;
    if (!face) { R(0, 0, 16, 16, th.top); R(0, 0, 16, 1, U.shade(th.top, 12)); return; }
    // face: faceIndex 0 = mais alto, faceH-1 = linha do chão
    R(0, 0, 16, 16, th.face);
    if (th.stripe) for (let i = 0; i < 16; i += th.stripe) R(i, 0, 1, 16, th.faceD);
    if (th.tiles) { for (let j = 0; j < 16; j += 4) R(0, j, 16, 1, th.faceD); for (let i = (ty % 2) * 4; i < 16; i += 8) R(i, 0, 1, 16, th.faceD); }
    if (th.panel && faceIndex === faceH - 1) { R(0, 2, 16, 1, th.faceD); R(0, 3, 16, 13, th.panel); R(3, 5, 10, 8, U.shade(th.panel, -10)); }
    if (faceIndex === 0) { R(0, 0, 16, 2, th.trim || U.shade(th.face, -25)); }
    if (faceIndex === faceH - 1) { R(0, 13, 16, 3, th.base); R(0, 13, 16, 1, U.shade(th.base, 20)); }
    if (U.hash(tx, ty, 9) > .9 && th.stain) R(4, 6, 3, 4, th.stain);
  },
};
const WALLTHEMES = {
  apto: { top: '#2f2a27', face: '#cfc3ad', faceD: '#c2b59d', base: '#6b5643', stain: 'rgba(120,100,70,.18)', stripe: 0 },
  quarto: { top: '#2f2a27', face: '#a9b4ad', faceD: '#9aa59e', base: '#5d4a3a', stripe: 4 },
  banheiro: { top: '#2f2a27', face: '#d8e2e4', faceD: '#b9c7ca', base: '#8a9aa0', tiles: true },
  mansao: { top: '#1f1612', face: '#5a3e2e', faceD: '#4a3224', base: '#2e1f16', panel: '#4a3224', trim: '#7a5a3a' },
  garagem: { top: '#262422', face: '#8a8780', faceD: '#7a776f', base: '#4a4842', tiles: false, stain: 'rgba(40,30,20,.25)' },
  hospital: { top: '#3a3f42', face: '#dfe6e3', faceD: '#cdd6d2', base: '#7a9a94', panel: '#b9d0ca' },
  velorio: { top: '#2a2522', face: '#d9cfc0', faceD: '#cbbfae', base: '#5a4636', stripe: 6 },
  predio: { top: '#3a3633', face: '#bdb3a4', faceD: '#aea493', base: '#6e665a' },
};

// =====================================================================
//  OBJETOS DE CENÁRIO (props)
// =====================================================================
// cada prop: {w,h (px do sprite), draw(c,state)}. Origem: canto sup. esq. do sprite.
const PropArt = {
  draw(c, type, st, t) {
    const { p, r } = PX(c);
    const fn = PROPS[type];
    if (fn) fn(c, p, r, st || {}, t || 0);
  },
};
const PROPS = {
  sofa(c, p, r, s) { // sofá de dois lugares usado, rangendo do lado direito
    r(0, 6, 40, 16, '#6b5a4a'); r(0, 4, 40, 6, '#7d6a58'); r(2, 2, 36, 5, '#86735f');
    r(3, 10, 16, 8, '#8e7a66'); r(21, 10, 16, 8, '#8a7662'); r(3, 10, 16, 1, '#a08a74'); r(21, 10, 16, 1, '#9c866f');
    r(0, 6, 4, 16, '#5d4d3f'); r(36, 6, 4, 16, '#5d4d3f'); r(25, 14, 6, 1, '#6d5c4b'); // marca de uso
    r(2, 22, 3, 2, '#2e2620'); r(35, 22, 3, 2, '#2e2620');
  },
  sofaLux(c, p, r) { // o sofá mais confortável de todos os universos
    r(0, 4, 56, 20, '#3d5a6e'); r(2, 0, 52, 8, '#4a6d84'); r(0, 4, 6, 20, '#34505f'); r(50, 4, 6, 20, '#34505f');
    for (let i = 0; i < 3; i++) { r(7 + i * 14, 10, 13, 10, '#5583a0'); r(7 + i * 14, 10, 13, 2, '#6a99b8'); }
    r(4, 2, 48, 1, '#6a99b8'); r(10, 4, 8, 6, '#c9a0a0'); r(38, 4, 8, 6, '#d8c48a');
  },
  tv(c, p, r, s, t) {
    r(0, 0, 30, 18, '#18181a'); r(2, 2, 26, 13, s.on ? '#2a3a4a' : '#222428');
    if (s.on) {
      if (s.channel === 'news') { r(2, 2, 26, 13, '#2a4a7a'); r(4, 10, 22, 3, '#c33'); r(5, 11, 12, 1, '#fff'); r(18, 4, 7, 5, '#d9b38c'); r(19, 3, 5, 2, '#333'); }
      else if (s.channel === 'cartoon') { r(2, 2, 26, 13, '#7ac7e0'); r(2, 11, 26, 4, '#6ab04a'); r(8 + ((t * 8) % 10 | 0), 6, 9, 5, '#a9d6c8'); r(9 + ((t * 8) % 10 | 0), 9, 2, 2, '#222'); r(14 + ((t * 8) % 10 | 0), 9, 2, 2, '#222'); }
      else if (s.channel === 'static') { for (let i = 0; i < 40; i++) r(2 + Math.random() * 25, 2 + Math.random() * 12, 1, 1, Math.random() > .5 ? '#ddd' : '#555'); }
      else if (s.channel === 'other') { r(2, 2, 26, 13, '#1d2a22'); r(4, 4, 8, 8, '#4a6a52'); r(14, 5, 12, 1, '#8ab89a'); r(14, 8, 9, 1, '#8ab89a'); r(14, 11, 11, 1, '#8ab89a'); }
      else if (s.channel === 'game') { r(2, 2, 26, 13, '#101830'); r(6 + Math.sin(t * 3) * 5, 9, 3, 3, '#5ee'); r(18, 5 + Math.cos(t * 4) * 3, 3, 3, '#e5e'); }
      c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(2, 2, 26, 3);
    } else { r(4, 3, 6, 1, '#333740'); }
    r(12, 18, 6, 2, '#222'); r(8, 20, 14, 1, '#333');
  },
  rack(c, p, r) { r(0, 0, 36, 10, '#5a4030'); r(0, 0, 36, 2, '#6d5040'); r(3, 4, 10, 4, '#2a2a2a'); r(15, 4, 3, 4, '#3a3a3a'); r(20, 5, 7, 3, '#1d1d22'); p(25, 6, '#3c3'); },
  estante(c, p, r) { // mais videogame do que livro
    r(0, 0, 28, 34, '#6a4a34'); r(2, 2, 24, 30, '#3d2a1e');
    for (let sh = 0; sh < 4; sh++) {
      const y = 2 + sh * 8; r(2, y + 7, 24, 1, '#6a4a34');
      let x = 3;
      while (x < 25) {
        const game = U.hash(x, sh, 5) > .3;
        const w = game ? 2 : 1 + (U.hash(x, sh) * 2 | 0);
        r(x, y + (game ? 1 : 2), w, game ? 6 : 5, game ? ['#2a4a8a', '#b03030', '#2a7a3a', '#1d1d1d', '#d0a020'][(U.hash(x, sh, 2) * 5) | 0] : ['#a07a50', '#7a5a8a', '#4a6a7a'][(U.hash(x, sh, 4) * 3) | 0]);
        x += w + (U.hash(x, sh, 8) > .8 ? 1 : 0);
      }
    }
  },
  counter(c, p, r, s) { // bancada com pia
    r(0, 0, 48, 20, '#d8d2c4'); r(0, 0, 48, 3, '#ece6d8'); r(0, 8, 48, 12, '#7a6250'); r(0, 8, 48, 1, '#5d4a3c');
    for (let i = 0; i < 3; i++) { r(2 + i * 16, 10, 14, 9, '#86705c'); r(13 + i * 16, 14, 2, 1, '#c8b8a0'); }
    // pia
    r(26, 1, 16, 6, '#9aa3a8'); r(27, 2, 14, 4, '#7a848a'); r(33, 0, 2, 2, '#c0c8cc');
    if (s.prato) { r(10, 2, 6, 3, '#f0f0f0'); }
  },
  fridge(c, p, r, s) { r(0, 0, 18, 34, '#e6e6e0'); r(0, 0, 18, 1, '#f6f6f0'); r(16, 0, 2, 34, '#c8c8c0'); r(0, 12, 18, 1, '#b0b0a8'); r(2, 4, 1, 6, '#999'); r(2, 15, 1, 8, '#999'); r(6, 3, 4, 3, '#e85'); r(10, 18, 3, 4, '#5ae'); r(5, 20, 3, 2, '#fd4'); },
  stove(c, p, r) { r(0, 0, 18, 20, '#d8d8d4'); r(0, 0, 18, 6, '#2a2a2a'); r(2, 1, 5, 4, '#444'); r(10, 1, 5, 4, '#444'); r(1, 8, 16, 10, '#9a9a96'); r(3, 10, 12, 1, '#555'); },
  table(c, p, r, s) { r(0, 0, 32, 14, '#8a6a4a'); r(0, 0, 32, 2, '#a08060'); r(1, 14, 2, 8, '#5a4030'); r(29, 14, 2, 8, '#5a4030'); if (s.notebook) { r(4, 3, 9, 7, '#2a3a6a'); r(5, 4, 7, 5, '#f0ead8'); r(6, 5, 5, 1, '#999'); r(6, 7, 4, 1, '#999'); } if (s.laptop) { r(18, 2, 11, 7, '#2a2a2e'); r(19, 3, 9, 5, '#4a6a8a'); } },
  chair(c, p, r) { r(1, 0, 10, 8, '#6a4a34'); r(0, 8, 12, 4, '#7a5a40'); r(1, 12, 2, 6, '#4a3424'); r(9, 12, 2, 6, '#4a3424'); },
  bed(c, p, r, s) {
    r(0, 0, 30, 40, '#5a4030'); r(2, 2, 26, 36, '#e4dccb'); r(3, 3, 24, 8, '#f4efe4'); r(2, 14, 26, 24, s.lux ? '#6a5a8a' : '#5a7a8a'); r(2, 14, 26, 2, s.lux ? '#8a7ab0' : '#7a9aaa');
    if (s.lux) { for (let i = 0; i < 8; i++) p(4 + U.hash(i, 1) * 22, 17 + U.hash(i, 2) * 18, '#e8d8ff'); }
    if (s.messy) { r(6, 18, 12, 3, '#4a6a7a'); r(18, 26, 8, 4, '#6a8a9a'); }
  },
  lamp(c, p, r, s) { // abajur
    r(5, 14, 6, 2, '#3a3a3a'); r(7, 6, 2, 9, '#6a6a6a'); r(2, 0, 12, 7, s.color || '#e8d8b0'); r(3, 0, 10, 1, '#fff6dc');
  },
  window(c, p, r, s, t) { // janela na parede
    r(0, 0, 28, 22, '#5a4a3a'); r(2, 2, 24, 18, s.night ? '#1a2238' : '#9ec8e0');
    if (s.poco) { r(2, 2, 24, 18, '#6a6560'); for (let yy = 3; yy < 20; yy += 3) r(2, yy, 24, 1, '#5a5550'); for (let yy = 3; yy < 20; yy += 6) for (let xx = 4; xx < 26; xx += 7) r(xx, yy, 1, 3, '#5a5550'); r(2, 2, 24, 3, '#3a3632'); }
    else if (!s.night) { r(2, 14, 24, 6, '#8a9a8a'); r(4, 9, 6, 6, '#b0a89a'); r(12, 7, 8, 8, '#c4b8a6'); r(21, 10, 4, 5, '#a89c8a'); }
    else { p(6, 5, '#fff'); p(18, 8, '#ddd'); r(4, 12, 6, 8, '#2a3048'); p(6, 14, '#e8c86a'); r(14, 10, 8, 10, '#262c42'); p(16, 13, '#e8c86a'); p(19, 16, '#e8c86a'); }
    r(13, 2, 2, 18, '#5a4a3a'); r(2, 10, 24, 1, '#5a4a3a');
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(3, 3, 4, 6);
  },
  door(c, p, r, s) { r(0, 0, 16, 30, '#3a2a20'); r(1, 1, 14, 29, s.color || '#8a6448'); r(3, 4, 10, 10, U.shade(s.color || '#8a6448', -12)); r(3, 17, 10, 10, U.shade(s.color || '#8a6448', -12)); r(12, 16, 2, 2, '#d8c070'); if (s.glow) { c.fillStyle = 'rgba(255,230,170,.35)'; c.fillRect(0, 0, 16, 30); } },
  broom(c, p, r) { r(3, 0, 1, 18, '#a07a50'); r(1, 18, 5, 5, '#d8b860'); r(1, 22, 5, 1, '#b09040'); },
  plant(c, p, r, s) { r(3, 12, 10, 8, '#a0583a'); r(3, 12, 10, 2, '#b86a48'); r(4, 2, 3, 10, '#4a8a4a'); r(8, 0, 4, 12, '#5a9a5a'); r(1, 5, 4, 6, '#3a7a3a'); r(10, 4, 5, 6, '#4a8a4a'); },
  rug(c, p, r, s) { r(0, 0, s.w || 48, s.h || 30, s.c || '#7a4a44'); r(2, 2, (s.w || 48) - 4, (s.h || 30) - 4, U.shade(s.c || '#7a4a44', 12)); r(5, 5, (s.w || 48) - 10, (s.h || 30) - 10, U.shade(s.c || '#7a4a44', -6)); },
  toilet(c, p, r) { r(2, 0, 12, 8, '#f0f0ee'); r(0, 8, 16, 10, '#f4f4f2'); r(3, 10, 10, 6, '#dfe6e8'); },
  shower(c, p, r) { r(0, 0, 22, 30, 'rgba(180,210,220,.35)'); r(0, 0, 1, 30, '#c0d0d4'); r(10, 2, 3, 2, '#999'); },
  sinkBath(c, p, r) { r(0, 4, 16, 10, '#f0f0ee'); r(2, 6, 12, 6, '#d0dadc'); r(6, 0, 4, 5, '#bbb'); },
  mirror(c, p, r) { r(0, 0, 14, 12, '#8a9aa0'); r(1, 1, 12, 10, '#c8dce4'); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(2, 2, 3, 5); },
  railing(c, p, r, s) { const w = s.w || 48; r(0, 0, w, 2, '#3a3a3a'); for (let i = 0; i < w; i += 4) r(i, 2, 1, 12, '#4a4a4a'); r(0, 12, w, 2, '#3a3a3a'); },
  // ---- exterior
  tree(c, p, r, s, t) {
    const sway = Math.sin(t * 1.3 + (s.seed || 0)) * 1;
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(20, 52, 16, 5, 0, 0, 7); c.fill();
    r(17, 30, 6, 22, '#5a4030'); r(17, 30, 2, 22, '#6d5040'); r(14, 48, 12, 3, '#4a3424');
    const g = s.autumn ? ['#a8803a', '#c89a48', '#8a6a2a'] : ['#3f6e3a', '#4f8a46', '#2f5a2c'];
    const blob = (x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x + sway, y, rad, 0, 7); c.fill(); };
    blob(20, 20, 16, g[2]); blob(12, 22, 11, g[0]); blob(28, 22, 11, g[0]); blob(20, 13, 12, g[1]); blob(14, 15, 7, g[1]); blob(25, 26, 8, g[2]);
    for (let i = 0; i < 12; i++) { const hx = U.hash(i, s.seed || 1) * 30 + 5, hy = U.hash(i, 7 + (s.seed || 1)) * 26 + 4; r(hx + sway, hy, 2, 1, U.shade(g[1], 25)); }
  },
  bench(c, p, r) { r(0, 0, 36, 3, '#7a5a3a'); r(0, 4, 36, 3, '#86664a'); r(0, 9, 36, 4, '#8e6e50'); r(0, 9, 36, 1, '#a08060'); r(2, 13, 2, 6, '#2a2a2a'); r(32, 13, 2, 6, '#2a2a2a'); r(1, 2, 2, 11, '#333'); r(33, 2, 2, 11, '#333'); },
  lamppost(c, p, r, s) { r(6, 8, 3, 44, '#2e3236'); r(4, 50, 7, 3, '#25282b'); r(2, 2, 11, 7, '#2e3236'); r(3, 6, 9, 3, s.on ? '#ffe9a8' : '#9a9a8a'); },
  trafficLight(c, p, r, s) {
    r(6, 14, 3, 34, '#2a2d30'); r(3, 0, 9, 16, '#1d1f22');
    r(5, 2, 5, 4, s.state === 'red' ? '#ff4a3a' : '#4a1a16'); r(5, 6, 5, 4, s.state === 'yellow' ? '#ffcc3a' : '#4a3a16'); r(5, 10, 5, 4, s.state === 'green' ? '#4aff7a' : '#163a20');
  },
  fountain(c, p, r, s, t) {
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(32, 36, 30, 9, 0, 0, 7); c.fill();
    c.fillStyle = '#b8b0a0'; c.beginPath(); c.ellipse(32, 30, 30, 10, 0, 0, 7); c.fill();
    c.fillStyle = '#4a7a9a'; c.beginPath(); c.ellipse(32, 29, 26, 8, 0, 0, 7); c.fill();
    c.fillStyle = '#6a9aba'; for (let i = 0; i < 6; i++) { const a = t * 0.8 + i; c.fillRect(32 + Math.cos(a) * 18, 29 + Math.sin(a) * 5, 3, 1); }
    r(29, 10, 6, 20, '#a8a090'); r(24, 8, 16, 4, '#b8b0a0');
    if (!s.frozen) for (let i = 0; i < 5; i++) { const k = (t * 2 + i / 5) % 1; r(31 + Math.sin(i * 2) * k * 10, 8 - Math.sin(k * 3.14) * 8 + k * 18, 1, 2, '#bfe0f0'); }
    else for (let i = 0; i < 5; i++) r(31 + Math.sin(i * 2) * .5 * 10, 8 - 8 + 9, 1, 2, '#bfe0f0');
  },
  hedge(c, p, r, s) { const w = s.w || 32; r(0, 2, w, 12, '#3a6a34'); r(0, 0, w, 4, '#4a7e42'); for (let i = 0; i < w; i += 3) p(i + 1, 1 + (i % 2), '#5e9a52'); r(0, 13, w, 2, '#2a4a24'); },
  bin(c, p, r) { r(1, 2, 10, 13, '#3a6a4a'); r(0, 0, 12, 3, '#2e5a3e'); r(3, 5, 6, 1, '#2a4a36'); },
  dumpster(c, p, r) { r(0, 4, 34, 18, '#2e5a7a'); r(0, 0, 34, 6, '#264a66'); r(2, 8, 30, 1, '#1e3a52'); r(3, 22, 4, 3, '#222'); r(27, 22, 4, 3, '#222'); r(14, 12, 6, 2, '#ddd'); },
  boxes(c, p, r) { r(0, 6, 14, 12, '#b08a5a'); r(0, 6, 14, 2, '#c8a070'); r(10, 0, 12, 12, '#a07a4a'); r(10, 0, 12, 2, '#b8905a'); r(6, 11, 1, 6, '#8a6a3a'); },
  newsstand(c, p, r) { r(0, 8, 40, 26, '#2e6a4a'); r(-2, 2, 44, 8, '#25563c'); for (let i = 0; i < 6; i++) { r(3 + i * 6, 12, 5, 7, ['#e33', '#fd4', '#4ae', '#fff', '#e8a', '#7c5'][i]); r(3 + i * 6, 21, 5, 7, ['#fff', '#e8a', '#7c5', '#e33', '#fd4', '#4ae'][i]); } r(14, 28, 12, 6, '#1a3a2a'); },
  busStop(c, p, r) { r(0, 0, 48, 4, '#3a4a5a'); r(1, 4, 2, 28, '#555'); r(45, 4, 2, 28, '#555'); r(4, 6, 40, 16, 'rgba(160,200,220,.35)'); r(6, 22, 36, 3, '#6a5040'); r(36, 8, 8, 10, '#e0c040'); r(38, 10, 4, 2, '#222'); },
  carParked(c, p, r, s) { c.drawImage(Beasts.car(s.color || '#c24a3a', 0, s.dir || 1), 0, 0); },
  table2(c, p, r, s) { // mesa de bar de plástico
    r(0, 4, 24, 3, '#e8c640'); r(1, 2, 22, 3, '#f2d860'); r(10, 7, 4, 10, '#d8b030'); r(5, 16, 14, 2, '#c8a020');
    if (s.beer) { r(5, -3, 3, 6, '#c8a040'); r(5, -4, 3, 1, '#fff'); r(15, -4, 3, 7, '#3a7a3a'); }
  },
  plasticChair(c, p, r) { r(1, 0, 12, 8, '#e8c640'); r(0, 8, 14, 3, '#f2d860'); r(1, 11, 2, 6, '#c8a020'); r(11, 11, 2, 6, '#c8a020'); },
  poster(c, p, r, s) { r(0, 0, 14, 18, '#f4f0e0'); r(1, 1, 12, 3, '#d33'); r(4, 6, 6, 5, '#c98a4a'); r(5, 7, 4, 2, '#e0a868'); r(2, 13, 10, 1, '#555'); r(2, 15, 8, 1, '#555'); },
  pole(c, p, r, s) { r(3, 0, 3, 60, '#5a4a3a'); r(0, 4, 9, 2, '#4a3a2a'); },
  kite(c, p, r, s, t) { const k = Math.sin(t * 2) * 1; c.fillStyle = '#e84a5a'; c.beginPath(); c.moveTo(6, 0 + k); c.lineTo(12, 6 + k); c.lineTo(6, 14 + k); c.lineTo(0, 6 + k); c.fill(); r(5, 0 + k, 1, 14, '#f8d84a'); r(0, 6 + k, 12, 1, '#f8d84a'); for (let i = 0; i < 4; i++) r(6 + Math.sin(t * 3 + i) * 2, 14 + i * 3 + k, 2, 2, ['#4ae', '#fd4', '#e84a5a', '#5c5'][i]); },
  wire(c, p, r, s) { c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo((s.w || 120) / 2, 12, s.w || 120, 2); c.stroke(); },
  // ---- mansão
  bigWindow(c, p, r, s, t) {
    const w = s.w || 48, h = s.h || 40;
    r(0, 0, w, h, '#2a1c14'); r(3, 3, w - 6, h - 6, '#cfe6f2');
    const mode = s.mode || 'avo';
    if (mode === 'avo') { // quintal da casa da avó ampliado até virar campo
      r(3, 3, w - 6, (h - 6) * .45, '#b8dcf0'); r(3, 3 + (h - 6) * .45, w - 6, (h - 6) * .55, '#7aa860');
      r(3, 3 + (h - 6) * .45, w - 6, 2, '#6a9850');
      c.fillStyle = '#5a8a48'; for (let i = 0; i < 5; i++) c.fillRect(6 + i * 9, 3 + (h - 6) * .45 - 3 - (i % 2) * 2, 6, 4);
      // varal e casinha
      r(w - 18, 3 + (h - 6) * .45 - 7, 10, 8, '#e8d8c0'); r(w - 19, 3 + (h - 6) * .45 - 9, 12, 3, '#b05a3a');
      // cachorro correndo atrás de nada
      const dx = 6 + ((t * 9) % (w - 18)); r(dx, h - 12, 5, 3, '#c98a4a'); r(dx + 4, h - 14, 3, 3, '#c98a4a'); r(dx + 1, h - 9, 1, 2, '#9a6634'); r(dx + 3, h - 9, 1, 2, '#9a6634');
    } else if (mode === 'white') { r(3, 3, w - 6, h - 6, '#f6f6f4'); }
    else if (mode === 'night') { r(3, 3, w - 6, h - 6, '#1a2240'); for (let i = 0; i < 10; i++) p(5 + U.hash(i, 3) * (w - 10), 5 + U.hash(i, 4) * (h - 14), '#fff'); }
    r((w / 2) | 0, 3, 2, h - 6, '#2a1c14'); r(3, (h / 2) | 0, w - 6, 2, '#2a1c14');
    c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(5, 5, 6, 10);
    r(-2, h - 2, w + 4, 3, '#4a3224');
  },
  kitchenIsland(c, p, r, s) { r(0, 0, 56, 20, '#2a1e18'); r(0, 0, 56, 6, '#d8d0c0'); r(0, 0, 56, 1, '#f0e8d8'); r(2, 8, 52, 11, '#3a2a20'); for (let i = 0; i < 4; i++) r(4 + i * 13, 12, 10, 1, '#5a4a3a'); if (s.food) { r(20, -2, 14, 6, '#f4f4f0'); r(22, -3, 10, 3, '#c8783a'); r(24, -4, 3, 2, '#5a9a3a'); r(36, 0, 6, 4, '#8a5a3a'); r(37, -1, 4, 1, '#fff'); } },
  stairs(c, p, r, s) { for (let i = 0; i < 8; i++) { r(0, i * 5, 32, 5, i % 2 ? '#5a3e2e' : '#664834'); r(0, i * 5, 32, 1, '#7a5a40'); } r(-3, 0, 3, 40, '#3a2618'); r(32, 0, 3, 40, '#3a2618'); },
  arcade(c, p, r, s, t) { r(0, 0, 20, 34, '#2a1a4a'); r(0, 0, 20, 4, '#e84a8a'); r(2, 6, 16, 12, '#101830'); r(4 + Math.sin(t * 3) * 3, 10, 3, 3, '#5ee'); r(12, 9 + Math.cos(t * 4) * 2, 2, 2, '#fd4'); r(2, 20, 16, 6, '#3a2a5a'); r(5, 22, 2, 2, '#e33'); r(10, 22, 2, 2, '#3e3'); r(14, 22, 2, 2, '#33e'); r(2, 26, 16, 8, '#22143a'); },
  piano(c, p, r) { r(0, 0, 40, 20, '#141414'); r(2, 12, 36, 6, '#f4f4f0'); for (let i = 0; i < 12; i++) r(4 + i * 3, 12, 1, 4, '#141414'); r(0, 0, 40, 2, '#2a2a2a'); },
  oilDrum(c, p, r) { r(0, 0, 12, 16, '#8a3a2a'); r(0, 3, 12, 1, '#6a2a1a'); r(0, 11, 12, 1, '#6a2a1a'); r(0, 0, 12, 2, '#a04a3a'); },
  workbench(c, p, r) { r(0, 0, 40, 14, '#5a4a3a'); r(0, 0, 40, 3, '#7a6a5a'); r(3, 14, 3, 8, '#3a2a1a'); r(34, 14, 3, 8, '#3a2a1a'); r(6, -6, 4, 6, '#c33'); r(14, -3, 10, 3, '#888'); r(28, -5, 5, 5, '#3a6aa0'); },
  // ---- hospital / velório / cemitério
  maca(c, p, r, s) { r(0, 8, 40, 10, '#9aa4a8'); r(2, 18, 2, 8, '#666'); r(36, 18, 2, 8, '#666'); r(1, 4, 38, 6, '#e8eef0'); if (s.body) { r(4, 2, 30, 8, '#dfe8ec'); r(31, 1, 7, 7, '#8d5f42'); r(32, 0, 5, 3, '#14100e'); r(33, 2, 4, 2, '#f4f4f4'); } },
  vending(c, p, r, s, t) { r(0, 0, 20, 34, '#b03030'); r(2, 3, 12, 22, '#1a2a3a'); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) r(3 + j * 4, 5 + i * 5, 3, 3, ['#fd4', '#4ae', '#e84', '#5c5'][(i + j) % 4]); r(15, 6, 3, 8, '#ddd'); r(4, 27, 10, 4, '#111'); c.fillStyle = `rgba(150,220,255,${.08 + Math.sin(t * 30) * .03})`; c.fillRect(2, 3, 12, 22); },
  waitChairs(c, p, r) { for (let i = 0; i < 4; i++) { r(i * 12, 0, 10, 8, '#3a6a8a'); r(i * 12, 8, 10, 4, '#4a7a9a'); } r(0, 12, 48, 2, '#555'); r(2, 14, 2, 4, '#555'); r(44, 14, 2, 4, '#555'); },
  plate(c, p, r, s) { r(0, 0, 26, 12, '#e8ece8'); r(1, 1, 24, 10, '#2a4a6a'); r(3, 4, 20, 1, '#e8ece8'); r(3, 7, 14, 1, '#e8ece8'); },
  coffin(c, p, r, s) { r(0, 4, 48, 18, '#4a2a1a'); r(2, 0, 44, 8, '#5e3a24'); r(4, 1, 40, 2, '#7a5034'); r(0, 12, 48, 2, '#c9a24a'); r(6, 3, 30, 6, '#f2ede4'); if (s.open) { r(30, 2, 9, 7, '#8d5f42'); r(31, 1, 7, 2, '#14100e'); r(20, 4, 10, 4, '#23252b'); r(22, 4, 2, 2, '#e8e4dc'); } },
  flowers(c, p, r, s) {
    r(2, 12, 16, 10, s.plastic ? '#cfcfc8' : '#3a5a3a'); r(4, 18, 12, 6, '#5a4030');
    for (let i = 0; i < 9; i++) { const x = 1 + U.hash(i, 2) * 16, y = 1 + U.hash(i, 3) * 12; r(x, y, 3, 3, s.plastic ? ['#e8a0b0', '#f0e080', '#ffffff'][i % 3] : ['#ffffff', '#f4f0e0', '#e8dcc8'][i % 3]); p(x + 1, y + 1, s.plastic ? '#c08' : '#d8c040'); }
  },
  rowChairs(c, p, r) { for (let i = 0; i < 5; i++) { r(i * 12, 0, 10, 8, '#4a3a30'); r(i * 12, 8, 10, 4, '#5a4a3e'); r(i * 12 + 1, 12, 1, 4, '#333'); r(i * 12 + 8, 12, 1, 4, '#333'); } },
  coffee(c, p, r) { r(0, 8, 24, 12, '#6a5040'); r(0, 8, 24, 2, '#7a6050'); r(4, 0, 8, 10, '#c8c8c0'); r(5, 1, 6, 2, '#e85'); r(14, 4, 6, 5, '#f4f4f0'); r(15, 2, 4, 2, '#f4f4f0'); },
  grave(c, p, r, s) { r(2, 0, 14, 16, '#9a9a96'); r(2, 0, 14, 2, '#b0b0ac'); r(0, 15, 18, 4, '#7a7a76'); r(5, 5, 8, 1, '#6a6a66'); r(6, 8, 6, 1, '#6a6a66'); if (s.cross) { r(8, 1, 2, 6, '#6a6a66'); r(6, 3, 6, 2, '#6a6a66'); } },
  freshGrave(c, p, r, s) { r(0, 6, 34, 18, '#5a3e2a'); r(2, 4, 30, 6, '#6a4a32'); for (let i = 0; i < 10; i++) r(U.hash(i, 9) * 30 + 2, 6 + U.hash(i, 8) * 14, 2, 1, '#7a5a3e'); r(13, -14, 8, 20, '#c8c4bc'); r(13, -14, 8, 2, '#dcd8d0'); r(15, -8, 4, 1, '#888'); r(10, 18, 14, 6, '#e8e0d0'); for (let i = 0; i < 5; i++) r(11 + i * 3, 17, 2, 2, ['#fff', '#f4e', '#ff8', '#fff', '#e8a'][i]); },
  mailbox(c, p, r) { r(0, 0, 10, 8, '#c33'); r(4, 8, 2, 10, '#555'); },
  fence(c, p, r, s) { const w = s.w || 48; for (let i = 0; i < w; i += 6) { r(i, 0, 3, 14, '#2a2a2a'); p(i + 1, -1, '#2a2a2a'); } r(0, 3, w, 1, '#2a2a2a'); r(0, 10, w, 1, '#2a2a2a'); },
  carWash(c, p, r, s, t) { c.drawImage(Beasts.car('#3a6aa0', 0, 1), 0, 0); c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 6; i++) c.fillRect(8 + U.hash(i, 1) * 24, 6 + U.hash(i, 2) * 8 + (t * 4 % 3), 2, 2); r(30, 20, 4, 3, '#e8d84a'); },
};

// tamanhos dos sprites (largura, altura) e caixas de colisão relativas
const PROPDEF = {
  sofa: { w: 40, h: 24, box: [0, 10, 40, 14] }, sofaLux: { w: 56, h: 24, box: [0, 8, 56, 16] },
  tv: { w: 30, h: 21, box: [0, 14, 30, 7] }, rack: { w: 36, h: 10, box: [0, 2, 36, 8] }, estante: { w: 28, h: 34, box: [0, 22, 28, 12] },
  counter: { w: 48, h: 20, box: [0, 4, 48, 16] }, fridge: { w: 18, h: 34, box: [0, 22, 18, 12] }, stove: { w: 18, h: 20, box: [0, 6, 18, 14] },
  table: { w: 32, h: 22, box: [0, 4, 32, 14] }, chair: { w: 12, h: 18, box: [0, 8, 12, 8] }, bed: { w: 30, h: 40, box: [0, 2, 30, 38] },
  lamp: { w: 16, h: 16, box: [3, 12, 10, 4] }, window: { w: 28, h: 22, box: null }, door: { w: 16, h: 30, box: null },
  broom: { w: 7, h: 23, box: null }, plant: { w: 16, h: 20, box: [3, 14, 10, 6] }, rug: { w: 48, h: 30, box: null, under: true },
  toilet: { w: 16, h: 18, box: [0, 6, 16, 12] }, shower: { w: 22, h: 30, box: null, under: true }, sinkBath: { w: 16, h: 14, box: [0, 6, 16, 8] }, mirror: { w: 14, h: 12, box: null },
  railing: { w: 48, h: 14, box: [0, 8, 48, 6] },
  tree: { w: 40, h: 56, box: [14, 46, 12, 6] }, bench: { w: 36, h: 19, box: [0, 6, 36, 10] }, lamppost: { w: 15, h: 53, box: [5, 48, 5, 4] },
  trafficLight: { w: 15, h: 48, box: [5, 44, 5, 4] }, fountain: { w: 64, h: 42, box: [4, 22, 56, 16] }, hedge: { w: 32, h: 15, box: [0, 4, 32, 11] },
  bin: { w: 12, h: 15, box: [0, 6, 12, 9] }, dumpster: { w: 34, h: 25, box: [0, 8, 34, 16] }, boxes: { w: 22, h: 18, box: [0, 8, 22, 10] },
  newsstand: { w: 40, h: 34, box: [0, 14, 40, 20] }, busStop: { w: 48, h: 32, box: [0, 20, 48, 6] }, carParked: { w: 40, h: 24, box: [2, 10, 36, 11] },
  table2: { w: 24, h: 18, box: [2, 6, 20, 10] }, plasticChair: { w: 14, h: 17, box: [0, 8, 14, 8] }, poster: { w: 14, h: 18, box: null },
  pole: { w: 9, h: 60, box: [2, 54, 5, 5] }, kite: { w: 12, h: 26, box: null }, wire: { w: 120, h: 14, box: null },
  bigWindow: { w: 48, h: 40, box: null }, kitchenIsland: { w: 56, h: 20, box: [0, 4, 56, 16] }, stairs: { w: 32, h: 40, box: null, under: true },
  arcade: { w: 20, h: 34, box: [0, 22, 20, 12] }, piano: { w: 40, h: 20, box: [0, 4, 40, 16] }, oilDrum: { w: 12, h: 16, box: [0, 6, 12, 10] }, workbench: { w: 40, h: 22, box: [0, 4, 40, 12] },
  maca: { w: 40, h: 26, box: [0, 8, 40, 12] }, vending: { w: 20, h: 34, box: [0, 22, 20, 12] }, waitChairs: { w: 48, h: 18, box: [0, 4, 48, 12] }, plate: { w: 26, h: 12, box: null },
  coffin: { w: 48, h: 22, box: [0, 4, 48, 18] }, flowers: { w: 20, h: 24, box: [2, 14, 16, 10] }, rowChairs: { w: 60, h: 16, box: [0, 4, 60, 10] }, coffee: { w: 24, h: 20, box: [0, 8, 24, 12] },
  grave: { w: 18, h: 19, box: [0, 12, 18, 7] }, freshGrave: { w: 34, h: 24, box: [0, 6, 34, 16] }, mailbox: { w: 10, h: 18, box: null }, fence: { w: 48, h: 14, box: [0, 8, 48, 6] },
  carWash: { w: 40, h: 24, box: [2, 10, 36, 11] },
};

// =====================================================================
//  OBJETOS FÍSICOS (telecinese)
// =====================================================================
const ItemArt = {
  draw(c, type, x, y, broken, t) {
    const R = (xx, yy, w, h, col) => { c.fillStyle = col; c.fillRect((x + xx) | 0, (y + yy) | 0, w, h); };
    switch (type) {
      case 'copo': // copo de requeijão com a etiqueta meio descascada
        if (broken) { R(-4, 0, 2, 1, '#cfe8f0'); R(1, -1, 2, 1, '#e8f6fa'); R(3, 1, 1, 1, '#cfe8f0'); R(-1, 2, 2, 1, '#b8dce8'); R(5, -2, 1, 1, '#e8f6fa'); return; }
        R(-2, -6, 5, 6, 'rgba(200,232,242,.85)'); R(-2, -6, 5, 1, '#e8f6fa'); R(-2, -3, 3, 2, '#e8dcb8'); R(2, -5, 1, 4, 'rgba(255,255,255,.6)');
        break;
      case 'colher': R(-3, -1, 5, 1, '#c8ccd0'); R(2, -2, 2, 2, '#dfe3e6'); if (broken) R(0, -2, 1, 1, '#c8ccd0'); break;
      case 'controle': R(-2, -5, 4, 7, '#1d1d22'); R(-1, -4, 1, 1, '#d33'); R(0, -2, 1, 1, '#888'); R(-1, -1, 1, 1, '#888'); break;
      case 'laranja': R(-2, -4, 5, 5, '#f08a20'); R(-1, -5, 3, 1, '#f8a040'); R(0, -6, 1, 1, '#4a8a2a'); R(1, -3, 1, 1, '#ffc070'); break;
      case 'milho': R(-3, -4, 6, 5, '#d8c8a0'); R(-2, -5, 4, 1, '#c8b890'); R(-1, -3, 2, 1, '#f0d040'); break;
      case 'sorvete': if (broken) { R(-3, 0, 6, 2, '#f4b8c8'); R(-1, -1, 2, 1, '#c8904a'); return; } R(-1, -2, 3, 4, '#c8904a'); R(-2, -6, 5, 4, '#f4b8c8'); R(-1, -7, 3, 1, '#f8d0dc'); break;
      case 'pizza': R(-6, -4, 12, 4, '#c8a070'); R(-6, -4, 12, 1, '#dcb888'); R(-3, -3, 6, 1, '#c33'); break;
      case 'flor': R(0, -6, 1, 6, '#4a8a3a'); R(-1, -8, 3, 3, '#f06a8a'); R(0, -7, 1, 1, '#fd4'); break;
      case 'cafe': R(-2, -4, 5, 5, '#f4f4f0'); R(-1, -4, 3, 1, '#5a3a2a'); R(3, -3, 1, 2, '#f4f4f0'); break;
      case 'caixa': R(-5, -8, 10, 9, '#b08a5a'); R(-5, -8, 10, 2, '#c8a070'); R(-1, -8, 2, 9, '#8a6a3a'); break;
      case 'bola': R(-3, -6, 6, 6, '#e8e8e8'); R(-1, -4, 2, 2, '#222'); break;
      case 'envelope': R(-4, -3, 8, 5, '#f4efe0'); R(-4, -3, 8, 1, '#d8d0b8'); R(-1, -1, 2, 1, '#c33'); break;
      case 'pipa': R(-3, -5, 6, 6, '#e84a5a'); R(0, -5, 1, 6, '#f8d84a'); break;
      case 'pagina': R(-3, -4, 6, 7, '#f2ead6'); R(-2, -3, 4, 1, '#8a8070'); R(-2, -1, 3, 1, '#8a8070'); R(-2, 1, 4, 1, '#8a8070'); break;
      case 'cerveja': R(-1, -6, 3, 7, '#3a7a3a'); R(-1, -7, 3, 1, '#ddd'); break;
      default: R(-3, -3, 6, 6, '#f0f');
    }
  },
};
