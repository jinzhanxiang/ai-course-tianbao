import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        
        await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/chapters/01-opening.html", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(1500)
        
        await page.evaluate("document.querySelector('[data-burst=\"burst-research-7\"]').click()")
        await page.wait_for_timeout(2000)
        
        info = await page.evaluate("""function() {
            const stage = document.getElementById('burst-research-7');
            const s = getComputedStyle(stage);
            const scale = s.getPropertyValue('--burst-stage-scale');
            const transform = s.transform;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            
            // 检查所有卡片
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
            return {scale: scale, transform: transform, vw: vw, vh: vh, cards: results};
        }""")
        
        print(f"Stage scale: {info['scale']}")
        print(f"Stage transform: {info['transform']}")
        print(f"视口: {info['vw']}x{info['vh']}")
        print("=" * 60)
        for c in info['cards']:
            flag = "⚠️ 溢出" if c['exceeds'] else "✅"
            print(f"卡片{c['i']}: ({c['x']},{c['y']}) {c['w']}x{c['h']} | 右{c['right']:>4} 下{c['bottom']:>4} {flag}")
        
        await browser.close()

asyncio.run(main())
