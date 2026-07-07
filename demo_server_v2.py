#!/usr/bin/env python3
"""
Interactive Demo Server v2 for AI Courseware
=============================================
FastAPI + SSE streaming backend. Replaces the old blocking demo_server.py.

Usage:
  python3 demo_server_v2.py           # Start on port 18900
  python3 demo_server_v2.py --port 18901

Endpoints:
  GET  /api/health                       Health check + demo list
  GET  /api/preflight                    Pre-flight: check all agent scripts reachable
  POST /api/demo/run/{name}              Start a demo, returns task_id
  GET  /api/demo/stream/{task_id}        SSE stream for real-time log
  POST /api/demo/upload/{name}           File upload → trigger agent
  POST /api/demo/panic/{task_id}         Kill running demo, switch to prerecorded
  GET  /api/demo/prerecorded/{name}      SSE pre-recorded log playback
  GET  /api/demo/list                    List registered demos
  GET  /api/static/output/{filename}     Serve generated output file
"""

import asyncio
import json
import os
import shutil
import signal
import sys
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse
import uvicorn

# ── Config ──────────────────────────────────────────────────
PORT = 18900
HOME = Path.home()
COURSEWARE_DIR = Path(__file__).parent.resolve()
DEMO_INPUTS_DIR = COURSEWARE_DIR / "demo_inputs"
PRERECORDED_DIR = COURSEWARE_DIR / "demo_inputs"
TMP_DIR = Path("/tmp/demo_output")
TMP_DIR.mkdir(exist_ok=True)

# ── Demo Registry ───────────────────────────────────────────
DEMOS = {
    "equity_chart": {
        "name": "股权结构图生成",
        "description": "Project Agent: JSON → Matplotlib → 股权穿透图 PNG",
        "command": [
            sys.executable,
            str(HOME / ".openclaw/workspace-project/scripts/equity_chart.py"),
            "--json", str(HOME / ".openclaw/workspace-project/scripts/gdlt_data.json"),
            "-o", str(TMP_DIR / "equity_demo.png"),
        ],
        "timeout": 30,
        "category": "📋 Project Agent",
        "icon": "📊",
        "output_type": "image",
        "output_file": str(TMP_DIR / "equity_demo.png"),
        "mode": "live",
    },
    "research_health": {
        "name": "Research Agent 健康检查",
        "description": "检查 Research V3 流水线所有依赖和数据源状态",
        "command": [
            "bash",
            str(HOME / ".openclaw/workspace-research/scripts/run_v3.sh"),
            "health-check",
        ],
        "timeout": 30,
        "category": "🔬 Research Agent",
        "icon": "🩺",
        "output_type": "text",
        "mode": "live",
    },
    "soe_doc": {
        "name": "国企公文排版生成",
        "description": "Report Agent: soe-cli.sh → 国企标准 DOCX → 格式校验",
        "command": [
            "bash",
            str(HOME / ".openclaw/workspace-report/scripts/soe-cli.sh"),
            "-t", "qingshi",
            str(DEMO_INPUTS_DIR / "sample_qingshi.md"),
            str(TMP_DIR / "soe_output.docx"),
        ],
        "timeout": 60,
        "category": "📄 Report Agent",
        "icon": "📽️",
        "output_type": "file",
        "output_file": str(TMP_DIR / "soe_output.docx"),
        "mode": "live",
    },
    "agent_status": {
        "name": "Agent 实时状态面板",
        "description": "检查 data agent 核心服务（Qdrant + PG + BGE）",
        "command": [
            "bash",
            str(HOME / ".openclaw/workspace-data/scripts/health_check.sh"),
        ],
        "timeout": 15,
        "category": "🎯 系统总览",
        "icon": "🖥️",
        "output_type": "text",
        "mode": "live",
    },
    "data_consistency": {
        "name": "数据一致性检查",
        "description": "Qdrant ↔ PostgreSQL 跨库数据一致性校验",
        "command": [
            "bash",
            str(HOME / ".openclaw/workspace-data/scripts/data-consistency-check.sh"),
        ],
        "timeout": 30,
        "category": "🗄️ Data Agent",
        "icon": "🔍",
        "output_type": "text",
        "mode": "live",
    },
    "hermes_query": {
        "name": "Hermes 智能问答",
        "description": "商汤大模型 → 投资分析问答",
        "command": [
            sys.executable,
            str(COURSEWARE_DIR / "hermes-installer" / "hermes_lite.py"),
            "--once", "请用三句话分析星恒电源13.73%收购的估值风险",
        ],
        "timeout": 30,
        "category": "⚙️ Hermes",
        "icon": "🧠",
        "output_type": "text",
        "mode": "live",
    },
    "browser_crawl": {
        "name": "浏览器自动爬取（预录回放）",
        "description": "Project Agent: Chrome → 天眼查 → 股权数据 → 结构化",
        "category": "📋 Project Agent",
        "icon": "🕷️",
        "output_type": "text",
        "mode": "prerecorded",
        "prerecorded_file": "browser_crawl.log",
    },
    "full_pipeline": {
        "name": "90分钟全流程回放（预录）",
        "description": "星恒电源尽调 5 Agent 协同 完整时间线",
        "category": "🎬 全流程",
        "icon": "🎬",
        "output_type": "text",
        "mode": "prerecorded",
        "prerecorded_file": "full_pipeline.log",
    },
    "soe_doc_upload": {
        "name": "公文排版（文件上传）",
        "description": "上传 .md 文件 → soe-cli.sh → DOCX + PNG 预览",
        "category": "📄 Report Agent",
        "icon": "📤",
        "output_type": "image_convert",
        "output_file": str(TMP_DIR / "soe_upload_output.docx"),
        "mode": "live_upload",
        "timeout": 60,
    },
}

