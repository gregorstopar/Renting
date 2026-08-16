(function () {
  var lastLang = 'sl';
  var hashWired = false;

  function catName(cat, lang) { return lang === 'en' ? cat.en : cat.sl; }
  function subName(sub, lang) { return lang === 'en' ? sub.en : sub.sl; }

  function najemPrefix() {
    return document.getElementById('najem-categories') ? '' : 'najem.html';
  }

  function hintText(lang) {
    return lang === 'en' ? 'Hover a category to see its subcategories' : 'Zapeljite čez kategorijo za podkategorije';
  }
  function subLabel(lang) {
    return lang === 'en' ? 'Subcategories' : 'Podkategorije';
  }
  function backLabel(lang) {
    return lang === 'en' ? '← Back to categories' : '← Nazaj na kategorije';
  }

  function getCategoryForSub(subCode) {
    var found = null;
    (window.CATEGORIES || []).forEach(function (cat) {
      cat.subcategories.forEach(function (sub) {
        if (sub.code === subCode) found = cat;
      });
    });
    return found;
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

  function renderCategoryGrid(container, lang) {
    var grid = document.createElement('div');
    grid.className = 'najem-category-grid';
    window.CATEGORIES.forEach(function (cat) {
      var a = document.createElement('a');
      a.className = 'najem-category-card';
      a.href = '#kat-' + cat.code;
      var h3 = document.createElement('h3');
      h3.textContent = catName(cat, lang);
      a.appendChild(h3);
      var cta = document.createElement('span');
      cta.className = 'najem-category-cta';
      cta.textContent = subLabel(lang);
      a.appendChild(cta);
      grid.appendChild(a);
    });
    container.appendChild(grid);
  }

  function renderCategoryDetail(container, cat, lang, subCode) {
    var back = document.createElement('a');
    back.className = 'najem-back';
    back.href = '#';
    back.textContent = backLabel(lang);
    back.addEventListener('click', function (e) {
      e.preventDefault();
      try { history.pushState('', document.title, window.location.pathname + window.location.search); } catch (e2) {}
      renderNajemPage(lang);
    });
    container.appendChild(back);

    var h2 = document.createElement('h2');
    h2.className = 'category-title';
    h2.textContent = catName(cat, lang);
    container.appendChild(h2);

    var grid = document.createElement('div');
    grid.className = 'subcategory-grid';
    cat.subcategories.forEach(function (sub) {
      var chip = document.createElement('div');
      chip.className = 'subcategory-chip';
      chip.id = 'sub-' + sub.code;
      if (sub.code === subCode) chip.classList.add('active');
      chip.textContent = subName(sub, lang);
      grid.appendChild(chip);
    });
    container.appendChild(grid);

    if (subCode) {
      requestAnimationFrame(function () {
        var el = document.getElementById('sub-' + subCode);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  function wireHashListener() {
    if (hashWired) return;
    hashWired = true;
    window.addEventListener('hashchange', function () { renderNajemPage(lastLang); });
  }

  function renderNajemPage(lang) {
    var container = document.getElementById('najem-categories');
    if (!container || !window.CATEGORIES) return;
    wireHashListener();
    container.innerHTML = '';

    var hash = window.location.hash.replace('#', '');
    var catCode = null, subCode = null;
    if (hash.indexOf('kat-') === 0) {
      catCode = hash.slice(4);
    } else if (hash.indexOf('sub-') === 0) {
      subCode = hash.slice(4);
      var owner = getCategoryForSub(subCode);
      if (owner) catCode = owner.code;
    }
    var cat = catCode ? window.CATEGORIES.find(function (c) { return c.code === catCode; }) : null;

    if (cat) {
      renderCategoryDetail(container, cat, lang, subCode);
    } else {
      renderCategoryGrid(container, lang);
    }
  }

  function renderHomeCategories(lang) {
    var container = document.getElementById('home-categories');
    if (!container || !window.CATEGORIES) return;
    container.innerHTML = '';
    window.CATEGORIES.forEach(function (cat) {
      var a = document.createElement('a');
      a.className = 'home-cat-card';
      a.href = 'najem.html#kat-' + cat.code;

      var h3 = document.createElement('h3');
      h3.textContent = catName(cat, lang);
      a.appendChild(h3);

      var ul = document.createElement('ul');
      ul.className = 'home-cat-list';
      cat.subcategories.forEach(function (sub) {
        var li = document.createElement('li');
        li.textContent = subName(sub, lang);
        ul.appendChild(li);
      });
      a.appendChild(ul);

      container.appendChild(a);
    });
  }

  window.renderCatalog = function (lang) {
    lastLang = lang;
    renderNavCatalog(lang);
    renderNajemPage(lang);
    renderHomeCategories(lang);
  };
})();
