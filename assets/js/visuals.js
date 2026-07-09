/* =====================================================
   VISUALS.JS — 可视化交互组件
   Typewriter / StaggerReveal / Collision / StepSequencer
   / TerminalSim / NumCounter
   自动初始化：页面加载后扫描 [data-visual] 属性
   ===================================================== */
(function() {
  'use strict';

  const ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00D4FF';

  // ============== 1. 打字机效果 ==============
  class Typewriter {
    constructor(el, opts = {}) {
      this.el = el;
      this.speed = opts.speed || 40;
      this.delay = opts.delay || 0;
      this.cursor = opts.cursor !== false;
      this.loop = opts.loop || false;
      this.texts = Array.isArray(opts.texts) ? opts.texts : [el.textContent.trim()];
      this.currentTextIdx = 0;
      this.charIdx = 0;
      this._running = false;
    }

    async start() {
      this._running = true;
      if (this.delay) await sleep(this.delay);
      while (this._running) {
        const text = this.texts[this.currentTextIdx];
        await this._typeText(text);
        if (!this._running) break;
        if (this.loop && this.texts.length > 1) {
          await sleep(1500);
          await this._deleteText(text.length);
          await sleep(400);
          this.currentTextIdx = (this.currentTextIdx + 1) % this.texts.length;
        } else {
          break;
        }
      }
      if (this.cursor) this.el.classList.add('done');
    }

    async _typeText(text) {
      this.el.textContent = '';
      this.el.classList.add('typewriter');
      for (let i = 0; i < text.length && this._running; i++) {
        this.el.textContent += text[i];
        await sleep(this.speed + Math.random() * 20);
      }
    }

    async _deleteText(len) {
      for (let i = 0; i < len && this._running; i++) {
        this.el.textContent = this.el.textContent.slice(0, -1);
        await sleep(this.speed * 0.4);
      }
    }

    stop() { this._running = false; }
  }

  // ============== 2. 渐进揭示 ==============
  class StaggerReveal {
    constructor(container, opts = {}) {
      this.container = container;
      this.delay = opts.delay || 80;
      this.threshold = opts.threshold || 0.15;
      this._done = false;
      this._observer = null;
    }

    start() {
      const children = Array.from(this.container.children);
      children.forEach((child, i) => {
        child.style.setProperty('--i', i);
        child.style.transitionDelay = (i * this.delay) + 'ms';
      });

      this._observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this._done) {
          this._done = true;
          children.forEach(c => c.classList.add('revealed'));
          this._observer.disconnect();
        }
      }, { threshold: this.threshold });
      this._observer.observe(this.container);
    }
  }

  // ============== 3. 碰撞动画 ==============
  class CollisionController {
    constructor(stage, opts = {}) {
      this.stage = stage;
      this.threshold = opts.threshold || 0.3;
      this._done = false;
    }

    start() {
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this._done) {
          this._done = true;
          // Small delay so the user sees the slide first
          setTimeout(() => this.stage.classList.add('active'), 300);
          obs.disconnect();
        }
      }, { threshold: this.threshold });
      obs.observe(this.stage);
    }
  }

  // ============== 4. 步骤定序器 ==============
  class StepSequencer {
    constructor(container, opts = {}) {
      this.container = container;
      this.steps = Array.from(container.querySelectorAll('.step-item'));
      this.dots = Array.from(container.querySelectorAll('.step-dot'));
      this.autoAdvance = opts.autoAdvance || false;
      this.autoDelay = opts.autoDelay || 2500;
      this.current = 0;
      this._timer = null;
    }

    start() {
      this._show(0);
      // Click on dots
      this.dots.forEach((dot, i) => {
        dot.addEventListener('click', () => this.goTo(i));
      });
      // Click on steps
      this.steps.forEach((step, i) => {
        step.style.cursor = 'pointer';
        step.addEventListener('click', () => this.goTo(i));
      });
      // Keyboard navigation
      const handler = (e) => {
        const slide = this.container.closest('.slide');
        if (!slide || !slide.classList.contains('active')) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
      };
      document.addEventListener('keydown', handler);
      this.container._keyHandler = handler;

      if (this.autoAdvance) this._startAuto();
    }

    _show(idx) {
      this.steps.forEach((s, i) => s.classList.toggle('active', i === idx));
      this.dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      this.current = idx;
    }

    goTo(idx) {
      if (idx < 0 || idx >= this.steps.length) return;
      this._show(idx);
      this._resetAuto();
    }

    next() { this.goTo(this.current + 1); }
    prev() { this.goTo(this.current - 1); }

    _startAuto() {
      this._timer = setInterval(() => {
        this.goTo((this.current + 1) % this.steps.length);
      }, this.autoDelay);
    }

    _resetAuto() {
      if (!this.autoAdvance) return;
      clearInterval(this._timer);
      this._startAuto();
    }

    destroy() {
      clearInterval(this._timer);
      if (this.container._keyHandler) {
        document.removeEventListener('keydown', this.container._keyHandler);
      }
    }
  }

  // ============== 5. 终端模拟器 ==============
  class TerminalSim {
    constructor(el, opts = {}) {
      this.el = el;
      this.body = el.querySelector('.terminal-body');
      this.lines = opts.lines || [];
      this.speed = opts.speed || 30;
      this.autoStart = opts.autoStart !== false;
      this._running = false;
    }

    async start() {
      if (!this.body || this._running) return;
      this._running = true;
      this.body.innerHTML = '';

      for (const line of this.lines) {
        if (!this._running) break;
        const div = document.createElement('div');
        div.className = line.cls || '';
        this.body.appendChild(div);

        if (line.text === '') {
          div.innerHTML = '&nbsp;';
          await sleep(line.wait || 200);
          continue;
        }

        for (let i = 0; i < line.text.length && this._running; i++) {
          const span = document.createElement('span');
          span.textContent = line.text[i];
          span.className = 'tw-char';
          div.appendChild(span);
          await sleep(line.speed || this.speed);
        }

        if (line.wait) await sleep(line.wait);
        this.body.scrollTop = this.body.scrollHeight;
      }
    }

    stop() { this._running = false; }
    reset() { this._running = false; if (this.body) this.body.innerHTML = ''; }
  }

  // ============== 6. 数字滚动计数器 ==============
  class NumCounter {
    constructor(el, opts = {}) {
      this.el = el;
      this.target = parseInt(el.dataset.target) || 0;
      this.duration = opts.duration || 1500;
      this.prefix = opts.prefix || '';
      this.suffix = opts.suffix || '';
      this._done = false;
    }

    start() {
      if (this._done) return;
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this._done) {
          this._done = true;
          this._animate();
          obs.disconnect();
        }
      }, { threshold: 0.5 });
      obs.observe(this.el);
    }

    _animate() {
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / this.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * this.target);
        this.el.textContent = this.prefix + current.toLocaleString() + this.suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }

  // ============== 7. 弹出覆盖层控制器 ==============
  class PopupController {
    constructor() {
      this._overlay = null;
      this._bindEsc();
    }

    _getOverlay() {
      if (!this._overlay) {
        this._overlay = document.createElement('div');
        this._overlay.className = 'popup-overlay';
        this._overlay.innerHTML = `
          <div class="popup-panel">
            <div class="popup-panel-header">
              <h3 class="popup-panel-title"></h3>
              <button class="popup-close">✕</button>
            </div>
            <div class="popup-panel-body"></div>
          </div>`;
        document.body.appendChild(this._overlay);

        // Close handlers
        this._overlay.querySelector('.popup-close').addEventListener('click', () => this.close());
        this._overlay.addEventListener('click', (e) => {
          if (e.target === this._overlay) this.close();
        });
      }
      return this._overlay;
    }

    _bindEsc() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._overlay && this._overlay.classList.contains('active')) {
          this.close();
        }
      });
    }

    open(title, contentHtml) {
      const overlay = this._getOverlay();
      overlay.querySelector('.popup-panel-title').textContent = title;
      overlay.querySelector('.popup-panel-body').innerHTML = contentHtml;
      overlay.classList.add('active');
    }

    close() {
      if (this._overlay) {
        this._overlay.classList.remove('active');
      }
    }
  }

  // Singleton
  const popupCtrl = new PopupController();

  // Attach to [data-visual="popup"] triggers
  function initPopups() {
    document.querySelectorAll('[data-visual="popup"]').forEach(el => {
      if (el._popupBound) return;
      el._popupBound = true;
      const title = el.dataset.popupTitle || '详情';
      // Clone the inner content for the popup, excluding the trigger hint
      const content = el.dataset.popupContent || el.querySelector('.popup-detail')?.innerHTML || el.innerHTML;
      el.addEventListener('click', (e) => {
        // Don't trigger if clicking a nested button/link
        if (e.target.closest('button, a, .popup-close')) return;
        popupCtrl.open(title, content);
      });
    });
  }

  // ============== 8. 视频模拟播放器 ==============
  class VideoEmbed {
    constructor(el) {
      this.el = el;
      this.frames = [];
      this._currentFrame = 0;
      this._modal = null;
      this._timer = null;
      this._parseFrames();
      this._bind();
    }

    _parseFrames() {
      // Parse frames from data attribute or child elements
      try {
        const raw = this.el.dataset.videoFrames;
        if (raw) {
          this.frames = JSON.parse(raw);
        }
      } catch(e) {}

      // Fallback: use child elements with .v-frame-content class
      if (this.frames.length === 0) {
        const children = this.el.querySelectorAll('.v-frame-content');
        this.frames = Array.from(children).map(c => ({
          title: c.dataset.title || '',
          body: c.innerHTML || ''
        }));
      }
    }

    _bind() {
      this.el.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        this.play();
      });
    }

    play() {
      if (this.frames.length === 0) return;
      this._currentFrame = 0;
      this._showModal();
      this._renderFrame(0);
      this._startAutoAdvance();
    }

    _showModal() {
      if (this._modal) {
        this._modal.classList.add('active');
        return;
      }

      const modal = document.createElement('div');
      modal.className = 'video-modal active';
      const title = this.el.dataset.videoTitle || '演示视频';
      modal.innerHTML = `
        <div class="video-player">
          <div class="video-player-header">
            <span>🎬 ${title}</span>
            <button class="v-ctrl-btn video-modal-close">✕</button>
          </div>
          <div class="video-player-body">
            ${this.frames.map((f, i) => `
              <div class="v-frame${i === 0 ? ' active' : ''}" data-vframe="${i}">
                ${f.title ? `<h3>${f.title}</h3>` : ''}
                ${f.body ? `<div>${f.body}</div>` : ''}
              </div>`).join('')}
          </div>
          <div class="video-player-controls">
            <button class="v-ctrl-btn v-prev">⏮</button>
            <button class="v-ctrl-btn v-play-pause">⏸</button>
            <button class="v-ctrl-btn v-next">⏭</button>
            <div class="v-progress">
              <div class="v-progress-fill"></div>
            </div>
            <div class="v-frame-dots">
              ${this.frames.map((_, i) => `
                <span class="v-frame-dot${i === 0 ? ' active' : ''}" data-vdot="${i}"></span>`).join('')}
            </div>
            <span class="v-frame-counter" style="font-size:12px;color:var(--text-muted)">1/${this.frames.length}</span>
          </div>
        </div>`;

      document.body.appendChild(modal);
      this._modal = modal;

      // Bind controls
      modal.querySelector('.video-modal-close').addEventListener('click', () => this.close());
      modal.querySelector('.v-prev').addEventListener('click', () => this._goTo(this._currentFrame - 1));
      modal.querySelector('.v-next').addEventListener('click', () => this._goTo(this._currentFrame + 1));
      modal.querySelector('.v-play-pause').addEventListener('click', () => {
        if (this._timer) { this._pause(); }
        else { this._startAutoAdvance(); }
      });
      modal.querySelectorAll('.v-frame-dot').forEach(dot => {
        dot.addEventListener('click', () => this._goTo(parseInt(dot.dataset.vdot)));
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });

      // Keyboard
      this._keyHandler = (e) => {
        if (!this._modal || !this._modal.classList.contains('active')) return;
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowRight') this._goTo(this._currentFrame + 1);
        if (e.key === 'ArrowLeft') this._goTo(this._currentFrame - 1);
        if (e.key === ' ') { e.preventDefault(); this._timer ? this._pause() : this._startAutoAdvance(); }
      };
      document.addEventListener('keydown', this._keyHandler);
    }

    _renderFrame(idx) {
      if (!this._modal) return;
      this._currentFrame = idx;
      this._modal.querySelectorAll('.v-frame').forEach((f, i) => f.classList.toggle('active', i === idx));
      this._modal.querySelectorAll('.v-frame-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
      const pct = ((idx + 1) / this.frames.length) * 100;
      this._modal.querySelector('.v-progress-fill').style.width = pct + '%';
      this._modal.querySelector('.v-frame-counter').textContent = `${idx + 1}/${this.frames.length}`;
    }

    _goTo(idx) {
      if (idx < 0 || idx >= this.frames.length) return;
      this._renderFrame(idx);
      this._resetAuto();
    }

    _startAutoAdvance() {
      this._pause();
      const btn = this._modal?.querySelector('.v-play-pause');
      if (btn) btn.textContent = '⏸';
      this._timer = setInterval(() => {
        if (this._currentFrame >= this.frames.length - 1) {
          this._pause();
        } else {
          this._renderFrame(this._currentFrame + 1);
        }
      }, 3000);
    }

    _pause() {
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
      const btn = this._modal?.querySelector('.v-play-pause');
      if (btn) btn.textContent = '▶';
    }

    _resetAuto() {
      if (this._timer) this._startAutoAdvance();
    }

    close() {
      this._pause();
      if (this._modal) this._modal.classList.remove('active');
      if (this._keyHandler) {
        document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = null;
      }
    }
  }

  // ============== 9. 数字高亮脉冲 ==============
  class GlowHighlight {
    constructor(el) {
      this.el = el;
      this._init();
    }
    _init() {
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.el.classList.add('glow-pulse');
          obs.disconnect();
        }
      }, { threshold: 0.5 });
      obs.observe(this.el);
    }
  }

  // ============== 10. 画卷展开（Scroll Unroll） ==============
  class ScrollUnroll {
    constructor(el) {
      this.el = el;
      this.items = Array.from(el.querySelectorAll('.scroll-unroll-item'));
      this._delay = parseInt(el.dataset.unrollDelay) || 250;
      this._init();
    }

    _init() {
      if (this.items.length === 0) return;
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this._unroll();
          obs.disconnect();
        }
      }, { threshold: 0.3 });
      obs.observe(this.el);
    }

    _unroll() {
      this.el.classList.add('active');
      this.items.forEach((item, i) => {
        setTimeout(() => {
          item.classList.add('revealed');
        }, this._delay * (i + 1));
      });
    }
  }


  // ============== 11. 数字流光计数器（升级） ==============
  class FlowCounter {
    constructor(el, opts = {}) {
      this.el = el;
      this.target = parseFloat(el.dataset.target) || 0;
      this.duration = opts.duration || 1800;
      this.decimals = opts.decimals || 0;
      this.prefix = opts.prefix || '';
      this.suffix = opts.suffix || '';
      this._done = false;
      if (!el.classList.contains('num-counter-flow')) el.classList.add('num-counter-flow');
    }
    start() {
      if (this._done) return;
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this._done) {
          this._done = true;
          this._animate();
          obs.disconnect();
        }
      }, { threshold: 0.5 });
      obs.observe(this.el);
    }
    _animate() {
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / this.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);  // quartic ease-out
        const current = eased * this.target;
        this.el.textContent = this.prefix + current.toFixed(this.decimals) + this.suffix;
        if (progress < 1) requestAnimationFrame(step);
        else this.el.textContent = this.prefix + this.target.toFixed(this.decimals) + this.suffix;
      };
      requestAnimationFrame(step);
    }
  }

  // ============== 12. 鼠标视差倾斜（轻量级） ==============
  class ParallaxTilt {
    constructor(el, opts = {}) {
      this.el = el;
      this.maxAngle = opts.maxAngle || 8;
      this.scale = opts.scale || 1.02;
      this._bind();
    }
    _bind() {
      this.el.addEventListener('mousemove', (e) => {
        const r = this.el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        this.el.style.transform = `perspective(1000px) rotateY(${x * this.maxAngle}deg) rotateX(${-y * this.maxAngle}deg) scale(${this.scale})`;
      });
      this.el.addEventListener('mouseleave', () => {
        this.el.style.transform = '';
      });
    }
  }

  // ============== 13. 文字逐字揭示 ==============
  class CharReveal {
    constructor(el, opts = {}) {
      this.el = el;
      this.text = el.textContent;
      this.stagger = opts.stagger || 30;
      this.keys = opts.keys || '';
      this._init();
    }
    _init() {
      this.el.innerHTML = '';
      this.el.classList.add('char-reveal');
      this.chars = [];
      for (const ch of this.text) {
        const span = document.createElement('span');
        span.className = 'ch' + (this.keys && this.keys.includes(ch) ? ' key' : '');
        span.textContent = ch;
        if (ch === ' ') span.style.width = '0.3em';
        this.el.appendChild(span);
        this.chars.push(span);
      }
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this._reveal();
          obs.disconnect();
        }
      }, { threshold: 0.3 });
      obs.observe(this.el);
    }
    _reveal() {
      this.el.classList.add('visible');
      this.chars.forEach((ch, i) => {
        ch.style.transitionDelay = (i * this.stagger) + 'ms';
      });
    }
  }

  // ============== 14. 数字粒子雨 ==============
  class MatrixRain {
    constructor(container, opts = {}) {
      this.container = container;
      this.density = opts.density || 30;
      this.speed = opts.speed || 8;  // seconds
      this.chars = opts.chars || '01アイウエオカキクケコサシスセソ0123456789';
      this._init();
    }
    _init() {
      if (!this.container.classList.contains('matrix-rain')) {
        this.container.classList.add('matrix-rain');
      }
      for (let i = 0; i < this.density; i++) {
        const drop = document.createElement('span');
        drop.className = 'drop';
        drop.style.left = (Math.random() * 100) + '%';
        drop.style.animationDuration = (this.speed + Math.random() * 6) + 's';
        drop.style.animationDelay = (Math.random() * 4) + 's';
        drop.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
        this.container.appendChild(drop);
        // 周期性更换字符
        setInterval(() => {
          if (Math.random() > 0.7) {
            drop.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
          }
        }, 500);
      }
    }
  }

  // ============== 15. 雷达扫描控制器 ==============
  class RadarScan {
    constructor(el, opts = {}) {
      this.el = el;
      this.targets = opts.targets || [];  // [{x:0.3, y:0.4, delay:0}, ...]
      this._init();
    }
    _init() {
      if (!this.el.classList.contains('radar-scan')) {
        this.el.classList.add('radar-scan');
      }
      this.targets.forEach(t => {
        const dot = document.createElement('div');
        dot.className = 'radar-target';
        dot.style.left = (t.x * 100) + '%';
        dot.style.top = (t.y * 100) + '%';
        dot.style.animationDelay = (t.delay || 0) + 's';
        this.el.appendChild(dot);
      });
    }
  }


  // ============== 24. 雷达图（Radar Chart） ==============
  class RadarChart {
    constructor(el) {
      this.el = el;
      this.labels = JSON.parse(el.dataset.radarLabels || '[]');
      this.values = JSON.parse(el.dataset.radarValues || '[]');
      this.values2 = JSON.parse(el.dataset.radarValues2 || '[]');
      this.maxValue = parseFloat(el.dataset.radarMax) || 100;
      this._svg = null;
    }
    start() {
      this._render();
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { this._animateIn(); obs.disconnect(); }
      }, { threshold: 0.3 });
      obs.observe(this.el);
    }
    _render() {
      const n = this.labels.length;
      if (n < 3) return;
      const size = 400, cx = size / 2, cy = size / 2, r = 160;
      const angles = this.labels.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);

      this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this._svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      this._svg.classList.add('radar-chart-svg');

      // Grid circles
      [0.25, 0.5, 0.75, 1].forEach(level => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r * level);
        circle.classList.add('radar-grid');
        this._svg.appendChild(circle);
      });

      // Axis lines and labels
      angles.forEach((angle, i) => {
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cx); line.setAttribute('y1', cy);
        line.setAttribute('x2', x); line.setAttribute('y2', y);
        line.classList.add('radar-axis');
        this._svg.appendChild(line);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const lx = cx + (r + 24) * Math.cos(angle);
        const ly = cy + (r + 24) * Math.sin(angle);
        label.setAttribute('x', lx); label.setAttribute('y', ly);
        label.classList.add('radar-axis-label');
        label.textContent = this.labels[i];
        this._svg.appendChild(label);
      });

      // Data 2 polygon (drawn first, behind data 1)
      if (this.values2.length === n) {
        const pts2 = angles.map((a, i) => {
          const dist = (this.values2[i] / this.maxValue) * r;
          return `${cx + dist * Math.cos(a)},${cy + dist * Math.sin(a)}`;
        }).join(' ');
        const poly2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly2.setAttribute('points', pts2);
        poly2.classList.add('radar-fill-2');
        this._svg.appendChild(poly2);

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        path2.setAttribute('points', pts2);
        path2.classList.add('radar-stroke-2');
        this._svg.appendChild(path2);
      }

      // Data 1 polygon
      const pts = angles.map((a, i) => {
        const dist = (this.values[i] / this.maxValue) * r;
        return `${cx + dist * Math.cos(a)},${cy + dist * Math.sin(a)}`;
      }).join(' ');

      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', pts);
      poly.classList.add('radar-fill');
      this._svg.appendChild(poly);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      path.setAttribute('points', pts);
      path.classList.add('radar-stroke');
      this._svg.appendChild(path);

      // Dots
      angles.forEach((a, i) => {
        const dist = (this.values[i] / this.maxValue) * r;
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', cx + dist * Math.cos(a));
        dot.setAttribute('cy', cy + dist * Math.sin(a));
        dot.setAttribute('r', '5');
        dot.classList.add('radar-dot');
        this._svg.appendChild(dot);
      });

      this.el.appendChild(this._svg);
    }
    _animateIn() {
      // Polygons already visible; add pulse effect
      if (this._svg) {
        this._svg.style.transition = 'filter 0.5s';
        this._svg.style.filter = 'drop-shadow(0 0 16px var(--glow, rgba(0,240,255,0.4)))';
        setTimeout(() => { this._svg.style.filter = 'none'; }, 1500);
      }
    }
  }

  // ============== 25. 架构图（Architecture Diagram） ==============
  class ArchDiagram {
    constructor(el) {
      this.el = el;
      this._layers = [];
      this._connectorsSVG = null;
    }
    start() {
      this._parseLayers();
      if (this._layers.length === 0) return;
      this._animIn();
    }
    _parseLayers() {
      const layerEls = this.el.querySelectorAll('[data-layer]');
      const layerMap = {};
      layerEls.forEach(el => {
        const n = parseInt(el.dataset.layer);
        if (!layerMap[n]) layerMap[n] = [];
        layerMap[n].push(el);
      });
      this._layers = Object.keys(layerMap).sort((a, b) => b - a).map(k => layerMap[k]);
    }
    _animIn() {
      // Sequential layer reveal
      this._layers.forEach((layer, i) => {
        layer.forEach(node => {
          node.style.opacity = '0';
          node.style.transform = 'translateY(20px)';
          node.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        setTimeout(() => {
          layer.forEach(node => {
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
          });
        }, i * 200);
      });
    }
  }

  // ============== 26. 对比滑动器（Comparison Slider） ==============
  class CompareSlider {
    constructor(el) {
      this.el = el;
      this.before = el.querySelector('.compare-before');
      this.divider = el.querySelector('.compare-divider');
      this._dragging = false;
    }
    start() {
      if (!this.divider) return;
      this.divider.addEventListener('mousedown', (e) => { this._dragging = true; e.preventDefault(); });
      this.divider.addEventListener('touchstart', (e) => { this._dragging = true; e.preventDefault(); });
      document.addEventListener('mousemove', (e) => this._drag(e.clientX));
      document.addEventListener('touchmove', (e) => this._drag(e.touches[0].clientX));
      document.addEventListener('mouseup', () => { this._dragging = false; });
      document.addEventListener('touchend', () => { this._dragging = false; });
    }
    _drag(clientX) {
      if (!this._dragging || !this.before) return;
      const rect = this.el.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(5, Math.min(95, pct));
      this.before.style.clipPath = `inset(0 calc(100% - ${pct}%) 0 0)`;
      if (this.divider) this.divider.style.left = pct + '%';
    }
  }

  // ============== 27. 仪表盘网格（Dashboard Grid） ==============
  class DashboardGrid {
    constructor(el) {
      this.el = el;
      this.cards = Array.from(el.querySelectorAll('.dash-card'));
    }
    start() {
      this.cards.forEach(card => this._createGauge(card));
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { this._animateGauges(); obs.disconnect(); }
      }, { threshold: 0.3 });
      obs.observe(this.el);
    }
    _createGauge(card) {
      const value = parseFloat(card.dataset.value) || 0;
      const max = parseFloat(card.dataset.max) || 100;
      const pct = Math.min(1, value / max);
      const circumference = 2 * Math.PI * 40; // r=40

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.classList.add('dash-gauge');

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bg.setAttribute('cx', '50'); bg.setAttribute('cy', '50'); bg.setAttribute('r', '40');
      bg.classList.add('dash-ring-bg');
      svg.appendChild(bg);

      const fill = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      fill.setAttribute('cx', '50'); fill.setAttribute('cy', '50'); fill.setAttribute('r', '40');
      fill.classList.add('dash-ring-fill');
      fill.style.strokeDasharray = circumference;
      fill.style.strokeDashoffset = circumference;
      fill.style.transform = 'rotate(-90deg)';
      fill.style.transformOrigin = '50% 50%';
      fill._targetOffset = circumference * (1 - pct);
      svg.appendChild(fill);

      // Center text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '50'); text.setAttribute('y', '50');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', '18');
      text.setAttribute('font-weight', '900');
      text.setAttribute('fill', 'currentColor');
      text.style.fontFamily = 'var(--font-mono, monospace)';
      text.textContent = Math.round(value);
      svg.appendChild(text);

      card.insertBefore(svg, card.firstChild);
    }
    _animateGauges() {
      this.cards.forEach(card => {
        const fill = card.querySelector('.dash-ring-fill');
        if (fill && fill._targetOffset !== undefined) {
          setTimeout(() => {
            fill.style.strokeDashoffset = fill._targetOffset;
          }, 100);
        }
      });
    }
  }

  // ============== 28. 流程管道（Process Pipeline） ==============
  class ProcessPipeline {
    constructor(el) {
      this.el = el;
      this.steps = Array.from(el.querySelectorAll('.pipeline-step'));
    }
    start() {
      if (this.steps.length === 0) return;
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.steps.forEach((step, i) => {
            step.style.opacity = '0';
            step.style.transform = 'translateX(40px)';
            setTimeout(() => {
              step.style.transition = 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)';
              step.style.opacity = '1';
              step.style.transform = 'translateX(0)';
            }, i * 150);
          });
          obs.disconnect();
        }
      }, { threshold: 0.3 });
      obs.observe(this.el);
    }
  }

  // ============== 29. 时间线道路（Timeline Road） ==============
  class TimelineRoad {
    constructor(el) {
      this.el = el;
      this.nodes = Array.from(el.querySelectorAll('.timeline-node'));
    }
    start() {
      if (this.nodes.length === 0) return;
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.nodes.forEach((node, i) => {
            node.style.opacity = '0';
            node.style.transform = 'translateY(30px)';
            setTimeout(() => {
              node.style.transition = 'all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)';
              node.style.opacity = '1';
              node.style.transform = 'translateY(0)';
            }, i * 200);
          });
          obs.disconnect();
        }
      }, { threshold: 0.2 });
      obs.observe(this.el);
    }
  }


  // ============== 工具函数 ==============
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ============== 自动初始化 ==============
  function autoInit() {
    // 打字机: [data-visual="typewriter"]
    document.querySelectorAll('[data-visual="typewriter"]').forEach(el => {
      const tw = new Typewriter(el, {
        speed: parseInt(el.dataset.twSpeed) || 40,
        delay: parseInt(el.dataset.twDelay) || 0,
        loop: el.dataset.twLoop === 'true',
      });
      tw.start();
      el._typewriter = tw;
    });

    // 渐进揭示: [data-visual="stagger"]
    document.querySelectorAll('[data-visual="stagger"]').forEach(el => {
      const sr = new StaggerReveal(el, {
        delay: parseInt(el.dataset.staggerDelay) || 80,
      });
      sr.start();
    });

    // 碰撞: [data-visual="collision"]
    document.querySelectorAll('[data-visual="collision"]').forEach(el => {
      const cc = new CollisionController(el);
      cc.start();
    });

    // 步骤定序器: [data-visual="steps"]
    document.querySelectorAll('[data-visual="steps"]').forEach(el => {
      const ss = new StepSequencer(el, {
        autoAdvance: el.dataset.stepsAuto === 'true',
        autoDelay: parseInt(el.dataset.stepsDelay) || 2500,
      });
      ss.start();
      el._sequencer = ss;
    });

    // 终端模拟器: [data-visual="terminal"]
    document.querySelectorAll('[data-visual="terminal"]').forEach(el => {
      // Terminal lines from data attribute or inner content
      let lines = [];
      try {
        const raw = el.dataset.terminalLines;
        if (raw) lines = JSON.parse(raw);
      } catch(e) {
        lines = [];
      }
      const ts = new TerminalSim(el, {
        lines: lines,
        speed: parseInt(el.dataset.terminalSpeed) || 30,
        autoStart: el.dataset.terminalAuto !== 'false',
      });
      el._terminal = ts;

      // Start on slide activation
      const slide = el.closest('.slide');
      if (slide && slide.classList.contains('active')) {
        setTimeout(() => ts.start(), 400);
      }
    });

    // 数字计数器: [data-visual="counter"]
    document.querySelectorAll('[data-visual="counter"]').forEach(el => {
      const nc = new NumCounter(el, {
        duration: parseInt(el.dataset.counterDuration) || 1500,
        prefix: el.dataset.counterPrefix || '',
        suffix: el.dataset.counterSuffix || '',
      });
      nc.start();
    });

    // 弹出覆盖层: [data-visual="popup"]
    initPopups();

    // 视频模拟: [data-visual="video"]
    document.querySelectorAll('[data-visual="video"]').forEach(el => {
      if (el._videoEmbed) return;
      const ve = new VideoEmbed(el);
      el._videoEmbed = ve;
    });

    // 发光脉冲: [data-visual="glow"]
    document.querySelectorAll('[data-visual="glow"]').forEach(el => {
      new GlowHighlight(el);
    });

    // 画卷展开: [data-visual="scroll-unroll"]
    document.querySelectorAll('[data-visual="scroll-unroll"]').forEach(el => {
      if (el._scrollUnroll) return;
      const su = new ScrollUnroll(el);
      el._scrollUnroll = su;
    });

    // [v4 新增] 数字流光计数器
    document.querySelectorAll('[data-visual="flow-counter"]').forEach(el => {
      if (el._flowCounter) return;
      const fc = new FlowCounter(el, {
        duration: parseInt(el.dataset.counterDuration) || 1800,
        decimals: parseInt(el.dataset.counterDecimals) || 0,
        prefix: el.dataset.counterPrefix || '',
        suffix: el.dataset.counterSuffix || '',
      });
      fc.start();
      el._flowCounter = fc;
    });

    // [v4 新增] 文字逐字揭示
    document.querySelectorAll('[data-visual="char-reveal"]').forEach(el => {
      if (el._charReveal) return;
      const cr = new CharReveal(el, {
        stagger: parseInt(el.dataset.charStagger) || 30,
        keys: el.dataset.charKeys || '',
      });
      el._charReveal = cr;
    });

    // [v4 新增] 视差倾斜
    document.querySelectorAll('[data-visual="parallax-tilt"]').forEach(el => {
      if (el._parallaxTilt) return;
      const pt = new ParallaxTilt(el, {
        maxAngle: parseInt(el.dataset.tiltMax) || 8,
      });
      el._parallaxTilt = pt;
    });

    // [v5 新增] 雷达图
    document.querySelectorAll('[data-visual="radar-chart"]').forEach(el => {
      if (el._radarChart) return;
      const rc = new RadarChart(el);
      rc.start();
      el._radarChart = rc;
    });

    // [v5 新增] 架构图
    document.querySelectorAll('[data-visual="arch-diagram"]').forEach(el => {
      if (el._archDiagram) return;
      const ad = new ArchDiagram(el);
      ad.start();
      el._archDiagram = ad;
    });

    // [v5 新增] 对比滑动器
    document.querySelectorAll('[data-visual="compare-slider"]').forEach(el => {
      if (el._compareSlider) return;
      const cs = new CompareSlider(el);
      cs.start();
      el._compareSlider = cs;
    });

    // [v5 新增] 仪表盘
    document.querySelectorAll('[data-visual="dashboard"]').forEach(el => {
      if (el._dashboardGrid) return;
      const dg = new DashboardGrid(el);
      dg.start();
      el._dashboardGrid = dg;
    });

    // [v5 新增] 流程管道（支持组合属性如 data-visual="scroll-unroll pipeline"）
    document.querySelectorAll('[data-visual~="pipeline"]').forEach(el => {
      if (el._pipeline) return;
      const pp = new ProcessPipeline(el);
      pp.start();
      el._pipeline = pp;
    });

    // [v5 新增] 时间线道路
    document.querySelectorAll('[data-visual="timeline-road"]').forEach(el => {
      if (el._timelineRoad) return;
      const tr = new TimelineRoad(el);
      tr.start();
      el._timelineRoad = tr;
    });

    // [v4 新增] 雷达扫描
    document.querySelectorAll('[data-visual="radar"]').forEach(el => {
      if (el._radarScan) return;
      try {
        const targets = JSON.parse(el.dataset.radarTargets || '[]');
        const rs = new RadarScan(el, { targets });
        el._radarScan = rs;
      } catch(e) {}
    });
  }

  // ============== 监听幻灯片切换（重新触发动画） ==============
  function observeSlideChanges() {
    // Listen for slide navigation (layout.js controls this)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const slide = m.target;
          if (slide.classList.contains('slide') && slide.classList.contains('active')) {
            // Re-trigger animations on this slide
            setTimeout(() => triggerSlideAnimations(slide), 200);
          }
        }
      }
    });

    document.querySelectorAll('.slide').forEach(slide => {
      observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function triggerSlideAnimations(slide) {
    // Re-trigger stagger reveals
    slide.querySelectorAll('[data-visual="stagger"]').forEach(el => {
      const children = Array.from(el.children);
      children.forEach(c => c.classList.remove('revealed'));
      requestAnimationFrame(() => {
        children.forEach(c => c.classList.add('revealed'));
      });
    });

    // Re-trigger collisions
    slide.querySelectorAll('[data-visual="collision"]').forEach(el => {
      el.classList.remove('active');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('active'));
      });
    });

    // Re-trigger terminals
    slide.querySelectorAll('[data-visual="terminal"]').forEach(el => {
      if (el._terminal) {
        el._terminal.reset();
        setTimeout(() => el._terminal.start(), 400);
      }
    });

    // Reset step sequencers
    slide.querySelectorAll('[data-visual="steps"]').forEach(el => {
      if (el._sequencer) el._sequencer.goTo(0);
    });

    // Re-init popups
    initPopups();

    // Re-init video embeds
    slide.querySelectorAll('[data-visual="video"]').forEach(el => {
      if (!el._videoEmbed) {
        const ve = new VideoEmbed(el);
        el._videoEmbed = ve;
      }
    });

    // Re-init scroll-unroll
    slide.querySelectorAll('[data-visual="scroll-unroll"]').forEach(el => {
      if (!el._scrollUnroll) {
        const su = new ScrollUnroll(el);
        el._scrollUnroll = su;
      }
    });

    // Re-init flow-counter
    slide.querySelectorAll('[data-visual="flow-counter"]').forEach(el => {
      if (el._flowCounter) return;
      const fc = new FlowCounter(el);
      fc.start();
      el._flowCounter = fc;
    });

    // Re-init char-reveal
    slide.querySelectorAll('[data-visual="char-reveal"]').forEach(el => {
      if (el._charReveal) return;
      const cr = new CharReveal(el);
      el._charReveal = cr;
    });

    // Re-init radar
    slide.querySelectorAll('[data-visual="radar"]').forEach(el => {
      if (el._radarScan) return;
      try {
        const targets = JSON.parse(el.dataset.radarTargets || '[]');
        const rs = new RadarScan(el, { targets });
        el._radarScan = rs;
      } catch(e) {}
    });

    // [v5] Re-init radar-chart
    slide.querySelectorAll('[data-visual="radar-chart"]').forEach(el => {
      if (!el._radarChart) { const rc = new RadarChart(el); rc.start(); el._radarChart = rc; }
    });

    // [v5] Re-init arch-diagram
    slide.querySelectorAll('[data-visual="arch-diagram"]').forEach(el => {
      if (!el._archDiagram) { const ad = new ArchDiagram(el); ad.start(); el._archDiagram = ad; }
    });

    // [v5] Re-init compare-slider
    slide.querySelectorAll('[data-visual="compare-slider"]').forEach(el => {
      if (!el._compareSlider) { const cs = new CompareSlider(el); cs.start(); el._compareSlider = cs; }
    });

    // [v5] Re-init dashboard
    slide.querySelectorAll('[data-visual="dashboard"]').forEach(el => {
      if (!el._dashboardGrid) { const dg = new DashboardGrid(el); dg.start(); el._dashboardGrid = dg; }
    });

    // [v5] Re-init pipeline
    slide.querySelectorAll('[data-visual~="pipeline"]').forEach(el => {
      if (!el._pipeline) { const pp = new ProcessPipeline(el); pp.start(); el._pipeline = pp; }
    });

    // [v5] Re-init timeline-road
    slide.querySelectorAll('[data-visual="timeline-road"]').forEach(el => {
      if (!el._timelineRoad) { const tr = new TimelineRoad(el); tr.start(); el._timelineRoad = tr; }
    });
  }

  // ============== 启动 ==============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      autoInit();
      observeSlideChanges();
    });
  } else {
    autoInit();
    observeSlideChanges();
  }

  // Expose API
  window.Visuals = {
    Typewriter, StaggerReveal, CollisionController,
    StepSequencer, TerminalSim, NumCounter,
    PopupController, VideoEmbed, GlowHighlight,
    ScrollUnroll, FlowCounter, ParallaxTilt,
    CharReveal, MatrixRain, RadarScan,
    RadarChart, ArchDiagram, CompareSlider,
    DashboardGrid, ProcessPipeline, TimelineRoad,
    sleep
  };

})();
