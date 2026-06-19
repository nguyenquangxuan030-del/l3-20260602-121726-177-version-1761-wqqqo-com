(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = qs('[data-nav-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;

    function render() {
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function go(step) {
      index = (index + step + slides.length) % slides.length;
      render();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(-1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        go(1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        index = i;
        render();
      });
    });
    render();
    if (slides.length > 1) {
      window.setInterval(function () {
        go(1);
      }, 5200);
    }
  }

  function matchYear(cardYear, selected) {
    var year = Number(cardYear || 0);
    if (!selected) {
      return true;
    }
    if (selected === 'before-1990') {
      return year > 0 && year < 1990;
    }
    if (selected.indexOf('-') > -1) {
      var parts = selected.split('-');
      var start = Number(parts[0]);
      var end = Number(parts[1]);
      return year >= start && year <= end;
    }
    return String(year) === selected;
  }

  function setupFilters() {
    var inputs = qsa('[data-search-input]');
    if (!inputs.length) {
      return;
    }
    var cards = qsa('[data-card]');
    var categoryFilter = qs('[data-category-filter]');
    var yearFilter = qs('[data-year-filter]');
    var count = qs('[data-result-count]');

    function apply() {
      var query = inputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(' ');
      var category = categoryFilter ? categoryFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.category,
          card.dataset.year
        ].join(' ').toLowerCase();
        var okQuery = !query || query.split(/\s+/).every(function (word) {
          return text.indexOf(word) !== -1;
        });
        var okCategory = !category || card.dataset.category === category;
        var okYear = matchYear(card.dataset.year, year);
        var show = okQuery && okCategory && okYear;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 个影片入口';
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    if (categoryFilter) {
      categoryFilter.addEventListener('change', apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }
    apply();
  }

  function setupImageFallbacks() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var holder = image.closest('.poster-frame, .detail-poster, .rank-cover, .hero-slide');
        if (holder) {
          holder.classList.add('image-error');
        }
      });
    });
  }

  function loadVideo(video) {
    if (!video || video.dataset.loaded === '1') {
      return;
    }
    var src = video.dataset.src;
    if (!src) {
      return;
    }
    video.dataset.loaded = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else {
      video.src = src;
    }
  }

  function setupPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('.video-player', shell);
      var overlay = qs('[data-play-overlay]', shell);
      if (!video) {
        return;
      }
      function play() {
        loadVideo(video);
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupImageFallbacks();
    setupPlayers();
  });
})();
