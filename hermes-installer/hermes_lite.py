#!/usr/bin/env python3
"""
Hermes Lite — 商汤大模型 + 飞书连接 + 工作流引擎
======================================================
Windows 一键安装后即可使用。
支持：对话模式 / 飞书 Webhook 模式 / 工作流模板模式

用法:
  python hermes_lite.py                  # 交互式对话
  python hermes_lite.py --feishu         # 启动飞书监听模式
  python hermes_lite.py --workflow "日报生成器"  # 运行指定工作流
  python hermes_lite.py --once "帮我汇总今天的工作"  # 单次问答
"""

import os
import sys
import json
import yaml
import argparse
import textwrap
from pathlib import Path
from datetime import datetime

# ----- 配置加载 -----
BASE_DIR = Path(__file__).parent.resolve()
CONFIG_PATH = BASE_DIR / "config.yaml"
WORKFLOWS_DIR = BASE_DIR / "workflows"

def load_config():
    if not CONFIG_PATH.exists():
        print("❌ 未找到 config.yaml，请先运行 setup.bat")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

# ----- 模型调用 -----
def call_model(config, messages, stream=True):
    """调用商汤大模型（OpenAI 兼容接口）"""
    from openai import OpenAI

    client = OpenAI(
        api_key=config["model"]["api_key"],
        base_url=config["model"]["api_base"],
    )

    response = client.chat.completions.create(
        model=config["model"]["model"],
        messages=messages,
        max_tokens=config["model"].get("max_tokens", 4096),
        temperature=config["model"].get("temperature", 0.7),
        stream=stream,
    )

    if stream:
        full_text = ""
        print("\n🤖 Hermes: ", end="", flush=True)
        for chunk in response:
            if chunk.choices[0].delta.content:
                text = chunk.choices[0].delta.content
                print(text, end="", flush=True)
                full_text += text
        print("\n")
        return full_text
    else:
        return response.choices[0].message.content

# ----- 飞书 Webhook -----
def send_feishu(config, content):
    """发送消息到飞书群机器人"""
    import requests

    webhook = config.get("feishu", {}).get("webhook_url", "")
    if not webhook:
        print("⚠️ 未配置飞书 Webhook URL")
        return

    payload = {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": "🤖 Hermes Agent"},
                "template": "blue"
            },
            "elements": [
                {
                    "tag": "markdown",
                    "content": content[:3000]  # 飞书限制
                },
                {
                    "tag": "note",
                    "elements": [
                        {"tag": "plain_text", "content": f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}"}
                    ]
                }
            ]
        }
    }

    try:
        resp = requests.post(webhook, json=payload, timeout=10)
        if resp.status_code == 200:
            print("✅ 已推送到飞书")
        else:
            print(f"⚠️ 飞书推送失败: {resp.text[:100]}")
    except Exception as e:
        print(f"⚠️ 飞书连接失败: {e}")

# ----- 工作流模板 -----
WORKFLOW_TEMPLATES = {
    "日报生成器": {
        "description": "读取群消息 → 摘要 → 自动推送日报",
        "prompt": textwrap.dedent("""
            你是一个专业的日报生成助手。请根据用户提供的今日工作内容，生成一份格式化的日报。

            格式要求：
            ## 📋 今日工作日报 ({date})

            ### ✅ 已完成
            - [任务1]
            - [任务2]

            ### 🔄 进行中
            - [任务1] — 预计完成: [时间]

            ### 📌 明日计划
            - [计划1]
            - [计划2]

            ### ⚠️ 需要协调
            - [事项]

            请用专业、简洁的语言，突出关键进展和风险点。
        """).strip(),
    },
    "信息爬取器": {
        "description": "输入 URL → 爬取 → 结构化输出",
        "prompt": textwrap.dedent("""
            你是一个网页信息提取助手。用户会提供网页内容或 URL，请提取以下信息：

            1. 页面标题和来源
            2. 关键数据（表格/数字/日期）
            3. 核心观点摘要（3-5 条）
            4. 可信度评估

            输出格式：结构化的 JSON 或 Markdown 表格。
        """).strip(),
    },
    "数据清洗器": {
        "description": "上传 Excel → 清洗去重 → 分析报告",
        "prompt": textwrap.dedent("""
            你是一个数据清洗专家。用户会提供数据（或描述数据问题），请：

            1. 识别数据质量问题（重复/缺失/格式异常）
            2. 给出清洗方案
            3. 执行清洗并输出结果对比
            4. 生成清洗报告

            输出格式：
            - 原始数据量 / 清洗后数据量
            - 发现的问题类型和数量
            - 清洗规则说明
        """).strip(),
    },
}

