/* =====================================================
   LAYOUT.JS - 自动注入 topbar/sidebar/footer/scripts
   每章只需保留 <main> 核心内容 + <head> 基础配置
   ===================================================== */
(function() {
  'use strict';

  // ============ 章节注册表（核心数据）============
  // 新增章节：仅需在此处加一行
  // 编号说明：02 革命 → 02.5 5+2+1+1 体系 → 03 main
  //           05 research → 06 data → 07 report（5 Agent 完整闭环）
  //           08-13 进阶（生态/案例/纵横/质量/训练/Workflow）
  //           14-17 演示（6 案例 / 现场 / Q&A / 真实召唤）
  //           18 落地门槛
  const CHAPTERS = [
    { num: '01', file: 'final-chapter-01.html', title: '封面：智能体革命与5+2+1体系', emoji: '🎯' },
    { num: '02', file: 'final-chapter-02.html', title: '什么是智能体？',             emoji: '🤖' },
    { num: '03', file: 'final-chapter-03.html', title: '5+2+1+1 体系总览',          emoji: '🧠' },
    { num: '04', file: 'final-chapter-04.html', title: '生态协同与部署方案',         emoji: '🌐' },
    { num: '05', file: 'final-chapter-05.html', title: '从零到一：打造你的第一个智能体', emoji: '🛠️' },
    { num: '06', file: 'final-chapter-06.html', title: '个人 Workflow 升级路径',     emoji: '🌱' },
    { num: '07', file: 'final-chapter-07.html', title: '现场互动演示',               emoji: '🎬' },
    { num: '08', file: 'final-chapter-08.html', title: '总结与展望',                  emoji: '📋' },
  ];

  // 当前章节信息（从 URL 推断）
  const url = window.location.pathname;
  const currentFile = url.substring(url.lastIndexOf('/') + 1);
  const currentIdx = CHAPTERS.findIndex(c => c.file === currentFile);
  const current = currentIdx >= 0 ? CHAPTERS[currentIdx] : null;

  // ============ 渲染 topbar ============
  function renderTopbar() {
    if (!current) return '';
    const prevChapter = currentIdx > 0 ? CHAPTERS[currentIdx - 1] : null;
    const nextChapter = currentIdx < CHAPTERS.length - 1 ? CHAPTERS[currentIdx + 1] : null;
    const activeTheme = document.documentElement.dataset.theme || 'tianjin';

    const totalActive = CHAPTERS.length;
    const currentActive = currentIdx + 1;
    const rightPct = 100 - ((currentActive / totalActive) * 100);

    return `
<header class="topbar">
  <div class="topbar-left">
    <span class="logo">🤖 智能体研究中心</span>
    <span class="course-title">${current.emoji} 第 ${current.num} 章 · ${current.title}</span>
  </div>
  <div class="topbar-center">
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill" style="right:${rightPct}%"></div>
      <span class="progress-text" id="progressText">${currentActive} / ${totalActive}</span>
    </div>
  </div>
  <div class="topbar-right">
    <div class="theme-switcher">
      <button data-theme="tianjin" ${activeTheme === 'tianjin' ? 'class="active"' : ''}>🟦</button>
      <button data-theme="dark" ${activeTheme === 'dark' ? 'class="active"' : ''}>🌑</button>
      <button data-theme="academic" ${activeTheme === 'academic' ? 'class="active"' : ''}>⬜</button>
      <button data-theme="guofeng" ${activeTheme === 'guofeng' ? 'class="active"' : ''}>🟥</button>
    </div>
    <div class="mode-switcher">
      <a href="../index.html" style="text-decoration:none"><button>🏠 主页</button></a>
      <button id="modeBtn">📊 演示模式</button>
    </div>
  </div>
</header>`;
  }


  // ============ 渲染 footer（章节翻页）============
  function renderFooter() {
    if (!current) return '';
    const prevChapter = currentIdx > 0 ? CHAPTERS[currentIdx - 1] : null;
    const nextChapter = currentIdx < CHAPTERS.length - 1 ? CHAPTERS[currentIdx + 1] : null;

    return `
<footer class="controls">
  ${prevChapter
    ? `<a href="${prevChapter.file}" class="ctrl-btn" title="上一章：${prevChapter.title}">◀ 上一章</a>`
    : `<span class="ctrl-btn disabled">◀</span>`}
  <span class="ctrl-info">← / → 翻页 · P 备注 · T 主题 · M 模式</span>
  ${nextChapter
    ? `<a href="${nextChapter.file}" class="ctrl-btn" title="下一章：${nextChapter.title}">下一章 ▶</a>`
    : `<span class="ctrl-btn disabled">▶</span>`}
</footer>`;
  }

  // ============ 渲染 burst-stage 区 ============
  function renderBurstStages() {
    // 扫描页面所有 data-burst 属性，生成对应 stage div
    const triggers = document.querySelectorAll('[data-burst]');
    const stageIds = new Set();
    triggers.forEach(t => {
      const id = t.getAttribute('data-burst');
      if (id) stageIds.add(id);
    });
    return Array.from(stageIds).map(id => `<div class="burst-stage" id="${id}"></div>`).join('\n  ');
  }

  // ============ 主注入函数 ============
  function injectLayout() {
    const body = document.body;
    if (!body) return;

    // 顶部：topbar
    const topbarHtml = renderTopbar();
    const tempTopbar = document.createElement('div');
    tempTopbar.innerHTML = topbarHtml;
    while (tempTopbar.firstChild) {
      body.insertBefore(tempTopbar.firstChild, body.firstChild);
    }

    // 底部：footer（append 到 body 末尾）
    const footerHtml = renderFooter();
    const tempFooter = document.createElement('div');
    tempFooter.innerHTML = footerHtml;
    while (tempFooter.firstChild) {
      body.appendChild(tempFooter.firstChild);
    }

    // burst-stage 区
    const stagesHtml = renderBurstStages();
    if (stagesHtml) {
      const tempStages = document.createElement('div');
      tempStages.innerHTML = stagesHtml;
      while (tempStages.firstChild) {
        body.appendChild(tempStages.firstChild);
      }
    }

    // shared-modals-slot
    const slot = document.createElement('div');
    slot.id = 'shared-modals-slot';
    body.appendChild(slot);

    // 触发自定义事件，通知 main.js
    document.dispatchEvent(new CustomEvent('layout-injected'));
  }

  // ============ 等待 DOMContentLoaded 后注入（确保 main 内容已就绪）============
  // layout.js 需放在 body 末尾，能读取所有 [data-burst] 元素
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLayout);
  } else {
    injectLayout();
  }

  // 暴露给其他模块使用
  window.LAYOUT = { CHAPTERS, current };
})();