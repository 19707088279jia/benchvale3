import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {header} from './site-navigation.mjs';
import {categories, categoryUrl} from './taxonomy.mjs';
import {applyServiceLayout} from './service-layout.mjs';
const root = new URL('../', import.meta.url);
for (const dir of ['', 'products/']) for (const name of readdirSync(new URL(dir,root)).filter(n=>n.endsWith('.html'))) {
 const url = new URL(dir+name,root);
 let html = readFileSync(url,'utf8').replace(/<header class="site-header[\s\S]*?<\/header>/,header(dir ? '../' : ''));
 if (!html.includes('href="'+(dir?'../':'')+'navigation.css"')) html = html.replace('</head>',`  <link rel="stylesheet" href="${dir?'../':''}navigation.css" />\n</head>`);
 html = html.replace(/products.html#(chromatography|sample-preparation|environmental-water|general-lab|life-science|liquid-handling|laboratory-equipment)/g, (_,c)=>'products.html?category='+ (c==='laboratory-equipment'?'general-lab':c));
 if (name==='explore.html') {
   const existing = [...html.matchAll(/<a href="products.html\?category=[\s\S]*?<\/a>/g)].map(m=>m[0]).filter(m=>m.includes('home-category-card'));
   const cards = categories.map(c=> {
     const previous=existing.find(x=>x.startsWith(`<a href="${categoryUrl(c)}"`));
     if(previous) return previous.replace(/<h3>[\s\S]*?<\/h3>/,`<h3>${c.name.replaceAll("&","&amp;")}</h3>`).replace(/<p>[\s\S]*?<\/p>/,`<p>${c.description}</p>`);
     return `<a href="${categoryUrl(c)}" class="home-category-card"><h3>${c.name}</h3><p>${c.description}</p><span>Browse category →</span></a>`;
   }).join('\n');
   html=html.replace(/(<div class="home-category-grid reveal">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/,'$1'+cards+'$2');
 }
 writeFileSync(url,applyServiceLayout(html,dir+name));
}
console.log('Updated shared headers, category links, and Services sidebars.');
