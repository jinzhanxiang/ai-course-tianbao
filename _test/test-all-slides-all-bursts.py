#!/usr/bin/env python3
"""模拟翻到每张 slide，看每个 burst 是否能弹"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"PAGE: {e}"))
        results = []
        # 测关键章节的所有 slide
        tests = [
            ("02-revolution", 7),
            ("01-opening", 4),
            ("04-project", 5),
        ]
        for ch, n_slides in tests:
            print(f"\n📖 {ch}")
            await page.goto(f"https://jinzhanxiang.github.io/ai-course-tianbao/chapters/{ch}.html", wait_until="domcontentloaded", timeout=25000)
            await page.wait_for_timeout(2500)
            for slide_i in range(n_slides):
                # 激活 slide
                await page.evaluate(f"""
                    () => {{
                        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
                        const slides = document.querySelectorAll('.slide');
                        if (slides.length > {slide_i}) {{
                            slides[{slide_i}].classList.add('active');
                            slides[{slide_i}].style.display = 'block';
                            slides[{slide_i}].style.opacity = '1';
                        }}
                    }}
                """)
                await page.wait_for_timeout(500)
                # 找该 slide 的 burst-trigger
                triggers = await page.evaluate(f"""
                    () => {{
                        const slides = document.querySelectorAll('.slide');
                        if (slides.length <= {slide_i}) return [];
                        const s = slides[{slide_i}];
                        return Array.from(s.querySelectorAll('.burst-trigger')).map(t => ({{
                            burst: t.dataset.burst,
                            text: (t.innerText || '').trim().slice(0, 30),
                        }}));
                    }}
                """)
                if not triggers: continue
                for t in triggers:
                    bid = t["burst"]
                    # 模拟点击
                    await page.evaluate(f"""
                        () => {{
                            const el = document.querySelector('[data-burst="{bid}"]');
                            if (el) el.click();
                        }}
                    """)
                    await page.wait_for_timeout(2500)
                    s = await page.evaluate(f"""
                        () => {{
                            const st = document.getElementById('{bid}');
                            if (!st) return 'missing';
                            const iframe = st.querySelector('iframe');
                            return {{
                                show: st.classList.contains('show'),
                                opacity: getComputedStyle(st).opacity,
                                display: getComputedStyle(st).display,
                                hasIframe: !!iframe,
                                iframeSrc: iframe ? iframe.src : '',
                                hasVideo: !!st.querySelector('video'),
                                videoSrc: (st.querySelector('video') || {{}}).src || '',
                                hasImg: !!st.querySelector('img'),
                            }};
                        }}
                    """)
                    print(f"  Slide {slide_i+1} | {bid} ({t['text'][:25]})")
                    print(f"     {s}")
                    results.append({"ch": ch, "slide": slide_i+1, "burst": bid, **s})
                    # 关闭
                    await page.evaluate(f"() => {{ const s = document.getElementById('{bid}'); if (s) s.classList.remove('show'); }}")
                    await page.wait_for_timeout(200)
        if errs:
            print(f"\n=== Errors ({len(errs)}) ===")
            for e in errs[:10]: print("  ", e[:200])
        out = Path("_test/all-slides-burst.json")
        out.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        await browser.close()

asyncio.run(main())
