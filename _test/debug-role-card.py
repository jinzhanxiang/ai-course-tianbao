"""
直接调试 role-card computed style
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()
        await page.goto("https://jinzhanxiang.github.io/ai-course-tianbao/chapters/01-opening.html", wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(3000)
        await page.evaluate("""
            const slides = document.querySelectorAll('.slide');
            slides.forEach(s => s.classList.remove('active'));
            if (slides.length >= 3) slides[2].classList.add('active');
        """)
        await page.wait_for_timeout(1500)
        # 拿所有 role-card 的实际 computed style
        result = await page.evaluate("""() => {
            const cards = document.querySelectorAll('.role-card');
            return Array.from(cards).map(c => {
                const cs = window.getComputedStyle(c);
                return {
                    cls: c.className,
                    padding: cs.padding,
                    paddingTop: cs.paddingTop,
                    paddingLeft: cs.paddingLeft,
                    background: cs.backgroundColor,
                    border: cs.border,
                    borderColor: cs.borderColor,
                    borderRadius: cs.borderRadius,
                    width: cs.width,
                    height: cs.height,
                    minHeight: cs.minHeight,
                };
            });
        }""")
        for i, r in enumerate(result):
            print(f"role-card {i+1}:")
            print(f"  padding: {r['padding']} (top={r['paddingTop']}, left={r['paddingLeft']})")
            print(f"  background: {r['background']}")
            print(f"  border: {r['border']} (color={r['borderColor']})")
            print(f"  borderRadius: {r['borderRadius']}")
            print(f"  w/h/minH: {r['width']}/{r['height']}/{r['minHeight']}")
        # 检查 CSS 是否真的加载
        css_loaded = await page.evaluate("""() => {
            const styles = Array.from(document.styleSheets);
            let role_rules = [];
            for (const sheet of styles) {
                try {
                    for (const rule of sheet.cssRules || []) {
                        if (rule.selectorText && rule.selectorText.includes('role-card')) {
                            role_rules.push({sheet: sheet.href, selector: rule.selectorText, cssText: rule.cssText.substring(0,200)});
                        }
                    }
                } catch(e) {}
            }
            return role_rules;
        }""")
        print(f"\n=== role-card CSS rules loaded ===")
        for r in css_loaded:
            print(f"  {r['selector']} from {r['sheet']}")
            print(f"    {r['cssText'][:150]}")
        await browser.close()

asyncio.run(main())