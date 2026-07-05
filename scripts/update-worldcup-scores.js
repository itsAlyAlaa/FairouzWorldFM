// update-worldcup-scores.js
//
// السكريبت ده بيشتغل تلقائيًا عن طريق GitHub Actions كل 15 دقيقة.
// وظيفته: يسأل API-Football عن نتايج مباريات كأس العالم 2026، ولو لقى
// مباراة "scheduled" في index.html فعليًا خلصت، يحدّثها لـ "final" ويكتب
// النتيجة، من غير ما يلمس أي حاجة تانية في الملف.

const fs = require('fs');

const API_KEY = process.env.API_FOOTBALL_KEY;
const HTML_PATH = 'index.html';
const LEAGUE_ID = 1;      // FIFA World Cup في API-Football
const SEASON = 2026;

if (!API_KEY) {
  console.error('❌ لم يتم العثور على API_FOOTBALL_KEY في الـ secrets. راجع خطوات الإعداد.');
  process.exit(1);
}

// خريطة: كود الفريق في موقعك -> الأسماء المحتملة لنفس الفريق في API-Football
// (بأحرف صغيرة، عشان المقارنة تتجاهل حالة الأحرف)
const TEAM_ALIASES = {
  RSA: ['south africa'],
  CAN: ['canada'],
  BRA: ['brazil'],
  JPN: ['japan'],
  GER: ['germany'],
  PAR: ['paraguay'],
  NED: ['netherlands', 'holland'],
  MAR: ['morocco'],
  CIV: ['ivory coast', "cote d'ivoire", 'côte d’ivoire'],
  NOR: ['norway'],
  FRA: ['france'],
  SWE: ['sweden'],
  MEX: ['mexico'],
  ECU: ['ecuador'],
  ENG: ['england'],
  COD: ['dr congo', 'congo dr', 'democratic republic of the congo'],
  BEL: ['belgium'],
  SEN: ['senegal'],
  USA: ['usa', 'united states', 'united states of america'],
  BIH: ['bosnia and herzegovina', 'bosnia & herzegovina', 'bosnia'],
  ESP: ['spain'],
  AUT: ['austria'],
  POR: ['portugal'],
  CRO: ['croatia'],
  SUI: ['switzerland'],
  DZA: ['algeria'],
  AUS: ['australia'],
  EGY: ['egypt'],
  ARG: ['argentina'],
  CPV: ['cape verde', 'cabo verde'],
  COL: ['colombia'],
  GHA: ['ghana'],
};

function normalize(name) {
  return name.toLowerCase().trim();
}

function matchesTeam(code, apiName) {
  const aliases = TEAM_ALIASES[code];
  if (!aliases) return false;
  const n = normalize(apiName);
  return aliases.includes(n);
}

