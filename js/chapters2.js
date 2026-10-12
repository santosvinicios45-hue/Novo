// =====================================================================
//  chapters2.js — ATO I, capítulos 5 a 8 + missões secundárias da rua
// =====================================================================
'use strict';

// ================================================================ CAP 5 — A MANSÃO VIVA
C[5] = async () => {
  G.flags.vanGuardada = false; G.flags.vanFria = false;
  World.load('apto', 'sofa');
  G.fade = 1; UI.setTime('Domingo · 22:10'); G.map.dark = 0.6;
  await UI.chapterCard('Capítulo 5', 'A Mansão Viva', 'Um refúgio construído com o pensamento.');
  await fadeIn(0.8);
  await say('Narr', 'Duas semanas depois da noite do Gustavo. Duas semanas em que ele não conseguiu decidir nada.');
  await say('Narr', 'V não é uma pessoa indecisa. É uma pessoa que decide rápido demais e conserta depois. Ficar parado com uma pergunta na mão por catorze dias era um estado que o corpo dele não sabia processar.');
  Q.add('fugir', 'Um lugar pra fugir', 'O noticiário virou uma lista de coisas que você decidiu não fazer.', true);
  Story.obj('Ligue a TV (o noticiário)', 'a TV. Você vai ligar de qualquer jeito.');
  glow('tv', true);
};
C.c5_noticias = async () => {
  G.flags.noticias = true;
  const tv = World.prop('tv'); tv.glow = false; tv.st.on = true; tv.st.channel = 'news';
  await say('Narr', '"Enchente no litoral deixa centenas de desabrigados."');
  await think('Eu podia.');
  await say('Narr', '"Prédio desaba na zona norte; bombeiros buscam sobreviventes."');
  await think('Eu podia.');
  await say('Narr', 'Um número num rodapé de tela sobre gente morrendo em algum lugar que ele não sabia apontar no mapa.');
  await think('Eu podia.');
  await say('Narr', 'E cada "eu podia" que não virava "eu fiz" ia se acumulando em algum lugar do peito, até virar uma coisa física. Um aperto embaixo do esterno que não passava com nada.');
  tv.st.on = false;
  const van = G.entities.find(e => e instanceof VanEnt);
  van.radio = true; Audio2.playSong('mansao');
  await say('Radio', '[A Van toca uma música de estrada bem devagar, dessas de fim de viagem. Ela está dizendo: você precisa parar um pouco.]');
  await say('V', '— Eu não consigo. Não é que eu não queira. Toda vez que eu paro eu penso, e toda vez que eu penso eu chego no mesmo lugar.');
  van.wipe(1.5); await say('Van', '[Limpador de para-brisa. Duas passadas.]');
  await say('V', '— Não é preguiça, Van.');
  van.wipe(0.7); await say('Van', '[Uma passada.]');
  await say('V', '— Então o que é?');
  van.radio = false; Audio2.playSong(null);
  await say('Van', '[Ela desliga o rádio. Silêncio total. É medo — e você sabe.]');
  await wait(0.8);
  await say('Narr', 'E ele fez a única coisa que ainda não tinha tentado. Ele fez um lugar pra fugir.');
  Story.obj('Abra a porta do banheiro... com uma certa intenção', 'a porta do banheiro. Não é força. É como lembrar de uma palavra.');
  glow('portaBanheiro', true);
};
C.c5_porta = async () => {
  glow('portaBanheiro', false);
  const ok = await Mini.hold('Segure E — como lembrar de uma palavra', 2.4);
  if (!ok) { await think('Não... de novo. Sem força. Só acessar.'); glow('portaBanheiro', true); return; }
  G.flags.mansaoCriada = true;
  Audio2.sfx('tear'); G.fx.wobble = 1.5;
  await Story.goto('mansao', 'porta');
  await UI.chapterCard('', 'A Mansão Viva');
  await say('Narr', 'Não é uma mansão, tecnicamente. A palavra ficou porque foi a primeira que ele usou, e as primeiras palavras grudam.');
  await say('Narr', 'Pé-direito de sete metros. Madeira escura. Janelas altas que dão pra uma paisagem que muda conforme o humor dele.');
  Q.done('fugir');
  Q.add('mansao', 'O lugar onde não se decide nada', 'Conheça a Mansão: coma algo, sente no sofá, olhe pela janela. Depois, durma.', true);
  C.c5_list();
  Story.on('mansaoTask', () => { C.c5_list(); return false; });
};
C.c5_list = () => {
  const f = G.flags, mk = v => v ? '■' : '□';
  const n = [f.m_comida, f.m_sofa, f.m_janela].filter(Boolean).length;
  Q.upd('mansao', `${mk(f.m_comida)} comer algo (cozinha) · ${mk(f.m_sofa)} sentar no sofá · ${mk(f.m_janela)} olhar pela janela · depois, dormir (quarto)`);
  if (n < 3) Story.obj(`A Mansão: ${n}/3 — ${mk(f.m_comida)}cozinha ${mk(f.m_sofa)}sofá ${mk(f.m_janela)}janela`, !f.m_comida ? 'a cozinha, à direita. Pensa em comida.' : !f.m_sofa ? 'o sofá. Você vai entender.' : 'as janelas altas do salão.');
  else { Story.obj('Durma na cama (quarto, à direita)', 'a cama do quarto. Você não dorme onze horas desde a adolescência.'); glow('camaLux', true); }
};
C.c5_dormir = async () => {
  glow('camaLux', false);
  G.flags.m_dormiu = true;
  await fadeOut(1);
  await narr(['A primeira vez que ele passou a noite lá dentro, dormiu onze horas seguidas.', 'Acordou com uma sensação de descanso tão absoluta que quase deu medo.', 'E o aperto embaixo do esterno não estava lá.', 'Era tão bom que ele ficou três dias.']);
  Q.done('mansao');
  G.player.x = T(30); G.player.y = T(16) + 8; G.player.dir = 'down';
  await fadeIn(1);
  await think('Preciso pegar uma coisa no apartamento.');
  G.flags.vanFria = true;
  Q.add('vanFria', 'Uma coisa no apartamento', 'Volte rapidinho ao apartamento (porta no fundo do salão).', true);
  Story.obj('Volte ao apartamento pegar uma coisa (porta no fundo do salão)', 'a porta lá embaixo, no salão.');
  glow('portaVolta', true);
  World.triggers.push({ x: 0, y: 0, w: 1, h: 1, fired: true });
  Story.mapSetup._aptoOnce = true;
};
// ao voltar ao apto no cap. 5, a Van está fria
const _aptoSetup = Story.mapSetup.apto;
Story.mapSetup.apto = () => {
  _aptoSetup();
  if (G.chapter === 5 && G.flags.vanFria && !G.flags.vanEntrou) {
    const v = G.entities.find(e => e instanceof VanEnt); if (v) { v.cold = true; v.lights = false; }
    setTimeout(() => Story.cut(C.c5_vanFria), 400);
  }
};
C.c5_vanFria = async () => {
  if (G.flags.vanFriaVista) return; G.flags.vanFriaVista = true;
  await say('Narr', 'Ela estava ali, na sala, ocupando um espaço geometricamente impossível, com os faróis desligados.');
  await say('Narr', 'E o silêncio dela era diferente do silêncio de desaprovação. Era um silêncio parado, quase triste.');
  Story.obj('Fale com a Van', 'ela.');
  Story.vanTalkOverride = async () => {
    const v = G.entities.find(e => e instanceof VanEnt);
    await say('V', '— Oi.');
    await say('Van', '[Nada.]');
    await say('V', '— Van.');
    v.blink(1); await say('Van', '[Um farol. Fraco.]');
    await say('Narr', 'Ele encostou na lataria. Estava fria. E aí ele entendeu, e a compreensão veio junto com uma vergonha bem específica: ele tinha feito um lugar perfeito, e não tinha convidado ela.');
    await say('V', '— Desculpa. Você quer entrar?');
    v.engine = true; v.cold = false; Audio2.sfx('car');
    await say('Van', '[O motor liga.]');
    G.flags.vanEntrou = true; G.flags.garagem = true; G.flags.vanGuardada = true; Q.done('vanFria');
    Story.vanTalkOverride = null;
    glow('portaVolta', false);
    await Story.goto('mansao', 'garagem');
    await say('Narr', 'Cinco metros e meio de van atravessando uma porta de setenta centímetros sem que nada nisso parecesse forçado.');
    await say('Narr', 'E a Mansão inteira se reorganizou pra ter uma garagem que não existia dez segundos antes: piso de cimento queimado, luz amarelada de oficina, e um cheiro absolutamente convincente de óleo.');
    const van = G.entities.find(e => e instanceof VanEnt);
    van.radio = true; Audio2.playSong('van');
    await say('Radio', '[Uma música alegre, dessas de janela aberta.]');
    await say('V', '— Eu ia ficar aqui pra sempre, né?');
    van.blink(1); await say('Van', '[Um farol.]');
    await say('V', '— É. Eu sei.');
    van.blink(2); await say('Van', '[Dois faróis, dessa vez — não como resposta, mas como quem chama.]');
    G.player.sitting = true;
    await say('V', '— Eu não sei o que fazer lá fora, Van. Eu sei fazer qualquer coisa, e eu não sei o que fazer. Aqui dentro a única coisa que acontece é o que eu quero. Lá fora tem oito bilhões de pessoas e cada coisa que eu fizer vai bater em todas elas.');
    Audio2.playSong('mansao');
    await say('V', '— Eu tô com medo de começar. Porque eu sei que se eu começar, eu não paro.');
    await say('Narr', 'Ela não respondeu. Não tinha resposta pra dar, e as duas sabiam.');
    G.player.sitting = false;
    Story.obj('Durma encostado no pneu da Van (chão da garagem)', 'deita aqui. Do meu lado.');
  };
};
C.c5_pneu = async () => {
  G.flags.dormiuPneu = true;
  G.player.x = T(5); G.player.y = T(21); G.player.dir = 'right'; G.player.sitting = true;
  await say('Narr', 'O motor continuou ligado a noite inteira, baixinho, e V dormiu ali mesmo, no chão de uma garagem inventada, encostado no pneu dianteiro.');
  await say('Narr', 'Do jeito que a gente dorme quando finalmente parou de discutir consigo mesmo.');
  await fadeOut(1.2);
  await narr(['Na manhã seguinte ele atravessou a porta de volta, pegou o casaco,', 'e saiu do apartamento pela primeira vez em dezenove dias.', '', 'A Mansão continuou lá. Sempre continuou.', 'É o único lugar do multiverso onde V não é responsável por nada.', 'Ele volta pra lá depois de cada coisa terrível que faz.', 'E cada vez que volta, fica um pouco mais tempo.']);
  G.player.sitting = false;
  Story.nextChapter();
};

