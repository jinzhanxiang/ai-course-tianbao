"""
卡片布局真浏览器截图脚本
- 截 5 个高卡片章节的 1920x1080 viewport
- 标记 is-tall slide 状态
- 检测卡片是否在视口外
"""
import asyncio
import os
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "https://jinzhanxiang.github.io/ai-course-tianbao/chapters/"
OUT = Path("/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/_test")
OUT.mkdir(exist_ok=True)

CHAPTERS = [
    ("01-opening", "投资岗视角问题"),
    ("02-revolution-architecture", "02.5 体系总览"),
    ("02-revolution", "智能体革命"),
    ("03-main", "main 总调度"),
    ("04-project", "project 项目管家"),
    ("07-report", "report 报告专家"),
    ("09-case", "9 实战案例"),
]

VIEWPORTS = [
    (1920, 1080, "desktop-1920x1080"),
]

async def screenshot_one(p, chapter, hint, w, h, label):
    browser = await p.chromium.launch(headless=True)
    ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = await ctx.new_page()
    url = BASE + chapter + ".html"
    print(f"\n[{label}] {chapter} ({w}x{h}) - {hint}")
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
    except Exception as e:
        print(f"  ⚠️ goto timeout: {e}")
    await page.wait_for_timeout(3000)
    # 检测 is-tall 状态
    slides = await page.query_selector_all(".slide")
    info = []
    for i, s in enumerate(slides):
        if "active" not in (await s.get_attribute("class") or ""):
            continue
        cls = await s.get_attribute("class")
        sh = await s.evaluate("(el) => el.getBoundingClientRect().height")
        vh = h
        is_tall = sh > vh
        # 检测 burst-trigger 卡片位置
        bursts = await s.query_selector_all(".burst-trigger")
        burst_info = []
        for b in bursts:
            rect = await b.evaluate("""(el) => {
                const r = el.getBoundingClientRect();
                return {top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height};
            }""")
            burst_info.append({
                "rect": rect,
                "off_screen_bottom": rect["bottom"] > vh,
                "off_screen_top": rect["top"] < 0,
            })
        info.append({"i": i+1, "is_tall": is_tall, "height": sh, "viewport": vh, "bursts": burst_info})
    print(f"  → {len(slides)} slides")
    for x in info:
        ov = sum(1 for b in x["bursts"] if b["off_screen_bottom"]) + sum(1 for b in x["bursts"] if b["off_screen_top"])
        flag = "🔴 OFF-SCREEN" if ov else ("🟡 is-tall" if x["is_tall"] else "✅ fit")
        print(f"    slide {x['i']}: {x['height']:.0f}/{x['viewport']} {flag} ({ov} 卡片越界 / {len(x['bursts'])} 卡片)")
    # 截图
    out_path = OUT / f"{chapter}_{label}.png"
    await page.screenshot(path=str(out_path), full_page=False)
    print(f"  📸 {out_path.name}")
    await browser.close()

async def main():
    async with async_playwright() as p:
        for ch, hint in CHAPTERS:
            for w, h, label in VIEWPORTS:
                await screenshot_one(p, ch, hint, w, h, label)

asyncio.run(main())