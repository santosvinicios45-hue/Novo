/* =========================================================================
   STICKER POWERS — núcleo: estado, salvamento, economia e progressão.
   Não depende do DOM, então pode ser testado no Node (tests/run-tests.js).
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  const Core = SP.Core = {};

  const SAVE_KEY = 'stickerPowers.save.v1';
  const BACKUP_KEY = 'stickerPowers.backup.v1';
  const SAVE_VERSION = 1;
  const HISTORY_MAX = 150;

  /* ---------------------------------------------------------------- utilidades */
  const clampInt = (v, min, max, def) => {
    const n = Math.floor(Number(v));
    if (!Number.isFinite(n)) return def;
    return Math.max(min, Math.min(max, n));
  };
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  Core.rng = Math.random;

  /** Data local do dispositivo no formato AAAA-MM-DD. */
  Core.todayKey = function (now) {
    const d = now ? new Date(now) : new Date();
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };
  /** Número da semana (segunda a domingo) desde uma época fixa, em horário local. */
  Core.weekIndex = function (now) {
    const d = now ? new Date(now) : new Date();
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const epoch = new Date(2024, 0, 1); // segunda-feira
    const days = Math.round((local - epoch) / 86400000);
    return Math.floor(days / 7);
  };
  Core.currentEvent = function (now) {
    const w = Core.weekIndex(now);
    const rot = SP.EVENT_ROTATION;
    const ev = rot[((w % rot.length) + rot.length) % rot.length];
    // fim da semana: próxima segunda 00:00 local
    const d = now ? new Date(now) : new Date();
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = (local.getDay() + 6) % 7; // 0 = segunda
    const ends = new Date(local.getFullYear(), local.getMonth(), local.getDate() + (7 - dow));
    return { name: ev.name, elements: ev.elements, endsAt: ends.getTime() };
  };

  /* ---------------------------------------------------------------- estado */
  Core.defaultSettings = function () {
    let reduced = false;
    try { reduced = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { /* sem suporte */ }
    return { music: true, sfx: true, volume: 0.7, reducedMotion: reduced, battleSpeed: 1, autoBattle: false };
  };

  Core.newState = function (now) {
    const t = now || Date.now();
    const st = {
      version: SAVE_VERSION,
      createdAt: t,
      coins: SP.PROG.startCoins,
      fragments: 0,
      essence: 0,
      tokens: { basic: 0, premium: 0 },
      owned: {},
      history: [],
      stats: {
        packsOpened: 0, battlesWon: 0, battlesLost: 0, skillsUsed: 0, advantageHits: 0,
        evolutions: 0, levelUps: 0, streak: 0, bestStreak: 0, stickersObtained: 0, totalCoinsEarned: 0
      },
      campaign: { cleared: 0 },
      tower: { floor: 1, best: 0 },
      bosses: {},          // bossId -> maior nível de desafio vencido (0 = nunca)
      missions: {},        // missionId -> true quando a recompensa foi resgatada
      daily: { date: '', freeClaimedAt: 0, counters: {}, claimed: {} },
      team: SP.PROG.starters.slice(),
      settings: Core.defaultSettings(),
      seenIntro: false
    };
    SP.PROG.starters.forEach(id => {
      st.owned[id] = { level: 1, xp: 0, stars: 1, count: 1, fav: false, firstAt: t };
    });
    return st;
  };

  /** Valida e corrige um save vindo do armazenamento. Nunca lança exceção. */
  Core.sanitize = function (raw, now) {
    const base = Core.newState(now);
    if (!isObj(raw)) return base;
    const st = base;
    st.createdAt = clampInt(raw.createdAt, 0, 8.64e15, base.createdAt);
    st.coins = clampInt(raw.coins, 0, 1e9, base.coins);
    st.fragments = clampInt(raw.fragments, 0, 1e9, 0);
    st.essence = clampInt(raw.essence, 0, 1e6, 0);
    if (isObj(raw.tokens)) {
      st.tokens.basic = clampInt(raw.tokens.basic, 0, 999, 0);
      st.tokens.premium = clampInt(raw.tokens.premium, 0, 999, 0);
    }
    if (isObj(raw.owned)) {
      const owned = {};
      Object.keys(raw.owned).forEach(id => {
        const o = raw.owned[id];
        if (!SP.STICKER[id] || !isObj(o)) return;
        const stars = clampInt(o.stars, 1, SP.PROG.maxStars, 1);
        const level = clampInt(o.level, 1, SP.PROG.levelCap(stars), 1);
        owned[id] = {
          stars, level,
          xp: clampInt(o.xp, 0, SP.PROG.xpToNext(level), 0),
          count: clampInt(o.count, 1, 1e6, 1),
          fav: o.fav === true,
          firstAt: clampInt(o.firstAt, 0, 8.64e15, 0)
        };
      });
      // garante que sempre exista pelo menos uma equipe jogável
      if (Object.keys(owned).length === 0) SP.PROG.starters.forEach(id => { owned[id] = base.owned[id]; });
      st.owned = owned;
    }
    if (Array.isArray(raw.history)) {
      st.history = raw.history.filter(h => isObj(h) && SP.STICKER[h.id]).slice(0, HISTORY_MAX).map(h => ({
        id: h.id, at: clampInt(h.at, 0, 8.64e15, 0), pack: typeof h.pack === 'string' ? h.pack.slice(0, 40) : '?',
        isNew: h.isNew === true, frags: clampInt(h.frags, 0, 1e6, 0)
      }));
    }
    if (isObj(raw.stats)) {
      Object.keys(st.stats).forEach(k => { st.stats[k] = clampInt(raw.stats[k], 0, 1e9, 0); });
    }
    if (isObj(raw.campaign)) st.campaign.cleared = clampInt(raw.campaign.cleared, 0, SP.STAGE_COUNT, 0);
    if (isObj(raw.tower)) {
      st.tower.best = clampInt(raw.tower.best, 0, 1e6, 0);
      st.tower.floor = clampInt(raw.tower.floor, 1, st.tower.best + 1, 1);
    }
    if (isObj(raw.bosses)) SP.BOSSES.forEach(b => { if (raw.bosses[b.id]) st.bosses[b.id] = clampInt(raw.bosses[b.id], 0, 99, 0); });
    if (isObj(raw.missions)) SP.MISSIONS.forEach(m => { if (raw.missions[m.id] === true) st.missions[m.id] = true; });
    if (isObj(raw.daily)) {
      st.daily.date = typeof raw.daily.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.daily.date) ? raw.daily.date : '';
      st.daily.freeClaimedAt = clampInt(raw.daily.freeClaimedAt, 0, 8.64e15, 0);
      if (isObj(raw.daily.counters)) ['packs', 'wins', 'skills', 'upgrades'].forEach(k => { st.daily.counters[k] = clampInt(raw.daily.counters[k], 0, 1e6, 0); });
      if (isObj(raw.daily.claimed)) SP.DAILY_MISSIONS.forEach(m => { if (raw.daily.claimed[m.id] === true) st.daily.claimed[m.id] = true; });
    }
    if (Array.isArray(raw.team)) {
      const team = raw.team.filter((id, i, a) => st.owned[id] && a.indexOf(id) === i).slice(0, 3);
      st.team = team.length ? team : Object.keys(st.owned).slice(0, 3);
    } else {
      st.team = Object.keys(st.owned).slice(0, 3);
    }
    if (isObj(raw.settings)) {
      const s = raw.settings;
      st.settings.music = s.music !== false;
      st.settings.sfx = s.sfx !== false;
      st.settings.volume = Number.isFinite(+s.volume) ? Math.max(0, Math.min(1, +s.volume)) : 0.7;
      st.settings.reducedMotion = s.reducedMotion === true;
      st.settings.battleSpeed = [1, 2, 3].indexOf(+s.battleSpeed) >= 0 ? +s.battleSpeed : 1;
      st.settings.autoBattle = s.autoBattle === true;
    }
    st.seenIntro = raw.seenIntro === true;
    return st;
  };

  /* ---------------------------------------------------------------- salvamento */
  Core.storage = null;
  try { if (root.localStorage) Core.storage = root.localStorage; } catch (e) { Core.storage = null; }
  Core.saveError = null;
  Core.loadNotice = null;

  Core.load = function () {
    Core.loadNotice = null;
    if (!Core.storage) {
      Core.loadNotice = 'Armazenamento local indisponível: o progresso não será salvo nesta sessão.';
      SP.state = Core.newState();
      return SP.state;
    }
    let text = null;
    try { text = Core.storage.getItem(SAVE_KEY); } catch (e) { text = null; }
    if (!text) { SP.state = Core.newState(); return SP.state; }
    try {
      const raw = JSON.parse(text);
      SP.state = Core.sanitize(raw);
    } catch (e) {
      // save corrompido: tenta o backup antes de recomeçar
      let backup = null;
      try { backup = Core.storage.getItem(BACKUP_KEY); } catch (e2) { backup = null; }
      try {
        SP.state = Core.sanitize(JSON.parse(backup));
        Core.loadNotice = 'O save principal estava corrompido. Restauramos a cópia de segurança.';
      } catch (e3) {
        SP.state = Core.newState();
        Core.loadNotice = 'O save estava corrompido e foi reiniciado.';
      }
    }
    return SP.state;
  };

  Core.save = function () {
    if (!Core.storage || !SP.state) return false;
    try {
      const text = JSON.stringify(SP.state);
      const prev = Core.storage.getItem(SAVE_KEY);
      if (prev) Core.storage.setItem(BACKUP_KEY, prev);
      Core.storage.setItem(SAVE_KEY, text);
      Core.saveError = null;
      return true;
    } catch (e) {
      Core.saveError = 'Não foi possível salvar (armazenamento cheio ou bloqueado).';
      return false;
    }
  };

  Core.reset = function () {
    try { if (Core.storage) { Core.storage.removeItem(SAVE_KEY); Core.storage.removeItem(BACKUP_KEY); } } catch (e) { /* ignora */ }
    const settings = SP.state ? SP.state.settings : null;
    SP.state = Core.newState();
    if (settings) SP.state.settings = settings;
    Core.save();
  };

  Core.exportSave = function () { return JSON.stringify(SP.state); };
  Core.importSave = function (text) {
    const raw = JSON.parse(text); // lança se inválido; a UI trata
    if (!isObj(raw) || !isObj(raw.owned)) throw new Error('Formato inválido');
    SP.state = Core.sanitize(raw);
    Core.save();
    return SP.state;
  };

  /* ---------------------------------------------------------------- atributos */
  Core.baseStats = function (id) {
    const s = SP.STICKER[id];
    const r = SP.RARITY[s.rarity], role = SP.ROLES[s.role], B = SP.BASE_STATS;
    return {
      hp: B.hp * r.mult * role.hp,
      atk: B.atk * r.mult * role.atk,
      def: B.def * r.mult * role.def,
      spd: B.spd * (1 + (r.mult - 1) * 0.5) * role.spd
    };
  };

  Core.statsFor = function (id, level, stars) {
    const b = Core.baseStats(id);
    const lv = level || 1, st = stars || 1;
    const m = (1 + SP.PROG.levelGrowth * (lv - 1)) * (1 + SP.PROG.starGrowth * (st - 1));
    const spdM = (1 + 0.012 * (lv - 1)) * (1 + 0.05 * (st - 1));
    return {
      hp: Math.round(b.hp * m),
      atk: Math.round(b.atk * m),
      def: Math.round(b.def * m),
      spd: Math.round(b.spd * spdM * 10) / 10,
      en: SP.STICKER[id].en
    };
  };
  Core.power = function (stats) {
    return Math.round(stats.hp * 0.25 + stats.atk * 2.2 + stats.def * 1.6 + stats.spd * 2);
  };
  Core.ownedStats = function (id) {
    const o = SP.state.owned[id];
    return Core.statsFor(id, o ? o.level : 1, o ? o.stars : 1);
  };
  Core.ownedPower = function (id) { return Core.power(Core.ownedStats(id)); };

  /** Habilidade efetiva (estrela 3 desperta a habilidade). */
  Core.skillFor = function (id, stars) {
    const sk = SP.STICKER[id].skill;
    const st = stars || 1;
    if (st < 3) return sk;
    const supreme = st >= 5;
    const k = supreme ? SP.PROG.supremePower : SP.PROG.awakenedPower;
    return Object.assign({}, sk, {
      name: sk.name + (supreme ? ' ✦✦' : ' ✦'), awakened: true, supreme, cost: Math.max(1, sk.cost - 1),
      fx: sk.fx.map(f => {
        const g = Object.assign({}, f);
        if (g.p) g.p = Math.round(g.p * k * 100) / 100;
        if (g.pct) g.pct = Math.round(g.pct * k * 100) / 100;
        return g;
      })
    });
  };

  /* ---------------------------------------------------------------- recursos */
  Core.addCoins = function (n) {
    SP.state.coins = Math.max(0, SP.state.coins + n);
    if (n > 0) SP.state.stats.totalCoinsEarned += n;
  };
  Core.giveReward = function (rw) {
    if (!rw) return;
    if (rw.coins) Core.addCoins(rw.coins);
    if (rw.fragments) SP.state.fragments += rw.fragments;
    if (rw.essence) SP.state.essence += rw.essence;
    if (rw.tokens) Object.keys(rw.tokens).forEach(k => { SP.state.tokens[k] = (SP.state.tokens[k] || 0) + rw.tokens[k]; });
  };
  Core.rewardText = function (rw) {
    const parts = [];
    if (rw.coins) parts.push(rw.coins + ' moedas');
    if (rw.fragments) parts.push(rw.fragments + ' fragmentos');
    if (rw.essence) parts.push(rw.essence + ' essência');
    if (rw.xp) parts.push(rw.xp + ' XP');
    if (rw.tokens) Object.keys(rw.tokens).forEach(k => parts.push(rw.tokens[k] + '× ' + (k === 'premium' ? 'Pacote Premium' : 'Pacote Básico')));
    if (rw.sticker) parts.push('Sticker ' + SP.STICKER[rw.sticker].name);
    return parts.join(' · ');
  };

  /* ---------------------------------------------------------------- pacotes e probabilidades */
  Core.packPool = function (pack) {
    return SP.STICKERS.filter(s => !s.bossOnly && (!pack.elements || pack.elements.indexOf(s.el) >= 0));
  };

  /** Probabilidades REAIS usadas no sorteio, por raridade e por sticker. */
  Core.packOdds = function (packId, now, opts) {
    const pack = SP.PACK[packId];
    const rates = SP.RATES[pack.rates];
    const pool = Core.packPool(pack);
    const minRank = opts && opts.minRank != null ? opts.minRank : 0;
    const featured = pack.event ? Core.currentEvent(now).elements : [];
    const byRarity = {};
    SP.RARITIES.forEach(r => { byRarity[r.id] = pool.filter(s => s.rarity === r.id); });
    let total = 0;
    SP.RARITIES.forEach(r => { if (r.rank >= minRank && byRarity[r.id].length) total += rates[r.id]; });
    const rarities = [], stickers = [];
    SP.RARITIES.forEach(r => {
      const list = byRarity[r.id];
      const pr = (r.rank >= minRank && list.length && total > 0) ? rates[r.id] / total : 0;
      rarities.push({ id: r.id, p: pr, count: list.length });
      if (!pr) return;
      const w = s => (featured.indexOf(s.el) >= 0 ? SP.EVENT_WEIGHT : 1);
      const wsum = list.reduce((a, s) => a + w(s), 0);
      list.forEach(s => stickers.push({ id: s.id, p: pr * w(s) / wsum, featured: w(s) > 1 }));
    });
    return { rarities, stickers, featured };
  };

  Core.rollFromOdds = function (odds, rng) {
    const r = (rng || Core.rng)();
    let acc = 0;
    for (let i = 0; i < odds.stickers.length; i++) {
      acc += odds.stickers[i].p;
      if (r < acc) return odds.stickers[i].id;
    }
    return odds.stickers[odds.stickers.length - 1].id;
  };

  Core.freePackAvailable = function (now) {
    const t = now || Date.now();
    const d = SP.state.daily;
    if (d.freeClaimedAt > t) return false; // relógio voltou no tempo: espera alcançar
    return Core.todayKey(d.freeClaimedAt || 0) !== Core.todayKey(t) || !d.freeClaimedAt;
  };
  Core.msToMidnight = function (now) {
    const d = new Date(now || Date.now());
    const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return next - d;
  };

  /** Verifica se o pacote pode ser aberto e com qual forma de pagamento. */
  Core.packPayment = function (packId, now) {
    const pack = SP.PACK[packId];
    const st = SP.state;
    if (pack.daily) return Core.freePackAvailable(now) ? { ok: true, via: 'daily' } : { ok: false, reason: 'Volte amanhã para outro pacote grátis.' };
    if (st.tokens[packId] > 0) return { ok: true, via: 'token' };
    if (pack.cost.coins && st.coins >= pack.cost.coins) return { ok: true, via: 'coins' };
    if (pack.cost.essence && st.essence >= pack.cost.essence) return { ok: true, via: 'essence' };
    if (pack.cost.coins) return { ok: false, reason: 'Moedas insuficientes.' };
    return { ok: false, reason: 'Essência insuficiente. Derrote chefes para obter.' };
  };

  /** Abre um pacote: cobra, sorteia, adiciona à coleção. Retorna os resultados. */
  Core.openPack = function (packId, opts) {
    opts = opts || {};
    const now = opts.now || Date.now();
    const rng = opts.rng || Core.rng;
    const pack = SP.PACK[packId];
    const pay = Core.packPayment(packId, now);
    if (!pay.ok) return { ok: false, reason: pay.reason };
    const st = SP.state;
    if (pay.via === 'daily') st.daily.freeClaimedAt = now;
    else if (pay.via === 'token') st.tokens[packId]--;
    else if (pay.via === 'coins') st.coins -= pack.cost.coins;
    else if (pay.via === 'essence') st.essence -= pack.cost.essence;

    const odds = Core.packOdds(packId, now);
    const gOdds = pack.guarantee ? Core.packOdds(packId, now, { minRank: pack.guarantee.minRank }) : null;
    const results = [];
    for (let i = 0; i < pack.count; i++) {
      const id = Core.rollFromOdds(gOdds && i === pack.guarantee.slot ? gOdds : odds, rng);
      results.push(Core.addSticker(id, pack.name, now));
    }
    st.stats.packsOpened++;
    Core.dailyCount('packs', 1, now);
    return { ok: true, results, via: pay.via };
  };

  /** Adiciona um sticker; duplicatas viram fragmentos. */
  Core.addSticker = function (id, source, now) {
    const st = SP.state, s = SP.STICKER[id];
    const t = now || Date.now();
    const o = st.owned[id];
    let res;
    if (!o) {
      st.owned[id] = { level: 1, xp: 0, stars: 1, count: 1, fav: false, firstAt: t };
      res = { id, isNew: true, frags: 0 };
    } else {
      o.count++;
      const frags = SP.RARITY[s.rarity].dupeFrags;
      st.fragments += frags;
      res = { id, isNew: false, frags };
    }
    st.stats.stickersObtained++;
    st.history.unshift({ id, at: t, pack: source || '?', isNew: res.isNew, frags: res.frags });
    if (st.history.length > HISTORY_MAX) st.history.length = HISTORY_MAX;
    return res;
  };

  /** Forja: cria um sticker ainda não obtido usando fragmentos. */
  Core.craftCost = function (id) { return SP.RARITY[SP.STICKER[id].rarity].craft; };
  Core.craft = function (id) {
    const s = SP.STICKER[id];
    const cost = Core.craftCost(id);
    if (s.bossOnly || cost == null) return { ok: false, reason: 'Este sticker não pode ser forjado.' };
    if (SP.state.owned[id]) return { ok: false, reason: 'Você já possui este sticker.' };
    if (SP.state.fragments < cost) return { ok: false, reason: 'Fragmentos insuficientes.' };
    SP.state.fragments -= cost;
    Core.addSticker(id, 'Forja');
    return { ok: true };
  };

  /* ---------------------------------------------------------------- progressão */
  /** Dá XP; retorna quantos níveis subiu. XP para no limite da estrela atual. */
  Core.grantXp = function (id, xp) {
    const o = SP.state.owned[id];
    if (!o) return 0;
    const cap = SP.PROG.levelCap(o.stars);
    let ups = 0;
    o.xp += xp;
    while (o.level < cap && o.xp >= SP.PROG.xpToNext(o.level)) {
      o.xp -= SP.PROG.xpToNext(o.level);
      o.level++;
      ups++;
    }
    if (o.level >= cap) o.xp = 0;
    SP.state.stats.levelUps += ups;
    return ups;
  };

  Core.canTrain = function (id) {
    const o = SP.state.owned[id];
    if (!o) return { ok: false, reason: 'Sticker não encontrado.' };
    if (o.level >= SP.PROG.levelCap(o.stars)) return { ok: false, reason: 'Nível máximo para esta estrela. Evolua para continuar.' };
    if (SP.state.coins < SP.PROG.trainCost) return { ok: false, reason: 'Moedas insuficientes.' };
    return { ok: true };
  };
  Core.train = function (id) {
    const c = Core.canTrain(id);
    if (!c.ok) return c;
    SP.state.coins -= SP.PROG.trainCost;
    const ups = Core.grantXp(id, SP.PROG.trainXp);
    Core.dailyCount('upgrades', 1);
    return { ok: true, levels: ups };
  };

  Core.evoInfo = function (id) {
    const o = SP.state.owned[id];
    const s = SP.STICKER[id];
    if (!o) return null;
    const maxed = o.stars >= SP.PROG.maxStars;
    const info = {
      maxed,
      needLevel: SP.PROG.levelCap(o.stars),
      coins: maxed ? 0 : SP.PROG.evoCoins(o.stars),
      frags: maxed ? 0 : SP.PROG.evoFrags(s.rarity, o.stars),
      essence: maxed ? 0 : SP.PROG.evoEssence(o.stars),
      before: Core.statsFor(id, o.level, o.stars),
      after: maxed ? null : Core.statsFor(id, o.level, o.stars + 1),
      unlock: o.stars === 1 ? 'Talento elemental: ' + SP.ELEMENT[s.el].passive + ' + brilho holográfico na carta.'
            : o.stars === 2 ? 'Habilidade Desperta: +25% de poder e custo −1 + aura animada na carta.'
            : o.stars === 3 ? 'Limite de nível 40 + moldura de cristal na carta.'
            : o.stars === 4 ? 'Forma Suprema: habilidade com +50% de poder (em vez de +25%) + coroa de luz na carta.' : ''
    };
    info.levelOk = o.level >= info.needLevel;
    info.coinsOk = SP.state.coins >= info.coins;
    info.fragsOk = SP.state.fragments >= info.frags;
    info.essenceOk = SP.state.essence >= info.essence;
    info.ok = !maxed && info.levelOk && info.coinsOk && info.fragsOk && info.essenceOk;
    return info;
  };
  Core.evolve = function (id) {
    const info = Core.evoInfo(id);
    if (!info) return { ok: false, reason: 'Sticker não encontrado.' };
    if (info.maxed) return { ok: false, reason: 'Já está na evolução máxima.' };
    if (!info.levelOk) return { ok: false, reason: 'Precisa estar no nível ' + info.needLevel + '.' };
    if (!info.coinsOk) return { ok: false, reason: 'Moedas insuficientes.' };
    if (!info.fragsOk) return { ok: false, reason: 'Fragmentos insuficientes.' };
    if (!info.essenceOk) return { ok: false, reason: 'Essência insuficiente. Derrote chefes ou suba a Torre Infinita.' };
    const o = SP.state.owned[id];
    SP.state.coins -= info.coins;
    SP.state.fragments -= info.frags;
    SP.state.essence -= info.essence;
    o.stars++;
    o.xp = 0;
    SP.state.stats.evolutions++;
    Core.dailyCount('upgrades', 1);
    return { ok: true, stars: o.stars };
  };

  /* ---------------------------------------------------------------- coleção */
  Core.uniqueOwned = () => Object.keys(SP.state.owned).length;
  Core.completion = () => Core.uniqueOwned() / SP.STICKERS.length;
  Core.elementProgress = function (el) {
    const all = SP.STICKERS.filter(s => s.el === el);
    return { owned: all.filter(s => SP.state.owned[s.id]).length, total: all.length };
  };
  Core.toggleFav = function (id) {
    const o = SP.state.owned[id];
    if (o) o.fav = !o.fav;
    return o ? o.fav : false;
  };

  /* ---------------------------------------------------------------- missões */
  Core.missionValue = function (stat) {
    const st = SP.state;
    switch (stat) {
      case 'bestRank': return Object.keys(st.owned).reduce((m, id) => Math.max(m, SP.RARITY[SP.STICKER[id].rarity].rank), 0);
      case 'maxLevel': return Object.keys(st.owned).reduce((m, id) => Math.max(m, st.owned[id].level), 0);
      case 'maxStars': return Object.keys(st.owned).reduce((m, id) => Math.max(m, st.owned[id].stars), 0);
      case 'cleared': return st.campaign.cleared;
      case 'towerBest': return st.tower.best;
      case 'uniqueOwned': return Core.uniqueOwned();
      case 'bossKinds': return SP.BOSSES.filter(b => st.bosses[b.id] > 0).length;
      case 'bossKinds1': return SP.BOSSES.filter(b => !b.act && st.bosses[b.id] > 0).length;
      case 'elementsComplete': return SP.ELEMENTS.filter(e => { const p = Core.elementProgress(e.id); return p.owned === p.total; }).length;
      default: return st.stats[stat] || 0;
    }
  };
  Core.missionStatus = function (m) {
    const v = Core.missionValue(m.stat);
    return { value: Math.min(v, m.goal), goal: m.goal, done: v >= m.goal, claimed: !!SP.state.missions[m.id] };
  };
  Core.claimMission = function (id) {
    const m = SP.MISSIONS.find(x => x.id === id);
    if (!m) return { ok: false };
    const s = Core.missionStatus(m);
    if (!s.done || s.claimed) return { ok: false };
    SP.state.missions[id] = true;
    Core.giveReward(m.reward);
    return { ok: true, reward: m.reward };
  };

  /** Reinicia contadores diários quando a data local muda. */
  Core.ensureDaily = function (now) {
    const key = Core.todayKey(now);
    const d = SP.state.daily;
    if (d.date !== key) {
      d.date = key;
      d.counters = { packs: 0, wins: 0, skills: 0, upgrades: 0 };
      d.claimed = {};
      return true;
    }
    return false;
  };
  Core.dailyCount = function (counter, n, now) {
    Core.ensureDaily(now);
    const c = SP.state.daily.counters;
    c[counter] = (c[counter] || 0) + n;
  };
  Core.dailyStatus = function (m, now) {
    Core.ensureDaily(now);
    const v = SP.state.daily.counters[m.counter] || 0;
    return { value: Math.min(v, m.goal), goal: m.goal, done: v >= m.goal, claimed: !!SP.state.daily.claimed[m.id] };
  };
  Core.claimDaily = function (id, now) {
    const m = SP.DAILY_MISSIONS.find(x => x.id === id);
    if (!m) return { ok: false };
    const s = Core.dailyStatus(m, now);
    if (!s.done || s.claimed) return { ok: false };
    SP.state.daily.claimed[id] = true;
    Core.giveReward(m.reward);
    return { ok: true, reward: m.reward };
  };
  Core.claimableCount = function (now) {
    let n = SP.MISSIONS.filter(m => { const s = Core.missionStatus(m); return s.done && !s.claimed; }).length;
    n += SP.DAILY_MISSIONS.filter(m => { const s = Core.dailyStatus(m, now); return s.done && !s.claimed; }).length;
    return n;
  };

  /* ---------------------------------------------------------------- batalhas: montagem e recompensas */
  Core.teamPowerLevel = function (team) {
    const ids = team.filter(id => SP.state.owned[id]);
    if (!ids.length) return 1;
    return Math.max(1, Math.round(ids.reduce((a, id) => a + SP.state.owned[id].level, 0) / ids.length));
  };

  /** Sorteio determinístico simples (para fases sempre terem os mesmos inimigos). */
  Core.seeded = function (seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return (s % 1000000) / 1000000;
    };
  };

  Core.stageEnemies = function (n) {
    const info = SP.stageInfo(n);
    if (info.boss || !info.enemies) return null;
    return info.enemies.map(id => ({ id, level: info.enemyLevel, stars: info.stars }));
  };

  Core.quickEnemies = function (team, rng) {
    const r = rng || Core.rng;
    const lvl = Core.teamPowerLevel(team);
    const ranks = Object.keys(SP.state.owned).map(id => SP.RARITY[SP.STICKER[id].rarity].rank);
    const maxRank = Math.min(5, Math.max(1, Math.max.apply(null, ranks)));
    const pool = SP.STICKERS.filter(s => !s.bossOnly && SP.RARITY[s.rarity].rank <= maxRank);
    const picks = [];
    while (picks.length < 3) {
      const s = pool[Math.floor(r() * pool.length)];
      if (picks.indexOf(s.id) < 0) picks.push(s.id);
    }
    const stars = SP.starsForLevel(lvl);
    return picks.map(id => ({ id, level: Math.max(1, lvl - 1 + Math.floor(r() * 2)), stars }));
  };

  /* ---------------------------------------------------------------- torre infinita */
  Core.towerSpec = function (floor) {
    const T = SP.TOWER;
    const level = T.levelFor(floor);
    if (T.isBoss(floor)) {
      const b = SP.BOSSES[(floor / 10 - 1) % SP.BOSSES.length];
      return { floor, level, boss: { id: b.id, level } };
    }
    const rnd = Core.seeded(floor * 104729 + 7);
    const maxRank = Math.min(6, 1 + Math.floor(floor / 8));
    const pool = SP.STICKERS.filter(s => !s.bossOnly && SP.RARITY[s.rarity].rank <= maxRank);
    const picks = [];
    while (picks.length < 3) {
      const s = pool[Math.floor(rnd() * pool.length)];
      if (picks.indexOf(s.id) < 0) picks.push(s.id);
    }
    return { floor, level, enemies: picks.map(id => ({ id, level, stars: SP.starsForLevel(level) })) };
  };

  Core.bossLevel = function (bossId, tier) {
    const b = SP.BOSS[bossId];
    const base = SP.stageInfo(b.stage).level;
    return Math.min(80, base + (tier - 1) * 4);
  };
  Core.nextBossTier = function (bossId) { return (SP.state.bosses[bossId] || 0) + 1; };
  Core.bossUnlocked = function (bossId) { return SP.state.campaign.cleared >= SP.BOSS[bossId].stage - 1; };

  /**
   * Aplica o resultado de uma batalha.
   * battle: { kind: 'stage'|'quick'|'boss', stage, bossId, tier, team, win, skillsUsed, advantageHits }
   * Retorna as recompensas efetivamente concedidas.
   */
  Core.applyBattleResult = function (b, now) {
    const st = SP.state;
    st.stats.skillsUsed += b.skillsUsed || 0;
    st.stats.advantageHits += b.advantageHits || 0;
    if (b.skillsUsed) Core.dailyCount('skills', b.skillsUsed, now);
    const rw = { coins: 0, fragments: 0, essence: 0, xp: 0, levelUps: [], firstClear: false, sticker: null, tokens: null };
    if (b.fled) {
      // desistir conta como derrota e não dá recompensa nenhuma
      st.stats.battlesLost++;
      st.stats.streak = 0;
      if (b.kind === 'tower') st.tower.floor = SP.TOWER.checkpoint(st.tower.floor);
      return rw;
    }
    if (b.win) {
      st.stats.battlesWon++;
      st.stats.streak++;
      st.stats.bestStreak = Math.max(st.stats.bestStreak, st.stats.streak);
      Core.dailyCount('wins', 1, now);
      if (b.kind === 'stage') {
        const info = SP.stageInfo(b.stage);
        const first = b.stage > st.campaign.cleared;
        rw.coins = info.coins; rw.fragments = info.frags; rw.xp = info.xp;
        if (first) {
          rw.firstClear = true;
          rw.coins += info.firstCoins; rw.fragments += info.firstFrags;
          st.campaign.cleared = b.stage;
        }
        if (info.boss) {
          const r2 = Core._bossWin(info.boss.id, 1);
          rw.coins += r2.coins; rw.fragments += r2.fragments; rw.essence += r2.essence;
          if (r2.sticker) rw.sticker = r2.sticker;
        }
      } else if (b.kind === 'tower') {
        const T = SP.TOWER, f = st.tower.floor;
        const r = T.rewards(f);
        rw.coins = r.coins; rw.fragments = r.fragments; rw.xp = r.xp; rw.floor = f;
        if (T.isBoss(f)) {
          const bb = T.bossBonus(f);
          rw.essence += bb.essence; rw.tokens = bb.tokens;
        }
        st.tower.best = Math.max(st.tower.best, f);
        st.tower.floor = f + 1;
      } else if (b.kind === 'boss') {
        const r2 = Core._bossWin(b.bossId, b.tier);
        rw.coins = r2.coins; rw.fragments = r2.fragments; rw.essence = r2.essence; rw.xp = 40 + b.tier * 25;
        if (r2.sticker) rw.sticker = r2.sticker;
        if (b.tier >= 2) rw.tokens = { premium: 1 };
      } else {
        const lvl = Core.teamPowerLevel(b.team);
        rw.coins = 50 + lvl * 8; rw.fragments = 3 + Math.floor(lvl / 2); rw.xp = 20 + lvl * 5;
      }
    } else {
      st.stats.battlesLost++;
      st.stats.streak = 0;
      // consolação: um pouco de XP para não travar a progressão
      rw.xp = b.kind === 'stage' ? Math.round(SP.stageInfo(b.stage).xp * 0.4) : 15;
      rw.coins = 15;
      if (b.kind === 'tower') { rw.fellTo = SP.TOWER.checkpoint(st.tower.floor); st.tower.floor = rw.fellTo; }
    }
    Core.addCoins(rw.coins);
    st.fragments += rw.fragments;
    st.essence += rw.essence;
    if (rw.tokens) Core.giveReward({ tokens: rw.tokens });
    (b.team || []).forEach(id => {
      const before = st.owned[id] ? st.owned[id].level : 0;
      const ups = Core.grantXp(id, rw.xp);
      if (ups) rw.levelUps.push({ id, from: before, to: st.owned[id].level });
    });
    return rw;
  };

  Core._bossWin = function (bossId, tier) {
    const st = SP.state;
    const r = SP.bossTierRewards(tier);
    const out = { coins: r.coins, fragments: r.fragments, essence: r.essence, sticker: null };
    const firstEver = !(st.bosses[bossId] > 0);
    st.bosses[bossId] = Math.max(st.bosses[bossId] || 0, tier);
    if (firstEver) {
      const sid = SP.BOSS[bossId].reward;
      Core.addSticker(sid, SP.BOSS[bossId].name);
      out.sticker = sid;
    }
    return out;
  };
})(typeof window !== 'undefined' ? window : globalThis);
