#!/usr/bin/env python3
"""捕获精确的错误位置和 stack"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"ERR: {e}\nStack: {e.stack[:500] if e.stack else 'no stack'}"))
        page.on("console", lambda m: errs.append(f"[{m.type}] {m.text}") if m.type == "error" else None)
        # 注入错误捕获
        await page.add_init_script("""
            window.addEventListener('error', e => {
                console.log('GLOBAL_ERROR:', e.message, '@', e.filename + ':' + e.lineno + ':' + e.colno);
            });
        """)
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution.html", wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(3000)
        # 主动调用 openBurst + 报错位置
        result = await page.evaluate("""
            () => {
                try {
                    window.openBurst('burst-revolution-team', null);
                    return 'OK';
                } catch (e) {
                    return 'THROW: ' + e.message + ' | stack: ' + (e.stack || 'no stack').slice(0, 800);
                }
            }
        """)
        print(f"📊 result: {result}")
        await page.wait_for_timeout(2000)
        if errs:
            print("\n=== Console errors ===")
            for e in errs[:10]: print("  ", e[:600])
        await browser.close()

asyncio.run(main())
