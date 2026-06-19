(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var activeTerms = [];

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var inputTerm = input ? normalize(input.value) : "";
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-filter-text"));
          var matchedInput = !inputTerm || text.indexOf(inputTerm) !== -1;
          var matchedButtons = activeTerms.every(function (term) {
            return !term || text.indexOf(term) !== -1;
          });
          card.classList.toggle("is-filtered-out", !(matchedInput && matchedButtons));
        });
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var group = button.closest(".filter-group");
          var value = normalize(button.getAttribute("data-filter-value"));
          if (group) {
            Array.prototype.slice.call(group.querySelectorAll("button")).forEach(function (item) {
              item.classList.remove("active");
            });
          }
          button.classList.add("active");
          activeTerms = Array.prototype.slice.call(panel.querySelectorAll(".filter-group button.active"))
            .map(function (item) {
              return normalize(item.getAttribute("data-filter-value"));
            })
            .filter(Boolean);
          apply();
        });
      });

      apply();
    });
  });

  window.setupPlayer = function (url, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;

    if (!video || !url) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay && video.paused && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    function startPlayback() {
      hideOverlay();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", hideOverlay);
    video.addEventListener("ended", showOverlay);
  };
})();
