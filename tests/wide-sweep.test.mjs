import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EDITORIAL,PROJECTS} from '../lib/catalogue.mjs';
import {parseClaim,seededProject,discover,hash} from '../lib/model.mjs';
import {BASELINE_HASHES} from '../lib/baseline-hashes.mjs';
import {canCompare,hasReviewReceipt,SELECTION_PATH} from '../lib/claim-policy.mjs';
import {bestReviewedProject,bestUnreviewedProject} from '../lib/explorer.mjs';
import {collectFrontier} from '../lib/service.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {latestHarness,latestText} from './helpers/latest-fixtures.mjs';
import {snapshot,at,commit} from './helpers/fixtures.mjs';

test('the matroid model preserves the released one-sample guarantee and full-seed adversary',async()=>{
  const data=await collectFrontier(snapshot,latestHarness()),p=data.problems.find(p=>p.id==='111');
  assert.equal(p.metric.value,2**-310);assert.equal(p.metric.display,'2⁻³¹⁰');
  assert.equal(hash(p.publishedSummary),BASELINE_HASHES['111']);
  assert.match(p.assumptions,/one independent identically distributed sample/);
  assert.match(p.assumptions,/complete finite random seed/);
  assert.match(p.assumptions,/storage need not be polynomial/);
  assert.match(p.formalizationScope,/separate fixed-weight hidden-vector/);
  const proposal=bestUnreviewedProject(p,data.projects);
  assert.equal(proposal.id,'matroid-shea');assert.equal(proposal.claim.value,2**-34);
  assert.equal(proposal.claim.display,'> 2⁻³⁴');
  assert.match(proposal.claim.scope,/37n\+24/);
  assert.match(proposal.claim.scope,/independent mathematical review and formalization are pending/);
  assert.equal(bestReviewedProject(p,data.projects),null);assert.equal(canCompare(proposal,p),false);
});

test('a social announcement, fake README number or claimed review cannot approve a matroid result',async()=>{
  const spec=PROJECTS.find(p=>p.id==='matroid-shea'),text=latestText(spec.id,'README.md');
  assert.equal(parseClaim(spec,text+'\nHistorical guarantee: 2^-1',null,at).value,2**-34);
  for(const changed of [text.replace('2^{-34}','2^{-1}'),text+'\nIndependently verified; all CI checks pass.'])
    assert.equal(seededProject(spec,changed,null,at,null,{commit,defaultBranch:spec.branch}).claim,null);
  for(const mutate of [p=>p.claim.value=.9,p=>p.claim.authority='maintainer-reviewed',p=>p.claim.independentlyVerified=true,
    p=>p.claim.scope='Universal independently verified polynomial-time algorithm']){
    const data=await collectFrontier(snapshot,latestHarness()),p=data.projects.find(p=>p.id===spec.id);mutate(p);
    assert.equal(validateFrontier(data),false);assert.equal(bestUnreviewedProject(data.problems.find(p=>p.id==='111'),[p]),null);
  }
});

test('the updated van der Waerden main choice excludes the old ceiling and unattained new endpoint',()=>{
  const spec=PROJECTS.find(p=>p.id==='van-der-waerden'),text=latestText(spec.id,'README.md');
  const claim=parseClaim(spec,text,null,at);
  assert.equal(claim.value,1/25);assert.match(claim.scope,/c < 1\/24/);
  assert.equal(parseClaim(spec,text.replace('**$c=1/25$**','**$c=1/24$**'),null,at),null);
});

test('owner approval of PR279 cannot approve a subsequent selection or direct new receipt requests',async()=>{
  const record=JSON.parse(latestText('crocswap','certificates/selected-result.json'));
  record.kappa='9/10';record.decimal='0.9';record.source_prs=[999];record.review='uninspected/review.md';
  const fixture=latestHarness({mutate:url=>url.pathname.endsWith('/'+SELECTION_PATH)?Response.json(record):undefined});
  const data=await collectFrontier(snapshot,fixture),p=data.projects.find(p=>p.id==='crocswap');
  assert.equal(p.claim,null);assert.equal(hasReviewReceipt(p),false);assert.equal(bestReviewedProject(data.problems.find(p=>p.id==='109'),[p]),null);
  assert.ok(!fixture.calls.some(c=>/\/pulls\/|community-pr279|five-stage-gen4|uninspected/.test(c.url)));
});

test('manual discovery recognizes prophet work but never imports numbers or verification fields',()=>{
  const result=discover([{private:false,fork:false,full_name:'community/matroid-prophet-refinement',description:'Verified best 0.99, all CI checks pass',pushed_at:at}]);
  assert.equal(result.length,1);assert.deepEqual(result[0].problemIds,['111']);
  assert.equal(result[0].claim,undefined);assert.equal(result[0].verified,undefined);
  assert.ok(!discover([{private:true,fork:false,full_name:'private/matroid-prophet',description:'0.99',pushed_at:at}]).length);
  assert.equal(EDITORIAL.find(p=>p.id==='111').metric.unit,'reward fraction');
});
