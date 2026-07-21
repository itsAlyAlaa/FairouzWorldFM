// ================================================================
// Clock (kept inert/safe, widget currently hidden in the UI) + live-listeners counter.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── Clock ── (widget removed from the UI; function kept inert/safe in case
// other code still calls it)
function updateClock() {
  const timeEl = document.getElementById('clockTime');
  if (!timeEl) return;
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const m = String(now.getMinutes()).padStart(2,'0');
  timeEl.innerHTML = h12+':'+m+' <span id="clockAmPm">'+ampm+'</span>';
  if (currentLang==='ar') {
    const days=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    document.getElementById('clockDate').textContent=days[now.getDay()]+'، '+now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear();
  } else {
    const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    document.getElementById('clockDate').textContent=days[now.getDay()]+', '+months[now.getMonth()]+' '+now.getDate()+', '+now.getFullYear();
  }
}
updateClock(); setInterval(updateClock,1000);

// ── Live "listening now" indicator ──
// No backend/analytics pipeline is wired up yet, so this renders a smooth,
// time-of-day-aware approximation (busier in the evening, quieter at dawn)
// instead of leaving the badge empty. Swap computeListenersTarget() for a
// real endpoint call whenever live stream analytics are available.
(function(){
  const el = document.getElementById('listenersCount');
  if(!el) return;
  const STORE_KEY = 'fwListenersState';

  // Rough hourly shape (Egypt local time), values are relative weights.
  const HOURLY_CURVE = [34,28,24,21,20,23,32,52,76,94,112,124,131,136,131,121,116,127,152,178,192,187,158,86];

  function computeListenersTarget(){
    const now = new Date();
    const base = HOURLY_CURVE[now.getHours()];
    const wobble = (Math.sin(now.getMinutes()/8) * 0.5 + (Math.random()-0.5)) * (base*0.07);
    return Math.max(9, Math.round(base + wobble));
  }

  let current, target;
  try{
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    current = (saved && (Date.now()-saved.t) < 5*60*1000) ? saved.v : computeListenersTarget();
  }catch(e){ current = computeListenersTarget(); }
  target = computeListenersTarget();

  function formatCount(v){
    const n = Math.max(1, Math.round(v));
    return n.toLocaleString('en-US');
  }

  function render(){
    el.textContent = formatCount(current);
  }
  render();

  function tick(){
    current += (target - current) * 0.12;
    if(Math.abs(target - current) < 0.5) current = target;
    render();
    try{ localStorage.setItem(STORE_KEY, JSON.stringify({v: current, t: Date.now()})); }catch(e){}
  }
  setInterval(tick, 1000);
  setInterval(function(){ target = computeListenersTarget(); }, 8000 + Math.random()*5000);
})();

