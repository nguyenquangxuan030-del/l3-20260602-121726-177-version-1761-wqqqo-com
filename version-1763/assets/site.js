(function() {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function() {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;
  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }
  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      showHero(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function() {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function applyFilter(input) {
    var value = (input.value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    cards.forEach(function(card) {
      var text = card.getAttribute('data-search') || '';
      card.classList.toggle('hidden-card', value && text.indexOf(value) === -1);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var queryInput = document.querySelector('.search-query');
  if (queryInput) {
    queryInput.value = q;
    applyFilter(queryInput);
  }
  Array.prototype.slice.call(document.querySelectorAll('.local-filter')).forEach(function(input) {
    if (input !== queryInput && q && document.body.contains(input) && input.classList.contains('search-query')) {
      input.value = q;
    }
    input.addEventListener('input', function() {
      applyFilter(input);
    });
    if (input.value) {
      applyFilter(input);
    }
  });
})();

function initVideoPlayer(src) {
  var shell = document.querySelector('.video-shell');
  var video = document.querySelector('.movie-video');
  var button = document.querySelector('.video-overlay');
  if (!shell || !video || !button || !src) {
    return;
  }
  var ready = false;
  function attach() {
    if (ready) {
      video.play().catch(function() {});
      return;
    }
    ready = true;
    shell.classList.add('is-playing');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(function() {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function() {});
      });
      return;
    }
    video.src = src;
    video.play().catch(function() {});
  }
  button.addEventListener('click', attach);
  video.addEventListener('click', function() {
    if (!ready) {
      attach();
    }
  });
}
