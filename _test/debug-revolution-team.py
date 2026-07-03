#!/usr/bin/env python3
"""专门 debug burst-revolution-team 失败原因"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"PAGE: {e}"))
        page.on("console", lambda m: errs.append(f"[{m.type}] {m.text[:300]}") if m.type in ("error", "warning", "log") else None)
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution.html", wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(3500)
        # 检查 trigger
        info = await page.evaluate("""
            () => {
                const t = document.querySelector('[data-burst="burst-revolution-team"]');
                if (!t) return 'missing';
                const r = t.getBoundingClientRect();
                const cs = getComputedStyle(t);
                return {
                    text: t.innerText,
                    rect: {x: r.x, y: r.y, w: r.width, h: r.height},
                    display: cs.display, opacity: cs.opacity, visibility: cs.visibility,
                };
            }
        """)
        print(f"📋 trigger: {info}")
        # 看 stage
        stage = await page.evaluate("""
            () => {
                const s = document.getElementById('burst-revolution-team');
                if (!s) return 'missing';
                return {
                    class: s.className,
                    children: s.children.length,
                    innerHTML: s.innerHTML.slice(0, 500),
                };
            }
        """)
        print(f"📋 stage 初始: {stage}")
        # 真实点击
        if isinstance(info, dict) and info["rect"]["w"] > 0:
            cx = info["rect"]["x"] + info["rect"]["w"]/2
            cy = info["rect"]["y"] + info["rect"]["h"]/2
            print(f"🖱️ click ({cx}, {cy})")
            await page.mouse.click(cx, cy)
        else:
            print("❌ 触发器不可见，跳过 click")
        await page.wait_for_timeout(3000)
        stage2 = await page.evaluate("""
            () => {
                const s = document.getElementById('burst-revolution-team');
                if (!s) return 'missing';
                const cs = getComputedStyle(s);
                return {
                    class: s.className,
                    display: cs.display,
                    opacity: cs.opacity,
                    visibility: cs.visibility,
                    children: s.children.length,
                    html: s.innerHTML.slice(0, 300),
                };
            }
        """)
        print(f"📋 stage 3秒后: {stage2}")
        await page.screenshot(path="_test/revolution-team-attempt.png")
        if errs:
            print("\n=== Console ===")
            for e in errs[:20]: print("  ", e[:300])
        await browser.close()

asyncio.run(main())
