/* =========================================================================
   STICKER POWERS — ilustrações do Ato IV, de Gustavo e Téo, e das fusões
   (cada fusão é um personagem novo, desenhado do zero).
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const { D, B, h } = SP.Art._defs;
  const { eye, eyes, glowEye, smile, blush, star, spark, bolt, flame, snow, leaf, bubble, gear, shine, shadow } = h;

  /* ---------------------------------------------------------------- stickers do Ato IV */
  D.gato_astronauta = G => `
    ${star(30, 30, 3, '#fff', .7)}${star(170, 50, 4, '#fff', .8)}${star(40, 160, 2, '#fff', .6)}
    <circle cx="150" cy="150" r="22" fill="#ff9a5a"/><path d="M128 150 Q150 140 172 150" stroke="#c75a2a" stroke-width="3" fill="none"/>
    <rect x="70" y="120" width="60" height="50" rx="18" fill="#f2f2f8" stroke="#8a8aa8" stroke-width="3"/>
    <rect x="86" y="132" width="28" height="14" rx="4" fill="#3b8bff"/><circle cx="92" cy="139" r="2" fill="#ff4b4b"/><circle cx="100" cy="139" r="2" fill="#3ddc84"/>
    <path d="M128 150 C150 156 160 170 150 180" stroke="#f0a24a" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="88" r="44" fill="#cfe9ff" opacity=".35" stroke="#e8f6ff" stroke-width="4"/>
    <path d="M70 76 L74 52 L88 68Z M130 76 L126 52 L112 68Z" fill="#f0a24a"/>
    <circle cx="100" cy="92" r="30" fill="#f0a24a"/>
    ${eyes(100, 90, 12, 7, '#2a6a1a')}<path d="M96 102 L100 106 L104 102" stroke="#3a1420" stroke-width="2" fill="none"/>
    <path d="M70 100 L56 98 M70 106 L58 110 M130 100 L144 98 M130 106 L142 110" stroke="#7a4a1a" stroke-width="1.5"/>
    ${shine(80, 70, 10, 6)}`;

  D.vespa_neon = G => `
    <circle cx="100" cy="100" r="70" fill="#ff2fd8" opacity=".2" filter="url(#BL)"/>
    <ellipse cx="66" cy="70" rx="34" ry="16" fill="#4ff0ff" opacity=".45" stroke="#4ff0ff" stroke-width="2" transform="rotate(-30 66 70)"/>
    <ellipse cx="134" cy="70" rx="34" ry="16" fill="#4ff0ff" opacity=".45" stroke="#4ff0ff" stroke-width="2" transform="rotate(30 134 70)"/>
    <ellipse cx="100" cy="130" rx="30" ry="40" fill="#1a0a2a" stroke="#ff2fd8" stroke-width="3"/>
    <path d="M72 116 Q100 108 128 116 M70 134 Q100 126 130 134 M74 152 Q100 144 126 152" stroke="#ffe14d" stroke-width="6" fill="none"/>
    <path d="M100 170 L94 190 L106 190Z" fill="#ff2fd8"/>
    <circle cx="100" cy="84" r="22" fill="#1a0a2a" stroke="#ff2fd8" stroke-width="3"/>
    ${glowEye(91, 84, 6, 6, '#4ff0ff')}${glowEye(109, 84, 6, 6, '#4ff0ff')}
    <path d="M92 64 Q84 44 74 40 M108 64 Q116 44 126 40" stroke="#ff2fd8" stroke-width="2.5" fill="none"/><circle cx="74" cy="40" r="4" fill="#4ff0ff"/><circle cx="126" cy="40" r="4" fill="#4ff0ff"/>
    ${bolt(30, 140, 0.9, '#ffe14d')}${bolt(160, 150, 0.8, '#ffe14d')}`;

  D.tubarao_trovao = G => `
    <path d="M0 50 C30 30 60 40 70 50 C90 20 140 30 150 50 C170 36 200 44 200 60 L200 70 L0 70Z" fill="#3a3a5a" opacity=".8"/>
    ${bolt(40, 66, 1.4, '#fff6a8')}${bolt(150, 66, 1.2, '#fff6a8')}
    <path d="M20 130 C50 92 120 86 170 110 L196 96 L186 128 L196 160 L170 146 C120 170 50 166 20 130Z" fill="#5a7a9a" stroke="#1a2a3a" stroke-width="3"/>
    <path d="M30 136 C60 150 120 154 170 140" fill="none" stroke="#e8f0f8" stroke-width="14" opacity=".9"/>
    <path d="M96 98 L110 60 L124 100Z" fill="#5a7a9a" stroke="#1a2a3a" stroke-width="3"/>
    ${glowEye(56, 118, 6, 5, '#ffe14d')}
    <path d="M30 134 L76 136" stroke="#1a0a0a" stroke-width="3"/><path d="M36 134 L40 142 L46 134 L50 142 L56 134 L60 142 L66 134" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M90 116 L96 124 M100 116 L106 124 M110 116 L116 124" stroke="#1a2a3a" stroke-width="2"/>
    ${bolt(120, 120, 0.8, '#ffe14d')}`;

  D.dragao_jade = G => `
    <linearGradient id="${G('j')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9cf5c4"/><stop offset=".5" stop-color="#22b84f"/><stop offset="1" stop-color="#0a5a2a"/></linearGradient>
    <path d="M10 180 C30 140 70 160 90 130 C110 100 70 80 90 60" stroke="url(#${G('j')})" stroke-width="28" fill="none" stroke-linecap="round"/>
    <path d="M10 180 C30 140 70 160 90 130 C110 100 70 80 90 60" stroke="#e8ffe8" stroke-width="2" fill="none" stroke-dasharray="3 9"/>
    <path d="M60 150 L52 136 L68 140Z M84 120 L74 110 L90 112Z M88 90 L78 80 L94 82Z" fill="#ffc21a"/>
    <path d="M70 60 C70 34 110 24 130 40 C150 56 140 80 112 82 L80 82Z" fill="url(#${G('j')})" stroke="#0a3a1a" stroke-width="2"/>
    <path d="M96 36 C96 20 110 12 118 16 M112 36 C118 22 132 18 138 24" stroke="#ffc21a" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${glowEye(112, 54, 6, 4, '#ffe14d')}<path d="M126 66 C140 68 150 64 156 58" stroke="#0a3a1a" stroke-width="2" fill="none"/>
    <path d="M140 74 C160 80 176 74 186 62" stroke="#9cf5c4" stroke-width="4" fill="none" opacity=".7"/>
    ${leaf(150, 140, 1.2, -40, '#5ed45a')}${leaf(20, 40, 1, 20, '#b4f07a')}
    <circle cx="164" cy="110" r="10" fill="#9cf5c4" stroke="#ffc21a" stroke-width="2"/>`;

  D.cavaleiro_obsidiana = G => `
    <linearGradient id="${G('o')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4050"/><stop offset="1" stop-color="#0a0810"/></linearGradient>
    ${shadow(186, 56)}
    <path d="M62 196 L56 112 L144 112 L138 196Z" fill="url(#${G('o')})" stroke="#ff5a1f" stroke-width="2"/>
    <path d="M80 120 L92 150 L84 176 M120 120 L108 150 L116 176 M100 130 L100 186" stroke="#ff7a2a" stroke-width="3" fill="none"/>
    <path d="M28 104 L66 96 L70 168 L40 176 C24 156 22 128 28 104Z" fill="url(#${G('o')})" stroke="#ff5a1f" stroke-width="3"/>
    <path d="M40 120 L56 136 L44 154" stroke="#ff7a2a" stroke-width="3" fill="none"/>
    <path d="M66 70 Q100 30 134 70 L138 112 L62 112Z" fill="url(#${G('o')})" stroke="#ff5a1f" stroke-width="2.5"/>
    <path d="M100 34 L94 14 L100 22 L106 14Z" fill="#ff5a1f"/>
    <rect x="74" y="78" width="52" height="12" rx="3" fill="#000"/>${glowEye(88, 84, 6, 3, '#ff7a2a')}${glowEye(112, 84, 6, 3, '#ff7a2a')}
    <path d="M150 100 L170 40" stroke="#3a3040" stroke-width="7"/><path d="M164 44 L176 22 L180 48Z" fill="#ff5a1f"/>`;

  D.fenix_glacial = G => `
    <circle cx="100" cy="90" r="80" fill="#5fd4ff" opacity=".3" filter="url(#BL)"/>
    <path d="M100 100 C70 60 30 40 4 50 C26 62 30 70 20 80 C40 80 44 90 34 98 C54 98 60 106 52 116 C70 112 84 110 100 116Z" fill="#9be8ff"/>
    <path d="M100 100 C130 60 170 40 196 50 C174 62 170 70 180 80 C160 80 156 90 166 98 C146 98 140 106 148 116 C130 112 116 110 100 116Z" fill="#9be8ff"/>
    <path d="M100 104 C80 76 50 64 24 66 C44 76 60 90 100 112Z M100 104 C120 76 150 64 176 66 C156 76 140 90 100 112Z" fill="#e6fbff"/>
    <path d="M92 140 C80 170 70 186 60 196 C84 186 94 172 100 156 C106 172 116 186 140 196 C130 186 120 170 108 140Z" fill="#5fd4ff"/>
    <ellipse cx="100" cy="120" rx="18" ry="30" fill="#bff0ff"/>
    <circle cx="100" cy="82" r="18" fill="#bff0ff"/>
    <path d="M90 68 L94 48 L100 62 L106 46 L110 68Z" fill="#e6fbff" stroke="#5fd4ff" stroke-width="1.5"/>
    ${glowEye(94, 82, 4, 3, '#1593d6')}${glowEye(106, 82, 4, 3, '#1593d6')}<path d="M96 92 L100 100 L104 92Z" fill="#5fd4ff"/>
    ${snow(30, 150, 6, '#fff')}${snow(170, 150, 7, '#fff')}${snow(100, 20, 5, '#fff')}`;

  D.relojoeiro_tita = G => `
    ${gear(150, 60, 34, '#c69a3c', 12)}${gear(40, 150, 26, '#8a6a2a', 10)}
    <circle cx="150" cy="60" r="16" fill="#fffbe6"/><path d="M150 60 L150 50 M150 60 L158 64" stroke="#2a2a2a" stroke-width="2"/>
    <path d="M50 196 C50 146 70 122 100 118 C130 122 150 146 150 196Z" fill="#5a3a1a"/>
    <path d="M70 140 L130 140 M66 160 L134 160" stroke="#c69a3c" stroke-width="3"/>
    <circle cx="100" cy="84" r="28" fill="#d9b08a"/>
    <path d="M72 80 C72 50 128 50 128 80 L124 70 Q100 56 76 70Z" fill="#7a7a7a"/>
    <circle cx="88" cy="84" r="9" fill="#fff" stroke="#c69a3c" stroke-width="3"/><circle cx="112" cy="84" r="9" fill="#fff" stroke="#c69a3c" stroke-width="3"/>
    <circle cx="88" cy="85" r="3" fill="#2a2a2a"/><circle cx="112" cy="85" r="3" fill="#2a2a2a"/>
    <path d="M78 96 C80 116 120 116 122 96 Q100 104 78 96Z" fill="#e8e8e8"/>
    <path d="M136 150 L166 120" stroke="#c69a3c" stroke-width="6" stroke-linecap="round"/><path d="M162 112 L176 108 L170 124Z" fill="#c69a3c"/>
    <path d="M118 66 L132 52" stroke="#11b5a4" stroke-width="3"/>`;

  D.nebulosa_viva = G => {
    let s = '';
    for (let i = 0; i < 18; i++) s += star((i * 41 + 9) % 200, (i * 33 + 17) % 200, 1 + (i % 3), '#fff', 0.7);
    return `${s}
    <ellipse cx="80" cy="80" rx="80" ry="50" fill="#ff9cf0" opacity=".35" filter="url(#BL)"/>
    <ellipse cx="130" cy="120" rx="70" ry="50" fill="#4ff0ff" opacity=".3" filter="url(#BL)"/>
    <ellipse cx="100" cy="100" rx="60" ry="44" fill="#8b5cf6" opacity=".5" filter="url(#BL)"/>
    <path d="M40 100 C60 50 140 50 160 100 C140 150 60 150 40 100Z" fill="#b08cff" opacity=".35"/>
    ${eyes(100, 98, 18, 9, '#5a0a8a')}${smile(100, 118, 8, '#fff')}
    <circle cx="60" cy="70" r="6" fill="#fff"/><circle cx="60" cy="70" r="14" fill="#fff" opacity=".3" filter="url(#BL)"/>
    <circle cx="150" cy="140" r="5" fill="#ffe14d"/><circle cx="150" cy="140" r="12" fill="#ffe14d" opacity=".35" filter="url(#BL)"/>`;
  };

  D.deus_apostador = G => `
    <circle cx="100" cy="80" r="80" fill="#ffe680" opacity=".25" filter="url(#BL)"/>
    <ellipse cx="100" cy="34" rx="30" ry="7" fill="none" stroke="#ffe680" stroke-width="4"/>
    <path d="M50 196 C50 146 70 122 100 118 C130 122 150 146 150 196Z" fill="#f2ead8" stroke="#c69a3c" stroke-width="2"/>
    <path d="M86 122 L100 160 L114 122" fill="#ffc21a"/>
    <circle cx="100" cy="80" r="28" fill="#f2d6c0"/>
    <path d="M72 78 C70 50 130 50 128 78 Q118 60 100 62 Q82 60 72 78Z" fill="#ffe14d"/>
    ${glowEye(90, 82, 5, 3, '#ffc21a')}${glowEye(110, 82, 5, 3, '#ffc21a')}<path d="M90 96 Q100 100 112 92" stroke="#7a3a1a" stroke-width="2.5" fill="none"/>
    <rect x="136" y="120" width="26" height="26" rx="5" fill="#fff" stroke="#2a2a2a" stroke-width="2" transform="rotate(15 149 133)"/>
    <circle cx="145" cy="128" r="2.5" fill="#d6402a"/><circle cx="153" cy="138" r="2.5" fill="#d6402a"/><circle cx="149" cy="133" r="2.5" fill="#d6402a"/>
    <circle cx="44" cy="140" r="12" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/><circle cx="30" cy="160" r="10" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/>`;

  D.coelho_divino = G => `
    <circle cx="100" cy="100" r="76" fill="#b4f07a" opacity=".25" filter="url(#BL)"/>
    <ellipse cx="100" cy="30" rx="26" ry="6" fill="none" stroke="#ffe680" stroke-width="3"/>
    ${shadow(182, 40)}
    <path d="M78 78 C66 34 70 10 82 10 C94 10 96 46 92 78Z" fill="#fff" stroke="#c4c9d4" stroke-width="2"/><path d="M80 66 C76 40 78 24 82 22 C86 24 88 46 86 66Z" fill="#ffb0d0"/>
    <path d="M122 78 C134 34 130 10 118 10 C106 10 104 46 108 78Z" fill="#fff" stroke="#c4c9d4" stroke-width="2"/><path d="M120 66 C124 40 122 24 118 22 C114 24 112 46 114 66Z" fill="#ffb0d0"/>
    <ellipse cx="100" cy="148" rx="40" ry="34" fill="#fff"/>
    <circle cx="100" cy="100" r="34" fill="#fff"/>
    <path d="M78 92 L92 98 M122 92 L108 98" stroke="#5a1a1a" stroke-width="3" stroke-linecap="round"/>
    ${eyes(100, 102, 13, 7, '#d6402a')}<path d="M96 116 L104 116 L100 120Z" fill="#ff7aa0"/><path d="M94 124 Q100 120 106 124" stroke="#5a1a1a" stroke-width="2" fill="none"/>
    <path d="M70 70 L60 60 M130 70 L140 60" stroke="#ffe14d" stroke-width="2"/>
    ${spark(36, 100, 7, '#ffe14d')}${spark(166, 120, 6, '#ffe14d')}`;

  D.possibilidade_perdida = G => `
    <circle cx="100" cy="100" r="80" fill="#11b5a4" opacity=".2" filter="url(#BL)"/>
    ${[0, 1, 2, 3].map(i => `<circle cx="100" cy="100" r="${30 + i * 18}" fill="none" stroke="#a6fff2" stroke-width="2" stroke-dasharray="${2 + i * 3} ${6 + i * 4}" opacity="${0.8 - i * 0.15}"/>`).join('')}
    <path d="M100 40 C130 40 150 70 150 100 C150 140 120 160 100 160 C80 160 50 140 50 100 C50 70 70 40 100 40Z" fill="#e6fffb" opacity=".25" stroke="#a6fff2" stroke-width="2" stroke-dasharray="4 4"/>
    ${glowEye(86, 96, 6, 4, '#a6fff2')}${glowEye(114, 96, 6, 4, '#a6fff2')}
    <path d="M90 116 Q100 112 110 116" stroke="#a6fff2" stroke-width="2" fill="none"/>
    <path d="M30 40 L60 60 M170 40 L140 60 M30 160 L60 140 M170 160 L140 140" stroke="#ff4b6b" stroke-width="2" opacity=".6"/>`;

  D.fragmento_topo = G => {
    let s = '';
    for (let i = 0; i < 20; i++) s += star((i * 47 + 5) % 200, (i * 31 + 3) % 200, 1 + (i % 3), '#fff', 0.6);
    return `${s}<circle cx="100" cy="100" r="80" fill="#ffe14d" opacity=".2" filter="url(#BL)"/>
    <path d="M100 20 L150 90 L120 180 L80 180 L50 90Z" fill="#fff8d8" stroke="#ffc21a" stroke-width="3"/>
    <path d="M100 20 L120 180 M100 20 L80 180 M50 90 L150 90" stroke="#ffc21a" stroke-width="1.5" opacity=".6"/>
    <path d="M60 60 L140 60 M70 40 L130 40" stroke="#fff" stroke-width="1" opacity=".5"/>
    <circle cx="100" cy="100" r="14" fill="#fff"/><circle cx="100" cy="100" r="28" fill="#ffe14d" opacity=".45" filter="url(#BL)"/>
    ${glowEye(90, 96, 3, 2, '#8b5cf6')}${glowEye(110, 96, 3, 2, '#8b5cf6')}`;
  };

  /* ---------------------------------------------------------------- Gustavo e Téo */
  D.gustavo = G => `
    <rect width="200" height="200" fill="#1a1612"/>
    <rect x="0" y="0" width="200" height="120" fill="#24303a"/><circle cx="160" cy="34" r="14" fill="#fff4cf" opacity=".7"/>
    <path d="M0 120 L200 120" stroke="#5a5040" stroke-width="4"/><path d="M10 120 L10 160 M50 120 L50 160 M90 120 L90 160 M130 120 L130 160 M170 120 L170 160" stroke="#5a5040" stroke-width="3"/>
    <path d="M44 200 C44 150 64 130 100 126 C136 130 156 150 156 200Z" fill="#3a5a8a"/>
    <path d="M86 128 L100 150 L114 128" fill="#e8e8e8"/>
    <rect x="86" y="108" width="28" height="22" fill="#c98a5a"/>
    <circle cx="100" cy="82" r="30" fill="#d99a6a"/>
    <path d="M70 80 C66 52 84 44 100 44 C120 44 134 54 130 80 C126 64 114 60 100 60 C86 60 76 66 70 80Z" fill="#3a2414"/>
    ${eyes(100, 84, 11, 6, '#4a2a14')}
    <path d="M86 98 Q100 112 114 98" stroke="#5a2a1a" stroke-width="3" fill="#fff"/>
    <path d="M78 74 L92 76 M108 76 L122 74" stroke="#3a2414" stroke-width="3" stroke-linecap="round"/>
    <rect x="120" y="150" width="62" height="12" rx="2" fill="#c98a3a" stroke="#7a4a1a" stroke-width="2"/>
    <path d="M122 150 L180 150 L166 140 L136 140Z" fill="#e8a84a" stroke="#7a4a1a" stroke-width="2"/>
    <text x="151" y="160" text-anchor="middle" font-size="8" font-weight="900" fill="#7a1a1a" font-family="sans-serif">PIZZA</text>
    <rect x="22" y="160" width="40" height="22" rx="10" fill="#2a2a2a"/><circle cx="34" cy="171" r="4" fill="#ff4b4b"/><circle cx="50" cy="168" r="3" fill="#3ddc84"/><circle cx="54" cy="174" r="3" fill="#3b8bff"/>
    <text x="16" y="24" font-family="sans-serif" font-size="9" font-weight="800" fill="#ffe08a" opacity=".85">QUINTA · 21:00</text>`;

  D.teo = G => `
    <rect width="200" height="200" fill="#14121a"/>
    <circle cx="100" cy="70" r="70" fill="#ffe8a8" opacity=".15" filter="url(#BL)"/>
    <path d="M40 200 C40 150 62 128 100 124 C138 128 160 150 160 200Z" fill="#1e2230"/>
    <path d="M88 126 L100 160 L112 126" fill="#f2f2f2"/><path d="M98 132 L102 132 L104 160 L100 166 L96 160Z" fill="#3a3a5a"/>
    <rect x="88" y="104" width="24" height="22" fill="#c9946e"/>
    <circle cx="100" cy="80" r="28" fill="#d9a27a"/>
    <path d="M72 78 C70 50 86 42 100 42 C116 42 130 52 128 78 C122 62 112 58 100 58 C88 58 78 64 72 78Z" fill="#2a1a10"/>
    ${eyes(100, 82, 10, 6, '#3a2a14')}<path d="M90 98 Q98 102 108 96" stroke="#5a2a1a" stroke-width="2.5" fill="none"/>
    <path d="M78 72 L92 74 M108 72 L122 70" stroke="#2a1a10" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 170 C30 150 50 146 62 156 C70 146 92 150 90 170 C88 190 34 192 30 170Z" fill="#c98a3a" stroke="#6b4422" stroke-width="2"/>
    <circle cx="60" cy="168" r="7" fill="#3a2414"/>
    <path d="M86 158 L150 120" stroke="#6b4422" stroke-width="6"/><rect x="146" y="112" width="16" height="10" rx="2" fill="#3a2414" transform="rotate(-30 154 117)"/>
    <path d="M150 50 C154 44 160 44 162 48 M166 40 C172 32 180 32 182 38" stroke="#ffe08a" stroke-width="2" fill="none"/><circle cx="148" cy="52" r="3" fill="#ffe08a"/><circle cx="164" cy="42" r="3" fill="#ffe08a"/>
    <text x="184" y="190" text-anchor="end" font-family="sans-serif" font-size="9" font-weight="800" fill="#ffe08a" opacity=".85">ué.</text>`;

  /* ---------------------------------------------------------------- chefes do Ato IV */
  B.plateia = G => {
    let seats = '';
    for (let r = 0; r < 4; r++) for (let i = 0; i < 9 - r; i++) {
      const x = 14 + i * 22 + r * 11, y = 150 - r * 30;
      seats += `<circle cx="${x}" cy="${y}" r="9" fill="#f2d6c0"/><ellipse cx="${x}" cy="${y - 12}" rx="9" ry="3" fill="none" stroke="#ffe680" stroke-width="2"/>${glowEye(x - 3, y, 1.5, 1.2, '#ffc21a')}${glowEye(x + 3, y, 1.5, 1.2, '#ffc21a')}<path d="M${x - 10} ${y + 22} Q${x} ${y + 8} ${x + 10} ${y + 22}" fill="#fff8d8"/>`;
    }
    return `<rect width="200" height="200" fill="#1a1408"/>
    <circle cx="100" cy="40" r="60" fill="#ffe680" opacity=".3" filter="url(#BL)"/>
    ${seats}
    <path d="M60 30 L76 10 L92 26 L100 4 L108 26 L124 10 L140 30Z" fill="#ffc21a" opacity=".8"/>
    <rect x="70" y="170" width="60" height="22" rx="4" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/><text x="100" y="186" text-anchor="middle" font-size="12" font-weight="900" fill="#5a3a00" font-family="sans-serif">APOSTAS</text>`;
  };
  B.rei_coelho = G => `
    <rect width="200" height="200" fill="#0a1a0a"/>
    <circle cx="100" cy="110" r="90" fill="#ff2e2e" opacity=".2" filter="url(#BL)"/>
    <path d="M70 90 C50 30 56 0 74 0 C92 0 94 50 88 90Z" fill="#fff" stroke="#c4c9d4" stroke-width="3"/><path d="M74 80 C66 40 70 16 74 14 C80 16 82 50 80 80Z" fill="#ffb0d0"/>
    <path d="M130 90 C150 30 144 0 126 0 C108 0 106 50 112 90Z" fill="#fff" stroke="#c4c9d4" stroke-width="3"/><path d="M126 80 C134 40 130 16 126 14 C120 16 118 50 120 80Z" fill="#ffb0d0"/>
    <path d="M64 50 L72 30 L84 44 L100 24 L116 44 L128 30 L136 50Z" fill="#ffc21a" stroke="#8a5a00" stroke-width="2"/>
    <ellipse cx="100" cy="170" rx="70" ry="50" fill="#fff"/>
    <circle cx="100" cy="114" r="50" fill="#fff"/>
    <path d="M66 100 L90 110 M134 100 L110 110" stroke="#5a1a1a" stroke-width="5" stroke-linecap="round"/>
    ${glowEye(80, 118, 9, 7, '#ff2e2e')}${glowEye(120, 118, 9, 7, '#ff2e2e')}
    <path d="M94 134 L106 134 L100 140Z" fill="#ff7aa0"/><path d="M86 150 Q100 140 114 150" stroke="#5a1a1a" stroke-width="3" fill="none"/>
    <path d="M94 150 L94 160 L100 160 L100 150 M100 150 L100 160 L106 160 L106 150" fill="#fff" stroke="#5a1a1a" stroke-width="1.5"/>
    ${bolt(20, 140, 1.2, '#ff2e2e')}${bolt(170, 130, 1.2, '#ff2e2e')}`;
  B.trigg = G => `
    <rect width="200" height="200" fill="#030a0a"/>
    <path d="M100 0 L92 40 L108 70 L88 110 L112 150 L96 200" stroke="#a6fff2" stroke-width="3" fill="none"/>
    <path d="M100 0 L92 40 L108 70 L88 110 L112 150 L96 200" stroke="#a6fff2" stroke-width="16" fill="none" opacity=".15"/>
    <path d="M40 200 C40 150 64 120 100 116 C136 120 160 150 160 200Z" fill="#0a2020" stroke="#11b5a4" stroke-width="2"/>
    <path d="M60 140 C40 120 30 100 34 80 M140 140 C160 120 170 100 166 80" stroke="#0a2020" stroke-width="12" fill="none" stroke-linecap="round"/>
    <circle cx="34" cy="74" r="12" fill="#11b5a4" opacity=".6" filter="url(#BL)"/><circle cx="166" cy="74" r="12" fill="#11b5a4" opacity=".6" filter="url(#BL)"/>
    <circle cx="100" cy="80" r="32" fill="#0e2a28"/>
    <path d="M70 76 C68 48 132 48 130 76 L134 60 Q100 30 66 60Z" fill="#05100f"/>
    ${glowEye(88, 82, 7, 3, '#ff4b6b')}${glowEye(112, 82, 7, 3, '#ff4b6b')}
    <path d="M86 100 L114 100" stroke="#a6fff2" stroke-width="2"/>
    ${[0, 1, 2].map(i => `<rect x="${20 + i * 60}" y="${20 + i * 10}" width="16" height="16" fill="none" stroke="#a6fff2" stroke-width="1.5" stroke-dasharray="2 3" opacity=".6" transform="rotate(${i * 20} ${28 + i * 60} ${28 + i * 10})"/>`).join('')}`;
  B.nivel_de_cima = G => {
    let steps = '';
    for (let i = 0; i < 6; i++) steps += `<rect x="${20 + i * 12}" y="${180 - i * 16}" width="${160 - i * 24}" height="14" fill="#2a1a5a" opacity="${0.4 + i * 0.1}" stroke="#ffe14d" stroke-width="1"/>`;
    let s = '';
    for (let i = 0; i < 20; i++) s += star((i * 43 + 7) % 200, (i * 29 + 5) % 120, 1 + (i % 3), '#fff', 0.6);
    return `<rect width="200" height="200" fill="#000"/>${s}${steps}
    <circle cx="100" cy="50" r="60" fill="#ffe14d" opacity=".25" filter="url(#BL)"/>
    <path d="M100 6 C130 6 146 30 146 56 C146 82 126 94 100 94 C74 94 54 82 54 56 C54 30 70 6 100 6Z" fill="#fff8d8" opacity=".9"/>
    ${glowEye(84, 52, 8, 4, '#8b5cf6')}${glowEye(116, 52, 8, 4, '#8b5cf6')}
    <path d="M86 74 L114 74" stroke="#8b5cf6" stroke-width="2"/>
    <path d="M30 100 C50 90 70 96 80 104 M170 100 C150 90 130 96 120 104" stroke="#fff8d8" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>
    <circle cx="100" cy="50" r="70" fill="none" stroke="#ffe14d" stroke-width="2" stroke-dasharray="3 8"/>`;
  };

  /* ---------------------------------------------------------------- arte das fusões
     Cada fusão é um personagem NOVO, desenhado do zero, que herda traços dos
     dois "pais". Todos levam no peito a Marca da Fusão: um emblema dividido
     nas cores dos dois elementos. */
  const fmark = (x, y, r, c1, c2) => `<circle cx="${x}" cy="${y}" r="${r * 1.8}" fill="#fff" opacity=".35" filter="url(#BL)"/>
    <path d="M${x} ${y - r} A${r} ${r} 0 0 0 ${x} ${y + r} A${r / 2} ${r / 2} 0 0 0 ${x} ${y} A${r / 2} ${r / 2} 0 0 1 ${x} ${y - r}Z" fill="${c1}"/>
    <path d="M${x} ${y - r} A${r} ${r} 0 0 1 ${x} ${y + r} A${r / 2} ${r / 2} 0 0 1 ${x} ${y} A${r / 2} ${r / 2} 0 0 0 ${x} ${y - r}Z" fill="${c2}"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="1.6"/>`;
  const bg = (G, a, b, c) => `<radialGradient id="${G('bg')}" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient><rect width="200" height="200" fill="url(#${G('bg')})"/>`;

  // Inferno Rex + Rainha do Gelo: guerreiro metade lava, metade cristal, envolto em vapor
  D.fx_vaporex = G => `
    ${bg(G, '#5a3a5a', '#2a1a3a', '#0a0a1a')}
    <linearGradient id="${G('ar')}" x1="0" y1="0" x2="1" y2="0"><stop offset=".49" stop-color="#c8321a"/><stop offset=".51" stop-color="#7fd8ff"/></linearGradient>
    <linearGradient id="${G('st')}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></linearGradient>
    <path d="M10 190 C30 150 0 120 30 90 M190 190 C170 150 200 120 170 90" stroke="url(#${G('st')})" stroke-width="14" fill="none" stroke-linecap="round" opacity=".5" filter="url(#BL)"/>
    ${shadow(186, 60)}
    <path d="M54 186 L62 132 C62 116 78 106 100 106 C122 106 138 116 138 132 L146 186Z" fill="url(#${G('ar')})" stroke="#1a0a1a" stroke-width="3"/>
    <path d="M100 108 L100 186" stroke="#fff" stroke-width="2" opacity=".8"/>
    <path d="M64 140 L76 150 L66 164 M72 124 L84 132" stroke="#ffb02e" stroke-width="3" fill="none"/>
    <path d="M124 128 L134 136 L128 150 M120 160 L134 170" stroke="#e8fbff" stroke-width="3" fill="none"/>
    <path d="M52 120 C40 112 36 100 42 92 L62 112Z" fill="#8a1a0a" stroke="#1a0a1a" stroke-width="2"/>
    <path d="M148 120 L164 92 L156 116 L170 104 L152 128Z" fill="#bfefff" stroke="#3a7aaa" stroke-width="2"/>
    ${fmark(100, 146, 9, '#ff5a2e', '#7fd8ff')}
    <path d="M100 52 C76 52 66 70 68 88 C70 104 84 112 100 112 C116 112 130 104 132 88 C134 70 124 52 100 52Z" fill="url(#${G('ar')})" stroke="#1a0a1a" stroke-width="3"/>
    <path d="M70 66 C62 46 70 30 78 24 C78 40 84 50 90 56Z" fill="#ff7a1a"/>${flame(76, 46, 0.7, '#ffb02e', '#fff2a8')}
    <path d="M110 56 L116 24 L122 50 L132 30 L130 58 L142 44 L134 70Z" fill="#dff6ff" stroke="#5aaaff" stroke-width="2"/>
    ${glowEye(86, 84, 6, 3.5, '#ffb02e')}${glowEye(114, 84, 6, 3.5, '#7fefff')}
    <path d="M88 100 L112 100" stroke="#1a0a1a" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 70 L30 190" stroke="#3a2a2a" stroke-width="5"/><path d="M30 70 C10 60 10 30 30 16 C40 30 44 50 30 70Z" fill="#ff5a2e"/><path d="M30 70 C50 60 50 30 30 16" fill="#9fe6ff" opacity=".85"/>
    ${snow(160, 30, 7, '#fff')}${snow(176, 64, 5, '#dff6ff')}`;

  // Dragão de Raio + Fantasma do Mar: serpente marinha elétrica com chapéu de marinheiro e cauda de névoa
  D.fx_dragao_mare = G => `
    ${bg(G, '#1a5a7a', '#0a2a4a', '#040a1a')}
    <linearGradient id="${G('bd')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff27a"/><stop offset=".5" stop-color="#33d2ff"/><stop offset="1" stop-color="#1a6aaa" stop-opacity=".3"/></linearGradient>
    <path d="M0 170 C30 156 50 184 80 170 C110 156 130 184 160 170 C180 162 190 166 200 170 L200 200 L0 200Z" fill="#0a4a7a"/>
    <path d="M0 176 C30 162 50 190 80 176 C110 162 130 190 160 176" stroke="#9fe6ff" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M170 186 C160 140 120 150 110 120 C100 90 140 80 130 50" stroke="url(#${G('bd')})" stroke-width="30" fill="none" stroke-linecap="round"/>
    <path d="M170 186 C160 140 120 150 110 120 C100 90 140 80 130 50" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="2 10" opacity=".7"/>
    <path d="M116 130 L100 122 L112 116 M108 100 L92 96 L104 90" stroke="#fff27a" stroke-width="3" fill="none"/>
    <path d="M150 66 C150 40 120 28 96 36 C74 44 70 66 86 78 L120 84 C134 84 150 80 150 66Z" fill="#33d2ff" stroke="#0a2a4a" stroke-width="2.5"/>
    <path d="M86 78 C70 82 54 80 46 72 C60 70 74 66 86 64Z" fill="#33d2ff" stroke="#0a2a4a" stroke-width="2"/>
    <path d="M50 74 L58 80 L62 74 L68 80 L72 74" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M92 34 C96 20 130 18 140 30 L150 36 L86 40Z" fill="#1a2a4a" stroke="#0a0a1a" stroke-width="2"/><path d="M90 38 L148 36" stroke="#fff" stroke-width="3"/>
    ${glowEye(108, 54, 6, 4, '#fff27a')}
    <path d="M140 46 L168 30 L156 50 L180 46 L150 62" fill="#fff27a" stroke="#c8a000" stroke-width="1.5"/>
    ${bolt(30, 20, 1.3, '#fff27a')}${bolt(166, 96, 1, '#fff27a')}
    <path d="M30 110 L30 96 L40 92 L40 106" stroke="#cfefff" stroke-width="2" fill="none"/><circle cx="27" cy="110" r="4" fill="#cfefff"/><circle cx="37" cy="106" r="4" fill="#cfefff"/>
    <path d="M56 130 L56 120 L64 118" stroke="#cfefff" stroke-width="2" fill="none" opacity=".7"/><circle cx="53" cy="130" r="3.5" fill="#cfefff" opacity=".7"/>
    ${fmark(122, 108, 7, '#fff27a', '#33d2ff')}`;

  // Titã Solar + Ninja das Sombras: guerreiro com halo de eclipse, máscara ninja e armadura de ouro
  D.fx_eclipse_vivo = G => `
    ${bg(G, '#3a2a5a', '#1a1030', '#06040e')}
    <circle cx="100" cy="62" r="56" fill="#ffd34a" opacity=".45" filter="url(#BL)"/>
    ${[...Array(16)].map((_, i) => { const a = Math.PI * 2 * i / 16; return `<path d="M${100 + Math.cos(a) * 44} ${62 + Math.sin(a) * 44} L${100 + Math.cos(a) * (60 + (i % 2) * 12)} ${62 + Math.sin(a) * (60 + (i % 2) * 12)}" stroke="#ffe680" stroke-width="3" stroke-linecap="round"/>`; }).join('')}
    <circle cx="100" cy="62" r="42" fill="#0a0614" stroke="#ffe680" stroke-width="3"/>
    ${shadow(188, 56)}
    <path d="M52 190 L60 130 C62 114 80 104 100 104 C120 104 138 114 140 130 L148 190Z" fill="#1e1438" stroke="#0a0614" stroke-width="3"/>
    <path d="M60 130 C62 114 80 104 100 104 L100 190 L56 190Z" fill="#c89a1a" opacity=".9"/>
    <path d="M58 124 C46 116 44 104 52 98 L72 112Z" fill="#ffd34a" stroke="#6a4a00" stroke-width="2"/>
    <path d="M142 124 C154 116 156 104 148 98 L128 112Z" fill="#3a2a6a" stroke="#0a0614" stroke-width="2"/>
    <path d="M70 160 L100 140 L130 160" stroke="#ffe680" stroke-width="3" fill="none"/>
    ${fmark(100, 128, 8, '#ffd34a', '#5a3aaa')}
    <circle cx="100" cy="70" r="28" fill="#e8b88a"/>
    <path d="M72 76 C72 92 84 100 100 100 C116 100 128 92 128 76Z" fill="#1e1438"/>
    <path d="M72 60 C72 44 128 44 128 60 L128 66 L72 66Z" fill="#1e1438"/>
    <path d="M128 60 C144 56 156 62 164 72 C150 68 140 68 128 66Z" fill="#8a5aff"/>
    ${glowEye(89, 70, 5, 3, '#ffe680')}${glowEye(111, 70, 5, 3, '#b48aff')}
    <path d="M24 186 L76 120" stroke="#ffe680" stroke-width="4" stroke-linecap="round"/><path d="M176 186 L124 120" stroke="#b48aff" stroke-width="4" stroke-linecap="round"/>
    <path d="M24 186 L76 120" stroke="#fff" stroke-width="12" opacity=".2" filter="url(#BL)"/>`;

  // Chronos + Gravitar: sábio cujo corpo é um buraco negro, com relógio de auréola e serpente orbital
  D.fx_singularidade = G => {
    let ticks = '';
    for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; ticks += `<line x1="${100 + Math.cos(a) * 34}" y1="${48 + Math.sin(a) * 34}" x2="${100 + Math.cos(a) * 40}" y2="${48 + Math.sin(a) * 40}" stroke="#7fffe0" stroke-width="${i % 3 ? 1.5 : 3}"/>`; }
    return `
    ${bg(G, '#1a3a3a', '#0a1420', '#020408')}
    <radialGradient id="${G('dk')}" cx="50%" cy="50%" r="50%"><stop offset=".35" stop-color="#000"/><stop offset=".55" stop-color="#ff9a3a"/><stop offset=".75" stop-color="#8a3aff" stop-opacity=".6"/><stop offset="1" stop-color="#8a3aff" stop-opacity="0"/></radialGradient>
    <circle cx="100" cy="48" r="40" fill="none" stroke="#7fffe0" stroke-width="2" opacity=".8"/>${ticks}
    <path d="M100 48 L100 22 M100 48 L118 58" stroke="#7fffe0" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M56 190 C60 140 74 100 100 96 C126 100 140 140 144 190Z" fill="#14202a" stroke="#7fffe0" stroke-width="2"/>
    <ellipse cx="100" cy="146" rx="58" ry="20" fill="url(#${G('dk')})" transform="rotate(-12 100 146)"/>
    <circle cx="100" cy="146" r="14" fill="#000" stroke="#ffcf8a" stroke-width="2"/>
    <path d="M28 120 C40 96 160 96 172 120 C184 150 30 170 28 130" stroke="#8a3aff" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M28 120 C40 96 160 96 172 120" stroke="#c8a0ff" stroke-width="2" fill="none" stroke-dasharray="4 6"/>
    <path d="M172 120 L186 114 L180 126Z" fill="#8a3aff"/>${glowEye(176, 118, 2, 2, '#ffe14d')}
    <circle cx="100" cy="76" r="22" fill="#cfe8e0"/>
    <path d="M78 78 C76 56 124 56 122 78 C122 64 112 58 100 58 C88 58 78 64 78 78Z" fill="#14202a"/>
    <path d="M84 92 C88 112 112 112 116 92 C110 100 90 100 84 92Z" fill="#e8f8f4"/>
    ${glowEye(91, 76, 4.5, 3, '#7fffe0')}${glowEye(109, 76, 4.5, 3, '#c8a0ff')}
    <path d="M150 150 L162 150 L156 160Z M150 170 L162 170 L156 160Z" fill="#ffcf8a" stroke="#7a4a1a" stroke-width="1.5"/>
    ${star(24, 30, 3, '#fff', .8)}${star(180, 20, 2, '#fff', .7)}
    ${fmark(100, 122, 7, '#7fffe0', '#8a3aff')}`;
  };

  // Golem de Terra + Guardião Espinhoso: fortaleza de pedra com uma árvore crescendo nas costas
  D.fx_bastiao = G => `
    ${bg(G, '#3a5a2a', '#1a2a14', '#080e06')}
    <path d="M0 176 L200 176 L200 200 L0 200Z" fill="#2a2014"/>
    <path d="M100 40 C80 10 40 20 44 46 C20 50 26 80 52 78 L148 78 C174 80 180 50 156 46 C160 20 120 10 100 40Z" fill="#3a9a3a" stroke="#1a4a1a" stroke-width="3"/>
    <path d="M70 40 C66 30 80 26 84 34 M124 34 C130 26 142 32 138 42" stroke="#7ad86a" stroke-width="3" fill="none"/>
    <circle cx="70" cy="56" r="4" fill="#ff6f91"/><circle cx="134" cy="52" r="4" fill="#ff6f91"/><circle cx="104" cy="30" r="4" fill="#ffe14d"/>
    <path d="M94 78 L92 60 M106 78 L110 58" stroke="#5a3a1a" stroke-width="7" stroke-linecap="round"/>
    ${shadow(178, 70)}
    <path d="M36 176 L44 112 C44 92 66 80 100 80 C134 80 156 92 156 112 L164 176Z" fill="#7a7468" stroke="#2a2620" stroke-width="3"/>
    <path d="M44 112 L30 100 L30 86 L42 86 L42 92 L50 92 L50 86 L60 86 L60 98Z" fill="#8a8478" stroke="#2a2620" stroke-width="2.5"/>
    <path d="M156 112 L170 100 L170 86 L158 86 L158 92 L150 92 L150 86 L140 86 L140 98Z" fill="#8a8478" stroke="#2a2620" stroke-width="2.5"/>
    <path d="M60 130 L78 124 L84 140 M120 124 L140 132 L132 148 M70 160 L90 156" stroke="#4a463c" stroke-width="2.5" fill="none"/>
    <path d="M40 150 C60 160 70 140 90 150 C110 160 130 140 160 156" stroke="#2f7a2a" stroke-width="5" fill="none"/>
    ${[50, 72, 96, 118, 142].map((x, i) => `<path d="M${x} ${150 + (i % 2) * 6} l-4 -8 l8 0Z" fill="#6ad04a"/>`).join('')}
    <rect x="70" y="96" width="60" height="26" rx="6" fill="#4a463c"/>
    ${glowEye(86, 109, 7, 4, '#9cff6a')}${glowEye(114, 109, 7, 4, '#9cff6a')}
    ${fmark(100, 136, 8, '#c49a5a', '#3ddc5a')}
    ${leaf(14, 130, 1, -30, '#7ad86a')}${leaf(168, 150, 0.9, 200, '#7ad86a')}`;

  // Rei do Vazio + Prismora: rei cósmico com manto de galáxia, segurando uma estrela-criança no colo
  D.fx_big_crunch = G => {
    let st = '';
    for (let i = 0; i < 26; i++) st += star(46 + (i * 37) % 110, 110 + (i * 23) % 80, 1 + (i % 3) * 0.6, i % 4 ? '#fff' : '#ffcf6a', 0.8);
    return `
    ${bg(G, '#2a0a4a', '#10041e', '#000')}
    <linearGradient id="${G('pr')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5a8a"/><stop offset=".25" stop-color="#ffcf4a"/><stop offset=".5" stop-color="#5affb4"/><stop offset=".75" stop-color="#4ab4ff"/><stop offset="1" stop-color="#b45aff"/></linearGradient>
    <path d="M100 140 L0 40 L0 80Z M100 140 L200 40 L200 80Z" fill="url(#${G('pr')})" opacity=".35"/>
    <path d="M40 200 C40 130 64 92 100 90 C136 92 160 130 160 200Z" fill="#14082a" stroke="#b45aff" stroke-width="2.5"/>
    <g opacity=".9">${st}</g>
    <path d="M70 120 C80 150 120 150 130 120" stroke="#2a1450" stroke-width="12" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="138" r="14" fill="#fff8d8"/><circle cx="100" cy="138" r="26" fill="url(#${G('pr')})" opacity=".55" filter="url(#BL)"/>
    ${eyes(100, 136, 5, 2.6, '#4ab4ff')}${smile(100, 142, 3)}
    ${spark(100, 116, 7, '#fff')}
    <circle cx="100" cy="62" r="26" fill="#0a0414" stroke="#b45aff" stroke-width="2.5"/>
    <path d="M72 46 L76 18 L88 36 L100 10 L112 36 L124 18 L128 46Z" fill="#1a0a30" stroke="#ffcf4a" stroke-width="2.5"/>
    <circle cx="100" cy="28" r="4" fill="url(#${G('pr')})"/>
    ${glowEye(90, 62, 5, 3, '#e8a8ff')}${glowEye(110, 62, 5, 3, '#e8a8ff')}
    <path d="M90 76 Q100 80 110 76" stroke="#e8a8ff" stroke-width="2" fill="none"/>
    ${fmark(100, 102, 6, '#b45aff', '#ffcf4a')}`;
  };

  // Fênix Rubra + Serafim da Aurora: fênix de seis asas, metade fogo, metade amanhecer
  D.fx_fenix_aurora = G => `
    ${bg(G, '#ff9a6a', '#8a2a4a', '#1a0614')}
    <linearGradient id="${G('w1')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff3a1a"/></linearGradient>
    <linearGradient id="${G('w2')}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff4cf"/><stop offset=".5" stop-color="#ff9ad8"/><stop offset="1" stop-color="#8ad8ff"/></linearGradient>
    <circle cx="100" cy="40" r="22" fill="none" stroke="#fff4cf" stroke-width="4"/><circle cx="100" cy="40" r="30" fill="#fff4cf" opacity=".35" filter="url(#BL)"/>
    <path d="M90 90 C60 40 20 40 6 60 C30 64 44 76 52 92 C30 90 14 100 8 116 C36 108 60 110 86 112Z" fill="url(#${G('w1')})" stroke="#8a1a0a" stroke-width="2"/>
    <path d="M110 90 C140 40 180 40 194 60 C170 64 156 76 148 92 C170 90 186 100 192 116 C164 108 140 110 114 112Z" fill="url(#${G('w2')})" stroke="#8a4a8a" stroke-width="2"/>
    <path d="M88 118 C60 126 40 146 34 168 C56 154 72 146 92 140Z" fill="#ff7a1a" opacity=".9"/>
    <path d="M112 118 C140 126 160 146 166 168 C144 154 128 146 108 140Z" fill="#ffb4e8" opacity=".9"/>
    <path d="M92 140 C80 170 70 186 60 198 M100 144 L100 200 M108 140 C120 170 130 186 140 198" stroke="url(#${G('w1')})" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="100" cy="112" rx="18" ry="30" fill="#ffcf4a" stroke="#8a3a0a" stroke-width="2"/>
    <path d="M100 82 L100 142" stroke="#fff4cf" stroke-width="2" opacity=".6"/>
    <circle cx="100" cy="74" r="14" fill="#ffcf4a" stroke="#8a3a0a" stroke-width="2"/>
    <path d="M96 60 C94 48 100 40 104 44 C106 50 104 56 100 62Z" fill="#ff3a1a"/><path d="M104 60 C108 50 116 48 116 54 C114 58 110 60 104 62Z" fill="#ff9ad8"/>
    <path d="M100 80 L110 84 L100 88Z" fill="#ff7a1a"/>
    ${glowEye(95, 72, 3, 2.5, '#ff3a1a')}${glowEye(105, 72, 3, 2.5, '#8ad8ff')}
    ${fmark(100, 112, 7, '#ff3a1a', '#ff9ad8')}
    ${flame(30, 190, 0.7, '#ff7a1a', '#ffe14d')}${spark(170, 180, 6, '#fff4cf')}${spark(160, 150, 4, '#fff4cf')}`;

  // Kraken Abissal + Leviatã de Plasma: monstro do fundo do mar com barbatanas de plasma
  D.fx_leviata_abissal = G => `
    <linearGradient id="${G('sea')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1a5a"/><stop offset=".4" stop-color="#0a2a5a"/><stop offset="1" stop-color="#020814"/></linearGradient>
    <rect width="200" height="200" fill="url(#${G('sea')})"/>
    <circle cx="100" cy="0" r="50" fill="#ff5ae8" opacity=".35" filter="url(#BL)"/>
    <path d="M20 0 L60 120 M80 0 L90 110 M140 0 L120 120 M190 0 L150 110" stroke="#9fe6ff" stroke-width="6" opacity=".08"/>
    ${[30, 60, 140, 170].map((x, i) => `<path d="M${x + (i < 2 ? 30 : -30)} 150 C${x} 160 ${x + (i < 2 ? -20 : 20)} 180 ${x} 200" stroke="#2a6a9a" stroke-width="12" fill="none" stroke-linecap="round"/>${[0, 1, 2].map(k => `<circle cx="${x + (i < 2 ? 8 : -8) - k * (i < 2 ? 4 : -4)}" cy="${164 + k * 12}" r="2.5" fill="#9fe6ff"/>`).join('')}`).join('')}
    <path d="M40 92 C20 70 18 46 30 30 C40 52 56 64 70 72Z" fill="#ff5ae8" opacity=".8" stroke="#ffb4f4" stroke-width="2"/>
    <path d="M160 92 C180 70 182 46 170 30 C160 52 144 64 130 72Z" fill="#ff5ae8" opacity=".8" stroke="#ffb4f4" stroke-width="2"/>
    <path d="M40 160 C30 110 56 64 100 62 C144 64 170 110 160 160 C140 176 60 176 40 160Z" fill="#1a4a7a" stroke="#05142a" stroke-width="3"/>
    <path d="M60 150 C70 120 130 120 140 150" fill="#2a6a9a"/>
    ${[66, 84, 116, 134].map((x, i) => `<circle cx="${x}" cy="${96 + (i % 2) * 8}" r="3" fill="#ff5ae8"/>`).join('')}
    <path d="M100 64 L94 44 L100 30 L106 44Z" fill="#ff5ae8" stroke="#ffb4f4" stroke-width="1.5"/>
    ${glowEye(78, 118, 9, 6, '#ff5ae8')}${glowEye(122, 118, 9, 6, '#5affe8')}
    <path d="M70 146 C80 156 120 156 130 146" stroke="#05142a" stroke-width="3" fill="#05142a"/>
    <path d="M76 148 L80 156 L84 149 L90 157 L96 150 L100 158 L104 150 L110 157 L116 149 L120 156 L124 148" stroke="#e8fbff" stroke-width="1.8" fill="none"/>
    ${bubble(20, 120, 6, '#9fe6ff')}${bubble(180, 130, 5, '#9fe6ff')}${bubble(170, 104, 3, '#9fe6ff')}
    ${fmark(100, 84, 7, '#2a8aff', '#ff5ae8')}`;

  // V + A Van: a estrada à noite, a Van com flores e o V sentado no teto olhando para frente
  D.fx_estrada = G => {
    let st = '';
    for (let i = 0; i < 24; i++) st += star((i * 47 + 11) % 200, (i * 19 + 4) % 90, 0.8 + (i % 3) * 0.5, '#fff4cf', 0.7);
    const flower = (x, y, r, c) => [0, 1, 2, 3, 4].map(k => { const a = Math.PI * 2 * k / 5; return `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${r * 0.7}" fill="${c}"/>`; }).join('') + `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="#ffe14d"/>`;
    return `
    <linearGradient id="${G('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1430"/><stop offset=".6" stop-color="#3a2a4a"/><stop offset="1" stop-color="#ff9a6a"/></linearGradient>
    <rect width="200" height="200" fill="url(#${G('sky')})"/>${st}
    <circle cx="150" cy="40" r="16" fill="#fff4cf" opacity=".9"/><circle cx="150" cy="40" r="28" fill="#fff4cf" opacity=".25" filter="url(#BL)"/>
    <path d="M150 40 L150 30 M150 40 L157 44" stroke="#3a2a4a" stroke-width="2" stroke-linecap="round"/>
    <path d="M0 120 L200 120 L200 200 L0 200Z" fill="#1a1612"/>
    <path d="M90 120 L110 120 L200 200 L0 200Z" fill="#3a352a"/>
    <path d="M100 124 L100 132 M100 142 L100 154 M100 166 L100 184" stroke="#ffe08a" stroke-width="3"/>
    <path d="M30 150 L0 140 L0 170Z" fill="#fff4cf" opacity=".25"/>
    <ellipse cx="96" cy="176" rx="64" ry="6" fill="#000" opacity=".5"/>
    <path d="M38 172 L38 128 C38 114 46 106 60 106 L140 106 C152 106 158 114 158 128 L158 172Z" fill="#3fb8a0" stroke="#0e3a32" stroke-width="3"/>
    <path d="M38 142 L158 142" stroke="#f2e6c8" stroke-width="8"/>
    <path d="M44 128 C44 118 50 112 60 112 L72 112 L72 134 L44 134Z" fill="#a8d8e8" stroke="#0e3a32" stroke-width="2"/>
    <rect x="80" y="112" width="34" height="22" rx="4" fill="#a8d8e8" stroke="#0e3a32" stroke-width="2"/><rect x="120" y="112" width="32" height="22" rx="4" fill="#a8d8e8" stroke="#0e3a32" stroke-width="2"/>
    ${flower(96, 160, 5, '#ff6fb1')}${flower(126, 158, 4.5, '#ff9a1a')}${flower(146, 162, 5, '#b05cff')}${flower(66, 160, 4, '#3b8bff')}
    <circle cx="40" cy="132" r="5" fill="#fff4cf"/><circle cx="40" cy="132" r="10" fill="#fff4cf" opacity=".4" filter="url(#BL)"/>
    <circle cx="62" cy="174" r="9" fill="#1a1a1a"/><circle cx="62" cy="174" r="4" fill="#888"/><circle cx="136" cy="174" r="9" fill="#1a1a1a"/><circle cx="136" cy="174" r="4" fill="#888"/>
    <path d="M100 106 C100 92 104 84 112 82 C120 84 124 92 124 106Z" fill="#5a5040"/>
    <path d="M104 106 L96 106 L94 98 M120 106 L130 106" stroke="#2a2418" stroke-width="5" stroke-linecap="round"/>
    <circle cx="112" cy="72" r="10" fill="#d9a27a"/>
    <path d="M102 70 C100 58 124 58 122 70 C118 64 106 64 102 70Z" fill="#9a9a96"/>
    <path d="M116 72 L118 72" stroke="#3a2a14" stroke-width="2" stroke-linecap="round"/>
    ${fmark(112, 96, 4.5, '#ffe08a', '#3fb8a0')}
    <text x="10" y="194" font-family="sans-serif" font-size="8" font-weight="800" fill="#ffe08a" opacity=".85">para onde ir</text>`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
