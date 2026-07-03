"""
快速扫描所有章节 slide 1 + slide 2（高卡片密度）
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "https://jinzhanxiang.github.io/ai-course-tianbao/chapters/"
OUT = Path("/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/_test")

CHAPTERS = ["01-opening", "02-revolution-architecture", "02-revolution", "03-main", "04-project",
            "05-research", "06-data", "07-report", "09-case", "11-quality", "12-train", "13-workflow"]

async def scan_chapter(p, chapter):
    browser = await p.chromium.launch(headless=True)
    ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
    page = await ctx.new_page()
    print(f"\n=== {chapter} ===")
    try:
        await page.goto(BASE + chapter + ".html", wait_until="domcontentloaded", timeout=15000)
    except Exception as e:
        print(f"  ⚠️ goto: {e}")
        await browser.close()
        return
    await page.wait_for_timeout(2500)
    n_slides = await page.evaluate("document.querySelectorAll('.slide').length")
    print(f"  slides: {n_slides}")
    # 只扫每个 slide
    for i in range(n_slides):
        await page.evaluate(f"""
            const slides = document.querySelectorAll('.slide');
            slides.forEach(s => s.classList.remove('active'));
            if (slides.length >= {i+1}) slides[{i}].classList.add('active');
        """)
        await page.wait_for_timeout(150)
        # 只检测卡片
        cards = await page.query_selector_all(".role-card, .agent-card, .kpi-card, .card, .story-card, .route-card")
        for c in cards:
            rect = await c.evaluate("""(el) => {
                const r = el.getBoundingClientRect();
                return {top: r.top, bottom: r.bottom, height: r.height, width: r.width,
                        cls: el.className.split(' ')[0], off_bottom: r.bottom > 1080, off_top: r.top < 0};
            }""")
            if rect["off_bottom"] or rect["off_top"] or rect["height"] > 700 or rect["width"] < 100:
                cls_short = rect["cls"][:30]
                print(f"    ⚠️ slide{i+1} {cls_short}: top={rect['top']:.0f} bot={rect['bottom']:.0f} h={rect['height']:.0f} w={rect['width']:.0f}")
    await browser.close()

async def main():
    async with async_playwright() as p:
        for ch in CHAPTERS:
            try:
                await scan_chapter(p, ch)
            except Exception as e:
                print(f"  ❌ {ch}: {e}")

asyncio.run(main())