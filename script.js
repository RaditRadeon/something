document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const widget = document.getElementById('music-widget');
  
  const notepadBtn = document.getElementById('notepad-toggle');
  const notepadModal = document.getElementById('notepad-modal');
  const closeNotepad = document.getElementById('close-notepad');
  const notepadContent = document.getElementById('notepad-content');

  const galleryBtn = document.getElementById('gallery-toggle');
  const galleryModal = document.getElementById('gallery-modal');
  const closeGallery = document.getElementById('close-gallery');
  const galleryGrid = document.getElementById('gallery-content');

  if (!audio || !playBtn || !widget) return;

  audio.volume = 0.5;

  async function togglePlayback() {
    if (audio.paused) {
      try {
        await audio.play();
        widget.classList.add('playing');
      } catch (err) {
        widget.classList.remove('playing');
      }
    } 
    else {
      audio.pause();
      widget.classList.remove('playing');
    }
  }

  playBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    togglePlayback();
  });

  audio.addEventListener('ended', () => {
    widget.classList.remove('playing');
  });

  async function loadNotepad() {
    try {
      const response = await fetch('notepad.txt');
      const text = await response.text();
      notepadContent.textContent = text;
    } catch (err) {
      notepadContent.textContent = 'error loading file';
    }
  }

  function loadGallery() {
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    const images = ['gallery', 'gallery2']; 
    galleryGrid.innerHTML = '';
    
    images.forEach(name => {
      extensions.forEach(ext => {
        const img = new Image();
        const src = `${name}.${ext}`;
        img.src = src;
        img.className = 'gallery-item';
        img.onload = () => {
          if (!galleryGrid.querySelector(`[src="${src}"]`)) {
            img.onclick = () => window.open(src, '_blank');
            galleryGrid.appendChild(img);
          }
        };
      });
    });
  }

  notepadBtn.addEventListener('click', () => {
    loadNotepad();
    notepadModal.classList.add('active');
  });

  closeNotepad.addEventListener('click', () => {
    notepadModal.classList.remove('active');
  });

  galleryBtn.addEventListener('click', () => {
    loadGallery();
    galleryModal.classList.add('active');
  });

  closeGallery.addEventListener('click', () => {
    galleryModal.classList.remove('active');
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });
});
