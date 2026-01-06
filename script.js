document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const playBtn = document.getElementById("play-btn");
    const widget = document.querySelector(".music-widget");
    const trackName = document.getElementById("track-name");

    audio.volume = 0.5;

    playBtn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = "pause";
            widget.classList.add("playing");
            trackName.style.opacity = "1";
        } else {
            audio.pause();
            playBtn.textContent = "play";
            widget.classList.remove("playing");
            trackName.style.opacity = "0.5";
        }
    });
});
