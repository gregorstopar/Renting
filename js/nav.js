// Phone/tablet menu: the ☰ button (.nav-toggle) opens and closes the nav links.
// Above 900px the button is hidden and the links show in the header as usual.
(function () {
  var LABELS = {
    sl: { open: 'Odpri meni', close: 'Zapri meni' },
    en: { open: 'Open menu', close: 'Close menu' }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('.site-top > header');
    var toggle = header && header.querySelector('.nav-toggle');
    if (!toggle) return;

    function label() {
      var text = LABELS[document.documentElement.lang === 'en' ? 'en' : 'sl'];
      toggle.setAttribute('aria-label', isOpen() ? text.close : text.open);
    }
    function isOpen() { return header.classList.contains('nav-open'); }
    function setOpen(open) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      label();
    }

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });
    // Choosing a link closes the menu (needed for same-page links like #contact).
    header.querySelector('.nav-links').addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !header.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width:901px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
    // Keep the button's label in the current language.
    new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    label();
  });
})();
