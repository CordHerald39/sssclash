import { readFile, writeFile } from 'node:fs/promises';
const software=JSON.parse(await readFile('src/data/software.json','utf8'));
const file='src/data/releases.json';const before=await readFile(file,'utf8');const result=JSON.parse(before);let changed=0,failures=0;
for(const item of software.filter(s=>s.repo&&s.status!=='legacy')){
  const repo=new URL(item.repo).pathname.slice(1);const headers={Accept:'application/vnd.github+json','User-Agent':'sssclash-release-updater'};if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
  try{const response=await fetch(`https://api.github.com/repos/${repo}/releases/latest`,{headers,signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();if(typeof data.tag_name!=='string'||typeof data.html_url!=='string'||!data.html_url.startsWith(item.repo+'/releases/'))throw new Error('Invalid release');if(result[item.slug]?.version!==data.tag_name){result[item.slug]={version:data.tag_name,url:data.html_url,publishedAt:data.published_at};changed++;}}
  catch(error){failures++;console.log(`${item.name}: update unavailable (${error.message}); previous data kept`);}
}
if(changed)await writeFile(file,JSON.stringify(result,null,2)+'\n');console.log(`Releases: ${changed} changed, ${failures} unavailable.`);
