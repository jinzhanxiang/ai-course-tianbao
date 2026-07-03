#!/usr/bin/env python3
"""验证 burst 修复效果"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"PAGE: {e}"))
        
        # 测试 burst-revolution-team（之前失败的）
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution.html", wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(4000)  # 等 CDN 同步
        
        # 检查 trigger
        info = await page.evaluate("""
            () => {
                const t = document.querySelector('[data-burst=\"burst-revolution-team\"]');
                if (!t) return 'missing';
                const r = t.getBoundingClientRect();
                return {x: r.x, y: r.y, w: r.width, h: r.height};
            }
        """)
        print(f"📍 trigger rect: {info}")
        
        # 真实点击
        if isinstance(info, dict) and info["w"] > 0:
            await page.mouse.click(info["x"] + info["w"]/2, info["y"] + info["h"]/2)
        await page.wait_for_timeout(3000)
        
        # 检查 stage
        stage = await page.evaluate("""
            () => {
                const s = document.getElementById('burst-revolution-team');
                if (!s) return 'missing';
                return {
                    show: s.classList.contains('show'),
                    display: getComputedStyle(s).display,
                    opacity: getComputedStyle(s).opacity,
                    children: s.children.length,
                    hasCards: !!s.querySelector('.burst-card'),
                };
            }
        """)
        print(f"📊 stage: {stage}")
        
        # 截图
        await page.screenshot(path="_test/verify-revolution-team.png")
        
        if errs:
            print(f"\n❌ Errors: {len(errs)}")
            for e in errs[:5]: print("  ", e[:200])
        else:
            print("\n✅ 无 console 错误")
        
        await browser.close()

asyncio.run(main())
