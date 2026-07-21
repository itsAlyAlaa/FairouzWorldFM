// ================================================================
// FairouzFX — Effect: Hero Parallax
// A very small, very smooth parallax drift applied to the Home
// hero's background photo only — driven by mouse position on
// desktop and device tilt (gyroscope) on mobile where available.
// Registers with AnimationManager exactly like the starfield effect
// (Phase 5), so the master switch, prefers-reduced-motion, and
// performance degradation all apply automatically.
//
// What moves / what never moves:
//   Only `.v2-hero-full .v2-hero-bg img` gets a transform. The overlay,
//   the logo, the heading, the buttons, the info chips and every other
//   element on the page are never touched, never receive a transform,
//   and keep their normal pointer/click behavior untouched.
//
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

(function(){
  const heroEl = document.querySelector('.v2-hero-full');
  const bgImg  = heroEl ? heroEl.querySelector('.v2-hero-bg img') : null;
  if(!heroEl || !bgImg) return; // nothing to animate — fail silently, touch nothing else

  function settings(){
    const s = (FairouzFX.config && FairouzFX.config.effects && FairouzFX.config.effects.heroParallax) || {};
    return {
      amplitude: (s.amplitude != null) ? s.amplitude : 10, // px, max drift in any direction — deliberately tiny
      ease: (s.ease != null) ? s.ease : 0.045,               // per-frame lerp factor — small = slow, buttery catch-up
      idleMs: (s.idleMs != null) ? s.idleMs : 220,           // no fresh input for this long -> drift back to center
      scale: (s.scale != null) ? s.scale : 1.03              // tiny overscan so the translated image never shows an edge
    };
  }

  let running = false;
  let heroVisible = true;
  let rafId = null;
  let observer = null;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let lastInputAt = 0;

  function onMouseMove(e){
    const cfg = settings();
    const rect = heroEl.getBoundingClientRect();
    if(rect.width === 0 || rect.height === 0) return;
    const relX = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    // Background drifts slightly opposite the cursor — the classic, subtle parallax feel.
    targetX = -relX * cfg.amplitude * 2;
    targetY = -relY * cfg.amplitude * 2;
    lastInputAt = performance.now();
  }

  function onMouseLeave(){
    targetX = 0; targetY = 0;
  }

  function onDeviceOrientation(e){
    if(e.beta == null || e.gamma == null) return;
    const cfg = settings();
    // Clamp to a comfortable hand-held tilt range so a big, sudden tilt
    // can't throw the background far off — this stays a luxury micro-motion.
    const gamma = Math.max(-25, Math.min(25, e.gamma));          // left/right tilt
    const beta  = Math.max(-25, Math.min(25, e.beta - 45));      // front/back tilt, centered on a natural holding angle
    targetX = -(gamma / 25) * cfg.amplitude;
    targetY = -(beta / 25) * cfg.amplitude;
    lastInputAt = performance.now();
  }

  function requestGyroIfNeeded(){
    // iOS 13+ requires a permission prompt triggered by a direct user gesture.
    // This is a passive background effect with no button of its own, so we
    // never prompt — we simply attach the listener, and it activates on
    // platforms (Android, older iOS, desktop-with-sensors) that don't gate it.
    // If permission was already granted in an earlier visit, it still works.
    window.addEventListener('deviceorientation', onDeviceOrientation);
  }

  function applyTransform(){
    const cfg = settings();
    bgImg.style.transform = 'scale(' + cfg.scale + ') translate3d(' + currentX.toFixed(2) + 'px,' + currentY.toFixed(2) + 'px,0)';
  }

  function loop(){
    if(!running) return;
    if(heroVisible){
      const cfg = settings();
      if(performance.now() - lastInputAt > cfg.idleMs){
        targetX = 0; targetY = 0;
      }
      currentX += (targetX - currentX) * cfg.ease;
      currentY += (targetY - currentY) * cfg.ease;
      applyTransform();
    }
    rafId = requestAnimationFrame(loop);
  }

  function onRestore(){
    if(!running) FairouzFX.AnimationManager.start('hero-parallax');
  }

  function start(){
    if(running) return;
    running = true;
    lastInputAt = 0;
    currentX = 0; currentY = 0; targetX = 0; targetY = 0;

    heroEl.addEventListener('mousemove', onMouseMove);
    heroEl.addEventListener('mouseleave', onMouseLeave);
    requestGyroIfNeeded();

    if('IntersectionObserver' in window){
      observer = new IntersectionObserver((entries) => {
        heroVisible = entries[0] ? entries[0].isIntersecting : true;
      }, { threshold: 0.05 });
      observer.observe(heroEl);
    }

    rafId = requestAnimationFrame(loop);
  }

  function stop(){
    if(!running) return;
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;

    heroEl.removeEventListener('mousemove', onMouseMove);
    heroEl.removeEventListener('mouseleave', onMouseLeave);
    window.removeEventListener('deviceorientation', onDeviceOrientation);
    if(observer){ observer.disconnect(); observer = null; }

    bgImg.style.transform = ''; // release the background back to its normal, static position
  }

  // `heavy: true` — under sustained low fps, AnimationManager stops this
  // automatically (see engine/animation-manager.js). We separately listen
  // for the all-clear so the effect resumes once performance recovers,
  // rather than staying off for the rest of the session.
  if(FairouzFX.EventBus){
    FairouzFX.EventBus.on('performance:restore', onRestore);
  }

  FairouzFX.AnimationManager.register('hero-parallax', { start, stop, heavy: true });
  FairouzFX.AnimationManager.start('hero-parallax');
})();
