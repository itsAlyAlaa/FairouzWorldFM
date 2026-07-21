// ================================================================
// Core radio/audio engine: play/pause/volume/retry, audio-reactive aurora glow, AI-assisted now-playing song title detection.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Radio ──
// استخدام الرابط المباشر بدون امتدادات ليتوافق مع الـ HTTPS ويشتغل فوراً
const PRIMARY_STREAM='https://stream.zeno.fm/zv3e5wykprhvv';
const audio=new Audio(); 
audio.crossOrigin='anonymous'; // رجعناها هنا لأن الرابط المباشر يدعم الـ CORS بشكل صحيح
audio.preload='none';

const ICON_PLAY='<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M8 5.14v13.72c0 .68.74 1.1 1.33.76l11.14-6.86a.87.87 0 000-1.52L9.33 4.38A.87.87 0 008 5.14z"/></svg>';
const ICON_PAUSE='<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
const ICON_VOL_ON='<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/></svg>';
const ICON_VOL_OFF='<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none"/><line x1="16" y1="9" x2="22" y2="15"/><line x1="22" y1="9" x2="16" y2="15"/></svg>';

let isPlaying=false,isMuted=false,hasStarted=false,isStarting=false,retryCount=0; const MAX_RETRY=5;

// Lets future effects (Phase 4+ of the FairouzFX engine) react to the radio
// starting/pausing without this file knowing anything about them. No-op
// today: the engine files register zero listeners for these events yet.
function fxEmit(eventName){
  if(window.FairouzFX && FairouzFX.EventBus) FairouzFX.EventBus.emit(eventName);
}
const btnPlay=document.getElementById('btnPlay');
const btnMute=document.getElementById('btnMute');
const volSlider=document.getElementById('volSlider');
const volValue=document.getElementById('volValue');
const npTitle=document.getElementById('npTitle');
const npAi=document.getElementById('npAi');
const npAiText=document.getElementById('npAiText');
const loadingText=document.getElementById('loadingText');
const waveBars=document.querySelectorAll('.wave-bar');
let audioCtx,analyser,dataArray,sourceNode,rafId=null,usingRealData=false,silentFrames=0;
let barBinMap=null,barLevels=new Array(waveBars.length).fill(0);

// ── الخلفية (aurora) بتتنفس مع الباص ── طبقات بشدة مختلفة عشان الحركة تبقى
// عندها عمق بدل ما كل طبقة تتحرك بنفس القوة زي بعضها بالظبط
const auroraEls=[document.getElementById('auroraA'),document.getElementById('auroraB'),document.getElementById('auroraC')].filter(Boolean);
const auroraBassMul=[1,0.6,0.8];
let bassLevel=0,auroraLiveOn=false;
function setAuroraLive(on){
  if(on===auroraLiveOn)return;
  auroraLiveOn=on;
  auroraEls.forEach(el=>el.classList.toggle('audio-live',on));
}

// تحديد الـ Mount الخاص بإذاعتك بشكل ثابت لضمان جلب اسم الأغنية دائماً
const ZENO_MOUNT='zv3e5wykprhvv';
let metaSource=null, lastRawTitle='', metaRetryTimer=null;
const arTranslationCache=new Map();

function setupAnalyser(){
  if(analyser)return;
  try{
    audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    sourceNode=audioCtx.createMediaElementSource(audio);
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=128;
    analyser.smoothingTimeConstant=0.62; // أسرع استجابة من الافتراضي عشان تحس إنها "حية"
    sourceNode.connect(analyser); analyser.connect(audioCtx.destination);
    dataArray=new Uint8Array(analyser.frequencyBinCount);
    // وزّع كل عمود على جزء مختلف من الطيف (باص → تريبل) بدل ما كل الأعمدة
    // تكرر نفس الترددات المنخفضة وتتحرك مع بعض بشكل رتيب
    const bins=analyser.frequencyBinCount, n=waveBars.length;
    barBinMap=Array.from({length:n},(_, i)=>{
      const curve=Math.pow(i/(n-1||1), 1.6); // انحناء لوغاريتمي: تفاصيل أكتر في المنخفضات
      return Math.min(bins-1, Math.round(curve*(bins-1)));
    });
  }catch(e){analyser=null;}
}

