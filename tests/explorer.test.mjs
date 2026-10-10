import test from 'node:test';
import assert from 'node:assert/strict';
import {filterExplorer, resolveSelection,bestReviewedProject} from '../lib/explorer.mjs';
import {snapshot} from './helpers/fixtures.mjs';
import {collectFrontier} from '../lib/service.mjs';
import {latestHarness} from './helpers/latest-fixtures.mjs';
import {expireFrontier,REFRESH_INTERVAL_MS} from '../lib/refresh-policy.mjs';

test('map highlights the reviewed conditional witness and excludes unreviewed larger numbers',async()=>{
  const data=await collectFrontier(snapshot,latestHarness());
  const problem=data.problems.find(p=>p.id==='109');
  assert.equal(bestReviewedProject(problem,data.projects).id,'crocswap');
  const fake=structuredClone(data.projects.find(p=>p.id==='integer-extension'));fake.claim.value=.99;
  assert.equal(bestReviewedProject(problem,[fake,...data.projects]).id,'crocswap');
  assert.equal(bestReviewedProject(problem,[fake]),null);
  for(const p of data.problems.filter(p=>p.id!=='109'))assert.equal(bestReviewedProject(p,data.projects),null);
});

test('map highlight disappears with stale, withdrawn, changed or incomplete evidence',async()=>{
  const data=await collectFrontier(snapshot,latestHarness()),problem=data.problems.find(p=>p.id==='109');
  for(const change of [p=>p.stale=true,p=>p.claimFresh=false,p=>p.claim=null,p=>p.assessment.state='changed',
    p=>delete p.assessment,p=>p.claim.review.selectionHash='f'.repeat(64)]){
    const projects=structuredClone(data.projects);change(projects.find(p=>p.id==='crocswap'));
    assert.equal(bestReviewedProject(problem,projects),null);
  }
  assert.equal(bestReviewedProject({...problem,baselineFresh:false},data.projects),null);
  const expired=expireFrontier(data,Date.parse(data.fetchedAt)+REFRESH_INTERVAL_MS);
  assert.equal(bestReviewedProject(expired.problems.find(p=>p.id==='109'),expired.projects),null);
});

test('metric and problem searches include all attached projects in maps and cards', () => {
  const result = filterExplorer(snapshot, {query:'  LOGARITHMIC SAVING  '});
  const expected = snapshot.projects.filter(project => ['109','130'].includes(project.problemId));
  assert.deepEqual(result.projects, expected);
  assert.deepEqual(result.visibleProblems.map(problem => problem.id), ['109','130']);
  assert.deepEqual(filterExplorer(snapshot, {query:'κ'}).projects, snapshot.projects.filter(project => project.problemId === '109'));
});

test('saved candidates are searchable by repository or owner without a curated match', () => {
  const candidate = snapshot.discoveries.find(candidate => candidate.repo.startsWith('xangma/'));
  const result = filterExplorer(snapshot, {query:'xangma'});
  assert.deepEqual(result.discoveries, [candidate]);
  assert.equal(result.projects.length, 0);
  assert.equal(result.visibleProblems.length, 0);
  assert.equal(filterExplorer(snapshot, {query:'xangma',field:'geometry'}).discoveries.length, 0);
  assert.ok(filterExplorer(snapshot, {query:'Fourier'}).discoveries.includes(candidate));
});

test('empty discovery sections disappear and curated owner searches keep their project subset', () => {
  const result = filterExplorer(snapshot, {query:'rohanarun'});
  assert.equal(result.projects.length, 4);
  assert.equal(result.discoveries.length, 0);
  assert.equal(result.visibleProblems.length, 4);
  const empty = filterExplorer(snapshot, {query:'a nonexistent research project'});
  assert.equal(empty.projects.length + empty.discoveries.length + empty.visibleProblems.length, 0);
});

