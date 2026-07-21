// ================================================================
// V2 mock content (articles, activity feed, events, gallery, favorites/song catalog) + admin dashboard rendering (users table, article moderation, charts). Talks to Supabase for live user counts/lists.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ══════════════════════════════════════════════════════════════
// V2 DATA LAYER — mock data for now. Each function below is written
// so it can be swapped 1:1 for a Supabase call later, e.g.:
//   async function v2GetArticles(){ const {data} = await sb.from('articles').select('*').eq('status','published').order('created_at',{ascending:false}); return data; }
// ══════════════════════════════════════════════════════════════
const V2_ARTICLES = [
  {id:1, title:'فيروز… صوت لا يشبه أحد', excerpt:'رحلة في حياة السيدة فيروز ومسيرتها الفنية الفريدة', author:'Mona Saad', avatar:'https://i.pravatar.cc/60?img=5', views:'2.4K', time:'منذ 5 ساعات', tag:'مقال', hue:['#8b5cf6','#c9879c'], featured:false},
  {id:2, title:'أجمل 10 أغاني لفيروز في الصباح', excerpt:'بداية يومك مع فيروز غير يوم كل يوم', author:'Karim Adel', avatar:'https://i.pravatar.cc/60?img=12', views:'1.8K', time:'منذ يوم', tag:'مقال', hue:['#6e2640','#d9b888'], featured:false},
  {id:3, title:'كلمات لا تُنسى من أغاني فيروز', excerpt:'أجمل ما كتبت السيدة فيروز وأبدعت', author:'Nourhan', avatar:'https://i.pravatar.cc/60?img=32', views:'3.1K', time:'منذ يومين', tag:'مقال', hue:['#3a1220','#8b5cf6'], featured:false},
  {id:4, title:'قصة أغنية بحبك يا لبنان', excerpt:'كيف وُلدت واحدة من أعظم أغاني فيروز الوطنية', author:'Ahmed Tarek', avatar:'https://i.pravatar.cc/60?img=15', views:'980', time:'منذ 3 أيام', tag:'مقال', hue:['#c9879c','#6e2640'], featured:false},
  {id:5, title:'فيروز والرحابنة: ثلاثية موسيقية', excerpt:'كيف شكّل عاصي ومنصور الرحباني عالم فيروز', author:'Mona Saad', avatar:'https://i.pravatar.cc/60?img=5', views:'1.2K', time:'منذ 4 أيام', tag:'مقال', hue:['#8b5cf6','#3a1220'], featured:false},
  {id:6, title:'حفلات فيروز الأسطورية حول العالم', excerpt:'من بعلبك إلى لاس فيغاس… جولة في أشهر حفلاتها', author:'Karim Adel', avatar:'https://i.pravatar.cc/60?img=12', views:'2.0K', time:'منذ أسبوع', tag:'مقال', hue:['#d9b888','#8b5cf6'], featured:false}
];
// Pin state persists locally so it survives page reloads (until this is wired to a real `articles` table in Supabase).
try {
  const savedPins = JSON.parse(localStorage.getItem('fw_featured_articles') || '[]');
  V2_ARTICLES.forEach(a => { if (savedPins.includes(a.id)) a.featured = true; });
} catch(e){}
function v2SaveFeaturedPins(){
  try { localStorage.setItem('fw_featured_articles', JSON.stringify(V2_ARTICLES.filter(a=>a.featured).map(a=>a.id))); } catch(e){}
}
function v2ToggleFeatured(id){
  const a = V2_ARTICLES.find(x => x.id === id);
  if (!a) return;
  a.featured = !a.featured;
  v2SaveFeaturedPins();
  v2RenderArticles();
}
function v2ArticleCardSVG(hue){
  const id = 'g'+Math.random().toString(36).slice(2,8);
  return `<svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hue[0]}"/><stop offset="1" stop-color="${hue[1]}"/></linearGradient></defs><rect width="300" height="150" fill="url(#${id})"/><circle cx="250" cy="30" r="40" fill="#fff" opacity=".06"/><circle cx="40" cy="120" r="60" fill="#fff" opacity=".05"/></svg>`;
}
function v2ArticleCard(a){
  const isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'founder';
  const pinBtn = isAdmin ? `<button type="button" class="v2-pin-btn" title="${a.featured?'إلغاء التثبيت':'تثبيت في الرئيسية'}" onclick="event.stopPropagation();v2ToggleFeatured(${a.id});" style="position:absolute;top:8px;left:8px;z-index:2;width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:${a.featured?'linear-gradient(135deg,var(--gold2),var(--gold))':'rgba(0,0,0,.45)'};color:${a.featured?'#2a1808':'#fff'};font-size:14px;cursor:pointer;">${a.featured?'📌':'📍'}</button>` : '';
  return `<div class="v2-article" onclick="v2GoToPage('articles')" style="position:relative;">
    ${pinBtn}
    <div class="va-img">${v2ArticleCardSVG(a.hue)}<span class="va-tag">📄 ${a.tag}</span></div>
    <div class="va-body">
      <h3>${a.title}</h3>
      <p>${a.excerpt}</p>
      <div class="va-meta"><img src="${a.avatar}" alt=""><span>${a.author}</span><span class="va-sep">👁 ${a.views} · ${a.time}</span></div>
    </div>
  </div>`;
}
function v2RenderArticles(){
  const feat = document.getElementById('v2FeaturedArticles');
  if (feat) {
    const pinned = V2_ARTICLES.filter(a => a.featured);
    feat.innerHTML = pinned.length
      ? pinned.map(v2ArticleCard).join('')
      : `<div class="v2-empty-featured" style="grid-column:1/-1;text-align:center;color:var(--muted);padding:24px 12px;border:1px dashed var(--border);border-radius:14px;">لسه مفيش مقالات مميزة — ${(currentProfile?.role==='admin'||currentProfile?.role==='founder') ? 'ثبّت مقال من صفحة المقالات بالضغط على 📍' : 'تابعنا قريبًا!'}</div>`;
  }
  const all = document.getElementById('v2AllArticles');
  if (all) all.innerHTML = V2_ARTICLES.map(v2ArticleCard).join('');
  const c1 = document.getElementById('v2StatArticles'); if (c1) c1.textContent = V2_ARTICLES.length + '';
}

