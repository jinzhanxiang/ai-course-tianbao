import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        
        await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/chapters/01-opening.html", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(1500)
        
        # 点击后立即检查（scale 设置前）
        await page.evaluate("document.querySelector('[data-burst=\"burst-research-7\"]').click()")
        await page.wait_for_timeout(500)
        
        info = await page.evaluate("""function() {
            const stage = document.getElementById('burst-research-7');
            const container = stage.querySelector('.card-container');
            const vh = window.innerHeight;
            
            let containerH = 0;
            if (container) {
                const r = container.getBoundingClientRect();
                containerH = Math.round(r.height);
            }
            
            const contentH = 130 + containerH;
            const maxVisibleH = vh - 40;
            const shouldScale = contentH > maxVisibleH + 200;
            
            return {
                vh: vh,
                containerH: containerH,
                contentH: contentH,
                maxVisibleH: maxVisibleH,
                shouldScale: shouldScale,
                wouldBeScale: shouldScale ? Math.max(0.6, maxVisibleH / contentH).toFixed(2) : 'N/A'
            };
        }""")
        
        print(f"视口高度: {info['vh']}")
        print(f"cardContainer 高度: {info['containerH']}")
        print(f"内容总高 (130 + containerH): {info['contentH']}")
        print(f"最大可见高 (vh-40): {info['maxVisibleH']}")
        print(f"需要缩放? {info['shouldScale']} (contentH > maxVisibleH + 200)")
        if info['shouldScale']:
            print(f"缩放比例: {info['wouldBeScale']}")
        
        await browser.close()

asyncio.run(main())
