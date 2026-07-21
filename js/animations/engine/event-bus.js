// ================================================================
// FairouzFX — Effects Engine: Event Bus
// A minimal publish/subscribe hub so future effects can react to
// things happening elsewhere in the app (radio play/pause, reduced-
// motion changes, performance warnings...) without any direct
// coupling to the code that triggers them.
//
// Known event names used elsewhere in the app (documented here so
// future effect authors know what's available — the list grows as
// more producers/consumers are added in later phases):
//   'radio:play'              — emitted by js/widgets/radio-player.js
//   'radio:pause'             — emitted by js/widgets/radio-player.js
//   'reduced-motion-change'   — emitted by engine/reduced-motion.js, payload: boolean
//   'performance:degrade'     — emitted by engine/performance-manager.js, payload: {fps}
//   'performance:restore'     — emitted by engine/performance-manager.js, payload: {fps}
//
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

window.FairouzFX = window.FairouzFX || {};

FairouzFX.EventBus = (function(){
  const listeners = {};

  function on(eventName, handler){
    if(typeof handler !== 'function') return () => {};
    if(!listeners[eventName]) listeners[eventName] = [];
    listeners[eventName].push(handler);
    return function unsubscribe(){ off(eventName, handler); };
  }

  function off(eventName, handler){
    if(!listeners[eventName]) return;
    listeners[eventName] = listeners[eventName].filter(h => h !== handler);
  }

  function emit(eventName, payload){
    const handlers = listeners[eventName];
    if(!handlers || !handlers.length) return;
    // Snapshot with slice() so a handler unsubscribing mid-emit can't skip siblings.
    handlers.slice().forEach(h => {
      try{
        h(payload);
      }catch(err){
        console.error('[FairouzFX.EventBus] a listener for "'+eventName+'" threw:', err);
      }
    });
  }

  function clear(eventName){
    if(eventName) delete listeners[eventName];
    else Object.keys(listeners).forEach(k => delete listeners[k]);
  }

  return { on, off, emit, clear };
})();
