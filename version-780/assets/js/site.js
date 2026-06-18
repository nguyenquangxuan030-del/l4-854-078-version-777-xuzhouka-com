(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var navToggle = document.querySelector("[data-nav-toggle]");

    if (header && navToggle) {
      navToggle.addEventListener("click", function () {
        header.classList.toggle("nav-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
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
          showSlide(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      showSlide(0);
      start();
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
      var input = document.querySelector("[data-filter-input]");
      var region = document.querySelector("[data-filter-region]");
      var type = document.querySelector("[data-filter-type]");
      var year = document.querySelector("[data-filter-year]");
      var genre = document.querySelector("[data-filter-genre]");
      var sortSelect = document.querySelector("[data-sort-select]");
      var grid = document.querySelector("[data-card-grid]");
      var empty = document.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var params = new URLSearchParams(window.location.search);

      if (input && params.get("q")) {
        input.value = params.get("q");
      }

      if (sortSelect && params.get("sort")) {
        sortSelect.value = params.get("sort");
      }

      function matches(card) {
        var query = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var genreValue = genre ? genre.value : "";
        var search = card.getAttribute("data-search") || "";
        var cardGenre = card.getAttribute("data-genre") || "";

        return (!query || search.indexOf(query) !== -1) &&
          (!regionValue || card.getAttribute("data-region") === regionValue) &&
          (!typeValue || card.getAttribute("data-type") === typeValue) &&
          (!yearValue || card.getAttribute("data-year") === yearValue) &&
          (!genreValue || cardGenre.indexOf(genreValue) !== -1);
      }

      function sortCards() {
        var value = sortSelect ? sortSelect.value : "popular";
        var sorted = cards.slice().sort(function (a, b) {
          if (value === "latest") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (value === "likes") {
            return Number(b.getAttribute("data-likes")) - Number(a.getAttribute("data-likes"));
          }
          if (value === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          }
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function applyFilters() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type, year, genre, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", function () {
            sortCards();
            applyFilters();
          });
          control.addEventListener("change", function () {
            sortCards();
            applyFilters();
          });
        }
      });

      sortCards();
      applyFilters();
    }
  });
})();
