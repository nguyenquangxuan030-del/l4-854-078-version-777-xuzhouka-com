(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function playVideo() {
        if (!video) {
          return;
        }

        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }

        if (box.getAttribute("data-ready") !== "1") {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            box.hls = hls;
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else {
            video.src = source;
          }
          box.setAttribute("data-ready", "1");
        }

        hideOverlay();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });
        video.addEventListener("play", hideOverlay);
      }
    });
  });
})();
