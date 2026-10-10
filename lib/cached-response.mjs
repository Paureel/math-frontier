import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {packFrontier} from './transport.mjs';
import {expireFrontier,nextEvidenceExpiry,nextScheduledCheck} from './refresh-policy.mjs';

const security={'Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"};
export async function cachedFrontierResponse(request,get,{now=Date.now}={}) {
  const path=new URL(request.url).pathname;
  const fail=(message,status,extra={})=>Response.json({error:message},{status,headers:{...security,'Cache-Control':'no-store',...extra}});
  if(path!=='/api/frontier')return fail('Not found',404);
  if(request.method!=='GET')return fail('Method not allowed',405,{Allow:'GET'});
  try {
    const data=expireFrontier(await get(),now());
    const json=JSON.stringify(packFrontier(data));
    const etag=`W/"${createHash('sha256').update(json).digest('hex')}"`;
    // No stale-while-revalidate: old review states must expire at the source
    // deadline, even when a scheduled job or the public cache is unavailable.
    const remaining=Math.max(0,Math.floor((nextEvidenceExpiry(data)-now())/1000));
    const ttl=data.live ? Math.min(3600,remaining) : 300;
    const headers={...security,ETag:etag,Vary:'Accept-Encoding',
      'X-Next-Source-Check':new Date(nextScheduledCheck(now(),data.live)).toISOString(),
      'Cache-Control':`public, max-age=${Math.min(300,ttl)}, must-revalidate`,
      'Netlify-CDN-Cache-Control':`public, durable, max-age=${ttl}, must-revalidate`};
    if(request.headers.get('if-none-match')?.split(',').some(value=>value.trim().replace(/^W\//,'')===etag.slice(2) || value.trim()==='*'))return new Response(null,{status:304,headers});
    const gzip=request.headers.get('accept-encoding')?.split(',').some(part=>{
      const [name,...parameters]=part.trim().split(';');
      const q=parameters.find(p=>p.trim().startsWith('q='))?.trim().slice(2);
      return name==='gzip' && (q===undefined || Number(q)>0);
    });
    if(gzip)return new Response(gzipSync(json),{headers:{...headers,'Content-Encoding':'gzip'}});
    return new Response(json,{headers});
  } catch { return fail('The public research update is unavailable.',503); }
}
