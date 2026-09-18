import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { createRequire } from "node:module";

const root = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const path = resolve(root, `.${pathname === "/" ? "/checkout.html" : pathname}`);
  if (!path.startsWith(root + sep)) return response.writeHead(403).end();
  try {
    response.setHeader("Content-Type", contentTypes[extname(path)] || "application/octet-stream");
    response.end(readFileSync(path));
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
let browser;
try {
  browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-features=Vulkan,Dawn,UseSkiaRenderer"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const base = `http://127.0.0.1:${server.address().port}`;

  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/checkout.html`);
    assert.equal(await page.locator("#businessPurchaseConfirmation").isChecked(), false);
    assert.equal(await page.locator("#continueToShopifyCheckout").isDisabled(), true);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      offenders: [...document.querySelectorAll("body *")]
        .map((element) => ({
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}`,
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
        }))
        .filter(({ left, right }) => left < -0.5 || right > window.innerWidth + 0.5)
        .slice(0, 8),
    }));
    assert(
      overflow.scrollWidth <= overflow.viewport,
      `Checkout must not overflow horizontally at ${width}px: ${JSON.stringify(overflow)}`,
    );
    const panel = await page.locator("#shopifyCheckoutForward").boundingBox();
    assert(panel && panel.x >= 0 && panel.x + panel.width <= width + 0.5, `Confirmation panel must fit at ${width}px`);
    await page.locator("#businessPurchaseConfirmation").check();
    assert.equal(await page.locator("#continueToShopifyCheckout").isEnabled(), true);
  }

  for (const width of [1440, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/quote.html`);
    assert.equal(await page.locator("#quoteBusinessPurchase").getAttribute("required"), "");
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `RFQ form must not overflow horizontally at ${width}px`,
    );
  }

  if (process.env.CHROMVALE_SCREENSHOT_DIR) {
    await page.setViewportSize({ width: 375, height: 1000 });
    await page.goto(`${base}/checkout.html`);
    await page.screenshot({ path: resolve(process.env.CHROMVALE_SCREENSHOT_DIR, "checkout-b2b-mobile-verified.png"), fullPage: true });
  }

  console.log("PASS B2B checkout: confirmation is mandatory and the gateway fits desktop, tablet, and mobile viewports.");
} finally {
  await browser?.close();
  await new Promise((closed) => server.close(closed));
}
