import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/01-opening.html", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)
        
        # 检查加载的 burst.js
        info = await page.evaluate("""function() {
            const scripts = Array.from(document.scripts).map(s => s.src);
            const burstScript = scripts.find(s => s.includes('burst'));
            return {scripts, burstScript};
        }""")
        print("脚本:", info['burstScript'])
        
        # 检查 CDN 上的 burst.js 内容
        cdn_content = await page.evaluate("""async function() {
            const r = await fetch('https://jinzhanxiang.github.io/ai-course-tianbao/assets/js/burst.js');
            const t = await r.text();
            const m = t.match(/starRadius = (count <= 3 \\? 32 : \\(count <= 5 \\? 30 : 26\\))|starRadius = 38/);
            return m ? m[0] : 'not found';
        }""")
        print(f"CDN starRadius 代码: {cdn_content}")
        
        # 点击触发
        await page.evaluate("document.querySelector('[data-burst=\"burst-research-7\"]').click()")
        await page.wait_for_timeout(2500)
        
        cards = await page.evaluate("""function() {
            const stage = document.getElementById('burst-research-7');
            const cards = stage.querySelectorAll('.burst-card');
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            return Array.from(cards).map(function(c) {
                const r = c.getBoundingClientRect();
                return {right: Math.round(r.right), bottom: Math.round(r.bottom), exceeds: r.right > vw || r.bottom > vh};
            });
        }""")
        ok = sum(1 for c in cards if not c['exceeds'])
        print(f"卡片数: {len(cards)}, OK: {ok}/{len(cards)}")
        
        await browser.close()

asyncio.run(test())
