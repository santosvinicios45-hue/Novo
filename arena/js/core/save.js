// =====================================================================
//  save.js — progresso, estatísticas e configurações (localStorage)
// =====================================================================
'use strict';

const Save = VA.Save = {
  KEY: 'v-arena-save-v1',
  ok: true,          // false se o navegador bloquear o armazenamento
  data: null,

  defaults() {
    return {
      version: 1,
      settings: {
        master: 0.8, music: 0.55, sfx: 0.85, mute: false,
        difficulty: 'normal', rounds: 2, timer: 99,
        announcer: true, shake: true, hitboxes: false,
      },
      bindings: null,  // null = padrão (ver input.js)
      unlocks: { chars: {}, stages: {}, endings: {} },
      stats: {
        matches: 0, wins: 0, losses: 0, draws: 0,
        perChar: {},            // id -> { used, wins, losses }
        totalDamage: 0, maxCombo: 0, maxComboDamage: 0,
        supers: 0, transforms: 0, perfects: 0,
        arcade: {},             // id -> { clears, bestTime, bestScore }
        survival: { best: 0, char: null },
      },
    };
  },

  load() {
    let raw = null;
    try { raw = localStorage.getItem(this.KEY); } catch (e) { this.ok = false; }
    let d = null;
    if (raw) { try { d = JSON.parse(raw); } catch (e) { console.warn('Save corrompido, recriando.'); } }
    this.data = d ? U.merge(this.defaults(), d) : this.defaults();
    return this.data;
  },

  write() {
    if (!this.ok) return false;
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); return true; }
    catch (e) { this.ok = false; console.warn('Não foi possível salvar o progresso:', e.message); return false; }
  },

  reset() { this.data = this.defaults(); this.write(); },

  get settings() { return this.data.settings; },
  get stats() { return this.data.stats; },

  charStats(id) {
    const p = this.data.stats.perChar;
    return p[id] || (p[id] = { used: 0, wins: 0, losses: 0 });
  },

  // ----- desbloqueios
  isCharUnlocked(id) { const c = VA.chars[id]; return !!c && (!c.locked || !!this.data.unlocks.chars[id]); },
  isStageUnlocked(id) { const s = VA.stages[id]; return !!s && (!s.unlock || !!this.data.unlocks.stages[id]); },
  unlock(kind, id) {
    const u = this.data.unlocks[kind];
    if (u[id]) return false;
    u[id] = true; this.write();
    return true;
  },
};
Save.load();
