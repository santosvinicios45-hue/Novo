// =====================================================================
//  chapters1.js — ATO I, capítulos 1 a 4
// =====================================================================
'use strict';
const C = Story.chapters;

// ================================================================ CAP 1 — O COPO
C[1] = async () => {
  G.flags.podeSair = false;
  World.load('apto', [T(3) + 4, T(4) + 2, 'up']);
  UI.setTime('Terça-feira · 07:19');
  UI.hud(false);
  G.fade = 1;
  await narr(['O copo caiu numa terça-feira, às sete e dezenove da manhã,', 'e essa é a parte da história que ninguém nunca vai acreditar quando ele contar.', 'Não a parte de sair do multiverso. Não a parte do imperador. Não a parte dos coelhos.', 'A parte do copo.']);
  await UI.chapterCard('Capítulo 1', 'O Copo', 'Uma terça-feira qualquer');
  await fadeIn(1.2);
  UI.hud(true);
  await think('Café. Preciso de café antes de qualquer coisa.');
  // o copo escorrega da mão molhada
  const copo = addItem({ id: 'copo', type: 'copo', x: G.player.x + 2, y: G.player.y - 8, z: 18, fragile: true });
  copo.vz = 20; copo.vy = 26;
  await Wait.until(() => copo.z < 5);
  copo.suspended = true; copo.vy = 0; copo.z = 4; copo.suspendDrop = true;
  G.fx.pin = 1; Audio2.sfx('freeze'); shake(1);
  await wait(1.2);
  await say('Narr', 'Ele viu o copo sair da mão. Viu o movimento inteiro, aquele instante esticado em que a gente já sabe que não dá tempo e mesmo assim tenta.');
  await say('Narr', 'E o copo parou. Não desacelerou. Parou, a quinze centímetros do chão, com uma gota d\'água suspensa logo abaixo da borda.');
  await say('Narr', 'Como se alguém tivesse cravado um alfinete no tempo e deixado o resto pendurado ali.');
  await think('...Eu não tomei café ainda.');
  await think('Será que eu tô tendo um AVC? Li num post que gente tendo AVC sente cheiro de torrada queimada.');
  G.player.say = null; floatText(G.player.x, G.player.y - 40, '*fareja*', 1.5);
  await wait(1.2);
  await think('Não tem cheiro de torrada. Tem cheiro de café que eu ainda nem fiz. O que é menos tranquilizador do que eu gostaria.');
  copo.useLabel = 'Cutucar o copo com o dedo';
  copo.use = () => C.c1_cutucar();
  Story.obj('Agache e cutuque o copo (E)', 'cutuca. Com o dedo. Do jeito que a gente se aproxima de um cachorro que não conhece.');
};
C.c1_cutucar = async () => {
  const copo = item('copo');
  copo.useLabel = null;
  await say('Narr', 'Aí ele fez a coisa mais humana possível. Se agachou, com muito cuidado, e cutucou o copo com o dedo.');
  G.fx.pin = 0;
  copo.suspended = false; copo.suspendDrop = false; copo.z = 4; copo.vz = -90;
  await Wait.until(() => copo.broken);
  copo.tk = false;
  G.flags.copoQuebrado = true;
  await wait(0.6);
  floatText(G.player.x, G.player.y - 40, 'HAHAHA', 2, '#ffd27a');
  Audio2.tone(300, 0.1, 'square', 0.05); Audio2.tone(320, 0.1, 'square', 0.05, 0.15); Audio2.tone(290, 0.1, 'square', 0.05, 0.3);
  await say('Narr', 'E V riu. Riu alto, sozinho, na cozinha, às sete e vinte da manhã.');
  await think('Eu acabei de fazer o tempo parar... e estraguei tudo com o dedo indicador. Como um idiota.');
  Story.obj('Pegue a vassoura (atrás da porta do banheiro)', 'a vassoura. Atrás da porta do banheiro. Onde você nunca lembra de guardar direito.');
  glow('vassoura', true);
};
C.c1_vassoura = async () => {
  glow('vassoura', false);
  G.flags.querDesfazer = true;
  await say('Narr', 'Foi só quando ele foi pegar a vassoura que a coisa se tornou séria.');
  await think('Aqueles pedacinhos que vão parar debaixo da geladeira e reaparecem seis meses depois na sola do pé...');
  await think('Eu queria que isso não tivesse acontecido.');
  Powers.unlock('undo');
  Story.obj('Volte até os cacos e DESFAÇA [R]', 'chega perto dos cacos e pensa: isso não aconteceu. [R]');
  const copo = item('copo');
  copo.history = [];
  // o "desfazer" do copo: devolve inteiro na pia
  Story.on('undo', () => {
    const c = item('copo');
    if (!c || !c.broken || U.dist(G.player.x, G.player.y, c.x, c.y) > 90) return false;
    Story.off('undo');
    Story.cut(C.c1_desfeito);
    return true;
  });
};
C.c1_desfeito = async () => {
  const copo = item('copo');
  Audio2.sfx('undo'); G.fx.rewind = 1; G.player.glowT = 1;
  FX.burst(copo.x, copo.y - 2, 14, '#8fd8ff', 30, 0.6);
  copo.rewinding = 0; copo.history = [];
  await wait(0.4);
  copo.rewinding = 0; copo.history = [];
  copo.broken = false; copo.vx = copo.vy = copo.vz = 0; copo.x = T(3) + 8; copo.y = T(2) + 10; copo.z = 8; copo.suspended = true; copo.tk = false;
  FX.burst(copo.x, copo.y - 8, 10, '#8fd8ff', 20, 0.6);
  G.stats.desfeitos++;
  await wait(0.6);
  await say('Narr', 'E não tinha acontecido. O copo estava na pia. Inteiro. Com a marca da etiqueta velha ainda meio descascada de um lado.');
  await say('Narr', 'O chão estava seco. A vassoura continuava encostada atrás da porta do banheiro.');
  await say('Narr', 'Dessa vez ele não riu.');
  await fadeOut(0.6);
  G.player.x = T(2) + 4; G.player.y = T(5) + 8; G.player.dir = 'down'; G.player.sitting = true;
  await fadeIn(0.8);
  Audio2.sfx('heart');
  await say('Narr', 'Ele sentou no chão da cozinha, encostou a nuca no armário de baixo, e ficou ali por muito tempo.');
  await say('Narr', 'É a sensação de estar sentado numa cadeira que você usou a vida inteira e descobrir, de repente, que ela nunca teve pernas. Que ela estava flutuando esse tempo todo.');
  await say('Narr', 'E que ninguém te avisou.');
  G.player.sitting = false;
  await think('...Sobe.');
  Powers.unlock('tk');
  G.flags.copoNaPia = true;
  copo.tk = true;
  Story.obj('Levante o copo com a mente [Q], depois pouse [E]', 'olha pro copo e pensa: sobe. [Q] perto dele. Depois [E] pra pousar.');
  let lifted = false;
  Story.on('lift', it => { if (it.id === 'copo' && !lifted) { lifted = true; Story.cut(async () => { await say('Narr', 'O copo subiu. Ficou pairando na altura do peito dele, girando devagar, e a luz da janela atravessou o vidro e jogou um retângulo tremido na parede.'); Story.obj('Desce. Pouse o copo [E]', 'agora pensa: desce. [E]'); }); } return false; });
  Story.on('place', it => { if (it.id === 'copo' && lifted) { Story.off('place'); Story.off('lift'); Story.cut(async () => { await wait(0.4); await say('V', '— Ok. Ok. Ok.'); await say('Narr', 'Ele disse em voz alta, porque o silêncio estava ficando insuportável.'); Story.obj('Abra a geladeira. Faça uma coisa normal.', 'a geladeira. Abrir e fechar. A coisa mais normal do mundo.'); glow('geladeira', true); }); } return false; });
  Story.on('throw', it => { if (it.id === 'copo') Story.cut(async () => { await wait(0.8); if (it.broken) await think('...Ótimo. Pelo menos eu sei consertar. [R]'); }); return false; });
};
C.c1_testes = async () => {
  glow('geladeira', false);
  G.flags.testes = true;
  await say('Narr', 'Ele passou o resto do dia sem trabalhar. Fazendo a única coisa que a natureza dele permitia numa situação daquelas: testando.');
  await say('Narr', 'Porque V nunca foi o tipo de pessoa que recua. Ele é do tipo que enfia o dedo na tomada pra ver como é.');
  Q.add('dia1', 'Coisas que eu consigo fazer (dia 1)', 'Mandar mensagem pro chefe · entortar a colher · o controle remoto · a luz do abajur · uma laranja.', true);
  addItem({ id: 'colher', type: 'colher', x: T(2) + 10, y: T(6) + 4, z: 10, suspended: true });
  addItem({ id: 'controle', type: 'controle', x: T(10) + 8, y: T(9) + 6, z: 6, suspended: true, tk: false, useLabel: 'Pegar o controle remoto', use: () => A.controle() });
  glow('mesa', true); glow('abajur', true);
  C.c1_checklist();
  Story.on('lift', it => {
    if (it.id === 'colher' && !G.flags.colherOk) Story.cut(async () => { it.broken = true; Audio2.tone(400, 0.3, 'sine', 0.06, 0, null, 0.6); await say('Narr', 'Fez a colher entortar.'); await wait(0.5); it.broken = false; Audio2.tone(240, 0.3, 'sine', 0.06, 0, null, 1.6); await say('Narr', 'E desentortar.'); G.flags.colherOk = true; C.c1_checklist(); });
    return false;
  });
  Story.on('c1check', () => { C.c1_checklist(); return false; });
};
A.controle = async () => {
  if (G.chapter !== 1 || G.flags.controleOk) { await say('Narr', 'O controle remoto. Pilhas fracas.'); return; }
  const c = item('controle');
  await think('Atravessa a sala.');
  FX.burst(c.x, c.y - 4, 10, ['#ffb347', '#2a221e'], 30, 0.4); Audio2.sfx('blink');
  c.x = T(2) + 4; c.y = T(11); c.useLabel = null;
  FX.burst(c.x, c.y - 4, 10, ['#ffb347', '#ffd27a'], 30, 0.4);
  await say('Narr', 'O controle remoto apareceu do outro lado sem percorrer o caminho. O que ele achou muito mais assustador do que se tivesse voado.');
  await think('...E se eu fizer isso comigo?');
  Powers.unlock('blink');
  Story.obj('Desloque-se pela sala [Shift]', 'aperta [Shift] andando. Você aparece do outro lado.');
  Story.on('blink', () => { if (!G.flags.controleOk) { G.flags.controleOk = true; Story.cut(async () => { await wait(0.3); await say('V', '— Isso é muito errado. — Ele está sorrindo.'); C.c1_checklist(); }); } return false; });
};
C.c1_checklist = () => {
  const f = G.flags;
  const done = [f.chefe, f.colherOk, f.controleOk, f.abajurOk, f.laranjaOk].filter(Boolean).length;
  const mk = v => v ? '■' : '□';
  if (f.chefe) glow('mesa', false);
  if (f.abajurOk) glow('abajur', false);
  Q.upd('dia1', `${mk(f.chefe)} mensagem pro chefe · ${mk(f.colherOk)} colher · ${mk(f.controleOk)} controle remoto · ${mk(f.abajurOk)} abajur · ${mk(f.laranjaOk)} laranja`);
  Story.obj(`Testes do dia 1: ${done}/5 — ${mk(f.chefe)}chefe ${mk(f.colherOk)}colher ${mk(f.controleOk)}controle ${mk(f.abajurOk)}abajur ${mk(f.laranjaOk)}laranja`,
    !f.chefe ? 'o notebook na mesa. Avisa o chefe.' : !f.colherOk ? 'a colher na mesa. Levanta ela [Q].' : !f.controleOk ? 'o controle remoto no sofá.' : !f.abajurOk ? 'o abajur do lado do sofá.' : 'você tá com fome. Uma laranja seria bom.');
  if (done === 4 && !f.laranjaOk && !f.laranjaUnlock) {
    f.laranjaUnlock = true;
    Story.cut(async () => {
      await think('Tô com fome. Uma laranja seria bom.');
      G.flags.cria_laranja = true; Powers.unlock('create');
      Story.obj('Crie uma laranja [C] e coma [E]', 'pensa numa laranja. [C]. Depois come [E].');
      Story.on('create', it => {
        if (it.type !== 'laranja' || G.flags.laranjaOk) return false;
        it.useLabel = 'Comer a laranja'; it.tk = true;
        it.use = () => Story.cut(async () => {
          it.dead = true;
          await say('Narr', 'Ele passou quinze minutos olhando a laranja com uma desconfiança profunda. De onde é que ela tinha vindo, exatamente?');
          await say('Narr', 'Comeu a laranja. Era boa. Era laranja demais — como se alguém tivesse pego a ideia de laranja e feito uma fruta a partir dela.');
          await say('Narr', 'Perfeita de um jeito levemente errado.');
          G.flags.laranjaOk = true; C.c1_checklist();
        });
        return false;
      });
    });
  }
  if (done === 5 && !f.dia1ok) {
    f.dia1ok = true;
    Q.done('dia1');
    Story.cut(async () => {
      note('dia1');
      await say('Narr', 'Ele anotou tudo num caderno, porque anotar era outra coisa normal. A letra estava tremida.');
      await say('Narr', 'E foi ali, olhando aquela lista curta e ridícula — copo, colher, laranja, luz — que ele teve o primeiro pensamento que valeria o peso de tudo que veio depois.');
      await think('E se não for só copo?');
      Story.obj('Vá até a janela', 'a janela da sala.');
      glow('janela', true);
    });
  }
};
C.c1_janela = async () => {
  G.flags.janela1 = true; glow('janela', false);
  G.player.dir = 'up';
  await say('Narr', 'Porque se a realidade era negociável naquela cozinha, ela era negociável em todo lugar.');
  await say('Narr', 'E se ela era negociável em todo lugar, então tudo que era errado no mundo passava a ser, de alguma forma que ele ainda não sabia medir, um problema dele.');
  await fadeOut(1);
  await narr(['Lá embaixo a rua estava fazendo exatamente o que ruas fazem:', 'um cachorro puxando uma pessoa, uma moto de entrega subindo na calçada,', 'uma senhora conferindo se trouxe a chave.', 'Oito bilhões de pessoas fazendo suas terças-feiras.', 'Um homem de vinte e seis anos, com a testa encostada no vidro e uma laranja perfeita no estômago,', 'pensando que a partir daquela manhã ele nunca mais ia poder dizer:', '"não tinha nada que eu pudesse fazer."']);
  Story.nextChapter();
};

