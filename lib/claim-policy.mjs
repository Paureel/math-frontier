// Shared by the collector and UI. Reading a source, merging a PR, and passing CI
// are never equivalent to proving a theorem.
import {REVIEWED_RECEIPTS} from './reviewed-receipts.mjs';
import {EDITORIAL, PROJECTS} from './catalogue.mjs';
import {BASELINE_HASHES} from './baseline-hashes.mjs';
import {SOURCE_ASSESSMENTS} from './source-assessments.mjs';
export const ROOT = 'CrocSwap/integer-mult-bounds';
export const SELECTION_PATH = 'certificates/selected-result.json';
export const SELECTED_STATUS = 'Selected maintainer-reviewed conditional witness';
export const isSha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
export const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export const safePath = value => typeof value === 'string' && value.length <= 300 &&
  /^[A-Za-z0-9_./-]+$/.test(value) && value.split('/').every(part => part && part !== '.' && part !== '..');
export const blob = (repo, commit, path) => `https://github.com/${repo}/blob/${commit}/${path}`;

// Exact equality avoids accepting a forged decimal that rounds to the same double.
function rational(value) {
  if (typeof value !== 'string' || value.length > 200) return null;
  const m = value.trim().match(/^([+-]?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d{1,3}))?(?:\/([1-9]\d*))?$/);
  if (!m) return null;
  const exponent = Number(m[4] ?? 0) - (m[3]?.length ?? 0);
  if (Math.abs(exponent) > 200) return null;
  let n = BigInt(m[2] + (m[3] ?? '')) * (m[1] === '-' ? -1n : 1n);
  let d = BigInt(m[5] ?? 1);
  if (exponent >= 0) n *= 10n ** BigInt(exponent);
  else d *= 10n ** BigInt(-exponent);
  return {n, d};
}
export function equalRational(a, b) {
  const x = rational(a), y = rational(b);
  return !!x && !!y && x.n * y.d === y.n * x.d;
}
export function numericFraction(value) {
  const x = rational(value);
  if (!x) return null;
  const n = Number(x.n) / Number(x.d);
  return Number.isFinite(n) ? n : null;
}
export function supportedSelection(record) {
  const value = numericFraction(record?.kappa);
  const historic = record?.status === SELECTED_STATUS && Number.isSafeInteger(record.source_pr) && record.source_pr > 0 && isSha(record.reviewed_head);
  const composed = record?.status === 'Published on main: maintainer-reviewed conditional construction' &&
    Array.isArray(record.source_prs) && record.source_prs.length > 0 && record.source_prs.every(n => Number.isSafeInteger(n) && n > 0) &&
    safePath(record.source_manifest) && isHash(record.certificate_sha256) && record.proof_supplements &&
    Object.entries(record.proof_supplements).every(([path, digest]) => safePath(path) && isHash(digest));
  return (historic || composed) && value !== null && value > 0 && value < 1 &&
    safePath(record.review) && safePath(record.validation) && typeof record.scope === 'string' &&
    /^Conditional on retained (?:analytic|all-size compiler)\b/.test(record.scope) &&
    (record.decimal == null || equalRational(record.decimal, record.kappa)) &&
    [record.proof, record.certificate].every(path => path == null || safePath(path));
}

// Identity and artifact paths come exclusively from locally inspected entries.
// Upstream schema variants cannot invent a reviewed PR/head or approve themselves.
export function receiptForSelection(record, selectionHash) {
  return inspectedSelection(record, selectionHash) ? REVIEWED_RECEIPTS[selectionHash] : null;
}

export function inspectedSelection(record, selectionHash) {
  return supportedSelection(record) && isHash(selectionHash) && Object.hasOwn(REVIEWED_RECEIPTS, selectionHash) &&
    JSON.stringify(record) === JSON.stringify(REVIEWED_RECEIPTS[selectionHash].record);
}

export function reviewedPRMatches(pr, record) {
  const known = Object.values(REVIEWED_RECEIPTS).find(entry => JSON.stringify(entry.record) === JSON.stringify(record));
  if (!known || !pr || pr.number !== known.sourcePR || pr.base?.repo?.full_name !== ROOT ||
      pr.head?.sha !== known.reviewedHead || pr.html_url !== `https://github.com/${ROOT}/pull/${known.sourcePR}`) return false;
  // A larger number in a title/body never replaces the ledger. This only controls
  // whether this exact *current* PR head can be linked as the reviewed claim.
  if ((pr.title != null && typeof pr.title !== 'string') || (pr.body != null && typeof pr.body !== 'string')) return false;
  const text = `${pr.title ?? ''}\n${pr.body ?? ''}`;
  if (text.length > 100000) return false;
  const assignments = [...text.matchAll(/(?:\bkappa|κ|\\kappa)\s*=/gi)];
  // A decoy matching value cannot hide a second conflicting or malformed claim.
  // This affects the current PR link only; PR text never supplies a frontier.
  return assignments.length > 0 && assignments.every(assignment => {
    const tail = text.slice(assignment.index + assignment[0].length).trimStart();
    const decimal = /^(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(?:\/[1-9]\d*)?)(?![\w/+*^-]|\.\d)/;
    const tex = tail.match(/^\\frac\{(\d+)\}\{([1-9]\d*)\}/);
    const plain = tex ? null : tail.match(decimal);
    const value = tex ? `${tex[1]}/${tex[2]}` : plain?.[1];
    if(!value || !equalRational(value,record.kappa))return false;
    let rest=tail.slice((tex??plain)[0].length).trimStart();
    // A displayed exact fraction may be followed by its equal decimal. Both
    // assignments must agree; neither can hide a contradictory value.
    if(rest.startsWith('=')) {
      const equal=rest.slice(1).trimStart().match(decimal);
      if(!equal||!equalRational(equal[1],record.kappa))return false;
      rest=rest.slice(1).trimStart().slice(equal[0].length).trimStart();
    }
    return !(rest.startsWith('.')&&!/^\.(?:$|\s|[$\\])/.test(rest)) &&
      !/^(?:[+*/^=−±×÷-]|\\(?:times|cdot|div|frac)\b)/.test(rest);
  });
}

