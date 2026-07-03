import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for vw, vh in [(1440, 900), (1920, 1080)]:
            ctx = await browser.new_context(viewport={"width": vw, "height": vh})
            page = await ctx.new_page()
            
            await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能内训课件/chapters/01-opening.html", wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_timeout(1500)
            
            # 找一个 pentagon 或 5star 的 burst 触发
            # 先看看有哪些 burst
            bursts = await page.evaluate("""function() {
                const triggers = document.querySelectorAll('[data-burst]');
                return Array.from(triggers).slice(0, 10).map(t => t.getAttribute('data-burst'));
            }""")
            print(f"\n视口 {vw}x{vh}: 可用 bursts: {bursts[:5]}")
            await ctx.close()
        
        await browser.close()

asyncio.run(main())
