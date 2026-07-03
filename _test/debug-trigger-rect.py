#!/usr/bin/env python3
"""Debug 触发器 rect 真的尺寸"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/02-revolution.html", wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(3500)
        info = await page.evaluate("""
            () => {
                const all = Array.from(document.querySelectorAll('.burst-trigger'));
                return all.map(t => {
                    const r = t.getBoundingClientRect();
                    const cs = getComputedStyle(t);
                    const parent = t.parentElement;
                    const pcs = getComputedStyle(parent);
                    const grand = parent.parentElement;
                    const gcs = getComputedStyle(grand);
                    return {
                        burst: t.dataset.burst,
                        text: (t.innerText || '').trim().slice(0, 30),
                        rect: {x: r.x, y: r.y, w: r.width, h: r.height},
                        display: cs.display,
                        opacity: cs.opacity,
                        position: cs.position,
                        parentTag: parent.tagName,
                        parentClass: parent.className.slice(0,80),
                        parentDisplay: pcs.display,
                        parentOpacity: pcs.opacity,
                        grandTag: grand.tagName,
                        grandClass: grand.className.slice(0,80),
                        grandDisplay: gcs.display,
                        grandOpacity: gcs.opacity,
                    };
                });
            }
        """)
        for t in info:
            print(f"\n=== {t['burst']} ({t['text']}) ===")
            print(f"  rect: {t['rect']}, display: {t['display']}, opacity: {t['opacity']}, position: {t['position']}")
            print(f"  parent: <{t['parentTag']} class='{t['parentClass']}'> display={t['parentDisplay']} opacity={t['parentOpacity']}")
            print(f"  grand: <{t['grandTag']} class='{t['grandClass']}'> display={t['grandDisplay']} opacity={t['grandOpacity']}")
        await browser.close()

asyncio.run(main())
