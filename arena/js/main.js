// =====================================================================
//  main.js — inicialização, laço de jogo com passo fixo (60 Hz),
//  escala da tela, tela cheia, perda de foco e erros visíveis.
// =====================================================================
'use strict';

(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const STEP = 1000 / FPS;
  let acc = 0, last = performance.now(), crashed = false;
  const menuFake = { frame: 0, totalFrames: 0, fighters: [], cam: { x: 180, y: 0 }, projectiles: [], announce() {} };

  // ------------------------------------------------------------ erros
  function showError(msg, detail) {
    const el = document.getElementById('boot-error');
    el.hidden = false;
    el.innerHTML = `<h2>Algo deu errado</h2><p>${U.esc(msg)}</p><pre>${U.esc(detail || '')}</pre>
      <p>Recarregue a página (F5). Se continuar, abra o console do navegador (F12) e envie a mensagem acima.</p>
      <button onclick="this.parentNode.hidden=true">Fechar</button>`;
  }
  window.addEventListener('error', e => {
    if (e.target && e.target !== window && (e.target.src || e.target.href)) { console.warn('Recurso não carregou:', e.target.src || e.target.href); return; }
    showError(e.message, (e.filename || '') + ':' + (e.lineno || ''));
  }, true);
  window.addEventListener('unhandledrejection', e => showError('Erro assíncrono', String(e.reason)));

  // ------------------------------------------------------------ tela
  function resize() {
    const ww = window.innerWidth, wh = window.innerHeight;
    const s = Math.min(ww / W, wh / H);
    canvas.style.width = Math.floor(W * s) + 'px';
    canvas.style.height = Math.floor(H * s) + 'px';
    document.documentElement.style.setProperty('--scale', s);
  }
  addEventListener('resize', resize);

  VA.toggleFullscreen = function () {
    const d = document;
    try {
      if (!d.fullscreenElement) (d.documentElement.requestFullscreen || d.documentElement.webkitRequestFullscreen).call(d.documentElement);
      else (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    } catch (e) { VA.toast('Tela cheia indisponível neste navegador.'); }
  };
  VA.togglePause = function () { const G = VA.Game; if (!G.match) return; if (G.paused) G.resume(); else G.pause(); };

  // ------------------------------------------------------------ atalhos globais
  function onKey(code) {
    const G = VA.Game, B = Input.bindings;
    const isPause = code === 'Escape' || code === B.p1.pause || code === B.p2.pause || code.startsWith('PadStart');
    if (G.match && isPause) {
      if (!G.paused) { G.pause(); return true; }
      if (code !== 'Escape' && Screens.cur && Screens.cur.name === 'pause') { G.resume(); return true; }
    }
    if (!G.match && code === 'KeyF' && !Input.isBound('KeyF')) { VA.toggleFullscreen(); return true; }
    return false;
  }

  // perder o foco pausa a luta (e solta as teclas presas)
  function autoPause() {
    Input.releaseAll();
    const G = VA.Game;
    if (G.match && !G.paused && G.match.phase !== 'matchEnd') G.pause();
  }
  addEventListener('blur', autoPause);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { autoPause(); Audio2.suspend(); } else { Audio2.resume(); last = performance.now(); acc = 0; }
  });
  // o áudio só pode começar depois de um gesto do usuário
  const unlock = () => { Audio2.init(); Audio2.resume(); };
  addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);

  // ------------------------------------------------------------ laço
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = now - last; last = now;
    if (dt > 250) dt = STEP;               // volta de aba: não tenta compensar
    acc += dt;
    const G = VA.Game;
    try {
      let steps = 0;
      while (acc >= STEP && steps < 4) {
        acc -= STEP; steps++;
        Input.update();
        if (G.match && !G.paused) G.match.step();
        else if (!G.match) { menuFake.frame++; menuFake.totalFrames++; FX.update(); }
        Screens.tick();
      }
      if (steps === 4) acc = 0;
      render();
    } catch (e) {
      if (!crashed) { crashed = true; console.error(e); showError(e.message, e.stack); }
    }
  }

  function render() {
    const G = VA.Game;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (G.match) {
      G.match.render(ctx);
      VA.HUD.draw(ctx, G.match);
      return;
    }
    // fundo animado dos menus: O Entre com o V parado lá no meio
    const st = VA.stages[VA.menuScene.stage];
    if (!menuFake.ready) { st.init(menuFake); menuFake.ready = true; }
    menuFake.cam.x = 180 + Math.sin(menuFake.frame * 0.002) * 120;
    st.drawBack(ctx, menuFake, menuFake.cam, 1, 0, 0);
    ctx.setTransform(1, 0, 0, 1, -menuFake.cam.x, 0);
    st.drawFloor(ctx, menuFake);
    if (st.update) st.update(menuFake);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(5,4,10,0.55)'; ctx.fillRect(0, 0, W, H);
    FX.draw(ctx, 'front');
    if (menuFake.frame % 8 === 0) FX.spawn('dot', U.rand(0, W), H + 4, U.rand(-0.2, 0.2), U.rand(-0.8, -0.3), 300, 1.5, '#cbbcff', { add: true });
  }

  // ------------------------------------------------------------ início
  function boot() {
    try {
      if (!VA.charOrder.length) throw new Error('Nenhum personagem foi carregado.');
      Input.init();
      Input.onKey = onKey;
      VA.Touch.init();
      Screens.init();
      resize();
      // atalho de teste: ?luta=v,trigg&cenario=cidade&cpu=hard
      const q = new URLSearchParams(location.search);
      if (q.get('luta')) {
        const [a, b] = q.get('luta').split(',');
        VA.Game.launch({ mode: q.get('treino') ? 'training' : 'cpu', p1: { char: a, ai: q.get('demo') ? (q.get('cpu1') || 'normal') : null }, p2: { char: b || 'trigg', ai: q.get('p2humano') ? null : (q.get('cpu') || 'normal') }, stage: q.get('cenario') || 'cidade', training: q.get('treino') ? { dummy: 'stand', infEnergy: true, refill: true } : null, timer: q.get('treino') ? 999 : undefined });
      } else Screens.show('title');
      requestAnimationFrame(t => { last = t; frame(t); });
    } catch (e) {
      console.error(e);
      showError('Falha ao iniciar o jogo: ' + e.message, e.stack);
    }
  }
  boot();
})();