function animateBars(){
  if(!isPlaying){setAuroraLive(false);return;}
  setAuroraLive(true);
  if(analyser){
    analyser.getByteFrequencyData(dataArray);
    let usedSum=0;
    for(let i=0;i<barBinMap.length;i++) usedSum+=dataArray[barBinMap[i]];
    if(usedSum>40){usingRealData=true;silentFrames=0;}
    else{silentFrames++;if(silentFrames>60)usingRealData=false;}
  }
  const t=Date.now()/220;
  waveBars.forEach((b,i)=>{
    const target=analyser&&usingRealData
      ? dataArray[barBinMap[i]]/255
      : (Math.abs(Math.sin(t+i*0.5))*0.8+0.05);
    // تنعيم الحركة (lerp) عشان تبقى سلسة بدل ما تقفز فجأة بين الفريمات
    barLevels[i]+=(target-barLevels[i])*0.4;
    const amt=Math.max(0,Math.min(1,barLevels[i]));
    b.style.height=(8+amt*44)+'px';
    b.style.setProperty('--amt',amt.toFixed(3));
  });
  // طاقة الباص (أول شوية ترددات منخفضة) بتتحرك أبطأ وأنعم من الأعمدة
  // عشان الخلفية تحس إنها "بتتنفس" مش بترعش مع كل ضربة
  let bassTarget;
  if(analyser&&usingRealData){
    let bSum=0; const bn=Math.min(6,dataArray.length);
    for(let i=0;i<bn;i++) bSum+=dataArray[i];
    bassTarget=Math.min(1,(bSum/(bn*255))*1.7);
  } else {
    bassTarget=Math.abs(Math.sin(t*0.4))*0.62;
  }
  bassLevel+=(bassTarget-bassLevel)*0.2;
  auroraEls.forEach((el,i)=>el.style.setProperty('--bass',(bassLevel*auroraBassMul[i]).toFixed(3)));
  rafId=requestAnimationFrame(animateBars);
}


// ── AI: detect current song name + show it in Arabic ──
function isArabicText(str){ return /[\u0600-\u06FF]/.test(str); }
function hideAiTitle(){ if(npAi){npAi.style.display='none'; npAiText.textContent='';} }

// ── AI: التعرف على اسم الأغنية داخل الملفات المجمّعة (زي "فيروزيات المساء") ──
// النظام ده مجاني 100% ومن غير أي API خارجي: بيعتمد على إنك تحدد اسم كل أغنية
// جوه الملف المجمّع وثانية بدايتها، وبعدين الكود بيعد بالوقت من لحظة بداية
// تشغيل الملف ويبدّل الاسم المعروض تلقائي لما يوصل لثانية بداية الأغنية اللي بعدها.

// عدّل الاسم ده لو اسم الملف المجمّع عندك مختلف
const COMPILATION_MARKERS = ['فيروزيات المساء'];

// اسم لطيف يتعرض للمشاهدين بدل اسم الملف الخام، سواء لسه محددتش الأغاني
// وتوقيتاتها ولا في لحظة نادرة الوقت وصل بعد آخر أغنية معرّفة في القايمة —
// المهم إن اسم الملف الداخلي ("فيروزيات المساء") محدش يشوفه أبداً في الواجهة.
const COMPILATION_DISPLAY_NAMES = {
  'فيروزيات المساء': { ar:'منوعات فيروز 🎶', en:'Fairouz Mix 🎶' }
};
function compilationFallbackTitle(key){
  const disp=COMPILATION_DISPLAY_NAMES[key];
  if(disp) return currentLang==='ar'?disp.ar:disp.en;
  return currentLang==='ar'?'منوعات فيروز 🎶':'Fairouz Mix 🎶';
}

