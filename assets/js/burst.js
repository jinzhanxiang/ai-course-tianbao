/* ============================================== */
/* BURST 弹出动画系统 v1.3                          */
/* 8 种差异化动画 · 12 类简介自动适配               */
/* ============================================== */

(function() {
  'use strict';

  // ============== 1. 内容数据 ==============
  // 每个 burst 包含：动画类型、内容数组、显示时长
  const BURST_DATA = {
    // 00 封面 - 7 大智能体（辐射风暴，6s）
    'burst-7agents': {
      style: 'radial',
      duration: 6000,
      cards: [
        { icon: '🧠', title: 'main', desc: '总调度 · 任务分发 · 闭环跟踪', color: '#00D4FF', angle: '309' },
        { icon: '📋', title: 'project', desc: '项目管家 · 流程协调 · 报告编写', color: '#22C55E', angle: '51' },
        { icon: '🔍', title: 'research', desc: '研究分析 · 行业 · 财务 · 估值', color: '#F59E0B', angle: '103' },
        { icon: '🧹', title: 'data', desc: '数据管道 · 转录 · OCR · 清洗', color: '#A855F7', angle: '154' },
        { icon: '📄', title: 'report', desc: '排版输出 · Word · PDF · PPT', color: '#EC4899', angle: '206' },
        { icon: '🛠️', title: 'Claude Code', desc: '工程助手 · 改代码 · 写脚本', color: '#00D4FF', angle: '257' },
        { icon: '🏛️', title: 'Hermes', desc: '知识中台 · Wiki · 检索 · 归档', color: '#A855F7', angle: '0' }
      ]
    },

    // 01 开场 - 5+2+1（三栏并出，5s）
    'burst-5plus2plus1': {
      style: 'threecol',
      duration: 5000,
      cards: [
        { icon: '⚙️', title: '5 大 Agent', desc: 'main / project / research / data / report 协同作战，全自动交付', color: '#00D4FF', pos: 'left' },
        { icon: '🧰', title: '2 大助手', desc: 'Claude Code 改代码 + Hermes 管知识中台', color: '#22C55E', pos: 'center' },
        { icon: '🏛️', title: '1 套中台', desc: 'Qdrant 向量库 + PostgreSQL + Wiki 检索', color: '#A855F7', pos: 'right' }
      ]
    },

    // 02 革命 - 5+2+1（纵向递进，5s）
    'burst-revolution': {
      style: 'vert',
      duration: 5000,
      cards: [
        { icon: '⚡', title: '生产关系革命', desc: '从「研究员手敲」到「5 Agent 自动跑」，4 小时活 4 分钟完成', color: '#00D4FF', pos: 'top' },
        { icon: '🧠', title: '智能体协同革命', desc: '单 Agent → 多 Agent 协作，main 调度 4 个子 Agent', color: '#A855F7', pos: 'middle' },
        { icon: '🏛️', title: '知识资产革命', desc: '从「个人经验」到「公司中台」，沉淀可复用', color: '#F59E0B', pos: 'bottom' }
      ]
    },

    // 04 项目 - 7 阶段（横向流水线，6s）
    'burst-project-7': {
      style: 'pipe',
      duration: 6000,
      cards: [
        { icon: '1️⃣', title: '立项', desc: '业务部门提需求 · 投资部初筛', color: '#22C55E' },
        { icon: '2️⃣', title: '调研', desc: '行业研究 · 政策分析 · 宏观判断', color: '#22C55E' },
        { icon: '3️⃣', title: '尽调', desc: '财务审计 · 法律合规 · 业务现场', color: '#22C55E' },
        { icon: '4️⃣', title: '估值', desc: 'DCF 模型 · 可比公司 · 敏感性分析', color: '#22C55E' },
        { icon: '5️⃣', title: '谈判', desc: '交易结构 · 对赌条款 · 价格博弈', color: '#22C55E' },
        { icon: '6️⃣', title: '交割', desc: '股权过户 · 工商变更 · 资金安排', color: '#22C55E' },
        { icon: '7️⃣', title: '投后', desc: '跟踪运营 · 风险预警 · 退出准备', color: '#22C55E' }
      ]
    },

    // 05 研究 - 7 维度（七芒星，6s）
    'burst-research-7': {
      style: '7star',
      duration: 6000,
      cards: [
        { icon: '🌐', title: '宏观环境', desc: 'PEST · 经济周期 · 政策窗口', color: '#F59E0B', angle: '309' },
        { icon: '🏭', title: '行业格局', desc: '波特五力 · 集中度 · 竞争结构', color: '#F59E0B', angle: '51' },
        { icon: '💼', title: '商业模式', desc: '盈利逻辑 · 现金流 · 护城河', color: '#F59E0B', angle: '103' },
        { icon: '📊', title: '财务分析', desc: '三表勾稽 · 盈利质量 · 偿债能力', color: '#F59E0B', angle: '154' },
        { icon: '⚖️', title: '估值建模', desc: 'DCF · 可比 · 敏感性 · 情景分析', color: '#F59E0B', angle: '206' },
        { icon: '⚠️', title: '风险识别', desc: '政策 · 市场 · 经营 · 合规风险', color: '#F59E0B', angle: '257' },
        { icon: '🎯', title: '投资建议', desc: '评级 · 目标价 · 退出路径', color: '#F59E0B', angle: '0' }
      ]
    },

    // 06 数据 - 7 步骤（彩虹瀑布，6s）
    'burst-data-7': {
      style: 'waterfall',
      duration: 6000,
      cards: [
        { icon: '🎙️', title: '语音采集', desc: '现场录音 · 飞书会议 · 微信通话', color: '#A855F7' },
        { icon: '📝', title: '转录', desc: 'FunASR · 中英混 · 术语纠错', color: '#A855F7' },
        { icon: '🔍', title: 'OCR 识别', desc: 'PDF · 图片 · 表格 · 公式', color: '#A855F7' },
        { icon: '🧹', title: '清洗', desc: '去重 · 纠错 · 标准化 · 结构化', color: '#A855F7' },
        { icon: '✂️', title: '切分', desc: '按章节 · 按主题 · 按时间', color: '#A855F7' },
        { icon: '🧬', title: '向量化', desc: 'bge-m3 · 嵌入 · 索引建立', color: '#A855F7' },
        { icon: '💾', title: '入库', desc: 'Qdrant · PG · Wiki 双向写入', color: '#A855F7' }
      ]
    },

    // 07 排版 - 3 管线（三轨推进，4s）
    'burst-report-3': {
      style: 'track',
      duration: 4000,
      cards: [
        { icon: '📄', title: 'Word 管线', desc: '公文格式 · 字号规范 · 页眉页脚', color: '#EC4899' },
        { icon: '📊', title: 'PPT 管线', desc: '版式统一 · 母版继承 · 配色一致', color: '#EC4899' },
        { icon: '📑', title: 'PDF 管线', desc: '图表导出 · 加密 · 水印 · 批注', color: '#EC4899' }
      ]
    },

    // 08 生态 - 5+2+1+1（四方格，7s）
    'burst-ecosystem': {
      style: 'grid',
      duration: 7000,
      cards: [
        { icon: '⚙️', title: '5 大 Agent', desc: 'main / project / research / data / report', color: '#00D4FF', pos: 'tl' },
        { icon: '🛠️', title: '2 大助手', desc: 'Claude Code + Hermes', color: '#22C55E', pos: 'tr' },
        { icon: '🏛️', title: '1 套中台', desc: 'Qdrant + PG + Wiki', color: '#A855F7', pos: 'bl' },
        { icon: '🌐', title: '1 个团队', desc: '人类主导 · AI 执行 · 协同进化', color: '#F59E0B', pos: 'br' }
      ]
    },

    // 09 案例 - 5 案例（轮盘入场，5s）
    'burst-case-5': {
      style: 'roulette',
      duration: 5000,
      cards: [
        { icon: '⚡', title: '启源芯', desc: '功率半导体 · 收购尽调 · 28 天完成', color: '#00D4FF' },
        { icon: '🚗', title: '星恒电源', desc: '锂电池 · 投后管理 · 估值修复 +40%', color: '#22C55E' },
        { icon: '💎', title: '晶能光电', desc: 'LED 外延 · 估值建模 · DCF 验证', color: '#F59E0B' },
        { icon: '🏛️', title: '盈科系', desc: '律师事务所 · 谈判策略 · 条款博弈', color: '#A855F7' },
        { icon: '♻️', title: '中资环', desc: '固废处置 · 行业研究 · 政策红利', color: '#EC4899' }
      ]
    },

    // 10 方法 - 纵横+6 维度（折扇，6s）
    'burst-method-8': {
      style: 'fan',
      duration: 6000,
      cards: [
        { icon: '↕️', title: '纵向（行业）', desc: '从政策到企业 5 层穿透', color: '#00D4FF', pos: 'main' },
        { icon: '↔️', title: '横向（时序）', desc: '3-5 年财务轨迹', color: '#A855F7', pos: 'sub1' },
        { icon: '📊', title: '财务 6 维', desc: '增长 · 盈利 · 偿债 · 运营 · 现金流 · 估值', color: '#F59E0B', pos: 'sub2' },
        { icon: '🌍', title: '行业 6 维', desc: '规模 · 增速 · 集中度 · 壁垒 · 政策 · 替代', color: '#22C55E', pos: 'sub3' },
        { icon: '🏢', title: '业务 6 维', desc: '产品 · 客户 · 供应链 · 渠道 · 技术 · 团队', color: '#EC4899', pos: 'sub4' },
        { icon: '⚖️', title: '治理 6 维', desc: '股权 · 董监高 · 激励 · 内控 · 合规 · 信息', color: '#00D4FF', pos: 'sub5' },
        { icon: '⚠️', title: '风险 6 维', desc: '政策 · 市场 · 经营 · 财务 · 法律 · 退出', color: '#F59E0B', pos: 'sub6' },
        { icon: '🎯', title: '结论', desc: '评级 · 建议 · 退出路径', color: '#A855F7', pos: 'sub7' }
      ]
    },

    // 11 演示 - 5 智能体（HUD 重叠，5s）
    'burst-demo-5': {
      style: 'hud',
      duration: 5000,
      cards: [
        { icon: '🧠', title: 'main', desc: '总调度 · 任务分发', color: '#00D4FF' },
        { icon: '📋', title: 'project', desc: '流程协调', color: '#22C55E' },
        { icon: '🔍', title: 'research', desc: '行业研究', color: '#F59E0B' },
        { icon: '🧹', title: 'data', desc: '清洗入库', color: '#A855F7' },
        { icon: '📄', title: 'report', desc: '排版输出', color: '#EC4899' }
      ]
    },

    // 12 Q&A - 6 问（问答气泡，7s）
    'burst-qa-6': {
      style: 'bubble',
      duration: 7000,
      cards: [
        { icon: '❓', title: 'Q1 准确率', desc: 'AI 写的研报能信吗？', color: '#00D4FF' },
        { icon: '❓', title: 'Q2 数据安全', desc: '敏感项目数据会不会泄露？', color: '#22C55E' },
        { icon: '❓', title: 'Q3 学习曲线', desc: '老人 vs 新人 谁先用？', color: '#F59E0B' },
        { icon: '❓', title: 'Q4 成本', desc: '一年要花多少钱？', color: '#A855F7' },
        { icon: '❓', title: 'Q5 与日常冲突', desc: '业务忙没时间用？', color: '#EC4899' },
        { icon: '❓', title: 'Q6 推广', desc: '如何让其他部门也用？', color: '#00D4FF' }
      ]
    }
  };

  // ============== 2. 渲染函数 ==============
  function renderBurstStage(burstId, data) {
    const stage = document.getElementById(burstId);
    if (!stage) return;
    stage.className = 'burst-stage burst-style-' + data.style;
    stage.innerHTML = '';

    data.cards.forEach((card, idx) => {
      const div = document.createElement('div');
      div.className = 'burst-card';
      div.style.setProperty('--bc-color', card.color);
      div.style.setProperty('--bc-glow', card.color + '66');

      // 根据 style 设置定位属性
      let attrs = `data-i="${idx}"`;
      if (card.pos) attrs += ` data-pos="${card.pos}"`;
      if (card.angle !== undefined) attrs += ` data-angle="${card.angle}"`;
      div.setAttribute('data-i', idx);
      if (card.pos) div.setAttribute('data-pos', card.pos);
      if (card.angle !== undefined) div.setAttribute('data-angle', card.angle);

      div.innerHTML = `
        <span class="bc-icon">${card.icon}</span>
        <div class="bc-title" style="color:${card.color}">${card.title}</div>
        <div class="bc-desc">${card.desc}</div>
      `;
      stage.appendChild(div);
    });
  }

  // ============== 3. 触发函数 ==============
  let currentTimer = null;
  function triggerBurst(burstId) {
    const data = BURST_DATA[burstId];
    if (!data) return;

    const stage = document.getElementById(burstId);
    if (!stage) return;

    // 首次渲染
    if (stage.children.length === 0) {
      renderBurstStage(burstId, data);
    }

    // 如果已经显示，立即关闭
    if (stage.classList.contains('show')) {
      stage.classList.remove('show');
      document.querySelector('.burst-overlay')?.classList.remove('show');
      document.querySelector('.burst-close')?.classList.remove('show');
      if (currentTimer) clearTimeout(currentTimer);
      return;
    }

    // 创建/获取 overlay 和 close 按钮
    let overlay = document.querySelector('.burst-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'burst-overlay';
      overlay.addEventListener('click', closeAllBurst);
      document.body.appendChild(overlay);
    }
    overlay.classList.add('show');

    let closeBtn = document.querySelector('.burst-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'burst-close';
      closeBtn.innerHTML = '✕';
      closeBtn.addEventListener('click', closeAllBurst);
      document.body.appendChild(closeBtn);
    }
    closeBtn.classList.add('show');

    // 显示
    stage.classList.add('show');

    // 自动关闭
    if (currentTimer) clearTimeout(currentTimer);
    currentTimer = setTimeout(closeAllBurst, data.duration);
  }

  function closeAllBurst() {
    document.querySelectorAll('.burst-stage.show').forEach(s => s.classList.remove('show'));
    document.querySelector('.burst-overlay')?.classList.remove('show');
    document.querySelector('.burst-close')?.classList.remove('show');
    if (currentTimer) clearTimeout(currentTimer);
  }

  // ============== 4. 绑定事件 ==============
  function bindBurstTriggers() {
    document.querySelectorAll('.burst-trigger').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const burstId = this.getAttribute('data-burst');
        triggerBurst(burstId);
      });
    });
  }

  // ============== 5. 初始化 ==============
  document.addEventListener('DOMContentLoaded', bindBurstTriggers);

  // 暴露全局函数，供动态注入内容使用
  window.bindBurstTriggers = bindBurstTriggers;
  window.triggerBurst = triggerBurst;
  window.closeAllBurst = closeAllBurst;
})();
