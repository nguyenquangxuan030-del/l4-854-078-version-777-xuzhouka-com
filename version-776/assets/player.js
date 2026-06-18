(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.js-play');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var loaded = false;

    if (!video || !overlay || !source) {
      return;
    }

    function bindSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      bindSource();
      overlay.classList.add('is-hidden');
      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!loaded) {
        startPlayback();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), setupPlayer);
})();
