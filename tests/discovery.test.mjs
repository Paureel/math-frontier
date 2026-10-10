import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {collectFrontier, createFrontierService} from '../lib/service.mjs';
import {collectDiscovery, updateDiscoverySnapshot} from '../lib/discovery.mjs';
import {DISCOVERY_NOTICE} from '../lib/discovery-policy.mjs';
import {snapshot, harness, at} from './helpers/fixtures.mjs';

const item = (repo = 'new-owner/exact-fourier-experiments') => ({full_name:repo, private:false, fork:false,
  description:'Exact Fourier circuit experiments', pushed_at:at});
const candidate = (repo = 'cache-owner/exact-fourier-experiments') => ({repo, url:`https://github.com/${repo}`,
  description:'Saved search result', updatedAt:at, problemIds:['130'], reason:'Unreviewed search match.'});
const search = items => ({fetcher:async()=>Response.json({items}), token:null});

test('automatic source refreshes never search, and preserve discovery through success and outage', async () => {
  for (const unavailable of [false, true]) {
    const fixture=harness({mutate:url=>unavailable?new Response('',{status:500}):undefined});
    const data=await collectFrontier(snapshot,fixture);
    assert.equal(data.live,!unavailable);
    assert.deepEqual(data.discoveries,snapshot.discoveries);
    assert.ok(fixture.calls.every(c=>!new URL(c.url).pathname.startsWith('/search/')));
    assert.ok(data.warnings.includes(DISCOVERY_NOTICE));
  }
});

test('a newer cache or collector cannot override or mutate the owner discovery list', async () => {
  const owner=structuredClone(snapshot), expected=structuredClone(owner.discoveries);
  const saved={...structuredClone(snapshot),fetchedAt:at,discoveries:[candidate()]};
  let written;
  const get=createFrontierService({snapshot:owner,read:async()=>saved,collect:async prior=>{
    assert.deepEqual(prior.discoveries,expected);
    prior.discoveries[0].description='Unexpected collector edit';
    return {...saved,live:true,discoveries:[candidate('collector/exact-fourier-experiments')]};
  },write:async data=>{written=data;}});
  owner.discoveries.length=0;
  const data=await get();
  assert.deepEqual(data.discoveries,expected);assert.deepEqual(written.discoveries,expected);
  assert.equal(data.fetchedAt,at);
});

test('outage fallback keeps owner discovery even when a newer cache has old automatic results', async () => {
  const saved={...structuredClone(snapshot),fetchedAt:at,discoveries:[candidate()],warnings:[
    'GitHub discovery could not be refreshed. Saved discovery remains available.',
    'Discovery scans the 100 most recently updated repositories matching openai/math in their README. It is not an exhaustive index of community work.'
  ]};
  const get=createFrontierService({snapshot,read:async()=>saved,collect:async()=>{throw Error('Offline');}});
  const data=await get();
  assert.deepEqual(data.discoveries,snapshot.discoveries);assert.equal(data.live,false);
  assert.ok(!data.warnings.some(w=>w.includes('100 most recently')||w.includes('discovery could not')));
  assert.ok(data.warnings.includes(DISCOVERY_NOTICE));
});

