#!/usr/bin/env python3
"""验证 7star 布局修复"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        
        # 加载本地 01-opening.html（包含 burst-research-7）
        await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/chapters/01-opening.html", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(2000)
        
        # 滚动到触发器并点击
        await page.evaluate("""() => {
            const t = document.querySelector('[data-burst="burst-research-7"]');
            if (t) t.scrollIntoViewIfNeeded();
        }""")
        await page.wait_for_timeout(500)
        
        # 点击
        await page.evaluate("""() => {
            const t = document.querySelector('[data-burst="burst-research-7"]');
            if (t) t.click();
        }""")
        await page.wait_for_timeout(2000)
        
        # 检查卡片位置
        cards = await page.evaluate("""() => {
            const stage = document.getElementById('burst-research-7');
            if (!stage || !stage.classList.contains('show')) return 'not shown';
            const nodes = stage.querySelectorAll('.burst-card');
            return Array.from(nodes).map((c, i) => {
                const s = c.style;
                return { i, left: s.left, top: s.top };
            });
        }""")
        
        print("📊 7star 卡片位置:")
        for c in cards[:8]:
            print(f"  [{c['i']}] left: {c['left']}, top: {c['top']}")
        
        # 检查是否有重叠（距离太近）
        overlaps = 0
        for i, a in enumerate(cards[:7]):
            for b in cards[i+1:]:
                if a['left'] == b['left'] and a['top'] == b['top']:
                    overlaps += 1
        
        print(f"\n{'❌ 有重叠!' if overlaps else '✅ 无重叠'}")
        await browser.close()

asyncio.run(main())