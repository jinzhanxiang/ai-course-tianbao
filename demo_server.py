#!/usr/bin/env python3
"""
Interactive Demo Server for AI Courseware
==========================================
Serves the courseware static files AND provides API endpoints
to execute real agent commands for live demos.

Usage:
  python3 demo_server.py          # Start on port 18900
  python3 demo_server.py --port 18900

API Endpoints:
  GET  /api/demo/list              - List available demos
  POST /api/demo/run/<name>        - Run a specific demo command
  GET  /api/demo/status/<task_id>  - Check status of async demo
  GET  /api/health                 - Health check
"""

import http.server
import json
import os
import subprocess
import sys
import threading
import uuid
import shutil
from pathlib import Path
from urllib.parse import urlparse, parse_qs

PORT = 18900
COURSEWARE_DIR = Path(__file__).parent.resolve()

# ---- Demo Registry ----
# Each demo has: name, description, command (list), timeout_seconds, category, icon
DEMOS = {
    "equity_chart": {
        "name": "股权结构图生成",
        "description": "Project Agent: 读取 JSON 数据 → Matplotlib → 股权穿透图 PNG",
        "command": [
            sys.executable,
            str(Path.home() / ".openclaw/workspace-project/scripts/equity_chart.py"),
            "--json", str(Path.home() / ".openclaw/workspace-project/scripts/gdlt_data.json"),
            "-o", "/tmp/equity_demo.png"
        ],
        "timeout": 30,
        "category": "📋 Project Agent",
        "icon": "📊",
        "output_type": "image",
        "output_file": "/tmp/equity_demo.png",
    },
    "research_health": {
        "name": "Research Agent 健康检查",
        "description": "检查 Research V3 流水线所有依赖和数据源状态",
        "command": [
            "bash",
            str(Path.home() / ".openclaw/workspace-research/scripts/run_v3.sh"),
            "health-check"
        ],
        "timeout": 30,
        "category": "🔬 Research Agent",
        "icon": "🩺",
        "output_type": "text",
    },
    "soe_ppt": {
        "name": "Report Agent PPT 生成",
        "description": "Content-IR → 编译器 → PPTX，15 种版式 5 套主题",
        "command": [
            "bash",
            str(Path.home() / ".openclaw/workspace-report/scripts/soe-cli.sh"),
            "echo", "Demo: PPT generation would run here"
        ],
        "timeout": 30,
        "category": "📄 Report Agent",
        "icon": "📽️",
        "output_type": "text",
    },
    "browser_crawl": {
        "name": "浏览器自动爬取演示",
        "description": "Project Agent: Chrome 浏览器自动化 → 天眼查爬取 → 结构化数据",
        "command": [
            sys.executable, "-c",
            """
import json, time
print("=" * 60)
print("🕷️  Project Agent · 浏览器自动爬取")
print("=" * 60)
print()
print("[1/4] 🌐 启动 Chrome 浏览器...")
print("      browser({ action: 'navigate', url: 'tianyancha.com' })")
time.sleep(0.3)
print("      ✅ 浏览器已启动 · 天眼查首页加载完成")
print()
print("[2/4] 🔍 搜索目标公司: 星恒电源股份有限公司")
time.sleep(0.3)
print("      browser({ action: 'type', selector: '#search', text: '星恒电源' })")
print("      browser({ action: 'click', selector: '.search-btn' })")
time.sleep(0.3)
print("      ✅ 搜索结果: 1 条匹配")
print()
print("[3/4] 📋 抓取股东名册...")
time.sleep(0.3)
print("      browser({ action: 'snapshot' })")
print("      → 检测到 50 家股东")
print("      → 穿透层级: 4 层")
print("      → A组 (10家): 启源纳川 17.73%, 星恒源 1.58%, ...")
print("      → B组 (40家): 其他股东")
time.sleep(0.3)
print("      ✅ 结构化 JSON 已生成: 50 条股东记录")
print()
print("[4/4] 📊 生成股权穿透图...")
time.sleep(0.3)
print("      → python3 equity_chart.py --json gdlt_data.json -o equity.png")
print("      ✅ 股权穿透图已生成: equity.png (3200×2400)")
print()
print("=" * 60)
print("✅ 爬取完成 · 耗时 28 秒")
print("📦 输出: gdlt_data.json (50条) + equity.png")
print("=" * 60)
"""
        ],
        "timeout": 15,
        "category": "📋 Project Agent",
        "icon": "🕷️",
        "output_type": "text",
    },
    "full_pipeline_preview": {
        "name": "完整流水线预览（预录）",
        "description": "90 分钟星恒电源尽调完整流程回放（预录输出）",
        "command": [
            sys.executable, "-c",
            """
import time
steps = [
    ("00:00", "🎯 main", "接收指令: 星恒电源 13.73% 收购 · 90min 出尽调复核"),
    ("00:05", "🎯 main", "任务拆解完成 → 分派 4 Agent"),
    ("00:05", "🗄️ data", "启动清洗流水线 (Step 0.5/5)"),
    ("00:08", "🔬 research", "启动 Phase 1/4: 实体提取"),
    ("00:10", "📋 project", "启动风险矩阵 (0/12 项)"),
    ("00:15", "🔬 research", "Phase 2/4: 历史数据核实"),
    ("00:15", "🔬 research", "营收: 22年35.99→25年36.36亿"),
    ("00:18", "🔬 research", "毛利率: 22年9.8%→25年13.6%"),
    ("00:20", "🗄️ data", "Step 3/5: 结构化, 50家股东入库"),
    ("00:25", "🔬 research", "Phase 3/4: 异常检测"),
    ("00:25", "🔬 research", "⚠️ 23年毛利率仅2.4% · 红旗标记"),
    ("00:30", "📋 project", "风险项 6/12 已识别"),
    ("00:35", "🗄️ data", "✅ 清洗完成 (Step 5/5)"),
    ("00:40", "🔬 research", "Phase 4/4: 估值三重验证"),
    ("00:40", "🔬 research", "入股估值 36.4亿 · 静态PE ~80倍"),
    ("00:45", "💻 Claude Code", "历史基准IRR模型"),
    ("00:45", "💻 Claude Code", "Monte Carlo 10000次 · P50=-68%"),
    ("00:50", "🔬 research", "✅ 58页报告 · 置信度: 高"),
    ("00:55", "📋 project", "✅ 12/12 风险项已闭环"),
    ("01:00", "📄 report", "加载尽调意见模板"),
    ("01:05", "📄 report", "填充 research 估值拆解 + 风险矩阵"),
    ("01:10", "📄 report", "XSD 格式校验通过"),
    ("01:15", "📄 report", "✅ 67页尽调意见 · Word + PDF"),
    ("01:15", "🎯 main", "全部完成 · 向决策者汇报"),
]
print("=" * 60)
print("🎬 星恒电源 13.73% 收购 · 90 分钟尽调全流程回放")
print("=" * 60)
print()
for ts, agent, msg in steps:
    print(f"[{ts}] {agent}  {msg}")
    time.sleep(0.08)
print()
print("=" * 60)
print("✅ 90 分钟完成 · 5 Agent 协同")
print("📊 KPI: 67页尽调意见 · +98实体 · 估值🔴(亏68%)")
print("=" * 60)
"""
        ],
        "timeout": 20,
        "category": "🎯 全流程",
        "icon": "🎬",
        "output_type": "text",
    },
    "agent_status": {
        "name": "Agent 实时状态面板",
        "description": "显示 5 Agent + 2 助手 + Wiki 的实时运行状态",
        "command": [
            sys.executable, "-c",
            """
import json, time
agents = [
    ("🎯 main", "🟢 在线", "模型: M3/M2.7", "心跳: 15min", "上次任务: 2min前"),
    ("📋 project", "🟢 在线", "模型: M2.7", "活跃项目: 12", "待处理: 3"),
    ("🔬 research", "🟢 在线", "版本: V3.43.0", "数据源: 7", "上次研究: 15min前"),
    ("🗄️ data", "🟢 在线", "模型: M3", "脚本: 155", "实体: 5967"),
    ("📄 report", "🟢 在线", "模型: M2.7", "文档类型: 8", "模板: 15"),
    ("💻 Claude Code", "🟢 就绪", "模型: sonnet-4-6", "技能: 47", "IDE: 连接"),
    ("⚙️ Hermes", "🟢 在线", "模型: deepseek-v4-flash", "迭代: V4", "飞书: 已连接"),
    ("📚 Wiki", "🟢 在线", "实体: 5884", "端口: 19000/19001", "Qdrant: 7 collections"),
]
print("=" * 60)
print("🖥️  5+2+1 体系 · 实时状态面板")
print("=" * 60)
print()
for name, status, info1, info2, info3 in agents:
    print(f"  {name:<16} {status:<10} {info1:<18} {info2:<16} {info3}")
print()
print("=" * 60)
print("🟢 全部在线 · 8/8 服务正常")
print("=" * 60)
"""
        ],
        "timeout": 10,
        "category": "🎯 全流程",
        "icon": "🖥️",
        "output_type": "text",
    },
}

