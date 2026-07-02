/* ============================================== */
/* EFFECTS.JS - Phase B + C 高级动效                */
/* 1) Particle 网络粒子  2) Mouse glow  3) 章节切换  */
/* 4) Burst 粒子爆破    5) DataFlow 数据流动效     */
/* 6) 3D Tilt 卡片悬停                            */
/* 自动降级：低端设备/无 requestAnimationFrame 关闭  */
/* ============================================== */
(function() {
  'use strict';

  // 检测是否启用（cyber 主题默认开，可通过 data-effects="off" 关闭）
  const root = document.documentElement;
  if (root.dataset.effects === 'off') return;
  if (root.dataset.theme && root.dataset.theme !== 'cyber' && root.dataset.theme !== 'dark') {
    // 非赛博/暗主题时仅开粒子 + glow，不强制
  }

  // 检测低端设备
  const isLowEnd = (() => {
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
    return false;
  })();

  // ============== 1) 粒子背景 ==============
  function initParticles() {
    // 已存在则跳过
    if (document.getElementById('fx-particles')) return;
    // 检查 body 是否就绪
    if (!document.body) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'fx-particles';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0', left: '0',
      width: '100vw', height: '100vh',
      pointerEvents: 'none',
      zIndex: '0',
      opacity: '0.6'
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 粒子数量根据屏幕面积自适应
    const count = isLowEnd ? 30 : Math.min(80, Math.floor((width * height) / 20000));
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        color: Math.random() < 0.5 ? 'rgba(0,240,255,' : 'rgba(255,0,229,'
      });
    }

    let raf = null;
    let running = true;

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      // 画粒子
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '0.6)';
        ctx.fill();
      }

      // 画连线（距离 < 120px）
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    // 页面隐藏时停止动画
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        draw();
      }
    });
  }

  // ============== 2) Mouse Glow ==============
  function initMouseGlow() {
    if (document.getElementById('fx-mouse-glow')) return;
    if (!document.body) return;

    const glow = document.createElement('div');
    glow.id = 'fx-mouse-glow';
    Object.assign(glow.style, {
      position: 'fixed',
      top: '0', left: '0',
      width: '500px', height: '500px',
      pointerEvents: 'none',
      zIndex: '1',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, rgba(0,240,255,0) 70%)',
      transform: 'translate(-50%, -50%)',
      transition: 'opacity 0.3s',
      opacity: '0',
      mixBlendMode: 'screen'
    });
    document.body.appendChild(glow);

    let mouseX = -1000, mouseY = -1000;
    let targetX = -1000, targetY = -1000;
    let raf = null;

    function tick() {
      targetX += (mouseX - targetX) * 0.15;
      targetY += (mouseY - targetY) * 0.15;
      glow.style.left = targetX + 'px';
      glow.style.top = targetY + 'px';
      raf = requestAnimationFrame(tick);
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (parseFloat(glow.style.opacity) < 0.5) {
        glow.style.opacity = '1';
      }
      if (!raf) tick();
    });

    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
  }

  // ============== 3) 章节切换过渡 ==============
  function initChapterTransition() {
    // 给 prev/next 按钮添加切换过渡
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.prev-btn, .next-btn, .sidebar-item');
      if (!btn) return;

      // sidebar-item 是导航链接，不需要阻止默认
      if (btn.classList.contains('sidebar-item')) return;

      e.preventDefault();
      const href = btn.getAttribute('href') || btn.getAttribute('data-href');
      if (!href) return;

      // 触发淡出
      const main = document.querySelector('.main-stage') || document.querySelector('main');
      if (main) {
        main.style.transition = 'opacity 0.3s, filter 0.3s';
        main.style.opacity = '0';
        main.style.filter = 'blur(8px)';
      }

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    }, true);
  }

  // ============== 4) Burst 粒子爆破 ==============
  function initBurstEffect() {
    // 拦截 burst trigger 点击，在 burst 卡片出现时从中心扩散粒子环
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-burst]');
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      spawnBurst(cx, cy);
    }, true);

    // 监听 burst stage 出现，从中心再次扩散
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.target.classList && m.target.classList.contains('burst-stage') && m.target.classList.contains('show')) {
          const rect = m.target.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          // 延迟 80ms 等卡片开始渲染
          setTimeout(() => spawnBurst(cx, cy, 80), 80);
        }
      }
    });
    document.querySelectorAll('.burst-stage').forEach(s => {
      observer.observe(s, { attributes: true, attributeFilter: ['class'] });
    });
    // 也观察 body 后续添加的 stage
    const bodyObserver = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach(n => {
          if (n.classList && n.classList.contains('burst-stage')) {
            observer.observe(n, { attributes: true, attributeFilter: ['class'] });
          }
        });
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  function spawnBurst(cx, cy, count = 60) {
    // 创建独立 canvas 用于爆破
    const c = document.createElement('canvas');
    c.className = 'fx-burst-canvas';
    Object.assign(c.style, {
      position: 'fixed',
      top: '0', left: '0',
      width: '100vw', height: '100vh',
      pointerEvents: 'none',
      zIndex: '1000'
    });
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');

    const particles = [];
    const colors = ['rgba(0,240,255,', 'rgba(255,0,229,', 'rgba(255,230,0,'];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.015 + Math.random() * 0.015
      });
    }

    let raf = null;
    function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      let alive = 0;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // 重力
        p.vx *= 0.98; // 阻力
        p.vy *= 0.98;
        p.life -= p.decay;
        if (p.life <= 0) continue;
        alive++;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.life + ')';
        ctx.fill();
        // 拖尾
        ctx.beginPath();
        ctx.arc(p.x - p.vx, p.y - p.vy, p.r * p.life * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (p.life * 0.4) + ')';
        ctx.fill();
      }
      if (alive > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        c.remove();
      }
    }
    tick();
  }

  // ============== 5) 数据流动效 ==============
  function initDataFlow() {
    // 扫描所有 .data-flow 容器，绘制连接线 + 流动光点
    document.querySelectorAll('.data-flow').forEach(container => {
      setupFlowContainer(container);
    });
    // 监听后续添加
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1) {
            if (n.classList && n.classList.contains('data-flow')) {
              setupFlowContainer(n);
            }
            n.querySelectorAll && n.querySelectorAll('.data-flow').forEach(c => setupFlowContainer(c));
          }
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    // 给 burst 中的 grid/cascade 布局添加自动连接线
    const burstObs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.classList && (n.classList.contains('burst-cards') || n.classList.contains('burst-card'))) {
              // 暂不处理（避免过度装饰）
            }
          });
        }
      }
    });
    burstObs.observe(document.body, { childList: true, subtree: true });
  }

  function setupFlowContainer(container) {
    if (container.dataset.flowInit) return;
    container.dataset.flowInit = '1';

    const nodes = container.querySelectorAll('.flow-node, [data-flow-node]');
    if (nodes.length < 2) return;

    // 用 SVG 画连线
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('data-flow-svg');
    Object.assign(svg.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none',
      zIndex: '5'
    });
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    container.style.position = container.style.position || 'relative';
    container.insertBefore(svg, container.firstChild);

    function getCoords() {
      const cRect = container.getBoundingClientRect();
      return Array.from(nodes).map(n => {
        const r = n.getBoundingClientRect();
        return {
          x: r.left - cRect.left + r.width / 2,
          y: r.top - cRect.top + r.height / 2
        };
      });
    }

    function drawLines() {
      // 清空 SVG
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const coords = getCoords();
      const lines = parseInt(container.dataset.flowLines) || Math.min(coords.length - 1, 5);

      // 连接相邻节点（前 N 个依次相连）
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      const gid = 'flow-grad-' + Math.random().toString(36).slice(2, 8);
      grad.setAttribute('id', gid);
      grad.innerHTML = `
        <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.2"/>
        <stop offset="50%" stop-color="#00F0FF" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#FF00E5" stop-opacity="0.2"/>`;
      defs.appendChild(grad);
      svg.appendChild(defs);

      for (let i = 0; i < Math.min(lines, coords.length - 1); i++) {
        const a = coords[i], b = coords[i + 1];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x);
        line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x);
        line.setAttribute('y2', b.y);
        line.setAttribute('stroke', `url(#${gid})`);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '6 4');
        line.style.animation = `dataFlow 1.5s linear infinite`;
        line.style.animationDelay = (i * 0.2) + 's';
        svg.appendChild(line);

        // 添加方向箭头标记
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 30) {
          const ux = dx / len, uy = dy / len;
          // 在 70% 位置放箭头
          const px = a.x + dx * 0.7, py = a.y + dy * 0.7;
          const ax = px - uy * 5, ay = py + ux * 5;
          const bx = px + uy * 5, by = py - ux * 5;
          arrow.setAttribute('points', `${px + ux * 8},${py + uy * 8} ${ax},${ay} ${bx},${by}`);
          arrow.setAttribute('fill', '#00F0FF');
          arrow.style.filter = 'drop-shadow(0 0 4px #00F0FF)';
          svg.appendChild(arrow);
        }
      }
    }

    drawLines();

    // resize 重绘
    let resizeT = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(drawLines, 200);
    });

    // 节点 hover 高亮连线
    nodes.forEach((n, i) => {
      n.addEventListener('mouseenter', () => {
        svg.querySelectorAll('line').forEach((l, j) => {
          if (j === i || j === i - 1) {
            l.setAttribute('stroke-width', '3');
            l.style.filter = 'drop-shadow(0 0 6px #00F0FF)';
          } else {
            l.setAttribute('stroke-opacity', '0.2');
          }
        });
      });
      n.addEventListener('mouseleave', () => {
        svg.querySelectorAll('line').forEach(l => {
          l.setAttribute('stroke-width', '1.5');
          l.setAttribute('stroke-opacity', '1');
          l.style.filter = '';
        });
      });
    });
  }

  // ============== 6) 3D Tilt 卡片 ==============
  function initTilt() {
    // 监听：sidebar chapter list、agent-btn、burst-card
    const targets = () => document.querySelectorAll('.sidebar .chapter-list li, .agent-btn, .agent-card, .data-flow .flow-node');
    const apply = () => {
      targets().forEach(el => {
        if (el.dataset.tiltBound) return;
        el.dataset.tiltBound = '1';
        // 给元素加 perspective wrapper 需要的 transform-style
        el.style.transformStyle = 'preserve-3d';
        el.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        el.style.willChange = 'transform';

        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          const maxAngle = 12; // 最大倾斜角
          const rx = (0.5 - y) * maxAngle;
          const ry = (x - 0.5) * maxAngle;
          const scale = 1.04;
          el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale}) translateZ(0)`;
          el.style.boxShadow = `
            ${(0.5 - x) * 20}px ${(0.5 - y) * 20}px 30px rgba(0,240,255,0.25),
            0 0 0 1px rgba(0,240,255,0.4)`;
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
          el.style.boxShadow = '';
        });
      });
    };
    apply();
    // 监听后续添加（如 burst 卡片）
    const obs = new MutationObserver(() => apply());
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ============== 启动 ==============
  function start() {
    if (isLowEnd) {
      console.info('[effects] 低端设备模式：仅启用鼠标 glow + 3D tilt');
      initMouseGlow();
      initTilt();
    } else {
      initParticles();
      initMouseGlow();
      initBurstEffect();
      initDataFlow();
      initTilt();
    }
    initChapterTransition();
    console.info('[effects] Phase B+C 动效已加载 (particles + glow + burst + dataflow + tilt + transition)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
