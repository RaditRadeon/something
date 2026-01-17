document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const widget = document.getElementById('music-widget');
  const trackName = document.getElementById('track-name');
  
  const notepadBtn = document.getElementById('notepad-toggle');
  const notepadModal = document.getElementById('notepad-modal');
  const closeNotepad = document.getElementById('close-notepad');
  const notepadContent = document.getElementById('notepad-content');

  if (!audio || !playBtn || !widget || !trackName) return;

  audio.volume = 0.5;

  async function togglePlayback() {
    if (audio.paused) {
      try {
        await audio.play();
        widget.classList.add('playing');
        playBtn.setAttribute('aria-label', 'Pause music');
      } catch (err) {
        widget.classList.remove('playing');
        playBtn.setAttribute('aria-label', 'Play music');
      }
    } 
    else {
      audio.pause();
      widget.classList.remove('playing');
      playBtn.setAttribute('aria-label', 'Play music');
    }
  }

  playBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    togglePlayback();
  });

  audio.addEventListener('ended', () => {
    widget.classList.remove('playing');
    playBtn.setAttribute('aria-label', 'Play music');
  });

  async function loadNotepad() {
    try {
      const response = await fetch('notepad.txt');
      if (!response.ok) throw new Error('File not found');
      const text = await response.text();
      notepadContent.textContent = text;
    } catch (err) {
      notepadContent.textContent = 'could not load notepad.txt';
    }
  }

  notepadBtn.addEventListener('click', () => {
    loadNotepad();
    notepadModal.classList.add('active');
  });

  closeNotepad.addEventListener('click', () => {
    notepadModal.classList.remove('active');
  });

  notepadModal.addEventListener('click', (e) => {
    if (e.target === notepadModal) {
      notepadModal.classList.remove('active');
    }
  });
});