// ── هنا بس اللي محتاج تعدّله ──
// كل عنصر: اسم الأغنية، وثانية بدايتها بالظبط جوه الملف (من أول الملف = صفر)
// رتّبهم من الأول للآخر حسب ترتيبهم الفعلي في الملف
const COMPILATION_CHAPTERS = {
  'فيروزيات المساء': [
    // { title:'اسم الأغنية الأولى', start:0 },
    // { title:'اسم الأغنية الثانية', start:245 }, // يعني تبدأ عند الدقيقة 4:05
    // { title:'اسم الأغنية الثالثة', start:512 },
    // ضيف باقي الأغاني بنفس الشكل...
  ]
};

let compilationStartTs=0, compilationTimer=null, activeCompilationKey='';

function isCompilationFile(title){
  return COMPILATION_MARKERS.some(m=>title.includes(m));
}

function getCompilationKey(title){
  return COMPILATION_MARKERS.find(m=>title.includes(m))||'';
}

function currentChapterFor(key, elapsedSec){
  const chapters=COMPILATION_CHAPTERS[key]||[];
  if(!chapters.length) return null;
  let current=chapters[0];
  for(const ch of chapters){
    if(elapsedSec>=ch.start) current=ch; else break;
  }
  return current;
}

function tickCompilation(){
  const elapsed=(Date.now()-compilationStartTs)/1000;
  const chapters=COMPILATION_CHAPTERS[activeCompilationKey]||[];
  if(!chapters.length){
    // لسه محددتش الأغاني وتوقيتاتها في COMPILATION_CHAPTERS — بما إنك مش هتعرف
    // توقيتات كل أغنية جوه ملف زينو المجمّع، منعرضش أي بادچ "لسه ناقص" للمشاهدين
    // (ده كان نوت داخلي ليك انت بس، مكانوش المفروض يوصل للواجهة). بنكتفي باسم لطيف عام.
    npTitle.textContent = compilationFallbackTitle(activeCompilationKey);
    hideAiTitle();
    return;
  }
  const chapter=currentChapterFor(activeCompilationKey, elapsed);
  hideAiTitle();
  npTitle.textContent = chapter? chapter.title : compilationFallbackTitle(activeCompilationKey);
}

function startCompilationClock(rawTitle){
  const key=getCompilationKey(rawTitle);
  stopCompilationClock();
  activeCompilationKey=key;
  compilationStartTs=Date.now();
  tickCompilation();
  compilationTimer=setInterval(tickCompilation, 1000);
}
function stopCompilationClock(){
  if(compilationTimer){ clearInterval(compilationTimer); compilationTimer=null; }
  activeCompilationKey='';
}

// ── أداة مساعدة مجانية لاستخراج التوقيتات وانت بتسمع الملف على الموقع مباشرة ──
// افتح الموقع، شغّل الراديو، ولما تسمع أول ثانية في أغنية جديدة دوس Shift + T
// هيطلعلك في الـ Console (F12) الثانية بالظبط + شكل السطر جاهز تنسخه في COMPILATION_CHAPTERS
window.addEventListener('keydown', (e)=>{
  if(!e.shiftKey || e.key!=='T' && e.key!=='t') return;
  if(!activeCompilationKey || !compilationStartTs) return;
  const sec=Math.round((Date.now()-compilationStartTs)/1000);
  const mm=String(Math.floor(sec/60)).padStart(2,'0');
  const ss=String(sec%60).padStart(2,'0');
  console.log('⏱️ '+mm+':'+ss+'  →  { title:\'اسم الأغنية هنا\', start:'+sec+' },');
});

async function translateToArabic(text){
  if(!text) return '';
  if(arTranslationCache.has(text)) return arTranslationCache.get(text);
  try{
    const res=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair=en|ar');
    const data=await res.json();
    const translated=(data&&data.responseData&&data.responseData.translatedText)?data.responseData.translatedText:'';
    arTranslationCache.set(text,translated);
    return translated;
  }catch(e){ return ''; }
}

