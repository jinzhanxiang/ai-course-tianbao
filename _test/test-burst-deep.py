#!/usr/bin/env python3
"""
深度测试 burst video 弹窗。
- 点击 → 等 3 秒 → 截图 → 看真效果
"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

BURST_LIST = [
    ("02-revolution", "burst-video-neural", "neural"),
    ("02-revolution", "burst-video-maindash", "maindash"),
    ("02-revolution", "burst-revolution-team", "revolution-team"),
    ("14-demo", "burst-demo-5", "demo-5"),
    ("01-opening", "burst-main", "main"),
    ("01-opening", "burst-5plus2plus1", "5plus2plus1"),
    ("01-opening", "burst-1platform", "1platform"),
    ("01-opening", "burst-case-xingheng", "case-xingheng"),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        # 收集 console errors
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.on("console", lambda m: errs.append(f"[{m.type}] {m.text}") if m.type == "error" else None)
        results = []
        for ch, bid, name in BURST_LIST:
            print(f"🔍 {ch} | {bid}")
            await page.goto(f"https://jinzhanxiang.github.io/ai-course-tianbao/chapters/{ch}.html", wait_until="domcontentloaded", timeout=25000)
            await page.wait_for_timeout(2500)
            # 点击
            await page.evaluate(f"""
                () => {{
                    const el = document.querySelector('[data-burst="{bid}"]');
                    if (el) el.click();
                }}
            """)
            await page.wait_for_timeout(3000)
            # 检查 stage 内容
            info = await page.evaluate("""
                () => {
                    const stage = document.querySelector('.burst-stage, .burst-modal-stage, [class*="burst"][class*="stage"]');
                    if (!stage) return { found: false };
                    const cs = getComputedStyle(stage);
                    const html = stage.innerHTML.slice(0, 500);
                    return {
                        found: true,
                        display: cs.display,
                        visibility: cs.visibility,
                        opacity: cs.opacity,
                        class: stage.className,
                        children: stage.children.length,
                        html: html,
                        has_iframe: !!stage.querySelector('iframe'),
                        iframe_src: (stage.querySelector('iframe') || {}).src || '',
                        has_video: !!stage.querySelector('video'),
                        video_src: (stage.querySelector('video') || {}).src || '',
                        has_img: !!stage.querySelector('img'),
                        img_src: (stage.querySelector('img') || {}).src || '',
                    };
                }
            """)
            print(f"   → {info}")
            # 截图
            try:
                await page.screenshot(path=f"_test/burst-{name}.png")
            except:
                pass
            # 关闭
            await page.evaluate("() => { document.querySelectorAll('[class*=\"burst-stage\"], [class*=\"burst-modal\"]').forEach(e => e.remove()); document.body.style.overflow=''; }")
            await page.wait_for_timeout(300)
            results.append({"ch": ch, "burst": bid, "info": info})
        await browser.close()
        if errs:
            print("\n=== Console errors ===")
            for e in errs[:20]: print("  ", e[:150])
        out = Path("_test/burst-deep.json")
        out.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        print(f"\n💾 {out}")

asyncio.run(main())