# ── In-memory task store ────────────────────────────────────
_tasks: dict = {}
_ring_buffers: dict = {}  # task_id → list of last 200 log lines (for SSE reconnect)


class DemoRunner:
    """Async subprocess runner with line-by-line SSE streaming."""

    def __init__(self, demo_config: dict):
        self.config = demo_config
        self.process = None
        self._cancelled = False
        self._task_id = None

    def cancel(self):
        self._cancelled = True
        if self.process and self.process.returncode is None:
            try:
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
            except Exception:
                self.process.kill()

    async def run(self, task_id: str, extra_args: list = None, input_file: str = None):
        self._task_id = task_id
        cmd = list(self.config["command"])
        if extra_args:
            cmd.extend(extra_args)
        if input_file:
            cmd = [arg.replace("{INPUT_FILE}", input_file) for arg in cmd]

        timeout = self.config.get("timeout", 30)
        _ring_buffers[task_id] = []

        try:
            self.process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(COURSEWARE_DIR),
                env={**os.environ, "PYTHONUNBUFFERED": "1"},
                preexec_fn=os.setpgrp,
            )
        except FileNotFoundError as e:
            msg = json.dumps({"type": "error", "text": f"命令未找到: {e}"})
            _ring_buffers[task_id].append(msg)
            yield {"event": "log", "data": msg}
            _tasks[task_id] = {"status": "failed", "exit_code": -2}
            return
        except Exception as e:
            msg = json.dumps({"type": "error", "text": str(e)})
            _ring_buffers[task_id].append(msg)
            yield {"event": "log", "data": msg}
            _tasks[task_id] = {"status": "failed", "exit_code": -3}
            return

        # Stream stdout line by line
        try:
            while True:
                if self._cancelled:
                    self.process.kill()
                    msg = json.dumps({"type": "log", "text": "⚠️ 演示已被用户取消"})
                    _ring_buffers[task_id].append(msg)
                    yield {"event": "log", "data": msg}
                    _tasks[task_id] = {"status": "cancelled", "exit_code": -1}
                    return

                line = await asyncio.wait_for(self.process.stdout.readline(), timeout=timeout)
                if not line:
                    break
                text = line.decode("utf-8", errors="replace").rstrip()
                if text:
                    data = json.dumps({"type": "log", "text": text})
                    _ring_buffers[task_id].append(data)
                    yield {"event": "log", "data": data}
        except asyncio.TimeoutError:
            self.process.kill()
            msg = json.dumps({"type": "error", "text": f"演示超时 ({timeout}s)，已终止"})
            _ring_buffers[task_id].append(msg)
            yield {"event": "log", "data": msg}
            _tasks[task_id] = {"status": "timeout", "exit_code": -1}
            return

        # Collect stderr
        stderr_data = (await self.process.stderr.read()).decode("utf-8", errors="replace")
        await self.process.wait()
        exit_code = self.process.returncode

        result = {
            "exit_code": exit_code,
            "stderr": stderr_data[:500] if stderr_data else "",
            "output_file": self.config.get("output_file"),
            "output_type": self.config.get("output_type", "text"),
        }
        _tasks[task_id] = {"status": "completed" if exit_code == 0 else "failed", **result}
        yield {"event": "result", "data": json.dumps(result)}


# ── FastAPI App ─────────────────────────────────────────────
app = FastAPI(title="AI Courseware Demo Bridge v2", version="2.0")


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "demos": len(DEMOS),
        "version": "2.0",
        "demo_list": {
            name: {"name": d["name"], "category": d["category"], "icon": d["icon"], "mode": d["mode"]}
            for name, d in DEMOS.items()
        },
    }


