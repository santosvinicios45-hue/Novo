/* =========================================================================
   STICKER POWERS — dados do jogo
   Raridades, elementos, tabela de vantagens, stickers, chefes, pacotes,
   fases e missões. Tudo aqui é configuração: as regras ficam em core.js
   e battle.js, que leem estes valores.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP = root.SP || {};

  /* ---------------------------------------------------------------- RARIDADES */
  SP.RARITIES = [
    { id: 'common',    name: 'Comum',    color: '#c4c9d4', glow: '#e7eaf0', mult: 1.00, dupeFrags: 5,   evoFrags: 20,  craft: 40 },
    { id: 'uncommon',  name: 'Incomum',  color: '#3ddc84', glow: '#9cf5c4', mult: 1.12, dupeFrags: 10,  evoFrags: 30,  craft: 80 },
    { id: 'rare',      name: 'Raro',     color: '#3b8bff', glow: '#9cc6ff', mult: 1.25, dupeFrags: 20,  evoFrags: 50,  craft: 160 },
    { id: 'epic',      name: 'Épico',    color: '#b05cff', glow: '#dcb5ff', mult: 1.40, dupeFrags: 45,  evoFrags: 80,  craft: 400 },
    { id: 'legendary', name: 'Lendário', color: '#ffc21a', glow: '#ffe79a', mult: 1.60, dupeFrags: 100, evoFrags: 120, craft: 900 },
    { id: 'mythic',    name: 'Mítico',   color: '#ff2e7e', glow: '#ff9cc2', mult: 1.80, dupeFrags: 200, evoFrags: 160, craft: 1800 },
    { id: 'secret',    name: 'Secreto',  color: '#ffffff', glow: '#b9fffb', mult: 2.00, dupeFrags: 400, evoFrags: 200, craft: null }
  ];
  SP.RARITY = {};
  SP.RARITIES.forEach((r, i) => { r.rank = i; SP.RARITY[r.id] = r; });

  /* ---------------------------------------------------------------- ELEMENTOS */
  // strong: elementos contra os quais este causa dano aumentado.
  SP.ELEMENTS = [
    { id: 'fire',      name: 'Fogo',     c1: '#ff5a1f', c2: '#ffc04d', strong: ['nature', 'ice', 'metal'],  passive: 'Ataques normais têm 25% de chance de queimar.' },
    { id: 'water',     name: 'Água',     c1: '#1f7bff', c2: '#7fd8ff', strong: ['fire', 'earth'],           passive: 'Ataques normais curam 6% da vida máxima.' },
    { id: 'ice',       name: 'Gelo',     c1: '#5fd4ff', c2: '#e6fbff', strong: ['wind', 'nature'],          passive: 'Ataques normais têm 15% de chance de congelar.' },
    { id: 'lightning', name: 'Raio',     c1: '#ffcf0a', c2: '#fff6a8', strong: ['water', 'metal'],          passive: '25% de chance de um golpe extra de 50% do dano.' },
    { id: 'earth',     name: 'Terra',    c1: '#a8723c', c2: '#e3b072', strong: ['lightning', 'poison'],     passive: 'Defesa permanentemente +15%.' },
    { id: 'wind',      name: 'Vento',    c1: '#3fd6a0', c2: '#d4fff0', strong: ['poison', 'plasma'],        passive: 'Velocidade +15% e 12% de chance de esquivar.' },
    { id: 'light',     name: 'Luz',      c1: '#ffd84d', c2: '#fffbe0', strong: ['dark', 'poison'],          passive: 'Regenera 4% da vida máxima a cada turno.' },
    { id: 'dark',      name: 'Trevas',   c1: '#7c3aed', c2: '#c4a1ff', strong: ['light', 'time'],           passive: 'Ataques normais têm 25% de chance de enfraquecer.' },
    { id: 'nature',    name: 'Natureza', c1: '#22b84f', c2: '#b4f07a', strong: ['water', 'earth'],          passive: 'Devolve 15% do dano recebido ao atacante.' },
    { id: 'plasma',    name: 'Plasma',   c1: '#ff2fd8', c2: '#ffb0f4', strong: ['metal', 'ice'],            passive: 'Chance de crítico +15%.' },
    { id: 'gravity',   name: 'Gravidade',c1: '#4b47e6', c2: '#aab4ff', strong: ['wind', 'cosmic'],          passive: 'Ataques normais drenam 1 de energia do alvo.' },
    { id: 'time',      name: 'Tempo',    c1: '#11b5a4', c2: '#a6fff2', strong: ['gravity', 'plasma'],       passive: '15% de chance de agir novamente após atacar.' },
    { id: 'cosmic',    name: 'Cósmico',  c1: '#8b5cf6', c2: '#ff9cf0', strong: ['time', 'light'],           passive: 'Recebe +1 de energia extra por turno.' },
    { id: 'poison',    name: 'Veneno',   c1: '#7fcf12', c2: '#e2ff8f', strong: ['nature', 'water'],         passive: 'Ataques normais têm 35% de chance de envenenar.' },
    { id: 'metal',     name: 'Metal',    c1: '#8e9bb0', c2: '#eef2f8', strong: ['earth', 'light'],          passive: 'Começa a batalha com escudo de 12% da vida.' }
  ];
  SP.ELEMENT = {};
  SP.ELEMENTS.forEach(e => { SP.ELEMENT[e.id] = e; });

  SP.ADV_STRONG = 1.5;   // dano com vantagem
  SP.ADV_WEAK = 0.7;     // dano contra um elemento que resiste

  /** Multiplicador elemental de um ataque de `atk` contra `def`. */
  SP.elementMult = function (atk, def) {
    if (!atk || !def) return 1;
    const a = SP.ELEMENT[atk], d = SP.ELEMENT[def];
    if (a && a.strong.indexOf(def) >= 0) return SP.ADV_STRONG;
    if (d && d.strong.indexOf(atk) >= 0) return SP.ADV_WEAK;
    return 1;
  };

  /* ---------------------------------------------------------------- STATUS */
  SP.STATUS_INFO = {
    burn:    { name: 'Queimadura',  icon: '🔥', bad: true,  desc: 'Perde 7% da vida máxima por turno.' },
    poison:  { name: 'Veneno',      icon: '☠️', bad: true,  desc: 'Perde 4% da vida máxima por acúmulo, por turno (máx. 5).' },
    freeze:  { name: 'Congelado',   icon: '❄️', bad: true,  desc: 'Perde o próximo turno.' },
    stun:    { name: 'Atordoado',   icon: '💫', bad: true,  desc: 'Perde o próximo turno.' },
    weaken:  { name: 'Enfraquecido',icon: '🔻', bad: true,  desc: 'Ataque reduzido em 30%.' },
    slow:    { name: 'Lento',       icon: '🐌', bad: true,  desc: 'Velocidade reduzida em 40%.' },
    defUp:   { name: 'Defesa+',     icon: '🛡️', bad: false, desc: 'Defesa aumentada em 50%.' },
    atkUp:   { name: 'Ataque+',     icon: '⚔️', bad: false, desc: 'Ataque aumentado em 30%.' },
    regen:   { name: 'Regeneração', icon: '✚',  bad: false, desc: 'Recupera vida a cada turno.' },
    reflect: { name: 'Espinhos',    icon: '🌵', bad: false, desc: 'Devolve parte do dano recebido.' },
    taunt:   { name: 'Provocação',  icon: '🎯', bad: false, desc: 'Inimigos são obrigados a mirar nesta unidade.' },
    dodge:   { name: 'Esquiva',     icon: '💨', bad: false, desc: 'Evita completamente o próximo ataque individual.' },
    guard:   { name: 'Defendendo',  icon: '🔰', bad: false, desc: 'Recebe 50% menos dano até o próximo turno.' }
  };

  /* ---------------------------------------------------------------- PAPÉIS */
  SP.ROLES = {
    attacker: { name: 'Atacante', hp: 0.92, atk: 1.22, def: 0.85, spd: 1.05 },
    tank:     { name: 'Tanque',   hp: 1.32, atk: 0.85, def: 1.45, spd: 0.85 },
    support:  { name: 'Suporte',  hp: 1.02, atk: 0.9,  def: 1.0,  spd: 1.0 },
    speed:    { name: 'Veloz',    hp: 0.86, atk: 1.06, def: 0.85, spd: 1.32 },
    balanced: { name: 'Equilibrado', hp: 1.0, atk: 1.0, def: 1.0, spd: 1.0 }
  };
  SP.BASE_STATS = { hp: 110, atk: 20, def: 12, spd: 10 };

  /* ---------------------------------------------------------------- STICKERS
     skill.target: enemy | allEnemies | ally | allAllies | self
     skill.fx: lista de efeitos executados em ordem (ver battle.js) */
  const S = [
    // ----------------------------------------------------------- COMUNS
    { id: 'brasinha', name: 'Brasinha', el: 'fire', rarity: 'common', role: 'attacker', en: 4,
      title: 'Filhote de Brasa',
      story: 'Nasceu de uma fagulha que caiu numa fogueira de acampamento. Abana o rabo e solta faíscas quando está feliz — o que costuma incendiar tapetes.',
      skill: { name: 'Mordida Ardente', cost: 2, target: 'enemy', desc: 'Morde com 130% de dano e queima o alvo por 3 turnos.',
        fx: [{ k: 'dmg', p: 1.3 }, { k: 'status', s: 'burn', t: 3 }] } },
    { id: 'gotinha', name: 'Gotinha', el: 'water', rarity: 'common', role: 'support', en: 4,
      title: 'Gota Curandeira',
      story: 'Uma gota de orvalho que se recusou a evaporar. Dizem que quem bebe da sua bolha esquece todas as dores — e o próprio nome, por alguns minutos.',
      skill: { name: 'Bolha Curativa', cost: 2, target: 'ally', desc: 'Cura um aliado em 28% da vida máxima.',
        fx: [{ k: 'heal', pct: 0.28 }] } },
    { id: 'seixo', name: 'Seixo Guardião', el: 'earth', rarity: 'common', role: 'tank', en: 4,
      title: 'Sentinela de Pedra',
      story: 'Uma pedrinha que ficou séculos vigiando a entrada de uma caverna. Ninguém lembra mais o que havia lá dentro, mas ele continua vigiando.',
      skill: { name: 'Casca de Pedra', cost: 2, target: 'self', desc: 'Defesa +50% e provoca os inimigos por 2 turnos.',
        fx: [{ k: 'status', s: 'defUp', t: 2 }, { k: 'status', s: 'taunt', t: 2 }] } },
    { id: 'brisinha', name: 'Brisinha', el: 'wind', rarity: 'common', role: 'speed', en: 4,
      title: 'Fada da Corrente de Ar',
      story: 'Vive nas frestas das janelas e adora bater portas no meio da noite. Não é maldade: ela só quer que alguém brinque com ela.',
      skill: { name: 'Rajada Dupla', cost: 2, target: 'enemy', desc: 'Dois golpes de 75% de dano.',
        fx: [{ k: 'dmg', p: 0.75, hits: 2 }] } },
    { id: 'faisca', name: 'Faísca', el: 'lightning', rarity: 'common', role: 'speed', en: 4,
      title: 'Roedor Elétrico',
      story: 'Roeu um cabo de alta tensão e gostou. Desde então corre tão rápido que chega antes do próprio trovão.',
      skill: { name: 'Choque Rápido', cost: 2, target: 'enemy', desc: '120% de dano com 35% de chance de atordoar.',
        fx: [{ k: 'dmg', p: 1.2 }, { k: 'status', s: 'stun', t: 1, chance: 0.35 }] } },
    { id: 'brotinho', name: 'Brotinho', el: 'nature', rarity: 'common', role: 'support', en: 4,
      title: 'Semente Desperta',
      story: 'Brotou no meio de uma batalha antiga, regada pelas lágrimas dos dois lados. Por isso não escolhe lados: cura quem estiver perto.',
      skill: { name: 'Semente Vital', cost: 2, target: 'ally', desc: 'Aliado regenera 12% da vida por 3 turnos.',
        fx: [{ k: 'status', s: 'regen', t: 3, v: 0.12 }, { k: 'heal', pct: 0.08 }] } },
    { id: 'sapo_toxico', name: 'Sapo Tóxico', el: 'poison', rarity: 'common', role: 'attacker', en: 4,
      title: 'Coaxador do Pântano',
      story: 'Suas manchas mudam de cor conforme o humor. Roxo significa “fique longe”. Infelizmente ele está sempre roxo.',
      skill: { name: 'Língua Ácida', cost: 2, target: 'enemy', desc: '90% de dano e aplica 2 acúmulos de veneno.',
        fx: [{ k: 'dmg', p: 0.9 }, { k: 'status', s: 'poison', t: 3, v: 2 }] } },
    { id: 'parafuso', name: 'Parafuso', el: 'metal', rarity: 'common', role: 'tank', en: 4,
      title: 'Robô de Sucata',
      story: 'Montado com peças de mil máquinas quebradas. Cada parafuso guarda a memória de um dono diferente, e ele tenta honrar todos.',
      skill: { name: 'Blindagem', cost: 2, target: 'self', desc: 'Ganha um escudo de 35% da vida máxima.',
        fx: [{ k: 'shield', pct: 0.35 }] } },

    // ----------------------------------------------------------- INCOMUNS
    { id: 'raposa_nivea', name: 'Raposa Nívea', el: 'ice', rarity: 'uncommon', role: 'speed', en: 4,
      title: 'Espírito da Nevasca',
      story: 'Suas nove pegadas desaparecem com a neve. Viajantes perdidos juram que ela os guiou para casa — e que nunca viram a raposa, só o frio.',
      skill: { name: 'Sopro Gélido', cost: 2, target: 'enemy', desc: '110% de dano com 45% de chance de congelar.',
        fx: [{ k: 'dmg', p: 1.1 }, { k: 'status', s: 'freeze', t: 1, chance: 0.45 }] } },
    { id: 'mariposa_lume', name: 'Mariposa Lume', el: 'light', rarity: 'uncommon', role: 'support', en: 5,
      title: 'Guardiã das Lanternas',
      story: 'Atraída por toda luz, acabou virando uma. Seu pó dourado cura ferimentos e deixa um leve cheiro de vela.',
      skill: { name: 'Pó Luminoso', cost: 3, target: 'allAllies', desc: 'Cura todos os aliados em 14% da vida máxima.',
        fx: [{ k: 'heal', pct: 0.14 }] } },
    { id: 'gato_sombrio', name: 'Gato Sombrio', el: 'dark', rarity: 'uncommon', role: 'attacker', en: 4,
      title: 'Andarilho da Penumbra',
      story: 'Só aparece quando ninguém está olhando. Se você sentiu um arrepio agora, ele provavelmente passou por aqui.',
      skill: { name: 'Garras da Penumbra', cost: 2, target: 'enemy', desc: '120% de dano e enfraquece o alvo por 2 turnos.',
        fx: [{ k: 'dmg', p: 1.2 }, { k: 'status', s: 'weaken', t: 2 }] } },
    { id: 'fogo_fatuo', name: 'Fogo-Fátuo', el: 'plasma', rarity: 'uncommon', role: 'attacker', en: 4,
      title: 'Chama Instável',
      story: 'Uma bolha de plasma que flutua sobre os pântanos. É tão instável que nem ela sabe se vai existir amanhã — por isso vive cada segundo explodindo.',
      skill: { name: 'Descarga Instável', cost: 3, target: 'enemy', desc: '160% de dano que ignora 50% da defesa.',
        fx: [{ k: 'dmg', p: 1.6, pierce: 0.5 }] } },
    { id: 'cavaleiro_coral', name: 'Cavaleiro Coral', el: 'water', rarity: 'uncommon', role: 'balanced', en: 4,
      title: 'Sentinela do Recife',
      story: 'Jurou proteger o recife onde nasceu. Sua armadura cresce alguns milímetros a cada ano — ele já tem quatrocentos anos.',
      skill: { name: 'Lança da Maré', cost: 2, target: 'enemy', desc: '130% de dano e drena 1 de energia do alvo.',
        fx: [{ k: 'dmg', p: 1.3 }, { k: 'energy', n: -1 }] } },
    { id: 'rochoso', name: 'Rochoso Saltador', el: 'earth', rarity: 'uncommon', role: 'tank', en: 4,
      title: 'Tatu das Encostas',
      story: 'Enrola-se como uma pedra e desce montanhas rolando por diversão. Já causou três avalanches e pediu desculpas em todas.',
      skill: { name: 'Avalanche Rolante', cost: 2, target: 'enemy', desc: '100% de dano e ganha Defesa+ por 2 turnos.',
        fx: [{ k: 'dmg', p: 1.0 }, { k: 'status', s: 'defUp', t: 2, to: 'self' }] } },
    { id: 'tique_taque', name: 'Tique-Taque', el: 'time', rarity: 'uncommon', role: 'support', en: 4,
      title: 'Relógio Vivo',
      story: 'Era o relógio de uma torre que parou à meia-noite de um ano que ninguém lembra. Acordou com pressa e nunca mais desacelerou.',
      skill: { name: 'Adiantar Ponteiros', cost: 2, target: 'ally', desc: 'O aliado age imediatamente e ganha 1 de energia.',
        fx: [{ k: 'energy', n: 1 }, { k: 'haste' }] } },

    // ----------------------------------------------------------- RAROS
    { id: 'aqua_phantom', name: 'Aqua Phantom', el: 'water', rarity: 'rare', role: 'balanced', en: 5,
      title: 'Entidade das Profundezas',
      story: 'Um navio afundou com toda a tripulação, mas a canção do marinheiro mais jovem continuou ecoando. Aqua Phantom é essa canção, com forma.',
      skill: { name: 'Maremoto Espectral', cost: 3, target: 'allEnemies', desc: '80% de dano em todos os inimigos; 30% de chance de enfraquecer cada um.',
        fx: [{ k: 'dmg', p: 0.8 }, { k: 'status', s: 'weaken', t: 2, chance: 0.3 }] } },
    { id: 'tempestrix', name: 'Tempestrix', el: 'wind', rarity: 'rare', role: 'speed', en: 5,
      title: 'Harpia do Ciclone',
      story: 'Suas asas são feitas de correntes de ar comprimido. Quando ela pousa, as árvores ao redor se curvam — por respeito ou por medo.',
      skill: { name: 'Ciclone', cost: 3, target: 'allEnemies', desc: '75% de dano em todos e empurra os inimigos para o fim da fila de turnos.',
        fx: [{ k: 'dmg', p: 0.75 }, { k: 'delay' }] } },
    { id: 'guardiao_espinhoso', name: 'Guardião Espinhoso', el: 'nature', rarity: 'rare', role: 'tank', en: 5,
      title: 'Ent da Floresta Velha',
      story: 'Uma árvore anciã que decidiu caminhar quando a floresta foi ameaçada. Cada espinho seu é o nome de uma árvore que tombou.',
      skill: { name: 'Muralha de Espinhos', cost: 3, target: 'self', desc: 'Devolve 45% do dano recebido e ganha Defesa+ por 2 turnos, provocando os inimigos.',
        fx: [{ k: 'status', s: 'reflect', t: 2, v: 0.45 }, { k: 'status', s: 'defUp', t: 2 }, { k: 'status', s: 'taunt', t: 2 }] } },
    { id: 'samurai_ferro', name: 'Samurai de Ferro', el: 'metal', rarity: 'rare', role: 'attacker', en: 5,
      title: 'Lâmina Sem Mestre',
      story: 'Uma armadura que continuou lutando depois que seu guerreiro partiu. Não tem rosto, mas tem honra — e uma espada muito afiada.',
      skill: { name: 'Corte Perfurante', cost: 3, target: 'enemy', desc: '150% de dano que ignora totalmente a defesa.',
        fx: [{ k: 'dmg', p: 1.5, pierce: 1 }] } },
    { id: 'orbe_gravitacional', name: 'Orbe Gravitacional', el: 'gravity', rarity: 'rare', role: 'balanced', en: 5,
      title: 'Núcleo Colapsado',
      story: 'Um pedaço de estrela morta do tamanho de uma bola de gude, mas que pesa como uma montanha. Tudo ao seu redor cai um pouco mais devagar.',
      skill: { name: 'Colapso', cost: 3, target: 'enemy', desc: 'Remove 22% da vida atual do alvo (mínimo 60% de dano) e o deixa lento.',
        fx: [{ k: 'pctHp', p: 0.22, minP: 0.6 }, { k: 'status', s: 'slow', t: 2 }] } },
    { id: 'venom_beast', name: 'Venom Beast', el: 'poison', rarity: 'rare', role: 'attacker', en: 5,
      title: 'Fera Virulenta',
      story: 'Saiu de um laboratório abandonado onde mil venenos foram misturados. É imune a todos e transmite todos.',
      skill: { name: 'Presas Virulentas', cost: 3, target: 'enemy', desc: '100% de dano, 3 acúmulos de veneno e enfraquece.',
        fx: [{ k: 'dmg', p: 1.0 }, { k: 'status', s: 'poison', t: 3, v: 3 }, { k: 'status', s: 'weaken', t: 2 }] } },
    { id: 'arqueira_glacial', name: 'Arqueira Glacial', el: 'ice', rarity: 'rare', role: 'attacker', en: 5,
      title: 'Caçadora do Polo',
      story: 'Suas flechas são esculpidas no gelo mais antigo do mundo. Nunca erram, porque o próprio frio as guia até o alvo.',
      skill: { name: 'Flecha de Cristal', cost: 3, target: 'enemy', desc: '140% de dano, +25% de chance de crítico e 30% de chance de congelar.',
        fx: [{ k: 'dmg', p: 1.4, crit: 0.25 }, { k: 'status', s: 'freeze', t: 1, chance: 0.3 }] } },

    // ----------------------------------------------------------- ÉPICOS
    { id: 'volt_dragon', name: 'Volt Dragon', el: 'lightning', rarity: 'epic', role: 'attacker', en: 5,
      title: 'Dragão da Tempestade',
      story: 'Nasce dentro das nuvens mais escuras e só toca o chão quando um raio cai. Suas escamas guardam a energia de mil tempestades.',
      skill: { name: 'Tempestade Encadeada', cost: 3, target: 'enemy', desc: '140% de dano no alvo e descarga de 60% nos outros inimigos. +50% contra Água.',
        fx: [{ k: 'dmg', p: 1.4, bonusVs: 'water' }, { k: 'chain', p: 0.6 }] } },
    { id: 'shadow_ninja', name: 'Shadow Ninja', el: 'dark', rarity: 'epic', role: 'speed', en: 5,
      title: 'Lâmina da Lua Nova',
      story: 'Treinou numa noite sem lua por cem anos. Quando finalmente viu o próprio reflexo, ele já não estava lá.',
      skill: { name: 'Lâmina Fantasma', cost: 3, target: 'enemy', desc: '3 golpes de 55%, enfraquece o alvo e prepara uma esquiva.',
        fx: [{ k: 'dmg', p: 0.55, hits: 3 }, { k: 'status', s: 'weaken', t: 2 }, { k: 'status', s: 'dodge', t: 3, to: 'self' }] } },
    { id: 'terra_golem', name: 'Terra Golem', el: 'earth', rarity: 'epic', role: 'tank', en: 5,
      title: 'Guardião da Montanha',
      story: 'Quando a montanha sentiu que seria escavada, ergueu-se e foi embora. Terra Golem é o que restou daquela decisão.',
      skill: { name: 'Fortaleza', cost: 3, target: 'allAllies', desc: 'Defesa+ para toda a equipe por 2 turnos; ele provoca os inimigos.',
        fx: [{ k: 'status', s: 'defUp', t: 2 }, { k: 'status', s: 'taunt', t: 2, to: 'self' }] } },
    { id: 'serafim_aurora', name: 'Serafim da Aurora', el: 'light', rarity: 'epic', role: 'support', en: 6,
      title: 'Mensageira do Amanhecer',
      story: 'Aparece no exato instante em que a noite termina. Quem a vê recebe um dia inteiro sem medo.',
      skill: { name: 'Luz Restauradora', cost: 3, target: 'allAllies', desc: 'Cura toda a equipe em 20% e remove efeitos negativos.',
        fx: [{ k: 'heal', pct: 0.2 }, { k: 'cleanse' }] } },
    { id: 'lanceiro_plasma', name: 'Lanceiro de Plasma', el: 'plasma', rarity: 'epic', role: 'attacker', en: 5,
      title: 'Campeão da Fornalha Estelar',
      story: 'Forjou a própria lança no coração de um reator. Cada estocada custa um pouco da sua vida — ele acha um preço justo.',
      skill: { name: 'Supernova Concentrada', cost: 3, target: 'enemy', desc: '210% de dano; sacrifica 8% da própria vida.',
        fx: [{ k: 'dmg', p: 2.1 }, { k: 'selfDmg', pct: 0.08 }] } },
    { id: 'rainha_esporo', name: 'Rainha Esporo', el: 'poison', rarity: 'epic', role: 'support', en: 5,
      title: 'Soberana do Bosque Úmido',
      story: 'Governa um reino subterrâneo de cogumelos interligados. Sabe tudo que acontece na floresta, porque a floresta inteira é ela.',
      skill: { name: 'Nuvem de Esporos', cost: 3, target: 'allEnemies', desc: '50% de dano e 2 acúmulos de veneno em todos os inimigos.',
        fx: [{ k: 'dmg', p: 0.5 }, { k: 'status', s: 'poison', t: 3, v: 2 }] } },

    // ----------------------------------------------------------- LENDÁRIOS
    { id: 'inferno_rex', name: 'Inferno Rex', el: 'fire', rarity: 'legendary', role: 'attacker', en: 6,
      title: 'Guerreiro do Vulcão',
      story: 'Derrotou um vulcão em combate singular e herdou o seu coração. Desde então, onde ele pisa a terra fica vermelha por dias.',
      skill: { name: 'Erupção Infernal', cost: 4, target: 'allEnemies', desc: '110% de dano em todos e queima todos por 3 turnos.',
        fx: [{ k: 'dmg', p: 1.1 }, { k: 'status', s: 'burn', t: 3 }] } },
    { id: 'solar_titan', name: 'Solar Titan', el: 'light', rarity: 'legendary', role: 'balanced', en: 6,
      title: 'Colosso do Meio-Dia',
      story: 'Carrega um pedaço do sol no peito. Quando ergue o punho, as sombras do campo de batalha inteiro somem.',
      skill: { name: 'Juízo Solar', cost: 4, target: 'enemy', desc: '170% de dano; a equipe é curada em 50% do dano causado.',
        fx: [{ k: 'dmg', p: 1.7, teamHeal: 0.5 }] } },
    { id: 'chronos', name: 'Chronos', el: 'time', rarity: 'legendary', role: 'support', en: 6,
      title: 'Mestre das Horas',
      story: 'Viu o início e o fim de todas as coisas e decidiu ficar no meio. Seu cajado não marca as horas: ele as escolhe.',
      skill: { name: 'Dobra Temporal', cost: 4, target: 'enemy', desc: '100% de dano, joga o alvo para o fim da fila e Chronos age outra vez.',
        fx: [{ k: 'dmg', p: 1.0 }, { k: 'delay' }, { k: 'haste', to: 'self' }] } },
    { id: 'valquiria_vendaval', name: 'Valquíria do Vendaval', el: 'wind', rarity: 'legendary', role: 'speed', en: 6,
      title: 'Escolhedora dos Bravos',
      story: 'Cavalga o furacão em busca de guerreiros dignos. Os que ela escolhe nunca mais tropeçam — o vento os segura.',
      skill: { name: 'Olho do Furacão', cost: 4, target: 'allEnemies', desc: '90% de dano em todos e concede Esquiva a toda a equipe.',
        fx: [{ k: 'dmg', p: 0.9 }, { k: 'status', s: 'dodge', t: 3, to: 'allies' }] } },

    // ----------------------------------------------------------- MÍTICOS
    { id: 'frost_queen', name: 'Frost Queen', el: 'ice', rarity: 'mythic', role: 'balanced', en: 6,
      title: 'Rainha do Inverno Eterno',
      story: 'Congelou o próprio coração para não sentir a dor de perder seu reino. Agora governa um império de cristal onde nada envelhece.',
      skill: { name: 'Inverno Eterno', cost: 4, target: 'allEnemies', desc: '100% de dano em todos, 45% de chance de congelar cada um e Defesa+ para a equipe.',
        fx: [{ k: 'dmg', p: 1.0 }, { k: 'status', s: 'freeze', t: 1, chance: 0.45 }, { k: 'status', s: 'defUp', t: 2, to: 'allies' }] } },
    { id: 'gravitar', name: 'Gravitar', el: 'gravity', rarity: 'mythic', role: 'tank', en: 6,
      title: 'Devorador de Órbitas',
      story: 'Uma serpente tão massiva que planetas giram ao seu redor. Engoliu três luas e ainda tem fome.',
      skill: { name: 'Horizonte de Eventos', cost: 4, target: 'allEnemies', desc: 'Remove 20% da vida atual de todos os inimigos e drena 1 de energia de cada.',
        fx: [{ k: 'pctHp', p: 0.2, minP: 0.5 }, { k: 'energy', n: -1 }] } },

    // ----------------------------------------------------------- SECRETOS
    { id: 'void_king', name: 'Void King', el: 'cosmic', rarity: 'secret', role: 'attacker', en: 6,
      title: 'Soberano do Vazio',
      story: 'Antes do universo existia o Vazio, e o Vazio tinha um rei. Ele não odeia a luz: apenas sente falta do silêncio.',
      skill: { name: 'Coroa do Vazio', cost: 4, target: 'allEnemies', desc: '130% de dano em todos, rouba 1 de energia de cada e recupera 30% do dano como vida.',
        fx: [{ k: 'dmg', p: 1.3, ls: 0.3 }, { k: 'energy', n: -1, steal: true }] } },
    { id: 'prismora', name: 'Prismora', el: 'cosmic', rarity: 'secret', role: 'support', en: 6,
      title: 'Criança Estelar',
      story: 'Uma estrela que nasceu com curiosidade demais e desceu para ver o mundo de perto. Onde ela brinca, nascem arco-íris noturnos.',
      skill: { name: 'Big Bang', cost: 4, target: 'enemy', desc: '230% de dano e toda a equipe ganha 2 de energia.',
        fx: [{ k: 'dmg', p: 2.3 }, { k: 'energy', n: 2, to: 'allies' }] } },

    // ----------------------------------------------------------- EXCLUSIVOS DE CHEFES
    { id: 'draco_jr', name: 'Draco Apocalíptico Jr.', el: 'fire', rarity: 'mythic', role: 'attacker', en: 6, bossOnly: 'apocalipse',
      title: 'Herdeiro do Fim',
      story: 'O ovo que o Dragão do Apocalipse protegia. Ainda é pequeno, mas já sabe cuspir meteoros — pequenos, mas meteoros.',
      skill: { name: 'Meteoro Mirim', cost: 4, target: 'allEnemies', desc: '90% de dano em todos, queima todos e ganha Ataque+ por 3 turnos.',
        fx: [{ k: 'dmg', p: 0.9 }, { k: 'status', s: 'burn', t: 3 }, { k: 'status', s: 'atkUp', t: 3, to: 'self' }] } },
    { id: 'arauto_vazio', name: 'Arauto do Vazio', el: 'cosmic', rarity: 'mythic', role: 'speed', en: 6, bossOnly: 'imperador',
      title: 'Voz do Imperador',
      story: 'Anunciava a chegada do Imperador do Vazio. Depois da derrota do mestre, decidiu anunciar a sua própria chegada.',
      skill: { name: 'Fenda Dimensional', cost: 3, target: 'enemy', desc: '160% de dano e remove todos os efeitos positivos do alvo.',
        fx: [{ k: 'dispel' }, { k: 'dmg', p: 1.6 }] } },
    { id: 'donzela_ampulheta', name: 'Donzela da Ampulheta', el: 'time', rarity: 'secret', role: 'support', en: 6, bossOnly: 'deusa',
      title: 'Filha do Tempo',
      story: 'Cada grão da sua ampulheta é um segundo que alguém desejou de volta. Ela os devolve — mas só para quem merece.',
      skill: { name: 'Rebobinar', cost: 4, target: 'self', desc: 'Revive um aliado caído com 45% de vida; se ninguém caiu, cura a equipe em 25% e a equipe ganha 1 de energia.',
        fx: [{ k: 'reviveOrHeal', pct: 0.45, healPct: 0.25 }] } },
    { id: 'fragmento_colossal', name: 'Fragmento Colossal', el: 'dark', rarity: 'secret', role: 'tank', en: 6, bossOnly: 'colosso',
      title: 'Coração do Colosso',
      story: 'O núcleo pulsante do Colosso das Sombras, que se recusou a se desfazer. Ainda sonha em ser gigante.',
      skill: { name: 'Eclipse Total', cost: 4, target: 'allEnemies', desc: '110% de dano em todos, enfraquece todos, provoca e ganha escudo de 30%.',
        fx: [{ k: 'dmg', p: 1.1 }, { k: 'status', s: 'weaken', t: 2 }, { k: 'status', s: 'taunt', t: 2, to: 'self' }, { k: 'shield', pct: 0.3, to: 'self' }] } },

    // ----------------------------------------------------------- ATO II: NOVOS STICKERS DE PACOTE
    { id: 'choquinho', name: 'Choquinho', el: 'lightning', rarity: 'common', role: 'tank', en: 4,
      title: 'Ouriço Estático',
      story: 'Esfregou-se num tapete por três dias seguidos e nunca mais descarregou. Quem tenta fazer carinho leva um susto — e fica com o cabelo em pé por uma semana.',
      skill: { name: 'Espinhos Estáticos', cost: 2, target: 'enemy', desc: '90% de dano e devolve 30% do dano recebido por 2 turnos.',
        fx: [{ k: 'dmg', p: 0.9 }, { k: 'status', s: 'reflect', t: 2, v: 0.3, to: 'self' }] } },
    { id: 'pinguinho', name: 'Pinguinho', el: 'ice', rarity: 'common', role: 'balanced', en: 4,
      title: 'Patinador do Polo',
      story: 'Nunca aprendeu a voar, então aprendeu a deslizar mais rápido que qualquer pássaro. Deixa um rastro de gelo por onde passa — e tombos por onde volta.',
      skill: { name: 'Escorregão Gélido', cost: 2, target: 'enemy', desc: '110% de dano e deixa o alvo lento por 2 turnos.',
        fx: [{ k: 'dmg', p: 1.1 }, { k: 'status', s: 'slow', t: 2 }] } },
    { id: 'flutua', name: 'Flutua', el: 'gravity', rarity: 'common', role: 'support', en: 4,
      title: 'Pedrinha sem Peso',
      story: 'Uma pedra que esqueceu como cair. Passa o dia boiando no ar e, quando alguém precisa, empresta um pouco da sua leveza.',
      skill: { name: 'Leveza', cost: 2, target: 'ally', desc: 'O aliado ganha Esquiva e Defesa+ por 2 turnos.',
        fx: [{ k: 'status', s: 'dodge', t: 3 }, { k: 'status', s: 'defUp', t: 2 }] } },
    { id: 'zumbeia', name: 'Zumbeia', el: 'nature', rarity: 'uncommon', role: 'support', en: 4,
      title: 'Abelha Curandeira',
      story: 'Produz um mel que fecha feridas na hora. O segredo da receita? Ela mesma não sabe: só voa por aí e as flores fazem o resto.',
      skill: { name: 'Ferrão de Mel', cost: 2, target: 'enemy', desc: '100% de dano no alvo e cura em 18% o aliado mais ferido.',
        fx: [{ k: 'dmg', p: 1.0 }, { k: 'heal', pct: 0.18, to: 'lowestAlly' }] } },
    { id: 'besouro_blindado', name: 'Besouro Blindado', el: 'metal', rarity: 'uncommon', role: 'tank', en: 5,
      title: 'Escaravelho de Aço',
      story: 'Sua carapaça foi forjada por anões de outra dimensão. Já foi usado como escudo, como bigorna e, uma vez, como frigideira.',
      skill: { name: 'Carapaça Coletiva', cost: 3, target: 'allAllies', desc: 'Toda a equipe ganha escudo de 15% da vida máxima.',
        fx: [{ k: 'shield', pct: 0.15 }] } },
    { id: 'leonzinho', name: 'Leonzinho', el: 'light', rarity: 'uncommon', role: 'attacker', en: 4,
      title: 'Filhote do Sol',
      story: 'Nasceu ao meio-dia em ponto, quando as sombras desaparecem. Seu rugido ainda é fino, mas já faz o sol brilhar um pouco mais forte.',
      skill: { name: 'Rugido Brilhante', cost: 2, target: 'enemy', desc: '120% de dano e ganha Ataque+ por 2 turnos.',
        fx: [{ k: 'dmg', p: 1.2 }, { k: 'status', s: 'atkUp', t: 2, to: 'self' }] } },
    { id: 'medusa_plasma', name: 'Medusa de Plasma', el: 'plasma', rarity: 'rare', role: 'balanced', en: 5,
      title: 'Água-viva Elétrica',
      story: 'Flutua pelos oceanos da atmosfera superior, onde o céu vira mar. Seus tentáculos brilham como neon e queimam como estrelas.',
      skill: { name: 'Tentáculos Ionizados', cost: 3, target: 'allEnemies', desc: '65% de dano em todos, com 35% de chance de atordoar cada um.',
        fx: [{ k: 'dmg', p: 0.65 }, { k: 'status', s: 'stun', t: 1, chance: 0.35 }] } },
    { id: 'coelho_ampulheta', name: 'Coelho Ampulheta', el: 'time', rarity: 'rare', role: 'speed', en: 5,
      title: 'Mensageiro Atrasado',
      story: 'Está sempre atrasado — então aprendeu a pular para alguns segundos no futuro. Agora chega antes de sair, o que confunde todo mundo.',
      skill: { name: 'Salto Temporal', cost: 3, target: 'enemy', desc: '130% de dano e age outra vez imediatamente.',
        fx: [{ k: 'dmg', p: 1.3 }, { k: 'haste', to: 'self' }] } },
    { id: 'cometa_errante', name: 'Cometa Errante', el: 'cosmic', rarity: 'rare', role: 'attacker', en: 5,
      title: 'Viajante de Cauda Longa',
      story: 'Passa pelo céu a cada setenta anos e sempre traz lembranças de outras galáxias. Desta vez resolveu ficar um pouco mais.',
      skill: { name: 'Poeira Estelar', cost: 3, target: 'allEnemies', desc: '75% de dano em todos e a equipe ganha 1 de energia.',
        fx: [{ k: 'dmg', p: 0.75 }, { k: 'energy', n: 1, to: 'allies' }] } },
    { id: 'monge_gravidade', name: 'Monge da Gravidade', el: 'gravity', rarity: 'epic', role: 'support', en: 6,
      title: 'Mestre da Levitação',
      story: 'Meditou no topo de uma montanha até a montanha começar a flutuar com ele. Ensina que tudo que sobe pode escolher não descer.',
      skill: { name: 'Levitação Sagrada', cost: 3, target: 'allAllies', desc: 'Toda a equipe ganha Esquiva e Defesa+ por 2 turnos.',
        fx: [{ k: 'status', s: 'dodge', t: 3 }, { k: 'status', s: 'defUp', t: 2 }] } },
    { id: 'cervo_ancestral', name: 'Cervo Ancestral', el: 'nature', rarity: 'epic', role: 'support', en: 6,
      title: 'Guardião dos Bosques',
      story: 'Seus chifres são galhos que florescem a cada primavera. Onde ele pisa, a grama cresce de novo — mesmo sobre cinzas.',
      skill: { name: 'Bênção da Floresta', cost: 3, target: 'allAllies', desc: 'Equipe regenera 10% por 3 turnos e remove efeitos negativos.',
        fx: [{ k: 'status', s: 'regen', t: 3, v: 0.1 }, { k: 'cleanse' }] } },
    { id: 'fenix_rubra', name: 'Fênix Rubra', el: 'fire', rarity: 'epic', role: 'attacker', en: 5,
      title: 'Ave que Não Morre',
      story: 'Já renasceu das próprias cinzas mil e uma vezes. Na milésima segunda, decidiu que estava cansada de morrer e começou a revidar.',
      skill: { name: 'Asas do Renascer', cost: 3, target: 'allEnemies', desc: '85% de dano em todos, queima todos e cura 20% da própria vida.',
        fx: [{ k: 'dmg', p: 0.85 }, { k: 'status', s: 'burn', t: 2 }, { k: 'heal', pct: 0.2, to: 'self' }] } },
    { id: 'colosso_mecanico', name: 'Colosso Mecânico', el: 'metal', rarity: 'legendary', role: 'tank', en: 6,
      title: 'Ômicron, o Último Guardião',
      story: 'Construído para proteger uma cidade que não existe mais. Continua de guarda, porque ninguém nunca lhe disse para parar.',
      skill: { name: 'Canhão de Fótons', cost: 4, target: 'enemy', desc: '180% de dano que ignora 50% da defesa, com descarga de 50% nos outros inimigos.',
        fx: [{ k: 'dmg', p: 1.8, pierce: 0.5 }, { k: 'chain', p: 0.5 }] } },
    { id: 'ceifadora_lunar', name: 'Ceifadora Lunar', el: 'dark', rarity: 'legendary', role: 'speed', en: 6,
      title: 'A Foice da Lua Minguante',
      story: 'Colhe as sombras que sobram no fim de cada noite. Dizem que se você ouvir o som da foice, ainda dá tempo de acender uma luz.',
      skill: { name: 'Colheita Sombria', cost: 4, target: 'enemy', desc: '160% de dano, recupera 50% do dano como vida e enfraquece o alvo.',
        fx: [{ k: 'dmg', p: 1.6, ls: 0.5 }, { k: 'status', s: 'weaken', t: 2 }] } },
    { id: 'imperador_trovao', name: 'Imperador Trovão', el: 'lightning', rarity: 'mythic', role: 'attacker', en: 6,
      title: 'Senhor dos Céus Furiosos',
      story: 'Toca tambores feitos de nuvens de tempestade. Cada batida é um trovão, e cada trovão é uma ordem que o céu inteiro obedece.',
      skill: { name: 'Julgamento Celeste', cost: 4, target: 'allEnemies', desc: '115% de dano em todos (+50% contra Água) com 35% de chance de atordoar.',
        fx: [{ k: 'dmg', p: 1.15, bonusVs: 'water' }, { k: 'status', s: 'stun', t: 1, chance: 0.35 }] } },
    { id: 'aeon', name: 'Aeon', el: 'time', rarity: 'secret', role: 'speed', en: 6,
      title: 'O Primeiro Segundo',
      story: 'Antes de existir qualquer coisa, existiu um instante. Aeon é esse instante, que ganhou vontade própria e resolveu ver como tudo termina.',
      skill: { name: 'Fim das Eras', cost: 4, target: 'allEnemies', desc: '120% de dano em todos, empurra os inimigos para o fim da fila e Aeon age de novo.',
        fx: [{ k: 'dmg', p: 1.2 }, { k: 'delay' }, { k: 'haste', to: 'self' }] } },

    // ----------------------------------------------------------- ATO II: EXCLUSIVOS DE CHEFES
    { id: 'hidrinha', name: 'Hidrinha', el: 'water', rarity: 'mythic', role: 'balanced', en: 6, bossOnly: 'hidra',
      title: 'Filhote de Três Cabeças',
      story: 'As três cabeças discutem o tempo todo sobre para onde ir, então ela costuma andar em círculos. Mas em batalha, todas concordam.',
      skill: { name: 'Mordida Tripla', cost: 4, target: 'enemy', desc: '3 mordidas de 70% e 3 acúmulos de veneno.',
        fx: [{ k: 'dmg', p: 0.7, hits: 3 }, { k: 'status', s: 'poison', t: 3, v: 3 }] } },
    { id: 'princesa_trovao', name: 'Princesa Trovão', el: 'lightning', rarity: 'mythic', role: 'speed', en: 6, bossOnly: 'tempestade',
      title: 'Herdeira da Tormenta',
      story: 'Filha da Rainha das Tempestades, fugiu do palácio de nuvens para conhecer o chão. Ainda não aprendeu a andar sem soltar faíscas.',
      skill: { name: 'Coroa de Raios', cost: 4, target: 'enemy', desc: '150% de dano, descarga de 70% nos outros e 40% de chance de atordoar o alvo.',
        fx: [{ k: 'dmg', p: 1.5 }, { k: 'chain', p: 0.7 }, { k: 'status', s: 'stun', t: 1, chance: 0.4 }] } },
    { id: 'nucleo_aco', name: 'Núcleo de Aço', el: 'metal', rarity: 'secret', role: 'tank', en: 6, bossOnly: 'tita',
      title: 'Coração do Titã',
      story: 'O motor que movia o Titã de Aço. Sem o corpo gigante, ele construiu um pequeno para si — e jurou proteger quem o libertou.',
      skill: { name: 'Fortaleza Viva', cost: 4, target: 'allAllies', desc: 'Equipe ganha escudo de 25%; ele provoca os inimigos e devolve 40% do dano por 2 turnos.',
        fx: [{ k: 'shield', pct: 0.25 }, { k: 'status', s: 'taunt', t: 2, to: 'self' }, { k: 'status', s: 'reflect', t: 2, v: 0.4, to: 'self' }] } },
    { id: 'omega_desperto', name: 'Ômega Desperto', el: 'cosmic', rarity: 'secret', role: 'attacker', en: 6, bossOnly: 'omega',
      title: 'O Último Poder',
      story: 'Quando o Devorador foi derrotado, todos os poderes que ele havia engolido voltaram ao mundo — menos um. Este escolheu ficar com você.',
      skill: { name: 'Absorver Poderes', cost: 4, target: 'allEnemies', desc: 'Remove os efeitos positivos dos inimigos, causa 140% de dano em todos e rouba 1 de energia de cada.',
        fx: [{ k: 'dispel' }, { k: 'dmg', p: 1.4 }, { k: 'energy', n: -1, steal: true }] } }
  ];
  S.forEach((s, i) => { s.num = i + 1; });
  SP.STICKERS = S;
  SP.STICKER = {};
  S.forEach(s => { SP.STICKER[s.id] = s; });

  /* ---------------------------------------------------------------- CHEFES */
  SP.BOSS_BASE_MULT = 1.0; // atributos base do chefe = sticker comum do mesmo nível × multiplicadores abaixo
  SP.BOSSES = [
    { id: 'apocalipse', name: 'Dragão do Apocalipse', el: 'fire', stage: 5,
      title: 'Aquele que Incendeia os Céus',
      intro: 'Dormiu dentro do vulcão por mil anos. Agora despertou com fome de mundos. Suas escamas derretem aço e seu rugido arranca coragem.',
      tip: 'Água tem vantagem sobre ele. Evite Natureza, Gelo e Metal, que sofrem com o fogo. Cure as queimaduras rápido.',
      hp: 3.3, atk: 0.85, def: 0.95, spd: 0.95, acts: 2, en: 6,
      pattern: [
        { name: 'Garra Rubra', target: 'enemy', fx: [{ k: 'dmg', p: 1.2 }] },
        { name: 'Chuva de Meteoros', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.7 }, { k: 'status', s: 'burn', t: 3, chance: 0.7 }] },
        { name: 'Garra Rubra', target: 'enemy', fx: [{ k: 'dmg', p: 1.2 }] },
        { name: 'Rugido Apocalíptico', target: 'allEnemies', fx: [{ k: 'status', s: 'weaken', t: 2 }, { k: 'status', s: 'atkUp', t: 2, to: 'self' }] }
      ],
      enrage: [
        { name: 'Sopro do Fim', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.9 }, { k: 'status', s: 'burn', t: 2, chance: 0.6 }] },
        { name: 'Garra Rubra', target: 'enemy', fx: [{ k: 'dmg', p: 1.3 }] },
        { name: 'Asas Flamejantes', target: 'self', fx: [{ k: 'status', s: 'defUp', t: 2 }, { k: 'heal', pct: 0.06 }] }
      ] },
    { id: 'imperador', name: 'Imperador do Vazio', el: 'cosmic', stage: 10,
      title: 'O Trono Além das Estrelas',
      intro: 'Governa o espaço entre as galáxias, onde nem a luz ousa entrar. Ele devora a energia dos seus inimigos e a transforma em silêncio.',
      tip: 'Gravidade causa dano extra nele. Guarde energia: ele vai drená-la.',
      hp: 3.6, atk: 0.9, def: 1.0, spd: 1.0, acts: 2, en: 6,
      pattern: [
        { name: 'Golpe Estelar', target: 'enemy', fx: [{ k: 'dmg', p: 1.15 }] },
        { name: 'Devorar Estrelas', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.6, ls: 0.5 }, { k: 'energy', n: -1 }] },
        { name: 'Singularidade', target: 'enemy', fx: [{ k: 'pctHp', p: 0.3, minP: 0.8 }] },
        { name: 'Golpe Estelar', target: 'enemy', fx: [{ k: 'dmg', p: 1.15 }] }
      ],
      enrage: [
        { name: 'Manto do Vazio', target: 'self', fx: [{ k: 'shield', pct: 0.12 }, { k: 'cleanse' }] },
        { name: 'Devorar Estrelas', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.7, ls: 0.4 }, { k: 'energy', n: -1 }] },
        { name: 'Colapso Imperial', target: 'enemy', fx: [{ k: 'dmg', p: 1.6 }] }
      ] },
    { id: 'deusa', name: 'Deusa do Tempo', el: 'time', stage: 15,
      title: 'Tecelã das Eras',
      intro: 'Ela tece passado e futuro no mesmo fio. Em sua presença, os turnos se embaralham e os golpes acontecem antes de serem dados.',
      tip: 'Cósmico e Trevas têm vantagem sobre ela. Ela atrasa sua equipe — mantenha curas prontas.',
      hp: 3.8, atk: 0.9, def: 1.0, spd: 1.25, acts: 2, en: 6,
      pattern: [
        { name: 'Ponteiro Afiado', target: 'enemy', fx: [{ k: 'dmg', p: 1.15 }] },
        { name: 'Ampulheta Partida', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.55 }, { k: 'delay' }, { k: 'status', s: 'slow', t: 2 }] },
        { name: 'Paradoxo', target: 'enemy', fx: [{ k: 'dmg', p: 0.9 }, { k: 'haste', to: 'self' }] },
        { name: 'Congelar o Instante', target: 'enemy', fx: [{ k: 'dmg', p: 0.8 }, { k: 'status', s: 'freeze', t: 1 }] }
      ],
      enrage: [
        { name: 'Retrocesso', target: 'self', fx: [{ k: 'heal', pct: 0.1 }, { k: 'cleanse' }], once: true },
        { name: 'Fim das Eras', target: 'allEnemies', fx: [{ k: 'dmg', p: 1.0 }, { k: 'status', s: 'stun', t: 1, chance: 0.3 }] },
        { name: 'Paradoxo', target: 'enemy', fx: [{ k: 'dmg', p: 1.0 }, { k: 'haste', to: 'self' }] }
      ] },
    { id: 'colosso', name: 'Colosso das Sombras', el: 'dark', stage: 20,
      title: 'A Noite que Caminha',
      intro: 'Formado por todas as sombras que já foram projetadas, cresce a cada pôr do sol. Seus passos apagam cidades inteiras.',
      tip: 'Luz tem vantagem sobre ele. Cuidado: quando ergue a muralha, ataques o ferem de volta.',
      hp: 5.6, atk: 1.1, def: 1.1, spd: 0.85, acts: 2, en: 6,
      pattern: [
        { name: 'Punho da Noite', target: 'enemy', fx: [{ k: 'dmg', p: 1.25 }] },
        { name: 'Muralha Sombria', target: 'self', fx: [{ k: 'status', s: 'defUp', t: 2 }, { k: 'status', s: 'reflect', t: 2, v: 0.3 }] },
        { name: 'Eclipse', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.85 }, { k: 'status', s: 'weaken', t: 2 }] },
        { name: 'Punho da Noite', target: 'enemy', fx: [{ k: 'dmg', p: 1.25 }] }
      ],
      enrage: [
        { name: 'Fúria Abissal', target: 'self', fx: [{ k: 'status', s: 'atkUp', t: 3 }, { k: 'cleanse' }] },
        { name: 'Esmagar Sombras', target: 'allEnemies', fx: [{ k: 'dmg', p: 1.1 }] },
        { name: 'Punho da Noite', target: 'enemy', fx: [{ k: 'dmg', p: 1.4 }, { k: 'status', s: 'stun', t: 1, chance: 0.35 }] }
      ] },
    // ----------------------------------------------------------- ATO II
    { id: 'hidra', name: 'Hidra Abissal', el: 'water', stage: 25, act: 2,
      title: 'As Sete Bocas do Oceano',
      intro: 'Vive no ponto mais fundo do mar, onde a luz nunca chegou. Cada cabeça cortada volta mais faminta — e a maré sobe com a sua fúria.',
      tip: 'Raio e Natureza têm vantagem sobre ela. Fogo e Terra sofrem. Leve cura contra o veneno.',
      hp: 9.4, atk: 1.48, def: 1.0, spd: 1.0, acts: 2, en: 6,
      pattern: [
        { name: 'Mordida Abissal', target: 'enemy', fx: [{ k: 'dmg', p: 1.15 }, { k: 'status', s: 'poison', t: 3, v: 2 }] },
        { name: 'Tsunami', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.7 }, { k: 'delay' }] },
        { name: 'Mordida Abissal', target: 'enemy', fx: [{ k: 'dmg', p: 1.15 }, { k: 'status', s: 'poison', t: 3, v: 2 }] },
        { name: 'Névoa Venenosa', target: 'allEnemies', fx: [{ k: 'status', s: 'poison', t: 3, v: 2 }, { k: 'status', s: 'weaken', t: 2, chance: 0.5 }] }
      ],
      enrage: [
        { name: 'Cabeças Renascidas', target: 'self', fx: [{ k: 'status', s: 'regen', t: 3, v: 0.03 }, { k: 'cleanse' }], once: true },
        { name: 'Fúria das Sete Bocas', target: 'enemy', fx: [{ k: 'dmg', p: 0.5, hits: 3 }] },
        { name: 'Tsunami', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.85 }, { k: 'delay' }] }
      ] },
    { id: 'tempestade', name: 'Rainha das Tempestades', el: 'lightning', stage: 30, act: 2,
      title: 'A Coroa de Mil Relâmpagos',
      intro: 'Governa um palácio feito de nuvens negras. Seus súditos são os trovões e sua voz é o estrondo que quebra o céu ao meio.',
      tip: 'Terra tem vantagem sobre ela. Água e Metal sofrem muito. Ela atordoa: espalhe as ameaças.',
      hp: 5.95, atk: 1.22, def: 0.95, spd: 1.3, acts: 2, en: 6,
      pattern: [
        { name: 'Relâmpago', target: 'enemy', fx: [{ k: 'dmg', p: 1.2 }] },
        { name: 'Cadeia Trovejante', target: 'enemy', fx: [{ k: 'dmg', p: 0.9 }, { k: 'chain', p: 0.6 }] },
        { name: 'Olho da Tempestade', target: 'self', fx: [{ k: 'status', s: 'dodge', t: 3 }, { k: 'status', s: 'atkUp', t: 2 }] },
        { name: 'Trovão Ensurdecedor', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.6 }, { k: 'status', s: 'stun', t: 1, chance: 0.3 }] }
      ],
      enrage: [
        { name: 'Supercélula', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.95 }, { k: 'status', s: 'stun', t: 1, chance: 0.25 }] },
        { name: 'Relâmpago Duplo', target: 'enemy', fx: [{ k: 'dmg', p: 0.8, hits: 2 }, { k: 'haste', to: 'self' }] },
        { name: 'Cadeia Trovejante', target: 'enemy', fx: [{ k: 'dmg', p: 1.0 }, { k: 'chain', p: 0.7 }] }
      ] },
    { id: 'tita', name: 'Titã de Aço', el: 'metal', stage: 35, act: 2,
      title: 'A Fortaleza que Anda',
      intro: 'Uma máquina do tamanho de uma montanha, construída por uma civilização esquecida. Ela acordou com uma única ordem: esmagar qualquer poder.',
      tip: 'Fogo, Plasma e Raio têm vantagem sobre ele. Quando ergue o escudo, use dano que ignora defesa ou espere passar.',
      hp: 11.4, atk: 1.56, def: 1.25, spd: 0.8, acts: 2, en: 6,
      pattern: [
        { name: 'Punho Hidráulico', target: 'enemy', fx: [{ k: 'dmg', p: 1.25 }] },
        { name: 'Blindagem Reativa', target: 'self', fx: [{ k: 'shield', pct: 0.1 }, { k: 'status', s: 'reflect', t: 2, v: 0.25 }] },
        { name: 'Varredura de Mísseis', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.75 }] },
        { name: 'Punho Hidráulico', target: 'enemy', fx: [{ k: 'dmg', p: 1.25 }, { k: 'status', s: 'stun', t: 1, chance: 0.25 }] }
      ],
      enrage: [
        { name: 'Sobrecarga do Reator', target: 'self', fx: [{ k: 'status', s: 'atkUp', t: 3 }, { k: 'cleanse' }] },
        { name: 'Varredura de Mísseis', target: 'allEnemies', fx: [{ k: 'dmg', p: 0.9 }] },
        { name: 'Esmagar', target: 'enemy', fx: [{ k: 'dmg', p: 1.5, pierce: 0.3 }] }
      ] },
    { id: 'omega', name: 'Ômega, o Devorador', el: 'cosmic', stage: 40, act: 2,
      title: 'O Fim de Todos os Poderes',
      intro: 'Uma fome com forma. Já engoliu os poderes de mil mundos e veio buscar os seus. Diante dele, até os chefes que você derrotou tremiam.',
      tip: 'Só Gravidade tem vantagem sobre ele. Ele apaga seus bônus e rouba energia: use habilidades assim que puder.',
      hp: 7.8, atk: 1.2, def: 1.05, spd: 1.1, acts: 2, en: 6,
      pattern: [
        { name: 'Toque do Vazio', target: 'enemy', fx: [{ k: 'dispel' }, { k: 'dmg', p: 1.15 }] },
        { name: 'Devorar Poderes', target: 'allEnemies', fx: [{ k: 'dispel' }, { k: 'energy', n: -1 }, { k: 'dmg', p: 0.55, ls: 0.4 }] },
        { name: 'Toque do Vazio', target: 'enemy', fx: [{ k: 'dispel' }, { k: 'dmg', p: 1.15 }] },
        { name: 'Horizonte Final', target: 'enemy', fx: [{ k: 'pctHp', p: 0.3, minP: 0.9 }] }
      ],
      enrage: [
        { name: 'Forma Verdadeira', target: 'self', fx: [{ k: 'shield', pct: 0.1 }, { k: 'status', s: 'atkUp', t: 3 }, { k: 'cleanse' }], once: true },
        { name: 'Big Crunch', target: 'allEnemies', fx: [{ k: 'dmg', p: 1.0 }, { k: 'status', s: 'weaken', t: 2 }, { k: 'delay' }] },
        { name: 'Devorar Poderes', target: 'allEnemies', fx: [{ k: 'dispel' }, { k: 'energy', n: -1 }, { k: 'dmg', p: 0.7, ls: 0.4 }] },
        { name: 'Toque do Vazio', target: 'enemy', fx: [{ k: 'dispel' }, { k: 'dmg', p: 1.3 }] }
      ] }
  ];
  SP.BOSS = {};
  SP.BOSSES.forEach(b => { SP.BOSS[b.id] = b; b.reward = SP.STICKERS.find(s => s.bossOnly === b.id).id; });

  /* ---------------------------------------------------------------- FASES (CAMPANHA) */
  SP.REGIONS = [
    { name: 'Vale das Faíscas',   stages: [1, 5],   bg: ['#3b1d0f', '#a33a12'] },
    { name: 'Abismo Estelar',     stages: [6, 10],  bg: ['#120b2e', '#3a1d7a'] },
    { name: 'Cidadela das Horas', stages: [11, 15], bg: ['#062a2a', '#127a6f'] },
    { name: 'Terra do Eclipse',   stages: [16, 20], bg: ['#0e0718', '#43125c'] },
    { name: 'Mar das Hidras',     stages: [21, 25], bg: ['#021a2e', '#0b5a7a'], act: 2 },
    { name: 'Picos da Tempestade',stages: [26, 30], bg: ['#16163a', '#5a5a12'], act: 2 },
    { name: 'Forja dos Titãs',    stages: [31, 35], bg: ['#1a1410', '#6b3a12'], act: 2 },
    { name: 'Núcleo Ômega',       stages: [36, 40], bg: ['#05020c', '#5a0a4a'], act: 2 }
  ];
  SP.REGIONS.forEach(r => { r.act = r.act || 1; });
  SP.STAGE_COUNT = 40;
  SP.ACT1_END = 20;
  SP.starsForLevel = lvl => Math.max(1, Math.min(5, Math.ceil(lvl / 10)));
  // Equipes inimigas de cada fase (fases de chefe ficam de fora).
  SP.STAGE_ENEMIES = {
    1: ['brasinha', 'faisca'],
    2: ['sapo_toxico', 'brisinha'],
    3: ['brasinha', 'parafuso', 'brotinho'],
    4: ['faisca', 'seixo', 'gotinha'],
    6: ['gato_sombrio', 'brisinha', 'gotinha'],
    7: ['fogo_fatuo', 'parafuso', 'brotinho'],
    8: ['cavaleiro_coral', 'rochoso', 'mariposa_lume'],
    9: ['tique_taque', 'gato_sombrio', 'raposa_nivea'],
    11: ['aqua_phantom', 'rochoso', 'brotinho'],
    12: ['samurai_ferro', 'raposa_nivea', 'mariposa_lume'],
    13: ['orbe_gravitacional', 'tempestrix', 'gotinha'],
    14: ['venom_beast', 'arqueira_glacial', 'rochoso'],
    16: ['shadow_ninja', 'tempestrix', 'mariposa_lume'],
    17: ['volt_dragon', 'terra_golem', 'brotinho'],
    18: ['lanceiro_plasma', 'rainha_esporo', 'guardiao_espinhoso'],
    19: ['inferno_rex', 'serafim_aurora', 'samurai_ferro'],
    // Ato II
    21: ['aqua_phantom', 'zumbeia', 'pinguinho'],
    22: ['medusa_plasma', 'besouro_blindado', 'cavaleiro_coral'],
    23: ['venom_beast', 'rainha_esporo', 'gotinha'],
    24: ['volt_dragon', 'coelho_ampulheta', 'cervo_ancestral'],
    26: ['tempestrix', 'choquinho', 'leonzinho'],
    27: ['valquiria_vendaval', 'flutua', 'faisca'],
    28: ['cometa_errante', 'monge_gravidade', 'shadow_ninja'],
    29: ['imperador_trovao', 'terra_golem', 'mariposa_lume'],
    31: ['colosso_mecanico', 'parafuso', 'brotinho'],
    32: ['fenix_rubra', 'samurai_ferro', 'serafim_aurora'],
    33: ['lanceiro_plasma', 'besouro_blindado', 'cervo_ancestral'],
    34: ['inferno_rex', 'frost_queen', 'guardiao_espinhoso'],
    36: ['ceifadora_lunar', 'chronos', 'monge_gravidade'],
    37: ['gravitar', 'solar_titan', 'zumbeia'],
    38: ['frost_queen', 'imperador_trovao', 'serafim_aurora'],
    39: ['void_king', 'aeon', 'colosso_mecanico']
  };

  SP.stageInfo = function (n) {
    const boss = SP.BOSSES.find(b => b.stage === n) || null;
    const level = n <= SP.ACT1_END ? Math.max(1, Math.min(30, Math.round(1 + (n - 1) * 1.45))) : Math.min(50, 30 + (n - SP.ACT1_END));
    const enemyLevel = Math.max(1, level - (n <= 3 ? 1 : n <= 10 ? 2 : n <= 15 ? 3 : n <= 20 ? 5 : 3));
    const stars = SP.starsForLevel(level);
    const region = SP.REGIONS.find(r => n >= r.stages[0] && n <= r.stages[1]);
    return {
      n, boss, level, enemyLevel, stars, region, enemies: SP.STAGE_ENEMIES[n] || null,
      coins: 40 + n * 12, xp: 18 + n * 7, frags: 4 + Math.floor(n * 1.5),
      firstCoins: 100 + n * 30, firstFrags: 15 + n * 3
    };
  };

  /* ---------------------------------------------------------------- PACOTES
     As taxas abaixo são as reais usadas no sorteio (core.js). Se uma raridade
     não tiver nenhum sticker disponível no conjunto do pacote, o peso dela é
     redistribuído proporcionalmente — e a tela de probabilidades mostra os
     valores já recalculados. */
  SP.RATES = {
    basic:   { common: 50, uncommon: 27, rare: 14, epic: 6, legendary: 2.2, mythic: 0.7, secret: 0.1 },
    event:   { common: 40, uncommon: 28, rare: 18, epic: 9, legendary: 3.5, mythic: 1.2, secret: 0.3 },
    premium: { common: 0,  uncommon: 40, rare: 33, epic: 17, legendary: 7, mythic: 2.5, secret: 0.5 },
    cosmic:  { common: 0,  uncommon: 0,  rare: 45, epic: 32, legendary: 15, mythic: 6, secret: 2 }
  };

  SP.PACKS = [
    { id: 'daily', name: 'Pacote Diário', desc: 'Grátis uma vez por dia (pelo relógio do seu dispositivo).',
      cost: { coins: 0 }, count: 3, rates: 'basic', colors: ['#3ddc84', '#0f7a4a'], icon: 'gift', daily: true },
    { id: 'basic', name: 'Pacote Básico', desc: '3 stickers de qualquer elemento.',
      cost: { coins: 100 }, count: 3, rates: 'basic', colors: ['#5b8cff', '#2a3f9c'], icon: 'pack' },
    { id: 'fury', name: 'Pacote Fúria', desc: 'Só Fogo, Raio, Terra, Plasma e Metal.',
      cost: { coins: 160 }, count: 3, rates: 'basic', elements: ['fire', 'lightning', 'earth', 'plasma', 'metal'], colors: ['#ff6a2a', '#8a1d0a'], icon: 'flame' },
    { id: 'tide', name: 'Pacote Maré', desc: 'Só Água, Gelo, Vento, Natureza e Veneno.',
      cost: { coins: 160 }, count: 3, rates: 'basic', elements: ['water', 'ice', 'wind', 'nature', 'poison'], colors: ['#2fb5ff', '#0b4a7a'], icon: 'drop' },
    { id: 'astral', name: 'Pacote Astral', desc: 'Só Luz, Trevas, Gravidade, Tempo e Cósmico.',
      cost: { coins: 160 }, count: 3, rates: 'basic', elements: ['light', 'dark', 'gravity', 'time', 'cosmic'], colors: ['#9b6bff', '#2b1366'], icon: 'star' },
    { id: 'event', name: 'Pacote de Evento', desc: 'Elementos em destaque da semana têm peso 3× dentro de cada raridade.',
      cost: { coins: 250 }, count: 3, rates: 'event', event: true, colors: ['#ff4fa3', '#6b0f4a'], icon: 'event' },
    { id: 'premium', name: 'Pacote Premium', desc: 'Sem comuns. O último sticker é garantido Raro ou melhor.',
      cost: { coins: 450 }, count: 3, rates: 'premium', guarantee: { slot: 2, minRank: 2 }, colors: ['#ffc21a', '#8a5a00'], icon: 'crown' },
    { id: 'cosmic', name: 'Pacote Cósmico', desc: 'Pago com Essência de chefes. Raro ou melhor em todos os slots.',
      cost: { essence: 3 }, count: 3, rates: 'cosmic', colors: ['#ff2e7e', '#3a0a5e'], icon: 'cosmic' }
  ];
  SP.PACK = {};
  SP.PACKS.forEach(p => { SP.PACK[p.id] = p; });
  SP.EVENT_WEIGHT = 3;
  // Grupos de elementos em destaque, alternando a cada semana do ano.
  SP.EVENT_ROTATION = [
    { name: 'Semana da Chama Eterna', elements: ['fire', 'plasma', 'light'] },
    { name: 'Semana das Marés Profundas', elements: ['water', 'ice', 'poison'] },
    { name: 'Semana da Tempestade', elements: ['lightning', 'wind', 'metal'] },
    { name: 'Semana do Eclipse', elements: ['dark', 'cosmic', 'gravity'] },
    { name: 'Semana das Eras', elements: ['time', 'earth', 'nature'] }
  ];

  /* ---------------------------------------------------------------- PROGRESSÃO */
  SP.PROG = {
    maxStars: 5,
    levelCap: stars => stars * 10,
    xpToNext: level => 30 + level * 20,
    levelGrowth: 0.07,          // +7% dos atributos base por nível
    starGrowth: 0.22,           // +22% por estrela acima de 1
    evoCoins: stars => 250 * stars,
    evoFrags: (rarity, stars) => Math.round(SP.RARITY[rarity].evoFrags * [0, 1, 2.5, 4, 6][stars]),
    evoEssence: stars => [0, 0, 0, 2, 4][stars] || 0,   // estrelas 4 e 5 exigem Essência de chefe
    trainCost: 80,              // moedas por treino
    trainXp: 60,                // XP por treino
    awakenedPower: 1.25,        // estrela 3: habilidade desperta (+25% de poder, -1 de custo)
    supremePower: 1.5,          // estrela 5: forma suprema (+50% de poder no total)
    startCoins: 300,
    starters: ['brasinha', 'gotinha', 'seixo']
  };

  /* ---------------------------------------------------------------- MISSÕES */
  // Conquistas (uma vez). `stat` refere-se a contadores em state.stats ou a
  // funções especiais calculadas em core.js.
  SP.MISSIONS = [
    { id: 'm_open3',     name: 'Primeiros Pacotes',      desc: 'Abra 3 pacotes.',                         stat: 'packsOpened', goal: 3,  reward: { coins: 150 } },
    { id: 'm_open15',    name: 'Colecionador Ávido',     desc: 'Abra 15 pacotes.',                        stat: 'packsOpened', goal: 15, reward: { coins: 400, tokens: { premium: 1 } } },
    { id: 'm_win1',      name: 'Primeira Vitória',       desc: 'Vença 1 batalha.',                        stat: 'battlesWon',  goal: 1,  reward: { coins: 100 } },
    { id: 'm_win5',      name: 'Duelista',               desc: 'Vença 5 batalhas.',                       stat: 'battlesWon',  goal: 5,  reward: { coins: 250, fragments: 30 } },
    { id: 'm_win25',     name: 'Campeão das Arenas',     desc: 'Vença 25 batalhas.',                      stat: 'battlesWon',  goal: 25, reward: { coins: 800, tokens: { premium: 1 } } },
    { id: 'm_rare',      name: 'Brilho Azul',            desc: 'Descubra um sticker Raro ou melhor.',     stat: 'bestRank',    goal: 2,  reward: { coins: 200, fragments: 20 } },
    { id: 'm_epic',      name: 'Aura Violeta',           desc: 'Descubra um sticker Épico ou melhor.',    stat: 'bestRank',    goal: 3,  reward: { coins: 400, fragments: 40 } },
    { id: 'm_legend',    name: 'Ouro Puro',              desc: 'Descubra um sticker Lendário ou melhor.', stat: 'bestRank',    goal: 4,  reward: { coins: 800, essence: 1 } },
    { id: 'm_evolve1',   name: 'Despertar',              desc: 'Evolua um sticker.',                      stat: 'evolutions',  goal: 1,  reward: { coins: 300, fragments: 30 } },
    { id: 'm_evolve5',   name: 'Mestre da Evolução',     desc: 'Evolua stickers 5 vezes.',                stat: 'evolutions',  goal: 5,  reward: { coins: 700, essence: 1 } },
    { id: 'm_level10',   name: 'Treinamento Pesado',     desc: 'Leve um sticker ao nível 10.',            stat: 'maxLevel',    goal: 10, reward: { coins: 300 } },
    { id: 'm_level20',   name: 'Veterano',               desc: 'Leve um sticker ao nível 20.',            stat: 'maxLevel',    goal: 20, reward: { coins: 600, fragments: 60 } },
    { id: 'm_element',   name: 'Coleção Elemental',      desc: 'Complete todos os stickers de um elemento.', stat: 'elementsComplete', goal: 1, reward: { coins: 500, tokens: { premium: 1 } } },
    { id: 'm_collect15', name: 'Álbum em Progresso',     desc: 'Tenha 15 stickers diferentes.',           stat: 'uniqueOwned', goal: 15, reward: { coins: 400, fragments: 40 } },
    { id: 'm_collect30', name: 'Álbum Quase Cheio',      desc: 'Tenha 30 stickers diferentes.',           stat: 'uniqueOwned', goal: 30, reward: { coins: 1000, essence: 2 } },
    { id: 'm_boss1',     name: 'Caçador de Chefes',      desc: 'Derrote um chefe.',                       stat: 'bossKinds',   goal: 1,  reward: { coins: 500, fragments: 50 } },
    { id: 'm_boss4',     name: 'Lenda Viva',             desc: 'Derrote os 4 chefes do Ato I.',                    stat: 'bossKinds',   goal: 4,  reward: { coins: 2000, essence: 3 } },
    { id: 'm_adv20',     name: 'Estrategista Elemental', desc: 'Acerte 20 golpes com vantagem elemental.', stat: 'advantageHits', goal: 20, reward: { coins: 300, fragments: 30 } },
    { id: 'm_skill30',   name: 'Poder Liberado',         desc: 'Use 30 habilidades especiais.',           stat: 'skillsUsed',  goal: 30, reward: { coins: 300, tokens: { basic: 1 } } },
    // Ato II e pós-jogo
    { id: 'm_act2',      name: 'O Segundo Despertar',    desc: 'Vença a fase 25 (Ato II).',               stat: 'cleared',     goal: 25, reward: { coins: 1500, essence: 2 } },
    { id: 'm_omega',     name: 'Fim do Devorador',       desc: 'Vença a fase 40 e derrote Ômega.',         stat: 'cleared',     goal: 40, reward: { coins: 5000, essence: 5, tokens: { premium: 2 } } },
    { id: 'm_boss8',     name: 'Caçador Supremo',        desc: 'Derrote os 8 chefes.',                    stat: 'bossKinds',   goal: 8,  reward: { coins: 4000, essence: 4 } },
    { id: 'm_level30',   name: 'Mestre Treinador',       desc: 'Leve um sticker ao nível 30.',            stat: 'maxLevel',    goal: 30, reward: { coins: 1000, essence: 1 } },
    { id: 'm_level50',   name: 'Lenda Viva dos Stickers',desc: 'Leve um sticker ao nível 50.',            stat: 'maxLevel',    goal: 50, reward: { coins: 3000, essence: 3 } },
    { id: 'm_star5',     name: 'Forma Suprema',          desc: 'Evolua um sticker até 5 estrelas.',       stat: 'maxStars',    goal: 5,  reward: { coins: 2500, tokens: { premium: 2 } } },
    { id: 'm_collect45', name: 'Álbum Gigante',          desc: 'Tenha 45 stickers diferentes.',           stat: 'uniqueOwned', goal: 45, reward: { coins: 2000, essence: 2 } },
    { id: 'm_collect60', name: 'Álbum Completo!',        desc: 'Tenha todos os 60 stickers.',             stat: 'uniqueOwned', goal: 60, reward: { coins: 10000, essence: 10 } },
    { id: 'm_tower10',   name: 'Escalador',              desc: 'Alcance o andar 10 da Torre Infinita.',   stat: 'towerBest',   goal: 10, reward: { coins: 800, fragments: 80 } },
    { id: 'm_tower30',   name: 'Acima das Nuvens',       desc: 'Alcance o andar 30 da Torre Infinita.',   stat: 'towerBest',   goal: 30, reward: { coins: 2500, essence: 3 } },
    { id: 'm_tower60',   name: 'Rumo ao Infinito',       desc: 'Alcance o andar 60 da Torre Infinita.',   stat: 'towerBest',   goal: 60, reward: { coins: 6000, essence: 6 } }
  ];

  // Missões diárias: reiniciam quando muda a data local do dispositivo.
  SP.DAILY_MISSIONS = [
    { id: 'd_pack',   name: 'Abra 1 pacote',            counter: 'packs',  goal: 1, reward: { coins: 80 } },
    { id: 'd_win3',   name: 'Vença 3 batalhas',         counter: 'wins',   goal: 3, reward: { coins: 150, fragments: 10 } },
    { id: 'd_skill5', name: 'Use 5 habilidades',        counter: 'skills', goal: 5, reward: { coins: 100 } },
    { id: 'd_train',  name: 'Treine ou evolua 1 sticker', counter: 'upgrades', goal: 1, reward: { coins: 80, fragments: 10 } }
  ];

  /* ---------------------------------------------------------------- TORRE INFINITA
     Andares sem fim. A cada 10 andares há um chefe. Ao perder, você volta
     para o último andar de checkpoint (11, 21, 31...). */
  SP.TOWER = {
    levelFor: floor => 3 + Math.round(floor * 0.95),
    isBoss: floor => floor % 10 === 0,
    checkpoint: floor => Math.floor((floor - 1) / 10) * 10 + 1,
    rewards: floor => ({ coins: 60 + floor * 14, fragments: 6 + Math.floor(floor / 2), xp: 30 + floor * 6 }),
    bossBonus: floor => ({ essence: 1 + Math.floor(floor / 30), tokens: { premium: 1 } })
  };

  SP.bossTierRewards = function (tier) {
    return { coins: 400 + tier * 250, fragments: 40 + tier * 25, essence: 1 + Math.floor(tier / 2) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