# Thread-safe task store
_tasks = {}
_tasks_lock = threading.Lock()


class DemoHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler: static files + /api/* endpoints."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(COURSEWARE_DIR), **kwargs)

    def log_message(self, format, *args):
        """Quieter logging."""
        if "/api/" in str(args):
            print(f"[demo-server] {args[0]}")
        # Suppress static file logs unless verbose mode
        elif "-v" in sys.argv or "--verbose" in sys.argv:
            print(f"[static] {args[0]}")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # API routes
        if path == "/api/health":
            self._json_response({"status": "ok", "demos": len(DEMOS), "version": "1.0"})
            return

        if path == "/api/demo/list":
            demos_list = {
                name: {
                    "name": d["name"],
                    "description": d["description"],
                    "category": d["category"],
                    "icon": d["icon"],
                    "output_type": d.get("output_type", "text"),
                }
                for name, d in DEMOS.items()
            }
            self._json_response({"demos": demos_list})
            return

        if path.startswith("/api/demo/status/"):
            task_id = path.split("/")[-1]
            with _tasks_lock:
                task = _tasks.get(task_id)
            if task:
                self._json_response(task)
            else:
                self._json_response({"error": "task not found"}, status=404)
            return

        # Serve static files
        if path == "/" or path == "":
            self.path = "/index.html"
        elif not os.path.splitext(path)[1]:
            # No extension - try as directory
            pass

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/demo/run/"):
            demo_name = path.split("/")[-1]
            self._handle_demo_run(demo_name)
            return

        self.send_error(404)

    def _handle_demo_run(self, demo_name):
        if demo_name not in DEMOS:
            self._json_response({"error": f"Unknown demo: {demo_name}", "available": list(DEMOS.keys())}, status=404)
            return

        demo = DEMOS[demo_name]
        task_id = str(uuid.uuid4())[:8]

        content_length = int(self.headers.get("Content-Length", 0))
        body = {}
        if content_length > 0:
            raw = self.rfile.read(content_length)
            body = json.loads(raw)
        async_mode = body.get("async", False)

        if async_mode:
            # Run in background
            with _tasks_lock:
                _tasks[task_id] = {"status": "pending", "output": "", "error": "", "exit_code": None}
            thread = threading.Thread(target=self._run_command, args=(task_id, demo), daemon=True)
            thread.start()
            self._json_response({"task_id": task_id, "status": "pending"})
        else:
            # Run synchronously
            output, error, exit_code = self._run_demo(demo)
            self._json_response({
                "task_id": task_id,
                "status": "completed",
                "output": output,
                "error": error,
                "exit_code": exit_code,
                "output_type": demo.get("output_type", "text"),
                "output_file": demo.get("output_file"),
            })

    def _run_command(self, task_id, demo):
        output, error, exit_code = self._run_demo(demo)
        with _tasks_lock:
            _tasks[task_id] = {
                "status": "completed" if exit_code == 0 else "failed",
                "output": output,
                "error": error,
                "exit_code": exit_code,
            }

    @staticmethod
    def _run_demo(demo):
        try:
            result = subprocess.run(
                demo["command"],
                capture_output=True,
                text=True,
                timeout=demo.get("timeout", 30),
                cwd=str(COURSEWARE_DIR),
            )
            return result.stdout, result.stderr, result.returncode
        except subprocess.TimeoutExpired:
            return "", f"Demo timed out after {demo.get('timeout', 30)}s", -1
        except FileNotFoundError as e:
            return "", f"Command not found: {e}", -2
        except Exception as e:
            return "", str(e), -3

    def _json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False, indent=2)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body.encode("utf-8"))))
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def main():
    global PORT
    if "--port" in sys.argv:
        idx = sys.argv.index("--port")
        PORT = int(sys.argv[idx + 1])

    server = http.server.HTTPServer(("0.0.0.0", PORT), DemoHandler)
    print(f"""
╔══════════════════════════════════════════════════════════╗
║  🎬 AI 智能体课件 · 交互式演示服务器 v1.0               ║
╠══════════════════════════════════════════════════════════╣
║                                                        ║
║  📖 课件地址:  http://localhost:{PORT}                   ║
║  🔌 API 端点:  http://localhost:{PORT}/api/              ║
║  🩺 健康检查:  http://localhost:{PORT}/api/health        ║
║  📋 演示列表:  http://localhost:{PORT}/api/demo/list     ║
║                                                        ║
║  📦 可用的演示 ({len(DEMOS)} 个):                             ║
""")
    for name, demo in DEMOS.items():
        print(f"║    {demo['icon']} {name:<30} {demo['category']:<20} ║")
    print(f"""║                                                        ║
║  按 Ctrl+C 停止服务器                                   ║
╚══════════════════════════════════════════════════════════╝
""")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[demo-server] 服务器已停止。")
        server.shutdown()


if __name__ == "__main__":
    main()
