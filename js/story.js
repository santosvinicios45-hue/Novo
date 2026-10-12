// =====================================================================
//  story.js — capítulos, diálogos, missões
//  Baseado em "V — O Homem Que Acordou Grande Demais"
// =====================================================================
'use strict';

// ---------------------------------------------------------------- atalhos de roteiro
const say = (who, text, o) => UI.say(who, text, o);
const think = (text, o) => UI.say('V', text, Object.assign({ thought: true }, o));
const narr = (lines, o) => UI.narrate(lines, o);
const choose = (opts, o) => UI.choose(opts, o);
const npc = id => G.entities.find(e => e.id === id);
const item = id => G.entities.find(e => e.id === id);
const addNPC = o => { const n = new NPC(o); G.entities.push(n); return n; };
const addItem = o => { const n = new Item(o); G.entities.push(n); return n; };
const shake = n => { G.cam.shake = n; };
const glow = (id, v) => { const p = World.prop(id); if (p) p.glow = v; };
const flag = (k, v) => { if (v === undefined) return !!G.flags[k]; G.flags[k] = v; };

async function walkV(x, y, speed = 1) {
  const p = G.player;
  await Wait.until(() => {
    const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy);
    if (d < 2) { p.scripted = null; return true; }
    p.scripted = { ax: dx / d * speed, ay: dy / d * speed };
    return false;
  });
  p.scripted = null;
}
function faceV(d) { G.player.dir = d; }
async function fadeOut(t = 0.5, color = '#000') { G.fadeColor = color; G.fadeTarget = 1; G.fadeSpeed = 1 / t; await Wait.until(() => G.fade >= 0.999); }
async function fadeIn(t = 0.5) { G.fadeTarget = 0; G.fadeSpeed = 1 / t; await Wait.until(() => G.fade <= 0.001); }
function floatText(x, y, text, life = 2, col, size) { (G.floatText = G.floatText || []).push({ x, y, text, life, col, size }); }

// ---------------------------------------------------------------- caderno (anotações do V)
const NOTEBOOK = {
  dia1: { t: 'Coisas que eu consigo fazer (dia 1)', x: 'copo (parar / desfazer / subir e descer)\ncolher (entortar, desentortar)\ncontrole remoto (aparece do outro lado SEM PASSAR PELO MEIO)\nluz do abajur (muda de cor. mesmo desligado.)\nlaranja (perfeita de um jeito levemente errado)\n\ne se não for só copo?' },
  nunca: { t: 'Dia 2, manhã', x: 'Parede transparente.\nNÃO FAZER ISSO NUNCA MAIS.\n(sublinhado duas vezes)' },
  avo: { t: 'Dia 3', x: 'Eu quase apaguei a minha vó.\nPor causa de uma cicatriz.\n\nNada acontece sozinho. A realidade é feita de uma linha só.' },
  regras: { t: 'Regras', x: '1. Nada que apareça no jornal.\n2. Não olhar dentro da casa dos outros.\n3. Não mexer em evento. Em pessoa, muito menos.\n(a regra 3 está riscada)' },
  gustavo: { t: 'Página 37 (letra pequena)', x: 'se eu fizer isso ele não vai saber que eu fiz. e ele vai me agradecer. e eu vou ter que aceitar o agradecimento.' },
  // páginas perdidas (colecionáveis)
  p1: { page: true, t: 'Página solta — sobre a Van', x: 'Faróis: 1 = sim, 2 = não.\nRádio = humor. Limpador = ironia (ela me acha burro).\nBuzina = alarme.\nMotor desligado = ela não aprova.' },
  p2: { page: true, t: 'Página solta — o vizinho', x: 'Sete anos. Onze da noite. Alguma coisa sendo arrastada no andar de cima.\nUm dia eu vou descobrir o que é.\n(Não com a parede transparente.)' },
  p3: { page: true, t: 'Página solta — laranja', x: 'De onde ela veio, exatamente?\nSe eu comer, o que é que eu estou comendo?\n(comi. era boa. era laranja demais.)' },
  p4: { page: true, t: 'Página solta — a rua', x: 'Uma moto de entrega subindo na calçada.\nUma senhora conferindo se trouxe a chave.\nUm casal discutindo em volume moderado.\nOito bilhões de terças-feiras.' },
  p5: { page: true, t: 'Página solta — sábado', x: 'Achocolatado, seis e meia da manhã, TV baixinha.\nA coisa mais bonita do mundo é ter para onde ir com quem você gosta.' },
  p6: { page: true, t: 'Página solta — o sofá', x: 'É o sofá mais confortável de todos os universos que existem.\n(verificado.)' },
  p7: { page: true, t: 'Página solta — canal de 1962', x: 'Regra: não assistir a TV de outras dimensões sozinho de madrugada.\nEu não vou escrever sobre aquela noite.' },
  p8: { page: true, t: 'Página solta — o Téo', x: 'Áudio de cinco segundos, 23h12, sem contexto.\nUm trechinho de violão.\nEle nunca mais falou no assunto.\nEu guardei.' },
};
function note(k, silent) { if (G.flags['nb_' + k]) return; G.flags['nb_' + k] = true; if (!silent) UI.toast('Caderno', NOTEBOOK[k].t, 'note'); }

