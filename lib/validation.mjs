import {EDITORIAL, PROJECTS} from './catalogue.mjs';
import {BASELINE_HASHES} from './baseline-hashes.mjs';
import {PROJECT_INTERPRETATIONS,interpretationFor} from './project-interpretations.mjs';
import {FORMALIZATION_SOURCES} from './release-scope.mjs';
import {validAssessment} from './assessment-policy.mjs';
import {blob, hasReviewReceipt, isHash, isSha, numericFraction, claimLabel} from './claim-policy.mjs';

const text = (s, max = 12000) => typeof s === 'string' && s.length <= max;
const date = s => typeof s === 'string' && s.length < 60 && Number.isFinite(Date.parse(s));
const nullableDate = s => s === null || date(s);
const count = n => n === null || (Number.isSafeInteger(n) && n >= 0);
const github = s => typeof s === 'string' && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:blob|pull)\/[\w./-]+$/.test(s);
const onlyKeys = (value, allowed) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => allowed.includes(key));
const claimKeys = ['value','display','kind','authority','independentlyVerified','review','evidence','source','scope','observedAt'];
const reviewKeys = ['sourcePR','reviewedHead','kappa','scope','selectionHash','reviewPath','validationPath','reviewHash','validationHash','reviewUrl','validationUrl','prUrl','currentPR','artifacts'];
const projectKeys = ['id','repo','branch','problemId','name','summary','approach','contribution','status','url','readmeUrl','updatedAt','stars','forks','openIssues','sourceHash','checkedAt','claimFresh','activityFresh','provenance','claim','stale','assessment'];
const problemKeys = ['id','name','shortName','field','summary','why','opportunity','metric','assumptions','formalizationScope','baselineReviewHash','baselineFresh','source','papers','leanUrl','publishedSummary'];
const metricKeys = ['symbol','label','direction','value','display','formula','explanation','unit'];

