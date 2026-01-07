document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const playBtn = document.getElementById("play-btn");
    const widget = document.querySelector(". music-widget");
    const trackName = document.getElementById("track-name");

    if (! audio || !playBtn || !widget || !trackName) {
        console.error("Required elements not found");
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
        e.stopPropagation();
        
        if (audio.paused) {
            audio.play().then(() => {
                updateButtonState();
            }).catch((error) => {
                console. error("Playback error:", error);
                trackName.textContent = "playback error";
            });
        } else {
            audio.pause();
            updateButtonState();
        }
    });

    // Update button state when audio plays/pauses
    audio. addEventListener('play', updateButtonState);
    audio.addEventListener('pause', updateButtonState);

    function updateButtonState() {
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        
        if (audio.paused) {
            widget.classList.remove("playing");
            playBtn. setAttribute('aria-label', 'Play music');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        } else {
            widget.classList.add("playing");
            playBtn.setAttribute('aria-label', 'Pause music');
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
        }
    }

    // Mobile touch optimization
    playBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.style.opacity = '0.8';
    });

    playBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.style.opacity = '1';
    });
});
