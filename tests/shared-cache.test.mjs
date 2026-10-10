import test from 'node:test';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {readSharedFrontier,refreshSharedFrontier} from '../lib/shared-frontier.mjs';
import {cachedFrontierResponse} from '../lib/cached-response.mjs';
import {expireFrontier,nextSourceCheck,nextScheduledCheck,nextEvidenceExpiry,REFRESH_INTERVAL_MS} from '../lib/refresh-policy.mjs';
import {unpackFrontier} from '../lib/transport.mjs';
import {canCompare} from '../lib/claim-policy.mjs';
import {collectFrontier} from '../lib/service.mjs';
import {snapshot} from './helpers/fixtures.mjs';
import {latestHarness} from './helpers/latest-fixtures.mjs';
const at=Date.parse('2026-10-10T14:30:00Z');
const fresh=()=>collectFrontier(snapshot,latestHarness());
function fakeStore(value=null) {
  let etag=value?'1':null,reads=0,writes=0;
  return {get value(){return value;},get reads(){return reads;},get writes(){return writes;},
    async get(){reads++;return structuredClone(value);},
    async getWithMetadata(){reads++;return value?{data:structuredClone(value),etag}:null;},
    async setJSON(key,data,condition){
      writes++;
      if((condition.onlyIfNew&&value)||(condition.onlyIfMatch&&condition.onlyIfMatch!==etag))return {modified:false};
      value=structuredClone(data);etag=String(Number(etag??0)+1);return {modified:true,etag};
    }};
}
const record=data=>({version:1,checkedAt:new Date(at+20000).toISOString(),frontier:data});

test('many visitors and cold function instances read shared public data without GitHub scans or writes',async()=>{
  const store=fakeStore(record(await fresh()));
  const results=await Promise.all(Array.from({length:100},()=>readSharedFrontier({snapshot,store,now:()=>at+30000})));
  assert.ok(results.every(r=>r.live&&r.projects[0].claim.value===.000723571590007464));
  assert.equal(store.reads,100);assert.equal(store.writes,0);
});

test('cache outages, corrupt or future snapshots, and expired evidence disable current comparisons',async()=>{
  const data=await fresh();
  const forged=structuredClone(data);forged.projects[0].claim.value=.9;
  for(const store of [fakeStore(),fakeStore(record(forged)),fakeStore({...record(data),checkedAt:'2099-01-01T00:00:00Z'}),
    {get:async()=>{throw Error('Bearer secret');}},fakeStore(record(data))]) {
    const r=await readSharedFrontier({snapshot,store,now:()=>at+REFRESH_INTERVAL_MS});
    assert.equal(r.live,false);assert.ok(r.projects.every(p=>p.stale&&!p.claimFresh));
    assert.equal(canCompare(r.projects[0],r.problems.find(p=>p.id==='109')),false);
    assert.ok(r.problems.every(p=>p.metric.value===null&&!p.baselineFresh));
    assert.ok(!JSON.stringify(r).includes('Bearer secret'));
  }
});

test('scheduled refresh preserves manual discovery and atomic writes reject late competing jobs',async()=>{
  const data=await fresh(),store=fakeStore();let calls=0;
  const collect=async()=>{calls++;return {...data,discoveries:[]};};
  assert.equal((await refreshSharedFrontier({snapshot,store,collect,now:()=>at})).updated,true);
  assert.deepEqual(store.value.frontier.discoveries,snapshot.discoveries);
  assert.equal((await refreshSharedFrontier({snapshot,store,collect,now:()=>at+1000})).updated,false);
  assert.equal(calls,1);
  // Completed jobs must not postpone the following 12h cron tick.
  assert.equal((await refreshSharedFrontier({snapshot,store,collect,now:()=>at+REFRESH_INTERVAL_MS})).updated,true);
  const prior=fakeStore(record(data));let release;
  const slow=refreshSharedFrontier({snapshot,store:prior,now:()=>at+REFRESH_INTERVAL_MS,collect:()=>new Promise(resolve=>{release=resolve;})});
  await new Promise(resolve=>setImmediate(resolve));
  const withdrawn=structuredClone(data);withdrawn.fetchedAt=new Date(at+REFRESH_INTERVAL_MS).toISOString();withdrawn.projects[0].claim=null;withdrawn.projects[0].status='No confirmed maintainer selection';
  await refreshSharedFrontier({snapshot,store:prior,now:()=>at+REFRESH_INTERVAL_MS,collect:async()=>withdrawn});
  release(data);assert.equal((await slow).updated,false);
  assert.equal(prior.value.frontier.projects[0].claim,null);
});

test('failed scheduled refreshes persist safe saved records and cache readers cannot replace owner discovery',async()=>{
  const data=await fresh(),store=fakeStore({...record(data),frontier:{...data,discoveries:[]}});
  const initial=await readSharedFrontier({snapshot,store,now:()=>at+30000});assert.deepEqual(initial.discoveries,snapshot.discoveries);
  await refreshSharedFrontier({snapshot,store,now:()=>at+REFRESH_INTERVAL_MS,collect:async()=>{throw Error('secret token');}});
  assert.equal(store.value.frontier.live,false);assert.equal(store.value.frontier.fetchedAt,data.fetchedAt);
  assert.ok(!JSON.stringify(store.value).includes('secret token'));
  assert.deepEqual(store.value.frontier.discoveries,snapshot.discoveries);
});

