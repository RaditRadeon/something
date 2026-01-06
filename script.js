document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const playBtn = document.getElementById("play-btn");
    const widget = document.querySelector(".music-widget");
    const trackName = document.getElementById("track-name");

    audio.volume = 0.6;

    audio.addEventListener('error', () => {
        trackName.textContent = "could not find profilemusic.mp3";
    });

    playBtn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.textContent = "pause";
                playBtn.setAttribute('aria-pressed','true');
                widget.classList.add("playing");
            }).catch(() => {
                trackName.textContent = "playback error";
            });
        } else {
            audio.pause();
            playBtn.textContent = "play";
            playBtn.setAttribute('aria-pressed','false');
            widget.classList.remove("playing");
        }
    });

    playBtn.addEventListener('keydown', (e) => {
        if (e.code === 'Space'){
            e.preventDefault();
            playBtn.click();
        }
    });
});
