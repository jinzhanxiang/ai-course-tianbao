"""
全面卡片布局审视
- 每个章节截图 + 检测 .card / .agent-card / .role-card 渲染
- 标记 off-screen 卡片
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "https://jinzhanxiang.github.io/ai-course-tianbao/chapters/"
OUT = Path("/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/_test")
OUT.mkdir(exist_ok=True)

CHAPTERS = ["01-opening", "02-revolution-architecture", "02-revolution", "03-main", "04-project",
            "05-research", "06-data", "07-report", "08-ecosystem", "09-case", "10-methodology",
            "11-quality", "12-train", "13-workflow", "14-demo", "15-qa"]

async def scan_chapter(p, chapter):
    browser = await p.chromium.launch(headless=True)
    ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
    page = await ctx.new_page()
    print(f"\n=== {chapter} ===")
    try:
        await page.goto(BASE + chapter + ".html", wait_until="domcontentloaded", timeout=20000)
    except Exception as e:
        print(f"  ⚠️ goto: {e}")
    await page.wait_for_timeout(3000)
    # 切换到每个 slide 看卡片
    n_slides = await page.evaluate("document.querySelectorAll('.slide').length")
    issues = []
    for i in range(n_slides):
        await page.evaluate(f"""
            const slides = document.querySelectorAll('.slide');
            slides.forEach(s => s.classList.remove('active'));
            if (slides.length >= {i+1}) slides[{i}].classList.add('active');
        """)
        await page.wait_for_timeout(300)
        # 检测所有卡片
        cards = await page.query_selector_all(".role-card, .agent-card, .kpi-card, .card, .story-card, .route-card, .case-card")
        for c in cards:
            rect = await c.evaluate("""(el) => {
                const r = el.getBoundingClientRect();
                const cs = window.getComputedStyle(el);
                return {top: r.top, bottom: r.bottom, height: r.height, width: r.width, left: r.left,
                        cls: el.className, padding: cs.padding, bg: cs.backgroundColor, border: cs.border};
            }""")
            off = rect["bottom"] > 1080 or rect["top"] < 0 or rect["width"] < 100
            if off or rect["height"] > 600:  # 只标记可疑的
                issues.append({"slide": i+1, "cls": rect["cls"][:40], "top": rect["top"], "bottom": rect["bottom"], "h": rect["height"], "w": rect["width"]})
        if i == 0:  # 第一张截图
            await page.screenshot(path=str(OUT / f"{chapter}_s1.png"), full_page=False)
    if issues:
        for x in issues[:10]:
            print(f"  ⚠️ slide {x['slide']} {x['cls']}: top={x['top']:.0f} bottom={x['bottom']:.0f} h={x['h']:.0f} w={x['w']:.0f}")
    else:
        print(f"  ✅ {n_slides} slides 全部卡片正常")
    await browser.close()

async def main():
    async with async_playwright() as p:
        for ch in CHAPTERS:
            try:
                await scan_chapter(p, ch)
            except Exception as e:
                print(f"  ❌ {ch}: {e}")

asyncio.run(main())