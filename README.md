# 🤖 智能体赋能投资研究 — 天保内训课件

> **主公亲述 · 5 Agent + 2 助手 + 1 中台 · 真实在跑 · 全程可演示**
> 课件版本 v1.0 · 2026.07

---

## 📌 一句话定位

天保控股投资部内部培训课件，全程脱稿讲解 + 实时演示 5 大 Agent + 2 大助手 + 1 套知识中台如何协同完成投研任务。

---

## 🚀 快速开始

### 方法 1：本地双击打开

```bash
# 进入项目目录
cd ~/Documents/OpenClaw-Workspace-projects/智能体内训课件/

# 双击 index.html，即可用浏览器打开
open index.html
```

### 方法 2：本地 HTTP 服务器（✅ 推荐）

```bash
# 启动 Node.js 服务器（端口 19002）
cd ~/Documents/OpenClaw-Workspace-projects/智能体内训课件/
python3 -m http.server 19002 &

# 访问
open http://localhost:19002/index.html
```

### 方法 3：局域网共享（同事在同 WiFi 看）

```bash
# 启动并绑定到 0.0.0.0
cd ~/Documents/OpenClaw-Workspace-projects/智能体内训课件/
python3 -m http.server 19002 --bind 0.0.0.0 &

# 主公本机 IP（同事访问用）
ifconfig | grep "inet " | grep -v 127.0.0.1

# 同事在浏览器打开
# http://<主公本机IP>:19002/index.html
# 例如：http://192.168.1.100:19002/index.html
```

### 方法 4：离线打包（出差 / 没网场景）

```bash
# 用 singlefile / httrack 打包整个文件夹成 zip
cd ~/Documents/OpenClaw-Workspace-projects/
tar czf 智能体内训课件-v1.0.tar.gz 智能体内训课件/

# U盘 / AirDrop / 邮件 / 微信送同事
```

---

## 🧭 课件导航

| 章节 | 路径 | 时长 | 核心内容 |
|------|------|------|---------|
| **00** | [00-cover.html](chapters/00-cover.html) | 1 min | 封面 - 7 智能体总览 |
| **01** | [01-opening.html](chapters/01-opening.html) | 2 min | 开场破题 - 5+2+1 |
| **02** | [02-revolution.html](chapters/02-revolution.html) | 5 min | 智能体革命 - 概念解构 |
| **03** | [03-main.html](chapters/03-main.html) | 8 min | main 调度 |
| **04** | [04-project.html](chapters/04-project.html) | 8 min | project 项目管家 |
| **05** | [05-research.html](chapters/05-research.html) | 10 min | research V3 |
| **06** | [06-data.html](chapters/06-data.html) | 10 min | data 清洗 |
| **07** | [07-report.html](chapters/07-report.html) | 8 min | report 排版 |
| **08** | [08-ecosystem.html](chapters/08-ecosystem.html) | 12 min | 三智能体生态 ⭐ |
| **09** | [09-case.html](chapters/09-case.html) | 8 min | 实战案例 |
| **10** | [10-methodology.html](chapters/10-methodology.html) | 12 min | 纵横分析法 ⭐ |
| **11** | [11-demo.html](chapters/11-demo.html) | 15 min | 现场演示 🔴 |
| **12** | [12-qa.html](chapters/12-qa.html) | 10 min | Q&A |
| **总计** | — | ~110 min | |

**重点章节**：08（三智能体生态）· 10（纵横分析法）· 11（现场演示）

---

## 🎮 操作手册

### 键盘快捷键

| 键 | 功能 |
|----|------|
| **←** | 上一张 Slide |
| **→** | 下一张 Slide |
| **P** | 显示/隐藏讲者备注（如配置） |
| **T** | 切换主题（天蓝/暗夜/学术/国风） |
| **M** | 切换演示/探索模式 |
| **Home** | 回到当前章节首页 |
| **End** | 跳到当前章节末页 |
| **Esc** | 退出全屏 |

### 双模式

- **📊 演示模式（默认）**：全屏投屏 + 键盘翻页 + 进度条
- **🔍 探索模式**：可滚动 + 链接可点击 + 侧边栏常驻

切换按钮在右上角「演示模式/探索模式」。

### 4 主题实时切换

