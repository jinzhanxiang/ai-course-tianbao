/* =====================================================
   主交互逻辑 - 双模式 + 主题 + 翻页 + 备注
   ===================================================== */

(function() {
  'use strict';

  const state = {
    chapter: 0,
    slide: 0,
    slides: [],
    mode: 'presentation',
    theme: 'tianjin',
  };

  // ============ 初始化 ============
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMode();
    initNavigation();
    initKeys();
    initAgents();
    updateProgress();
  });

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
    btn.addEventListener('click', toggleMode);
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
    document.getElementById('prevBtn').addEventListener('click', prevSlide);
    document.getElementById('nextBtn').addEventListener('click', nextSlide);
  }

  function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (state.slide < slides.length - 1) {
      slides[state.slide].classList.remove('active');
      state.slide++;
      slides[state.slide].classList.add('active');
      updateProgress();
    }
  }

  function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    if (state.slide > 0) {
      slides[state.slide].classList.remove('active');
      state.slide--;
      slides[state.slide].classList.add('active');
      updateProgress();
    }
  }

  function updateProgress() {
    const slides = document.querySelectorAll('.slide');
    const pct = ((state.slide + 1) / slides.length) * 100;
    document.getElementById('progressFill').style.right = `${100 - pct}%`;
    document.getElementById('progressText').textContent = `${state.slide + 1} / ${slides.length}`;
  }

  // ============ 键盘 ============
  function initKeys() {
    document.addEventListener('keydown', e => {
      // 忽略输入框
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          prevSlide();
          break;
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          nextSlide();
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
