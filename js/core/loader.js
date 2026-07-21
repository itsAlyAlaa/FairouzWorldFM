// ================================================================
// Splash-screen loader: simulated progress bar + fade-out, runs immediately (blocks nothing else).
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

(function(){
  // Shared helper: run non-critical work off the critical path, staggered
  // across idle slices so nothing competes with the loader / first paint.
  window.whenIdle = function(fn, timeout){
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, {timeout: timeout || 1200});
    } else {
      setTimeout(fn, Math.min(timeout || 1200, 300));
    }
  };

  document.documentElement.style.overflow = 'hidden';
  var loader = document.getElementById('siteLoader');
  var fill = document.getElementById('loaderFill');
  var percentEl = document.getElementById('loaderPercent');
  if (!loader) return;

  // Shorter, snappier minimum — still feels intentional without stalling the user.
  var DURATION = 1500;   // simulated fill duration (ms)
  var start = performance.now();
  var progress = 0, finished = false;

  function frame(now){
    var elapsed = now - start;
    var simulated = Math.min(92, (elapsed / DURATION) * 92);
    if (simulated > progress) progress = simulated;
    fill.style.width = progress + '%';
    percentEl.textContent = Math.floor(progress) + '%';
    if (!finished) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function finish(){
    if (finished) return;
    finished = true;
    fill.style.width = '100%';
    percentEl.textContent = '100%';
    setTimeout(function(){
      loader.classList.add('hide');
      document.documentElement.style.overflow = '';
      setTimeout(function(){
        if (loader.parentNode) loader.parentNode.removeChild(loader);
        document.documentElement.classList.remove('boot');
      }, 950);
    }, 300);
  }

  window.addEventListener('load', function(){
    var elapsed = performance.now() - start;
    var remaining = Math.max(0, DURATION - elapsed);
    setTimeout(finish, remaining);
  });
  // Safety net so the site is never blocked behind the loader indefinitely
  setTimeout(finish, 3500);
})();
