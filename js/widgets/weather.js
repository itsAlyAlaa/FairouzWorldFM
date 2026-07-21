// ================================================================
// Weather panel: forecast + condition, season-by-city detection, mood text, ambient FX (rain/snow/fog/etc.), hourly strip, air quality, manual city search.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Weather ──
const WCODE={
  rain:[51,53,55,56,57,61,63,65,66,67,80,81,82],
  snow:[71,73,75,77,85,86],
  fog:[45,48],
  storm:[95,96,99]
};
// ── Season decoration follows the selected city's actual weather/hemisphere,
// not a fixed Egypt calendar — so picking a rainy or wintery city doesn't get
// a mismatched summer-beach page background. ──
function baseCalendarSeason(date){
  const md=(date.getMonth()+1)*100+date.getDate();
  if(md>=1221||md<=320) return 'winter';
  if(md>=321&&md<=620) return 'spring';
  if(md>=621&&md<=922) return 'summer';
  return 'autumn';
}
function computeCityDecorSeason(lat, code, temp){
  let season=baseCalendarSeason(new Date());
  if(typeof lat==='number' && lat<0){
    // Southern hemisphere: seasons are flipped relative to Egypt's calendar.
    const flip={summer:'winter',winter:'summer',spring:'autumn',autumn:'spring'};
    season=flip[season]||season;
  }
  const isSnowy = code!=null && WCODE.snow.includes(code);
  const isWet = code!=null && (WCODE.rain.includes(code)||WCODE.storm.includes(code)||WCODE.fog.includes(code));
  if(isSnowy) season='winter';
  else if(isWet && season==='summer') season='autumn'; // no sunny beach vibe while it's raining
  if(typeof temp==='number'){
    if(temp<=5) season='winter';
    else if(temp>=30 && !isWet && !isSnowy) season='summer';
  }
  return season;
}
function applyCityDecorSeason(lat, code, temp){
  window.__citySeason=computeCityDecorSeason(lat, code, temp);
  if(window.applyOccasionTheme) window.applyOccasionTheme();
}
function weatherIconSVG(code,isDay){
  const sun=`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="13" fill="var(--sun-c)"/><g stroke="var(--sun-c)" stroke-width="3" stroke-linecap="round"><line x1="32" y1="4" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="60"/><line x1="4" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/><line x1="12" y1="12" x2="18" y2="18"/><line x1="46" y1="46" x2="52" y2="52"/><line x1="52" y1="12" x2="46" y2="18"/><line x1="18" y1="46" x2="12" y2="52"/></g></svg>`;
  const moon=`<svg viewBox="0 0 64 64"><path d="M40 8 a20 20 0 1 0 0 48 a25 25 0 1 1 0 -48" fill="var(--moon-c)"/></svg>`;
  const cloud=`<svg viewBox="0 0 64 64"><ellipse cx="24" cy="42" rx="14" ry="10" fill="var(--cloud-c)"/><circle cx="34" cy="30" r="13" fill="var(--cloud-c2)"/><circle cx="22" cy="30" r="9" fill="var(--cloud-c2)"/><rect x="12" y="36" width="38" height="14" rx="7" fill="var(--cloud-c)"/></svg>`;
  const partcloud=`<svg viewBox="0 0 64 64"><circle cx="40" cy="18" r="9" fill="var(--sun-c)"/><g stroke="var(--sun-c)" stroke-width="2.5" stroke-linecap="round"><line x1="40" y1="2" x2="40" y2="7"/><line x1="53" y1="7" x2="49" y2="11"/><line x1="57" y1="18" x2="52" y2="18"/></g><ellipse cx="24" cy="42" rx="15" ry="10" fill="var(--cloud-c)"/><circle cx="34" cy="30" r="12" fill="var(--cloud-c2)"/><rect x="12" y="36" width="38" height="14" rx="7" fill="var(--cloud-c)"/></svg>`;
  const partcloudNight=`<svg viewBox="0 0 64 64"><path d="M46 6 a9 9 0 1 0 0 20 a11 11 0 1 1 0 -20" fill="var(--moon-c)"/><ellipse cx="24" cy="42" rx="15" ry="10" fill="var(--cloud-c)"/><circle cx="34" cy="30" r="12" fill="var(--cloud-c2)"/><rect x="12" y="36" width="38" height="14" rx="7" fill="var(--cloud-c)"/></svg>`;
  const rain=`<svg viewBox="0 0 64 64"><ellipse cx="24" cy="26" rx="15" ry="10" fill="var(--cloud-c)"/><circle cx="34" cy="18" r="11" fill="var(--cloud-c2)"/><rect x="12" y="22" width="38" height="14" rx="7" fill="var(--cloud-c)"/><g stroke="var(--rain-c)" stroke-width="3" stroke-linecap="round"><line class="icon-drop" x1="20" y1="42" x2="17" y2="52"/><line class="icon-drop" style="animation-delay:.25s" x1="32" y1="42" x2="29" y2="52"/><line class="icon-drop" style="animation-delay:.5s" x1="44" y1="42" x2="41" y2="52"/></g></svg>`;
  const snow=`<svg viewBox="0 0 64 64"><ellipse cx="24" cy="26" rx="15" ry="10" fill="var(--cloud-c)"/><circle cx="34" cy="18" r="11" fill="var(--cloud-c2)"/><rect x="12" y="22" width="38" height="14" rx="7" fill="var(--cloud-c)"/><g fill="var(--snow-c)"><circle class="icon-flake" cx="20" cy="46" r="2.3"/><circle class="icon-flake" style="animation-delay:.3s" cx="32" cy="52" r="2.3"/><circle class="icon-flake" style="animation-delay:.6s" cx="44" cy="46" r="2.3"/></g></svg>`;
  const fog=`<svg viewBox="0 0 64 64"><ellipse cx="30" cy="16" rx="12" ry="7" fill="var(--cloud-c2)" opacity=".6"/><g stroke="var(--fog-c)" stroke-width="4" stroke-linecap="round"><line x1="10" y1="26" x2="54" y2="26"/><line x1="6" y1="36" x2="58" y2="36"/><line x1="10" y1="46" x2="54" y2="46"/></g></svg>`;
  const storm=`<svg viewBox="0 0 64 64"><ellipse cx="24" cy="24" rx="15" ry="10" fill="var(--cloud-c)"/><circle cx="34" cy="16" r="11" fill="var(--cloud-c2)"/><rect x="12" y="20" width="38" height="14" rx="7" fill="var(--cloud-c)"/><polygon class="icon-bolt" points="34,36 26,50 32,50 28,60 42,44 35,44" fill="var(--storm-c)"/></svg>`;
  if(code===0) return isDay?sun:moon;
  if([1,2].includes(code)) return isDay?partcloud:partcloudNight;
  if(WCODE.fog.includes(code)) return fog;
  if(WCODE.rain.includes(code)) return rain;
  if(WCODE.snow.includes(code)) return snow;
  if(WCODE.storm.includes(code)) return storm;
  return cloud;
}
function weatherDesc(code,lang){
  const d={clear:{en:'Clear',ar:'صافي'},partcloud:{en:'Partly Cloudy',ar:'غائم جزئيًا'},fog:{en:'Foggy',ar:'ضبابي'},drizzle:{en:'Drizzle',ar:'رذاذ'},rain:{en:'Rain',ar:'أمطار'},snow:{en:'Snow',ar:'تلج'},storm:{en:'Thunderstorm',ar:'عاصفة'},cloud:{en:'Cloudy',ar:'غائم'}};
  let k='cloud';
  if(code===0)k='clear'; else if([1,2].includes(code))k='partcloud';
  else if(WCODE.fog.includes(code))k='fog'; else if([51,53,55].includes(code))k='drizzle';
  else if(WCODE.rain.includes(code))k='rain'; else if(WCODE.snow.includes(code))k='snow';
  else if(WCODE.storm.includes(code))k='storm';
  return d[k][lang]||d[k].en;
}
// ── Mood advice: a short human line about the current weather, based on condition + temp ──
function weatherAdvice(temp, code, lang){
  let msg;
  if(WCODE.storm.includes(code)) msg={en:"Thunder's rolling — best enjoy it from indoors ⛈️",ar:"في رعد وبرق برة.. يفضل تستمتع بالمنظر من جوا البيت ⛈️"};
  else if(WCODE.snow.includes(code)) msg={en:"It's snowing — bundle up before you step out ❄️",ar:"الدنيا برد جامد.. البس جاكيت تقيل قبل ما تخرج ❄️"};
  else if(WCODE.rain.includes(code)) msg={en:"Don't forget your umbrella today ☔",ar:"ما تنساش الشمسية معاك النهارده ☔"};
  else if(WCODE.fog.includes(code)) msg={en:"Foggy out there — take it slow on the road 🌫️",ar:"الرؤية مش واضحة عالطريق.. سوق على مهلك 🌫️"};
  else if(temp<=8) msg={en:"Freezing out there — a heavy coat is a must 🧥",ar:"البرد قارص برة.. لازم جاكيت تقيل 🧥"};
  else if(temp<=15) msg={en:"A bit chilly — grab a jacket before heading out 🧥",ar:"الجو بارد شوية.. خد جاكيت معاك 🧥"};
  else if(temp<=26) msg={en:"Pleasant weather out there — enjoy your day 🌿",ar:"الجو حلو ومعتدل النهارده.. استمتع بيومك 🌿"};
  else if(temp<=32) msg={en:"Warm out — light clothes will do just fine 👕",ar:"الجو حر شوية.. البس هدوم خفيفة 👕"};
  else msg={en:"Scorching hot — wear light clothes and drink plenty of water 💧",ar:"الجو حر جداً.. البس خفيف واشرب مياه كتير 💧"};
  return msg[lang]||msg.en;
}
// ── A soft, puffy ambient cloud shape used for the drifting background layer ──
function ambientCloudSVG(){
  return `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="42" rx="26" ry="16" fill="var(--cloud-c)"/>
    <circle cx="58" cy="26" r="20" fill="var(--cloud-c2)"/>
    <circle cx="34" cy="24" r="15" fill="var(--cloud-c2)"/>
    <rect x="18" y="34" width="70" height="22" rx="11" fill="var(--cloud-c)"/>
  </svg>`;
}
// ── Summer beach ambience: sun/moon, sea waves, seagulls, parasol ──
function isSummerNow(){
  const d=new Date(); const md=(d.getMonth()+1)*100+d.getDate();
  return md>=621 && md<=922;
}
function ambientBeachMoonSVG(){
  return `<svg viewBox="0 0 64 64"><path d="M40 8 a20 20 0 1 0 0 48 a25 25 0 1 1 0 -48" fill="var(--moon-c)"/></svg>`;
}
function ambientWaveSVG(fill,opacity){
  return `<svg viewBox="0 0 240 40" preserveAspectRatio="none"><path d="M0 22 Q20 8 40 22 T80 22 T120 22 T160 22 T200 22 T240 22 V40 H0 Z" fill="${fill}" opacity="${opacity}"/></svg>`;
}
function ambientParasolSVG(){
  return `<svg viewBox="0 0 60 60">
    <ellipse cx="30" cy="55" rx="14" ry="3" fill="#000" opacity=".18"/>
    <line x1="30" y1="24" x2="30" y2="54" stroke="#8a5a34" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="27" y="50" width="6" height="5" rx="1.5" fill="#6e4527"/>
    <path d="M30 6 C15 6 5 19 4 27 C4 28.5 5.5 28.5 7 27.5 C9 26 11 27.5 13 28.4 C15 29.3 17 27.7 19 26.8 C21 25.9 23 27.7 25 28.6 C27 29.4 28.5 28 30 28 C31.5 28 33 29.4 35 28.6 C37 27.7 39 25.9 41 26.8 C43 27.7 45 29.3 47 28.4 C49 27.5 51 26 53 27.5 C54.5 28.5 56 28.5 56 27 C55 19 45 6 30 6 Z" fill="var(--rose)"/>
    <path d="M30 6 C22 6 14.5 13.5 10 22.5 C13.5 22 17 24 19 26.8 C21.5 24 25.5 22 30 22 Z" fill="var(--gold2)" opacity=".9"/>
    <path d="M30 6 C38 6 45.5 13.5 50 22.5 C46.5 22 43 24 41 26.8 C38.5 24 34.5 22 30 22 Z" fill="var(--gold2)" opacity=".6"/>
    <path d="M30 6 L30 22" stroke="#7a3d2a" stroke-width="1" opacity=".35"/>
    <path d="M4 27 C4 28.5 5.5 28.5 7 27.5 C9 26 11 27.5 13 28.4 C15 29.3 17 27.7 19 26.8 C21 25.9 23 27.7 25 28.6 C27 29.4 28.5 28 30 28 C31.5 28 33 29.4 35 28.6 C37 27.7 39 25.9 41 26.8 C43 27.7 45 29.3 47 28.4 C49 27.5 51 26 53 27.5 C54.5 28.5 56 28.5 56 27" fill="none" stroke="#7a3d2a" stroke-width="1" opacity=".4"/>
  </svg>`;
}
function renderBeachFx(fx, dayTime){
  // Note: the big sun/moon icon used to live here, floating in the panel's
  // top-right corner — right where the location chip sits. It's now the small
  // randomized season badge inline in the panel title instead, so this scene
  // only adds ambience that has an empty spot to live in: stars, gulls, sea, parasol.
  if(!dayTime){
    for(let i=0;i<8;i++){
      const t=document.createElement('div');
      t.className='fx-twinkle';
      const s=1+Math.random()*1.6;
      t.style.width=s+'px'; t.style.height=s+'px';
      t.style.left=(Math.random()*96)+'%';
      t.style.top=(Math.random()*30)+'%';
      t.style.animationDuration=(1.8+Math.random()*2.2)+'s';
      t.style.animationDelay=(-Math.random()*3)+'s';
      fx.appendChild(t);
    }
  }
  // Day/night are otherwise visually distinct via the sun-ray/mote effect
  // added separately in renderWeatherFx (triggered by actual sunny/hot
  // conditions, not just the calendar), so nothing extra needed here for day.
  // Layered sea horizon at the bottom of the panel
  const seaLayers=[
    {cls:'sea-l1', bottom:'-4%', h:34, fill:'var(--sea-c)', op:.30},
    {cls:'sea-l2', bottom:'-8%', h:40, fill:'var(--sea-c2)', op:.22},
    {cls:'sea-l3', bottom:'-12%', h:46, fill:'var(--sea-c)', op:.16}
  ];
  seaLayers.forEach(l=>{
    const s=document.createElement('div');
    s.className='fx-sea '+l.cls;
    s.style.bottom=l.bottom; s.style.height=l.h+'px';
    s.innerHTML=ambientWaveSVG(l.fill,l.op);
    fx.appendChild(s);
  });
  // A couple of sparkles on the water, catching the light
  for(let i=0;i<3;i++){
    const sp=document.createElement('div');
    sp.className='fx-sparkle-sea';
    sp.style.width='3px'; sp.style.height='3px';
    sp.style.left=(15+Math.random()*70)+'%';
    sp.style.bottom=(2+Math.random()*10)+'%';
    sp.style.animationDuration=(1.6+Math.random()*1.4)+'s';
    sp.style.animationDelay=(-Math.random()*2)+'s';
    fx.appendChild(sp);
  }
  // A small parasol tucked in the corner for that "مصيف" feel
  const par=document.createElement('div');
  par.className='fx-parasol';
  par.style.width='38px'; par.style.height='38px';
  par.style.left='6%';
  par.innerHTML=ambientParasolSVG();
  fx.appendChild(par);
}
// ── Winter ambience: snow-covered hills, a light flurry, icy sparkle, snowy pine ──
function isWinterNow(){
  const d=new Date(); const md=(d.getMonth()+1)*100+d.getDate();
  return md>=1221 || md<=320;
}
function ambientSnowHillSVG(fill,opacity){
  return `<svg viewBox="0 0 240 40" preserveAspectRatio="none"><path d="M0 30 L20 14 L40 26 L60 10 L80 24 L100 12 L120 26 L140 14 L160 28 L180 12 L200 24 L220 14 L240 26 V40 H0 Z" fill="${fill}" opacity="${opacity}"/></svg>`;
}
function ambientPineTreeSVG(){
  return `<svg viewBox="0 0 60 60"><polygon points="30,6 42,26 18,26" fill="var(--pine-c)"/><polygon points="30,16 46,34 14,34" fill="var(--pine-c)"/><polygon points="30,26 50,48 10,48" fill="var(--pine-c2)"/><rect x="27" y="48" width="6" height="8" fill="#5b4636"/><path d="M18 26 L30 16 L42 26" fill="none" stroke="var(--snowcap)" stroke-width="2" opacity=".85"/><path d="M14 34 L30 22 L46 34" fill="none" stroke="var(--snowcap)" stroke-width="2" opacity=".75"/></svg>`;
}
function renderWinterFx(fx, dayTime){
  // Mirrors renderBeachFx's shape, just dressed for the cold: stars at night,
  // a light ever-present flurry, snow-covered hills at the base, and a snowy pine in the corner.
  if(!dayTime){
    for(let i=0;i<7;i++){
      const t=document.createElement('div');
      t.className='fx-twinkle';
      const s=1+Math.random()*1.6;
      t.style.width=s+'px'; t.style.height=s+'px';
      t.style.left=(Math.random()*96)+'%';
      t.style.top=(Math.random()*28)+'%';
      t.style.animationDuration=(1.8+Math.random()*2.2)+'s';
      t.style.animationDelay=(-Math.random()*3)+'s';
      fx.appendChild(t);
    }
  }
  // A light, ever-present flurry drifting through the sky (day or night)
  for(let i=0;i<7;i++){
    const s=document.createElement('div');
    s.className='fx-flake';
    s.textContent='❄';
    s.style.left=(Math.random()*98)+'%';
    s.style.setProperty('--sx',(Math.random()*30-15)+'px');
    s.style.fontSize=(7+Math.random()*6)+'px';
    s.style.opacity='.5';
    const dur=9+Math.random()*6;
    s.style.animationDuration=dur+'s';
    s.style.animationDelay=(-Math.random()*dur)+'s';
    fx.appendChild(s);
  }
  // Layered snow-covered hills along the bottom of the panel
  const hillLayers=[
    {cls:'hill-l1', bottom:'-6%', h:34, fill:'var(--snowhill-c)', op:.32},
    {cls:'hill-l2', bottom:'-10%', h:40, fill:'var(--snowhill-c2)', op:.24},
    {cls:'hill-l3', bottom:'-14%', h:46, fill:'var(--snowhill-c)', op:.16}
  ];
  hillLayers.forEach(l=>{
    const h=document.createElement('div');
    h.className='fx-snowhill '+l.cls;
    h.style.bottom=l.bottom; h.style.height=l.h+'px';
    h.innerHTML=ambientSnowHillSVG(l.fill,l.op);
    fx.appendChild(h);
  });
  // A couple of icy sparkles catching the light on the snow
  for(let i=0;i<3;i++){
    const sp=document.createElement('div');
    sp.className='fx-sparkle-ice';
    sp.style.width='3px'; sp.style.height='3px';
    sp.style.left=(15+Math.random()*70)+'%';
    sp.style.bottom=(2+Math.random()*10)+'%';
    sp.style.animationDuration=(1.6+Math.random()*1.4)+'s';
    sp.style.animationDelay=(-Math.random()*2)+'s';
    fx.appendChild(sp);
  }
  // A small snow-capped pine tucked in the corner for that "شتوية" feel
  const pine=document.createElement('div');
  pine.className='fx-pinetree';
  pine.style.width='36px'; pine.style.height='36px';
  pine.style.right='6%';
  pine.innerHTML=ambientPineTreeSVG();
  fx.appendChild(pine);
}
// ── Ambient weather FX inside the panel: drifting clouds, sun/stars, rain, snow, heat shimmer, fog ──
function weatherSkylineSVG(){
  return '<svg viewBox="0 0 900 100" preserveAspectRatio="xMidYMax slice"><g fill="currentColor">'+
    '<path d="M0 100V82h900v18z"/>'+
    '<path d="M40 82V46h34v36z"/><path d="M84 82V30h26v52z"/><path d="M120 82V58h18v24z"/>'+
    '<path d="M760 82V54h20v28z"/><path d="M790 82V24h30v58z"/><path d="M830 82V64h16v18z"/>'+
    '<path d="M300 82c0-26 18-46 40-46s40 20 40 46z"/><path d="M480 82c0-20 14-36 32-36s32 16 32 36z"/>'+
    '<path d="M560 82c0-14 10-24 22-24s22 10 22 24z"/>'+
    '</g></svg>';
}
function renderWeatherFx(code, temp, isDay){
  const fx=document.getElementById('weatherFx');
  if(!fx) return;
  fx.innerHTML='';
  const isRain=WCODE.rain.includes(code), isStorm=WCODE.storm.includes(code);
  const isSnow=WCODE.snow.includes(code), isFog=WCODE.fog.includes(code);
  const isHot=typeof temp==='number' && temp>=32;
  const isClear=code===0;
  const isCloudy=[1,2,3].includes(code) || isRain || isStorm || isSnow;
  const dayTime = isDay===undefined ? !document.body.classList.contains('night-theme') : !!isDay;
  const isSummer = isSummerNow();
  const isWinter = isWinterNow();

  // A faint skyline always sits along the bottom of the panel, tinted to
  // match the current weather / time of day — mirrors the mosque skyline
  // behind the prayer panel so both panels feel consistent. It stays
  // low-opacity and clipped to the panel's own bottom edge, so it never
  // covers the temperature, forecast, or any other weather data above it.
  const skyline=document.createElement('div');
  skyline.className='fx-weather-skyline';
  skyline.style.color = !dayTime ? 'var(--moon-c)'
    : isStorm ? 'var(--storm-c)'
    : isRain ? 'var(--rain-c)'
    : isSnow ? 'var(--snow-c)'
    : isFog ? 'var(--fog-c)'
    : isHot ? 'var(--sand-c)'
    : isSummer ? 'var(--sea-c)'
    : isWinter ? 'var(--winter-sun-c)'
    : isClear ? 'var(--sun-c)'
    : 'var(--cloud-c)';
  skyline.innerHTML=weatherSkylineSVG();
  fx.appendChild(skyline);

  // Full-panel sunny/hot ambiance — soft sun-ray beams sweeping through plus
  // warm light motes drifting upward. This is the bright, hot-weather
  // counterpart to the rain drops, so it only shows up when it's genuinely
  // sunny and/or hot outside (not just because the calendar says summer).
  if(dayTime && (isClear || isHot) && !isRain && !isStorm && !isSnow && !isFog){
    for(let i=0;i<3;i++){
      const rb=document.createElement('div');
      rb.className='fx-raybeam';
      rb.style.left=(10+i*30+Math.random()*8)+'%';
      const dur=5+Math.random()*3;
      rb.style.animationDuration=dur+'s';
      rb.style.animationDelay=(-Math.random()*dur)+'s';
      fx.appendChild(rb);
    }
    for(let i=0;i<14;i++){
      const sm=document.createElement('div');
      sm.className='fx-sunmote';
      sm.style.left=(Math.random()*98)+'%';
      sm.style.setProperty('--sx',(Math.random()*30-15)+'px');
      sm.style.setProperty('--sx2',(Math.random()*40-20)+'px');
      const dur=6+Math.random()*5;
      sm.style.animationDuration=dur+'s';
      sm.style.animationDelay=(-Math.random()*dur)+'s';
      fx.appendChild(sm);
    }
  }

  // In summer, swap the generic drifting clouds for a beach/seaside scene; in winter,
  // swap them for a snowy hillside scene — both skipped for rain/storm/snow/fog,
  // which get their own dedicated effects below.
  if(isSummer && !isRain && !isStorm && !isSnow && !isFog){
    renderBeachFx(fx, dayTime);
  } else if(isWinter && !isRain && !isStorm && !isSnow && !isFog){
    renderWinterFx(fx, dayTime);
  } else
  // Layered drifting clouds — always present when the sky isn't clear, softer touch when clear
  if(isCloudy || isFog){
    const layers=isStorm?4:(isSnow||isRain?3:2);
    for(let i=0;i<layers;i++){
      const c=document.createElement('div');
      c.className='fx-cloud';
      const w=60+Math.random()*70;
      c.style.width=w+'px';
      c.style.height=(w*0.5)+'px';
      c.style.top=(6+i*20+Math.random()*10)+'%';
      c.style.opacity=(0.22+Math.random()*0.28).toFixed(2);
      const dur=22+i*10+Math.random()*10;
      c.style.animationDuration=dur+'s';
      c.style.animationDelay=(-Math.random()*dur)+'s';
      c.innerHTML=ambientCloudSVG();
      fx.appendChild(c);
    }
  } else if(isClear && dayTime){
    // Gentle sun glow + one thin decorative cloud drifting past
    const ray=document.createElement('div');
    ray.className='fx-sunray';
    ray.style.width='90px'; ray.style.height='90px';
    ray.style.top='10%'; ray.style.right='8%';
    fx.appendChild(ray);
    const c=document.createElement('div');
    c.className='fx-cloud';
    c.style.width='70px'; c.style.height='35px';
    c.style.top='55%'; c.style.opacity='.2';
    c.style.animationDuration='34s';
    c.innerHTML=ambientCloudSVG();
    fx.appendChild(c);
  } else if(isClear && !dayTime){
    // Twinkling starfield for a clear night
    for(let i=0;i<12;i++){
      const t=document.createElement('div');
      t.className='fx-twinkle';
      const s=1+Math.random()*2;
      t.style.width=s+'px'; t.style.height=s+'px';
      t.style.left=(Math.random()*96)+'%';
      t.style.top=(Math.random()*70)+'%';
      t.style.animationDuration=(1.8+Math.random()*2.2)+'s';
      t.style.animationDelay=(-Math.random()*3)+'s';
      fx.appendChild(t);
    }
  }

  if(isRain||isStorm){
    const n=isStorm?24:16;
    for(let i=0;i<n;i++){
      const d=document.createElement('div');
      d.className='fx-drop';
      d.style.left=(Math.random()*98)+'%';
      d.style.height=(12+Math.random()*14)+'px';
      const dur=.5+Math.random()*.5;
      d.style.animationDuration=dur+'s';
      d.style.animationDelay=(-Math.random()*dur)+'s';
      fx.appendChild(d);
    }
  } else if(isSnow){
    for(let i=0;i<14;i++){
      const s=document.createElement('div');
      s.className='fx-flake';
      s.textContent='❄';
      s.style.left=(Math.random()*98)+'%';
      s.style.setProperty('--sx',(Math.random()*40-20)+'px');
      s.style.fontSize=(9+Math.random()*8)+'px';
      const dur=6+Math.random()*5;
      s.style.animationDuration=dur+'s';
      s.style.animationDelay=(-Math.random()*dur)+'s';
      fx.appendChild(s);
    }
  } else if(isHot){
    const heat=document.createElement('div');
    heat.className='fx-heat';
    fx.appendChild(heat);
    // The rising heat-shimmer arcs are skipped in summer — the sea waves from
    // renderBeachFx already read as "hot beach air" without the visual clash.
    if(!isSummer){
      for(let i=0;i<4;i++){
        const w=document.createElement('div');
        w.className='fx-wave';
        w.style.left=(8+i*23+Math.random()*10)+'%';
        const dur=3+Math.random()*2;
        w.style.animationDuration=dur+'s';
        w.style.animationDelay=(-Math.random()*dur)+'s';
        fx.appendChild(w);
      }
    }
  } else if(isFog){
    for(let i=0;i<3;i++){
      const f=document.createElement('div');
      f.className='fx-fog';
      f.style.top=(22+i*24)+'%';
      f.style.animationDuration=(6+i*2)+'s';
      fx.appendChild(f);
    }
  }
}
let lastWeatherData=null, lastWeatherCoords=null, lastWeatherCity=null, lastWeatherFlag='';
let isManualCity=false, lastManualCityMeta=null;
function countryFlagEmoji(cc){
  if(!cc || cc.length!==2) return '';
  const code = cc.toLowerCase();
  return `<img src="https://flagcdn.com/24x18/${code}.png" alt="${cc.toUpperCase()}" class="weather-flag-img">`;
}
// Finds the index of the current hour inside an Open-Meteo hourly.time[] array,
// so we can read "right now" values (rain probability, visibility) out of the hourly data —
// Open-Meteo doesn't expose those two fields on the `current` block directly.
function wcHourlyNowIndex(times){
  if(!times || !times.length) return -1;
  const now=new Date();
  let idx=0;
  for(let i=0;i<times.length;i++){
    if(new Date(times[i])<=now) idx=i; else break;
  }
  return idx;
}
function wRainChanceIconSVG(prob){
  const p = (prob!=null && !isNaN(prob)) ? Math.max(0,Math.min(100,prob)) : 0;
  const dur = (2.4 - (p/100)*1.3).toFixed(2);
  const positions=[7.5,12,16.5], delays=[0,.35,.7];
  let drops='';
  for(let i=0;i<3;i++){
    const op = p<15 ? .22 : (i===2 && p<55 ? .3 : 1);
    drops += '<path class="w-rain-drop" style="animation-duration:'+dur+'s;animation-delay:'+delays[i]+'s;opacity:'+op+'" d="M'+positions[i]+' 14.2c-1.15 1.5-2 2.6-2 3.7a2 2 0 0 0 4 0c0-1.1-.85-2.2-2-3.7z" fill="var(--rain-c)"/>';
  }
  return '<svg viewBox="0 0 24 24" fill="none"><path class="w-rain-cloud" d="M6.4 13.6a3.7 3.7 0 0 1 .35-7.38A5.1 5.1 0 0 1 16.6 7.4a3.2 3.2 0 0 1-.5 6.2H6.8a2.3 2.3 0 0 1-.4 0z" fill="var(--cloud-c2)"/>'+drops+'</svg>';
}
function wHumidityIconSVG(humidity){
  const h = (humidity!=null && !isNaN(humidity)) ? Math.max(0,Math.min(100,humidity)) : 50;
  const waveY = (19 - (h/100)*13).toFixed(1);
  const dPath = 'M12 2.2c.35 0 6.9 8 6.9 13.4a6.9 6.9 0 1 1-13.8 0c0-5.4 6.55-13.4 6.9-13.4z';
  return '<svg viewBox="0 0 24 24" fill="none"><defs><clipPath id="wHumClip"><path d="'+dPath+'"/></clipPath></defs>'+
    '<g clip-path="url(#wHumClip)">'+
      '<rect x="0" y="'+(parseFloat(waveY)+2).toFixed(1)+'" width="24" height="'+(24-(parseFloat(waveY)+2)).toFixed(1)+'" fill="var(--rain-c)" opacity=".55"/>'+
      '<g transform="translate(0,'+waveY+')"><path class="w-hum-wave" d="M-24 4 Q-21 0 -18 4 T-12 4 T-6 4 T0 4 T6 4 T12 4 T18 4 T24 4 V20 H-24 Z" fill="var(--rain-c)" opacity=".82"/></g>'+
    '</g>'+
    '<path class="w-hum-drop-outline" d="'+dPath+'" fill="none" stroke="var(--rain-c)" stroke-width="1.4"/></svg>';
}
function wVisibilityIconSVG(){
  return '<svg viewBox="0 0 24 24" fill="none">'+
    '<circle class="w-vis-ring" cx="12" cy="12" r="10" fill="none" stroke="var(--fog-c)" stroke-width="1.1" opacity=".5"/>'+
    '<circle class="w-vis-ring" cx="12" cy="12" r="10" fill="none" stroke="var(--fog-c)" stroke-width="1.1" opacity=".5"/>'+
    '<circle class="w-vis-ring" cx="12" cy="12" r="10" fill="none" stroke="var(--fog-c)" stroke-width="1.1" opacity=".5"/>'+
    '<path d="M12 5.5c-4.6 0-8.6 2.9-10.4 6.5C3.4 15.6 7.4 18.5 12 18.5s8.6-2.9 10.4-6.5C20.6 8.4 16.6 5.5 12 5.5z" fill="var(--card)" stroke="var(--fog-c)" stroke-width="1.2"/>'+
    '<g class="w-vis-eye-lid"><circle cx="12" cy="12" r="3.4" fill="var(--gold)"/><circle cx="12" cy="12" r="1.3" fill="var(--bg)"/></g>'+
    '</svg>';
}
function wFeelsLikeIconSVG(){
  return '<svg viewBox="0 0 24 24" fill="none"><rect class="w-feels-mercury" x="10.9" y="6" width="2.2" height="7.5" rx="1.1" fill="var(--sun-c)"/><path d="M12 2.5a2.3 2.3 0 0 1 2.3 2.3v8.1a4.3 4.3 0 1 1-4.6 0V4.8A2.3 2.3 0 0 1 12 2.5z" fill="none" stroke="var(--sun-c)" stroke-width="1.4"/><circle class="w-feels-bulb" cx="12" cy="16.4" r="2.6" fill="var(--sun-c)"/></svg>';
}
function wWindIconSVG(deg){
  const rot = (deg!=null && !isNaN(deg)) ? deg : 0;
  return '<svg viewBox="0 0 24 24" fill="none" style="transform:rotate('+rot+'deg)">'+
    '<g class="w-wind-lines" stroke="var(--sea-c)" stroke-width="1.3" stroke-linecap="round" opacity=".55">'+
      '<path class="w-wind-line" d="M4 15h4"/><path class="w-wind-line" d="M4 18h6"/><path class="w-wind-line" d="M4 12h3"/>'+
    '</g>'+
    '<path class="w-wind-arrow" d="M12 3.5v15M12 3.5l-4 4.2M12 3.5l4 4.2" stroke="var(--sea-c)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'+
  '</svg>';
}
function wUvIconSVG(uv){
  const v=(uv!=null && !isNaN(uv))?uv:0;
  const c = v>=8?'var(--storm-c)':(v>=6?'var(--sun-c)':(v>=3?'var(--gold)':'var(--muted)'));
  return '<svg viewBox="0 0 24 24" fill="none"><circle class="w-uv-core" cx="12" cy="12" r="5.5" fill="'+c+'"/><g class="w-uv-rays" stroke="'+c+'" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="1.5" x2="12" y2="4.2"/><line x1="12" y1="19.8" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="4.2" y2="12"/><line x1="19.8" y1="12" x2="22.5" y2="12"/><line x1="4.4" y1="4.4" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.6" y2="19.6"/><line x1="4.4" y1="19.6" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.6" y2="4.4"/></g></svg>';
}
function wAqiIconSVG(pm){
  const v=(pm!=null && !isNaN(pm))?pm:0;
  const c = v>55?'var(--storm-c)':(v>25?'var(--gold2)':(v>12?'var(--gold)':'#7fd88a'));
  const r=9, circ=2*Math.PI*r;
  const pct=Math.min(Math.max(v/100,.06),1);
  const off=circ*(1-pct);
  let mark;
  if(v<=12){
    // Good — checkmark draws itself in
    mark = '<path class="w-aqi-badge-mark" style="--len:10" d="M8.6 12.3l2.1 2.1 4.4-4.9" stroke="var(--bg)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  } else if(v<=55){
    // Fair / Moderate — dash draws itself in
    mark = '<path class="w-aqi-badge-mark" style="--len:6.5" d="M8.8 12h6.4" stroke="var(--bg)" stroke-width="1.7" stroke-linecap="round"/>';
  } else {
    // Unhealthy — exclamation mark draws itself in
    mark = '<path class="w-aqi-badge-mark" style="--len:4.5" d="M12 7.8v4.4" stroke="var(--bg)" stroke-width="1.7" stroke-linecap="round"/><circle class="w-aqi-badge-dot" cx="12" cy="15.4" r="1.05" fill="var(--bg)"/>';
  }
  return '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="'+r+'" fill="none" stroke="var(--border)" stroke-width="2.4"/><circle class="w-aqi-ring" style="--circ:'+circ.toFixed(2)+';--off:'+off.toFixed(2)+'" cx="12" cy="12" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="2.6" stroke-linecap="round"/><circle class="w-aqi-core" cx="12" cy="12" r="6.6" fill="'+c+'" opacity=".16"/><g class="w-aqi-badge">'+mark+'</g></svg>';
}
function uvLabel(v,lang){
  if(v==null||isNaN(v)) return '—';
  const lvl = v>=11? (lang==='ar'?'شديد جدًا':'Extreme') : v>=8?(lang==='ar'?'شديد':'Very High') : v>=6?(lang==='ar'?'مرتفع':'High') : v>=3?(lang==='ar'?'معتدل':'Moderate') : (lang==='ar'?'منخفض':'Low');
  return Math.round(v)+' · '+lvl;
}
function aqiLabel(pm,lang){
  if(pm==null||isNaN(pm)) return '—';
  const lvl = pm>55? (lang==='ar'?'خطر':'Unhealthy') : pm>25?(lang==='ar'?'متوسطة':'Moderate') : pm>12?(lang==='ar'?'مقبولة':'Fair') : (lang==='ar'?'جيدة':'Good');
  return Math.round(pm)+' · '+lvl;
}
function weatherStatsHtml(humidity, visibilityM, lang, extra){
  extra = extra || {};
  const humStr = (humidity!=null && !isNaN(humidity)) ? Math.round(humidity)+'%' : '—';
  let visStr = '—';
  if(visibilityM!=null && !isNaN(visibilityM)){
    const km = visibilityM/1000;
    visStr = km>=10 ? (lang==='ar'?'+10 كم':'10+ km') : km.toFixed(1)+' '+(lang==='ar'?'كم':'km');
  }
  let html = '<div class="w-stat"><span class="w-stat-ic">'+wHumidityIconSVG(humidity)+'</span><span class="w-stat-val">'+humStr+'</span><span class="w-stat-label">'+(lang==='ar'?'الرطوبة':'Humidity')+'</span></div>'+
    '<div class="w-stat"><span class="w-stat-ic">'+wVisibilityIconSVG()+'</span><span class="w-stat-val">'+visStr+'</span><span class="w-stat-label">'+(lang==='ar'?'مدى الرؤية':'Visibility')+'</span></div>';
  if(extra.feelsLike!=null && !isNaN(extra.feelsLike)){
    html += '<div class="w-stat"><span class="w-stat-ic">'+wFeelsLikeIconSVG()+'</span><span class="w-stat-val">'+Math.round(extra.feelsLike)+'°</span><span class="w-stat-label">'+(lang==='ar'?'الإحساس الحقيقي':'Feels like')+'</span></div>';
  }
  if(extra.windSpeed!=null && !isNaN(extra.windSpeed)){
    const dirTxt = extra.windDir!=null ? '<bdi class="w-stat-sub">'+Math.round(extra.windDir)+'°</bdi>' : '';
    html += '<div class="w-stat"><span class="w-stat-ic">'+wWindIconSVG(extra.windDir)+'</span><span class="w-stat-val">'+Math.round(extra.windSpeed)+' '+(lang==='ar'?'كم/س':'km/h')+'</span><span class="w-stat-label">'+(lang==='ar'?'الرياح':'Wind')+'</span>'+dirTxt+'</div>';
  }
  if(extra.uv!=null && !isNaN(extra.uv)){
    html += '<div class="w-stat"><span class="w-stat-ic">'+wUvIconSVG(extra.uv)+'</span><span class="w-stat-val">'+uvLabel(extra.uv,lang)+'</span><span class="w-stat-label">'+(lang==='ar'?'الأشعة فوق البنفسجية':'UV Index')+'</span></div>';
  }
  if(extra.pm25!=null && !isNaN(extra.pm25)){
    html += '<div class="w-stat"><span class="w-stat-ic">'+wAqiIconSVG(extra.pm25)+'</span><span class="w-stat-val">'+aqiLabel(extra.pm25,lang)+'</span><span class="w-stat-label">'+(lang==='ar'?'جودة الهواء':'Air Quality')+'</span><span class="w-stat-sub">PM2.5</span></div>';
  }
  return html;
}
function renderWeatherText(cur, wData, city, flag){
  const flagPart = flag !== undefined ? flag : lastWeatherFlag;
  const hourlyIdx = wcHourlyNowIndex(wData.hourly && wData.hourly.time);
  const precipProb = (wData.hourly && wData.hourly.precipitation_probability && hourlyIdx>=0) ? wData.hourly.precipitation_probability[hourlyIdx] : (wData.daily && wData.daily.precipitation_probability_max ? wData.daily.precipitation_probability_max[0] : null);
  const rainChip = (precipProb!=null && !isNaN(precipProb)) ? `<span class="weather-rain-chip"><span class="weather-rain-chip-ic">${wRainChanceIconSVG(precipProb)}</span>${Math.round(precipProb)}%</span>` : '';
  document.getElementById('weatherMain').innerHTML=`<div class="weather-left"><div class="weather-icon">${weatherIconSVG(cur.weather_code,cur.is_day)}</div><div class="weather-primary"><div class="weather-temp">${Math.round(cur.temperature_2m)}°${rainChip}</div><div class="weather-desc" dir="auto">${weatherDesc(cur.weather_code,currentLang)}</div></div></div><div class="weather-right"><div class="weather-city">${flagPart?flagPart+' ':'📍 '}${city}</div><div class="weather-advice" id="weatherAdvice" dir="auto">${weatherAdvice(cur.temperature_2m,cur.weather_code,currentLang)}</div></div>`;
  const heroTemp=document.getElementById('heroWeatherTemp'), heroDesc=document.getElementById('heroWeatherDesc'), heroCity=document.getElementById('heroWeatherCity');
  if(heroTemp) heroTemp.textContent=Math.round(cur.temperature_2m)+'°';
  if(heroDesc) heroDesc.textContent=weatherDesc(cur.weather_code,currentLang);
  if(heroCity) heroCity.innerHTML=(flagPart?flagPart+' ':'📍 ')+city;

  const visibilityM = (wData.hourly && wData.hourly.visibility && hourlyIdx>=0) ? wData.hourly.visibility[hourlyIdx] : null;
  const humidity = cur.relative_humidity_2m!=null ? cur.relative_humidity_2m : null;
  const uvNow = (wData.hourly && wData.hourly.uv_index && hourlyIdx>=0) ? wData.hourly.uv_index[hourlyIdx] : (wData.daily && wData.daily.uv_index_max ? wData.daily.uv_index_max[0] : null);
  const statsEl = document.getElementById('weatherStats');
  if(statsEl) statsEl.innerHTML = weatherStatsHtml(humidity, visibilityM, currentLang, {
    feelsLike: cur.apparent_temperature,
    windSpeed: cur.wind_speed_10m,
    windDir: cur.wind_direction_10m,
    uv: uvNow,
    pm25: lastAirQuality
  });

  const daysEn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],daysAr=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  let fc='';
  for(let i=1;i<=3;i++){
    const d=new Date(wData.daily.time[i]);
    fc+=`<div class="forecast-item"><div class="f-day">${currentLang==='ar'?daysAr[d.getDay()]:daysEn[d.getDay()]}</div><div class="f-icon">${weatherIconSVG(wData.daily.weather_code[i],true)}</div><div class="f-temp">${Math.round(wData.daily.temperature_2m_max[i])}° / ${Math.round(wData.daily.temperature_2m_min[i])}°</div></div>`;
  }
  document.getElementById('forecastGrid').innerHTML=fc;
  renderHourlyStrip(wData, hourlyIdx);
  const cityLabel=document.getElementById('prayerCityLabel');
  if(cityLabel)cityLabel.textContent=city;
}
// ── Hourly forecast strip: next few hours (temperature + condition icon) ──
function renderHourlyStrip(wData, startIdx){
  const el=document.getElementById('hourlyStrip');
  if(!el) return;
  if(!wData.hourly || !wData.hourly.time || startIdx<0){ el.innerHTML=''; return; }
  const isAr=currentLang==='ar';
  let html='';
  for(let i=startIdx; i<Math.min(startIdx+8, wData.hourly.time.length); i++){
    const d=new Date(wData.hourly.time[i]);
    let hourLabel;
    if(i===startIdx){
      hourLabel = isAr?'دلوقتي':'Now';
    } else {
      const hr=d.getHours();
      let h12=hr%12; if(h12===0) h12=12;
      const per=isAr?(hr<12?'ص':'م'):(hr<12?'AM':'PM');
      hourLabel = `<bdi>${h12} ${per}</bdi>`;
    }
    const temp = wData.hourly.temperature_2m ? Math.round(wData.hourly.temperature_2m[i]) : '—';
    const code = wData.hourly.weather_code ? wData.hourly.weather_code[i] : 0;
    const isDayHour = wData.hourly.is_day ? !!wData.hourly.is_day[i] : true;
    html += `<div class="hourly-item"><div class="h-time">${hourLabel}</div><div class="h-icon">${weatherIconSVG(code,isDayHour)}</div><div class="h-temp">${temp}°</div></div>`;
  }
  el.innerHTML=html;
}
// ── Air Quality (PM2.5) — Open-Meteo's free Air Quality API, no key needed ──
let lastAirQuality=null;
async function fetchAirQuality(lat,lon){
  try{
    const res=await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude='+lat+'&longitude='+lon+'&current=pm2_5');
    const data=await res.json();
    lastAirQuality = data.current ? data.current.pm2_5 : null;
    // Re-render stats now that PM2.5 has arrived (it comes back slightly after the main weather call).
    if(lastWeatherData) renderWeatherText(lastWeatherData.current, lastWeatherData, lastWeatherCity, lastWeatherFlag);
  }catch(e){ lastAirQuality=null; }
}
async function refreshWeatherLang(){
  if(!lastWeatherData) return;

  let city = lastWeatherCity;

  if(lastWeatherCoords && !isManualCity){
    try{
      const geoRes = await fetch(
        'https://nominatim.openstreetmap.org/reverse?lat=' +
        lastWeatherCoords.lat +
        '&lon=' +
        lastWeatherCoords.lon +
        '&format=json&accept-language=' +
        currentLang
      );

      const geoData = await geoRes.json();

      const geoCity =
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        geoData.address?.state ||
        (currentLang === 'ar' ? 'مكانك' : 'Your location');

      const country =
    geoData.address?.country || '';
      const countryCode = geoData.address?.country_code || '';

const locationName =
    country ? `${geoCity}, ${country}` : geoCity;

lastWeatherCity = locationName;
lastWeatherFlag = countryFlagEmoji(countryCode);
city = locationName;
    } catch(e){}
  }

  renderWeatherText(lastWeatherData.current, lastWeatherData, city, lastWeatherFlag);
  renderWeatherFx(
    lastWeatherData.current.weather_code,
    lastWeatherData.current.temperature_2m,
    lastWeatherData.current.is_day
  );
}
const WEATHER_CACHE_KEY='fwfm_weather_cache_v1';
function saveWeatherCache(lat,lon,city,wData,flag){
  try{
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({lat,lon,city,wData,flag,manual:isManualCity,manualMeta:lastManualCityMeta,countryCode:currentPrayerCountry,ts:Date.now()}));
  }catch(e){/* storage unavailable/full — non-critical, just skip caching */}
}
function loadWeatherCache(){
  try{
    const raw=localStorage.getItem(WEATHER_CACHE_KEY);
    if(!raw) return null;
    const parsed=JSON.parse(raw);
    // Cache stays "fresh enough to show instantly" for 1 hour; older than that we still show it (better than nothing) but always refresh in background.
    return parsed;
  }catch(e){ return null; }
}
async function fetchWeather(lat,lon,manualCity){
  fetchPrayerTimes(lat,lon);
  lastWeatherCoords={lat,lon};
  try{
    let locationName, countryCode='';
    if(manualCity){
      // City was picked from the manual search box — no need to reverse-geocode.
      isManualCity = true;
      lastManualCityMeta = manualCity;
      locationName = manualCity.label;
      countryCode = manualCity.countryCode || '';
      lastWeatherCity = locationName;
      lastWeatherFlag = countryFlagEmoji(countryCode);
    } else {
    isManualCity = false;
    lastManualCityMeta = null;
    const geoRes=await fetch('https://nominatim.openstreetmap.org/reverse?lat='+lat+'&lon='+lon+'&format=json&accept-language='+currentLang);
    const geoData=await geoRes.json();
    const city =
    geoData.address?.city ||
    geoData.address?.town ||
    geoData.address?.village ||
    geoData.address?.state ||
    (currentLang === 'ar' ? 'مكانك' : 'Your location');

const country =
    geoData.address?.country || '';
countryCode = geoData.address?.country_code || '';

    locationName =
    country
        ? `${city}, ${country}`
        : city;

lastWeatherCity = locationName;
lastWeatherFlag = countryFlagEmoji(countryCode);
    }

const cityLabel = document.getElementById('prayerCityLabel');
if (cityLabel) cityLabel.textContent = locationName;
    if(countryCode && countryCode!==currentPrayerCountry) fetchPrayerTimes(lat, lon, countryCode);
    const wRes=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,weather_code,is_day,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability,visibility,temperature_2m,weather_code,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max&timezone=auto');
    const wData=await wRes.json(); const cur=wData.current;
    lastWeatherData=wData;
    renderWeatherText(cur, wData, locationName, lastWeatherFlag);
    renderWeatherFx(cur.weather_code, cur.temperature_2m, cur.is_day);
    applyCityDecorSeason(lat, cur.weather_code, cur.temperature_2m);
    document.getElementById('weatherSection').style.display='block';
    document.getElementById('weatherLoading').style.display='none';
    saveWeatherCache(lat, lon, locationName, wData, lastWeatherFlag);
    fetchAirQuality(lat, lon);
  }catch(e){
    const btn=document.getElementById('weatherStatus');
    btn.textContent=currentLang==='ar'?'مش قادر اجيبلك الطقس — حاول تاني 😔':"Couldn't fetch weather — tap to retry 😔";
    btn.classList.add('retryable');
  }
}
function setWeatherStatus(msg, retryable){
  const btn=document.getElementById('weatherStatus');
  btn.textContent=msg;
  btn.classList.toggle('retryable', !!retryable);
}
function requestLocation(){
  if(!navigator.geolocation){
    setWeatherStatus(currentLang==='ar'?'المتصفح ده مش بيدعم تحديد الموقع 😔':'This browser doesn\'t support location 😔', false);
    return;
  }
  setWeatherStatus(currentLang==='ar'?'📍 بنحدد مكانك...':'📍 Detecting your location...', false);
  navigator.geolocation.getCurrentPosition(
    pos=>fetchWeather(pos.coords.latitude,pos.coords.longitude),
    err=>{
      let msgEn, msgAr;
      if(err.code===1){ // PERMISSION_DENIED
        msgEn='Location blocked — enable it in your browser\'s site settings, then tap here 🌦️';
        msgAr='الموقع متمنوع — فعّله من إعدادات المتصفح للموقع، وبعدين دوس هنا 🌦️';
      } else if(err.code===3){ // TIMEOUT
        msgEn='Taking too long — tap to try again 🌦️';
        msgAr='الطلب واخد وقت — دوس تاني 🌦️';
      } else { // POSITION_UNAVAILABLE or other
        msgEn='Couldn\'t get your location — tap to retry 🌦️';
        msgAr='مش قادرين نجيب مكانك — دوس تاني 🌦️';
      }
      setWeatherStatus(currentLang==='ar'?msgAr:msgEn, true);
      const cityLabel=document.getElementById('prayerCityLabel');
      if(cityLabel) cityLabel.textContent=currentLang==='ar'?'توقيت تقريبي':'Approx. times';
    },
    {enableHighAccuracy:false, timeout:10000, maximumAge:600000}
  );
}
document.getElementById('weatherStatus').addEventListener('click', ()=>{
  if(document.getElementById('weatherStatus').classList.contains('retryable')) requestLocation();
});

