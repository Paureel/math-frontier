import fs from 'node:fs/promises';
import {gzipSync,brotliCompressSync} from 'node:zlib';
import {packFrontier} from '../lib/transport.mjs';

const bytes=buffer=>({raw:buffer.length,gzip:gzipSync(buffer).length,brotli:brotliCompressSync(buffer).length});
const files=await fs.readdir(new URL('../dist/assets/',import.meta.url));
const assets=await Promise.all(files.filter(file=>/\.(?:js|css)$/.test(file)).map(async name=>({name,
  ...bytes(await fs.readFile(new URL(`../dist/assets/${name}`,import.meta.url)))})));
const snapshot=JSON.parse(await fs.readFile(new URL('../public/frontier.json',import.meta.url),'utf8'));
const api=bytes(Buffer.from(JSON.stringify(packFrontier(snapshot))));
const html=bytes(await fs.readFile(new URL('../dist/index.html',import.meta.url)));
const favicon=bytes(await fs.readFile(new URL('../dist/favicon.svg',import.meta.url)));
const asset=(prefix,suffix)=>assets.find(a=>a.name.startsWith(prefix)&&a.name.endsWith(suffix));
const opening=html.gzip+favicon.gzip+asset('index-','.js').gzip+asset('index-','.css').gzip+api.gzip;
// The integer-multiplication formula uses these two fonts. Other formulas may
// need additional fonts; repeated visits can reuse immutable browser assets.
const fontNames=['KaTeX_Main-Regular-','KaTeX_Math-Italic-'];
const fonts=await Promise.all(fontNames.map(async prefix=>{
  const name=files.find(name=>name.startsWith(prefix)&&name.endsWith('.woff2'));
  return {name,raw:(await fs.stat(new URL(`../dist/assets/${name}`,import.meta.url))).size};
}));
const math=asset('Formula-','.js').gzip+asset('Formula-','.css').gzip+fonts.reduce((n,f)=>n+f.raw,0);
const evidence=assets.find(a=>a.name.includes('frontier-excerpts')&&a.name.endsWith('.js')).gzip;
const creditEstimate=(size,requests)=>({bandwidth:size*10000/1e9*20,requests:requests*2,total:size*10000/1e9*20+requests*2});
console.log(JSON.stringify({date:new Date().toISOString().slice(0,10),assets,api,html,favicon,fonts,
  compressedBytes:{opening,optionalMath:math,optionalEvidence:evidence},
  estimatedCreditsPer10000ColdOpenings:{
    basic:creditEstimate(opening,5),
    halfOpenMathAndEvidence:creditEstimate(opening+(math+evidence)/2,7.5),
    allOpenMathAndEvidence:creditEstimate(opening+math+evidence,10)
  },notes:'Gzip, decimal GB, current rates: 20 credits/GB and 2 credits/10k requests. Excludes headers, extra formula fonts, compute and production deploys; no visitor analytics.'},null,2));
