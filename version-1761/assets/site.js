(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      button.textContent = isOpen ? '×' : '☰';
    });
  }

  function initHero() {
    var root = document.querySelector('.hero-carousel');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-target')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    document.querySelectorAll('.filter-scope').forEach(function (scope) {
      var input = scope.querySelector('.filter-input');
      var selects = Array.prototype.slice.call(scope.querySelectorAll('.filter-select'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.media-card'));
      if (!cards.length) {
        return;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute('data-filter')] = select.value.trim().toLowerCase();
        });
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchFilters = Object.keys(filters).every(function (key) {
            return !filters[key] || String(card.getAttribute('data-' + key) || '').toLowerCase() === filters[key];
          });
          card.style.display = matchQuery && matchFilters ? '' : 'none';
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  }

  function initPlayers() {
    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('.movie-video');
      var overlay = shell.querySelector('.player-overlay');
      var attached = false;
      var hls = null;

      if (!video) {
        return;
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;
        var url = video.getAttribute('data-video-url');
        if (!url) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else {
          video.src = url;
        }
      }

      function play() {
        attachSource();
        shell.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (!attached) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function escapeText(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeText(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="media-card">' +
      '<a class="poster-link" href="' + escapeText(movie.url) + '" aria-label="观看' + escapeText(movie.title) + '">' +
      '<img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-hover">▶</span>' +
      '<span class="year-badge">' + escapeText(movie.year) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h2><a href="' + escapeText(movie.url) + '">' + escapeText(movie.title) + '</a></h2>' +
      '<p>' + escapeText(movie.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.type) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var container = document.querySelector('[data-search-results]');
    if (!container || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('.search-page-input');
    if (input) {
      input.value = query;
    }
    var list = window.SEARCH_INDEX;
    var normalized = query.toLowerCase();
    var result = list.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      return [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 96);
    container.innerHTML = result.map(cardTemplate).join('');
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
