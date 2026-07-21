// ================================================================
// FairouzFX — Effect: Sea Ripple
// A very subtle, slow shimmer confined to the sea in the Home hero
// photo, leaving the rest of the image — sky, mountains, trees, the
// silhouette in the foreground — completely untouched. Registers
// with AnimationManager exactly like starfield (Phase 5) and
// hero-parallax (Phase 6), so the master switch, prefers-reduced-
// motion, and performance degradation all apply automatically.
//
// CALIBRATION — done against the real photo:
// hero-fairouz.webp is 1774×887px. The sea band below was measured
// directly on that file (open water only, verified clear of the
// mountains/coastline, the silhouette, and the foreground foliage in
// all four corners of the region):
//   natural pixel box: x 880–1750, y 520–740
// The band is stored as *fractions of the photo's natural size*
// (bandLeft/Right/Top/Bottom below), not of the on-screen box —
// object-fit:cover crops a different slice of the photo depending on
// the viewport's aspect ratio, so natural-space fractions are the only
// way the band reliably stays over the sea on every screen size. Each
// frame this module converts that natural-space rectangle into the
// current on-screen rectangle using the same cover-fit math the CSS
// itself uses (object-position included), then clips it to whatever
// portion of the photo is actually visible right now.
//
// HOW IT WORKS (no distortion outside the band, no external assets):
// A small <canvas> is created and inserted inside `.v2-hero-bg`,
// stacked directly above the real <img> (both are still beneath the
// overlay/content, exactly like before). Every frame, the canvas is
// cleared and only the band is redrawn: it is sliced into thin
// horizontal strips, each re-drawn from the *same* source photo with a
// tiny, independent, slowly-oscillating horizontal offset (classic
// shimmer technique), fading to fully transparent at the top/bottom/
// left/right edges of the band. Outside the band the canvas stays
// fully transparent, so the real <img> shows through undisturbed.
//
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

