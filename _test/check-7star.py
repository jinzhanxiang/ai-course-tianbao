import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        
        await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/chapters/01-opening.html", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(1500)
        
        # 点击触发器
        await page.evaluate("document.querySelector('[data-burst=\"burst-research-7\"]').click()")
        await page.wait_for_timeout(1500)
        
        # 获取卡片信息
        info = await page.evaluate("""function() {
            const stage = document.getElementById('burst-research-7');
            const cards = stage.querySelectorAll('.burst-card');
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const result = [];
            cards.forEach(function(c, i) {
                const r = c.getBoundingClientRect();
                const s = c.style;
                result.push({
                    i: i, 
                    leftPct: s.left,
                    topPct: s.top,
                    x: Math.round(r.x),
                    y: Math.round(r.y),
                    w: Math.round(r.width),
                    h: Math.round(r.height),
                    right: Math.round(r.right),
                    bottom: Math.round(r.bottom),
                    exceedsRight: r.right > vw,
                    exceedsBottom: r.bottom > vh
                });
            });
            return {vw: vw, vh: vh, cards: result};
        }""")
        
        print(f"视口: {info['vw']}x{info['vh']}")
        print("=" * 70)
        for c in info['cards']:
            flag = ""
            if c['exceedsRight']: flag += "→"
            if c['exceedsBottom']: flag += "↓"
            print(f"卡片{c['i']}: left={c['leftPct']:>7} top={c['topPct']:>7} | 实际位置({c['x']:>4},{c['y']:>4}) 尺寸({c['w']}x{c['h']}) | 右侧{c['right']} 底部{c['bottom']} {flag}")
        
        await browser.close()

asyncio.run(main())