// ================================================================ CAP 2 — TESTES DOMÉSTICOS
C[2] = async () => {
  World.load('apto', 'start');
  G.fade = 1; UI.setTime('Dia 2 · manhã');
  await UI.chapterCard('Capítulo 2', 'Testes Domésticos', 'No terceiro dia ele quase se apagou.');
  await fadeIn(0.8);
  await say('Narr', 'Ele avisou no trabalho que ia tirar a semana. Desligou o interfone. Celular no silencioso.');
  await say('Narr', 'E se trancou nos quarenta e dois metros quadrados com um caderno, três canetas e a coisa mais perigosa do universo: uma pessoa curiosa sem supervisão.');
  G.flags.d2 = true;
  Q.add('dia2', 'Dia 2', 'A metodologia é horrível: pensar numa coisa, ver se acontece, anotar.', true);
  C.c2_list();
  Story.on('d2task', () => { C.c2_list(); return false; });
  // ideia da parede transparente
  setTimeout(() => { if (G.chapter === 2 && !G.flags.parede) Story.cut(async () => { await think('E se eu conseguisse ver através das coisas?'); Powers.unlock('perceive'); C.c2_list(); }); }, 1500);
  Story.on('perceive', () => {
    if (G.chapter !== 2 || G.flags.parede || G.map.id !== 'apto') return false;
    G.flags.parede = true;
    Story.cut(async () => {
      G.fx.vizinho = 1;
      await wait(1.2);
      shake(2); Audio2.sfx('deny');
      await say('V', '— AH! NÃO! NÃO, NÃO, NÃO—');
      G.perceive = 0; G.fx.vizinho = 0;
      await say('Narr', 'Fez a parede da sala ficar transparente e viu, do outro lado, o quarto do vizinho. E o vizinho de cueca.');
      await say('Narr', 'Desfez tudo em pânico com uma velocidade que ele não sabia que tinha.');
      note('nunca');
      C.c2_list();
    });
    return true;
  });
};
C.c2_list = () => {
  const f = G.flags, mk = v => v ? '■' : '□';
  const n = [f.parede, f.agua, f.voo].filter(Boolean).length;
  Q.upd('dia2', `${mk(f.parede)} ver através da parede [X] · ${mk(f.agua)} mudar o gosto da água (pia) · ${mk(f.voo)} voar (no meio da sala)`);
  Story.obj(`Dia 2: ${n}/3 — ${mk(f.parede)}parede [X] ${mk(f.agua)}água ${mk(f.voo)}voar`, !f.parede ? 'olhar através da parede. [X] perto da parede da esquerda.' : !f.agua ? 'a pia. Que gosto teria água com gosto de outra coisa?' : 'voar. No meio da sala, em cima do tapete.');
  if (!f.voo && !World.prop('spotVoo')) World.addProp({ t: 'spot', x: T(8) + 8, y: T(6) + 4, w: 48, h: 28, id: 'spotVoo', act: 'voar' });
  if (n === 3 && !f.d2done) {
    f.d2done = true; Q.done('dia2');
    Story.cut(async () => {
      UI.setTime('Dia 2 · noite');
      G.map.dark = 0.6;
      await say('Narr', 'Foi nesse dia que ele começou a falar sozinho de verdade. Do jeito de quem precisa de companhia e não tem.');
      await say('V', '— Se eu contar pra alguém, eu não desconto. Não tem como contar isso pra alguém e a pessoa continuar te olhando igual.');
      await say('Narr', 'O teto não respondeu, o que ele achou justo.');
      Story.obj('Vá dormir (cama, no quarto)', 'cama. Amanhã é outro dia.');
    });
  }
};
A.voar = async () => {
  if (G.chapter !== 2 || G.flags.voo) return;
  World.removeProp('spotVoo');
  await think('...Voar.');
  const p = G.player; p.dir = 'down';
  G.player.glowT = 2;
  const y0 = p.y;
  for (let i = 0; i < 40; i++) { p.y -= 1.2; FX.ember(p.x, p.y - 4, 2); await Wait.frames(1); }
  shake(4); Audio2.sfx('bump');
  for (let i = 0; i < 6; i++) floatText(p.x + U.rand(-10, 10), p.y - 44 + U.rand(-4, 4), '✦', 1.2, '#ffe9a8');
  await wait(0.3);
  for (let i = 0; i < 20; i++) { p.y += 2.4; await Wait.frames(1); }
  p.y = y0;
  await say('Narr', 'Tentou voar. Conseguiu. Bateu a cabeça no teto com força suficiente pra ver estrelas.');
  await fadeOut(0.4); p.x = T(10) + 6; p.y = T(10) + 6; p.dir = 'down'; p.sitting = true; await fadeIn(0.4);
  await say('V', '— Isso é humilhante. — Dez minutos deitado no sofá, com uma bolsa de gelo na testa, falando pro apartamento vazio.');
  p.sitting = false;
  G.flags.voo = true; C.c2_list();
};
C.c2_noite = async () => {
  await fadeOut(1);
  G.flags.d3 = true;
  UI.setTime('Dia 3 · meio-dia');
  G.map.dark = 0;
  G.player.x = T(18); G.player.y = T(5) + 8; G.player.dir = 'down';
  await narr(['Dia 3.', 'Ele acordou irritado. Não tinha motivo.', 'Tinha aquela sensação chata de estar desperdiçando alguma coisa enorme com brincadeira de criança.', 'Ao meio-dia, ele decidiu fazer um teste sério.']);
  await fadeIn(0.8);
  await think('Se eu consigo desfazer o copo quebrado, eu consigo desfazer eventos. Não coisas — eventos. Até onde?');
  Q.add('dia3', 'Um teste sério', 'Sente no sofá. Uma coisa pequena: a cicatriz no joelho esquerdo.', true);
  Story.obj('Sente no sofá. Um teste sério.', 'o sofá. Uma coisa pequena. A cicatriz do joelho.');
  glow('sofa', true);
};
C.c2_cicatriz = async () => {
  glow('sofa', false);
  G.flags.cicatriz = true;
  G.player.x = T(10) + 4; G.player.y = T(10) + 4; G.player.dir = 'down'; G.player.sitting = true;
  await say('Narr', 'Uma cicatriz no joelho esquerdo, de quando tinha nove anos e caiu da bicicleta do primo na rua de trás da casa da avó.');
  await think('Isso nunca aconteceu.');
  Audio2.sfx('tear'); shake(3);
  await say('Narr', 'A cicatriz sumiu. Mas junto com ela sumiu a tarde. Sumiu a bicicleta do primo. Sumiu o primo, por um instante.');
  await say('Narr', 'Ele estava puxando um fio e o mundo inteiro estava vindo junto.');
  await say('Narr', 'V gritou. E nesse som tinha a coisa que salvou tudo: pânico puro, emoção crua, exatamente o combustível que os poderes dele entendiam.');
  let ok = false;
  while (!ok) {
    ok = await Mini.memoria();
    if (!ok) await say('Narr', 'A linha escapou. Não. NÃO. De novo — segura. SEGURA.');
  }
  G.player.sitting = false;
  G.flags.cicatrizOk = true;
  await fadeIn(0.1);
  G.player.x = T(10); G.player.y = T(11) + 4; G.player.dir = 'down'; G.player.sitting = true;
  await say('Narr', 'E desabou no chão da sala. Ficou ali o suficiente pra luz da janela mudar de ângulo e atravessar a sala inteira.');
  await say('Narr', 'A cicatriz estava de volta no joelho. Ele passou o polegar nela, devagar, umas vinte vezes.');
  await say('Narr', 'E chorou. Sem drama, sem soluço, só aquele tipo de choro cansado que vem depois do susto.');
  await say('V', '— Eu quase apaguei a minha vó. Por causa de uma cicatriz.');
  note('avo');
  Q.done('dia3');
  G.player.sitting = false;
  UI.setTime('Dia 3 · noite'); G.map.dark = 0.65;
  Story.obj('Vá pra cama', 'deita. Pensa. (Ou tenta não pensar.)');
};
C.c2_fim = async () => {
  G.flags.fimc2 = true;
  G.player.x = T(19) + 4; G.player.y = T(4); G.player.dir = 'down';
  await say('Narr', 'Aquela noite foi a primeira vez que ele pensou em parar. Sério mesmo.');
  const i = await choose(['Parar. Nunca mais usar nada disso.', 'Continuar.'], { prompt: 'Acordar amanhã, voltar pro trabalho, e deixar tudo trancado num armário mental até morrer?' });
  if (i === 0) {
    await say('Narr', 'Era uma opção real. Era, provavelmente, a opção mais segura que já esteve disponível pra qualquer ser humano na história.');
    await say('Narr', 'E ele ficou uns bons quarenta minutos com ela na mão, virando de um lado e do outro, procurando o encaixe.');
  }
  await say('Narr', 'O problema é que ele já sabia demais. Cada coisa horrível que passa na tela deixa de ser tragédia e vira pergunta.');
  await think('Se eu não fizer nada, e alguém morrer, e eu podia ter feito — o que é que eu sou?');
  await fadeOut(1.4);
  await narr(['E às três e pouco da manhã ele disse, baixinho, pra ninguém:', '— Eu prefiro carregar a culpa de ter feito.', '', 'Ele não sabia, naquela hora, que estava dizendo a frase da vida dele.', 'Precisava de regras. De limites. Precisava, mais do que qualquer coisa, de alguém pra conversar.', 'E foi assim, por pura solidão, que ele criou a Van.']);
  Story.nextChapter();
};

