// ================================================================
// About page: portrait reveal-on-scroll + mouse-tilt effect.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── About page: portrait reveal + tilt ──
function revealAboutPage(){
  const feature = document.getElementById('aboutFeature');
  if(!feature) return;
  feature.classList.remove('in-view');
  void feature.offsetWidth; // force reflow so the transition replays every visit
  requestAnimationFrame(() => feature.classList.add('in-view'));
}
(function initAboutTilt(){
  const outer = document.getElementById('aboutPortrait');
  const inner = outer ? outer.querySelector('.about-portrait-inner') : null;
  if(!outer || !inner) return;
  const canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!canHover) return;
  outer.addEventListener('mousemove', e=>{
    const r = outer.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    inner.style.transform = `rotateY(${px*10}deg) rotateX(${-py*10}deg)`;
  });
  outer.addEventListener('mouseleave', ()=>{ inner.style.transform = 'rotateY(0) rotateX(0)'; });
})();

