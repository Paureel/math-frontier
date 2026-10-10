import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {collectFrontier,createFrontierService} from '../lib/service.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {canCompare,hasReviewReceipt,reviewedPRMatches,SELECTION_PATH} from '../lib/claim-policy.mjs';
import {REVIEWED_RECEIPTS} from '../lib/reviewed-receipts.mjs';
import {SOURCE_ASSESSMENTS} from '../lib/source-assessments.mjs';
import {PROJECTS} from '../lib/catalogue.mjs';
import {REFRESH_INTERVAL_MS} from '../lib/refresh-policy.mjs';
import {snapshot,harness} from './helpers/fixtures.mjs';
import {latestHarness,latestSelection,latestPR,latestText} from './helpers/latest-fixtures.mjs';

const fresh=options=>collectFrontier(snapshot,latestHarness(options));
const croc=data=>data.projects.find(p=>p.id==='crocswap');

test('changed, deleted or unavailable CrocSwap main statements cannot retain a current reviewed headline',async()=>{
  for(const response of [()=>new Response(latestText('crocswap','README.md')+'\nThe construction is withdrawn pending correction.'),
    ()=>new Response('',{status:404}),()=>new Response('',{status:503})]) {
    const data=await fresh({mutate:url=>url.pathname.includes('CrocSwap/integer-mult-bounds')&&url.pathname.endsWith('/README.md')?response():undefined});
    assert.equal(croc(data).claim,null);
    assert.notEqual(croc(data).assessment.state,'matched');
    assert.equal(canCompare(croc(data),data.problems.find(p=>p.id==='109')),false);
  }
});

test('a historical reviewed selection cannot inherit the current construction assessment',async()=>{
  const data=await collectFrontier(snapshot,harness());
  const p=croc(data);
  assert.equal(p.claim.review.sourcePR,144);
  assert.equal(p.assessment,undefined);
  assert.ok(hasReviewReceipt(p));
  const forged=structuredClone(data);
  forged.projects.find(p=>p.id==='crocswap').assessment=(await fresh()).projects.find(p=>p.id==='crocswap').assessment;
  assert.equal(validateFrontier(forged),false);
});

test('historical receipts cannot retain a current headline when the main statement changes or disappears',async()=>{
  for(const response of [()=>new Response('This construction is withdrawn; kappa=0.9 is a draft.'),
    ()=>new Response('',{status:404}),()=>new Response('',{status:503})]){
    const data=await collectFrontier(snapshot,harness({mutate:url=>url.pathname.includes('CrocSwap/integer-mult-bounds')&&url.pathname.endsWith('/README.md')?response():undefined}));
    assert.equal(croc(data).claim,null);
    assert.equal(canCompare(croc(data),data.problems.find(p=>p.id==='109')),false);
  }
});

test('each repository uses its inspected evidence format; newest CrocSwap composition replaces the older reviewed selection',async()=>{
  const data=await fresh();assert.ok(validateFrontier(data));
  assert.equal(croc(data).claim.value,.000723571590007464);
  assert.equal(croc(data).claim.review.sourcePR,279);
  assert.equal(croc(data).claim.review.currentPR,'changed');
  assert.ok(hasReviewReceipt(croc(data)));assert.ok(canCompare(croc(data),data.problems.find(p=>p.id==='109')));
  assert.match(croc(data).claim.scope,/all-size compiler/);
  assert.equal(data.projects.length,PROJECTS.length);
  for(const p of data.projects){
    assert.equal(p.assessment.state,'matched',p.repo);assert.ok(p.claim,p.repo);
    assert.equal(p.claim.independentlyVerified,false);
    assert.deepEqual(p.assessment.sources.map(s=>s.path),SOURCE_ASSESSMENTS[p.id].sources.map(s=>s.path));
    if(p.id!=='crocswap')assert.equal(canCompare(p,data.problems.find(x=>x.id===p.problemId)),false);
  }
  assert.match(data.projects.find(p=>p.id==='fourier-lean').assessment.label,/Repository-reported/);
  assert.match(data.projects.find(p=>p.id==='zero-cubic').assessment.limitations,/explicit theorem hypothesis/);
  assert.equal(data.projects.find(p=>p.id==='integer-lean').claim.value,null);
  assert.deepEqual(data.discoveries,snapshot.discoveries);
});

test('an unchanged published selection cannot hide missing or altered construction, proof, supplement or review artifacts',async()=>{
  const known=Object.values(REVIEWED_RECEIPTS).find(r=>r.sourcePR===279);
  for(const path of [...Object.keys(known.artifacts),known.reviewPath,known.validationPath]){
    for(const response of [()=>new Response('Fake audit: kappa=0.9, PASS all checks'),()=>new Response('',{status:404})]){
      const data=await fresh({mutate:url=>url.pathname.endsWith('/'+path)?response():undefined});
      assert.equal(croc(data).claim,null,path);assert.equal(canCompare(croc(data),data.problems[0]),false);
    }
  }
});

