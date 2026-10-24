// =====================================================================
//  menus.js — todas as telas: título, seleção de personagem e cenário,
//  dificuldade, pausa, lista de golpes, configurações, controles,
//  galeria, telas do Arcade (VS, continuar, final) e resultados.
// =====================================================================
'use strict';

(function () {
  const S = Screens, h = VA.h, esc = U.esc;

  // ----------------------------------------------------- utilidades de DOM
  // desenha retratos em <canvas data-portrait="id">
  function paintPortraits(el) {
    el.querySelectorAll('canvas[data-portrait]').forEach(c => {
      const g = c.getContext('2d'), id = c.dataset.portrait, def = VA.chars[id];
      g.clearRect(0, 0, c.width, c.height);
      if (!def) return;
      VA.Rig.portrait(g, def, c.width / 2, c.height / 2 + c.height * 0.05, c.width * 0.42, c.dataset.flip ? -1 : 1);
      if (c.dataset.locked) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#05040a'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; }
    });
  }
  const CMD = { lp: 'J', hp: 'K', lk: '→ + J', hk: '→ + K', clp: '↓ + J', chk: '↓ + K', air_l: 'J (no ar)', air_h: 'K (no ar)', throw: 'L + J (perto)' };
  const KEYMAP = { J: 'lp', K: 'hp', U: 'sp', I: 'sp2', O: 'su', L: 'block' };
  function fmtCmd(str) {
    const b = Input.bindings.p1;
    return str.replace(/\b([JKUIOL])\b/g, (m0, k) => VA.keyLabel(b[KEYMAP[k]])).replace(/←|→/g, a => a);
  }
  VA.fmtCmd = fmtCmd;
  function moveRows(def) {
    const rows = [];
    for (const id in def.moves) {
      const m = def.moves[id];
      const cmd = CMD[id] || m.cmd;
      if (!cmd) continue;
      rows.push({ id, name: m.name || id, cmd: fmtCmd(cmd), type: m.type, cost: m.cost });
    }
    return rows;
  }
  VA.moveRows = moveRows;
  function statBars(st) {
    const L = { speed: 'Velocidade', power: 'Força', defense: 'Resistência', reach: 'Alcance', energy: 'Energia' };
    return Object.keys(L).map(k => `<div class="stat"><span>${L[k]}</span><i style="--v:${st[k] * 10}%"></i></div>`).join('');
  }

  // fundo animado dos menus
  VA.menuScene = { stage: 'entre', t: 0 };

  // ====================================================== TÍTULO
  S.define('title', {
    music: 'menu',
    build(el) {
      const sv = Save.stats;
      el.innerHTML = `
        <div class="title-art"><img src="../assets/titulo.png" alt="" onerror="this.parentNode.classList.add('missing')"></div>
        <div class="title-box">
          <div class="logo"><b>V</b><span>THE AWAKENING ARENA</span></div>
          <div class="subtitle">um jogo de luta do universo de <i>O Homem Que Acordou Grande Demais</i></div>
          <div class="menu">
            ${h.btn('Arcade', 'data-go="arcade"')}
            ${h.btn('Versus — 2 jogadores', 'data-go="versus"')}
            ${h.btn('Contra a máquina', 'data-go="cpu"')}
            ${h.btn('Sobrevivência', 'data-go="survival"')}
            ${h.btn('Treinamento', 'data-go="training"')}
            ${h.btn('Galeria', 'data-go="gallery"')}
            ${h.btn('Controles', 'data-go="controls"')}
            ${h.btn('Configurações', 'data-go="settings"')}
            ${h.btn('Tela cheia', 'data-go="fullscreen"')}
            <a class="nav btn small" href="../index.html">Jogo de aventura (capítulos 1–11)</a>
          </div>
          <div class="foot">Vitórias ${sv.wins} · Derrotas ${sv.losses} · Maior combo ${sv.maxCombo}${Save.ok ? '' : ' · <b class="warn">o navegador bloqueou o salvamento</b>'}</div>
          <div class="hint">Setas/WASD navegam · Enter/J confirma · Esc/K volta</div>
        </div>`;
      el.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
        Audio2.sfx('ok');
        const g = b.dataset.go;
        if (g === 'fullscreen') return VA.toggleFullscreen();
        if (g === 'gallery' || g === 'controls' || g === 'settings') return S.push(g);
        VA.Game.startMode(g);
      }));
    },
    back() {},
  });

  // ====================================================== SELEÇÃO DE PERSONAGEM
  // params: { title, humans (1|2), pickOpponent (bool), next({p1,p2}), back() }
  S.define('select', {
    music: 'select',
    build(el, P, st) {
      st.slots = VA.charOrder.map(id => ({ id })).concat(VA.LORE.future.slice(0, 2).map(f => ({ soon: true, name: f.name, note: f.note })), [{ random: true }]);
      st.cols = 4;
      if (!st.cur) { st.cur = [0, Math.min(1, VA.charOrder.length - 1)]; st.locked = [false, false]; }
      const two = P.humans === 2 || P.pickOpponent;
      st.two = two;
      el.innerHTML = `
        <div class="sel-head"><h2>${esc(P.title || 'Escolha seu lutador')}</h2><div class="sel-sub">${P.humans === 2 ? 'J1: WASD + J confirma · J2: setas + Num1 confirma' : P.pickOpponent ? 'Escolha o seu lutador e depois o adversário' : 'Escolha o seu lutador'}</div></div>
        <div class="sel-body">
          <div class="sel-side" data-side="0"><canvas class="sel-prev" width="220" height="230"></canvas><div class="sel-info"></div></div>
          <div class="sel-grid" style="--cols:${st.cols}">
            ${st.slots.map((s, i) => {
              if (s.soon) return `<div class="slot soon" data-i="${i}"><div class="q">?</div><span>${esc(s.name)}</span><em>em breve</em></div>`;
              if (s.random) return `<div class="slot rnd" data-i="${i}"><div class="q">?</div><span>Aleatório</span></div>`;
              const d = VA.chars[s.id], lk = !Save.isCharUnlocked(s.id);
              return `<div class="slot ${lk ? 'locked' : ''}" data-i="${i}"><canvas data-portrait="${s.id}" ${lk ? 'data-locked="1"' : ''} width="84" height="84"></canvas><span>${lk ? '???' : esc(d.name)}</span>${lk ? '<em>🔒 bloqueado</em>' : ''}</div>`;
            }).join('')}
          </div>
          <div class="sel-side" data-side="1"><canvas class="sel-prev" width="220" height="230"></canvas><div class="sel-info"></div></div>
        </div>
        <div class="sel-foot">${h.btn('Voltar', 'data-back')}</div>`;
      paintPortraits(el);
      el.querySelectorAll('.slot').forEach(sl => sl.addEventListener('click', () => {
        const i = +sl.dataset.i, p = this.state.locked[0] && two ? 1 : 0;
        if (this.state.locked[p]) return;
        this.state.cur[p] = i; this.def.confirm.call(this, p);
      }));
      el.querySelector('[data-back]').addEventListener('click', () => this.def.back.call(this));
      this.def.refresh.call(this);
    },
    activeCursor(p) {
      const st = this.state, P = this.params;
      if (P.humans === 2) return p;
      return st.locked[0] && P.pickOpponent ? 1 : 0;
    },
    nav(a, p, rep) {
      const st = this.state;
      if (a === 'back' && rep) return true;
      const c = this.def.activeCursor.call(this, p);
      if (a === 'back') { Audio2.sfx('back'); this.def.back.call(this, c); return true; }
      if (st.locked[c]) return true;
      const n = st.slots.length, cols = st.cols;
      if (a === 'left') st.cur[c] = (st.cur[c] - 1 + n) % n;
      if (a === 'right') st.cur[c] = (st.cur[c] + 1) % n;
      if (a === 'up') st.cur[c] = (st.cur[c] - cols + n) % n;
      if (a === 'down') st.cur[c] = (st.cur[c] + cols) % n;
      if (a === 'ok') { if (!rep) this.def.confirm.call(this, c); return true; }
      Audio2.sfx('move');
      this.def.refresh.call(this);
      return true;
    },
    confirm(c) {
      const st = this.state, P = this.params, s = st.slots[st.cur[c]];
      if (s.soon) { Audio2.sfx('deny'); VA.toast(s.name + ' — ' + s.note); return; }
      let id = s.id;
      if (s.random) { const ok = VA.charOrder.filter(x => Save.isCharUnlocked(x)); id = U.pick(ok); }
      if (!Save.isCharUnlocked(id)) { Audio2.sfx('deny'); VA.toast('Bloqueado: ' + VA.chars[id].unlockHint); return; }
      st.picks = st.picks || [null, null];
      st.picks[c] = id; st.locked[c] = true;
      Audio2.sfx('select');
      Audio2.say(VA.chars[id].name);
      this.def.refresh.call(this);
      const done = st.two ? st.locked[0] && st.locked[1] : st.locked[0];
      if (done) setTimeout(() => { if (S.cur === this) P.next({ p1: st.picks[0], p2: st.picks[1] }); }, 450);
    },
    back(c) {
      const st = this.state;
      if (c == null) c = st.locked[1] ? 1 : 0;
      if (st.locked[c]) { st.locked[c] = false; this.def.refresh.call(this); return; }
      if (c === 1 && st.locked[0] && this.params.humans !== 2) { st.locked[0] = false; this.def.refresh.call(this); return; }
      if (this.params.back) this.params.back(); else S.show('title');
    },
    refresh() {
      const st = this.state, el = this.el;
      el.querySelectorAll('.slot').forEach(sl => {
        const i = +sl.dataset.i;
        sl.classList.toggle('p1', st.cur[0] === i);
        sl.classList.toggle('p2', st.two && st.cur[1] === i);
        sl.classList.toggle('lock1', st.locked[0] && st.cur[0] === i);
        sl.classList.toggle('lock2', st.locked[1] && st.cur[1] === i);
      });
      for (let s = 0; s < 2; s++) {
        const box = el.querySelector(`.sel-side[data-side="${s}"] .sel-info`);
        if (s === 1 && !st.two) { box.innerHTML = '<div class="cpu-note">Adversário escolhido pelo modo</div>'; continue; }
        const slot = st.slots[st.cur[s]];
        if (!slot.id || !Save.isCharUnlocked(slot.id)) {
          box.innerHTML = slot.soon ? `<h3>${esc(slot.name)}</h3><p class="dim">${esc(slot.note)}</p><p class="tag">em breve</p>` : slot.random ? '<h3>Aleatório</h3>' : `<h3>???</h3><p class="dim">${esc(VA.chars[slot.id].unlockHint)}</p>`;
          continue;
        }
        const d = VA.chars[slot.id];
        box.innerHTML = `<div class="who">J${s + 1}${st.locked[s] ? ' ✔' : ''}</div><h3>${esc(d.name)}${d.alias ? ' <small>/ ' + esc(d.alias) + '</small>' : ''}</h3>
          <p class="ttl">${esc(d.title)}</p>${statBars(d.stats)}
          <p class="style">${esc(d.proposal.style)}</p>`;
      }
    },
    tick() {
      const st = this.state;
      st.t = (st.t || 0) + 1;
      this.el.querySelectorAll('.sel-prev').forEach((c, s) => {
        const g = c.getContext('2d');
        g.clearRect(0, 0, c.width, c.height);
        const slot = st.slots[st.cur[s]];
        if (s === 1 && !st.two) return;
        if (!slot || !slot.id || !Save.isCharUnlocked(slot.id)) return;
        const def = VA.chars[slot.id];
        const grd = g.createRadialGradient(110, 200, 10, 110, 200, 140); grd.addColorStop(0, U.rgba(def.look.spark, 0.35)); grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd; g.fillRect(0, 0, c.width, c.height);
        drawShowcase(g, def, 110, 212, s === 0 ? 1 : -1, st.t, st.locked[s]);
      });
    },
  });

  // personagem animado nas telas de menu (idle e pose de vitória ao confirmar)
  const tmpPose = {};
  function drawShowcase(g, def, x, y, facing, t, win) {
    const V = VA.poses, own = def.poses || {}, get = n => own[n] || V[n];
    let pose;
    if (win) pose = VA.copyPose(get(def.winPose || 'win'), tmpPose);
    else {
      const cyc = t % 300;
      if (cyc > 230 && cyc < 262) pose = VA.mixPose(get('stance'), get(cyc < 246 ? 'push_a' : 'push_b'), Math.min(1, (cyc - 230) / 8), tmpPose);
      else pose = VA.mixPose(get('stance'), get('stance2'), (Math.sin(t * 0.07) + 1) / 2, tmpPose);
    }
    const build = Object.assign({}, VA.Rig.BUILD, def.look.build);
    build.scale *= 1.55;
    VA.Rig.draw(g, { x, y, facing, pose, look: def.look, build, t });
  }
  VA.drawShowcase = drawShowcase;

  // ====================================================== SELEÇÃO DE CENÁRIO
  S.define('stage', {
    cols: 3,
    build(el, P) {
      const ids = VA.stageOrder;
      el.innerHTML = `<h2>Escolha o cenário</h2>
        <div class="stage-grid">
          ${ids.map(id => {
            const s = VA.stages[id], ok = Save.isStageUnlocked(id);
            return `<button class="nav btn stage-card ${ok ? '' : 'locked'}" data-id="${id}"><canvas width="192" height="108" data-stage="${id}"></canvas><b>${ok ? esc(s.name) : '🔒 ' + esc(s.name)}</b><small>${esc(ok ? s.desc : s.unlock)}</small></button>`;
          }).join('')}
          <button class="nav btn stage-card" data-id="random"><div class="rnd-stage">?</div><b>Aleatório</b><small>Qualquer cenário desbloqueado</small></button>
        </div>
        <div class="row">${h.btn('Voltar', 'data-back')}</div>`;
      el.querySelectorAll('canvas[data-stage]').forEach(c => {
        VA.drawStagePreview(c.getContext('2d'), c.dataset.stage, c.width, c.height);
        if (!Save.isStageUnlocked(c.dataset.stage)) { const g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(0, 0, c.width, c.height); }
      });
      el.querySelectorAll('.stage-card').forEach(b => b.addEventListener('click', () => {
        let id = b.dataset.id;
        if (id === 'random') id = U.pick(VA.stageOrder.filter(x => Save.isStageUnlocked(x)));
        if (!Save.isStageUnlocked(id)) { Audio2.sfx('deny'); VA.toast(VA.stages[id].unlock); return; }
        Audio2.sfx('ok'); P.next(id);
      }));
      el.querySelector('[data-back]').addEventListener('click', () => this.def.back.call(this));
    },
    back() { if (this.params.back) this.params.back(); else S.pop(); },
  });

  // ====================================================== DIFICULDADE
  S.define('difficulty', {
    build(el, P) {
      const cur = Save.settings.difficulty;
      el.innerHTML = `<h2>Dificuldade da máquina</h2>
        <div class="menu narrow">
          ${[['easy', 'Fácil', 'Reage devagar, defende pouco e erra de propósito.'], ['normal', 'Normal', 'Defende, pune erros claros e usa especiais.'], ['hard', 'Difícil', 'Reação rápida, confirma combos e anti-aéreos. Sem trapaça: obedece às mesmas regras.']]
            .map(([k, n, d]) => h.btn(`${n}<small>${d}</small>`, `data-k="${k}"`, k === cur ? 'cur' : '')).join('')}
          ${h.btn('Voltar', 'data-back')}
        </div>`;
      el.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { Audio2.sfx('ok'); Save.settings.difficulty = b.dataset.k; Save.write(); P.next(b.dataset.k); }));
      el.querySelector('[data-back]').addEventListener('click', () => this.def.back.call(this));
      this.focus = ['easy', 'normal', 'hard'].indexOf(cur);
    },
    back() { if (this.params.back) this.params.back(); else S.pop(); },
  });

  // ====================================================== PAUSA
  S.define('pause', {
    overlay: true,
    build(el, P) {
      const m = VA.match, T = m && m.training;
      const dummyNames = { stand: 'parado', crouch: 'agachado', jump: 'pulando', block: 'defende tudo', blockAfter: 'defende após o 1º golpe', cpu: 'CPU (' + ({ easy: 'fácil', normal: 'normal', hard: 'difícil' })[Save.settings.difficulty] + ')' };
      el.innerHTML = `<div class="panel">
        <h2>Pausa</h2>
        <div class="menu narrow">
          ${h.btn('Continuar', 'data-a="resume"')}
          ${T ? h.btn('Boneco: <b>' + dummyNames[T.dummy] + '</b>', 'data-a="dummy"') : ''}
          ${T ? h.btn('Energia infinita: <b>' + (T.infEnergy ? 'sim' : 'não') + '</b>', 'data-a="energy"') : ''}
          ${T ? h.btn('Recuperar vida: <b>' + (T.refill ? 'sim' : 'não') + '</b>', 'data-a="refill"') : ''}
          ${T ? h.btn('Reposicionar lutadores', 'data-a="reset"') : ''}
          ${h.btn('Mostrar caixas de colisão: <b>' + (Save.settings.hitboxes ? 'sim' : 'não') + '</b>', 'data-a="boxes"')}
          ${h.btn('Lista de golpes', 'data-a="moves"')}
          ${!T ? h.btn('Reiniciar luta', 'data-a="restart"') : ''}
          ${h.btn('Controles', 'data-a="controls"')}
          ${h.btn('Configurações', 'data-a="settings"')}
          ${h.btn('Tela cheia', 'data-a="fs"')}
          ${h.btn('Sair para o menu', 'data-a="quit"')}
        </div></div>`;
      el.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
        const a = b.dataset.a; Audio2.sfx('ok');
        const order = ['stand', 'crouch', 'jump', 'block', 'blockAfter', 'cpu'];
        switch (a) {
          case 'resume': VA.Game.resume(); break;
          case 'dummy': T.dummy = order[(order.indexOf(T.dummy) + 1) % order.length]; S.rebuild(); break;
          case 'energy': T.infEnergy = !T.infEnergy; S.rebuild(); break;
          case 'refill': T.refill = !T.refill; S.rebuild(); break;
          case 'reset': m.resetPositions(); VA.Game.resume(); break;
          case 'boxes': Save.settings.hitboxes = !Save.settings.hitboxes; Save.write(); S.rebuild(); break;
          case 'moves': S.push('movelist'); break;
          case 'restart': VA.Game.restart(); break;
          case 'controls': S.push('controls'); break;
          case 'settings': S.push('settings'); break;
          case 'fs': VA.toggleFullscreen(); break;
          case 'quit': VA.Game.quit(); break;
        }
      }));
    },
    back() { VA.Game.resume(); },
  });

  // ====================================================== LISTA DE GOLPES
  S.define('movelist', {
    overlay: true,
    build(el) {
      const m = VA.match;
      const ids = m ? [...new Set(m.fighters.map(f => f.def.id))] : VA.charOrder;
      el.innerHTML = `<div class="panel wide">
        <h2>Lista de golpes</h2>
        <div class="movecols">${ids.map(id => {
          const d = VA.chars[id];
          const forms = Object.values(d.forms || {}).map(f => `<p class="form"><b>${esc(f.name)}:</b> ${esc(f.desc || '')}</p>`).join('');
          return `<div class="movecol"><h3>${esc(d.name)}</h3><table>${moveRows(d).map(r => `<tr class="t-${r.type}"><td>${esc(r.name)}</td><td>${esc(r.cmd)}</td></tr>`).join('')}</table>${forms}</div>`;
        }).join('')}</div>
        <p class="dim">Geral: toque duplo → corre · toque duplo ← esquiva para trás · L defende (L + ↓ defende baixo) · golpes leves encadeiam em pesados; normais cancelam em especiais e especiais em supremo quando conectam · L + J no começo de um agarrão escapa.</p>
        <div class="row">${h.btn('Voltar', 'data-back')}</div></div>`;
      el.querySelector('[data-back]').addEventListener('click', () => S.pop());
    },
  });

  // ====================================================== CONFIGURAÇÕES
  S.define('settings', {
    overlay: true,
    build(el) {
      const s = Save.settings;
      const pct = v => Math.round(v * 100) + '%';
      const rows = [
        ['master', 'Volume geral', pct(s.master), true],
        ['music', 'Música', pct(s.music), true],
        ['sfx', 'Efeitos', pct(s.sfx), true],
        ['mute', 'Silenciar tudo', s.mute ? 'sim' : 'não'],
        ['announcer', 'Locutor (voz do sistema)', s.announcer ? 'sim' : 'não'],
        ['difficulty', 'Dificuldade padrão', ({ easy: 'Fácil', normal: 'Normal', hard: 'Difícil' })[s.difficulty], true],
        ['rounds', 'Rounds para vencer', String(s.rounds), true],
        ['timer', 'Tempo do round', s.timer >= 999 ? '∞' : s.timer + ' s', true],
        ['shake', 'Tremor de tela', s.shake ? 'sim' : 'não'],
        ['hitboxes', 'Mostrar caixas de colisão', s.hitboxes ? 'sim' : 'não'],
      ];
      el.innerHTML = `<div class="panel">
        <h2>Configurações</h2>
        <div class="menu narrow">
          ${rows.map(([k, l, v, sl]) => `<button class="nav btn opt" data-k="${k}" ${sl ? 'data-slider="1"' : ''}><span>${l}</span><b>${sl ? '◀ ' + v + ' ▶' : v}</b></button>`).join('')}
          ${h.btn('Tela cheia', 'data-a="fs"')}
          ${h.btn('Apagar progresso salvo', 'data-a="reset"', 'danger')}
          ${h.btn('Voltar', 'data-a="back"')}
        </div>
        <p class="dim">${Save.ok ? 'Progresso salvo automaticamente neste navegador.' : 'Atenção: o navegador bloqueou o armazenamento local; o progresso não será salvo.'}</p></div>`;
      const change = (k, d) => {
        const st = Save.settings;
        if (k === 'master' || k === 'music' || k === 'sfx') st[k] = Math.round(U.clamp(st[k] + d * 0.1, 0, 1) * 10) / 10;
        else if (k === 'difficulty') { const o = ['easy', 'normal', 'hard']; st.difficulty = o[(o.indexOf(st.difficulty) + d + 3) % 3]; }
        else if (k === 'rounds') st.rounds = (st.rounds - 1 + d + 3) % 3 + 1;
        else if (k === 'timer') { const o = [60, 99, 999]; st.timer = o[(o.indexOf(st.timer) + d + 3) % 3]; }
        else st[k] = !st[k];
        Save.write(); Audio2.applyVolumes(); Audio2.sfx('move');
        S.rebuild();
      };
      el.querySelectorAll('[data-k]').forEach(b => {
        b.addEventListener('click', () => change(b.dataset.k, 1));
        b.addEventListener('adjust', e => change(b.dataset.k, e.detail));
      });
      el.querySelector('[data-a="fs"]').addEventListener('click', () => VA.toggleFullscreen());
      el.querySelector('[data-a="back"]').addEventListener('click', () => S.pop());
      el.querySelector('[data-a="reset"]').addEventListener('click', () => {
        if (confirm('Apagar todo o progresso, estatísticas e desbloqueios?')) { Save.reset(); Input.loadBindings(); VA.toast('Progresso apagado.'); S.rebuild(); }
      });
    },
  });

  // ====================================================== CONTROLES
  S.define('controls', {
    overlay: true,
    build(el, P, st) {
      const B = Input.bindings;
      el.innerHTML = `<div class="panel wide">
        <h2>Controles</h2>
        <table class="binds"><tr><th>Ação</th><th>Jogador 1</th><th>Jogador 2</th></tr>
          ${VA.ACTIONS.map(a => `<tr><td>${VA.ACTION_LABEL[a]}</td>
            <td><button class="nav btn key" data-p="p1" data-a="${a}">${st.wait === 'p1' + a ? '…' : esc(VA.keyLabel(B.p1[a]))}</button></td>
            <td><button class="nav btn key" data-p="p2" data-a="${a}">${st.wait === 'p2' + a ? '…' : esc(VA.keyLabel(B.p2[a]))}</button></td></tr>`).join('')}
        </table>
        <p class="dim">Clique numa tecla e pressione a nova (Esc cancela). Teclas repetidas são trocadas automaticamente. Esc sempre pausa a luta.<br>
        Controle (padrão Xbox): direcional/analógico movem · X leve · Y pesado · A especial · B especial 2 · RB/RT supremo · LB/LT defesa · Start pausa. O 1º controle é do J1, o 2º do J2.</p>
        <div class="row">${h.btn('Restaurar padrão', 'data-reset')}${h.btn('Voltar', 'data-back')}</div></div>`;
      el.querySelectorAll('.key').forEach(b => b.addEventListener('click', () => {
        st.wait = b.dataset.p + b.dataset.a; S.rebuild();
        Input.capture = code => { st.wait = null; if (code) { Input.setBinding(b.dataset.p, b.dataset.a, code); Audio2.sfx('ok'); } S.rebuild(); };
      }));
      el.querySelector('[data-reset]').addEventListener('click', () => { Input.resetBindings(); Audio2.sfx('ok'); S.rebuild(); });
      el.querySelector('[data-back]').addEventListener('click', () => S.pop());
    },
  });

  // ====================================================== GALERIA
  S.define('gallery', {
    overlay: true,
    build(el, P, st) {
      st.tab = st.tab || 'chars';
      st.sel = st.sel || VA.charOrder[0];
      const tabs = [['chars', 'Personagens'], ['endings', 'Finais'], ['stages', 'Cenários'], ['lore', 'Universo'], ['stats', 'Estatísticas']];
      let body = '';
      if (st.tab === 'chars') {
        const ok = Save.isCharUnlocked(st.sel), d = VA.chars[st.sel];
        body = `<div class="gal-chars">
          <div class="gal-list">${VA.charOrder.map(id => `<button class="nav btn ${id === st.sel ? 'cur' : ''}" data-sel="${id}">${Save.isCharUnlocked(id) ? esc(VA.chars[id].name) : '???'}</button>`).join('')}</div>
          <div class="gal-detail">${ok ? `
            <div class="gal-top"><canvas class="gal-prev" width="180" height="200" data-show="${d.id}"></canvas>
              <div><h3>${esc(d.name)}${d.alias ? ' / ' + esc(d.alias) : ''}</h3><p class="ttl">${esc(d.title)}</p>${statBars(d.stats)}</div></div>
            <h4>Do livro (canônico)</h4><p>${esc(d.canon.bio)}</p><p class="dim">Aparência: ${esc(d.canon.appearance)}</p>
            ${d.canon.facts.length ? '<ul>' + d.canon.facts.map(f => `<li>${esc(f)}</li>`).join('') + '</ul>' : ''}
            <h4>Proposta do jogo</h4>${d.proposal.bio ? `<p>${esc(d.proposal.bio)}</p>` : ''}<p>${esc(d.proposal.style)}</p><p class="dim">${esc(d.proposal.notes)}</p>
            <h4>Habilidades</h4><table class="mini">${moveRows(d).filter(r => r.type !== 'normal' && r.type !== 'throw').map(r => `<tr><td>${esc(r.name)}</td><td>${esc(r.cmd)}</td></tr>`).join('')}</table>
            ${Object.values(d.forms).map(f => `<p class="form"><b>${esc(f.name)}:</b> ${esc(f.desc || '')}</p>`).join('')}
            <h4>Rivalidades</h4>${d.rivals.map(r => `<p>${esc(VA.chars[r.id] ? VA.chars[r.id].name : r.id)} — ${esc(r.text)} <span class="tag">${r.canon ? 'livro' : 'proposta'}</span></p>`).join('')}
            ${d.id === 'v' ? '<h4>Arte do autor</h4><div class="arts"><img src="../assets/v_referencia.jpg" alt="V — referência" onerror="this.remove()"><img src="../assets/v_retrato_grande.png" alt="V — retrato" onerror="this.remove()"></div>' : ''}
          ` : `<h3>???</h3><p>${esc(d.unlockHint || '')}</p>`}</div></div>`;
      } else if (st.tab === 'endings') {
        body = `<div class="gal-end">${VA.charOrder.map(id => {
          const d = VA.chars[id], e = d.arcade.ending, got = Save.data.unlocks.endings[id];
          return `<div class="end-card ${got ? '' : 'locked'}"><h3>${esc(d.name)} — ${got ? esc(e.title) : '???'}</h3>${got ? e.text.map(t => `<p>${esc(t)}</p>`).join('') + '<p class="tag">final proposto pelo jogo</p>' : '<p class="dim">Termine o Arcade com ' + (Save.isCharUnlocked(id) ? esc(d.name) : 'este personagem') + '.</p>'}</div>`;
        }).join('')}</div>`;
      } else if (st.tab === 'stages') {
        body = `<div class="gal-end">${VA.stageOrder.map(id => {
          const s = VA.stages[id], ok = Save.isStageUnlocked(id);
          return `<div class="end-card ${ok ? '' : 'locked'}"><h3>${esc(s.name)}</h3><p>${esc(ok ? s.desc : s.unlock)}</p><p class="dim">${esc(s.canon)}</p></div>`;
        }).join('')}</div>`;
      } else if (st.tab === 'lore') {
        const L = VA.LORE;
        body = `<div class="gal-end"><blockquote>“${esc(L.quote.text)}” — ${esc(L.quote.by)}</blockquote>
          ${L.acts.map(a => `<div class="end-card"><h3>${esc(a.title)} <small>cap. ${a.chapters}</small></h3><p>${esc(a.text)}</p></div>`).join('')}
          <h4>Possíveis futuros lutadores (citados no livro)</h4>${L.future.map(f => `<p><b>${esc(f.name)}</b> — ${esc(f.note)}</p>`).join('')}
          <p class="dim">Fonte: índice do romance "V — O Homem Que Acordou Grande Demais".</p></div>`;
      } else {
        const sv = Save.stats;
        body = `<div class="gal-end"><table class="mini stats">
          <tr><td>Lutas</td><td>${sv.matches}</td></tr><tr><td>Vitórias / derrotas / empates</td><td>${sv.wins} / ${sv.losses} / ${sv.draws}</td></tr>
          <tr><td>Dano total causado</td><td>${sv.totalDamage}</td></tr><tr><td>Maior combo</td><td>${sv.maxCombo} golpes</td></tr>
          <tr><td>Maior dano em combo</td><td>${sv.maxComboDamage}</td></tr><tr><td>Supremos usados</td><td>${sv.supers}</td></tr>
          <tr><td>Transformações</td><td>${sv.transforms}</td></tr><tr><td>Rounds perfeitos</td><td>${sv.perfects}</td></tr>
          <tr><td>Recorde de sobrevivência</td><td>${sv.survival.best}${sv.survival.char ? ' (' + esc(VA.chars[sv.survival.char].name) + ')' : ''}</td></tr>
          ${VA.charOrder.map(id => { const c = sv.perChar[id] || { used: 0, wins: 0, losses: 0 }, a = sv.arcade[id]; return `<tr><td>${esc(VA.chars[id].name)}</td><td>${c.used} lutas · ${c.wins}V ${c.losses}D${a ? ' · Arcade ' + a.clears + 'x, melhor ' + U.fmtTime(a.bestTime) + ', ' + a.bestScore + ' pts' : ''}</td></tr>`; }).join('')}
        </table></div>`;
      }
      el.innerHTML = `<div class="panel wide gallery">
        <h2>Galeria</h2>
        <div class="tabs">${tabs.map(([k, n]) => `<button class="nav btn tab ${k === st.tab ? 'cur' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
        <div class="gal-body">${body}</div>
        <div class="row">${h.btn('Voltar', 'data-back')}</div></div>`;
      el.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { st.tab = b.dataset.tab; Audio2.sfx('move'); S.rebuild(); }));
      el.querySelectorAll('[data-sel]').forEach(b => b.addEventListener('click', () => { st.sel = b.dataset.sel; Audio2.sfx('move'); S.rebuild(); }));
      el.querySelector('[data-back]').addEventListener('click', () => S.pop());
    },
    tick() {
      const c = this.el.querySelector('canvas[data-show]');
      if (!c) return;
      this.state.t = (this.state.t || 0) + 1;
      const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
      drawShowcase(g, VA.chars[c.dataset.show], 90, 188, 1, this.state.t, false);
    },
  });

  // ====================================================== ARCADE: TELA "VS"
  S.define('versus', {
    music: 'select',
    build(el, P, st) {
      const a = VA.chars[P.p1], b = VA.chars[P.p2];
      el.innerHTML = `<div class="vs">
        <div class="vs-side"><canvas data-portrait="${a.id}" width="240" height="240"></canvas><h2>${esc(a.name)}</h2></div>
        <div class="vs-mid"><div class="vs-tag">${esc(P.label || '')}</div><div class="vs-big">VS</div><div class="vs-stage">${esc(VA.stages[P.stage].name)}</div></div>
        <div class="vs-side"><canvas data-portrait="${b.id}" data-flip="1" width="240" height="240"></canvas><h2>${esc(P.name || b.name)}</h2>${P.boss ? '<div class="boss">CHEFE</div>' : ''}</div>
      </div>
      <p class="vs-intro">${esc(P.intro || '')}</p>
      <div class="row">${h.btn('Lutar!', 'data-go')}</div>`;
      paintPortraits(el);
      st.t = 0;
      el.querySelector('[data-go]').addEventListener('click', () => { if (!st.done) { st.done = true; Audio2.sfx('fight'); P.next(); } });
    },
    tick() { if (++this.state.t === 420 && !this.state.done) { this.state.done = true; this.params.next(); } },
    back() { this.params.quit(); },
  });

  // ====================================================== ARCADE: CONTINUAR?
  S.define('continue', {
    build(el, P, st) {
      st.t = st.t || 600;
      el.innerHTML = `<div class="panel"><h2>Continuar?</h2><div class="count">${Math.ceil(st.t / 60)}</div>
        <div class="menu narrow">${h.btn('Sim — tentar de novo', 'data-y')}${h.btn('Não', 'data-n')}</div>
        <p class="dim">Continuações usadas: ${P.continues}</p></div>`;
      el.querySelector('[data-y]').addEventListener('click', () => { Audio2.sfx('ok'); P.yes(); });
      el.querySelector('[data-n]').addEventListener('click', () => { Audio2.sfx('back'); P.no(); });
    },
    tick() {
      const st = this.state;
      if (--st.t <= 0) { this.params.no(); return; }
      if (st.t % 60 === 0) { Audio2.sfx('move'); const c = this.el.querySelector('.count'); if (c) c.textContent = Math.ceil(st.t / 60); }
    },
    back() { this.params.no(); },
  });

  // ====================================================== ARCADE: FINAL
  S.define('ending', {
    music: 'victory',
    build(el, P, st) {
      st.i = st.i || 0;
      const d = VA.chars[P.char], e = d.arcade.ending;
      const last = st.i >= e.text.length;
      el.innerHTML = `<div class="ending">
        <canvas data-portrait="${d.id}" width="200" height="200"></canvas>
        <h2>${esc(d.name)} — ${esc(e.title)}</h2>
        <div class="end-text">${e.text.slice(0, st.i + 1).map(t => `<p>${esc(t)}</p>`).join('')}</div>
        ${last ? `<div class="end-stats">${P.lines.map(l => `<p>${l}</p>`).join('')}</div>` : ''}
        <p class="tag">Final proposto pelo jogo — não faz parte do livro.</p>
        <div class="row">${h.btn(last ? 'Fim' : 'Continuar ▶', 'data-next')}</div></div>`;
      paintPortraits(el);
      el.querySelector('[data-next]').addEventListener('click', () => {
        Audio2.sfx('ok');
        if (st.i >= e.text.length) P.done(); else { st.i++; S.rebuild(); }
      });
    },
    back() {},
  });

  // ====================================================== RESULTADOS
  S.define('results', {
    music: 'victory',
    build(el, P) {
      const r = P.result;
      const names = r.chars.map(id => VA.chars[id].name);
      const title = r.winner < 0 ? 'Empate' : (P.names ? P.names[r.winner] : names[r.winner]) + ' venceu';
      const row = (l, k, f = v => v) => `<tr><td>${l}</td><td>${f(r.stats[0][k] || 0)}</td><td>${f(r.stats[1][k] || 0)}</td></tr>`;
      el.innerHTML = `<div class="panel wide results">
        <h2>${esc(title)}</h2>
        <div class="res-por"><canvas data-portrait="${r.chars[0]}" width="120" height="120"></canvas><div class="res-score">${r.wins[0]} — ${r.wins[1]}</div><canvas data-portrait="${r.chars[1]}" data-flip="1" width="120" height="120"></canvas></div>
        <table class="mini stats"><tr><th></th><th>${esc(names[0])}</th><th>${esc(names[1])}</th></tr>
          ${row('Dano causado', 'dmg')}${row('Golpes acertados', 'hits')}${row('Maior combo', 'maxCombo')}${row('Defesas', 'blocks')}${row('Especiais', 'specials')}${row('Supremos', 'supers')}${row('Transformações', 'transforms')}
        </table>
        <p class="dim">Duração: ${U.fmtTime(r.time)} · Rounds: ${r.rounds}</p>
        ${(P.lines || []).map(l => `<p class="unlock">${l}</p>`).join('')}
        <div class="menu row">${(P.buttons || []).map((b, i) => h.btn(esc(b[0]), `data-i="${i}"`)).join('')}</div></div>`;
      paintPortraits(el);
      el.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { Audio2.sfx('ok'); P.buttons[+b.dataset.i][1](); }));
    },
    back() { const b = this.params.buttons; b[b.length - 1][1](); },
  });

  VA.paintPortraits = paintPortraits;
})();