test('manual discovery uses a bounded public search, keeps existing candidates, and never promotes claims', async () => {
  const calls=[];
  const data=await collectDiscovery(snapshot,{token:null,fetcher:async(url,options)=>{
    calls.push({url,options});
    return Response.json({items:[item(),item('NEW-OWNER/exact-fourier-experiments'),
      item(snapshot.discoveries[0].repo),{...item('private/exact-fourier-experiments'),private:true},
      {...item('fork/exact-fourier-experiments'),fork:true},item('CrocSwap/integer-mult-bounds'),
      {...item('other/exact-fourier-proof'),claim:{authority:'maintainer-reviewed'},verified:true}]});
  }});
  assert.equal(calls.length,1);
  const url=new URL(calls[0].url);
  assert.equal(url.hostname,'api.github.com');assert.equal(url.pathname,'/search/repositories');
  assert.equal(url.searchParams.get('q'),'"openai/math" in:readme fork:false');
  assert.equal(url.searchParams.get('per_page'),'100');assert.equal(url.searchParams.get('sort'),'updated');
  assert.equal(calls[0].options.redirect,'error');
  assert.deepEqual(data.discoveries.slice(0,snapshot.discoveries.length),snapshot.discoveries);
  assert.equal(data.discoveries.length,snapshot.discoveries.length+2);
  assert.ok(data.discoveries.every(d=>d.claim===undefined&&d.verified===undefined));
  for (const key of ['projects','problems','catalogue','fetchedAt','live']) assert.deepEqual(data[key],snapshot[key]);
});

test('manual discovery scans only the first 100 results and retains a full saved owner list', async () => {
  const items=Array.from({length:101},(_,i)=>item(`owner${i}/exact-fourier-experiments`));
  const data=await collectDiscovery(snapshot,search(items));
  assert.equal(data.discoveries.length,100);
  assert.ok(!data.discoveries.some(d=>d.repo==='owner100/exact-fourier-experiments'));
  assert.deepEqual(data.discoveries.slice(0,snapshot.discoveries.length),snapshot.discoveries);
  const again=await collectDiscovery(data,search([item('another/exact-fourier-experiments')]));
  assert.deepEqual(again.discoveries,data.discoveries);
});

test('failed, incomplete and invalid manual scans leave the snapshot byte-for-byte unchanged', async () => {
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'frontier-discovery-'));
  const file=pathToFileURL(path.join(directory,'frontier.json'));
  const original=JSON.stringify(snapshot,null,2)+'\n';
  try {
    await fs.writeFile(file,original);
    for (const response of [()=>new Response('',{status:429}),()=>new Response('not json'),
      ()=>Response.json({items:null}),()=>Response.json({items:[item()],incomplete_results:true}),
      ()=>new Response('x',{headers:{'content-length':'99999999'}})]) {
      await assert.rejects(updateDiscoverySnapshot(file,{token:null,fetcher:async()=>response()}));
      assert.equal(await fs.readFile(file,'utf8'),original);
      assert.deepEqual(await fs.readdir(directory),['frontier.json']);
    }
  } finally {await fs.rm(directory,{recursive:true,force:true});}
});

test('the manual owner command writes only validated candidates and preserves scientific records', async () => {
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'frontier-discovery-'));
  const file=pathToFileURL(path.join(directory,'frontier.json'));
  try {
    await fs.writeFile(file,JSON.stringify(snapshot));
    const result=await updateDiscoverySnapshot(file,search([item()]));
    const saved=JSON.parse(await fs.readFile(file,'utf8'));
    assert.equal(result.added,1);assert.deepEqual(saved,result.data);
    for (const key of ['projects','problems','catalogue','fetchedAt','live']) assert.deepEqual(saved[key],snapshot[key]);
    assert.deepEqual(await fs.readdir(directory),['frontier.json']);
  } finally {await fs.rm(directory,{recursive:true,force:true});}
});

test('a concurrent owner edit cannot be overwritten by a manual scan', async () => {
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'frontier-discovery-'));
  const file=pathToFileURL(path.join(directory,'frontier.json'));
  const newer={...snapshot,discoveries:[...snapshot.discoveries,candidate()]};
  const text=JSON.stringify(newer);
  try {
    await fs.writeFile(file,JSON.stringify(snapshot));
    await assert.rejects(updateDiscoverySnapshot(file,{token:null,fetcher:async()=>{
      await fs.writeFile(file,text);return Response.json({items:[item()]});
    }}),/snapshot changed/);
    assert.equal(await fs.readFile(file,'utf8'),text);
    assert.deepEqual(await fs.readdir(directory),['frontier.json']);
  } finally {await fs.rm(directory,{recursive:true,force:true});}
});
