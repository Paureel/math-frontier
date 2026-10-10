import {canCompare,blob,isSha} from './claim-policy.mjs';
import {PROJECTS,EDITORIAL} from './catalogue.mjs';
import {BASELINE_HASHES} from './baseline-hashes.mjs';
import {PROJECT_INTERPRETATIONS,interpretationFor} from './project-interpretations.mjs';
import {validAssessment} from './assessment-policy.mjs';

// A map highlight uses the same closed evidence policy as the detailed chart.
// Search/filter choices must not redefine the best result for a problem.
export function bestReviewedProject(problem,projects) {
  const eligible=projects.filter(project=>canCompare(project,problem));
  if(!eligible.length)return null;
  return eligible.reduce((best,project)=>
    (problem.metric.direction==='higher' ? project.claim.value>best.claim.value : project.claim.value<best.claim.value) ? project : best);
}

// These inspected statements report the selected problem's numerical metric.
// Targets, internal proof constants and method barriers are never candidates.
// Ranking author proposals does not confer review or full-theorem verification.
const AUTHOR_METRICS={
  '109':['integer-extension'],
  '130':['fourier-eumemic','fourier-shea','fourier-lean'],
  '107':['matrix-fields'],
  '003':['zero-crossnox','zero-cubic'],
  '191':['triangles'],
  '160':['van-der-waerden'],
  '111':['matroid-shea']
};
export function bestUnreviewedProject(problem,projects) {
  const baseline=EDITORIAL.find(p=>p.id===problem?.id);
  if(!baseline||!problem.baselineFresh||problem.baselineReviewHash!==BASELINE_HASHES[problem.id]||
     !['higher','lower'].includes(problem.metric.direction)||
     Object.keys(baseline.metric).some(key=>problem.metric[key]!==baseline.metric[key]))return null;
  const eligible=projects.filter(p=>{
    const c=p.claim,registered=PROJECTS.find(project=>project.id===p.id);
    const known=interpretationFor(PROJECT_INTERPRETATIONS[p.id],p.sourceHash);
    return AUTHOR_METRICS[problem.id]?.includes(p.id)&&registered?.repo===p.repo&&p.problemId===problem.id&&
      !p.stale&&p.claimFresh===true&&p.assessment?.state==='matched'&&validAssessment(p)&&
      isSha(p.provenance?.commit)&&p.provenance.repo===p.repo&&p.provenance.defaultBranch===p.branch&&
      p.provenance.readmeHash===p.sourceHash&&p.readmeUrl===blob(p.repo,p.provenance.commit,'README.md')&&
      c?.authority==='unreviewed'&&c.independentlyVerified===false&&!c.review&&
      c.source===p.readmeUrl&&
      ['conditional','proposed','extension'].includes(c.kind)&&Number.isFinite(c.value)&&c.value>0&&
      known&&['value','display','kind','scope'].every(key=>c[key]===known[key]);
  });
  if(!eligible.length)return null;
  return eligible.reduce((best,p)=>(problem.metric.direction==='higher'?p.claim.value>best.claim.value:p.claim.value<best.claim.value)?p:best);
}

const includes = (values, query) => !query || values.filter(value => typeof value === 'string').join(' ').toLowerCase().includes(query);
const problemMatches = (problem, query) => includes([problem.id, problem.name, problem.shortName, problem.summary, problem.metric.label, problem.metric.symbol], query);
const projectMatches = (project, query) => includes([project.name, project.repo, project.summary, project.approach], query);

// Search every collection independently. A candidate name must not depend on a
// matching curated project, and a metric match includes its attached projects.
export function filterExplorer(data, {field = 'all', query = '', allFrontiers = false} = {}) {
  const q = query.trim().toLowerCase();
  const inField = data.problems.filter(problem => field === 'all' || problem.field === field);
  const projects = data.projects.filter(project => inField.some(problem => problem.id === project.problemId &&
    (problemMatches(problem, q) || projectMatches(project, q))));
  const discoveries = data.discoveries.filter(candidate => candidate.problemIds.some(id => inField.some(problem => problem.id === id &&
    (problemMatches(problem, q) || includes([candidate.repo, candidate.description], q)))));
  const problems = inField.filter(problem => problemMatches(problem, q) || projects.some(project => project.problemId === problem.id));
  const visibleProblems = problems.filter(problem => allFrontiers || projects.some(project => project.problemId === problem.id));
  return {projects, discoveries, problems, visibleProblems};
}

export function resolveSelection(problems, projects, selectedId, problemId) {
  const selectedProject = projects.find(project => project.id === selectedId) ??
    (selectedId || !problems.some(problem => problem.id === problemId) ? projects[0] ?? null : null);
  const selectedProblem = problems.find(problem => problem.id === (selectedProject?.problemId ?? problemId)) ?? problems[0];
  return {selectedProject, selectedProblem};
}
