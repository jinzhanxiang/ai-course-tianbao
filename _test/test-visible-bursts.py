#!/usr/bin/env python3
"""测试可见（视口内）的 burst-trigger 真实点击"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

CHAPTERS = [
    "00-cover", "01-opening", "02-revolution", "02-revolution-architecture",
    "03-main", "04-project", "05-research", "06-data", "07-report",
    "08-ecosystem", "09-case", "10-methodology", "11-quality", "12-train",
    "13-workflow", "14-demo", "15-qa",
]
BASE = "https://jinzhanxiang.github.io/ai-course-tianbao/chapters/"

async def main():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(f"{e}"))
        for ch in CHAPTERS:
            print(f"\n📖 {ch}")
            try:
                await page.goto(BASE + ch + ".html", wait_until="domcontentloaded", timeout=25000)
            except Exception as e:
                results[ch] = {"error": str(e)[:80]}
                continue
            await page.wait_for_timeout(3000)
            # 找所有 slides + 可见 burst-trigger
            slide_info = await page.evaluate("""
                () => {
                    const slides = Array.from(document.querySelectorAll('.slide'));
                    const visible = slides.map((s, i) => {
                        const cs = getComputedStyle(s);
                        const r = s.getBoundingClientRect();
                        return {
                            i, display: cs.display, opacity: cs.opacity,
                            visible: cs.display !== 'none' && parseFloat(cs.opacity) > 0.5,
                            hasActive: s.classList.contains('active'),
                            x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
                            burstCount: s.querySelectorAll('.burst-trigger').length,
                        };
                    });
                    const triggers = Array.from(document.querySelectorAll('.burst-trigger'));
                    const trigInfo = triggers.map(t => {
                        const r = t.getBoundingClientRect();
                        const cs = getComputedStyle(t);
                        return {
                            burst: t.dataset.burst,
                            text: (t.innerText || '').trim().slice(0, 30),
                            inViewport: r.x >= 0 && r.y >= 0 && r.x < 1920 && r.y < 1080,
                            visible: cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.3,
                            w: Math.round(r.width), h: Math.round(r.height),
                        };
                    });
                    return { slides: visible, triggers: trigInfo };
                }
            """)
            # 找 active slide
            active_i = next((s["i"] for s in slide_info["slides"] if s.get("hasActive")), 0)
            print(f"   active slide: {active_i}, slides total: {len(slide_info['slides'])}")
            visible_triggers = [t for t in slide_info["triggers"] if t["inViewport"]]
            print(f"   visible triggers (in viewport): {len(visible_triggers)}")
            failed = []
            for t in slide_info["triggers"]:
                if not t["inViewport"]:
                    failed.append(f"  ❌ {t['burst']} ({t['text']}): 不在视口内 w={t['w']} h={t['h']}")
            for f in failed[:10]: print(f)
            results[ch] = {
                "active_slide": active_i,
                "n_triggers": len(slide_info["triggers"]),
                "n_visible": len(visible_triggers),
                "failed": [{"burst": t["burst"], "text": t["text"]} for t in slide_info["triggers"] if not t["inViewport"]],
            }
        if errs:
            print(f"\n=== Errors ===")
            for e in errs[:5]: print("  ", e[:200])
        out = Path("_test/visible-bursts.json")
        out.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        print(f"\n💾 {out}")
        await browser.close()

asyncio.run(main())
