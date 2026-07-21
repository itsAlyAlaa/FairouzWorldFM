// ================================================================
// Contact page: form submission (FormSubmit), toast notification, ripple effect.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Contact page: form submission (via FormSubmit), toast, ripple ──
(function(){
  const CONTACT_EMAIL = 'itsalyalaa@outlook.com';
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('ctToast');
  const toastIcon = document.getElementById('ctToastIcon');
  const toastMsg = document.getElementById('ctToastMsg');
  const submitBtn = document.getElementById('ctSubmitBtn');
  const submitIcon = document.getElementById('ctSubmitIcon');
  const submitLabel = document.getElementById('ctSubmitLabel');
  if (!form) return;
  let ctToastTimer = null;

  function showCtToast(isError){
    toast.classList.toggle('error', !!isError);
    toastIcon.textContent = isError ? '⚠️' : '✅';
    const enText = isError ? 'Something went wrong. Please try again.' : 'Message sent successfully!';
    const arText = isError ? 'حصل خطأ، حاول تاني من فضلك.' : 'تم إرسال الرسالة بنجاح!';
    toastMsg.setAttribute('data-en', enText);
    toastMsg.setAttribute('data-ar', arText);
    toastMsg.textContent = currentLang === 'ar' ? arText : enText;
    toast.classList.add('show');
    clearTimeout(ctToastTimer);
    ctToastTimer = setTimeout(()=> toast.classList.remove('show'), 4000);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (submitBtn.classList.contains('sending')) return;
    submitBtn.classList.remove('sent','error');
    submitBtn.classList.add('sending');
    submitIcon.textContent = '⏳';
    submitLabel.textContent = currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...';

    const formData = new FormData(form);
    fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    }).then(() => {
      submitBtn.classList.remove('sending');
      submitBtn.classList.add('sent');
      submitIcon.textContent = '✅';
      submitLabel.textContent = currentLang === 'ar' ? 'تم الإرسال!' : 'Sent!';
      showCtToast(false);
      form.reset();
      setTimeout(()=>{
        submitBtn.classList.remove('sent');
        submitIcon.textContent = '📨';
        submitLabel.textContent = currentLang === 'ar' ? 'إرسال الرسالة' : 'Send Message';
      }, 3000);
    }).catch(() => {
      submitBtn.classList.remove('sending');
      submitBtn.classList.add('error');
      submitIcon.textContent = '⚠️';
      submitLabel.textContent = currentLang === 'ar' ? 'حصل خطأ' : 'Failed to send';
      showCtToast(true);
      setTimeout(()=>{
        submitBtn.classList.remove('error');
        submitIcon.textContent = '📨';
        submitLabel.textContent = currentLang === 'ar' ? 'إرسال الرسالة' : 'Send Message';
      }, 3000);
    });
  });

  // Ripple effect for the send button and card
  function addCtRipple(e){
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
  document.querySelectorAll('.ct-submit-btn, .ct-card').forEach(el=>{
    el.style.position = el.style.position || 'relative';
    el.style.overflow = el.style.overflow || 'hidden';
    el.addEventListener('click', addCtRipple);
  });
})();