// ---------------------------------------------------------------- missões
const Q = {
  add(id, title, desc, main = false) {
    if (G.quests[id]) return;
    G.quests[id] = { id, title, desc, main, done: false };
    UI.toast(main ? 'Missão' : 'Missão secundária', title, main ? 'quest' : 'side');
    Audio2.sfx('quest');
  },
  upd(id, desc) { if (G.quests[id]) G.quests[id].desc = desc; },
  done(id, doneText) {
    const q = G.quests[id]; if (!q || q.done) return;
    q.done = true; if (doneText) q.doneText = doneText;
    if (!q.main) G.stats.sideDone++;
    UI.toast(q.main ? 'Concluída' : 'Secundária concluída', q.title, 'done');
    Audio2.sfx('questDone');
    Save.write('auto');
  },
  is(id) { return !!(G.quests[id] && G.quests[id].done); },
  has(id) { return !!G.quests[id]; },
};

const ACT_LABELS = {
  pia: 'Pia', geladeira: 'Abrir a geladeira', fogao: 'Fogão', mesa: 'Mesa (notebook e caderno)', estante: 'Estante', tv: 'Televisão', sofa: 'Sofá', abajur: 'Abajur',
  janela: 'Janela', janelaQuarto: 'Janela do quarto', vassoura: 'Vassoura', cama: 'Cama', sacada: 'Sacada', portaBanheiro: 'Porta do banheiro', portaVolta: 'Porta (voltar ao apartamento)',
  janelaMansao: 'Janela', sofaLux: 'Sofá', cozinhaMansao: 'Bancada da cozinha', camaLux: 'Cama', tvMulti: 'TV de outras dimensões', escada: 'Escada', piano: 'Piano', arcade: 'Fliperama',
  garagemChao: 'Deitar no chão da garagem', bancoV: 'Sentar no banco', fonte: 'Fonte', banca: 'Banca de jornal', cartaz: 'Cartaz', maquina: 'Máquina de bebidas', placa: 'Placa da porta',
  maca: 'A maca', saidaHosp: 'Sair', caixao: 'O caixão', cafe: 'Garrafão de café', portaVelorio: 'Porta', cova: 'A cova', arvoreV: 'Encostar na árvore', voar: 'Tentar voar', semaforoFechar: 'Fechar o semáforo',
};
// =====================================================================
const Story = {
  handlers: {}, mapSetup: {}, acts: {}, traffic: null, hintText: '',

  cut(fn) {
    return (async () => {
      G.cutscene++;
      try { await fn(); } catch (e) { console.error(e); }
      finally { G.cutscene = Math.max(0, G.cutscene - 1); }
    })();
  },
  run(k) {
    if (!k) return;
    if (typeof k === 'function') return this.cut(k);
    if (this.acts[k]) return this.cut(() => this.acts[k]());
  },
  on(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); },
  off(ev) { delete this.handlers[ev]; },
  emit(ev, data) {
    const hs = this.handlers[ev]; if (!hs) return false;
    let handled = false;
    for (const h of [...hs]) if (h(data)) handled = true;
    return handled;
  },
  obj(text, hint) { UI.setObjective(text); this.hintText = hint || ''; },

  async goto(map, spawn, opts = {}) {
    if (this._going) return; this._going = true;
    G.cutscene++;
    try {
      Audio2.sfx('door');
      await fadeOut(0.35);
      World.load(map, spawn);
      if (opts.after) await opts.after();
      await fadeIn(0.4);
    } finally { G.cutscene--; this._going = false; }
  },

  // ---------------------------------------------------------------- interação (E)
  interact() {
    const p = G.player;
    const [fx, fy] = p.facingPoint(10);
    const t = this.target();
    if (!t) return false;
    if (t.kind === 'npc') { this.run(() => this.talk(t.o)); return true; }
    if (t.kind === 'item') { this.run(() => this.useItem(t.o)); return true; }
    if (t.kind === 'prop') { this.run(t.o.act); return true; }
    return false;
  },
  target() {
    const p = G.player;
    const [fx, fy] = p.facingPoint(11);
    let best = null, bd = 1e9;
    for (const e of G.entities) {
      if (e === p || e.hidden) continue;
      if ((e instanceof NPC || e instanceof VanEnt || e instanceof Dog) && (e.talk || e instanceof VanEnt)) {
        const d = U.dist(fx, fy, e.x, e.y - 6);
        const r = e instanceof VanEnt ? 36 : 16;
        if (d < r && d < bd) { bd = d; best = { kind: 'npc', o: e }; }
      }
      if (e instanceof Item && e.useLabel && !p.held) {
        const d = U.dist(fx, fy, e.x, e.y - e.z);
        if (d < 14 && d < bd) { bd = d; best = { kind: 'item', o: e }; }
      }
    }
    if (best) return best;
    for (const pr of World.props) {
      if (!pr.act || pr.hidden || !this.acts[pr.act]) continue;
      const r = pr.solidBox ? { x: pr.solidBox.x - 6, y: pr.solidBox.y - 8, w: pr.solidBox.w + 12, h: pr.solidBox.h + 14 } : { x: pr.x - 4, y: pr.y - 4, w: pr.w + 8, h: pr.h + 10 };
      if (pr.wallMounted) r.h += 18;
      if (fx > r.x && fx < r.x + r.w && fy > r.y && fy < r.y + r.h) {
        const d = U.dist(fx, fy, pr.x + pr.w / 2, pr.y + pr.h / 2);
        if (d < bd) { bd = d; best = { kind: 'prop', o: pr }; }
      }
    }
    return best;
  },
  promptText() {
    if (G.cutscene || UI.blocking()) return '';
    const t = this.target(); if (!t) return '';
    const o = t.o;
    const lab = o.useLabel || o.label2 || (t.kind === 'npc' ? (o.name ? 'Falar com ' + o.name : 'Falar') : (o.actLabel || ACT_LABELS[o.act] || 'Examinar'));
    return `<b>E</b> ${typeof lab === 'function' ? lab() : lab}`;
  },
  async talk(n) {
    if (n instanceof VanEnt) return this.vanTalk();
    if (n.talk) return n.talk(n);
  },
  async useItem(it) { if (it.use) return it.use(it); },

  // ---------------------------------------------------------------- a Van (B)
  async callVan() {
    if (!G.powers.van) return;
    const van = G.entities.find(e => e instanceof VanEnt);
    if (van && !van.hidden) { van.blink(1); }
    Audio2.sfx('radio');
    const h = this.hint();
    await this.cut(async () => {
      await say('Radio', h.radio);
      if (h.text) await say('Van', h.text);
    });
  },
  hint() {
    const songs = ['uma música de estrada antiga, com muito eco e pouca pressa', 'uma coisa lenta, sem letra', 'uma música alegre, dessas de janela aberta', 'um samba velho que a sua avó cantava', 'um rock de posto de gasolina às três da manhã'];
    return { radio: `[O rádio liga sozinho. Toca ${U.pick(songs)}.]`, text: this.hintText ? `[Você entende o que ela quer dizer: ${this.hintText}]` : '[Um farol. Ela só queria saber se você estava bem.]' };
  },
  async vanTalk() {
    const van = G.entities.find(e => e instanceof VanEnt);
    if (this.vanTalkOverride) return this.vanTalkOverride();
    van.blink(1); Audio2.sfx('lights');
    const i = await choose(['Tá tudo bem?', 'Me dá uma dica.', 'Toca alguma coisa.', 'Nada. Só queria companhia.'], { prompt: 'A Van liga os faróis quando você chega perto.' });
    if (i === 0) { van.blink(1); await say('Van', '[Um farol.]'); await say('V', '— Mentira. Você tá preocupada.'); van.wipe(1.2); await say('Van', '[O limpador de para-brisa passa uma vez. Devagar. Quase gentil.]'); }
    if (i === 1) { await this.callVan(); }
    if (i === 2) { van.radio = true; Audio2.playSong('van'); await say('Radio', '[Ela encontra a música exata pro que você está sentindo antes de você saber o que está sentindo.]'); setTimeout(() => { if (G.map) { Audio2.playSong(G.map.music); van.radio = false; } }, 40000); }
    if (i === 3) { van.engine = true; await say('Van', '[O motor ronrona baixinho. Ela fica quente, e ligada, e ali.]'); van.engine = false; }
  },

  // ---------------------------------------------------------------- semáforo
  updateTraffic(dt) {
    const s = this.traffic; if (!s || G.frozen > 0) return;
    s.t -= dt;
    if (s.t <= 0) {
      if (s.locked) { s.t = 1; return; }
      s.state = s.state === 'green' ? 'yellow' : s.state === 'yellow' ? 'red' : 'green';
      s.t = s.state === 'green' ? 11 : s.state === 'yellow' ? 2 : 7;
    }
    for (const id of ['sem1', 'sem2']) { const p = World.prop(id); if (p) p.st.state = s.state; }
  },

  update(dt) {
    if (G.map && G.map.id === 'rua') this.updateTraffic(dt);
    if (G.floatText) { for (const f of G.floatText) { f.life -= dt; f.y -= dt * 4; } G.floatText = G.floatText.filter(f => f.life > 0); }
    if (this.tick) this.tick(dt);
  },

  // ---------------------------------------------------------------- capítulos
  chapters: {},
  async startChapter(n, opts = {}) {
    G.chapter = n;
    this.handlers = {}; this.tick = null; this.vanTalkOverride = null; this.traffic = null;
    Wait.clear(); G.cutscene = 0; G.frozen = 0; G.perceive = 0; Powers.createMenu = false; UI.showCreate(false);
    G.player = G.player || new Player(0, 0);
    G.player.setOutfit('V'); G.player.held = null; G.player.scripted = null; G.player.sitting = false; G.player.hidden = false;
    G.flags.velorio = false;
    UI.setObjective(''); this.hintText = ''; G.cam.focus = null; G.slowmo = 0; G.fx = {};
    // poderes garantidos por capítulo
    const P = { 1: [], 2: ['tk', 'undo', 'blink', 'create'], 3: ['tk', 'undo', 'blink', 'create', 'perceive'], 4: ['tk', 'undo', 'blink', 'create', 'perceive', 'van'] };
    const want = P[Math.min(n, 4)] || [];
    for (const k of want) G.powers[k] = true;
    if (n >= 2) G.flags.cria_laranja = true;
    if (n >= 8) G.powers.freeze = true;
    UI.refreshTouch();
    Save.write('start');
    G.state = 'play';
    UI.hud(true);
    const fn = this.chapters[n];
    if (fn) this.cut(fn);
  },
  nextChapter() { this.startChapter(G.chapter + 1); },
};

