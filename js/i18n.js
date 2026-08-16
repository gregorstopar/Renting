(function () {
  function applyLang(lang) {
    var dict = window.TRANSLATIONS && window.TRANSLATIONS[lang];
    if (!dict) return;
    document.documentElement.setAttribute('lang', lang);
    if (dict['meta.title']) document.title = dict['meta.title'];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    if (typeof window.renderCatalog === 'function') window.renderCatalog(lang);
    try { localStorage.setItem('renting-lang', lang); } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { applyLang(btn.getAttribute('data-lang')); });
    });
    var savedLang = 'sl';
    try { savedLang = localStorage.getItem('renting-lang') || 'sl'; } catch (e) {}
    applyLang(savedLang);
  });

  window.applyLang = applyLang;
})();
