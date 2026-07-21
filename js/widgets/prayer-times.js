// ================================================================
// Prayer times: calculation, Athan audio, ambient panel FX, per-prayer animated icons.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Prayer Times ──
let prayers=[
  {nameEn:'Fajr',   nameAr:'الفجر',  time:'04:30',key:'fajr'},
  {nameEn:'Dhuhr',  nameAr:'الظهر',  time:'12:00',key:'dhuhr'},
  {nameEn:'Asr',    nameAr:'العصر',  time:'15:30',key:'asr'},
  {nameEn:'Maghrib',nameAr:'المغرب', time:'18:15',key:'maghrib'},
  {nameEn:'Isha',   nameAr:'العشاء', time:'19:45',key:'isha'},
];
let lastAthanKey=null,wasPlayingBeforeAthan=false,currentAthanName=null,athanCountdownInterval=null;
// Extra prayer info: sunrise/imsak (from Aladhan), Hijri date, and coords for Qibla calc
let prayerExtra={sunrise:null,imsak:null,hijri:null};
let lastPrayerLat=null,lastPrayerLon=null;

// ── أسماء ملفات الأذان — روابط CDN حقيقية (كانت تشير سابقًا لملفات محلية غير موجودة أصلًا) ──
const ATHAN_FILES = {
  Fajr: './fajr.mp3',
  Dhuhr: './athan.mp3',
  Asr: './athan.mp3',
  Maghrib: './athan.mp3',
  Isha: './athan.mp3'
};

const ATHAN_FALLBACK = './athan.mp3';

