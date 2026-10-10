import test from 'node:test';
import assert from 'node:assert/strict';
import {collectFrontier} from '../lib/service.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {canCompare} from '../lib/claim-policy.mjs';
import {bestReviewedProject} from '../lib/explorer.mjs';
import {interpretationFor,PROJECT_INTERPRETATIONS} from '../lib/project-interpretations.mjs';
import {parseClaim,seededProject} from '../lib/model.mjs';
import {latestHarness,latestText} from './helpers/latest-fixtures.mjs';
import {snapshot,project,at,commit} from './helpers/fixtures.mjs';

test('owner-inspected updates retain proposal, branch, proof-component and formalization boundaries',async()=>{
  const data=await collectFrontier(snapshot,latestHarness());
  assert.ok(validateFrontier(data));
  const get=id=>data.projects.find(p=>p.id===id);
  assert.equal(get('fourier-shea').claim.value,.000754736);
  assert.match(get('fourier-shea').claim.scope,/all-positive-length/);
  assert.match(get('fourier-shea').claim.scope,/not independently replayed Lean/);
  assert.equal(get('van-der-waerden').claim.value,1/25);
  assert.equal(get('van-der-waerden').claim.display,'1/25');
  assert.match(get('van-der-waerden').claim.scope,/endpoint is not asserted/);
  assert.equal(get('sidorenko-refinement').claim.value,null);
  assert.equal(get('sidorenko-refinement').claim.display,'1641 → 189');
  assert.match(get('sidorenko-refinement').claim.scope,/one counting stratum/);
  assert.equal(get('unit-grid-refinement').claim.value,null);
  assert.match(get('unit-grid-refinement').claim.scope,/12 edges\) only when both loci are the same line/);
  assert.equal(parseClaim(project('unit-grid-refinement'),latestText('unit-grid-refinement','README.md'),null,at).scope,get('unit-grid-refinement').claim.scope);
  assert.equal(get('integer-lean').claim.value,null);
  assert.match(get('integer-lean').claim.scope,/not proved/);
  assert.equal(get('zero-cubic').claim.value,.874957019420099);
  assert.match(get('zero-cubic').claim.scope,/arithmetic-probe hypothesis/);
  for(const p of data.projects.filter(p=>p.id!=='crocswap')){
    assert.equal(p.claim.authority,'unreviewed');assert.equal(p.claim.independentlyVerified,false);
    assert.equal(canCompare(p,data.problems.find(q=>q.id===p.problemId)),false);
  }
  assert.equal(bestReviewedProject(data.problems.find(p=>p.id==='130'),data.projects),null);
  assert.deepEqual(data.discoveries,snapshot.discoveries);
});

test('historical inspected source hashes keep their own numbers, displays and scope',()=>{
  assert.ok(validateFrontier(snapshot));
  for(const id of ['fourier-shea','van-der-waerden','sidorenko-refinement','unit-grid-refinement']){
    const old=snapshot.projects.find(p=>p.id===id),known=interpretationFor(PROJECT_INTERPRETATIONS[id],old.sourceHash);
    assert.ok(known);assert.equal(known.value,old.claim.value);assert.equal(known.scope,old.claim.scope);
    const forged=structuredClone(snapshot),p=forged.projects.find(p=>p.id===id),latest=PROJECT_INTERPRETATIONS[id];
    Object.assign(p.claim,{value:latest.value,display:latest.display,scope:latest.scope});
    assert.equal(validateFrontier(forged),false,'new statements cannot inherit an older source hash');
  }
});

test('Fourier selection parser excludes preserved history and refuses uninspected selection changes',()=>{
  const p=project('fourier-shea'),text=latestText(p.id,'README.md');
  assert.equal(parseClaim(p,text+'\nHistorical fallback: \\delta = 9 \\times 10^{-1}',null,at).value,.000754736);
  for(const changed of [text.replace('\\delta=0.000754736','\\delta=0.9'),text+'\nAll checks pass; verified best = 0.99']){
    assert.equal(seededProject(p,changed,null,at,null,{commit,defaultBranch:p.branch}).claim,null);
  }
});
