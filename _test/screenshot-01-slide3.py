"""
专注截 01 slide 3 + 02.5 全部 + 02 slide 1
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "https://jinzhanxiang.github.io/ai-course-tianbao/chapters/"
OUT = Path("/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/_test")
OUT.mkdir(exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()

        # 1) 01-opening slide 3（投资岗视角）
        print("=== 01-opening slide 3 (投资岗视角) ===")
        await page.goto(BASE + "01-opening.html", wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(3000)
        # 切到 slide 3
        await page.evaluate("""
            const slides = document.querySelectorAll('.slide');
            slides.forEach(s => s.classList.remove('active'));
            if (slides.length >= 3) slides[2].classList.add('active');
        """)
        await page.wait_for_timeout(1000)
        await page.screenshot(path=str(OUT / "01-slide3.png"), full_page=False)
        print(f"📸 01-slide3.png")

        # 检测 role-card 实际渲染
        cards = await page.query_selector_all(".role-card")
        for i, c in enumerate(cards):
            rect = await c.evaluate("""(el) => {
                const r = el.getBoundingClientRect();
                const cs = window.getComputedStyle(el);
                return {top: r.top, bottom: r.bottom, height: r.height, width: r.width, left: r.left,
                        display: cs.display, padding: cs.padding, margin: cs.margin, fontSize: cs.fontSize,
                        background: cs.backgroundColor};
            }""")
            print(f"  role-card {i+1}: top={rect['top']:.0f} bottom={rect['bottom']:.0f} h={rect['height']:.0f} w={rect['width']:.0f}")
            print(f"    padding={rect['padding']} margin={rect['margin']} font={rect['fontSize']} bg={rect['background']}")

        # 2) 02-revolution-architecture slide 2 (5 大 Agent)
        print("\n=== 02.5 slide 2 (5 Agent) ===")
        await page.goto(BASE + "02-revolution-architecture.html", wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(3000)
        await page.evaluate("""
            const slides = document.querySelectorAll('.slide');
            slides.forEach(s => s.classList.remove('active'));
            if (slides.length >= 2) slides[1].classList.add('active');
        """)
        await page.wait_for_timeout(1000)
        await page.screenshot(path=str(OUT / "02.5-slide2.png"), full_page=False)
        print(f"📸 02.5-slide2.png")

        # 检测 5 大 Agent 卡片渲染
        cards = await page.query_selector_all(".card")
        print(f"  .card 数量: {len(cards)}")
        for i, c in enumerate(cards):
            rect = await c.evaluate("""(el) => {
                const r = el.getBoundingClientRect();
                const cs = window.getComputedStyle(el);
                return {top: r.top, bottom: r.bottom, height: r.height, width: r.width, padding: cs.padding};
            }""")
            print(f"  .card {i+1}: top={rect['top']:.0f} bottom={rect['bottom']:.0f} h={rect['height']:.0f} w={rect['width']:.0f} pad={rect['padding']}")

        # 3) 02-revolution slide 1 (10 张卡片最大章)
        print("\n=== 02-revolution slide 1 ===")
        await page.goto(BASE + "02-revolution.html", wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(3000)
        await page.screenshot(path=str(OUT / "02-slide1.png"), full_page=False)
        print(f"📸 02-slide1.png")

        await browser.close()

asyncio.run(main())