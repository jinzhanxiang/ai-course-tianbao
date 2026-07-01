/* =====================================================
   课程数据 - 7 大智能体 + 演讲备注
   ===================================================== */

window.COURSE_DATA = {

  // 7 大智能体 + 1 中台
  agents: {
    main: {
      name: 'main · 总调度',
      emoji: '🎯',
      role: '接收主公指令、拆解任务、调度 4 大 Agent、闭环反馈',
      skills: [
        '意图理解 + 任务拆解（5 要素：背景/目标/交付物/回传/时限）',
        'sessions_send 调度 4 大 Agent 协同',
        'sessions_history 跟踪每个 Agent 状态',
        '心跳监控 + 主动巡检',
        '结果汇总 + 主公决策支持'
      ],
      case: '2026-05-08：主公切换 Claude Code 模型，main 检查所有 agent 状态、确认无任务后才放行升级，避免中断。',
      path: '~/.openclaw/workspace/AGENTS.md · SOUL.md'
    },
    project: {
      name: 'project · 项目管家',
      emoji: '📋',
      role: '项目全生命周期管理、起草投资请示、节点跟踪',
      skills: [
        'GP/LP 项目台账管理',
        '投资请示章节编写',
        '可行性研究报告框架搭建',
        '会议纪要 → 待办事项',
        '跨代理协调（research/data/report）'
      ],
      case: '盈科创新资产管理 / 晶能光电 / 启源芯 等多个 PE 项目进度跟踪，main 调度 project 起草请示初稿。',
      path: '~/.openclaw/workspace-project/'
    },
    research: {
      name: 'research V3 · 研究员',
      emoji: '🔬',
      role: '行业研究 / 财务尽调 / 估值建模（DCF/IRR/NPV）',
      skills: [
        'V3.0 四阶段流水线：预处理 / 多源检索 / 异常检测 / 报告生成',
        'Work Stream 并行（V3.33 升级）',
        '行业研究 + 财务建模 + 估值三位一体',
        'Qdrant 三阶段检索 + KG 框架',
        '9 步质控链 + 蒙特卡洛模拟'
      ],
      case: '启源芯项目：V3.0 自动出行业研究初稿；Claude Code 介入做敏感性分析（WACC ±2%）。',
      path: '~/Documents/OpenClaw-Workspace-research/scripts/run_v3.sh'
    },
    data: {
      name: 'data · 数据工',
      emoji: '🗄️',
      role: '28 个清洗脚本、PDF/OCR 识别、向量化入库',
      skills: [
        'L1/L2/L3 三层 28 个清洗脚本',
        'PDF → DOCX → 结构化 JSON',
        'FunASR 语音转录',
        'PostgreSQL + Qdrant 入库',
        '自动向量化（bge-m3）'
      ],
      case: '启源芯 100 份研报清洗入库：人工 1 周 → data 2 小时，5786 实体入库。',
      path: '~/Documents/OpenClaw-Workspace-data/scripts/cleaning/'
    },
    report: {
      name: 'report · 报告专家',
      emoji: '📄',
      role: 'Word/PDF/PPT 排版、会议纪要、正式文档输出',
      skills: [
        'OpenXML SDK 三管线：新建 / 编辑 / 模板填充',
        '国企公文规范排版',
        '会议纪要整理 + 待办提取',
        'PDF 合并 + 目录生成',
        'XSD 验证门控'
      ],
      case: '启源芯投决文档 1 小时定稿（原 8 小时手动排版）。',
      path: '~/.openclaw/workspace-report/'
    },
    claude: {
      name: 'Claude Code · 代码助手',
      emoji: '💻',
      role: '① OpenClaw 自身维护（升级/排错/配置）② 投资研究纵深分析（敏感性/Monte Carlo）',
      skills: [
        'OpenClaw 升级 + 降级 + 排错',
        'main session 大小维护',
        'claude-code-39 / kimi-for-coding / deepseek-v4 多模型切换',
        'DCF 蒙特卡洛 10000 次模拟',
        '行业回测 + 风险情景设计'
      ],
      case: '2026-05-08 帮助 OpenClaw 切换 Kimi / Deepseek V4 Pro；启源芯 WACC 敏感性 ±2%。',
      path: '~/.claude/settings.json'
    },
    hermes: {
      name: 'Hermes · 编码自学习',
      emoji: '⚙️',
      role: '① 复杂代码实现 ② Wiki 看门狗与自我学习 ③ 多个子系统维护',
      skills: [
        'Wiki 后端维护（kg_viz_3d.py / watchdogs）',
        'wiki-watchdog.sh 自动监控',
        'Python 复杂编码（HTML / SVG）',
        '自学习：自动归档、自动清理',
        '从 OpenClaw 迁移（hermes claw）'
      ],
      case: '2026-06-29：Hermes 启动 wiki-watchdog.sh 重整 data 28 个脚本，L1/L2/L3 三层归档。',
      path: '~/.hermes/scripts/wiki-watchdog.sh'
    },
    wiki: {
      name: 'Wiki · 知识中台',
      emoji: '📚',
      role: '5786 实体、向量检索、知识图谱可视化',
      skills: [
        'kg_entity_relation 实体关系图谱',
        'kg_viz / kg_viz_v4 多代可视化',
        'bge-m3-mlx-fp16 向量化',
        'Qdrant 8 个 collection 索引',
        'localhost:19000 / 19001 双端口服务'
      ],
      case: '5786 实体、7 大主题、跨项目知识互联 — 投研团队的"长期记忆"。',
      path: '~/wiki/ · Wiki API: localhost:19001'
    }
  },

  // 演讲者备注
  speakerNotes: [
    '【开场】封面：让全场感受视觉震撼。先 30 秒静默，让听众看图。',
    '【开场破题】直接抛出：今天不讲概念，讲我们的 5+2+1。',
    '【智能体革命】讲到 2024 年起 Agent 转向 Reason+Action，主动问现场同事是否用过。',
    '【main 调度】演示一次真实指令：主公扔条飞书，看 main 怎么调度。',
    '【project】强调：project 不是"做项目"，是"调度项目中的多代理"。',
    '【research V3】必须强调"V3.33 升级"——并行流让效率翻倍。',
    '【data 清洗】念数字：100 份研报 / 2 小时 / 5786 实体，全场震撼。',
    '【report】展示一份"1 小时出稿"的真实投决文档。',
    '【三智能体生态】⭐ 重点章：讲 5 个真实故事，让同事看到"系统是会自己活的"。',
    '【实战案例】重点讲启源芯：5 个 Agent 90 分钟从立项到投决。',
    '【纵横分析法】⭐ 重点章：讲"纵"（敏感性）+ "横"（7 维度），强调 Claude Code。',
    '【现场演示】6 屏协同作战。这是压轴环节，建议提前录像预案。',
    '【Q&A】准备好 5 个犀利问题，让 AI 现身说法。'
  ]
};
