import test from 'node:test';
import assert from 'node:assert/strict';
import {getDeployStore} from '@netlify/blobs';
import {boundedBlobFetch} from '../lib/blob-fetch.mjs';
import handler from '../netlify/functions/frontier.mjs';
import {unpackFrontier} from '../lib/transport.mjs';

test('the installed cache SDK cannot retry rate limits, server failures, network errors or access failures',async()=>{
  for(const response of [()=>new Response('',{status:429}),()=>new Response('',{status:500}),
    ()=>new Response('',{status:503}),()=>new Response('',{status:403}),()=>{throw Error('secret token');}]) {
    let calls=0;
    const store=getDeployStore('test-snapshot',{siteID:'test-site',deployID:'0123456789abcdef01234567',token:'test-token',region:'us-east-2',
      edgeURL:'https://cache.test/',uncachedEdgeURL:'https://cache.test/',
      fetch:boundedBlobFetch({fetcher:async()=>{calls++;return response();}})});
    await assert.rejects(store.get('snapshot',{type:'json',consistency:'strong'}));
    assert.equal(calls,1);
  }
});

test('cache deadlines cover stalled fetches and response bodies, not just response headers',async()=>{
  for(const fetcher of [()=>new Promise(()=>{}),()=>new Response(new ReadableStream({start(){}}))]) {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(Error('deadline')),10);
    const response=await boundedBlobFetch({signal:controller.signal,fetcher})('https://cache.test');
    clearTimeout(timer);
    assert.equal(response.status,408);
    assert.equal(await response.text(),'Public source cache unavailable.');
  }
  let calls=0;const controller=new AbortController();controller.abort();
  const response=await boundedBlobFetch({signal:controller.signal,fetcher:()=>{calls++;}})('https://cache.test');
  assert.equal(response.status,408);assert.equal(calls,0);
});

test('bounded cache transport preserves successful JSON, ETags and atomic write conditions, and limits payloads',async()=>{
  const calls=[];
  const fetcher=async(url,options)=>{calls.push(options);return Response.json({public:true},{headers:{etag:'version-1'}});};
  const request=boundedBlobFetch({fetcher});
  const response=await request('https://cache.test',{method:'PUT',headers:{'if-match':'version-0'},body:'public snapshot'});
  assert.deepEqual(await response.json(),{public:true});assert.equal(response.headers.get('etag'),'version-1');
  assert.equal(calls[0].headers['if-match'],'version-0');assert.equal(calls[0].body,'public snapshot');
  for(const fetcher of [()=>new Response('123456'),()=>new Response('x',{headers:{'content-length':'9999'}})]) {
    assert.equal((await boundedBlobFetch({fetcher,limit:5})('https://cache.test')).status,408);
  }
  const empty=await boundedBlobFetch({fetcher:()=>new Response(null,{status:304,headers:{etag:'version-1'}})})('https://cache.test');
  assert.equal(empty.status,304);assert.equal(await empty.text(),'');
});

test('the real visitor handler serves a safe compact bundle if cache environment configuration is absent',async()=>{
  const response=await handler(new Request('https://example.test/api/frontier'));
  assert.equal(response.status,200);
  const data=unpackFrontier(await response.json());
  assert.equal(data.live,false);assert.ok(data.projects.every(p=>p.stale&&!p.claimFresh));
  assert.ok(data.problems.every(p=>!p.baselineFresh));
});
