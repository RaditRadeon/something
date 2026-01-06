document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const playBtn = document.getElementById("play-btn");
    const widget = document.querySelector(".music-widget");
    const trackName = document.getElementById("track-name");
    const viewCount = document.getElementById("view-count");

    audio.volume = 0.6;

    fetch('https://api.counterapi.dev/v1/radit/profile/up')
        .then(res => res.json())
        .then(data => {
            viewCount.textContent = data.count;
        })
        .catch(() => {
            viewCount.textContent = "error";
        });

    audio.addEventListener('error', () => {
        trackName.textContent = "could not find profilemusic.mp3";
    });

    playBtn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.textContent = "pause";
                widget.classList.add("playing");
            }).catch(() => {
                trackName.textContent = "playback error";
            });
        } else {
            audio.pause();
            playBtn.textContent = "play";
            widget.classList.remove("playing");
        }
    });
});
