// ================================================================
// Single-page navigation: shows/hides the page sections and wires up nav-item / quick-nav clicks.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Navigation ──
const V2_PAGES = ['home','articles','community','events','gallery','favorites','admin','about','news','worldcup','support','contact'];
function v2GoToPage(page){
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.v2-qn-btn').forEach(b => b.classList.toggle('active', b.dataset.goto === page));
  V2_PAGES.forEach(name => {
    const el = document.getElementById('page-'+name);
    if (!el) return;
    el.style.display = 'block';
    el.classList.toggle('page-hidden', page !== name);
  });
  if (page === 'about') revealAboutPage();
  if (page === 'news') fetchNews(false);
  if (page === 'worldcup') initWorldCupPage();
  if (page === 'admin' && typeof v2InitAdmin === 'function') v2InitAdmin();
  const contentEl = document.querySelector('.content');
  if (contentEl) contentEl.scrollTop = 0;
  window.scrollTo(0, 0);
  const miniPlayerEl = document.getElementById('miniPlayer');
  if (miniPlayerEl) {
    miniPlayerEl.classList.toggle('show', page !== 'home');
    const volPopEl = document.getElementById('miniPlayerVolPop');
    if (volPopEl) volPopEl.classList.remove('open');
  }
}
document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
  btn.addEventListener('click', () => v2GoToPage(btn.dataset.page));
});
document.querySelectorAll('.v2-qn-btn[data-goto], [data-goto]').forEach(btn => {
  btn.addEventListener('click', () => v2GoToPage(btn.dataset.goto));
});

