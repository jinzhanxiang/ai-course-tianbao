#!/usr/bin/env python3
"""
深 debug 单个 burst 触发流程。
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"PAGE: {e}"))
        page.on("console", lambda m: errs.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution.html", wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(3500)
        # 列出所有 burst-stage 元素
        info1 = await page.evaluate("""
            () => {
                return {
                    stages: Array.from(document.querySelectorAll('.burst-stage')).map(s => ({id: s.id, hasChildren: s.children.length})),
                    burstVideoNeural: document.getElementById('burst-video-neural') ? 'exists' : 'missing',
                }
            }
        """)
        print(f"📋 页面初始状态: {info1}")
        # 直接调用 openBurst
        info2 = await page.evaluate("""
            () => {
                try {
                    if (typeof openBurst === 'function') {
                        openBurst('burst-video-neural', null);
                        return 'called openBurst()';
                    } else if (typeof window.openBurst === 'function') {
                        window.openBurst('burst-video-neural', null);
                        return 'called window.openBurst()';
                    } else {
                        return 'openBurst not exposed globally';
                    }
                } catch (e) {
                    return 'ERROR: ' + e.message;
                }
            }
        """)
        print(f"📞 主动调用: {info2}")
        await page.wait_for_timeout(2000)
        # 重新检查 stage
        info3 = await page.evaluate("""
            () => {
                const s = document.getElementById('burst-video-neural');
                return s ? {
                    id: s.id,
                    class: s.className,
                    children: s.children.length,
                    display: getComputedStyle(s).display,
                    opacity: getComputedStyle(s).opacity,
                    html: s.innerHTML.slice(0, 500),
                } : 'missing';
            }
        """)
        print(f"📊 2秒后: {info3}")
        # 截图
        await page.screenshot(path="_test/debug-burst-neural.png")
        if errs:
            print("\n=== Console errors ===")
            for e in errs[:20]: print("  ", e[:200])
        await browser.close()

asyncio.run(main())
