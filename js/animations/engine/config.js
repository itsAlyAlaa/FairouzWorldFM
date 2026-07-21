// ================================================================
// FairouzFX — Effects Engine: Config
// Central, single source of truth for every setting the animation
// engine (and any effect built on top of it in later phases) reads.
// Nothing in this file draws anything or starts any loop — it is
// pure data, safe to load on every page with zero visual impact.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

FairouzFX.config = {
  // Master switch. Setting this to false disables the whole engine —
  // AnimationManager.start() will refuse to run anything.
  enabled: true,

  // When true (default), the engine will not run any effect while the
  // OS-level "prefers-reduced-motion: reduce" setting is active, and will
  // immediately stop everything if the user turns that setting on mid-session.
  respectReducedMotion: true,

  // Read by PerformanceManager. Numbers are frames-per-second.
  performance: {
    targetFps: 50,   // at/above this, a previously-degraded effect is allowed to resume
    criticalFps: 30, // below this, AnimationManager is told to degrade/stop heavy effects
    sampleWindowMs: 1000 // how often (ms) PerformanceManager recalculates fps
  },

  // Effects can read this to decide how much visual detail to render.
  // 'auto' lets PerformanceManager drive it down under load; effects are
  // also free to honor 'low'/'high' if a future settings UI sets it directly.
  quality: 'auto',

  // Registry of known effect ids and their *default* enabled state / tuning.
  // A future effect module registers itself with AnimationManager.register(id, ...)
  // and can add its own default here, the way 'starfield' does below.
  effects: {
    starfield: {
      enabled: true,
      maxStars: 160,          // hard cap, regardless of screen size
      areaPerStar: 9000,      // px² of viewport per star — bigger screens get more stars, not denser ones
      driftSpeed: 0.01,       // px per ms — deliberately tiny so movement is only felt, never seen directly
      twinkleSpeedMin: 0.00035, // sine speed per ms — ~18s slowest twinkle cycle
      twinkleSpeedMax: 0.0012   // ~5s fastest twinkle cycle
    },
    heroParallax: {
      enabled: true,
      amplitude: 10,   // px, max background drift in any direction — a luxury hint, not a game effect
      ease: 0.045,     // per-frame lerp factor — small = slow, cinematic catch-up
      idleMs: 220,     // no fresh mouse/tilt input for this long -> drift back to center
      scale: 1.03      // tiny overscan so the translated background image never reveals an edge
    },
    // Calibrated directly against the real hero-fairouz.webp (1774×887px):
    // open water verified clear of mountains/coastline/foliage in natural
    // pixel box x 880–1750, y 520–740. Stored as fractions of the photo's
    // *natural* size (not the on-screen box) so it stays correctly placed
    // over the sea regardless of viewport aspect ratio / object-fit crop.
    seaRipple: {
      enabled: true,
      bandLeft: 880 / 1774, bandRight: 1750 / 1774,
      bandTop: 520 / 887, bandBottom: 740 / 887,
      slices: 32,
      amplitude: 3,          // px, display space — a shimmer, not a wave
      speed: 0.00045,
      waveFrequency: 0.045,
      edgeFeather: 18        // px, fade width at every edge of the band
    }
  }
};
