(function () {
  function catName(cat, lang) { return lang === 'en' ? cat.en : cat.sl; }
  function subName(sub, lang) { return lang === 'en' ? sub.en : sub.sl; }

  function najemPrefix() {
    return document.getElementById('najem-categories') ? '' : 'najem.html';
  }

  function hintText(lang) {
    return lang === 'en' ? 'Hover a category to see its subcategories' : 'Zapeljite čez kategorijo za podkategorije';
  }

  function resetFlyout(flyout, lang) {
    if (!flyout) return;
    flyout.innerHTML = '';
    var hint = document.createElement('div');
    hint.className = 'nav-mega-flyout-hint';
    hint.textContent = hintText(lang);
    flyout.appendChild(hint);
    flyout.classList.remove('active');
  }

  function showFlyout(flyout, cat, lang, prefix) {
    if (!flyout) return;
    flyout.innerHTML = '';
    var label = document.createElement('div');
    label.className = 'nav-mega-flyout-label';
    label.textContent = catName(cat, lang);
    flyout.appendChild(label);
    var ul = document.createElement('ul');
    cat.subcategories.forEach(function (sub) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = prefix + '#sub-' + sub.code;
      a.textContent = subName(sub, lang);
      li.appendChild(a);
      ul.appendChild(li);
    });
    flyout.appendChild(ul);
    flyout.classList.add('active');
  }

  function renderNavCatalog(lang) {
    if (!window.CATEGORIES) return;
    var prefix = najemPrefix();
    document.querySelectorAll('.nav-mega-catalog').forEach(function (panel) {
      var list = panel.querySelector('.nav-cat-list');
      var flyout = panel.querySelector('.nav-mega-flyout');
      if (!list) return;
      list.innerHTML = '';
      window.CATEGORIES.forEach(function (cat) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = prefix + '#kat-' + cat.code;
        a.textContent = catName(cat, lang);
        a.addEventListener('mouseenter', function () { showFlyout(flyout, cat, lang, prefix); });
        a.addEventListener('focus', function () { showFlyout(flyout, cat, lang, prefix); });
        li.appendChild(a);
        list.appendChild(li);
      });
      resetFlyout(flyout, lang);
      if (!panel.dataset.leaveWired) {
        panel.dataset.leaveWired = '1';
        var dropdown = panel.closest('.nav-dropdown');
        if (dropdown) {
          dropdown.addEventListener('mouseleave', function () { resetFlyout(flyout, lang); });
        }
      }
    });
  }

  function renderNajemPage(lang) {
    var container = document.getElementById('najem-categories');
    if (!container || !window.CATEGORIES) return;
    container.innerHTML = '';
    window.CATEGORIES.forEach(function (cat) {
      var section = document.createElement('div');
      section.className = 'category-block';
      section.id = 'kat-' + cat.code;

      var h2 = document.createElement('h2');
      h2.className = 'category-title';
      h2.textContent = catName(cat, lang);
      section.appendChild(h2);

      var grid = document.createElement('div');
      grid.className = 'subcategory-grid';
      cat.subcategories.forEach(function (sub) {
        var chip = document.createElement('div');
        chip.className = 'subcategory-chip';
        chip.id = 'sub-' + sub.code;
        chip.textContent = subName(sub, lang);
        grid.appendChild(chip);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  window.renderCatalog = function (lang) {
    renderNavCatalog(lang);
    renderNajemPage(lang);
  };
})();
