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
        fx: [{ k: 'dmg', p: 1.1 }, { k: 'status', s: 'weaken', t: 2 }, { k: 'status', s: 'taunt', t: 2, to: 'self' }, { k: 'shield', pct: 0.3, to: 'self' }] } }
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
      ] }
  ];
  SP.BOSS = {};
  SP.BOSSES.forEach(b => { SP.BOSS[b.id] = b; b.reward = SP.STICKERS.find(s => s.bossOnly === b.id).id; });

  /* ---------------------------------------------------------------- FASES (CAMPANHA) */
  SP.REGIONS = [
    { name: 'Vale das Faíscas',   stages: [1, 5],   bg: ['#3b1d0f', '#a33a12'] },
    { name: 'Abismo Estelar',     stages: [6, 10],  bg: ['#120b2e', '#3a1d7a'] },
    { name: 'Cidadela das Horas', stages: [11, 15], bg: ['#062a2a', '#127a6f'] },
    { name: 'Terra do Eclipse',   stages: [16, 20], bg: ['#0e0718', '#43125c'] }
  ];
  SP.STAGE_COUNT = 20;
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
    19: ['inferno_rex', 'serafim_aurora', 'samurai_ferro']
  };

  SP.stageInfo = function (n) {
    const boss = SP.BOSSES.find(b => b.stage === n) || null;
    const level = Math.max(1, Math.min(30, Math.round(1 + (n - 1) * 1.45)));
    const stars = level > 20 ? 3 : level > 10 ? 2 : 1;
    const enemyLevel = Math.max(1, level - (n <= 3 ? 1 : n <= 10 ? 2 : n <= 15 ? 3 : 5));
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
    maxStars: 3,
    levelCap: stars => stars * 10,
    xpToNext: level => 30 + level * 20,
    levelGrowth: 0.07,          // +7% dos atributos base por nível
    starGrowth: 0.22,           // +22% por estrela acima de 1
    evoCoins: stars => 250 * stars,
    evoFrags: (rarity, stars) => Math.round(SP.RARITY[rarity].evoFrags * (stars === 1 ? 1 : 2.5)),
    trainCost: 80,              // moedas por treino
    trainXp: 60,                // XP por treino
    awakenedPower: 1.25,        // estrela 3: habilidade desperta (+25% de poder, -1 de custo)
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
    { id: 'm_boss4',     name: 'Lenda Viva',             desc: 'Derrote os 4 chefes.',                    stat: 'bossKinds',   goal: 4,  reward: { coins: 2000, essence: 3 } },
    { id: 'm_adv20',     name: 'Estrategista Elemental', desc: 'Acerte 20 golpes com vantagem elemental.', stat: 'advantageHits', goal: 20, reward: { coins: 300, fragments: 30 } },
    { id: 'm_skill30',   name: 'Poder Liberado',         desc: 'Use 30 habilidades especiais.',           stat: 'skillsUsed',  goal: 30, reward: { coins: 300, tokens: { basic: 1 } } }
  ];

  // Missões diárias: reiniciam quando muda a data local do dispositivo.
  SP.DAILY_MISSIONS = [
    { id: 'd_pack',   name: 'Abra 1 pacote',            counter: 'packs',  goal: 1, reward: { coins: 80 } },
    { id: 'd_win3',   name: 'Vença 3 batalhas',         counter: 'wins',   goal: 3, reward: { coins: 150, fragments: 10 } },
    { id: 'd_skill5', name: 'Use 5 habilidades',        counter: 'skills', goal: 5, reward: { coins: 100 } },
    { id: 'd_train',  name: 'Treine ou evolua 1 sticker', counter: 'upgrades', goal: 1, reward: { coins: 80, fragments: 10 } }
  ];

  SP.bossTierRewards = function (tier) {
    return { coins: 400 + tier * 250, fragments: 40 + tier * 25, essence: 1 + Math.floor(tier / 2) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
