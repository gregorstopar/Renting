// Photo viewer for reference galleries (.ref-gallery). Each thumbnail links to
// its full-size photo, so without JavaScript the links simply open the image.
(function () {
  var LABELS = {
    sl: { close: 'Zapri', prev: 'Prejšnja fotografija', next: 'Naslednja fotografija' },
    en: { close: 'Close', prev: 'Previous photo', next: 'Next photo' }
  };
  var dialog, photo, caption, counter, items = [], index = 0;

  function labels() { return LABELS[document.documentElement.lang === 'en' ? 'en' : 'sl']; }

  function button(className, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.addEventListener('click', onClick);
    return b;
  }

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    var figure = document.createElement('figure');
    figure.className = 'lightbox-figure';
    photo = document.createElement('img');
    caption = document.createElement('figcaption');
    counter = document.createElement('span');
    counter.className = 'lightbox-counter';
    figure.appendChild(photo);
    figure.appendChild(caption);
    dialog.appendChild(button('lightbox-close', function () { dialog.close(); }));
    dialog.appendChild(button('lightbox-prev', function () { show(index - 1); }));
    dialog.appendChild(figure);
    dialog.appendChild(button('lightbox-next', function () { show(index + 1); }));
    dialog.appendChild(counter);
    // A click on the dark backdrop (outside the photo and buttons) closes the viewer.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    document.body.appendChild(dialog);
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var link = items[index];
    var thumb = link.querySelector('img');
    photo.src = link.href;
    photo.alt = thumb ? thumb.alt : '';
    caption.textContent = photo.alt;
    counter.textContent = (index + 1) + ' / ' + items.length;
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('.ref-gallery a');
    if (!link || typeof HTMLDialogElement === 'undefined') return;
    e.preventDefault();
    if (!dialog) build();
    var text = labels();
    dialog.querySelector('.lightbox-close').setAttribute('aria-label', text.close);
    dialog.querySelector('.lightbox-prev').setAttribute('aria-label', text.prev);
    dialog.querySelector('.lightbox-next').setAttribute('aria-label', text.next);
    items = Array.prototype.slice.call(link.closest('.ref-gallery').querySelectorAll('a'));
    var single = items.length < 2;
    dialog.querySelector('.lightbox-prev').hidden = single;
    dialog.querySelector('.lightbox-next').hidden = single;
    counter.hidden = single;
    show(items.indexOf(link));
    dialog.showModal();
  });
})();