test('CDN responses are compact, conditional, compressed, bounded by evidence expiry, and read-only',async()=>{
  const data=await fresh();let reads=0;
  const get=async()=>{reads++;return data;};
  const request=headers=>new Request('https://example.test/api/frontier',{headers});
  const first=await cachedFrontierResponse(request({'accept-encoding':'br, gzip'}),get,{now:()=>at+REFRESH_INTERVAL_MS-1500});
  assert.equal(first.status,200);assert.equal(first.headers.get('content-encoding'),'gzip');
  assert.match(first.headers.get('netlify-cdn-cache-control'),/max-age=1,/);
  assert.ok(!first.headers.get('netlify-cdn-cache-control').includes('stale-while-revalidate'));
  const wire=JSON.parse(gunzipSync(Buffer.from(await first.arrayBuffer())).toString());
  assert.equal(unpackFrontier(wire).projects[0].claim.value,data.projects[0].claim.value);
  assert.equal(wire.projects[1].claim.evidence,'');
  const conditional=await cachedFrontierResponse(request({'if-none-match':first.headers.get('etag')}),get,{now:()=>at});
  assert.equal(conditional.status,304);assert.equal(await conditional.text(),'');
  const strong=await cachedFrontierResponse(request({'if-none-match':first.headers.get('etag').slice(2)}),get,{now:()=>at});
  assert.equal(strong.status,304);
  const plain=await cachedFrontierResponse(request({'accept-encoding':'gzip;q=0'}),get,{now:()=>at});
  assert.equal(plain.headers.get('content-encoding'),null);
  const before=reads;
  assert.equal((await cachedFrontierResponse(new Request('https://example.test/api/frontier',{method:'POST'}),get)).status,405);
  assert.equal((await cachedFrontierResponse(new Request('https://example.test/api/frontier/discover'),get)).status,404);
  assert.equal(reads,before);
  const expired=await cachedFrontierResponse(request(),get,{now:()=>at+REFRESH_INTERVAL_MS});
  assert.equal(unpackFrontier(await expired.json()).live,false);
  const failed=await cachedFrontierResponse(request(),async()=>{throw Error('secret token');});
  assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('secret'));
});

test('initial fallback and manual source refreshes follow the next scheduled snapshot, not another full visitor interval',async()=>{
  const data=await fresh(),morning=Date.parse('2026-10-09T10:00:00Z'),scheduled=Date.parse('2026-10-09T12:01:00Z');
  const saved=expireFrontier({...data,live:false},morning);
  assert.equal(nextScheduledCheck(morning,false),scheduled);
  assert.equal(nextSourceCheck(saved,morning,new Date(scheduled).toISOString()),scheduled);
  const handover=Date.parse('2026-10-09T12:00:20Z'),retry=Date.parse('2026-10-09T12:05:00Z');
  assert.equal(nextScheduledCheck(handover,false),retry);
  assert.equal(nextSourceCheck(saved,handover,new Date(retry).toISOString()),retry);
  assert.equal(nextSourceCheck(saved,retry+1000,new Date(retry).toISOString()),retry+301000);
  for(const hint of ['invalid','2099-01-01T00:00:00Z','1900-01-01T00:00:00Z'])
    assert.equal(nextSourceCheck(saved,morning,hint),morning+REFRESH_INTERVAL_MS);
  assert.equal(expireFrontier(saved,morning),saved);
});

test('a fresh wrapper date cannot prolong older source observations or their comparison eligibility',async()=>{
  const data=await fresh(),later=at+REFRESH_INTERVAL_MS;
  data.fetchedAt=new Date(later).toISOString();
  assert.equal(nextEvidenceExpiry(data),later);
  const expired=expireFrontier(data,later);
  assert.equal(expired.live,false);
  assert.ok(expired.projects.every(p=>p.stale&&!p.claimFresh&&!p.activityFresh));
  assert.ok(expired.problems.every(p=>!p.baselineFresh&&p.metric.value===null));
  assert.equal(canCompare(expired.projects[0],expired.problems.find(p=>p.id==='109')),false);
  const partial=await fresh();partial.projects[0].claim.observedAt=new Date(at-REFRESH_INTERVAL_MS).toISOString();
  const p=expireFrontier(partial,at).projects[0];
  assert.equal(p.stale,true);assert.equal(p.claimFresh,false);assert.equal(p.activityFresh,true);
});

test('CDN lifetime respects the earliest individual source deadline even with a newer wrapper',async()=>{
  const data=await fresh();data.fetchedAt=new Date(at+3600000).toISOString();
  const response=await cachedFrontierResponse(new Request('https://example.test/api/frontier'),async()=>data,
    {now:()=>at+REFRESH_INTERVAL_MS-1500});
  assert.match(response.headers.get('netlify-cdn-cache-control'),/max-age=1,/);
});

test('returning to a tab reuses its source deadline; long-open pages demote expired evidence',async()=>{
  const data=await fresh();
  assert.equal(nextSourceCheck(data,at+1000),at+REFRESH_INTERVAL_MS);
  assert.equal(expireFrontier(data,at+REFRESH_INTERVAL_MS-1),data);
  const expired=expireFrontier(data,at+REFRESH_INTERVAL_MS);
  assert.equal(expired.live,false);assert.equal(nextSourceCheck(expired,at),at+REFRESH_INTERVAL_MS);
  assert.equal(nextSourceCheck(expired,at+REFRESH_INTERVAL_MS),at+REFRESH_INTERVAL_MS+5*60000);
  assert.equal(nextSourceCheck(expired,at+REFRESH_INTERVAL_MS+5*60000),at+2*REFRESH_INTERVAL_MS+5*60000);
  assert.equal(expireFrontier(data,at-1).live,false);
});
