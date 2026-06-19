(function () {
  var mobileButton = document.querySelector('.mobile-menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    show(0);
    schedule();
  });

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return (params.get(name) || '').trim();
  }

  var pageInput = document.querySelector('.search-page-input');
  if (pageInput) {
    var query = getQueryValue('q');
    pageInput.value = query;
    filterCards(query);
  }

  var filterInput = document.querySelector('.page-filter-input');
  var yearFilter = document.querySelector('.year-filter');
  var sortSelect = document.querySelector('.sort-select');

  if (filterInput) {
    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', function () {
      filterCards(filterInput ? filterInput.value : '');
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
  }

  document.querySelectorAll('.view-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('.view-toggle').forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      document.body.classList.toggle('list-view', button.getAttribute('data-view') === 'list');
    });
  });

  function filterCards(text) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filterable-grid .movie-card'));
    var needle = String(text || '').trim().toLowerCase();
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var hay = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchedText = !needle || hay.indexOf(needle) !== -1;
      var matchedYear = !year || cardYear === year;
      var show = matchedText && matchedYear;
      card.classList.toggle('hidden-card', !show);
      if (show) {
        visible += 1;
      }
    });

    var status = document.querySelector('.search-status');
    if (status) {
      status.textContent = needle ? '关键词“' + text + '”找到 ' + visible + ' 个结果。' : '输入关键词查找片库内容。';
    }
  }

  function sortCards() {
    var grid = document.querySelector('.filterable-grid');
    if (!grid || !sortSelect) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var mode = sortSelect.value;

    cards.sort(function (a, b) {
      if (mode === 'title') {
        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
      }
      if (mode === 'year') {
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      }
      return Number(b.getAttribute('data-heat') || 0) - Number(a.getAttribute('data-heat') || 0);
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');

    if (!video || !button) {
      return;
    }

    function loadVideo() {
      var stream = button.getAttribute('data-stream') || video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.dataset.hls = 'attached';
        } else {
          video.src = stream;
        }
        video.dataset.ready = 'true';
      }
    }

    function playVideo() {
      loadVideo();
      shell.classList.add('playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          shell.classList.remove('playing');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('playing');
      }
    });
  });
})();