// ── Manual city search — Open-Meteo's free geocoding API, no key needed ──
let citySearchDebounce=null;
function toggleCitySearch(){
  const box=document.getElementById('citySearchBox');
  if(!box) return;
  const show = box.style.display==='none' || !box.style.display;
  box.style.display = show?'block':'none';
  if(show){ document.getElementById('citySearchInput').focus(); }
}
async function runCitySearch(q){
  const resultsEl=document.getElementById('citySearchResults');
  if(!resultsEl) return;
  if(!q || q.trim().length<2){ resultsEl.innerHTML=''; return; }
  resultsEl.innerHTML='<div class="city-result-loading">'+(currentLang==='ar'?'بندور...':'Searching...')+'</div>';
  try{
    const res=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q.trim())+'&count=8&language='+(currentLang==='ar'?'ar':'en')+'&format=json');
    const data=await res.json();
    const list=data.results||[];
    if(!list.length){ resultsEl.innerHTML='<div class="city-result-empty">'+(currentLang==='ar'?'مفيش نتايج':'No results')+'</div>'; return; }
    resultsEl.innerHTML=list.map(r=>{
      const parts=[r.name, r.admin1, r.country].filter(Boolean);
      const label=parts.join(', ');
      const cc=(r.country_code||'').toLowerCase();
      return `<button type="button" class="city-result-item" data-lat="${r.latitude}" data-lon="${r.longitude}" data-label="${label.replace(/"/g,'&quot;')}" data-cc="${cc}">📍 ${label}</button>`;
    }).join('');
  }catch(e){
    resultsEl.innerHTML='<div class="city-result-empty">'+(currentLang==='ar'?'حصل خطأ، حاول تاني':'Something went wrong, try again')+'</div>';
  }
}
document.getElementById('citySearchInput')?.addEventListener('input', (e)=>{
  clearTimeout(citySearchDebounce);
  const val=e.target.value;
  citySearchDebounce=setTimeout(()=>runCitySearch(val), 450);
});
document.getElementById('citySearchResults')?.addEventListener('click', (e)=>{
  const btn=e.target.closest('.city-result-item');
  if(!btn) return;
  const lat=parseFloat(btn.dataset.lat), lon=parseFloat(btn.dataset.lon);
  const label=btn.dataset.label, cc=btn.dataset.cc;
  document.getElementById('citySearchResults').innerHTML='';
  document.getElementById('citySearchInput').value='';
  document.getElementById('citySearchBox').style.display='none';
  document.getElementById('weatherSection').style.display='none';
  document.getElementById('weatherLoading').style.display='block';
  setWeatherStatus(currentLang==='ar'?'📍 بنجيب طقس '+label+'...':'📍 Fetching weather for '+label+'...', false);
  fetchWeather(lat, lon, {label, countryCode:cc});
  updateCitySearchUiState();
});
function useMyLocationInstead(){
  isManualCity=false; lastManualCityMeta=null;
  document.getElementById('weatherSection').style.display='none';
  document.getElementById('weatherLoading').style.display='block';
  requestLocation();
  updateCitySearchUiState();
}
function updateCitySearchUiState(){
  const gpsBtn=document.getElementById('useGpsBtn');
  if(gpsBtn) gpsBtn.style.display = isManualCity ? 'inline-flex' : 'none';
}
document.getElementById('useGpsBtn')?.addEventListener('click', useMyLocationInstead);
document.getElementById('citySearchToggle')?.addEventListener('click', toggleCitySearch);

