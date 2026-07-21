// ================================================================
// Floating mini player: shown on every page except Home, draggable and remembers its position (localStorage).
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Floating mini player (pop-out, visible on every page except Home) ──
(function(){
  const miniPlayer = document.getElementById('miniPlayer');
  const mpPlayBtn = document.getElementById('miniPlayerPlayBtn');
  const mpPlayIcon = document.getElementById('miniPlayerPlayIcon');
  const mpTitle = document.getElementById('miniPlayerTitle');
  const mpVolBtn = document.getElementById('miniPlayerVolBtn');
  const mpVolIcon = document.getElementById('miniPlayerVolIcon');
  const mpVolPop = document.getElementById('miniPlayerVolPop');
  const mpVol = document.getElementById('miniPlayerVol');
  const mpVolVal = document.getElementById('miniPlayerVolVal');
  const mpMuteBtn = document.getElementById('miniPlayerMuteBtn');
  if (!miniPlayer) return;

  // Play / pause — reuses the exact same audio logic as the main player
  mpPlayBtn.addEventListener('click', () => { togglePlay(); });

  // Volume pop-out — opens instantly on hover (mouse), and also on tap/click for touch devices
  const mpVolWrap = mpVolBtn.closest('.mp-vol-wrap') || mpVolBtn.parentElement;
  let mpVolCloseTimer = null;
  function clearMpVolCloseTimer(){ if (mpVolCloseTimer) { clearTimeout(mpVolCloseTimer); mpVolCloseTimer = null; } }
  function openMpVolPop(){
    clearMpVolCloseTimer();
    mpVolPop.classList.add('open');
    mpVolBtn.classList.add('active');
  }
  function closeMpVolPop(){
    mpVolPop.classList.remove('open');
    mpVolBtn.classList.remove('active');
  }
  function scheduleMpVolClose(){
    clearMpVolCloseTimer();
    mpVolCloseTimer = setTimeout(closeMpVolPop, 260);
  }
  // Hover: open immediately as the cursor enters the button or the popup itself
  if (mpVolWrap) {
    mpVolWrap.addEventListener('mouseenter', openMpVolPop);
    mpVolWrap.addEventListener('mouseleave', scheduleMpVolClose);
  }
  // Tap / click: still works for touch devices (no hover) — toggles the popup
  mpVolBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mpVolPop.classList.contains('open')) { closeMpVolPop(); }
    else { openMpVolPop(); }
  });
  document.addEventListener('click', (e) => {
    if (mpVolPop.classList.contains('open') && !mpVolPop.contains(e.target) && e.target !== mpVolBtn && !mpVolBtn.contains(e.target)) {
      closeMpVolPop();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMpVolPop(); });

  // Volume slider — mirrors and drives the same audio element / main slider
  mpVol.addEventListener('input', function(){
    audio.volume = this.value / 100;
    mpVolVal.textContent = this.value + '%';
    if (this.value > 0 && isMuted) { isMuted = false; audio.muted = false; }
    volSlider.value = this.value;
    volSlider.style.setProperty('--val', this.value + '%');
    volValue.textContent = this.value + '%';
  });

  // Mute toggle inside the pop-out — mirrors the main mute button
  mpMuteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    btnMute.innerHTML = isMuted ? ICON_VOL_OFF : ICON_VOL_ON;
  });

  // Keep the mini player's UI in sync with the main player's state
  function syncMiniPlayer(){
    const playing = !!isPlaying;
    miniPlayer.classList.toggle('playing', playing);
    mpPlayIcon.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    if (npTitle && npTitle.textContent) mpTitle.textContent = npTitle.textContent;
    const muteIcon = isMuted ? ICON_VOL_OFF : ICON_VOL_ON;
    mpVolIcon.innerHTML = muteIcon;
    mpMuteBtn.innerHTML = muteIcon;
    if (document.activeElement !== mpVol) {
      mpVol.value = volSlider.value;
      mpVolVal.textContent = volSlider.value + '%';
    }
  }
  setInterval(syncMiniPlayer, 400);
  syncMiniPlayer();
})();

// ── Mini player: draggable, position remembered across pages/visits ──
(function(){
  const miniPlayer = document.getElementById('miniPlayer');
  const mpBar = document.getElementById('miniPlayerBar');
  if (!miniPlayer || !mpBar) return;

  const STORAGE_KEY = 'miniPlayerPos';
  const EDGE_GAP = 4;
  let dragging = false, moved = false;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;

  function clamp(val, min, max){ return Math.max(min, Math.min(max, val)); }

  function applyPosition(left, top){
    const rect = miniPlayer.getBoundingClientRect();
    const maxLeft = Math.max(EDGE_GAP, window.innerWidth - rect.width - EDGE_GAP);
    const maxTop = Math.max(EDGE_GAP, window.innerHeight - rect.height - EDGE_GAP);
    left = clamp(left, EDGE_GAP, maxLeft);
    top = clamp(top, EDGE_GAP, maxTop);
    miniPlayer.style.left = left + 'px';
    miniPlayer.style.top = top + 'px';
    miniPlayer.style.right = 'auto';
    miniPlayer.style.bottom = 'auto';
    return { left, top };
  }

  function savePosition(left, top){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ left, top })); } catch(e){}
  }

  function restorePosition(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const pos = JSON.parse(raw);
      if (typeof pos.left === 'number' && typeof pos.top === 'number') applyPosition(pos.left, pos.top);
    } catch(e){}
  }

  function onPointerDown(e){
    // Let normal clicks on the play/volume controls and the volume pop-out work as before
    if (e.target.closest('button, input, .mp-vol-pop')) return;
    dragging = true; moved = false;
    const rect = miniPlayer.getBoundingClientRect();
    startLeft = rect.left; startTop = rect.top;
    startX = e.clientX; startY = e.clientY;
    if (mpBar.setPointerCapture) { try { mpBar.setPointerCapture(e.pointerId); } catch(err){} }
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e){
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!moved && Math.hypot(dx, dy) < 6) return;
    if (!moved) { moved = true; miniPlayer.classList.add('dragging'); }
    applyPosition(startLeft + dx, startTop + dy);
  }

  function onPointerUp(){
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    if (dragging && moved) {
      const rect = miniPlayer.getBoundingClientRect();
      savePosition(rect.left, rect.top);
    }
    dragging = false; moved = false;
    miniPlayer.classList.remove('dragging');
  }

  mpBar.addEventListener('pointerdown', onPointerDown);

  // Keep it inside the viewport if the window is resized after being dragged
  window.addEventListener('resize', () => {
    if (miniPlayer.style.left && miniPlayer.style.left !== 'auto') {
      const rect = miniPlayer.getBoundingClientRect();
      const pos = applyPosition(rect.left, rect.top);
      savePosition(pos.left, pos.top);
    }
  });

  restorePosition();
})();

