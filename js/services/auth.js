// ================================================================
// Supabase auth: sign in/up, password reset, Google/Facebook OAuth, sign out, profile edit modal, and refreshAuthUI() which syncs the whole UI to the current session.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ══════════════════════════════════════════════════════════════
// AUTH — Supabase email/password + Google/Facebook OAuth
// (declared here, BEFORE the render calls below, because several
// render functions such as v2ArticleCard() read currentProfile)
// ══════════════════════════════════════════════════════════════
let currentUser = null;
let currentProfile = null;

// Right-rail collapse toggle — available to every visitor, remembered per-browser.
function v2ToggleRightRail(){
  const collapsed = document.documentElement.classList.toggle('right-collapsed');
  const btn = document.getElementById('railToggleBtn');
  if (btn) btn.textContent = collapsed ? '«' : '»';
  try { localStorage.setItem('fw_right_collapsed', collapsed ? '1' : '0'); } catch(e){}
}
(function v2InitRightRail(){
  let collapsed = false;
  try { collapsed = localStorage.getItem('fw_right_collapsed') === '1'; } catch(e){}
  if (collapsed) document.documentElement.classList.add('right-collapsed');
  const btn = document.getElementById('railToggleBtn');
  if (btn) btn.textContent = collapsed ? '«' : '»';
})();

v2RenderArticles();
v2RenderFeed();
v2LoadRealMemberCount();
v2RenderEvents();
v2RenderGallery();
v2RenderFavorites();
v2RenderSongPicker();

function openAuthModal(){ document.getElementById('authOverlay').classList.add('open'); }
function closeAuthModal(){
  document.getElementById('authOverlay').classList.remove('open');
  const err = document.getElementById('authError'); err.classList.remove('show'); err.textContent='';
}
function switchAuthTab(tab){
  const isIn = tab === 'signin';
  document.getElementById('tabSignIn').classList.toggle('active', isIn);
  document.getElementById('tabSignUp').classList.toggle('active', !isIn);
  document.getElementById('signInForm').style.display = isIn ? 'block' : 'none';
  document.getElementById('signUpForm').style.display = isIn ? 'none' : 'block';
  const err = document.getElementById('authError'); err.classList.remove('show'); err.textContent='';
}
function showAuthError(msg){
  const err = document.getElementById('authError');
  err.textContent = msg; err.classList.add('show');
}

async function handleSignIn(e){
  e.preventDefault();
  const email = document.getElementById('siEmail').value.trim();
  const password = document.getElementById('siPassword').value;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { showAuthError(error.message === 'Invalid login credentials' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : error.message); return false; }
  closeAuthModal();
  await refreshAuthUI();
  return false;
}

async function handleSignUp(e){
  e.preventDefault();
  const name = document.getElementById('suName').value.trim();
  const email = document.getElementById('suEmail').value.trim();
  const password = document.getElementById('suPassword').value;
  const { data, error } = await sb.auth.signUp({ email, password, options:{ data:{ username: name } } });
  if (error) { showAuthError(error.message); return false; }
  if (data.user && !data.session){
    showAuthError('تم إنشاء الحساب ✅ تحقق من بريدك الإلكتروني لتفعيله قبل الدخول.');
  } else {
    closeAuthModal();
    await refreshAuthUI();
  }
  return false;
}

async function handleForgotPassword(){
  const email = document.getElementById('siEmail').value.trim();
  if (!email) { showAuthError('اكتب بريدك الإلكتروني في الحقل فوق الأول'); return; }
  const { error } = await sb.auth.resetPasswordForEmail(email);
  if (error) { showAuthError(error.message); return; }
  showAuthError('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك ✅');
}

async function signInWithProvider(provider){
  const { error } = await sb.auth.signInWithOAuth({ provider, options:{ redirectTo: window.location.href } });
  if (error) showAuthError(error.message);
  // Supabase redirects the browser to the provider, then back to this page with a session.
}

async function signOutUser(){
  await sb.auth.signOut();
  currentUser = null; currentProfile = null;
  await refreshAuthUI();
}

