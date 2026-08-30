import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {extname, relative, resolve, sep} from 'node:path';
import {createRequire} from 'node:module';
import {categories} from './taxonomy.mjs';

// Install playwright locally or provide its package directory through NODE_PATH.
export async function validateBrowser(root, files) {
 const require = createRequire(import.meta.url);
 const {chromium} = require('playwright');
 const server = createServer((req,res)=> {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const path = resolve(root, '.'+ (pathname==='/'?'/index.html':pathname));
  if (!path.startsWith(root+sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', ({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp'})[extname(path)] || 'application/octet-stream'); res.end(readFileSync(path)); }
  catch { res.writeHead(404).end(); }
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try {
  browser=await chromium.launch({headless:true, ...(process.env.BENCHVALE_BROWSER_CHANNEL ? {channel:process.env.BENCHVALE_BROWSER_CHANNEL} : {})});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const go = path=>page.goto(base+path);
  const visible = ()=>page.locator('[data-product-card]:visible').count();
  const overflow = async(label)=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Horizontal overflow: ${label}`);
  await go('products.html');
  const inventory=await page.locator('[data-product-card]').evaluateAll(cards=>cards.map(c=>({category:c.dataset.category,search:c.dataset.search})));
  for (const category of categories) {
   for(const search of ['', 'vial','zz-no-match']) {
    await go(`products.html?category=${category.anchor}&search=${search}`);
    const count=inventory.filter(c=>c.category===category.anchor&&c.search.includes(search)).length;
    assert.equal(await visible(), count, `${category.name} + ${search}`);
    assert.equal(await page.locator(`[data-product-filter="${category.anchor}"]`).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-product-filter][aria-pressed="true"]').count(),1);
    assert.equal(await page.locator('#productSearchStatus').textContent(),`Showing ${count} ${count===1?'product':'products'}`);
    assert.equal(await page.locator('#catalogueEmpty').isVisible(),count===0);
    assert(await page.evaluate(()=>scrollY>0),'Catalogue URL must position results');
   }
  }
  await go('products.html?search=vial');assert.equal(await visible(),inventory.filter(c=>c.search.includes('vial')).length);
  await go('products.html?category=invalid');assert.equal(await visible(),14);
  await page.locator('[data-product-filter="general-lab"]').click();assert.equal(await visible(),3);
  await page.locator('#productSearch').fill('vortex');assert.equal(await visible(),1);
  await go('index.html');
  const expected=[...categories.map(c=>c.navLabel),'Services','Promotions','About','Contact'];
  assert.deepEqual(await page.locator('.category-nav-label > a').allTextContents(),expected);
  for (const c of categories) {
   const item=page.locator('.category-nav-item').filter({has:page.locator(`#mega-${c.anchor}`)});
   await item.locator('.category-nav-label > a').hover();
   assert(await page.locator(`#mega-${c.anchor}`).isVisible());
   assert.equal(await item.locator('button').getAttribute('aria-expanded'),'true');
   await overflow('desktop mega '+c.anchor);
   await page.locator('#homeSearch').hover();
   assert(!(await page.locator(`#mega-${c.anchor}`).isVisible()));
   await item.locator('.category-nav-label > a').focus();
   assert(await page.locator(`#mega-${c.anchor}`).isVisible(),'Focus opens menu');
   await page.keyboard.press('Tab');assert(await item.locator('button').evaluate(e=>e===document.activeElement));
   await page.keyboard.press('Tab');assert(await page.locator(`#mega-${c.anchor}`).evaluate(e=>e.contains(document.activeElement)));
   await page.keyboard.press('Escape');assert(!(await page.locator(`#mega-${c.anchor}`).isVisible()));
  }
  await Promise.all([page.waitForURL('**/products.html?category=chromatography'),page.locator('.category-nav-label > a').nth(1).click()]);await page.waitForLoadState('load');
  assert.equal(new URL(page.url()).searchParams.get('category'),'chromatography');assert.equal(await visible(),2);
  await go('index.html');
  await page.locator('#homeSearch').fill('vial');await Promise.all([page.waitForURL('**/products.html?search=vial'),page.locator('.category-search button').click()]);await page.waitForLoadState('load');
  assert.equal(new URL(page.url()).searchParams.get('search'),'vial');assert((await visible())>0);
  await go('index.html');
  const active=()=>page.locator('.home-slide.is-active').evaluate(e=>[...e.parentNode.children].indexOf(e));
  const first=await active();await page.locator('.home-slider-next').click();assert.notEqual(await active(),first);
  await page.locator('.home-slider-prev').click();assert.equal(await active(),first);
  await page.locator('.home-slider-dots button').nth(2).click();assert.equal(await active(),2);
  await page.waitForFunction(()=>!document.querySelectorAll('.home-slide')[2].classList.contains('is-active'),{},{timeout:7000});
  for(const width of [320,375,768,1024,1279]) {
   await page.setViewportSize({width,height:900});await go('index.html');
   await page.locator('#navToggle').click();
   assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'),'true');
   for (const c of categories) {
    const button=page.locator(`[aria-controls="mega-${c.anchor}"]`);
    await button.click();assert(await page.locator(`#mega-${c.anchor}`).isVisible());
    assert.equal(await button.getAttribute('aria-expanded'),'true');
    await overflow(`mobile menu ${width} ${c.anchor}`);
    await button.click();assert(!(await page.locator(`#mega-${c.anchor}`).isVisible()));
   }
   await Promise.all([page.waitForURL('**/products.html?category=chromatography'),page.locator('.category-nav-label > a').nth(1).click()]);await page.waitForLoadState('load');assert.equal(await visible(),2);
  }
  const touchContext=await browser.newContext({viewport:{width:375,height:900},isMobile:true,hasTouch:true});
  const touch=await touchContext.newPage();
  await touch.goto(base+'index.html');await touch.locator('#navToggle').tap();
  const disclosure=touch.locator('[aria-controls="mega-sample-preparation"]');
  await disclosure.tap();assert.equal(await disclosure.getAttribute('aria-expanded'),'true');
  await Promise.all([touch.waitForURL('**/products/syringe-filters.html'), touch.locator('#mega-sample-preparation a').first().tap()]);await touch.waitForLoadState('load');
  assert(new URL(touch.url()).pathname.endsWith('/products/syringe-filters.html'));
  await touchContext.close();
  // Scan each page at mobile, tablet, desktop, breakpoint edges, and wide desktop.
  for (const width of [320,375,480,768,1024,1279,1280,1440,1920]) {
   await page.setViewportSize({width,height:1000});
   for(const file of files) {
    const path=relative(root,file).split(sep).join('/');await go(path);await overflow(`${path} at ${width}`);
    assert.equal(await page.locator('#primaryNav').count(),1);
   }
  }
  if(process.env.BENCHVALE_SCREENSHOT_DIR) {
   await page.setViewportSize({width:1440,height:1000});await go('index.html');
   await page.locator('[aria-controls="mega-general-lab"]').hover();
   await page.screenshot({path:resolve(process.env.BENCHVALE_SCREENSHOT_DIR,'desktop-navigation.png')});
   await page.setViewportSize({width:375,height:1000});await go('index.html');await page.locator('#navToggle').click();await page.locator('[aria-controls="mega-chromatography"]').click();
   await page.screenshot({path:resolve(process.env.BENCHVALE_SCREENSHOT_DIR,'mobile-navigation.png')});
  }
  assert.deepEqual(errors,[],'Browser JS errors');
  console.log('PASS browser: category + search, counts, empty states, hover/focus/Escape, mobile accordion, parent links, homepage search, carousel, all pages at 320–1920px.');
 } finally { await browser?.close();await new Promise(r=>server.close(r)); }
}
