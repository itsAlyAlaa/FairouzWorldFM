// ================================================================
// FairouzFX — Effects Engine: Performance Manager
// Watches real frame rate with requestAnimationFrame and reports
// "degrade" / "restore" through the Event Bus so heavy effects can
// pause or scale themselves back automatically. It never starts
// itself — AnimationManager starts it only once at least one effect
// is actually running, and stops it once none are, so an idle page
// never pays for a monitoring loop it doesn't need.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

FairouzFX.PerformanceManager = (function(){
  let running = false;
  let rafId = null;
  let frameCount = 0;
  let windowStart = 0;
  let currentFps = 60;
  let degraded = false;

  function getSettings(){
    const perf = (FairouzFX.config && FairouzFX.config.performance) || {};
    return {
      targetFps: perf.targetFps || 50,
      criticalFps: perf.criticalFps || 30,
      sampleWindowMs: perf.sampleWindowMs || 1000
    };
  }

  function tick(now){
    if(!running) return;
    frameCount++;
    if(!windowStart) windowStart = now;
    const elapsed = now - windowStart;
    const { sampleWindowMs } = getSettings();
    if(elapsed >= sampleWindowMs){
      currentFps = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      windowStart = now;
      evaluate();
    }
    rafId = requestAnimationFrame(tick);
  }

  function evaluate(){
    const { targetFps, criticalFps } = getSettings();
    if(currentFps < criticalFps && !degraded){
      degraded = true;
      if(FairouzFX.EventBus) FairouzFX.EventBus.emit('performance:degrade', { fps: currentFps });
    }else if(currentFps >= targetFps && degraded){
      degraded = false;
      if(FairouzFX.EventBus) FairouzFX.EventBus.emit('performance:restore', { fps: currentFps });
    }
  }

  function start(){
    if(running) return;
    running = true;
    frameCount = 0;
    windowStart = 0;
    rafId = requestAnimationFrame(tick);
  }

  function stop(){
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function getFps(){ return currentFps; }
  function isDegraded(){ return degraded; }
  function isRunning(){ return running; }

  return { start, stop, getFps, isDegraded, isRunning };
})();