// ================================================================ CAP 3 — A VAN
C[3] = async () => {
  World.load('apto', [T(19), T(5) + 4, 'down']);
  G.fade = 1; UI.setTime('Sábado · 06:30');
  G.flags.vanGuardada = true; // ainda não existe
  World.load('apto', [T(19), T(5) + 4, 'down']);
  await UI.chapterCard('Capítulo 3', 'A Van', 'Era pra ser uma brincadeira.');
  await fadeIn(0.8);
  await say('Narr', 'Sábado. Acordar num sábado, pra V, sempre teve uma textura específica, herdada de quando ele tinha oito anos e descia pra sala às seis e meia com uma tigela de leite com achocolatado.');
  Q.add('sabado', 'Sábado de manhã', 'Achocolatado. Sofá. Desenho.', true);
  Story.obj('Faça um achocolatado (geladeira)', 'a geladeira. Leite. Achocolatado.');
  glow('geladeira', true);
};
C.c3_van = async () => {
  glow('geladeira', false);
  G.flags.vanCriada = true;
  const p = G.player; p.x = T(10) + 4; p.y = T(10) + 4; p.dir = 'up'; p.sitting = true;
  await say('Narr', 'Ele amava aquele desenho com uma devoção que nunca conseguiu explicar. Não era pelos mistérios. Era pela van.');
  await say('Narr', 'Era pelo fato de que aquelas pessoas tinham um lugar que era delas e que andava. Que no fim, qualquer que fosse a bagunça, eles subiam naquela van e iam embora juntos.');
  await think('Seria engraçado se eu tivesse a van.');
  Audio2.sfx('tear'); G.fx.wobble = 2; shake(3);
  await wait(0.6);
  G.flags.vanGuardada = false;
  const van = new VanEnt({ id: 'van', x: T(7), y: T(6) + 10, alpha: 0 });
  G.entities.push(van);
  for (let i = 0; i <= 30; i++) { van.alpha = i / 30; await Wait.frames(1); }
  p.sitting = false;
  await say('Narr', 'Ela apareceu na sala. Não do lado de fora, no estacionamento, onde faria sentido. Na sala.');
  await say('Narr', 'A sala tinha três metros por quatro, e a van tinha cinco metros e meio. O cérebro reclama, mas a imagem não cede.');
  await say('Narr', 'Ele encostou a mão no capô. Estava quente. Não de motor. Quente do jeito que um animal dormindo é quente.');
  await walkV(T(9) + 14, T(6) + 13);
  faceV('left');
  await wait(0.5);
  van.lights = true; Audio2.sfx('lights');
  await say('V', '— Ah, não. Ah, não, não, não. O que foi que eu fiz.');
  van.blink(2); await wait(0.9);
  await say('V', '— Você tá... você tá me ouvindo?');
  van.blink(1); await say('Van', '[Um farol. Uma vez.]');
  await say('V', '— Isso é sim?');
  van.blink(1); await say('Van', '[Um farol.]');
  await say('V', '— E dois é não?');
  van.blink(2); await say('Van', '[Dois piscos.]');
  await say('V', '— Espera, então dois é sim ou você tá dizendo que dois é não?');
  van.wipe(5); await say('Van', '[Ela liga o limpador de para-brisa e o deixa correndo por uns cinco segundos.]');
  await say('Narr', 'O que V, com o tempo, aprenderia a traduzir como uma forma bastante clara de dizer: você é burro.');
  floatText(p.x, p.y - 40, 'haha', 1.5, '#ffd27a');
  await say('Narr', 'Ele riu. E alguma coisa dentro do peito dele afrouxou de um jeito que ele não sentia havia dias.');
  p.sitting = true;
  await say('V', '— Certo. Certo. Oi.');
  van.blink(1); await say('Van', '[Um farol.]');
  await say('V', '— Eu sou o V.');
  van.blink(1); await say('Van', '[Um farol.]');
  await say('V', '— Você tem nome?');
  await wait(1.5);
  van.radio = true; Audio2.sfx('radio'); Audio2.playSong('van');
  await say('Radio', '[O rádio liga sozinho, chia entre estações, e para numa música antiga, dessas que tocam em posto de gasolina de madrugada, com muito eco e pouca pressa.]');
  await wait(1);
  await say('V', '— Tá bom. Sem nome, então. Você é a Van.');
  van.blink(1); await say('Van', '[Um farol.]');
  p.sitting = false;
  Powers.unlock('van');
  note('p1', true); G.flags.nb_p1 = true;
  Q.done('sabado');
  await say('Narr', 'Você não criou uma amiga — Rayan diria anos depois. Você ficou tão sozinho que a realidade sentiu pena.');
  Q.add('vanQ', 'A Van', 'Converse com ela. Faróis pra sim e não. Rádio pra humor. Limpador pra ironia.', true);
  Story.obj('Converse com a Van (E perto dela) — e à noite, durma nela', 'eu tô aqui. [farol]');
  Story.vanTalkOverride = async () => {
    const v = item('van') || G.entities.find(e => e instanceof VanEnt);
    const opts = ['Você quer que eu te dê uma voz?', 'O que você acha de tudo isso?', 'Já é noite. Posso dormir aí dentro?'];
    const i = await choose(opts, { prompt: 'A Van liga os faróis quando você se aproxima.' });
    if (i === 0) {
      v.engine = false; v.radio = false; Audio2.playSong('apto');
      await say('Van', '[Ela desliga o motor. Simplesmente desliga, e fica em silêncio total por quase um minuto.]');
      await say('V', '— Ok. Ok, entendi. Desculpa.');
      v.blink(1); await say('Van', '[Ela liga de novo, e o farol pisca uma vez. Não era um não de rejeição. Era um não de quem já está inteiro.]');
      G.flags.v1 = true;
    } else if (i === 1) {
      v.wipe(1.2); await say('Van', '[Limpador. Uma passada.]');
      await say('V', '— É. Eu também acho.');
      G.flags.v2 = true;
    } else {
      if (!G.flags.v1 && !G.flags.v2) { v.blink(2); await say('Van', '[Dois faróis. Ainda não é noite. Conversa comigo primeiro.]'); return; }
      return C.c3_dormir();
    }
  };
};
C.c3_dormir = async () => {
  const v = G.entities.find(e => e instanceof VanEnt);
  await fadeOut(0.8);
  UI.setTime('Sábado · 23:00'); G.map.dark = 0.7; v.lights = false;
  G.player.hidden = true;
  await fadeIn(0.8);
  await say('Narr', 'Na primeira noite, ele dormiu dentro dela. Sentado no banco de trás, com as pernas dobradas, contando pra ela os testes da semana.');
  await say('Narr', 'Contou o joelho inteiro. Contou a avó sumindo. Contou o pânico e o grito e as duas horas no chão.');
  await say('V', '— Desculpa. É que não tem ninguém.');
  v.radio = true; Audio2.playSong('mansao');
  await say('Radio', '[O rádio liga. Baixinho. Uma coisa lenta, sem letra. E o estofado do banco, que era duro e velho, fica macio.]');
  await say('Narr', 'Ele chorou de novo pela segunda vez em uma semana, e dessa vez não teve nada de assustado nem de cansado. Foi só alívio.');
  await say('Narr', 'Ela deixou. Não fez barulho, não piscou farol, não tentou consertar. Só ficou quente, e ligada, e ali.');
  await fadeOut(1.4);
  Q.done('vanQ');
  await narr(['De todas as coisas que V fez com o poder dele —', 'as que salvaram mundos, as que reescreveram civilizações, as que ele esconde e as que ele defende —', 'essa é a única que ele nunca, em nenhum momento, sob nenhuma pressão, se arrependeu de ter feito.']);
  G.player.hidden = false;
  Story.nextChapter();
};

