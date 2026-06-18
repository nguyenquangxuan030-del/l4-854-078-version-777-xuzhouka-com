const SELECTORS = {
    mobileToggle: '[data-mobile-toggle]',
    mobilePanel: '[data-mobile-panel]',
    searchForm: '[data-search-form]',
    filterInput: '[data-filter-input]',
    filterList: '[data-filter-list]',
    movieCard: '[data-movie-card]',
    filterCount: '[data-filter-count]',
    heroCarousel: '[data-hero-carousel]',
    player: '[data-player]'
};

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function initMobileNavigation() {
    const toggle = document.querySelector(SELECTORS.mobileToggle);
    const panel = document.querySelector(SELECTORS.mobilePanel);

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function initSearchForms() {
    document.querySelectorAll(SELECTORS.searchForm).forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';
            const target = new URL(form.getAttribute('action') || './search.html', window.location.href);

            if (query) {
                target.searchParams.set('q', query);
            }

            window.location.href = target.pathname.split('/').pop() + target.search;
        });
    });
}

function updateFilterCount(scope, visibleCount, totalCount) {
    const count = scope.querySelector(SELECTORS.filterCount) || document.querySelector(SELECTORS.filterCount);

    if (count) {
        count.textContent = `${visibleCount} / ${totalCount} 部影片`;
    }
}

function filterCards(input) {
    const section = input.closest('section') || document;
    const list = section.querySelector(SELECTORS.filterList) || document.querySelector(SELECTORS.filterList);

    if (!list) {
        return;
    }

    const cards = Array.from(list.querySelectorAll(SELECTORS.movieCard));
    const query = normalizeText(input.value);
    let visibleCount = 0;

    cards.forEach((card) => {
        const haystack = normalizeText(card.getAttribute('data-search'));
        const visible = !query || haystack.includes(query);
        card.classList.toggle('is-hidden', !visible);

        if (visible) {
            visibleCount += 1;
        }
    });

    updateFilterCount(section, visibleCount, cards.length);
}

function initFilters() {
    const urlQuery = new URLSearchParams(window.location.search).get('q') || '';

    document.querySelectorAll(SELECTORS.filterInput).forEach((input) => {
        if (input.hasAttribute('data-search-query') && urlQuery) {
            input.value = urlQuery;
        }

        input.addEventListener('input', () => filterCards(input));
        filterCards(input);
    });
}

function initHeroCarousel() {
    const carousel = document.querySelector(SELECTORS.heroCarousel);

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const thumbs = Array.from(carousel.querySelectorAll('[data-hero-thumb]'));
    let current = 0;
    let timer = null;

    function show(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        thumbs.forEach((thumb, thumbIndex) => {
            thumb.classList.toggle('is-active', thumbIndex === current);
        });
    }

    function start() {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(current + 1), 5200);
    }

    thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
            start();
        });
    });

    show(0);
    start();
}

async function getHlsClass() {
    if (window.__LocalHlsClass) {
        return window.__LocalHlsClass;
    }

    const module = await import('./hls-dru42stk.js');
    window.__LocalHlsClass = module.H;
    return window.__LocalHlsClass;
}

function showPlayerMessage(player, message) {
    const box = player.querySelector('[data-player-message]');

    if (!box) {
        return;
    }

    box.textContent = message;
    box.classList.add('is-visible');
}

function hidePlayerMessage(player) {
    const box = player.querySelector('[data-player-message]');

    if (box) {
        box.textContent = '';
        box.classList.remove('is-visible');
    }
}

function initVideoPlayers() {
    document.querySelectorAll(SELECTORS.player).forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const source = player.getAttribute('data-video-url');
        let initialized = false;
        let hlsInstance = null;

        if (!video || !button || !source) {
            return;
        }

        async function attachSource() {
            if (initialized) {
                return;
            }

            hidePlayerMessage(player);

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                initialized = true;
                return;
            }

            try {
                const Hls = await getHlsClass();

                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            showPlayerMessage(player, '网络连接异常，播放器正在尝试重新加载。');
                            hlsInstance.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            showPlayerMessage(player, '媒体解码异常，播放器正在尝试恢复。');
                            hlsInstance.recoverMediaError();
                        } else {
                            showPlayerMessage(player, '播放初始化失败，请刷新页面后重试。');
                            hlsInstance.destroy();
                        }
                    });
                    initialized = true;
                    return;
                }

                showPlayerMessage(player, '当前浏览器不支持 HLS 播放。');
            } catch (error) {
                showPlayerMessage(player, '播放器脚本加载失败，请检查网络或浏览器设置。');
            }
        }

        async function play() {
            await attachSource();
            button.classList.add('is-hidden');

            try {
                await video.play();
            } catch (error) {
                button.classList.remove('is-hidden');
                showPlayerMessage(player, '浏览器阻止了自动播放，请再次点击播放按钮。');
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('play', () => button.classList.add('is-hidden'));
        video.addEventListener('pause', () => {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        video.addEventListener('ended', () => button.classList.remove('is-hidden'));

        window.addEventListener('beforeunload', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function init() {
    initMobileNavigation();
    initSearchForms();
    initFilters();
    initHeroCarousel();
    initVideoPlayers();
}

document.addEventListener('DOMContentLoaded', init);
