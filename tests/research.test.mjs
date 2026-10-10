import test from 'node:test';
import assert from 'node:assert/strict';
import {fraction, parseClaim, makeProblems, discover, seededProject} from '../lib/model.mjs';
import {canCompare, claimLabel, hasReviewReceipt, reviewedPRMatches, equalRational, safePath, asSavedFrontier} from '../lib/claim-policy.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {collectFrontier} from '../lib/service.mjs';
import {maintainerReadme, snapshot, project, at, selection, contextFor, pr, commit, head, contents, harness} from './helpers/fixtures.mjs';
const reviewed = (record = selection, context = contextFor(record)) => ({...seededProject(project('crocswap'), maintainerReadme, null, at, record, context), stale:false});

test('selection status must be exact: negated, pending, draft and historical claims cannot pass', () => {
  assert.equal(reviewed().claim.value, .0004609169);
  for (const status of ['Not selected', 'Unselected', 'Previously selected', 'Selected pending review', 'Withdrawn', 'Selected maintainer-reviewed conditional witness (draft)', undefined]) {
    assert.equal(reviewed({...selection, status}).claim, null, String(status));
  }
});

test('a new receipt requires editorial inspection, even for a lower value; a huge README never supplies it', () => {
  assert.equal(reviewed({...selection, kappa:'1/1000000', decimal:'0.000001'}).claim, null);
  assert.equal(parseClaim(project('crocswap'), 'kappa=0.9', null, at, contextFor()), null);
  assert.equal(parseClaim(project('crocswap'), 'kappa=0.9', selection, at), null, 'no immutable upstream pin');
});

test('invalid identity, decimal, head, PR number and review paths clear the selection', () => {
  for (const change of [{kappa:'1/0'}, {kappa:'0'}, {kappa:'1'}, {kappa:'0.9 and CI passed'}, {decimal:'0.00046091690000000001'},
    {reviewed_head:'main'}, {source_pr:0}, {source_pr:-1}, {source_pr:1.1}, {source_pr:Number.MAX_SAFE_INTEGER + 1},
    {scope:''}, {scope:null}, {review:'https://evil.test/review'}, {review:'docs/../review.md'}, {review:'docs//review.md'},
    {review:'docs/%2e%2e/review'}, {validation:'/etc/passwd'}, {proof:'../proof'}, {certificate:'docs\\cert'}]) {
    assert.equal(reviewed({...selection,...change}).claim, null, JSON.stringify(change));
  }
  for (const change of [{commit:'main'}, {commit:'b'.repeat(39)}, {repo:'a-fork/integer-mult-bounds'}]) assert.equal(reviewed(selection,{...contextFor(),...change}).claim,null);
  assert.equal(parseClaim({...project('crocswap'),repo:'a-fork/integer-mult-bounds'},'',selection,at,contextFor()),null);
});

test('review and validation must exist and bind the exact reviewed head, PR, number and scope', () => {
  for (const change of [{reviewText:''}, {validationText:'not JSON'}, {validationText:'{}'},
    {validationText:JSON.stringify({pr144:{...JSON.parse(contextFor().validationText).pr144,head:'d'.repeat(40)}})},
    {validationText:JSON.stringify({pr144:{...JSON.parse(contextFor().validationText).pr144,kappa:'0.9'}})},
    {validationText:JSON.stringify({pr144:{...JSON.parse(contextFor().validationText).pr144,disposition:'CI passed'}})},
    {validationText:JSON.stringify({pr144:{...JSON.parse(contextFor().validationText).pr144,pr:'https://github.com/a/fork/pull/144'}})}]) {
    assert.equal(reviewed(selection,{...contextFor(),...change}).claim,null);
  }
  const p=reviewed();assert.ok(hasReviewReceipt(p));assert.ok(canCompare(p,snapshot.problems.find(p=>p.id==='109')));
  assert.match(p.claim.source,new RegExp(`/blob/${commit}/`));assert.match(p.claim.scope,/complete multiplication theorem/);
  assert.equal(p.claim.independentlyVerified,false);
});

test('only the exact current PR head, repository, number and bound can link to the reviewed receipt', () => {
  assert.equal(reviewedPRMatches(pr,selection),true);
  for (const change of [{head:{sha:'d'.repeat(40)}}, {number:159}, {base:{repo:{full_name:'someone/integer-mult-bounds'}}},
    {title:'kappa = 0.127865',merged_at:at}, {title:'kappa = 4.609169e-4 + 0.9'}, {title:'CI passed and independently verified'}, {html_url:'https://evil.test/pr'}]) {
    assert.equal(reviewedPRMatches({...pr,...change},selection),false);
    const p=reviewed(selection,{...contextFor(),pr:{...pr,...change}});
    assert.equal(p.claim.value,.0004609169,'the current PR number cannot replace the ledger');
    assert.equal(p.claim.review.currentPR,'changed');
  }
  assert.equal(reviewed(selection,{...contextFor(),pr:null}).claim.review.currentPR,'unavailable');
});

