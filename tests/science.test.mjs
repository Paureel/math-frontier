import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {EDITORIAL} from '../lib/catalogue.mjs';
import {parseClaim,seededProject,hash,makeProblems} from '../lib/model.mjs';
import {canCompare,hasReviewReceipt} from '../lib/claim-policy.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {maintainerReadme, snapshot,project,at,selection,contextFor,commit,contents} from './helpers/fixtures.mjs';
const reviewed=()=>({...seededProject(project('crocswap'),maintainerReadme,null,at,selection,contextFor()),stale:false});

test('all released-model formulas render strictly and contain no escape-generated control characters', () => {
  for(const p of EDITORIAL){
    assert.doesNotMatch(p.metric.formula,/[\x00-\x1f]/,p.id);
    assert.doesNotThrow(()=>katex.renderToString(p.metric.formula,{throwOnError:true,trust:false,strict:'error'}),p.id);
  }
});

test('a reviewed multiplication witness cannot be compared with another problem or metric model', () => {
  const p=reviewed(),baseline=snapshot.problems.find(p=>p.id==='109');
  assert.equal(canCompare(p,baseline),true);
  for(const other of snapshot.problems.filter(p=>p.id!=='109'))assert.equal(canCompare(p,other),false,other.id);
  for(const metric of [{...baseline.metric,direction:'lower'},{...baseline.metric,symbol:'δ'},{...baseline.metric,unit:'seconds'}])
    assert.equal(canCompare(p,{...baseline,metric}),false);
});

test('nonempty, modified, or newly fabricated review receipts cannot approve themselves', () => {
  const context=contextFor();
  for(const change of [{reviewText:'Reviewed, fully verified, all CI green.'},{reviewText:context.reviewText+'\nNew unconditional conclusion'},
    {validationText:context.validationText+'\n'},
    {selectionText:JSON.stringify({...selection,kappa:'0.9'})}])
    assert.equal(parseClaim(project('crocswap'),'',selection,at,{...context,...change}),null);
  const p=reviewed();assert.equal(hasReviewReceipt(p),true);
  for(const change of [{reviewHash:'a'.repeat(64)},{validationHash:'b'.repeat(64)},{selectionHash:'c'.repeat(64)},{kappa:'0.9'}])
    assert.equal(hasReviewReceipt({...p,claim:{...p.claim,review:{...p.claim.review,...change}}}),false);
  assert.equal(hasReviewReceipt({...p,claim:{...p.claim,scope:'An unconditional theorem'}}),false);
  assert.equal(hasReviewReceipt({...p,claim:{...p.claim,evidence:JSON.stringify({...selection,certificate:'unreviewed.json'})}}),false);
});

test('decimal agreement is exact rather than a floating-point tolerance', () => {
  const zero=snapshot.projects.find(p=>p.id==='zero-crossnox');
  assert.equal(parseClaim(project(zero.id),zero.claim.evidence,null,at).value,4374785349/5000000000);
  assert.equal(parseClaim(project(zero.id),zero.claim.evidence.replace('= 0.8749570698','= 0.87495706980000000001'),null,at),null);
  const integer=snapshot.projects.find(p=>p.id==='integer-extension');
  assert.equal(parseClaim(project(integer.id),integer.claim.evidence,null,at).value,36942/10**9);
  assert.equal(parseClaim(project(integer.id),integer.claim.evidence.replace('=0.000036942','=0.00003694200000000001'),null,at),null);
});

test('rounded triangle values are explicitly approximate and strict Fourier endpoints remain unattained', () => {
  const triangle=snapshot.projects.find(p=>p.id==='triangles').claim;
  const denominator=498n*379n**17n+7n;
  assert.ok(Math.abs(triangle.value-1/Number(denominator))/triangle.value<1e-14);
  assert.match(triangle.display,/^≈ /);
  const dft=snapshot.projects.find(p=>p.id==='fourier-eumemic').claim;
  assert.equal(dft.value,607/1250000);assert.equal(dft.display,'δ < 0.0004856');
  assert.match(dft.scope,/endpoint itself is not a pure-power guarantee/);
});

test('released claim scopes distinguish randomness, expected time, poles and narrower Lean statements', () => {
  const p=id=>EDITORIAL.find(p=>p.id===id);
  assert.match(p('121').assumptions,/expected time/);assert.match(p('121').assumptions,/2\/3/);
  assert.match(p('003').assumptions,/poles at s = 1 are excluded/);
  assert.match(p('191').formalizationScope,/unbounded sequence/);
  assert.match(p('159').formalizationScope,/quantitative.*outside/);
  assert.match(p('182').formalizationScope,/square-difference case/);
  assert.match(p('104').formalizationScope,/randomized.*7\/8/);
  assert.match(p('160').formalizationScope,/1\/100000/);
  for(const entry of EDITORIAL)assert.ok(entry.assumptions&&entry.formalizationScope,entry.id);
});

test('transport cannot erase audited model qualifications or replace a review with uninspected hashes', () => {
  for(const mutate of [d=>d.problems[0].assumptions='',d=>d.problems[0].formalizationScope='Verified full theorem',
    d=>d.projects[0].claim.review.reviewHash='a'.repeat(64),d=>d.projects[0].claim.scope='No assumptions']){
    const d=structuredClone(snapshot);mutate(d);assert.equal(validateFrontier(d),false);
  }
  assert.equal(hash(contextFor().reviewText),snapshot.projects[0].claim.review.reviewHash);
  assert.equal(hash(contextFor().validationText),snapshot.projects[0].claim.review.validationHash);
});

test('changed author-source content cannot reuse a parsed headline or approve its own interpretation', () => {
  const draft=project('fourier-shea'),text='New uninspected claim: \\delta = 7.3 \\times 10^{-5}';
  assert.ok(parseClaim(draft,text,null,at,{commit}),'a recognizable number alone is insufficient');
  assert.equal(seededProject(draft,text,null,at,null,{commit}).claim,null);
  for(const mutate of [d=>d.projects[1].claim.value=.9,d=>d.projects[1].claim.display='Verified record',
    d=>d.projects[1].claim.scope='Unconditional proof',d=>d.projects[1].sourceHash='a'.repeat(64)]){
    const d=structuredClone(snapshot);mutate(d);assert.equal(validateFrontier(d),false);
  }
});

test('formalization scope stays linked to its inspected release version when the live catalogue head changes', () => {
  const updated=makeProblems(contents,[],commit);
  for(const p of updated)assert.equal(p.leanUrl,snapshot.problems.find(x=>x.id===p.id).leanUrl,p.id);
  const d=structuredClone(snapshot);d.problems.find(p=>p.id==='191').leanUrl=`https://github.com/openai/math/blob/${commit}/lean/docs/191.md`;
  assert.equal(validateFrontier(d),false);
});
