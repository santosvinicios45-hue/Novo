/* =========================================================================
   STICKER POWERS — ilustrações do Ato III (16 stickers e 4 chefes).
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const { D, B, h } = SP.Art._defs;
  const { eye, eyes, glowEye, smile, blush, star, spark, bolt, flame, snow, leaf, bubble, gear, shine, shadow } = h;

  /* ---------------------------------------------------------------- stickers */
  D.nuvenzinha = G => `
    <radialGradient id="${G('c')}" cx="40%" cy="35%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe9ff"/></radialGradient>
    ${shadow(182, 40)}
    <path d="M96 150 L92 168 M112 150 L110 172 M128 150 L130 166 M80 150 L76 164" stroke="#7fd8ff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <path d="M44 120 C30 120 26 98 42 92 C40 70 66 62 78 74 C86 50 122 48 130 70 C150 62 172 78 164 98 C182 104 176 130 156 130 L52 130 Z" fill="url(#${G('c')})" stroke="#9fc8e8" stroke-width="2.5"/>
    ${eyes(104, 100, 16, 8, '#3b8bff')}${smile(104, 116, 7)}${blush(104, 112, 28)}
    ${spark(40, 50, 6, '#fff')}${spark(170, 50, 5, '#fff')}<circle cx="160" cy="34" r="12" fill="#ffd84d" opacity=".9"/>`;

  D.tartaruga_ima = G => `
    <radialGradient id="${G('s')}" cx="45%" cy="35%"><stop offset="0" stop-color="#eef2f8"/><stop offset="1" stop-color="#5a6578"/></radialGradient>
    ${shadow(178, 66)}
    <ellipse cx="54" cy="160" rx="16" ry="10" fill="#7fb06a"/><ellipse cx="146" cy="160" rx="16" ry="10" fill="#7fb06a"/>
    <circle cx="164" cy="128" r="22" fill="#8ac674"/>${eye(170, 122, 7, '#2a4a1a')}${smile(168, 138, 5)}
    <path d="M30 140 C30 92 66 72 100 72 C134 72 160 92 160 140Z" fill="url(#${G('s')})" stroke="#2a2f3a" stroke-width="3"/>
    <path d="M100 76 L100 140 M62 92 L80 120 L120 120 L138 92 M44 120 L156 120" stroke="#2a2f3a" stroke-width="2" fill="none"/>
    <path d="M70 40 C70 22 90 22 90 40 L90 56 L80 56 L80 40 C80 32 80 32 80 40 L80 56 L70 56Z" fill="#d6402a"/><rect x="70" y="50" width="10" height="8" fill="#eef2f8"/><rect x="80" y="50" width="10" height="8" fill="#eef2f8"/>
    <path d="M110 30 L118 22 M124 38 L134 34 M58 30 L50 22" stroke="#4ff0ff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="36" cy="56" r="5" fill="#ffc21a"/><circle cx="150" cy="54" r="4" fill="#c4ccd8"/>`;

  D.coruja_crepuscular = G => `
    <circle cx="150" cy="44" r="22" fill="#ffb86a" opacity=".85"/>
    ${shadow(182, 40)}
    <path d="M30 150 L170 150" stroke="#3a2410" stroke-width="8" stroke-linecap="round"/>
    <path d="M56 150 C46 110 60 70 100 66 C140 70 154 110 144 150Z" fill="#3a2a5a"/>
    <path d="M60 110 C40 120 34 140 40 150 L64 146Z M140 110 C160 120 166 140 160 150 L136 146Z" fill="#2a1a4a"/>
    <path d="M72 130 Q100 140 128 130 M76 118 Q100 126 124 118" stroke="#6a5a9a" stroke-width="2" fill="none"/>
    <path d="M64 74 L58 46 L80 66Z M136 74 L142 46 L120 66Z" fill="#3a2a5a"/>
    <circle cx="82" cy="92" r="17" fill="#ffd84d"/><circle cx="118" cy="92" r="17" fill="#ffd84d"/>
    <circle cx="82" cy="92" r="9" fill="#120624"/><circle cx="118" cy="92" r="9" fill="#120624"/><circle cx="79" cy="89" r="3" fill="#fff"/><circle cx="115" cy="89" r="3" fill="#fff"/>
    <path d="M94 104 L100 114 L106 104Z" fill="#ff9a1a"/>
    ${star(30, 30, 3, '#fff', .7)}${star(60, 20, 2, '#fff', .6)}`;

  D.polvo_tinteiro = G => `
    <radialGradient id="${G('o')}" cx="40%" cy="30%"><stop offset="0" stop-color="#ffb0d0"/><stop offset="1" stop-color="#c2408a"/></radialGradient>
    ${[50, 72, 94, 116, 138, 160].map((x, i) => `<path d="M${100 + (x - 105) * 0.4} 120 C${x} 140 ${x + (i % 2 ? 14 : -14)} 160 ${x} 182" stroke="#d6589a" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('')}
    <ellipse cx="100" cy="88" rx="48" ry="46" fill="url(#${G('o')})"/>
    ${eyes(100, 92, 17, 9, '#3a0a2a')}${smile(100, 112, 7)}${blush(100, 106, 30)}
    <path d="M150 60 C170 40 186 50 180 70 C176 84 160 80 156 70" fill="#120a20" opacity=".8"/>
    <path d="M28 60 L60 54" stroke="#120a20" stroke-width="3"/><path d="M60 54 L66 48 L64 58Z" fill="#c69a3c"/>
    ${bubble(40, 120, 6, '#9fe3ff')}${bubble(170, 120, 5, '#9fe3ff')}`;

  D.golem_cristal = G => `
    <linearGradient id="${G('c')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#9be8ff"/><stop offset="1" stop-color="#3a7bd5"/></linearGradient>
    ${shadow(186, 60)}
    <path d="M100 28 L134 60 L124 90 L76 90 L66 60Z" fill="url(#${G('c')})" stroke="#2a5a9a" stroke-width="2.5"/>
    ${glowEye(88, 64, 5, 4, '#ffffff')}${glowEye(112, 64, 5, 4, '#ffffff')}
    <path d="M60 92 L140 92 L156 150 L100 176 L44 150Z" fill="url(#${G('c')})" stroke="#2a5a9a" stroke-width="2.5"/>
    <path d="M100 92 L100 176 M60 92 L100 130 L140 92 M44 150 L100 130 L156 150" stroke="#ffffff" stroke-width="1.5" opacity=".7"/>
    <path d="M58 96 L24 120 L36 150 L56 132Z M142 96 L176 120 L164 150 L144 132Z" fill="url(#${G('c')})" stroke="#2a5a9a" stroke-width="2.5"/>
    <path d="M10 60 L40 80 M190 60 L160 80 M100 190 L100 200" stroke="#ff9cf0" stroke-width="2" opacity=".7"/><path d="M14 66 L40 82" stroke="#ffe14d" stroke-width="2" opacity=".7"/>
    ${snow(170, 30, 6, '#fff')}`;

  D.lobo_solar = G => `
    <circle cx="100" cy="70" r="60" fill="#ffd84d" opacity=".3" filter="url(#BL)"/>
    ${shadow(184, 54)}
    <path d="M40 180 C40 140 60 120 92 116 L130 110 C160 116 170 150 166 180Z" fill="#f0b24a"/>
    <path d="M150 140 C176 130 186 110 180 92" stroke="#f0b24a" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M60 110 C50 70 70 40 100 36 C130 40 150 70 140 110 C130 126 70 126 60 110Z" fill="#ffc96a"/>
    <path d="M66 60 L56 22 L86 46Z M134 60 L144 22 L114 46Z" fill="#ffc96a"/><path d="M68 54 L62 32 L80 48Z M132 54 L138 32 L120 48Z" fill="#ff9a1a"/>
    <path d="M80 104 L100 128 L120 104 Q100 112 80 104Z" fill="#fff3d0"/><ellipse cx="100" cy="104" rx="7" ry="5" fill="#3a1a0a"/>
    ${glowEye(84, 80, 6, 4, '#ff9a1a')}${glowEye(116, 80, 6, 4, '#ff9a1a')}
    ${[0, 1, 2, 3, 4, 5, 6].map(i => { const a = -Math.PI * (0.15 + i * 0.12); return `<path d="M${100 + Math.cos(a) * 64} ${70 + Math.sin(a) * 64} L${100 + Math.cos(a) * 84} ${70 + Math.sin(a) * 84}" stroke="#ffe14d" stroke-width="5" stroke-linecap="round"/>`; }).join('')}`;

  D.bruxa_pantano = G => `
    <radialGradient id="${G('k')}" cx="50%" cy="20%"><stop offset="0" stop-color="#b6ff2a"/><stop offset="1" stop-color="#3a5a10"/></radialGradient>
    ${shadow(186, 56)}
    <path d="M44 150 C44 186 156 186 156 150Z" fill="#2a2a2a"/><ellipse cx="100" cy="150" rx="56" ry="12" fill="url(#${G('k')})"/>
    ${bubble(84, 140, 7, '#e2ff8f')}${bubble(114, 134, 5, '#e2ff8f')}${bubble(100, 120, 4, '#e2ff8f')}
    <path d="M72 140 L70 90 Q100 80 130 90 L128 140" fill="#4a2a6a"/>
    <circle cx="100" cy="72" r="22" fill="#a8d88a"/>
    ${eyes(100, 74, 9, 5, '#5a1a7a')}<path d="M92 86 Q100 92 108 86" stroke="#3a1a4a" stroke-width="2" fill="none"/><path d="M100 76 L104 84 L98 84Z" fill="#7aa86a"/>
    <path d="M52 56 L148 56 L120 48 L104 6 L84 48Z" fill="#2a1a3a"/><path d="M84 48 L120 48" stroke="#b6ff2a" stroke-width="3"/>
    <path d="M140 100 L170 60" stroke="#6b4422" stroke-width="4"/><circle cx="170" cy="58" r="6" fill="#b6ff2a"/>`;

  D.leviata_plasma = G => `
    <linearGradient id="${G('l')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd0fa"/><stop offset=".5" stop-color="#ff2fd8"/><stop offset="1" stop-color="#6a0a5e"/></linearGradient>
    <circle cx="100" cy="100" r="80" fill="#ff2fd8" opacity=".25" filter="url(#BL)"/>
    <path d="M10 160 C40 120 70 180 100 140 C130 100 150 160 176 120 C190 100 186 70 170 60" stroke="url(#${G('l')})" stroke-width="30" fill="none" stroke-linecap="round"/>
    <path d="M10 160 C40 120 70 180 100 140 C130 100 150 160 176 120" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="4 10" opacity=".7"/>
    <path d="M150 70 C150 40 180 30 194 50 C196 70 180 80 160 80Z" fill="url(#${G('l')})"/>
    <path d="M172 34 L178 12 L186 36 M160 40 L156 20 L168 36" fill="#ff9cf0"/>
    ${glowEye(176, 54, 5, 4, '#fff')}<path d="M164 68 L192 66" stroke="#3a0030" stroke-width="3"/>
    <path d="M60 140 L52 124 L70 132Z M96 150 L92 132 L108 142Z M130 120 L128 104 L142 114Z" fill="#ff9cf0"/>
    ${spark(40, 50, 7, '#fff')}${spark(90, 40, 5, '#ffd0fa')}`;

  D.titanide_terra = G => `
    <linearGradient id="${G('t')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset="1" stop-color="#6b4422"/></linearGradient>
    <path d="M0 190 L30 130 L60 160 L100 90 L140 150 L170 120 L200 180 V200 H0Z" fill="#5a3a1a" opacity=".6"/>
    <path d="M50 196 C50 150 70 120 100 116 C130 120 150 150 150 196Z" fill="url(#${G('t')})"/>
    <path d="M70 140 L100 196 L130 140" fill="#3fa84a" opacity=".8"/>
    <circle cx="100" cy="86" r="28" fill="#c9905a"/>
    <path d="M68 90 C60 50 80 30 100 30 C120 30 140 50 132 90 C126 70 112 62 100 62 C88 62 74 70 68 90Z" fill="#2f7a2a"/>
    ${leaf(66, 40, 0.8, -120, '#5ed45a')}${leaf(134, 40, 0.8, -60, '#7ee86a')}
    <circle cx="80" cy="34" r="5" fill="#ff8fc8"/><circle cx="122" cy="32" r="5" fill="#ffe14d"/>
    ${eyes(100, 88, 10, 6, '#2a4a1a')}<path d="M94 102 Q100 106 106 102" stroke="#5a3010" stroke-width="2" fill="none"/>
    <path d="M38 150 L20 120 L34 116 L50 140Z M162 150 L180 120 L166 116 L150 140Z" fill="#8a5a2c"/>`;

  D.kraken_abissal = G => `
    <rect width="200" height="200" fill="#021a33" opacity=".5"/>
    ${[30, 60, 140, 170].map((x, i) => `<path d="M${x} 200 C${x + (i < 2 ? -20 : 20)} 150 ${x + (i < 2 ? 30 : -30)} 120 ${x + (i < 2 ? 10 : -10)} 70" stroke="#5a1a6a" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('')}
    ${[30, 60, 140, 170].map((x, i) => `<circle cx="${x + (i < 2 ? -6 : 6)}" cy="${150 - i % 2 * 20}" r="4" fill="#ff9cf0"/>`).join('')}
    <ellipse cx="100" cy="110" rx="52" ry="58" fill="#7a2a8a"/>
    <path d="M60 90 C60 40 140 40 140 90" fill="#9a3aaa"/>
    ${glowEye(80, 112, 10, 7, '#ffd84d')}${glowEye(120, 112, 10, 7, '#ffd84d')}
    <ellipse cx="80" cy="112" rx="2" ry="6" fill="#120a20"/><ellipse cx="120" cy="112" rx="2" ry="6" fill="#120a20"/>
    <path d="M86 140 Q100 150 114 140" stroke="#2a0a30" stroke-width="3" fill="none"/>
    ${bubble(40, 40, 8, '#9fe3ff')}${bubble(160, 30, 6, '#9fe3ff')}${bubble(100, 20, 5, '#9fe3ff')}`;

  D.hierofante_verde = G => `
    <circle cx="100" cy="90" r="76" fill="#22b84f" opacity=".2" filter="url(#BL)"/>
    <path d="M56 196 C56 150 70 120 100 116 C130 120 144 150 144 196Z" fill="#1f6a2a"/>
    <path d="M100 120 L100 196 M76 140 L124 140" stroke="#ffe14d" stroke-width="3"/>
    <circle cx="100" cy="86" r="24" fill="#e9d6b0"/>
    <path d="M72 92 C66 54 82 40 100 40 C118 40 134 54 128 92 L120 112 Q100 104 80 112Z" fill="#2a4a1a" opacity=".9"/>
    ${glowEye(92, 88, 4, 3, '#b4f07a')}${glowEye(108, 88, 4, 3, '#b4f07a')}
    <path d="M92 102 Q100 106 108 102" stroke="#5a3a1a" stroke-width="2" fill="none"/>
    <path d="M100 40 C96 20 104 10 100 0" stroke="#5a3a1a" stroke-width="4"/>
    ${leaf(100, 18, 1.1, -150, '#5ed45a')}${leaf(100, 18, 1.1, -30, '#7ee86a')}
    <ellipse cx="100" cy="156" rx="16" ry="20" fill="#8a5a30"/><path d="M100 136 C96 128 104 122 100 116" stroke="#3fcf5a" stroke-width="3" fill="none"/><circle cx="100" cy="152" r="7" fill="#b4f07a"/><circle cx="100" cy="152" r="14" fill="#b4f07a" opacity=".35" filter="url(#BL)"/>
    ${leaf(20, 150, 1, -30, '#22b84f')}${leaf(150, 160, 1, -150, '#b4f07a')}`;

  D.serafim_eclipse = G => `
    <circle cx="100" cy="76" r="44" fill="#ffe680"/><circle cx="114" cy="70" r="40" fill="#1b0b33"/>
    <circle cx="100" cy="76" r="54" fill="none" stroke="#ffe680" stroke-width="3" opacity=".6"/>
    <path d="M100 110 C70 80 30 70 6 90 C30 98 40 110 30 126 C60 120 80 124 100 130Z" fill="#fffbe0" stroke="#ffd84d" stroke-width="2"/>
    <path d="M100 110 C130 80 170 70 194 90 C170 98 160 110 170 126 C140 120 120 124 100 130Z" fill="#2a1450" stroke="#7c3aed" stroke-width="2"/>
    <path d="M80 120 L120 120 L134 192 L66 192Z" fill="#f2ead8"/><path d="M100 120 L100 192 L134 192 L120 120Z" fill="#3a2060"/>
    <circle cx="100" cy="110" r="20" fill="#f2d6c0"/>
    <path d="M80 110 Q80 86 100 86 Q120 86 120 110 Q112 96 100 96 Q88 96 80 110Z" fill="#ffe680"/><path d="M100 86 Q120 86 120 110 Q112 96 100 96Z" fill="#2a1450"/>
    ${glowEye(93, 110, 3.5, 2.5, '#ffd84d')}${glowEye(107, 110, 3.5, 2.5, '#c4a1ff')}
    ${spark(30, 170, 6, '#fffbe0')}${star(170, 170, 5, '#c4a1ff')}`;

  D.fray_redimido = G => `
    <linearGradient id="${G('a')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4b47e6"/><stop offset="1" stop-color="#aab4ff"/></linearGradient>
    <path d="M0 150 C40 150 60 120 100 120 C140 120 160 90 200 90 L200 110 C160 110 140 140 100 140 C60 140 40 170 0 170Z" fill="#2a2a4a" stroke="#aab4ff" stroke-width="1.5"/>
    <path d="M0 158 C40 158 60 128 100 128 C140 128 160 98 200 98" stroke="#ffe14d" stroke-width="2" stroke-dasharray="8 8"/>
    <path d="M70 196 L76 120 Q100 108 124 120 L130 196Z" fill="url(#${G('a')})"/>
    <circle cx="100" cy="86" r="26" fill="#e9c4a0"/>
    <path d="M74 84 C70 56 84 50 100 50 C116 50 130 56 126 84 C120 68 110 66 100 66 C90 66 80 68 74 84Z" fill="#2a2a3a"/>
    ${eyes(100, 88, 10, 6, '#4b47e6')}${smile(100, 102, 6)}${blush(100, 98, 18)}
    <ellipse cx="100" cy="46" rx="22" ry="6" fill="none" stroke="#ffe680" stroke-width="3"/>
    <path d="M124 140 C150 130 164 140 170 150" stroke="#e9c4a0" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="174" cy="152" r="8" fill="#ff8fc8"/>`;

  D.guarda_estelar = G => `
    <linearGradient id="${G('m')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f8"/><stop offset="1" stop-color="#4a5568"/></linearGradient>
    ${shadow(186, 56)}
    <path d="M60 196 L66 110 L134 110 L140 196Z" fill="url(#${G('m')})" stroke="#2a2f3a" stroke-width="3"/>
    <path d="M70 60 Q100 30 130 60 L134 110 L66 110Z" fill="url(#${G('m')})" stroke="#2a2f3a" stroke-width="3"/>
    <rect x="76" y="74" width="48" height="12" rx="4" fill="#0d1b2a"/><rect x="80" y="77" width="40" height="6" rx="3" fill="#4ff0ff"/>
    <path d="M100 34 L94 10 L100 18 L106 10Z" fill="#ffc21a"/>
    <path d="M20 90 L70 80 L74 170 L36 180 C18 160 14 120 20 90Z" fill="#3b4a6a" stroke="#ffc21a" stroke-width="3"/>
    ${star(46, 128, 14, '#ffc21a')}
    <path d="M140 96 L176 40" stroke="#c4ccd8" stroke-width="5"/><path d="M172 36 L186 26 L180 44Z" fill="#eef2f8"/>`;

  D.santo_espada = G => `
    <circle cx="100" cy="90" r="80" fill="#7c3aed" opacity=".25" filter="url(#BL)"/>
    <path d="M10 30 L190 170" stroke="#e8e0ff" stroke-width="4"/><path d="M10 30 L190 170" stroke="#c4a1ff" stroke-width="12" opacity=".25"/>
    <path d="M40 180 L160 20" stroke="#e8e0ff" stroke-width="2" opacity=".6"/>
    <path d="M64 196 C60 150 70 124 100 118 C130 124 140 150 136 196Z" fill="#12051f"/>
    <path d="M70 130 L130 190 M130 130 L70 190" stroke="#3a1a5a" stroke-width="4"/>
    <circle cx="100" cy="88" r="26" fill="#1b0b33"/>
    <path d="M72 88 C70 60 84 52 100 52 C116 52 130 60 128 88 L134 72 L122 64 Q100 48 78 64 L66 72Z" fill="#0a0414"/>
    <rect x="76" y="82" width="48" height="10" fill="#7c3aed"/>${glowEye(88, 87, 6, 2.5, '#fff')}${glowEye(112, 87, 6, 2.5, '#fff')}
    <rect x="96" y="128" width="8" height="40" fill="#5a4a7a"/><rect x="86" y="126" width="28" height="6" rx="2" fill="#ffc21a"/>
    <path d="M100 126 L100 20" stroke="#f2f0ff" stroke-width="6"/><path d="M100 20 L96 30 L104 30Z" fill="#fff"/>`;

  D.coroa_estelar = G => {
    let s = '';
    for (let i = 0; i < 16; i++) s += star((i * 53 + 7) % 200, (i * 37 + 13) % 200, 1.5 + (i % 3), '#fff', 0.6);
    return `${s}<circle cx="100" cy="100" r="76" fill="#8b5cf6" opacity=".3" filter="url(#BL)"/>
    <path d="M30 140 L42 60 L70 100 L100 36 L130 100 L158 60 L170 140Z" fill="#ffc21a" stroke="#8a5a00" stroke-width="4"/>
    <path d="M30 140 L170 140 L164 164 L36 164Z" fill="#e0a010" stroke="#8a5a00" stroke-width="4"/>
    <circle cx="100" cy="150" r="9" fill="#ff2e7e"/><circle cx="64" cy="150" r="6" fill="#4ff0ff"/><circle cx="136" cy="150" r="6" fill="#4ff0ff"/>
    <circle cx="100" cy="36" r="10" fill="#8b5cf6" stroke="#fff" stroke-width="2"/><circle cx="42" cy="60" r="7" fill="#ff9cf0"/><circle cx="158" cy="60" r="7" fill="#ff9cf0"/>
    ${glowEye(84, 112, 5, 3, '#fff')}${glowEye(116, 112, 5, 3, '#fff')}
    <path d="M60 120 L56 128 M140 120 L144 128" stroke="#fff" stroke-width="2"/>`;
  };

  /* ---------------------------------------------------------------- chefes */
  B.fray = G => `
    <rect width="200" height="200" fill="#0a0a1a"/>
    ${[0, 1, 2, 3].map(i => `<path d="M0 ${40 + i * 45} C50 ${20 + i * 45} 100 ${70 + i * 45} 200 ${30 + i * 45}" stroke="#4b47e6" stroke-width="18" fill="none" opacity=".45"/><path d="M0 ${40 + i * 45} C50 ${20 + i * 45} 100 ${70 + i * 45} 200 ${30 + i * 45}" stroke="#ffe14d" stroke-width="2" fill="none" stroke-dasharray="10 10" opacity=".6"/>`).join('')}
    <rect x="10" y="20" width="22" height="60" fill="#2a2a4a" transform="rotate(-20 21 50)"/><rect x="160" y="110" width="26" height="70" fill="#2a2a4a" transform="rotate(25 173 145)"/>
    <path d="M60 200 C60 150 76 126 100 122 C124 126 140 150 140 200Z" fill="#1a1a3a" stroke="#aab4ff" stroke-width="2"/>
    <path d="M64 130 C40 110 30 90 34 70 M136 130 C160 110 170 90 166 70" stroke="#e9c4a0" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="34" cy="66" r="10" fill="#4b47e6" opacity=".8" filter="url(#BL)"/><circle cx="166" cy="66" r="10" fill="#4b47e6" opacity=".8" filter="url(#BL)"/>
    <circle cx="100" cy="92" r="28" fill="#e9c4a0"/>
    <path d="M70 90 C66 58 84 50 100 50 C116 50 134 58 130 90 C124 70 112 68 100 68 C88 68 76 70 70 90Z" fill="#2a2a3a"/>
    ${glowEye(89, 94, 6, 3, '#aab4ff')}${glowEye(111, 94, 6, 3, '#aab4ff')}
    <path d="M88 110 Q100 104 112 110" stroke="#5a2a1a" stroke-width="2.5" fill="none"/>`;
  B.voss = G => `
    <linearGradient id="${G('a')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4ccd8"/><stop offset="1" stop-color="#2a2f3a"/></linearGradient>
    <rect width="200" height="200" fill="#060a12"/>
    <circle cx="160" cy="40" r="60" fill="#3a4a6a" opacity=".6"/><circle cx="160" cy="40" r="60" fill="none" stroke="#6a7a9a" stroke-width="2"/><path d="M100 40 L220 40 M160 -20 L160 100" stroke="#6a7a9a" stroke-width="1" opacity=".6"/>
    <path d="M30 200 L40 110 L70 92 L130 92 L160 110 L170 200Z" fill="url(#${G('a')})" stroke="#0a0c10" stroke-width="3"/>
    <path d="M40 110 L20 120 L24 170 L42 168Z M160 110 L180 120 L176 170 L158 168Z" fill="#4a5568" stroke="#0a0c10" stroke-width="3"/>
    <path d="M70 120 L130 120 M64 150 L136 150" stroke="#ffc21a" stroke-width="3"/>
    ${star(100, 136, 10, '#ffc21a')}
    <path d="M68 50 Q100 20 132 50 L134 92 L66 92Z" fill="url(#${G('a')})" stroke="#0a0c10" stroke-width="3"/>
    <rect x="74" y="60" width="52" height="14" rx="4" fill="#0a0c10"/>${glowEye(88, 67, 7, 3, '#ff4b4b')}${glowEye(112, 67, 7, 3, '#ff4b4b')}
    <path d="M100 22 L100 4 M86 28 L80 12 M114 28 L120 12" stroke="#ffc21a" stroke-width="4" stroke-linecap="round"/>
    <path d="M66 86 L134 86" stroke="#0a0c10" stroke-width="4"/>`;
  B.sombra = G => `
    <rect width="200" height="200" fill="#08020e"/>
    <circle cx="100" cy="80" r="70" fill="#3a0a5a" opacity=".6" filter="url(#BL)"/>
    ${[0, 1, 2, 3, 4].map(i => `<path d="M${10 + i * 40} 0 L${60 + i * 30} 200" stroke="#e8e0ff" stroke-width="1.5" opacity="${0.15 + (i % 2) * 0.2}"/>`).join('')}
    <path d="M40 200 C40 140 66 112 100 108 C134 112 160 140 160 200Z" fill="#0e0418"/>
    <path d="M48 200 L70 130 L100 160 L130 130 L152 200" fill="#1e0a30"/>
    <circle cx="100" cy="76" r="30" fill="#0e0418"/>
    <path d="M66 80 L60 50 L80 40 L100 30 L120 40 L140 50 L134 80" fill="#1e0a30"/>
    <rect x="70" y="72" width="60" height="10" fill="#7c3aed"/>${glowEye(86, 77, 8, 3, '#fff')}${glowEye(114, 77, 8, 3, '#fff')}
    <path d="M150 190 L60 10" stroke="#f2f0ff" stroke-width="5"/><path d="M150 190 L60 10" stroke="#c4a1ff" stroke-width="14" opacity=".25"/>
    <rect x="138" y="160" width="26" height="8" rx="2" fill="#ffc21a" transform="rotate(-63 151 164)"/>`;
  B.imperador_estelar = G => {
    let s = '';
    for (let i = 0; i < 24; i++) s += star((i * 47 + 3) % 200, (i * 29 + 11) % 200, 1 + (i % 3), '#fff', 0.5);
    return `<rect width="200" height="200" fill="#04020c"/>${s}
    <circle cx="100" cy="100" r="90" fill="#8b5cf6" opacity=".2" filter="url(#BL)"/>
    <path d="M20 200 C20 140 56 110 100 106 C144 110 180 140 180 200Z" fill="#2a1a5a" stroke="#ffc21a" stroke-width="3"/>
    <path d="M70 110 L100 200 L130 110" fill="#ffc21a" opacity=".85"/>
    <path d="M150 140 C176 120 190 100 186 80" stroke="#5a3a9a" stroke-width="22" fill="none" stroke-linecap="round"/>
    <circle cx="186" cy="74" r="20" fill="#e9c4a0"/><circle cx="186" cy="74" r="30" fill="#ff9cf0" opacity=".45" filter="url(#BL)"/>
    <circle cx="100" cy="76" r="30" fill="#e9c4a0"/>
    <path d="M72 108 C70 130 86 140 100 146 C114 140 130 130 128 108 Q100 118 72 108Z" fill="#f2f2ff"/>
    ${glowEye(88, 74, 7, 3, '#ff2e7e')}${glowEye(112, 74, 7, 3, '#ff2e7e')}
    <path d="M80 64 L94 68 M120 64 L106 68" stroke="#2a1a5a" stroke-width="4" stroke-linecap="round"/>
    <path d="M64 50 L70 10 L84 34 L100 0 L116 34 L130 10 L136 50Z" fill="#ffc21a" stroke="#8a5a00" stroke-width="3"/>
    <circle cx="100" cy="30" r="8" fill="#8b5cf6" stroke="#fff" stroke-width="2"/>`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
