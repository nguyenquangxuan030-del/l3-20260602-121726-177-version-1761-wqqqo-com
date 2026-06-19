(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === active);
    });
  }

  function startTimer() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startTimer();
      });
    }
    showSlide(0);
    startTimer();
  }

  var keywordInput = document.querySelector('[data-search-keyword]');
  var yearSelect = document.querySelector('[data-search-year]');
  var regionSelect = document.querySelector('[data-search-region]');
  var resetButton = document.querySelector('[data-search-reset]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var keyword = normalize(keywordInput && keywordInput.value);
    var year = yearSelect && yearSelect.value ? yearSelect.value : 'all';
    var region = regionSelect && regionSelect.value ? regionSelect.value : 'all';

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = year === 'all' || card.getAttribute('data-year') === year;
      var matchRegion = region === 'all' || card.getAttribute('data-region') === region;
      card.classList.toggle('hidden-by-filter', !(matchKeyword && matchYear && matchRegion));
    });
  }

  [keywordInput, yearSelect, regionSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      if (keywordInput) {
        keywordInput.value = '';
      }
      if (yearSelect) {
        yearSelect.value = 'all';
      }
      if (regionSelect) {
        regionSelect.value = 'all';
      }
      filterCards();
    });
  }
})();