export function supportedReceipt(receipt) {
  if (!isHash(receipt?.selectionHash) || !Object.hasOwn(REVIEWED_RECEIPTS, receipt.selectionHash)) return false;
  const known=REVIEWED_RECEIPTS[receipt?.selectionHash];
  return !!known && ['sourcePR','reviewedHead','kappa','scope','reviewHash','validationHash','reviewPath','validationPath']
    .every(key=>receipt[key]===known[key]) && JSON.stringify(receipt.artifacts ?? {}) === JSON.stringify(known.artifacts ?? {});
}

export function reviewScope(project) {
  return hasReviewReceipt(project) ? REVIEWED_RECEIPTS[project.claim.review.selectionHash].reviewScope : null;
}

export function hasReviewReceipt(project) {
  const c = project?.claim, r = c?.review, p = project?.provenance;
  const current=SOURCE_ASSESSMENTS.crocswap;
  const needsAssessment=r?.selectionHash===current.sources.find(s=>s.path===SELECTION_PATH)?.sha256;
  const known=REVIEWED_RECEIPTS[r?.selectionHash];
  let record;
  try { record = JSON.parse(c?.evidence); } catch { return false; }
  return project?.id === 'crocswap' && project.repo === ROOT && project.problemId === '109' && c?.authority === 'maintainer-reviewed' &&
    supportedReceipt(r) && known.readmeHashes.includes(p?.readmeHash) &&
    (!needsAssessment || (p?.readmeHash===current.readmeHash && project.assessment?.state==='matched')) &&
    JSON.stringify(record) === JSON.stringify(REVIEWED_RECEIPTS[r.selectionHash].record) && c.scope === `${PROJECTS.find(p=>p.id==='crocswap').scope} Maintainer scope: ${r.scope}` &&
    c.display === String(numericFraction(record.kappa)) &&
    supportedSelection(record) &&
    record.kappa === r?.kappa && record.scope === r?.scope && record.review === r?.reviewPath && record.validation === r?.validationPath &&
    c.kind === 'conditional' && c.independentlyVerified === false && isSha(p?.commit) &&
    p.repo === ROOT && p.defaultBranch === project.branch && isHash(p.readmeHash) &&
    c.source === blob(ROOT, p.commit, SELECTION_PATH) && isSha(r?.reviewedHead) &&
    Number.isSafeInteger(r?.sourcePR) && r.sourcePR > 0 && isHash(r?.selectionHash) &&
    safePath(r?.reviewPath) && safePath(r?.validationPath) && isHash(r?.reviewHash) && isHash(r?.validationHash) &&
    r.reviewUrl === blob(ROOT, p.commit, r.reviewPath) && r.validationUrl === blob(ROOT, p.commit, r.validationPath) &&
    r.prUrl === `https://github.com/${ROOT}/pull/${r.sourcePR}` &&
    ['matched', 'changed', 'unavailable'].includes(r.currentPR) &&
    numericFraction(r.kappa) === c.value && typeof r.scope === 'string' && !!r.scope.trim();
}
export function canCompare(project, problem) {
  const baseline = EDITORIAL.find(p => p.id === '109');
  return hasReviewReceipt(project) && !project.stale && project.claimFresh === true &&
    (!project.assessment || project.assessment.state === 'matched') &&
    project.problemId === problem?.id && problem.id === '109' && problem.metric?.direction === 'higher' &&
    problem.metric.symbol === 'κ' && problem.metric.unit === 'exponent' &&
    problem?.baselineFresh === true && problem.baselineReviewHash === BASELINE_HASHES['109'] &&
    Object.keys(baseline.metric).every(key => problem.metric[key] === baseline.metric[key]) &&
    Number.isFinite(problem.metric.value) && problem.metric.value > 0 &&
    Number.isFinite(project.claim.value) && project.claim.value > 0 && problem.metric.direction !== 'scope';
}
export function claimLabel(project) {
  if (!project?.claim && project?.id === 'crocswap') return 'No confirmed maintainer selection';
  if (!project?.claim && project?.assessment?.state === 'changed') return 'New source · awaiting review';
  if (!project?.claim) return project?.id === 'crocswap' ? 'No confirmed maintainer selection' : 'No current parsed claim';
  if (hasReviewReceipt(project)) return project.stale || !project.claimFresh ? 'Saved maintainer review' : 'Maintainer reviewed · conditional';
  if (project.claim.kind === 'verification') return 'Proof in progress';
  if (project.claim.kind === 'exploration') return 'Research target';
  return 'Author claim · unreviewed';
}
export function asSavedFrontier(data) {
  return {...data, live:false, projects:data.projects.map(p => {
    const saved = {...p, stale:true, claimFresh:false, activityFresh:false};
    return {...saved, status:claimLabel(saved)};
  })};
}
