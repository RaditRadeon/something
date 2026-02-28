/* ===== PIXELPLAYER — script.js ===== */

const audio        = document.getElementById('audio');
const btnPlay      = document.getElementById('btn-play');
const btnPrev      = document.getElementById('btn-prev');
const btnNext      = document.getElementById('btn-next');
const btnShuffle   = document.getElementById('btn-shuffle');
const btnRepeat    = document.getElementById('btn-repeat');
const btnVisualizer= document.getElementById('btn-visualizer');
const artCard      = document.getElementById('art-card');
const artGrid      = document.getElementById('art-grid');
const songTitle    = document.getElementById('song-title');
const songArtist   = document.getElementById('song-artist');
const progressTrack= document.getElementById('progress-track');
const progressFill = document.getElementById('progress-fill');
const progressThumb= document.getElementById('progress-thumb');
const timeCurrent  = document.getElementById('time-current');
const timeTotal    = document.getElementById('time-total');
const volTrack     = document.getElementById('vol-track');
const volFill      = document.getElementById('vol-fill');
const volThumb     = document.getElementById('vol-thumb');
const fileInput    = document.getElementById('file-input');
const appShell     = document.querySelector('.app-shell');
const visWrap      = document.getElementById('visualizer-wrap');
const visCanvas    = document.getElementById('vis-canvas');
const bgCanvas     = document.getElementById('bg-canvas');

/* ── State ── */
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0=off 1=all 2=one
let volume = 0.75;
let audioCtx, analyser, source, dataArray;
let visVisible = false;

/* ══════════════════════════════════════
   PIXEL ART GENERATOR
══════════════════════════════════════ */
const PALETTES = [
  ['#7C4DFF','#B39DDB','#00E5FF','#1C1828','#261F38','#FF5370','#FFD740'],
  ['#FF6B6B','#FFA726','#FFEB3B','#66BB6A','#26C6DA','#7C4DFF','#1C1828'],
  ['#00E5FF','#00BCD4','#0097A7','#006064','#B2EBF2','#7C4DFF','#12101A'],
  ['#FF4081','#F50057','#FF80AB','#FFD740','#7C4DFF','#1C1828','#261F38'],
  ['#69F0AE','#00E676','#1B5E20','#7C4DFF','#00E5FF','#12101A','#1C1828'],
];

function generatePixelArt(seed) {
  const COLS = 16, ROWS = 16;
  const palette = PALETTES[seed % PALETTES.length];
  artGrid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  artGrid.style.gridTemplateRows    = `repeat(${ROWS}, 1fr)`;
  artGrid.innerHTML = '';

  // Simple symmetric sprite generation
  const half = Math.ceil(COLS / 2);
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < half; c++) {
      const rng = Math.sin(seed * 9301 + r * 49297 + c * 233) * 0.5 + 0.5;
      row.push(Math.floor(rng * (palette.length)));
    }
    grid.push(row);
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const col = c < half ? c : COLS - 1 - c;
      const cell = document.createElement('div');
      const colorIdx = grid[r][col] % palette.length;
      cell.style.cssText = `background:${palette[colorIdx]};image-rendering:pixelated;`;
      artGrid.appendChild(cell);
    }
  }
}

/* ══════════════════════════════════════
   BACKGROUND PIXEL PARTICLES
══════════════════════════════════════ */
const bgCtx = bgCanvas.getContext('2d');
const PARTICLE_COUNT = 60;
let particles = [];

function resizeBg() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

function spawnParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      size: (Math.floor(Math.random() * 3) + 1) * 2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2,
      color: ['#7C4DFF','#00E5FF','#B39DDB','#FF5370','#FFD740'][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.5 + 0.1,
      life: Math.random(),
      decay: Math.random() * 0.002 + 0.001,
    });
  }
}

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  particles.forEach((p, i) => {
    p.x += p.vx * (isPlaying ? 2 : 1);
    p.y += p.vy * (isPlaying ? 2 : 1);
    p.life -= p.decay;

    if (p.life <= 0 || p.x < -10 || p.x > bgCanvas.width + 10 || p.y < -10 || p.y > bgCanvas.height + 10) {
      p.x = Math.random() * bgCanvas.width;
      p.y = bgCanvas.height + 10;
      p.life = 1;
    }

    bgCtx.globalAlpha = p.life * p.alpha;
    bgCtx.fillStyle = p.color;
    bgCtx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  });
  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animateBg);
}

