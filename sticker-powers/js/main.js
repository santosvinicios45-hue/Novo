/* =========================================================================
   STICKER POWERS — inicialização.
   ========================================================================= */
(function (root) {
  'use strict';
  const SP = root.SP;
  function boot() {
    SP.Core.load();
    SP.Core.ensureDaily();
    SP.FX.init(document.getElementById('fx'));
    SP.UI.init();
    SP.UI.render('home');
    if (SP.Core.loadNotice) SP.UI.toast(SP.Core.loadNotice, 'bad');
    SP.Core.save();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
