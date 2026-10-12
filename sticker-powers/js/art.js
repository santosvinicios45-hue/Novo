/* =========================================================================
   STICKER POWERS — ilustrações vetoriais geradas em SVG.
   Cada sticker e cada chefe tem o seu próprio desenho (nada de imagens
   externas). Art.sticker(id) devolve uma string <svg>.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const Art = SP.Art = {};
  let uidc = 0;

  /* ---------------------------------------------------------------- helpers */
  const eye = (x, y, r, iris) =>
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="#fff"/>` +
    `<ellipse cx="${x}" cy="${y + r * 0.12}" rx="${r * 0.72}" ry="${r * 0.9}" fill="${iris}"/>` +
    `<ellipse cx="${x}" cy="${y + r * 0.2}" rx="${r * 0.36}" ry="${r * 0.5}" fill="#120a1c"/>` +
    `<circle cx="${x - r * 0.3}" cy="${y - r * 0.32}" r="${r * 0.3}" fill="#fff"/>` +
    `<circle cx="${x + r * 0.28}" cy="${y + r * 0.4}" r="${r * 0.13}" fill="#fff"/>`;
  const eyes = (x, y, gap, r, iris) => eye(x - gap, y, r, iris) + eye(x + gap, y, r, iris);
  const glowEye = (x, y, rx, ry, c) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx * 2}" ry="${ry * 2}" fill="${c}" opacity=".35" filter="url(#BL)"/>` +
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="${rx * 0.45}" ry="${ry * 0.45}" fill="#fff"/>`;
  const smile = (x, y, w, c) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${c || '#3a1420'}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const blush = (x, y, gap, c) => `<ellipse cx="${x - gap}" cy="${y}" rx="7" ry="4" fill="${c || '#ff6f91'}" opacity=".55"/><ellipse cx="${x + gap}" cy="${y}" rx="7" ry="4" fill="${c || '#ff6f91'}" opacity=".55"/>`;
  const star = (cx, cy, r, c, op) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.42 : r;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return `<path d="${d}Z" fill="${c}" opacity="${op == null ? 1 : op}"/>`;
  };
  const spark = (cx, cy, r, c) => `<path d="M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z" fill="${c}"/>`;
  const bolt = (x, y, s, c) => `<path d="M${x} ${y} l${8 * s} 0 l${-5 * s} ${10 * s} l${7 * s} 0 l${-14 * s} ${18 * s} l${4 * s} ${-12 * s} l${-7 * s} 0Z" fill="${c}"/>`;
  const flame = (x, y, s, c1, c2) =>
    `<path d="M${x} ${y} C${x - 12 * s} ${y - 10 * s} ${x - 8 * s} ${y - 26 * s} ${x} ${y - 38 * s} C${x + 2 * s} ${y - 24 * s} ${x + 14 * s} ${y - 20 * s} ${x + 10 * s} ${y - 6 * s} C${x + 8 * s} ${y} ${x + 4 * s} ${y + 2 * s} ${x} ${y}Z" fill="${c1}"/>` +
    `<path d="M${x + 1 * s} ${y - 2 * s} C${x - 5 * s} ${y - 8 * s} ${x - 3 * s} ${y - 16 * s} ${x + 1 * s} ${y - 22 * s} C${x + 3 * s} ${y - 14 * s} ${x + 8 * s} ${y - 10 * s} ${x + 5 * s} ${y - 4 * s}Z" fill="${c2}"/>`;
  const snow = (x, y, r, c) => {
    let s = '';
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 3 * i;
      s += `<line x1="${(x - Math.cos(a) * r).toFixed(1)}" y1="${(y - Math.sin(a) * r).toFixed(1)}" x2="${(x + Math.cos(a) * r).toFixed(1)}" y2="${(y + Math.sin(a) * r).toFixed(1)}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    return s;
  };
  const leaf = (x, y, s, rot, c, v) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C8 -10 22 -10 30 0 C22 10 8 10 0 0Z" fill="${c}"/><path d="M2 0 L27 0" stroke="${v || 'rgba(0,0,0,.25)'}" stroke-width="1.2"/></g>`;
  const bubble = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".35" stroke="${c}" stroke-width="1.2"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.25}" fill="#fff" opacity=".8"/>`;
  const gear = (cx, cy, r, c, teeth) => {
    const n = teeth || 8;
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a0 = Math.PI * 2 * i / (n * 2), a1 = Math.PI * 2 * (i + 1) / (n * 2);
      const rr = i % 2 ? r * 0.8 : r;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a0) * rr).toFixed(1) + ' ' + (cy + Math.sin(a0) * rr).toFixed(1) + 'L' + (cx + Math.cos(a1) * rr).toFixed(1) + ' ' + (cy + Math.sin(a1) * rr).toFixed(1);
    }
    return `<path d="${d}Z" fill="${c}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="rgba(0,0,0,.35)"/>`;
  };
  const shine = (x, y, w, h) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="#fff" opacity=".35"/>`;
  const shadow = (y, w) => `<ellipse cx="100" cy="${y || 178}" rx="${w || 48}" ry="7" fill="#000" opacity=".28"/>`;

  /* ---------------------------------------------------------------- fundos por elemento */
  function background(el, id) {
    const E = SP.ELEMENT[el] || { c1: '#444', c2: '#999' };
    const dark = {
      fire: '#3a0d05', water: '#03203f', ice: '#0c3247', lightning: '#2c2302', earth: '#2a1808', wind: '#06352a', light: '#3d300a',
      dark: '#120624', nature: '#062c12', plasma: '#350632', gravity: '#0a0a35', time: '#032c29', cosmic: '#12052b', poison: '#1d2d03', metal: '#1a2130'
    }[el] || '#111';
    let m = '';
    switch (el) {
      case 'fire': for (let i = 0; i < 6; i++) m += flame(15 + i * 35, 205, 0.9 + (i % 3) * 0.3, E.c1, E.c2).replace(/fill="/g, 'opacity=".35" fill="'); break;
      case 'water': for (let i = 0; i < 4; i++) m += `<path d="M0 ${140 + i * 16} Q25 ${130 + i * 16} 50 ${140 + i * 16} T100 ${140 + i * 16} T150 ${140 + i * 16} T200 ${140 + i * 16} V200 H0Z" fill="${E.c2}" opacity=".12"/>`; m += bubble(30, 40, 6, E.c2) + bubble(170, 60, 4, E.c2) + bubble(160, 30, 7, E.c2); break;
      case 'ice': for (let i = 0; i < 5; i++) m += `<path d="M${10 + i * 45} 200 L${22 + i * 45} ${120 + (i % 2) * 25} L${34 + i * 45} 200Z" fill="${E.c2}" opacity=".18"/>`; m += snow(30, 35, 8, '#fff') + snow(172, 50, 6, '#fff') + snow(150, 22, 4, '#fff'); break;
      case 'lightning': m += bolt(20, 10, 1.4, E.c2).replace('fill', 'opacity=".25" fill') + bolt(160, 20, 1.1, E.c2).replace('fill', 'opacity=".3" fill') + `<circle cx="100" cy="95" r="80" fill="${E.c1}" opacity=".08"/>`; break;
      case 'earth': m += `<path d="M0 170 L40 120 L70 150 L110 100 L150 145 L180 115 L200 135 V200 H0Z" fill="${E.c1}" opacity=".3"/><path d="M0 185 L50 160 L100 180 L150 158 L200 178 V200 H0Z" fill="${E.c2}" opacity=".2"/>`; break;
      case 'wind': for (let i = 0; i < 4; i++) m += `<path d="M${-10 + i * 10} ${40 + i * 40} Q60 ${20 + i * 40} 110 ${45 + i * 40} T220 ${35 + i * 40}" stroke="${E.c2}" stroke-width="3" fill="none" opacity=".2" stroke-linecap="round"/>`; break;
      case 'light': for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; m += `<path d="M100 95 L${100 + Math.cos(a - 0.12) * 160} ${95 + Math.sin(a - 0.12) * 160} L${100 + Math.cos(a + 0.12) * 160} ${95 + Math.sin(a + 0.12) * 160}Z" fill="${E.c2}" opacity=".12"/>`; } break;
      case 'dark': m += `<circle cx="160" cy="40" r="22" fill="#d8c8ff" opacity=".5"/><circle cx="170" cy="34" r="20" fill="${dark}"/>` + `<path d="M0 175 Q50 150 100 172 T200 165 V200 H0Z" fill="${E.c1}" opacity=".3"/>` + star(30, 30, 3, '#fff', 0.6) + star(60, 60, 2, '#fff', 0.5); break;
      case 'nature': m += leaf(10, 30, 1.2, 20, E.c1) + leaf(150, 20, 1, 140, E.c2) + leaf(170, 150, 1.3, -30, E.c1) + leaf(0, 160, 1, -10, E.c2); m = m.replace(/<g /g, '<g opacity=".35" '); break;
      case 'plasma': m += `<circle cx="100" cy="100" r="85" fill="none" stroke="${E.c2}" stroke-width="2" opacity=".2"/><circle cx="100" cy="100" r="65" fill="none" stroke="${E.c1}" stroke-width="3" opacity=".2" stroke-dasharray="8 6"/>` + bubble(30, 160, 8, E.c2) + bubble(175, 40, 6, E.c2); break;
      case 'gravity': for (let i = 1; i < 6; i++) m += `<ellipse cx="100" cy="100" rx="${i * 20}" ry="${i * 9}" fill="none" stroke="${E.c2}" stroke-width="1.5" opacity="${0.3 - i * 0.04}"/>`; break;
      case 'time': m += `<circle cx="100" cy="95" r="82" fill="none" stroke="${E.c2}" stroke-width="2" opacity=".25"/>`; for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; m += `<line x1="${100 + Math.cos(a) * 72}" y1="${95 + Math.sin(a) * 72}" x2="${100 + Math.cos(a) * 82}" y2="${95 + Math.sin(a) * 82}" stroke="${E.c2}" stroke-width="3" opacity=".3"/>`; } m += gear(25, 175, 18, E.c1).replace(/fill="/, 'opacity=".25" fill="'); break;
      case 'cosmic': m += `<ellipse cx="70" cy="60" rx="70" ry="35" fill="${E.c2}" opacity=".12" filter="url(#BL)"/><ellipse cx="140" cy="140" rx="60" ry="30" fill="${E.c1}" opacity=".2" filter="url(#BL)"/>`; for (let i = 0; i < 14; i++) m += star((i * 53) % 200, (i * 37 + 11) % 200, 1.5 + (i % 3), '#fff', 0.5 + (i % 2) * 0.3); break;
      case 'poison': for (let i = 0; i < 7; i++) m += bubble((i * 31 + 12) % 200, 190 - (i * 23) % 120, 3 + (i % 3) * 3, E.c2); m += `<path d="M0 180 Q40 165 80 178 T160 172 T200 176 V200 H0Z" fill="#7b2ff7" opacity=".25"/>`; break;
      case 'metal': for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) m += `<path d="M${i * 46 + (j % 2) * 23} ${j * 40} l20 0 l10 17 l-10 17 l-20 0 l-10 -17Z" fill="none" stroke="${E.c2}" stroke-width="1" opacity=".12"/>`; break;
    }
    return `<radialGradient id="bg${id}" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="${E.c1}" stop-opacity=".55"/><stop offset=".6" stop-color="${dark}"/><stop offset="1" stop-color="#05030a"/></radialGradient>` +
      `<rect width="200" height="200" fill="url(#bg${id})"/>` + m;
  }

  /* ---------------------------------------------------------------- desenhos */
  // Cada função recebe um gerador de ids `G(nome)` para gradientes exclusivos.
  const D = {};

  D.brasinha = G => `
    <radialGradient id="${G('b')}" cx="40%" cy="35%"><stop offset="0" stop-color="#ffcf7a"/><stop offset="1" stop-color="#ff6a1f"/></radialGradient>
    ${shadow(176, 44)}
    ${flame(150, 150, 1.4, '#ff5a1f', '#ffd36a').replace('M150 150', 'M140 150')}
    <ellipse cx="108" cy="140" rx="42" ry="30" fill="url(#${G('b')})"/>
    <rect x="80" y="155" width="12" height="20" rx="6" fill="#e2551a"/><rect x="118" y="155" width="12" height="20" rx="6" fill="#e2551a"/>
    <path d="M58 70 L66 30 L86 62Z" fill="#ff7a2a"/><path d="M62 64 L67 40 L80 60Z" fill="#ffd36a"/>
    <path d="M142 70 L134 30 L114 62Z" fill="#ff7a2a"/><path d="M138 64 L133 40 L120 60Z" fill="#ffd36a"/>
    <circle cx="100" cy="95" r="44" fill="url(#${G('b')})"/>
    ${flame(100, 56, 0.8, '#ff3d00', '#ffe08a')}
    <ellipse cx="100" cy="112" rx="24" ry="16" fill="#fff1d6"/>
    ${eyes(100, 90, 17, 9, '#7a2a00')}
    <ellipse cx="100" cy="105" rx="5" ry="3.5" fill="#3a1420"/>
    ${smile(100, 112, 7)}${blush(100, 106, 28)}`;

  D.gotinha = G => `
    <radialGradient id="${G('b')}" cx="38%" cy="35%"><stop offset="0" stop-color="#bff0ff"/><stop offset=".6" stop-color="#3aa0ff"/><stop offset="1" stop-color="#1557c9"/></radialGradient>
    ${shadow(178, 40)}
    <path d="M100 28 C120 62 150 92 150 124 C150 154 128 176 100 176 C72 176 50 154 50 124 C50 92 80 62 100 28Z" fill="url(#${G('b')})"/>
    ${shine(78, 100, 9, 20)}
    ${eyes(100, 124, 18, 10, '#0b3a8a')}
    ${smile(100, 144, 8, '#0b2a5a')}${blush(100, 140, 30, '#ff8fb1')}
    ${bubble(42, 70, 9, '#9fe3ff')}${bubble(160, 62, 6, '#9fe3ff')}${bubble(155, 160, 5, '#9fe3ff')}
    <path d="M136 120 Q156 108 162 92" stroke="#bff0ff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;

  D.seixo = G => `
    <linearGradient id="${G('b')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9a48a"/><stop offset="1" stop-color="#6b5440"/></linearGradient>
    ${shadow(180, 60)}
    <path d="M45 110 L60 62 L100 44 L145 60 L158 112 L140 170 L62 172Z" fill="url(#${G('b')})" stroke="#4a3626" stroke-width="3"/>
    <path d="M60 62 L100 44 L145 60 L128 74 L78 76Z" fill="#5ea84a"/><path d="M70 70 Q100 58 135 68" stroke="#82d45f" stroke-width="4" fill="none"/>
    <path d="M118 100 L128 120 L120 138" stroke="#4a3626" stroke-width="2.5" fill="none"/>
    <path d="M70 140 L82 150" stroke="#4a3626" stroke-width="2.5"/>
    <ellipse cx="34" cy="128" rx="14" ry="11" fill="#8f7a62" stroke="#4a3626" stroke-width="2.5"/><ellipse cx="168" cy="128" rx="14" ry="11" fill="#8f7a62" stroke="#4a3626" stroke-width="2.5"/>
    <path d="M70 92 L92 98" stroke="#2a1a10" stroke-width="4" stroke-linecap="round"/><path d="M132 92 L110 98" stroke="#2a1a10" stroke-width="4" stroke-linecap="round"/>
    ${eyes(100, 108, 17, 8, '#2f6b1f')}
    <path d="M88 134 L112 134" stroke="#2a1a10" stroke-width="3" stroke-linecap="round"/>`;

  D.brisinha = G => `
    <radialGradient id="${G('w')}"><stop offset="0" stop-color="#e9fff6" stop-opacity=".9"/><stop offset="1" stop-color="#5fe0b0" stop-opacity=".3"/></radialGradient>
    <ellipse cx="62" cy="84" rx="36" ry="22" fill="url(#${G('w')})" transform="rotate(-25 62 84)"/><ellipse cx="138" cy="84" rx="36" ry="22" fill="url(#${G('w')})" transform="rotate(25 138 84)"/>
    <ellipse cx="70" cy="122" rx="24" ry="14" fill="url(#${G('w')})" transform="rotate(25 70 122)"/><ellipse cx="130" cy="122" rx="24" ry="14" fill="url(#${G('w')})" transform="rotate(-25 130 122)"/>
    <path d="M100 118 L84 168 Q100 176 116 168Z" fill="#7ef0c4"/>
    <path d="M60 60 Q70 20 104 30 Q150 30 142 70 Q160 50 150 30" stroke="#a7ffe0" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="88" r="30" fill="#ffe9d9"/>
    <path d="M70 80 Q80 50 100 52 Q125 50 132 80 Q120 64 100 66 Q82 66 70 80Z" fill="#3fd6a0"/>
    ${eyes(100, 92, 12, 7, '#0e7a55')}${smile(100, 104, 5)}${blush(100, 100, 18)}
    <path d="M20 150 Q50 135 80 150" stroke="#d4fff0" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/><path d="M120 160 Q150 145 185 160" stroke="#d4fff0" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;

  D.faisca = G => `
    <radialGradient id="${G('b')}" cx="40%" cy="35%"><stop offset="0" stop-color="#fff59a"/><stop offset="1" stop-color="#ffbe0a"/></radialGradient>
    ${shadow(178, 44)}
    ${bolt(140, 98, 2.4, '#ffd60a')}
    <ellipse cx="100" cy="140" rx="38" ry="32" fill="url(#${G('b')})"/>
    <circle cx="58" cy="58" r="26" fill="url(#${G('b')})"/><circle cx="58" cy="58" r="15" fill="#ff9fb2"/>
    <circle cx="142" cy="58" r="26" fill="url(#${G('b')})"/><circle cx="142" cy="58" r="15" fill="#ff9fb2"/>
    <circle cx="100" cy="96" r="40" fill="url(#${G('b')})"/>
    ${eyes(100, 92, 16, 8, '#2a1800')}
    <circle cx="68" cy="110" r="9" fill="#ff4b4b"/><circle cx="132" cy="110" r="9" fill="#ff4b4b"/>
    <path d="M94 110 Q100 116 106 110" stroke="#3a1420" stroke-width="2.6" fill="none"/>
    <path d="M60 104 L40 100 M60 110 L38 112 M140 104 L160 100 M140 110 L162 112" stroke="#6b4a00" stroke-width="1.8"/>`;

  D.brotinho = G => `
    <radialGradient id="${G('b')}" cx="40%" cy="35%"><stop offset="0" stop-color="#d4ff9c"/><stop offset="1" stop-color="#3fb54a"/></radialGradient>
    ${shadow(178, 42)}
    <path d="M78 168 Q70 180 60 178 M100 170 L100 182 M122 168 Q130 180 140 178" stroke="#7a5230" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="128" r="44" fill="url(#${G('b')})"/>
    <path d="M100 86 Q96 66 100 52" stroke="#2e8a2e" stroke-width="5" fill="none"/>
    ${leaf(100, 54, 1.5, -150, '#5ed45a', '#2e8a2e')}${leaf(100, 54, 1.5, -30, '#7ee86a', '#2e8a2e')}
    <circle cx="100" cy="50" r="6" fill="#ff8fc8"/>
    ${eyes(100, 124, 16, 9, '#1f5a1a')}${smile(100, 142, 7)}${blush(100, 138, 27)}
    ${spark(40, 70, 6, '#eaffb0')}${spark(165, 95, 5, '#eaffb0')}`;

  D.sapo_toxico = G => `
    <radialGradient id="${G('b')}" cx="45%" cy="30%"><stop offset="0" stop-color="#c58cff"/><stop offset="1" stop-color="#5a1fa0"/></radialGradient>
    ${shadow(178, 60)}
    <ellipse cx="60" cy="166" rx="22" ry="10" fill="#4a1885"/><ellipse cx="140" cy="166" rx="22" ry="10" fill="#4a1885"/>
    <ellipse cx="100" cy="128" rx="62" ry="44" fill="url(#${G('b')})"/>
    <circle cx="70" cy="84" r="22" fill="url(#${G('b')})"/><circle cx="130" cy="84" r="22" fill="url(#${G('b')})"/>
    ${eye(70, 82, 13, '#b6ff2a')}${eye(130, 82, 13, '#b6ff2a')}
    <circle cx="70" cy="132" r="7" fill="#b6ff2a"/><circle cx="138" cy="140" r="9" fill="#b6ff2a"/><circle cx="104" cy="152" r="5" fill="#b6ff2a"/><circle cx="56" cy="112" r="4" fill="#b6ff2a"/>
    <path d="M60 116 Q100 140 140 116" stroke="#2a0a50" stroke-width="3.5" fill="none"/>
    <path d="M104 126 Q130 150 160 140 Q172 136 168 126" stroke="#ff4f8a" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${bubble(170, 60, 8, '#b6ff2a')}${bubble(30, 80, 6, '#b6ff2a')}`;

  D.parafuso = G => `
    <linearGradient id="${G('b')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#6b7a90"/></linearGradient>
    ${shadow(180, 50)}
    <rect x="70" y="160" width="20" height="18" rx="4" fill="#4a5568"/><rect x="110" y="160" width="20" height="18" rx="4" fill="#4a5568"/>
    <rect x="58" y="112" width="84" height="54" rx="10" fill="url(#${G('b')})" stroke="#3a4558" stroke-width="3"/>
    <circle cx="100" cy="138" r="12" fill="#ffb020" stroke="#3a4558" stroke-width="3"/><path d="M93 138 L107 138 M100 131 L100 145" stroke="#3a4558" stroke-width="3"/>
    <rect x="34" y="118" width="22" height="12" rx="6" fill="#8e9bb0"/><circle cx="32" cy="124" r="9" fill="#6b7a90"/>
    <rect x="144" y="118" width="22" height="12" rx="6" fill="#8e9bb0"/><circle cx="168" cy="124" r="9" fill="#6b7a90"/>
    <rect x="56" y="42" width="88" height="66" rx="14" fill="url(#${G('b')})" stroke="#3a4558" stroke-width="3"/>
    <rect x="66" y="54" width="68" height="40" rx="8" fill="#0d1b2a"/>
    <rect x="76" y="64" width="16" height="12" rx="3" fill="#4ff0ff"/><rect x="108" y="64" width="16" height="12" rx="3" fill="#4ff0ff"/>
    <path d="M84 84 L116 84" stroke="#4ff0ff" stroke-width="3" stroke-linecap="round"/>
    <line x1="100" y1="42" x2="100" y2="24" stroke="#3a4558" stroke-width="4"/>${bolt(96, 8, 0.7, '#ffd60a')}
    <circle cx="62" cy="48" r="3" fill="#3a4558"/><circle cx="138" cy="48" r="3" fill="#3a4558"/><circle cx="62" cy="102" r="3" fill="#3a4558"/><circle cx="138" cy="102" r="3" fill="#3a4558"/>`;

  D.raposa_nivea = G => {
    let tails = '';
    for (let i = 0; i < 5; i++) {
      const r = -60 + i * 30;
      tails += `<g transform="rotate(${r} 100 150)"><path d="M100 150 C82 110 86 70 100 48 C114 70 118 110 100 150Z" fill="#f2fbff" stroke="#9fdcff" stroke-width="2"/><path d="M100 48 C94 60 94 70 100 76 C106 70 106 60 100 48Z" fill="#5fd4ff"/></g>`;
    }
    return `${shadow(180, 48)}${tails}
    <radialGradient id="${G('b')}" cx="40%" cy="35%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bfe8ff"/></radialGradient>
    <ellipse cx="100" cy="150" rx="32" ry="26" fill="url(#${G('b')})"/>
    <path d="M62 96 L66 52 L92 84Z" fill="#fff" stroke="#9fdcff" stroke-width="2"/><path d="M68 88 L70 62 L84 82Z" fill="#7fd8ff"/>
    <path d="M138 96 L134 52 L108 84Z" fill="#fff" stroke="#9fdcff" stroke-width="2"/><path d="M132 88 L130 62 L116 82Z" fill="#7fd8ff"/>
    <path d="M60 100 Q100 64 140 100 Q130 132 100 140 Q70 132 60 100Z" fill="url(#${G('b')})"/>
    ${eyes(100, 104, 16, 7.5, '#1593d6')}
    <circle cx="100" cy="126" r="4" fill="#2a2a4a"/><path d="M94 130 Q100 134 106 130" stroke="#2a2a4a" stroke-width="2" fill="none"/>
    ${snow(36, 50, 8, '#e6fbff')}${snow(166, 42, 6, '#e6fbff')}${snow(160, 170, 5, '#e6fbff')}`;
  };

  D.mariposa_lume = G => `
    <radialGradient id="${G('w')}" cx="50%" cy="50%"><stop offset="0" stop-color="#fff6c2"/><stop offset=".7" stop-color="#ffc83d"/><stop offset="1" stop-color="#c77a00"/></radialGradient>
    <circle cx="100" cy="100" r="70" fill="#ffe680" opacity=".25" filter="url(#BL)"/>
    <path d="M100 96 C70 40 20 40 22 80 C24 112 70 116 100 104Z" fill="url(#${G('w')})" stroke="#8a5200" stroke-width="2"/>
    <path d="M100 96 C130 40 180 40 178 80 C176 112 130 116 100 104Z" fill="url(#${G('w')})" stroke="#8a5200" stroke-width="2"/>
    <path d="M100 106 C70 120 44 150 62 166 C80 178 96 140 100 116Z" fill="url(#${G('w')})" stroke="#8a5200" stroke-width="2"/>
    <path d="M100 106 C130 120 156 150 138 166 C120 178 104 140 100 116Z" fill="url(#${G('w')})" stroke="#8a5200" stroke-width="2"/>
    <circle cx="56" cy="76" r="13" fill="#8a3ad6"/><circle cx="56" cy="76" r="7" fill="#fff6c2"/><circle cx="144" cy="76" r="13" fill="#8a3ad6"/><circle cx="144" cy="76" r="7" fill="#fff6c2"/>
    <ellipse cx="100" cy="120" rx="12" ry="34" fill="#fff3d0"/>
    <path d="M94 76 Q80 40 64 36 M106 76 Q120 40 136 36" stroke="#8a5200" stroke-width="2.5" fill="none"/>
    <circle cx="100" cy="82" r="16" fill="#fff3d0"/>
    ${eyes(100, 82, 7, 5, '#c77a00')}
    ${spark(30, 140, 5, '#fffbe0')}${spark(170, 140, 6, '#fffbe0')}${spark(100, 30, 5, '#fffbe0')}`;

  D.gato_sombrio = G => `
    ${shadow(180, 50)}
    <path d="M140 160 C180 150 186 110 160 96 C150 92 146 100 152 106 C166 116 160 140 136 146" fill="#2a1450"/>
    <path d="M150 104 C160 96 175 98 172 110" stroke="#a46bff" stroke-width="3" fill="none" opacity=".6"/>
    <path d="M58 176 C52 130 62 104 100 100 C138 104 148 130 142 176Z" fill="#1b0b33"/>
    <path d="M62 82 L58 34 L90 64Z" fill="#1b0b33"/><path d="M138 82 L142 34 L110 64Z" fill="#1b0b33"/>
    <path d="M66 72 L64 46 L82 64Z" fill="#7c3aed"/><path d="M134 72 L136 46 L118 64Z" fill="#7c3aed"/>
    <ellipse cx="100" cy="88" rx="44" ry="38" fill="#1b0b33"/>
    ${glowEye(82, 86, 9, 7, '#ffd84d')}${glowEye(118, 86, 9, 7, '#ffd84d')}
    <ellipse cx="82" cy="86" rx="2" ry="6" fill="#1b0b33"/><ellipse cx="118" cy="86" rx="2" ry="6" fill="#1b0b33"/>
    <path d="M96 102 L100 106 L104 102" stroke="#a46bff" stroke-width="2" fill="none"/>
    <path d="M60 100 L30 96 M60 106 L32 112 M140 100 L170 96 M140 106 L168 112" stroke="#a46bff" stroke-width="1.5" opacity=".7"/>`;

  D.fogo_fatuo = G => `
    <radialGradient id="${G('o')}" cx="45%" cy="40%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffb0f4"/><stop offset="1" stop-color="#ff2fd8"/></radialGradient>
    <circle cx="100" cy="104" r="62" fill="#ff2fd8" opacity=".3" filter="url(#BL)"/>
    <path d="M60 96 C56 60 74 52 70 30 C88 44 86 60 92 66 C94 46 104 34 104 18 C118 36 116 56 116 64 C124 52 132 50 136 36 C148 58 144 80 140 96Z" fill="#ff6fe6"/>
    <circle cx="100" cy="110" r="44" fill="url(#${G('o')})"/>
    <ellipse cx="100" cy="112" rx="72" ry="16" fill="none" stroke="#ffb0f4" stroke-width="3" transform="rotate(-18 100 112)"/>
    <circle cx="36" cy="128" r="6" fill="#fff" transform="rotate(-18 100 112)"/>
    ${eyes(100, 108, 14, 7, '#a0007a')}<path d="M92 126 Q100 132 108 126" stroke="#6a0050" stroke-width="2.5" fill="none"/>
    ${spark(160, 40, 7, '#ffd0fa')}${spark(40, 50, 5, '#ffd0fa')}`;

  D.cavaleiro_coral = G => `
    <linearGradient id="${G('a')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd8ff"/><stop offset="1" stop-color="#1f5fbf"/></linearGradient>
    ${shadow(182, 52)}
    <line x1="156" y1="40" x2="146" y2="180" stroke="#c9a36a" stroke-width="5"/>
    <path d="M156 20 L150 46 M144 26 L148 48 M168 28 L154 48" stroke="#ffd36a" stroke-width="5" stroke-linecap="round"/>
    <path d="M70 120 L130 120 L136 176 L64 176Z" fill="url(#${G('a')})" stroke="#0c3a7a" stroke-width="3"/>
    <path d="M44 112 C40 140 52 162 72 170 C88 160 92 136 88 112 Q66 104 44 112Z" fill="#ff8a6a" stroke="#a83a2a" stroke-width="3"/>
    <path d="M52 122 Q66 118 80 122 M54 136 Q66 132 80 136 M58 150 Q68 146 78 150" stroke="#a83a2a" stroke-width="2" fill="none"/>
    <path d="M60 70 Q100 30 140 70 L138 112 Q100 126 62 112Z" fill="url(#${G('a')})" stroke="#0c3a7a" stroke-width="3"/>
    <rect x="72" y="80" width="56" height="12" rx="6" fill="#06203f"/>
    ${glowEye(88, 86, 5, 3, '#7fffea')}${glowEye(112, 86, 5, 3, '#7fffea')}
    <path d="M100 42 L96 18 M100 42 L110 22 M96 30 L86 20 M108 30 L118 26" stroke="#ff6a5a" stroke-width="5" stroke-linecap="round"/>`;

  D.rochoso = G => `
    <linearGradient id="${G('s')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3b072"/><stop offset="1" stop-color="#8a5a2c"/></linearGradient>
    ${shadow(178, 64)}
    <path d="M36 160 C36 90 80 58 120 62 C160 66 176 110 170 160Z" fill="url(#${G('s')})" stroke="#5a3a1a" stroke-width="3"/>
    <path d="M58 160 C60 104 86 76 114 72 M84 160 C88 112 110 84 134 82 M114 160 C118 120 136 98 156 100" stroke="#5a3a1a" stroke-width="3" fill="none"/>
    <circle cx="80" cy="96" r="4" fill="#5a3a1a" opacity=".6"/><circle cx="130" cy="120" r="4" fill="#5a3a1a" opacity=".6"/>
    <path d="M30 150 C14 146 10 122 24 112 C36 104 52 116 50 136Z" fill="#d9a066" stroke="#5a3a1a" stroke-width="3"/>
    <path d="M14 112 L6 98 L22 106Z" fill="#d9a066"/>
    ${eye(28, 126, 6, '#3a2010')}
    <path d="M18 140 Q26 144 34 140" stroke="#3a2010" stroke-width="2" fill="none"/>
    <ellipse cx="60" cy="166" rx="12" ry="7" fill="#8a5a2c"/><ellipse cx="146" cy="166" rx="12" ry="7" fill="#8a5a2c"/>
    <path d="M150 50 l6 -10 l6 10 M170 70 l8 -6 l2 10" stroke="#e3b072" stroke-width="3" fill="none"/>`;

  D.tique_taque = G => {
    let ticks = '';
    for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; ticks += `<line x1="${100 + Math.cos(a) * 40}" y1="${108 + Math.sin(a) * 40}" x2="${100 + Math.cos(a) * 46}" y2="${108 + Math.sin(a) * 46}" stroke="#0a4f48" stroke-width="${i % 3 ? 2 : 4}"/>`; }
    return `${shadow(180, 44)}
    ${gear(62, 52, 20, '#11b5a4')}${gear(140, 50, 16, '#7fe8da')}
    <path d="M80 150 L72 176 M120 150 L128 176" stroke="#0a4f48" stroke-width="6" stroke-linecap="round"/>
    <circle cx="100" cy="108" r="56" fill="#c69a3c" stroke="#7a5a1c" stroke-width="4"/>
    <circle cx="100" cy="108" r="48" fill="#f6fff9"/>${ticks}
    ${eyes(100, 102, 16, 8, '#11b5a4')}
    <line x1="100" y1="108" x2="100" y2="72" stroke="#0a4f48" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    <line x1="100" y1="108" x2="128" y2="118" stroke="#d6402a" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    ${smile(100, 126, 7)}
    <path d="M44 108 Q30 100 24 84 M156 108 Q170 100 176 84" stroke="#0a4f48" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  };

  D.aqua_phantom = G => `
    <linearGradient id="${G('g')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff0ff" stop-opacity=".95"/><stop offset="1" stop-color="#1f7bff" stop-opacity=".25"/></linearGradient>
    <circle cx="100" cy="90" r="64" fill="#1f7bff" opacity=".25" filter="url(#BL)"/>
    <path d="M52 92 C48 44 76 22 100 22 C124 22 152 44 148 92 L156 180 Q142 166 130 180 Q118 166 106 182 Q94 166 82 182 Q70 166 58 180 Q50 168 44 178Z" fill="url(#${G('g')})"/>
    <path d="M60 92 C58 54 80 36 100 36 C120 36 142 54 140 92 C130 108 70 108 60 92Z" fill="#06203f"/>
    ${glowEye(84, 78, 8, 10, '#7fffea')}${glowEye(116, 78, 8, 10, '#7fffea')}
    <path d="M90 98 Q100 104 110 98" stroke="#7fffea" stroke-width="2" fill="none"/>
    <path d="M150 110 C168 120 172 140 160 150" stroke="#bff0ff" stroke-width="3" fill="none"/>
    <rect x="152" y="140" width="16" height="22" rx="4" fill="#ffd36a" opacity=".85"/><circle cx="160" cy="151" r="5" fill="#fff"/>
    ${bubble(36, 60, 6, '#bff0ff')}${bubble(40, 130, 4, '#bff0ff')}${bubble(170, 60, 5, '#bff0ff')}
    <path d="M68 140 Q100 150 132 140" stroke="#bff0ff" stroke-width="2" fill="none" opacity=".6"/>`;

  D.tempestrix = G => `
    <linearGradient id="${G('w')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d4fff0"/><stop offset="1" stop-color="#1a9a74"/></linearGradient>
    <path d="M100 100 C70 70 30 50 6 60 C24 70 30 76 24 84 C40 84 44 92 36 100 C54 100 58 108 52 116 C70 112 82 112 100 116Z" fill="url(#${G('w')})"/>
    <path d="M100 100 C130 70 170 50 194 60 C176 70 170 76 176 84 C160 84 156 92 164 100 C146 100 142 108 148 116 C130 112 118 112 100 116Z" fill="url(#${G('w')})"/>
    <path d="M86 150 L72 186 L92 168 L100 190 L108 168 L128 186 L114 150Z" fill="#3fd6a0"/>
    <path d="M80 104 Q100 96 120 104 L116 156 L84 156Z" fill="#2fb88a"/>
    <circle cx="100" cy="76" r="24" fill="#ffe9d9"/>
    <path d="M76 70 Q74 40 100 40 Q126 40 124 70 Q118 52 100 54 Q82 52 76 70Z" fill="#0e7a55"/>
    <path d="M100 40 L94 16 L104 30 L110 12 L112 36" fill="#3fd6a0"/>
    ${eyes(100, 78, 9, 5.5, '#0e7a55')}<path d="M95 90 L100 94 L105 90" stroke="#a85a20" stroke-width="2.5" fill="#ffb020"/>
    <path d="M20 160 Q60 140 90 160 M110 170 Q150 150 190 165" stroke="#d4fff0" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;

  D.guardiao_espinhoso = G => `
    <linearGradient id="${G('t')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3a1a"/><stop offset=".5" stop-color="#8a5a30"/><stop offset="1" stop-color="#4a2e14"/></linearGradient>
    ${shadow(184, 60)}
    <circle cx="70" cy="50" r="30" fill="#2a9a3a"/><circle cx="130" cy="46" r="32" fill="#22b84f"/><circle cx="100" cy="30" r="30" fill="#3fcf5a"/>
    <circle cx="80" cy="36" r="5" fill="#ff5a8a"/><circle cx="124" cy="30" r="5" fill="#ff5a8a"/>
    <path d="M66 70 C60 110 56 150 50 182 L150 182 C144 150 140 110 134 70Z" fill="url(#${G('t')})"/>
    <path d="M80 90 Q84 130 78 170 M120 92 Q116 132 124 172 M100 120 Q98 150 102 176" stroke="#3a2410" stroke-width="2.5" fill="none"/>
    <path d="M66 100 C40 96 30 110 20 130 M134 100 C160 96 170 110 180 130" stroke="#6b4422" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M30 112 l-8 -6 M40 102 l-4 -10 M170 112 l8 -6 M160 102 l4 -10 M24 126 l-10 2 M176 126 l10 2" stroke="#d6ff7a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="100" cy="102" rx="26" ry="18" fill="#1a0e04"/>
    ${glowEye(88, 100, 6, 5, '#b4f07a')}${glowEye(112, 100, 6, 5, '#b4f07a')}
    <path d="M60 150 l-8 4 M140 150 l8 4 M70 130 l-8 -2 M130 130 l8 -2" stroke="#d6ff7a" stroke-width="3" stroke-linecap="round"/>`;

  D.samurai_ferro = G => `
    <linearGradient id="${G('a')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f8"/><stop offset="1" stop-color="#4a5568"/></linearGradient>
    ${shadow(184, 56)}
    <path d="M30 40 L170 170" stroke="#d9e2ef" stroke-width="5" stroke-linecap="round"/><path d="M30 40 L60 68" stroke="#fff" stroke-width="2"/>
    <rect x="148" y="150" width="30" height="10" rx="3" fill="#2a2f3a" transform="rotate(45 163 155)"/>
    <path d="M58 120 L142 120 L150 180 L50 180Z" fill="url(#${G('a')})" stroke="#2a2f3a" stroke-width="3"/>
    <path d="M58 136 L142 136 M56 152 L144 152 M54 166 L146 166" stroke="#2a2f3a" stroke-width="2.5"/>
    <path d="M40 112 L64 104 L66 140 L36 136Z" fill="#b83232" stroke="#2a2f3a" stroke-width="3"/><path d="M160 112 L136 104 L134 140 L164 136Z" fill="#b83232" stroke="#2a2f3a" stroke-width="3"/>
    <path d="M54 82 Q100 30 146 82 L150 96 L50 96Z" fill="url(#${G('a')})" stroke="#2a2f3a" stroke-width="3"/>
    <path d="M70 52 Q100 20 130 52 Q118 6 100 30 Q82 6 70 52Z" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/>
    <rect x="66" y="94" width="68" height="28" rx="6" fill="#0b0d12"/>
    ${glowEye(86, 106, 7, 3, '#ff4b4b')}${glowEye(114, 106, 7, 3, '#ff4b4b')}`;

  D.orbe_gravitacional = G => `
    <radialGradient id="${G('o')}" cx="38%" cy="35%"><stop offset="0" stop-color="#aab4ff"/><stop offset=".6" stop-color="#2d2a9a"/><stop offset="1" stop-color="#0a0828"/></radialGradient>
    <circle cx="100" cy="100" r="74" fill="#4b47e6" opacity=".25" filter="url(#BL)"/>
    <ellipse cx="100" cy="100" rx="86" ry="22" fill="none" stroke="#aab4ff" stroke-width="5" opacity=".5" transform="rotate(-20 100 100)"/>
    <circle cx="100" cy="100" r="48" fill="url(#${G('o')})"/>
    <path d="M14 116 A86 22 -20 0 0 186 84" stroke="#e0e4ff" stroke-width="5" fill="none" transform="rotate(0)" opacity=".9"/>
    ${eyes(100, 98, 15, 8, '#4b47e6')}<path d="M92 118 Q100 114 108 118" stroke="#e0e4ff" stroke-width="2.5" fill="none"/>
    <circle cx="30" cy="50" r="6" fill="#8a7dff"/><circle cx="170" cy="150" r="8" fill="#6a5cff"/><circle cx="160" cy="40" r="4" fill="#cfd4ff"/><circle cx="40" cy="160" r="3" fill="#cfd4ff"/>`;

  D.venom_beast = G => `
    <linearGradient id="${G('b')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a1a7a"/><stop offset="1" stop-color="#1a0630"/></linearGradient>
    ${shadow(182, 64)}
    <path d="M30 170 C26 120 50 92 90 86 L150 80 C176 86 184 120 172 170Z" fill="url(#${G('b')})"/>
    <path d="M60 92 L66 66 L76 90 L86 60 L96 88 L108 56 L116 86 L128 62 L134 86" fill="#7fcf12"/>
    <path d="M40 120 C30 80 60 50 100 56 C140 62 160 92 150 124 L130 140 L70 140Z" fill="url(#${G('b')})"/>
    ${glowEye(78, 96, 9, 6, '#d6ff3a')}${glowEye(124, 96, 9, 6, '#d6ff3a')}
    <path d="M60 118 Q100 150 140 118 L132 134 Q100 158 68 134Z" fill="#2a0010"/>
    <path d="M72 124 L76 136 L80 126 M90 130 L94 144 L98 132 M104 132 L108 144 L112 130 M122 126 L126 136 L130 124" fill="#fff"/>
    <path d="M92 146 Q90 160 94 168" stroke="#b6ff2a" stroke-width="4" stroke-linecap="round"/><circle cx="94" cy="172" r="4" fill="#b6ff2a"/>
    <path d="M118 144 Q120 154 116 160" stroke="#b6ff2a" stroke-width="3" stroke-linecap="round"/>
    ${bubble(170, 50, 7, '#b6ff2a')}${bubble(28, 64, 5, '#b6ff2a')}`;

  D.arqueira_glacial = G => `
    <linearGradient id="${G('c')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6fbff"/><stop offset="1" stop-color="#3aa0d6"/></linearGradient>
    ${shadow(184, 48)}
    <path d="M150 26 Q190 100 150 174" stroke="#9fe8ff" stroke-width="7" fill="none" stroke-linecap="round"/>
    <line x1="150" y1="26" x2="150" y2="174" stroke="#e6fbff" stroke-width="1.5"/>
    <path d="M72 116 L128 116 L138 184 L62 184Z" fill="url(#${G('c')})"/>
    <path d="M60 60 Q100 20 140 60 L146 130 Q100 116 54 130Z" fill="#1f5f8a"/>
    <circle cx="100" cy="82" r="26" fill="#ffe9d9"/>
    <path d="M74 80 Q76 50 100 50 Q124 50 126 80 Q118 64 100 66 Q82 64 74 80Z" fill="#e6fbff"/>
    ${eyes(100, 86, 10, 6, '#1593d6')}<path d="M95 100 Q100 103 105 100" stroke="#a83a4a" stroke-width="2" fill="none"/>
    <path d="M40 104 L160 104" stroke="#cfefff" stroke-width="3"/><path d="M28 104 L44 96 L40 104 L44 112Z" fill="#9fe8ff"/>
    <path d="M156 104 l8 -6 M156 104 l8 6" stroke="#e6fbff" stroke-width="3"/>
    ${snow(34, 40, 7, '#e6fbff')}${snow(40, 160, 5, '#e6fbff')}`;

  D.volt_dragon = G => `
    <linearGradient id="${G('s')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset=".5" stop-color="#ffcf0a"/><stop offset="1" stop-color="#b37a00"/></linearGradient>
    <path d="M100 110 C60 70 20 70 8 40 C30 46 40 40 46 30 C56 50 70 50 80 40 C84 64 96 80 100 90Z" fill="#3a2f8a" opacity=".85"/>
    <path d="M100 110 C140 70 180 70 192 40 C170 46 160 40 154 30 C144 50 130 50 120 40 C116 64 104 80 100 90Z" fill="#3a2f8a" opacity=".85"/>
    <path d="M60 190 C60 150 70 120 100 110 C130 120 140 150 140 190Z" fill="url(#${G('s')})"/>
    <path d="M86 130 L114 130 M84 146 L116 146 M84 162 L116 162" stroke="#b37a00" stroke-width="3"/>
    <path d="M64 92 C60 60 80 46 100 46 C120 46 140 60 136 92 C134 118 118 128 100 128 C82 128 66 118 64 92Z" fill="url(#${G('s')})"/>
    ${bolt(62, 14, 1.3, '#4ff0ff')}${bolt(126, 14, 1.3, '#4ff0ff')}
    ${glowEye(82, 86, 8, 5, '#4ff0ff')}${glowEye(118, 86, 8, 5, '#4ff0ff')}
    <path d="M80 112 Q100 122 120 112" stroke="#5a3a00" stroke-width="3" fill="none"/>
    <path d="M84 114 L88 120 M112 114 L116 120" stroke="#fff" stroke-width="3"/>
    <circle cx="90" cy="102" r="3" fill="#5a3a00"/><circle cx="110" cy="102" r="3" fill="#5a3a00"/>
    ${bolt(20, 120, 1.5, '#fff6a8')}${bolt(168, 110, 1.3, '#fff6a8')}`;

  D.shadow_ninja = G => `
    ${shadow(184, 46)}
    <path d="M110 74 C150 70 180 50 196 60 C176 72 170 84 140 92" fill="#7c3aed"/>
    <path d="M70 116 L130 116 L140 186 L60 186Z" fill="#1b0b33"/>
    <path d="M70 120 L130 150 M130 120 L70 150" stroke="#7c3aed" stroke-width="5"/>
    <circle cx="100" cy="82" r="34" fill="#1b0b33"/>
    <rect x="66" y="70" width="68" height="20" rx="4" fill="#2a1450"/>
    <path d="M66 74 L134 74" stroke="#7c3aed" stroke-width="4"/>
    ${glowEye(86, 82, 7, 3.5, '#c4a1ff')}${glowEye(114, 82, 7, 3.5, '#c4a1ff')}
    <path d="M78 76 L94 80 M122 76 L106 80" stroke="#c4a1ff" stroke-width="2.5"/>
    <path d="M30 150 L56 130 L50 136 L62 136Z" fill="#c4c9d4"/><path d="M24 156 L44 140" stroke="#5a5a6a" stroke-width="4"/>
    <path d="M160 140 L182 120 L176 128 L186 128Z" fill="#c4c9d4"/>
    <path d="M20 40 Q40 30 30 14 Q52 24 44 46Z" fill="#e8deff" opacity=".8"/>`;

  D.terra_golem = G => `
    <linearGradient id="${G('r')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c58b52"/><stop offset="1" stop-color="#5a3a1a"/></linearGradient>
    ${shadow(186, 80)}
    <path d="M40 72 L74 58 L126 58 L160 72 L170 130 L146 150 L54 150 L30 130Z" fill="url(#${G('r')})" stroke="#3a2410" stroke-width="3"/>
    <path d="M24 80 L44 70 L50 150 L36 176 L14 168 L10 120Z" fill="url(#${G('r')})" stroke="#3a2410" stroke-width="3"/>
    <path d="M176 80 L156 70 L150 150 L164 176 L186 168 L190 120Z" fill="url(#${G('r')})" stroke="#3a2410" stroke-width="3"/>
    <rect x="60" y="148" width="30" height="34" rx="4" fill="#6b4422" stroke="#3a2410" stroke-width="3"/><rect x="110" y="148" width="30" height="34" rx="4" fill="#6b4422" stroke="#3a2410" stroke-width="3"/>
    <path d="M78 30 L122 30 L130 58 L70 58Z" fill="url(#${G('r')})" stroke="#3a2410" stroke-width="3"/>
    ${glowEye(88, 44, 5, 3, '#ffb84d')}${glowEye(112, 44, 5, 3, '#ffb84d')}
    <path d="M100 82 L116 100 L100 124 L84 100Z" fill="#4fffc8" stroke="#0a6a4a" stroke-width="2"/><path d="M100 82 L108 100 L100 124" fill="#b9fff0" opacity=".6"/>
    <path d="M56 90 L66 104 L58 118 M144 90 L134 104 L142 118" stroke="#ffb84d" stroke-width="3" fill="none" opacity=".8"/>
    <circle cx="74" cy="66" r="6" fill="#4caf50"/><circle cx="130" cy="64" r="5" fill="#4caf50"/>`;

  D.serafim_aurora = G => {
    let wings = '';
    [[-50, 30], [-25, 22], [0, 16]].forEach(([r, l], i) => {
      wings += `<path d="M100 100 C${80 - l} ${70 - i * 6} ${40 - l} ${60 - i * 10} ${14 + i * 6} ${76 - i * 18 + 6} C${36} ${96} ${60} ${104} 100 110Z" fill="#fffbe0" opacity="${0.95 - i * 0.2}" stroke="#ffd84d" stroke-width="1.5" transform="rotate(${r / 3} 100 100)"/>`;
    });
    const mirror = wings.replace(/transform="rotate\(([-\d.]+) 100 100\)"/g, (m, a) => `transform="translate(200 0) scale(-1 1) rotate(${a} 100 100)"`);
    return `<circle cx="100" cy="90" r="76" fill="#ffd84d" opacity=".25" filter="url(#BL)"/>
    ${wings}${mirror}
    <ellipse cx="100" cy="38" rx="28" ry="8" fill="none" stroke="#ffe680" stroke-width="5"/>
    <path d="M78 110 L122 110 L138 186 L62 186Z" fill="#fffdf2" stroke="#ffd84d" stroke-width="2"/>
    <path d="M100 112 L100 186" stroke="#ffd84d" stroke-width="2"/>
    <circle cx="100" cy="82" r="24" fill="#ffe9d9"/>
    <path d="M74 84 Q72 52 100 52 Q128 52 126 84 L130 120 Q120 100 122 84 Q114 64 100 64 Q86 64 78 84 Q80 100 70 120Z" fill="#ffd84d"/>
    ${eyes(100, 86, 9, 5.5, '#c77a00')}${smile(100, 98, 4)}
    ${spark(100, 140, 10, '#fff')}${spark(30, 170, 5, '#fffbe0')}${spark(170, 170, 5, '#fffbe0')}`;
  };

  D.lanceiro_plasma = G => `
    <linearGradient id="${G('l')}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ff2fd8"/><stop offset="1" stop-color="#fff"/></linearGradient>
    ${shadow(184, 52)}
    <path d="M30 180 L176 24" stroke="#6a1a5e" stroke-width="7" stroke-linecap="round"/>
    <path d="M150 52 L188 10 L172 58Z" fill="url(#${G('l')})"/><circle cx="176" cy="30" r="20" fill="#ff2fd8" opacity=".35" filter="url(#BL)"/>
    <path d="M66 112 L134 112 L142 186 L58 186Z" fill="#3a0a36" stroke="#ff2fd8" stroke-width="2"/>
    <path d="M100 116 L112 140 L100 166 L88 140Z" fill="#ff6fe6"/><circle cx="100" cy="140" r="8" fill="#fff"/>
    <path d="M46 108 L70 100 L72 130 L44 128Z" fill="#5a1a52" stroke="#ff2fd8" stroke-width="2"/><path d="M154 108 L130 100 L128 130 L156 128Z" fill="#5a1a52" stroke="#ff2fd8" stroke-width="2"/>
    <path d="M64 80 Q64 44 100 42 Q136 44 136 80 L130 106 L70 106Z" fill="#5a1a52" stroke="#ff2fd8" stroke-width="2"/>
    <path d="M70 76 L130 76 L126 92 L74 92Z" fill="#ff6fe6"/><path d="M74 82 L126 82" stroke="#fff" stroke-width="3"/>
    <path d="M100 42 L92 20 L100 28 L108 14 L108 42" fill="#ff2fd8"/>`;

  D.rainha_esporo = G => `
    <radialGradient id="${G('c')}" cx="50%" cy="80%" r="70%"><stop offset="0" stop-color="#ff7ad9"/><stop offset="1" stop-color="#7b1fa2"/></radialGradient>
    ${shadow(186, 56)}
    <path d="M70 118 Q100 106 130 118 L156 186 L44 186Z" fill="#5a2a8a"/>
    <path d="M60 150 Q100 140 140 150 M54 168 Q100 158 146 168" stroke="#b6ff2a" stroke-width="2" fill="none" opacity=".7"/>
    <circle cx="100" cy="96" r="22" fill="#e9f7d6"/>
    <path d="M24 82 C24 40 60 20 100 20 C140 20 176 40 176 82 C150 72 50 72 24 82Z" fill="url(#${G('c')})"/>
    <circle cx="60" cy="50" r="8" fill="#fff" opacity=".85"/><circle cx="100" cy="36" r="6" fill="#fff" opacity=".85"/><circle cx="140" cy="52" r="9" fill="#fff" opacity=".85"/><circle cx="82" cy="62" r="4" fill="#fff" opacity=".85"/><circle cx="122" cy="64" r="4" fill="#fff" opacity=".85"/>
    ${eyes(100, 98, 9, 5, '#7fcf12')}<path d="M95 110 Q100 113 105 110" stroke="#7b1fa2" stroke-width="2" fill="none"/>
    <path d="M40 120 Q30 140 40 156 M160 120 Q170 140 160 156" stroke="#7b1fa2" stroke-width="3" fill="none"/>
    ${bubble(30, 130, 4, '#e2ff8f')}${bubble(170, 110, 5, '#e2ff8f')}${bubble(150, 150, 3, '#e2ff8f')}${bubble(46, 104, 3, '#e2ff8f')}`;

  D.inferno_rex = G => `
    <linearGradient id="${G('m')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a1a0a"/><stop offset="1" stop-color="#1a0602"/></linearGradient>
    <circle cx="100" cy="80" r="80" fill="#ff5a1f" opacity=".3" filter="url(#BL)"/>
    ${flame(60, 70, 1.6, '#ff3d00', '#ffd36a')}${flame(100, 56, 2, '#ff5a1f', '#ffe08a')}${flame(140, 70, 1.6, '#ff3d00', '#ffd36a')}
    <path d="M20 40 L40 30 L60 120 L50 124Z" fill="#9aa6b8"/><path d="M10 30 Q30 10 54 26 L44 52 Q24 44 10 30Z" fill="#c4ccd8" stroke="#4a5568" stroke-width="2"/>
    <path d="M44 120 C40 104 60 96 100 96 C140 96 160 104 156 120 L150 186 L50 186Z" fill="url(#${G('m')})"/>
    <path d="M70 120 L84 140 L74 160 M130 120 L116 140 L126 160 M100 130 L100 170" stroke="#ff8a2a" stroke-width="3" fill="none"/>
    <path d="M62 54 L50 26 L76 48Z" fill="#2a0a02"/><path d="M138 54 L150 26 L124 48Z" fill="#2a0a02"/>
    <path d="M66 70 Q66 44 100 44 Q134 44 134 70 L130 104 Q100 118 70 104Z" fill="url(#${G('m')})"/>
    ${glowEye(86, 74, 8, 4, '#ffcf0a')}${glowEye(114, 74, 8, 4, '#ffcf0a')}
    <path d="M84 96 L116 96" stroke="#ff8a2a" stroke-width="3"/><path d="M78 60 L94 66 M122 60 L106 66" stroke="#ff8a2a" stroke-width="3"/>`;

  D.solar_titan = G => {
    let rays = '';
    for (let i = 0; i < 16; i++) { const a = Math.PI * 2 * i / 16; rays += `<path d="M${100 + Math.cos(a - 0.08) * 46} ${68 + Math.sin(a - 0.08) * 46} L${100 + Math.cos(a) * 78} ${68 + Math.sin(a) * 78} L${100 + Math.cos(a + 0.08) * 46} ${68 + Math.sin(a + 0.08) * 46}Z" fill="#ffd84d" opacity=".75"/>`; }
    return `<radialGradient id="${G('s')}"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#ffe680"/><stop offset="1" stop-color="#ff9a1a"/></radialGradient>
    ${rays}<circle cx="100" cy="68" r="46" fill="url(#${G('s')})"/>
    <path d="M30 186 C30 140 50 110 100 106 C150 110 170 140 170 186Z" fill="#c78a1a" stroke="#7a4a00" stroke-width="3"/>
    <circle cx="100" cy="140" r="18" fill="url(#${G('s')})" stroke="#fff" stroke-width="3"/>
    <path d="M40 140 L20 176 M160 140 L180 176" stroke="#c78a1a" stroke-width="18" stroke-linecap="round"/>
    <circle cx="100" cy="74" r="26" fill="#ffd9a8"/>
    <path d="M76 66 L80 50 L90 60 L100 44 L110 60 L120 50 L124 66Z" fill="#ffc21a" stroke="#7a4a00" stroke-width="2"/>
    ${glowEye(90, 76, 5, 3, '#fff')}${glowEye(110, 76, 5, 3, '#fff')}
    <path d="M92 90 Q100 94 108 90" stroke="#7a4a00" stroke-width="2.5" fill="none"/>`;
  };

  D.chronos = G => `
    <circle cx="100" cy="74" r="62" fill="none" stroke="#a6fff2" stroke-width="3" opacity=".6"/>
    <circle cx="100" cy="74" r="52" fill="none" stroke="#11b5a4" stroke-width="1.5" stroke-dasharray="4 6" opacity=".7"/>
    <path d="M100 74 L100 30 M100 74 L132 90" stroke="#a6fff2" stroke-width="3" opacity=".7"/>
    <line x1="160" y1="40" x2="160" y2="186" stroke="#8a6a3a" stroke-width="6"/>
    <path d="M146 28 L174 28 L162 44 L174 60 L146 60 L158 44Z" fill="#ffe7b0" stroke="#8a6a3a" stroke-width="3"/><path d="M152 32 L168 32 L160 42Z M152 56 L168 56 L160 48Z" fill="#ffc21a"/>
    <path d="M56 120 Q100 100 144 120 L156 186 L44 186Z" fill="#0d6b62"/>
    <path d="M70 130 Q100 120 130 130 M64 150 Q100 140 136 150" stroke="#a6fff2" stroke-width="2" fill="none"/>
    <circle cx="100" cy="82" r="24" fill="#f2d6c0"/>
    <path d="M70 76 Q70 40 100 40 Q130 40 130 76 Q124 56 100 56 Q76 56 70 76Z" fill="#0d6b62"/>
    <path d="M78 92 Q76 140 100 154 Q124 140 122 92 Q112 104 100 102 Q88 104 78 92Z" fill="#f2f2f2"/>
    <path d="M84 80 Q90 76 96 80 M104 80 Q110 76 116 80" stroke="#2a2a2a" stroke-width="2.5" fill="none"/>
    ${glowEye(90, 84, 3, 2, '#11b5a4')}${glowEye(110, 84, 3, 2, '#11b5a4')}
    <path d="M86 70 L96 74 M114 70 L104 74" stroke="#e8e8e8" stroke-width="4" stroke-linecap="round"/>
    ${gear(36, 160, 14, '#11b5a4')}`;

  D.valquiria_vendaval = G => `
    <linearGradient id="${G('c')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fd6a0"/><stop offset="1" stop-color="#0a5a44"/></linearGradient>
    ${shadow(186, 50)}
    <path d="M66 110 C30 130 20 170 40 190 L160 190 C180 170 170 130 134 110Z" fill="url(#${G('c')})"/>
    <line x1="164" y1="16" x2="140" y2="186" stroke="#c4ccd8" stroke-width="5"/><path d="M164 6 L172 30 L158 30Z" fill="#eef2f8"/>
    <path d="M74 112 L126 112 L132 170 L68 170Z" fill="#c4ccd8" stroke="#4a5568" stroke-width="2"/>
    <circle cx="100" cy="82" r="24" fill="#ffe9d9"/>
    <path d="M76 86 C70 110 60 130 54 150 C70 130 80 118 84 96Z M124 86 C130 110 140 130 146 150 C130 130 120 118 116 96Z" fill="#ffe680"/>
    <path d="M72 76 Q72 50 100 50 Q128 50 128 76 L124 74 Q100 64 76 74Z" fill="#c4ccd8" stroke="#4a5568" stroke-width="2"/>
    <path d="M74 66 C50 50 40 40 34 24 C54 34 62 40 78 58Z" fill="#fff" stroke="#9fdcff" stroke-width="1.5"/>
    <path d="M126 66 C150 50 160 40 166 24 C146 34 138 40 122 58Z" fill="#fff" stroke="#9fdcff" stroke-width="1.5"/>
    ${eyes(100, 86, 9, 5.5, '#0e7a55')}<path d="M95 99 Q100 102 105 99" stroke="#a83a4a" stroke-width="2" fill="none"/>
    <path d="M10 120 Q40 100 70 112 M130 150 Q160 130 196 140" stroke="#d4fff0" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;

  D.frost_queen = G => `
    <linearGradient id="${G('g')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6fbff"/><stop offset="1" stop-color="#3a7bd5"/></linearGradient>
    <circle cx="100" cy="80" r="76" fill="#9be8ff" opacity=".25" filter="url(#BL)"/>
    <path d="M60 104 C30 150 20 180 20 192 L180 192 C180 180 170 150 140 104Z" fill="url(#${G('g')})"/>
    <path d="M100 110 L80 192 M100 110 L120 192 M100 110 L100 192" stroke="#fff" stroke-width="1.5" opacity=".6"/>
    <path d="M62 80 C50 120 40 140 36 168 C56 140 70 120 74 96Z M138 80 C150 120 160 140 164 168 C144 140 130 120 126 96Z" fill="#e6fbff"/>
    <circle cx="100" cy="78" r="24" fill="#eaf4ff"/>
    <path d="M74 74 Q72 48 100 48 Q128 48 126 74 Q118 60 100 60 Q82 60 74 74Z" fill="#fff"/>
    <path d="M70 52 L76 20 L86 44 L100 6 L114 44 L124 20 L130 52Z" fill="#bff0ff" stroke="#5fd4ff" stroke-width="2"/>
    <path d="M100 6 L100 44" stroke="#fff" stroke-width="2"/><circle cx="100" cy="40" r="5" fill="#5fd4ff"/>
    ${eyes(100, 82, 9, 5.5, '#1593d6')}<path d="M95 96 Q100 98 105 96" stroke="#5a7ab0" stroke-width="2" fill="none"/>
    <line x1="160" y1="60" x2="150" y2="180" stroke="#bff0ff" stroke-width="4"/>${snow(162, 56, 12, '#fff')}
    ${snow(30, 40, 6, '#fff')}${snow(40, 110, 4, '#fff')}`;

  D.gravitar = G => `
    <radialGradient id="${G('p')}" cx="40%" cy="35%"><stop offset="0" stop-color="#ffb08a"/><stop offset="1" stop-color="#7a2a5a"/></radialGradient>
    <linearGradient id="${G('s')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#aab4ff"/><stop offset="1" stop-color="#2d2a9a"/></linearGradient>
    <circle cx="100" cy="110" r="40" fill="url(#${G('p')})"/>
    <ellipse cx="100" cy="110" rx="66" ry="12" fill="none" stroke="#ffd6b0" stroke-width="3" opacity=".6"/>
    <path d="M20 150 C10 100 60 60 110 70 C160 80 190 120 160 150 C130 176 70 176 50 150 C34 130 60 100 100 104" stroke="url(#${G('s')})" stroke-width="20" fill="none" stroke-linecap="round"/>
    <path d="M20 150 C10 100 60 60 110 70 C160 80 190 120 160 150" stroke="#e0e4ff" stroke-width="3" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>
    <path d="M100 104 C110 100 130 92 142 60 C150 40 140 24 124 22 C104 20 94 40 104 54" fill="none" stroke="url(#${G('s')})" stroke-width="18" stroke-linecap="round"/>
    <ellipse cx="128" cy="30" rx="24" ry="18" fill="url(#${G('s')})"/>
    ${glowEye(120, 26, 5, 4, '#ff9cf0')}${glowEye(138, 26, 5, 4, '#ff9cf0')}
    <path d="M110 40 Q128 50 146 40" stroke="#0a0828" stroke-width="3" fill="none"/>
    <circle cx="40" cy="40" r="7" fill="#cfd4ff"/><circle cx="176" cy="72" r="5" fill="#ffd6b0"/><circle cx="170" cy="180" r="6" fill="#aab4ff"/>`;

  D.void_king = G => {
    let s = '';
    for (let i = 0; i < 9; i++) s += star(80 + (i * 17) % 40, 70 + (i * 13) % 34, 1.5 + (i % 3) * 0.8, '#fff', 0.85);
    return `<radialGradient id="${G('v')}" cx="50%" cy="45%"><stop offset="0" stop-color="#2a0a5a"/><stop offset="1" stop-color="#000"/></radialGradient>
    <circle cx="100" cy="90" r="80" fill="#8b5cf6" opacity=".3" filter="url(#BL)"/>
    <path d="M30 190 C30 140 50 116 100 112 C150 116 170 140 170 190Z" fill="#12052b" stroke="#8b5cf6" stroke-width="2"/>
    <path d="M60 130 C40 160 30 180 26 190 M140 130 C160 160 170 180 174 190" stroke="#ff9cf0" stroke-width="2" opacity=".6" fill="none"/>
    <path d="M100 116 L114 150 L100 190 L86 150Z" fill="#8b5cf6"/>
    <ellipse cx="100" cy="86" rx="32" ry="36" fill="url(#${G('v')})" stroke="#8b5cf6" stroke-width="2"/>${s}
    ${glowEye(88, 86, 7, 3, '#ff9cf0')}${glowEye(112, 86, 7, 3, '#ff9cf0')}
    <path d="M64 56 L70 20 L84 44 L100 10 L116 44 L130 20 L136 56Z" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/>
    <circle cx="100" cy="40" r="7" fill="#ff2e7e"/><circle cx="76" cy="46" r="4" fill="#8b5cf6"/><circle cx="124" cy="46" r="4" fill="#8b5cf6"/>
    ${star(30, 40, 6, '#ff9cf0', 0.9)}${star(172, 50, 5, '#fff', 0.9)}${star(166, 150, 4, '#ff9cf0', 0.8)}`;
  };

  D.prismora = G => `
    <linearGradient id="${G('r')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff4d6d"/><stop offset=".2" stop-color="#ffb020"/><stop offset=".4" stop-color="#ffe14d"/><stop offset=".6" stop-color="#3ddc84"/><stop offset=".8" stop-color="#3b8bff"/><stop offset="1" stop-color="#b05cff"/></linearGradient>
    <radialGradient id="${G('s')}" cx="45%" cy="40%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff6c2"/><stop offset="1" stop-color="#ffc83d"/></radialGradient>
    <path d="M0 170 Q60 120 100 110 Q60 140 20 200Z" fill="url(#${G('r')})" opacity=".8"/>
    <path d="M10 186 Q70 140 100 116" stroke="url(#${G('r')})" stroke-width="12" fill="none" opacity=".6" stroke-linecap="round"/>
    <circle cx="110" cy="96" r="70" fill="#fff6c2" opacity=".3" filter="url(#BL)"/>
    ${star(110, 96, 62, `url(#${G('s')})`)}
    ${eyes(110, 98, 13, 7.5, '#b05cff')}${smile(110, 116, 6)}${blush(110, 112, 22)}
    ${spark(40, 40, 8, '#fff')}${spark(176, 160, 7, '#fff')}${spark(170, 30, 5, '#ffd0fa')}${star(40, 120, 4, '#9cf5ff')}`;

  D.draco_jr = G => `
    <radialGradient id="${G('d')}" cx="40%" cy="35%"><stop offset="0" stop-color="#ffb06a"/><stop offset="1" stop-color="#c2290a"/></radialGradient>
    ${flame(40, 186, 1.5, '#ff3d00', '#ffd36a')}${flame(160, 186, 1.5, '#ff3d00', '#ffd36a')}
    <path d="M50 92 C30 70 20 50 30 36 C40 54 52 60 66 70Z" fill="#7a1a0a"/><path d="M150 92 C170 70 180 50 170 36 C160 54 148 60 134 70Z" fill="#7a1a0a"/>
    <circle cx="100" cy="100" r="46" fill="url(#${G('d')})"/>
    <path d="M70 66 L62 36 L84 58Z M130 66 L138 36 L116 58Z" fill="#ffe08a"/>
    ${eyes(100, 98, 17, 9, '#ffcf0a')}
    <path d="M84 120 Q100 130 116 120" stroke="#3a0a02" stroke-width="3" fill="#7a0a0a"/><path d="M90 122 L92 128 M110 122 L108 128" stroke="#fff" stroke-width="2.5"/>
    <path d="M40 140 L58 128 L70 142 L84 126 L100 144 L116 126 L130 142 L142 128 L160 140 L156 186 L44 186Z" fill="#fff4e0" stroke="#c9a36a" stroke-width="2.5"/>
    <path d="M60 160 L70 170 M120 156 L132 166" stroke="#c9a36a" stroke-width="2"/>
    <circle cx="160" cy="40" r="10" fill="#ff5a1f"/><circle cx="160" cy="40" r="5" fill="#ffd36a"/>`;

  D.arauto_vazio = G => `
    <radialGradient id="${G('p')}"><stop offset="0" stop-color="#000"/><stop offset=".7" stop-color="#2a0a5a"/><stop offset="1" stop-color="#ff9cf0"/></radialGradient>
    <ellipse cx="100" cy="100" rx="70" ry="78" fill="url(#${G('p')})" opacity=".9"/>
    <ellipse cx="100" cy="100" rx="70" ry="78" fill="none" stroke="#ff9cf0" stroke-width="2" stroke-dasharray="3 7"/>
    <path d="M58 186 L72 96 Q100 70 128 96 L142 186Z" fill="#1a0b3a" stroke="#8b5cf6" stroke-width="2"/>
    <path d="M70 100 Q72 54 100 50 Q128 54 130 100 Q100 90 70 100Z" fill="#1a0b3a" stroke="#8b5cf6" stroke-width="2"/>
    <ellipse cx="100" cy="86" rx="18" ry="14" fill="#000"/>
    ${glowEye(93, 86, 4, 2.5, '#ff9cf0')}${glowEye(107, 86, 4, 2.5, '#ff9cf0')}
    <path d="M118 120 L160 92 L176 104 L170 76 L156 84 L116 112Z" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/>
    <path d="M176 70 Q190 84 182 100" stroke="#ff9cf0" stroke-width="3" fill="none"/><path d="M184 62 Q200 84 190 108" stroke="#ff9cf0" stroke-width="2" fill="none" opacity=".6"/>
    ${star(40, 40, 5, '#fff')}${star(160, 170, 4, '#ff9cf0')}${star(36, 150, 3, '#fff')}`;

  D.donzela_ampulheta = G => `
    <linearGradient id="${G('d')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6fff2"/><stop offset="1" stop-color="#0d6b62"/></linearGradient>
    <circle cx="100" cy="80" r="70" fill="#11b5a4" opacity=".25" filter="url(#BL)"/>
    <path d="M100 30 C140 30 160 60 160 110 C160 150 150 176 140 190 L60 190 C50 176 40 150 40 110 C40 60 60 30 100 30Z" fill="#4a2a1a"/>
    <path d="M66 116 Q100 104 134 116 L150 190 L50 190Z" fill="url(#${G('d')})"/>
    <circle cx="100" cy="80" r="24" fill="#ffe9d9"/>
    <path d="M74 80 Q72 50 100 50 Q128 50 126 80 Q116 62 100 64 Q84 62 74 80Z" fill="#4a2a1a"/>
    ${eyes(100, 84, 9, 5.5, '#11b5a4')}<path d="M95 97 Q100 100 105 97" stroke="#a83a4a" stroke-width="2" fill="none"/>
    <rect x="80" y="126" width="40" height="6" rx="3" fill="#c69a3c"/><rect x="80" y="172" width="40" height="6" rx="3" fill="#c69a3c"/>
    <path d="M84 132 L116 132 L102 152 L116 172 L84 172 L98 152Z" fill="#e6fffb" stroke="#c69a3c" stroke-width="2"/>
    <path d="M90 136 L110 136 L100 148Z" fill="#ffc21a"/><path d="M90 170 L110 170 L100 160Z" fill="#ffc21a"/><line x1="100" y1="148" x2="100" y2="162" stroke="#ffc21a" stroke-width="1.5"/>
    <circle cx="100" cy="40" r="34" fill="none" stroke="#a6fff2" stroke-width="2" stroke-dasharray="2 6"/>
    ${spark(40, 60, 6, '#a6fff2')}${spark(164, 70, 5, '#a6fff2')}`;

  D.fragmento_colossal = G => `
    <radialGradient id="${G('c')}" cx="50%" cy="50%"><stop offset="0" stop-color="#ff9cf0"/><stop offset=".35" stop-color="#7c3aed"/><stop offset="1" stop-color="#12052b"/></radialGradient>
    <circle cx="100" cy="100" r="70" fill="#7c3aed" opacity=".35" filter="url(#BL)"/>
    <path d="M30 40 C60 80 40 120 20 170 M170 40 C140 80 160 120 180 170 M100 180 C96 170 104 160 100 150" stroke="#2a1450" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M100 30 L146 70 L136 140 L100 172 L64 140 L54 70Z" fill="url(#${G('c')})" stroke="#c4a1ff" stroke-width="3"/>
    <path d="M100 30 L100 172 M54 70 L136 140 M146 70 L64 140" stroke="#c4a1ff" stroke-width="1" opacity=".5"/>
    <circle cx="100" cy="100" r="16" fill="#fff" opacity=".9"/><circle cx="100" cy="100" r="26" fill="#ff9cf0" opacity=".35" filter="url(#BL)"/>
    ${glowEye(86, 82, 6, 3, '#ffd84d')}${glowEye(114, 82, 6, 3, '#ffd84d')}
    <path d="M30 70 L40 60 L46 76Z M160 60 L172 52 L168 70Z M40 140 L52 136 L48 150Z M156 140 L168 144 L158 154Z" fill="#7c3aed" stroke="#c4a1ff" stroke-width="1.5"/>`;

  /* ---------------------------------------------------------------- chefes */
  const B = {};
  B.apocalipse = G => `
    <radialGradient id="${G('h')}" cx="50%" cy="35%"><stop offset="0" stop-color="#ff7a3a"/><stop offset="1" stop-color="#4a0a02"/></radialGradient>
    <circle cx="100" cy="100" r="90" fill="#ff3d00" opacity=".35" filter="url(#BL)"/>
    <path d="M100 120 C50 70 10 80 0 30 C30 40 44 30 50 14 C64 40 80 44 90 30 C92 60 100 80 100 90Z" fill="#3a0a02"/>
    <path d="M100 120 C150 70 190 80 200 30 C170 40 156 30 150 14 C136 40 120 44 110 30 C108 60 100 80 100 90Z" fill="#3a0a02"/>
    <path d="M48 62 C30 30 20 20 6 14 C30 36 34 60 54 84Z" fill="#2a0602"/><path d="M152 62 C170 30 180 20 194 14 C170 36 166 60 146 84Z" fill="#2a0602"/>
    <path d="M44 100 C40 60 70 40 100 40 C130 40 160 60 156 100 L146 150 C130 176 70 176 54 150Z" fill="url(#${G('h')})" stroke="#1a0402" stroke-width="3"/>
    <path d="M60 80 L84 92 M140 80 L116 92" stroke="#1a0402" stroke-width="6" stroke-linecap="round"/>
    ${glowEye(78, 98, 10, 6, '#ffe14d')}${glowEye(122, 98, 10, 6, '#ffe14d')}
    <path d="M62 132 Q100 170 138 132 L128 160 Q100 180 72 160Z" fill="#1a0402"/>
    <path d="M72 138 L76 152 L82 140 M94 144 L98 160 L102 146 M118 140 L124 152 L128 138" fill="#fff"/>
    <ellipse cx="100" cy="158" rx="16" ry="6" fill="#ffd36a" opacity=".9" filter="url(#BL)"/>
    <circle cx="86" cy="120" r="4" fill="#1a0402"/><circle cx="114" cy="120" r="4" fill="#1a0402"/>
    ${flame(30, 196, 1.6, '#ff3d00', '#ffd36a')}${flame(172, 196, 1.6, '#ff3d00', '#ffd36a')}`;
  B.imperador = G => {
    let s = '';
    for (let i = 0; i < 22; i++) s += star((i * 47) % 200, (i * 29 + 7) % 200, 1.2 + (i % 3), '#fff', 0.4 + (i % 2) * 0.4);
    return `<radialGradient id="${G('g')}" cx="50%" cy="50%"><stop offset="0" stop-color="#ff9cf0"/><stop offset=".3" stop-color="#8b5cf6"/><stop offset="1" stop-color="#0a0320" stop-opacity="0"/></radialGradient>
    ${s}<ellipse cx="100" cy="120" rx="96" ry="40" fill="url(#${G('g')})" transform="rotate(-12 100 120)"/>
    <path d="M40 30 L40 196 L160 196 L160 30 L140 50 L120 26 L100 50 L80 26 L60 50Z" fill="#12052b" stroke="#8b5cf6" stroke-width="3"/>
    <path d="M24 196 C30 130 60 100 100 96 C140 100 170 130 176 196Z" fill="#000" stroke="#ff9cf0" stroke-width="2"/>
    <ellipse cx="100" cy="76" rx="30" ry="34" fill="#000" stroke="#8b5cf6" stroke-width="2"/>
    ${glowEye(88, 76, 8, 3, '#ff2e7e')}${glowEye(112, 76, 8, 3, '#ff2e7e')}
    <path d="M60 46 L66 4 L80 32 L90 0 L100 30 L110 0 L120 32 L134 4 L140 46Z" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/>
    <circle cx="100" cy="30" r="8" fill="#000" stroke="#ff9cf0" stroke-width="2"/>
    <circle cx="100" cy="150" r="22" fill="#000" stroke="#ff9cf0" stroke-width="3"/><circle cx="100" cy="150" r="10" fill="#8b5cf6" opacity=".7"/>`;
  };
  B.deusa = G => {
    let ticks = '';
    for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; ticks += `<circle cx="${100 + Math.cos(a) * 78}" cy="${80 + Math.sin(a) * 78}" r="${i % 3 ? 3 : 6}" fill="#a6fff2"/>`; }
    return `<circle cx="100" cy="80" r="78" fill="none" stroke="#11b5a4" stroke-width="4" opacity=".8"/>${ticks}
    <circle cx="100" cy="80" r="64" fill="#11b5a4" opacity=".2" filter="url(#BL)"/>
    <path d="M100 80 L100 18 M100 80 L150 100" stroke="#ffc21a" stroke-width="4" stroke-linecap="round"/>
    <path d="M40 130 C20 120 10 100 20 80 M160 130 C180 120 190 100 180 80 M48 150 C24 150 10 140 4 120 M152 150 C176 150 190 140 196 120" stroke="#f2d6c0" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M20 80 L4 60 M180 80 L196 60" stroke="#ffc21a" stroke-width="2"/>
    <path d="M60 120 Q100 100 140 120 L170 198 L30 198Z" fill="#0d6b62"/>
    <path d="M60 140 Q100 128 140 140 M50 170 Q100 158 150 170" stroke="#ffc21a" stroke-width="2" fill="none"/>
    <circle cx="100" cy="88" r="26" fill="#f2d6c0"/>
    <path d="M72 90 Q68 54 100 54 Q132 54 128 90 Q140 120 150 140 Q124 120 122 92 Q114 70 100 70 Q86 70 78 92 Q76 120 50 140 Q60 120 72 90Z" fill="#e6fffb"/>
    ${glowEye(90, 90, 6, 3, '#11b5a4')}${glowEye(110, 90, 6, 3, '#11b5a4')}
    <path d="M94 104 Q100 107 106 104" stroke="#8a3a4a" stroke-width="2" fill="none"/>
    <path d="M76 58 L84 38 L92 54 L100 30 L108 54 L116 38 L124 58Z" fill="#ffc21a"/>`;
  };
  B.colosso = G => `
    <radialGradient id="${G('s')}" cx="50%" cy="30%"><stop offset="0" stop-color="#3a1a6a"/><stop offset="1" stop-color="#05020c"/></radialGradient>
    <circle cx="150" cy="40" r="28" fill="#e8deff" opacity=".7"/><path d="M134 18 L150 40 L140 64" stroke="#05020c" stroke-width="4" fill="none"/>
    <path d="M10 200 L22 120 C20 80 50 50 70 46 L80 20 L120 20 L130 46 C150 50 180 80 178 120 L190 200Z" fill="url(#${G('s')})" stroke="#7c3aed" stroke-width="2"/>
    <path d="M84 30 L116 30 L120 60 L80 60Z" fill="#05020c"/>
    ${glowEye(92, 44, 6, 4, '#ff2e7e')}${glowEye(108, 44, 6, 4, '#ff2e7e')}
    <path d="M40 100 L60 120 L50 150 M160 100 L140 120 L150 150 M100 80 L100 130 L86 160 M100 130 L114 160" stroke="#7c3aed" stroke-width="3" fill="none" opacity=".9"/>
    <circle cx="100" cy="110" r="14" fill="#ff2e7e" opacity=".6" filter="url(#BL)"/><circle cx="100" cy="110" r="6" fill="#ffb0d0"/>
    <path d="M0 200 Q50 170 100 190 T200 186 V200Z" fill="#7c3aed" opacity=".4"/>`;

  /* ---------------------------------------------------------------- API */
  function wrap(inner, el, id, extraClass) {
    return `<svg class="art ${extraClass || ''}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
      `<defs><filter id="BL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>` +
      background(el, id) + inner + `</svg>`;
  }
  function render(fn, el, extraClass) {
    const n = ++uidc;
    const ids = {};
    const G = k => (ids[k] = ids[k] || 'g' + n + k);
    const id = 'x' + n;
    // os filtros com id fixo "BL" são idênticos em todo SVG, então podem se repetir
    return wrap(fn(G), el, id, extraClass);
  }

  Art.has = id => typeof D[id] === 'function';
  Art.sticker = function (id) {
    const s = SP.STICKER[id];
    if (!s || !D[id]) return render(() => star(100, 100, 50, '#888'), s ? s.el : 'metal');
    return render(D[id], s.el);
  };
  Art.boss = function (id) {
    const b = SP.BOSS[id];
    return render(B[id], b.el, 'boss-art');
  };
  Art.list = () => Object.keys(D);
  Art.bossList = () => Object.keys(B);

  /* ---------------------------------------------------------------- ícones de elemento */
  const ICONS = {
    fire: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
    water: '<path d="M12 2c3 5 7 9 7 13a7 7 0 0 1-14 0c0-4 4-8 7-13z"/>',
    ice: '<path d="M11 2h2v20h-2zM2 11h20v2H2zM4.9 3.5l15.6 15.6-1.4 1.4L3.5 4.9zM19.1 3.5l1.4 1.4L4.9 20.5l-1.4-1.4z"/>',
    lightning: '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
    earth: '<path d="M2 20L9 7l4 6 3-4 6 11z"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3h-2a5 5 0 1 1 5 5H3zm0 4h15a3 3 0 1 1-3 3h2a1 1 0 1 0 1-1H3zm0 4h7v2H3z"/>',
    light: '<circle cx="12" cy="12" r="5"/><path d="M11 0h2v4h-2zm0 20h2v4h-2zM0 11h4v2H0zm20 0h4v2h-4zM3.5 2.1l2.8 2.8-1.4 1.4-2.8-2.8zm15.6 15.6l2.8 2.8-1.4 1.4-2.8-2.8zM2.1 20.5l2.8-2.8 1.4 1.4-2.8 2.8zM17.7 4.9l2.8-2.8 1.4 1.4-2.8 2.8z"/>',
    dark: '<path d="M14 2a10 10 0 1 0 8 15A8 8 0 0 1 14 2z"/>',
    nature: '<path d="M20 3C9 3 4 9 4 15c0 2 .5 4 1.5 5l1.5-1.5C10 14 13 12 17 10c-4 3-7 6-9 10 8 1 12-5 12-17z"/>',
    plasma: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(120 12 12)"/>',
    gravity: '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.2"/>',
    time: '<path d="M6 2h12v2l-5 8 5 8v2H6v-2l5-8-5-8zM9 5l3 5 3-5z"/>',
    cosmic: '<path d="M12 1l2.6 7.4H22l-6 4.6 2.3 7.5L12 16l-6.3 4.5L8 13 2 8.4h7.4z"/>',
    poison: '<path d="M12 2a8 8 0 0 0-5 14v4h10v-4a8 8 0 0 0-5-14zM9 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 17h1v2h-1zm3 0h1v2h-1z"/>',
    metal: '<path d="M10 1h4l.6 3 2.6 1.1 2.6-1.7 2.8 2.8-1.7 2.6L22 10.4l1 .6v4l-3 .6-1.1 2.6 1.7 2.6-2.8 2.8-2.6-1.7-2.6 1.1-.6 3h-4l-.6-3-2.6-1.1-2.6 1.7-2.8-2.8 1.7-2.6L3 14.6 0 14v-4l3-.6 1.1-2.6-1.7-2.6 2.8-2.8 2.6 1.7L10.4 4zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>'
  };
  Art.elementIcon = function (el, size) {
    const E = SP.ELEMENT[el];
    return `<svg class="el-ico" viewBox="0 0 24 24" width="${size || 18}" height="${size || 18}" style="color:${E.c1}" fill="currentColor" aria-hidden="true">${ICONS[el]}</svg>`;
  };

  /* ---------------------------------------------------------------- ícones de interface */
  const UI_ICONS = {
    coin: '<circle cx="12" cy="12" r="10" fill="#ffc21a" stroke="#8a5a00" stroke-width="1.5"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#fff3b0" stroke-width="1.5"/><path d="M12 8v8M9.5 10.5h5" stroke="#8a5a00" stroke-width="2" stroke-linecap="round"/>',
    frag: '<path d="M12 2l7 6-3 13H8L5 8z" fill="#5fe3ff" stroke="#0b6a8a" stroke-width="1.5"/><path d="M12 2l-2 7 2 12 2-12z" fill="#e6fbff" opacity=".7"/>',
    essence: '<path d="M12 2c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12z" fill="#ff4fb8" stroke="#7a0a4a" stroke-width="1.5"/><circle cx="10" cy="13" r="2.5" fill="#fff" opacity=".8"/>',
    play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
    album: '<rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity=".7"/><rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".7"/><rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".45"/>',
    pack: '<path d="M5 3h14l1 4H4zM4 8h16v13H4z" fill="currentColor"/><path d="M4 8l4 3 4-3 4 3 4-3" stroke="#000" stroke-opacity=".3" fill="none" stroke-width="1.5"/>',
    swords: '<path d="M3 3l9 9-2 2-9-9V3zm18 0v2l-9 9-2-2 9-9zM5 16l3 3-2 2-3-3zm14 0l2 2-2 2-1-1-4 3-1-1 3-4-1-1z" fill="currentColor"/>',
    up: '<path d="M12 3l8 9h-5v9H9v-9H4z" fill="currentColor"/>',
    scroll: '<path d="M6 3h11a3 3 0 0 1 3 3v1h-3v12a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3v-1h3zM9 8h6M9 12h6M9 16h4" stroke="#000" stroke-opacity=".35" stroke-width="1.6" fill="currentColor"/>',
    gear: ICONS.metal.replace('<path', '<path fill="currentColor"'),
    back: '<path d="M15 4l-8 8 8 8" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    heart: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" fill="currentColor"/>',
    skull: ICONS.poison.replace('<path', '<path fill="currentColor"'),
    crown: '<path d="M3 8l4.5 4L12 4l4.5 8L21 8l-2 12H5z" fill="currentColor"/>',
    history: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    forge: '<path d="M4 14h16l-2 6H6zM8 4l8 0-2 6h-4z" fill="currentColor"/>',
    info: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 10v7M12 6.5v.5" stroke="#000" stroke-width="2.4" stroke-linecap="round"/>',
    sound: '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    compare: '<path d="M7 4v16M17 4v16M3 8h8M13 16h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.4" fill="none"/>'
  };
  Art.icon = function (name, size) {
    return `<svg class="ui-ico" viewBox="0 0 24 24" width="${size || 20}" height="${size || 20}" aria-hidden="true">${UI_ICONS[name] || ''}</svg>`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
