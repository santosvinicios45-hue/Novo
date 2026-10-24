// =====================================================================
//  touch.js — controles na tela para celulares/tablets (jogador 1).
// =====================================================================
'use strict';

VA.Touch = {
  on: false,
  init() {
    const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    if (!coarse && !('ontouchstart' in window)) return;
    this.on = true;
    Input.touch = {};
    const root = document.getElementById('touch');
    root.innerHTML = `
      <div class="t-pad">
        <button data-a="up" class="t-up">▲</button><button data-a="left" class="t-left">◀</button>
        <button data-a="right" class="t-right">▶</button><button data-a="down" class="t-down">▼</button>
      </div>
      <div class="t-btns">
        <button data-a="sp">U</button><button data-a="sp2">I</button><button data-a="su">O</button>
        <button data-a="lp">J</button><button data-a="hp">K</button><button data-a="block">L</button>
      </div>
      <button class="t-pause" data-a="pause">❚❚</button>`;
    const set = (el, v) => {
      const a = el.dataset.a; if (!a) return;
      if (a === 'pause') { if (v) VA.togglePause(); return; }
      if (v && !Input.touch[a]) Input.touch['tap_' + a] = true;
      Input.touch[a] = v; el.classList.toggle('on', v);
    };
    root.querySelectorAll('button').forEach(b => {
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); set(b, true); });
      b.addEventListener('pointerup', e => { e.preventDefault(); set(b, false); });
      b.addEventListener('pointercancel', () => set(b, false));
      b.addEventListener('contextmenu', e => e.preventDefault());
    });
  },
  show(v) { if (this.on) document.getElementById('touch').classList.toggle('show', v); },
};
