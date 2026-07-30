/**
 * Senior Front-End Engine & Canvas Controller
 * ES2023 Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // DOM & MEDIA REFERENCES
  // -------------------------------------------------------------------------
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const mainContent = document.getElementById('main-content');
  const bgMusic = document.getElementById('bg-music');
  
  const video1 = document.getElementById('video1');
  const video2 = document.getElementById('video2');
  const video3 = document.getElementById('video3');
  
  const videos = [video1, video2, video3];

  // -------------------------------------------------------------------------
  // START BUTTON EVENT (Synchronous Media Playback)
  // -------------------------------------------------------------------------
  startBtn.addEventListener('click', async () => {
    // Synchronize media offsets
    videos.forEach(v => { v.currentTime = 0; });
    bgMusic.currentTime = 0;

    // Trigger playback simultaneously
    const playPromises = [
      bgMusic.play(),
      video1.play(),
      video2.play(),
      video3.play()
    ];

    try {
      await Promise.all(playPromises);
    } catch (err) {
      console.warn("Media playback initialized with fallback:", err);
    }

    // GSAP Entrance Transition
    gsap.to(startOverlay, {
      opacity: 0,
      duration: 1.0,
      ease: 'power2.inOut',
      onComplete: () => {
        startOverlay.style.display = 'none';
      }
    });

    gsap.to(mainContent, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: 0.3,
      ease: 'power3.out'
    });
  });

  // -------------------------------------------------------------------------
  // BACKGROUND CANVAS: AMBIENT PARTICLES & PIXEL FIREWORKS
  // -------------------------------------------------------------------------
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');

  function resizeBgCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resizeBgCanvas();
  window.addEventListener('resize', resizeBgCanvas);

  // --- Ambient Floating Particles ---
  const PARTICLE_COUNT = 40;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 2 + 0.8,
    speedY: Math.random() * 0.4 + 0.1,
    speedX: (Math.random() - 0.5) * 0.2,
    alpha: Math.random() * 0.7 + 0.2,
    pulseSpeed: Math.random() * 0.02 + 0.005
  }));

  function updateAndDrawParticles() {
    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += Math.sin(p.y * 0.01) * p.speedX;
      p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

      // Wrap around bounds
      if (p.y < -10) {
        p.y = bgCanvas.height + 10;
        p.x = Math.random() * bgCanvas.width;
      }

      bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(0.8, p.alpha))})`;
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      bgCtx.fill();
    });
  }

  // --- Pixel Fireworks ---
  class PixelFirework {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * (bgCanvas.width * 0.8) + bgCanvas.width * 0.1;
      this.y = bgCanvas.height;
      this.targetY = Math.random() * (bgCanvas.height * 0.4) + bgCanvas.height * 0.15;
      this.speed = Math.random() * 3 + 4;
      this.exploded = false;
      this.particles = [];
      this.colorPalette = ['#ffffff', '#ff69b4', '#c77dff', '#4cc9f0', '#ff85a1'];
      this.color = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    }

    explode() {
      this.exploded = true;
      const count = Math.floor(Math.random() * 25) + 30;
      const pixelSize = 3;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const velocity = Math.random() * 2.5 + 1;
        this.particles.push({
          x: this.x,
          y: this.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          alpha: 1.0,
          decay: Math.random() * 0.015 + 0.01,
          size: pixelSize
        });
      }
    }

    update() {
      if (!this.exploded) {
        this.y -= this.speed;
        if (this.y <= this.targetY) {
          this.explode();
        }
      } else {
        this.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy + 0.2; // Gentle gravity
          p.alpha -= p.decay;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);
      }
    }

    draw() {
      if (!this.exploded) {
        // Rocket tail/head (pixel style)
        bgCtx.fillStyle = this.color;
        bgCtx.fillRect(Math.round(this.x), Math.round(this.y), 3, 3);
      } else {
        // Exploded glowing pixel fragments
        this.particles.forEach(p => {
          bgCtx.fillStyle = p.alpha > 0 ? this.color : 'transparent';
          bgCtx.globalAlpha = Math.max(0, p.alpha);
          bgCtx.shadowBlur = 8;
          bgCtx.shadowColor = this.color;
          bgCtx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
          bgCtx.shadowBlur = 0;
        });
        bgCtx.globalAlpha = 1.0;
      }
    }

    isDead() {
      return this.exploded && this.particles.length === 0;
    }
  }

  let fireworks = [];
  let lastFireworkTime = 0;

  function handleFireworks(now) {
    if (now - lastFireworkTime > 2500) {
      fireworks.push(new PixelFirework());
      lastFireworkTime = now;
    }

    fireworks.forEach(fw => {
      fw.update();
      fw.draw();
    });

    fireworks = fireworks.filter(fw => !fw.isDead());
  }

  // -------------------------------------------------------------------------
  // PIXEL HEART CANVAS
  // -------------------------------------------------------------------------
  const heartCanvas = document.getElementById('heart-canvas');
  const heartCtx = heartCanvas.getContext('2d');

  // Symmetrical 11x10 Pixel Grid Heart
  const HEART_MATRIX = [
    [0,0,1,1,0,0,0,1,1,0,0],
    [0,1,1,1,1,0,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,0,0]
  ];

  function drawPixelHeart(time) {
    heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);

    // Realistic Double-Beat Heartbeat Formula
    const t = time * 0.003;
    const beat = Math.pow(Math.sin(t), 6) + Math.pow(Math.sin(t * 2.5), 4) * 0.3;
    const scale = 1 + beat * 0.12;
    const glowIntensity = 10 + beat * 20;

    const cols = HEART_MATRIX[0].length;
    const rows = HEART_MATRIX.length;
    const basePixelSize = 8;
    const pixelSize = basePixelSize * scale;

    const totalWidth = cols * pixelSize;
    const totalHeight = rows * pixelSize;
    const offsetX = (heartCanvas.width - totalWidth) / 2;
    const offsetY = (heartCanvas.height - totalHeight) / 2;

    heartCtx.save();
    heartCtx.shadowColor = '#ff2a85';
    heartCtx.shadowBlur = glowIntensity;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (HEART_MATRIX[r][c] === 1) {
          // Pixel Color Gradient from Center
          const alpha = 0.85 + beat * 0.15;
          heartCtx.fillStyle = `rgba(255, 105, 180, ${alpha})`;

          // Highlight top rim pixels for 3D glow
          if (r < 3) {
            heartCtx.fillStyle = `rgba(255, 182, 193, ${alpha})`;
          }

          heartCtx.fillRect(
            offsetX + c * pixelSize,
            offsetY + r * pixelSize,
            pixelSize - 1, // Slight gap for retro grid feel
            pixelSize - 1
          );
        }
      }
    }
    heartCtx.restore();
  }

  // -------------------------------------------------------------------------
  // MAIN ANIMATION LOOP (60 FPS)
  // -------------------------------------------------------------------------
  function render(time) {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    updateAndDrawParticles();
    handleFireworks(time);
    drawPixelHeart(time);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
});
