import fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID} from 'node:crypto';
import {expireFrontier,REFRESH_INTERVAL_MS} from './refresh-policy.mjs';
import {PROJECTS} from './catalogue.mjs';
import {SOURCE_ASSESSMENTS} from './source-assessments.mjs';
import {makeAssessment} from './assessment-policy.mjs';
import {hash, makeProblems, seededProject} from './model.mjs';
import {discoveryWarnings} from './discovery-policy.mjs';
import {SELECTION_PATH, isSha, claimLabel, asSavedFrontier, inspectedSelection, receiptForSelection, hasReviewReceipt} from './claim-policy.mjs';
import {validateFrontier} from './validation.mjs';

const SNAPSHOT = new URL('../public/frontier.json', import.meta.url);
const CACHE = new URL('../.cache/frontier.json', import.meta.url);
const execute = promisify(execFile);

export async function publicGitHead(repo, {signal} = {}) {
  if (repo !== 'openai/math' && !PROJECTS.some(p => p.repo === repo)) throw Error('Unknown upstream repository.');
  // Anonymous, fixed-destination, read-only Git discovery. Disable credentials,
  // prompts and redirects; never check out or execute upstream source.
  const {stdout} = await execute('git', ['-c', 'credential.helper=', '-c', 'credential.interactive=false',
    '-c', 'core.askPass=', '-c', 'http.extraHeader=', '-c', 'http.followRedirects=false', 'ls-remote', '--symref', `https://github.com/${repo}.git`, 'HEAD'],
    {timeout:18000, signal, maxBuffer:64000, env:{...process.env, GIT_TERMINAL_PROMPT:'0'}});
  const defaultBranch = stdout.match(/^ref: refs\/heads\/([^\s]+)\tHEAD$/m)?.[1];
  const commit = stdout.match(/^([a-f0-9]{40})\tHEAD$/m)?.[1];
  if (!defaultBranch || defaultBranch.length > 200 || !isSha(commit)) throw Error('Public upstream head unavailable.');
  return {repo, defaultBranch, commit};
}

export async function readPublic(url, {api = false, shaOnly=false, fetcher = fetch, token = process.env.GITHUB_TOKEN, limit = 1024 * 1024, signal} = {}) {
  const target = new URL(url);
  if (target.protocol !== 'https:' || !['api.github.com', 'raw.githubusercontent.com'].includes(target.hostname) ||
      target.username || target.password || (target.port && target.port !== '443') || (api && target.hostname !== 'api.github.com') || (shaOnly&&!api)) throw Error('Unsupported public source.');
  const headers = {'User-Agent': 'local-math-frontier', Accept: shaOnly ? 'application/vnd.github.sha' : api ? 'application/vnd.github+json' : 'text/plain'};
  if (api && token) headers.Authorization = `Bearer ${token}`;
  // No credential-bearing redirects, arbitrary source URLs, or unbounded payloads.
  signal?.throwIfAborted();
  const timeout = AbortSignal.timeout(18000);
  const response = await fetcher(url, {headers, redirect: 'error', signal: signal ? AbortSignal.any([signal, timeout]) : timeout});
  if (!response.ok) {
    const error = new Error('Public source unavailable.');
    error.status = response.status;
    throw error;
  }
  if (Number(response.headers.get('content-length')) > limit) throw Error('Public source is too large.');
  const reader = response.body?.getReader();
  if (!reader) throw Error('Empty public response.');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw Error('Public source is too large.');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  return new TextDecoder('utf-8', {fatal: true}).decode(Buffer.concat(chunks));
}

