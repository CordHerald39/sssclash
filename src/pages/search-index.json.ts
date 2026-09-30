import type { APIRoute } from 'astro';
import { software, airports, articles } from '../lib/content';
export const GET: APIRoute = () => new Response(JSON.stringify([
  ...software.map(s=>({title:s.name,description:s.description+' '+s.platforms.join(' '),url:`/software/${s.slug}/`,kind:'软件'})),
  ...airports.map(a=>({title:a.name,description:a.description+' '+a.domain,url:`/airports/${a.slug}/`,kind:'机场'})),
  ...articles.map(a=>({title:a.title,description:a.description+' '+a.tags.join(' '),url:`/articles/${a.slug}/`,kind:a.category}))
]), {headers:{'Content-Type':'application/json; charset=utf-8'}});
