// ================================================================
// Generic text/number formatting helpers used across several
// modules (i18n, prayer times, World Cup, news). Pure functions,
// no dependencies, no side effects — safe to load first.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// Numbers stay in English digits everywhere on the site, even in Arabic —
// the one deliberate exception is the Hijri date, which uses toArabicIndicDigits().
function toLatinDigits(str){
  return String(str)
    .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0));
}
function toArabicIndicDigits(str){
  return String(str).replace(/[0-9]/g, d => String.fromCharCode(0x0660 + Number(d)));
}
