(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function bindMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        schedule();
      });
    });
    schedule();
  }

  function bindFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var input = root.querySelector("[data-filter-input]");
    var year = root.querySelector("[data-filter-year]");
    var type = root.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-title") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var visible = true;
        if (query && text.indexOf(query) === -1) {
          visible = false;
        }
        if (yearValue && cardYear !== yearValue) {
          visible = false;
        }
        if (typeValue && cardType !== typeValue) {
          visible = false;
        }
        card.style.display = visible ? "" : "none";
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function createCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    article.innerHTML = "" +
      "<a class='poster-link' href='./" + encodeAttr(item.file) + "'>" +
      "<img src='" + encodeAttr(item.cover) + "' alt='" + encodeAttr(item.title) + "' loading='lazy'>" +
      "<span class='poster-badge'>" + escapeHtml(item.year) + "</span>" +
      "<span class='poster-score'>★ " + escapeHtml(item.rating) + "</span>" +
      "</a>" +
      "<div class='card-body'>" +
      "<div class='card-meta'><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.region) + "</span></div>" +
      "<h2><a href='./" + encodeAttr(item.file) + "'>" + escapeHtml(item.title) + "</a></h2>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class='tag-list'>" + tags + "</div>" +
      "</div>";
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function encodeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function bindSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.SearchIndex) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var result = root.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : "";
      result.innerHTML = "";
      if (!query) {
        result.innerHTML = "<div class='empty-state'>输入片名、题材、地区或年份，快速查找想看的内容。</div>";
        return;
      }
      var matches = window.SearchIndex.filter(function (item) {
        return item.key.indexOf(query) !== -1;
      }).slice(0, 80);
      if (!matches.length) {
        result.innerHTML = "<div class='empty-state'>没有找到匹配内容，换个关键词试试。</div>";
        return;
      }
      var grid = document.createElement("div");
      grid.className = "movie-grid";
      matches.forEach(function (item) {
        grid.appendChild(createCard(item));
      });
      result.appendChild(grid);
    }

    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  ready(function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindFilters();
    bindSearchPage();
  });
})();
