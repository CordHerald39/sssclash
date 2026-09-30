import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
const assets=JSON.parse(await readFile(new URL('../design/asset-manifest.json',import.meta.url),'utf8'));
await mkdir('public/images',{recursive:true});
for(const {name,source} of assets){await sharp(source).resize({width:1280,withoutEnlargement:true}).webp({quality:83}).toFile(`public/images/${name}.webp`);}
await mkdir('public/icons',{recursive:true});
const favicon=await readFile('public/favicon.svg');
for(const size of [192,512])await sharp(favicon).resize(size,size).png().toFile(`public/icons/icon-${size}.png`);
await sharp(favicon).resize(180,180).png().toFile('public/apple-touch-icon.png');
console.log(`Prepared ${assets.length} illustrations and brand icons.`);