| 主题 | 颜色 | 适用场景 |
|------|------|---------|
| **🟦 天保蓝** | 深蓝主色 | 默认主题 · 正式投屏 |
| **🌑 暗夜黑** | 黑底高亮 | 重点章节（08/10/11）· 现场气氛 |
| **⬜ 学术白** | 浅色系 | 打印 / 白板展示 |
| **🟥 国风红** | 国企公文 | 汇报领导场景 |

---

## 📂 项目结构

```
智能体内训课件/
├── index.html                         # 主页（封面 + 导航）
├── README.md                          # 本文档
├── chapters/                          # 12 章节 HTML
│   ├── 00-cover.html
│   ├── 01-opening.html
│   ├── 02-revolution.html
│   ├── 03-main.html
│   ├── ...
│   └── 12-qa.html
└── assets/
    ├── css/
    │   ├── main.css                   # 主样式（布局/组件）
    │   └── themes.css                 # 4 主题样式
    ├── js/
    │   ├── main.js                    # 翻页/模式/快捷键
    │   └── data.js                    # 课程数据
    └── img/
        ├── cover-7agents.png          # 封面图（7 智能体总览）
        ├── workflow-factory.png       # 工作流工厂
        ├── before-after.png           # 前后对比
        └── presentation-demo.png      # 演示场景
```

---

## 🎨 5 大 Agent + 2 大助手 + 1 中台

### 🟢 5 大 Agent（OpenClaw 内部）

| Agent | 模型 | 核心职能 |
|-------|------|---------|
| **🎯 main** | M3 / M2.7 | 总调度 + 任务分派 + 心跳监控 |
| **📋 project** | M2.7 | 项目全周期管理 + 投资请示 |
| **🔍 research** | V3.33 | 行业+财务+估值研究分析 |
| **🗄️ data** | M3 | 数据清洗 + 入库（28 脚本） |
| **📄 report** | M2.7 | Word/PDF/PPT 排版输出 |

### 🔵 2 大助手（外部协同）

| 助手 | 模型 | 核心职能 |
|------|------|---------|
| **💻 Claude Code** | Claude Sonnet | 智能体维护 + 投资研究纵深 |
| **🌳 Hermes** | DeepSeek V3 | 复杂编码 + 自我学习 |

### 🟡 1 中台

| 中台 | 端口 | 资源 |
|------|------|------|
| **📚 Wiki 知识库** | 19000（静态）/ 19001（API） | 5786 实体 · 8 collections |

---

## 🔥 现场演示清单（讲课时按顺序）

### 必须打开的页面

1. **Word/PPT 备用稿** — 防止现场断电（本地有 `~/Documents/原始PPT方案/`)
2. **http://localhost:19002/index.html** — 主入口
3. **Terminal 备好 7 个标签页**：
   - Tag 1: research V3（`bash run_v3.sh full "分析启源芯"`）
   - Tag 2: data 清洗（`bash clean.sh research`）
   - Tag 3: project（`cat ~/.openclaw/workspace-project/MEMORY.md`）
   - Tag 4: report（`ls ~/Documents/OpenClaw-Workspace-report/templates/`）
   - Tag 5: main（`sessions_list`）
   - Tag 6: Claude Code（`claude -p "敏感性分析启源芯"`）
   - Tag 7: Hermes（`hermes -p "代码 review"`）
4. **http://localhost:19000/** — Wiki 首页（投屏）
5. **http://localhost:6333/dashboard** — Qdrant Dashboard（可选）
6. **第 11 章大屏** — http://localhost:19002/chapters/11-demo.html

### 现场必讲 3 句话

1. **开场破题**："我今天不讲 AI 概念，讲我们自己的 5+2+1。"
2. **生态讲解**："OpenClaw 干业务，Claude Code 做研究纵深，Hermes 做编码——3 个工具互相补位。"
3. **实战演示**："主公发一条指令，5 个 Agent 90 分钟跑完全流程。"

---

## ⚙️ 技术细节

### 浏览器兼容性

- ✅ Chrome 110+（推荐）
- ✅ Safari 17+（Mac 原生）
- ✅ Edge 110+
- ✅ Firefox 120+
- ⚠️ IE 不支持

### 离线运行

