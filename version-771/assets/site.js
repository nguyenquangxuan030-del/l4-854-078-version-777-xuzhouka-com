document.addEventListener('DOMContentLoaded', function () {
  initMenu();
  initHero();
  initFilters();
  initPlayers();
});

function initMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function () {
    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.textContent = open ? '×' : '☰';
  });
}

function initHero() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let index = 0;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === index);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === index);
      dot.setAttribute('aria-current', itemIndex === index ? 'true' : 'false');
    });
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
    });
  }

  dots.forEach(function (dot, itemIndex) {
    dot.addEventListener('click', function () {
      show(itemIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      show(index + 1);
    }, 6200);
  }
}

function initFilters() {
  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    const input = panel.querySelector('[data-search-input]');
    const category = panel.querySelector('[data-filter-category]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('.movie-card[data-search]'));
    const empty = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';

    if (q && input) {
      input.value = q;
    }

    function valueOf(element) {
      return element ? element.value.trim() : '';
    }

    function update() {
      const keyword = valueOf(input).toLowerCase();
      const categoryValue = valueOf(category);
      const yearValue = valueOf(year);
      const typeValue = valueOf(type);
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-search') || '').toLowerCase();
        const cardCategory = card.getAttribute('data-category') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const cardType = card.getAttribute('data-type') || '';
        const matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!categoryValue || categoryValue === cardCategory) &&
          (!yearValue || yearValue === cardYear) &&
          (!typeValue || typeValue === cardType);

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, category, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', update);
        element.addEventListener('change', update);
      }
    });

    update();
  });
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    const video = box.querySelector('video');
    const overlay = box.querySelector('.play-overlay');
    const stream = box.getAttribute('data-stream');
    let ready = false;
    let hls = null;

    if (!video || !stream) {
      return;
    }

    function bind() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
      video.controls = true;
    }

    function start() {
      bind();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}
