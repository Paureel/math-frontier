import {SOURCE_ASSESSMENTS} from './source-assessments.mjs';
import {blob,isHash,SELECTION_PATH} from './claim-policy.mjs';

export function makeAssessment(project, commit, readmeHash, hashes = {}) {
  const known = SOURCE_ASSESSMENTS[project.id];
  if (!known) return null;
  // This narrative describes one particular construction. An older, separately
  // inspected receipt must never inherit the newer construction's assessment.
  if(project.id==='crocswap' && project.claim?.review &&
      project.claim.review.selectionHash!==known.sources.find(s=>s.path===SELECTION_PATH)?.sha256)return null;
  const sources = known.sources.map(source => {
    const observedHash = hashes[source.path] ?? null;
    return {...source, observedHash, url:blob(project.repo,commit,source.path),
      state:observedHash === source.sha256 ? 'matched' : observedHash === null ? 'unavailable' : 'changed'};
  });
  const state = readmeHash !== known.readmeHash || sources.some(s=>s.state==='changed') ? 'changed' :
    sources.some(s=>s.state==='unavailable') ? 'unavailable' : 'matched';
  return {inspectedCommit:known.commit,readmeHash:known.readmeHash,label:known.label,
    summary:known.summary,limitations:known.limitations,state,sources};
}

// Transport cannot rewrite the editorial interpretation, artifact inventory or
// the meaning of a matching hash. None of these states confers proof approval.
export function validAssessment(project) {
  const a=project.assessment, known=SOURCE_ASSESSMENTS[project.id];
  if (!a || !known || !project.provenance || Object.keys(a).some(k=>!['inspectedCommit','readmeHash','label','summary','limitations','state','sources'].includes(k)) ||
      !['inspectedCommit','readmeHash','label','summary','limitations'].every(k=>a[k]===(k==='inspectedCommit'?known.commit:known[k])) ||
      !Array.isArray(a.sources) || a.sources.length !== known.sources.length) return false;
  const hashes={};
  for(let i=0;i<a.sources.length;i++) {
    const source=a.sources[i], expected=known.sources[i];
    if(!source || Object.keys(source).some(k=>!['path','sha256','observedHash','url','state'].includes(k)) || source.path!==expected.path || source.sha256!==expected.sha256 ||
       (source.observedHash!==null&&!isHash(source.observedHash)))return false;
    hashes[source.path]=source.observedHash;
  }
  return JSON.stringify(a)===JSON.stringify(makeAssessment(project,project.provenance.commit,project.sourceHash,hashes));
}