// =====================================================================
//  POPULAÇÃO DA RUA (cenário vivo)
// =====================================================================
function populateRua(mode) {
  const night = mode === 'night';
  G.map.dark = night ? 0.78 : (mode === 'noon' ? 0 : 0.05);
  Story.traffic = { state: 'green', t: 6, x0: T(30), x1: T(34) };
  // carros
  for (let i = 0; i < (night ? 3 : 5); i++) G.entities.push(new Car({ x: U.rand(0, T(64)), y: T(12) + 10, dirx: 1 }));
  for (let i = 0; i < (night ? 3 : 5); i++) G.entities.push(new Car({ x: U.rand(0, T(64)), y: T(15) + 4, dirx: -1 }));
  // remove carros sobrepostos
  const cars = G.entities.filter(e => e instanceof Car);
  for (const c of cars) for (const d of cars) if (c !== d && c.y === d.y && Math.abs(c.x - d.x) < 50 && !d.dead && !c.dead) d.x += 90;
  if (night) {
    addNPC({ id: 'zeca', cast: 'Zeca', x: T(33) + 8, y: T(8) + 2, dir: 'down', label: 'Zeca', name: 'Zeca', talk: async () => { await say('Zeca', U.pick(['— Mais uma, V? Hoje o Téo pagou a primeira, viu. Milagre.', '— Fecho meia-noite. Meia-noite e meia. Uma. Depende do Gustavo.'])); } });
    return;
  }
  // pombos
  for (let i = 0; i < 7; i++) G.entities.push(new Pigeon(T(37) + U.rand(-20, 30), T(26) + U.rand(-6, 10)));
  for (let i = 0; i < 5; i++) G.entities.push(new Pigeon(T(28) + U.rand(-20, 40), T(25) + U.rand(0, 14)));
  // pedestres com rotina
  addNPC({ id: 'terno', cast: 'Pedestre1', x: T(2), y: T(9) + 4, speed: 58, path: [[T(62), T(9) + 4, 0], [T(62), T(9) + 6, 3], [T(2), T(9) + 6, 0], [T(2), T(9) + 4, 3]], perceive: 'Atrasado pra uma reunião que não importa.\nPrecisa de um dia inteiro a mais.', name: 'Homem de terno', talk: async () => { await say('Pedestre', '— Agora não, agora não, tô atrasado! — ele diz, sem nem olhar pra você.'); } });
  addNPC({ id: 'p2', cast: 'Pedestre2', x: T(50), y: T(17) + 6, speed: 26, path: [[T(4), T(17) + 6, 1], [T(50), T(17) + 6, 2]], perceive: 'Esqueceu de ligar pra mãe ontem.\nVai ligar hoje.', name: 'Moça', talk: async () => { await say('Pedestre', '— Bom dia! Que calor, né? — ela sorri e segue.', { name: 'Moça' }); } });
  addNPC({ id: 'p3', cast: 'Pedestre3', x: T(12), y: T(23) + 6, speed: 30, path: [[T(58), T(23) + 6, 2], [T(58), T(23) + 8, 0], [T(12), T(23) + 8, 3]], perceive: 'Ensaiando um pedido de desculpas.', name: 'Rapaz', talk: async () => { await say('Pedestre', '— ...desculpa, foi mal, eu tava distraído. — Ele nem esbarrou em você.', { name: 'Rapaz' }); } });
  addNPC({ id: 'teen1', cast: 'Adolescente', x: T(40) + 8, y: T(20) + 4, dir: 'down', sitting: true, lookAtPlayer: false, perceive: 'Rindo de um vídeo de gato.\nO dia está perfeito.', name: 'Adolescente', talk: async () => { await say('Moca', '— KKKKKK olha isso — ela mostra o celular pra amiga, não pra você.'); } });
  addNPC({ id: 'teen2', cast: 'Adolescente2', x: T(41) + 12, y: T(20) + 4, dir: 'down', sitting: true, lookAtPlayer: false, perceive: 'Fingindo que não gosta do menino da sala.', name: 'Adolescente', talk: async () => { await say('Moca', '— Não, para, é muito ridículo — e ri mais ainda.', { name: 'Adolescente' }); } });
  addNPC({ id: 'padeiro', cast: 'Padeiro', x: T(12) + 8, y: T(8) + 4, dir: 'down', label: 'Seu Manoel', name: 'Seu Manoel', perceive: 'Acorda às quatro da manhã há trinta anos.\nAinda gosta.', talk: () => Story.acts.padeiro() });
  // vizinho lavando carro
  addNPC({ id: 'vizinho', cast: 'Vizinho', x: T(39) + 12, y: T(9) + 4, dir: 'left', lookAtPlayer: true, name: 'Vizinho', perceive: 'Lava o carro no mesmo horário há nove anos.\nÉ o único momento em que ninguém fala com ele.', talk: async () => { await say('Vizinho', U.pick(['— Bom dia. — Ele continua esfregando o mesmo pedaço do capô.', '— Vai chover? Disseram que vai chover. Lavei à toa então.'])); }, tick(dt) { if (Math.random() < 0.1) FX.add({ x: this.x - 8 + U.rand(-3, 3), y: this.y - 12, vx: U.rand(-10, -2), vy: U.rand(-10, 5), life: 0.5, color: '#cfe8f8', g: 60 }); } });
  // cachorro do quinto andar latindo pra motoqueiro
  const dog5 = new Dog({ id: 'dog5', x: T(56), y: T(9) + 6, sit: true, barkAt: true, wander: true, homeX: T(56), dirx: -1 });
  G.entities.push(dog5);
  // moto de entrega passando
  const moto = new Custom({ id: 'motoAmb', x: -40, y: T(11) + 12, ignoreFreeze: false, f: 0,
    tick(dt) { this.x += 85 * dt; this.f += dt * 10; if (this.x > T(64) + 40) this.x = -400; if (Math.abs(this.x - T(56)) < 20 && Math.random() < 0.08) { Audio2.sfx('bark'); dog5.emote = '!'; dog5.emoteT = 0.5; } },
    render(c) { c.drawImage(Beasts.moto(Math.floor(this.f)), Math.round(this.x - 13), Math.round(this.y - 20)); const s = Sprites.human('Entregador', CAST.Entregador).right[1]; c.drawImage(s, 0, 0, 22, 26, Math.round(this.x - 9), Math.round(this.y - 33), 22, 26); } });
  G.entities.push(moto);
}

