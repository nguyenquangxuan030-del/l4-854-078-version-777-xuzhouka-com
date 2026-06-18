
(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    selectAll('.hero').forEach(function (hero) {
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        var prev = hero.querySelector('.hero-arrow.prev');
        var next = hero.querySelector('.hero-arrow.next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            if (slides.length < 2) {
                return;
            }
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
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

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        show(0);
        start();
    });

    selectAll('[data-card-scope]').forEach(function (scope) {
        var input = scope.querySelector('.js-search');
        var buttons = selectAll('.js-filter', scope);
        var cards = selectAll('.movie-card', scope);
        var empty = scope.querySelector('.empty-state');
        var active = {};

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();

                var matched = !keyword || text.indexOf(keyword) !== -1;

                Object.keys(active).forEach(function (key) {
                    var value = active[key];
                    if (value && String(card.getAttribute('data-' + key) || '').indexOf(value) === -1) {
                        matched = false;
                    }
                });

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var key = button.getAttribute('data-key');
                var value = button.getAttribute('data-value') || '';
                active[key] = value;
                buttons.filter(function (item) {
                    return item.getAttribute('data-key') === key;
                }).forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
    });

    selectAll('.js-player').forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-layer');
        var url = video ? video.getAttribute('data-url') : '';
        var ready = false;
        var hls = null;

        function attach() {
            if (!video || !url || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                ready = true;
                return;
            }

            video.src = url;
            ready = true;
        }

        function play() {
            attach();
            box.classList.add('is-playing');
            if (button) {
                button.hidden = true;
            }
            if (video) {
                video.setAttribute('controls', 'controls');
                video.play().catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
                if (button) {
                    button.hidden = true;
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
