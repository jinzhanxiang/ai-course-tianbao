#!/usr/bin/env python3
"""用本地文件验证 burst 修复"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        
        # 直接打开本地 HTML，加载本地 burst.js
        await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/chapters/02-revolution.html", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(2000)
        
        # 点击 burst-revolution-team
        info = await page.evaluate("""
            () => {
                const t = document.querySelector('[data-burst=\"burst-revolution-team\"]');
                if (t) t.click();
                return t ? 'clicked' : 'missing';
            }
        """)
        print(f"📍 click: {info}")
        await page.wait_for_timeout(2000)
        
        stage = await page.evaluate("""
            () => {
                const s = document.getElementById('burst-revolution-team');
                return s ? {
                    show: s.classList.contains('show'),
                    display: getComputedStyle(s).display,
                    children: s.children.length,
                    hasCards: !!s.querySelector('.burst-card'),
                } : 'missing';
            }
        """)
        print(f"📊 stage: {stage}")
        
        if errs:
            print(f"\n❌ Errors ({len(errs)}):")
            for e in errs[:5]: print("  ", e[:200])
        else:
            print("\n✅ 无错误！")
        
        await browser.close()

asyncio.run(main())
