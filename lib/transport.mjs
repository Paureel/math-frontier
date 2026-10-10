import {EDITORIAL, PROJECTS} from './catalogue.mjs';
import {BASELINE_HASHES} from './baseline-hashes.mjs';
import {FORMALIZATION_SOURCES} from './release-scope.mjs';
import {SOURCE_ASSESSMENTS} from './source-assessments.mjs';
import {makeAssessment} from './assessment-policy.mjs';
import {blob, claimLabel} from './claim-policy.mjs';
import {validateFrontier} from './validation.mjs';

const problemKeys = ['id','baselineFresh','source','papers'];
const projectKeys = ['id','branch','commit','readmeUrl','sourceHash','updatedAt','stars','forks','openIssues','checkedAt','stale','claimFresh','activityFresh','claim','assessmentHashes'];
const pick = (object, keys) => Object.fromEntries(keys.map(key => [key, object[key]]));
const keysAre = (object, keys) => object && typeof object === 'object' && !Array.isArray(object) &&
  Object.keys(object).every(key => keys.includes(key));

// Editorial prose is already shipped in the closed local policy. Send source
// observations once, not another copy of the catalogue and every raw README.
// Reviewed receipts retain ALL fields and their exact selection evidence so
// the same closed receipt validator still runs in the browser.
export function packFrontier(data) {
  if (!validateFrontier(data)) throw Error('Unsupported research snapshot.');
  return {
    transportVersion:1, fetchedAt:data.fetchedAt, live:data.live,
    catalogue:data.catalogue, warnings:data.warnings, discoveries:data.discoveries,
    problems:data.problems.map(p => pick(p,problemKeys)),
    projects:data.projects.map(p => ({
      ...pick(p,projectKeys.filter(k => !['commit','claim','assessmentHashes','readmeUrl'].includes(k))),
      commit:p.provenance?.commit ?? null,
      ...(p.provenance ? {} : {readmeUrl:p.readmeUrl}),
      claim:p.claim ? {...p.claim, evidence:p.claim.authority === 'maintainer-reviewed' ? p.claim.evidence : ''} : null,
      assessmentHashes:p.assessment ? p.assessment.sources.map(s => s.observedHash) : null
    }))
  };
}

export function unpackFrontier(wire) {
  if (!keysAre(wire,['transportVersion','fetchedAt','live','catalogue','warnings','discoveries','problems','projects']) ||
      wire.transportVersion !== 1 || !Array.isArray(wire.problems) || wire.problems.length !== EDITORIAL.length ||
      !Array.isArray(wire.projects) || wire.projects.length !== PROJECTS.length) throw Error('Unsupported research update.');
  const problems = wire.problems.map(p => {
    const known=EDITORIAL.find(x => x.id===p?.id);
    if (!known || !keysAre(p,problemKeys)) throw Error('Unsupported problem observation.');
    return {...known,...p, metric:p.baselineFresh === true ? {...known.metric} : {...known.metric,value:null,display:'Source unconfirmed'},
      baselineReviewHash:BASELINE_HASHES[p.id], leanUrl:FORMALIZATION_SOURCES[p.id], publishedSummary:''};
  });
  const projects = wire.projects.map(p => {
    const known=PROJECTS.find(x => x.id===p?.id);
    if (!known || !keysAre(p,projectKeys) || (p.commit !== null && Object.hasOwn(p,'readmeUrl'))) throw Error('Unsupported project observation.');
    const {parser,scope,status,...editorial}=known;
    const {commit,assessmentHashes,...observed}=p;
    const project={...editorial,...observed,url:`https://github.com/${known.repo}`,
      readmeUrl:commit === null ? p.readmeUrl : blob(known.repo,commit,'README.md'),
      provenance:commit === null ? null : {repo:known.repo,defaultBranch:p.branch,commit,readmeHash:p.sourceHash}};
    if (assessmentHashes !== null) {
      const sources=SOURCE_ASSESSMENTS[p.id]?.sources;
      if (!sources || !Array.isArray(assessmentHashes) || assessmentHashes.length!==sources.length || !commit) throw Error('Unsupported source assessment.');
      project.assessment=makeAssessment(project,commit,p.sourceHash,Object.fromEntries(sources.map((s,i)=>[s.path,assessmentHashes[i]])));
      if(!project.assessment)throw Error('Unsupported source assessment.');
    }
    project.status=claimLabel(project);
    return project;
  });
  const data={schemaVersion:2,fetchedAt:wire.fetchedAt,live:wire.live,catalogue:wire.catalogue,warnings:wire.warnings,discoveries:wire.discoveries,problems,projects};
  if (!validateFrontier(data)) throw Error('Unsupported research update.');
  return data;
}