window.addEventListener('resize', () => { resizeBg(); spawnParticles(); });
resizeBg();
spawnParticles();
animateBg();

/* ══════════════════════════════════════
   WEB AUDIO VISUALIZER
══════════════════════════════════════ */
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

const visCtx = visCanvas.getContext('2d');
function drawVisualizer() {
  if (!visVisible || !analyser) { requestAnimationFrame(drawVisualizer); return; }
  requestAnimationFrame(drawVisualizer);

  const W = visCanvas.offsetWidth, H = visCanvas.offsetHeight;
  visCanvas.width  = W;
  visCanvas.height = H;

  analyser.getByteFrequencyData(dataArray);
  visCtx.clearRect(0, 0, W, H);

  const BAR_W = 8;
  const GAP   = 4;
  const COLS  = Math.floor(W / (BAR_W + GAP));
  const COLORS = ['#7C4DFF','#9B6DFF','#B39DDB','#00E5FF','#69F0AE'];

  for (let i = 0; i < COLS; i++) {
    const idx = Math.floor((i / COLS) * dataArray.length);
    const val = dataArray[idx] / 255;
    const barH = Math.max(4, val * H);
    const x = i * (BAR_W + GAP);
    const y = H - barH;

    // pixel-style: chunked blocks
    const chunks = Math.floor(barH / 6);
    for (let c = 0; c < chunks; c++) {
      const ratio = c / (chunks || 1);
      const color = COLORS[Math.floor(ratio * COLORS.length)];
      visCtx.fillStyle = color;
      visCtx.fillRect(x, y + c * 6 + 1, BAR_W, 5);
    }
  }
}
drawVisualizer();

/* ══════════════════════════════════════
   PLAYBACK CONTROLS
══════════════════════════════════════ */
let artSeed = 0;

function setPlaying(state) {
  isPlaying = state;
  const iconPlay  = btnPlay.querySelector('.icon-play');
  const iconPause = btnPlay.querySelector('.icon-pause');
  iconPlay.style.display  = isPlaying ? 'none' : 'block';
  iconPause.style.display = isPlaying ? 'block' : 'none';
  btnPlay.classList.toggle('playing', isPlaying);
  artCard.classList.toggle('playing', isPlaying);
  appShell.classList.toggle('playing', isPlaying);
}

function play() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  audio.play().then(() => setPlaying(true)).catch(err => {
    console.warn('Playback failed:', err);
  });
}

function pause() {
  audio.pause();
  setPlaying(false);
}

btnPlay.addEventListener('click', () => {
  initAudio();
  if (isPlaying) pause(); else play();
});

btnPrev.addEventListener('click', () => {
  audio.currentTime = Math.max(0, audio.currentTime - 5);
});

btnNext.addEventListener('click', () => {
  audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
});

btnShuffle.addEventListener('click', () => {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle('active', isShuffle);
});

btnRepeat.addEventListener('click', () => {
  repeatMode = (repeatMode + 1) % 3;
  btnRepeat.classList.toggle('active', repeatMode > 0);
  audio.loop = (repeatMode === 2);
  btnRepeat.style.color = repeatMode === 2 ? 'var(--md-secondary)' : '';
});

btnVisualizer.addEventListener('click', () => {
  visVisible = !visVisible;
  visWrap.classList.toggle('visible', visVisible);
  btnVisualizer.classList.toggle('active', visVisible);
  if (visVisible) initAudio();
});

audio.addEventListener('ended', () => {
  if (repeatMode === 1) play();
  else setPlaying(false);
});

/* ══════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════ */
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = pct + '%';
  progressThumb.style.left = `calc(${pct}% - 8px)`;
  timeCurrent.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  timeTotal.textContent = formatTime(audio.duration);
});

let isDraggingProgress = false;