// páginas soltas pelo mundo
const PAGE_SPOTS = {
  apto: [['p1', T(19) + 8, T(6) + 8], ['p3', T(2) + 8, T(15) + 4]],
  rua: [['p2', T(52), T(1) + 10], ['p4', T(61), T(20)], ['p5', T(1) + 8, T(26)]],
  mansao: [['p6', T(4), T(13)], ['p7', T(33), T(19)]],
  cemiterio: [],
};
function spawnPages(map) {
  if (G.chapter < 2) return;
  for (const [k, x, y] of (PAGE_SPOTS[map] || [])) {
    if (G.flags['nb_' + k]) continue;
    if (k === 'p8' && G.chapter < 8) continue;
    G.entities.push(new Pickup({ x, y, type: 'pagina', onPick: () => { note(k); Audio2.sfx('create'); checkPages(); } }));
  }
}
function checkPages() {
  const n = Object.keys(NOTEBOOK).filter(k => NOTEBOOK[k].page && G.flags['nb_' + k]).length;
  if (!Q.has('paginas')) Q.add('paginas', 'Páginas soltas do caderno', 'Folhas arrancadas do caderno do V, espalhadas pelos lugares por onde ele passou.');
  Q.upd('paginas', `Folhas arrancadas do caderno do V. Encontradas: ${n}/8. (Diário → Caderno)`);
  if (n >= 8) Q.done('paginas', 'Todas as páginas de volta no caderno.');
}