// Calculation method is picked automatically from the person's country —
// no manual choice needed. Falls back to the widely-used Muslim World League
// method for countries not explicitly mapped.
const COUNTRY_PRAYER_METHOD={
  eg:'5', // Egyptian General Authority of Survey
  sa:'4', // Umm Al-Qura, Makkah
  kw:'9', qa:'10', sg:'11', tr:'13', ir:'7',
  ae:'8', om:'8', bh:'8', // Gulf Region
  pk:'1', in:'1', bd:'1', af:'1', // Univ. of Islamic Sciences, Karachi
  us:'2', ca:'2' // ISNA
};
let currentPrayerCountry=null;
function methodForCountry(cc){
  if(!cc) return '3';
  return COUNTRY_PRAYER_METHOD[cc.toLowerCase()] || '3'; // default: Muslim World League
}
const PRAYER_METHOD_NAMES={
  '1':{ar:'جامعة العلوم الإسلامية، كراتشي', en:'Univ. of Islamic Sciences, Karachi'},
  '2':{ar:'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', en:'ISNA (North America)'},
  '3':{ar:'رابطة العالم الإسلامي', en:'Muslim World League'},
  '4':{ar:'أم القرى، مكة المكرمة', en:'Umm Al-Qura, Makkah'},
  '5':{ar:'الهيئة المصرية العامة للمساحة', en:'Egyptian General Authority of Survey'},
  '7':{ar:'معهد الجيوفيزياء، جامعة طهران', en:'Institute of Geophysics, Univ. of Tehran'},
  '8':{ar:'منطقة الخليج', en:'Gulf Region'},
  '9':{ar:'الكويت', en:'Kuwait'},
  '10':{ar:'قطر', en:'Qatar'},
  '11':{ar:'مجلس الشؤون الدينية، سنغافورة', en:'Majlis Ugama Islam Singapura'},
  '13':{ar:'الشؤون الدينية، تركيا (Diyanet)', en:'Diyanet İşleri Başkanlığı, Turkey'}
};
function updatePrayerMethodLabel(){
  const el=document.getElementById('prayerMethodLabel');
  if(!el) return;
  const method=methodForCountry(currentPrayerCountry);
  const name=PRAYER_METHOD_NAMES[method] || PRAYER_METHOD_NAMES['3'];
  const isAr=currentLang==='ar';
  el.textContent=(isAr?'📐 طريقة الحساب: ':'📐 Method: ')+(isAr?name.ar:name.en);
}
async function fetchPrayerTimes(lat,lon,countryCode){
  try{
    lastPrayerLat=lat; lastPrayerLon=lon;
    if(countryCode) currentPrayerCountry=countryCode;
    const method=methodForCountry(currentPrayerCountry);
    const res=await fetch('https://api.aladhan.com/v1/timings?latitude='+lat+'&longitude='+lon+'&method='+method);
    const data=await res.json(); const t=data.data.timings;
    const clean=v=>v.split(' ')[0];
    prayers=[
      {nameEn:'Fajr',   nameAr:'الفجر',  time:clean(t.Fajr),   key:'fajr'},
      {nameEn:'Dhuhr',  nameAr:'الظهر',  time:clean(t.Dhuhr),  key:'dhuhr'},
      {nameEn:'Asr',    nameAr:'العصر',  time:clean(t.Asr),    key:'asr'},
      {nameEn:'Maghrib',nameAr:'المغرب', time:clean(t.Maghrib),key:'maghrib'},
      {nameEn:'Isha',   nameAr:'العشاء', time:clean(t.Isha),   key:'isha'},
    ];
    prayerExtra.sunrise = t.Sunrise ? clean(t.Sunrise) : null;
    prayerExtra.imsak   = t.Imsak   ? clean(t.Imsak)   : null;
    const h = data.data.date && data.data.date.hijri;
    prayerExtra.hijri = h ? {day:h.day, monthAr:h.month.ar, monthEn:h.month.en, year:h.year} : null;
    renderPrayers();
    updatePrayerMethodLabel();
  }catch(e){}
}
// Great-circle bearing from (lat,lon) to the Kaaba, in degrees (0-360)
function qiblaDirection(lat,lon){
  const toRad=d=>d*Math.PI/180, toDeg=r=>r*180/Math.PI;
  const latK=toRad(21.4225), lonK=toRad(39.8262);
  const lat1=toRad(lat), lon1=toRad(lon);
  const dLon=lonK-lon1;
  const y=Math.sin(dLon);
  const x=Math.cos(lat1)*Math.tan(latK)-Math.sin(lat1)*Math.cos(dLon);
  return (toDeg(Math.atan2(y,x))+360)%360;
}
function formatCountdown(ms){
  if(ms<0) ms=0;
  const totalSec=Math.floor(ms/1000);
  const h=Math.floor(totalSec/3600);
  const m=Math.floor((totalSec%3600)/60);
  const s=totalSec%60;
  const pad=n=>String(n).padStart(2,'0');
  return (h>0? h+':'+pad(m) : pad(m))+':'+pad(s);
}
function to12h(t){
  const [hS,mS]=t.split(':'); let h=parseInt(hS);
  const ap=h>=12?'PM':'AM'; h=h%12===0?12:h%12;
  return '<bdi>'+h+':'+mS+' '+ap+'</bdi>';
}
// ── Prayer panel ambient FX: a mosque silhouette that's always there, plus a
// crescent + stars at night, warm glows at dawn/dusk/day — mirrors the weather panel's approach.
let lastPrayerPhase=null;
function getPrayerPhase(now){
  if(!prayers||!prayers.length) return 'day';
  const toMin=t=>{const[h,m]=t.split(':').map(Number);return h*60+m;};
  const nowMin=now.getHours()*60+now.getMinutes();
  const fajr=toMin(prayers[0].time);
  const sunrise=prayerExtra.sunrise?toMin(prayerExtra.sunrise):fajr+90;
  const maghrib=toMin(prayers[3].time);
  const isha=toMin(prayers[4].time);
  if(nowMin>=isha || nowMin<fajr) return 'night';
  if(nowMin>=fajr && nowMin<sunrise) return 'dawn';
  if(nowMin>=sunrise && nowMin<maghrib) return 'day';
  return 'dusk';
}
function islamicStarSVG(fill){
  return `<svg viewBox="0 0 40 40"><path d="M20 2 L24 14 L36 12 L26 20 L36 28 L24 26 L20 38 L16 26 L4 28 L14 20 L4 12 L16 14 Z" fill="${fill}"/></svg>`;
}
function ambientLanternSVG(uid){
  uid = uid || Math.random().toString(36).slice(2,8);
  return `<svg viewBox="0 0 40 70">
    <defs>
      <radialGradient id="flameGrad-${uid}" cx="50%" cy="75%" r="70%">
        <stop offset="0%" stop-color="#fff6d8"/>
        <stop offset="40%" stop-color="var(--sun-c)"/>
        <stop offset="100%" stop-color="#e8722c"/>
      </radialGradient>
    </defs>
    <circle cx="20" cy="2" r="2.2" fill="#8a6a3e"/>
    <line x1="20" y1="4" x2="20" y2="12" stroke="#8a6a3e" stroke-width="1.6"/>
    <path d="M13 12 h14 v4 h-14 z" fill="#8a6a3e"/>
    <path d="M11 16 C11 16 9 22 9 31 C9 42 14 49 20 49 C26 49 31 42 31 31 C31 22 29 16 29 16 Z" fill="var(--gold2)" opacity=".22" stroke="#8a6a3e" stroke-width="1.4"/>
    <line x1="20" y1="16" x2="20" y2="49" stroke="#8a6a3e" stroke-width="1" opacity=".5"/>
    <line x1="12.5" y1="24" x2="27.5" y2="24" stroke="#8a6a3e" stroke-width="1" opacity=".45"/>
    <line x1="9.5" y1="33" x2="30.5" y2="33" stroke="#8a6a3e" stroke-width="1" opacity=".45"/>
    <path d="M15 49 h10 v4 h-10 z" fill="#8a6a3e"/>
    <path d="M17 53 l3 9 l3 -9 z" fill="#8a6a3e"/>
    <path class="fx-lantern-flame" d="M20 23 C24.5 28.5 25.5 33 20 38.5 C14.5 33 15.5 28.5 20 23 Z" fill="url(#flameGrad-${uid})"/>
  </svg>`;
}
// ── Per-prayer accent colors (used for the "next" glow + hero halo) ──
const PR_ACCENT={
  fajr:   {c:'#e6a15c', rgb:'230,161,92'},
  dhuhr:  {c:'#ffcf4d', rgb:'255,207,77'},
  asr:    {c:'#8fc7e8', rgb:'143,199,232'},
  maghrib:{c:'#ef8b5a', rgb:'239,139,90'},
  isha:   {c:'#a68be0', rgb:'166,139,224'}
};
// ── Small, expressive animated icon for each prayer — a mini scene rather
// than a flat emoji: Fajr breaks over the horizon, Dhuhr spins a full bright
// sun, Asr's sun drifts behind a cloud, Maghrib sinks below the line, and
// Isha is a glowing crescent with twinkling stars. Colors/animations come
// from CSS (.pr-*) so every copy on the page (grid + hero) animates in sync.
function prayerIconSVG(key,uid){
  uid=uid||Math.random().toString(36).slice(2,8);
  const acc=(PR_ACCENT[key]||PR_ACCENT.dhuhr).c;
  if(key==='fajr'){
    return `<svg viewBox="0 0 64 64" class="pr-svg pr-fajr">
      <defs><linearGradient id="fajrSky-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a2a55"/><stop offset="100%" stop-color="${acc}"/>
      </linearGradient></defs>
      <rect x="5" y="10" width="54" height="32" rx="8" fill="url(#fajrSky-${uid})" opacity=".5"/>
      <g class="pr-fajr-glow">
        <circle cx="32" cy="40" r="12" fill="${acc}"/>
        <g class="pr-fajr-rays" stroke="${acc}" stroke-width="2.2" stroke-linecap="round">
          <line x1="32" y1="20" x2="32" y2="26"/>
          <line x1="13" y1="32" x2="19" y2="34"/>
          <line x1="51" y1="32" x2="45" y2="34"/>
          <line x1="18" y1="20" x2="22" y2="25"/>
          <line x1="46" y1="20" x2="42" y2="25"/>
        </g>
      </g>
      <line x1="6" y1="44" x2="58" y2="44" stroke="${acc}" stroke-width="2" opacity=".5"/>
      <circle class="pr-twinkle-sm" cx="12" cy="15" r="1.3" fill="#fff"/>
      <circle class="pr-twinkle-sm" style="animation-delay:.7s" cx="50" cy="13" r="1" fill="#fff"/>
    </svg>`;
  }
  if(key==='dhuhr'){
    return `<svg viewBox="0 0 64 64" class="pr-svg pr-dhuhr">
      <g class="pr-dhuhr-spin" stroke="${acc}" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="4" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="60"/>
        <line x1="4" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/>
        <line x1="12" y1="12" x2="18" y2="18"/><line x1="46" y1="46" x2="52" y2="52"/>
        <line x1="52" y1="12" x2="46" y2="18"/><line x1="18" y1="46" x2="12" y2="52"/>
      </g>
      <circle class="pr-dhuhr-core" cx="32" cy="32" r="13" fill="${acc}"/>
    </svg>`;
  }
  if(key==='asr'){
    return `<svg viewBox="0 0 64 64" class="pr-svg pr-asr">
      <circle class="pr-asr-sun" cx="40" cy="22" r="10" fill="${acc}"/>
      <g class="pr-asr-rays" stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity=".8">
        <line x1="40" y1="6" x2="40" y2="10"/><line x1="55" y1="12" x2="52" y2="15"/><line x1="59" y1="22" x2="54" y2="22"/>
      </g>
      <g class="pr-asr-cloud">
        <ellipse cx="26" cy="42" rx="15" ry="10" fill="var(--cloud-c,#8d84a6)"/>
        <circle cx="36" cy="30" r="12" fill="var(--cloud-c2,#b5add0)"/>
        <rect x="14" y="36" width="38" height="14" rx="7" fill="var(--cloud-c,#8d84a6)"/>
      </g>
    </svg>`;
  }
  if(key==='maghrib'){
    return `<svg viewBox="0 0 64 64" class="pr-svg pr-maghrib">
      <defs><clipPath id="maghribClip-${uid}"><rect x="4" y="4" width="56" height="34"/></clipPath></defs>
      <g clip-path="url(#maghribClip-${uid})">
        <circle class="pr-maghrib-sun" cx="32" cy="36" r="13" fill="${acc}"/>
      </g>
      <line x1="4" y1="38" x2="60" y2="38" stroke="${acc}" stroke-width="2" opacity=".6"/>
      <g class="pr-maghrib-rays" stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity=".5">
        <line x1="14" y1="46" x2="18" y2="46"/><line x1="46" y1="46" x2="50" y2="46"/>
      </g>
    </svg>`;
  }
  // isha
  return `<svg viewBox="0 0 64 64" class="pr-svg pr-isha">
    <path class="pr-isha-moon" d="M40 8 a20 20 0 1 0 0 48 a25 25 0 1 1 0 -48" fill="${acc}"/>
    <circle class="pr-twinkle-sm" cx="14" cy="16" r="1.4" fill="#fff"/>
    <circle class="pr-twinkle-sm" style="animation-delay:.5s" cx="10" cy="34" r="1.1" fill="#fff"/>
    <circle class="pr-twinkle-sm" style="animation-delay:1s" cx="20" cy="46" r="1" fill="#fff"/>
  </svg>`;
}
function mosqueSkylineSVG(){
  return '<svg viewBox="0 0 900 100" preserveAspectRatio="xMidYMax slice"><g fill="currentColor">'+
    '<path d="M0 100V78h900v22z"/>'+
    '<path d="M60 78V52h26v26zM814 78V52h26v26z"/>'+
    '<path d="M73 52c0-14 9-24 13-24s13 10 13 24z"/>'+
    '<path d="M827 52c0-14 9-24 13-24s13 10 13 24z"/>'+
    '<path d="M330 78V40c0-40 30-56 70-56s70 16 70 56v38z"/>'+
    '<circle cx="400" cy="8" r="4"/><rect x="397" y="0" width="6" height="10"/>'+
    '<path d="M180 78V60c0-10 8-18 18-18s18 8 18 18v18zM684 78V60c0-10 8-18 18-18s18 8 18 18v18z"/>'+
    '<rect x="150" y="20" width="10" height="58"/><rect x="740" y="20" width="10" height="58"/>'+
    '<path d="M155 20a10 12 0 0 1 0-24 10 12 0 0 1 0 24z"/><path d="M745 20a10 12 0 0 1 0-24 10 12 0 0 1 0 24z"/>'+
    '</g></svg>';
}
function renderPrayerFx(phase){
  const fx=document.getElementById('prayerFx');
  if(!fx) return;
  fx.innerHTML='';

  // A faint mosque skyline always sits along the bottom of the panel, tinted
  // to match the time of day. It stays low-opacity and clipped to the panel's
  // own bottom edge so it never sits behind (or obscures) the prayer times,
  // Hijri date, or countdown text above it.
  const mosque=document.createElement('div');
  mosque.className='fx-prayer-mosque';
  mosque.style.color = phase==='night' ? 'var(--purple2)' : (phase==='dawn' ? 'var(--gold2)' : phase==='dusk' ? 'var(--rose)' : 'var(--purple2)');
  mosque.innerHTML=mosqueSkylineSVG();
  fx.appendChild(mosque);

  if(phase==='night'){
    // Sits high in the panel's top corner — clear of both the title text and
    // the Hijri date chip lower down, instead of floating right behind it.
    const cres=document.createElement('div');
    cres.className='fx-prayer-crescent';
    cres.style.width='34px'; cres.style.height='34px';
    cres.style.top='3%'; cres.style.insetInlineEnd='3%';
    cres.innerHTML=ambientBeachMoonSVG();
    fx.appendChild(cres);
    for(let i=0;i<10;i++){
      const t=document.createElement('div');
      t.className='fx-twinkle';
      const s=1+Math.random()*1.6;
      t.style.width=s+'px'; t.style.height=s+'px';
      t.style.left=(Math.random()*96)+'%';
      t.style.top=(Math.random()*40)+'%';
      t.style.animationDuration=(1.8+Math.random()*2.2)+'s';
      t.style.animationDelay=(-Math.random()*3)+'s';
      fx.appendChild(t);
    }
  } else if(phase==='dawn' || phase==='dusk'){
    // (ambient corner glow removed — it was rendering directly behind the Hijri date chip)
  } else {
    // (ambient corner glow removed — it was rendering directly behind the Hijri date chip)
  }

  // A couple of gently twinkling geometric (Islamic-star) ornaments — kept to
  // a safe empty band well below the next-prayer text and Hijri chip, and
  // well above the prayer card grid, so they never land on top of any text.
  const starCount = phase==='night' ? 2 : 3;
  for(let i=0;i<starCount;i++){
    const st=document.createElement('div');
    st.className='fx-prayer-star';
    const s=13+Math.random()*9;
    st.style.width=s+'px'; st.style.height=s+'px';
    st.style.left=(8+Math.random()*84)+'%';
    st.style.top=(29+Math.random()*16)+'%';
    st.style.transform='rotate('+(Math.random()*40-20)+'deg)';
    st.style.animationDuration=(2.4+Math.random()*1.6)+'s';
    st.style.animationDelay=(-Math.random()*3)+'s';
    st.innerHTML=islamicStarSVG('var(--gold2)');
    fx.appendChild(st);
  }

  // A lantern (فانوس) swaying at the top-center of the panel — mirrors the
  // parasol/pine-tree touch in the weather panel. Glows warmer and brighter
  // after dark, softer through the day.
  const lantern=document.createElement('div');
  lantern.className='fx-lantern';
  lantern.style.width='46px'; lantern.style.height='78px';
  lantern.style.left='63%'; lantern.style.top='0%';
  lantern.style.setProperty('--lantern-glow', phase==='night' ? '.95' : (phase==='dawn'||phase==='dusk') ? '.8' : '.45');
  lantern.innerHTML=ambientLanternSVG();
  fx.appendChild(lantern);
}
let lastPrayerGridKey=null, lastPrayerMainKey=null, lastPrayerStatsKey=null;
function renderPrayers(){
  const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  let nextIdx=prayers.findIndex(p=>{const[h,m]=p.time.split(':').map(Number);return(h*60+m)>nowMin;});
  if(nextIdx===-1)nextIdx=0;

  // Only rebuild the grid's HTML when the highlighted "next" card or the
  // language actually changes — rebuilding it every second (as before) tore
  // down and recreated every icon/card element, which restarted their CSS
  // animations from frame zero each time instead of letting them run continuously.
  const gridKey=nextIdx+'|'+currentLang;
  if(gridKey!==lastPrayerGridKey){
    lastPrayerGridKey=gridKey;
    const nextBadge=currentLang==='ar'?'التالية':'Next';
    document.getElementById('prayerGrid').innerHTML=prayers.map((p,i)=>{
      const acc=PR_ACCENT[p.key]||PR_ACCENT.dhuhr;
      return `
      <div class="prayer-item ${i===nextIdx?'next':''}" data-next-label="${nextBadge}" style="--pr-c:${acc.c};--pr-rgb:${acc.rgb};">
        <div class="p-icon">${prayerIconSVG(p.key,'g'+i)}</div>
        <div class="p-name">${currentLang==='ar'?p.nameAr:p.nameEn}</div>
        <div class="p-time">${to12h(p.time)}</div>
      </div>`;
    }).join('');
  }
  const phase=getPrayerPhase(now);
  if(phase!==lastPrayerPhase){ lastPrayerPhase=phase; renderPrayerFx(phase); }
  renderPrayerMain(nextIdx,now);
  renderPrayerStats();
}
function renderPrayerMain(nextIdx,now){
  const el=document.getElementById('prayerMain');
  if(!el) return;
  const p=prayers[nextIdx];
  const [ph,pm]=p.time.split(':').map(Number);
  const target=new Date(now);
  target.setHours(ph,pm,0,0);
  if(target<=now) target.setDate(target.getDate()+1);
  const remaining=target-now;
  const isAr=currentLang==='ar';
  let hijriTxt='';
  if(prayerExtra.hijri){
    const hj=prayerExtra.hijri;
    hijriTxt=isAr? (toArabicIndicDigits(hj.day)+' '+hj.monthAr+' '+toArabicIndicDigits(hj.year)+' هـ') : (hj.day+' '+hj.monthEn+' '+hj.year+' AH');
  }
  // Rebuild the hero block (icon + labels + Hijri chip) only when the next
  // prayer, language, or Hijri date actually changes; every other tick just
  // updates the countdown text in place, so the icon's float/glow animation
  // (and everything else in this block) never gets reset mid-cycle.
  const mainKey=nextIdx+'|'+currentLang+'|'+hijriTxt;
  if(mainKey!==lastPrayerMainKey){
    lastPrayerMainKey=mainKey;
    const nextLabel=isAr?'الصلاة القادمة':'Next Prayer';
    const remLabel=isAr?'الوقت المتبقي':'Time remaining';
    const hijriHtml=hijriTxt?`<div class="prayer-hijri">📅 ${hijriTxt}</div>`:'';
    const acc=PR_ACCENT[p.key]||PR_ACCENT.dhuhr;
    el.innerHTML=`
      <div class="prayer-left">
        <div class="prayer-icon-big" style="--pr-c:${acc.c};--pr-rgb:${acc.rgb};">${prayerIconSVG(p.key,'hero')}</div>
        <div class="prayer-primary">
          <div class="prayer-next-label">${nextLabel}</div>
          <div class="prayer-next-name">${isAr?p.nameAr:p.nameEn} — ${to12h(p.time)}</div>
        </div>
      </div>
      <div class="prayer-right">
        ${hijriHtml}
        <div class="prayer-countdown"><span class="pc-label">${remLabel}</span><span class="pc-time" id="prayerCountdownTime">${formatCountdown(remaining)}</span></div>
      </div>`;
    const heroPrayerName=document.getElementById('heroNextPrayerName'), heroPrayerTime=document.getElementById('heroNextPrayerTime');
    if(heroPrayerName) heroPrayerName.textContent=isAr?p.nameAr:p.nameEn;
    if(heroPrayerTime) heroPrayerTime.textContent=to12h(p.time);
  } else {
    const pcTime=document.getElementById('prayerCountdownTime');
    if(pcTime) pcTime.textContent=formatCountdown(remaining);
  }
}
function renderPrayerStats(){
  const el=document.getElementById('prayerStats');
  if(!el) return;
  const isAr=currentLang==='ar';
  const sunrise=prayerExtra.sunrise?to12h(prayerExtra.sunrise):'—';
  const imsak=prayerExtra.imsak?to12h(prayerExtra.imsak):'—';
  let qiblaStr='—';
  if(lastPrayerLat!=null&&lastPrayerLon!=null){
    qiblaStr=Math.round(qiblaDirection(lastPrayerLat,lastPrayerLon))+'°';
  }
  // These values are effectively static for the whole day, so only touch the
  // DOM (and therefore only (re)start the icons' float animation) when one of
  // them actually changes, instead of re-rendering — and re-triggering the
  // animation — every single second.
  const statsKey=sunrise+'|'+imsak+'|'+qiblaStr+'|'+currentLang;
  if(statsKey===lastPrayerStatsKey) return;
  lastPrayerStatsKey=statsKey;
  el.innerHTML=
    `<div class="p-stat"><span class="p-stat-ic p-stat-ic-anim">🌅</span><span class="p-stat-val">${sunrise}</span><span class="p-stat-label">${isAr?'الشروق':'Sunrise'}</span></div>`+
    `<div class="p-stat"><span class="p-stat-ic p-stat-ic-anim" style="animation-delay:-1.5s">🌘</span><span class="p-stat-val">${imsak}</span><span class="p-stat-label">${isAr?'الإمساك':'Imsak'}</span></div>`+
    `<div class="p-stat"><span class="p-stat-ic p-stat-ic-anim" style="animation-delay:-3s">🧭</span><span class="p-stat-val">${qiblaStr}</span><span class="p-stat-label">${isAr?'اتجاه القبلة':'Qibla dir.'}</span></div>`;
}
renderPrayers();
setInterval(renderPrayers,1000);
function updateAthanBanner(prayer){
  currentAthanName=prayer;
  document.getElementById('athanBannerText').textContent=
    currentLang==='ar'?'حان وقت أذان '+prayer.nameAr:'Time for '+prayer.nameEn+' Prayer';
}
function checkAthan(){
  const now=new Date();
  const nowStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  const todayKey=now.toDateString();
  const match=prayers.find(p=>p.time===nowStr);
  if(match&&lastAthanKey!==todayKey+match.nameEn){
    lastAthanKey=todayKey+match.nameEn;
    triggerAthan(match);
  }
}
function triggerAthan(prayer){
  updateAthanBanner(prayer);
  wasPlayingBeforeAthan=isPlaying;
  if(isPlaying){
    audio.pause();

    document.querySelector('.player-bar').classList.remove('playing');

    isPlaying=false;
    btnPlay.innerHTML=ICON_PLAY;
    cancelAnimationFrame(rafId);
}
  document.getElementById('athanBanner').style.display='flex';

  const athanAudio=document.getElementById('athanAudio');
  athanAudio.onerror = () => { if(athanAudio.src !== ATHAN_FALLBACK){ athanAudio.src = ATHAN_FALLBACK; athanAudio.play().catch(()=>{}); } };
  athanAudio.src = ATHAN_FILES[prayer.nameEn] || ATHAN_FALLBACK;
  athanAudio.currentTime=0;
  athanAudio.play().catch(()=>{});

  const cd=document.getElementById('athanCountdown');
  if(cd) cd.textContent = '🕌 حان وقت أذان ' + prayer.nameAr;

  if(athanCountdownInterval) clearInterval(athanCountdownInterval);

  athanAudio.onended = () => {
    document.getElementById('athanBanner').style.display='none';
    currentAthanName=null;

    if(wasPlayingBeforeAthan&&hasStarted){
        audio.play().then(()=>{
            isPlaying=true;
            btnPlay.innerHTML=ICON_PAUSE;

            document.querySelector('.player-bar').classList.add('playing');

            cancelAnimationFrame(rafId);
            animateBars();
        });
    }
};
}
setInterval(checkAthan,15000);

updatePrayerMethodLabel();

