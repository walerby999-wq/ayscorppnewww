/* Cuadra — consentimiento para Vercel Web Analytics y Speed Insights.
   No carga ninguna medición hasta que el visitante acepta. Elección guardada en localStorage("cuadra_consent").
   Reabrir preferencias: cualquier elemento con [data-cookie-prefs] o window.cuadraConsent.open(). */
(function () {
  var KEY = 'cuadra_consent';
  var PROD = /(^|\.)ayscorp\.online$|\.vercel\.app$/.test(location.hostname);
  var T = {
    es: { title: 'Medición anónima del sitio', text: 'Usamos Vercel Web Analytics y Speed Insights para contar visitas y medir el rendimiento. No usan cookies ni sirven para identificarte, y solo se activan si aceptas.', accept: 'Aceptar', reject: 'Rechazar', config: 'Configurar', save: 'Guardar preferencias', nec: 'Necesarias', necD: 'Idioma elegido y esta preferencia. Siempre activas.', an: 'Medición y rendimiento', anD: 'Vercel Web Analytics y Speed Insights.', policy: 'Política de cookies', policyHref: PROD ? '/politica-de-cookies' : 'politica-de-cookies.dc.html', on: 'Siempre activas' },
    en: { title: 'Anonymous site measurement', text: 'We use Vercel Web Analytics and Speed Insights to count visits and measure performance. They use no cookies, don’t identify you, and only run if you accept.', accept: 'Accept', reject: 'Reject', config: 'Settings', save: 'Save preferences', nec: 'Necessary', necD: 'Your chosen language and this preference. Always on.', an: 'Measurement & performance', anD: 'Vercel Web Analytics and Speed Insights.', policy: 'Cookie policy', policyHref: PROD ? '/cookie-policy' : 'cookie-policy.dc.html', on: 'Always on' }
  };
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var loaded = false;
  function load() {
    if (loaded || !PROD) return; loaded = true;
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    ['/_vercel/insights/script.js', '/_vercel/speed-insights/script.js'].forEach(function (src) {
      var s = document.createElement('script'); s.defer = true; s.src = src; document.head.appendChild(s);
    });
  }
  var box;
  function close() { if (box) { box.remove(); box = null; } }
  function decide(v) { set(v); close(); if (v === 'granted') load(); else if (loaded) location.reload(); }
  function btn(label, primary) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.style.cssText = 'font:500 14px/1 Geist,system-ui,sans-serif;padding:11px 16px;border-radius:10px;cursor:pointer;min-height:44px;' + (primary ? 'background:#0B1530;color:#fff;border:1px solid #0B1530' : 'background:#fff;color:#0B1530;border:1px solid #CBD2DE');
    return b;
  }
  function open(showConfig) {
    close();
    var lang = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es', t = T[lang];
    box = document.createElement('div');
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', t.title); box.setAttribute('aria-live', 'polite');
    box.style.cssText = 'position:fixed;z-index:9999;left:16px;right:16px;bottom:16px;max-width:440px;margin-left:auto;background:#fff;color:#0B1530;border:1px solid #E1E5EC;border-radius:16px;box-shadow:0 24px 60px -24px rgba(11,21,48,.4);padding:20px;font:400 14px/1.55 Geist,system-ui,sans-serif;display:flex;flex-direction:column;gap:14px';
    var h = document.createElement('strong'); h.textContent = t.title; h.style.cssText = 'font-size:15px;font-weight:600';
    var p = document.createElement('p'); p.style.cssText = 'margin:0;color:#3A465E';
    p.appendChild(document.createTextNode(t.text + ' '));
    var a = document.createElement('a'); a.href = t.policyHref; a.textContent = t.policy; a.style.color = '#2F5BFF'; p.appendChild(a);
    box.appendChild(h); box.appendChild(p);
    var cfg = document.createElement('div'); cfg.style.cssText = 'display:' + (showConfig ? 'flex' : 'none') + ';flex-direction:column;gap:10px;padding:12px;border-radius:12px;background:#F6F7F9';
    function row(title, desc, control) {
      var r = document.createElement('label'); r.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:12px;cursor:pointer';
      var tx = document.createElement('span'); tx.innerHTML = ''; var b1 = document.createElement('span'); b1.textContent = title; b1.style.cssText = 'display:block;font-weight:500'; var b2 = document.createElement('span'); b2.textContent = desc; b2.style.cssText = 'display:block;font-size:12.5px;color:#55617A';
      tx.appendChild(b1); tx.appendChild(b2); r.appendChild(tx); r.appendChild(control); return r;
    }
    var fixed = document.createElement('span'); fixed.textContent = t.on; fixed.style.cssText = 'font-size:12px;color:#55617A;white-space:nowrap;padding-top:2px';
    var chk = document.createElement('input'); chk.type = 'checkbox'; chk.checked = get() === 'granted'; chk.style.cssText = 'width:18px;height:18px;accent-color:#2F5BFF;margin-top:2px;flex-shrink:0';
    cfg.appendChild(row(t.nec, t.necD, fixed)); cfg.appendChild(row(t.an, t.anD, chk));
    box.appendChild(cfg);
    var acts = document.createElement('div'); acts.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
    var bA = btn(t.accept, true), bR = btn(t.reject, false), bC = btn(showConfig ? t.save : t.config, false);
    bA.onclick = function () { decide('granted'); };
    bR.onclick = function () { decide('denied'); };
    bC.onclick = function () {
      if (cfg.style.display === 'none') { cfg.style.display = 'flex'; bC.textContent = t.save; chk.focus(); }
      else decide(chk.checked ? 'granted' : 'denied');
    };
    acts.appendChild(bA); acts.appendChild(bR); acts.appendChild(bC); box.appendChild(acts);
    document.body.appendChild(box);
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape' && get()) close(); });
  }
  window.cuadraConsent = { open: function () { open(true); }, get: get };
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('[data-cookie-prefs]');
    if (el) { e.preventDefault(); open(true); }
  });
  function init() { var c = get(); if (c === 'granted') load(); else if (!c) open(false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
