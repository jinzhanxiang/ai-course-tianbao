#!/usr/bin/env python3
"""
测试所有 burst-trigger 是否能正常弹出。
策略：
  1. 打开每个章节
  2. 找所有 .burst-trigger，依次点击
  3. 等待 0.5s，检测 .burst-overlay.show 是否存在
  4. 记录成功/失败 + 触发器位置
"""
import asyncio
import json
import os
import re
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
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
    except Exception as e:
        results[ch] = {"error": f"goto fail: {e}"}
        return
    await page.wait_for_timeout(2500)
    # 找所有 burst-trigger
    triggers = await page.evaluate("""
        () => Array.from(document.querySelectorAll('.burst-trigger')).map(el => ({
            burst: el.dataset.burst || '',
            text: (el.innerText || '').trim().slice(0, 50),
            tag: el.tagName,
        }))
    """)
    if not triggers:
        results[ch] = {"n_triggers": 0}
        return
    tested = []
    seen_burst = set()
    for t in triggers:
        bid = t["burst"]
        if not bid or bid in seen_burst:
            continue
        seen_burst.add(bid)
        # 点击触发器
        try:
            await page.evaluate(f"""
                () => {{
                    const el = document.querySelector('[data-burst="{bid}"]');
                    if (el) el.click();
                }}
            """)
            await page.wait_for_timeout(800)
            # 检查 burst overlay 是否出现
            state = await page.evaluate("""
                () => {
                    const o = document.querySelector('.burst-overlay, .burst-stage, [class*="burst"][class*="overlay"]');
                    const body = document.body.innerHTML;
                    return {
                        has_overlay: !!o,
                        overlay_class: o ? o.className : '',
                        overlay_visible: o ? (o.classList.contains('show') || o.classList.contains('active') || getComputedStyle(o).display !== 'none') : false,
                        has_video: !!document.querySelector('.burst-video, video.burst-video, .burst-stage video'),
                        has_terminal: !!document.querySelector('.burst-terminal, .burst-stage iframe'),
                        has_poster: !!document.querySelector('.burst-poster, .burst-stage img'),
                        overlay_text: o ? (o.innerText || '').slice(0, 200) : '',
                    };
                }
            """)
            tested.append({
                "burst": bid,
                "trigger_text": t["text"],
                **state,
            })
            # 关闭弹窗
            await page.evaluate("""
                () => {
                    const o = document.querySelector('.burst-overlay, .burst-stage');
                    if (o) o.classList.remove('show', 'active');
                    document.body.style.overflow = '';
                    // 模拟 ESC
                    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape'}));
                }
            """)
            await page.wait_for_timeout(300)
        except Exception as e:
            tested.append({"burst": bid, "error": str(e)})
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
            if "error" in r:
                print(f"❌ {r['error']}")
            elif r.get("n_triggers", 0) == 0:
                print("⏭️ 0 triggers")
            else:
                ok = sum(1 for t in r["tested"] if t.get("has_overlay") or t.get("has_video") or t.get("has_terminal") or t.get("has_poster"))
                print(f"{ok}/{len(r['tested'])} burst OK")
        await browser.close()
    out = Path("/Users/jinzhanxiang/Documents/OpenClaw-Workspace-projects/智能体内训课件/_test/burst-test-result.json")
    out.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print(f"\n💾 saved → {out}")

asyncio.run(main())
