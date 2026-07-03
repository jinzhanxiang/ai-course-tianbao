#!/usr/bin/env python3
"""
严格测试 burst 是否真弹出。
检查元素是否真的在 DOM 中且 visible (display !== 'none' && 透明度 > 0)。
"""
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

async def test_chapter(page, ch, results):
    url = BASE + ch + ".html"
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
    except Exception as e:
        results[ch] = {"error": str(e)[:100]}
        return
    await page.wait_for_timeout(3000)
    triggers = await page.evaluate("""
        () => Array.from(document.querySelectorAll('.burst-trigger')).map(el => ({
            burst: el.dataset.burst || '',
            text: (el.innerText || '').trim().slice(0, 40),
        }))
    """)
    if not triggers:
        results[ch] = {"n_triggers": 0}
        return
    tested = []
    seen = set()
    for t in triggers:
        bid = t["burst"]
        if not bid or bid in seen: continue
        seen.add(bid)
        # 触发
        try:
            await page.evaluate(f"""
                () => {{
                    const el = document.querySelector('[data-burst="{bid}"]');
                    if (el) el.click();
                }}
            """)
            await page.wait_for_timeout(1000)
            # 严格检查：找到所有可见的 burst 相关元素
            state = await page.evaluate("""
                () => {
                    // 找所有 burst 相关容器
                    const all = document.querySelectorAll('[class*="burst"]');
                    const visible = [];
                    for (const el of all) {
                        const cs = getComputedStyle(el);
                        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1) continue;
                        if (el.classList.contains('burst-trigger')) continue;
                        const rect = el.getBoundingClientRect();
                        if (rect.width < 50 || rect.height < 50) continue;
                        visible.push({
                            cls: el.className.slice(0, 80),
                            tag: el.tagName,
                            w: Math.round(rect.width),
                            h: Math.round(rect.height),
                            has_video: !!el.querySelector('video'),
                            video_src: (el.querySelector('video') || {}).src || '',
                            has_iframe: !!el.querySelector('iframe'),
                            iframe_src: (el.querySelector('iframe') || {}).src || '',
                            has_img: !!el.querySelector('img'),
                            text: (el.innerText || '').slice(0, 100),
                        });
                    }
                    return { visible_count: visible.length, visible: visible.slice(0, 3) };
                }
            """)
            ok = state["visible_count"] > 0
            tested.append({
                "burst": bid,
                "trigger_text": t["text"],
                "ok": ok,
                **state,
            })
            # 关闭
            await page.evaluate("""
                () => {
                    document.querySelectorAll('[class*="burst-overlay"], [class*="burst-stage"], [class*="burst-modal"]').forEach(el => {
                        el.classList.remove('show', 'active', 'open', 'visible');
                        el.style.display = 'none';
                    });
                    document.body.style.overflow = '';
                }
            """)
            await page.wait_for_timeout(200)
        except Exception as e:
            tested.append({"burst": bid, "error": str(e)[:80]})
    results[ch] = {"n_triggers": len(triggers), "tested": tested}

async def main():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        for ch in CHAPTERS:
            print(f"📖 {ch} ...", end=" ", flush=True)
            await test_chapter(page, ch, results)
            r = results[ch]
            if "error" in r: print(f"❌ {r['error']}")
            elif r.get("n_triggers", 0) == 0: print("⏭️ 0 triggers")
            else:
                ok_n = sum(1 for t in r["tested"] if t.get("ok"))
                fail_n = len(r["tested"]) - ok_n
                print(f"✅{ok_n} ❌{fail_n}/{len(r['tested'])}")
        await browser.close()
    out = Path("/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/_test/burst-strict.json")
    out.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print(f"\n💾 {out}")

asyncio.run(main())
