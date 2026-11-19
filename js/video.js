// Click-to-play YouTube videos (.video-embed[data-youtube]). The page shows only a
// thumbnail; YouTube's player (privacy-enhanced youtube-nocookie.com) loads when the
// visitor presses play. Without JavaScript the link simply opens the video on YouTube.
(function () {
  function playLabel() {
    var dict = window.TRANSLATIONS && window.TRANSLATIONS[document.documentElement.lang];
    return (dict && dict['hero.videoPlay']) || 'Play video';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var embeds = document.querySelectorAll('.video-embed[data-youtube]');
    function label() {
      embeds.forEach(function (a) { a.setAttribute('aria-label', playLabel()); });
    }
    label();
    new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  });

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('.video-embed[data-youtube]');
    if (!link) return;
    e.preventDefault();
    var img = link.querySelector('img');
    var frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(link.getAttribute('data-youtube')) +
      '?autoplay=1&rel=0&hl=' + (document.documentElement.lang === 'en' ? 'en' : 'sl');
    frame.title = img ? img.alt : '';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    frame.className = 'video-embed-frame';
    link.replaceWith(frame);
    frame.focus();
  });
})();