test('selection falls back to a matching project while explicit problem selection is preserved', () => {
  const result = filterExplorer(snapshot, {query:'rohanarun'});
  const selection = resolveSelection(result.visibleProblems, result.projects, 'crocswap', '109');
  assert.equal(selection.selectedProject, result.projects[0]);
  assert.equal(selection.selectedProblem.id, result.projects[0].problemId);
  const problem = resolveSelection(result.visibleProblems, result.projects, '', '161');
  assert.equal(problem.selectedProject, null);
  assert.equal(problem.selectedProblem.id, '161');
  assert.deepEqual(resolveSelection([], [], 'crocswap', '109'), {selectedProject:null,selectedProblem:undefined});
});

test('frontiers without projects are shown only when requested', () => {
  assert.equal(filterExplorer(snapshot, {query:'Subset Sum'}).visibleProblems.length, 0);
  assert.equal(filterExplorer(snapshot, {query:'Subset Sum',allFrontiers:true}).visibleProblems[0].id, '138');
});

test('unverified results rank only inspected current author statements for the same metric',async()=>{
  const {bestUnreviewedProject}=await import('../lib/explorer.mjs');
  const data=await collectFrontier(snapshot,latestHarness());
  const expected={'109':'integer-extension','130':'fourier-shea','107':'matrix-fields','003':'zero-cubic','191':'triangles','160':'van-der-waerden','111':'matroid-shea'};
  for(const p of data.problems){
    assert.equal(bestUnreviewedProject(p,data.projects)?.id??null,expected[p.id]??null,p.id);
  }
  const fourier=data.problems.find(p=>p.id==='130'),strict=data.projects.find(p=>p.id==='fourier-eumemic');
  assert.equal(bestUnreviewedProject(fourier,[strict]).claim.display,'δ < 0.0004856');
  assert.equal(bestReviewedProject(fourier,data.projects),null,'ranking author claims cannot promote a reviewed result');
  const integer=data.problems.find(p=>p.id==='109');
  assert.equal(bestUnreviewedProject(integer,[data.projects.find(p=>p.id==='crocswap')]),null,'reviewed results never fill the unverified category');
});

test('fake numbers, PR receipts, changed models and stale sources cannot bias even the unverified ranking',async()=>{
  const {bestUnreviewedProject}=await import('../lib/explorer.mjs');
  const data=await collectFrontier(snapshot,latestHarness()),problem=data.problems.find(p=>p.id==='130');
  const source=data.projects.find(p=>p.id==='fourier-shea');
  for(const mutate of [p=>p.claim.value=.99,p=>p.claim.display='Verified best 0.99',p=>p.claim.scope='Unconditional theorem',
    p=>p.claim.authority='maintainer-reviewed',p=>p.claim.independentlyVerified=true,p=>p.claim.review={sourcePR:999},
    p=>p.stale=true,p=>p.claimFresh=false,p=>p.claim=null,p=>delete p.assessment,p=>p.assessment.state='changed',
    p=>p.assessment.sources[0].observedHash='f'.repeat(64),p=>p.sourceHash='f'.repeat(64),p=>p.provenance.readmeHash='f'.repeat(64),
    p=>p.claim.source='https://github.com/fake/repo/pull/999',p=>p.repo='fake/repo',p=>p.problemId='109']){
    const forged=structuredClone(source);mutate(forged);
    assert.equal(bestUnreviewedProject(problem,[forged]),null);
    assert.equal(bestUnreviewedProject(problem,[forged,...data.projects]).id,source.id);
  }
  for(const changed of [{...problem,baselineFresh:false},{...problem,baselineReviewHash:'f'.repeat(64)},
    {...problem,metric:{...problem.metric,direction:'lower'}},{...problem,metric:{...problem.metric,unit:'milliseconds'}}])
    assert.equal(bestUnreviewedProject(changed,data.projects),null);
  const expired=expireFrontier(data,Date.parse(data.fetchedAt)+REFRESH_INTERVAL_MS);
  assert.equal(bestUnreviewedProject(expired.problems.find(p=>p.id==='130'),expired.projects),null);
});
