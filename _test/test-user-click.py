#!/usr/bin/env python3
"""模拟真实用户点击（page.click）"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"PAGE: {e}"))
        page.on("console", lambda m: errs.append(f"[{m.type}] {m.text[:200]}") if m.type in ("error", "warning") else None)
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution.html", wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(3500)
        # 1) 找触发器位置
        rect = await page.evaluate("""
            () => {
                const t = document.querySelector('[data-burst="burst-video-neural"]');
                if (!t) return 'missing';
                const r = t.getBoundingClientRect();
                return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), text: t.innerText.trim() };
            }
        """)
        print(f"📍 触发器位置: {rect}")
        # 2) 检查那个坐标上的元素
        top = await page.evaluate(f"""
            () => {{
                const el = document.elementFromPoint({rect['x'] + rect['w']/2}, {rect['y'] + rect['h']/2});
                return el ? {{tag: el.tagName, cls: el.className.slice(0,80), text: (el.innerText || '').slice(0, 40), isBurstTrigger: el.classList.contains('burst-trigger')}} : 'none';
            }}
        """)
        print(f"📐 那个坐标上的元素: {top}")
        # 3) 真实用户点击
        if isinstance(rect, dict):
            cx = rect['x'] + rect['w']/2
            cy = rect['y'] + rect['h']/2
            print(f"🖱️ 模拟点击 ({cx}, {cy})...")
            await page.mouse.click(cx, cy)
        await page.wait_for_timeout(2000)
        s = await page.evaluate("""
            () => {
                const st = document.getElementById('burst-video-neural');
                return st ? { children: st.children.length, class: st.className } : 'missing';
            }
        """)
        print(f"📊 click 后: {s}")
        if errs:
            print("\n=== Console errors ===")
            for e in errs[:10]: print("  ", e[:200])
        await browser.close()

asyncio.run(main())
