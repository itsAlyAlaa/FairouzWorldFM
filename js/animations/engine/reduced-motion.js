// ================================================================
// FairouzFX — Effects Engine: Reduced Motion
// Tracks the OS-level "prefers-reduced-motion" setting and keeps
// FairouzFX.prefersReducedMotion up to date, live, for the lifetime
// of the page. Does not touch the DOM and does not itself decide to
// stop anything — AnimationManager is the one that reads this flag.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

(function(){
  const mql = (window.matchMedia) ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  FairouzFX.prefersReducedMotion = !!(mql && mql.matches);

  if(!mql) return;

  function handleChange(e){
    FairouzFX.prefersReducedMotion = !!e.matches;
    if(FairouzFX.EventBus) FairouzFX.EventBus.emit('reduced-motion-change', FairouzFX.prefersReducedMotion);
  }

  // addEventListener is the modern API; addListener is a fallback for older
  // Safari versions that only support the deprecated MediaQueryList API.
  if(mql.addEventListener) mql.addEventListener('change', handleChange);
  else if(mql.addListener) mql.addListener(handleChange);
})();
