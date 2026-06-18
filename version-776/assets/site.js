(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-search-form]'), function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var keyword = input ? input.value.trim() : '';
      if (keyword) {
        window.location.href = './categories.html?q=' + encodeURIComponent(keyword);
      }
    });
  });

  function filterCards() {
    var listing = document.querySelector('[data-listing]');
    if (!listing) {
      return;
    }

    var activeButton = document.querySelector('[data-filter-group] .filter-btn.active');
    var activeCategory = activeButton ? activeButton.getAttribute('data-filter-value') : 'all';
    var localInput = document.querySelector('[data-local-search] input[name="q"]');
    var query = localInput ? localInput.value.trim().toLowerCase() : '';
    var cards = listing.querySelectorAll('[data-card]');

    Array.prototype.forEach.call(cards, function (card) {
      var cardCategory = card.getAttribute('data-cat') || '';
      var text = card.getAttribute('data-search') || '';
      var categoryMatched = activeCategory === 'all' || cardCategory === activeCategory;
      var queryMatched = !query || text.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !(categoryMatched && queryMatched));
    });
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q');
  var localForm = document.querySelector('[data-local-search]');

  if (initialQuery && localForm) {
    var input = localForm.querySelector('input[name="q"]');
    if (input) {
      input.value = initialQuery;
    }
  }

  if (localForm) {
    localForm.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards();
    });

    var localInput = localForm.querySelector('input[name="q"]');
    if (localInput) {
      localInput.addEventListener('input', filterCards);
    }
  }

  var filterGroup = document.querySelector('[data-filter-group]');

  if (filterGroup) {
    filterGroup.addEventListener('click', function (event) {
      var button = event.target.closest('.filter-btn');
      if (!button) {
        return;
      }

      Array.prototype.forEach.call(filterGroup.querySelectorAll('.filter-btn'), function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      filterCards();
    });
  }

  filterCards();

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }
})();
