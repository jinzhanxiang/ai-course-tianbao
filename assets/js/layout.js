/* =====================================================
   LAYOUT.JS - 自动注入 topbar/sidebar/footer/scripts
   每章只需保留 <main> 核心内容 + <head> 基础配置
   ===================================================== */
(function() {
  'use strict';

  // ============ 章节注册表（核心数据）============
  // 新增章节：仅需在此处加一行
  const CHAPTERS = [
    { num: '00', file: '00-cover.html',        title: '封面',         emoji: '🎯' },
    { num: '01', file: '01-opening.html',      title: '开场破题',     emoji: '🚀' },
    { num: '02', file: '02-revolution.html',   title: '智能体革命',   emoji: '⚡' },
    { num: '03', file: '03-main.html',         title: 'main 调度 ⭐', emoji: '🎯' },
    { num: '04', file: '04-project.html',      title: 'project 项目管家', emoji: '📋' },
    { num: '05', file: '05-research.html',     title: 'research V3',  emoji: '🔬' },
    { num: '06', file: '06-data.html',         title: 'data 清洗',    emoji: '🗃️' },
    { num: '07', file: '07-report.html',       title: 'report 排版',  emoji: '📄' },
    { num: '08', file: '08-ecosystem.html',    title: '三智能体生态', emoji: '🌐' },
    { num: '09', file: '09-case.html',         title: '实战案例',     emoji: '📚' },
    { num: '10', file: '10-methodology.html',  title: '纵横分析法',   emoji: '🎯' },
    { num: '11', file: '11-demo.html',         title: '现场演示',     emoji: '🎬' },
    { num: '12', file: '12-qa.html',           title: 'Q&A',          emoji: '❓' },
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

    // 进度：当前章节在 13 中的位置（不含 00-cover）
    // 00-cover 不计入进度
    const totalActive = CHAPTERS.length - 1; // 12
    const currentActive = currentIdx === 0 ? 0 : currentIdx;
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
      <span class="progress-text" id="progressText">${currentIdx} / ${totalActive}</span>
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

  // ============ 渲染 sidebar ============
  function renderSidebar() {
    return `
<aside class="sidebar">
  <h3>📑 12 章节</h3>
  <ol class="chapter-list">
    ${CHAPTERS.map(c => `
    <li><a href="${c.file}" ${c.file === currentFile ? 'class="active"' : ''}>${c.num} · ${c.title}</a></li>
    `).join('')}
  </ol>
</aside>`;
  }

  // ============ 渲染 footer（翻页按钮）============
  function renderFooter() {
    if (!current) return '';
    const prevChapter = currentIdx > 0 ? CHAPTERS[currentIdx - 1] : null;
    const nextChapter = currentIdx < CHAPTERS.length - 1 ? CHAPTERS[currentIdx + 1] : null;
    const prevLink = prevChapter ? prevChapter.file : current.file;
    const nextLink = nextChapter ? nextChapter.file : current.file;

    return `
<footer class="controls">
  <button id="prevBtn" class="ctrl-btn" ${prevChapter ? '' : 'disabled'}>◀</button>
  <button id="nextBtn" class="ctrl-btn" ${nextChapter ? '' : 'disabled'}>▶</button>
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
    // 在 <body> 开始后注入 topbar
    const body = document.body;
    if (!body) return;

    // 顶部：topbar
    const topbarHtml = renderTopbar();
    const tempTopbar = document.createElement('div');
    tempTopbar.innerHTML = topbarHtml;
    while (tempTopbar.firstChild) {
      body.insertBefore(tempTopbar.firstChild, body.firstChild);
    }

    // 中部：sidebar（插入到 body 内 topbar 之后）
    const sidebarHtml = renderSidebar();
    const tempSidebar = document.createElement('div');
    tempSidebar.innerHTML = sidebarHtml;
    let inserted = false;
    for (let node of tempSidebar.childNodes) {
      const after = inserted ? body.children[1 + (inserted ? 1 : 0)] : body.children[1];
      body.insertBefore(node, after);
      inserted = true;
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

  // ============ 立即同步注入（保证在 main.js DOMContentLoaded 之前完成）============
  // 由于 layout.js 在 main.js 之前加载，且 body 已存在，可直接同步执行
  if (document.body) {
    injectLayout();
  } else {
    // 极少数情况下 body 还未就绪 → 等待 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', injectLayout);
  }

  // 暴露给其他模块使用
  window.LAYOUT = { CHAPTERS, current };
})();