// Reject unsupported/legacy trust states before they enter either the UI or cache.
// This validates the transport; it does not independently verify mathematics.
export function validateFrontier(data) {
  try {
    if (!onlyKeys(data, ['schemaVersion','fetchedAt','live','projects','problems','discoveries','warnings','catalogue']) ||
        data.schemaVersion !== 2 || typeof data.live !== 'boolean' || !date(data.fetchedAt) ||
        !Array.isArray(data.projects) || data.projects.length !== PROJECTS.length ||
        !Array.isArray(data.problems) || data.problems.length !== EDITORIAL.length ||
        !Array.isArray(data.discoveries) || data.discoveries.length > 100 ||
        !Array.isArray(data.warnings) || data.warnings.length > 80 || !data.warnings.every(w => text(w, 1600))) return false;
    const cat = data.catalogue;
    if (!onlyKeys(cat,['families','manuscripts','source','checkedAt','sha256']) || !count(cat.families) || !count(cat.manuscripts) || cat.families === null || cat.manuscripts === null ||
        !date(cat.checkedAt) || !isHash(cat.sha256) || !github(cat.source) || !cat.source.startsWith('https://github.com/openai/math/blob/')) return false;
    if (new Set(data.problems.map(p => p?.id)).size !== EDITORIAL.length || new Set(data.projects.map(p => p?.id)).size !== PROJECTS.length) return false;
    for (const p of data.problems) {
      const registered = EDITORIAL.find(x => x.id === p?.id);
      if (!onlyKeys(p,problemKeys) || !registered || ['name', 'shortName', 'field', 'summary', 'why', 'opportunity', 'assumptions', 'formalizationScope'].some(key => p[key] !== registered[key]) ||
          p.baselineReviewHash !== BASELINE_HASHES[p.id] || typeof p.baselineFresh !== 'boolean' || !text(p.publishedSummary, 20000) ||
          !github(p.source) || !p.source.startsWith('https://github.com/openai/math/blob/') || !Array.isArray(p.papers) || p.papers.length > 30 ||
          !p.papers.every(x => onlyKeys(x,['title','url']) && text(x.title, 1000) && github(x.url) && x.url.startsWith('https://github.com/openai/math/blob/') && x.url.includes('/preprints/')) ||
          p.leanUrl !== FORMALIZATION_SOURCES[p.id]) return false;
      const metric = p.metric;
      if (!onlyKeys(metric,metricKeys) || ['symbol', 'label', 'direction', 'formula', 'explanation', 'unit'].some(k => metric[k] !== registered.metric[k]) ||
          metric.value !== (p.baselineFresh ? registered.metric.value : null) ||
          metric.display !== (p.baselineFresh ? registered.metric.display : 'Source unconfirmed')) return false;
    }
    for (const p of data.projects) {
      const registered = PROJECTS.find(x => x.id === p?.id);
      if (!onlyKeys(p,projectKeys) || !registered || ['repo', 'problemId', 'name', 'summary', 'approach'].some(key => p[key] !== registered[key]) ||
          p.url !== `https://github.com/${p.repo}` || !text(p.branch, 200) || !p.branch || !text(p.status, 100) ||
          !nullableDate(p.updatedAt) || !nullableDate(p.checkedAt) || ![p.stars, p.forks, p.openIssues].every(count) ||
          typeof p.claimFresh !== 'boolean' || typeof p.activityFresh !== 'boolean' || typeof p.stale !== 'boolean' || !isHash(p.sourceHash) ||
          !github(p.readmeUrl) || !p.readmeUrl.startsWith(`${p.url}/blob/`) || !p.readmeUrl.endsWith('/README.md')) return false;
      if (registered.contribution ? !onlyKeys(p.contribution,['label','impact','explanation']) ||
          Object.keys(registered.contribution).some(key=>p.contribution[key]!==registered.contribution[key]) : p.contribution!=null) return false;
      if (p.provenance !== null) {
        const v = p.provenance;
        if (!onlyKeys(v,['repo','defaultBranch','commit','readmeHash']) || v.repo !== p.repo || v.defaultBranch !== p.branch || !isSha(v.commit) || v.readmeHash !== p.sourceHash ||
            p.readmeUrl !== blob(p.repo, v.commit, 'README.md')) return false;
      }
      if (p.claim !== null) {
        const c = p.claim;
        if (!onlyKeys(c, claimKeys) || (c.review != null && !onlyKeys(c.review, reviewKeys)) ||
            !['conditional', 'proposed', 'extension', 'verification', 'exploration', 'refinement', 'method-limit'].includes(c.kind) ||
            !['unreviewed', 'maintainer-reviewed'].includes(c.authority) || c.independentlyVerified !== false ||
            !text(c.display, 140) || !text(c.evidence, 24000) || !text(c.scope, 6000) || !date(c.observedAt) ||
            (c.value !== null && (!Number.isFinite(c.value) || c.value <= 0)) || !github(c.source)) return false;
        if (c.authority === 'maintainer-reviewed') {
          if (!hasReviewReceipt(p) || (p.assessment && p.assessment.state !== 'matched') || numericFraction(c.review.kappa) !== c.value || c.value >= 1) return false;
        } else {
          const known=interpretationFor(PROJECT_INTERPRETATIONS[p.id],p.sourceHash);
          if(c.source!==p.readmeUrl||c.review!=null||!p.provenance||(p.assessment&&p.assessment.state!=='matched')||!known||
            ['value','display','kind','scope'].some(key=>c[key]!==known[key]))return false;
        }
        if (['verification', 'exploration', 'refinement', 'method-limit'].includes(c.kind) && c.value !== null) return false;
      }
      if(p.assessment!=null&&!validAssessment(p))return false;
      if (p.status !== claimLabel(p)) return false;
    }
    const discoveryRepos = new Set();
    for (const d of data.discoveries) {
      if (!onlyKeys(d,['repo','url','description','updatedAt','problemIds','reason']) || typeof d.repo !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(d.repo) || d.url !== `https://github.com/${d.repo}` ||
          !text(d.description, 1200) || !text(d.reason, 1600) || !nullableDate(d.updatedAt) ||
          !Array.isArray(d.problemIds) || !d.problemIds.length || new Set(d.problemIds).size !== d.problemIds.length || !d.problemIds.every(id => EDITORIAL.some(p => p.id === id)) ||
          PROJECTS.some(p => p.repo.toLowerCase() === d.repo.toLowerCase()) || d.claim != null || d.verified != null) return false;
      if (discoveryRepos.has(d.repo.toLowerCase())) return false;
      discoveryRepos.add(d.repo.toLowerCase());
    }
    return true;
  } catch { return false; }
}