// Real activity only: locally-composed posts this session, merged with real
// new-member signups fetched from Supabase. No fake users, no invented events.
// (Once a `community_posts` table exists, swap the local array below for a
// real `sb.from('community_posts').select('*')` call.)
let V2_FEED = [];
function v2RelTimeAr(dateInput){
  const d = new Date(dateInput);
  const diffSec = Math.max(0, Math.round((Date.now() - d.getTime())/1000));
  if (diffSec < 60) return 'الآن';
  const mins = Math.round(diffSec/60);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.round(mins/60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.round(hrs/24);
  return `منذ ${days} يوم`;
}
function v2FeedItem(f){
  return `<div class="vf-item"><img src="${f.avatar}" alt=""><div><p>${f.obj}</p><small>${f.time}</small></div></div>`;
}
async function v2RenderFeed(){
  const home = document.getElementById('v2HomeFeed');
  const full = document.getElementById('v2CommunityFeed');
  if (!home && !full) return;
  let signups = [];
  try {
    const { data, error } = await sb.from('profiles').select('username,display_name,avatar_url,created_at').order('created_at', {ascending:false}).limit(10);
    if (!error && data) {
      signups = data.map(u => {
        const name = u.display_name || u.username || 'عضو جديد';
        const avatar = u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6e2640,8b5cf6`;
        return { avatar, obj: `${name} انضم/ت حديثًا إلى عالم فيروز`, time: v2RelTimeAr(u.created_at), ts: new Date(u.created_at).getTime() };
      });
    }
  } catch(e){}
  const merged = [...V2_FEED.map(f => ({...f, ts: f.ts || Date.now()})), ...signups].sort((a,b) => b.ts - a.ts);
  if (home) home.innerHTML = merged.length ? merged.slice(0,4).map(v2FeedItem).join('') : `<div style="text-align:center;color:var(--muted);padding:18px 10px;font-size:13px;">لسه مفيش نشاط — كن أول عضو يتفاعل! 🎧</div>`;
  if (full) full.innerHTML = merged.length ? merged.map(v2FeedItem).join('') : `<div style="text-align:center;color:var(--muted);padding:18px 10px;font-size:13px;">لسه مفيش نشاط — كن أول عضو يتفاعل! 🎧</div>`;
}
function v2Post(){
  if (!currentUser) { openAuthModal(); return; }
  const input = document.getElementById('v2ComposerInput');
  if (!input || !input.value.trim()) return;
  const name = currentProfile?.display_name || currentProfile?.username || currentUser.email.split('@')[0];
  const avatar = currentProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6e2640,8b5cf6`;
  V2_FEED.unshift({avatar, obj:name+': '+input.value.trim(), time:'الآن', ts: Date.now()});
  input.value='';
  v2RenderFeed();
  // TODO: Supabase insert into `community_posts`
}

const V2_EVENTS = [
  {d:'25', m:'يوليو', title:'ذكرى ميلاد فيروز', desc:'احتفال خاص وبث مباشر بأشهر أغانيها طوال اليوم'},
  {d:'01', m:'أغسطس', title:'إطلاق النسخة الجديدة من الموقع', desc:'عالم فيروز بحلة جديدة كلياً — تابعونا!'},
  {d:'15', m:'سبتمبر', title:'أمسية بعلبك السنوية', desc:'استعادة لأشهر حفلات فيروز التاريخية في بعلبك'},
  {d:'10', m:'نوفمبر', title:'ليلة الرحابنة', desc:'بث خاص لأعمال عاصي ومنصور الرحباني مع فيروز'}
];
function v2RenderEvents(){
  const el = document.getElementById('v2EventList');
  if (!el) return;
  el.innerHTML = V2_EVENTS.map(e => `<div class="v2-event"><div class="ev-date"><b>${e.d}</b><span>${e.m}</span></div><div><h3>${e.title}</h3><p>${e.desc}</p></div></div>`).join('');
}

const V2_GALLERY = [
  ['#8b5cf6','#c9879c'], ['#6e2640','#d9b888'], ['#3a1220','#8b5cf6'], ['#c9879c','#6e2640'],
  ['#8b5cf6','#3a1220'], ['#d9b888','#8b5cf6'], ['#6e2640','#c9879c'], ['#3a1220','#d9b888']
];
function v2RenderGallery(){
  const el = document.getElementById('v2GalleryGrid');
  if (!el) return;
  el.innerHTML = V2_GALLERY.map((hue,i) => `<div class="gph" onclick="void 0">${v2ArticleCardSVG(hue)}<span class="gph-cap">لقطة #${i+1}</span></div>`).join('');
}

// Full catalog of songs users can pick from to build their favorites
const FAIROUZ_SONG_CATALOG = [
  {id:'s1', title:'بحبك يا لبنان', hue:['#8b5cf6','#c9879c']},
  {id:'s2', title:'سألوني الناس', hue:['#3a1220','#8b5cf6']},
  {id:'s3', title:'نسم علينا الهوا', hue:['#6e2640','#d9b888']},
  {id:'s4', title:'كيفك أنت', hue:['#c9879c','#6e2640']},
  {id:'s5', title:'شايف البحر شو كبير', hue:['#8b5cf6','#3a1220']},
  {id:'s6', title:'عودك رنّ', hue:['#d9b888','#8b5cf6']},
  {id:'s7', title:'زهرة المدائن', hue:['#3a1220','#c9879c']},
  {id:'s8', title:'راجعون', hue:['#6e2640','#8b5cf6']},
  {id:'s9', title:'يا أنا يا أنا', hue:['#8b5cf6','#d9b888']},
  {id:'s10', title:'حبيتك بالصيف', hue:['#c9879c','#3a1220']},
  {id:'s11', title:'قدك المياس', hue:['#d9b888','#6e2640']},
  {id:'s12', title:'إسوارة العروس', hue:['#8b5cf6','#c9879c']}
];
// Load / persist which songs the current user has favorited
function v2FavKey(){ return 'fw_user_favorites_' + (currentUser?.id || 'guest'); }
function v2LoadFavIds(){
  try { return JSON.parse(localStorage.getItem(v2FavKey()) || '[]'); } catch(e){ return []; }
}
function v2SaveFavIds(ids){
  try { localStorage.setItem(v2FavKey(), JSON.stringify(ids)); } catch(e){}
}
function v2ToggleFavorite(songId){
  if (!currentUser) { closeAuthModal(); openAuthModal(); return; }
  let ids = v2LoadFavIds();
  ids = ids.includes(songId) ? ids.filter(x => x !== songId) : [...ids, songId];
  v2SaveFavIds(ids);
  v2RenderFavorites();
  v2RenderSongPicker();
}
function v2RenderFavorites(){
  const el = document.getElementById('v2FavList');
  if (!el) return;
  const ids = v2LoadFavIds();
  const items = FAIROUZ_SONG_CATALOG.filter(s => ids.includes(s.id));
  el.innerHTML = items.length
    ? items.map(f => `<div class="v2-fav-item"><div class="fv-thumb">${v2ArticleCardSVG(f.hue)}</div><div><h4>${f.title}</h4><span>أغنية</span></div><button type="button" onclick="v2ToggleFavorite('${f.id}')">✕</button></div>`).join('')
    : `<div style="text-align:center;color:var(--muted);padding:20px;border:1px dashed var(--border);border-radius:14px;">لسه معندكش أغاني مفضلة — اختار من القائمة تحت 👇</div>`;
}
function v2RenderSongPicker(){
  const el = document.getElementById('v2SongPicker');
  if (!el) return;
  const q = (document.getElementById('v2SongSearch')?.value || '').trim();
  const ids = v2LoadFavIds();
  const list = FAIROUZ_SONG_CATALOG.filter(s => s.title.includes(q));
  el.innerHTML = list.map(s => {
    const active = ids.includes(s.id);
    return `<div class="v2-article" onclick="v2ToggleFavorite('${s.id}')" style="cursor:pointer;position:relative;">
      ${active ? '<span style="position:absolute;top:8px;left:8px;z-index:2;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#2a1808;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;">✓</span>' : ''}
      <div class="va-img">${v2ArticleCardSVG(s.hue)}<span class="va-tag">🎵 أغنية</span></div>
      <div class="va-body"><h3>${s.title}</h3><p>${active ? 'في مفضلتك — دوس عشان تشيلها' : 'دوس عشان تضيفها للمفضلة'}</p></div>
    </div>`;
  }).join('') || `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:16px;">مفيش نتايج</div>`;
}

function v2SaveDraft(){
  if (!currentUser) { closeAuthModal(); openAuthModal(); return; }
  const t = document.getElementById('v2ArtTitle');
  if (t) { alert('تم حفظ المقال كمسودة ✅'); t.value=''; document.getElementById('v2ArtBody').value=''; }
  // TODO: Supabase insert into `articles` with status='draft'
}
function v2SubmitArticle(){
  if (!currentUser) { closeAuthModal(); openAuthModal(); return; }
  const t = document.getElementById('v2ArtTitle');
  if (!t || !t.value.trim()) { alert('اكتب عنوان المقال أولاً'); return; }
  alert('تم إرسال المقال للمراجعة ✅');
  t.value=''; document.getElementById('v2ArtBody').value='';
  // TODO: Supabase insert into `articles` with status='pending'
}
function sendPageMsg(page){ v2GoToPage(page === 'profile' || page === 'settings' ? 'admin' : page); }

// ── Admin dashboard ──
async function v2RenderUsers(){
  const body = document.getElementById('v2UsersTableBody');
  if (!body) return;
  body.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:16px;">جاري التحميل...</td></tr>';
  const { data: users, error } = await sb.from('profiles').select('*').order('created_at', {ascending:false});
  if (error){ body.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#f87171;padding:16px;">تعذّر تحميل المستخدمين: ${error.message}</td></tr>`; return; }

  const q = (document.getElementById('v2UserSearch')?.value || '').trim().toLowerCase();
  const activeTab = document.querySelector('#v2UserTabs button.active')?.dataset.utab || 'all';
  const rows = (users || []).filter(u => {
    const name = (u.username || '').toLowerCase();
    if (q && !name.includes(q)) return false;
    if (activeTab === 'admin' && !['admin','founder'].includes(u.role)) return false;
    if (activeTab === 'writer' && u.role !== 'writer') return false;
    return true;
  });
  const roleLabels = {founder:'👑 Founder', admin:'🛡️ مشرف', writer:'✍️ كاتب', member:'🎧 عضو'};
  const isFounderViewing = currentProfile?.role === 'founder';
  body.innerHTML = rows.map(u => `<tr>
    <td><div class="u-cell"><img src="${u.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed='+encodeURIComponent(u.username||'?')+'&backgroundColor=6e2640,8b5cf6'}" alt="">${u.username || '(بدون اسم)'}</div></td>
    <td>${u.country || '—'}</td>
    <td>${u.created_at ? new Date(u.created_at).toLocaleDateString('ar-EG') : '—'}</td>
    <td>
      ${isFounderViewing ? `<select class="v2-role-chip" style="background:var(--surface);color:var(--text);border:1px solid var(--border);padding:4px 6px;border-radius:8px;" onchange="v2ChangeUserRole('${u.id}', this.value, this)">
        ${Object.entries(roleLabels).map(([val,label]) => `<option value="${val}" ${u.role===val?'selected':''}>${label}</option>`).join('')}
      </select>` : `<span class="v2-role-chip">${roleLabels[u.role] || u.role || '—'}</span>`}
    </td>
    <td>
      ${isFounderViewing ? `<input type="number" min="1" max="500" value="${u.level || 1}" style="width:52px;background:var(--surface);color:var(--text);border:1px solid var(--border);padding:4px 6px;border-radius:8px;font-family:inherit;" onchange="v2ChangeUserLevel('${u.id}', this.value, this)">` : `Lv. ${u.level || 1}`}
    </td>
    <td style="text-align:center;">
      ${isFounderViewing ? `<input type="checkbox" ${u.verified ? 'checked' : ''} title="توثيق الحساب" style="width:17px;height:17px;cursor:pointer;" onchange="v2ToggleUserVerified('${u.id}', this.checked, this)">` : (u.verified ? '✔️' : '—')}
    </td>
    <td>
      ${isFounderViewing ? `<input type="text" value="${(Array.isArray(u.badges) ? u.badges : []).join(' ')}" placeholder="🏆 🎖️ ⭐" style="width:90px;background:var(--surface);color:var(--text);border:1px solid var(--border);padding:4px 6px;border-radius:8px;font-family:inherit;font-size:13px;" onchange="v2SetUserBadges('${u.id}', this.value, this)">` : `${(Array.isArray(u.badges) ? u.badges : []).join(' ') || '—'}`}
    </td>
    <td><span class="v2-status-dot on"></span>مسجّل</td>
    <td style="display:flex;gap:6px;">
      ${(currentUser && u.id !== currentUser.id) ? `<button type="button" class="v2-act-btn" id="followBtn-${u.id}" onclick="v2ToggleFollow('${u.id}', this)">…</button>` : ''}
      ${isFounderViewing ? `<button type="button" class="v2-act-btn v2-act-reject" title="حذف الحساب (من لوحة Supabase)" onclick="alert('حذف المستخدمين نهائيًا بيتم من لوحة Supabase مباشرة (Authentication → Users) حفاظًا على الأمان.')">🗑</button>` : ''}
    </td>
  </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:16px;">لا يوجد مستخدمين لسه</td></tr>';

  if (currentUser) {
    const { data: myFollows } = await sb.from('follows').select('following_id').eq('follower_id', currentUser.id);
    const followingIds = new Set((myFollows || []).map(f => f.following_id));
    rows.forEach(u => {
      if (u.id === currentUser.id) return;
      const btn = document.getElementById('followBtn-' + u.id);
      if (btn) {
        const isFollowing = followingIds.has(u.id);
        btn.textContent = isFollowing ? '✓ متابَع' : '+ متابعة';
        btn.style.color = isFollowing ? 'var(--gold2)' : '';
      }
    });
  }
}
async function v2ToggleFollow(userId, btnEl){
  if (!currentUser) { openAuthModal(); return; }
  btnEl.disabled = true;
  const { data: existing } = await sb.from('follows').select('*').eq('follower_id', currentUser.id).eq('following_id', userId).maybeSingle();
  if (existing) {
    await sb.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', userId);
    btnEl.textContent = '+ متابعة'; btnEl.style.color = '';
  } else {
    const { error } = await sb.from('follows').insert({ follower_id: currentUser.id, following_id: userId });
    if (error) { alert('تعذّرت المتابعة: ' + error.message + '\n\n(لازم جدول follows موجود في Supabase — شوف تعليمات الإعداد)'); btnEl.disabled = false; return; }
    btnEl.textContent = '✓ متابَع'; btnEl.style.color = 'var(--gold2)';
  }
  btnEl.disabled = false;
}
async function v2ChangeUserRole(userId, newRole, selectEl){
  if (currentProfile?.role !== 'founder'){ alert('تغيير الأدوار متاح للمؤسس فقط حاليًا.'); v2RenderUsers(); return; }
  selectEl.disabled = true;
  const { error } = await sb.from('profiles').update({ role: newRole }).eq('id', userId);
  selectEl.disabled = false;
  if (error){
    alert('تعذّر تغيير الصلاحية: ' + error.message + '\n\n(لو الرسالة بتقول "row-level security"، لازم تضيف policy في Supabase تسمح للأدمن يعدّل بروفايلات غيره — راجع تعليمات الأدمن).');
    v2RenderUsers();
    return;
  }
  // If the admin just changed their OWN role, refresh the whole UI immediately
  if (currentUser && userId === currentUser.id) refreshAuthUI();
}
async function v2ChangeUserLevel(userId, newLevel, inputEl){
  if (currentProfile?.role !== 'founder'){ alert('تعديل المستوى متاح للمؤسس فقط حاليًا.'); v2RenderUsers(); return; }
  const lvl = Math.max(1, Math.min(500, parseInt(newLevel, 10) || 1));
  inputEl.value = lvl; inputEl.disabled = true;
  // No organic XP-earning system exists yet, so a manually-granted level should
  // show as a full bar rather than 0% (which happened before because xp stayed
  // at its old value while the required xp — level*100 — jumped up).
  const { error } = await sb.from('profiles').update({ level: lvl, xp: lvl * 100 }).eq('id', userId);
  inputEl.disabled = false;
  if (error){ alert('تعذّر تغيير المستوى: ' + error.message + '\n\n(محتاج عمود "level" (int) في جدول profiles على Supabase).'); return; }
  if (currentUser && userId === currentUser.id) refreshAuthUI();
}
async function v2ToggleUserVerified(userId, isVerified, checkboxEl){
  if (currentProfile?.role !== 'founder'){ alert('توثيق الحسابات متاح للمؤسس فقط حاليًا.'); checkboxEl.checked = !isVerified; return; }
  checkboxEl.disabled = true;
  const { error } = await sb.from('profiles').update({ verified: isVerified }).eq('id', userId);
  checkboxEl.disabled = false;
  if (error){ alert('تعذّر تغيير حالة التوثيق: ' + error.message + '\n\n(محتاج عمود "verified" (boolean) في جدول profiles على Supabase).'); checkboxEl.checked = !isVerified; return; }
  if (currentUser && userId === currentUser.id) refreshAuthUI();
}
async function v2SetUserBadges(userId, rawValue, inputEl){
  if (currentProfile?.role !== 'founder'){ alert('إضافة الأوسمة متاحة للمؤسس فقط حاليًا.'); v2RenderUsers(); return; }
  const badges = rawValue.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  inputEl.disabled = true;
  const { error } = await sb.from('profiles').update({ badges }).eq('id', userId);
  inputEl.disabled = false;
  if (error){ alert('تعذّر حفظ الأوسمة: ' + error.message + '\n\n(محتاج عمود "badges" (jsonb أو array) في جدول profiles على Supabase).'); return; }
  if (currentUser && userId === currentUser.id) refreshAuthUI();
}
// Real submissions queue — empty until members actually submit articles via v2SubmitArticle()
// (wire this to `sb.from('articles').select('*')` once the articles table exists on Supabase).
const V2_ARTICLES_ADMIN = [];
function v2RenderArticleTabCounts(){
  const counts = {all: V2_ARTICLES_ADMIN.length, pending:0, pub:0, rej:0};
  V2_ARTICLES_ADMIN.forEach(a => { if (counts[a.status] != null) counts[a.status]++; });
  const labelText = {all:'الكل', pending:'قيد المراجعة', pub:'المنشورة', rej:'المرفوضة'};
  document.querySelectorAll('#v2ArtTabs button[data-atab]').forEach(btn => {
    const key = btn.dataset.atab;
    btn.textContent = `${labelText[key]} (${counts[key] || 0})`;
  });
}
function v2RenderArticlesAdmin(){
  const body = document.getElementById('v2ArticlesTableBody');
  if (!body) return;
  v2RenderArticleTabCounts();
  const activeTab = document.querySelector('#v2ArtTabs button.active')?.dataset.atab || 'all';
  const label = {pub:'منشور', pending:'قيد المراجعة', rej:'مرفوض'};
  const rows = V2_ARTICLES_ADMIN.filter(a => activeTab === 'all' || a.status === activeTab);
  body.innerHTML = rows.map(a => `<tr>
    <td>${a.author}</td><td>${a.title}</td><td>${a.date}</td>
    <td><span class="v2-art-status ${a.status}">${label[a.status]}</span></td>
    <td>${a.status==='pending' ? '<button type="button" class="v2-act-btn v2-act-approve" title="نشر">✓</button><button type="button" class="v2-act-btn v2-act-reject" title="رفض">✕</button>' : ''}<button type="button" class="v2-act-btn v2-act-edit" title="تعديل">✎</button></td>
  </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:16px;">لا يوجد مقالات لسه</td></tr>';
}
function v2DrawLineChart(){
  const svg = document.getElementById('v2LineChart');
  if (!svg) return;
  const vals = [40,65,50,80,60,95,72];
  const w=600,h=150,pad=10,max=100;
  const step = (w-pad*2)/(vals.length-1);
  const pts = vals.map((v,i)=> [pad+i*step, h-pad-(v/max)*(h-pad*2)]);
  const line = pts.map((p,i)=> (i===0?'M':'L')+p[0]+','+p[1]).join(' ');
  const area = line + ` L${pad+(vals.length-1)*step},${h-pad} L${pad},${h-pad} Z`;
  svg.innerHTML = `<defs><linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b888" stop-opacity=".35"/><stop offset="1" stop-color="#d9b888" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#lcg)"/>
    <path d="${line}" fill="none" stroke="#d9b888" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#160a1a" stroke="#d9b888" stroke-width="2"/>`).join('')}`;
}
function v2DrawPieChart(){
  const svg = document.getElementById('v2PieChart');
  const legend = document.getElementById('v2PieLegend');
  if (!svg) return;
  const data = [{l:'مصر', v:45, c:'#8b5cf6'},{l:'لبنان', v:25, c:'#d9b888'},{l:'السعودية', v:15, c:'#c9879c'},{l:'أخرى', v:15, c:'#6e2640'}];
  let acc = 0;
  const circles = data.map(d => {
    const dash = d.v, gap = 100-d.v;
    const el = `<circle r="15.9" cx="21" cy="21" fill="transparent" stroke="${d.c}" stroke-width="6" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${25-acc}"/>`;
    acc += d.v;
    return el;
  }).join('');
  svg.innerHTML = circles;
  if (legend) legend.innerHTML = data.map(d => `<span><i style="background:${d.c};"></i>${d.l} — ${d.v}%</span>`).join('');
}
async function v2LoadRealMemberCount(){
  const el = document.getElementById('v2StatMembers');
  if (!el) return;
  const { count, error } = await sb.from('profiles').select('*', { count: 'exact', head: true });
  el.textContent = error ? '—' : (count ?? 0).toLocaleString('ar-EG');
}
async function v2LoadAdminStats(){
  const usersEl = document.getElementById('admStatUsers');
  const articlesEl = document.getElementById('admStatArticles');
  if (usersEl){
    const { count, error } = await sb.from('profiles').select('*', { count: 'exact', head: true });
    usersEl.textContent = error ? '—' : (count ?? 0).toLocaleString('ar-EG');
  }
  // Real articles table isn't wired up yet — until it is, this reflects the actual
  // in-app article list (V2_ARTICLES) rather than a made-up number.
  if (articlesEl) articlesEl.textContent = V2_ARTICLES.length.toLocaleString('ar-EG');
}
function v2InitAdmin(){
  v2RenderUsers();
  v2RenderArticlesAdmin();
  v2DrawLineChart();
  v2DrawPieChart();
  v2LoadAdminStats();
}
document.querySelectorAll('#v2UserTabs button').forEach(b => b.addEventListener('click', ()=>{ document.querySelectorAll('#v2UserTabs button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); v2RenderUsers(); }));
document.querySelectorAll('#v2ArtTabs button').forEach(b => b.addEventListener('click', ()=>{ document.querySelectorAll('#v2ArtTabs button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); v2RenderArticlesAdmin(); }));
document.querySelectorAll('#v2ArticlesTabs button').forEach(b => b.addEventListener('click', ()=>{ document.querySelectorAll('#v2ArticlesTabs button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); }));

