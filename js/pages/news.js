// ================================================================
// News page: fetches live headlines from Sky News Arabia & Al Arabiya via RSS, with CORS-proxy fallbacks.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── News: live headlines from Sky News Arabia & Al Arabiya ──
const NEWS_FEEDS = [
  { name: 'Sky News Arabia', nameAr: 'سكاي نيوز عربية', icon: '📡', url: 'https://www.skynewsarabia.com/rss.xml' },
  { name: 'Sky News Arabia', nameAr: 'سكاي نيوز عربية', icon: '📡', url: 'https://www.skynewsarabia.com/web/rss/middle-east.xml' },
  { name: 'Al Arabiya', nameAr: 'العربية', icon: '📰', url: 'https://www.alarabiya.net/feed/rss2/ar.xml' },
  { name: 'Al Arabiya', nameAr: 'العربية', icon: '📰', url: 'https://www.alarabiya.net/feed/rss2/ar/arab-and-world.xml' }
];
const NEWS_CACHE_KEY = 'fairouzNewsCacheV1';
const NEWS_MAX_AGE_MS = 15 * 60 * 1000; // refresh feeds every 15 min at most
let newsItemsCache = [];
let newsLastFetchTs = 0;
let newsAutoTimer = null;

function newsFetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { cache: 'no-store', signal: controller.signal }).finally(() => clearTimeout(timer));
}

function newsStripHtml(str) {
  if (!str) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = str;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

// Strategy 1: rss2json.com — purpose-built RSS→JSON proxy with CORS enabled, no key needed for light use
async function newsFetchViaRss2Json(feed) {
  const url = 'https://api.rss2json.com/v1/api.json?count=20&rss_url=' + encodeURIComponent(feed.url);
  const res = await newsFetchWithTimeout(url, 9000);
  if (!res.ok) throw new Error('rss2json http ' + res.status);
  const data = await res.json();
  if (data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('rss2json bad payload');
  return data.items.map(it => {
    const date = it.pubDate ? new Date(it.pubDate.replace(' ', 'T') + 'Z') : new Date();
    return {
      title: newsStripHtml(it.title || ''),
      link: it.link || '',
      desc: newsStripHtml(it.description || '').slice(0, 160),
      date: isNaN(date.getTime()) ? new Date() : date,
      source: feed,
      sourceUrl: feed.url
    };
  }).filter(it => it.title && it.link);
}

// Strategy 2/3: generic CORS proxies that hand back raw XML, which we parse ourselves
function newsCorsUrl(target, mode) {
  const enc = encodeURIComponent(target);
  return mode === 0
    ? 'https://api.allorigins.win/raw?url=' + enc
    : 'https://corsproxy.io/?url=' + enc;
}

function newsParseFeed(xmlText, source) {
  const items = [];
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    if (doc.querySelector('parsererror')) return items;
    doc.querySelectorAll('item').forEach(el => {
      const title = newsStripHtml(el.querySelector('title')?.textContent || '');
      const link = (el.querySelector('link')?.textContent || '').trim();
      const pubDateRaw = el.querySelector('pubDate')?.textContent || el.getElementsByTagName('pubDate')[0]?.textContent || '';
      const descRaw = el.querySelector('description')?.textContent || '';
      const date = pubDateRaw ? new Date(pubDateRaw) : new Date();
      if (!title || !link) return;
      items.push({
        title,
        link,
        desc: newsStripHtml(descRaw).slice(0, 160),
        date: isNaN(date.getTime()) ? new Date() : date,
        source,
        sourceUrl: source.url
      });
    });
  } catch (e) { /* ignore malformed feed */ }
  return items;
}

async function newsFetchViaXmlProxy(feed, mode) {
  const res = await newsFetchWithTimeout(newsCorsUrl(feed.url, mode), 9000);
  if (!res.ok) throw new Error('proxy http ' + res.status);
  const text = await res.text();
  if (!text || text.length < 50) throw new Error('proxy empty response');
  const items = newsParseFeed(text, feed);
  if (!items.length) throw new Error('proxy parsed 0 items');
  return items;
}

async function newsFetchViaDirect(feed) {
  const res = await newsFetchWithTimeout(feed.url, 6000);
  if (!res.ok) throw new Error('direct http ' + res.status);
  const text = await res.text();
  if (!text || text.length < 50) throw new Error('direct empty response');
  const items = newsParseFeed(text, feed);
  if (!items.length) throw new Error('direct parsed 0 items');
  return items;
}

// Try every strategy for one feed until one works; a failing feed never blocks the others
async function newsFetchFeedItems(feed) {
  const strategies = [
    () => newsFetchViaDirect(feed),
    () => newsFetchViaRss2Json(feed),
    () => newsFetchViaXmlProxy(feed, 0),
    () => newsFetchViaXmlProxy(feed, 1)
  ];
  for (const run of strategies) {
    try {
      const items = await run();
      if (items && items.length) return items;
    } catch (e) { /* try next strategy */ }
  }
  return [];
}

function newsRelativeTime(date, lang) {
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang === 'ar' ? 'ar' : 'en', { numeric: 'auto' });
  const abs = Math.abs(diffSec);
  if (abs < 60) return toLatinDigits(rtf.format(Math.round(diffSec), 'second'));
  if (abs < 3600) return toLatinDigits(rtf.format(Math.round(diffSec / 60), 'minute'));
  if (abs < 86400) return toLatinDigits(rtf.format(Math.round(diffSec / 3600), 'hour'));
  return toLatinDigits(rtf.format(Math.round(diffSec / 86400), 'day'));
}