(function(){
  const heroBg = document.querySelector('.v2-hero-full .v2-hero-bg');
  const imgEl  = heroBg ? heroBg.querySelector('img') : null;
  if(!heroBg || !imgEl) return; // nothing to animate — fail silently, touch nothing else

  function settings(){
    const s = (FairouzFX.config && FairouzFX.config.effects && FairouzFX.config.effects.seaRipple) || {};
    return {
      // Fractions of the photo's *natural* pixel size (1774×887) — measured
      // directly on hero-fairouz.webp: natural box x 880–1750, y 520–740.
      bandLeft:   (s.bandLeft   != null) ? s.bandLeft   : 880 / 1774,
      bandRight:  (s.bandRight  != null) ? s.bandRight  : 1750 / 1774,
      bandTop:    (s.bandTop    != null) ? s.bandTop    : 520 / 887,
      bandBottom: (s.bandBottom != null) ? s.bandBottom : 740 / 887,
      slices:     s.slices     || 32,     // horizontal strips the band is divided into
      amplitude:  (s.amplitude != null) ? s.amplitude : 3, // px, display space — tiny shimmer, not a wave
      speed:      (s.speed     != null) ? s.speed     : 0.00045,
      waveFrequency: (s.waveFrequency != null) ? s.waveFrequency : 0.045,
      edgeFeather: s.edgeFeather || 18 // px, alpha+amplitude taper width at every edge of the band
    };
  }

  let canvas = null, ctx = null;
  let running = false;
  let heroVisible = true;
  let rafId = null;
  let observer = null;
  let resizeTimer = null;
  let ready = false; // true once the source image has finished loading

  // Object-fit:cover mapping (natural photo <-> on-screen box), recomputed on start/resize/load.
  let map = { scale: 1, srcX: 0, srcY: 0, dispW: 0, dispH: 0 };
  // The sea band's *current* on-screen rectangle, derived from `map` + the natural-space
  // config above, clipped to the visible box. Recomputed alongside `map`.
  let band = null; // { left, right, top, bottom } in display px, or null if the sea isn't visible at all right now

  function readObjectPosition(){
    const val = window.getComputedStyle(imgEl).objectPosition || '50% 50%';
    const parts = val.split(' ').map(v => parseFloat(v));
    const px = isNaN(parts[0]) ? 50 : parts[0];
    const py = (parts.length > 1 && !isNaN(parts[1])) ? parts[1] : 50;
    return { px: px / 100, py: py / 100 };
  }

  function computeMapAndBand(){
    const cw = heroBg.clientWidth, ch = heroBg.clientHeight;
    const nw = imgEl.naturalWidth, nh = imgEl.naturalHeight;
    if(!cw || !ch || !nw || !nh) return false;

    const scale = Math.max(cw / nw, ch / nh);
    const scaledW = nw * scale, scaledH = nh * scale;
    const { px, py } = readObjectPosition();
    const excessX = scaledW - cw, excessY = scaledH - ch;

    map = {
      scale: scale,
      srcX: (excessX * px) / scale, // natural-space X of the crop window's left edge
      srcY: (excessY * py) / scale, // natural-space Y of the crop window's top edge
      dispW: cw,
      dispH: ch
    };

    const cfg = settings();
    const natLeft = cfg.bandLeft * nw, natRight = cfg.bandRight * nw;
    const natTop = cfg.bandTop * nh, natBottom = cfg.bandBottom * nh;

    // Convert the natural-space band into on-screen pixels, then clip to
    // the box actually visible right now (a very wide or very tall viewport
    // may crop part of the band out of view — clipping just means we won't
    // draw over something that isn't on screen, never a visual error).
    let left = (natLeft - map.srcX) * map.scale;
    let right = (natRight - map.srcX) * map.scale;
    let top = (natTop - map.srcY) * map.scale;
    let bottom = (natBottom - map.srcY) * map.scale;
    left = Math.max(0, left); top = Math.max(0, top);
    right = Math.min(map.dispW, right); bottom = Math.min(map.dispH, bottom);

    band = (right > left && bottom > top) ? { left, right, top, bottom } : null;
    return true;
  }

  function resizeCanvas(){
    if(!canvas) return;
    if(!computeMapAndBand()) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = map.dispW * dpr;
    canvas.height = map.dispH * dpr;
    canvas.style.width = map.dispW + 'px';
    canvas.style.height = map.dispH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function onResize(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 200);
  }

  // A slice's distance from the band's top/bottom edge (0..1), used to taper
  // both alpha and amplitude so the shimmer fades to nothing right at the
  // band's boundary instead of cutting off with a visible line. (Left/right
  // edges are feathered separately, once per frame, via a gradient mask —
  // see the `destination-in` pass at the end of draw().)
  function edgeFactor(y0, y1, cfg){
    const midY = (y0 + y1) / 2;
    const distTop = midY - band.top, distBottom = band.bottom - midY;
    const nearest = Math.min(distTop, distBottom);
    if(nearest >= cfg.edgeFeather) return 1;
    if(nearest <= 0) return 0;
    return nearest / cfg.edgeFeather;
  }

  function draw(t){
    if(heroVisible && ready && band && window.__scrollBusy !== true){
      const cfg = settings();
      ctx.clearRect(0, 0, map.dispW, map.dispH);

      const bandDispH = band.bottom - band.top;
      const bandDispW = band.right - band.left;
      const sliceH = bandDispH / cfg.slices;

      for(let i = 0; i < cfg.slices; i++){
        const y0 = band.top + i * sliceH, y1 = y0 + sliceH;
        const factor = edgeFactor(y0, y1, cfg);
        if(factor <= 0) continue;

        const offsetPx = Math.sin(t * cfg.speed + i * cfg.waveFrequency) * cfg.amplitude * factor;

        // Map this display strip back to the source photo, then nudge the
        // source sample horizontally by the (scaled-down) shimmer offset.
        let srcSliceX = map.srcX + (band.left / map.scale) - (offsetPx / map.scale);
        const srcY = map.srcY + y0 / map.scale;
        const srcW = bandDispW / map.scale;
        const srcH = sliceH / map.scale;

        // Clamp so the shimmer never samples outside the actual photo bounds.
        const maxSrcX = imgEl.naturalWidth - srcW;
        if(srcSliceX < 0) srcSliceX = 0;
        if(srcSliceX > maxSrcX) srcSliceX = Math.max(0, maxSrcX);

        ctx.globalAlpha = factor;
        ctx.drawImage(imgEl, srcSliceX, srcY, srcW, srcH, band.left, y0, bandDispW, sliceH + 0.5);
      }
      ctx.globalAlpha = 1;

      // Feather the band's left/right edges in one cheap pass (rather than
      // sub-dividing every slice into columns): punch the drawn strips
      // through a gradient that fades to transparent right at band.left/right.
      if(cfg.edgeFeather > 0 && bandDispW > cfg.edgeFeather * 2){
        ctx.save();
        ctx.globalCompositeOperation = 'destination-in';
        const grad = ctx.createLinearGradient(band.left, 0, band.right, 0);
        const f = cfg.edgeFeather / bandDispW;
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(f, 'rgba(0,0,0,1)');
        grad.addColorStop(1 - f, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(band.left, band.top, bandDispW, bandDispH);
        ctx.restore();
      }

      // Stay in lockstep with the hero-parallax effect (Phase 6): if it has
      // shifted the real <img>, mirror the exact same transform onto this
      // canvas so the shimmer never drifts out of alignment with the photo.
      const liveTransform = imgEl.style.transform || '';
      if(canvas.style.transform !== liveTransform) canvas.style.transform = liveTransform;
    }
    if(running) rafId = requestAnimationFrame(draw);
  }

  function onVisibility(){
    if(document.hidden && rafId){ cancelAnimationFrame(rafId); rafId = null; }
    else if(!document.hidden && running && !rafId){ rafId = requestAnimationFrame(draw); }
  }

  function markReady(){
    ready = computeMapAndBand();
  }

  function start(){
    if(running) return;
    running = true;

    // Phase 8: canvases are now provisioned exclusively through the Layer
    // Manager (position/z-index/pointer-events are applied there, once, for
    // every layer — this effect no longer creates or styles its own canvas).
    if(!FairouzFX.LayerManager){
      console.warn('[sea-ripple] FairouzFX.LayerManager is required and was not found — effect disabled.');
      running = false;
      return;
    }
    canvas = FairouzFX.LayerManager.createCanvas('hero', 'sea');
    if(!canvas){ running = false; return; }
    ctx = canvas.getContext('2d', { alpha: true });

    if(imgEl.complete && imgEl.naturalWidth){
      markReady();
      resizeCanvas();
    }else{
      imgEl.addEventListener('load', function onLoad(){
        imgEl.removeEventListener('load', onLoad);
        markReady();
        resizeCanvas();
      });
    }

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    if('IntersectionObserver' in window){
      observer = new IntersectionObserver((entries) => {
        heroVisible = entries[0] ? entries[0].isIntersecting : true;
      }, { threshold: 0.05 });
      observer.observe(heroBg);
    }

    rafId = requestAnimationFrame(draw);
  }

  function stop(){
    if(!running) return;
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;
    clearTimeout(resizeTimer);

    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    if(observer){ observer.disconnect(); observer = null; }

    if(FairouzFX.LayerManager) FairouzFX.LayerManager.releaseCanvas('hero', 'sea');
    canvas = null; ctx = null; ready = false; band = null;
  }

  function onRestore(){
    if(!running) FairouzFX.AnimationManager.start('sea-ripple');
  }
  if(FairouzFX.EventBus){
    FairouzFX.EventBus.on('performance:restore', onRestore);
  }

  FairouzFX.AnimationManager.register('sea-ripple', { start, stop, heavy: true });
  FairouzFX.AnimationManager.start('sea-ripple');
})();