// ================================================================ CAP 4 — GUSTAVO
C[4] = async () => {
  G.flags.vanGuardada = true;
  World.load('apto', 'sofa');
  G.fade = 1; UI.setTime('Quinta-feira · 20:40'); G.map.dark = 0.55;
  await UI.chapterCard('Capítulo 4', 'Gustavo', 'O amigo que fuma na sacada.');
  await fadeIn(0.8);
  await say('Narr', 'A Van estava guardada num cantinho dobrado da realidade. V tinha esquecido completamente que era quinta.');
  await say('Narr', 'Quinta era dia do Gustavo.');
  Audio2.sfx('bell'); await wait(0.6);
  const g = addNPC({ id: 'gustavo', cast: 'Gustavo', x: T(9) + 8, y: T(13) + 6, dir: 'up', name: 'Gustavo', label: 'Gustavo' });
  G.player.dir = 'down';
  await g.walkTo(T(9) + 8, T(11) + 4, 40, true);
  await say('Gustavo', '— Cara, você sumiu.');
  await say('Narr', 'Gustavo disse isso da porta, com uma sacola de mercado numa mão e o celular na outra. E entrou, porque Gustavo sempre entrou nos lugares como se já tivesse morado neles.');
  const i1 = await choose(['— Eu não sumi.', '— Desculpa, Gu. Foi uma semana estranha.']);
  if (i1 === 0) await say('V', '— Eu não sumi. — num tom que ele mesmo achou pouco convincente.');
  else await say('V', '— Desculpa, Gu. Foi uma semana... estranha.');
  await say('Gustavo', '— Você não respondeu nada a semana inteira. Eu liguei três vezes. Achei que você tinha morrido. Falei com a Bia, ó: se ele morreu, eu fico com o videogame.');
  await g.walkTo(T(3), T(4) + 8, 45);
  g.dir = 'up';
  await say('Gustavo', '— Cara, cadê os copos? Tem um copo na pia. Um. — Pausa. — Por que só tem um copo na pia?');
  await say('Narr', 'V abriu a boca e fechou. Ele estava, pela primeira vez em uma semana, na presença de alguém que não sabia.');
  g.cast = 'Gustavo_casa';
  await g.walkTo(T(10) + 12, T(10) + 4, 45);
  g.dir = 'up'; g.sitting = true;
  Audio2.tone(180, 0.25, 'sawtooth', 0.03);
  await say('Narr', 'Ele sentou no sofá, no lado que rangia, e o sofá rangeu, e ele fez a mesma cara que fazia toda quinta há sete anos.');
  await say('Gustavo', '— Você tá esquisito. Tá com a cara de quem foi demitido. Você foi demitido?');
  await say('V', '— Não.');
  await say('Gustavo', '— Terminou com alguém que eu não sabia que existia?');
  await say('V', '— Não.');
  await say('Gustavo', '— Tá devendo?');
  await say('V', '— Gustavo.');
  await say('Gustavo', '— Tô só listando. Você que não fala nada, então eu tenho que adivinhar.');
  await say('Narr', 'Gustavo é o tipo de amigo que aparece. Apareceu no dia em que o pai de V foi internado, e ficou no corredor do hospital até as quatro da manhã comprando café de máquina a cada quarenta minutos porque não sabia o que mais fazer com as mãos.');
  await say('Narr', 'E fuma. Desde os dezessete. O pai do Gustavo morreu de enfisema aos cinquenta e nove. O Gustavo tem trinta e um.');
  g.sitting = false;
  await say('Gustavo', '— Vou fumar um. Vem?');
  G.flags.gusChegou = true;
  g.cast = 'Gustavo_fuma';
  g.walkTo(T(3), T(14) + 10, 45).then(() => { g.dir = 'down'; g.smoke = true; });
  Q.add('sacada', 'A sacada', 'Vá com o Gustavo até a sacada, como sempre.', true);
  Story.obj('Vá com o Gustavo até a sacada', 'a sacada. Como sempre.');
  World.triggers.push({ x: T(1), y: T(13) + 4, w: T(4), h: T(2), run: () => A.sacada(), once: true, fired: false });
};
C.c4_sacada = async () => {
  G.flags.sacada4 = true;
  const g = npc('gustavo');
  await walkV(T(2), T(14) + 10); faceV('right');
  g.dir = 'left';
  await say('V', '— Como é que tá o trabalho?');
  await say('Gustavo', '— Uma bosta. Meta subiu de novo. Cortaram dois da equipe e distribuíram a carteira pro resto. Sabe o que o cara falou na reunião? Falou que é uma oportunidade.');
  await say('V', '— Oportunidade.');
  g.dir = 'down';
  await say('Gustavo', '— Oportunidade. — Ele soltou a fumaça pro lado, longe do V, como sempre fazia. — Eu ia matar esse cara. Sério. Ia matar com as minhas mãos e ia dormir bem.');
  await say('Narr', 'Essa gentileza pequena e automática de sete anos — a fumaça soprada pro lado — entrou no peito de V naquela noite de um jeito que nunca tinha entrado.');
  g.perceive = 'Fuma há 14 anos. Um maço e meio nas fases ruins.\nNos últimos dois anos, só fase ruim.\nTentou parar 4 vezes. A mais longa: 19 dias.';
  Story.obj('Olhe pra ele de verdade [X]', 'olha pra ele. De verdade. [X]');
  await Wait.until(() => G.perceive > 0);
  await wait(2.5);
  await say('Narr', 'Olhou o cigarro. Os dedos manchados. Olhou o pescoço dele, e imaginou, sem querer imaginar, o que estava acontecendo três centímetros abaixo daquela pele, célula por célula, todo dia, há catorze anos.');
  await think('Eu posso consertar isso.');
  await say('Narr', 'Não era vaidade. Era, na cabeça de V naquele instante, simplesmente amor com uma ferramenta nova na mão.');
  await think('O pulmão de um garoto de dezesseis anos. Levaria menos esforço do que fazer a laranja. Mas ele ia continuar fumando.');
  await think('Fazer o cigarro ter gosto ruim? Ele troca de marca. Vai achar que perdeu o paladar. Vai ao médico assustado à toa.');
  await think('Então tirar o desejo. Direto. Ir na cabeça e desligar a vontade.');
  await say('Narr', 'E foi aí que V parou. Porque tirar a vontade não é mexer no cigarro. É mexer no Gustavo.');
  await say('Gustavo', '— Você tá me olhando esquisito.');
  await say('V', '— Desculpa. Cansado.');
  await say('Gustavo', '— Se tiver alguma coisa, você fala.');
  await say('V', '— Falo.');
  await say('Gustavo', '— Fala mesmo. Não fala não. — Ele apontou o cigarro pro V. — Você faz sempre isso. Você resolve tudo sozinho e depois conta quando já acabou. E aí eu fico feito um idiota que só ficou sabendo do final.');
  await say('Narr', 'Um vendedor de trinta e um anos com um cigarro na mão acabou de descrever com precisão absoluta o defeito central do amigo dele.');
  await say('V', '— Não tem nada, Gustavo.');
  Q.done('sacada');
  g.smoke = false; g.cast = 'Gustavo_casa';
  await fadeOut(0.6);
  g.x = T(10) + 12; g.y = T(10) + 4; g.dir = 'up'; g.sitting = true;
  G.player.x = T(10); G.player.y = T(10) + 4; G.player.dir = 'up'; G.player.sitting = true;
  const tv = World.prop('tv'); tv.st.on = true; tv.st.channel = 'game';
  await fadeIn(0.6);
  await say('Narr', 'Eles voltaram pra dentro. Videogame até uma da manhã.');
  const r = await Mini.pong();
  if (r.won) {
    await say('Gustavo', '— Esse controle tá com problema. Sério. O analógico tá puxando pra esquerda.');
    await say('Gustavo', '— ...É a TV. Tem delay nessa TV. — ...É a internet.');
    await say('Narr', 'V riu tanto numa dessas que teve que pausar o jogo.');
  } else {
    await say('Gustavo', '— HÁ! Sete anos esperando por isso! SETE ANOS!');
    await say('Narr', 'Gustavo comemorou como se fosse final de Copa. V deixou. Era bom ver ele assim.');
  }
  G.player.sitting = false; g.sitting = false; tv.st.on = false;
  await fadeOut(0.6);
  UI.setTime('Sexta · 01:04');
  G.player.x = T(9) + 8; G.player.y = T(11) + 2; G.player.dir = 'down';
  g.x = T(9) + 8; g.y = T(12) + 10; g.dir = 'up';
  await fadeIn(0.6);
  await say('Narr', 'Foi uma quinta-feira boa. Uma das últimas simples.');
  await say('Gustavo', '— Ó. Sério agora.');
  await say('V', '— Oi.');
  await say('Gustavo', '— Se você tiver com alguma coisa na cabeça. Qualquer coisa. Eu não vou entender, provavelmente. Mas eu escuto.');
  const i = await choose([{ t: '— Senta aí que eu preciso te contar uma coisa.', fade: 2.2 }, { t: '— Valeu, Gu.' }], { prompt: '' });
  if (i === 0) {
    await say('Narr', 'V abriu a boca. E a frase estava ali, inteira. Ele sentiu o formato dela na língua.');
    await say('Narr', 'Nada saiu.');
  }
  await say('Narr', 'Existia ali, naquele corredor, uma versão inteira dessa história em que V conta, e o Gustavo vê a Van, e grita, e passa a noite fazendo perguntas idiotas e maravilhosas, e a partir dali V nunca mais está sozinho com aquilo.');
  await say('Narr', 'Essa versão existiu. Durou dois segundos.');
  await say('V', '— Valeu, Gu. Semana que vem?');
  await say('Gustavo', '— Semana que vem.');
  await g.walkTo(T(9) + 8, T(14) + 6, 40, true);
  g.dead = true; Audio2.sfx('door');
  await wait(1);
  await think('Se eu posso salvar a vida dele, e eu não salvo — o que é que eu sou?');
  await fadeOut(1.2);
  Story.nextChapter();
};
