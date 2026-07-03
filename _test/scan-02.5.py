import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution-architecture.html", wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(3000)
        n = await page.evaluate("document.querySelectorAll('.slide').length")
        print(f"slides: {n}")
        for i in range(n):
            await page.evaluate(f"""
                const s = document.querySelectorAll('.slide');
                s.forEach(x => x.classList.remove('active'));
                if (s.length >= {i+1}) s[{i}].classList.add('active');
            """)
            await page.wait_for_timeout(400)
            await page.screenshot(path=f"_test/02.5-s{i+1}.png", full_page=False)
            print(f"  📸 slide {i+1}")
        await browser.close()

asyncio.run(main())