export async function collectFrontier(previous, {fetcher = fetch, token = process.env.GITHUB_TOKEN, now = Date.now, resolvePublicHead = publicGitHead, signal = AbortSignal.timeout(40000)} = {}) {
  const at = new Date(now()).toISOString(), warnings = [];
  const read = (url, api = false, limit,shaOnly=false) => readPublic(url, {api,shaOnly, fetcher, token, limit, signal});
  const api = async path => JSON.parse(await read(`https://api.github.com${path}`, true));
  const raw = (repo, commit, path, limit) => read(`https://raw.githubusercontent.com/${repo}/${commit}/${path}`, false, limit);
  async function upstream(repo) {
    let metadata;
    try {
    metadata = await api(`/repos/${repo}`);
    if (metadata?.private !== false || metadata.full_name?.toLowerCase() !== repo.toLowerCase() ||
        ['private', 'internal'].includes(metadata.visibility) || typeof metadata.default_branch !== 'string' ||
        !metadata.default_branch || metadata.default_branch.length > 200 || (repo === PROJECTS[0].repo && metadata.fork !== false)) throw Error('Public upstream identity unavailable.');
    // A full commit includes file diffs and can exceed the bounded API response
    // size even for a valid head. Request only the SHA needed for provenance.
    const head = (await read(`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(metadata.default_branch)}`,true,1024,true)).trim();
    if (!isSha(head)) throw Error('Upstream head unavailable.');
    return {metadata, commit: head, defaultBranch: metadata.default_branch, repo, activityFresh:true};
    } catch (error) {
      // Never use this route for a private, redirected or mismatched identity.
      if (error.status !== 403 && error.status !== 429) throw error;
      signal.throwIfAborted();
      const pin = await resolvePublicHead(repo, {signal});
      if (pin?.repo !== repo || !isSha(pin.commit) || typeof pin.defaultBranch !== 'string' || !pin.defaultBranch || pin.defaultBranch.length > 200) throw Error('Unsupported public Git head.');
      const old = previous.projects.find(p => p.repo === repo);
      const warning = 'GitHub API is limited. Upstream branch and commit are confirmed through anonymous public Git; repository activity is last known and some current PR heads may be unavailable.';
      if (!warnings.includes(warning)) warnings.push(warning);
      return {...pin, activityFresh:false, metadata:{pushed_at:old?.updatedAt??null,stargazers_count:old?.stars??null,
        forks_count:old?.forks??null,open_issues_count:old?.openIssues??null}};
    }
  }
  // Catalogue and project requests share one deadline, below the client's 45s
  // timeout. A slow catalogue must not block all project requests from starting.
  const catalogueRequest = (async () => {
    try {
      const source = await upstream('openai/math');
      const contents = await raw('openai/math', source.commit, 'CONTENTS.md', 3 * 1024 * 1024);
      return {source, contents};
    } catch {
      warnings.push('The OpenAI catalogue could not be refreshed. Published baseline summaries are from the saved snapshot.');
      return {};
    }
  })();

  const projects = await Promise.all(PROJECTS.map(async p => {
    const old = previous.projects.find(x => x.id === p.id);
    const saved = () => {const value={...old,stale:true,claimFresh:false,activityFresh:false};return {...value,status:claimLabel(value)};};
    let pin;
    try {
      pin = await upstream(p.repo);
    } catch {
      warnings.push(`${p.repo}: upstream identity or head could not be confirmed; showing a saved record.`);
      return saved();
    }
    const assessmentPaths = p.parser === 'selection' ? [] : SOURCE_ASSESSMENTS[p.id].sources.map(s=>s.path);
    const [readmeResult, selectionResult, ...evidenceResults] = await Promise.allSettled([
      raw(p.repo, pin.commit, 'README.md'),
      p.parser === 'selection' ? raw(p.repo, pin.commit, SELECTION_PATH, 64000).catch(error => {
        if (error.status === 404) return null;
        throw error;
      }) : Promise.resolve(null),
      ...assessmentPaths.map(path => raw(p.repo,pin.commit,path))
    ]);
    const readmeMissing = readmeResult.status === 'rejected' && readmeResult.reason.status === 404;
    if (p.parser !== 'selection' && readmeResult.status === 'rejected' && !readmeMissing) {
      warnings.push(`${p.repo}: showing the last saved source record.`);
      return saved();
    }
    const readme = readmeResult.status === 'fulfilled' ? readmeResult.value : '';
    let selection = null, context = {...pin,artifactTexts:Object.fromEntries(assessmentPaths.flatMap((path,i)=>evidenceResults[i].status==='fulfilled'?[[path,evidenceResults[i].value]]:[]))};
    if (p.parser === 'selection') {
      if (selectionResult.status === 'rejected') {
        warnings.push(`${p.repo}: current selection could not be checked; the saved review is not current.`);
        return saved();
      }
      try {
        selection = selectionResult.value === null ? null : JSON.parse(selectionResult.value);
        context.selectionText = selectionResult.value;
        // Do not let an uninspected selection direct receipt/PR requests. The
        // record must match a local review entry before any claimed PR is read.
        if (typeof selectionResult.value === 'string' && inspectedSelection(selection, hash(selectionResult.value))) {
          const known = receiptForSelection(selection, hash(selectionResult.value));
          const paths = Object.keys(known.artifacts ?? {});
          const receipts = await Promise.allSettled([
            raw(p.repo, pin.commit, selection.review),
            raw(p.repo, pin.commit, selection.validation),
            api(`/repos/${p.repo}/pulls/${known.sourcePR}`),
            ...paths.map(path => raw(p.repo, pin.commit, path))
          ]);
          if (receipts[0].status === 'fulfilled') context.reviewText = receipts[0].value;
          if (receipts[1].status === 'fulfilled') context.validationText = receipts[1].value;
          if (receipts[2].status === 'fulfilled') context.pr = receipts[2].value;
          context.artifactTexts = Object.fromEntries(paths.flatMap((path, i) => receipts[i+3].status === 'fulfilled' ? [[path, receipts[i+3].value]] : []));
          context.artifactTexts[SELECTION_PATH] = context.selectionText;
          if(context.reviewText)context.artifactTexts[selection.review]=context.reviewText;
          if(context.validationText)context.artifactTexts[selection.validation]=context.validationText;
        }
      } catch {
        // Malformed/deleted/withdrawn records clear the headline. Never resurrect
        // an older selection just because the README or another request failed.
        selection = null;
      }
    }
    const result = seededProject(p, readme, pin.metadata, at, selection, context);
    const assessment = makeAssessment(result,pin.commit,result.sourceHash,Object.fromEntries(Object.entries(context.artifactTexts).map(([path,text])=>[path,hash(text)])));
    if(assessment)result.assessment=assessment;
    // A changed/deleted main statement can withdraw or qualify a construction,
    // even if its selection JSON and finite certificates have not changed yet.
    const inspectedReadme=p.id!=='crocswap' || [SOURCE_ASSESSMENTS.crocswap.readmeHash,
      ...SOURCE_ASSESSMENTS.crocswap.previousReadmeHashes].includes(result.sourceHash);
    if(!inspectedReadme || (assessment && assessment.state !== 'matched') ||
       (result.claim?.review && !hasReviewReceipt(result)))result.claim=null;
    result.activityFresh = pin.activityFresh;
    result.stale = readmeResult.status === 'rejected' && !readmeMissing;
    result.claimFresh = !result.stale;
    if (!result.claim) {
      result.status = claimLabel(result);
      warnings.push(`${p.repo}: no supported inspected statement or complete review receipt. The headline is withheld pending source inspection.`);
    } else result.status = claimLabel(result);
    // A README failure does not override a known withdrawal; a saved README is
    // never substituted into the fresh immutable provenance.
    if (result.stale) warnings.push(`${p.repo}: README unavailable; inspect the pinned claim evidence.`);
    if (result.claim?.review?.currentPR === 'changed') warnings.push(`${p.repo}: the current PR head or bound differs from the reviewed receipt. Review applies only to its recorded head.`);
    return result;
  }));
  const {source, contents} = await catalogueRequest;
  if (!contents && projects.every(p => p.stale)) return markSaved(previous, warnings);
  const catalogue = contents ? {
    families: Number(contents.match(/covering (\d+) result families/)?.[1] ?? previous.catalogue.families),
    manuscripts: Number(contents.match(/\*\*(\d+) manuscripts/)?.[1] ?? previous.catalogue.manuscripts),
    source: `https://github.com/openai/math/blob/${source.commit}/CONTENTS.md`, checkedAt: at, sha256: hash(contents)
  } : previous.catalogue;
  const problems = contents ? makeProblems(contents, previous.problems, source.commit) : previous.problems.map(p=>({
    ...p,baselineFresh:false,metric:{...p.metric,value:null,display:'Source unconfirmed'}
  }));
  if (contents && problems.some(p => !p.baselineFresh)) warnings.push('Some upstream result descriptions have changed since editorial review. Their numeric baselines are withheld until reviewed.');
  const result = {schemaVersion: 2, fetchedAt: at, live: true, problems, projects,
    discoveries: previous.discoveries,
    catalogue, warnings: discoveryWarnings(warnings)};
  if (!validateFrontier(result)) throw Error('Unsupported research response.');
  return result;
}

