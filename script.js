document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const playBtn = document.getElementById("play-btn");
    const widget = document.querySelector(". music-widget");
    const trackName = document.getElementById("track-name");
    const playIcon = document.querySelector(".play-icon");

    if (! audio || !playBtn || !widget || ! trackName) {
        console.error("required elements not found");
        return;
    }

    audio.volume = 0.6;

    audio.addEventListener('error', () => {
        trackName.textContent = "could not find profilemusic.mp3";
    });

    // Initialize button state
    updateButtonState();

    playBtn.addEventListener("click", (e) => {
        e.preventDefault();
        
        if (audio.paused) {
            audio.play().then(() => {
                updateButtonState();
            }).catch((error) => {
                console.error("playback error:", error);
                trackName.textContent = "playback error";
            });
        } else {
            audio.pause();
            updateButtonState();
        }
    });

    // Update button state when audio plays/pauses
    audio.addEventListener('play', updateButtonState);
    audio.addEventListener('pause', updateButtonState);

    function updateButtonState() {
        if (audio.paused) {
            widget.classList.remove("playing");
            playBtn.setAttribute('aria-label', 'Play music');
        } else {
            widget.classList.add("playing");
            playBtn.setAttribute('aria-label', 'Pause music');
        }
    }

    // Mobile touch optimization
    playBtn.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });

    playBtn.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});
