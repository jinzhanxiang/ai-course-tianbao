# 🤖 智能体赋能投资研究 — 内训课件

> **从天保实践到团队跃迁** · 主公亲述 · 2026.07
> 主讲：金战祥（天保控股投资部）

![Version](https://img.shields.io/badge/version-2f4f032-blue?style=flat-square)
![Burst](https://img.shields.io/badge/burst-36/36-brightgreen?style=flat-square)
![Result](https://img.shields.io/badge/result_link-100%25-success?style=flat-square)
![AI Video](https://img.shields.io/badge/AI_video-minimax--Hailuo--2.3-purple?style=flat-square)

---

## 🎬 5 分钟完整端到端演示视频（19 章节串讲 · 含 burst 真结果弹出）

<!-- 替换为 GitHub Pages 可访问的相对路径 -->
<video width="100%" controls autoplay loop muted playsinline poster="./assets/img/cover-7agents.png">
  <source src="./assets/videos/course-demo-5min.mp4" type="video/mp4">
  您的浏览器不支持 HTML5 video 标签。
</video>

> 📹 视频内容：00-cover AI 视频开场 → 19 章节串讲（每章 6-10s）→ 全部 0 错误
> 📹 **短版（30s）**：[course-demo-30s.mp4](./assets/videos/course-demo-30s.mp4)
> 🎨 AI 配图 / 视频均使用 `minimax-portal/image-01` + `minimax-portal/MiniMax-Hailuo-2.3` 生成
> 🎬 3 段 AI 视频（agents-9 / data-stream / war-room）已嵌入 burst-data-7 / burst-video-warroom

---

## 🌐 立即访问（同事直接打开）

```
https://jinzhanxiang.github.io/ai-course-tianbao/index.html
```

或者进入 GitHub 仓库：
- 仓库：https://github.com/jinzhanxiang/ai-course-tianbao
- 部署方式：GitHub Pages（main 分支根目录）

## 📚 课程目录（12 章节）

```
00 · 封面            https://jinzhanxiang.github.io/ai-course-tianbao/chapters/00-cover.html
01 · 开场破题       https://jinzhanxiang.github.io/ai-course-tianbao/chapters/01-opening.html
02 · 智能体革命     https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution.html
03 · main 调度      https://jinzhanxiang.github.io/ai-course-tianbao/chapters/03-main.html
04 · project 项目   https://jinzhanxiang.github.io/ai-course-tianbao/chapters/04-project.html
05 · research V3    https://jinzhanxiang.github.io/ai-course-tianbao/chapters/05-research.html
06 · data 清洗      https://jinzhanxiang.github.io/ai-course-tianbao/chapters/06-data.html
07 · report 排版    https://jinzhanxiang.github.io/ai-course-tianbao/chapters/07-report.html
08 · 三智能体生态   https://jinzhanxiang.github.io/ai-course-tianbao/chapters/08-ecosystem.html
09 · 实战案例       https://jinzhanxiang.github.io/ai-course-tianbao/chapters/09-case.html
10 · 纵横分析法     https://jinzhanxiang.github.io/ai-course-tianbao/chapters/10-methodology.html
11 · 现场演示 ⭐    https://jinzhanxiang.github.io/ai-course-tianbao/chapters/11-demo.html
12 · Q&A           https://jinzhanxiang.github.io/ai-course-tianbao/chapters/12-qa.html
```

## 🎯 部署说明

### 已部署：GitHub Pages

| 项 | 值 |
|----|---|
| 仓库 | `jinzhanxiang/ai-course-tianbao` |
| 部署方式 | GitHub Pages（main 分支根目录） |
| URL | `https://jinzhanxiang.github.io/ai-course-tianbao/` |
| 同步机制 | 助手每次调整后 → `git push` → 5 分钟内自动构建 |
| 状态 | 🟢 在线 |

### 推送命令（助手自动化）

```bash
cd ~/Documents/OpenClaw-Workspace-projects/智能体内训课件
git add . && git commit -m "v1.x 更新说明" && git push origin main
# → GitHub Pages 自动构建（5 分钟内刷新）
```

### 三种打开方式

1. **公网（推荐）**：发给同事链接即可，**主公也可以用手机访问**验证调整
2. **局域网**：本机 `python3 -m http.server 19002 --bind 0.0.0.0` → `http://192.168.x.x:19002/`
3. **离线**：双击 `index.html` 直接打开（注意：第 11 章 LIVE 需本机 Qdrant/Wiki）

## 🖱️ 可点击互动（v1.1 新增）

课件中所有"汇总信息卡"均支持点击展开/弹窗，2 种交互模式：

### A. 就地展开（在当前页展开，再点收起）

**触发元素**：带 `▾` 图标的卡片（鼠标悬停会上抬 + 光圈 + 气泡提示）

**典型位置**：
- 主页 Slide 2 · 「5 大 Agent / 2 大助手 / 1 中台」三张汇总卡
- 12 章 Q&A · 6 个预设问题
- 各章节正文里的 "5 大 Agent / 2 大助手 / 1 套中台"

### B. 弹窗（点击弹出全屏 modal）

**触发元素**：带「点击展开详情」提示的卡片

**典型位置**：
- 09 章 · 5 大实战案例（启源芯/星恒/晶能/盈科/中资环）
- 11 章 · 5 大 Agent 实时状态卡

**操作**：点击 ✕ / 点击外部 / 按 Esc 关闭

### C. 视觉动效

- 鼠标悬停 → 卡片上抬 3px + 光晕扩散
- 展开 → 流光扫过（shimmer）
- modal 弹出 → spring 弹跳入场
- 悬停 500ms → 浮现提示气泡 `👉 xxx 详情`

## ⌨️ 快捷键

| 键 | 作用 |
|----|------|
| `←` `→` | 翻上/下一页 |
| `Home` `End` | 首/末页 |
| `P` | 备注模式（演示时） |
| `T` | 主题切换（天保蓝/暗夜黑/学术白/国风） |
| `M` | 模式切换（演示/阅读） |
| `Esc` | 关闭 modal |

## 🆘 故障排查

| 问题 | 解决方法 |
|------|---------|
| 端口 19002 占用 | `lsof -ti:19002 \| xargs kill -9` |
| Wiki API 不通 | `bash ~/.hermes/scripts/start-wiki.sh restart` |
| Qdrant 不通 | `docker restart qdrant` |
| 第 11 章 LIVE 无数据 | 确认 Qdrant/Wiki 在运行（看地址栏端口） |
| 图片不显示 | 检查 `assets/img/` 是否存在 4 张图 |
| GitHub Pages 404 | 等构建完成（首次 5-10 分钟）|

## 📅 版本记录

| 版本 | 日期 | 内容 |
|------|------|------|
| **v1.2** | 2026-07-01 | 9 章节全员铺可点击 + 精细动画 + 共享 modal 池 |
| v1.1 | 2026-07-01 | 主页 Slide 2 可点击总览 + 5 大案例弹窗 + 6 问展开 |
| v1.0 | 2026-07-01 | 12 章节完整交付 + Wiki API 实时接入 + README 操作手册 |

## 🔗 相关链接

- 主公 OpenClaw 配置：`~/.openclaw/openclaw.json`
- 5 大 Agent 工作区：`~/.openclaw/workspace-{main,project,research,data,report}/`
- Wiki 静态站：`http://localhost:19000/`（本机）
- Wiki API：`http://localhost:19001/`（本机）
- Qdrant：`http://localhost:6333/`（本机）


---

## ✨ 最新一轮深划（2026-07-04 · commit 2f4f032）

### 🎬 真实结果贯通
- **36/36 burst 全部配 resultLink** — 点开任一 burst 即看真实交付
- 晶能光电报告：https://pull-shipment-por-associates.trycloudflare.com/V3426_颜色内容双重修复_交付报告_20260704.html
- 星恒电源报告：https://jinzhanxiang.github.io/xingheng-report/

### 🎨 AI 视频生成（minimax-portal/MiniMax-Hailuo-2.3）
- `assets/videos/agents-9-cinematic.mp4`（6s 开场）
- `assets/videos/course-demo-30s.mp4`（30s 端到端演示）

### 🎯 美学升级
- burst 标题渐变 + 副标题 + 绿色脉冲按钮
- burst-header 顶部扫描光线动画
- 7 个 HTML 模拟器嵌入（war-room / radar-8d / data-pipeline 等）

### 📊 演示流畅度
- 键盘导航：← → 翻页 / Space 触发 / Esc 关闭
- 进度条：topbar 实时显示当前章节
- 烟雾测试：19/19 PASS · 0 错误