// ================================================================ CAP 6 — O QUE SE FAZ COM ISSO
C[6] = async () => {
  G.flags.podeSair = true; G.flags.vanGuardada = true;
  World.load('rua', 'predio');
  G.fade = 1; UI.setTime('Terça-feira · 09:00');
  await UI.chapterCard('Capítulo 6', 'O Que Se Faz Com Isso', 'A rua estava insuportavelmente normal.');
  await fadeIn(0.8);
  await say('Narr', 'Dezenove dias trancado reescrevendo as leis básicas da existência, e lá fora o vizinho continuava lavando o carro no mesmo horário.');
  await say('Narr', 'O cachorro do quinto andar continuava latindo pra motoqueiro. A padaria continuava com a mesma fila às nove da manhã.');
  Q.add('c6pao', 'Pão', 'Compre pão na Padaria Pão Nosso.', true);
  Story.obj('Compre pão na padaria (Seu Manoel)', 'a padaria, duas portas à direita. Tem fila.');
  C.c6_fila();
};
C.c6_fila = () => {
  // fila na padaria
  const fila = [];
  const casts = ['Pedestre2', 'Convidado3', 'Pedestre3'];
  casts.forEach((c, i) => fila.push(addNPC({ id: 'fila' + i, cast: c, x: T(12) + 8 + (i + 1) * 14, y: T(9) + 6, dir: 'left', lookAtPlayer: false, name: 'Na fila', talk: async () => { await say('Pedestre', U.pick(['— Tem fila, moço.', '— A fila é ali atrás, ó.', '— Hoje tá demorando, né.']), { name: 'Na fila' }); } })));
  let myTurn = false, queued = false, timer = 4;
  Story.tick = dt => {
    if (G.chapter !== 6 || G.flags.pao || G.map.id !== 'rua') return;
    const p = G.player;
    const last = fila[fila.length - 1];
    const endX = last ? last.x + 14 : T(12) + 8 + 14;
    if (G.flags.fila && !queued && Math.abs(p.y - (T(9) + 6)) < 10 && Math.abs(p.x - endX) < 12) { queued = true; UI.hint('Você entrou na fila. Paciência.'); }
    if (queued && !myTurn && G.frozen <= 0) {
      if (Math.abs(p.x - endX) > 30 || Math.abs(p.y - (T(9) + 6)) > 18) { queued = false; UI.hint('Você saiu da fila.'); return; }
      timer -= dt;
      if (timer <= 0) {
        timer = 3.5;
        const f = fila.shift();
        if (f) { f.walkTo(T(12) + 8, T(8) + 10, 30).then(() => f.walkTo(T(2), T(9) + 12, 30).then(() => f.dead = true)); fila.forEach((n, i) => n.walkTo(T(12) + 8 + (i + 1) * 14, T(9) + 6, 20)); }
        if (!fila.length) { myTurn = true; G.flags.vez = true; UI.hint('Sua vez! Fale com o Seu Manoel.'); }
      }
    }
  };
  if (!G.flags.fila) {
    // falar com o padeiro inicia a fila
  }
};
C.c6_banco = async () => {
  G.flags.sentou = true;
  const p = G.player; p.x = T(26) + 6; p.y = T(20) + 4; p.dir = 'down'; p.sitting = true;
  Q.done('c6banco');
  await say('Narr', 'Sentou num banco da praça em frente e ficou observando as pessoas com uma atenção que ele nunca tinha dedicado a elas.');
  await say('Narr', 'Uma mulher discutindo no telefone sobre um boleto. Um cara de terno andando rápido demais pra oito e meia da manhã. Duas adolescentes rindo de uma coisa no celular. Um senhor dando milho pros pombos.');
  await think('Nenhum deles sabe.');
  await say('Narr', 'Que existe uma pessoa a doze metros dali que consegue fazer o boleto sumir. Que consegue dar ao cara de terno o dia inteiro de que ele precisa.');
  await say('Narr', 'Ele não gostou de perceber que uma parte pequena daquela sensação era agradável.');
  await say('Narr', 'Então começou pequeno.');
  p.sitting = false;
  Q.add('pequeno', 'Começar pequeno', 'A mulher do boleto · o menino do sorvete · o senhor dos pombos.', true);
  C.c6_list();
  C.c6_quests();
};
C.c6_list = () => {
  const f = G.flags, mk = v => v ? '■' : '□';
  const n = [f.boleto, f.sorvete, f.pombos].filter(Boolean).length;
  Q.upd('pequeno', `${mk(f.boleto)} a mulher do boleto · ${mk(f.sorvete)} o menino do sorvete · ${mk(f.pombos)} o senhor dos pombos`);
  Story.obj(`Começar pequeno: ${n}/3 — ${mk(f.boleto)}boleto ${mk(f.sorvete)}sorvete ${mk(f.pombos)}pombos`, !f.boleto ? 'a mulher no telefone, perto da árvore.' : !f.sorvete ? 'o menino com a mãe, perto da fonte.' : 'o senhor no banco, com os pombos. Olha pra ele de verdade [X].');
  if (n === 3 && !f.rayan) setTimeout(() => Story.cut(C.c6_rayan), 1200);
};
C.c6_quests = () => {
  // mulher do boleto
  const m = addNPC({ id: 'mulher', cast: 'MulherBoleto', x: T(19) + 4, y: T(21) + 8, dir: 'down', name: 'Mulher no telefone', label: '', lookAtPlayer: false,
    path: [[T(17), T(21) + 8, 2.5, 'down'], [T(20), T(21) + 8, 2.5, 'down']],
    perceive: 'Um boleto de R$ 1.840. Vence hoje.\nNa conta: R$ 312.',
    talk: async (n) => {
      if (G.flags.boleto) { await say('Mulher', '— Apareceu como pago. Eu juro, apareceu como pago. Eu não tô louca. — Ela ri, meio chorando.'); return; }
      n.path = null; n.dir = 'down';
      await say('Mulher', '— ...não, amor, eu sei. Eu SEI. Vence hoje. Eu não sei de onde vou tirar. — Ela desliga.');
      await say('Narr', 'Ficou olhando pra tela. Fez aquela expressão que não tem nome — a de quem acabou de calcular alguma coisa e não gostou do resultado.');
      const i = await choose(['(pensar) Pago.', 'Deixar quieto.']);
      if (i === 1) { await think('...'); n.path = [[T(17), T(21) + 8, 2.5, 'down'], [T(20), T(21) + 8, 2.5, 'down']]; return; }
      G.player.glowT = 1; FX.ember(G.player.x, G.player.y - 14, 12);
      await say('Narr', 'Não foi nem uma escolha. Foi um reflexo, do jeito que a gente segura uma criança que tropeça.');
      Audio2.sfx('phone'); n.say('!', 2);
      await say('Mulher', '— ...? — Ela olha o celular. Franze a testa. Olha de novo. Levanta o celular na altura do rosto.');
      await say('Mulher', '— Amor? Amor, olha. Apareceu como pago. Não, eu NÃO paguei—');
      await say('Narr', 'E foi bom. Foi absurdamente bom. Uma coisa quente subiu no peito dele e ele ficou ali sorrindo sozinho como um idiota.');
      G.flags.boleto = true; n.perceive = 'Aliviada. Não entende nada.\nVai contar essa história por anos.';
      n.path = [[T(4), T(23) + 8, 0], [T(4), T(23) + 6, 999]];
      C.c6_list();
    } });
  // menino do sorvete + mãe
  const mae = addNPC({ id: 'maeMenino', cast: 'MaeMenino', x: T(36), y: T(21) + 8, dir: 'left', name: 'Mãe', lookAtPlayer: false, perceive: 'Cansada. Dormiu 4 horas.\nAma esse menino mais que tudo.', talk: async () => { await say('MaeMenino', G.flags.sorvete ? '— ...o chão tá limpo. Como o chão tá limpo?' : '— Segura direito, filho. Com as duas mãos.'); } });
  const men = addNPC({ id: 'menino', cast: 'Menino', x: T(35), y: T(21) + 10, dir: 'left', name: 'Menino', lookAtPlayer: false, perceive: 'Oito anos. Sorvete de morango.\nO melhor dia da semana.', talk: async () => { await say('Menino', G.flags.sorvete ? '— Hm! — Ele te mostra o sorvete, orgulhoso, sem saber de nada.' : '— É de morango!'); },
    extra: true });
  men.afterDraw = function (c) { if (this.hasIce) ItemArt.draw(c, 'sorvete', Math.round(this.x + 6), Math.round(this.y - 14), false); };
  men.hasIce = true;
  let dropped = false;
  World.triggers.push({ x: T(32), y: T(19), w: T(6), h: T(5), once: true, fired: false, when: () => G.flags.sentou && !G.flags.sorvete, run: async () => {
    if (dropped) return;
    dropped = true;
    men.hasIce = false;
    const ice = addItem({ id: 'sorvete', type: 'sorvete', x: men.x + 6, y: men.y + 2, z: 14, fragile: true, tk: false });
    ice.vz = 10;
    ice.onBreak = () => { Audio2.sfx('thud'); };
    await wait(0.6);
    men.say(':(', 3);
    await say('Menino', '— Nããão... — Aquele desastre catastrófico que só criança entende direito.');
    await say('MaeMenino', '— Eu avisei. Eu não avisei? Com as duas mãos, eu falei.');
    UI.hint('Rápido — DESFAÇA [R] antes que seja tarde.', 4);
    ice.onRestored = () => {
      if (G.flags.sorvete) return;
      ice.dead = true; men.hasIce = true;
      Story.cut(C.c6_sorveteOk);
    };
    setTimeout(() => {
      if (G.flags.sorvete || G.chapter !== 6) return;
      Story.cut(async () => {
        await think('Tarde demais pra desfazer... Ou eu podia simplesmente fazer outro.');
        G.flags.cria_sorvete = true;
        Story.obj('Crie um sorvete [C] perto do menino', 'um sorvete. De morango. Na casquinha.');
        Story.on('create', it => { if (it.type !== 'sorvete' || G.flags.sorvete || U.dist(it.x, it.y, men.x, men.y) > 50) return false; it.dead = true; men.hasIce = true; const ice2 = item('sorvete'); if (ice2) ice2.dead = true; Story.cut(C.c6_sorveteOk); return false; });
      });
    }, 7000);
  } });
  // senhor dos pombos
  const s = addNPC({ id: 'senhor', cast: 'SenhorPombos', x: T(37) + 2, y: T(25) + 6, dir: 'down', sitting: true, lookAtPlayer: false, name: 'Seu Arlindo', label: '',
    perceive: 'Viúvo. Há três anos.\nVinha ali porque ela vinha.',
    tick() { if (Math.random() < 0.01) FX.burst(this.x + U.rand(-10, 10), this.y + 2, 3, '#e8d070', 20, 0.5, { g: 80 }); },
    talk: async () => C.c6_senhor() });
  Story.on('perceive', () => { if (G.flags.sentou) G.flags.viuSenhor = G.flags.viuSenhor || U.dist(G.player.x, G.player.y, s.x, s.y) < 140; return false; });
};
C.c6_sorveteOk = async () => {
  G.flags.sorvete = true;
  await say('Narr', 'O menino ficou olhando a própria mão por três segundos com uma perplexidade absoluta. Depois simplesmente aceitou, porque criança aceita, e saiu andando.');
  await say('Narr', 'A mãe, essa sim, ficou olhando o chão limpo por um tempo bem maior.');
  const mae = npc('maeMenino'), men = npc('menino');
  mae.say('?', 3);
  mae.path = [[T(44), T(23) + 6, 0], [T(60), T(23) + 6, 999]]; men.path = [[T(44), T(23) + 8, 0], [T(60), T(23) + 8, 999]];
  C.c6_list();
};
C.c6_senhor = async () => {
  const s = npc('senhor');
  if (G.flags.pombos) { await say('Senhor', '— Ela gostava das brancas. Dizia que as brancas eram as educadas.'); return; }
  if (!G.flags.viuSenhor) {
    await say('Senhor', '— Bom dia, meu filho. — Ele espalha o milho com a mão trêmula. — Sente aí, se quiser. Eles não mordem.');
    await think('O casaco bom demais pra praça. A aliança ainda no dedo. Olha pra ele de verdade. [X]');
    return;
  }
  await say('Narr', 'V olhou pra ele — a mão trêmula espalhando o milho, o casaco bom demais pra praça, a aliança ainda no dedo — e leu a coisa inteira sem querer ler.');
  await say('Narr', 'Não foi telepatia. Foi só uma leitura do formato daquela vida.');
  await think('Eu posso trazer ela de volta.');
  await say('Narr', 'Ele não sabia se conseguia. O domínio sobre vida e morte ainda não tinha se revelado — e não ia se revelar até uma quinta-feira dali a alguns meses, quando o preço fosse pessoal.');
  await say('Narr', 'E não fez. Não por ética. Ele não fez porque não sabia como. Se soubesse, teria feito sem hesitar um segundo.');
  await say('Senhor', '— Lurdes. Quarenta e um anos de casados. Ela vinha aqui toda terça. Eu ficava em casa, achava bobagem. — Ele sorri. — Agora eu venho.');
  const i = await choose(['Sentar com ele um pouco.', '(Criar) Um saco de milho pra ele.']);
  if (i === 1) {
    G.flags.cria_milho = true;
    await think('Milho. Um saco cheio.');
    const it = new Item({ x: s.x + 14, y: s.y + 4, type: 'milho', z: 10, created: true });
    G.entities.push(it); FX.burst(it.x, it.y - 8, 12, ['#ffe9a8', '#ffb347'], 30, 0.5); Audio2.sfx('create');
    await say('Senhor', '— Ué. Isso é seu? ...Obrigado, meu filho. As brancas vão ficar contentes.');
    for (const e of G.entities) if (e instanceof Pigeon) { e.feed = { x: s.x + U.rand(-16, 16), y: s.y + U.rand(6, 14) }; }
  } else {
    G.player.x = s.x - 14; G.player.y = s.y; G.player.sitting = true;
    await say('Narr', 'Eles ficaram uns quinze minutos ali, sem falar muito. Os pombos não se incomodaram.');
    G.player.sitting = false;
  }
  await say('Narr', 'A pessoa que ele viria a ser hesitaria. Não muito. Mas hesitaria.');
  G.flags.pombos = true;
  C.c6_list();
};
C.c6_rayan = async () => {
  if (G.flags.rayan) return; G.flags.rayan = true;
  Q.done('pequeno');
  G.flags.meioDia = true; UI.setTime('Terça-feira · 12:04');
  await wait(0.5);
  Audio2.playSong('rayan');
  await say('Narr', 'Foi por volta do meio-dia que ele percebeu que estava sendo observado. A nuca esquenta. Alguma coisa na periferia da visão não se comporta como o resto.');
  const r = addNPC({ id: 'rayan', cast: 'Rayan', x: T(25) + 8, y: T(8) + 8, dir: 'down', lookAtPlayer: false, name: '???' });
  G.cam.focus = { x: T(25) + 8, y: T(10) };
  await wait(1.5);
  await say('Narr', 'Um rapaz encostado na parede do prédio comercial, do outro lado da rua, no sol. Vinte e poucos anos. Casaco com capuz, apesar do calor. Mãos nos bolsos.');
  await say('Narr', 'E olhando direto pra ele. Do jeito que a gente olha pra uma coisa que estava procurando.');
  r.say('♪', 1.5);
  await wait(0.8);
  await say('Narr', 'O rapaz sorriu. Um sorriso rápido, quase divertido. E levantou uma mão do bolso, e fez um aceno pequeno, curto, de dedos.');
  floatText(r.x + 6, r.y - 26, '👋', 1.2);
  await say('Narr', 'A pele daquela mão não tinha a cor que pele tem.');
  await wait(0.5);
  for (let i = 0; i < 20; i++) FX.add({ x: r.x + U.rand(-6, 6), y: r.y - U.rand(0, 30), vx: 0, vy: U.rand(-4, 4), life: 0.8, color: U.pick(['#7aa8f0', '#c8d8ff', '#3a4a8a']), size: 1 });
  r.dead = true; Audio2.sfx('blink');
  await wait(1);
  await say('Narr', 'V piscou. E ele já não estava lá. O ar naquele ponto da calçada tinha uma qualidade estranha por um segundo, como o tremor acima do asfalto quente.');
  await say('Narr', 'O saco de pão caiu.');
  G.cam.focus = null;
  Audio2.playSong('rua');
  Q.add('outro', 'Tem outro', 'Volte pra casa. Conte pra Van.', true);
  Story.obj('Volte pra casa (Ed. Primavera) e conte pra Van', 'casa. Agora.');
  // a Van está na sala esperando
  G.flags.vanGuardada = false; G.flags.vanFria = false;
};
const _apto6 = Story.mapSetup.apto;
Story.mapSetup.apto = () => {
  _apto6();
  if (G.chapter === 6 && G.flags.rayan && !G.flags.contou) setTimeout(() => Story.cut(C.c6_contar), 300);
};
C.c6_contar = async () => {
  G.flags.contou = true;
  Audio2.sfx('door');
  await say('Narr', 'Ele voltou pra casa quase correndo. Trancou a porta — a coisa mais inútil que uma pessoa como ele podia fazer.');
  const v = G.entities.find(e => e instanceof VanEnt);
  v.lights = true;
  await walkV(T(8) + 8, T(8) + 6); faceV('up');
  await say('V', '— Van. Tem outro.');
  v.engine = true; await say('Van', '[O motor muda de tom.]');
  await say('V', '— Tem outro, Van. Tinha um cara me olhando. E ele sumiu. Sumiu igual o controle remoto, sabe? E ele me viu. Não me viu de passagem — ele tava me esperando.');
  Audio2.sfx('radio'); await say('Radio', '[O rádio liga. Chia. Não encontra música nenhuma e desliga de novo.]');
  await say('Narr', 'A primeira emoção dele não foi medo. Foi alívio. Alívio absoluto, quente — porque durante dezenove dias ele tinha sido a única coisa daquele tipo no universo inteiro.');
  await say('V', '— Não sou só eu. Van, não sou só eu.');
  v.blink(1); await say('Van', '[Um farol.]');
  await say('V', '— Eu preciso achar ele.');
  v.blink(2); await say('Van', '[Dois faróis. Firmes.]');
  await say('V', '— Como assim não?');
  v.wipe(0.8); await say('Van', '[O limpador passa uma vez, devagar, quase gentil.]');
  await say('Narr', 'Se ele quisesse ser achado, ele não teria sumido.');
  Q.done('outro');
  await fadeOut(1.2);
  await narr(['Levaria mais de um ano até V ver aquele rapaz de novo.', 'Por enquanto V ficou sentado naquele sofá até escurecer, com a certeza nova e maravilhosa de que não estava sozinho.', 'E foi essa certeza — essa, e não a solidão — que fez ele fazer o que fez com o Gustavo três semanas depois.', 'Porque uma pessoa que se acha única tem medo de errar.', 'Uma pessoa que descobre que existem outras começa a achar que alguém em algum lugar já resolveu isso. Que ela só está atrasada.', 'E gente com pressa faz besteira.']);
  Story.nextChapter();
};

