// ================================================================
// Shared scroll-activity flag + ambient floating musical notes (always-on background decoration).
// The starfield that used to live in this file now lives in
// js/animations/effects/starfield.js, built on the FairouzFX engine (Phase 5).
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Shared scroll-activity flag: lets always-on background canvases (starfield,
// season/occasion particles) skip a few draw calls while the page is actively
// being scrolled, so the main thread isn't fighting the scroll for CPU time.
// Purely a perf hint — the animations themselves are untouched and resume
// drawing the instant scrolling stops (~140ms later), which is imperceptible.
(function(){
  let timer=null;
  window.__scrollBusy=false;
  window.addEventListener('scroll', function(){
    window.__scrollBusy=true;
    clearTimeout(timer);
    timer=setTimeout(function(){window.__scrollBusy=false;}, 140);
  }, {passive:true, capture:true});
})();

// ── Ambient floating notes generator ──
(function(){
  const glyphs=['♪','♫','♬','✦'];
  function populate(layer, count){
    if(!layer) return;
    for(let i=0;i<count;i++){
      const n=document.createElement('span');
      n.className='float-note';
      n.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
      n.style.left=(Math.random()*80+10)+'%';
      n.style.fontSize=(13+Math.random()*14)+'px';
      n.style.setProperty('--drift',(Math.random()*60-30)+'px');
      const duration=22+Math.random()*18;
      n.style.animationDuration=duration+'s';
      n.style.animationDelay=(-Math.random()*duration)+'s';
      layer.appendChild(n);
    }
  }
  populate(document.getElementById('floatNotesLayer'), window.innerWidth<700 ? 7 : 12);
  populate(document.getElementById('sidebarNotesLayer'), 4);
})();

