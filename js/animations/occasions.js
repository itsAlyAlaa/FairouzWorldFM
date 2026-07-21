// ================================================================
// Occasion & season engine: shared canvas particle renderer + season/holiday detection and theme application.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ══════════════════════════════════════════════
// OCCASION & SEASON ENGINE
// ══════════════════════════════════════════════

// ── Particle renderer (shared canvas for season + occasion decorations) ──
(function(){
  const canvas=document.getElementById('occCanvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d',{alpha:true});
  let particles=[], rafId=null, paused=false, activeConfigs=[], lastT=0;
  function rand(a,b){return a+Math.random()*(b-a);}
  // ── Lightweight vector shape drawing (no emoji, no raster images — pure canvas paths) ──
  function drawShape(shape,size,color){
    ctx.globalAlpha=.82;
    switch(shape){
      case 'leaf':{
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.moveTo(0,-size/2); ctx.quadraticCurveTo(size/2,0,0,size/2); ctx.quadraticCurveTo(-size/2,0,0,-size/2);
        ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=Math.max(.5,size*.04);
        ctx.beginPath(); ctx.moveTo(0,-size/2); ctx.lineTo(0,size/2); ctx.stroke();
        break;}
      case 'petal':{
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.ellipse(0,0,size/2,size/3.2,0,0,Math.PI*2);
        ctx.fill();
        break;}
      case 'snow':{
        ctx.strokeStyle=color; ctx.lineWidth=Math.max(.6,size*.08); ctx.lineCap='round';
        for(let i=0;i<3;i++){
          ctx.save(); ctx.rotate(i*Math.PI/3);
          ctx.beginPath(); ctx.moveTo(0,-size/2); ctx.lineTo(0,size/2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-size/5,-size/3); ctx.lineTo(size/5,-size/4); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-size/5,size/3); ctx.lineTo(size/5,size/4); ctx.stroke();
          ctx.restore();
        }
        break;}
      case 'sparkle':{
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.moveTo(0,-size/2); ctx.lineTo(size/7,-size/7); ctx.lineTo(size/2,0);
        ctx.lineTo(size/7,size/7); ctx.lineTo(0,size/2); ctx.lineTo(-size/7,size/7);
        ctx.lineTo(-size/2,0); ctx.lineTo(-size/7,-size/7); ctx.closePath(); ctx.fill();
        break;}
      case 'butterfly':{
        ctx.fillStyle=color;
        ctx.beginPath(); ctx.ellipse(-size*.26,-size*.14,size*.28,size*.2,-.4,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(size*.26,-size*.14,size*.28,size*.2,.4,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(-size*.22,size*.18,size*.2,size*.15,-.3,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(size*.22,size*.18,size*.2,size*.15,.3,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=color; ctx.lineWidth=Math.max(.6,size*.06);
        ctx.beginPath(); ctx.moveTo(0,-size/2); ctx.lineTo(0,size/2); ctx.stroke();
        break;}
      case 'cloud':{
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.ellipse(-size*.28,0,size*.32,size*.22,0,0,Math.PI*2);
        ctx.ellipse(size*.1,-size*.1,size*.38,size*.28,0,0,Math.PI*2);
        ctx.ellipse(size*.42,0,size*.28,size*.2,0,0,Math.PI*2);
        ctx.fill();
        break;}
      default:{
        ctx.fillStyle=color;
        ctx.beginPath(); ctx.arc(0,0,size/2,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha=1;
  }
  function resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=window.innerWidth*dpr; canvas.height=window.innerHeight*dpr;
    canvas.style.width=window.innerWidth+'px'; canvas.style.height=window.innerHeight+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    buildParticles();
  }
  function buildParticles(){
    particles=[];
    activeConfigs.forEach(cfg=>{
      if(!cfg) return;
      const n=Math.min(cfg.count,34);
      for(let i=0;i<n;i++){
        particles.push({
          cfg,
          x:Math.random()*window.innerWidth,
          y: cfg.dir==='up' ? window.innerHeight+Math.random()*window.innerHeight : Math.random()*-window.innerHeight,
          size:rand(cfg.size[0],cfg.size[1]),
          speed:rand(cfg.speed[0],cfg.speed[1]),
          swayPhase:Math.random()*Math.PI*2,
          rot:Math.random()*360,
          rotSpeed:rand(-40,40),
          shape: cfg.mode==='vector' ? cfg.shapes[Math.floor(Math.random()*cfg.shapes.length)] : null,
          color: (cfg.mode==='shape'||cfg.mode==='vector') ? cfg.colors[Math.floor(Math.random()*cfg.colors.length)] : null
        });
      }
    });
  }
  function setActiveThemes(configs){ activeConfigs=configs.filter(Boolean); buildParticles(); }
  function tick(t){
    if(!paused && !window.__scrollBusy){
      const dt=Math.min((t-lastT)/1000,.05)||.016; lastT=t;
      ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
      particles.forEach(p=>{
        const cfg=p.cfg;
        if(cfg.dir==='side'){
          p.x+=p.speed*dt;
          if(p.x>window.innerWidth+60) p.x=-60;
        }else{
          const mul=cfg.dir==='up'?-1:1;
          p.y+=mul*p.speed*dt;
          p.x+=Math.sin(p.swayPhase+t/900)*(cfg.sway||0)*dt;
          if(mul>0 && p.y>window.innerHeight+40){p.y=-40;p.x=Math.random()*window.innerWidth;}
          if(mul<0 && p.y<-40){p.y=window.innerHeight+40;p.x=Math.random()*window.innerWidth;}
        }
        p.rot+=p.rotSpeed*dt;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot*Math.PI/180);
        if(cfg.mode==='vector'){
          drawShape(p.shape,p.size,p.color);
        }else{
          ctx.fillStyle=p.color; ctx.globalAlpha=.8;
          ctx.fillRect(-p.size/2,-p.size*.2,p.size,p.size*.4);
        }
        ctx.restore();
      });
    }
    rafId=requestAnimationFrame(tick);
  }
  let rTimer;
  window.addEventListener('resize',()=>{clearTimeout(rTimer);rTimer=setTimeout(resize,200);});
  document.addEventListener('visibilitychange',()=>{paused=document.hidden;});
  resize();
  rafId=requestAnimationFrame(tick);
  window.__occSetParticles=setActiveThemes;
})();

// ── Season / occasion detection + theme application ──
(function(){
  function gJDN(y,m,d){
    const a=Math.floor((14-m)/12), y2=y+4800-a, m2=m+12*a-3;
    return d+Math.floor((153*m2+2)/5)+365*y2+Math.floor(y2/4)-Math.floor(y2/100)+Math.floor(y2/400)-32045;
  }
  // Tabular (civil) Hijri conversion — approximate; may differ ±1 day from
  // the officially announced Egyptian Islamic calendar (moon-sighting based).
  function jdnToHijri(jdn){
    const l0=jdn-1948440+10632;
    const n=Math.floor((l0-1)/10631);
    let l=l0-10631*n+354;
    const j=(Math.floor((10985-l)/5316))*(Math.floor((50*l)/17719))+(Math.floor(l/5670))*(Math.floor((43*l)/15238));
    l=l-(Math.floor((30-j)/15))*(Math.floor((17719*j)/50))-(Math.floor(j/16))*(Math.floor((15238*j)/43))+29;
    const month=Math.floor((24*l)/709);
    const day=l-Math.floor((709*month)/24);
    const year=30*n+j-30;
    return {year,month,day};
  }
  function gregorianToHijri(date){ return jdnToHijri(gJDN(date.getFullYear(),date.getMonth()+1,date.getDate())); }
  function orthodoxEasterUTC(year){
    const a=year%4,b=year%7,c=year%19;
    const d=(19*c+15)%30, e=(2*a+4*b-d+34)%7;
    const month=Math.floor((d+e+114)/31), day=((d+e+114)%31)+1;
    const jd=new Date(Date.UTC(year,month-1,day));
    jd.setUTCDate(jd.getUTCDate()+13); // Julian → Gregorian offset
    return jd;
  }
  function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
  function getSeason(date){
    const md=(date.getMonth()+1)*100+date.getDate();
    if(md>=1221||md<=320) return 'winter';
    if(md>=321&&md<=620) return 'spring';
    if(md>=621&&md<=922) return 'summer';
    return 'autumn';
  }

  const OCCASIONS=[
    {id:'eid-fitr', pr:12, ar:'عيد الفطر المبارك 🎉', en:'Eid al-Fitr Mubarak 🎉', emoji:'🎉',
      match:(d,h)=> (h.month===10&&h.day<=3)||(h.month===9&&h.day>=29)},
    {id:'eid-adha', pr:12, ar:'عيد الأضحى المبارك', en:'Eid al-Adha Mubarak', emoji:'🌙',
      match:(d,h)=> h.month===12&&h.day>=9&&h.day<=13},
    {id:'ramadan', pr:10, ar:'رمضان كريم 🌙', en:'Ramadan Kareem 🌙', emoji:'🌙',
      match:(d,h)=> h.month===9},
    {id:'hijri-newyear', pr:9, ar:'رأس السنة الهجرية', en:'Islamic New Year', emoji:'🌙',
      match:(d,h)=> h.month===1&&h.day===1},
    {id:'mawlid', pr:9, ar:'المولد النبوي الشريف', en:"The Prophet's Birthday", emoji:'🕌',
      match:(d,h)=> h.month===3&&h.day===12},
    {id:'newyear', pr:8, ar:'كل عام وأنتم بخير 🎆', en:'Happy New Year 🎆', emoji:'🎆',
      match:(d)=> (d.getMonth()===11&&d.getDate()>=31)||(d.getMonth()===0&&d.getDate()<=2)},
    {id:'christmas', pr:8, ar:'عيد ميلاد مجيد', en:'Merry Christmas', emoji:'✝️',
      match:(d)=> d.getMonth()===0&&d.getDate()===7},
    {id:'police-day', pr:7, ar:'عيد الشرطة وثورة 25 يناير', en:'Police Day & Jan 25 Revolution', emoji:'🇪🇬',
      match:(d)=> d.getMonth()===0&&d.getDate()===25},
    {id:'sinai', pr:7, ar:'عيد تحرير سيناء', en:'Sinai Liberation Day', emoji:'🇪🇬',
      match:(d)=> d.getMonth()===3&&d.getDate()===25},
    {id:'labour-day', pr:7, ar:'عيد العمال', en:'Labour Day', emoji:'⚙️',
      match:(d)=> d.getMonth()===4&&d.getDate()===1},
    {id:'june30', pr:7, ar:'ثورة 30 يونيو', en:'June 30 Revolution', emoji:'🇪🇬',
      match:(d)=> d.getMonth()===5&&d.getDate()===30},
    {id:'july23', pr:7, ar:'ثورة 23 يوليو', en:'July 23 Revolution', emoji:'🇪🇬',
      match:(d)=> d.getMonth()===6&&d.getDate()===23},
    {id:'october6', pr:7, ar:'عيد القوات المسلحة', en:'Armed Forces Day', emoji:'🇪🇬',
      match:(d)=> d.getMonth()===9&&d.getDate()===6},
    {id:'sham-elnessim', pr:6, ar:'كل سنة وانتم طيبين، شم النسيم 🌼', en:'Happy Sham El Nessim 🌼', emoji:'🌼',
      match:(d,h,extra)=> extra.isSham}
  ];

  function detectOccasion(date){
    const hijri=gregorianToHijri(date);
    const easter=orthodoxEasterUTC(date.getFullYear());
    const sham=new Date(easter); sham.setUTCDate(sham.getUTCDate()+1);
    const extra={isSham:sameDay(date,sham)};
    const matches=OCCASIONS.filter(o=>o.match(date,hijri,extra));
    if(!matches.length) return null;
    matches.sort((a,b)=>b.pr-a.pr);
    return matches[0];
  }

  const SEASON_PARTICLES={
    summer:{mode:'vector',shapes:['cloud'],colors:['rgba(200,196,214,.5)','rgba(220,216,232,.4)'],count:5,dir:'side',speed:[6,14],size:[40,70],sway:0},
    autumn:{mode:'vector',shapes:['leaf'],colors:['#c9743a','#d9962f','#b5542e','#e0a856'],count:16,dir:'down',speed:[18,34],size:[14,22],sway:40},
    winter:{mode:'vector',shapes:['snow'],colors:['#f4f7ff','#e3ecff'],count:26,dir:'down',speed:[14,26],size:[8,15],sway:26},
    spring:{mode:'vector',shapes:['petal','butterfly'],colors:['#f2b8c6','#e8a3c2','#f6cdd6','#c9a36a'],count:14,dir:'up',speed:[16,30],size:[10,17],sway:30}
  };
  const OCCASION_PARTICLES={
    'eid-fitr':{mode:'shape',count:26,dir:'down',speed:[10,20],size:[6,11],colors:['#c9a36a','#e08aa6','#8b5cf6','#f4f7ff']},
    'eid-adha':{mode:'vector',shapes:['sparkle'],colors:['#d9b888','#e8cfa0'],count:14,dir:'down',speed:[16,28],size:[7,11],sway:20},
    'ramadan':{mode:'vector',shapes:['sparkle'],colors:['#d9b888','#c9a36a'],count:10,dir:'down',speed:[20,32],size:[6,9],sway:14},
    'hijri-newyear':{mode:'vector',shapes:['sparkle'],colors:['#d9b888','#c9a3e8'],count:8,dir:'down',speed:[20,32],size:[6,9],sway:14},
    'mawlid':{mode:'vector',shapes:['sparkle'],colors:['#d9b888','#c9a36a'],count:10,dir:'down',speed:[20,32],size:[6,9],sway:14},
    'newyear':{mode:'shape',count:30,dir:'down',speed:[9,18],size:[6,12],colors:['#d9b888','#e08aa6','#8b5cf6','#f4f7ff']},
    'christmas':{mode:'vector',shapes:['snow','sparkle'],colors:['#f4f7ff','#d9b888'],count:20,dir:'down',speed:[14,24],size:[8,14],sway:22},
    'police-day':{mode:'shape',count:24,dir:'down',speed:[10,20],size:[6,11],colors:['#c9302c','#ffffff','#111111']},
    'sinai':{mode:'shape',count:20,dir:'down',speed:[10,20],size:[6,11],colors:['#c9302c','#ffffff','#111111']},
    'labour-day':{mode:'shape',count:16,dir:'down',speed:[10,18],size:[6,10],colors:['#c9302c','#ffffff','#111111']},
    'june30':{mode:'shape',count:26,dir:'down',speed:[9,18],size:[6,12],colors:['#c9302c','#ffffff','#111111']},
    'july23':{mode:'shape',count:26,dir:'down',speed:[9,18],size:[6,12],colors:['#c9302c','#ffffff','#111111']},
    'october6':{mode:'shape',count:26,dir:'down',speed:[9,18],size:[6,12],colors:['#c9302c','#ffffff','#111111']},
    'sham-elnessim':{mode:'vector',shapes:['petal','leaf'],colors:['#7fbf5f','#f2c14e','#f2b8c6'],count:16,dir:'up',speed:[16,28],size:[12,18],sway:26}
  };

  function showBanner(occ){
    const key='occDismiss:'+occ.id+':'+new Date().toDateString();
    if(sessionStorage.getItem(key)) return;
    const banner=document.getElementById('occBanner');
    if(!banner) return;
    const isAr=document.body.classList.contains('lang-ar');
    document.getElementById('occBannerEmoji').textContent=occ.emoji;
    document.getElementById('occBannerText').textContent=isAr?occ.ar:occ.en;
    requestAnimationFrame(()=>banner.classList.add('show'));
    const hide=()=>{banner.classList.remove('show');sessionStorage.setItem(key,'1');};
    document.getElementById('occBannerClose').onclick=hide;
    setTimeout(hide,9000);
  }

  function applyOccasionTheme(){
    const now=new Date();
    document.body.className=document.body.className
      .replace(/\bseason-\S+/g,'')
      .replace(/\boccasion-\S+/g,'')
      .trim();
    const season = window.__citySeason || getSeason(now);
    document.body.classList.add('season-'+season);
    const occ=detectOccasion(now);
    const configs=[SEASON_PARTICLES[season]];
    if(occ){
      document.body.classList.add('occasion-'+occ.id);
      configs.push(OCCASION_PARTICLES[occ.id]);
      showBanner(occ);
    }
    if(window.__occSetParticles) window.__occSetParticles(configs);
  }
  window.applyOccasionTheme=applyOccasionTheme;

  window.addEventListener('load', () => (window.whenIdle||setTimeout)(applyOccasionTheme, 1300));
  setInterval(applyOccasionTheme, 60*60*1000); // safety re-check, e.g. across midnight
})();

