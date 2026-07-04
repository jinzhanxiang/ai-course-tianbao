/* =====================================================
   主交互逻辑 - 双模式 + 主题 + 翻页 + 备注
   ===================================================== */

(function() {
  'use strict';

  const state = {
    chapter: 0,
    slide: 0,
    slides: [],
    // 从 <html data-mode="..."> 读取默认模式，这样每章可以独立设置默认状态
    mode: document.documentElement.dataset.mode === 'exploration' ? 'exploration' : 'presentation',
    theme: 'tianjin',
  };

  // ============ 初始化（兼容 DCL 已触发场景）============
  function initAll() {
    initTheme();
    initMode();
    initNavigation();
    initKeys();
    initAgents();
    if (typeof window.injectSharedModals === 'function') window.injectSharedModals();

    // 默认模式说明：探索模式把所有 slide 同时展开，演示模式只显一张
    if (state.mode === 'exploration') {
      document.querySelectorAll('.slide').forEach(s => s.classList.add('active'));
      const btn = document.getElementById('modeBtn');
      if (btn) btn.innerHTML = '📚 探索模式';
    }
    updateProgress();

    // 初始调整 slide 布局（为超长 slide 启用滚动）
    adjustSlideLayout();
    // resize 时重调
    window.addEventListener('resize', () => requestAnimationFrame(adjustSlideLayout));
  }

  // 初始化路径：DCL 还未触发则监听；已触发则同步执行（兼容 layout.js）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // ============ 主题 ============
  function initTheme() {
    document.querySelectorAll('.theme-switcher button').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        document.documentElement.dataset.theme = theme;
        state.theme = theme;
        document.querySelectorAll('.theme-switcher button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // ============ 模式 ============
  function initMode() {
    const btn = document.getElementById('modeBtn');
    if (!btn) return;
    btn.addEventListener('click', toggleMode);
    // 初始化时根据模式控制元素显示
    updateLayoutForMode();
  }

  // 根据模式控制布局元素显示/隐藏
  function updateLayoutForMode() {
    const sidebar = document.querySelector('.sidebar');
    const agentRail = document.querySelector('.agent-rail');
    const topbar = document.querySelector('.topbar');
    const controls = document.querySelector('.controls');
    
    if (state.mode === 'presentation') {
      // 演示模式：隐藏侧边栏和控制条
      if (sidebar) sidebar.style.display = 'none';
      if (agentRail) agentRail.style.display = 'none';
      if (topbar) topbar.style.display = 'none';
      if (controls) controls.style.display = 'none';
      // 确保 main-stage 全屏
      const mainStage = document.querySelector('.main-stage');
      if (mainStage) {
        mainStage.style.position = 'fixed';
        mainStage.style.top = '0';
        mainStage.style.left = '0';
        mainStage.style.width = '100vw';
        mainStage.style.height = '100vh';
      }
    } else {
      // 探索模式：显示所有元素
      if (sidebar) sidebar.style.display = '';
      if (agentRail) agentRail.style.display = '';
      if (topbar) topbar.style.display = '';
      if (controls) controls.style.display = '';
      // 恢复 main-stage 默认样式
      const mainStage = document.querySelector('.main-stage');
      if (mainStage) {
        mainStage.style.position = '';
        mainStage.style.top = '';
        mainStage.style.left = '';
        mainStage.style.width = '';
        mainStage.style.height = '';
      }
    }
  }

  function toggleMode() {
    const html = document.documentElement;
    const btn = document.getElementById('modeBtn');
    if (state.mode === 'presentation') {
      html.dataset.mode = 'exploration';
      state.mode = 'exploration';
      btn.innerHTML = '📚 探索模式';
      // 探索模式：把所有 slide 显示出来
      document.querySelectorAll('.slide').forEach(s => s.classList.add('active'));
    } else {
      html.dataset.mode = 'presentation';
      state.mode = 'presentation';
      btn.innerHTML = '📊 演示模式';
      // 演示模式：只显示当前
      document.querySelectorAll('.slide').forEach((s, i) => {
        s.classList.toggle('active', i === state.slide);
      });
    }
    // 更新布局
    updateLayoutForMode();
  }

  // ============ 导航 ============
  function initNavigation() {
    // 章节链接
    document.querySelectorAll('.chapter-list a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const href = a.getAttribute('href');
        if (href && href.endsWith('.html')) {
          window.location.href = href;
        }
      });
    });

    // 翻页按钮
    document.getElementById('prevBtn')?.addEventListener('click', prevSlide);
    document.getElementById('nextBtn')?.addEventListener('click', nextSlide);
  }

  function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (state.slide < slides.length - 1) {
      slides[state.slide].classList.remove('active');
      state.slide++;
      slides[state.slide].classList.add('active');
      updateProgress();
      adjustSlideLayout();
    }
  }

  function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    if (state.slide > 0) {
      slides[state.slide].classList.remove('active');
      state.slide--;
      slides[state.slide].classList.add('active');
      updateProgress();
      adjustSlideLayout();
    }
  }

  // 根据内容高度调整 slide 布局：内容可滚动->顶部对齐；否则居中
  function adjustSlideLayout() {
    const slide = document.querySelector('.slide.active');
    if (!slide) return;
    requestAnimationFrame(() => {
      const stageH = slide.clientHeight;
      const contentH = slide.scrollHeight;
      // 只有可滚动距离 > 5px 才算 tall
      // 否则不需 is-tall (即使 reportjs 一致也可能为 tall，但 scrollTop 不会有)
      const overflow = contentH - stageH;

      if (overflow > 5) {
        slide.classList.add('is-tall');
        slide.style.setProperty('--slide-overflow', overflow + 'px');
      } else {
        slide.classList.remove('is-tall');
        slide.style.removeProperty('--slide-overflow');
      }
    });
  }

  function updateProgress() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    const pct = ((state.slide + 1) / slides.length) * 100;
    const fill = document.getElementById('progressFill');
    const txt = document.getElementById('progressText');
    if (fill) fill.style.right = `${100 - pct}%`;
    if (txt) txt.textContent = `${state.slide + 1} / ${slides.length}`;
  }

  // ============ 键盘 ============
  function initKeys() {
    document.addEventListener('keydown', e => {
      // 忽略输入框
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      // burst 弹窗打开时 - 键盘交由 burst 自身处理 (Esc / 路由)，不翻页
      if (document.querySelector('.burst-stage.show')) {
        if (e.key === 'Escape') {
          // 让 burst 自身处理
        }
        return;
      }

      // 如果当前 slide 超高，先在 slide 内部滚动（避免误翻页）
      const slide = document.querySelector('.slide.active');
      const isTall = slide && slide.classList.contains('is-tall');
      const canScroll = slide && (slide.scrollHeight - slide.clientHeight - slide.scrollTop) > 20;

      // 反馈气泡 - 确认按键已收到
      let actionLabel = null;
      if (['ArrowRight', 'PageDown', 'ArrowDown', ' '].includes(e.key)) {
        actionLabel = isTall && canScroll ? '↓ 内部滚动' : '下一页 →';
      } else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) {
        actionLabel = isTall && slide.scrollTop > 0 ? '↑ 内部滚动' : '← 上一页';
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
        case 'ArrowUp':
          // tall slide: 优先内部滚动
          if (isTall && slide.scrollTop > 0) {
            slide.scrollBy({ top: -slide.clientHeight * 0.85, behavior: 'smooth' });
            e.preventDefault();
          } else {
            prevSlide();
          }
          break;
        case 'ArrowRight':
        case 'PageDown':
        case 'ArrowDown':
        case ' ':
          // tall slide: 优先内部滚动（重要修复点）
          if (isTall && canScroll) {
            slide.scrollBy({ top: slide.clientHeight * 0.85, behavior: 'smooth' });
            e.preventDefault();
          } else {
            nextSlide();
          }
          break;
        case 'p':
        case 'P':
          toggleSpeaker();
          break;
        case 't':
        case 'T':
          rotateTheme();
          break;
        case 'm':
        case 'M':
          toggleMode();
          break;
        case 'Escape':
          closeSpeaker();
          closeAgent();
          break;
        case 'Home':
          goFirst();
          break;
        case 'End':
          goLast();
          break;
      }

      if (actionLabel) {
        showKeyHint(actionLabel);
      }
    });
  }

  // 右下角闪现按键提示气泡 - 让主公确认按键被收到
  function showKeyHint(text) {
    const id = 'key-hint-toast';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.cssText = 'position:fixed;bottom:80px;right:30px;background:rgba(0,30,60,.92);color:#5eb6ff;padding:14px 22px;border-radius:14px;font-family:var(--font-main);font-size:15px;font-weight:600;letter-spacing:1px;z-index:9999;pointer-events:none;opacity:0;transition:opacity .25s,transform .25s;transform:translateY(10px);box-shadow:0 8px 24px rgba(0,0,0,.3);border:2px solid rgba(94,182,255,.4);';
      document.body.appendChild(el);
    }
    el.textContent = '⌨️ ' + text;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      clearTimeout(el._t);
      el._t = setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
      }, 1200);
    });
  }

  function goFirst() {
    state.slide = 0;
    document.querySelectorAll('.slide').forEach((s, i) => s.classList.toggle('active', i === 0));
    updateProgress();
  }

  function goLast() {
    const slides = document.querySelectorAll('.slide');
    state.slide = slides.length - 1;
    slides.forEach((s, i) => s.classList.toggle('active', i === state.slide));
    updateProgress();
  }

  function rotateTheme() {
    const themes = ['tianjin', 'dark', 'academic', 'guofeng'];
    const idx = themes.indexOf(state.theme);
    const next = themes[(idx + 1) % themes.length];
    document.documentElement.dataset.theme = next;
    state.theme = next;
    document.querySelectorAll('.theme-switcher button').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === next);
    });
  }

  // ============ 演讲者备注 ============
  function toggleSpeaker() {
    const panel = document.getElementById('speakerPanel');
    panel.classList.toggle('show');
    if (panel.classList.contains('show')) {
      renderSpeakerNotes();
    }
  }
  function closeSpeaker() {
    document.getElementById('speakerPanel').classList.remove('show');
  }

  function renderSpeakerNotes() {
    const notes = window.COURSE_DATA?.speakerNotes?.[state.slide] || '（暂无备注）';
    document.getElementById('speakerContent').innerHTML = notes.replace(/\n/g, '<br>');
  }

  document.getElementById('speakerBtn')?.addEventListener('click', toggleSpeaker);
  document.getElementById('closeSpeaker')?.addEventListener('click', closeSpeaker);

  // ============ 智能体弹层 ============
  function initAgents() {
    document.querySelectorAll('.agent-btn').forEach(btn => {
      btn.addEventListener('click', () => showAgent(btn.dataset.agent));
    });
    document.getElementById('closeAgent')?.addEventListener('click', closeAgent);
  }

  function showAgent(id) {
    const data = window.COURSE_DATA?.agents?.[id];
    if (!data) return;
    document.getElementById('agentModalTitle').innerHTML = `${data.emoji} ${data.name}`;
    document.getElementById('agentModalBody').innerHTML = `
      <p style="margin-bottom:12px;color:var(--text-secondary)"><strong>角色：</strong>${data.role}</p>
      <p style="margin-bottom:12px"><strong>核心能力：</strong></p>
      <ul style="margin-left:20px;line-height:1.8;color:var(--text-secondary)">
        ${data.skills.map(s => `<li>${s}</li>`).join('')}
      </ul>
      <p style="margin-top:16px"><strong>实战案例：</strong></p>
      <p style="color:var(--text-muted);font-style:italic;padding:12px;background:var(--bg-primary);border-radius:6px;margin-top:8px">${data.case}</p>
      ${data.path ? `<p style="margin-top:12px;font-family:var(--font-mono);font-size:12px;color:var(--text-muted)">📁 ${data.path}</p>` : ''}
    `;
    document.getElementById('agentModal').classList.add('show');
  }
  function closeAgent() {
    document.getElementById('agentModal').classList.remove('show');
  }
})();

