import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
const root=path.resolve('dist');
const walk=async(dir)=>{const output=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);output.push(...(entry.isDirectory()?await walk(p):[p]));}return output;};
const files=await walk(root);const html=files.filter(f=>f.endsWith('.html'));const issues=[];const titles=new Map();const canonicalUrls=new Set();const counts={pages:html.length,images:0,links:0,schemas:0};
const exists=async p=>{try{return (await stat(p)).isFile()}catch{return false}};
const resolveTarget=async pathname=>{let target=path.join(root,decodeURIComponent(pathname));if(!target.startsWith(root+path.sep)&&target!==root)return null; if(await exists(target))return target;if(await exists(path.join(target,'index.html')))return path.join(target,'index.html');if(await exists(target+'.html'))return target+'.html';return null;};
for(const file of html){const relative=path.relative(root,file).split(path.sep).join('/');const pageUrl=new URL('/'+relative.replace(/index\.html$/,''),'https://sssclash.com');const $=load(await readFile(file,'utf8'));const fail=text=>issues.push(`${relative}: ${text}`);
  if($('h1').length!==1)fail(`H1 count ${$('h1').length}`);
  const title=$('title').text();if(!title)fail('Missing title');if(titles.has(title))fail(`Duplicate title with ${titles.get(title)}`);titles.set(title,relative);
  if(!$('meta[name="description"]').attr('content'))fail('Missing description');
  const canonical=$('link[rel="canonical"]').attr('href');if(!canonical||new URL(canonical).hostname!=='sssclash.com')fail('Invalid canonical');else canonicalUrls.add(canonical);
  if(!$('meta[name="robots"]').attr('content'))fail('Missing robots');
  if($('html').attr('lang')!=='zh-CN')fail('Incorrect language');
  for(const node of $('script[type="application/ld+json"]').toArray()){try{JSON.parse($(node).text());counts.schemas++}catch{fail('Invalid JSON-LD')}}
  for(const node of $('img').toArray()){const el=$(node);counts.images++;if(el.attr('alt')===undefined)fail('Image missing alt');if(!el.attr('width')||!el.attr('height'))fail('Image missing dimensions');const src=el.attr('src');if(src?.startsWith('/')&&!await resolveTarget(src))fail(`Missing image ${src}`);}
  const og=$('meta[property="og:image"]').attr('content');if(!og||!await resolveTarget(new URL(og).pathname))fail('Missing OG image');
  for(const node of $('a[href],link[href]').toArray()){counts.links++;const href=$(node).attr('href');if(!href||/^(mailto:|tel:)/.test(href))continue;if(href==='#')fail('Placeholder link');let u;try{u=new URL(href,pageUrl)}catch{fail(`Malformed link ${href}`);continue;}if(u.origin!==pageUrl.origin)continue;const target=await resolveTarget(u.pathname);if(!target){fail(`Missing target ${href}`);continue;}if(u.hash&&target.endsWith('.html')){const content=load(await readFile(target,'utf8'));const id=decodeURIComponent(u.hash.slice(1));if(!content('[id]').toArray().some(n=>content(n).attr('id')===id))fail(`Missing anchor ${href}`);}}
  for(const node of $('a[rel*="sponsored"]').toArray()){if(!/^https:\/\//.test($(node).attr('href')||''))fail('Purchase URL not HTTPS');}
}
const airports=JSON.parse(await readFile('src/data/airports.json','utf8'));if(airports.length!==19)issues.push('Expected 19 airports');if(new Set(airports.map(a=>a.domain)).size!==19)issues.push('Duplicate airport domains');
const sitemapFiles=files.filter(f=>/sitemap.*\.xml$/.test(f));if(!sitemapFiles.length)issues.push('Missing sitemap');
for(const file of sitemapFiles){const sitemap=load(await readFile(file,'utf8'),{xmlMode:true});for(const n of sitemap('url loc').toArray()){const u=new URL(sitemap(n).text());if(!await resolveTarget(u.pathname))issues.push(`Sitemap URL missing: ${u.pathname}`);if(/\/search\/?$/.test(u.pathname))issues.push('Search page included in sitemap');}}
await mkdir('reports',{recursive:true});const result={...counts,airports:airports.length,canonicalUrls:canonicalUrls.size,issues,passed:issues.length===0};await writeFile('reports/audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(issues.length)process.exitCode=1;
