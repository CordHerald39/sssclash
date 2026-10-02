import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { APIRoute } from 'astro';
import { routes, ogKey } from '../../lib/content';
export function getStaticPaths(){return [{path:'/',title:'找到适合你的 Clash 客户端',image:'hero'},...routes,{path:'/404/',title:'素Clash · 页面未找到',image:'hero'}].map(route=>({params:{slug:ogKey(route.path)},props:{route}}));}
const esc=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export const GET: APIRoute=async({props})=>{
  const route=props.route as {title:string;image:string};
  const picture=await readFile(join(process.cwd(),'public','images',`${route.image}.webp`));
  const chars=Array.from(route.title);const lines:string[]=[];let line='';let weight=0;
  for(const c of chars){const w=c.charCodeAt(0)>255?1:.54;if(weight+w>12){lines.push(line);line='';weight=0;}line+=c;weight+=w;}if(line)lines.push(line);
  const title=lines.slice(0,4).map((line,i)=>`<tspan x="70" dy="${i===0?0:68}">${esc(line)}</tspan>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="white"/><rect x="0" y="0" width="1200" height="8" fill="#2563eb"/><image href="data:image/webp;base64,${picture.toString('base64')}" x="630" y="70" width="540" height="480" preserveAspectRatio="xMidYMid meet"/><text x="70" y="105" font-family="Microsoft YaHei,sans-serif" font-weight="700" font-size="36" fill="#111">素Clash</text><text x="70" y="250" font-family="Microsoft YaHei,sans-serif" font-weight="700" font-size="48" fill="#111">${title}</text><text x="70" y="557" font-family="sans-serif" font-size="23" fill="#2563eb">sssclash.com.cn</text><text x="70" y="593" font-family="Microsoft YaHei,sans-serif" font-size="18" fill="#657080">客户端下载 · 教程 · 机场选购</text></svg>`;
  const result=await sharp(Buffer.from(svg)).png().toBuffer();return new Response(new Uint8Array(result),{headers:{'Content-Type':'image/png'}});
};