export function markSaved(data, warnings = []) {
  return {...asSavedFrontier(data),
    problems: data.problems.map(problem => ({...problem, baselineFresh:false,
      metric:{...problem.metric, value:null, display:'Source unconfirmed'}})),
    warnings: discoveryWarnings([...warnings, 'Public research refresh failed. Showing saved evidence at its original dates.'])};
}

export function createFrontierService({snapshot, collect = collectFrontier, read = async () => null, write = async () => {}, now = Date.now} = {}) {
  if (!validateFrontier(snapshot)) throw Error('Unsupported bundled research snapshot.');
  // Only a local owner edit of the bundle can change discovery. Neither a newer
  // runtime cache nor an automatic collector may replace this list.
  const ownerDiscoveries = structuredClone(snapshot.discoveries);
  const ownerManaged = data => ({...data, discoveries: structuredClone(ownerDiscoveries), warnings: discoveryWarnings(data.warnings)});
  let memory = ownerManaged(snapshot), pending, nextRefresh = 0, loading;
  return async function get() {
    loading ??= (async () => {
      try {
        const saved = await read(),checked=Date.parse(saved?.fetchedAt);
        if (validateFrontier(saved) && checked<=now() && checked>=Date.parse(memory.fetchedAt)) {
          memory=expireFrontier(ownerManaged(saved),now());
          if(saved.live && now()<checked+REFRESH_INTERVAL_MS)nextRefresh=checked+REFRESH_INTERVAL_MS;
        }
      } catch { /* Bundled fallback. */ }
    })();
    await loading;
    if (now() < nextRefresh) return memory=expireFrontier(memory,now());
    pending ??= (async () => {
      try {
        const data = await collect(memory);
        if (!validateFrontier(data)) throw Error('Unsupported research update.');
        memory = ownerManaged(data);
        nextRefresh = now() + REFRESH_INTERVAL_MS;
        if (data.live) { try { await write(memory); } catch { /* Keep successful in-memory data. */ } }
      } catch {
        memory = markSaved(memory);
        nextRefresh = now() + REFRESH_INTERVAL_MS;
      }
      return memory;
    })().finally(() => { pending = null; });
    return pending;
  };
}

