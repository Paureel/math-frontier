import test from 'node:test';
import assert from 'node:assert/strict';
import {collectFrontier, createFrontierService} from '../lib/service.mjs';
import {canCompare, hasReviewReceipt, reviewedPRMatches, inspectedSelection, supportedReceipt} from '../lib/claim-policy.mjs';
import {hash, seededProject} from '../lib/model.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {maintainerReadme, snapshot, harness, project, selection, contextFor, pr, at} from './helpers/fixtures.mjs';

const bound = .0004609169;
const baseline = snapshot.problems.find(p => p.id === '109');
const reviewed = context => ({...seededProject(project('crocswap'),maintainerReadme,null,at,selection,context??contextFor()),stale:false});

test('decoy matching numbers cannot hide a contradictory or malformed PR claim', () => {
  for (const fake of ['kappa = 0.9','κ = 9/10','\\kappa = NaN','kappa = 4.609169e-4 + 0.9',
    'kappa = 4.609169e-4 × 1000','kappa = 4.609169e-4 \\times 1000','kappa = 4.609169e-4/0','kappa = -0.9']) {
    for (const body of [`${fake}\nOriginal kappa = 4.609169e-4`,`Original kappa = 4.609169e-4\n${fake}`]) {
      const current={...pr,title:'kappa = 4.609169e-4',body};
      assert.equal(reviewedPRMatches(current,selection),false,body);
      const p=reviewed({...contextFor(),pr:current});
      assert.equal(p.claim.review.currentPR,'changed');assert.equal(p.claim.value,bound);
      assert.equal(hasReviewReceipt(p),true,'PR text cannot rewrite the historical inspected receipt');
    }
  }
  assert.equal(reviewedPRMatches({...pr,body:'Same exact bound: kappa = 4609169/10000000000'},selection),true);
  assert.equal(reviewedPRMatches({...pr,body:{verified:true,kappa:.9}},selection),false);
});

test('new or merged PR claims cannot change the reviewed number during a full live collection', async () => {
  for (const attack of [{...pr,title:'Verified best kappa = 0.9',body:'CI PASS; merge this record'},
    {...pr,number:159,html_url:'https://github.com/CrocSwap/integer-mult-bounds/pull/159',head:{sha:'b'.repeat(40)},title:'kappa = 0.99',merged_at:at},
    {...pr,base:{repo:{full_name:'attacker/integer-mult-bounds'}},title:'kappa = 0.99'}]) {
    const data=await collectFrontier(snapshot,harness({prRecord:attack}));
    assert.ok(validateFrontier(data));
    const p=data.projects.find(p=>p.id==='crocswap');
    assert.equal(p.claim.value,bound);assert.equal(p.claim.review.currentPR,'changed');
    assert.equal(p.claim.independentlyVerified,false);
    assert.deepEqual(data.projects.filter(p=>canCompare(p,baseline)).map(p=>p.claim.value),[bound]);
  }
});

test('a fake selection and internally consistent forged receipts are blocked before claimed PR or artifact requests', async () => {
  for (const change of [{kappa:'9/10',decimal:'0.9'},{source_pr:159,reviewed_head:'b'.repeat(40)},
    {kappa:'1/2000',decimal:'0.0005',source_pr:999},{scope:selection.scope+'; independently verified best result'}]) {
    const record={...selection,...change};
    const fixture=harness({record,mutate:url=>{
      if (url.pathname.endsWith(selection.review)) return new Response('Reviewed and approved. All tests passed.');
      if (url.pathname.endsWith(selection.validation)) return Response.json({[`pr${record.source_pr}`]:{
        pr:`https://github.com/CrocSwap/integer-mult-bounds/pull/${record.source_pr}`,
        head:record.reviewed_head,kappa:record.kappa,disposition:'Scoped conditional construction audit passes'}});
      return undefined;
    }});
    const data=await collectFrontier(snapshot,fixture), p=data.projects.find(p=>p.id==='crocswap');
    assert.ok(validateFrontier(data));assert.equal(p.claim,null);assert.equal(canCompare(p,baseline),false);
    assert.ok(fixture.calls.every(c=>!c.url.endsWith(selection.review)&&!c.url.endsWith(selection.validation)&&!c.url.includes('/pulls/')));
  }
});