// ================================================================ CAP 7 — A CULPA QUE EU PLANTEI
C[7] = async () => {
  G.flags.vanGuardada = true; G.flags.podeSair = false;
  World.load('apto', [T(3), T(8) + 4, 'up']);
  G.fade = 1; UI.setTime('Três semanas depois');
  await UI.chapterCard('Capítulo 7', 'A Culpa Que Eu Plantei', 'Ele conserta Gustavo. Funciona. É esse o problema.');
  await fadeIn(0.8);
  await say('Narr', 'Foi numa quinta-feira, óbvio. Tudo com o Gustavo é numa quinta-feira.');
  await say('Narr', 'Mas antes dela vieram três semanas em que V fez uma coisa que ele nunca tinha feito na vida: planejou.');
  Q.add('plano', 'Quarenta páginas', 'Leia o caderno na mesa: todas as formas de fazer o Gustavo parar de fumar.', true);
  Story.obj('Leia o caderno (mesa)', 'o caderno. Quarenta páginas. Você sabe o que tem na trinta e sete.');
  glow('mesa', true);
  const old = A.mesa;
  A.mesa = async () => {
    if (G.chapter !== 7 || G.flags.leuCaderno) return old();
    glow('mesa', false);
    await Mini.caderno();
    G.flags.leuCaderno = true; note('gustavo');
    Q.done('plano');
    await fadeOut(0.6);
    UI.setTime('Quinta-feira · 21:05'); G.map.dark = 0.55;
    await fadeIn(0.6);
    Audio2.sfx('bell');
    const g = addNPC({ id: 'gustavo', cast: 'Gustavo_casa', x: T(9) + 8, y: T(12) + 6, dir: 'up', name: 'Gustavo', label: 'Gustavo' });
    await say('Narr', 'Na quinta, o Gustavo chegou com pizza e uma história enorme sobre um cliente que tinha ligado às onze da noite de sábado pra reclamar de uma coisa que nem era problema da empresa.');
    await say('Gustavo', '— ...e aí o cara fala: "eu quero falar com o gerente". Às onze da noite, de SÁBADO, cara. Eu sou o gerente de quê? Do meu sofá?');
    floatText(G.player.x, G.player.y - 40, 'haha', 1.4, '#ffd27a');
    await say('Narr', 'Contou a história inteira duas vezes. V riu nas duas.');
    await say('Gustavo', '— ...aí o cara fala: "eu quero falar com o gerente"...');
    floatText(G.player.x, G.player.y - 40, 'haha', 1.4, '#c8b8a0');
    await say('Narr', 'Da segunda vez o riso foi meio falso, e o Gustavo não percebeu.');
    G.flags.pizza = true;
    g.cast = 'Gustavo_fuma';
    g.walkTo(T(3), T(14) + 10, 45).then(() => { g.dir = 'down'; g.smoke = true; });
    Story.obj('Vá até a sacada', 'a sacada.');
    Q.add('quinta', 'Quinta-feira', 'Vá até a sacada com o Gustavo.', true);
    World.triggers.push({ x: T(1), y: T(13) + 4, w: T(4), h: T(2), run: () => A.sacada(), once: true, fired: false });
  };
};
C.c7_sacada = async () => {
  const g = npc('gustavo');
  await walkV(T(2), T(14) + 10); faceV('right'); g.dir = 'left';
  await say('Narr', 'Ficou olhando ele acender. Aquele gesto todo. A mão em concha. O primeiro trago, mais fundo. A fumaça soprada pro lado, longe do amigo.');
  await say('Gustavo', '— Você tá com aquela cara de novo.');
  await say('V', '— Que cara?');
  await say('Gustavo', '— A cara de quem tá pensando em alguma coisa e não vai contar.');
  await say('Narr', 'V sorriu. E era um sorriso genuíno, porque ele amava aquele cara. O que veio a seguir não foi frieza. Foi carinho com uma ferramenta errada na mão.');
  await say('V', '— Gu.');
  await say('Gustavo', '— Oi.');
  await say('V', '— Nada. Deixa.');
  await Mini.mente();
  G.flags.feito = true; G.peso += 3;
  shake(1.5);
  g.smoke = false;
  await say('Narr', 'Levou menos de um segundo e não teve nada visível. V pegou, dentro da cabeça do Gustavo, o gesto de fumar. E colou nele o pai.');
  await say('Narr', 'O corpo dele estremeceu. Gustavo tirou o cigarro da boca no meio do trago e ficou olhando pra ele com uma expressão que V nunca tinha visto no rosto dele em sete anos.');
  await say('V', '— Que foi? — A voz saiu normal. Ele odeia que a voz tenha saído normal.');
  await say('Gustavo', '— Nada. Deu uma coisa esquisita agora. — Ele riu, desconfortável. — Lembrei do meu pai.');
  await say('Narr', 'Gustavo tragou de novo. E dessa vez a cara dele fechou de verdade, e ele apagou o cigarro na beirada da sacada quando ainda faltava mais da metade.');
  await say('Gustavo', '— Cara, que porcaria. Tô ficando velho, é isso. Tô ficando sentimental.');
  await say('Gustavo', '— Você lembra dele? Do meu pai? Ele fumava naquela cadeira lá da varanda. Todo dia. Seis da tarde, cadeira, cigarro. E eu ficava do lado. Eu devia ter uns dez anos. Eu achava aquilo o máximo, sabe? Eu queria ser aquilo.');
  await wait(1);
  await say('Gustavo', '— Aí eu fui ser.');
  await say('Narr', 'V continuou não respondendo, porque não tinha uma única coisa que ele pudesse dizer ali que não fosse mentira.');
  Q.done('quinta');
  await fadeOut(1);
  g.dead = true;
  G.flags.garagem = true;
  World.load('mansao', 'garagem');
  UI.setTime('Onze dias');
  await fadeIn(0.8);
  G.player.x = T(5); G.player.y = T(21); G.player.dir = 'right'; G.player.sitting = true;
  await Mini.celular([
    'cara acho que enjoei de cigarro',
    'juro que tô sentindo gosto de doença',
    'fumei um hoje e passei mal, tipo mal mesmo',
    'to há 4 dias sem',
    'to há 6 dias sem e não tô nem com vontade, isso nunca aconteceu',
    'V eu acho que eu parei',
    'eu acho que eu parei de verdade dessa vez',
    '23:20 — cara eu chorei aqui sozinho igual um idiota',
    'eu não tô entendendo o que aconteceu comigo',
    'mas obrigado por não me encher o saco esses anos todos',
    'sério você foi o único que nunca ficou me cobrando',
  ]);
  const v = G.entities.find(e => e instanceof VanEnt);
  await say('Narr', 'V leu essa mensagem sentado no chão da garagem inventada, encostado no pneu dianteiro da Van, com o rádio desligado. Leu umas seis vezes.');
  await say('V', '— Eu salvei a vida dele.');
  await say('Van', '[O rádio não liga.]');
  await say('V', '— Van. Eu salvei a vida dele. Ele ia morrer aos cinquenta e nove igual o pai, e agora não vai. Isso é objetivamente uma coisa boa.');
  await say('Van', '[Nada.]');
  await say('V', '— Fala alguma coisa.');
  v.lights = true; await wait(0.4); v.lights = false;
  await say('Van', '[Um farol acende. Fraco. E se apaga.]');
  await say('V', '— Eu sei. Eu sei o que eu fiz.');
  await say('V', '— Ele agradeceu por uma coisa que ele não fez. Ele tá orgulhoso de uma força que eu inventei. Aquele "eu consegui parar" que ele vai contar pros filhos — não é dele. É meu. Eu roubei a vitória do cara e dei a vida em troca. E ele nunca vai poder reclamar, porque ele nunca vai saber.');
  await wait(1.2);
  await say('V', '— Eu faria de novo.');
  await say('V', '— ...Essa é a parte que me assusta.', { speed: 26 });
  G.player.sitting = false;
  await fadeOut(1.4);
  await narr(['O Gustavo está vivo. Vale registrar isso.', 'Ele parou de fumar aos trinta e um anos. Casou aos trinta e quatro. Tem uma filha.', 'Continua contando a mesma história três vezes. Continua aparecendo nas quintas.', 'Uma vez, num churrasco, com a filha no colo, ele disse que a coisa que mais tem orgulho na vida', 'foi ter conseguido parar sozinho. Só na base da vontade.', 'V sorriu, brindou com ele, e disse que sempre soube que ele conseguia.', '', 'Essa foi a primeira mentira grande da vida dele.']);
  Story.nextChapter();
};