// =====================================================================
//  SETUP POR MAPA
// =====================================================================
Story.mapSetup.apto = () => {
  const ch = G.chapter;
  G.map.dark = 0;
  const lamp = World.prop('abajur');
  if (G.flags.abajurCor) lamp.st.color = G.flags.abajurCor;
  // Van na sala (cap. 3 em diante, quando não está "guardada")
  if (ch >= 3 && !G.flags.vanGuardada) {
    G.entities.push(new VanEnt({ id: 'van', x: T(7), y: T(6) + 10, cold: !!G.flags.vanFria }));
  }
  // copo de requeijão na pia
  if (ch >= 2 || G.flags.copoNaPia) addItem({ id: 'copo', type: 'copo', x: T(3) + 8, y: T(2) + 10, z: 8, fragile: true, suspended: true });
  if (ch === 1 && G.flags.copoNaPia && !G.flags.colherOk) addItem({ id: 'colher', type: 'colher', x: T(2) + 10, y: T(6) + 4, z: 10, suspended: true });
  if (ch === 1 && G.flags.copoNaPia && !G.flags.controleOk) addItem({ id: 'controle', type: 'controle', x: T(10) + 8, y: T(9) + 6, z: 6, suspended: true, tk: false, useLabel: 'Pegar o controle remoto', use: () => Story.acts.controle() });
  spawnPages('apto');
  if (ch >= 8) spawnPages('apto');
};
Story.mapSetup.mansao = () => {
  const mode = G.chapter === 10 ? 'white' : 'avo';
  for (const id of ['jan1', 'jan2', 'jan3']) World.prop(id).st.mode = mode;
  if (G.chapter === 10) { World.prop('tvMulti').st.channel = 'static'; G.map.dark = 0.2; }
  if (G.flags.garagem && G.chapter >= 5) {
    const van = new VanEnt({ id: 'van', x: T(8), y: T(21), radio: G.chapter === 5 });
    if (G.chapter === 10) van.engine = false;
    G.entities.push(van);
  }
  if (G.chapter >= 5) spawnPages('mansao');
};
Story.mapSetup.rua = () => {
  const mode = G.chapter === 8 && G.flags.noiteBar ? 'night' : (G.chapter === 6 && G.flags.meioDia ? 'noon' : 'day');
  populateRua(mode);
  if (mode !== 'night') spawnPages('rua');
  if (Story.ruaExtra) Story.ruaExtra(mode);
};

// =====================================================================
//  INTERAÇÕES DE CENÁRIO (dependem do capítulo)
// =====================================================================
const A = Story.acts;

