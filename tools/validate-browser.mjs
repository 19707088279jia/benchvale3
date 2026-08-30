import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {extname, relative, resolve, sep} from 'node:path';
import {createRequire} from 'node:module';
import {categories, familyUrl, directoryUrl} from './taxonomy.mjs';
import {header} from './site-navigation.mjs';

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
  const checkCategory = async category => {
    assert.equal(await page.locator('main h1').textContent(),category.name);
    assert.equal(await page.locator('main h1').count(),1);
    assert.equal(await page.locator('.category-family-card').count(),category.families.length);
    assert.equal(await page.locator('.category-families > h2').textContent(),'Product Families');
    assert.equal(await page.locator('main section').count(),2,'Only category intro and families sections');
    assert.equal(await page.locator('main .category-support a').count(),5);
    assert.equal(await page.locator('main .category-breadcrumb [aria-current="page"]').textContent(),category.name);
    assert.equal(await page.locator('main .products-hero, main .storefront-category-section, main .catalogue-section, main .catalogue-help, main [data-product-card], main .catalogue-toolbar, main .cta-band').count(),0,'General catalogue body must be removed');
    assert.equal(await page.locator('template').count(),0);
    assert(!(await page.locator('main').innerText()).includes('Browse all products'));
    assert(await page.locator('.header-quote-cart').isVisible());
    assert(await page.locator('.header-quote').isVisible());
    assert(await page.locator('.site-footer').isVisible());
    assert(await page.evaluate(()=>document.querySelector('.category-families')===document.querySelector('.category-content').lastElementChild));
    const ids=await page.locator('[id]').evaluateAll(elements=>elements.map(e=>e.id));assert.equal(new Set(ids).size,ids.length);
  };
  for (const category of categories) {
   for(const suffix of ['', '&search=vial']) {
    await go(`products.html?category=${category.anchor}${suffix}`);
    await checkCategory(category);
    assert(await page.evaluate(()=>scrollY===0),'Category pages start at their breadcrumb and intro');
   }
   for(const family of category.families) {
    const destination=familyUrl(category,family);
    assert.equal(await page.locator('.category-family-card').filter({has:page.getByRole('heading',{name:family.name,exact:true})}).getAttribute('href'),destination);
   }
  }
  // Families without detail pages open the general catalogue, retaining category + search.
  for (const category of categories) for(const family of category.families) {
   const response=await go(familyUrl(category,family));assert(response.ok());
   if(family.page) { assert(await page.locator('[data-add-to-quote]').isVisible()); }
   else {
    const count=inventory.filter(c=>c.category===category.anchor&&c.search.includes(family.search)).length;
    assert.equal(await visible(),count,`${category.name} / ${family.name}`);
    assert.equal(await page.locator(`[data-product-filter="${category.anchor}"]`).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#productSearchStatus').textContent(),`Showing ${count} ${count===1?'product':'products'}`);
    assert.equal(await page.locator('#catalogueEmpty').isVisible(),count===0);
   }
  }
  for (const category of categories) {
   await go(`products.html?filter=${category.anchor}&search=zz-no-match`);assert.equal(await visible(),0);
   assert(await page.locator('#catalogueEmpty').isVisible());
  }
  await go('products.html?search=vial');assert.equal(await visible(),inventory.filter(c=>c.search.includes('vial')).length);
  await go('products.html?category=invalid');assert.equal(await page.locator('main h1').textContent(),'Category not found');assert.equal(await visible(),0);
  await go('products.html');assert.equal(await visible(),14);
  await page.locator('[data-product-filter="general-lab"]').click();assert.equal(await visible(),3);
  await page.locator('#productSearch').fill('vortex');assert.equal(await visible(),1);
  const analytical = categories.find(c=>c.anchor==='analytical');
  const directoryTopics = analytical.groups.flatMap(group=>group.items);
  await go('index.html');
  const directory = page.locator('#mega-analytical');
  await page.locator('[aria-controls="mega-analytical"]').hover();
  assert.equal(await directory.locator('.mega-intro, .mega-families').count(),0);
  assert(!(await directory.innerText()).includes('No product families are currently listed.'));
  assert.deepEqual(await directory.locator('h3').allTextContents(),analytical.groups.map(group=>group.name));
  assert.deepEqual(await directory.locator('.mega-group a').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),directoryTopics.map(topic=>directoryUrl(analytical,topic)));
  assert.equal(await directory.locator('.mega-view-all').getAttribute('href'),'products.html?category=analytical');
  // Change only taxonomy objects in memory, then use the production renderer.
  // This proves new groups require no column assignments, wrappers, or CSS edits.
  const originalGroups = analytical.groups;
  try {
    for (const [width, columns] of [[320,1],[767,1],[768,2],[1024,2],[1279,2],[1280,3],[1440,3],[1920,3]]) {
      await page.setViewportSize({width,height:1000});await go('index.html');
      if(width<1280) {
        await page.locator('#navToggle').click();
        await page.locator('[aria-controls="mega-analytical"]').click();
      } else await page.locator('[aria-controls="mega-analytical"]').hover();
      for (const count of [3,4,6,8]) {
        analytical.groups = originalGroups.slice(0,count);
        while(analytical.groups.length<count) analytical.groups.push({name:`Validation group ${analytical.groups.length+1}`,items:[{name:'Density Meters',search:'density'}]});
        await directory.evaluate((panel, renderedHeader)=>{
          const parsed=new DOMParser().parseFromString(renderedHeader,'text/html');
          panel.replaceChildren(...parsed.querySelector('#mega-analytical').childNodes);
        }, header());
        assert.equal(await directory.locator('.mega-group-grid > section.mega-group').count(),count);
        const layout=await directory.evaluate(panel=>{
          const grid=panel.querySelector('.mega-group-grid');const style=getComputedStyle(grid);
          const groups=[...grid.children].map(group=>{const r=group.getBoundingClientRect();return {x:r.x,y:r.y,bottom:r.bottom};});
          const g=grid.getBoundingClientRect(),p=panel.getBoundingClientRect();
          return {groups,columns:style.gridTemplateColumns.split(' ').length,gap:style.columnGap,rowGap:style.rowGap,width:g.width,center:g.x+g.width/2,panelCenter:p.x+p.width/2};
        });
        assert.equal(layout.columns,columns);
        assert.equal(layout.gap,'56px');assert.equal(layout.rowGap,'28px');
        assert.equal(new Set(layout.groups.map(g=>Math.round(g.y))).size,Math.ceil(count/columns));
        for(let i=0;i<count;i++) {
          if(i%columns) assert(Math.abs(layout.groups[i].y-layout.groups[i-1].y)<1,'Groups share a row until all columns are occupied');
          if(i>=columns) {
            assert(Math.abs(layout.groups[i].x-layout.groups[i%columns].x)<1,'Groups auto-place in column order');
            assert(layout.groups[i].y>=layout.groups[i-columns].bottom+27,'Next row follows previous row with the requested gap');
          }
        }
        assert(layout.width<=1160);assert(Math.abs(layout.center-layout.panelCenter)<1,'Directory content is centered in the panel');
        await overflow(`${count} groups at ${width}`);
      }
    }
  } finally { analytical.groups=originalGroups; }
  // Another category can opt in without changes to the renderer; families still work.
  const chromatography=categories.find(c=>c.anchor==='chromatography');
  const previousGroups=chromatography.groups;
  try {
    chromatography.groups=[{name:'Validation group',items:[{name:'Vials',search:'vial'}]}];
    const result=await page.evaluate(rendered=>{
      const parsed=new DOMParser().parseFromString(rendered,'text/html');
      const panel=parsed.querySelector('#mega-chromatography');
      return {groups:panel.querySelectorAll('.mega-group').length,href:panel.querySelector('.mega-group a').getAttribute('href'),familyFallback:!!parsed.querySelector('#mega-general-lab .mega-families')};
    },header('../'));
    assert.deepEqual(result,{groups:1,href:'../products.html?category=chromatography&search=vial',familyFallback:true});
  } finally {
    if(previousGroups===undefined) delete chromatography.groups; else chromatography.groups=previousGroups;
  }
  await page.setViewportSize({width:1440,height:1000});await go('index.html');
  for (const width of [1280,1440,1920]) {
    await page.setViewportSize({width,height:800});
    await page.locator('[aria-controls="mega-analytical"]').hover();
    assert.equal(await directory.locator('.mega-group-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3);
    await overflow(`Analytical directory at ${width}`);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('[aria-controls="mega-analytical"]').hover();
  await Promise.all([page.waitForURL('**/products.html?category=analytical&search=density'),directory.getByRole('link',{name:'Density Meters',exact:true}).click()]);
  await page.waitForLoadState('load');await checkCategory(analytical);
  assert.equal(new URL(page.url()).searchParams.get('search'),'density');
  for (const topic of directoryTopics) {
    const response=await go(directoryUrl(analytical,topic));assert(response.ok());
    assert.equal(await page.locator('main h1').textContent(),'Analytical');
  }
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
  assert.equal(new URL(page.url()).searchParams.get('category'),'chromatography');await checkCategory(categories.find(c=>c.anchor==='chromatography'));
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
   await Promise.all([page.waitForURL('**/products.html?category=chromatography'),page.locator('.category-nav-label > a').nth(1).click()]);await page.waitForLoadState('load');await checkCategory(categories.find(c=>c.anchor==='chromatography'));
  }
  const touchContext=await browser.newContext({viewport:{width:375,height:900},isMobile:true,hasTouch:true});
  const touch=await touchContext.newPage();
  await touch.goto(base+'index.html');await touch.locator('#navToggle').tap();
  const disclosure=touch.locator('[aria-controls="mega-sample-preparation"]');
  await disclosure.tap();assert.equal(await disclosure.getAttribute('aria-expanded'),'true');
  await Promise.all([touch.waitForURL('**/products/syringe-filters.html'), touch.locator('#mega-sample-preparation a').first().tap()]);await touch.waitForLoadState('load');
  assert(new URL(touch.url()).pathname.endsWith('/products/syringe-filters.html'));
  await touchContext.close();
  await page.setViewportSize({width:1440,height:1000});
  await go('products/2ml-autosampler-vial.html');
  await page.locator('[data-add-to-quote]').click();
  assert.equal(await page.locator('[data-quote-count]').textContent(),'1');
  await go('products.html?category=chromatography');
  assert.equal(await page.locator('[data-quote-count]').textContent(),'1');
  await Promise.all([page.waitForURL('**/quote.html'),page.locator('.header-quote-cart').click()]);await page.waitForLoadState('load');
  assert.equal(await page.locator('input[name="product[]"]').first().inputValue(),'2 mL HPLC/GC Autosampler Vial');
  await page.locator('#clearQuoteProducts').click();assert.equal(await page.locator('[data-quote-count]').textContent(),'0');
  await go('products.html?category=analytical');
  await Promise.all([page.waitForURL('**/quote.html'),page.locator('.category-support .btn').click()]);await page.waitForLoadState('load');assert(await page.locator('#quoteForm').isVisible());
  // Scan each page at mobile, tablet, desktop, breakpoint edges, and wide desktop.
  for (const width of [320,375,480,768,1024,1279,1280,1440,1920]) {
   await page.setViewportSize({width,height:1000});
   for(const file of files) {
    const path=relative(root,file).split(sep).join('/');await go(path);await overflow(`${path} at ${width}`);
    assert.equal(await page.locator('#primaryNav').count(),1);
   }
   for (const category of categories) {
    await go(`products.html?category=${category.anchor}`);await checkCategory(category);await overflow(`${category.anchor} at ${width}`);
    if(width>=1280) {
      const boxes=await page.evaluate(()=>Object.fromEntries(['.category-support','.category-intro','.category-families','.category-nav','.category-nav-list'].map(selector=>{const b=document.querySelector(selector).getBoundingClientRect();return [selector,{x:b.x,y:b.y,width:b.width,right:b.right}];})));
      assert(boxes['.category-intro'].x>boxes['.category-support'].right);
      assert.equal(boxes['.category-intro'].x,boxes['.category-families'].x);
      assert(boxes['.category-nav'].x>=24 && boxes['.category-nav'].right<=width-24);
      assert(boxes['.category-nav'].width<=1480);
    }
   }
  }
  if(process.env.BENCHVALE_SCREENSHOT_DIR) {
   await page.setViewportSize({width:1440,height:1000});await go('products.html?category=general-lab');
   await page.screenshot({path:resolve(process.env.BENCHVALE_SCREENSHOT_DIR,'category-desktop.png')});
   await page.setViewportSize({width:375,height:1000});await go('products.html?category=chromatography');
   await page.screenshot({path:resolve(process.env.BENCHVALE_SCREENSHOT_DIR,'category-mobile.png')});
   await page.setViewportSize({width:1440,height:900});await go('index.html');await page.locator('[aria-controls="mega-analytical"]').hover();
   await page.screenshot({path:resolve(process.env.BENCHVALE_SCREENSHOT_DIR,'analytical-directory-desktop.png')});
   await page.setViewportSize({width:375,height:900});await go('index.html');await page.locator('#navToggle').click();await page.locator('[aria-controls="mega-analytical"]').click();
   await page.screenshot({path:resolve(process.env.BENCHVALE_SCREENSHOT_DIR,'analytical-directory-mobile.png')});
  }
  assert.deepEqual(errors,[],'Browser JS errors');
  console.log('PASS browser: seven category landing pages, family destinations, catalogue filters/search, Quote Cart, quote form, mega menus, keyboard/touch navigation, carousel, all pages and categories at 320–1920px.');
 } finally { await browser?.close();await new Promise(r=>server.close(r)); }
}