// ================================================================ CAP 8 — A LIGAÇÃO DAS ONZE E QUARENTA
C[8] = async () => {
  G.flags.vanGuardada = true; G.flags.podeSair = true; G.flags.noiteBar = false; G.flags.garagem = true; G.flags.mansaoCriada = true;
  World.load('rua', 'predio');
  G.fade = 1; UI.setTime('Primavera');
  await UI.chapterCard('Capítulo 8', 'A Ligação das Onze e Quarenta', 'Os quatro meses seguintes foram bons.');
  await fadeIn(0.8);
  await say('Narr', 'Isso precisa ser dito com clareza: teve uma primavera inteira em que V foi, provavelmente, mais feliz do que em qualquer outro momento da vida adulta.');
  await say('Narr', 'Voltou a trabalhar. Era o único lugar onde alguém me falava não, ele diz.');
  await say('Narr', 'E ele criou uma regra: nada que apareça no jornal.');
  await think('Meio segundo. Às vezes é tudo que alguém precisa. E se eu pudesse dar meio segundo a mais pra alguém?');
  Powers.unlock('freeze');
  Q.add('primavera', 'Nada que apareça no jornal', 'Faça coisas pequenas pelas pessoas da rua. (Ajude 3 pessoas.)', true);
  C.c8_setupSide();
  C.c8_list();
};
C.c8_count = () => ['sq_semaforo', 'sq_pipoca', 'sq_diag', 'sq_pizza', 'sq_pipa'].filter(k => G.flags[k]).length;
C.c8_list = () => {
  const n = C.c8_count();
  if (G.flags.barOk) return;
  if (n < 3) {
    Q.upd('primavera', `Coisas pequenas: ${n}/3. Olhe pra rua com atenção [X] — tem gente precisando.`);
    Story.obj(`Nada que apareça no jornal: ${n}/3 pessoas ajudadas`, 'a farmácia, o semáforo, o cartaz do cachorro, a árvore da praça, a moto de entrega. A rua inteira.');
  } else if (!G.flags.noiteBar) {
    Q.done('primavera');
    Q.add('bar', 'Bar do Zeca', 'Encontre Téo e Gustavo no Bar do Zeca, à noite.', true);
    Story.obj('À noite: encontre Téo e Gustavo no Bar do Zeca', 'o bar do Zeca. O Téo vai estar lá. Ele repara nas coisas.');
    Story.cut(async () => {
      await say('Narr', 'Almoçou com a mãe num domingo. Ela fez a marmita — a de verdade — e ele comeu com uma emoção completamente desproporcional.');
      await say('Narr', 'Ela achou que era saudade. Era comparação. A de verdade era pior, tinha sal demais, e ele quase chorou de alívio.');
      await fadeOut(0.8);
      G.flags.noiteBar = true;
      World.load('rua', 'bar');
      UI.setTime('Abril · 21:30');
      await fadeIn(0.8);
    });
  }
};
// missões secundárias da rua (cap. 8)
C.c8_setupSide = () => {};
Story.ruaExtra = mode => {
  if (G.chapter === 8 && mode !== 'night') {
    // ---------- SEMÁFORO
    if (!G.flags.sq_semaforo) {
      const vo = addNPC({ id: 'velhinha', cast: 'SenhoraDiag', x: T(31) + 8, y: T(10) + 10, dir: 'down', name: 'Senhora', lookAtPlayer: false, speed: 9, perceive: 'Atravessa devagar. Sempre atravessou.\nOs carros nunca esperam.' });
      vo.cast = 'Convidado3';
      let started = false;
      World.triggers.push({ x: T(27), y: T(8), w: T(10), h: T(3), once: true, fired: false, when: () => !G.flags.sq_semaforo, run: async () => {
        if (started) return; started = true;
        if (!Q.has('semaforo')) Q.add('semaforo', 'Meio segundo', 'Uma senhora atravessando devagar. Um carro vindo rápido demais. Pare o tempo [F] e feche o semáforo [E].');
        Story.traffic.state = 'red'; Story.traffic.t = 99; Story.traffic.locked = true;
        vo.walkTo(T(31) + 8, T(14) + 2, 9, true);
        await wait(1.8);
        // carro vindo rápido
        const car = new Car({ x: -40, y: T(12) + 10, dirx: 1, speed: 190, color: '#2a2a2e' }); car.override = 190; G.entities.push(car);
        Story.traffic.state = 'green'; for (const id of ['sem1', 'sem2']) World.prop(id).st.state = 'green';
        await wait(0.2);
        await Wait.until(() => car.x > T(14) || G.frozen > 0);
        if (G.frozen <= 0) {
          G.slowmo = 0.25;
          UI.hint('PARE O TEMPO [F]!', 2.5);
          const t0 = G.t;
          await Wait.until(() => G.frozen > 0 || G.t - t0 > 0.9);
          G.slowmo = 0;
        }
        if (G.frozen > 0) {
          UI.hint('Agora: feche o semáforo [E no semáforo].', 3.5);
          World.prop('sem1').act = 'semaforoFechar'; glow('sem1', true);
          G.frozen = 6;
          await Wait.until(() => G.flags.semFechado || G.frozen <= 0);
          glow('sem1', false);
        }
        if (G.flags.semFechado) {
          car.override = 0;
          await Wait.until(() => G.frozen <= 0);
          await wait(1.4);
          await say('Narr', 'Semáforo que fecha meio segundo antes de um carro que vinha rápido demais. O motorista nem entende por que freou.');
          await vo.walkTo(T(31) + 8, T(17) + 6, 9, true);
          vo.say('♥', 2);
          G.flags.sq_semaforo = true; Q.done('semaforo', 'Ninguém nunca vai saber. Do jeito que tem que ser.');
          car.override = undefined; Story.traffic.locked = false; Story.traffic.t = 3;
          C.c8_list();
        } else {
          // falhou: o carro desvia por pouco, a senhora leva um susto
          car.override = 40; shake(3); Audio2.sfx('horn');
          await say('Narr', 'O carro desviou por pouco, buzinando. A senhora ficou parada no meio da faixa, com a mão no peito.');
          await think('Tarde. De novo. — Eu tenho que ser mais rápido.');
          car.override = undefined;
          vo.x = T(31) + 8; vo.y = T(10) + 10; Story.traffic.locked = false; Story.traffic.state = 'green';
          started = false; for (const t of World.triggers) if (t.when && t.run && !G.flags.sq_semaforo) t.fired = false;
        }
      } });
    }
    // ---------- PIPOCA (cachorro sumido)
    if (!G.flags.sq_pipoca) {
      addNPC({ id: 'kauan', cast: 'DonoPipoca', x: T(40) + 8, y: T(9) + 12, dir: 'down', name: 'Kauan', label: '', perceive: 'Nove anos. Não dorme há três noites.\nDeixa a ração no portão todo dia.',
        talk: async () => {
          const dog = G.entities.find(e => e.id === 'pipoca');
          if (dog && dog.follow && U.dist(dog.x, dog.y, npc('kauan').x, npc('kauan').y) < 60) return C.c8_pipocaOk();
          if (!Q.has('pipoca')) Q.add('pipoca', 'Pipoca', 'Um cachorro caramelo sumiu há três dias. Talvez dê pra ver onde ele está se você olhar de verdade [X].');
          await say('Kauan', '— Moço... você viu um cachorro caramelo? Ele chama Pipoca. Ele é muito medroso. Ele fugiu quando teve o rojão.');
        } });
      const dog = new Dog({ id: 'pipoca', x: T(51) + 4, y: T(1) + 12, sit: true, hidden: true, dirx: 1 });
      dog.talk = async () => { if (dog.follow) { await say('Narr', 'Pipoca abana o rabo e encosta na sua perna.'); return; } await say('Narr', 'Um vira-lata caramelo, tremendo, escondido atrás da caçamba. Ele cheira sua mão. E decide confiar.'); Audio2.sfx('bark'); dog.follow = true; dog.emote = '♥'; dog.emoteT = 1.5; Story.obj('Leve o Pipoca até o Kauan (prédio 160)', 'o menino em frente ao prédio 160.'); };
      dog.perceive = 'Pipoca. Assustado. Com fome.\nQuer ir pra casa e não sabe o caminho.';
      G.entities.push(dog);
      Story.on('perceive', () => { const d = G.entities.find(e => e.id === 'pipoca'); if (d && d.hidden && G.map.id === 'rua' && U.dist(G.player.x, G.player.y, d.x, d.y) < 260) { d.hidden = false; UI.hint('Ali — atrás da caçamba, no beco.'); } return false; });
    }
    // ---------- DIAGNÓSTICO
    if (!G.flags.sq_diag) {
      addNPC({ id: 'cida', cast: 'SenhoraDiag', x: T(18) + 8, y: T(9) + 4, dir: 'down', name: 'Dona Cida', label: '', perceive: 'Biópsia. O resultado chega amanhã.\nNão contou pra ninguém da família.',
        talk: async () => {
          if (G.flags.sq_diag) { await say('Senhora', '— Negativo, meu filho. Negativo! A moça da farmácia até me abraçou.'); return; }
          if (!Q.has('diag')) Q.add('diag', 'O envelope', 'Uma senhora na porta da farmácia, segurando um envelope com as duas mãos.');
          await say('Senhora', '— Desculpa, moço, eu tô meio aérea hoje. — Ela aperta o envelope contra o peito. — Coisa de exame. Amanhã sai.');
          if (!G.flags.viuCida) { await think('Olha pra ela de verdade. [X]'); return; }
          await think('Diagnóstico que sai negativo, pra uma senhora que eu nunca vi, num hospital que eu nunca entrei.');
          const i = await choose(['(pensar) Negativo.', 'Isso já é demais. Deixar quieto.']);
          if (i === 1) { await think('Nada grande. Nada que apareça no jornal. ...Isso não ia aparecer no jornal.'); return; }
          G.player.glowT = 1.2; FX.ember(G.player.x, G.player.y - 14, 12); Audio2.sfx('create');
          await say('Narr', 'Nenhuma luz. Nenhum tremor. Só uma coisa, em algum laboratório, que amanhã vai dizer outra coisa.');
          await say('Senhora', '— ...que estranho. Me deu uma paz agora. Do nada. — Ela sorri pela primeira vez.');
          G.flags.sq_diag = true; G.peso += 1; Q.done('diag', 'Ela nunca vai saber que esteve doente.');
          C.c8_list();
        } });
      Story.on('perceive', () => { const c = npc('cida'); if (c && U.dist(G.player.x, G.player.y, c.x, c.y) < 120) G.flags.viuCida = true; return false; });
    }
    // ---------- PIZZAS DO ENTREGADOR
    if (!G.flags.sq_pizza) {
      const e = addNPC({ id: 'entregador', cast: 'Entregador', x: T(56) + 8, y: T(17) + 8, dir: 'left', name: 'Entregador', label: '', perceive: 'Se atrasar mais uma, é desligado do app.\nTem uma filha de dois anos.',
        talk: async () => {
          if (G.flags.sq_pizza) { await say('Entregador', '— Valeu demais, tio! Sério!'); return; }
          if (!Q.has('pizza')) { Q.add('pizza', 'Entrega atrasada', 'A moto caiu e as pizzas se espalharam. Junte as 5 caixas perto da moto [Q], antes que esfriem.'); }
          await say('Entregador', '— Caiu tudo, caiu tudo, ah não... se eu atrasar mais uma eu tô fora do app, tio.');
        } });
      const moto = World.addProp({ t: 'spot', x: T(57), y: T(17) - 8, w: 30, h: 22, id: 'motoCaida' });
      const mdraw = new Custom({ x: T(58), y: T(18) + 2, render(c) { c.save(); c.translate(Math.round(this.x), Math.round(this.y - 14)); c.rotate(-1.2); c.drawImage(Beasts.moto(0), -13, -10); c.restore(); } });
      G.entities.push(mdraw);
      const spots = [[T(53), T(18) + 4], [T(55), T(20) + 6], [T(59), T(21)], [T(61), T(17) + 10], [T(52), T(21) + 8]];
      spots.forEach(([x, y], i) => addItem({ id: 'pizza' + i, type: 'pizza', x, y, z: 0, pizza: true }));
      const check = () => {
        if (G.flags.sq_pizza) return false;
        const near = G.entities.filter(it => it.pizza && !it.dead && U.dist(it.x, it.y, T(58), T(18)) < 34 && G.player.held !== it).length;
        if (near >= 5) {
          G.flags.sq_pizza = true;
          Story.cut(async () => {
            for (const it of G.entities.filter(it => it.pizza)) it.dead = true;
            await say('Entregador', '— Ué... tavam aqui do lado. Todas. Quentinhas ainda! Valeu, tio — sei lá o que você fez, valeu!');
            Q.add('pizza', 'Entrega atrasada', 'A moto caiu e as pizzas se espalharam.'); Q.done('pizza', 'Ele chegou a tempo. A filha dele nem sabe que existiu esse dia.');
            C.c8_list();
          });
        }
        return false;
      };
      Story.on('place', check); Story.on('throw', it => { setTimeout(check, 900); return false; });
    }
    // ---------- PIPA NA ÁRVORE
    if (!G.flags.sq_pipa) {
      CAST.Lucas = CAST.Lucas || Object.assign({}, CAST.Menino, { hair: { style: 'cap', c: ['#2a6ab0', '#3a7ad0', '#5a9ae8', '#8ab8f0'], under: '#2a1a12' }, top: { style: 'tshirt', c: ['#e8e8e8', '#cfcfcf', '#a8a8a8', '#7a7a7a'], print: '#e84a5a' }, smile: false, sad: true });
      addNPC({ id: 'lucas', cast: 'Lucas', x: T(57), y: T(21) + 8, dir: 'up', name: 'Lucas', label: '', perceive: 'A pipa foi o pai que fez.\nO pai mora em outra cidade agora.',
        talk: async () => {
          if (G.flags.sq_pipa) { await say('Menino', '— Eu vou empinar de novo! Mas longe da árvore!', { name: 'Lucas' }); return; }
          if (!Q.has('pipa')) Q.add('pipa', 'A pipa', 'A pipa do Lucas ficou presa no alto da árvore. Talvez dê pra trazer ela de volta com a mente [Q].');
          await say('Menino', '— Ficou presa... foi meu pai que fez. Ele mora em outra cidade agora.', { name: 'Lucas' });
        } });
      const pipa = addItem({ id: 'pipa', type: 'pipa', x: T(56) + 4, y: T(20) + 8, z: 40, suspended: true });
      Story.on('place', it => { if (it.id === 'pipa' && !G.flags.sq_pipa && U.dist(it.x, it.y, T(57), T(21) + 8) < 50) { G.flags.sq_pipa = true; Story.cut(async () => { it.dead = true; await say('Menino', '— Caiu! Ela caiu sozinha! — Ele abraça a pipa como se fosse uma pessoa.', { name: 'Lucas' }); Q.add('pipa', 'A pipa', 'A pipa do Lucas ficou presa no alto da árvore.'); Q.done('pipa', 'Uma pipa de seda e bambu, feita por um pai que mora longe.'); C.c8_list(); }); } return false; });
    }
  }
  if (G.chapter === 8 && mode === 'night' && !G.flags.barOk) {
    const teo = addNPC({ id: 'teo', cast: 'Teo', x: T(31) + 4, y: T(9) + 4, dir: 'right', name: 'Téo', label: 'Téo', lookAtPlayer: false, sitting: true });
    const gus = addNPC({ id: 'gus', cast: 'Gustavo_casa', x: T(32) + 12, y: T(9) + 4, dir: 'left', name: 'Gustavo', label: 'Gustavo', lookAtPlayer: false, sitting: true });
    World.prop('mesaBar').st.beer = true;
    teo.talk = gus.talk = () => C.c8_bar();
    Story.obj('Sente com o Téo e o Gustavo', 'a mesa amarela. Eles já pediram.');
  }
};
A.semaforoFechar = async () => {
  if (G.flags.semFechado) return;
  G.flags.semFechado = true;
  for (const id of ['sem1', 'sem2']) World.prop(id).st.state = 'red';
  Story.traffic.state = 'red';
  G.player.glowT = 1; Audio2.sfx('blip');
  UI.hint('Vermelho. Agora deixa o tempo voltar.');
};
C.c8_pipocaOk = async () => {
  const dog = G.entities.find(e => e.id === 'pipoca'), k = npc('kauan');
  dog.follow = false;
  await say('Kauan', '— PIPOCA!');
  dog.x = k.x + 10; dog.y = k.y + 4; dog.emote = '♥'; dog.emoteT = 3; Audio2.sfx('bark');
  await say('Narr', 'Um cachorro aparece de volta na porta de casa depois de três dias sumido, com uma cara de quem não sabe explicar onde esteve.');
  await say('Kauan', '— Obrigado, moço! Como você achou ele?');
  await say('V', '— Ele que me achou.');
  G.flags.sq_pipoca = true; Q.add('pipoca', 'Pipoca', 'Um cachorro caramelo sumiu há três dias.'); Q.done('pipoca', 'Pipoca está em casa. Kauan dormiu dez horas seguidas.');
  C.c8_list();
};
C.c8_bar = async () => {
  if (G.flags.barOk) return;
  G.flags.barOk = true;
  const teo = npc('teo'), gus = npc('gus');
  G.player.x = T(32); G.player.y = T(9) + 10; G.player.dir = 'up';
  await say('Narr', 'O Téo é da faculdade também, mas de outro grupo. É o mais quieto. Quando junta os três, o Gustavo fala oitenta por cento e o Téo fala uns cinco.');
  await say('Narr', 'E os cinco por cento dele são sempre a melhor coisa da noite.');
  await say('Gustavo', '— ...e o carro quebrou NO MEIO da serra, lembra? E o Téo lá, de óculos escuros, tocando violão no acostamento como se fosse show.');
  await say('Teo', '— Era um bom acostamento.');
  floatText(gus.x, gus.y - 40, 'HAHAHA', 1.5, '#ffd27a');
  await say('Gustavo', '— Vou no banheiro. Ninguém fala nada importante sem mim.');
  gus.sitting = false;
  await gus.walkTo(T(33) + 8, T(8) + 2, 40);
  gus.hidden = true;
  await wait(1);
  await say('Narr', 'O Téo girando o copo na mão e olhando pra mesa em vez de olhar pro V, que é o jeito dele de falar de coisa séria.');
  await say('Teo', '— Cê tá diferente.');
  await say('V', '— Tô?');
  await say('Teo', '— Tá. Desde o começo do ano. Não é ruim. É que cê tá com uma cara de quem tá carregando peso e achando que ninguém percebe.');
  const i = await choose(['— É trabalho.', '(ficar em silêncio)']);
  if (i === 1) { await say('Narr', 'V ficou em silêncio um pouco tempo demais.'); await say('V', '— ...É trabalho.'); }
  else await say('V', '— É trabalho.');
  await say('Narr', 'O Téo levantou os olhos e olhou pra ele por uns dois segundos. E V viu na cara dele — nítido, sem nenhuma dúvida — que ele não acreditou.');
  await say('Teo', '— Tá bom. Quando não for trabalho, cê fala.');
  gus.hidden = false; gus.x = T(33) + 8; gus.y = T(8) + 4;
  await say('Gustavo', '— GENTE. O banheiro do Zeca tem um quadro do Zeca. Pintado. A óleo.');
  await say('Narr', 'O assunto morreu ali.');
  await say('Narr', 'Foi a última conversa séria que eles tiveram.', { speed: 24 });
  note('p8', true); G.flags.nb_p8 = true;
  Q.done('bar');
  await fadeOut(1.2);
  await narr(['Doze de junho. Uma quarta-feira.']);
  G.flags.noiteBar = false;
  World.load('mansao', 'cama');
  UI.setTime('Quarta, 12 de junho · 23:38'); G.map.dark = 0.45;
  for (const id of ['jan1', 'jan2', 'jan3']) World.prop(id).st.mode = 'night';
  World.prop('tvMulti').st.channel = 'other';
  await fadeIn(0.8);
  Q.add('ligacao', 'Doze de junho', 'Deite na cama da Mansão.', true);
  Story.obj('Deite na cama (Mansão)', 'a cama. É só mais uma quarta.');
  glow('camaLux', true);
};
C.c8_ligacao = async () => {
  G.flags.ligacao = true; glow('camaLux', false);
  G.player.x = T(32); G.player.y = T(15); G.player.dir = 'down'; G.player.sitting = true;
  await say('Narr', 'Estava deitado naquela cama absurda, com a TV ligada num documentário sobre uma cidade que não existe, jogando alguma coisa no celular.');
  UI.setTime('Quarta, 12 de junho · 23:40');
  await wait(1);
  Audio2.sfx('ring'); await wait(0.8); Audio2.sfx('ring');
  await say('Narr', 'O celular vibrou no meio do jogo. Era o Gustavo. Gustavo liga às onze e quarenta pra falar besteira. É o horário oficial da besteira dele.');
  await say('V', '— Fala, Gu.');
  await say('Narr', 'Do outro lado teve um som. Não foi uma palavra. Foi um som que V nunca tinha ouvido o Gustavo fazer.');
  G.player.sitting = false;
  await say('Gustavo', '— V. — A voz saiu rasgada. — V, o Téo.');
  await say('V', '— O que que tem o Téo.');
  await say('Gustavo', '— O Téo morreu.');
  Audio2.playSong(null);
  await wait(3);
  await say('Narr', 'Nove segundos de silêncio. Ele conseguia ouvir a respiração do Gustavo se despedaçando do outro lado da linha.');
  await say('Narr', 'E na cabeça dele não tinha luto. Não ainda. Tinha uma única frase, formada inteira, chegando antes de qualquer emoção:');
  await think('Eu conserto.');
  await say('V', '— Gu. Onde. — A própria voz saiu estranhamente calma.');
  await say('Gustavo', '— Na Marechal. Um carro. Ele tava atravessando e o cara... Cara, ele tava indo comprar cerveja. A gente ia jogar hoje.');
  await say('V', '— Ele tá onde agora. O corpo dele. Tá onde.');
  await say('Gustavo', '— Cara... o quê? Que pergunta é essa? ...V, você tá esquisito. Você tá me assustando.');
  await say('V', '— Eu te ligo depois.');
  const v = new VanEnt({ id: 'van', x: T(28), y: T(18), alpha: 0 }); G.entities.push(v);
  for (let i = 0; i <= 20; i++) { v.alpha = i / 20; await Wait.frames(1); }
  v.lights = true; v.engine = true;
  await say('Narr', 'A Van entrou. Não pela porta. Ela simplesmente estava ali, no quarto, com os faróis acesos, o motor num tom que ele nunca tinha ouvido — baixo, contínuo, urgente.');
  Audio2.sfx('radio'); Audio2.sfx('radio');
  await say('Radio', '[Ela liga o rádio. Não toca música. Só chiado. Ela varre a faixa inteira de ponta a ponta e não encontra nada.]');
  await say('Narr', 'Era ela dizendo não sei o que te dizer. E era ela dizendo por favor.');
  await say('V', '— Van.');
  v.blink(2); await say('Van', '[Dois faróis. Forte. Não.]');
  await say('V', '— Eu preciso ir.');
  v.blink(2); await wait(0.8); v.horn();
  await say('Van', '[Dois de novo. E a buzina, uma vez, curta.]');
  await say('V', '— Ele tinha vinte e sete anos. Ele ia casar em novembro. Ele tava indo comprar cerveja.');
  v.blink(2); await say('Van', '[Farol. Duas vezes.]');
  await say('V', '— Eu sei que você não quer. Eu sei que provavelmente é errado, e eu sei que eu não sei o que eu tô fazendo, e eu sei que tem alguma coisa nisso que eu vou pagar depois.');
  await say('V', '— Mas se eu não for, o Téo continua morto. E eu vou ter que acordar amanhã sabendo que eu escolhi isso.');
  v.engine = false; v.lights = false;
  await say('Van', '[O motor da Van desliga. Não em concordância. Em derrota.]');
  Q.done('ligacao');
  await fadeOut(1.5, '#fff');
  await narr(['Do outro lado da porta não era o apartamento dele.', 'Era um corredor de hospital às onze e cinquenta e três da noite,', 'com luz fluorescente e cheiro de desinfetante,', 'e uma porta dupla no fim com uma placa que ele leu duas vezes sem entender na primeira.', '', 'E foi ali, naquele corredor, que o homem que parou um copo com o pensamento numa terça-feira de janeiro', 'deixou de existir.'], { light: true });
  G.fadeColor = '#000';
  await UI.chapterCard('ATO II', 'O Primeiro Segredo', 'Capítulos 9 a 11');
  Story.nextChapter();
};