A.portaTrancada = async () => {
  if (G.chapter === 1) await think('Hoje eu não saio. Não até entender o que tá acontecendo.');
  else if (G.chapter === 2) await think('Avisei no trabalho que ia tirar a semana. A comida tá comprada. Eu não preciso sair.');
  else if (G.chapter === 3 || G.chapter === 4) await think('Ainda não. Lá fora tem oito bilhões de pessoas.');
  else await think('Não agora.');
  G.player.y -= 6;
};
A.geladeira = async () => {
  if (G.chapter === 1 && G.flags.copoNaPia && !G.flags.geladeira) {
    G.flags.geladeira = true;
    await say('Narr', 'Abrir e fechar a geladeira era a coisa mais normal que existia, e ele precisava desesperadamente de uma coisa normal.');
    await say('Narr', 'Dentro: metade de uma cebola, três iogurtes vencidos e uma marmita que a mãe dele tinha mandado no domingo.');
    await say('V', '— Cadê o manual. Sério. Cadê o manual.');
    Story.chapters.c1_testes();
    return;
  }
  if (G.chapter === 3 && !G.flags.achocolatado) {
    G.flags.achocolatado = true;
    await say('Narr', 'Leite, achocolatado, a colher batendo no copo de requeijão. A textura exata de um sábado de quando ele tinha oito anos.');
    Story.obj('Sente no sofá e ligue a TV (desenho de sábado)', 'sofá, TV, sábado. Você sabe o que fazer.');
    return;
  }
  await say('Narr', U.pick(['Metade de uma cebola. Três iogurtes vencidos. A marmita da mãe.', 'A geladeira zumbe. Ela sempre zumbiu assim? Agora você repara em tudo.', 'Você abre. Fecha. Era só pra fazer uma coisa normal.']));
};
A.pia = async () => {
  if (G.chapter === 2 && G.flags.d2 && !G.flags.agua) {
    G.flags.agua = true;
    await think('Água... com gosto de coca-cola?');
    G.player.glowT = 1; FX.ember(G.player.x, G.player.y - 14, 10); Audio2.sfx('create');
    await say('Narr', 'Funcionou. Ele tomou água com sabor de coca-cola durante quarenta minutos, achando isso a coisa mais engraçada do mundo.');
    await say('Narr', 'Até perceber que estava se divertindo com um poder que provavelmente conseguia curar doenças. E o riso morreu no meio.');
    Story.emit('d2task');
    return;
  }
  await say('Narr', U.pick(['A pia. O copo de requeijão. O lugar onde tudo começou.', 'Uma torneira pingando. Você poderia fazer ela parar de pingar. Você poderia fazer muita coisa.']));
};
A.fogao = async () => { await say('Narr', 'O fogão de quatro bocas, das quais funcionam três.'); };
A.mesa = async () => {
  if (G.chapter === 1 && G.flags.testes && !G.flags.chefe) {
    G.flags.chefe = true;
    await say('Celular', 'Para: Chefe — "Bom dia. Acordei passando mal, não vou conseguir trabalhar hoje."');
    await think('Tecnicamente verdade.');
    Story.emit('c1check');
    return;
  }
  await say('Narr', U.pick(['O notebook do trabalho. Quarenta e sete e-mails não lidos. Nenhum importante.', 'O caderno está aberto. A letra está tremida.']));
};
A.estante = async () => { await say('Narr', 'Uma estante com mais videogame do que livro, o que ele achava vergonhoso e ninguém mais achava.'); if (G.chapter >= 2) note('regras'); };
A.tv = async () => {
  const tv = World.prop('tv');
  if (G.chapter === 3 && G.flags.achocolatado && !G.flags.tvSabado) { G.flags.tvSabado = true; tv.st.on = true; tv.st.channel = 'cartoon'; await say('Narr', 'Passava desenho. O desenho. Quatro amigos, um cachorro medroso, e uma van pintada com flores.'); Story.obj('Sente no sofá', 'senta. Bebe o achocolatado.'); return; }
  if (G.chapter === 5 && !G.flags.noticias) return Story.chapters.c5_noticias();
  tv.st.on = !tv.st.on; tv.st.channel = U.pick(['news', 'cartoon', 'game']);
  Audio2.sfx('blip');
};
A.sofa = async () => {
  if (G.chapter === 3 && G.flags.tvSabado && !G.flags.vanCriada) return Story.chapters.c3_van();
  if (G.chapter === 2 && G.flags.d3 && !G.flags.cicatriz) return Story.chapters.c2_cicatriz();
  await say('Narr', 'O sofá de dois lugares, comprado usado. Range do lado direito.');
  Audio2.tone(180, 0.2, 'sawtooth', 0.03);
};
A.abajur = async () => {
  if (G.chapter === 1 && G.flags.testes && !G.flags.abajurOk) {
    const lamp = World.prop('abajur');
    G.player.glowT = 1.2;
    for (const c of ['#e86a6a', '#6ae8a0', '#6aa8e8']) { lamp.st.color = c; Audio2.sfx('blip'); await wait(0.35); }
    lamp.light = null;
    await say('Narr', 'Fez a luz do abajur mudar de cor.');
    await wait(0.3);
    lamp.st.color = '#c88ae8';
    await say('Narr', 'Fez a luz do abajur mudar de cor sem o abajur estar ligado.');
    lamp.light = { r: 46, a: 0.9, oy: 4 }; G.flags.abajurCor = '#c88ae8';
    G.flags.abajurOk = true; Story.emit('c1check');
    return;
  }
  const lamp = World.prop('abajur');
  if (G.chapter >= 2) { const cs = ['#e8d8b0', '#c88ae8', '#6ae8a0', '#e86a6a', '#6aa8e8']; lamp.st.color = cs[(cs.indexOf(lamp.st.color) + 1) % cs.length]; G.flags.abajurCor = lamp.st.color; Audio2.sfx('blip'); }
  else await say('Narr', 'Um abajur de luz amarelada.');
};
A.janela = async () => {
  if (G.chapter === 1 && G.flags.dia1ok && !G.flags.janela1) return Story.chapters.c1_janela();
  await say('Narr', U.pick(['Lá embaixo, a rua fazendo exatamente o que ruas fazem.', 'Um cachorro puxando uma pessoa. Uma moto de entrega subindo na calçada.', 'Oito bilhões de pessoas fazendo suas terças-feiras.']));
};
A.janelaQuarto = async () => { await say('Narr', 'A janela do quarto dá pro poço de ventilação. Sete anos olhando pra uma parede.'); };
A.vassoura = async () => {
  if (G.chapter === 1 && G.flags.copoQuebrado && !G.flags.querDesfazer) return Story.chapters.c1_vassoura();
  await say('Narr', 'A vassoura, encostada atrás da porta do banheiro, onde ele nunca lembra de guardá-la direito.');
};
A.cama = async () => {
  if (G.chapter === 2 && G.flags.d2done && !G.flags.d3) return Story.chapters.c2_noite();
  if (G.chapter === 2 && G.flags.cicatrizOk && !G.flags.fimc2) return Story.chapters.c2_fim();
  await say('Narr', U.pick(['A cama desarrumada. Ninguém vem visitar o quarto mesmo.', 'Você não está com sono. Você está com outra coisa.']));
};
A.sacada = async () => {
  if (G.chapter === 4 && G.flags.gusChegou && !G.flags.sacada4) return Story.chapters.c4_sacada();
  if (G.chapter === 7 && G.flags.pizza && !G.flags.feito) return Story.chapters.c7_sacada();
  await say('Narr', 'A sacada do tamanho de uma toalha de banho. Espaço pra exatamente duas pessoas, se elas não gostarem muito uma da outra.');
};
A.portaBanheiro = async () => {
  if (G.chapter === 5 && G.flags.noticias && !G.flags.mansaoCriada) return Story.chapters.c5_porta();
  if (G.chapter === 8 && G.flags.barOk && !G.flags.ligacao) { await think('A Mansão. Só um pouco.'); return Story.goto('mansao', 'porta'); }
  if (G.flags.mansaoCriada) {
    const p = G.player;
    await say('Narr', 'Você abre a porta do banheiro com uma certa intenção. Como lembrar de uma palavra.');
    return Story.goto('mansao', 'porta');
  }
  await say('Narr', 'O banheiro. Azulejo branco, rejunte encardido.');
};
A.portaVolta = async () => {
  if (G.flags.mansaoPresa) { await say('Narr', 'A porta não abre. A casa não quer que você vá embora antes de decidir.'); return; }
  return Story.goto('apto', 'banheiro');
};

