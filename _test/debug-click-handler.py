#!/usr/bin/env python3
"""深 debug click handler 绑定"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"PAGE: {e}"))
        page.on("console", lambda m: errs.append(f"[{m.type}] {m.text[:150]}") if m.type in ("error", "warning") else None)
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution.html", wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(3500)
        # 1) 查所有 burst-trigger 是否已绑定
        info = await page.evaluate("""
            () => {
                const triggers = document.querySelectorAll('.burst-trigger');
                return Array.from(triggers).map(t => ({
                    burst: t.dataset.burst,
                    bound: t.dataset.bound || 'no',
                    hasOnClick: !!t.onclick,
                    hasListeners: 'unknown (DOM has no API)',
                }));
            }
        """)
        print("📋 触发器初始状态:")
        for t in info: print(f"   {t}")
        # 2) 手动调 bindBurstTriggers
        rebind = await page.evaluate("""
            () => {
                try {
                    if (typeof window.bindBurstTriggers === 'function') {
                        window.bindBurstTriggers();
                        return 'rebound';
                    }
                    return 'bindBurstTriggers not exposed';
                } catch (e) {
                    return 'ERROR: ' + e.message;
                }
            }
        """)
        print(f"🔄 重新绑定: {rebind}")
        # 3) 再查
        info2 = await page.evaluate("""
            () => {
                const t = document.querySelector('[data-burst="burst-video-neural"]');
                return t ? { burst: t.dataset.burst, bound: t.dataset.bound } : 'missing';
            }
        """)
        print(f"📋 重新绑定后: {info2}")
        # 4) 模拟 click
        await page.evaluate("""
            () => {
                const t = document.querySelector('[data-burst="burst-video-neural"]');
                if (t) t.click();
            }
        """)
        await page.wait_for_timeout(2000)
        # 5) 看 stage
        s = await page.evaluate("""
            () => {
                const st = document.getElementById('burst-video-neural');
                return st ? { children: st.children.length, html: st.innerHTML.slice(0, 200) } : 'missing';
            }
        """)
        print(f"📊 click 2秒后 stage: {s}")
        if errs:
            print("\n=== Console errors ===")
            for e in errs[:10]: print("  ", e)
        await browser.close()

asyncio.run(main())