// Show cached weather instantly (if we have any from a previous visit) while a fresh
// location fix runs quietly in the background — makes the site feel instant on reopen.
const cachedWeather=loadWeatherCache();
if(cachedWeather && cachedWeather.wData){
  lastWeatherData=cachedWeather.wData;
  lastWeatherCoords={lat:cachedWeather.lat, lon:cachedWeather.lon};
  lastWeatherCity=cachedWeather.city;
  lastWeatherFlag=cachedWeather.flag||'';
  isManualCity=!!cachedWeather.manual;
  lastManualCityMeta=cachedWeather.manualMeta||null;
  currentPrayerCountry=cachedWeather.countryCode||null;
  renderWeatherText(cachedWeather.wData.current, cachedWeather.wData, cachedWeather.city, lastWeatherFlag);
  renderWeatherFx(cachedWeather.wData.current.weather_code, cachedWeather.wData.current.temperature_2m, cachedWeather.wData.current.is_day);
  applyCityDecorSeason(cachedWeather.lat, cachedWeather.wData.current.weather_code, cachedWeather.wData.current.temperature_2m);
  document.getElementById('weatherSection').style.display='block';
  document.getElementById('weatherLoading').style.display='none';
  if(lastAirQuality==null) fetchAirQuality(cachedWeather.lat, cachedWeather.lon);
}
updateCitySearchUiState();
if(isManualCity && lastManualCityMeta){
  // Respect the person's manual city choice instead of overriding it with GPS on reload.
  fetchWeather(lastWeatherCoords.lat, lastWeatherCoords.lon, lastManualCityMeta);
} else {
  requestLocation();
}
// تحديث الطقس تلقائياً كل ساعة
setInterval(() => {
  if (lastWeatherCoords) {
    fetchWeather(lastWeatherCoords.lat, lastWeatherCoords.lon, isManualCity ? lastManualCityMeta : undefined);
  }
}, 60 * 60 * 1000);


