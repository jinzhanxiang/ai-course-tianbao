import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for w, h in [(390, 844), (1440, 900)]:
            ctx = await browser.new_context(viewport={"width": w, "height": h})
            page = await ctx.new_page()
            await page.goto("file:///Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/chapters/01-opening.html")
            await page.wait_for_timeout(2000)
            
            page.on("pageerror", lambda e: print(f"  JS错误: {e}"))
            
            await page.evaluate("document.querySelector('[data-burst=\"burst-research-7\"]').click()")
            await page.wait_for_timeout(2000)
            
            info = await page.evaluate("""function() {
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const stage = document.getElementById('burst-research-7');
                const container = stage ? stage.querySelector('.burst-cards') : null;
                const layout = container ? container.getAttribute('data-layout') : '?';
                const show = stage ? stage.classList.contains('show') : false;
                const cards = stage ? stage.querySelectorAll('.burst-card') : [];
                const cardInfo = Array.from(cards).map(function(c, i) {
                    const r = c.getBoundingClientRect();
                    return {i: i, right: Math.round(r.right), bottom: Math.round(r.bottom), exceeds: r.right > vw || r.bottom > vh};
                });
                return {show: show, layout: layout, ok: cardInfo.filter(function(x) { return !x.exceeds; }).length, total: cardInfo.length};
            }""")
            
            print(f"{w}x{h}: show={info['show']} layout={info['layout']} | OK {info['ok']}/{info['total']}")
            
            await ctx.close()
        await browser.close()

asyncio.run(test())
