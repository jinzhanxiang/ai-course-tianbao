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
      layout: '7star',
      cards: [
        { icon: '🧠', name: 'main', tag: '总调度', detail: '指挥中枢。解析任务、判断分发、跟踪进度、汇总反馈。所有子 Agent 的汇报先到 main,再统一回主公。', color: '#00D4FF', pos: 0 },
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
      subtitle: '5 Agent 协同作战 · 2 助手延伸能力 · 1 中台沉淀资产',
      layout: 'threecol',
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
      subtitle: '5 Agent + 2 助手 + 1 中台 + 1 知识体系',
      layout: 'grid',
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
      layout: 'pentagon',
      cards: [
        { icon: '🏭', name: '飞马国际', tag: '并购尽调', detail: '3 周尽调 → 5 Agent 并行 4 天完成。\n原 200 页报告 → AI 自动生成 + 人工复核。\n效率 ↑ 4 倍,错误率 ↓ 70%。', color: '#00D4FF', pos: 0 },
        { icon: '📑', name: '渤化集团', tag: '行业研究', detail: '化工子行业 12 个赛道扫描。\n传统 2 周 → AI 4 小时生成初稿。\n覆盖度 ↑ 3 倍。', color: '#22C55E', pos: 1 },
        { icon: '🏗️', name: '天保基建', tag: '立项请示', detail: '10 个立项申请同步推进。\n公文规范 100% 符合。\n排版时间 ↓ 90%。', color: '#A855F7', pos: 2 },
        { icon: '📊', name: '泰达实业', tag: '估值建模', detail: 'DCF + 可比 + 敏感性。\n模型搭建 1 天(传统 1 周)。\n可重复使用。', color: '#F59E0B', pos: 3 },
        { icon: '💼', name: '津联控股', tag: '投资协议', detail: 'TS 条款设计 + 风险清单。\nAI 提示历史 23 个类似案例。\n谈判效率 ↑ 2 倍。', color: '#EC4899', pos: 4 }
      ]
    },

    // 09 案例 - 5 案例详情(按主公v3.0:点击正文"启源芯项目"弹出对应详情)
    'burst-case-qiyuanxin': {
      title: '启源芯项目 · 90 分钟投决全流程',
      subtitle: '功率半导体 · SiC 衬底 · 投决阶段',
      layout: 'pipe',
      cards: [
        { icon: '🧠', name: 'main 接收', tag: '0 分钟', detail: '主公周五晚下令:"启源芯投决"。\nmain 立即拆 4 子任务(project/research/data/report)', color: '#00D4FF', pos: 0 },
        { icon: '📋', name: 'project 排期', tag: '2 分钟', detail: '建立项目台账 · 设定 5 节点(研究/尽调/估值/决策/会后)\n输出:项目计划表 + 倒计时看板', color: '#22C55E', pos: 1 },
        { icon: '🔬', name: 'research 出报告', tag: '35 分钟', detail: '行业分析 + 财务尽调 + 估值建模三路并行。\nDCF=WACC 7.5% → 估值 45 亿(区间 35-58)\n可比公司:北方华创/华润微/士兰微', color: '#F59E0B', pos: 2 },
        { icon: '🗃️', name: 'data 入库', tag: '60 分钟', detail: '历史尽调材料清洗 + 7 个案例匹配 + bge-m3 向量化。\n入库:Qdrant 8 collections · 23,000 vectors 新增', color: '#A855F7', pos: 3 },
        { icon: '📄', name: 'report 出版', tag: '90 分钟', detail: '投决请示 67 页(Word)+ PPT 28 页 + PDF 存档。\n国企公文规范 100% · 错误 0 · 自动目录 · 页眉页脚', color: '#EC4899', pos: 4 }
      ]
    },
    'burst-case-xingheng': {
      title: '星恒电源 · 12 小时尽调启动',
      subtitle: '固态锂电池 · 尽调阶段',
      layout: 'pipe',
      cards: [
        { icon: '🏭', name: '行业扫描', tag: '0-2h', detail: 'research:固态锂电池赛道扫描。\n国内外 23 家企业 + 3 大技术路径(氧化物/聚合物/卤化物)', color: '#00D4FF', pos: 0 },
        { icon: '📊', name: '财务尽调', tag: '2-6h', detail: 'data:审计报告 + 财报 + 银行流水 · 21 张表格 OCR。\nresearch:营收增速 + 毛利率 + 营运资金分析', color: '#F59E0B', pos: 1 },
        { icon: '⚖️', name: '估值初步', tag: '6-10h', detail: 'DCF 建模 + 3 家可比公司 + 敏感性 4 场景。\n初次估值区间:180-250 亿', color: '#A855F7', pos: 2 },
        { icon: '📄', name: '报告', tag: '10-12h', detail: '尽调报告 200 页(含财务/法律/业务三路尽调)。\n风险清单 17 项 + 建议下一步访谈名单', color: '#EC4899', pos: 3 }
      ]
    },
    'burst-case-jingneng': {
      title: '晶能项目 · 1 年跟踪 + 立项启动',
      subtitle: 'LED 芯片 · 储备项目 → 立项',
      layout: 'pipe',
      cards: [
        { icon: '📡', name: '跟踪期', tag: '1 年', detail: '每月跟踪公司动态 · 行业政策 · 竞品动作。\ndata:每次公告入库 + Wiki 记录 365 条', color: '#00D4FF', pos: 0 },
        { icon: '🎯', name: '立项启动', tag: 'T0', detail: '主公判断时机成熟 → 下令启动立项。\nmain:拆解 5 子任务 · 召集 5 Agent', color: '#22C55E', pos: 1 },
        { icon: '📋', name: '项目立项', tag: '3 天', detail: 'project:立项申请单 · 投资逻辑 · 风险初判。\nresearch:赛道二次扫描 · 财务初筛', color: '#F59E0B', pos: 2 },
        { icon: '📄', name: '立项决议', tag: '7 天', detail: '立项决议书 + 5 Agent 协同产出。\n进入正式尽调阶段', color: '#EC4899', pos: 3 }
      ]
    },
    'burst-case-yingke': {
      title: '盈科系项目 · GP→LP 架构优化',
      subtitle: '原 GP 管理人 → 调整为 LP 投资人',
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
      layout: 'pipe',
      cards: [
        { icon: '🌱', name: '行业概览', tag: 'D0', detail: '绿色循环产业 + 政策导向 + 市场容量。\nAI:3 小时出行业简报(传统 3 周)', color: '#00D4FF', pos: 0 },
        { icon: '💰', name: '财务测算', tag: 'D+3', detail: '5000 万投资 · 预期 IRR 12-15% · 回收期 5 年。\n敏感性:项目周期 ±20%', color: '#F59E0B', pos: 1 },
        { icon: '⚠️', name: '风险清单', tag: 'D+5', detail: '7 大类风险 + 对应缓释措施。\nAI 提示历史 12 个类似项目', color: '#A855F7', pos: 2 },
        { icon: '📄', name: '可研报告', tag: 'D+10', detail: '项目可研报告 50 页 + 投决请示 + PPT。\n等待主公决策', color: '#EC4899', pos: 3 }
      ]
    },

    // 10 方法 - 纵横 8 维(原 trigger 已展示"2 主线 + 6 子维",扩写)
    'burst-method-8': {
      title: '纵横分析法 · 8 维',
      subtitle: '横切面 + 纵深线 + 6 子维交叉验证',
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
      title: '6 屏协同 · 90 分钟投决全流程',
      subtitle: 'main 调度 4 子 Agent · 实时同步进度',
      layout: 'pipe',
      cards: [
        { icon: '🎯', name: '屏 1 main 总调度', tag: '00:00', detail: '主公:"今晚投决启源芯"。\nmain 解析 → 拆 5 子任务 → 分发 4 Agent。', color: '#00D4FF', pos: 0 },
        { icon: '🕐', name: '屏 2 指令下达', tag: '00:02', detail: '4 Agent 接到任务 → 启动。\n显示启源芯项目背景 + 授权范围。', color: '#8FA1CC', pos: 1 },
        { icon: '🔬', name: '屏 3 research 三路', tag: '00:05-30', detail: '行业研究 + 财务建模 + 估值 · 三路并行。\n输出:DCF 45 亿 · 可比 35-58 区间。', color: '#F59E0B', pos: 2 },
        { icon: '🗃️', name: '屏 4 data 清洗', tag: '20:00-50:00', detail: '100 份材料 → OCR/转录 → 实体抽取 → Qdrant。\n入库 23,000 vectors · 186 实体。', color: '#A855F7', pos: 3 },
        { icon: '📋', name: '屏 5 project 台账', tag: '持续', detail: '项目台账实时更新 · 节点倒计时 · 风险灯。\n主公随时看进度。', color: '#22C55E', pos: 4 },
        { icon: '📄', name: '屏 6 report 出版', tag: '90:00', detail: '投决请示 67 页(Word)+ PPT 28 页 + PDF。\n国企公文规范 100% 符合。', color: '#EC4899', pos: 5 }
      ]
    },

    // ===== 主公 v3.0 反馈新增:关键词直接点击 =====
    // 03 main 调度 - 5 大动作
    'burst-main': {
      title: 'main · 总调度 5 大动作',
      subtitle: '接收 · 拆解 · 分派 · 跟踪 · 反馈 · 闭环',
      layout: 'pipe',
      cards: [
        { icon: '📥', name: '1. 接收', tag: '意图解析', detail: '主公发送指令 → main 解析意图。\n识别三类：提问 / 分派 / 命令。', color: '#00D4FF', pos: 0 },
        { icon: '🔪', name: '2. 拆解', tag: '5 要素', detail: '任务拆解 · 包含背景/目标/交付物/回传要求/预期完成时间。', color: '#22C55E', pos: 1 },
        { icon: '📡', name: '3. 分派', tag: 'sessions_send', detail: '调用 sessions_send 工具 · 发送到对应 Agent 队列。\n主公不直接指挥 Agent。', color: '#F59E0B', pos: 2 },
        { icon: '📊', name: '4. 跟踪', tag: '心跳 15 分钟', detail: '心跳机制每 15 分钟巡检 · 检查 task-tracker.json。\n超时 30 分钟追问 · 超时 2 小时告警主公。', color: '#A855F7', pos: 3 },
        { icon: '📋', name: '5. 反馈', tag: '10 分钟内', detail: '任务完成后 10 分钟内反馈主公 · 超时 30 分钟追究。\n闭环报告含原始交付物 + 结果摘要 + 后续建议。', color: '#EC4899', pos: 4 }
      ]
    },

    // 01 开场 - 5 大 Agent 拆解（点正文“5 大 Agent”直接弹出）
    'burst-5agents': {
      title: '5 大 Agent · 角色矩阵',
      subtitle: '从单兵作战到 5 Agent 流水线协同',
      layout: '5star',
      cards: [
        { icon: '🧠', name: 'main', tag: '总调度', detail: '指挥中枢。接收指令、拆任务、分派子 Agent、跟踪进度、汇总反馈。所有子 Agent 汇报先到 main,再统一回主公。', color: '#00D4FF', pos: 'top' },
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
      layout: 'threecol',
      cards: [
        { icon: '🗄️', name: 'PostgreSQL', tag: '关系数据', detail: '4 张表(entity / report / indicator / knowledge_logic),存实体关系与指标。\n\n规模:6,098 实体 · 5,786 报告 · 20,599 指标 · 6,577 知识逻辑。', color: '#F59E0B', pos: 'left' },
        { icon: '🔢', name: 'Qdrant', tag: '向量检索', detail: '8 collections · 75,988 个 768 维向量,bge-m3 embedding。语义检索 + 相似度匹配。\n\n场景:研报检索、案例匹配、相似项目发现。', color: '#A855F7', pos: 'center' },
        { icon: '📚', name: 'Wiki', tag: '知识沉淀', detail: 'Hermes 静态站 · port 19000 浏览器浏览 · port 19001 RESTful API。\n\n场景:人 + Agent 都能用。今天的经验明天新人也能调。', color: '#22C55E', pos: 'right' }
      ]
    },

    // 12 Q&A - 6 预判问答(原 trigger 已展示"6 大问答",扩写每个的回答)
    'burst-qa-6': {
      title: '6 大预判问答',
      subtitle: '团队最关心的 6 个问题 + 我们的回答',
      layout: 'grid',
      cards: [
        { icon: '🎯', name: 'Q1 准确率', tag: 'AI 写的研报能信吗?', detail: 'AI 出初稿 + 人工复核。准确率 95%+,比新人第一稿高。\n关键:人工 review 仍是最后一道关。', color: '#00D4FF', pos: 0 },
        { icon: '🔒', name: 'Q2 数据安全', tag: '敏感项目会不会泄露?', detail: '本地化部署 + 隔离中台 + 审计日志。\n符合国资监管要求。', color: '#22C55E', pos: 1 },
        { icon: '📚', name: 'Q3 学习曲线', tag: '老人 vs 新人谁先用?', detail: '都能用。新人获益更大(无需 3 年积累就能调用 3 年经验)。\n老人是"指挥 AI"而非"被 AI 指挥"。', color: '#F59E0B', pos: 2 },
        { icon: '💰', name: 'Q4 成本', tag: '一年要花多少钱?', detail: '硬件一次性 + 模型 API 按量。\n年化 < 一个初级员工工资。\n投入产出比 1:10+。', color: '#A855F7', pos: 3 },
        { icon: '⏰', name: 'Q5 时间冲突', tag: '业务忙没时间用?', detail: '先从"5 分钟任务"切入:周报整理、纪要排版、信息检索。\n无需专门时间,融入日常工作。', color: '#EC4899', pos: 4 },
        { icon: '🚀', name: 'Q6 推广', tag: '其他部门怎么用?', detail: '本周六内训 → 下周部门试点 → 月底跨部门共享。\n先做出"看得见的成果"再推广。', color: '#00D4FF', pos: 5 }
      ]
    }
  };

  // ============== 2. 排版算法 ==============
  function getLayoutCoords(layout, count, cards) {
    const coords = [];
    switch (layout) {
      case 'threecol':
        // 三栏
        coords.push({ left: '8%', top: '50%' });
        if (count >= 2) coords.push({ left: '50%', top: '50%' });
        if (count >= 3) coords.push({ left: '92%', top: '50%' });
        for (let i = 3; i < count; i++) coords.push({ left: '50%', top: `${15 + i*18}%` });
        break;
      case 'vert':
        // 纵向(适配卡片高度 ~240px,stage 高度 ~800px)
        // count 张卡均匀分布在 10%~90% 范围内
        const vertStep = count === 1 ? 0 : 80 / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          coords.push({ left: '50%', top: `${10 + i * vertStep}%` });
        }
        break;
      case 'pipe':
        // 横向流水线 - 防止左右溢出
        // 根据 count 决定间距范围:多卡则压缩间距
        const pipeMargin = count <= 3 ? 10 : (count <= 5 ? 8 : 6);
        const pipeRange = 100 - 2 * pipeMargin;
        const pipeStep = count === 1 ? 0 : pipeRange / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          // 中心点 left% 不能超过 95 (防止卡片右溢出)
          const left = Math.min(95, pipeMargin + i * pipeStep);
          coords.push({ left: `${left}%`, top: '50%' });
        }
        break;
      case 'twocol':
        // 两列(左右并排)
        for (let i = 0; i < count; i++) {
          coords.push({ left: count === 1 ? '50%' : `${15 + i * 70}%`, top: '50%' });
        }
        break;
      case '5star':
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
      case '7star':
      case 'pentagon':
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
      case 'grid':
        // 网格(自适应)
        const cols = count <= 2 ? count : Math.ceil(Math.sqrt(count));
        for (let i = 0; i < count; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          coords.push({
            left: `${10 + c * (80 / Math.max(1, cols-1))}%`,
            top: `${15 + r * (70 / Math.max(1, Math.ceil(count/cols) - 1))}%`
          });
        }
        break;
      case 'cascade':
        // 垂直瀑布 - 奇偶列分别计算纵向位置
        // i=0 左, i=1 右, i=2 左, i=3 右...
        // 按列分别计算,但 push 按索引顺序保留
        const casLeft = []; const casRight = [];
        for (let i = 0; i < count; i++) {
          if (i % 2 === 0) casLeft.push(i); else casRight.push(i);
        }
        const casTotalLeft = casLeft.length;
        const casTotalRight = casRight.length;
        // 按 index 顺序构建位置表
        const casCoords = new Array(count);
        casLeft.forEach((cardIdx, colIdx) => {
          const t = casTotalLeft === 1 ? 50 : 10 + colIdx * (80 / Math.max(1, casTotalLeft - 1));
          casCoords[cardIdx] = { left: '18%', top: `${t}%` };
        });
        casRight.forEach((cardIdx, colIdx) => {
          const t = casTotalRight === 1 ? 50 : 10 + colIdx * (80 / Math.max(1, casTotalRight - 1));
          casCoords[cardIdx] = { left: '82%', top: `${t}%` };
        });
        casCoords.forEach(c => coords.push(c));
        break;
      case 'fan':
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
      case 'flow':
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
    if (!stage) return;

    currentBurstId = burstId;
    currentTrigger = triggerEl;

    // 标题区
    stage.innerHTML = `
      <div class="burst-header">
        <div class="burst-title">${data.title}</div>
        <div class="burst-subtitle">${data.subtitle}</div>
      </div>
      <button class="burst-close" type="button">✕ 关闭</button>
    `;

    // 卡片
    const coords = getLayoutCoords(data.layout, data.cards.length, data.cards);
    const cardContainer = document.createElement('div');
    cardContainer.className = 'burst-cards';

    data.cards.forEach((card, idx) => {
      const div = document.createElement('div');
      div.className = 'burst-card';
      div.style.setProperty('--bc-color', card.color);
      const coord = coords[idx] || { left: '50%', top: '50%' };
      if (coord.center) div.classList.add('bc-center');
      div.style.left = coord.left;
      div.style.top = coord.top;
      div.setAttribute('data-i', idx);
      // pipe 布局 + 5+ 张卡 -> 缩小宽度防重叠
      if (data.layout === 'pipe' && data.cards.length >= 5) {
        div.style.width = '180px';
      } else if (data.layout === 'cascade' && data.cards.length >= 5) {
        div.style.width = '200px';
      } else if (data.layout === 'grid' && data.cards.length >= 6) {
        div.style.width = '210px';
      }

      // 标题 + 标签 + 详情
      const detailHtml = (card.detail || '').replace(/\n/g, '<br>');
      div.innerHTML = `
        <span class="bc-icon">${card.icon}</span>
        <div class="bc-name" style="color:${card.color}">${card.name}</div>
        <div class="bc-tag">${card.tag}</div>
        <div class="bc-detail">${detailHtml}</div>
      `;

      // stagger 延迟出现
      div.style.animationDelay = `${idx * 100 + 200}ms`;
      cardContainer.appendChild(div);
    });
    stage.appendChild(cardContainer);

    // 显示
    requestAnimationFrame(() => {
      stage.classList.add('show');
    });

    // 绑定关闭
    stage.querySelector('.burst-close').addEventListener('click', closeBurst);
  }

  function closeBurst() {
    if (!currentBurstId) return;
    const stage = document.getElementById(currentBurstId);
    if (stage) {
      stage.classList.remove('show');
      setTimeout(() => {
        if (stage && !stage.classList.contains('show')) {
          stage.innerHTML = '';
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