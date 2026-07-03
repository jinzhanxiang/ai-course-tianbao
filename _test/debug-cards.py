import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        
        await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/chapters/01-opening.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        
        await page.evaluate("document.querySelector('[data-burst=\"burst-research-7\"]').click()")
        await page.wait_for_timeout(2000)
        
        info = await page.evaluate("""function() {
            const stage = document.getElementById('burst-research-7');
            const cards = stage.querySelectorAll('.burst-card');
            return Array.from(cards).map(function(c, i) {
                const r = c.getBoundingClientRect();
                return {i:i, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), right:Math.round(r.right), bottom:Math.round(r.bottom)};
            });
        }""")
        
        print("卡片实际位置:")
        for c in info:
            print(f"  {c}")
        
        await browser.close()

asyncio.run(main())
