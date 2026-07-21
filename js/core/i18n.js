// ================================================================
// Language toggle (AR/EN) + time-of-day greeting badge (icon + text + interval refresh).
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Language ──
let currentLang = 'en';
function toggleLang() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  applyLang();
  updateGreeting();
}

// ── Time-of-day Greeting Badge ──
const GREET_ICONS = {
  morning: `<svg viewBox="0 0 32 32" fill="none"><g class="sun-rays" stroke="var(--sun-c)" stroke-width="2" stroke-linecap="round"><line x1="16" y1="3" x2="16" y2="7"/><line x1="4.8" y1="9.8" x2="7.6" y2="12"/><line x1="27.2" y1="9.8" x2="24.4" y2="12"/><line x1="2" y1="20" x2="6" y2="20"/><line x1="30" y1="20" x2="26" y2="20"/></g><path class="sun-core" d="M6 21a10 10 0 0 1 20 0z" fill="var(--sun-c)"/><rect x="4" y="21" width="24" height="2.4" rx="1.2" fill="var(--gold2)" opacity=".85"/></svg>`,
  afternoon: `<svg viewBox="0 0 32 32" fill="none"><g class="sun-spin"><g stroke="var(--sun-c)" stroke-width="2" stroke-linecap="round"><line x1="16" y1="2" x2="16" y2="6"/><line x1="16" y1="26" x2="16" y2="30"/><line x1="2" y1="16" x2="6" y2="16"/><line x1="26" y1="16" x2="30" y2="16"/><line x1="6" y1="6" x2="8.8" y2="8.8"/><line x1="23.2" y1="23.2" x2="26" y2="26"/><line x1="6" y1="26" x2="8.8" y2="23.2"/><line x1="23.2" y1="8.8" x2="26" y2="6"/></g></g><circle cx="16" cy="16" r="7.5" fill="var(--sun-c)"/></svg>`,
  evening: `<svg viewBox="0 0 32 32" fill="none"><g stroke="var(--rose)" stroke-width="2" stroke-linecap="round" opacity=".8"><line x1="16" y1="4" x2="16" y2="7"/><line x1="5.5" y1="11" x2="8" y2="12.8"/><line x1="26.5" y1="11" x2="24" y2="12.8"/></g><path class="sun-core" d="M6 21a10 10 0 0 1 20 0z" fill="var(--rose)"/><rect x="4" y="21" width="24" height="2.4" rx="1.2" fill="var(--maroon)" opacity=".9"/></svg>`,
  night: `<svg viewBox="0 0 32 32" fill="none"><path class="moon-body" d="M21 5a11 11 0 1 0 0 22 13.5 13.5 0 0 1 0-22z" fill="var(--moon-c)"/><circle class="greet-star" cx="26" cy="8" r="1.1" fill="#f3e8f6"/><circle class="greet-star" cx="29" cy="14" r="0.8" fill="#f3e8f6" style="animation-delay:.5s"/><circle class="greet-star" cx="24" cy="17.5" r="0.7" fill="#f3e8f6" style="animation-delay:1s"/></svg>`
};
const GREET_TEXT = {
  morning:  {en:'Good Morning',   ar:'صباح الخير'},
  afternoon:{en:'Good Afternoon', ar:'نهارك سعيد'},
  evening:  {en:'Good Evening',   ar:'مساء الخير'},
  night:    {en:'Good Night',     ar:'ليلة سعيدة'}
};
function getGreetPeriod(h){
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}
let lastGreetPeriod = null;
function updateGreeting(){
  const badge = document.getElementById('greetBadge');
  const iconEl = document.getElementById('greetIcon');
  const textEl = document.getElementById('greetText');
  if (!badge || !iconEl || !textEl) return;
  const period = getGreetPeriod(new Date().getHours());
  textEl.textContent = GREET_TEXT[period][currentLang];
  textEl.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  if (period !== lastGreetPeriod){
    badge.classList.remove('gt-morning','gt-afternoon','gt-evening','gt-night');
    badge.classList.add('gt-' + period);
    iconEl.innerHTML = GREET_ICONS[period];
    lastGreetPeriod = period;
  }
}
updateGreeting();
setInterval(updateGreeting, 60 * 1000);
function applyLang() {
  const body = document.body;
  // Layout direction is intentionally always LTR — switching to Arabic must
  // only change the language of the text, not mirror the page. Each
  // translated text element still gets its own correct dir below, so Arabic
  // sentences read right-to-left internally (punctuation lands at the true
  // end of the sentence) without moving any element's position on the page.
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', currentLang);
  // The Contact and About pages are the exceptions to the rule above: they get
  // a real mirrored RTL layout in Arabic (icons, field/portrait order, and
  // alignment flip), while every other page keeps its fixed LTR structure.
  const contactPageEl = document.getElementById('page-contact');
  if (contactPageEl) contactPageEl.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  const aboutPageEl = document.getElementById('page-about');
  if (aboutPageEl) aboutPageEl.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  if (currentLang === 'ar') {
    body.classList.add('lang-ar');
    body.setAttribute('lang','ar');
    document.querySelectorAll('.lang-flag').forEach(el => {
      el.innerHTML = '<img src="https://flagcdn.com/24x18/gb.png" alt="English" width="20" height="15">';
    });
    document.querySelectorAll('.lang-name').forEach(el => { el.textContent = 'English'; });
  } else {
    body.classList.remove('lang-ar');
    body.setAttribute('lang','en');
    document.querySelectorAll('.lang-flag').forEach(el => {
      el.innerHTML = '<img src="https://flagcdn.com/24x18/eg.png" alt="العربية" width="20" height="15">';
    });
    document.querySelectorAll('.lang-name').forEach(el => { el.textContent = 'العربية'; });
  }
  // The page layout stays LTR at all times (see above), so nothing on the
  // page mirrors or moves when switching to Arabic. What DOES need to flip
  // per-language is the internal reading direction of each text node, since
  // dir="auto" is not reliable for strings that start with a Latin word/
  // brand name. Setting dir explicitly here keeps Arabic sentences shaping
  // and wrapping correctly (punctuation stays at the true end of the
  // sentence) while every element keeps its fixed position on the page.
  document.querySelectorAll('[data-en]').forEach(el => {
    const val = el.getAttribute('data-' + currentLang);
    if (val !== null) el.innerHTML = val;
    if (el.id !== 'npTitle' && el.id !== 'miniPlayerTitle' && el.id !== 'citySearchToggle' && el.id !== 'useGpsBtn') el.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  });
  document.querySelectorAll('[data-en-ph]').forEach(el => {
    const val = el.getAttribute('data-' + currentLang + '-ph');
    if (val !== null) el.setAttribute('placeholder', val);
    el.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  });
  if (typeof isPlaying !== 'undefined' && isPlaying) {
    const langFix = (typeof findTitleFix === 'function') ? findTitleFix(lastRawTitle) : null;
    if(langFix){
      npTitle.textContent = langFix.en;
      if(npAi){ npAi.style.display='flex'; npAiText.textContent = langFix.ar; }
    } else {
      if (lastRawTitle) npTitle.textContent = lastRawTitle;
      if (npAi && npAi.style.display==='flex' && lastRawTitle && !isArabicText(lastRawTitle)) {
        npAiText.textContent = currentLang==='ar' ? 'جارِ الترجمة بالذكاء الاصطناعي...' : 'AI translating...';
        translateToArabic(lastRawTitle).then(ar=>{ if(ar && lastRawTitle) npAiText.textContent = ar; });
      }
    }
  }
  updateClock(); renderPrayers();
  if (currentAthanName) updateAthanBanner(currentAthanName);
  if (typeof refreshWeatherLang === 'function') refreshWeatherLang();
  if (typeof updatePrayerMethodLabel === 'function') updatePrayerMethodLabel();
  if (typeof wcLifecyclePhase === 'function' && document.getElementById('page-worldcup') && !document.getElementById('page-worldcup').classList.contains('page-hidden')) {
    const wcState = wcLifecyclePhase(new Date());
    if (wcState.phase === 'champion') { wcRenderChampion(wcState.final); }
    else if (wcState.phase === 'ongoing') { wcRenderFixtures(); }
  }
  if (typeof renderNewsList === 'function' && newsItemsCache.length) { renderNewsList(); }
}