def run_workflow(config, workflow_name, user_input=""):
    """运行指定的工作流模板"""
    if workflow_name not in WORKFLOW_TEMPLATES:
        print(f"❌ 未知工作流: {workflow_name}")
        print(f"可用工作流: {', '.join(WORKFLOW_TEMPLATES.keys())}")
        return

    template = WORKFLOW_TEMPLATES[workflow_name]
    prompt = template["prompt"].replace("{date}", datetime.now().strftime("%Y-%m-%d"))

    print(f"\n{'='*60}")
    print(f"📋 运行工作流: {workflow_name}")
    print(f"📝 {template['description']}")
    print(f"{'='*60}")

    if not user_input:
        user_input = input("\n📝 请输入内容（回车使用默认）: ").strip()
        if not user_input:
            user_input = "请生成本周工作日报"

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": user_input},
    ]

    result = call_model(config, messages)
    return result

# ----- 交互式对话 -----
def interactive_mode(config):
    """交互式对话模式"""
    print("""
╔══════════════════════════════════════════════════╗
║  🤖 Hermes Agent v1.0 - 商汤大模型              ║
╠══════════════════════════════════════════════════╣
║  命令:                                          ║
║    /workflow  - 列出可用工作流                  ║
║    /日报      - 快速生成日报                    ║
║    /爬取      - 信息爬取模式                    ║
║    /清洗      - 数据清洗模式                    ║
║    /feishu    - 发送到飞书                      ║
║    /help      - 显示帮助                        ║
║    /quit      - 退出                            ║
╚══════════════════════════════════════════════════╝
""")

    messages = [
        {"role": "system", "content": textwrap.dedent("""
            你是 Hermes，一个专业的 AI 助手，运行在商汤大模型平台上。
            你的特点：
            - 回复简洁、专业、有结构
            - 对于任务类请求，先确认理解再给出方案
            - 对于分析类请求，给出分点结论和数据支撑
            - 对于操作类请求，给出清晰的步骤
        """).strip()},
    ]

    last_result = ""

    while True:
        try:
            user_input = input("\n💬 你: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n👋 再见！")
            break

        if not user_input:
            continue

        # 命令处理
        if user_input.startswith("/quit") or user_input.startswith("/exit"):
            print("👋 再见！")
            break
        elif user_input.startswith("/help"):
            print("可用命令: /workflow /日报 /爬取 /清洗 /feishu /help /quit")
            continue
        elif user_input.startswith("/workflow"):
            print(f"可用工作流: {', '.join(WORKFLOW_TEMPLATES.keys())}")
            continue
        elif user_input.startswith("/日报"):
            last_result = run_workflow(config, "日报生成器")
            continue
        elif user_input.startswith("/爬取"):
            last_result = run_workflow(config, "信息爬取器")
            continue
        elif user_input.startswith("/清洗"):
            last_result = run_workflow(config, "数据清洗器")
            continue
        elif user_input.startswith("/feishu"):
            if last_result:
                send_feishu(config, last_result)
            else:
                print("⚠️ 没有可发送的内容，请先生成内容")
            continue

        messages.append({"role": "user", "content": user_input})
        last_result = call_model(config, messages)
        messages.append({"role": "assistant", "content": last_result})

        # 保持上下文在合理大小
        if len(messages) > 20:
            messages = messages[:2] + messages[-18:]

# ----- 飞书监听模式（简化版）-----
def feishu_listen_mode(config):
    """飞书消息监听 + 自动回复（轮询模式简化版）"""
    print("""
╔══════════════════════════════════════════════════╗
║  📡 Hermes Agent - 飞书监听模式                  ║
╠══════════════════════════════════════════════════╣
║  注意：完整飞书监听需要配置飞书应用凭证           ║
║  当前简化版支持：                                 ║
║    1. 接收飞书 Webhook 消息并回复                 ║
║    2. 定时任务执行并推送结果到飞书群              ║
╚══════════════════════════════════════════════════╝
""")
    webhook = config.get("feishu", {}).get("webhook_url", "")
    if not webhook:
        print("⚠️ 未配置飞书 Webhook URL，请编辑 config.yaml")
        return

    print(f"✅ 飞书 Webhook 已配置")
    print("💡 使用方法：在飞书群中添加自定义机器人，将 Webhook URL 填入 config.yaml")
    print("💡 然后在本程序中运行工作流，结果会自动推送到飞书群")
    print()
    print("当前为演示模式。完整版支持接收飞书消息并自动回复。")
    print("按 Ctrl+C 退出")
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("\n👋 飞书监听已停止")

# ----- 主入口 -----
def main():
    parser = argparse.ArgumentParser(description="Hermes Lite - AI Agent")
    parser.add_argument("--feishu", action="store_true", help="飞书监听模式")
    parser.add_argument("--workflow", type=str, help="运行指定工作流")
    parser.add_argument("--once", type=str, help="单次问答")
    args = parser.parse_args()

    config = load_config()

    if args.once:
        messages = [
            {"role": "system", "content": "你是 Hermes，一个专业的 AI 助手。"},
            {"role": "user", "content": args.once},
        ]
        call_model(config, messages)
    elif args.workflow:
        run_workflow(config, args.workflow)
    elif args.feishu:
        feishu_listen_mode(config)
    else:
        interactive_mode(config)

if __name__ == "__main__":
    main()
