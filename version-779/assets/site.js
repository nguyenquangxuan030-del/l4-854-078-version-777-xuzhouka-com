(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) return;
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", expanded ? "false" : "true");
            nav.hidden = expanded;
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) return;
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) return;
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                play();
            });
        }
        show(0);
        play();
    }

    function setupFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var search = scope.querySelector("[data-filter-search]");
            var year = scope.querySelector("[data-filter-year]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var reset = scope.querySelector("[data-filter-reset]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".no-results");

            function apply() {
                var q = normalize(search && search.value);
                var y = normalize(year && year.value);
                var r = normalize(region && region.value);
                var t = normalize(type && type.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var hay = normalize(card.getAttribute("data-title"));
                    var cy = normalize(card.getAttribute("data-year"));
                    var cr = normalize(card.getAttribute("data-region"));
                    var ct = normalize(card.getAttribute("data-type"));
                    var ok = (!q || hay.indexOf(q) !== -1) && (!y || cy.indexOf(y) !== -1) && (!r || cr.indexOf(r) !== -1) && (!t || ct.indexOf(t) !== -1);
                    card.classList.toggle("hidden-card", !ok);
                    if (ok) visible += 1;
                });
                if (empty) empty.classList.toggle("is-visible", visible === 0);
            }

            [search, year, region, type].forEach(function (el) {
                if (el) el.addEventListener("input", apply);
                if (el) el.addEventListener("change", apply);
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    if (search) search.value = "";
                    if (year) year.value = "";
                    if (region) region.value = "";
                    if (type) type.value = "";
                    apply();
                });
            }
            apply();
        });
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card">',
            '<a href="' + item.url + '" class="movie-cover" aria-label="' + item.title + '">',
            '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy" />',
            '<span class="duration">' + item.duration + '</span>',
            '<span class="cover-badge">' + item.category + '</span>',
            '</a>',
            '<div class="movie-body">',
            '<h2><a href="' + item.url + '">' + item.title + '</a></h2>',
            '<p>' + item.oneLine + '</p>',
            '<div class="movie-meta"><span>' + item.region + '</span><span>' + item.year + '</span><span>★ ' + item.rating + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function setupSearchPage() {
        var box = document.getElementById("search-results");
        if (!box || !window.searchIndex) return;
        var input = document.getElementById("search-page-input");
        var empty = document.querySelector(".no-results");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) input.value = initial;

        function render() {
            var q = normalize(input && input.value);
            var items = window.searchIndex.filter(function (item) {
                var hay = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.category].join(" "));
                return !q || hay.indexOf(q) !== -1;
            }).slice(0, 120);
            box.innerHTML = items.map(cardTemplate).join("");
            if (empty) empty.classList.toggle("is-visible", items.length === 0);
        }

        if (input) input.addEventListener("input", render);
        render();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
