import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrontierService, collectFrontier, frontierResponse, readPublic} from '../lib/service.mjs';
import {canCompare} from '../lib/claim-policy.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {REFRESH_INTERVAL_MS} from '../lib/refresh-policy.mjs';
import {snapshot, harness, at} from './helpers/fixtures.mjs';
const fresh = () => collectFrontier(snapshot, harness());

test('simultaneous cold requests share cache loading and a single refresh; successful data gets a TTL', async () => {
  let resolveRead, resolveCollect, reads=0, collects=0, writes=0, clock=Date.parse(at)+REFRESH_INTERVAL_MS;
  const saved=await fresh();
  const service=createFrontierService({snapshot, now:()=>clock,
    read:()=>{reads++;return new Promise(resolve=>{resolveRead=resolve;});},
    collect:prior=>{collects++;assert.equal(prior.fetchedAt,saved.fetchedAt);return new Promise(resolve=>{resolveCollect=resolve;});},
    write:async()=>{writes++;}});
  const pending=[service(),service(),service()];
  assert.equal(reads,1);assert.equal(collects,0);resolveRead(saved);
  await Promise.resolve();await Promise.resolve();assert.equal(collects,1);resolveCollect(saved);
  const results=await Promise.all(pending);assert.ok(results.every(x=>x===results[0]));assert.equal(writes,1);
  await service();assert.equal(collects,1);
  clock+=REFRESH_INTERVAL_MS;const next=service();await Promise.resolve();await Promise.resolve();assert.equal(collects,2);resolveCollect(saved);await next;
});

test('a fresh persisted public cache keeps its original deadline across local restarts',async()=>{
  const saved=await fresh();let clock=Date.parse(at)+1000,collects=0,writes=0;
  const make=()=>createFrontierService({snapshot,now:()=>clock,read:async()=>saved,
    collect:async()=>{collects++;return saved;},write:async()=>{writes++;}});
  const first=make();assert.equal((await first()).live,true);
  clock=Date.parse(at)+REFRESH_INTERVAL_MS-1;assert.equal((await make()()).live,true);
  assert.equal(collects,0);assert.equal(writes,0);
  clock++;await first();assert.equal(collects,1);
  const future={...saved,fetchedAt:'2099-01-01T00:00:00Z'};
  let previous;
  const invalid=createFrontierService({snapshot,now:()=>Date.parse(at),read:async()=>future,
    collect:async prior=>{previous=prior;return saved;}});
  await invalid();assert.equal(previous.fetchedAt,snapshot.fetchedAt);
});

test('a corrupt/legacy cache cannot restore loose trust from the previous schema', async () => {
  const corrupt=structuredClone(snapshot);corrupt.schemaVersion=1;corrupt.fetchedAt='2099-01-01T00:00:00Z';
  let previous;
  const service=createFrontierService({snapshot,read:async()=>corrupt,collect:async prior=>{previous=prior;return await fresh();}});
  const data=await service();assert.deepEqual(previous,snapshot);assert.equal(data.schemaVersion,2);
  assert.throws(()=>createFrontierService({snapshot:corrupt}),/Unsupported/);
});

test('invalid live responses preserve last-good data, dates and failure backoff without writing', async () => {
  const good={...structuredClone(snapshot),live:true};let collects=0,writes=0,clock=Date.parse(at);
  const service=createFrontierService({snapshot:good,now:()=>clock,collect:async()=>{collects++;const forged=structuredClone(good);forged.projects[1].claim.authority='maintainer-reviewed';return forged;},write:async()=>{writes++;}});
  const data=await service();assert.equal(data.live,false);assert.equal(data.fetchedAt,good.fetchedAt);assert.equal(writes,0);
  assert.equal(data.projects[1].claim.authority,'unreviewed');assert.ok(data.projects.every(p=>p.stale&&!p.claimFresh));
  assert.equal(canCompare(data.projects[0],data.problems[0]),false);
  await service();assert.equal(collects,1);clock+=REFRESH_INTERVAL_MS;await service();assert.equal(collects,2);
});

test('storage failure cannot discard a valid refresh; raw failures never expose credentials', async () => {
  const good=await fresh();
  const service=createFrontierService({snapshot,collect:async()=>good,read:async()=>{throw Error('secret-read');},write:async()=>{throw Error('secret-write');}});
  assert.equal((await service()).live,true);
  const failed=createFrontierService({snapshot:good,collect:async()=>{throw Error('Authorization: Bearer secret-token');}});
  const data=await failed();assert.ok(!JSON.stringify(data).includes('secret-token'));
});

test('the endpoint is exact and read-only, adds security headers, and sanitizes errors', async () => {
  let calls=0;const get=async()=>{calls++;return snapshot;};
  for(const method of ['POST','PUT','DELETE','PATCH','OPTIONS','HEAD']) {
    const r=await frontierResponse(method,'/',get);assert.equal(r.status,405);assert.equal(r.headers.get('Allow'),'GET');
  }
  assert.equal((await frontierResponse('GET','/not-an-endpoint',get)).status,404);assert.equal(calls,0);
  const result=await frontierResponse('GET','/',get);assert.equal(result.status,200);assert.equal(calls,1);
  assert.equal(result.headers.get('X-Content-Type-Options'),'nosniff');assert.equal(result.headers.get('Cache-Control'),'no-store');
  assert.match(result.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
  const failed=await frontierResponse('GET','/',async()=>{throw Error('secret-token');});assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('secret-token'));
});