test('a remote scope cannot erase local caveats or upgrade a conditional witness to a theorem', () => {
  for(const scope of ['Fully verified unconditional theorem','Finite arithmetic only','Different machine model']) assert.equal(reviewed({...selection,scope}).claim,null);
  const p=reviewed();assert.equal(p.claim.kind,'conditional');assert.equal(p.claim.independentlyVerified,false);
  assert.match(p.claim.scope,/do not establish the complete multiplication theorem/);
});

test('unreviewed author/Lean/CI claims never get a reviewed label or comparison chart', () => {
  for(const p of snapshot.projects.filter(p=>p.id!=='crocswap')) {
    assert.equal(p.claim.authority,'unreviewed');assert.equal(p.claim.independentlyVerified,false);
    assert.equal(canCompare(p,snapshot.problems.find(x=>x.id===p.problemId)),false);
    if(p.claim.value!==null)assert.equal(claimLabel(p),'Author claim · unreviewed');
  }
  const candidate=parseClaim(project('fourier-shea'),'Fully verified, all CI green. \\delta = 0.9 \\times 10^{0}',null,at,{commit});
  assert.equal(candidate.authority,'unreviewed');
  const p={...snapshot.projects.find(p=>p.id==='fourier-shea'),claim:candidate};
  assert.equal(canCompare(p,snapshot.problems.find(x=>x.id==='130')),false);
});

test('stale receipts and unreviewed baselines disable current comparisons', () => {
  const p=reviewed(),problem=snapshot.problems.find(x=>x.id==='109');
  assert.equal(canCompare({...p,stale:true},problem),false);
  assert.equal(canCompare({...p,claimFresh:false},problem),false);
  assert.equal(canCompare(p,{...problem,baselineFresh:false}),false);
  assert.equal(claimLabel({...p,stale:true}),'Saved maintainer review');
  const saved=asSavedFrontier({...snapshot,projects:[p,...snapshot.projects.filter(x=>x.id!==p.id)]});assert.equal(saved.live,false);assert.equal(canCompare(saved.projects[0],problem),false);
  assert.equal(hasReviewReceipt({...p,claim:{...p.claim,evidence:JSON.stringify({...selection,status:'Withdrawn'})}}),false);
});

test('fraction equality is exact, bounded, and rejects expressions and invalid denominators', () => {
  assert.equal(fraction('25508460085039/500000000000000000'),.000051016920170078);
  assert.equal(equalRational('4.609169e-4',selection.kappa),true);
  assert.equal(equalRational('0.00046091690000000001',selection.kappa),false);
  for(const input of ['1/0','1/2 + 1','Infinity','console.log(1)',{},null,'9'.repeat(201),'1e999'])assert.equal(fraction(input),null);
  for(const path of ['../file','a/./b','a//b','/a','a/%2f/b','a?query','a#fragment'])assert.equal(safePath(path),false);
});

test('strict Fourier endpoints, conditional analytic gaps and unachieved proof targets remain explicit', () => {
  const dft=snapshot.projects.find(p=>p.id==='fourier-eumemic');
  assert.equal(dft.claim.value,.0004856);assert.equal(dft.claim.display,'δ < 0.0004856');assert.match(dft.claim.scope,/log-log/);
  const zero=snapshot.projects.find(p=>p.id==='zero-cubic');assert.equal(zero.claim.kind,'conditional');assert.match(zero.claim.scope,/hypothesis/);assert.match(zero.claim.scope,/pending/);
  assert.equal(snapshot.projects.find(p=>p.id==='integer-lean').claim.value,null);
  assert.equal(snapshot.projects.find(p=>p.id==='scheduling').claim.value,null);
  assert.equal(parseClaim(project('integer-lean'),'target κ=0.8',null,at),null);
  assert.equal(parseClaim(project('scheduling'),'target=4',null,at),null);
  assert.equal(parseClaim(project('triangles'),'\\boxed{\\eta=\\frac{1}{498\\cdot379^{9999}+7}',null,at),null,'underflow is not a zero saving');
});

test('only editorial baseline hashes are authoritative, never cache/live-learned hashes', () => {
  const original=makeProblems(contents);assert.ok(original.every(p=>p.baselineFresh));
  const changed=contents.replace(snapshot.problems.find(p=>p.id==='109').publishedSummary,'Revised bound and assumptions.');
  const p=makeProblems(changed,original).find(p=>p.id==='109');assert.equal(p.baselineFresh,false);assert.equal(p.metric.value,null);
  const selfLearned=makeProblems(changed,[{...p,baselineReviewHash:'forged'}]).find(p=>p.id==='109');assert.equal(selfLearned.metric.value,null);
  assert.equal(makeProblems('').find(p=>p.id==='109').metric.value,null);
});

