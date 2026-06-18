(function () {
  function loadVideo(video, src, message) {
    return new Promise(function (resolve) {
      if (video.dataset.ready === "true") {
        resolve();
        return;
      }
      video.dataset.ready = "true";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        resolve();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && message) {
            message.classList.add("is-visible");
          }
        });
        return;
      }
      video.src = src;
      resolve();
    });
  }

  window.setupMoviePlayer = function (videoId, src, buttonId, overlayId, messageId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var message = document.getElementById(messageId);
    if (!video || !button || !overlay) {
      return;
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      overlay.classList.add("is-hidden");
      loadVideo(video, src, message).then(function () {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", start);
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.dataset.ready !== "true") {
        start();
      }
    });
  };
})();
