(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".play-overlay");
    var message = shell.querySelector("[data-player-message]");
    var source = shell.getAttribute("data-src");
    var started = false;
    var hls = null;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.hidden = false;
    }

    function hideMessage() {
      if (message) {
        message.hidden = true;
        message.textContent = "";
      }
    }

    function attachSource() {
      if (started || !video || !source) {
        return;
      }
      started = true;
      hideMessage();

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage("网络加载异常，正在重新连接播放源");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage("媒体解码异常，正在尝试恢复播放");
            hls.recoverMediaError();
          } else {
            showMessage("播放源暂时无法加载，请刷新后重试");
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        showMessage("当前浏览器不支持 HLS 播放");
      }
    }

    function playVideo() {
      attachSource();
      if (video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            showMessage("点击视频控件即可开始播放");
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        hideMessage();
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("[data-player]").forEach(setupPlayer);
    });
  } else {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  }
})();
