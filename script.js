document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const widget = document.getElementById('music-widget');
  const trackName = document.getElementById('track-name');

  if (!audio || !playBtn || !widget || !trackName) return;

  // 1. Set volume (lower is usually better for background)
  audio.volume = 0.5;

  // 2. Main Play/Pause Logic
  async function togglePlayback() {
    // If audio is paused, we try to play
    if (audio.paused) {
      try {
        await audio.play();
        widget.classList.add('playing');
        playBtn.setAttribute('aria-label', 'Pause music');
      } catch (err) {
        console.error('Playback failed:', err);
        // Reset UI if play fails (e.g. file not found)
        widget.classList.remove('playing');
        playBtn.setAttribute('aria-label', 'Play music');
      }
    } 
    // If audio is playing, we pause
    else {
      audio.pause();
      widget.classList.remove('playing');
      playBtn.setAttribute('aria-label', 'Play music');
    }
  }

  // 3. Attach Click Listener
  playBtn.addEventListener('click', (e) => {
    // Prevent default to stop weird mobile zoom/focus behaviors
    e.preventDefault(); 
    togglePlayback();
  });

  // 4. Update UI if the song ends automatically
  audio.addEventListener('ended', () => {
    widget.classList.remove('playing');
    playBtn.setAttribute('aria-label', 'Play music');
  });

  // Note: We removed the "filename parsing" block so your 
  // HTML text (profile-music) stays exactly how you wrote it.
});
