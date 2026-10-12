// =====================================================================
//  chapters3.js — ATO II, capítulos 9 a 11
// =====================================================================
'use strict';

// ================================================================ CAP 9 — VELÓRIO
C[9] = async () => {
  World.load('hospital', 'start');
  G.fade = 1; UI.setTime('Hospital · 23:53');
  await UI.chapterCard('Capítulo 9', 'Velório', 'Quatro horas numa sala de flores plásticas.');
  await fadeIn(0.8);
  // enfermeiras conversando sobre escala de plantão
  addNPC({ id: 'enf1', cast: 'Enfermeira', x: T(21) + 4, y: T(4) + 8, dir: 'right', lookAtPlayer: false, name: 'Enfermeira', talk: async () => { await say('Enfermeira', '— ...e aí ela me coloca no domingo de novo. Terceiro domingo seguido. — Ela nem te vê.'); } });
  addNPC({ id: 'enf2', cast: 'Enfermeiro', x: T(22) + 12, y: T(4) + 8, dir: 'left', lookAtPlayer: false, name: 'Enfermeiro', talk: async () => { await say('Enfermeiro', '— Visita só amanhã, senhor. — Ele olha pra você um segundo a mais. — ...O senhor tá bem?'); } });
  Story.tick = dt => { if (Math.random() < 0.002) Audio2.sfx('phone'); };
  await say('Narr', 'A primeira coisa que ninguém conta sobre corredor de hospital de madrugada é que ele é barulhento.');
  await say('Narr', 'Uma máquina de bebida zumbindo, um telefone tocando sem ninguém atender, duas enfermeiras conversando sobre escala de plantão, uma TV passando propaganda de colchão.');
  await say('Narr', 'O mundo não parou. Isso ofendeu ele de um jeito quase infantil.');
  Q.add('sala', 'Uma porta com um número e uma placa', 'Encontre a sala.', true);
  Story.obj('Encontre a sala (a placa no fim do corredor)', 'pensa na direção. A direção está ali.');
  glow('placa', true);
};
C.c9_porta = async () => {
  glow('placa', false);
  await say('Narr', 'Ele ficou uns dois minutos com a mão a três centímetros da maçaneta. Não é hesitação moral. Existe um ponto em que o corpo se recusa.');
  const ok = await Mini.hold('Segure E — convença a própria mão', 3.5);
  if (!ok) { await think('...'); glow('placa', true); return; }
  G.flags.entrou = true;
  await fadeOut(0.4); G.player.x = T(27) + 8; G.player.y = T(10) + 8; G.player.dir = 'down'; await fadeIn(0.6);
  Q.done('sala');
  await say('Narr', 'O Téo estava numa maca, coberto até o peito, e a primeira coisa que V pensou foi que ele estava com uma cara boba.');
  await say('Narr', 'Aquela cara meio de lado que o Téo fazia quando alguém contava uma piada ruim e ele não queria rir.');
  Q.add('volta', 'Volta', 'Ele estava tão certo de que ia funcionar.', true);
  Story.obj('Traga ele de volta (E na maca)', 'não sei. Eu não sei, V.');
  glow('maca', true);
};
C.c9_volta = async () => {
  glow('maca', false);
  await say('Narr', 'Ele estava absolutamente certo de que ia funcionar, porque tudo tinha funcionado até ali.');
  Powers.locked = true;
  const lines = ['Volta.', 'Volta.', 'Volta. Volta.', 'Téo, volta.', 'VOLTA.'];
  for (let i = 0; i < lines.length; i++) {
    UI.hint('Pressione E (ou qualquer poder)', 3);
    await Wait.until(() => Input.hit('act') || Input.hit('tk') || Input.hit('undo') || Input.hit('freeze') || Input.hit('create') || Input.hit('perceive') || Input.hit('blink'));
    Input.consume('act');
    G.player.glowT = 0.5; FX.ember(G.player.x, G.player.y - 14, 6 + i * 4); shake(0.5 + i * 0.5);
    Audio2.sfx('nothing');
    await think(lines[i]);
    await say('Narr', 'Nada.');
  }
  Powers.locked = false;
  await say('Narr', 'A sala continuou exatamente igual, com a luz fria e o zumbido do ar-condicionado, e um homem de vinte e seis anos de pé no meio dela, com a mão estendida, mandando o universo obedecer.');
  await say('Narr', 'E o universo — pela primeira e única vez na vida dele — não obedeceu.', { speed: 28 });
  G.flags.tentou = true; Q.done('volta');
  Story.obj('Saia (ponta esquerda do corredor)', 'sai. Por favor.');
};
C.c9_meiofio = async () => {
  await fadeOut(1);
  await narr(['Ele saiu dali por volta das três da manhã e não lembra de ter atravessado nada.', 'Sentou no meio-fio do estacionamento do hospital, do lado de uma ambulância vazia, e ficou.', 'Não chorou. Ele reparou nisso e achou monstruoso.', 'O lugar do luto estava ocupado por outra coisa. Estava ocupado por raiva.', 'E a raiva não era do motorista, e não era do acaso, e não era de Deus.', 'Era dele.']);
  await think('Pra que serve, então. Eu consigo fazer uma laranja aparecer do nada. Eu consigo entrar na cabeça do meu melhor amigo e mexer nas peças. E o Téo tá deitado numa sala gelada e eu não consigo fazer nada.');
  await say('Narr', 'A Van apareceu no estacionamento umas quatro da manhã. Estacionou do lado dele, com os faróis desligados.');
  await say('V', '— Não funcionou.');
  await say('Van', '[O motor liga. Baixinho.]');
  await say('V', '— Você entendeu? Não funcionou. Eu tentei e não funcionou.');
  await say('Radio', '[Ela liga o rádio. Não toca nada. Só fica aberta, chiando de leve, do jeito que ela fica quando quer que ele continue falando.]');
  await say('V', '— Eu não sei se é porque não dá. Ou se é porque eu não sei ainda.');
  await say('V', '— Van. Se for a segunda, eu vou aprender.');
  await say('Radio', '[O rádio desliga sozinho.]');
  // velório
  G.player.setOutfit('V_terno'); G.flags.velorio = true;
  World.load('velorio', 'start');
  G.player.setOutfit('V_terno');
  UI.setTime('Velório · 14:00');
  C.c9_pessoas();
  await fadeIn(1);
  await say('Narr', 'O velório foi no dia seguinte, das duas da tarde às sete. V ficou de pé as cinco horas inteiras. Não sentou uma vez.');
  await say('Narr', 'Sala número quatro. Flores plásticas nas laterais e flores de verdade em cima. Cheiro de lírio, que é o cheiro que agora, pra sempre, na cabeça de V, significa uma coisa só.');
  Q.add('velorio', 'Sala 4', 'Fique. Veja tudo. Fale com as pessoas.', true);
  C.c9_list();
};
C.c9_pessoas = () => {
  const mae = addNPC({ id: 'mae', cast: 'MaeTeo', x: T(10) + 8, y: T(8) + 2, dir: 'up', sitting: true, lookAtPlayer: false, name: 'Mãe do Téo', label: '',
    talk: async () => {
      if (!G.flags.v_mae) { G.flags.v_mae = true; await say('Narr', 'Ela recebe as pessoas que chegam com um aperto de mão e um agradecimento, e volta pro ponto no chão a uns dois metros à frente.'); await say('MaeTeo', '— Obrigada por ter vindo, V. Ele gostava muito de você.'); await say('Narr', 'Isso destruiu o V mais do que qualquer outra coisa naquele dia.'); C.c9_list(); return; }
      await say('Narr', 'Ela continua olhando o mesmo ponto no chão.');
    } });
  const lar = addNPC({ id: 'larissa', cast: 'Larissa', x: T(4), y: T(11), name: 'Larissa', label: '', speed: 34,
    path: [[T(19), T(11) + 8, 1.5], [T(20) + 8, T(12), 2], [T(17), T(5), 1.5], [T(4), T(5), 1.5], [T(2) + 8, T(11), 2]],
    talk: async () => {
      if (!G.flags.v_lar) {
        G.flags.v_lar = true;
        await say('Larissa', '— V. Oi. O tio do Téo vai atrasar, ele tá preso no trânsito. Você viu se ainda tem copo pro café? Tem? Tá. Tá bom.');
        await say('Narr', 'Ela cuidou daquele velório inteiro com uma eficiência assustadora, e todo mundo comentava como ela era forte.');
        await say('Narr', 'V olhou pra ela uma única vez de perto e viu que ela estava se mantendo em pé exclusivamente porque enquanto tivesse tarefa ela não precisava sentar.');
        C.c9_list(); return;
      }
      await say('Larissa', U.pick(['— Desculpa, eu tô resolvendo uma coisa.', '— Mais copo. Precisa de mais copo.']));
    } });
  const gus = addNPC({ id: 'gus', cast: 'Gustavo_luto', x: T(16), y: T(10) + 8, dir: 'left', name: 'Gustavo', label: '',
    talk: async () => {
      if (!G.flags.v_gus) {
        G.flags.v_gus = true;
        await say('Gustavo', '— ...e aí o carro quebra no meio da serra, em 2018, e o Téo de óculos escuros tocando violão no acostamento, como se fosse show... — ele chora e ri ao mesmo tempo.');
        await say('Narr', 'Gustavo chorou o tempo todo, sem nenhuma vergonha, e contou pelo menos seis vezes a mesma história. Contou pra quem conhecia o Téo e pra quem não conhecia.');
        await say('Gustavo', '— Cara, você tá me assustando.');
        await say('V', '— Eu tô bem.');
        await say('Gustavo', '— Você não chorou.');
        await say('V', '— Eu tô bem, Gu.');
        await say('Gustavo', '— Você tá com aquela cara de novo.');
        await say('Narr', 'E V não respondeu.');
        C.c9_list(); return;
      }
      await say('Gustavo', '— Ele tava indo comprar cerveja, cara. Cerveja.');
    } });
  addNPC({ id: 'c1', cast: 'Convidado1', x: T(5), y: T(9) + 2, dir: 'up', sitting: true, lookAtPlayer: false, name: 'Convidado', talk: async () => { await say('Convidado', '— Tão novo. Tão novo...'); } });
  addNPC({ id: 'c2', cast: 'Convidado2', x: T(17), y: T(9) + 2, dir: 'up', sitting: true, lookAtPlayer: false, name: 'Convidada', talk: async () => { await say('Convidado', '— Eu era professora dele no fundamental. Ele não falava nada. E quando falava, era a melhor coisa da sala.', { name: 'Convidada' }); } });
  addNPC({ id: 'c3', cast: 'Convidado3', x: T(20) + 4, y: T(12) - 2, dir: 'left', name: 'Vizinho da mãe', talk: async () => { await say('Convidado', '— O rapaz ali já me contou a história da serra três vezes. Bonita história.', { name: 'Vizinho da mãe' }); } });
};
C.c9_list = () => {
  const f = G.flags, mk = v => v ? '■' : '□';
  const n = [f.v_mae, f.v_lar, f.v_gus].filter(Boolean).length;
  Q.upd('velorio', `${mk(f.v_mae)} a mãe do Téo · ${mk(f.v_lar)} a Larissa · ${mk(f.v_gus)} o Gustavo`);
  if (n < 3) Story.obj(`Fique. ${n}/3 — ${mk(f.v_mae)}mãe do Téo ${mk(f.v_lar)}Larissa ${mk(f.v_gus)}Gustavo`, 'fica. Fala com eles. Eu tô do lado de fora.');
  else if (!f.gola) { f.gola = true; setTimeout(() => Story.cut(C.c9_gola), 1500); }
};
C.c9_gola = async () => {
  UI.setTime('Velório · 18:00');
  const mae = npc('mae'), lar = npc('larissa');
  lar.path = null; await lar.walkTo(T(19) + 8, T(9) + 2, 34); lar.sitting = true; lar.dir = 'up';
  await say('Narr', 'Quando a última tarefa acabou, por volta das seis e meia, a Larissa sentou. E aí sim.');
  await wait(1);
  mae.sitting = false;
  await mae.walkTo(T(11) + 8, T(5) + 8, 12);
  mae.dir = 'up';
  await say('Narr', 'Foi por volta das seis que a mãe do Téo levantou pela primeira vez. Ela foi até o caixão.');
  await say('Narr', 'E aí, sem plateia nenhuma, sem drama, ela arrumou a gola do paletó do filho — puxou de um lado, alisou com o polegar, do jeito que se arruma a gola de uma criança antes da foto da escola.');
  await say('Narr', 'E disse alguma coisa que ninguém ouviu. V estava a uns seis metros. Ele podia ter ouvido. Bastava querer.');
  const i = await choose(['Fechar. Segurar o próprio poder com as duas mãos e não escutar.', 'Escutar [X].']);
  if (i === 0) {
    G.stats.decencia++;
    await say('Narr', 'Ele fechou. Com força. É uma das poucas coisas daquela época que ele considera decência.');
  } else {
    G.peso += 1;
    G.perceive = 2;
    await say('Narr', 'Ele ouviu. Era uma coisa que só uma mãe diz. Ele nunca contou pra ninguém. E nunca se perdoou por ter ouvido.');
  }
  await say('Narr', 'A coisa que estava acontecendo naquela sala não era um evento cósmico. Era uma senhora de sessenta e um anos arrumando a gola do paletó do filho pela última vez.');
  await say('Narr', 'E isso estava acontecendo porque um carro tinha vindo rápido demais numa avenida, e por nenhum outro motivo. Não tinha lição nenhuma. Ninguém ia aprender nada com aquilo.');
  Audio2.sfx('heart'); shake(1);
  await say('Narr', 'V sentiu uma coisa se romper no peito. Foi física. Ele levou a mão ao esterno.');
  await say('Narr', 'Os poderes dele nunca responderam a esforço. A chave é a necessidade. Foi só ali que ele sentiu que o Téo tinha morrido.');
  await say('Narr', 'E quando sentiu, a porta destrancou.');
  G.fx.wobble = 1.5; Audio2.sfx('tear');
  await wait(1);
  await say('Narr', 'Por uma fração de segundo, olhando aquele caixão, V soube — do mesmo jeito que se sabe o próprio nome — onde estava o Téo. Não o corpo. A outra parte.');
  await say('Narr', 'Soube que era perto. Soube que era alcançável. E soube, junto com isso, que ele conseguia.');
  const g = npc('gus'); g.walkTo(G.player.x + 14, G.player.y, 30);
  await wait(1);
  await say('Gustavo', '— Cara? Você tá branco.');
  await say('V', '— Tô com fome. Vou pegar um café.');
  G.flags.portaAbriu = true; Q.done('velorio');
  Story.obj('Saia pela porta da sala', 'sai. Ar.');
};
C.c9_vomito = async () => {
  await fadeOut(0.8);
  await narr(['Ele atravessou a sala, passou pelo garrafão sem pegar nada, saiu pela porta lateral,', 'e vomitou no estacionamento.', 'Depois sentou no chão, encostado numa parede, com o terno amassado e o cheiro de lírio ainda grudado na roupa.', 'E ficou lá, sozinho, sabendo.', '', 'O enterro era às nove da manhã do dia seguinte.', 'Ele tinha quinze horas pra decidir a coisa mais importante da vida dele.']);
  Story.nextChapter();
};

