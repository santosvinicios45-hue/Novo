// =====================================================================
//  modes.js — fluxos dos modos de jogo (Arcade, Versus, Contra a
//  máquina, Sobrevivência, Treinamento), pausa e registro de progresso.
// =====================================================================
'use strict';

const LEVELS = ['easy', 'normal', 'hard'];
const shiftLevel = (lv, d) => LEVELS[U.clamp(LEVELS.indexOf(lv) + d, 0, 2)];

const Game = VA.Game = {
  match: null, paused: false, cfg: null,

  startMode(mode) {
    const S = Screens;
    switch (mode) {
      case 'versus':
        S.show('select', { title: 'Versus — dois jogadores', humans: 2, next: p => S.push('stage', { next: st => this.launch({ mode, p1: { char: p.p1 }, p2: { char: p.p2 }, stage: st }) }) });
        break;
      case 'cpu':
        S.show('select', { title: 'Contra a máquina', humans: 1, pickOpponent: true, next: p => S.push('difficulty', { next: lv => S.push('stage', { next: st => this.launch({ mode, p1: { char: p.p1 }, p2: { char: p.p2, ai: lv }, stage: st }) }) }) });
        break;
      case 'training':
        S.show('select', { title: 'Treinamento — escolha você e o boneco', humans: 1, pickOpponent: true, next: p => S.push('stage', { next: st => this.launch({ mode, p1: { char: p.p1 }, p2: { char: p.p2, ai: Save.settings.difficulty }, stage: st, timer: 999, training: { dummy: 'stand', infEnergy: true, refill: true, maxCombo: 0 } }) }) });
        break;
      case 'arcade':
        S.show('select', { title: 'Arcade', humans: 1, next: p => this.arcadeStart(p.p1) });
        break;
      case 'survival':
        S.show('select', { title: 'Sobrevivência — quantos você aguenta?', humans: 1, next: p => this.survivalStart(p.p1) });
        break;
    }
  },

  // ------------------------------------------------------------ partida
  launch(cfg) {
    this.cfg = cfg;
    const s = Save.settings;
    const o = Object.assign({ rounds: s.rounds, timer: s.timer }, cfg, {
      onEnd: (r, m) => this.onMatchEnd(r, m),
    });
    if (cfg.training) o.training = Object.assign({}, cfg.training);
    Screens.clear();
    FX.clear();
    this.paused = false;
    this.match = VA.match = new VA.Match(o);
    VA.Touch.show(true);
    Audio2.play(this.match.stage.music);
  },
  restart() { const c = this.cfg; this.launch(c); },
  pause() {
    if (!this.match || this.paused || this.match.phase === 'matchEnd') return;
    this.paused = true;
    Input.releaseAll();
    Screens.push('pause');
    VA.Touch.show(false);
  },
  resume() {
    if (!this.paused) return;
    Screens.clear();
    this.paused = false;
    Input.releaseAll();
    VA.Touch.show(true);
  },
  quit() {
    this.match = VA.match = null; this.paused = false;
    FX.clear(); VA.Touch.show(false);
    Screens.show('title');
  },
  leaveMatch() { this.match = VA.match = null; this.paused = false; VA.Touch.show(false); },

  onMatchEnd(r, m) {
    const cfg = this.cfg;
    if (cfg.mode !== 'training') this.record(r, m);
    if (cfg.onEnd) return cfg.onEnd(r, m);
    // Versus e Contra a máquina: tela de resultados
    this.leaveMatch();
    Screens.show('results', {
      result: r,
      buttons: [
        ['Revanche', () => this.launch(cfg)],
        ['Trocar personagens', () => this.startMode(cfg.mode)],
        ['Menu principal', () => Screens.show('title')],
      ],
    });
  },

  // estatísticas persistentes (só lados humanos contam vitória/derrota)
  record(r, m) {
    const st = Save.stats;
    st.matches++;
    const humans = [0, 1].filter(i => m.isHumanSide(i));
    for (const i of humans) {
      const cs = Save.charStats(r.chars[i]);
      cs.used++;
      const s = r.stats[i];
      st.totalDamage += s.dmg; st.supers += s.supers; st.transforms += s.transforms; st.perfects += s.perfect || 0;
      st.maxCombo = Math.max(st.maxCombo, s.maxCombo); st.maxComboDamage = Math.max(st.maxComboDamage, s.maxComboDmg);
      if (humans.length === 1) {
        if (r.winner === i) { st.wins++; cs.wins++; } else if (r.winner < 0) st.draws++; else { st.losses++; cs.losses++; }
      } else if (r.winner === i) cs.wins++; else if (r.winner >= 0) cs.losses++;
    }
    if (humans.length !== 1 && r.winner < 0) st.draws++;
    Save.write();
  },

  // ------------------------------------------------------------ ARCADE
  arcadeStart(char) {
    const A = this.arcade = { char, i: 0, continues: 0, score: 0, time: 0, ladder: VA.chars[char].arcade.ladder };
    this.arcadeNext();
  },
  arcadeNext() {
    const A = this.arcade;
    if (A.i >= A.ladder.length) return this.arcadeFinish();
    const step = A.ladder[A.i];
    const base = Save.settings.difficulty;
    const lv = step.boss ? shiftLevel(base, 1) : A.i === 0 && base !== 'hard' ? shiftLevel(base, -1) : base;
    Screens.show('versus', {
      p1: A.char, p2: step.char, stage: step.stage, intro: step.intro, boss: step.boss, name: step.name,
      label: (step.boss ? 'Chefe final' : 'Luta ' + (A.i + 1)) + ' de ' + A.ladder.length + ' · ' + ({ easy: 'fácil', normal: 'normal', hard: 'difícil' })[lv],
      next: () => this.launch({ mode: 'arcade', p1: { char: A.char }, p2: { char: step.char, ai: lv }, stage: step.stage, onEnd: (r, m) => this.arcadeResult(r, m, step) }),
      quit: () => Screens.show('title'),
    });
  },
  arcadeResult(r, m, step) {
    const A = this.arcade;
    this.leaveMatch();
    A.time += r.time;
    if (r.winner === 0) {
      const f = r.stats[0];
      A.score += 1000 + r.hpLeft[0] + (f.perfect || 0) * 2000 + Math.max(0, 3000 - Math.floor(r.time / 6)) + f.maxCombo * 50;
      if (step.boss && step.char === 'trigg' && Save.unlock('stages', 'prisao')) A.unlockStage = true;
      A.i++;
      this.arcadeNext();
    } else {
      Screens.show('continue', {
        continues: A.continues,
        yes: () => { A.continues++; A.score = Math.floor(A.score * 0.7); this.arcadeNext(); },
        no: () => Screens.show('results', { result: r, lines: ['Fim de jogo no Arcade. Pontuação: ' + A.score], buttons: [['Tentar de novo', () => this.arcadeStart(A.char)], ['Menu principal', () => Screens.show('title')]] }),
      });
    }
  },
  arcadeFinish() {
    const A = this.arcade, st = Save.stats;
    const rec = st.arcade[A.char] || (st.arcade[A.char] = { clears: 0, bestTime: 0, bestScore: 0 });
    rec.clears++;
    if (!rec.bestTime || A.time < rec.bestTime) rec.bestTime = A.time;
    rec.bestScore = Math.max(rec.bestScore, A.score);
    const lines = [`Pontuação: <b>${A.score}</b> · Tempo: ${U.fmtTime(A.time)} · Continuações: ${A.continues}`];
    if (Save.unlock('endings', A.char)) lines.push('Final de ' + U.esc(VA.chars[A.char].name) + ' adicionado à Galeria.');
    if (Save.unlock('chars', 'kolt')) lines.push('<b>Novo lutador desbloqueado: KOLT</b>');
    if (A.unlockStage) lines.push('<b>Novo cenário desbloqueado: A Prisão Fora de Tudo</b>');
    Save.write();
    if (lines.length > 1) Audio2.sfx('unlock');
    Screens.show('ending', { char: A.char, lines, done: () => Screens.show('title') });
  },

  // ------------------------------------------------------------ SOBREVIVÊNCIA
  survivalStart(char) {
    this.surv = { char, wins: 0, hp: VA.chars[char].health, last: null };
    this.survivalNext();
  },
  survivalNext() {
    const S = this.surv;
    const pool = VA.charOrder.filter(id => id !== S.last);
    const opp = U.pick(pool);
    S.last = opp;
    const lv = S.wins < 3 ? 'easy' : S.wins < 7 ? 'normal' : 'hard';
    const stage = U.pick(VA.stageOrder.filter(id => Save.isStageUnlocked(id)));
    this.launch({
      mode: 'survival', p1: { char: S.char }, p2: { char: opp, ai: lv }, stage, rounds: 1, p1hp: S.hp,
      onEnd: (r) => {
        this.leaveMatch();
        if (r.winner === 0) {
          S.wins++;
          // recupera 20% da vida entre lutas: recurso limitado
          S.hp = Math.min(VA.chars[S.char].health, r.hpLeft[0] + Math.round(VA.chars[S.char].health * 0.2));
          VA.toast(`Vitória ${S.wins}! Vida recuperada: +20%`, '#7dffb0');
          this.survivalNext();
        } else {
          const sv = Save.stats.survival, rec = S.wins > sv.best;
          if (rec) { sv.best = S.wins; sv.char = S.char; Save.write(); }
          Screens.show('results', {
            result: r, lines: [`Sobrevivência: <b>${S.wins}</b> vitória(s) seguidas.` + (rec ? ' <b>Novo recorde!</b>' : ` Recorde: ${sv.best}.`)],
            buttons: [['Tentar de novo', () => this.survivalStart(S.char)], ['Menu principal', () => Screens.show('title')]],
          });
        }
      },
    });
  },
};