// ── تصحيحات يدوية لأسماء أغاني مسجّلة غلط على السيرفر ──
// لو السيرفر بيبعت اسم غلط لأغنية معينة ومفيش وصول للسيرفر لتصليحه من الأصل،
// ضيف هنا نمط (regex) يطابق العنوان الغلط + الاسم الصح بالإنجليزي والعربي.
const TRACK_TITLE_FIXES = [
  { match: /shat+\s*[-_]?\s*(el\s*)?[ie]skandar/i, en: 'Fairouz - Asamina', ar: 'فيروز - أسامينا' }
];
function findTitleFix(rawTitle){
  for(const fix of TRACK_TITLE_FIXES){ if(fix.match.test(rawTitle)) return fix; }
  return null;
}

async function handleStreamTitle(rawTitle){
  if(!rawTitle) return;
  rawTitle=rawTitle.trim();
  if(!rawTitle || rawTitle===lastRawTitle) return;
  lastRawTitle=rawTitle;

  // لو العنوان ده معروف إنه متسجل غلط على السيرفر، بنستخدم الاسم الصح
  // مباشرة ونتجاوز خطوة الترجمة بالذكاء الاصطناعي تمامًا.
  const fix=findTitleFix(rawTitle);
  if(fix){
    stopCompilationClock();
    npTitle.textContent = fix.en;
    if(npAi){ npAi.style.display='flex'; npAiText.textContent = fix.ar; }
    return;
  }

  // تنظيف اسم الأغنية من أي دمج وتنسيقه بشكل مريح للعين
  let cleanTitle = rawTitle.replace(/[-_]/g, ' - ').replace(/\s+/g, ' ');
  npTitle.textContent = cleanTitle;

  // لو الملف الجاي من السيرفر هو ملف مجمّع (فيه كذا أغنية)، نستخدم ساعة التوقيتات المجانية
  if(isCompilationFile(cleanTitle)){
    startCompilationClock(rawTitle);
    return;
  }
  stopCompilationClock();

  if(isArabicText(cleanTitle)){ hideAiTitle(); return; }
  if(npAi){
    npAi.style.display='flex';
    npAiText.textContent=currentLang==='ar'?'جارِ الترجمة بالذكاء الاصطناعي...':'AI translating...';
  }
  
  // إرسال النص المنظف للترجمة لضمان أدق نتيجة
  const arabic=await translateToArabic(cleanTitle);
  if(rawTitle!==lastRawTitle) return; 
  if(arabic){ npAiText.textContent=arabic; }
  else{ hideAiTitle(); }
}

function connectMetadata(){
  if(!ZENO_MOUNT||typeof EventSource==='undefined'||metaSource) return;
  try{
    metaSource=new EventSource('https://api.zeno.fm/mounts/metadata/subscribe/'+ZENO_MOUNT);
    metaSource.onmessage=(e)=>{
      try{
        const data=JSON.parse(e.data);
        handleStreamTitle(data.streamTitle||data.title||'');
      }catch(err){}
    };
    metaSource.onerror=()=>{
      if(metaSource){metaSource.close();metaSource=null;}
      if(isPlaying&&!metaRetryTimer){
        metaRetryTimer=setTimeout(()=>{metaRetryTimer=null;connectMetadata();},8000);
      }
    };
  }catch(e){ metaSource=null; }
}

function disconnectMetadata(){
  if(metaSource){metaSource.close();metaSource=null;}
  if(metaRetryTimer){clearTimeout(metaRetryTimer);metaRetryTimer=null;}
  lastRawTitle='';
  hideAiTitle();
  stopCompilationClock();
}