// ================================================================ CAP 10 — A PORTA QUE NÃO DEVIA ABRIR
const ARGS = [
  { side: 'A FAVOR', t: 'O Téo tinha vinte e sete anos. Não era doença, não era velhice. Foi um carro. Foi acaso puro. Não tem nenhuma ordem cósmica sendo respeitada quando um cara de vinte e sete anos morre indo comprar cerveja.', x: T(5), y: T(7) },
  { side: 'CONTRA', t: 'Ele não sabe o que a morte é. Ele sabe onde o Téo está — a direção, a distância — e não faz a menor ideia do que é aquele lugar. Nem se tirar alguém de lá é resgate ou sequestro.', x: T(19), y: T(12) },
  { side: 'A FAVOR', t: 'Se ele tivesse chegado quinze minutos antes na Marechal e empurrado o Téo pra calçada, ninguém no mundo chamaria isso de errado. Todo mundo chamaria de heroísmo. A única diferença é o horário.', x: T(29), y: T(7) },
  { side: 'CONTRA', t: 'Não é a única diferença. Existe uma diferença entre impedir e desfazer. Impedir é agir dentro do mundo. Desfazer é dizer que o mundo estava errado.', x: T(28), y: T(18) },
  { side: 'A FAVOR', t: 'O mundo estava errado.', x: T(4), y: T(20) },
  { side: 'CONTRA', t: 'Todo mundo acha isso. Toda pessoa que perde alguém acha isso. Ele estava tendo essa conversa não porque tinha mais direito — mas porque tinha mais poder. E essas duas coisas não são a mesma.', x: T(12), y: T(5) + 8 },
];
C[10] = async () => {
  G.flags.garagem = true; G.flags.mansaoPresa = true;
  World.load('mansao', 'porta');
  G.player.setOutfit('V_terno');
  G.fade = 1; UI.setTime('Madrugada');
  await UI.chapterCard('Capítulo 10', 'A Porta Que Não Devia Abrir', 'A necessidade nunca foi tão grande.');
  await fadeIn(0.8);
  await say('Narr', 'Ele não voltou pro apartamento. Foi direto pra Mansão, e passou aquelas quinze horas andando de um cômodo pro outro como um animal.');
  await say('Narr', 'A casa reagiu. Naquela noite, a janela não mostrou nada. Ficou branca.');
  await say('V', '— Tá bom. Eu entendi. — ele diz pro teto, por volta das duas da manhã.');
  Q.add('debate', 'Quinze horas', 'Vá até a Van, na garagem. Depois, pense: todos os lados.', true);
  Story.obj('Vá até a Van (garagem)', 'eu tô aqui embaixo. Com o motor desligado.');
  Story.vanTalkOverride = C.c10_van;
};
C.c10_van = async () => {
  const v = G.entities.find(e => e instanceof VanEnt);
  if (G.flags.c10van) { await say('Van', '[Um farol aceso. Ela não pisca. Só fica.]'); return; }
  G.flags.c10van = true;
  G.player.sitting = true;
  await say('Narr', 'Ele sentou no chão de cimento, encostado na roda dianteira, do mesmo jeito que sentou no dia do Gustavo.');
  await say('V', '— Eu consigo.');
  await say('Van', '[O motor não liga.]');
  await say('V', '— Van. Eu sei que você tá me ouvindo.');
  v.lights = true; await say('Van', '[Um farol acende. Fraco. E fica aceso — não pisca, não responde sim nem não. Só fica.]');
  await say('V', '— Eu consigo trazer ele. Eu senti no velório. Eu sei onde ele tá. Não é uma teoria. É como saber onde tá a sua mão no escuro.');
  await say('V', '— Fala alguma coisa.');
  Audio2.sfx('radio'); await wait(0.6); Audio2.sfx('radio');
  await say('Radio', '[O rádio liga. Chia. Varre a faixa inteira, de ponta a ponta, duas vezes. E não acha nada.]');
  G.player.sitting = false;
  await say('Narr', 'Ele argumentou sozinho por horas. V nunca mais na vida deliberou tanto sobre nada — e isso é uma informação sobre ele que não é elogiosa.');
  Story.obj('Pense: encontre os seis argumentos pela casa (0/6)', 'os pensamentos estão espalhados pela casa. Os dois lados.');
  Story.vanTalkOverride = null;
  let got = 0;
  ARGS.forEach((a, i) => {
    const orb = new Custom({ x: a.x, y: a.y, ph: i, side: a.side, ignoreFreeze: true,
      tick(dt) { this.ph += dt; if (U.dist(this.x, this.y, G.player.x, G.player.y) < 14 && !G.cutscene && !this.taken) { this.taken = true; this.dead = true; Story.cut(async () => { got++; Audio2.sfx('perceive'); await say('Narr', `${a.side}: ${a.t}`); Story.obj(`Pense: encontre os seis argumentos pela casa (${got}/6)`, 'mais pensamentos pela casa. A cozinha. O quarto. O salão.'); if (got === 6) C.c10_fimDebate(); }); } },
      render(c) { const y = this.y - 14 + Math.sin(this.ph * 2) * 3; const col = this.side === 'A FAVOR' ? '#ffb347' : '#8fd8ff'; c.globalAlpha = 0.25; c.fillStyle = col; c.beginPath(); c.arc(this.x, y, 9, 0, 7); c.fill(); c.globalAlpha = 1; c.fillStyle = col; c.fillRect(Math.round(this.x) - 2, Math.round(y) - 2, 4, 4); c.fillStyle = '#fff'; c.fillRect(Math.round(this.x) - 1, Math.round(y) - 1, 2, 2); if (Math.random() < 0.2) FX.add({ x: this.x + U.rand(-5, 5), y: y + U.rand(-5, 5), vx: 0, vy: -8, life: 0.6, color: col }); } });
    orb.perceive = a.side;
    G.entities.push(orb);
  });
};
C.c10_fimDebate = async () => {
  G.flags.debateOk = true;
  await say('Narr', 'Perto das seis da manhã ele parou de argumentar.');
  Story.obj('Sente no sofá. Seis da manhã.', 'o sofá.');
  glow('sofaLux', true);
};
C.c10_sofa = async () => {
  G.flags.seisDaManha = true; glow('sofaLux', false);
  G.player.x = T(10) + 8; G.player.y = T(10) + 4; G.player.dir = 'down'; G.player.sitting = true;
  UI.setTime('06:00');
  await say('Narr', 'E aí veio o argumento que ganhou. Não foi nenhum dos de cima. Foi mais sujo, e mais honesto, e ele demorou anos pra admitir que foi esse.');
  await think('Eu não quero viver num mundo onde eu podia e não fiz.');
  await say('Narr', 'Não é sobre o Téo. Repare. Não tem o Téo nessa frase. Tem eu.');
  await say('Narr', 'Um covarde com um poder infinito. Foi assim que ele formulou. E a partir do momento em que você chama não intervir de covardia, você nunca mais consegue não intervir em nada.');
  await say('Narr', 'Aquela frase, dita num sofá às seis da manhã, é a semente de tudo.');
  const v = new VanEnt({ id: 'vanSala', x: T(11), y: T(14), alpha: 0 }); G.entities.push(v);
  for (let i = 0; i <= 20; i++) { v.alpha = i / 20; await Wait.frames(1); }
  G.player.sitting = false; faceV('down');
  await say('V', '— Van. Eu vou.');
  v.blink(2); await say('Van', '[Faróis. Dois. Firmes.]');
  await say('V', '— Eu sei que você acha errado.');
  v.blink(2); await say('Van', '[Dois de novo.]');
  await say('V', '— Fala por quê.');
  await say('Narr', 'E ela fez uma coisa que nunca tinha feito e nunca mais fez. Ligou o rádio, e não tocou música. Tocou um som que V demorou uns segundos pra reconhecer.');
  Audio2.sfx('radio');
  await say('Gustavo', '"...cara, você faz sempre isso. Você resolve tudo sozinho e depois conta quando já acabou."', { name: 'Rádio — áudio do Gustavo' });
  await wait(0.8);
  await say('V', '— Não é a mesma coisa. — A voz saiu mais baixa do que ele queria.');
  v.blink(1); await say('Van', '[Um farol. Um único farol. Sim. Sim, é.]');
  Q.done('debate');
  await fadeOut(1.2);
  // enterro
  G.flags.mansaoPresa = false;
  World.load('cemiterio', 'start');
  G.player.setOutfit('V_terno');
  UI.setTime('Enterro · 09:00');
  C.c10_enterro();
  await fadeIn(1);
  await say('Narr', 'Ele foi ao enterro. Isso é importante. Ele podia ter feito antes. Podia ter resolvido na madrugada e evitado aquilo tudo.');
  Q.add('enterro', 'O preço', 'Fique até o fim. Abrace a mãe do Téo. Fique do lado do Gustavo.', true);
  C.c10_list();
};
C.c10_enterro = () => {
  const mk = (id, cast, x, y, dir, extra) => addNPC(Object.assign({ id, cast, x, y, dir, lookAtPlayer: false }, extra || {}));
  mk('mae', 'MaeTeo', T(26) + 4, T(16) + 8, 'down', { name: 'Mãe do Téo', label: '', talk: async () => { if (G.flags.e_mae) return say('Narr', 'Ela segura sua mão um tempo a mais.'); G.flags.e_mae = true; await say('Narr', 'Ele abraçou a mãe do Téo. Ela era menor do que ele lembrava.'); await say('MaeTeo', '— Ele ia casar em novembro, V. Ele já tinha escolhido a música.'); C.c10_list(); } });
  mk('larissa', 'Larissa', T(29) + 4, T(17), 'left', { name: 'Larissa', talk: async () => { await say('Narr', 'Ela não diz nada. Está olhando a terra.'); } });
  mk('gus', 'Gustavo_luto', T(24) + 8, T(19) + 4, 'right', { name: 'Gustavo', label: '', talk: async () => { if (G.flags.e_gus) return say('Gustavo', '— ...'); G.flags.e_gus = true; G.player.x = T(24) + 8; G.player.y = T(20) + 12; G.player.dir = 'right'; await say('Narr', 'Ele ficou do lado do Gustavo enquanto baixavam o caixão. O Gustavo segurou o braço dele com força, e não soltou.'); C.c10_list(); } });
  mk('c1', 'Convidado1', T(22), T(17), 'right'); mk('c2', 'Convidado2', T(31), T(19), 'left'); mk('c3', 'Convidado3', T(23), T(22), 'up'); mk('c4', 'Pedestre1', T(30), T(22) + 4, 'up');
  World.prop('cova').st = {};
};
C.c10_list = () => {
  const f = G.flags, mk = v => v ? '■' : '□';
  if (!(f.e_mae && f.e_gus)) { Story.obj(`O enterro — ${mk(f.e_mae)}abrace a mãe do Téo ${mk(f.e_gus)}fique do lado do Gustavo`, 'fica. Até o fim.'); return; }
  if (f.enterroOk) return;
  f.enterroOk = true;
  Story.cut(async () => {
    await say('Narr', 'Às onze e vinte da manhã, o cemitério esvaziou.');
    await fadeOut(0.8);
    for (const id of ['mae', 'gus', 'c1', 'c2', 'c3', 'c4']) { const n = npc(id); if (n) n.dead = true; }
    const l = npc('larissa'); l.x = T(27) + 8; l.y = T(17) + 2; l.dir = 'down';
    G.player.x = T(19) + 8; G.player.y = T(20); G.player.dir = 'right';
    UI.setTime('11:20');
    await fadeIn(0.8);
    await say('Narr', 'A Larissa foi a última a sair. Ficou uns quinze minutos sozinha. V esperou a uns trinta metros, encostado numa árvore, sem se aproximar.');
    Q.done('enterro');
    Story.obj('Espere encostado na árvore (à direita)', 'a árvore. Dá espaço pra ela.');
    glow('arvoreV', true);
  });
};
C.c10_esperar = async () => {
  glow('arvoreV', false);
  G.player.x = T(33) + 4; G.player.y = T(18) + 8; G.player.dir = 'left';
  const ok = await Mini.hold('Segure E — espere', 4, true);
  if (!ok) { await think('Espera. Ela precisa disso.'); glow('arvoreV', true); return; }
  const l = npc('larissa');
  UI.setTime('11:35');
  await l.walkTo(T(19) + 8, T(13), 26, true);
  await l.walkTo(T(19) + 8, T(26), 30, true);
  l.dead = true;
  UI.setTime('13:00');
  await say('Narr', 'Quando ela finalmente foi embora, ele ficou. Ficou até uma da tarde, com o sol quente na nuca, olhando a terra revirada.');
  await say('V', '— Porque eu queria ver o preço. Eu queria ver exatamente o tamanho da coisa que eu ia apagar. Se eu ia tirar aquele dia da cabeça de todo mundo, o mínimo que eu podia fazer era ser a única pessoa que ia carregar ele inteiro.', { name: 'V (anos depois, pro Rayan)' });
  G.flags.sozinho = true;
  Q.add('sentir', 'Sentir falta', 'Ajoelhe na cova.', true);
  Story.obj('Ajoelhe na cova', 'ali.');
  glow('cova', true);
};
C.c10_sentir = async () => {
  glow('cova', false);
  G.player.x = T(27) + 8; G.player.y = T(21) + 10; G.player.dir = 'up'; G.player.sitting = true;
  await say('Narr', 'E aí ele se agachou, encostou a mão no chão, e fechou os olhos.');
  await say('Narr', 'E daquela vez ele não mandou nada. Não pensou volta. Não pensou conserta.');
  const ok = await Mini.sentir();
  G.flags.sentiu = true; Q.done('sentir');
  await say('Narr', 'Ele só fez a única coisa que os poderes dele sempre entenderam, desde um copo caindo numa terça de janeiro.');
  await say('Narr', 'Sentiu falta.');
  await fadeOut(1.5, '#fff');
  await narr(['E a porta se abriu.'], { light: true });
  G.fadeColor = '#000';
  Story.nextChapter();
};