// ---- Mansão
A.janelaMansao = async () => {
  if (G.chapter === 10) { await say('Narr', 'A janela não mostra nada. Está branca. Não neblina, não escuro: branca, como uma tela sem sinal.'); return; }
  if (G.chapter === 5 && !G.flags.m_janela) { G.flags.m_janela = true; Story.emit('mansaoTask'); }
  await say('Narr', 'O quintal da casa da avó, ampliado até virar campo. Um cachorro que ele teve aos dez anos, e que morreu aos catorze, corre atrás de nada.');
};
A.sofaLux = async () => {
  if (G.chapter === 10 && G.flags.debateOk && !G.flags.seisDaManha) return Story.chapters.c10_sofa();
  if (G.chapter === 5 && !G.flags.m_sofa) { G.flags.m_sofa = true; Story.emit('mansaoTask'); }
  G.player.sitting = true;
  await say('V', '— Esse é o sofá mais confortável de todos os universos que existem.');
  await say('Narr', 'A frase, no caso dele, é literalmente verificável. E ele verificou.');
};
A.cozinhaMansao = async () => {
  if (G.chapter === 10) { await say('Narr', 'Ele pensa em qualquer coisa. Duas vezes. A bancada continua vazia.'); return; }
  const ilha = World.prop('ilha'); ilha.st.food = true;
  Audio2.sfx('create');
  if (G.chapter === 5 && !G.flags.m_comida) { G.flags.m_comida = true; Story.emit('mansaoTask'); await say('Narr', 'Você pensa em comida e existe comida, quente, na bancada. A marmita da mãe, com uma precisão que deixa você desconfortável.'); return; }
  await say('Narr', U.pick(['Algo quente aparece na bancada, com a quantidade exata de sal que você usaria se estivesse com preguiça de temperar.', 'A marmita da mãe. Perfeita. Perfeita demais.']));
};
A.camaLux = async () => {
  if (G.chapter === 5 && G.flags.m_comida && G.flags.m_sofa && G.flags.m_janela && !G.flags.m_dormiu) return Story.chapters.c5_dormir();
  if (G.chapter === 5 && !G.flags.m_dormiu) { await think('Ainda não. Quero ver a casa primeiro.'); return; }
  if (G.chapter === 8 && G.flags.barOk && !G.flags.ligacao) return Story.chapters.c8_ligacao();
  await say('Narr', 'A cama multidimensional: sempre do tamanho que você precisa, sempre na temperatura que a sua pele quer.');
};
A.tvMulti = async () => {
  if (G.chapter === 10) { await say('Narr', 'Só chiado.'); return; }
  const tv = World.prop('tvMulti');
  const i = await choose(['Documentário sobre uma cidade que não existe', 'Noticiário de uma Terra em que algo deu errado em 1962', 'Desligar'], { prompt: 'A TV pega canais de outras dimensões.' });
  if (i === 0) { tv.st.channel = 'other'; await say('Narr', 'Uma narração calma, numa língua que você não conhece mas entende. Ruas que dobram sobre si mesmas.'); }
  if (i === 1) { tv.st.channel = 'news'; await think('Regra: não assistir isso sozinho de madrugada.'); await say('Narr', 'Ele não fala sobre aquela noite.'); tv.st.channel = 'static'; }
  if (i === 2) tv.st.on = false; else tv.st.on = true;
};
A.escada = async () => {
  if (G.chapter === 10) { await fadeOut(0.3); G.player.x = T(11); G.player.y = T(12); await fadeIn(0.3); await say('Narr', 'As escadas, que nunca acabavam no mesmo lugar duas vezes, agora acabam sempre no mesmo lugar: a sala, o sofá, a janela branca.'); return; }
  await fadeOut(0.3);
  const spots = [[T(30), T(6) + 8], [T(28), T(16)], [T(18), T(13)], [T(6), T(13)]];
  const sp = U.pick(spots); G.player.x = sp[0]; G.player.y = sp[1];
  await fadeIn(0.3);
  await say('Narr', 'A escada vai pra cima e nunca acaba no mesmo lugar duas vezes.');
};
A.piano = async () => {
  const notes = [64, 67, 71, 72, 71, 67, 64, 62];
  for (let i = 0; i < notes.length; i++) Audio2.tone(Audio2.mtof(notes[i]), 0.6, 'triangle', 0.1, i * 0.28);
  await say('Narr', 'Você nunca aprendeu piano. Suas mãos sabem mesmo assim.');
};
A.arcade = async () => {
  const i = await choose(['Jogar "Estrada 2" (a sequência que nunca foi feita)', 'Deixa pra lá'], { prompt: 'Um fliperama que roda qualquer jogo. Os que existem, e os que nunca foram lançados.' });
  if (i !== 0) return;
  if (!Q.has('arcade')) Q.add('arcade', 'A sequência que nunca foi feita', 'Termine "Estrada 2" no fliperama da Mansão: chegue a 1000 metros.');
  const score = await Mini.runner();
  if (score >= 1000 && !Q.is('arcade')) { Q.done('arcade', 'Ele chorou no final. O final era ruim. Ele chorou mesmo assim.'); await say('Narr', 'O final era ruim. Ele chorou mesmo assim.'); }
  else if (score < 1000) await think(`${score} metros. De novo.`);
};
A.garagemChao = async () => {
  if (G.chapter === 5 && G.flags.vanEntrou && !G.flags.dormiuPneu) return Story.chapters.c5_pneu();
  await say('Narr', 'Uma garagem inventada. Piso de cimento queimado, luz amarelada de oficina, cheiro absolutamente convincente de óleo.');
};

