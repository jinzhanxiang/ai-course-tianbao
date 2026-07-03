#!/usr/bin/env python3
"""真实点击 + 等 5 秒 + 检查 iframe 加载"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"PAGE: {e}"))
        page.on("console", lambda m: errs.append(f"[{m.type}] {m.text[:150]}") if m.type in ("error", "warning") else None)
        results = []
        # 测 6 个关键 burst
        tests = [
            ("02-revolution", "burst-video-neural"),
            ("02-revolution", "burst-video-maindash"),
            ("01-opening", "burst-main"),
            ("01-opening", "burst-1platform"),
            ("01-opening", "burst-5plus2plus1"),
            ("01-opening", "burst-case-xingheng"),
            ("04-project", "burst-project-7"),
            ("04-project", "burst-case-xingheng"),
        ]
        for ch, bid in tests:
            print(f"\n🔍 {ch} | {bid}")
            await page.goto(f"https://jinzhanxiang.github.io/ai-course-tianbao/chapters/{ch}.html", wait_until="domcontentloaded", timeout=25000)
            await page.wait_for_timeout(2500)
            # 模拟真实点击
            rect = await page.evaluate(f"""
                () => {{
                    const t = document.querySelector('[data-burst="{bid}"]');
                    if (!t) return 'missing';
                    const r = t.getBoundingClientRect();
                    return {{ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }};
                }}
            """)
            print(f"   📍 位置: {rect}")
            if rect == "missing" or rect["w"] == 0:
                print(f"   ❌ 触发器不可见")
                results.append({"ch": ch, "burst": bid, "ok": False, "reason": "trigger not visible"})
                continue
            cx = rect["x"] + rect["w"]/2
            cy = rect["y"] + rect["h"]/2
            await page.mouse.click(cx, cy)
            await page.wait_for_timeout(5000)  # 等 5 秒让 iframe 加载
            # 检查 stage
            s = await page.evaluate(f"""
                () => {{
                    const st = document.getElementById('{bid}');
                    if (!st) return 'stage missing';
                    const iframe = st.querySelector('iframe');
                    return {{
                        class: st.className,
                        display: getComputedStyle(st).display,
                        opacity: getComputedStyle(st).opacity,
                        children: st.children.length,
                        hasIframe: !!iframe,
                        iframeSrc: iframe ? iframe.src : '',
                        iframeReadyState: iframe ? iframe.contentDocument?.readyState || 'no-doc' : 'no-iframe',
                        iframeH: iframe ? iframe.offsetHeight : 0,
                    }};
                }}
            """)
            print(f"   📊 5秒后: {s}")
            # 截图
            try:
                await page.screenshot(path=f"_test/burst-real-{bid}.png")
            except: pass
            results.append({"ch": ch, "burst": bid, "ok": s != "stage missing" and s.get("hasIframe"), "info": s})
            # 关闭
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(500)
        if errs:
            print(f"\n=== Console errors ===")
            for e in errs[:15]: print("  ", e[:200])
        out = Path("_test/real-burst.json")
        out.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        await browser.close()

asyncio.run(main())
