// ================================================================
// FairouzFX — Effects Engine: Animation Manager
// The single place future effect modules register themselves with,
// and the single place the rest of the app asks to start/stop an
// effect by id. It is the only piece that decides *whether* an
// effect is allowed to run right now (master switch, reduced-motion,
// performance state), so individual effects never have to duplicate
// that logic.
//
// Nothing calls .start(id) anywhere yet — there are no effect
// modules to register in this phase. This file only prepares the
// machinery; it has zero visual or performance effect on its own.
//
// Usage (for future phases):
//   FairouzFX.AnimationManager.register('starfield', {
//     start(){ ...begin drawing... },
//     stop(){ ...cancel raf / clear canvas... },
//     heavy: true // optional hint; effects can mark themselves as
//                  // safe to auto-stop on 'performance:degrade'
//   });
//   FairouzFX.AnimationManager.start('starfield');
//
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

FairouzFX.AnimationManager = (function(){
  const registry = {};          // id -> { start, stop, heavy? }
  const running = new Set();    // ids currently started

  function register(id, effect){
    if(!id || typeof id !== 'string'){
      console.warn('[FairouzFX.AnimationManager] register() needs a string id');
      return;
    }
    if(!effect || typeof effect.start !== 'function' || typeof effect.stop !== 'function'){
      console.warn('[FairouzFX.AnimationManager] effect "'+id+'" must provide start() and stop()');
      return;
    }
    registry[id] = effect;
  }

  function unregister(id){
    stop(id);
    delete registry[id];
  }

  function canRun(){
    const cfg = FairouzFX.config;
    if(!cfg || !cfg.enabled) return false;
    if(cfg.respectReducedMotion && FairouzFX.prefersReducedMotion) return false;
    return true;
  }

  function start(id){
    const effect = registry[id];
    if(!effect){
      console.warn('[FairouzFX.AnimationManager] no effect registered as "'+id+'"');
      return false;
    }
    if(!canRun() || running.has(id)) return false;

    effect.start();
    running.add(id);

    // Only pay for FPS monitoring while something is actually running.
    if(running.size === 1 && FairouzFX.PerformanceManager){
      FairouzFX.PerformanceManager.start();
    }
    return true;
  }

  function stop(id){
    const effect = registry[id];
    if(!effect || !running.has(id)) return false;

    effect.stop();
    running.delete(id);

    if(running.size === 0 && FairouzFX.PerformanceManager){
      FairouzFX.PerformanceManager.stop();
    }
    return true;
  }

  function stopAll(){
    Array.from(running).forEach(stop);
  }

  function isRunning(id){ return running.has(id); }
  function listRegistered(){ return Object.keys(registry); }
  function listRunning(){ return Array.from(running); }

  // If the OS-level reduced-motion setting turns on mid-session, stop everything.
  if(FairouzFX.EventBus){
    FairouzFX.EventBus.on('reduced-motion-change', function(prefersReduced){
      if(prefersReduced) stopAll();
    });

    // Placeholder hook for later phases: when the frame rate drops hard,
    // stop any running effect that marked itself `heavy: true` at register()
    // time. No effects exist yet, so this currently has nothing to do.
    FairouzFX.EventBus.on('performance:degrade', function(){
      Array.from(running).forEach(function(id){
        const effect = registry[id];
        if(effect && effect.heavy) stop(id);
      });
    });
  }

  return { register, unregister, start, stop, stopAll, isRunning, listRegistered, listRunning, canRun };
})();
