// ================================================================
// FairouzFX — Effect: Starfield
// A calm field of softly twinkling stars drifting almost
// imperceptibly slowly across the background. This is the first
// real effect built on top of the Phase 4 engine: it registers
// itself with AnimationManager instead of running on its own, so
// the master switch, prefers-reduced-motion, and performance
// degradation all apply to it automatically.
//
// Layering / non-interference:
//   #starCanvas is `position:fixed; inset:0; z-index:0; pointer-events:none;`
//   (see css/base/base.css) — strictly behind .app (z-index:1) and never
//   intercepts clicks or affects layout. This file only ever draws on
//   that one canvas; it does not touch any other element on the page.
//
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

(function(){
  const canvas = document.getElementById('starCanvas');
  if(!canvas) return; // nothing to draw on — fail silently, never touch anything else

  const ctx = canvas.getContext('2d', { alpha: true });
  const palette = ['rgba(217,184,136,A)','rgba(201,135,156,A)','rgba(243,232,230,A)','rgba(139,92,246,A)'];

  function settings(){
    const s = (FairouzFX.config && FairouzFX.config.effects && FairouzFX.config.effects.starfield) || {};
    return {
      maxStars: s.maxStars || 160,
      areaPerStar: s.areaPerStar || 9000,
      driftSpeed: (s.driftSpeed != null) ? s.driftSpeed : 0.01,
      twinkleSpeedMin: (s.twinkleSpeedMin != null) ? s.twinkleSpeedMin : 0.00035,
      twinkleSpeedMax: (s.twinkleSpeedMax != null) ? s.twinkleSpeedMax : 0.0012
    };
  }

  let stars = [];
  let rafId = null;
  let running = false;      // true while start()..stop() — the effect is "on"
  let tabHidden = false;    // true while the browser tab isn't visible
  let degraded = false;     // true while PerformanceManager reports low fps
  let lastT = 0;
  let resizeTimer = null;

  function makeStar(w, h){
    const cfg = settings();
    const big = Math.random() > 0.92;
    const angle = Math.random() * Math.PI * 2; // random drift direction, every star different
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: big ? (Math.random() * 1.6 + 1.6) : (Math.random() * 1.1 + 0.3),
      vx: Math.cos(angle) * cfg.driftSpeed * (0.4 + Math.random() * 0.6),
      vy: Math.sin(angle) * cfg.driftSpeed * (0.4 + Math.random() * 0.6),
      twinkleSpeed: cfg.twinkleSpeedMin + Math.random() * (cfg.twinkleSpeedMax - cfg.twinkleSpeedMin),
      phase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
      glow: big
    };
  }

  function resize(){
    const cfg = settings();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(cfg.maxStars, Math.round((w * h) / cfg.areaPerStar));
    stars = Array.from({ length: count }, () => makeStar(w, h));
  }

  function draw(t){
    const w = window.innerWidth, h = window.innerHeight;
    const dt = lastT ? (t - lastT) : 16.7;
    lastT = t;

    if(!window.__scrollBusy){
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s, i) => {
        // Degraded mode: draw every other star and skip glow — halves both the
        // fill-call count and the (expensive) shadow-blur cost in one move.
        if(degraded && (i % 2 === 1)) return;

        // Very slow positional drift, wrapping around the edges.
        s.x += s.vx * dt; s.y += s.vy * dt;
        if(s.x < -5) s.x = w + 5; else if(s.x > w + 5) s.x = -5;
        if(s.y < -5) s.y = h + 5; else if(s.y > h + 5) s.y = -5;

        // Independent random twinkle per star.
        const alpha = 0.22 + 0.55 * Math.sin(s.phase + t * s.twinkleSpeed);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color.replace('A', Math.max(alpha, 0.08).toFixed(2));
        if(s.glow && !degraded){
          ctx.shadowColor = s.color.replace('A', '.8');
          ctx.shadowBlur = 8;
        }else{
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });
    }

    if(running && !tabHidden) rafId = requestAnimationFrame(draw);
  }

  function onResize(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }

  function onVisibilityChange(){
    tabHidden = document.hidden;
    if(!tabHidden && running && !rafId){
      lastT = 0;
      rafId = requestAnimationFrame(draw);
    }else if(tabHidden && rafId){
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function onDegrade(){ degraded = true; }
  function onRestore(){ degraded = false; }

  function start(){
    if(running) return;
    running = true;
    tabHidden = document.hidden;
    lastT = 0;
    resize();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    if(FairouzFX.EventBus){
      FairouzFX.EventBus.on('performance:degrade', onDegrade);
      FairouzFX.EventBus.on('performance:restore', onRestore);
    }
    if(!tabHidden) rafId = requestAnimationFrame(draw);
  }

  function stop(){
    if(!running) return;
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if(FairouzFX.EventBus){
      FairouzFX.EventBus.off('performance:degrade', onDegrade);
      FairouzFX.EventBus.off('performance:restore', onRestore);
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  FairouzFX.AnimationManager.register('starfield', { start, stop, heavy: false });
  FairouzFX.AnimationManager.start('starfield');
})();
