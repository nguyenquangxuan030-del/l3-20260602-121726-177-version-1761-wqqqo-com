document.addEventListener("DOMContentLoaded", function() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const searchPage = document.querySelector("[data-search-page]");
  if (searchPage) {
    const input = searchPage.querySelector("[data-filter-input]");
    const category = searchPage.querySelector("[data-filter-category]");
    const year = searchPage.querySelector("[data-filter-year]");
    const sort = searchPage.querySelector("[data-filter-sort]");
    const grid = searchPage.querySelector("[data-card-grid]");
    const cards = Array.from(searchPage.querySelectorAll("[data-card]"));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function textOf(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
    }

    function applyFilters() {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const cat = category ? category.value : "all";
      const yr = year ? year.value : "all";

      cards.forEach(function(card) {
        const text = textOf(card);
        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchCategory = cat === "all" || card.getAttribute("data-category") === cat;
        const matchYear = yr === "all" || card.getAttribute("data-year") === yr;
        card.hidden = !(matchKeyword && matchCategory && matchYear);
      });
    }

    function applySort() {
      if (!grid || !sort) {
        return;
      }
      const mode = sort.value;
      const ordered = cards.slice().sort(function(a, b) {
        const ay = parseInt(a.getAttribute("data-year"), 10) || 0;
        const by = parseInt(b.getAttribute("data-year"), 10) || 0;
        const at = a.getAttribute("data-title") || "";
        const bt = b.getAttribute("data-title") || "";
        if (mode === "old") {
          return ay - by || at.localeCompare(bt, "zh-Hans-CN");
        }
        if (mode === "title") {
          return at.localeCompare(bt, "zh-Hans-CN");
        }
        return by - ay || at.localeCompare(bt, "zh-Hans-CN");
      });
      ordered.forEach(function(card) {
        grid.appendChild(card);
      });
    }

    [input, category, year].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    if (sort) {
      sort.addEventListener("change", function() {
        applySort();
        applyFilters();
      });
    }

    applySort();
    applyFilters();
  }
});
