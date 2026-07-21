// ================================================================
// FairouzFX — Effects Engine: Layer Manager
// The single, central authority for *where* an effect's canvas lives
// and *what stacking order* it paints in. No effect should ever call
// `document.createElement('canvas')` directly anymore — it asks the
// Layer Manager for a named layer instead, so:
//   - every layer has one clear, pre-declared z-index (no guessing,
//     no accidental overlap between effects),
//   - nothing can spawn a stray, untracked canvas,
//   - any layer can be shown/hidden/queried from one single place.
//
// Two independent scopes:
//   'page' — fixed, full-viewport layers, painted behind the whole
//            app shell (.app). Matches how the existing starfield
//            (#starCanvas) and occasion/season particles (#occCanvas)
//            already work — see the "pre-existing layers" section
//            below, which only *registers* them for bookkeeping and
//            never touches their markup, CSS, or behavior.
//   'hero'  — layers confined *inside* `.v2-hero-bg`, i.e. within the
//            Home hero photo itself (mountains, sea, clouds, etc. —
//            exactly the kind of region-confined effect Phase 7's sea
//            ripple introduced). Because `.v2-hero-bg` itself has no
//            explicit z-index, the CSS stacking rules guarantee the
//            *whole group* of hero layers always paints below
//            `.v2-hero-overlay` (z-index:1) and `.v2-hero-content`
//            (z-index:2) — a layer's z-index here only orders it
//            against *other hero layers*, it can never climb above the
//            real text/buttons by mistake. That's what makes rule #4
//            ("no layer can accidentally cover another") structurally
//            true, not just a convention.
//
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

FairouzFX.LayerManager = (function(){
  const layers = {}; // "scope.name" -> descriptor

  function keyOf(scope, name){ return scope + '.' + name; }

  function getContainer(scope){
    if(scope === 'hero') return document.querySelector('.v2-hero-full .v2-hero-bg');
    if(scope === 'page') return document.body;
    return null;
  }

  // Declares a layer's identity and stacking position. Call this once per
  // layer, up front (see the canonical registry at the bottom of this file)
  // — effects then reference the layer by name, they never invent their own.
  function define(scope, name, opts){
    opts = opts || {};
    const k = keyOf(scope, name);
    if(layers[k]){
      console.warn('[FairouzFX.LayerManager] layer "'+k+'" is already defined — ignoring redefinition');
      return layers[k];
    }
    if(opts.zIndex == null){
      console.warn('[FairouzFX.LayerManager] layer "'+k+'" defined without a zIndex — defaulting to 0');
    }
    const zIndex = (opts.zIndex != null) ? opts.zIndex : 0;

    const collision = Object.keys(layers).find(function(other){
      return layers[other].scope === scope && layers[other].zIndex === zIndex;
    });
    if(collision){
      console.error('[FairouzFX.LayerManager] z-index collision: "'+k+'" (z='+zIndex+') clashes with "'+collision+'" — pick a different zIndex.');
    }

    layers[k] = {
      scope: scope,
      name: name,
      zIndex: zIndex,
      kind: opts.kind || 'canvas',     // 'canvas' (Layer Manager provisions it) or 'reference' (documented, but managed elsewhere — e.g. the real hero UI content)
      preExisting: !!opts.preExisting, // true for layers that adopt markup that already existed before this system
      domId: opts.domId || null,
      element: null,
      provisioned: false,
      visible: true
    };
    return layers[k];
  }

  // The one sanctioned way to get a canvas for a layer. Refuses to create a
  // second canvas for a layer that already has one (hands back the existing
  // one instead) — this is what "no random/duplicate canvas creation" means
  // in practice.
  function createCanvas(scope, name){
    const k = keyOf(scope, name);
    const layer = layers[k];
    if(!layer){
      console.warn('[FairouzFX.LayerManager] createCanvas: unknown layer "'+k+'" — define() it first');
      return null;
    }
    if(layer.kind !== 'canvas'){
      console.warn('[FairouzFX.LayerManager] layer "'+k+'" is not a canvas layer (kind="'+layer.kind+'")');
      return null;
    }
    if(layer.provisioned && layer.element){
      return layer.element; // idempotent — reuse, never duplicate
    }
    const container = getContainer(scope);
    if(!container){
      console.warn('[FairouzFX.LayerManager] createCanvas: no container found for scope "'+scope+'" (layer "'+k+'")');
      return null;
    }
    const canvas = document.createElement('canvas');
    canvas.setAttribute('data-fx-layer', k);
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = String(layer.zIndex);
    canvas.style.display = layer.visible ? '' : 'none';
    container.appendChild(canvas);

    layer.element = canvas;
    layer.provisioned = true;
    return canvas;
  }

  // Tears down a layer's canvas (an effect calls this from its own stop()).
  // Leaves the layer *defined* — only start()/createCanvas() again re-provisions it.
  function releaseCanvas(scope, name){
    const layer = layers[keyOf(scope, name)];
    if(!layer || !layer.element || layer.preExisting) return; // never remove adopted, pre-existing markup
    if(layer.element.parentNode) layer.element.parentNode.removeChild(layer.element);
    layer.element = null;
    layer.provisioned = false;
  }

  // Registers a layer around markup that already existed before this system
  // (e.g. the static #starCanvas / #occCanvas from earlier phases) purely for
  // bookkeeping — never moves, restyles, or removes that element.
  function adopt(scope, name, existingEl, opts){
    opts = opts || {};
    const k = keyOf(scope, name);
    if(layers[k]){
      console.warn('[FairouzFX.LayerManager] layer "'+k+'" is already defined — ignoring adopt()');
      return layers[k];
    }
    layers[k] = {
      scope: scope,
      name: name,
      zIndex: (opts.zIndex != null) ? opts.zIndex : 0,
      kind: 'canvas',
      preExisting: true,
      domId: existingEl ? existingEl.id : null,
      element: existingEl || null,
      provisioned: !!existingEl,
      visible: true
    };
    return layers[k];
  }

  function show(scope, name){
    const layer = layers[keyOf(scope, name)];
    if(!layer) return;
    layer.visible = true;
    if(layer.element) layer.element.style.display = '';
  }

  function hide(scope, name){
    const layer = layers[keyOf(scope, name)];
    if(!layer) return;
    layer.visible = false;
    if(layer.element) layer.element.style.display = 'none';
  }

  function isVisible(scope, name){
    const layer = layers[keyOf(scope, name)];
    return layer ? layer.visible : false;
  }

  function get(scope, name){ return layers[keyOf(scope, name)] || null; }
  function list(){ return Object.keys(layers); }

  return { define, createCanvas, releaseCanvas, adopt, show, hide, isVisible, get, list };
})();

