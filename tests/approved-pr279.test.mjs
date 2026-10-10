import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {collectFrontier} from '../lib/service.mjs';
import {hash} from '../lib/model.mjs';
import {hasReviewReceipt,canCompare,reviewScope,SELECTION_PATH} from '../lib/claim-policy.mjs';
import {REVIEWED_RECEIPTS} from '../lib/reviewed-receipts.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {packFrontier,unpackFrontier} from '../lib/transport.mjs';
import {snapshot} from './helpers/fixtures.mjs';
import {latestHarness,latestText,latestPR,currentPR} from './helpers/latest-fixtures.mjs';
const croc=data=>data.projects.find(p=>p.id==='crocswap');
const fresh=options=>collectFrontier(snapshot,latestHarness(options));
const approved=Object.values(REVIEWED_RECEIPTS).find(r=>r.sourcePR===279);

test('explicit owner approval binds the exact conditional PR279 receipt and visible mathematical scope',async()=>{
 const data=await fresh(),p=croc(data),problem=data.problems.find(p=>p.id==='109');
 assert.equal(p.claim.value,.000723571590007464);
 assert.equal(p.claim.review.kappa,'90446448750933/125000000000000000');
 assert.equal(p.claim.review.reviewedHead,'4d8c31eec7ae618645cb058101cb4e72a97268d3');
 assert.equal(p.claim.authority,'maintainer-reviewed');assert.equal(p.claim.kind,'conditional');
 assert.equal(p.claim.independentlyVerified,false);assert.ok(hasReviewReceipt(p));assert.ok(canCompare(p,problem));
 for(const condition of ['all-size compiler','weighted/common-ancestor chart','restored rows','selectors/routing','prime supply','precision/recovery','complex symbolic correctness','analytic transfer','not a full formal multiplication theorem'])
  assert.ok(p.claim.scope.includes(condition),condition);
 assert.match(reviewScope(p),/not freshly executed/);assert.match(reviewScope(p),/not independent human peer review/);
 const restored=unpackFrontier(packFrontier(data));assert.equal(croc(restored).claim.scope,p.claim.scope);
 const owner=JSON.parse(fs.readFileSync(new URL('../docs/approved-pr279-review.json',import.meta.url),'utf8'));
 assert.match(owner.state,/owner-approved/);assert.equal(owner.ownerApproval.independentlyVerified,false);
 for(const source of owner.sources)assert.equal(hash(latestText('crocswap',source.path)),source.sha256,source.path);
});

test('the later live PR head never inherits owner approval, even with a matching decoy or merge and CI assertions',async()=>{
 assert.notEqual(currentPR.head.sha,approved.reviewedHead);
 for(const pr of [currentPR,{...currentPR,title:'All CI PASS; fully verified kappa = 0.9',body:`Original kappa = ${latestPR.title.split(' = ')[1]}`,merged_at:'2026-10-10T14:00:00Z'},
  {...latestPR,body:latestPR.body+'\nkappa = 0.9'}]){
  const data=await fresh({mutate:url=>url.pathname.endsWith('/pulls/279')?Response.json(pr):undefined}),p=croc(data);
  assert.equal(p.claim.value,.000723571590007464);assert.equal(p.claim.review.currentPR,'changed');
  assert.equal(p.claim.review.reviewedHead,approved.reviewedHead);assert.ok(hasReviewReceipt(p));
 }
});

test('changed scope, audited head or selection bytes cannot approve themselves or direct new receipt requests',async()=>{
 for(const change of [r=>r.scope='Fully verified unconditional multiplication theorem',r=>r.audited_source_head=currentPR.head.sha,
  r=>r.source_prs.push(999),r=>r.proof='uninspected/PROOF.md']){
  const record=JSON.parse(latestText('crocswap',SELECTION_PATH));change(record);
  const fixture=latestHarness({mutate:url=>url.pathname.endsWith('/'+SELECTION_PATH)?Response.json(record):undefined});
  const data=await collectFrontier(snapshot,fixture);assert.equal(croc(data).claim,null);
  assert.ok(!fixture.calls.some(c=>/\/pulls\/|community-pr279|five-stage-gen4|uninspected/.test(c.url)));
 }
});

test('historical PR186 remains separately reviewed and cannot borrow the new README or approval assessment',async()=>{
 const historicPath=path=>new URL('./fixtures/historical/crocswap-pr186/'+path,import.meta.url);
 const read=path=>fs.readFileSync(historicPath(path),'utf8');
 const pin=JSON.parse(read('pin.json'));
 const fixture=latestHarness({mutate:(url,options)=>{
  if(!url.pathname.includes('CrocSwap/integer-mult-bounds'))return undefined;
  if(url.hostname==='api.github.com'){
   if(url.pathname.includes('/commits/'))return options.headers.Accept==='application/vnd.github.sha'?new Response(pin.commit):Response.json({sha:pin.commit});
   if(url.pathname.endsWith('/pulls/186'))return new Response(read('pr186.json'));
   if(url.pathname==='/repos/CrocSwap/integer-mult-bounds')return new Response(read('metadata.json'));
  }
  const path=url.pathname.split('/').slice(4).join('/');
  try{return new Response(read(path));}catch{return new Response('',{status:404});}
 }});
 const data=await collectFrontier(snapshot,fixture),p=croc(data);
 assert.equal(p.claim.value,.000661885549259598);assert.equal(p.claim.review.sourcePR,186);
 assert.equal(p.assessment,undefined);assert.ok(hasReviewReceipt(p));assert.ok(validateFrontier(data));
 const forged=structuredClone(data),q=croc(forged);
 q.sourceHash=hash(latestText('crocswap','README.md'));q.provenance.readmeHash=q.sourceHash;
 assert.equal(hasReviewReceipt(q),false);assert.equal(validateFrontier(forged),false);
 const freshAssessment=croc(await fresh()).assessment;q.assessment=freshAssessment;
 assert.equal(validateFrontier(forged),false);
});
