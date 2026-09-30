import { readFile, writeFile } from 'node:fs/promises';
if(process.env.AI_AUTO_UPDATE!=='true'){console.log('AI article updates disabled.');process.exit(0)}
if(!process.env.GROK_API_KEY){console.log('No configured AI key; existing content kept.');process.exit(0)}
const queue=JSON.parse(await readFile('content/article-queue.json','utf8'));
const existing=JSON.parse(await readFile('src/data/generated-articles.json','utf8'));
const core=JSON.parse(await readFile('src/data/articles.json','utf8'));
const software=JSON.parse(await readFile('src/data/software.json','utf8'));
const used=new Set([...core,...existing].map(a=>a.slug));const task=queue.find(q=>!used.has(q.slug));
if(!task){console.log('Article queue complete.');process.exit(0)}
const model=process.env.GROK_MODEL||'grok-4.6';const base=(process.env.GROK_API_BASE||'https://booltoken.com/v1').replace(/\/$/,'');
if(new URL(base).protocol!=='https:')throw new Error('AI endpoint must use HTTPS');
const prompt=`写一篇简体中文教程，标题主题：${task.title}。800-1500中文字，具体实用，不编造套餐、测速、版本号。不要HTML、脚本、下载地址或购买地址。可参考软件名单：${software.map(s=>s.name).join('、')}。只返回JSON对象 {"title":"...","description":"...","category":"教程","tags":["Clash",...],"sections":[{"heading":"...","paragraphs":["..."],"list":["..."]}]}，至少4节。`;
const response=await fetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.GROK_API_KEY}`},body:JSON.stringify({model,messages:[{role:'user',content:prompt}],max_tokens:3500,stream:false}),signal:AbortSignal.timeout(180000)});
if(!response.ok)throw new Error(`AI response HTTP ${response.status}; content unchanged`);
const result=await response.json();if(result.choices?.[0]?.finish_reason!=='stop')throw new Error('Incomplete response; content unchanged');
const raw=result.choices?.[0]?.message?.content;if(typeof raw!=='string')throw new Error('Missing response content');
const article=JSON.parse(raw.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));
const text=s=>typeof s==='string'&&s.length>0&&s.length<12000&&!/<\/?(?:script|iframe|style|html|body)\b/i.test(s)&&!s.includes('sk-');
if(!text(article.title)||article.title.length>100||!text(article.description)||article.description.length>300||!Array.isArray(article.tags)||article.tags.length>8||!article.tags.every(t=>text(t)&&t.length<35)||!Array.isArray(article.sections)||article.sections.length<4||article.sections.length>12)throw new Error('Invalid article; content unchanged');
const sections=article.sections.map(s=>{if(!text(s.heading)||!Array.isArray(s.paragraphs)||!s.paragraphs.length||!s.paragraphs.every(text)||s.list&&(!Array.isArray(s.list)||!s.list.every(text)))throw new Error('Invalid section');return {heading:s.heading,paragraphs:s.paragraphs,...(s.list?{list:s.list}:{})};});
if(sections.flatMap(s=>s.paragraphs).join('').length<600)throw new Error('Article too short');
const today=new Date().toISOString().slice(0,10);existing.push({slug:task.slug,title:article.title,description:article.description,category:'教程',tags:article.tags,publishedAt:today,updatedAt:today,cover:task.cover,software:task.software||[],airports:[],sections});
await writeFile('src/data/generated-articles.json',JSON.stringify(existing,null,2)+'\n');console.log(`Added article: ${task.slug}`);