const headers = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'"};
export async function frontierResponse(method, path, get) {
  if (path !== '/' && path !== '') return Response.json({error: 'Not found'}, {status: 404, headers});
  if (method !== 'GET') return Response.json({error: 'Method not allowed'}, {status: 405, headers: {...headers, Allow: 'GET'}});
  try { return Response.json(await get(), {headers}); }
  catch { return Response.json({error: 'The public research update is unavailable.'}, {status: 503, headers}); }
}

let service, snapshotText;
export async function getFrontier() {
  // Atomic local owner updates take effect without running a discovery scan or
  // needing a server restart. Read the bundle, but parse it only when changed.
  const text = await fs.readFile(SNAPSHOT, 'utf8');
  if (text !== snapshotText) {
    service = createFrontierService({snapshot: JSON.parse(text),
    read: async () => JSON.parse(await fs.readFile(CACHE, 'utf8')),
    write: async data => {
      await fs.mkdir(new URL('../.cache/', import.meta.url), {recursive: true});
      const temporary = new URL(`../.cache/frontier-${randomUUID()}.tmp`, import.meta.url);
      await fs.writeFile(temporary, JSON.stringify(data), {mode: 0o600});
      await fs.rename(temporary, CACHE);
    }});
    snapshotText = text;
  }
  return service();
}
