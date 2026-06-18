(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupListingFilter() {
    var input = document.querySelector("[data-list-filter]");
    var year = document.querySelector("[data-year-filter]");
    var region = document.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || (!input && !year && !region)) {
      return;
    }
    var update = function () {
      var keyword = normalizeText(input && input.value);
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";
      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !selectedYear || card.dataset.year === selectedYear;
        var okRegion = !selectedRegion || card.dataset.region === selectedRegion;
        card.hidden = !(okKeyword && okYear && okRegion);
      });
    };
    [input, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener("input", update);
        el.addEventListener("change", update);
      }
    });
    update();
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-results]");
    var field = document.querySelector("[data-global-search]");
    if (!root || !field || !window.movieSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    field.value = initial;
    var render = function () {
      var q = normalizeText(field.value);
      var results = window.movieSearchData.filter(function (item) {
        if (!q) {
          return false;
        }
        return normalizeText(item.title + " " + item.region + " " + item.year + " " + item.genre + " " + item.tags).indexOf(q) !== -1;
      }).slice(0, 120);
      if (!q) {
        root.innerHTML = '<div class="empty-state">输入关键词后可检索影片标题、地区、年份与题材。</div>';
        return;
      }
      if (!results.length) {
        root.innerHTML = '<div class="empty-state">暂未找到匹配内容。</div>';
        return;
      }
      root.innerHTML = results.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + item.url + '">',
          '    <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
          '    <span class="card-badge">' + item.category + '</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <h2><a href="' + item.url + '">' + item.title + '</a></h2>',
          '    <p>' + item.oneLine + '</p>',
          '    <div class="card-meta"><span>' + item.year + '</span><span>' + item.region + '</span><span>★ ' + item.rating + '</span></div>',
          '  </div>',
          '</article>'
        ].join("");
      }).join("");
    };
    field.addEventListener("input", render);
    render();
  }

  window.initMoviePlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var frame = video.closest(".player-frame");
    var button = frame ? frame.querySelector(".play-overlay") : null;
    var attached = false;
    var hlsInstance = null;
    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    var play = function () {
      attach();
      if (frame) {
        frame.classList.add("is-playing");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (frame) {
            frame.classList.remove("is-playing");
          }
        });
      }
    };
    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (frame) {
        frame.classList.add("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupListingFilter();
    setupSearchPage();
  });
})();