// ================================================================ CAP 11 — TÉO
C[11] = async () => {
  World.load('cemiterio', 'cova');
  G.player.setOutfit('V_terno');
  G.player.sitting = true; G.player.dir = 'up';
  G.fade = 1; G.fadeColor = '#fff'; UI.setTime('13:04');
  await UI.chapterCard('Capítulo 11', 'Téo', 'Ele volta.');
  await fadeIn(1.5);
  G.fadeColor = '#000';
  await say('Narr', 'Não foi como nos filmes. As pessoas imaginam luz, terra se movendo, alguém sentando de repente. Não teve nada disso.');
  await say('Narr', 'A coisa que ele alcançou não estava longe. Estava do outro lado de uma parede fina, e a parede não era feita de matéria. Era feita de uma coisa parecida com acordo. Como se todo mundo, o tempo todo, estivesse combinando de não olhar pra lá.');
  await say('Narr', 'Ele olhou. E alguma coisa lá dentro percebeu que ele estava olhando.');
  G.fx.wobble = 1.2;
  await say('Narr', 'Não era uma pessoa. Era mais parecido com a atenção de um lugar. Aquilo notou ele. E não fez nada. Do jeito que um cachorro grande abre um olho quando alguém passa, e depois volta a dormir.');
  await say('Narr', 'Ele estendeu a mão através de uma parede que ninguém devia atravessar, encontrou o amigo do outro lado, e trouxe de volta. E a única resistência que o universo ofereceu foi nenhuma.');
  // Téo aparece
  const teo = addNPC({ id: 'teo', cast: 'Teo_terno', x: T(25), y: T(20) + 8, dir: 'right', lookAtPlayer: false, name: 'Téo', alpha: 0 });
  teo.hidden = true;
  for (let i = 0; i < 40; i++) FX.add({ x: teo.x + U.rand(-8, 8), y: teo.y - U.rand(0, 32), vx: 0, vy: U.rand(-8, -2), life: 1.2, color: U.pick(['#ffffff', '#ffe9a8', '#c8d8ff']) });
  Audio2.sfx('create');
  await wait(0.8);
  teo.hidden = false;
  await wait(1);
  teo.say('?', 2.5);
  await say('TeoT', '— Ué.');
  await wait(0.6);
  G.player.dir = 'left';
  floatText(G.player.x, G.player.y - 30, 'HAHAHAHA', 2.5, '#ffd27a');
  await say('Narr', 'E V, que tinha passado quinze horas construindo cinquenta versões daquele momento, nenhuma das quais começava com "ué", sentou no chão do cemitério e começou a rir.');
  await say('Narr', 'Riu de um jeito horroroso. Riu com o corpo inteiro, riu até doer, riu com lágrima escorrendo, riu com um som que não era riso lá pelo meio.');
  teo.dir = 'down'; await wait(0.6); teo.dir = 'right';
  await say('TeoT', '— Cara. Cara, que que tá acontecendo.');
  await say('Narr', 'O Téo estava vivo. Inteiro, lúcido, com o corpo funcionando perfeitamente — melhor do que antes, na verdade, porque V tinha reconstruído tudo e reconstruiu bem.');
  await say('Narr', 'E ele lembrava. Da avenida. Do farol. De ter olhado pra esquerda e da luz vindo rápido demais.');
  await say('TeoT', '— Eu não passei dois dias em lugar nenhum. Lá não tem dois dias.');
  await say('Narr', 'Ele ficou uns três minutos falando de forma perfeitamente calma sobre a coisa que estava do outro lado da parede fina. Com a tranquilidade de quem descreve um lugar onde passou uma tarde.');
  await say('Narr', 'E depois parou no meio de uma frase. E olhou pro V. E a calma foi embora do rosto dele como água escorrendo de uma mesa.');
  await wait(1);
  await say('TeoT', '— Espera.', { speed: 18 });
  await fadeOut(2);
  await Game.ending();
};