// ---- Rua
A.bancoV = async () => {
  if (G.chapter === 6 && G.flags.pao && !G.flags.sentou) return Story.chapters.c6_banco();
  G.player.sitting = true; G.player.dir = 'down';
  await say('Narr', 'Um banco de praça. Pessoas fazendo suas terças-feiras.');
};
A.fonte = async () => { await say('Narr', U.pick(['Moedas no fundo da fonte. Pedidos de gente que não tem como realizá-los sozinha.', 'A água sobe, cai, sobe. Se você parasse o tempo agora, ela ficaria pendurada no ar.'])); };
A.banca = async () => { await say('Narr', U.pick(['Manchetes: "Prefeitura promete recapear avenida até o fim do ano."', 'Manchetes: "Frente fria chega no fim de semana."', 'O jornaleiro dorme sentado, com o rádio ligado no futebol.'])); };
A.cartaz = async () => {
  await say('Narr', 'PROCURA-SE: PIPOCA. Vira-lata caramelo, muito medroso, sumiu há 3 dias. Atende pelo nome (às vezes). Falar com o Kauan, prédio 160.');
  if (G.chapter >= 8 && !Q.has('pipoca')) { Q.add('pipoca', 'Pipoca', 'Um cachorro caramelo sumiu há três dias. Talvez dê pra ver onde ele está se você olhar de verdade [X].'); }
};
A.padeiro = async () => {
  if (G.chapter === 6 && !G.flags.pao) {
    if (!G.flags.fila) { await say('Padeiro', '— Bom dia! Ó, tem fila, tá? Só um pouquinho.'); G.flags.fila = true; Story.obj('Entre na fila da padaria (atrás da última pessoa)', 'a fila. Fica atrás da última pessoa. Paciência.'); return; }
    if (!G.flags.vez) { await say('Padeiro', '— Já já, querido. Tô atendendo a dona ali.'); return; }
    await say('Padeiro', '— Bom dia! O de sempre? Faz tempo que não te vejo, hein. Tava viajando?');
    await say('V', '— Mais ou menos. — Ele aponta pros pães. — Quatro, por favor.');
    await say('Padeiro', '— Quentinho, acabou de sair.');
    G.flags.pao = true;
    await say('Narr', 'Ele comprou pão. Isso pareceu uma vitória enorme, e ele teve consciência de que era patético.');
    Q.done('c6pao');
    Story.obj('Sente no banco da praça, em frente', 'o banco da praça. Senta e só olha.');
    Q.add('c6banco', 'O que se faz com isso', 'Sente no banco da praça e observe as pessoas.', true);
    return;
  }
  await say('Padeiro', U.pick(['— Pão quentinho saindo às seis e às quatro!', '— Seu Manoel não esquece freguês, viu.', '— Leva um sonho, V. Por conta da casa. Você tá com uma cara...']));
};

// ---- Hospital / Velório / Cemitério
A.maquina = async () => { await say('Narr', 'Uma máquina de bebida zumbindo. O mundo não parou. Isso ofendeu ele de um jeito quase infantil.'); };
A.placa = async () => {
  if (G.chapter === 9 && !G.flags.entrou) return Story.chapters.c9_porta();
  await say('Narr', 'Uma placa. Ele leu duas vezes sem entender na primeira.');
};
A.maca = async () => { if (G.chapter === 9 && G.flags.entrou && !G.flags.tentou) return Story.chapters.c9_volta(); };
A.saidaHosp = async () => { if (G.chapter === 9 && G.flags.tentou) return Story.chapters.c9_meiofio(); await think('Não. Ainda não.'); G.player.x += 8; };
A.caixao = async () => { if (G.chapter === 9) { await say('Narr', 'Ele está de terno. Com a mesma cara boba de quando alguém contava uma piada ruim e ele não queria rir.'); } };
A.cafe = async () => { await say('Narr', 'Um garrafão de café com copinhos empilhados que alguém reabastece de hora em hora, sem que ninguém veja quem.'); };
A.portaVelorio = async () => { if (G.chapter === 9 && G.flags.portaAbriu) return Story.chapters.c9_vomito(); await think('Eu vou ficar. Até o fim.'); };
A.cova = async () => { if (G.chapter === 10 && G.flags.sozinho && !G.flags.sentiu) return Story.chapters.c10_sentir(); await say('Narr', 'Terra revirada.'); };
A.arvoreV = async () => { if (G.chapter === 10 && G.flags.enterroOk && !G.flags.sozinho) return Story.chapters.c10_esperar(); await say('Narr', 'Uma árvore. Sombra boa.'); };
