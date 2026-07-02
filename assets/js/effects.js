/* ============================================== */
/* EFFECTS.JS - Phase B 高级动效                    */
/* 1) Particle 网络粒子  2) Mouse glow  3) 章节切换  */
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

  // ============== 启动 ==============
  function start() {
    if (isLowEnd) {
      console.info('[effects] 低端设备模式：仅启用鼠标 glow');
      initMouseGlow();
    } else {
      initParticles();
      initMouseGlow();
    }
    initChapterTransition();
    console.info('[effects] Phase B 动效已加载 (particles + mouse glow + page transition)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
