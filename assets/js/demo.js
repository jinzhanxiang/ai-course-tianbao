/**
 * Interactive Demo System for AI Courseware
 * ==========================================
 * Provides one-click demo execution with auto-display and result reporting.
 *
 * Usage in HTML:
 *   <button class="demo-run-btn" data-demo="equity_chart">▶ 运行</button>
 *   <div class="demo-output" data-demo="equity_chart"></div>
 *
 * Requires demo_server.py running on port 18900.
 */

(function() {
  'use strict';

  const API_BASE = 'http://localhost:18900';
  let serverAvailable = false;

  // ---- Init ----
  function init() {
    checkServer();
    bindDemoButtons();
    bindResultPanelClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---- Check if demo server is running ----
  async function checkServer() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const resp = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (resp.ok) {
        serverAvailable = true;
        document.querySelectorAll('.demo-status-indicator').forEach(el => {
          el.textContent = '🟢 演示服务器已连接';
          el.style.color = '#22C55E';
        });
        document.querySelectorAll('.demo-run-btn').forEach(btn => {
          btn.disabled = false;
          btn.title = '';
        });
      }
    } catch (e) {
      serverAvailable = false;
      document.querySelectorAll('.demo-status-indicator').forEach(el => {
        el.textContent = '⚠️ 演示服务器未启动 (python3 demo_server.py)';
        el.style.color = '#F59E0B';
      });
    }
  }

  // ---- Bind demo run buttons ----
  function bindDemoButtons() {
    document.querySelectorAll('.demo-run-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!serverAvailable) {
          showToast('⚠️ 请先启动演示服务器: python3 demo_server.py', 'warning');
          return;
        }

        const demoName = btn.dataset.demo;
        if (!demoName) return;

        await runDemo(demoName, btn);
      });
    });
  }

  // ---- Run a demo ----
  async function runDemo(demoName, triggerBtn) {
    // Find or create output panel
    let outputPanel = document.querySelector(`.demo-output[data-demo="${demoName}"]`);
    if (!outputPanel) {
      // Create inline output panel after the button's parent card
      outputPanel = createOutputPanel(demoName);
      const card = triggerBtn.closest('.card') || triggerBtn.parentElement;
      card.insertAdjacentElement('afterend', outputPanel);
    }

    // Show loading state
    outputPanel.classList.add('active');
    outputPanel.querySelector('.demo-output-content').innerHTML = `
      <div class="demo-loading">
        <span class="demo-spinner"></span>
        <span>正在执行 ${demoName}...</span>
      </div>`;
    triggerBtn.disabled = true;
    triggerBtn.textContent = '⏳ 运行中...';

    try {
      const resp = await fetch(`${API_BASE}/api/demo/run/${demoName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ async: false }),
      });

      const result = await resp.json();

      if (result.status === 'completed') {
        renderDemoResult(outputPanel, result);
        showToast(`✅ ${demoName} 执行完成`, 'success');
      } else if (result.error) {
        outputPanel.querySelector('.demo-output-content').innerHTML =
          `<pre class="demo-error">${escapeHtml(result.error)}</pre>`;
        showToast('❌ 演示执行失败', 'error');
      }
    } catch (e) {
      outputPanel.querySelector('.demo-output-content').innerHTML =
        `<pre class="demo-error">连接失败: ${escapeHtml(e.message)}\n请确认 demo_server.py 已启动</pre>`;
      showToast('❌ 无法连接演示服务器', 'error');
    } finally {
      triggerBtn.disabled = false;
      triggerBtn.textContent = '▶ 再次运行';
    }
  }

  // ---- Render demo result ----
  function renderDemoResult(panel, result) {
    const content = panel.querySelector('.demo-output-content');
    const statusEl = panel.querySelector('.demo-output-status');

    // Update status badge
    const exitCode = result.exit_code;
    if (exitCode === 0) {
      statusEl.textContent = '✅ 执行成功';
      statusEl.className = 'demo-output-status demo-status-success';
    } else {
      statusEl.textContent = `❌ 退出码: ${exitCode}`;
      statusEl.className = 'demo-output-status demo-status-error';
    }

    // Render output
    let outputHtml = '';

    // If there's an output image, show it
    if (result.output_type === 'image' && result.output_file) {
      outputHtml += `
        <div class="demo-image-result">
          <img src="file://${result.output_file}" alt="演示输出"
               onerror="this.parentElement.innerHTML='<p style=color:#F59E0B>图片生成成功，请查看: ${result.output_file}</p>'"
               style="max-width:100%;border-radius:8px;border:1px solid #1E3A6E;">
          <p style="color:#8FA1CC;font-size:11px;margin-top:8px">📁 ${result.output_file}</p>
        </div>`;
    }

    // Terminal output
    if (result.output) {
      outputHtml += `<pre class="demo-terminal">${escapeHtml(result.output)}</pre>`;
    }
    if (result.error) {
      outputHtml += `<pre class="demo-stderr">${escapeHtml(result.error)}</pre>`;
    }

    // KPI summary row (auto-extract from output)
    const kpis = extractKpis(result.output);
    if (kpis.length > 0) {
      outputHtml += `
        <div class="demo-kpi-row">
          ${kpis.map(k => `
            <div class="demo-kpi-item">
              <span class="demo-kpi-value">${escapeHtml(k.value)}</span>
              <span class="demo-kpi-label">${escapeHtml(k.label)}</span>
            </div>
          `).join('')}
        </div>`;
    }

    content.innerHTML = outputHtml;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---- Extract KPIs from output ----
  function extractKpis(output) {
    const kpis = [];
    const patterns = [
      /(\d+)\s*(分钟|min|秒|s)\s*(完成|耗时)/,
      /(\d+)\s*(页|page)/,
      /(\d+)\s*(家|个)\s*(股东|实体|Agent)/,
      /(\d+)\s*(项|份|个)\s*(风险|脚本|项目)/,
      /耗[时時]\s*[:：]?\s*(\d+)\s*(分钟|秒|min|s)/,
      /共\s*(\d+)\s*(页|步|项|个|条)/,
      /P50\s*[=＝]\s*(-?\d+%)/,
    ];
    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        kpis.push({ value: match[1], label: (match[2] || '').replace(/[：:]/g, '') });
        if (kpis.length >= 4) break;
      }
    }
    return kpis;
  }

  // ---- Create output panel DOM ----
  function createOutputPanel(demoName) {
    const panel = document.createElement('div');
    panel.className = 'demo-output';
    panel.dataset.demo = demoName;
    panel.innerHTML = `
      <div class="demo-output-header">
        <span class="demo-output-title">📺 演示输出: ${demoName}</span>
        <span class="demo-output-status">⏳ 等待执行</span>
        <button class="demo-output-close" title="关闭">✕</button>
      </div>
      <div class="demo-output-content"></div>
    `;
    // Close button
    panel.querySelector('.demo-output-close').addEventListener('click', () => {
      panel.classList.remove('active');
    });
    return panel;
  }

  function bindResultPanelClose() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('demo-output-close')) {
        const panel = e.target.closest('.demo-output');
        if (panel) panel.classList.remove('active');
      }
    });
  }

  // ---- Toast notification ----
  function showToast(msg, type) {
    const id = 'demo-toast';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.cssText = `
        position:fixed;top:20px;right:20px;z-index:99999;
        padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;
        pointer-events:none;opacity:0;transition:opacity .3s;
        box-shadow:0 4px 20px rgba(0,0,0,0.4);
      `;
      document.body.appendChild(el);
    }
    const colors = {
      success: 'background:#064e3b;color:#22C55E;border:1px solid #22C55E;',
      error: 'background:#450a0a;color:#EF4444;border:1px solid #EF4444;',
      warning: 'background:#451a03;color:#F59E0B;border:1px solid #F59E0B;',
    };
    el.style.cssText += colors[type] || colors.success;
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; }, 3000);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Expose API ----
  window.DEMO = {
    run: runDemo,
    isServerAvailable: () => serverAvailable,
    checkServer,
  };
})();
