(function registerTopographicBackground() {
  'use strict';

  // ===== НАСТРОЙКИ ФОНА =====
  // Эти значения можно менять независимо от алгоритма отрисовки.
  const CONTOUR_LEVELS = [0.12, 0.17, 0.22, 0.27, 0.32, 0.37, 0.42, 0.47, 0.52, 0.57, 0.62, 0.67, 0.72, 0.77, 0.82, 0.87];
  const ANIMATION_SPEED = 0.0005;
  const REDUCED_MOTION_SPEED = 0.00012;
  const DESKTOP_GRID_SIZE = 13; // Меньше значение — выше плотность/детализация.
  const MOBILE_GRID_SIZE = 15;
  const LINE_COLOR = 'rgba(112, 112, 112, 0.5)';
  const MIN_LINE_WIDTH = 2.5;
  const MAX_LINE_WIDTH = 3.4;
  const DESKTOP_PIXEL_RATIO_LIMIT = 1.6;
  const MOBILE_PIXEL_RATIO_LIMIT = 1.25;

  const HILLS = [
    [-0.12, 0.12, 0.38, 0.19, 0.2],
    [0.18, -0.14, 0.34, 0.16, 1.1],
    [0.52, 0.08, 0.31, 0.18, 2.0],
    [0.9, -0.08, 0.4, 0.2, 2.8],
    [1.14, 0.32, 0.35, 0.16, 3.7],
    [0.76, 0.48, 0.38, 0.2, 4.5],
    [0.28, 0.42, 0.36, 0.17, 5.4],
    [-0.08, 0.64, 0.42, 0.19, 0.8],
    [0.18, 0.94, 0.38, 0.17, 1.8],
    [0.58, 0.84, 0.4, 0.2, 3.0],
    [1.05, 0.88, 0.43, 0.18, 4.1],
    [0.62, 1.18, 0.37, 0.16, 5.1]
  ];

  class TopographicBackground {
    constructor(element) {
      this.element = element;
      this.canvas = element.querySelector('canvas');
      this.context = this.canvas?.getContext('2d');
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.animationFrameId = 0;
      this.temporalSpeed = ANIMATION_SPEED;
      this.resize = this.resize.bind(this);
      this.render = this.render.bind(this);
      this.handleMotionPreference = this.handleMotionPreference.bind(this);
      this.destroy = this.destroy.bind(this);

      if (!this.context) return;
      // Keep the critical background layer independent from stylesheet cache/redesigns.
      Object.assign(this.element.style, {
        position: 'fixed',
        inset: '0',
        // The page surface may have its own background after a redesign. Keep the
        // canvas above that surface, while content containers stay above the canvas.
        zIndex: '10',
        overflow: 'hidden',
        pointerEvents: 'none',
        background: '#000'
      });
      Object.assign(this.canvas.style, {
        display: 'block',
        width: '100%',
        height: '100%',
        opacity: '0.78'
      });
      this.reducedMotion.addEventListener?.('change', this.handleMotionPreference);
      this.resize();
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(this.resize);
        this.resizeObserver.observe(document.documentElement);
      } else {
        window.addEventListener('resize', this.resize);
      }
      window.addEventListener('pagehide', this.destroy, { once: true });
      this.handleMotionPreference();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      const pixelRatioLimit = this.width < 768 ? MOBILE_PIXEL_RATIO_LIMIT : DESKTOP_PIXEL_RATIO_LIMIT;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, pixelRatioLimit);
      this.canvas.width = Math.round(this.width * pixelRatio);
      this.canvas.height = Math.round(this.height * pixelRatio);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      this.cellSize = this.width < 768 ? MOBILE_GRID_SIZE : DESKTOP_GRID_SIZE;
      this.columns = Math.ceil(this.width / this.cellSize) + 3;
      this.rows = Math.ceil(this.height / this.cellSize) + 3;
      this.field = new Float32Array(this.columns * this.rows);
      this.paint(this.reducedMotion.matches ? 1.7 : this.getTime(performance.now()));
    }

    getTime(now) {
      // RAF timestamps are monotonic, so the field cannot stall or restart between cycles.
      return now * this.temporalSpeed;
    }

    handleMotionPreference() {
      // Reduced motion keeps the living background, but lowers its speed substantially.
      this.temporalSpeed = this.reducedMotion.matches ? REDUCED_MOTION_SPEED : ANIMATION_SPEED;
      if (!this.animationFrameId) {
        this.animationFrameId = requestAnimationFrame(this.render);
      }
    }

    render(now) {
      const time = this.getTime(now);
      this.paint(time);
      // Reset before scheduling so preference changes can never leave a stale frame id.
      this.animationFrameId = 0;
      this.animationFrameId = requestAnimationFrame(this.render);
    }

    destroy() {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
      this.resizeObserver?.disconnect();
      window.removeEventListener('resize', this.resize);
      this.reducedMotion.removeEventListener?.('change', this.handleMotionPreference);
    }

    updateHills(phase) {
      const shortSide = Math.min(this.width, this.height);
      this.activeHills = HILLS.map(([baseX, baseY, radius, strength, seed]) => ({
        x: this.width * baseX + Math.sin(phase + seed) * shortSide * 0.055,
        y: this.height * baseY + Math.cos(phase + seed * 1.3) * shortSide * 0.048,
        radius: shortSide * radius * (1 + Math.sin(phase + seed * 0.7) * 0.06),
        strength
      }));
    }

    sampleHeight(x, y, phase) {
      const shortSide = Math.min(this.width, this.height);
      const nx = x / shortSide;
      const ny = y / shortSide;
      // Several moving low-frequency wave planes act as smooth, viewport-wide 3D noise.
      let height = 0.48
        + Math.sin(nx * 4.2 + ny * 2.1 + phase) * 0.17
        + Math.sin(nx * 2.3 - ny * 4.8 - phase + 1.4) * 0.13
        + Math.cos(nx * 5.7 + ny * 3.6 + phase + 0.7) * 0.09
        + Math.sin(nx * 8.8 - ny * 6.1 - phase * 2) * 0.035;

      for (const hill of this.activeHills) {
        const dx = (x - hill.x) / hill.radius;
        const dy = (y - hill.y) / (hill.radius * 0.86);
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 1) {
          const influence = 1 - distanceSquared;
          height += influence * influence * influence * hill.strength;
        }
      }
      return height;
    }

    buildHeightField(phase) {
      this.updateHills(phase);
      for (let row = 0; row < this.rows; row += 1) {
        const y = (row - 1) * this.cellSize;
        for (let column = 0; column < this.columns; column += 1) {
          const x = (column - 1) * this.cellSize;
          this.field[row * this.columns + column] = this.sampleHeight(x, y, phase);
        }
      }
    }

    interpolate(level, firstValue, secondValue) {
      const difference = secondValue - firstValue;
      return Math.abs(difference) < 0.00001 ? 0.5 : (level - firstValue) / difference;
    }

    drawContours(level) {
      const context = this.context;
      const size = this.cellSize;
      const columns = this.columns;
      const field = this.field;
      context.beginPath();

      for (let row = 0; row < this.rows - 1; row += 1) {
        for (let column = 0; column < columns - 1; column += 1) {
          const topLeft = field[row * columns + column];
          const topRight = field[row * columns + column + 1];
          const bottomLeft = field[(row + 1) * columns + column];
          const bottomRight = field[(row + 1) * columns + column + 1];
          const state = (topLeft >= level ? 1 : 0)
            | (topRight >= level ? 2 : 0)
            | (bottomRight >= level ? 4 : 0)
            | (bottomLeft >= level ? 8 : 0);
          if (state === 0 || state === 15) continue;

          const x = (column - 1) * size;
          const y = (row - 1) * size;
          const points = [
            [x + size * this.interpolate(level, topLeft, topRight), y],
            [x + size, y + size * this.interpolate(level, topRight, bottomRight)],
            [x + size * this.interpolate(level, bottomLeft, bottomRight), y + size],
            [x, y + size * this.interpolate(level, topLeft, bottomLeft)]
          ];
          const segment = (first, second) => {
            context.moveTo(points[first][0], points[first][1]);
            context.lineTo(points[second][0], points[second][1]);
          };

          if (state === 1 || state === 14) segment(3, 0);
          else if (state === 2 || state === 13) segment(0, 1);
          else if (state === 3 || state === 12) segment(3, 1);
          else if (state === 4 || state === 11) segment(1, 2);
          else if (state === 6 || state === 9) segment(0, 2);
          else if (state === 7 || state === 8) segment(3, 2);
          else {
            const centerIsHigh = (topLeft + topRight + bottomLeft + bottomRight) * 0.25 >= level;
            if ((state === 5 && centerIsHigh) || (state === 10 && !centerIsHigh)) {
              segment(0, 1);
              segment(2, 3);
            } else {
              segment(3, 0);
              segment(1, 2);
            }
          }
        }
      }
      context.stroke();
    }

    paint(time) {
      const context = this.context;
      context.clearRect(0, 0, this.width, this.height);
      context.fillStyle = '#000';
      context.fillRect(0, 0, this.width, this.height);
      context.strokeStyle = LINE_COLOR;
      context.lineWidth = Math.max(MIN_LINE_WIDTH, Math.min(MAX_LINE_WIDTH, Math.min(this.width, this.height) / 260));
      context.lineCap = 'round';
      context.lineJoin = 'round';

      // Both the scalar field and its contours are rebuilt from the new time every frame.
      this.buildHeightField(time);
      CONTOUR_LEVELS.forEach(level => this.drawContours(level));
    }
  }

  window.TopographicBackground = TopographicBackground;
  document.querySelectorAll('[data-topographic-background]').forEach(element => {
    element.topographicBackground = new TopographicBackground(element);
  });
})();