async function fetchFixtures() {
  // بنجيب مباريات يومين (إمبارح + النهارده بتوقيت UTC) عشان نغطي أي
  // مباراة وقتها بيعدي منتصف الليل بتوقيت UTC، بطلب واحد بس يوميًا للحدود المجانية.
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const url = `https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${SEASON}&from=${fmt(yesterday)}&to=${fmt(today)}`;

  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!res.ok) {
    throw new Error(`API-Football رجّع خطأ: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.response || [];
}

function parseMatchesArray(html) {
  const startMarker = 'const WC_MATCHES = [';
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error('مقدرش ألاقي WC_MATCHES في index.html');
  const arrEnd = html.indexOf('\n];', start);
  if (arrEnd === -1) throw new Error('مقدرش ألاقي نهاية مصفوفة WC_MATCHES');

  const arrText = html.slice(start + startMarker.length - 1, arrEnd + 2); // يشمل [ ... ]
  // eslint-disable-next-line no-new-func
  const matches = new Function(`return ${arrText}`)();

  return { matches, sliceStart: start, sliceEnd: arrEnd + 3 };
}

function serializeMatch(m) {
  const parts = [`id:'${m.id}'`];
  parts.push(`stage:{en:'${m.stage.en}',ar:'${m.stage.ar}'}`);
  parts.push(`home:'${m.home}'`);
  parts.push(`away:'${m.away}'`);
  parts.push(`kickoff:'${m.kickoff}'`);
  parts.push(`status:'${m.status}'`);
  if (m.score) parts.push(`score:{home:${m.score.home},away:${m.score.away}}`);
  if (m.note) parts.push(`note:{en:'${m.note.en}',ar:'${m.note.ar}'}`);
  if (typeof m.free === 'boolean') parts.push(`free:${m.free}`);
  if (m.channels) parts.push(`channels:[${m.channels.map((c) => `'${c}'`).join(',')}]`);
  if ('winner' in m) parts.push(`winner:${m.winner === null ? 'null' : `'${m.winner}'`}`);
  return `  {${parts.join(',')}}`;
}

function serializeArray(matches) {
  return `const WC_MATCHES = [\n${matches.map(serializeMatch).join(',\n')}\n];`;
}

async function main() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const { matches, sliceStart, sliceEnd } = parseMatchesArray(html);

  const pending = matches.filter((m) => m.status === 'scheduled' && new Date(m.kickoff) < new Date());

  if (pending.length === 0) {
    console.log('✅ مفيش مباريات مستنية نتيجة دلوقتي. مفيش داعي نسأل الـ API.');
    return;
  }

  console.log(`🔎 فيه ${pending.length} مباراة مستنية نتيجة. بنسأل API-Football...`);
  const fixtures = await fetchFixtures();

  let changed = false;

  for (const m of pending) {
    const fx = fixtures.find((f) => {
      const h = f.teams.home.name;
      const a = f.teams.away.name;
      return (
        (matchesTeam(m.home, h) && matchesTeam(m.away, a)) ||
        (matchesTeam(m.home, a) && matchesTeam(m.away, h))
      );
    });

    if (!fx) continue;

    const status = fx.fixture.status.short; // FT, AET, PEN, NS, 1H, 2H, HT...
    const finishedStatuses = ['FT', 'AET', 'PEN'];
    if (!finishedStatuses.includes(status)) continue;

    // تحديد مين هوم ومين اواي حسب ترتيب API (ممكن يكون معكوس عن عندنا)
    const apiHomeIsOurHome = matchesTeam(m.home, fx.teams.home.name);
    const homeGoals = apiHomeIsOurHome ? fx.goals.home : fx.goals.away;
    const awayGoals = apiHomeIsOurHome ? fx.goals.away : fx.goals.home;

    m.status = 'final';
    m.score = { home: homeGoals, away: awayGoals };

    if (status === 'PEN' && fx.score && fx.score.penalty) {
      const penHome = apiHomeIsOurHome ? fx.score.penalty.home : fx.score.penalty.away;
      const penAway = apiHomeIsOurHome ? fx.score.penalty.away : fx.score.penalty.home;
      const winnerCode = penHome > penAway ? m.home : m.away;
      const winnerName = winnerCode; // ممكن تستبدلها باسم الفريق لو حابب
      m.note = {
        en: `${winnerName} won ${Math.max(penHome, penAway)}-${Math.min(penHome, penAway)} on penalties`,
        ar: `${winnerName} فازت بركلات الترجيح`,
      };
    }

    console.log(`🟢 تحديث: ${m.home} ${homeGoals}-${awayGoals} ${m.away} (${m.id})`);
    changed = true;
  }

  if (!changed) {
    console.log('ℹ️ لسه مفيش نتايج نهائية جديدة.');
    return;
  }

  const newArrText = serializeArray(matches);
  const newHtml = html.slice(0, sliceStart) + newArrText + html.slice(sliceEnd);
  fs.writeFileSync(HTML_PATH, newHtml, 'utf8');
  console.log('💾 تم تحديث index.html بنجاح.');
}

main().catch((err) => {
  console.error('❌ حصل خطأ:', err.message);
  process.exit(1);
});