function seekFromEvent(e) {
  const rect = progressTrack.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const pct = Math.max(0, Math.min(1, x / rect.width));
  audio.currentTime = pct * (audio.duration || 0);
}

progressTrack.addEventListener('mousedown', (e) => { isDraggingProgress = true; seekFromEvent(e); });
progressTrack.addEventListener('touchstart', (e) => { isDraggingProgress = true; seekFromEvent(e); }, { passive: true });
document.addEventListener('mousemove', (e) => { if (isDraggingProgress) seekFromEvent(e); });
document.addEventListener('touchmove', (e) => { if (isDraggingProgress) seekFromEvent(e); }, { passive: true });
document.addEventListener('mouseup', () => { isDraggingProgress = false; });
document.addEventListener('touchend', () => { isDraggingProgress = false; });

/* ══════════════════════════════════════
   VOLUME
══════════════════════════════════════ */
audio.volume = volume;
updateVolUI(volume);

function updateVolUI(v) {
  const pct = v * 100;
  volFill.style.width = pct + '%';
  volThumb.style.left = `calc(${pct}% - 7px)`;
}

let isDraggingVol = false;

function volumeFromEvent(e) {
  const rect = volTrack.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  volume = Math.max(0, Math.min(1, x / rect.width));
  audio.volume = volume;
  updateVolUI(volume);
}

volTrack.addEventListener('mousedown', (e) => { isDraggingVol = true; volumeFromEvent(e); });
volTrack.addEventListener('touchstart', (e) => { isDraggingVol = true; volumeFromEvent(e); }, { passive: true });
document.addEventListener('mousemove', (e) => { if (isDraggingVol) volumeFromEvent(e); });
document.addEventListener('touchmove', (e) => { if (isDraggingVol) volumeFromEvent(e); }, { passive: true });
document.addEventListener('mouseup', () => { isDraggingVol = false; });
document.addEventListener('touchend', () => { isDraggingVol = false; });

/* ══════════════════════════════════════
   FILE LOADING
══════════════════════════════════════ */
function loadAudioFile(file) {
  const url = URL.createObjectURL(file);
  const wasPlaying = isPlaying;
  if (wasPlaying) pause();

  audio.src = url;
  audio.load();

  // Parse name
  let name = file.name.replace(/\.[^/.]+$/, '');
  let artist = 'Unknown Artist';
  const dashIdx = name.indexOf(' - ');
  if (dashIdx > -1) {
    artist = name.substring(0, dashIdx);
    name   = name.substring(dashIdx + 3);
  }

  songTitle.textContent  = name;
  songArtist.textContent = artist;
  artSeed++;
  generatePixelArt(artSeed);

  audio.addEventListener('canplay', () => {
    if (wasPlaying) play();
  }, { once: true });
}

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadAudioFile(file);
});

/* ══════════════════════════════════════
   ART CARD CLICK
══════════════════════════════════════ */
artCard.addEventListener('click', () => {
  artSeed++;
  generatePixelArt(artSeed);
  artCard.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(0.96)' },
    { transform: 'scale(1.02)' },
    { transform: 'scale(1)' },
  ], { duration: 300, easing: 'ease-out' });
});

/* ══════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      initAudio();
      isPlaying ? pause() : play();
      break;
    case 'ArrowLeft':
      audio.currentTime = Math.max(0, audio.currentTime - 5);
      break;
    case 'ArrowRight':
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
      break;
    case 'ArrowUp':
      volume = Math.min(1, volume + 0.05);
      audio.volume = volume;
      updateVolUI(volume);
      break;
    case 'ArrowDown':
      volume = Math.max(0, volume - 0.05);
      audio.volume = volume;
      updateVolUI(volume);
      break;
  }
});

/* ══════════════════════════════════════
   UTIL
══════════════════════════════════════ */
function formatTime(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
generatePixelArt(artSeed);

// Try to auto-detect music.mp3 duration
audio.addEventListener('loadedmetadata', () => {
  timeTotal.textContent = formatTime(audio.duration);
}, { once: true });

audio.addEventListener('error', () => {
  songTitle.textContent  = 'No file loaded';
  songArtist.textContent = 'Upload a file below';
}, { once: true });
