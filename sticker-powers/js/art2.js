/* =========================================================================
   STICKER POWERS — ilustrações do Ato II (20 stickers e 4 chefes).
   Usa os mesmos ajudantes de art.js.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const { D, B, h } = SP.Art._defs;
  const { eye, eyes, glowEye, smile, blush, star, spark, bolt, flame, snow, leaf, bubble, gear, shine, shadow } = h;

  /* ---------------------------------------------------------------- stickers */
  D.choquinho = G => {
    let sp = '';
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * (1.05 + i * 0.09), r1 = 46, r2 = 72;
      sp += `<path d="M${100 + Math.cos(a - 0.07) * r1} ${120 + Math.sin(a - 0.07) * r1} L${100 + Math.cos(a) * r2} ${120 + Math.sin(a) * r2} L${100 + Math.cos(a + 0.07) * r1} ${120 + Math.sin(a + 0.07) * r1}Z" fill="${i % 2 ? '#ffcf0a' : '#b37a00'}"/>`;
    }
    return `${shadow(178, 54)}${sp}
    <radialGradient id="${G('b')}" cx="40%" cy="40%"><stop offset="0" stop-color="#fff6c2"/><stop offset="1" stop-color="#e2a400"/></radialGradient>
    <ellipse cx="100" cy="132" rx="54" ry="44" fill="url(#${G('b')})"/>
    <ellipse cx="100" cy="144" rx="34" ry="26" fill="#fff3d0"/>
    ${eyes(100, 124, 17, 8, '#3a2400')}<circle cx="100" cy="140" r="5" fill="#3a1420"/>${smile(100, 148, 6)}${blush(100, 140, 28)}
    <ellipse cx="74" cy="174" rx="10" ry="6" fill="#b37a00"/><ellipse cx="126" cy="174" rx="10" ry="6" fill="#b37a00"/>
    ${bolt(30, 60, 1.1, '#fff6a8')}${bolt(160, 54, 1, '#fff6a8')}${spark(46, 120, 6, '#fff')}${spark(160, 120, 5, '#fff')}`;
  };

  D.pinguinho = G => `
    ${shadow(180, 46)}
    <path d="M30 186 L170 186" stroke="#bff0ff" stroke-width="4" opacity=".5"/>
    <ellipse cx="100" cy="122" rx="46" ry="58" fill="#1b2340"/>
    <ellipse cx="100" cy="134" rx="32" ry="44" fill="#f4fbff"/>
    <path d="M56 110 C36 120 34 140 44 150 C52 138 58 130 62 124Z" fill="#1b2340"/><path d="M144 110 C164 120 166 140 156 150 C148 138 142 130 138 124Z" fill="#1b2340"/>
    ${eyes(100, 94, 14, 7, '#1593d6')}
    <path d="M92 108 L108 108 L100 118Z" fill="#ffb020"/>
    ${blush(100, 112, 24)}
    <path d="M62 118 Q100 132 138 118 L138 128 Q100 142 62 128Z" fill="#3b8bff"/><path d="M128 126 L136 150 L124 150 L120 128Z" fill="#3b8bff"/>
    <path d="M78 178 L96 178 M104 178 L122 178" stroke="#ffb020" stroke-width="8" stroke-linecap="round"/>
    <path d="M74 186 L100 186 M100 186 L126 186" stroke="#cfd8e8" stroke-width="3"/>
    ${snow(36, 50, 7, '#fff')}${snow(166, 64, 5, '#fff')}`;

  D.flutua = G => `
    <ellipse cx="100" cy="184" rx="30" ry="5" fill="#000" opacity=".25"/>
    <ellipse cx="100" cy="96" rx="72" ry="18" fill="none" stroke="#aab4ff" stroke-width="3" opacity=".5" transform="rotate(-10 100 96)"/>
    <radialGradient id="${G('r')}" cx="40%" cy="35%"><stop offset="0" stop-color="#cfd4ff"/><stop offset="1" stop-color="#5a56b0"/></radialGradient>
    <path d="M58 98 C54 66 80 50 104 52 C132 54 150 74 144 104 C140 128 118 140 96 138 C72 136 60 120 58 98Z" fill="url(#${G('r')})" stroke="#2d2a6a" stroke-width="3"/>
    <path d="M86 66 L96 74 M126 110 L134 116" stroke="#2d2a6a" stroke-width="2.5"/>
    ${eyes(100, 96, 16, 8, '#4b47e6')}${smile(100, 116, 6)}${blush(100, 110, 26)}
    <path d="M30 96 A72 18 -10 0 0 172 72" stroke="#e0e4ff" stroke-width="3" fill="none" opacity=".9"/>
    <circle cx="40" cy="150" r="7" fill="#8a86d6"/><circle cx="160" cy="146" r="9" fill="#8a86d6"/><circle cx="150" cy="40" r="5" fill="#cfd4ff"/><circle cx="46" cy="40" r="4" fill="#cfd4ff"/>
    <path d="M40 160 L40 176 M160 158 L160 176" stroke="#aab4ff" stroke-width="2" stroke-dasharray="2 4"/>`;

  D.zumbeia = G => `
    ${shadow(180, 40)}
    <ellipse cx="72" cy="70" rx="30" ry="20" fill="#e9fbff" opacity=".75" stroke="#9fdcff" stroke-width="2" transform="rotate(-30 72 70)"/>
    <ellipse cx="128" cy="70" rx="30" ry="20" fill="#e9fbff" opacity=".75" stroke="#9fdcff" stroke-width="2" transform="rotate(30 128 70)"/>
    <ellipse cx="100" cy="124" rx="48" ry="40" fill="#ffcf0a"/>
    <path d="M70 100 Q100 92 130 100 L134 114 Q100 106 66 114Z M60 132 Q100 124 140 132 L138 146 Q100 138 62 146Z" fill="#2a1a08"/>
    <path d="M100 164 L94 178 L106 178Z" fill="#2a1a08"/>
    <circle cx="100" cy="84" r="28" fill="#ffd84d"/>
    <path d="M88 60 Q80 40 70 36 M112 60 Q120 40 130 36" stroke="#2a1a08" stroke-width="3" fill="none"/><circle cx="70" cy="36" r="5" fill="#2a1a08"/><circle cx="130" cy="36" r="5" fill="#2a1a08"/>
    ${eyes(100, 84, 11, 7, '#2a1a08')}${smile(100, 98, 5)}${blush(100, 94, 18)}
    <path d="M150 140 C150 130 160 124 164 118 C168 124 178 130 178 140 A14 14 0 0 1 150 140Z" fill="#ffb020" stroke="#c77a00" stroke-width="2"/>
    ${leaf(20, 170, 1, -20, '#22b84f')}${spark(40, 110, 5, '#fff6c2')}`;

  D.besouro_blindado = G => `
    <linearGradient id="${G('m')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f8"/><stop offset=".5" stop-color="#8e9bb0"/><stop offset="1" stop-color="#3a4558"/></linearGradient>
    ${shadow(182, 56)}
    <path d="M58 100 L30 86 M56 124 L24 124 M60 148 L32 164 M142 100 L170 86 M144 124 L176 124 M140 148 L168 164" stroke="#2a2f3a" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="100" cy="124" rx="50" ry="58" fill="url(#${G('m')})" stroke="#2a2f3a" stroke-width="3"/>
    <path d="M100 68 L100 182" stroke="#2a2f3a" stroke-width="3"/>
    <circle cx="78" cy="120" r="6" fill="#ffc21a"/><circle cx="122" cy="120" r="6" fill="#ffc21a"/><circle cx="84" cy="150" r="5" fill="#ffc21a"/><circle cx="116" cy="150" r="5" fill="#ffc21a"/>
    ${shine(80, 96, 10, 20)}
    <ellipse cx="100" cy="62" rx="30" ry="20" fill="#4a5568" stroke="#2a2f3a" stroke-width="3"/>
    <path d="M100 46 C96 30 90 22 84 18 C96 20 104 28 106 44Z" fill="#c4ccd8" stroke="#2a2f3a" stroke-width="2"/>
    ${glowEye(88, 62, 5, 4, '#4ff0ff')}${glowEye(112, 62, 5, 4, '#4ff0ff')}`;

  D.leonzinho = G => {
    let mane = '';
    for (let i = 0; i < 14; i++) { const a = Math.PI * 2 * i / 14; mane += `<path d="M${100 + Math.cos(a - 0.2) * 36} ${96 + Math.sin(a - 0.2) * 36} L${100 + Math.cos(a) * 60} ${96 + Math.sin(a) * 60} L${100 + Math.cos(a + 0.2) * 36} ${96 + Math.sin(a + 0.2) * 36}Z" fill="${i % 2 ? '#ff9a1a' : '#ffd84d'}"/>`; }
    return `${shadow(182, 44)}
    <ellipse cx="100" cy="156" rx="34" ry="24" fill="#f0b24a"/>
    <path d="M132 160 Q160 160 162 136" stroke="#f0b24a" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="162" cy="134" r="8" fill="#ff9a1a"/>
    ${mane}<circle cx="100" cy="96" r="38" fill="#ffc96a"/>
    <circle cx="72" cy="68" r="10" fill="#ffc96a"/><circle cx="128" cy="68" r="10" fill="#ffc96a"/><circle cx="72" cy="68" r="5" fill="#ff9fb2"/><circle cx="128" cy="68" r="5" fill="#ff9fb2"/>
    ${eyes(100, 92, 14, 8, '#c77a00')}<ellipse cx="100" cy="110" rx="12" ry="9" fill="#fff3d0"/><path d="M95 106 L105 106 L100 111Z" fill="#7a3a1a"/>${smile(100, 114, 5)}${blush(100, 106, 24)}
    ${spark(36, 40, 7, '#fffbe0')}${spark(166, 44, 6, '#fffbe0')}`;
  };

  D.medusa_plasma = G => `
    <radialGradient id="${G('j')}" cx="45%" cy="35%"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#ffb0f4"/><stop offset="1" stop-color="#b0129a" stop-opacity=".85"/></radialGradient>
    <circle cx="100" cy="80" r="66" fill="#ff2fd8" opacity=".3" filter="url(#BL)"/>
    ${[66, 82, 100, 118, 134].map((x, i) => `<path d="M${x} 100 Q${x + (i % 2 ? 14 : -14)} 130 ${x} 156 T${x + (i % 2 ? -10 : 10)} 192" stroke="#ff8af0" stroke-width="${i === 2 ? 6 : 4}" fill="none" opacity=".85" stroke-linecap="round"/>`).join('')}
    <path d="M40 100 C40 50 70 30 100 30 C130 30 160 50 160 100 C150 108 140 100 130 108 C120 100 110 108 100 102 C90 108 80 100 70 108 C60 100 50 108 40 100Z" fill="url(#${G('j')})"/>
    ${shine(80, 54, 14, 8)}
    ${eyes(100, 76, 14, 7, '#a0007a')}<path d="M93 92 Q100 97 107 92" stroke="#6a0050" stroke-width="2.5" fill="none"/>
    ${bolt(28, 130, 0.9, '#fff')}${bolt(160, 140, 0.8, '#fff')}`;

  D.coelho_ampulheta = G => `
    ${shadow(182, 42)}
    <path d="M80 70 C70 30 72 6 84 6 C96 6 96 40 92 70Z" fill="#f4f0ff" stroke="#9a8ad0" stroke-width="2"/><path d="M82 60 C78 34 80 18 84 16 C88 18 90 40 88 60Z" fill="#ffb0d0"/>
    <path d="M120 70 C130 30 142 14 150 20 C158 28 136 50 108 72Z" fill="#f4f0ff" stroke="#9a8ad0" stroke-width="2"/>
    <ellipse cx="100" cy="146" rx="40" ry="36" fill="#f4f0ff"/>
    <circle cx="100" cy="94" r="34" fill="#f4f0ff"/>
    ${eyes(100, 92, 13, 8, '#11b5a4')}<path d="M96 106 L104 106 L100 110Z" fill="#ff7aa0"/>${smile(100, 112, 4)}${blush(100, 106, 22)}
    <circle cx="100" cy="148" r="20" fill="#ffc21a" stroke="#8a5a00" stroke-width="3"/><circle cx="100" cy="148" r="15" fill="#fffbe6"/>
    <path d="M100 148 L100 138 M100 148 L108 152" stroke="#2a2a2a" stroke-width="2.5" stroke-linecap="round"/><rect x="96" y="124" width="8" height="6" rx="2" fill="#8a5a00"/>
    <ellipse cx="78" cy="180" rx="14" ry="6" fill="#e0d8ff"/><ellipse cx="122" cy="180" rx="14" ry="6" fill="#e0d8ff"/>
    <circle cx="150" cy="160" r="12" fill="#fff"/>
    <path d="M30 120 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" fill="none" stroke="#a6fff2" stroke-width="2" stroke-dasharray="3 3"/>${spark(166, 96, 6, '#a6fff2')}`;

  D.cometa_errante = G => `
    <linearGradient id="${G('t')}" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#ff9cf0"/><stop offset="1" stop-color="#4ff0ff" stop-opacity="0"/></linearGradient>
    <path d="M128 80 C90 100 40 150 0 200 L40 200 C70 160 110 120 142 104Z" fill="url(#${G('t')})" opacity=".85"/>
    <path d="M120 70 C80 110 50 150 10 196" stroke="#fff" stroke-width="2" opacity=".6"/>
    <circle cx="136" cy="80" r="56" fill="#ff9cf0" opacity=".3" filter="url(#BL)"/>
    <radialGradient id="${G('c')}" cx="40%" cy="35%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#cbb6ff"/><stop offset="1" stop-color="#6a4ad0"/></radialGradient>
    <circle cx="136" cy="80" r="40" fill="url(#${G('c')})"/>
    ${eyes(136, 78, 14, 8, '#6a4ad0')}${smile(136, 96, 6)}${blush(136, 92, 24)}
    ${star(40, 40, 6, '#fff')}${star(70, 70, 3, '#ff9cf0')}${star(170, 160, 5, '#4ff0ff')}${star(90, 160, 3, '#fff')}`;

  D.monge_gravidade = G => `
    <circle cx="100" cy="86" r="70" fill="none" stroke="#aab4ff" stroke-width="2" stroke-dasharray="4 8" opacity=".7"/>
    <ellipse cx="100" cy="190" rx="40" ry="5" fill="#000" opacity=".25"/>
    <path d="M40 160 C40 130 70 116 100 116 C130 116 160 130 160 160 C140 172 60 172 40 160Z" fill="#e0782a"/>
    <path d="M66 120 L100 170 L134 120" fill="#4b47e6"/>
    <path d="M60 140 C80 150 120 150 140 140" stroke="#ffc21a" stroke-width="3" fill="none"/>
    <circle cx="100" cy="88" r="28" fill="#f2c9a0"/>
    <path d="M86 88 Q92 92 98 88 M102 88 Q108 92 114 88" stroke="#3a2010" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M94 102 Q100 106 106 102" stroke="#3a2010" stroke-width="2" fill="none"/>
    <circle cx="100" cy="72" r="4" fill="#4b47e6"/>
    <ellipse cx="100" cy="50" rx="22" ry="6" fill="none" stroke="#ffe680" stroke-width="3"/>
    <circle cx="36" cy="80" r="10" fill="#8a86d6"/><circle cx="166" cy="70" r="8" fill="#8a86d6"/><circle cx="160" cy="130" r="6" fill="#cfd4ff"/><circle cx="40" cy="130" r="7" fill="#cfd4ff"/>
    <path d="M84 132 Q100 140 116 132" stroke="#f2c9a0" stroke-width="8" fill="none" stroke-linecap="round"/>`;

  D.cervo_ancestral = G => {
    const antler = sx => `<g transform="translate(100 0) scale(${sx} 1) translate(-100 0)"><path d="M84 66 C70 50 66 34 70 14 M76 44 C64 40 56 30 54 18 M72 30 C80 22 82 14 80 6 M70 54 C56 56 44 50 36 40" stroke="#8a5a30" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="54" cy="18" r="5" fill="#ff8fc8"/><circle cx="36" cy="40" r="4" fill="#ffd84d"/>${leaf(64, 34, 0.5, -60, '#5ed45a')}</g>`;
    return `${shadow(186, 44)}${antler(1)}${antler(-1)}
    <path d="M70 120 L130 120 L136 186 L64 186Z" fill="#c78a52"/>
    <path d="M70 70 C70 50 130 50 130 70 L122 124 C112 138 88 138 78 124Z" fill="#d9a066"/>
    <path d="M62 78 L44 66 L66 92Z M138 78 L156 66 L134 92Z" fill="#c78a52"/>
    <ellipse cx="100" cy="120" rx="16" ry="12" fill="#f2dcc0"/><ellipse cx="100" cy="114" rx="6" ry="4" fill="#3a2010"/>
    ${eyes(100, 90, 16, 7, '#2a6b1f')}
    <circle cx="86" cy="150" r="4" fill="#fff" opacity=".7"/><circle cx="114" cy="160" r="4" fill="#fff" opacity=".7"/>
    ${leaf(20, 160, 1, -30, '#22b84f')}${leaf(150, 170, 1, -150, '#b4f07a')}`;
  };

  D.fenix_rubra = G => `
    <circle cx="100" cy="90" r="80" fill="#ff5a1f" opacity=".3" filter="url(#BL)"/>
    <path d="M100 100 C70 60 30 40 4 50 C26 62 30 70 20 80 C40 80 44 90 34 98 C54 98 60 106 52 116 C70 112 84 110 100 116Z" fill="#ff5a1f"/>
    <path d="M100 100 C130 60 170 40 196 50 C174 62 170 70 180 80 C160 80 156 90 166 98 C146 98 140 106 148 116 C130 112 116 110 100 116Z" fill="#ff5a1f"/>
    <path d="M100 104 C80 76 50 64 24 66 C44 76 60 90 100 112Z M100 104 C120 76 150 64 176 66 C156 76 140 90 100 112Z" fill="#ffc04d"/>
    <path d="M92 140 C80 170 70 186 60 196 C84 186 94 172 100 156 C106 172 116 186 140 196 C130 186 120 170 108 140Z" fill="#ff8a1f"/>
    <path d="M100 150 C96 174 100 190 100 198" stroke="#ffe08a" stroke-width="4"/>
    <ellipse cx="100" cy="120" rx="18" ry="30" fill="#ff7a2a"/>
    <circle cx="100" cy="82" r="18" fill="#ff7a2a"/>
    ${flame(100, 66, 0.7, '#ff3d00', '#ffe08a')}
    ${glowEye(94, 82, 4, 3, '#ffe14d')}${glowEye(106, 82, 4, 3, '#ffe14d')}
    <path d="M96 92 L100 100 L104 92Z" fill="#ffc21a"/>`;

  D.colosso_mecanico = G => `
    <linearGradient id="${G('a')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f8"/><stop offset="1" stop-color="#4a5568"/></linearGradient>
    ${shadow(188, 70)}
    <rect x="62" y="150" width="28" height="36" rx="4" fill="#3a4558"/><rect x="110" y="150" width="28" height="36" rx="4" fill="#3a4558"/>
    <path d="M50 80 L150 80 L160 154 L40 154Z" fill="url(#${G('a')})" stroke="#2a2f3a" stroke-width="3"/>
    <circle cx="100" cy="116" r="18" fill="#0d1b2a" stroke="#4ff0ff" stroke-width="4"/><circle cx="100" cy="116" r="8" fill="#4ff0ff"/>
    <rect x="16" y="86" width="34" height="60" rx="8" fill="#6b7a90" stroke="#2a2f3a" stroke-width="3"/>
    <rect x="152" y="96" width="44" height="26" rx="6" fill="#4a5568" stroke="#2a2f3a" stroke-width="3"/><rect x="186" y="100" width="14" height="18" fill="#2a2f3a"/>
    <circle cx="198" cy="109" r="10" fill="#4ff0ff" opacity=".6" filter="url(#BL)"/>
    <rect x="70" y="36" width="60" height="44" rx="8" fill="url(#${G('a')})" stroke="#2a2f3a" stroke-width="3"/>
    <rect x="78" y="50" width="44" height="12" rx="4" fill="#0d1b2a"/><rect x="82" y="53" width="36" height="6" rx="3" fill="#ff4b4b"/>
    <path d="M100 36 L100 18" stroke="#2a2f3a" stroke-width="4"/><circle cx="100" cy="16" r="5" fill="#ffc21a"/>
    <text x="100" y="146" text-anchor="middle" font-size="10" font-weight="900" fill="#2a2f3a" font-family="sans-serif">Ο-01</text>`;

  D.ceifadora_lunar = G => `
    <circle cx="150" cy="46" r="30" fill="#e8deff" opacity=".85"/><circle cx="164" cy="38" r="28" fill="#120624"/>
    ${shadow(188, 50)}
    <path d="M150 20 L60 196" stroke="#5a4a7a" stroke-width="5"/>
    <path d="M150 20 C120 4 70 10 46 40 C80 28 116 30 140 44Z" fill="#d8d0f0" stroke="#7c3aed" stroke-width="2"/>
    <path d="M60 196 C56 150 64 110 100 92 C136 110 144 150 140 196Z" fill="#1b0b33"/>
    <path d="M64 102 Q100 40 136 102 Q130 92 100 90 Q70 92 64 102Z" fill="#2a1450"/>
    <path d="M68 104 Q100 52 132 104 L124 132 Q100 140 76 132Z" fill="#1b0b33"/>
    <ellipse cx="100" cy="112" rx="20" ry="16" fill="#0a0414"/>
    ${glowEye(92, 110, 5, 3, '#c4a1ff')}${glowEye(108, 110, 5, 3, '#c4a1ff')}
    <path d="M70 140 C50 150 40 170 44 190 M130 140 C150 150 160 170 156 190" stroke="#7c3aed" stroke-width="2" fill="none" opacity=".7"/>
    ${star(30, 30, 3, '#fff', 0.7)}${star(40, 90, 2, '#fff', 0.6)}`;

  D.imperador_trovao = G => {
    let drums = '';
    for (let i = 0; i < 8; i++) { const a = Math.PI * 2 * i / 8 - Math.PI / 2; const x = 100 + Math.cos(a) * 74, y = 92 + Math.sin(a) * 74; drums += `<circle cx="${x}" cy="${y}" r="13" fill="#b83232" stroke="#ffc21a" stroke-width="3"/><circle cx="${x}" cy="${y}" r="5" fill="#ffc21a"/>`; }
    return `<circle cx="100" cy="92" r="74" fill="none" stroke="#ffc21a" stroke-width="4"/>${drums}
    <circle cx="100" cy="92" r="58" fill="#ffcf0a" opacity=".25" filter="url(#BL)"/>
    <path d="M50 196 C50 150 70 130 100 128 C130 130 150 150 150 196Z" fill="#2a2a6a"/>
    <path d="M86 130 L100 196 L114 130" fill="#ffcf0a"/>
    <circle cx="100" cy="98" r="28" fill="#c9a0e8"/>
    <path d="M74 104 C70 140 86 150 100 156 C114 150 130 140 126 104 C116 116 84 116 74 104Z" fill="#f2f2ff"/>
    ${glowEye(90, 96, 6, 3, '#4ff0ff')}${glowEye(110, 96, 6, 3, '#4ff0ff')}
    <path d="M82 86 L96 90 M118 86 L104 90" stroke="#2a2a6a" stroke-width="4" stroke-linecap="round"/>
    <path d="M72 72 L78 50 L88 66 L100 42 L112 66 L122 50 L128 72Z" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/>
    ${bolt(94, 26, 0.8, '#fff6a8')}${bolt(20, 150, 1.2, '#fff6a8')}${bolt(160, 150, 1.2, '#fff6a8')}`;
  };

  D.aeon = G => `
    <circle cx="100" cy="96" r="84" fill="#11b5a4" opacity=".25" filter="url(#BL)"/>
    ${gear(100, 96, 70, '#0d6b62', 16)}
    <circle cx="100" cy="96" r="54" fill="#05202a"/>
    ${[48, 40, 32].map((r, i) => `<circle cx="100" cy="96" r="${r}" fill="none" stroke="${['#a6fff2', '#ffc21a', '#ff9cf0'][i]}" stroke-width="2" stroke-dasharray="${3 + i * 2} ${5 + i}"/>`).join('')}
    <path d="M86 70 L114 70 L104 96 L114 122 L86 122 L96 96Z" fill="#e6fffb" stroke="#ffc21a" stroke-width="2"/>
    <path d="M90 74 L110 74 L100 90Z" fill="#ffc21a"/><path d="M90 118 L110 118 L100 106Z" fill="#ffc21a"/>
    ${glowEye(76, 96, 5, 4, '#a6fff2')}${glowEye(124, 96, 5, 4, '#a6fff2')}
    ${star(30, 30, 5, '#fff')}${star(170, 170, 5, '#a6fff2')}${star(170, 30, 3, '#ff9cf0')}${star(30, 170, 3, '#ffc21a')}`;

  D.hidrinha = G => {
    const head = (x, y, r, c) => `<path d="M100 150 C${(100 + x) / 2} ${130} ${x} ${y + 30} ${x} ${y}" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="${c}"/>${eyes(x, y - 2, r * 0.4, r * 0.24, '#003a6a')}<path d="M${x - r * 0.4} ${y + r * 0.4} Q${x} ${y + r * 0.6} ${x + r * 0.4} ${y + r * 0.4}" stroke="#003a6a" stroke-width="2" fill="none"/>`;
    return `${shadow(184, 50)}
    <path d="M30 186 Q60 172 90 186 T150 186 T200 186" stroke="#7fd8ff" stroke-width="4" fill="none" opacity=".6"/>
    <ellipse cx="100" cy="160" rx="44" ry="26" fill="#1f7bff"/>
    ${head(52, 72, 24, '#2f8cff')}${head(148, 72, 24, '#2f8cff')}${head(100, 50, 28, '#1f7bff')}
    <path d="M144 166 Q170 170 176 150" stroke="#1f7bff" stroke-width="10" fill="none" stroke-linecap="round"/>
    ${bubble(30, 120, 6, '#9fe3ff')}${bubble(172, 116, 5, '#9fe3ff')}`;
  };

  D.princesa_trovao = G => `
    <circle cx="100" cy="80" r="74" fill="#ffcf0a" opacity=".22" filter="url(#BL)"/>
    <path d="M100 30 C140 30 160 70 156 120 C152 150 160 170 168 186 C140 180 120 150 118 120 L82 120 C80 150 60 180 32 186 C40 170 48 150 44 120 C40 70 60 30 100 30Z" fill="#ffe14d"/>
    <path d="M66 120 Q100 108 134 120 L150 192 L50 192Z" fill="#5b2cff"/>
    <path d="M70 140 L130 140 M62 168 L138 168" stroke="#ffcf0a" stroke-width="3"/>
    <circle cx="100" cy="82" r="24" fill="#ffe9d9"/>
    <path d="M74 82 Q72 54 100 54 Q128 54 126 82 Q118 66 100 68 Q82 66 74 82Z" fill="#ffe14d"/>
    ${eyes(100, 86, 9, 5.5, '#5b2cff')}<path d="M95 99 Q100 102 105 99" stroke="#a83a4a" stroke-width="2" fill="none"/>${blush(100, 94, 16)}
    ${bolt(74, 20, 0.9, '#fff6a8')}${bolt(94, 8, 1.1, '#fff')}${bolt(116, 20, 0.9, '#fff6a8')}
    ${bolt(20, 120, 1.2, '#4ff0ff')}${bolt(166, 110, 1.2, '#4ff0ff')}`;

  D.nucleo_aco = G => `
    <linearGradient id="${G('a')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f8"/><stop offset="1" stop-color="#5a6578"/></linearGradient>
    ${shadow(184, 48)}
    <circle cx="100" cy="110" r="72" fill="#4ff0ff" opacity=".2" filter="url(#BL)"/>
    <path d="M72 170 L66 186 M128 170 L134 186" stroke="#3a4558" stroke-width="10" stroke-linecap="round"/>
    <path d="M50 116 L28 130 L36 146 M150 116 L172 130 L164 146" stroke="#6b7a90" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="124" r="50" fill="url(#${G('a')})" stroke="#2a2f3a" stroke-width="3"/>
    ${gear(100, 124, 32, '#3a4558', 10)}
    <circle cx="100" cy="124" r="20" fill="#05202a"/><circle cx="100" cy="124" r="13" fill="#4ff0ff"/><circle cx="100" cy="124" r="6" fill="#fff"/>
    <rect x="72" y="46" width="56" height="34" rx="10" fill="url(#${G('a')})" stroke="#2a2f3a" stroke-width="3"/>
    <rect x="80" y="56" width="40" height="14" rx="6" fill="#0d1b2a"/>${glowEye(92, 63, 4, 3, '#4ff0ff')}${glowEye(108, 63, 4, 3, '#4ff0ff')}
    ${spark(36, 60, 7, '#4ff0ff')}${spark(166, 70, 6, '#fff')}`;

  D.omega_desperto = G => `
    <radialGradient id="${G('o')}" cx="50%" cy="50%"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#ff9cf0"/><stop offset=".55" stop-color="#5a0a8a"/><stop offset="1" stop-color="#0a0320"/></radialGradient>
    <circle cx="100" cy="100" r="86" fill="#8b5cf6" opacity=".35" filter="url(#BL)"/>
    <ellipse cx="100" cy="100" rx="88" ry="20" fill="none" stroke="#ff9cf0" stroke-width="3" transform="rotate(25 100 100)" opacity=".8"/>
    <ellipse cx="100" cy="100" rx="88" ry="20" fill="none" stroke="#4ff0ff" stroke-width="3" transform="rotate(-25 100 100)" opacity=".8"/>
    <circle cx="100" cy="100" r="50" fill="url(#${G('o')})"/>
    <ellipse cx="100" cy="100" rx="30" ry="18" fill="#fff"/><circle cx="100" cy="100" r="14" fill="#8b5cf6"/><circle cx="100" cy="100" r="7" fill="#05020c"/><circle cx="95" cy="95" r="3" fill="#fff"/>
    <path d="M70 100 Q100 70 130 100 Q100 130 70 100Z" fill="none" stroke="#ff9cf0" stroke-width="2"/>
    ${star(30, 40, 6, '#fff')}${star(170, 40, 5, '#ff9cf0')}${star(160, 170, 6, '#4ff0ff')}${star(36, 160, 4, '#fff')}`;

  /* ---------------------------------------------------------------- chefes */
  B.hidra = G => {
    let necks = '';
    [[30, 60], [62, 34], [100, 22], [138, 34], [170, 60]].forEach(([x, y], i) => {
      necks += `<path d="M100 196 C${100 + (x - 100) * 0.3} 150 ${x} ${y + 60} ${x} ${y}" stroke="#0b4a8a" stroke-width="${i === 2 ? 26 : 20}" fill="none" stroke-linecap="round"/>`;
      necks += `<path d="M${x - 18} ${y} C${x - 18} ${y - 18} ${x + 18} ${y - 18} ${x + 18} ${y} L${x + 12} ${y + 16} L${x - 12} ${y + 16}Z" fill="#1f6fd0" stroke="#062a4a" stroke-width="2"/>`;
      necks += glowEye(x - 7, y - 2, 4, 3, '#b6ff2a') + glowEye(x + 7, y - 2, 4, 3, '#b6ff2a');
      necks += `<path d="M${x - 8} ${y + 10} L${x - 4} ${y + 18} L${x} ${y + 10} L${x + 4} ${y + 18} L${x + 8} ${y + 10}" stroke="#fff" stroke-width="2" fill="none"/>`;
    });
    return `<rect width="200" height="200" fill="#031a33" opacity=".5"/>${necks}
    <path d="M0 170 Q30 150 60 170 T120 170 T180 170 T240 170 V200 H0Z" fill="#1f7bff" opacity=".7"/>
    <path d="M0 184 Q30 168 60 184 T120 184 T180 184 T240 184 V200 H0Z" fill="#7fd8ff" opacity=".5"/>`;
  };
  B.tempestade = G => `
    <path d="M0 50 C20 20 60 20 70 40 C80 10 130 10 140 40 C160 20 200 30 200 50 L200 80 L0 80Z" fill="#2a2a4a"/>
    <path d="M10 60 C30 40 60 44 70 56 C86 34 120 36 134 54 C150 40 186 44 196 64" stroke="#5a5a8a" stroke-width="6" fill="none"/>
    ${bolt(30, 70, 2, '#fff6a8')}${bolt(150, 70, 2, '#fff6a8')}
    <circle cx="100" cy="110" r="70" fill="#ffcf0a" opacity=".2" filter="url(#BL)"/>
    <path d="M50 200 C50 150 70 130 100 128 C130 130 150 150 150 200Z" fill="#1b1b4a"/>
    <path d="M70 140 L100 200 L130 140" fill="#ffcf0a" opacity=".8"/>
    <path d="M100 60 C140 60 156 90 152 130 C150 150 160 170 170 190 L140 190 C130 170 124 150 124 130 L76 130 C76 150 70 170 60 190 L30 190 C40 170 50 150 48 130 C44 90 60 60 100 60Z" fill="#e8e8ff"/>
    <circle cx="100" cy="104" r="26" fill="#d8d0f0"/>
    ${glowEye(90, 104, 6, 3, '#4ff0ff')}${glowEye(110, 104, 6, 3, '#4ff0ff')}
    <path d="M92 118 Q100 122 108 118" stroke="#3a2a6a" stroke-width="2" fill="none"/>
    <path d="M70 80 L76 50 L86 70 L94 36 L100 64 L106 36 L114 70 L124 50 L130 80Z" fill="#ffcf0a" stroke="#8a5a00" stroke-width="2"/>
    ${bolt(94, 20, 1, '#fff')}`;
  B.tita = G => `
    <linearGradient id="${G('a')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4ccd8"/><stop offset="1" stop-color="#2a2f3a"/></linearGradient>
    <rect width="200" height="200" fill="#1a1008" opacity=".5"/>
    <path d="M10 200 L20 90 L60 70 L140 70 L180 90 L190 200Z" fill="url(#${G('a')})" stroke="#0a0c10" stroke-width="3"/>
    <path d="M60 110 L140 110 M50 140 L150 140 M44 170 L156 170" stroke="#0a0c10" stroke-width="3"/>
    <circle cx="100" cy="140" r="24" fill="#0d1b2a" stroke="#ff8a1f" stroke-width="5"/><circle cx="100" cy="140" r="11" fill="#ffb020"/>
    <circle cx="100" cy="140" r="30" fill="#ff8a1f" opacity=".4" filter="url(#BL)"/>
    <rect x="64" y="14" width="72" height="58" rx="8" fill="url(#${G('a')})" stroke="#0a0c10" stroke-width="3"/>
    <rect x="72" y="32" width="56" height="16" rx="4" fill="#0a0c10"/>
    <rect x="76" y="36" width="48" height="8" rx="3" fill="#ff4b4b"/><rect x="76" y="36" width="48" height="8" rx="3" fill="#ff4b4b" filter="url(#BL)"/>
    <path d="M80 60 L120 60" stroke="#0a0c10" stroke-width="4"/>
    <rect x="0" y="96" width="24" height="70" rx="6" fill="#4a5568"/><rect x="176" y="96" width="24" height="70" rx="6" fill="#4a5568"/>
    <path d="M30 20 L44 30 M170 20 L156 30" stroke="#ff8a1f" stroke-width="3"/>`;
  B.omega = G => {
    let tent = '';
    for (let i = 0; i < 8; i++) { const a = Math.PI * 2 * i / 8; tent += `<path d="M100 100 Q${100 + Math.cos(a + 0.6) * 70} ${100 + Math.sin(a + 0.6) * 70} ${100 + Math.cos(a) * 110} ${100 + Math.sin(a) * 110}" stroke="#2a0a4a" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M100 100 Q${100 + Math.cos(a + 0.6) * 70} ${100 + Math.sin(a + 0.6) * 70} ${100 + Math.cos(a) * 110} ${100 + Math.sin(a) * 110}" stroke="#ff2e7e" stroke-width="2" fill="none" opacity=".6"/>`; }
    let s = '';
    for (let i = 0; i < 18; i++) s += star((i * 47) % 200, (i * 31 + 9) % 200, 1 + (i % 3), '#fff', 0.5);
    return `<rect width="200" height="200" fill="#05020c"/>${s}${tent}
    <circle cx="100" cy="100" r="62" fill="#ff2e7e" opacity=".35" filter="url(#BL)"/>
    <circle cx="100" cy="100" r="54" fill="#0a0014" stroke="#ff2e7e" stroke-width="3"/>
    <ellipse cx="100" cy="92" rx="34" ry="20" fill="#fff"/><circle cx="100" cy="92" r="16" fill="#ff2e7e"/><ellipse cx="100" cy="92" rx="4" ry="13" fill="#000"/>
    <path d="M66 122 Q100 150 134 122 L126 136 Q100 156 74 136Z" fill="#000"/>
    <path d="M74 126 L78 136 L84 128 L90 140 L96 130 L100 142 L104 130 L110 140 L116 128 L122 136 L126 126" stroke="#fff" stroke-width="2" fill="none"/>
    <circle cx="100" cy="100" r="74" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="3 6"/>`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
