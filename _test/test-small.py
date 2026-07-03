import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for vw, vh in [(1366, 768), (1280, 720)]:
            ctx = await browser.new_context(viewport={"width": vw, "height": vh})
            page = await ctx.new_page()
            
            await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/chapters/01-opening.html", wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)
            
            await page.evaluate("document.querySelector('[data-burst=\"burst-research-7\"]').click()")
            await page.wait_for_timeout(2000)
            
            info = await page.evaluate("""function() {
                const stage = document.getElementById('burst-research-7');
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const cards = stage.querySelectorAll('.burst-card');
                const results = [];
                cards.forEach(function(c, i) {
                    const r = c.getBoundingClientRect();
                    results.push({
                        i: i,
                        x: Math.round(r.x), y: Math.round(r.y),
                        w: Math.round(r.width), h: Math.round(r.height),
                        right: Math.round(r.right), bottom: Math.round(r.bottom),
                        exceeds: r.right > vw || r.bottom > vh
                    });
                });
                return {vw, vh, cards: results};
            }""")
            
            print(f"\n视口 {info['vw']}x{info['vh']}:")
            print("-" * 50)
            for c in info['cards']:
                flag = "⚠️ 溢出" if c['exceeds'] else "✅"
                print(f"卡片{c['i']}: ({c['x']},{c['y']}) 尺寸{c['w']}x{c['h']} 右{c['right']} 下{c['bottom']} {flag}")
            
            await ctx.close()
        
        await browser.close()

asyncio.run(main())