- 所有依赖（HTML/CSS/JS/图片）均本地化
- 第 11 章 LIVE 面板需在线访问 Qdrant（localhost:6333）和 Wiki API（localhost:19001）
- 其他章节完全离线可用

### 文件大小

- 总大小：约 1.2MB（含图片）
- 单页最大：第 11 章（35KB）
- 加载速度：< 2 秒

---

## 📊 真实数据来源

课件中的所有数字均来自天保实战：

| 数据 | 来源 | 时间 |
|------|------|------|
| 5786 → 6098 实体 | PostgreSQL `entity` 表 | 持续增长 |
| 8 Qdrant collections | `report_archive/.../system_rules` | 持续 |
| 28 脚本 | `~/Documents/OpenClaw-Workspace-data/scripts/` | 2026-06-29 重整 |
| 启源芯 WACC=7.5% | research V3 输出 | 2026-05-20 |
| Claude Code 切换 | `~/.claude/settings.json` | 2026-05-18 |
| Hermes 配置 | `~/.hermes/config.yaml` | 2026-05-08 |

---

## 🆘 故障排查

| 问题 | 解决方法 |
|------|---------|
| 端口 19002 占用 | `lsof -ti:19002 | xargs kill -9` |
| Wiki API 不通 | `bash ~/.hermes/scripts/start-wiki.sh restart` |
| Qdrant 不通 | `docker restart qdrant` |
| 第 11 章 LIVE 无数据 | 确认 Qdrant/Wiki 在运行（看地址栏端口） |
| 图片不显示 | 检查 `assets/img/` 是否存在 4 张图 |

---

## 🖱️ 可点击互动（v1.1 新增）

课件中所有"汇总信息卡"均支持点击展开/弹窗，3 种交互模式：

### A. 就地展开（在当前页展开，再点收起）

**触发元素**：带 🔽 图标的卡片（鼠标悬停会上抬 + 边框亮起）

**典型位置**：
- 主页 Slide 2 · 「5 大 Agent / 2 大助手 / 1 中台」三张汇总卡
- 12 章 Q&A · 6 个预设问题

**操作**：
1. 点击汇总卡 → 在原位展开子卡片
2. 鼠标移动到子卡片上 → 自动左移 + 边框加粗
3. 再次点击汇总卡 → 收起

### B. 弹窗（点击弹出全屏 modal）

**触发元素**：带「点击展开详情」提示的卡片

**典型位置**：
- 09 章 · 5 大实战案例（启源芯/星恒/晶能/盈科/中资环）
- 11 章 · 5 大 Agent 实时状态卡

**操作**：
1. 点击案例卡 → 弹出全屏 modal 显示详情
2. 点击 ✕ 关闭 / 点击外部空白 / 按 Esc 关闭
3. modal 自动 80vh 高度，内部可滚动

### C. 视觉动效

- 鼠标悬停 → 卡片上抬 3px + 边框高亮
- 展开/收起 → 500ms 缓动动画
- modal 弹出 → 透明度 + 位移组合动画

### 关闭/取消快捷键

- **Esc** 关闭弹窗
- 再次点击同一汇总卡收起
- 点击弹窗外部区域关闭

---

## 📅 v1.1 更新记录

- ✅ 2026-07-01：所有汇总信息改为可点击互动
- ✅ 主页 Slide 2 新增「5+2+1」可点击体系总览
- ✅ 09 章 5 大案例点击弹窗
- ✅ 11 章 5 大 Agent 状态点击下钻
- ✅ 12 章 6 个问题点击展开回答
- ✅ CSS 增 174 行（.clickable / .collapsible / .modal）
- ✅ JS 增 50 行（点击展开/弹窗/手风琴/Esc 关闭）

---

## 🔄 版本历史

| 版本 | 日期 | 内容 |
|------|------|------|
| v1.0 | 2026-07-01 | 首版：12 章节 + 4 主题 + 2 模式 + LIVE 面板 |
| 待 | 2026-Q3 | 增加第 11 章 Wiki API 完整接入（图表联动） |
| 待 | 2026-Q4 | 增加学员互动题库 + 课后测试 |

---

**主公，这是天保智研的内部核心课件。所有真实路径/数字都已脱敏但保留结构，便于新人快速理解"天保投研到底怎么用 AI"。**

**任何修改/更新建议，请直接对话智能体助理。**