function v2GuestCardHTML(){
  return `
    <img class="vpc-avatar" src="https://api.dicebear.com/7.x/initials/svg?seed=%D8%B2%D8%A7%D8%A6%D8%B1&backgroundColor=6e2640,8b5cf6" alt="">
    <h3>زائر</h3>
    <div class="vpc-role">لسه مسجّلتش دخولك</div>
    <p style="font-size:12px;color:var(--muted);margin-top:10px;line-height:1.6;">سجّل حساب جديد عشان تحفظ مفضلاتك، تنشر مقالات، وتتفاعل مع مجتمع عالم فيروز.</p>
    <button type="button" class="vpc-edit" style="margin-top:16px;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#2a1808;border:none;" onclick="openAuthModal()">🔑 تسجيل الدخول / حساب جديد</button>
  `;
}
function calcAgeFromDate(birthDate){
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
function v2MemberCardHTML(u, p){
  const isAdmin = p?.role === 'admin' || p?.role === 'founder';
  const roleLabel = p?.role === 'founder' ? '👑 Founder' : (p?.role === 'admin' ? '🛡️ مشرف' : (p?.role === 'writer' ? '✍️ كاتب' : '🎧 عضو'));
  const name = p?.username || u.email.split('@')[0];
  const displayName = p?.display_name || name;
  const avatar = p?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6e2640,8b5cf6`;
  const level = p?.level || 1;
  const xp = p?.xp || 0;
  const nextLevelXp = level * 100;
  const pct = Math.min(100, Math.round((xp / nextLevelXp) * 100));
  const joined = p?.created_at ? new Date(p.created_at).toLocaleDateString('ar-EG', {month:'long', year:'numeric'}) : '—';
  const hidden = Array.isArray(p?.hidden_fields) ? p.hidden_fields : [];
  const country = COUNTRY_LIST.find(c => c.iso === p?.nationality);
  const genderLabel = {male:'ذكر', female:'أنثى', other:'—'}[p?.gender] || null;
  const age = calcAgeFromDate(p?.birth_date);
  const bio = p?.bio ? `<p style="font-size:12px;color:var(--muted);margin-top:8px;line-height:1.6;">${p.bio}</p>` : '';
  const chips = [];
  if (country && !hidden.includes('nationality')) chips.push(`<span class="v2-role-chip"><img src="https://flagcdn.com/24x18/${country.iso}.png" alt="${country.ar}" style="width:16px;height:12px;border-radius:2px;vertical-align:-1px;margin-left:4px;">${country.ar}</span>`);
  if (genderLabel && !hidden.includes('gender')) chips.push(`<span class="v2-role-chip">${p.gender==='male'?'♂️':(p.gender==='female'?'♀️':'')} ${genderLabel}</span>`);
  if (age != null && !hidden.includes('age')) chips.push(`<span class="v2-role-chip">🎂 ${age} سنة</span>`);
  const chipsRow = chips.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px;">${chips.join('')}</div>` : '';
  const isVerified = isAdmin || p?.verified === true;
  const badges = Array.isArray(p?.badges) ? p.badges : [];
  const badgesRow = badges.length ? `<div class="vpc-badges">${badges.map(b=>`<span title="وسام">${b}</span>`).join('')}</div>` : '';
  return `
    <img class="vpc-avatar" src="${avatar}" alt="${name}">
    <h3>${displayName} ${isVerified ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="#3b9eff"><path d="M12 2 9.5 4.5 6 4l-.5 3.5L2 9l2 3-2 3 3.5 1.5L6 20l3.5-.5L12 22l2.5-2.5 3.5.5.5-3.5L22 15l-2-3 2-3-3.5-1.5L18 4l-3.5.5z"/><path d="m8.5 12 2.3 2.3L16 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</h3>
    <div style="font-size:11px;color:var(--muted);">@${name}</div>
    <div class="vpc-role">${roleLabel}</div>
    ${p?.role === 'founder' ? '<div class="vpc-founder-chip">👑 مؤسس الموقع</div>' : ''}
    ${badgesRow}
    ${bio}
    ${chipsRow}
    <div class="vpc-level">
      <div class="lv-row"><b>Level ${level}</b><span style="color:var(--muted);">${pct}%</span></div>
      <div class="lv-bar"><i style="width:${pct}%;"></i></div>
      <div class="lv-xp">${xp} / ${nextLevelXp} XP</div>
    </div>
    <div class="vpc-info">
      <div><span>انضم في</span><b>${joined}</b></div>
      <div><span>البريد</span><b style="font-size:11px;">${u.email}</b></div>
    </div>
    <button type="button" class="vpc-edit" style="margin-top:12px;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#2a1808;border:none;" onclick="openProfileEditModal()">✏️ تعديل الملف الشخصي</button>
    <button type="button" class="vpc-edit" onclick="signOutUser()">🚪 تسجيل الخروج</button>
  `;
}
// ── Profile Edit Modal logic ──
const COUNTRY_LIST = [
  {iso:'eg', ar:'مصر', en:'Egypt'}, {iso:'lb', ar:'لبنان', en:'Lebanon'}, {iso:'sy', ar:'سوريا', en:'Syria'},
  {iso:'jo', ar:'الأردن', en:'Jordan'}, {iso:'ps', ar:'فلسطين', en:'Palestine'}, {iso:'iq', ar:'العراق', en:'Iraq'},
  {iso:'sa', ar:'السعودية', en:'Saudi Arabia'}, {iso:'ae', ar:'الإمارات', en:'UAE'}, {iso:'kw', ar:'الكويت', en:'Kuwait'},
  {iso:'qa', ar:'قطر', en:'Qatar'}, {iso:'bh', ar:'البحرين', en:'Bahrain'}, {iso:'om', ar:'عُمان', en:'Oman'},
  {iso:'ye', ar:'اليمن', en:'Yemen'}, {iso:'ly', ar:'ليبيا', en:'Libya'}, {iso:'tn', ar:'تونس', en:'Tunisia'},
  {iso:'dz', ar:'الجزائر', en:'Algeria'}, {iso:'ma', ar:'المغرب', en:'Morocco'}, {iso:'sd', ar:'السودان', en:'Sudan'},
  {iso:'tr', ar:'تركيا', en:'Turkey'}, {iso:'us', ar:'أمريكا', en:'USA'}, {iso:'gb', ar:'بريطانيا', en:'UK'},
  {iso:'fr', ar:'فرنسا', en:'France'}, {iso:'de', ar:'ألمانيا', en:'Germany'}, {iso:'ca', ar:'كندا', en:'Canada'},
  {iso:'other', ar:'دولة أخرى', en:'Other'}
];
function peBuildSelects(){
  const natSel = document.getElementById('peNationality');
  if (natSel && !natSel.dataset.built) {
    natSel.innerHTML = '<option value="">— اختر —</option>' + COUNTRY_LIST.map(c => `<option value="${c.iso}">${c.ar}</option>`).join('');
    natSel.dataset.built = '1';
  }
  const daySel = document.getElementById('peBirthDay');
  if (daySel && !daySel.dataset.built) {
    daySel.innerHTML = '<option value="">يوم</option>' + Array.from({length:31}, (_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
    daySel.dataset.built = '1';
  }
  const monthSel = document.getElementById('peBirthMonth');
  if (monthSel && !monthSel.dataset.built) {
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    monthSel.innerHTML = '<option value="">شهر</option>' + months.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('');
    monthSel.dataset.built = '1';
  }
  const yearSel = document.getElementById('peBirthYear');
  if (yearSel && !yearSel.dataset.built) {
    const nowY = new Date().getFullYear();
    let opts = '<option value="">سنة</option>';
    for (let y = nowY; y >= nowY - 90; y--) opts += `<option value="${y}">${y}</option>`;
    yearSel.innerHTML = opts;
    yearSel.dataset.built = '1';
  }
}
function peUpdateAgePreview(){
  const d = document.getElementById('peBirthDay').value, m = document.getElementById('peBirthMonth').value, y = document.getElementById('peBirthYear').value;
  const el = document.getElementById('peAgePreview');
  if (d && m && y) {
    const age = calcAgeFromDate(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
    el.textContent = age != null ? `عمرك الحالي: ${age} سنة` : '';
  } else el.textContent = '';
}
let peAvatarDataUrl = null;
function peHandleAvatarFile(e){
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    peAvatarDataUrl = reader.result;
    document.getElementById('peAvatarPreview').src = peAvatarDataUrl;
  };
  reader.readAsDataURL(file);
}
function openProfileEditModal(){
  if (!currentUser) { openAuthModal(); return; }
  peBuildSelects();
  const p = currentProfile || {};
  const name = p.username || currentUser.email.split('@')[0];
  document.getElementById('peAvatarPreview').src = p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6e2640,8b5cf6`;
  peAvatarDataUrl = null;
  document.getElementById('peUsername').value = p.username || '';
  document.getElementById('peDisplayName').value = p.display_name || '';
  document.getElementById('peBio').value = p.bio || '';
  document.getElementById('peNationality').value = p.nationality || '';
  document.getElementById('peGender').value = p.gender || '';
  const hidden = Array.isArray(p.hidden_fields) ? p.hidden_fields : [];
  document.getElementById('peHideNationality').checked = hidden.includes('nationality');
  document.getElementById('peHideGender').checked = hidden.includes('gender');
  document.getElementById('peHideAge').checked = hidden.includes('age');
  if (p.birth_date) {
    const [y,m,d] = p.birth_date.split('-');
    document.getElementById('peBirthYear').value = String(Number(y));
    document.getElementById('peBirthMonth').value = String(Number(m));
    document.getElementById('peBirthDay').value = String(Number(d));
  } else {
    document.getElementById('peBirthYear').value = '';
    document.getElementById('peBirthMonth').value = '';
    document.getElementById('peBirthDay').value = '';
  }
  peUpdateAgePreview();
  ['peBirthDay','peBirthMonth','peBirthYear'].forEach(id => document.getElementById(id).onchange = peUpdateAgePreview);
  document.getElementById('peError').classList.remove('show');
  document.getElementById('profileEditOverlay').classList.add('open');
}
function closeProfileEditModal(){ document.getElementById('profileEditOverlay').classList.remove('open'); }
async function saveProfileEdit(){
  const errEl = document.getElementById('peError');
  errEl.classList.remove('show');
  const btn = document.getElementById('peSaveBtn');
  const username = document.getElementById('peUsername').value.trim();
  if (!username) { errEl.textContent = 'اسم المستخدم مطلوب'; errEl.classList.add('show'); return; }
  btn.disabled = true; btn.textContent = 'جاري الحفظ...';

  let avatar_url = currentProfile?.avatar_url || null;
  if (peAvatarDataUrl) {
    try {
      const blob = await (await fetch(peAvatarDataUrl)).blob();
      const path = `${currentUser.id}/${Date.now()}.jpg`;
      const { error: upErr } = await sb.storage.from('avatars').upload(path, blob, { upsert:true });
      if (upErr) throw upErr;
      const { data: pub } = sb.storage.from('avatars').getPublicUrl(path);
      avatar_url = pub.publicUrl;
    } catch (e) {
      // Storage bucket may not exist yet — fall back to storing the image inline
      avatar_url = peAvatarDataUrl;
    }
  }

  const d = document.getElementById('peBirthDay').value, m = document.getElementById('peBirthMonth').value, y = document.getElementById('peBirthYear').value;
  const birth_date = (d && m && y) ? `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}` : null;

  const hidden_fields = [];
  if (document.getElementById('peHideNationality').checked) hidden_fields.push('nationality');
  if (document.getElementById('peHideGender').checked) hidden_fields.push('gender');
  if (document.getElementById('peHideAge').checked) hidden_fields.push('age');

  const updates = {
    username,
    display_name: document.getElementById('peDisplayName').value.trim() || null,
    bio: document.getElementById('peBio').value.trim() || null,
    nationality: document.getElementById('peNationality').value || null,
    gender: document.getElementById('peGender').value || null,
    birth_date,
    hidden_fields,
    avatar_url
  };

  const { error } = await sb.from('profiles').update(updates).eq('id', currentUser.id);
  btn.disabled = false; btn.textContent = '💾 حفظ التعديلات';
  if (error) {
    errEl.textContent = 'تعذّر الحفظ: ' + error.message + ' — تأكد إن أعمدة الملف الشخصي (username, bio, nationality...) موجودة في جدول profiles على Supabase.';
    errEl.classList.add('show');
    return;
  }
  closeProfileEditModal();
  await refreshAuthUI();
}

async function refreshAuthUI(){
  const { data:{ session } } = await sb.auth.getSession();
  currentUser = session ? session.user : null;

  if (currentUser){
    const { data: profile } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
    currentProfile = profile || null;
  } else {
    currentProfile = null;
  }
  const isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'founder';

  // Sidebar mini-profile
  const vmpName = document.getElementById('vmpName');
  const vmpAvatar = document.getElementById('vmpAvatar');
  const vmpRole = document.getElementById('vmpRole');
  const vmpBarWrap = document.getElementById('vmpBarWrap');
  const vmpBarFill = document.getElementById('vmpBarFill');
  const sidebarProfileEl = document.getElementById('v2SidebarProfile');
  if (currentUser){
    const name = currentProfile?.username || currentUser.email.split('@')[0];
    if (vmpName) vmpName.innerHTML = name + (isAdmin ? ' <svg width="12" height="12" viewBox="0 0 24 24" fill="#d9b888"><path d="M5 16 2 6l6 4 4-7 4 7 6-4-3 10H5zm0 2h14v2H5v-2z"/></svg>' : '');
    if (vmpAvatar) vmpAvatar.src = currentProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6e2640,8b5cf6`;
    if (vmpRole){ vmpRole.style.display='block'; vmpRole.textContent = isAdmin ? '👑 Founder' : '🎧 عضو'; }
    if (vmpBarWrap) vmpBarWrap.style.display='block';
    if (vmpBarFill){ const lvl=currentProfile?.level||1; const xp=currentProfile?.xp||0; vmpBarFill.style.width = Math.min(100, Math.round((xp/(lvl*100))*100)) + '%'; }
    if (sidebarProfileEl) sidebarProfileEl.onclick = () => v2GoToPage(isAdmin ? 'admin' : 'favorites');
  } else {
    if (vmpName) vmpName.textContent = 'زائر — دخول / تسجيل';
    if (vmpRole) vmpRole.style.display='none';
    if (vmpBarWrap) vmpBarWrap.style.display='none';
    if (sidebarProfileEl) sidebarProfileEl.onclick = openAuthModal;
  }

  // Right sidebar profile card — fully re-rendered per auth state
  const cardEl = document.getElementById('v2ProfileCard');
  if (cardEl) cardEl.innerHTML = currentUser ? v2MemberCardHTML(currentUser, currentProfile) : v2GuestCardHTML();

  // Admin dashboard nav item — only for admin/founder roles
  const adminBtn = document.getElementById('navAdminBtn');
  if (adminBtn) adminBtn.style.display = isAdmin ? 'flex' : 'none';
  if (!isAdmin && document.getElementById('page-admin') && !document.getElementById('page-admin').classList.contains('page-hidden')){
    v2GoToPage('home'); // kick out non-admins who were viewing it before signing out
  }
  if (typeof v2RenderArticles === 'function') v2RenderArticles();
  if (typeof v2RenderFavorites === 'function') { v2RenderFavorites(); v2RenderSongPicker(); }

  // Topbar auth CTA — hide once signed in
  const cta = document.getElementById('v2AuthCta');
  if (cta) cta.style.display = currentUser ? 'none' : 'inline-flex';

  // Add-article panel: only signed-in users can post
  const addArtPanel = document.getElementById('addArticlePanel');
  if (addArtPanel) addArtPanel.style.opacity = currentUser ? '1' : '.5';

  // Community composer: only visible to logged-in users
  const composerBox = document.getElementById('v2ComposerBox');
  const guestPrompt = document.getElementById('v2ComposerGuestPrompt');
  if (composerBox && guestPrompt) {
    composerBox.style.display = currentUser ? 'flex' : 'none';
    guestPrompt.style.display = currentUser ? 'none' : 'flex';
    if (currentUser) {
      const name = currentProfile?.display_name || currentProfile?.username || currentUser.email.split('@')[0];
      const avatarEl = document.getElementById('v2ComposerAvatar');
      if (avatarEl) avatarEl.src = currentProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6e2640,8b5cf6`;
      const inputEl = document.getElementById('v2ComposerInput');
      if (inputEl) inputEl.placeholder = `بماذا تفكر يا ${name}؟`;
    }
  }
}

// If redirected back from Google/Facebook OAuth, Supabase auto-detects the
// session from the URL hash — just refresh the UI once the page has loaded.
// Wrapped defensively: if the Supabase SDK failed to load (offline, ad-blocker,
// slow network...) this must NEVER stop the rest of the page's scripts
// (clock, weather, prayer times, radio player) from running below.
try {
  sb.auth.onAuthStateChange((_event, _session) => { refreshAuthUI().catch(()=>{}); });
  refreshAuthUI().catch(()=>{});
} catch (e) { console.warn('Auth init skipped:', e); }

// Keep the mini-player play icon (floating bar) in sync with the sidebar's now-playing widget
(function(){
  const origToggle = togglePlay;
  window.togglePlay = function(){
    origToggle();
    const ic = document.getElementById('v2PlayIcon');
    if (ic) ic.textContent = isPlaying ? '⏸' : '▶';
    syncHeroPlayBtn();
  };
})();

// Keep the homepage hero Play/Pause button synced with playback state,
// regardless of which code path (hero click, live page, mini player) changed it.
function syncHeroPlayBtn(){
  const icon = document.getElementById('heroPlayIcon');
  const label = document.getElementById('heroPlayLabel');
  if (!icon || !label) return;
  const ar = currentLang === 'ar';
  if (isPlaying) {
    icon.textContent = '⏸';
    label.textContent = ar ? 'إيقاف البث' : 'Pause';
  } else if (isStarting) {
    icon.textContent = '…';
    label.textContent = ar ? 'جاري الاتصال...' : 'Connecting...';
  } else {
    icon.textContent = '▶';
    label.textContent = ar ? 'استمع الآن' : 'Listen Now';
  }
}
setInterval(syncHeroPlayBtn, 500);

