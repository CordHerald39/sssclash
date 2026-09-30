import { chromium } from 'playwright';
import { mkdir, writeFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('reports',{recursive:true});
let executablePath=chromium.executablePath();try{await access(executablePath)}catch{executablePath=process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}
const browser=await chromium.launch({headless:true,executablePath});const errors=[];const failures=[];
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4321';
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===base)failures.push(`${r.status()} ${r.url()}`)});
await page.goto(base,{waitUntil:'networkidle'});await page.screenshot({path:'reports/home-desktop.png',fullPage:true});
for(const route of ['/software/','/download/','/airports/','/ranking/','/cheap/','/articles/','/software/clash-verge-rev/','/airports/yinghuamao/','/articles/clash-getting-started/','/tags/安装/']){
  const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200,route);assert.equal(await page.locator('h1').count(),1,route);
}
await page.goto(base+'/download/?platform=Android',{waitUntil:'networkidle'});
assert.equal(await page.locator('[data-filter-item]:visible').count(),3,'Android filter should include current and historical Android clients');
await page.getByRole('button',{name:'iOS',exact:true}).click();assert.equal(await page.locator('[data-filter-item]:visible').count(),2,'iOS related tools');
await page.goto(base+'/software/clash-verge-rev/',{waitUntil:'networkidle'});await page.locator('.faq-list summary').first().click();assert.equal(await page.locator('.faq-list details').first().getAttribute('open'),'','FAQ should open');
await page.screenshot({path:'reports/software-desktop.png',fullPage:true});
await page.goto(base+'/ranking/',{waitUntil:'networkidle'});assert.equal(await page.locator('tbody tr').count(),19);assert.equal(await page.locator('a[rel*="sponsored"][href="https://yinghuamao.com.cn"]').count(),1);await page.screenshot({path:'reports/ranking-desktop.png',fullPage:true});
await page.goto(base+'/search/?q='+encodeURIComponent('樱花猫'),{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('#search-results')?.children.length>0);assert.match(await page.locator('#search-results').innerText(),/樱花猫/);
await page.locator('#search-query').fill('<img src=x onerror=alert(1)>');await page.getByRole('button',{name:'搜索',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#search-status')?.textContent?.includes('没有找到'));assert.equal(await page.locator('#search-results img').count(),0);
const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
await phone.goto(base,{waitUntil:'networkidle'});await phone.screenshot({path:'reports/home-mobile.png',fullPage:true});
await phone.locator('.mobile-menu summary').click();assert.equal(await phone.locator('.mobile-menu nav').isVisible(),true);await phone.locator('.mobile-menu summary').click();
for(const route of ['/','/download/','/ranking/','/airports/yinghuamao/','/articles/clash-getting-started/']){await phone.goto(base+route,{waitUntil:'networkidle'});assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Mobile horizontal overflow: '+route);}
await phone.screenshot({path:'reports/article-mobile.png',fullPage:true});
assert.deepEqual(errors,[],'Browser runtime errors');assert.deepEqual(failures,[],'Failed local resources');
const result={passed:true,desktop:'1440×1000',mobile:'390×844',checkedRoutes:10,checks:['Android/iOS filters','FAQ accordion','19 airport rows and purchase link','Chinese-tag routing','search and text-safe rendering','mobile navigation','no horizontal overflow','no runtime errors or failed resources'],screenshots:['home-desktop.png','home-mobile.png','software-desktop.png','ranking-desktop.png','article-mobile.png']};
await writeFile('reports/browser-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
