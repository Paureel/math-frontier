import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {packFrontier,unpackFrontier} from '../lib/transport.mjs';
import {hasReviewReceipt,canCompare,claimLabel} from '../lib/claim-policy.mjs';
import {collectFrontier} from '../lib/service.mjs';
import {snapshot} from './helpers/fixtures.mjs';
import {latestHarness} from './helpers/latest-fixtures.mjs';
const bundle=JSON.parse(fs.readFileSync(new URL('../public/frontier.json',import.meta.url)));

test('compact updates preserve exact review receipts, every metric, assessment, scope and provenance',async()=>{
  const current=await collectFrontier(snapshot,latestHarness());
  for(const data of [snapshot,bundle,current]) {
    const restored=unpackFrontier(packFrontier(data));
    for(const p of data.projects) {
      const next=restored.projects.find(x=>x.id===p.id);
      assert.equal(hasReviewReceipt(next),hasReviewReceipt(p));
      assert.equal(canCompare(next,restored.problems.find(x=>x.id===p.problemId)),canCompare(p,data.problems.find(x=>x.id===p.problemId)));
      assert.deepEqual(next.assessment,p.assessment);
      assert.deepEqual(next.provenance,p.provenance);
      assert.equal(claimLabel(next),p.status);
      assert.deepEqual(next.claim,p.claim?.authority==='unreviewed'?{...p.claim,evidence:''}:p.claim);
    }
    assert.deepEqual(restored.problems.map(p=>p.metric),data.problems.map(p=>p.metric));
    assert.deepEqual(restored.discoveries,data.discoveries);
  }
});

test('compact transport rejects fake results, forged receipts, evidence changes, approval fields and mismatched source observations',async()=>{
  const current=await collectFrontier(snapshot,latestHarness());
  const mutations=[
    w=>w.verifiedBest=.9,
    w=>w.projects[0].claim.value=.9,
    w=>w.projects[0].claim.review.kappa='9/10',
    w=>w.projects[0].claim.review.selectionHash='f'.repeat(64),
    w=>w.projects[0].claim.review.artifacts['research/five-stage-gen4-banks/PROOF.md']='f'.repeat(64),
    w=>w.projects[0].claim.evidence='{"kappa":"9/10"}',
    w=>w.projects[0].assessmentHashes=null,
    w=>{w.projects[0].assessmentHashes=null;w.projects[0].sourceHash='f'.repeat(64);},
    w=>w.projects[0].sourceHash='f'.repeat(64),
    w=>w.projects[1].claim.authority='maintainer-reviewed',
    w=>w.projects[1].claim.independentlyVerified=true,
    w=>w.projects[1].claim.scope='All integers, fully verified',
    w=>w.projects[1].assessmentHashes[0]='f'.repeat(64),
    w=>w.projects[1].assessmentHashes[0]={verified:true},
    w=>w.projects[1].assessmentHashes.pop(),
    w=>w.projects[1].assessment={state:'verified'},
    w=>w.projects[1].sourceHash='f'.repeat(64),
    w=>w.projects[1].commit='main',
    w=>w.problems[0].metric={value:.9},
    w=>w.problems[0].baselineFresh='verified',
    w=>w.projects[0]=w.projects[1]
  ];
  for(const mutate of mutations) {
    const wire=structuredClone(packFrontier(current));mutate(wire);
    assert.throws(()=>unpackFrontier(wire),/Unsupported/);
  }
});

test('removing an assessment cannot make an uninspected current README eligible for comparison',async()=>{
  const current=await collectFrontier(snapshot,latestHarness());
  const forged=structuredClone(current);delete forged.projects[0].assessment;
  assert.equal(hasReviewReceipt(forged.projects[0]),false);
  assert.equal(canCompare(forged.projects[0],forged.problems.find(p=>p.id==='109')),false);
  assert.throws(()=>packFrontier(forged),/Unsupported/);
});

test('changed, withdrawn and unavailable sources survive compact transport with headlines withheld',async()=>{
  for(const override of [()=>new Response('Fake result κ=0.9'),()=>new Response('',{status:503})]) {
    const data=await collectFrontier(snapshot,latestHarness({mutate:url=>url.pathname.endsWith('/VERIFICATION.md')?override():undefined}));
    const p=unpackFrontier(packFrontier(data)).projects.find(p=>p.id==='fourier-lean');
    assert.equal(p.claim,null);assert.equal(canCompare(p,data.problems.find(x=>x.id===p.problemId)),false);
    assert.notEqual(p.assessment.state,'matched');
  }
});
