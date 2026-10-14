(function () {
  var lastLang = 'sl';
  var hashWired = false;

  var STRINGS = {
    sl: {
      hint: 'Zapeljite čez kategorijo za podkategorije',
      more: 'in več',
      home: 'Najem',
      all: 'Vse',
      items: 'Število artiklov',
      subsNav: 'Podkategorije',
      manufacturer: 'Proizvajalec',
      name: 'Naziv',
      other: 'Ostala oprema',
      empty: 'V tej podkategoriji trenutno ni objavljene opreme. Pokličite nas — prek mreže partnerjev jo pogosto vseeno priskrbimo.',
      ask: 'Pošljite povpraševanje →'
    },
    en: {
      hint: 'Hover a category to see its subcategories',
      more: 'and more',
      home: 'Rental',
      all: 'All',
      items: 'Items',
      subsNav: 'Subcategories',
      manufacturer: 'Manufacturer',
      name: 'Model',
      other: 'Other equipment',
      empty: 'No equipment is listed in this subcategory yet. Get in touch — through our partner network we can often still source it.',
      ask: 'Send an enquiry →'
    }
  };
  function t(lang, key) { return (STRINGS[lang] || STRINGS.sl)[key]; }

  function catName(cat, lang) { return lang === 'en' ? cat.en : cat.sl; }
  function subName(sub, lang) { return lang === 'en' ? sub.en : sub.sl; }

  function najemPrefix() {
    return document.getElementById('najem-categories') ? '' : 'najem.html';
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // ---------- Equipment data (js/equipment.js, rows: [ids, code, group, manufacturer, name]) ----------
  var equipIndex = null;
  function itemsFor(code) {
    if (!equipIndex) {
      equipIndex = {};
      (window.EQUIPMENT || []).forEach(function (row) {
        (equipIndex[row[1]] = equipIndex[row[1]] || []).push({ group: row[2], manufacturer: row[3], name: row[4] });
      });
    }
    return equipIndex[code] || [];
  }
  function countForCategory(cat) {
    return cat.subcategories.reduce(function (sum, sub) { return sum + itemsFor(sub.code).length; },
      itemsFor(cat.code).length);
  }

  var CARD_PREVIEW_COUNT = 2;

  function buildCategoryCard(cat, lang, href) {
    var a = el('a', 'cat-card');
    a.href = href;

    var head = el('div', 'cat-card-head');
    head.appendChild(el('h3', null, catName(cat, lang)));
    a.appendChild(head);

    var ul = el('ul', 'cat-card-subs');
    cat.subcategories.slice(0, CARD_PREVIEW_COUNT).forEach(function (sub) {
      ul.appendChild(el('li', null, subName(sub, lang)));
    });
    if (cat.subcategories.length > CARD_PREVIEW_COUNT) {
      ul.appendChild(el('li', 'cat-card-more', t(lang, 'more')));
    }
    a.appendChild(ul);

    return a;
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
    flyout.appendChild(el('div', 'nav-mega-flyout-hint', t(lang, 'hint')));
    flyout.classList.remove('active');
  }

  function showFlyout(flyout, cat, lang, prefix) {
    if (!flyout) return;
    flyout.innerHTML = '';
    flyout.appendChild(el('div', 'nav-mega-flyout-label', catName(cat, lang)));
    var ul = document.createElement('ul');
    cat.subcategories.forEach(function (sub) {
      var li = document.createElement('li');
      var a = el('a', null, subName(sub, lang));
      a.href = prefix + '#sub-' + sub.code;
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
        var a = el('a', null, catName(cat, lang));
        a.href = prefix + '#kat-' + cat.code;
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
    var grid = el('div', 'cat-grid');
    window.CATEGORIES.forEach(function (cat) {
      grid.appendChild(buildCategoryCard(cat, lang, '#kat-' + cat.code));
    });
    container.appendChild(grid);
  }

  // ---------- Category / subcategory view ----------
  function buildBreadcrumb(cat, sub, lang) {
    var nav = el('nav', 'najem-crumbs');
    nav.setAttribute('aria-label', 'Breadcrumb');

    var home = el('a', null, t(lang, 'home'));
    home.href = '#';
    home.addEventListener('click', function (e) {
      e.preventDefault();
      try { history.pushState('', document.title, window.location.pathname + window.location.search); } catch (e2) {}
      renderNajemPage(lang);
      scrollToCatalogTop();
    });
    nav.appendChild(home);
    nav.appendChild(el('span', 'najem-crumb-sep', '/'));

    if (sub) {
      var catLink = el('a', null, catName(cat, lang));
      catLink.href = '#kat-' + cat.code;
      nav.appendChild(catLink);
      nav.appendChild(el('span', 'najem-crumb-sep', '/'));
    }
    var current = el('span', null, sub ? subName(sub, lang) : catName(cat, lang));
    current.setAttribute('aria-current', 'page');
    nav.appendChild(current);
    return nav;
  }

  function buildChip(label, count, href, active) {
    var a = el('a', 'subcategory-chip' + (active ? ' active' : '') + (count ? '' : ' is-empty'));
    a.href = href;
    if (active) a.setAttribute('aria-current', 'page');
    a.appendChild(el('span', 'chip-label', label));
    a.appendChild(el('span', 'chip-count', String(count)));
    return a;
  }

  function buildEquipTable(items, lang) {
    var table = el('table', 'equip-table');
    var headRow = table.createTHead().insertRow();
    [t(lang, 'manufacturer'), t(lang, 'name')].forEach(function (label) {
      var th = el('th', null, label);
      th.scope = 'col';
      headRow.appendChild(th);
    });

    // Rows arrive ordered: ungrouped first, then each group in turn.
    var order = [], byGroup = {};
    items.forEach(function (item) {
      var key = item.group || '';
      if (!byGroup[key]) { byGroup[key] = []; order.push(key); }
      byGroup[key].push(item);
    });

    order.forEach(function (key) {
      var tbody = document.createElement('tbody');
      if (key) {
        var th = el('th');
        th.colSpan = 2;
        th.scope = 'rowgroup';
        th.appendChild(el('span', null, key));
        th.appendChild(el('span', 'equip-group-count', String(byGroup[key].length)));
        var groupRow = tbody.insertRow();
        groupRow.className = 'equip-group-row';
        groupRow.appendChild(th);
      }
      byGroup[key].forEach(function (item) {
        var tr = tbody.insertRow();
        tr.appendChild(el('td', 'equip-manufacturer', item.manufacturer || '—'));
        tr.appendChild(el('td', 'equip-name', item.name));
      });
      table.appendChild(tbody);
    });
    return table;
  }

  function buildEquipSection(title, href, items, lang) {
    var section = el('section', 'equip-section');
    var h3 = el('h3', 'equip-section-title');
    if (href) {
      var a = el('a', null, title);
      a.href = href;
      h3.appendChild(a);
    } else {
      h3.appendChild(el('span', null, title));
    }
    h3.appendChild(el('span', 'equip-count', String(items.length)));
    section.appendChild(h3);

    if (items.length) {
      section.appendChild(buildEquipTable(items, lang));
    } else {
      var empty = el('div', 'equip-empty');
      empty.appendChild(el('p', null, t(lang, 'empty')));
      var ask = el('a', null, t(lang, 'ask'));
      ask.href = 'index.html#contact';
      empty.appendChild(ask);
      section.appendChild(empty);
    }
    return section;
  }

  function renderCategoryDetail(container, cat, lang, subCode) {
    var sub = subCode ? cat.subcategories.find(function (s) { return s.code === subCode; }) : null;

    container.appendChild(buildBreadcrumb(cat, sub, lang));

    var head = el('div', 'najem-head');
    head.appendChild(el('h2', 'category-title', catName(cat, lang)));
    head.appendChild(el('div', 'najem-meta', t(lang, 'items') + ': ' + countForCategory(cat)));
    container.appendChild(head);

    var chips = el('nav', 'subcategory-grid');
    chips.setAttribute('aria-label', t(lang, 'subsNav'));
    chips.appendChild(buildChip(t(lang, 'all'), countForCategory(cat), '#kat-' + cat.code, !sub));
    cat.subcategories.forEach(function (s) {
      chips.appendChild(buildChip(subName(s, lang), itemsFor(s.code).length, '#sub-' + s.code, sub === s));
    });
    container.appendChild(chips);

    var sections = el('div', 'equip-sections');
    if (sub) {
      sections.appendChild(buildEquipSection(subName(sub, lang), null, itemsFor(sub.code), lang));
    } else {
      cat.subcategories.forEach(function (s) {
        var items = itemsFor(s.code);
        if (items.length) sections.appendChild(buildEquipSection(subName(s, lang), '#sub-' + s.code, items, lang));
      });
      var other = itemsFor(cat.code);
      if (other.length) sections.appendChild(buildEquipSection(t(lang, 'other'), null, other, lang));
      if (!sections.children.length) sections.appendChild(buildEquipSection(catName(cat, lang), null, [], lang));
    }
    container.appendChild(sections);
  }

  // After switching views, bring the top of the catalog back into view if the user had scrolled past it.
  function scrollToCatalogTop() {
    var container = document.getElementById('najem-categories');
    if (!container) return;
    var header = document.querySelector('.site-top');
    var top = container.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0) - 24;
    if (window.pageYOffset > top) window.scrollTo(0, top);
  }

  function wireHashListener() {
    if (hashWired) return;
    hashWired = true;
    window.addEventListener('hashchange', function () {
      renderNajemPage(lastLang);
      scrollToCatalogTop();
    });
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
      container.appendChild(buildCategoryCard(cat, lang, 'najem.html#kat-' + cat.code));
    });
  }

  window.renderCatalog = function (lang) {
    lastLang = lang;
    renderNavCatalog(lang);
    renderNajemPage(lang);
    renderHomeCategories(lang);
  };
})();
