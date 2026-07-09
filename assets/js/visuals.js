/* =====================================================
   visuals.js — 6 种可视化组件控制器
   配合 visuals.css 使用，所有组件通过 data-visual="xxx" 激活
   加载顺序：main.js → visuals.js
   ===================================================== */

(function() {
  'use strict';

  // ========== 工具函数 ==========
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // ========== 1. RadarChart 雷达图 ==========
  function initRadarCharts() {
    $$('[data-visual="radar"]').forEach(function(container) {
      if (container.querySelector('.radar-chart-wrap')) return; // 已初始化

      var labels = (container.dataset.radarLabels || '').split(',').map(function(s) { return s.trim(); });
      var values1 = (container.dataset.radarValues || '').split(',').map(function(s) { return parseFloat(s.trim()) || 0; });
      var values2 = (container.dataset.radarValues2 || '').split(',').map(function(s) { return parseFloat(s.trim()) || 0; });
      var hasCompare = values2.length > 0;

      if (labels.length < 3) return;

      var size = 320;
      var cx = size / 2, cy = size / 2;
      var radius = 130;
      var count = labels.length;
      var angleStep = (Math.PI * 2) / count;

      // 生成 SVG
      var svgParts = [];
      svgParts.push('<svg viewBox="0 0 ' + size + ' ' + size + '">');

      // 环形网格
      for (var r = 1; r <= 4; r++) {
        var rr = (radius / 4) * r;
        svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" class="radar-ring"/>');
      }

      // 轴线
      for (var i = 0; i < count; i++) {
        var angle = -Math.PI / 2 + angleStep * i;
        var x = cx + radius * Math.cos(angle);
        var y = cy + radius * Math.sin(angle);
        svgParts.push('<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '" class="radar-axis"/>');
      }

      // 数据多边形
      function polyPoints(vals, maxVal) {
        var pts = [];
        for (var i = 0; i < count; i++) {
          var angle = -Math.PI / 2 + angleStep * i;
          var val = Math.min(vals[i] || 0, maxVal);
          var r = (val / maxVal) * radius;
          pts.push((cx + r * Math.cos(angle)).toFixed(1) + ',' + (cy + r * Math.sin(angle)).toFixed(1));
        }
        return pts.join(' ');
      }

      var maxV = Math.max.apply(null, values1.concat(values2)) || 100;
      maxV = Math.ceil(maxV / 20) * 20 || 100;

      svgParts.push('<polygon points="' + polyPoints(values1, maxV) + '" class="radar-poly"/>');
      if (hasCompare) {
        svgParts.push('<polygon points="' + polyPoints(values2, maxV) + '" class="radar-poly-alt"/>');
      }

      // 标签
      for (var i2 = 0; i2 < count; i2++) {
        var angle2 = -Math.PI / 2 + angleStep * i2;
        var lx = cx + (radius + 22) * Math.cos(angle2);
        var ly = cy + (radius + 22) * Math.sin(angle2);
        svgParts.push('<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" class="radar-label">' + labels[i2] + '</text>');
      }

      svgParts.push('</svg>');

      var wrap = document.createElement('div');
      wrap.className = 'radar-chart-wrap';
      wrap.innerHTML = svgParts.join('');
      container.insertBefore(wrap, container.firstChild);

      // 图例
      if (hasCompare) {
        var legend = container.querySelector('.radar-legend');
        if (legend) {
          var items = legend.querySelectorAll('.radar-legend-item');
          if (items.length >= 2) {
            items[0].querySelector('.radar-legend-dot').style.background = 'rgba(0,212,255,0.6)';
            items[1].querySelector('.radar-legend-dot').style.background = 'rgba(168,85,247,0.6)';
          }
        }
      }
    });
  }

  // ========== 2. ArchDiagram 架构图 ==========
  function initArchDiagrams() {
    $$('[data-visual="arch-diagram"]').forEach(function(container) {
      if (container.dataset.archReady) return;
      container.dataset.archReady = '1';

      // 为每个 arch-layer 设置标签样式
      var layers = container.querySelectorAll('.arch-layer');
      layers.forEach(function(layer, idx) {
        var label = layer.dataset.label;
        if (label && !layer.querySelector('.arch-layer-label')) {
          var labelEl = document.createElement('span');
          labelEl.className = 'arch-layer-label';
          labelEl.textContent = label;
          layer.style.position = layer.style.position || 'relative';
          layer.insertBefore(labelEl, layer.firstChild);
        }
        // 错位动画
        layer.style.animationDelay = (idx * 0.08) + 's';
      });

      // 动态绘制 SVG 连接线
      drawArchConnections(container, layers);
    });
  }

  function drawArchConnections(container, layers) {
    // 移除旧线
    var oldSvg = container.querySelector('.arch-svg-layer');
    if (oldSvg) oldSvg.remove();

    if (layers.length < 2) return;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('arch-svg-layer');
    svg.style.position = 'absolute';
    svg.style.inset = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '0';

    var rect = container.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);

    // 在相邻层之间绘制连接线
    for (var i = 0; i < layers.length - 1; i++) {
      var topLayer = layers[i];
      var botLayer = layers[i + 1];

      var topRect = topLayer.getBoundingClientRect();
      var botRect = botLayer.getBoundingClientRect();
      var containerRect = container.getBoundingClientRect();

      var x1 = (topRect.left + topRect.right) / 2 - containerRect.left;
      var y1 = topRect.bottom - containerRect.top;
      var x2 = (botRect.left + botRect.right) / 2 - containerRect.left;
      var y2 = botRect.top - containerRect.top;

      // 贝塞尔曲线
      var cy1 = y1 + (y2 - y1) * 0.4;
      var cy2 = y1 + (y2 - y1) * 0.6;

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + cy1 + ' ' + x2 + ' ' + cy2 + ' ' + x2 + ' ' + y2);
      path.setAttribute('class', 'arch-connection');
      svg.appendChild(path);
    }

    container.style.position = 'relative';
    container.appendChild(svg);
  }

  // 窗口 resize 时重新绘制
  var archResizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(archResizeTimer);
    archResizeTimer = setTimeout(function() {
      $$('[data-visual="arch-diagram"]').forEach(function(container) {
        var layers = container.querySelectorAll('.arch-layer');
        if (layers.length >= 2) drawArchConnections(container, layers);
      });
    }, 300);
  });

  // ========== 3. CompareSlider 对比滑动器 ==========
  function initCompareSliders() {
    $$('[data-visual="compare-slider"]').forEach(function(container) {
      if (container.dataset.compareReady) return;
      container.dataset.compareReady = '1';

      var divider = container.querySelector('.compare-divider');
      var before = container.querySelector('.compare-before');
      var after = container.querySelector('.compare-after');
      if (!divider || !before || !after) return;

      var isDragging = false;

      function onDown(e) {
        isDragging = true;
        divider.style.boxShadow = '0 0 20px rgba(0,212,255,0.7)';
        e.preventDefault();
      }

      function onUp() {
        isDragging = false;
        divider.style.boxShadow = '';
      }

      function onMove(e) {
        if (!isDragging) return;
        var containerRect = container.getBoundingClientRect();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var pct = ((clientX - containerRect.left) / containerRect.width) * 100;
        pct = Math.max(20, Math.min(80, pct));
        before.style.width = pct + '%';
        after.style.width = (100 - pct) + '%';
      }

      divider.addEventListener('mousedown', onDown);
      divider.addEventListener('touchstart', onDown);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove);
    });
  }

  // ========== 4. Dashboard 仪表盘 ==========
  function initDashboards() {
    $$('[data-visual="dashboard"]').forEach(function(container) {
      if (container.dataset.dashReady) return;
      container.dataset.dashReady = '1';

      var cards = container.querySelectorAll('.dash-card');
      cards.forEach(function(card) {
        var value = parseFloat(card.dataset.value) || 0;
        var max = parseFloat(card.dataset.max) || 100;
        var pct = Math.min(1, value / max);
        var gaugeWrap = card.querySelector('.dash-gauge-wrap');
        if (!gaugeWrap) return;

        // 用 IntersectionObserver 触发动画
        var fill = gaugeWrap.querySelector('.dash-gauge-fill');
        if (!fill) return;

        var circumference = 2 * Math.PI * 40; // r=40
        fill.style.strokeDasharray = circumference;
        fill.style.strokeDashoffset = circumference;

        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              setTimeout(function() {
                fill.style.strokeDashoffset = circumference * (1 - pct);
              }, 200);
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });
        observer.observe(card);
      });
    });
  }

  // ========== 5. Pipeline 流程管道 ==========
  function initPipelines() {
    $$('[data-visual="pipeline"]').forEach(function(container) {
      if (container.dataset.pipeReady) return;
      container.dataset.pipeReady = '1';

      var steps = container.querySelectorAll('.pipeline-step');
      var observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          steps.forEach(function(step, i) {
            step.style.opacity = '0';
            step.style.transform = 'translateY(20px)';
            step.style.transition = 'all 0.4s ' + (i * 0.08) + 's cubic-bezier(0.22,0.61,0.36,1)';
            requestAnimationFrame(function() {
              step.style.opacity = '1';
              step.style.transform = 'translateY(0)';
            });
          });
          observer.unobserve(container);
        }
      }, { threshold: 0.3 });
      observer.observe(container);
    });
  }

  // ========== 6. TimelineRoad 时间线 ==========
  function initTimelines() {
    $$('[data-visual="timeline-road"]').forEach(function(container) {
      if (container.dataset.timelineReady) return;
      container.dataset.timelineReady = '1';

      var track = container.querySelector('.timeline-track');
      var nodes = container.querySelectorAll('.timeline-node');
      if (!track || nodes.length < 2) return;

      // 按 data-year 排序后在 track 上按比例定位
      var years = [];
      nodes.forEach(function(node) {
        years.push(parseInt(node.dataset.year) || 0);
      });

      var minYear = Math.min.apply(null, years);
      var maxYear = Math.max.apply(null, years);
      var range = maxYear - minYear || 1;

      nodes.forEach(function(node, i) {
        var year = years[i];
        var pct = ((year - minYear) / range) * 100;
        node.style.left = pct + '%';

        var observer = new IntersectionObserver(function(entries) {
          if (entries[0].isIntersecting) {
            node.style.opacity = '0';
            node.style.transform = 'translate(-50%, -50%) scale(0.8)';
            node.style.transition = 'all 0.5s ' + (i * 0.1) + 's cubic-bezier(0.22,0.61,0.36,1)';
            requestAnimationFrame(function() {
              node.style.opacity = '1';
              node.style.transform = 'translate(-50%, -50%) scale(1)';
            });
            observer.unobserve(node);
          }
        }, { threshold: 0.5 });
        observer.observe(node);
      });
    });
  }

  // ========== 全局初始化 ==========
  function initAllVisuals() {
    initRadarCharts();
    initArchDiagrams();
    initCompareSliders();
    initDashboards();
    initPipelines();
    initTimelines();
  }

  // ========== 触发重刷（slide 切换时调用） ==========
  function refreshVisuals() {
    // 重新绘制架构图连接线
    $$('[data-visual="arch-diagram"]').forEach(function(container) {
      var layers = container.querySelectorAll('.arch-layer');
      if (layers.length >= 2) drawArchConnections(container, layers);
    });
    // 重新触发仪表盘动画
    $$('[data-visual="dashboard"]').forEach(function(container) {
      container.dataset.dashReady = '';
    });
    initDashboards();
    // 重新触发管道动画
    $$('[data-visual="pipeline"]').forEach(function(container) {
      container.dataset.pipeReady = '';
    });
    initPipelines();
    // 重新触发时间线动画
    $$('[data-visual="timeline-road"]').forEach(function(container) {
      container.dataset.timelineReady = '';
    });
    initTimelines();
  }

  // ========== 导出到全局 ==========
  window.Visuals = {
    initAll: initAllVisuals,
    refresh: refreshVisuals,
    initRadarCharts: initRadarCharts,
    initArchDiagrams: initArchDiagrams,
    initCompareSliders: initCompareSliders,
    initDashboards: initDashboards,
    initPipelines: initPipelines,
    initTimelines: initTimelines
  };

  // ========== DOM ready 自动初始化 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllVisuals);
  } else {
    initAllVisuals();
  }

})();