// ── Canonical layer registry ──────────────────────────────────────
// Every layer the app currently knows about, declared once, up front,
// with an explicit z-index. Effects (this phase and future ones) look
// a layer up by name — nobody invents a new z-index inline.
//
// Page-scope layers (starfield, occasions) are *adopted* further down
// instead of define()'d here — they're markup that already existed
// before this system, so adopt() is what registers them (see below).

// Hero-scope: confined inside `.v2-hero-bg`, ordered back-to-front to
// match the actual depth of the photo (sky furthest back, sea in the
// middle distance, fireflies/notes drifting closest to camera). "ui" is
// a reference entry only — the real hero text/buttons are the existing
// `.v2-hero-content` element (z-index:2 in its own, parent stacking
// context), not something this system creates or owns.
FairouzFX.LayerManager.define('hero', 'sky', { zIndex: 1 });
FairouzFX.LayerManager.define('hero', 'stars', { zIndex: 2 });
FairouzFX.LayerManager.define('hero', 'clouds', { zIndex: 3 });
FairouzFX.LayerManager.define('hero', 'mountains', { zIndex: 4 });
FairouzFX.LayerManager.define('hero', 'sea', { zIndex: 5 });
FairouzFX.LayerManager.define('hero', 'fog', { zIndex: 6 });
FairouzFX.LayerManager.define('hero', 'fireflies', { zIndex: 7 });
FairouzFX.LayerManager.define('hero', 'musicalNotes', { zIndex: 8 });
FairouzFX.LayerManager.define('hero', 'ui', { zIndex: 9, kind: 'reference' });

// ── Adopt the two layers that already existed before this system ──
// These lines only *register bookkeeping* for markup/CSS that has been
// live since earlier phases — nothing here creates, moves, or restyles
// anything. #starCanvas and #occCanvas keep behaving exactly as before.
(function(){
  const starCanvasEl = document.getElementById('starCanvas');
  if(starCanvasEl) FairouzFX.LayerManager.adopt('page', 'starfield', starCanvasEl, { zIndex: 0 });
  const occCanvasEl = document.getElementById('occCanvas');
  if(occCanvasEl) FairouzFX.LayerManager.adopt('page', 'occasions', occCanvasEl, { zIndex: 5 });
})();