function renderNewsList() {
  const container = document.getElementById('newsContainer');
  if (!container) return;
  const lang = currentLang;
  if (!newsItemsCache.length) {
    container.innerHTML = '<div class="news-status"><span class="ic">📭</span>' +
      (lang === 'ar'
        ? 'تعذّر تحميل الأخبار حاليًا. تفضّل بزيارة سكاي نيوز عربية أو العربية مباشرة.'
        : "Couldn't load news right now. Visit Sky News Arabia or Al Arabiya directly.") +
      '<br><br><a href="https://www.skynewsarabia.com" target="_blank" rel="noopener" style="color:var(--gold2);">skynewsarabia.com</a> · ' +
      '<a href="https://www.alarabiya.net" target="_blank" rel="noopener" style="color:var(--gold2);">alarabiya.net</a>' +
      '<br><br><button type="button" class="news-refresh-btn" onclick="fetchNews(true)"><span class="ic">🔄</span>' +
      (lang === 'ar' ? 'إعادة المحاولة' : 'Try again') + '</button></div>';
    return;
  }
  const html = newsItemsCache.slice(0, 24).map(item => {
    const sourceName = lang === 'ar' ? item.source.nameAr : item.source.name;
    return '<a class="news-card" href="' + item.link + '" target="_blank" rel="noopener">' +
      '<div class="news-card-top">' +
        '<span class="news-source-tag">' + item.source.icon + ' ' + sourceName + '</span>' +
        '<span class="news-time">' + newsRelativeTime(item.date, lang) + '</span>' +
      '</div>' +
      '<div class="news-card-title" dir="auto">' + item.title + '</div>' +
      (item.desc ? '<div class="news-card-desc" dir="auto">' + item.desc + '</div>' : '') +
      '<span class="news-card-link">' + (lang === 'ar' ? 'اقرأ المزيد ←' : 'Read more →') + '</span>' +
    '</a>';
  }).join('');
  container.innerHTML = '<div class="news-grid">' + html + '</div>';
  const updatedEl = document.getElementById('newsUpdated');
  if (updatedEl) {
    updatedEl.textContent = (lang === 'ar' ? 'آخر تحديث: ' : 'Updated: ') + newsRelativeTime(new Date(newsLastFetchTs), lang);
  }
}

async function fetchNews(force) {
  const now = Date.now();
  if (!force && newsItemsCache.length && (now - newsLastFetchTs) < NEWS_MAX_AGE_MS) {
    renderNewsList();
    return;
  }
  if (!force && !newsItemsCache.length) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(NEWS_CACHE_KEY) || 'null');
      if (cached && (now - cached.ts) < NEWS_MAX_AGE_MS) {
        newsItemsCache = cached.items.map(i => ({ ...i, date: new Date(i.date), source: NEWS_FEEDS.find(f => f.url === i.sourceUrl) || NEWS_FEEDS[0] }));
        newsLastFetchTs = cached.ts;
        renderNewsList();
        return;
      }
    } catch (e) { /* ignore bad cache */ }
  }

  const btn = document.getElementById('newsRefreshBtn');
  if (btn) btn.classList.add('spinning');

  const results = await Promise.all(NEWS_FEEDS.map(feed => newsFetchFeedItems(feed)));

  let merged = [].concat(...results);
  // de-duplicate by link
  const seen = new Set();
  merged = merged.filter(it => { if (seen.has(it.link)) return false; seen.add(it.link); return true; });
  merged.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (merged.length) {
    newsItemsCache = merged;
    newsLastFetchTs = Date.now();
    try {
      sessionStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({
        ts: newsLastFetchTs,
        items: merged.slice(0, 40).map(i => ({ title: i.title, link: i.link, desc: i.desc, date: i.date.toISOString(), sourceUrl: i.sourceUrl }))
      }));
    } catch (e) { /* storage may be full/unavailable */ }
  } else if (!newsItemsCache.length) {
    newsLastFetchTs = Date.now();
  }

  if (btn) btn.classList.remove('spinning');
  renderNewsList();
}

// Keep headlines fresh while the News page is open
if (!newsAutoTimer) {
  newsAutoTimer = setInterval(() => {
    const pageEl = document.getElementById('page-news');
    if (pageEl && !pageEl.classList.contains('page-hidden')) fetchNews(false);
  }, NEWS_MAX_AGE_MS);
}