/* =====================================================
   可点击互动 (A+B 模式)
   ===================================================== */

// A. 折叠展开（就地展开模式）
document.addEventListener('DOMContentLoaded', () => {
  // 所有 .clickable 元素自动绑定
  document.querySelectorAll('.clickable').forEach(el => {
    el.addEventListener('click', (e) => {
      // 阻止内部子元素的 click 冒泡干扰
      if (e.target.closest('.expand-card') || e.target.closest('.modal-trigger')) return;
      const targetId = el.getAttribute('data-target');
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
          const isOpen = target.classList.contains('open');
          // 关闭同一父级下所有已展开项（手风琴）
          const parent = el.parentElement;
          if (parent) {
            parent.querySelectorAll('.collapsible.open').forEach(c => c.classList.remove('open'));
            parent.querySelectorAll('.clickable.open').forEach(c => c.classList.remove('open'));
          }
          // 切换当前项
          if (!isOpen) {
            target.classList.add('open');
            el.classList.add('open');
            // 滚动到可见
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
          }
        }
      }
    });
  });

  // B. Modal 弹层
  document.querySelectorAll('.modal-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalId = btn.getAttribute('data-modal');
      if (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('show');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  });

  // 关闭 modal
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.classList.contains('modal-close')) {
        const modal = el.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('show');
          document.body.style.overflow = '';
        }
      }
    });
  });

    // ===== sci-fi 粒子背景增强（Canvas-based） =====
  function initSciFiParticles() {
    // 只在 sci-fi-bg 元素内注入粒子层
    const bgHolder = document.querySelector('.sci-fi-bg');
    if (!bgHolder || bgHolder.querySelector('.sci-fi-particles')) return;

    const layer = document.createElement('div');
    layer.className = 'sci-fi-particles';
    bgHolder.appendChild(layer);

    // 注入 canvas（30 个粒子 + 缓慢上升的"光线"）
    const html = `
      <canvas id="sci-fi-canvas" style="position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:0;opacity:0.55"></canvas>
      <div class="sci-fi-light"></div>
    `;
    layer.innerHTML = html;

    const cv = document.getElementById('sci-fi-canvas');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    let w, h, particles;

    const resize = () => {
      w = cv.width = window.innerWidth;
      h = cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 初始化粒子 28 个
    particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 2.2,
      hue: ['#00D4FF', '#A855F7', '#22C55E'][Math.floor(Math.random() * 3)],
      a: 0.15 + Math.random() * 0.4
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.fillStyle = p.hue;
        ctx.globalAlpha = p.a;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      // 邻近连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.strokeStyle = particles[i].hue;
            ctx.globalAlpha = (1 - d / 140) * 0.2;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    // 元素隐藏时停止动画
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  // DOM ready 调用
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSciFiParticles);
  } else {
    initSciFiParticles();
  }

// Esc 关闭 modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.show').forEach(m => {
        m.classList.remove('show');
        document.body.style.overflow = '';
      });
    }
  });
});
