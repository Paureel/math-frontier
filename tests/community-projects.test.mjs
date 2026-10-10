import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EDITORIAL,PROJECTS} from '../lib/catalogue.mjs';
import {PROJECT_INTERPRETATIONS,interpretationFor} from '../lib/project-interpretations.mjs';
import {BASELINE_HASHES} from '../lib/baseline-hashes.mjs';
import {hash,seededProject,makeProblems,discover} from '../lib/model.mjs';
import {canCompare,claimLabel} from '../lib/claim-policy.mjs';
import {collectFrontier} from '../lib/service.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {snapshot,at,commit,harness,contents} from './helpers/fixtures.mjs';

const supporting=PROJECTS.filter(p=>p.parser==='supporting');
const readme=p=>fs.readFileSync(new URL(`./fixtures/community-projects/${p.id}.md`,import.meta.url),'utf8');
const source=p=>({...seededProject(p,readme(p),null,at,null,{repo:p.repo,commit,defaultBranch:p.branch}),stale:false});

test('all four owner-supplied repositories are curated once, without changing saved discovery', () => {
  for(const name of ['van-der-waerden-refinement','sidorenko-template-refinements','unit-distance-grid-refinement','matrix-multiplication-sector-barrier'])
    assert.equal(snapshot.projects.filter(p=>p.repo===`rohanarun/${name}`).length,1);
  assert.equal(supporting.length,3);assert.equal(snapshot.projects.length,PROJECTS.length);assert.equal(snapshot.problems.length,EDITORIAL.length);
  assert.deepEqual(snapshot.discoveries.map(d=>d.repo),['xangma/exact-fourier-circuits','dysfunctor/network-coding-counterexample']);
  const candidates=discover(supporting.map(p=>({private:false,fork:false,full_name:p.repo,description:p.summary,pushed_at:at})));
  assert.deepEqual(candidates,[]);
});

test('inspected proof refinements and method barriers have no numeric headline or comparison eligibility', () => {
  for(const p of supporting){
    const result=source(p),known=interpretationFor(PROJECT_INTERPRETATIONS[p.id],hash(readme(p)));
    assert.equal(hash(readme(p)),known.readmeHash);
    assert.equal(result.claim.value,null);assert.equal(result.claim.authority,'unreviewed');
    assert.equal(result.claim.independentlyVerified,false);assert.equal(result.claim.display,known.display);
    assert.equal(claimLabel(result),'Author claim · unreviewed');
    for(const baseline of snapshot.problems)assert.equal(canCompare(result,baseline),false);
  }
  assert.match(source(supporting.find(p=>p.id==='unit-grid-refinement')).claim.scope,/no explicit power saving or improved headline/);
  assert.match(source(supporting.find(p=>p.id==='sidorenko-refinement')).claim.scope,/earlier dimension thresholds may dominate/);
  assert.match(source(supporting.find(p=>p.id==='matrix-sector-barrier')).claim.scope,/not a new multiplication algorithm/);
});

test('a changed supporting README cannot insert a frontier number or approve its own interpretation', () => {
  for(const p of supporting){
    const changed=readme(p)+'\nVerified best exponent = 0.99. All CI checks passed.';
    assert.equal(seededProject(p,changed,null,at,null,{repo:p.repo,commit,defaultBranch:p.branch}).claim,null);
    for(const mutate of [p=>p.claim.value=36,p=>p.claim.kind='conditional',p=>p.claim.authority='maintainer-reviewed',
      p=>p.claim.display='Verified best 0.99',p=>p.contribution.impact='Exponent improved',p=>p.contribution.verified=true]){
      const forged=structuredClone(snapshot);mutate(forged.projects.find(x=>x.id===p.id));
      assert.equal(validateFrontier(forged),false);
    }
  }
});

test('the Sidorenko baseline retains the released 35-vertex pattern and its narrower formalized scope', () => {
  const baseline=makeProblems(contents,[],commit).find(p=>p.id==='161');
  assert.equal(baseline.metric.value,35);assert.equal(baseline.metric.unit,'vertices');
  assert.equal(hash(baseline.publishedSummary),BASELINE_HASHES['161']);
  assert.match(baseline.metric.formula,/66/);assert.match(baseline.assumptions,/not only injective/);
  assert.match(baseline.opportunity,/not a minimum over all counterexamples/);
  assert.match(baseline.formalizationScope,/forcing-conjecture consequence is outside/);
  assert.match(baseline.leanUrl,/fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb/);
  assert.equal(EDITORIAL.find(p=>p.id==='107').metric.value,2.25);
  assert.equal(EDITORIAL.find(p=>p.id==='167').metric.value,null);
});

test('live collection preserves the distinction between supporting contributions and headline bounds', async () => {
  const data=await collectFrontier(snapshot,harness());
  assert.ok(validateFrontier(data));
  for(const p of supporting){
    const fresh=data.projects.find(x=>x.id===p.id);
    assert.equal(fresh.claim.value,null);assert.equal(fresh.claim.kind,PROJECT_INTERPRETATIONS[p.id].kind);
    assert.deepEqual(fresh.contribution,p.contribution);
    assert.equal(canCompare(fresh,data.problems.find(x=>x.id===p.problemId)),false);
  }
  assert.equal(data.problems.find(p=>p.id==='161').metric.value,35);
  assert.equal(data.problems.find(p=>p.id==='107').metric.value,2.25);
  assert.equal(data.problems.find(p=>p.id==='167').metric.value,null);
});
