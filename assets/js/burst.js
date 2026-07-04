/* ============================================== */
/* BURST v2.0  - 放大扩写模式                       */
/* 13 种智能排版 · stagger 逐个展开 · 点空白关闭       */
/* ============================================== */

(function() {
  'use strict';

  // ============== 1. 扩写内容数据 ==============
  // 每个 burst 是 trigger 的"放大扩写",不是简单重复
  // 数据格式:{ cards: [{title, detail}], layout: 'smart' | 'circle' | 'triangle' | 'grid' | ... }
  const BURST_DATA = {
    // 00 封面 - 7 大智能体(原 trigger 已展示"7 大智能体协同",扩写每个的内涵)
    'burst-7agents': {
      title: '7 大智能体 · 角色矩阵',
      subtitle: '从单兵作战到 5 Agent + 2 助手 + 1 中台协同',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🤖 9 智能体实战战例（晶能光电）',
      layout: '7star',
      cards: [
        { icon: '🧠', name: 'main', tag: '总调度', detail: '指挥中枢。解析任务、判断分发、跟踪进度、汇总反馈。所有子 Agent 的汇报先到 main,再统一回您。', color: '#00D4FF', pos: 0 },
        { icon: '📋', name: 'project', tag: '项目管家', detail: '流程驱动器。维护项目时间线、催办节点、协调多 Agent 协作、产出会议纪要与立项文档。', color: '#22C55E', pos: 1 },
        { icon: '🔬', name: 'research', tag: '研究分析', detail: '智能大脑。行业研究 / 财务尽调 / 估值建模(DCF/IRR/NPV),产出投资分析报告。', color: '#F59E0B', pos: 2 },
        { icon: '🗃️', name: 'data', tag: '数据管道', detail: '材料清洗工。语音转录(FunASR)/ OCR 识别 / 研报清洗入库,输入到 Qdrant 向量库。', color: '#A855F7', pos: 3 },
        { icon: '📄', name: 'report', tag: '文档排版', detail: '出版人。Word / PDF / PPT 排版、会议纪要、可研报告格式化,输出正式交付物。', color: '#EC4899', pos: 4 },
        { icon: '🛠️', name: 'Claude Code', tag: '工程助手', detail: '代码与脚本。能改 prompt / 写脚本 / 调试配置 / 自动化运维,工程师的延伸。', color: '#00D4FF', pos: 5 },
        { icon: '🏛️', name: 'Hermes', tag: '知识中台', detail: '记忆库。Wiki 沉淀 / 检索 / 归档 / 跨会话知识调用,公司级 brain。', color: '#A855F7', pos: 6 }
      ]
    },

    // 01 开场 - 5+2+1 体系(原 trigger 已展示 5 Agent+2 助手+1 中台,扩写每类)
    'burst-5plus2plus1': {
      title: '5 + 2 + 1 体系架构',
      subtitle: '9 屏真实操作 · 5 Agent 协同作战 · 2 助手延伸能力 · 1 中台沉淀 · 1 主公决策',
      layout: 'threecol',
      videoPoster: '../assets/videos/posters/04-neural-network.png',
      video: '../assets/videos/9-agent-multiscreen.mp4',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '📄 实战案例：晶能光电商业尽调报告（公网 · 真实交付）',
      cards: [
        { icon: '⚙️', name: '5 大 Agent', tag: '生产单元', detail: 'main + project + research + data + report 五位一体。从"接需求 → 调研 → 分析 → 清洗 → 出报告"全自动流水线,原本 4 小时活压缩到 4 分钟。', color: '#00D4FF', pos: 'left' },
        { icon: '🧰', name: '2 大助手', tag: '能力延伸', detail: 'Claude Code(改代码/写脚本/调试) + Hermes(知识检索/归档)。助手不直接产出,但让 5 Agent 的边界扩 10 倍。', color: '#22C55E', pos: 'center' },
        { icon: '🏛️', name: '1 套中台', tag: '资产沉淀', detail: 'Qdrant 向量库(语义检索)+ PostgreSQL(结构化数据)+ Wiki(知识沉淀)。今天的经验,明天新人也能用。', color: '#A855F7', pos: 'right' }
      ]
    },

    // 02 革命 - 三层变革(原 trigger 已展示"三层",扩写每层内涵)
    'burst-revolution': {
      title: '三层变革',
      subtitle: '生产关系 + 协同方式 + 知识资产',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '⚡ 三层变革实战案例',
      layout: 'vert',
      cards: [
        { icon: '⚡', name: '生产关系革命', tag: '从人到 Agent', detail: '从"研究员手敲 4 小时"到"5 Agent 跑 4 分钟"。人从执行者变成决策者,Agent 从工具变成同事。10× 提效不是口号,是每天的实际工作节奏。', color: '#00D4FF', pos: 'top' },
        { icon: '🧠', name: '协同方式革命', tag: '单兵 → 多 Agent', detail: 'main 调度 4 子 Agent(project/research/data/report),每个子 Agent 又有自己的子任务。3 层嵌套协同,类似公司组织架构。', color: '#A855F7', pos: 'middle' },
        { icon: '🏛️', name: '知识资产革命', tag: '个人 → 公司', detail: '过去经验存在人脑里(离职即流失)。现在沉淀在 Qdrant + PG + Wiki,新人入职第一天就能调用过去 3 年所有研报。', color: '#F59E0B', pos: 'bottom' }
      ]
    },

    // 04 项目 - 7 阶段(原 trigger 已展示"7 阶段",扩写每阶段核心动作)
    'burst-project-7': {
      title: '项目生命周期 · 7 阶段',
      subtitle: '从立项到投后,每阶段的关键产出物',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '📋 7 阶段项目实战',
      layout: 'pipe',
      cards: [
        { icon: '1️⃣', name: '立项', tag: '需求识别', detail: '业务部门提需求 → 投资部初筛 → 内部立项会。\n产出:立项申请单 + 初步投资逻辑', color: '#22C55E', pos: 0 },
        { icon: '2️⃣', name: '调研', tag: '宏观+行业', detail: '行业研究、政策分析、宏观窗口判断、竞品扫描。\n产出:行业研究简报 50 页', color: '#22C55E', pos: 1 },
        { icon: '3️⃣', name: '尽调', tag: '三路并行', detail: '财务尽调 + 法律尽调 + 业务尽调 三线并行。\n产出:尽调报告 200 页 + 风险清单', color: '#22C55E', pos: 2 },
        { icon: '4️⃣', name: '估值', tag: '建模谈判', detail: 'DCF 模型 + 可比公司 + 敏感性分析 + 情景模拟。\n产出:估值模型 + 投资建议书', color: '#22C55E', pos: 3 },
        { icon: '5️⃣', name: '谈判', tag: '交易结构', detail: '估值博弈、对赌条款设计、股权比例、董事会席位。\n产出:TS 条款书 + 谈判纪要', color: '#22C55E', pos: 4 },
        { icon: '6️⃣', name: '交割', tag: '合规过户', detail: '股权过户、工商变更、资金安排、监管报批。\n产出:交割确认函 + 工商执照', color: '#22C55E', pos: 5 },
        { icon: '7️⃣', name: '投后', tag: '跟踪退出', detail: '季度经营跟踪、风险预警、增值服务、退出准备。\n产出:投后管理月报 + 退出方案', color: '#22C55E', pos: 6 }
      ]
    },

    // 05 研究 - 7 维度(原 trigger 已展示"7 维度",扩写每维度核心问题)
    'burst-research-7': {
      title: '研究分析 · 7 维度',
      subtitle: '宏观 → 行业 → 模式 → 财务 → 估值 → 风险 → 结论',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🔬 7 维度研究实战',
      layout: '7star',
      cards: [
        { icon: '🌐', name: '宏观环境', tag: 'PEST', detail: '政策窗口 + 经济周期 + 社会趋势 + 技术变革。判断现在是不是入场好时机。\n核心问题:现在是顺风还是逆风?', color: '#F59E0B', pos: 0 },
        { icon: '🏭', name: '行业格局', tag: '波特五力', detail: '集中度 + 竞争结构 + 上下游议价 + 替代品威胁。判断这个赛道值不值得进。\n核心问题:行业是红海还是蓝海?', color: '#F59E0B', pos: 1 },
        { icon: '💼', name: '商业模式', tag: '护城河', detail: '盈利逻辑 + 现金流结构 + 客户黏性 + 复制壁垒。判断这个生意能不能持续赚钱。\n核心问题:凭什么能赚钱?', color: '#F59E0B', pos: 2 },
        { icon: '📊', name: '财务分析', tag: '三表勾稽', detail: '利润表(盈利质量)+ 资产负债表(偿债能力)+ 现金流量表(造血能力)。判断数字背后是否真实。\n核心问题:账面利润是真金白银吗?', color: '#F59E0B', pos: 3 },
        { icon: '⚖️', name: '估值建模', tag: 'DCF + 可比', detail: 'DCF 折现 + 可比公司 + 敏感性分析 + 情景模拟。判断价格是否合理。\n核心问题:多少钱买才划算?', color: '#F59E0B', pos: 4 },
        { icon: '⚠️', name: '风险识别', tag: '四类风险', detail: '政策风险 + 市场风险 + 经营风险 + 合规风险。判断可能踩的坑。\n核心问题:最坏情况是什么?', color: '#F59E0B', pos: 5 },
        { icon: '🎯', name: '投资建议', tag: '退出路径', detail: '评级(强烈推荐/推荐/中性/回避)+ 目标价 + 退出路径(IPO/并购/回购)。\n核心问题:现在该出手吗?', color: '#F59E0B', pos: 6 }
      ]
    },

    // 06 数据 - 7 步清洗(原 trigger 已展示"7 步清洗",扩写每步技术细节)
    'burst-data-7': {
      title: '数据清洗 · 7 步流水线',
      subtitle: '从原始材料到结构化入库',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🗃️ 7 步数据清洗实战',
      videoPoster: '../assets/videos/posters/03-data-cleaning.png',
      video: '../assets/videos/03-data-pipeline.mp4',
      layout: 'grid',
      cards: [
        { icon: '📥', name: '1. 采集', tag: '多源输入', detail: 'PDF 研报 / Word 纪要 / 录音 / Excel 财务表 / 网页快照。统一进入 inputs/ 目录。', color: '#A855F7', pos: 0 },
        { icon: '🎙️', name: '2. 转录', tag: '语音→文字', detail: 'FunASR 模型处理录音(会议录音 / 调研访谈)。输出带时间戳的 SRT 文本。', color: '#A855F7', pos: 1 },
        { icon: '👁️', name: '3. OCR', tag: '图片→文字', detail: '扫描版 PDF / 财务截图 / 表格图片。PaddleOCR 识别 + 版面分析。', color: '#A855F7', pos: 2 },
        { icon: '🧹', name: '4. 清洗', tag: '去噪·分块', detail: '去广告 / 去重复 / 修格式错误 / 智能分块(按章节/按段落/按实体)。', color: '#A855F7', pos: 3 },
        { icon: '🧬', name: '5. 实体抽取', tag: 'NER + 关系', detail: '人名/公司/金额/日期/指标 自动抽取。实体关系三元组入库到 PostgreSQL。', color: '#A855F7', pos: 4 },
        { icon: '📐', name: '6. 向量化', tag: 'BGE-M3', detail: '文本分块 → BGE-M3 embedding → 写入 Qdrant 向量库(语义检索)。', color: '#A855F7', pos: 5 },
        { icon: '✅', name: '7. 质检', tag: '入库校验', detail: '随机抽检 5% → 人工复核 → 准确率 ≥ 95% 才算合格 → 标记 done 进入 outputs/。', color: '#A855F7', pos: 6 }
      ]
    },

    // 07 排版 - 3 大管线(原 trigger 已展示"3 管线",扩写每管线的输出)
    'burst-report-3': {
      title: '报告排版 · 3 大管线',
      subtitle: 'Word / PDF / PPT 三端输出',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '📄 3 大管线实战报告',
      layout: 'threecol',
      cards: [
        { icon: '📝', name: 'Word 管线', tag: '公文级', detail: '可研报告 / 立项请示 / 投资协议。\n模板:国企公文规范(方正小标宋 + 仿宋)+ 自动目录 + 页眉页脚 + 章节编号。', color: '#00D4FF', pos: 'left' },
        { icon: '📕', name: 'PDF 管线', tag: '正式版', detail: '最终交付物 / 上会材料 / 存档。\n模板:封面页 + 签字页 + 正文 + 附录。加密 + 不可编辑。', color: '#22C55E', pos: 'center' },
        { icon: '📊', name: 'PPT 管线', tag: '汇报版', detail: '立项汇报 / 投决会 / 季度复盘。\n模板:天保 VI 色系 + 数据图表 + 时间线 + 关键结论高亮。', color: '#A855F7', pos: 'right' }
      ]
    },

    // 08 生态 - 5+2+1+1(原 trigger 已展示"5+2+1+1 生态",扩写)
    'burst-ecosystem': {
      title: '5+2+1+1 生态全景',
      subtitle: '5 Agent + 2 助手 + 1 中台 + 1 知识体系 · 点击下方按钮看实战结果',
      layout: 'grid',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '📄 实战案例视频 — 神经网终柔面（晶能光电报告实例）',
      cards: [
        { icon: '⚙️', name: '5 Agent', tag: '生产', detail: 'main/project/research/data/report', color: '#00D4FF', pos: 0 },
        { icon: '🧰', name: '2 助手', tag: '延伸', detail: 'Claude Code/Hermes', color: '#22C55E', pos: 1 },
        { icon: '🏛️', name: '1 中台', tag: '存储', detail: 'Qdrant+PG+Wiki', color: '#A855F7', pos: 2 },
        { icon: '📚', name: '1 知识体系', tag: '沉淀', detail: '方法论+案例库', color: '#F59E0B', pos: 3 }
      ]
    },

    // 09 案例 - 5 案例(原 trigger 已展示"5 实战案例",扩写每个的成效)
    'burst-case-5': {
      title: '5 个实战案例 · 成效数据',
      subtitle: '从被动响应到主动产出的真实转型',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🎯 5 个实战案例总览',
      layout: 'pentagon',
      cards: [
        { icon: '🏭', name: '飞马国际', tag: '并购尽调', detail: '3 周尽调 → 5 Agent 并行 4 天完成。\n原 200 页报告 → AI 自动生成 + 人工复核。\n效率 ↑ 4 倍,错误率 ↓ 70%。', color: '#00D4FF', pos: 0 },
        { icon: '📑', name: '渤化集团', tag: '行业研究', detail: '化工子行业 12 个赛道扫描。\n传统 2 周 → AI 4 小时生成初稿。\n覆盖度 ↑ 3 倍。', color: '#22C55E', pos: 1 },
        { icon: '🏗️', name: '天保基建', tag: '立项请示', detail: '10 个立项申请同步推进。\n公文规范 100% 符合。\n排版时间 ↓ 90%。', color: '#A855F7', pos: 2 },
        { icon: '📊', name: '泰达实业', tag: '估值建模', detail: 'DCF + 可比 + 敏感性。\n模型搭建 1 天(传统 1 周)。\n可重复使用。', color: '#F59E0B', pos: 3 },
        { icon: '💼', name: '津联控股', tag: '投资协议', detail: 'TS 条款设计 + 风险清单。\nAI 提示历史 23 个类似案例。\n谈判效率 ↑ 2 倍。', color: '#EC4899', pos: 4 }
      ]
    },

    // 09 案例 - 5 案例详情(按您v3.0:点击正文"启源芯项目"弹出对应详情)
    'burst-case-qiyuanxin': {
      title: '⚠️ 已废弃 · 参见 burst-case-xingheng-13',
      subtitle: '本 burst 已重定向至星恒电源 13.73% 收购案例',
            resultLink: 'https://jinzhanxiang.github.io/xingheng-report/',
      resultLabel: '🔋 星恒电源 · 12 小时尽调实战报告（GitHub Pages）',
      layout: 'pipe',
      cards: [
        { icon: '🔋', name: '案例已更换', tag: '📢', detail: '原启源芯案例（与 SiC 衬底/功率半导体混淆）已被主公识别为错误。\n请参见：星恒电源 13.73% 收购方案 B 商业尽调复核。', color: '#EF4444', pos: 0 },
        { icon: '✅', name: '现行案例', tag: '星恒电源', detail: '动力电池 · 尽调复核阶段\n基准 MOIC 0.32 (亏 68%)\n50 家股东 · 启源纳川 17.73%', color: '#22C55E', pos: 1 },
        { icon: '📚', name: 'Wiki 词条', tag: '+98 实体', detail: '原案例其他实体仍保留在 Wiki 词条中（实体数：5786 → 5884）。\n新项目信息不再上报该词条。', color: '#38bdf8', pos: 2 },
        { icon: '💡', name: '教训', tag: '2026-07-03', detail: '“启源芯动力”(电池) ≠ "功率半导体/SiC 衬底"，主公跳正为二者区分。\n未来案例选择必须验证业务方向一致性。', color: '#F59E0B', pos: 3 },
        { icon: '📄', name: '补充文档', tag: '待补', detail: '· 14-demo.html 中的“启源纳川”是股东名（保留）\n· burst-case-xingheng-13 是星恒详情 burst', color: '#A855F7', pos: 4 }
      ]
    },
    'burst-case-xingheng': {
      title: '星恒电源 · 12 小时尽调 · 多屏协同实战',
      subtitle: '6 屏真实操作 · 立项→行业→财务→估值→报告→交付 · 12 小时 vs 传统 2-3 天',
      videoPoster: '../assets/videos/posters/06-before-after.png',
      video: '../assets/videos/xingheng-multiscreen.mp4',
      resultLink: 'https://jinzhanxiang.github.io/xingheng-report/',
      resultLabel: '📊 星恒电源尽调报告（GitHub Pages · 公开交付）',
      layout: 'pipe',
      cards: [
        { icon: '🏭', name: '行业扫描', tag: '0-2h', detail: 'research:固态锂电池赛道扫描。\n国内外 23 家企业 + 3 大技术路径(氧化物/聚合物/卤化物)', color: '#00D4FF', pos: 0 },
        { icon: '📊', name: '财务尽调', tag: '2-6h', detail: 'data:审计报告 + 财报 + 银行流水 · 21 张表格 OCR。\nresearch:营收增速 + 毛利率 + 营运资金分析', color: '#F59E0B', pos: 1 },
        { icon: '⚖️', name: '估值初步', tag: '6-10h', detail: 'DCF 建模 + 3 家可比公司 + 敏感性 4 场景。\n初次估值区间:180-250 亿', color: '#A855F7', pos: 2 },
        { icon: '📄', name: '报告', tag: '10-12h', detail: '尽调报告 200 页(含财务/法律/业务三路尽调)。\n风险清单 17 项 + 建议下一步访谈名单', color: '#EC4899', pos: 3 }
      ]
    },
    'burst-case-xingheng-13': {
      title: '星恒电源 · 13.73% 收购方案 B 尽调复核',
      subtitle: '动力电池 · 尽调复核阶段 · 6 屏协同 90 分钟',
            resultLink: 'https://jinzhanxiang.github.io/xingheng-report/',
      resultLabel: '🔋 星恒电源 · 13.73% 尽调复核实战报告（GitHub Pages）',
      layout: 'pipe',
      cards: [
        { icon: '🔋', name: '股权扫描', tag: '0min', detail: 'data:50 家股东名册 OCR + 分类入库。\n启源纳川 17.73% · 实控人方志刚 · 业务伙伴另外', color: '#00D4FF', pos: 0 },
        { icon: '📊', name: '财务复核', tag: '0-30min', detail: 'research+data:23 份底稿审计。\n营收YoY 18% · 净利率 12% · 现金流/净利 0.95', color: '#F59E0B', pos: 1 },
        { icon: '⚖️', name: '估值拆解', tag: '30-60min', detail: 'Claude Code 纵深：PE 4x / 8x / 12x 3 场景。\nPS / PB / DCF 三路径交叉验对。\n基准 MOIC = 0.32 (亏 68%)', color: '#A855F7', pos: 2 },
        { icon: '📋', name: '风险矩阵', tag: '60-80min', detail: 'project:7+5 项风险矩阵。\n🔴 无控制权 / 灰 IPO 失败 / 灰 战略协同无制度保障', color: '#22C55E', pos: 3 },
        { icon: '📄', name: '尽调意见排版', tag: '80-90min', detail: 'report:尽调意见 35 页 Word + 19 页 PPT + Wiki 同步。\n退出路径：港股 IPO 8.05(c) / 并购两条路', color: '#EC4899', pos: 4 }
      ]
    },
    'burst-case-jingneng': {
      title: '晶能光电 · V3426 颜色内容双重修复 · 多屏协同实战',
      subtitle: '6 屏真实操作 · OCR→抽取→颜色→复核→报告→交付 · 12 小时 vs 传统 3 天',
      videoPoster: '../assets/videos/posters/02-qiyuan-semiconductor.png',
      video: '../assets/videos/jingneng-multiscreen.mp4',
      layout: 'pipe',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '📄 点击查看晶能光电商业尽调交付报告（公网 · 实时）',
      cards: [
        { icon: '📡', name: '跟踪期', tag: '1 年', detail: '每月跟踪公司动态 · 行业政策 · 竞品动作。\ndata:每次公告入库 + Wiki 记录 365 条', color: '#00D4FF', pos: 0 },
        { icon: '🎯', name: '立项启动', tag: 'T0', detail: '您判断时机成熟 → 下令启动立项。\nmain:拆解 5 子任务 · 召集 5 Agent', color: '#22C55E', pos: 1 },
        { icon: '📋', name: '项目立项', tag: '3 天', detail: 'project:立项申请单 · 投资逻辑 · 风险初判。\nresearch:赛道二次扫描 · 财务初筛', color: '#F59E0B', pos: 2 },
        { icon: '📄', name: '立项决议', tag: '7 天', detail: '立项决议书 + 5 Agent 协同产出。\n进入正式尽调阶段。\n🔗 点击下方按钮看完整商业尽调报告', color: '#EC4899', pos: 3 }
      ]
    },
    'burst-case-yingke': {
      title: '盈科系项目 · GP→LP 架构优化',
      subtitle: '原 GP 管理人 → 调整为 LP 投资人',
            resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '📊 实战案例视频 — 股权架构图（晶能光电实例）',
      layout: 'pipe',
      cards: [
        { icon: '⚖️', name: '监管分析', tag: 'D0', detail: '研究资管新规 + 私募基金监管条例变化。\n识别对 GP 管理人模式的冲击', color: '#00D4FF', pos: 0 },
        { icon: '📊', name: '架构评估', tag: 'D+5', detail: '现有 LP/GP 架构利弊分析。\n对比 5 种备选架构 · 评估转换成本', color: '#22C55E', pos: 1 },
        { icon: '💼', name: '协议设计', tag: 'D+15', detail: 'GP 退出协议 + LP 进入协议。\n保留决策权 + 隔离风险 + 退出机制', color: '#A855F7', pos: 2 },
        { icon: '📄', name: '决议落地', tag: 'D+30', detail: '董事会决议 + 工商变更 + 中基协备案。\n全流程报告 35 页', color: '#EC4899', pos: 3 }
      ]
    },
    'burst-case-zhongzihuan': {
      title: '中资环项目 · 5000 万绿色循环',
      subtitle: '待立项决策',
            resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '♻️ 实战案例视频 — 循环经济链路（晶能光电实例）',
      layout: 'pipe',
      cards: [
        { icon: '🌱', name: '行业概览', tag: 'D0', detail: '绿色循环产业 + 政策导向 + 市场容量。\nAI:3 小时出行业简报(传统 3 周)', color: '#00D4FF', pos: 0 },
        { icon: '💰', name: '财务测算', tag: 'D+3', detail: '5000 万投资 · 预期 IRR 12-15% · 回收期 5 年。\n敏感性:项目周期 ±20%', color: '#F59E0B', pos: 1 },
        { icon: '⚠️', name: '风险清单', tag: 'D+5', detail: '7 大类风险 + 对应缓释措施。\nAI 提示历史 12 个类似项目', color: '#A855F7', pos: 2 },
        { icon: '📄', name: '可研报告', tag: 'D+10', detail: '项目可研报告 50 页 + 投决请示 + PPT。\n等待您决策', color: '#EC4899', pos: 3 }
      ]
    },

    // 10 方法 - 纵横 8 维(原 trigger 已展示"2 主线 + 6 子维",扩写)
    'burst-method-8': {
      title: '纵横分析法 · 8 维',
      subtitle: '横切面 + 纵深线 + 6 子维交叉验证',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🧮 8 维分析法实战',
      layout: 'grid',
      cards: [
        { icon: '↔️', name: '横线', tag: '横向比较', detail: '同期可比公司 / 同期类似项目 / 同期行业平均。\n问题:相对位置在哪?', color: '#A855F7', pos: 0 },
        { icon: '↕️', name: '纵线', tag: '历史趋势', detail: '过去 3-5 年财务 / 业务 / 估值变化。\n问题:成长性如何?', color: '#A855F7', pos: 1 },
        { icon: '🏭', name: '行业', tag: '子维 1', detail: '行业地位 + 竞品优劣势', color: '#22C55E', pos: 2 },
        { icon: '💰', name: '财务', tag: '子维 2', detail: '三表勾稽 + 盈利质量', color: '#22C55E', pos: 3 },
        { icon: '📈', name: '估值', tag: '子维 3', detail: 'DCF + 可比 + 敏感性', color: '#22C55E', pos: 4 },
        { icon: '⚠️', name: '风险', tag: '子维 4', detail: '政策/市场/经营/合规', color: '#22C55E', pos: 5 },
        { icon: '🎯', name: '团队', tag: '子维 5', detail: '管理层 + 关键人 + 激励机制', color: '#22C55E', pos: 6 },
        { icon: '🚪', name: '退出', tag: '子维 6', detail: 'IPO/并购/回购路径', color: '#22C55E', pos: 7 }
      ]
    },

    // 11 演示 - 6 屏协同(原 trigger 已展示"6 屏协同",扩写每屏内容)
    'burst-demo-5': {
      title: '6 屏协同 · 90 分钟尽调复核全流程',
      subtitle: 'main 调度 4 子 Agent · 实时同步进度',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '⚙️ 6 屏协同 90 分钟实战',
      layout: 'pipe',
      cards: [
        { icon: '🎯', name: '屏 1 main 总调度', tag: '00:00', detail: '您:"今晚出星恒电源尽调复核"。\nmain 解析 → 拆 5 子任务 → 分发 4 Agent。', color: '#00D4FF', pos: 0 },
        { icon: '🕐', name: '屏 2 指令下达', tag: '00:02', detail: '4 Agent 接到任务 → 启动。\n显示星恒电源 13.73% 收购背景 + 授权范围。', color: '#8FA1CC', pos: 1 },
        { icon: '🔬', name: '屏 3 research 三路', tag: '00:05-30', detail: '行业扫描 + 财务建模 + 估值 · 三路并行。\n输出:DCF 基准 MOIC 0.32 · PE 4.3-12x 区间。', color: '#F59E0B', pos: 2 },
        { icon: '🗃️', name: '屏 4 data 清洗', tag: '20:00-50:00', detail: '23 份底稿 → OCR/转录 → 实体抽取 → Qdrant。\n入库 5884 实体 · +98 新增。', color: '#A855F7', pos: 3 },
        { icon: '📋', name: '屏 5 project 台账', tag: '持续', detail: '项目台账实时更新 · 节点倒计时 · 风险灯。\n您随时看进度。', color: '#22C55E', pos: 4 },
        { icon: '📄', name: '屏 6 report 出版', tag: '90:00', detail: '尽调意见 35 页(Word)+ PPT 19 页 + PDF。\n国企公文规范 100% 符合。', color: '#EC4899', pos: 5 }
      ]
    },

    // ===== 您 v3.0 反馈新增:关键词直接点击 =====
    // 03 main 调度 - 5 大动作
    'burst-main': {
      title: 'main · 总调度 5 大动作',
      subtitle: '6 屏实时仪表盘 · 心跳/任务/Session/Docker/Agent/告警 · 真实运行数据',
      videoPoster: '../assets/videos/posters/01-main-command-center.png',
      video: '../assets/videos/main-multiscreen.mp4',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🧠 main 实战指挥',
      layout: 'pipe',
      cards: [
        { icon: '📥', name: '1. 接收', tag: '意图解析', detail: '您发送指令 → main 解析意图。\n识别三类：提问 / 分派 / 命令。', color: '#00D4FF', pos: 0 },
        { icon: '🔪', name: '2. 拆解', tag: '5 要素', detail: '任务拆解 · 包含背景/目标/交付物/回传要求/预期完成时间。', color: '#22C55E', pos: 1 },
        { icon: '📡', name: '3. 分派', tag: 'sessions_send', detail: '调用 sessions_send 工具 · 发送到对应 Agent 队列。\n您不直接指挥 Agent。', color: '#F59E0B', pos: 2 },
        { icon: '📊', name: '4. 跟踪', tag: '心跳 15 分钟', detail: '心跳机制每 15 分钟巡检 · 检查 task-tracker.json。\n超时 30 分钟追问 · 超时 2 小时告警您。', color: '#A855F7', pos: 3 },
        { icon: '📋', name: '5. 反馈', tag: '10 分钟内', detail: '任务完成后 10 分钟内反馈您 · 超时 30 分钟追究。\n闭环报告含原始交付物 + 结果摘要 + 后续建议。', color: '#EC4899', pos: 4 }
      ]
    },

    // 01 开场 - 5 大 Agent 拆解（点正文“5 大 Agent”直接弹出）
    'burst-5agents': {
      title: '5 大 Agent · 角色矩阵',
      subtitle: '从单兵作战到 5 Agent 流水线协同',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🤖 5 大 Agent 实战矩阵',
      layout: '5star',
      cards: [
        { icon: '🧠', name: 'main', tag: '总调度', detail: '指挥中枢。接收指令、拆任务、分派子 Agent、跟踪进度、汇总反馈。所有子 Agent 汇报先到 main,再统一回您。', color: '#00D4FF', pos: 'top' },
        { icon: '📋', name: 'project', tag: '项目管家', detail: '流程驱动器。维护项目时间线、催办节点、协调多 Agent 协作、产出立项文档与会议纪要。', color: '#22C55E', pos: 'left' },
        { icon: '🔬', name: 'research', tag: '研究分析', detail: '智能大脑。行业研究 / 财务尽调 / 估值建模(DCF/IRR/NPV),产出投资分析报告。', color: '#F59E0B', pos: 'bottom-left' },
        { icon: '🗃️', name: 'data', tag: '数据管道', detail: '材料清洗工。语音转录(FunASR)/ OCR / 研报清洗入库,输入到 Qdrant 向量库。', color: '#A855F7', pos: 'bottom-right' },
        { icon: '📄', name: 'report', tag: '文档排版', detail: '出版人。Word / PDF / PPT 排版、会议纪要、可研报告格式化,输出正式交付物。', color: '#EC4899', pos: 'right' }
      ]
    },

    // 01 开场 - 2 大助手拆解(点正文"2 大助手"直接弹出)
    'burst-2helpers': {
      title: '2 大助手 · 能力延伸',
      subtitle: 'Claude Code + Hermes · 助手不直接产出但让 5 Agent 边界扩 10 倍',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '⌨️ 2 大助手实战延伸',
      layout: 'twocol',
      cards: [
        { icon: '🛠️', name: 'Claude Code', tag: '工程助手', detail: '写代码 / 改 prompt / 跑脚本 / 调配置。能改项目、改论文、改报告中的工程细节,工程师的延伸。\n\n真实用途:WACC 敏感性脚本、Monte Carlo 模拟、可研报告模板自动生成。', color: '#00D4FF', pos: 'left' },
        { icon: '🏛️', name: 'Hermes', tag: '知识中台', detail: '知识沉淀 / 检索 / 归档 / 跨会话调用。公司级 brain,让 5 Agent 共享同一份记忆。\n\n真实数据:6,098 实体 · 8 collections · 75,988 vectors · bge-m3 embedding。', color: '#A855F7', pos: 'right' }
      ]
    },

    // 01 开场 - 1 套知识中台拆解(点正文"1 套知识中台"直接弹出)
    'burst-1platform': {
      title: '1 套知识中台 · 三层架构',
      subtitle: '关系数据 + 向量检索 + 静态 Wiki · 所有智能体的记忆层',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🏛️ 1 套中台实战架构',
      layout: 'threecol',
      cards: [
        { icon: '🗄️', name: 'PostgreSQL', tag: '关系数据', detail: '4 张表(entity / report / indicator / knowledge_logic),存实体关系与指标。\n\n规模:6,098 实体 · 5,786 报告 · 20,599 指标 · 6,577 知识逻辑。', color: '#F59E0B', pos: 'left' },
        { icon: '🔢', name: 'Qdrant', tag: '向量检索', detail: '8 collections · 75,988 个 768 维向量,bge-m3 embedding。语义检索 + 相似度匹配。\n\n场景:研报检索、案例匹配、相似项目发现。', color: '#A855F7', pos: 'center' },
        { icon: '📚', name: 'Wiki', tag: '知识沉淀', detail: 'Hermes 静态站 · port 19000 浏览器浏览 · port 19001 RESTful API。\n\n场景:人 + Agent 都能用。今天的经验明天新人也能调。', color: '#22C55E', pos: 'right' }
      ]
    },

    // ====== 01 开场 - 人力岗视角（HR × AI）======
    'burst-hr-scenarios': {
      title: '人力岗 · AI 帮你干掉重复活',
      subtitle: 'JD · 简历 · 面试纪要 · 培训文档 · 薪酬报告 · 7 个场景全部干掉',
      resultLink: 'https://jinzhanxiang.github.io/xingheng-report/',
      resultLabel: '👥 人力岗 AI 实战',
      layout: 'grid',
      cards: [
        { icon: '📝', name: 'JD 撰写', tag: '岗位说明书', detail: '输入岗位+部门+职级。\nAI 输出:职责 / 资格 / 薪酬 / 路径。\n2 小时 → 5 分钟。', color: '#EC4899', pos: 'left' },
        { icon: '🔍', name: '简历筛选', tag: '智能匹配', detail: '100 份简历 → AI 评估匹配度。\n排出 Top 10。\n8 小时 → 50 分钟。', color: '#F59E0B', pos: 'center' },
        { icon: '🎙️', name: '面试纪要', tag: '语音转写+摘要', detail: '60 分钟录音 → AI 摘要。\n能力评分/风险/建议薪资。\n2 小时 → 3 分钟。', color: '#A855F7', pos: 'right' },
        { icon: '📚', name: '培训文档', tag: '知识库生成', detail: '历史项目 → 知识点抽取。\n一键生成 Word/PPT/考题。\n3 天 → 3 小时。', color: '#00D4FF', pos: 'left' },
        { icon: '📊', name: '薪酬报告', tag: '市场对比', detail: '输入岗位+城市+规模。\n生成 5 档报告(P10-P90)。\n1 周 → 30 分钟。', color: '#22C55E', pos: 'center' },
        { icon: '🤝', name: '绩效沟通', tag: '谈话脚本', detail: '输入姓名+评级。\nAI 生成沟通脚本+反问预判。\n临场发挥 → 按脚本走。', color: '#FF6B6B', pos: 'right' }
      ]
    },

    // ====== 01 开场 - IT/工程岗视角（Dev × AI）======
    'burst-it-scenarios': {
      title: 'IT/工程岗 · 你的 10× 程序员同事上线',
      subtitle: '结对编程 · 脚本生成 · Debug · 单元测试 · 部署脚本 · 工程能力全提 10 倍',
      resultLink: 'https://jinzhanxiang.github.io/xingheng-report/',
      resultLabel: '💻 IT 岗 AI 实战',
      layout: 'grid',
      cards: [
        { icon: '⚙️', name: 'Claude Code', tag: '结对编程', detail: '你负责设计/架构/决策。\n它负责:模板代码/文档/翻译。\n1 周 1 模块 → 1 天。', color: '#00D4FF', pos: 'left' },
        { icon: '🔧', name: '脚本生成', tag: 'WACC/Monte Carlo', detail: '告诉 AI 逻辑 → 生成代码。\nPython+测试用例。\n不用从 0 拼库函数。', color: '#A855F7', pos: 'center' },
        { icon: '🐛', name: 'Debug 助手', tag: '错误分析', detail: '报错日志 → Top 3 原因。\n验证步骤 + 修复方案。\n1 小时 → 2 分钟。', color: '#F59E0B', pos: 'right' },
        { icon: '🧪', name: '单元测试', tag: '自动覆盖', detail: '老代码补测试 = 最痛苦。\nAI 生成 30-50 用例。\n1 天 → 1 小时。', color: '#22C55E', pos: 'left' },
        { icon: '🚀', name: '部署脚本', tag: '一键发布', detail: 'Dockerfile + nginx 配置。\ndocker-compose + 自动化。\n运维一起做 → 一人完成。', color: '#EC4899', pos: 'center' },
        { icon: '📚', name: 'Hermes 中台', tag: '知识管理', detail: '文档/代码/部署 → 自动入库。\n新人第 1 天就能查。\n带 1 个月 → 1 天上手。', color: '#FF6B6B', pos: 'right' }
      ]
    },

    // ====== 01 开场 - 变革+团队的三层架构（您特别要求） ======
    'burst-revolution-team': {
      title: '变革 + 团队 · 三层架构',
      subtitle: '变革思考 × 数字员工 × 资产沉淀 — 一个都不能少',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '⚡ 变革+团队三层架构实战',
      layout: 'vert',
      cards: [
        { icon: '⚡', name: '第一层 · 生产关系变革', tag: '人从执行者 → 决策者', detail: '过去：研究员手敲 4 小时 → 现在：5 Agent 跑 4 分钟，人只做判断与决策。\n\n1 个项目人员可以同时跟 8 个项目，过去最多 2 个。\n\n本质：执行环节被 Agent 接管，人专注价值判断。', color: '#00D4FF', pos: 'top' },
        { icon: '🧠', name: '第二层 · 多 Agent 协同', tag: '5 Agent + 2 助手 + 1 中台', detail: 'main 调度 project / research / data / report 四个子 Agent，每个子 Agent 又有自己的子任务（3 层嵌套协同，类似公司组织架构）。\n\n加 2 个外部助手（claude-code / hermes）扩展能力边界。\n\n加 1 个知识中台（PG / Qdrant / Wiki）确保经验不流失。', color: '#A855F7', pos: 'middle' },
        { icon: '🏛️', name: '第三层 · 知识资产变革', tag: '个人记忆 → 公司资产', detail: '过去：经验在人脑里，离职即流失。\n现在：沉淀在 PG + Qdrant + Wiki 三层资产。\n\n新人入职第一天就能调用过去 3 年的所有研报、估值模型、行业判断。\n\n本质：把“个人能力”变成“组织能力”，这是公司层面最大的护城河。', color: '#F59E0B', pos: 'bottom' }
      ]
    },

    // 12 Q&A - 6 预判问答(原 trigger 已展示"6 大问答",扩写每个的回答)
    'burst-qa-6': {
      title: '6 大预判问答',
      subtitle: '团队最关心的 6 个问题 + 我们的回答',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '❓ 6 大预判问答实战',
      layout: 'grid',
      cards: [
        { icon: '🎯', name: 'Q1 准确率', tag: 'AI 写的研报能信吗?', detail: 'AI 出初稿 + 人工复核。准确率 95%+,比新人第一稿高。\n关键:人工 review 仍是最后一道关。', color: '#00D4FF', pos: 0 },
        { icon: '🔒', name: 'Q2 数据安全', tag: '敏感项目会不会泄露?', detail: '本地化部署 + 隔离中台 + 审计日志。\n符合国资监管要求。', color: '#22C55E', pos: 1 },
        { icon: '📚', name: 'Q3 学习曲线', tag: '老人 vs 新人谁先用?', detail: '都能用。新人获益更大(无需 3 年积累就能调用 3 年经验)。\n老人是"指挥 AI"而非"被 AI 指挥"。', color: '#F59E0B', pos: 2 },
        { icon: '💰', name: 'Q4 成本', tag: '一年要花多少钱?', detail: '硬件一次性 + 模型 API 按量。\n年化 < 一个初级员工工资。\n投入产出比 1:10+。', color: '#A855F7', pos: 3 },
        { icon: '⏰', name: 'Q5 时间冲突', tag: '业务忙没时间用?', detail: '先从"5 分钟任务"切入:周报整理、纪要排版、信息检索。\n无需专门时间,融入日常工作。', color: '#EC4899', pos: 4 },
        { icon: '🚀', name: 'Q6 推广', tag: '其他部门怎么用?', detail: '本周六内训 → 下周部门试点 → 月底跨部门共享。\n先做出"看得见的成果"再推广。', color: '#00D4FF', pos: 5 }
      ]
    },

    // ====== 方案 C: 4 个海报 Ken Burns 缩放动画 ======
    'burst-video-warroom': {
      title: '💹 投资作战室',
      subtitle: '7 维度 WS 并行 · 30 秒得到星恒电源估值区间',
      resultLink: 'https://jinzhanxiang.github.io/xingheng-report/',
      resultLabel: '💹 投资作战室模拟器',
      terminalSrc: '../assets/videos/war-room.html',
      layout: 'terminal'
    },
    'burst-video-beforeafter': {
      title: '✨ 研报清洗前后对比',
      subtitle: '80 页 PDF → 79 个实体 / 110 个指标 / 178 个逻辑链',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '✨ 研报清洗前后对比模拟器',
      terminalSrc: '../assets/videos/before-after.html',
      layout: 'terminal'
    },
    'burst-video-radar': {
      title: '🎯 8 维企业雷达图',
      subtitle: '财务·产业·估值·风险·治理·ESG·政策·团队',
      resultLink: 'https://jinzhanxiang.github.io/xingheng-report/',
      resultLabel: '🎯 8 维企业雷达图模拟器',
      terminalSrc: '../assets/videos/radar-8d.html',
      layout: 'terminal'
    },
    'burst-video-maindash': {
      title: '🧠 main 指挥中心',
      subtitle: 'sessions_send + task-tracker + 心跳日志 实时仪表盘',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🧠 main 指挥中心模拟器',
      terminalSrc: '../assets/videos/main-dash.html',
      layout: 'terminal'
    },

    // ====== 3 个 AI 生成视频 burst ======
    'burst-video-neural': {
      title: '🕸️ 7 节点神经网络',
      subtitle: 'main → project/research/data/report → 一同起势',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🕸️ 神经网络模拟器',
      terminalSrc: '../assets/videos/terminal-simulator.html',
      // video: '../assets/videos/04-neural-network.mp4',  // 暂不使用
      videoPoster: '../assets/videos/posters/04-neural-network.png',
      video: '../assets/videos/04-neural-network.mp4',
      layout: 'terminal'
    },
    'burst-video-qiyuan': {
      title: '⚠️ 已下线 · 参见 burst-video-xingheng',
      subtitle: '原启源芯·投决现场动画（6 屏日志）已下架，请参考星恒电源 14-demo',
      resultLink: 'https://jinzhanxiang.github.io/xingheng-report/',
      resultLabel: '🔋 星恒电源收购现场模拟器',
      terminalSrc: '../assets/videos/qiyuan-investment.html',
      layout: 'terminal'
    },
    'burst-video-pipeline': {
      title: '🌊 研报数据清洗流水线',
      subtitle: '5 阶段：OCR → 实体 → 指标 → 逻辑 → 向量入库',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🌊 数据流水线模拟器',
      terminalSrc: '../assets/videos/data-pipeline.html',
      layout: 'terminal'
    },

    // ========== Phase G 新增：02.5 章 5+2+1 体系总览 ==========
    'burst-arch-overview': {
      title: '🏛️ 5+2+1 体系 · 主公亲测全景图',
      subtitle: '9 模型协同层叠 · 5 Agent + 2 助手 + 1 中台 · 2026-07-03 主公实战',
      layout: 'grid',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🏛️ 实战案例视频 — 9 智能体协同（晶能光电实例）',
      cards: [
        // ===== 5 大 Agent =====
        { icon: '🧠', name: '1. main', tag: '总调度', detail: '接收指令 · 拆解任务 · 分派子代理 · 跟踪进度 · 汇总回主公。所有汇报先到 main，再统一回您。', color: '#00D4FF', pos: 0 },
        { icon: '📋', name: '2. project', tag: '项目管家', detail: '立项文档 · 节点跟踪 · 协调多代理 · 会议纪要。project 再聪明也不能跑数据，主公金句。', color: '#22C55E', pos: 1 },
        { icon: '🔬', name: '3. research', tag: '研究员', detail: '行业研究 · 财务尽调 · 估值建模。星恒电源尽调 90 分钟完成（传统 2-3 天）。', color: '#F59E0B', pos: 2 },
        { icon: '🗃️', name: '4. data', tag: '数据工', detail: '语音转录 · OCR · 清洗入库 · 不做分析。199 份研报 → 5894 实体可检索。', color: '#A855F7', pos: 3 },
        { icon: '📄', name: '5. report', tag: '报告专家', detail: 'Word · PDF · PPT 排版 · 不做内容。可研报告 / 公文 / 会议纪要一键排版。', color: '#EC4899', pos: 4 },
        // ===== 2 大助手 =====
        { icon: '⌨️', name: '6. Claude Code', tag: '代码执行', detail: '外部 · Anthropic 出品 · 接管代码任务。补全脚本、shell 命令、文件读写，Agent 调用工具的桥梁。', color: '#febc2e', pos: 5 },
        { icon: '🤖', name: '7. Hermes', tag: '自我学习', detail: '外部 · 28 脚本迭代 · V0.1→V3.38 · 知识结构化。学习主公工作流，沉淀为可复用工具链。', color: '#febc2e', pos: 6 },
        // ===== 1 套中台 =====
        { icon: '📚', name: '8. Wiki + oMLX', tag: '知识中台', detail: 'oMLX：本地 9 模型推理中台。Wiki：5786 实体 / 199 研报可检索。9 模型层叠=5+2+1+1中台。', color: '#38bdf8', pos: 7 }
      ]
    },

    // ========== Phase F 新增：11/12/13 章节封面 burst ==========
    'burst-quality-1': {
      title: '🛡️ 智能体质量提升 · 全章速览',
      subtitle: '三层防御 · 60% → 90%+ · 主公实战方法论',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🛡️ 智能体质量提升实战',
      layout: 'grid',
      cards: [
        { icon: '🎯', name: '1. 单 Agent 天花板', tag: '60-70%', detail: '认知偏差 + 知识盲区 + 单点脆弱。3 大根因导致单 Agent 质量上限。', color: '#EF4444', pos: 0 },
        { icon: '🛡️', name: '2. 三层防御全景', tag: '体系图', detail: 'L1 MoA 提智力 · L2 辩论防幻觉 · L3 交叉验对保可靠。', color: '#38bdf8', pos: 1 },
        { icon: '🧠', name: '3. L1 MoA 架构', tag: '65.8%', detail: 'Together AI ICLR 2025 · AlpacaEval 65.8% > GPT-4 57.5%。3 层分层聚合。', color: '#38bdf8', pos: 2 },
        { icon: '🧪', name: '4. 主公 5+2+1+1 落地', tag: '9 模型', detail: 'OpenClaw 5 Agent + Claude + Hermes + Wiki + 中台 = 9 模型协同层叠。', color: '#22C55E', pos: 3 },
        { icon: '⚖️', name: '5. L2 多 Agent 辩论', tag: '防幻觉', detail: 'MDPI 2025 · 幻觉率降低 40-60%。正反方 + 裁判三角。', color: '#F59E0B', pos: 4 },
        { icon: '🎭', name: '6. OpenClaw 辩论实现', tag: '实测', detail: 'main 调度 2 副本对立 · 第三方裁决 · 自动归档正反观点。', color: '#F59E0B', pos: 5 },
        { icon: '🔍', name: '7. L3 交叉验对', tag: '保可靠', detail: 'Self-Consistency + Critic 模式 + 多智能体校验。', color: '#22C55E', pos: 6 },
        { icon: '📊', name: '8. 主公实测数据', tag: '效果', detail: '5 个项目从 60-70% 提升到 85-92%。3 个月复测，幻觉率 < 5%。', color: '#22C55E', pos: 7 }
      ]
    },
    'burst-train-1': {
      title: '🛠️ 如何训练智能体 · 全章速览',
      subtitle: '训练 vs 编排 · Hermes 案例 · 自我进化',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🛠️ 智能体训练实战',
      layout: 'grid',
      cards: [
        { icon: '⚖️', name: '1. 训练 vs 编排', tag: '90/10', detail: '90% 任务用编排（工具+提示词）即可。10% 才需要微调。', color: '#A855F7', pos: 0 },
        { icon: '🧪', name: '2. 4 大训练框架', tag: '工具箱', detail: 'ReAct · Reflexion · AutoGPT · Tool-Use。各自适用场景。', color: '#A855F7', pos: 1 },
        { icon: '🛠️', name: '3. "我做智能体" 4 步', tag: '方法论', detail: '定职责 → 设模型 → 接工具 → 建回路。最简单的智能体也是这 4 步。', color: '#A855F7', pos: 2 },
        { icon: '⚙️', name: '4. Hermes 28 脚本', tag: '案例', detail: 'V0.1 → V3.38 · 28 版本 · 10 周迭代 · 5786 入库实体。', color: '#febc2e', pos: 3 },
        { icon: '📐', name: '5. 8 条编码规范', tag: '基线', detail: 'shellcheck + lint + 命名 + 注释 + 测试 + 容错 + 日志 + 文档。', color: '#febc2e', pos: 4 },
        { icon: '🔄', name: '6. 4 步反馈循环', tag: '自进化', detail: '执行 → 监控 → 偏差检测 → 自我修正。Hermes 的核心机制。', color: '#febc2e', pos: 5 },
        { icon: '🎯', name: '7. 训练 vs 编排决策树', tag: '选型', detail: '成本低 + 数据少 → 编排。数据丰富 + 性能要求高 → 微调。', color: '#A855F7', pos: 6 },
        { icon: '🌟', name: '8. 章节金句', tag: '收获', detail: '"你需要的不是调参，是流程"。"工具链的稳定性比模型大小更重要"。', color: '#EC4899', pos: 7 }
      ]
    },
    'burst-workflow-1': {
      title: '🌱 个人如何打造 Workflow · 全章速览',
      subtitle: '从零基础到团队队长 · 5 阶段升级路径',
      resultLink: 'https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html',
      resultLabel: '🌱 Workflow 打造实战',
      layout: 'grid',
      cards: [
        { icon: '🪜', name: '1. 5 阶段路径', tag: '升级图', detail: 'L1 零基础 → L2 用户 → L3 制作者 → L4 训练官 → L5 架构师。', color: '#22C55E', pos: 0 },
        { icon: '🛠️', name: '2. 5 工具栈对比', tag: '选型', detail: 'n8n / Dify / Langflow / Flowise / OpenClaw。能力/门槛/成本 4 维对比。', color: '#22C55E', pos: 1 },
        { icon: '🌿', name: '3. Dify 实战模板', tag: '3 套', detail: '行业研究 · 邮件助手 · 会议纪要。即装即用的 workflow 模板。', color: '#22C55E', pos: 2 },
        { icon: '✅', name: '4. 5 维度验收', tag: '质检', detail: '准确性 · 效率 · 稳定性 · 可审计 · 可复制。每维度有具体指标。', color: '#22C55E', pos: 3 },
        { icon: '📅', name: '5. 12 月里程碑', tag: '路线', detail: 'Q1 入门 → Q2 制作者 → Q3 训练官 → Q4 架构师。每个季度 3 个任务。', color: '#22C55E', pos: 4 },
        { icon: '⚠️', name: '6. 5 条踩坑教训', tag: '避坑', detail: '不求大求全 · 不重写轮子 · 不闭门造车 · 不忽略监控 · 不省略验收。', color: '#F59E0B', pos: 5 },
        { icon: '🎁', name: '7. 5 个示范 workflow', tag: '主公案例', detail: '并购研究 · 党委会材料 · 清洗入库 · 会议纪要 · 合规审查。', color: '#22C55E', pos: 6 },
        { icon: '🌟', name: '8. 章节金句', tag: '收获', detail: '"从用户到制作者，从工具到流程，从单兵到团队"。', color: '#EC4899', pos: 7 }
      ]
    }
  };

  // ============== 2. 排版算法 ==============
  function getLayoutCoords(layout, count, cards, opts) {
    const coords = [];
    // 卡片实际宽度(px)和 stage 宽度(px)，用于算 safe margin
    const cardW = (opts && opts.cardW) || 240;
    const cardH = (opts && opts.cardH) || 220;
    const stageW = (opts && opts.stageW) || 1382;  // 默认 1440 视口下 stage 宽
    const stageH = (opts && opts.stageH) || 800;
    // 卡片中心位置的安全边界 (% of stage)
    const safeMarginPct = (cardW / 2 / stageW) * 100;  // 第一张卡 left 必须 >= 此值
    const safeTopPct = (cardH / 2 / stageH) * 100;
    switch (layout) {
      case 'threecol': {
        // 三栏 - 首尾卡位置必须考虑卡片宽度，避免出视口
        const tc1 = Math.max(safeMarginPct + 2, 12);
        const tc3 = Math.min(100 - safeMarginPct - 2, 88);
        coords.push({ left: `${tc1}%`, top: '50%' });
        if (count >= 2) coords.push({ left: '50%', top: '50%' });
        if (count >= 3) coords.push({ left: `${tc3}%`, top: '50%' });
        for (let i = 3; i < count; i++) coords.push({ left: '50%', top: `${15 + i*18}%` });
        break;
      }
      case 'vert': {
        // 纵向 - 用像素位置定位, step 用所需间距（不超出 cardContainer）
        const vertCardH = Math.max(cardH, 280);
        const vertCardContainerH = (opts && opts.cardContainerH) || 600;
        const vertGap = 30;
        const vertStartY = (vertCardH / 2) + 20;
        const vertRequiredRange = (vertCardH + vertGap) * Math.max(1, count - 1);
        // step = max(必需间距) - 保证不重叠
        const vertStepPx = count === 1 ? 0 : vertRequiredRange / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          coords.push({ left: '50%', top: `${vertStartY + i * vertStepPx}px` });
        }
        break;
      }
      case 'pipe': {
        // 横向流水线 - 动态算 margin 防溢出
        // cardW/stageW → safeMarginPct；多卡则压缩间距
        const pipeMargin = count <= 3 ? Math.max(safeMarginPct + 1, 10)
                          : (count <= 5 ? Math.max(safeMarginPct + 1, 9)
                          : Math.max(safeMarginPct + 1, 8));
        const pipeRange = 100 - 2 * pipeMargin;
        const pipeStep = count === 1 ? 0 : pipeRange / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          // 中心点 left% 不能超过 100-safeMarginPct (防止卡片右溢出)
          const left = Math.min(100 - safeMarginPct, pipeMargin + i * pipeStep);
          coords.push({ left: `${left}%`, top: '50%' });
        }
        break;
      }
      case 'twocol': {
        // 两列(左右并排) - 防溢出
        for (let i = 0; i < count; i++) {
          if (count === 1) {
            coords.push({ left: '50%', top: '50%' });
          } else {
            // 两张卡分别靠近左右 safeMarginPct
            const tw1 = Math.max(safeMarginPct + 3, 15);
            const tw2 = Math.min(100 - safeMarginPct - 3, 85);
            coords.push({ left: i === 0 ? `${tw1}%` : `${tw2}%`, top: '50%' });
          }
        }
        break;
      }
      case '5star': {
        // 五芒星布局(中心 + 四围,按索引分配,不受 pos 字段影响)
        // 第 1 张居中,其余 4 张按四角分布
        if (cards && cards.length > 0) {
          // 位置 0 = 中心, 1-4 = 上/右/下/左
          const starRadius = 36; // 距离中心的半径(%)
          const center = { left: '50%', top: '50%', center: true };
          // 上(-90°), 右(0°), 下(90°), 左(180°)
          const offsets = [
            { angle: -90 }, // 顶
            { angle: 0 },   // 右
            { angle: 90 },  // 底
            { angle: 180 }  // 左
          ];
          cards.forEach((card, idx) => {
            if (idx === 0) {
              coords.push(center);
            } else {
              const off = offsets[(idx - 1) % 4];
              const left = 50 + starRadius * Math.cos(off.angle * Math.PI / 180);
              const top = 50 + starRadius * Math.sin(off.angle * Math.PI / 180);
              coords.push({ left: `${left}%`, top: `${top}%` });
            }
          });
        }
        break;
      }
      case '7star': {
        // 七芒星布局(中心 + 六围)
        // 第 1 张居中,其余 6 张等间距辐射
        // 半径自适应 - 7张卡时用 26% 避免溢出
        const starRadius = count <= 3 ? 32 : (count <= 5 ? 30 : 26);
        coords.push({ left: '50%', top: '50%', center: true });
        for (let i = 0; i < count - 1 && i < 6; i++) {
          const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
          const left = 50 + starRadius * Math.cos(angle);
          const top = 50 + starRadius * Math.sin(angle);
          coords.push({ left: `${left}%`, top: `${top}%` });
        }
        break;
      }
      case 'pentagon': {
        // 中心圆 + 周围辐射(中心 + count-1 周围)
        // 中心点
        coords.push({ left: '50%', top: '50%', center: true });
        // 半径自适应:卡片越多半径越大,避免重叠
        const radius = count <= 3 ? 32 : (count <= 5 ? 38 : 42);
        for (let i = 0; i < count - 1; i++) {
          const angle = (Math.PI * 2 * i / (count - 1)) - Math.PI / 2;
          const left = 50 + radius * Math.cos(angle);
          const top = 50 + radius * Math.sin(angle);
          coords.push({ left: `${left}%`, top: `${top}%` });
        }
        break;
      }
      case 'grid': {
        // CSS Grid 布局 - 上下两行卡片不重叠，映射到全屏幕布
        const cols = count <= 4 ? Math.min(count, 3) : 3;
        const rows = Math.ceil(count / cols);
        const stageW = (opts && opts.stageW) || window.innerWidth || 1440;
        const stageH = (opts && opts.stageH) || window.innerHeight || 900;
        const gridGap = 25;  // 间距
        const cardW = 260;
        const gridCardH = 250;  // 与实际渲染高度一致（实测 262，留 12 余量）—— 改名避外层 const cardH 冲突
        const gridW = cols * cardW + (cols - 1) * gridGap;
        const gridH = rows * gridCardH + (rows - 1) * gridGap;
        // 整体居中（header 160 + 底部 40 buffer）
        const totalBlockH = gridH + 200; // header + grid + padding
        const topPad = Math.max(120, (stageH - gridH - 200) / 2);
        const startX = (stageW - gridW) / 2 + cardW / 2;
        const startY = topPad + gridCardH / 2;
        for (let i = 0; i < count; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          coords.push({
            left: `${startX + c * (cardW + gridGap)}px`,
            top: `${startY + r * (gridCardH + gridGap)}px`
          });
        }
        break;
      }
      case 'cascade': {
        // 垂直瀑布 - 奇偶列分别计算纵向位置(像素), step 保证不重叠
        const casCardH = Math.max(cardH, 260);
        const casCardContainerH = (opts && opts.cardContainerH) || 600;
        const casGap = 30;
        const casStartY = (casCardH / 2) + 15;
        const casLeft = []; const casRight = [];
        for (let i = 0; i < count; i++) {
          if (i % 2 === 0) casLeft.push(i); else casRight.push(i);
        }
        const casTotalLeft = casLeft.length;
        const casTotalRight = casRight.length;
        const casRequiredL = (casCardH + casGap) * Math.max(1, casTotalLeft - 1);
        const casRequiredR = (casCardH + casGap) * Math.max(1, casTotalRight - 1);
        const casStepL = casTotalLeft <= 1 ? 0 : casRequiredL / Math.max(1, casTotalLeft - 1);
        const casStepR = casTotalRight <= 1 ? 0 : casRequiredR / Math.max(1, casTotalRight - 1);
        const casLeftX = (opts.cardW || 240) / 2 + 20;
        const casRightX = (opts.stageW || 1382) - casLeftX;
        const casCoordsArr = new Array(count);
        casLeft.forEach((cardIdx, colIdx) => {
          const y = casTotalLeft === 1 ? (casCardContainerH / 2) : (casStartY + colIdx * casStepL);
          casCoordsArr[cardIdx] = { left: `${casLeftX}px`, top: `${y}px` };
        });
        casRight.forEach((cardIdx, colIdx) => {
          const y = casTotalRight === 1 ? (casCardContainerH / 2) : (casStartY + colIdx * casStepR);
          casCoordsArr[cardIdx] = { left: `${casRightX}px`, top: `${y}px` };
        });
        casCoordsArr.forEach(c => coords.push(c));
        break;
      }
      case 'fan': {
        // 折扇(中心 + 两侧展开) - 增大半径防止重叠
        coords.push({ left: '50%', top: '50%', center: true });
        // 半径随 count 增大
        const fanRadius = count <= 4 ? 35 : (count <= 6 ? 40 : 44);
        for (let i = 0; i < count - 1; i++) {
          const t = i / Math.max(1, count - 2); // 0..1
          const angle = -60 + t * 120; // -60 ~ 60 度
          coords.push({
            left: `${50 + fanRadius * Math.cos(angle * Math.PI / 180)}%`,
            top: `${50 + fanRadius * Math.sin(angle * Math.PI / 180)}%`
          });
        }
        break;
      }
      case 'flow': {
        // 流程图
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          coords.push({
            left: `${20 + col * 30}%`,
            top: `${25 + row * 50}%`
          });
        }
        break;
      }
      default:
        // 默认:横向
        for (let i = 0; i < count; i++) {
          coords.push({ left: `${10 + i * (80 / Math.max(1, count-1))}%`, top: '50%' });
        }
    }
    return coords;
  }

  // ============== 3. 渲染逻辑 ==============
  let currentBurstId = null;
  let currentTrigger = null;

  function openBurst(burstId, triggerEl) {
    // 关掉已打开的
    if (currentBurstId) closeBurst();

    const data = BURST_DATA[burstId];
    if (!data) return;

    const stage = document.getElementById(burstId);
    if (!stage) {
      // 动态创建 stage 元素（适用于 video burst 等任意章节触发）
      const newStage = document.createElement('div');
      newStage.className = 'burst-stage';
      newStage.id = burstId;
      document.body.appendChild(newStage);
      // 递归调用，复用后续逻辑
      return openBurst(burstId, triggerEl);
    }

    currentBurstId = burstId;
    currentTrigger = triggerEl;

    // 标题区
    let resultBtnHtml = '';
    if (data.resultLink) {
      resultBtnHtml = `
        <a class="burst-result-link" href="${data.resultLink}" target="_blank" rel="noopener">
          ${data.resultLabel || '📄 点击查看最终交付物'}
          <span class="burst-result-arrow">→</span>
        </a>`;
    }

    stage.innerHTML = `
      <div class="burst-header">
        <div class="burst-title">${data.title}</div>
        <div class="burst-subtitle">${data.subtitle}</div>
        ${resultBtnHtml}
      </div>
      <button class="burst-close" type="button">✕ 关闭</button>
    `;

    // ====== 终端模拟器模式 ======
    if (data.terminalSrc) {
      // 用 fetch + inline 注入（避免 iframe 在某些环境下不渲染）
      const container = document.createElement('div');
      container.className = 'terminal-container';
      container.style.cssText = 'width:100%;min-height:520px;background:#0d1117;border-radius:10px;overflow:hidden;position:relative;';
      stage.appendChild(container);
      requestAnimationFrame(() => { stage.classList.add('show'); });

      // 加载失败回退到 iframe
      fetch(data.terminalSrc).then(function(r){
        return r.text();
      }).then(function(html){
        // 提取 <style> + <body> 内容
        const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (styleMatch) {
          const style = document.createElement('style');
          style.textContent = '[data-burst-inline="' + burstId + '"] ' + styleMatch[1];
          document.head.appendChild(style);
        }
        if (bodyMatch) {
          const wrap = document.createElement('div');
          wrap.setAttribute('data-burst-inline', burstId);
          wrap.style.cssText = 'width:100%;min-height:520px;';
          wrap.innerHTML = bodyMatch[1];
          container.appendChild(wrap);
          // 执行 HTML 内的 <script>
          const scripts = wrap.querySelectorAll('script');
          scripts.forEach(function(oldScript){
            const newScript = document.createElement('script');
            if (oldScript.src) newScript.src = oldScript.src;
            else newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
          });
        }
      }).catch(function(){
        // 回退到 iframe
        container.innerHTML = '<iframe src="' + data.terminalSrc + '" style="width:100%;height:520px;border:none;border-radius:10px;background:#0d1117;" title="' + (data.title || '') + '"></iframe>';
      });
      return;
    }

    // ====== 视频 burst 模式 ======
    if (data.videoPoster) {
      // 海报模式 (有 poster 但无 video) - Ken Burns 缩放动画
      if (!data.video) {
        const pc = document.createElement('div');
        pc.className = 'burst-poster-container';
        pc.innerHTML = `
          <img class="burst-poster" src="${data.videoPoster}"
            alt="${data.title}">`;
        stage.appendChild(pc);
        requestAnimationFrame(() => {
          stage.classList.add('show');
        });
        return;
      }
      // 视频模式 (poster + video 都存在) - 实际 mp4 播放
      const vc = document.createElement('div');
      vc.className = 'burst-video-container';
      vc.style.cssText = 'width:100%;max-width:900px;margin:8px auto 0;';
      vc.innerHTML = `
        <video class="burst-video" src="${data.video || ''}"
          poster="${data.videoPoster}"
          controls autoplay playsinline muted loop
          style="width:100%;height:auto;max-height:35vh;border-radius:12px;">
        </video>`;
      stage.appendChild(vc);
      // 视频播放完毕后不自动关闭（loop 模式）
      const vid = vc.querySelector('video');
      vid && vid.addEventListener('ended', () => { closeBurst(); });
      // 如果还有 cards，则不 return，继续渲染下方 cards
      if (!data.cards || data.cards.length === 0) {
        requestAnimationFrame(() => { stage.classList.add('show'); });
        return;
      }
      // video + cards 共存模式
      requestAnimationFrame(() => { stage.classList.add('show'); });
      // 不 return，继续走卡片渲染逻辑
    }

    // ====== 常规卡片 burst 模式 ======
    // 决定每张卡的实际宽度（与下方 set width 同步）
    let cardW = 300, cardH = 240;
    if (data.layout === 'pipe' && data.cards.length >= 5) cardW = 240;
    else if (data.layout === 'pipe' && data.cards.length >= 3) cardW = 270;
    else if (data.layout === 'cascade' && data.cards.length >= 5) cardW = 260;
    else if (data.layout === 'grid' && data.cards.length >= 6) cardW = 260;
    else if (data.layout === 'twocol') cardW = 320;
    else if (data.layout === 'vert') cardW = 340;
    else if (data.layout === 'threecol') cardW = 320;
    // stage 实际宽度 = min(96vw, 1400px)
    const stageW = Math.min(window.innerWidth * 0.96, 1400);
    const stageH = Math.min(window.innerHeight - 40, 800);
    // 根据 layout 动态计算 cardContainer 高度（限制在 viewport 内）
    const headerH = 130;  // burst-header 大致高度
    const stageMarginTop = 20;  // .burst-stage margin-top
    // 可用高度 = viewport - stageMarginTop - headerH - 20 (底部安全间距)
    const maxContainerH = Math.max(400, window.innerHeight - stageMarginTop - headerH - 20);
    const cardContainerH = (() => {
      let required = 600;
      // 使用与定位算法一致的 cardH 估算（多行 detail 实际更高）
      const realCardH = (data.layout === 'vert') ? Math.max(cardH, 280)
                      : (data.layout === 'grid') ? Math.max(cardH, 260)
                      : (data.layout === 'cascade') ? Math.max(cardH, 260)
                      : cardH;
      // 顶距 (gridStartY = cardH/2 + 15) + 底距 (cardH/2) = cardH + 15
      const topBottomPad = realCardH + 15;
      if (data.layout === 'vert') {
        required = data.cards.length * (realCardH + 30) + topBottomPad;
      } else if (data.layout === 'grid') {
        const cols = data.cards.length <= 2 ? data.cards.length : Math.ceil(Math.sqrt(data.cards.length));
        const rows = Math.ceil(data.cards.length / cols);
        required = rows * (realCardH + 30) + topBottomPad;
      } else if (data.layout === 'cascade') {
        const maxColCount = Math.ceil(data.cards.length / 2);
        required = maxColCount * (realCardH + 30) + topBottomPad;
      }
      // 不限制在 viewport - 让 stage scale 处理超界
      return Math.max(600, required);
    })();
    const coords = getLayoutCoords(data.layout, data.cards.length, data.cards, {
      cardW, cardH, stageW, stageH,
      cardContainerH  // 动态高度，供 vert/grid/cascade 使用
    });
    const cardContainer = document.createElement('div');
    cardContainer.className = 'burst-cards';
    // 标记 layout 类型，让 CSS Grid 自动布局接管（grid/threecol/twocol 三种）
    cardContainer.setAttribute('data-layout', data.layout || 'free');
    // cardContainer 不设置 minHeight，由 flex: 1 + max-height 自适应

    data.cards.forEach((card, idx) => {
      const div = document.createElement('div');
      div.className = 'burst-card';
      div.style.setProperty('--bc-color', card.color);
      // 2026-07-03 重构：所有布局都交给 CSS Grid 处理绝对统一，避免重叠/移动/溢出
      // 取消 useAutoLayout 变量 - 100% 走 CSS Grid
      div.setAttribute('data-i', idx);
      div.classList.add('bc-index-' + idx);
      div.classList.add('bc-layout-' + (data.layout || 'free'));
      // grid/twocol/threecol/pipe 不需要额外处理（CSS 默认 grid auto-fit）
      // 7star / pentagon / 5star / vert / cascade / fan 由 CSS grid-template-areas 接管
      // pipe 布局 + 5+ 张卡 -> 缩小宽度防重叠（现在交给 CSS grid auto-fit，不再需要）
      if (data.layout === 'cascade' && data.cards.length >= 5) {
        div.style.width = '260px';
      } else if (data.layout === 'vert') {
        div.style.width = '340px';
      }
      // grid/twocol/threecol/pipe 由 CSS grid auto-fit 决定，无需固定宽度

      // 标题 + 标签 + 详情
      const detailHtml = (card.detail || '').replace(/\n/g, '<br>');
      div.innerHTML = `
        <span class="bc-icon">${card.icon}</span>
        <div class="bc-name" style="color:${card.color}">${card.name}</div>
        <div class="bc-tag">${card.tag}</div>
        <div class="bc-detail">${detailHtml}</div>
      `;

      // 2026-07-03 主公要求：删除悬浮偏离动画效果，stagger 仅保留 50ms 微延迟
      div.style.animationDelay = `${idx * 50}ms`;
      cardContainer.appendChild(div);
    });
    stage.appendChild(cardContainer);

    // 动态计算 stage scale：stage 已改为 100vh 全屏，不再需要整体 scale
    // 保留逻辑以备未来需要，但当前默认不缩放
    const stageRect = stage.getBoundingClientRect();
    const contentH = 130 + cardContainerH;
    const maxVisibleH = window.innerHeight - 40;
    // stage 已是 viewport 全高，scale 只在极端多卡时使用
    if (contentH > maxVisibleH + 200) {  // 加 200px buffer
      const scale = Math.max(0.6, maxVisibleH / contentH);
      stage.style.setProperty('--burst-stage-scale', scale);
      stage.classList.add('scaled');
    } else {
      stage.style.removeProperty('--burst-stage-scale');
      stage.classList.remove('scaled');
    }

    // 显示后调整 scale以适应 viewport,避免卡片被裁切
    requestAnimationFrame(() => {
      stage.classList.add('show');
      // 实际渲染后计算 scale
      requestAnimationFrame(() => {
        // 用 scrollHeight 可获取被 max-height 裁掉的真实内容高度
        const header = stage.querySelector('.burst-header');
        const headerH = header ? header.offsetHeight : 130;
        // cc.scrollHeight 是 cc 内部所有内容的真高（不被 max-height 限制）
        const actualContentH = headerH + cardContainer.scrollHeight;
        const vh = window.innerHeight;
        // content 超出 viewport 时缩放（最少 0.6 避免看不清）
        if (actualContentH > vh - 80) {
          const scale = Math.max(0.6, (vh - 100) / actualContentH);
          stage.style.setProperty('--burst-stage-scale', scale);
          stage.classList.add('scaled');
        } else {
          stage.style.removeProperty('--burst-stage-scale');
          stage.classList.remove('scaled');
        }
      });
    });

    // 绑定关闭
    stage.querySelector('.burst-close').addEventListener('click', closeBurst);
  }

  function closeBurst() {
    if (!currentBurstId) return;
    const stage = document.getElementById(currentBurstId);
    if (stage) {
      stage.classList.remove('show');
      const savedId = currentBurstId;
      setTimeout(() => {
        const s = document.getElementById(savedId);
        if (s && !s.classList.contains('show')) {
          s.innerHTML = '';
        }
      }, 400);
    }
    currentBurstId = null;
    currentTrigger = null;
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
        openBurst(burstId, this);
      });
    });
  }

  // ============== 5. 全局关闭 ==============
  document.addEventListener('click', (e) => {
    if (!currentBurstId) return;
    const stage = document.getElementById(currentBurstId);
    if (!stage) return;
    // 点击在 burst-card、burst-close、burst-header 内部不关闭
    if (e.target.closest('.burst-card, .burst-close, .burst-header')) return;
    // 点击在 trigger 内不关闭
    if (currentTrigger && currentTrigger.contains(e.target)) return;
    // 其他情况(包括点击 stage 背景、stage::before)都关闭
    closeBurst();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentBurstId) {
      closeBurst();
    }
  });

  // ============== 6. 初始化 ==============
  document.addEventListener('DOMContentLoaded', bindBurstTriggers);

  window.bindBurstTriggers = bindBurstTriggers;
  window.openBurst = openBurst;
  window.closeBurst = closeBurst;
})();