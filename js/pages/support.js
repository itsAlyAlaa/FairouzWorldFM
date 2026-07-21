// ================================================================
// Support page: copy-to-clipboard buttons, toast notifications, button ripple effect.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Support page: copy buttons, toast, ripple ──
(function(){
  const toast = document.getElementById('supToast');
  const toastMsg = document.getElementById('supToastMsg');
  let toastTimer = null;

  function showSupToast(){
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), 2000);
  }

  function copyToClipboard(text){
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject)=>{
      try{
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      }catch(err){ reject(err); }
    });
  }

  function handleCopyBtn(btn){
    const text = btn.getAttribute('data-copy');
    const labelEl = btn.querySelector('.sup-copy-label');
    const originalEn = labelEl.getAttribute('data-en');
    const originalAr = labelEl.getAttribute('data-ar');
    copyToClipboard(text).then(()=>{
      btn.classList.add('copied');
      labelEl.textContent = currentLang === 'ar' ? 'تم النسخ!' : 'Copied!';
      showSupToast();
      setTimeout(()=>{
        btn.classList.remove('copied');
        labelEl.textContent = currentLang === 'ar' ? originalAr : originalEn;
      }, 2000);
    }).catch(()=>{});
  }

  const usernameBtn = document.getElementById('supCopyUsernameBtn');
  const numberBtn = document.getElementById('supCopyNumberBtn');
  if (usernameBtn) usernameBtn.addEventListener('click', ()=> handleCopyBtn(usernameBtn));
  if (numberBtn) numberBtn.addEventListener('click', ()=> handleCopyBtn(numberBtn));

  // Ripple effect for support buttons and cards
  function addRipple(e){
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'sup-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    const x = (e.clientX ?? (rect.left + rect.width/2)) - rect.left - size/2;
    const y = (e.clientY ?? (rect.top + rect.height/2)) - rect.top - size/2;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    el.appendChild(ripple);
    setTimeout(()=> ripple.remove(), 650);
  }
  document.querySelectorAll('.sup-copy-btn, .sup-card, .sup-qr-link').forEach(el=>{
    el.style.position = el.style.position || 'relative';
    el.addEventListener('click', addRipple);
  });
})();