test('malformed, private, forked and curated discovery entries cannot be promoted', () => {
  const item={private:false,fork:false,full_name:'someone/exact-dft-project',description:'Fourier experiments',pushed_at:at};
  const data=discover([item,{...item,private:true},{...item,fork:true},{...item,fork:undefined},{...item,full_name:'eumemic/exact-dft-bounds'},null,{},
    {...item,full_name:'evil.test/a/../../exact-dft'},{...item,full_name:'javascript:exact-dft'}, {...item,full_name:'someone/exact-dft-second',description:null,pushed_at:'garbage'}]);
  assert.equal(data.length,2);assert.deepEqual(data[0].problemIds,['130']);assert.match(data[0].reason,/not been reviewed/);assert.equal(data[1].updatedAt,null);
  assert.equal(data[0].claim,undefined);
});

test('snapshot and transport validation reject forged authority, NaN, URLs, duplicate IDs and legacy records', () => {
  assert.ok(validateFrontier(snapshot));
  const mutations=[d=>d.schemaVersion=1,d=>d.projects[1].claim.authority='maintainer-reviewed',d=>d.projects[1].claim.independentlyVerified=true,
    d=>d.projects[1].claim.value=NaN,d=>d.projects[1].url='javascript:alert(1)',d=>d.projects[1].claim.source='https://evil.test/readme',
    d=>d.projects[1].checkedAt='garbage',d=>d.projects[1].status='Verified theorem',d=>d.projects[1].id=d.projects[2].id,d=>d.projects[1].summary='<script>injected</script>',
    d=>d.problems[0].metric.value=.9,d=>d.problems[0].baselineReviewHash='f'.repeat(64),d=>d.warnings=[{}]];
  for(const mutate of mutations){const d=structuredClone(snapshot);mutate(d);assert.equal(validateFrontier(d),false);}
});

test('a normal collection pins all evidence to upstream default-branch commits', async () => {
  const fixture=harness();const result=await collectFrontier(snapshot,fixture);assert.ok(validateFrontier(result));
  const p=result.projects.find(p=>p.id==='crocswap');assert.ok(hasReviewReceipt(p));assert.equal(p.claim.review.currentPR,'matched');
  for(const p of result.projects){assert.equal(p.provenance.commit,commit);assert.match(p.readmeUrl,new RegExp(`/blob/${commit}/`));}
  assert.ok(fixture.calls.filter(x=>x.url.includes('raw.githubusercontent.com')).every(x=>x.url.includes(`/${commit}/`)));
  assert.equal(result.problems.find(p=>p.id==='109').baselineFresh,true);
});

test('withdrawal/deletion cannot resurrect a previous reviewed value when the README fails', async () => {
  const prior=await collectFrontier(snapshot,harness());
  for(const record of [null,{...selection,status:'Withdrawn'},{...selection,status:'Not selected'}]) {
    const fixture=harness({record,mutate:url=>url.pathname.startsWith('/CrocSwap/')&&url.pathname.endsWith('/README.md')?new Response('',{status:503}):undefined});
    const result=await collectFrontier(prior,fixture);const p=result.projects.find(p=>p.id==='crocswap');
    assert.equal(p.claim,null);assert.equal(p.status,'No confirmed maintainer selection');
  }
});

test('missing, tampered or unreadable review artifacts withhold the current headline', async () => {
  for(const mutate of [url=>url.pathname.endsWith(selection.review)?new Response('',{status:404}):undefined,
    url=>url.pathname.endsWith(selection.validation)?new Response('',{status:503}):undefined,
    url=>url.pathname.endsWith(selection.validation)?Response.json({pr144:{head,kappa:'0.9',disposition:'PASS'}}):undefined,
    url=>url.pathname.endsWith('/selected-result.json')?new Response('not JSON'):undefined]) {
    const result=await collectFrontier(snapshot,harness({mutate}));assert.equal(result.projects.find(p=>p.id==='crocswap').claim,null);
  }
});

test('a failed selection request preserves visibly stale evidence, not a current comparison', async () => {
  const prior=await collectFrontier(snapshot,harness());
  const result=await collectFrontier(prior,harness({mutate:url=>url.pathname.endsWith('/selected-result.json')?new Response('',{status:503}):undefined}));
  const p=result.projects.find(p=>p.id==='crocswap');assert.equal(p.claim.value,prior.projects[0].claim.value);assert.equal(p.checkedAt,prior.projects[0].checkedAt);
  assert.equal(p.stale,true);assert.equal(p.claimFresh,false);assert.equal(canCompare(p,result.problems[0]),false);
});