@app.get("/api/preflight")
async def preflight():
    results = {}
    for name, demo in DEMOS.items():
        if demo.get("mode") in ("live", "live_upload") and "command" in demo:
            cmd = demo["command"]
            exe = cmd[0]
            if exe in ("bash", sys.executable):
                results[name] = "ok"
            elif shutil.which(exe) or os.path.exists(exe):
                results[name] = "ok"
            else:
                results[name] = f"missing: {exe}"
    # Check libreoffice for PPT/DOCX preview
    lo = shutil.which("libreoffice") or shutil.which("soffice")
    results["libreoffice"] = "ok" if lo else "not found (DOCX preview will show download link)"
    return {"preflight": results, "timestamp": time.time()}


@app.get("/api/demo/list")
async def demo_list():
    return {
        "demos": {
            name: {
                "name": d["name"],
                "description": d["description"],
                "category": d["category"],
                "icon": d["icon"],
                "output_type": d.get("output_type", "text"),
                "mode": d.get("mode", "live"),
            }
            for name, d in DEMOS.items()
        }
    }


@app.post("/api/demo/run/{name}")
async def demo_run(name: str):
    if name not in DEMOS:
        raise HTTPException(404, f"Unknown demo: {name}")

    task_id = str(uuid.uuid4())[:8]
    demo = DEMOS[name]

    if demo.get("mode") == "prerecorded":
        return {"task_id": task_id, "status": "prerecorded", "demo_name": name}

    runner = DemoRunner(demo)
    _tasks[task_id] = {"status": "running", "runner": runner, "demo": demo}

    async def event_generator():
        async for event in runner.run(task_id):
            yield event

    # Store the generator for the stream endpoint
    _tasks[task_id]["generator"] = event_generator()
    return {"task_id": task_id, "status": "started", "demo_name": name}


@app.get("/api/demo/stream/{task_id}")
async def demo_stream(task_id: str):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    demo = task.get("demo", {})

    # Pre-recorded playback
    if task.get("status") == "prerecorded" or demo.get("mode") == "prerecorded":
        name = task.get("demo_name", "")
        if not name:
            name = demo.get("name", "")
        # find the demo name key
        demo_name_key = None
        for k, d in DEMOS.items():
            if d.get("mode") == "prerecorded" and (task.get("demo_name") == k):
                demo_name_key = k
                break
        if not demo_name_key:
            for k in DEMOS:
                if task.get("status") == "prerecorded":
                    demo_name_key = k
                    break
        return EventSourceResponse(_prerecorded_stream(demo_name_key or "full_pipeline"))

    # Live stream
    gen = task.get("generator")
    if not gen:
        raise HTTPException(400, "Task generator not found — task may have already completed")

    return EventSourceResponse(gen)


@app.get("/api/demo/prerecorded/{name}")
async def demo_prerecorded(name: str):
    """Direct SSE endpoint for pre-recorded playback by demo name."""
    demo = DEMOS.get(name)
    if not demo:
        raise HTTPException(404, f"Demo not found: {name}")
    if demo.get("mode") != "prerecorded":
        raise HTTPException(400, f"Demo '{name}' is not prerecorded (mode={demo.get('mode')})")
    return EventSourceResponse(_prerecorded_stream(name))


async def _prerecorded_stream(demo_name: str):
    demo = DEMOS.get(demo_name, {})
    log_file = PRERECORDED_DIR / demo.get("prerecorded_file", f"{demo_name}.log")
    if not log_file.exists():
        yield {"event": "log", "data": json.dumps({"type": "error", "text": f"预录文件不存在: {log_file}"})}
        yield {"event": "result", "data": json.dumps({"exit_code": -1, "error": "prerecorded file missing"})}
        return

    lines = log_file.read_text(errors="replace").split("\n")
    for line in lines:
        if line.strip():
            data = json.dumps({"type": "log", "text": line})
            yield {"event": "log", "data": data}
            await asyncio.sleep(0.06)  # ~2 min for a 2000-line log
    yield {"event": "result", "data": json.dumps({"exit_code": 0, "status": "prerecorded_complete"})}


@app.post("/api/demo/panic/{task_id}")
async def demo_panic(task_id: str):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    runner = task.get("runner")
    if runner:
        runner.cancel()

    demo_name = task.get("demo_name", "")
    return {"status": "cancelled", "task_id": task_id, "fallback_demo": demo_name}


