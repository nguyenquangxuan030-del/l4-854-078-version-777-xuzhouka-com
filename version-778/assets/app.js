import { H as Hls } from './hls-dru42stk.js';

const toText = (value) => (value || '').toString().toLowerCase().trim();

function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function initQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (!query) {
        return;
    }

    document.querySelectorAll('[data-local-search]').forEach((input) => {
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const library = document.querySelector('#library');
    if (library) {
        library.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function initFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
        const section = panel.closest('.content-section') || document;
        const cards = Array.from(section.querySelectorAll('.movie-card'));
        const search = panel.querySelector('[data-local-search]');
        const category = panel.querySelector('[data-filter-category]');
        const year = panel.querySelector('[data-filter-year]');
        const reset = panel.querySelector('[data-filter-reset]');
        const count = panel.querySelector('[data-result-count]');

        const apply = () => {
            const query = toText(search ? search.value : '');
            const cat = toText(category ? category.value : '');
            const yearValue = toText(year ? year.value : '');
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent,
                ].map(toText).join(' ');
                const matchesQuery = !query || haystack.includes(query);
                const matchesCategory = !cat || toText(card.dataset.category) === cat;
                const matchesYear = !yearValue || toText(card.dataset.year).includes(yearValue);
                const show = matchesQuery && matchesCategory && matchesYear;

                card.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `显示 ${visible} 部`;
            }
        };

        [search, category, year].forEach((control) => {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', () => {
                if (search) search.value = '';
                if (category) category.value = '';
                if (year) year.value = '';
                apply();
            });
        }

        apply();
    });
}

function attachHls(video, source) {
    if (video.__hlsInstance) {
        video.__hlsInstance.destroy();
        video.__hlsInstance = null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }

    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
    }
}

function initPlayers() {
    document.querySelectorAll('[data-player]').forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const source = player.dataset.videoSrc;
        let started = false;

        if (!video || !button || !source) {
            return;
        }

        const start = () => {
            if (!started) {
                attachHls(video, source);
                video.controls = true;
                button.classList.add('is-hidden');
                started = true;
            }

            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    button.classList.remove('is-hidden');
                });
            }
        };

        button.addEventListener('click', start);
        video.addEventListener('click', () => {
            if (!started) {
                start();
            }
        });
    });
}

function initHeroMotion() {
    const cards = Array.from(document.querySelectorAll('.hero-mini-card'));

    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 90}ms`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initFilters();
    initQueryFromUrl();
    initPlayers();
    initHeroMotion();
});
