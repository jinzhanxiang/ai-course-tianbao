/**
 * Interactive Demo System v2 — SSE Streaming Edition
 * ===================================================
 * EventSource-based real-time demo execution with file upload,
 * progress heartbeat, panic fallback, and result preview.
 *
 * Requires demo_server_v2.py running on port 18900.
 *
 * Usage in HTML:
 *   <button class="demo-run-btn" data-demo="equity_chart">▶ 运行</button>
 *   <div class="demo-output" data-demo="equity_chart"></div>
 *
 *   <!-- File upload variant -->
 *   <div class="demo-upload-zone" data-demo="soe_doc_upload">
 *     <div class="demo-drop-area">拖拽 .md 文件到此处</div>
 *     <input type="file" accept=".md" style="display:none">
 *   </div>
 */

(function() {
  'use strict';

  const API_BASE = 'http://localhost:18900';
  let serverAvailable = false;
  let activeSources = {}; // task_id → EventSource

  // ── Init ────────────────────────────────────────────────
  function init() {
    checkServer();
    bindDemoButtons();
    bindUploadZones();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Server health check ─────────────────────────────────
  async function checkServer() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const resp = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        serverAvailable = true;
        document.querySelectorAll('.demo-status-indicator').forEach(el => {
          el.textContent = `🟢 演示服务器已连接 (${data.demos} 个演示就绪)`;
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
        el.textContent = '⚠️ 演示服务器未启动 (python3 demo_server_v2.py)';
        el.style.color = '#F59E0B';
      });
    }
  }

  // ── Bind demo run buttons ───────────────────────────────
  function bindDemoButtons() {
    document.querySelectorAll('.demo-run-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!serverAvailable) {
          showToast('请先启动演示服务器: python3 demo_server_v2.py', 'warning');
          return;
        }
        const demoName = btn.dataset.demo;
        if (!demoName) return;
        await runDemo(demoName, btn);
      });
    });
  }

  // ── Bind upload zones ───────────────────────────────────
  function bindUploadZones() {
    document.querySelectorAll('.demo-upload-zone').forEach(zone => {
      const demoName = zone.dataset.demo;
      const dropArea = zone.querySelector('.demo-drop-area');
      const fileInput = zone.querySelector('input[type="file"]');
      const progressEl = zone.querySelector('.demo-upload-progress');

      if (!dropArea || !fileInput) return;

      dropArea.addEventListener('click', () => fileInput.click());

      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
      });
      dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
      });
      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(demoName, file, zone);
      });
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) handleUpload(demoName, file, zone);
      });
    });
  }

  // ── File upload → trigger demo ──────────────────────────
  async function handleUpload(demoName, file, zone) {
    if (!serverAvailable) {
      showToast('请先启动演示服务器', 'warning');
      return;
    }

    // Find or create output panel
    let outputPanel = document.querySelector(`.demo-output[data-demo="${demoName}"]`);
    if (!outputPanel) {
      outputPanel = createOutputPanel(demoName);
      zone.insertAdjacentElement('afterend', outputPanel);
    }

    outputPanel.classList.add('active');
    outputPanel.querySelector('.demo-output-content').innerHTML =
      `<div class="demo-loading">⏳ 上传中: ${escapeHtml(file.name)}...</div>`;

    const progressEl = zone.querySelector('.demo-upload-progress');
    if (progressEl) progressEl.style.display = 'block';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch(`${API_BASE}/api/demo/upload/${demoName}`, {
        method: 'POST',
        body: formData,
      });
      const { task_id } = await resp.json();
      if (progressEl) progressEl.style.display = 'none';

      // Switch output panel to streaming mode
      setupStreamingOutput(outputPanel, demoName);
      connectSSE(task_id, outputPanel, demoName);
    } catch (e) {
      outputPanel.querySelector('.demo-output-content').innerHTML =
        `<pre class="demo-error">上传失败: ${escapeHtml(e.message)}</pre>`;
    }
  }

  // ── Run demo (button click) ─────────────────────────────
  async function runDemo(demoName, triggerBtn) {
    let outputPanel = document.querySelector(`.demo-output[data-demo="${demoName}"]`);
    if (!outputPanel) {
      outputPanel = createOutputPanel(demoName);
      const card = triggerBtn.closest('.card') || triggerBtn.parentElement;
      card.insertAdjacentElement('afterend', outputPanel);
    }

    outputPanel.classList.add('active');
    setupStreamingOutput(outputPanel, demoName);

    triggerBtn.disabled = true;
    triggerBtn.textContent = '⏳ 运行中...';

    try {
      const resp = await fetch(`${API_BASE}/api/demo/run/${demoName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ async: false }),
      });
      const result = await resp.json();

      if (result.status === 'prerecorded') {
        // Pre-recorded: connect SSE directly
        outputPanel.querySelector('.demo-output-header').insertAdjacentHTML('beforeend',
          '<span class="demo-prerecorded-badge">预录回放</span>');
        connectSSE(result.task_id, outputPanel, demoName, true);
      } else {
        connectSSE(result.task_id, outputPanel, demoName);
      }
    } catch (e) {
      outputPanel.querySelector('.demo-output-content').innerHTML =
        `<pre class="demo-error">连接失败: ${escapeHtml(e.message)}</pre>`;
      triggerBtn.disabled = false;
      triggerBtn.textContent = '▶ 重新运行';
    }
  }

  // ── Setup streaming output panel ────────────────────────
  function setupStreamingOutput(outputPanel, demoName) {
    const header = outputPanel.querySelector('.demo-output-header');
    const content = outputPanel.querySelector('.demo-output-content');

    content.innerHTML = `
      <div class="demo-progress-heartbeat"></div>
      <div class="demo-log-stream" style="max-height:380px;overflow-y:auto;background:#060A1A;border:1px solid #1E3A6E;border-radius:6px;padding:10px 14px;font-family:var(--font-mono,monospace);font-size:11px;line-height:1.6;color:#E8EEFF"></div>
      <div class="demo-result-area" style="margin-top:8px"></div>
    `;

    // Add panic button if not already present
    if (!outputPanel.querySelector('.demo-panic-btn')) {
      const panicBtn = document.createElement('button');
      panicBtn.className = 'demo-panic-btn';
      panicBtn.textContent = '⚠️ 应急切换';
      panicBtn.title = '停止实时运行，切换到预录回放';
      panicBtn.addEventListener('click', async () => {
        const taskId = outputPanel.dataset.activeTaskId;
        if (taskId) {
          try {
            await fetch(`${API_BASE}/api/demo/panic/${taskId}`, { method: 'POST' });
          } catch (e) { /* ignore */ }
          // Close active SSE
          if (activeSources[taskId]) {
            activeSources[taskId].close();
            delete activeSources[taskId];
          }
        }
        // Switch to prerecorded if available
        showToast('已切换到预录模式', 'warning');
      });
      header.appendChild(panicBtn);
    }
  }

  // ── Connect SSE stream ──────────────────────────────────
  function connectSSE(taskId, outputPanel, demoName, isPrerecorded) {
    const logStream = outputPanel.querySelector('.demo-log-stream');
    const progressBar = outputPanel.querySelector('.demo-progress-heartbeat');
    const resultArea = outputPanel.querySelector('.demo-result-area');
    const statusEl = outputPanel.querySelector('.demo-output-status');

    outputPanel.dataset.activeTaskId = taskId;

    let url;
    if (isPrerecorded) {
      url = `${API_BASE}/api/demo/prerecorded/${demoName}`;
    } else {
      url = `${API_BASE}/api/demo/stream/${taskId}`;
    }

    const evtSource = new EventSource(url);
    activeSources[taskId] = evtSource;

    if (statusEl) {
      statusEl.textContent = isPrerecorded ? '▶ 预录回放中' : '▶ 实时运行中';
      statusEl.style.color = '#00D4FF';
    }

    evtSource.addEventListener('log', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.text) {
          appendLogLine(logStream, data.text);
          autoScroll(logStream);
        }
      } catch (err) {
        appendLogLine(logStream, e.data);
        autoScroll(logStream);
      }
    });

    evtSource.addEventListener('result', (e) => {
      try {
        const result = JSON.parse(e.data);
        renderResult(resultArea, outputPanel, result);
        if (statusEl) {
          const ok = result.exit_code === 0;
          statusEl.textContent = ok ? '✅ 完成' : `❌ 退出码: ${result.exit_code}`;
          statusEl.style.color = ok ? '#22C55E' : '#EF4444';
        }
      } catch (err) {
        resultArea.innerHTML = `<pre class="demo-terminal">${escapeHtml(e.data)}</pre>`;
      }
      // Complete: snap progress bar to green
      if (progressBar) {
        progressBar.style.background = '#22C55E';
        progressBar.style.animation = 'none';
      }
      evtSource.close();
      delete activeSources[taskId];
    });

    evtSource.addEventListener('preview', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.preview_url) {
          resultArea.innerHTML = `
            <div class="demo-image-result">
              <img src="${data.preview_url}" alt="生成预览"
                   class="demo-result-preview"
                   onerror="this.parentElement.innerHTML='<p style=color:#8FA1CC>预览图生成中，请稍后...</p>'"
                   style="max-width:100%;max-height:400px;border-radius:8px;border:1px solid #1E3A6E;">
            </div>`;
        }
      } catch (err) { /* ignore */ }
    });

    evtSource.addEventListener('error', () => {
      if (evtSource.readyState === EventSource.CLOSED) {
        if (statusEl) {
          statusEl.textContent = '⚠️ 连接断开';
          statusEl.style.color = '#F59E0B';
        }
        delete activeSources[taskId];
      }
    });

    // Auto-close after 5 minutes safety
    setTimeout(() => {
      if (evtSource.readyState !== EventSource.CLOSED) {
        evtSource.close();
        delete activeSources[taskId];
      }
    }, 300000);
  }

  // ── Append a log line with animation ────────────────────
  function appendLogLine(container, text) {
    const line = document.createElement('div');
    line.className = 'demo-log-line';
    line.innerHTML = parseAnsi(text);
    line.style.animation = 'logSlideIn 0.12s ease-out';
    container.appendChild(line);
  }

  function autoScroll(container) {
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    if (nearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // ── Render final result ─────────────────────────────────
  function renderResult(resultArea, outputPanel, result) {
    let html = '';

    // File output with download link
    if (result.output_file) {
      const fname = result.output_file.split('/').pop();
      const servePath = `/api/static/output/${fname}`;
      html += `
        <div style="padding:12px;background:rgba(34,197,94,0.08);border:1px solid #22C55E;border-radius:8px;">
          <span style="color:#22C55E">📦 文件已生成: </span>
          <a href="${API_BASE}${servePath}" download style="color:#00D4FF;font-weight:bold">${escapeHtml(fname)}</a>
        </div>`;
    }

    // KPI extraction
    const logText = outputPanel.querySelector('.demo-log-stream')?.textContent || '';
    const kpis = extractKpis(logText);
    if (kpis.length > 0) {
      html += `<div class="demo-kpi-row" style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">`;
      kpis.forEach(k => {
        html += `<div style="padding:8px 14px;background:rgba(0,212,255,0.06);border:1px solid #1E3A6E;border-radius:6px;text-align:center">
          <div style="color:#00D4FF;font-size:18px;font-weight:bold">${escapeHtml(k.value)}</div>
          <div style="color:#8FA1CC;font-size:10px">${escapeHtml(k.label)}</div>
        </div>`;
      });
      html += `</div>`;
    }

    resultArea.innerHTML = html;
  }

  // ── KPI extraction from log output ──────────────────────
  function extractKpis(text) {
    const kpis = [];
    const seen = new Set();
    const patterns = [
      [/(\d+)\s*(分钟|min)\s*(完成|耗时)/, (m) => ({ value: m[1] + 'min', label: '耗时' })],
      [/(\d+)\s*页/, (m) => ({ value: m[1], label: '页数' })],
      [/(\d+)\s*(家|个)\s*(股东|实体)/, (m) => ({ value: m[1], label: m[3] })],
      [/(\+\d+)\s*(新实体|实体)/, (m) => ({ value: m[1], label: '入库' })],
      [/MOIC\s*([\d.]+)/, (m) => ({ value: m[1], label: 'MOIC' })],
      [/亏\s*(\d+%)/, (m) => ({ value: m[1], label: '估值' })],
    ];
    for (const [pat, fn] of patterns) {
      const m = text.match(pat);
      if (m) {
        const k = fn(m);
        const key = k.value + k.label;
        if (!seen.has(key)) {
          seen.add(key);
          kpis.push(k);
        }
        if (kpis.length >= 5) break;
      }
    }
    return kpis;
  }

  // ── Create output panel DOM ─────────────────────────────
  function createOutputPanel(demoName) {
    const panel = document.createElement('div');
    panel.className = 'demo-output';
    panel.dataset.demo = demoName;
    panel.innerHTML = `
      <div class="demo-output-header" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(0,212,255,0.04);border:1px solid #1E3A6E;border-radius:8px 8px 0 0;border-bottom:none">
        <span class="demo-output-title" style="color:#00D4FF;font-size:13px;font-weight:bold">📺 演示输出</span>
        <span class="demo-output-status" style="color:#8FA1CC;font-size:11px">⏳ 等待执行</span>
        <button class="demo-output-close" title="关闭" style="margin-left:auto;background:none;border:none;color:#8FA1CC;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div class="demo-output-content" style="border:1px solid #1E3A6E;border-top:none;border-radius:0 0 8px 8px;padding:12px"></div>
    `;
    panel.querySelector('.demo-output-close').addEventListener('click', () => {
      panel.classList.remove('active');
      const taskId = panel.dataset.activeTaskId;
      if (taskId && activeSources[taskId]) {
        activeSources[taskId].close();
        delete activeSources[taskId];
      }
    });
    return panel;
  }

  // ── ANSI color parser ───────────────────────────────────
  function parseAnsi(text) {
    return escapeHtml(text)
      .replace(/\x1b\[32m/g, '<span style="color:#22C55E">')
      .replace(/\x1b\[31m/g, '<span style="color:#EF4444">')
      .replace(/\x1b\[33m/g, '<span style="color:#F59E0B">')
      .replace(/\x1b\[36m/g, '<span style="color:#00D4FF">')
      .replace(/\x1b\[35m/g, '<span style="color:#A855F7">')
      .replace(/\x1b\[1m/g, '<span style="font-weight:bold">')
      .replace(/\x1b\[0m/g, '</span>');
  }

  // ── Toast notification ──────────────────────────────────
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
    el._t = setTimeout(() => { el.style.opacity = '0'; }, 4000);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Expose API ──────────────────────────────────────────
  window.DEMO = {
    run: runDemo,
    checkServer,
    isServerAvailable: () => serverAvailable,
    closeAll: () => {
      Object.values(activeSources).forEach(s => s.close());
      activeSources = {};
    },
  };
})();