test('public fetches restrict destinations, keep tokens off raw sources, and prohibit redirects', async () => {
  const calls=[];const fetcher=async(url,options)=>{calls.push({url,options});return new Response('public');};
  await readPublic('https://api.github.com/repos/openai/math',{api:true,token:'test-secret',fetcher});
  await readPublic('https://raw.githubusercontent.com/openai/math/main/README.md',{token:'test-secret',fetcher});
  assert.equal(calls[0].options.headers.Authorization,'Bearer test-secret');assert.equal(calls[1].options.headers.Authorization,undefined);
  assert.ok(calls.every(x=>x.options.redirect==='error'));
  for(const url of ['http://api.github.com/repos/x/y','https://evil.test/data','https://api.github.com:8888/data','https://user:pass@api.github.com/data']) {
    await assert.rejects(readPublic(url,{api:true,token:'test-secret',fetcher}),/Unsupported/);
  }
  await assert.rejects(readPublic('https://raw.githubusercontent.com/a/b/main/source',{api:true,token:'test-secret',fetcher}),/Unsupported/);
  assert.equal(calls.length,2);
});

test('response size limits apply to declared and streaming payloads before parsing', async () => {
  await assert.rejects(readPublic('https://api.github.com/repos/a/b',{limit:5,fetcher:async()=>new Response('123456')}),/too large/);
  await assert.rejects(readPublic('https://api.github.com/repos/a/b',{limit:5,fetcher:async()=>new Response('x',{headers:{'content-length':'99999999'}})}),/too large/);
});

test('API quota failures use only fixed public Git heads, preserve activity and do not infer current PR review', async () => {
  const fixture=harness({mutate:url=>url.hostname==='api.github.com'?new Response('',{status:403}):undefined});
  const pins=[];
  const data=await collectFrontier(snapshot,{...fixture,resolvePublicHead:async repo=>{pins.push(repo);const p=snapshot.projects.find(x=>x.repo===repo);return {repo,defaultBranch:p?.branch??'main',commit:'a'.repeat(40)};}});
  assert.equal(data.live,true);assert.equal(pins.length,snapshot.projects.length+1);
  const p=data.projects.find(p=>p.id==='crocswap');assert.equal(p.claim.authority,'maintainer-reviewed');assert.equal(p.claim.review.currentPR,'unavailable');
  assert.equal(p.activityFresh,false);assert.equal(p.updatedAt,snapshot.projects[0].updatedAt);
  assert.ok(data.warnings.some(w=>w.includes('anonymous public Git')));
});

test('public-head fallback cannot supply a different repository or a PR branch identifier instead of a commit', async () => {
  const fixture=harness({mutate:url=>url.hostname==='api.github.com'?new Response('',{status:429}):undefined});
  for(const pin of [{repo:'some-fork/integer-mult-bounds',defaultBranch:'main',commit:'a'.repeat(40)},
    {repo:'CrocSwap/integer-mult-bounds',defaultBranch:'main',commit:'refs/pull/159/head'}]) {
    const data=await collectFrontier(snapshot,{...fixture,resolvePublicHead:async()=>pin});
    assert.equal(data.live,false);assert.ok(data.projects.every(p=>p.stale&&!p.claimFresh));
  }
});

test('complete refresh failure withholds current baseline numbers and comparisons', async () => {
  const data = await collectFrontier(snapshot,harness({mutate:()=>new Response('',{status:500})}));
  assert.equal(data.live,false);
  assert.ok(data.problems.every(problem=>!problem.baselineFresh&&problem.metric.value===null&&problem.metric.display==='Source unconfirmed'));
  assert.ok(data.projects.every(project=>project.stale&&!project.claimFresh));
  assert.equal(validateFrontier(data),true);
});

test('catalogue requests do not block project requests from starting', async () => {
  let release;
  const fixture = harness({mutate:url=>url.pathname==='/repos/openai/math' ? new Promise(resolve=>{release=resolve;}) : undefined});
  const pending = collectFrontier(snapshot,fixture);
  assert.ok(fixture.calls.some(call=>new URL(call.url).pathname==='/repos/CrocSwap/integer-mult-bounds'));
  release(Response.json({private:false,fork:false,full_name:'openai/math',default_branch:'main'}));
  const data = await pending;
  assert.equal(data.live,true);
  assert.equal(validateFrontier(data),true);
});

test('a shared cancellation deadline aborts all outstanding public-source requests', async () => {
  const controller = new AbortController();
  const fixture = harness({mutate:(url,options)=>new Promise((resolve,reject)=>{
    options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true});
  })});
  const pending = collectFrontier(snapshot,{...fixture,signal:controller.signal});
  assert.equal(fixture.calls.length,snapshot.projects.length+1);
  controller.abort(Error('Research collection timed out'));
  const data = await pending;
  assert.equal(data.live,false);
  assert.ok(data.projects.every(project=>project.stale));
  let calls=0;
  await assert.rejects(readPublic('https://api.github.com/repos/openai/math',{signal:controller.signal,fetcher:()=>{calls++;}}),/timed out/);
  assert.equal(calls,0);
});

test('head pinning requests only the SHA so large commit diffs cannot block source updates',async()=>{
  const {latestHarness}=await import('./helpers/latest-fixtures.mjs');
  const fixture=latestHarness({mutate:(url,options)=>url.pathname.includes('/commits/')&&options.headers.Accept!=='application/vnd.github.sha'?
    new Response('x'.repeat(2*1024*1024)):undefined});
  const data=await collectFrontier(snapshot,fixture);
  assert.ok(data.problems.every(p=>p.baselineFresh));
  assert.ok(data.projects.every(p=>!p.stale));
  const heads=fixture.calls.filter(call=>call.url.includes('/commits/'));
  assert.equal(heads.length,data.projects.length+1);
  assert.ok(heads.every(call=>call.options.headers.Accept==='application/vnd.github.sha'));
});