function startRadio(){
  if(isStarting||isPlaying) return;
  isStarting=true;
  loadingText.textContent=currentLang==='ar'?'جاري الاتصال بالبث...':'Connecting...';
  audio.src=PRIMARY_STREAM; audio.volume=volSlider.value/100; audio.load();
  audio.play().then(()=>{
    isStarting=false;
    hasStarted=true;
    isPlaying=true;
    retryCount=0;
    fxEmit('radio:play');
    btnPlay.innerHTML=ICON_PAUSE;
    document.querySelector('.player-bar').classList.add('playing');
    loadingText.textContent='';setupAnalyser();cancelAnimationFrame(rafId);animateBars();
    connectMetadata();
  }).catch((err)=>{
    isStarting=false;
    if(err && err.name==='NotAllowedError'){
      // المتصفح مانع التشغيل التلقائي لحد ما المستخدم يعمل أي تفاعل (دوس/سكرول) — مش عطل في البث
      loadingText.textContent=currentLang==='ar'?'دوس في أي حتة عشان تشغل الراديو 🎵':'Tap anywhere to start the radio 🎵';
      return;
    }
    attemptRetry();
  });
}

function attemptRetry(){
  if(retryCount>=MAX_RETRY){loadingText.textContent=currentLang==='ar'?'البث مش متاح دلوقتي 🙏':'Stream unavailable. Try again shortly 🙏';return;}
  retryCount++;
  loadingText.textContent=currentLang==='ar'?'بنحاول... ('+retryCount+')':'Reconnecting... ('+retryCount+')';
  setTimeout(()=>{
    audio.src=PRIMARY_STREAM+'?t='+Date.now(); audio.load();
    audio.play().then(()=>{
      isPlaying=true;
      fxEmit('radio:play');
      btnPlay.innerHTML=ICON_PAUSE;
      document.querySelector('.player-bar').classList.add('playing');
      loadingText.textContent='';
      setupAnalyser();cancelAnimationFrame(rafId);animateBars();
      connectMetadata();
    }).catch(attemptRetry);
  },1500*retryCount);
}

audio.addEventListener('error',()=>{if(isPlaying)attemptRetry();});
audio.addEventListener('stalled',()=>{if(isPlaying)attemptRetry();});

function togglePlay(){
  if(!hasStarted){
    startRadio();
    return;
  }

  if(isPlaying){
    audio.pause();
    isPlaying=false;
    fxEmit('radio:pause');
    btnPlay.innerHTML=ICON_PLAY;
    document.querySelector('.player-bar').classList.remove('playing');
    cancelAnimationFrame(rafId);
    disconnectMetadata();
  }else{
    audio.play().then(()=>{
      isPlaying=true;
      fxEmit('radio:play');
      btnPlay.innerHTML=ICON_PAUSE;
      document.querySelector('.player-bar').classList.add('playing');
      cancelAnimationFrame(rafId);
      animateBars();
      connectMetadata();
    });
  }
}

btnPlay.addEventListener('click',togglePlay);
btnMute.addEventListener('click',()=>{isMuted=!isMuted;audio.muted=isMuted;btnMute.innerHTML=isMuted?ICON_VOL_OFF:ICON_VOL_ON;});
volSlider.addEventListener('input',function(){audio.volume=this.value/100;this.style.setProperty('--val',this.value+'%');volValue.textContent=this.value+'%';});
volSlider.style.setProperty('--val','100%');

// Autoplay on load (works automatically on returning visitors / some browsers)
window.addEventListener('load',()=>{(window.whenIdle||setTimeout)(()=>{if(!hasStarted)startRadio();},1000);});
// Fallback: browsers block audio-with-sound autoplay until a real user gesture happens.
// We listen for the *first* tap/click/key/scroll anywhere on the page (desktop + mobile)
// and use it to start playback — this is the closest to "automatic" browsers allow.
function tryStartFromGesture(){ if(!hasStarted && !isStarting) startRadio(); }
['click','touchstart','keydown','scroll'].forEach(evt=>{
  document.addEventListener(evt, tryStartFromGesture, {passive:true});
});

