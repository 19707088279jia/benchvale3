import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {extname, relative, resolve, sep} from 'node:path';
import {createRequire} from 'node:module';
import {categories, categoryUrl, familyUrl, directoryItem, directoryUrl} from './taxonomy.mjs';
import {header, splitGroups} from './site-navigation.mjs';

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
  for(const [input,expected] of [
    [[],[[],[],[]]],
    [['A'],[['A'],[],[]]],
    [['A','B'],[['A'],['B'],[]]],
    [['A','B','C','D'],[['A','B'],['C'],['D']]],
    [['A','B','C','D','E'],[['A','B'],['C','D'],['E']]],
    [['A','B','C','D','E','F'],[['A','B'],['C','D'],['E','F']]],
  ]) assert.deepEqual(splitGroups(input,3),expected,'Sequential balanced chunking contract');
  const analytical = categories.find(c=>c.anchor==='analytical');
  const directoryTopics = analytical.groups.flatMap(group=>group.items);
  await go('index.html');
  const directory = page.locator('#mega-analytical');
  const activeColumns = () => directory.locator('.mega-directory-columns:visible');
  await page.locator('[aria-controls="mega-analytical"]').hover();
  assert.equal(await directory.locator('.mega-intro, .mega-families').count(),0);
  assert(!(await directory.innerText()).includes('No product families are currently listed.'));
  assert.deepEqual(await activeColumns().locator('h3').allTextContents(),analytical.groups.map(group=>group.name));
  assert.deepEqual(await activeColumns().locator('.mega-group a').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),directoryTopics.map(topic=>directoryUrl(analytical,topic)));
  assert.equal(await directory.locator('.mega-view-all').count(),0,'Directory has no footer link or divider');
  assert.equal(await page.locator('.category-nav-label > a').first().getAttribute('href'),'products.html?category=analytical');
  // Change only taxonomy objects in memory, then use the production renderer.
  // The renderer builds column wrappers without taxonomy assignments or CSS edits.
  const originalGroups = analytical.groups;
  try {
    for (const [width, columns] of [[320,1],[767,1],[768,2],[1024,2],[1279,2],[1280,3],[1366,3],[1440,3],[1600,3],[1920,3]]) {
      await page.setViewportSize({width,height:1000});await go('index.html');
      if(width<1280) {
        await page.locator('#navToggle').click();
        await page.locator('[aria-controls="mega-analytical"]').click();
      } else await page.locator('[aria-controls="mega-analytical"]').hover();
      for (const count of [3,4,5,6,8]) {
        analytical.groups = originalGroups.slice(0,count);
        while(analytical.groups.length<count) analytical.groups.push({name:`Validation group ${analytical.groups.length+1}`,items:[{name:'Density Meters',search:'density'}]});
        await directory.evaluate((panel, renderedHeader)=>{
          const parsed=new DOMParser().parseFromString(renderedHeader,'text/html');
          panel.replaceChildren(...parsed.querySelector('#mega-analytical').childNodes);
        }, header());
        assert.equal(await activeColumns().count(),1,'Exactly one responsive variant is visible');
        assert.equal(await activeColumns().locator('.mega-directory-column > section.mega-group').count(),count);
        const layout=await activeColumns().evaluate(grid=>{
          const style=getComputedStyle(grid);
          const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,bottom:r.bottom,width:r.width,right:r.right};};
          const columnElements=[...grid.children];
          const columnGroups=columnElements.map(column=>[...column.children].map(group=>{
            const separator=getComputedStyle(group,'::before');
            return {name:group.querySelector('h3').textContent,...rect(group),headingY:rect(group.querySelector('h3')).y,separator:{content:separator.content,width:separator.width,border:separator.borderTopWidth,color:separator.borderTopColor,below:separator.marginBottom}};
          }));
          const panel=grid.closest('.mega-menu');
          const columnStyles=columnElements.map(column=>{const s=getComputedStyle(column);return {left:s.paddingLeft,right:s.paddingRight,border:s.borderLeftWidth,color:s.borderLeftColor};});
          return {groups:columnGroups.flat(),columnGroups,columns:columnElements.map(rect),columnStyles,columnCount:Number(grid.dataset.columns),gap:style.columnGap,groupGap:getComputedStyle(columnElements[0]).gap,grid:rect(grid),panel:rect(panel),panelOverflow:panel.scrollWidth>panel.clientWidth,footerCount:panel.querySelectorAll('.mega-view-all').length};
        });
        assert.equal(layout.columnCount,columns);assert.equal(layout.columns.length,columns);
        assert.equal(layout.gap,'0px');assert.equal(layout.groupGap,'0px');
        const expectedSizes = columns===3 ? ({3:[1,1,1],4:[2,1,1],5:[2,2,1],6:[2,2,2],8:[3,3,2]})[count] : columns===2 ? [Math.ceil(count/2),Math.floor(count/2)] : [count];
        assert.deepEqual(layout.columnGroups.map(groups=>groups.length),expectedSizes);
        assert.deepEqual(layout.groups.map(g=>g.name),analytical.groups.map(g=>g.name),'Chunking preserves taxonomy order');
        for(let i=0;i<columns;i++) {
          assert.equal(layout.columns[i].width,230);
          assert.equal(layout.columnStyles[i].left,i===0?'0px':'14px');
          assert.equal(layout.columnStyles[i].right,i===columns-1?'0px':'14px');
          assert.equal(layout.columnStyles[i].border,i===0?'0px':'1px');
          if(i) {
            assert.equal(layout.columnStyles[i].color,'rgb(10, 31, 51)');
            assert.equal(layout.columns[i].x-layout.columns[i-1].right,0);
            assert.equal(layout.columns[i].y,layout.columns[0].y,'Independent columns align at the top');
          }
          const groups=layout.columnGroups[i];
          assert.equal(layout.columns[i].bottom,layout.grid.bottom,'Every vertical separator reaches the bottom of the directory');
          assert.equal(groups[0].separator.content,'none','First group has no horizontal rule');
          for(let j=1;j<groups.length;j++) {
            const spacing=width>=1280?6:9;
            assert(Math.abs(groups[j].y-groups[j-1].bottom-spacing)<1,'Compact spacing above each group separator');
            assert.equal(groups[j].separator.border,'1px');
            assert.equal(groups[j].separator.color,'rgb(10, 31, 51)');
            assert.equal(groups[j].separator.width,'144px');
            assert(144<groups[j].width,'Group separator remains shorter than the text column');
            assert.equal(groups[j].separator.below,`${spacing}px`);
            assert(Math.abs(groups[j].headingY-groups[j].y-spacing-1)<1,'Heading follows the short rule and compact spacing');
          }
        }
        assert.equal(layout.grid.width,columns*230);
        const panelInset=width>=1280?17:16;
        assert.equal(layout.grid.x-layout.panel.x,panelInset);
        assert.equal(layout.panel.right-layout.grid.right,panelInset,'Panel ends immediately after the last column');
        assert.equal(layout.panel.width,layout.grid.width+2*panelInset,'Panel fits the active columns and padding');
        assert(!layout.panelOverflow,'No horizontal scrolling inside the directory panel');
        assert.equal(layout.footerCount,0);
        assert(Math.abs(layout.panel.bottom-layout.grid.bottom)<1,'Vertical dividers reach the panel bottom');
        const bottomSpace=layout.grid.bottom-Math.max(...layout.groups.map(group=>group.bottom));
        if(width<1280) assert.equal(bottomSpace,50,'Mobile bottom spacing stays unchanged');
        else assert(bottomSpace>=50,'Desktop columns fill the tall panel, retaining minimum bottom space');
        if(width>=1280) {
          assert.equal(layout.panel.bottom,976,'Desktop panel leaves 24px of viewport clearance');
          if(count===originalGroups.length) {
            const instruments=layout.groups.find(g=>g.name==='Analytical Instruments');
            const spectroscopy=layout.groups.find(g=>g.name==='Spectroscopy');
            const materials=layout.groups.find(g=>g.name==='Materials & Physical Testing');
            assert.equal(spectroscopy.x,instruments.x);
            assert(Math.abs(spectroscopy.headingY-instruments.bottom-13)<1);
            assert(spectroscopy.y<materials.bottom,'Spectroscopy does not wait for a taller neighboring column');
          }
        }
        await overflow(`${count} groups at ${width}`);
      }
    }
  } finally { analytical.groups=originalGroups; }
  // Another category can opt in without changes to the renderer; families still work.
  const chromatography=categories.find(c=>c.anchor==='chromatography');
  const previousGroups=chromatography.groups;
  const generalLab=categories.find(c=>c.anchor==='general-lab');
  const previousGeneralGroups=generalLab.groups;
  try {
    delete generalLab.groups;
    chromatography.groups=[{name:'Validation group',items:[{name:'Vials',search:'vial'}]}];
    const result=await page.evaluate(rendered=>{
      const parsed=new DOMParser().parseFromString(rendered,'text/html');
      const panel=parsed.querySelector('#mega-chromatography');
      return {groups:panel.querySelectorAll('[data-columns="3"] .mega-group').length,href:panel.querySelector('.mega-group a').getAttribute('href'),familyFallback:!!parsed.querySelector('#mega-general-lab .mega-families'),directoryFooter:!!panel.querySelector('.mega-view-all'),familyFooter:!!parsed.querySelector('#mega-general-lab .mega-view-all')};
    },header('../'));
    assert.deepEqual(result,{groups:1,href:'../products.html?category=chromatography&search=vial',familyFallback:true,directoryFooter:false,familyFooter:true});
  } finally {
    if(previousGroups===undefined) delete chromatography.groups; else chromatography.groups=previousGroups;
    generalLab.groups=previousGeneralGroups;
  }
  const checkDesktopOverlay=async(panel=directory,category=analytical)=>{
    const overlay=await panel.evaluate(panel=>{
      const r=panel.getBoundingClientRect(),nav=document.querySelector('#primaryNav').getBoundingClientRect();
      const label=panel.parentElement.querySelector('.category-nav-label').getBoundingClientRect();
      const groups=panel.querySelector('[data-columns="3"]');
      const firstLink=groups.querySelector('a').getBoundingClientRect();
      return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,labelCenter:label.left+label.width/2,navBottom:nav.bottom,navLeft:nav.left,viewportHeight:innerHeight,viewportWidth:innerWidth,position:getComputedStyle(panel).position,backdropContent:getComputedStyle(panel.parentElement,'::before').content,rowHeight:firstLink.height,columnBottoms:[...groups.children].map(c=>c.getBoundingClientRect().bottom),pageVisibleOutside:[[r.right+4,nav.bottom+4],[innerWidth-4,nav.bottom+4],[innerWidth-4,innerHeight-4],[r.left+20,innerHeight-8]].every(([x,y])=>!document.elementFromPoint(x,y)?.closest('.category-header')),panelCoversItsBottom:panel.contains(document.elementFromPoint(r.left+20,r.bottom-4))};
    });
    assert.equal(overlay.position,'fixed');assert.equal(overlay.width,724);
    if(category===analytical) assert.equal(overlay.left,overlay.navLeft,'Analytical position stays unchanged');
    assert(overlay.left>=overlay.navLeft && overlay.right<=overlay.viewportWidth-24,'Panel stays within the viewport');
    assert(overlay.labelCenter>=overlay.left && overlay.labelCenter<=overlay.right,'Panel sits below its parent label');
    assert.equal(overlay.top,overlay.navBottom);
    assert.equal(overlay.bottom,overlay.viewportHeight-24);
    assert(overlay.columnBottoms.every(bottom=>Math.abs(bottom-overlay.bottom)<1),'Dividers extend to the panel bottom');
    assert.equal(overlay.backdropContent,'none','No full-width white pseudo-element');
    assert(overlay.pageVisibleOutside,'Page remains visible to the right and through the 24px bottom clearance');
    assert(overlay.panelCoversItsBottom,'White coverage continues to the compact panel bottom');
    assert(overlay.rowHeight>=20 && overlay.rowHeight<=22,'Desktop link rows are approximately 20–22px');
  };
  // Every category uses the same directory frame, including sparse two-group menus.
  for(const [width,height] of [[320,1200],[375,1200],[768,1200],[1024,1200],[1279,1200],[1280,900],[1366,768],[1440,900],[1600,900],[1920,1080]]) {
    for(const category of categories) {
      await page.setViewportSize({width,height});await go('index.html');
      const panel=page.locator(`#mega-${category.anchor}`);
      const item=page.locator('.category-nav-item').filter({has:panel});
      const label=item.locator('.category-nav-label');
      if(width>=1280) {
        await label.hover();await checkDesktopOverlay(panel,category);
        const l=await label.boundingBox(),p=await panel.boundingBox();
        await page.mouse.move(l.x+l.width/2,l.y+l.height-2);
        await page.mouse.move(l.x+l.width/2,p.y+10,{steps:10});
        assert(await panel.isVisible(),`Pointer can enter ${category.name} directly from its label`);
        await page.mouse.move(l.x+l.width/2,l.y+l.height-2,{steps:10});
        assert(await panel.isVisible(),'Pointer can return to its parent label');
      } else {
        await page.locator('#navToggle').click();await item.locator('.category-disclosure').click();
        assert.equal(await panel.evaluate(e=>getComputedStyle(e).position),'static');
      }
      const columns=panel.locator('.mega-directory-columns:visible');
      const columnCount=width>=1280?3:width>=768?2:1;
      const topics=category.groups.flatMap(group=>group.items);
      assert.equal(await columns.count(),1);
      assert.equal(await columns.locator(':scope > .mega-directory-column').count(),columnCount);
      assert.deepEqual(await columns.locator('h3').allTextContents(),category.groups.map(group=>group.name));
      assert.deepEqual(await columns.locator('a').allTextContents(),topics.map(topic=>directoryItem(category,topic).name));
      assert.deepEqual(await columns.locator('a').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),topics.map(topic=>directoryUrl(category,topic)));
      assert.equal(await panel.locator('.mega-intro, .mega-families, .mega-view-all').count(),0);
      const frame=await columns.evaluate(grid=>[...grid.children].map(column=>({width:column.getBoundingClientRect().width,border:getComputedStyle(column).borderLeftWidth,bottom:column.getBoundingClientRect().bottom})));
      assert(frame.every(c=>c.width===230 && Math.abs(c.bottom-frame[0].bottom)<1),'All columns, including empty ones, share the frame');
      assert.deepEqual(frame.map(c=>c.border),Array.from({length:columnCount},(_,i)=>i?'1px':'0px'));
      await overflow(`${category.name} directory at ${width}`);
      if(process.env.BENCHVALE_SCREENSHOT_DIR && [375,1024,1440].includes(width)) {
        const path=resolve(process.env.BENCHVALE_SCREENSHOT_DIR,`menu-${category.anchor}-${width}.png`);
        if(width>=1280) await page.screenshot({path}); else await panel.screenshot({path});
      }
      if(width===1440) {
        const savedGroups=category.groups;
        try {
          category.groups=[...savedGroups,{name:'Validation group',items:[savedGroups[0].items[0]]}];
          await panel.evaluate((e,rendered)=>{
            const parsed=new DOMParser().parseFromString(rendered,'text/html');
            e.replaceChildren(...parsed.querySelector(`#${e.id}`).childNodes);
          },header());
          assert.equal(await columns.locator('h3').last().textContent(),'Validation group');
          assert.equal(await columns.locator('.mega-group').count(),savedGroups.length+1);
          await checkDesktopOverlay(panel,category);
        } finally { category.groups=savedGroups; }
      }
      await Promise.all([page.waitForURL(`**/${categoryUrl(category)}`),label.locator('a').click()]);
      await page.waitForLoadState('load');await checkCategory(category);
    }
  }
  for (const [width,height] of [[1280,800],[1366,768],[1440,900],[1600,900],[1920,1080]]) {
    await page.setViewportSize({width,height});await go('index.html');
    await page.locator('[aria-controls="mega-analytical"]').hover();
    assert.equal(await activeColumns().locator(':scope > .mega-directory-column').count(),3);
    await checkDesktopOverlay();
    await overflow(`Analytical directory at ${width}`);
    if(process.env.BENCHVALE_SCREENSHOT_DIR && [1366,1440,1600,1920].includes(width)) {
      await page.screenshot({path:resolve(process.env.BENCHVALE_SCREENSHOT_DIR,`analytical-compact-tall-${width}x${height}.png`)});
    }
    await page.mouse.move(width-8,height-8);assert(!(await directory.isVisible()),'Leaving the menu restores normal page interaction');
    await page.locator('[aria-controls="mega-analytical"]').focus();assert(await directory.isVisible());
    await page.mouse.click(width-8,height-8);assert(!(await directory.isVisible()),'Clicking outside closes the focused menu');
    assert.equal(await page.locator('.category-header.directory-overlay-open').count(),0);
  }
  await go('index.html');await page.locator('[aria-controls="mega-analytical"]').focus();
  await page.setViewportSize({width:1440,height:900});await checkDesktopOverlay();
  await page.evaluate(()=>window.scrollTo({top:450,behavior:'instant'}));
  await page.evaluate(()=>new Promise(requestAnimationFrame));await checkDesktopOverlay();
  // Header height changes without a window resize must update the measured top.
  await page.locator('.category-header-top').evaluate(e=>e.style.paddingBottom='40px');
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await checkDesktopOverlay();
  await page.keyboard.press('Escape');assert(!(await directory.isVisible()));
  await go('index.html');await page.locator('[aria-controls="mega-analytical"]').hover();
  await page.keyboard.press('Escape');assert(!(await directory.isVisible()),'Escape also closes a mouse-opened overlay');
  // A long directory scrolls within the compact panel; the underlying page stays stationary.
  try {
    analytical.groups=Array.from({length:24},(_,i)=>({name:`Validation group ${i+1}`,items:originalGroups[i%originalGroups.length].items}));
    await page.setViewportSize({width:1366,height:500});await go('index.html');
    await page.locator('[aria-controls="mega-analytical"]').hover();
    await directory.evaluate((panel,rendered)=>{
      const parsed=new DOMParser().parseFromString(rendered,'text/html');
      panel.replaceChildren(...parsed.querySelector('#mega-analytical').childNodes);
    },header());
    assert(await directory.evaluate(e=>e.scrollHeight>e.clientHeight),'Future groups can overflow vertically');
    await directory.hover();await page.mouse.wheel(0,10000);
    await page.waitForFunction(()=>document.querySelector('#mega-analytical').scrollTop>0);
    assert.equal(await page.evaluate(()=>scrollY),0,'Overlay scrolling does not scroll the underlying page');
    await directory.evaluate(e=>e.scrollTop=e.scrollHeight);
    assert(await activeColumns().locator('.mega-group a').last().evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight-24));
    await overflow('Long scrolling desktop directory');
  } finally { analytical.groups=originalGroups; }
  await page.setViewportSize({width:1024,height:900});
  await page.waitForFunction(()=>!document.querySelector('.category-header').classList.contains('directory-overlay-open'));
  assert(!(await directory.isVisible()),'Crossing to tablet closes the desktop overlay');
  assert.equal(await page.locator('.category-header.directory-overlay-open').count(),0);
  await go('index.html');await page.locator('#navToggle').click();await page.locator('[aria-controls="mega-analytical"]').click();
  assert.equal(await directory.evaluate(e=>getComputedStyle(e).position),'static','Tablet keeps the inline accordion');
  assert(await activeColumns().locator('a').first().evaluate(e=>e.getBoundingClientRect().height>=44),'Tablet touch rows are unchanged');
  assert.equal(await page.locator('.category-nav-item.directory-overlay-open').count(),0);
  await page.setViewportSize({width:1440,height:1000});
  await go('index.html');
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
  await Promise.all([touch.waitForURL('**/products/syringe-filters.html'), touch.locator('#mega-sample-preparation .mega-directory-columns:visible a').first().tap()]);await touch.waitForLoadState('load');
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