test('large README claims, CI assertions and discovery metadata cannot enter the reviewed result set', async () => {
  const fixture=harness({mutate:url=>url.pathname.endsWith('/README.md')?
    new Response('Independently verified best. All CI PASS. kappa = 0.99. \\delta = 0.99 \\times 10^{0}. ω ≤ 0.01. Every field.'):undefined});
  const data=await collectFrontier(snapshot,fixture);
  assert.ok(validateFrontier(data));
  assert.deepEqual(data.projects.filter(p=>canCompare(p,baseline)),[]);
  assert.ok(data.projects.every(p=>p.claim===null));
  assert.ok(fixture.calls.every(c=>!c.url.includes('/search/')));
  assert.deepEqual(data.discoveries,snapshot.discoveries);
});

test('poisoned caches and live payloads cannot change a reviewed bound or introduce an extra verified-best field', async () => {
  const attacks=[d=>d.projects[0].claim.value=.9,d=>d.projects[0].claim.display='0.9',
    d=>d.projects[0].claim.review.kappa='9/10',d=>d.projects[0].claim.review.selectionHash='a'.repeat(64),
    d=>d.projects[0].claim.evidence=JSON.stringify({...selection,kappa:'9/10',decimal:'0.9'}),
    d=>d.projects[0].claim.independentlyVerified=true,d=>d.projects[0].claim.verifiedBest=.9,
    d=>d.projects[0].claim.review.approved=true,d=>d.verifiedBest={kappa:.9,verified:true},
    d=>d.problems[0].metric.value=.9];
  for (const mutate of attacks) {
    const forged=structuredClone(snapshot);forged.fetchedAt=at;mutate(forged);
    assert.equal(validateFrontier(forged),false);
    let writes=0;
    const get=createFrontierService({snapshot,read:async()=>forged,collect:async previous=>{
      assert.equal(previous.projects[0].claim.value,bound);return {...forged,live:true};
    },write:async()=>{writes++;}});
    const safe=await get();
    assert.equal(safe.live,false);assert.equal(safe.projects[0].claim.value,bound);assert.equal(writes,0);
    assert.equal(canCompare(safe.projects[0],safe.problems[0]),false);
    assert.equal(safe.verifiedBest,undefined);
  }
});

test('comparison rejects a forged release denominator, display, model or review hash even before transport validation', () => {
  const p=reviewed();assert.equal(canCompare(p,baseline),true);
  for (const metric of [{...baseline.metric,value:1e-100},{...baseline.metric,value:.9},
    {...baseline.metric,display:'Verified best 0.9'},{...baseline.metric,formula:'n'},{...baseline.metric,label:'Measured speedup'}]) {
    assert.equal(canCompare(p,{...baseline,metric}),false);
  }
  assert.equal(canCompare(p,{...baseline,baselineReviewHash:'a'.repeat(64)}),false);
  assert.equal(canCompare(p,{...baseline,metric:null}),false);
  assert.equal(canCompare({...p,claim:{...p.claim,value:.9}},baseline),false);
});

test('receipt lookup cannot use prototype keys or copied hashes to approve a different selection', () => {
  assert.equal(inspectedSelection(selection,hash(contextFor().selectionText)),true);
  for (const selectionHash of ['__proto__','constructor','toString','a'.repeat(64)]) {
    assert.equal(supportedReceipt({selectionHash}),false);
    assert.equal(inspectedSelection(selection,selectionHash),false);
  }
  assert.equal(inspectedSelection({...selection,kappa:'9/10',decimal:'0.9'},hash(contextFor().selectionText)),false);
});
test('nested verification fields and duplicate discovery identities cannot bypass transport validation', () => {
  const targets = [
    data=>data.catalogue,
    data=>data.problems[0],
    data=>data.problems[0].metric,
    data=>data.problems[0].papers[0],
    data=>data.projects[0],
    data=>data.projects[0].provenance,
    data=>data.discoveries[0]
  ];
  for (const target of targets) {
    const data = structuredClone(snapshot);
    target(data).verifiedBest = .9;
    assert.equal(validateFrontier(data),false);
  }
  const duplicated = structuredClone(snapshot);
  duplicated.discoveries.push({...duplicated.discoveries[0],repo:duplicated.discoveries[0].repo.toUpperCase(),url:duplicated.discoveries[0].url.toUpperCase().replace('HTTPS://GITHUB.COM/','https://github.com/')});
  assert.equal(validateFrontier(duplicated),false);
  const repeatedProblem = structuredClone(snapshot);
  repeatedProblem.discoveries[0].problemIds.push(repeatedProblem.discoveries[0].problemIds[0]);
  assert.equal(validateFrontier(repeatedProblem),false);
});