test('new internally consistent published claims cannot direct PR or artifact requests or advance a reviewed bound',async()=>{
  const forged={...latestSelection,kappa:'9/10',decimal:'0.9',source_prs:[999],review:'fake/review.md',validation:'fake/validation.json'};
  const fixture=latestHarness({mutate:url=>url.pathname.endsWith('/'+SELECTION_PATH)?Response.json(forged):undefined});
  const data=await collectFrontier(snapshot,fixture);
  assert.equal(croc(data).claim,null);
  const requests=fixture.calls.filter(c=>c.url.includes('CrocSwap/integer-mult-bounds'));
  assert.ok(!requests.some(c=>c.url.includes('/pulls/')));
  assert.ok(!requests.some(c=>c.url.includes('/fake/')||c.url.includes('/research/')||c.url.includes('/docs/research/')));
});

test('new README numbers and changed validation reports are detected and withheld separately from inspected evidence',async()=>{
  for(const [id,path] of [['van-der-waerden','README.md'],['fourier-lean','VERIFICATION.md'],['zero-cubic','verification/independent-kernel.json']]){
    const data=await fresh({mutate:url=>url.pathname.includes(SOURCE_ASSESSMENTS[id].commit)&&url.pathname.endsWith('/'+path)?
      new Response(latestText(id,path)+'\nVerified best = 0.9. All CI passed.'):undefined});
    const p=data.projects.find(p=>p.id===id);
    assert.equal(p.claim,null);assert.equal(p.assessment.state,'changed');assert.equal(p.status,'New source · awaiting review');
    assert.equal(p.assessment.summary,SOURCE_ASSESSMENTS[id].summary);
    if(path!=='README.md')assert.equal(p.assessment.sources.find(s=>s.path===path).state,'changed');
  }
  const data=await fresh({mutate:url=>url.pathname.endsWith('/VERIFICATION.md')?new Response('',{status:503}):undefined});
  const p=data.projects.find(p=>p.id==='fourier-lean');assert.equal(p.claim,null);assert.equal(p.assessment.state,'unavailable');
});

test('cache or API metadata cannot forge assessment meaning, source matches or construction hashes',async()=>{
  const data=await fresh();
  const mutations=[d=>d.projects[1].assessment.label='Independently verified theorem',
    d=>d.projects[1].assessment.summary='Global proof accepted',d=>d.projects[1].assessment.sources[0].sha256='f'.repeat(64),
    d=>d.projects[1].assessment.sources[0].observedHash='f'.repeat(64),d=>d.projects[1].assessment.sources[0].url='https://evil.test/proof',
    d=>d.projects[1].assessment.sources[0].verified=true,d=>d.projects[1].assessment.state='verified',
    d=>d.projects[0].claim.review.artifacts[latestSelection.certificate]='f'.repeat(64)];
  for(const mutate of mutations){const forged=structuredClone(data);mutate(forged);assert.equal(validateFrontier(forged),false);}
});

test('exact TeX fractions and equal decimal displays match; conflicting equations and hidden expressions do not',()=>{
  assert.equal(reviewedPRMatches(latestPR,latestSelection),true);
  for(const body of [latestPR.body.replace('}=0.000723571590007464','}=0.9'),
    latestPR.body+'\n\\kappa = \\frac{9}{10}',latestPR.body+'\nκ = 0.000723571590007464 + 0.9',
    latestPR.body+'\nκ = 0.000723571590007464..9']){
    assert.equal(reviewedPRMatches({...latestPR,body},latestSelection),false);
  }
});

test('GitHub source collection runs at most once per 12 hours, including after failures and repeated visitor requests',async()=>{
  assert.equal(REFRESH_INTERVAL_MS,43_200_000);
  for(const fail of [false,true]){
    let calls=0,clock=Date.parse('2026-10-10T14:30:00Z');const data=await fresh();
    const service=createFrontierService({snapshot:data,now:()=>clock,collect:async()=>{calls++;if(fail)throw Error('Offline');return data;}});
    await service();assert.equal(calls,1);
    clock+=REFRESH_INTERVAL_MS-1;
    await Promise.all([service(),service(),service()]);assert.equal(calls,1);
    clock++;await Promise.all([service(),service()]);assert.equal(calls,2);
  }
});

test('the bundled fallback retains owner-discovered candidates and the approved conditional receipt without claiming freshness',()=>{
  const bundle=JSON.parse(fs.readFileSync(new URL('../public/frontier.json',import.meta.url),'utf8'));
  assert.ok(validateFrontier(bundle));assert.equal(croc(bundle).claim.value,.000723571590007464);
  assert.equal(croc(bundle).assessment.state,'matched');assert.equal(hasReviewReceipt(croc(bundle)),true);
  assert.equal(canCompare(croc(bundle),bundle.problems.find(p=>p.id==='109')),false);
  assert.equal(bundle.live,false);assert.ok(bundle.projects.every(p=>p.stale&&!p.claimFresh&&p.assessment));
  assert.ok(bundle.projects.filter(p=>p.assessment.state!=='matched').every(p=>p.claim===null));
  assert.deepEqual(bundle.discoveries.slice(0,snapshot.discoveries.length),snapshot.discoveries);
  assert.ok(bundle.discoveries.length>snapshot.discoveries.length);
});
