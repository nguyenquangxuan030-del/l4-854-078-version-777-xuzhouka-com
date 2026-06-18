(function () {
    function byId(id) {
        return document.getElementById(id);
    }

    function attach(video, streamUrl, message) {
        if (video.getAttribute("data-ready") === "1") return true;
        var HlsClass = window.Hls;
        if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
            var hls = new HlsClass({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            video.setAttribute("data-ready", "1");
            hls.on(HlsClass.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    message.textContent = "播放暂时无法加载，请稍后重试";
                    message.classList.add("is-visible");
                    if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                }
            });
            return true;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.setAttribute("data-ready", "1");
            return true;
        }
        message.textContent = "播放暂时无法加载，请稍后重试";
        message.classList.add("is-visible");
        return false;
    }

    function init(streamUrl) {
        var video = byId("movie-player");
        var overlay = byId("player-overlay");
        var message = byId("playback-message");
        if (!video || !overlay || !message || !streamUrl) return;
        var start = function () {
            message.classList.remove("is-visible");
            if (!attach(video, streamUrl, message)) return;
            overlay.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        };
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }

    window.MoviePlayer = {
        init: init
    };
})();