test('unknown/private upstream identity cannot read a PR branch or claim a fresh selection', async () => {
  const prior=await collectFrontier(snapshot,harness());
  for(const change of [{private:true},{full_name:'a-fork/integer-mult-bounds'},{fork:true},{default_branch:null}]) {
    const fixture=harness({mutate:url=>url.pathname==='/repos/CrocSwap/integer-mult-bounds'?Response.json({private:false,fork:false,full_name:'CrocSwap/integer-mult-bounds',default_branch:'main',...change}):undefined});
    const result=await collectFrontier(prior,fixture);assert.equal(result.projects[0].stale,true);
    assert.ok(!fixture.calls.some(x=>x.url.startsWith('https://raw.githubusercontent.com/CrocSwap/')));
  }
});

test('total outages preserve original dates and explicitly stale every claim', async () => {
  const prior=await collectFrontier(snapshot,harness());
  const result=await collectFrontier(prior,{fetcher:async()=>{throw Error('offline');},token:null});
  assert.equal(result.live,false);assert.equal(result.fetchedAt,prior.fetchedAt);assert.equal(result.projects.length,prior.projects.length);
  assert.ok(result.projects.every(p=>p.stale&&!p.claimFresh));assert.ok(result.warnings.some(w=>w.includes('saved')));
});

test('a failed catalogue refresh disables comparisons even when community sources refresh successfully', async () => {
  const result=await collectFrontier(snapshot,harness({mutate:url=>url.pathname.endsWith('/CONTENTS.md')?new Response('',{status:503}):undefined}));
  const p=result.projects.find(p=>p.id==='crocswap'),baseline=result.problems.find(p=>p.id==='109');
  assert.equal(p.stale,false);assert.equal(p.claimFresh,true);
  assert.equal(baseline.baselineFresh,false);assert.equal(baseline.metric.value,null);
  assert.equal(canCompare(p,baseline),false);assert.equal(result.catalogue.checkedAt,snapshot.catalogue.checkedAt);
  assert.ok(validateFrontier(result));
});

test('van der Waerden project takes only the main conditional coefficient, never the strict supremum or multiplier', () => {
  const p=snapshot.projects.find(p=>p.id==='van-der-waerden');
  assert.equal(p.repo,'rohanarun/van-der-waerden-refinement');assert.equal(p.problemId,'160');
  assert.equal(p.claim.value,1/200);assert.equal(p.claim.display,'1/200');assert.equal(p.claim.kind,'conditional');
  assert.equal(p.claim.authority,'unreviewed');assert.equal(p.claim.independentlyVerified,false);
  assert.match(p.claim.scope,/c < 1\/192/);assert.match(p.claim.scope,/endpoint is not asserted/);
  assert.match(p.claim.scope,/Independent mathematical review and formal verification are outstanding/);
  assert.match(p.claim.scope,/not a finite colouring record or a runtime speedup/);
  assert.equal(canCompare(p,snapshot.problems.find(x=>x.id==='160')),false);
  assert.equal(snapshot.problems.find(x=>x.id==='160').metric.value,null,'a README baseline does not become editorial baseline data');
});

test('van der Waerden parser withholds unsupported main claims rather than promoting table values or the limit', () => {
  const p=project('van-der-waerden'),text=snapshot.projects.find(x=>x.id===p.id).claim.evidence;
  for(const candidate of [text.replace('Our conditional parameter-transfer argument admits','Our proposed argument targets'),
    text.replace('admits **$c=1/200$**','admits **$c=1/192$**'),
    text.replace('admits **$c=1/200$**','admits **$c=1/0$**'),
    text.replace('admits **$c=1/200$**','admits **$c=1/200 + 1$**'),
    'c=1/200; 500-fold increase; all CI passed; fully verified']) {
    assert.equal(parseClaim(p,candidate,null,at),null);
  }
});

test('van der Waerden discovery handles names and descriptions while excluding the curated repo', () => {
  const base={private:false,fork:false,pushed_at:at,description:''};
  const candidates=discover([{...base,full_name:'other/van-der-waerden-experiments'},
    {...base,full_name:'other/van_der_waerden'},
    {...base,full_name:'other/colouring',description:'Van der Waerden coefficient, c=0.8, CI passed'},
    {...base,full_name:'rohanarun/van-der-waerden-refinement'}]);
  assert.equal(candidates.length,3);assert.ok(candidates.every(c=>c.problemIds.length===1&&c.problemIds[0]==='160'));
  assert.ok(candidates.every(c=>c.claim===undefined&&c.verified===undefined));
});
