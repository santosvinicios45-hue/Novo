// =====================================================================
//  minigames.js — sequências especiais
// =====================================================================
'use strict';

const Mini = {
  // texto nítido no canvas de alta resolução
  text(str, x, y, o = {}) {
    const c = UI.hctx, s = UI.hscale;
    c.save();
    c.font = `${o.bold ? 'bold ' : ''}${Math.round((o.size || 8) * s)}px ${o.font || '"Pixelify Sans", "VT323", monospace'}`;
    c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
    c.globalAlpha = o.alpha ?? 1;
    if (o.shadow !== false) { c.fillStyle = 'rgba(0,0,0,.7)'; c.fillText(str, x * s + s, y * s + s); }
    c.fillStyle = o.color || '#fff';
    c.fillText(str, x * s, y * s);
    c.restore();
  },
  start(m) { return new Promise(res => { m.resolve = v => { if (m.cleanup) m.cleanup(); G.mini = null; res(v); }; G.mini = m; }); },

  // ================================================================ segurar (E)
  hold(label, secs, still) {
    let t = 0;
    return this.start({
      overlay: true,
      update(dt) {
        const [ax, ay] = Input.axis();
        if ((ax || ay) && !still) { this.resolve(false); return; }
        if (Input.held('act')) { t += dt; if (Math.random() < 0.3) FX.ember(G.player.x, G.player.y - 14); if (Math.floor(t * 2) !== Math.floor((t - dt) * 2)) Audio2.sfx('heart'); }
        else t = Math.max(0, t - dt * 0.6);
        if (t >= secs) { Audio2.sfx('select'); this.resolve(true); }
        if (Input.hit('back')) this.resolve(false);
      },
      draw() {
        const x = Math.round(G.player.x - G.cam.x), y = Math.round(G.player.y - G.cam.y - 44);
        ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke();
        ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (t / secs)); ctx.stroke();
      },
      drawText() { Mini.text(label, W / 2, H - 52, { size: 8, color: '#ffe9c8' }); },
    });
  },

  // ================================================================ cap. 2 — segurar a linha
  memoria() {
    Audio2.playSong('memoria');
    const cx = 240, cy = 150;
    const FR = [
      { k: 'bike', label: 'A bicicleta do primo' }, { k: 'primo', label: 'O primo' }, { k: 'casa', label: 'A casa da avó' },
      { k: 'avo', label: 'A avó' }, { k: 'cafe', label: 'O café coado no pano' }, { k: 'sol', label: 'A tarde de 2009' },
    ].map((f, i) => Object.assign(f, { a: i / 6 * Math.PI * 2 + 0.3, r: 46, out: 0, lost: 0, grab: 0 }));
    Mini._memTries = (Mini._memTries || 0) + 1;
    const ease = Math.max(0.45, 1 - (Mini._memTries - 1) * 0.2); // fica mais fácil a cada tentativa
    let ret = { x: cx, y: cy - 30 }, t = 0, dur = 30, scream = 0, fail = false, done = false, endT = 0, sh = 0;
    const DMAX = 108;
    const avo = Sprites.human('Avo', CAST.Avo || (CAST.Avo = Object.assign({}, CAST.MaeTeo, { skin: ['#f0cba8', '#d6ad8a', '#ad856a'], top: { style: 'dress', c: ['#8a6a9a', '#705080', '#563c64', '#3e2a48'] }, sad: false, smile: true, glasses: '#6a5a4a' })));
    const primo = Sprites.human('Primo', CAST.Primo || (CAST.Primo = Object.assign({}, CAST.Menino, { hair: { style: 'curly', c: ['#2a1a12', '#3e2a1c', '#5e412c', '#7d583c'] }, top: { style: 'tshirt', c: ['#e85a5a', '#c44444', '#8c2f2f', '#5a1f1f'] } })));
    const vs = Sprites.human('V', CAST.V);
    const drawIcon = (f, x, y, alpha) => {
      ctx.globalAlpha = alpha;
      const R = (a, b, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x + a), Math.round(y + b), w, h); };
      if (f.k === 'bike') { ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x - 8, y + 4, 6, 0, 7); ctx.arc(x + 8, y + 4, 6, 0, 7); ctx.stroke(); R(-8, -2, 16, 2, '#c84a3a'); R(-2, -6, 2, 8, '#c84a3a'); R(6, -6, 4, 2, '#3a2a1a'); }
      else if (f.k === 'primo') ctx.drawImage(primo.down[Math.floor(t * 4) % 4], Math.round(x - 11), Math.round(y - 20));
      else if (f.k === 'avo') ctx.drawImage(avo.down[0], Math.round(x - 11), Math.round(y - 22));
      else if (f.k === 'casa') { R(-14, -6, 28, 18, '#e8d8c0'); ctx.fillStyle = '#b05a3a'; ctx.beginPath(); ctx.moveTo(x - 17, y - 6); ctx.lineTo(x, y - 18); ctx.lineTo(x + 17, y - 6); ctx.fill(); R(-4, 2, 8, 10, '#6a4a34'); R(6, -2, 6, 5, '#7aa8c8'); }
      else if (f.k === 'cafe') { R(-6, -4, 12, 10, '#f4f0e8'); R(-5, -4, 10, 2, '#5a3a2a'); R(6, -2, 3, 5, '#f4f0e8'); for (let i = 0; i < 3; i++) R(-3 + i * 3, -10 - Math.sin(t * 3 + i) * 2, 1, 4, 'rgba(255,255,255,.6)'); }
      else if (f.k === 'sol') { ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t; R(Math.cos(a) * 13 - 1, Math.sin(a) * 13 - 1, 2, 2, '#ffd27a'); } }
      ctx.globalAlpha = 1;
    };
    return this.start({
      kind: 'memoria', get fr() { return FR; }, get ret() { return ret; },
      update(dt) {
        if (done || fail) { endT += dt; if (endT > 1.6) { Audio2.playSong(G.map ? G.map.music : null); this.resolve(done); } return; }
        t += dt; scream = Math.max(0, scream - dt); sh = Math.max(0, sh - dt * 8);
        const [ax, ay] = Input.axis();
        ret.x = U.clamp(ret.x + ax * 210 * dt, 10, W - 10); ret.y = U.clamp(ret.y + ay * 210 * dt, 10, H - 10);
        if (Input.hit('act') && scream <= 0) {
          scream = 5; sh = 5; Audio2.sfx('tear'); Audio2.tone(140, 0.6, 'sawtooth', 0.12, 0, null, 0.6);
          for (const f of FR) if (!f.gone) f.r = Math.max(30, f.r - 32);
        }
        const k = t / dur;
        for (const f of FR) {
          if (f.gone) continue;
          f.a += dt * (0.15 + Math.sin(t + f.a) * 0.05);
          const speed = (4 + k * 10 + Math.sin(t * 1.7 + f.a * 3) * 2) * ease;
          const fx = cx + Math.cos(f.a) * f.r * 1.7, fy = cy + Math.sin(f.a) * f.r;
          f.x = fx; f.y = fy;
          f.grab = U.dist(ret.x, ret.y, fx, fy) < 24;
          if (f.grab) { f.r = Math.max(28, f.r - 85 * dt); if (Math.random() < 0.4) FX.ember(fx - G.cam.x + G.cam.x, fy); }
          else f.r += speed * dt;
          if (f.r > DMAX) { f.lost += dt; if (f.lost > 2.2) { fail = true; Audio2.sfx('glass'); } }
          else f.lost = Math.max(0, f.lost - dt * 2);
        }
        if (t >= dur) { done = true; Mini._memTries = 0; Audio2.sfx('questDone'); }
      },
      draw() {
        const k = U.clamp(t / dur, 0, 1);
        const ox = sh ? U.rand(-sh, sh) : 0, oy = sh ? U.rand(-sh, sh) : 0;
        ctx.save(); ctx.translate(ox, oy);
        // quintal da avó em sépia
        ctx.fillStyle = '#d8c09a'; ctx.fillRect(-10, -10, W + 20, H + 20);
        ctx.fillStyle = '#c8a878'; ctx.fillRect(-10, 110, W + 20, H);
        ctx.fillStyle = '#b89868'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 53) % W, 120 + (i * 31) % 150, 3, 1);
        ctx.fillStyle = 'rgba(120,80,40,.25)'; ctx.fillRect(330, 40, 90, 70); ctx.fillStyle = 'rgba(140,60,30,.3)'; ctx.beginPath(); ctx.moveTo(320, 40); ctx.lineTo(375, 10); ctx.lineTo(430, 40); ctx.fill();
        ctx.strokeStyle = 'rgba(80,60,40,.4)'; ctx.beginPath(); ctx.moveTo(40, 60); ctx.lineTo(200, 66); ctx.stroke();
        // linha do mundo: limite
        ctx.strokeStyle = 'rgba(120,40,30,.35)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.ellipse(cx, cy, DMAX * 1.7, DMAX, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        // fios
        for (const f of FR) {
          if (f.gone || f.x === undefined) continue;
          const strain = U.clamp(f.r / DMAX, 0, 1);
          ctx.strokeStyle = f.grab ? '#ffb347' : `rgb(${120 + strain * 120},${90 - strain * 60},${60 - strain * 30})`;
          ctx.lineWidth = f.grab ? 2 : 1;
          ctx.beginPath(); ctx.moveTo(cx, cy - 10);
          ctx.quadraticCurveTo((cx + f.x) / 2 + Math.sin(t * 6 + f.a) * strain * 8, (cy + f.y) / 2, f.x, f.y); ctx.stroke();
        }
        // V no centro
        drawChar(ctx, vs.down[0], cx, cy, true);
        ctx.globalAlpha = 0.3 + Math.sin(t * 5) * 0.1; ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.arc(cx, cy - 12, 16, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        for (const f of FR) if (!f.gone && f.x !== undefined) drawIcon(f, f.x, f.y, f.lost ? 0.4 + Math.sin(t * 20) * 0.3 : 1);
        // retícula
        ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ret.x, ret.y, 10 + Math.sin(t * 8), 0, 7); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.fillRect(ret.x - 1, ret.y - 1, 2, 2);
        ctx.restore();
        // desbotamento (o mundo sumindo)
        const worst = Math.max(...FR.map(f => f.r / DMAX));
        ctx.fillStyle = `rgba(250,246,240,${U.clamp((worst - 0.6) * 1.2, 0, 0.6)})`; ctx.fillRect(0, 0, W, H);
        if (fail) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, endT)})`; ctx.fillRect(0, 0, W, H); }
        if (done) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, endT)})`; ctx.fillRect(0, 0, W, H); }
        // barra
        ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(140, 12, 200, 6); ctx.fillStyle = '#ffb347'; ctx.fillRect(141, 13, 198 * k, 4);
      },
      drawText() {
        Mini.text('SEGURE A TARDE DE 2009', W / 2, 26, { size: 7, color: '#5a3a20', shadow: false, bold: true });
        for (const f of FR) if (!f.gone && f.x !== undefined && (f.grab || f.lost)) Mini.text(f.label, f.x, f.y - 26, { size: 6, color: f.lost ? '#c33' : '#3a2a1a', shadow: false });
        Mini.text('Mova a vontade até as memórias pra puxá-las de volta · E = GRITAR (pânico puxa tudo)', W / 2, H - 10, { size: 5.5, color: '#3a2a1a', shadow: false });
        if (scream > 0) Mini.text(`grito: ${Math.ceil(scream)}s`, W - 40, 26, { size: 5.5, color: '#7a4a2a', shadow: false });
        if (t < 3) Mini.text('Ele estava puxando um fio e o mundo inteiro estava vindo junto.', W / 2, 50, { size: 7, color: '#3a2a1a', shadow: false, alpha: 1 - t / 3 });
      },
    });
  },

  // ================================================================ videogame com o Gustavo
  pong() {
    let py = 135, gy = 135, bx = 240, by = 135, vx = -120, vy = 40, sp = 0, sg = 0, t = 0, pause = 1, end = 0;
    const lines = ['— Isso foi sorte.', '— Esse controle tá com problema.', '— É a TV. Tem delay nessa TV.', '— ...É a internet.'];
    let msg = '', msgT = 0;
    Audio2.playSong('arcade');
    return this.start({
      update(dt) {
        t += dt; msgT -= dt;
        if (end) { end += dt; if (end > 2) { Audio2.playSong(G.map.music); this.resolve({ won: sp > sg }); } return; }
        if (Input.hit('back')) { sp = 4; end = 1; return; }
        const [, ay] = Input.axis();
        py = U.clamp(py + ay * 150 * dt, 70, 200);
        // Gustavo: reflexo atrasado, piora conforme perde
        const target = by + Math.sin(t * 2) * 16;
        gy += U.clamp(target - gy, -1, 1) * (95 - sp * 8) * dt; gy = U.clamp(gy, 70, 200);
        if (pause > 0) { pause -= dt; return; }
        bx += vx * dt; by += vy * dt;
        if (by < 64 || by > 206) { vy = -vy; by = U.clamp(by, 64, 206); Audio2.sfx('blip'); }
        if (vx < 0 && bx < 104 && bx > 96 && Math.abs(by - py) < 16) { vx = Math.abs(vx) * 1.06; vy = (by - py) * 6; Audio2.sfx('select'); }
        if (vx > 0 && bx > 376 && bx < 384 && Math.abs(by - gy) < 16) { vx = -Math.abs(vx) * 1.06; vy = (by - gy) * 6; Audio2.sfx('select'); }
        if (bx < 80) { sg++; bx = 240; by = 135; vx = 120; vy = 30; pause = 1; Audio2.sfx('deny'); msg = '— HÁ!'; msgT = 1.5; }
        if (bx > 400) { sp++; bx = 240; by = 135; vx = -120; vy = -30; pause = 1; Audio2.sfx('quest'); msg = lines[Math.min(sp - 1, 3)]; msgT = 2; }
        if (sp >= 4 || sg >= 4) end = 0.01;
      },
      draw() {
        ctx.fillStyle = '#0d0b0a'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#18181a'; ctx.fillRect(70, 50, 340, 170); ctx.fillStyle = '#1e3a24'; ctx.fillRect(76, 56, 328, 158);
        for (let y = 60; y < 210; y += 8) { ctx.fillStyle = '#2e5a36'; ctx.fillRect(239, y, 2, 4); }
        ctx.fillStyle = '#e8e4da'; ctx.fillRect(96, py - 14, 5, 28); ctx.fillStyle = '#f08a6a'; ctx.fillRect(380, gy - 14, 5, 28);
        ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(bx) - 2, Math.round(by) - 2, 4, 4);
        ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let y = 56; y < 214; y += 2) ctx.fillRect(76, y, 328, 1);
      },
      drawText() {
        Mini.text(`V  ${sp}  ×  ${sg}  GUSTAVO`, W / 2, 38, { size: 9, bold: true, color: '#e8e4da' });
        if (msgT > 0) Mini.text(msg, 380, 236, { size: 7, color: '#f08a6a' });
        Mini.text('↑↓ mover · primeiro a 4 · Esc pular', W / 2, H - 12, { size: 5.5, color: '#888' });
        if (end) Mini.text(sp > sg ? 'Gustavo perdeu quatro seguidas.' : 'Gustavo venceu!', W / 2, 135, { size: 10, bold: true });
      },
    });
  },

  // ================================================================ Estrada 2 (fliperama)
  runner() {
    let x = 0, vy = 0, y = 0, t = 0, speed = 120, obs = [], next = 1, over = 0, best = G.flags.recordeEstrada || 0;
    Audio2.playSong('arcade');
    return this.start({
      update(dt) {
        if (over) { over += dt; if (over > 1.5 && (Input.hit('act') || Input.hit('back'))) { Audio2.playSong(G.map.music); const s = Math.floor(x / 10); if (s > best) G.flags.recordeEstrada = s; this.resolve(s); } return; }
        if (Input.hit('back')) { over = 2; return; }
        t += dt; speed = 120 + t * 4; x += speed * dt;
        if ((Input.hit('act') || Input.hit('up')) && y <= 0) { vy = 190; Audio2.sfx('blip'); }
        vy -= 520 * dt; y = Math.max(0, y + vy * dt); if (y === 0) vy = Math.max(0, vy);
        next -= dt;
        if (next <= 0) { next = U.rand(0.7, 1.6) * (140 / speed) * 1.3; obs.push({ x: W + 10, k: Math.random() < 0.6 ? 'cone' : 'buraco' }); }
        for (const o of obs) o.x -= speed * dt;
        obs = obs.filter(o => o.x > -20);
        for (const o of obs) if (o.x > 60 && o.x < 92 && y < (o.k === 'cone' ? 11 : 4)) { over = 0.01; Audio2.sfx('bump'); shake(3); }
      },
      draw() {
        ctx.fillStyle = '#101830'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#e85a8a'; ctx.beginPath(); ctx.arc(360, 120, 40, Math.PI, 0); ctx.fill();
        for (let i = 0; i < 6; i++) { ctx.fillStyle = '#101830'; ctx.fillRect(320, 92 + i * 6, 80, 2); }
        ctx.fillStyle = '#2a1a4a'; for (let i = 0; i < 8; i++) { const mx = ((i * 90 - x * 0.2) % 720 + 720) % 720 - 60; ctx.beginPath(); ctx.moveTo(mx, 170); ctx.lineTo(mx + 50, 120); ctx.lineTo(mx + 100, 170); ctx.fill(); }
        ctx.fillStyle = '#1a1a2a'; ctx.fillRect(0, 170, W, 100);
        for (let i = 0; i < 12; i++) { ctx.fillStyle = '#f5c542'; ctx.fillRect(((i * 50 - x) % 600 + 600) % 600 - 50, 205, 24, 3); }
        for (const o of obs) { if (o.k === 'cone') { ctx.fillStyle = '#f08a3a'; ctx.beginPath(); ctx.moveTo(o.x, 190); ctx.lineTo(o.x + 5, 176); ctx.lineTo(o.x + 10, 190); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(o.x + 3, 183, 4, 2); } else { ctx.fillStyle = '#05050a'; ctx.beginPath(); ctx.ellipse(o.x + 8, 190, 10, 3, 0, 0, 7); ctx.fill(); } }
        ctx.drawImage(Beasts.van(true, 0), 0, 0, 66, 40, 60, 160 - y, 33, 20);
      },
      drawText() {
        Mini.text('ESTRADA 2', W / 2, 30, { size: 12, bold: true, color: '#5ee' });
        Mini.text(`${Math.floor(x / 10)} m   (recorde ${best})`, W / 2, 48, { size: 7, color: '#fd4' });
        Mini.text('E / ↑ pular · Esc sair', W / 2, H - 12, { size: 5.5, color: '#889' });
        if (over) Mini.text(Math.floor(x / 10) >= 1000 ? 'FIM. (o final é ruim)' : 'BATEU — E pra sair', W / 2, 120, { size: 10, bold: true });
      },
    });
  },

  // ================================================================ caderno (cap. 7)
  caderno() {
    const pages = [
      { h: 'Opção 1 — Curar o pulmão.', b: 'Não resolve nada, só compra tempo pro dano recomeçar. Além disso: se em cinco anos o Gustavo fizer um exame e o médico disser que os pulmões dele são de um adolescente, o que acontece?', st: 'REJEITADA' },
      { h: 'Opção 2 — Estragar o gosto.', b: 'Ele troca de marca, depois acha que está doente, depois vai ao médico. Cria mais medo do que soluciona.', st: 'REJEITADA' },
      { h: 'Opção 3 — Fazer o cigarro sumir do mundo.', b: 'isso não é o Gustavo, isso é um bilhão de pessoas.', st: 'REJEITADA', angry: true },
      { h: 'Opção 4 — Contar a verdade e pedir pra ele parar.', b: '~~não funciona.~~ não funciona. já pedi. todo mundo já pediu. ele já pediu pra ele mesmo.\n\n(Quatro tentativas. A mais longa durou dezenove dias.)', st: 'REJEITADA' },
      { h: 'Opção 5 — Fazer com que ele não queira mais.', b: 'Nulidade de lógica. Manipulação de ideias.\nEu não mudo a memória. Não mudo a personalidade. Não implanto ordem nenhuma. Mexo numa conexão: pego duas coisas que estavam soltas na cabeça de alguém e colo uma na outra. O cérebro faz o resto sozinho.\n\nA pessoa não sente nada mudando. A pessoa sente que sempre pensou assim.', st: '' },
      { h: 'Página 37', b: 'se eu fizer isso ele não vai saber que eu fiz. e ele vai me agradecer. e eu vou ter que aceitar o agradecimento.', st: '', small: true },
    ];
    let i = 0;
    const box = $('#caderno');
    const render = () => {
      const p = pages[i];
      box.innerHTML = `<div class="paper ${p.small ? 'small' : ''}"><div class="pnum">${i + 1} / ${pages.length}</div><h3>${p.h}</h3><p class="${p.angry ? 'angry' : ''}">${p.b.replace(/~~(.+?)~~/g, '<s>$1</s>').replace(/\n/g, '<br>')}</p>${p.st ? `<div class="stamp">${p.st}</div>` : ''}</div><p class="tip">← → virar a página · E ${i === pages.length - 1 ? 'fechar o caderno' : 'próxima'}</p>`;
      box.className = 'show';
      Audio2.noise(0.2, 0.05, 3000, 'highpass');
    };
    render();
    return this.start({
      overlay: true, hideWorld: false, cleanup() { box.className = ''; },
      update() {
        if (Input.hit('right') || (Input.hit('act') && i < pages.length - 1)) { Input.consume('act'); if (i < pages.length - 1) { i++; render(); } }
        else if (Input.hit('left')) { if (i > 0) { i--; render(); } }
        else if (Input.hit('act') && i === pages.length - 1) { box.className = ''; this.resolve(true); }
      },
      draw() { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H); },
    });
  },

  // ================================================================ cap. 7 — manipulação de ideias
  mente() {
    Audio2.playSong('luto');
    const nodes = [
      { k: 'fumar', t: 'o gesto de fumar', x: 110, y: 140, src: true },
      { k: 'pai', t: 'o pai', x: 370, y: 128, target: true },
      { k: 'varanda', t: 'varanda, seis da tarde', x: 300, y: 70, mem: 'A cadeira. O cigarro. Um menino de dez anos achando aquilo o máximo.' },
      { k: 'hospital', t: 'hospital', x: 410, y: 210, mem: 'Os últimos oito meses. O barulho do oxigênio.' },
      { k: 'vontade', t: 'vontade de parar', x: 200, y: 215, mem: 'Dezenove dias. No vigésimo, a ligação às onze da noite.' },
      { k: 'quinta', t: 'quinta-feira', x: 200, y: 60, mem: 'Sete anos de quintas. Comida ruim. Ficar até tarde.' },
      { k: 'V', t: 'o V', x: 80, y: 60, mem: '"Você resolve tudo sozinho e depois conta quando já acabou."' },
      { k: 'trabalho', t: 'trabalho', x: 70, y: 220, mem: 'Uma oportunidade.' },
      { k: 'bia', t: 'a Bia', x: 280, y: 180, mem: 'Ela odeia o cheiro. Nunca disse.' },
    ];
    nodes.forEach(n => { n.ox = n.x; n.oy = n.y; n.ph = Math.random() * 6; });
    const src = nodes[0], tgt = nodes[1];
    let cur = { x: src.x, y: src.y }, t = 0, hold = 0, done = false, endT = 0, memT = 0, memText = '';
    return this.start({
      update(dt) {
        t += dt;
        for (const n of nodes) { n.x = n.ox + Math.sin(t * 0.6 + n.ph) * 6; n.y = n.oy + Math.cos(t * 0.5 + n.ph) * 5; }
        if (done) { endT += dt; if (endT > 2.2) { Audio2.playSong(G.map.music); this.resolve(true); } return; }
        const [ax, ay] = Input.axis();
        cur.x = U.clamp(cur.x + ax * 120 * dt, 10, W - 10); cur.y = U.clamp(cur.y + ay * 120 * dt, 10, H - 10);
        memT -= dt;
        for (const n of nodes) if (n.mem && U.dist(cur.x, cur.y, n.x, n.y) < 18 && memText !== n.mem) { memText = n.mem; memT = 3.5; Audio2.tone(330, 0.4, 'sine', 0.05); }
        const onT = U.dist(cur.x, cur.y, tgt.x, tgt.y) < 18;
        if (onT && Input.held('act')) { hold += dt; if (Math.floor(hold * 2.5) !== Math.floor((hold - dt) * 2.5)) Audio2.sfx('heart'); }
        else hold = Math.max(0, hold - dt * 1.5);
        if (hold >= 2.4) { done = true; Audio2.sfx('tear'); shake(2); }
      },
      draw() {
        ctx.fillStyle = '#07060c'; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(${120 + (i % 3) * 40},${90 + (i % 5) * 20},200,${0.15 + 0.1 * Math.sin(t + i)})`; ctx.fillRect((i * 97 + t * 3) % W, (i * 53) % H, 1, 1); }
        // ligações naturais entre ideias
        ctx.strokeStyle = 'rgba(160,140,220,.12)'; ctx.lineWidth = 1;
        const L = (a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
        L(nodes[1], nodes[2]); L(nodes[1], nodes[3]); L(nodes[0], nodes[4]); L(nodes[5], nodes[6]); L(nodes[0], nodes[7]); L(nodes[8], nodes[0]);
        // fio sendo puxado
        const k = hold / 2.4;
        ctx.strokeStyle = done ? '#ffb347' : `rgba(255,${180 - k * 80},${90 - k * 60},.9)`; ctx.lineWidth = done ? 3 : 1 + k * 2;
        ctx.beginPath(); ctx.moveTo(src.x, src.y);
        const ex = done ? tgt.x : cur.x, ey = done ? tgt.y : cur.y;
        ctx.quadraticCurveTo((src.x + ex) / 2, (src.y + ey) / 2 - 30, ex, ey); ctx.stroke();
        for (const n of nodes) {
          const r = n.src || n.target ? 9 : 6;
          ctx.fillStyle = n.src ? '#c8c8c8' : n.target ? '#d8b070' : (n.k === 'V' || n.k === 'quinta') ? '#f0a070' : '#8a7ab8';
          ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(n.x, n.y, r + 6 + Math.sin(t * 2 + n.ph) * 2, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.fill();
        }
        // a Van no canto: dois faróis
        const on = Math.floor(t * 2.2) % 5 < 2 && (Math.floor(t * 4.4) % 2 === 0);
        ctx.fillStyle = on ? '#fff6c2' : '#333'; ctx.fillRect(W - 24, H - 18, 5, 4); ctx.fillRect(W - 14, H - 18, 5, 4);
        ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.arc(cur.x, cur.y, 3 + Math.sin(t * 8), 0, 7); ctx.fill();
        if (done) { ctx.fillStyle = `rgba(255,236,200,${Math.max(0, 0.8 - endT * 0.5)})`; ctx.fillRect(0, 0, W, H); }
      },
      drawText() {
        for (const n of nodes) Mini.text(n.t, n.x, n.y - 15, { size: n.src || n.target ? 7 : 6, color: n.src ? '#eee' : n.target ? '#f0d090' : '#c8b8f0' });
        Mini.text('Dentro da cabeça do Gustavo.', W / 2, 16, { size: 7, color: '#bbb' });
        Mini.text('Leve o fio do gesto de fumar até o pai · segure E pra colar', W / 2, H - 10, { size: 5.5, color: '#999' });
        if (memT > 0) Mini.text(memText, W / 2, 34, { size: 6.5, color: '#f0e0c8', alpha: Math.min(1, memT) });
        if (U.dist(cur.x, cur.y, tgt.x, tgt.y) < 18 && !done) Mini.text('segure E', tgt.x, tgt.y + 18, { size: 6, color: '#ffb347' });
        Mini.text('[dois faróis]', W - 18, H - 26, { size: 4.5, color: '#666' });
      },
    });
  },

  // ================================================================ mensagens no celular
  celular(msgs) {
    const box = $('#phone');
    box.innerHTML = '<div class="ph"><div class="ph-top">Gustavo</div><div class="ph-msgs"></div><div class="ph-tip">E — próxima</div></div>';
    box.className = 'show';
    const list = box.querySelector('.ph-msgs');
    let i = 0, t = 0;
    const add = () => { const m = el('div', 'msg', msgs[i]); list.appendChild(m); list.scrollTop = 1e6; Audio2.sfx('phone'); i++; };
    add();
    return this.start({
      overlay: true, cleanup() { box.className = ''; },
      update(dt) {
        t += dt;
        if ((Input.hit('act') || t > 2.6) && i < msgs.length) { Input.consume('act'); t = 0; add(); }
        else if (Input.hit('act') && i >= msgs.length) { box.className = ''; this.resolve(true); }
      },
      draw() { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H); },
    });
  },

  // ================================================================ cap. 10 — sentir falta
  sentir() {
    const mems = [
      'Um áudio de cinco segundos, às onze da noite, com um trechinho de violão.',
      'Os cinco por cento dele. Sempre a melhor coisa da noite.',
      'A Larissa, as plantas, o casamento em novembro.',
      '"Cê tá diferente." Ele reparava.',
      'Ele tava indo comprar cerveja.',
    ];
    const orbs = mems.map((m, i) => ({ m, a: i / mems.length * Math.PI * 2, r: 150 + i * 30, got: false }));
    let t = 0, msg = '', msgT = 0, warn = 0, done = false, endT = 0, got = 0;
    const p = G.player;
    return this.start({
      overlay: true,
      update(dt) {
        t += dt; msgT -= dt; warn -= dt;
        if (done) { endT += dt; if (endT > 1.5) this.resolve(true); return; }
        const [ax, ay] = Input.axis();
        const impatient = ax || ay || Input.hit('tk') || Input.hit('undo') || Input.hit('freeze') || Input.hit('blink') || Input.hit('perceive') || Input.hit('create') || Input.hit('act');
        if (impatient) { warn = 2; Audio2.sfx('nothing'); }
        for (const o of orbs) {
          if (o.got) continue;
          o.a += dt * 0.25;
          if (warn > 0) o.r = Math.min(220, o.r + 80 * dt);
          else o.r -= (14 + got * 2) * dt;
          if (o.r < 10) { o.got = true; got++; msg = o.m; msgT = 4; Audio2.tone(Audio2.mtof(64 + got * 3), 1.2, 'sine', 0.1); FX.burst(p.x, p.y - 14, 12, ['#ffe9a8', '#fff'], 20, 1); if (got === mems.length) { done = true; } }
        }
      },
      draw() {
        const cx = p.x - G.cam.x, cy = p.y - G.cam.y - 14;
        ctx.fillStyle = `rgba(10,8,20,${0.35 + got * 0.08})`; ctx.fillRect(0, 0, W, H);
        for (const o of orbs) {
          if (o.got) continue;
          const x = cx + Math.cos(o.a) * o.r * 1.4, y = cy + Math.sin(o.a) * o.r * 0.8;
          ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
          ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
        }
        if (done) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, endT)})`; ctx.fillRect(0, 0, W, H); }
      },
      drawText() {
        if (warn > 0) Mini.text('Não mande. Não pense "volta". Só sinta.', W / 2, 40, { size: 8, color: '#ffd0a0' });
        else if (t < 6) Mini.text('Fique parado. Deixe as lembranças virem.', W / 2, 40, { size: 7, color: '#ddd', alpha: Math.min(1, (6 - t) / 2) });
        if (msgT > 0) Mini.text(msg, W / 2, H - 46, { size: 7, color: '#ffe9c8', alpha: Math.min(1, msgT) });
      },
    });
  },
};