@app.post("/api/demo/upload/{name}")
async def demo_upload(name: str, file: UploadFile = File(...)):
    """Upload a file and trigger the corresponding demo."""
    if name not in DEMOS:
        raise HTTPException(404, f"Unknown demo: {name}")

    demo = DEMOS[name]
    task_id = str(uuid.uuid4())[:8]

    # Save the uploaded file
    upload_dir = TMP_DIR / "uploads"
    upload_dir.mkdir(exist_ok=True)
    safe_name = Path(file.filename).name
    upload_path = upload_dir / f"{task_id}_{safe_name}"
    content = await file.read()
    upload_path.write_bytes(content)

    # Build command — for soe_doc_upload, use soe-cli.sh
    cmd = [
        "bash",
        str(HOME / ".openclaw/workspace-report/scripts/soe-cli.sh"),
        "-t", "qingshi",
        str(upload_path),
        str(TMP_DIR / f"soe_upload_{task_id}.docx"),
    ]

    runner_config = {
        "command": cmd,
        "timeout": demo.get("timeout", 60),
        "output_type": "file",
        "output_file": str(TMP_DIR / f"soe_upload_{task_id}.docx"),
    }
    runner = DemoRunner(runner_config)
    _tasks[task_id] = {"status": "running", "runner": runner, "demo_name": name, "demo": demo}

    async def event_generator():
        async for event in runner.run(task_id):
            yield event
        # Post-processing: convert DOCX to PNG preview
        docx_path = Path(runner_config["output_file"])
        if docx_path.exists():
            yield {"event": "log", "data": json.dumps({"type": "log", "text": "---"})}
            yield {"event": "log", "data": json.dumps({"type": "log", "text": "🖼️  正在生成预览图..."})}
            png = await _convert_to_png(docx_path)
            if png:
                yield {"event": "preview", "data": json.dumps({"preview_url": f"/api/static/output/{png.name}"})}

    _tasks[task_id]["generator"] = event_generator()

    return {"task_id": task_id, "filename": file.filename, "status": "started"}


async def _convert_to_png(docx_path: Path) -> Path | None:
    """Convert DOCX to PNG preview using libreoffice."""
    lo = shutil.which("libreoffice") or shutil.which("soffice")
    if not lo:
        return None
    try:
        proc = await asyncio.create_subprocess_exec(
            lo, "--headless", "--convert-to", "png", "--outdir", str(TMP_DIR), str(docx_path),
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        await asyncio.wait_for(proc.wait(), timeout=30)
        # Find generated PNG
        stem = docx_path.stem
        for f in sorted(TMP_DIR.glob(f"{stem}*.png")):
            return f
        return None
    except Exception:
        return None


@app.get("/api/static/output/{filename}")
async def serve_output(filename: str):
    file_path = TMP_DIR / filename
    if not file_path.exists():
        raise HTTPException(404)
    return FileResponse(file_path)


# ── Static file serving (fallback) ─────────────────────────
@app.get("/api/demo/status/{task_id}")
async def demo_status(task_id: str):
    task = _tasks.get(task_id)
    if not task:
        return {"error": "task not found"}
    return {
        "task_id": task_id,
        "status": task.get("status", "unknown"),
        "exit_code": task.get("exit_code"),
    }


# Mount static files last so API routes take precedence
app.mount("/", StaticFiles(directory=str(COURSEWARE_DIR), html=True), name="static")


# ── Main ────────────────────────────────────────────────────
def main():
    global PORT
    args = sys.argv[1:]
    if "--port" in args:
        idx = args.index("--port")
        PORT = int(args[idx + 1])

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║  🎬 AI 智能体课件 · 交互式演示服务器 v2.0 (FastAPI + SSE)  ║
╠══════════════════════════════════════════════════════════════╣
║                                                            ║
║  📖 课件地址:  http://localhost:{PORT}                       ║
║  🩺 健康检查:  http://localhost:{PORT}/api/health            ║
║  🔍 预检清单:  http://localhost:{PORT}/api/preflight         ║
║  📋 演示列表:  http://localhost:{PORT}/api/demo/list         ║
║                                                            ║
║  📦 已注册演示 ({len(DEMOS)} 个):                                  ║
""")
    for name, demo in DEMOS.items():
        mode_badge = "🔴 LIVE" if demo.get("mode") in ("live", "live_upload") else "🟡 PRE"
        print(f"║    {demo['icon']} {name:<32} {mode_badge:<8} {demo['category']:<20} ║")
    print("""║                                                            ║
║  按 Ctrl+C 停止服务器                                       ║
╚══════════════════════════════════════════════════════════════╝
""")
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="warning")


if __name__ == "__main__":
    main()
